import { useId } from 'react';
import { motion } from 'motion/react';
import type { Design } from '../types';
import { getPackagingOption } from '../data/packagingOptions';
import ChocolatePreview from './ChocolatePreview';

export interface BoxPreviewProps {
  design: Design;
}

/**
 * Top-down open box: outer tray in extras.boxColour, a lighter inner tray,
 * a CSS grid of mini chocolate pieces per the packaging grid, and a ribbon
 * cross rendered in SVG over the top.
 */
export default function BoxPreview({ design }: BoxPreviewProps) {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9]/g, '');
  const option = design.packaging ? getPackagingOption(design.packaging.type) : undefined;

  const boxColour = design.extras.boxColour || '#2D1E17';
  const ribbonColour = design.extras.ribbon || '#1A1A1A';
  const foilColour =
    design.extras.foil === 'gold' ? '#C9A24B' : design.extras.foil === 'silver' ? '#C0C0C4' : undefined;

  if (!option || !option.grid || option.count <= 1) {
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className="relative flex items-center justify-center rounded-[10%] p-[8%] shadow-[0_18px_40px_rgba(45,30,23,0.35)]"
          style={{ background: boxColour, width: '78%', aspectRatio: '1 / 1' }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-[6%] bg-cream/5 p-[10%]">
            <ChocolatePreview design={design} size={220} />
          </div>
          {foilColour && (
            <div
              className="pointer-events-none absolute inset-0 rounded-[10%]"
              style={{
                background: `linear-gradient(135deg, ${foilColour}55, transparent 60%)`,
                boxShadow: `inset 0 0 0 2px ${foilColour}99`,
              }}
            />
          )}
        </div>
      </div>
    );
  }

  const { rows, cols } = option.grid;
  const cells = Array.from({ length: option.count }, (_, i) => {
    const found = design.cells.find(c => c.index === i);
    return (
      found ?? {
        index: i,
        content: design.logo ? ('logo' as const) : ('pattern' as const),
        chocolate: design.chocolate,
      }
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex h-full w-full items-center justify-center"
    >
      <div
        className="relative rounded-[4%] p-[4%] shadow-[0_20px_46px_rgba(45,30,23,0.4)]"
        style={{ background: boxColour, width: '92%', aspectRatio: `${cols} / ${rows}` }}
      >
        {/* Inner tray */}
        <div
          className="grid h-full w-full gap-[4%] rounded-[3%] p-[5%]"
          style={{
            background: 'linear-gradient(135deg, rgba(253,251,247,0.14), rgba(253,251,247,0.04))',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {cells.map(cell => (
            <div key={cell.index} className="flex items-center justify-center">
              <ChocolatePreview design={design} cell={cell} size={140} />
            </div>
          ))}
        </div>

        {/* Ribbon cross */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id={`studio-ribbon-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={ribbonColour} stopOpacity="0.95" />
              <stop offset="50%" stopColor={ribbonColour} stopOpacity="0.75" />
              <stop offset="100%" stopColor={ribbonColour} stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect x="46" y="0" width="8" height="100" fill={`url(#studio-ribbon-${uid})`} opacity={0.85} />
          <rect x="0" y="46" width="100" height="8" fill={`url(#studio-ribbon-${uid})`} opacity={0.85} />
          {/* Bow hint at the crossing */}
          <g transform="translate(50,50)">
            <ellipse cx="-9" cy="-4" rx="9" ry="6" fill={ribbonColour} opacity={0.9} transform="rotate(-25)" />
            <ellipse cx="9" cy="-4" rx="9" ry="6" fill={ribbonColour} opacity={0.9} transform="rotate(25)" />
            <ellipse cx="-9" cy="4" rx="9" ry="6" fill={ribbonColour} opacity={0.9} transform="rotate(25)" />
            <ellipse cx="9" cy="4" rx="9" ry="6" fill={ribbonColour} opacity={0.9} transform="rotate(-25)" />
            <circle r="4.5" fill={ribbonColour} />
            <circle r="2" fill="#FDFBF7" opacity={0.5} />
          </g>
          {design.extras.waxSeal && (
            <g transform="translate(50,18)">
              <circle r="6" fill="#8B1E24" />
              <circle r="6" fill="none" stroke="#5c1216" strokeWidth="0.6" />
              <circle r="2.4" fill="#A6323A" />
            </g>
          )}
        </svg>
      </div>
    </motion.div>
  );
}
