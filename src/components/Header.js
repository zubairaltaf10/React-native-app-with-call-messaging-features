import React from "react";
import { Platform, Dimensions } from "react-native";
import { styles, theme } from "../styles";
import { Header as Headerr } from "react-native-elements";
import HeaderLeft from "./HeaderLeft";
import HeaderRight from "./HeaderRight";
import LinearGradient from "react-native-linear-gradient";

export default function Header(props) {
  if (props.avatarRight) {
    return (
      <Headerr
        ViewComponent={LinearGradient} // Don't forget this!
        linearGradientProps={{
          colors: [theme.colorGradientStart, theme.colorGradientEnd],
          start: { x: 0, y: 0 },
          end: { x: 1, y: 0 }
        }}
        containerStyle={[
          {
            //paddingTop: theme.size(40),
            elevation: 2,
            shadowRadius: 5,
            shadowColor: "#ddd",
            paddingTop:
              //   Platform.OS === "ios"
              //     ? (20 * Dimensions.get("window").height) / 896
              //     :
              null
          },
          props.customStyles,
          ,
          Platform.OS === "ios"
            ? { borderBottomColor: "#ddd", borderBottomWidth: 1, height: 70 }
            : null
        ]}
        statusBarProps={{ hidden: true }}
        leftComponent={
          <HeaderLeft
            changeDrawer={props.changeDrawer}
            icon={props.icon}
            avatar={props.avatarRight}
          />
        }
        centerComponent={{
          text: props.title,
          style: [
            { color: theme.colorAccent },
            { ...styles.subtitle, fontSize: 16 },
            { color: theme.colorAccent }
          ]
        }}
        rightComponent={
          <HeaderRight
            icon={props.iconRight}
            avatar={props.avatarRight}
            logout={props.logout}
          />
        }
      />
    );
  } else {
    console.log(Dimensions.get("window").height);
    return (
      <Headerr
        style={{ ...props.style, top: 0 }}
        containerStyle={[
          {
            backgroundColor: "#fff",
            justifyContent: "space-around",
            elevation: 2,
            // height:70,
            // elevation: 2,
            // shadowRadius: 5,
            // zIndex:2,
            // shadowOffset: { width: 0, height: 2 },
            // shadowColor: 'black',
            shadowColor: "#ddd",

            paddingTop:
              // Platform.OS === "ios"
              //   ? (20 * Dimensions.get("window").height) / 896
              //   :
              null,
            paddingHorizontal: 10
          },
          // props.customStyles
          Platform.OS === "ios"
            ? { borderBottomColor: "#ddd", borderBottomWidth: 1, height: 70 }
            : null
        ]}
        statusBarProps={{ hidden: true }}
        leftComponent={
          <HeaderLeft
            changeDrawer={
              props.changeDrawer
                ? props.changeDrawer
                : () => props.navigation.goBack(null)
            }
            icon={props.icon}
            avatar={props.avatarRight}
          />
        }
        centerComponent={{
          text: props.title,
          style: [
            {
              ...styles.h2,
              fontFamily: theme.font.regular,
              textAlignVertical: "center"
            }
            // { color: props.avatarRight ? theme.colorAccent : theme.colorDarkGrey },
          ]
        }}
        rightComponent={
          <HeaderRight
            icon={props.iconRight}
            type={props.iconRightType || null}
            avatar={props.avatarRight}
            logout={props.logout}
          />
        }
      />
    );
  }
}
