export default {
  waiguoren: {
    WORD_MIN_SPAWN_SPEED: 1500, // last level word spawn interval (in milliseconds)
    WORD_MAX_SPAWN_SPEED: 5000, // first level word spawn interval (in milliseconds)
    WORD_MIN_LIFESPAN: 15000, // last level word life (in milliseconds)
    WORD_MAX_LIFESPAN: 22000, // first level word life (in milliseconds)
    WORDS_PER_LEVEL: 25,
    LIVES: 6
  },
  normal: {
    WORD_MIN_SPAWN_SPEED: 1300, // last level word spawn interval (in milliseconds)
    WORD_MAX_SPAWN_SPEED: 2300, // first level word spawn interval (in milliseconds)
    WORD_MIN_LIFESPAN: 8000, // last level word life (in milliseconds)
    WORD_MAX_LIFESPAN: 15000, // first level word life (in milliseconds)
    WORDS_PER_LEVEL: 15,
    LIVES: 6  
  },
  CONTAINER_WORDS_OFFSET: 150, // offsets from sides for words X position
  WORD_STARTING_OFFSET: -200, // offset of Y position for Word
  BACKSPACE_DELETE: 3 // number of times backspace key has to be pressed to empty input
};
