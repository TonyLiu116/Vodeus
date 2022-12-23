import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Platform,
  Vibration
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as Progress from "react-native-progress";
import { SvgXml } from 'react-native-svg';

import '../../language/i18n';
import { VoiceItem } from '../component/VoiceItem';
import box_blankSvg from '../../assets/discover/box_blank.svg';
import { windowHeight, windowWidth } from '../../config/config';
import VoiceService from '../../services/VoiceService';
import { DescriptionText } from '../component/DescriptionText';
import { MyButton } from './MyButton';
import { InviteUsers } from './InviteUsers';
import SelectTopicScreen from '../PhoneNumberLogin/SelectTopicScreen';
import { StoryItem } from '../component/StoryItem';
import { setVisibleOne } from '../../store/actions';
import { StoryPanel } from './StoryPanel';
import { FriendStoryItem } from './FriendStoryItem';
import { FriendStoryItems } from './FriendStoryItems';
import { DailyPopUp } from './DailyPopUp';
import RNVibrationFeedback from 'react-native-vibration-feedback';

export const FriendStories = ({
  props,
  screenName = '',
  category = '',
  userId = '',
  searchTitle = '',
  recordId = '',
  selectedDay = 0,
  selectedMonth = 0,
  isFirst,
  forceRefreshDay,
  setSelectedDay = () => { },
  setSelectedMonth = () => { },
  targetRecordId
}) => {
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 40,
    waitForInteraction: true,
  };


  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();
  const scrollRef = useRef();
  const mounted = useRef(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  const [stories, setStories] = useState([]);
  const [LoadMore, setLoadMore] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showInviteList, setShowInviteList] = useState(false);
  const [localKey, setLocalKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [storyPanels, setStoryPanels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const debounceIndex = useDebounce(currentIndex, 600);
  const [isScrollDragging, setIsscrollDragging] = useState(false);
  const debounceDragging = useDebounce(isScrollDragging, 600);
  const [dailyPop, setDailyPop] = useState(false);
  const [visibleItemIndex, setVisibleItemIndex] = useState();
  const [focused, setFocused] = useState();

  let { visibleOne, refreshState, user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const pageHeight = windowHeight / 814 * 546;

  useEffect(() => {
    getStories();
  }, [forceRefreshDay])

  function useDebounce(value, delay) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(
      () => {
        // Update debounced value after delay
        const handler = setTimeout(() => {
          setDebouncedValue(value);
        }, delay);
        // Cancel the timeout if value changes (also on delay change or unmount)
        // This is how we prevent debounced value from updating if value is changed ...
        // .. within the delay period. Timeout gets cleared and restarted.
        return () => {
          clearTimeout(handler);
        };
      },
      [value, delay] // Only re-call effect if value or delay changes
    );
    return debouncedValue;
  }

  useEffect(() => {
    if (!debounceDragging) {
      dispatch(setVisibleOne(debounceIndex));
    }
  }, [debounceIndex, debounceDragging]);

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = -110;
    return layoutMeasurement.width + contentOffset.x >=
      contentSize.width - paddingToBottom;
  };
  const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = -110;
    return contentOffset.x <= paddingToBottom;
  };

  const OnShowEnd = () => {
    if (showEnd) return;
    setShowEnd(true);
    setTimeout(() => {
      if (mounted.current)
        setShowEnd(false);
    }, 2000);
  }

  const onInsert = (v) => {
    let tp = [];
    for (let i = 0; i < v.length; i++) {
      if ((i + 1) % 80 == 0)
        tp.push({ isPopUp: true });
      tp.push(v[i]);
    }
    setStoryPanels([...tp]);
  }

  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.nativeEvent.locationX);
  }

  const onTouchMove = (e) => setTouchEnd(e.nativeEvent.locationX)

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe || isRightSwipe) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const currentDay = new Date().getDate();
      if (isLeftSwipe) {
        if (selectedMonth == currentMonth) {
          if (selectedDay < currentDay) {
            setSelectedDay(selectedDay + 1);
          }
        } else {
          const specific_days = new Date(currentYear, selectedMonth, 0).getDate();
          if (selectedDay < specific_days) {
            setSelectedDay(selectedDay + 1);
          } else {
            setSelectedMonth(selectedMonth + 1);
            setSelectedDay(1);
          }
        }
      } else {
        if (selectedMonth > 1) {
          if (selectedDay > 1) {
            setSelectedDay(selectedDay - 1);
          } else {
            const specific_days = new Date(currentYear, selectedMonth - 1, 0).getDate();
            setSelectedMonth(selectedMonth - 1);
            setSelectedDay(specific_days);
          }
        } else {
          if (selectedDay > 1) {
            setSelectedDay(selectedDay - 1);
          }
        }
      }
    }
    // add your conditional logic here
  }

  const getStories = () => {
    setLoading(true);
    const currentYear = new Date().getFullYear();
    VoiceService.getStories(0, userId, category, searchTitle, recordId, 'friend', 10, `${currentYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`,targetRecordId?targetRecordId:"").then(async res => {
      if (res.respInfo.status === 200) {
        const jsonRes = await res.json();
        // const result = jsonRes.reverse();
        setStories([...jsonRes]);
        setLoading(false);
      }
    })
      .catch(err => {
        console.log(err);
      });
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
    if (selectedMonth && selectedDay) {
      getStories();
    }
  }, [])

  useEffect(() => {
    if (selectedMonth && selectedDay) {
      getStories()
    }
  }, [selectedDay, selectedMonth])

  const onChangeLike = (id, val) => {
    let tp = [...stories];
    let item = tp[id].isLike;
    if (item == true && val == false) {
      tp[id].likesCount--;
    }
    else if (item == false && val == true) {
      tp[id].likesCount++;
    }
    tp[id].isLike = val;
    // const result = tp.reverse();
    const result = tp;
    setStories([...result]);
  }
  const renderFooter = () => {
    return (
      <View style={{ backgroundColor: "#00FF00" }}>
        <Text style={{ color: "#FF0000" }}>End of the Line!</Text>
      </View>
    )
  }
  const onChangePrevDay = () => {
    if (selectedDay > 1) {
      setSelectedDay(selectedDay - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }

  const onChangeNextDay = () => {
    let daysInMonth = new Date(currentYear, selectedMonth, 0).getDate();
    if (currentMonth == selectedMonth) {
      if (currentDay > selectedDay) {
        setSelectedDay(selectedDay + 1);
      }
    } else {
      if (selectedDay < daysInMonth) {
        setSelectedDay(selectedDay + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
        isFirst.current = true;
      }
    }
  }

  const onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
    if (changed && changed.length > 0) {
      setCurrentIndex(changed[0].index);
    }
  });

  const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

  const storyItems = useMemo(() => {
    return <FlatList
      style={{ width: windowWidth, height: pageHeight, paddingTop: windowHeight / 812 * 17 }}
      // horizontal={true}
      pagingEnabled={true}
      ref={scrollRef}
      data={stories}
      onContentSizeChange={() => {
        scrollRef.current?.scrollToIndex({ index: 0, animated: true })
      }}
      onScroll={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent)) {
          console.log("next day");
        }
        if (isCloseToTop(nativeEvent)) {
          console.log("prev day");
        }
      }}
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50
      }}
      onScrollBeginDrag={(e) => setIsscrollDragging(true)}
      onScrollEndDrag={(e) => setIsscrollDragging(false)}
      renderItem={({ item, index }) => {
        return <FriendStoryItem
          key={index + item.id}
          props={props}
          itemIndex={index}
          info={item}
          height={pageHeight}
          storyLength={stories.length}
          onMoveNext={(index1) => {
            scrollRef.current?.scrollToIndex({ animated: true, index: index1 })
          }}
          onChangeLike={(isLiked) => onChangeLike(index, isLiked)}
          onChangePrevDay={() => onChangePrevDay()}
          onChangeNextDay={() => onChangeNextDay()}
        />
      }}
      keyExtractor={(item, index) => index.toString()}
    />
  }, [stories, selectedDay, selectedMonth])

  return <View style={{ height: pageHeight }}>
    {(stories.length > 0 ? storyItems :
      (!loading ?
        <View style={{ alignItems: 'center', justifyContent: "center", width: windowWidth, height: pageHeight }} onTouchStart={(e) => onTouchStart(e)} onTouchEnd={onTouchEnd} onTouchMove={(e) => onTouchMove(e)} >
          {(currentDay == selectedDay && currentMonth == selectedMonth) ?
            <View View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "white", position: "relative" }}>
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
                  fontSize: 16.84,
                  lineHeight: 32,
                  width: 320,
                  color: "#361252",
                  textAlign: 'center',
                }}
              >
                {"Hello, "+`${user.name}! `+t("Be the first one to share a moment with your loved ones today!")}
              </Text>
              <MyButton
                width={320}
                label={t("Share a moment with my friends")}
                onPress={() =>{
                  setDailyPop(true);
                  Platform.OS == 'ios' ? RNVibrationFeedback.vibrateWith(1519) : Vibration.vibrate(100);
                }}
              />
            </View> :
            <View View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "white", position: "relative" }}>
              <SvgXml
                xml={box_blankSvg}
              />
              <DescriptionText
                text={t("No friend stories")}
                fontSize={17}
                lineHeight={28}
                marginTop={22}
              />
              <View style={{ position: "absolute", bottom: 70, width: "100%", justifyContent: "center", alignItems: "center" }}>
                <TouchableOpacity style={{ padding: Platform.OS == 'android' ? 12 : 14, borderRadius: 14, backgroundColor: "#F8F0FF" }} onPress={() => setDailyPop(true)}>
                  <Text style={{ fontWeight: "500", fontSize: Platform.OS == 'android' ? 15 : 17, lineHeight: Platform.OS == 'android' ? 24 : 28, color: "#8327D8" }}>{t("Share a moment that happened on that day")}</Text>
                </TouchableOpacity>
              </View>
            </View>}
        </View>
        : null)
    )}
    {
      loading &&
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
    {/* {showInviteList &&
      <InviteUsers
        props={props}
        onCloseModal={() => setShowInviteList(false)}
      />
    } */}
    {
      dailyPop &&
      <DailyPopUp
        props={props}
        onCloseModal={() => setDailyPop(false)}
        isPast={true}
        createdAt={`${new Date().getFullYear()}-${selectedMonth}-${selectedDay}`}
      />
    }
  </View >
};
