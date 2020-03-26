import React, { useEffect, useState } from "react";
import moment from "moment";
import { Text, View, StyleSheet } from "react-native";

import { useInterval } from "@hooks";
import { TextStyles } from "@lib";

export interface Countdown {
  toDate: number;
}

export const Countdown: React.FC<Countdown> = ({ toDate }) => {
  const [count, setCount] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = moment.unix(toDate).diff(moment(), "seconds");

      const minutes = Math.floor(seconds / 60);
      const diffSeconds = seconds - minutes * 60;

      setCount(
        `${minutes}:${diffSeconds < 10 ? `0${diffSeconds}` : diffSeconds}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    marginBottom: 10
  },
  count: {
    ...TextStyles.title
  }
});
