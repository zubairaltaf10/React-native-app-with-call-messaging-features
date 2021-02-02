import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  Platform,
  Linking,
  Dimensions
} from "react-native";
import { styles, theme } from "../styles";
import { Button, Overlay, Icon } from "react-native-elements";
import LinearGradient from "react-native-linear-gradient";
import { pukaarContact, pukaarEmail } from "../util/constants";
import NetworkUtils from "./NetworkUtil";
const { width, height } = Dimensions.get("window");

export default function NetworkUtilModal(props) {
  return (
    <Overlay
      isVisible={props.visible}
      onBackdropPress={() => {}}
      height={width * 0.6}
      width={width * 0.8}
      overlayStyle={{ padding: 0, borderRadius: 20 }}
    >
      {/* <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={[theme.colorAccent, theme.colorAccent]}> */}
      <ScrollView style={[styles.bodyPadding]}>
        {/* <Icon
              name={"close"}
              color={theme.colorGrey}
              type="evil-icons"
              size={30}
              containerStyle={{
                alignSelf: "flex-end",
                top: theme.size(10)
                // right: theme.size(5)
              }}
              onPress={() => props.updateVisible()}
            /> */}
        <Text
          style={[
            styles.h1,
            {
              textAlign: "center",
              color: theme.colorDarkGrey,
              fontFamily: theme.font.medium,
              margin: 30,
              marginVertical: 80
            }
          ]}
        >
          Network not available!
        </Text>
        <Button
          title={"Retry"}
          buttonStyle={{ borderRadius: 10, alignSelf: "center" }}
          containerStyle={{
            borderRadius: 10,
            width: "70%",
            alignSelf: "center",
            margin: 10,
            marginVertical: 20
          }}
        //   icon={{
        //     name: "refresh",
        //     type: "evil-icons",
        //     size: 15,
        //     color: "white"
        //   }}
          iconContainerStyle={{ paddingRight: 10 }}
          titleStyle={{
            ...styles.title,
            color: theme.colorAccent
            // fontFamily:theme.font.medium
          }}
          ViewComponent={LinearGradient}
          onPress={async () => {
            if (!(await NetworkUtils.isNetworkAvailable())) {
            } else {
              props.updateVisible();
            }
          }}
        />
      </ScrollView>
      {/* </LinearGradient> */}
    </Overlay>
  );
}
