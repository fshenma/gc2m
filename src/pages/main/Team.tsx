/** @jsx jsx */
import { jsx, Global } from "@emotion/core";
import * as React from "react";
import Editor, { tryValue } from "../../components/Editor";
import { ImageUpload } from "../../components/ImageUpload";
import { Image } from "../../components/Image";
import { Value } from "slate";
import debug from "debug";
import {TeamType} from "../../models/Team";
import "./react-datetime.css";
import Datetime from "react-datetime";
import initialValue from "../../value.json";
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
import { getUserFields, createEntry, deleteEntry, updateEntry, createTeamEntry,updateTeamEntry } from "../../utils/db";
import { useSession } from "../../utils/auth";
import Helmet from "react-helmet";
import { Link, useLocation } from "wouter";
import moment from "moment";

let n = 0;

function getHighlightKey() {
  return `highlight_${n++}`;
}

const log = debug("app:Compose");

export interface TeamProps {
  id?: string;
  defaultTeamName?: string;
  defaultTeamLocation?:string;
  defaultCoach?: string;
  defaultRoster?: string;
  defaultNotes?: string;  
  readOnly?: boolean;
  editable?: boolean;
}

/**
 * THIS IS A DISASTER. HAHAHhahha.. ugh. Rewrite when i'm not lazy
 * @param param0
 */

export const Team: React.FunctionComponent<TeamProps> = ({
  readOnly,
  id,
  editable,  
  defaultCoach,
  defaultRoster,
  defaultTeamLocation,
  defaultNotes,
  defaultTeamName = ""
}) => {
  const theme = useTheme();
  const toast = useToast();
  const {user} = useSession();
   
  // const [gamePlaceholder, setGamePlaceholder] = React.useState("Game Location");
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(!readOnly);
  const [content, setContent] = React.useState(() => {
    return defaultNotes
      ? tryValue(defaultNotes)
      : Value.fromJSON(initialValue);
  });
  const [teamName, setTeamName] = React.useState(defaultTeamName);
  const defaultBostonLocation= "Boston, MA";
  const [teamLocation, setTeamLocation] = React.useState(defaultTeamLocation);  
  const [coach, setCoach] = React.useState(defaultCoach);   
  const [roster, setRoster] = React.useState(defaultRoster);
  const [, setLocation] = useLocation();

  const ref = React.useRef(null);
  const [hoverOpponent, setHoverOpponent] = React.useState(null);
  const hoverIngredientRef = React.useRef(hoverOpponent);

  React.useEffect(() => {
    typeof(teamLocation) === "undefined"?setTeamLocation(defaultBostonLocation):teamLocation;
    hoverIngredientRef.current = hoverOpponent;    
  }, [hoverOpponent,teamLocation]);

   

  async function saveTeam(newTeam: TeamType) {
    log("create entry");

    try {
      setLoading(true);
      const entry = await createTeamEntry({
        ...newTeam,
        userId: user.uid,
        createdBy: getUserFields(user),
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

  async function updateTeam(
    id: string,
    team: TeamType
  ) {
    log("update entry: %s", id);
    setLoading(true);
    try {
      await updateTeamEntry(id, {
        ...team,
        createdBy: getUserFields(user),    
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
    <div
      css={{
        [theme.mediaQueries.md]: {
          height: "auto",
          display: "block"
        }
      }}
    >
      <Helmet title={teamName ? teamName : "New Team"} />
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
                value={teamName}
                placeholder="Team Name"
                aria-label="Team Name"
                onChange={e => {
                  setTeamName(e.target.value);
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
                {teamName}
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
                onPress={() => {setEditing(false);teamLocation===""?setTeamLocation(defaultBostonLocation):teamLocation}}
              >
                Cancel
              </Button>
            )}
            {editing && (
              <Button
                intent="primary"
                disabled={!teamName}
                css={{ marginLeft: theme.spaces.sm }}
                onPress={() => {
                  const current = ref.current as any;
                  const { text, content } = current.serialize();
                  const toSave = {
                    teamName,
                    teamLocation,
                    coach,
                    roster,
                    description: content,
                    plain: text,                              
                  };

                  id ? updateTeam(id, toSave) : saveTeam(toSave);
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
                <Text variant="h5">Location</Text>
                {editing ? (
                  <>
                    
                    <Contain>
                      <TransparentInput 
                        // placeholder={gamePlaceholder}
                        value={teamLocation}                         
                        onFocus = {() => {teamLocation===defaultBostonLocation?setTeamLocation(""):teamLocation}} 
                        onChange={e => {
                          setTeamLocation(e.target.value);
                        }}
                      />
                    </Contain>
                  </>
                ) : (
                    <>
                       
                        <>
                          <Text >{teamLocation}</Text>
                           
                        </>
                       
                    </>
                  )}
              </div>             
            
            <div css={{ marginTop: theme.spaces.lg }}>
                <Text variant="h5">Coach</Text>
                {editing ? (
                  <>
                    
                    <Contain>
                      <TransparentInput 
                        placeholder="team coach"
                        value={coach}                         
                        // onFocus = {() => {teamLocation===defaultBostonLocation?setTeamLocation(""):teamLocation}} 
                        onChange={e => {
                          setCoach(e.target.value);
                        }}
                      />
                    </Contain>
                  </>
                ) : (
                    <>
                       
                        <>
                          <Text >{teamLocation}</Text>
                           
                        </>
                       
                    </>
                  )}
              </div>             

              <div css={{ marginTop: theme.spaces.lg }}>
                <Text variant="h5">Roster</Text>
                {editing ? (
                  <>
                    
                    <Contain>
                      <TransparentInput 
                        placeholder="team roster"
                        value={roster}                         
                        // onFocus = {() => {teamLocation===defaultBostonLocation?setTeamLocation(""):teamLocation}} 
                        onChange={e => {
                          setRoster(e.target.value);
                        }}
                      />
                    </Contain>
                  </>
                ) : (
                    <>
                       
                        <>
                          <Text >{teamLocation}</Text>
                           
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
             
              <div css={{ marginTop: theme.spaces.lg }}>
                <Text variant="h5">Notes</Text>
                <div>
                  <Editor
                    ref={ref}
                    value={content}
                    onChange={value => setContent(value)}
                    renderAnnotation={renderAnnotation}
                    initialValue={
                      defaultNotes ? defaultNotes : null
                    }
                    readOnly={!editing}
                  />
                </div>
              </div>
               
            </div>
          </Container>

          
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
