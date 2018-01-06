import 'pixi.js';
import config from '@/config';
import _ from 'lodash';

export default class Word {
  constructor (word = '', container, options = {}) {
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
    this.text = new PIXI.Text(word, this.style);
    this.text.x = options.x || this.randomWordPosition();
    this.text.y = options.y || 0;
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

  isWord (word) {
    return word === this.word;
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
    return new Promise((resolve, reject) => {
      this.text.style.fill = 'red';
      setTimeout(() => {
        resolve();
      }, 300);
    });
  }
};
