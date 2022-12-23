import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

export const MyColorButton = ({
  label,
  onPress,
  marginTop = 20,
  marginBottom,
  color = '#8327D8',
  shadowColor = color,
  active = true,
}) => {
  return (
    <View style={{
      marginTop,
      marginBottom,
      borderRadius: 16,
      shadowColor: shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: active ? 20 : 0,
      zIndex: 10,
    }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={!active}
      >
        <View
          style={
            {
              height: 60,
              borderRadius: 16,
              backgroundColor: color,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row'
            }
          }
        >
          <Text
            style={
              {
                color: '#FFF',
                fontFamily: "SFProDisplay-Semibold",
                fontSize: 17
              }
            }
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
