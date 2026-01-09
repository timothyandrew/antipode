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
  color: string;
}

function calculateGreatCirclePath(
  start: Coordinates,
  end: Coordinates,
  numPoints: number = 100
): [number, number][] {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRad(start.lat);
  const lng1 = toRad(start.lng);
  const lat2 = toRad(end.lat);
  const lng2 = toRad(end.lng);

  const points: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;

    const d = Math.acos(
      Math.sin(lat1) * Math.sin(lat2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
    );

    if (d === 0) {
      points.push([start.lat, start.lng]);
      continue;
    }

    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lng = toDeg(Math.atan2(y, x));

    points.push([lat, lng]);
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
      .pathColor((d: object) => (d as PathData).color)
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
          color: '#3b82f6',
          label: 'Selected Point',
        },
        {
          lat: antipode.lat,
          lng: antipode.lng,
          color: '#ef4444',
          label: 'Antipode',
        },
      ];

      const pathCoords = calculateGreatCirclePath(selectedPoint, antipode);
      const paths: PathData[] = [{
        coords: pathCoords,
        color: '#ffffff',
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
