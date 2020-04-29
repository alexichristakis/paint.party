import React, { useState } from "react";

export const usePointerPosition = () => {
  const [position, setPosition] = useState({ x: -10, y: -10 });

  const handleMove = (event: { clientX: number; clientY: number }) => {
    const { clientX, clientY } = event;

    setPosition({ x: clientX, y: clientY });
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    handleMove(event.touches[0]);
  };

  return {
    position,
    handler: {
      onMouseMove: handleMove,
      onTouchMove: handleTouchMove,
    },
  };
};
