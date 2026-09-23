export type Letter = "H" | "E";
export type StudyState = { letter: Letter; height: number; guides: boolean; swapped: boolean };
export type StudyAction =
  | { type: "height"; value: number }
  | { type: "letter"; value: Letter }
  | { type: "guides" }
  | { type: "swap" }
  | { type: "reset" };

export const MIN_HEIGHT = 32;
export const MAX_HEIGHT = 68;
export const INITIAL: StudyState = { letter: "H", height: 50, guides: false, swapped: false };
export const CAP_TOP = 40;
export const CAP_HEIGHT = 340;
export const BAR_THICKNESS = 32;

export function clampHeight(value: number) {
  return Number.isFinite(value) ? Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(value))) : 50;
}

export function crossbarCenter(height: number) {
  return CAP_TOP + CAP_HEIGHT * clampHeight(height) / 100;
}

export function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case "height": return { ...state, height: clampHeight(action.value) };
    case "letter": return { ...INITIAL, letter: action.value };
    case "guides": return { ...state, guides: !state.guides };
    case "swap": return { ...state, swapped: !state.swapped };
    case "reset": return { ...INITIAL };
  }
}
