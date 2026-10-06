// ================= CLASSIC BOARD RING =================
// Draws the game's properties as a square Monopoly-style ring: START in the bottom-right corner,
// running clockwise like the real board, stations spread evenly between the colour groups. Works
// for any set of locations, not just the built-in Monopoly one. Used on the Board tab and on the
// big screen. Loaded after app.js and uses its globals.

// Squares in board order: colour groups in sequence, stations spread evenly between them, and the
// Chance / Community Chest draw points dropped in as side squares (as on the real board).
function boardOrder(){
  const streets = [];
  GROUP_ORDER.forEach(g=>PROPERTIES.filter(p=>p.group===g && p.type!=='station').forEach(p=>streets.push(p)));
  const stations = PROPERTIES.filter(p=>p.type==='station');
  const n = streets.length + stations.length;
  const slots = new Set(stations.map((s,i)=>Math.floor((i + 0.5) * n / stations.length)));
  const out = [];
  let si = 0, ti = 0;
  for(let k = 0; k < n; k++){
    if(slots.has(k) && si < stations.length) out.push(stations[si++]);
    else if(ti < streets.length) out.push(streets[ti++]);
    else out.push(stations[si++]);
  }
  const total = out.length + SPECIALS.length;
  SPECIALS.forEach((s,i)=>{
    const at = Math.min(out.length, Math.floor(i * total / SPECIALS.length) + 2);
    out.splice(at, 0, s);
  });
  return out;
}
// "Old Kent Road" → "Old Kent", "King's Cross Station" → "King's Cross", "The Angel, Islington" → "Angel".
function shortLabel(name){
  const stop = /^(the|road|street|station|square|avenue|lane)$/i;
  const words = String(name).replace(/,.*$/, '').split(/\s+/).filter(w=>w && !stop.test(w));
  let label = words.slice(0, 2).join(' ') || String(name);
  if(label.length > 14) label = words[0];
  // Soft hyphen in long single words so narrow squares break them cleanly ("Northum-berland").
  return label.split(' ').map(w=>w.length > 10 ? w.slice(0, Math.ceil(w.length/2)) + '­' + w.slice(Math.ceil(w.length/2)) : w).join(' ');
}
// Grid cell for side position i on a board with S tiles per side. Clockwise from START
// (bottom-right): bottom row right→left, left column bottom→top, top row left→right, right column top→bottom.
function ringCell(side, i, S){
  if(side === 0) return {row: S + 2, col: S + 1 - i, cls: 'side-b'};
  if(side === 1) return {row: S + 1 - i, col: 1, cls: 'side-l'};
  if(side === 2) return {row: 1, col: 2 + i, cls: 'side-t'};
  return {row: 2 + i, col: S + 2, cls: 'side-r'};
}
function buildBoardRing(container, teamsData, opts){
  opts = opts || {};
  if(!container) return;
  const order = boardOrder();
  const n = order.length;
  if(n === 0){ container.innerHTML = '<div class="empty">No properties on this board yet.</div>'; return; }
  const S = Math.max(2, Math.ceil(n / 4));
  const base = Math.floor(n / 4), extra = n % 4;
  const owners = ownershipMap(teamsData);
  const me = currentRole === 'team' && currentTeam ? currentTeam.name : null;
  const cells = [];
  let k = 0;
  for(let side = 0; side < 4; side++){
    const len = base + (side < extra ? 1 : 0);
    for(let i = 0; i < S; i++){
      const {row, col, cls} = ringCell(side, i, S);
      if(i >= len){
        // Sides that come up one short get a plain filler square so the ring has no holes.
        cells.push(`<div class="ring-tile filler ${cls}" style="grid-row:${row};grid-column:${col}" aria-hidden="true"><span class="tile-name">★</span></div>`);
        continue;
      }
      const p = order[k++];
      if(p.type === 'special'){
        cells.push(`<button type="button" class="ring-tile special ${cls}" style="grid-row:${row};grid-column:${col}" data-ring-id="${esc(p.id)}" aria-label="${esc(p.name)}">
          <span class="tile-bar" style="background:var(--ba-red)"></span>
          <span class="tile-q">?</span>
          <span class="tile-name">${esc(shortLabel(p.name))}</span>
        </button>`);
        continue;
      }
      const owner = owners[p.id];
      const ownerTeam = owner && teamsData[owner];
      const visited = me && currentTeam.visited && currentTeam.visited[p.id];
      const state = owner ? (owner === me ? ' mine' : ' owned') : '';
      cells.push(`<button type="button" class="ring-tile ${cls}${state}${visited ? ' visited' : ''}" style="grid-row:${row};grid-column:${col}" data-ring-id="${esc(p.id)}" aria-label="${esc(p.name + (owner ? ', owned by ' + owner : ', unowned'))}">
        <span class="tile-bar" style="background:${esc(p.color)}"></span>
        <span class="tile-name">${esc(shortLabel(p.name))}</span>
        <span class="tile-price">£${p.price}</span>
        ${owner ? `<span class="tile-owner" title="${esc(owner)}">${esc((ownerTeam && ownerTeam.icon) || owner.slice(0,1))}</span>` : ''}
      </button>`);
    }
  }
  const corner = (row, col, label, sub) => `<div class="ring-corner" style="grid-row:${row};grid-column:${col}"><span class="corner-label">${esc(label)}</span>${sub ? `<span class="corner-sub">${esc(sub)}</span>` : ''}</div>`;
  cells.push(corner(S + 2, S + 2, 'GO', 'Start'));
  cells.push(corner(S + 2, 1, config.lunchPoint ? 'Lunch' : 'Just Visiting', config.lunchPoint ? 'Halfway meetup' : ''));
  cells.push(corner(1, 1, 'Free Parking', ''));
  cells.push(corner(1, S + 2, 'Mind the Gap', ''));
  const legend = Object.values(teamsData)
    .map(t=>({t, c: ownedIds(t).length}))
    .sort((a,b)=>b.c - a.c || a.t.name.localeCompare(b.t.name))
    .map(({t,c})=>`<span class="legend-item${t.name === me ? ' me' : ''}"><span class="legend-icon">${esc(t.icon || t.name.slice(0,1))}</span>${esc(t.name)} <b>${c}</b></span>`).join('');
  cells.push(`<div class="ring-centre" style="grid-row:2 / ${S + 2};grid-column:2 / ${S + 2}">
      <div class="centre-title">THE LONDON RUN</div>
      <div class="centre-sub">${esc(currentGameName || '')}</div>
      <div class="centre-legend">${legend || '<span class="legend-item">No teams yet</span>'}</div>
      ${opts.interactive ? '<div class="centre-hint">Tap a square for details</div>' : ''}
    </div>`);
  container.innerHTML = `<div class="ring" style="grid-template-columns:1.5fr repeat(${S}, 1fr) 1.5fr;grid-template-rows:1.5fr repeat(${S}, 1fr) 1.5fr">${cells.join('')}</div>`;
  if(opts.interactive){
    container.querySelectorAll('[data-ring-id]').forEach(tile=>{
      tile.addEventListener('click', ()=>{
        container.querySelectorAll('.ring-tile.selected').forEach(t=>t.classList.remove('selected'));
        tile.classList.add('selected');
        showRingDetail(tile.dataset.ringId, teamsData, opts.detailEl);
      });
    });
  }
}
function showRingDetail(propId, teamsData, el){
  if(!el) return;
  const sp = SPECIALS.find(x=>x.id === propId);
  if(sp){
    const how = cardMode() === 'buy' ? 'In this game, cards are bought from the Play screen instead.' : 'Each team can draw one card here.';
    el.innerHTML = `<div class="stop"><div class="stop-swatch" style="background:var(--red)"></div><div class="stop-body">
        <div class="stop-name">${esc(sp.name)}</div>
        <div class="stop-meta">${sp.note ? esc(sp.note) + ' · ' : ''}${how}</div></div></div>`;
    return;
  }
  const p = PROPERTIES.find(x=>x.id === propId);
  if(!p) return;
  const owner = ownershipMap(teamsData)[p.id];
  const due = rentDue(p, owner, teamsData);
  const me = currentRole === 'team' && currentTeam ? currentTeam : null;
  const visited = me && me.visited && me.visited[p.id];
  el.innerHTML = `<div class="stop"><div class="stop-swatch" style="background:${esc(p.color)}"></div><div class="stop-body">
      <div class="stop-name">${esc(p.name)} ${owner ? `<span class="owner-tag ${me && owner === me.name ? 'mine' : 'theirs'}">${esc(me && owner === me.name ? 'YOURS' : owner)}</span>` : '<span class="owner-tag mine">UNOWNED</span>'}</div>
      <div class="stop-meta">${esc(p.group)} · £${p.price} to buy · rent £${due.rent}${due.boosted ? ' (Rent Boost)' : ''}${me ? (visited ? ' · you\'ve visited' : ' · not visited yet') : ''}</div>
      ${p.fact ? `<div class="stop-meta">${esc(p.fact)}</div>` : ''}
    </div></div>`;
}

