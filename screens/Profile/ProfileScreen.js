import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  Pressable,
  ScrollView,
  Platform,
  RefreshControl,
  ImageBackground,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import { BottomButtons } from '../component/BottomButtons';
import LinearGradient from 'react-native-linear-gradient';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { SvgXml } from 'react-native-svg';
import editSvg from '../../assets/common/edit.svg';
import boxbackArrowSvg from '../../assets/profile/box_backarrow.svg';
import qrSvg from '../../assets/profile/qr-code.svg';
import { useSelector } from 'react-redux';
import { styles } from '../style/Common';
import * as Progress from "react-native-progress";
import VoiceService from '../../services/VoiceService';
import { Avatars, calcLevel, Scores, windowWidth } from '../../config/config';
import { Stories } from '../component/Stories';
import { TemporaryStories } from '../component/TemporaryStories';
import { RecordIcon } from '../component/RecordIcon';
import { FollowUsers } from '../component/FollowUsers';
import { ShareQRcode } from '../component/ShareQRcode';
import { ShowLikesCount } from '../component/ShowLikesCount';
import { SemiBoldText } from '../component/SemiBoldText';
import qrCodeSvg from '../../assets/common/qr-code.svg';
import checkSvg from '../../assets/profile/check.svg';
import unCheckSvg from '../../assets/profile/unCheck.svg';
import { MyButton } from '../component/MyButton';
import { LevelStatus } from '../component/LevelStatus';

