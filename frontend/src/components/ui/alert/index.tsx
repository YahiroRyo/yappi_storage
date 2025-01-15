type AlertType = "error" | "warning" | "success";

type Props = {
  alertType: AlertType;
  children?: React.ReactNode;
};

export const Alert = ({ alertType, children }: Props) => {
  return <div>{children}</div>;
};
