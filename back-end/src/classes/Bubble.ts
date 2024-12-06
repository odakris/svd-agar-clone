export class Bubble {
  id: string;
  x: number;
  y: number;
  r: number;
  color: string;

  constructor(id: string, x: number, y: number, r: number, color: string) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
  }
}
