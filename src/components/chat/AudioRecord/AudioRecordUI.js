import React, { useState } from "react";
import { View, Text, TouchableHighlight } from "react-native";
import { Icon } from "react-native-elements";
import styles from "./styles";
export default function AudioRecordUI(props) {
  const {
    onAudioRecord,
    onAudioRecordingState,
    onAudioStop,
    currentAudioTimeSeconds,
    currentAudioTimeMinutes,
    admin
  } = props;

  const renderTimer = () => {
    let timer = `${currentAudioTimeMinutes} : ${currentAudioTimeSeconds}`;
    timer = `${currentAudioTimeMinutes} : ${currentAudioTimeSeconds}`;

    return <Text style={{ textAlign: "center", fontSize: 10 }}>{timer}</Text>;
  };

  return (
    <View>
      {onAudioRecordingState ? (
        <View
          style={[
            styles.inputIconContainer1,
            {
              //  flexDirection: "column",
              // justifyContent: "center",
              //alignItems: "center"
            }
          ]}
        >
          <Text>{currentAudioTimeSeconds.toFixed(0)} sec</Text>

          <TouchableHighlight
            // onPress={onAudioStop}
            underlayColor={"transparent"}
            onPress={onAudioStop}
            style={{}}
          >
            <Icon
              style={styles.inputIcon}
              name="close"
              size={28}
              color={"red"}
              underlayColor="transparent"
            />
          </TouchableHighlight>
        </View>
      ) : (
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
      )}
    </View>
  );
}
