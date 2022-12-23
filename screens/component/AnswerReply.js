
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  ImageBackground,
  Platform,
  TouchableOpacity,
  Vibration,
  Modal,
  Pressable
} from 'react-native';

import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';

import * as Progress from "react-native-progress";
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { recorderPlayer } from '../Home/AudioRecorderPlayer';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import RNFetchBlob from 'rn-fetch-blob';
import Draggable from 'react-native-draggable';
import { windowHeight, windowWidth } from '../../config/config';
import { DescriptionText } from './DescriptionText';
import VoicePlayer from '../Home/VoicePlayer';
import VoiceService from '../../services/VoiceService';
import redCancelSvg from '../../assets/post/close.svg';
import publishBlankSvg from '../../assets/post/post.svg';
import { useDispatch, useSelector } from 'react-redux';
import { setVoiceState } from '../../store/actions';
import { useTranslation } from 'react-i18next';
import { styles } from '../style/Common';
import '../../language/i18n';

import recordSvg from '../../assets/common/bottomIcons/record.svg';
import redTrashSvg from '../../assets/common/red_trash.svg';
import { SvgXml } from 'react-native-svg';

export const AnswerReply = ({
  info,
  onCancel = () => { },
  onPushReply = () => { }
}) => {

  let { user, voiceState } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const [fill, setFill] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isPublish, setIsPublish] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [duration, setDuration] = useState(0);
  const [key, setKey] = useState(0);

  const mounted = useRef(false);

  const wasteTime = useRef(0);
  const dragPos = useRef(0);

  recorderPlayer.setSubscriptionDuration(0.2); // optional. Default is 0.1

  const dirs = RNFetchBlob.fs.dirs;

  const path = Platform.select({
    ios: `${dirs.CacheDir}/hello.m4a`,
    android: `${dirs.CacheDir}/hello.mp3`,
  });

  const clearRecorder = async () => {
    wasteTime.current = 0;
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

  const closeModal = () => {
    setShowModal(false);
    onCancel();
  }

  useEffect(() => {
    mounted.current = true;
    setFill(user.premium == 'none' ? 30 : 60);
    setKey(prevKey => prevKey + 1);
    return () => {
      mounted.current = false;
      clearRecorder();
    }
  }, [])

  const onStartRecord = async () => {
    if (isRecording == false) {
      setIsRecording(true);
      setIsPaused(false);
      dragPos.current = 0;
      const dirs = RNFetchBlob.fs.dirs;
      const path = Platform.select({
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
      await recorderPlayer.startRecorder(path, audioSet).then(res => {
      })
        .catch(err => {
          console.log(err);
        });
      recorderPlayer.addRecordBackListener((e) => {
        wasteTime.current = e.currentPosition;
        if (e.currentPosition >= fill * 1000) {
          onStopRecord(true);
        }
      });
    }
  };

  const onStopRecord = async (publish) => {
    setIsRecording(false);
    setIsPaused(true);
    if (publish == true) {
      setDuration(wasteTime.current);
      clearRecorder();
      setIsPublish(true);
    }
    if (publish == false) {
      closeModal();
    }
  };

  const onChangeRecord = async (e, v = false) => {
    if (v == true) {
      Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    }
    if (v == true && isRecording == false) {
      onStartRecord();
    }
    else {
      if (v == true && isPaused) {
        await recorderPlayer.resumeRecorder().then(res => {
        })
          .catch(err => {
            console.log(err);
          });
        setIsPaused(false);
      }
      else if (v == false && isRecording == true) {
        if (Math.abs(dragPos.current) < 80) {
          setIsPaused(true);
          await recorderPlayer.pauseRecorder().then(res => {
          })
            .catch(err => {
              console.log(err);
              onStopRecord(false);
            });
        }
      }
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    if (path) {
      let tp = Math.max(wasteTime.current, 1);
      let voiceFile = [
        { name: 'duration', data: String(Math.ceil(tp / 1000.0)) },
        { name: 'record', data: info.id },
        { name: 'file', filename: Platform.OS === 'android' ? 'answer.mp3' : 'answer.m4a', data: RNFetchBlob.wrap(String(path)) },
      ];
      VoiceService.postAnswerReply(voiceFile, info.user.id).then(async res => {
        const jsonRes = await res.json();
        if (res.respInfo.status !== 201) {
        } else if (mounted.current) {
          Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
          onPushReply();
          closeModal();
        }
        setIsLoading(false);
      })
        .catch(err => {
          console.log(err);
        });
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        closeModal();
      }}
    >
      <Pressable onPressOut={closeModal} style={[styles.swipeModal, { backgroundColor: 'rgba(0, 0, 0, 0.1)' }]}>
        <>
          {isPublish ?
            <View style={{
              position: 'absolute',
              width: windowWidth,
              bottom: 50,
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
                  waveColor={info.user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
                  playing={false}
                  stopPlay={() => { }}
                  startPlay={() => { }}
                  tinWidth={windowWidth / 300}
                  mrg={windowWidth / 600}
                  duration={duration}
                />
                <TouchableOpacity onPress={() => closeModal()}>
                  <SvgXml
                    width={24}
                    height={24}
                    xml={redTrashSvg}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity disabled={isLoading} onPress={handleSubmit}>
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
            : <>
              <ImageBackground
                style={{
                  position: 'absolute',
                  bottom: 50,
                  height: 56,
                  width: 281.22,
                  right: (windowWidth - 281.22) / 2,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 20
                }}
                resizeMode="stretch"
                source={require('../../assets/post/answerReply.png')}
              >
                <View style={styles.rowAlignItems}>
                  <SvgXml
                    width={16}
                    height={16}
                    xml={redCancelSvg}
                  />
                  <DescriptionText
                    text={t("Cancel")}
                    fontSize={13}
                    lineHeight={21}
                    color="#E41717"
                    marginLeft={8}
                  />
                </View>
                <View style={styles.rowAlignItems}>
                  <DescriptionText
                    text={t("Publish")}
                    fontSize={13}
                    lineHeight={21}
                    color="#8327D8"
                    marginRight={8}
                  />
                  <SvgXml
                    width={18}
                    height={18}
                    xml={publishBlankSvg}
                  />
                </View>
              </ImageBackground>
              <View style={{ position: 'absolute', bottom: 135, width: '100%', alignItems: 'center' }}>
                <Draggable
                  key={key}
                  x={windowWidth / 2 - 34}
                  y={0}
                  shouldReverse={true}
                  minX={windowWidth / 2 - 110}
                  maxX={windowWidth / 2 + 110}
                  minY={0}
                  maxY={0}
                  touchableOpacityProps={{
                    activeOpactiy: 0.1,
                  }}
                  onDrag={(event, gestureState) => {
                  }}
                  onDragRelease={(event, gestureState, bounds) => {
                    dragPos.current = gestureState.dx;
                    if (gestureState.dx > 80) {
                      setTimeout(() => {
                        Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                      }, 100);
                      onStopRecord(true);
                    }
                    else if (gestureState.dx < -80) {
                      Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                      setTimeout(() => {
                        Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                      }, 300);
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
                      width={68}
                      height={68}
                      xml={recordSvg}
                    />
                  </View>
                </Draggable>
              </View>
              <View style={{
                position: 'absolute',
                bottom: 160,
                right: (windowWidth - 105) / 2,
                width: 105,
                height: 48,
                backgroundColor: "#FFF",
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
              }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#E41717"
                  }}
                >
                </View>
                <CountdownCircleTimer
                  key={key}
                  isPlaying={!isPaused}
                  duration={fill}
                  size={70}
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
              </View>
            </>}
          {isLoading &&
            <Progress.Circle
              indeterminate
              size={30}
              color="rgba(0, 0, 255, .7)"
              style={{ alignSelf: "center", marginTop: windowHeight / 2 }}
            />}
        </>
      </Pressable>
    </Modal>
  );
};