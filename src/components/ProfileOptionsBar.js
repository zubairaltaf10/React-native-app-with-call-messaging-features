import React from "react";
import { styles, theme } from "../styles";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Icon, Badge as CustomBadge, Divider } from "react-native-elements";
import MaskedView from "@react-native-community/masked-view";
import { Platform } from "react-native";
const { width, height } = Dimensions.get("window");

export default function ProfileOptionsBar(props) {
  let options = props.options.filter(
    opt => typeof opt !== "undefined" && opt !== null
  );
  return (
    <View
      style={[
        {
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          padding: 10
        },
        props.style
      ]}
    >
      {options.map(
        (opt, index) =>
          typeof opt !== "undefined" &&
          opt !== null && (
            <>
              {index !== 0 ? (
                true ? (
                  <View
                    style={{
                      borderLeftWidth: 1,
                      borderLeftColor: "#bbb",
                      height: 30
                    }}
                  />
                ) : null
              ) : null}
              <TouchableOpacity
                style={{
                  // width: '30%',
                  justifyContent: "flex-start",
                  alignItems: "center",
                  flex: 1
                }}
                disabled={opt.onPress || !opt.component ? false : true}
                onPress={() => opt.onPress()}
              >
                {opt.icon ? (
                  <MaskedView
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      height: Platform.OS==='ios'? 30:25,
                      justifyContent: "flex-start"
                    }}
                    maskElement={
                      <View
                        style={{
                          // backgroundColor: 'transparent',
                          justifyContent: "flex-start",
                          alignItems: "center"
                          //   marginLeft:-30
                        }}
                      >
                        {opt.icon ? (
                          <Icon
                            name={opt.icon?.name || "more-horiz"}
                            color={opt.icon?.color || theme.colorPrimary}
                            size={20}
                            type={opt.icon?.type || "material-icons"}
                            underlayColor="transparent"
                            // onPress={opt.icon?.onPress || (() => {})}
                          />
                        ) : (
                          opt.component
                        )}
                      </View>
                    }
                  >
                    <LinearGradient
                      // start={{x: 0, y: 0}}
                      // end={{x: 1, y: 0}}
                      colors={[
                        theme.colorGradientStart,
                        theme.colorGradientEnd
                      ]}
                      style={{ flex: 1 }}
                    />
                  </MaskedView>
                ) : (
                  opt.component
                )}

                {opt.title && (
                  <Text
                    style={[
                      styles.label,
                      {
                        // fontSize: theme.size(12),

                        textAlign: "center",
                        paddingHorizontal: 10,
                        justifyContent: "flex-end",
                        color: theme.colorMenuHeading
                      }
                    ]}
                  >
                    {opt.title || "More"}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )
      )}
    </View>
  );
}
