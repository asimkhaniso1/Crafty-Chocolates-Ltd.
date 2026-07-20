/**
 * Pure client-side logo processing pipeline for the Design Studio.
 *
 * Turns an uploaded image (or typed initials) into a clean black-on-transparent
 * PNG mask suitable for driving an emboss/deboss/foil render downstream.
 *
 * No React, no external dependencies — canvas + typed arrays only.
 */
import type { LogoState } from '../types';
import { MAX_UPLOAD_BYTES, MAX_MASK_PX } from '../constraints';
import { WARNINGS, STUDIO_COPY_STEP3 } from '../copy';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const REJECTED_TYPES = ['application/pdf', 'application/postscript', 'application/illustrator'];

const CORNER_TOLERANCE = 12; // corners must agree within this RGB distance to be treated as background
const FLOOD_TOLERANCE = 40; // flood-fill color distance tolerance
const LUMINANCE_THRESHOLD = 0.55; // normalized luminance cut for the monochrome mask
const PAD_FRACTION = 0.06; // padding around the trimmed bounding box
const EROSION_THIN_RATIO = 0.55; // erosion pixel-loss ratio that flags "fine detail"
const SPECK_MAX_SIZE = 4; // connected components at/under this pixel count count as "specks"
const SPECK_WARNING_COUNT = 6; // number of specks that triggers a warning
const DOWNSCALE_ANALYSIS_PX = 128;

type PipelineResult<T> = { ok: true; value: T } | { ok: false; error: string };

export type ProcessLogoResult = { logo: LogoState } | { error: string };

/** Validate + decode + process an uploaded file into a LogoState mask. */
export async function processLogoFile(file: File): Promise<ProcessLogoResult> {
  try {
    const validationError = validateFile(file);
    if (validationError) return { error: validationError };

    const bitmapResult = await decodeFileToCanvas(file);
    if (bitmapResult.ok === false) return { error: bitmapResult.error };

    const maskResult = buildMaskFromCanvas(bitmapResult.value);
    if (maskResult.ok === false) return { error: maskResult.error };

    return {
      logo: {
        maskDataUrl: maskResult.value.maskDataUrl,
        originalName: file.name,
        scale: 1,
        warnings: maskResult.value.warnings,
      },
    };
  } catch {
    return { error: STUDIO_COPY_STEP3.genericError };
  }
}

export type ProcessWrapperResult = { imageDataUrl: string } | { error: string };

/**
 * Validate + decode + downscale an uploaded image for the printed wrapper.
 * Unlike the mark pipeline this keeps full colour: no background removal,
 * no monochrome mask — the wrapper is printed, not embossed.
 */
export async function processWrapperImage(file: File): Promise<ProcessWrapperResult> {
  try {
    const validationError = validateFile(file);
    if (validationError) return { error: validationError };

    const bitmapResult = await decodeFileToCanvas(file);
    if (bitmapResult.ok === false) return { error: bitmapResult.error };

    // Flatten onto white (JPEG has no alpha channel) — a transparent PNG
    // would otherwise export with a black background.
    const source = bitmapResult.value;
    const flat = document.createElement('canvas');
    flat.width = source.width;
    flat.height = source.height;
    const flatCtx = flat.getContext('2d');
    if (!flatCtx) return { error: STUDIO_COPY_STEP3.genericError };
    flatCtx.fillStyle = '#ffffff';
    flatCtx.fillRect(0, 0, flat.width, flat.height);
    flatCtx.drawImage(source, 0, 0);

    // JPEG keeps the data URL compact; wrapper artwork needs no transparency.
    return { imageDataUrl: flat.toDataURL('image/jpeg', 0.82) };
  } catch {
    return { error: STUDIO_COPY_STEP3.genericError };
  }
}

