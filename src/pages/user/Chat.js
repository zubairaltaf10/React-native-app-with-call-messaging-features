import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import ChatHomeComponent from "../../components/chat/ui/ChatHomeComponent/ChatHomeComponent";
// import { TNTouchableIcon } from '../../Core/truly-native';
import {
  Alert,
  Linking,
  Platform,
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
  Dimensions,
  BackHandler
} from "react-native";
// import {
//     FriendshipConstants,
//     filteredNonFriendshipsFromUsers,
// } from '../../Core/socialgraph/friendships';
// import AppStyles from '../../DynamicAppStyles';
// import {
//     setFriends,
//     setFriendships,
// } from '../../Core/socialgraph/friendships/redux';
import { setUsers } from "../../store/actions/userAuth";
// import FriendshipTracker from '../../Core/socialgraph/friendships/firebase/tracker';
import { ReactReduxContext } from "react-redux";

class ChatScreen extends Component {
  static contextType = ReactReduxContext;

  static navigationOptions = ({ screenProps, navigation }) => {
    // let currentTheme = AppStyles.navThemeConstants[screenProps.theme];
    const { params = {} } = navigation.state;
    return {
      headerTitle: "Chats"
      // headerRight: (
      //   <TNTouchableIcon
      //     imageStyle={{ tintColor: currentTheme.fontColor }}
      //     iconSource={AppStyles.iconSet.inscription}
      //     onPress={() =>
      //       navigation.navigate('CreateGroup', { appStyles: AppStyles })
      //     }
      //     appStyles={AppStyles}
      //   />
      // ),
      //   headerLeft: (
      //     <TNTouchableIcon
      //       imageStyle={{ tintColor: currentTheme.fontColor }}
      //       iconSource={AppStyles.iconSet.menuHamburger}
      //       onPress={params.openDrawer}
      //     />
      //   ),
      // headerStyle: {
      //     backgroundColor: currentTheme.backgroundColor,
      // },
      // headerTintColor: currentTheme.fontColor,
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      isSearchModalOpen: false,
      filteredFriendships: [],
      loading: true,
      typed: false,
      valueSearch: ""
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    this.props.navigation.goBack();
    return true;
    // this.props.navigation.navigate('Dashboard');
  };

  render() {
    return (
      <ChatHomeComponent
        user={this.props.navigation.state.params.user}
        loading={this.state.loading}
        navigation={this.props.navigation}
        // friends={this.props.friends}
        // onFriendItemPress={this.onFriendItemPress}
        // onFriendAction={this.onFriendAction}
        //navigation={this.props.navigation}
        //  onSenderProfilePicturePress={this.onSenderProfilePicturePress}
        audioVideoChatConfig={this.props.audioVideoChatConfig}
      />
    );
  }
}

ChatScreen.propTypes = {
  friends: PropTypes.array,
  users: PropTypes.array
};

const mapStateToProps = ({ friends, auth, audioChat }) => {
  return {
    // user: auth.user,
    // friends: friends.friends,
    users: auth.users,
    // friendships: friends.friendships,
    audioVideoChatConfig: audioChat
  };
};

export default connect(
  mapStateToProps,
  {
    //  setFriends,
    setUsers
    // setFriendships,
  }
)(ChatScreen);
