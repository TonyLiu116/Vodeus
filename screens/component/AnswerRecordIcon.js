
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  Platform,
  Vibration,
  TouchableOpacity
} from 'react-native';

import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';

import { recorderPlayer } from '../Home/AudioRecorderPlayer';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import RNFetchBlob from 'rn-fetch-blob';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import Draggable from 'react-native-draggable';
import { LinearTextGradient } from "react-native-text-gradient";
import { TitleText } from './TitleText';
import { Warning } from './Warning';
import { windowHeight, windowWidth } from '../../config/config';
import redCancelSvg from '../../assets/post/close.svg';
import publishBlankSvg from '../../assets/post/post.svg';
import { DescriptionText } from './DescriptionText';
import { useDispatch, useSelector } from 'react-redux';
import { setVoiceState } from '../../store/actions';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';

import recordSvg from '../../assets/common/bottomIcons/record.svg';
import redTrashSvg from '../../assets/common/red_trash.svg';
import { SvgXml } from 'react-native-svg';
import { styles } from '../style/Common';
import VoicePlayer from '../Home/VoicePlayer';
import VoiceService from '../../services/VoiceService';

export const AnswerRecordIcon = ({
  props,
  recordId,
  replyInfo,
  onPublishStory = () => { },
  onPublishReplyStory = () => { },
  onStartPublish = () => { }
}) => {


  let { user, voiceState, refreshState } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  // let recordId = props.navigation.state.params?.id;
  const [fill, setFill] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [key, setKey] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isPublish, setIsPublish] = useState(false);

  const wasteTime = useRef(0);
  const dragPos = useRef(0);

  recorderPlayer.setSubscriptionDuration(0.5); // optional. Default is 0.1

  const dirs = RNFetchBlob.fs.dirs;

  const path = Platform.select({
    ios: `${dirs.CacheDir}/hello.m4a`,
    android: `${dirs.CacheDir}/hello.mp3`,
  });

  const clearRecorder = async () => {
    await recorderPlayer.resumeRecorder().then(res => {
    })
      .catch(err => {
        console.log(err);
      });
    await recorderPlayer.stopRecorder().then(res => {
    })
      .catch(err => {
        console.log(err);
      });
    recorderPlayer.removeRecordBackListener();
  }

  const onStartRecord = async () => {
    if (isRecording == false) {
      dragPos.current = 0;
      setIsRecording(true);
      setIsPaused(false);
      let path = Platform.select({
        ios: `hello.m4a`,
        android: `${dirs.CacheDir}/hello.mp3`,
      });
      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
      };
      dispatch(setVoiceState(voiceState + 1));
      clearRecorder().then(async res => {
        await recorderPlayer.startRecorder(path, audioSet).then(res => {
        })
          .catch(err => {
            console.log(err);
          });
        recorderPlayer.addRecordBackListener((e) => {
          wasteTime.current = e.currentPosition;
        });
      });
    }
  };

  const onStopRecord = async (publish) => {
    if (isRecording == true) {
      setIsRecording(false);
      setIsPaused(true);
      setKey(prevKey => prevKey + 1);
      if (publish == true) {
        setIsPublish(true);
        clearRecorder();
      }
      else {
        clearRecorder();
      }
    }
  };

  const onChangeRecord = async (e, v = false) => {
    if (v == true && isRecording == false) {
      Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
      onStartRecord();
    }
    if (v == false && isRecording == true) {
      onStopRecord(dragPos.current >= - 100 && wasteTime.current > 0)
    }
  }

  const onTimeEnd = () => {
    onStopRecord(true);
  }

  const handleSubmit = async () => {
    if (path) {
      let tp = Math.max(wasteTime.current, 1);
      let voiceFile = [
        { name: 'duration', data: String(Math.ceil(tp / 1000.0)) },
        { name: 'record', data: replyInfo ? replyInfo.id : recordId },
        { name: 'file', filename: Platform.OS === 'android' ? 'answer.mp3' : 'answer.m4a', data: RNFetchBlob.wrap(String(path)) },
      ];
      onStartPublish();
      if (replyInfo == null) {
        VoiceService.postAnswerVoice(voiceFile).then(async res => {
          if (res.respInfo.status !== 201) {
          } else {
            const jsonRes = res.json();
            Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
            onPublishStory(jsonRes);
          }
        })
          .catch(err => {
            console.log(err);
          });
      }
      else {
        VoiceService.postAnswerReply(voiceFile, replyInfo.user.id).then(async res => {
          const jsonRes = await res.json();
          if (res.respInfo.status !== 201) {
          } else {
            Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
            onPublishReplyStory(jsonRes);
          }
          setIsLoading(false);
        })
          .catch(err => {
            console.log(err);
          });
      }
      setIsPublish(false);
      wasteTime.current = 0;
    }
  }

  let r = 0;

  useEffect(() => {
    setFill(user.premium != 'none' ? 60 : 30);
    setKey(prevKey => prevKey + 1);
    //dispatch(setVoiceState(voiceState+1));
    return () => clearRecorder();
  }, [])

  return (
    <View
      style={{
        position: 'absolute',
        bottom: isRecording ? 23 : 33,
        right: isRecording ? 7 : 13,
        width: (isRecording || isPublish) ? windowWidth : 44,
        height: isRecording ? 76 : 44,
        elevation: 11,
        zIndex: 10
      }}
      onPress={() => onStopRecord(false)}
    >
      {isPublish ?
        <View style={{
          width: windowWidth,
          marginLeft: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingRight: 12,
              paddingVertical: 8,
              backgroundColor: '#FFF',
              shadowColor: 'rgba(176, 148, 235, 1)',
              elevation: 10,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              borderRadius: 30,
            }}
          >
            <VoicePlayer
              playBtn={true}
              waveColor={user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
              playing={false}
              stopPlay={() => { }}
              startPlay={() => { }}
              tinWidth={windowWidth / 300}
              mrg={windowWidth / 600}
              duration={wasteTime.current}
            />
            <TouchableOpacity onPress={() => { setIsPublish(false); wasteTime.current = 0; }}>
              <SvgXml
                width={24}
                height={24}
                xml={redTrashSvg}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSubmit}>
            <Image
              style={{
                height: 56,
                width: 56,
                marginLeft: 4
              }}
              resizeMode="stretch"
              source={require('../../assets/post/answerPublish.png')}
            />
          </TouchableOpacity>
        </View>
        :
        <View style={{ width: isRecording ? '100%' : 44, height: isRecording ? 76 : 44 }}>
          {isRecording && <View style={{
            marginLeft: 48,
            color: '#281E30',
            width: 328,
            height: 76,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <ImageBackground
              style={{
                position: 'absolute',
                height: 56,
                width: 328,
                justifyContent: 'center'
              }}
              resizeMode="stretch"
              source={require('../../assets/chat/chatRecord.png')}
            >
              <DescriptionText
                text={t("Swipe to Cancel")}
                fontSize={13}
                lineHeight={13}
                color='#E41717'
                marginLeft={188}
              />
            </ImageBackground>
            <View
              style={{
                width: 8,
                height: 8,
                marginLeft: 24,
                borderRadius: 4,
                backgroundColor: "#E41717"
              }}
            ></View>
            <CountdownCircleTimer
              key={key}
              isPlaying={isRecording}
              duration={fill}
              size={57}
              strokeWidth={0}
              trailColor="#D4C9DE"
              trailStrokeWidth={0}
              onComplete={() => onStopRecord(true)}
              colors={[
                ['#B35CF8', 0.4],
                ['#8229F4', 0.4],
                ['#8229F4', 0.2],
              ]}
            >
              {({ remainingTime, animatedColor }) => {
                return (
                  <DescriptionText
                    text={new Date(wasteTime.current).toISOString().substr(14, 5)}
                    lineHeight={24}
                    color="rgba(54, 36, 68, 0.8)"
                    fontSize={15}
                  />
                )
              }}
            </CountdownCircleTimer>
          </View>}
          <Draggable
            key={key}
            x={isRecording ? windowWidth - 68 : 0}
            y={0}
            shouldReverse={true}
            minX={windowWidth - 202}
            maxX={windowWidth - 2}
            minY={0}
            maxY={0}
            touchableOpacityProps={{
              activeOpactiy: 0.1,
            }}
            onDrag={(event, gestureState) => {

            }}
            onDragRelease={(event, gestureState, bounds) => {
              dragPos.current = gestureState.dx;
              if (gestureState.dx < - 100) {
                setTimeout(() => {
                  Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                }, 100);
                onStopRecord(false);
              }
            }}
            onReverse={() => {

            }}

          >
            <View
              onTouchStart={(e) => onChangeRecord(e, true)}
              onTouchEnd={(e) => onChangeRecord(e, false)}
              style={{
                opacity: isPaused ? 1 : 0.1
              }}
            >
              <SvgXml
                width={isRecording ? 76 : 44}
                height={isRecording ? 76 : 44}
                xml={recordSvg}
              />
            </View>
          </Draggable>
        </View>}
    </View>
  );
};