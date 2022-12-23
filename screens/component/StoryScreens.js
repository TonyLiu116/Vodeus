import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Pressable,
  Image,
  Text,
  Platform,
  ImageBackground,
  Modal,
  TextInput,
  Vibration,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';

import {
  GifSearch,
  poweredByGiphyLogoGrey,
} from 'react-native-gif-search'

import { ScrollView } from 'react-native-gesture-handler';
import * as Progress from "react-native-progress";
import { Picker } from 'emoji-mart-native'
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { setRefreshState, setVoiceState } from '../../store/actions';
import { DescriptionText } from './DescriptionText';
import VoiceService from '../../services/VoiceService';
import { ShareVoice } from './ShareVoice';
import Share from 'react-native-share';
import VoicePlayer from '../Home/VoicePlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import closeSvg from '../../assets/record/x.svg';
import whitePostSvg from '../../assets/record/white_post.svg';
import colorPostSvg from '../../assets/record/color_post.svg';
import emojiSymbolSvg from '../../assets/common/emoji_symbol.svg'
import gifSymbolSvg from '../../assets/common/gif_symbol.svg'
import moreSvg from '../../assets/common/more.svg';
import editSvg from '../../assets/common/edit.svg';
import blueShareSvg from '../../assets/common/blue_share.svg';
import redTrashSvg from '../../assets/common/red_trash.svg';

import { windowHeight, windowWidth, SHARE_CHECK, Avatars } from '../../config/config';
import { styles } from '../style/Common';
import { SemiBoldText } from './SemiBoldText';
import { AnswerVoiceItem } from './AnswerVoiceItem';
import '../../language/i18n';
import { StoryLikes } from './StoryLikes';
import { TagFriends } from './TagFriends';
import { TagItem } from './TagItem';
import { NewChat } from './NewChat';
import { AnswerRecordIcon } from './AnswerRecordIcon';
import SwipeDownModal from 'react-native-swipe-down';
import EmojiPicker from 'rn-emoji-keyboard';
import KeyboardSpacer from 'react-native-keyboard-spacer';

