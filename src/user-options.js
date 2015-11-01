'use strict';

import merge from 'react/lib/Object.assign.js';
import { EventEmitter } from 'events';


var localStorageSupported = 'localStorage' in window && window['localStorage'] !== null;

// настройки юзера
var _options = _init();

// берем из Localstorage, если есть
function _init(){
  if (localStorageSupported && window.localStorage.key('options')) {
    return JSON.parse(window.localStorage.getItem('options'));
  } else {
    return {sound: true};
  }
}

// сохранение
function _saveToStorage(){
  if (localStorageSupported)
    window.localStorage.setItem('options', JSON.stringify(_options));
}

// внешние геттеры хранилища и евенты
var UserOptions = merge({}, EventEmitter.prototype, {
  get(){
    return _options;
  },
  emitChange(){
    this.emit('change');
  },
  addChangeListener(callback){
    this.on('change', callback);
  },
  removeChangeListener(callback){
    this.removeListener('change', callback);
  }
});

// внешние сеттеры
export var UserOptionsSetters = {
  toggleSound(){
    _options.sound = !_options.sound;
    UserOptions.emitChange();
    _saveToStorage();
  }
};

export default UserOptions;


