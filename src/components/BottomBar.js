import React, { useState } from "react";
import { styles, theme } from "../styles";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Icon, Badge as CustomBadge, Divider } from "react-native-elements";
import Drawer from "react-native-drawer";
import Sidebar from "react-native-sidebar";
import List from "./List";
const { width, height } = Dimensions.get("window");
const drawerStyles = {
  drawer: { shadowColor: "#000000", shadowOpacity: 0.8, shadowRadius: 3 },
  main: { paddingLeft: 3 }
};
export default class BottomNavigation extends React.Component {
  // const [drawerVisible, setDrawerVisible] = useState(false);
  render() {
    return (
      <>
        {/* <Drawer
      open={drawerVisible}
      type="overlay"
      content={
        <List
          // navigation={this.props.navigation}
          // onClose={this.changeDrawer}
          // onLogout={this.logout}
         //role={'USER'}
          // comingSoonModal={this.changeComingSoonModal}
        />
      }
      tapToClose={true}
      openDrawerOffset={0.2} // 20% gap on the right side of drawer
      panCloseMask={0.2}
      closedDrawerOffset={-3}
      styles={drawerStyles}
      tweenHandler={ratio => ({
        main: {opacity: (2 - ratio) / 2},
      })}
      captureGestures={true}></Drawer> */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            height: 70,
            width: "100%",
            backgroundColor: "#000000"
          }}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={[theme.colorGradientStart, theme.colorGradientEnd]}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              height: "100%",
              flex: 1,
              width: "100%",
              flexDirection: "row",
              backgroundColor: theme.colorPrimary,
              justifyContent: "space-around"
            }}
          >
            {this.props.options?.map((opt, index) => (
              <>
                {index !== 0 && (
                  <View
                    style={{
                      borderLeftWidth: 1,
                      borderLeftColor: theme.colorLightGrey,
                      height: "50%",

                      alignSelf: "center"
                    }}
                  />
                )}
                <TouchableOpacity
                  onPress={() => {
                    // opt.title === 'More' ? setDrawerVisible(true) : opt.onPress()
                    opt.onPress();
                  }}
                  style={{ flex: 1 }}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%"
                      // flexDirection: "row",
                      // width

                      // width: width/this.props.options?.lenght,
                    }}
                  >
                    <Icon
                      name={opt.icon?.name || "more-horiz"}
                      color={opt.icon?.color || "white"}
                      type={opt.icon?.type || "material-icons"}
                      size={20}
                      underlayColor="transparent"
                    />
                    <Text
                      style={[styles.subtitle, { color: theme.colorAccent }]}
                    >
                      {opt.title || "More"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ))}
          </LinearGradient>
        </View>
      </>
    );
  }
}
