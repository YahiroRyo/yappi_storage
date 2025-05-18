import { CSSProperties } from "react";
import styles from "./index.module.scss";

type Props =
  | {
      color?: string;
      size: "pixcel";
      pixcel: string;
      fontWeight?: number;
      align?: "left" | "center" | "right";
      children?: React.ReactNode;
      className?: string;
    }
  | {
      color?: string;
      size: "lerge" | "medium" | "small";
      pixcel?: undefined;
      fontWeight?: number;
      align?: "left" | "center" | "right";
      children?: React.ReactNode;
      className?: string;
    };

export const Text = ({
  color,
  size,
  pixcel,
  fontWeight,
  className,
  children,
  align,
}: Props) => {
  const style: CSSProperties = {};

  if (color) {
    style.color = color;
  }

  if (align) {
    style.textAlign = align;
  }

  if (fontWeight) {
    style.fontWeight = fontWeight;
  }

  if (size === "lerge") {
    return (
      <h1 className={`${styles.lergeText} ${className}`} style={style}>
        {children}
      </h1>
    );
  }

  if (size === "medium") {
    style.fontSize = "1rem";
    return (
      <p className={`${styles.text}  ${className}`} style={style}>
        {children}
      </p>
    );
  }

  if (size === "small") {
    style.fontSize = ".8rem";
    return (
      <p className={`${styles.text}  ${className}`} style={style}>
        {children}
      </p>
    );
  }

  if (size === "pixcel") {
    style.fontSize = pixcel;
    return (
      <p className={`${styles.text}  ${className}`} style={style}>
        {children}
      </p>
    );
  }
};
