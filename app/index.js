/**
 * Game interface setup
 */

import 'styles/index.scss';
import Game from '@/classes/Game.js';
import Scoreboard from '@/classes/Scoreboard';

const settings = {
  container: window,
  gameWrapper: document.getElementById('game'),
  input: document.getElementById('words-input'),
  gameOverScreen: document.getElementById('game-over'),
  gameInit: document.getElementById('game-init'),
  gameControls: document.getElementById('game-controls'),
  mode: 'waiguoren'
};

const game = new Game(settings);

const scoreboard = new Scoreboard(game, {
  text: 'Score ',
  scoreDisplay: 'score', // data-control value
  livesDisplay: 'lives' // data-display value
});

game.bindScoreboard(scoreboard);
