import * as React from "react";
import { ResponsivePopover, MenuList, MenuItem, IconUser, IconList, IconHome, MenuDivider, IconPackage, IconButton, IconMoreVertical } from "sancho"
import { signOut } from "../../../utils/auth"

export const Profile = () => {

    return (
        <ResponsivePopover
            content={
                <MenuList>
                    <MenuItem contentBefore={<IconUser />} onPress={() => alert("Hello 1")}>
                        Profile
                      </MenuItem>
                    <MenuItem contentBefore={<IconList />} component="a" href="#">
                        Lists
                      </MenuItem>
                    <MenuItem contentBefore={<IconHome />}>Moments</MenuItem>
                    <MenuDivider />

                    <MenuItem contentBefore={<IconPackage />} onPress={signOut}>Sign Out</MenuItem>
                </MenuList>
            }>
            <IconButton variant="ghost" icon={<IconMoreVertical />} label="show more" />
        </ResponsivePopover>
    )
}