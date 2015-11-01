'use strict';

import React from 'react';

// ячейка
var Block = React.createClass({
  _getBlockStyle(block){
    return {
      width: this.props.width,
      height: this.props.height,
      float: 'left',
      border: '1px solid black',
      backgroundColor: block.isOpen ? 'white' : block.markedAsBomb ? 'green' : 'blue'
    };
  },
  _handleClick(){
    this.props.onOpenBlock(this.props.block);
  },
  _handleRightClick(e){
    e.preventDefault();
    this.props.onMarkBomb(this.props.block);
  },
  render(){

    //формирование класса содержимого ячейки
    var bombClass = this.props.block.content == 'BOMB' ? 'block-content bomb' : 'block-content';

    return (
      <div className='block-outer'
             style={this._getBlockStyle(this.props.block)}
             onClick={this._handleClick}
             onContextMenu={this._handleRightClick}>
        <span className={bombClass}>{this.props.block.content != 'BOMB' ? this.props.block.content : ''}</span>
      </div>
    );
  }
});

export default Block;