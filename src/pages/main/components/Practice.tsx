/** @jsx jsx */
import { jsx, Global } from "@emotion/core";
import * as React from "react";
import Editor, { tryValue } from "../../../components/Editor";
import { ImageUpload } from "../../../components/ImageUpload";
import { Image } from "../../../components/Image";
import { Value } from "slate";
import debug from "debug";
import { PracticeType, Opponent } from "../../../models/PracticeType";
import "./react-datetime.css";
import Datetime from "react-datetime";
import initialValue from "../../../value.json";
// import { Opponent } from "./tabs/GameList";
import {
  Navbar,
  Toolbar,
  Input,
  Text,
  Button,
  IconButton,
  MenuList,
  MenuItem,
  useTheme,
  InputBaseProps,
  useToast,
  LayerLoading,
  Container,
  ResponsivePopover,
  IconX,
  IconMoreVertical,
  IconArrowLeft,
  Tooltip
} from "sancho";
import { getUserFields, createPracticeEntry, deleteEntry, updatePracticeEntry } from "../../../utils/db";
import { useSession } from "../../../utils/auth";
import Helmet from "react-helmet";
import { Link, useLocation } from "wouter";
import moment from "moment";

let n = 0;

function getHighlightKey() {
  return `highlight_${n++}`;
}

const log = debug("app:Compose");

export interface PracticeProps {
  id?: string;
  defaultTitle?: string;
  defaultImage?: string;
  defaultDescription?: string;
  defaultPracticeDate?:Date;
  defaultPracticeLocation?:string;
  defaultOpponents?: Opponent[];
  readOnly?: boolean;
  editable?: boolean;
  defaultCredit?: string;
}

/**
 * THIS IS A DISASTER. HAHAHhahha.. ugh. Rewrite when i'm not lazy
 * @param param0
 */

