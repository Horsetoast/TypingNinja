import 'pixi.js';
import config from '@/config';
import _ from 'lodash';

export default class Scoreboard {
  constructor (text, container, options = {}) {
    this.text = text || '';
    this.score = 0;
    this.container = container;
    this.scoreText = new PIXI.Text(this.text + this.score, {
      fontSize: 40,
      fill: '#fff',
      align: 'center'
    });
    this.scoreText.anchor.x = 0.5;
    this.scoreText.anchor.y = 0.5;
    this.update();
  }

  update () {
    this.scoreText.x = this.container.innerWidth / 2;
    this.scoreText.y = this.container.innerHeight * 0.85;
  }

  addScore (score) {
    this.score += score;
    this.scoreText.text = this.text + this.score;
  }

  updateScore (score) {
    this.score = score;
    this.scoreText.text = this.text + this.score;
  }

  getEntity () {
    return this.scoreText;
  }
};
