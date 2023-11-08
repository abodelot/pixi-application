// Common types

export type ListenerFn = () => void;

export class Color {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  darken(percent: number): Color {
    return new Color(
      Math.round(this.r * (1 - percent)),
      Math.round(this.g * (1 - percent)),
      Math.round(this.b * (1 - percent)),
    );
  }

  lighten(percent: number): Color {
    // Cannot go over 255
    return new Color(
      Math.min(255, Math.round(this.r * (1 + percent))),
      Math.min(255, Math.round(this.g * (1 + percent))),
      Math.min(255, Math.round(this.b * (1 + percent))),
    );
  }

  static fromInt(int: number): Color {
    return new Color(
      int >> 16 & 0xff,
      int >> 8 & 0xff,
      int & 0xff,
    );
  }
}

export interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
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
