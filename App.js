import 'react-native-gesture-handler';
import * as React from 'react';
import { AppRegistry, Platform } from "react-native";
import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from 'react-navigation'
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import SplashScreen from 'react-native-splash-screen'
import WelcomeScreen from './screens/mymy/WelcomeScreen';
import UsernameScreen from './screens/mymy/UsernameScreen';
import BirthdayScreen from './screens/mymy/BirthdayScreen';
import IdentifyScreen from './screens/mymy/IdentifyScreen';
import CountryScreen from './screens/mymy/CountryScreen';
import PhotoScreen from './screens/mymy/PhotoScreen';
import LogoScreen from './screens/mymy/LogoScreen';
import ProfileScreen from './screens/Profile/ProfileScreen';
import VoiceProfileScreen from './screens/Profile/VoiceProfileScreen';
import ShareScreen from './screens/mymy/ShareScreen';
import PremiumScreen from './screens/mymy/PremiumScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEVICE_TOKEN, DEVICE_OS } from './config/config';
import NavigationService from './services/NavigationService';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
} from 'react-native-audio-recorder-player';

import { recorderPlayer } from './screens/Home/AudioRecorderPlayer';
import RNFetchBlob from 'rn-fetch-blob';

//Setting

import SettingScreen from './screens/Setting/SettingScreen';
import EditProfileScreen from './screens/Setting/EditProfileScreen';
import ChangeEmailScreen from './screens/Setting/ChangeEmailScreen';

//Tutorial
import TutorialScreen from './screens/Tutorial/TutorialScreen';

//Discover
import SearchScreen from './screens/Discover/SearchScreen';

//Feed

//Record
import PostingVoiceScreen from './screens/Record/PostingVoiceScreen';

import ChangePasswordScreen from './screens/Setting/ChangePasswordScreen';
import ShareFriendScreen from './screens/Setting/ShareFriendScreen';
import ContactScreen from './screens/Setting/ContactScreen';
import NotificationScreen from './screens/Notification/NotificationScreen';
import UserProfileScreen from './screens/UserProfile/UserProfileScreen';
import UserProfileListScreen from './screens/UserProfile/UserProfileListScreen';
import RecordPrepareScreen from './screens/Record/RecordPrepareScreen';
import RecordBoardScreen from './screens/Record/RecordBoardScreen';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Provider } from 'react-redux';

import configureStore from './store/configureStore';
import PostingAnswerVoiceScreen from './screens/Record/PostingAnswerVoiceScreen';
import HomeScreen from './screens/Home/HomeScreen';
import ChatScreen from './screens/Chat/ChatScreen';
import FriendsScreen from './screens/Friends/FriendsScreen';
import ConversationScreen from './screens/Chat/ConversationScreen';
import PhoneRegisterScreen from './screens/PhoneNumberLogin/PhoneRegisterScreen';
import ProfilePictureScreen from './screens/PhoneNumberLogin/ProfilePictureScreen';
import MainNameScreen from './screens/PhoneNumberLogin/MainNameScreen';
import PhoneVerifyScreen from './screens/PhoneNumberLogin/PhoneVerifyScreen';
import PickNameScreen from './screens/PhoneNumberLogin/PickNameScreen';
import InputBirthdayScreen from './screens/PhoneNumberLogin/InputBirthdayScreen';
import SelectIdentifyScreen from './screens/PhoneNumberLogin/SelectIdentifyScreen';
import PhoneLoginScreen from './screens/PhoneNumberLogin/PhoneLoginScreen';
import UpdatePictureScreen from './screens/PhoneNumberLogin/UpdatePictureScreen';
import SelectTopicScreen from './screens/PhoneNumberLogin/SelectTopicScreen';
import AddFriendScreen from './screens/PhoneNumberLogin/AddFriendScreen';
import ShareStoryScreen from './screens/mymy/ShareStoryScreen';
import HoldRecordScreen from './screens/Record/HoldRecordScreen';
// import { NotificationServices } from './screens/mymy';
import CalendarScreen from './screens/Home/CalendarScreen';


const slideAnimation2 = (bottomToTop) => {
  const multiplier = bottomToTop ? -1 : 1;
  return ({ current, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [multiplier * layouts.screen.height, 0],
            }),
          },
        ],
      },
    };
  };
};

