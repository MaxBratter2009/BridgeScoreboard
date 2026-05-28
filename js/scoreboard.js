const G = 10;
const tbody = document.getElementById('scoreboard-body');
const emptyMsg = document.getElementById('empty-msg');
let previousRanking = [];
let previousData = {};
let isFirstLoad = true;

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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderScoreboard(snapshot) {
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
  const rankingChanged = !isFirstLoad && JSON.stringify(currentRanking) !== JSON.stringify(previousRanking);
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
      const prev = previousData[team.id];
      const isNew = !previousRanking.includes(team.id);
      const dataChanged = prev && (
        prev.bridgeWeightKg !== (team.bridgeWeightKg || 0) ||
        prev.heldWeightKg !== (team.heldWeightKg || 0)
      );

      if (isNew) {
        tr.classList.add('row-pop-in');
      } else if (dataChanged) {
        tr.classList.add('row-flash-update');
      }

      if (rankingChanged) {
        const prevIndex = previousRanking.indexOf(team.id);
        if (prevIndex !== -1 && prevIndex !== i) {
          tr.classList.add('row-flash-update');
          const badge = tr.querySelector('.rank-badge');
          if (badge) badge.classList.add('rank-pulse');
        }
      }
    }
  });

  if (newLeader) {
    const firstRow = tbody.querySelector('tr');
    if (firstRow) firstRow.classList.add('row-flash-gold');
    launchConfetti(3000);
  }

  previousRanking = currentRanking;
  previousData = currentData;
  isFirstLoad = false;
}

teamsRef.on('value', renderScoreboard);
