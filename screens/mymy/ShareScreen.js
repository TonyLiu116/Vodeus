import React, { useState, useEffect } from 'react';
import {
  View,
  ImageBackground,
  KeyboardAvoidingView,
  TouchableOpacity
} from 'react-native';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from '../component/MyButton';
import { ShareVoice } from '../component/ShareVoice';
import { SvgXml } from 'react-native-svg';
import shareTextSvg from '../../assets/post/ShareText.svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SHARE_CHECK } from '../../config/config';
import { styles } from '../style/Login';

const ShareScreen = (props) => {

  let info = props.navigation.state.params.info;

  const { t, i18n } = useTranslation();

  const OnShareVoice = async () => {
    await AsyncStorage.setItem(
      SHARE_CHECK,
      "checked"
    );
    setShowShareVoice(true);
  }

  useEffect(() => {

  }, [])

  const [showShareVoice, setShowShareVoice] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <ImageBackground
        source={require('../../assets/post/background.jpg')}
        resizeMode="stretch"
        style={styles.background}
      >
        <View style={{ marginTop: Platform.OS == 'ios' ? 60 : 35, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
          <TouchableOpacity onPress={() => props.navigation.goBack()}>
            <SvgXml width="24" height="24" xml={closeBlackSvg} />
          </TouchableOpacity>
        </View>
        <View style={{ position: 'absolute', width: '100%', bottom: 68, flex: 1, alignItems: 'center' }}>
          {/* <SvgXml
            xml={shareTextSvg}
            height={28}
          /> */}
          <DescriptionText
            fontSize={22}
            lineHeight={28}
            color='#281E30'
            text={t("Make your friends discover Vocco !")}
            marginTop={10}
          />
          <DescriptionText
            fontSize={15}
            lineHeight={24}
            color='rgba(54, 36, 68, 0.8)'
            text={t("And make they know about the best stories")}
            marginTop={10}
          />
          <View style={{ width: '100%', paddingHorizontal: 16 }}>
            <MyButton
              marginTop={51}
              label={t("Share")}
              onPress={() => OnShareVoice()}
            />
          </View>
        </View>
      </ImageBackground>
      {showShareVoice &&
        <ShareVoice
          info={info}
          onCloseModal={() => setShowShareVoice(false)}
        />
      }
    </KeyboardAvoidingView>
  );
};

export default ShareScreen;