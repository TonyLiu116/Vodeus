import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, TouchableOpacity, Platform } from 'react-native';
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
import { windowWidth, windowHeight } from '../../config/config';
import { TextInput } from 'react-native-gesture-handler';
import EditService from '../../services/EditService';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/actions';

const SelectIdentifyScreen = (props) => {

    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const [error, setError] = useState('');
    const [identify, setIdentify] = useState('m');
    const [loading, setLoading] = useState(false);

    const mounted = useRef(false);

    const { t, i18n } = useTranslation();

    const handleSubmit = async () => {
        let userData = { ...user };
        userData.gender = identify;
        if (userData.country == null)
            userData.country = 'France';
        dispatch(setUser(userData));
        const payload = {
            first:userData.firstname,
            name: userData.name,
            dob: userData.dob,
            country: userData.country,
            gender: userData.gender,
        };
        console.log(payload);
        setLoading(true);
        await EditService.changeProfile(payload).then(async res => {
            const jsonRes = await res.json();
            console.log(res.respInfo.status);
            if (mounted.current) {
                if (res.respInfo.status !== 200) {
                    setError(jsonRes.message);
                } else {
                    props.navigation.navigate('ProfilePicture');
                }
                setLoading(false);
            }
        })
            .catch(err => {
                console.log(err, "******");
            });
    }

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        }
    }, [])

    return (
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
                    progress={4}
                />
                <View>
                </View>
            </View>
            <TitleText
                text={t("I am a")}
                textAlign='center'
            />
            <DescriptionText
                text={t("How do you identify ?")}
                fontSize={15}
                lineHeight={24}
                textAlign='center'
                marginTop={8}
            />
            <View style={{
                marginTop: 8,
                paddingHorizontal: 24,
            }}>
                <TouchableOpacity style={{
                    marginTop: 16,
                    paddingVertical: 16,
                    borderRadius: 41,
                    borderWidth: identify == 'f' ? 2 : 0,
                    borderColor: '#B35CF8',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    alignItems: 'center'
                }}
                    onPress={() => setIdentify('f')}
                >
                    <DescriptionText
                        text={t("Woman")}
                        fontSize={22}
                        lineHeight={28}
                        color={identify == 'f' ? '#A24EE4' : '#281E30'}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={{
                    marginTop: 16,
                    paddingVertical: 16,
                    borderRadius: 41,
                    borderWidth: identify == 'm' ? 2 : 0,
                    borderColor: '#B35CF8',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    alignItems: 'center'
                }}
                    onPress={() => setIdentify('m')}
                >
                    <DescriptionText
                        text={t("Man")}
                        fontSize={22}
                        lineHeight={28}
                        color={identify == 'm' ? '#A24EE4' : '#281E30'}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={{
                    marginTop: 16,
                    paddingVertical: 16,
                    borderRadius: 41,
                    borderWidth: identify == 'other' ? 2 : 0,
                    borderColor: '#B35CF8',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    alignItems: 'center'
                }}
                    onPress={() => setIdentify('other')}
                >
                    <DescriptionText
                        text={t("Other")}
                        fontSize={22}
                        lineHeight={28}
                        color={identify == 'other' ? '#A24EE4' : '#281E30'}
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={{
                position: 'absolute',
                right: 16,
                bottom: 16,
            }}
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
    );
};

export default SelectIdentifyScreen;