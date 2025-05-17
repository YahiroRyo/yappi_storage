import { CSSProperties } from "react";

type Props = {
  style?: CSSProperties;
};

export const VideoIcon = ({ style }: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      style={style}
    >
      <path
        d="M4 6.5C4 5.11929 5.11929 4 6.5 4H17.5C18.8807 4 20 5.11929 20 6.5V17.5C20 18.8807 18.8807 20 17.5 20H6.5C5.11929 20 4 18.8807 4 17.5V6.5Z"
        fill="#1a1a1a"
        stroke="#1a1a1a"
        strokeWidth="2"
      />
      <path
        d="M10 8.5L16 12L10 15.5V8.5Z"
        fill="white"
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
};
