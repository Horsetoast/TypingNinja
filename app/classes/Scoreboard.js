import 'pixi.js';
import _ from 'lodash';

export default class Scoreboard {
  /**
   * @param {Game} game Game class for getting the score, lifepoints, etc...
   * @param {Object} options
   * values of the data-control attributes
   * that display score and lifepoints
   */
  constructor (game, options = {}) {
    this.game = game;
    this.scoreDisplay = options.scoreDisplay;
    this.livesDisplay = options.livesDisplay;
    this.updateLives();
    this.updateScore();
  }

  update () {
    this.updateLives();
    this.updateScore();
  }

  updateLives () {
    const {game, livesDisplay} = this;
    const ld = document.querySelectorAll('[data-display="' + livesDisplay + '"]');

    const life = document.createElement('span');
    life.innerText = '❤';
    life.className = 'heart';

    for (let el of ld) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
      _.times(game.lives, () => {
        el.appendChild(life.cloneNode(true));
      });
    }
  }

  updateScore () {
    const {game, scoreDisplay} = this;
    const sd = document.querySelectorAll('[data-display="' + scoreDisplay + '"]');
    for (let el of sd) {
      el.innerText = game.score;
    }
  }
};
