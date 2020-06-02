import React from "react";
import { StackItem, StackContext } from "react-gesture-stack";
import { animated } from "react-spring";

export const SearchTitle = ({ children }: { children: React.ReactNode }) => {
    const {
      navHeight,
      index,
      active,
      changeIndex,
      opacity,
      transform
    } = React.useContext(StackContext);
  
    return (
      <div
        className="StackTitle"
        aria-hidden={!active}
        style={{
          pointerEvents: active ? "auto" : "none",
          zIndex: 10,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0
        }}
      >
        <animated.div
          className="StackTitle__heading"
          style={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            opacity,
            transform: transform.to(x => `translateX(${x * 0.85}%)`)
          }}
        >
          {children}
        </animated.div>
      </div>
    );
  }
  