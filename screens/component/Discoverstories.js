import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Image,
  Text,
  FlatList,
  RefreshControl,
  ScrollView
} from 'react-native';

import { useTranslation } from 'react-i18next';
import '../../language/i18n';
import * as Progress from "react-native-progress";
import { VoiceItem } from '../component/VoiceItem';
import { SvgXml } from 'react-native-svg';
import box_blankSvg from '../../assets/discover/box_blank.svg';
import { windowHeight, windowWidth } from '../../config/config';
import { useSelector, useDispatch } from 'react-redux';
import VoiceService from '../../services/VoiceService';
import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from './MyButton';
import { InviteUsers } from './InviteUsers';
import SelectTopicScreen from '../PhoneNumberLogin/SelectTopicScreen';
import { StoryItem } from '../component/StoryItem';
import { setVisibleOne } from '../../store/actions';
import { StoryPanel } from './StoryPanel';

export const DiscoverStories = ({
  props,
  screenName = '',
  category = '',
  userId = '',
  searchTitle = '',
  recordId = '',
}) => {

  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();
  const scrollRef = useRef();
  const mounted = useRef(false);

  const [stories, setStories] = useState([]);
  const [LoadMore, setLoadMore] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showInviteList, setShowInviteList] = useState(false);
  const [localKey, setLocalKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [storyPanels, setStoryPanels] = useState([]);

  let { visibleOne, refreshState } = useSelector((state) => {
    return (
      state.user
    )
  });

  const currentVisible = useRef(visibleOne);

  const pageHeight = windowHeight / 157 * 115 + (screenName == 'Feed' ? 90 : 0);

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 10;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const OnShowEnd = () => {
    if (showEnd) return;
    setShowEnd(true);
    setTimeout(() => {
      if (mounted.current)
        setShowEnd(false);
    }, 2000);
  }

  const onInsert = ( v )=>{
    let tp=[];
    for(let i=0;i<v.length;i++){
      if((i+1)%80 == 0)
        tp.push({isPopUp:true});
      tp.push(v[i]);
    }
    setStoryPanels([...tp]);
  }

  const getStories = (isNew) => {
    if (!isNew && LoadMore < 10) {
      OnShowEnd();
      return;
    }
    if (isNew) setLoading(true);
    VoiceService.getStories(isNew ? 0 : stories.length, userId, category, searchTitle, recordId, screenName == 'Feed' ? 'friend' : 'discover').then(async res => {
      if (mounted.current)
        setLoading(false);
      if (res.respInfo.status === 200 && mounted.current) {
        const jsonRes = await res.json();
        // let result = jsonRes.filter((item, index) => item.privacy);
        let temp = (stories.length == 0 || isNew) ? [...jsonRes] : [...stories, ...jsonRes];
        setStories(temp);
        setLoadMore(jsonRes.length);
        if (isNew)
          scrollRef.current?.scrollToOffset({ animated: true, offset: 0 });
        onInsert(temp);
      }
    })
      .catch(err => {
        console.log(err);
      });
  }

  const onChangeLike = (id, val) => {
    let tp = [...storyPanels];
    let item = tp[id].isLike;
    if (item == true && val == false) {
      tp[id].likesCount--;
    }
    else if (item == false && val == true) {
      tp[id].likesCount++;
    }
    tp[id].isLike = val;
    setStoryPanels([...tp]);
  }
  const onRefresh = () => {
    setRefreshing(true);
    getStories(true);
    setTimeout(() => {
      if (mounted.current)
        setRefreshing(false)
    }, 1000);
  };

  useEffect(() => {
    mounted.current = true;
    getStories(true);
    return () => {
      mounted.current = false;
    }
  }, [refreshState, category])

  useEffect(() => {
    if (visibleOne >= 0)
      dispatch(setVisibleOne(0));
  }, [])

  useEffect(() => {
    currentVisible.current = visibleOne;
  }, [visibleOne])

  const storyItems = useMemo(() => {
    return <ScrollView
      style={{
        height: pageHeight
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      onScroll={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent)) {
          getStories(false);
        }
      }}
      scrollEventThrottle={400}
    >
      <View
        style={{
          flexWrap: 'wrap',
          flexDirection: 'row',
          alignContent: 'center',
          width: windowWidth,
          paddingHorizontal: 12
        }}
      >
        {storyPanels.map((item, index) => {
          return <StoryPanel
            key={index +  screenName}
            itemIndex={index}
            props={props}
            info={item}
            onChangeLike={(isLiked) => onChangeLike(index, isLiked)}
          />
        })
        }
      </View>
    </ScrollView>
  }, [storyPanels, refreshState])

  return <View style={{ height: pageHeight }}>
    {showEnd &&
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
        <Image
          style={{
            width: 20,
            height: 20
          }}
          source={require('../../assets/common/happy.png')}
        />
        <DescriptionText
          marginLeft={3}
          text={t("You are up to date 🎉! Share Vocco with your friends!")}
        />
      </View>
    }
    {(stories.length > 0 ? storyItems : (!loading ?
      (screenName == 'Feed' ?
        <View style={{ width: windowWidth, alignItems: 'center' }}>
          <Image
            style={{
              width: 343,
              height: 321
            }}
            source={require('../../assets/Feed/InviteFriend.png')}
          />
          <Text
            numberOfLines={2}
            style={{
              fontFamily: "SFProDisplay-Semibold",
              fontSize: 20,
              lineHeight: 32,
              width: 280,
              color: "rgba(54, 36, 68, 0.8)",
              textAlign: 'center',
            }}
          >
            {t("Invite your friends and connect with other people!")}
          </Text>
          <MyButton
            label={t("Invite friends")}
            onPress={() => setShowInviteList(true)}
          />
        </View> :
        <View style={{ marginTop: windowHeight / 20, alignItems: 'center', width: windowWidth }}>
          <SvgXml
            xml={box_blankSvg}
          />
          <DescriptionText
            text={t("No stories yet")}
            fontSize={17}
            lineHeight={28}
            marginTop={22}
          />
        </View>
      )
      : null)
    )}
    {loading &&
      <View style={{
        position: stories.length ? 'absolute' : 'relative',
        width: '100%',
        alignItems: 'center',
        marginTop: 100,
        elevation: 20
      }}>
        <Progress.Circle
          indeterminate
          size={30}
          color="rgba(0, 0, 255, .7)"
          style={{ alignSelf: "center" }}
        />
      </View>
    }
    {showInviteList &&
      <InviteUsers
        props={props}
        onCloseModal={() => setShowInviteList(false)}
      />
    }
  </View>
};
