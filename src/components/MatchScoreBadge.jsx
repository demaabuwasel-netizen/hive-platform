export default function MatchScoreBadge({ score }) {
  const style =
    score >= 90 ? 'bg-honey-100 text-honey-700' :
    score >= 75 ? 'bg-emerald-100 text-emerald-700' :
    'bg-navy-100 text-navy-600'

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${style}`}>
      <span aria-hidden="true">✦</span>
      {score}% match
    </span>
  )
}
