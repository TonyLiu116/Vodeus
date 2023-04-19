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
import * as Progress from "react-native-progress";
import VoiceService from '../../services/VoiceService';
import { Avatars, calcLevel, Categories, Scores, windowHeight, windowWidth } from '../../config/config';
import { SemiBoldText } from './SemiBoldText';
import { HeartIcon } from './HeartIcon';
import { DescriptionText } from './DescriptionText';
import { StoryLikes } from './StoryLikes';
import { StoryScreens } from './StoryScreens';
import VoicePlayer from '../Home/VoicePlayer';
import { PostContext } from './PostContext';

import notifySvg from '../../assets/common/whitenotify.svg';
import notificationDisableSvg from '../../assets/record/disable_notification.svg';
import followSvg from '../../assets/record/follow.svg';
import triangleSvg from '../../assets/common/green_triangle.svg';
import simplePauseSvg from '../../assets/common/simple_pause_green.svg';
import answerSvg from '../../assets/record/answer.svg';
import checkSvg from '../../assets/profile/check.svg';
import unCheckSvg from '../../assets/profile/unCheck.svg';
import menuSvg from '../../assets/record/menu.svg';
import fakeSvg from '../../assets/record/fake.svg';
import prevSvg from '../../assets/common/prev.svg';
import nextSvg from '../../assets/common/next.svg';
import playSvg from '../../assets/common/play2.svg';
import playgraySvg from '../../assets/common/play2gray.svg';
import greyWaveSvg from '../../assets/record/grey-wave.svg';
import whiteWaveSvg from '../../assets/record/white-wave.svg';
import pauseSvg2 from '../../assets/common/pause2.svg';
import replySvg from '../../assets/Feed/reply.svg';
import supportSvg from '../../assets/Feed/support.svg';
import threeDotsSvg from '../../assets/Feed/grey_three_dots.svg';
import { useSelector } from 'react-redux';
import { styles } from '../style/Common';
import { RemoveConfirm } from './RemoveConfirm';
import { MediumText } from './MediumText';
import { TitleText } from './TitleText';

