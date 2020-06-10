import { List, ListItem, Skeleton, Avatar, IconPlus, IconChevronRight, CloseButton, useTheme } from "sancho";
import React from "react";
import algoliasearch from "algoliasearch";
import { usePractices } from "../../../hooks/with-practices-request";
import { PracticeType } from "../../../models/PracticeType";

export const PracticeStackList = () => {
    const [editing, setEditing] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const { loading, practiceList } = usePractices(false);
    const theme = useTheme();
    const [practice, setPractice] = React.useState(null);
    const [index, setIndex] = React.useState(0);
    const [
        queryResults,
        setQueryResults
      ] = React.useState<algoliasearch.Response | null>(null);
    
    function showPractice(practice: PracticeType) { //user: User
        setPractice(practice);
        setIndex(1);
      }

    return (
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
                        // onPress={() => }
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
                                //   deletePractice(practice.id);
                                }}
                                size="sm"
                              />
                                 
                            )
                        }
                      />
                    );
                  })}
                </List>
    );
}