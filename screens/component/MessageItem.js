import React, { useState } from "react";
import { View, Pressable, Modal } from "react-native";
import AutoHeightImage from 'react-native-auto-height-image';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';
import replySvg from '../../assets/chat/reply-icon.svg';
import selectedSvg from '../../assets/chat/selected.svg';
import unSelectedSvg from '../../assets/chat/unselected.svg';
import { styles } from '../style/Common';
import { windowWidth } from "../../config/config";

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { MessageContext } from "./MessageContext";
import { MessageContent } from "./MessageContent";
import { DescriptionText } from "./DescriptionText";
import { TouchableOpacity } from "react-native-gesture-handler";

export const MessageItem = ({
  props,
  info,
  isSelect = -1,
  ancestorInfo = null,
  onDeleteItem = () => { },
  onSelectItem = () => { },
  onReplyMsg = () => { },
  onSendEmoji = () => { }
}) => {

  const { user } = useSelector((state) => state.user);

  const [showContext, setShowContext] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  const { t, i18n } = useTranslation();

  const isSender = (user.id == info.user.id);

  const onPressContent = (url) => {
    setPhotoUrl(url);
  }

  const onLongPressContent = () => {
    if (isSelect == -1) setShowContext(true)
  }

  return (
    <>
      <View style={[styles.rowAlignItems, { width: windowWidth }]}>
        {isSelect >= 0 &&
          <TouchableOpacity onPress={()=>onSelectItem()}>
            <SvgXml
              width={24}
              height={24}
              style={{
                marginRight: 16
              }}
              xml={isSelect > 0 ? selectedSvg : unSelectedSvg}
            />
          </TouchableOpacity>
        }
        <Pressable onLongPress={() => isSelect == -1 ? setShowContext(true) : null} style={{
          flexDirection: 'row',
          width: windowWidth - (isSelect >= 0 ? 56 : 16),
          justifyContent: isSender ? 'flex-end' : 'flex-start', marginTop: 8
        }}>
          {ancestorInfo ?
            <View style={styles.rowAlignItems}>
              <View style={{
                width: 2,
                height: '90%',
                backgroundColor: '#A851F8',
                marginRight: 12,
              }}>
              </View>
              <View style={{ maxWidth: windowWidth - (isSelect >= 0 ? 56 : 16) - 15  }}>
                <MessageContent
                  info={ancestorInfo}
                  onPressContent={(url) => onPressContent(url)}
                  onLongPressContent={onLongPressContent}
                />
                <View style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  <MessageContent
                    info={info}
                    isAnswer={true}
                    onPressContent={(url) => onPressContent(url)}
                    onLongPressContent={onLongPressContent}
                  />
                  <SvgXml
                    width={23}
                    height={23}
                    style={{ marginLeft: 9 }}
                    xml={replySvg}
                  />
                </View>
              </View>
            </View>
            :
            <MessageContent
              info={info}
              onPressContent={(url) => onPressContent(url)}
              onLongPressContent={onLongPressContent}
            />
          }
        </Pressable>
      </View>
      {showContext &&
        <MessageContext
          props={props}
          info={info}
          onDeleteItem={() => onDeleteItem()}
          onSelectItem={() => onSelectItem()}
          onReplyMsg={() => onReplyMsg()}
          onSendEmoji={(v) => onSendEmoji(v)}
          onCloseModal={() => setShowContext(false)}
        />
      }
      {photoUrl != '' && <Modal
        animationType="slide"
        transparent={true}
        visible={photoUrl != ''}
        onRequestClose={() => {
          setPhotoUrl('');
        }}
      >
        <Pressable onPressOut={() => setPhotoUrl('')} style={[styles.swipeModal, { alignItems: 'center', justifyContent: 'center' }]}>
          <View style={{
            width: windowWidth,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginRight: 50,
            marginBottom: 14
          }}>
            <DescriptionText
              text={'X'}
              fontSize={20}
              lineHeight={20}
              color="#FFF"
            />
          </View>
          <View>
            <AutoHeightImage
              source={{ uri: photoUrl }}
              width={windowWidth - 48}
              style={{
                borderRadius: 20,
                borderWidth: 4,
                borderColor: '#FFF'
              }}
            />
            <View style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              padding: 8,
              borderRadius: 14,
              backgroundColor: 'rgba(54, 36, 68, 0.8)'
            }}>
              <DescriptionText
                text={new Date(info.createdAt).toString().substr(16, 5)}
                lineHeight={12}
                fontSize={11}
                color='#F6EFFF'
              />
            </View>
          </View>
        </Pressable>
      </Modal>}
    </>
  );
};
