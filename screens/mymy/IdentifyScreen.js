import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TitleText } from '../component/TitleText';
import { MyButton } from '../component/MyButton';
import { MyProgressBar } from '../component/MyProgressBar';
import { MyIdentify } from '../component/MyIdentify';
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import manSvg from '../../assets/login/man.svg';
import womanSvg from '../../assets/login/woman.svg';
import moreSvg from '../../assets/login/more.svg';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/actions/index';
import { styles } from '../style/Login';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';

const IdentifyScreen = (props) => {

  const { t, i18n } = useTranslation();

  const [identify, setIdentify] = useState('');

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const handleSubmit = () => {
    if (!identify) {
      return;
    }
    let userData = { ...user };
    userData.gender = identify;
    dispatch(setUser(userData));
    props.navigation.navigate("Country");
  }

  useEffect(() => {
  }, [])

  return (
    <SafeAreaView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <View
        style={[
          { marginTop: 20, paddingHorizontal: 20, marginBottom: 20, height: 30 },
          styles.rowSpaceBetween
        ]}
      >
        <TouchableOpacity
          onPress={() => props.navigation.goBack()}
        >
          <SvgXml
            width="24"
            height="24"
            xml={arrowBendUpLeft}
          />
        </TouchableOpacity>
        <MyProgressBar
          progress={3}
        />
        <TouchableOpacity
          onPress={handleSubmit}
        >
          <Text
            style={{
              textAlign: 'center',
              color: '#8327D8',
              fontSize: 15,
            }}>{t("Next")}</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{ marginTop: 20, paddingHorizontal: 20 }}
      >
        <TitleText
          text={t("How do you identify?")}
          fontSize={22}
          textAlign="center"
        />
      </View>
      <View
        style={{
          marginTop: 35,
          paddingHorizontal: 16,
        }}
      >
        <MyIdentify
          label={t("Woman")}
          active={identify == "f" ? true : false}
          genderSvg={womanSvg}
          onPress={() => setIdentify('f')}
        />
        <MyIdentify
          label={t("Man")}
          active={identify == "m" ? true : false}
          marginTop={16}
          genderSvg={manSvg}
          onPress={() => setIdentify('m')}
        />
        <MyIdentify
          label={t("Other")}
          active={identify == "other" ? true : false}
          marginTop={16}
          genderSvg={moreSvg}
          onPress={() => setIdentify('other')}
        />
      </View>
      <View
        style={{
          paddingHorizontal: 16,
          position: 'absolute',
          width: '100%',
          bottom: 30
        }}
      >
        <MyButton
          label={t("Next")}
          onPress={handleSubmit}
          active={identify ? true : false}
        />
      </View>
    </SafeAreaView>
  );
};

export default IdentifyScreen;