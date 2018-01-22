import 'pixi.js';
import config from '@/config.js';
import _ from 'lodash';
import anime from 'animejs';
import { colorGradientHelper, convertToRange } from '@/helpers.js';

/* Create an array to store the textures */
let explosionTextures = [];

PIXI.loader
.add('spritesheet', 'assets/sprites/mc.json')
.load(() => {
  for (let i = 0; i < 26; i++) {
      var texture = PIXI.Texture.fromFrame('Explosion_Sequence_A ' + (i+1) + '.png');
      explosionTextures.push(texture);
  }
});

export default class Word {
  /**
   * Create a word
   * @param {Object} data Object with Chinese and pinyin
   * example - {tr: '愛', si: '爱', pin: ['ai4']},
   * @param {Object} app PIXI App object
   * @param {DOMElement} container
   * @param {Object} options {x, y, score, lifespan, initOffsetTop}
   */
  constructor (data = {}, app, container, options = {}) {
    this.guessed = false;
    this.spawnTime = window.performance.now();
    this.lifespan = options.lifespan || 10000;
    this.score = options.score || 1;
    this.container = container;
    this.app = app;
    this.data = data;
    this.style = {
      fontFamily: 'Helvetica, sans-serif',
      fontSize: '100px',
      fill: 0xADD8E6
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
   * Marking word as guessed and exploding animation
   */
  explode () {
    this.guessed = true;
    return new Promise((resolve, reject) => {
      const ba = anime({
        duration: 400,
        loop: 1,
        easing: 'easeInQuad',
        update: (anim) => {
          const gradientRatio = _.round(anim.progress / 100, 2);
          const rgb1 = PIXI.utils.hex2rgb(0xADD8E6);
          const rgb2 = PIXI.utils.hex2rgb(0xEAFF2A);
          const color = colorGradientHelper(rgb1, rgb2, gradientRatio);
          this.text.style.fill = PIXI.utils.rgb2hex(color);
        },
        complete: () => {
          this.text.style.fill = PIXI.utils.rgb2hex(0x000000);
          var explosion = new PIXI.extras.AnimatedSprite(explosionTextures);

          explosion.x = this.text.x;
          explosion.y = this.text.y;
          explosion.loop = false;
          explosion.anchor.set(0.5);
          explosion.rotation = Math.random() * Math.PI;
          explosion.scale.set(0.75 + Math.random() * 0.5);
          explosion.gotoAndPlay(1);
          explosion.onComplete = () => {
            this.app.stage.removeChild(explosion);
            resolve();
          };
          this.app.stage.addChild(explosion);
        }
      });
    });
  }

};
