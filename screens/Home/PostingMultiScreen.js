import React, { useEffect } from 'react';
import {
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import boldCloseSvg from '../../assets/post/ph_x.svg';
import circleCloseSvg from '../../assets/post/circle_close_green.svg';
import blackCameraSvg from '../../assets/post/blackCamera.svg';
import whiteMicrophoneSvg from '../../assets/post/white_microphone.svg';
import triangleSvg from '../../assets/common/green_triangle.svg';
import simplePauseSvg from '../../assets/common/simple_pause_green.svg';
import { windowWidth } from '../../config/config';
import '../../language/i18n';
import { styles } from '../style/Common';
import { PickImage } from '../component/PickImage';
import { MediumText } from '../component/MediumText';
import { SemiBoldText } from '../component/SemiBoldText';
import { ScrollView } from 'react-native-gesture-handler';
import VoicePlayer from './VoicePlayer';
import RNFetchBlob from 'rn-fetch-blob';
import VoiceService from '../../services/VoiceService';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { NavigationActions, StackActions } from 'react-navigation';
import { setUser } from '../../store/actions';
import * as Progress from "react-native-progress";
import LinearGradient from 'react-native-linear-gradient';
import { DescriptionText } from '../component/DescriptionText';

const PostingMultiScreen = (props) => {

    let { user, socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    const dispatch = useDispatch();

    const params = props.navigation.state.params;

    const { t, i18n } = useTranslation();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [photoInfo, setPhotoInfo] = useState();
    const [pickModal, setPickModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [warning, setWarning] = useState(false);

    const onSetRecordImg = async (img) => {
        setPhotoInfo(img);
        setPickModal(false);
    }

    const onNavigate = (des, par = null) => {
        const resetActionTrue = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: des, params: par })],
        });
        props.navigation.dispatch(resetActionTrue);
    }

    const onSetWarning = () => {
        setWarning(true);
        setTimeout(() => {
            setWarning(false);
        }, 2000)
    }

    const dirs = RNFetchBlob.fs.dirs;

    const path = Platform.select({
        ios: `${dirs.CacheDir}/hello.m4a`,
        android: `${dirs.CacheDir}/hello.mp3`,
    });

    const handleSubmit = async () => {
        if (!params?.recordSecs && !params?.recordSecs) {
            onSetWarning();
            return;
        }
        const imagePath = Platform.OS == 'android' ? photoInfo?.path : decodeURIComponent(photoInfo?.path.replace('file://', ''));

        let formData = [
            { name: 'title', data: title },
            { name: 'content', data: content },
            // { name: 'category', data: Categories[category].label },
            // { name: 'privacy', data: String(visibleStatus) },
            // { name: 'notSafe', data: String(notSafe) },
            // { name: 'address', data: String(storyAddress) },
            // { name: 'createdAt', data: String(params.createdAt) }
        ];
        if (params?.recordSecs) {
            formData.push({
                name: 'file', filename: Platform.OS === 'android' ? `${title}.mp3` : `${title}.m4a`, data: RNFetchBlob.wrap(path)
            })
            formData.push({ name: 'duration', data: String(params.recordSecs) })
        }
        if (photoInfo?.path) {
            formData.push({
                name: 'imageFile', filename: 'recordImage', data: RNFetchBlob.wrap(imagePath)
            })
        }
        setIsLoading(true);
        VoiceService.postVoice(formData, params?.isPast).then(async res => {
            const jsonRes = await res.json();
            if (res.respInfo.status !== 201) {
            } else {
                Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                socketInstance.emit("newVoice", { uid: user.id });
                if (!params.isPast) {
                    let userData = { ...user };
                    userData.score += 8;
                    dispatch(setUser(userData));
                }
                onNavigate("Home", { isDiscover: true, shareInfo: jsonRes })
            }
        })
            .catch(err => {
                console.log(err);
            });
        props.navigation.navigate("Home");
    }

    useEffect(() => {
    }, [])
    return (
        <KeyboardAvoidingView
            style={{
                backgroundColor: '#FFF',
                flex: 1,
                paddingHorizontal: 16
            }}
        >
            {warning && <View style={{
                position: 'absolute',
                top: 40,
                width: windowWidth,
                alignItems: 'center',
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
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <DescriptionText
                        text={t("You must add a writing or vocal posting")}
                        fontSize={15}
                        lineHeight={18}
                        color='#FFF'
                    />
                </View>
            </View>}
            <ScrollView>
                <View style={[styles.titleContainer, { borderBottomWidth: 0 }]}>
                    <TouchableOpacity style={{ position: 'absolute', right: 0 }} onPress={() => props.navigation.goBack()}>
                        <SvgXml
                            width={24}
                            height={24}
                            xml={boldCloseSvg}
                        />
                    </TouchableOpacity>
                    <View style={{
                        width: 75,
                        height: 5,
                        borderRadius: 5,
                        backgroundColor: '#E5E6EB'
                    }}>
                    </View>
                </View>
                <TextInput
                    style={{
                        width: windowWidth - 32,
                        height: 50,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        marginTop: 18,
                        fontSize: 20,
                        lineHeight: 30,
                        color: '#484444',
                        fontFamily: "SFProDisplay-Semibold",
                    }}
                    value={title}
                    onChangeText={v => setTitle(v)}
                    placeholder={t('Add a title')}
                />
                <TextInput
                    style={{
                        width: windowWidth - 32,
                        height: 104,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        marginTop: 16,
                        marginBottom: 19,
                        fontSize: 20,
                        lineHeight: 30,
                        color: '#484444',
                        fontFamily: "SFProDisplay-Regular",
                    }}
                    value={content}
                    multiline={true}
                    textAlignVertical='top'
                    numberOfLines={5}
                    maxLength={150}
                    onChangeText={v => setContent(v)}
                    placeholder={t("Write something...")}
                    placeholderTextColor="#D2D2D2"
                />
                {photoInfo ?
                    <ImageBackground
                        source={{ uri: photoInfo.path }}
                        resizeMode="cover"
                        style={{ width: windowWidth - 32, height: 220, alignItems: 'flex-end' }}
                        imageStyle={{
                            borderRadius: 12,
                        }}
                    >
                        <TouchableOpacity style={{
                            width: 20,
                            height: 20,
                            borderRadius: 15,
                            backgroundColor: '#F8F0FF',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginTop: 16,
                            marginRight: 18
                        }}
                            onPress={() => setPhotoInfo(null)}
                        >
                            <SvgXml
                                xml={circleCloseSvg}
                            />
                        </TouchableOpacity>
                    </ImageBackground>
                    :
                    <TouchableOpacity style={{
                        width: windowWidth - 32,
                        height: 220,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                        onPress={() => setPickModal(true)}
                    >
                        <SvgXml
                            xml={blackCameraSvg}
                            width={30}
                            height={30}
                        />
                    </TouchableOpacity>
                }
                <View style={{
                    width: windowWidth - 32,
                    height: 80,
                    borderRadius: 12,
                    backgroundColor: '#0B776C',
                    marginTop: 23,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {!params?.recordSecs ? <ImageBackground
                        source={require('../../assets/post/mask_group.png')}
                        style={{
                            width: windowWidth - 32,
                            height: 80,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                        imageStyle={{
                            borderRadius: 12
                        }}
                    >
                        <MediumText
                            text={t('Click to record your voice')}
                            fontSize={20}
                            lineHeight={26}
                            color='#FFF'
                            marginLeft={24}
                        />
                        <TouchableOpacity style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 54,
                            height: 54,
                            backgroundColor: '#3C9289',
                            borderRadius: 30,
                            marginRight: 16
                        }}
                            onPress={() => props.navigation.navigate('HoldRecord')}
                        >
                            <SvgXml
                                xml={whiteMicrophoneSvg}
                            />
                        </TouchableOpacity>
                    </ImageBackground>
                        :
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'center'
                        }}>
                            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                                <LinearGradient
                                    colors={['#3C9289', '#3C9289']}
                                    locations={[0, 1]}
                                    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                                    style={{
                                        width: 37,
                                        height: 37,
                                        borderRadius: 20,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 4
                                    }}
                                >
                                    <SvgXml
                                        xml={isPlaying ? simplePauseSvg : triangleSvg}
                                        width={13.33}
                                        height={16.67}
                                    />
                                </LinearGradient>
                            </TouchableOpacity>
                            <VoicePlayer
                                waveColor={['#FFF', '#FFF', '#FFF']}
                                playing={isPlaying}
                                stopPlay={() => setIsPlaying(false)}
                                startPlay={() => setIsPlaying(true)}
                                tinWidth={1.86}
                                mrg={0.93}
                                height={39}
                                duration={params.recordSecs}
                            />
                        </View>
                    }
                </View>
            </ScrollView>
            <TouchableOpacity style={{
                position: 'absolute',
                bottom: 30,
                left: 16,
                width: windowWidth - 32,
                height: 56,
                borderRadius: 30,
                backgroundColor: '#09655D',
                justifyContent: 'center',
                alignItems: 'center'
            }}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                {!isLoading ? <SemiBoldText
                    text={t('Publish')}
                    fontSize={16}
                    lineHeight={22}
                    color='#FFF'
                /> :
                    <Progress.Circle
                        indeterminate
                        size={30}
                        color="rgba(255, 255, 255, .7)"
                        style={{ alignSelf: "center" }}
                    />
                }
            </TouchableOpacity>
            {pickModal &&
                <PickImage
                    onCloseModal={() => setPickModal(false)}
                    onSetImageSource={(img) => onSetRecordImg(img)}
                />
            }
        </KeyboardAvoidingView>
    );
};

export default PostingMultiScreen;