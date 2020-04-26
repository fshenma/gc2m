import * as React from "react";
import { Compose } from "../Compose";
import { Team } from "../Team";
import { Game } from "./Game";

interface MainContentProps {     
    contentId?: string;
  }

export const MainContent: React.FunctionComponent<MainContentProps> = ({contentId}: MainContentProps) => {

    return (               
            <MainContentF id={contentId} />      
    )
}

interface MainContentProps {
    id?: string;
  }
  
  function MainContentF({ id }: MainContentProps) {
    if (!id) {
      return null;
    }
  
    if (id === "new") {
      return <Compose />;
    }
    else if (id === "newTeam") {
      return <Team />;
    }
  
    return <Game id={id} />;
  }
  