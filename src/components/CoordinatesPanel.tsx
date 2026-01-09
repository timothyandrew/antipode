import { Coordinates, calculateAntipode, formatCoordinates } from '../utils/antipode';

interface CoordinatesPanelProps {
  selectedPoint: Coordinates | null;
  locationName: string | null;
}

export function CoordinatesPanel({ selectedPoint, locationName }: CoordinatesPanelProps) {
  if (!selectedPoint) {
    return (
      <div className="coordinates-panel">
        <p className="instructions">
          Click anywhere on the globe or search for a location to see its antipode.
        </p>
      </div>
    );
  }

  const antipode = calculateAntipode(selectedPoint.lat, selectedPoint.lng);

  return (
    <div className="coordinates-panel">
      <div className="coordinate-group">
        <h3 className="coordinate-title selected">Selected Point</h3>
        {locationName && <p className="location-name">{locationName}</p>}
        <p className="coordinate-value">{formatCoordinates(selectedPoint)}</p>
        <p className="coordinate-decimal">
          {selectedPoint.lat.toFixed(4)}, {selectedPoint.lng.toFixed(4)}
        </p>
      </div>

      <div className="coordinate-group">
        <h3 className="coordinate-title antipode">Antipode</h3>
        <p className="coordinate-value">{formatCoordinates(antipode)}</p>
        <p className="coordinate-decimal">
          {antipode.lat.toFixed(4)}, {antipode.lng.toFixed(4)}
        </p>
      </div>
    </div>
  );
}
