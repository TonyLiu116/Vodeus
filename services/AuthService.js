import { ACCESSTOKEN_KEY, DEVICE_TOKEN, DEVICE_OS, API_URL } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import { Platform } from 'react-native';

class AuthService {
    login(data) {
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/${'login'}`, {
                'Content-Type': 'application/json',
            },
                JSON.stringify(data)
            );
    }

    appleLogin(data) {
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/${'appleauth'}`, {
                'Content-Type': 'application/json',
            },
                JSON.stringify(data)
            );
    }
    googleLogin(data) {
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/${'googleauth'}`, {
                'Content-Type': 'application/json',
            },
                JSON.stringify(data)
            );
    }
    register(data) {
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/${'register'}`, {
                'Content-Type': 'application/json',
            },
                JSON.stringify(data)
            );
    }

    phoneRegister(data) {
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/${'phoneRegister'}`, {
                'Content-Type': 'application/json',
            },
                JSON.stringify(data)
            );
    }

    phoneLogin(data) {
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/${'phoneLogin'}`, {
                'Content-Type': 'application/json',
            },
                JSON.stringify(data)
            );
    }

    confirmPhoneVerify(data) {
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/${'confirmPhoneNumber'}`, {
                'Content-Type': 'application/json',
            },
                JSON.stringify(data)
            );
    }

    async getUserInfo(accessToken = null, checkDevice = '') {
        const token = accessToken ? accessToken : await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        //const deviceToken = await AsyncStorage.getItem(DEVICE_TOKEN);
        const deviceToken = Platform.OS=='ios'?await AsyncStorage.getItem(DEVICE_TOKEN):await AsyncStorage.getItem('fcmtoken');
        const deviceOs = await AsyncStorage.getItem(DEVICE_OS);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'GET',
                `${API_URL}/account/me?checkDevice=${checkDevice}&deviceToken=${deviceToken}&deviceOs=${deviceOs}`, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            );
    }
    async changeEmail(data) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/account/changeemail?password=${data.password}&newemail=${data.newemail}`, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            );
    }

    postRecordImage

    async uploadPhoto(data) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return await fetch(`${API_URL}/account/avatar`, {
            method: 'POST',
            body: data,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    async postRecordImage(data) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return await fetch(`${API_URL}/actions/recordImage`, {
            method: 'POST',
            body: data,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });
    }

    async confirmVerify(data) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/account/emailverify`, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
                JSON.stringify(data)
            );
    }

    async ResendCode() {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'GET',
                `${API_URL}/${'account/resendcode'}`, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            );
    }
}

export default new AuthService();