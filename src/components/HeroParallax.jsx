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
    bottomBorder = leafImages.bottomBorder || null,
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

  // Subtle cursor response for bottom leaves only
  const bottomLeftResponse = {
    x: mousePos.x * 15,
    y: mousePos.y * 15,
  }

  const bottomRightResponse = {
    x: mousePos.x * 15,
    y: mousePos.y * 15,
  }

  // Premium animation styles
  const windStyle = `
    @keyframes float-top-left {
      0%, 100% { transform: translate(0, 0) rotateZ(-2deg); }
      25% { transform: translate(-8px, -6px) rotateZ(-1.5deg); }
      50% { transform: translate(-3px, -10px) rotateZ(-2.5deg); }
      75% { transform: translate(-10px, -4px) rotateZ(-1.8deg); }
    }

    @keyframes float-top-right {
      0%, 100% { transform: translate(0, 0) rotateZ(1.5deg); }
      25% { transform: translate(6px, -7px) rotateZ(2deg); }
      50% { transform: translate(2px, -9px) rotateZ(1deg); }
      75% { transform: translate(8px, -3px) rotateZ(2.2deg); }
    }

    @keyframes sway-bottom-border {
      0%, 100% { transform: translateX(0) translateY(0); }
      33% { transform: translateX(-4px) translateY(-2px); }
      66% { transform: translateX(2px) translateY(1px); }
    }

    @keyframes gentle-drift {
      0%, 100% { opacity: 1; transform: translate(0, 0); }
      50% { opacity: 1; transform: translate(2px, -2px); }
    }
  `

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100vh', marginTop: '-64px', paddingTop: '64px' }}
    >
      <style>{windStyle}</style>

      {/* Main background image */}
      <div className="absolute inset-0 w-full h-full">
        {background && (
          <img
            src={background}
            alt="Hero background"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center top' }}
            draggable={false}
          />
        )}
      </div>

      {/* Top Left Leaf - Subtle wind animation */}
      {topLeft && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-40px',
            left: '-60px',
            width: '400px',
            height: '400px',
            animation: 'float-top-left 28s ease-in-out infinite',
            WebkitMaskImage: 'radial-gradient(circle 180px at center, black 30%, rgba(0,0,0,0.8) 60%, transparent 100%)',
            maskImage: 'radial-gradient(circle 180px at center, black 30%, rgba(0,0,0,0.8) 60%, transparent 100%)',
          }}
        >
          <img src={topLeft} alt="" className="w-full h-full object-contain" draggable={false} style={{ pointerEvents: 'none' }} />
        </div>
      )}

      {/* Top Right Leaf - Subtle wind animation */}
      {topRight && (
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-30px',
            right: '-80px',
            width: '420px',
            height: '420px',
            animation: 'float-top-right 32s ease-in-out infinite',
            WebkitMaskImage: 'radial-gradient(circle 200px at center, black 35%, rgba(0,0,0,0.75) 65%, transparent 100%)',
            maskImage: 'radial-gradient(circle 200px at center, black 35%, rgba(0,0,0,0.75) 65%, transparent 100%)',
          }}
        >
          <img src={topRight} alt="" className="w-full h-full object-contain" draggable={false} style={{ pointerEvents: 'none' }} />
        </div>
      )}

      {/* Bottom Left Leaf - Cursor reactive with wind animation */}
      {bottomLeft && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-30px',
            left: '-40px',
            width: '360px',
            height: '360px',
            transform: `translate(${bottomLeftResponse.x * 0.3}px, ${bottomLeftResponse.y * 0.3}px)`,
            transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            WebkitMaskImage: 'radial-gradient(circle 160px at center, black 40%, rgba(0,0,0,0.8) 65%, transparent 100%)',
            maskImage: 'radial-gradient(circle 160px at center, black 40%, rgba(0,0,0,0.8) 65%, transparent 100%)',
          }}
        >
          <img src={bottomLeft} alt="" className="w-full h-full object-contain" draggable={false} style={{ pointerEvents: 'none' }} />
        </div>
      )}

      {/* Bottom Right Leaf - Cursor reactive with wind animation */}
      {bottomRight && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-40px',
            right: '-50px',
            width: '380px',
            height: '380px',
            transform: `translate(${bottomRightResponse.x * 0.3}px, ${bottomRightResponse.y * 0.3}px)`,
            transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            WebkitMaskImage: 'radial-gradient(circle 170px at center, black 38%, rgba(0,0,0,0.8) 63%, transparent 100%)',
            maskImage: 'radial-gradient(circle 170px at center, black 38%, rgba(0,0,0,0.8) 63%, transparent 100%)',
          }}
        >
          <img src={bottomRight} alt="" className="w-full h-full object-contain" draggable={false} style={{ pointerEvents: 'none' }} />
        </div>
      )}

      {/* Bottom Border Leaf Strip - Soft wind animation */}
      {bottomBorder && (
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
          style={{
            height: '280px',
            animation: 'sway-bottom-border 18s ease-in-out infinite',
          }}
        >
          <div style={{
            position: 'absolute',
            bottom: '-1px',
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.8) 60%, black 100%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.8) 60%, black 100%)',
          }}>
            <img src={bottomBorder} alt="" className="w-full h-full object-cover" draggable={false} style={{ pointerEvents: 'none' }} />
          </div>
        </div>
      )}

      {/* Center content area */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="text-center max-w-2xl px-6">
          {/* Hero content goes here */}
        </div>
      </div>

      {/* Soft gradient fade at bottom to next section */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: '250px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.08) 15%, rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.5) 65%, rgba(255,255,255,0.85) 85%, white 100%)',
        }}
      />
    </div>
  )
}
