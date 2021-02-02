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
const { width, height } = Dimensions.get("window");

export default function Contact(props) {
  return (
    <Overlay
      isVisible={props.visible}
      onBackdropPress={() => props.updateVisible()}
      height={width * 0.8}
      width={width * 0.8}
      overlayStyle={{ padding: 0, borderRadius: 20 }}
    >
      {/* <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={[theme.colorAccent, theme.colorAccent]}> */}
      <ScrollView style={[styles.bodyPadding]}>
        <Icon
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
          underlayColor="transparent"
        />
        <Text
          style={[
            styles.h1,
            {
              textAlign: "center",
              color: theme.colorDarkGrey,
              fontFamily: theme.font.bold,
              margin: 30,
              marginBottom: 40
            }
          ]}
        >
          Contact
        </Text>
        <Button
          title={"Pukaar Support"}
          onPress={() => {}}
          buttonStyle={{ borderRadius: 10, alignSelf: "center" }}
          containerStyle={{
            borderRadius: 10,
            width: "70%",
            alignSelf: "center",
            margin: 10,
            marginBottom: 15
          }}
          icon={{
            name: "phone-call",
            type: "feather",
            size: 15,
            color: "white"
          }}
          iconContainerStyle={{ paddingRight: 10 }}
          titleStyle={{
            ...styles.title,
            color: theme.colorAccent
            // fontFamily:theme.font.medium
          }}
          ViewComponent={LinearGradient}
          onPress={() => {
            if (Platform.OS === "ios") {
              Linking.openURL(`telprompt:${pukaarContact}`);
            } else {
              Linking.openURL(`tel:${pukaarContact}`);
            }
          }}
        />
        <Button
          title={"Pukaar Email"}
          onPress={() => {}}
          buttonStyle={{ borderRadius: 10, alignSelf: "center" }}
          containerStyle={{
            borderRadius: 10,
            width: "70%",
            alignSelf: "center",
            margin: 10
            // marginBottom: 0
          }}
          icon={{
            name: "mail",
            type: "feather",
            size: 15,
            color: "white"
          }}
          iconContainerStyle={{ paddingRight: 10 }}
          titleStyle={{
            ...styles.title,
            color: theme.colorAccent
            // fontFamily:theme.font.medium
          }}
          ViewComponent={LinearGradient}
          onPress={() => {
            Linking.openURL(`mailto:${pukaarEmail}`);
          }}
        />
      </ScrollView>
      {/* </LinearGradient> */}
    </Overlay>
  );
}
