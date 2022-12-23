import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Text, TouchableOpacity } from 'react-native';
import Sound from 'react-native-sound'

export const SoundPlay = ({
  path,
  playSpeed
}) => {

  Sound.setMode("Default")
  Sound.setCategory('playback');

  const mounted = useRef(false);
  const music = useRef(null);

  useEffect(() => {
    if (music.current)
      music.current.setSpeed(playSpeed);
    console.log(playSpeed, " audio play speed");
  }, [playSpeed])

  useEffect(() => {
    mounted.current = true;
    if (music.current == null) {
      let audio = new Sound(
        path,
        null,
        error => {
          if (error||!mounted.current) {
            console.log('Failed to load the sound', error);
            return;
          };
          // if loaded successfully  
          console.log(
            'Duration in seconds:' +
            audio.getDuration() +
            'Number of channels:' +
            audio.getNumberOfChannels(),
          );
          audio.setVolume(1);
          audio.play(success => {
            console.log(success,'audio play ended successfully!!');
          })
          audio.setSpeed(playSpeed);
          music.current = audio;
        }
      );
    }
    return () => {
      mounted.current = false;
      if (music.current) {
        music.current.stop(success => {
          console.log('audio stop ended successfully');
        });
        music.current.release();
      }
    }
  }, [])

  return (
    <View>
    </View>
  );
};
