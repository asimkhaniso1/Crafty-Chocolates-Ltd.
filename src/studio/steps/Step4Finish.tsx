import { STEP_TITLES, STEP_SUBTITLES, EMBOSS_NAMES, EMBOSS_DESCRIPTIONS } from '../copy';
import type { EmbossStyle } from '../types';
import { useStudio } from '../state/StudioContext';

const EMBOSS_STYLES: EmbossStyle[] = ['emboss', 'deboss', 'gold', 'silver'];

const SWATCH_COLORS: Partial<Record<EmbossStyle, string>> = {
  gold: '#C9A24B',
  silver: '#C0C0C4',
};

export default function Step4Finish() {
  const { design, dispatch } = useStudio();

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[4]}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{STEP_SUBTITLES[4]}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {EMBOSS_STYLES.map(style => {
          const active = design.emboss === style;
          const swatch = SWATCH_COLORS[style];
          return (
            <button
              key={style}
              onClick={() => dispatch({ type: 'SET_EMBOSS', emboss: style })}
              className={`text-left p-6 border transition-all ${
                active ? 'border-choco bg-choco text-cream' : 'border-choco/15 hover:border-gold'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-full aspect-square rounded-full border ${
                    active ? 'border-cream/20' : 'border-choco/10'
                  } flex items-center justify-center`}
                  style={{
                    background: swatch
                      ? swatch
                      : active
                        ? 'rgba(245, 235, 220, 0.15)'
                        : 'rgba(45, 30, 23, 0.08)',
                  }}
                >
                  <span
                    className="block w-1/2 h-1/2 rounded-full"
                    style={{
                      boxShadow: swatch
                        ? 'inset 0 2px 4px rgba(0,0,0,0.35), 0 1px 1px rgba(255,255,255,0.4)'
                        : style === 'emboss'
                          ? 'inset 0 -2px 3px rgba(0,0,0,0.25), 0 2px 3px rgba(255,255,255,0.15)'
                          : 'inset 0 2px 3px rgba(0,0,0,0.3)',
                      background: swatch ?? 'currentColor',
                      opacity: swatch ? 1 : 0.25,
                    }}
                  />
                </div>
              </div>
              <h3 className="font-black uppercase tracking-tight text-sm">
                {EMBOSS_NAMES[style]}
              </h3>
              <p className={`text-xs mt-1 ${active ? 'text-cream/70' : 'text-clay'}`}>
                {EMBOSS_DESCRIPTIONS[style]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
