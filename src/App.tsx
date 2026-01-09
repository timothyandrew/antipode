import { useState, useCallback } from 'react';
import { Globe } from './components/Globe';
import { SearchBar } from './components/SearchBar';
import { CoordinatesPanel } from './components/CoordinatesPanel';
import { Coordinates } from './utils/antipode';

function App() {
  const [selectedPoint, setSelectedPoint] = useState<Coordinates | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);

  const handlePointSelect = useCallback((coords: Coordinates) => {
    setSelectedPoint(coords);
    setLocationName(null);
  }, []);

  const handleLocationSelect = useCallback((coords: Coordinates, name: string) => {
    setSelectedPoint(coords);
    setLocationName(name);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>Antipode Globe</h1>
        <SearchBar onLocationSelect={handleLocationSelect} />
      </header>
      <main className="main">
        <Globe selectedPoint={selectedPoint} onPointSelect={handlePointSelect} />
        <CoordinatesPanel selectedPoint={selectedPoint} locationName={locationName} />
      </main>
    </div>
  );
}

export default App;
