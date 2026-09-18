// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "AIzaSyDjzyw6ywuiXoyr2NJG9-EFi1HG3wyAobE",
  authDomain: "london-run.firebaseapp.com",
  databaseURL: "https://london-run-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "london-run",
  storageBucket: "london-run.firebasestorage.app",
  messagingSenderId: "592445490501",
  appId: "1:592445490501:web:f9d1e387e79310ac342a2c"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
function safeKey(str){ return String(str).trim().toLowerCase().replace(/[.#$\[\]\/\s]+/g,'_'); }
const urlParams = new URLSearchParams(window.location.search);
const currentGameId = urlParams.get('game');
let currentGameName = null;
function gamePath(path){
  if(!currentGameId) return null;
  if(currentGameId === 'live' || currentGameId === 'test') return currentGameId + path;
  return 'games/' + currentGameId + path;
}

// ================= DATA =================
const MONOPOLY_TEMPLATE_LOCATIONS = [
  {id:'okr', name:'Old Kent Road', group:'Brown', color:'#8b4a2b', price:60, lat:51.4839, lng:-0.0641, type:'street', fact:'The cheapest square on the UK Monopoly board, and one of the few south-of-the-river streets included on it.', wikiTitle:'Old Kent Road'},
  {id:'whc', name:'Whitechapel Road', group:'Brown', color:'#8b4a2b', price:60, lat:51.5171, lng:-0.0620, type:'street', fact:'Runs through the East End, near the old Whitechapel Bell Foundry site which cast Big Ben\'s bell.', wikiTitle:'Whitechapel Road'},
  {id:'ang', name:'The Angel, Islington', group:'Light Blue', color:'#A6C3E0', price:100, lat:51.5322, lng:-0.1058, type:'street', fact:'Named after a 17th-century coaching inn that once stood at this busy Islington junction.', wikiTitle:'Angel, London'},
  {id:'eus', name:'Euston Road', group:'Light Blue', color:'#A6C3E0', price:100, lat:51.5284, lng:-0.1339, type:'street', fact:'Home to the British Library and St Pancras station, and one of London\'s busiest arterial roads.', wikiTitle:'Euston Road'},
  {id:'pen', name:'Pentonville Road', group:'Light Blue', color:'#A6C3E0', price:120, lat:51.5307, lng:-0.1132, type:'street', fact:'Runs near Pentonville Prison, a short walk further north from the road itself.', wikiTitle:'Pentonville Road'},
  {id:'pal', name:'Pall Mall', group:'Pink', color:'#d8639e', price:140, lat:51.5074, lng:-0.1330, type:'street', fact:'Named after pall-mall, a croquet-like game played here in the 17th century; still lined with historic gentlemen\'s clubs.', wikiTitle:'Pall Mall, London'},
  {id:'whi', name:'Whitehall', group:'Pink', color:'#d8639e', price:140, lat:51.5035, lng:-0.1257, type:'street', fact:'The nerve centre of UK government — the word itself is shorthand for the civil service.', wikiTitle:'Whitehall'},
  {id:'nor', name:'Northumberland Avenue', group:'Pink', color:'#d8639e', price:160, lat:51.5074, lng:-0.1246, type:'street', fact:'Built in the 1870s on the site of Northumberland House, a grand aristocratic mansion.', wikiTitle:'Northumberland Avenue'},
  {id:'bow', name:'Bow Street', group:'Orange', color:'#e08a2c', price:180, lat:51.5133, lng:-0.1211, type:'street', fact:'Home to the original Bow Street Runners, widely considered London\'s first professional police force.', wikiTitle:'Bow Street'},
  {id:'mar', name:'Marlborough Street', group:'Orange', color:'#e08a2c', price:180, lat:51.5142, lng:-0.1407, type:'street', fact:'Great Marlborough Street once housed a famous magistrates\' court that tried plenty of notable names.', wikiTitle:'Great Marlborough Street'},
  {id:'vin', name:'Vine Street', group:'Orange', color:'#e08a2c', price:200, lat:51.5091, lng:-0.1394, type:'street', fact:'A tiny street near Piccadilly, historically home to a police station referenced in Monopoly folklore.', wikiTitle:'Vine Street, London'},
  {id:'str', name:'The Strand', group:'Red', color:'#d24a3f', price:220, lat:51.5115, lng:-0.1215, type:'street', fact:'Once literally ran along the Thames\' strand (shoreline) before the Victoria Embankment pushed the river back.', wikiTitle:'Strand, London'},
  {id:'fle', name:'Fleet Street', group:'Red', color:'#d24a3f', price:220, lat:51.5142, lng:-0.1078, type:'street', fact:'Synonymous with the British press for over 300 years, even though most papers moved out decades ago.', wikiTitle:'Fleet Street'},
  {id:'tra', name:'Trafalgar Square', group:'Red', color:'#d24a3f', price:240, lat:51.5080, lng:-0.1281, type:'street', fact:'Built to commemorate Nelson\'s 1805 victory, with his column watched over by four bronze lions.', wikiTitle:'Trafalgar Square'},
  {id:'lei', name:'Leicester Square', group:'Yellow', color:'#e9c93f', price:260, lat:51.5103, lng:-0.1307, type:'street', fact:'London\'s premier film-premiere venue, packed with cinemas since the early 20th century.', wikiTitle:'Leicester Square'},
  {id:'cov', name:'Coventry Street', group:'Yellow', color:'#e9c93f', price:260, lat:51.5099, lng:-0.1330, type:'street', fact:'A short but busy link between Piccadilly Circus and Leicester Square.', wikiTitle:'Coventry Street'},
  {id:'pic', name:'Piccadilly', group:'Yellow', color:'#e9c93f', price:280, lat:51.5072, lng:-0.1434, type:'street', fact:'Possibly named after \'picadills\', the fancy ruffled collars once sold by a tailor on this street.', wikiTitle:'Piccadilly'},
  {id:'reg', name:'Regent Street', group:'Green', color:'#3f8f5c', price:300, lat:51.5090, lng:-0.1405, type:'street', fact:'Designed by John Nash in the early 1800s as a grand curved boulevard for the Prince Regent.', wikiTitle:'Regent Street'},
  {id:'oxf', name:'Oxford Street', group:'Green', color:'#3f8f5c', price:300, lat:51.5154, lng:-0.1416, type:'street', fact:'Europe\'s busiest shopping street, with roughly half a million visitors on a typical day.', wikiTitle:'Oxford Street'},
  {id:'bon', name:'Bond Street', group:'Green', color:'#3f8f5c', price:320, lat:51.5142, lng:-0.1466, type:'street', fact:'London\'s most exclusive shopping address, home to luxury flagship stores since the 18th century.', wikiTitle:'New Bond Street'},
  {id:'pkl', name:'Park Lane', group:'Dark Blue', color:'#2f5fa8', price:350, lat:51.5052, lng:-0.1519, type:'street', fact:'Runs along the eastern edge of Hyde Park and is one of the most expensive streets in the UK.', wikiTitle:'Park Lane'},
  {id:'may', name:'Mayfair', group:'Dark Blue', color:'#2f5fa8', price:400, lat:51.5100, lng:-0.1472, type:'street', fact:'The most expensive square on the UK Monopoly board, named after a raucous May fair held here until the 1700s.', wikiTitle:'Mayfair'},
  {id:'kgx', name:"King's Cross Station", group:'Stations', color:'#999999', price:200, lat:51.5308, lng:-0.1238, type:'station', fact:'Its famous Platform 9¾ trolley draws Harry Potter fans from all over the world.', wikiTitle:'King\'s Cross railway station'},
  {id:'mar_st', name:'Marylebone Station', group:'Stations', color:'#999999', price:200, lat:51.5225, lng:-0.1631, type:'station', fact:'London\'s smallest main-line terminus, often used as a filming location for its old-fashioned look.', wikiTitle:'Marylebone station'},
  {id:'fen', name:'Fenchurch Street Station', group:'Stations', color:'#999999', price:200, lat:51.5115, lng:-0.0788, type:'station', fact:'The only London terminus with no Underground station directly attached.', wikiTitle:'Fenchurch Street railway station'},
  {id:'liv', name:'Liverpool Street Station', group:'Stations', color:'#999999', price:200, lat:51.5178, lng:-0.0823, type:'station', fact:'Built on the site of the old Bethlem (\'Bedlam\') psychiatric hospital.', wikiTitle:'Liverpool Street station'},
  {id:'chance', name:'Chance', group:'Special', color:'#CE210F', price:0, lat:51.5117, lng:-0.1240, type:'special', note:'Covent Garden Piazza'},
  {id:'chest', name:'Community Chest', group:'Special', color:'#CE210F', price:0, lat:51.5113, lng:-0.1174, type:'special', note:'Somerset House courtyard'},
];
const DEFAULT_CARDS = [
  {text:"Complimentary upgrade to Club World — enjoy the extra legroom", cash:150},
  {text:"Flight delayed — you miss your connection and rebook at your own cost", cash:-100},
  {text:"Frequent flyer miles cashed in", cash:120},
  {text:"Left your passport at security — mad dash back to collect it", cash:-80},
  {text:"Crew commend your excellent behaviour — bonus per diem", cash:200},
  {text:"Bag sent to the wrong carousel — taxi across the airport to retrieve it", cash:-60},
  {text:"Found a forgotten travel voucher in your jacket pocket", cash:90},
  {text:"Excess baggage fee", cash:-70},
  {text:"Fast Track pass — skips your biggest fine at the end", flag:'fineImmunity'},
  {text:"Upgrade voucher — the next rent you collect is doubled", flag:'rentBoost'},
  {text:"Landing Rights Auction \u2014 a sealed-bid auction just opened for a random property!", type:'auction'},
];
const STATION_RENT = {1:25, 2:50, 3:100, 4:200};
const DEFAULT_CONFIG = {startMoney:1500, geofenceRadius:250, eventEnd:null, adminPasscode:'LONDON26', finalized:false, coordOverrides:{}, startPoint:{lat:51.5080, lng:-0.1281}};
const ICON_OPTIONS = ['\ud83e\udd8a','\ud83e\udd81','\ud83d\udc27','\ud83d\ude80','\u26a1','\ud83c\udfa9','\ud83e\udd85','\ud83d\udc1d','\ud83c\udfaf','\ud83c\udf40','\ud83d\udc51','\ud83d\udd25','\ud83d\udc33','\ud83c\udf88','\ud83d\udef8','\ud83c\udf1f'];

// These four are now per-game runtime data, loaded by loadGameData().
let PROPERTIES = [];
let SPECIALS = [];
let GROUP_ORDER = [];
let CARDS = [];
let ALL_POINTS = [];

function applyLocations(locations){
  PROPERTIES = locations.filter(l=>l.type!=='special');
  SPECIALS = locations.filter(l=>l.type==='special');
  ALL_POINTS = PROPERTIES.concat(SPECIALS);
  const seen = [];
  PROPERTIES.forEach(p=>{ if(!seen.includes(p.group)) seen.push(p.group); });
  GROUP_ORDER = seen;
}
async function loadGameData(){
  applyLocations(MONOPOLY_TEMPLATE_LOCATIONS.map(l=>({...l})));
  CARDS = DEFAULT_CARDS.map((c,i)=>({...c, id:'d'+i}));
  if(!currentGameId) return;
  try{
    const locSnap = await db.ref(gamePath('/locations')).once('value');
    if(locSnap.exists()){
      const val = locSnap.val();
      const locations = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
      if(locations.length) applyLocations(locations);
    } else {
      // Lazy-seed so this game has its own persisted copy going forward.
      const seedLocs = {};
      PROPERTIES.concat(SPECIALS).forEach(l=>{ seedLocs[l.id] = l; });
      await db.ref(gamePath('/locations')).set(seedLocs);
    }
  }catch(e){}
  try{
    const cardSnap = await db.ref(gamePath('/cards')).once('value');
    if(cardSnap.exists()){
      const val = cardSnap.val();
      const loaded = Object.keys(val).map(k=>({...val[k], id:k}));
      if(loaded.length) CARDS = loaded;
    } else {
      const seed = {};
      DEFAULT_CARDS.forEach((c)=>{ const key = db.ref(gamePath('/cards')).push().key; seed[key] = c; });
      await db.ref(gamePath('/cards')).set(seed);
      CARDS = Object.keys(seed).map(k=>({...seed[k], id:k}));
    }
  }catch(e){}
}

// ================= STATE =================
let currentTeam = null;
let currentRole = null;
let currentPosition = null;
let config = {...DEFAULT_CONFIG};
let deviceHeading = null;
let notifiedIds = new Set();
let lastLocationWrite = 0;
let adminUnlocked = false;
let leafletMap = null, leafletMarkersLayer = null, leafletYouMarker = null, teamMarkersLayer = null;
let selectedMapId = null;
let sortMode = 'group';
let activeAuctionListener = null;
let auctionTimerInterval = null;
let playerMap = null, playerMarkersLayer = null, playerMeMarker = null;
const photoCache = {};

// ================= HELPERS =================
function haversine(lat1,lon1,lat2,lon2){
  const R=6371000, toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function bearing(lat1,lon1,lat2,lon2){
  const toRad=d=>d*Math.PI/180, toDeg=r=>r*180/Math.PI;
  const y=Math.sin(toRad(lon2-lon1))*Math.cos(toRad(lat2));
  const x=Math.cos(toRad(lat1))*Math.sin(toRad(lat2))-Math.sin(toRad(lat1))*Math.cos(toRad(lat2))*Math.cos(toRad(lon2-lon1));
  return (toDeg(Math.atan2(y,x))+360)%360;
}
function fmtDist(m){ if(m==null) return '—'; return m<1000 ? Math.round(m)+' m' : (m/1000).toFixed(1)+' km'; }
function fmtAgo(ts){ if(!ts) return 'never'; const s=Math.round((Date.now()-ts)/1000); if(s<60) return s+'s ago'; if(s<3600) return Math.round(s/60)+'m ago'; return Math.round(s/3600)+'h ago'; }
function baseRent(prop){ return Math.round(prop.price/5); }
function getLatLng(item){
  const o = config.coordOverrides && config.coordOverrides[item.id];
  return o ? o : {lat:item.lat, lng:item.lng};
}
function toast(msg, isCard){
  const el = document.createElement('div');
  el.className = 'toast' + (isCard ? ' card' : '');
  el.textContent = msg;
  document.getElementById('toast-stack').appendChild(el);
  setTimeout(()=>el.remove(), 5000);
}
function notify(title, body){
  toast(title + ' — ' + body);
  if(window.Notification && Notification.permission === 'granted'){
    try{ new Notification(title, {body}); }catch(e){}
  }
}

// ---- storage wrappers ----
async function loadConfig(){
  try{
    const snap = await db.ref(gamePath('/config')).once('value');
    config = snap.exists() ? {...DEFAULT_CONFIG, ...snap.val()} : {...DEFAULT_CONFIG};
  }catch(e){ config = {...DEFAULT_CONFIG}; }
}
async function saveConfig(){ await db.ref(gamePath('/config')).set(config); }
async function loadTeam(name){
  try{
    const snap = await db.ref(gamePath('/teams/')+safeKey(name)).once('value');
    return snap.exists() ? snap.val() : null;
  }catch(e){ return null; }
}
async function saveTeam(team){ await db.ref(gamePath('/teams/')+safeKey(team.name)).set(team); }
async function listTeams(){
  const out = {};
  try{
    const snap = await db.ref(gamePath('/teams')).once('value');
    if(snap.exists()){
      const val = snap.val();
      Object.keys(val).forEach(k=>{ const t = val[k]; if(t && t.name) out[t.name] = t; });
    }
  }catch(e){}
  return out;
}
function getDeviceId(){
  try{
    let id = localStorage.getItem('lr_device_id');
    if(!id){ id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('lr_device_id', id); }
    return id;
  }catch(e){ return 'dev_session_' + Math.random().toString(36).slice(2); }
}
async function claimDeviceForTeam(team){
  const myId = getDeviceId();
  if(team.lockedDeviceId && team.lockedDeviceId !== myId) return {ok:false};
  if(!team.lockedDeviceId){ team.lockedDeviceId = myId; await saveTeam(team); }
  return {ok:true};
}
function populateIconSelect(selectEl, current){
  if(!selectEl) return;
  selectEl.innerHTML = '';
  ICON_OPTIONS.forEach(ic=>{
    const opt = document.createElement('option');
    opt.value = ic; opt.textContent = ic;
    if(ic === current) opt.selected = true;
    selectEl.appendChild(opt);
  });
}
async function logActivity(type, teamName, detail){
  try{ await db.ref(gamePath('/activity')).push({type, team: teamName, detail: detail||{}, ts: Date.now()}); }catch(e){}
}
function activityLine(entry){
  const time = new Date(entry.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  let text = '';
  const d = entry.detail || {};
  if(entry.type==='buy') text = `${entry.team} bought ${d.propertyName}`;
  else if(entry.type==='visit') text = `${entry.team} visited ${d.propertyName}`;
  else if(entry.type==='rent') text = `${entry.team} paid rent on ${d.propertyName} to ${d.owner}`;
  else if(entry.type==='chance_cash' || entry.type==='chance_flag' || entry.type==='chance_auction_trigger') text = `${entry.team} drew a card at ${d.locationLabel}`;
  else if(entry.type==='auction_won') text = `${entry.team} won ${d.propertyName} at auction for £${d.amount}`;
  else if(entry.type==='meetup_fine') text = `${entry.team} fined £${d.amount} for missing the meetup deadline`;
  else if(entry.type==='finalize_fine') text = `${entry.team} fined £${d.amount} for not visiting ${d.propertyName}`;
  else if(entry.type==='challenge_bonus') text = `${entry.team} awarded £${d.amount} for "${d.challengeTitle}"`;
  else text = `${entry.team||''} ${entry.type}`;
  return `<div class="activity-row">${text}<div class="at">${time}</div></div>`;
}
async function renderActivityFeed(elId, limit){
  const el = document.getElementById(elId);
  if(!el) return;
  el.innerHTML = '<div class="empty">Loading…</div>';
  try{
    const snap = await db.ref(gamePath('/activity')).limitToLast(limit).once('value');
    if(!snap.exists()){ el.innerHTML = '<div class="empty">No activity yet.</div>'; return; }
    const val = snap.val();
    const entries = Object.values(val).sort((a,b)=>b.ts-a.ts);
    el.innerHTML = entries.map(activityLine).join('');
  }catch(e){ el.innerHTML = '<div class="empty">Could not load activity.</div>'; }
}
async function renderOwnPropertyActivity(){
  if(!currentTeam) return;
  const el = document.getElementById('own-activity-list');
  const card = document.getElementById('own-activity-card');
  if(!el || !card) return;
  try{
    const snap = await db.ref(gamePath('/activity')).limitToLast(50).once('value');
    if(!snap.exists()){ card.style.display='none'; return; }
    const val = snap.val();
    const entries = Object.values(val).filter(e=>e.type==='rent' && e.detail && e.detail.owner===currentTeam.name).sort((a,b)=>b.ts-a.ts).slice(0,10);
    if(entries.length===0){ card.style.display='none'; return; }
    card.style.display='block';
    el.innerHTML = entries.map(activityLine).join('');
  }catch(e){}
}
async function saveSnapshot(){
  const teamsData = await listTeams();
  const standings = Object.values(teamsData).map(t=>{
    const portfolioValue = (t.owned||[]).reduce((sum,id)=>{const p=PROPERTIES.find(pp=>pp.id===id); return sum+(p?p.price:0);},0);
    return {name:t.name, cash:t.cash||0, netWorth:(t.cash||0)+portfolioValue, owned:(t.owned||[]).length};
  });
  await db.ref(gamePath('/snapshots')).push({ts:Date.now(), standings});
}
function getNearestRemaining(){
  if(!currentTeam || !currentPosition) return null;
  const remaining = PROPERTIES.filter(p=>!(currentTeam.visited && currentTeam.visited[p.id]))
    .concat(SPECIALS.filter(s=>!(currentTeam.specialDraws && currentTeam.specialDraws[s.id])));
  if(remaining.length===0) return null;
  let nearest=null, nd=Infinity;
  remaining.forEach(p=>{
    const c = getLatLng(p);
    const d = haversine(currentPosition.latitude, currentPosition.longitude, c.lat, c.lng);
    if(d<nd){ nd=d; nearest=p; }
  });
  return nearest;
}
function ownershipMap(teamsData){
  const map = {};
  Object.values(teamsData).forEach(t=>(t.owned||[]).forEach(pid=>{ map[pid] = t.name; }));
  return map;
}
function currentRent(prop, ownerName, teamsData){
  if(!ownerName) return prop.type==='station' ? STATION_RENT[1] : baseRent(prop);
  const owner = teamsData[ownerName];
  if(!owner) return baseRent(prop);
  if(prop.type==='station'){
    const n = (owner.owned||[]).filter(id=>PROPERTIES.find(p=>p.id===id)?.type==='station').length;
    return STATION_RENT[n] || STATION_RENT[4];
  }
  let rent = baseRent(prop);
  const groupProps = PROPERTIES.filter(p=>p.group===prop.group);
  const ownsAll = groupProps.every(p=>(owner.owned||[]).includes(p.id));
  if(ownsAll) rent *= 2;
  return rent;
}

// ================= ROLE GATE =================
async function populateTeamSelect(selectEl){
  const teams = await listTeams();
  selectEl.innerHTML = '<option value="">— choose team —</option>';
  Object.keys(teams).sort().forEach(name=>{
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    selectEl.appendChild(opt);
  });
  return teams;
}
function showGateForm(id){
  document.getElementById('role-choice-card').style.display = id ? 'none' : 'block';
  document.getElementById('role-team-form').style.display = id==='role-team-form' ? 'block':'none';
  document.getElementById('role-admin-form').style.display = id==='role-admin-form' ? 'block':'none';
}
document.getElementById('role-team-btn').addEventListener('click', async ()=>{
  await loadConfig();
  await populateTeamSelect(document.getElementById('gate-team-select'));
  showGateForm('role-team-form');
});
document.getElementById('role-admin-btn').addEventListener('click', async ()=>{
  await loadConfig();
  showGateForm('role-admin-form');
});
document.getElementById('role-spectator-btn').addEventListener('click', ()=>{ enterApp('spectator'); });
document.getElementById('gate-team-back-btn').addEventListener('click', ()=>showGateForm(null));
document.getElementById('gate-admin-back-btn').addEventListener('click', ()=>showGateForm(null));

document.getElementById('gate-team-enter-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('gate-team-select').value;
  const pin = document.getElementById('gate-team-pin').value.trim();
  const statusEl = document.getElementById('gate-team-status');
  if(!name){ statusEl.textContent = 'Choose a team.'; statusEl.className='status-line err'; return; }
  const team = await loadTeam(name);
  if(!team){ statusEl.textContent = 'Team not found.'; statusEl.className='status-line err'; return; }
  if((team.pin||'') !== pin){ statusEl.textContent = 'Incorrect PIN.'; statusEl.className='status-line err'; return; }
  const claim = await claimDeviceForTeam(team);
  if(!claim.ok){ statusEl.textContent = 'This team is already signed in on another device. Ask your organiser to unlock it.'; statusEl.className='status-line err'; return; }
  currentTeam = team;
  enterApp('team');
});
document.getElementById('gate-admin-enter-btn').addEventListener('click', async ()=>{
  const val = document.getElementById('gate-admin-pass').value;
  const statusEl = document.getElementById('gate-admin-status');
  if(val !== config.adminPasscode){ statusEl.textContent = 'Incorrect passcode.'; statusEl.className='status-line err'; return; }
  adminUnlocked = true;
  enterApp('admin');
});
document.getElementById('switch-role-btn').addEventListener('click', ()=>{
  if(activeAuctionListener){ db.ref(gamePath('/activeAuction')).off('value', activeAuctionListener); activeAuctionListener = null; }
  currentTeam = null; currentRole = null; adminUnlocked = false;
  document.getElementById('app-main').style.display = 'none';
  document.getElementById('role-gate').style.display = 'block';
  document.getElementById('gate-team-pin').value = '';
  document.getElementById('gate-admin-pass').value = '';
  showGateForm(null);
});

function configureNavForRole(role){
  const map = { team:['play','board','leaderboard'], admin:['admin','board','leaderboard'], spectator:['leaderboard'] };
  const allowed = map[role] || [];
  document.querySelectorAll('nav.tabs button').forEach(btn=>{
    btn.style.display = allowed.includes(btn.dataset.view) ? '' : 'none';
  });
}
function switchView(viewName){
  document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.toggle('active', b.dataset.view===viewName));
  document.querySelectorAll('section.view').forEach(v=>v.classList.toggle('active', v.id==='view-'+viewName));
  if(viewName==='leaderboard') renderLeaderboard();
  if(viewName==='board') renderBoardOverview();
  if(viewName==='admin' && currentRole==='admin'){ renderTracking(); }
}
document.querySelectorAll('nav.tabs button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    switchView(btn.dataset.view);
    const navEl = document.querySelector('nav.tabs');
    if(navEl) navEl.classList.remove('mobile-open');
  });
});
document.querySelectorAll('#admin-subnav button').forEach(btn=>{
  btn.addEventListener('click', async ()=>{
    document.querySelectorAll('#admin-subnav button').forEach(b=>b.classList.toggle('active', b===btn));
    document.querySelectorAll('.admin-subpanel').forEach(p=>{
      p.style.display = (p.dataset.adminPanel === btn.dataset.adminTab) ? '' : 'none';
    });
    if(btn.dataset.adminTab === 'setup'){
      renderLocationsMap();
      renderCardsManager();
      renderChallengesList();
      renderChallengeSubmissions();
      const teamsData = await listTeams();
      renderTeamMarkersOnMap(teamsData);
    }
    if(btn.dataset.adminTab === 'log'){
      renderActionLog();
    }
  });
});
const topnavBurger = document.getElementById('topnav-burger');
if(topnavBurger){
  topnavBurger.addEventListener('click', ()=>{
    const navEl = document.querySelector('nav.tabs');
    if(navEl) navEl.classList.toggle('mobile-open');
  });
}

