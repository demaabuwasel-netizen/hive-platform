import { groupSkills } from '../data/skills'

export default function CategorizedSkillTags({ skills = [], showLevel = false, size = 'md' }) {
  if (!skills.length) return null
  const groups = groupSkills(skills)
  if (!groups.length) return null

  const tagClass = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 rounded-md'
    : 'text-[11px] px-2.5 py-1 rounded-lg'

  return (
    <div className="flex flex-col gap-3">
      {groups.map(({ cat, items }) => (
        <div key={cat.cat}>
          <p className="text-[9px] font-extrabold uppercase tracking-widest mb-1.5"
            style={{ color: cat.color }}>
            {cat.cat}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {items.map(item => (
              <span key={item.name}
                className={`inline-flex items-center gap-1.5 font-semibold border ${tagClass}`}
                style={{ background: cat.bg, borderColor: `${cat.color}35`, color: cat.color }}>
                {item.name}
                {showLevel && item.level && (
                  <span className="text-[9px] opacity-60 font-medium">{item.level}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
