type Props = {
  margin?: string;
  children?: React.ReactNode;
};

export const Container = ({ margin, children }: Props) => {
  return <div style={{ margin }}>{children}</div>;
};
