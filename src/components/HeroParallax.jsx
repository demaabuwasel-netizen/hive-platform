import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

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

  const bgX = mousePos.x * 3
  const bgY = mousePos.y * 3
  const sceneX = mousePos.x * 6
  const sceneY = mousePos.y * 6
  const rotation = mousePos.x * 2

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

  // Add smooth circular animations - leaves move outward only
  const windStyle = `
    @keyframes sway-top-left {
      0%, 100% { transform: translate(0px, 0px) rotateZ(0deg); }
      12.5% { transform: translate(0px, -10px) rotateZ(-0.5deg); }
      25% { transform: translate(0px, -18px) rotateZ(-1deg); }
      37.5% { transform: translate(0px, -30px) rotateZ(-1.5deg); }
      50% { transform: translate(0px, -38px) rotateZ(-1.5deg); }
      62.5% { transform: translate(0px, -30px) rotateZ(-1deg); }
      75% { transform: translate(0px, -18px) rotateZ(-0.5deg); }
      87.5% { transform: translate(0px, -8px) rotateZ(0deg); }
    }
    @keyframes sway-top-right {
      0%, 100% { transform: translate(0px, 0px) rotateZ(0deg); }
      12.5% { transform: translate(12px, -10px) rotateZ(0.5deg); }
      25% { transform: translate(22px, -18px) rotateZ(1deg); }
      37.5% { transform: translate(30px, -30px) rotateZ(1.5deg); }
      50% { transform: translate(33px, -38px) rotateZ(1.5deg); }
      62.5% { transform: translate(30px, -30px) rotateZ(1deg); }
      75% { transform: translate(18px, -18px) rotateZ(0.5deg); }
      87.5% { transform: translate(8px, -8px) rotateZ(0deg); }
    }
    @keyframes sway-bottom-left {
      0%, 100% { transform: translate(0px, 0px) rotateZ(0deg); }
      12.5% { transform: translate(-12px, 10px) rotateZ(0.5deg); }
      25% { transform: translate(-22px, 18px) rotateZ(1deg); }
      37.5% { transform: translate(-30px, 30px) rotateZ(1.5deg); }
      50% { transform: translate(-33px, 38px) rotateZ(1.5deg); }
      62.5% { transform: translate(-30px, 30px) rotateZ(1deg); }
      75% { transform: translate(-18px, 18px) rotateZ(0.5deg); }
      87.5% { transform: translate(-8px, 8px) rotateZ(0deg); }
    }
    @keyframes sway-bottom-right {
      0%, 100% { transform: translate(0px, 0px) rotateZ(0deg); }
      12.5% { transform: translate(12px, 10px) rotateZ(-0.5deg); }
      25% { transform: translate(22px, 18px) rotateZ(-1deg); }
      37.5% { transform: translate(30px, 30px) rotateZ(-1.5deg); }
      50% { transform: translate(33px, 38px) rotateZ(-1.5deg); }
      62.5% { transform: translate(30px, 30px) rotateZ(-1deg); }
      75% { transform: translate(18px, 18px) rotateZ(-0.5deg); }
      87.5% { transform: translate(8px, 8px) rotateZ(0deg); }
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

      {/* Hero Title Overlay */}
      <motion.div
        className="absolute inset-0 flex items-start justify-center pointer-events-none pt-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      >
        <div className="text-center max-w-4xl px-6">
          <h1 className="text-6xl md:text-7xl font-bold leading-tight" style={{ color: '#FFFFFF' }}>
            Connect talent<br />
            with<br />
            <span style={{
              background: 'linear-gradient(135deg, #FFB703 0%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              purpose
            </span>
          </h1>
        </div>
      </motion.div>

      {/* Leaf layers with parallax effect */}
      {/* Top Left */}
      {topLeft && (
        <div
          className="absolute top-0 left-0 pointer-events-none overflow-hidden"
          style={{
            willChange: 'transform',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              willChange: 'transform',
              transform: 'translate(0px, 0px)',
              position: 'absolute',
              top: 0,
              left: 0,
              marginLeft: '-200px',
              marginTop: '-120px',
            }}
          >
            <img src={topLeft} alt="" className="w-auto h-auto" draggable={false} />
          </div>
        </div>
      )}

      {/* Top Right */}
      {topRight && (
        <div
          className="absolute top-0 right-0 pointer-events-none overflow-hidden"
          style={{
            willChange: 'transform',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              willChange: 'transform',
              transform: `translate(${topRightRepulsion.x}px, ${topRightRepulsion.y}px)`,
              transition: 'transform 0.2s ease-out',
              animation: 'sway-top-right 26s ease-in-out infinite',
              position: 'absolute',
              top: 0,
              right: 0,
              marginRight: '-40px',
              marginTop: '-40px',
            }}
          >
            <img src={topRight} alt="" className="w-auto h-auto" draggable={false} style={{ filter: 'saturate(1.3) brightness(1.1)' }} />
          </div>
        </div>
      )}

      {/* Bottom Left */}
      {bottomLeft && (
        <div
          className="absolute bottom-0 left-0 pointer-events-none overflow-hidden"
          style={{
            willChange: 'transform',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              willChange: 'transform',
              transform: `translate(${bottomLeftRepulsion.x}px, ${bottomLeftRepulsion.y}px)`,
              transition: 'transform 0.2s ease-out',
              animation: 'sway-bottom-left 25s ease-in-out infinite',
              position: 'absolute',
              bottom: 0,
              left: 0,
              marginLeft: '-40px',
              marginBottom: '-40px',
            }}
          >
            <img src={bottomLeft} alt="" className="w-auto h-auto" draggable={false} />
          </div>
        </div>
      )}

      {/* Bottom Right */}
      {bottomRight && (
        <div
          className="absolute bottom-0 right-0 pointer-events-none overflow-hidden"
          style={{
            willChange: 'transform',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              willChange: 'transform',
              transform: `translate(${bottomRightRepulsion.x}px, ${bottomRightRepulsion.y}px)`,
              transition: 'transform 0.2s ease-out',
              animation: 'sway-bottom-right 23s ease-in-out infinite',
              position: 'absolute',
              bottom: 0,
              right: 0,
              marginRight: '-40px',
              marginBottom: '-40px',
            }}
          >
            <img src={bottomRight} alt="" className="w-auto h-auto" draggable={false} />
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
