import React, { useState } from "react";
import { styles, theme } from "../styles";
import { View, Text, TouchableOpacity, TouchableHighlight } from "react-native";
import { Icon, Badge as CustomBadge, Divider } from "react-native-elements";
import MaskedView from "@react-native-community/masked-view";
import LinearGradient from "react-native-linear-gradient";

export default function DashboardButton(props) {
  const [isFocused, setFocused] = useState(false);

  return (
    // <LinearGradient
    //   start={{ x: 0, y: 0 }}
    //   end={{ x: 1, y: 1 }}
    //   colors={
    //     !!isFocused
    //       ? [theme.colorGradientStart, theme.colorGradientEnd]
    //       : [theme.colorAccent, theme.colorAccent]
    //   }
    //   style={{
    //     flex: 1,
    //     justifyContent: "center",
    //     alignItems: "center",
    //     height: "100%",
    //     width: "50%",
    //     backgroundColor: "#ffffff",
    //     backgroundColor: "#ffffff",
    //     borderWidth: 0.5,
    //     borderColor: theme.colorPrimary
    //   }}
    // >
    <TouchableHighlight
      onPressIn={() => {
        setFocused(true);
      }}
      // onFocus={() => {
      //   setFocused(true);
      // }}
      onPressOut={() => {
        setFocused(false);
      }}
      onPress={() => props.onPress()}
      style={[
        {
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "50%",
          backgroundColor: "#ffffff",
          backgroundColor: "#ffffff",
          borderWidth: 0.5,
          borderColor: theme.colorPrimary
        },
        !!isFocused
          ? { backgroundColor: theme.colorGradientEnd }
          : { backgroundColor: "#ffffff" }
      ]}
      underlayColor={theme.colorPrimary}
    >
      <>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            ...Platform.select({
              ios: {
                height: 35
              },
              android: {
                height: 30
              }
            })
          }}
        >
          {Array.isArray(props.icon) ? (
            <MaskedView
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center"
              }}
              maskElement={
                <View
                  style={{
                    backgroundColor: "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row"
                  }}
                >
                  {props.icon.map(icon => (
                    <Icon
                      // color={theme.colorGradientStart}
                      name={icon?.name || "account-heart-outline"}
                      type={icon?.type || "material-community"}
                      underlayColor="transparent"
                    />
                  ))}
                </View>
              }
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={
                  !isFocused
                    ? [theme.colorGradientStart, theme.colorGradientEnd]
                    : [theme.colorAccent, theme.colorAccent]
                }
                style={{ flex: 1 }}
              />
            </MaskedView>
          ) : (
            <MaskedView
              style={{ flex: 1, flexDirection: "row" }}
              maskElement={
                <View
                  style={{
                    //   backgroundColor: 'transparent',
                    justifyContent: "center",
                    alignItems: "center"

                    //   marginLeft:-30
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Icon
                      //   color={theme.colorGradientStart}
                      name={props.icon?.name || "account-heart-outline"}
                      type={props.icon?.type || "material-community"}
                      underlayColor="transparent"
                    />
                    {(props.title == "Chats" || props.title == "Chat") &&
                    props.chatCount != false ? (
                      <Text
                        style={[
                          {
                            color: theme.colorGrey,
                            // textAlign: "center",
                            fontSize: 15,
                            lineHeight: 18,
                            ...styles.bold

                            //   textAlign: "right"
                            //paddingLeft: 20

                            // fontSize: theme.subtitle,
                          }
                        ]}
                      >
                        *
                      </Text>
                    ) : null}
                  </View>
                </View>
              }
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={
                  !isFocused
                    ? [theme.colorGradientStart, theme.colorGradientEnd]
                    : [theme.colorAccent, theme.colorAccent]
                }
                style={{ flex: 1 }}
              />
            </MaskedView>
          )}
        </View>
        {/* <>{props.children}</> */}
        <Text
          style={[
            styles.bodyText,
            {
              color: theme.colorMenuText,
              ...styles.title,
              // fontWeight:'bold',
              // fontFamily: theme.font.regular,
              fontFamily: theme.font.medium,
              textAlign: "center",
              paddingHorizontal: 10
            },
            !!isFocused
              ? { color: theme.colorAccent }
              : { color: theme.colorMenuText }
          ]}
        >
          {props.title || "Title"}
        </Text>

        {props.subtitle ? (
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colorGrey,
                textAlign: "center",
                ...styles.subtitle,
                // fontSize: theme.subtitle,
                paddingHorizontal: 10
              },
              !!isFocused
                ? { color: theme.colorAccent }
                : { color: theme.colorMenuText }
            ]}
          >
            {props.subtitle || "Subtitle"}
          </Text>
        ) : null}
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={
            !isFocused
              ? [theme.colorGradientStart, theme.colorGradientEnd]
              : [theme.colorAccent, theme.colorAccent]
          }
          style={{
            alignSelf: "center",
            backgroundColor: theme.colorPrimary,
            marginTop: theme.size(20),
            height: theme.size(5),
            width: "10%"
          }}
        >
          {/* <Divider
        style={{
          alignSelf: 'center',
          backgroundColor: theme.colorPrimary,
          marginTop: theme.size(20),
          height: theme.size(5),
          width: '10%',
        }}
      /> */}
        </LinearGradient>
      </>
    </TouchableHighlight>
    // </LinearGradient>
  );
}
