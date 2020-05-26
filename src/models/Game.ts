// import { Opponent } from "../pages/main/tabs/GameList";

export interface Opponent {
    name: string;
    score: string;
  }

export type Game = {
    teamId: string;
    title: string;
    gameDate: Date;
    gameLocation: string;
    plain: string;
    Opponents: Opponent[];
    description: string;
    author: string;
    image: string;
};