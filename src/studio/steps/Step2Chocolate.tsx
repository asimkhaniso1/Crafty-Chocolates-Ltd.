import { STEP_TITLES, STEP_SUBTITLES, CHOCOLATE_NAMES, CHOCOLATE_DESCRIPTIONS } from '../copy';
import type { ChocolateType } from '../types';
import { useStudio } from '../state/StudioContext';

const CHOCOLATE_SWATCHES: { key: ChocolateType; color: string }[] = [
  { key: 'milk', color: '#8B5A2B' },
  { key: 'dark', color: '#2D1E17' },
  { key: 'white', color: '#F3E5D8' },
  { key: 'mixed', color: 'linear-gradient(135deg, #8B5A2B 50%, #F3E5D8 50%)' },
];

export default function Step2Chocolate() {
  const { design, dispatch } = useStudio();

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[2]}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{STEP_SUBTITLES[2]}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {CHOCOLATE_SWATCHES.map(swatch => {
          const active = design.chocolate === swatch.key;
          return (
            <button
              key={swatch.key}
              onClick={() => dispatch({ type: 'SET_CHOCOLATE', chocolate: swatch.key })}
              className={`text-left border p-4 transition-all ${
                active ? 'border-choco' : 'border-choco/15 hover:border-gold'
              }`}
            >
              <div
                className="w-full aspect-square rounded-full mb-4 border border-choco/10"
                style={{ background: swatch.color }}
              />
              <h3 className="font-black uppercase tracking-tight text-sm text-choco">
                {CHOCOLATE_NAMES[swatch.key]}
              </h3>
              <p className="text-xs text-clay mt-1">{CHOCOLATE_DESCRIPTIONS[swatch.key]}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
