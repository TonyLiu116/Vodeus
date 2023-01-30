import { Platform, Dimensions } from 'react-native';
export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;

//export const API_URL = 'https://api.vocco.ai';
export const API_URL = 'https://test.vocco.ai';
//export const API_URL = 'http://10.0.2.2:80';
// export const SOCKET_URL = 'https://realservice-kqnrsfqveq-od.a.run.app';
//export const SOCKET_URL = 'https://sok.vocco.ai';
export const SOCKET_URL = 'https://tsok.vocco.ai';
export const ACCESSTOKEN_KEY = "@VoccoAT:2021";
export const REFRESHTOKEN_KEY = "@VoccoRT:2021";
export const TUTORIAL_CHECK = "tutorial";
export const POST_CHECK = "firstpost";
export const SHARE_CHECK = "firstshare";
export const DEVICE_TOKEN = "devicetoken";
export const APP_NAV = "appnav";
export const DEVICE_OS = "deviceos";
export const MAIN_LANGUAGE = "main_language";
export const RECENT_LIST = "recent_list";
export const OPEN_COUNT = "openCount";
export const TODAY = "today";

export const Categories = 
[
    {
        label:'',
        uri:require('../assets/categories/all.png')
    },
    {
        label:'Prayers',
        uri:require('../assets/categories/prayer.png')
    },
    {
        label:'Stories',
        uri:require('../assets/categories/story.png')
    },
    {
        label:'Support',
        uri:require('../assets/categories/support.png')
    },
    
]

export const Ambiances = [
    {
        label: 'Fun',
        uri: require('../assets/categories/fun.png')
    },
    {
        label: 'Horror',
        uri: require('../assets/categories/horror.png')
    },
    {
        label: 'Fire',
        uri: require('../assets/categories/fire.png')
    },
    {
        label: 'Rain',
        uri: require('../assets/categories/rain.png')
    }
]

export const Avatars = [
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-0.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-1.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-2.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-3.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-4.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-5.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-6.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-7.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-8.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-9.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-10.png')
    },
    {
        label:'',
        uri:require('../assets/phoneNumber/avatar-11.png')
    },
]

export const Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const Months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]