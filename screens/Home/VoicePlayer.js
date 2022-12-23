import {
  Dimensions,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../style/Common';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { DescriptionText } from '../component/DescriptionText';
import React, { Component } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { SvgXml } from 'react-native-svg';
import RNFetchBlob from 'rn-fetch-blob';
import { setVoiceState } from '../../store/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { windowWidth } from '../../config/config';
import pauseSvg from '../../assets/common/pause.svg';
import playSvg from '../../assets/common/play.svg';
import replaySvg from '../../assets/common/replay.svg';
import Sound from 'react-native-sound'
import greyWaveSvg from '../../assets/record/grey-wave.svg';
import whiteWaveSvg from '../../assets/record/white-wave.svg';

const screenWidth = Dimensions.get('screen').width;

class VoicePlayer extends Component {

  dirs = RNFetchBlob.fs.dirs;
  path = Platform.select({
    ios: 'hello.m4a',
    android: `${this.dirs.CacheDir}/hello.mp3`,
  });

  _isMounted = false;
  _playerPath = this.path;
  waveHeight = 40;
  waveheights = [7, 12, 2, 1, 8, 3, 13, 9, 12, 10, 31, 24, 29, 8, 32, 38, 18, 19, 28, 7, 19, 13, 17, 10, 14, 1, 28, 10, 31, 2, 30, 3, 3, 23, 30, 3, 39, 35, 21, 38, 32, 5, 12, 19, 13, 13, 10, 10, 33, 18, 37, 33, 9, 32, 30, 13, 8, 24, 18, 4, 21, 9, 16, 8, 18, 20, 28, 16, 23, 11, 16, 15, 11, 29, 4, 35, 37, 23, 15, 28]
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
    this.state = {
      isLoggingIn: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: props.duration,
      playTime: '00:00:00',
      duration: '00:00:00',
      isPlaying: false,
      isStarted: false,
      voiceKey: props.voiceState,
      swipe: {},
      music: null
    };
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    //this.audioRecorderPlayer.setSubscriptionDuration(0.2); // optional. Default is 0.5
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
    else if (this.props.control && this.state.music) {
      this.state.music.setSpeed(this.props.playSpeed);
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
    this.waveHeight = this.props.height ? this.props.height : 39;
    for (let i = 0; i < 80; i++) {
      let h;
      if (this.state.isPlaying) h = Math.floor(Math.random() * this.waveHeight) + 1;
      else h = this.waveheights[i] * this.waveHeight / 39.0;
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
      <View
        style={[styles.rowSpaceBetween, { paddingHorizontal: 8 }]}
      >
        {this.props.playBtn && <TouchableOpacity onPress={() => this.changePlayStatus()}>
          <SvgXml
            width={windowWidth / (this.props.playBtnSize ? this.props.playBtnSize : 10)}
            height={windowWidth / (this.props.playBtnSize ? this.props.playBtnSize : 10)}
            style={{
              marginRight: 5
            }}
            xml={this.state.isPlaying ? pauseSvg : playSvg}
          />
        </TouchableOpacity>}
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
          {(this.state.isStarted == true && !isNaN(this.props.duration)) && <View style={[styles.rowSpaceBetween, { marginTop: 10 }]}>
            <DescriptionText
              text={new Date(Math.max(this.state.currentPositionSec, 0)).toISOString().substr(14, 5)}
              lineHeight={13}
              fontSize={13}
            />
            <DescriptionText
              text={new Date(Math.max((this.state.currentDurationSec - this.state.currentPositionSec), 0)).toISOString().substr(14, 5)}
              lineHeight={13}
              fontSize={13}
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
      </View>

    );
  }

  // onStatusPress = (e) => {
  //   const touchX = e.nativeEvent.locationX;
  //   const playWidth =
  //     (this.state.currentPositionSec / this.state.currentDurationSec) *
  //     (screenWidth - 56);
  //   const currentPosition = Math.round(this.state.currentPositionSec);

  //   if (playWidth && playWidth < touchX) {
  //     const addSecs = Math.round(currentPosition + 1000);
  //     this.audioRecorderPlayer.seekToPlayer(addSecs);
  //   } else {
  //     const subSecs = Math.round(currentPosition - 1000);
  //     this.audioRecorderPlayer.seekToPlayer(subSecs);
  //   }
  // };

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
        this._playerPath = (Platform.OS=='ios'&&!this.props.control)?'ss.m4a':res.path();
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

  onSetPosition = async (e) => {
    if (this._isMounted) {
      if (this.state.isPlaying && !isNaN(e.currentPosition) && !isNaN(e.duration))
        this.setState({
          currentPositionSec: e.currentPosition,
          currentDurationSec: e.duration,
        });
    }
    if (e.currentPosition == e.duration) {
      await this.onStopPlay();
    }
  }

  onStartPlay = async (res) => {
    let { voiceState } = this.props;
    if (res != voiceState || isNaN(this.props.duration)) {
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
          const audio = new Sound(this._playerPath, null, (err) => {
            if (err) {
              console.log("failed loading: ", err);
              return;
            }
            audio.setSpeed(this.props.playSpeed);
            audio.play(success => {
              console.log(success, 'audio play ended successfully!!');
              this.onStopPlay();
            });
            this.setState({
              music: audio
            });
            this.props.startPlay();
          })
          Sound.setActive(true)
          Sound.setCategory('Playback', true)
          Sound.setMode('Default');
        }
        else {
          await this.audioRecorderPlayer.startPlayer(this._playerPath)
            .then(res => {
              this.props.startPlay();
              this.audioRecorderPlayer.addPlayBackListener(async (e) => {
                this.onSetPosition(e)
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
          this.state.music.stop();
          this.state.music.release();
      }
      else {
        if (this._isMounted) this.setState({ isPlaying: false, isStarted: false, currentPositionSec: 0, currentDurationSec: 0 });
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