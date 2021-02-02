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
  Dimensions
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
import { updateUserData } from "../../services/user";
const { width, height } = Dimensions.get("window");
class TherapistChat extends Component {
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

  getChat = async id => {
    const user = await session.getUser();
    // http.get(`/therapists/${id}/chat?page=${this.state.page}`, { headers: { 'Authorization': `Bearer ${user.jwt}` } })
    //     .then(resp => {
    //         this.setState({
    //             messages: resp.data.data.messages.docs,
    //             loading: false,
    //             hasMore: resp.data.data.messages.pages > 1 ? true : false
    //         })
    //         // this.setState({ messages: resp.data.data.docs, loading: false, hasMore: resp.data.data.pages > 1 ? true : false })
    //     })
    //     .catch(err => {
    //         if (err.response) {
    //             Snack("error", err.response.data.error)
    //         }
    //         else {
    //             Snack("error", "Unknown error occured, please contact an Admin");
    //         }
    // })
  };

  async componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    // this.props.navigation.goBack();
    this.props.navigation.goBack();
  };

  goBack = () => {
    // this.props.navigation.goBack();
    if (this.state.callStatus === "") {
      this.props.navigation.navigate("AssignedUsersChats", {
        user: this.state.user
      });
    }
  };

  render() {
    return (
      <>
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
      </>
    );
  }
}

const styles = StyleSheet.create({});

TherapistChat.propTypes = {
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
)(TherapistChat);
