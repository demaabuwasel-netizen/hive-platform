export default function ProgressBar({ current, total, label }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-[#4B6382] font-medium">{label}</span>
        <span className="text-sm text-navy-400">{current} of {total}</span>
      </div>
      <div className="w-full bg-cream-200 rounded-full h-2">
        <div
          className="bg-honey-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
