import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  Vibration,
  Pressable
} from "react-native";

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { PostContext } from '../component/PostContext';
import { ReportContext } from '../component/ReportContext';
import { TitleText } from "./TitleText";
import { HeartIcon } from './HeartIcon';
import { StoryLikes } from './StoryLikes';
import { DescriptionText } from "./DescriptionText";
import { useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import pauseSvg from '../../assets/common/pause.svg';
import pauseSvg2 from '../../assets/common/pause2.svg';
import playSvg from '../../assets/common/play.svg';
import notifySvg from '../../assets/common/notify.svg';
import yellow_starSvg from '../../assets/common/yellow_star.svg';
import more_Svg from '../../assets/common/more.svg';
import star_Svg from '../../assets/common/star.svg';
import heart_Svg from '../../assets/common/heart.svg';
import heartRed_Svg from '../../assets/common/heart_red.svg';
import heartYellow_Svg from '../../assets/common/heart_yellow.svg';
import add_Svg from '../../assets/common/add.svg';
import addYellow_Svg from '../../assets/common/add_yellow.svg';
import addSuccess_Svg from '../../assets/common/add_success.svg';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { styles } from '../style/Common';
import VoiceService from '../../services/VoiceService';
import VoicePlayer from '../Home/VoicePlayer';
import { Avatars, windowWidth, windowHeight, Categories } from '../../config/config';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { StoryScreens } from './StoryScreens';
import { SemiBoldText } from './SemiBoldText';
import { setRefreshState } from '../../store/actions';

export const FeedItem = ({
  props,
  info,
  isRefresh = false,
  onChangeLike = () => { },
}) => {
  const [showContext, setShowContext] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [delayTime, setDelayTime] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [allLikes, setAllLikes] = useState(false);
  const [key, setKey] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [follows, setFollows] = useState(null);
  const [showChat, setShowChat] = useState(false);
  // const [isFriend, setIsFriend] = useState(false);
  // const [reload, setReload] = useState(false);

  const { t, i18n } = useTranslation();
  const mounted = useRef(false);

  let { refreshState } = useSelector((state) => {
    return (
      state.user
    )
  });

  // const { feedVisibleOne } = useSelector((state) => state.user);

  // useEffect(() => {
  //   setIsPlaying(feedVisibleOne === indd);
  // }, [feedVisibleOne])

  // const getFollowUsers = async () => {
  //   setIsLoading(true);
  //   await VoiceService.getFollows(user.id, 'Following').then(async res => {
  //     if (res.respInfo.status === 200) {
  //       const jsonRes = await res.json();
  //       setFollows(jsonRes);
  //       setIsLoading(false);
  //     }
  //   })
  //     .catch(err => {
  //       console.log(err);
  //     });
  // }

  // const onSendRequest = () => {
  //   if (isFriend) {
  //     VoiceService.unfollowFriend(info.user.id);
  //     Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
  //     Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
  //     setIsFriend(false);
  //   } else {
  //     VoiceService.followFriend(info.user.id);
  //     Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
  //   }
  //   setReload(!reload);
  //   setRefreshState(!refreshState);
  // }

  useEffect(() => {
    mounted.current = true;
    // setKey(prevKey => prevKey + 1);
    // getFollowUsers();
    return () => {
      mounted.current = false;
    }
  }, []);

  // useEffect(() => {
  //   getFollowUsers();
  // }, [reload])

  // useEffect(() => {
  //   let flag = false;
  //   if (!isLoading) {
  //     follows.map((item) => {
  //       if (item.user.name === info.user.name) {
  //         flag = true;
  //       }
  //     });
  //     // setIsFriend(flag);
  //   }
  // }, [follows, isLoading])

  useEffect(() => {
    setKey(key => key+1);
  }, [isPlaying])

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const DOUBLE_PRESS_DELAY = 400;

  let voiceTitle = info.title,
    details = info.user.name,
    voiceTime = info.duration,
    erngSvg = info.emoji ? info.emoji : "😁",
    comments = info.answersCount,
    premium = info.user.premium;

  let num = Math.ceil((new Date().getTime() - new Date(info.createdAt).getTime()) / 60000);
  let minute = num % 60;
  num = (num - minute) / 60;
  let hour = num % 24;
  let day = (num - hour) / 24
  let time = (day > 0 ? (day.toString() + ' ' + t("day") + (day > 1 ? 's' : '')) : (hour > 0 ? (hour.toString() + ' ' + t("hour") + (hour > 1 ? 's' : '')) : (minute > 0 ? (minute.toString() + ' ' + t("minute") + (minute > 1 ? 's' : '')) : '')));

  const [reactions, setReactions] = useState(info.reactions);
  const [reactionsCount, setReactionsCount] = useState(info.reactionsCount);
  const [commentCount, setCommentCount] = useState(info.answersCount);

  if (isRefresh != refresh) {
    setRefresh(isRefresh);
  }

  const onLimit = (v) => {
    return ((v).length > 20) ?
      (((v).substring(0, 17)) + '...') :
      v;
  }

  const OnSetLike = () => {
    if (info.isLike == true) {
      VoiceService.recordUnAppreciate(info.id);
    }
    else {
      VoiceService.recordAppreciate({ count: 1, id: info.id });
      Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    }
    onChangeLike(!info.isLike);
  }

  const onClickDouble = () => {
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

  const getCategoryUrl = (cate) => {
    let res = Categories.filter((item) => {
      return item.label === cate;
    });
    return res[0].uri;
  }

  const convertSectoPad = (second) => {
    let sec = second % 60 | 0;
    let min = (second / 60) | 0;

    return min.toString().padStart(2, '0') + ':' + sec.toString().padStart(2, '0');
  }

  return (
    <>
      <Pressable
        style={{ height: windowHeight / 157 * 115 }}
        onPress={() => onClickDouble()}
      >
      <View style={{ width: windowWidth, height: windowHeight / 157 * 115 , paddingHorizontal: 16, position: "relative" }}>
        <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          {/* <TitleText
            text={onLimit(voiceTitle)}
            maxWidth={windowWidth - 100}
            fontSize={28}
          /> */}
          <View style={{
              alignSelf: "flex-start",
              height: 31,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              backgroundColor: "#FFF",
              borderRadius: 16,
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
              fontSize: 17,
              lineHeight: 28,
              fontWeight: "400",
              color: "#361252",
              marginLeft: 6
            }}>
              { info.category === '' ? 'All' : info.category }
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
            borderRadius: 10,
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
        {/* <View style={{
            alignSelf: "flex-start",
            height: 31,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            backgroundColor: "#FFF",
            borderRadius: 16,
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
            fontSize: 17,
            lineHeight: 28,
            fontWeight: "400",
            color: "#361252",
            marginLeft: 6
          }}>
            { info.category === '' ? 'All' : info.category }
          </Text>
        </View> */}
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
            duration={info.duration}
            size = {windowHeight / 417 * 135}
            strokeWidth={5}
            trailColor="#D4C9DE"
            trailStrokeWidth={1}
            colors={[
              ['#B35CF8', 0.4],
              ['#8229F4', 0.4],
              ['#8229F4', 0.2],
            ]}
          >
            {({ elapsedTime, remainingTime, animatedColor }) => {
              return (
              <>
                <View style={{
                flexDirection: "row",
                alignItems: "center",
                position: "absolute",
                bottom: -36
                }}>
                <DescriptionText
                  text={convertSectoPad(elapsedTime) + ' • ' + new Date(voiceTime * 1000).toISOString().substr(14, 5)}
                  lineHeight={30}
                  fontSize={13}
                />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    props.navigation.navigate('UserProfile', { userId: info.user.id });
                  }}
                  style={{ position: "relative" }}
                >
                <Image
                  source={ info.user.avatar?{ uri: info.user.avatar.url }:Avatars[info.user.avatarNumber].uri }
                  style={{ width: windowHeight / 417 * 125 - 88, height: windowHeight / 417 * 125 - 88, borderRadius: (windowHeight / 417 * 125 - 88) / 2, borderColor: '#FFA002', borderWidth: premium == 'none' ? 0 : 2 }}
                />
                  <TouchableOpacity
                    onPress={() => setIsPlaying(!isPlaying)}
                    style = {{
                      position: "absolute",
                      top: (windowHeight / 417 * 125 - 88) / 2 - 23,
                      left: (windowHeight / 417 * 125 - 88) / 2 - 23
                    }}
                  >
                    <SvgXml
                      width={45}
                      height={45}
                      xml={isPlaying ? pauseSvg2 : playSvg}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                </>
              )
            }}
          </CountdownCircleTimer>
          <View style={{
            marginTop: 36,
            flexDirection: "row",
            alignItems: "center"
          }}>
            {/* <DescriptionText
              text={details + ' • ' + new Date(voiceTime * 1000).toISOString().substr(14, 5)}
              lineHeight={30}
              fontSize={13}
            /> */}
          </View>
          <View>
            <SemiBoldText
              text={voiceTitle.toUpperCase()}
              fontSize={27}
              lineHeight={34}
              color='#361252'
              marginLeft={10}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
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
              }}>{ info.user.name }</Text>
            </View>
          </TouchableOpacity>
          <DescriptionText
            text={info.listenCount + " " + t("Play") +(info.listenCount>1?'s':'')+(time != '' ? " - " : '') + time + t(' ago')}
            fontSize={13}
            lineHeight={15}
            marginTop={9}
            color='rgba(54, 36, 68, 0.8)'
          />
        </View>
        <View style={{
          position: "absolute",
          flexDirection: "column",
          alignItems: "center",
          bottom: 60,
          right: 20
        }}>
          {/* { !isLoading && user.id !== info.user.id && <TouchableOpacity style={{ position: "relative" }} onPress={() => onSendRequest()}>
            <Image source={ info.user.avatar?{ uri: info.user.avatar.url }:Avatars[info.user.avatarNumber].uri } style={{ width: 40, height: 40, borderRadius: 20 }} />
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
          </TouchableOpacity>} */}
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
        </View>
        { isPlaying && <View style={{ width: windowWidth - 80, opacity: 0 }}><VoicePlayer
          voiceUrl={info.file.url}
          stopPlay={() => setIsPlaying(false)}
          startPlay={() => { VoiceService.listenStory(info.id, 'record') }}
          playBtn={false}
          replayBtn={false}
          waveColor={info.user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
          playing={true}
          tinWidth={windowWidth / 160}
          mrg={windowWidth / 600}
          duration={info.duration * 1000}
        /></View>}
      </View>
      </Pressable>
      {/* <TouchableOpacity
        style={{
          marginTop: 12,
          marginBottom: 4,
          paddingHorizontal: 16,
          marginHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          backgroundColor: '#FFF',
          shadowColor: 'rgba(88, 74, 117, 1)',
          elevation: 10,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          borderRadius: 16,
          borderWidth: premium == 'none' ? 0 : 1,
          borderColor: '#FFA002',
          zIndex: 0
        }}
        onLongPress={() => setShowContext(true)}
        onPress={() => onClickDouble()}
      >
        <View
          style={[styles.rowSpaceBetween]}
        >
          <View
            style={styles.row}
          >
            <View>
              <Image
                source={ info.user.avatar?{ uri: info.user.avatar.url }:Avatars[info.user.avatarNumber].uri}
                style={{ width: 50, height: 50, borderRadius: 25, borderColor: '#FFA002', borderWidth: premium == 'none' ? 0 : 2 }}
                resizeMode='cover'
              />
              <View
                style={{
                  backgroundColor: '#FFF',
                  borderWidth: 3,
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  position: 'absolute',
                  borderRadius: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                  right: -10,
                  bottom: -2
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    color: 'white',
                  }}
                >
                  {erngSvg}
                </Text>
              </View>
            </View>
            <View
              style={{
                marginLeft: 20
              }}
            >
              <TitleText
                text={onLimit(voiceTitle)}
                maxWidth={windowWidth - 180}
                fontSize={17}
              />
              <View style={styles.rowAlignItems}>
                {premium != 'none' &&
                  <SvgXml
                    width={30}
                    height={30}
                    xml={yellow_starSvg}
                  />}
                <DescriptionText
                  text={details + ' • ' + new Date(voiceTime * 1000).toISOString().substr(14, 5)}
                  lineHeight={30}
                  fontSize={13}
                />
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <SvgXml
              width={45}
              height={45}
              xml={isPlaying ? pauseSvg : playSvg}
            />
          </TouchableOpacity>
        </View>
        {
          isPlaying &&
          <View style={{ marginTop: 15, width: '100%' }}>
            <VoicePlayer
              voiceUrl={info.file.url}
              stopPlay={() => setIsPlaying(false)}
              startPlay={() => { VoiceService.listenStory(info.id, 'record') }}
              playBtn={false}
              replayBtn={false}
              waveColor={info.user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
              playing={true}
              tinWidth={windowWidth / 160}
              mrg={windowWidth / 600}
              duration={info.duration * 1000}
            />
          </View>
        }

        <View
          style={[styles.rowSpaceBetween, { marginTop: 8 }]}
        >
          <View style={[styles.row, { alignItems: 'center' }]}>
            <HeartIcon
              isLike={info.isLike}
              OnSetLike={() => OnSetLike()}
              marginLeft={6}
              marginRight={7}
            />
            <TouchableOpacity onPress={() => setAllLikes(true)}>
              <DescriptionText
                text={info.likesCount}
                fontSize={17}
                lineHeight={19}
                fontFamily="SFProDisplay-Medium"
                color="rgba(59, 31, 82, 0.6)"
              />
            </TouchableOpacity>
            <DescriptionText
              text={info.listenCount + " " + t("reading") +(info.listenCount>1?'s':'')+(time != '' ? " - " : '') + time}
              fontSize={13}
              lineHeight={15}
              marginLeft={30}
              color='rgba(54, 36, 68, 0.8)'
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SvgXml
              width={19}
              height={19}
              xml={notifySvg}
            />
            <DescriptionText
              text={comments}
              fontSize={16}
              lineHeight={19}
              fontFamily="SFProDisplay-Medium"
              color="rgba(59, 31, 82, 0.6)"
              marginLeft={12}
              marginRight={4}
            />
          </View>
        </View>
      </TouchableOpacity> */}
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
        <ReportContext
          postInfo={info}
          props={props}
          onChangeIsLike={() => OnSetLike()}
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
          onSetCommentCount = {setCommentCount}
        />
      }
    </>
  );
};
