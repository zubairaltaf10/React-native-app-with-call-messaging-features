import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Platform,
  NativeModules,
  Dimensions
} from "react-native";

import ThreadMediaItem from "./ThreadMediaItem";
import { styles as appStyles, theme } from "../../../styles";
import styles from "./styles";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");
const { VideoPlayerManager } = NativeModules;
const defaultAvatar =
  "https://www.iosapptemplates.com/wp-content/uploads/2019/06/empty-avatar.jpg";

import { timeFormat } from "../../../util/timeFormat";

function ThreadItem(props) {
  const { item, user, onChatMediaPress, onSenderProfilePicturePress } = props;
  const [imgErr, setImgErr] = useState(false);
  const videoRef = useRef(null);
  const onImageError = () => {
    setImgErr(true);
  };

  const didPressMediaChat = () => {
    if (item.url && item.url.mime && item.url.mime.startsWith("video")) {
      if (Platform.OS === "android") {
        VideoPlayerManager.showVideoPlayer(item.url.url);
      } else {
        if (videoRef.current) {
          videoRef.current.presentFullscreenPlayer();
        }
      }
    } else {
      onChatMediaPress(item);
    }
  };

  return (
    <View>
      {/* user thread item */}
      {item.senderID === (user?.jwt || user?._id || user?.id) && (
        <View style={styles.sendItemContainer}>
          <Image
            style={styles.userIconText1}
            source={
              imgErr || !item.senderProfilePictureURL
                ? { uri: defaultAvatar }
                : { uri: item.senderProfilePictureURL }
            }
            onError={onImageError}
          />
          {item.url != null && item.url != "" && (
            <>
              {/* <Image
                style={styles.userIconText1}
                source={
                  imgErr || !item.senderProfilePictureURL
                    ? {uri: defaultAvatar}
                    : {uri: item.senderProfilePictureURL}
                }
                onError={onImageError}
              /> */}

              {item.url.mime.startsWith("audio") ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.itemContent1,
                    styles.sendItemContent,
                    {
                      padding: 0,
                      marginRight: 0,
                      // borderWidth: 0.5,
                      // borderColor: "black",
                      borderRadius: 5
                    }
                  ]}
                >
                  <LinearGradient
                    colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                    style={[
                      // styles.itemContent1,
                      styles.sendItemContent,
                      {
                        padding: 10,
                        marginRight: 0,
                        // borderWidth: 0.5,
                        // borderColor: "black",
                        borderRadius: 5
                      }
                    ]}
                  >
                    <ThreadMediaItem
                      videoRef={videoRef}
                      dynamicStyles={styles}
                      item={item}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={didPressMediaChat}
                  activeOpacity={0.9}
                  style={[
                    styles.itemContent1,
                    styles.sendItemContent,
                    {
                      padding: 0,

                      // marginRight: 10,
                      // borderWidth: 0.5,
                      // borderColor: "black",
                      borderRadius: 5,
                      borderColor: "#ddd",
                      shadowColor: theme.colorGrey,
                      shadowOffset: { width: 1, height: 1 }
                    }
                  ]}
                >
                  <LinearGradient
                    colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                    // style={{ borderRadius: 5, shadowColor:theme.colorGrey,shadowOffset:{width:1,height:1} }}

                    // style={{
                    //   // height: "100%",
                    //   width: "100%"
                    // }}
                    style={[
                      styles.itemContent1,
                      styles.sendItemContent,

                      {
                        width: "100%",
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: theme.colorGradientEnd
                      }
                    ]}
                  >
                    <ThreadMediaItem
                      videoRef={videoRef}
                      dynamicStyles={styles}
                      item={item}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <Text
                style={{
                  ...appStyles.subtitle,
                  color: theme.colorGrey,
                  fontSize: 10,
                  fontFamily: theme.font.regular,
                  flex: 1,
                  alignSelf: "flex-start"
                }}
              >
                {timeFormat(item.created)}
              </Text>
            </>
          )}
          {/* {item.url != null &&
              item.url != '' &&
              item.url.mime &&
              item.url.mime.startsWith('audio') && (
                <>
                  <Image
                    style={styles.userIconText1}
                    source={
                      imgErr || !item.senderProfilePictureURL
                        ? {uri: defaultAvatar}
                        : {uri: item.senderProfilePictureURL}
                    }
                    onError={onImageError}
                  />

                  <TouchableOpacity
                    onPress={didPressMediaChat}
                    activeOpacity={0.9}
                    style={[
                      styles.itemContent1,
                      styles.sendItemContent,
                      {
                        padding: 0,
                        marginRight: 10,
                        borderWidth: 0.5,
                        borderColor: 'black',
                        borderRadius: 5,
                      },
                    ]}>
                    <Text>MESSAGE AUDIO SENT</Text>
                  </TouchableOpacity>
                </>
              )} */}
          {!item.url && (
            <View
              style={{
                //  justifyContent: "flex-end",
                alignSelf: "flex-end",
                // backgroundColor: "red",
                flex: 1
              }}
            >
              <LinearGradient
                colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={[theme.colorGradientStart, theme.colorGradientEnd]}
                style={{
                  height: "100%"
                }}
                style={[styles.itemContent1, styles.sendItemContent, {}]}
              >
                <Text style={styles.sendTextMessage}>{item.content}</Text>
              </LinearGradient>
              <Text
                style={{
                  ...appStyles.subtitle,
                  color: theme.colorGrey,
                  fontSize: 10,
                  fontFamily: theme.font.regular,
                  flex: 1,
                  alignSelf: "flex-start"
                }}
              >
                {timeFormat(item.created)}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() =>
              onSenderProfilePicturePress && onSenderProfilePicturePress(item)
            }
          />
        </View>
      )}

      {/* receiver thread item */}
      {item.senderID !== (user?.jwt || user?._id || user?.id) && (
        <View style={styles.receiveItemContainer}>
          <TouchableOpacity
            onPress={() =>
              onSenderProfilePicturePress && onSenderProfilePicturePress(item)
            }
          />
          <Image
            style={styles.userIconText}
            source={
              imgErr || !item.senderProfilePictureURL
                ? { uri: defaultAvatar }
                : { uri: item.senderProfilePictureURL }
            }
            onError={onImageError}
          />
          {item.url != null && item.url != "" && (
            <>
              {/* <Image
                style={styles.userIconText}
                source={
                  imgErr || !item.senderProfilePictureURL
                    ? {uri: defaultAvatar}
                    : {uri: item.senderProfilePictureURL}
                }
                onError={onImageError}
              /> */}

              {item.url.mime.startsWith("audio") ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={[
                    styles.itemContent,
                    styles.receiveItemContent,
                    {
                      padding: 10,
                      // margin: 15,
                      // borderWidth: 0.5,
                      // borderColor: "black",
                      width: "100%",

                      borderRadius: 5
                    }
                  ]}
                >
                  <ThreadMediaItem
                    videoRef={videoRef}
                    dynamicStyles={styles}
                    item={item}
                    reciever={true}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={didPressMediaChat}
                  activeOpacity={0.9}
                  style={[
                    styles.itemContent,
                    styles.sendItemContent,
                    {
                      padding: 0,
                      // marginLeft: 15,
                      // marginRight:0,
                      width: "100%",
                      // borderWidth: 0.5,
                      // borderColor: "black",
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: "#f2f7f8"
                    }
                  ]}
                >
                  <ThreadMediaItem
                    videoRef={videoRef}
                    dynamicStyles={styles}
                    item={item}
                  />
                </TouchableOpacity>
              )}
              <Text
                style={{
                  ...appStyles.subtitle,
                  color: theme.colorGrey,
                  fontSize: 10,
                  fontFamily: theme.font.regular,
                  alignSelf: "flex-end"
                }}
              >
                {timeFormat(item.created)}
              </Text>
            </>
          )}
          {!item.url && (
            <>
              {/* <Image
                style={styles.userIconText}
                source={
                  imgErr || !item.senderProfilePictureURL
                    ? {uri: defaultAvatar}
                    : {uri: item.senderProfilePictureURL}
                }
                onError={onImageError}
              /> */}
              <View
                style={[
                  {
                    alignSelf: "flex-start",
                    flex: 1
                  }
                ]}
              >
                <View
                  style={[
                    styles.itemContent,
                    styles.receiveItemContent,
                    {
                      alignSelf: "flex-start",
                      flex: 1
                      // color: theme.colorGrey,
                    }
                  ]}
                >
                  <Text style={styles.receiveTextMessage}>{item.content}</Text>
                </View>
                <Text
                  style={{
                    ...appStyles.subtitle,
                    color: theme.colorGrey,
                    fontSize: 10,
                    fontFamily: theme.font.regular,
                    alignSelf: "flex-end"
                  }}
                >
                  {timeFormat(item.created)}
                </Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

ThreadItem.propTypes = {};

export default ThreadItem;
