import logo from '../assets/new-logo.png'

export default function HiveLogo({
  size = 36,
  showName = true,
  light = false,
  nameSize = '',
  className = '',
}) {
  const displayWidth = Math.round(size * 3.35)
  const height = Math.round(displayWidth * 0.67)

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <img
        src={logo}
        alt="Hive logo"
        width={displayWidth}
        height={height}
        className="shrink-0 object-contain"
        style={{ width: displayWidth, height }}
      />

      {showName && (
        <span className={`select-none font-medium leading-none tracking-[-0.055em] ${nameSize || 'text-[2rem]'} ${
          light ? 'text-white' : 'text-[#202124]'
        } drop-shadow-[0_1px_0_rgba(255,255,255,0.55)]`}>
          Hive
        </span>
      )}
    </div>
  )
}
