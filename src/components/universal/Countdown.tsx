import React, { useEffect, useState } from "react";
import moment from "moment";
import { Text, StyleSheet, StyleProp, TextStyle } from "react-native";

// @ts-ignore
import uuid from "uuid/v4";
import isUndefined from "lodash/isUndefined";

import { TextStyles } from "@lib";

export interface Countdown {
  enabled?: boolean;
  enable?: (val: string) => void;
  style?: StyleProp<TextStyle>;
  toDate?: number;
}

const ZEROED = "0:00";
export const Countdown: React.FC<Countdown> = React.memo(
  ({ enable, enabled, style, toDate }) => {
    const [count, setCount] = useState(ZEROED);

    useEffect(() => {
      const interval = setInterval(() => {
        if (isUndefined(toDate)) {
          return;
        }

        const seconds = moment.unix(toDate).diff(moment(), "seconds");

        if (seconds <= 0) {
          if (count !== ZEROED) setCount(ZEROED);
          if (!enabled && enable) enable(uuid());
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

    return <Text style={[styles.count, style]}>{count}</Text>;
  }
);

const styles = StyleSheet.create({
  count: {
    ...TextStyles.title
  }
});
