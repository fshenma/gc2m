import * as React from "react";
import { Navbar, Toolbar, LightMode, useTheme } from "sancho";
import { Profile } from "./Profile";
import { TeamBar } from "./TeamBar";
import { NewGameBar } from "./NewGameBar";
import { useSession } from "../../../utils/auth";


export const MainNavBar = () => {
    const theme = useTheme();
    const { activeTeam } = useSession();

    return (
        <Navbar
              position="static"
              css={{
                flex: "0 0 auto",
                background: theme.colors.palette.gray.base,
                color: "white"
              }}
            >
              <Toolbar
                css={{
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <Profile />

                <LightMode>
                  <TeamBar ActiveTeam={activeTeam.teamName} toLink="/newTeam" />
                </LightMode>

                {/* <NewGameBar newTgtLink="/new" /> */}
                <NewGameBar />

              </Toolbar>
            </Navbar>
            
    )
}