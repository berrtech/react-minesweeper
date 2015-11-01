'use strict';

import React from 'react';
import merge from 'react/lib/Object.assign.js';

import UserOptions, { UserOptionsSetters } from './user-options.js';
import { GameStateStoreSetters } from './game-state.store.js';

// подготовка к игре
var Preparation = React.createClass({
  getInitialState(){
    // получение настроек юзера
    var state = merge({}, UserOptions.get());
    state.bombsValidationMessage = null;
    return state;
  },
  componentDidMount(){
    UserOptions.addChangeListener(this._onChange);
  },
  componentWillUnmount(){
    UserOptions.removeChangeListener(this._onChange);
  },
  _onChange(){
    this.setState(UserOptions.get());
  },
  handleSubmit(e){
    e.preventDefault();
    // берем значения инпутов
    var x = React.findDOMNode(this.refs.x).value.trim();
    var y = React.findDOMNode(this.refs.y).value.trim();
    var bombsCount = React.findDOMNode(this.refs.bombsCount).value.trim();

    // валидация кол-ва бомб
    if (parseInt(bombsCount) > x * y) {
      this.setState({bombsValidationMessage: 'Слишком много бомб!'});
      return;
    } else if (parseInt(bombsCount) < 1) {
      this.setState({bombsValidationMessage: 'Слишком мало бомб!'});
    } else {
      this.setState({bombsValidationMessage: null});

    }

    // next level validation
    if (!parseInt(x) || parseInt(x) < 1)
      x = 10;
    if (!parseInt(y) || parseInt(y) < 1)
      y = 10;

    // начинаем игру
    GameStateStoreSetters.startGame(parseInt(x), parseInt(y), parseInt(bombsCount));
  },
  _toggleSound(){
    UserOptionsSetters.toggleSound();
  },
  render(){
    return (
      <div className='main-menu'>
        {/* форма */ }
        <form className='preparation-form' onSubmit={this.handleSubmit}>
          <p>Желаемый размер поля</p>
          <input type='text' ref='x' defaultValue='10'/> x <input type='text' ref='y' defaultValue='10'/>
          <br/>  
          <p>Количество бомб</p>
          <input type='text' defaultValue='20' ref='bombsCount'/>
          <br/>
          {/* сообщение валидации количества бомб */ }
          {this.state.bombsValidationMessage ? <p>{this.state.bombsValidationMessage}</p> : null}
          <br/>
          <input type='submit' value='Поехали!'/>
        </form>  
        {/* кнопка в нижнем правом углу */ }
        <span className='option-sound' dir='rtl' onClick={this._toggleSound}>
          <img src='/src/img/sound.svg' width='30' height='30'/>
          {!this.state.sound ? <span>x</span> : null}
        </span>
      </div>
    );
  }
});

export default Preparation;