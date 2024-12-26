import { CSSProperties } from "react";

type Props = {
  space: number;
};

export const Spacer = ({ space }: Props) => {
  const style: CSSProperties = {
    margin: `${space}rem`,
  };

  return <div style={style} />;
};
