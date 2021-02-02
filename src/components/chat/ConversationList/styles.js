import { StyleSheet, Dimensions } from "react-native";
import color from "../../../styles/variables";
const { height } = Dimensions.get("window");

const dynamicStyles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    backgroundColor: color.colorAccent
  },
  userImageContainer: {
    borderWidth: 0
  },
  chatsChannelContainer: {
    // flex: 1,
    padding: 0
  },
  chatItemContainer: {
    flexDirection: "row",
    marginBottom: 20
  },
  chatItemContent: {
    flex: 1,
    alignSelf: "center",
    marginLeft: 10
  },
  chatFriendName: {
    color: color.colorTextDark,
    fontSize: 17
  },
  content: {
    flexDirection: "row"
  },
  message: {
    flex: 2,
    color: color.mainSubtextColor
  },
  emptyViewContainer: {
    marginTop: height / 5
  }
});

export default dynamicStyles;
