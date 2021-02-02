import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ScrollView, View, Dimensions, BackHandler } from "react-native";
import dynamicStyle from "./styles";
import { ConversationListView } from "../..";
import AudioVideoChat from "../../Audio/AudioChat";
const styles = dynamicStyle;
import Header from "../../../Header";
import { withNavigation } from "react-navigation";
class ChatHomeComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  // BackHandler.addEventListener("hardwareBackPress", props.navigation.goBack());

  changeDrawer = () => {
    this.props.navigation.goBack();
  };
  // backButtonHandler = () => {
  //   this.changeDrawer();
  //   // return true;
  //   // props.navigation.addListener(
  //   //   "didFocus",
  //   //   payload =>
  //   //     BackHandler.addEventListener(
  //   //       "hardwareBackPress",
  //   //       ()=>props.navigation.goBack(null)
  //   //     ))
  // };
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backButtonHandler);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this.backButtonHandler
    );
  }
  backButtonHandler = () => {
    this.props.navigation.goBack(null);
    return true;
  };

  render() {
    const {
      user,
      navigation,
      onEmptyStatePress,
      audioVideoChatConfig
    } = this.props;
    const { props } = this;
    const emptyStateConfig = {
      title: "No Conversations",
      description: "Your conversations will show up here when you have any.",
      buttonName: "Add",
      onPress: onEmptyStatePress
    };
    return (
      <>
        <Header
          title={
            props.navigation.getParam("longPress")
              ? props.navigation.getParam("user")
                ? props.navigation.getParam("user").name + " Chats"
                : "Chats"
              : "Chats"
          }
          changeDrawer={this.changeDrawer}
          icon={"arrow-back"}
          // logout={this.logout}
          customStyles={{
            paddingTop:
              Platform.OS === "ios"
                ? (60 * Dimensions.get("window").height) / 896
                : 20,
            height:
              Platform.OS === "ios"
                ? (120 * Dimensions.get("window").height) / 896
                : 80
          }}
        />
        <View style={styles.container}>
          <ScrollView style={styles.container}>
            <View style={styles.chatsChannelContainer}>
              <ConversationListView
                user={user}
                navigation={navigation}
                emptyStateConfig={emptyStateConfig}
                longPress={
                  props.navigation.getParam("longPress")
                    ? props.navigation.getParam("longPress")
                    : false
                }
                longPressUser={
                  props.navigation.getParam("user")
                    ? props.navigation.getParam("user")
                    : null
                }
              />
            </View>
          </ScrollView>
          {audioVideoChatConfig && (
            <AudioVideoChat {...audioVideoChatConfig} user={user} />
          )}
        </View>
      </>
    );
  }
}

ChatHomeComponent.propTypes = {
  onSearchClear: PropTypes.func,
  onFriendItemPress: PropTypes.func,
  onFriendAction: PropTypes.func,
  onSearchBarPress: PropTypes.func,
  onSearchBarCancel: PropTypes.func,
  onSearchTextChange: PropTypes.func,
  onSearchModalClose: PropTypes.func,
  channels: PropTypes.array,
  searchData: PropTypes.array,
  isSearchModalOpen: PropTypes.bool,
  searchBarRef: PropTypes.object
};

export default withNavigation(ChatHomeComponent);
