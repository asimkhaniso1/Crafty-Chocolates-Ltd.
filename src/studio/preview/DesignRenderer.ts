import type { FC } from 'react';
import type { CellAssignment, Design } from '../types';
import ChocolatePreview from './ChocolatePreview';
import BoxPreview from './BoxPreview';

export interface PieceViewProps {
  design: Design;
  cell?: CellAssignment;
  size?: number;
}

export interface BoxViewProps {
  design: Design;
}

export interface DesignRenderer {
  id: string;
  PieceView: FC<PieceViewProps>;
  BoxView: FC<BoxViewProps>;
}

const twoPointFiveD: DesignRenderer = {
  id: '2.5d',
  PieceView: ChocolatePreview,
  BoxView: BoxPreview,
};

export const renderers: Record<string, DesignRenderer> = {
  '2.5d': twoPointFiveD,
};

export const activeRenderer: DesignRenderer = renderers['2.5d'];
