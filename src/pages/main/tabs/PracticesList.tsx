/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import { usePractices } from "../../../hooks/with-practices-request";
import {
  List,
  ListItem,
  Avatar,
  IconButton,
  Popover,
  MenuList,
  Stack,
  MenuItem,
  Text,
  useTheme,
  useToast,
  IconPlus,
  IconChevronRight,
  IconMoreVertical,
  StackTitle,
  Skeleton,
  Container,
  CloseButton,
  TextArea,
  Button
} from "sancho";
import { SearchBox } from "../../../components/SearchBox";
import debug from "debug";
import algoliasearch from "algoliasearch";
import config from "../../../firebase-config";
import { useSession } from "../../../utils/auth";
import find from "lodash.find";
import { deleteRequestFollow, requestFollow } from "../../../utils/db";
import { StackItem, StackContext } from "react-gesture-stack";
import { PracticeType } from "../../../models/PracticeType";
import Datetime from "react-datetime";
import moment from "moment";
import { TransparentInput } from "../../../components/TransparentInput";
import { Contain } from "../../../components/Contain";
import { SearchTitle } from "../components/SearchTitle";
import { Practice } from "../components/Practice";

const client = algoliasearch(
  config.ALGOLIA_APP_ID,
  config.ALGOLIA_USER_SEARCH_KEY
);

const index = client.initIndex("users");

function searchAlgoliaForUsers(query: string) {
  return index.search({ query });
}

const log = debug("app:FollowingList");

export interface PracticesListProps { }

export const PracticesList: React.FunctionComponent<
  PracticesListProps
> = props => {
  const theme = useTheme();
  const toast = useToast();
  const { user } = useSession();
  const [editing, setEditing] = React.useState(false);
  const { loading, practiceList } = usePractices(false);
  // const [content, setContent] = React.useState("");
  const [practiceDateTime, setPracticeDateTime] = React.useState(null);
  const [practiceLocation, setPracticeLocation] = React.useState("");  
  const [query, setQuery] = React.useState("");
  const defaultBostonLocation= "Boston, MA";
  const [
    queryResults,
    setQueryResults
  ] = React.useState<algoliasearch.Response | null>(null);

  React.useEffect(() => {
    async function fetchUsers() {
      if (!query) {
        return;
      }

      const results = await searchAlgoliaForUsers(query);
      log("search results: %o", results);

      const hits = results.hits
        .filter(hit => {
          if (hit.objectID === user.uid) {
            return false;
          }

          return !find(practiceList, { toUserId: hit.objectID });
        })
        .map(hit => {
          const relation = find(practiceList, { toUserId: hit.objectID });

          return {
            ...hit,
            requested: relation ? relation.id : null
          };
        });

      setQueryResults({
        ...results,
        hits
      });
    }

    fetchUsers();
  }, [query, practiceList]);

  async function inviteUser(otherUser: any) {
    try {
      log("otherUser: %o", otherUser);
      await requestFollow(user, otherUser);
      toast({
        title: `A request has been sent to ${otherUser.displayName ||
          otherUser.email}`,
        intent: "success"
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred while making your request.",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  async function deletePractice(id: string) {
    try {
      log("delete practice: %s", id);
      await deleteRequestFollow(id);
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred while deleting practice.",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  const noUsers = !query && (!practiceList || (practiceList && practiceList.length === 0));

  const [index, setIndex] = React.useState(0);
  const [locFocus, setLocFocus] = React.useState(false);
  const [desc, setDesc] = React.useState(null);
  const [descFocus, setDescFocus] = React.useState(false);
  const [practice, setPractice] = React.useState(null);
  function editPractice(id: string) {
    // deleteRequest(id);
    // setRelation(null);
    setEditing(true);
    setIndex(1);
  }

  function showPractice(practice: PracticeType) { //user: User
    setPractice(practice);
    setIndex(1);
  }

  return (
    <Stack
      css={{
        height: "calc(100vh - 97px)", // this is lame
        [theme.breakpoints.lg]: {
          height: "100%"
        }
      }}
      index={index}
      navHeight={60}
      onIndexChange={i => setIndex(i)}
      items={[
        {
          title: (
            <SearchTitle>
              <SearchBox
                css={{ borderBottom: "none" }}
                label="Search for practices"
                query={query}
                setQuery={setQuery}
              />
            </SearchTitle>
             
          ),
          content: (
            <StackItem>
              <div>
                {!loading && noUsers && (
                  <Text
                    muted
                    css={{
                      fontSize: theme.fontSizes[0],
                      display: "block",
                      margin: theme.spaces.lg
                    }}
                  >
                    You currently aren't following anyone. Start following
                    someone by searching for their email in the box above.
                  </Text>
                )}

                <List>
                  {loading && (
                    <React.Fragment>
                      <ListItem
                        interactive={false}
                        contentBefore={
                          <Skeleton
                            css={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%"
                            }}
                          />
                        }
                        primary={<Skeleton css={{ maxWidth: "160px" }} />}
                      />
                      <ListItem
                        interactive={false}
                        contentBefore={
                          <Skeleton
                            css={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%"
                            }}
                          />
                        }
                        primary={<Skeleton css={{ maxWidth: "200px" }} />}
                      />
                    </React.Fragment>
                  )}
                  {query &&
                    queryResults &&
                    queryResults.hits.map(hit => (
                      <ListItem
                        key={hit.objectID}
                        onPress={() => inviteUser(hit)}
                        contentBefore={
                          <Avatar
                            size="sm"
                            src={hit.photoURL}
                            name={hit.displayName || hit.email}
                          />
                        }
                        primary={hit.displayName || hit.email}
                        contentAfter={
                          <IconPlus
                            color={theme.colors.text.muted}
                            aria-hidden
                            size="lg"
                          />
                        }
                      />
                    ))}
                  {practiceList.map(practice => {
                    return (
                      <ListItem
                        key={practice.id}
                        onPress={() =>
                          showPractice(
                            practice                            
                          )
                          // log(practice.userId)
                        }
                        contentBefore={
                          <Avatar
                            size="sm"
                            // src={practice.toUser.photoURL}
                            name={
                              practice.title
                              // practice.toUser.displayName ||
                              // practice.toUser.email
                            }
                          />
                        }
                        primary={
                          practice.title //|| practice.toUser.email
                        }
                        contentAfter={
                          practice.confirmed ? (
                            <IconChevronRight
                              color={theme.colors.text.muted}
                              aria-hidden
                            />
                          ) : (
                            <CloseButton
                                label="Delete Practice"
                                onPress={e => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  deletePractice(practice.id);
                                }}
                                size="sm"
                              />
                                 
                            )
                        }
                      />
                    );
                  })}
                </List>
              </div>
            </StackItem>
          )
        },
        {
          title: (
            <StackTitle
              contentAfter={
                practice && (
                  <Popover
                    content={
                      <MenuList>
                        <MenuItem onPress={() => editPractice(practice.userId)}>
                          Edit
                        </MenuItem>
                      </MenuList>
                    }
                  >
                    <IconButton
                      onPress={e => e.stopPropagation()}
                      variant="ghost"
                      icon={<IconMoreVertical />}
                      label="Options"
                    />
                  </Popover>
                )
              }
              title={practice ? practice.title : ""}
            />
          ),
          content: (
            <StackItem>
              {practice && (
                <Practice />
                 )}
            </StackItem>
          )
        }
      ]}
    />
  );
};

