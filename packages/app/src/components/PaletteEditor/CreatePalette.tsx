import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { connect, ConnectedProps } from "react-redux";

import { Colors, TextSizes } from "@lib";
import { RootState } from "@redux/types";
import { PaletteActions } from "@redux/modules";

import { Input, CreateButton } from "../universal";

export interface CreatePaletteProps {}

export type CreatePaletteConnectedProps = ConnectedProps<typeof connector>;

const mapStateToProps = (state: RootState) => ({});
const mapDispatchToProps = {
  create: PaletteActions.createPalette,
};

type Props = CreatePaletteProps & CreatePaletteConnectedProps;
const CreatePalette: React.FC<Props> = React.memo(({ create }) => {
  const [name, setName] = useState("");

  const handleOnPressCreate = () => {
    create(name);
    setName("");
  };

  return (
    <>
      <Input
        maxLength={30}
        autoCapitalize="none"
        placeholder="new palette name"
        size={TextSizes.title}
        style={{ marginHorizontal: 10 }}
        value={name}
        onChangeText={setName}
      />
      <CreateButton
        dependencies={[name]}
        valid={!!name.length}
        onPress={handleOnPressCreate}
      />
    </>
  );
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(CreatePalette);
