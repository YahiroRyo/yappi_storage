import styles from "./index.module.scss";

type Props = {
  children: React.ReactNode;
  gap: string;
};

export const GridVerticalRow = ({ children, gap }: Props) => {
  return (
    <div style={{ gap }} className={styles.gridVerticalRow}>
      {children}
    </div>
  );
};
