import React, { useState, useEffect, useRef, useReducer, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Share from 'react-native-share';
import { SvgXml } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import LinearGradient from "react-native-linear-gradient";
import { Menu } from 'react-native-material-menu';

import '../../language/i18n';
import { FeedStories } from './FeedStories';
import { Categories, windowWidth, Days, Months } from '../../config/config';
import { TemporaryStories } from './TemporaryStories';
import { setUser, setUsed } from '../../store/actions';
import { FriendStories } from './FriendStories';
import { styles } from '../style/Common';
import { SemiBoldText } from './SemiBoldText';
import { DescriptionText } from './DescriptionText';
import VoiceService from '../../services/VoiceService';

import ShareSvg from '../../assets/friend/share.svg';
import DropdownSvg from '../../assets/Feed/monthdown.svg';
import { LinearTextGradient } from 'react-native-text-gradient';
import { TitleText } from './TitleText';

export const Feed = ({
  props,
  category = 0,
}) => {

  const param = props.navigation.state.params;

  let targetRecord = param?.targetRecord;
  let sDay = param?.selectedDay;
  let sMonth = param?.selectedMonth;

  const { createdAt, isUsed } = useSelector((state) => state.user);

  const mounted = useRef(false);
  const current_Month = new Date().getMonth();
  const isFirst = useRef(false);

  const { t, i18n } = useTranslation();
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [monthDate, setMonthDate] = useState([]);
  const scrollRef = useRef();
  const [lastTap, setLastTap] = useState(0);
  const [delayTime, setDelayTime] = useState(null);
  const [forceRefreshDay, setForceRefreshDay] = useState(false);

  const DOUBLE_PRESS_DELAY = 400;

  const onClickDouble = (date) => {
    if (date !== selectedDay) {
      setSelectedDay(date);
    } else {
      const timeNow = Date.now();
      if (lastTap && timeNow - lastTap < DOUBLE_PRESS_DELAY) {
        clearTimeout(delayTime);
        setForceRefreshDay(!forceRefreshDay);
      } else {
        setLastTap(timeNow);
        setDelayTime(setTimeout(() => {
          if (mounted.current) {
            setLastTap(0);
          }
        }, DOUBLE_PRESS_DELAY));
      }
    }
  };

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const dispatch = useDispatch();

  const onShareLink = () => {
    Share.open({
      url: `https://vocco.app.link/${user.name}`,
      message: t("Hey! Are you ok? I'm a little tired of apps like Insta, BeReal etc. I want to share real moments with my loved ones, including you, on Vocco. Will you join me?") + '(' + t("it's free!") + ')'
    }).then(res => {

    })
      .catch(err => {
        console.log("err");
      });
  }

  useEffect(() => {
    if (monthDate.length > 0 && monthDate.length > selectedDay - 4)
      scrollRef.current?.scrollToIndex({ animated: true, index: Math.max(selectedDay - 4, 0) });
  }, [selectedDay])

  useEffect(() => {
    if (sDay && sMonth) {
      setSelectedMonth(sMonth + 1);
      setSelectedDay(sDay);
    }
    else if (targetRecord) {
      setSelectedMonth(parseInt(targetRecord.createdAt.split('-')[1]));
      setSelectedDay(parseInt(targetRecord.createdAt.split('-')[2]));
    }
    else if (isUsed == false && createdAt != '') {
      setSelectedMonth(parseInt(createdAt.split('-')[1]));
      setSelectedDay(parseInt(createdAt.split('-')[2]));
    } else {
      const currentDate = new Date();
      setSelectedMonth(currentDate.getMonth() + 1);
      setSelectedDay(currentDate.getDate());
    }
    mounted.current = true;
    let tp = user;
    tp.lastSee = new Date();
    dispatch(setUser(tp));
    return () => {
      mounted.current = false;
    }
  }, [sDay, sMonth]);

  useEffect(() => {
    if (selectedMonth > 0) {
      let month_dates = [];
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();
      let daysInMonth = new Date(currentYear, selectedMonth, 0).getDate();
      if (selectedMonth === currentMonth + 1) {
        daysInMonth = new Date().getDate();
      }
      for (let i = 1; i <= daysInMonth; i++) {
        let dayName = Days[new Date(`${currentYear}/${selectedMonth}/${i}`).getDay()];
        month_dates.push({
          date: i,
          day: dayName
        });
      }

      setMonthDate([...month_dates]);
      if (sDay) {
        setSelectedDay(sDay);
      }
      else if (targetRecord) {
        setSelectedDay(parseInt(targetRecord.createdAt.split('-')[2]));
      }
      else if (isUsed == true && isFirst.current != true) {
        setSelectedDay(daysInMonth);
      } else if (isFirst.current == true) {
        setSelectedDay(1);
        isFirst.current = false;
      } else {
        dispatch(setUsed());
      }
    }
  }, [selectedMonth])

  // useEffect(() => {
  //   if (selectedMonth && selectedDay) {
  //     VoiceService.getStories(0, '', '', '', '', 'friend', 10, `2022-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`);
  //   }
  // }, [selectedMonth, selectedDay])

  return (
    <View
      style={{
        backgroundColor: '#FFF',
        width: windowWidth,
        flex: 1,
      }}
    >
      {/* <TouchableOpacity
        style={[styles.rowSpaceBetween, { backgroundColor: '#F8F0FF', paddingVertical: 8, paddingHorizontal: 16, marginBottom: 6 }]}
        onPress={() => onShareLink()}
      >
        <View style={styles.rowAlignItems}>
          <Image
            source={user.avatar ? { uri: user.avatar.url } : Avatars[user.avatarNumber].uri}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
            }}
          />
          <View style={{
            marginLeft: 12
          }}>
            <SemiBoldText
              text={t("Invite friends")}
              fontSize={15}
              lineHeight={24}
            />
            <DescriptionText
              text={'vocco.ai/' + user.name}
              fontSize={13}
              lineHeight={21}
            />
          </View>
        </View>
        <SvgXml
          xml={ShareSvg}
        />
      </TouchableOpacity> */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 24 }}>
        <Text style={{ fontWeight: "700", fontSize: 18, lineHeight: 26, color: "#000000" }}>{t('Moments')}</Text>
        {/* <View style={{ position: "relative" }}>
          <View style={{ flexDirection: "row", alignItems: "center", width: 75, justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "700", fontSize: 12, lineHeight: 26, color: "#858585" }}
              onPress={() => setShowCalendar(true)}
            >
              {t(Months[selectedMonth - 1])}
            </Text>

            <Menu
              visible={showMonthDropdown}
              anchor={
                <Pressable onPress={() => setShowMonthDropdown(true)}>
                  <SvgXml xml={DropdownSvg} />
                </Pressable>
              }
              style={{
                marginTop:15,
                width:100,
                backgroundColor: '#FFF'
              }}
              onRequestClose={() => setShowMonthDropdown(false)}
            >
              <ScrollView style={{width: "100%",height: 100, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#858585", zIndex: 10, overflow: "scroll" }}>
                {
                  Months.map((item, index) => {
                    if (index <= current_Month) {
                      return <TouchableOpacity
                        key={index}
                        style={{
                          paddingVertical: 3,
                          backgroundColor: index === selectedMonth - 1 ? "#000000" : "#FFFFFF"
                        }}
                        onPress={() => {
                          setSelectedMonth(index + 1);
                          setShowMonthDropdown(false);
                        }}
                      >
                        <Text style={{ color: index === selectedMonth - 1 ? "#FFFFFF" : "#858585", fontSize: 12 }}>{t(item)}</Text>
                      </TouchableOpacity>
                    }
                  })
                }
              </ScrollView>
            </Menu>
          </View>
        </View> */}
        <TouchableOpacity onPress={() => props.navigation.navigate("Calendar",{activeMonth:selectedMonth})}>
          <TitleText
            text={t("Memories")}
            fontSize={18}
            lineHeight={26}
            color="#B375F6"
            marginRight={4}
          />
        </TouchableOpacity>
      </View>
      <View style={{ width: windowWidth, paddingHorizontal: 20, marginTop: 9 }}>
        <FlatList
          style={{ zIndex: 0 }}
          horizontal={true}
          ref={scrollRef}
          onScrollToIndexFailed={info => {

          }}
          onContentSizeChange={() => {
            if (monthDate.length > 0 && monthDate.length > selectedDay - 4)
              scrollRef.current?.scrollToIndex({ animated: true, index: Math.max(selectedDay - 4, 0) });
          }}
          showsHorizontalScrollIndicator={false}
          data={monthDate}
          keyExtractor={(item) => item.date + item.day}
          renderItem={({ item }) => (
            <View style={{ flexDirection: "column", alignItems: "center", zIndex: 0, width: (windowWidth - 40) / 7 }}>
              <Text style={{ fontWeight: "500", fontSize: 12, lineHeight: 20, color: "#A8A8A8", zIndex: 0 }}>{t(item.day)}</Text>
              <TouchableOpacity style={{ marginTop: item.date === selectedDay ? 0 : 1, zIndex: 0 }} onPress={() => onClickDouble(item.date)}>
                <LinearGradient
                  style={{ width: 29, height: 29, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", zIndex: 0 }}
                  colors={item.date === selectedDay ? ['#D596F5', '#8A31F6'] : ['#FFFFFF', '#FFFFFF']}
                >
                  <Text style={{ fontWeight: "500", fontSize: 16, lineHeight: 16, color: item.date === selectedDay ? '#FFFFFF' : '#000000' }}>{item.date}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      <FriendStories
        props={props}
        screenName="Feed"
        selectedDay={selectedDay}
        selectedMonth={selectedMonth}
        setSelectedDay={(day) => setSelectedDay(day)}
        setSelectedMonth={(month) => setSelectedMonth(month)}
        isFirst={isFirst}
        forceRefreshDay={forceRefreshDay}
        targetRecordId={targetRecord?.id}
      />
    </View>
  );
};
