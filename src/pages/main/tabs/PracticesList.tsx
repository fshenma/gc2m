/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import { usePractices } from "../../../hooks/with-practices-request";
import {
  List,
  ListItem,
  Avatar,
  IconButton,
  Button,
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
  InputBaseProps,
  Input
} from "sancho";
import { SearchBox } from "../../../components/SearchBox";
import debug from "debug";
import algoliasearch from "algoliasearch";
import config from "../../../firebase-config";
import { useSession } from "../../../utils/auth";
import find from "lodash.find";
import { deleteRequestFollow, requestFollow } from "../../../utils/db";
// import { FollowingRecipes } from "../components/FollowingRecipes";
// import { User } from "firebase";
// import Editor, { tryValue } from "../../../components/Editor";
import { StackItem, StackContext } from "react-gesture-stack";
// import { animated } from "react-spring";
import { PracticeType } from "../../../models/PracticeType";
import Datetime from "react-datetime";
import moment from "moment";
import { TransparentInput } from "../../../components/TransparentInput";
import { Contain } from "../../../components/Contain";
import { SearchTitle } from "../components/SearchTitle";

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
  const [content, setContent] = React.useState("");
  const [practiceDateTime, setPracticeDateTime] = React.useState(null);
  const [practiceLocation, setPracticeLocation] = React.useState("");  
  const [query, setQuery] = React.useState("");
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

  async function deleteRequest(id: string) {
    try {
      log("delete request: %s", id);
      await deleteRequestFollow(id);
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred while cancelling your request.",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  const noUsers = !query && (!practiceList || (practiceList && practiceList.length === 0));

  const [index, setIndex] = React.useState(0);

  const [relation, setRelation] = React.useState(null);
  const [practice, setPractice] = React.useState(null);
  function unfollow(id: string) {
    deleteRequest(id);
    setRelation(null);
    setIndex(0);
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
                label="Search for users to follow"
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
                        // interactive={practice.confirmed ? true : false}
                        onPress={() =>
                          showPractice(
                            // {
                            practice
                            // id: practice.userId,
                            // ...practice.toUser
                            // }
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
                              <Button
                                onPress={e => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  deleteRequest(practice.id);
                                }}
                                size="sm"
                              >
                                update
                              </Button>
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
                        <MenuItem onPress={() => unfollow(practice.userId)}>
                          Unfollow user
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
                // <FollowingRecipes key={relation.id} id={relation.id} />
                // practice.practiceDate
                <div
                  css={{
                    flex: 1,
                    [theme.mediaQueries.md]: {
                      flex: "none"
                    }
                  }}
                >
                  <div>
                    <Container>
                      <div css={{ marginTop: theme.spaces.lg }}>
                        <Text variant="h6">Practice Date</Text>
                        {editing ? (
                          <div
                            css={{
                              display: "flex",
                              marginLeft: "-0.25rem",
                              paddingLeft: "0.25rem",
                              marginRight: "-0.25rem",
                              paddingRight: "0.25rem",

                              // borderRadius: "0.25rem",
                              marginBottom: theme.spaces.xs,
                              fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji'",
                              '& input': {
                                fontFamily: "inherit;",
                                width: "200px",
                              }
                            }}
                          >
                            <Datetime
                              value={moment(practice.practiceDate.toDate()).format("dddd, MM/DD/YYYY h:mm a")}
                              dateFormat={"dddd, DD-MMM-YYYY"}
                              timeFormat={true}
                              isValidDate={current => {
                                return current.day() !== 0 && current.day() !== 6;
                              }}
                              onChange={value => setPracticeDateTime(value)}
                            />
                          </div>
                        ) : (
                            <>
                              <Text>{moment(practice.practiceDate.toDate()).format("dddd, MM/DD/YYYY h:mm a")}</Text>
                            </>
                          )}
                      </div>
                      <div css={{ marginTop: theme.spaces.lg }}>
                        <Text variant="h6">Location</Text>
                        {editing ? (
                          <>

                            <Contain>
                              <TransparentInput
                                // placeholder={gamePlaceholder}
                                value={practice.practiceLocation}
                                // onFocus = {() => {practiceLocation===defaultBostonLocation?setPracticeLocation(""):practiceLocation}} 
                                onChange={e => {
                                  setPracticeLocation(e.target.value);
                                }}
                              />
                            </Contain>
                          </>
                        ) : (
                            <>
                              <>
                                <Text >{practice.practiceLocation}</Text>
                              </>
                            </>
                          )}
                      </div>
                      <div css={{ marginTop: theme.spaces.lg }}>
                        <Text variant="h6">Notes</Text>
                        <div>
                        <>
                              <>
                                <Text >{practice.plain}</Text>
                              </>
                            </>
                        </div>
                      </div>
                    </Container>
                  </div>
                </div>
              )}
            </StackItem>
          )
        }
      ]}
    />
  );
};

