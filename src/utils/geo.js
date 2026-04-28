export function getDistanceInKm(first, second) {
  if (
    !Number.isFinite(first?.lat) ||
    !Number.isFinite(first?.lng) ||
    !Number.isFinite(second?.lat) ||
    !Number.isFinite(second?.lng)
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadiusKm = 6371;
  const latDelta = toRadians(second.lat - first.lat);
  const lngDelta = toRadians(second.lng - first.lng);
  const startLat = toRadians(first.lat);
  const endLat = toRadians(second.lat);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(startLat) *
      Math.cos(endLat) *
      Math.sin(lngDelta / 2) *
      Math.sin(lngDelta / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}
