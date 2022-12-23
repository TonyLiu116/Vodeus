import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, TouchableOpacity, Platform, Text, Keyboard, TouchableWithoutFeedback, NativeModules } from 'react-native';
import * as Progress from "react-native-progress";
import { NavigationActions, StackActions } from 'react-navigation';
import { SvgXml } from 'react-native-svg';
import io from "socket.io-client";
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import errorSvg from '../../assets/phoneNumber/error.svg';
import rightArrowSvg from '../../assets/phoneNumber/right-arrow.svg';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import '../../language/i18n';

import { MyProgressBar } from '../component/MyProgressBar';
import { windowWidth, windowHeight, OPEN_COUNT, MAIN_LANGUAGE } from '../../config/config';
import { TextInput } from 'react-native-gesture-handler';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import AuthService from '../../services/AuthService';
import { setSocketInstance, setUser } from '../../store/actions';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACCESSTOKEN_KEY, REFRESHTOKEN_KEY, TUTORIAL_CHECK, SOCKET_URL } from '../../config/config';
import { styles } from '../style/Login';
import { useDispatch, useSelector } from 'react-redux';
import EditService from '../../services/EditService';

const PhoneVerifyScreen = (props) => {

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const mounted = useRef(false);

    const phoneNumber = props.navigation.state.params?.number;
    const country = props.navigation.state.params?.country;
    const type = props.navigation.state.params?.type;

    const { user, socketInstance } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const deviceLanguage =
        Platform.OS === 'ios'
            ? NativeModules.SettingsManager.settings.AppleLocale ||
            NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
            : NativeModules.I18nManager.localeIdentifier;

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

    const resendCode = () => {
        const payload = {
            phoneNumber: phoneNumber
        };
        if (type == 'register')
            AuthService.phoneRegister(payload).then(async res => {
                if (mounted.current) {
                    const jsonRes = await res.json();
                    if (res.respInfo.status === 201) {
                    }
                    else {
                        setError(jsonRes.message);
                    }
                }
            })
        else
            AuthService.phoneLogin(payload).then(async res => {
                if (mounted.current) {
                    const jsonRes = await res.json();
                    if (res.respInfo.status === 201) {
                    }
                    else {
                        setError(jsonRes.message);
                    }
                }
            })
    }

    const onGoScreen = async (jsonRes, prevOpenCount) => {
        if (!mounted.current)
            return;
        let openCount = await AsyncStorage.getItem(OPEN_COUNT);
        if (openCount != prevOpenCount)
            return;
        if (prevOpenCount == null)
            openCount = "1";
        else
            openCount = (Number(prevOpenCount) + 1).toString();
        await AsyncStorage.setItem(
            OPEN_COUNT,
            openCount
        );
        jsonRes.country = country;
        dispatch(setUser(jsonRes));
        let navigateScreen = 'Home';
        if (!jsonRes.id) {
            return;
        }
        if (!jsonRes.firstname) {
            navigateScreen = 'MainName';
        }
        else if (!jsonRes.firstname) {
            navigateScreen = 'MainName';
        }
        else if (!jsonRes.name) {
            navigateScreen = 'PickName';
        } else if (!jsonRes.dob) {
            navigateScreen = 'InputBirthday';
        } else if (!jsonRes.gender) {
            navigateScreen = 'SelectIdentify';
            // } else if (!jsonRes.avatar&&!jsonRes.avatarId) {
            //     navigateScreen = 'ProfilePicture';
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

    const onCreateSocket = async (jsonRes, isRegister) => {
        dispatch(setUser(jsonRes));
        let open_count = await AsyncStorage.getItem(OPEN_COUNT);
        if (socketInstance == null) {
            let socket = io(SOCKET_URL);
             socket.on("connect", () => {
                socket.emit("login", { uid: jsonRes.id, email: jsonRes.phoneNumber, isNew: isRegister }, (res) => {
                    if (res == "Success") {
                        dispatch(setSocketInstance(socket));
                        onGoScreen(jsonRes, open_count);
                    }
                    else {
                        setError("User with current phone number already login");
                    }
                });
             })
        }
        else
            onGoScreen(jsonRes, open_count);

        // let socket = io(SOCKET_URL);
        // dispatch(setSocketInstance(socket));
        // onGoScreen(jsonRes, open_count);
    }

    const onSetUserInfo = async (accessToken, refreshToken, isRegister = false) => {
        AuthService.getUserInfo(accessToken, 'reg').then(async res => {
            const jsonRes = await res.json();
            if (res.respInfo.status == 200 && mounted.current) {
                onCreateSocket(jsonRes, isRegister);
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    const confirmCode = () => {
        const payload = {
            phoneNumber: phoneNumber,
            verificationCode: pseudo,
        };
        setLoading(true);
        AuthService.confirmPhoneVerify(payload).then(async res => {
            const jsonRes = await res.json();
            if (mounted.current) {
                if (res.respInfo.status === 201) {
                    _storeData(jsonRes.accessToken, jsonRes.refreshToken);
                    onSetUserInfo(jsonRes.accessToken, jsonRes.refreshToken, jsonRes.isRegister);
                }
                else {
                    setError(jsonRes.message);
                }
                setLoading(false);
            }
        })
    }

    const [pseudo, setPseudo] = useState('');

    const { t, i18n } = useTranslation();

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        }
    }, [])

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <ImageBackground
                source={require('../../assets/phoneNumber/background.png')}
                resizeMode="cover"
                style={styles.background}
            >
                <View
                    style={[
                        { marginTop: Platform.OS == 'ios' ? 50 : 20, paddingHorizontal: 12, marginBottom: 47, height: 30 },
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
                </View>
                <TitleText
                    text={t("What's the code ?")}
                    textAlign='center'
                />
                <DescriptionText
                    text={t("I sent a code to ") + phoneNumber.toString()}
                    fontSize={15}
                    lineHeight={24}
                    textAlign='center'
                    marginTop={8}
                />
                <View
                    style={
                        {
                            padding: 16,
                            alignItems: 'center'
                        }
                    }
                >
                    <OTPInputView
                        style={{ width: '80%', height: 100 }}
                        pinCount={6}
                        code={pseudo}
                        onCodeChanged={code => { setPseudo(code); setError(''); }}
                        autoFocusOnLoad
                        codeInputFieldStyle={styles.underlineStyleBase}
                        codeInputHighlightStyle={styles.underlineStyleHighLighted}
                        onCodeFilled={(code) => {
                            setPseudo(code)
                        }}
                    />
                    {error != '' && <View style={[styles.rowAlignItems, { marginTop: 0 }]}>
                        <SvgXml
                            width={24}
                            height={24}
                            xml={errorSvg}
                        />
                        <DescriptionText
                            text={t(error)}
                            fontSize={12}
                            lineHeigh={16}
                            marginLeft={8}
                            color='#E41717'
                        />
                    </View>}
                </View>
                <TouchableOpacity onPress={() => resendCode()}>
                    <DescriptionText
                        text={t("Resend code")}
                        fontSize={15}
                        lineHeight={24}
                        color='#8327D8'
                        textAlign='center'
                    />
                </TouchableOpacity>
                <TouchableOpacity style={{
                    position: 'absolute',
                    right: 16,
                    bottom: 16,
                }}
                    onPress={() => confirmCode()}
                    disabled={pseudo.length < 6}
                >
                    <LinearGradient
                        style={
                            {
                                height: 56,
                                width: 56,
                                borderRadius: 28,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row'
                            }
                        }
                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        colors={pseudo.length == 6 ? ['#D89DF4', '#B35CF8', '#8229F4'] : ['#FBF2FF', '#F7E5FF', '#E5D1FF']}
                    >
                        <SvgXml
                            width={32}
                            height={32}
                            xml={rightArrowSvg}
                        />
                    </LinearGradient>
                </TouchableOpacity>
                {loading &&
                    <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(1,1,1,0.3)' }}>
                        <View style={{ marginTop: windowHeight / 2.5, alignItems: 'center', width: windowWidth }}>
                            <Progress.Circle
                                indeterminate
                                size={30}
                                color="rgba(0, 0, 255, 0.7)"
                                style={{ alignSelf: "center" }}
                            />
                        </View>
                    </View>
                }
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
};

export default PhoneVerifyScreen;