async function enterApp(role){
  currentRole = role;
  await loadConfig();
  document.getElementById('role-gate').style.display = 'none';
  document.getElementById('app-main').style.display = 'block';
  configureNavForRole(role);
  const envBadge = document.getElementById('env-badge');
  if(envBadge){ envBadge.textContent = currentGameName || currentGameId; envBadge.style.display = 'inline-block'; }
  const subtitles = {
    team: `Playing as "${currentTeam ? (currentTeam.icon?currentTeam.icon+' ':'') + currentTeam.name : ''}".`,
    admin: 'Organiser view — setup, safety tracking, and results.',
    spectator: 'Following along live — leaderboard only.'
  };
  document.getElementById('role-subtitle').textContent = subtitles[role] || '';
  if(role==='team'){
    refreshWallet();
    renderSpecials();
    renderStops();
    startGPS();
    renderOwnPropertyActivity();
    renderTeamChallenges();
    if(activeAuctionListener) db.ref(gamePath('/activeAuction')).off('value', activeAuctionListener);
    activeAuctionListener = (snap)=>renderAuctionUI(snap.val());
    db.ref(gamePath('/activeAuction')).on('value', activeAuctionListener);
    checkMeetupFine();
    switchView('play');
  } else if(role==='admin'){
    document.getElementById('cfg-startmoney').value = config.startMoney;
    document.getElementById('cfg-radius').value = config.geofenceRadius;
    document.getElementById('cfg-end').value = config.eventEnd || '';
    document.getElementById('cfg-passcode').value = config.adminPasscode;
    document.getElementById('cfg-start-lat').value = config.startPoint ? config.startPoint.lat : DEFAULT_CONFIG.startPoint.lat;
    document.getElementById('cfg-start-lng').value = config.startPoint ? config.startPoint.lng : DEFAULT_CONFIG.startPoint.lng;
    populateIconSelect(document.getElementById('new-team-icon'), null);
    renderTeamLinks();
    populateManageTeamSelect();
    renderCardsManager();
    switchView('admin');
  } else {
    switchView('leaderboard');
  }
}

// ================= NOTIFICATIONS / COMPASS PERMS =================
document.getElementById('notif-btn').addEventListener('click', async ()=>{
  if(!window.Notification){ toast('Notifications not supported on this browser.'); return; }
  const perm = await Notification.requestPermission();
  toast(perm === 'granted' ? 'Arrival alerts enabled.' : 'Alerts not enabled — you can still use in-app banners.');
});
document.getElementById('compass-perm-btn').addEventListener('click', async ()=>{
  if(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'){
    try{
      const res = await DeviceOrientationEvent.requestPermission();
      toast(res === 'granted' ? 'Compass enabled.' : 'Compass permission denied.');
    }catch(e){ toast('Compass permission request failed.'); }
  } else { toast('Compass should already be active on this device.'); }
});
window.addEventListener('deviceorientationabsolute', handleOrientation);
window.addEventListener('deviceorientation', handleOrientation);
function handleOrientation(e){
  if(e.webkitCompassHeading != null) deviceHeading = e.webkitCompassHeading;
  else if(e.alpha != null) deviceHeading = 360 - e.alpha;
}

function refreshWallet(){
  if(!currentTeam) return;
  document.getElementById('cash-display').textContent = '£' + currentTeam.cash;
  document.getElementById('portfolio-display').textContent = (currentTeam.owned||[]).length;
  const visitedCount = Object.keys(currentTeam.visited || {}).length;
  const pct = Math.round((visitedCount / PROPERTIES.length) * 100);
  document.getElementById('visited-progress-label').textContent = visitedCount + ' / ' + PROPERTIES.length + ' visited';
  const fill = document.getElementById('visited-progress-fill');
  fill.style.width = pct + '%';
  fill.className = 'ba-progress-fill ' + (pct >= 66 ? 'on-plan' : pct >= 33 ? 'warn' : 'behind');
  const flags = currentTeam.cardFlags || {};
  const bits = [];
  if(flags.fineImmunity) bits.push(flags.fineImmunity + '× Fine Immunity');
  if(flags.rentBoost) bits.push(flags.rentBoost + '× Rent Boost');
  document.getElementById('cards-display').textContent = bits.length ? 'Active cards: ' + bits.join(', ') : 'No bonus cards held';
}

// ================= GPS =================
function startGPS(){
  const statusEl = document.getElementById('gps-status');
  if(!navigator.geolocation){ statusEl.textContent = 'Geolocation not supported.'; statusEl.className='status-line err'; return; }
  navigator.geolocation.watchPosition(
    pos=>{
      currentPosition = pos.coords;
      statusEl.textContent = `Location locked · accuracy ±${Math.round(pos.coords.accuracy)}m`;
      statusEl.className = 'status-line good';
      maybeWriteLocation();
      renderStops();
      renderSpecials();
      updateCompass();
      renderPlayerMap();
    },
    err=>{ statusEl.textContent = 'Location unavailable: ' + err.message; statusEl.className='status-line err'; },
    {enableHighAccuracy:true, maximumAge:5000, timeout:15000}
  );
}
async function maybeWriteLocation(){
  if(!currentTeam || !currentPosition) return;
  const now = Date.now();
  if(now - lastLocationWrite < 15000) return;
  lastLocationWrite = now;
  currentTeam.lastLocation = {lat:currentPosition.latitude, lng:currentPosition.longitude, ts:now};
  await saveTeam(currentTeam);
}

// ================= COMPASS =================
function updateCompass(){
  if(!currentTeam || !currentPosition) return;
  const remaining = PROPERTIES.filter(p=>!(currentTeam.visited && currentTeam.visited[p.id]))
    .concat(SPECIALS.filter(s=>!(currentTeam.specialDraws && currentTeam.specialDraws[s.id])));
  if(remaining.length === 0){
    document.getElementById('compass-target').textContent = 'All stops visited!';
    document.getElementById('compass-dist').textContent = '';
    return;
  }
  let nearest = null, nd = Infinity;
  remaining.forEach(p=>{
    const c = getLatLng(p);
    const d = haversine(currentPosition.latitude, currentPosition.longitude, c.lat, c.lng);
    if(d < nd){ nd = d; nearest = p; }
  });
  const nc = getLatLng(nearest);
  const b = bearing(currentPosition.latitude, currentPosition.longitude, nc.lat, nc.lng);
  const arrowRotation = deviceHeading != null ? (b - deviceHeading + 360) % 360 : b;
  document.getElementById('compass-arrow').style.transform = `rotate(${arrowRotation}deg)`;
  document.getElementById('compass-target').textContent = nearest.name;
  document.getElementById('compass-dist').textContent = fmtDist(nd) + (deviceHeading==null ? ' · true bearing' : ' · relative to phone');
}

