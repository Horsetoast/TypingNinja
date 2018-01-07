import 'pixi.js';
import config from '@/config.js';
import _ from 'lodash';

export default class Scoreboard {
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
    const ld = document.querySelectorAll('[data-display="lives"]');

    const life = document.createElement('span');
    life.innerText = '❤';
    life.className = 'heart';

    for (let el of ld) {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
      _.times(this.game.lives, () => {
        el.appendChild(life.cloneNode(true));
      });
    }
  }

  updateScore () {
    const sd = document.querySelectorAll('[data-display="score"]');
    for (let el of sd) {
      el.innerText = this.game.score;
    }
  }
};
