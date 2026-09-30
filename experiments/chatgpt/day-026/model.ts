export type StudyState = {
  gap: number;
  reversedAnchors: boolean;
  showConstruction: boolean;
};

export type StudyAction =
  | { type: "gap"; value: number }
  | { type: "reverse-anchors" }
  | { type: "toggle-construction" }
  | { type: "reset" };

export const SQUARE_SIZE = 30;
export const MAX_GAP = 18;
export const INITIAL: StudyState = { gap: 9, reversedAnchors: false, showConstruction: false };

export function clampGap(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(MAX_GAP, Math.round(value))) : INITIAL.gap;
}

export function frameSize(gap: number) {
  return SQUARE_SIZE + clampGap(gap) * 2;
}

export function frameInset(gap: number) {
  return (100 - frameSize(gap)) / 2;
}

export function relationLabel(gap: number) {
  const value = clampGap(gap);
  if (value === 0) return "frame and square edges coincide";
  if (value === MAX_GAP) return "the widest construction gap";
  if (value <= 4) return `${value}% space on every side`;
  return `${value}% symmetric space on every side`;
}

export function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case "gap": return { ...state, gap: clampGap(action.value) };
    case "reverse-anchors": return { ...state, reversedAnchors: !state.reversedAnchors };
    case "toggle-construction": return { ...state, showConstruction: !state.showConstruction };
    case "reset": return { ...INITIAL };
  }
}
