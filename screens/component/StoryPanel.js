import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Vibration,
  ImageBackground,
  Animated,
  Platform,
  Text
} from "react-native";

import { composeInitialProps, useTranslation } from 'react-i18next';
import '../../language/i18n';
import { TitleText } from "./TitleText";
import { HeartIcon } from './HeartIcon';
import { DescriptionText } from "./DescriptionText";
import add_Svg from '../../assets/common/add.svg';
import addYellow_Svg from '../../assets/common/add_yellow.svg';
import addSuccess_Svg from '../../assets/common/add_success.svg';
import pauseSvg2 from '../../assets/common/pause2.svg';
import playSvg from '../../assets/common/play.svg';
import greyWaveSvg from '../../assets/record/grey-wave.svg';
import whiteWaveSvg from '../../assets/record/white-wave.svg';
import { useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import notifySvg from '../../assets/common/notify.svg';
import yellow_starSvg from '../../assets/common/yellow_star.svg';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import VoiceService from '../../services/VoiceService';
import VoicePlayer from '../Home/VoicePlayer';
import { Avatars, Categories, windowWidth } from '../../config/config';
import notificationDisableSvg from '../../assets/record/disable_notification.svg';
import { SemiBoldText } from './SemiBoldText';
import { StoryScreens } from './StoryScreens';
import LinearGradient from 'react-native-linear-gradient';
import { LinearTextGradient } from 'react-native-text-gradient';
import { StoryLikes } from './StoryLikes';
import { PostContext } from './PostContext';

export const StoryPanel = ({
  props,
  info,
  isRefresh = false,
  panelWidth = (windowWidth - 36) / 2,
  itemIndex,
  onChangeLike = () => { },
}) => {

  const [showChat, setShowChat] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [delayTime, setDelayTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFriend, setIsFriend] = useState(info.isFriend);
  const [playStatus, setIsPlayStatus] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const [allLikes, setAllLikes] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [speed, setSpeed] = useState(1);

  const { t, i18n } = useTranslation();

  const counter = useRef(new Animated.Value(0)).current;
  const counterValue = useRef(0);
  const mounted = useRef(false);

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  let num = Math.ceil((new Date().getTime() - new Date(info.createdAt).getTime()) / 60000);
  let minute = num % 60;
  num = (num - minute) / 60;
  let hour = num % 24;
  let day = (num - hour) / 24
  let time = (day > 0 ? (day.toString() + ' ' + t("d")) : (hour > 0 ? (hour.toString() + ' ' + t("h")) : (minute > 0 ? (minute.toString() + ' ' + t("m")) : '')));

  const DOUBLE_PRESS_DELAY = 400;

  if (isRefresh != refresh) {
    setRefresh(isRefresh);
  }

  const getCategoryUrl = (cate) => {
    let res = Categories.filter((item) => {
      return item.label === cate;
    });
    return res[0].uri;
  }

  const OnSetLike = () => {
    Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    if (info.isLike == true) {
      VoiceService.recordUnAppreciate(info.id);
    }
    else {
      VoiceService.recordAppreciate({ count: 1, id: info.id });
    }
    onChangeLike(!info.isLike);
  }

  const onSendRequest = () => {
    if (isFriend) {
      setIsLoading(true);
      VoiceService.unfollowFriend(info.user.id).then(res => {
        if (res.respInfo.status == 200 || res.respInfo.status == 201) {
          setIsFriend(false);
        }
        setIsLoading(false);
      });
      Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    } else {
      setIsLoading(true);
      VoiceService.followFriend(info.user.id).then(async res => {
        const jsonRes = await res.json();
        if (res.respInfo.status == 200 || res.respInfo.status == 201) {
          setIsFriend(jsonRes.status == 'accepted');
        }
        setIsLoading(false);
      });
      Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    }
  }

  const onSetIsPlaying = (v) => {
    counter.setValue(0);
    counter.stopAnimation(res => {
    })
    if (v == true) {
      onStartProgress(speed);
    }
  }

  const onStartProgress = (v) => {
    let tp = counterValue.current;
    Animated.timing(counter, {
      toValue: 100,
      duration: info.duration * 10 * (100 - tp) / v,
      useNativeDriver: false,
    }).start();
  };

  const onSetSpeed = () => {
    let v = 1;
    if (speed < 2)
      v = speed + 0.5;
    onStartProgress(v);
    setSpeed(v);
  }

  const progressWidth = counter.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp"
  })

  const onClickDouble = () => {
    if (info.notSafe && isPlayed == false)
      return;
    const timeNow = Date.now();
    if (lastTap && timeNow - lastTap < DOUBLE_PRESS_DELAY) {
      clearTimeout(delayTime);
      OnSetLike();
    } else {
      setLastTap(timeNow);
      setDelayTime(setTimeout(() => {
        props.navigation.navigate('VoiceProfile', { id: info.id });
      }, DOUBLE_PRESS_DELAY));
    }
  };

  useEffect(() => {
    mounted.current = true;
    counter.addListener(v => {
      counterValue.current = v.value;
      if (v.value == 100) {
        setIsPlayStatus(false);
        onSetIsPlaying(false);
      }
    })
    return () => {
      counter.removeAllListeners();
      mounted.current = false;
    }
  })

  return (
    <>
      {info.isPopUp == true ? <View
        style={{
          width: panelWidth,
          marginTop: (itemIndex % 2 > 0) ? 21 : 6,
          marginLeft: (itemIndex % 2 > 0) ? 11 : 0,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <View onPress={() => onSendRequest()}>
            <Image source={user.avatar ? { uri: user.avatar.url } : Avatars[user.avatarNumber].uri} style={{ width: 25, height: 25, borderRadius: 13, borderColor: '#FFA002', borderWidth: user.premium == 'none' ? 0 : 1 }} />
          </View>
          <View
            style={{
              marginLeft: 8,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: "center"
              }}
            >
              <TitleText
                text={t("You")}
                fontSize={12}
                lineHeight={14}
              />
              {user.premium != 'none' &&
                <SvgXml
                  width={18}
                  height={18}
                  xml={yellow_starSvg}
                />}
            </View>
            <SemiBoldText
              text={'Somewhere in the world'}
              color='#565656'
              fontSize={10}
              lineHeight={12}
            />
          </View>
        </View>
        <ImageBackground
          source={require('../../assets/record/advertise.png')}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: 260,
            marginTop: 7,
          }}
          imageStyle={{
            borderRadius: 12,
          }}
        >
          <Image
            source={require('../../assets/record/tag-friends.png')}
            style={{
              width: 54,
              height: 54,
            }}
          />
          <SemiBoldText
            text={t("We all have something to share about yesterday, today, or tomorrow.")}
            fontSize={11}
            lineHeight={13}
            maxWidth={150}
            textAlign={'center'}
            marginTop={21}
          />
          <View
            style={{
              flexDirection: 'row',
              marginTop: 16
            }}
          >
            <Image
              source={require('../../assets/record/fun.png')}
              style={{
                width: 24,
                height: 24,
              }}
            />
            <Image
              source={require('../../assets/record/heart.png')}
              style={{
                marginLeft: 7,
                width: 24,
                height: 24,
              }}
            />
            <Image
              source={require('../../assets/record/horror.png')}
              style={{
                marginLeft: 7,
                width: 24,
                height: 24,
              }}
            />
            <Image
              source={require('../../assets/record/monkey.png')}
              style={{
                marginLeft: 7,
                width: 24,
                height: 24,
              }}
            />
            <Image
              source={require('../../assets/record/fire.png')}
              style={{
                marginLeft: 7,
                width: 24,
                height: 24,
              }}
            />
          </View>
          <TouchableOpacity
            style={{
              width: 140,
              height: 40,
              marginTop: 23,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 17,
              backgroundColor: '#FFF',
              shadowColor: 'rgba(115, 13, 244, 0.47)',
              elevation: 10,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5,
              shadowRadius: 24,
            }}
            onPress={() => props.navigation.navigate("HoldRecord")}
          >
            <LinearTextGradient
              style={{ fontSize: 17 }}
              locations={[0, 0.7, 1]}
              colors={["#C479FF", "#8229F4", "#650DD6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <SemiBoldText
                text={"Share a story"}
                fontSize={17}
                lineHeight={17}
              />
            </LinearTextGradient>
          </TouchableOpacity>
        </ImageBackground>
      </View> :
        <TouchableOpacity
          style={{
            width: panelWidth,
            marginTop: (itemIndex % 2 > 0) ? 21 : 6,
            marginLeft: (itemIndex % 2 > 0) ? 11 : 0,
          }}
          onPress={() => onClickDouble()}
          onLongPress={() => setShowContext(true)}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <TouchableOpacity disabled={isLoading || info.user.id == user.id} style={{ opacity: isLoading ? 0.5 : 1 }} onPress={() => onSendRequest()}>
              <Image source={info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri} style={{ width: 36, height: 36, borderRadius: 15, borderColor: '#FFA002', borderWidth: info.user.premium == 'none' ? 0 : 1 }} />
              {info.user.id != user.id && <View style={{
                position: "absolute",
                bottom: -6,
                left: 10
              }}>
                <SvgXml
                  width={18}
                  height={18}
                  xml={!isFriend ? info.user.premium != "none" ? addYellow_Svg : add_Svg : addSuccess_Svg}
                />
              </View>}
            </TouchableOpacity>
            <View
              style={{
                marginLeft: 8,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: "center"
                }}
              >
                <TitleText
                  text={info.user.name}
                  fontSize={14}
                  lineHeight={18}
                />
                {info.user.premium != 'none' &&
                  <SvgXml
                    width={18}
                    height={18}
                    xml={yellow_starSvg}
                  />}
              </View>
              <SemiBoldText
                text={(info.address ? (info.address + ', ') : '') + time + ', ' + info.listenCount + " " + t("Play") + (info.listenCount > 1 ? 's' : '')}
                color='#565656'
                fontSize={12}
                lineHeight={14}
              />
            </View>
          </View>
          <ImageBackground
            source={info.imgFile ? { uri: info.imgFile.url } : info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: 255,
              marginTop: 7,
            }}
            imageStyle={{
              borderRadius: 12,
            }}
            blurRadius={(info.notSafe && isPlayed == false) ? 20 : 0}
          >
            {(!info.notSafe || isPlayed == true) && <TouchableOpacity
              onPress={() => {
                setIsPlayStatus(!playStatus);
                onSetIsPlaying(false);
              }}
            >
              <SvgXml
                width={61}
                height={61}
                xml={playStatus ? pauseSvg2 : playSvg}
              />
            </TouchableOpacity>}
            {playStatus && <View
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                height: 10,
                backgroundColor: '#FFF',
                shadowColor: 'rgba(88, 74, 117, 1)',
                elevation: 10,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
              }}
            >
              <Animated.View style={{
                backgroundColor: '#8E35F6',
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                width: progressWidth,
                height: 10,
              }} />
            </View>}
            {(!info.notSafe || isPlayed == true) && <View
              style={{
                position: 'absolute',
                bottom: 12,
                width: '100%',
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  width: 171,
                  height: 35,
                  borderRadius: 20,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SemiBoldText
                  text={info.title.toUpperCase()}
                  fontSize={12}
                  lineHeight={18}
                  color="#FFF"
                />
              </View>
            </View>}
            {(info.notSafe && isPlayed == false) && <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(203, 203, 203, 0.54)',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: 10,
              }}
            >
              <View></View>
              <View style={{
                alignItems: 'center'
              }}>
                <SvgXml
                  xml={notificationDisableSvg}
                  width={29}
                  height={29}
                />
                <SemiBoldText
                  text={t("Sensitive content")}
                  fontSize={11}
                  lineHeight={13}
                  color="#000"
                  marginTop={8}
                />
                <DescriptionText
                  text={t("This audio may not be appropriated")}
                  fontSize={9}
                  color="#000"
                  marginTop={13}
                />
              </View>
              <View style={{
                width: '100%',
                alignItems: 'center'
              }}>
                <TouchableOpacity
                  onPress={() => { setIsPlayStatus(true); setIsPlayed(true); }}
                >
                  <SemiBoldText
                    text={t("Play story")}
                    fontSize={14}
                    lineHeight={16}
                    color="#000"
                    marginTop={12}
                    marginBottom={16}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: 1,
                  backgroundColor: '#1F1F1F',
                  bottom: 51
                }}
              >
              </View>
            </View>}
            <View
              style={{
                position: 'absolute',
                bottom: 38,
                width: '100%',
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  width: 33,
                  height: 27,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#8229F4',
                  backgroundColor: '#FFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: 'rgba(88, 74, 117, 1)',
                  elevation: 10,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                }}
              >
                <Image
                  source={getCategoryUrl(info.category)}
                  style={{
                    width: 16,
                    height: 16,
                  }}
                />
              </View>
            </View>
          </ImageBackground>
          <View
            style={{
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <HeartIcon
              isLike={info.isLike}
              height={24}
              OnSetLike={() => OnSetLike()}
              marginLeft={10}
            />
            <TouchableOpacity onPress={() => setAllLikes(true)}>
              <DescriptionText
                text={info.likesCount}
                fontSize={13}
                lineHeight={18}
                color="rgba(54, 18, 82, 0.8)"
                marginLeft={4}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{
              marginLeft: 16,
              flexDirection: "row",
              alignItems: "center"
            }}
              onPress={() => setShowChat(true)}
            >
              <SvgXml
                width={24}
                height={24}
                xml={notifySvg}
              />
              <DescriptionText
                text={info.answersCount}
                fontSize={13}
                lineHeight={18}
                color="rgba(54, 18, 82, 0.8)"
                marginLeft={4}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onSetSpeed()}
              style={{
                marginLeft: 16,
              }}
            >
              <LinearGradient
                style={
                  {
                    width: 60,
                    height: 30,
                    borderRadius: 14,
                    borderWidth: speed != 2 ? 0.63 : 0,
                    borderColor: '#D4C9DE',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row'
                  }
                }
                start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                colors={speed == 2 ? ['#D89DF4', '#B35CF8', '#8229F4'] : ['#F2F0F5', '#F2F0F5', '#F2F0F5']}
              >
                <SvgXml
                  xml={speed == 2 ? whiteWaveSvg : greyWaveSvg}
                />
                <DescriptionText
                  text={'x' + speed.toString()}
                  fontSize={12}
                  lineHeight={14}
                  marginLeft={5}
                  color={speed == 2 ? '#F6EFFF' : '#361252'}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {
            showChat &&
            <StoryScreens
              props={props}
              info={info}
              onCloseModal={() => setShowChat(false)}
            />
          }
          {allLikes &&
            <StoryLikes
              props={props}
              storyId={info.id}
              storyType="record"
              onCloseModal={() => setAllLikes(false)}
            />}
          {showContext &&
            <PostContext
              postInfo={info}
              props={props}
              onCloseModal={() => setShowContext(false)}
            />
          }
          {playStatus && <View style={{ position: 'absolute', width: 1, opacity: 0 }}>
            <VoicePlayer
              voiceUrl={info.file.url}
              stopPlay={() => { onSetIsPlaying(false); setIsPlayStatus(false) }}
              startPlay={() => { onSetIsPlaying(true); VoiceService.listenStory(info.id, 'record'); }}
              playBtn={false}
              height={0}
              replayBtn={false}
              waveColor={info.user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
              playing={true}
              tinWidth={windowWidth / 1600000}
              mrg={windowWidth / 6000000}
              duration={info.duration * 1000}
              control={true}
              playSpeed={speed}
            />
          </View>}
        </TouchableOpacity>
      }
    </>
  );
};
