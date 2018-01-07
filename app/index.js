/**
 * Application entry point
 */

// Load application styles
import 'styles/index.scss';
import Game from '@/classes/Game.js';
import Scoreboard from '@/classes/Scoreboard';

const gameWrapper = document.getElementById('game');

const input = document.getElementById('words-input');

const gameOverScreen = document.getElementById('game-over');

const gameInit = document.getElementById('game-init');

const gameControls = document.getElementById('game-controls');

const game = new Game({
  gameWrapper,
  container: window,
  input,
  gameInit,
  gameOverScreen,
  gameControls
});

const scoreboard = new Scoreboard(game, {
  text: 'Score ',
  scoreDisplay: 'score',
  livesDisplay: 'lives'
});

game.bindScoreboard(scoreboard);

// ================================
// START YOUR APP HERE
// ================================

// // Demo-specific, replace or factor out
// function createText () {
//   const style = {
//     fontFamily: 'Helvetica, sans-serif',
//     fontSize: '10vw',
//     fill: 'blue'
//   };
//   demoText = new PIXI.Text('0', style);
//   // stage.addChild(demoText);
//   app.stage.addChild(demoText);
// }

// // Put new text in the text box
// function updateText (delta) {
//   const msg = Number(demoText.text) + 1; // tricks
//   demoText.setText(msg);
//   // center text
//   demoText.x = app.renderer.width / 2 - demoText.width / 2;
//   demoText.y = app.renderer.height / 2 - demoText.height / 2;
// }
