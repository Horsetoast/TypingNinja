import 'pixi.js';
import Word from '@/classes/Word.js';
import config from '@/config';
import _ from 'lodash';

export default class Game {
  constructor (settings = {}) {
    this.app = null;
    this.score = 0;
    this.level = 1;
    this.words = [];
    this.input = null;
    this.paused = false;
    this.container = settings.container;
    this.wordsList = settings.wordsList;

    /* Attach resize listener */
    this.container.addEventListener('resize', () => {
      this.app.renderer.resize(this.container.innerWidth, this.container.innerHeight);
    });

    /* Attach pause game listener */
    this.container.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        this.pauseGame();
      }
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
      if (word.isOut()) {
        console.log('OUT!!', index);
        this.app.stage.removeChild(word.getEntity());
        this.words.splice(index, 1);
      }
    });
  }

  nextWord () {
    // this.spawnWord();
    const {level, wordsList} = this;
    const gameSpeed = this.convertToRange(
      level,
      [1, _.size(wordsList)],
      [config.WORD_MAX_SPAWN_SPEED, config.WORD_MIN_SPAWN_SPEED]
    );
    setTimeout(() => {
      if (!this.paused) {
        console.log('Game speed:', gameSpeed);
        this.spawnWord();
      }
      this.nextWord();
    }, gameSpeed);
  }

  pauseGame () {
    this.app.ticker.stop();
    this.paused = true;
  }

  addEntity (entity) {
    this.words.push(entity);
    this.app.stage.addChild(entity.getEntity());
  }

  getWordFromList () {
    const {wordsList, level} = this;
    return _.sample(wordsList[level]);
  }

  spawnWord () {
    const {level, wordsList} = this;
    const word = this.getWordFromList();

    const lifespan = this.convertToRange(
      this.level,
      [1, _.size(wordsList)],
      [config.WORD_MAX_LIFESPAN, config.WORD_MIN_LIFESPAN]
    );

    const wordEntity = new Word(word, this.container, {
      initOffsetTop: -200,
      lifespan,
      score: level
    });
    this.addEntity(wordEntity);
  }

  convertToRange (value, srcRange, dstRange) {
    // value is outside source range return
    if (value < srcRange[0] || value > srcRange[1]) {
      return NaN;
    }

    const srcMax = srcRange[1] - srcRange[0];
    const dstMax = dstRange[1] - dstRange[0];
    const adjValue = value - srcRange[0];

    return (adjValue * dstMax / srcMax) + dstRange[0];
  }

  destroyWord (word) {
    word.explode()
      .then(() => {
        const index = this.words.indexOf(word);
        this.words.splice(index, 1);
        this.app.stage.removeChild(word.getEntity());
      });
  }

  addScore (word) {
    this.score += word.getScore();
    let nextLevel = 0;
    for (let i = 1; i <= this.level; i++) {
      nextLevel += (i * config.WORDS_PER_LEVEL);
    }
    console.log('Next level limit:', nextLevel, 'Score:', this.score);
    if (this.score >= nextLevel) {
      this.level += 1;
    }
  }

  guessWord (string) {
    const word = this.words.find((w) => w.isWord(string));
    if (word) {
      this.destroyWord(word);
      this.addScore(word);
      this.input.value = '';
    }
  }

  bindInput (input) {
    this.input = input;
    this.input.addEventListener('keyup', (e) => {
      e.preventDefault();
      if (e.key === 'Enter') {
        this.guessWord(input.value);
      }
    });
  }
};