// ================= BOARD RENDER (Play tab) =================
function buildStopRow(p, teamsData, owners){
  const visited = currentTeam.visited && currentTeam.visited[p.id];
  const owner = owners[p.id];
  const pc = getLatLng(p);
  const dist = currentPosition ? haversine(currentPosition.latitude, currentPosition.longitude, pc.lat, pc.lng) : null;
  const inRange = dist !== null && dist <= config.geofenceRadius;
  const rent = currentRent(p, owner, teamsData);

  if(inRange && !visited && !notifiedIds.has(p.id)){
    notifiedIds.add(p.id);
    notify('You reached ' + p.name, owner ? ('Owned by ' + owner + ' — pay rent £' + rent) : ('Unowned — buy for £' + p.price));
  }

  const row = document.createElement('div');
  let rowClass = 'stop';
  if(inRange) rowClass += ' inrange';
  if(owner === currentTeam.name) rowClass += ' mine';
  else if(owner) rowClass += ' theirs';
  row.className = rowClass;

  let ownerTag = '';
  if(owner) ownerTag = `<span class="owner-tag ${owner===currentTeam.name?'mine':'theirs'}">${owner===currentTeam.name?'YOURS':owner}</span>`;

  let actionHtml = '';
  if(config.finalized){
    actionHtml = `<button class="act-disabled" disabled>ENDED</button>`;
  } else if(visited && owner !== currentTeam.name){
    actionHtml = `<button class="act-visited" disabled>VISITED</button>`;
  } else if(!inRange){
    actionHtml = `<button class="act-disabled" disabled>TOO FAR</button>`;
  } else if(!owner){
    actionHtml = `<button class="act-buy" data-action="buy" data-id="${p.id}">BUY £${p.price}</button><button class="act-visited" data-action="pass" data-id="${p.id}">JUST VISIT</button>`;
  } else if(owner === currentTeam.name){
    actionHtml = `<button class="act-visited" disabled>OWNED BY YOU</button>`;
  } else {
    actionHtml = `<button class="act-rent" data-action="rent" data-id="${p.id}">PAY RENT £${rent}</button>`;
  }

  row.innerHTML = `
    <div class="stop-swatch" style="background:${p.color}"></div>
    <div class="stop-body">
      <div class="stop-name">${p.name} ${ownerTag}</div>
      <div class="stop-meta">${dist!==null?fmtDist(dist)+' away':'locating…'} · £${p.price} to buy · rent £${rent} · ${p.group}</div>
      <button class="info-toggle" data-info="${p.id}">ℹ️ info</button>
      <div class="stop-detail" id="detail-${p.id}">
        <div>${p.fact||''}</div>
        <img id="photo-${p.id}" style="display:none;">
      </div>
    </div>
    <div class="stop-actions">${actionHtml}</div>
  `;
  return row;
}
async function toggleInfo(propId){
  const detail = document.getElementById('detail-'+propId);
  if(!detail) return;
  const opening = !detail.classList.contains('open');
  detail.classList.toggle('open');
  if(!opening) return;
  const img = document.getElementById('photo-'+propId);
  if(!img) return;
  if(photoCache[propId]){ img.src = photoCache[propId]; img.style.display = 'block'; return; }
  const prop = PROPERTIES.find(p=>p.id===propId);
  if(!prop || !prop.wikiTitle) return;
  try{
    const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(prop.wikiTitle));
    if(res.ok){
      const data = await res.json();
      if(data.thumbnail && data.thumbnail.source){
        photoCache[propId] = data.thumbnail.source;
        img.src = data.thumbnail.source;
        img.style.display = 'block';
      }
    }
  }catch(e){}
}
async function renderStops(){
  if(!currentTeam) return;
  const teamsData = await listTeams();
  teamsData[currentTeam.name] = currentTeam;
  const owners = ownershipMap(teamsData);
  const container = document.getElementById('stops-container');
  container.innerHTML = '';

  if(sortMode === 'distance'){
    const sorted = [...PROPERTIES].sort((a,b)=>{
      if(!currentPosition) return 0;
      const ca = getLatLng(a), cb = getLatLng(b);
      const da = haversine(currentPosition.latitude, currentPosition.longitude, ca.lat, ca.lng);
      const db_ = haversine(currentPosition.latitude, currentPosition.longitude, cb.lat, cb.lng);
      return da - db_;
    });
    const grid = document.createElement('div');
    grid.className = 'group-grid';
    sorted.forEach(p=>grid.appendChild(buildStopRow(p, teamsData, owners)));
    container.appendChild(grid);
  } else {
    GROUP_ORDER.forEach(group=>{
      const items = PROPERTIES.filter(p=>p.group===group);
      const gh = document.createElement('div');
      gh.className = 'group-header';
      gh.innerHTML = `<span class="swatch" style="background:${items[0].color}"></span><span class="group-title">${group}</span>`;
      container.appendChild(gh);
      const groupGrid = document.createElement('div');
      groupGrid.className = 'group-grid';
      items.forEach(p=>groupGrid.appendChild(buildStopRow(p, teamsData, owners)));
      container.appendChild(groupGrid);
    });
  }

  container.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click', ()=>handleAction(btn.dataset.action, btn.dataset.id));
  });
  container.querySelectorAll('[data-info]').forEach(btn=>{
    btn.addEventListener('click', ()=>toggleInfo(btn.dataset.info));
  });
}
document.querySelectorAll('.sort-row button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    sortMode = btn.dataset.sort;
    document.querySelectorAll('.sort-row button').forEach(b=>b.classList.toggle('active', b===btn));
    renderStops();
  });
});

async function handleAction(action, propId){
  const prop = PROPERTIES.find(p=>p.id===propId);
  if(!prop || !currentTeam) return;
  const teamsData = await listTeams();
  const owners = ownershipMap(teamsData);
  currentTeam.visited = currentTeam.visited || {};

  if(action === 'pass'){
    currentTeam.visited[propId] = Date.now();
    await saveTeam(currentTeam);
    await logActivity('visit', currentTeam.name, {propertyId: prop.id, propertyName: prop.name});
    toast('Marked ' + prop.name + ' as visited.');
  } else if(action === 'buy'){
    if(owners[propId]){ toast('Someone just bought that — refreshing.'); }
    else if(currentTeam.cash < prop.price){ toast('Not enough cash to buy ' + prop.name + '.'); }
    else{
      currentTeam.cash -= prop.price;
      currentTeam.owned = currentTeam.owned || [];
      currentTeam.owned.push(propId);
      currentTeam.visited[propId] = Date.now();
      currentTeam.lastPurchase = {name: prop.name, ts: Date.now()};
      await saveTeam(currentTeam);
      await logActivity('buy', currentTeam.name, {propertyId: prop.id, propertyName: prop.name, price: prop.price});
      toast('Bought ' + prop.name + ' for £' + prop.price + '!');
    }
  } else if(action === 'rent'){
    const ownerName = owners[propId];
    const ownerTeam = teamsData[ownerName];
    if(!ownerTeam){ toast('Owner data missing — try refresh.'); }
    else{
      let rent = currentRent(prop, ownerName, teamsData);
      let boosted = false;
      if(ownerTeam.cardFlags && ownerTeam.cardFlags.rentBoost > 0){
        rent *= 2; boosted = true;
        ownerTeam.cardFlags.rentBoost -= 1;
      }
      currentTeam.cash -= rent;
      currentTeam.visited[propId] = Date.now();
      ownerTeam.cash += rent;
      await saveTeam(ownerTeam);
      await saveTeam(currentTeam);
      await logActivity('rent', currentTeam.name, {propertyId: prop.id, propertyName: prop.name, owner: ownerName, amount: rent, boosted});
      toast('Paid £' + rent + ' rent to ' + ownerName + (boosted ? ' (doubled by their Rent Boost card!)' : '') + '.');
    }
  }
  refreshWallet();
  renderStops();
  renderOwnPropertyActivity();
}

// ================= SPECIALS =================
function renderSpecials(){
  if(!currentTeam) return;
  const container = document.getElementById('special-stops');
  container.innerHTML = '<div class="group-header"><span class="swatch" style="background:var(--red)"></span><span class="group-title">Chance &amp; Community Chest</span></div>';
  const specialGrid = document.createElement('div');
  specialGrid.className = 'group-grid';
  currentTeam.specialDraws = currentTeam.specialDraws || {};
  SPECIALS.forEach(s=>{
    const drawn = currentTeam.specialDraws[s.id];
    const sc = getLatLng(s);
    const dist = currentPosition ? haversine(currentPosition.latitude, currentPosition.longitude, sc.lat, sc.lng) : null;
    const inRange = dist !== null && dist <= config.geofenceRadius;
    const row = document.createElement('div');
    row.className = 'stop' + (inRange && !drawn ? ' inrange' : '');
    row.innerHTML = `
      <div class="stop-swatch" style="background:var(--red)"></div>
      <div class="stop-body">
        <div class="stop-name">${s.name}</div>
        <div class="stop-meta">${s.note} · ${dist!==null?fmtDist(dist)+' away':'locating…'}</div>
      </div>
      <div class="stop-actions">
        ${config.finalized ? `<button class="act-disabled" disabled>ENDED</button>` :
          drawn ? `<button class="act-visited" disabled>DRAWN</button>` :
          inRange ? `<button class="act-buy" data-special="${s.id}">DRAW CARD</button>` :
          `<button class="act-disabled" disabled>TOO FAR</button>`}
      </div>
    `;
    specialGrid.appendChild(row);
  });
  container.appendChild(specialGrid);
  container.querySelectorAll('[data-special]').forEach(btn=>{
    btn.addEventListener('click', ()=>drawCard(btn.dataset.special));
  });
}
async function drawCard(specialId){
  if(!currentTeam) return;
  const card = CARDS[Math.floor(Math.random()*CARDS.length)];
  currentTeam.specialDraws = currentTeam.specialDraws || {};
  currentTeam.specialDraws[specialId] = true;
  const specialObj = SPECIALS.find(s=>s.id===specialId);
  const locationLabel = specialObj ? specialObj.name : specialId;
  if(card.type === 'auction'){
    await saveTeam(currentTeam);
    await logActivity('chance_auction_trigger', currentTeam.name, {specialId, locationLabel, text: card.text});
    await startAuction();
    toast(card.text, true);
  } else if(card.cash != null){
    currentTeam.cash += card.cash;
    await saveTeam(currentTeam);
    await logActivity('chance_cash', currentTeam.name, {specialId, locationLabel, text: card.text, cash: card.cash});
    toast(card.text + (card.cash>=0?' (+£':' (-£')+Math.abs(card.cash)+')', true);
  } else if(card.flag){
    currentTeam.cardFlags = currentTeam.cardFlags || {};
    currentTeam.cardFlags[card.flag] = (currentTeam.cardFlags[card.flag]||0) + 1;
    await saveTeam(currentTeam);
    await logActivity('chance_flag', currentTeam.name, {specialId, locationLabel, text: card.text, flag: card.flag});
    toast(card.text + ' (bonus card added)', true);
  }
  refreshWallet();
  renderSpecials();
}

// ================= BOARD OVERVIEW =================
async function renderBoardOverview(){
  const el = document.getElementById('board-overview');
  el.innerHTML = '<div class="empty">Loading…</div>';
  const teamsData = await listTeams();
  const owners = ownershipMap(teamsData);
  el.innerHTML = '';
  GROUP_ORDER.forEach(group=>{
    const items = PROPERTIES.filter(p=>p.group===group);
    const gh = document.createElement('div');
    gh.className = 'group-header';
    gh.innerHTML = `<span class="swatch" style="background:${items[0].color}"></span><span class="group-title">${group}</span>`;
    el.appendChild(gh);
    const grid = document.createElement('div');
    grid.className = 'group-grid';
    items.forEach(p=>{
      const owner = owners[p.id];
      const rent = currentRent(p, owner, teamsData);
      const row = document.createElement('div');
      row.className = 'stop';
      row.innerHTML = `
        <div class="stop-swatch" style="background:${p.color}"></div>
        <div class="stop-body">
          <div class="stop-name">${p.name} ${owner?`<span class="owner-tag theirs">${owner}</span>`:''}</div>
          <div class="stop-meta">£${p.price} · rent £${rent}</div>
        </div>`;
      grid.appendChild(row);
    });
    el.appendChild(grid);
  });
  renderActivityFeed('board-activity-list', 40);
}

// ================= LEADERBOARD =================
function nearestLabelFor(loc){
  if(!loc) return 'no location yet';
  let np=null, nd=Infinity;
  ALL_POINTS.forEach(p=>{
    const c = getLatLng(p);
    const d = haversine(loc.lat, loc.lng, c.lat, c.lng);
    if(d<nd){ nd=d; np=p; }
  });
  return np ? ('near ' + np.name + ' · ' + fmtAgo(loc.ts)) : 'unknown';
}
async function renderLeaderboard(){
  const listEl = document.getElementById('leaderboard-list');
  const podiumEl = document.getElementById('podium-section');
  listEl.innerHTML = '<div class="empty">Loading standings…</div>';
  const teamsData = await listTeams();
  const teams = Object.values(teamsData);
  if(teams.length === 0){ listEl.innerHTML = '<div class="empty">No teams registered yet.</div>'; if(podiumEl) podiumEl.style.display = 'none'; renderActivityFeed('public-activity-list', 15); return; }
  teams.forEach(t=>{
    const portfolioValue = (t.owned||[]).reduce((sum,id)=>{ const p=PROPERTIES.find(pp=>pp.id===id); return sum+(p?p.price:0); },0);
    t.netWorth = (t.cash||0) + portfolioValue;
  });
  teams.sort((a,b)=>b.netWorth - a.netWorth);
  if(podiumEl){
    if(config.finalized){
      const medals = ['🥇','🥈','🥉'];
      const podiumHtml = teams.slice(0,3).map((t,i)=>`
        <div style="flex:1; text-align:center; background:${i===0?'var(--ba-blue-dark)':'var(--white)'}; color:${i===0?'var(--white)':'var(--navy)'}; border:1px solid #ddd; border-radius:8px; padding:${i===0?'22px 12px':'14px 10px'}; ${i===0?'order:2;':i===1?'order:1;':'order:3;'}">
          <div style="font-size:${i===0?'34px':'26px'};">${medals[i]}</div>
          <div style="font-weight:800; font-size:${i===0?'15px':'13px'}; margin-top:4px;">${t.icon?t.icon+' ':''}${t.name}</div>
          <div style="font-size:11px; opacity:0.8; margin-top:2px;">£${t.netWorth}</div>
        </div>`).join('');
      podiumEl.innerHTML = `
        <div class="card" style="text-align:center;">
          <h2 style="font-size:16px; text-transform:none; letter-spacing:0; color:var(--navy);">🏆 Final Results</h2>
          <div style="display:flex; align-items:flex-end; gap:10px; margin-top:10px;">${podiumHtml}</div>
        </div>`;
      podiumEl.style.display = 'block';
    } else {
      podiumEl.style.display = 'none';
    }
  }
  const rows = teams.map((t,i)=>{
    const lastBought = t.lastPurchase ? t.lastPurchase.name : 'none yet';
    return `<tr>
      <td class="ba-rank-cell ${i===0?'gold':''}">${i+1}</td>
      <td><strong>${t.icon?t.icon+' ':''}${t.name}</strong></td>
      <td>${(t.owned||[]).length}</td>
      <td>£${t.cash||0}</td>
      <td>${lastBought}</td>
      <td>${nearestLabelFor(t.lastLocation)}</td>
      <td style="font-weight:800; color:var(--ba-blue-corp);">£${t.netWorth}</td>
    </tr>`;
  }).join('');
  listEl.innerHTML = `<div class="scroll-x"><table class="ba-table">
    <thead><tr><th></th><th>Team</th><th>Owned</th><th>Cash</th><th>Last bought</th><th>Last seen</th><th>Net worth</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
  renderActivityFeed('public-activity-list', 15);
}
document.getElementById('lb-refresh-btn').addEventListener('click', renderLeaderboard);

// ================= ADMIN =================
document.getElementById('cfg-save-btn').addEventListener('click', async ()=>{
  config.startMoney = parseInt(document.getElementById('cfg-startmoney').value) || DEFAULT_CONFIG.startMoney;
  config.geofenceRadius = parseInt(document.getElementById('cfg-radius').value) || DEFAULT_CONFIG.geofenceRadius;
  config.eventEnd = document.getElementById('cfg-end').value || null;
  config.adminPasscode = document.getElementById('cfg-passcode').value || DEFAULT_CONFIG.adminPasscode;
  const sLat = parseFloat(document.getElementById('cfg-start-lat').value);
  const sLng = parseFloat(document.getElementById('cfg-start-lng').value);
  config.startPoint = (!isNaN(sLat) && !isNaN(sLng)) ? {lat:sLat, lng:sLng} : DEFAULT_CONFIG.startPoint;
  await saveConfig();
  document.getElementById('cfg-status').textContent = 'Settings saved.';
  document.getElementById('cfg-status').className = 'status-line good';
});
document.getElementById('cfg-start-locate-btn').addEventListener('click', ()=>{
  if(!navigator.geolocation){ toast('Geolocation not supported.'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    document.getElementById('cfg-start-lat').value = pos.coords.latitude.toFixed(5);
    document.getElementById('cfg-start-lng').value = pos.coords.longitude.toFixed(5);
  }, err=>toast('Could not get location: ' + err.message));
});


function generateToken(){
  const chars = 'abcdefghijkmnopqrstuvwxyz23456789';
  let s = '';
  for(let i=0;i<10;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

document.getElementById('new-team-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('new-team-name').value.trim();
  const icon = document.getElementById('new-team-icon').value || ICON_OPTIONS[0];
  const pinRaw = document.getElementById('new-team-pin').value.trim();
  const playersRaw = document.getElementById('new-team-players').value.trim();
  const ecName = document.getElementById('new-team-ec-name').value.trim();
  const ecPhone = document.getElementById('new-team-ec-phone').value.trim();
  const statusEl = document.getElementById('new-team-status');
  if(!name){ statusEl.textContent = 'Team name is required.'; statusEl.className='status-line err'; return; }
  const existing = await loadTeam(name);
  if(existing){ statusEl.textContent = 'A team with that name already exists.'; statusEl.className='status-line err'; return; }
  const pin = pinRaw || String(Math.floor(1000 + Math.random()*9000));
  const team = {
    name, icon, pin, token: generateToken(),
    players: playersRaw ? playersRaw.split(',').map(s=>s.trim()).filter(Boolean) : [],
    emergencyContact: {name:ecName, phone:ecPhone},
    cash: config.startMoney,
    visited: {}, owned: [], cardFlags: {}, specialDraws: {}, lastLocation: null, lastPurchase: null,
    createdAt: Date.now()
  };
  await saveTeam(team);
  statusEl.textContent = `Team "${name}" added with £${config.startMoney}. PIN: ${pin} — their direct link is below.`;
  statusEl.className = 'status-line good';
  document.getElementById('new-team-name').value = '';
  document.getElementById('new-team-pin').value = '';
  document.getElementById('new-team-players').value = '';
  document.getElementById('new-team-ec-name').value = '';
  document.getElementById('new-team-ec-phone').value = '';
  populateIconSelect(document.getElementById('new-team-icon'), null);
  renderTeamLinks();
  populateManageTeamSelect();
});

async function populateManageTeamSelect(){
  const sel = document.getElementById('manage-team-select');
  if(!sel) return;
  const teams = await listTeams();
  const prev = sel.value;
  sel.innerHTML = '<option value="">— choose team —</option>';
  Object.keys(teams).sort().forEach(name=>{
    const opt = document.createElement('option'); opt.value = name; opt.textContent = name; sel.appendChild(opt);
  });
  if(prev) sel.value = prev;
}
document.getElementById('manage-team-select').addEventListener('change', async (e)=>{
  const name = e.target.value;
  const fieldsEl = document.getElementById('manage-team-fields');
  if(!name){ fieldsEl.style.display = 'none'; return; }
  const team = await loadTeam(name);
  if(!team) return;
  populateIconSelect(document.getElementById('edit-team-icon'), team.icon);
  document.getElementById('edit-team-pin').value = team.pin || '';
  document.getElementById('edit-team-players').value = (team.players||[]).join(', ');
  document.getElementById('edit-team-ec-name').value = (team.emergencyContact && team.emergencyContact.name) || '';
  document.getElementById('edit-team-ec-phone').value = (team.emergencyContact && team.emergencyContact.phone) || '';
  document.getElementById('edit-team-cash').value = team.cash || 0;
  fieldsEl.style.display = 'block';
});
document.getElementById('edit-team-save-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('manage-team-select').value;
  if(!name) return;
  const team = await loadTeam(name);
  if(!team) return;
  team.icon = document.getElementById('edit-team-icon').value;
  team.pin = document.getElementById('edit-team-pin').value.trim() || team.pin;
  team.players = document.getElementById('edit-team-players').value.split(',').map(s=>s.trim()).filter(Boolean);
  team.emergencyContact = {name: document.getElementById('edit-team-ec-name').value.trim(), phone: document.getElementById('edit-team-ec-phone').value.trim()};
  team.cash = parseInt(document.getElementById('edit-team-cash').value) || 0;
  await saveTeam(team);
  document.getElementById('edit-team-status').textContent = 'Saved.';
  document.getElementById('edit-team-status').className = 'status-line good';
  renderTeamLinks(); renderTracking(); renderLeaderboard();
});
document.getElementById('edit-team-unlock-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('manage-team-select').value;
  if(!name) return;
  const team = await loadTeam(name);
  if(!team) return;
  team.lockedDeviceId = null;
  await saveTeam(team);
  document.getElementById('edit-team-status').textContent = 'Device unlocked — they can sign in on a new device now.';
  document.getElementById('edit-team-status').className = 'status-line good';
});
document.getElementById('edit-team-reset-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('manage-team-select').value;
  if(!name) return;
  if(!confirm(`Reset ${name}'s progress? This clears their cash, properties and visits back to the start — players and PIN are kept.`)) return;
  const team = await loadTeam(name);
  if(!team) return;
  team.cash = config.startMoney;
  team.visited = {}; team.owned = []; team.cardFlags = {}; team.specialDraws = {}; team.lastPurchase = null;
  await saveTeam(team);
  document.getElementById('edit-team-status').textContent = "Team progress reset.";
  document.getElementById('edit-team-status').className = 'status-line good';
  renderLeaderboard();
});

