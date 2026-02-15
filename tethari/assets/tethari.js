(() => {
  const WHITE = 'white';
  const BLACK = 'black';
  const FILES = 'abcdef';
  const BOARD_SIZE = 6;

  const PIECE_NAMES = {
    H: 'Hauptmann',
    W: 'Waechter',
    K: 'Klinge',
    S: 'Springer',
    T: 'Turm',
    P: 'Tuemmler',
    O: 'Orca'
  };

  const MATERIAL = {
    P: 150,
    K: 280,
    W: 320,
    H: 380,
    S: 450,
    T: 500,
    O: 750
  };

  const ALL_DIRS = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  const TEST_SCENARIOS = [
    {
      id: 'promotion_orca',
      name: 'Promotion: Tuemmler -> Orca',
      description: 'Prueft, dass ein schlagender Tuemmler sofort zu Orca wird.',
      setup: { preset: 'default' },
      moves: ['b2-b3', 'b5-b4', 'b3xb4'],
      expected: [
        { type: 'pieceAt', square: 'b4', player: WHITE, piece: 'O' },
        { type: 'capturedCount', player: BLACK, count: 1 },
        { type: 'activePlayer', player: BLACK }
      ]
    },
    {
      id: 'double_isolation_death',
      name: 'Isolation: Doppelter Tod',
      description: 'Zwei angezaehlte Figuren bleiben isoliert und sterben simultan.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'b2', player: WHITE, type: 'H' },
          { square: 'c2', player: WHITE, type: 'W' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['b2-a1', 'e5-e4', 'a1-a2'],
      expected: [
        { type: 'gameOver', value: true },
        { type: 'winner', player: BLACK },
        { type: 'pieceCount', player: WHITE, count: 0 },
        { type: 'capturedCount', player: WHITE, count: 2 }
      ]
    },
    {
      id: 'threefold_repetition',
      name: 'Remis: Dreifache Wiederholung',
      description: 'Die Stellung wiederholt sich dreifach und endet remis.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'b2', player: WHITE, type: 'H' },
          { square: 'c2', player: WHITE, type: 'W' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['b2-b3', 'e5-e4', 'b3-b2', 'e4-e5', 'b2-b3', 'e5-e4', 'b3-b2', 'e4-e5'],
      expected: [
        { type: 'gameOver', value: true },
        { type: 'winner', player: 'draw' }
      ]
    }
  ];

  function inBounds(file, rank) {
    return file >= 0 && file < BOARD_SIZE && rank >= 0 && rank < BOARD_SIZE;
  }

  function coordStr(file, rank) {
    return FILES[file] + (rank + 1);
  }

  function parseCoord(str) {
    if (!/^[a-f][1-6]$/i.test(str)) return null;
    const s = str.toLowerCase();
    return { file: FILES.indexOf(s[0]), rank: parseInt(s[1], 10) - 1 };
  }

  function opposite(player) {
    return player === WHITE ? BLACK : WHITE;
  }

  function forward(player) {
    return player === WHITE ? 1 : -1;
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makePiece(player, type, endangered = false) {
    return { player, type, endangered };
  }

  function stepDeltas(type, player) {
    const fwd = forward(player);
    switch (type) {
      case 'H':
        return [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
      case 'W':
        return [[0, fwd], [0, -fwd], [-1, 0], [1, 0], [-1, -fwd], [1, -fwd]];
      case 'K':
        return [[0, fwd], [-1, fwd], [1, fwd], [-1, -fwd], [1, -fwd]];
      case 'S':
        return [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      case 'O':
        return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      default:
        return [];
    }
  }

  function slideDirections(type) {
    switch (type) {
      case 'T':
      case 'O':
        return [[0, 1], [0, -1], [1, 0], [-1, 0]];
      case 'P':
        return [[1, 0], [-1, 0]];
      default:
        return [];
    }
  }

  class TethariGame {
    constructor() {
      this.isSearching = false;
      this.reset();
    }

    reset() {
      this.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
      this.activePlayer = WHITE;
      this.moveCount = 0;
      this.movesWithoutEvent = 0;
      this.positionHistory = [];
      this.moveLog = [];
      this.capturedWhite = [];
      this.capturedBlack = [];
      this.gameOver = false;
      this.winner = null;
      this.lastMove = null;
      this.lastDeaths = [];
      this.lastEndangered = [];
      this.isSearching = false;
      this._setupDefaultPosition();
      this.positionHistory.push(this._hash());
    }

    _setupDefaultPosition() {
      const set = (file, rank, player, type) => {
        this.board[file][rank] = makePiece(player, type);
      };

      // Variante 1: Turm/Hauptmann getauscht -> keine offene Turm-Sichtlinie zu Beginn.
      set(0, 0, WHITE, 'K');
      set(1, 0, WHITE, 'W');
      set(2, 0, WHITE, 'H');
      set(3, 0, WHITE, 'T');
      set(4, 0, WHITE, 'W');
      set(5, 0, WHITE, 'K');

      set(1, 1, WHITE, 'P');
      set(3, 1, WHITE, 'S');
      set(5, 1, WHITE, 'P');

      set(1, 4, BLACK, 'P');
      set(3, 4, BLACK, 'S');
      set(5, 4, BLACK, 'P');

      set(0, 5, BLACK, 'K');
      set(1, 5, BLACK, 'W');
      set(2, 5, BLACK, 'H');
      set(3, 5, BLACK, 'T');
      set(4, 5, BLACK, 'W');
      set(5, 5, BLACK, 'K');
    }

    loadPosition(pieces, activePlayer = WHITE) {
      this.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
      this.activePlayer = activePlayer;
      this.moveCount = 0;
      this.movesWithoutEvent = 0;
      this.positionHistory = [];
      this.moveLog = [];
      this.capturedWhite = [];
      this.capturedBlack = [];
      this.gameOver = false;
      this.winner = null;
      this.lastMove = null;
      this.lastDeaths = [];
      this.lastEndangered = [];
      this.isSearching = false;

      for (const piece of pieces) {
        const coord = parseCoord(piece.square);
        if (!coord || !inBounds(coord.file, coord.rank)) continue;
        this.board[coord.file][coord.rank] = makePiece(piece.player, piece.type, !!piece.endangered);
      }

      this.positionHistory.push(this._hash());
    }

    saveState(includeUi = false) {
      const state = {
        board: this.board.map(column => column.map(cell => (cell ? { ...cell } : null))),
        activePlayer: this.activePlayer,
        moveCount: this.moveCount,
        movesWithoutEvent: this.movesWithoutEvent,
        gameOver: this.gameOver,
        winner: this.winner,
        capturedWhite: [...this.capturedWhite],
        capturedBlack: [...this.capturedBlack],
        positionHistory: [...this.positionHistory]
      };

      if (includeUi) {
        state.moveLog = this.moveLog.map(entry => ({ ...entry }));
        state.lastMove = this.lastMove
          ? {
            from: { ...this.lastMove.from },
            to: { ...this.lastMove.to },
            captured: this.lastMove.captured,
            capturedType: this.lastMove.capturedType,
            promoted: this.lastMove.promoted
          }
          : null;
        state.lastDeaths = this.lastDeaths.map(death => ({ ...death }));
        state.lastEndangered = this.lastEndangered.map(mark => ({ ...mark }));
      }

      return state;
    }

    restoreState(state) {
      this.board = state.board;
      this.activePlayer = state.activePlayer;
      this.moveCount = state.moveCount;
      this.movesWithoutEvent = state.movesWithoutEvent;
      this.gameOver = state.gameOver;
      this.winner = state.winner;
      this.capturedWhite = state.capturedWhite;
      this.capturedBlack = state.capturedBlack;
      this.positionHistory = state.positionHistory;

      if (state.moveLog) this.moveLog = state.moveLog;
      if ('lastMove' in state) this.lastMove = state.lastMove;
      if (state.lastDeaths) this.lastDeaths = state.lastDeaths;
      if (state.lastEndangered) this.lastEndangered = state.lastEndangered;
    }

    pieces(player) {
      const result = [];
      for (let file = 0; file < BOARD_SIZE; file++) {
        for (let rank = 0; rank < BOARD_SIZE; rank++) {
          const piece = this.board[file][rank];
          if (piece && piece.player === player) {
            result.push({ file, rank, type: piece.type, endangered: piece.endangered });
          }
        }
      }
      return result;
    }

    movesFor(file, rank) {
      const piece = this.board[file][rank];
      if (!piece) return [];

      const moves = [];
      const player = piece.player;

      for (const [df, dr] of stepDeltas(piece.type, player)) {
        const toFile = file + df;
        const toRank = rank + dr;
        if (!inBounds(toFile, toRank)) continue;

        const target = this.board[toFile][toRank];
        if (!target || target.player !== player) {
          moves.push({ from: { file, rank }, to: { file: toFile, rank: toRank } });
        }
      }

      if (piece.type === 'P') {
        const toRank = rank + forward(player);
        if (inBounds(file, toRank)) {
          const target = this.board[file][toRank];
          if (!target || target.player !== player) {
            moves.push({ from: { file, rank }, to: { file, rank: toRank } });
          }
        }
      }

      for (const [df, dr] of slideDirections(piece.type)) {
        let toFile = file + df;
        let toRank = rank + dr;

        while (inBounds(toFile, toRank)) {
          const target = this.board[toFile][toRank];
          if (!target) {
            moves.push({ from: { file, rank }, to: { file: toFile, rank: toRank } });
          } else {
            if (target.player !== player) {
              moves.push({ from: { file, rank }, to: { file: toFile, rank: toRank } });
            }
            break;
          }
          toFile += df;
          toRank += dr;
        }
      }

      return moves;
    }

    allMoves(player) {
      const moves = [];
      for (let file = 0; file < BOARD_SIZE; file++) {
        for (let rank = 0; rank < BOARD_SIZE; rank++) {
          const piece = this.board[file][rank];
          if (!piece || piece.player !== player) continue;
          moves.push(...this.movesFor(file, rank));
        }
      }
      return moves;
    }

    executeMove(move) {
      const movingPiece = this.board[move.from.file][move.from.rank];
      const target = this.board[move.to.file][move.to.rank];
      const player = movingPiece.player;
      let captured = false;
      let capturedType = null;
      let promoted = false;

      this.board[move.to.file][move.to.rank] = movingPiece;
      this.board[move.from.file][move.from.rank] = null;

      if (target) {
        captured = true;
        capturedType = target.type;
        if (target.player === WHITE) this.capturedWhite.push(target.type);
        else this.capturedBlack.push(target.type);
      }

      if (movingPiece.type === 'P' && captured) {
        this.board[move.to.file][move.to.rank] = makePiece(player, 'O');
        promoted = true;
      }

      const deaths = this._resolveEndangered(player);
      const newEndangered = this._markEndangered(player);

      const eventOccurred = captured || deaths.length > 0;
      this.movesWithoutEvent = eventOccurred ? 0 : this.movesWithoutEvent + 1;
      this.moveCount++;

      this.lastMove = { ...move, captured, capturedType, promoted };
      this.lastDeaths = deaths;
      this.lastEndangered = newEndangered;

      if (!this.isSearching) {
        const notation = this._notation(movingPiece.type, move, captured, promoted, deaths, newEndangered);
        if (player === WHITE) {
          this.moveLog.push({ num: Math.ceil(this.moveCount / 2), white: notation, black: '' });
        } else if (this.moveLog.length > 0) {
          this.moveLog[this.moveLog.length - 1].black = notation;
        }
      }

      const whiteCount = this.pieces(WHITE).length;
      const blackCount = this.pieces(BLACK).length;

      if (whiteCount === 0) {
        this.gameOver = true;
        this.winner = BLACK;
        return;
      }

      if (blackCount === 0) {
        this.gameOver = true;
        this.winner = WHITE;
        return;
      }

      this.activePlayer = opposite(player);
      this.positionHistory.push(this._hash());

      const hash = this._hash();
      const repetitions = this.positionHistory.filter(entry => entry === hash).length;
      if (repetitions >= 3 || this.movesWithoutEvent >= 100) {
        this.gameOver = true;
        this.winner = 'draw';
        return;
      }

      if (this.allMoves(this.activePlayer).length === 0) {
        this.gameOver = true;
        this.winner = opposite(this.activePlayer);
      }
    }

    _hash() {
      let hash = this.activePlayer[0];
      for (let file = 0; file < BOARD_SIZE; file++) {
        for (let rank = 0; rank < BOARD_SIZE; rank++) {
          const piece = this.board[file][rank];
          hash += piece ? (piece.player[0] + piece.type + (piece.endangered ? 'E' : '')) : '.';
        }
      }
      return hash;
    }

    _isIsolated(file, rank, player) {
      for (const [df, dr] of ALL_DIRS) {
        const nearFile = file + df;
        const nearRank = rank + dr;
        if (!inBounds(nearFile, nearRank)) continue;

        const near = this.board[nearFile][nearRank];
        if (near && near.player === player) return false;
      }
      return true;
    }

    _resolveEndangered(player) {
      const ownPieces = this.pieces(player);
      if (ownPieces.length <= 1) {
        for (const p of ownPieces) {
          if (this.board[p.file][p.rank]) this.board[p.file][p.rank].endangered = false;
        }
        return [];
      }

      const deaths = [];
      const clearMarks = [];

      for (const piece of ownPieces) {
        if (!piece.endangered) continue;
        if (this._isIsolated(piece.file, piece.rank, player)) {
          deaths.push({ file: piece.file, rank: piece.rank, type: piece.type });
        } else {
          clearMarks.push(piece);
        }
      }

      for (const piece of clearMarks) {
        if (this.board[piece.file][piece.rank]) this.board[piece.file][piece.rank].endangered = false;
      }

      for (const death of deaths) {
        const dyingPiece = this.board[death.file][death.rank];
        if (!dyingPiece) continue;

        if (dyingPiece.player === WHITE) this.capturedWhite.push(dyingPiece.type);
        else this.capturedBlack.push(dyingPiece.type);
        this.board[death.file][death.rank] = null;
      }

      return deaths;
    }

    _markEndangered(player) {
      const ownPieces = this.pieces(player);
      if (ownPieces.length <= 1) {
        for (const piece of ownPieces) {
          if (this.board[piece.file][piece.rank]) this.board[piece.file][piece.rank].endangered = false;
        }
        return [];
      }

      const marked = [];

      for (const piece of ownPieces) {
        const cell = this.board[piece.file][piece.rank];
        if (!cell) continue;

        const isolated = this._isIsolated(piece.file, piece.rank, player);
        if (isolated) {
          if (!cell.endangered) marked.push({ file: piece.file, rank: piece.rank });
          cell.endangered = true;
        } else {
          cell.endangered = false;
        }
      }

      return marked;
    }

    _notation(type, move, captured, promoted, deaths, endangered) {
      const from = coordStr(move.from.file, move.from.rank);
      const to = coordStr(move.to.file, move.to.rank);
      let notation = type + from + (captured ? 'x' : '-') + to;

      if (promoted) notation += '=O';
      for (const death of deaths) notation += ' \u2020' + coordStr(death.file, death.rank);
      for (const danger of endangered) notation += ' !' + coordStr(danger.file, danger.rank);

      return notation;
    }
  }

  class TethariAI {
    static findBestMove(game, depth) {
      const moves = game.allMoves(game.activePlayer);
      if (moves.length === 0) return null;

      game.isSearching = true;

      const maximizing = game.activePlayer === WHITE;
      let bestValue = maximizing ? -Infinity : Infinity;
      let bestMoves = [];

      this._orderMoves(game, moves);

      for (const move of moves) {
        const saved = game.saveState();
        game.executeMove(move);
        const value = this._minimax(game, depth - 1, -Infinity, Infinity, !maximizing);
        game.restoreState(saved);

        if ((maximizing && value > bestValue) || (!maximizing && value < bestValue)) {
          bestValue = value;
          bestMoves = [move];
        } else if (value === bestValue) {
          bestMoves.push(move);
        }
      }

      game.isSearching = false;
      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }

    static _minimax(game, depth, alpha, beta, maximizing) {
      if (game.gameOver) {
        if (game.winner === WHITE) return 100000 + depth;
        if (game.winner === BLACK) return -100000 - depth;
        return 0;
      }

      if (depth === 0) return this._evaluate(game);

      const moves = game.allMoves(game.activePlayer);
      if (moves.length === 0) return maximizing ? -100000 : 100000;

      this._orderMoves(game, moves);

      if (maximizing) {
        let best = -Infinity;
        for (const move of moves) {
          const saved = game.saveState();
          game.executeMove(move);
          const value = this._minimax(game, depth - 1, alpha, beta, false);
          game.restoreState(saved);

          if (value > best) best = value;
          if (value > alpha) alpha = value;
          if (beta <= alpha) break;
        }
        return best;
      }

      let best = Infinity;
      for (const move of moves) {
        const saved = game.saveState();
        game.executeMove(move);
        const value = this._minimax(game, depth - 1, alpha, beta, true);
        game.restoreState(saved);

        if (value < best) best = value;
        if (value < beta) beta = value;
        if (beta <= alpha) break;
      }
      return best;
    }

    static _orderMoves(game, moves) {
      moves.sort((a, b) => {
        const valueA = game.board[a.to.file][a.to.rank] ? MATERIAL[game.board[a.to.file][a.to.rank].type] : 0;
        const valueB = game.board[b.to.file][b.to.rank] ? MATERIAL[game.board[b.to.file][b.to.rank].type] : 0;

        if (valueA !== valueB) return valueB - valueA;

        const centerA = Math.abs(a.to.file - 2.5) + Math.abs(a.to.rank - 2.5);
        const centerB = Math.abs(b.to.file - 2.5) + Math.abs(b.to.rank - 2.5);
        return centerA - centerB;
      });
    }

    static _evaluate(game) {
      let score = 0;

      for (let file = 0; file < BOARD_SIZE; file++) {
        for (let rank = 0; rank < BOARD_SIZE; rank++) {
          const piece = game.board[file][rank];
          if (!piece) continue;

          const sign = piece.player === WHITE ? 1 : -1;
          score += sign * MATERIAL[piece.type];

          if (piece.endangered) {
            score -= sign * Math.round(MATERIAL[piece.type] * 0.4);
          }

          let neighbors = 0;
          for (const [df, dr] of ALL_DIRS) {
            const nearFile = file + df;
            const nearRank = rank + dr;
            if (!inBounds(nearFile, nearRank)) continue;
            const near = game.board[nearFile][nearRank];
            if (near && near.player === piece.player) neighbors++;
          }
          score += sign * neighbors * 25;

          if (rank >= 2 && rank <= 3) score += sign * 15;

          const advancement = piece.player === WHITE ? rank : (BOARD_SIZE - 1 - rank);
          if (advancement >= 3 && neighbors > 0) score += sign * 20;

          if (piece.type === 'P') {
            score += sign * advancement * 40;

            for (const df of [-1, 1]) {
              const sideFile = file + df;
              if (!inBounds(sideFile, rank)) continue;
              const side = game.board[sideFile][rank];
              if (side && side.player !== piece.player) score += sign * 80;
            }

            const frontRank = rank + forward(piece.player);
            if (inBounds(file, frontRank)) {
              const front = game.board[file][frontRank];
              if (front && front.player !== piece.player) score += sign * 80;
            }
          }
        }
      }

      for (const player of [WHITE, BLACK]) {
        const groups = this._countGroups(game.board, player);
        const sign = player === WHITE ? 1 : -1;
        if (groups <= 1) score += sign * 50;
        else score -= sign * (groups - 1) * 40;
      }

      return score;
    }

    static _countGroups(board, player) {
      const visited = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(false));
      let groups = 0;

      for (let file = 0; file < BOARD_SIZE; file++) {
        for (let rank = 0; rank < BOARD_SIZE; rank++) {
          if (!board[file][rank] || board[file][rank].player !== player || visited[file][rank]) continue;

          groups++;
          const queue = [{ file, rank }];
          visited[file][rank] = true;

          while (queue.length > 0) {
            const current = queue.shift();
            for (const [df, dr] of ALL_DIRS) {
              const nearFile = current.file + df;
              const nearRank = current.rank + dr;
              if (!inBounds(nearFile, nearRank) || visited[nearFile][nearRank]) continue;
              const near = board[nearFile][nearRank];
              if (!near || near.player !== player) continue;

              visited[nearFile][nearRank] = true;
              queue.push({ file: nearFile, rank: nearRank });
            }
          }
        }
      }

      return groups;
    }
  }

  class TestLabController {
    constructor(app) {
      this.app = app;
      this.scenarios = TEST_SCENARIOS;
      this.enabled = !!document.getElementById('test-lab');
      this.state = {
        scenarioId: null,
        initialSetup: null,
        moveTokens: [],
        cursor: 0,
        snapshots: [],
        errors: []
      };
    }

    init() {
      if (!this.enabled) return;

      this.els = {
        scenario: document.getElementById('test-scenario'),
        desc: document.getElementById('test-desc'),
        moves: document.getElementById('test-moves'),
        status: document.getElementById('test-status'),
        assertions: document.getElementById('test-assertions'),
        btnLoad: document.getElementById('btn-test-load'),
        btnReset: document.getElementById('btn-test-reset'),
        btnPrev: document.getElementById('btn-test-prev'),
        btnNext: document.getElementById('btn-test-next'),
        btnRun: document.getElementById('btn-test-run'),
        btnStop: document.getElementById('btn-test-stop')
      };

      this._populateScenarioSelect();
      this._syncScenarioDescription();

      this.els.scenario.addEventListener('change', () => this._syncScenarioDescription());
      this.els.btnLoad.addEventListener('click', () => this.loadSelectedScenario());
      this.els.btnReset.addEventListener('click', () => this.resetCurrentScenario());
      this.els.btnPrev.addEventListener('click', () => this.stepBack());
      this.els.btnNext.addEventListener('click', () => this.stepForward());
      this.els.btnRun.addEventListener('click', () => this.runAll());
      this.els.btnStop.addEventListener('click', () => this.exitTestMode());
    }

    _populateScenarioSelect() {
      this.els.scenario.innerHTML = '';
      for (const scenario of this.scenarios) {
        const option = document.createElement('option');
        option.value = scenario.id;
        option.textContent = scenario.name;
        this.els.scenario.appendChild(option);
      }
    }

    _syncScenarioDescription() {
      const scenario = this._scenarioById(this.els.scenario.value);
      this.els.desc.textContent = scenario ? scenario.description : '';
      this.els.moves.value = scenario ? scenario.moves.join(' ') : '';
    }

    _scenarioById(id) {
      return this.scenarios.find(scenario => scenario.id === id) || null;
    }

    isTestMode() {
      return this.enabled && this.app.mode === 'test';
    }

    tokenizeMoves(raw) {
      return raw
        .split(/[\s,;]+/)
        .map(token => token.trim())
        .filter(token => token.length > 0)
        .filter(token => !/^\d+\.{1,3}$/.test(token));
    }

    parseMoveToken(token) {
      const match = token.trim().toLowerCase().match(/^([a-f][1-6])\s*[-x:]\s*([a-f][1-6])$/);
      if (!match) return null;
      const from = parseCoord(match[1]);
      const to = parseCoord(match[2]);
      if (!from || !to) return null;
      return { from, to };
    }

    _applyScenarioSetup(scenario) {
      if (scenario.setup && scenario.setup.preset === 'default') {
        this.app.game.reset();
        return;
      }

      const pieces = scenario.setup && Array.isArray(scenario.setup.pieces) ? scenario.setup.pieces : [];
      const activePlayer = scenario.setup && scenario.setup.activePlayer ? scenario.setup.activePlayer : WHITE;
      this.app.game.loadPosition(pieces, activePlayer);
    }

    loadSelectedScenario() {
      if (!this.enabled) return;

      const scenario = this._scenarioById(this.els.scenario.value);
      if (!scenario) return;

      this.app.mode = 'test';
      this.app.aiThinking = false;
      this.app.selectedPiece = null;
      this.app.validMoves = [];
      this.app.hideGameOverOverlay();

      this._applyScenarioSetup(scenario);
      this.state.scenarioId = scenario.id;
      this.state.initialSetup = deepClone(this.app.game.saveState(true));
      this.state.moveTokens = this.tokenizeMoves(this.els.moves.value);
      this.state.cursor = 0;
      this.state.snapshots = [deepClone(this.state.initialSetup)];
      this.state.errors = [];

      this.app.renderAll();
      this.render();
    }

    resetCurrentScenario() {
      if (!this.enabled) return;
      if (!this.isTestMode() || !this.state.initialSetup) {
        this.loadSelectedScenario();
        return;
      }

      this.app.game.restoreState(deepClone(this.state.initialSetup));
      this.state.moveTokens = this.tokenizeMoves(this.els.moves.value);
      this.state.cursor = 0;
      this.state.snapshots = [deepClone(this.state.initialSetup)];
      this.state.errors = [];
      this.app.selectedPiece = null;
      this.app.validMoves = [];

      this.app.renderAll();
      this.render();
    }

    exitTestMode() {
      this.app.mode = 'play';
      this.app.selectedPiece = null;
      this.app.validMoves = [];
      this.app.renderAll();
      this.render();
    }

    stepForward() {
      if (!this.isTestMode()) return;
      this._runSingleStep(true);
    }

    stepBack() {
      if (!this.isTestMode()) return;
      if (this.state.cursor === 0) return;

      this.state.cursor--;
      const snapshot = this.state.snapshots[this.state.cursor];
      this.app.game.restoreState(deepClone(snapshot));
      this.app.selectedPiece = null;
      this.app.validMoves = [];

      this.app.renderAll();
      this.render();
    }

    runAll() {
      if (!this.isTestMode()) return;

      while (this.state.cursor < this.state.moveTokens.length && !this.app.game.gameOver) {
        if (!this._runSingleStep(false)) break;
      }

      this.app.renderAll();
      this.render();
    }

    _runSingleStep(renderAfter) {
      if (this.state.cursor >= this.state.moveTokens.length || this.app.game.gameOver) return false;

      const token = this.state.moveTokens[this.state.cursor];
      const parsed = this.parseMoveToken(token);
      if (!parsed) {
        this.state.errors.push(`Ungueltiges Zugformat bei Schritt ${this.state.cursor + 1}: ${token}`);
        if (renderAfter) this.render();
        return false;
      }

      const legalMove = this.app.game
        .movesFor(parsed.from.file, parsed.from.rank)
        .find(move => move.to.file === parsed.to.file && move.to.rank === parsed.to.rank);

      if (!legalMove) {
        const side = this.app.game.activePlayer === WHITE ? 'Weiss' : 'Schwarz';
        this.state.errors.push(`Illegaler Zug bei Schritt ${this.state.cursor + 1} (${side}): ${token}`);
        if (renderAfter) this.render();
        return false;
      }

      this.app.game.executeMove(legalMove);
      this.app.flashDeaths(this.app.game.lastDeaths);
      this.state.cursor++;
      this.state.snapshots.push(deepClone(this.app.game.saveState(true)));

      this.app.selectedPiece = null;
      this.app.validMoves = [];

      if (renderAfter) {
        this.app.renderAll();
        this.render();
      }

      return true;
    }

    evaluateAssertions() {
      const scenario = this._scenarioById(this.state.scenarioId);
      if (!scenario) return [];

      const results = [];
      for (const expected of scenario.expected || []) {
        let ok = false;
        let message = '';

        if (expected.type === 'pieceAt') {
          const coord = parseCoord(expected.square);
          const piece = coord ? this.app.game.board[coord.file][coord.rank] : null;
          ok = !!piece && piece.player === expected.player && piece.type === expected.piece;
          message = `Figur auf ${expected.square}: erwartet ${expected.player} ${expected.piece}`;
        } else if (expected.type === 'capturedCount') {
          const count = expected.player === WHITE ? this.app.game.capturedWhite.length : this.app.game.capturedBlack.length;
          ok = count === expected.count;
          message = `Verluste ${expected.player}: erwartet ${expected.count}, ist ${count}`;
        } else if (expected.type === 'activePlayer') {
          ok = this.app.game.activePlayer === expected.player;
          message = `Aktiver Spieler: erwartet ${expected.player}, ist ${this.app.game.activePlayer}`;
        } else if (expected.type === 'gameOver') {
          ok = this.app.game.gameOver === expected.value;
          message = `GameOver: erwartet ${expected.value}, ist ${this.app.game.gameOver}`;
        } else if (expected.type === 'winner') {
          ok = this.app.game.winner === expected.player;
          message = `Gewinner: erwartet ${expected.player}, ist ${this.app.game.winner}`;
        } else if (expected.type === 'pieceCount') {
          const count = this.app.game.pieces(expected.player).length;
          ok = count === expected.count;
          message = `Figurenanzahl ${expected.player}: erwartet ${expected.count}, ist ${count}`;
        }

        results.push({ ok, message });
      }

      return results;
    }

    render() {
      if (!this.enabled) return;

      const statusEl = this.els.status;
      const assertionsEl = this.els.assertions;
      if (!statusEl || !assertionsEl) return;

      if (!this.isTestMode()) {
        statusEl.textContent = 'Testmodus inaktiv';
        assertionsEl.innerHTML = '';
        return;
      }

      statusEl.textContent = `Testmodus aktiv | Zug ${this.state.cursor}/${this.state.moveTokens.length}`;
      const lines = [];

      for (const error of this.state.errors) {
        lines.push(`<div class="assert-fail">FAIL: ${error}</div>`);
      }

      const scenario = this._scenarioById(this.state.scenarioId);
      const isFinished = this.state.cursor === this.state.moveTokens.length || this.app.game.gameOver;

      if (scenario && isFinished) {
        const results = this.evaluateAssertions();
        for (const result of results) {
          const css = result.ok ? 'assert-ok' : 'assert-fail';
          const prefix = result.ok ? 'PASS' : 'FAIL';
          lines.push(`<div class="${css}">${prefix}: ${result.message}</div>`);
        }

        if (results.length === 0 && this.state.errors.length === 0) {
          lines.push('<div class="assert-ok">Keine Assertions hinterlegt.</div>');
        }
      } else if (this.state.errors.length === 0) {
        lines.push('<div>Assertions werden am Ende des Szenarios ausgewertet.</div>');
      }

      assertionsEl.innerHTML = lines.join('');
    }
  }

  class TethariApp {
    constructor() {
      this.game = new TethariGame();
      this.mode = 'play';
      this.aiDepth = 3;
      this.aiThinking = false;
      this.selectedPiece = null;
      this.validMoves = [];
      this.humanPlayer = WHITE;
      this.aiPlayer = BLACK;

      this.els = {
        board: document.getElementById('board'),
        status: document.getElementById('status'),
        moveList: document.getElementById('move-list'),
        whiteCaptured: document.getElementById('white-captured'),
        blackCaptured: document.getElementById('black-captured'),
        rankLabels: document.getElementById('rank-labels'),
        fileLabels: document.getElementById('file-labels'),
        overlay: document.getElementById('game-over-overlay'),
        overlayTitle: document.getElementById('game-over-title'),
        overlayText: document.getElementById('game-over-text'),
        btnNew: document.getElementById('btn-new'),
        btnNewOverlay: document.getElementById('btn-new-game-over'),
        difficulty: document.getElementById('difficulty'),
        helpToggle: document.getElementById('help-toggle'),
        helpPanel: document.getElementById('help-panel')
      };

      this.testLab = new TestLabController(this);
      if (this.testLab.enabled) this.mode = 'test';
    }

    init() {
      this._buildCoordinates();
      this._buildBoard();
      this._bindControls();
      this.testLab.init();
      this.newGame();
    }

    newGame() {
      this.mode = this.testLab.enabled ? 'test' : 'play';
      this.game.reset();
      this.selectedPiece = null;
      this.validMoves = [];
      this.aiThinking = false;
      this.hideGameOverOverlay();
      this.renderAll();
      this.testLab.render();
    }

    hideGameOverOverlay() {
      this.els.overlay.classList.remove('visible');
    }

    _buildCoordinates() {
      this.els.rankLabels.innerHTML = '';
      this.els.fileLabels.innerHTML = '';

      for (let index = 0; index < BOARD_SIZE; index++) {
        const rankEl = document.createElement('div');
        rankEl.className = 'rank-label';
        rankEl.textContent = BOARD_SIZE - index;
        this.els.rankLabels.appendChild(rankEl);

        const fileEl = document.createElement('div');
        fileEl.className = 'file-label';
        fileEl.textContent = FILES[index];
        this.els.fileLabels.appendChild(fileEl);
      }
    }

    _buildBoard() {
      this.els.board.innerHTML = '';

      for (let displayRank = 0; displayRank < BOARD_SIZE; displayRank++) {
        for (let file = 0; file < BOARD_SIZE; file++) {
          const rank = BOARD_SIZE - 1 - displayRank;
          const cell = document.createElement('div');
          cell.className = 'cell ' + ((displayRank + file) % 2 === 0 ? 'light' : 'dark');
          cell.dataset.file = file;
          cell.dataset.rank = rank;
          cell.addEventListener('click', () => this.onCellClick(file, rank));
          this.els.board.appendChild(cell);
        }
      }
    }

    _bindControls() {
      this.els.btnNew.addEventListener('click', () => this.newGame());
      this.els.btnNewOverlay.addEventListener('click', () => this.newGame());

      if (this.els.difficulty) {
        this.els.difficulty.addEventListener('change', event => {
          this.aiDepth = parseInt(event.target.value, 10);
        });
      }

      this.els.helpToggle.addEventListener('click', () => {
        this.els.helpPanel.classList.toggle('visible');
      });
    }

    onCellClick(file, rank) {
      if (this.mode !== 'play') return;
      if (this.game.gameOver || this.aiThinking || this.game.activePlayer !== this.humanPlayer) return;

      const matchingMove = this.validMoves.find(move => move.to.file === file && move.to.rank === rank);
      if (matchingMove) {
        this._applyHumanMove(matchingMove);
        return;
      }

      const piece = this.game.board[file][rank];
      if (piece && piece.player === this.humanPlayer) {
        this.selectedPiece = { file, rank };
        this.validMoves = this.game.movesFor(file, rank);
        this.renderBoard();
        return;
      }

      this.selectedPiece = null;
      this.validMoves = [];
      this.renderBoard();
    }

    _applyHumanMove(move) {
      this.game.executeMove(move);
      this.selectedPiece = null;
      this.validMoves = [];
      this.renderAll();
      this.flashDeaths(this.game.lastDeaths);

      if (this.game.gameOver) {
        this.showGameOver();
        return;
      }

      if (this.mode === 'play' && this.game.activePlayer === this.aiPlayer) {
        this._runAI();
      }
    }

    _runAI() {
      if (this.mode !== 'play') return;

      this.aiThinking = true;
      this.els.status.textContent = 'Computer denkt\u2026';
      this.els.status.className = 'thinking';

      setTimeout(() => {
        const bestMove = TethariAI.findBestMove(this.game, this.aiDepth);
        if (!bestMove) {
          this.game.gameOver = true;
          this.game.winner = this.humanPlayer;
          this.aiThinking = false;
          this.renderAll();
          this.showGameOver();
          return;
        }

        this._animateMove(bestMove, () => {
          this.game.executeMove(bestMove);
          this.aiThinking = false;
          this.renderAll();
          this.flashDeaths(this.game.lastDeaths);
          if (this.game.gameOver) this.showGameOver();
        });
      }, 60);
    }

    _animateMove(move, onDone) {
      const fromIndex = (BOARD_SIZE - 1 - move.from.rank) * BOARD_SIZE + move.from.file;
      const toIndex = (BOARD_SIZE - 1 - move.to.rank) * BOARD_SIZE + move.to.file;
      const fromCell = this.els.board.children[fromIndex];
      const toCell = this.els.board.children[toIndex];
      const pieceEl = fromCell.querySelector('.piece');

      if (!pieceEl) {
        onDone();
        return;
      }

      const fromRect = fromCell.getBoundingClientRect();
      const toRect = toCell.getBoundingClientRect();
      const dx = toRect.left - fromRect.left;
      const dy = toRect.top - fromRect.top;

      pieceEl.style.zIndex = '10';
      pieceEl.style.transition = 'transform 0.35s ease-in-out';
      void pieceEl.offsetWidth;
      pieceEl.style.transform = `translate(${dx}px, ${dy}px)`;

      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        onDone();
      };

      pieceEl.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, 400);
    }

    flashDeaths(deaths) {
      for (const death of deaths) {
        const index = (BOARD_SIZE - 1 - death.rank) * BOARD_SIZE + death.file;
        const cell = this.els.board.children[index];
        if (!cell) continue;

        cell.classList.add('death-flash');
        setTimeout(() => cell.classList.remove('death-flash'), 600);
      }
    }

    showGameOver() {
      if (this.game.winner === 'draw') {
        this.els.overlayTitle.textContent = 'Remis';
        this.els.overlayText.textContent = 'Die Partie endet unentschieden.';
      } else if (this.game.winner === this.humanPlayer) {
        this.els.overlayTitle.textContent = 'Sieg!';
        this.els.overlayText.textContent = 'Du hast alle gegnerischen Figuren eliminiert.';
      } else {
        this.els.overlayTitle.textContent = 'Niederlage';
        this.els.overlayText.textContent = 'Der Computer hat deine Formation zerstoert.';
      }

      this.els.overlay.classList.add('visible');
    }

    renderAll() {
      this.renderBoard();
      this.renderCaptured();
      this.renderMoveLog();
      this.renderStatus();
    }

    renderStatus() {
      this.els.status.className = '';

      if (this.mode === 'test') {
        this.els.status.textContent = `Testmodus: Zug ${this.testLab.state.cursor}/${this.testLab.state.moveTokens.length}`;
        return;
      }

      if (this.game.gameOver) {
        if (this.game.winner === 'draw') this.els.status.textContent = 'Remis!';
        else if (this.game.winner === this.humanPlayer) this.els.status.textContent = 'Du hast gewonnen!';
        else this.els.status.textContent = 'Computer gewinnt!';
        return;
      }

      this.els.status.textContent = this.game.activePlayer === this.humanPlayer
        ? 'Dein Zug (Weiss)'
        : 'Computer denkt\u2026';

      if (this.game.activePlayer === this.aiPlayer) {
        this.els.status.className = 'thinking';
      }
    }

    renderBoard() {
      this.els.board.querySelectorAll('.cell').forEach(cell => {
        const file = parseInt(cell.dataset.file, 10);
        const rank = parseInt(cell.dataset.rank, 10);
        const displayRank = BOARD_SIZE - 1 - rank;

        cell.className = 'cell ' + ((displayRank + file) % 2 === 0 ? 'light' : 'dark');

        if (this.game.lastMove) {
          if (file === this.game.lastMove.from.file && rank === this.game.lastMove.from.rank) {
            cell.classList.add('last-from');
          }
          if (file === this.game.lastMove.to.file && rank === this.game.lastMove.to.rank) {
            cell.classList.add('last-to');
          }
        }

        if (this.selectedPiece && file === this.selectedPiece.file && rank === this.selectedPiece.rank) {
          cell.classList.add('selected');
        }

        const validMove = this.validMoves.find(move => move.to.file === file && move.to.rank === rank);
        if (validMove) {
          const target = this.game.board[file][rank];
          cell.classList.add(target && target.player !== this.game.activePlayer ? 'valid-capture' : 'valid-move');
        }

        cell.innerHTML = '';
        const piece = this.game.board[file][rank];
        if (!piece) return;

        const pieceEl = document.createElement('div');
        let cssClass = `piece ${piece.player}`;
        if (piece.endangered) cssClass += ' endangered';
        pieceEl.className = cssClass;
        pieceEl.innerHTML = `${piece.type}<span class="sub">${PIECE_NAMES[piece.type].substring(0, 3).toUpperCase()}</span>`;
        pieceEl.title = PIECE_NAMES[piece.type] + (piece.endangered ? ' (angezaehlt!)' : '');
        cell.appendChild(pieceEl);
      });
    }

    renderCaptured() {
      this.els.whiteCaptured.innerHTML = '';
      this.els.blackCaptured.innerHTML = '';

      for (const type of this.game.capturedWhite) {
        const el = document.createElement('div');
        el.className = 'captured-piece white';
        el.textContent = type;
        el.title = PIECE_NAMES[type];
        this.els.whiteCaptured.appendChild(el);
      }

      for (const type of this.game.capturedBlack) {
        const el = document.createElement('div');
        el.className = 'captured-piece black';
        el.textContent = type;
        el.title = PIECE_NAMES[type];
        this.els.blackCaptured.appendChild(el);
      }
    }

    renderMoveLog() {
      this.els.moveList.innerHTML = '';

      for (const entry of this.game.moveLog) {
        const line = document.createElement('div');
        let html = `<span class="move-num">${entry.num}.</span> ${this._formatMove(entry.white)}`;
        if (entry.black) html += `  ${this._formatMove(entry.black)}`;
        line.innerHTML = html;
        this.els.moveList.appendChild(line);
      }

      this.els.moveList.scrollTop = this.els.moveList.scrollHeight;
    }

    _formatMove(text) {
      return text
        .replace(/x/g, '<span class="capture">x</span>')
        .replace(/\u2020\w+/g, '<span class="death">$&</span>')
        .replace(/!\w+/g, '<span class="endangered">$&</span>')
        .replace(/=O/g, '<span class="promotion">=O</span>');
    }
  }

  window.Tethari = {
    WHITE,
    BLACK,
    FILES,
    PIECE_NAMES,
    TEST_SCENARIOS,
    TethariGame,
    TethariAI
  };

  const app = new TethariApp();
  app.init();
})();
