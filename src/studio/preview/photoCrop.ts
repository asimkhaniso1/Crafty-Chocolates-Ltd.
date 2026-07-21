/**
 * Measured crop geometry for the studio's product photography.
 *
 * Every photo in /public/studio is a top-down shot centred on a cream
 * background, with the chocolate/foil subject occupying only part of the
 * canvas. To composite these as SVG/CSS "cover" bases without the cream
 * margin showing, each photo's subject bounding box (in source pixels) was
 * measured once (pixel-scanning for non-cream pixels) and is recorded here.
 * `coverCropRect` then places the photo so that bounding box — not the
 * whole canvas — fills the target box, the same way `object-fit: cover`
 * would if the "image" were just the cropped subject.
 */

export interface PhotoCrop {
  /** Natural pixel size of the source photo. */
  pw: number;
  ph: number;
  /** Subject bounding box in source pixels, excluding the cream margin. */
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ImageRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Uniform-scale "cover" rect: the image's x/y/width/height (in target-box
 * units) so that, once scaled, the measured subject bounding box fully
 * covers a w×h target box, centred on the box's centre. Any excess (the
 * bounding box is rarely exactly the target's aspect ratio) overflows
 * evenly on the constrained axis — callers clip to the target shape.
 */
export function coverCropRect(crop: PhotoCrop, w: number, h: number): ImageRect {
  const cropW = crop.right - crop.left;
  const cropH = crop.bottom - crop.top;
  const scale = Math.max(w / cropW, h / cropH);
  const width = crop.pw * scale;
  const height = crop.ph * scale;
  const cx = (crop.left + crop.right) / 2;
  const cy = (crop.top + crop.bottom) / 2;
  return {
    x: w / 2 - cx * scale,
    y: h / 2 - cy * scale,
    width,
    height,
  };
}

/**
 * Percentage-based crop for a plain HTML/CSS `<img>`: sizes the image
 * (absolutely positioned inside an `overflow: hidden` container) so the
 * subject bounding box exactly fills the container, with a matching
 * `aspectRatio` for the container itself. Equivalent to `coverCropRect`
 * but expressed for CSS instead of an SVG viewBox.
 */
export interface CssCoverCrop {
  /** Apply to the container: `aspectRatio: crop.aspectRatio`. */
  aspectRatio: string;
  /** Apply to an absolutely-positioned <img> filling the container. */
  imgStyle: { left: string; top: string; width: string; height: string };
}

export function cssCoverCrop(crop: PhotoCrop): CssCoverCrop {
  const cropW = crop.right - crop.left;
  const cropH = crop.bottom - crop.top;
  return {
    aspectRatio: `${cropW} / ${cropH}`,
    imgStyle: {
      left: `${(-crop.left / cropW) * 100}%`,
      top: `${(-crop.top / cropH) * 100}%`,
      width: `${(crop.pw / cropW) * 100}%`,
      height: `${(crop.ph / cropH) * 100}%`,
    },
  };
}

type ChocolateKey = 'milk' | 'semidark';

// Measured via edge-detection (sharp-gradient bounding box, which isolates
// the object's true outline from its soft drop shadow — a plain colour-
// distance threshold picks up the shadow too and skews the box off-centre).
export const PIECE_PHOTO_CROP: Record<ChocolateKey, PhotoCrop> = {
  milk: { pw: 1024, ph: 1024, left: 150, top: 150, right: 872, bottom: 873 },
  semidark: { pw: 1024, ph: 1024, left: 171, top: 172, right: 852, bottom: 852 },
};

export const BAR_PHOTO_CROP: Record<ChocolateKey, PhotoCrop> = {
  milk: { pw: 1264, ph: 848, left: 139, top: 183, right: 1116, bottom: 683 },
  semidark: { pw: 1264, ph: 848, left: 290, top: 249, right: 973, bottom: 598 },
};

// The bite's face is a thick flat-topped square (crisp edges, tapered
// sides) with no embossed border line, so
// its bounding box is measured the same edge-detection way but stored
// separately from PIECE_PHOTO_CROP (the flat bordered piece used for
// Signature/center-bar faces).
export const BITE_PHOTO_CROP: Record<ChocolateKey, PhotoCrop> = {
  milk: { pw: 1024, ph: 1024, left: 268, top: 267, right: 755, bottom: 756 },
  semidark: { pw: 1024, ph: 1024, left: 268, top: 267, right: 755, bottom: 756 },
};

type FoilColour = 'silver' | 'gold';

export const FOIL_BAR_PHOTO_CROP: Record<FoilColour, PhotoCrop> = {
  silver: { pw: 1264, ph: 848, left: 201, top: 217, right: 1061, bottom: 640 },
  gold: { pw: 1264, ph: 848, left: 199, top: 248, right: 1065, bottom: 599 },
};

export const FOIL_BITE_PHOTO_CROP: Record<FoilColour, PhotoCrop> = {
  silver: { pw: 1024, ph: 1024, left: 301, top: 321, right: 721, bottom: 721 },
  gold: { pw: 1024, ph: 1024, left: 203, top: 202, right: 820, bottom: 821 },
};
