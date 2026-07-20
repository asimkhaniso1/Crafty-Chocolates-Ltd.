import type {
  CellAssignment,
  ChocolateType,
  Design,
  DesignExtras,
  LogoState,
  PackagingSelection,
  ProductKey,
  StudioStep,
} from '../types';
import { getPackagingOption } from '../data/packagingOptions';
import { sanitizeDesign } from './sanitizeDesign';

export interface StudioState {
  design: Design;
  step: StudioStep;
}

export const initialDesign: Design = {
  v: 1,
  product: null,
  chocolate: 'milk',
  logo: null,
  emboss: 'emboss',
  packaging: null,
  cells: [],
  extras: {},
  quantity: 50,
};

export const initialStudioState: StudioState = {
  design: initialDesign,
  step: 1,
};

export type StudioAction =
  | { type: 'SET_PRODUCT'; product: ProductKey }
  | { type: 'SET_CHOCOLATE'; chocolate: ChocolateType }
  | { type: 'SET_LOGO'; logo: LogoState }
  | { type: 'CLEAR_LOGO' }
  | { type: 'SET_PACKAGING'; packaging: PackagingSelection }
  | { type: 'SET_CELL'; cell: CellAssignment }
  | { type: 'SET_ALL_CELLS'; cells: CellAssignment[] }
  | { type: 'SET_EXTRAS'; extras: Partial<DesignExtras> }
  | { type: 'SET_BAR_CAPTION'; barCaption?: string }
  | { type: 'SET_CENTER_BAR_SCALE'; scale: number }
  | { type: 'SET_QUANTITY'; quantity: number }
  | { type: 'LOAD_DESIGN'; design: Design }
  | { type: 'RESET' }
  | { type: 'BACK_TO_PRODUCTS' }
  | { type: 'SET_STEP'; step: StudioStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' };

const MIN_STEP = 1;
const MAX_STEP = 7;

function buildCellsFromGrid(
  packagingType: string,
  chocolate: ChocolateType
): CellAssignment[] {
  const option = getPackagingOption(packagingType);
  // X+1 boxes carry assorted (non-customizable) pieces around the center bar,
  // so no per-cell assignments exist for them.
  if (!option || !option.grid || option.centerBar) return [];
  const total = option.grid.rows * option.grid.cols;
  return Array.from({ length: total }, (_, index) => ({
    index,
    content: 'logo',
    chocolate,
  }));
}

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'SET_PRODUCT':
      return { ...state, design: { ...state.design, product: action.product } };

    case 'SET_CHOCOLATE':
      return { ...state, design: { ...state.design, chocolate: action.chocolate } };

    case 'SET_LOGO':
      return { ...state, design: { ...state.design, logo: action.logo } };

    case 'CLEAR_LOGO':
      return { ...state, design: { ...state.design, logo: null } };

    case 'SET_PACKAGING': {
      const cells = buildCellsFromGrid(action.packaging.type, state.design.chocolate);
      return {
        ...state,
        design: { ...state.design, packaging: action.packaging, cells },
      };
    }

    case 'SET_CELL': {
      const cells = state.design.cells.map(c =>
        c.index === action.cell.index ? action.cell : c
      );
      return { ...state, design: { ...state.design, cells } };
    }

    case 'SET_ALL_CELLS':
      return { ...state, design: { ...state.design, cells: action.cells } };

    case 'SET_EXTRAS':
      return {
        ...state,
        design: { ...state.design, extras: { ...state.design.extras, ...action.extras } },
      };

    case 'SET_BAR_CAPTION': {
      const barCaption = action.barCaption?.trim() ? action.barCaption : undefined;
      return { ...state, design: { ...state.design, barCaption } };
    }

    case 'SET_CENTER_BAR_SCALE':
      return { ...state, design: { ...state.design, centerBarScale: action.scale } };

    case 'SET_QUANTITY':
      return { ...state, design: { ...state.design, quantity: action.quantity } };

    case 'LOAD_DESIGN':
      return { ...state, design: sanitizeDesign(action.design) };

    case 'RESET':
      return { design: initialDesign, step: 1 };

    case 'BACK_TO_PRODUCTS':
      return { ...state, design: { ...state.design, product: null }, step: 1 };

    case 'SET_STEP':
      return { ...state, step: Math.min(MAX_STEP, Math.max(MIN_STEP, action.step)) as StudioStep };

    case 'NEXT_STEP':
      return { ...state, step: Math.min(MAX_STEP, state.step + 1) as StudioStep };

    case 'PREV_STEP':
      return { ...state, step: Math.max(MIN_STEP, state.step - 1) as StudioStep };

    default:
      return state;
  }
}
