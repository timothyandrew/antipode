import { useEffect, useRef } from 'react';
import GlobeGL, { GlobeInstance } from 'globe.gl';
import { Coordinates, calculateAntipode } from '../utils/antipode';

interface GlobeProps {
  selectedPoint: Coordinates | null;
  onPointSelect: (coords: Coordinates) => void;
}

interface PointData {
  lat: number;
  lng: number;
  color: string;
  label: string;
}

interface PathData {
  coords: [number, number][];
  colors: string[];
}

function calculateAntipodePath(
  start: Coordinates,
  numPoints: number = 100
): [number, number][] {
  const points: [number, number][] = [];

  // For antipodal points, we go along the meridian (constant longitude)
  // from start, through a pole, to the antipode
  // This gives us exactly ONE deterministic path

  const goNorth = start.lat >= 0;
  const poleLat = goNorth ? 90 : -90;

  // First half: start to pole (along start's longitude)
  const halfPoints = Math.floor(numPoints / 2);
  for (let i = 0; i <= halfPoints; i++) {
    const f = i / halfPoints;
    const lat = start.lat + f * (poleLat - start.lat);
    points.push([lat, start.lng]);
  }

  // Second half: pole to antipode (along antipode's longitude, which is start.lng + 180)
  let antipodeLng = start.lng + 180;
  if (antipodeLng > 180) antipodeLng -= 360;

  const antipodeLat = -start.lat;

  for (let i = 1; i <= halfPoints; i++) {
    const f = i / halfPoints;
    const lat = poleLat + f * (antipodeLat - poleLat);
    points.push([lat, antipodeLng]);
  }

  return points;
}

export function Globe({ selectedPoint, onPointSelect }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const globe = new GlobeGL(containerRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .pointAltitude(0.01)
      .pointRadius(0.5)
      .pointColor((d: object) => (d as PointData).color)
      .pointLabel((d: object) => (d as PointData).label)
      .pathColor((d: object) => (d as PathData).colors)
      .pathStroke(2)
      .pathPointAlt(0.001)
      .onGlobeClick(({ lat, lng }: { lat: number; lng: number }) => {
        onPointSelect({ lat, lng });
      });

    globeRef.current = globe;

    const handleResize = () => {
      if (containerRef.current && globeRef.current) {
        globeRef.current
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeRef.current) {
        globeRef.current._destructor?.();
      }
    };
  }, [onPointSelect]);

  useEffect(() => {
    if (!globeRef.current) return;

    if (selectedPoint) {
      const antipode = calculateAntipode(selectedPoint.lat, selectedPoint.lng);

      const points: PointData[] = [
        {
          lat: selectedPoint.lat,
          lng: selectedPoint.lng,
          color: '#06b6d4',
          label: 'Selected Point',
        },
        {
          lat: antipode.lat,
          lng: antipode.lng,
          color: '#d946ef',
          label: 'Antipode',
        },
      ];

      const pathCoords = calculateAntipodePath(selectedPoint);

      // Generate gradient colors from cyan to magenta (modern look)
      const gradientColors = pathCoords.map((_, i) => {
        const t = i / (pathCoords.length - 1);
        // Interpolate from #06b6d4 (cyan) to #d946ef (fuchsia)
        const r = Math.round(6 + t * (217 - 6));
        const g = Math.round(182 + t * (70 - 182));
        const b = Math.round(212 + t * (239 - 212));
        return `rgb(${r}, ${g}, ${b})`;
      });

      const paths: PathData[] = [{
        coords: pathCoords,
        colors: gradientColors,
      }];

      globeRef.current
        .pointsData(points)
        .pathsData(paths)
        .pathPoints('coords')
        .pathPointLat((p: unknown) => (p as [number, number])[0])
        .pathPointLng((p: unknown) => (p as [number, number])[1]);
    } else {
      globeRef.current.pointsData([]).pathsData([]);
    }
  }, [selectedPoint]);

  return <div ref={containerRef} className="globe-container" />;
}
