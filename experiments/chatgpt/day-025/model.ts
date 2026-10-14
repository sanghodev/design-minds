export type ShiftSide = "left" | "right";

export type StudyState = {
  shift: number;
  side: ShiftSide;
  swappedPanels: boolean;
};

export type StudyAction =
  | { type: "shift"; value: number }
  | { type: "mirror" }
  | { type: "swap-panels" }
  | { type: "reset" };

export const SQUARE_SIZE = 30;
export const FRAME_SIZE = 64;
export const MAX_SHIFT = (FRAME_SIZE - SQUARE_SIZE) / 2;
export const INITIAL: StudyState = { shift: 0, side: "right", swappedPanels: false };

export function clampShift(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(MAX_SHIFT, Math.round(value))) : INITIAL.shift;
}

export function signedShift(state: StudyState) {
  const magnitude = clampShift(state.shift);
  return state.side === "right" ? magnitude : -magnitude;
}

export function frameStyle(state: StudyState) {
  const frameRelativePercent = (signedShift(state) / FRAME_SIZE) * 100;
  return { transform: `translateX(${frameRelativePercent}%)` };
}

export function relationLabel(shift: number) {
  const value = clampShift(shift);
  if (value === 0) return "equal space on every side";
  if (value === MAX_SHIFT) return "one frame edge touching the square";
  return `frame shifted ${value}% of the field width`;
}

export function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case "shift": return { ...state, shift: clampShift(action.value) };
    case "mirror": return { ...state, side: state.side === "right" ? "left" : "right" };
    case "swap-panels": return { ...state, swappedPanels: !state.swappedPanels };
    case "reset": return { ...INITIAL };
  }
}
