import { useId, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { CellAssignment, ChocolateType, Design } from '../types';
import StudioDefs, { embossFilterId, gradientId, highlightId } from './embossFilters';

export interface ChocolatePreviewProps {
  design: Design;
  cell?: CellAssignment;
  size?: number;
  /** Piece shape; defaults to the design's product shape. */
  shape?: 'square' | 'rectangle';
}

const RADIUS_RATIO = 0.12;

function bodyFor(design: Design, cell?: CellAssignment): ChocolateType {
  return cell?.chocolate ?? design.chocolate;
}

function ChocolateBody({
  w,
  h,
  r,
  type,
  uid,
}: {
  w: number;
  h: number;
  r: number;
  type: ChocolateType;
  uid: string;
}) {
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={r} ry={r} fill={`url(#${gradientId(type, uid)})`} />
      <rect x={0} y={0} width={w} height={h} rx={r} ry={r} fill={`url(#${highlightId(uid)})`} />
    </g>
  );
}

/** Subtle built-in diamond/quilt pattern, embossed onto the surface. */
function QuiltPattern({ w, h, uid, filter }: { w: number; h: number; uid: string; filter: string }) {
  const step = Math.min(w, h) / 5;
  const lines: ReactNode[] = [];
  for (let x = -h; x < w + h; x += step) {
    lines.push(
      <line key={`a-${x}`} x1={x} y1={0} x2={x + h} y2={h} stroke="#000" strokeWidth={1} />,
      <line key={`b-${x}`} x1={x} y1={h} x2={x + h} y2={0} stroke="#000" strokeWidth={1} />
    );
  }
  return (
    <g filter={`url(#${filter})`} opacity={0.9}>
      <clipPath id={`studio-quilt-clip-${uid}`}>
        <rect x={0} y={0} width={w} height={h} />
      </clipPath>
      <g clipPath={`url(#studio-quilt-clip-${uid})`}>{lines}</g>
    </g>
  );
}

/**
 * Renders one chocolate piece as a 2.5D SVG illustration: gradient body,
 * beveled edge, and the active mark (logo / text / pattern) with the
 * selected emboss/deboss/gold/silver filter applied.
 */
export default function ChocolatePreview({ design, cell, size = 220, shape }: ChocolatePreviewProps) {
  const rawUid = useId();
  const uid = rawUid.replace(/[^a-zA-Z0-9]/g, '');
  const isBar = shape === 'rectangle' || (!shape && design.product === 'bar');
  const w = isBar ? size : size;
  const h = isBar ? size * 0.5 : size;
  const r = Math.min(w, h) * RADIUS_RATIO;
  const type = bodyFor(design, cell);
  const filter = embossFilterId(type, uid);
  const content = cell?.content ?? (design.logo ? 'logo' : 'pattern');
  const pad = Math.min(w, h) * 0.14;

  // Bar caption: an embossed serif line beneath the mark on the bar face.
  const caption = !cell && design.product === 'bar' ? design.barCaption?.trim() : undefined;
  const logoCenterY = caption ? h * 0.42 : h / 2;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Chocolate piece preview"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <StudioDefs uid={uid} />
        <filter id={`studio-dropshadow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy={h * 0.05} stdDeviation={h * 0.05} floodColor="#2D1E17" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={`url(#studio-dropshadow-${uid})`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.g
            key={type}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            <ChocolateBody w={w} h={h} r={r} type={type} uid={uid} />
          </motion.g>
        </AnimatePresence>

        {/* Beveled edge illusion */}
        <rect
          x={0.75}
          y={0.75}
          width={w - 1.5}
          height={h - 1.5}
          rx={r}
          ry={r}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1.2}
        />
        <rect
          x={1.5}
          y={1.5}
          width={w - 3}
          height={h - 3}
          rx={Math.max(r - 1, 0)}
          ry={Math.max(r - 1, 0)}
          fill="none"
          stroke="rgba(0,0,0,0.25)"
          strokeWidth={1.2}
        />

        {content === 'logo' && design.logo?.maskDataUrl && (
          <image
            href={design.logo.maskDataUrl}
            x={w / 2 - (w * 0.5 * design.logo.scale) / 2}
            y={logoCenterY - (h * 0.5 * design.logo.scale) / 2}
            width={w * 0.5 * design.logo.scale}
            height={h * 0.5 * design.logo.scale}
            preserveAspectRatio="xMidYMid meet"
            filter={`url(#${filter})`}
          />
        )}

        {caption && (
          <text
            x={w / 2}
            y={h * 0.8}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Cormorant Garamond', serif"
            fontStyle="italic"
            fontSize={Math.min(h * 0.12, ((w - pad * 2) / Math.max(6, caption.length)) * 1.6)}
            fill="#000"
            filter={`url(#${filter})`}
          >
            {caption}
          </text>
        )}

        {(content === 'message' || content === 'initials') && (
          <text
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Cormorant Garamond', serif"
            fontStyle="italic"
            fontSize={content === 'initials' ? h * 0.32 : Math.min(h * 0.16, (w - pad * 2) / Math.max(1, (cell?.text ?? 'A').length) * 1.6)}
            fill="#000"
            filter={`url(#${filter})`}
          >
            {cell?.text || (content === 'initials' ? 'AB' : 'Made with love')}
          </text>
        )}

        {content === 'pattern' && <QuiltPattern w={w} h={h} uid={uid} filter={filter} />}
      </g>
    </svg>
  );
}
