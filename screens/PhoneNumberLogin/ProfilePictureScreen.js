import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, Image, Text, TouchableOpacity, Platform, Pressable, Modal } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'rn-fetch-blob';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import rightArrowSvg from '../../assets/phoneNumber/right-arrow.svg';
import addSvg from '../../assets/phoneNumber/add.svg';
import closeSvg from '../../assets/phoneNumber/close.svg';
import checkSvg from '../../assets/phoneNumber/check.svg';
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
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/actions';

const ProfilePictureScreen = (props) => {

    let initId = Math.max(Math.ceil(Math.random() * 11), 1);

    const [modalVisible, setModalVisible] = useState(false);
    const [source, setSource] = useState(null);
    const [avatarId, setAvatarId] = useState(initId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    const options = {
        width: 500,
        height: 500,
        compressImageMaxWidth: 500,
        compressImageMaxHeight: 500,
        avoidEmptySpaceAroundImage: true,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: "photo",
    }

    const handleSubmit = async () => {
        let formData = new FormData();
        formData.append('avatarNumber', avatarId);
        if (source) {
            const imagePath = Platform.OS == 'android' ? source.path : decodeURIComponent(source.path.replace('file://', ''));
            const mimeType = source.mime;
            const fileData = {
                uri: imagePath,
                type: mimeType,
                name: 'avatar',
            }
            formData.append('file', fileData);
        }
        setLoading(true);
        AuthService.uploadPhoto(formData)
            .then(async res => {
                AuthService.getUserInfo().then(async res => {
                    if (mounted.current) {
                        setLoading(false);
                        const jsonRes = await res.json();
                        if (res.respInfo.status == 200) {
                            dispatch(setUser(jsonRes));
                            onNavigate("AddFriend");
                        }
                        else {
                            setError(jsonRes.message);
                        }
                    }
                })
                    .catch(err => {
                        console.log(err);
                    });

            })
            .catch(err => {
                console.log(err);
            });
    }

    const selectFileByCamera = async () => {
        await ImagePicker.openCamera(options).then(image => {
            if (mounted.current) {
                setSource(image);
                setAvatarId(0);
                setModalVisible(false);
            }
        })
            .catch(err=>{
                console.log(err);
            })
        ;
    }

    const selectFile = async () => {
        await ImagePicker.openPicker(options).then(image => {
            if (mounted.current) {
                setSource(image);
                setAvatarId(0);
                setModalVisible(false);
            }
        })
        .catch(err=>{
            console.log(err);
        })
        ;
    }

    useEffect(() => {
        mounted.current = true;
        return ()=>{
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
                    progress={5}
                />
                <TouchableOpacity
                    onPress={() => {
                        setSource(null);
                        setAvatarId(initId);
                        handleSubmit();
                    }}
                >
                    <DescriptionText
                        text={t("Skip")}
                        color="#8327D8"
                        fontSize={17}
                        lineHeight={28}
                    />
                </TouchableOpacity>
            </View>
            <TitleText
                text={t("Add a profile picture")}
                textAlign='center'
            />
            <DescriptionText
                text={t("Help your friends recognize you!")}
                fontSize={15}
                lineHeight={24}
                textAlign='center'
                marginTop={8}
            />
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 24
            }}>
                <View style={{
                    width: 160,
                    height: 160,
                    borderRadius: 80,
                    borderWidth: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    borderColor: '#FFF',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                >
                    <Image source={source ? { uri: source.path } : Avatars[avatarId].uri}
                        style={{
                            width: source ? 160 : 100,
                            height: source ? 160 : 100,
                            borderWidth: source ? 1 : 0,
                            borderColor: '#F2F0F5',
                            borderRadius: source ? 80 : 0,
                        }}
                    />
                </View>
                {(source || avatarId > 0) && <Pressable style={{
                    position: 'absolute',
                    bottom: 0,
                    left: windowWidth / 2 + 30,
                    width: 50,
                    height: 50,
                    borderWidth: 3,
                    borderRadius: 25,
                    borderColor: '#FFF',
                    backgroundColor: '#E41717',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                    onPress={() => {
                        setAvatarId(0);
                        setSource(null);
                    }}
                >
                    <SvgXml
                        width={24}
                        height={24}
                        xml={closeSvg}
                    />
                </Pressable>}
            </View>
            <DescriptionText
                text={t("Select avatar or upload your own photo")}
                fontSize={15}
                lineHeight={24}
                textAlign='center'
                marginTop={26}
            />
            <ScrollView>
                <View style={{
                    padding: 8,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <Pressable style={{
                        width: (windowWidth - 100) / 4,
                        height: (windowWidth - 100) / 4,
                        marginVertical: 8,
                        marginHorizontal: 8,
                        borderRadius: (windowWidth - 100) / 8,
                        borderWidth: 2,
                        borderColor: '#EBA4F3',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#FFF'
                    }}
                        onPress={() => setModalVisible(true)}
                    >
                        <SvgXml
                            width={24}
                            height={24}
                            xml={addSvg}
                        />
                    </Pressable>
                    {
                        Avatars.map((item, index) => {
                            if (index == 0) return null;
                            return <TouchableOpacity
                                key={"animalAvatar" + index.toString()}
                                style={{
                                    width: (windowWidth - 100) / 4,
                                    height: (windowWidth - 100) / 4,
                                    marginVertical: 8,
                                    marginHorizontal: 8,
                                    borderRadius: (windowWidth - 100) / 8,
                                    borderWidth: 2,
                                    borderColor: index == avatarId ? '#EBA4F3' : '#FFF',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#FFE8E8'
                                }}
                                onPress={() => { setAvatarId(index); setSource(null); }}
                            >
                                <Image source={Avatars[index].uri}
                                    style={{
                                        width: 40,
                                        height: 40
                                    }}
                                />
                                {index == avatarId && <SvgXml
                                    width={24}
                                    height={24}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0
                                    }}
                                    xml={checkSvg}
                                />}
                            </TouchableOpacity>
                        })
                    }
                </View>
                <View
                    style={{
                        width: windowWidth,
                        height: 70
                    }}
                >
                </View>
            </ScrollView>
            <TouchableOpacity style={{
                position: 'absolute',
                right: 16,
                bottom: 16,
            }}
                onPress={handleSubmit}
                disabled={source == null && avatarId == 0}
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
                    colors={(source == null && avatarId == 0) ? ['#FBF2FF', '#F7E5FF', '#E5D1FF'] : ['#D89DF4', '#B35CF8', '#8229F4']}
                >
                    <SvgXml
                        width={32}
                        height={32}
                        xml={rightArrowSvg}
                    />
                </LinearGradient>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    //  Alert.alert("Modal has been closed.");
                    setModalVisible(!modalVisible);
                }}
            >
                <Pressable onPressOut={() => setModalVisible(false)} style={[styles.centeredView, { justifyContent: 'flex-end', paddingHorizontal: 8 }]}>
                    <View
                        style={{
                            borderRadius: 14,
                            marginBottom: 8,
                            backgroundColor: '#FFF'
                        }}
                    >
                        <Pressable
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                paddingVertical: 16,
                                width: windowWidth - 16,
                                borderBottomWidth: 1,
                                borderColor: 'rgba(0, 0, 0, 0.15)'
                            }}
                            onPress={() => selectFileByCamera()}
                        >
                            <DescriptionText
                                text={t("Camera")}
                                color='#8327D8'
                                fontSize={20}
                                lineHeight={24}
                            />
                        </Pressable>
                        <Pressable
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                paddingVertical: 16,
                                width: windowWidth - 16,
                            }}
                            onPress={() => selectFile()}
                        >
                            <DescriptionText
                                text={t("Gallery")}
                                color='#8327D8'
                                fontSize={20}
                                lineHeight={24}
                            />
                        </Pressable>
                    </View>
                    <Pressable
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            paddingVertical: 16,
                            backgroundColor: '#FFF',
                            width: windowWidth - 16,
                            borderRadius: 14,
                            marginBottom: 50
                        }}
                        onPress={() => setModalVisible(false)}
                    >
                        <SemiBoldText
                            text={t("Cancel")}
                            color='#8327D8'
                            fontSize={20}
                            lineHeight={24}
                        />
                    </Pressable>
                </Pressable>
            </Modal>
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

export default ProfilePictureScreen;