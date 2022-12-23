import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Vibration, Image, Platform } from "react-native";
import { NavigationActions, StackActions } from 'react-navigation';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { SvgXml } from 'react-native-svg';
//Bottom Icons
import homeSvg from '../../assets/common/bottomIcons/home.svg';
import homeActiveSvg from '../../assets/common/bottomIcons/homeActive.svg';
import chatSvg from '../../assets/common/bottomIcons/chat.svg';
import chatActiveSvg from '../../assets/common/bottomIcons/chatActive.svg';
import friendSvg from '../../assets/common/bottomIcons/friend.svg';
import friendActiveSvg from '../../assets/common/bottomIcons/friendActive.svg';
import { useSelector } from "react-redux";
import { Avatars } from "../../config/config";
import { DescriptionText } from "./DescriptionText";

export const BottomButtons = ({
  active = 'home',
  props,
}) => {

  let { user, messageCount } = useSelector((state) => {
    return (
      state.user
    )
  });

  const onNavigate = (des, par = null) => {
    const resetActionTrue = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: des, params: par })],
    });
    props.navigation.dispatch(resetActionTrue);
  }

  useEffect(() => {
  }, [])

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: 27,
        paddingBottom: 30,
        height: 90,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 1)',
        elevation: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        backgroundColor: '#FFFFFF'
      }}
    >
      <TouchableOpacity
        onPress={() => onNavigate('Home')}
      >
        <SvgXml
          width={30}
          height={30}
          xml={active == 'home' ? homeActiveSvg : homeSvg}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onNavigate('Friends')}
      >
        <SvgXml
          width={30}
          height={30}
          xml={active == 'friends' ? friendActiveSvg : friendSvg}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
          props.navigation.navigate("HoldRecord");
        }}
        style={{ width: 54, height: 54 }}
      >
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.navigation.navigate("Chat")}
      >
        <SvgXml
          width={30}
          height={30}
          xml={active == 'chat' ? chatActiveSvg : chatSvg}
        />
        {messageCount>0&&<View style={{position:'absolute',right:-4,top:-4, alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 8, backgroundColor: '#D82783' }}>
          <DescriptionText
            text={messageCount}
            color='#FFF'
            lineHeight={17}
            fontSize={10}
          />
        </View>}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.navigation.navigate("Profile")}
      >
        <Image
          source={user.avatar ? { uri: user.avatar.url } : Avatars[user.avatarNumber].uri}
          style={{ width: 30, height: 30, borderRadius: 15 }}
          resizeMode='cover'
        />
      </TouchableOpacity>
    </View>
  );
};