async function renderTeamLinks(){
  const el = document.getElementById('team-links-list');
  if(!el) return;
  el.innerHTML = '<div class="empty">Loading…</div>';
  const teamsData = await listTeams();
  const teams = Object.values(teamsData);
  if(teams.length === 0){ el.innerHTML = '<div class="empty">No teams yet.</div>'; return; }
  const base = window.location.origin + window.location.pathname;
  el.innerHTML = '';
  for(const t of teams){
    if(!t.token){ t.token = generateToken(); await saveTeam(t); }
    const link = base + '?game=' + encodeURIComponent(currentGameId) + '&team=' + encodeURIComponent(t.token);
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' + encodeURIComponent(link);
    const row = document.createElement('div');
    row.className = 'track-row';
    row.style.alignItems = 'center';
    row.innerHTML = `
      <img src="${qrUrl}" alt="QR code for ${t.name}" width="44" height="44" style="border-radius:4px; border:1px solid #ddd; flex-shrink:0;">
      <div class="track-name" style="flex:0 0 120px;">${t.icon?t.icon+' ':''}${t.name}</div>
      <input type="text" readonly value="${link}" style="flex:1; font-size:11px; padding:6px 8px; border-radius:6px; border:1px solid var(--grey1);" onclick="this.select()">
      <button class="btn secondary" data-copy-link="${link}" style="padding:6px 10px; font-size:11px; flex-shrink:0;">Copy</button>
      <a class="btn secondary" href="${qrUrl.replace('120x120','400x400')}" target="_blank" style="padding:6px 10px; font-size:11px; flex-shrink:0; text-decoration:none;">Print QR</a>
    `;
    el.appendChild(row);
  }
  el.querySelectorAll('[data-copy-link]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      try{ await navigator.clipboard.writeText(btn.dataset.copyLink); toast('Link copied.'); }
      catch(e){ toast('Could not copy automatically — tap the link field and copy manually.'); }
    });
  });
}
document.getElementById('team-links-refresh-btn').addEventListener('click', renderTeamLinks);

// ================= CHANCE CARDS MANAGER (per game) =================
let editingCardId = null;
document.getElementById('new-card-effect-type').addEventListener('change', (e)=>{
  document.getElementById('new-card-cash').style.display = e.target.value === 'cash' ? 'block' : 'none';
  document.getElementById('new-card-flag').style.display = e.target.value === 'flag' ? 'block' : 'none';
});
function renderCardsManager(){
  const el = document.getElementById('cards-manager-list');
  if(!el) return;
  if(CARDS.length === 0){ el.innerHTML = '<div class="empty">No cards yet — add one below.</div>'; return; }
  el.innerHTML = CARDS.map(c=>{
    let effectLabel = '';
    if(c.cash != null) effectLabel = (c.cash>=0?'+£':'-£') + Math.abs(c.cash);
    else if(c.flag) effectLabel = c.flag === 'fineImmunity' ? 'Fine Immunity' : 'Rent Boost';
    else if(c.type === 'auction') effectLabel = 'Triggers auction';
    return `<div class="track-row"><div class="track-name" style="flex:1;">${c.text} <span style="color:var(--ba-warm-grey); font-weight:400;">(${effectLabel})</span></div>
      <button class="btn secondary" data-edit-card="${c.id}" style="padding:4px 8px; font-size:10.5px;">Edit</button>
      <button class="btn danger" data-delete-card="${c.id}" style="padding:4px 8px; font-size:10.5px;">Delete</button></div>`;
  }).join('');
  el.querySelectorAll('[data-delete-card]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      if(!confirm('Delete this card?')) return;
      await db.ref(gamePath('/cards/'+btn.dataset.deleteCard)).remove();
      CARDS = CARDS.filter(c=>c.id !== btn.dataset.deleteCard);
      if(editingCardId === btn.dataset.deleteCard) cancelCardEdit();
      renderCardsManager();
    });
  });
  el.querySelectorAll('[data-edit-card]').forEach(btn=>{
    btn.addEventListener('click', ()=>startCardEdit(btn.dataset.editCard));
  });
}
function startCardEdit(cardId){
  const card = CARDS.find(c=>c.id === cardId);
  if(!card) return;
  editingCardId = cardId;
  document.getElementById('new-card-text').value = card.text || '';
  const effectType = card.type === 'auction' ? 'auction' : card.flag ? 'flag' : 'cash';
  document.getElementById('new-card-effect-type').value = effectType;
  document.getElementById('new-card-effect-type').dispatchEvent(new Event('change'));
  document.getElementById('new-card-cash').value = card.cash != null ? card.cash : '';
  if(card.flag) document.getElementById('new-card-flag').value = card.flag;
  document.getElementById('add-card-btn').textContent = 'Save changes';
  document.getElementById('cancel-card-edit-btn').style.display = 'inline-block';
  document.getElementById('add-card-status').textContent = 'Editing "' + card.text + '" — change the fields above and save.';
  document.getElementById('add-card-status').className = 'status-line warn';
}
function cancelCardEdit(){
  editingCardId = null;
  document.getElementById('new-card-text').value = '';
  document.getElementById('new-card-cash').value = '';
  document.getElementById('add-card-btn').textContent = 'Add card';
  document.getElementById('cancel-card-edit-btn').style.display = 'none';
  document.getElementById('add-card-status').textContent = '';
}
document.getElementById('cancel-card-edit-btn').addEventListener('click', cancelCardEdit);
document.getElementById('add-card-btn').addEventListener('click', async ()=>{
  const text = document.getElementById('new-card-text').value.trim();
  const effectType = document.getElementById('new-card-effect-type').value;
  const statusEl = document.getElementById('add-card-status');
  if(!text){ statusEl.textContent = 'Give the card some text first.'; statusEl.className = 'status-line err'; return; }
  let card = {text};
  if(effectType === 'cash'){
    const val = parseInt(document.getElementById('new-card-cash').value);
    if(isNaN(val)){ statusEl.textContent = 'Enter a cash amount (can be negative).'; statusEl.className = 'status-line err'; return; }
    card.cash = val;
  } else if(effectType === 'flag'){
    card.flag = document.getElementById('new-card-flag').value;
  } else if(effectType === 'auction'){
    card.type = 'auction';
  }
  if(editingCardId){
    await db.ref(gamePath('/cards/'+editingCardId)).set(card);
    const idx = CARDS.findIndex(c=>c.id === editingCardId);
    if(idx >= 0) CARDS[idx] = {...card, id: editingCardId};
    statusEl.textContent = 'Card updated.';
    statusEl.className = 'status-line good';
    cancelCardEdit();
  } else {
    const ref = db.ref(gamePath('/cards')).push();
    await ref.set(card);
    CARDS.push({...card, id: ref.key});
    document.getElementById('new-card-text').value = '';
    document.getElementById('new-card-cash').value = '';
    statusEl.textContent = 'Card added.';
    statusEl.className = 'status-line good';
  }
  renderCardsManager();
});

async function renderTracking(){
  const el = document.getElementById('tracking-list');
  el.innerHTML = '<div class="empty">Loading…</div>';
  const teamsData = await listTeams();
  const teams = Object.values(teamsData);
  renderTeamMarkersOnMap(teamsData);
  if(teams.length === 0){ el.innerHTML = '<div class="empty">No teams yet.</div>'; return; }
  const rows = teams.map(t=>{
    const loc = t.lastLocation;
    const ageMs = loc ? Date.now()-loc.ts : null;
    const stale = ageMs === null || ageMs > 300000;
    const ec = t.emergencyContact && (t.emergencyContact.name || t.emergencyContact.phone)
      ? `${t.emergencyContact.name||''} ${t.emergencyContact.phone?('· '+t.emergencyContact.phone):''}` : 'not set';
    return `<tr>
      <td><span class="track-dot ${stale?'stale':''}"></span></td>
      <td><strong>${t.icon?t.icon+' ':''}${t.name}</strong><br><span style="color:var(--ba-warm-grey); font-size:10px;">PIN ${t.pin||'—'}</span></td>
      <td style="font-size:10.5px; color:var(--ba-warm-grey);">${(t.players||[]).join(', ')||'no players listed'}</td>
      <td>${loc?fmtAgo(loc.ts):'no signal'}</td>
      <td style="font-size:10.5px;">${ec}</td>
    </tr>`;
  }).join('');
  el.innerHTML = `<div class="scroll-x"><table class="ba-table">
    <thead><tr><th></th><th>Team</th><th>Players</th><th>Last ping</th><th>Emergency contact</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}
document.getElementById('tracking-refresh-btn').addEventListener('click', renderTracking);

function makeTeamPinIcon(stale, icon){
  const color = stale ? '#8F826C' : '#CE210F';
  return L.divIcon({
    className:'',
    html:`<div style="width:26px;height:26px;border-radius:50% 50% 50% 0; transform:rotate(-45deg); background:${color}; border:2px solid white; box-shadow:0 1px 4px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center;"><span style="transform:rotate(45deg); font-size:13px;">${icon||''}</span></div>`,
    iconSize:[26,26], iconAnchor:[13,26]
  });
}
function renderTeamMarkersOnMap(teamsData){
  if(!leafletMap) return; // Locations map hasn't been opened yet this session — nothing to draw on.
  teamMarkersLayer.clearLayers();
  Object.values(teamsData).forEach(t=>{
    if(!t.lastLocation) return;
    const stale = (Date.now() - t.lastLocation.ts) > 300000;
    const marker = L.marker([t.lastLocation.lat, t.lastLocation.lng], {icon: makeTeamPinIcon(stale, t.icon)});
    marker.bindTooltip((t.icon?t.icon+' ':'') + t.name + (stale ? ' (no signal)' : ''), {permanent:true, direction:'top', className:'team-label', offset:[0,-22]});
    marker.addTo(teamMarkersLayer);
  });
}
function plotStartPoint(targetLayer){
  const sp = (config.startPoint) || DEFAULT_CONFIG.startPoint;
  const icon = L.divIcon({
    className:'',
    html:`<div style="width:16px;height:16px;border-radius:50%;background:var(--navy);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>`,
    iconSize:[16,16], iconAnchor:[8,8]
  });
  const marker = L.marker([sp.lat, sp.lng], {icon, title:'Starting location'});
  marker.bindTooltip('START', {permanent:true, direction:'top', className:'team-label', offset:[0,-12]});
  marker.addTo(targetLayer);
}

