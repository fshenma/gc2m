import * as React from "react";
import { Tooltip, DarkMode, IconButton, IconPlus } from "sancho";
import { Link } from "wouter";
import { useState } from "react";
import { useSession } from "../../../utils/auth";

interface NewGameBarProps {     
    newTgtLink?: string;
  }

export const NewGameBar: React.FunctionComponent<NewGameBarProps>= ({newTgtLink}:NewGameBarProps) => {
    const [target, setTarget] = useState("game");
    const { curTab } = useSession();
    
    return (
        <Tooltip content={`Add a new ${curTab}`}>
            <div>
                <DarkMode>
                    <IconButton
                        component={Link}
                        to={newTgtLink}
                        variant="ghost"
                        label= {`Add ${curTab}`}
                        size="md"
                        icon={<IconPlus />}
                    />
                </DarkMode>
            </div>
        </Tooltip>
    )


}