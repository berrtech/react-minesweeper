'use strict';

import React from 'react';

import GameStateStore, { GameStateStoreSetters} from './game-state.store.js';
import UserOptions, { UserOptionsSetters } from './user-options.js';
import Block from './block.jsx';
import Timer from './timer.jsx';

var Game = React.createClass({
  getInitialState(){
    // берем состояние из хранилища
    var state = GameStateStore.getState();
    state.currentGame.blockWidth = 100 / state.currentGame.blocksCountX + '%';
    state.currentGame.blockHeight = 90 / state.currentGame.blocksCountY + '%';
    state.options = UserOptions.get();
    return state;
  },
  componentDidMount(){
    // вешаем обработчики событий
    GameStateStore.addChangeListener(this._onChange);
    UserOptions.addChangeListener(this._onChange);

    // стараемся всегда держать фокус на контейнере с игрой
    // чтобы работал ESC
    React.findDOMNode(this.refs.gameContainer).focus();
  },
  componentWillUnmount(){
    // удаляем обработчики
    GameStateStore.removeChangeListener(this._onChange);
    UserOptions.removeChangeListener(this._onChange);
  },
  _onChange(){
    var state = GameStateStore.getState();
    if (state.currentGame) {
      state.currentGame.blockWidth = 100 / state.currentGame.blocksCountX + '%';
      state.currentGame.blockHeight = 90 / state.currentGame.blocksCountY + '%';
    }
    state.options = UserOptions.get();
    // снова фокус
    this.setState(state, ()=>React.findDOMNode(this.refs.gameContainer).focus());
  },
  //метод рендера верхней плашки
  _renderTopBar(){
    return (
      <div className='top-bar'>
        <div className='top-bar__node'><span className='bomb'></span>{this.state.currentGame.bombsLeft}</div>
        <div className='top-bar__node'>
          <button onClick={this._togglePause}>||</button>
        </div>
        <div className='top-bar__node'>
          <Timer />
        </div>
      </div>
    );
  },
  _restartGame(){
    GameStateStoreSetters.startGame(this.state.currentGame.blocksCountX, this.state.currentGame.blocksCountY, this.state.currentGame.bombsCount);
  },
  _returnToMenu(){
    GameStateStoreSetters.returnToMenu();
  },
  _resume(){
    GameStateStoreSetters.togglePause();
  },
  _openBlock(block){
    if (!block.isOpen)
      GameStateStoreSetters.openBlock(block);
  },
  _toggleMarkBomb(block){
    if (!block.isOpen)
      GameStateStoreSetters.toggleMarkBomb(block);
  },
  _togglePause(){
    GameStateStoreSetters.togglePause();
  },
  //ловим ESC
  _handleKeyDown(e){
    if (e.keyCode == 27)
      this._togglePause();
  },
  _toggleSound(){
    UserOptionsSetters.toggleSound();
  },
  render(){
    return (
      <div className='main-container' 
        key='gameContainer' 
        ref='gameContainer' 
        onKeyDown={this._handleKeyDown}
        tabIndex='0'>
        {this._renderTopBar()}  
        {/* рендер ячеек */ }
        { this.state.currentGame.blocks.map(o=> {
          return o.map(x=> {
            return (<Block block={x} 
                           width={this.state.currentGame.blockWidth}
                           height={this.state.currentGame.blockHeight}
                           onOpenBlock={this._openBlock}
                           onMarkBomb={this._toggleMarkBomb}
                    />);
          });
        })}  
        {/* рендер экрана паузы */ }
        {this.state.currentGame.isPaused 
          && !(this.state.currentGame.result == 'LOST' 
          || this.state.currentGame.result == 'WON') 
          ? (
              <div className='overlay pause-overlay'>
                <div className='overlay-inner'>
                  <button onClick={this._resume}>Продолжить</button>
                  <br/>
                  <br/>
                  <button onClick={this._restartGame}>Начать заново</button>
                  <br/>
                  <br/>
                  <button onClick={this._returnToMenu}>Вернуться в меню</button>
                </div>  
                  {/* кнопка звука в нижнем правом углу */ }
                  <span className='option-sound' dir='rtl' onClick={this._toggleSound}>
                    <img src='/src/img/sound.svg' width='30' height='30'/>
                    {!this.state.options.sound ? <span>x</span> : null}
                  </span>
              </div>
            ) : null}  
        {/* рендер экрана с сообщением о проигрыше */ }
        {this.state.currentGame.result == 'LOST' ? (
          <div className='overlay lost-overlay'>
            <div className='overlay-inner'>
              <p>Вы проиграли!</p>
              <button onClick={this._restartGame}>Начать заново</button>
              <button onClick={this._returnToMenu}>Вернуться в меню</button>
            </div>
          </div>
        ) : null}  
        {/* рендер экрана с сообщением о выигрыше */ }
        {this.state.currentGame.result == 'WON' ? (
          <div className='overlay won-overlay'>
            <div className='overlay-inner'>
              <p>Вы выиграли!</p>
              <button onClick={this._restartGame}>Начать заново</button>
              <button onClick={this._returnToMenu}>Вернуться в меню</button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
});


export default Game;