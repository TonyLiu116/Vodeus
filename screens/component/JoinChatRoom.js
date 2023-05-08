import React, { useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  TouchableOpacity,
  View
} from 'react-native';


import { useTranslation } from 'react-i18next';


import { Avatars, windowHeight, windowWidth } from '../../config/config';
import '../../language/i18n';
import { styles } from '../style/Common';
import chatWhiteSvg from '../../assets/common/white_chat.svg';
import LinearGradient from 'react-native-linear-gradient';
import { MediumText } from './MediumText';
import { SemiBoldText } from './SemiBoldText';
import { BirdRoomItem } from './BirdRoomItem';
import { DescriptionText } from './DescriptionText';
import { SvgXml } from 'react-native-svg';
import { ChatRoomItem } from './ChatRoomItem';

export const JoinChatRoom = ({
  roomInfo,
  onJoinRoom = () => { },
  onCloseModal = () => { },
}) => {

  const mounted = useRef(false);

  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(true);

  const onClose = () => {
    setShowModal(false);
    onCloseModal();
  }

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        onClose();
      }}
    >
      <Pressable onPressOut={() => onClose()} style={[styles.swipeModal, { height: windowHeight, marginTop: 0 }]}>
        <Pressable style={{
          position: 'absolute',
          bottom: 0,
          width: windowWidth,
          paddingHorizontal: 29,
          borderTopLeftRadius: 34,
          borderTopRightRadius: 34,
          backgroundColor: '#FFF',
        }}>
          <View style={{
            width: '100%',
            alignItems: 'center',
            marginTop: 18,
            marginBottom: 14
          }}>
            <View style={{
              width: 75,
              height: 5,
              backgroundColor: '#E5E6EB',
              borderRadius: 4
            }}></View>
          </View>
          <LinearGradient
            style={{
              height: 22,
              width: 58.67,
              marginBottom: 11,
              borderRadius: 12,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            locations={[0, 1]}
            colors={['#FF9768', '#E73918']}
          >
            <MediumText
              text={t('Novo')}
              fontSize={11.03}
              lineHeight={11.69}
              color='#FFF'
            />
          </LinearGradient>
          <SemiBoldText
            text={t("Live chat rooms are ready!")}
            fontSize={20}
            lineHeight={26}
            color='#000'
            maxWidth={263}
            marginBottom={20}
          />
          <ChatRoomItem
            info={roomInfo}
            itemIndex={1}
            isSample={true}
          />
          <DescriptionText
            text={'1. ' + t("You can participate or create chat rooms.") + '\n2. ' + t("Always be polite.") + '\n3. ' + t("Make new friends.")}
            maxWidth={windowWidth - 58}
            fontSize={13}
            lineHeight={17.27}
            color="#000"
            marginTop={27}
          />
          <TouchableOpacity
            onPress={()=>onJoinRoom()}
          >
            <LinearGradient
              style={{
                height: 56,
                width: windowWidth - 58,
                marginBottom: 25,
                marginTop: 32,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              locations={[0, 1]}
              colors={['#FF9768', '#E73918']}
            >
              <MediumText
                text={t('Join now')}
                fontSize={16}
                lineHeight={22}
                color='#FFF'
              />
              <View style={{
                position: 'absolute',
                right: 21,
              }}>
                <Image
                  source={roomInfo.hostUser.avatar ? { uri: roomInfo.hostUser.avatar.url } : Avatars[roomInfo.hostUser.avatarNumber].uri}
                  style={{ width: 36, height: 36, borderRadius: 25, borderWidth: 1, borderColor: 'rgba(236, 236, 236, 0.22)' }}
                  resizeMode='cover'
                />
                <LinearGradient
                  style={{
                    position: 'absolute',
                    right: -10,
                    top: 0,
                    width: 17.63,
                    height: 17.63,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  colors={['#FF9768', '#E73918']}
                  locations={[0, 1]}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                >
                  <SvgXml
                    xml={chatWhiteSvg}
                    width={11.5}
                    height={11.5}
                  />
                </LinearGradient>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};