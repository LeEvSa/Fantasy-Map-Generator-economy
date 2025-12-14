# Azgaar's Fantasy Map Generator

## Overview
This is a static web application for generating interactive fantasy maps. It's a pure frontend application built with vanilla JavaScript, HTML, and CSS, with no build step required.

## Project Structure
- `index.html` - Main entry point
- `server.js` - Simple Node.js static file server for serving the app
- `modules/` - JavaScript modules for map generation and UI
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

## Technologies Used
- Vanilla JavaScript (ES6+ modules)
- D3.js for data visualization
- Three.js for 3D rendering
- TinyMCE for rich text editing
- jQuery/jQuery UI for some UI components

## Economy System (Custom Extension)
A turn-based economy system with two new map layers:

### Resource Layer
- Shows natural resources distributed across the map
- Resources include: Grain, Timber, Iron, Gold, Fish, Stone, Salt, Gems, Horses, Furs, Spices, Wine
- Resources are assigned based on biome, terrain height, and geographic features
- Toggle via "Resources" button in the Layers panel

### Economy Layer  
- Visualizes wealth distribution and trade flows
- Shows cell wealth as color gradient (red = wealthier)
- Displays trade routes between burgs as connecting lines
- Trade flow indicators show active trade nodes
- Toggle via "Economy" button in the Layers panel

### Economy Editor
- Access via openEconomyEditor() function
- Advance turns to simulate economic changes
- View global statistics (total wealth, production, trade volume)
- See state-by-state economic breakdown with resource stockpiles
- Review resource distribution across the map
- "Global Overview" button opens detailed nation economy table

### Global Economy Overview
- Access via "Global Overview" button in Economy Editor or openEconomyOverview()
- Table showing all nations with: Name, Cities, Population, Resources, Money/Turn
- Sortable by population, shows treasury per nation
- Resource columns display top 8 resources across all nations

### Economy Layer Visualization
- Resource flows: Lines from resource tiles to nearest city (colored by resource type)
- City flows: Lines from cities to their capital (colored by state color)
- Capital markers: Gold circles indicate nation capitals
- Wealth heatmap: Red gradient showing cell wealth distribution

### Tooltips
- Hover over tiles with Resources layer active to see resource name, icon, and amount
- Hover over tiles with Economy layer active to see wealth, production, and trade values

### Key Files
- `modules/resources-generator.js` - Resource distribution logic (15 resource types including Food, Wood, Grain, Timber, Iron, Gold, Fish, Stone, Salt, Gems, Horses, Furs, Spices, Wine)
- `modules/economy-generator.js` - Turn-based economy simulation with per-state resource stockpiles
- `modules/renderers/draw-resources.js` - Resource layer rendering with toggleResources()
- `modules/renderers/draw-economy.js` - Economy layer rendering with toggleEconomy()
- `modules/ui/economy-editor.js` - Economy control panel showing state treasury and resource stockpiles

## Notes
- This is a client-side only application
- No database or backend API required
- Maps are generated and processed entirely in the browser
- Economy and resource data is saved/loaded with map files
