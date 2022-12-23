import React, { useState, useEffect, useRef } from 'react';
import { View, ImageBackground, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import io from "socket.io-client";
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MyButton } from '../component/MyButton';
import { MyTextField } from '../component/MyTextField';

import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import appleSvg from '../../assets/login/apple.svg';
import googleSvg from '../../assets/login/google.svg';
import { v4 as uuid } from 'uuid'
import AuthService from '../../services/AuthService';

import { useSelector, useDispatch } from 'react-redux';
import { setSocketInstance, setUser } from '../../store/actions';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCESSTOKEN_KEY, REFRESHTOKEN_KEY, TUTORIAL_CHECK, SOCKET_URL } from '../../config/config';
import { styles } from '../style/Login';
import { ScrollView } from 'react-native-gesture-handler';

const RegisterScreen = (props) => {

  const emailRef = useRef();
  const passwordRef = useRef();
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);

  const { t, i18n } = useTranslation();

  const { socketInstance } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const scrollRef = useRef(ScrollView);

  const _storeData = async (aToken, rToken) => {
    try {
      await AsyncStorage.setItem(
        ACCESSTOKEN_KEY,
        aToken
      );
    } catch (err) {
      console.log(err);
    }

    try {
      await AsyncStorage.setItem(
        REFRESHTOKEN_KEY,
        rToken
      );
    } catch (err) {
      console.log(err);
    }
  };

  const scrollPage = (sp) => {
    if (sp.nativeEvent.contentOffset.y > 30) {
      setShowHeaderTitle(true);
    } else {
      setShowHeaderTitle(false);
    }
  }

  const handleSubmit = () => {
    setError({});
    if (email == '') {
      setError({
        email: t("required field"),
      });
      return;
    }
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(email) === false) {
      setError({ email: t("invalid email address") })
      return;
    }
    if (password == '') {
      setError({ password: t("required field") });
      return;
    }

    if (password.length < 3) {
      setError({
        password: t("at least 3 characters"),
      });
      return;
    }
    const payload = {
      email,
      password
    };
    setLoading(true);
    AuthService.register(payload).then(async res => {
      try {
        const jsonRes = await res.json();
        if (res.respInfo.status === 201) {
          _storeData(jsonRes.accessToken, jsonRes.refreshToken);
          onSetUserInfo(jsonRes.accessToken, jsonRes.refreshToken, true);
        } else {
          setError({
            email: jsonRes.message,
          });
        }
      } catch (err) {
        console.log(err);
      };
      setLoading(false);
    })
      .catch(err => {
        console.log(err);
      });
  }

  const checkEmail = (cEmail) => {
    setEmail(cEmail);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(cEmail) === true) {
      setValidEmail(true);
    } else {
      setValidEmail(false);
    }
  }

  const showEye = () => {
    setSecureTextEntry(!secureTextEntry);
  }

  const onGoScreen = async (jsonRes) => {
    dispatch(setUser(jsonRes));
    let navigateScreen = 'Home';
    if (!jsonRes.id) {
      return;
    }
    if (!jsonRes.isEmailVerified) {
      navigateScreen = 'Verify';
    } else if (!jsonRes.name) {
      navigateScreen = 'Username';
    } else if (!jsonRes.dob) {
      navigateScreen = 'Birthday';
    } else if (!jsonRes.gender) {
      navigateScreen = 'Identify';
    } else if (!jsonRes.country) {
      navigateScreen = 'Country';
    } else if (!jsonRes.avatar) {
      navigateScreen = 'Photo';
    } else {
      const tutorial_check = await AsyncStorage.getItem(TUTORIAL_CHECK);
      if (tutorial_check)
        navigateScreen = 'Home';
      else
        navigateScreen = 'Tutorial';
    }
    const resetActionTrue = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: navigateScreen })],
    });
    props.navigation.dispatch(resetActionTrue);
  }

  const onCreateSocket = (jsonRes, isRegister) => {
    if (socketInstance == null) {
      let socket = io(SOCKET_URL);
      dispatch(setSocketInstance(socket));
      socket.on("connect", () => {
        socket.emit("login", { uid: jsonRes.id, email: jsonRes.email, isNew: isRegister }, (res) => {
          if (res == "Success") {
            onGoScreen(jsonRes);
          }
          else {
            setError({
              email: "User with current email already login"
            });
          }
        });
      })
    }
    else
      onGoScreen(jsonRes);
  }

  const onSetUserInfo = async (accessToken, refreshToken, isRegister = false) => {
    AuthService.getUserInfo(accessToken, 'reg').then(async res => {
      const jsonRes = await res.json();
      if (res.respInfo.status == 200) {
        onCreateSocket(jsonRes, isRegister);
      }
    })
      .catch(err => {
        console.log(err);
      });
  }

  const signIn = async () => {
    try {
      setLoading(true);
      AuthService.googleLogin({ token: tokens.accessToken }).then(async res => {
        const jsonRes = await res.json();
        if (res.respInfo.status === 201) {
          _storeData(jsonRes.accessToken, jsonRes.refreshToken);
          onSetUserInfo(jsonRes.accessToken, jsonRes.refreshToken, jsonRes.isRegister);
        }
        else {
          setError({
            email: jsonRes.message,
          });
        }
        setLoading(false);
      })
        .catch(err => {
          console.log(err);
        })
      //log in is success!
    } catch (error) {
      console.log(error, statusCodes, error.code);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  useEffect(() => {
  }, [])

  return (
    <KeyboardAwareScrollView contentContainerStyle={{ flex: 1 }}>
      <View style={styles.LoginContainer}>
        <ImageBackground
          source={require('../../assets/login/background.png')}
          resizeMode="stretch"
          style={styles.background}
        >
          <View
            style={[
              { marginTop: Platform.OS == 'ios' ? 60 : 20, paddingHorizontal: 20, marginBottom: 20, height: 30 },
              styles.rowJustifyCenter
            ]}
          >
            <TouchableOpacity
              onPress={() => props.navigation.goBack()}
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
            {
              !showHeaderTitle ||
              <TitleText
                text={t("Let's start")}
                fontSize={20}
                color="#281E30"
              />
            }
          </View>
          <ScrollView
            ref={scrollRef}
            onScroll={scrollPage}
          >

            <View
              style={{ marginTop: 0, paddingHorizontal: 20 }}
            >
              <TitleText
                text={t("Let's start")}
                fontSize={34}
              />
              <DescriptionText
                text={t("Raise your voice with us")}
                fontSize={20}
                marginTop={10}
              />
            </View>
            <View
              style={
                {
                  marginTop: 20,
                  padding: 16,
                  backgroundColor: '#FFF',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24
                }
              }
            >
              <TitleText
                text={t("Create an account")}
                fontSize={22}
                marginTop={17}
              />
              <MyTextField
                label={t("Your email")}
                keyboardType="email-address"
                refer={emailRef}
                color='#281E30'
                placeholderText={t("email@example.com")}
                value={email}
                onChangeText={(newVal) => checkEmail(newVal)}
                errorText={error.email}
                check={validEmail}
                marginTop={18}
              />
              <MyTextField
                label={t("Your password")}
                refer={passwordRef}
                secureTextEntry={secureTextEntry}
                color='#281E30'
                placeholderText={t("Enter your password")}
                value={password}
                onChangeText={(newVal) => setPassword(newVal)}
                errorText={error.password}
                showEye={showEye}
                isPassword={true}
              />
              <MyButton
                label={t("Create account")}
                loading={loading}
                onPress={handleSubmit}
              />
              <DescriptionText text={t("or continue with")} fontSize={12} color="#281E30" textAlign="center" marginTop={20} />
              <View style={[styles.rowSpaceBetween, { marginTop: 20 }]}>
                <TouchableOpacity
                  style={styles.externalButton}
                >
                  <SvgXml width="24" height="24" xml={appleSvg} />
                  <Text style={styles.externalButtonText}>Apple</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.externalButton}
                  onPress={() => signIn()}
                >
                  <SvgXml width="24" height="24" xml={googleSvg} />
                  <Text style={styles.externalButtonText}>Google</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.rowJustifyCenter, { marginBottom: 30, marginTop: 32 }]}>
                <DescriptionText
                  text={t("Already have an account?")}
                  color="#281E30"
                  fontSize={15}
                />
                <TouchableOpacity
                  onPress={() => props.navigation.navigate("Login")}
                >
                  <Text style={styles.signupButton}>{t("Sign In!")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default RegisterScreen;