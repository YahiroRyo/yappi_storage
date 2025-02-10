import { CSSProperties } from "react";

type Props = {
  style?: CSSProperties;
};

export const FileIcon = ({ style }: Props) => {
  return (
    <svg
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 278.1 257"
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
        <g>
          <path
            d="M82.35,51.95c-5.5.03-10,4.55-10,10.05v133.39c0,5.5,4.5,10,10,10h92.3c5.5,0,10-4.5,10-10v-104.83c0-5.5-3.18-13.18-7.07-17.07l-14.81-14.81c-3.89-3.89-11.57-7.05-17.07-7.02l-63.35.3Z"
            style={{ fill: "#fff" }}
          />
          <path
            d="M82.35,51.95c-5.5.03-10,4.55-10,10.05v133.39c0,5.5,4.5,10,10,10h92.3c5.5,0,10-4.5,10-10v-104.83c0-5.5-3.18-13.18-7.07-17.07l-14.81-14.81c-3.89-3.89-11.57-7.05-17.07-7.02l-63.35.3Z"
            style={{ fill: "none", stroke: "#231815", strokeMiterlimit: 10 }}
          />
        </g>
        <line
          x1="91.91"
          y1="113.76"
          x2="157.26"
          y2="113.76"
          style={{
            fill: "#fff",
            stroke: "#231815",
            strokeMiterlimit: 10,
            strokeWidth: "5px",
          }}
        />
        <line
          x1="92.7"
          y1="130.87"
          x2="158.04"
          y2="130.87"
          style={{
            fill: "#fff",
            stroke: "#231815",
            strokeMiterlimit: 10,
            strokeWidth: "5px",
          }}
        />
        <line
          x1="92.7"
          y1="147.98"
          x2="158.04"
          y2="147.98"
          style={{
            fill: "#fff",
            stroke: "#231815",
            strokeMiterlimit: 10,
            strokeWidth: "5px",
          }}
        />
      </g>
    </svg>
  );
};
