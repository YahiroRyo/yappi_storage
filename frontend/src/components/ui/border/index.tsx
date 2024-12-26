import styles from "./index.module.scss";

type Props = {
  color: string;
  height?: string;
};

export const Border = ({ color, height = "1px" }: Props) => {
  return (
    <div
      className={styles.borader}
      style={{ backgroundColor: color, height: height }}
    />
  );
};
