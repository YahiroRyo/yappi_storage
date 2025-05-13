"use client";

import { CSSProperties, useState } from "react";
import styles from "./index.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  color?: {
    backgroundColor?: string;
    selectedBackgroundColor?: string;
    selectedTextColor?: string;
    textColor?: string;
    disabledBackgroundColor?: string;
    disabledColor?: string;
    hoverBackgroundColor?: string;
    sameHrefBackgroundColor?: string;
    includeOtherLinkBackgroundColor?: string;
  };
  type?: "submit" | "button";
  textAlign?: "center" | "left" | "right";
  justifyContent?: "center" | "flex-start" | "flex-end";
  padding?: string;
  radius?: string;
  border?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onClick?: () => void;
  onContextMenu?: () => void;
  href?: string;
  otherLink?: string;
  children?: React.ReactNode;
};

export const Button = ({
  color,
  padding,
  radius,
  textAlign,
  justifyContent,
  border,
  disabled,
  type,
  onFocus,
  onClick,
  onContextMenu,
  href,
  otherLink,
  children,
}: Props) => {
  const pathname = usePathname();
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
    if (color.sameHrefBackgroundColor && href && pathname === href) {
      style.backgroundColor = color.sameHrefBackgroundColor;
    }
    if (
      color.includeOtherLinkBackgroundColor &&
      otherLink &&
      pathname.includes(otherLink)
    ) {
      style.backgroundColor = color.includeOtherLinkBackgroundColor;
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

  if (textAlign) {
    style.textAlign = textAlign;
  }

  if (justifyContent) {
    style.display = "flex";
    style.justifyContent = justifyContent;
  }

  if (radius) {
    style.borderRadius = radius;

    // TopLeft TopRight BottomRight BottomLeft
    if (radius.includes(" ")) {
      const radiuses = radius.split(" ");
      style.borderTopLeftRadius = radiuses[0];
      style.borderTopRightRadius = radiuses[1];
      style.borderBottomRightRadius = radiuses[2];
      style.borderBottomLeftRadius = radiuses[3];
    }
  }

  if (border) {
    style.border = border;
  }

  const props = {
    className: styles.button,
    style,
    disabled,
    onFocus,
    onClick: () => {
      setIsSelected((value) => !value);
      if (onClick) {
        onClick();
      }
    },
    onMouseEnter: () => {
      setIsHovered(true);
    },
    onMouseLeave: () => {
      setIsHovered(false);
    },
    onContextMenu,
  };

  if (href) {
    return (
      <Link {...props} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} {...props}>
      {children}
    </button>
  );
};