// ================= PLAYER'S OWN MAP =================
function ensurePlayerMap(){
  if(playerMap) return;
  playerMap = L.map('player-map').setView([51.510,-0.125], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(playerMap);
  playerMarkersLayer = L.layerGroup().addTo(playerMap);
}
function renderPlayerMap(){
  if(!currentTeam) return;
  ensurePlayerMap();
  playerMarkersLayer.clearLayers();
  currentTeam.visited = currentTeam.visited || {};
  PROPERTIES.forEach(p=>{
    const {lat,lng} = getLatLng(p);
    const visited = currentTeam.visited[p.id];
    const size = 12;
    const icon = L.divIcon({className:'', html:`<div style="width:${size}px;height:${size}px;border-radius:50%;background:${p.color};border:2px solid ${visited?'#2E5C99':'white'};opacity:${visited?0.5:1};"></div>`, iconSize:[size,size], iconAnchor:[size/2,size/2]});
    L.marker([lat,lng], {icon, title:p.name}).addTo(playerMarkersLayer);
  });
  plotStartPoint(playerMarkersLayer);
  if(currentPosition){
    if(playerMeMarker){ playerMeMarker.setLatLng([currentPosition.latitude, currentPosition.longitude]); }
    else{ playerMeMarker = L.circleMarker([currentPosition.latitude, currentPosition.longitude], {radius:8, color:'white', weight:2, fillColor:'#CE210F', fillOpacity:1}).addTo(playerMap); }
    playerMap.panTo([currentPosition.latitude, currentPosition.longitude]);
  }
  setTimeout(()=>{ if(playerMap) playerMap.invalidateSize(); }, 60);
}
document.getElementById('open-google-maps-btn').addEventListener('click', ()=>{
  const n = getNearestRemaining();
  if(!n){ toast('No remaining stops to navigate to.'); return; }
  const c = getLatLng(n);
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`, '_blank');
});
document.getElementById('open-apple-maps-btn').addEventListener('click', ()=>{
  const n = getNearestRemaining();
  if(!n){ toast('No remaining stops to navigate to.'); return; }
  const c = getLatLng(n);
  window.open(`https://maps.apple.com/?daddr=${c.lat},${c.lng}&dirflg=w`, '_blank');
});

// ================= SNAPSHOTS =================
document.getElementById('snapshot-btn').addEventListener('click', async ()=>{
  await saveSnapshot();
  document.getElementById('snapshot-status').textContent = 'Snapshot saved at ' + new Date().toLocaleTimeString();
  document.getElementById('snapshot-status').className = 'status-line good';
});

// ================= AUCTIONS =================
async function startAuction(){
  const teamsData = await listTeams();
  const owners = ownershipMap(teamsData);
  const unowned = PROPERTIES.filter(p=>!owners[p.id]);
  const pool = unowned.length ? unowned : PROPERTIES;
  const prop = pool[Math.floor(Math.random()*pool.length)];
  const auctionObj = {
    propertyId: prop.id,
    ownerAtStart: owners[prop.id] || null,
    startTs: Date.now(),
    endTs: Date.now() + 5*60*1000,
    bids: {},
    resolved: false
  };
  const ref = db.ref(gamePath('/activeAuction'));
  await ref.transaction(current => (current && !current.resolved) ? current : auctionObj);
}
function renderAuctionUI(auction){
  const card = document.getElementById('auction-card');
  const body = document.getElementById('auction-body');
  if(!card || !body) return;
  if(auctionTimerInterval){ clearInterval(auctionTimerInterval); auctionTimerInterval = null; }
  if(!auction){ card.style.display = 'none'; return; }
  if(auction.resolved){
    card.style.display = 'block';
    body.innerHTML = `<div>${(auction.result && auction.result.text) || 'Auction resolved.'}</div><div class="btn-row"><button class="btn secondary" id="auction-dismiss-btn" style="background:white;color:var(--red);">Dismiss</button></div>`;
    const dbtn = document.getElementById('auction-dismiss-btn');
    if(dbtn) dbtn.addEventListener('click', ()=>{ card.style.display='none'; });
    return;
  }
  const prop = PROPERTIES.find(p=>p.id===auction.propertyId);
  if(!prop) return;
  card.style.display = 'block';
  const myKey = currentTeam ? safeKey(currentTeam.name) : null;
  function render(){
    const myBid = myKey && auction.bids ? auction.bids[myKey] : null;
    const msLeft = auction.endTs - Date.now();
    if(msLeft <= 0){
      body.innerHTML = `<div>Bidding closed for ${prop.name} — resolving…</div>`;
      tryResolveAuction();
      return;
    }
    const mm = Math.floor(msLeft/60000), ss = Math.floor((msLeft%60000)/1000);
    body.innerHTML = `
      <div>Sealed-bid auction for <strong>${prop.name}</strong>${auction.ownerAtStart ? (' (currently owned by '+auction.ownerAtStart+')') : ' (unowned)'}. Closes in ${mm}:${String(ss).padStart(2,'0')}.</div>
      ${myBid != null
        ? `<div style="margin-top:8px;">Your sealed bid: £${myBid} ✓</div>`
        : `<label class="field-label" style="color:rgba(255,255,255,0.85);">Your sealed bid (£)</label>
           <input type="number" id="auction-bid-input" min="0">
           <div class="btn-row"><button class="btn" id="auction-bid-btn" style="background:white;color:var(--red);">Submit bid</button></div>`}
    `;
    if(myBid == null){
      const bidBtn = document.getElementById('auction-bid-btn');
      if(bidBtn) bidBtn.addEventListener('click', submitAuctionBid);
    }
  }
  render();
  auctionTimerInterval = setInterval(render, 1000);
}
async function submitAuctionBid(){
  if(!currentTeam) return;
  const input = document.getElementById('auction-bid-input');
  const val = parseInt(input ? input.value : '');
  if(isNaN(val) || val < 0){ toast('Enter a valid bid.'); return; }
  if(val > currentTeam.cash){ toast('You cannot bid more than your current cash.'); return; }
  const ref = db.ref(gamePath('/activeAuction'));
  await ref.transaction(current=>{
    if(!current || current.resolved) return current;
    current.bids = current.bids || {};
    current.bids[safeKey(currentTeam.name)] = val;
    return current;
  });
  toast('Bid submitted.');
}
async function tryResolveAuction(){
  const ref = db.ref(gamePath('/activeAuction'));
  const txResult = await ref.transaction(current=>{
    if(!current || current.resolved) return current;
    if(Date.now() < current.endTs) return current;
    current.resolved = true;
    return current;
  });
  if(!txResult.committed) return;
  const auction = txResult.snapshot.val();
  if(!auction) return;
  const settleRef = db.ref(gamePath('/activeAuction/_settledFlag'));
  const settleTx = await settleRef.transaction(cur => cur ? cur : true);
  if(!settleTx.committed) return;

  const prop = PROPERTIES.find(p=>p.id===auction.propertyId);
  const bids = auction.bids || {};
  let winnerKey = null, winnerAmt = -1;
  Object.entries(bids).forEach(([k,amt])=>{ if(amt > winnerAmt){ winnerAmt = amt; winnerKey = k; } });

  const teamsData = await listTeams();
  let resultText = '';
  if(!winnerKey || winnerAmt <= 0){
    resultText = `No valid bids came in — ${prop.name} stays as it was.`;
  } else {
    const winnerTeam = Object.values(teamsData).find(t=>safeKey(t.name)===winnerKey);
    if(winnerTeam){
      const prevOwnerName = auction.ownerAtStart;
      winnerTeam.cash -= winnerAmt;
      winnerTeam.owned = winnerTeam.owned || [];
      if(!winnerTeam.owned.includes(prop.id)) winnerTeam.owned.push(prop.id);
      winnerTeam.visited = winnerTeam.visited || {};
      winnerTeam.visited[prop.id] = Date.now();
      winnerTeam.lastPurchase = {name: prop.name, ts: Date.now()};
      if(prevOwnerName && prevOwnerName !== winnerTeam.name){
        const prevOwner = teamsData[prevOwnerName];
        if(prevOwner){
          prevOwner.owned = (prevOwner.owned||[]).filter(id=>id!==prop.id);
          prevOwner.cash += winnerAmt;
          await saveTeam(prevOwner);
        }
        resultText = `${winnerTeam.name} won ${prop.name} for £${winnerAmt} — paid to ${prevOwnerName}.`;
      } else {
        resultText = `${winnerTeam.name} won ${prop.name} for £${winnerAmt}.`;
      }
      await saveTeam(winnerTeam);
      await logActivity('auction_won', winnerTeam.name, {propertyId: prop.id, propertyName: prop.name, amount: winnerAmt, prevOwner: (prevOwnerName && prevOwnerName !== winnerTeam.name) ? prevOwnerName : null});
    }
  }
  await db.ref(gamePath('/activeAuction')).update({result:{text: resultText}});
  setTimeout(()=>{ db.ref(gamePath('/activeAuction')).remove(); }, 20000);
}

// ================= HALFWAY MEETUP CHALLENGE =================
document.getElementById('meetup-locate-btn').addEventListener('click', ()=>{
  if(!navigator.geolocation){ toast('Geolocation not supported.'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    document.getElementById('meetup-lat').value = pos.coords.latitude.toFixed(5);
    document.getElementById('meetup-lng').value = pos.coords.longitude.toFixed(5);
  }, err=>toast('Could not get location: ' + err.message));
});
document.getElementById('meetup-start-btn').addEventListener('click', async ()=>{
  const lat = parseFloat(document.getElementById('meetup-lat').value);
  const lng = parseFloat(document.getElementById('meetup-lng').value);
  const deadlineStr = document.getElementById('meetup-deadline').value;
  const fineAmount = parseInt(document.getElementById('meetup-fine').value) || 50;
  const radius = parseInt(document.getElementById('meetup-radius').value) || 150;
  const statusEl = document.getElementById('meetup-status');
  if(isNaN(lat) || isNaN(lng) || !deadlineStr){ statusEl.textContent = 'Fill in the meetup point and deadline first.'; statusEl.className='status-line err'; return; }
  const deadline = new Date(deadlineStr).getTime();
  await db.ref(gamePath('/meetup')).set({lat, lng, deadline, fineAmount, radius, active:true, teamFineState:{}});
  statusEl.textContent = 'Meetup challenge started.';
  statusEl.className = 'status-line good';
});
document.getElementById('meetup-cancel-btn').addEventListener('click', async ()=>{
  await db.ref(gamePath('/meetup')).update({active:false});
  document.getElementById('meetup-status').textContent = 'Meetup challenge cancelled.';
  document.getElementById('meetup-status').className = 'status-line';
});
function renderMeetupCard(m, deadlinePassed, arrived, dist){
  const card = document.getElementById('meetup-card');
  const body = document.getElementById('meetup-body');
  if(!card || !body) return;
  if(!m || !m.active){ card.style.display = 'none'; return; }
  card.style.display = 'block';
  if(!deadlinePassed){
    const msLeft = m.deadline - Date.now();
    const mins = Math.max(0, Math.floor(msLeft/60000));
    body.innerHTML = `<div>Everyone needs to meet at the halfway point within ${mins} minute(s) — after that, a rolling fine kicks in every 5 minutes until your team arrives.</div>`;
  } else if(arrived){
    body.innerHTML = `<div>✅ You're at the meetup point — no fine.</div>`;
  } else {
    body.innerHTML = `<div>⏰ You're ${fmtDist(dist)} from the meetup point and the deadline has passed — a fine is accruing every 5 minutes until you arrive.</div>`;
  }
}
async function checkMeetupFine(){
  if(!currentTeam || currentRole !== 'team') return;
  try{
    const snap = await db.ref(gamePath('/meetup')).once('value');
    if(!snap.exists()){ renderMeetupCard(null); return; }
    const m = snap.val();
    if(!m.active){ renderMeetupCard(m); return; }
    if(Date.now() < m.deadline){ renderMeetupCard(m, false); return; }
    const loc = currentTeam.lastLocation;
    const dist = loc ? haversine(loc.lat, loc.lng, m.lat, m.lng) : Infinity;
    const arrived = dist <= (m.radius || 150);
    renderMeetupCard(m, true, arrived, dist);
    if(arrived) return;
    const key = safeKey(currentTeam.name);
    const targetIncrements = Math.floor((Date.now() - m.deadline) / 300000) + 1;
    const ref = db.ref(gamePath('/meetup/teamFineState/')+key);
    let appliedDelta = 0;
    const tx = await ref.transaction(cur=>{
      const current = (cur && cur.finesApplied) || 0;
      appliedDelta = Math.max(0, targetIncrements - current);
      if(appliedDelta <= 0) return cur;
      return {finesApplied: targetIncrements};
    });
    if(tx.committed && appliedDelta > 0){
      const fineTotal = appliedDelta * (m.fineAmount || 50);
      currentTeam.cash -= fineTotal;
      await saveTeam(currentTeam);
      await logActivity('meetup_fine', currentTeam.name, {amount: fineTotal});
      refreshWallet();
      toast(`Meetup fine: -£${fineTotal} for not being at the meetup point.`);
    }
  }catch(e){}
}
setInterval(()=>{ if(currentRole==='team') checkMeetupFine(); }, 60000);
setInterval(()=>{ if(currentRole==='admin') saveSnapshot(); }, 3600000);

document.getElementById('finalize-btn').addEventListener('click', async ()=>{
  if(!confirm('This applies end-of-event fines to every team for unvisited properties and locks the board. Continue?')) return;
  const teamsData = await listTeams();
  const owners = ownershipMap(teamsData);
  for(const t of Object.values(teamsData)){
    t.visited = t.visited || {};
    const unvisited = PROPERTIES.filter(p=>!t.visited[p.id]);
    const fines = unvisited.map(p=>({p, fine: Math.round(1.5*currentRent(p, owners[p.id], teamsData))}));
    fines.sort((a,b)=>b.fine-a.fine);
    t.cardFlags = t.cardFlags || {};
    let immunity = t.cardFlags.fineImmunity || 0;
    for(const f of fines){
      if(immunity > 0){ immunity -= 1; continue; }
      t.cash -= f.fine;
      await logActivity('finalize_fine', t.name, {propertyId: f.p.id, propertyName: f.p.name, amount: f.fine});
    }
    t.cardFlags.fineImmunity = immunity;
    await saveTeam(t);
  }
  config.finalized = true;
  await saveConfig();
  document.getElementById('finalize-status').textContent = 'Event finalised — fines applied, board locked.';
  document.getElementById('finalize-status').className = 'status-line good';
  renderLeaderboard();
});
document.getElementById('unlock-board-btn').addEventListener('click', async ()=>{
  config.finalized = false;
  await saveConfig();
  document.getElementById('finalize-status').textContent = 'Board re-opened.';
});
document.getElementById('admin-reset-btn').addEventListener('click', async ()=>{
  if(!confirm('This wipes every team, plus the activity log, live auction, meetup challenge, and challenge submissions. Continue?')) return;
  await db.ref(gamePath('/teams')).remove();
  await db.ref(gamePath('/activity')).remove();
  await db.ref(gamePath('/activeAuction')).remove();
  await db.ref(gamePath('/meetup')).remove();
  await db.ref(gamePath('/challengeSubmissions')).remove();
  config.finalized = false;
  await saveConfig();
  renderTracking();
  renderLeaderboard();
});

// ================= ADMIN: LEAFLET LOCATIONS MAP =================
function ensureLeafletMap(){
  if(leafletMap) return;
  leafletMap = L.map('leaflet-map').setView([51.510, -0.125], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom:19,
    attribution:'&copy; OpenStreetMap contributors'
  }).addTo(leafletMap);
  leafletMarkersLayer = L.layerGroup().addTo(leafletMap);
  teamMarkersLayer = L.layerGroup().addTo(leafletMap);
}
function renderLocationsMap(){
  ensureLeafletMap();
  leafletMarkersLayer.clearLayers();
  ALL_POINTS.forEach(item=>{
    const {lat,lng} = getLatLng(item);
    const isSpecial = SPECIALS.some(s=>s.id===item.id);
    const overridden = !!(config.coordOverrides && config.coordOverrides[item.id]);
    const size = isSpecial ? 18 : 14;
    const icon = L.divIcon({
      className:'',
      html:`<div style="width:${size}px;height:${size}px;border-radius:50%;background:${isSpecial?'var(--red)':item.color};border:2px solid ${overridden?'var(--blue)':'white'};box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>`,
      iconSize:[size,size], iconAnchor:[size/2,size/2]
    });
    const marker = L.marker([lat,lng], {icon, draggable:true, title:item.name});
    marker.on('click', ()=>selectLocationForEdit(item.id));
    marker.on('dragend', async (e)=>{
      const pos = e.target.getLatLng();
      config.coordOverrides = config.coordOverrides || {};
      config.coordOverrides[item.id] = {lat:pos.lat, lng:pos.lng};
      await saveConfig();
      selectLocationForEdit(item.id);
      toast('Updated location for ' + item.name);
    });
    marker.addTo(leafletMarkersLayer);
  });
  plotStartPoint(leafletMarkersLayer);
  setTimeout(()=>{ if(leafletMap) leafletMap.invalidateSize(); }, 60);
}
function selectLocationForEdit(id){
  const item = ALL_POINTS.find(p=>p.id===id);
  if(!item) return;
  selectedMapId = id;
  document.getElementById('loc-edit-panel').style.display = 'block';
  document.getElementById('loc-edit-name').textContent = item.name;
  const {lat,lng} = getLatLng(item);
  document.getElementById('loc-edit-lat').value = lat.toFixed(5);
  document.getElementById('loc-edit-lng').value = lng.toFixed(5);
}
async function saveLocationOverrideFromInputs(){
  if(!selectedMapId) return;
  const lat = parseFloat(document.getElementById('loc-edit-lat').value);
  const lng = parseFloat(document.getElementById('loc-edit-lng').value);
  if(isNaN(lat) || isNaN(lng)) return;
  config.coordOverrides = config.coordOverrides || {};
  config.coordOverrides[selectedMapId] = {lat, lng};
  await saveConfig();
  renderLocationsMap();
  toast('Updated location for ' + ALL_POINTS.find(p=>p.id===selectedMapId).name);
}
document.getElementById('loc-save-btn').addEventListener('click', saveLocationOverrideFromInputs);
document.getElementById('loc-reset-btn').addEventListener('click', async ()=>{
  if(!selectedMapId) return;
  if(config.coordOverrides) delete config.coordOverrides[selectedMapId];
  await saveConfig();
  selectLocationForEdit(selectedMapId);
  renderLocationsMap();
  toast('Reset to default coordinates.');
});
document.getElementById('loc-reset-all-btn').addEventListener('click', async ()=>{
  if(!confirm('Reset every location back to its default coordinates?')) return;
  config.coordOverrides = {};
  await saveConfig();
  document.getElementById('loc-edit-panel').style.display = 'none';
  selectedMapId = null;
  renderLocationsMap();
});
document.getElementById('loc-locate-btn').addEventListener('click', ()=>{
  if(!navigator.geolocation){ toast('Geolocation not supported on this device.'); return; }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      ensureLeafletMap();
      const {latitude:lat, longitude:lng} = pos.coords;
      if(leafletYouMarker){ leafletYouMarker.setLatLng([lat,lng]); }
      else{ leafletYouMarker = L.circleMarker([lat,lng], {radius:8, color:'white', weight:2, fillColor:'#2E5C99', fillOpacity:1}).addTo(leafletMap); }
      leafletMap.setView([lat,lng], 17);
    },
    err=>toast('Could not get your location: ' + err.message)
  );
});

// ================= AUTO-LOGIN VIA TEAM LINK =================
async function checkAutoLogin(){
  const params = new URLSearchParams(window.location.search);
  const token = params.get('team');
  if(!token) return;
  await loadConfig();
  const teamsData = await listTeams();
  const match = Object.values(teamsData).find(t=>t.token === token);
  if(match){
    const claim = await claimDeviceForTeam(match);
    if(!claim.ok){
      toast('This team is already signed in on another device. Ask your organiser to unlock it, or sign in manually below.');
      return;
    }
    currentTeam = match;
    await enterApp('team');
  } else {
    toast('Team link not recognised — sign in manually below.');
  }
}

// ================= CONTROL CENTRE =================
const CC_DEFAULT_PASSCODE = 'LONDONHQ';
let ccUnlocked = false;

