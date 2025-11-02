import maplibregl from 'maplibre-gl';

export interface StationInfo {
  id: string;
  name: string;
  lines: string[];
  coordinates: [number, number];
}

export interface ArrivalInfo {
  line: string;
  direction: string;
  minutesAway: number;
  lastUpdate: Date;
}

export class StationTooltipManager {
  private map: maplibregl.Map;
  private currentPopup: maplibregl.Popup | null = null;
  private hoveredStationId: string | null = null;

  constructor(map: maplibregl.Map) {
    this.map = map;
  }

  /**
   * Create and show a tooltip for a station
   */
  async showTooltip(station: StationInfo, arrivals?: ArrivalInfo[]) {
    // Close existing popup if any
    this.hideTooltip();

    // Create tooltip content
    const content = this.createTooltipContent(station, arrivals);

    // Create and show popup
    this.currentPopup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'station-tooltip',
      offset: 25,
      maxWidth: '300px'
    })
      .setLngLat(station.coordinates)
      .setHTML(content)
      .addTo(this.map);

    this.hoveredStationId = station.id;
  }

  /**
   * Hide the current tooltip
   */
  hideTooltip() {
    if (this.currentPopup) {
      this.currentPopup.remove();
      this.currentPopup = null;
    }
    this.hoveredStationId = null;
  }

  /**
   * Create HTML content for the tooltip
   */
  private createTooltipContent(station: StationInfo, arrivals?: ArrivalInfo[]): string {
    let html = `
      <div class="station-tooltip-content">
        <div class="station-header">
          <h3 class="station-name">${station.name}</h3>
          <div class="station-lines">
            ${station.lines.map(line => `
              <span class="line-badge line-${line.toLowerCase()}">${line}</span>
            `).join('')}
          </div>
        </div>
    `;

    if (arrivals && arrivals.length > 0) {
      html += `
        <div class="arrivals-section">
          <h4 class="arrivals-title">Live Arrivals</h4>
          <div class="arrivals-list">
            ${arrivals.slice(0, 5).map(arrival => `
              <div class="arrival-item">
                <span class="arrival-line line-${arrival.line.toLowerCase()}">${arrival.line}</span>
                <span class="arrival-direction">${arrival.direction}</span>
                <span class="arrival-time">${this.formatTime(arrival.minutesAway)}</span>
              </div>
            `).join('')}
          </div>
          <div class="last-update">Updated ${this.formatLastUpdate(arrivals[0]?.lastUpdate)}</div>
        </div>
      `;
    } else {
      html += `
        <div class="arrivals-loading">
          <div class="loading-spinner"></div>
          <span>Loading arrivals...</span>
        </div>
      `;
    }

    html += '</div>';

    // Add custom CSS for the tooltip
    this.injectTooltipStyles();

    return html;
  }

  /**
   * Format time for display
   */
  private formatTime(minutesAway: number): string {
    if (minutesAway === 0) return 'Now';
    if (minutesAway === 1) return '1 min';
    return `${minutesAway} mins`;
  }

  /**
   * Format last update time
   */
  private formatLastUpdate(date?: Date): string {
    if (!date) return 'just now';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 30) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  }

  /**
   * Inject tooltip styles into the page
   */
  private injectTooltipStyles() {
    if (document.getElementById('station-tooltip-styles')) return;

    const style = document.createElement('style');
    style.id = 'station-tooltip-styles';
    style.innerHTML = `
      .station-tooltip .maplibregl-popup-content {
        padding: 0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .station-tooltip-content {
        padding: 12px;
      }

      .station-header {
        border-bottom: 1px solid #e5e5e5;
        padding-bottom: 8px;
        margin-bottom: 8px;
      }

      .station-name {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: #1a1a1a;
      }

      .station-lines {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      .line-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        color: white;
        font-weight: bold;
        font-size: 12px;
      }

      .line-1, .line-2, .line-3 { background-color: #EE352E; }
      .line-4, .line-5, .line-6 { background-color: #00933C; }
      .line-7 { background-color: #B933AD; }
      .line-a, .line-c, .line-e { background-color: #0039A6; }
      .line-b, .line-d, .line-f, .line-m { background-color: #FF6319; }
      .line-g { background-color: #6CBE45; }
      .line-j, .line-z { background-color: #996633; }
      .line-l { background-color: #A7A9AC; }
      .line-n, .line-q, .line-r, .line-w { background-color: #FCCC0A; color: #1a1a1a; }
      .line-s { background-color: #808183; }

      .arrivals-section {
        margin-top: 8px;
      }

      .arrivals-title {
        font-size: 12px;
        font-weight: 600;
        color: #666;
        margin: 0 0 6px 0;
        text-transform: uppercase;
      }

      .arrivals-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .arrival-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }

      .arrival-line {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        color: white;
        font-weight: bold;
        font-size: 10px;
        flex-shrink: 0;
      }

      .arrival-direction {
        flex: 1;
        font-size: 13px;
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .arrival-time {
        font-size: 13px;
        font-weight: 600;
        color: #000;
        flex-shrink: 0;
      }

      .last-update {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #e5e5e5;
        font-size: 11px;
        color: #999;
        text-align: center;
      }

      .arrivals-loading {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 0;
        justify-content: center;
      }

      .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #e5e5e5;
        border-top-color: #333;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Check if a station is currently being hovered
   */
  isHovered(stationId: string): boolean {
    return this.hoveredStationId === stationId;
  }

  /**
   * Get the currently hovered station ID
   */
  getHoveredStationId(): string | null {
    return this.hoveredStationId;
  }
}