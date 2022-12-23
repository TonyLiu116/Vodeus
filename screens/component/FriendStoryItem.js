import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Vibration,
  Animated,
  Pressable
} from 'react-native';
import { useTranslation } from 'react-i18next';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { SvgXml } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

import '../../language/i18n';
import VoiceService from '../../services/VoiceService';
import { Avatars, windowHeight, windowWidth } from '../../config/config';
import { SemiBoldText } from './SemiBoldText';
import { HeartIcon } from './HeartIcon';
import { DescriptionText } from './DescriptionText';
import { StoryLikes } from './StoryLikes';
import { StoryScreens } from './StoryScreens';
import VoicePlayer from '../Home/VoicePlayer';
import { PostContext } from './PostContext';

import notifySvg from '../../assets/common/whitenotify.svg';
import notificationDisableSvg from '../../assets/record/disable_notification.svg';
import prevSvg from '../../assets/common/prev.svg';
import nextSvg from '../../assets/common/next.svg';
import playSvg from '../../assets/common/play2.svg';
import playgraySvg from '../../assets/common/play2gray.svg';
import greyWaveSvg from '../../assets/record/grey-wave.svg';
import whiteWaveSvg from '../../assets/record/white-wave.svg';
import pauseSvg2 from '../../assets/common/pause2.svg';
import { useSelector } from 'react-redux';

