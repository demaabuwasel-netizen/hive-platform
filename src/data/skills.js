export const SKILL_CATS = [
  { cat:'Frontend',      color:'#6366F1', bg:'rgba(99,102,241,0.09)',   items:['React','Vue.js','Angular','Svelte','Next.js','TypeScript','JavaScript','HTML/CSS','Tailwind CSS','jQuery','Gatsby','Nuxt.js','Astro','WebSockets','GraphQL'] },
  { cat:'Backend',       color:'#0891B2', bg:'rgba(8,145,178,0.09)',    items:['Node.js','Python','Django','Flask','FastAPI','Ruby on Rails','PHP','Laravel','Java','Spring Boot','Go','C#','.NET','Rust','Express.js','Nest.js'] },
  { cat:'Mobile',        color:'#7C3AED', bg:'rgba(124,58,237,0.09)',   items:['React Native','Flutter','Swift','Kotlin','Android Development','iOS Development','Expo'] },
  { cat:'Data & Cloud',  color:'#0D9488', bg:'rgba(13,148,136,0.09)',   items:['SQL','PostgreSQL','MySQL','MongoDB','Redis','Firebase','Supabase','Docker','Kubernetes','AWS','Azure','Google Cloud','Linux','Git','REST APIs'] },
  { cat:'Data Science',  color:'#2563EB', bg:'rgba(37,99,235,0.09)',    items:['Data Analysis','Machine Learning','Deep Learning','NLP','Computer Vision','TensorFlow','PyTorch','Scikit-learn','Pandas','NumPy','R','Tableau','Power BI','Statistics','Data Visualization','SPSS','Jupyter','Spark','dbt'] },
  { cat:'Design',        color:'#DB2777', bg:'rgba(219,39,119,0.09)',   items:['Figma','Adobe XD','Sketch','UX Design','UI Design','Graphic Design','Canva','Illustrator','Photoshop','InDesign','After Effects','Premiere Pro','Final Cut Pro','DaVinci Resolve','Blender','3D Modeling','Motion Graphics','Video Editing','Animation','Brand Design','Typography','Illustration','Photography'] },
  { cat:'Marketing',     color:'#EA580C', bg:'rgba(234,88,12,0.09)',    items:['SEO','SEM','Google Ads','Meta Ads','Content Marketing','Email Marketing','Social Media Marketing','Influencer Marketing','Copywriting','Content Writing','PR','Community Management','Growth Hacking','HubSpot','Mailchimp','Google Analytics','Marketing Analytics','Affiliate Marketing'] },
  { cat:'Business',      color:'#4F46E5', bg:'rgba(79,70,229,0.09)',    items:['Project Management','Product Management','Business Analysis','Financial Modeling','Accounting','Fundraising','Grant Writing','Business Development','Sales','Agile','Scrum','Lean','Operations','Strategy','CRM','Salesforce','Legal Research'] },
  { cat:'Research',      color:'#0F766E', bg:'rgba(15,118,110,0.09)',   items:['Research','Academic Writing','Literature Review','Qualitative Research','Quantitative Research','Survey Design','Statistical Analysis','Impact Evaluation','Policy Analysis','Field Research','Biostatistics','Data Collection'] },
  { cat:'Communication', color:'#B45309', bg:'rgba(180,83,9,0.09)',     items:['Public Speaking','Presentation Skills','Facilitation','Teaching','Training','Curriculum Design','Tutoring','Translation','Interpretation','Technical Writing','Journalism','Storytelling','Mediation','Negotiation'] },
  { cat:'Community',     color:'#059669', bg:'rgba(5,150,105,0.09)',    items:['Community Outreach','Event Planning','Volunteer Coordination','Nonprofit Management','Advocacy','Social Work','Mentoring','Leadership','Team Management','Logistics','First Aid','Mental Health Support'] },
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
