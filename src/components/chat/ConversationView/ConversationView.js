import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import { timeFormat } from "../../../util/timeFormat";
import dynamicStyles from "./styles";
import { ListItem } from "react-native-elements";
import { styles as appStyles, theme } from "../../../styles";

function ConversationView(props) {
  const {
    onChatItemPress,
    formatMessage,
    item,
    onConversationLongPress,
    longPress
  } = props;
  const styles = dynamicStyles;

  // const [unread, setUnread] = useState(null);

  let title = item.name;
  if (!title) {
    if (item.participants.length > 0) {
      let friend = item.participants[0];
      title = friend.name;
    }
  }

  let unread = null;

  if (item?.seen == false) {
    unread = true;
  } else {
    unread = false;
  }

  return (
    <ListItem
      style={{
        borderLeftColor:
          item.participants[0]?.id == item?.senderID
            ? unread == true
              ? theme.colorPrimary
              : theme.colorGrey
            : theme.colorGrey,
        borderLeftWidth: theme.size(5)
      }}
      key={item}
      leftAvatar={{
        source: {
          uri: item.participants.length
            ? item.participants[0]?.profilePictureURL ||
              item.participants[0]?.photo
            : "https://www.iosapptemplates.com/wp-content/uploads/2019/06/empty-avatar.jpg"
        }
      }}
      title={title}
      titleStyle={appStyles.title}
      subtitleStyle={appStyles.subtitle}
      bottomDivider
      onPress={() => onChatItemPress(item, longPress)}
      onLongPress={() => onConversationLongPress(item.participants[0])}
      subtitle={
        <View styles={{ width: "100%", flexDirection: "row" }}>
          <View>
            <Text
              style={{
                ...appStyles.subtitle,
                color: theme.colorGrey,
                fontFamily:
                  item.participants[0]?.id == item?.senderID
                    ? unread == true
                      ? theme.font.bold
                      : null
                    : null
              }}
              numberOfLines={1}
            >
              {formatMessage(item)}
            </Text>
          </View>
          <View>
            <Text
              style={{
                ...appStyles.subtitle,
                color: theme.colorGrey,
                fontSize: 10,
                textAlign: "right",
                fontFamily:
                  item.participants[0]?.id == item?.senderID
                    ? unread == true
                      ? theme.font.bold
                      : theme.font.regular
                    : theme.font.regular
              }}
            >
              {timeFormat(item.lastMessageDate)}
            </Text>
          </View>
        </View>
      }
    />
  );
}

ConversationView.propTypes = {
  formatMessage: PropTypes.func,
  item: PropTypes.object,
  onChatItemPress: PropTypes.func
};

export default ConversationView;
