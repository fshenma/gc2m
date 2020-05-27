import * as firebase from "firebase/app";
import "firebase/auth";
import { useContext } from "react";
import { userContext } from "../context/user-context";
import { getActiveTeam } from "./db";
import { TeamType } from "../models/Team";
import React from "react";

const provider = new firebase.auth.GoogleAuthProvider();

export const useSession = () => {
  const { user, activeTeam, curTab, dispatch} = useContext(userContext);

  const loadActiveTeam = async  () => {
    try {
      // setActiveTeam(decodeURI(actTeam));
      await getActiveTeam(user).then(data => {
        const team = data.docs[0].data() as TeamType
        team && dispatch({ type: "SET_ACTIVE", item: team });
      })
    } catch (err) {
      console.error(err);
    }
  }
  
  React.useEffect(() => {    
    loadActiveTeam();
  }, []);
  
  return { user, activeTeam, curTab, dispatch };
};

export const loginWithGoogle = async () => {
  try {
    const result = await firebase.auth().signInWithPopup(provider);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const github = new firebase.auth.GithubAuthProvider();

export const loginWithGithub = async () => {
  try {
    const result = await firebase.auth().signInWithPopup(github);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const results = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const createUserWithEmail = async (email: string, password: string) => {
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const signOut = () => firebase.auth().signOut();
