import React from "react";
import { TouchableOpacity, Text, View, ScrollView } from "react-native";
import { Input, Button } from "react-native-elements";
import { styles, theme } from "../styles";
import { Overlay, ListItem } from "react-native-elements";
import LinearGradient from "react-native-linear-gradient";

export default function MultiSelect(props) {
  let selectedValues = props.selectedValues;
  const options = Object.keys(props.data).map((key, i) => {
    console.log(props.data[key] == "true" ? "Yes" : "cv243234b");
    return (
      <ListItem
        key={i}
        title={
          props.data[key] == "true"
            ? "Yes"
            : props.data[key] == "false"
            ? "No"
            : props.data[key]
        }
        titleStyle={{
          fontFamily: theme.font.medium,
          ...styles.title,
          fontFamily: theme.font.medium
        }}
        onPress={() => {
          props.single
            ? props.updateValues(props.data[key])
            : props.updateValues(props.data[key]);
        }}
        rightIcon={
          props.single
            ? selectedValues === props.data[key]
              ? { name: "check" }
              : null
            : selectedValues && selectedValues.includes(props.data[key])
            ? { name: "check" }
            : null
        }
        topDivider
      />
    );
  });

  // if (!props.visible) {
  //     return (
  //         <TouchableOpacity style={{ width: "100%", marginTop: theme.size(20) }} onPress={() => props.updateVisible()}>
  //             <Input
  //                 inputContainerStyle={{
  //                     borderBottomWidth: 0,
  //                 }}
  //                 containerStyle={{
  //                     borderColor: theme.inputBordercolor,
  //                     borderRadius: 4,
  //                     borderWidth: 1,
  //                     paddingHorizontal: 0
  //                 }}
  //                 placeholderTextColor={theme.colorGrey}
  //                 {...props}
  //                 disabled={true}
  //             />
  //         </TouchableOpacity>
  //     )
  // }
  // else {
  return (
    <Overlay
      isVisible={props.visible}
      height={props.scroll ? 500 : "auto"}
      // animationType='slide'
      onBackdropPress={() => props.updateVisible()}
      overlayStyle={{ borderRadius: 20, paddingBottom: 30, marginVertical: 20 }}
    >
      <ScrollView>
        {!!props.title && (
          <ListItem
            title={props.title}
            titleStyle={{
              ...styles.title,
              fontFamily: theme.font.medium,
              color: theme.colorGrey
            }}
            onPress={() => {}}
            disabled
            // topDivider
            // bottomDivider
          />
        )}
        {options}
      </ScrollView>
      <Button
        title="Ok"
        onPress={() => props.updateVisible()}
        ViewComponent={LinearGradient}
        containerStyle={{ marginTop: theme.size(10) }}
      />
    </Overlay>
  );
  // }
}
