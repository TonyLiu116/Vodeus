import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, Image, Text, TouchableOpacity, Platform, Pressable, Modal } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import rightArrowSvg from '../../assets/phoneNumber/right-arrow.svg';
import addSvg from '../../assets/phoneNumber/add.svg';
import closeSvg from '../../assets/phoneNumber/close.svg';
import checkSvg from '../../assets/phoneNumber/check.svg';
import shareSvg from '../../assets/login/forward.svg'
import cameraSvg from '../../assets/login/camera.svg';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import '../../language/i18n';

import { MyProgressBar } from '../component/MyProgressBar';
import { windowWidth, Avatars, windowHeight } from '../../config/config';
import { styles } from '../style/Login';
import { NavigationActions, StackActions } from 'react-navigation';
import { SemiBoldText } from '../component/SemiBoldText';
import { ScrollView } from 'react-native-gesture-handler';
import AuthService from '../../services/AuthService';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/actions';
import VoicePlayer from '../Home/VoicePlayer';
import { HeartIcon } from '../component/HeartIcon';
import { MyButton } from '../component/MyButton';

const WelcomeAudioScreen = (props) => {


    const [likeNumber, setLikeNumber] = useState(813);
    const [check, setCheck] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const mounted = useRef(false);

    const dispatch = useDispatch();

    const { t, i18n } = useTranslation();

    const onNavigate = (des, par = null) => {
        const resetActionTrue = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: des, params: par })],
        });
        props.navigation.dispatch(resetActionTrue);
    }

    let { user, refreshState, socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    const shareAudio = () => {
        const dirs = RNFetchBlob.fs.dirs.DocumentDir;
        const fileName = t("Join me on the Vodeus app");
        const path = Platform.select({
            ios: `${dirs}/${fileName}.m4a`,
            android: `${dirs}/${fileName}.mp3`,
        });
        setIsLoading(true);
        RNFetchBlob.config({
            fileCache: true,
            path,
        }).fetch('GET', 'https://vodienstorage.s3.sa-east-1.amazonaws.com/Audio+-+Vodeus.m4a').then(res => {
            setIsLoading(false);
            if (mounted.current && res.respInfo.status == 200) {
                let filePath = res.path();
                Share.open({
                    url: (Platform.OS == 'android' ? 'file://' : '') + filePath,
                    type: 'audio/' + (Platform.OS === 'android' ? 'mp3' : 'm4a'),
                }).then(res => {
                })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
            .catch(async err => {
                console.log(err);
            })
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
            style={{ flex: 1, width: '100%', height: '100%' }}
        >
            <View
                style={[
                    { marginTop: Platform.OS == 'ios' ? 50 : 20, paddingHorizontal: 12, marginBottom: 30, height: 30 },
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

                <TouchableOpacity
                    onPress={() => {
                        props.navigation.navigate('WrittenPost')
                    }}
                >
                    <DescriptionText
                        text={t("Pass")}
                        color="#8327D8"
                        fontSize={17}
                        lineHeight={28}
                    />
                </TouchableOpacity>
            </View>
            <TitleText
                text={t("Welcome to Vodeus")}
                textAlign='center'
                color='#8229F4'
            />
            <DescriptionText
                text={user.name + ', ' + t("You're now part of the community")}
                color='#000'
                textAlign='center'
                marginTop={20}
            />
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'space-around',
            }}>
                <Image
                    source={require('../../assets/login/logo_pic.png')}
                    style={{
                        width: 180,
                        height: 180,
                        marginTop: 20,
                        marginBottom: -25
                    }}
                />
                <View
                    style={{
                        width: 320,
                        paddingHorizontal: 6,
                        paddingVertical: 16,
                        shadowColor: 'rgba(176, 148, 235, 1)',
                        backgroundColor: '#FFF',
                        elevation: 10,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        borderRadius: 16,
                        marginHorizontal: 16,
                    }}
                >
                    <VoicePlayer
                        voiceUrl={'https://vodienstorage.s3.sa-east-1.amazonaws.com/Audio+-+Vodeus.m4a'}
                        playBtn={true}
                        waveColor={['#D89DF4', '#B35CF8', '#8229F4']}
                        playing={false}
                        startPlay={() => { }}
                        stopPlay={() => { }}
                        tinWidth={(windowWidth - 120) / 200}
                        mrg={windowWidth / 530}
                        duration={35000}
                        playSpeed={1}
                    />
                </View>
                <View style={{
                    width: 240,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 20
                }}>
                    <View style={styles.rowAlignItems}>
                        <Image
                            source={require("../../assets/login/small-logo.png")}
                            style={{
                                width: 30,
                                height: 30
                            }}
                        />
                        <DescriptionText
                            text='Vodeus'
                            marginLeft={12}
                        />
                    </View>
                    <View style={styles.rowAlignItems}>
                        <DescriptionText
                            text={likeNumber.toString()}
                        />
                        <HeartIcon
                            isLike={check}
                            marginLeft={12}
                            OnSetLike={() => {
                                if (check) setLikeNumber(likeNumber - 1);
                                else setLikeNumber(likeNumber + 1)
                                setCheck(!check);
                            }}
                        />
                    </View>
                </View>
                <View style={{
                    alignItems: 'center',
                    marginTop: -10
                }}>
                    <TouchableOpacity disabled={isLoading} onPress={() => shareAudio()}>
                        <SvgXml
                            width={25}
                            height={25}
                            xml={shareSvg}
                        />
                    </TouchableOpacity>
                    <DescriptionText
                        text={t("Make your friends know about vodeus")}
                        fontSize={11}
                        letterSpacing={0.08}
                        color='rgba(54, 18, 82, 0.8)'
                    />
                </View>
                <View
                    style={{
                        paddingHorizontal: 16,
                        width: '100%',
                        marginBottom: 10
                    }}
                >
                    <MyButton
                        label={t("Next")}
                        onPress={() => onNavigate('Home', { isFirst: true, popUp: true })}
                    />
                </View>
            </View>
            {
                isLoading &&
                <View style={{
                    position: 'absolute',
                    width: '100%',
                    alignItems: 'center',
                    marginTop: 300,
                }}>
                    <Progress.Circle
                        indeterminate
                        size={30}
                        color="rgba(0, 0, 255, .7)"
                        style={{ alignSelf: "center" }}
                    />
                </View>
            }
        </ImageBackground>
    );
};

export default WelcomeAudioScreen;