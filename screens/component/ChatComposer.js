import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { t } from 'i18next';
import { windowWidth } from '../../config/config';
import whitePostSvg from '../../assets/record/white_post.svg';
import colorPostSvg from '../../assets/record/color_post.svg';
import maskSvg from '../../assets/chat/mask.svg';

export const ChatComposer = (props) => {
  const { text, onChangeText, onFocus, onSend, showGif } = props;
  const [newContentSize, setNewContentSize] = useState();
  const [finalInputHeight, setFinalInputHeight] = useState(28);

  const calcInputHeight = (contentSize) => {
    if (contentSize?.height) {
      if (!text?.length && finalInputHeight) {
        setFinalInputHeight(0);
        return;
      }
      if (Platform.OS === 'android') {
        setFinalInputHeight(contentSize.height);
      } else {
        setFinalInputHeight(contentSize.height + 20);
      }
    }
  }

  const onContentSizeChange = (e) => {
    const { contentSize } = e.nativeEvent;
    if (!contentSize) {
      return;
    }
    if (
      !newContentSize ||
      (newContentSize && newContentSize.height !== contentSize.height)
    ) {
      setNewContentSize(contentSize);
      if (!text?.length) {
        setFinalInputHeight(0);
      } else {
        calcInputHeight(contentSize);
      }
    }
  }

  return (
    <View
      style={[
        styles.composer,
        { height: finalInputHeight },
      ]}
    >
      <TouchableOpacity
        onPress={showGif}
      >
        <SvgXml
          xml={maskSvg}
        />
      </TouchableOpacity>
      <TextInput
        autoCapitalize="none"
        multiline={true}
        value={text}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onContentSizeChange={onContentSizeChange}
        placeholder={t("Message") + '...'}
        placeholderTextColor="rgba(59, 31, 82, 0.6)"
        style={styles.textInput}
      />
      <TouchableOpacity
        disabled={text.length === 0}
        onPress={onSend}
      >
        <SvgXml
          xml={text ? colorPostSvg : whitePostSvg}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    position: 'relative',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 55,
    backgroundColor: '#F6F5F9',
    borderRadius: 11,
    paddingHorizontal: 16,
    marginLeft: 10,
    marginRight: 70,
  },
  textInput: {
    width: windowWidth * 10 / 19,
    fontSize: 16,
    fontFamily: "SFProDisplay-Medium",
    lineHeight: 22,
    color: '#8B82B5',
    paddingBottom: 10,
  },
});
