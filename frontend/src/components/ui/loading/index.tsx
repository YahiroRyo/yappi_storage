import styles from "./index.module.scss";

type Props = {
  isLoading: boolean;
};

export const Loading = ({ isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loading}></div>
      </div>
    );
  }

  return <></>;
};
