import React, { useState } from "react";

export const useMousePosition = () => {
  const [position, setPosition] = useState({ x: -10, y: -10 });

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const { clientX, clientY } = event;

    setPosition({ x: clientX, y: clientY });
  };

  return {
    position,
    handleMouseMove,
  };
};
