import { Bubble } from "./Bubble";

export class Player extends Bubble {
  constructor(id: string, x: number, y: number, r: number, color: string) {
    super(id, x, y, r, color);
  }
}