// ================= BIG SCREEN =================
// Full-screen view for a projector or TV: the board ring, live standings and a ticker of the
// latest moves, all updating by themselves. Open it from Leaders, or use the game's big-screen
// link (?game=…&screen=1), which signs in as a spectator and opens it straight away.
let bigScreenOn = false, bigScreenWired = false;
let bsTeams = {}, bsActivity = [], bsAuction = null;
function openBigScreen(){
  bigScreenOn = true;
  endTour(false);
  document.getElementById('big-screen').style.display = 'grid';
  document.body.classList.add('big-screen-open');
  try{ const r = document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); if(r && r.catch) r.catch(()=>{}); }catch(e){}
  if(!bigScreenWired){
    bigScreenWired = true;
    listen('/teams', snap=>{
      const val = snap.val() || {};
      bsTeams = {};
      Object.values(val).forEach(t=>{ if(t && t.name) bsTeams[t.name] = t; });
      renderBigScreen();
    });
    listenQuery(db.ref(gamePath('/activity')).limitToLast(8), snap=>{
      bsActivity = Object.values(snap.val() || {}).sort((a,b)=>b.ts - a.ts);
      renderBigScreen();
    });
    listen('/activeAuction', snap=>{ bsAuction = snap.val(); renderBigScreen(); });
  }
  renderBigScreen();
}
function closeBigScreen(){
  bigScreenOn = false;
  document.getElementById('big-screen').style.display = 'none';
  document.body.classList.remove('big-screen-open');
  try{ if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(()=>{}); }catch(e){}
}
function bigScreenStatus(){
  const r = gameLockReason();
  if(r === 'not-started') return {text: 'Starting soon', cls: 'waiting'};
  if(r === 'paused') return {text: 'Paused', cls: 'waiting'};
  if(r === 'finalized') return {text: 'Final results', cls: 'over'};
  if(r === 'ended') return {text: 'Time\'s up', cls: 'over'};
  const end = eventEndTs();
  if(end && !isNaN(end)){
    const mins = Math.max(0, Math.ceil((end - Date.now()) / 60000));
    return {text: 'Ends in ' + (mins >= 60 ? Math.floor(mins/60) + 'h ' + String(mins%60).padStart(2,'0') + 'm' : mins + ' min'), cls: mins <= 15 ? 'soon' : 'running'};
  }
  return {text: 'Live', cls: 'running'};
}
function renderBigScreen(){
  if(!bigScreenOn) return;
  document.getElementById('bs-game').textContent = currentGameName || '';
  const st = bigScreenStatus();
  const stEl = document.getElementById('bs-status');
  stEl.textContent = st.text;
  stEl.className = 'bs-status ' + st.cls;
  buildBoardRing(document.getElementById('bs-board'), bsTeams, {interactive: false});

  const teams = Object.values(bsTeams).map(t=>{
    const owned = ownedIds(t);
    const value = owned.reduce((s,id)=>{ const p = PROPERTIES.find(x=>x.id===id); return s + (p ? p.price : 0); }, 0);
    const sets = GROUP_ORDER.filter(g=>{
      const items = PROPERTIES.filter(p=>p.group===g);
      return items.length > 1 && !items.every(p=>p.type==='station') && items.every(p=>owned.includes(p.id));
    }).map(g=>PROPERTIES.find(p=>p.group===g).color);
    return {t, owned: owned.length, cash: t.cash || 0, netWorth: (t.cash || 0) + value, sets};
  }).sort((a,b)=>b.netWorth - a.netWorth || a.t.name.localeCompare(b.t.name));
  const medals = ['🥇','🥈','🥉'];
  document.getElementById('bs-standings').innerHTML = teams.length ? teams.map((x,i)=>`
    <div class="bs-row${i === 0 ? ' lead' : ''}">
      <span class="bs-rank">${config.finalized && i < 3 ? medals[i] : i + 1}</span>
      <span class="bs-icon">${esc(x.t.icon || '')}</span>
      <span class="bs-name">${esc(x.t.name)}<span class="bs-meta">${x.owned} owned · cash ${fmtMoney(x.cash)}${x.sets.map(c=>`<i class="bs-set" style="background:${esc(c)}"></i>`).join('')}</span></span>
      <span class="bs-worth${x.netWorth < 0 ? ' money-neg' : ''}">${fmtMoney(x.netWorth)}</span>
    </div>`).join('') : '<div class="bs-empty">Waiting for teams…</div>';

  const auctionProp = bsAuction && !bsAuction.resolved ? PROPERTIES.find(p=>p.id === bsAuction.propertyId) : null;
  const auctionEl = document.getElementById('bs-auction');
  if(auctionProp){
    const ms = Math.max(0, bsAuction.endTs - Date.now());
    auctionEl.style.display = 'block';
    auctionEl.textContent = `Auction live: ${auctionProp.name} — sealed bids close in ${Math.floor(ms/60000)}:${String(Math.floor(ms%60000/1000)).padStart(2,'0')}`;
  } else auctionEl.style.display = 'none';

  document.getElementById('bs-ticker').innerHTML = bsActivity.length
    ? bsActivity.map(e=>`<span class="bs-tick"><b>${new Date(e.ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</b> ${esc(activityText(e))}</span>`).join('')
    : '<span class="bs-tick">No moves yet</span>';
}
setInterval(()=>{ if(bigScreenOn) renderBigScreen(); }, 1000 * 5);
function bigScreenUrl(){ return window.location.origin + window.location.pathname + '?game=' + encodeURIComponent(currentGameId) + '&screen=1'; }
function fillBigScreenLink(){
  const input = document.getElementById('bigscreen-link');
  if(!input) return;
  input.value = bigScreenUrl();
  document.getElementById('bigscreen-open-link').href = bigScreenUrl();
}
document.getElementById('bigscreen-copy-btn').addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText(bigScreenUrl()); toast('Big-screen link copied.'); }
  catch(e){ toast('Could not copy automatically — select the link and copy it.'); }
});
document.getElementById('bs-exit-btn').addEventListener('click', closeBigScreen);
document.getElementById('lb-bigscreen-btn').addEventListener('click', openBigScreen);
document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && bigScreenOn && !document.fullscreenElement) closeBigScreen(); });
