import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { SendbirdCalls } from '@sendbird/calls-react-native';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ImageBackground, NativeModules, PermissionsAndroid, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { NavigationActions, StackActions } from 'react-navigation';
import io from "socket.io-client";
import { ACCESSTOKEN_KEY, BIRD_ID, DEVICE_OS, DEVICE_TOKEN, MAIN_LANGUAGE, OPEN_COUNT, SOCKET_URL } from '../../config/config';
import '../../language/i18n';

import { useDispatch, useSelector } from 'react-redux';
import { setSocketInstance, setUser } from '../../store/actions/index';

import AutoHeightImage from 'react-native-auto-height-image';
import AuthService from '../../services/AuthService';
import EditService from '../../services/EditService';
import { DescriptionText } from '../component/DescriptionText';
import { styles } from '../style/Common';
import branch from 'react-native-branch'

const LogoScreen = (props) => {

    const { t, i18n } = useTranslation();

    let { socketInstance, redirect } = useSelector((state) => {
        return (
            state.user
        )
    });

    const mounted = useRef(false);
    const redirectRef = useRef();
    const roomInit = useRef(false);
    const navScreen = useRef();
    const screenRef = useRef();

    const dispatch = useDispatch();

    const deviceLanguage =
        Platform.OS === 'ios'
            ? NativeModules.SettingsManager.settings.AppleLocale ||
            NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
            : NativeModules.I18nManager.localeIdentifier;

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
        if (openCount != prevOpenCount) {
            return;
        }
        if (prevOpenCount == null)
            openCount = "1";
        else
            openCount = (Number(prevOpenCount) + 1).toString();
        await AsyncStorage.setItem(
            OPEN_COUNT,
            openCount
        );
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
            // } else if (!jsonRes.avatar&&!jsonRes.avatarNumber) {
            //     navigateScreen = 'ProfilePicture';
        } else {
            navigateScreen = 'Home';
        }
        screenRef.current = navigateScreen;
        const resetActionTrue = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate((navigateScreen == 'Home' && redirectRef.current) ? redirectRef.current : { routeName: navigateScreen, params: {} })],
        });
        if (roomInit.current){
            props.navigation.dispatch(resetActionTrue);
        }
        else
            navScreen.current = resetActionTrue;

    }

    const onCreateSocket = async (jsonRes) => {
        dispatch(setUser(jsonRes));
        let open_count = await AsyncStorage.getItem(OPEN_COUNT);
        if (socketInstance == null) {
            let socket = io(SOCKET_URL);
            socket.on("connect", () => {
                socket.emit("login", { uid: jsonRes.id, email: jsonRes.email, isNew: false }, (res) => {
                    if (res == "Success") {
                        dispatch(setSocketInstance(socket));
                        onGoScreen(jsonRes, open_count);
                    }
                    else {
                        props.navigation.navigate('Welcome');
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
    const checkLogin = async () => {
        // if (jsonRes.language != systemLanguage)
        //     EditService.changeLanguage(systemLanguage);
        // if (jsonRes.storyLanguage == 'none') {
        //     EditService.changeStoryLanguage(systemLanguage);
        //     jsonRes.storyLanguage = systemLanguage;
        // }
        let mainLanguage = await AsyncStorage.getItem(MAIN_LANGUAGE);
        if (mainLanguage == null) {
            let systemLanguage = '';
            if (deviceLanguage[0] == 'p') {
                systemLanguage = 'Portuguese';
            }
            else if (deviceLanguage[0] == 'f') {
                systemLanguage = 'French';
            }
            else {
                systemLanguage = 'English';
            }
            mainLanguage = systemLanguage;
            await AsyncStorage.setItem(
                MAIN_LANGUAGE,
                systemLanguage
            );
        }
        await i18n.changeLanguage(mainLanguage);
        const aToken = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        if (aToken != null) {
            AuthService.getUserInfo().then(async res => {
                const jsonRes = await res.json();
                if (jsonRes.language != mainLanguage) {
                    await EditService.changeLanguage(mainLanguage);
                }
                if (res.respInfo.status == 200 && jsonRes != null) {
                    onCreateSocket(jsonRes);
                }
                else {
                    props.navigation.navigate('Welcome');
                }
            })
                .catch(err => {
                    console.log(err);
                    props.navigation.navigate('Welcome');
                });
        }
        else {
            props.navigation.navigate('Welcome');
        }
    }

    const checkPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const grants = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    // PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                    // PermissionsAndroid.PERMISSIONS.SEND_SMS,
                    // PermissionsAndroid.PERMISSIONS.READ_SMS,
                ]);

                if (
                    grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.READ_EXTERNAL_STORAGE'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.RECORD_AUDIO'] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                    grants['android.permission.READ_CONTACTS'] ===
                    PermissionsAndroid.RESULTS.GRANTED
                    // &&
                    // grants['android.permission.SEND_SMS'] ===
                    // PermissionsAndroid.RESULTS.GRANTED &&
                    // grants['android.permission.READ_SMS'] ===
                    // PermissionsAndroid.RESULTS.GRANTED
                ) {
                    console.log('Permissions granted');
                } else {
                    console.log('All required permissions not granted');
                    return;
                }
            } catch (err) {
                console.warn(err);
                return;
            }
        }
    }

    const OnSetPushNotification = () => {
        PushNotification.requestPermissions();
        PushNotification.configure({
            onRegister: async ({ token, os }) => {
                await AsyncStorage.setItem(
                    DEVICE_TOKEN,
                    token
                );
                await AsyncStorage.setItem(
                    DEVICE_OS,
                    os
                );
            },

            onNotification: async (notification) => {
                if (notification.userInteraction) {
                    if (mounted.current) {
                        redirectRef.current = { routeName: notification.data.nav, params: notification.data.params };
                    }
                    else if(screenRef.current == 'Home'){
                        const resetActionTrue = StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: notification.data.nav, params: notification.data.params })],
                        });
                        props.navigation.dispatch(resetActionTrue);
                    }
                }
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            }

        });
    }

    const onSendBirdSetUp = () => {
        SendbirdCalls.initialize(BIRD_ID);
        SendbirdCalls.authenticate({
            userId: 'sendbird_desk_agent_id_f951b473-dcad-411a-86b2-042cb34845b6',
            accessToken: 'a567fd3bc3484663dd15d902cc217266bd096726',
        })
            .then((user) => {
                // The user has been authenticated successfully.
                if (navScreen.current && screenRef.current == 'Home') {
                    props.navigation.dispatch(navScreen.current);
                }
                else
                    roomInit.current = true;

            })
            .catch((error) => {
                // Error.
            });
    }

    const checkLinking = async () => {
        branch.subscribe(({ error, params, uri }) => {
            if (error) {
                console.error('Error from Branch: ' + error)
                return
            }
            // params will never be null if error is null
            if (params.key1 == 'room') {
                if (mounted.current) {
                    redirectRef.current = { routeName: 'Home', params: { roomId: params.roomId } };
                }
                else if(screenRef.current == 'Home'){
                    const resetActionTrue = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Home', params: { roomId: params.roomId } })],
                    });
                    props.navigation.dispatch(resetActionTrue);
                }
            }
        })
    }

    useEffect(() => {
        if (redirect) {
            redirectRef.current = { routeName: redirect.nav, params: redirect.params };
        }
    }, [redirect])

    useEffect(() => {
        mounted.current = true;
        checkPermission();
        onSendBirdSetUp();
        checkLinking();
        checkLogin();
        if (Platform.OS == 'ios')
            OnSetPushNotification();
        return () => {
            mounted.current = false;
            //Linking.removeAllListeners('url', handleOpenURL);
        }
    }, [])

    return (
        <ImageBackground
            source={require('../../assets/login/logo_background.png')}
            resizeMode="stretch"
            style={[styles.background, { justifyContent: 'center', alignItems: 'center' }]}
        >

            <Image
                source={require('../../assets/login/logo_pic.png')}
                style={{ width: 180, height: 180, marginTop: -100 }}
            />
            <AutoHeightImage
                source={require('../../assets/login/Title.png')}
                style={{ marginTop: -20 }}
                width={140}
            />
            <DescriptionText
                text={t("Unify and connect together")}
                fontSize={20}
                lineHeight={28}
                color='#501681'
                marginTop={30}
            />
        </ImageBackground>
    );
};

export default LogoScreen;