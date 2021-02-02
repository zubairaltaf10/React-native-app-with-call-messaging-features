import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { styles, theme } from "../styles";
import { Overlay, Button, Divider, Avatar, Icon } from "react-native-elements";
import LinearGradient from "react-native-linear-gradient";

export default function ConfirmationModal(props) {
  const [approvedModalVisible, setApprovedModalVisible] = useState(false);
  const [rejectedModalVisible, setRejectedModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Overlay
        isVisible={props.visible}
        onBackdropPress={() =>
          props.close ? props.close() : props.updateVisible(null, "remove")
        }
        overlayStyle={{ padding: 0, marginVertical: 20 }}
        borderRadius={20}
        height="auto"
      >
        <ScrollView style={{ borderRadius: 20 }}>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              marginTop: theme.size(10),
              marginBottom: 30
            }}
          >
            <Icon
              name="close"
              type="material-community"
              size={30}
              containerStyle={{ alignSelf: "flex-end", marginRight: 10 }}
              underlayColor="transparent"
              onPress={() => {
                props.close
                  ? props.close()
                  : props.updateVisible(null, "remove");
              }}
            />
            {props.message && (
              <Text style={[styles.bodyText, { fontSize: 16 }]}>
                {props.message}
              </Text>
            )}
            {props.title && (
              <Text
                style={[
                  styles.h1,
                  {
                    // fontSize: 20,
                    fontFamily: "Montserrat-SemiBold"
                  }
                ]}
              >
                {props.title}
              </Text>
            )}
            <Divider style={{ marginVertical: theme.size(20), width: "80%" }} />
            <Avatar
              rounded
              size="large"
              source={{ uri: props.data.photo ? props.data.photo : "" }}
            />
            <Text
              style={[
                styles.h2,
                {
                  marginVertical: theme.size(10),
                  textAlign: "center",
                  fontSize: 16
                }
              ]}
              numberOfLines={2}
            >
              {props.data.name || "therapist"}
            </Text>
            <View style={{ marginVertical: theme.size(20), width: "80%" }}>
              {props.children}
            </View>
            <Divider style={{ marginVertical: theme.size(10), width: "80%" }} />
            {props.singleButton ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    width: "80%"
                  }}
                >
                  <Button
                    title={props.buttonTitle || "OK"}
                    buttonStyle={{
                      borderRadius: theme.size(6)
                      //  marginLeftl:10
                    }}
                    titleStyle={{ color: theme.colorAccent }}
                    onPress={() => {
                      props.updateVisible(null, "remove");
                      if (props.buttonTitle === "Accept") {
                        setApprovedModalVisible(true);
                      }
                      // setRejectedModalVisible(true);
                    }}
                    containerStyle={{
                      width: "40%",
                      alignSelf: "center",
                      marginVertical: theme.size(10)
                    }}
                    linearGradientProps={null}
                  />
                </View>
              </>
            ) : (
              <>
                {props.horizontalButtons ? (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      width: "80%"
                    }}
                  >
                    <Button
                      title="Reject"
                      buttonStyle={{
                        // backgroundColor: '#FF5136',
                        borderRadius: theme.size(6),
                        //  marginLeftl:10
                        backgroundColor: theme.colorGrey
                      }}
                      titleStyle={{ color: theme.colorAccent }}
                      onPress={() => {
                        props.updateVisible(null, "remove");
                        setRejectedModalVisible(true);
                      }}
                      containerStyle={{
                        width: "40%",
                        marginVertical: theme.size(10)
                      }}
                      linearGradientProps={null}
                    />
                    <Button
                      title="Approve"
                      buttonStyle={{
                        backgroundColor: "white",
                        borderRadius: theme.size(6)

                        // marginRight:10,
                      }}
                      titleStyle={{ color: theme.colorAccent }}
                      onPress={() => {
                        props.removeTherapist();

                        setApprovedModalVisible(true);
                      }}
                      containerStyle={{
                        width: "40%",
                        marginVertical: theme.size(10)
                      }}
                      linearGradientProps={{
                        start: { x: 0, y: 0 },
                        end: { x: 1, y: 10 },
                        colors: [
                          theme.colorGradientStart,
                          theme.colorGradientEnd
                        ]
                      }}
                      ViewComponent={LinearGradient}
                    />
                  </View>
                ) : (
                  <>
                    <Button
                      title="Yes"
                      buttonStyle={{
                        backgroundColor: "white",
                        borderRadius: theme.size(6)
                      }}
                      titleStyle={{ color: theme.colorAccent }}
                      onPress={async () => {
                        setLoading(true);
                        await props.removeTherapist();
                        setLoading(false);
                      }}
                      containerStyle={{
                        width: "75%",
                        marginVertical: theme.size(10)
                      }}
                      loading={!!loading}
                      linearGradientProps={{
                        start: { x: 0, y: 0 },
                        end: { x: 1, y: 10 },
                        colors: [
                          theme.colorGradientStart,
                          theme.colorGradientEnd
                        ]
                      }}
                      ViewComponent={LinearGradient}
                    />
                    <Button
                      title="No"
                      buttonStyle={{
                        backgroundColor: "white",
                        borderRadius: theme.size(6),
                        backgroundColor: theme.colorGrey
                      }}
                      titleStyle={{ color: theme.colorAccent }}
                      onPress={() => props.updateVisible(null, "remove")}
                      containerStyle={{
                        width: "75%",
                        marginVertical: theme.size(10),
                        backgroundColor: theme.colorGrey
                      }}
                      linearGradientProps={null}
                    />
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </Overlay>
      <Overlay
        isVisible={approvedModalVisible}
        onBackdropPress={() => setApprovedModalVisible(false)}
        overlayStyle={{ padding: 0, marginVertical: 20 }}
        borderRadius={20}
        height="auto"
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={["white", "white"]}
          style={{ borderRadius: 20 }}
        >
          <ScrollView style={{ borderRadius: 20 }}>
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",

                margin: 30
              }}
            >
              <Icon
                name="check-circle"
                color="#00F900"
                type="material-community"
                size={70}
                containerStyle={{ margin: 10 }}
                underlayColor="transparent"
              />
              <Text
                style={[
                  styles.bodyText,
                  {
                    // color: 'white',
                    fontSize: 20,
                    marginTop: theme.size(10),
                    marginBottom: theme.size(30)
                  }
                ]}
              >
                Approved
              </Text>
              {
                <>
                  <Button
                    title="OK"
                    buttonStyle={{
                      backgroundColor: "white",
                      borderRadius: theme.size(6)
                    }}
                    titleStyle={{ color: theme.colorAccent }}
                    onPress={() => {
                      setApprovedModalVisible(false);
                    }}
                    containerStyle={{
                      width: "40%",
                      marginVertical: theme.size(10)
                    }}
                    ViewComponent={LinearGradient}
                  />
                </>
              }
            </View>
          </ScrollView>
        </LinearGradient>
      </Overlay>
      <Overlay
        isVisible={rejectedModalVisible}
        onBackdropPress={() => setRejectedModalVisible(false)}
        overlayStyle={{ padding: 0, marginVertical: 20 }}
        borderRadius={20}
        height="auto"
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={["white", "white"]}
          style={{ borderRadius: 20 }}
        >
          <ScrollView style={{ borderRadius: 20 }}>
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",

                margin: 30
              }}
            >
              <Icon
                name="close-circle"
                color="#FF5136"
                type="material-community"
                size={70}
                underlayColor="transparent"
                containerStyle={{ margin: 10, marginBottom: theme.size(0) }}
              />
              <Text
                style={[
                  styles.bodyText,
                  {
                    // color: 'white',
                    fontSize: 20,
                    marginTop: theme.size(20),
                    marginBottom: theme.size(30)
                  }
                ]}
              >
                Rejected
              </Text>
              {
                <>
                  <Button
                    title="OK"
                    buttonStyle={{
                      backgroundColor: "white",
                      borderRadius: theme.size(6)
                    }}
                    titleStyle={{ color: theme.colorAccent }}
                    onPress={() => setRejectedModalVisible(false)}
                    containerStyle={{
                      width: "40%",
                      marginVertical: theme.size(10)
                    }}
                    ViewComponent={LinearGradient}
                  />
                </>
              }
            </View>
          </ScrollView>
        </LinearGradient>
      </Overlay>
    </>
  );
}
