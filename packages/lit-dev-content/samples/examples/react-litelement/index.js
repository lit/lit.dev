import React, { Component } from 'react';
import { render } from 'react-dom';

import 'chessboard-element';

import './style.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      name: 'React',
    };
  }

  render() {
    return (
      <div>
        <h1>&lt;chess-board&gt; and React</h1>
        <p>Here is &lt;chess-board&gt; inside a React app!</p>
        <chess-board
          position="start"
          orientation={this.state.flipped ? 'black' : 'white'}
          draggable-pieces
          ref={(e) => this.state.board = e}>
        </chess-board>
        <button onClick={() => this.state.board.flip()}>Flip Board</button>
        <button onClick={() => this.state.board.clear()}>Clear Board</button>
        <button onClick={() => this.state.board.setPosition('start')}>Start Position</button>
      </div>
    );
  }
}

render(<App />, document.querySelector('#root'));
