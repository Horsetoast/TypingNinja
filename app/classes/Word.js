import 'pixi.js';

export default class Word {
  constructor (word = '', container, options = {}) {
    // this.speed = options.speed || 1;
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
    this.text.x = options.x || 0;
    this.text.y = options.y || 0;
    this.initOffsetTop = options.initOffsetTop || 0;
    this.update();
  }

  update () {
    // start 100 000
    // end 110 000
    // now 105 000
    // 5000 / 10 000
    // this.text.y += this.speed;
    const now = window.performance.now();
    const {text, container, initOffsetTop, spawnTime, lifespan} = this;

    const dy = now - spawnTime;
    const progress = dy / lifespan;
    text.y = (container.innerHeight - initOffsetTop) * progress + initOffsetTop;
    console.log(progress);
  }

  isOut (width, height) {
    // if (this.text.y > height) {
    //   return true;
    // } else {
    //   return false;
    // }
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

  explode () {
    return new Promise((resolve, reject) => {
      this.text.style.fill = 'red';
      setTimeout(() => {
        resolve();
      }, 300);
    });
  }
};