const ProfileScreen = (props) => {

  let { user, refreshState } = useSelector((state) => {
    return (
      state.user
    )
  });

  const { t, i18n } = useTranslation();

  let userData = { ...user };
  const [voices, setVoices] = useState([]);
  const [userInfo, setUserInfo] = useState({});
  const [refresh, setRefresh] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadMore, setLoadMore] = useState(10);
  const [showEnd, setShowEnd] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const [allFollows, setAllFollows] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showLikesCount, setShowLikesCount] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLevel, setShowLevel] = useState(false);

  const mounted = useRef(false);

  if (props.navigation.state.params)
    () => setRefresh(!refresh);

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

    VoiceService.getUserVoice(userData.id, voices.length).then(async res => {
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
    VoiceService.getProfile(userData.id).then(async res => {
      if (res.respInfo.status == 200 && mounted.current) {
        const jsonRes = await res.json();
        setUserInfo(jsonRes);
      }
    })
      .catch(err => {
        console.log(err);
      });
  }

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
    getUserVoices();
    getUserInfo();
    return () => {
      mounted.current = false;
    }
  }, [refreshState])
  return (
    <KeyboardAvoidingView
      style={{
        backgroundColor: '#FFF',
        flex: 1
      }}
    >
      <Image
        source={userData.avatar ? { uri: userData.avatar.url } : Avatars[userData.avatarNumber].uri}
        resizeMode="cover"
        style={[styles.topProfileContainer, {
          width: windowWidth + (userData.premium == "none" ? 0 : 6),
          height: 350 + (userData.premium == "none" ? 0 : 6),
          borderBottomLeftRadius: 45 + (userData.premium == "none" ? 0 : 3),
          borderWidth: userData.premium == "none" ? 0 : 3,
          marginLeft: userData.premium == "none" ? 0 : -3,
          marginTop: userData.premium == "none" ? 0 : -3,
          borderColor: '#FFA002'
        }]}
      />
      <Pressable style={{ position: 'absolute', top: 0 }} onLongPress={() => props.navigation.navigate('UpdatePicture')}>
        <LinearGradient
          colors={['rgba(52, 50, 56, 0)', 'rgba(42, 39, 47, 0)', 'rgba(39, 36, 44, 0.65)', 'rgba(34, 32, 38, 0.9)']}
          locations={[0, 0.63, 0.83, 1]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={[
            styles.topProfileContainer,
            {
              paddingBottom: 30,
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'flex-end',

            }
          ]}
        >
          <Pressable onPress={() => setShowLevel(true)} style={{ position: 'absolute', alignItems: 'center', right: 16, top: Platform.OS == 'ios' ? 50 : 38 }}>
            <View style={{
              width: 103,
              height: 38,
              borderRadius: 20,
              borderWidth: 1.76,
              borderColor: 'rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(200, 200, 200, 0.6)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DescriptionText
                text={user.score + '🕯️'}
                fontSize={20}
                lineHeight={25}
                color='#FEFEFE'
              />
            </View>
            <ImageBackground
              source={Scores[calcLevel(user.score)].uri}
              style={{
                width: 30,
                height: 30,
                marginTop: -5.5,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Progress.Circle
                progress={user.score / Scores[calcLevel(user.score)].targetScore}
                size={22}
                borderWidth={0}
                color='rgba(255, 255, 255, 0.8)'
                unfilledColor='rgba(255, 255, 255, 0.2)'
              />
              <SvgXml
                xml={calcLevel(user.score) > 0 ? checkSvg : unCheckSvg}
                width={13}
                height={13}
                style={{
                  position: 'absolute',
                  top: 8.5,
                  left: 8.5
                }}
              />
            </ImageBackground>
            {calcLevel(user.score) < 5 && <View style={{
              marginTop: 3.7,
            }}>
              <Progress.Bar
                progress={user.score / Scores[calcLevel(user.score)].targetScore}
                width={76}
                height={8.6}
                borderRadius={5}
                borderColor='#EDEFF1'
                color='#6479FE'
                unfilledColor='#EDEFF1'
              />
              <ImageBackground
                source={Scores[calcLevel(user.score) + 1].uri}
                style={{
                  position: 'absolute',
                  right: -4,
                  top: -4,
                  width: 16.6,
                  height: 16.6,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Progress.Circle
                  progress={user.score / Scores[calcLevel(user.score)].targetScore}
                  size={12}
                  borderWidth={0}
                  thickness={2}
                  color='rgba(255, 255, 255, 0.8)'
                  unfilledColor='rgba(255, 255, 255, 0.2)'
                />
                <SvgXml
                  xml={checkSvg}
                  width={7.6}
                  height={7.6}
                  style={{
                    position: 'absolute',
                    top: 4.5,
                    left: 4.5
                  }}
                />
              </ImageBackground>
            </View>
            }
          </Pressable>
          <TouchableOpacity onPress={() => props.navigation.goBack()} style={{ position: 'absolute', left: 0, top: Platform.OS == 'ios' ? 24 : 12 }}>
            <SvgXml
              xml={boxbackArrowSvg}
            />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <DescriptionText
              text={t("Stories")}
              fontSize={12}
              lineHeight={16}
              color="#F6EFFF"
            />
            <TitleText
              text={userInfo.voices?.count}
              fontFamily="SFProDisplay-Bold"
              fontSize={22}
              lineHeight={28}
              color="#FFFFFF"
            />
          </View>
          <TouchableOpacity onPress={() => setAllFollows("Followers")} style={{ alignItems: 'center' }}>
            <DescriptionText
              text={t("Followers")}
              fontSize={12}
              lineHeight={16}
              color="#F6EFFF"
            />
            <TitleText
              text={userInfo.followers?.count}
              fontFamily="SFProDisplay-Bold"
              fontSize={22}
              lineHeight={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowLikesCount(true)} style={{ alignItems: 'center' }}>
            <DescriptionText
              text={t("Likes")}
              fontSize={12}
              lineHeight={16}
              color="#F6EFFF"
            />
            <TitleText
              text={userInfo.likes}
              fontSize={22}
              fontFamily="SFProDisplay-Bold"
              lineHeight={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowQR(true)} style={{ alignItems: 'center' }}>
            <DescriptionText
              text={t('Share me')}
              fontSize={12}
              lineHeight={16}
              color="#F6EFFF"
            />
            <SvgXml
              xml={qrCodeSvg}
              height={28}
              width={28}
            />
          </TouchableOpacity>
        </LinearGradient>
      </Pressable>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: -52
      }}>
        <MyButton
          label={"Memories"}
          width={200}
          height={40}
          fontSize={14}
          borderRadius={12}
          onPress={() => props.navigation.navigate("Calendar", { activeYear: new Date().getFullYear(), activeMonth: new Date().getMonth() })}
        />
      </View>
      <ScrollView
        style={{ marginBottom: Platform.OS == 'ios' ? 82 : 92, marginTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            setLoadKey(loadKey + 1);
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.paddingH16}>
          <View style={styles.rowSpaceBetween}>
            <View>
              <View style={styles.rowAlignItems}>
                <TitleText
                  text={onLimit(userData.name)}
                  fontFamily="SFProDisplay-Bold"
                  lineHeight={33}
                />
                <TouchableOpacity disabled={userData.premium != 'none'} onPress={() => props.navigation.navigate("Premium")}>
                  {userData.premium != 'none' ? <Image
                    style={{
                      width: 100,
                      height: 33,
                      marginLeft: 16
                    }}
                    source={require('../../assets/common/premiumstar.png')}
                  />
                    :
                    <ImageBackground
                      style={{
                        width: 150,
                        height: 30,
                        marginLeft: 8,
                        justifyContent: 'center'
                      }}
                      source={require('../../assets/common/discover_premium.png')}
                    >
                      <DescriptionText
                        text={t("Discover Premium")}
                        fontFamily="SFProDisplay-Medium"
                        fontSize={13}
                        lineHeight={13}
                        color="#A360CF"
                        marginLeft={34}
                      />
                    </ImageBackground>
                  }
                </TouchableOpacity>
                {/* <View style={{
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  borderRadius: 8,
                  borderColor: userInfo.likes < 100 ? '#E53F34' : userInfo.likes < 1000 ? '#FFCC27' : '#6099C7',
                  borderWidth: 2,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginLeft: 6,
                  marginRight: 4,
                  backgroundColor: '#FFF',
                  shadowColor: 'rgba(88, 74, 117, 1)',
                  elevation: 10,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                }}>
                  <Image
                    style={{
                      width: 20,
                      height: 20,
                    }}
                    source={userInfo.likes < 100 ? require('../../assets/profile/bronze-diamond.png') :
                      userInfo.likes < 1000 ? require('../../assets/profile/gold-diamond.png') : require('../../assets/profile/real-diamond.png')
                    }
                  />
                  <SemiBoldText
                    fontSize={13}
                    lineHeight={18}
                    text={userInfo.likes < 100 ? t("Bronze") : userInfo.likes < 1000 ? t("Gold") : t("Emeraud")}
                    color={userInfo.likes < 100 ? '#E4373A' : userInfo.likes < 1000 ? '#FFC30E' : '#6497C5'}
                    marginLeft={8}
                  />
                </View> */}
              </View>
            </View>
            <View style={[styles.contentCenter, { height: 40, width: 40, borderRadius: 20, backgroundColor: '#F8F0FF' }]}>
              <TouchableOpacity onPress={() => props.navigation.navigate('EditProfile')}>
                <SvgXml
                  width={18}
                  height={18}
                  xml={editSvg}
                />
              </TouchableOpacity>
            </View>
          </View>
          {user.firstname && <DescriptionText
            text={renderFullName(user.firstname)}
            fontSize={12}
            lineHeight={16}
            color='rgba(54, 18, 82, 0.8)'
          />}
          {user.bio && <DescriptionText
            numberOfLines={3}
            marginTop={15}
            text={user.bio}
          />}
          <TitleText
            text={t('Stories')}
            fontSize={20}
            marginTop={21}
            marginBottom={3}
          />
        </View>
        <Stories
          props={props}
          loadKey={loadKey}
          screenName="Profile"
          userId={user.id}
        />
      </ScrollView>
      <BottomButtons
        active='profile'
        props={props}
      />
      {showLevel && <LevelStatus
        props={props}
        userInfo={user}
        onCloseModal={() => setShowLevel(false)}
      />}
      {showQR && <ShareQRcode
        userInfo={user}
        onCloseModal={() => setShowQR(false)}
      />}
      {allFollows != '' &&
        <FollowUsers
          props={props}
          userId={user.id}
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
      <RecordIcon
        props={props}
        bottom={27}
        left={windowWidth / 2 - 27}
      />
    </KeyboardAvoidingView>
  );
};

export default ProfileScreen;