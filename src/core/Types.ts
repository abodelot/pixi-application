// Common types

export type ListenerFn = () => void;

export interface Color {
  r: number;
  g: number;
  b: number;
}

// A position in the tilemap coordinates system
export class Coords {
  i: number;
  j: number;

  static min(start: Coords, end: Coords): Coords {
    return { i: Math.min(start.i, end.i), j: Math.min(start.j, end.j) };
  }

  static max(start: Coords, end: Coords): Coords {
    return { i: Math.max(start.i, end.i), j: Math.max(start.j, end.j) };
  }
}

// A position in the screen coordinates system
export interface Point {
  x: number;
  y: number;
}
