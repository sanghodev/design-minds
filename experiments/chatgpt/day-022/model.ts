export type PairId = "signal" | "evening" | "mineral";

export type ColorPair = {
  id: PairId;
  label: string;
  a: { name: string; value: string };
  b: { name: string; value: string };
};

export type StudyState = {
  pair: PairId;
  shareA: number;
  swapped: boolean;
  guide: boolean;
};

export type StudyAction =
  | { type: "share"; value: number }
  | { type: "pair"; value: PairId }
  | { type: "swap" }
  | { type: "guide" }
  | { type: "reset" };

export const MIN_SHARE = 10;
export const MAX_SHARE = 90;

export const COLOR_PAIRS: ColorPair[] = [
  { id: "signal", label: "Signal", a: { name: "Vermilion", value: "#e6472f" }, b: { name: "Cobalt", value: "#21499a" } },
  { id: "evening", label: "Evening", a: { name: "Marigold", value: "#efc83f" }, b: { name: "Violet", value: "#57327d" } },
  { id: "mineral", label: "Mineral", a: { name: "Mint", value: "#8fd1b8" }, b: { name: "Wine", value: "#741f3e" } },
];

export const INITIAL: StudyState = { pair: "signal", shareA: 50, swapped: false, guide: false };

export function clampShare(value: number) {
  return Number.isFinite(value) ? Math.max(MIN_SHARE, Math.min(MAX_SHARE, Math.round(value))) : 50;
}

export function pairFor(id: PairId) {
  return COLOR_PAIRS.find(pair => pair.id === id) ?? COLOR_PAIRS[0];
}

export function panelOrder(state: StudyState) {
  const pair = pairFor(state.pair);
  const a = { key: "a" as const, ...pair.a, share: state.shareA };
  const b = { key: "b" as const, ...pair.b, share: 100 - state.shareA };
  return state.swapped ? [b, a] : [a, b];
}

export function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case "share": return { ...state, shareA: clampShare(action.value) };
    case "pair": return { ...INITIAL, pair: action.value };
    case "swap": return { ...state, swapped: !state.swapped };
    case "guide": return { ...state, guide: !state.guide };
    case "reset": return { ...INITIAL };
  }
}
