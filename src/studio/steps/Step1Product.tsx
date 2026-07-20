import { STEP_TITLES, STEP_SUBTITLES } from '../copy';
import { STUDIO_PRODUCTS } from '../data/studioProducts';
import { useStudio } from '../state/StudioContext';

export default function Step1Product() {
  const { design, dispatch } = useStudio();

  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-black uppercase text-choco tracking-tighter mb-3">
        {STEP_TITLES[1]}
      </h2>
      <p className="text-clay font-medium mb-10 max-w-lg">{STEP_SUBTITLES[1]}</p>

      <div className="grid sm:grid-cols-2 gap-6">
        {STUDIO_PRODUCTS.map(product => {
          const active = design.product === product.key;
          return (
            <button
              key={product.key}
              onClick={() => dispatch({ type: 'SET_PRODUCT', product: product.key })}
              className={`text-left p-6 border transition-all ${
                active ? 'border-choco bg-choco text-cream' : 'border-choco/15 hover:border-gold'
              }`}
            >
              <h3 className="font-black uppercase tracking-tight text-lg mb-1">{product.name}</h3>
              <p className={`text-sm mb-4 ${active ? 'text-cream/70' : 'text-clay'}`}>{product.tagline}</p>
              <div
                className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                  active ? 'text-gold' : 'text-gold'
                }`}
              >
                {product.dims}
                {product.weightG > 0 ? ` · ${product.weightG}g` : ''}
                {product.thicknessMm ? ` · ${product.thicknessMm / 10} cm` : ''}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
