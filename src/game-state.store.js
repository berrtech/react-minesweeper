'use strict';

import { EventEmitter } from 'events';
import merge from 'react/lib/Object.assign.js';

//звуки
import {play} from './sounds.js';


var localStorageSupported = 'localStorage' in window && window['localStorage'] !== null;


// основное хранилище
var _state = _init();

// инициализация из localstorage, или дефолтная
function _init(){
  if (localStorageSupported && window.localStorage.key('state')) {
    return JSON.parse(window.localStorage.getItem('state'));
  }
  else return {
    gameState: 'menu'
  };
}

// инициалиация игры
function _initGame(x, y, bombsCount){
  return {
    gameState: 'game',
    currentGame: {
      blocksCountX: x,
      blocksCountY: y,
      bombsCount: bombsCount,
      blocks: formState(x, y, bombsCount),
      bombsLeft: bombsCount,
      clicksRequired: x * y,
      isStarted: false,
      isPaused: false,
      timeElapsed: 0
    }

  };
}

// функция сохранения текущего состояния
function _saveToStorage(){
  if (localStorageSupported)
    window.localStorage.setItem('state', JSON.stringify(_state));
}

function formState(x, y, bombsCount){
  var blocks = [];

  // формирование двумерного массива
  for (var i = 0; i < y; i++) {
    blocks[i] = [];
    for (var j = 0; j < x; j++) {
      blocks[i].push({
        isOpen: false,
        bombsAround: 0,
        x: j,
        y: i,
        content: ''  // содержимое ячейки после вскрытия, для бомбы будет 'BOMB'
      });
    }
  }

  //расставляем бомбы в рандомные ячейки в заданном диапазоне
  var bombsPlaced = 0;
  while (bombsPlaced < bombsCount) {
    var randomCellCoordX = Math.round(Math.random() * (x - 1));
    var randomCellCoordY = Math.round(Math.random() * (y - 1));
    var block = blocks[randomCellCoordY][randomCellCoordX];
    if (!block.hasBomb) {

      //перед установкой бомбы сбрасываем
      block.bombsAround = 0;
      blocks[randomCellCoordY][randomCellCoordX].hasBomb = true;

      //обновляем соседей
      updateNeighbours(randomCellCoordX, randomCellCoordY, blocks);
      bombsPlaced++;
    }
  }

  return blocks;
}

// функция обновления соседей
// принимает координаты ячейки, вокруг которой обновляем и массив с ячейками
function updateNeighbours(x, y, blocks){
  if (x - 1 >= 0 && !blocks[y][x - 1].hasBomb)
    blocks[y][x - 1].bombsAround++;
  if (x - 1 >= 0 && y - 1 >= 0 && !blocks[y - 1][x - 1].hasBomb)
    blocks[y - 1][x - 1].bombsAround++;
  if (y - 1 >= 0 && !blocks[y - 1][x].hasBomb)
    blocks[y - 1][x].bombsAround++;
  if (x + 1 <= blocks[y].length - 1 && y - 1 >= 0 && !blocks[y - 1][x + 1].hasBomb)
    blocks[y - 1][x + 1].bombsAround++;
  if (x + 1 <= blocks[y].length - 1 && !blocks[y][x + 1].hasBomb)
    blocks[y][x + 1].bombsAround++;
  if (x + 1 <= blocks[y].length - 1 && y + 1 <= blocks.length - 1 && !blocks[y + 1][x + 1].hasBomb)
    blocks[y + 1][x + 1].bombsAround++;
  if (y + 1 <= blocks.length - 1 && !blocks[y + 1][x].hasBomb)
    blocks[y + 1][x].bombsAround++;
  if (x - 1 >= 0 && y + 1 <= blocks.length - 1 && !blocks[y + 1][x - 1].hasBomb)
    blocks[y + 1][x - 1].bombsAround++;
}

// функция пометки предполагаемого местоположения бомбы
// принимает координаты ячейки
function _toggleMarkBomb(x, y){

  // флаг начала игры для таймера
  if (!_state.currentGame.isStarted)
    _state.currentGame.isStarted = true;

  var block = _state.currentGame.blocks[y][x];
  block.markedAsBomb = !block.markedAsBomb;
  play('mark');

  // если помечена как бомба, декрементируем оставшиеся бомбы и клики
  // иначе инкрементируем
  if (block.markedAsBomb) {
    _state.currentGame.bombsLeft--;
    _state.currentGame.clicksRequired--;
  } else {
    _state.currentGame.bombsLeft++;
    _state.currentGame.clicksRequired++;
  }

  // проверка на победу
  if (_state.currentGame.clicksRequired == 0) {
    _state.currentGame.result = 'WON';
    play('win');
  }
}

