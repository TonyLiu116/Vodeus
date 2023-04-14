import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

import { FIRST_ROOM, windowWidth } from '../../config/config';
import '../../language/i18n';
import { SemiBoldText } from './SemiBoldText';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share';
import { BirdRoom } from './BirdRoom';
import { BirdRoomItem } from './BirdRoomItem';
import { CreateRoom } from './CreateRoom';
import { MyButton } from './MyButton';
import { WelcomeBirdRoom } from './WelcomeBirdRoom';
import LinearGradient from 'react-native-linear-gradient';
import circlePlusSvg from '../../assets/Feed/circle_plus.svg';
import { SvgXml } from 'react-native-svg';

export const Live = ({
  props,
  initRoomId,
}) => {

  const mounted = useRef(false);

  const { t, i18n } = useTranslation();

  const [searchLabel, setSearchLabel] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [currentRoomInfo, setCurrentRoomInfo] = useState(null);
  const [rooms, setRooms] = useState([]);

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
      marginBottom: 90,
    }}>
      {rooms.map((item, index) => {
        if (!item.title.toLowerCase().includes(searchLabel.toLocaleLowerCase()) || (categoryId && categoryId != item.categoryId))
          return null;
        return <BirdRoomItem
          key={index + 'BirdRoomItem'}
          props={props}
          info={item}
          itemIndex={index}
          onEnterRoom={() => {
            if (item.participants.length < 10)
              props.navigation.navigate("VoiceChat", { info: item })
          }}
        />
      })}
      <View style={{ height: 80 }}></View>
    </ScrollView>
  }, [rooms, searchLabel, categoryId])

  const onCreateRoom = async (title) => {
    setShowModal(false);
    const createRoomInfo = {
      hostUser: {
        id: user.id,
        name: user.name,
        avatarNumber: user.avatarNumber,
        avatar: user.avatar
      },
      roomId: null,
      title,
      categoryId: 0,
      participants: []
    };
    setRooms(prev => {
      prev.unshift(createRoomInfo);
      return [...prev];
    })
    props.navigation.navigate('VoiceChat',{info:createRoomInfo});
  }

  const checkFirstRoom = async () => {
    let isFirstRoom = await AsyncStorage.getItem(FIRST_ROOM);
    if (isFirstRoom == null) {
      setShowAlert(true);
    }
  }

  const onShareLink = () => {
    Share.open({
      url: `https://www.vodeus.co`,
      message: t("Connect with God and other Christians from Brazil on Vodeus app. It's free! www.vodeus.co")
    }).then(res => {

    })
      .catch(err => {
        console.log("err");
      });;
  }

  useEffect(() => {
    if (initRoomId && !currentRoomInfo) {
      let index = rooms.findIndex(el => el.roomId == initRoomId);
      if (index != -1) {
        props.navigation.navigate("VoiceChat", { info: rooms[index] })
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
          if (index != -1) {
            props.navigation.navigate("VoiceChat", { info: rooms[index] })
          }
        }
      }
    })
    socketInstance.on("createBirdRoom", ({ info }) => {
      setRooms((prev) => {
        let index = prev.findIndex(el => (el.hostUser.id == info.hostUser.id && el.roomId == info.roomId));
        if (index != -1)
          prev.splice(index, 1);
        prev.unshift(info);
        return [...prev];
      });
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
    //checkFirstRoom();
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
      {roomItems}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
      >
        <LinearGradient
          style={
            {
              position: 'absolute',
              right: 15,
              bottom: 95,
              width: 54,
              height: 54,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }
          }
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          locations={[0, 1]}
          colors={['#0B8174', '#084B49']}
        >
          <SvgXml
            xml={circlePlusSvg}
          />
        </LinearGradient>
      </TouchableOpacity>
      {showModal && <CreateRoom
        props={props}
        onCreateRoom={onCreateRoom}
        onCloseModal={() => setShowModal(false)}
      />}
      {/* {currentRoomInfo && rooms.length > 0 && <BirdRoom
        props={props}
        roomInfo={currentRoomInfo}
        onCloseModal={() => {
          if (!currentRoomInfo.roomId) {
            setRooms(prev => {
              let index = prev.findIndex(el => el.roomId == null)
              if (index != -1)
                prev.splice(index, 1);
              return [...prev];
            })
          }
          setCurrentRoomInfo(null);
        }}
      />} */}
      {showAlert && <WelcomeBirdRoom
        onCloseModal={async () => {
          setShowAlert(false);
          await AsyncStorage.setItem(
            FIRST_ROOM,
            "1"
          );
        }}
      />}
    </View>
  );
};
