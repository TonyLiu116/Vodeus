import React, { useState } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  Modal,
  Text
} from 'react-native';
import { TitleText } from './TitleText';
import { SvgXml } from 'react-native-svg';
import replySvg from '../../assets/chat/reply.svg';
import plusSvg from '../../assets/chat/plus.svg';
import forwardSvg from '../../assets/chat/forward.svg';
import saveSvg from '../../assets/chat/save.svg';
import trashSvg from '../../assets/chat/trash.svg';
import selectSvg from '../../assets/chat/select.svg';
import { styles } from '../style/Common';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { MessageItem } from './MessageItem';
import EmojiPicker from 'rn-emoji-keyboard';

export const MessageContext = ({
  info,
  props,
  onDeleteItem = () => { },
  onSelectItem = () => { },
  onReplyMsg = () => { },
  onCloseModal = () => { },
  onSendEmoji = () => { }
}) => {

  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(true);
  const [visibleReaction, setVisibleReaction] = useState(false);

  const closeModal = () => {
    setShowModal(false);
    onCloseModal();
  }

  const exampleEmoji = ["💖", "😆", "😐", "😥", "😤", "😡"];

  const sendEmoji = (v) => {
    onSendEmoji(v);
    closeModal();
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={() => {
        closeModal();
      }}
    >
      <Pressable onPressOut={closeModal} style={[styles.swipeModal,{justifyContent:'center'}]}>
        <View
          style={{paddingHorizontal: 8 }}
        >
          <MessageItem
            props={props}
            info={info}
          />
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginTop: 16,
              borderRadius: 20,
              width: 296,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {exampleEmoji.map((item, index) => {
              return <TouchableOpacity
                key={"chatReplyEmoji" + index.toString()}
                onPress={() => sendEmoji(item)}
              >
                <Text
                  style={{
                    fontSize: 24,
                    color: 'white',
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            })}
            <TouchableOpacity
              onPress={() => setVisibleReaction(true)}
            >
              <SvgXml
                width={24}
                height={24}
                xml={plusSvg}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: "65%",
              marginTop: 20,
              borderRadius: 16,
              backgroundColor: '#FFF'
            }}
          >
            <TouchableOpacity
              style={styles.contextMenu}
              onPress={() => { onReplyMsg(); closeModal(); }}
            >
              <TitleText
                text={t("Reply")}
                fontSize={17}
                fontFamily="SFProDisplay-Regular"
              />
              <SvgXml
                width={20}
                height={20}
                xml={replySvg}
              />
            </TouchableOpacity>
            <Pressable
              onPress={() => onDeleteItem()}
              style={styles.contextMenu}
            >
              <TitleText
                text={t("Delete")}
                fontSize={17}
                color='#E41717'
                fontFamily="SFProDisplay-Regular"
              />
              <SvgXml
                width={20}
                height={20}
                xml={trashSvg}
              />
            </Pressable>
            <TouchableOpacity
              onPress={() => { onSelectItem(); closeModal(); }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                flexDirection: 'row',
                justifyContent: 'space-between'
              }}
            >
              <TitleText
                text={t("Select")}
                fontSize={17}
                fontFamily="SFProDisplay-Regular"
              />
              <SvgXml
                width={20}
                height={20}
                xml={selectSvg}
              />
            </TouchableOpacity>
          </View>
        </View>
        {visibleReaction &&
          <EmojiPicker
            onEmojiSelected={(icon) => sendEmoji(icon.emoji)}
            open={visibleReaction}
            onClose={() => setVisibleReaction(false)}
          />
        }
      </Pressable>
    </Modal>
  );
};
