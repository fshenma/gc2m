import * as React from "react";
import { ResponsivePopover, MenuList, MenuDivider, MenuItem, IconUsers, IconEdit, DarkMode, Button, IconChevronDown } from "sancho";
import { TeamList } from "./TeamList";
import { Link, useRoute } from "wouter";

interface TeamBarProps {
    ActiveTeam?: string;
    toLink?: string;
  }
  
export const TeamBar: React.FunctionComponent<TeamBarProps> = ({ActiveTeam, toLink}:TeamBarProps) => {

    return (
        <ResponsivePopover
            content={
                <MenuList>
                    <TeamList />
                    <MenuDivider />
                    <MenuItem contentBefore={<IconUsers />} component={Link} to={toLink}>Add Team </MenuItem>
                    <MenuItem contentBefore={<IconEdit />}  >Edit Team </MenuItem>
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