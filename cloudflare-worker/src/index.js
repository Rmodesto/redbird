/**
 * MTA GTFS-RT Proxy Worker
 * Decodes protobuf and returns JSON - no external dependencies
 */

// MTA Feed URLs
const MTA_FEEDS = {
  '1234567S': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
  'ACE': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
  'BDFM': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
  'G': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
  'JZ': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
  'NQRW': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
  'L': 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
};

// ============= MINIMAL PROTOBUF DECODER =============
// Decodes GTFS-RT protobuf without any dependencies

class ProtobufReader {
  constructor(buffer) {
    this.buffer = new Uint8Array(buffer);
    this.pos = 0;
  }

  // Read a varint (variable-length integer)
  readVarint() {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      if (this.pos >= this.buffer.length) return 0;
      byte = this.buffer[this.pos++];
      result |= (byte & 0x7F) << shift;
      shift += 7;
    } while (byte >= 0x80);
    return result >>> 0; // Convert to unsigned
  }

  // Read a 64-bit varint (for timestamps)
  readVarint64() {
    // For simplicity, read as two 32-bit parts
    let lo = 0, hi = 0;
    let shift = 0;
    let byte;

    // Read low 32 bits
    for (let i = 0; i < 4; i++) {
      if (this.pos >= this.buffer.length) break;
      byte = this.buffer[this.pos++];
      lo |= (byte & 0x7F) << shift;
      shift += 7;
      if (byte < 0x80) return lo;
    }

    // Handle 5th byte (spans lo/hi boundary)
    if (this.pos < this.buffer.length) {
      byte = this.buffer[this.pos++];
      lo |= (byte & 0x7F) << 28;
      hi = (byte & 0x7F) >> 4;
      if (byte < 0x80) return lo + hi * 0x100000000;
    }

    // Continue reading high bits
    shift = 3;
    for (let i = 0; i < 5; i++) {
      if (this.pos >= this.buffer.length) break;
      byte = this.buffer[this.pos++];
      hi |= (byte & 0x7F) << shift;
      shift += 7;
      if (byte < 0x80) break;
    }

    return lo + hi * 0x100000000;
  }

  // Read a length-delimited field (string or nested message)
  readBytes() {
    const length = this.readVarint();
    const bytes = this.buffer.slice(this.pos, this.pos + length);
    this.pos += length;
    return bytes;
  }

  // Read a string
  readString() {
    const bytes = this.readBytes();
    return new TextDecoder().decode(bytes);
  }

  // Skip a field based on wire type
  skipField(wireType, fieldNumber) {
    switch (wireType) {
      case 0: this.readVarint(); break; // Varint
      case 1: this.pos += 8; break; // 64-bit
      case 2: this.pos += this.readVarint(); break; // Length-delimited
      case 3: this.skipGroup(fieldNumber); break; // Start group (deprecated)
      case 4: break; // End group (deprecated) - should not happen here
      case 5: this.pos += 4; break; // 32-bit
      default:
        // Unknown wire type - try to continue
        console.warn(`Unknown wire type: ${wireType} at position ${this.pos}`);
        break;
    }
  }

  // Skip a deprecated group
  skipGroup(startFieldNumber) {
    while (this.hasMore()) {
      const tag = this.readVarint();
      const fieldNumber = tag >>> 3;
      const wireType = tag & 0x7;

      if (wireType === 4 && fieldNumber === startFieldNumber) {
        // End of group
        return;
      }

      this.skipField(wireType, fieldNumber);
    }
  }

  hasMore() {
    return this.pos < this.buffer.length;
  }
}

// Parse StopTimeEvent (arrival/departure)
function parseStopTimeEvent(bytes) {
  const reader = new ProtobufReader(bytes);
  const event = {};

  while (reader.hasMore()) {
    const tag = reader.readVarint();
    const fieldNumber = tag >>> 3;
    const wireType = tag & 0x7;

    switch (fieldNumber) {
      case 1: // delay
        event.delay = reader.readVarint();
        break;
      case 2: // time (int64)
        event.time = reader.readVarint64();
        break;
      case 3: // uncertainty
        event.uncertainty = reader.readVarint();
        break;
      default:
        reader.skipField(wireType, fieldNumber);
    }
  }

  return event;
}

