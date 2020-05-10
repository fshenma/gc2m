/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import * as React from "react";
import {
  useTheme,  
  Layer,  
} from "sancho";
 
// import { SearchBox } from "../../components/SearchBox";
import { useRoute } from "wouter";
import { Layout } from "../../components/Layout";
import { MainContent } from "./components/MainContent";
import { MainControl } from "./components/MainControl";
import { useState, useEffect } from "react";

export interface MainProps {
  path?: string;
  id?: string;
}

export const Main: React.FunctionComponent<MainProps> = props => {
  const theme = useTheme();
  const [, params] = useRoute("/:game*");
  const [showingGame, setShowingGame] = useState("");
  // const showingGame = params.game;


  // i'm disabling this for now, since it was running really poorly. unsure
  // whats up here.

  // const transitions = useTransition(false, recipeId => null, {
  //   from: { opacity: 0, transform: "scale(0.95)" },
  //   enter: { opacity: 1, transform: "scale(1)" },
  //   leave: { opacity: 0, transform: "scale(1.1)" },
  //   immediate: !isLarge
  // });

  useEffect (() => {
    setShowingGame(params.game);
  },[params])

  return (
    <Layout>
      <div
        css={css`
          display: flex;
          box-sizing: border-box;
        `}
      >
        
        <MainControl />

        {showingGame && (
          <div
            css={{
              display: "block",
              position: "relative",
              flex: 1,
              [theme.mediaQueries.md]: {
                display: "flex",
                justifyContent: "center"
              }
            }}
          >
            <div
              css={{
                display: "block",
                position: "absolute",
                width: "100%",
                boxSizing: "border-box",
                [theme.mediaQueries.md]: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: theme.spaces.lg,
                  minHeight: "100vh",
                  paddingLeft: "calc(330px + 3rem)"
                },
                [theme.mediaQueries.lg]: {
                  // paddingLeft: theme.spaces.xl,
                  paddingRight: theme.spaces.xl,
                  paddingLeft: "calc(400px + 6rem)"
                }
              }}
            >
              <Layer
                elevation="xl"
                css={{
                  borderRadius: 0,
                  position: "relative",
                  boxShadow: "none",
                  width: "100%",
                  [theme.mediaQueries.md]: {
                    marginTop: "auto",
                    height: "auto",
                    overflow: "hidden",
                    boxSizing: "border-box",
                    marginBottom: "auto",
                    width: "100%",
                    maxWidth: "700px",
                    borderRadius: theme.radii.lg,
                    boxShadow: theme.shadows.xl
                  }
                }}
              >
                <MainContent contentId={showingGame} />
              </Layer>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
