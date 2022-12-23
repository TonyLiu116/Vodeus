import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    ScrollView
} from "react-native";

import { useTranslation } from 'react-i18next';
import '../../language/i18n'
import { DescriptionText } from "./DescriptionText";

import { SvgXml } from 'react-native-svg';
import voiceMessageSvg from '../../assets/chat/voice_message.svg';
import activeVoiceMessageSvg from '../../assets/chat/active_voice_message.svg';
import imageMessageSvg from '../../assets/chat/image_message.svg';
import singleCheckSvg from '../../assets/chat/single-check.svg';
import doubleCheckSvg from '../../assets/chat/double-check.svg';
import lightSingleCheckSvg from '../../assets/chat/light-single-check.svg';
import lightDoubleCheckSvg from '../../assets/chat/light-double-check.svg';
import whiteTrashSvg from '../../assets/notification/white_trash.svg'

import { styles } from '../style/Common';
import { SemiBoldText } from "./SemiBoldText";
import { Avatars, windowWidth } from "../../config/config";
import { useSelector } from 'react-redux';

export const ChatListItem = ({
    props,
    info,
    label = '',
    onDeleteItem = () => { }
}) => {
    let { user } = useSelector((state) => {
        return (
            state.user
        )
    });

    let otherUser = user.id == info.sender.id ? info.receiver : info.sender;

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const { t, i18n } = useTranslation();

    const renderTime = () => {
        const updatedTime = new Date(info.updatedAt);
        const nowTime = new Date();
        if (updatedTime.getFullYear() != nowTime.getFullYear()) {
            return updatedTime.toDateString().substring(4);
        }
        else if (nowTime.getMonth() != updatedTime.getMonth() || nowTime.getDate() - updatedTime.getDate() > nowTime.getDay()) {
            return t(months[updatedTime.getMonth()]) + ' ' + updatedTime.getDate().toString();
        }
        else if (nowTime.getDate() > updatedTime.getDate()) {
            return t(updatedTime.toDateString().substring(0, 3));
        }
        else {
            return updatedTime.toString().substr(16, 5);
        }
    }

    const renderState = () => {
        if (user.id == info.sender.id) {
            if (info.newsCount > 0) {
                return <View style={{ width: 31, height: 20, justifyContent: 'center', alignItems: 'flex-end' }}>
                    <SvgXml
                        width={10.5}
                        height={6.5}
                        xml={info.lastSeen == 'onSession' ? singleCheckSvg : lightSingleCheckSvg}
                    />
                </View>
            }
            else {
                return <View style={{ width: 31, height: 20, justifyContent: 'center', alignItems: 'flex-end' }}>
                    <SvgXml
                        width={20}
                        height={20}
                        xml={info.lastSeen == 'onSession' ? doubleCheckSvg : lightDoubleCheckSvg}
                    />
                </View>

            }
        }
        else {
            if (info.newsCount > 0) {
                return <View
                    style={{
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 10,
                        backgroundColor: info.lastSeen == 'onSession' ? '#8327D8' : '#B3A3C2',
                    }}
                >
                    <DescriptionText
                        text={info.newsCount}
                        fontSize={11}
                        lineHeight={12}
                        color='#FFF'
                    />
                </View>

            }
            else {
                return <View style={{ windowWidth: 10, height: 20 }}></View>

            }
        }
    }

    const onLimit = (v) => {
        return ((v).length > 16) ?
            (((v).substring(0, 13)) + '...') : ((v).includes('\n')) ? ((v).slice(0, (v).indexOf('\n')) + '...') : v;
    }

    return (
        <>
            {(otherUser.name.toLowerCase().indexOf(label.toLowerCase()) != -1 && !(info.visible == false && info.receiver.id == user.id)) &&
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ maxWidth: windowWidth, borderBottomColor: '#F2F0F5', borderBottomWidth: 1 }}>
                    <TouchableOpacity
                        style={[styles.rowSpaceBetween, {
                            padding: 16,
                            backgroundColor: '#FFF',
                            width: windowWidth,
                            borderBottomWidth: 1,
                            borderColor: '#F2F0F5'
                        }]}
                        onPress={() => {
                            let tp = {
                                user: otherUser
                            }
                            props.navigation.navigate("Conversation", { info: tp });
                        }}
                    >
                        <View style={styles.rowAlignItems}>
                            <Image
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    borderColor: '#FFA002',
                                    borderWidth: otherUser.premium == 'none' ? 0 : 2
                                }}
                                source={otherUser.avatar ? { uri: otherUser.avatar.url } : Avatars[otherUser.avatarNumber].uri}
                            />
                            {info.lastSeen == 'onSession' && <View
                                style={{
                                    position: 'absolute', width: 12, height: 12, left: 36, top: 36, borderRadius: 6,
                                    borderWidth: 2, borderColor: '#FFF', backgroundColor: '#45BF58'
                                }}>
                            </View>}
                            <View style={{ marginLeft: 16 }}>
                                <SemiBoldText
                                    text={otherUser.name}
                                    fontSize={15}
                                    lineHeight={24}
                                />
                                <View style={styles.rowAlignItems}>
                                    {info.type == 'emoji' ?
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                color: 'white',
                                            }}
                                        >
                                            {info.emoji}
                                        </Text>
                                        :
                                        info.type == 'bio' ?
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    color: '#333',
                                                }}
                                            >
                                                {onLimit(info.bio)}
                                            </Text>
                                            :
                                            <SvgXml
                                                width={16}
                                                height={16}
                                                xml={info.state == 'start' ? activeVoiceMessageSvg : info.type == 'photo' ? imageMessageSvg : info.type == 'gif' ? imageMessageSvg : voiceMessageSvg}
                                            />}
                                    <DescriptionText
                                        text={t(info.state == 'start' ? "recording audio..." : info.type == 'photo' ? t("Image") : info.type == 'emoji' ? "reaction" :info.type=='bio'?"":info.type=='gif'?t("GIF"):t("Message vocal"))}
                                        fontSize={13}
                                        lineHeight={21}
                                        marginLeft={6}
                                        color={info.state == 'start' ? '#A24EE4' : 'rgba(54, 36, 68, 0.8)'}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <DescriptionText
                                text={renderTime()}
                                fontSize={13}
                                lineHeight={21}
                                marginBottom={3}
                                color='rgba(54, 36, 68, 0.8)'
                            />
                            {renderState()}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { onDeleteItem(); }} style={[styles.rowAlignItems, {
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
                    </TouchableOpacity>
                </ScrollView>

            }</>);
};
