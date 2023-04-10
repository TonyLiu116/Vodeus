import React, { useEffect, useRef, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { NavigationActions, StackActions } from 'react-navigation';
//Bottom Icons
import { useSelector } from "react-redux";
import { Avatars, calcLevel } from "../../config/config";
import { LevelUp } from "./LevelUp";

export const BottomButtons = ({
  active = 'home',
  props,
}) => {

  let { user, messageCount, requestCount } = useSelector((state) => {
    return (
      state.user
    )
  });

  const [showLevelUp, setShowLevelUp] = useState(false);

  const nowLevel = useRef(calcLevel(user.score));

  const onNavigate = (des, par = null) => {
    const resetActionTrue = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: des, params: par })],
    });
    props.navigation.dispatch(resetActionTrue);
  }

  useEffect(() => {
    let newLevel = calcLevel(user.score);
    if(newLevel > nowLevel.current){
      nowLevel.current = newLevel;
      setShowLevelUp(true);
    }
  }, [user.score])

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: 27,
        paddingBottom: 30,
        height: 80,
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
        <Image
          source={active=='home'?require('../../assets/common/bottomIcons/home_active.png'):require('../../assets/common/bottomIcons/home.png')}
          style={{
            width:24,
            height:24
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onNavigate('Friends')}
      >
        <Image
          source={active=='friends'?require('../../assets/common/bottomIcons/friends_active.png'): require('../../assets/common/bottomIcons/friends.png')}
          style={{
            width:29,
            height:29
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onNavigate('Friends')}
      >
        <Image
          source={ require('../../assets/common/bottomIcons/microphone.png')}
          style={{
            width:29,
            height:29
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onNavigate("Search")}
      >
        <Image
          source={active=='search'?require('../../assets/common/bottomIcons/search_active.png'):require('../../assets/common/bottomIcons/search.png')}
          style={{
            width:29,
            height:29
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onNavigate("Profile")}
      >
        <Image
          source={user.avatar ? { uri: user.avatar.url } : Avatars[user.avatarNumber].uri}
          style={{ width: 30, height: 30, borderRadius: 15 }}
          resizeMode='cover'
        />
      </TouchableOpacity>
      {showLevelUp && <LevelUp
        userInfo={user}
        props={props}
        onCloseModal={() => setShowLevelUp(false)}
      />}
    </View>
  );
};
