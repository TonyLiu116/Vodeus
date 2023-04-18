import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  Modal,
  RefreshControl,
  Vibration,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { useDispatch } from 'react-redux';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { setRefreshState } from '../../store/actions';
import { ShareVoice } from '../component/ShareVoice';
import { MyButton } from '../component/MyButton';
import { SvgXml } from 'react-native-svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import moreSvg from '../../assets/common/more.svg';
import boxbackArrowSvg from '../../assets/profile/box_backarrow.svg';
import qrSvg from '../../assets/profile/qr-code.svg';
import * as Progress from "react-native-progress";
import qrCodeSvg from '../../assets/common/qr-code.svg';
import checkSvg from '../../assets/profile/check.svg';
import unCheckSvg from '../../assets/profile/unCheck.svg';
import followSvg from '../../assets/profile/follow.svg';
import dotsVerticalSvg from '../../assets/profile/dots_vertical.svg';
import chatBlueSvg from '../../assets/profile/chat_blue.svg'
import backSvg from '../../assets/profile/back.svg';
import unfollowSvg from '../../assets/profile/unfollow.svg';
import blockSvg from '../../assets/profile/block.svg';
import redTrashSvg from '../../assets/common/red_trash.svg';
import blackPrivacySvg from '../../assets/profile/black_privacy.svg'
import arrowPointerSvg from '../../assets/profile/arrowpointer.svg'
import chatSvg from '../../assets/profile/chat.svg'
import shareSvg from '../../assets/post/share.svg';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { Avatars, calcLevel, Scores, windowWidth } from '../../config/config';
import { styles } from '../style/Common';
import { SemiBoldText } from '../component/SemiBoldText';
import VoiceService from '../../services/VoiceService';
import { PostContext } from '../component/PostContext'
import { Stories } from '../component/Stories';
import { t } from 'i18next';
import { TemporaryStories } from '../component/TemporaryStories';
import { FollowUsers } from '../component/FollowUsers';
import { ShareQRcode } from '../component/ShareQRcode';
import { ShowLikesCount } from '../component/ShowLikesCount';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import { DiscoverStories } from '../component/Discoverstories';
import { BottomButtons } from '../component/BottomButtons';
import { RecordIcon } from '../component/RecordIcon';
import { LevelStatus } from '../component/LevelStatus';

