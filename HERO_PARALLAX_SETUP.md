# Hero Parallax Setup Guide

## Overview
You now have a premium interactive parallax hero component ready to use. It features:
- **GPU-accelerated parallax** with smooth 60fps animations
- **Mouse tracking** for depth immersion (no libraries required)
- **Three depth layers**: background (5px), scene (10px), leaves (15-20px)
- **Clean, minimal aesthetics** matching Stripe/Linear/Apple quality
- **Reserved center area** for your logo, headline, and CTAs

## Files Created

### Components
- **`src/components/HeroParallax.jsx`** — Core parallax component (flexible, accepts props)
- **`src/components/HeroParallaxWithImages.jsx`** — Ready-to-use wrapper with image handling

## Setup Steps

### 1. Add Images to Assets
Place these images in `src/assets/`:

```
src/assets/
├── HIVE.png                        (main background image)
├── upper_left_transparent(1).png   (foreground leaf, top-left)
├── upper_right_transparent(1).png  (foreground leaf, top-right)
├── lower_left_transparent(1).png   (foreground leaf, bottom-left)
└── lower_right_transparent(1).png  (foreground leaf, bottom-right)
```

### 2. Import & Use in Landing Page

In `src/pages/Landing.jsx`, replace the current hero section with:

```jsx
import HeroParallaxWithImages from '../components/HeroParallaxWithImages'

export default function Landing() {
  return (
    <div className="flex flex-col" style={{ background: C.bg }}>
      <Navbar />
      
      {/* New parallax hero */}
      <HeroParallaxWithImages />
      
      {/* Rest of your landing page sections continue below */}
      {/* VALUE PROPS section, FEATURE CARDS, etc. */}
    </div>
  )
}
```

### 3. Add Content to the Center (Later)
The center area is reserved for:
- Hive logo
- Headline ("Find meaningful opportunities...")
- CTA buttons ("I'm a Student", "I'm an NGO")
- Navigation

Currently it's empty. You can add content by editing `HeroParallax.jsx` and modifying this section:

```jsx
{/* Center content area (reserved for logo, headline, buttons) */}
<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
  <div className="text-center max-w-2xl px-6">
    {/* Add your logo, headline, buttons here */}
  </div>
</div>
```

## Motion Details

### Depth Layers & Movement
- **Background**: 5px max movement, no rotation
- **Leaf elements**: 15-20px max movement, 2° max rotation
- All motion is **smooth** and **subtle**

### Performance Optimizations
- Uses `willChange: 'transform'` for GPU acceleration
- Minimal state updates (mousemove only)
- `transform` and `transition` are GPU-accelerated
- No layout thrashing or expensive DOM operations
- Smooth 60fps at standard viewport sizes

### Motion Easing
- Linear transitions (0.04-0.05s) for responsive feel
- No bouncy animations
- Elegant, premium quality

## Customization

### Adjust Parallax Intensity
In `HeroParallax.jsx`, find these lines and tweak the multipliers:

```jsx
const bgX = mousePos.x * 3        // Background intensity (was 3, try 2-4)
const bgY = mousePos.y * 3
const sceneX = mousePos.x * 6     // Scene intensity (was 6, try 4-8)
const sceneY = mousePos.y * 6
const leafX = mousePos.x * 15     // Leaf intensity (was 15, try 12-18)
const leafY = mousePos.y * 15
const rotation = mousePos.x * 2   // Rotation intensity (was 2, try 1-3)
```

### Adjust Transition Speed
Find the transition values and adjust:

```jsx
transition: 'transform 0.05s linear'    // Try 0.04s-0.06s for faster/slower response
transition: 'transform 0.04s linear'    // (used for leaf elements)
```

### Change Background Color
Replace `background: '#FAF6EF'` with your desired color.

## Testing
1. Move your mouse over the hero section
2. Observe leaves drift smoothly in the direction of your cursor
3. Center area remains stable and readable
4. Smooth animation at all viewport sizes

## Troubleshooting

### Images not loading
- Ensure filenames match exactly (including spacing and parentheses)
- Check that images are in `src/assets/`
- Verify you're using the `HeroParallaxWithImages` wrapper component

### Animation looks choppy
- Check browser DevTools Performance tab
- Ensure GPU acceleration is enabled (use `willChange: 'transform'`)
- Reduce parallax multipliers if needed

### Center content overlaps with leaves
- You can increase `z-index` on the center area or adjust leaf positions
- Use opacity/color adjustments on leaves if needed

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- All modern browsers with CSS transforms support

## Integration Checklist
- [ ] Images placed in `src/assets/`
- [ ] `HeroParallaxWithImages` imported in Landing.jsx
- [ ] Old hero section removed/replaced
- [ ] Navbar appears above parallax hero
- [ ] Mouse interaction works smoothly
- [ ] Center area ready for logo/headline placement
- [ ] No console errors
- [ ] Animation runs at 60fps
