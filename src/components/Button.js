import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native';
// import { colors } from '../configs'

const Button = props => {
  const {
    title,
    onPress,
    style = {},
    textStyle = {},
    loading,
    loadingColor,
  } = props;
  return (
    <>
      {!loading ? (
        <TouchableOpacity
        
          onPress={() => {
            onPress();
          }}
          style={[styles.button, style]}>
        
          
            <Text numberOfLines={1} style={[styles.title, textStyle]}>
              {title}
            </Text>
         
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => {
            onPress();
          }}
          style={[styles.button, style]}>
          {loadingColor ? (
            <ActivityIndicator color={loadingColor} />
          ) : (
            <ActivityIndicator color="white" />
          )}
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: colors.purpleDark
  },
  title: {
    color: 'black',
    fontSize: 16,
    alignSelf: 'center',
    // paddingHorizontal: 20,
    paddingBottom: 4,
  },
});

export default Button;
