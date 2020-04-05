/** @jsx jsx */
import { jsx } from "@emotion/core";
import * as React from "react";
import firebase from "firebase/app";
import { Compose } from "../Compose";
import { useSession } from "../../../utils/auth";
import { useDocument } from "react-firebase-hooks/firestore";
import { useTheme, Text } from "sancho";

export interface GameProps {
  id: string;
}

export const Game: React.FunctionComponent<GameProps> = ({ id }) => {
  const theme = useTheme();
  const user = useSession();
  const { value, loading, error } = useDocument(
    firebase
      .firestore()
      .collection("scores")
      .doc(id)
  );

  if (loading) {
    return null;
  }

  if (!loading && !value.exists) {
    return null;
  }

  if (error) {
    return (
      <Text
        muted
        css={{
          display: "block",
          padding: theme.spaces.lg,
          textAlign: "center"
        }}
      >
        Oh bummer! A loading error occurred. Please try reloading.
      </Text>
    );
  }

  if (value) {
    return (
      <Compose
        readOnly
        id={id}
        editable={value.get("userId") === user.uid}
        defaultCredit={value.get("author")}
        defaultDescription={value.get("description")}
        defaultTitle={value.get("title")}
        defaultOpponents={value.get("Opponents")}
        defaultImage={value.get("image")}
      />
    );
  }

  return null;
};
