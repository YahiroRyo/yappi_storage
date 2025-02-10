import { CSSProperties } from "react";

type Props = {
  style?: CSSProperties;
};

export const VideoIcon = ({ style }: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 257 257"
      width="32px"
      height="32px"
      style={style}
    >
      <g>
        <rect
          x=".5"
          y=".5"
          width="256"
          height="256"
          rx="20"
          ry="20"
          style={{ fill: "#231815" }}
        />
        <rect
          x=".5"
          y=".5"
          width="256"
          height="256"
          rx="20"
          ry="20"
          style={{ fill: "none", stroke: "#231815", strokeMiterlimit: 10 }}
        />
      </g>
      <g>
        <rect
          x="48.48"
          y="77.04"
          width="160.04"
          height="102.91"
          rx="10"
          ry="10"
          style={{ fill: "#fff" }}
        />
        <rect
          x="48.48"
          y="77.04"
          width="160.04"
          height="102.91"
          rx="10"
          ry="10"
          style={{ fill: "none", stroke: "#231815", strokeMiterlimit: 10 }}
        />
      </g>
      <g>
        <path
          d="M114.09,104.44c-4.84-2.62-8.8-.26-8.8,5.24v37.63c0,5.5,3.82,7.62,8.49,4.71l32.56-20.27c4.67-2.91,4.53-7.43-.31-10.04l-31.95-17.28Z"
          style={{ fill: "#231815" }}
        />
        <path
          d="M114.09,104.44c-4.84-2.62-8.8-.26-8.8,5.24v37.63c0,5.5,3.82,7.62,8.49,4.71l32.56-20.27c4.67-2.91,4.53-7.43-.31-10.04l-31.95-17.28Z"
          style={{ fill: "none", stroke: "#231815", strokeMiterlimit: 10 }}
        />
      </g>
    </svg>
  );
};
