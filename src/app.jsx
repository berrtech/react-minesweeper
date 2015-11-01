'use strict';

import React from 'react';

import Menu from './menu.jsx';
import Game from './game.jsx';
import GameStateStore from './game-state.store.js';
import Preparation from './preparation.jsx';

// основной компонент, точка входа
var App = React.createClass({
  getInitialState(){
    // берем состояние
    return GameStateStore.getState();
  },
  componentDidMount(){
    GameStateStore.addChangeListener(this._onChange);
  },
  componentWillUnmount(){
    GameStateStore.removeChangeListener(this._onChange);
  },
  _onChange(){
    this.setState(GameStateStore.getState());
  },
  render(){
    return (
      <div className='main-container'>
        {this.state.gameState == 'menu' ? <Menu/> : null}
        {this.state.gameState == 'preparation' ? <Preparation/> : null}
        {this.state.gameState == 'game' ? <Game/> : null}
      </div>
    );
  }
});

React.render(<App/>, document.getElementById('app'));

export default App;