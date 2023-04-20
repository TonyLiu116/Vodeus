import * as React from 'react';
import 'react-native-gesture-handler';
import SplashScreen from 'react-native-splash-screen';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from "react-navigation-stack";
import ProfileScreen from './screens/Profile/ProfileScreen';
import VoiceProfileScreen from './screens/Profile/VoiceProfileScreen';
import LogoScreen from './screens/mymy/LogoScreen';
import PremiumScreen from './screens/mymy/PremiumScreen';
import ShareScreen from './screens/mymy/ShareScreen';
import WelcomeScreen from './screens/mymy/WelcomeScreen';
import NavigationService from './services/NavigationService';


//Setting

import ChangeEmailScreen from './screens/Setting/ChangeEmailScreen';
import EditProfileScreen from './screens/Setting/EditProfileScreen';
import SettingScreen from './screens/Setting/SettingScreen';

//Tutorial

//Discover
import SearchScreen from './screens/Discover/SearchScreen';

//Feed

//Record
import PostingVoiceScreen from './screens/Record/PostingVoiceScreen';

import NotificationScreen from './screens/Notification/NotificationScreen';
import RecordBoardScreen from './screens/Record/RecordBoardScreen';
import RecordPrepareScreen from './screens/Record/RecordPrepareScreen';
import ChangePasswordScreen from './screens/Setting/ChangePasswordScreen';
import ContactScreen from './screens/Setting/ContactScreen';
import ShareFriendScreen from './screens/Setting/ShareFriendScreen';
import UserProfileListScreen from './screens/UserProfile/UserProfileListScreen';
import UserProfileScreen from './screens/UserProfile/UserProfileScreen';

import { useEffect } from 'react';
import { Provider } from 'react-redux';

import ChatScreen from './screens/Chat/ChatScreen';
import ConversationScreen from './screens/Chat/ConversationScreen';
import FriendsScreen from './screens/Friends/FriendsScreen';
import CalendarScreen from './screens/Home/CalendarScreen';
import HomeScreen from './screens/Home/HomeScreen';
import PostingMultiScreen from './screens/Home/PostingMultiScreen';
import AddFriendScreen from './screens/PhoneNumberLogin/AddFriendScreen';
import InputBirthdayScreen from './screens/PhoneNumberLogin/InputBirthdayScreen';
import MainNameScreen from './screens/PhoneNumberLogin/MainNameScreen';
import PhoneLoginScreen from './screens/PhoneNumberLogin/PhoneLoginScreen';
import PhoneRegisterScreen from './screens/PhoneNumberLogin/PhoneRegisterScreen';
import PhoneVerifyScreen from './screens/PhoneNumberLogin/PhoneVerifyScreen';
import PickNameScreen from './screens/PhoneNumberLogin/PickNameScreen';
import ProfilePictureScreen from './screens/PhoneNumberLogin/ProfilePictureScreen';
import SelectIdentifyScreen from './screens/PhoneNumberLogin/SelectIdentifyScreen';
import SelectTopicScreen from './screens/PhoneNumberLogin/SelectTopicScreen';
import UpdatePictureScreen from './screens/PhoneNumberLogin/UpdatePictureScreen';
import WelcomeAudioScreen from './screens/PhoneNumberLogin/WelcomeAudioScreen';
import WelcomeVoidenScreen from './screens/PhoneNumberLogin/WelcomeVoidenScreen';
import WrittenPostScreen from './screens/PhoneNumberLogin/WrittenPostScreen';
import HoldRecordScreen from './screens/Record/HoldRecordScreen';
import PostingAnswerVoiceScreen from './screens/Record/PostingAnswerVoiceScreen';
import { NotificationServices } from './screens/mymy';
import ShareStoryScreen from './screens/mymy/ShareStoryScreen';
import configureStore from './store/configureStore';
import LiveChatScreen from './screens/Chat/LiveChatScreen';
import VoiceChatScreen from './screens/Chat/VoiceChatScreen';
import AccountScreen from './screens/Setting/AccountScreen';

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
  

  //Tutorial

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
  Account: {
    screen: AccountScreen,
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
  LiveChat: {
    screen: LiveChatScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  VoiceChat: {
    screen: VoiceChatScreen,
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
  WelcomeVoiden: {
    screen: WelcomeVoidenScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  WelcomeAudio: {
    screen: WelcomeAudioScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  WrittenPost: {
    screen: WrittenPostScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
  PostingMulti: {
    screen: PostingMultiScreen,
    navigationOptions: {
      headerShown: false,
      animationEnabled: false
    }
  },
},
  {
    //initialRouteName:'PostingMulti'
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <Provider store={store}>
      <NotificationServices />
      <AppContainer
        ref={navigatorRef => {
          NavigationService.setTopLevelNavigator(navigatorRef);
        }}
      />
    </Provider>
  );
};

// AppRegistry.registerComponent("Vocco", () => App);"Vocco"