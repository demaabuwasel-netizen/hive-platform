export const SKILL_CATS = [
  { cat:'Programming',       color:'#2563EB', bg:'rgba(37,99,235,0.09)',    items:['Python','JavaScript','React','Java','SQL','Node.js','TypeScript','C++'] },
  { cat:'Data & AI',         color:'#0D9488', bg:'rgba(13,148,136,0.09)',   items:['Machine Learning','Data Analysis','TensorFlow','Pandas','Statistics','Deep Learning'] },
  { cat:'Tools & Platforms', color:'#7C3AED', bg:'rgba(124,58,237,0.09)',   items:['Git','Docker','AWS','Google Cloud','Figma','Linux'] },
  { cat:'Soft Skills',       color:'#059669', bg:'rgba(5,150,105,0.09)',    items:['Communication','Leadership','Project Management','Problem Solving','Teamwork'] },
  { cat:'Design',            color:'#DB2777', bg:'rgba(219,39,119,0.09)',   items:['UI Design','UX Design','Graphic Design','Web Design','Prototyping'] },
  { cat:'Marketing',         color:'#EA580C', bg:'rgba(234,88,12,0.09)',    items:['Digital Marketing','Content Writing','Social Media','SEO','Email Marketing'] },
]

export const ALL_SKILLS = SKILL_CATS.flatMap(c => c.items)

export function getSkillCat(name) {
  return SKILL_CATS.find(c => c.items.includes(name)) ?? null
}

export function groupSkills(skills) {
  const normalized = skills.map(s => typeof s === 'string' ? { name: s } : s)
  const groups = []
  for (const cat of SKILL_CATS) {
    const catItems = normalized.filter(s => cat.items.includes(s.name))
    if (catItems.length) groups.push({ cat, items: catItems })
  }
  const catSet = new Set(ALL_SKILLS)
  const customs = normalized.filter(s => !catSet.has(s.name))
  if (customs.length) groups.push({ cat: { cat: 'Other', color: '#6B7280', bg: 'rgba(107,114,128,0.09)' }, items: customs })
  return groups
}
