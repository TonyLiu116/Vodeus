import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from "react-native-progress";
import { windowWidth } from "../../config/config";

export const MyButton = ({
  label,
  onPress,
  marginTop = 20,
  marginBottom = 0,
  width = windowWidth - 32,
  loading = false,
  marginHorizontal = 0,
  active = true,
}) => {
  return (
    <View style={{
      marginTop,
      marginBottom,
      width: width,
      borderRadius: 16,
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
              height: 60,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row'
            }
          }
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          colors={active ? ['#D89DF4', '#B35CF8', '#8229F4'] : ['#FBF2FF', '#F7E5FF', '#E5D1FF']}
        >
          {!loading ? (
            <Text
              style={
                {
                  color: active ? '#FFF' : 'rgba(54, 18, 82, 0.3)',
                  fontFamily: "SFProDisplay-Semibold",
                  fontSize: 17
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