export const StoryScreens = ({
  props,
  info,
  answerId = '',
  onCloseModal = () => { },
  onSetCommentCount = (ind) => { }
}) => {

  let recordId = info.id;

  const tempTagUsers = useRef([]);

  // let recordId = props.navigation.state.params.id, answerId = props.navigation.state.params.answerId ? props.navigation.state.params.answerId : '';
  // let answerId = props.navigation.state.params.answerId ? props.navigation.state.params.answerId : '';
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isLike, setIsLike] = useState(info.isLike);
  const [likeCount, setLikeCount] = useState(info.likesCount);
  const [showShareVoice, setShowShareVoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [allLikes, setAllLikes] = useState(false);
  const [showTagFriends, setShowTagFriends] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false)
  const [combines, setCombines] = useState([]);
  const [answerType, setAnswerType] = useState('emoji');
  const [label, setLabel] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [visibleReaction, setVisibleReaction] = useState(false);
  const [friends, setFriends] = useState([]);
  const [filter, setFilter] = useState([]);
  const [showScr, setShowScr] = useState(true);
  const [forceAnswer, setForceAnswer] = useState(false);
  const [commentedUserId, setCommentedUserId] = useState('');
  const [replyId, setReplyId] = useState(-1);

  const mounted = useRef(false);

  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();

  let { user, refreshState, voiceState } = useSelector((state) => {
    return (
      state.user
    )
  });

  const onCompare = (a, b) => {
    if (a.createdAt < b.createdAt)
      return 1;
    if (a.createdAt > b.createdAt)
      return -1;
    return 0;
  }

  const onCombine = (ar0, ar1) => {
    let ar = [...ar0, ...ar1];
    ar.sort(onCompare);
    setCombines(ar);
    setLoading(false);
  }

  const getAnswers = async () => {
    let stories = await VoiceService.getAnswers(recordId, answerId).then(async res => {
      if (res.respInfo.status === 200 && mounted.current) {
        return await res.json();
      }
    })
      .catch(err => {
        console.log(err);
      });

    // let tags = await VoiceService.getTags(recordId, 'record').then(async res => {
    //   if (res.respInfo.status === 200 && mounted.current) {
    //     return await res.json();
    //   }
    // })
    //   .catch(err => {
    //     console.log(err);
    //   });
    if (mounted.current) {
      stories.sort((a, b) => a.createdAt < b.createdAt);
      setCombines(stories);
      setLoading(false);
    }
    //onCombine(stories, tags);
  }

  useEffect(() => {
    onSetCommentCount(combines.length);
  }, [combines])

  useEffect(() => {
    if (forceAnswer == true) {
      onAnswerBio(commentedUserId);
      setForceAnswer(false);
    }
  }, [forceAnswer])

  const editVoice = () => {
    props.navigation.navigate("PostingVoice", { info: info });
    setShowModal(false);
  }

  const onShareAudio = () => {
    Share.open({
      url: info.file.url,
      type: 'audio/mp3',
    });
  }

  const deleteConfirm = () => {
    setShowModal(false);
    setDeleteModal(true);
  }

  const deleteVoice = () => {
    setDeleteModal(false);
    VoiceService.deleteVoice(info.id).then(async res => {
      dispatch(setRefreshState(!refreshState));
      props.navigation.navigate('Home');
    })
      .catch(err => {
        console.log(err)
      })
  }

  const setIsLiked = (index) => {
    let tp = [...combines];
    tp[index].isLiked = !tp[index].isLiked;
    if (tp[index].isLiked) tp[index].likesCount++;
    else tp[index].likesCount--;
    setCombines(tp);
  }

  const onDeleteItem = (index) => {
    let tp = [...combines];
    tp.splice(index, 1);
    tp.sort((a, b) => a.createdAt < b.createdAt);
    setCombines(tp);
  }

  const onAnswerStory = (res) => {
    res.user = user;
    let tp = combines;
    tp.unshift(res);
    tp.sort((a, b) => a.createdAt < b.createdAt);
    if (mounted.current) {
      setCombines([...tp]);
      setIsLoading(false);
    }
  }

  const onReplyAnswerStory = (res) => {
    res.user = user;
    let tp = combines;
    tp[replyId].replyAnswers.unshift(res);
    if (mounted.current) {
      setCombines([...tp]);
      setIsLoading(false);
    }
    setReplyId(-1);
  }

  const onAnswerBio = (isCommented = '') => {
    setIsLoading(true);
    if (replyId == -1) {
      VoiceService.answerBio(info.id, info.user.id, { bio: label }, isCommented).then(async res => {
        if (res.respInfo.status == 200) {
          const answerBio = await res.json();
          answerBio.user = user;
          let tp = combines;
          tp.unshift(answerBio);
          tp.sort((a, b) => a.createdAt < b.createdAt);
          if (mounted.current) {
            setCombines([...tp]);
            setIsLoading(false);
          }
        }
      })
        .catch(err => {
          console.log(err);
        })
      let userIds = [];
      tempTagUsers.current.forEach(el => {
        if (label.includes('@' + el.name + ' '))
          userIds.push(el.id);
      });
      let payload = {
        storyType: 'record',
        tagUserIds: userIds,
        recordId: recordId,
      };
      VoiceService.postTag(payload).then(async res => {
      })
        .catch(err => {
          console.log(err);
        });
      tempTagUsers.current = [];
    }
    else {
      let replyInfo = combines[replyId];
      VoiceService.replyAnswerBio(replyInfo.id, replyInfo.user.id, { bio: label }).then(async res => {
        setIsLoading(false);
        if (res.respInfo.status == 200) {
          const answerBio = await res.json();
          answerBio.user = user;
          let tp = combines;
          tp[replyId].replyAnswers.unshift(answerBio);
          if (mounted.current) {
            setCombines([...tp]);
            setIsLoading(false);
          }
        }
      })
        .catch(err => {
          console.log(err);
        })
      setReplyId(-1);
    }
    setLabel('');
    setFilter([]);
  }

  const onAnswerGif = (gif) => {
    setShowComment(false);
    setIsLoading(true);
    if (replyId == -1) {
      VoiceService.answerGif(info.id, info.user.id, { link: gif }).then(async res => {
        if (res.respInfo.status == 200) {
          const gifAnswer = await res.json();
          gifAnswer.user = user;
          let tp = combines;
          tp.unshift(gifAnswer);
          tp.sort((a, b) => a.createdAt < b.createdAt);
          if (mounted.current) {
            setCombines([...tp]);
            setIsLoading(false);
          }
        }
      })
        .catch(err => {
          console.log(err);
        })
    }
    else {
      let replyInfo = combines[replyId];
      VoiceService.replyAnswerGif(replyInfo.id, replyInfo.user.id, { link: gif }).then(async res => {
        setIsLoading(false);
        if (res.respInfo.status == 200) {
          const answerGif = await res.json();
          answerGif.user = user;
          let tp = combines;
          tp[replyId].replyAnswers.unshift(answerGif);
          if (mounted.current) {
            setCombines([...tp]);
            setIsLoading(false);
          }
        }
      })
        .catch(err => {
          console.log(err);
        })
      setReplyId(-1);
    }
  }

  // const onAnswerBio = (isCommented = '') => {
  //   setIsLoading(true);
  //   VoiceService.answerBio(info.id, info.user.id, { bio: label }, isCommented).then(async res => {
  //     if (res.respInfo.status == 200) {
  //       const answerBio = await res.json();
  //       answerBio.user = user;
  //       let tp = combines;
  //       tp.unshift(answerBio);
  //       tp.sort((a, b) => a.createdAt < b.createdAt);
  //       if (mounted.current) {
  //         setCombines([...tp]);
  //         setIsLoading(false);
  //         setRefreshState(!refreshState);
  //       }
  //     }
  //   })
  //     .catch(err => {
  //       console.log(err);
  //     })
  //   let userIds = [];
  //   tempTagUsers.current.forEach(el => {
  //     if (label.includes('@' + el.name + ' '))
  //       userIds.push(el.id);
  //   });
  //   let payload = {
  //     storyType: 'record',
  //     tagUserIds: userIds,
  //     recordId: recordId,
  //   };
  //   VoiceService.postTag(payload).then(async res => {
  //   })
  //     .catch(err => {
  //       console.log(err);
  //     });
  //   tempTagUsers.current = [];
  //   setLabel('');
  //   setFilter([]);
  // }

  // const onAnswerGif = (gif) => {
  //   setShowComment(false);
  //   setIsLoading(true);
  //   VoiceService.answerGif(info.id, info.user.id, { link: gif }).then(async res => {
  //     if (res.respInfo.status == 200) {
  //       const gifAnswer = await res.json();
  //       gifAnswer.user = user;
  //       let tp = combines;
  //       tp.unshift(gifAnswer);
  //       tp.sort((a, b) => a.createdAt < b.createdAt);
  //       if (mounted.current) {
  //         setCombines([...tp]);
  //         setIsLoading(false);
  //       }
  //     }
  //   })
  //     .catch(err => {
  //       console.log(err);
  //     })
  // }

  const getFollowUsers = () => {
    VoiceService.getFollows(user.id, "Following")
      .then(async res => {
        if (res.respInfo.status === 200 && mounted.current) {
          const jsonRes = await res.json();
          setFriends([...jsonRes]);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  const findPosition = (e) => {
    let i;
    for (i = e.length - 1; i >= 0; i--) {
      if (e[i] == '@') break;
    }
    return i;
  }

  const onSetLabel = (e) => {
    setLabel(e.charAt(0).toUpperCase() + e.slice(1));
    let i = findPosition(e);
    let tp = '';
    if (i != -1) {
      tp = e.slice(i + 1);
    }
    else
      tp = ' ';
    tp = tp.toLowerCase();
    let filterFriends = friends.filter(el => {
      let friendName = el.user.name.toLowerCase();
      return friendName.startsWith(tp)
    });
    setFilter(filterFriends);
  }

  const onReplace = (tagUser) => {
    let i = findPosition(label);
    if (i != -1) {
      setLabel(label.slice(0, i + 1).concat(tagUser.name) + ' ');
      setFilter([]);
      tempTagUsers.current.push(tagUser);
      //setCommentedUserId(id);
      //setForceAnswer(true);
    }
  }

  const onClose = () => {
    setShowScr(false);
    onCloseModal()
  }

  useEffect(() => {
    mounted.current = true;
    getFollowUsers();
    getAnswers();
    dispatch(setVoiceState(voiceState + 1));
    return () => {
      mounted.current = false;
    }
  }, [refreshState])
  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={showScr}
      onRequestClose={() => {
        onClose();
      }}
    >
      <Pressable onPressOut={onClose} style={[styles.swipeModal, { height: windowHeight, marginTop: 0, flex: 1 }]}>
        <View style={[styles.swipeContainerContent, { bottom: 0, maxHeight: windowHeight }]}>
          <KeyboardAvoidingView
            style={{
              backgroundColor: '#FFF',
              flex: 1,
            }}
          >
            <Pressable style={{ backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 30 }}>
              <View style={{ width: '100%', marginTop: 8, alignItems: 'center' }}>
                <View style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: '#D4C9DE' }}>
                </View>
              </View>
              <SemiBoldText
                text={t('Answers') + ' (' + (loading ? ' ' : combines.length) + ')'}
                marginTop={19}
                marginLeft={16}
                marginBottom={15}
              />
              <ScrollView
                style={{ maxHeight: 300, marginBottom: 80 }}
              >
                {!loading ? combines.length > 0 ? combines.map((item, index) =>
                  item.type ?
                    <AnswerVoiceItem
                      key={index + item.id + 'answerVoice'}
                      props={props}
                      info={item}
                      onChangeIsLiked={() => setIsLiked(index)}
                      onDeleteItem={() => onDeleteItem(index)}
                      holdToAnswer={(v) => setIsHolding(v)}
                      onReplyAnswer={() => setReplyId(index)}
                      friends={friends}
                    />
                    :
                    <TagItem
                      key={index + item.id + 'tagFriend'}
                      props={props}
                      info={item}
                      onChangeIsLiked={() => setIsLiked(index)}
                      onDeleteItem={() => onDeleteItem(index)}
                    />)
                  :
                  <View style={{ alignItems: 'center' }}>
                    <Image
                      style={{
                        width: 180,
                        height: 110
                      }}
                      source={require('../../assets/discover/no-answers.png')}
                    />
                    <DescriptionText
                      text={t("No answers")}
                      fontSize={17}
                      lineHeight={28}
                      color='#281E30'
                      marginTop={24}
                    />
                    <DescriptionText
                      text={t("Be the first one to react to this story!")}
                      fontSize={17}
                      textAlign='center'
                      maxWidth={260}
                      lineHeight={28}
                      marginTop={8}
                    />
                  </View>
                  :
                  <Progress.Circle
                    indeterminate
                    size={30}
                    color="rgba(0, 0, 255, .7)"
                    style={{ alignSelf: "center", marginTop: windowHeight / 20 }}
                  />
                }
                <View style={{ width: 10, height: 58 }}></View>
              </ScrollView>
            </Pressable>
            <View style={{
              width: windowWidth,
              backgroundColor: filter.length > 0 ? '#FFF' : '#FFF0',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.5,
              shadowRadius: 8,
              elevation: filter.length > 0 ? 10 : 0,
              position: 'absolute',
              bottom: 0
            }}>
              {filter.length > 0 && filter.map((item, index) => {
                return <TouchableOpacity style={{
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                  key={item.user.id + index.toString()}
                  onPress={() => onReplace(item.user)}
                >
                  <Image
                    source={item.user.avatar ? { uri: item.user.avatar.url } : Avatars[item.user.avatarNumber].uri}
                    style={{ width: 24, height: 24, borderRadius: 12, marginLeft: 16 }}
                    resizeMode='cover'
                  />
                  <View style={{
                    flex: 1,
                    borderBottomColor: '#F2F0F5',
                    borderBottomWidth: 1,
                    marginLeft: 12,
                    paddingVertical: 8,
                  }}>
                    <SemiBoldText
                      text={'@' + item.user.name}
                      fontSize={15}
                      lineHeight={24}
                    />
                  </View>
                </TouchableOpacity>
              })
              }
              {replyId != -1 && <View
                style={{
                  width: windowWidth,
                  height: 40,
                  backgroundColor: '#F0F0F0',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <DescriptionText
                  text={t("Reply to ") + '@' + combines[replyId].user.name}
                  fontSize={15}
                  color="#000"
                  marginLeft={13}
                />
                <TouchableOpacity onPress={() => setReplyId(-1)}>
                  <SvgXml
                    xml={closeSvg}
                    style={{
                      marginRight: 13
                    }}
                    height={12}
                    width={12}
                  />
                </TouchableOpacity>
              </View>
              }
              <Pressable style={{
                width: windowWidth,
                height: 80,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                backgroundColor: '#FFF',
                elevation: 5,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                zIndex: 10
              }}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 6,
                  zIndex: 10,
                }}
                >
                  <TouchableOpacity onPress={() => {
                    setShowComment(!showComment);
                  }}>
                    <SvgXml
                      style={{
                        marginLeft: 14
                      }}
                      xml={gifSymbolSvg}
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      borderRadius: 40,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#F2F0F5',
                      flex: 1,
                      height: 40,
                      marginRight: 65,
                      marginLeft: 10,
                    }}
                  >
                    <TextInput
                      style={
                        {
                          fontSize: 15,
                          width: 205,
                          lineHeight: 18,
                          color: '#281E30',
                        }
                      }
                      value={label}
                      autoCapitalize='none'
                      onSubmitEditing={() => {
                        onAnswerBio();
                      }}
                      onChangeText={(e) => onSetLabel(e)}
                      placeholder={t("Type your answer")}
                      placeholderTextColor="rgba(59, 31, 82, 0.6)"
                    />
                    <TouchableOpacity onPress={() => {
                      onAnswerBio();
                      Keyboard.dismiss();
                    }}>
                      <SvgXml
                        xml={label == '' ? whitePostSvg : colorPostSvg}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <AnswerRecordIcon
                  props={props}
                  replyInfo={replyId != -1 ? combines[replyId] : null}
                  recordId={recordId}
                  onPublishStory={(res) => onAnswerStory(res)}
                  onPublishReplyStory={(res) => onReplyAnswerStory(res)}
                  onStartPublish={() => setIsLoading(true)}
                />
              </Pressable>
            </View>
            {/* <EmojiPicker
              onEmojiSelected={(icon) => onAnswerEmoji(icon.emoji)}
              open={visibleReaction}
              onClose={() => setVisibleReaction(false)}
            /> */}
            <SwipeDownModal
              modalVisible={showComment}
              ContentModal={
                <View style={{
                  position: 'absolute',
                  top: 100,
                  width: windowWidth,
                  alignItems: 'center'
                }}>
                  <View style={{
                    height: 470,
                    backgroundColor: '#FFF',
                    shadowColor: 'rgba(88, 74, 117, 1)',
                    elevation: 10,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    borderRadius: 16,
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <GifSearch
                      gifsToLoad={10}
                      giphyApiKey={'lOPWZ8ORMutlKj0R1uqZV47rKbhuwrHt'}
                      onGifSelected={(gif_url) => onAnswerGif(gif_url)}
                      style={{ backgroundColor: '#FFF', height: 300, width: 400 }}
                      textInputStyle={{ fontWeight: 'bold', color: 'black' }}
                      loadingSpinnerColor={'black'}
                      placeholderTextColor='rgba(59, 31, 82, 0.6)'
                      numColumns={3}
                      provider={"giphy"}
                      //providerLogo={poweredByGiphyLogoGrey}
                      showScrollBar={false}
                      noGifsFoundText={"No Gifs found :("}
                    />
                  </View>
                </View>
              }
              ContentModalStyle={styles.swipeModal}
              onClose={() => {
                setShowComment(false);
              }}
            />
            {info && <Modal
              animationType="slide"
              transparent={true}
              visible={showModal}
              onRequestClose={() => {
                setShowModal(!showModal);
              }}
            >
              <Pressable onPressOut={() => setShowModal(false)} style={styles.swipeModal}>
                <View style={styles.swipeContainerContent}>
                  <View style={[styles.rowSpaceBetween, { paddingLeft: 16, paddingRight: 14, paddingTop: 14, paddingBottom: 11, borderBottomWidth: 1, borderBottomColor: '#F0F4FC' }]}>
                    <View style={styles.rowAlignItems}>
                      <Image
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 19
                        }}
                        source={info.user.avatar ? { uri: info.user.avatar.url } : Avatars[info.user.avatarNumber].uri}
                      />
                      <View style={{ marginLeft: 18 }}>
                        <SemiBoldText
                          text={info?.title.toUpperCase()}
                          fontSize={17}
                          lineHeight={28}
                        />
                        <DescriptionText
                          fontSize={13}
                          lineHeight={21}
                          color={'rgba(54, 36, 68, 0.8)'}
                          text={info?.user.name}
                        />
                      </View>
                    </View>
                    <View style={[styles.contentCenter, { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F4FC' }]}>
                      <Pressable onPress={() => setShowModal(false)}>
                        <SvgXml
                          width={18}
                          height={18}
                          xml={closeBlackSvg}
                        />
                      </Pressable>
                    </View>
                  </View>
                  <View style={{ height: 200, borderRadius: 20, borderWidth: 1, borderColor: '#F0F4FC', marginTop: 16, marginBottom: 50, marginHorizontal: 16 }}>
                    <Pressable onPress={editVoice}>
                      <View style={[styles.rowSpaceBetween, { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4FC' }]}>
                        <DescriptionText
                          text={t("Edit")}
                          fontSize={17}
                          lineHeight={22}
                          color='#281E30'
                        />
                        <View style={[styles.contentCenter, { height: 34, width: 34, borderRadius: 17, backgroundColor: '#F8F0FF' }]}>
                          <SvgXml
                            width={20}
                            height={20}
                            xml={editSvg}
                          />
                        </View>
                      </View>
                    </Pressable>
                    <Pressable onPress={onShareAudio}>
                      <View style={[styles.rowSpaceBetween, { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4FC' }]}>
                        <DescriptionText
                          text={t('Share')}
                          fontSize={17}
                          lineHeight={22}
                          color='#281E30'
                        />
                        <View style={[styles.contentCenter, { height: 34, width: 34, borderRadius: 17, backgroundColor: '#F8F0FF' }]}>
                          <SvgXml
                            width={20}
                            height={20}
                            xml={blueShareSvg}
                          />
                        </View>
                      </View>
                    </Pressable>
                    <Pressable onPress={deleteConfirm}>
                      <View style={[styles.rowSpaceBetween, { padding: 16 }]}>
                        <DescriptionText
                          text={t("Delete")}
                          fontSize={17}
                          lineHeight={22}
                          color='#E41717'
                        />
                        <View style={[styles.contentCenter, { height: 34, width: 34, borderRadius: 17, backgroundColor: '#FFE8E8' }]}>
                          <SvgXml
                            width={20}
                            height={20}
                            xml={redTrashSvg}
                          />
                        </View>
                      </View>
                    </Pressable>
                  </View>
                  <View style={styles.segmentContainer}></View>
                </View>
              </Pressable>
            </Modal>}
            <Modal
              animationType="slide"
              transparent={true}
              visible={deleteModal}
              onRequestClose={() => {
                setDeleteModal(!deleteModal);
              }}
            >
              <Pressable onPressOut={() => setDeleteModal(false)} style={styles.swipeModal}>
                <View style={{ height: '100%', width: '100%' }}>
                  <View style={{ position: 'absolute', width: windowWidth - 16, bottom: 112, marginHorizontal: 8, height: 122, borderRadius: 14, backgroundColor: '#E9EAEC' }}>
                    <View style={{ paddingTop: 14, height: 65.5, width: '100%', borderBottomWidth: 1, borderBottomColor: '#B6C2DB', alignItems: 'center' }}>
                      <SemiBoldText
                        text={t("Do you want to delete this story?")}
                        fontSize={13}
                        lineHeight={21}
                        color='rgba(38, 52, 73, 0.7)'
                      />
                      <SemiBoldText
                        text={t("This action cannot be undone")}
                        fontSize={13}
                        lineHeight={21}
                        color='rgba(38, 52, 73, 0.7)'
                      />
                    </View>
                    <Pressable onPress={deleteVoice}>
                      <DescriptionText
                        text={t("Delete")}
                        fontSize={20}
                        lineHeight={24}
                        color='#E41717'
                        textAlign='center'
                        marginTop={16}
                      />
                    </Pressable>
                  </View>
                  <View style={{ position: 'absolute', width: windowWidth - 16, bottom: 48, marginHorizontal: 8, height: 56, borderRadius: 14, backgroundColor: 'white' }}>
                    <Pressable onPress={() => setDeleteModal(false)}>
                      <DescriptionText
                        text={t('Cancel')}
                        fontSize={20}
                        lineHeight={24}
                        color='#1E61EB'
                        textAlign='center'
                        marginTop={16}
                      />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            </Modal>
            {showShareVoice &&
              <ShareVoice
                info={info}
                onCloseModal={() => setShowShareVoice(false)}
              />
            }
            {allLikes &&
              <StoryLikes
                props={props}
                storyId={info?.id}
                storyType="record"
                onCloseModal={() => setAllLikes(false)}
              />}
            {showTagFriends &&
              <TagFriends
                info={info}
                recordId={info.id}
                onCloseModal={() => setShowTagFriends(false)}
              />
            }
            {showFriendsList && <NewChat
              props={props}
              recordId={info.id}
              onCloseModal={() => setShowFriendsList(false)}
            />}
            {isLoading &&
              <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(1,1,1,0.3)' }}>
                <View style={{ marginTop: windowHeight / 2.5, alignItems: 'center', width: windowWidth }}>
                  <Progress.Circle
                    indeterminate
                    size={30}
                    color="rgba(0, 0, 255, 0.7)"
                    style={{ alignSelf: "center" }}
                  />
                </View>
              </View>
            }
          </KeyboardAvoidingView>
          {Platform.OS == 'ios' && <KeyboardSpacer />}
        </View>
      </Pressable>
    </Modal>
  );
};