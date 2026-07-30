import type {
  BoxMix,
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

export const MIN_STEP: StudioStep = 1;
export const MAX_STEP: StudioStep = 4;

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
  boxMix: 'single',
};

export const initialStudioState: StudioState = {
  design: initialDesign,
  step: 1,
};

export type StudioAction =
  | { type: 'SELECT_CATALOG_ITEM'; product: ProductKey; packaging: PackagingSelection | null }
  | { type: 'SET_CHOCOLATE'; chocolate: ChocolateType }
  | { type: 'SET_LOGO'; logo: LogoState }
  | { type: 'CLEAR_LOGO' }
  | { type: 'SET_BOX_MIX'; boxMix: BoxMix }
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

/**
 * Builds a box's cell assignments from its grid. When `boxMix` is 'mixed'
 * each cell alternates milk/semi-dark by index, independent of the design's
 * chosen `chocolate`; otherwise every cell uses `chocolate` ('single', the
 * default).
 */
function buildCellsFromGrid(
  packagingType: string,
  chocolate: ChocolateType,
  boxMix: BoxMix = 'single'
): CellAssignment[] {
  const option = getPackagingOption(packagingType);
  // X+1 boxes have N individually arrangeable ring cells (same as standard
  // boxes) in addition to the separately-edited center bar. `option.count`
  // (not grid.rows*cols) is the source of truth for the total, since
  // layered options (e.g. a two-tier tin) hold more cells than one grid.
  if (!option || !option.grid) return [];
  const total = option.count;
  return Array.from({ length: total }, (_, index) => ({
    index,
    content: 'logo',
    chocolate: boxMix === 'mixed' ? (index % 2 === 0 ? 'milk' : 'semidark') : chocolate,
  }));
}

/**
 * Extras that only make sense on a real box (ribbon, box colour, sleeve,
 * greeting card, wax seal, butter-paper message, QR). Cleared whenever the
 * catalog selection switches to a loose/individual pack or a custom shape,
 * so a leftover box choice can't survive into an incompatible packaging.
 */
function clearBoxOnlyExtras(extras: DesignExtras): DesignExtras {
  return {
    foil: extras.foil,
    printedWrapper: extras.printedWrapper,
  };
}

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'SELECT_CATALOG_ITEM': {
      const cells = action.packaging
        ? buildCellsFromGrid(action.packaging.type, state.design.chocolate, state.design.boxMix)
        : [];
      const isBoxed = Boolean(action.packaging) && action.packaging?.type !== 'individual';
      const extras = isBoxed ? state.design.extras : clearBoxOnlyExtras(state.design.extras);
      return {
        ...state,
        design: {
          ...state.design,
          product: action.product,
          packaging: action.packaging,
          cells,
          extras,
        },
      };
    }

    case 'SET_CHOCOLATE': {
      // Rebuild cells so a mixed box keeps alternating milk/semi-dark, and a
      // single-chocolate box picks up the newly chosen chocolate.
      const cells = state.design.packaging
        ? buildCellsFromGrid(state.design.packaging.type, action.chocolate, state.design.boxMix)
        : state.design.cells;
      return { ...state, design: { ...state.design, chocolate: action.chocolate, cells } };
    }

    case 'SET_LOGO':
      return { ...state, design: { ...state.design, logo: action.logo } };

    case 'CLEAR_LOGO':
      return { ...state, design: { ...state.design, logo: null } };

    case 'SET_BOX_MIX': {
      const cells = state.design.packaging
        ? buildCellsFromGrid(state.design.packaging.type, state.design.chocolate, action.boxMix)
        : state.design.cells;
      return { ...state, design: { ...state.design, boxMix: action.boxMix, cells } };
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

    case 'LOAD_DESIGN': {
      const design = sanitizeDesign(action.design);
      return { ...state, design };
    }

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
