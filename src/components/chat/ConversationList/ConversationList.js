import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  ScrollView,
  View,
  FlatList,
  ActivityIndicator,
  BackHandler
} from "react-native";

import theme from "../../../styles/variables";
import ConversationView from "../ConversationView";
import dynamicStyles from "./styles";
import EmptyStateView from "../../EmptyStateView/EmptyStateView";
import { withNavigation } from "react-navigation";
function ConversationList(props) {
  const {
    user,
    onConversationPress,
    emptyStateConfig,
    conversations,
    loading,
    onConversationLongPress,
    longPress
  } = props;

  const styles = dynamicStyles;
  const formatMessage = item => {
    if (
      item.lastMessage &&
      item.lastMessage.mime &&
      item.lastMessage.mime.startsWith("image")
    ) {
      return "Someone sent a photo.";
    }
    if (
      item.lastMessage &&
      item.lastMessage.mime &&
      item.lastMessage.mime.startsWith("audio")
    ) {
      return "Someone sent a voice clip.";
    } else if (item.lastMessage) {
      return item.lastMessage;
    }
    return "";
  };

  function backButtonHandler() {
    props.navigation.goBack();
    return true;
  }

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backButtonHandler);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backButtonHandler);
    };
  }, [backButtonHandler]);

  const renderConversationView = ({ item }) => {
    let hold = null;
    let chatStatus = null;

    if (user?.role === "THERAPIST") {
      hold = user?.patients;

      hold?.map(item1 => {
        if (item1.id === item.participants[0]?._id) {
          chatStatus = item1.status;
        }
      });

      if (chatStatus == "active") {
        return (
          <ConversationView
            formatMessage={formatMessage}
            onChatItemPress={onConversationPress}
            onConversationLongPress={onConversationLongPress}
            item={item}
            longPress={longPress}
          />
        );
      } else {
        return null;
      }
    } else {
      return (
        <ConversationView
          formatMessage={formatMessage}
          onChatItemPress={onConversationPress}
          onConversationLongPress={onConversationLongPress}
          item={item}
          longPress={longPress}
        />
      );
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 20 }}
        color={theme.colorGrey}
        size="large"
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chatsChannelContainer}>
          {conversations && conversations.length > 0 && (
            <FlatList
              vertical={true}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              data={conversations}
              renderItem={renderConversationView}
              keyExtractor={item => `${item.id}`}
              // onEndReached={() => this.}
            />
          )}
          {conversations && conversations.length <= 0 && (
            <View style={styles.emptyViewContainer}>
              <EmptyStateView emptyStateConfig={emptyStateConfig} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

ConversationList.propTypes = {
  onConversationPress: PropTypes.func,
  conversations: PropTypes.array
};

export default withNavigation(ConversationList);
