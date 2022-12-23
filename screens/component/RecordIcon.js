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
} from 'react-native';

import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';

import RNVibrationFeedback from 'react-native-vibration-feedback';
import '../../language/i18n';
import recordSvg from '../../assets/common/bottomIcons/record.svg';
import { SvgXml } from 'react-native-svg';
import { DailyPopUp } from './DailyPopUp';

export const RecordIcon = ({
  props,
  dem = 54,
  bottom,
  left,
}) => {

  const [dailyPop, setDailyPop] = useState(false);

  return (
    <Pressable
      style={{
        position: 'absolute',
        bottom: bottom,
        left: left,
        width: dem,
        height: dem,
        elevation: 11
      }}
      onPress={() => {
        setDailyPop(true);
      }}
    >
      <SvgXml
        width={54}
        height={54}
        xml={recordSvg}
      />
      {dailyPop && <DailyPopUp
        props={props}
        onCloseModal={() => setDailyPop(false)}
      />}
    </Pressable>
  );
};