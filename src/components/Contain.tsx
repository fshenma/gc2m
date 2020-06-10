import * as React from "react";

export const Contain = props => {
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