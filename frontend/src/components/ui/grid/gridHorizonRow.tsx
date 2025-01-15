import styles from "./index.module.scss";

type Props = {
  children?: React.ReactNode;
  gridTemplateColumns?: string;
  gap: string;
};

export const GridHorizonRow = ({
  children,
  gap,
  gridTemplateColumns,
}: Props) => {
  return (
    <div style={{ gap, gridTemplateColumns }} className={styles.gridHorizonRow}>
      {children}
    </div>
  );
};
