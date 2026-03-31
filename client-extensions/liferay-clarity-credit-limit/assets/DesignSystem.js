import React from 'react';

/**
 * Design System for Liferay Clarity Credit Limit
 * Contains Icons, UI Primitives, and Layout Components
 */

const h = React.createElement;

export const Icons = {
  Wallet: ({ size = 20, color = 'currentColor' }) => 
    h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', style: { display: 'inline-block', verticalAlign: 'middle' } },
      h('path', { d: 'M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1' }),
      h('path', { d: 'M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4' })
    ),
  TrendingUp: ({ size = 16, color = '#2563eb' }) => 
    h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('polyline', { points: '22 7 13.5 15.5 8.5 10.5 2 17' }),
      h('polyline', { points: '16 7 22 7 22 13' })
    ),
  RefreshCw: ({ size = 20, spinning = false }) => 
    h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: '#94a3b8', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className: spinning ? 'animate-spin' : '' },
      h('path', { d: 'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' }),
      h('path', { d: 'M21 3v5h-5' }),
      h('path', { d: 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' }),
      h('path', { d: 'M3 21v-5h5' })
    ),
  Building2: ({ size = 96 }) => 
    h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('path', { d: 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z' }),
      h('path', { d: 'M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2' }),
      h('path', { d: 'M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2' }),
      h('path', { d: 'M10 6h4' }), h('path', { d: 'M10 10h4' }), h('path', { d: 'M10 14h4' }), h('path', { d: 'M10 18h4' })
    ),
  Loader: ({ size = 40 }) => 
    h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: '#2563eb', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className: 'animate-spin' },
      h('path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' })
    ),
  AlertCircle: ({ size = 48 }) => 
    h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: '#f87171', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
      h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' })
    )
};