// функция открытия ячейки, принимает её координаты
function _open(x, y){

  // флаг
  if (!_state.currentGame.isStarted)
    _state.currentGame.isStarted = true;

  var block = _state.currentGame.blocks[y][x];

  // если обычная ячейка с числом - открываем, декрементируем клики
  // если помеченная - ничего не делаем
  // если без числа и без бомбы - значит пустая, открываем рекурсивно все вокруг
  // если бомба - game over
  if (block.bombsAround) {
    block.isOpen = true;
    block.content = block.bombsAround;
    _state.currentGame.clicksRequired--;
    play('open');
  } else if (block.markedAsBomb)
    return;
  else if (!block.bombsAround && !block.hasBomb) {
    play('open');
    _openRecursive(x, y);
  } else if (block.hasBomb) {
    // BOOM!
    block.content = 'BOMB';
    block.isOpen = true;
    _state.currentGame.result = 'LOST';

    // открываем все ячейки
    _state.currentGame.blocks.forEach(o=>o.forEach(x=> {
      x.isOpen = true;
      x.hasBomb
          ? x.content = 'BOMB'
          : x.bombsAround
          ? x.content = x.bombsAround
          : x.content = '';
    }));
    play('explosion');
  }

  // проверяем на победу
  if (_state.currentGame.clicksRequired == 0) {
    _state.currentGame.result = 'WON';
    play('win');
  }

  // рекурсивное открытие ячеек, на входе - координаты
  function _openRecursive(x, y){
    var block = _state.currentGame.blocks[y][x];

    // ячейки вне диапазона пропускаем
    if (x < 0 || y < 0 || x > _state.currentGame.blocksCountX - 1 || y > _state.currentGame.blocksCountY - 1)
      return;

    // открытые, помеченные и с бомбой - тоже
    if (block.isOpen || block.markedAsBomb || block.hasBomb)
      return;

    // с числами - открываем, декрементируем клики, выходим из текущего вызова
    if (block.bombsAround) {
      block.isOpen = true;
      block.content = block.bombsAround;
      _state.currentGame.clicksRequired--;
      return;
    }

    // пустые открываем и идем дальше
    else {
      block.isOpen = true;
      _state.currentGame.clicksRequired--;
    }

    if (x - 1 >= 0)
      _openRecursive(x - 1, y);
    if (y - 1 >= 0)
      _openRecursive(x, y - 1);
    if (x - 1 >= 0 && y - 1 >= 0)
      _openRecursive(x - 1, y - 1);
    if (x + 1 <= _state.currentGame.blocksCountX - 1 && y - 1 >= 0)
      _openRecursive(x + 1, y - 1);
    if (x + 1 <= _state.currentGame.blocksCountX - 1)
      _openRecursive(x + 1, y);
    if (x + 1 <= _state.currentGame.blocksCountX - 1 && y + 1 <= _state.currentGame.blocksCountY - 1)
      _openRecursive(x + 1, y + 1);
    if (y + 1 <= _state.currentGame.blocksCountY - 1)
      _openRecursive(x, y + 1);
    if (x - 1 >= 0 && y + 1 <= _state.currentGame.blocksCountY - 1)
      _openRecursive(x - 1, y + 1);
  }
}

// внешние геттеры хранилища и источник событий
var GameStateStore = merge({}, EventEmitter.prototype, {
  getState(){
    return _state;
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

// внешние сеттеры хранилища
export var GameStateStoreSetters = {
  prepareToGame(){
    _state.gameState = 'preparation';
    _saveToStorage();
    GameStateStore.emitChange();
  },
  startGame(x, y, bombsCount){
    _state = _initGame(x, y, bombsCount);
    _saveToStorage();
    GameStateStore.emitChange();
  },
  returnToMenu(){
    delete(_state.currentGame);
    _state.gameState = 'preparation';
    _saveToStorage();
    GameStateStore.emitChange();
  },
  togglePause(){
    _state.currentGame.isPaused = !_state.currentGame.isPaused;
    _saveToStorage();
    GameStateStore.emitChange();
  },
  openBlock(block){
    _open(block.x, block.y);
    _saveToStorage();
    GameStateStore.emitChange();
  },
  toggleMarkBomb(block){
    _toggleMarkBomb(block.x, block.y);
    _saveToStorage();
    GameStateStore.emitChange();
  },
  updateTime(seconds){
    if (!_state.currentGame) return;
    _state.currentGame.timeElapsed = seconds;
    _saveToStorage();
    GameStateStore.emitChange();
  }

};

export default GameStateStore;