import { CSSProperties, useState } from "react";
import styles from "./index.module.scss";

type Props = {
  color?: {
    backgroundColor?: string;
    selectedBackgroundColor?: string;
    selectedTextColor?: string;
    textColor?: string;
    disabledBackgroundColor?: string;
    disabledColor?: string;
    hoverBackgroundColor?: string;
  };
  padding?: string;
  radius?: string;
  border?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onClick?: () => void;
  onContextMenu?: () => void;
  children?: React.ReactNode;
};

export const Button = ({
  color,
  padding,
  radius,
  border,
  disabled,
  onFocus,
  onClick,
  onContextMenu,
  children,
}: Props) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const style: CSSProperties = {};

  if (color) {
    if (color.backgroundColor) {
      style.backgroundColor = color.backgroundColor;
    }
    if (color.selectedBackgroundColor && isSelected) {
      style.backgroundColor = color.selectedBackgroundColor;
    }
    if (color.textColor) {
      style.color = color.textColor;
    }
    if (color.hoverBackgroundColor && isHovered) {
      style.backgroundColor = color.hoverBackgroundColor;
    }
    if (color.selectedTextColor && isSelected) {
      style.color = color.selectedTextColor;
    }
    if (color.disabledBackgroundColor && disabled) {
      style.backgroundColor = color.disabledBackgroundColor;
    }
    if (color.disabledColor && disabled) {
      style.color = color.disabledColor;
    }
  }

  if (padding) {
    style.padding = padding;
  }

  if (radius) {
    style.borderRadius = radius;
  }

  if (border) {
    style.border = border;
  }

  return (
    <button
      className={styles.button}
      style={style}
      disabled={disabled}
      onFocus={onFocus}
      onClick={() => {
        setIsSelected((value) => !value);
        if (onClick) {
          onClick();
        }
      }}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onContextMenu={onContextMenu}
    >
      {children}
    </button>
  );
};
