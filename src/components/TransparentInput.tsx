import { InputBaseProps, useTheme, Input } from "sancho";

interface TransparentInputProps extends InputBaseProps { }

export const TransparentInput = (props: TransparentInputProps) => {
  const theme = useTheme();
  return (
    <Input
      css={{
        background: "none",
        border: "none",
        boxShadow: "none",
        // paddingTop: theme.spaces.xs,
        // paddingBottom: theme.spaces.xs,
        ":focus": {
          outline: "none",
          boxShadow: "none",
          background: "none"
        }
      }}
      {...props}
    />
  );
};