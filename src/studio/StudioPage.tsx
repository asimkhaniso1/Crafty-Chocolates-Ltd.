import { useEffect, useState, type ComponentType } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import {
  STUDIO_TITLE,
  STUDIO_SUBTITLE,
  STUDIO_BULK_BADGE,
  STEP_TITLES,
  NAV_LABELS,
  SAVE_SHARE_COPY,
} from './copy';
import type { StudioStep } from './types';
import { StudioProvider, useStudio } from './state/StudioContext';
import { loadDesign } from './lib/designStore';
import PreviewPane from './preview/PreviewPane';
import Step1Product from './steps/Step1Product';
import Step2Chocolate from './steps/Step2Chocolate';
import Step3Mark from './steps/Step3Mark';
import Step4Packaging from './steps/Step4Packaging';
import Step5Arrange from './steps/Step5Arrange';
import Step6Extras from './steps/Step6Extras';
import Step7Quote from './steps/Step7Quote';
import CustomBriefStep from './steps/CustomBriefStep';

const STEPS: StudioStep[] = [1, 2, 3, 4, 5, 6, 7];

const STEP_COMPONENTS: Record<StudioStep, ComponentType> = {
  1: Step1Product,
  2: Step2Chocolate,
  3: Step3Mark,
  4: Step4Packaging,
  5: Step5Arrange,
  6: Step6Extras,
  7: Step7Quote,
};

function StudioShell() {
  const { design, step, dispatch } = useStudio();

  useEffect(() => {
    document.title = `${STUDIO_TITLE} | Crafty Chocolates`;
    return () => {
      document.title = 'Crafty Chocolates — Custom Logo & Gift Chocolates, Handcrafted in Karachi, Pakistan';
    };
  }, []);

  const isCustom = design.product === 'custom';
  const maxVisitedStep = step;
  const CurrentStepComponent = STEP_COMPONENTS[step];

  return (
    <main className="pt-40 pb-32 md:pb-24 bg-cream min-h-screen">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-2xl mb-12">
          <span className="text-gold text-xs uppercase tracking-[0.3em] font-bold mb-4 block">
            Crafty Chocolates
          </span>
          <h1 className="text-[34px] md:text-[52px] font-black uppercase text-choco leading-[0.9] tracking-tighter mb-4">
            {STUDIO_TITLE.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="text-gold italic font-serif lowercase font-normal">
              {STUDIO_TITLE.split(' ').slice(-1)}
            </span>
          </h1>
          <p className="text-clay text-lg leading-relaxed font-medium">{STUDIO_SUBTITLE}</p>
          <span className="mt-4 inline-block text-[10px] uppercase tracking-[0.3em] font-bold text-gold border border-gold/30 px-3 py-1.5">
            {STUDIO_BULK_BADGE}
          </span>
        </div>

        {/* Stepper */}
        {!isCustom && (
          <nav className="hidden md:flex flex-wrap items-center gap-x-2 gap-y-3 mb-12 font-sans">
            {STEPS.map((s, i) => {
              const visited = s <= maxVisitedStep;
              const active = s === step;
              return (
                <div key={s} className="flex items-center">
                  <button
                    disabled={!visited}
                    onClick={() => visited && dispatch({ type: 'SET_STEP', step: s })}
                    className={`flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] font-bold transition-all ${
                      active
                        ? 'bg-choco text-cream'
                        : visited
                          ? 'text-choco hover:text-gold cursor-pointer'
                          : 'text-clay/40 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        active ? 'border-cream' : 'border-current'
                      }`}
                    >
                      {s}
                    </span>
                    {STEP_TITLES[s]}
                  </button>
                  {i < STEPS.length - 1 && <span className="text-choco/10 mx-1">/</span>}
                </div>
              );
            })}
          </nav>
        )}

        {isCustom ? (
          <div className="grid lg:grid-cols-[1fr_380px] gap-16">
            <CustomBriefStep />
            <div className="hidden lg:block sticky top-40 self-start h-[420px] rounded-sm overflow-hidden">
              <PreviewPane />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-16">
            <div>
              <CurrentStepComponent />

              <div className="hidden md:flex items-center justify-between mt-16 pt-8 border-t border-choco/10">
                <button
                  onClick={() => dispatch({ type: 'PREV_STEP' })}
                  disabled={step === 1}
                  className="text-[11px] uppercase tracking-[0.2em] font-bold text-choco disabled:text-clay/30 hover:text-gold transition-colors"
                >
                  &larr; {NAV_LABELS.back}
                </button>
                <button
                  onClick={() => dispatch({ type: 'NEXT_STEP' })}
                  disabled={step === 7}
                  className="bg-choco text-cream px-8 py-4 uppercase font-sans text-xs tracking-widest font-black hover:bg-gold transition-all disabled:opacity-30"
                >
                  {NAV_LABELS.next} &rarr;
                </button>
              </div>
            </div>

            <div className="hidden lg:block sticky top-40 self-start h-[420px] rounded-sm overflow-hidden">
              <PreviewPane />
            </div>
          </div>
        )}
      </div>

      {/* Mobile preview strip */}
      <div className="lg:hidden container mx-auto px-6 md:px-12 mt-12">
        <div className="h-40 rounded-sm overflow-hidden">
          <PreviewPane />
        </div>
      </div>

      {/* Mobile bottom bar */}
      {!isCustom && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream border-t border-choco/10 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => dispatch({ type: 'PREV_STEP' })}
            disabled={step === 1}
            className="text-[11px] uppercase tracking-[0.2em] font-bold text-choco disabled:text-clay/30"
          >
            &larr; {NAV_LABELS.back}
          </button>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold">
            {NAV_LABELS.step} {step} / 7
          </span>
          <button
            onClick={() => dispatch({ type: 'NEXT_STEP' })}
            disabled={step === 7}
            className="bg-choco text-cream px-5 py-2.5 uppercase font-sans text-[11px] tracking-widest font-black disabled:opacity-30"
          >
            {NAV_LABELS.next} &rarr;
          </button>
        </div>
      )}
    </main>
  );
}

function SharedDesignLoader() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { dispatch } = useStudio();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    if (!shareToken) {
      navigate('/studio', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      const result = await loadDesign(shareToken);
      if (cancelled) return;
      if ('error' in result) {
        setStatus('error');
        setTimeout(() => {
          if (!cancelled) navigate('/studio', { replace: true });
        }, 1800);
        return;
      }
      dispatch({ type: 'LOAD_DESIGN', design: result.design });
      dispatch({ type: 'SET_STEP', step: 7 });
      navigate('/studio', { replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [shareToken, dispatch, navigate]);

  return (
    <main className="pt-40 pb-32 bg-cream min-h-screen flex items-center justify-center">
      <p className="text-clay font-semibold text-sm">
        {status === 'loading' ? SAVE_SHARE_COPY.loadingDesign : SAVE_SHARE_COPY.loadError}
      </p>
    </main>
  );
}

export default function StudioPage() {
  return (
    <StudioProvider>
      <Routes>
        <Route path="d/:shareToken" element={<SharedDesignLoader />} />
        <Route path="*" element={<StudioShell />} />
      </Routes>
    </StudioProvider>
  );
}
