import type { DesignExtras } from '../types';

export type MessageMedium = 'butter-paper' | 'sleeve' | 'greeting-card';

/**
 * Where the personal message physically prints. The shopper can choose any
 * medium their design actually has: butter paper only exists for bare
 * (unwrapped) pieces, the sleeve only when a printed sleeve is ordered (or
 * implied by wrapped pieces), the greeting card only when one is added.
 * Falls back to the classic behaviour: sleeve for wrapped pieces, butter
 * paper otherwise.
 */
export function availableMessageMedia(extras: DesignExtras): MessageMedium[] {
  const wrapped = extras.piecesWrapped === true;
  const media: MessageMedium[] = [];
  if (!wrapped) media.push('butter-paper');
  if (extras.sleevePrint || wrapped) media.push('sleeve');
  if (extras.greetingCard) media.push('greeting-card');
  return media;
}

export function resolveMessageMedium(extras: DesignExtras): MessageMedium {
  const media = availableMessageMedia(extras);
  const chosen = extras.insideMessageMedium;
  if (chosen && media.includes(chosen)) return chosen;
  return media[0] ?? 'butter-paper';
}
