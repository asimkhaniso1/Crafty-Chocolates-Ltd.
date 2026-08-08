import { BORDER_COPY } from '../copy';
import {
  BORDER_INSET_DEFAULT_PCT,
  BORDER_INSET_MAX_PCT,
  BORDER_INSET_MIN_PCT,
  BORDER_THICKNESS_DEFAULT_MM,
  BORDER_THICKNESS_MAX_MM,
  BORDER_THICKNESS_MIN_MM,
} from '../constraints';
import { useStudio } from '../state/StudioContext';

/**
 * Embossed border ring controls: on/off chips plus thickness and position
 * sliders. Shared between Step 2 (Design it) and the custom-shape brief;
 * the ring renders live on the piece preview.
 */
export default function BorderControl() {
  const { design, dispatch } = useStudio();
  const border = design.border;

  function setEnabled(enabled: boolean) {
    dispatch({
      type: 'SET_BORDER',
      border: enabled
        ? {
            thicknessMm: border?.thicknessMm ?? BORDER_THICKNESS_DEFAULT_MM,
            insetPct: border?.insetPct ?? BORDER_INSET_DEFAULT_PCT,
          }
        : undefined,
    });
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 font-sans">
        {(
          [
            [false, BORDER_COPY.toggleOff],
            [true, BORDER_COPY.toggleOn],
          ] as [boolean, string][]
        ).map(([on, label]) => {
          const active = Boolean(border) === on;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setEnabled(on)}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-bold rounded-full border transition-all ${
                active ? 'bg-choco text-cream border-choco' : 'border-choco/20 text-choco hover:border-gold'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-clay text-xs mt-2">{BORDER_COPY.note}</p>

      {border && (
        <div className="mt-4 max-w-sm space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-clay mb-2">
              {BORDER_COPY.thicknessLabel}
            </label>
            <input
              type="range"
              min={BORDER_THICKNESS_MIN_MM}
              max={BORDER_THICKNESS_MAX_MM}
              step={0.25}
              value={border.thicknessMm}
              onChange={e =>
                dispatch({
                  type: 'SET_BORDER',
                  border: { ...border, thicknessMm: parseFloat(e.target.value) },
                })
              }
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-[9px] uppercase tracking-[0.15em] font-bold text-clay/70">
              <span>{BORDER_COPY.thicknessHints[0]}</span>
              <span>{BORDER_COPY.thicknessHints[1]}</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-clay mb-2">
              {BORDER_COPY.insetLabel}
            </label>
            <input
              type="range"
              min={BORDER_INSET_MIN_PCT}
              max={BORDER_INSET_MAX_PCT}
              step={1}
              value={border.insetPct}
              onChange={e =>
                dispatch({
                  type: 'SET_BORDER',
                  border: { ...border, insetPct: parseFloat(e.target.value) },
                })
              }
              className="w-full accent-gold"
            />
            <div className="flex justify-between text-[9px] uppercase tracking-[0.15em] font-bold text-clay/70">
              <span>{BORDER_COPY.insetHints[0]}</span>
              <span>{BORDER_COPY.insetHints[1]}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
