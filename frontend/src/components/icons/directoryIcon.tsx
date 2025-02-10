import { CSSProperties } from "react";

type Props = {
  style?: CSSProperties;
};

export const DirectoryIcon = ({ style }: Props) => {
  return (
    <svg
      data-name="レイヤー 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 171.06"
      width="32px"
      style={style}
    >
      <path
        d="M246,28.51c5.5,0,10,4.49,10,9.99v122.56c0,5.5-4.5,10-10,10H10c-5.5,0-10-4.5-10-10V10C0,4.5,4.5,0,10,0h91.19c5.5,0,12.84,3.49,16.32,7.75l10.73,13.15c3.48,4.26,10.82,7.74,16.32,7.74l101.43-.12Z"
        style={{ fill: "#231815" }}
      />
    </svg>
  );
};
