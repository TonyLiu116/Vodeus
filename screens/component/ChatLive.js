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
import { ChatRoomItem } from './ChatRoomItem';

export const ChatLive = ({
  props,
  initChatRoomId,
}) => {

  const mounted = useRef(false);

  const { t, i18n } = useTranslation();

  const [categoryId, setCategoryId] = useState(0);
  const [chatRooms, setChatRooms] = useState([]);

  let { user, socketInstance } = useSelector((state) => {
    return (
      state.user
    )
  });

  const roomItems = useMemo(() => {
    return <ScrollView style={{
      marginBottom: 90,
    }}>
      {chatRooms.map((item, index) => {
        return <ChatRoomItem
          key={index + 'ChatRoomItem'}
          props={props}
          info={item}
          itemIndex={index}
          onEnterRoom={() => {
              props.navigation.navigate("LiveChat", { info: item })
          }}
        />
      })}
      <View style={{ height: 80 }}></View>
    </ScrollView>
  }, [chatRooms])

  const onShareLink = () => {
    Share.open({
      url: `https://www.gethilal.co`,
      message: t("Connect with Allah and other believers from Indonesia on Hilal app. It's free! www.lknk.com")
    }).then(res => {

    })
      .catch(err => {
        console.log("err");
      });;
  }

  useEffect(() => {
    if (initChatRoomId) {
      let index = chatRooms.findIndex(el => el.hostUser.id == initChatRoomId);
      if (index != -1) {
        props.navigation.navigate("LiveChat", { info: chatRooms[index] })
      }
    }
  }, [initChatRoomId])

  useEffect(() => {
    mounted.current = true;
    socketInstance.emit("getChatRooms", ({ rooms }) => {
      setChatRooms(rooms);
      if (initChatRoomId) {
        let index = chatRooms.findIndex(el => el.hostUser.id == initChatRoomId);
        if (index != -1) {
          props.navigation.navigate("LiveChat", { info: chatRooms[index] })
        }
      }
    })
    socketInstance.on("createChatRoom", ({ info }) => {
      setChatRooms((prev) => {
        let index = prev.findIndex(el => (el.hostUser.id == info.hostUser.id ));
        if (index != -1)
          prev.splice(index, 1);
        prev.unshift(info);
        return [...prev];
      });
    });
    // socketInstance.on("exitChatRoom", ({ roomId, userId }) => {
    //   setChatRooms((prev) => {
    //     let index = prev.findIndex(el => (el.roomId == roomId));
    //     if (index != -1) {
    //       let p_index = prev[index].users.findIndex(el => (el.id == userId))
    //       if (p_index != -1) {
    //         prev[index].users.splice(p_index, 1);
    //       }
    //     }
    //     return [...prev];
    //   });
    // });
    // socketInstance.on("enterChatRoom", ({ roomId, userInfo }) => {
    //   console.log("enterChatRoom:", roomId);
    //   setChatRooms((prev) => {
    //     let index = prev.findIndex(el => (el.roomId == roomId));
    //     if (index != -1) {
    //       let p_index = prev[index].users.findIndex(el => el.id == userInfo.id);
    //       if (p_index == -1) {
    //         prev[index].users.push(userInfo);
    //       }
    //     }
    //     return [...prev];
    //   });
    // });
    socketInstance.on("deleteChatRoom", ({ roomId }) => {
      setChatRooms((prev) => {
        let index = prev.findIndex(el => el.hostUser.id == roomId);
        if (index != -1) {
          prev.splice(index, 1);
        }
        return [...prev];
      });
    });
    return () => {
      mounted.current = false;
      socketInstance.off("deleteChatRoom");
      socketInstance.off("enterChatRoom");
      socketInstance.off("exitChatRoom");
      socketInstance.off("createChatRoom");
    };
  }, []);

  return (
    <View
      style={{
        backgroundColor: '#FFF',
        width: windowWidth,
        flex: 1,
      }}
    >
      {roomItems}
    </View>
  );
};