const UserProfileScreen = (props) => {

  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [followState, setFollowState] = useState('none');
  const [voices, setVoices] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [nowVoice, setNowVoice] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showContext, setShowContext] = useState(false);
  const [followLoading, setFollowLoading] = useState(true);
  const [showShareVoice, setShowShareVoice] = useState(null);
  const [loadMore, setLoadMore] = useState(10);
  const [showEnd, setShowEnd] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const [allFollows, setAllFollows] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showLikesCount, setShowLikesCount] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLevel, setShowLevel] = useState(false);

  const mounted = useRef(false);

  let { user, refreshState } = useSelector((state) => {
    return (
      state.user
    )
  });

  const dispatch = useDispatch();

  let userId = props.navigation.state.params.userId;

  const onRefresh = () => {
    setRefreshing(true);
    setLoadKey(loadKey - 1);
    setTimeout(() => {
      if (mounted.current)
        setRefreshing(false)
    }, 1000);
  };

  const getUserVoices = () => {
    if (loadMore < 10) {
      onShowEnd();
      return;
    }
    VoiceService.getUserVoice(userId, voices.length).then(async res => {
      if (res.respInfo.status === 200 && mounted.current) {
        const jsonRes = await res.json();
        if (jsonRes.length > 0)
          setVoices(voices.length == 0 ? jsonRes : [...voices, ...jsonRes]);
        setLoadMore(jsonRes.length);
      }
    })
      .catch(err => {
        console.log(err);
      });
  }

  const getUserInfo = () => {
    setFollowLoading(true);
    VoiceService.getProfile(userId).then(async res => {
      if (res.respInfo.status == 200 && mounted.current) {
        setFollowLoading(false);
        const jsonRes = await res.json();
        setUserInfo(jsonRes);
        if (jsonRes.isFriend)
          setFollowState(jsonRes.isFriend.status);
        setIsPrivate(jsonRes.user.isPrivate);
      }
    })
      .catch(err => {
        console.log(err);
      });
  }

  const changeFollowed = () => {
    setFollowLoading(true);
    let repo = followState == 'none' ? VoiceService.followFriend(userId) : VoiceService.unfollowFriend(userId);
    if (followState == 'none') {
      Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
    }
    repo.then(async res => {
      if (mounted.current) {
        setFollowLoading(false);
        const jsonRes = await res.json();
        if (res.respInfo.status == 201 || res.respInfo.status == 200) {
          setFollowState(jsonRes.status);
        }
      }
    })
      .catch(err => {
        console.log(err);
      });
    setDeleteModal(false);
  }

  const OnBlockUser = () => {
    setFollowLoading(true);
    VoiceService.blockUser(userId).then(async res => {
      if (mounted.current)
        setFollowLoading(false);
      if (res.respInfo.status == 201) {
        dispatch(setRefreshState(!refreshState));
        props.navigation.navigate('Home');
      }
    })
      .catch(err => {
        console.log(err);
      });
  }

  const onStopPlay = () => {
    setNowVoice(null);
  };
  const renderName = (fname, lname) => {
    let fullname = '';
    if (fname)
      fullname = fname;
    if (lname) {
      if (fname) fullname += ' ';
      fullname += lname;
    }
    return fullname
  }

  const setLiked = () => {
    let tp = voices;
    let item = tp[selectedIndex].isLike;
    if (item)
      tp[selectedIndex].likesCount--;
    else
      tp[selectedIndex].likesCount++;
    tp[selectedIndex].isLike = !tp[selectedIndex].isLike;
    setVoices(tp);
  }

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 10;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  }

  const onShowEnd = () => {
    if (showEnd) return;
    setShowEnd(true);
    setTimeout(() => {
      if (mounted.current)
        setShowEnd(false);
    }, 2000);
  }

  const onLimit = (v) => {
    return ((v).length > 8) ?
      (((v).substring(0, 5)) + '...') :
      v;
  }

  const renderFullName = (v) => {
    let firstName = v.split(' ')[0];
    let lastName = v.split(' ')[1];
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    lastName = lastName ? (lastName.charAt(0).toUpperCase() + lastName.slice(1)) : '';
    return '@' + firstName + ' ' + lastName;
  }

  useEffect(() => {
    mounted.current = true;
    getUserInfo()
    getUserVoices();
    return () => {
      mounted.current = false;
    }
  }, [refreshState, userId])
  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <ImageBackground
        source={require('../../assets/Feed/head_back.png')}
        style={{
          width: windowWidth,
          height: windowWidth * 83 / 371,
          justifyContent: 'flex-end',
          paddingBottom: 33,
          paddingHorizontal: 25
        }}
        imageStyle={{
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}>
          <TouchableOpacity
            onPress={() => props.navigation.goBack()}
          >
            <LinearGradient
              colors={['#8274CF', '#2C235C']}
              locations={[0, 1]}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={{
                width: 34.42,
                height: 34.42,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <SvgXml
                xml={backSvg}
              />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
          >
            <LinearGradient
              colors={['#8274CF', '#2C235C']}
              locations={[0, 1]}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={{
                width: 34.42,
                height: 34.42,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <SvgXml
                xml={dotsVerticalSvg}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>
      {userInfo.user&&<View style={{
        width: windowWidth,
        alignItems: 'center',
        marginTop: -28,
        marginBottom: 10
      }}>
        <Image
          source={userInfo.user.avatar ? { uri: userInfo.user.avatar.url } : Avatars[userInfo.user.avatarNumber].uri}
          resizeMode="cover"
          style={{
            width: 105,
            height: 105,
            borderRadius: 22,
            borderWidth: 1,
            borderColor: '#FFF',
            backgroundColor: '#D9D9D9'
          }}
        />
        <SemiBoldText
          text={userInfo.user.firstname}
          fontSize={15}
          lineHeight={24}
          marginTop={8}
          color='#361252'
        />
        <SemiBoldText
          text={'@' + userInfo.user.name}
          fontSize={13}
          lineHeight={24}
          color='#F57047'
        />
        <View style={{
          flexDirection: 'row',
          marginTop: 24
        }}>
          <View style={{
            alignItems: 'center'
          }}>
            <SemiBoldText
              text={userInfo.voices?.count}
              fontSize={20}
              lineHeight={28}
              color='#361252'
            />
            <DescriptionText
              text={t('Posts')}
              fontSize={16}
              lineHeight={22}
              color='#89759B'
            />
          </View>
          <TouchableOpacity style={{
            alignItems: 'center',
            marginHorizontal: 46,
          }}
            onPress={() => setAllFollows("Followers")}
          >
            <SemiBoldText
              text={userInfo.followers?.count}
              fontSize={20}
              lineHeight={28}
              color='#361252'
            />
            <DescriptionText
              text={t('Followers')}
              fontSize={16}
              lineHeight={22}
              color='#89759B'
            />
          </TouchableOpacity>
          <TouchableOpacity style={{
            alignItems: 'center'
          }}
            onPress={() => setShowLikesCount(true)}
          >
            <SemiBoldText
              text={userInfo.likes}
              fontSize={20}
              lineHeight={28}
              color='#361252'
            />
            <DescriptionText
              text={t('Likes')}
              fontSize={16}
              lineHeight={22}
              color='#89759B'
            />
          </TouchableOpacity>
        </View>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 36
        }}>
          <MyButton
            height={56}
            width={246}
            marginTop={0}
            label={followState == 'accepted' ? t('Followed') : followState == 'none' ? t("Follow") : t("Sent Request...")}
            onPress={() => followLoading ? null : changeFollowed()}
            loading={followLoading}
          />
          <TouchableOpacity style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            borderWidth: 1,
            borderColor: 'rgba(71, 58, 136, 0.21)',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 15
          }}
            onPress={() => props.navigation.navigate("Conversation", { info: userInfo })}
          >
            <SvgXml
              xml={chatBlueSvg}
            />
          </TouchableOpacity>
        </View>
      </View>}
      {userInfo.user &&
        <>
          <ScrollView
            style={{ marginTop: 16 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            onScroll={({ nativeEvent }) => {
              if (isCloseToBottom(nativeEvent)) {
                setLoadKey(loadKey + 1)
              }
            }}
            scrollEventThrottle={400}
          >
            {/* <View style={[styles.rowSpaceBetween, { paddingHorizontal: 16 }]}>
              <View>
                <View style={styles.rowAlignItems}>
                  <TitleText
                    text={onLimit(userInfo.user?.name)}
                    fontFamily="SFProDisplay-Bold"
                    lineHeight={33}
                  />
                  {userInfo.user && userInfo.user.premium != 'none' &&
                    <Image
                      style={{
                        width: 100,
                        height: 33,
                        marginLeft: 16
                      }}
                      source={require('../../assets/common/premiumstar.png')}
                    />
                  }
                  {userInfo.user && <TouchableOpacity style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                    borderColor: '#A24EE4',
                    borderWidth: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 6,
                    marginRight: 4,
                  }}
                    onPress={() => props.navigation.navigate("Conversation", { info: userInfo })}
                  >
                    <SvgXml
                      width={20}
                      height={20}
                      xml={chatSvg}
                    />
                    <SemiBoldText
                      fontSize={13}
                      lineHeight={18}
                      text={t("Message")}
                      color={'#8229F4'}
                      marginLeft={8}
                    />
                  </TouchableOpacity>}
                </View>
              </View>
              <View style={styles.rowAlignItems}>
                {followState == 'accepted' && <TouchableOpacity>
                  <SvgXml
                    width={24}
                    height={24}
                    xml={followSvg}
                  />
                </TouchableOpacity>}
                <TouchableOpacity onPress={() => setShowModal(true)} style={{ marginLeft: 28 }}>
                  <SvgXml
                    width={24}
                    height={24}
                    xml={moreSvg}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {userInfo?.user.firstname && <DescriptionText
              text={renderFullName(userInfo.user.firstname)}
              fontSize={12}
              lineHeight={16}
              color='rgba(54, 18, 82, 0.8)'
              marginLeft={16}
            />}
            {userInfo.user?.bio && <View style={{ paddingHorizontal: 16 }}>
              <DescriptionText
                numberOfLines={3}
                marginTop={15}
                text={userInfo.user.bio}
              />
            </View>}
            {(followState != 'accepted') && <MyButton
              marginTop={20}
              marginBottom={4}
              marginHorizontal={16}
              label={followState == 'none' ? t("Follow") : t("Sent Request...")}
              //active={followState=='none'}
              onPress={() => followLoading ? null : changeFollowed()}
              loading={followLoading}
            />} */}
            {(followState != 'accepted' && isPrivate) ? <>
              <View style={{ marginTop: 90, width: '100%', paddingHorizontal: (windowWidth - 251) / 2, alignItems: 'center' }}>
                <SvgXml
                  xml={blackPrivacySvg}
                />
                <DescriptionText
                  text={t("This account is private. Follow ") + userInfo.user.name + t(" to discover the stories")}
                  fontSize={17}
                  lineHeight={28}
                  textAlign='center'
                  marginTop={16}
                />
                <SvgXml
                  position={'absolute'}
                  //transform= {[{ rotate: '-46.73deg'}]}
                  bottom={39}
                  right={28}
                  xml={arrowPointerSvg}
                />
              </View>
            </> :
              <>
                {/* <TitleText
                  text={t("Stories")}
                  fontSize={20}
                  marginTop={23}
                  marginBottom={3}
                  marginLeft={16}
                /> */}
                <Stories
                  props={props}
                  loadKey={loadKey}
                  screenName="userProfile"
                  userId={userId}
                />
              </>
            }
          </ScrollView></>
      }
      {/* <BottomButtons
        active='profile'
        props={props}
      /> */}
      {/* <RecordIcon
        props={props}
        bottom={27}
        left={windowWidth / 2 - 27}
      /> */}
      <Modal
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
                {userInfo.user && <Image
                  style={{
                    width: 38,
                    height: 38
                  }}
                  source={userInfo.user.avatar ? { uri: userInfo.user.avatar.url } : Avatars[userInfo.user.avatarNumber].uri}
                />}
                <View style={{ marginLeft: 18 }}>
                  <SemiBoldText
                    text={userInfo.user?.name}
                    fontSize={17}
                    lineHeight={28}
                  />
                  <DescriptionText
                    fontSize={13}
                    lineHeight={21}
                    color={'rgba(54, 36, 68, 0.8)'}
                    text={userInfo.user?.firstname}
                  />
                </View>
              </View>
              <View style={[styles.contentCenter, { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F4FC' }]}>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <SvgXml
                    width={18}
                    height={18}
                    xml={closeBlackSvg}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ height: 267, borderRadius: 20, borderWidth: 0, borderColor: '#F0F4FC', marginTop: 16, marginBottom: 50, marginHorizontal: 16 }}>
              {/* <TouchableOpacity onPress={() => setShowShareVoice(true)}>
                <View style={[styles.rowSpaceBetween, { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4FC' }]}>
                  <DescriptionText
                    text={t("Share")}
                    fontSize={17}
                    lineHeight={22}
                    color='#281E30'
                  />
                  <View style={[styles.contentCenter, { height: 34, width: 34, borderRadius: 17, backgroundColor: '#F8F0FF' }]}>
                    <SvgXml
                      xml={shareSvg}
                    />
                  </View>
                </View>
              </TouchableOpacity> */}
              <TouchableOpacity onPress={() => {
                setShowModal(false);
                if (followState == 'none')
                  changeFollowed();
                else
                  setDeleteModal(true);
              }}>
                <View style={[styles.rowSpaceBetween, { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4FC' }]}>
                  <DescriptionText
                    text={followState == 'none' ? t("Follow") : t("Unfollow")}
                    fontSize={17}
                    lineHeight={22}
                    color='#281E30'
                  />
                  <View style={[styles.contentCenter, { height: 34, width: 34, borderRadius: 17, backgroundColor: '#F8F0FF' }]}>
                    <SvgXml
                      width={20}
                      height={20}
                      xml={unfollowSvg}
                    />
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowModal(false); OnBlockUser(); }} >
                <View style={[styles.rowSpaceBetween, { padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4FC' }]}>
                  <DescriptionText
                    text={t("Block this user")}
                    fontSize={17}
                    lineHeight={22}
                    color='#E41717'
                  />
                  <View style={[styles.contentCenter, { height: 34, width: 34, borderRadius: 17, backgroundColor: '#FFE8E8' }]}>
                    <SvgXml
                      width={20}
                      height={20}
                      xml={blockSvg}
                    />
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity>
                <View style={[styles.rowSpaceBetween, { padding: 16 }]}>
                  <DescriptionText
                    text={t("Report User")}
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
              </TouchableOpacity>
            </View>
            <View style={styles.segmentContainer}></View>
          </View>
        </Pressable>
      </Modal>
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
            <View style={{ position: 'absolute', width: windowWidth - 16, bottom: 112, marginHorizontal: 8, borderRadius: 14, backgroundColor: '#E9EAEC' }}>
              <View style={{ paddingTop: 14, paddingBottom: 8.5, width: '100%', borderBottomWidth: 1, borderBottomColor: '#B6C2DB', alignItems: 'center' }}>
                <SemiBoldText
                  text={userInfo.user?.name}
                  fontSize={13}
                  lineHeight={21}
                  color='rgba(38, 52, 73, 0.7)'
                />
              </View>
              <TouchableOpacity onPress={() => changeFollowed()} style={{ paddingVertical: 16 }}>
                <DescriptionText
                  text={t("Unfollow")}
                  fontSize={20}
                  lineHeight={24}
                  color='#E41717'
                  textAlign='center'
                />
              </TouchableOpacity>
            </View>
            <View style={{ position: 'absolute', width: windowWidth - 16, bottom: 48, marginHorizontal: 8, height: 56, borderRadius: 14, backgroundColor: 'white' }}>
              <TouchableOpacity onPress={() => setDeleteModal(false)}>
                <DescriptionText
                  text={t("Cancel")}
                  fontSize={20}
                  lineHeight={24}
                  color='#1E61EB'
                  textAlign='center'
                  marginTop={16}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
      {showContext &&
        <PostContext
          postInfo={voices[selectedIndex]}
          props={props}
          onChangeIsLike={() => setLiked()}
          onCloseModal={() => setShowContext(false)}
        />
      }
      {showQR && <ShareQRcode
        userInfo={userInfo.user}
        onCloseModal={() => setShowQR(false)}
      />}
      {showShareVoice &&
        <ShareVoice
          onCloseModal={() => { setShowShareVoice(false); }}
        />}
      {allFollows != '' &&
        <FollowUsers
          props={props}
          userId={userId}
          followType={allFollows}
          onCloseModal={() => setAllFollows('')}
        />
      }
      {showLikesCount &&
        <ShowLikesCount
          userInfo={userInfo}
          onCloseModal={() => setShowLikesCount(false)}
        />
      }
      {showLevel && <LevelStatus
        props={props}
        userInfo={userInfo.user}
        onCloseModal={() => setShowLevel(false)}
      />}
    </KeyboardAvoidingView>
  );
};

export default UserProfileScreen;