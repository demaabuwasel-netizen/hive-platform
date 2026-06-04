# Hero Parallax Integration Example

## Quick Start

### Option 1: Use the Wrapper Component (Recommended)
After you add your images to `src/assets/`, use the wrapper in your Landing page:

```jsx
import HeroParallaxWithImages from '../components/HeroParallaxWithImages'
import Navbar from '../components/Navbar'

export default function Landing() {
  return (
    <div className="flex flex-col" style={{ background: '#FAF6EF' }}>
      <Navbar />
      
      {/* Premium parallax hero section */}
      <HeroParallaxWithImages />
      
      {/* Rest of your landing page continues below */}
      <section className="px-6 pb-10">
        {/* VALUE PROPS section */}
      </section>
      
      {/* More sections... */}
    </div>
  )
}
```

### Option 2: Use the Core Component with Props
For more control, use `HeroParallax` directly and pass images as props:

```jsx
import HeroParallax from '../components/HeroParallax'
import bgImage from '../assets/HIVE.png'
import topLeftLeaf from '../assets/upper_left_transparent(1).png'
import topRightLeaf from '../assets/upper_right_transparent(1).png'
import bottomLeftLeaf from '../assets/lower_left_transparent(1).png'
import bottomRightLeaf from '../assets/lower_right_transparent(1).png'

export default function Landing() {
  return (
    <div className="flex flex-col">
      <Navbar />
      
      <HeroParallax 
        bgImage={bgImage}
        leafImages={{
          topLeft: topLeftLeaf,
          topRight: topRightLeaf,
          bottomLeft: bottomLeftLeaf,
          bottomRight: bottomRightLeaf,
        }}
      />
      
      {/* Rest of page... */}
    </div>
  )
}
```

## Testing Without Images

To test the parallax effect before adding your images, you can temporarily use existing assets:

```jsx
import HeroParallax from '../components/HeroParallax'
import img1 from '../assets/img1.png'
import img2 from '../assets/img2.png'

export default function Landing() {
  return (
    <HeroParallax 
      bgImage={img1}
      leafImages={{
        topLeft: img2,
        topRight: img2,
      }}
    />
  )
}
```

## Current Assets Available for Testing
These images exist in `src/assets/` and can be used for testing:
- `img1.png` (student with connections) - good as background
- `img2.png` (student illustration)
- `img3.png` (NGO illustration)
- `hero.png` (hero asset)

## Next Steps

1. **Prepare your images:**
   - Ensure HIVE.png is a beautiful full-screen background
   - Ensure leaf images preserve transparency and soft edges
   - No cropping or aggressive filters

2. **Add images to src/assets/:**
   ```
   src/assets/
   ├── HIVE.png
   ├── upper_left_transparent(1).png
   ├── upper_right_transparent(1).png
   ├── lower_left_transparent(1).png
   └── lower_right_transparent(1).png
   ```

3. **Uncomment imports in HeroParallaxWithImages.jsx:**
   Once files exist, uncomment the require() statements

4. **Add content to center area:**
   Edit HeroParallax.jsx to add your logo, headline, and CTAs

## Component Props Reference

### HeroParallax Props

```jsx
<HeroParallax 
  bgImage={string}           // URL to background image
  leafImages={{              // Object with leaf image URLs
    topLeft: string,
    topRight: string,
    bottomLeft: string,
    bottomRight: string,
  }}
/>
```

- All props are optional (component handles missing images gracefully)
- Images can be imported or external URLs
- Leaf images can have transparency (PNG recommended)

## Features Summary

✅ Premium parallax effect (Apple/Stripe/Linear quality)
✅ GPU-accelerated animations (smooth 60fps)
✅ Smooth mouse tracking (no jank)
✅ Flexible component (works with or without images)
✅ Reserved center area for future content
✅ Subtle motion (not bouncy or game-like)
✅ Clean, minimal code
✅ No external animation libraries needed
✅ Responsive (works on all viewport sizes)
✅ Graceful degradation (works without images)
