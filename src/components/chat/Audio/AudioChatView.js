import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  TouchableOpacity,
  View,
  Image,
  Text
} from "react-native";
import { Icon } from "react-native-elements";
import styles from "./styles";
import fire from "../../../services/firebase";
const AudioChatView = props => {
  const {
    audioVideoChatReceivers,
    remoteStreams,
    hoursCounter,
    minutesCounter,
    secondsCounter,
    isComInitiated,
    endCall,
    onAcceptCall,
    initialCallState,
    channelTitle,
    isSpeaker,
    toggleSpeaker
  } = props;

  const [image, setImage] = useState("");

  let fullName = null;
  const [backgroundBlurImage] = useState(audioVideoChatReceivers[0].photo);

  if (!channelTitle) {
    fullName = `${
      audioVideoChatReceivers.length > 0
        ? audioVideoChatReceivers[0].name
        : "User"
    }`;
  }

  useEffect(() => {
    fire
      .database()
      .ref(`users/${audioVideoChatReceivers[0].id}`)
      .on("value", snap => {
        if (snap.exists()) {
          setImage(snap.val());
        }
      });
  }, []);

  const renderTimer = () => {
    let timer = `${minutesCounter} : ${secondsCounter}`;
    if (Number(hoursCounter) > 0) {
      timer = `${hoursCounter} : ${minutesCounter} : ${secondsCounter}`;
    }
    return <Text style={styles.timer}>{timer}</Text>;
  };

  return (
    <ImageBackground
      blurRadius={20}
      source={{
        uri: image.photo
      }}
      style={{ ...styles.imageBackground, backgroundColor: "#fff" }}
    >
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <View
            style={[
              styles.profilePictureContainer,
              styles.profilePictureContainerCenter
            ]}
          >
            <Image
              source={{
                uri: image.photo
              }}
              style={styles.profilePicture}
            />
          </View>

          <Text style={styles.userName}>{audioVideoChatReceivers[0].name}</Text>
          {remoteStreams ? (
            renderTimer()
          ) : (
            <Text style={styles.timer}>{initialCallState}</Text>
          )}
        </View>
        <View style={styles.control}>
          <TouchableOpacity
            onPress={toggleSpeaker}
            style={[
              styles.controlIconContainer,
              isSpeaker && { backgroundColor: "#fff" }
            ]}
          >
            <Icon
              name={isSpeaker ? "volume-up" : "volume-off"}
              style={[styles.imageIcon, isSpeaker && { tintColor: "#fff" }]}
              underlayColor="transparent"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.controlIconContainer,
              { backgroundColor: "#fc2e50" }
            ]}
            onPress={endCall}
          >
            <Icon
              name="call-end"
              color="white"
              style={styles.imageIcon}
              underlayColor="transparent"
            />
          </TouchableOpacity>
          {!isComInitiated && (
            <TouchableOpacity
              style={[
                styles.controlIconContainer,
                { backgroundColor: "#6abd6e" }
              ]}
              onPress={onAcceptCall}
            >
              <Icon
                name="call"
                color="white"
                style={styles.imageIcon}
                underlayColor="transparent"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ImageBackground>
  );
};

export default AudioChatView;
