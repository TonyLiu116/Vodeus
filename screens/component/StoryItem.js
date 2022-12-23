import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  Vibration,
  Pressable,
  ImageBackground,
  Platform
} from "react-native";

import * as Progress from "react-native-progress";
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { PostContext } from '../component/PostContext';
import { ReportContext } from '../component/ReportContext';
import { TitleText } from "./TitleText";
import { HeartIcon } from './HeartIcon';
import { StoryLikes } from './StoryLikes';
import { DescriptionText } from "./DescriptionText";
import { useDispatch, useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import pauseSvg from '../../assets/common/pause.svg';
import pauseSvg2 from '../../assets/common/pause2.svg';
import playSvg from '../../assets/common/play.svg';
import notifySvg from '../../assets/common/notify.svg';
import notificationDisableSvg from '../../assets/record/disable_notification.svg';
import yellow_starSvg from '../../assets/common/yellow_star.svg';
import more_Svg from '../../assets/common/more.svg';
import star_Svg from '../../assets/common/star.svg';
import heart_Svg from '../../assets/common/heart.svg';
import heartRed_Svg from '../../assets/common/heart_red.svg';
import heartYellow_Svg from '../../assets/common/heart_yellow.svg';
import forwardSvg from '../../assets/record/forward.svg';
import add_Svg from '../../assets/common/add.svg';
import addYellow_Svg from '../../assets/common/add_yellow.svg';
import addSuccess_Svg from '../../assets/common/add_success.svg';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { styles } from '../style/Common';
import Share from 'react-native-share';
import VoiceService from '../../services/VoiceService';
import VoicePlayer from '../Home/VoicePlayer';
import { Avatars, windowWidth, windowHeight, Categories } from '../../config/config';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { StoryScreens } from './StoryScreens';
import { SemiBoldText } from './SemiBoldText';
import RNFetchBlob from 'rn-fetch-blob';
import { setRefreshState, setVisibleOne } from '../../store/actions';
import { SoundPlay } from './SoundPlay';

export const StoryItem = ({
  props,
  info,
  itemIndex,
  itemHeight = windowHeight / 157 * 115,
  onChangeLike = () => { },
}) => {
  const [showContext, setShowContext] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [delayTime, setDelayTime] = useState(null);
  const [playStatus, setIsPlayStatus] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [allLikes, setAllLikes] = useState(false);
  const [key, setKey] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isFriend, setIsFriend] = useState(info.isFriend);
  const [isPlayed, setIsPlayed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);

  const { t, i18n } = useTranslation();
  const mounted = useRef(false);

  const rTime = useRef(info.duration);

  const dispatch = useDispatch();

  const { visibleOne } = useSelector((state) => state.user);

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const DOUBLE_PRESS_DELAY = 400;

  let voiceTitle = info.title.toUpperCase(),
    voiceTime = info.duration,
    premium = info.user.premium;

  let num = Math.ceil((new Date().getTime() - new Date(info.createdAt).getTime()) / 60000);
  let minute = num % 60;
  num = (num - minute) / 60;
  let hour = num % 24;
  let day = (num - hour) / 24
  let time = (day > 0 ? (day.toString() + ' ' + t("day") + (day > 1 ? 's' : '')) : (hour > 0 ? (hour.toString() + ' ' + t("hour") + (hour > 1 ? 's' : '')) : (minute > 0 ? (minute.toString() + ' ' + t("minute") + (minute > 1 ? 's' : '')) : '')));

  const [commentCount, setCommentCount] = useState(info.answersCount);

  const OnSetLike = () => {
    if (info.isLike == true) {
      VoiceService.recordUnAppreciate(info.id);
    }
    else {
      VoiceService.recordAppreciate({ count: 1, id: info.id });
      Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    }
    onChangeLike(!info.isLike);
  }

  const onClickDouble = () => {
    if (info.notSafe)
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

  const getCategoryUrl = (cate) => {
    let res = Categories.filter((item) => {
      return item.label === cate;
    });
    return res[0].uri;
  }

  const convertSectoPad = (second) => {
    let rSecond = second * speed;
    let sec = rSecond % 60 | 0;
    let min = (rSecond / 60) | 0;

    return min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');
  }

  const onShareAudio = () => {
    const dirs = RNFetchBlob.fs.dirs.DocumentDir;
    const fileName = 'Vocco app - ' + info.title;
    const path = Platform.select({
      ios: `${dirs}/${fileName}.m4a`,
      android: `${dirs}/${fileName}.mp3`,
    });
    setLoading(true);
    RNFetchBlob.config({
      fileCache: true,
      path,
    }).fetch('GET', info.file.url).then(res => {
      if (mounted.current && res.respInfo.status == 200) {
        setLoading(false);
        //let filePath = `${Platform.OS === 'android' ? res.path() : `${fileName}.m4a`}`;
        let filePath = res.path();
        Share.open({
          url: (Platform.OS == 'android' ? 'file://' : '') + filePath,
          type: 'audio/' + (Platform.OS === 'android' ? 'mp3' : 'm4a'),
        }).then(res => {
        })
          .catch(err => {
            console.log(err);
          });
      }
    })
      .catch(async err => {
        console.log(err);
      })
  };

  useEffect(() => {
    mounted.current = true;
    if (mounted.current && !info.notSafe){
      setIsPlayStatus(visibleOne == itemIndex);
      setIsPlaying(false);
    }
    return () => {
      mounted.current = false;
    }
  }, [visibleOne]);

  useEffect(() => {
    setKey(key => key + 1);
    rTime.current = info.duration;
    setSpeed(1);
  }, [playStatus])

  return (
    <>
      <View
        style={{ height: itemHeight, backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
      //onPress={() => onClickDouble()}
      >
        <View style={{ width: windowWidth, height: windowHeight / 157 * 115, paddingHorizontal: 16, position: "relative" }}>
          <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 15, marginBottom: 10 }}>
            <View style={{
              alignSelf: "flex-start",
              height: 28,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              backgroundColor: "#FFF",
              borderRadius: 12,
              marginTop: 7,
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
                  width: 18,
                  height: 18
                }}
              />
              <Text style={{
                fontSize: 16,
                lineHeight: 35,
                fontWeight: "400",
                color: "#361252",
                marginLeft: 6
              }}>
                {info.category === '' ? 'All' : info.category}
              </Text>
            </View>
            <TouchableOpacity style={{
              marginTop: 5,
              width: 36,
              height: 36,
              backgroundColor: '#FFF',
              shadowColor: 'rgba(88, 74, 117, 1)',
              elevation: 10,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              borderRadius: 8,
              zIndex: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
              onPress={() => setShowReport(true)}
            >
              <SvgXml
                width={20}
                height={20}
                xml={more_Svg}
              />
            </TouchableOpacity>
          </View>
          <View style={{
            position: 'relative',
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
            marginTop: 27
          }}>
            <CountdownCircleTimer
              key={key}
              isPlaying={isPlaying}
              duration={info.duration / speed}
              initialRemainingTime={rTime.current}
              size={windowHeight / 417 * 150}
              strokeWidth={7}
              onComplete={() => {setIsPlayStatus(false);setIsPlaying(false);}}
              trailColor="#D4C9DE"
              trailStrokeWidth={1}
              colors={[
                ['#B35CF8', 0.4],
                ['#8229F4', 0.4],
                ['#8229F4', 0.2],
              ]}
              isLinearGradient={true}
            >
              {({ elapsedTime, remainingTime, animatedColor }) => {
                rTime.current = remainingTime;
                return (
                  <>
                    <View style={{
                      flexDirection: "row",
                      alignItems: "center",
                      position: "absolute",
                      bottom: -56
                    }}>
                      <DescriptionText
                        text={convertSectoPad(elapsedTime) + ' • ' + new Date(voiceTime * 1000).toISOString().substr(14, 5)}
                        lineHeight={30}
                        fontSize={13}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        info.user.id == user.id ? props.navigation.navigate('Profile') : props.navigation.navigate('UserProfile', { userId: info.user.id });
                      }}
                      style={{ position: "relative" }}
                    >
                      <ImageBackground
                        source={info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri}
                        style={{ justifyContent: 'center', alignItems: 'center', width: windowHeight / 417 * 125 - 70, height: windowHeight / 417 * 125 - 70 }}
                        imageStyle={{ borderRadius: (windowHeight / 417 * 125 - 88) / 2, borderColor: '#FFA002', borderWidth: premium == 'none' ? 0 : 2 }}
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setIsPlayStatus(!playStatus);
                            setIsPlaying(false);
                            dispatch(setVisibleOne(playStatus ? -1 : itemIndex));
                          }}
                        >
                          <SvgXml
                            width={61}
                            height={61}
                            xml={playStatus ? pauseSvg2 : playSvg}
                          />
                        </TouchableOpacity>
                      </ImageBackground>
                    </TouchableOpacity>
                  </>
                )
              }}
            </CountdownCircleTimer>
            <View style={{
              marginTop: 56,
              flexDirection: "row",
              alignItems: "center"
            }}>
            </View>
            <View>
              <SemiBoldText
                text={voiceTitle}
                fontSize={27}
                lineHeight={34}
                color='#361252'
                marginLeft={10}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                if (info.user.id == user.id)
                  props.navigation.navigate('Profile');
                else
                  props.navigation.navigate('UserProfile', { userId: info.user.id });
              }}
            >
              <View style={{
                marginTop: 2,
                flexDirection: "row",
                alignItems: "center"
              }}>
                {info.user.premium != 'none' && <SvgXml xml={star_Svg} style={{ width: 24, height: 24 }} />}
                <Text style={{
                  color: info.user.premium != 'none' ? '#FFB400' : '#361252',
                  fontSize: 27,
                  fontWeight: "400",
                  lineHeight: 44
                }}>{info.user.name}</Text>
              </View>
            </TouchableOpacity>
          </View>
          {playStatus && <View style={{ position: 'absolute', width: 1, opacity: 0 }}>
            <VoicePlayer
              voiceUrl={info.file.url}
              stopPlay={() => {setIsPlaying(false);setIsPlayStatus(false)}}
              startPlay={() => { setIsPlaying(true);VoiceService.listenStory(info.id, 'record'); }}
              playBtn={false}
              replayBtn={false}
              waveColor={info.user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
              playing={true}
              tinWidth={windowWidth / 1600000}
              mrg={windowWidth / 6000000}
              duration={info.duration * 1000}
              control={true}
              playSpeed={speed}
            />
            {/* <SoundPlay
              path={info.file.url}
              playSpeed={speed}
            /> */}
          </View>}
          <View style={{ position: 'absolute', bottom: 55, width: windowWidth, alignItems: 'center' }}>
            <TouchableOpacity style={{
              width: 60,
              height: 37,
              borderRadius: 20,
              backgroundColor: '#FFF',
              borderWidth: 1,
              borderColor: '#F2F0F5',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 6
            }}
              onPress={() => {
                setSpeed(prev => {
                  let r = 0;
                  if (prev == 2)
                    r = 1;
                  else
                    r = prev + 0.5;
                  rTime.current *= (prev / r);
                  return r;
                })
                setKey(key + 1);
              }}
            >
              <TitleText
                fontSize={15}
                lineHeight={25}
                color='#636363'
                text={'x' + speed.toString()}
              />
            </TouchableOpacity>
            <DescriptionText
              text={info.listenCount + " " + t("Play") + (info.listenCount > 1 ? 's' : '') + (time != '' ? " - " : '') + time + t(' ago')}
              fontSize={13}
              lineHeight={15}
              color='rgba(54, 18, 82, 0.3)'
            />
          </View>
          <View style={{
            position: "absolute",
            flexDirection: "column",
            alignItems: "center",
            bottom: 90,
            right: 20,
          }}>
            {user.id !== info.user.id && <TouchableOpacity disabled={isLoading} style={{ position: "relative", opacity: isLoading ? 0.5 : 1 }} onPress={() => onSendRequest()}>
              <Image source={info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri} style={{ width: 40, height: 40, borderRadius: 20 }} />
              <View style={{
                position: "absolute",
                bottom: -7,
                left: 12
              }}>
                <SvgXml
                  width={18}
                  height={18}
                  xml={!isFriend ? info.user.premium != "none" ? addYellow_Svg : add_Svg : addSuccess_Svg}
                />
              </View>
            </TouchableOpacity>}
            <View style={{
              marginTop: 18,
              flexDirection: "column",
              alignItems: "center"
            }}>
              <TouchableOpacity
                onPress={() => OnSetLike()}
              >
                <SvgXml height={30} xml={info.isLike ? info.user.premium != 'none' ? heartYellow_Svg : heartRed_Svg : heart_Svg} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAllLikes(true)}
              >
                <DescriptionText
                  text={info.likesCount}
                  fontSize={17}
                  lineHeight={19}
                  marginTop={2}
                  fontFamily="SFProDisplay-Medium"
                  color="rgba(59, 31, 82, 0.6)"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{
              marginTop: 8,
              flexDirection: "column",
              alignItems: "center"
            }}
              onPress={() => setShowChat(true)}
            >
              <SvgXml
                width={30}
                height={30}
                xml={notifySvg}
              />
              <DescriptionText
                text={commentCount}
                fontSize={16}
                lineHeight={19}
                fontFamily="SFProDisplay-Medium"
                color="rgba(59, 31, 82, 0.6)"
                marginTop={2}
              />
            </TouchableOpacity>
            <TouchableOpacity style={{
              marginTop: 10,
              flexDirection: "column",
              alignItems: "center"
            }}
              onPress={() => onShareAudio()}
            >
              <SvgXml
                xml={forwardSvg}
              />
            </TouchableOpacity>
          </View>
        </View>
        {info.notSafe && !playStatus && !isPlayed && <ImageBackground
          source={require('../../assets/record/NotSafeBg.png')}
          resizeMode="stretch"
          style={{ width: '100%', height: '100%', position: 'absolute', elevation: 11, flex: 1, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View></View>
          <View style={{
            alignItems: 'center'
          }}>
            <SvgXml
              xml={notificationDisableSvg}
            />
            <SemiBoldText
              text={t("Sensitive content")}
              fontSize={20}
              lineHeight={24}
              color="#000"
              marginTop={16}
            />
            <DescriptionText
              text={t("This audio may not be appropriated")}
              color="#000"
              marginTop={24}
            />
          </View>
          <View style={{
            alignItems: 'center'
          }}>
            <View style={{
              width: windowWidth - 20,
              borderTopWidth: 1,
              borderTopColor: '#A4A4A4',
              alignItems: 'center'
            }}>
              <TouchableOpacity
                onPress={() => { setIsPlayStatus(true); setIsPlayed(true);setIsPlaying(false); }}
              >
                <SemiBoldText
                  text={t("Play story")}
                  fontSize={18}
                  lineHeight={22}
                  color="#000"
                  marginTop={17}
                  marginBottom={50}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>}
      </View>
      {showContext &&
        <PostContext
          postInfo={info}
          props={props}
          onChangeIsLike={() => OnSetLike()}
          onCloseModal={() => setShowContext(false)}
        />
      }
      {
        showReport &&
        <PostContext
          postInfo={info}
          props={props}
          onCloseModal={() => setShowReport(false)}
        />
      }
      {allLikes &&
        <StoryLikes
          props={props}
          storyId={info.id}
          storyType="record"
          onCloseModal={() => setAllLikes(false)}
        />}
      {
        showChat &&
        <StoryScreens
          props={props}
          recordId={info.id}
          onCloseModal={() => setShowChat(false)}
          onSetCommentCount={setCommentCount}
        />
      }
      {loading &&
        <View style={{
          position: 'absolute',
          width: '100%',
          alignItems: 'center',
          marginTop: 100,
          elevation: 20
        }}>
          <Progress.Circle
            indeterminate
            size={30}
            color="rgba(0, 0, 255, .7)"
            style={{ alignSelf: "center" }}
          />
        </View>
      }
    </>
  );
};
