import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  ImageBackground,
  Platform,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SvgXml } from 'react-native-svg';
import RNVibrationFeedback from 'react-native-vibration-feedback';

import { Avatars, windowWidth } from '../../config/config';
import '../../language/i18n';
import VoiceService from '../../services/VoiceService';
import VoicePlayer from '../Home/VoicePlayer';
import { DescriptionText } from './DescriptionText';
import { HeartIcon } from './HeartIcon';
import { PostContext } from './PostContext';
import { SemiBoldText } from './SemiBoldText';
import { StoryLikes } from './StoryLikes';
import { StoryScreens } from './StoryScreens';

import threeDotsSvg from '../../assets/Feed/grey_three_dots.svg';
import replySvg from '../../assets/Feed/reply.svg';
import supportSvg from '../../assets/Feed/support.svg';
import simplePauseSvg from '../../assets/common/simple_pause.svg';
import triangleSvg from '../../assets/common/white_triangle.svg';
import notificationDisableSvg from '../../assets/record/disable_notification.svg';
import { styles } from '../style/Common';
import { MediumText } from './MediumText';
import { RemoveConfirm } from './RemoveConfirm';
import { TitleText } from './TitleText';

export const FriendStoryItem = ({
  props,
  info,
  itemIndex,
  storyLength,
  screenName,
  onMoveNext = () => { },
  onChangeLike = () => { },
  onChangePrevDay = () => { },
  onChangeNextDay = () => { }
}) => {

  if (info.text == null)
    info.text = '';

  const { t, i18n } = useTranslation();

  const [isPlaying, setIsPlaying] = useState(false);
  const [allLikes, setAllLikes] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [delayTime, setDelayTime] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showContext, setShowContext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFriend, setIsFriend] = useState(info.isFriend);
  const [removeModal, setRemoveModal] = useState(false);
  const voiceTitle = info.title;
  const DOUBLE_PRESS_DELAY = 400;
  const minSwipeDistance = 50;

  let num = Math.ceil((new Date().getTime() - new Date(info.createdAt).getTime()) / 60000);
  let minute = num % 60;
  num = (num - minute) / 60;
  let hour = num % 24;
  let day = (num - hour) / 24
  let time = (day > 0 ? (day.toString() + ' ' + t("day") + (day > 1 ? 's' : '')) : (hour > 0 ? (hour.toString() + ' ' + t("hour") + (hour > 1 ? 's' : '')) : (minute > 0 ? (minute.toString() + ' ' + t("minute") + (minute > 1 ? 's' : '')) : ''))) + ' ' + t('ago');

  let height = 291;
  let waveCom = [];
  let waveHeights = [4, 8, 15, 22, 28, 22, 15, 8, 4, 1, 1, 3, 4, 8, 12, 28, 19, 1, 3, 1, 1, 12, 4, 8, 15, 8, 4, 3, 1, 1, 28, 15, 28, 15, 4, 8, 15, 22, 28, 22, 15, 8, 4, 1, 1, 3, 4, 8, 15, 8, 12, 28, 19, 1, 3, 1, 1, 4, 8, 12, 8, 8, 12, 28, 19, 12, 4, 1, 1, 1, 1, 3, 4, 8, 1, 1]
  for (let i = 0; i < 76; i++) {
    let h = waveHeights[i];
    waveCom.push(
      <LinearGradient
        colors={['#FF9768', '#F86840', '#E73918']}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        key={i}
        style={{
          width: 1.36,
          height: h,
          borderRadius: 4,
          marginRight: 0.68,
          marginLeft: 0.68
        }}
      >
      </LinearGradient>
    );
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
      }
    }
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
      {screenName != 'Profile' && screenName != 'userProfile' && <View style={{
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
            <View style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <SemiBoldText
                text={info.user.name}
                fontSize={13}
                lineHeight={18}
                color='#000'
              />
              {info.user.premium != 'none' && <Image
                source={require("../../assets/common/premiumstar.png")}
                style={{
                  width: 13,
                  height: 13,
                  marginLeft: 5
                }}
              />}
            </View>
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
            backgroundColor: '#3E327A',
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
              color='#FFF'
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
        {info.imgFile ? <ImageBackground
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
                backgroundColor: '#18113D',
                marginLeft: (windowWidth - 350) / 2,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row'
              }}>
                <TouchableOpacity
                  onPress={() => setIsPlaying(!isPlaying)}
                >
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
                  </ImageBackground>
                </TouchableOpacity>
                {isPlaying ?
                  <VoicePlayer
                    voiceUrl={info.file.url}
                    waveColor={['#FF9768', '#F86840', '#E73918']}
                    playing={isPlaying}
                    stopPlay={() => setIsPlaying(false)}
                    startPlay={() => setIsPlaying(true)}
                    tinWidth={1.36}
                    mrg={0.68}
                    duration={info.duration}
                  /> :
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 8
                  }}>
                    {waveCom}
                  </View>
                }
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
              minHeight: 172,
              justifyContent: 'space-between',
              paddingVertical: 10
            }}
            imageStyle={{
              borderRadius: 20
            }}
          >
            <TitleText
              text={voiceTitle}
              fontSize={19}
              lineHeight={25}
              color="#FFF"
              marginLeft={24}
            />
            <SemiBoldText
              text={info.text}
              fontSize={17}
              lineHeight={24}
              marginLeft={24}
              marginTop={10}
              marginBottom={10}
              color='#FFF'
            />
            <View style={{
              width: 313,
              height: 64,
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
                <TouchableOpacity onPress={() => {
                  setIsPlaying(!isPlaying)
                }}>
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
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center'
          }}
            onPress={() => setShowChat(true)}>
            <SvgXml
              xml={replySvg}
              style={{
                marginLeft: 15
              }}
            />
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