export const FriendStoryItem = ({
  props,
  info,
  screenName,
  itemIndex,
  storyLength,
  onMoveNext = () => { },
  onChangeLike = () => { },
  onChangePrevDay = () => { },
  onChangeNextDay = () => { }
}) => {

  if (info.text == null)
    info.text = '';

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
  const [currentSec, setCurrentSec] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFriend, setIsFriend] = useState(info.isFriend);
  const [removeModal, setRemoveModal] = useState(false);
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

  let num = Math.ceil((new Date().getTime() - new Date(info.createdAt).getTime()) / 60000);
  let minute = num % 60;
  num = (num - minute) / 60;
  let hour = num % 24;
  let day = (num - hour) / 24
  let time = (day > 0 ? (day.toString() + ' ' + t("day") + (day > 1 ? 's' : '')) : (hour > 0 ? (hour.toString() + ' ' + t("hour") + (hour > 1 ? 's' : '')) : (minute > 0 ? (minute.toString() + ' ' + t("minute") + (minute > 1 ? 's' : '')) : ''))) + ' ' + t('ago');

  let height = 291;

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

  const onStartProgress = (v) => {
    let tp = counterValue.current;
    Animated.timing(counter, {
      toValue: 100,
      duration: info.duration * 10 * (100 - tp) / v,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {

      }
    });
  }

  const onSetIsPlaying = (v) => {
    counter.setValue(0);
    counter.stopAnimation(res => {
    })
    if (v == true) {
      onStartProgress(speed);
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      stopPlay();
    }
    else {
      setIsPlaying(true);
      setIsPlayed(false);
    }
  }

  const onPlayStory = () => {
    setIsPlayed(true);
    setIsPlaying(true);
    //onSetIsPlaying(true);
  }

  const stopPlay = () => {
    setIsPlayed(false);
    setIsPlaying(false);
    //onSetIsPlaying(false);
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
        } else if (isLeftSwipe && itemIndex == storyLength - 1) {
          onChangeNextDay();
        }
        console.log(isLeftSwipe ? 'Top' : 'Down');
      }
    }
  }

  const getCategoryUrl = (cate) => {
    let res = Categories.filter((item) => {
      let tp = item.label;
      if (cate == 'Story')
        cate = 'Stories';
      if (cate == 'Prayer')
        cate = 'Prayers';
      return tp === cate;
    });
    return res[0].uri;
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

  return (
    <View style={{ marginBottom: 30, width: windowWidth, flexDirection: "column", alignItems: "center" }} onTouchStart={(e) => onTouchStart(e)} onTouchEnd={onTouchEnd} onTouchMove={(e) => onTouchMove(e)}>
      {screenName!='Profile'&&screenName!='userProfile'&& <View style={{
        width: windowWidth - 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
      }}>
        <View
          style={styles.rowAlignItems}
        >
          <TouchableOpacity
            onPress={() => props.navigation.navigate('UserProfile', { userId: info.user.id })}
          >
            <Image
              source={info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri}
              style={{ width: 40, height: 40, borderRadius: 30 }}
              resizeMode='cover'
            />
          </TouchableOpacity>
          <View style={{
            marginLeft: 16
          }}>
            <SemiBoldText
              text={info.user.name}
              fontSize={13}
              lineHeight={18}
              color='#000'
              marginRight={6}
            />
            <DescriptionText
              text={'Brazil'}
              fontSize={10.52}
              lineHeight={15}
              color='#8F8F8F'
              marginRight={11}
            />
          </View>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <TouchableOpacity style={{
            backgroundColor: '#90DD12',
            width: 62,
            height: 22,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center'
          }}
            onPress={() => onSendRequest()}
          >
            <MediumText
              text={t(isFriend ? 'Followed' : 'Follow')}
              fontSize={12}
              lineHeight={15}
              color='#0E6C67'
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowContext(true)}
          >
            <SvgXml
              xml={threeDotsSvg}
              style={{
                marginLeft: 8,
                marginRight: 4
              }}
            />
          </TouchableOpacity>
        </View>
      </View>}
      <TouchableOpacity onPress={() => onClickDouble()} onLongPress={() => setShowContext(true)}>
        {info.text != null ? <ImageBackground
          source={info.imgFile ? { uri: info.imgFile.url } : info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri}
          style={{
            flexDirection: "column",
            justifyContent: "flex-end",
            width: windowWidth - 34,
            height: height,
          }}
          imageStyle={{
            borderRadius: 20
          }}
          blurRadius={(info.notSafe && isPlayed == false) ? 20 : 0}
        >
          {(!info.notSafe || isPlayed == true) &&
            <LinearGradient
              style={{ width: '100%', height: '100%', justifyContent: 'space-between', borderRadius: 20 }}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              colors={['rgba(250, 0, 255, 0)', 'rgba(75, 22, 76, 0.7)']}
            >
              <TitleText
                text={voiceTitle}
                fontSize={19}
                lineHeight={25}
                color="#FFF"
                marginTop={16}
                marginLeft={24}
              />
              <View style={{
                //width: 270,
                maxHeight: 140,
                minHeight: 50,
                marginBottom: 30,
                paddingHorizontal: 20
              }}>
                <SemiBoldText
                  text={info.text}
                  fontSize={17}
                  lineHeight={24}
                  color='#FFF'
                />
              </View>
              {info?.file && <View style={{
                width: 313,
                height: 64,
                marginTop: 22,
                marginBottom: 10,
                borderRadius: 13,
                backgroundColor: '#084C49',
                marginLeft: (windowWidth - 350) / 2,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row'
              }}>
                <ImageBackground
                  source={require('../../assets/common/button_back_green.png')}
                  style={{
                    width: 41.73,
                    height: 41.73,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 4
                  }}
                >
                  <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                    <LinearGradient
                      colors={['#A3F819', '#7CC10A']}
                      locations={[0, 1]}
                      start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                      style={{
                        width: 23.22,
                        height: 23.22,
                        borderRadius: 15,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <SvgXml
                        xml={isPlaying ? simplePauseSvg : triangleSvg}
                        width={8.1}
                        height={11.57}
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </ImageBackground>
                <VoicePlayer
                  voiceUrl={info.file.url}
                  waveColor={['#A3F819', '#7CC10A', '#7CC10A']}
                  playing={isPlaying}
                  stopPlay={() => setIsPlaying(false)}
                  startPlay={() => setIsPlaying(true)}
                  tinWidth={1.36}
                  mrg={0.68}
                  duration={info.duration}
                />
              </View>}
            </LinearGradient>
          }
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
                  text={t("This story may not be appropriated")}
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
                    text={t(info.text == null ? "Play story" : "Show story")}
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
          :
          <ImageBackground
            source={require('../../assets/Feed/voice_back.png')}
            style={{
              width: windowWidth - 34,
              height: 172,
            }}
            imageStyle={{
              borderRadius: 20
            }}
          >
            <SemiBoldText
              text={t(info.category) + ' ' + t('Groups')}
              fontSize={11}
              lineHeight={16}
              color='#FFF'
              marginLeft={24}
              marginTop={23}
            />
            <TitleText
              text={voiceTitle}
              fontSize={19}
              lineHeight={25}
              color="#FFF"
              marginTop={10}
              marginLeft={24}
            />
            <View style={{
              width: 313,
              height: 64,
              marginTop: 22,
              borderRadius: 13,
              backgroundColor: '#18113D',
              marginLeft: (windowWidth - 350) / 2,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row'
            }}>
              <ImageBackground
                source={require('../../assets/common/button_back.png')}
                style={{
                  width: 41.73,
                  height: 41.73,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 4
                }}
              >
                <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                  <LinearGradient
                    colors={['#FF9768', '#E73918']}
                    locations={[0, 1]}
                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                    style={{
                      width: 23.22,
                      height: 23.22,
                      borderRadius: 15,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <SvgXml
                      xml={isPlaying ? simplePauseSvg : triangleSvg}
                      width={8.1}
                      height={11.57}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </ImageBackground>
              <VoicePlayer
                voiceUrl={info.file.url}
                waveColor={['#FF9768', '#F86840', '#E73918']}
                playing={isPlaying}
                stopPlay={() => setIsPlaying(false)}
                startPlay={() => setIsPlaying(true)}
                tinWidth={1.36}
                mrg={0.68}
                duration={info.duration}
              />
            </View>
          </ImageBackground>
        }
      </TouchableOpacity>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: windowWidth - 34,
        marginTop: 15
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center'
        }}>
          <HeartIcon
            isLike={info.isLike}
            OnSetLike={() => OnSetLike()}
            marginLeft={6}
            marginRight={5}
          />
          <TouchableOpacity onPress={() => setAllLikes(true)}>
            <DescriptionText
              text={info.likesCount}
              fontSize={13}
              lineHeight={18}
              color="#000"
            />
          </TouchableOpacity>
          <SvgXml
            xml={replySvg}
            style={{
              marginLeft: 15
            }}
          />
          <TouchableOpacity onPress={() => setShowChat(true)}>
            <DescriptionText
              text={info.answersCount}
              fontSize={13}
              lineHeight={18}
              color="#000"
              marginLeft={5}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.rowAlignItems}>
          <SvgXml
            xml={supportSvg}
          />
          <MediumText
            text={t("Support")}
            fontSize={16}
            lineHeight={19}
            marginLeft={5}
            marginRight={6}
          />
        </View>
      </View>
      <View style={{
        width: windowWidth - 48,
        marginTop: 6
      }}>
        <DescriptionText
          text={time}
          fontSize={13}
          lineHeight={18}
          color='#8F8F8F'
        />
      </View>
      {allLikes &&
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
      {removeModal && <RemoveConfirm
        onConfirmRemove={onSendRequest}
        onCloseModal={() => setRemoveModal(false)}
        userName={info.user.name}
      />}
    </View>
  )
};