import React from "react";
import { View, Pressable } from "react-native";
import { TitleText } from "./TitleText";
import { SvgXml } from 'react-native-svg';
import checkSvg from '../../assets/login/check.svg';

export const MyIdentify = ({
  label,
  marginTop = 20,
  active = true,
  genderSvg,
  onPress
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: "center",
          marginTop,
          borderWidth: active ? 1 : 0,
          borderColor: '#8327D8',
          backgroundColor: active ? '#F8F0FF' : '#FFF',
          borderRadius: 16,
          height: 60,
          paddingHorizontal: 16,
          paddingRight: 25,
          shadowColor: 'rgba(42, 10, 111, 1)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 10
        }
      }
    >
      <View style={
        {
          flexDirection: "row",
          alignItems: 'center'
        }
      }>
        <View
          style={{
            borderWidth: 2,
            borderRadius: 30,
            backgroundColor: active ? '#F6EFFF' : '#FFF',
            borderColor: active ? '#CC9BF9' : '#F2F0F5',
            width: 28,
            height: 28
          }}
        >
          {
            !active ||
            <SvgXml
              width="24"
              height="24"
              xml={checkSvg}
            />
          }
        </View>
        <TitleText
          text={label}
          fontSize={17}
          marginLeft={16}
        />
      </View>
      <SvgXml
        width="24"
        height="24"
        xml={genderSvg}
      />
    </Pressable>
  );
};
