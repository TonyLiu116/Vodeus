import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Pressable,
  Platform,
  Vibration
} from 'react-native';

import RNFetchBlob from 'rn-fetch-blob';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { NavigationActions, StackActions } from 'react-navigation';
import { TitleText } from '../component/TitleText';
import { ShareHint } from '../component/ShareHint';
import { ShareVoice } from '../component/ShareVoice';
import { MyButton } from '../component/MyButton';
import { ReactionEmojies } from '../component/ReactionEmojies';
import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { POST_CHECK, windowWidth, } from '../../config/config';
import VoiceService from '../../services/VoiceService';
import VoicePlayer from '../Home/VoicePlayer';
import { setRefreshState } from '../../store/actions';
import { useSelector, useDispatch } from 'react-redux';
import RNVibrationFeedback from 'react-native-vibration-feedback';

const PostingAnswerVoiceScreen = (props) => {

  let recordId = props.navigation.state.params.id;

  let { user, refreshState } = useSelector((state) => {
    return (
      state.user
    )
  });

  const { t, i18n } = useTranslation();

  const [displayDuration, setDisplayDuration] = useState(props.navigation.state.params?.recordSecs ? props.navigation.state.params?.recordSecs : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [icon, setIcon] = useState("😁");
  const [visibleReaction, setVisibleReaction] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const mounted = useRef(false);

  const dispatch = useDispatch();

  const dirs = RNFetchBlob.fs.dirs;

  const path = Platform.select({
    ios: `${dirs.CacheDir}/hello.m4a`,
    android: `${dirs.CacheDir}/hello.mp3`,
  });

  const selectIcon = (icon) => {
    setIcon(icon);
    setVisibleReaction(false);
  }

  const handleSubmit = async () => {
    const post_check = await AsyncStorage.getItem(POST_CHECK);
    if (!post_check) {
      setShowHint(true);
      return;
    }
    setIsLoading(true);
    if (path) {
      let voiceFile = [
        { name: 'duration', data: String(displayDuration) },
        { name: 'record', data: recordId },
        { name: 'emoji', data: String(icon) },
        { name: 'file', filename: Platform.OS === 'android' ? 'answer.mp3' : 'answer.m4a', data: RNFetchBlob.wrap(String(path)) },
      ];
      VoiceService.postAnswerVoice(voiceFile).then(async res => {
        const jsonRes = await res.json();
        if (res.respInfo.status !== 201) {
        } else {
          Platform.OS =='ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
          dispatch(setRefreshState(!refreshState));
          props.navigation.navigate("VoiceProfile", { id: recordId });
        }
        if(mounted.current)
          setIsLoading(false);
      })
        .catch(err => {
          console.log(err);
        });
    }
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    }
  }, [])
  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1,
      }}
    >
      <View style={{ width: windowWidth }}>
        <View style={{ marginTop: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
          <Pressable style={{
            marginLeft: 16,
            position: 'absolute',
            left: 0
          }} onPress={() => props.navigation.goBack()}>
            <SvgXml width="24" height="24" xml={closeBlackSvg} />
          </Pressable>

          <TitleText
            text={t("Your answer")}
            fontSize={20}
            lineHeight={24}
          />
        </View>
      </View>
      <View style={{ alignItems: 'center', marginTop: 150 }}>
        <TitleText
          text={`${t("Duration")}: ${displayDuration} ${t("seconds")}`}
          fontFamily="SFProDisplay-Regular"
          fontSize={15}
          lineHeight={24}
          marginTop={7}
          color="rgba(54, 36, 68, 0.8)"
        />
      </View>
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 16,
          backgroundColor: '#FFF',
          shadowColor: 'rgba(176, 148, 235, 1)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 10,
          borderRadius: 16,
          marginHorizontal: 20,
          marginTop: 30
        }}
      >
        <VoicePlayer
          playBtn={true}
          replayBtn={true}
          waveColor={user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
          playing={false}
          stopPlay={() => { }}
          startPlay={() => { }}
          duration={displayDuration * 1000}
        />
      </View>
      <View
        style={{
          paddingHorizontal: 16,
          width: '100%',
          position: 'absolute',
          bottom: 40
        }}
      >
        <MyButton
          label={t("Post my answer")}
          loading={isLoading}
          onPress={handleSubmit}
        />
      </View>
      {visibleReaction &&
        <ReactionEmojies
          onSelectIcon={(icon) => selectIcon(icon)}
          onCloseModal={() => setVisibleReaction(false)}
        />}
      {showHint &&
        <ShareHint
          onCloseModal={() => { setShowHint(false); handleSubmit(); }}
        />}
    </KeyboardAvoidingView>
  );
};

export default PostingAnswerVoiceScreen;