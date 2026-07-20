import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import {
  studioReducer,
  initialStudioState,
  type StudioAction,
  type StudioState,
} from './studioReducer';
import type { Design } from '../types';
import { MAX_DESIGN_JSON_BYTES } from '../constraints';
import { sanitizeDesign } from './sanitizeDesign';

const STORAGE_KEY = 'crafty-studio-design-v1';
const PERSIST_DEBOUNCE_MS = 400;

interface StudioContextValue {
  design: StudioState['design'];
  step: StudioState['step'];
  dispatch: Dispatch<StudioAction>;
  /**
   * DOM node of the "primary" (non-compact) PreviewPane instance, attached
   * by PreviewPane itself. Used by Step7Quote to capture an arrangement
   * snapshot image for the quote — nothing else should rely on this ref.
   */
  previewRef: MutableRefObject<HTMLDivElement | null>;
}

const StudioContext = createContext<StudioContextValue | null>(null);

function loadPersistedDesign(): Design | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Design>;
    if (parsed && parsed.v === 1) {
      return sanitizeDesign(parsed as Design);
    }
    return null;
  } catch {
    return null;
  }
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(studioReducer, initialStudioState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const design = loadPersistedDesign();
    if (design) {
      dispatch({ type: 'LOAD_DESIGN', design });
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        const json = JSON.stringify(state.design);
        if (json.length <= MAX_DESIGN_JSON_BYTES) {
          window.localStorage.setItem(STORAGE_KEY, json);
        }
      } catch {
        // Ignore persistence failures (e.g. storage disabled/full).
      }
    }, PERSIST_DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.design]);

  return (
    <StudioContext.Provider value={{ design: state.design, step: state.step, dispatch, previewRef }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error('useStudio must be used within a StudioProvider');
  return ctx;
}
