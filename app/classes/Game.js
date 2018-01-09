import * as PIXI from 'pixi.js';
import Word from '@/classes/Word.js';
import config from '@/config.js';
import anime from 'animejs';
import _ from 'lodash';
import wordsList from '@/wordsList.js';
import { colorGradientHelper, convertToRange } from '@/helpers.js';

export default class Game {
  /**
   * @param {Object} settings Multiple HTML elements
   */
  constructor (settings = {}) {
    this.app = null;
    this.score = 0;
    this.level = 1;
    this.lives = config.LIVES;
    this.gameOver = false;
    this.words = [];
    this.scoreboard = null;
    this.lastSpawn = null;
    this.deleteKey = 0;

    /* HTML elements */
    this.gameWrapper = settings.gameWrapper;
    this.container = settings.container;
    this.input = settings.input;
    this.gameInit = settings.gameInit;
    this.gameControls = settings.gameControls;
    this.gameOverScreen = settings.gameOverScreen;

    /* Attach resize listener */
    this.container.addEventListener('resize', () => {
      this.app.renderer.resize(this.container.innerWidth, this.container.innerHeight);
    });

    /* Attach listener to text input */
    this.input.addEventListener('keyup', (e) => {
      e.preventDefault();
      if (e.key === 'Enter') {
        this.guessWord(this.input.value);
      }
      if (e.key === 'Backspace') {
        this.inputDelete();
      }
    });

    /* Attach restart to controls */
    const ra = document.querySelectorAll('[data-control="restart"]');
    for (let el of ra) {
      el.addEventListener('click', this.startNewGame.bind(this));
    }

    /* Create PIXI Application and append canvas */
    this.app = new PIXI.Application(this.container.innerWidth, this.container.innerHeight, {
      backgroundColor: 0x000000
    });
    this.gameWrapper.appendChild(this.app.view);
  }

  /**
   * Resets values, removes words from PIXI stage object,
   * start ticker and hide/show some HTML elements
   */
  startNewGame () {
    this.score = 0;
    this.level = 1;
    this.lives = config.LIVES;
    this.gameOver = false;
    this.words = [];
    this.lastSpawn = null;
    while (this.app.stage.children[0]) {
      this.app.stage.removeChild(this.app.stage.children[0]);
    }
    this.app.ticker.start();
    this.input.value = '';
    this.input.focus();
    this.gameInit.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.gameControls.classList.remove('hidden');
    this.scoreboard.update();

    this.app.ticker.add(this.update.bind(this));
  }

  /**
   * Check if the game is over,
   * if not, update words and spawn new
   */
  update () {
    if (this.gameOver) {
      this.app.ticker.stop();
      this.gameOverScreen.classList.remove('hidden');
      this.gameControls.classList.add('hidden');
      return;
    }

    this.updateWords();
    this.nextWord();
  }

  /**
   * Update Words positions and
   * check if they're out
   */
  updateWords () {
    this.words.forEach((word, index) => {
      word.update();
      if (word.isOut()) {
        this.loseLife();
        this.app.stage.removeChild(word.getEntity());
        this.words.splice(index, 1);
      }
    });
  }

  loseLife () {
    this.lives -= 1;
    if (this.lives === 0) {
      this.gameOver = true;
    }
    this.scoreboard.update();
    this.bleedAnimation();
  }

  /**
   * Background color animation
   */
  bleedAnimation () {
    const ba = anime({
      duration: 100,
      loop: 1,
      easing: 'easeInQuad',
      update: (anim) => {
        const gradientRatio = _.round(anim.progress / 100, 2);
        const rgb1 = PIXI.utils.hex2rgb(0x000000);
        const rgb2 = PIXI.utils.hex2rgb(0x8B0000);
        const color = colorGradientHelper(rgb1, rgb2, gradientRatio);
        console.log(color, gradientRatio);
        this.app.renderer.backgroundColor = PIXI.utils.rgb2hex(color);
      },
      complete: () => {
        ba.reverse();
        ba.easing = 'ease';
        ba.duration = 300;
        ba.play();
      }
    });
  }

  /**
   * Animation when you type a wrong word
   */
  shakeAnimation () {
    this.gameWrapper.classList.add('shake');
    setTimeout(() => {
      this.gameWrapper.classList.remove('shake');
    }, 200);
  }

  /**
   * Empty the input when user
   * pressed the backspace key twice
   */
  inputDelete () {
    this.deleteKey += 1;
    if (this.deleteKey === config.BACKSPACE_DELETE) {
      this.input.value = '';
      this.deleteKey = 0;
    }
  }

  /**
   * Spawn next word
   * gameSpeed is a time in milliseconds
   * between words calculated by level
   */
  nextWord () {
    const {level} = this;
    const gameSpeed = convertToRange(
      level,
      [0, _.size(wordsList)],
      [config.WORD_MAX_SPAWN_SPEED, config.WORD_MIN_SPAWN_SPEED]
    );

    if (this.lastSpawn == null) {
      this.lastSpawn = window.performance.now();
    }

    const now = window.performance.now();
    if (now > (this.lastSpawn + gameSpeed)) {
      this.spawnWord();
      this.lastSpawn = window.performance.now();
    }
  }

  /**
   * Select random word from the list
   * example - {tr: '愛', si: '爱', pin: ['ai4']},
   * @returns {Object}
   */
  getWordFromList () {
    const {level} = this;
    return _.sample(wordsList[level]);
  }

  /**
   * Creates new word
   */
  spawnWord () {
    const {level} = this;
    const wordData = this.getWordFromList();

    const lifespan = convertToRange(
      this.level,
      [0, _.size(wordsList)],
      [config.WORD_MAX_LIFESPAN, config.WORD_MIN_LIFESPAN]
    );

    const word = new Word(wordData, this.container, {
      lifespan,
      score: level
    });
    this.words.push(word);
    this.app.stage.addChild(word.getEntity());
  }

  /**
   * @param {Word} word
   */
  destroyWord (word) {
    word.explode()
      .then(() => {
        const index = this.words.indexOf(word);
        this.words.splice(index, 1);
        this.app.stage.removeChild(word.getEntity());
      });
  }

  /**
   * @param {Word} word
   */
  addScore (word) {
    this.score += word.getScore();
    this.scoreboard.update();
    let nextLevel = 0;
    for (let i = 1; i <= this.level; i++) {
      nextLevel += (i * config.WORDS_PER_LEVEL);
    }
    const levelExists = !!wordsList[this.level + 1];
    if (this.score >= nextLevel && levelExists) {
      this.level += 1;
    }
  }

  /**
   * @param {string} string
   */
  guessWord (string) {
    if (string === '') return;
    const word = this.words.find((w) => w.guessed === false && w.guess(string.trim()));
    if (word) {
      this.destroyWord(word);
      this.addScore(word);
      this.input.value = '';
      this.deleteKey = 0;
    } else {
      this.shakeAnimation();
    }
  }

  bindScoreboard (scoreboard) {
    this.scoreboard = scoreboard;
  }
};
