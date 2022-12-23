import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Text, Image, Linking } from "react-native";
import { TitleText } from "./TitleText";
import { DescriptionText } from "./DescriptionText";

import { useSelector } from 'react-redux';

import { HeartIcon } from './HeartIcon';
import { AnswerReply } from "./AnswerReply";
import { StoryLikes } from "./StoryLikes";
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { SvgXml } from 'react-native-svg';
import { ScrollView } from 'react-native-gesture-handler';
import pauseSvg from '../../assets/common/pause.svg';
import playSvg from '../../assets/common/play.svg';
import whiteTrashSvg from '../../assets/notification/white_trash.svg'
import { styles } from '../style/Common';
import VoiceService from "../../services/VoiceService";
import VoicePlayer from "../Home/VoicePlayer";
import { Avatars, windowWidth } from "../../config/config";
import { ReplyAnswerItem } from "./ReplyAnswerItem";
import AutoHeightImage from "react-native-auto-height-image";
import { MoreOrLess } from "@rntext/more-or-less";
import Hyperlink from "react-native-hyperlink";

export const AnswerVoiceItem = ({
  info,
  props,
  friends = [],
  onChangeIsLiked = () => { },
  onDeleteItem = () => { },
  holdToAnswer = () => { },
  onReplyAnswer = () => { }
}) => {

  const { user } = useSelector((state) => state.user);

  let len = info.replyAnswers ? info.replyAnswers.length : 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [delayTime, setDelayTime] = useState(null);
  const [replyAnswers, setReplyAnswers] = useState([]);
  const [allLikes, setAllLikes] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [hold, setHold] = useState(false);

  const { t, i18n } = useTranslation();
  const [lastTap, setLastTap] = useState(0);

  const mounted = useRef(false);

  let userName = info.user.name,
    heartNum = info.likesCount,
    check = info.isLiked;
  let num = Math.ceil((new Date().getTime() - new Date(info.createdAt).getTime()) / 60000), minute = num % 60;
  num = (num - minute) / 60;
  let hour = num % 24, day = (num - hour) / 24, time = day > 0 ? (day.toString() + 'd') : (hour > 0 ? (hour.toString() + 'h') : (minute > 0 ? (minute.toString() + 'm') : ''));

  const DOUBLE_PRESS_DELAY = 400;

  const onLikeVoice = () => {
    let rep;
    if (info.isLiked == false)
      VoiceService.answerAppreciate({ id: info.id, receiverId: info.user.id });
    else
      VoiceService.answerUnAppreciate(info.id);
    onChangeIsLiked();
  }

  const onClickDouble = () => {
    const timeNow = Date.now();
    if (lastTap && timeNow - lastTap < DOUBLE_PRESS_DELAY) {
      clearTimeout(delayTime);
      onLikeVoice();
    } else {
      setLastTap(timeNow);
      setDelayTime(setTimeout(() => {
        if (mounted.current) {
          setLastTap(0);
        }
      }, DOUBLE_PRESS_DELAY));
    }
  };

  const setIsLiked = (index) => {
    let tp = [...replyAnswers];
    tp[index].isLiked = !tp[index].isLiked;
    if (tp[index].isLiked) tp[index].likesCount++;
    else tp[index].likesCount--;
    setReplyAnswers(tp);
  }

  const onDeleteAnswer = () => {
    if (info.user.id == user.id) {
      VoiceService.deleteAnswer(info.id);
      onDeleteItem();
    }
  }

  const onDeleteReplyAnswer = (index) => {
    let tp = [...replyAnswers];
    tp.splice(index, 1);
    setReplyAnswers(tp);
  }

  useEffect(() => {
    mounted.current = true;
    if (info.replyAnswers) {
      let tp = info.replyAnswers;
      setReplyAnswers([...tp]);
    }
    return () => {
      mounted.current = false;
    }
  }, [len])

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

  return (<>
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ maxWidth: windowWidth }}>
      <TouchableOpacity
        style={{
          marginBottom: 3,
          paddingHorizontal: 24,
          paddingTop: 10,
          width: windowWidth,
          paddingBottom: 10,
          backgroundColor: '#FFF',
        }}
        // onLongPress={()=>onExpand()}
        onPress={() => onClickDouble()}
      >
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
              {info.type == 'bio' && <View style={{ width: 260 }}>
                {/* <MoreOrLess
                  numberOfLines={3}
                  moreText={t("more")}
                  lessText={t("less")}
                  textStyle={{
                    fontFamily: "SFProDisplay-Regular",
                    fontSize: 15,
                    color: "#281E30",
                    textAlign: "left",
                    lineHeight: 24,
                  }}
                  textButtonStyle={{
                    fontFamily: "SFProDisplay-Semibold",
                    fontSize: 15,
                    color: "#281E30",
                    textAlign: "left",
                    lineHeight: 24,
                  }}
                >
                  {info.bio}
                </MoreOrLess> */}
                <Hyperlink onPress={(url, text) => Linking.openURL(url)} linkStyle={{ color: "#8327D8" }}>
                  {taggedName()}
                </Hyperlink>
              </View>}
              {info.type == 'gif' &&
                <AutoHeightImage
                  source={{ uri: info.gifLink }}
                  width={200}
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
              <TouchableOpacity onPress={() => onReplyAnswer()}>
                <DescriptionText
                  text={t("Reply")}
                  color="#8327D8"
                  fontSize={12}
                  lineHeight={16}
                  marginTop={5}
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
              startPlay={() => { VoiceService.listenStory(info.id, 'answer') }}
              waveColor={info.user.premium != 'none' ? ['#FFC701', '#FFA901', '#FF8B02'] : ['#D89DF4', '#B35CF8', '#8229F4']}
              playBtn={false}
              replayBtn={false}
              playing={true}
              tinWidth={windowWidth / 160}
              mrg={windowWidth / 650}
              height={30}
              duration={info.duration * 1000}
            />
          </View>
        }
      </TouchableOpacity>
      {info.user.id == user.id &&
        <TouchableOpacity onPress={() => onDeleteAnswer()} style={[styles.rowAlignItems, {
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
    {allLikes &&
      <StoryLikes
        props={props}
        storyId={info.id}
        storyType="answer"
        onCloseModal={() => setAllLikes(false)}
      />}
    {replyAnswers.length > 0 &&
      <>
        {replyAnswers.map((item, index) =>
          (showMore == false && index > 1) ? null :
            <ReplyAnswerItem
              props={props}
              key={index + item.id + 'replyAnswerItem'}
              info={item}
              onChangeIsLiked={() => setIsLiked(index)}
              onDeleteReplyItem={() => onDeleteReplyAnswer(index)}
              isEnd={(replyAnswers.length < 3 && index == replyAnswers.length - 1) ? true : false}
              friends={friends}
            />
        )}
        {replyAnswers.length > 2 &&
          <View style={{ flexDirection: 'row' }}>
            <View style={{ marginLeft: 43 }}>
              <View style={{
                width: 1,
                height: 21,
                backgroundColor: "#D4C9DE"
              }}>
              </View>
              <View style={{
                width: 16,
                height: 1,
                backgroundColor: "#D4C9DE"
              }}>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowMore(!showMore)}>
              <DescriptionText
                text={showMore ? t("See less replies") : t("See more replies")}
                fontSize={13}
                color="#281E30"
                marginTop={8}
                marginBottom={8}
                marginLeft={23}
              />
            </TouchableOpacity>
          </View>
        }
      </>
    }
    {hold == true &&
      <AnswerReply
        props={props}
        info={info}
        onCancel={() => holdAnswer(false)}
        onPushReply={() => getReplies()}
      />
    }
  </>
  );
};