/** Render typed initials (up to 4 chars) in an elegant serif and run them through the mask pipeline. */
export async function initialsToMask(text: string): Promise<LogoState> {
  const trimmed = text.trim().slice(0, 4);
  const size = MAX_MASK_PX;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { maskDataUrl: '', originalName: trimmed || 'Initials', scale: 1, warnings: [] };
  }

  // White background so downstream corner-based background removal works consistently.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.round(size * 0.5);
  ctx.font = `600 ${fontSize}px 'Cormorant Garamond', serif`;
  ctx.fillText(trimmed || '', size / 2, size / 2 + fontSize * 0.05);

  const maskResult = buildMaskFromCanvas(canvas);
  if (maskResult.ok === false) {
    return { maskDataUrl: '', originalName: trimmed || 'Initials', scale: 1, warnings: [] };
  }

  return {
    maskDataUrl: maskResult.value.maskDataUrl,
    originalName: trimmed || 'Initials',
    scale: 1,
    warnings: maskResult.value.warnings,
  };
}

/** Returns an error message if the file is invalid, or null if it's acceptable. */
function validateFile(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return WARNINGS.fileTooLarge;
  }
  const type = (file.type || '').toLowerCase();
  if (REJECTED_TYPES.includes(type) || /\.(pdf|ai|eps)$/i.test(file.name)) {
    return STUDIO_COPY_STEP3.sendViaWhatsApp;
  }
  if (!ACCEPTED_TYPES.includes(type)) {
    return WARNINGS.unsupportedFormat;
  }
  return null;
}

async function decodeFileToCanvas(file: File): Promise<PipelineResult<HTMLCanvasElement>> {
  try {
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await loadImage(objectUrl);
      const { width, height } = fitDimensions(img.naturalWidth || img.width, img.naturalHeight || img.height);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return { ok: false, error: STUDIO_COPY_STEP3.genericError };
      ctx.drawImage(img, 0, 0, width, height);
      return { ok: true, value: canvas };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return { ok: false, error: STUDIO_COPY_STEP3.genericError };
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image decode failed'));
    img.src = src;
  });
}

function fitDimensions(w: number, h: number): { width: number; height: number } {
  const longest = Math.max(w, h, 1);
  if (longest <= MAX_MASK_PX) return { width: Math.max(1, w), height: Math.max(1, h) };
  const scale = MAX_MASK_PX / longest;
  return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
}

interface MaskBuildResult {
  maskDataUrl: string;
  warnings: string[];
}

