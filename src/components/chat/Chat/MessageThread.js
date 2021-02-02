import React from "react";
import PropTypes from "prop-types";
import { FlatList, Text, View, ActivityIndicator } from "react-native";

import ThreadItem from "./ThreadItem";
import styles from "./styles";

function MessageThread(props) {
  const {
    thread,
    user,
    onChatMediaPress,
    onSenderProfilePicturePress,
    renderFooter,
    retrieveMore,
    onEndReached,
    onMomentumScrollBegin
  } = props;

  const renderChatItem = ({ item, index }) => {
    // alert(index)
    return index !== thread?.length - 1 ? (
      <ThreadItem
        item={item}
        user={{ ...user, userID: user?.jwt || user?._id || user?.id }}
        onChatMediaPress={onChatMediaPress}
        onSenderProfilePicturePress={onSenderProfilePicturePress}
      />
    ) : (
      <View style={{ marginTop: 30 }}>
        <ThreadItem
          item={item}
          user={{ ...user, userID: user?.jwt || user?._id || user?.id }}
          onChatMediaPress={onChatMediaPress}
          onSenderProfilePicturePress={onSenderProfilePicturePress}
        />
      </View>
    );
  };

  return (
    <FlatList
      inverted={true}
      vertical={true}
      onEndReachedThreshold={0.1}
      onEndReached={onEndReached}
      style={{
        padding: 20,
        width: "100%",
        alignSelf: "center"
      }}
      showsVerticalScrollIndicator={false}
      data={thread}
      renderItem={renderChatItem}
      keyExtractor={item => `${item.id}`}
      onMomentumScrollBegin={onMomentumScrollBegin}
      // ListFooterComponent={props.chatHeader}
      contentContainerStyle={styles.messageThreadContainer}
    />
  );
}

MessageThread.propTypes = {
  thread: PropTypes.array,
  user: PropTypes.object,
  onChatMediaPress: PropTypes.func
};

export default MessageThread;
