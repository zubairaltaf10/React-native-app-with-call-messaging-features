import React from "react";
import Snackbar from "react-native-snackbar";
import { theme } from "../styles";

export default function(status, message) {
  let color = status === "success" ? theme.colorGradientEnd : theme.colorGrey;
  Snackbar.show({
    title: message,
    duration: Snackbar.LENGTH_LONG,
    backgroundColor: color,
    // color:theme.colorDarkGrey
  });
}
