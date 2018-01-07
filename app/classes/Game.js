import * as PIXI from 'pixi.js';
import Word from '@/classes/Word.js';
import config from '@/config.js';
import anime from 'animejs';
import _ from 'lodash';
import wordsList from '@/wordsList.js';
import { colorGradientHelper, convertToRange } from '@/helpers.js';

export default class Game {
  constructor (settings = {}) {
    this.app = null;
    this.score = 0;
    this.level = 1;
    this.lives = config.LIVES;
    this.gameOver = false;
    this.words = [];
    this.scoreboard = null;
    this.paused = false;
    this.lastSpawn = null;
    /* DOM elements */
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

    /* Attach pause game listener */
    this.container.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        this.pauseGame();
      }
    });

    /* Attach listener to text input */
    this.input.addEventListener('keyup', (e) => {
      e.preventDefault();
      if (e.key === 'Enter') {
        this.guessWord(this.input.value);
      }
    });

    /* Attach restart to controls */
    const ra = document.querySelectorAll('[data-control="restart"]');
    for (let el of ra) {
      el.addEventListener('click', this.restartGame.bind(this));
    }

    /* Create PIXI Application and add canvas to container */
    this.app = new PIXI.Application(this.container.innerWidth, this.container.innerHeight, {
      backgroundColor: 0x000000
    });
    this.gameWrapper.appendChild(this.app.view);
  }

  restartGame () {
    this.score = 0;
    this.level = 1;
    this.lives = config.LIVES;
    this.gameOver = false;
    this.words = [];
    this.paused = false;
    this.lastSpawn = null;
    while (this.app.stage.children[0]) {
      this.app.stage.removeChild(this.app.stage.children[0]);
    }
    this.app.ticker.start();
    this.input.focus();
    this.gameInit.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.gameControls.classList.remove('hidden');
    this.scoreboard.update();

    /* Setup ticker with periodical update function */
    this.app.ticker.add(this.updateGame.bind(this));
  }

  updateGame () {
    /* Check if game is over */
    if (this.gameOver) {
      this.app.ticker.stop();
      this.gameOverScreen.classList.remove('hidden');
      this.gameControls.classList.add('hidden');
      return;
    }

    this.updateWords();

    /* Spawn new word */
    this.nextWord();
  }

  updateWords () {
    this.words.forEach((word, index) => {
      word.update();
      /* Check if a word fell through */
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

  shakeAnimation () {
    this.gameWrapper.classList.add('shake');
    setTimeout(() => {
      this.gameWrapper.classList.remove('shake');
    }, 200);
  }

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
    const {level} = this;
    return _.sample(wordsList[level]);
  }

  spawnWord () {
    const {level} = this;
    const word = this.getWordFromList();

    const lifespan = convertToRange(
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

  guessWord (string) {
    if (string === '') return;
    const word = this.words.find((w) => w.guessed === false && w.guess(string.trim()));
    if (word) {
      this.destroyWord(word);
      this.addScore(word);
      this.input.value = '';
    } else {
      this.shakeAnimation();
    }
  }

  bindScoreboard (scoreboard) {
    this.scoreboard = scoreboard;
  }

  bindGameOverScreen (gameOverScren) {
    this.gameOverScren = gameOverScren;
  }
};
