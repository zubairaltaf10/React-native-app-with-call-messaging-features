import { StyleSheet } from "react-native";
import { size } from "./device";
import color from "../../../styles/variables";
import { styles, theme } from "../../../styles";

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
    // borderTopWidth: 1,
    borderTopColor: theme.colorLightGrey,
    flexDirection: "row",
    padding: 2,
    paddingBottom: 5
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
  inputIcon: {
    //  tintColor: '#4395f8',
    width: 25,
    height: 25
  },
  input: {
    //  margin: 5,
    //paddingTop: 5,
    //  paddingBottom: 5,
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    flex: 1,
    backgroundColor: "#fff",

    borderRadius: 5,

    borderWidth: 1,
    borderColor: color.colorPrimary
    // bottom: 50,
  },
  // Message Thread
  messageThreadContainer: {
    // padding: 10,
  },
  // Thread Item

  itemContent: {
    // margin: 15,
    // paddingRight: 25,
    backgroundColor: "#f2f7f8",
    borderRadius: 5
    // width: "100%",
    // opacity: 0.5
  },
  itemContent1: {
    backgroundColor: color.colorPrimary,
    borderRadius: 5
    // width: "95%",
    // alignSelf:'center',
    // width:'100%'
  },
  sendItemContent: {
    // marginRight: 15
    // alignSelf:'center',
    // width:'100%'
  },
  mediaMessage: {
    width: "95%",
    alignSelf: "center",
    height: size(250),
    resizeMode: "stretch",
    borderRadius: 5,
    marginHorizontal: 0,
    borderColor: "#ddd",
    borderRadius: 5
  },

  boederImgSend: {
    position: "absolute",
    width: size(300),
    height: size(250),
    resizeMode: "stretch",
    tintColor: chatBackgroundColor
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
    width: 35,
    height: 35,
    borderRadius: 100,
    position: "absolute",
    top: -18,
    left: -18,
    zIndex: 1
  },

  userIconText1: {
    width: 35,
    height: 35,
    borderRadius: 100,
    position: "absolute",
    top: -18,
    right: -18,
    zIndex: 1
  },
  sendItemContainer: {
    // justifyContent: 'flex-end',
    // alignItems: 'flex-end',
    // flexDirection: 'row',
    margin: 20,
    marginVertical: 15,
    // paddingHorizontal:50,
    alignSelf: "center",
    width: "90%"
    // marginBottom: 0
  },
  receiveItemContainer: {
    // justifyContent: 'flex-start',
    // alignItems: 'flex-end',
    // flexDirection: 'row',
    // marginRight: 25,

    margin: 20,
    marginVertical: 15,
    alignSelf: "center",
    width: "90%"

    // marginTop: 30,
    // marginLeft: 5
  },
  receiveItemContent: {
    // marginHorizontal: 15
    // marginLeft:15
  },
  boederImgReceive: {
    position: "absolute",
    width: size(300),
    height: size(250),
    resizeMode: "stretch",
    tintColor: chatBackgroundColor
  },
  sendTextMessage: {
    // fontSize: 16,

    // marginRight: 15,

    ...styles.title,
    fontFamily: theme.font.regular,
    color: theme.colorLightGrey,
    padding: 15,
    paddingLeft: 20,
    paddingRight: 25
    //  justifyContent: ,
    //alignItems: "flex-start"
    // alignSelf:'center',
    // width:'100%'
  },

  receiveTextMessage: {
    ...styles.title,
    fontFamily: theme.font.regular,
    color: theme.colorGrey,
    // marginLeft: 15,
    padding: 15,
    paddingLeft: 25,
    paddingRight: 20
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
    width: 20,
    height: 20,
    backgroundColor: "transparent"
  }
});

export default dynamicStyles;
