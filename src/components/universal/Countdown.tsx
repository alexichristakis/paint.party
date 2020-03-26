import React, { useEffect, useState } from "react";
import moment from "moment";
import { Text, View, StyleSheet } from "react-native";

import { TextStyles, SB_HEIGHT } from "@lib";

export interface Countdown {
  enabled: boolean;
  enable: (val: boolean) => void;
  toDate: number;
}

export const Countdown: React.FC<Countdown> = ({ enable, enabled, toDate }) => {
  const [count, setCount] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = moment.unix(toDate).diff(moment(), "seconds");

      if (seconds <= 0) {
        enable(true);
      }

      const minutes = Math.floor(seconds / 60);
      const diffSeconds = seconds - minutes * 60;

      setCount(
        `${minutes}:${diffSeconds < 10 ? `0${diffSeconds}` : diffSeconds}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (enabled) return null;

  return <Text style={styles.count}>{count}</Text>;
};

const styles = StyleSheet.create({
  count: {
    ...TextStyles.title
  }
});
