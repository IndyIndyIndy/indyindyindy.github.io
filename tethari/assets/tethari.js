(() => {
  const WHITE = 'white';
  const BLACK = 'black';
  const FILES = 'abcdef';
  const BOARD_SIZE = 6;

  function detectLanguage() {
    try {
      const preferred = localStorage.getItem('tethari_lang');
      if (preferred === 'de' || preferred === 'en') return preferred;
    } catch (_error) {
      // Ignore storage access issues and fall back to browser language.
    }

    const langs = Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language || 'en'];

    for (const lang of langs) {
      if (typeof lang === 'string' && lang.toLowerCase().startsWith('de')) return 'de';
      if (typeof lang === 'string' && lang.toLowerCase().startsWith('en')) return 'en';
    }
    return 'en';
  }

  const LANG = detectLanguage();

  const I18N = {
    de: {
      titles: { game: 'Tethari - Spiel', test: 'Tethari - Test' },
      players: { white: 'Weiß', black: 'Schwarz' },
      pieceNames: { H: 'Hauptmann', W: 'Wächter', K: 'Klinge', S: 'Springer', T: 'Turm', P: 'Plänkler', B: 'Brecher' },
      chapters: {
        movement: '§6 Bewegung',
        capture: '§7 Schlagen',
        isolation: '§8 Isolation',
        promotion: '§9 Verwandlung',
        draw: '§10 Remis',
        other: 'Sonstiges'
      },
      ui: {
        capturedBlack: 'Verluste Schwarz',
        capturedWhite: 'Verluste Weiß',
        moveLog: 'Partieverlauf',
        movementPanel: 'Bewegungsgrafik',
        moveHint: 'Grafik aus Weiß-Perspektive. Bei Schwarz ist vorwärts gespiegelt.',
        btnNew: 'Neues Spiel',
        btnRules: 'Regeln',
        btnLangTitle: 'Sprache wechseln',
        difficultyTitle: 'KI-Stärke',
        difficultyLight: 'Leicht',
        difficultyMedium: 'Mittel',
        difficultyHard: 'Schwer',
        statusYourTurn: 'Dein Zug ({player})',
        statusComputerThinking: 'Computer denkt…',
        statusDraw: 'Remis!',
        statusYouWon: 'Du hast gewonnen!',
        statusComputerWon: 'Computer gewinnt!',
        overlayDrawTitle: 'Remis',
        overlayDrawText: 'Die Partie endet unentschieden.',
        overlayWinTitle: 'Sieg!',
        overlayWinText: 'Du hast alle gegnerischen Figuren eliminiert.',
        overlayLossTitle: 'Niederlage',
        overlayLossText: 'Der Computer hat deine Formation zerstört.',
        endangeredSuffix: ' (angezählt!)',
        helpGoalTitle: 'Ziel',
        helpGoalText: 'Eliminiere alle gegnerischen Figuren. Es gibt keinen König — jede Figur zählt.',
        helpIsolationTitle: 'Die Isolationsregel',
        helpIsolationText: 'Jede Figur braucht mindestens einen <b>verbündeten Nachbarn</b> auf einem der 8 angrenzenden Felder (orthogonal oder diagonal). Figuren ohne Nachbarn werden <b>angezählt</b> <span style="color:#d04040">(roter Rand)</span> und sterben, falls sie nach dem nächsten eigenen Zug noch immer allein stehen. Du hast also <b>einen Zug</b> Zeit, die Verbindung zu reparieren.',
        helpIsolationException: 'Ausnahme: Die allerletzte Figur eines Spielers kann nicht isoliert sterben.',
        helpCaptureTitle: 'Schlagen &amp; Verwandlung',
        helpCaptureText: 'Figuren schlagen, indem sie auf ein gegnerisches Feld ziehen. Schlägt ein <b>Plänkler (P)</b>, verwandelt er sich sofort in einen <b>Brecher (B)</b> — die stärkste Figur im Spiel.',
        helpPiecesTitle: 'Figuren',
        helpDrawTitle: 'Remis',
        helpDrawText: 'Dreifache Stellungswiederholung oder 50 Züge ohne Schlag/Tod.',
        testLabTitle: 'Test-Labor (Szenarien)',
        testScenarioTitle: 'Test-Szenario',
        testLoad: 'Szenario laden',
        testReset: 'Reset Szene',
        testInactive: 'Testmodus inaktiv',
        testMovesPlaceholder: 'Züge, z.B. b2-b3 e5-e4 b3xb4',
        testPrev: '← Zurück',
        testNext: 'Schritt vor',
        testRun: 'Alle Züge ausführen',
        testSuite: 'Suite ausführen',
        testStop: 'Testmodus beenden',
        testModeStatus: 'Testmodus aktiv | Zug {cursor}/{total}',
        testStatusHeader: 'Testmodus: Zug {cursor}/{total}',
        invalidMoveFormat: 'Ungültiges Zugformat bei Schritt {step}: {token}',
        illegalMove: 'Illegaler Zug bei Schritt {step} ({side}): {token}',
        assertPieceAt: 'Figur auf {square}: erwartet {player} {piece}',
        assertNoPieceAt: 'Feld {square}: erwartet leer',
        assertEndangered: 'Angezählt auf {square}: erwartet {value}',
        assertNotEndangered: 'Angezählt auf {square}: erwartet false',
        assertCapturedCount: 'Verluste {player}: erwartet {expected}, ist {actual}',
        assertActivePlayer: 'Aktiver Spieler: erwartet {expected}, ist {actual}',
        assertGameOver: 'GameOver: erwartet {expected}, ist {actual}',
        assertWinner: 'Gewinner: erwartet {expected}, ist {actual}',
        assertPieceCount: 'Figurenanzahl {player}: erwartet {expected}, ist {actual}',
        assertMovesWithoutEvent: 'movesWithoutEvent: erwartet {expected}, ist {actual}',
        assertionsPending: 'Assertions werden am Ende des Szenarios ausgewertet.',
        assertionsNone: 'Keine Assertions hinterlegt.',
        suiteNotRun: 'Suite noch nicht ausgeführt.',
        suiteSummary: 'Suite: {passed}/{total} PASS | {failed} FAIL'
      },
      moveCards: {
        H: { name: 'Hauptmann', desc: '1 Feld in alle 8 Richtungen' },
        W: { name: 'Wächter', desc: '6 Richtungen, keine diagonale Vorwärtsbewegung' },
        K: { name: 'Klinge', desc: 'Vorwärts + alle diagonalen Einzelschritte' },
        S: { name: 'Springer', desc: 'L-Sprung, kann Figuren überspringen' },
        T: { name: 'Turm', desc: 'Beliebig weit orthogonal' },
        P: { name: 'Plänkler', desc: '1 Feld vorwärts oder seitwärts gleiten' },
        B: { name: 'Brecher', desc: 'Orthogonal weit + diagonal 1 Feld' }
      },
      helpPieces: [
        { name: 'H – Hauptmann (x1)', desc: '1 Feld, alle 8 Richtungen.' },
        { name: 'W – Wächter (x2)', desc: '1 Feld, 6 Richtungen (nicht diag. vorwärts).' },
        { name: 'K – Klinge (x2)', desc: '1 Feld: vorwärts + alle 4 Diagonalen.' },
        { name: 'S – Springer (x1)', desc: 'L-Sprung (wie im Schach), überspringt Figuren.' },
        { name: 'T – Turm (x1)', desc: 'Gleitet beliebig weit orthogonal.' },
        { name: 'P – Plänkler (x2)', desc: '1 Feld vor ODER beliebig weit seitwärts. Wird zum Brecher bei Schlag!' },
        { name: 'B – Brecher', desc: 'Beliebig weit orthogonal + 1 Feld diagonal. Entsteht nur durch Verwandlung.' }
      ]
    },
    en: {
      titles: { game: 'Tethari - Game', test: 'Tethari - Test' },
      players: { white: 'White', black: 'Black' },
      pieceNames: { H: 'Captain', W: 'Warden', K: 'Blade', S: 'Knight', T: 'Rook', P: 'Skirmisher', B: 'Breaker' },
      chapters: {
        movement: '§6 Movement',
        capture: '§7 Capturing',
        isolation: '§8 Isolation',
        promotion: '§9 Promotion',
        draw: '§10 Draw',
        other: 'Other'
      },
      ui: {
        capturedBlack: 'Black Losses',
        capturedWhite: 'White Losses',
        moveLog: 'Move Log',
        movementPanel: 'Movement Reference',
        moveHint: 'Diagram from White perspective. For Black, forward is mirrored.',
        btnNew: 'New Game',
        btnRules: 'Rules',
        btnLangTitle: 'Switch language',
        difficultyTitle: 'AI strength',
        difficultyLight: 'Easy',
        difficultyMedium: 'Medium',
        difficultyHard: 'Hard',
        statusYourTurn: 'Your turn ({player})',
        statusComputerThinking: 'Computer is thinking…',
        statusDraw: 'Draw!',
        statusYouWon: 'You won!',
        statusComputerWon: 'Computer wins!',
        overlayDrawTitle: 'Draw',
        overlayDrawText: 'The game ends in a draw.',
        overlayWinTitle: 'Victory!',
        overlayWinText: 'You eliminated all opposing pieces.',
        overlayLossTitle: 'Defeat',
        overlayLossText: 'The computer broke your formation.',
        endangeredSuffix: ' (endangered!)',
        helpGoalTitle: 'Goal',
        helpGoalText: 'Eliminate all opposing pieces. There is no king — every piece counts.',
        helpIsolationTitle: 'Isolation Rule',
        helpIsolationText: 'Every piece needs at least one <b>allied neighbor</b> on one of the 8 adjacent squares (orthogonal or diagonal). Pieces without neighbors become <b>endangered</b> <span style="color:#d04040">(red border)</span> and die if they are still isolated after their next own move. So you have <b>one move</b> to reconnect.',
        helpIsolationException: 'Exception: A player’s very last remaining piece cannot die from isolation.',
        helpCaptureTitle: 'Capture &amp; Promotion',
        helpCaptureText: 'Pieces capture by moving onto an enemy square. If a <b>Skirmisher (P)</b> captures, it is immediately promoted to a <b>Breaker (B)</b> — the strongest piece in the game.',
        helpPiecesTitle: 'Pieces',
        helpDrawTitle: 'Draw',
        helpDrawText: 'Threefold repetition or 50 moves without capture/death.',
        testLabTitle: 'Test Lab (Scenarios)',
        testScenarioTitle: 'Test scenario',
        testLoad: 'Load scenario',
        testReset: 'Reset scene',
        testInactive: 'Test mode inactive',
        testMovesPlaceholder: 'Moves, e.g. b2-b3 e5-e4 b3xb4',
        testPrev: '← Back',
        testNext: 'Next step',
        testRun: 'Run all moves',
        testSuite: 'Run suite',
        testStop: 'Exit test mode',
        testModeStatus: 'Test mode active | Move {cursor}/{total}',
        testStatusHeader: 'Test mode: Move {cursor}/{total}',
        invalidMoveFormat: 'Invalid move format at step {step}: {token}',
        illegalMove: 'Illegal move at step {step} ({side}): {token}',
        assertPieceAt: 'Piece at {square}: expected {player} {piece}',
        assertNoPieceAt: 'Square {square}: expected empty',
        assertEndangered: 'Endangered at {square}: expected {value}',
        assertNotEndangered: 'Endangered at {square}: expected false',
        assertCapturedCount: 'Captured {player}: expected {expected}, got {actual}',
        assertActivePlayer: 'Active player: expected {expected}, got {actual}',
        assertGameOver: 'GameOver: expected {expected}, got {actual}',
        assertWinner: 'Winner: expected {expected}, got {actual}',
        assertPieceCount: 'Piece count {player}: expected {expected}, got {actual}',
        assertMovesWithoutEvent: 'movesWithoutEvent: expected {expected}, got {actual}',
        assertionsPending: 'Assertions are evaluated at the end of the scenario.',
        assertionsNone: 'No assertions defined.',
        suiteNotRun: 'Suite not run yet.',
        suiteSummary: 'Suite: {passed}/{total} PASS | {failed} FAIL'
      },
      moveCards: {
        H: { name: 'Captain', desc: '1 step in all 8 directions' },
        W: { name: 'Warden', desc: '6 directions, no forward diagonals' },
        K: { name: 'Blade', desc: 'Forward + all diagonal single steps' },
        S: { name: 'Knight', desc: 'L-jump, can jump over pieces' },
        T: { name: 'Rook', desc: 'Slides orthogonally any distance' },
        P: { name: 'Skirmisher', desc: '1 step forward or sideways slide' },
        B: { name: 'Breaker', desc: 'Orthogonal slide + 1-step diagonal' }
      },
      helpPieces: [
        { name: 'H – Captain (x1)', desc: '1 step, all 8 directions.' },
        { name: 'W – Warden (x2)', desc: '1 step, 6 directions (no forward diagonals).' },
        { name: 'K – Blade (x2)', desc: '1 step: forward + all 4 diagonals.' },
        { name: 'S – Knight (x1)', desc: 'L-jump (as in chess), jumps over pieces.' },
        { name: 'T – Rook (x1)', desc: 'Slides orthogonally any distance.' },
        { name: 'P – Skirmisher (x2)', desc: '1 step forward OR sideways slide. Promotes to Breaker on capture!' },
        { name: 'B – Breaker', desc: 'Orthogonal slide any distance + 1-step diagonal. Created only by promotion.' }
      ]
    }
  };

  function t(path, values = null) {
    const parts = path.split('.');
    let node = I18N[LANG];
    for (const part of parts) node = node && node[part];
    let text = typeof node === 'string' ? node : path;
    if (!values) return text;
    for (const [key, value] of Object.entries(values)) {
      text = text.replaceAll(`{${key}}`, String(value));
    }
    return text;
  }

  function playerLabel(player) {
    return player === WHITE ? t('players.white') : t('players.black');
  }

  const PIECE_NAMES = I18N[LANG].pieceNames;

  const TEST_SCENARIO_EN = {
    move_hauptmann_diagonal: { name: 'Movement: Captain diagonal', description: 'Captain moves 1 square diagonally and stays connected.' },
    move_waechter_back_diagonal: { name: 'Movement: Warden backward diagonal', description: 'Warden uses the allowed backward-diagonal movement.' },
    move_klinge_forward_diagonal: { name: 'Movement: Blade forward diagonal', description: 'Blade moves diagonally forward as defined in the rules.' },
    move_springer_jump: { name: 'Movement: Knight jumps over piece', description: 'Knight jumps over occupied squares and lands legally in an L-shape.' },
    move_turm_slide: { name: 'Movement: Rook orthogonal slide', description: 'Rook slides multiple squares orthogonally to an empty square.' },
    move_plaenkler_side_glide: { name: 'Movement: Skirmisher sideways slide', description: 'Skirmisher can slide any distance sideways.' },
    move_brecher_diagonal: { name: 'Movement: Breaker 1-step diagonal', description: 'Breaker can move 1 square diagonally.' },
    capture_standard: { name: 'Capture: Standard capture', description: 'Standard capture removes the enemy piece without promotion.' },
    promotion_brecher: { name: 'Promotion: Skirmisher -> Breaker', description: 'Verifies that a capturing Skirmisher is immediately promoted to Breaker.' },
    isolation_mark_only: { name: 'Isolation: mark only, no immediate death', description: 'Newly isolated pieces are first only marked as endangered.' },
    isolation_rescue_clears: { name: 'Isolation: rescue clears endangered', description: 'Endangered piece survives when reconnected in time.' },
    isolation_death_unresolved: { name: 'Isolation: unresolved piece dies next own turn', description: 'Endangered piece dies if formation is not repaired.' },
    last_man_rule: { name: 'Isolation: last-man exception', description: 'A single remaining piece is not marked endangered.' },
    double_isolation_death: { name: 'Isolation: double death', description: 'Two endangered isolated pieces die simultaneously.' },
    threefold_repetition: { name: 'Draw: threefold repetition', description: 'Position repeats three times and ends in a draw.' },
    fifty_move_rule_threshold: { name: 'Draw: 50-move threshold', description: 'With movesWithoutEvent = 99, one quiet move immediately triggers a draw.' }
  };

  function scenarioLabel(scenario, key) {
    if (LANG !== 'en') return scenario[key];
    const override = TEST_SCENARIO_EN[scenario.id];
    if (!override || !override[key]) return scenario[key];
    return override[key];
  }

  const MATERIAL = {
    P: 150,
    K: 280,
    W: 320,
    H: 380,
    S: 450,
    T: 500,
    B: 750
  };

  const ALL_DIRS = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  const TEST_SCENARIOS = [
    {
      id: 'move_hauptmann_diagonal',
      name: 'Bewegung: Hauptmann diagonal',
      description: 'Hauptmann zieht 1 Feld diagonal und bleibt verbunden.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'c3', player: WHITE, type: 'H' },
          { square: 'c4', player: WHITE, type: 'W' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['c3-d4', 'e5-e4'],
      expected: [
        { type: 'pieceAt', square: 'd4', player: WHITE, piece: 'H' },
        { type: 'noPieceAt', square: 'c3' },
        { type: 'activePlayer', player: WHITE }
      ]
    },
    {
      id: 'move_waechter_back_diagonal',
      name: 'Bewegung: Wächter rückwärts-diagonal',
      description: 'Wächter nutzt die erlaubte diagonal-rückwärts Bewegung.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'c3', player: WHITE, type: 'W' },
          { square: 'c2', player: WHITE, type: 'H' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['c3-b2', 'e5-e4'],
      expected: [
        { type: 'pieceAt', square: 'b2', player: WHITE, piece: 'W' },
        { type: 'noPieceAt', square: 'c3' },
        { type: 'activePlayer', player: WHITE }
      ]
    },
    {
      id: 'move_klinge_forward_diagonal',
      name: 'Bewegung: Klinge diagonal-vorwärts',
      description: 'Klinge zieht diagonal-vorwärts wie im Regelwerk beschrieben.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'c3', player: WHITE, type: 'K' },
          { square: 'c4', player: WHITE, type: 'H' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['c3-d4', 'e5-e4'],
      expected: [
        { type: 'pieceAt', square: 'd4', player: WHITE, piece: 'K' },
        { type: 'noPieceAt', square: 'c3' },
        { type: 'activePlayer', player: WHITE }
      ]
    },
    {
      id: 'move_springer_jump',
      name: 'Bewegung: Springer springt über Figur',
      description: 'Springer überspringt belegte Felder und landet legal im L-Sprung.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'b2', player: WHITE, type: 'S' },
          { square: 'b3', player: WHITE, type: 'W' },
          { square: 'c4', player: WHITE, type: 'H' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['b2-d3', 'e5-e4'],
      expected: [
        { type: 'pieceAt', square: 'd3', player: WHITE, piece: 'S' },
        { type: 'pieceAt', square: 'b3', player: WHITE, piece: 'W' },
        { type: 'noPieceAt', square: 'b2' }
      ]
    },
    {
      id: 'move_turm_slide',
      name: 'Bewegung: Turm gleitet orthogonal',
      description: 'Turm gleitet mehrere Felder orthogonal auf ein freies Feld.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'a3', player: WHITE, type: 'T' },
          { square: 'b4', player: WHITE, type: 'H' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['a3-a5', 'e5-e4'],
      expected: [
        { type: 'pieceAt', square: 'a5', player: WHITE, piece: 'T' },
        { type: 'noPieceAt', square: 'a3' }
      ]
    },
    {
      id: 'move_plaenkler_side_glide',
      name: 'Bewegung: Plänkler seitwärts',
      description: 'Plänkler kann seitwärts beliebig weit gleiten.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'b3', player: WHITE, type: 'P' },
          { square: 'd4', player: WHITE, type: 'H' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['b3-e3', 'e5-e4'],
      expected: [
        { type: 'pieceAt', square: 'e3', player: WHITE, piece: 'P' },
        { type: 'noPieceAt', square: 'b3' }
      ]
    },
    {
      id: 'move_brecher_diagonal',
      name: 'Bewegung: Brecher diagonal 1 Feld',
      description: 'Brecher kann 1 Feld diagonal ziehen.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'c3', player: WHITE, type: 'B' },
          { square: 'c4', player: WHITE, type: 'H' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['c3-d4', 'e5-e4'],
      expected: [
        { type: 'pieceAt', square: 'd4', player: WHITE, piece: 'B' },
        { type: 'noPieceAt', square: 'c3' }
      ]
    },
    {
      id: 'capture_standard',
      name: 'Schlagen: Standard-Schlag',
      description: 'Normales Schlagen entfernt die gegnerische Figur ohne Verwandlung.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'c3', player: WHITE, type: 'H' },
          { square: 'c4', player: WHITE, type: 'W' },
          { square: 'd4', player: BLACK, type: 'K' },
          { square: 'e5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['c3xd4', 'e5-d5'],
      expected: [
        { type: 'pieceAt', square: 'd4', player: WHITE, piece: 'H' },
        { type: 'noPieceAt', square: 'c3' },
        { type: 'capturedCount', player: BLACK, count: 1 }
      ]
    },
    {
      id: 'promotion_brecher',
      name: 'Promotion: Plänkler -> Brecher',
      description: 'Prüft, dass ein schlagender Plänkler sofort zu Brecher wird.',
      setup: { preset: 'default' },
      moves: ['b2-b3', 'b5-b4', 'b3xb4'],
      expected: [
        { type: 'pieceAt', square: 'b4', player: WHITE, piece: 'B' },
        { type: 'capturedCount', player: BLACK, count: 1 },
        { type: 'activePlayer', player: BLACK }
      ]
    },
    {
      id: 'isolation_mark_only',
      name: 'Isolation: Markierung ohne Soforttod',
      description: 'Neu isolierte Figuren werden zuerst nur angezählt.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'c3', player: WHITE, type: 'T' },
          { square: 'c4', player: WHITE, type: 'W' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['c3-f3', 'e5-e4'],
      expected: [
        { type: 'pieceAt', square: 'f3', player: WHITE, piece: 'T' },
        { type: 'pieceAt', square: 'c4', player: WHITE, piece: 'W' },
        { type: 'endangeredAt', square: 'f3', value: true },
        { type: 'endangeredAt', square: 'c4', value: true },
        { type: 'capturedCount', player: WHITE, count: 0 }
      ]
    },
    {
      id: 'isolation_rescue_clears',
      name: 'Isolation: Rettung hebt Angezählt auf',
      description: 'Angezählte Figur überlebt bei rechtzeitiger Wiederanbindung.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'c3', player: WHITE, type: 'T' },
          { square: 'c4', player: WHITE, type: 'H' },
          { square: 'd4', player: WHITE, type: 'W' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['c3-f3', 'e5-e4', 'd4-e3'],
      expected: [
        { type: 'pieceAt', square: 'f3', player: WHITE, piece: 'T' },
        { type: 'notEndangeredAt', square: 'f3' },
        { type: 'capturedCount', player: WHITE, count: 0 }
      ]
    },
    {
      id: 'isolation_death_unresolved',
      name: 'Isolation: Ungerettet stirbt nächsten Eigenzug',
      description: 'Angezählte Figur stirbt, wenn die Formation nicht repariert wird.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'c3', player: WHITE, type: 'T' },
          { square: 'c4', player: WHITE, type: 'H' },
          { square: 'd4', player: WHITE, type: 'W' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['c3-f3', 'e5-e4', 'c4-c5'],
      expected: [
        { type: 'noPieceAt', square: 'f3' },
        { type: 'capturedCount', player: WHITE, count: 1 },
        { type: 'pieceCount', player: WHITE, count: 2 }
      ]
    },
    {
      id: 'last_man_rule',
      name: 'Isolation: Letzter Mann Ausnahme',
      description: 'Eine einzelne verbleibende Figur wird nicht angezählt.',
      setup: {
        activePlayer: WHITE,
        pieces: [
          { square: 'c3', player: WHITE, type: 'H' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['c3-c4', 'e5-e4', 'c4-c5'],
      expected: [
        { type: 'pieceAt', square: 'c5', player: WHITE, piece: 'H' },
        { type: 'notEndangeredAt', square: 'c5' },
        { type: 'gameOver', value: false }
      ]
    },
    {
      id: 'double_isolation_death',
      name: 'Isolation: Doppelter Tod',
      description: 'Zwei angezählte Figuren bleiben isoliert und sterben simultan.',
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
    },
    {
      id: 'fifty_move_rule_threshold',
      name: 'Remis: 50-Zug-Regel Schwelle',
      description: 'Bei movesWithoutEvent = 99 führt ein ruhiger Zug sofort zum Remis.',
      setup: {
        activePlayer: WHITE,
        movesWithoutEvent: 99,
        pieces: [
          { square: 'c3', player: WHITE, type: 'H' },
          { square: 'c4', player: WHITE, type: 'W' },
          { square: 'e5', player: BLACK, type: 'H' },
          { square: 'f5', player: BLACK, type: 'W' }
        ]
      },
      moves: ['c3-d3'],
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
      case 'B':
        return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      default:
        return [];
    }
  }

  function slideDirections(type) {
    switch (type) {
      case 'T':
      case 'B':
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
        this.board[move.to.file][move.to.rank] = makePiece(player, 'B');
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
      this.scenarios = TEST_SCENARIOS.map(scenario => ({ ...scenario, chapter: this._chapterForScenario(scenario) }));
      this.enabled = !!document.getElementById('test-lab');
      this.chapterOrder = ['movement', 'capture', 'isolation', 'promotion', 'draw', 'other'];
      this.state = {
        scenarioId: null,
        initialSetup: null,
        moveTokens: [],
        cursor: 0,
        snapshots: [],
        errors: [],
        suiteResults: {}
      };
    }

    _chapterForScenario(scenario) {
      const id = scenario.id || '';
      if (id.startsWith('move_')) return 'movement';
      if (id === 'capture_standard') return 'capture';
      if (id.includes('isolation') || id === 'last_man_rule') return 'isolation';
      if (id.includes('promotion')) return 'promotion';
      if (id.includes('repetition') || id.includes('fifty_move')) return 'draw';
      return 'other';
    }

    init() {
      if (!this.enabled) return;

      this.els = {
        scenario: document.getElementById('test-scenario'),
        desc: document.getElementById('test-desc'),
        moves: document.getElementById('test-moves'),
        status: document.getElementById('test-status'),
        assertions: document.getElementById('test-assertions'),
        summary: document.getElementById('test-summary'),
        btnLoad: document.getElementById('btn-test-load'),
        btnReset: document.getElementById('btn-test-reset'),
        btnPrev: document.getElementById('btn-test-prev'),
        btnNext: document.getElementById('btn-test-next'),
        btnRun: document.getElementById('btn-test-run'),
        btnSuite: document.getElementById('btn-test-suite'),
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
      if (this.els.btnSuite) this.els.btnSuite.addEventListener('click', () => this.runSuite());
      this.els.btnStop.addEventListener('click', () => this.exitTestMode());
    }

    _populateScenarioSelect() {
      this.els.scenario.innerHTML = '';
      for (const chapter of this.chapterOrder) {
        const chapterScenarios = this.scenarios.filter(scenario => scenario.chapter === chapter);
        if (chapterScenarios.length === 0) continue;

        const group = document.createElement('optgroup');
        group.label = t(`chapters.${chapter}`);

        for (const scenario of chapterScenarios) {
          const option = document.createElement('option');
          option.value = scenario.id;
          option.textContent = scenarioLabel(scenario, 'name');
          group.appendChild(option);
        }

        this.els.scenario.appendChild(group);
      }
    }

    _syncScenarioDescription() {
      const scenario = this._scenarioById(this.els.scenario.value);
      this.els.desc.textContent = scenario ? scenarioLabel(scenario, 'description') : '';
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

    _applyScenarioSetupToGame(game, scenario) {
      if (scenario.setup && scenario.setup.preset === 'default') {
        game.reset();
        return;
      }

      const pieces = scenario.setup && Array.isArray(scenario.setup.pieces) ? scenario.setup.pieces : [];
      const activePlayer = scenario.setup && scenario.setup.activePlayer ? scenario.setup.activePlayer : WHITE;
      game.loadPosition(pieces, activePlayer);

      if (scenario.setup && Number.isInteger(scenario.setup.movesWithoutEvent)) {
        game.movesWithoutEvent = scenario.setup.movesWithoutEvent;
      }
      if (scenario.setup && Number.isInteger(scenario.setup.moveCount)) {
        game.moveCount = scenario.setup.moveCount;
      }
      if (scenario.setup && Array.isArray(scenario.setup.positionHistory)) {
        game.positionHistory = [...scenario.setup.positionHistory];
      }
    }

    _applyScenarioSetup(scenario) {
      this._applyScenarioSetupToGame(this.app.game, scenario);
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
      this.state.suiteResults[scenario.id] = null;

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
      if (this.state.scenarioId) this.state.suiteResults[this.state.scenarioId] = null;
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
      if (this.state.scenarioId) this.state.suiteResults[this.state.scenarioId] = null;
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

      this._finalizeCurrentScenario();
      this.app.renderAll();
      this.render();
    }

    _runSingleStep(renderAfter) {
      if (this.state.cursor >= this.state.moveTokens.length || this.app.game.gameOver) return false;

      const token = this.state.moveTokens[this.state.cursor];
      const parsed = this.parseMoveToken(token);
      if (!parsed) {
        this.state.errors.push(t('ui.invalidMoveFormat', { step: this.state.cursor + 1, token }));
        if (renderAfter) this.render();
        return false;
      }

      const legalMove = this.app.game
        .movesFor(parsed.from.file, parsed.from.rank)
        .find(move => move.to.file === parsed.to.file && move.to.rank === parsed.to.rank);

      if (!legalMove) {
        const side = playerLabel(this.app.game.activePlayer);
        this.state.errors.push(t('ui.illegalMove', { step: this.state.cursor + 1, side, token }));
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
        this._finalizeCurrentScenario();
        this.app.renderAll();
        this.render();
      }

      return true;
    }

    _evaluateScenarioAssertions(scenario, game) {
      if (!scenario) return [];
      const results = [];
      for (const expected of scenario.expected || []) {
        let ok = false;
        let message = '';

        if (expected.type === 'pieceAt') {
          const coord = parseCoord(expected.square);
          const piece = coord ? game.board[coord.file][coord.rank] : null;
          ok = !!piece && piece.player === expected.player && piece.type === expected.piece;
          message = t('ui.assertPieceAt', {
            square: expected.square,
            player: playerLabel(expected.player),
            piece: PIECE_NAMES[expected.piece]
          });
        } else if (expected.type === 'noPieceAt') {
          const coord = parseCoord(expected.square);
          const piece = coord ? game.board[coord.file][coord.rank] : null;
          ok = !piece;
          message = t('ui.assertNoPieceAt', { square: expected.square });
        } else if (expected.type === 'endangeredAt') {
          const coord = parseCoord(expected.square);
          const piece = coord ? game.board[coord.file][coord.rank] : null;
          ok = !!piece && piece.endangered === expected.value;
          message = t('ui.assertEndangered', { square: expected.square, value: expected.value });
        } else if (expected.type === 'notEndangeredAt') {
          const coord = parseCoord(expected.square);
          const piece = coord ? game.board[coord.file][coord.rank] : null;
          ok = !!piece && piece.endangered === false;
          message = t('ui.assertNotEndangered', { square: expected.square });
        } else if (expected.type === 'capturedCount') {
          const count = expected.player === WHITE ? game.capturedWhite.length : game.capturedBlack.length;
          ok = count === expected.count;
          message = t('ui.assertCapturedCount', {
            player: playerLabel(expected.player),
            expected: expected.count,
            actual: count
          });
        } else if (expected.type === 'activePlayer') {
          ok = game.activePlayer === expected.player;
          message = t('ui.assertActivePlayer', {
            expected: playerLabel(expected.player),
            actual: playerLabel(game.activePlayer)
          });
        } else if (expected.type === 'gameOver') {
          ok = game.gameOver === expected.value;
          message = t('ui.assertGameOver', { expected: expected.value, actual: game.gameOver });
        } else if (expected.type === 'winner') {
          ok = game.winner === expected.player;
          message = t('ui.assertWinner', {
            expected: expected.player === 'draw' ? t('ui.overlayDrawTitle') : playerLabel(expected.player),
            actual: game.winner === 'draw' ? t('ui.overlayDrawTitle') : playerLabel(game.winner)
          });
        } else if (expected.type === 'pieceCount') {
          const count = game.pieces(expected.player).length;
          ok = count === expected.count;
          message = t('ui.assertPieceCount', {
            player: playerLabel(expected.player),
            expected: expected.count,
            actual: count
          });
        } else if (expected.type === 'movesWithoutEvent') {
          ok = game.movesWithoutEvent === expected.value;
          message = t('ui.assertMovesWithoutEvent', { expected: expected.value, actual: game.movesWithoutEvent });
        }

        results.push({ ok, message });
      }

      return results;
    }

    evaluateAssertions() {
      const scenario = this._scenarioById(this.state.scenarioId);
      return this._evaluateScenarioAssertions(scenario, this.app.game);
    }

    _setScenarioResult(scenarioId, errors, assertionResults) {
      const failures = assertionResults.filter(result => !result.ok).length + errors.length;
      this.state.suiteResults[scenarioId] = {
        total: assertionResults.length + errors.length,
        passed: failures === 0,
        failures
      };
    }

    _finalizeCurrentScenario() {
      const scenario = this._scenarioById(this.state.scenarioId);
      if (!scenario) return;

      const isFinished = this.state.cursor === this.state.moveTokens.length || this.app.game.gameOver;
      if (!isFinished) return;

      const assertions = this.evaluateAssertions();
      this._setScenarioResult(scenario.id, [...this.state.errors], assertions);
    }

    runSuite() {
      if (!this.enabled) return;

      for (const scenario of this.scenarios) {
        const game = new TethariGame();
        this._applyScenarioSetupToGame(game, scenario);

        const errors = [];
        const tokens = this.tokenizeMoves(Array.isArray(scenario.moves) ? scenario.moves.join(' ') : '');

        for (let i = 0; i < tokens.length && !game.gameOver; i++) {
          const token = tokens[i];
          const parsed = this.parseMoveToken(token);
          if (!parsed) {
            errors.push(t('ui.invalidMoveFormat', { step: i + 1, token }));
            break;
          }

          const legalMove = game
            .movesFor(parsed.from.file, parsed.from.rank)
            .find(move => move.to.file === parsed.to.file && move.to.rank === parsed.to.rank);

          if (!legalMove) {
            const side = playerLabel(game.activePlayer);
            errors.push(t('ui.illegalMove', { step: i + 1, side, token }));
            break;
          }

          game.executeMove(legalMove);
        }

        const assertions = this._evaluateScenarioAssertions(scenario, game);
        this._setScenarioResult(scenario.id, errors, assertions);
      }

      this.render();
    }

    render() {
      if (!this.enabled) return;

      const statusEl = this.els.status;
      const assertionsEl = this.els.assertions;
      if (!statusEl || !assertionsEl) return;

      if (!this.isTestMode()) {
        statusEl.textContent = t('ui.testInactive');
        assertionsEl.innerHTML = '';
        if (this.els.summary) this.els.summary.innerHTML = '';
        return;
      }

      statusEl.textContent = t('ui.testModeStatus', { cursor: this.state.cursor, total: this.state.moveTokens.length });
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
          lines.push(`<div class="assert-ok">${t('ui.assertionsNone')}</div>`);
        }
      } else if (this.state.errors.length === 0) {
        lines.push(`<div>${t('ui.assertionsPending')}</div>`);
      }

      assertionsEl.innerHTML = lines.join('');

      if (!this.els.summary) return;

      const finished = this.scenarios
        .map(scenario => this.state.suiteResults[scenario.id])
        .filter(result => !!result);

      if (finished.length === 0) {
        this.els.summary.innerHTML = `<div class="summary-hint">${t('ui.suiteNotRun')}</div>`;
        return;
      }

      const passedTotal = finished.filter(result => result.passed).length;
      const failedTotal = finished.length - passedTotal;
      const headerCss = failedTotal === 0 ? 'summary-ok' : 'summary-fail';
      const summaryLines = [
        `<div class="${headerCss}">${t('ui.suiteSummary', { passed: passedTotal, total: finished.length, failed: failedTotal })}</div>`
      ];

      for (const chapter of this.chapterOrder) {
        const chapterScenarios = this.scenarios.filter(scenario => scenario.chapter === chapter);
        const chapterResults = chapterScenarios
          .map(scenario => this.state.suiteResults[scenario.id])
          .filter(result => !!result);
        if (chapterResults.length === 0) continue;

        const chapterPass = chapterResults.filter(result => result.passed).length;
        const chapterFail = chapterResults.length - chapterPass;
        const chapterCss = chapterFail === 0 ? 'summary-ok' : 'summary-fail';
        summaryLines.push(
          `<div class="summary-line"><span>${t(`chapters.${chapter}`)}</span><span class="${chapterCss}">${chapterPass}/${chapterResults.length} PASS${chapterFail > 0 ? ` | ${chapterFail} FAIL` : ''}</span></div>`
        );
      }

      this.els.summary.innerHTML = summaryLines.join('');
    }
  }

  class TethariApp {
    constructor() {
      this.game = new TethariGame();
      this.lang = LANG;
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
        btnLang: document.getElementById('btn-lang'),
        difficulty: document.getElementById('difficulty'),
        helpToggle: document.getElementById('help-toggle'),
        helpPanel: document.getElementById('help-panel')
      };

      this.testLab = new TestLabController(this);
      if (this.testLab.enabled) this.mode = 'test';
    }

    init() {
      this.localizeStaticUI();
      this._buildCoordinates();
      this._buildBoard();
      this._bindControls();
      this.testLab.init();
      this.newGame();
    }

    localizeStaticUI() {
      document.documentElement.lang = this.lang;
      document.title = this.testLab.enabled ? t('titles.test') : t('titles.game');

      const setText = (selector, value) => {
        const el = document.querySelector(selector);
        if (el) el.textContent = value;
      };
      const setHtml = (selector, value) => {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = value;
      };
      const setAttr = (selector, attr, value) => {
        const el = document.querySelector(selector);
        if (el) el.setAttribute(attr, value);
      };

      setText('main .sidebar:first-child .captured-area h3', t('ui.capturedBlack'));
      setText('main .sidebar:last-child .captured-area h3', t('ui.capturedWhite'));
      setText('#move-log h3', t('ui.moveLog'));
      setText('.movement-panel > h3', t('ui.movementPanel'));
      setText('#btn-new', t('ui.btnNew'));
      setText('#btn-new-game-over', t('ui.btnNew'));
      setText('#help-toggle', t('ui.btnRules'));
      setText('#btn-lang', this.lang === 'de' ? 'EN' : 'DE');
      setAttr('#btn-lang', 'title', t('ui.btnLangTitle'));
      setAttr('#difficulty', 'title', t('ui.difficultyTitle'));
      setText('#difficulty option[value="2"]', t('ui.difficultyLight'));
      setText('#difficulty option[value="3"]', t('ui.difficultyMedium'));
      setText('#difficulty option[value="4"]', t('ui.difficultyHard'));

      const cardCodes = ['H', 'W', 'K', 'S', 'T', 'P', 'B'];
      const moveCards = document.querySelectorAll('.movement-panel .move-card');
      moveCards.forEach((card, index) => {
        const code = cardCodes[index];
        if (!code) return;
        const name = card.querySelector('.move-name');
        const desc = card.querySelector('.move-desc');
        if (name) name.textContent = I18N[this.lang].moveCards[code].name;
        if (desc) desc.textContent = I18N[this.lang].moveCards[code].desc;
      });
      setText('.move-hint', t('ui.moveHint'));

      const helpHeadings = document.querySelectorAll('#help-panel > h3');
      if (helpHeadings[0]) helpHeadings[0].textContent = t('ui.helpGoalTitle');
      if (helpHeadings[1]) helpHeadings[1].textContent = t('ui.helpIsolationTitle');
      if (helpHeadings[2]) helpHeadings[2].innerHTML = t('ui.helpCaptureTitle');
      if (helpHeadings[3]) helpHeadings[3].textContent = t('ui.helpPiecesTitle');
      if (helpHeadings[4]) helpHeadings[4].textContent = t('ui.helpDrawTitle');

      const helpParagraphs = document.querySelectorAll('#help-panel > p');
      if (helpParagraphs[0]) helpParagraphs[0].innerHTML = t('ui.helpGoalText');
      if (helpParagraphs[1]) helpParagraphs[1].innerHTML = t('ui.helpIsolationText');
      if (helpParagraphs[2]) helpParagraphs[2].innerHTML = t('ui.helpIsolationException');
      if (helpParagraphs[3]) helpParagraphs[3].innerHTML = t('ui.helpCaptureText');
      if (helpParagraphs[4]) helpParagraphs[4].innerHTML = t('ui.helpDrawText');

      const pieceRows = document.querySelectorAll('#help-panel .piece-help .piece-info');
      pieceRows.forEach((row, index) => {
        const model = I18N[this.lang].helpPieces[index];
        if (!model) return;
        const name = row.querySelector('.name');
        const desc = row.querySelector('.desc');
        if (name) name.textContent = model.name;
        if (desc) desc.textContent = model.desc;
      });

      setText('#test-lab h3', t('ui.testLabTitle'));
      setText('#btn-test-load', t('ui.testLoad'));
      setText('#btn-test-reset', t('ui.testReset'));
      setText('#test-status', t('ui.testInactive'));
      setText('#btn-test-prev', t('ui.testPrev'));
      setText('#btn-test-next', t('ui.testNext'));
      setText('#btn-test-run', t('ui.testRun'));
      setText('#btn-test-suite', t('ui.testSuite'));
      setText('#btn-test-stop', t('ui.testStop'));
      const testMoves = document.getElementById('test-moves');
      if (testMoves) testMoves.placeholder = t('ui.testMovesPlaceholder');
      const scenarioSelect = document.getElementById('test-scenario');
      if (scenarioSelect) scenarioSelect.title = t('ui.testScenarioTitle');
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

      if (this.els.btnLang) {
        this.els.btnLang.addEventListener('click', () => {
          const next = this.lang === 'de' ? 'en' : 'de';
          try {
            localStorage.setItem('tethari_lang', next);
          } catch (_error) {
            // Ignore storage write issues.
          }
          window.location.reload();
        });
      }

      this.els.helpToggle.addEventListener('click', () => {
        if (!this.els.helpPanel) return;
        this.els.helpPanel.classList.add('visible');
        this.els.helpPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      this.els.status.textContent = t('ui.statusComputerThinking');
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
        this.els.overlayTitle.textContent = t('ui.overlayDrawTitle');
        this.els.overlayText.textContent = t('ui.overlayDrawText');
      } else if (this.game.winner === this.humanPlayer) {
        this.els.overlayTitle.textContent = t('ui.overlayWinTitle');
        this.els.overlayText.textContent = t('ui.overlayWinText');
      } else {
        this.els.overlayTitle.textContent = t('ui.overlayLossTitle');
        this.els.overlayText.textContent = t('ui.overlayLossText');
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
        this.els.status.textContent = t('ui.testStatusHeader', {
          cursor: this.testLab.state.cursor,
          total: this.testLab.state.moveTokens.length
        });
        return;
      }

      if (this.game.gameOver) {
        if (this.game.winner === 'draw') this.els.status.textContent = t('ui.statusDraw');
        else if (this.game.winner === this.humanPlayer) this.els.status.textContent = t('ui.statusYouWon');
        else this.els.status.textContent = t('ui.statusComputerWon');
        return;
      }

      this.els.status.textContent = this.game.activePlayer === this.humanPlayer
        ? t('ui.statusYourTurn', { player: playerLabel(this.humanPlayer) })
        : t('ui.statusComputerThinking');

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
        pieceEl.title = PIECE_NAMES[piece.type] + (piece.endangered ? t('ui.endangeredSuffix') : '');
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
