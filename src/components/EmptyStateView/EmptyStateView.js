import { fromPairs } from "lodash";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import dynamicStyles from "./styles";
import { styles, theme } from "../../styles";

const EmptyStateView = props => {
  // const styles = dynamicStyles
  const { emptyStateConfig } = props;
  return (
    <View style={[props.style]}>
      <Text
        style={[
          styles.h1,
          {
            fontFamily: theme.font.medium,

            alignSelf: "center",
            // color: color.colorTextDark,
            marginBottom: 15
          }
        ]}
      >
        {emptyStateConfig.title}
      </Text>
      <Text style={[dynamicStyles.description, styles.title]}>
        {emptyStateConfig.description}
      </Text>
      {/* {emptyStateConfig.buttonName && emptyStateConfig.buttonName.length > 0 && (
                <TouchableOpacity
                    onPress={emptyStateConfig.onPress}
                    style={styles.buttonContainer}>
                    <Text style={styles.buttonName}>{emptyStateConfig.buttonName}</Text>
                </TouchableOpacity>
            )} */}
    </View>
  );
};

export default EmptyStateView;
