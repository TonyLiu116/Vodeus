import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
} from 'react-native';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { LinearTextGradient } from 'react-native-text-gradient';
import Draggable from 'react-native-draggable';
import { useTranslation } from 'react-i18next';
import Svg, { SvgXml } from 'react-native-svg';

import '../../language/i18n';
import { Avatars } from '../../config/config';
import { windowHeight, windowWidth } from '../../config/config';
import { recorderPlayer } from '../Home/AudioRecorderPlayer';
import { TitleText } from '../component/TitleText';
import { Warning } from '../component/Warning';
import { DescriptionText } from '../component/DescriptionText';
import { SemiBoldText } from '../component/SemiBoldText';
import { setVoiceState } from '../../store/actions';

import cancelSvg from '../../assets/record/cancel.svg';
import closeSvg from '../../assets/record/closePurple.svg';
import publicSvg from '../../assets/record/public.svg';
import fingerSvg from '../../assets/record/finger.svg';
import recordSvg from '../../assets/common/bottomIcons/record.svg';
import uploadFileSvg from '../../assets/record/uploadFile.svg';

const RecordBoardScreen = (props) => {
  let expandKey = 0;
  const voiceTitle = props.navigation.state.params.title;
  const imgSource = props.navigation.state.params.source;
  const storyAddress = props.navigation.state.params.address;

  let { user, voiceState, refreshState } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const [fill, setFill] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [key, setKey] = useState(0);
  const [hoverState, setHoverState] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [expand, setExpand] = useState(0);
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
        setTemporary(false);
        clearRecorder();
        props.navigation.navigate('PostingVoice', { recordSecs: Math.ceil(tp / 1000.0), isTemporary: temporary, title: voiceTitle, source: imgSource, address: storyAddress })
      }
      else {
        clearRecorder();
        props.navigation.goBack()
      }
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

  const onTimeEnd = () => {
    onStopRecord(true);
  }

  let r = 0;

  useEffect(() => {
    setFill(user.premium != 'none' ? 60 : 30);
    setKey(prevKey => prevKey + 1);
    if (expandKey != expand) {
      setExpand(expandKey);
      setTemporary(true);
    }
    //dispatch(setVoiceState(voiceState+1));
    return () => clearRecorder();
  }, [expandKey])

  return (
    <Pressable
      style={{
        width: windowWidth,
        height: windowHeight,
        elevation: 11
      }}
    // onPress={() => onStopRecord(false)}
    >
      <View
        style={{
          backgroundColor: '#FFF',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          alignItems: 'center'
        }}
      >
        <View style={{ width: '100%' }}>
          <TouchableOpacity style={{ marginTop: Platform.OS == 'ios' ? 50 : 20, marginLeft: 21 }} onPress={() => props.navigation.goBack()}>
            <SvgXml width={14} height={14} xml={closeSvg} />
          </TouchableOpacity>
        </View>
        <Text style={{
          fontWeight: "400",
          fontSize: 34,
          lineHeight: 41,
          color: "#361252",
          marginTop: windowHeight / 812 * 18
        }}>{voiceTitle}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: windowHeight / 812 * 25, marginBottom: windowHeight / 812 * 30 }}>
          <Text style={{
            fontWeight: "400",
            fontSize: 17,
            lineHeight: 28,
            color: "#3B1F5240"
          }}>{storyAddress ? storyAddress.description : ''}</Text>
        </View>
        <View
          style={{
            marginBottom: windowHeight / 812 * 24
          }}
        >
          <CountdownCircleTimer
            key={key}
            isPlaying={!isPaused}
            duration={fill}
            size={246}
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
                  resizeMode="stretch"
                  style={{ width: 189, height: 189, alignItems: 'center' }}
                  imageStyle={{ borderRadius: 100 }}
                >
                  <View style={{
                    width: '100%',
                    height: '100%',
                    borderRadius:100,
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
        {/* <View style={{ flexDirection: "column", alignItems: "center", marginBottom: windowHeight / 812 * 17 }}>
          <SvgXml width={18} height={18} xml={uploadFileSvg} />
          <Text style={{ marginTop: 6, fontWeight: "400", fontSize: 12, lineHeight: 16, color: "rgba(54, 18, 82, 0.3)" }}>{t('Or upload an audio file')}</Text>
        </View> */}
        <Warning
          text={t("Hate, racism, sexism or any kind of violence is stricly prohibited")}
        />
        <View style={{
          alignItems: 'center'
        }}>
          <SvgXml
            xml={fingerSvg}
          />
          <DescriptionText
            text={t("Swipe to the right to publish, to the left to cancel")}
            fontSize={9}
            marginBottom={34}
            color="#000000"
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
      <View style={{ position: 'absolute', bottom: '6%', width: 76, height: 76 }}>
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
      </View>
    </Pressable>
  );
};

export default RecordBoardScreen;