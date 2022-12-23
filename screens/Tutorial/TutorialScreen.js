import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Text, ImageBackground, TextInput, Platform, StatusBar, TouchableOpacity } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { VoiceItem } from '../component/VoiceItem';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { NavigationActions, StackActions } from 'react-navigation';
import { SvgXml } from 'react-native-svg';
import recordSvg from '../../assets/common/bottomIcons/record.svg';
import searchSvg from '../../assets/login/search.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TUTORIAL_CHECK, windowWidth, windowHeight } from '../../config/config';
import { styles } from '../style/Common';
import { useSelector } from 'react-redux';

const TutorialScreen = (props) => {

  const [showTip, setTip] = useState(true);
  const [searchTip, setSearchTip] = useState(false);
  const [voiceItemTip, setVoiceItemTip] = useState(false);

  const { t, i18n } = useTranslation();

  const user = useSelector((state) => state.user.user);

  let voiceInfo = {
    user: user,
    title: t("Bad grades again"),
    duration: 52,
    emoji: "😍",
    isPlay: true,
    reactions: [{ emoji: "🤣" }, { "emoji": "😍" }, { "emoji": "😡" }],
    likesCount: 740,
    answersCount: 65
  }
  const backFirstStep = () => {
    setTip(true);
    setSearchTip(false);
    setVoiceItemTip(false);
  }

  const nextFirstStep = () => {
    setTip(false);
    setSearchTip(true);
    setVoiceItemTip(false);
  }

  const secondStep = () => {
    setTip(false);
    setSearchTip(false);
    setVoiceItemTip(true);
  }

  const lastTutorial = async () => {
    setTip(false);
    setSearchTip(false);
    setVoiceItemTip(false);
    try {
      await AsyncStorage.setItem(
        TUTORIAL_CHECK,
        "checked"
      );
      const resetActionTrue = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: "Home" })],
      });
      props.navigation.dispatch(resetActionTrue);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
  }, [])

  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <ImageBackground
        source={require('../../assets/discover/blurback.png')}
        style={{
          width: windowWidth,
          flex: 1
        }}
        resizeMode="stretch"
      >
        <View>
          {searchTip &&
            <Tooltip
              isVisible={searchTip}
              content={
                <View>
                  <TitleText
                    text={t("Search new stories")}
                    fontSize={22}
                  />
                  <DescriptionText
                    text={t("You can also discover all the categories!")}
                    fontSize={15}
                    color="#281E30"
                    marginTop={16}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 20,
                    }}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: '#D4C9DE',
                          borderRadius: 4
                        }}
                      ></View>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: '#8327D8',
                          borderRadius: 4,
                          marginHorizontal: 8
                        }}
                      ></View>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: '#D4C9DE',
                          borderRadius: 4,
                        }}
                      ></View>
                    </View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#F8F0FF',
                        width: 102,
                        height: 60,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 16,
                        marginLeft: 40
                      }}
                      onPress={backFirstStep}
                    >
                      <Text
                        style={
                          {
                            color: '#8327D8',
                            fontFamily: "SFProDisplay-Semibold",
                            fontSize: 17
                          }
                        }
                      >
                        {t("Back")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#F8F0FF',
                        width: 102,
                        height: 60,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 16
                      }}
                      onPress={() => secondStep()}
                    >
                      <Text
                        style={
                          {
                            color: '#8327D8',
                            fontFamily: "SFProDisplay-Semibold",
                            fontSize: 17
                          }
                        }
                      >
                        {t("Next")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
              placement="bottom"
              onClose={() => secondStep()}
              useInteractionManager={true} // need this prop to wait for react navigation
              // below is for the status bar of react navigation bar
              topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
              backgroundColor="rgba(31, 43, 69, 0)"
              showChildInTooltip={false}
              arrowStyle={{
                marginTop: 40
              }}
              contentStyle={{
                marginTop: 40,
                padding: 24,
                borderRadius: 16,
                width: windowWidth - 48
              }}
            >
              <View
                style={{
                  paddingHorizontal: 16
                }}
              >

                <View style={{
                  marginTop: 50
                }}>
                  <SvgXml
                    width="24"
                    height="24"
                    xml={searchSvg}
                    style={{
                      position: 'absolute',
                      left: 20,
                      top: 15,
                      zIndex: 2
                    }}
                  />
                  <TextInput
                    style={{
                      backgroundColor: '#F2F0F5',
                      borderRadius: 24,
                      fontSize: 17,
                      fontFamily: 'SFProDisplay-Regular',
                      paddingLeft: 55,
                      paddingRight: 16,
                      paddingVertical: 12
                    }}
                    placeholder={t("Search")}
                    placeholderTextColor="rgba(59, 31, 82, 0.6)"
                  />
                </View>

              </View>

            </Tooltip>
          }


          {voiceItemTip &&
            <View
              style={{
                marginTop: 350
              }}
            >
              <Tooltip
                isVisible={voiceItemTip}
                content={
                  <View>
                    <TitleText
                      text={t("What happened to your friends?")}
                      fontSize={22}
                    />
                    <DescriptionText
                      text={t("Discover your friends’ stories or the ones from the community.")}
                      fontSize={15}
                      color="#281E30"
                      marginTop={16}
                    />
                    <DescriptionText
                      text={t("Like, answer & share with the community!")}
                      fontSize={15}
                      color="#281E30"
                      marginTop={16}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 20
                      }}
                    >
                      <View style={{ flexDirection: 'row' }}>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            backgroundColor: '#D4C9DE',
                            borderRadius: 4
                          }}
                        ></View>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            backgroundColor: '#D4C9DE',
                            borderRadius: 4,
                            marginHorizontal: 8
                          }}
                        ></View>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            backgroundColor: '#8327D8',
                            borderRadius: 4,
                          }}
                        ></View>
                      </View>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#F8F0FF',
                          width: 102,
                          height: 60,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 16,
                          marginLeft: 40
                        }}
                        onPress={nextFirstStep}
                      >
                        <Text
                          style={
                            {
                              color: '#8327D8',
                              fontFamily: "SFProDisplay-Semibold",
                              fontSize: 17
                            }
                          }
                        >
                          {t("Back")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#F8F0FF',
                          width: 102,
                          height: 60,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderRadius: 16
                        }}
                        onPress={() => lastTutorial()}
                      >
                        <Text
                          style={
                            {
                              color: '#8327D8',
                              fontFamily: "SFProDisplay-Semibold",
                              fontSize: 17
                            }
                          }
                        >
                          {t("Next")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                }
                placement="top"
                onClose={() => lastTutorial()}
                useInteractionManager={true} // need this prop to wait for react navigation
                // below is for the status bar of react navigation bar
                topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
                backgroundColor="rgba(31, 43, 69, 0)"
                showChildInTooltip={false}
                contentStyle={{
                  padding: 24,
                  borderRadius: 16
                }}
              >
                <VoiceItem
                  info={voiceInfo}
                  playStatus={true}
                />

              </Tooltip>
            </View>
          }
        </View>
        <View
          style={{
            marginTop: 'auto',
            marginBottom: 20,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {showTip &&
            <Tooltip
              isVisible={showTip}
              content={
                <View>
                  <TitleText
                    text={user.name ? t("Welcome") + " " + user.name : t("Welcome") + "!"}
                    fontSize={22}
                  />
                  <DescriptionText
                    text={t("Discover the community’s stories!")}
                    fontSize={15}
                    color="#281E30"
                    marginTop={16}
                  />
                  <DescriptionText
                    text={t("Click & hold on the microphone to start recording your first story.")}
                    fontSize={15}
                    color="#281E30"
                    marginTop={16}
                  />
                  <DescriptionText
                    text={t("You have 1:00 maximum")}
                    fontSize={15}
                    color="#281E30"
                    marginTop={16}
                    fontFamily="SFProDisplay-Semibold"
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 20
                    }}
                  >
                    <View style={{ flexDirection: 'row' }}>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: '#8327D8',
                          borderRadius: 4
                        }}
                      ></View>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: '#D4C9DE',
                          borderRadius: 4,
                          marginHorizontal: 8
                        }}
                      ></View>
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: '#D4C9DE',
                          borderRadius: 4,
                        }}
                      ></View>
                    </View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#F8F0FF',
                        width: 102,
                        height: 60,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 16
                      }}
                      onPress={() => nextFirstStep()}
                    >
                      <Text
                        style={
                          {
                            color: '#8327D8',
                            fontFamily: "SFProDisplay-Semibold",
                            fontSize: 17
                          }
                        }
                      >
                        {t("Next")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              }
              placement="top"
              onClose={() => nextFirstStep()}
              useInteractionManager={true} // need this prop to wait for react navigation
              // below is for the status bar of react navigation bar
              topAdjustment={Platform.OS === 'android' ? -StatusBar.currentHeight : 0}
              backgroundColor="rgba(31, 43, 69, 0)"
              showChildInTooltip={false}
              contentStyle={{
                padding: 24,
                borderRadius: 16
              }}
            >
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 67,
                  height: 67,
                  backgroundColor: '#FFF',
                  borderRadius: 35
                }}
              >

                <SvgXml
                  width={52}
                  height={52}
                  xml={recordSvg}
                />

              </View>

            </Tooltip>
          }
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};


export default TutorialScreen;