import { useEffect, useState } from "react";

export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    addEventListener("mousemove", mouseMoveHandler);

    return () => removeEventListener("mousemove", mouseMoveHandler);
  }, []);

  return mousePosition;
};
