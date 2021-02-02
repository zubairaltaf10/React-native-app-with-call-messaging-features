import { StyleSheet } from "react-native";

import color from "../../../styles/variables";

const chatBackgroundColor = color.colorAccent;

const dynamicStyles = StyleSheet.create({
  personalChatContainer: {
    backgroundColor: chatBackgroundColor,
    flex: 1
  },
  //Bottom Input
  inputBar: {
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#d6d6d6",
    flexDirection: "row"
  },
  progressBar: {
    backgroundColor: color.colorPrimary,
    height: 3,
    shadowColor: "#000",
    width: 0
  },
  inputIconContainer: {
    marginTop: 10,
    marginRight: 5,
    marginBottom: 10
  },

  inputIconContainer1: {
    // marginTop: 10,
    flex: 1,
    width: "100%"
  },
  inputIcon: {
    //  tintColor: '#4395f8',
    // paddingLeft: 50,
    width: 25,
    height: 25
  },
  inputIcon1: {
    //  tintColor: '#4395f8',
    marginRight: 20,
    width: 25,
    height: 25
    //justifyContent: "flex-end"
  },
  input: {
    //  margin: 5,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    flex: 1,
    backgroundColor: "#fff",
    fontSize: 16,
    borderRadius: 5,
    color: color.colorTextDark,
    borderWidth: 1,
    borderColor: color.colorPrimary
  },
  // Message Thread
  messageThreadContainer: {
    margin: 6
  },
  // Thread Item
  sendItemContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    flexDirection: "row",
    marginLeft: 5,
    marginTop: 30
  },
  itemContent: {
    padding: 10,
    backgroundColor: "#D3D3D3",
    borderRadius: 7,
    maxWidth: "80%",
    opacity: 0.5
  },
  itemContent1: {
    padding: 10,
    backgroundColor: color.colorPrimary,
    borderRadius: 7,
    maxWidth: "80%"
  },
  sendItemContent: {
    marginRight: 15
  },

  textBoederImgSend: {
    position: "absolute",
    right: -5,
    bottom: 0,
    width: 20,
    height: 8,
    resizeMode: "stretch",
    tintColor: "#4395f8"
  },
  sendTextMessage: {
    fontSize: 16,
    color: "white",
    marginRight: 30
  },

  userIcon: {
    width: 30,
    height: 30,
    borderRadius: 17,
    position: "absolute",
    top: -10,
    left: 0,
    zIndex: 1
  },

  userIconSender: {
    width: 30,
    height: 30,
    borderRadius: 17,
    position: "absolute",
    top: -10,
    right: 0,
    zIndex: 1
  },

  userIconText: {
    width: 30,
    height: 30,
    borderRadius: 17,
    position: "absolute",
    top: -10,
    left: 0,
    zIndex: 1
  },

  userIconText1: {
    width: 30,
    height: 30,
    borderRadius: 17,
    position: "absolute",
    top: -10,
    right: 0,
    zIndex: 1
  },
  receiveItemContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    flexDirection: "row",
    //  marginBottom: 25,
    marginLeft: 5,
    marginTop: 30
  },
  receiveItemContent: {
    marginLeft: 15
  },

  receiveTextMessage: {
    color: "#000000",
    fontSize: 16,
    marginLeft: 30
  },
  textBoederImgReceive: {
    position: "absolute",
    left: -5,
    bottom: 0,
    width: 20,
    height: 8,
    resizeMode: "stretch",
    tintColor: "#d6d6d6"
  },
  mediaVideoLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },
  centerItem: {
    justifyContent: "center",
    alignItems: "center"
  },
  playButton: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    width: 38,
    height: 38,
    backgroundColor: "transparent"
  },

  container: {
    flex: 1,
    backgroundColor: "#2b608a",
    marginVertical: 20
  },
  controls: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },
  progressText: {
    paddingTop: 50,
    fontSize: 50,
    color: "#fff"
  },
  button: {
    padding: 20
  },
  disabledButtonText: {
    color: "#eee"
  },
  buttonText: {
    fontSize: 20,
    color: "#fff"
  },
  activeButtonText: {
    fontSize: 20,
    color: "#B81F00"
  }
});

export default dynamicStyles;
