'use strict';

import React from 'react';

import { GameStateStoreSetters } from './game-state.store.js';

//меню
var Menu = React.createClass({
  _prepareToGame(){
    GameStateStoreSetters.prepareToGame();
  },
  render(){
    return (
      <div className='main-menu'>
        <button className='start-game-button' onClick={this._prepareToGame}>Начать игру</button>
      </div>
    );
  }
});

export default Menu;