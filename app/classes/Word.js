import 'pixi.js';
import config from '@/config.js';
import anime from 'animejs';
import _ from 'lodash';

export default class Word {
  constructor (word = {}, container, options = {}) {
    this.guessed = false;
    this.spawnTime = window.performance.now();
    this.lifespan = options.lifespan || 10000;
    this.score = options.score || 1;
    this.container = container;
    this.word = word;
    this.style = {
      fontFamily: 'Helvetica, sans-serif',
      fontSize: '100px',
      fill: 'lightblue'
    };
    // TODO: Support for simplified chinese
    const chineseType = 'tr';
    this.text = new PIXI.Text(word[chineseType], this.style);
    this.text.x = options.x || this.randomWordPosition();
    this.text.y = options.y || 0;
    this.text.anchor.x = 0.5;
    this.text.anchor.y = 0.5;
    this.initOffsetTop = options.initOffsetTop || 0;
    console.log('Word spawned:', this.word, 'Lifespan:', this.lifespan);
    this.update();
  }

  update () {
    const now = window.performance.now();
    const {text, container, initOffsetTop, spawnTime, lifespan} = this;

    const dy = now - spawnTime;
    const progress = dy / lifespan;
    text.y = (container.innerHeight - initOffsetTop) * progress + initOffsetTop;
  }

  isOut (width, height) {
    const {spawnTime, lifespan} = this;
    const now = window.performance.now();

    return ((now - spawnTime) > lifespan);
  }

  guess (string) {
    const isPin = this.word.pin.some(pin => {
      return pin.replace(/ /g, '') === string.replace(/ /g, '');
    });
    return string === this.word['tr'] ||
           string === this.word['si'] ||
           isPin;
  }

  getEntity () {
    return this.text;
  }

  getScore () {
    return this.score;
  }

  randomWordPosition () {
    const {CONTAINER_WORDS_OFFSET} = config;

    const min = CONTAINER_WORDS_OFFSET;
    const max = this.container.innerWidth - CONTAINER_WORDS_OFFSET;
    let position = _.floor(Math.random() * this.container.innerWidth);
    if (position < min) {
      position += CONTAINER_WORDS_OFFSET;
    } else if (position > max) {
      position -= CONTAINER_WORDS_OFFSET;
    }
    return position;
  }

  explode () {
    this.guessed = true;
    return new Promise((resolve, reject) => {
      this.text.style.fill = 'green';
      setTimeout(() => {
        resolve();
      }, 300);
    });
  }
};
