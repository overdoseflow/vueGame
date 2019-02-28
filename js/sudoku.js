function chunk (arr, len) {
  var chunks = [],
    i = 0,
    n = arr.length;
  while (i < n) {
    chunks.push(arr.slice(i, i += len));
  }
  return chunks;
};
function pad(str, length, character) {
  str = '' + str;
  while (str.length < length) {
    str = character + str;
  }
  return str;
};
function formatTimeFromSeconds(sec) {
  var str = '';

  hour = Math.floor(sec / 60.0 / 60.0);
  str += pad(hour, 2, '0');

  minute = Math.floor(sec / 60.0);
  while (minute >= 60) {
    minute -= 60;
  }
  str += ':' + pad(minute, 2, '0');

  sec = Math.floor(sec);
  while (sec >= 60) {
    sec -= 60;
  }
  str += ':' + pad(sec, 2, '0');

  return str;
};

var v = new Vue({
  el: '#app',
  data: {
    game: null,
    time: null
  },
  methods: {
    difficultyClick: function(event) {
      event.preventDefault();

      var board = randomBoard(event.target.getAttribute('data-difficulty'));
      var game = [];
      for (var i = 0; i < 81; i++) {
        if (board[i] === '0') {
          game.push(null);
        } else {
          game.push(parseInt(board[i]));
        }
      }
      game = chunk(game, 9);
      for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
          var value = game[i][j];
          game[i][j] = {
            i: i,
            j: i,
            value: value,
            editable: value === null,
            hasConflict: false
          };
        }
      }

      this.game = game;
      this.time = 0;
      this.saveToLocalStorage();
    },
    continueGameClick: function(event) {
      event.preventDefault();
      this.game = JSON.parse(localStorage.currentGame);
      this.time = parseInt(localStorage.time);
    },
    hasExistingGame: function() {
      return !!localStorage.currentGame;
    },
    markAllWithoutConflict: function() {
      for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
          this.game[i][j].hasConflict = false;
        }
      }
    },
    checkSubset: function(array) {
      var nums = {};
      for (var i = 0; i < 9; i++) {
        if (array[i].value !== null && nums.hasOwnProperty(array[i].value)) {
          array[i].hasConflict = true;
          array[nums[array[i].value]].hasConflict = true;
        }
        nums[array[i].value] = i;
      }
    },
    checkConflicts: function() {
      this.markAllWithoutConflict();

      // check horizontal lines
      for (var i = 0; i < 9; i++) {
        var arr = [];
        for (var j = 0; j < 9; j++) {
          arr.push(this.game[i][j]);
        }
        this.checkSubset(arr);
      }
      // check vertical lines
      for (var j = 0; j < 9; j++) {
        var arr = [];
        for (var i = 0; i < 9; i++) {
          arr.push(this.game[i][j]);
        }
        this.checkSubset(arr);
      }
      // check squares
      var c = this.game;
      this.checkSubset([c[0][0], c[0][1], c[0][2], c[1][0], c[1][1], c[1][2], c[2][0], c[2][1], c[2][2]]);
      this.checkSubset([c[3][0], c[3][1], c[3][2], c[4][0], c[4][1], c[4][2], c[5][0], c[5][1], c[5][2]]);
      this.checkSubset([c[6][0], c[6][1], c[6][2], c[7][0], c[7][1], c[7][2], c[8][0], c[8][1], c[8][2]]);
      this.checkSubset([c[0][3], c[0][4], c[0][5], c[1][3], c[1][4], c[1][5], c[2][3], c[2][4], c[2][5]]);
      this.checkSubset([c[3][3], c[3][4], c[3][5], c[4][3], c[4][4], c[4][5], c[5][3], c[5][4], c[5][5]]);
      this.checkSubset([c[6][3], c[6][4], c[6][5], c[7][3], c[7][4], c[7][5], c[8][3], c[8][4], c[8][5]]);
      this.checkSubset([c[0][6], c[0][7], c[0][8], c[1][6], c[1][7], c[1][8], c[2][6], c[2][7], c[2][8]]);
      this.checkSubset([c[3][6], c[3][7], c[3][8], c[4][6], c[4][7], c[4][8], c[5][6], c[5][7], c[5][8]]);
      this.checkSubset([c[6][6], c[6][7], c[6][8], c[7][6], c[7][7], c[7][8], c[8][6], c[8][7], c[8][8]]);
    },
    cellKeyUp: function(event) {
      var el = event.target;
      var value = el.value;
      if (value.length > 1) {
        el.value = value[0];
        value = el.value;
      }
      if (!/^[1-9]$/.test(value)) {
        event.target.value = '';
      }

      var i = parseInt(el.getAttribute('data-i'));
      var j = parseInt(el.getAttribute('data-j'));
      if (el.value.length > 0) {
        this.game[i][j].value = parseInt(value);
      } else {
        this.game[i][j].value = null;
      }

      this.checkConflicts();
      this.saveToLocalStorage();

      if (value.length > 0) {
        event.target.blur();
      }
    },
    cellClick: function(event) {
      if (event.target.readOnly) {
        event.target.blur();
      } else {
        event.target.select();
      }
    },
    backClick: function(event) {
      event.preventDefault();
      this.game = null;
      this.time = null;
    },
    formatedTime: function() {
      return formatTimeFromSeconds(this.time);
    },
    saveToLocalStorage: function() {
      localStorage.currentGame = JSON.stringify(this.game);
      localStorage.time = this.time;
    }
  }
});

setInterval(function() {
  if (v.time !== null) {
    v.time++;
    v.saveToLocalStorage();
  }
}, 1000);
