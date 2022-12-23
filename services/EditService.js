import { ACCESSTOKEN_KEY, REFRESHTOKEN_KEY, TUTORIAL_CHECK, API_URL } from '../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';

class EditService {
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
    async confirmVerify(data) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/account/changeemailverify?pseudo=${data}`, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            );
    }

    async changePassword(oldPassword, newPassword) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/account/resetpassword?oldpassword=${oldPassword}&newpassword=${newPassword}`, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            );
    }
    async changePremium(premium_state) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/account/changepremium?premium_state=${premium_state}`, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            );
    }

    async updateLastSee() {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob.config({ trusty: true }).
            fetch(
                'PUT',
                `${API_URL}/account/lastSee`, {
                'Authorization': `Bearer ${token}`
            }
            );
    }

    async changeLanguage(language) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/account/changeLanguage?language=${language}`, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            );
    }

    async changeStoryLanguage(language) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/account/changeStoryLanguage?language=${language}`, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            );
    }

    async userNameVerify(userName) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'POST',
                `${API_URL}/account/verifyusername?username=${userName}`, {
                'Authorization': `Bearer ${token}`
            },
            );
    }
    async changeProfile(data) {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob
            .config({ trusty: true })
            .fetch(
                'PUT',
                `${API_URL}/account/completeregister`, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
                JSON.stringify(data)
            );
    }

    async deleteAccount() {
        const token = await AsyncStorage.getItem(ACCESSTOKEN_KEY);
        return RNFetchBlob.config({ trusty: true }).
            fetch(
                'DELETE',
                `${API_URL}/account/deleteAccount`, {
                'Authorization': `Bearer ${token}`
            }
            );
    }
}

export default new EditService();