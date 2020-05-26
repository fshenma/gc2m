import * as React from "react";
import { Compose } from "./Compose";
import { Practice } from "./Practice";
import { Message } from "./Message";
import { Team } from "./Team";
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
    if (id === "newpractice") {
      return <Practice />;
    }
    if (id === "newmessage") {
      return <Message />;
    }
    else if (id === "newTeam") {
      return <Team />;
    }
    else if (id === "editTeam") {
      return <Team editable={true} />;
    }
    return <Game id={id} />;
  }
  