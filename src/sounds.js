'use strict';

import { Howl } from 'howler';

import UserOptions from './user-options.js';


// звуки
var Sounds = {
  open: new Howl({
    urls: ['/src/sounds/open.wav']
  }),
  mark: new Howl({
    urls: ['/src/sounds/mark.wav']
  }),
  explosion: new Howl({
    urls: ['/src/sounds/boom.wav']
  }),
  win: new Howl({
    urls: ['/src/sounds/win.mp3']
  }),
  music: new Howl({
    urls: ['/src/sounds/music.wav'],
    loop: true,
    volume: 0.5
  })
};

// инициализация
_init();

function _init(){
  if (UserOptions.get().sound)
    Sounds.music.play();
}

// вешаем обработчик, чтобы знать когда выключать и включать музыку
UserOptions.addChangeListener(_onChange);

function _onChange(){
  UserOptions.get().sound ? Sounds.music.play() : Sounds.music.stop();
}

// внешнее проигрывание звука
// принимает строку с названием звука
export function play(sound){
  if (UserOptions.get().sound) {
    Sounds[sound].play();
  }
}

// внешняя остановка
// принимает строку с названием звука
export function stop(sound){
  Sounds[sound].stop();
}

