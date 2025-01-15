import styles from "./index.module.scss";

type Props = {
  children?: React.ReactNode;
  gap: string;
  backgroundColor?: string;
  height?: string;
};

export const GridVerticalRow = ({
  children,
  gap,
  backgroundColor,
  height,
}: Props) => {
  return (
    <div
      style={{ gap, backgroundColor, height }}
      className={styles.gridVerticalRow}
    >
      {children}
    </div>
  );
};
