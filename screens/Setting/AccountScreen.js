import React, { useEffect, useRef, useState } from 'react';
import {
    Image, ImageBackground, KeyboardAvoidingView,
    Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, Vibration, View
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import DatePicker from 'react-native-date-picker';
import { GoogleSignin } from 'react-native-google-signin';
import LinearGradient from 'react-native-linear-gradient';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { NavigationActions, StackActions } from 'react-navigation';
import { useDispatch, useSelector } from 'react-redux';
import noSwitchSvg from '../../assets/common/noSwitch.svg';
import closeSvg from '../../assets/call/white_close.svg';
import redTrashSvg from '../../assets/common/red_trash.svg';
import yesSwitchSvg from '../../assets/common/yesSwitch.svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import manSvg from '../../assets/login/man.svg';
import moreSvg from '../../assets/login/more.svg';
import womanSvg from '../../assets/login/woman.svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import editSvg from '../../assets/record/edit.svg';
import privacySvg from '../../assets/setting/privacy.svg';
import whiteCameraSvg from '../../assets/setting/white_camera.svg';
import accountSvg from '../../assets/setting/account.svg';
import calendarSvg from '../../assets/setting/calendar.svg';
import genderSvg from '../../assets/setting/gender.svg';
import blackWarningSvg from '../../assets/setting/black_warning.svg';
import { ACCESSTOKEN_KEY, Avatars, windowHeight, windowWidth } from '../../config/config';
import '../../language/i18n';
import EditService from '../../services/EditService';
import { setSocketInstance, setUser } from '../../store/actions';
import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from '../component/MyButton';
import { MyColorButton } from '../component/MyColorButton';
import { MyIdentify } from '../component/MyIdentify';
import { MyTextField } from '../component/MyTextField';
import { SearchCountry } from '../component/SearchCountry';
import { SelectForm } from '../component/SelectForm';
import { SemiBoldText } from '../component/SemiBoldText';
import { TitleText } from '../component/TitleText';
import { heightRate, styles } from '../style/Common';
import { MediumText } from '../component/MediumText';

const AccountScreen = (props) => {

    const { t, i18n } = useTranslation();

    const { user, socketInstance } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    let userData = { ...user };

    const [username, setUsername] = useState(userData.name);
    const [fullName, setFullName] = useState(userData.firstname);
    const [birthDate, setBirthDate] = useState(new Date(userData.dob));
    const [showModal, setShowModal] = useState(false);
    const [gender, setGender] = useState(userData.gender);
    const [userCountry, setUserCountry] = useState({ country: userData.country });
    const [validUsername, setValidUsername] = useState(true);
    const [inputState, setInputState] = useState({});
    const [privated, setPrivateStatus] = useState(userData.isPrivate);
    const [date, setDate] = useState(birthDate);
    const [identify, setIdentify] = useState(userData.gender);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [modalType, setModalType] = useState('');
    const [country, setCountry] = useState({ country: userData.country });
    const [password, setPassword] = useState('');
    const [userEmail, setUserEmail] = useState(userData.email);
    const [loading, setLoading] = useState(false);
    const [allLoading, setAllLoading] = useState(false);
    const [warningState, setWarningState] = useState(false);
    const [bio, setBio] = useState(userData.bio);
    const [error, setError] = useState('');

    const passwordRef = useRef();
    const mounted = useRef(false);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const onNavigate = (des, par = null) => {
        const resetActionTrue = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: des, params: par })],
        });
        props.navigation.dispatch(resetActionTrue);
    }

    const showEye = () => {
        setSecureTextEntry(!secureTextEntry);
    }

    const setUserbirth = (birthday) => {
        setShowModal(false);
        setBirthDate(birthday);
    }

    const deleteAccount = () => {
        EditService.deleteAccount().then(async res => {
            await AsyncStorage.removeItem(
                ACCESSTOKEN_KEY
            );
            socketInstance.disconnect();
            dispatch(setSocketInstance(null));
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (isSignedIn)
                await GoogleSignin.signOut();
            onNavigate("Welcome");
            if (mounted.current)
                setShowModal(false);
        })
    }

    const setUserGender = (gd) => {
        setShowModal(false);
        setGender(gd);
    }

    const selectCountry = (cur) => {
        setShowModal(false);
        setUserCountry(cur);
    }

    const openModal = (type) => {
        setModalType(type);
        setShowModal(true);
    }

    const confirmUserName = () => {
        if (validUsername == false) {
            setInputState({ username: 'Username is not available' })
            setWarningState(true);
        }
        else {
            setAllLoading(true);
            EditService.userNameVerify(username).then(async res => {
                if (mounted.current) {
                    if (res.respInfo.status == 201) {
                        setInputState({ username: t("Username is available") });
                        handleSubmit();
                    }
                    else {
                        setWarningState(true);
                        setInputState({ username: t("This username is already taken") })
                    }
                    setAllLoading(false);
                }
            })
                .catch(err => {

                })
        }
    }

    const checkUsername = (newVal) => {
        setUsername(newVal);
        setWarningState(false);
        setInputState({});
        let reg = /^[A-Za-z0-9]+(?:[.-_-][A-Za-z0-9]+)*$/;
        if (reg.test(newVal) === true) {
            setValidUsername(true);
        } else {
            setValidUsername(false);
        }
    }

    const onSetFullName = (e) => {
        setFullName(e);
    }

    const handleSubmit = async () => {
        let reg = /^[a-zA-Z0-9_ ]+$/;
        if (reg.test(fullName) == false) {
            setError("Full Name is not available");
            return;
        }
        else if (fullName.length < 3) {
            setError("Full Name must be at least 3 letters");
            return;
        }
        let userName = username.trim();
        if (userName.length < 3) {
            setError("Display Name must be at least 3 letters");
            return;
        }
        setError('');
        const payload = {
            bio: bio,
            name: username,
            dob: birthDate,
            country: userCountry.country,
            gender: gender,
            first: fullName,
            last: '',
            isPrivate: privated ? 'true' : 'false'
        };
        EditService.changeProfile(payload).then(async res => {
            try {
                const jsonRes = await res.json();

                if (res.respInfo.status != 200) {
                } else {
                    dispatch(setUser(jsonRes));
                    props.navigation.navigate('Setting');
                }
            } catch (err) {
                console.log(err);
            };
        })
            .catch(err => {
                console.log(err);
            });
    }

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
        <ScrollView>
            <KeyboardAvoidingView
                style={{
                    backgroundColor: '#FFF',
                    flex: 1,
                    width: windowWidth,
                    height: windowHeight,
                    alignItems: 'center'
                }}
            >
                <ImageBackground
                    source={require('../../assets/Feed/head_back.png')}
                    style={{
                        width: windowWidth,
                        height: windowWidth * 83 / 371,
                        justifyContent: 'flex-end'
                    }}
                    imageStyle={{
                        borderBottomLeftRadius: 20,
                        borderBottomRightRadius: 20
                    }}
                >
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 28,
                        paddingHorizontal: 20
                    }}>
                        <SemiBoldText
                            text={t('Account')}
                            fontSize={20.5}
                            lineHeight={24}
                            color='#FFF'
                        />
                        <TouchableOpacity
                            onPress={() => props.navigation.goBack()}
                        >
                            <SvgXml
                                xml={closeSvg}
                            />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
                <View style={{
                    marginTop: 34.15,
                    marginBottom: 35
                }}>
                    <Image
                        style={{
                            width: 118,
                            height: 118,
                            borderRadius: 61,
                        }}
                        source={userData.avatar ? { uri: userData.avatar.url } : Avatars[userData.avatarNumber].uri}
                    />
                    <TouchableOpacity
                        onPress={() => props.navigation.navigate('UpdatePicture')}
                    >
                        <LinearGradient
                            colors={['#FF9768', '#E73918']}
                            locations={[0, 1]}
                            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                            style={{
                                position: 'absolute',
                                right: -2,
                                bottom: -7.21,
                                width: 37,
                                height: 37,
                                borderRadius: 20,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <SvgXml
                                xml={whiteCameraSvg}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
                <View style={{
                    width: windowWidth - 42,
                    height: 57,
                    borderRadius: 12,
                    borderColor: '#DCDCDC',
                    borderWidth: 1,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 16
                }}>
                    <SvgXml
                        xml={accountSvg}
                    />
                    <View style={{
                        width: 1,
                        height: 38,
                        backgroundColor: '#DCDCDC',
                        marginLeft: 16,
                        marginRight: 14
                    }}>
                    </View>
                    <View>
                        <DescriptionText
                            text={t('Full Name')}
                            fontSize={12}
                            lineHeight={14}
                            marginBottom={5}
                        />
                        <TextInput
                            style={{
                                fontSize: 16,
                                lineHeight: 16,
                                height: 16,
                                padding: 0,
                                fontFamily: 'SFProDisplay-Regular',
                                color: '#000',
                            }}
                            value={fullName}
                            placeholder={t("Full Name")}
                            placeholderTextColor="rgba(59, 31, 82, 0.6)"
                            onChangeText={(e) => setFullName(e)}
                        />
                    </View>
                </View>
                <View style={{
                    width: windowWidth - 42,
                    height: 57,
                    borderRadius: 12,
                    borderColor: '#DCDCDC',
                    borderWidth: 1,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 16
                }}>
                    <SvgXml
                        xml={accountSvg}
                    />
                    <View style={{
                        width: 1,
                        height: 38,
                        backgroundColor: '#DCDCDC',
                        marginLeft: 16,
                        marginRight: 14
                    }}>
                    </View>
                    <View>
                        <DescriptionText
                            text={t('Display Name')}
                            fontSize={12}
                            lineHeight={14}
                            marginBottom={5}
                        />
                        <TextInput
                            style={{
                                fontSize: 16,
                                lineHeight: 16,
                                height: 16,
                                padding: 0,
                                fontFamily: 'SFProDisplay-Regular',
                                color: '#000',
                            }}
                            value={username}
                            placeholder={t("Full Name")}
                            placeholderTextColor="rgba(59, 31, 82, 0.6)"
                            onChangeText={(e) => setUsername(e)}
                        />
                    </View>
                </View>
                <TouchableOpacity style={{
                    width: windowWidth - 42,
                    height: 57,
                    borderRadius: 12,
                    borderColor: '#DCDCDC',
                    borderWidth: 1,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 16
                }}
                    onPress={() => openModal('birth')}
                >
                    <SvgXml
                        xml={calendarSvg}
                    />
                    <View style={{
                        width: 1,
                        height: 38,
                        backgroundColor: '#DCDCDC',
                        marginLeft: 16,
                        marginRight: 14
                    }}>
                    </View>
                    <View>
                        <DescriptionText
                            text={t('Age')}
                            fontSize={12}
                            lineHeight={14}
                            marginBottom={5}
                        />
                        <Text style={{
                            fontSize: 16,
                            lineHeight: 16,
                            height: 16,
                            padding: 0,
                            fontFamily: 'SFProDisplay-Regular',
                            color: '#000',
                        }}
                        >
                            {birthDate.getDate().toString() + "." + birthDate.getMonth().toString() + "." + birthDate.getFullYear().toString() + ' (' + (new Date().getFullYear() - birthDate.getFullYear()).toString() + ')'}
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{
                    width: windowWidth - 42,
                    height: 57,
                    borderRadius: 12,
                    borderColor: '#DCDCDC',
                    borderWidth: 1,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 16
                }}
                    onPress={() => openModal('gender')}
                >
                    <SvgXml
                        xml={genderSvg}
                        width={24}
                        height={24}
                    />
                    <View style={{
                        width: 1,
                        height: 38,
                        backgroundColor: '#DCDCDC',
                        marginLeft: 16,
                        marginRight: 14
                    }}>
                    </View>
                    <View>
                        <DescriptionText
                            text={t('Gender')}
                            fontSize={12}
                            lineHeight={14}
                            marginBottom={5}
                        />
                        <Text style={{
                            fontSize: 16,
                            lineHeight: 16,
                            height: 16,
                            padding: 0,
                            fontFamily: 'SFProDisplay-Regular',
                            color: '#000',
                        }}
                        >
                            {gender == 'm' ? t("Male") : gender == 'f' ? t("Female") : t("Other")}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={{
                    width: windowWidth - 42,
                    height: 57,
                    borderRadius: 12,
                    borderColor: '#DCDCDC',
                    borderWidth: 1,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 16
                }}>
                    <SvgXml
                        xml={blackWarningSvg}
                    />
                    <View style={{
                        width: 1,
                        height: 38,
                        backgroundColor: '#DCDCDC',
                        marginLeft: 16,
                        marginRight: 14
                    }}>
                    </View>
                    <View>
                        <DescriptionText
                            text={t('About Me')}
                            fontSize={12}
                            lineHeight={14}
                            marginBottom={5}
                        />
                        <TextInput
                            style={{
                                fontSize: 16,
                                lineHeight: 16,
                                height: 16,
                                padding: 0,
                                fontFamily: 'SFProDisplay-Regular',
                                color: '#000',
                            }}
                            value={bio}
                            placeholderTextColor="rgba(59, 31, 82, 0.6)"
                            onChangeText={(e) => setBio(e)}
                        />
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleSubmit}
                    style={{
                        position: 'absolute',
                        bottom: 25,
                        width: windowWidth,
                        alignItems: 'center'
                    }}
                >
                    <LinearGradient
                        style={{
                            height: 56,
                            width: windowWidth - 58,
                            marginBottom: 25,
                            marginTop: 32,
                            borderRadius: 30,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        locations={[0, 1]}
                        colors={['#6051AD', '#423582']}
                    >
                        <MediumText
                            text={t('Save Changes')}
                            fontSize={16}
                            lineHeight={22}
                            color='#FFF'
                        />
                    </LinearGradient>
                </TouchableOpacity>
                {error !='' && <View style={{
                    position: 'absolute',
                    top: 40,
                    width: windowWidth,
                    alignItems: 'center'
                }}>
                    <View style={{
                        paddingHorizontal: 33,
                        paddingVertical: 10,
                        backgroundColor: '#E41717',
                        borderRadius: 16,
                        shadowColor: 'rgba(244, 13, 13, 0.47)',
                        elevation: 10,
                        shadowOffset: { width: 0, height: 5.22 },
                        shadowOpacity: 0.5,
                        shadowRadius: 16,
                    }}>
                        <DescriptionText
                            text={t(error)}
                            fontSize={15}
                            lineHeight={18}
                            color='#FFF'
                        />
                    </View>
                </View>}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showModal}
                    onRequestClose={() => {
                        setShowModal(!showModal);
                    }}
                >
                    <Pressable onPressOut={() => setShowModal(false)} style={styles.swipeModal}>
                        <>
                            {modalType == 'birth' && <View style={styles.swipeContainerContent}>
                                <View style={[styles.rowSpaceBetween, { paddingHorizontal: 14, paddingVertical: 12 }]}>
                                    <TouchableOpacity onPress={() => setShowModal(false)}>
                                        <DescriptionText
                                            text={t('Cancel')}
                                            fontSize={17}
                                            lineHeight={28}
                                            color='#1E61EB'
                                        />
                                    </TouchableOpacity>
                                    <SemiBoldText
                                        text={t('Date of Birth')}
                                        fontSize={17}
                                        lineHeight={28}
                                        color='#263449'
                                    />
                                    <TouchableOpacity onPress={() => setUserbirth(date)}>
                                        <DescriptionText
                                            text={t("Select")}
                                            fontSize={17}
                                            lineHeight={28}
                                            color='#1E61EB'
                                        />
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.rowJustifyCenter, { marginBottom: 20 }]}>
                                    <DatePicker
                                        date={date}
                                        onDateChange={(newDate) => setDate(newDate)}
                                        mode="date"
                                        androidVariant='iosClone'
                                    />
                                </View>
                            </View>
                            }
                            {modalType == 'gender' && <View style={styles.swipeInputContainerContent}>
                                <View style={[styles.rowSpaceBetween, { paddingHorizontal: 14, paddingVertical: 12 }]}>
                                    <TouchableOpacity onPress={() => setShowModal(false)}>
                                        <View style={[styles.contentCenter, { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F4FC' }]}>
                                            <SvgXml
                                                width={18}
                                                height={18}
                                                xml={closeBlackSvg}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    <SemiBoldText
                                        text={t('Your gender')}
                                        fontSize={17}
                                        lineHeight={28}
                                        color='#263449'
                                    />
                                    <TouchableOpacity onPress={() => setUserGender(identify)}>
                                        <DescriptionText
                                            text={t('Save')}
                                            fontSize={17}
                                            lineHeight={28}
                                            color='#8327D8'
                                        />
                                    </TouchableOpacity>
                                </View>
                                <TitleText
                                    text={t("How do you identify?")}
                                    fontSize={22}
                                    lineHeight={28}
                                    textAlign='center'
                                    marginTop={45}
                                />
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
                                <View style={{ position: 'absolute', bottom: 0, width: '100%', paddingHorizontal: 16 }}>
                                    <MyButton
                                        label={t("Save")}
                                        onPress={() => setUserGender(identify)}
                                        active={identify ? true : false}
                                        marginTop={windowHeight - 540}
                                        loading={loading}
                                        marginBottom={25}
                                    />
                                </View>
                            </View>}
                        </>
                    </Pressable>
                </Modal>
                {allLoading && <View style={{ position: 'absolute', zIndex: 10, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <Progress.Circle
                        indeterminate
                        size={30}
                        color="white"
                        style={{ alignSelf: "center" }}
                    />
                </View>}
            </KeyboardAvoidingView>
        </ScrollView>
    );
};

export default AccountScreen;