# Website Update Summary

## Changes Made

### 1. Added Ficus Bonsai Model
- Copied `ficus_bonsai.glb` (48MB) to `/client/public/models/` directory
- Now have two 3D models available:
  - Cherry Blossom (scene.gltf - 153MB)
  - Ficus Bonsai (ficus_bonsai.glb - 48MB)

### 2. Updated CherryTreeViewer Component
- Added support for multiple tree models via `selectedTree` prop
- Created configuration object for each tree with custom scale and position:
  - Cherry: scale 0.6, position [0, -1.4, 0]
  - Ficus: scale 2.5, position [0, -1, 0]
- Component now dynamically loads the selected model

### 3. Updated Home Page
- Added tree selection buttons in top-right corner:
  - Cherry button (with TreeDeciduous icon)
  - Ficus button (with TreePine icon)
- Implemented state management for tree selection
- Created separate info content for each tree:
  - Cherry: Japanese cherry blossom information
  - Ficus: Banyan fig/ginseng ficus information
- Dynamic title and subtitle that changes based on selected tree
- Updated botanical descriptions and symbolism for each tree
- Updated model stats for each tree

### 4. UI/UX Enhancements
- Selection buttons use rounded-full style with backdrop blur
- Active button shows with 'default' variant
- Inactive button shows with 'outline' variant
- Smooth transitions between tree models
- Info panel content updates dynamically based on selection

## File Structure
```
web/
├── client/
│   ├── public/
│   │   └── models/
│   │       ├── scene.gltf (cherry tree)
│   │       ├── scene.bin
│   │       ├── ficus_bonsai.glb (NEW)
│   │       └── textures/
│   └── src/
│       ├── components/
│       │   └── CherryTreeViewer.tsx (UPDATED)
│       └── pages/
│           └── Home.tsx (UPDATED)
```

## Technical Details
- Uses React Three Fiber for 3D rendering
- Implements proper key prop for model switching to force re-render
- Maintains Zen minimalist design aesthetic
- Responsive design with mobile support
- Smooth animations using Framer Motion
