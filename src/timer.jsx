'use strict';

import React from 'react';

import GameStateStore, { GameStateStoreSetters } from './game-state.store.js';

function _handleStateUpdate(state, component){
  // если игра приостановлена, закончена или игрок не совершил никаких действий, приостановить
  if (state.currentGame.isPaused
      || !state.currentGame.isStarted
      || state.currentGame.result) {
    clearInterval(component.interval);
    delete(component.interval);
  }
  else if (!component.interval)
    component.interval = setInterval(component.tick, 1000);
}

// просто компонент таймера, который следит за состоянием текущей игры и приостанавливается
// запускается после первого действия
var Timer = React.createClass({
  getInitialState(){
    return GameStateStore.getState();
  },
  tick(){
    GameStateStoreSetters.updateTime(this.state.currentGame.timeElapsed + 1);
  },
  componentDidMount(){
    _handleStateUpdate(this.state, this);
    GameStateStore.addChangeListener(this._onChange);
  },
  componentWillUnmount(){
    clearInterval(this.interval);
    GameStateStore.removeChangeListener(this._onChange);
  },

  _onChange(){
    this.setState(GameStateStore.getState(), ()=> {
      _handleStateUpdate(this.state, this);
    });
  },
  render(){
    return (
      <div className='timer'>{this.state.currentGame.timeElapsed}</div>
    );
  }
});

export default Timer;