import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import { Text, StyleSheet, StyleProp, TextStyle } from "react-native";
import isUndefined from "lodash/isUndefined";

import { TextStyles } from "@lib";
import { useReduxAction } from "@hooks";
import { CanvasActions } from "@redux/modules";
import * as selectors from "@redux/selectors";

export interface Countdown {
  style?: StyleProp<TextStyle>;
  toDate?: number;
  enable?: () => void;
}

const ZEROED = "0:00";
export const Countdown: React.FC<Countdown> = React.memo(
  ({ style, enable, toDate }) => {
    const enabled = useSelector(selectors.canvasEnabled);

    const [count, setCount] = useState(ZEROED);

    useEffect(() => {
      const interval = setInterval(() => {
        const seconds = isUndefined(toDate)
          ? 0
          : moment.unix(toDate).diff(moment(), "seconds");
        const minutes = Math.floor(seconds / 60);
        const diffSeconds = seconds - minutes * 60;

        const formatted = `${minutes}:${
          diffSeconds < 10 ? `0${diffSeconds}` : diffSeconds
        }`;

        if (seconds <= 0) {
          if (count !== ZEROED) setCount(ZEROED);
          if (!enabled && enable) enable();
        } else {
          setCount(formatted);
        }
      }, 1000);

      return () => clearInterval(interval);
    }, [toDate, enabled]);

    return <Text style={[styles.count, style]}>{count}</Text>;
  }
);

const styles = StyleSheet.create({
  count: {
    ...TextStyles.title
  }
});
