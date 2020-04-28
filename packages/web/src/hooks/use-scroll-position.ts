import { useState, useEffect } from "react";

export const useScrollPosition = () => {
  const isClient = typeof window === "object";

  const getScroll = () => (isClient ? window.scrollY : 0);

  const [scroll, setScroll] = useState(getScroll);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    const handleScroll = () => setScroll(getScroll());

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("resize", handleScroll);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return scroll;
};
