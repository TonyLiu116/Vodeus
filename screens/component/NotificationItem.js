import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    ScrollView
} from "react-native";

import { useTranslation } from 'react-i18next';
import '../../language/i18n'
import { DescriptionText } from "./DescriptionText";

import { SvgXml } from 'react-native-svg';
import redTrashSvg from '../../assets/common/red_trash.svg';
import yellow_starSvg from '../../assets/common/yellow_star.svg';

import whiteTrashSvg from '../../assets/notification/white_trash.svg'

import { styles } from '../style/Common';
import { SemiBoldText } from "./SemiBoldText";
import { Avatars, windowWidth } from "../../config/config";

export const NotificationItem = ({
    userInfo,
    recordInfo,
    details,
    isNew = false,
    notificationTime,
    isActivity = false,
    accepted = false,
    towardFriend = null,
    onPressItem = () => { },
    onAcceptUser = () => { },
    onFollowUser = () => { },
    onDeleteItem = () => { }
}) => {

    const { t, i18n } = useTranslation();

    const [isDeleted, setIsDeleted] = useState(false);
    let num = Math.ceil((new Date().getTime() - new Date(notificationTime).getTime()) / 60000);
    let minute = num % 60;
    num = (num - minute) / 60;
    let hour = num % 24;
    let day = (num - hour) / 24
    let time = (day > 0 ? (day.toString() + ' ' + t("day") + (day > 1 ? 's' : '')) : (hour > 0 ? (hour.toString() + ' ' + t("hour") + (hour > 1 ? 's' : '')) : (minute > 0 ? (minute.toString() + ' ' + t("minute") + (minute > 1 ? 's' : '')) : '')));
    let label = '';
    if (details == 'friendAccept')
        label = t("Followed you");
    if (details == 'friendDelete')
        label = t("Stopped following");
    if (details == 'likeRecord')
        label = t("Liked your story");
    if (details == 'newAnswer')
        label = t("Has commented your story");
    if (details == 'newStory')
        label = t("Posted a new story");
    if (details == 'likeAnswer')
        label = t("Has liked your comment");
    if (details == 'tagFriend')
        label = t("Tagged you in a comment");
    if (details == 'userFollow')
        label = t("Has followed you")
    if (details == 'oldStory')
        label = t("Has shared a great moment with you 🙂")
    if (details == 'newReply')
        label = t("Has replied to you")

    const onLimit = (v, v2 = false) => {
        if (v2 == false) {
        return ((v).length > 25) ?
            (((v).substring(0, 22)) + '...') :
            v;
        }
        return ((v).length > 20) ? (((v).substring(0, 17) + '...')) : v;
    }

    return (
        !isDeleted ?
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ maxWidth: windowWidth, borderBottomColor: '#F2F0F5', borderBottomWidth: 1 }}>
                <TouchableOpacity
                    style={[styles.rowSpaceBetween, {
                        padding: 16,
                        backgroundColor: '#FFF',
                        width: windowWidth
                    }]}
                    onPress={() => {
                        onPressItem();
                    }}
                >
                    <View style={styles.rowAlignItems}>
                        <Image
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                borderColor: '#FFA002',
                                borderWidth: userInfo.premium == 'none' ? 0 : 2
                            }}
                            source={userInfo.avatar ? { uri: userInfo.avatar.url } : Avatars[userInfo.avatarNumber].uri}
                        />
                        {isNew && isActivity && <View
                            style={{
                                position: 'absolute', width: 12, height: 12, left: 36, top: 36, borderRadius: 6,
                                borderWidth: 2, borderColor: '#FFF', backgroundColor: '#D82783'
                            }}>
                        </View>}
                        <View style={{ marginLeft: 16 }}>
                            <View style={styles.rowAlignItems}>
                                {userInfo.premium != 'none' &&
                                    <SvgXml
                                        width={30}
                                        height={30}
                                        xml={yellow_starSvg}
                                    />
                                }
                                <SemiBoldText
                                    text={userInfo.name}
                                    fontSize={15}
                                    lineHeight={24}
                                />
                            </View>
                            <View style={styles.rowAlignItems}>
                                <DescriptionText
                                    text={onLimit(label)}
                                    fontSize={13}
                                    lineHeight={21}
                                    color='rgba(54, 36, 68, 0.8)'
                                    marginTop={2}
                                />
                                {(details == 'likeRecord' || details == 'newAnswer' || details == 'newStory') &&
                                    <DescriptionText
                                        text={onLimit(": " + recordInfo.title.toUpperCase(), true)}
                                        fontSize={13}
                                        lineHeight={21}
                                        marginLeft={2}
                                    />
                                }
                            </View>
                        </View>
                    </View>
                    {(!isActivity) ?
                        <View style={styles.rowAlignItems}>
                            {/* {(accepted && (!towardFriend || towardFriend.status == 'none')) && <TouchableOpacity onPress={() => onFollowUser()} style={[styles.contentCenter, { width: 99, height: 40, borderRadius: 12, backgroundColor: '#F8F0FF', marginRight: 8 }]}>
                                <SemiBoldText
                                    text='Follow back'
                                    fontSize={15}
                                    lineHeight={24}
                                    color='#8327D8'
                                />
                            </TouchableOpacity>} */}
                            <TouchableOpacity onPress={() => { onDeleteItem(); setIsDeleted(true); }} style={[styles.contentCenter, { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFE8E8' }]}>
                                <SvgXml
                                    width={24}
                                    height={24}
                                    xml={redTrashSvg}
                                />
                            </TouchableOpacity>
                            {!accepted && <TouchableOpacity onPress={() => onAcceptUser()} style={[styles.contentCenter, { width: 99, height: 40, borderRadius: 12, backgroundColor: '#F8F0FF', marginLeft: 8 }]}>
                                <SemiBoldText
                                    text={t("Accept")}
                                    fontSize={15}
                                    lineHeight={24}
                                    color='#8327D8'
                                />
                            </TouchableOpacity>}
                        </View>
                        : <View>
                            {(details == 'userFollow' && (!towardFriend || towardFriend.status == 'none')) ? <TouchableOpacity onPress={() => onFollowUser()} style={[styles.contentCenter, { width: 99, height: 40, borderRadius: 12, backgroundColor: '#F8F0FF' }]}>
                                <SemiBoldText
                                    text='Follow back'
                                    fontSize={15}
                                    lineHeight={24}
                                    color='#8327D8'
                                />
                            </TouchableOpacity> :
                                <DescriptionText
                                    text={time}
                                    fontSize={13}
                                    lineHeight={21}
                                    color='rgba(54, 36, 68, 0.8)'
                                    marginBottom={20}
                                />
                            }
                        </View>
                    }
                </TouchableOpacity>
                {isActivity &&
                    <TouchableOpacity onPress={() => { onDeleteItem(); setIsDeleted(true); }} style={[styles.rowAlignItems, {
                        width: windowWidth,
                        paddingVertical: 24,
                        backgroundColor: '#E41717',
                        borderTopLeftRadius: 24,
                        borderBottomLeftRadius: 24
                    }]}>
                        <View style={{ width: 2, height: 16, marginLeft: 4, backgroundColor: '#B91313', borderRadius: 1 }}></View>
                        <SvgXml
                            marginLeft={10}
                            xml={whiteTrashSvg}
                        />
                        <DescriptionText
                            text={t("Delete")}
                            fontSize={17}
                            lineHeight={22}
                            color='white'
                            marginLeft={16}
                        />
                    </TouchableOpacity>}
            </ScrollView>
            : null
    );
};
