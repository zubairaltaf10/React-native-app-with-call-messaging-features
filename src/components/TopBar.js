import React from "react";
import { styles, theme } from "../styles";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Icon, Badge as CustomBadge, Divider } from "react-native-elements";
const { width, height } = Dimensions.get("window");

export default function TopBar(props) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        height: 60,
        width: "100%",
        backgroundColor: "#000000"
      }}
    >
      {props.filters.map((filter, index) => (
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[
            props.selected === filter ? theme.colorGradientStart : "#fff",
            props.selected === filter ? theme.colorGradientEnd : "#fff"
          ]}
          style={[
            {
              height: "100%",
              // width: '33.33%',
              flex: 1,
              // backgroundColor: theme.colorPrimary,
              borderColor: theme.colorGradientStart,
              // borderWidth: 4
            },
            
          ]}
        >
          <TouchableOpacity onPress={() => props.onPress(filter)}>
            <View
              style={[{
                flexDirection: "row",
                height: "100%",
                width: "100%",
                borderColor: theme.colorGradientStart,
              },props.selected !== filter
              ? { borderWidth: 0.5, borderTopWidth: 1, borderBottomWidth: 1 }
              : { borderWidth: 0 }]}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  width: "100%"
                }}
              >
                <Text
                  style={[
                    { ...styles.title },
                    props.selected === filter
                      ? { color: "#fff" }
                      : { color: theme.colorMenuText }
                  ]}
                >
                  {props.labels[index]}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      ))}
    </View>
  );
}
