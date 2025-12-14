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

## Notes
- This is a client-side only application
- No database or backend API required
- Maps are generated and processed entirely in the browser
