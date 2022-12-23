import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, TouchableOpacity, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import * as Progress from "react-native-progress";
import appleAuth, { appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import { v4 as uuid } from 'uuid'
import PhoneInput from "react-native-phone-number-input";
import { GoogleSignin, statusCodes } from 'react-native-google-signin';
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import rightArrowSvg from '../../assets/phoneNumber/right-arrow.svg';
import errorSvg from '../../assets/phoneNumber/error.svg';
import appleSvg from '../../assets/login/apple.svg';
import googleSvg from '../../assets/login/google.svg';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { SemiBoldText } from '../component/SemiBoldText';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import '../../language/i18n';

import { styles } from '../style/Welcome';
import { MyProgressBar } from '../component/MyProgressBar';
import { windowWidth, windowHeight, TUTORIAL_CHECK, SOCKET_URL, OPEN_COUNT, ACCESSTOKEN_KEY, REFRESHTOKEN_KEY } from '../../config/config';
import AuthService from '../../services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationActions, StackActions } from 'react-navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setSocketInstance, setUser } from '../../store/actions';
import { io } from 'socket.io-client';

const PhoneLoginScreen = (props) => {

    let { socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const [formattedValue, setFormattedValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [country, setCountry] = useState('France');

    const { t, i18n } = useTranslation();
    const phoneInput = useRef();
    const mounted = useRef(false);
    const dispatch = useDispatch();

    const phoneLogin = () => {
        const payload = {
            phoneNumber: formattedValue
        };
        setLoading(true);
        AuthService.phoneLogin(payload).then(async res => {
            const jsonRes = await res.json();
            if (mounted.current) {
                if (res.respInfo.status === 201) {
                    props.navigation.navigate('PhoneVerify', { number: formattedValue, country: country, type: 'login' })
                }
                else {
                    setError(jsonRes.message);
                }
                setLoading(false);
            }
        })
    }

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

    const onAppleButtonPress = async () => {
        // Generate secure, random values for state and nonce
        const rawNonce = uuid();
        const state = uuid();
        // Configure the request
        appleAuthAndroid.configure({
            // The Service ID you registered with Apple
            clientId: 'com.vocco.client-android',

            // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
            // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
            redirectUri: 'https://vocco.ai',

            // The type of response requested - code, id_token, or both.
            responseType: appleAuthAndroid.ResponseType.ALL,

            // The amount of user information requested from Apple.
            scope: appleAuthAndroid.Scope.ALL,

            // Random nonce value that will be SHA256 hashed before sending to Apple.
            nonce: rawNonce,

            // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
            state,
        });

        // Open the browser window for user sign in
        const response = await appleAuthAndroid.signIn();
        // Send the authorization code to your backend for verification
        AuthService.appleLogin({ code: response.code, identityToken: response.id_token, nonce: response.nonce }).then(async res => {
            const jsonRes = await res.json();
            if (res.respInfo.status === 201) {
                _storeData(jsonRes.accessToken, jsonRes.refreshToken);
                onSetUserInfo(jsonRes.accessToken, jsonRes.refreshToken, jsonRes.isRegister);
            }
            else {
                setError(jsonRes.message);
            }
            setLoading(false);
        })
            .catch(err => {
                console.log(err);
            })
    }

    const OnIosAppleLogin = async () => {
        try {
            // performs login request
            const { identityToken } = await appleAuth.performRequest({
                requestedOperation: 1,
                requestedScopes: [
                    0,
                    1
                ],
            });
            AuthService.appleLogin({ identityToken }).then(async res => {
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

        } catch (error) {

        }
    }

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const { idToken } = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();
            console.log(tokens);
            setLoading(true);
            AuthService.googleLogin({ token: tokens.accessToken }).then(async res => {
                const jsonRes = await res.json();
                if (res.respInfo.status === 201) {
                    _storeData(jsonRes.accessToken, jsonRes.refreshToken);
                    onSetUserInfo(jsonRes.accessToken, jsonRes.refreshToken, jsonRes.isRegister);
                }
                else {
                    setError(jsonRes.message);
                }
                setLoading(false);
            })
                .catch(err => {
                    console.log(err);
                })
        } catch (error) {
            console.log(error, statusCodes, error.code);
        }
    };

    useEffect(() => {
        mounted.current = true;
        GoogleSignin.configure({
            androidClientId: '411872622691-jtn0id6ql8ugta4i8qo962tngerf79vl.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
            iosClientId: '1034099036541-va0ioishaoaueb7elaogc2ra1h4u1if3.apps.googleusercontent.com'
        });
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
                    <MyProgressBar
                        progress={1}
                    />
                    <View>
                    </View>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <TitleText
                        text={t("Hi again! What's your number?")}
                        maxWidth={300}
                        textAlign='center'
                    />
                </View>
                <DescriptionText
                    text={t("We'll text a code to verify your phone")}
                    fontSize={15}
                    lineHeight={24}
                    textAlign='center'
                    marginTop={8}
                />
                <View style={{
                    alignItems: 'center',
                    marginTop: 45
                }}>
                    <PhoneInput
                        ref={phoneInput}
                        defaultValue={value}
                        defaultCode="FR"
                        layout="first"
                        placeholder="Phone Number"
                        // containerStyle={{
                        //     borderRadius: 8,
                        //     height: 60,
                        //     width: windowWidth - 40,
                        // }}
                        // textContainerStyle={{
                        //     borderTopRightRadius: 12,
                        //     borderBottomRightRadius: 12,
                        //     textAlignVertical: 'center',
                        //     height: 60,
                        // }}
                        // textInputStyle={{
                        //     fontSize: 24,
                        //     height: 60,
                        //     lineHeight: 24,
                        //     textAlignVertical: 'center',
                        //     color: '#281E30'
                        // }}
                        // codeTextStyle={{
                        //     fontSize: 24,
                        //     lineHeight: 24,
                        //     height: 60,
                        //     textAlignVertical: 'center',
                        //     color: '#281E30'
                        // }}
                        onChangeCountry={(country) => {
                            setCountry(country.name);
                        }}
                        onChangeText={(text) => {
                            setValue(text);
                            setError('');
                        }}
                        onChangeFormattedText={(text) => {
                            setFormattedValue(text);
                        }}
                        autoFocus
                    />
                    {error != '' && <View style={[styles.rowAlignItems, { marginTop: 10 }]}>
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
                <DescriptionText
                    text={t("or continue with")}
                    fontSize={12}
                    lineHeight={16}
                    color="#361252"
                    textAlign='center'
                    marginTop={76}
                />
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 20
                }}>
                    <TouchableOpacity style={{
                        width: 163.5,
                        height: 50,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#B35CF8',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row'
                    }}
                        onPress={() => Platform.OS == 'ios' ? OnIosAppleLogin() : onAppleButtonPress()}
                    >
                        <SvgXml
                            xml={appleSvg}
                            width={34}
                            height={34}
                        />
                        <SemiBoldText
                            text={t("Apple")}
                            fontSize={17}
                            lineHeight={20}
                            color="rgba(54,18,82,0.8)"
                            marginLeft={8}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        width: 163.5,
                        height: 50,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#B35CF8',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 16,
                        flexDirection: 'row'
                    }}
                        onPress={() => signIn()}
                    >
                        <SvgXml
                            xml={googleSvg}
                            width={34}
                            height={34}
                        />
                        <SemiBoldText
                            text={t("Google")}
                            fontSize={17}
                            lineHeight={20}
                            color="rgba(54,18,82,0.8)"
                            marginLeft={8}
                        />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={{
                    position: 'absolute',
                    right: 16,
                    bottom: 16,
                }}
                    onPress={() => phoneLogin()}
                    disabled={!phoneInput.current?.isValidNumber(value)}
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
                        colors={phoneInput.current?.isValidNumber(value) ? ['#D89DF4', '#B35CF8', '#8229F4'] : ['#FBF2FF', '#F7E5FF', '#E5D1FF']}
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

export default PhoneLoginScreen;