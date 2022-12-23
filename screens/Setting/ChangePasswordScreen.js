import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
} from 'react-native';

import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from '../component/MyButton';
import { MyTextField } from '../component/MyTextField';
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import { styles } from '../style/Common';
import { SemiBoldText } from '../component/SemiBoldText';
import * as bcrypt from 'bcryptjs';
import EditService from '../../services/EditService';

import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/actions';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';

const ChangePasswordScreen = (props) => {

    const { t, i18n } = useTranslation();

    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const passwordRef = useRef();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState({});
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);
    const [loading, setLoading] = useState(false);
    const [statetype, setStatetype] = useState('current');
    const [warningState, setWarningState] = useState(null);
    const [newPassword, setnewPassword] = useState('');

    const mounted = useRef(false);

    const showEye = () => {
        setSecureTextEntry(!secureTextEntry);
    }

    const showConfirmEye = () => {
        setSecureConfirmEntry(!secureConfirmEntry);
    }

    const handleSubmit = async () => {
        setError({});
        if (statetype == 'current') {
            setLoading(true);
            const valid = await bcrypt.compare(password, user.password);
            if (valid) {
                setStatetype('match');
            }
            else
                setError({ password: t('Wrong Password') })
            setLoading(false);
        }
        if (statetype == 'matched') {
            setLoading(true);
            EditService.changePassword(password, newPassword).then(async res => {
                if (mounted.current) {
                    try {
                        const jsonRes = await res.json();
                        if (res.respInfo.status == 201) {
                            let userData = { ...user }
                            userData.password = jsonRes.password
                            dispatch(setUser(userData));
                            props.navigation.goBack();
                        }
                    }
                    catch (err) {
                        console.log(err);
                    };
                    setLoading(false);
                }
            })
        }
    }

    const confirmMatch = () => {
        if (confirmPassword == newPassword)
            setStatetype('matched');
        else {
            setError({ password: t("Password mismatch") })
            setWarningState(true);
        }
    }

    useEffect(() => {
        mounted.current = true;
        return ()=>{
            mounted.current =false;
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
                    text={t('Change password')}
                    fontSize={20}
                    lineHeight={24}
                />
                <TouchableOpacity style={{ position: 'absolute', right: 16 }} disabled={!password} onPress={() => handleSubmit()}>
                    <DescriptionText
                        text={statetype == 'matched' ? t('Change') : t('Next')}
                        fontSize={17}
                        lineHeight={28}
                        color={password ? '#8327D8' : '#CC9BF9'}
                    />
                </TouchableOpacity>
            </View>
            <SemiBoldText
                text={t('Confirm change')}
                fontSize={22}
                lineHeight={28}
                textAlign='center'
                marginTop={29}
            />
            <View style={{ paddingHorizontal: 16, marginTop: 34 }}>
                {statetype == 'current' ? <MyTextField
                    label={t("Enter your current password")}
                    refer={passwordRef}
                    secureTextEntry={secureTextEntry}
                    color='#281E30'
                    placeholderText={t('Your password')}
                    value={password}
                    onChangeText={(newVal) => { setError({}); setWarningState(null); setPassword(newVal) }}
                    errorText={error.password}
                    showEye={() => showEye()}
                    isPassword={true}
                /> : <>
                    <MyTextField
                        label={t('Enter new password')}
                        refer={passwordRef}
                        secureTextEntry={secureTextEntry}
                        color='#281E30'
                        placeholderText={t("Your new password")}
                        value={newPassword}
                        onChangeText={(newVal) => { setError({}); setWarningState(null); setnewPassword(newVal) }}
                        showEye={() => showEye()}
                        isPassword={true}
                    />
                    <MyTextField
                        label={t("Confirm new password")}
                        refer={passwordRef}
                        secureTextEntry={secureConfirmEntry}
                        color='#281E30'
                        placeholderText={t("Confirm new password")}
                        value={confirmPassword}
                        onChangeText={(newVal) => { setError({}); setWarningState(null); setConfirmPassword(newVal) }}
                        onEndEditing={() => confirmMatch()}
                        errorText={error.password}
                        showEye={() => showConfirmEye()}
                        warning={warningState}
                        isPassword={true}
                    /></>}
            </View>
            <View style={styles.bottomContainer}>
                <MyButton
                    label={statetype == 'current' ? t('Next') : t('Change password')}
                    active={((statetype == 'current' && password) || statetype == 'matched') ? true : false}
                    loading={loading}
                    onPress={() => handleSubmit()}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChangePasswordScreen;