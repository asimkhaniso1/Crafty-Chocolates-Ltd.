import { useId } from 'react';
import { motion } from 'motion/react';
import type { CellAssignment, ChocolateType, Design, PackagingOption } from '../types';
import { getPackagingOption } from '../data/packagingOptions';
import ChocolatePreview from './ChocolatePreview';
import CenterBarFace from './CenterBarFace';

export interface BoxPreviewProps {
  design: Design;
}

/** Assorted molded shapes ring the X+1 center bar; cycle chocolates for variety. */
const ASSORTED_CYCLE: ChocolateType[] = ['milk', 'dark', 'semidark', 'dark'];

function assortedCell(index: number): CellAssignment {
  return { index, content: 'pattern', chocolate: ASSORTED_CYCLE[index % ASSORTED_CYCLE.length] };
}

/**
 * Real product photo with the customer's center bar composited over the
 * overlay rect — a subtle soft-light blend and drop shadow settle it into
 * the photographed box.
 */
function PhotoBoxPreview({ design, option }: { design: Design; option: PackagingOption }) {
  const overlay = option.overlay!;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex h-full w-full items-center justify-center"
    >
      <div className="relative w-full overflow-hidden rounded-md shadow-[0_20px_46px_rgba(45,30,23,0.4)]">
        <img src={option.photo} alt={option.name} className="block h-auto w-full" />
        <div
          className="absolute"
          style={{
            left: `${overlay.x}%`,
            top: `${overlay.y}%`,
            width: `${overlay.w}%`,
            height: `${overlay.h}%`,
            filter: 'drop-shadow(0 4px 10px rgba(31,15,8,0.5))',
          }}
        >
          <CenterBarFace design={design} />
          {/* Pick up the photo's lighting so the bar sits naturally */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              mixBlendMode: 'soft-light',
              borderRadius: '7%',
              background:
                'radial-gradient(120% 120% at 40% 25%, rgba(255,255,255,0.55), transparent 60%), linear-gradient(160deg, transparent 55%, rgba(31,15,8,0.5))',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/** Drawn fallback for X+1 boxes without a photo: assorted ring + centered bar. */
function DrawnCenterBarPreview({ design, option }: { design: Design; option: PackagingOption }) {
  const boxColour = design.extras.boxColour || '#2D1E17';
  const { rows, cols } = option.grid ?? { rows: 2, cols: 2 };
  const cells = Array.from({ length: option.count }, (_, i) => assortedCell(i));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex h-full w-full items-center justify-center"
    >
      <div
        className="relative rounded-[4%] p-[4%] shadow-[0_20px_46px_rgba(45,30,23,0.4)]"
        style={{ background: boxColour, width: '92%', aspectRatio: '1 / 1' }}
      >
        <div
          className="grid h-full w-full gap-[4%] rounded-[3%] p-[5%]"
          style={{
            background: 'linear-gradient(135deg, rgba(253,251,247,0.14), rgba(253,251,247,0.04))',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {cells.map(cell => (
            <div key={cell.index} className="flex items-center justify-center opacity-90">
              <ChocolatePreview design={design} cell={cell} size={110} />
            </div>
          ))}
        </div>
        {/* The message bar rides on top of the assorted layer, centred */}
        <div
          className="absolute left-1/2 top-1/2 z-10 aspect-square w-[54%] -translate-x-1/2 -translate-y-1/2"
          style={{ filter: 'drop-shadow(0 8px 18px rgba(31,15,8,0.55))' }}
        >
          <CenterBarFace design={design} />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Top-down open box: outer tray in extras.boxColour, a lighter inner tray,
 * a CSS grid of mini chocolate pieces per the packaging grid, and a ribbon
 * cross rendered in SVG over the top. X+1 boxes render either a real photo
 * composite or a drawn assorted-ring fallback.
 */
export default function BoxPreview({ design }: BoxPreviewProps) {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9]/g, '');
  const option = design.packaging ? getPackagingOption(design.packaging.type) : undefined;

  const boxColour = design.extras.boxColour || '#2D1E17';
  const ribbonColour = design.extras.ribbon || '#1A1A1A';
  const foilColour =
    design.extras.foil === 'gold' ? '#C9A24B' : design.extras.foil === 'silver' ? '#C0C0C4' : undefined;

  if (option?.centerBar) {
    return option.photo && option.overlay ? (
      <PhotoBoxPreview design={design} option={option} />
    ) : (
      <DrawnCenterBarPreview design={design} option={option} />
    );
  }

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
