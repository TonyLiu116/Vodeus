import React, { useState } from 'react';
import {
  Text,
  TouchableOpacity, View
} from "react-native";

import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { windowWidth } from '../../config/config';
import triangleSvg from '../../assets/common/white_triangle.svg';
import simplePauseSvg from '../../assets/common/simple_pause.svg';
import '../../language/i18n';
import { DescriptionText } from "./DescriptionText";
import { SemiBoldText } from './SemiBoldText';
import VoicePlayer from '../Home/VoicePlayer';
import AutoHeightImage from 'react-native-auto-height-image';

export const ChatParent = ({
  parentInfo,
  isUser
}) => {

  const { t, i18n } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={{
      justifyContent: 'center',
      marginBottom: 6
    }}>
      <View style={{
        borderColor: isUser ? '#FF9768' : "#786BC2",
        borderLeftWidth: 2,
        paddingHorizontal: 8,
        justifyContent: 'space-between'
      }}>
        <SemiBoldText
          text={parentInfo.user.name}
          color={isUser ? "#FF9768" : "#786BC2"}
          fontSize={16}
          lineHeight={16}
          marginBottom={6}
        />
        <View>
          {parentInfo.type == 'voice' ?
            <View
              style={
                {
                  backgroundColor: isUser ? '#786BC2' : '#E7F2F1',
                  paddingTop: 8,
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                  borderTopLeftRadius: isUser ? 16 : 8,
                  borderTopRightRadius: isUser ? 8 : 16,
                  flexDirection: 'row',
                  alignItems: 'center'
                }
              }
            >
              <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                <LinearGradient
                  colors={['#3C9289', '#3C9289']}
                  locations={[0, 1]}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={{
                    width: 29.1,
                    height: 29.1,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 4
                  }}
                >
                  <SvgXml
                    xml={isPlaying ? simplePauseSvg : triangleSvg}
                    width={10.5}
                    height={13}
                  />
                </LinearGradient>
              </TouchableOpacity>
              <VoicePlayer
                voiceUrl={parentInfo.value}
                timeColor={isUser ? '#FFF' : '#000'}
                waveColor={isUser ? ['#FFF', '#FFF', '#FFF'] : ['#786BC2', '#786BC2', '#786BC2']}
                playing={isPlaying}
                height={25}
                playBtnSize={12}
                startPlay={() => setIsPlaying(true)}
                stopPlay={() => setIsPlaying(false)}
                tinWidth={windowWidth / 300}
                mrg={windowWidth / 730}
              />
            </View> :
            parentInfo.type == 'bio' ?
              <View>
                <DescriptionText
                  text={parentInfo.value}
                  fontSize={17}
                  color={isUser ? '#FFF' : '#000'}
                />
              </View> : parentInfo.type == 'emoji' ?
                <View>
                  <Text
                    style={{
                      fontSize: 40,
                      color: 'white',
                    }}
                  >
                    {parentInfo.value}
                  </Text>
                </View> : parentInfo.type == 'gif' ?
                  <View>
                    <AutoHeightImage
                      source={{ uri: parentInfo.value }}
                      width={40}
                      style={{
                        borderRadius: 20,
                        borderWidth: 4,
                        borderColor: '#FFF'
                      }}
                    />
                  </View> :
                  <View></View>
          }
        </View>
      </View>
    </View>
  );
};
