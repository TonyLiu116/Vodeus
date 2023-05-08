import { AppleButton, appleAuth, appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ImageBackground, Keyboard, Platform, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import { v4 as uuid } from 'uuid';
import facebookSvg from '../../assets/login/facebook.svg';
import googleSvg from '../../assets/login/google.svg';
import '../../language/i18n';
import { DescriptionText } from '../component/DescriptionText';
import { SemiBoldText } from '../component/SemiBoldText';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    AccessToken,
    GraphRequest,
    GraphRequestManager,
    LoginManager,
} from 'react-native-fbsdk';
import { NavigationActions, StackActions } from 'react-navigation';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { ACCESSTOKEN_KEY, OPEN_COUNT, REFRESHTOKEN_KEY, SOCKET_URL, windowHeight, windowWidth } from '../../config/config';
import AuthService from '../../services/AuthService';
import { setSocketInstance, setUser } from '../../store/actions';
import { styles } from '../style/Welcome';

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
            setLoading(false);
            if (mounted.current) {
                if (res.respInfo.status === 201) {
                    props.navigation.navigate('PhoneVerify', { number: formattedValue, country: country, type: 'login' })
                }
                else {
                    setError(jsonRes.message);
                }
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
        AuthService.checkNewDay().then(async res => {
            const isNewDay = await res.json();
            if (res.respInfo.status == 200 && isNewDay) {
                let userData = { ...jsonRes };
                userData.score++;
                dispatch(setUser(userData));
            }
        })
            .catch(err => {
                console.log(err);
            })
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
            navigateScreen = 'Home';
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
            //The Service ID you registered with Apple
            //clientId: 'com.vocco.client-android',
            clientId: 'com.voiceden.client-android',

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
        AuthService.appleLogin({ identityToken: response.id_token }).then(async res => {
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
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME]
            })

            const { identityToken, } = appleAuthRequestResponse;

            AuthService.appleLogin({ identityToken: identityToken }).then(async res => {
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

        }
    }

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const { idToken } = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();
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

    const getInfoFromToken = (token) => {
        const PROFILE_REQUEST_PARAMS = {
            fields: {
                string: 'id',
            },
        };
        const profileRequest = new GraphRequest(
            '/me',
            { token, parameters: PROFILE_REQUEST_PARAMS },
            (error, result) => {
                if (error) {
                    console.log('login info has error: ' + error);
                } else {
                    AuthService.facebookLogin({ facebookId: result.id }).then(async res => {
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
                    console.log('result:', result);
                }
            },
        );
        new GraphRequestManager().addRequest(profileRequest).start();
    };

    const loginWithFacebook = () => {
        LoginManager.logInWithPermissions(['public_profile']).then(
            login => {
                if (login.isCancelled) {
                    console.log('Login cancelled');
                } else {
                    AccessToken.getCurrentAccessToken().then(data => {
                        const accessToken = data.accessToken.toString();
                        getInfoFromToken(accessToken);
                    });
                }
            },
            error => {
                console.log('Login fail with error: ' + error);
            },
        );
    };

    useEffect(() => {
        mounted.current = true;
        GoogleSignin.configure({
        //  androidClientId: '90267401771-77i4i3fcq72p10ksvl5kbt0r1tf3gkvm.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
            webClientId:'1072354006907-3e714aeo627nna8bt3cfru4htmub0u6p.apps.googleusercontent.com',
            iosClientId: '90267401771-af45frgqut4g5asdnk28kljs7ir87iv2.apps.googleusercontent.com',
        });
        return () => {
            mounted.current = false;
        }
    }, [])

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <ImageBackground
                source={require('../../assets/login/logo_background.png')}
                resizeMode="stretch"
                style={[styles.background, { alignItems: 'center', justifyContent: 'flex-end' }]}
            >
                <Image
                    source={require('../../assets/login/logo_pic.png')}
                    style={{ width: 145, height: 168, marginBottom: 98 }}
                />
                <DescriptionText
                    text={t("Continue with")}
                    fontSize={12}
                    lineHeight={16}
                    color="#FFF"
                    textAlign='center'
                />
                {Platform.OS == 'ios' ?
                    <View style={{
                        alignItems: 'center',
                        marginTop: 20,
                        marginBottom: 250
                    }}>
                        <AppleButton
                            buttonStyle={AppleButton.Style.WHITE_OUTLINE}
                            style={{
                                width: 200,
                                height: 40,
                            }}
                            buttonType={AppleButton.Type.SIGN_IN}
                            onPress={() => Platform.OS == 'ios' ? OnIosAppleLogin() : onAppleButtonPress()}
                        />
                        <GoogleSigninButton
                            style={{ width: 208, height: 48, marginTop: 2 }}
                            size={GoogleSigninButton.Size.Wide}
                            color={GoogleSigninButton.Color.Dark}
                            onPress={() => signIn()}
                        />
                    </View>
                    :
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 20,
                        flexDirection: 'row',
                        marginBottom: 250
                    }}>
                        <TouchableOpacity style={{
                            width: 163.5,
                            height: 50,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#FFF',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row'
                        }}
                            onPress={() => loginWithFacebook()}
                        >
                            <SvgXml
                                xml={facebookSvg}
                            />
                            <SemiBoldText
                                text={t("Facebook")}
                                fontSize={17}
                                lineHeight={20}
                                color="#FFF"
                                marginLeft={8}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={{
                            width: 163.5,
                            height: 50,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#FFF',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 16,
                            flexDirection: 'row'
                        }}
                            onPress={() => signIn()}
                        >
                            <SvgXml
                                xml={googleSvg}
                            />
                            <SemiBoldText
                                text={t("Google")}
                                fontSize={17}
                                lineHeight={20}
                                color="#FFF"
                                marginLeft={8}
                            />
                        </TouchableOpacity>
                    </View>
                }
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