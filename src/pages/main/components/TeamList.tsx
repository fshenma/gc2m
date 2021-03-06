/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
// import algoliasearch from "algoliasearch";
// import algolia from "../../../components/Search";
import debug from "debug";
import { Link, useRoute, useLocation } from "wouter";
import { useSession } from "../../../utils/auth";
import * as firebase from "firebase/app";
import { getUserFields, updateTeamEntry } from "../../../utils/db";
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
  Skeleton,
  MenuItem
} from "sancho";
import { TeamType } from "../../../models/Team";
import usePaginateQuery from "firestore-pagination-hook";
const log = debug("app:GameList");

type Action<K, V = void> = V extends void ? { type: K } : { type: K } & V;

// export interface Team {
//   id: string;
//   teamName: string;
//   teamLocation: string;
//   coach: string;
//   roster: string;
//   plain: string;
//   updatedAt: any;
//   userId: string;
//   active?: boolean;
//   // image?: string;
//   createdBy?: {
//     email: string;
//     photoURL: string;
//   };
//   // author: string;
//   description: string;
//   // Opponents: Opponent[];
// }

export interface TeamListProps {
  // query: string;
}

export const TeamList: React.FunctionComponent<TeamListProps> = ({
  //query
}) => {
  const theme = useTheme();
  // const [state, dispatch] = React.useReducer(reducer, initialState);  
  const { user } = useSession();

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

  return (
    <div>
      <div>

        <List>

          {orderBy(
            items,
            item => item.get("updatedAt").toMillis(),
            "desc"
          ).map(g => (
            // <MenuItem>
              <TeamListItem
                id={g.id}
                key={g.id}
                // editable
                team={ Object.assign({teamId: g.id}, g.data()) as TeamType}
              />
            // </MenuItem>
          ))}
        </List>

      </div>
      {/* )} */}
    </div>
  );
};

interface TeamListItemProps {
  // editable?: boolean;
  team: TeamType;
  id: string;
  highlight?: any;
}

export function TeamListItem({ team, id, highlight }: TeamListItemProps) {
  const theme = useTheme();
  const href = `/${id}/${team.teamName}`;
  const [isActive] = useRoute(href);
  const { user, activeTeam, dispatch } = useSession();
  const toast = useToast();
  const [, params] = useRoute("/:team*");
  const actTeamId = params.team;
  const [, setLocation] = useLocation();
  
  // React.useEffect(() => {

  //     team.active && dispatch({type:"SET_ACTIVE",item:team.active});

  //   }, [team.active]);

  const saveActiveTeam = async () => {
    log("create entry");

    try {
      // const user = useSession();
      if (activeTeam.teamName !== "my team" && activeTeam.teamName !== team.teamName) {
        activeTeam.active = false;

        await updateTeamEntry(
          activeTeam.teamId,
          {
            ...activeTeam,
            createdBy: getUserFields(user),
          }

        )
      }

      team.active = true;
      await updateTeamEntry(
        team.teamId,
        {
          ...team,
          createdBy: getUserFields(user),
        }

      ).then (
        dispatch({ type: "SET_ACTIVE", item: team })
        
      )      
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
    <MenuItem>
    <ListItem
      wrap={false}
      onClick={e => {
        setLocation("/");
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

      primary={
        highlight ? (
          <span dangerouslySetInnerHTML={{ __html: highlight.title.value }} />
        ) : (
            team.teamName
          )
      }
    />
    </MenuItem>
  );
}
