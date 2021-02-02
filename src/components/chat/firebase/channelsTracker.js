import {
  setChannelsSubcribed,
  setChannels
} from "../../../store/actions/chatActions";
import { setUsers, setUserData } from "../../../store/actions/userAuth";
import { firebaseUser } from "../../../services/index";
import { channelManager } from "./index";

export default class ChannelsTracker {
  constructor(reduxStore, userID) {
    this.reduxStore = reduxStore;
    this.userID = userID;
    this.reduxStore.subscribe(this.syncTrackerToStore);
  }

  syncTrackerToStore = () => {
    const state = this.reduxStore.getState();
    this.users = state.auth.users;
  };

  subscribeIfNeeded = () => {
    const userId = this.userID;
    const state = this.reduxStore.getState();
    console.log(this.userID, state, "subscribe");
    if (!state.chat.areChannelsSubcribed) {
      console.log("Yes");
      this.reduxStore.dispatch(setChannelsSubcribed());
      this.currentUserUnsubscribe = firebaseUser.subscribeCurrentUser(
        userId,
        this.onCurrentUserUpdate
      );

      this.usersUnsubscribe = firebaseUser.subscribeUsers(
        userId,
        this.onUsersCollection
      );

      this.channelParticipantUnsubscribe = channelManager.subscribeChannelParticipation(
        userId,
        this.onChannelParticipationCollectionUpdate
      );
      this.channelsUnsubscribe = channelManager.subscribeChannels(
        this.onChannelCollectionUpdate
      );
    }
  };

  unsubscribe = () => {
    if (this.currentUserUnsubscribe) {
      this.currentUserUnsubscribe();
    }
    if (this.usersUnsubscribe) {
      this.usersUnsubscribe();
    }
    if (this.channelsUnsubscribe) {
      this.channelsUnsubscribe();
    }
    if (this.channelParticipantUnsubscribe) {
      this.channelParticipantUnsubscribe();
    }
  };

  updateUsers = users => {
    const state = this.reduxStore.getState();
    this.users = users;
    this.reduxStore.dispatch(setUsers(this.users));
    this.hydrateChannelsIfNeeded();
  };

  onCurrentUserUpdate = user => {
    this.reduxStore.dispatch(setUserData({ user }));
  };

  onUsersCollection = (data, completeData) => {
    this.updateUsers(data);
  };

  onChannelParticipationCollectionUpdate = participations => {
    this.participations = participations;
    this.hydrateChannelsIfNeeded();
  };

  onChannelCollectionUpdate = channels => {
    this.channels = channels;
    this.hydrateChannelsIfNeeded();
  };

  hydrateChannelsIfNeeded = () => {
    const channels = this.channels;
    const allUsers = this.users;
    const participations = this.participations;
    // console.log(participations, "1", 'debugg', channels, " CHANNNEL", allUsers)
    if (!channels || !allUsers || !participations) {
      console.log("not abdoe");
      return;
    }
    // we fetched all the data that we need

    const myChannels = channels.filter(channel =>
      participations.find(participation => participation.channel == channel.id)
    );

    const participantIDsByChannelHash = {};

    var channelParticipantPromises = myChannels.map(channel => {
      return new Promise((resolve, _reject) => {
        channelManager.fetchChannelParticipantIDs(channel, participantIDs => {
          participantIDsByChannelHash[channel.id] = participantIDs;
          resolve();
        });
      });
    });

    Promise.all(channelParticipantPromises).then(_values => {
      var hydratedChannels = [];
      myChannels.forEach(channel => {
        const participantIDs = participantIDsByChannelHash[channel.id];
        if (participantIDs) {
          // filter out current user
          const finalParticipantIDs = participantIDs.filter(
            id => id != this.userID
          );
          if (finalParticipantIDs && finalParticipantIDs.length > 0) {
            var hydratedParticipants = [];
            finalParticipantIDs.forEach(userID => {
              const user = allUsers.find(
                user =>
                  user?.id == userID ||
                  user?._id == userID ||
                  user?.jwt == userID
              );
              if (user) {
                // we have an hydrated user for this current participant
                hydratedParticipants.push(user);
              }
            });
            hydratedChannels.push({
              ...channel,
              participants: hydratedParticipants
            });
          }
        }
      });

      this.hydratedChannels = hydratedChannels;
      this.updateChannelsStore();
    });
  };

  updateChannelsStore() {
    const channels = this.hydratedChannels;
    if (channels) {
      const sortedChannels = channels.sort(function(a, b) {
        if (!a.lastMessageDate) {
          return 1;
        }
        if (!b.lastMessageDate) {
          return -1;
        }
        a = new Date(a.lastMessageDate.seconds);
        b = new Date(b.lastMessageDate.seconds);
        return a > b ? -1 : a < b ? 1 : 0;
      });
      this.reduxStore.dispatch(setChannels(sortedChannels));
    }
  }

  channelsWithNoBannedUsers = channels => {
    const channelsWithNoBannedUsers = [];
    channels.forEach(channel => {
      if (
        channel.participants &&
        channel.participants.length > 0 &&
        channel.participants.length != 1
      ) {
        channelsWithNoBannedUsers.push(channel);
      }
    });
    console.log(channelsWithNoBannedUsers, "nobanned");
    return channelsWithNoBannedUsers;
  };
}
