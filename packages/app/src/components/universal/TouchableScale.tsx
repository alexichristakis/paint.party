import React, { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { BaseButton } from "react-native-gesture-handler";
import Animated, { Easing } from "react-native-reanimated";
import { mix, useValues } from "react-native-redash";

import { TapHandler } from "./TapHandler";

export interface TouchableScaleProps {
  onPress?: () => void;
  enabled?: boolean;
  dependencies?: React.DependencyList;
  style?: StyleProp<Animated.AnimateStyle<ViewStyle>>;
  toScale?: number;
  children: React.ReactNode[] | React.ReactChild;
}
export const TouchableScale: React.FC<TouchableScaleProps> = ({
  children,
  dependencies = [],
  style,
  toScale = 0.95,
  enabled = true,
  onPress,
}) => {
  const [value] = useValues([0], []);
  const scale = mix(value, 1, toScale);

  const handleOnPress = () => (onPress && enabled ? onPress() : null);

  if (onPress)
    return (
      <TapHandler
        value={value}
        style={[{ transform: [{ scale }] }, style]}
        onPress={handleOnPress}
        dependencies={dependencies}
      >
        {children}
      </TapHandler>
    );
  else return <>{children}</>;
};
