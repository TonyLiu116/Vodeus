import React, { useState, useEffect, useRef, useReducer } from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Image,
    RefreshControl,
    Text,
    TextInput,
    Pressable,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';

import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';
import { BottomButtons } from '../component/BottomButtons';
import black_settingsSvg from '../../assets/notification/black_settings.svg';
import searchSvg from '../../assets/login/search.svg';
import new_messageSvg from '../../assets/chat/new_message.svg';
import black_new_messageSvg from '../../assets/chat/black_new_message.svg';
import closeCircleSvg from '../../assets/common/close-circle.svg';

import { windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import { SemiBoldText } from '../component/SemiBoldText';
import VoiceService from '../../services/VoiceService';
import { useSelector } from 'react-redux';
import { RecordIcon } from '../component/RecordIcon';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { TitleText } from '../component/TitleText';
import { FriendItem } from '../component/FriendItem';
import { NewChat } from '../component/NewChat';
import { ChatListItem } from '../component/ChatListItem';

const ChatScreen = (props) => {

    let { user, refreshState, socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    const mounted = useRef(false);

    const { t, i18n } = useTranslation();

    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFriendsList, setShowFriendsList] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isSearch, setIsSearch] = useState(false);
    const [label, setLabel] = useState('');

    const getFollowUsers = () => {
        VoiceService.getFollows(user.id, "Following")
            .then(async res => {
                if (res.respInfo.status === 200 && mounted.current) {
                    const jsonRes = await res.json();
                    setFriends([...jsonRes]);
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    const getConversations = () => {
        VoiceService.getConversations()
            .then(async res => {
                if (res.respInfo.status === 200 && mounted.current) {
                    const jsonRes = await res.json();
                    const userIds = jsonRes.map((item) => {
                        if (item.sender.id == user.id)
                            return item.receiver.id;
                        return item.sender.id;
                    });
                    setConversations(jsonRes);
                    setIsLoading(false);
                    socketInstance.emit("getUsersState", userIds, (res) => {
                        let tp = jsonRes.map((item, index) => {
                            let temp = item;
                            temp.lastSeen = res[index];
                            temp.state = 'stop';
                            return temp;
                        })
                        if(mounted.current)
                            setConversations([...tp]);
                    })
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    const loginListener = ({ user_id, v }) => {
        setConversations(prev => {
            let idx = 0;
            for (; idx < prev.length; idx++)
                if (prev[idx].sender.id == user_id || prev[idx].receiver.id == user_id) break;
            if (idx != prev.length) {
                prev[idx].lastSeen = v;
                return [...prev];
            }
            return prev;
        })
    }

    const stateListener = ({ fromUserId, toUserId, state, emoji }) => {
        setConversations(prev => {
            let idx = 0;
            for (; idx < prev.length; idx++)
                if ((prev[idx].sender.id == fromUserId && prev[idx].receiver.id == toUserId) ||
                    (prev[idx].sender.id == toUserId && prev[idx].receiver.id == fromUserId)
                ) break;
            if (idx != prev.length) {
                if (state == 'start' || state == 'stop')
                    prev[idx].state = state;
                else if (state == 'confirm') {
                    if (prev[idx].sender.id == toUserId) {
                        prev[idx].newsCount = 0;
                    }
                }
                else {
                    prev[idx].state = 'stop';
                    prev[idx].type = state;
                    prev[idx].emoji = emoji;
                    prev[idx].newsCount++;
                    if (prev[idx].sender.id != fromUserId) {
                        prev[idx].newsCount = 1;
                        let tp = prev[idx].sender;
                        prev[idx].sender = prev[idx].receiver;
                        prev[idx].receiver = tp;
                    }
                }
                return [...prev];
            }
            return prev;
        })
    }

    const onSetLabel = (v) => {
        setLabel(v);
    }

    const onRefresh = () => {
        setRefreshing(true);
        getFollowUsers();
        getConversations();
        setTimeout(() => {
            if (mounted.current)
                setRefreshing(false)
        }, 1000);
    };

    const OnDeleteChat = (index) => {
        VoiceService.deleteChat(conversations[index].id);
        setConversations(prev => {
            if (prev[index].receiver.id == user.id)
                prev[index].visible = false;
            else
                prev.splice(index, 1);
            return [...prev];
        })
    }

    useEffect(() => {
        mounted.current = true;
        getFollowUsers();
        getConversations();
        socketInstance.on("user_login", loginListener);
        socketInstance.on("chatState", stateListener);
        return () => {
            mounted.current = false;
            socketInstance.off("user_login", loginListener);
            socketInstance.off("chatState", stateListener);
        };
    }, [refreshState])

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <KeyboardAvoidingView
                style={{
                    backgroundColor: '#FFF',
                    flex: 1,
                }}
            >
                <View style={{
                    backgroundColor: "#F8F0FF",
                    borderBottomLeftRadius: 30
                }}>
                    <View
                        style={[
                            { marginTop: Platform.OS == 'ios' ? 50 : 20, paddingHorizontal: 20, marginBottom: 24 },
                            styles.rowSpaceBetween
                        ]}
                    >
                        <TouchableOpacity onPress={() => props.navigation.navigate('Setting')}>
                            <SvgXml
                                width={24}
                                height={24}
                                xml={black_settingsSvg}
                            />
                        </TouchableOpacity>
                        <TitleText
                            text={t("Chat")}
                            fontSize={20}
                            color="#281E30"
                        />
                        <TouchableOpacity onPress={() => setShowFriendsList(true)}>
                            <SvgXml
                                width="24"
                                height="24"
                                xml={black_new_messageSvg}
                            />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        style={{
                            paddingRight: 16,
                            height: 95
                        }}
                    >
                        {friends.map((item, index) =>
                            {
                                if (item.user.name.toLowerCase().includes(label.toLowerCase())) {
                                    return <FriendItem
                                        key={index + 'friendItem_chat'}
                                        props={props}
                                        info={item}
                                        type='chatUser'
                                        isUserName={true}
                                    />
                                }
                            }
                        )
                        }
                    </ScrollView>
                </View>
                <View style={{
                    flex: 1,
                    backgroundColor: "#F8F0FF",
                }}>
                    <View style={{
                        flex: 1,
                        backgroundColor: "#FFF",
                        borderTopRightRadius: 30,
                        alignItems: 'center'
                    }}>
                        {!isSearch ?
                            <>
                                <View style={[styles.paddingH16, { marginTop: 8 }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <SvgXml
                                            width="20"
                                            height="20"
                                            xml={searchSvg}
                                            style={styles.searchIcon}
                                        />
                                        <Pressable
                                            style={styles.searchBox}
                                            onPress={() => setIsSearch(true)}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 17,
                                                    color: 'grey'
                                                }}
                                            >{t("Enter username")}</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </> :
                            <View style={{ width: windowWidth - 32, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#F2F0F5',
                                    borderRadius: 24,
                                    borderWidth: 1,
                                    borderColor: '#CC9BF9',
                                    height: 44,
                                    width: windowWidth - 95,
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
                                            placeholder={t("Search")}
                                            onChangeText={(v) => onSetLabel(v)}
                                            placeholderTextColor="rgba(59, 31, 82, 0.6)"
                                        />
                                    </View>
                                    {label != '' &&
                                        <TouchableOpacity
                                            onPress={() => onSetLabel('')}
                                        >
                                            <SvgXml
                                                width="30"
                                                height="30"
                                                xml={closeCircleSvg}
                                            />
                                        </TouchableOpacity>}
                                </View>
                                <TouchableOpacity onPress={() => { setIsSearch(false); onSetLabel('') }}>
                                    <TitleText
                                        text={t('Cancel')}
                                        fontSize={17}
                                        fontFamily='SFProDisplay-Regular'
                                        color='#8327D8'
                                    />
                                </TouchableOpacity>
                            </View>
                        }
                        {(isLoading == false && conversations.length == 0) && <>
                            <Image
                                source={require('../../assets/chat/illustration.png')}
                                style={{ width: windowWidth, height: windowWidth / 2, marginTop: 50 }}
                            />
                            <Text
                                numberOfLines={2}
                                style={{
                                    fontFamily: "SFProDisplay-Regular",
                                    fontSize: 17,
                                    color: '#281E30',
                                    textAlign: 'center',
                                    lineHeight: 28,
                                    width: 182,
                                    marginTop: 22
                                }}
                            >
                                {t("You have no conversations yet")}
                            </Text>
                            <TouchableOpacity onPress={() => setShowFriendsList(true)} style={[styles.rowAlignItems, { marginTop: 18 }]}>
                                <SvgXml
                                    width={24}
                                    height={24}
                                    xml={new_messageSvg}
                                />
                                <SemiBoldText
                                    text={t("New message")}
                                    fontSize={15}
                                    lineHeight={24}
                                    color='#8327D8'
                                    marginLeft={10}
                                />
                            </TouchableOpacity>
                        </>}
                        <ScrollView
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                />
                            }
                            style={{
                                marginBottom: 75
                            }}
                        >
                            {
                                conversations.map((item, index) =>
                                    <ChatListItem
                                        key={"chatListItem" + item.id + index.toString()}
                                        props={props}
                                        info={item}
                                        label={label}
                                        onDeleteItem={() => OnDeleteChat(index)}
                                    />
                                )
                            }
                        </ScrollView>
                        {isLoading == true && <Progress.Circle
                            indeterminate
                            size={30}
                            color="rgba(0, 0, 255, .7)"
                            style={{ alignSelf: "center", marginTop: 70 }}
                        />}
                    </View>
                </View>
                <BottomButtons
                    active='chat'
                    props={props}
                />
                <RecordIcon
                    props={props}
                    bottom={27}
                    left={windowWidth / 2 - 27}
                />
                {showFriendsList && <NewChat
                    props={props}
                    onCloseModal={() => setShowFriendsList(false)}
                />}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}

export default ChatScreen;
