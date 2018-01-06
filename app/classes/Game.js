import 'pixi.js';
import Word from '@/classes/Word.js';
import Scoreboard from '@/classes/Scoreboard.js';
import config from '@/config';
import _ from 'lodash';

export default class Game {
  constructor (divId, settings = {}) {
    this.app = null;
    this.score = 0;
    this.level = 1;
    this.words = [];
    this.input = null;
    this.paused = false;
    this.scoreboard = null;
    this.container = settings.container;
    this.wordsList = settings.wordsList;
    this.lastSpawn = null;

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
    document.body.querySelector(divId).appendChild(this.app.view);

    /* Setup ticker with periodical update function */
    this.app.ticker.add(this.updateGame.bind(this));

    this.createScoreBoard();
    this.nextWord();
  }

  createScoreBoard () {
    this.scoreboard = new Scoreboard('Score ', this.container);
    this.app.stage.addChild(this.scoreboard.getEntity());
  }

  updateGame () {
    /* Check if a word fell through */
    this.words.forEach((word, index) => {
      word.update();
      if (word.isOut()) {
        console.log('OUT!!', index);
        this.app.stage.removeChild(word.getEntity());
        this.words.splice(index, 1);
      }
    });

    /* Spawn new word */
    this.nextWord();
    /* Update position of scoreboard */
    this.scoreboard.update();
  }

  nextWord () {
    const {level, wordsList} = this;
    const gameSpeed = this.convertToRange(
      level,
      [0, _.size(wordsList)],
      [config.WORD_MAX_SPAWN_SPEED, config.WORD_MIN_SPAWN_SPEED]
    );

    if (this.lastSpawn == null) {
      this.lastSpawn = window.performance.now();
    }

    const now = window.performance.now();
    if (now > (this.lastSpawn + gameSpeed)) {
      if (!this.paused) {
        this.spawnWord();
        this.lastSpawn = window.performance.now();
        console.log('Game speed:', gameSpeed, 'Level:', level);
      }
    }
  }

  pauseGame () {
    this.app.ticker.stop();
    this.paused = true;
  }

  addWord (word) {
    this.words.push(word);
    this.app.stage.addChild(word.getEntity());
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
      [0, _.size(wordsList)],
      [config.WORD_MAX_LIFESPAN, config.WORD_MIN_LIFESPAN]
    );

    const wordEntity = new Word(word, this.container, {
      initOffsetTop: -200,
      lifespan,
      score: level
    });
    this.addWord(wordEntity);
  }

  convertToRange (value, srcRange, dstRange) {
    /* If value is outside source range return NaN */
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
    this.scoreboard.updateScore(this.score);
    let nextLevel = 0;
    for (let i = 1; i <= this.level; i++) {
      nextLevel += (i * config.WORDS_PER_LEVEL);
    }
    const levelExists = !!this.wordsList[this.level + 1];
    if (this.score >= nextLevel && levelExists) {
      this.level += 1;
    }
  }

  guessWord (string) {
    const word = this.words.find((w) => w.guessed === false && w.guess(string));
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
