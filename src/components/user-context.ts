import * as React from "react";

interface UserContext {
  user?: firebase.User;
  initialising?: boolean;
  activeTeam?: any;
  dispatch?: any
}

export const userContext = React.createContext<UserContext>({
  activeTeam: ""
});

export const appStateReducer = (state, action) => {
  switch (action.type) {
    case "SET_ACTIVE": {
       
      return {
        ...state,
        activeTeam: action.item,        
      };
    }
    
    default:
      return state;
  }
};

export const initialState = {
  activeTeam: "my E team",
   
};