export const calculateChartData = (history) => {
  if (!history || history.length < 2) return null;
  const paddingL = 70, paddingR = 40, paddingT = 40, paddingB = 40;
  const width = 600, height = 300;
  const values = history.map(item => item.creditLimit || 0);
  const minVal = Math.min(...values) * 0.95;
  const maxVal = Math.max(...values) * 1.05;
  const range = maxVal - minVal || 1;
  const points = history.map((item, i) => ({
    x: (i / (history.length - 1)) * (width - paddingL - paddingR) + paddingL,
    y: height - (((item.creditLimit - minVal) / range) * (height - paddingT - paddingB) + paddingB),
    value: item.creditLimit,
    accountName: item.accountName || null,
    label: new Date(item.date || item.modifiedDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }));
  const yLabels = [0, 1, 2, 3].map(i => ({
    val: maxVal - (i * (range / 3)),
    yPos: paddingT + i * ((height - paddingT - paddingB) / 3)
  }));
  const linePath = points.map((p, i) => (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y).join(' ');
  const areaPath = linePath + ' V ' + (height - paddingB) + ' H ' + paddingL + ' Z';
  return { points, yLabels, linePath, areaPath, width, height, paddingL, paddingR };
};

export const UI = {
  PageLayout: ({ header, children }) => 
    h('div', { style: { padding: '0 2rem', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' } },
      h('div', { style: { maxWidth: '80rem', margin: '0 auto', display: 'flex', flexDirection: 'column' } },
        header,
        children
      )
    ),

  Header: (props) => h('div', { className: 'flex items-center justify-between', style: { marginBottom: '0' } },
    h('h1', { className: 'text-2xl font-bold text-slate-800 flex items-center gap-2' },
      h('div', { className: 'p-2 bg-blue-600 rounded-lg', style: { padding: '0.5rem', marginRight: '0.5rem' } }, h(Icons.Wallet, { color: 'white' }))
    )
  ),

  LoadingState: () => 
    h('div', { style: { textAlign: 'center', padding: '5rem', backgroundColor: 'white', borderRadius: '1.5rem' } }, 
      h(Icons.Loader, null), 
      h('p', { style: { marginTop: '1rem', color: '#94a3b8', fontWeight: 700 } }, 'AGGREGATING HISTORY...')
    ),

  ErrorState: ({ message }) => 
    h('div', { style: { textAlign: 'center', padding: '3rem', border: '2px dashed #e2e8f0', borderRadius: '1.5rem', backgroundColor: 'white' } },
      h(Icons.AlertCircle, null),
      h('h3', { style: { color: '#1e293b', marginTop: '1rem' } }, 'No Data Available'), 
      h('p', { style: { color: '#64748b' } }, message)
    ),

  EmptyState: () => 
    h('div', { style: { textAlign: 'center', padding: '5rem', backgroundColor: 'white', borderRadius: '1.5rem' } },
      h('p', { style: { color: '#94a3b8', fontWeight: 500 } }, 'Ready to analyze account history.')
    ),

  Dashboard: ({ chartData, hoveredIndex, setHoveredIndex, lastUpdated, latest, accountErc, accountName, onRefresh, loading }) => 
    h('div', { style: { display: 'flex', flexWrap: 'wrap', backgroundColor: 'white', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', marginTop: '0' } },
      /* Left: Chart */
      h('div', { style: { flex: '2', padding: '2.5rem', minWidth: '450px', borderRight: '1px solid #f1f5f9' } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } },
            h(Icons.TrendingUp, null), 
            h('h3', { style: { fontSize: '24px', fontWeight: 700, color: '#334155' } }, '10-ENTRY LIMIT TREND')
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' } },
            h('span', { style: { fontSize: '14px', color: '#94a3b8', fontWeight: 500 } }, 'LAST UPDATED: ' + lastUpdated),
            h('button', { 
              onClick: onRefresh,
              style: { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }
            }, h(Icons.RefreshCw, { spinning: loading, size: 16 }))
          )
        ),
        chartData && h('div', { style: { height: '300px' } },
          h('svg', { viewBox: `0 0 ${chartData.width} ${chartData.height}`, style: { width: '100%', height: '100%', overflow: 'visible' } },
            h('defs', null, h('linearGradient', { id: 'g', x1: '0', y1: '0', x2: '0', y2: '1' }, h('stop', { offset: '0%', stopColor: '#2563eb', stopOpacity: '0.2' }), h('stop', { offset: '100%', stopColor: '#2563eb', stopOpacity: '0' }))),
            chartData.yLabels.map((l, i) => h('g', { key: i },
              h('line', { x1: chartData.paddingL, y1: l.yPos, x2: chartData.width - chartData.paddingR, y2: l.yPos, stroke: '#f1f5f9' }),
              h('text', { x: chartData.paddingL - 10, y: l.yPos + 4, textAnchor: 'end', fontSize: '11', fill: '#94a3b8' }, Math.round(l.val).toLocaleString())
            )),
            h('path', { d: chartData.areaPath, fill: 'url(#g)' }),
            h('path', { d: chartData.linePath, fill: 'none', stroke: '#2563eb', strokeWidth: '3' }),
            chartData.points.map((p, i) => h('g', { 
              key: i, 
              onMouseEnter: () => setHoveredIndex(i), 
              onMouseLeave: () => setHoveredIndex(null) 
            },
              h('circle', { cx: p.x, cy: p.y, r: hoveredIndex === i ? 6 : 4, fill: hoveredIndex === i ? '#2563eb' : 'white', stroke: '#2563eb', strokeWidth: '2', style: { cursor: 'pointer', transition: 'all 0.2s' } }),
              i % 2 === 0 && h('text', { x: p.x, y: 295, textAnchor: 'middle', fontSize: '11', fill: '#94a3b8', fontWeight: 'bold' }, p.label)
            )),
            hoveredIndex !== null && h('g', { transform: `translate(${chartData.points[hoveredIndex].x - 60}, ${chartData.points[hoveredIndex].y - 55})` },
              h('rect', { width: '120', height: '45', rx: '8', fill: '#1e293b' }),
              h('text', { x: '60', y: '18', textAnchor: 'middle', fill: '#94a3b8', fontSize: '9', fontWeight: 'bold' }, chartData.points[hoveredIndex].accountName || accountName || ''),
              h('text', { x: '60', y: '34', textAnchor: 'middle', fill: 'white', fontSize: '11', fontWeight: 'bold' }, '$' + chartData.points[hoveredIndex].value.toLocaleString())
            )
          )
        )
      ),
      /* Right: Standing Card */
      h(UI.StandingCard, { entry: latest, accountErc, accountName })
    ),

  StandingCard: ({ entry, accountErc, accountName }) => 
    h('div', { style: { flex: '1', padding: '2.5rem', backgroundColor: 'var(--color-brand-primary)', color: 'white', position: 'relative', minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
      h('div', { style: { position: 'absolute', top: 0, right: 0, padding: '2rem', opacity: 0.1 } }, h(Icons.Building2, { size: 96 })),
      h('div', { style: { display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 10 } },
        h('div', null,
          h('span', { style: { fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', color: '#60a5fa', letterSpacing: '0.1em' } }, 'Current Standing'),
          h('h2', { style: { fontSize: '2.5rem', fontWeight: 700, margin: '0.25rem 0' } }, accountName || entry.accountName || accountErc)
        ),
        h('div', { style: { padding: '0.1rem 1.1rem', fontSize: '10px', fontWeight: 'bold'} }, 'STABLE')
      ),
      h('div', { style: { marginTop: '2.5rem', position: 'relative', zIndex: 10 } },
        h('p', { style: { color: '#94a3b8', fontSize: '18px', fontWeight: 700, textTransform: 'uppercase' } }, 'Effective Credit Limit'),
        h('div', { style: { fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.02em' } }, 
          new Intl.NumberFormat('en-US', { style: 'currency', currency: entry.currency || 'USD' }).format(entry.creditLimit)
        )
      )
    )
};