/**
 * Application entry point
 */

// Load application styles
import 'styles/index.scss';
import Game from '@/classes/Game.js';
import wordsList from '@/wordsList.js';

const game = new Game('#game', {
  container: window,
  wordsList
});

const input = document.getElementById('words-input');
game.bindInput(input);

window.pauseGame = game.pauseGame.bind(game);

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
