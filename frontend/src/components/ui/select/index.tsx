import { CSSProperties, useState } from "react";
import styles from "./index.module.scss";

type Props = {
  children?: React.ReactNode;
  x: number;
  y: number;
};

export const Select = ({ children, x, y }: Props) => {
  const [initializedMousePosition] = useState({
    x,
    y,
  });

  const style: CSSProperties = {};

  if (initializedMousePosition.x >= window.innerWidth / 2) {
    style.left = initializedMousePosition.x;
  }
  if (initializedMousePosition.x < window.innerWidth / 2) {
    style.right = window.innerWidth - initializedMousePosition.x;
  }
  if (initializedMousePosition.y >= window.innerHeight / 2) {
    style.bottom = window.innerHeight - initializedMousePosition.y;
  }
  if (initializedMousePosition.y < window.innerHeight / 2) {
    style.top = initializedMousePosition.y;
  }

  return (
    <div style={style} className={styles.select}>
      {children}
    </div>
  );
};
