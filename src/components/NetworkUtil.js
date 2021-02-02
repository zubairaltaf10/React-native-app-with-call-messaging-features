import NetInfo from "@react-native-community/netinfo";
import { Overlay } from "react-native-elements";
import Snackbar from "./Snackbar";

export default class NetworkUtils {
  static async isNetworkAvailable(show = true) {
    const response = await NetInfo.fetch();
    // alert(JSON.stringify(response));
    // return response.isConnected && response.isInternetReachable;
    if (!(response.isConnected && response.isInternetReachable)) {
      show?Snackbar("error", "No or weak internet connectivity"):null;
      return false;
    }
    return true;
  }
  // render() {
  //   return (
  //     <Overlay
  //       isVisible={props.visible}
  //       onBackdropPress={() => {}}
  //       height={width * 0.8}
  //       width={width * 0.8}
  //       overlayStyle={{ padding: 0, borderRadius: 20 }}
  //     >
  //       {/* <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} colors={[theme.colorAccent, theme.colorAccent]}> */}
  //       <ScrollView style={[styles.bodyPadding]}>
  //         {/* <Icon
  //           name={"close"}
  //           color={theme.colorGrey}
  //           type="evil-icons"
  //           size={30}
  //           containerStyle={{
  //             alignSelf: "flex-end",
  //             top: theme.size(10)
  //             // right: theme.size(5)
  //           }}
  //           onPress={() => props.updateVisible()}
  //         /> */}
  //         <Text
  //           style={[
  //             styles.h1,
  //             {
  //               textAlign: "center",
  //               color: theme.colorDarkGrey,
  //               fontFamily: theme.font.bold,
  //               margin: 30,
  //               marginBottom: 40
  //             }
  //           ]}
  //         >
  //           Network not available!
  //         </Text>
  //         <Button
  //           title={"retry"}
  //           buttonStyle={{ borderRadius: 10, alignSelf: "center" }}
  //           containerStyle={{
  //             borderRadius: 10,
  //             width: "70%",
  //             alignSelf: "center",
  //             margin: 10,
  //             marginBottom: 15
  //           }}
  //           icon={{
  //             name: "retry",
  //             type: "feather",
  //             size: 15,
  //             color: "white"
  //           }}
  //           iconContainerStyle={{ paddingRight: 10 }}
  //           titleStyle={{
  //             ...styles.title,
  //             color: theme.colorAccent
  //             // fontFamily:theme.font.medium
  //           }}
  //           ViewComponent={LinearGradient}
  //           onPress={async () => {
  //             if (!(await isNetworkAvailable())) {

  //             } else {
  //             props.updateVisible()
  //             }
  //           }}
  //         />
  //       </ScrollView>
  //       {/* </LinearGradient> */}
  //     </Overlay>
  //   );
  // }
}