// Parse StopTimeUpdate
function parseStopTimeUpdate(bytes) {
  const reader = new ProtobufReader(bytes);
  const update = {};

  while (reader.hasMore()) {
    const tag = reader.readVarint();
    const fieldNumber = tag >>> 3;
    const wireType = tag & 0x7;

    switch (fieldNumber) {
      case 1: // stop_sequence
        update.stopSequence = reader.readVarint();
        break;
      case 2: // arrival
        update.arrival = parseStopTimeEvent(reader.readBytes());
        break;
      case 3: // departure
        update.departure = parseStopTimeEvent(reader.readBytes());
        break;
      case 4: // stop_id
        update.stopId = reader.readString();
        break;
      default:
        reader.skipField(wireType, fieldNumber);
    }
  }

  return update;
}

// Parse TripDescriptor
function parseTripDescriptor(bytes) {
  const reader = new ProtobufReader(bytes);
  const trip = {};

  while (reader.hasMore()) {
    const tag = reader.readVarint();
    const fieldNumber = tag >>> 3;
    const wireType = tag & 0x7;

    switch (fieldNumber) {
      case 1: // trip_id
        trip.tripId = reader.readString();
        break;
      case 2: // route_id - actually this is start_time in GTFS-RT
        trip.startTime = reader.readString();
        break;
      case 3: // start_date
        trip.startDate = reader.readString();
        break;
      case 5: // route_id
        trip.routeId = reader.readString();
        break;
      default:
        reader.skipField(wireType, fieldNumber);
    }
  }

  return trip;
}

// Parse TripUpdate
function parseTripUpdate(bytes) {
  const reader = new ProtobufReader(bytes);
  const tripUpdate = {
    stopTimeUpdate: []
  };

  while (reader.hasMore()) {
    const tag = reader.readVarint();
    const fieldNumber = tag >>> 3;
    const wireType = tag & 0x7;

    switch (fieldNumber) {
      case 1: // trip
        tripUpdate.trip = parseTripDescriptor(reader.readBytes());
        break;
      case 2: // stop_time_update (repeated)
        tripUpdate.stopTimeUpdate.push(parseStopTimeUpdate(reader.readBytes()));
        break;
      case 4: // timestamp
        tripUpdate.timestamp = reader.readVarint64();
        break;
      default:
        reader.skipField(wireType, fieldNumber);
    }
  }

  return tripUpdate;
}

// Parse FeedEntity
function parseFeedEntity(bytes) {
  const reader = new ProtobufReader(bytes);
  const entity = {};

  while (reader.hasMore()) {
    const tag = reader.readVarint();
    const fieldNumber = tag >>> 3;
    const wireType = tag & 0x7;

    switch (fieldNumber) {
      case 1: // id
        entity.id = reader.readString();
        break;
      case 3: // trip_update
        entity.tripUpdate = parseTripUpdate(reader.readBytes());
        break;
      case 4: // vehicle
        reader.skipField(wireType, fieldNumber); // Skip vehicle position for now
        break;
      case 5: // alert
        reader.skipField(wireType, fieldNumber); // Skip alerts for now
        break;
      default:
        reader.skipField(wireType, fieldNumber);
    }
  }

  return entity;
}

// Parse FeedMessage (top level)
function parseFeedMessage(buffer) {
  const reader = new ProtobufReader(buffer);
  const feed = {
    entity: []
  };

  while (reader.hasMore()) {
    const tag = reader.readVarint();
    const fieldNumber = tag >>> 3;
    const wireType = tag & 0x7;

    switch (fieldNumber) {
      case 1: // header
        reader.readBytes(); // Skip header for now
        break;
      case 2: // entity (repeated)
        const entityBytes = reader.readBytes();
        const entity = parseFeedEntity(entityBytes);
        if (entity.tripUpdate) {
          feed.entity.push(entity);
        }
        break;
      default:
        reader.skipField(wireType, fieldNumber);
    }
  }

  return feed;
}

