import React, { useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { TitleText } from '../component/TitleText';
import { ConfirmVerify } from '../component/ConfirmVerify';
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationActions, StackActions } from 'react-navigation';
import { ACCESSTOKEN_KEY } from '../../config/config';
import { styles } from '../style/Login';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { setSocketInstance, setUser } from '../../store/actions';

const VerifyScreen = (props) => {

  let { socketInstance } = useSelector((state) => {
    return (
      state.user
    )
  });

  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const onNavigate = (des, par = null) => {
    const resetActionTrue = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: des, params: par })],
    });
    props.navigation.dispatch(resetActionTrue);
  }

  const sendLogOut = async () => {
    await AsyncStorage.removeItem(
      ACCESSTOKEN_KEY
    );
    socketInstance.disconnect();
    dispatch(setSocketInstance(null));
    onNavigate("Welcome")
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
          styles.rowJustifyCenter
        ]}
      >
        <TouchableOpacity
          onPress={() => sendLogOut()}
          style={{
            position: 'absolute',
            left: 20
          }}
        >
          <SvgXml
            width="24"
            height="24"
            xml={arrowBendUpLeft}
          />
        </TouchableOpacity>
        <TitleText
          text={t("Verify it's you")}
          fontSize={20}
          color="#281E30"
        />
      </View>
      <ConfirmVerify
        marginTop={20}
        onSuccess={() => props.navigation.navigate('Username')}
      />
    </SafeAreaView>
  );
};

export default VerifyScreen;