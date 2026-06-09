# Your Hive Dashboard Component

Two versions of the "Your Hive" dashboard module are available:

## Versions

### 1. **YourHive.jsx** (Full-featured)
- Comprehensive design with status summary counters at top
- Detailed legend with descriptions
- Subtle background hexagon grid for visual structure
- Generous spacing and polished finish
- Best for: Primary dashboard view, flagship design
- File: `src/components/Dashboard/YourHive.jsx`

### 2. **YourHiveMinimal.jsx** (Clean & stripped)
- Minimal aesthetic, no decorative elements
- Compact inline legend
- Same core functionality, less visual weight
- Best for: Secondary dashboard view, embedded contexts, minimal dashboards
- File: `src/components/Dashboard/YourHiveMinimal.jsx`

## Basic Usage

### Import
```javascript
import YourHive from '@/components/Dashboard/YourHive'
// or for minimal version:
import YourHiveMinimal from '@/components/Dashboard/YourHiveMinimal'
```

### Default (with mock data)
```jsx
<YourHive />
```

### With real role data
```jsx
const roles = [
  { id: 1, title: 'Graphic Designer', status: 'applied' },
  { id: 2, title: 'Social Media Manager', status: 'open' },
  // ... more roles
]

<YourHive roles={roles} />
```

## Role Data Shape

```typescript
interface Role {
  id: string | number
  title: string           // Role title (e.g. "Graphic Designer")
  status: 'draft' | 'open' | 'applied' | 'active'
}
```

### Status Definitions
- **draft**: Role exists but is not published yet
- **open**: Role is published and live, but no one has applied yet
- **applied**: Role is published and has applicants
- **active**: Someone is currently active in this role / role is filled and ongoing

## Status Colors

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Draft | Light Gray | Gray | Light Gray |
| Open | Pale Lavender | Purple | Pale Lavender |
| Applied | Warm Amber | Orange | Amber |
| Active | Soft Green | Green | Green |

## Design Principles

- **Each hexagon = one role posting** (not volunteers, applicants, or categories)
- **Only 4 statuses** kept simple and clean
- **Modern SaaS aesthetic** inspired by Apple, Google, Linear, Stripe, Notion
- **Minimal and refined** with intentional use of color for status
- **Trustworthy and professional** tone

## Integration with NGO Dashboard

Example integration into an NGO dashboard page:

```jsx
import { useEffect, useState } from 'react'
import YourHive from '@/components/Dashboard/YourHive'
import { loadNgoRoles } from '@/services/roles' // Implement this based on your DB

export default function NGODashboard() {
  const [roles, setRoles] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadNgoRoles(user.id).then(setRoles)
    }
  }, [user])

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Your Hive Section */}
      <YourHive roles={roles} />

      {/* Other dashboard sections... */}
    </div>
  )
}
```

## Database Implementation

Add to `src/services/roles.js` (or similar):

```javascript
import { supabase } from './supabase'

export async function loadNgoRoles(userId) {
  const { data, error } = await supabase
    .from('roles')
    .select('id, title, status')
    .eq('ngo_user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Failed to load roles:', error.message)
    return []
  }
  
  return data ?? []
}

export async function saveRole(ngoUserId, role) {
  const { error } = await supabase
    .from('roles')
    .insert({
      ngo_user_id: ngoUserId,
      title: role.title,
      status: role.status,
      // ... other role fields
    })
  
  if (error) throw new Error(error.message)
}

export async function updateRoleStatus(roleId, newStatus) {
  const { error } = await supabase
    .from('roles')
    .update({ status: newStatus })
    .eq('id', roleId)
  
  if (error) throw new Error(error.message)
}
```

## Customization

### Change colors
Edit `STATUS_COLORS` object at top of component:

```javascript
const STATUS_COLORS = {
  draft: { bg: '#YOUR_BG', text: '#YOUR_TEXT', border: '#YOUR_BORDER', label: 'Draft' },
  // ...
}
```

### Adjust hexagon size
Modify `style={{ width: '120px', height: '140px' }}` and the `w-24 h-28` classes.

### Change spacing
Adjust `gap-6` (full version) or `gap-4` (minimal version) to change hexagon spacing.

### Add click handlers
Wrap HexagonRole in `onClick` handler:

```javascript
function HexagonRole({ role, index, onSelect }) {
  return (
    <motion.div onClick={() => onSelect(role)}>
      {/* ... */}
    </motion.div>
  )
}
```

## Performance

- Hexagons render with staggered animations (each starts 30ms apart)
- Light animations using Framer Motion spring physics
- No heavy computations — fully static display once data loads
- Mock data includes 9 roles; scales well to 20-30+ roles

## Accessibility

- Uses semantic HTML structure
- Color-coded status with text labels (not color-only)
- Text is readable (11px body, 9px labels with good contrast)
- No decorative-only elements blocking interaction

## Browser Support

- Modern browsers (Chrome, Safari, Firefox, Edge)
- Requires Tailwind CSS v3+
- Requires Framer Motion v6+
- CSS `clip-path` for hexagon shapes (all modern browsers supported)

---

Ready to ship! The components are production-ready and match modern SaaS design standards.
