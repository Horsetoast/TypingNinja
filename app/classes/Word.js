import 'pixi.js';

export default class Word {
  constructor (word = '', options = {}) {
    this.speed = options.speed || 1;
    // this.lifetime = options.lifetime || 1000;
    this.word = word;
    this.style = {
      fontFamily: 'Helvetica, sans-serif',
      fontSize: '100px',
      fill: 'lightblue'
    };
    this.text = new PIXI.Text(word, this.style);
    this.text.x = options.x || 0;
    this.text.y = options.y || 0;
  }

  update () {
    this.text.y += this.speed;
  }

  isOut (width, height) {
    if (this.text.y > height) {
      return true;
    } else {
      return false;
    }
  }

  isWord (word) {
    return word === this.word;
  }

  getEntity () {
    return this.text;
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
