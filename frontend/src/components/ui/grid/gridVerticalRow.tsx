import { MouseEventHandler } from "react";
import styles from "./index.module.scss";

type Props = {
  children?: React.ReactNode;
  gap: string;
  backgroundColor?: string;
  height?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export const GridVerticalRow = ({
  onClick,
  children,
  gap,
  backgroundColor,
  height,
}: Props) => {
  return (
    <div
      style={{ gap, backgroundColor, height }}
      className={styles.gridVerticalRow}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
