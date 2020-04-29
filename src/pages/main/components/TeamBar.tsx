import * as React from "react";
import { ResponsivePopover, MenuList, MenuDivider, MenuItem, IconUsers, IconEdit, DarkMode, Button, IconChevronDown } from "sancho";
import { TeamList } from "./TeamList";
import {  useLocation } from "wouter";

interface TeamBarProps {
    ActiveTeam?: string;
    toLink?: string;
  }
  
export const TeamBar: React.FunctionComponent<TeamBarProps> = ({ActiveTeam, toLink}:TeamBarProps) => {
    const [, setLocation] = useLocation();

    return (
        <ResponsivePopover
            content={
                <MenuList>
                    <TeamList />
                    <MenuDivider />
                    <MenuItem contentBefore={<IconEdit />}  onPress={() => setLocation("/newTeam")} >Add Team </MenuItem>
                    <MenuItem contentBefore={<IconEdit />}  onPress={() => setLocation("/editTeam")} >Edit Team </MenuItem>
                </MenuList>
            }
        >
            <DarkMode>
                <Button
                    size="md"
                    iconAfter={<IconChevronDown />}
                    variant="ghost"
                >
                    {/* {user.displayName || user.email} */}
                    {ActiveTeam}
                    {/* <TeamList /> */}
                </Button>
            </DarkMode>
        </ResponsivePopover>
    )

}