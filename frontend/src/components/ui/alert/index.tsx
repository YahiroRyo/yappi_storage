import styles from "./index.module.scss";

type AlertType = "error" | "warning" | "success";

type Props = {
  alertType: AlertType;
  children?: React.ReactNode;
};

export const Alert = ({ alertType, children }: Props) => {
  if (!children) {
    return <></>;
  }

  let classes = `${styles.alert} `;

  if (alertType === "success") {
    classes += styles.alert_success;
  }
  if (alertType === "warning") {
    classes += styles.alert_warning;
  }
  if (alertType === "error") {
    classes += styles.alert_error;
  }

  return <div className={classes}>{children}</div>;
};
