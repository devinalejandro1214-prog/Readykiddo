/* ─────────────────────────────────────────────────────────
   Shape Definitions — SVG Outlines
   Used for shape recognition game
   ───────────────────────────────────────────────────────── */

/* ── Color palette for each shape ─────────────────────────── */
const SHAPE_COLORS = {
  primary: '#4a90e2',      // fallback outline color
  secondary: '#2a5aa8',
};

/* ── Solid fill colors for shape tiles ─────────────────────── */
const SHAPE_TILE_COLORS = {
  red:    '#EF5350',
  purple: '#AB47BC',
  green:  '#66BB6A',
  yellow: '#FDD835',
  orange: '#FF9800',
  blue:   '#42A5F5'
};

const SHAPES = {
  circle: (size = 'large') => {
    const radius = size === 'large' ? 40 : size === 'medium' ? 30 : 20;
    const strokeWidth = size === 'large' ? 4 : size === 'medium' ? 3 : 2;

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="${radius}"
                fill="none"
                stroke="${SHAPE_COLORS.primary}"
                stroke-width="${strokeWidth}"
                stroke-linecap="round"/>
      </svg>`;
  },

  square: (size = 'large') => {
    const offset = size === 'large' ? 12 : size === 'medium' ? 20 : 28;
    const strokeWidth = size === 'large' ? 4 : size === 'medium' ? 3 : 2;

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="${offset}" y="${offset}"
              width="${100 - offset * 2}"
              height="${100 - offset * 2}"
              rx="4"
              fill="none"
              stroke="${SHAPE_COLORS.primary}"
              stroke-width="${strokeWidth}"
              stroke-linecap="round"
              stroke-linejoin="round"/>
      </svg>`;
  },

  diamond: (size = 'large') => {
    const cx = 50, cy = 50;
    const r = size === 'large' ? 38 : size === 'medium' ? 28 : 18;
    const strokeWidth = size === 'large' ? 4 : size === 'medium' ? 3 : 2;
    const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${pts}"
                 fill="none"
                 stroke="${SHAPE_COLORS.primary}"
                 stroke-width="${strokeWidth}"
                 stroke-linecap="round"
                 stroke-linejoin="round"/>
      </svg>`;
  },

  triangle: (size = 'large') => {
    const points = size === 'large'
      ? '50,10 90,85 10,85'
      : size === 'medium'
      ? '50,20 85,80 15,80'
      : '50,30 80,75 20,75';
    const strokeWidth = size === 'large' ? 4 : size === 'medium' ? 3 : 2;

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${points}"
                 fill="none"
                 stroke="${SHAPE_COLORS.primary}"
                 stroke-width="${strokeWidth}"
                 stroke-linecap="round"
                 stroke-linejoin="round"/>
      </svg>`;
  },

  star: (size = 'large') => {
    const scale = size === 'large' ? 1 : size === 'medium' ? 0.8 : 0.6;
    const basePoints = '50,10 61,40 90,40 67,60 78,90 50,70 22,90 33,60 10,40 39,40';
    const strokeWidth = size === 'large' ? 4 : size === 'medium' ? 3 : 2;

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${basePoints}"
                 fill="none"
                 stroke="${SHAPE_COLORS.primary}"
                 stroke-width="${strokeWidth}"
                 stroke-linecap="round"
                 stroke-linejoin="round"/>
      </svg>`;
  },

  rectangle: (size = 'large') => {
    const offsetX = size === 'large' ? 15 : size === 'medium' ? 25 : 35;
    const offsetY = size === 'large' ? 25 : size === 'medium' ? 32 : 38;
    const strokeWidth = size === 'large' ? 4 : size === 'medium' ? 3 : 2;

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="${offsetX}" y="${offsetY}"
              width="${100 - offsetX * 2}"
              height="${100 - offsetY * 2}"
              rx="3"
              fill="none"
              stroke="${SHAPE_COLORS.primary}"
              stroke-width="${strokeWidth}"
              stroke-linecap="round"
              stroke-linejoin="round"/>
      </svg>`;
  }
};

/* ─────────────────────────────────────────────────────────
   Helper: Get shape SVG with optional color fill
   Used for: game tiles (colored), outlines (blue), thumbnails
   ───────────────────────────────────────────────────────── */

function getShapeSVG(shapeType, size = 'large', colorName = null) {
  const generator = SHAPES[shapeType];
  if (!generator) {
    console.warn(`Shape not found: ${shapeType}`);
    return SHAPES.circle(size);
  }

  let svg = generator(size);

  // If a color is requested, replace the outline stroke with a solid fill
  if (colorName && SHAPE_TILE_COLORS[colorName]) {
    const fillColor = SHAPE_TILE_COLORS[colorName];
    // Remove stroke, add fill
    svg = svg
      .replace('fill="none"', `fill="${fillColor}"`)
      .replace(/stroke="#[0-9a-f]{6}"/gi, `stroke="none"`)
      .replace(/stroke-width="[^"]*"/g, '');
  }

  return svg;
}

/* ─────────────────────────────────────────────────────────
   PNG Shape Tiles
   512×512 transparent PNGs at assets/images/games/shapes/
   Naming: {color}-{filename}.png

   All 6 shape keys map 1-to-1 to their PNG filename.
   square  → {color}-square.png   (4-sided equal polygon)
   diamond → {color}-diamond.png  (rotated square / gem outline)
   ───────────────────────────────────────────────────────── */

const SHAPE_PNG_FILENAMES = {
  circle:    'circle',
  triangle:  'triangle',
  star:      'star',
  rectangle: 'rectangle',
  square:    'square',
  diamond:   'diamond'
};

const SHAPE_PNG_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

/**
 * Returns the path to the PNG tile for a given shape + color.
 * Falls back to 'circle' shape if the key isn't found.
 */
function getShapePNGPath(shapeKey, color) {
  const filename = SHAPE_PNG_FILENAMES[shapeKey] || 'circle';
  const safeColor = SHAPE_PNG_COLORS.includes(color) ? color : 'blue';
  return `assets/images/games/shapes/${safeColor}-${filename}.png`;
}
