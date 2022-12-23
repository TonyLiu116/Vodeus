import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  Platform,
  Animated,
  Pressable,
  TouchableOpacity,
  Vibration,
  SafeAreaView,
} from 'react-native';

import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';

import { recorderPlayer } from '../Home/AudioRecorderPlayer';
import RNFetchBlob from 'rn-fetch-blob';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import Draggable from 'react-native-draggable';
import { LinearTextGradient } from "react-native-text-gradient";
import { TitleText } from '../component/TitleText';
import { Warning } from '../component/Warning';
import { windowHeight, windowWidth } from '../../config/config';
import cancelSvg from '../../assets/record/cancel.svg';
import publicSvg from '../../assets/record/public.svg';
import fingerSvg from '../../assets/record/finger.svg';
import { DescriptionText } from '../component/DescriptionText';
import { useDispatch, useSelector } from 'react-redux';
import { setVoiceState } from '../../store/actions';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';

import recordSvg from '../../assets/common/bottomIcons/record.svg';
import { SvgXml } from 'react-native-svg';
import { SemiBoldText } from '../component/SemiBoldText';

const HoldRecordScreen = (props) => {

  const param = props.navigation.state.params;
  const imgSource = param?.photoInfo;

  let { user, voiceState, refreshState } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const [fill, setFill] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [key, setKey] = useState(0);
  const [hoverState, setHoverState] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [temporary, setTemporary] = useState(false);

  const wasteTime = useRef(0);
  const dragPos = useRef(0);

  recorderPlayer.setSubscriptionDuration(0.5); // optional. Default is 0.1

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

  const onStartRecord = async () => {
    if (isRecording == false) {
      dragPos.current = 0;
      setIsRecording(true);
      setIsPaused(false);
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
        recorderPlayer.addRecordBackListener((e) => {
          wasteTime.current = e.currentPosition;
        });
      })
        .catch(err => {
          console.log(err);
          clearRecorder();
        });
    }
  };

  const onStopRecord = async (publish) => {
    if (isRecording == true) {
      setIsRecording(false);
      setIsPaused(true);
      setKey(prevKey => prevKey + 1);
      if (publish == true) {
        let tp = Math.max(wasteTime.current, 1);
        props.navigation.navigate('PostingVoice', { recordSecs: Math.ceil(tp / 1000.0),  photoInfo: param?.photoInfo, categoryId: param?.categoryId, createdAt: param.createdAt, isPast: param.isPast })
        setTemporary(false);
        clearRecorder();
      }
      else {
        clearRecorder();
        props.navigation.goBack();
      }
    }
    else {
      props.navigation.goBack();
    }
  };

  const onChangeRecord = async (e, v = false) => {
    if (v == true)
      Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    if (v == true && isRecording == false) {
      onStartRecord();
    }
    else {
      if (v == true && isPaused) {
        await recorderPlayer.resumeRecorder().then(res => {
        })
          .catch(err => {
            console.log(err);
          });;
        setIsPaused(false);
      }
      else if (v == false && isRecording == true) {
        let delta = Math.abs(dragPos.current);
        if (delta < 80) {
          setIsPaused(true);
          setIsRecording(true);
          await recorderPlayer.pauseRecorder().then(res => {
            onStopRecord(true);
          })
            .catch(err => {
              console.log(err);
            });

        }
      }
    }
  }

  const onTimeEnd = () => {
    onStopRecord(true);
  }

  let r = 0;

  useEffect(() => {
    setFill(user.premium != 'none' ? 60 : 30);
    setKey(prevKey => prevKey + 1);
    return () => clearRecorder();
  }, [])

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFF'
      }}
    >
      <View
        style={{
          backgroundColor: '#FFF',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          paddingTop: 55
        }}
      >
        <TitleText
          text={t("Click & hold to record")}
          fontSize={20}
          color="#281E30"
        />
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            width: 295,
            backgroundColor: '#FFF7E8',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: '#FFBB02',
            shadowColor: '#FFB800',
            elevation: 10,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
            marginBottom: 30
          }}
        >
          <SemiBoldText
            text={user.premium != 'none' ? t("You are a premium member and you have up to three minutes of recording!") : t("Go to Premium and have 3 minutes instead of one for each record.")}
            color='#F09E00'
            fontSize={15}
            lineHeight={24}
            textAlign='center'
          />
        </View>
        <View
          style={{
            marginBottom: 20
          }}
        >
          <CountdownCircleTimer
            key={key}
            isPlaying={!isPaused}
            duration={fill}
            size={250}
            strokeWidth={5}
            trailColor="#D4C9DE"
            trailStrokeWidth={1}
            onComplete={onTimeEnd}
            colors={[
              ['#B35CF8', 0.4],
              ['#8229F4', 0.4],
              ['#8229F4', 0.2],
            ]}
          >
            {({ remainingTime, animatedColor }) => {
              return (
                <ImageBackground
                  source={imgSource ? { uri: imgSource.path } : user.avatar ? { uri: user.avatar.url } : Avatars[user.avatarNumber].uri}
                  resizeMode="cover"
                  style={{ width: 189, height: 189 }}
                  imageStyle={{ borderRadius: 100 }}
                >
                  <View style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 100,
                    alignItems: 'center',
                    backgroundColor: "#00000050"
                  }}>
                    <DescriptionText
                      text={t("seconds")}
                      color="rgba(255, 255, 255, 1)"
                      fontSize={20}
                      marginTop={32}
                    />
                    <LinearTextGradient
                      style={{ fontSize: 67, marginTop: 0 }}
                      locations={[0, 1]}
                      colors={["#FFFFFF", "#FFFFFF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    >
                      <Animated.Text style={{ color: '#FFF', fontFamily: "SFProDisplay-Semibold" }}>
                        {fill - Math.floor(wasteTime.current / 1000)}
                      </Animated.Text>
                    </LinearTextGradient>
                  </View>
                </ImageBackground>
              )
            }}
          </CountdownCircleTimer>
        </View>
        <Warning
          text={t("Hate, racism, sexism or any kind of violence is stricly prohibited")}
        />
        <View style={{
          alignItems: 'center'
        }}>
          <Image
            source={require("../../assets/record/finger.png")}
            style={{
              width: 32,
              height: 32
            }}
          />
          <SemiBoldText
            text={t("Click & Hold to record. Swipe to the right to publish, to the left to cancel")}
            fontSize={12}
            lineHeight={16}
            color='#000000'
            marginTop={5}
            marginBottom={34}
          />
          <ImageBackground
            source={require('../../assets/record/RecordControl.png')}
            resizeMode="stretch"
            style={{ width: 311, height: 76, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12%' }}
          >
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 18 }}
              onPress={() => onStopRecord(false)}
            >
              <SvgXml width={20} height={16 - (hoverState < 0 ? r * 4 : 0)} xml={cancelSvg} />
              <TitleText
                text={t("Cancel")}
                fontFamily="SFProDisplay-Regular"
                fontSize={16}
                marginLeft={8}
                lineHeight={21}
                color="#E41717"
              />
            </TouchableOpacity>
            <View style={{ width: 76, height: 76 }}>
              <Draggable
                key={key}
                x={0}
                y={0}
                shouldReverse={true}
                minX={-82}
                maxX={174}
                minY={0}
                maxY={0}
                touchableOpacityProps={{
                  // activeOpactiy: 1,
                }}
                onDrag={(event, gestureState) => {

                }}
                onDragRelease={(event, gestureState, bounds) => {
                  dragPos.current = gestureState.dx;
                  if (gestureState.dx > 80) {
                    setTimeout(() => {
                      Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                    }, 100);
                    onStopRecord(true);
                  }
                  else if (gestureState.dx < -80) {
                    Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                    setTimeout(() => {
                      Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
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
                    width={76}
                    height={76}
                    xml={recordSvg}
                  />
                </View>
              </Draggable>
            </View>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 18 }}
              onPress={() => onStopRecord(true)}
            >
              <TitleText
                text={t("Publish")}
                fontFamily="SFProDisplay-Regular"
                fontSize={16}
                marginRight={8}
                lineHeight={21}
                color="#8327D8"
              />
              <SvgXml width={20} height={16 + (hoverState > 0 ? hoverState * 4 : 0)} xml={publicSvg} />
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </View>
      {/* <View style={{ position: 'absolute', bottom: '6%', width: 76, height: 76 }}>
        <Draggable
          key={key}
          x={windowWidth / 2 - 38}
          y={0}
          shouldReverse={true}
          minX={windowWidth / 2 - 120}
          maxX={windowWidth / 2 + 136}
          minY={0}
          maxY={0}
          touchableOpacityProps={{
            // activeOpactiy: 1,
          }}
          onDrag={(event, gestureState) => {

          }}
          onDragRelease={(event, gestureState, bounds) => {
            dragPos.current = gestureState.dx;
            if (gestureState.dx > 80) {
              setTimeout(() => {
                Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
              }, 100);
              onStopRecord(true);
            }
            else if (gestureState.dx < -80) {
              Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
              setTimeout(() => {
                Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
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
              width={76}
              height={76}
              xml={recordSvg}
            />
          </View>
        </Draggable>
      </View> */}
    </View>
  );
};

export default HoldRecordScreen;