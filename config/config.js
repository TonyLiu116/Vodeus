import { Platform, Dimensions } from 'react-native';
export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;

//export const API_URL = 'https://voccoservice.wl.r.appspot.com';
export const API_URL = 'https://api.vocco.ai';
//export const API_URL = 'http://10.0.2.2:80';
// export const SOCKET_URL = 'https://realservice-kqnrsfqveq-od.a.run.app';
//export const SOCKET_URL = 'http://192.168.111.196:3000';
export const SOCKET_URL = 'https://sok.vocco.ai';
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
        label:'Fun',
        uri:require('../assets/categories/fun.png')
    },
    {
        label:'Education',
        uri:require('../assets/categories/education.png')
    },
    {
        label:'Sexo',
        uri:require('../assets/categories/adult.png')
    },
    {
        label:'Horror',
        uri:require('../assets/categories/horror.png')
    },
    {
        label:'Dreams',
        uri:require('../assets/categories/dreams.png')
    },
    {
        label:'Feminism',
        uri:require('../assets/categories/feminism.png')
    },
    {
        label:'LGBT',
        uri:require('../assets/categories/LGBT.png')
    },
    {
        label:'Studies',
        uri:require('../assets/categories/studies.png')
    },
    {
        label:'Parties',
        uri:require('../assets/categories/parties.png')
    },
    {
        label:'Astrology',
        uri:require('../assets/categories/astrology.png')
    },
    {
        label:'Fashion',
        uri:require('../assets/categories/fashion.png')
    },
    {
        label:'Film',
        uri:require('../assets/categories/film.png')
    },
    {
        label:'Food',
        uri:require('../assets/categories/food.png')
    },
    {
        label:'Games',
        uri:require('../assets/categories/games.png')
    },
    {
        label:'Music',
        uri:require('../assets/categories/music.png')
    },
    {
        label:'News',
        uri:require('../assets/categories/news.png')
    },
    {
        label:'Animals',
        uri:require('../assets/categories/animals.png')
    },
    {
        label:'Science',
        uri:require('../assets/categories/science.png')
    },
    {
        label:'Sport',
        uri:require('../assets/categories/sport.png')
    },
    {
        label:'Travel',
        uri:require('../assets/categories/travel.png')
    },
    {
        label:'Jokes',
        uri:require('../assets/categories/jokes.png')
    },
    {
        label:'Vegan',
        uri:require('../assets/categories/vegan.png')
    },
    {
        label:'Ecology',
        uri:require('../assets/categories/ecology.png')
    },
    {
        label:'Love',
        uri:require('../assets/categories/love.png')
    },
    {
        label:'Faith',
        uri:require('../assets/categories/faith.png')
    },
    {
        label:'Adventure',
        uri:require('../assets/categories/adventure.png')
    },
    {
        label:'WTF',
        uri:require('../assets/categories/wtf.png')
    },
    {
        label:'Record',
        uri:require('../assets/categories/record.png')
    },
    {
        label:'Singers',
        uri:require('../assets/categories/singers.png')
    },
    {
        label:'Art',
        uri:require('../assets/categories/art.png')
    },
    {
        label:'Psychedelics',
        uri:require('../assets/categories/psychedelics.png')
    },
    {
        label:'Makeup',
        uri:require('../assets/categories/makeup.png')
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