function buildMaskFromCanvas(source: HTMLCanvasElement): PipelineResult<MaskBuildResult> {
  try {
    const ctx = source.getContext('2d');
    if (!ctx) return { ok: false, error: STUDIO_COPY_STEP3.genericError };
    const { width, height } = source;
    if (width < 1 || height < 1) return { ok: false, error: STUDIO_COPY_STEP3.genericError };

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    removeBackground(data, width, height);

    // Build a monochrome alpha mask from remaining (non-background) pixels.
    const alphaMask = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i++) {
      const a = data[i * 4 + 3];
      if (a === 0) {
        alphaMask[i] = 0;
        continue;
      }
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      // Ink is dark-on-light; low luminance => opaque mask pixel.
      alphaMask[i] = luminance <= LUMINANCE_THRESHOLD ? 255 : 0;
    }

    const bbox = boundingBoxOf(alphaMask, width, height);
    if (!bbox) {
      return { ok: false, error: STUDIO_COPY_STEP3.emptyResult };
    }

    // Render the raw (untrimmed) alpha mask to a source canvas, then let drawImage
    // handle the crop + scale + centering in one pass — simpler and antialiased.
    const rawMaskCanvas = document.createElement('canvas');
    rawMaskCanvas.width = width;
    rawMaskCanvas.height = height;
    const rawCtx = rawMaskCanvas.getContext('2d');
    if (!rawCtx) return { ok: false, error: STUDIO_COPY_STEP3.genericError };
    const rawImage = rawCtx.createImageData(width, height);
    for (let i = 0; i < alphaMask.length; i++) {
      rawImage.data[i * 4 + 3] = alphaMask[i];
    }
    rawCtx.putImageData(rawImage, 0, 0);

    const boxW = bbox.maxX - bbox.minX + 1;
    const boxH = bbox.maxY - bbox.minY + 1;
    const contentSize = Math.max(boxW, boxH);
    const pad = Math.max(1, Math.ceil(contentSize * PAD_FRACTION));
    const canvasSize = Math.min(MAX_MASK_PX, contentSize + pad * 2);
    const drawSize = canvasSize - pad * 2;
    const drawW = Math.round((boxW / contentSize) * drawSize);
    const drawH = Math.round((boxH / contentSize) * drawSize);
    const destX = Math.round((canvasSize - drawW) / 2);
    const destY = Math.round((canvasSize - drawH) / 2);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = canvasSize;
    outCanvas.height = canvasSize;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return { ok: false, error: STUDIO_COPY_STEP3.genericError };
    outCtx.imageSmoothingEnabled = true;
    outCtx.drawImage(
      rawMaskCanvas,
      bbox.minX,
      bbox.minY,
      boxW,
      boxH,
      destX,
      destY,
      drawW,
      drawH
    );

    // Recolor the scaled alpha mask to solid black (drawImage preserves only alpha here
    // since the source is alpha-only with 0,0,0 RGB already).
    const outImageData = outCtx.getImageData(0, 0, canvasSize, canvasSize);
    const outData = outImageData.data;
    for (let i = 0; i < outData.length / 4; i++) {
      outData[i * 4] = 0;
      outData[i * 4 + 1] = 0;
      outData[i * 4 + 2] = 0;
    }
    outCtx.putImageData(outImageData, 0, 0);

    const warnings: string[] = [];
    const analysisAlpha = new Uint8ClampedArray(canvasSize * canvasSize);
    for (let i = 0; i < analysisAlpha.length; i++) {
      analysisAlpha[i] = outData[i * 4 + 3];
    }
    detectFineDetail(analysisAlpha, canvasSize, warnings);

    return { ok: true, value: { maskDataUrl: outCanvas.toDataURL('image/png'), warnings } };
  } catch {
    return { ok: false, error: STUDIO_COPY_STEP3.genericError };
  }
}