// ============= WORKER HANDLER =============

async function fetchAndDecode(feedUrl) {
  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'SubwaySounds-Worker/1.0',
      'Accept': 'application/x-protobuf, application/octet-stream, */*',
    },
  });

  if (!response.ok) {
    throw new Error(`Feed fetch failed: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  return parseFeedMessage(buffer);
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',');

  // Allow the origin if it's in the list, or allow all in dev
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
  };
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Health check
      if (path === '/' || path === '/health') {
        return new Response(JSON.stringify({ status: 'ok', feeds: Object.keys(MTA_FEEDS) }), {
          headers: corsHeaders(request, env),
        });
      }

      // Get arrivals for specific stop IDs
      // Example: /arrivals?stops=127N,127S,725N,725S&feeds=1234567S,NQRW
      if (path === '/arrivals') {
        const stopIds = (url.searchParams.get('stops') || '').split(',').filter(Boolean);
        const feedNames = (url.searchParams.get('feeds') || '1234567S').split(',').filter(Boolean);

        if (stopIds.length === 0) {
          return new Response(JSON.stringify({ error: 'Missing stops parameter' }), {
            status: 400,
            headers: corsHeaders(request, env),
          });
        }

        const arrivals = [];
        const now = Math.floor(Date.now() / 1000);

        // Fetch all requested feeds in parallel
        const feedPromises = feedNames.map(async (feedName) => {
          const feedUrl = MTA_FEEDS[feedName];
          if (!feedUrl) return [];

          try {
            const feed = await fetchAndDecode(feedUrl);
            const results = [];

            for (const entity of feed.entity) {
              if (!entity.tripUpdate?.stopTimeUpdate) continue;

              const routeId = entity.tripUpdate.trip?.routeId || '';
              const tripId = entity.tripUpdate.trip?.tripId || '';

              for (const stu of entity.tripUpdate.stopTimeUpdate) {
                if (!stopIds.includes(stu.stopId)) continue;

                const arrivalTime = stu.arrival?.time || stu.departure?.time;
                if (!arrivalTime) continue;

                const minutesUntil = Math.floor((arrivalTime - now) / 60);

                // Only include trains arriving in next 60 minutes
                if (minutesUntil >= -2 && minutesUntil <= 60) {
                  results.push({
                    routeId,
                    tripId,
                    stopId: stu.stopId,
                    arrivalTime,
                    minutesUntil: Math.max(0, minutesUntil),
                  });
                }
              }
            }

            return results;
          } catch (err) {
            console.error(`Error fetching ${feedName}:`, err);
            return [];
          }
        });

        const allResults = await Promise.all(feedPromises);
        const flatResults = allResults.flat();

        // Sort by arrival time
        flatResults.sort((a, b) => a.arrivalTime - b.arrivalTime);

        return new Response(JSON.stringify({
          arrivals: flatResults,
          timestamp: now,
          stopsRequested: stopIds,
          feedsQueried: feedNames,
        }), {
          headers: corsHeaders(request, env),
        });
      }

      // Get raw feed data (for debugging)
      if (path.startsWith('/feed/')) {
        const feedName = path.replace('/feed/', '');
        const feedUrl = MTA_FEEDS[feedName];

        if (!feedUrl) {
          return new Response(JSON.stringify({ error: 'Unknown feed', available: Object.keys(MTA_FEEDS) }), {
            status: 404,
            headers: corsHeaders(request, env),
          });
        }

        const feed = await fetchAndDecode(feedUrl);

        return new Response(JSON.stringify({
          feed: feedName,
          entityCount: feed.entity.length,
          entities: feed.entity.slice(0, 20), // First 20 for debugging
        }), {
          headers: corsHeaders(request, env),
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: corsHeaders(request, env),
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders(request, env),
      });
    }
  },
};
