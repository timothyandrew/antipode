# Antipode Globe

An interactive 3D globe that shows the antipode (the point on Earth directly opposite) for any location.

![Antipode Globe](https://img.shields.io/badge/demo-live-brightgreen)

## Features

- **Interactive 3D Globe**: Realistic Earth visualization with NASA Blue Marble texture
- **Click to Select**: Click anywhere on the globe to select a point
- **Location Search**: Search for any place using OpenStreetMap's Nominatim geocoding
- **Visual Path**: Cyan-to-fuchsia gradient line connecting the selected point to its antipode
- **Coordinates Display**: Shows both DMS and decimal coordinates for selected point and antipode
- **Fully Static**: No backend required, deployable to GitHub Pages

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **3D Globe**: [Globe.gl](https://globe.gl)
- **Geocoding**: [Nominatim](https://nominatim.openstreetmap.org) (OpenStreetMap)

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun dev

# Build for production
bun run build

# Preview production build
bun preview
```

## Deployment

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on push to `main`.

To enable:
1. Push the repo to GitHub
2. Go to Settings → Pages
3. Set Source to "GitHub Actions"

The site will be available at `https://<username>.github.io/antipode/`

## How It Works

An antipode is the point on Earth's surface diametrically opposite to another point. For any location at coordinates (lat, lng), the antipode is at (-lat, lng ± 180°).

The path between the two points follows the meridian through the nearest pole, providing a single deterministic great circle route.

## License

MIT