async function ccLoadPasscode(){
  try{
    const snap = await db.ref('controlCentre/passcode').once('value');
    return snap.exists() ? snap.val() : CC_DEFAULT_PASSCODE;
  }catch(e){ return CC_DEFAULT_PASSCODE; }
}
document.getElementById('cc-unlock-btn').addEventListener('click', async ()=>{
  const val = document.getElementById('cc-pass-input').value;
  const statusEl = document.getElementById('cc-gate-status');
  const real = await ccLoadPasscode();
  if(val !== real){ statusEl.textContent = 'Incorrect passcode.'; statusEl.className = 'status-line err'; return; }
  ccUnlocked = true;
  document.getElementById('cc-gate-card').style.display = 'none';
  document.getElementById('cc-panel').style.display = 'block';
  document.getElementById('cc-passcode-input').value = real;
  renderCcStats();
  renderGamesList();
  renderTemplatesList();
  populateGameTemplateOptions();
  renderGroupsList();
});
document.querySelectorAll('#cc-subnav button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#cc-subnav button').forEach(b=>b.classList.toggle('active', b===btn));
    document.querySelectorAll('[data-cc-panel]').forEach(p=>{
      p.style.display = (p.dataset.ccPanel === btn.dataset.ccTab) ? '' : 'none';
    });
    if(btn.dataset.ccTab === 'games') renderGamesList();
    if(btn.dataset.ccTab === 'groups') renderGroupsList();
    if(btn.dataset.ccTab === 'templates'){ renderTemplatesList(); populateGameTemplateOptions(); }
  });
});
async function renderCcStats(){
  const el = document.getElementById('cc-stats-line');
  if(!el) return;
  try{
    const [gamesSnap, groupsSnap, tplSnap] = await Promise.all([
      db.ref('games').once('value'),
      db.ref('groups').once('value'),
      db.ref('templates').once('value')
    ]);
    const gameCount = gamesSnap.exists() ? Object.keys(gamesSnap.val()).length : 0;
    const groupCount = groupsSnap.exists() ? Object.keys(groupsSnap.val()).length : 0;
    const tplCount = tplSnap.exists() ? Object.keys(tplSnap.val()).length : 0;
    el.textContent = `${gameCount} game${gameCount===1?'':'s'} · ${groupCount} group${groupCount===1?'':'s'} · ${tplCount} custom template${tplCount===1?'':'s'}`;
  }catch(e){ el.textContent = ''; }
}
document.getElementById('cc-passcode-save-btn').addEventListener('click', async ()=>{
  const val = document.getElementById('cc-passcode-input').value.trim();
  if(!val){ return; }
  await db.ref('controlCentre/passcode').set(val);
  document.getElementById('cc-passcode-status').textContent = 'Passcode updated.';
  document.getElementById('cc-passcode-status').className = 'status-line good';
});

function ccGenerateGameId(name){
  const slug = (name||'game').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,24) || 'game';
  const suffix = Math.random().toString(36).slice(2,7);
  return slug + '-' + suffix;
}
document.getElementById('cc-create-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('cc-new-name').value.trim();
  const templateId = document.getElementById('cc-new-template').value;
  const statusEl = document.getElementById('cc-create-status');
  if(!name){ statusEl.textContent = 'Give the game a name first.'; statusEl.className = 'status-line err'; return; }
  let locations;
  if(templateId === 'blank-custom'){
    locations = [];
  } else if(templateId === 'monopoly-builtin'){
    locations = MONOPOLY_TEMPLATE_LOCATIONS.map(l=>({...l}));
  } else {
    try{
      const snap = await db.ref('templates/'+templateId+'/locations').once('value');
      locations = snap.exists() ? Object.values(snap.val()) : MONOPOLY_TEMPLATE_LOCATIONS.map(l=>({...l}));
    }catch(e){ locations = MONOPOLY_TEMPLATE_LOCATIONS.map(l=>({...l})); }
  }
  const id = ccGenerateGameId(name);
  await db.ref('games/'+id+'/meta').set({name, createdAt: Date.now(), archived: false});
  await db.ref('games/'+id+'/config').set(DEFAULT_CONFIG);
  const locMap = {};
  locations.forEach(l=>{ locMap[l.id] = l; });
  await db.ref('games/'+id+'/locations').set(locMap);
  const cardSeed = {};
  DEFAULT_CARDS.forEach(c=>{ const key = db.ref('games/'+id+'/cards').push().key; cardSeed[key] = c; });
  await db.ref('games/'+id+'/cards').set(cardSeed);
  statusEl.textContent = `Created "${name}" with ${locations.length} locations.`;
  statusEl.className = 'status-line good';
  document.getElementById('cc-new-name').value = '';
  renderGamesList();
  renderCcStats();
});
document.getElementById('cc-show-archived').addEventListener('change', renderGamesList);
document.getElementById('cc-refresh-btn').addEventListener('click', renderGamesList);

// ================= LOCATION TEMPLATES (Control Centre) =================
function ccSplitCsvLine(line){
  const result = [];
  let cur = '', inQuotes = false;
  for(let i=0;i<line.length;i++){
    const ch = line[i];
    if(ch === '"'){ inQuotes = !inQuotes; }
    else if(ch === ',' && !inQuotes){ result.push(cur); cur=''; }
    else cur += ch;
  }
  result.push(cur);
  return result.map(s=>s.trim());
}
function ccParseCsv(text){
  const lines = text.split(/\r?\n/).map(l=>l).filter(l=>l.trim().length);
  if(lines.length < 2) return [];
  const header = ccSplitCsvLine(lines[0]).map(h=>h.toLowerCase());
  return lines.slice(1).map(line=>{
    const cells = ccSplitCsvLine(line);
    const row = {};
    header.forEach((h,i)=>{ row[h] = cells[i] || ''; });
    return row;
  });
}
function ccCsvRowsToLocations(rows){
  return rows.map((r,i)=>{
    const lat = parseFloat(r.lat), lng = parseFloat(r.lng);
    if(isNaN(lat) || isNaN(lng)) return null;
    const type = (r.type || 'street').toLowerCase();
    return {
      id: 'loc' + i + '_' + Math.random().toString(36).slice(2,7),
      name: r.name || ('Location ' + (i+1)),
      group: type === 'special' ? 'Special' : (r.group || 'General'),
      color: r.color || '#2E5C99',
      price: type === 'special' ? 0 : (parseInt(r.price) || 100),
      lat, lng, type,
      fact: r.fact || '',
      wikiTitle: r.wikititle || '',
      note: r.note || ''
    };
  }).filter(Boolean);
}
document.getElementById('tpl-create-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('tpl-new-name').value.trim();
  const source = document.getElementById('tpl-source').value;
  const statusEl = document.getElementById('tpl-create-status');
  if(!name){ statusEl.textContent = 'Give the template a name first.'; statusEl.className = 'status-line err'; return; }
  const locations = source === 'monopoly' ? MONOPOLY_TEMPLATE_LOCATIONS.map(l=>({...l})) : [];
  const id = ccGenerateGameId(name);
  await db.ref('templates/'+id+'/meta').set({name, createdAt: Date.now(), count: locations.length});
  const locMap = {};
  locations.forEach(l=>{ locMap[l.id] = l; });
  await db.ref('templates/'+id+'/locations').set(locMap);
  statusEl.textContent = `Template "${name}" created — add its locations below.`;
  statusEl.className = 'status-line good';
  document.getElementById('tpl-new-name').value = '';
  renderTemplatesList();
  populateGameTemplateOptions();
  renderCcStats();
  openLocationEditor('templates/'+id+'/locations', 'Editing "'+name+'"', 'templates/'+id+'/meta/count');
});
document.getElementById('tpl-refresh-btn').addEventListener('click', ()=>{ renderTemplatesList(); populateGameTemplateOptions(); });

async function renderTemplatesList(){
  const el = document.getElementById('tpl-list');
  if(!el) return;
  el.innerHTML = '<div class="empty">Loading…</div>';
  try{
    const snap = await db.ref('templates').once('value');
    if(!snap.exists()){ el.innerHTML = '<div class="empty">No custom templates yet — Monopoly is always available when creating a game.</div>'; return; }
    const val = snap.val();
    const rows = Object.keys(val).map(id=>{
      const meta = val[id].meta || {};
      return `<div class="track-row"><div class="track-name" style="flex:1;">${meta.name || id} <span style="color:var(--ba-warm-grey); font-weight:400;">(${meta.count||0} locations)</span></div>
        <button class="btn secondary" data-edit-tpl="${id}" data-edit-tpl-name="${meta.name || id}" style="padding:4px 8px; font-size:10.5px;">Edit</button>
        <button class="btn danger" data-delete-tpl="${id}" style="padding:4px 8px; font-size:10.5px;">Delete</button></div>`;
    }).join('');
    el.innerHTML = rows;
    el.querySelectorAll('[data-delete-tpl]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        if(!confirm('Delete this template? Games already created from it keep their own copy of the locations.')) return;
        await db.ref('templates/'+btn.dataset.deleteTpl).remove();
        renderTemplatesList();
        populateGameTemplateOptions();
        renderCcStats();
      });
    });
    el.querySelectorAll('[data-edit-tpl]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.editTpl;
        openLocationEditor('templates/'+id+'/locations', 'Editing "'+btn.dataset.editTplName+'"', 'templates/'+id+'/meta/count');
      });
    });
  }catch(e){ el.innerHTML = '<div class="empty">Could not load templates.</div>'; }
}
async function populateGameTemplateOptions(){
  const sel = document.getElementById('cc-new-template');
  if(!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="monopoly-builtin">Monopoly (built-in — 26 London streets)</option>';
  try{
    const snap = await db.ref('templates').once('value');
    if(snap.exists()){
      const val = snap.val();
      Object.keys(val).forEach(id=>{
        const meta = val[id].meta || {};
        const opt = document.createElement('option');
        opt.value = id; opt.textContent = (meta.name || id) + ' (' + (meta.count||0) + ' locations)';
        sel.appendChild(opt);
      });
    }
  }catch(e){}
  if(prev) sel.value = prev;
}

async function ccCountTeams(id){
  try{
    const path = (id==='live'||id==='test') ? (id+'/teams') : ('games/'+id+'/teams');
    const snap = await db.ref(path).once('value');
    return snap.exists() ? Object.keys(snap.val()).length : 0;
  }catch(e){ return 0; }
}
async function renderGamesList(){
  const el = document.getElementById('cc-games-list');
  el.innerHTML = '<div class="empty">Loading…</div>';
  const showArchived = document.getElementById('cc-show-archived').checked;
  const games = [];

  // Real games registry
  try{
    const snap = await db.ref('games').once('value');
    if(snap.exists()){
      const val = snap.val();
      for(const id of Object.keys(val)){
        const meta = val[id] && val[id].meta;
        if(meta) games.push({id, name: meta.name || id, createdAt: meta.createdAt || 0, archived: !!meta.archived, legacy: false});
      }
    }
  }catch(e){}

  // Legacy built-in games (from earlier single-game version) — only listed if they actually have data
  for(const legacyId of ['live','test']){
    try{
      const snap = await db.ref(legacyId+'/config').once('value');
      if(snap.exists()){
        games.push({id: legacyId, name: legacyId==='live' ? 'Live (existing event)' : 'Test (existing rehearsal)', createdAt: 0, archived: false, legacy: true});
      }
    }catch(e){}
  }

  const visible = games.filter(g=>showArchived || !g.archived);
  visible.sort((a,b)=>b.createdAt - a.createdAt);

  if(visible.length === 0){ el.innerHTML = '<div class="empty">No games yet — create one above.</div>'; return; }

  const rowsHtml = await Promise.all(visible.map(async g=>{
    const teamCount = await ccCountTeams(g.id);
    const created = g.createdAt ? new Date(g.createdAt).toLocaleDateString() : '—';
    const gameUrl = new URL(window.location.href);
    gameUrl.search = '';
    gameUrl.searchParams.set('game', g.id);
    return `<tr>
      <td><strong>${g.name}</strong>${g.archived?' <span style="color:var(--ba-warm-grey); font-size:10px;">(archived)</span>':''}</td>
      <td>${teamCount}</td>
      <td>${created}</td>
      <td style="white-space:nowrap;">
        <a href="${gameUrl.toString()}" class="btn secondary" style="padding:4px 8px; font-size:10.5px; text-decoration:none;">Open</a>
        ${g.legacy ? '' : `<button class="btn secondary" data-cc-archive="${g.id}" data-archived="${g.archived}" style="padding:4px 8px; font-size:10.5px;">${g.archived?'Unarchive':'Archive'}</button>
        <button class="btn danger" data-cc-delete="${g.id}" style="padding:4px 8px; font-size:10.5px;">Delete</button>`}
      </td>
    </tr>`;
  }));

  el.innerHTML = `<div class="scroll-x"><table class="ba-table">
    <thead><tr><th>Game</th><th>Teams</th><th>Created</th><th>Actions</th></tr></thead>
    <tbody>${rowsHtml.join('')}</tbody>
  </table></div>`;

  el.querySelectorAll('[data-cc-archive]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const id = btn.dataset.ccArchive;
      const nowArchived = btn.dataset.archived === 'true';
      await db.ref('games/'+id+'/meta/archived').set(!nowArchived);
      renderGamesList();
    });
  });
  el.querySelectorAll('[data-cc-delete]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const id = btn.dataset.ccDelete;
      if(!confirm('Permanently delete this game and all its teams, activity and settings? This cannot be undone.')) return;
      await db.ref('games/'+id).remove();
      renderGamesList();
      renderCcStats();
    });
  });
}

document.getElementById('all-games-btn').addEventListener('click', ()=>{
  const url = new URL(window.location.href);
  url.search = '';
  window.location.href = url.toString();
});

// ================= BOOTSTRAP =================
// ================= SHARED LOCATION EDITOR =================
// Used for: creating/editing a template's locations, and editing a live
// game's own board. Writes each location individually (keyed by its id)
// so add/edit/delete never require resaving the whole list.
let locEditorRefPath = null;
let locEditorMetaCountPath = null;
let locEditorLocations = [];
let locEditorEditingId = null;
let locEditorPickingOnMap = false;
let locEditorMap = null, locEditorMarkersLayer = null;

async function openLocationEditor(refPath, title, metaCountPath){
  locEditorRefPath = refPath;
  locEditorMetaCountPath = metaCountPath || null;
  document.getElementById('loc-editor-title').textContent = title;
  let locations = [];
  try{
    const snap = await db.ref(refPath).once('value');
    const val = snap.val();
    locations = val ? (Array.isArray(val) ? val.filter(Boolean) : Object.values(val)) : [];
  }catch(e){}
  locEditorLocations = locations;
  cancelLocEdit();
  document.getElementById('loc-editor-modal').style.display = 'flex';
  switchLocEditorTab('table');
  renderLocEditorTable();
}
async function closeLocationEditor(){
  document.getElementById('loc-editor-modal').style.display = 'none';
  const wasGameOwnLocations = (currentGameId && locEditorRefPath === gamePath('/locations'));
  locEditorRefPath = null;
  if(wasGameOwnLocations){
    try{
      const snap = await db.ref(gamePath('/locations')).once('value');
      const val = snap.val();
      const locations = val ? (Array.isArray(val) ? val.filter(Boolean) : Object.values(val)) : [];
      if(locations.length) applyLocations(locations);
      renderLocationsMap();
      toast('Board updated with your changes.');
    }catch(e){}
  }
}
document.getElementById('loc-editor-close-btn').addEventListener('click', closeLocationEditor);

document.querySelectorAll('[data-loc-tab]').forEach(btn=>{
  btn.addEventListener('click', ()=>switchLocEditorTab(btn.dataset.locTab));
});
function switchLocEditorTab(tab){
  document.querySelectorAll('[data-loc-tab]').forEach(b=>b.classList.toggle('active', b.dataset.locTab===tab));
  document.getElementById('loc-editor-table-panel').style.display = tab==='table' ? 'block' : 'none';
  document.getElementById('loc-editor-map-panel').style.display = tab==='map' ? 'block' : 'none';
  document.getElementById('loc-editor-csv-panel').style.display = tab==='csv' ? 'block' : 'none';
  if(tab==='map') renderLocEditorMap();
}

