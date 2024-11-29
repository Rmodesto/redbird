// app/api/transit/route.ts
import { NextResponse } from "next/server";
import GtfsRealtimeBindings from "gtfs-realtime-bindings";

// Define TypeScript interfaces for our data structures
interface StopTimeUpdate {
  stopId: string;
  arrival: number | null;
  departure: number | null;
}

interface TransitUpdate {
  tripId: string;
  routeId: string;
  startTime: string;
  startDate: string;
  stopTimeUpdates: StopTimeUpdate[];
}

export async function POST(req: Request) {
  console.log("1. Starting POST request handler");

  try {
    console.log("2. Initiating MTA API request");
    const response = await fetch(
      "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace"
    );

    if (!response.ok) {
      console.error(
        "3. MTA API request failed:",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: `MTA API request failed: ${response.status}` },
        { status: response.status }
      );
    }

    console.log("4. Decoding protobuf data");
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
      new Uint8Array(buffer)
    );

    console.log("5. Transforming feed data to JSON");
    const updates: TransitUpdate[] = feed.entity
      .filter(
        (
          entity
        ): entity is typeof entity & {
          tripUpdate: NonNullable<typeof entity.tripUpdate>;
        } => entity.tripUpdate !== null && entity.tripUpdate !== undefined
      )
      .map((entity) => ({
        tripId: entity.tripUpdate.trip?.tripId || "",
        routeId: entity.tripUpdate.trip?.routeId || "",
        startTime: entity.tripUpdate.trip?.startTime || "",
        startDate: entity.tripUpdate.trip?.startDate || "",
        stopTimeUpdates:
          entity.tripUpdate.stopTimeUpdate?.map((update) => ({
            stopId: update.stopId || "",
            arrival: update.arrival?.time?.low || null,
            departure: update.departure?.time?.low || null,
          })) || [],
      }));

    console.log(
      "6. Successfully processed updates:",
      updates.length,
      "entries found"
    );
    return NextResponse.json(updates);
  } catch (error) {
    console.error("Error in transit API:", error);
    return NextResponse.json(
      { error: "Failed to fetch transit data" },
      { status: 500 }
    );
  }
}
