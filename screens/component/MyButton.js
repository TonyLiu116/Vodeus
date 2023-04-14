import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from "react-native-progress";
import { windowWidth } from "../../config/config";

export const MyButton = ({
  label,
  onPress,
  marginTop = 20,
  height = 56,
  fontSize = 17,
  marginBottom = 0,
  width = windowWidth - 60,
  loading = false,
  marginHorizontal = 0,
  borderRadius = 30,
  active = true,
}) => {
  return (
    <View style={{
      marginTop,
      marginBottom,
      width: width,
      borderRadius: borderRadius,
      shadowColor: '#8327D8',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      marginHorizontal: marginHorizontal,
      elevation: active ? 20 : 0,
      zIndex: 10,
    }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={!active || loading}
      >
        <LinearGradient
          style={
            {
              height: height,
              borderRadius: borderRadius,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row'
            }
          }
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          colors={active ? ['#6051AD', '#423582'] : ['#042120', '#021412']}
        >
          {!loading ? (
            <Text
              style={
                {
                  color: active ? '#FFF' : 'rgba(54, 18, 82, 0.3)',
                  fontFamily: "SFProDisplay-Semibold",
                  fontSize: fontSize
                }
              }
            >
              {label}
            </Text>
          ) : (
            <Progress.Circle
              indeterminate
              size={30}
              color="rgba(255, 255, 255, .7)"
              style={{ alignSelf: "center" }}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
