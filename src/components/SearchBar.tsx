import { useState, useRef, useEffect } from 'react';
import { useGeocoding, GeocodingResult } from '../hooks/useGeocoding';
import { Coordinates } from '../utils/antipode';

interface SearchBarProps {
  onLocationSelect: (coords: Coordinates, name: string) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading, search, clearResults } = useGeocoding();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: GeocodingResult) => {
    onLocationSelect(
      { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
      result.display_name
    );
    setQuery('');
    setIsOpen(false);
    clearResults();
  };

  return (
    <div className="search-bar" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search for a location..."
        className="search-input"
      />
      {loading && <span className="search-loading">Searching...</span>}
      {isOpen && results.length > 0 && (
        <ul className="search-results">
          {results.map((result) => (
            <li
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="search-result-item"
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