function renderLocEditorTable(){
  const el = document.getElementById('loc-editor-table-wrap');
  if(!el) return;
  if(locEditorLocations.length === 0){ el.innerHTML = '<div class="empty">No locations yet — add one below, import a CSV, or drop pins on the map.</div>'; return; }
  const rows = locEditorLocations.map(l=>`<tr>
    <td><strong>${l.name}</strong></td>
    <td>${l.group||''}</td>
    <td>${l.type}</td>
    <td>£${l.price||0}</td>
    <td>${l.lat!=null?l.lat.toFixed(4):'—'}, ${l.lng!=null?l.lng.toFixed(4):'—'}</td>
    <td style="white-space:nowrap;">
      <button class="btn secondary" data-le-edit="${l.id}" style="padding:4px 8px; font-size:10px;">Edit</button>
      <button class="btn danger" data-le-delete="${l.id}" style="padding:4px 8px; font-size:10px;">Delete</button>
    </td>
  </tr>`).join('');
  el.innerHTML = `<div class="scroll-x"><table class="ba-table"><thead><tr><th>Name</th><th>Group</th><th>Type</th><th>Price</th><th>Coordinates</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  el.querySelectorAll('[data-le-edit]').forEach(btn=>btn.addEventListener('click', ()=>startLocEdit(btn.dataset.leEdit)));
  el.querySelectorAll('[data-le-delete]').forEach(btn=>btn.addEventListener('click', ()=>deleteLocEditorLocation(btn.dataset.leDelete)));
}
async function syncTemplateMetaCount(){
  if(locEditorMetaCountPath){
    try{ await db.ref(locEditorMetaCountPath).set(locEditorLocations.length); }catch(e){}
  }
}
function genLocId(){ return 'loc_' + Math.random().toString(36).slice(2,9); }
function startLocEdit(id){
  const loc = locEditorLocations.find(l=>l.id===id);
  if(!loc) return;
  locEditorEditingId = id;
  document.getElementById('le-name').value = loc.name || '';
  document.getElementById('le-group').value = loc.group || '';
  document.getElementById('le-color').value = loc.color || '#2E5C99';
  document.getElementById('le-type').value = loc.type || 'street';
  document.getElementById('le-price').value = loc.price || 0;
  document.getElementById('le-lat').value = loc.lat != null ? loc.lat : '';
  document.getElementById('le-lng').value = loc.lng != null ? loc.lng : '';
  document.getElementById('le-fact').value = loc.fact || '';
  document.getElementById('le-note').value = loc.note || '';
  document.getElementById('le-save-btn').textContent = 'Save changes';
  document.getElementById('le-cancel-edit-btn').style.display = 'inline-block';
  switchLocEditorTab('table');
}
function cancelLocEdit(){
  locEditorEditingId = null;
  locEditorPickingOnMap = false;
  ['le-name','le-group','le-price','le-lat','le-lng','le-fact','le-note'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const colorEl = document.getElementById('le-color'); if(colorEl) colorEl.value = '#2E5C99';
  const typeEl = document.getElementById('le-type'); if(typeEl) typeEl.value = 'street';
  const saveBtn = document.getElementById('le-save-btn'); if(saveBtn) saveBtn.textContent = 'Add location';
  const cancelBtn = document.getElementById('le-cancel-edit-btn'); if(cancelBtn) cancelBtn.style.display = 'none';
  const statusEl = document.getElementById('le-status'); if(statusEl) statusEl.textContent = '';
}
document.getElementById('le-cancel-edit-btn').addEventListener('click', cancelLocEdit);
document.getElementById('le-save-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('le-name').value.trim();
  const statusEl = document.getElementById('le-status');
  if(!name){ statusEl.textContent = 'Give it a name.'; statusEl.className = 'status-line err'; return; }
  const lat = parseFloat(document.getElementById('le-lat').value);
  const lng = parseFloat(document.getElementById('le-lng').value);
  if(isNaN(lat) || isNaN(lng)){ statusEl.textContent = 'Set coordinates — type them or pick on the map.'; statusEl.className = 'status-line err'; return; }
  const type = document.getElementById('le-type').value;
  const loc = {
    id: locEditorEditingId || genLocId(),
    name,
    group: type==='special' ? 'Special' : (document.getElementById('le-group').value.trim() || 'General'),
    color: document.getElementById('le-color').value.trim() || '#2E5C99',
    price: type==='special' ? 0 : (parseInt(document.getElementById('le-price').value) || 0),
    lat, lng, type,
    fact: document.getElementById('le-fact').value.trim(),
    note: document.getElementById('le-note').value.trim()
  };
  await db.ref(locEditorRefPath + '/' + loc.id).set(loc);
  const idx = locEditorLocations.findIndex(l=>l.id===loc.id);
  if(idx >= 0) locEditorLocations[idx] = loc; else locEditorLocations.push(loc);
  await syncTemplateMetaCount();
  cancelLocEdit();
  renderLocEditorTable();
  if(document.getElementById('loc-editor-map-panel').style.display !== 'none') renderLocEditorMap();
  statusEl.textContent = 'Saved.';
  statusEl.className = 'status-line good';
});
async function deleteLocEditorLocation(id){
  if(!confirm('Delete this location?')) return;
  await db.ref(locEditorRefPath + '/' + id).remove();
  locEditorLocations = locEditorLocations.filter(l=>l.id !== id);
  await syncTemplateMetaCount();
  renderLocEditorTable();
  if(document.getElementById('loc-editor-map-panel').style.display !== 'none') renderLocEditorMap();
}

function renderLocEditorMap(){
  if(!locEditorMap){
    locEditorMap = L.map('loc-editor-map').setView([51.510,-0.125], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(locEditorMap);
    locEditorMarkersLayer = L.layerGroup().addTo(locEditorMap);
    locEditorMap.on('click', (e)=>{
      if(!locEditorPickingOnMap) return;
      document.getElementById('le-lat').value = e.latlng.lat.toFixed(5);
      document.getElementById('le-lng').value = e.latlng.lng.toFixed(5);
      locEditorPickingOnMap = false;
      switchLocEditorTab('table');
      toast('Location set — fill in the name and save.');
    });
  }
  locEditorMarkersLayer.clearLayers();
  locEditorLocations.forEach(l=>{
    if(l.lat == null || l.lng == null) return;
    const icon = L.divIcon({className:'', html:`<div style="width:14px;height:14px;border-radius:50%;background:${l.color||'#2E5C99'};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>`, iconSize:[14,14], iconAnchor:[7,7]});
    const marker = L.marker([l.lat, l.lng], {icon, draggable:true, title:l.name});
    marker.bindTooltip(l.name, {direction:'top', offset:[0,-10]});
    marker.on('dragend', async (e)=>{
      const pos = e.target.getLatLng();
      l.lat = pos.lat; l.lng = pos.lng;
      await db.ref(locEditorRefPath + '/' + l.id).set(l);
      renderLocEditorTable();
    });
    marker.addTo(locEditorMarkersLayer);
  });
  setTimeout(()=>{ if(locEditorMap) locEditorMap.invalidateSize(); }, 60);
}
document.getElementById('le-pick-map-btn').addEventListener('click', ()=>{
  locEditorPickingOnMap = true;
  switchLocEditorTab('map');
  toast('Tap the map where this location should be.');
});

document.getElementById('le-csv-file').addEventListener('change', (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev)=>{ document.getElementById('le-csv-input').value = ev.target.result; };
  reader.readAsText(file);
});
document.getElementById('le-csv-import-btn').addEventListener('click', async ()=>{
  const text = document.getElementById('le-csv-input').value.trim();
  const statusEl = document.getElementById('le-csv-status');
  if(!text){ statusEl.textContent = 'Paste or upload CSV first.'; statusEl.className = 'status-line err'; return; }
  const newLocs = ccCsvRowsToLocations(ccParseCsv(text));
  if(newLocs.length === 0){ statusEl.textContent = 'No valid rows found — check the lat/lng columns.'; statusEl.className = 'status-line err'; return; }
  const updates = {};
  newLocs.forEach(l=>{ updates[l.id] = l; });
  await db.ref(locEditorRefPath).update(updates);
  locEditorLocations = locEditorLocations.concat(newLocs);
  await syncTemplateMetaCount();
  document.getElementById('le-csv-input').value = '';
  document.getElementById('le-csv-file').value = '';
  statusEl.textContent = `Imported ${newLocs.length} location(s).`;
  statusEl.className = 'status-line good';
  renderLocEditorTable();
  switchLocEditorTab('table');
});

document.getElementById('edit-locations-table-btn').addEventListener('click', ()=>{
  openLocationEditor(gamePath('/locations'), 'Editing locations for "' + (currentGameName || 'this game') + '"', null);
});

// ================= RECALCULATION ENGINE =================
// Rebuilds every team's cash/ownership/visited state from scratch by
// replaying the full activity log in order. Used whenever an admin
// removes a bad log entry, so scores stay trustworthy.
// Known limitation: bonus-card flags (Fine Immunity / Rent Boost) are
// re-granted by replay but their *consumption* isn't perfectly replayed
// (a rent entry's amount already reflects whether a boost was used, so
// cash stays accurate — but a team's remaining flag count afterwards
// may not exactly match what it was in the moment). Cash and ownership,
// the numbers that actually matter for a fairness fix, are exact.
async function recalculateGameFromLog(){
  const teamsData = await listTeams();
  const reset = {};
  Object.values(teamsData).forEach(t=>{
    reset[t.name] = {
      ...t,
      cash: config.startMoney,
      owned: [],
      visited: {},
      cardFlags: {},
      specialDraws: {},
      lastPurchase: null
    };
  });
  let entries = [];
  try{
    const snap = await db.ref(gamePath('/activity')).once('value');
    if(snap.exists()){
      const val = snap.val();
      entries = Object.keys(val).map(k=>({...val[k], logId:k})).sort((a,b)=>a.ts-b.ts);
    }
  }catch(e){}

  entries.forEach(e=>{
    const d = e.detail || {};
    const team = reset[e.team];
    if(!team) return;
    if(e.type === 'buy'){
      team.cash -= d.price;
      team.owned.push(d.propertyId);
      team.visited[d.propertyId] = e.ts;
      team.lastPurchase = {name: d.propertyName, ts: e.ts};
    } else if(e.type === 'visit'){
      team.visited[d.propertyId] = e.ts;
    } else if(e.type === 'rent'){
      team.cash -= d.amount;
      team.visited[d.propertyId] = e.ts;
      const owner = reset[d.owner];
      if(owner){
        owner.cash += d.amount;
        if(d.boosted && owner.cardFlags.rentBoost > 0) owner.cardFlags.rentBoost -= 1;
      }
    } else if(e.type === 'chance_cash'){
      team.cash += d.cash;
      team.specialDraws[d.specialId] = true;
    } else if(e.type === 'chance_flag'){
      team.cardFlags[d.flag] = (team.cardFlags[d.flag]||0) + 1;
      team.specialDraws[d.specialId] = true;
    } else if(e.type === 'chance_auction_trigger'){
      team.specialDraws[d.specialId] = true;
    } else if(e.type === 'auction_won'){
      team.cash -= d.amount;
      if(!team.owned.includes(d.propertyId)) team.owned.push(d.propertyId);
      team.visited[d.propertyId] = e.ts;
      team.lastPurchase = {name: d.propertyName, ts: e.ts};
      if(d.prevOwner && reset[d.prevOwner]){
        reset[d.prevOwner].owned = reset[d.prevOwner].owned.filter(id=>id!==d.propertyId);
        reset[d.prevOwner].cash += d.amount;
      }
    } else if(e.type === 'meetup_fine'){
      team.cash -= d.amount;
    } else if(e.type === 'finalize_fine'){
      team.cash -= d.amount;
    } else if(e.type === 'challenge_bonus'){
      team.cash += d.amount;
    }
  });

  for(const name of Object.keys(reset)){
    await saveTeam(reset[name]);
  }
}

