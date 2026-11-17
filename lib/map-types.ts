import type { Place } from "./data";
export type MapProps = {
  pickup: Place | null;
  destination: Place | null;
  geometry?: [number, number][];
  onPick?: (p: Place, which: "pickup" | "destination") => void;
  active?: "pickup" | "destination";
  sample?: boolean;
  picker?: boolean;
};
