const accentMap = {
  violet: {
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.2)',
    iconBg: 'rgba(139,92,246,0.15)',
    iconColor: '#c4b5fd',
    badgeBg: 'rgba(139,92,246,0.12)',
    badgeBorder: 'rgba(139,92,246,0.25)',
    badgeText: '#a78bfa',
    dot: '#8b5cf6',
  },
  blue: {
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.18)',
    iconBg: 'rgba(59,130,246,0.15)',
    iconColor: '#93c5fd',
    badgeBg: 'rgba(59,130,246,0.12)',
    badgeBorder: 'rgba(59,130,246,0.25)',
    badgeText: '#60a5fa',
    dot: '#3b82f6',
  },
};

export default function ComingSoon({ icon: Icon, title, subtitle, step = 'Step 2', accent = 'blue' }) {
  const a = accentMap[accent] || accentMap.blue;

  return (
    <div className="flex flex-col" dir="rtl">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <span className="text-xs px-2.5 py-1 rounded-full font-mono font-medium"
            style={{ background: a.badgeBg, border: `1px solid ${a.badgeBorder}`, color: a.badgeText }}>
            {step}
          </span>
        </div>
        <p className="text-sm" style={{ color: '#64748b' }}>{subtitle}</p>
      </div>

      {/* Placeholder card */}
      <div className="rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
        style={{ background: a.bg, border: `1px solid ${a.border}` }}>

        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: a.iconBg }}>
          <Icon className="w-9 h-9" style={{ color: a.iconColor }} />
        </div>

        <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
        <p className="text-sm max-w-sm leading-relaxed" style={{ color: '#475569' }}>{subtitle}</p>

        <div className="mt-8 flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: a.dot }} />
          <span className="text-xs" style={{ color: '#475569' }}>در حال توسعه — زود آماده می‌شود</span>
        </div>
      </div>
    </div>
  );
}
