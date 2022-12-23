import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Modal,
    Pressable,
    Vibration,
    Platform
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import DatePicker from 'react-native-date-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationActions, StackActions } from 'react-navigation';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from '../component/MyButton';
import { MyColorButton } from '../component/MyColorButton';
import { MyTextField } from '../component/MyTextField';
import { SelectForm } from '../component/SelectForm';
import { MyIdentify } from '../component/MyIdentify';
import { SearchCountry } from '../component/SearchCountry';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import yesSwitchSvg from '../../assets/common/yesSwitch.svg';
import noSwitchSvg from '../../assets/common/noSwitch.svg';
import editSvg from '../../assets/record/edit.svg';
import redTrashSvg from '../../assets/common/red_trash.svg';
import manSvg from '../../assets/login/man.svg';
import womanSvg from '../../assets/login/woman.svg';
import moreSvg from '../../assets/login/more.svg';
import privacySvg from '../../assets/setting/privacy.svg';
import { ACCESSTOKEN_KEY, Avatars, windowHeight, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import { SemiBoldText } from '../component/SemiBoldText';
import EditService from '../../services/EditService';
import { useSelector, useDispatch } from 'react-redux';
import { setSocketInstance, setUser } from '../../store/actions';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { GoogleSignin } from 'react-native-google-signin';

const EditProfileScreen = (props) => {

    const { t, i18n } = useTranslation();

    const { user, socketInstance } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    let userData = { ...user };

    const [username, setUsername] = useState(userData.name);
    const [firstName, setFirstName] = useState(userData.firstname?.split(" ")[0]?userData.firstname?.split(" ")[0]:'');
    const [lastName, setLastName] = useState(userData.firstname?.split(" ")[1]?userData.firstname?.split(" ")[1]:'');
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

    const handleSubmit = async () => {
        const payload = {
            bio: bio,
            name: username,
            dob: birthDate,
            country: userCountry.country,
            gender: gender,
            first: firstName + ' ' + lastName,
            last: lastName,
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
        <KeyboardAvoidingView
            style={{
                backgroundColor: '#FFF',
                flex: 1,
            }}
        >
            <View style={styles.titleContainer}>
                <TouchableOpacity style={{ position: 'absolute', left: 16 }} onPress={() => props.navigation.goBack()}>
                    <SvgXml
                        width={24}
                        height={24}
                        xml={arrowBendUpLeft}
                    />
                </TouchableOpacity>
                <TitleText
                    text={t("Edit profile")}
                    fontSize={20}
                    lineHeight={24}
                />
                <TouchableOpacity style={{ position: 'absolute', right: 16 }} onPress={() => confirmUserName()}>
                    <DescriptionText
                        text={t('Save')}
                        fontSize={17}
                        lineHeight={28}
                        color='#8327D8'
                    />
                </TouchableOpacity>
            </View>
            <ScrollView>
                <View style={{ alignItems: 'center', marginTop: 18 }}>
                    <TouchableOpacity onPress={() => props.navigation.navigate('UpdatePicture')}>
                        <Image
                            style={{
                                width: 122,
                                height: 122,
                                borderRadius: 61,
                            }}
                            source={userData.avatar ? { uri: userData.avatar.url } : Avatars[userData.avatarNumber].uri}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <View style={[styles.contentCenter, { position: 'absolute', bottom: 0, left: windowWidth / 2 + 29, width: 32, height: 32, borderRadius: 16, backgroundColor: '#8327D8' }]}>
                            <SvgXml
                                height={100}
                                white={100}
                                xml={editSvg}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={[styles.rowSpaceBetween, { marginTop: 30, paddingHorizontal: 16, paddingVertical: 16, borderBottomColor: '#F2F0F5', borderBottomWidth: 1 }]}>
                    <View style={styles.rowAlignItems}>
                        <View style={[styles.contentCenter, { height: 40, width: 40, borderRadius: 16, backgroundColor: '#F8F0FF' }]}>
                            <SvgXml
                                height={24}
                                white={24}
                                xml={privacySvg}
                            />
                        </View>
                        <DescriptionText
                            text={t("Private account")}
                            fontSize={17}
                            lineHeight={28}
                            color='black'
                            marginLeft={16}
                        />
                    </View>
                    <TouchableOpacity onPress={() => {
                        setPrivateStatus(!privated);
                        Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                    }}>
                        <SvgXml
                            width={51}
                            height={31}
                            xml={privated ? yesSwitchSvg : noSwitchSvg}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ marginHorizontal: 16 }}>
                    <MyTextField
                        label={t("Your bio")}
                        placeholderText=""
                        color='#281E30'
                        value={bio}
                        onChangeText={(newVal) => newVal.length <= 150 ? setBio(newVal) : null}
                        marginTop={16}
                        numberOfLines={3}
                        multiline={true}
                        check={false}
                    />
                    <MyTextField
                        label={t("First Name")}
                        placeholderText="John e.g"
                        color='#281E30'
                        value={firstName}
                        onChangeText={(newVal) => setFirstName(newVal)}
                        marginTop={16}
                        check={false}
                    />
                    <MyTextField
                        label={t("Last Name")}
                        placeholderText="John e.g"
                        value={lastName}
                        color='#281E30'
                        onChangeText={(newVal) => setLastName(newVal)}
                        marginTop={16}
                        check={false}
                    />
                    <MyTextField
                        label={t("Username")}
                        placeholderText="John e.g"
                        value={username}
                        color='#281E30'
                        onChangeText={(newVal) => { checkUsername(newVal); }}
                        stateText={inputState.username}
                        marginTop={16}
                        warning={warningState}
                        check={validUsername}
                    />
                    <SelectForm
                        label={t("Date of Birth")}
                        contentText={birthDate.getDate().toString() + " " + months[t(birthDate.getMonth())] + " " + birthDate.getFullYear().toString()}
                        onPressChange={() => openModal('birth')}
                    />
                    <SelectForm
                        label={t("Your gender")}
                        contentText={gender == 'm' ? t("Man") : gender == 'f' ? t("Woman") : t("Other")}
                        onPressChange={() => openModal('gender')}
                        isCheck={true}
                    />
                    {/* <SelectForm
                        label={t("Your email")}
                        contentText={userEmail}
                        onPressChange={() => props.navigation.navigate('ChangeEmail')}
                        isCheck={true}
                    /> */}
                    <SelectForm
                        label={t("Your country")}
                        contentText={userCountry.country}
                        onPressChange={() => openModal('country')}
                        isCheck={true}
                    />
                </View>
                <TouchableOpacity onPress={() => openModal('deleteAccount')} style={{ paddingHorizontal: 16, marginTop: 32, marginBottom: 20, flexDirection: 'row', alignItems: 'center', width: windowWidth, height: 72, borderTopWidth: 1, borderTopColor: '#F2F0F5' }}>
                    <View style={[styles.contentCenter, { width: 40, height: 40, borderRadius: 12, borderColor: '#FFE8E8' }]}>
                        <SvgXml
                            width={24}
                            height={24}
                            xml={redTrashSvg}
                        />
                    </View>
                    <DescriptionText
                        text={t("Delete my account")}
                        fontSize={17}
                        lineHeight={28}
                        color='black'
                        marginLeft={16}
                    />
                </TouchableOpacity>
            </ScrollView>
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
                        {modalType == 'country' && <View style={styles.swipeInputContainerContent}>
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
                                    text={t("Select your country")}
                                    fontSize={17}
                                    lineHeight={28}
                                    color='#263449'
                                />
                                <TouchableOpacity onPress={() => selectCountry(country)}>
                                    <DescriptionText
                                        text={t('Save')}
                                        fontSize={17}
                                        lineHeight={28}
                                        color='#8327D8'
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
                                <SearchCountry
                                    height={windowHeight - 190}
                                    onSelectCountry={(cty) => setCountry(cty)}
                                />
                            </View>
                            <LinearGradient
                                colors={['#FFFFFF', 'rgba(255,255,255, 0)']}
                                locations={[0.7, 1]}
                                start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
                                style={{ position: 'absolute', paddingHorizontal: 16, bottom: 0, width: windowWidth }}
                            >
                                <MyButton
                                    label={t("Save")}
                                    onPress={() => selectCountry(country)}
                                    active={country ? true : false}
                                    marginBottom={25}
                                />
                            </LinearGradient>
                        </View>}
                        {modalType == 'deleteAccount' && <View style={styles.swipeInputContainerContent}>
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
                                    text={t("Delete account")}
                                    fontSize={17}
                                    lineHeight={28}
                                    marginRight={15}
                                    color='#263449'
                                />
                                <TouchableOpacity disabled={!password} onPress={() => deleteAccount()}>
                                    {/* <DescriptionText
                                        text={t('Delete')}
                                        fontSize={17}
                                        lineHeight={28}
                                        color='#E41717'
                                    /> */}
                                </TouchableOpacity>
                            </View>
                            <DescriptionText
                                text={t("Are you sure about deleting your account?")}
                                fontSize={17}
                                lineHeight={28}
                                color='rgba(54, 36, 68, 0.8)'
                                textAlign='center'
                                marginTop={25}
                                marginLeft={18}
                                marginRight={16}
                            />
                            {/* <View style={{ paddingHorizontal: 16, marginTop: 25 }}>
                                <MyTextField
                                    label={t("Enter your password")}
                                    refer={passwordRef}
                                    secureTextEntry={secureTextEntry}
                                    color='#281E30'
                                    placeholderText=""
                                    value={password}
                                    onChangeText={(newVal) => setPassword(newVal)}
                                    errorText={inputState.password}
                                    showEye={() => showEye()}
                                    isPassword={true}
                                />
                            </View> */}
                            <View style={{ position: 'absolute', paddingHorizontal: 16, bottom: 0, width: windowWidth }}>
                                <MyColorButton
                                    label={t("Delete account")}
                                    marginBottom={20}
                                    onPress={() => deleteAccount()}
                                    color='#E41717'
                                    shadowColor='rgba(244, 13, 13, 0.47)'
                                //active={password ? true : false}
                                />
                            </View>
                        </View>
                        }
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
    );
};

export default EditProfileScreen;