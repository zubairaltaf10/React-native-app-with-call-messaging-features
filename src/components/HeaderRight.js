import React from "react";
import { Icon, Avatar } from "react-native-elements";
import { styles, theme } from "../styles";
import { TouchableOpacity } from "react-native";

export default function HeaderRight(props) {
  if (props.avatar) {
    return <Avatar rounded size={"small"} source={{ uri: props.icon }} />;
  } else {
    return props.icon ? (
      <TouchableOpacity onPress={() => props.logout()}>
        <Icon
          name={props.icon || "exit-to-app"}
          type={props.type}
          color={theme.colorGrey}
          size={28}
          underlayColor="transparent"
        />
      </TouchableOpacity>
    ) : null;
  }
}
