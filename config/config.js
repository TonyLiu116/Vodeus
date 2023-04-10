import { Platform, Dimensions } from 'react-native';
export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;

export const API_URL = 'https://api.vocco.ai';
//export const API_URL = 'https://test.vocco.ai';
//export const API_URL = 'http://10.0.2.2:80';
export const SOCKET_URL = 'https://sok.vocco.ai';
//export const SOCKET_URL = 'https://tsok.vocco.ai';
export const BIRD_ID = '481C367B-5F77-4A43-A555-8E993E405B2B';
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
export const FIRST_ROOM = "firstRoom";
export const TODAY = "today";

export const Categories =
    [
        {
            label: '',
            uri: require('../assets/categories/all.png')
        },
        {
            label: 'Prayers',
            uri: require('../assets/categories/prayer.png')
        },
        {
            label: 'Stories',
            uri: require('../assets/categories/story.png')
        },
        {
            label: 'Support',
            uri: require('../assets/categories/support.png')
        },

    ]

export const Avatars = [
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-0.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-1.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-2.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-3.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-4.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-5.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-6.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-7.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-8.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-9.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-10.png')
    },
    {
        label: '',
        uri: require('../assets/phoneNumber/avatar-11.png')
    },
]

export const Days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const Scores = [
    {
        levelName: 'iron',
        targetScore: 20,
        uri: require('../assets/common/medals/iron.png')
    },
    {
        levelName: 'bronze',
        targetScore: 100,
        uri: require('../assets/common/medals/bronze.png')
    },
    {
        levelName: 'silver',
        targetScore: 500,
        uri: require('../assets/common/medals/silver.png')
    },
    {
        levelName: 'gold',
        targetScore: 1000,
        uri: require('../assets/common/medals/gold.png')
    },
    {
        levelName: 'platinum',
        targetScore: 10000,
        uri: require('../assets/common/medals/platinum.png')
    },
    {
        levelName: 'diamond',
        targetScore: 100000,
        uri: require('../assets/common/medals/diamond.png')
    },
]

export const calcLevel = (v) => {
    if (v < 20) return 0;
    if (v < 100) return 1;
    if (v < 500) return 2;
    if (v < 1000) return 3;
    if (v < 10000) return 4;
    return 5;
}