// ================= ACTION LOG (admin) =================
function actionLogLine(e){
  const d = e.detail || {};
  switch(e.type){
    case 'buy': return `${e.team} bought ${d.propertyName} for £${d.price}`;
    case 'visit': return `${e.team} visited ${d.propertyName}`;
    case 'rent': return `${e.team} paid £${d.amount} rent on ${d.propertyName} to ${d.owner}${d.boosted?' (doubled)':''}`;
    case 'chance_cash': return `${e.team} drew "${d.text}" at ${d.locationLabel}`;
    case 'chance_flag': return `${e.team} drew "${d.text}" at ${d.locationLabel}`;
    case 'chance_auction_trigger': return `${e.team} triggered an auction at ${d.locationLabel}`;
    case 'auction_won': return `${e.team} won ${d.propertyName} at auction for £${d.amount}`;
    case 'meetup_fine': return `${e.team} fined £${d.amount} for missing the meetup`;
    case 'finalize_fine': return `${e.team} fined £${d.amount} for not visiting ${d.propertyName}`;
    case 'challenge_bonus': return `${e.team} awarded £${d.amount} for "${d.challengeTitle}"`;
    default: return `${e.team||''} ${e.type}`;
  }
}
async function renderActionLog(){
  const el = document.getElementById('action-log-list');
  if(!el) return;
  el.innerHTML = '<div class="empty">Loading…</div>';
  try{
    const snap = await db.ref(gamePath('/activity')).once('value');
    if(!snap.exists()){ el.innerHTML = '<div class="empty">No actions logged yet.</div>'; return; }
    const val = snap.val();
    const entries = Object.keys(val).map(k=>({...val[k], logId:k})).sort((a,b)=>b.ts-a.ts);
    const rows = entries.map(e=>{
      const time = new Date(e.ts).toLocaleString([], {dateStyle:'short', timeStyle:'short'});
      return `<tr>
        <td style="font-size:10.5px; color:var(--ba-warm-grey); white-space:nowrap;">${time}</td>
        <td>${actionLogLine(e)}</td>
        <td><button class="btn danger" data-remove-action="${e.logId}" style="padding:4px 8px; font-size:10px;">Remove</button></td>
      </tr>`;
    }).join('');
    el.innerHTML = `<div class="scroll-x"><table class="ba-table"><thead><tr><th>When</th><th>What happened</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
    el.querySelectorAll('[data-remove-action]').forEach(btn=>{
      btn.addEventListener('click', ()=>removeActionLogEntry(btn.dataset.removeAction));
    });
  }catch(e){ el.innerHTML = '<div class="empty">Could not load the action log.</div>'; }
}
async function removeActionLogEntry(logId){
  if(!confirm('Remove this action? Every team\'s score will be recalculated from the remaining history.')) return;
  await db.ref(gamePath('/activity/'+logId)).remove();
  await recalculateGameFromLog();
  renderActionLog();
  renderTracking();
  renderLeaderboard();
  toast('Action removed — scores recalculated.');
}
document.getElementById('action-log-refresh-btn').addEventListener('click', renderActionLog);

// ================= CHALLENGES =================
document.getElementById('add-challenge-btn').addEventListener('click', async ()=>{
  const title = document.getElementById('new-challenge-title').value.trim();
  const desc = document.getElementById('new-challenge-desc').value.trim();
  const bonus = parseInt(document.getElementById('new-challenge-bonus').value) || 0;
  const statusEl = document.getElementById('add-challenge-status');
  if(!title){ statusEl.textContent = 'Give the challenge a title.'; statusEl.className = 'status-line err'; return; }
  const ref = db.ref(gamePath('/challenges')).push();
  await ref.set({title, description: desc, bonus, createdAt: Date.now()});
  document.getElementById('new-challenge-title').value = '';
  document.getElementById('new-challenge-desc').value = '';
  statusEl.textContent = 'Challenge added.';
  statusEl.className = 'status-line good';
  renderChallengesList();
});
async function renderChallengesList(){
  const el = document.getElementById('challenges-list');
  if(!el) return;
  el.innerHTML = '<div class="empty">Loading…</div>';
  try{
    const snap = await db.ref(gamePath('/challenges')).once('value');
    if(!snap.exists()){ el.innerHTML = '<div class="empty">No challenges yet — add one above.</div>'; return; }
    const val = snap.val();
    el.innerHTML = Object.keys(val).map(cid=>{
      const ch = val[cid];
      return `<div class="track-row"><div class="track-name" style="flex:1;">${ch.title} <span style="color:var(--ba-warm-grey); font-weight:400;">(£${ch.bonus})</span></div><button class="btn danger" data-delete-challenge="${cid}" style="padding:4px 8px; font-size:10px;">Delete</button></div>`;
    }).join('');
    el.querySelectorAll('[data-delete-challenge]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        if(!confirm('Delete this challenge? Any bonuses already awarded for it stay on the team\'s score.')) return;
        await db.ref(gamePath('/challenges/'+btn.dataset.deleteChallenge)).remove();
        renderChallengesList();
      });
    });
  }catch(e){ el.innerHTML = '<div class="empty">Could not load challenges.</div>'; }
}
async function renderChallengeSubmissions(){
  const el = document.getElementById('challenge-submissions-list');
  if(!el) return;
  el.innerHTML = '<div class="empty">Loading…</div>';
  try{
    const [chSnap, subSnap] = await Promise.all([
      db.ref(gamePath('/challenges')).once('value'),
      db.ref(gamePath('/challengeSubmissions')).once('value')
    ]);
    const challenges = chSnap.exists() ? chSnap.val() : {};
    const subs = subSnap.exists() ? subSnap.val() : {};
    let rowsHtml = '';
    Object.keys(challenges).forEach(cid=>{
      const ch = challenges[cid];
      const chSubs = subs[cid] || {};
      Object.keys(chSubs).forEach(teamKey=>{
        const s = chSubs[teamKey];
        if(s.status !== 'submitted') return;
        rowsHtml += `<div class="track-row"><div class="track-name" style="flex:1;">${ch.title} — <span style="color:var(--ba-warm-grey);">${teamKey}</span> (£${ch.bonus})</div>
          <button class="btn" data-approve-challenge="${cid}|${teamKey}" style="padding:4px 8px; font-size:10px;">Approve</button>
          <button class="btn secondary" data-reject-challenge="${cid}|${teamKey}" style="padding:4px 8px; font-size:10px;">Reject</button></div>`;
      });
    });
    el.innerHTML = rowsHtml || '<div class="empty">No pending submissions.</div>';
    el.querySelectorAll('[data-approve-challenge]').forEach(btn=>{
      btn.addEventListener('click', ()=>resolveChallengeSubmission(btn.dataset.approveChallenge, true));
    });
    el.querySelectorAll('[data-reject-challenge]').forEach(btn=>{
      btn.addEventListener('click', ()=>resolveChallengeSubmission(btn.dataset.rejectChallenge, false));
    });
  }catch(e){ el.innerHTML = '<div class="empty">Could not load submissions.</div>'; }
}
async function resolveChallengeSubmission(key, approve){
  const [cid, teamKey] = key.split('|');
  const subRef = db.ref(gamePath('/challengeSubmissions/'+cid+'/'+teamKey));
  if(approve){
    try{
      const chSnap = await db.ref(gamePath('/challenges/'+cid)).once('value');
      const ch = chSnap.val();
      const teamsData = await listTeams();
      const team = Object.values(teamsData).find(t=>safeKey(t.name)===teamKey);
      if(team && ch){
        team.cash += ch.bonus;
        await saveTeam(team);
        await logActivity('challenge_bonus', team.name, {challengeId: cid, challengeTitle: ch.title, amount: ch.bonus});
      }
      await subRef.update({status:'approved', approvedAt: Date.now()});
    }catch(e){}
  } else {
    await subRef.update({status:'rejected'});
  }
  renderChallengeSubmissions();
  renderLeaderboard();
}
document.getElementById('challenge-submissions-refresh-btn').addEventListener('click', renderChallengeSubmissions);

async function renderTeamChallenges(){
  if(!currentTeam) return;
  const el = document.getElementById('team-challenges-list');
  const card = document.getElementById('challenges-card');
  if(!el || !card) return;
  try{
    const chSnap = await db.ref(gamePath('/challenges')).once('value');
    if(!chSnap.exists()){ card.style.display = 'none'; return; }
    const challenges = chSnap.val();
    const myKey = safeKey(currentTeam.name);
    const subSnap = await db.ref(gamePath('/challengeSubmissions')).once('value');
    const subs = subSnap.exists() ? subSnap.val() : {};
    card.style.display = 'block';
    el.innerHTML = Object.keys(challenges).map(cid=>{
      const ch = challenges[cid];
      const mySub = subs[cid] && subs[cid][myKey];
      let actionHtml;
      if(!mySub) actionHtml = `<button class="btn" data-submit-challenge="${cid}" style="padding:6px 10px; font-size:11px;">Mark as done</button>`;
      else if(mySub.status==='submitted') actionHtml = `<span class="owner-tag theirs">Pending review</span>`;
      else if(mySub.status==='approved') actionHtml = `<span class="owner-tag mine">Approved +£${ch.bonus}</span>`;
      else actionHtml = `<span class="owner-tag theirs">Not approved</span>`;
      return `<div class="stop"><div class="stop-body"><div class="stop-name">${ch.title}</div><div class="stop-meta">${ch.description||''} · £${ch.bonus} bonus</div></div><div class="stop-actions">${actionHtml}</div></div>`;
    }).join('');
    el.querySelectorAll('[data-submit-challenge]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        await db.ref(gamePath('/challengeSubmissions/'+btn.dataset.submitChallenge+'/'+myKey)).set({status:'submitted', submittedAt: Date.now()});
        toast('Marked as done — awaiting organiser approval.');
        renderTeamChallenges();
      });
    });
  }catch(e){}
}

// ================= GROUPS: game-agnostic bulk helpers =================
// These deliberately don't touch the app's global PROPERTIES/CARDS/config —
// they load whatever a *specific* gameId needs, act on it, and leave the
// currently-open game (if any) completely untouched.
function pathPrefixFor(gameId){
  return (gameId==='live' || gameId==='test') ? gameId : 'games/' + gameId;
}
async function getGameName(gameId){
  if(gameId==='live') return 'Live (existing event)';
  if(gameId==='test') return 'Test (existing rehearsal)';
  try{
    const snap = await db.ref('games/'+gameId+'/meta/name').once('value');
    return snap.exists() ? snap.val() : gameId;
  }catch(e){ return gameId; }
}
async function loadLocationsFor(gameId){
  const snap = await db.ref(pathPrefixFor(gameId)+'/locations').once('value');
  const val = snap.val();
  const all = val ? (Array.isArray(val) ? val.filter(Boolean) : Object.values(val)) : [];
  return all.filter(l=>l.type!=='special');
}
function rentForBulk(prop, ownerName, teamsByName, properties){
  if(!ownerName) return prop.type==='station' ? STATION_RENT[1] : Math.round(prop.price/5);
  const owner = teamsByName[ownerName];
  if(!owner) return Math.round(prop.price/5);
  if(prop.type==='station'){
    const n = (owner.owned||[]).filter(id=>{ const p = properties.find(pp=>pp.id===id); return p && p.type==='station'; }).length;
    return STATION_RENT[n] || STATION_RENT[4];
  }
  let rent = Math.round(prop.price/5);
  const groupProps = properties.filter(p=>p.group===prop.group);
  const ownsAll = groupProps.every(p=>(owner.owned||[]).includes(p.id));
  if(ownsAll) rent *= 2;
  return rent;
}
async function resetGameById(gameId){
  const prefix = pathPrefixFor(gameId);
  await db.ref(prefix+'/teams').remove();
  await db.ref(prefix+'/activity').remove();
  await db.ref(prefix+'/activeAuction').remove();
  await db.ref(prefix+'/meetup').remove();
  await db.ref(prefix+'/challengeSubmissions').remove();
  await db.ref(prefix+'/config/finalized').set(false);
}
async function unlockGameById(gameId){
  await db.ref(pathPrefixFor(gameId)+'/config/finalized').set(false);
}
async function finalizeGameById(gameId){
  const prefix = pathPrefixFor(gameId);
  const properties = await loadLocationsFor(gameId);
  const teamsSnap = await db.ref(prefix+'/teams').once('value');
  if(!teamsSnap.exists()) return;
  const teamsByName = {};
  Object.values(teamsSnap.val()).forEach(t=>{ teamsByName[t.name] = t; });
  const owners = {};
  Object.values(teamsByName).forEach(t=>(t.owned||[]).forEach(id=>{ owners[id] = t.name; }));
  for(const t of Object.values(teamsByName)){
    t.visited = t.visited || {};
    const unvisited = properties.filter(p=>!t.visited[p.id]);
    const fines = unvisited.map(p=>({p, fine: Math.round(1.5*rentForBulk(p, owners[p.id], teamsByName, properties))}));
    fines.sort((a,b)=>b.fine-a.fine);
    t.cardFlags = t.cardFlags || {};
    let immunity = t.cardFlags.fineImmunity || 0;
    for(const f of fines){
      if(immunity > 0){ immunity -= 1; continue; }
      t.cash -= f.fine;
      await db.ref(prefix+'/activity').push({type:'finalize_fine', team:t.name, detail:{propertyId:f.p.id, propertyName:f.p.name, amount:f.fine}, ts:Date.now()});
    }
    t.cardFlags.fineImmunity = immunity;
    await db.ref(prefix+'/teams/'+safeKey(t.name)).set(t);
  }
  await db.ref(prefix+'/config/finalized').set(true);
}
async function loadCombinedLeaderboard(gameIds){
  const allTeams = [];
  for(const gameId of gameIds){
    const prefix = pathPrefixFor(gameId);
    const [teamsSnap, properties, gameName] = await Promise.all([
      db.ref(prefix+'/teams').once('value'),
      loadLocationsFor(gameId),
      getGameName(gameId)
    ]);
    if(!teamsSnap.exists()) continue;
    Object.values(teamsSnap.val()).forEach(t=>{
      const portfolioValue = (t.owned||[]).reduce((sum,id)=>{ const p=properties.find(pp=>pp.id===id); return sum+(p?p.price:0); },0);
      allTeams.push({...t, gameId, gameName, netWorth:(t.cash||0)+portfolioValue});
    });
  }
  allTeams.sort((a,b)=>b.netWorth-a.netWorth);
  return allTeams;
}
async function ccListAllGames(){
  const games = [];
  try{
    const snap = await db.ref('games').once('value');
    if(snap.exists()){
      const val = snap.val();
      Object.keys(val).forEach(id=>{
        const meta = val[id].meta;
        if(meta) games.push({id, name: meta.name || id});
      });
    }
  }catch(e){}
  for(const legacyId of ['live','test']){
    try{
      const snap = await db.ref(legacyId+'/config').once('value');
      if(snap.exists()) games.push({id: legacyId, name: legacyId==='live' ? 'Live (existing event)' : 'Test (existing rehearsal)'});
    }catch(e){}
  }
  return games;
}

// ================= GROUPS: Control Centre UI =================
let currentGroupId = null;
document.getElementById('grp-create-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('grp-new-name').value.trim();
  const statusEl = document.getElementById('grp-create-status');
  if(!name){ statusEl.textContent = 'Give the group a name.'; statusEl.className = 'status-line err'; return; }
  const id = ccGenerateGameId(name);
  await db.ref('groups/'+id+'/meta').set({name, createdAt: Date.now()});
  statusEl.textContent = `Group "${name}" created — add games to it below.`;
  statusEl.className = 'status-line good';
  document.getElementById('grp-new-name').value = '';
  renderGroupsList();
  renderCcStats();
});
document.getElementById('grp-refresh-btn').addEventListener('click', renderGroupsList);
async function renderGroupsList(){
  const el = document.getElementById('grp-list');
  if(!el) return;
  el.innerHTML = '<div class="empty">Loading…</div>';
  try{
    const snap = await db.ref('groups').once('value');
    if(!snap.exists()){ el.innerHTML = '<div class="empty">No groups yet — create one above.</div>'; return; }
    const val = snap.val();
    const rows = Object.keys(val).map(id=>{
      const meta = val[id].meta || {};
      const memberCount = val[id].games ? Object.keys(val[id].games).length : 0;
      return `<div class="track-row"><div class="track-name" style="flex:1;">${meta.name||id} <span style="color:var(--ba-warm-grey); font-weight:400;">(${memberCount} game${memberCount===1?'':'s'})</span></div>
        <button class="btn secondary" data-manage-group="${id}" data-group-name="${meta.name||id}" style="padding:4px 8px; font-size:10.5px;">Manage</button>
        <button class="btn danger" data-delete-group="${id}" style="padding:4px 8px; font-size:10.5px;">Delete</button></div>`;
    }).join('');
    el.innerHTML = rows;
    el.querySelectorAll('[data-manage-group]').forEach(btn=>{
      btn.addEventListener('click', ()=>openGroupEditor(btn.dataset.manageGroup, btn.dataset.groupName));
    });
    el.querySelectorAll('[data-delete-group]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        if(!confirm('Delete this group? The games themselves are not affected.')) return;
        await db.ref('groups/'+btn.dataset.deleteGroup).remove();
        renderGroupsList();
        renderCcStats();
      });
    });
  }catch(e){ el.innerHTML = '<div class="empty">Could not load groups.</div>'; }
}
async function openGroupEditor(groupId, name){
  currentGroupId = groupId;
  document.getElementById('group-editor-title').textContent = 'Managing "' + name + '"';
  document.getElementById('group-bulk-status').textContent = '';
  document.getElementById('group-editor-modal').style.display = 'flex';
  await populateGroupAddGameSelect();
  await renderGroupMembers();
  await renderGroupCombinedLeaderboard();
}
document.getElementById('group-editor-close-btn').addEventListener('click', ()=>{
  document.getElementById('group-editor-modal').style.display = 'none';
  currentGroupId = null;
  renderGroupsList();
});
async function populateGroupAddGameSelect(){
  const sel = document.getElementById('group-add-game-select');
  sel.innerHTML = '';
  const games = await ccListAllGames();
  games.forEach(g=>{
    const opt = document.createElement('option'); opt.value = g.id; opt.textContent = g.name;
    sel.appendChild(opt);
  });
}
document.getElementById('group-add-game-btn').addEventListener('click', async ()=>{
  const gameId = document.getElementById('group-add-game-select').value;
  if(!gameId || !currentGroupId) return;
  await db.ref('groups/'+currentGroupId+'/games/'+gameId).set(true);
  renderGroupMembers();
  renderGroupCombinedLeaderboard();
});
async function renderGroupMembers(){
  const el = document.getElementById('group-member-games-list');
  if(!currentGroupId) return;
  const snap = await db.ref('groups/'+currentGroupId+'/games').once('value');
  if(!snap.exists()){ el.innerHTML = '<div class="empty">No games in this group yet — add one above.</div>'; return; }
  const gameIds = Object.keys(snap.val());
  const rows = [];
  for(const gid of gameIds){
    const name = await getGameName(gid);
    rows.push(`<div class="track-row"><div class="track-name" style="flex:1;">${name}</div><button class="btn danger" data-remove-group-game="${gid}" style="padding:4px 8px; font-size:10px;">Remove</button></div>`);
  }
  el.innerHTML = rows.join('');
  el.querySelectorAll('[data-remove-group-game]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      await db.ref('groups/'+currentGroupId+'/games/'+btn.dataset.removeGroupGame).remove();
      renderGroupMembers();
      renderGroupCombinedLeaderboard();
    });
  });
}
async function renderGroupCombinedLeaderboard(){
  const el = document.getElementById('group-combined-leaderboard');
  if(!currentGroupId) return;
  el.innerHTML = '<div class="empty">Loading…</div>';
  const snap = await db.ref('groups/'+currentGroupId+'/games').once('value');
  const gameIds = snap.exists() ? Object.keys(snap.val()) : [];
  if(gameIds.length === 0){ el.innerHTML = '<div class="empty">Add games above to see a combined leaderboard.</div>'; return; }
  const teams = await loadCombinedLeaderboard(gameIds);
  if(teams.length === 0){ el.innerHTML = '<div class="empty">No teams registered in any member game yet.</div>'; return; }
  const rows = teams.map((t,i)=>`<tr>
    <td class="ba-rank-cell ${i===0?'gold':''}">${i+1}</td>
    <td><strong>${t.icon?t.icon+' ':''}${t.name}</strong></td>
    <td style="font-size:10.5px; color:var(--ba-warm-grey);">${t.gameName}</td>
    <td style="font-weight:800; color:var(--ba-blue-corp);">£${t.netWorth}</td>
  </tr>`).join('');
  el.innerHTML = `<div class="scroll-x"><table class="ba-table"><thead><tr><th></th><th>Team</th><th>Game</th><th>Net worth</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
document.getElementById('group-unlock-all-btn').addEventListener('click', async ()=>{
  if(!currentGroupId) return;
  const statusEl = document.getElementById('group-bulk-status');
  const snap = await db.ref('groups/'+currentGroupId+'/games').once('value');
  const gameIds = snap.exists() ? Object.keys(snap.val()) : [];
  for(const gid of gameIds){ await unlockGameById(gid); }
  statusEl.textContent = 'All games in this group re-opened.';
  statusEl.className = 'status-line good';
});
document.getElementById('group-reset-all-btn').addEventListener('click', async ()=>{
  if(!currentGroupId) return;
  if(!confirm('Reset every team in every game in this group? This cannot be undone.')) return;
  const statusEl = document.getElementById('group-bulk-status');
  statusEl.textContent = 'Resetting…';
  statusEl.className = 'status-line warn';
  const snap = await db.ref('groups/'+currentGroupId+'/games').once('value');
  const gameIds = snap.exists() ? Object.keys(snap.val()) : [];
  for(const gid of gameIds){ await resetGameById(gid); }
  statusEl.textContent = 'All games in this group reset.';
  statusEl.className = 'status-line good';
  renderGroupCombinedLeaderboard();
});
document.getElementById('group-finalize-all-btn').addEventListener('click', async ()=>{
  if(!currentGroupId) return;
  if(!confirm('Finalise every game in this group and apply fines? This locks all of them.')) return;
  const statusEl = document.getElementById('group-bulk-status');
  statusEl.textContent = 'Finalising…';
  statusEl.className = 'status-line warn';
  const snap = await db.ref('groups/'+currentGroupId+'/games').once('value');
  const gameIds = snap.exists() ? Object.keys(snap.val()) : [];
  for(const gid of gameIds){ await finalizeGameById(gid); }
  statusEl.textContent = 'All games in this group finalised.';
  statusEl.className = 'status-line good';
  renderGroupCombinedLeaderboard();
});

async function bootstrap(){
  if(!currentGameId){
    document.getElementById('control-centre').style.display = 'block';
    return;
  }
  await loadGameData();
  // Load this game's identity for the badge/subtitle, then proceed as a normal game session.
  try{
    const path = (currentGameId==='live'||currentGameId==='test') ? (currentGameId+'/meta/name') : ('games/'+currentGameId+'/meta/name');
    const snap = await db.ref(path).once('value');
    currentGameName = snap.exists() ? snap.val() : (currentGameId==='live' ? 'Live' : currentGameId==='test' ? 'Test' : currentGameId);
  }catch(e){ currentGameName = currentGameId; }
  document.getElementById('role-gate').style.display = 'block';
  const gateSub = document.getElementById('gate-game-subtitle');
  if(gateSub) gateSub.textContent = `Signing in to "${currentGameName}" · ${PROPERTIES.length} locations. Choose your role below.`;
  checkAutoLogin();
}
bootstrap();

// periodic refresh while on play tab
setInterval(()=>{ if(currentRole==='team' && currentTeam) renderStops(); }, 20000);
setInterval(()=>{ if(currentRole==='admin' && document.getElementById('view-admin').classList.contains('active')) renderTracking(); }, 15000);