const store = configureStore()

const AppNavigator = createStackNavigator({
  Logo: {
    screen: LogoScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Welcome: {
    screen: WelcomeScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Username: {
    screen: UsernameScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Birthday: {
    screen: BirthdayScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Identify: {
    screen: IdentifyScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Country: {
    screen: CountryScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Photo: {
    screen: PhotoScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },

  //Tutorial
  Tutorial: {
    screen: TutorialScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },

  Search: {
    screen: SearchScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },

  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },

  PostingVoice: {
    screen: PostingVoiceScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  RecordPrepare: {
    screen: RecordPrepareScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false,
    }
  },
  RecordBoard: {
    screen: RecordBoardScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Profile: {
    screen: ProfileScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  UserProfile: {
    screen: UserProfileScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  UserProfileList: {
    screen: UserProfileListScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  VoiceProfile: {
    screen: VoiceProfileScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Setting: {
    screen: SettingScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  EditProfile: {
    screen: EditProfileScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  ChangeEmail: {
    screen: ChangeEmailScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  ChangePassword: {
    screen: ChangePasswordScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  ShareFriend: {
    screen: ShareFriendScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Contact: {
    screen: ContactScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Notification: {
    screen: NotificationScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  PostingAnswerVoice: {
    screen: PostingAnswerVoiceScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  HoldRecord: {
    screen: HoldRecordScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  ShareStory: {
    screen: ShareStoryScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Share: {
    screen: ShareScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Premium: {
    screen: PremiumScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Chat: {
    screen: ChatScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Friends: {
    screen: FriendsScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Conversation: {
    screen: ConversationScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  PhoneRegister: {
    screen: PhoneRegisterScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  ProfilePicture: {
    screen: ProfilePictureScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  MainName: {
    screen: MainNameScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  PhoneVerify: {
    screen: PhoneVerifyScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  PickName: {
    screen: PickNameScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  InputBirthday: {
    screen: InputBirthdayScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  SelectIdentify: {
    screen: SelectIdentifyScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  PhoneLogin: {
    screen: PhoneLoginScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  UpdatePicture: {
    screen: UpdatePictureScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  SelectTopic: {
    screen: SelectTopicScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  AddFriend: {
    screen: AddFriendScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  Calendar: {
    screen: CalendarScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
},
  {
    //initialRouteName:'AddFriend'
  }
);

const AppContainer = createAppContainer(AppNavigator);

const OnSetPushNotification = () => {
  PushNotification.requestPermissions();
  PushNotification.configure({
    onRegister: async ({ token, os }) => {
      await AsyncStorage.setItem(
        DEVICE_TOKEN,
        token
      );
      await AsyncStorage.setItem(
        DEVICE_OS,
        os
      );
    },

    onNotification: async (notification) => {
      // if(notification.userInteraction){
      //   await AsyncStorage.setItem(
      //     APP_NAV,
      //     'stop'
      //   );
      //   NavigationService.navigate(notification.data.nav,notification.data.params);
      // }
      if (notification.userInteraction)
          NavigationService.navigate(notification.data.nav, notification.data.params);
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    }

  });
}

const OnIosPermission = async () => {
  const dirs = RNFetchBlob.fs.dirs;
  const path = Platform.select({
    ios: `hello.m4a`,
    android: `${dirs.CacheDir}/hello.mp3`,
  });
  const audioSet = {
    AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    AudioSourceAndroid: AudioSourceAndroidType.MIC,
    AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
    AVNumberOfChannelsKeyIOS: 2,
    AVFormatIDKeyIOS: AVEncodingOption.aac,
  };
  await recorderPlayer.startRecorder(path, audioSet).then(async res => {
    await recorderPlayer.stopRecorder().then(res => {
    })
      .catch(err => {
        console.log(err);
      });
  })
    .catch(err => {
      console.log(err);
    });
}

export default App = () => {
  useEffect(() => {
    SplashScreen.hide();
    //OnSetPushNotification();
    OnIosPermission();
  }, []);
  return (
    <Provider store={store}>
      <AppContainer
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
      {/* <NotificationServices /> */}
    </Provider>
  );
};

// AppRegistry.registerComponent("Vocco", () => App);"Vocco"