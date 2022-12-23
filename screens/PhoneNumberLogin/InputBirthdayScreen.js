import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, TouchableOpacity, Platform, Text, Keyboard, TouchableWithoutFeedback } from 'react-native';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import rightArrowSvg from '../../assets/phoneNumber/right-arrow.svg';
import errorSvg from '../../assets/phoneNumber/error.svg';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import '../../language/i18n';

import { styles } from '../style/Welcome';
import { MyProgressBar } from '../component/MyProgressBar';
import { windowWidth } from '../../config/config';
import { TextInput } from 'react-native-gesture-handler';
import EditService from '../../services/EditService';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/actions';

const InputBirthdayScreen = (props) => {

    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const [error, setError] = useState('');
    const [day, setDay] = useState(null);
    const [month, setMonth] = useState(null);
    const [year, setYear] = useState(null);

    const dayRef = useRef();
    const monthRef = useRef();
    const yearRef = useRef();

    const { t, i18n } = useTranslation();

    const handleSubmit = () => {
        let userData = { ...user };
        let date = new Date(year, month - 1, day, 12, 12, 12, 0);
        userData.dob = date;
        dispatch(setUser(userData));
        props.navigation.navigate('SelectIdentify');
    }

    const re = /^[0-9\b]+$/;

    useEffect(() => {
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
                        progress={3}
                    />
                    <View>
                    </View>
                </View>
                <TitleText
                    text={t("When's your birthday ?")}
                    textAlign='center'
                />
                <DescriptionText
                    text={t("You must be at least 18 y.o. for some categories")}
                    fontSize={15}
                    lineHeight={24}
                    textAlign='center'
                    marginTop={8}
                />
                <View style={{
                    width: windowWidth,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 53
                }}>
                    <View style={{
                        alignItems: 'center'
                    }}>
                        <View style={{
                            // paddingVertical: 14,
                            marginHorizontal: 4,
                            borderRadius: 8,
                            paddingHorizontal: 24,
                            borderWidth: 3,
                            borderColor: '#FFF',
                            backgroundColor: 'rgba(255, 255, 255, 0.6)'
                        }}>
                            <TextInput
                                style={
                                    {
                                        fontSize: 28,
                                        lineHeight: 34,
                                        color: '#281E30',
                                        width: 42
                                    }
                                }
                                ref = {dayRef}
                                placeholder={t("DD")}
                                textAlign='center'
                                keyboardType='numeric'
                                maxWidth={250}
                                value={day}
                                autoCapitalize='words'
                                onChangeText={e => {
                                    if (e === '' || re.test(e)) {
                                        setDay(e)
                                    }
                                    if(e.length == 2){
                                        monthRef.current.focus();
                                    }
                                }}
                            />
                        </View>
                        <DescriptionText
                            text={t("DAY")}
                            color='rgba(59, 31, 82, 0.6)'
                            fontSize={15}
                            lineHeight={24}
                            marginTop={8}
                        />
                    </View>
                    <View style={{
                        alignItems: 'center'
                    }}>
                        <View style={{
                            // paddingVertical: 14,
                            marginHorizontal: 4,
                            borderRadius: 8,
                            paddingHorizontal: 24,
                            borderWidth: 3,
                            borderColor: '#FFF',
                            backgroundColor: 'rgba(255, 255, 255, 0.6)'
                        }}>
                            <TextInput
                                style={
                                    {
                                        fontSize: 28,
                                        lineHeight: 34,
                                        color: '#281E30',
                                        width: 56
                                    }
                                }
                                ref = {monthRef}
                                placeholder={t("MM")}
                                keyboardType='numeric'
                                textAlign='center'
                                maxWidth={250}
                                value={month}
                                autoCapitalize='words'
                                onChangeText={e => {
                                    if (e === '' || re.test(e)) {
                                        setMonth(e)
                                    }
                                    if(e.length == 2){
                                        yearRef.current.focus();
                                    }
                                }}
                            />
                        </View>
                        <DescriptionText
                            text={t("MONTH")}
                            color='rgba(59, 31, 82, 0.6)'
                            fontSize={15}
                            lineHeight={24}
                            marginTop={8}
                        />
                    </View>
                    <View style={{
                        alignItems: 'center'
                    }}>
                        <View style={{
                            // paddingVertical: 14,
                            marginHorizontal: 4,
                            borderRadius: 8,
                            paddingHorizontal: 24,
                            borderWidth: 3,
                            borderColor: '#FFF',
                            backgroundColor: 'rgba(255, 255, 255, 0.6)'
                        }}>
                            <TextInput
                                style={
                                    {
                                        fontSize: 28,
                                        lineHeight: 34,
                                        color: '#281E30',
                                        width: 84
                                    }
                                }
                                ref = {yearRef}
                                placeholder={t("YYYY")}
                                keyboardType='numeric'
                                textAlign='center'
                                maxWidth={250}
                                value={year}
                                autoCapitalize='words'
                                onChangeText={e => {
                                    if (e=== '' || re.test(e)) {
                                        setYear(e)
                                    }
                                }}
                            />
                        </View>
                        <DescriptionText
                            text={t("YEAR")}
                            color='rgba(59, 31, 82, 0.6)'
                            fontSize={15}
                            lineHeight={24}
                            marginTop={8}
                        />
                    </View>
                </View>
                <View style={{
                    position: 'absolute',
                    width: windowWidth,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bottom: 16,
                }}
                >
                    <View></View>
                    <DescriptionText
                        text='e.g. 27/08/1997'
                        fontSize={15}
                        lineHeight={24}
                        color='rgba(54, 36, 68, 0.8)'
                    />
                    <TouchableOpacity
                        onPress={handleSubmit}
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
                            colors={['#D89DF4', '#B35CF8', '#8229F4']}
                        >
                            <SvgXml
                                width={32}
                                height={32}
                                xml={rightArrowSvg}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
};

export default InputBirthdayScreen;