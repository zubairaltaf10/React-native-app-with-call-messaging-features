import React from "react";
import { Icon } from "react-native-elements";
import { TouchableOpacity } from "react-native";
import { theme } from "../styles";

export default function HeaderLeft(props) {
  return (
    <TouchableOpacity onPress={() => props.changeDrawer()}>
      <Icon
        name={props.icon}
        color={props.avatar ? "#fff" : theme.colorGrey}
        // color={theme.colorGrey}
        underlayColor="transparent"
        size={28}
      />
    </TouchableOpacity>
  );
}
