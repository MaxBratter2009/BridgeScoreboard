const G = 10;
const addForm = document.getElementById('add-team-form');
const teamsBody = document.getElementById('teams-body');
const emptyAdminMsg = document.getElementById('empty-admin-msg');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-team-form');
const cancelEdit = document.getElementById('cancel-edit');
const clearAllBtn = document.getElementById('clear-all-btn');

function toNewtons(kg) {
  return kg * G;
}

function getRatio(heldKg, bridgeKg) {
  if (!bridgeKg || bridgeKg <= 0) return 0;
  return heldKg / bridgeKg;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

addForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('team-name').value.trim();
  const period = parseInt(document.getElementById('team-period').value, 10);
  const bridgeWeightKg = parseFloat(document.getElementById('bridge-weight').value) || 0;
  const heldWeightKg = parseFloat(document.getElementById('held-weight').value) || 0;

  if (!name || !period) return;

  teamsRef.push({
    name,
    period,
    bridgeWeightKg,
    heldWeightKg,
    createdAt: Date.now()
  });

  addForm.reset();
});

function renderAdminTable(snapshot) {
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
    emptyAdminMsg.classList.remove('hidden');
    teamsBody.innerHTML = '';
    return;
  }

  emptyAdminMsg.classList.add('hidden');
  teamsBody.innerHTML = '';

  teams.forEach(team => {
    const tr = document.createElement('tr');
    const bridgeN = toNewtons(team.bridgeWeightKg || 0);
    const heldN = toNewtons(team.heldWeightKg || 0);
    const ratio = getRatio(team.heldWeightKg || 0, team.bridgeWeightKg || 0);

    tr.innerHTML = `
      <td>${escapeHtml(team.name)}</td>
      <td style="text-align:center">${team.period || '-'}</td>
      <td style="text-align:right">${(team.bridgeWeightKg || 0).toFixed(3)}</td>
      <td style="text-align:right">${(team.heldWeightKg || 0).toFixed(3)}</td>
      <td style="text-align:right">${bridgeN.toFixed(2)}</td>
      <td style="text-align:right">${heldN.toFixed(2)}</td>
      <td style="text-align:right; font-weight:700; color:var(--accent)">${ratio.toFixed(2)}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-primary btn-sm edit-btn" data-id="${team.id}">Edit</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${team.id}">Del</button>
        </div>
      </td>
    `;
    teamsBody.appendChild(tr);
  });

  teamsBody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id, teams));
  });

  teamsBody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this team?')) {
        teamsRef.child(btn.dataset.id).remove();
      }
    });
  });
}

function openEditModal(id, teams) {
  const team = teams.find(t => t.id === id);
  if (!team) return;

  document.getElementById('edit-team-id').value = id;
  document.getElementById('edit-name').value = team.name;
  document.getElementById('edit-period').value = team.period;
  document.getElementById('edit-bridge-weight').value = team.bridgeWeightKg || '';
  document.getElementById('edit-held-weight').value = team.heldWeightKg || '';

  editModal.classList.remove('hidden');
}

editForm.addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('edit-team-id').value;
  const name = document.getElementById('edit-name').value.trim();
  const period = parseInt(document.getElementById('edit-period').value, 10);
  const bridgeWeightKg = parseFloat(document.getElementById('edit-bridge-weight').value) || 0;
  const heldWeightKg = parseFloat(document.getElementById('edit-held-weight').value) || 0;

  if (!name || !period) return;

  teamsRef.child(id).update({
    name,
    period,
    bridgeWeightKg,
    heldWeightKg
  });

  editModal.classList.add('hidden');
});

cancelEdit.addEventListener('click', () => {
  editModal.classList.add('hidden');
});

editModal.addEventListener('click', e => {
  if (e.target === editModal) editModal.classList.add('hidden');
});

clearAllBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete ALL teams? This cannot be undone.')) {
    teamsRef.remove();
  }
});

teamsRef.on('value', renderAdminTable);
