import * as React from "react";
import { Tooltip, DarkMode, IconButton, IconPlus } from "sancho";
import { Link } from "wouter";
import { useState } from "react";

interface NewGameBarProps {     
    newTgtLink?: string;
  }

export const NewGameBar: React.FunctionComponent<NewGameBarProps>= ({newTgtLink}:NewGameBarProps) => {
    const [target, setTarget] = useState("game");

    return (
        <Tooltip content={`Add a new ${target}`}>
            <div>
                <DarkMode>
                    <IconButton
                        component={Link}
                        to={newTgtLink}
                        variant="ghost"
                        label= {`Add ${target}`}
                        size="md"
                        icon={<IconPlus />}
                    />
                </DarkMode>
            </div>
        </Tooltip>
    )


}