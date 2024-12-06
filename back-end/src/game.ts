import { Bubble } from "./classes/Bubble";
import { Food } from "./classes/Food";
import { Player } from "./classes/Player";
import { FOOD_RADIUS } from "./constant";
import { v4 as uuidv4 } from "uuid";

export const isContact = (objA: Bubble, objB: Bubble): boolean => {
  const dx = objA.x - objB.x;
  const dy = objA.y - objB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < objA.r + objB.r;
};

export const generateFood = (x: number, y: number): Food => {
  const id = uuidv4();
  const radius = FOOD_RADIUS;
  const color = "blue";
  return new Food(id, x, y, radius, color);
};

export const handlePlayerToFoodContact = (player: Player, food: Food): boolean => {
  if (isContact(player, food)) {
    player.r += 1;
    return true;
  }
  return false;
};

export const handlePlayerToPlayerContact = (player1: Player, player2: Player): string | null => {
  if (isContact(player1, player2)) {
    if (player1.r > player2.r) {
      player1.r += player2.r / 4;
      return player2.id;
    } else if (player1.r < player2.r) {
      player2.r += player1.r / 4;
      return player1.id;
    }
  }
  return null;
};
