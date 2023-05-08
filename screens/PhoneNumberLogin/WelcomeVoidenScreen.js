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
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/actions';

const WelcomeVoidenScreen = (props) => {

    const { t, i18n } = useTranslation();

    const onNavigate = (des, par = null) => {
        const resetActionTrue = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: des, params: par })],
        });
        props.navigation.dispatch(resetActionTrue);
    }

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

                <TouchableOpacity
                    onPress={() => {
                        onNavigate("AddFriend",{isSimple: true});
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
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <TitleText
                    text={t("Welcome to Voiden")}
                    fontSize={30}
                    lineHeight={33}
                    color='#B35CF8'
                />
                <Image
                    source={require('../../assets/login/Voiden.png')}
                    style={{ width: 187, height: 150, marginTop: 70 }}
                />
            </View>
        </ImageBackground>
    );
};

export default WelcomeVoidenScreen;