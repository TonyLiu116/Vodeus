import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    KeyboardAvoidingView,
    TouchableOpacity,
    Image,
    TextInput
} from 'react-native';

import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from '../component/MyButton';
import { MyTextField } from '../component/MyTextField';
import { ConfirmVerify } from '../component/ConfirmVerify';
import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import greenCheckSvg from '../../assets/friend/green-check.svg';
import searchSvg from '../../assets/login/search.svg';
import { styles } from '../style/Common';
import { SemiBoldText } from '../component/SemiBoldText';
import EditService from '../../services/EditService';
import * as bcrypt from 'bcryptjs';

import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/actions';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatars, windowHeight, windowWidth } from '../../config/config';
import { ScrollView } from 'react-native-gesture-handler';
import VoiceService from '../../services/VoiceService';
import { ContactList } from '../component/ContactList';

const AddFriendScreen = (props) => {

    const { t, i18n } = useTranslation();

    const [activeUsers, setActiveUsers] = useState([]);
    const [followedUsers, setFollowedUsers] = useState([]);
    const [label, setLabel] = useState('');

    const mounted = useRef(false);

    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const onContinue = () => {
        props.navigation.navigate("Tutorial");
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
        <SafeAreaView
            style={{
                backgroundColor: '#FFF',
                flex: 1
            }}
        >
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                alignItems: 'center',
                marginTop: 26
            }}>
                <View></View>
                <TitleText
                    text={t("Add friends")}
                    marginLeft={40}
                    fontSize={20}
                    lineHeight={24}
                />
                <TouchableOpacity
                    onPress={() => onContinue()}
                >
                    <DescriptionText
                        text={t("Skip")}
                        color="#8327D8"
                        fontSize={17}
                        lineHeight={28}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ width: windowWidth, marginTop: 8, alignItems: 'center' }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#F2F0F5',
                    borderRadius: 24,
                    height: 44,
                    width: windowWidth - 50,
                    paddingHorizontal: 12
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <SvgXml
                            width="20"
                            height="20"
                            xml={searchSvg}
                        />
                        <TextInput
                            style={[styles.searchInput, { paddingLeft: 12, width: windowWidth - 175 }]}
                            value={label}
                            color='#281E30'
                            autoFocus={true}
                            placeholder={t("Search your friends from here")}
                            onChangeText={(v) => onSetLabel(v)}
                            placeholderTextColor="rgba(59, 31, 82, 0.6)"
                        />
                    </View>
                </View>
            </View>
            <ScrollView
                style={{
                    maxHeight: windowHeight / 2
                }}
            >
                <SemiBoldText
                    text={t("Add users as friends")}
                    fontSize={17}
                    lineHeight={28}
                    marginTop={22}
                    marginLeft={16}
                />
                {
                    activeUsers.map((item, index) => {
                        let isFollowed = followedUsers.includes(index);
                        if (item.name == null || item.id == user.id || !item.name.toLowerCase().includes(label.toLowerCase()))
                            return null;
                        return <View key={"AddFriends" + index.toString()} style={[styles.rowSpaceBetween, { marginTop: 16 }]}>
                            <View style={styles.rowAlignItems}>
                                <Image
                                    source={item.avatar ? { uri: item.avatar.url } : Avatars[item.avatarNumber].uri}
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 24,
                                        marginLeft: 16,
                                        backgroundColor: '#C4C4C4'
                                    }}
                                />
                                <View style={{
                                    marginLeft: 16
                                }}>
                                    <SemiBoldText
                                        text={item.name}
                                        fontSize={15}
                                        lineHeight={24}
                                    />
                                    {/* <DescriptionText
                                        text={item.phoneNumber}
                                        fontSize={13}
                                        lineHeight={21}
                                    /> */}
                                </View>
                            </View>
                            <TouchableOpacity style={{
                                backgroundColor: isFollowed ? '#ECF8EE' : '#F2F0F5',
                                paddingHorizontal: 16,
                                paddingVertical: 9,
                                borderRadius: 8,
                                marginRight: 16
                            }}
                                onPress={() => onFollowFriend(index)}
                                disabled={isFollowed}
                            >
                                <View style={styles.rowAlignItems}>
                                    {isFollowed && <SvgXml
                                        width={20}
                                        height={20}
                                        style={{
                                            marginRight: 4
                                        }}
                                        xml={greenCheckSvg}
                                    />}
                                    <SemiBoldText
                                        text={t(isFollowed ? "Followed" : "Follow")}
                                        fontSize={13}
                                        lineHeight={21}
                                        color={isFollowed ? '#1A4C22' : '#8327D8'}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    })
                }
                <View style={{ height: 100, width: 10 }}>
                </View>
            </ScrollView>
            {/* <ScrollView>
                <SemiBoldText
                    text={t("Invite your contacts")}
                    fontSize={17}
                    lineHeight={28}
                    marginTop={22}
                    marginLeft={16}
                />
                <ContactList
                    props={props}
                />
            </ScrollView> */}
            <View style={{
                position: 'absolute',
                bottom: 30,
                width: windowWidth,
                paddingHorizontal: 16
            }}>
                <MyButton
                    label={t("Continue")}
                    onPress={() => onContinue()}
                />
            </View>
        </SafeAreaView>
    );
};

export default AddFriendScreen;