import { CSSProperties } from "react";

type Props = {
  style?: CSSProperties;
};

export const ImageIcon = ({ style }: Props) => {
  return (
    <svg
      data-name="レイヤー 1"
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
        <path
          d="M38.29,227.74c-3.09,4.55-1.12,8.27,4.38,8.27h172.91c5.5,0,7.99-4.03,5.54-8.95l-44.68-89.61c-2.45-4.92-6.4-4.89-8.76.08l-34.25,71.94c-2.36,4.97-7.1,5.5-10.52,1.2l-33.15-41.74c-3.42-4.31-8.75-4.11-11.84.44l-39.63,58.37Z"
          style={{ fill: "#fff" }}
        />
        <path
          d="M38.29,227.74c-3.09,4.55-1.12,8.27,4.38,8.27h172.91c5.5,0,7.99-4.03,5.54-8.95l-44.68-89.61c-2.45-4.92-6.4-4.89-8.76.08l-34.25,71.94c-2.36,4.97-7.1,5.5-10.52,1.2l-33.15-41.74c-3.42-4.31-8.75-4.11-11.84.44l-39.63,58.37Z"
          style={{ fill: "none", stroke: "#231815", strokeMiterlimit: 10 }}
        />
      </g>
    </svg>
  );
};
