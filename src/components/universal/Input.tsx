import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View
} from "react-native";

import { Colors, TextSizes, TextStyles } from "@lib";

export interface InputProps extends TextInputProps {
  textInputRef?: React.RefObject<TextInput>;
  label?: string;
  loading?: boolean;
  error?: string;
  size?: TextSizes;
}
export const Input: React.FC<InputProps> = ({
  style,
  label,
  loading,
  error,
  textInputRef = null,
  size = TextSizes.large,
  ...rest
}) => {
  return (
    <View style={style}>
      <TextInput
        ref={textInputRef}
        placeholderTextColor={Colors.lightGray}
        style={[styles.textInput, TextStyles[size]]}
        {...rest}
      />
      <Text style={[error ? styles.error : styles.label, TextStyles.medium]}>
        {error ? error : label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {},
  error: {},
  textInput: {
    color: Colors.nearBlack,
    padding: 5,
    paddingRight: 10
  }
});
