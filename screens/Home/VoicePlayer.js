import { bindActionCreators } from '@reduxjs/toolkit';
import React, { Component } from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import LinearGradient from 'react-native-linear-gradient';
import Sound from 'react-native-sound';
import { SvgXml } from 'react-native-svg';
import { connect } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import pauseSvg from '../../assets/common/pause.svg';
import playSvg from '../../assets/common/play.svg';
import replaySvg from '../../assets/common/replay.svg';
import greyWaveSvg from '../../assets/record/grey-wave.svg';
import whiteWaveSvg from '../../assets/record/white-wave.svg';
import triangleSvg from '../../assets/common/green_triangle.svg';
import simplePauseSvg from '../../assets/common/simple_pause_green.svg';
import { windowWidth } from '../../config/config';
import { setVoiceState } from '../../store/actions';
import { DescriptionText } from '../component/DescriptionText';
import { styles } from '../style/Common';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

const screenWidth = Dimensions.get('screen').width;

class VoicePlayer extends Component {

  dirs = RNFetchBlob.fs.dirs;
  path = Platform.select({
    ios: 'hello.m4a',
    android: `${this.dirs.CacheDir}/hello.mp3`,
  });

  _isMounted = false;
  _myInterval = null;
  _music = null;
  _playerPath = this.path;
  waveHeight = 28;
  waveheights = [4, 8, 15, 22, 28, 22, 15, 8, 4, 1, 1, 3, 4, 8, 12, 28, 19, 1, 3, 1, 1, 12, 4, 8, 15, 8, 4, 3, 1, 1, 28, 15, 28, 15, 4, 8, 15, 22, 28, 22, 15, 8, 4, 1, 1, 3, 4, 8, 15, 8, 12, 28, 19, 1, 3, 1, 1, 4, 8, 12, 8, 8, 12, 28, 19, 12, 4, 1, 1, 1, 1, 3, 4, 8, 1, 1]
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
    this.onSetPosition = this.onSetPosition.bind(this);
    this.onSetAudioPosition = this.onSetAudioPosition.bind(this);
    this.myTimer = this.myTimer.bind(this);
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
      music: null,
      volumes: [],
      maxVolume: 1
    };
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    Sound.setCategory('Playback');
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
    else if (this.props.control && this._music) {
      this._music.setSpeed(this.props.playSpeed);
    }
    else if (this.state.isPlaying != this.props.playing) {
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
      else h = Math.ceil(this.waveheights[i] * this.waveHeight / 28);
      waveCom.push(
        <LinearGradient
          colors={this.props.waveColor}
          locations={[0, 0.52, 1]}
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
      !this.props.notView ? <View
        style={[styles.rowSpaceBetween, { paddingHorizontal: 8 }]}
      >
        {this.props.accelerator && <TouchableOpacity
          onPress={() => this.props.onSetSpeed()}
          style={{ marginRight: 5 }}
        >
          <LinearGradient
            style={
              {
                width: 60,
                height: 30,
                borderRadius: 14,
                borderWidth: this.props.playSpeed != 2 ? 0.63 : 0,
                borderColor: '#D4C9DE',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row'
              }
            }
            start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            colors={this.props.playSpeed == 2 ? ['#D89DF4', '#B35CF8', '#8229F4'] : ['#F2F0F5', '#F2F0F5', '#F2F0F5']}
          >
            <SvgXml
              xml={this.props.playSpeed == 2 ? whiteWaveSvg : greyWaveSvg}
            />
            <DescriptionText
              text={'x' + this.props.playSpeed.toString()}
              fontSize={11}
              lineHeight={18}
              marginLeft={3}
              color={this.props.playSpeed == 2 ? '#F6EFFF' : '#361252'}
            />
          </LinearGradient>
        </TouchableOpacity>}
        <View>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: this.waveHeight + 1,
            }}
          // onTouchStart={this._onTouchStart}
          // onTouchEnd={this._onTouchEnd}
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
        {this.props.replayBtn &&
          <TouchableOpacity onPress={() => this.onReplay()}>
            <SvgXml
              width={windowWidth / 10}
              height={windowWidth / 10}
              style={{
                marginLeft: 8
              }}
              xml={replaySvg}
            />
          </TouchableOpacity>}
        {this.props.rPlayBtn && <TouchableOpacity onPress={() => this.changePlayStatus()} style={{ marginLeft: 10 }}>
          <SvgXml
            width={40}
            height={40}
            xml={this.state.isPlaying ? pauseSvg : playSvg}
          />
        </TouchableOpacity>}
      </View> : null

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
        this._playerPath = (Platform.OS == 'ios' && !this.props.control) ? 'ss.m4a' : res.path();
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

  onSetPosition = async (e, isPlaying) => {
    if (this._isMounted) {
      if (this.state.isPlaying)
        this.setState({
          currentPositionSec: e,
        });
      if (this.props.notView)
        this.props.onSetCurrentSec(e);
    }
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

  myTimer = () => {
    if (this._music) {
      this._music.getCurrentTime((e, isPlaying) => {
        this.onSetPosition(e, isPlaying);
      })
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
        if (this.props.control) {
          this._music = new Sound(this._playerPath, null, (err) => {
            if (err) {
              console.log("failed loading: ", err);
              return;
            }
            this._music.play(success => {
              console.log(success, 'audio play ended successfully!!');
              this.onStopPlay();
            });

            this.props.startPlay();
            this.myInterval = setInterval(this.myTimer, 250);
          });
          this._music.setSpeed(this.props.playSpeed);
          this._music.setPan(1);
          this._music.setNumberOfLoops(0);
        }
        else {
          await RNFS.readFile(this._playerPath, 'base64')
            .then(base64Data => {
              const audioBuffer = new Uint8Array(Buffer.from(base64Data, 'base64'));
              let maxVolume = 400;
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
              this.props.startPlay();
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
      if (this.props.control) {
        if (this._isMounted)
          this._music.stop();
        this._music.release();
        clearInterval(this._myInterval);
        if (this._isMounted) this.setState({ isStarted: false });
      }
      else {
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
    }
    if (this._isMounted)
      this.props.stopPlay();
    if (this.props.notView)
      this.props.onSetCurrentSec(0);
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