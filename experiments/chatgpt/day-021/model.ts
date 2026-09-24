export type Word = "AVATAR" | "WAYWARD" | "TOY";
export type StudyState = { word: Word; tracking: number; guides: boolean; swapped: boolean };
export type StudyAction =
  | { type: "tracking"; value: number }
  | { type: "word"; value: Word }
  | { type: "guides" }
  | { type: "swap" }
  | { type: "reset" };

export const MIN_TRACKING = -4;
export const MAX_TRACKING = 16;
export const INITIAL: StudyState = { word: "AVATAR", tracking: 0, guides: false, swapped: false };

export function clampTracking(value: number) {
  return Number.isFinite(value) ? Math.max(MIN_TRACKING, Math.min(MAX_TRACKING, Math.round(value))) : 0;
}

export function trackingEm(value: number) {
  return clampTracking(value) / 100;
}

export function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case "tracking": return { ...state, tracking: clampTracking(action.value) };
    case "word": return { ...INITIAL, word: action.value };
    case "guides": return { ...state, guides: !state.guides };
    case "swap": return { ...state, swapped: !state.swapped };
    case "reset": return { ...INITIAL };
  }
}
