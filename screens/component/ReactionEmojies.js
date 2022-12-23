import React, { useState } from "react";
import { View, TouchableOpacity, Text, Modal, Pressable } from "react-native";
import { windowWidth } from '../../config/config';
import { TitleText } from '../component/TitleText';
import { styles } from '../style/Common';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';

export const ReactionEmojies = ({
  onSelectIcon = () => { },
  onCloseModal = () => { },
}) => {

  const { t, i18n } = useTranslation();

  const [showModal, setShowModal] = useState(true);

  const emojiCodes = [
    "😁", "😂", "😃", "😄", "😅", "😉", "😊", "😋", "😌", "😍", "😏", "😒", "😓", "😔", "😖", "😘", "😚", "😜", "😝", "😠", "😡", "😢", "😣", "😤", "😥", "😨", "😩", "😪", "😫", "😭", "😰", "😱", "😲", "😳", "😵", "😷", "😸", "😹", "😺", "😻", "😼", "😽", "😾", "😿", "🙀", "🙅", "🙆", "🙇", "🙈", "🙉", "🙊", "🙋", "🙌", "🙍", "🙎", "🙏"
  ];

  const closeModal = () => {
    setShowModal(false);
    onCloseModal();
  }

  const selectIcon = (code) => {
    setShowModal(false);
    onSelectIcon(code);
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
      <Pressable onPressOut={closeModal} style={styles.swipeModal}>
        <View
          style={{
            borderTopEndRadius: 16,
            borderTopLeftRadius: 16,
            position: 'absolute',
            bottom: 0,
            width: '100%',
            backgroundColor: 'white',
            shadowColor: 'rgba(42, 10, 111, 1)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 10,
            paddingHorizontal: 2
          }}
        >
          <View style={{ marginTop: 20, marginBottom: 25, width: '100%' }}>
            <TitleText
              text={t("Frequently used")}
              fontFamily="SFProDisplay-Regular"
              fontSize={13}
              lineHeight={16}
              marginBottom={8}
              marginLeft={12}
              color="rgba(59, 31, 82, 0.6)"
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              {emojiCodes.map((code, index) => {
                return (
                  <TouchableOpacity
                    onPress={() => selectIcon(code)}
                    key={index + 'reactionEmojie'}
                  >
                    <Text
                      style={{
                        fontSize: (windowWidth - 20) / 9,
                        color: 'white',
                      }}
                    >
                      {code}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};
