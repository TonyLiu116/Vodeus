import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image, ScrollView, TouchableOpacity, View
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSelector } from 'react-redux';

import { Categories, windowWidth } from '../../config/config';
import '../../language/i18n';
import { styles } from '../style/Common';
import { DescriptionText } from './DescriptionText';
import { SemiBoldText } from './SemiBoldText';

import { TextInput } from 'react-native-gesture-handler';
import searchSvg from '../../assets/login/search.svg';
import { BirdRoom } from './BirdRoom';
import { BirdRoomItem } from './BirdRoomItem';
import { CreateRoom } from './CreateRoom';
import { MyButton } from './MyButton';

export const Live = ({
  props,
  initRoomId,
}) => {

  const mounted = useRef(false);

  const { t, i18n } = useTranslation();

  const [searchLabel, setSearchLabel] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [currentRoomInfoId, setCurrentRoomInfoId] = useState(-1);
  const [rooms, setRooms] = useState([]);

  const rId = useRef(-1);

  let { user, socketInstance } = useSelector((state) => {
    return (
      state.user
    )
  });

  const onSearchLabel = (e) => {
    setSearchLabel(e);
  }

  const roomItems = useMemo(() => {
    return <ScrollView style={{
      marginBottom: 90
    }}>
      {rooms.map((item, index) => {
        if (!item.title.toLowerCase().includes(searchLabel.toLocaleLowerCase()) || (categoryId && categoryId != item.categoryId))
          return null;
        return <BirdRoomItem
          key={index + 'BirdRoomItem'}
          props={props}
          info={item}
          onEnterRoom={() => {
            setCurrentRoomInfoId(index);
            rId.current = index;
          }}
        />
      })}
      <View style={{ height: 80 }}></View>
    </ScrollView>
  }, [rooms, searchLabel, categoryId])

  const onCreateRoom = async (title, id) => {
    setShowModal(false);
    const createRoomInfo = {
      hostUser: user,
      roomId: null,
      title,
      categoryId: id,
      participants: []
    };
    setRooms(prev => {
      prev.unshift(createRoomInfo);
      return [...prev];
    })
    setCurrentRoomInfoId(0);
    rId.current = 0;
  }

  useEffect(() => {
    if (initRoomId && rId.current == -1) {
      let index = rooms.findIndex(el => el.roomId == initRoomId);
      if (index != -1) {
        setCurrentRoomInfoId(index);
        rId.current = index;
      }
    }
  }, [initRoomId])

  useEffect(() => {
    mounted.current = true;
    socketInstance.emit("getBirdRooms", (rooms) => {
      if (mounted.current) {
        setRooms(rooms);
        if (initRoomId) {
          let index = rooms.findIndex(el => el.roomId == initRoomId);
          if (index != -1)
            setCurrentRoomInfoId(index);
          rId.current = index;
        }
      }
    })
    socketInstance.on("createBirdRoom", ({ info }) => {
      setRooms((prev) => {
        let index = prev.findIndex(el => (el.hostUser.id == info.hostUser.id && el.roomId == null));
        if (index != -1)
          prev.splice(index, 1);
        prev.unshift(info);
        return [...prev];
      });
      if (info.hostUser.id == user.id) {
        setCurrentRoomInfoId(0);
        rId.current = 0;
      }
      else if (rId.current != -1) {
        rId.current++;
        setCurrentRoomInfoId(rId.current);
      }
    });
    socketInstance.on("deleteBirdRoom", ({ info }) => {
      let index;
      setRooms((prev) => {
        index = prev.findIndex(el => (el.roomId == info.roomId));
        if (index != -1) {
          prev.splice(index, 1);
        }
        return [...prev];
      });
      if (index != -1 && rId.current != -1) {
        if (index == rId.current) rId.current = -1;
        if (index < rId.current) rId.current--;
        setCurrentRoomInfoId(rId.current)
      }
    });
    socketInstance.on("enterBirdRoom", ({ info }) => {
      let index = -1;
      setRooms((prev) => {
        index = prev.findIndex(el => (el.roomId == info.roomId));
        if (index != -1) {
          let p_index = prev[index].participants.findIndex(el => el.participantId == info.participantId);
          if (p_index == -1) {
            prev[index].participants.push(info);
          }
        }
        return [...prev];
      });
    });
    socketInstance.on("exitBirdRoom", ({ info }) => {
      setRooms((prev) => {
        let index = prev.findIndex(el => (el.roomId == info.roomId));
        if (index != -1) {
          let p_index = prev[index].participants.findIndex(el => (el.participantId == info.participantId))
          if (p_index != -1) {
            prev[index].participants.splice(p_index, 1);
          }
        }
        return [...prev];
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
        backgroundColor: '#FAFAFA',
        borderRadius: 24,
        height: 48,
        width: windowWidth - 36,
        paddingHorizontal: 12,
        marginTop: 2,
        marginBottom: 16,
        marginLeft: 18
      }}>
        <SvgXml
          width="20"
          height="20"
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
          marginTop: 10,
          maxHeight: 50,
          minHeight: 50
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
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
      {roomItems}
      <View style={{
        position: 'absolute',
        width: windowWidth,
        bottom: 105,
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
      {currentRoomInfoId != -1 && rooms.length > 0 && <BirdRoom
        props={props}
        roomInfo={rooms[currentRoomInfoId]}
        onCloseModal={() => {
          if (!rooms[currentRoomInfoId].roomId) {
            setRooms(prev => {
              prev.splice(currentRoomInfoId, 1);
              return [...prev];
            })
          }
          setCurrentRoomInfoId(-1);
          rId.current = -1;
        }}
      />}
    </View>
  );
};
