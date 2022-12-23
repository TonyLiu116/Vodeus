import React, { useState, useCallback } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  Modal,
  Vibration
} from 'react-native';
import { TitleText } from './TitleText';
import { VoiceItem } from './VoiceItem';
import RNVibrationFeedback from 'react-native-vibration-feedback';
import Share from 'react-native-share';
import { SvgXml } from 'react-native-svg';
import blankHeartSvg from '../../assets/post/blankHeart.svg';
import redHeartSvg from '../../assets/post/redHeart.svg';
import ciShareSvg from '../../assets/discover/context/share.svg';
import ciMicrophoneSvg from '../../assets/discover/context/microphone.svg';
import ciUsertSvg from '../../assets/discover/context/user.svg';
import ciReportRedSvg from '../../assets/discover/context/report.svg';
import ciAbuseSvg from '../../assets/discover/context/abuse.svg';
import ciReportSvg from '../../assets/discover/context/report.svg';
import ciFakeSvg from '../../assets/discover/context/fake.svg';
import ciBackSvg from '../../assets/discover/context/back.svg';
import ciTrashSvg from '../../assets/discover/context/trash.svg';
import ciViolenceSvg from '../../assets/discover/context/violence.svg';
import VoiceService from '../../services/VoiceService';
import { useSelector } from 'react-redux';
import { styles } from '../style/Common';
import { useTranslation } from 'react-i18next';
import '../../language/i18n';

export const ReportContext = ({
  postInfo,
  props,
  onChangeIsLike = () => { },
  onCloseModal = () => { },
}) => {

  const { t, i18n } = useTranslation();

  const [showReport, setShowReport] = useState(true);
  const [showModal, setShowModal] = useState(true);
  const [playstatus, setPlaystatus] = useState(false);

  let { user } = useSelector((state) => {
    return (
      state.user
    )
  });

  const appreciateVoice = () => {
    onChangeIsLike();
    if (postInfo.isLike == false)
      VoiceService.recordAppreciate({ count: 1, id: postInfo.id });
    else
      VoiceService.recordUnAppreciate(postInfo.id);
  }

  const closeModal = () => {
    setShowModal(false);
    onCloseModal();
  }
  const onShareAudio = useCallback(() => {
    Share.open({
      url: postInfo.file.url,
      type: 'audio/mp3',
    });
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      elevation = {5}
      visible={showModal}
      onRequestClose={() => {
        closeModal();
      }}
    >
      <Pressable onPressOut={closeModal} style={styles.swipeModal}>
        <View
          style={ { marginTop: "25%" }}
        >
          <VoiceItem
            info={postInfo}
            isPlaying={playstatus}
            onPressPlay={() => setPlaystatus(!playstatus)}
            onStopPlay={() => setPlaystatus(false)}
            spread={false}
          />
          {!showReport ?
            <View
              style={styles.contextWrap}
            >
              <TouchableOpacity
                style={styles.contextMenu}
                onPress={() => { props.navigation.navigate('VoiceProfile', { id: postInfo.id }); closeModal(); }}
              >
                <TitleText
                  text={t("Answer")}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={ciMicrophoneSvg}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contextMenu}
                onPress={onShareAudio}
              >
                <TitleText
                  text={t("Share")}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={ciShareSvg}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contextMenu}
                onPress={() => appreciateVoice()}
              >
                <TitleText
                  text={t("Appreciate")}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={postInfo.isLike ? redHeartSvg : blankHeartSvg}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contextMenu}
                onPress={() => {
                  if (postInfo.user.id == user.id)
                    props.navigation.navigate('Profile');
                  else
                    props.navigation.navigate('UserProfile', { userId: postInfo.user.id });
                  closeModal();
                }}
              >
                <TitleText
                  text={postInfo.user.name}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={ciUsertSvg}
                />
              </TouchableOpacity>
              <Pressable
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}
                onPress={() => setShowReport(true)}
              >
                <TitleText
                  text={t("Report")}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                  color="#E41717"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={ciReportRedSvg}
                />
              </Pressable>
            </View>
            :
            <View
              style={styles.contextWrap}
            >
              <Pressable
                style={styles.contextMenu}
              >
                <TitleText
                  text={t("Spam")}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={ciTrashSvg}
                />
              </Pressable>
              <Pressable
                style={styles.contextMenu}
              >
                <TitleText
                  text={t("Fake Account")}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={ciFakeSvg}
                />
              </Pressable>
              <Pressable
                style={styles.contextMenu}
              >
                <TitleText
                  text={t("Violence")}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={ciViolenceSvg}
                />
              </Pressable>
              <Pressable
                style={styles.contextMenu}
              >
                <TitleText
                  text={t("Child Abuse")}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={ciAbuseSvg}
                />
              </Pressable>
              <Pressable
                style={styles.contextMenu}
              >
                <TitleText
                  text={t("Other")}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={ciReportSvg}
                />
              </Pressable>
              <View
                style={{
                  height: 8,
                  backgroundColor: 'rgba(3, 0, 39, 0.15)'
                }}
              ></View>
              {/* <Pressable
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}
                onPress={() => setShowReport(false)}
              >
                <TitleText
                  text={t("Back")}
                  fontSize={17}
                  fontFamily="SFProDisplay-Regular"
                />
                <SvgXml
                  width={20}
                  height={20}
                  xml={ciBackSvg}
                />
              </Pressable> */}
            </View>
          }
        </View>
      </Pressable>
    </Modal>
  );
};
