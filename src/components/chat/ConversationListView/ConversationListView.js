import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect, ReactReduxContext } from "react-redux";
import ConversationList from "../ConversationList";
import ChannelsTracker from "../firebase/channelsTracker";
import { withNavigation } from "react-navigation";
import { setClearChannel } from "../../../store/actions/chatActions";
import NetworkUtilModal from "../../NetworkUtilModal";
import NetworkUtils from "../../NetworkUtil";
class ConversationListView extends Component {
  static contextType = ReactReduxContext;

  constructor(props) {
    super(props);

    this.hold = [
      {
        channelID: "0dHv5PZ6ifRtKe4aGlrdtKQaQPF32Y62Sd2iNGZ64qntWgAIPqsUncG3",
        creatorID: "2Y62Sd2iNGZ64qntWgAIPqsUncG3",
        id: "0dHv5PZ6ifRtKe4aGlrdtKQaQPF32Y62Sd2iNGZ64qntWgAIPqsUncG3",
        lastMessage: {
          mime: "image/jpeg",
          url:
            "https://firebasestorage.googleapis.com/v0/b/pukaar-4988e.appspot.com/o/Thu%20Oct%2008%202020%2019%3A42%3A16%20GMT%2B0500%20(PKT)-IMG-20201008-WA0006.jpg?alt=media&token=9a68851b-75e2-4c98-828f-bce424071031"
        },
        lastMessageDate: [Object],
        name: "Qasim",
        participants: []
      }
    ];
  }

  async componentDidMount() {
    if (!(await NetworkUtils.isNetworkAvailable())) {
      this.setState({ NetworkUtilModal: true });
      return;
    }
    this.props.setClearChannel();
    const self = this;
    const userId =
      self.props.user?.jwt || self.props.user._id || self.props.user.id;

    this.channelsTracker = new ChannelsTracker(this.context.store, userId);

    this.channelsTracker.subscribeIfNeeded();
  }

  componentWillUnmount() {
    //   this.channelsTracker.unsubscribe();
  }

  onConversationPress = (channel, longPress) => {
    this.props.navigation.navigate("PersonalChat", {
      user: longPress ? this.props.longPressUser : this.props.user,
      channel,
      longPress,
      seen: true
    });
  };

  onConversationLongPress = channel => {
    if (this.props.user?.role == "THERAPIST") {
      if (channel?.role == "USER") {
        this.channelsTracker = new ChannelsTracker(
          this.context.store,
          channel?._id
        );
        this.channelsTracker.subscribeIfNeeded();
        this.props.navigation.navigate("UserChat", {
          user: channel,
          channel,
          longPress: true
        });
      }
    }
  };

  render() {
    if (this.state?.NetworkUtilModal == true) {
      return (
        <NetworkUtilModal
          visible={!!this.state?.NetworkUtilModal}
          updateVisible={() => {
            this.setState({
              NetworkUtilModal: !this.state.NetworkUtilModal
            });
            // this.forceUpdate();
          }}
        />
      );
    } else {
      return (
        <ConversationList
          user={this.props.user}
          loading={this.props.channels == null}
          conversations={this.props.channels}
          onConversationPress={this.onConversationPress}
          emptyStateConfig={this.props.emptyStateConfig}
          onConversationLongPress={this.onConversationLongPress}
          longPress={this.props.longPress}
        />
      );
    }
  }
}

ConversationListView.propTypes = {
  channels: PropTypes.array
};

const mapStateToProps = ({ chat, auth }) => {
  return {
    channels: chat.channels
    // user: auth.user,
  };
};

export default connect(
  mapStateToProps,
  { setClearChannel }
)(withNavigation(ConversationListView));
