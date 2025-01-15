import { CSSProperties } from "react";
import styles from "./index.module.scss";

type Props = {
  children?: React.ReactNode;
  onClose?: () => void;
  width?: string;
  height?: string;
};

export const Modal = ({ children, onClose, width, height }: Props) => {
  const style: CSSProperties = {
    width,
    height,
  };

  return (
    <div className={styles.modalWrapper} onClick={onClose}>
      <div
        style={style}
        onClick={(e) => e.stopPropagation()}
        className={styles.modal}
      >
        {children}
      </div>
    </div>
  );
};
