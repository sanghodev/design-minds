export type AnchorSide = "left" | "right";

export type StudyState = {
  gap: number;
  anchorSide: AnchorSide;
  swappedColors: boolean;
};

export type StudyAction =
  | { type: "gap"; value: number }
  | { type: "mirror" }
  | { type: "swap-colors" }
  | { type: "reset" };

export const SQUARE_SIZE = 34;
export const MIN_GAP = 0;
export const MAX_GAP = (100 - SQUARE_SIZE) / 2;
export const INITIAL: StudyState = { gap: 0, anchorSide: "left", swappedColors: false };

export const COLORS = {
  square: { name: "Ultramarine", value: "#2447d8" },
  field: { name: "Shell", value: "#f0d4b2" },
} as const;

export function clampGap(value: number) {
  return Number.isFinite(value) ? Math.max(MIN_GAP, Math.min(MAX_GAP, Math.round(value))) : INITIAL.gap;
}

export function colorsFor(state: StudyState) {
  return state.swappedColors
    ? { square: COLORS.field, field: COLORS.square }
    : { square: COLORS.square, field: COLORS.field };
}

export function positionFor(state: StudyState) {
  const gap = clampGap(state.gap);
  return state.anchorSide === "left"
    ? { insetInlineStart: `${gap}%`, insetInlineEnd: "auto" }
    : { insetInlineStart: "auto", insetInlineEnd: `${gap}%` };
}

export function contactLabel(gap: number) {
  const value = clampGap(gap);
  if (value === MIN_GAP) return "touching the frame";
  if (value === MAX_GAP) return "centered in the field";
  return `${value}% from the frame`;
}

export function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case "gap": return { ...state, gap: clampGap(action.value) };
    case "mirror": return { ...state, anchorSide: state.anchorSide === "left" ? "right" : "left" };
    case "swap-colors": return { ...state, swappedColors: !state.swappedColors };
    case "reset": return { ...INITIAL };
  }
}