export const Practice: React.FunctionComponent<PracticeProps> = ({
  readOnly,
  id,
  editable,
  defaultCredit = "",
  defaultPracticeDate, 
  defaultPracticeLocation,
  defaultDescription,
  defaultImage,
  defaultOpponents,
  defaultTitle = ""
}) => {
  const theme = useTheme();
  const toast = useToast();
  const {user, activeTeam} = useSession();
      
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(!readOnly);
  const [content, setContent] = React.useState(() => {
    return defaultDescription
      ? tryValue(defaultDescription)
      : Value.fromJSON(initialValue);
  });
  const [image, setImage] = React.useState(defaultImage);
  const [title, setTitle] = React.useState(defaultTitle);
  const [practiceDateTime, setPracticeDateTime] = React.useState(defaultPracticeDate);
  const defaultBostonLocation= "Boston, MA";
  const [practiceLocation, setPracticeLocation] = React.useState(defaultPracticeLocation);  
  
  const [credit, setCredit] = React.useState(defaultCredit);
  const [Opponents, setOpponents] = React.useState<Opponent[]>(
    defaultOpponents || [
      {
        name: "",
        score: ""
      }
    ]
  );
  const [, setLocation] = useLocation();

  const ref = React.useRef(null);
  const [hoverOpponent, setHoverOpponent] = React.useState(null);
  const hoverIngredientRef = React.useRef(hoverOpponent);

  React.useEffect(() => {
    typeof(practiceLocation) === "undefined"?setPracticeLocation(defaultBostonLocation):practiceLocation;
    hoverIngredientRef.current = hoverOpponent;    
  }, [hoverOpponent,practiceLocation]);

  function onOpponentChange(i: number, value: Opponent) {
    Opponents[i] = value;
    log("on ingredient change: %o", Opponents);
    setOpponents([...Opponents]);
  }

  function addNewOpponent() {
    Opponents.push({ name: "", score: "" });
    setOpponents([...Opponents]);
  }

  function removeOpponent(i: number) {
    Opponents.splice(i, 1);
    setOpponents([...Opponents]);
  }

  async function savePractice(newPractice: PracticeType) {
    log("create entry");

    try {
      setLoading(true);
      const entry = await createPracticeEntry({
        ...newPractice,
        userId: user.uid,
        createdBy: getUserFields(user),
        Opponents: Opponents.filter(ing => ing.name),
      });
      setLocation("/" + entry.id, { replace: true });
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast({
        title: "An error occurred. Please try again",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  async function updatePractice(
    id: string,
    practice: PracticeType
  ) {
    log("update entry: %s", id);
    setLoading(true);
    try {
      await updatePracticeEntry(id, {
        ...practice,
        createdBy: getUserFields(user),
        Opponents: Opponents.filter(ing => ing.name)
      });
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "An error occurred. Please try again",
        subtitle: err.message,
        intent: "danger"
      });
    }
    setLoading(false);
  }

  // this is horribly inefficient...
  React.useEffect(() => {
    const slate = ref.current;
    if (!slate) {
      return;
    }

    const { editor } = slate;

    const { value } = editor;
    const { document, annotations } = value;

    editor.withoutSaving(() => {
      annotations.forEach((ann: any) => {
        if (ann.type === "highlight") {
          editor.removeAnnotation(ann);
        }
      });

      for (const [node, path] of document.texts()) {
        const { key, text } = node;

        Opponents.forEach(ing => {
          const normalized = ing.name.toLowerCase();
          const parts = text.toLowerCase().split(normalized);
          let offset = 0;

          parts.forEach((part, i) => {
            if (i !== 0) {
              editor.addAnnotation({
                key: getHighlightKey(),
                type: "highlight",
                data: { id: ing },
                anchor: { path, key, offset: offset - normalized.length },
                focus: { path, key, offset }
              });
            }

            offset = offset + part.length + normalized.length;
          });
        });
      }
    });
  });

  function renderAnnotation(props, editor, next) {
    const { children, annotation, attributes } = props;
    const annotationId = annotation.get("data").get("id");
    const isHovering = hoverIngredientRef.current === annotationId;

    switch (annotation.type) {
      case "highlight":
        return (
          <Tooltip placement="top" content={annotationId.amount}>
            <span
              {...attributes}
              // onMouseEnter={() => {
              //   setHoverIngredient(annotation);
              // }}
              // onMouseLeave={() => {
              //   setHoverIngredient(null);
              // }}
              style={{
                transition: "background 0.3s ease",
                backgroundColor: isHovering
                  ? theme.colors.palette.blue.lightest
                  : hoverIngredientRef.current
                    ? "transparent"
                    : theme.colors.background.tint2
              }}
            >
              {children}
            </span>
          </Tooltip>
        );
      default:
        return next();
    }
  }

  async function handleDelete(id: string) {
    try {
      setLoading(true);
      await deleteEntry(id);
      setLocation("/", { replace: true });
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast({
        title: "An error occurred. Please try again",
        subtitle: err.message,
        intent: "danger"
      });
    }
  }

  return (
    <div id={id}
      css={{
        [theme.mediaQueries.md]: {
          height: "auto",
          display: "block"
        }
      }}
    >
      <Helmet title={title ? title : "New Practice"} />
      <Global
        styles={{
          ".Editor": {
            fontFamily: theme.fonts.base,
            color: theme.colors.text.default,
            lineHeight: theme.lineHeights.body
          },
          ".filepond--wrapper": {
            padding: theme.spaces.lg,
            paddingBottom: 0
          },
          ".filepond--root": {
            marginBottom: 0
          },
          ".filepond--label-action": {
            display: "flex",
            alignItems: "center",
            textDecoration: "none"
          },
          ".filepond--label-action > svg": {
            width: "40px",
            height: "40px",
            fill: theme.colors.text.default
          },
          ".filepond--label-action > span": {
            border: 0,
            clip: "rect(0 0 0 0)",
            height: "1px",
            width: "1px",
            margin: "-1px",
            padding: 0,
            overflow: "hidden",
            position: "absolute"
          },
          ".filepond--panel-root": {
            backgroundColor: theme.colors.background.tint1
          },
          '.Editor [contenteditable="false"]': {
            opacity: "1 !important" as any,
            color: theme.colors.scales.gray[6]
          }
        }}
      />
      <Navbar
        css={{
          zIndex: theme.zIndices.sticky,
          backgroundColor: "white",
          boxShadow: theme.shadows.sm,
          position: "sticky",
          top: 0,
          [theme.mediaQueries.md]: {
            position: "static"
          }
        }}
      >
        <Toolbar
          css={{
            alignItems: "center",
            display: "flex"
          }}
        >
          <IconButton
            icon={<IconArrowLeft />}
            component={Link}
            to="/"
            label="Go back"
            replace
            variant="ghost"
            css={{
              marginRight: theme.spaces.sm,
              [theme.mediaQueries.md]: {
                display: "none"
              }
            }}
          />
          {editing ? (
            <div css={{ marginLeft: "-0.75rem", flex: 1 }}>
              <TransparentInput
                autoComplete="off"
                autoFocus
                inputSize="lg"
                value={title}
                placeholder="Practice title"
                aria-label="Practice title"
                onChange={e => {
                  setTitle(e.target.value);
                }}
              />
            </div>
          ) : (
              <Text
                css={{
                  flex: 1,
                  textAlign: "center",
                  [theme.mediaQueries.md]: {
                    textAlign: "left"
                  }
                }}
                wrap={false}
                variant="h5"
                gutter={false}
              >
                {title}
              </Text>
            )}
          <div>
            <ResponsivePopover
              content={
                <MenuList>
                  <MenuItem
                    onPress={() => {
                      setEditing(true);
                    }}
                  >
                    Edit
                  </MenuItem>
                  <MenuItem onPress={() => handleDelete(id)}>Delete</MenuItem>
                </MenuList>
              }
            >
              <IconButton
                css={{
                  display: !editing && editable ? undefined : "none",
                  marginLeft: theme.spaces.sm
                }}
                variant="ghost"
                icon={<IconMoreVertical />}
                label="Show options"
              />
            </ResponsivePopover>

            {editing && id && (
              <Button
                variant="ghost"
                css={{
                  display: "none",
                  [theme.mediaQueries.md]: {
                    display: "inline-flex"
                  },
                  marginLeft: theme.spaces.sm
                }}
                onPress={() => {setEditing(false);practiceLocation===""?setPracticeLocation(defaultBostonLocation):practiceLocation}}
              >
                Cancel
              </Button>
            )}
            {editing && (
              <Button
                intent="primary"
                disabled={!title}
                css={{ marginLeft: theme.spaces.sm }}
                onPress={() => {
                  const current = ref.current as any;
                  const { text, content } = current.serialize();
                  const toSave = {
                    teamId: activeTeam.teamId,
                    title,
                    practiceDate: practiceDateTime.toUTCString(),
                    practiceLocation,
                    description: content,
                    plain: text,
                    Opponents,                    
                    image
                  };

                  id ? updatePractice(id, toSave) : savePractice(toSave);
                }}
              >
                Save
              </Button>
            )}
          </div>
        </Toolbar>
      </Navbar>
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
              <Text variant="h5">Practice Date</Text>
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
                      fontFamily:"inherit;",
                      width:"200px",
                    }
                  }}
                >
                  <Datetime 
                    defaultValue={practiceDateTime}
                    dateFormat={"dddd, DD-MMM-YYYY"}
                    timeFormat={true}
                    isValidDate={current => {
                      return current.day() !== 0 && current.day() !== 6;
                    }}
                    onChange={value => setPracticeDateTime(moment(value).toDate)}                
                  />

                </div>
              ) : (
                  <>
                    <Text>{moment(practiceDateTime).format("dddd, MM/DD/YYYY h:mm a")}</Text>
                  </>
                )}
            </div>
            <div css={{ marginTop: theme.spaces.lg }}>
                <Text variant="h5">Location</Text>
                {editing ? (
                  <>
                    
                    <Contain>
                      <TransparentInput 
                        // placeholder={gamePlaceholder}
                        value={practiceLocation}                         
                        onFocus = {() => {practiceLocation===defaultBostonLocation?setPracticeLocation(""):practiceLocation}} 
                        onChange={e => {
                          setPracticeLocation(e.target.value);
                        }}
                      />
                    </Contain>
                  </>
                ) : (
                    <>
                       
                        <>
                          <Text >{practiceLocation}</Text>
                           
                        </>
                       
                    </>
                  )}
              </div>             
            
            <div
              css={{
                paddingTop: theme.spaces.lg,
                paddingBottom: theme.spaces.lg
              }}
            >
              {Opponents.length > 0 && (
                <div>
                  <Text variant="h5">Teams</Text>
                  {Opponents.map((ingredient, i) => {
                    const activeHover = ingredient == hoverOpponent;

                    return (
                      <div key={i}>
                        {editing ? (
                          <Contain>
                            <div
                              onMouseEnter={() =>
                                setHoverOpponent(ingredient)
                              }
                              onMouseLeave={() => setHoverOpponent(null)}
                              css={{
                                backgroundColor: activeHover
                                  ? theme.colors.palette.blue.lightest
                                  : "transparent",
                                display: "flex",
                                [theme.mediaQueries.md]: {
                                  maxWidth: "400px"
                                }
                              }}
                            >
                              <TransparentInput
                                autoFocus={!readOnly && Opponents.length > 1}
                                placeholder="Name"
                                value={ingredient.name}
                                onChange={e => {
                                  onOpponentChange(i, {
                                    ...ingredient,
                                    name: e.target.value
                                  });
                                }}
                              />                                                           
                            </div>
                          </Contain>
                        ) : (
                            <div
                              onMouseEnter={() => setHoverOpponent(ingredient)}
                              onMouseLeave={() => setHoverOpponent(null)}
                              css={{
                                backgroundColor: activeHover
                                  ? theme.colors.palette.blue.lightest
                                  : "transparent",
                                display: "flex",
                                marginLeft: "-0.25rem",
                                paddingLeft: "0.25rem",
                                marginRight: "-0.25rem",
                                paddingRight: "0.25rem",
                                // borderRadius: "0.25rem",
                                marginBottom: theme.spaces.xs,
                                justifyContent: "space-between",
                                [theme.mediaQueries.md]: {
                                  width: "300px"
                                }
                              }}
                            >
                              <Text
                                css={{
                                  paddingRight: theme.spaces.xs,
                                  backgroundColor: activeHover
                                    ? theme.colors.palette.blue.lightest
                                    : "white"
                                }}
                              >
                                {ingredient.name}
                              </Text>
                              <div
                                css={{
                                  flex: 1,
                                  borderBottom: `1px dashed ${
                                    theme.colors.border.muted
                                    }`,
                                  marginBottom: "6px"
                                }}
                              />
                              <Text
                                css={{
                                  paddingLeft: theme.spaces.xs,
                                  backgroundColor: activeHover
                                    ? theme.colors.palette.blue.lightest
                                    : "white"
                                }}
                              >
                                {ingredient.score}
                              </Text>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}             

              <div css={{ marginTop: theme.spaces.lg }}>
                <Text variant="h5">Notes</Text>
                <div>
                  <Editor
                    ref={ref}
                    value={content}
                    onChange={value => setContent(value)}
                    renderAnnotation={renderAnnotation}
                    initialValue={
                      defaultDescription ? defaultDescription : null
                    }
                    readOnly={!editing}
                  />
                </div>
              </div>
              
            </div>
          </Container>

          {editing ? (
            <ImageUpload
              onRequestSave={id => setImage(id)}
              onRequestClear={() => setImage(null)}
              defaultFiles={
                image
                  ? [
                    {
                      source: image,
                      options: {
                        type: "local"
                      }
                    }
                  ]
                  : []
              }
            />
          ) : image ? (
            <Image alt={title} id={image} />
          ) : null}

        </div>
      </div>
      <LayerLoading loading={loading} />
    </div>
  );
};

interface TransparentInputProps extends InputBaseProps { }

const TransparentInput = (props: TransparentInputProps) => {
  const theme = useTheme();
  return (
    <Input
      css={{
        background: "none",
        border: "none",
        boxShadow: "none",
        // paddingTop: theme.spaces.xs,
        // paddingBottom: theme.spaces.xs,
        ":focus": {
          outline: "none",
          boxShadow: "none",
          background: "none"
        }
      }}
      {...props}
    />
  );
};

const Contain = props => {
  return (
    <div
      css={{
        marginTop: "-0.25rem",
        marginLeft: "-0.75rem",
        marginRight: "-0.75rem"
      }}
      {...props}
    />
  );
};
