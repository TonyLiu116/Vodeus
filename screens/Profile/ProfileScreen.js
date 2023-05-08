import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native';

import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';
import settingWhiteSvg from '../../assets/Feed/setting_white.svg';
import { Avatars, Scores, calcLevel, windowWidth } from '../../config/config';
import '../../language/i18n';
import * as Progress from "react-native-progress";
import VoiceService from '../../services/VoiceService';
import { BottomButtons } from '../component/BottomButtons';
import { DescriptionText } from '../component/DescriptionText';
import { FollowUsers } from '../component/FollowUsers';
import { LevelStatus } from '../component/LevelStatus';
import { SemiBoldText } from '../component/SemiBoldText';
import { ShareQRcode } from '../component/ShareQRcode';
import { ShowLikesCount } from '../component/ShowLikesCount';
import { Stories } from '../component/Stories';
import { TitleText } from '../component/TitleText';

const ProfileScreen = (props) => {

  let { user, refreshState } = useSelector((state) => {
    return (
      state.user
    )
  });

  const { t, i18n } = useTranslation();

  let userData = { ...user };
  const [voices, setVoices] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadMore, setLoadMore] = useState(10);
  const [showEnd, setShowEnd] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const [allFollows, setAllFollows] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showLikesCount, setShowLikesCount] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLevel, setShowLevel] = useState(false);

  const mounted = useRef(false);

  if (props.navigation.state.params)
    () => setRefresh(!refresh);

  const onRefresh = () => {
    setRefreshing(true);
    setLoadKey(loadKey - 1);
    setTimeout(() => {
      if (mounted.current)
        setRefreshing(false)
    }, 1000);
  };

  const getUserVoices = () => {
    if (loadMore < 10) {
      onShowEnd();
      return;
    }

    VoiceService.getUserVoice(userData.id, voices.length).then(async res => {
      if (res.respInfo.status === 200 && mounted.current) {
        const jsonRes = await res.json();
        if (jsonRes.length > 0)
          setVoices(voices.length == 0 ? jsonRes : [...voices, ...jsonRes]);
        setLoadMore(jsonRes.length);
      }
    })
      .catch(err => {
        console.log(err);
      });
  }
  const getUserInfo = () => {
    VoiceService.getProfile(userData.id).then(async res => {
      if (res.respInfo.status == 200 && mounted.current) {
        const jsonRes = await res.json();
        setUserInfo(jsonRes);
      }
    })
      .catch(err => {
        console.log(err);
      });
  }

  const renderName = (fname, lname) => {
    let fullname = '';
    if (fname)
      fullname = fname;
    if (lname) {
      if (fname) fullname += ' ';
      fullname += lname;
    }
    return fullname
  }
  const setLiked = () => {
    let tp = voices;
    let item = tp[selectedIndex].isLike;
    if (item)
      tp[selectedIndex].likesCount--;
    else
      tp[selectedIndex].likesCount++;
    tp[selectedIndex].isLike = !tp[selectedIndex].isLike;
    setVoices(tp);
  }

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 10;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  }

  const onShowEnd = () => {
    if (showEnd) return;
    setShowEnd(true);
    setTimeout(() => {
      if (mounted.current)
        setShowEnd(false);
    }, 2000);
  }

  const onLimit = (v) => {
    return ((v).length > 8) ?
      (((v).substring(0, 5)) + '...') :
      v;
  }

  const renderFullName = (v) => {
    let firstName = v.split(' ')[0];
    let lastName = v.split(' ')[1];
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    lastName = lastName ? (lastName.charAt(0).toUpperCase() + lastName.slice(1)) : '';
    return '@' + firstName + ' ' + lastName;
  }

  useEffect(() => {
    mounted.current = true;
    getUserVoices();
    getUserInfo();
    return () => {
      mounted.current = false;
    }
  }, [refreshState])
  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <ImageBackground
        source={require('../../assets/Feed/head_back.png')}
        style={{
          width: windowWidth,
          height: windowWidth * 83 / 371,
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          paddingBottom: 20,
          paddingHorizontal: 25
        }}
        imageStyle={{
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20
        }}
      >
        <TouchableOpacity
          onPress={() => props.navigation.navigate('Setting')}
        >
          <LinearGradient
            style={{
              height: 34.42,
              width: 34.42,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            locations={[0, 1]}
            colors={['#8274CF', '#2C235C']}
          >
            <SvgXml
              xml={settingWhiteSvg}
            />
          </LinearGradient>
        </TouchableOpacity>
      </ImageBackground>
      {userInfo.user && <View style={{
        width: windowWidth,
        alignItems: 'center',
        marginTop: -28,
        marginBottom: 10
      }}>
        <Image
          source={userInfo.user.avatar ? { uri: userInfo.user.avatar.url } : Avatars[userInfo.user.avatarNumber].uri}
          resizeMode="cover"
          style={{
            width: 105,
            height: 105,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: '#FFF',
            backgroundColor: '#D9D9D9'
          }}
        />
        <SemiBoldText
          text={userInfo.user.firstname}
          fontSize={15}
          lineHeight={24}
          marginTop={8}
          color='#361252'
        />
        <SemiBoldText
          text={'@' + userInfo.user.name}
          fontSize={13}
          lineHeight={24}
          color='#F57047'
        />
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          width: windowWidth,
          marginTop: 24
        }}>
          <View style={{
            alignItems: 'center'
          }}>
            <SemiBoldText
              text={userInfo.voices?.count}
              fontSize={20}
              lineHeight={28}
              color='#361252'
            />
            <DescriptionText
              text={t('Posts')}
              fontSize={16}
              lineHeight={22}
              color='#89759B'
            />
          </View>
          <TouchableOpacity style={{
            alignItems: 'center',
          }}
            onPress={() => setAllFollows("Followers")}
          >
            <SemiBoldText
              text={userInfo.followers?.count}
              fontSize={20}
              lineHeight={28}
              color='#361252'
            />
            <DescriptionText
              text={t('Followers')}
              fontSize={16}
              lineHeight={22}
              color='#89759B'
            />
          </TouchableOpacity>
          <TouchableOpacity style={{
            alignItems: 'center'
          }}
            onPress={() => setShowLikesCount(true)}
          >
            <SemiBoldText
              text={userInfo.likes}
              fontSize={20}
              lineHeight={28}
              color='#361252'
            />
            <DescriptionText
              text={t('Likes')}
              fontSize={16}
              lineHeight={22}
              color='#89759B'
            />
          </TouchableOpacity>
          <TouchableOpacity style={{
            alignItems: 'center'
          }}
            onPress={()=> setShowLevel(true)}
          >
            <ImageBackground
              source={Scores[calcLevel(user.score)].uri}
              style={{
                width: 36,
                height: 36,
              }}
            >
              <Progress.Circle
                progress={user.score / Scores[calcLevel(user.score)].targetScore}
                size={36}
                thickness={1.5}
                borderWidth={0}
                color='#ED532E'
              />
            </ImageBackground>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 3.64
            }}>
              <TitleText
                text={'x' + user.score + '/'}
                fontSize={11}
                lineHeight={15}
                color='#000'
              />
              <TitleText
                text={Scores[calcLevel(user.score)].targetScore}
                fontSize={11}
                lineHeight={15}
                color='rgba(0,0,0,0.5)'
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>}
      <ScrollView
        style={{ marginBottom: Platform.OS == 'ios' ? 82 : 92, marginTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            setLoadKey(loadKey + 1);
          }
        }}
        scrollEventThrottle={400}
      >
        <Stories
          props={props}
          loadKey={loadKey}
          screenName="Profile"
          userId={user.id}
        />
      </ScrollView>
      <BottomButtons
        active='profile'
        props={props}
      />
      {showLevel && <LevelStatus
        props={props}
        userInfo={user}
        onCloseModal={() => setShowLevel(false)}
      />}
      {showQR && <ShareQRcode
        userInfo={user}
        onCloseModal={() => setShowQR(false)}
      />}
      {allFollows != '' &&
        <FollowUsers
          props={props}
          userId={user.id}
          followType={allFollows}
          onCloseModal={() => setAllFollows('')}
        />
      }
      {showLikesCount &&
        <ShowLikesCount
          userInfo={userInfo}
          onCloseModal={() => setShowLikesCount(false)}
        />
      }
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;