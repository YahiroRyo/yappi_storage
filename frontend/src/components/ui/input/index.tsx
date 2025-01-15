"use client";

import { CSSProperties, HTMLInputTypeAttribute, useState } from "react";
import styles from "./index.module.scss";

type Props = {
  radius?: string;
  border?: string;
  value?: string;
  color?: {
    backgroundColor?: string;
    focusBackgroundColor?: string;
    placeholderColor?: string;
    focusColor?: string;
  };
  boxShadow?: string;
  focusBorder?: string;
  focusBoxShadow?: string;
  padding?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
  type: HTMLInputTypeAttribute;
};

export const Input = ({
  radius,
  border,
  value,
  boxShadow,
  focusBorder,
  focusBoxShadow,
  color,
  padding,
  placeholder,
  type,
  children,
  onChange,
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  const style: CSSProperties = {};

  if (radius) {
    style.borderRadius = radius;
  }

  if (border) {
    style.border = border;
  }

  if (padding) {
    style.padding = padding;
  }

  if (color) {
    if (color.backgroundColor) {
      style.backgroundColor = color.backgroundColor;
    }
    if (color.placeholderColor) {
      style.color = color.placeholderColor;
    }
    if (color.focusBackgroundColor && isFocused) {
      style.backgroundColor = color.focusBackgroundColor;
    }
    if (color.focusColor && isFocused) {
      style.color = color.focusColor;
    }
  }

  if (boxShadow) {
    style.boxShadow = boxShadow;
  }

  if (focusBorder && isFocused) {
    style.border = focusBorder;
  }
  if (focusBoxShadow && isFocused) {
    style.boxShadow = focusBoxShadow;
  }

  return (
    <div className={styles.inputWrapper}>
      <div className={styles.inputContent}>{children}</div>

      <input
        className={styles.input}
        style={style}
        type={type}
        value={value}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value);
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
      />
    </div>
  );
};
