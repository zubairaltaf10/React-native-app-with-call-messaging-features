import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableHighlight,
  Text,
  KeyboardAvoidingView
} from "react-native";
import { Icon, Input } from "react-native-elements";
import styles from "./styles";
import theme from "../../../styles/variables";

import styles1 from "../AudioRecord/styles";
function BottomInput(props) {
  const {
    value,
    onChangeText,
    onSend,
    onAddMediaPress,
    uploadProgress,
    onAudioRecord,
    onAudioRecordingState,
    onAudioStop,
    onAudioCancel,
    currentAudioTimeSeconds,
    admin,
    user,
    channel,
    longPress
  } = props;

  const isDisabled = !value;

  let hold = null;
  let chatStatus = null;

  if (user?.role === "THERAPIST") {
    hold = user?.patients;
  } else if (user?.role === "USER") {
    hold = user?.therapists;
  }

  hold?.map(item => {
    if (item.id === channel.participants[0]._id) {
      chatStatus = item.status;
    }
  });

  function convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
    let seconds = sec - hours * 3600 - minutes * 60; //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    if (hours > 0) {
      return hours + ":" + minutes + ":" + seconds;
    } else {
      return minutes + ":" + seconds;
    }
    // Return is HH : MM : SS
  }

  return !admin ? (
    longPress == false ? (
      chatStatus != "inactive" ? (
        <View style={{ backgroundColor: "#F5F5F5" }}>
          <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
          <View style={styles.inputBar}>
            {onAudioRecordingState ? (
              <View
                style={[
                  styles1.inputIconContainer1,
                  {
                    flexDirection: "row"
                  }
                ]}
              >
                <TouchableHighlight
                  underlayColor={"transparent"}
                  onPress={onAudioCancel}
                  style={{ marginLeft: 10, marginRight: 10 }}
                >
                  <Icon
                    style={styles1.inputIcon}
                    name="delete"
                    size={28}
                    color={"grey"}
                    type="material-icons"
                    underlayColor="transparent"
                  />
                </TouchableHighlight>

                <View
                  style={{
                    flexDirection: "row",
                    flex: 1,
                    justifyContent: "space-between",
                    alignContent: "space-between"
                  }}
                >
                  <Text
                    style={{
                      textAlignVertical: "center",
                      marginLeft: 20,
                      backgroundColor: "#F3F3F3",
                      flex: 1,
                      color: "grey"
                    }}
                  >
                    {convertHMS(currentAudioTimeSeconds)}
                  </Text>

                  <TouchableHighlight
                    // onPress={onAudioStop}
                    underlayColor={"transparent"}
                    onPress={onAudioStop}
                    style={{ marginRight: 10 }}
                  >
                    <Icon
                      style={styles1.inputIcon1}
                      name="send"
                      size={28}
                      color="#1B69C7"
                      underlayColor="transparent"
                    />
                  </TouchableHighlight>
                </View>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  onPress={
                    admin ? console.log("no camera admin") : onAddMediaPress
                  }
                  style={styles.inputIconContainer}
                >
                  <Icon
                    style={styles.inputIcon}
                    name="camera-alt"
                    size={28}
                    color="#1B69C7"
                    underlayColor="transparent"
                  />
                </TouchableOpacity>

                <Input
                  containerStyle={styles.input}
                  inputStyle={{ fontSize: 16, color: theme.colorTextDark }}
                  value={value}
                  multiline={true}
                  placeholder={"Start typing..."}
                  underlineColorAndroid="transparent"
                  placeholderTextColor="#1B69C7"
                  onChangeText={text => onChangeText(text)}
                  editable={
                    admin ? false : onAudioRecordingState ? false : true
                  }
                  inputContainerStyle={{
                    borderBottomWidth: 0,
                    backgroundColor: "transparent"
                  }}
                />

                {isDisabled ? (
                  <TouchableHighlight
                    // onPress={admin ? null : onAudioRecord}
                    underlayColor={"transparent"}
                    onPressIn={admin ? null : onAudioRecord}
                    onPressOut={onAudioStop}
                    style={styles.inputIconContainer}
                  >
                    <Icon
                      style={styles.inputIcon}
                      name="mic"
                      size={28}
                      color={"#1869C7"}
                      underlayColor="transparent"
                    />
                  </TouchableHighlight>
                ) : (
                  <TouchableOpacity
                    disabled={isDisabled}
                    onPress={admin ? console.log("admin no") : onSend}
                    style={[
                      styles.inputIconContainer,
                      isDisabled ? { opacity: 0.2 } : { opacity: 1 }
                    ]}
                  >
                    <Icon
                      style={styles.inputIcon}
                      name="send"
                      size={28}
                      color="#1B69C7"
                      underlayColor="transparent"
                    />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      ) : (
        <View
          style={{
            height: 80,
            backgroundColor: theme.colorLightGrey,
            justifyContent: "center",
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <Text
            style={{
              color: theme.colorDarkGrey,
              textAlign: "center",
              marginRight: 10,
              fontSize: 17
            }}
          >
            🔒
          </Text>
          <Text style={{ textAlign: "center", color: theme.colorDarkGrey }}>
            You can't chat with this user.
          </Text>
        </View>
      )
    ) : (
      <View
        style={{
          height: 80,
          backgroundColor: theme.colorLightGrey,
          justifyContent: "center",
          flexDirection: "row",
          alignItems: "center"
        }}
      >
        <Text
          style={{
            color: theme.colorDarkGrey,
            textAlign: "center",
            marginRight: 10,
            fontSize: 17
          }}
        >
          🔒
        </Text>
        <Text style={{ textAlign: "center", color: theme.colorDarkGrey }}>
          You can't chat with this user.
        </Text>
      </View>
    )
  ) : null;
}

BottomInput.propTypes = {};

export default BottomInput;
