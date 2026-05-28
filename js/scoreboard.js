const G = 10;
const tbody = document.getElementById('scoreboard-body');
const emptyMsg = document.getElementById('empty-msg');
const mainContainer = document.getElementById('main-container');
const scoreboardWrapper = document.getElementById('scoreboard-wrapper');
const podiumOverlay = document.getElementById('podium-overlay');
const screenFlash = document.getElementById('screen-flash');

let previousRanking = [];
let previousData = {};
let isFirstLoad = true;
let gameEnded = false;

function toNewtons(kg) {
  return kg * G;
}

function getRatio(heldKg, bridgeKg) {
  if (!bridgeKg || bridgeKg <= 0) return 0;
  return heldKg / bridgeKg;
}

function formatNum(n) {
  if (n === 0 || n === undefined || n === null) return null;
  return n.toFixed(2);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function triggerScreenFlash() {
  screenFlash.classList.remove('screen-flash-active');
  void screenFlash.offsetWidth;
  screenFlash.classList.add('screen-flash-active');
  setTimeout(() => screenFlash.classList.remove('screen-flash-active'), 700);
}

function triggerScreenShake() {
  scoreboardWrapper.classList.remove('screen-shake');
  void scoreboardWrapper.offsetWidth;
  scoreboardWrapper.classList.add('screen-shake');
  setTimeout(() => scoreboardWrapper.classList.remove('screen-shake'), 700);
}

function buildRow(team, rank, animate) {
  const tr = document.createElement('tr');
  tr.dataset.id = team.id;

  const bridgeN = toNewtons(team.bridgeWeightKg || 0);
  const heldN = toNewtons(team.heldWeightKg || 0);
  const ratio = getRatio(team.heldWeightKg || 0, team.bridgeWeightKg || 0);

  let rankClass = 'rank-other';
  if (rank === 1) rankClass = 'rank-1';
  else if (rank === 2) rankClass = 'rank-2';
  else if (rank === 3) rankClass = 'rank-3';

  const hasBridgeData = team.bridgeWeightKg && team.bridgeWeightKg > 0;
  const hasHeldData = team.heldWeightKg && team.heldWeightKg > 0;

  tr.innerHTML = `
    <td class="rank-col"><span class="rank-badge ${rankClass}">${rank}</span></td>
    <td class="team-col"><span class="team-name">${escapeHtml(team.name)}</span></td>
    <td class="period-col">${team.period || '-'}</td>
    <td class="weight-col"><span class="weight-value">${hasBridgeData ? formatNum(bridgeN) + ' N' : '<span class="no-data">--</span>'}</span></td>
    <td class="weight-col"><span class="weight-value">${hasHeldData ? formatNum(heldN) + ' N' : '<span class="no-data">--</span>'}</span></td>
    <td class="ratio-col"><span class="ratio-value">${hasBridgeData && hasHeldData ? ratio.toFixed(2) : '<span class="no-data">--</span>'}</span></td>
  `;

  if (animate) {
    tr.classList.add('row-slide-in');
    tr.style.animationDelay = `${rank * 0.08}s`;
  }

  return tr;
}

function renderScoreboard(snapshot) {
  if (gameEnded) return;

  const teams = [];
  snapshot.forEach(child => {
    teams.push({ id: child.key, ...child.val() });
  });

  teams.sort((a, b) => {
    const ratioA = getRatio(a.heldWeightKg || 0, a.bridgeWeightKg || 0);
    const ratioB = getRatio(b.heldWeightKg || 0, b.bridgeWeightKg || 0);
    return ratioB - ratioA;
  });

  if (teams.length === 0) {
    emptyMsg.classList.remove('hidden');
    tbody.innerHTML = '';
    previousRanking = [];
    previousData = {};
    isFirstLoad = true;
    return;
  }

  emptyMsg.classList.add('hidden');

  const currentRanking = teams.map(t => t.id);
  const newLeader = !isFirstLoad && currentRanking[0] !== previousRanking[0] && previousRanking.length > 0;

  const currentData = {};
  teams.forEach(t => {
    currentData[t.id] = {
      bridgeWeightKg: t.bridgeWeightKg || 0,
      heldWeightKg: t.heldWeightKg || 0
    };
  });

  tbody.innerHTML = '';

  teams.forEach((team, i) => {
    const rank = i + 1;
    const tr = buildRow(team, rank, isFirstLoad);
    tbody.appendChild(tr);

    if (!isFirstLoad) {
      const isNew = !previousRanking.includes(team.id);
      const prev = previousData[team.id];
      const dataChanged = prev && (
        prev.bridgeWeightKg !== (team.bridgeWeightKg || 0) ||
        prev.heldWeightKg !== (team.heldWeightKg || 0)
      );

      if (isNew) {
        tr.classList.add('row-slam-in');
        triggerScreenFlash();
        triggerScreenShake();

        tr.addEventListener('animationend', () => {
          tr.classList.remove('row-slam-in');
          tr.classList.add('row-entry-explosion');
        }, { once: true });

        launchConfetti(3000);

        if (rank === 1) {
          setTimeout(() => launchConfetti(2000), 1500);
        }
      } else if (dataChanged) {
        tr.classList.add('row-flash-update');
        const badge = tr.querySelector('.rank-badge');
        if (badge) badge.classList.add('rank-pulse');
        triggerScreenShake();
        launchConfetti(1500);
      } else {
        const prevRank = previousRanking.indexOf(team.id);
        if (prevRank !== -1 && prevRank !== i) {
          tr.classList.add('row-flash-update');
          const badge = tr.querySelector('.rank-badge');
          if (badge) badge.classList.add('rank-pulse');
        }
      }
    }
  });

  if (newLeader) {
    const firstRow = tbody.querySelector('tr');
    if (firstRow) {
      firstRow.classList.add('row-flash-gold');
      const badge = firstRow.querySelector('.rank-badge');
      if (badge) badge.classList.add('rank-pulse');
    }
    triggerScreenFlash();
    launchConfetti(5000);
    setTimeout(() => launchConfetti(3000), 2000);
  }

  previousRanking = currentRanking;
  previousData = currentData;
  isFirstLoad = false;
}

function showPodium(snapshot) {
  gameEnded = true;

  const teams = [];
  snapshot.forEach(child => {
    teams.push({ id: child.key, ...child.val() });
  });

  teams.sort((a, b) => {
    const ratioA = getRatio(a.heldWeightKg || 0, a.bridgeWeightKg || 0);
    const ratioB = getRatio(b.heldWeightKg || 0, b.bridgeWeightKg || 0);
    return ratioB - ratioA;
  });

  scoreboardWrapper.classList.add('fade-out');

  setTimeout(() => {
    mainContainer.classList.add('hidden');
    podiumOverlay.classList.add('active');

    const places = [
      { el: 'place-3', idx: 2 },
      { el: 'place-2', idx: 1 },
      { el: 'place-1', idx: 0 },
    ];

    places.forEach((place) => {
      const team = teams[place.idx];
      const nameEl = document.getElementById(`${place.el}-name`);
      const detailsEl = document.getElementById(`${place.el}-details`);
      const ratioEl = document.getElementById(`${place.el}-ratio`);

      if (team) {
        nameEl.textContent = team.name;
        detailsEl.textContent = `Period ${team.period}`;
        const ratio = getRatio(team.heldWeightKg || 0, team.bridgeWeightKg || 0);
        ratioEl.textContent = `Ratio: ${ratio.toFixed(2)}`;
      } else {
        nameEl.textContent = '--';
        detailsEl.textContent = '';
        ratioEl.textContent = '--';
        document.getElementById(place.el).style.visibility = 'hidden';
      }
    });

    // Title drops in
    setTimeout(() => {
      document.getElementById('podium-title').classList.add('reveal');
    }, 500);

    // 3rd place rises up
    setTimeout(() => {
      document.getElementById('place-3').classList.add('reveal');
      launchFireworks(2500, 'confetti-canvas-podium');
    }, 2000);

    // 2nd place rises up
    setTimeout(() => {
      document.getElementById('place-2').classList.add('reveal');
      launchFireworks(3000, 'confetti-canvas-podium');
    }, 4000);

    // 1st place - the big reveal
    setTimeout(() => {
      document.getElementById('place-1').classList.add('reveal');
      launchFireworks(8000, 'confetti-canvas-podium');
      // Second wave of fireworks
      setTimeout(() => launchFireworks(5000, 'confetti-canvas-podium'), 3000);
      // Third wave
      setTimeout(() => launchFireworks(4000, 'confetti-canvas-podium'), 6000);
    }, 6500);

  }, 1000);
}

teamsRef.on('value', renderScoreboard);

const gameStateRef = db.ref('gameState');
gameStateRef.on('value', snap => {
  const state = snap.val();
  if (state && state.status === 'ended') {
    teamsRef.once('value', showPodium);
  } else if (state && state.status === 'active') {
    gameEnded = false;
    mainContainer.classList.remove('hidden');
    scoreboardWrapper.classList.remove('fade-out');
    podiumOverlay.classList.remove('active');
    document.getElementById('podium-title').classList.remove('reveal');
    document.getElementById('place-1').classList.remove('reveal');
    document.getElementById('place-2').classList.remove('reveal');
    document.getElementById('place-3').classList.remove('reveal');
    document.getElementById('place-1').style.visibility = '';
    document.getElementById('place-2').style.visibility = '';
    document.getElementById('place-3').style.visibility = '';
    isFirstLoad = true;
    previousRanking = [];
    previousData = {};
  }
});
