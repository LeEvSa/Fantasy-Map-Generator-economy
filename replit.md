# Azgaar's Fantasy Map Generator

## Overview
This is a static web application for generating interactive fantasy maps. It's a pure frontend application built with vanilla JavaScript, HTML, and CSS, with no build step required.

## Project Structure
- `index.html` - Main entry point
- `server.js` - Simple Node.js static file server for serving the app
- `modules/` - JavaScript modules for map generation and UI
- `modules/economy/` - Turn-based economy system (Civ-style resources)
- `libs/` - Third-party libraries (D3.js, Three.js, TinyMCE, etc.)
- `charges/` - SVG files for heraldic charges
- `heightmaps/` - Pre-created heightmap images
- `images/` - Static assets (icons, textures, patterns)
- `components/` - Custom web components
- `config/` - Configuration files

## Running the Application
The app is served via a simple Node.js HTTP server on port 5000:
```
node server.js
```

## Economy System (New Feature)
A Civilization VI-style turn-based resource system has been added:

### Features
- **Resources**: Strategic (iron, coal, oil, horses), Luxury (gold, gems, silk, spices), and Bonus (wheat, fish, wood) resources
- **Terrain-based spawning**: Resources spawn based on biome/terrain rules
- **Turn processing**: Click "Next Turn" to process resource income and yields
- **State economies**: Each state tracks stockpiles, amenities, and yields
- **Technology**: Unlock techs to reveal hidden resources (iron, coal, oil)
- **Improvements**: Build mines, farms, plantations to activate resources

### Accessing Economy Panel
Click the "Economy" button in Tools > Edit section, or use Shift+E hotkey.

### Economy Files
- `modules/economy/config.js` - Resource definitions, improvements, tech tree
- `modules/economy/economy-core.js` - Core economy logic and turn processing
- `modules/economy/economy-ui.js` - Economy panel UI
- `modules/economy/economy-renderer.js` - Resource icon rendering on map

## Technologies Used
- Vanilla JavaScript (ES6+ modules)
- D3.js for data visualization
- Three.js for 3D rendering
- TinyMCE for rich text editing
- jQuery/jQuery UI for some UI components

## Notes
- This is a client-side only application
- No database or backend API required
- Maps are generated and processed entirely in the browser
