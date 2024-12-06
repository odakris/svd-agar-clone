import { Food } from "./classes/Food";
import { Player } from "./classes/Player";

export interface GameState {
  players: { [key: string]: Player };
  foods: { [key: string]: Food };
}
