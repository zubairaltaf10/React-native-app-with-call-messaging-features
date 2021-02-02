import React, { useState } from "react";
import AudioPlay from "../../chat/AudioRecord/AudioPlayUI";
import Image from "react-native-image-progress";
import CircleSnail from "react-native-progress/CircleSnail";
const circleSnailProps = { thickness: 1, color: "#D0D0D0", size: 50 };

export default function ThreadMediaItem({ dynamicStyles, item, reciever }) {
  if (item.url && item.url.mime && item.url.mime.startsWith("image")) {
    return (
      <Image
        source={{ uri: item.url.url }}
        style={{ ...dynamicStyles.mediaMessage }}
        indicator={CircleSnail}
        indicatorProps={circleSnailProps}
      />
    );
  } else if (item.url && item.url.mime && item.url.mime.startsWith("audio")) {
    return (
      // <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      //   <Icon
      //     name={!playAudio ? "play" : "play-circle"}
      //     type="font-awesome"
      //     size={25}
      //     color={"white"}
      //     onPress={() => {
      //       setPlayAudio(!playAudio);
      //       const sound = new Sound(item.url.url, "", error => {
      //         if (error) {
      //           console.log("failed to load the sound", error);
      //         }
      //         if (!playAudio) {
      //           sound.play(success => {
      //             console.log(success, "success play");

      //             //  sound.getCurrentTime(seconds => console.log("at " + seconds));
      //             if (!success) {
      //               Alert.alert("There was an error playing this audio");
      //             }
      //             setPlayAudio(false);
      //             sound.release();
      //           });
      //         } else {
      //           sound.pause();
      //         }
      //       });
      //     }}
      //   />
      //   <Text>{timer}</Text>
      // </View>

      <AudioPlay
        url={item.url.url}
        duration={item.url.recordTime}
        reciever={reciever}
      />
    );
  } else {
    // To handle old format of an array of url stings. Before video feature
    return (
      <Image
        source={{ uri: item.url }}
        style={{
          ...dynamicStyles.mediaMessage
          // , borderColor:'#ddd',shadowOffset:{width:1,height:1},borderWidth:8,elevation:2
          // ,color:'#ddd'
        }}
        indicator={CircleSnail}
        indicatorProps={circleSnailProps}
      />
    );
  }
}
