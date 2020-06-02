import * as React from "react";
import { useSession } from "../utils/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import * as firebase from "firebase/app";
import debug from "debug";
const log = debug("app:with-follow-requests");

/**
 * Get a list of unconfirmed follow requests,
 * used to notify a user.
 */

export function usePracticeRequests() {
  const {user} = useSession();
  const { error, loading, value } = useCollection(
    firebase
      .firestore()
      .collection("practices")
      .where("toUserId", "==", user.uid)
      .where("confirmed", "==", false)
      .limit(50)
  );

  return {
    error,
    loading,
    value
  };
}

/**
 * Get a list of followers, or users you
 * are following.
 * @param toUser boolean
 */

export function usePractices(toUser = true) {
  const {user} = useSession();

  const [loading, setLoading] = React.useState(true);
  const [practiceList, setPracticeList] = React.useState([]);

  const key = "userId";     //toUser ? "toUserId" : "fromUserId";

  React.useEffect(() => {
    setLoading(true);

    const unsubcribe = firebase
      .firestore()
      .collection("practices")
      .where(key, "==", user.uid)
    //   .orderBy("confirmed")
      .limit(100) // todo: support pagination
      .onSnapshot(value => {
        const pracList = [];

        value.docs.forEach(doc => {
          const data = doc.data();

          if (!data.userId) {
            return;
          }

          pracList.push({
            id: doc.id,
            ...data
          });
        });

        log("setting user list: %o", pracList);

        setPracticeList(pracList);
        setLoading(false);
      });

    return () => unsubcribe();
  }, []);

  return { loading, practiceList };
}
