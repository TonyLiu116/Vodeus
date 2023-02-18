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
import searchSvg from '../../assets/login/search.svg';
import { TextInput } from 'react-native-gesture-handler';
import { MyButton } from './MyButton';
import { CreateRoom } from './CreateRoom';
import { SendbirdCalls } from '@sendbird/calls-react-native';
import { BirdRoom } from './BirdRoom';
import { BirdRoomItem } from './BirdRoomItem';

export const Live = ({
  props,
}) => {

  const mounted = useRef(false);

  const { t, i18n } = useTranslation();

  const [searchLabel, setSearchLabel] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [currentRoomIndex, setCurrentRoomIndex] = useState(-1);
  const [rooms, setRooms] = useState([]);

  let { user, socketInstance } = useSelector((state) => {
    return (
      state.user
    )
  });

  const dispatch = useDispatch();

  const scrollRef = useRef();
  const viewAbilityConfig = {
    itemVisiblePercentThreshold: 40,
    waitForInteraction: true,
  };
  const onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
    if (changed && changed.length > 0) {
    }
  });
  const viewAbilityConfigCallbackPairs = useRef([{ viewAbilityConfig: viewAbilityConfig, onViewableItemsChanged }]);

  const onSearchLabel = (e) => {

  }

  const roomItems = useMemo(() => {
    return <FlatList
      style={{ width: windowWidth }}
      ref={scrollRef}
      data={rooms}
      onScroll={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent)) {
        }
      }}
      viewabilityConfigCallbackPairs={viewAbilityConfigCallbackPairs.current}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50
      }}
      renderItem={({ item, index }) => {
        if(item.participants.length == 0 ) return null;
        return <BirdRoomItem
          key={index + 'BirdRoomItem'}
          props={props}
          info={item}
          onEnterRoom={() => onEnterRoom(item, index)}
        />
      }}
      keyExtractor={(item, index) => index.toString()}
    />
  }, [rooms])

  const onEnterRoom = async (roomInfo, index) => {
    const room = await SendbirdCalls.fetchRoomById(roomInfo.roomId);
    const enterParams = {
      audioEnabled: true,
      videoEnabled: false,
    }
    await room.enter(enterParams).then(res => {
      setCurrentRoomIndex(index);
    });
  }

  const onCreateRoom = async (title, id) => {
    setShowModal(false);
    const room = await SendbirdCalls.createRoom({
      roomType: SendbirdCalls.RoomType.LARGE_ROOM_FOR_AUDIO_ONLY
    });
    const enterParams = {
      audioEnabled: true,
      videoEnabled: false,
    }
    await room.enter(enterParams);
    socketInstance.emit("createRoom", {
      info: {
        hostUser: user,
        roomId: room.roomId,
        title,
        categoryId: id,
        participants: []
      }
    });
  }

  useEffect(() => {
    mounted.current = true;
    socketInstance.emit("getBirdRooms", (rooms) => {
      if (mounted.current)
        setRooms(rooms);
    })
    socketInstance.on("createBirdRoom", ({ info }) => {
      setRooms((prev) => {
        prev.unshift(info);
        return [...prev];
      });
      if (info.hostUser.id == user.id)
        setCurrentRoomIndex(0);
    });
    socketInstance.on("enterBirdRoom", ({ info }) => {
      setRooms((prev) => {
        let index = prev.findIndex(el => (el.roomId == info.roomId));
        if (index != -1) {
          prev[index].participants.push(info);
          return [...prev];
        }
        return prev;
      });
    });
    socketInstance.on("exitBirdRoom", ({ info }) => {
      setRooms((prev) => {
        let index = prev.findIndex(el => (el.roomId == info.roomId));
        if (index != -1) {
          let p_index = prev[index].participants.findIndex(el=>(el.participantId == info.participantId))
          prev[index].participants.splice(p_index,1);
          return [...prev];
        }
        return prev;
      });
    });
    return () => {
      mounted.current = false;
      socketInstance.off('createBirdRoom');
      socketInstance.off('enterBirdRoom');
      socketInstance.off('exitBirdRoom');
      socketInstance.off('deleteBirdRoom');
    };
  }, [])

  return (
    <View
      style={{
        backgroundColor: '#FFF',
        width: windowWidth,
        flex: 1,
      }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F0F5',
        borderRadius: 24,
        height: 44,
        width: windowWidth - 24,
        paddingHorizontal: 12,
        marginTop: 2,
        marginBottom: 16,
        marginLeft: 6
      }}>
        <SvgXml
          width="24"
          height="24"
          xml={searchSvg}
        />
        <TextInput
          style={[styles.searchInput, { paddingLeft: 12, width: windowWidth - 92 }]}
          value={searchLabel}
          color='#281E30'
          placeholder={t("Search" + "...")}
          onChangeText={onSearchLabel}
          placeholderTextColor="rgba(59, 31, 82, 0.6)"
        />
      </View>
      <SemiBoldText
        text={t("Happening now")}
        fontSize={18.36}
        lineHeight={24.48}
        color='#000'
        marginLeft={21}
      />
      <DescriptionText
        text={t("Find the room discussion you like the most!")}
        fontSize={11.66}
        lineHeight={24.48}
        color='#B059F8'
        marginLeft={21}
      />
      <ScrollView
        style={{
          maxHeight: 50,
          marginTop: 10
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12
        }}>
          {Categories.map((item, index) => {
            return <TouchableOpacity style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: categoryId == index ? '#8229F4' : '#D4C9DE',
              flexDirection: 'row',
              marginHorizontal: 4
            }}
              onPress={() => setCategoryId(index)}
              key={index.toString() + 'category'}
            >
              <Image source={item.uri}
                style={{
                  width: 20,
                  height: 20
                }}
              />
              <DescriptionText
                text={item.label == '' ? t('All') : item.label == 'Support' ? t('Support/Help') : t(item.label)}
                fontSize={14}
                lineHeight={20}
                marginLeft={10}
              />
            </TouchableOpacity>
          })}
        </View>
      </ScrollView>
      <View style={{
        marginBottom: 90
      }}>
        {roomItems}
      </View>
      <View style={{
        position: 'absolute',
        width: windowWidth,
        bottom: 115,
        alignItems: 'center'
      }}>
        <MyButton
          label={t("Create a live room")}
          onPress={() => setShowModal(true)}
        />
      </View>
      {showModal && <CreateRoom
        props={props}
        onCreateRoom={onCreateRoom}
        onCloseModal={() => setShowModal(false)}
      />}
      {currentRoomIndex >= 0 && rooms.length > 0 && <BirdRoom
        props={props}
        roomInfo={rooms[currentRoomIndex]}
        onCloseModal={() => setCurrentRoomIndex(-1)}
      />}
    </View>
  );
};
