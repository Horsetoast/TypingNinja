import 'pixi.js';
import config from '@/config.js';
import _ from 'lodash';

export default class Word {
  /**
   * Create a word
   * @param {Object} word Object with Chinese and pinyin
   * example - {tr: '愛', si: '爱', pin: ['ai4']},
   * @param {DOMElement} container
   * @param {Object} options {x, y, score, lifespan, initOffsetTop}
   */
  constructor (data = {}, container, options = {}) {
    this.guessed = false;
    this.spawnTime = window.performance.now();
    this.lifespan = options.lifespan || 10000;
    this.score = options.score || 1;
    this.container = container;
    this.data = data;
    this.style = {
      fontFamily: 'Helvetica, sans-serif',
      fontSize: '100px',
      fill: 'lightblue'
    };
    // TODO: Support for simplified chinese
    const chineseType = 'tr';
    this.text = new PIXI.Text(data[chineseType], this.style);
    this.text.x = options.x || this.randomWordPosition();
    this.text.y = options.y || 0;
    this.text.anchor.x = 0.5;
    this.text.anchor.y = 0.5;
    this.initOffsetTop = options.initOffsetTop || config.WORD_STARTING_OFFSET;
    this.update();
  }

  /**
   * Update the position of Word relative
   * to its container height
   */
  update () {
    const now = window.performance.now();
    const {text, container, initOffsetTop, spawnTime, lifespan} = this;

    const dy = now - spawnTime;
    const progress = dy / lifespan;
    text.y = (container.innerHeight - initOffsetTop) * progress + initOffsetTop;
  }

  /**
   * Check whether Word is outside the container
   * @returns {boolean}
   */
  isOut (width, height) {
    const {spawnTime, lifespan} = this;
    const now = window.performance.now();

    return ((now - spawnTime) > lifespan);
  }

  /**
   * Checks if input matches the Word's
   * Chinese or pinyin
   * @param {string} string
   * @returns {boolean}
   */
  guess (string) {
    const isPin = this.data.pin.some(pin => {
      return pin.replace(/ /g, '') === string.replace(/ /g, '');
    });
    return string === this.data['tr'] ||
           string === this.data['si'] ||
           isPin;
  }

  /**
   * @returns {PIXI.Text}
   */
  getEntity () {
    return this.text;
  }

  /**
   * @returns {number}
   */
  getScore () {
    return this.score;
  }

  /**
   * Generates random position
   * offsetted from sides (so that the word is fully visible)
   * @returns {number} X position
   */
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

  /**
   * This should be an exploding animation
   */
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
