import { bindActionCreators } from '@reduxjs/toolkit';
import { Buffer } from 'buffer';
import React, { Component } from 'react';
import {
  Platform,
  View
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import { setVoiceState } from '../../store/actions';
import { DescriptionText } from '../component/DescriptionText';
import { styles } from '../style/Common';

class VoicePlayer extends Component {

  dirs = RNFetchBlob.fs.dirs;
  path = Platform.select({
    ios: 'hello.m4a',
    android: `${this.dirs.CacheDir}/hello.mp3`,
  });

  _isMounted = false;
  _playerPath = this.path;
  waveHeight = 28;
  waveHeights = [4, 8, 15, 22, 28, 22, 15, 8, 4, 1, 1, 3, 4, 8, 12, 28, 19, 1, 3, 1, 1, 12, 4, 8, 15, 8, 4, 3, 1, 1, 28, 15, 28, 15, 4, 8, 15, 22, 28, 22, 15, 8, 4, 1, 1, 3, 4, 8, 15, 8, 12, 28, 19, 1, 3, 1, 1, 4, 8, 12, 8, 8, 12, 28, 19, 12, 4, 1, 1, 1, 1, 3, 4, 8, 1, 1]
  constructor(props) {
    super(props);
    this.changePlayStatus = this.changePlayStatus.bind(this);
    this.onReplay = this.onReplay.bind(this);
    this.getPlayLink = this.getPlayLink.bind(this);
    this.onStartPlay = this.onStartPlay.bind(this);
    this.onStopPlay = this.onStopPlay.bind(this);
    this.onPausePlay = this.onPausePlay.bind(this);
    this.onResumePlay = this.onResumePlay.bind(this);
    this.onReplay = this.onReplay.bind(this);
    this.onSetAudioPosition = this.onSetAudioPosition.bind(this);
    this.state = {
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',
      isPlaying: false,
      isStarted: false,
      voiceKey: props.voiceState,
      swipe: {},
      volumes: [],
      maxVolume: 1
    };
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.3); // optional. Default is 0.5
  }

  async componentDidMount() {
    this._isMounted = true;
    const fileRemoteUrl = this.props.voiceUrl;
    if (fileRemoteUrl == null) {
      this._playerPath = this.path;
      if (this.props.playing == true) {
        await this.onStartPlay(this.props.voiceState)
      }
    }
    else {
      if (this.props.playing == true)
        await this.getPlayLink().then((res) =>
          this.onStartPlay(res)
        )
    }
  }
  async componentDidUpdate(prevProp) {
    if (this.props.voiceState != this.state.voiceKey) {
      if (this.state.isStarted == true && this.state.isPlaying == false) {
        await this.onResumePlay();
      }
      await this.onStopPlay();
    }
    if (this.state.isPlaying != this.props.playing) {
      const fileRemoteUrl = this.props.voiceUrl;
      if (this.props.playing) {
        if (fileRemoteUrl == null) {
          await this.onStartPlay(this.props.voiceState)
        }
        else {
          await this.getPlayLink().then((res) =>
            this.onStartPlay(res)
          )
        }
      }
      else {
        await this.onStopPlay();
      }
      this.setState({ isPlaying: this.props.playing })
    }
  }

  async componentWillUnmount() {
    this._isMounted = false;
    await this.onStopPlay();
  }

  changePlayStatus = async () => {
    if (this.state.isPlaying)
      await this.onPausePlay();
    else if (this.state.isStarted)
      await this.onResumePlay();
    else {
      if (this.props.voiceUrl == null) {
        await this.onStartPlay(this.props.voiceState);
      }
      else
        await this.getPlayLink().then(async (res) => {
          await this.onStartPlay(res);
        })
    }
  }

  onReplay = async () => {
    if (this.state.isPlaying)
      await this.audioRecorderPlayer.seekToPlayer(0);
    else if (this.state.isStarted) {
      await this.audioRecorderPlayer.seekToPlayer(0);
      await this.onResumePlay();
    }
    else {
      if (this.props.voiceUrl == null) {
        await this.onStartPlay(this.props.voiceState);
      }
      else
        await this.getPlayLink().then(async (res) => {
          await this.onStartPlay(res);
        })
    }
  }

  render() {
    let waveCom = [];
    let waveWidth = this.props.tinWidth ? this.props.tinWidth : 1.55;
    let mrg = this.props.mrg ? this.props.mrg : 0.45;
    this.waveHeight = this.props.height ? this.props.height : 28;
    let startIndex = Math.floor(this.state.volumes.length * this.state.currentPositionSec / this.state.currentDurationSec);
    if (startIndex + 76 > this.state.volumes.length)
      startIndex = this.state.volumes.length - 76;
    for (let i = 0; i < 76; i++) {
      let h;
      if (this.state.currentPositionSec != 0 && this.state.isPlaying && startIndex + i < this.state.volumes.length) h = Math.ceil(this.waveHeight * this.state.volumes[startIndex + i] / this.state.maxVolume) + 1;
      else h = Math.ceil(this.waveHeights[i] * this.waveHeight / 28);
      waveCom.push(
        <LinearGradient
          colors={this.props.waveColor}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          key={i}
          style={{
            width: waveWidth,
            height: h,
            borderRadius: 4,
            marginRight: mrg,
            marginLeft: mrg
          }}
        >
        </LinearGradient>
      );
    }
    return (
      <View
        style={[styles.rowSpaceBetween, { paddingHorizontal: 8 }]}
      >
        <View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: this.waveHeight + 1,
            }}
          >
            {waveCom}
          </View>
          {(this.state.isStarted == true) && <View style={[styles.rowSpaceBetween, { marginTop: 10 }]}>
            <DescriptionText
              text={new Date(Math.max(this.state.currentPositionSec, 0)).toISOString().substr(14, 5)}
              lineHeight={13}
              fontSize={13}
              color={this.props?.timeColor ? this.props.timeColor : '#FFF'}
            />
            <DescriptionText
              text={new Date(Math.max(this.state.currentDurationSec - this.state.currentPositionSec, 0)).toISOString().substr(14, 5)}
              lineHeight={13}
              fontSize={13}
              color={this.props?.timeColor ? this.props.timeColor : '#FFF'}
            />
          </View>}
        </View>
      </View>
    );
  }

  getPlayLink = async () => {
    let { voiceState, actions } = this.props;
    if (this._isMounted) this.setState({
      voiceKey: voiceState + 1,
      isStarted: true,
      isPlaying: true,
      currentPositionSec: 0
    });
    actions.setVoiceState(voiceState + 1);
    const fileRemoteUrl = this.props.voiceUrl;
    const fileExtension = Platform.select({
      ios: 'm4a',
      android: `mp3`,
    });
    const dirs = RNFetchBlob.fs.dirs.CacheDir;
    const path = Platform.select({
      ios: `${dirs}/ss.m4a`,
      android: `${dirs}/ss.mp3`,
    });
    return await RNFetchBlob.config({
      fileCache: false,
      appendExt: fileExtension,
      path,
    }).fetch('GET', fileRemoteUrl).then(res => {
      if (this._isMounted && res.respInfo.status == 200) {
        this._playerPath = (Platform.OS == 'ios') ? 'ss.m4a' : res.path();
        return voiceState + 1;
      }
      else
        return voiceState;
    })
      .catch(async err => {
        console.log(err);
        this.onStopPlay();
      })
  }

  onSetAudioPosition = async (e) => {
    if (this._isMounted) {
      if (this.state.isPlaying && !isNaN(e.currentPosition) && !isNaN(e.duration))
        this.setState({
          currentPositionSec: e.currentPosition,
          currentDurationSec: e.duration
        });
    }
    if (e.currentPosition == e.duration) {
      await this.onStopPlay();
    }
  }

  onStartPlay = async (res) => {
    let { voiceState } = this.props;
    if (res != voiceState) {
      await this.onStopPlay();
      return;
    }
    try {
      if (this._isMounted) {
        if (this.state.isStarted == false)
          this.setState({
            isStarted: true,
            isPlaying: true,
            currentPositionSec: 0
          });
        await RNFS.readFile(this._playerPath, 'base64')
          .then(base64Data => {
            const audioBuffer = new Uint8Array(Buffer.from(base64Data, 'base64'));
            let maxVolume = 300;
            for (let i = 0; i < audioBuffer.length; i++) {
              if (audioBuffer[i] > maxVolume)
                maxVolume = audioBuffer[i];
            }
            this.setState({
              volumes: audioBuffer,
              maxVolume
            })
          })
          .catch(error => {
            console.log('Error loading audio file:', error);
          });
        await this.audioRecorderPlayer.startPlayer(this._playerPath)
          .then(res => {
            this.audioRecorderPlayer.addPlayBackListener(async (e) => {
              this.onSetAudioPosition(e)
              return;
            });
          })
          .catch(err => {
            this.onStopPlay();
          });
      }
    }
    catch (err) {
      this.onStopPlay();
    }
  };

  onPausePlay = async () => {
    await this.audioRecorderPlayer.pausePlayer().then(res => {
      if (this._isMounted) this.setState({
        isPlaying: false
      })
    })
      .catch(err => console.log(err.message));;
  };

  onResumePlay = async () => {
    await this.audioRecorderPlayer.resumePlayer().then(res => {
      if (this._isMounted) this.setState({
        isPlaying: true
      })
    })
      .catch(err => console.log(err.message));
  };

  onStopPlay = async () => {
    if (this.state.isStarted == true) {
        if (this._isMounted) this.setState({ isStarted: false, currentPositionSec: 0 });
        try {
          await this.audioRecorderPlayer.stopPlayer()
            .catch(err => console.log(err.message));
          this.audioRecorderPlayer.removePlayBackListener();
        }
        catch (err) {
          console.log(err);
        }
    }
    if (this._isMounted)
      this.props.stopPlay();
  };
}

const mapStateToProps = state => ({
  voiceState: state.user.voiceState,
});

const ActionCreators = Object.assign(
  {},
  { setVoiceState },
);
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(ActionCreators, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(VoicePlayer)