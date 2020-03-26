import React, { useEffect, useState } from "react";
import moment from "moment";
import { Text, StyleSheet } from "react-native";

// @ts-ignore
import uuid from "uuid/v4";

import { TextStyles } from "@lib";

export interface Countdown {
  enabled: boolean;
  enable: (val: string) => void;
  toDate: number;
}

const ZEROED = "0:00";
export const Countdown: React.FC<Countdown> = React.memo(
  ({ enable, enabled, toDate }) => {
    const [count, setCount] = useState(ZEROED);

    console.log("render countdown");

    useEffect(() => {
      const interval = setInterval(() => {
        const seconds = moment.unix(toDate).diff(moment(), "seconds");

        if (seconds <= 0) {
          if (count !== ZEROED) setCount(ZEROED);
          if (!enabled) enable(uuid());
        } else {
          const minutes = Math.floor(seconds / 60);
          const diffSeconds = seconds - minutes * 60;

          setCount(
            `${minutes}:${diffSeconds < 10 ? `0${diffSeconds}` : diffSeconds}`
          );
        }
      }, 1000);
      return () => clearInterval(interval);
    }, [toDate, enable]);

    return <Text style={styles.count}>{count}</Text>;
  }
);

const styles = StyleSheet.create({
  count: {
    ...TextStyles.title
  }
});
