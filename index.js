import * as colors from 'colors';
import * as csp from 'js-csp';

const constants = {
  CLOSED: csp.CLOSED,
  POINT_MIN: 5,
  POINT_STEP: 10,
  POINT_NUMBER: 10,
  POINT_WIN: 10,
  POINT_ZERO: 0,
  PLAYER_QTD: 5,
  pointChan: csp.chan(),
  playerChan: csp.chan(),
  chan: csp.chan,
  go: csp.go,
  put: csp.put,
  take: csp.take,
  timeout: csp.timeout,
  log: console.log
};

constants.log('[DEBUG] CODE START'.green);

function* currentPoint(constants) {
  while (true) {
    constants.log('[DEBUG] GENERATOR POINT'.blue);
    let current = Math.round(Math.random(constants.POINT_NUMBER)*constants.POINT_STEP);
    if (current >= constants.POINT_MIN || current === constants.POINT_ZERO) {
      yield current;
    } else {
      yield currentPoint(constants).next().value;
    }
  }
}

function* currentPlayer(constants) {
  for(let i=0;;i++) {
    constants.log('[DEBUG] GENERATOR PLAYER'.blue);
    yield `Player ${(i%constants.PLAYER_QTD)+1}`;
  }
}

constants.go(function* () {
  constants.log('[DEBUG] GO PLAYER'.magenta);
  let players = currentPlayer(constants);
  while(true) {
    let player = players.next();
    yield constants.put(constants.playerChan, player.value);
    yield constants.timeout(200);

    if (constants.playerChan.closed) {
      break;
    }
  }
});

constants.go(function* () {
  constants.log('[DEBUG] GO POINT'.magenta);
  let points = currentPoint(constants);
  while(true) {
    let point = points.next();
    yield constants.put(constants.pointChan, point.value);
    if (point.value === constants.POINT_WIN) {
      constants.pointChan.close();
      break;
    }
  }
});

constants.go(function* () {
  constants.log('[DEBUG] GO MAIN'.magenta);
  while(true) {
    let shot = yield constants.take(constants.pointChan);
    let player = yield constants.take(constants.playerChan);
    if (shot === constants.CLOSED) {
      constants.playerChan.close();
      constants.log("[MAIN] You hit the bull's eye. You won!".yellow);
      break;
    }
    constants.log(`[MAIN] ${player} shot ${shot}.`.yellow);
  }
});

constants.log('[DEBUG] CODE END'.green);
