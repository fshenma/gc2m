/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
// import algoliasearch from "algoliasearch";
// import algolia from "../../../components/Search";
import debug from "debug";
import { Link, useRoute, useLocation } from "wouter";
import { useSession } from "../../../utils/auth";
import * as firebase from "firebase/app";
import {getUserFields, updateTeamEntry } from "../../../utils/db";
import orderBy from "lodash.orderby";
import {
  Text,
  List,
  ListItem,
  Spinner,
  Button,
  useTheme,
  useToast,
  Embed,
  Skeleton
} from "sancho";
import {Opponent} from "../../../models/Game"
import { useFirebaseImage } from "../../../components/Image";
import { FadeImage } from "../../../components/FadeImage";
import usePaginateQuery from "firestore-pagination-hook";
const log = debug("app:GameList");

// export interface Opponent {
//   name: string;
//   score: string;
// }

type Action<K, V = void> = V extends void ? { type: K } : { type: K } & V;

export interface Team {
  id: string;
  teamName: string;
  teamLocation: string;
  coach: string;
  roster: string;   
  plain: string;
  updatedAt: any;
  userId: string;
  active?: boolean;
  // image?: string;
  createdBy?: {
    email: string;
    photoURL: string;
  };
  // author: string;
  description: string;
  // Opponents: Opponent[];
}

// export type ActionType =
//   | Action<"QUERY", { value: string }>
//   | Action<"SEARCH", { value: algoliasearch.Response }>;

// interface StateType {
//   searchResponse: algoliasearch.Response | null;
//   query: string;
// }

// const initialState = {
//   searchResponse: null,
//   query: ""
// };

// function reducer(state: StateType, action: ActionType) {
//   switch (action.type) {
//     case "QUERY":
//       return {
//         ...state,
//         query: action.value
//       };

//     case "SEARCH":
//       return {
//         ...state,
//         searchResponse: action.value
//       };
//   }
// }

export interface TeamListProps {
  // query: string;
}

export const TeamList: React.FunctionComponent<TeamListProps> = ({
  //query
}) => {
  const theme = useTheme();
  // const [state, dispatch] = React.useReducer(reducer, initialState);  
  const {user} = useSession();

  const {
    loading,
    loadingError,
    loadingMore,
    loadingMoreError,
    hasMore,
    items,
    loadMore
  } = usePaginateQuery(
    firebase
      .firestore()
      .collection("teams")
      .where("userId", "==", user!.uid)
      .orderBy("updatedAt", "desc"),
    {
      limit: 25
    }
  );

  // // perform an algolia query when query changes
  // React.useEffect(() => {
  //   if (query) {
  //     log("query: %s", query);
      // algolia.search(query).then(results => {
      //   log("results: %o", results);
      //   dispatch({
      //     type: "SEARCH",
      //     value: results
      //   });
      // });
  //   }
  // }, [query]);

  // retrieve our algolia search index on mount
  // React.useEffect(() => {
  //   // algolia.getIndex();
  // }, []);


  // retrieve our algolia search index on mount
  // React.useEffect(() => {
  //   // algolia.getIndex();
  // }, []);

  return (
    <div>
      {/* {state.searchResponse ? (
        <div>
          <List>
            {state.searchResponse.hits.map(hit => (
              <GameListItem
                key={hit.objectID}
                editable={hit.userId === user!.uid}
                game={hit}
                id={hit.objectID}
                highlight={hit._highlightResult}
              />
            ))}
          </List>
        </div>
      ) : ( */}
        <div>
          {/* {!loading && items.length === 0 && (
            <Text
              muted
              css={{
                display: "block",
                fontSize: theme.fontSizes[0],
                margin: theme.spaces.lg
              }}
            >
              You have no recipes listed. Create your first by clicking the plus
              arrow above.
            </Text>
          )} */}

          <List>
             
            {orderBy(
              items,
              item => item.get("updatedAt").toMillis(),
              "desc"
            ).map(g => (
              <TeamListItem
                id={g.id}
                key={g.id}
                // editable
                team={g.data() as Team}
              />
            ))}
          </List>

          {/* {loadingMore && <Spinner />}
          {loadingError || (loadingMoreError && <div>Loading error...</div>)}

          {hasMore && !loadingMore && (
            <div
              css={{
                textAlign: "center",
                marginBottom: theme.spaces.md,
                marginTop: theme.spaces.md
              }}
            >
              <Button
                onPress={() => {
                  loadMore();
                }}
              >
                Load more
              </Button>
            </div>
          )} */}
        </div>
      {/* )} */}
    </div>
  );
};

interface TeamListItemProps {
  // editable?: boolean;
  team: Team;
  id: string;
  highlight?: any;
}

export function TeamListItem({ team, id, highlight }: TeamListItemProps) {
  const theme = useTheme();
  // const { src, error } = useFirebaseImage("thumb-sm@", game.image);
  const href = `/${id}/${team.teamName}`;
  const [isActive] = useRoute(href);
  const [activeTeam, setActiveTeam] = React.useState("");
  const [, setLocation] = useLocation();
  const {user,dispatch} = useSession();
  const toast = useToast();

  React.useEffect(() => {
      log(activeTeam) ;
      // saveActiveTeam(activeTeam);
      team.active && dispatch({type:"SET_ACTIVE",item:activeTeam});
    }, [activeTeam]);

   

    const  saveActiveTeam = async () => {
    log("create entry");

    try {
      // const user = useSession();
      team.active = true;
      await updateTeamEntry(
        id,
        {...team,
          createdBy: getUserFields(user),
        }
        
      );
      dispatch({type:"SET_ACTIVE",item:team.teamName});
      // setLocation(href);
    } catch (err) {
      console.error(err);
       
      toast({
        title: "An error occurred. Please try again",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  return (
    <ListItem
      wrap={false}
      onClick={e => {
        // e.preventDefault();      
        // setActiveTeam(team.teamName);
        // setLocation(href);
        saveActiveTeam();
      }}
      aria-current={isActive}
      href={`/${id}`}
      css={{
        paddingTop: 0,
        paddingBottom: 0,
        height: "56px",
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
        "& em": {
          fontStyle: "normal",
          color: theme.colors.text.selected
        },
        backgroundColor: isActive ? theme.colors.background.tint1 : null,
        "& > *": {
          flex: 1,
          overflow: "hidden"
        }
      }}
      // contentAfter={
      //   game.image && !error ? (
      //     <Embed css={{ width: "60px" }} width={75} height={50}>
      //       <FadeImage src={src} hidden />
      //     </Embed>
      //   ) : null
      // }
      // secondary={
      //   highlight ? (
      //     <span dangerouslySetInnerHTML={{ __html: highlight.author.value }} />
      //   ) : (
      //     recipe.author
      //   )
      // }
      primary={
        highlight ? (
          <span dangerouslySetInnerHTML={{ __html: highlight.title.value }} />
        ) : (
          team.teamName
        )
      }
    />
  );
}
