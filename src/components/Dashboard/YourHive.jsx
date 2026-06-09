import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { fetchNgoOpportunities } from '../../services/opportunities'

// Opportunity Modal
function OpportunityModal({ opportunity, isOpen, onClose }) {
  if (!opportunity) return null

  const statusColors = {
    draft: '#FAFBFC',
    open: '#F0EEFF',
    applied: '#FEF3C7',
    active: '#D1FAE5',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(13, 24, 61, 0.4)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="p-6 border-b border-[#E5E7EB] flex items-start justify-between"
              style={{ background: statusColors[opportunity.status] || '#FAFBFC' }}
            >
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[#0D183D] mb-2">{opportunity.title}</h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background:
                        opportunity.status === 'open'
                          ? '#D4C9F5'
                          : opportunity.status === 'applied'
                            ? '#FCD34D'
                            : opportunity.status === 'active'
                              ? '#A7F3D0'
                              : '#D5D9E0',
                      color:
                        opportunity.status === 'open'
                          ? '#6B21A8'
                          : opportunity.status === 'applied'
                            ? '#92400E'
                            : opportunity.status === 'active'
                              ? '#059669'
                              : '#6B7280',
                    }}
                  >
                    {opportunity.status === 'open'
                      ? 'Published awaiting applications'
                      : opportunity.status === 'applied'
                        ? 'Has applications'
                        : opportunity.status === 'active'
                          ? 'Volunteer assigned'
                          : 'Not published'}
                  </span>
                  {opportunity.category && (
                    <span className="text-xs text-[#6B7280]">Category: {opportunity.category}</span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#6B7280] hover:text-[#0D183D] transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {opportunity.description && (
                <div>
                  <h3 className="text-sm font-bold text-[#0D183D] mb-2">Description</h3>
                  <p className="text-sm text-[#4B6382] leading-relaxed">{opportunity.description}</p>
                </div>
              )}

              {opportunity.missionImpact && (
                <div>
                  <h3 className="text-sm font-bold text-[#0D183D] mb-2">Impact</h3>
                  <p className="text-sm text-[#4B6382] leading-relaxed">{opportunity.missionImpact}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {opportunity.location && (
                  <div>
                    <p className="text-xs text-[#6B7280] font-semibold mb-1">Location</p>
                    <p className="text-sm text-[#0D183D]">{opportunity.location}</p>
                  </div>
                )}
                {opportunity.workMode && (
                  <div>
                    <p className="text-xs text-[#6B7280] font-semibold mb-1">Work Mode</p>
                    <p className="text-sm text-[#0D183D]">{opportunity.workMode}</p>
                  </div>
                )}
                {opportunity.weeklyHours && (
                  <div>
                    <p className="text-xs text-[#6B7280] font-semibold mb-1">Weekly Hours</p>
                    <p className="text-sm text-[#0D183D]">{opportunity.weeklyHours}</p>
                  </div>
                )}
                {opportunity.duration && (
                  <div>
                    <p className="text-xs text-[#6B7280] font-semibold mb-1">Duration</p>
                    <p className="text-sm text-[#0D183D]">{opportunity.duration}</p>
                  </div>
                )}
              </div>

              {opportunity.skills && opportunity.skills.length > 0 && (
                <div>
                  <p className="text-xs text-[#6B7280] font-semibold mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded-lg text-xs font-medium bg-[#F3F4F6] text-[#4B6382]"
                      >
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const Hexagon = ({ cx, cy, type, index, isActionable = false, onPlusClick, onViewClick, label, sublabel }) => {
  const colorMap = {
    center: { fill: '#0D183D', stroke: '#1a2b4a', accent: '#FDB913', text: '#FDB913' },
    draft: { fill: '#FAFBFC', stroke: '#D5D9E0', text: '#6B7280' },
    open: { fill: '#F0EEFF', stroke: '#D4C9F5', text: '#6B21A8' },
    applied: { fill: '#FEF3C7', stroke: '#FCD34D', text: '#92400E' },
    active: { fill: '#D1FAE5', stroke: '#A7F3D0', text: '#059669' },
    plus: { fill: '#E0E7FF', stroke: '#A5B4FC', text: '#4338CA' },
    empty: { fill: '#FAFBFC', stroke: '#D5D9E0', text: '#6B7280' },
  }

  const style = colorMap[type]
  const size = 28

  // Pointy-top hexagon vertices
  const points = [
    [cx + size * 0.866, cy + size / 2],
    [cx, cy + size],
    [cx - size * 0.866, cy + size / 2],
    [cx - size * 0.866, cy - size / 2],
    [cx, cy - size],
    [cx + size * 0.866, cy - size / 2],
  ]
    .map(p => p.join(','))
    .join(' ')

  const handleClick = () => {
    if (type === 'plus' && onPlusClick) {
      onPlusClick()
    } else if (type !== 'center' && type !== 'empty' && onViewClick) {
      onViewClick()
    }
  }

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.4, type: 'spring', stiffness: 300 }}
      className={isActionable || (type !== 'center' && type !== 'empty') ? 'cursor-pointer group' : ''}
      onClick={handleClick}
    >
      <polygon
        points={points}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth="0.9"
        strokeLinejoin="round"
        className={isActionable || (type !== 'center' && type !== 'empty') ? 'group-hover:opacity-80 transition-opacity duration-200' : ''}
      />

      {type === 'center' && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9"
          fontWeight="700"
          fill={style.text}
          style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', letterSpacing: '0.3px' }}
        >
          HIVE
        </text>
      )}

      {type === 'plus' && (
        <g className="opacity-50 group-hover:opacity-100 transition-opacity duration-200">
          <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke={style.text} strokeWidth="1.2" strokeLinecap="round" />
          <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke={style.text} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}

      {type === 'center' && (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="9"
          fontWeight="700"
          fill={style.text}
          style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', letterSpacing: '0.3px' }}
        >
          HIVE
        </text>
      )}

      {type === 'plus' && (
        <g className="opacity-50 group-hover:opacity-100 transition-opacity duration-200">
          <line x1={cx - 5} y1={cy} x2={cx + 5} y2={cy} stroke={style.text} strokeWidth="1.2" strokeLinecap="round" />
          <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke={style.text} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}

      {label && type !== 'center' && type !== 'plus' && (
        <>
          <text
            x={cx}
            y={cy - 3}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="6.5"
            fontWeight="600"
            fill={style.text}
            style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
          >
            {label}
          </text>
          {sublabel && (
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="3.8"
              fontWeight="500"
              fill={style.text}
              style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif', letterSpacing: '-0.4px' }}
            >
              {sublabel}
            </text>
          )}
        </>
      )}
    </motion.g>
  )
}

export default function YourHive() {
  const navigate = useNavigate()
  const { user } = useApp()
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    setLoading(true)
    fetchNgoOpportunities(user.id)
      .then(opps => {
        console.log('[YourHive] Loaded opportunities:', opps.length)
        setOpportunities(opps || [])
      })
      .catch(err => {
        console.error('[YourHive] Failed to load opportunities:', err)
        setOpportunities([])
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  const handlePlusClick = () => {
    navigate('/opportunities/new')
  }

  const handleViewOpportunity = (opportunityId) => {
    const opp = opportunities.find(o => o.id === opportunityId)
    if (opp) {
      setSelectedOpportunity(opp)
    }
  }

  // Build honeycomb with real opportunities
  // Fixed layout: 3-4-5-4-3 hexagons
  const positions = [
    // TOP ROW (3 hexes) — y = 20
    { cx: 100, cy: 20 },
    { cx: 148, cy: 20 },
    { cx: 196, cy: 20 },
    // UPPER-MIDDLE ROW (4 hexes, offset) — y = 62
    { cx: 76, cy: 62 },
    { cx: 124, cy: 62 },
    { cx: 172, cy: 62 },
    { cx: 220, cy: 62 },
    // CENTER ROW (5 hexes) — y = 104
    { cx: 52, cy: 104 },
    { cx: 100, cy: 104 }, // center HIVE
    { cx: 148, cy: 104 },
    { cx: 196, cy: 104 },
    { cx: 244, cy: 104 },
    // LOWER-MIDDLE ROW (4 hexes, offset) — y = 146
    { cx: 76, cy: 146 },
    { cx: 124, cy: 146 },
    { cx: 172, cy: 146 },
    { cx: 220, cy: 146 },
    // BOTTOM ROW (3 hexes) — y = 188
    { cx: 100, cy: 188 },
    { cx: 148, cy: 188 },
    { cx: 196, cy: 188 },
  ]

  // Status labels (one line)
  const statusLabels = {
    draft: 'Not published',
    open: 'Published awaiting applications',
    applied: 'Has applications',
    active: 'Volunteer assigned',
  }

  // Map opportunities to hexagon positions (skip center at index 9)
  const hexagons = positions.map((pos, idx) => {
    if (idx === 9) {
      // Center HIVE
      return { ...pos, type: 'center', index: idx }
    }

    // Get opportunity for this position (excluding center)
    const oppIndex = idx < 9 ? idx : idx - 1 // Account for center hex
    const opp = opportunities[oppIndex]

    if (opp) {
      // Display posted opportunity
      const type = opp.status || 'draft'
      const shortTitle = opp.title ? opp.title.split(' ')[0].slice(0, 8) : '•'
      const statusLabel = statusLabels[type] || type
      return {
        ...pos,
        type,
        index: idx,
        label: shortTitle,
        sublabel: statusLabel,
        isActionable: true,
        opportunityId: opp.id,
      }
    }

    // Empty position - show plus button for posting
    if (idx !== 9) {
      return { ...pos, type: 'plus', index: idx, isActionable: true }
    }
  })

  return (
    <>
      <OpportunityModal
        opportunity={selectedOpportunity}
        isOpen={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-[0_1px_2px_rgba(13,24,61,0.05)] p-5">
        <div className="flex gap-6">
        {/* LEFT: Hive */}
        <div className="flex flex-col pl-8">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#0D183D]">Your Hive</h2>
          </div>

          {/* Honeycomb SVG */}
          <svg width="280" height="240" viewBox="0 0 360 240" style={{ display: 'block' }}>
            {!loading && hexagons.map(hex => (
              <Hexagon
                key={hex.index}
                cx={hex.cx}
                cy={hex.cy}
                type={hex.type}
                index={hex.index}
                isActionable={hex.isActionable}
                onPlusClick={handlePlusClick}
                onViewClick={() => hex.opportunityId && handleViewOpportunity(hex.opportunityId)}
                label={hex.label}
                sublabel={hex.sublabel}
              />
            ))}
          </svg>
        </div>

        {/* RIGHT: Legend */}
        <div className="flex-1 flex flex-col justify-center pl-64">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Role Status</p>

          <div className="space-y-2.5">
            {/* Open */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#F0EEFF', border: '1px solid #D4C9F5' }} />
              <p className="text-xs text-[#0D183D] whitespace-nowrap overflow-hidden text-ellipsis"><span className="font-semibold">Open:</span> Published awaiting applications</p>
            </div>

            {/* Applied */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }} />
              <p className="text-xs text-[#0D183D] whitespace-nowrap overflow-hidden text-ellipsis"><span className="font-semibold">Applied:</span> Has applications</p>
            </div>

            {/* Active */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#D1FAE5', border: '1px solid #A7F3D0' }} />
              <p className="text-xs text-[#0D183D] whitespace-nowrap overflow-hidden text-ellipsis"><span className="font-semibold">Active:</span> Volunteer assigned</p>
            </div>

            {/* Draft */}
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#FAFBFC', border: '1px solid #D5D9E0' }} />
              <p className="text-xs text-[#0D183D] whitespace-nowrap overflow-hidden text-ellipsis"><span className="font-semibold">Draft:</span> Not published</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