/** Sample the four corners; if they agree, flood-fill from every edge pixel removing near-matches. */
function removeBackground(data: Uint8ClampedArray, width: number, height: number): void {
  const corners = [
    pixelAt(data, width, 0, 0),
    pixelAt(data, width, width - 1, 0),
    pixelAt(data, width, 0, height - 1),
    pixelAt(data, width, width - 1, height - 1),
  ];

  const [c0, c1, c2, c3] = corners;
  const agree =
    colorDistance(c0, c1) <= CORNER_TOLERANCE &&
    colorDistance(c0, c2) <= CORNER_TOLERANCE &&
    colorDistance(c0, c3) <= CORNER_TOLERANCE;
  if (!agree) return;

  const bg = c0;
  const visited = new Uint8Array(width * height);
  const stack: number[] = [];

  for (let x = 0; x < width; x++) {
    stack.push(x, 0, x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    stack.push(0, y, width - 1, y);
  }

  // stack holds pairs (x, y); process as flat list
  const queue: number[] = [];
  for (let i = 0; i < stack.length; i += 2) {
    queue.push(stack[i], stack[i + 1]);
  }

  let qi = 0;
  while (qi < queue.length) {
    const x = queue[qi++];
    const y = queue[qi++];
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;
    const px = pixelAt(data, width, x, y);
    if (colorDistance(px, bg) > FLOOD_TOLERANCE) continue;

    data[idx * 4 + 3] = 0;

    if (x > 0) queue.push(x - 1, y);
    if (x < width - 1) queue.push(x + 1, y);
    if (y > 0) queue.push(x, y - 1);
    if (y < height - 1) queue.push(x, y + 1);
  }
}

function pixelAt(data: Uint8ClampedArray, width: number, x: number, y: number): [number, number, number] {
  const idx = (y * width + x) * 4;
  return [data[idx], data[idx + 1], data[idx + 2]];
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function boundingBoxOf(mask: Uint8ClampedArray, width: number, height: number): BBox | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return { minX, minY, maxX, maxY };
}

/** Downscale, estimate stroke thinness via one erosion pass, and count isolated specks. */
function detectFineDetail(mask: Uint8ClampedArray, size: number, warnings: string[]): void {
  const targetSize = Math.min(DOWNSCALE_ANALYSIS_PX, size);
  const small = downscaleMask(mask, size, targetSize);

  const totalOn = countOn(small, targetSize);
  if (totalOn === 0) return;

  const eroded = erodeOnce(small, targetSize);
  const erodedOn = countOn(eroded, targetSize);
  const lossRatio = 1 - erodedOn / totalOn;

  const speckCount = countSpecks(small, targetSize);

  if (lossRatio > EROSION_THIN_RATIO || speckCount > SPECK_WARNING_COUNT) {
    warnings.push(WARNINGS.fineDetail);
  }
}

function downscaleMask(mask: Uint8ClampedArray, size: number, targetSize: number): Uint8ClampedArray {
  if (targetSize >= size) return mask;
  const out = new Uint8ClampedArray(targetSize * targetSize);
  const ratio = size / targetSize;
  for (let ty = 0; ty < targetSize; ty++) {
    for (let tx = 0; tx < targetSize; tx++) {
      const sx = Math.min(size - 1, Math.floor(tx * ratio));
      const sy = Math.min(size - 1, Math.floor(ty * ratio));
      out[ty * targetSize + tx] = mask[sy * size + sx];
    }
  }
  return out;
}

function countOn(mask: Uint8ClampedArray, size: number): number {
  let count = 0;
  for (let i = 0; i < size * size; i++) {
    if (mask[i] > 0) count++;
  }
  return count;
}

function erodeOnce(mask: Uint8ClampedArray, size: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      if (mask[idx] === 0) continue;
      const onEdge = x === 0 || y === 0 || x === size - 1 || y === size - 1;
      if (onEdge) continue;
      const neighborsOn =
        mask[idx - 1] > 0 &&
        mask[idx + 1] > 0 &&
        mask[idx - size] > 0 &&
        mask[idx + size] > 0;
      out[idx] = neighborsOn ? 255 : 0;
    }
  }
  return out;
}

/** Count connected components of size <= SPECK_MAX_SIZE, capped for performance. */
function countSpecks(mask: Uint8ClampedArray, size: number): number {
  const visited = new Uint8Array(size * size);
  let specks = 0;
  const maxComponentsToScan = 4000; // safety cap
  let scanned = 0;

  for (let y = 0; y < size && scanned < maxComponentsToScan; y++) {
    for (let x = 0; x < size && scanned < maxComponentsToScan; x++) {
      const idx = y * size + x;
      if (mask[idx] === 0 || visited[idx]) continue;

      scanned++;
      const stack = [idx];
      visited[idx] = 1;
      let componentSize = 0;

      while (stack.length > 0) {
        const cur = stack.pop() as number;
        componentSize++;
        const cx = cur % size;
        const cy = Math.floor(cur / size);
        const neighbors = [
          cx > 0 ? cur - 1 : -1,
          cx < size - 1 ? cur + 1 : -1,
          cy > 0 ? cur - size : -1,
          cy < size - 1 ? cur + size : -1,
        ];
        for (const n of neighbors) {
          if (n >= 0 && mask[n] > 0 && !visited[n]) {
            visited[n] = 1;
            stack.push(n);
          }
        }
      }

      if (componentSize <= SPECK_MAX_SIZE) specks++;
    }
  }

  return specks;
}
