import * as React from "react";
import { Tooltip, DarkMode, IconButton, IconPlus } from "sancho";
import { Link } from "wouter";

interface NewGameBarProps {     
    newGameLink?: string;
  }

export const NewGameBar: React.FunctionComponent<NewGameBarProps>= ({newGameLink}:NewGameBarProps) => {


    return (
        <Tooltip content="Add a new game">
            <div>
                <DarkMode>
                    <IconButton
                        component={Link}
                        to={newGameLink}
                        variant="ghost"
                        label="Add game"
                        size="md"
                        icon={<IconPlus />}
                    />
                </DarkMode>
            </div>
        </Tooltip>
    )


}