export const FriendStoryItem = ({
  props,
  info,
  itemIndex,
  height,
  storyLength,
  onMoveNext = () => {},
  onChangeLike = () => {},
  onChangePrevDay = () => {},
  onChangeNextDay = () => {}
}) => {
  const { t, i18n } = useTranslation();
  const { visibleOne } = useSelector((state) => state.user);
  const counter = useRef(new Animated.Value(0)).current;
  const counterValue = useRef(0);

  const [showAudio, setShowAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [allLikes, setAllLikes] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [lastTap, setLastTap] = useState(0);
  const [delayTime, setDelayTime] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showContext, setShowContext] = useState(false);
  const voiceTitle = info.title;
  const DOUBLE_PRESS_DELAY = 400;
  const minSwipeDistance = 50;

  // useEffect(() => {
  //   if (itemIndex === visibleOne) {
  //     onSetIsPlaying(true);
  //     setIsPlaying(true);
  //     setIsPlayed(true);
  //   } else {
  //     setIsPlaying(false);
  //     onSetIsPlaying(false);
  //   }
  // }, [visibleOne]);

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

  const onSetIsPlaying = (isPlay) => {
    if (isPlay) {
      onStartProgress(speed);
    } else {
      counter.stopAnimation();
    }
  }

  const onStartProgress = (v) => {
    let tp = counterValue.current;
    Animated.timing(counter, {
      toValue: 100,
      duration: info.duration * 10 * (100 - tp) / v,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        onSetIsPlaying(false);
        setIsPlaying(false);
        setIsPlayed(true);
        counter.setValue(0);
      }
    });
  }

  const togglePlay = () => {
    onSetIsPlaying(!isPlaying);
    setIsPlaying(!isPlaying);
    setIsPlayed(false);
  }

  const onPlayStory = () => {
    setIsPlayed(true);
    setIsPlaying(true);
    onSetIsPlaying(true);
  }

  const stopPlay = () => {
    setIsPlayed(false);
    setIsPlaying(false);
    onSetIsPlaying(false);
  }

  const onPrevStory = () => {
    onMoveNext(itemIndex - 1 >= 0 ? itemIndex - 1 : 0);
    stopPlay();
  }

  const onNextStory = () => {
    onMoveNext(itemIndex + 1 >= storyLength ? storyLength - 1 : itemIndex + 1);
    stopPlay();
  }

  const onSetSpeed = () => {
    let v = 1;
    if (speed < 2)
      v = speed + 0.5;
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
        // props.navigation.navigate('VoiceProfile', { id: info.id });
      }, DOUBLE_PRESS_DELAY));
    }
  };
  
  const onTouchStart = (e) => {
    if (!showChat) {
      setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
      setTouchStart(e.nativeEvent.locationY);
    }
  }
  
  const onTouchMove = (e) => setTouchEnd(e.nativeEvent.locationY)
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    if (!showChat) {
      const distance = touchStart - touchEnd
      const isLeftSwipe = distance > minSwipeDistance
      const isRightSwipe = distance < -minSwipeDistance
      
      if (isLeftSwipe || isRightSwipe) {
        if (!isLeftSwipe && itemIndex == 0) {
          onChangePrevDay()
        } else if(isLeftSwipe && itemIndex == storyLength - 1) {
          onChangeNextDay();
        }
        console.log(isLeftSwipe ? 'Top' : 'Down');
      }
    }
  }

  return (
    <View style={{ width: windowWidth, height: height, flexDirection: "column", alignItems: "center" }} onTouchStart={(e) => onTouchStart(e)} onTouchEnd={onTouchEnd} onTouchMove={(e) => onTouchMove(e)}>
      <TouchableOpacity onPress={() => onClickDouble()} onLongPress={() => setShowContext(true)}>
        <ImageBackground
          source={info.imgFile ? { uri: info.imgFile.url } : info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri}
          style={{
            flexDirection: "column",
            justifyContent: "flex-end",
            width: windowWidth / 376 * 324,
            height: height / 546 * 413,
            borderRadius: 10,
          }}
          imageStyle={{
            borderRadius: 10
          }}
          blurRadius={(info.notSafe && isPlayed == false ) ? 20 : 0}
        >
          {(!info.notSafe || isPlayed == true) && <LinearGradient
            style={{ 
              flexDirection: "column",
              justifyContent: "flex-end",
              width: "100%",
              height: "50%",
              paddingHorizontal: 13,
              borderRadius: 10,
              paddingBottom: 13
            }}
            colors={[ 'rgba(167, 0, 255, 0)', 'rgba(112, 0, 255, 0.7)' ]}
            start={{ x: 0, y: 0 }}
            end={{ x:0, y: 1 }}
          >
            <View style={{ width: "60%" }}>
              <SemiBoldText
                text={voiceTitle.toUpperCase()}
                fontSize={20}
                lineHeight={23}
                color='#FFFFFF'
                marginLeft={0}
              />
            </View>
            <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={() => { info.isMine ? props.navigation.navigate('Profile') : props.navigation.navigate('UserProfile', { userId: info.user.id }); }}><Text style={{ fontWeight: "400", fontSize: 16, lineHeight: 19, color: "#FFFFFF" }}>{info.user.name}</Text></TouchableOpacity>
                {info.address != 'null' && info.address && 
                  <Text style={{ fontWeight: "400", fontSize: 16, lineHeight: 19, color: "#FFFFFF" }}> - {info.address}</Text>
                }
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF"
                }}>
                  <Text style={{ fontWeight: "400", fontSize: 13, lineHeight: 16, color: "#DD3FEE" }}>{info.category == "" ? "All" : info.category}</Text>
                </View>
                <View style={{
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: "#FFFFFF",
                  marginLeft: 4
                }}>
                  <Text style={{ fontWeight: "400", fontSize: 13, lineHeight: 16, color: "#DD3FEE" }}>{t(info.user.language)}</Text>
                </View>
              </View>
            </View>
            <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <HeartIcon
                  isLike={info.isLike}
                  height={25}
                  OnSetLike={() => OnSetLike()}
                  marginLeft={0}
                  borderColor={"#FFFFFF"}
                />
                <TouchableOpacity onPress={() => setAllLikes(true)}>
                  <DescriptionText
                    text={ info.likesCount }
                    fontSize={18}
                    lineHeight={23}
                    color="#FFFFFF"
                    marginLeft={4}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", marginLeft: 16 }} onPress={() => setShowChat(true)}>
                <SvgXml
                  width={25}
                  height={25}
                  xml={notifySvg}
                />
                <DescriptionText
                  text={ info.answersCount }
                  fontSize={18}
                  lineHeight={23}
                  color="#FFFFFF"
                  marginLeft={4}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient> }
          {
            (info.notSafe && isPlayed == false) && <View style={{
              width: "100%",
              height: "100%",
              borderRadius: 12,
              backgroundColor: 'rgba(203, 203, 203, 0.54)',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingHorizontal: 14
            }}>
              <View></View>
              <View style={{ 
                alignItems: "center"
              }}>
                <SvgXml
                  xml={notificationDisableSvg}
                  width={32}
                  height={32}
                />
                <SemiBoldText
                  text={t("Sensitive content")}
                  fontSize={15}
                  lineHeight={18}
                  color="#000"
                  marginTop={15}
                />
                <DescriptionText
                  text={t("This audio may not be appropriated")}
                  fontSize={11}
                  lineHeight={13}
                  color="#000"
                  marginTop={18}
                />
              </View>
              <View style={{
                width: '100%',
                alignItems: 'center',
                paddingTop: 22,
                borderTopColor: "#1F1F1F",
                borderTopWidth: 1
              }}>
                <TouchableOpacity
                  onPress={onPlayStory}
                >
                  <SemiBoldText
                    text={t("Play story")}
                    fontSize={14}
                    lineHeight={18}
                    color="#000"
                    marginTop={0}
                    marginBottom={16}
                  />
                </TouchableOpacity>
              </View>
            </View>
          }
        </ImageBackground>
      </TouchableOpacity>
      <View style={{ width: windowWidth, height: 1, backgroundColor: "#EEEEEE", marginTop: windowHeight / 814 * 15 }}></View>
      <View style={{ width: windowWidth / 376 * 290, marginTop: windowHeight / 814 * 15 }}>
        <View style={{ width: "100%", borderRadius: 5, height: 6, backgroundColor: "#000", flexDirection: "row" }}>
          <Animated.View style={{
            backgroundColor: "#8E35F6",
            borderRadius: 5,
            height: 6,
            width: progressWidth,
          }} />
          <View style={{ width: 12, height: 12, backgroundColor: "#8E35F6", borderRadius: 6, marginTop: -3, marginLeft: -3 }} ></View>
        </View>
        {/* <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
          <Text style={{ fontSize: 12, lineHeight: 13, color: "#1A141F" }}>{counter._value}</Text>
          <Text style={{ fontSize: 12, lineHeight: 13, color: "#1A141F" }}>{new Date(Math.max(info.duration * 1000)).toISOString().substr(14, 5)}</Text>
        </View> */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 5, }}>
          <TouchableOpacity onPress={onPrevStory}>
            <SvgXml
              xml={prevSvg}
              width={18}
              height={18}
            />
          </TouchableOpacity>
          <TouchableOpacity disabled={info.notSafe && !isPlayed} onPress={togglePlay}>
            <SvgXml
              xml={ isPlaying ? pauseSvg2 : info.notSafe ? playgraySvg : playSvg}
              width={44}
              height={44}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onSetSpeed()}
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
                fontSize={11}
                lineHeight={18}
                marginLeft={3}
                color={speed == 2 ? '#F6EFFF' : '#361252'}
              />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNextStory}>
            <SvgXml
              xml={nextSvg}
              width={18}
              height={18}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* <View style={{ width: windowWidth }} >
        <RangeSlider from={0} to={100} token="s" onValueChanged={(newLow, newHigh, token) => {}} />
      </View> */}
      {/* <View style={{ width: windowWidth }}> 
      <FriendPlayer
        voiceUrl={info.file.url}
        playBtn={true}
        waveColor={info.user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
        playing={false}
        startPlay={() => { VoiceService.listenStory(info.id, 'record') }}
        stopPlay={() => {setIsPlaying(false); setIsPlayed(false); onSetIsPlaying(false)}}
        tinWidth={ windowWidth / 376 * 275 / 150}
        mrg={windowWidth / 530}
        duration={info.duration * 1000}
        speed={speed}
      />
      </View> */}
      { isPlaying && <View style={{ width: 1, opacity: 0 }}>
        <VoicePlayer
          voiceUrl={info.file.url}
          playBtn={false}
          waveColor={info.user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
          playing={true}
          startPlay={() => { VoiceService.listenStory(info.id, 'record') }}
          stopPlay={stopPlay}
          tinWidth={ windowWidth / 376 * 275 / 150}
          mrg={windowWidth / 530}
          duration={info.duration * 1000}
          playSpeed={speed}
          height={0}
          control={true}
        />
      </View>}
      { allLikes && 
        <StoryLikes
          props={props}
          storyId={info.id}
          storyType="record"
          onCloseModal={() => setAllLikes(false)}
        />
      }
      {
        showChat &&
        <StoryScreens
          props={props}
          info={info}
          onCloseModal={() => setShowChat(false)}
        />
      }
      {
        showContext && 
        <PostContext
          postInfo={info}
          props={props}
          onCloseModal={() => setShowContext(false)}
        />
      }
    </View>
  )
};