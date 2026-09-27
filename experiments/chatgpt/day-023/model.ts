export type StripSide = "left" | "right";

export type StudyState = {
  share: number;
  stripSide: StripSide;
  swappedColors: boolean;
};

export type StudyAction =
  | { type: "share"; value: number }
  | { type: "move-strip" }
  | { type: "swap-colors" }
  | { type: "reset" };

export const MIN_SHARE = 16;
export const MAX_SHARE = 64;
export const INITIAL: StudyState = { share: 36, stripSide: "left", swappedColors: false };

export const COLORS = {
  a: { name: "Citron", value: "#d9ff4f" },
  b: { name: "Ink", value: "#17181c" },
} as const;

export function clampShare(value: number) {
  return Number.isFinite(value) ? Math.max(MIN_SHARE, Math.min(MAX_SHARE, Math.round(value))) : INITIAL.share;
}

export function squareSidePercent(share: number) {
  return Math.sqrt(clampShare(share) / 100) * 100;
}

export function colorsFor(state: StudyState) {
  return state.swappedColors
    ? { region: COLORS.b, ground: COLORS.a }
    : { region: COLORS.a, ground: COLORS.b };
}

export function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case "share": return { ...state, share: clampShare(action.value) };
    case "move-strip": return { ...state, stripSide: state.stripSide === "left" ? "right" : "left" };
    case "swap-colors": return { ...state, swappedColors: !state.swappedColors };
    case "reset": return { ...INITIAL };
  }
}
