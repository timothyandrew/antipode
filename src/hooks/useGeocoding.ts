import { useState, useCallback, useRef } from 'react';

export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface UseGeocodingReturn {
  results: GeocodingResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

export function useGeocoding(): UseGeocodingReturn {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRequestRef = useRef<number>(0);

  const search = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const timeSinceLastRequest = Date.now() - lastRequestRef.current;
      const minInterval = 1000;

      if (timeSinceLastRequest < minInterval) {
        await new Promise(resolve =>
          setTimeout(resolve, minInterval - timeSinceLastRequest)
        );
      }

      setLoading(true);
      setError(null);
      lastRequestRef.current = Date.now();

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
          {
            headers: {
              'User-Agent': 'AntipodeGlobe/1.0',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data: GeocodingResult[] = await response.json();
        setResults(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clearResults };
}
