// import { Opponent } from "../pages/main/tabs/GameList";

export interface Opponent {
    name: string;
    score: string;
  }

export type PracticeType = {
    teamId: string;
    title: string;
    practiceDate: Date;
    practiceLocation: string;
    plain: string;
    Opponents: Opponent[];
    description: string;    
    image: string;
};