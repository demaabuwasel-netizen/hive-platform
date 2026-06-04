import HeroParallax from './HeroParallax'
import bgImage from '../assets/home_landing_page2.png'
import topLeft from '../assets/upper_left_transparent.png'
import topRight from '../assets/upper_right_transparent.png'
import bottomLeft from '../assets/lower_left_transparent.png'
import bottomRight from '../assets/lower_right_transparent.png'
import bottomBorder from '../assets/bottom_border_TRUE_TRANSPARENT (1).png'

export default function HeroParallaxWithImages() {
  return (
    <HeroParallax
      bgImage={bgImage}
      leafImages={{
        topLeft,
        topRight,
        bottomLeft,
        bottomRight,
        bottomBorder,
      }}
    />
  )
}
