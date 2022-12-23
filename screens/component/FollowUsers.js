import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  Image,
  Modal
} from 'react-native';

import * as Progress from "react-native-progress";
import { TitleText } from './TitleText';
import { SvgXml } from 'react-native-svg';
import VoiceService from '../../services/VoiceService';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import greenCheckSvg from '../../assets/friend/green-check.svg';
import { useSelector } from 'react-redux';
import { styles } from '../style/Common';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { ScrollView } from 'react-native-gesture-handler';
import { Avatars } from '../../config/config';
import { SemiBoldText } from './SemiBoldText';

export const FollowUsers = ({
  props,
  userId,
  followType,
  onCloseModal = () => { },
}) => {

  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(true);
  const [follows, setFollows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const mounted = useRef(false);

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const closeModal = () => {
    setShowModal(false);
    onCloseModal();
  }

  const getFollowUsers = () => {
    setIsLoading(true);
    VoiceService.getFollows(userId, followType).then(async res => {
      if (res.respInfo.status === 200 && mounted.current) {
        const jsonRes = await res.json();
        setFollows(jsonRes);
        setIsLoading(false);
      }
    })
      .catch(err => {
        console.log(err);
      });
  }

  const onSendRequest = (index) => {
    VoiceService.followFriend(follows[index].user.id);
    setFollows(prev => {
      prev[index].isNewUser = 2;
      return [...prev];
    })
  }

  useEffect(() => {
    mounted.current = true;
    getFollowUsers();
    return () => {
      mounted.current = false;
    }
  }, [])

  return (
    <Modal
      animationType="slide"
      swipeDirection="down"
      onSwipeComplete={() => {
        closeModal();
      }}
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        closeModal();
      }}
    >
      <Pressable onPress={closeModal} style={styles.swipeModal}>
        <View style={styles.swipeContainerContent}>
          <View style={[styles.rowSpaceBetween, { paddingLeft: 16, paddingRight: 14, paddingTop: 14, paddingBottom: 11, borderBottomWidth: 1, borderBottomColor: '#F0F4FC' }]}>
            <TitleText
              text={t(followType) + "(" + follows.length + ")"}
              fontFamily="SFProDisplay-Semibold"
              fontSize={15}
              lineHeight={24}
            />
            <View style={[styles.contentCenter, { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F4FC' }]}>
              <Pressable onPress={() => closeModal()}>
                <SvgXml
                  width={18}
                  height={18}
                  xml={closeBlackSvg}
                />
              </Pressable>
            </View>
          </View>
          {isLoading && <Progress.Circle
            indeterminate
            size={30}
            color="rgba(0, 0, 255, .7)"
            style={{ alignSelf: "center", top: 100, position: 'absolute' }}
          />}
          <ScrollView>
            {
              follows.map((item, index) => <TouchableOpacity onPress={() => {
                if (item.user.id == user.id)
                  props.navigation.navigate('Profile');
                else
                  props.navigation.navigate('UserProfile', { userId: item.user.id });
                closeModal();
              }}
                key={index + item.user.id + "likes"}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 10, marginBottom: 10 }}
              >
                <View style={styles.rowAlignItems}>
                  <Image
                    source={item.user.avatar ? { uri: item.user.avatar.url } : Avatars[item.user.avatarNumber].uri}
                    style={{ width: 50, height: 50, borderRadius: 25, borderColor: '#FFA002', borderWidth: item.user.premium == 'none' ? 0 : 2 }}
                    resizeMode='cover'
                  />
                  <TitleText
                    text={item.user.name}
                    fontSize={17}
                    marginLeft={16}
                  />
                </View>
                {(item.isNewUser > 0 && item.user.id != user.id) && <TouchableOpacity style={{
                  backgroundColor: item.isNewUser > 1 ? '#ECF8EE' : '#F2F0F5',
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderRadius: 8,
                }}
                  onPress={() => onSendRequest(index)}
                  disabled={item.isNewUser > 1}
                >
                  <View style={styles.rowAlignItems}>
                    {item.isNewUser > 1 && <SvgXml
                      width={20}
                      height={20}
                      style={{
                        marginRight: 4
                      }}
                      xml={greenCheckSvg}
                    />}
                    <SemiBoldText
                      text={t(item.isNewUser > 1 ? "Added" : "Add")}
                      fontSize={13}
                      lineHeight={21}
                      color={item.isNewUser > 1 ? '#1A4C22' : '#8327D8'}
                    />
                  </View>
                </TouchableOpacity>}
              </TouchableOpacity>
              )
            }
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};
