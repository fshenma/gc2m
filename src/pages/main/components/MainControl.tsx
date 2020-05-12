import * as React from "react";
import { Layer, DarkMode, Tabs, Tab, Pager, TabPanel, useTheme } from "sancho";
import { useRoute ,useLocation} from "wouter";
import { MainNavBar } from "./MainNavBar";
import { GameList } from "../tabs/GameList";
import { PracticesList } from "../tabs/PracticesList";
import { MessagesList } from "../tabs/MessagesList";
import { useFollowRequests } from "../../../hooks/with-follow-request-count";
import useMedia from "use-media";


export const MainControl = () => {
    const theme = useTheme();
    const isLarge = useMedia({ minWidth: "768px" });
    const [activeTab, setActiveTab] = React.useState(0);
    const { value: followRequests } = useFollowRequests();
    const [, params] = useRoute("/:game*");
    const showingGame = params.game;
    const [query, setQuery] = React.useState("");
    const [, setLocation] = useLocation();

    const renderList = isLarge || !showingGame;

    return (
        
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

            <TabPanel css={{ height: "100%" }} id="followers">
              <MessagesList />
            </TabPanel>

          </Pager>
        </Layer>

    
    )
}