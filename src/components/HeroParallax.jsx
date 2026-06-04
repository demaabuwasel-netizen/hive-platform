import { useEffect, useRef, useState } from 'react'

export default function HeroParallax({ bgImage, leafImages = {} }) {
  const containerRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const {
    background = bgImage || null,
    topLeft = leafImages.topLeft || null,
    topRight = leafImages.topRight || null,
    bottomLeft = leafImages.bottomLeft || null,
    bottomRight = leafImages.bottomRight || null,
  } = leafImages

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setMousePos({ x: x * 2 - 1, y: y * 2 - 1 })
    }

    const handleMouseLeave = () => {
      setMousePos({ x: 0, y: 0 })
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Calculate repulsion for each leaf based on distance from cursor
  const getLeafRepulsion = (leafX, leafY) => {
    const distance = Math.sqrt(mousePos.x * mousePos.x + mousePos.y * mousePos.y)
    const repulsionDistance = 0.6
    if (distance < repulsionDistance) {
      const repulsion = (1 - distance / repulsionDistance) * 100
      const angle = Math.atan2(mousePos.y, mousePos.x)
      return {
        x: -Math.cos(angle) * repulsion * (leafX > 0 ? 1 : -1) * 2,
        y: -Math.sin(angle) * repulsion * (leafY > 0 ? 1 : -1) * 2,
      }
    }
    return { x: 0, y: 0 }
  }

  const topLeftRepulsion = getLeafRepulsion(-1, -1)
  const topRightRepulsion = getLeafRepulsion(1, -1)
  const bottomLeftRepulsion = getLeafRepulsion(-1, 1)
  const bottomRightRepulsion = getLeafRepulsion(1, 1)

  // Soft wind animation - very subtle movement
  const windStyle = `
    @keyframes softWind {
      0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
      50% { transform: translate(3px, 2px) rotate(0.5deg); }
    }
  `

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100vh', marginTop: '-64px', paddingTop: '64px' }}
    >
      <style>{windStyle}</style>
      {/* Background layer */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          willChange: 'transform',
        }}
      >
        {background && (
          <img
            src={background}
            alt="Hive world background"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center top' }}
            draggable={false}
          />
        )}
      </div>

      {/* Fade out overlay at bottom of background */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '350px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.3) 40%, white 100%)',
        }}
      />

      {/* Top Left Leaf - Properly masked */}
      {topLeft && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-100px',
            left: '-150px',
            width: '450px',
            height: '450px',
            overflow: 'hidden',
            WebkitMaskImage: 'radial-gradient(circle at top left, black 0%, black 50%, transparent 85%)',
            maskImage: 'radial-gradient(circle at top left, black 0%, black 50%, transparent 85%)',
          }}
        >
          <div
            style={{
              willChange: 'transform',
              transform: `translate(${topLeftRepulsion.x * 0.3}px, ${topLeftRepulsion.y * 0.3}px)`,
              transition: 'transform 0.3s ease-out',
              animation: 'softWind 8s ease-in-out infinite',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={topLeft}
              alt=""
              style={{
                width: '120%',
                height: 'auto',
                display: 'block',
              }}
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Top Right Leaf - Properly masked */}
      {topRight && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-100px',
            right: '-150px',
            width: '450px',
            height: '450px',
            overflow: 'hidden',
            WebkitMaskImage: 'radial-gradient(circle at top right, black 0%, black 50%, transparent 85%)',
            maskImage: 'radial-gradient(circle at top right, black 0%, black 50%, transparent 85%)',
          }}
        >
          <div
            style={{
              willChange: 'transform',
              transform: `translate(${topRightRepulsion.x * 0.3}px, ${topRightRepulsion.y * 0.3}px)`,
              transition: 'transform 0.3s ease-out',
              animation: 'softWind 8s ease-in-out infinite',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={topRight}
              alt=""
              style={{
                width: '120%',
                height: 'auto',
                display: 'block',
                filter: 'saturate(1.3) brightness(1.1)',
              }}
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Bottom Left Leaf - Properly masked */}
      {bottomLeft && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-100px',
            left: '-150px',
            width: '450px',
            height: '450px',
            overflow: 'hidden',
            WebkitMaskImage: 'radial-gradient(circle at bottom left, black 0%, black 50%, transparent 85%)',
            maskImage: 'radial-gradient(circle at bottom left, black 0%, black 50%, transparent 85%)',
          }}
        >
          <div
            style={{
              willChange: 'transform',
              transform: `translate(${bottomLeftRepulsion.x * 0.5}px, ${bottomLeftRepulsion.y * 0.5}px)`,
              transition: 'transform 0.8s ease-out',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={bottomLeft}
              alt=""
              style={{
                width: '120%',
                height: 'auto',
                display: 'block',
              }}
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Bottom Right Leaf - Properly masked */}
      {bottomRight && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-100px',
            right: '-150px',
            width: '450px',
            height: '450px',
            overflow: 'hidden',
            WebkitMaskImage: 'radial-gradient(circle at bottom right, black 0%, black 50%, transparent 85%)',
            maskImage: 'radial-gradient(circle at bottom right, black 0%, black 50%, transparent 85%)',
          }}
        >
          <div
            style={{
              willChange: 'transform',
              transform: `translate(${bottomRightRepulsion.x * 0.5}px, ${bottomRightRepulsion.y * 0.5}px)`,
              transition: 'transform 0.8s ease-out',
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <img
              src={bottomRight}
              alt=""
              style={{
                width: '120%',
                height: 'auto',
                display: 'block',
              }}
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Center content area (reserved for logo, headline, buttons) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-center max-w-2xl px-6">
          {/* Placeholder for future content */}
        </div>
      </div>

      {/* Smooth fade gradient at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '300px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(250,246,239,0.15) 30%, rgba(250,246,239,0.5) 65%, rgba(250,246,239,1) 100%)',
        }}
      />
    </div>
  )
}
