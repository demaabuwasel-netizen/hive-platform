import { useEffect, useRef, useState } from 'react'

export default function HeroParallax({ bgImage, leafImages = {} }) {
  const containerRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [isTracking, setIsTracking] = useState(false)
  const animationFrameRef = useRef(null)

  const {
    topLeft = leafImages.topLeft || null,
    topRight = leafImages.topRight || null,
    bottomLeft = leafImages.bottomLeft || null,
    bottomRight = leafImages.bottomRight || null,
  } = leafImages

  // Smooth parallax tracking
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      // Clamp to 0-1 range
      setMousePos({
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      })
      setIsTracking(true)
    }

    const handleMouseLeave = () => {
      setIsTracking(false)
      // Smooth return to center
      setMousePos({ x: 0.5, y: 0.5 })
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Calculate parallax offsets based on depth
  const getParallaxOffset = (depthAmount) => {
    const centerX = 0.5
    const centerY = 0.5
    const deltaX = (mousePos.x - centerX) * 2 // -1 to 1
    const deltaY = (mousePos.y - centerY) * 2 // -1 to 1

    return {
      x: deltaX * depthAmount,
      y: deltaY * depthAmount,
    }
  }

  // Depth layers with easing
  const backgroundOffset = getParallaxOffset(5)    // Subtle background movement
  const topLeftOffset = getParallaxOffset(18)      // Leaves move more
  const topRightOffset = getParallaxOffset(18)
  const bottomLeftOffset = getParallaxOffset(18)
  const bottomRightOffset = getParallaxOffset(18)

  // Premium easing function
  const easeOut = (t) => 1 - Math.pow(1 - t, 3)

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gray-50"
      style={{ marginTop: '-64px', paddingTop: '64px' }}
    >
      {/* Main Hero Background - Full screen, no crop */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translate(${backgroundOffset.x}px, ${backgroundOffset.y}px)`,
          transition: isTracking ? 'none' : 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: 'transform',
        }}
      >
        {bgImage && (
          <img
            src={bgImage}
            alt="Hive Hero Background"
            className="w-full h-full object-cover"
            style={{
              objectPosition: 'center',
              userSelect: 'none',
              WebkitUserDrag: 'none',
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Top Left Leaf */}
      {topLeft && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0,
            left: 0,
            width: '30%',
            maxWidth: '400px',
            aspectRatio: '1',
            transform: `translate(${topLeftOffset.x}px, ${topLeftOffset.y}px)`,
            transition: isTracking ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
            zIndex: 10,
          }}
        >
          <img
            src={topLeft}
            alt=""
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))',
            }}
            draggable={false}
          />
        </div>
      )}

      {/* Top Right Leaf */}
      {topRight && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0,
            right: 0,
            width: '30%',
            maxWidth: '420px',
            aspectRatio: '1',
            transform: `translate(${topRightOffset.x}px, ${topRightOffset.y}px)`,
            transition: isTracking ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
            zIndex: 10,
          }}
        >
          <img
            src={topRight}
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      )}

      {/* Bottom Left Leaf */}
      {bottomLeft && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 0,
            left: 0,
            width: '28%',
            maxWidth: '380px',
            aspectRatio: '1',
            transform: `translate(${bottomLeftOffset.x}px, ${bottomLeftOffset.y}px)`,
            transition: isTracking ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
            zIndex: 10,
          }}
        >
          <img
            src={bottomLeft}
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      )}

      {/* Bottom Right Leaf */}
      {bottomRight && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: 0,
            right: 0,
            width: '32%',
            maxWidth: '420px',
            aspectRatio: '1',
            transform: `translate(${bottomRightOffset.x}px, ${bottomRightOffset.y}px)`,
            transition: isTracking ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
            zIndex: 10,
          }}
        >
          <img
            src={bottomRight}
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      )}

      {/* Center content area - Reserved for logo, headline, buttons */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        style={{
          // Intentionally empty - future content will go here
        }}
      />
    </div>
  )
}
