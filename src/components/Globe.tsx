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
      .arcColor(() => ['#3b82f6', '#ef4444'])
      .arcAltitude(0.5)
      .arcStroke(1)
      .arcDashLength(1)
      .arcDashGap(0)
      .arcDashAnimateTime(0)
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

      const arcs = [{
        startLat: selectedPoint.lat,
        startLng: selectedPoint.lng,
        endLat: antipode.lat,
        endLng: antipode.lng,
      }];

      globeRef.current.pointsData(points).arcsData(arcs);
    } else {
      globeRef.current.pointsData([]).arcsData([]);
    }
  }, [selectedPoint]);

  return <div ref={containerRef} className="globe-container" />;
}
