import * as React from "react";

interface UserContext {
  user?: firebase.User;
  initialising?: boolean;
  activeTeam?: string;
  dispatch?: any
}

export const userContext = React.createContext<UserContext>({
  user: undefined
});

export const appStateReducer = (state, action) => {
  switch (action.type) {
    case "SET_ACTIVE": {
       
      return {
        ...state,
        activeTeam: "",        
      };
    }
    
    default:
      return state;
  }
};

export const initialState = {
  activeTeam: "",
   
};
