import 'pixi.js';
import Word from '@/classes/Word.js';

export default class Game {
  constructor (settings = {}) {
    this.app = null;
    this.level = 1;
    this.words = [];
    this.input = null;
    this.container = settings.container;
    this.wordsList = settings.wordsList;
    this.config = settings.config;

    /* Attach resize listener */
    this.container.addEventListener('resize', () => {
      this.app.renderer.resize(this.container.innerWidth, this.container.innerHeight);
    });

    /* Create PIXI Application and add canvas to container */
    this.app = new PIXI.Application(this.container.innerWidth, this.container.innerHeight, {
      backgroundColor: 0x000000
    });
    document.body.querySelector('#game').appendChild(this.app.view);

    /* Setup ticker with periodical update function */
    this.app.ticker.add(this.updateGame.bind(this));

    this.nextWord();
  }

  updateGame () {
    this.words.forEach((word, index) => {
      word.update();
      if (word.isOut(this.container.innerWidth, this.container.innerHeight)) {
        console.log('OUT!!', index);
        this.app.stage.removeChild(word.getEntity());
        this.words.splice(index, 1);
      }
    });
  }

  nextWord () {
    const gameSpeed = 5000 - (this.level * 100);
    setTimeout(() => {
      this.spawnWord();
      this.nextWord();
    }, gameSpeed);
  }

  pauseGame () {
    this.app.ticker.stop();
  }

  addEntity (entity) {
    this.words.push(entity);
    this.app.stage.addChild(entity.getEntity());
  }

  getWordFromList () {
    const {wordsList, level} = this;
    const levelWordsLength = wordsList[level].length;
    const randIndex = Math.floor(Math.random() * levelWordsLength);
    return wordsList[level][randIndex];
  }

  genarateWordPosition () {
    const {CONTAINER_WORDS_OFFSET} = this.config;

    const min = CONTAINER_WORDS_OFFSET;
    const max = this.container.innerWidth - this.config.CONTAINER_WORDS_OFFSET;
    let position = Math.floor(Math.random() * this.container.innerWidth);
    if (position < min) {
      position += CONTAINER_WORDS_OFFSET;
    } else if (position > max) {
      position -= CONTAINER_WORDS_OFFSET;
    }
    return position;
  }

  genarateWordSpeed () {
    const {config, level} = this;
    const randFactor = Math.random() - 0.5;
    const modifier = 1 + level + randFactor;
    const speed = config.SPEED - (config.SPEED / modifier);
    return Math.round(speed * 100) / 100;
  }

  spawnWord () {
    const word = this.getWordFromList();
    const wordPosition = this.genarateWordPosition();
    const speed = this.genarateWordSpeed();

    const wordEntity = new Word(word, {
      x: wordPosition,
      y: -100,
      speed
    });
    console.log('Word spawned', word, wordPosition, speed);
    this.addEntity(wordEntity);
  }

  destroyWord (word) {
    const index = this.words.indexOf(word);
    word.explode()
      .then(() => {
        this.words.splice(index, 1);
        this.app.stage.removeChild(word.getEntity());
      });
  }

  checkWord (string) {
    const word = this.words.find((w) => w.isWord(string));
    if (word) {
      this.destroyWord(word);
      this.input.value = '';
    }
  }

  bindInput (input) {
    this.input = input;
    this.input.addEventListener('keyup', (e) => {
      e.preventDefault();
      console.log(e);
      if (e.key === 'Enter') {
        this.checkWord(input.value);
      }
    });
  }
};
