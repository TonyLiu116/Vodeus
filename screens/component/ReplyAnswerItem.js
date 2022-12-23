import React, { useEffect, useState, useRef } from "react";
import { View, TouchableOpacity, Image, ScrollView, Vibration, Linking, Text } from "react-native";
import { TitleText } from "./TitleText";
import { DescriptionText } from "./DescriptionText";
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { HeartIcon } from './HeartIcon';
import { StoryLikes } from "./StoryLikes";
import whiteTrashSvg from '../../assets/notification/white_trash.svg'
import pauseSvg from '../../assets/common/pause.svg';
import playSvg from '../../assets/common/play.svg';
import { styles } from '../style/Common';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import VoicePlayer from '../Home/VoicePlayer';
import VoiceService from "../../services/VoiceService";
import { Avatars, windowWidth } from "../../config/config";
import Hyperlink from "react-native-hyperlink";

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import AutoHeightImage from "react-native-auto-height-image";

export const ReplyAnswerItem = ({
  props,
  info,
  isEnd = false,
  friends = [],
  onChangeIsLiked = () => { },
  onDeleteReplyItem = () => { }
}) => {

  const { user } = useSelector((state) => state.user);

  const [isPlaying, setIsPlaying] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [allLikes, setAllLikes] = useState(false);

  const mounted = useRef(false);

  const { t, i18n } = useTranslation();

  const DOUBLE_PRESS_DELAY = 400;

  let userName = info.user.name,
    heartNum = info.likesCount,
    check = info.isLiked;
  let num = Math.ceil((new Date().getTime() - new Date(info.createdAt).getTime()) / 60000), minute = num % 60;
  num = (num - minute) / 60;
  let hour = num % 24, day = (num - hour) / 24, time = day > 0 ? (day.toString() + 'd') : (hour > 0 ? (hour.toString() + 'h') : (minute > 0 ? (minute.toString() + 'm') : ''));

  const onLikeVoice = () => {
    let rep;
    if (info.isLiked == false)
      rep = VoiceService.replyAnswerAppreciate(info.id);
    else
      rep = VoiceService.replyAnswerUnAppreciate(info.id);
    onChangeIsLiked();
  }

  const onClickDouble = () => {
    const timeNow = Date.now();
    if (lastTap && timeNow - lastTap < DOUBLE_PRESS_DELAY) {
      onLikeVoice();
    } else {
      setLastTap(timeNow);
      const timeout = setTimeout(() => {
        if (mounted.current)
          setLastTap(0);
      }, DOUBLE_PRESS_DELAY);
    }
  };

  const onDeleteReplyAnswer = () => {
    if (info.user.id == user.id) {
      VoiceService.deleteReplyAnswer(info.id);
      onDeleteReplyItem();
    }
  }

  const taggedName = () => {
    if (info.type == 'bio') {
      let temp = info.bio;
      let result = [];
      let index_res = "";
      let flags = false;
      for (let i = 0; i < temp.length; i++) {
        if (temp[i] == '@') {
          if (index_res.length > 0) {
            result.push(index_res);
            index_res = "@";
            flags = true;
          } else {
            index_res = index_res + temp[i];
            flags = true;
          }
        } else {
          if (flags == true) {
            if ((temp[i] >= 'a' && temp[i] <= 'z') || (temp[i] >= 'A' && temp[i] <= 'Z')) {
              index_res = index_res + temp[i];
            } else {
              result.push(index_res);
              index_res = "" + temp[i];
              flags = false;
            }
          } else {
            index_res = index_res + temp[i];
          }
        }
      }
      result.push(index_res);
      if (result.length > 1 || result[0][0] == '@') {
        let res = result.map((item, index) => {
          if (item[0] == '@') {
            let user_Name = item.slice(1);
            let flag = false;
            let friend_ID;
            for (let j = 0; j < friends.length; j++) {
              if (friends[j].user.name.toLowerCase() == user_Name.toLowerCase()) {
                flag = true;
                friend_ID = friends[j].user.id;
              }
            }
            if (user_Name.toLowerCase() == user.name.toLowerCase()) {
              flag = true;
              friend_ID = user.id;
            }
            if (flag == true) {
              return <Text style={{
                fontFamily: "SFProDisplay-Bold",
                fontSize: 15,
                color: "#8327D8",
                textAlign: "left",
                lineHeight: 24
              }}
                onPress={() => { friend_ID == user.id ? props.navigation.navigate('Profile') : props.navigation.navigate('UserProfile', { userId: friend_ID }) }} key={index}
              >{'@' + user_Name}</Text>
            } else {
              <Text style={{
                fontFamily: "SFProDisplay-Regular",
                fontSize: 15,
                color: "#281E30",
                textAlign: "left",
                lineHeight: 24
              }} key={index}>{'@' + user_Name}</Text>
            }
          } else {
            return <Text style={{
              fontFamily: "SFProDisplay-Regular",
              fontSize: 15,
              color: "#281E30",
              textAlign: "left",
              lineHeight: 24
            }} key={index}>{item}</Text>
          }
        });
        return <Text style={{ flexWrap: "wrap" }}>
          {res}
        </Text>
      } else {
        return <Text style={{
          fontFamily: "SFProDisplay-Regular",
          fontSize: 15,
          color: "#281E30",
          textAlign: "left",
          lineHeight: 24
        }}>{result[0]}</Text>
      }
    }
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    }
  }, [])

  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ marginLeft: 43 }}>
        <View style={{
          width: 1,
          height: 31,
          backgroundColor: "#D4C9DE"
        }}>
        </View>
        <View style={{
          width: 16,
          height: 1,
          backgroundColor: "#D4C9DE"
        }}>
        </View>
        {!isEnd && <View style={{
          width: 1,
          flex:1,
          backgroundColor: "#D4C9DE"
        }}>

        </View>}
      </View>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginLeft: 21, maxWidth: windowWidth - 80 }}>
        <TouchableOpacity
          style={{
            paddingRight: 24,
            width: windowWidth - 80,
            paddingVertical: 10,
            backgroundColor: '#FFF',
          }}
          onPress={() => onClickDouble()}
        >
          {/* <View
            style={[styles.rowSpaceBetween]}
          >
            <View style={styles.rowAlignItems}>
              <TouchableOpacity onPress={() => info.user.id == user.id ? props.navigation.navigate('Profile') : props.navigation.navigate('UserProfile', { userId: info.user.id })}>
                <Image
                  style={{
                    width: 40,
                    height: 40,
                    marginBottom: 15,
                    borderRadius: 20,
                    borderColor: '#FFA002',
                    borderWidth: info.user.premium == 'none' ? 0 : 2
                  }}
                  source={info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri}
                />
              </TouchableOpacity>
              <View style={{ marginLeft: 16 }}>
                <TitleText
                  text={userName}
                  fontSize={15}
                  lineHeight={24}
                />
                <TouchableOpacity onPress={() => setAllLikes(true)}>
                  <DescriptionText
                    text={time + " • " + heartNum + ' like' + (heartNum > 1 ? 's' : '')}
                    fontSize={12}
                    lineHeight={16}
                    marginTop={2}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.rowAlignItems}>
              <HeartIcon
                isLike={check}
                marginRight={22}
                marginBottom={22}
                OnSetLike={() => onLikeVoice()}
              />
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  <SvgXml
                    width={40}
                    height={40}
                    xml={isPlaying ? pauseSvg : playSvg}
                  />
                </TouchableOpacity>
                <DescriptionText
                  text={new Date(info.duration * 1000).toISOString().substr(14, 5)}
                  lineHeight={16}
                  marginTop={6}
                  fontSize={12}
                />
              </View>
            </View>
          </View> */}
          <View
            style={[styles.rowSpaceBetween, { alignItems: 'flex-start' }]}
          >
            <View style={[styles.rowAlignItems, { alignItems: 'flex-start' }]}>
              <TouchableOpacity onPress={() => info.user.id == user.id ? props.navigation.navigate('Profile') : props.navigation.navigate('UserProfile', { userId: info.user.id })}>
                <Image
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderColor: '#FFA002',
                    borderWidth: info.user.premium == 'none' ? 0 : 2
                  }}
                  source={info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri}
                />
              </TouchableOpacity>
              <View style={{ marginLeft: 16 }}>
                <TouchableOpacity onPress={() => info.user.id == user.id ? props.navigation.navigate('Profile') : props.navigation.navigate('UserProfile', { userId: info.user.id })}>
                  <TitleText
                    text={userName}
                    marginBottom={6}
                    fontSize={15}
                  />
                </TouchableOpacity>
                {info.type == 'bio' && <View style={{ width: 200 }}>
                  <Hyperlink onPress={(url, text) => Linking.openURL(url)} linkStyle={{ color: "#8327D8" }}>
                    {taggedName()}
                  </Hyperlink>
                </View>}
                {info.type == 'gif' &&
                  <AutoHeightImage
                    source={{ uri: info.gifLink }}
                    width={140}
                    style={{
                      borderRadius: 10,
                    }}
                  />
                }
                <TouchableOpacity onPress={() => setAllLikes(true)}>
                  <DescriptionText
                    text={time + " • " + heartNum + ' like' + (heartNum > 1 ? 's' : '')}
                    fontSize={12}
                    lineHeight={16}
                    marginTop={2}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.rowAlignItems}>
              {info.type == 'emoji' &&
                <Text style={{
                  fontSize: 22,
                  marginRight: 26,
                  marginBottom: 20,
                  color: 'white'
                }}>
                  {info.emoji}
                </Text>
              }
              <HeartIcon
                isLike={check}
                marginRight={12}
                marginBottom={22}
                OnSetLike={() => onLikeVoice()}
              />
              {info.type == 'voice' &&
                <View style={{ alignItems: 'center', marginLeft: 10 }}>
                  <TouchableOpacity
                    onPress={() => setIsPlaying(!isPlaying)}
                  >
                    <SvgXml
                      width={40}
                      height={40}
                      xml={isPlaying ? pauseSvg : playSvg}
                    />
                  </TouchableOpacity>
                  <DescriptionText
                    text={new Date(info.duration * 1000).toISOString().substr(14, 5)}
                    lineHeight={16}
                    marginTop={6}
                    fontSize={12}
                  />
                </View>
              }
            </View>
          </View>
          {
            isPlaying &&
            <View style={{
              marginTop: 8,
              backgroundColor: '#F8F0FF',
              borderTopLeftRadius: 4,
              borderTopRightRadius: 16,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              paddingVertical: 8,
              paddingLeft: 4,
              paddingRight: 12,
              alignItems: 'center'
            }}>
              <VoicePlayer
                voiceUrl={info.file.url}
                stopPlay={() => setIsPlaying(false)}
                startPlay={() => { VoiceService.listenStory(info.id, 'replyAnswer') }}
                waveColor={info.user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
                playBtn={false}
                replayBtn={false}
                playing={true}
                tinWidth={windowWidth / 220}
                mrg={windowWidth / 650}
                height={30}
                duration={info.duration * 1000}
              />
            </View>
          }
        </TouchableOpacity>
        {user.id == info.user.id && <TouchableOpacity onPress={() => onDeleteReplyAnswer()} style={[styles.rowAlignItems, {
          width: windowWidth - 80,
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
        {allLikes &&
          <StoryLikes
            props={props}
            storyId={info.id}
            storyType="replyAnswer"
            onCloseModal={() => setAllLikes(false)}
          />}
      </ScrollView>
    </View>
  );
};
