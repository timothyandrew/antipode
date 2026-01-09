export interface Coordinates {
  lat: number;
  lng: number;
}

export function calculateAntipode(lat: number, lng: number): Coordinates {
  const antipodeLat = -lat;
  let antipodeLng = lng + 180;
  if (antipodeLng > 180) {
    antipodeLng -= 360;
  }
  return { lat: antipodeLat, lng: antipodeLng };
}

export function formatCoordinate(value: number, isLatitude: boolean): string {
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesDecimal = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = ((minutesDecimal - minutes) * 60).toFixed(1);

  const direction = isLatitude
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

export function formatCoordinates(coords: Coordinates): string {
  return `${formatCoordinate(coords.lat, true)}, ${formatCoordinate(coords.lng, false)}`;
}
