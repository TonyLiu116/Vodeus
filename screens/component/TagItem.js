import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Text, Image, Vibration } from "react-native";
import { TitleText } from "./TitleText";
import { DescriptionText } from "./DescriptionText";
import { useSelector } from 'react-redux';
import { HeartIcon } from './HeartIcon';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { styles } from '../style/Common';
import VoiceService from "../../services/VoiceService";
import { Avatars, windowWidth } from "../../config/config";
import { TagUserList } from "./TagUserList";
import whiteTrashSvg from '../../assets/notification/white_trash.svg'
import { SvgXml } from 'react-native-svg';
import { ScrollView } from 'react-native-gesture-handler';
import RNVibrationFeedback from 'react-native-vibration-feedback';

export const TagItem = ({
  info,
  props,
  onChangeIsLiked = () => { },
  onDeleteItem = () => { }
}) => {

  const { user } = useSelector((state) => state.user);

  const [tagUsers, setTagUsers] = useState([]);
  const [delayTime, setDelayTime] = useState(null);
  const [showList, setShowList] = useState(false);

  const mounted = useRef(false);

  const { t, i18n } = useTranslation();
  const [lastTap, setLastTap] = useState(0);
  let userName = info.user.name,
    check = info.isLiked;

  const DOUBLE_PRESS_DELAY = 400;

  const onLikeTag = () => {
    VoiceService.likeTag(info.id, !check);
    onChangeIsLiked();
  }

  const onClickDouble = () => {
    const timeNow = Date.now();
    if (lastTap && timeNow - lastTap < DOUBLE_PRESS_DELAY) {
      clearTimeout(delayTime);
      onLikeTag();
    } else {
      setLastTap(timeNow);
      setDelayTime(setTimeout(() => {
        if (mounted.current) {
          setShowList(true);
          setLastTap(0);
        }
      }, DOUBLE_PRESS_DELAY));
    }
  };

  const getTagUsers = () => {
    VoiceService.getTagUsers(info.id).then(async res => {
      const jsonRes = await res.json();
      if (res.respInfo.status === 200 && mounted.current) {
        setTagUsers(jsonRes);
      }
    })
  }

  const onDeleteTag = () => {
    if (info.user.id == user.id) {
      VoiceService.deleteTag(info.id);
      onDeleteItem();
    }
  }

  const onLimit = (v) => {
    return ((v).length > 8) ?
      (((v).substring(0, 5)) + '...') :
      v;
  }

  useEffect(() => {
    mounted.current = true;
    getTagUsers();
    return () => {
      mounted.current = false;
    }
  }, [])

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
        onPress={() => onClickDouble()}
      >
        <View
          style={[styles.rowSpaceBetween]}
        >
          <View style={styles.rowAlignItems}>
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
              <TitleText
                text={userName}
                fontSize={15}
                lineHeight={24}
              />
              <View style={{ marginTop: 2, height: 16, flexDirection: 'row' }}>
                {tagUsers.map((item, index) => {
                  return (index < 2) ?
                    <View key={item.id + "tagUser"} style={styles.rowAlignItems}>
                      <Image
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          borderColor: '#FFA002',
                          borderWidth: item.premium == 'none' ? 0 : 1
                        }}
                        source={item.avatar ? { uri: item.avatar.url } : Avatars[item.avatarNumber].uri}
                      />
                      <DescriptionText
                        text={'@' + onLimit(item.name)}
                        fontSize={12}
                        lineHeight={16}
                        marginLeft={8}
                        marginRight={20}
                      //    color='rgba(59, 31, 82, 0.6)'
                      />
                    </View> : null
                })}
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <HeartIcon
              isLike={check}
              marginRight={33}
              OnSetLike={() => onLikeTag()}
            />
            <View style={{ marginRight: 11, width: 19, height: 19 }}>
              {tagUsers.length > 0 && <TouchableOpacity onPress={() => setShowList(true)} style={{ alignItems: 'center', justifyContent: 'center', width: 19, height: 19, borderRadius: 9.5, backgroundColor: '#7F27D3' }}>
                <DescriptionText
                  text={tagUsers.length}
                  color='#FFF'
                  lineHeight={17}
                  fontSize={12.5}
                />
              </TouchableOpacity>}
            </View>
          </View>
        </View>
      </TouchableOpacity>
      {info.user.id == user.id &&
        <TouchableOpacity onPress={() => onDeleteTag()} style={[styles.rowAlignItems, {
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
    {showList &&
      <TagUserList
        props={props}
        users={tagUsers}
        onCloseModal={() => setShowList(false)}
      />
    }
  </>
  );
};
