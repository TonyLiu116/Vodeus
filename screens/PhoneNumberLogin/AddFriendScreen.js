import React, { useEffect, useRef, useState } from 'react';
import {
    ImageBackground,
    Platform,
    TouchableOpacity,
    View
} from 'react-native';

import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from '../component/MyButton';
import { TitleText } from '../component/TitleText';
import { styles } from '../style/Common';

import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import { windowWidth } from '../../config/config';
import '../../language/i18n';
import VoiceService from '../../services/VoiceService';
import { ContactList } from '../component/ContactList';

const AddFriendScreen = (props) => {

    const param = props.navigation.state.params;
    const isSimple = param?.isSimple;

    const { t, i18n } = useTranslation();

    const [activeUsers, setActiveUsers] = useState([]);
    const [followedUsers, setFollowedUsers] = useState([]);
    const [label, setLabel] = useState('');

    const mounted = useRef(false);

    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const onContinue = () => {
        props.navigation.navigate("WelcomeAudio");
    }

    const getActiveUsers = () => {
        VoiceService.getActiveUsers().then(async res => {
            const jsonRes = await res.json();
            if (res.respInfo.status == 200 && mounted.current) {
                setActiveUsers(jsonRes);
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    const onFollowFriend = (index) => {
        VoiceService.followFriend(activeUsers[index].id);
        let tp = followedUsers;
        tp.push(index);
        setFollowedUsers([...tp]);
    }

    const onSetLabel = (v) => {
        setLabel(v);
    }

    useEffect(() => {
        mounted.current = true;
        getActiveUsers();
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
                    { marginTop: Platform.OS == 'ios' ? 60 : 30, paddingHorizontal: 12, marginBottom: 30, height: 30 },
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
                <TitleText
                    text={t("Invite your friends & family")}
                    fontSize={20}
                    lineHeight={24}
                />
                <TouchableOpacity
                    onPress={() => onContinue()}
                    disabled={isSimple}
                >
                    <DescriptionText
                        text={isSimple ? "    " : t("Pass")}
                        color="#8327D8"
                        fontSize={17}
                        lineHeight={28}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView>
                <ContactList
                    props={props}
                />
            </ScrollView>
            {!isSimple&&<View style={{
                position: 'absolute',
                bottom: 30,
                width: windowWidth,
                paddingHorizontal: 16
            }}>
                <MyButton
                    label={t("Continue")}
                    onPress={() => onContinue()}
                />
            </View>}
        </ImageBackground>
    );
};

export default AddFriendScreen;