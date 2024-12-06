import { Food } from "./classes/Food";
import { FOOD_RADIUS } from "./constant";
import { v4 as uuidv4 } from "uuid";

export const generateFood = (x: number, y: number): Food => {
  const id = uuidv4();
  const radius = FOOD_RADIUS;
  const color = "blue";
  return new Food(id, x, y, radius, color);
};
