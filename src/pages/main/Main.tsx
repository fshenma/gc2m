/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import * as React from "react";
import {
  useTheme,  
  Layer,
  DarkMode,
  Tabs,
  Tab,
  Pager,
  TabPanel,  
} from "sancho";
 
// import { SearchBox } from "../../components/SearchBox";
import { useRoute, useLocation } from "wouter";
import { Layout } from "../../components/Layout";
import { MainContent } from "./components/MainContent";
import { MainControl } from "./components/MainControl";
import { useState, useEffect } from "react";
import { MainNavBar } from "./components/MainNavBar";
import { GameList } from "./tabs/GameList";
import { PracticesList } from "./tabs/PracticesList";
import { MessagesList } from "./tabs/MessagesList";
import useMedia from "use-media";
import { useFollowRequests } from "../../hooks/with-follow-request-count";

export interface MainProps {
  path?: string;
  id?: string;
}

export const Main: React.FunctionComponent<MainProps> = props => {
  const theme = useTheme();
  const [, params] = useRoute("/:game*");
  const [showingGame, setShowingGame] = useState("");
  // const theme = useTheme();
    const isLarge = useMedia({ minWidth: "768px" });
    const [activeTab, setActiveTab] = React.useState(0);
    const { value: followRequests } = useFollowRequests();
    // const [, params] = useRoute("/:game*");
    // const showingGame = params.game;
    const [query, setQuery] = React.useState("");
    const [, setLocation] = useLocation();

    const renderList = isLarge || !showingGame;
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
        
        {/* <MainControl /> */}
        
        <Layer
          aria-hidden={!renderList}
          css={{
            display: renderList ? "flex" : "none",
            boxSizing: "border-box",
            flexDirection: "column",
            flex: "1",
            boxShadow: "none",
            background: "white",
            position: "absolute",
            width: "100%",
            borderRadius: 0,
            [theme.mediaQueries.md]: {
              display: "flex",
              position: "fixed",
              zIndex: theme.zIndices.fixed,
              top: 0,
              boxShadow: theme.shadows.xl,
              overflow: "hidden",
              width: "100%",
              maxWidth: "325px",
              borderRadius: theme.radii.lg,
              margin: theme.spaces.lg,
              marginRight: 0,
              height: `calc(100vh - ${theme.spaces.lg} - ${theme.spaces.lg})`
            },
            [theme.mediaQueries.lg]: {
              margin: theme.spaces.xl,
              marginRight: 0,
              width: "400px",
              maxWidth: "400px",
              height: `calc(100vh - ${theme.spaces.xl} - ${theme.spaces.xl})`
            }
          }}
        >
          <div
            css={[
              {
                position: "fixed",
                width: "100%",
                top: 0,
                zIndex: theme.zIndices.fixed,
                background: theme.colors.palette.gray.base,
                [theme.mediaQueries.md]: {
                  zIndex: theme.zIndices.sticky,
                  position: "sticky"
                }
              }
            ]}
          >
            <MainNavBar />

            <div css={{ flex: "0 0 auto", zIndex: 2 }}>
              <DarkMode>
                <Tabs
                  css={{
                    position: "sticky",
                    top: 0,
                    background: theme.colors.palette.gray.base
                  }}
                  onChange={i => {setLocation("/");setActiveTab(i)}}
                  value={activeTab}
                  variant="evenly-spaced"
                >
                  <Tab id="games">Games</Tab>
                  <Tab id="following">Practices</Tab>
                  <Tab
                    badge={
                      followRequests && followRequests.docs.length
                        ? followRequests.docs.length
                        : null
                    }
                    id="followers"
                  >
                    Messages                
                  </Tab>
                </Tabs>
              </DarkMode>
            </div>
          </div>
          <div
            css={{
              background: theme.colors.palette.gray.base,
              height: "100px",
              [theme.mediaQueries.md]: {
                display: "none"
              }
            }}
          />
          <Pager
            enableScrollLock
            value={activeTab}
            onRequestChange={i => setActiveTab(i)}
            lazyLoad
          >
            <TabPanel
              css={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                // minHeight: 0,
                
              }}
              id="games"
            >
              <GameList query={query} />
            </TabPanel>

            <TabPanel css={{ height: "100%" }} id="following">
              <PracticesList />
            </TabPanel>

            <TabPanel id="followers">
              <MessagesList />
            </TabPanel>

          </Pager>
        </Layer>

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
