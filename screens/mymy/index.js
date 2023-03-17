/**
 * Notification Services
 * @format
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import PushNotification from 'react-native-push-notification';
import { useDispatch } from 'react-redux';
import { setRedirect } from '../../store/actions';

// Request notification permission to enable the notfication services for app.

export const NotificationServices = () => {
  const dispatch = useDispatch();
  const requestNotificationPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    enabled && getNotificationToken();
  };

  // Request notification token to enable the notfication services for app.
  const getNotificationToken = async () => {
    let fcmtoken = await AsyncStorage.getItem('fcmtoken');
    if (!fcmtoken) {
      try {
        let fcmtoken = await messaging().getToken();
        if (fcmtoken) {
          await AsyncStorage.setItem('fcmtoken', fcmtoken);
        }
      } catch (error) { }
    }
  };

  // Request notification listeners.
  const notificationListener = () => {
    messaging().onMessage(async remoteMessage => {
      PushNotification.cancelAllLocalNotifications();
      PushNotification.localNotification({
        channelId: 'notification-channel',
        channelName: 'notification',
        title: remoteMessage.notification.title,
        message: remoteMessage.notification?.body,
      });
      dispatch(setRedirect(remoteMessage.data));
    });
  };
  useEffect(() => {
    if (Platform.OS == 'android') {
      PushNotification.createChannel(
        {
          channelId: 'notification-channel',
          channelName: 'notification',
        },
        created => console.log(`createChannel returned '${created}'`),
      );
      requestNotificationPermission();
      notificationListener();
    }
  }, []);

  return <View />;
};
