import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  Vibration,
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { PostContext } from '../component/PostContext';
import { TitleText } from "./TitleText";
import { HeartIcon } from './HeartIcon';
import { StoryLikes } from './StoryLikes';
import { DescriptionText } from "./DescriptionText";
import { useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import pauseSvg from '../../assets/common/pause.svg';
import playSvg from '../../assets/common/play.svg';
import notifySvg from '../../assets/common/notify.svg';
import yellow_starSvg from '../../assets/common/yellow_star.svg';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { styles } from '../style/Common';
import VoiceService from '../../services/VoiceService';
import VoicePlayer from '../Home/VoicePlayer';
import { Avatars, windowWidth } from '../../config/config';

import greyWaveSvg from '../../assets/record/grey-wave.svg';
import whiteWaveSvg from '../../assets/record/white-wave.svg';

export const VoiceItem = ({
  props,
  info,
  isRefresh = false,
  onChangeLike = () => { },
  spread = true,
}) => {
  const [showContext, setShowContext] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [delayTime, setDelayTime] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [allLikes, setAllLikes] = useState(false);

  const { t, i18n } = useTranslation();

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const DOUBLE_PRESS_DELAY = 400;

  let voiceTitle = info.title.toUpperCase(),
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
  let time = (day > 0 ? (day.toString() + ' ' + "d") : (hour > 0 ? (hour.toString() + ' ' + "h") : (minute > 0 ? (minute.toString() + ' ' + "m") : '')));

  const [reactions, setReactions] = useState(info.reactions);
  const [reactionsCount, setReactionsCount] = useState(info.reactionsCount);
  const [speed, setSpeed] = useState(1);

  if (isRefresh != refresh) {
    setRefresh(isRefresh);
  }

  const onLimit = (v) => {
    return ((v).length > 20) ?
      (((v).substring(0, 17)) + '...') :
      v;
  }

  const onSetSpeed = () => {
    let v = 1;
    if (speed < 2)
      v = speed + 0.5;
    setSpeed(v);
  }

  const OnSetLike = () => {
    if (info.isLike == true) {
      VoiceService.recordUnAppreciate(info.id);
    }
    else {
      VoiceService.recordAppreciate({ count: 1, id: info.id });
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
        props.navigation.navigate('VoiceProfile', { id: info.id });
      }, DOUBLE_PRESS_DELAY));
    }
  };

  return (
    <>
      <TouchableOpacity
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
                source={ info.imgFile ? { uri: info.imgFile.url } : info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri }
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
              playSpeed={speed}
              control={true}
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
            <TouchableOpacity
              onPress={() => onSetSpeed()}
              style={{ marginLeft: 15 }}
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
            <DescriptionText
              text={info.listenCount + " " + t("Play") +(info.listenCount>1?'s':'')+(time != '' ? " - " : '') + time}
              fontSize={13}
              lineHeight={15}
              marginLeft={15}
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
      </TouchableOpacity>
      {showContext &&
        <PostContext
          postInfo={info}
          props={props}
          onChangeIsLike={() => OnSetLike()}
          onCloseModal={() => setShowContext(false)}
        />
      }
      {allLikes &&
        <StoryLikes
          props={props}
          storyId={info.id}
          storyType="record"
          onCloseModal={() => setAllLikes(false)}
        />}
    </>
  );
};
