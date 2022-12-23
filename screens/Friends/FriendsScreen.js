import React, { useState, useEffect, useRef, useReducer } from 'react';
import {
    View,
    TouchableOpacity,
    ScrollView,
    Animated,
    SafeAreaView,
    Image
} from 'react-native';

import { DescriptionText } from '../component/DescriptionText';
import { SvgXml } from 'react-native-svg';
import { BottomButtons } from '../component/BottomButtons';
import searchSvg from '../../assets/login/search2.svg';
import closeCircleSvg from '../../assets/common/close-circle.svg';
import greenCheckSvg from '../../assets/friend/green-check.svg';
import ShareSvg from '../../assets/friend/share2.svg';
import addSvg from '../../assets/friend/add2.svg';
import { Avatars, windowHeight, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import { SemiBoldText } from '../component/SemiBoldText';
import VoiceService from '../../services/VoiceService';
import { useSelector, useDispatch } from 'react-redux';
import { setRefreshState } from '../../store/actions';
import { RecordIcon } from '../component/RecordIcon';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { TitleText } from '../component/TitleText';
import { TextInput } from 'react-native-gesture-handler';
import { ContactList } from '../component/ContactList';
import Share from 'react-native-share';

const FriendsScreen = (props) => {

    const { t, i18n } = useTranslation();

    let { user, refreshState, socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    const [requests, setRequests] = useState([]);
    const [allRequests, setAllRequests] = useState(false);
    const [suggests, setSuggests] = useState([]);
    const [moreSuggests, setMoreSuggests] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [followings, setFollowings] = useState([]);
    const [isFollowers, setIsFollowers] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [invites, setInvites] = useState([]);
    const [isSearch, setIsSearch] = useState(false);
    const [label, setLabel] = useState('');

    const scrollRef = useRef();
    const mounted = useRef(false);
    const scrollIndicator = useRef(new Animated.Value(0)).current;

    const scrollIndicatorPosition = Animated.multiply(
        scrollIndicator,
        142 / windowWidth
    )

    const onAcceptRequest = (index) => {
        VoiceService.acceptFriend(requests[index].fromUser.id, requests[index].id).then(async res => {
            if (res.respInfo.status == 201 && mounted.current) {
                setRequests(prev => {
                    prev.splice(index, 1);
                    return [...prev]
                });
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    const onDeleteRequest = (index) => {
        VoiceService.deleteNotification(requests[index].id);
        setRequests(prev => {
            prev.splice(index, 1);
            return [...prev]
        });
    }

    const onSendRequest = (index) => {
        VoiceService.followFriend(suggests[index].user.id);
        setSuggests(prev => {
            prev.splice(index, 1);
            return [...prev]
        });
    }

    const onDeleteSuggest = (index) => {
        VoiceService.deleteSuggest(suggests[index].user.id);
        setSuggests(prev => {
            prev.splice(index, 1);
            return [...prev]
        });
    }

    const onDeleteFollower = (index) => {
        VoiceService.deleteFollower(followers[index].user.id);
        setFollowers(prev => {
            prev.splice(index, 1);
            return [...prev]
        });
    }

    const onDeleteFollowing = (index) => {
        VoiceService.deleteFollowing(followings[index].user.id);
        setFollowings(prev => {
            prev.splice(index, 1);
            return [...prev]
        });
    }

    const onInviteFriend = (index) => {
        VoiceService.inviteFriend(contacts[index].user.id);
        setInvites(prev => {
            prev.push(contacts[index].user.id);
            return [...prev]
        });
    }

    const onCompare = (a, b) => {
        if (a.user.name < b.user.name)
            return -1;
        if (a.createdAt > b.createdAt)
            return 1;
        return 0;
    }

    const getUsers = () => {
        let followers = [], followings = [], contacts = [];
        VoiceService.getRequests(0).then(async res => {
            if (res.respInfo.status == 200 && mounted.current) {
                const jsonRes = await res.json();
                setRequests(jsonRes);
            }
        })
            .catch(err => {
                console.log(err);
            });
        VoiceService.getSuggests(0).then(async res => {
            if (res.respInfo.status == 200 && mounted.current) {
                const jsonRes = await res.json();
                setSuggests(jsonRes);
            }
        })
            .catch(err => {
                console.log(err);
            });
        VoiceService.getFollows(user.id, "Followers").then(async res => {
            if (res.respInfo.status === 200 && mounted.current) {
                const jsonRes = await res.json();
                setFollowers(jsonRes);
                const followerIds = new Set(jsonRes.map((item) => item.user.id));
                VoiceService.getFollows(user.id, "Following").then(async res => {
                    if (res.respInfo.status === 200 && mounted.current) {
                        const jsonRes1 = await res.json();
                        setFollowings(jsonRes1);
                        contacts = [...jsonRes, ...jsonRes1.filter(x => !followerIds.has(x.user.id))]
                        contacts.sort(onCompare);
                        setContacts(contacts);
                    }
                })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
            .catch(err => {
                console.log(err);
            });
        VoiceService.getInvites().then(async res => {
            if (res.respInfo.status == 200 && mounted.current) {
                const jsonRes = await res.json();
                setInvites(jsonRes);
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    const renderName = (fname, lname) => {
        let fullname = '';
        if (fname)
            fullname = fname;
        if (lname) {
            if (fname) fullname += '.';
            fullname += lname;
        }
        return (fullname == '' ? '' : "@") + fullname
    }

    const onShareLink = () => {
        Share.open({
            url: `https://vocco.app.link/${user.name}`,
            message: t("Hey! Are you ok? I'm a little tired of apps like Insta, BeReal etc. I want to share real moments with my loved ones, including you, on Vocco. Will you join me?") + '(' +  t("it's free!") + ')'
        }).then(res => {

        })
            .catch(err => {
                console.log("err");
            });;
    }

    useEffect(() => {
        mounted.current = true;
        getUsers();
        return () => {
            mounted.current = false;
        }
    }, [])

    return (
        <SafeAreaView
            style={{
                backgroundColor: '#FFF',
                flex: 1,
            }}
        >
            {isSearch ?
                <View style={[styles.paddingH16, { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
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
                                onChangeText={(v) => setLabel(v)}
                                placeholderTextColor="rgba(59, 31, 82, 0.6)"
                            />
                        </View>
                        {label != '' &&
                            <TouchableOpacity
                                onPress={() => setLabel('')}
                            >
                                <SvgXml
                                    width="30"
                                    height="30"
                                    xml={closeCircleSvg}
                                />
                            </TouchableOpacity>}
                    </View>
                    <TouchableOpacity onPress={() => { setIsSearch(false); setLabel('') }}>
                        <TitleText
                            text={t('Cancel')}
                            fontSize={17}
                            fontFamily='SFProDisplay-Regular'
                            color='#8327D8'
                        />
                    </TouchableOpacity>
                </View>
                : <View
                    style={[
                        { marginTop: 20, paddingHorizontal: 20 },
                        styles.rowSpaceBetween
                    ]}
                >
                    <TitleText
                        text={t("Friends")}
                        fontSize={28}
                        color="#281E30"
                    />
                    <View style={styles.rowAlignItems}>
                        <TouchableOpacity onPress={() => props.navigation.navigate("Search")}>
                            <SvgXml
                                width="24"
                                height="24"
                                xml={searchSvg}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => props.navigation.navigate('Chat')}>
                            <SvgXml
                                width="24"
                                height="24"
                                style={{ marginLeft: 20 }}
                                xml={addSvg}
                            />
                        </TouchableOpacity>
                    </View>
                </View>}
            <ScrollView
                style={{ marginBottom: Platform.OS == 'ios' ? 65 : 75, marginTop: 18 }}
            >
                <TouchableOpacity
                    style={[styles.rowSpaceBetween, { backgroundColor: '#F8F0FF', paddingVertical: 8, paddingHorizontal: 16 }]}
                    onPress={() => onShareLink()}
                >
                    <View style={styles.rowAlignItems}>
                        <Image
                            source={user.avatar ? { uri: user.avatar.url } : Avatars[user.avatarNumber].uri}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                            }}
                        />
                        <View style={{
                            marginLeft: 12
                        }}>
                            <SemiBoldText
                                text={t("Invite friends")}
                                fontSize={15}
                                lineHeight={24}
                            />
                            <DescriptionText
                                text={'vocco.ai/' + user.name}
                                fontSize={13}
                                lineHeight={21}
                            />
                        </View>
                    </View>
                    <SvgXml
                        xml={ShareSvg}
                    />
                </TouchableOpacity>
                <View style={[styles.rowAlignItems, { marginTop: 16 }]}>
                    <TouchableOpacity onPress={() => { scrollRef.current?.scrollTo({ x: 0, animated: true }); setIsFollowers(true); }} style={[styles.rowAlignItems, { marginLeft: 16, width: 126 }]}>
                        <SemiBoldText
                            text={t("Friends")}
                            fontSize={15}
                            lineHeight={24}
                            marginLeft={4}
                            fontFamily={isFollowers ? 'SFProDisplay-Semibold' : 'SFProDisplay-Regular'}
                        />
                        {!isSearch && <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                            backgroundColor: '#F2F0F5',
                            marginLeft: 8
                        }}>
                            <DescriptionText
                                text={followers.length}
                                fontSize={12}
                                lineHeight={16}
                                color='#281E30'
                            />
                        </View>}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { scrollRef.current?.scrollTo({ x: windowWidth, animated: true }); setIsFollowers(false); }} style={[styles.rowAlignItems, { marginLeft: 16, width: 126 }]}>
                        <SemiBoldText
                            text={t("Requests")}
                            fontSize={15}
                            lineHeight={24}
                            marginLeft={8}
                            fontFamily={!isFollowers ? 'SFProDisplay-Semibold' : 'SFProDisplay-Regular'}
                        />
                        {!isSearch && <View style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                            backgroundColor: '#F2F0F5',
                            marginLeft: 8
                        }}>
                            <DescriptionText
                                text={requests.length}
                                fontSize={12}
                                lineHeight={16}
                                color='#281E30'
                            />
                        </View>}
                    </TouchableOpacity>
                </View>
                <View style={{
                    marginLeft: 16,
                    height: 1,
                    width: windowWidth - 16,
                    backgroundColor: "#F0F4FC",
                    marginTop: 9
                }}>
                </View>
                <View style={{ width: 268, marginLeft: 16 }}>
                    <Animated.View style={{
                        width: 126,
                        height: 1,
                        backgroundColor: '#281E30',
                        transform: [{ translateX: scrollIndicatorPosition }]
                    }} />
                </View>
                <ScrollView
                    style={{ maxWidth: windowWidth }}
                    horizontal
                    ref={scrollRef}
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEnabled={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollIndicator } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    <View style={{
                        width: windowWidth
                    }}>
                        {
                            followings.map((item, index) => {
                                if (item.user.name.toLowerCase().indexOf(label.toLowerCase()) == -1)
                                    return null;
                                return <TouchableOpacity
                                    key={"following" + index.toString()}
                                    style={[styles.rowSpaceBetween, { marginTop: 16 }]}
                                    onPress={() => props.navigation.navigate("UserProfile", { userId: item.user.id })}
                                >
                                    <View style={styles.rowAlignItems}>
                                        <Image
                                            source={item.user.avatar ? { uri: item.user.avatar.url } : Avatars[item.user.avatarNumber].uri}
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 24,
                                                marginLeft: 16,
                                            }}
                                        />
                                        <View style={{
                                            marginLeft: 12
                                        }}>
                                            <SemiBoldText
                                                text={item.user.name}
                                                fontSize={15}
                                                lineHeight={24}
                                            />
                                            <DescriptionText
                                                text={item.user.firstname}
                                                fontSize={13}
                                                lineHeight={21}
                                            />
                                        </View>
                                    </View>
                                    <TouchableOpacity style={{
                                        backgroundColor: '#F2F0F5',
                                        paddingHorizontal: 16,
                                        paddingVertical: 9,
                                        borderRadius: 8,
                                        marginRight: 8
                                    }}
                                        onPress={() => onDeleteFollowing(index)}
                                    >
                                        <SemiBoldText
                                            text={t("Remove")}
                                            fontSize={13}
                                            lineHeight={21}
                                            color={'rgba(54, 36, 68, 0.8)'}
                                        />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            })
                        }
                    </View>
                    <View style={{
                        width: windowWidth
                    }}>
                        {
                            requests.map((item, index) => {
                                if (!allRequests && index > 1)
                                    return null;
                                if (item.fromUser.name.toLowerCase().indexOf(label.toLowerCase()) == -1)
                                    return null;
                                return <TouchableOpacity
                                    key={"requests" + index.toString()}
                                    style={[styles.rowSpaceBetween, { marginTop: 16 }]}
                                    onPress={() => props.navigation.navigate("UserProfile", { userId: item.fromUser.id })}
                                >
                                    <View style={styles.rowAlignItems}>
                                        <Image
                                            source={item.fromUser.avatar ? { uri: item.fromUser.avatar.url } : Avatars[item.fromUser.avatarNumber].uri}
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 24,
                                                marginLeft: 16,
                                            }}
                                        />
                                        <View style={{
                                            marginLeft: 12
                                        }}>
                                            <SemiBoldText
                                                text={item.fromUser.name}
                                                fontSize={15}
                                                lineHeight={24}
                                            />
                                            <DescriptionText
                                                text={item.fromUser.firstname}
                                                fontSize={13}
                                                lineHeight={21}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.rowAlignItems}>
                                        {item.friend.status != 'accepted' &&
                                            <TouchableOpacity style={{
                                                backgroundColor: '#F8F0FF',
                                                paddingHorizontal: 16,
                                                paddingVertical: 9,
                                                borderRadius: 8
                                            }}
                                                onPress={() => onAcceptRequest(index)}
                                            >
                                                <SemiBoldText
                                                    text={t("Confirm")}
                                                    fontSize={13}
                                                    lineHeight={21}
                                                    color={'#8327D8'}
                                                />
                                            </TouchableOpacity>}
                                        <TouchableOpacity style={{
                                            backgroundColor: '#F2F0F5',
                                            paddingHorizontal: 16,
                                            paddingVertical: 9,
                                            borderRadius: 8,
                                            marginHorizontal: 8
                                        }}
                                            onPress={() => onDeleteRequest(index)}
                                        >
                                            <SemiBoldText
                                                text={t("Delete")}
                                                fontSize={13}
                                                lineHeight={21}
                                                color={'rgba(54, 36, 68, 0.8)'}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            })
                        }
                    </View>
                </ScrollView>
                {/* <SemiBoldText
                    text={t("Invite your contacts")}
                    lineHeight={24}
                    fontSize={15}
                    marginLeft={16}
                    marginTop={24}
                />
                <View style={{
                    marginLeft: 16,
                    height: 1,
                    width: windowWidth - 16,
                    backgroundColor: "#F0F4FC",
                    marginTop: 9
                }}>
                </View>
                <ContactList
                    props={props}
                /> */}
            </ScrollView>
            <BottomButtons
                active='friends'
                props={props}
            />
            <RecordIcon
                props={props}
                bottom={27}
                left={windowWidth / 2 - 27}
            />
        </SafeAreaView>
    )
}

export default FriendsScreen;
