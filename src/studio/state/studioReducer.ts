import type {
  CellAssignment,
  ChocolateType,
  Design,
  DesignExtras,
  EmbossStyle,
  LogoState,
  PackagingSelection,
  ProductKey,
  StudioStep,
} from '../types';
import { getPackagingOption } from '../data/packagingOptions';

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
  | { type: 'SET_EMBOSS'; emboss: EmbossStyle }
  | { type: 'SET_PACKAGING'; packaging: PackagingSelection }
  | { type: 'SET_CELL'; cell: CellAssignment }
  | { type: 'SET_ALL_CELLS'; cells: CellAssignment[] }
  | { type: 'SET_EXTRAS'; extras: Partial<DesignExtras> }
  | { type: 'SET_QUANTITY'; quantity: number }
  | { type: 'LOAD_DESIGN'; design: Design }
  | { type: 'RESET' }
  | { type: 'SET_STEP'; step: StudioStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' };

const MIN_STEP = 1;
const MAX_STEP = 8;

function buildCellsFromGrid(
  packagingType: string,
  chocolate: ChocolateType
): CellAssignment[] {
  const option = getPackagingOption(packagingType);
  if (!option || !option.grid) return [];
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

    case 'SET_EMBOSS':
      return { ...state, design: { ...state.design, emboss: action.emboss } };

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

    case 'SET_QUANTITY':
      return { ...state, design: { ...state.design, quantity: action.quantity } };

    case 'LOAD_DESIGN':
      return { ...state, design: action.design };

    case 'RESET':
      return { design: initialDesign, step: 1 };

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
