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
const DEFAULT_CONFIG = {startMoney:1500, geofenceRadius:60, eventEnd:null, adminPasscode:'LONDON26', finalized:false, coordOverrides:{}, startPoint:{lat:51.5080, lng:-0.1281}, showTeamLocations:false, organiserContact:'', cardMode:'location', cardPrice:50};
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
function isLegacyGame(id){ return id==='live' || id==='test'; }
async function loadGameData(){
  // Only the legacy single-game boards (live/test) fall back to Monopoly — a game created
  // as "Blank" legitimately has no locations yet and must stay empty.
  const legacy = isLegacyGame(currentGameId);
  applyLocations(legacy ? MONOPOLY_TEMPLATE_LOCATIONS.map(l=>({...l})) : []);
  CARDS = DEFAULT_CARDS.map((c,i)=>({...c, id:'d'+i}));
  if(!currentGameId) return;
  try{
    const locSnap = await db.ref(gamePath('/locations')).once('value');
    if(locSnap.exists()){
      const val = locSnap.val();
      const locations = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
      applyLocations(locations);
    } else if(legacy){
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
let playerMap = null, playerMarkersLayer = null, playerMeMarker = null, playerMapCentred = false;
let adminLiveMap = null, adminLiveLayer = null;
const photoCache = {};
// Live session state. A team phone keeps a listener on /teams so its own record (and everyone
// else's ownership) is always current — it never writes a whole team record back.
let myTeamKey = null;
let teamsCache = {};
let sessionListeners = [];      // [{ref, event, cb}] detached on switch-role
let gpsWatchId = null;
let wakeLock = null;
let hasAbsoluteHeading = false;
const openInfo = new Set();     // stop ids whose info panel is expanded
const busyActions = new Set();  // action keys in flight — blocks double taps
let latestAuction = null;
let positionsCache = {};       // other teams' last pings (team role), shown only if allowed

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
// Teams are allowed to go below £0 (rent, cards and fines are never blocked); show it as -£152.
function fmtMoney(n){ n = Math.round(n||0); return (n < 0 ? '-£' : '£') + Math.abs(n); }
function moneyHtml(n){ return `<span class="${(n||0) < 0 ? 'money-neg' : ''}">${fmtMoney(n)}</span>`; }
function getLatLng(item){
  const o = config.coordOverrides && config.coordOverrides[item.id];
  return o ? o : {lat:item.lat, lng:item.lng};
}
// Escape anything user- or organiser-supplied before it goes into innerHTML.
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function inc(n){ return firebase.database.ServerValue.increment(n); }
function teamPath(name, sub){ return gamePath('/teams/' + safeKey(name) + (sub ? '/' + sub : '')); }
// `owned` used to be an array; it is now a map {propId:true} so single properties can be
// added/removed without rewriting the list. Reads accept either shape (or a mix of both).
function ownedIds(t){
  const o = t && t.owned;
  if(!o) return [];
  if(Array.isArray(o)) return o.filter(Boolean);
  return Object.keys(o).filter(k=>o[k]).map(k=>typeof o[k]==='string' ? o[k] : k);
}
function toOwnedMap(val){
  const m = {};
  ownedIds({owned:val}).forEach(id=>{ m[id] = true; });
  return m;
}
async function addOwned(teamName, propId){
  await db.ref(teamPath(teamName, 'owned')).transaction(cur=>{ const m = toOwnedMap(cur); m[propId] = true; return m; });
}
async function removeOwned(teamName, propId){
  await db.ref(teamPath(teamName, 'owned')).transaction(cur=>{ const m = toOwnedMap(cur); delete m[propId]; return m; });
}
// Teams can only act while the game is running: after the organiser presses Start game, and
// before it's finalised or the event end time passes. A game with no `started` flag counts as
// not started.
function eventEndTs(){ return config.eventEnd ? new Date(config.eventEnd).getTime() : null; }
function gameLockReason(){
  if(config.finalized) return 'finalized';
  const end = eventEndTs();
  if(end != null && !isNaN(end) && Date.now() >= end) return 'ended';
  if(!config.started) return config.startedAt ? 'paused' : 'not-started';
  return null;
}
function isGameLocked(){ return gameLockReason() !== null; }
function lockedMessage(){
  switch(gameLockReason()){
    case 'not-started': return 'The game hasn\'t started yet. Wait for the organiser to press Start — you can look around, but nothing counts until then.';
    case 'paused': return 'The organiser has paused the game. Nothing can be bought, paid or drawn until it restarts.';
    case 'finalized': return 'The game has been finalised — the board is locked.';
    case 'ended': return 'Time\'s up — the board is locked. Head back to the start!';
    default: return '';
  }
}
function lockedButtonLabel(){
  const r = gameLockReason();
  return r === 'not-started' ? 'NOT STARTED' : r === 'paused' ? 'PAUSED' : 'ENDED';
}
// Distance to a stop plus whether this phone may check in there. A check-in also needs GPS
// accuracy at least as good as the radius, otherwise a ±100m fix could "reach" several stops.
function proximity(item){
  if(!currentPosition) return {dist:null, inRange:false, weak:false};
  const c = getLatLng(item);
  const dist = haversine(currentPosition.latitude, currentPosition.longitude, c.lat, c.lng);
  const radius = config.geofenceRadius;
  const near = dist <= radius;
  const weak = near && currentPosition.accuracy > radius;
  return {dist, inRange: near && !weak, weak};
}
function toast(msg, isCard){
  const stack = document.getElementById('toast-stack');
  const el = document.createElement('div');
  el.className = 'toast' + (isCard ? ' card' : '');
  el.textContent = msg;
  el.title = 'Tap to dismiss';
  el.addEventListener('click', ()=>el.remove());
  stack.appendChild(el);
  while(stack.children.length > 3) stack.firstChild.remove();
  setTimeout(()=>el.remove(), isCard ? 8000 : 5000);
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
// Whole-record write — only for creating a brand-new team. Everything else writes just the
// fields it changes so it can't clobber updates made by other devices.
async function saveTeam(team){
  await db.ref(gamePath('/teams/')+safeKey(team.name)).set(team);
}
// Renames a team and carries every reference to it (activity log, challenge submissions,
// meetup fines, live auction bids, position, ownership) across to the new name, in one
// atomic update so no device sees a half-renamed state. A signed-in phone follows the
// rename by matching its token.
async function renameTeam(oldName, newName){
  const oldKey = safeKey(oldName), newKey = safeKey(newName);
  const updates = {};
  const teamSnap = await db.ref(gamePath('/teams/'+oldKey)).once('value');
  const team = teamSnap.val();
  if(!team) return;
  if(oldKey !== newKey) updates['teams/'+newKey] = {...team, name:newName};
  else updates['teams/'+oldKey+'/name'] = newName;
  ownedIds(team).forEach(pid=>{ updates['ownership/'+pid] = newName; });
  const actSnap = await db.ref(gamePath('/activity')).once('value');
  if(actSnap.exists()){
    const val = actSnap.val();
    Object.keys(val).forEach(id=>{
      const e = val[id];
      if(e.team === oldName) updates['activity/'+id+'/team'] = newName;
      if(e.detail && e.detail.owner === oldName) updates['activity/'+id+'/detail/owner'] = newName;
      if(e.detail && e.detail.prevOwner === oldName) updates['activity/'+id+'/detail/prevOwner'] = newName;
    });
  }
  const auctionSnap = await db.ref(gamePath('/activeAuction')).once('value');
  if(auctionSnap.exists()){
    const a = auctionSnap.val();
    if(a.ownerAtStart === oldName) updates['activeAuction/ownerAtStart'] = newName;
    if(oldKey !== newKey && a.bids && a.bids[oldKey] !== undefined){
      updates['activeAuction/bids/'+newKey] = a.bids[oldKey];
      updates['activeAuction/bids/'+oldKey] = null;
    }
  }
  if(oldKey !== newKey){
    const subSnap = await db.ref(gamePath('/challengeSubmissions')).once('value');
    if(subSnap.exists()){
      const val = subSnap.val();
      Object.keys(val).forEach(cid=>{
        if(val[cid] && val[cid][oldKey] !== undefined){
          updates['challengeSubmissions/'+cid+'/'+newKey] = val[cid][oldKey];
          updates['challengeSubmissions/'+cid+'/'+oldKey] = null;
        }
      });
    }
    const fineSnap = await db.ref(gamePath('/meetup/teamFineState/'+oldKey)).once('value');
    if(fineSnap.exists()){
      updates['meetup/teamFineState/'+newKey] = fineSnap.val();
      updates['meetup/teamFineState/'+oldKey] = null;
    }
    const posSnap = await db.ref(gamePath('/positions/'+oldKey)).once('value');
    if(posSnap.exists()){
      updates['positions/'+newKey] = posSnap.val();
      updates['positions/'+oldKey] = null;
    }
    updates['teams/'+oldKey] = null;
  }
  await db.ref(gamePath('')).update(updates);
}
// Teams keyed by name. Each team's lastLocation comes from /positions (written by its phone),
// falling back to the legacy field on the team record.
async function listTeams(){
  const out = {};
  try{
    const [snap, posSnap] = await Promise.all([
      db.ref(gamePath('/teams')).once('value'),
      db.ref(gamePath('/positions')).once('value')
    ]);
    const positions = posSnap.val() || {};
    if(snap.exists()){
      const val = snap.val();
      Object.keys(val).forEach(k=>{ const t = val[k]; if(t && t.name) out[t.name] = {...t, lastLocation: positions[k] || t.lastLocation || null}; });
    }
  }catch(e){}
  return out;
}
// /ownership/{propId} = owning team's name. It's the lock a purchase claims with a transaction,
// so two teams buying at the same moment can't both win. Rebuilt from the team records after
// any bulk change (reset, recalculation).
async function rebuildOwnershipIndex(prefix){
  prefix = prefix || gamePath('');
  const snap = await db.ref(prefix+'/teams').once('value');
  const idx = {};
  Object.values(snap.val() || {}).forEach(t=>{ if(t && t.name) ownedIds(t).forEach(pid=>{ idx[pid] = t.name; }); });
  await db.ref(prefix+'/ownership').set(idx);
}
async function ensureOwnershipIndex(){
  try{
    const snap = await db.ref(gamePath('/ownership')).once('value');
    if(!snap.exists()) await rebuildOwnershipIndex();
  }catch(e){}
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
  if(!team.lockedDeviceId){ team.lockedDeviceId = myId; await db.ref(teamPath(team.name, 'lockedDeviceId')).set(myId); }
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
// Public feed wording. Returns plain text — callers escape it.
function activityText(entry){
  const d = entry.detail || {};
  const team = entry.team || '';
  switch(entry.type){
    case 'buy': return `${team} bought ${d.propertyName}`;
    case 'visit': return `${team} visited ${d.propertyName}`;
    case 'rent': return `${team} paid rent on ${d.propertyName} to ${d.owner}`;
    case 'chance_cash': case 'chance_flag': case 'chance_auction_trigger': return d.bought ? `${team} bought a Chance card` : `${team} drew a card at ${d.locationLabel}`;
    case 'auction_won': return `${team} won ${d.propertyName} at auction for £${d.amount}`;
    case 'meetup_fine': return `${team} fined £${d.amount} for missing the meetup deadline`;
    case 'finalize_fine': return `${team} fined £${d.amount} for not visiting ${d.propertyName}`;
    case 'fine_immunity_used': return `${team} used ${d.count} Fast Track card(s) to skip fines`;
    case 'challenge_bonus': return `${team} awarded £${d.amount} for "${d.challengeTitle}"`;
    case 'admin_cash': return `Organiser adjusted ${team}'s cash by ${d.delta>=0?'+':'-'}£${Math.abs(d.delta)}`;
    case 'team_reset': return `Organiser reset ${team}'s progress`;
    case 'game_started': return 'The game has started — go!';
    case 'game_paused': return 'The organiser paused the game';
    case 'game_resumed': return 'The game has resumed';
    default: return `${team} ${entry.type}`;
  }
}
function activityLine(entry){
  const time = new Date(entry.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  return `<div class="activity-row">${esc(activityText(entry))}<div class="at">${time}</div></div>`;
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
    const portfolioValue = ownedIds(t).reduce((sum,id)=>{const p=PROPERTIES.find(pp=>pp.id===id); return sum+(p?p.price:0);},0);
    return {name:t.name, cash:t.cash||0, netWorth:(t.cash||0)+portfolioValue, owned:ownedIds(t).length};
  });
  await db.ref(gamePath('/snapshots')).push({ts:Date.now(), standings});
}
// Nearest stop still worth walking to: not visited/drawn, and not the one you're already
// standing on (that one is in the "You're here" card instead).
function getNearestRemaining(){
  if(!currentTeam || !currentPosition) return null;
  const remaining = PROPERTIES.filter(p=>!(currentTeam.visited && currentTeam.visited[p.id]))
    .concat(activeSpecials().filter(s=>!(currentTeam.specialDraws && currentTeam.specialDraws[s.id])));
  let nearest=null, nd=Infinity;
  remaining.forEach(p=>{
    const d = proximity(p).dist;
    if(d <= config.geofenceRadius) return;
    if(d<nd){ nd=d; nearest=p; }
  });
  return nearest ? {stop:nearest, dist:nd} : null;
}
function ownershipMap(teamsData){
  const map = {};
  Object.values(teamsData).forEach(t=>ownedIds(t).forEach(pid=>{ map[pid] = t.name; }));
  return map;
}
function currentRent(prop, ownerName, teamsData){
  if(!ownerName) return prop.type==='station' ? STATION_RENT[1] : baseRent(prop);
  const owner = teamsData[ownerName];
  if(!owner) return baseRent(prop);
  const owned = ownedIds(owner);
  if(prop.type==='station'){
    const n = owned.filter(id=>PROPERTIES.find(p=>p.id===id)?.type==='station').length;
    return STATION_RENT[n] || STATION_RENT[4];
  }
  let rent = baseRent(prop);
  const groupProps = PROPERTIES.filter(p=>p.group===prop.group);
  const ownsAll = groupProps.every(p=>owned.includes(p.id));
  if(ownsAll) rent *= 2;
  return rent;
}
// What a visitor would pay right now, including the owner's Rent Boost card if they hold one.
function rentDue(prop, ownerName, teamsData){
  const rent = currentRent(prop, ownerName, teamsData);
  const owner = ownerName && teamsData[ownerName];
  const boosted = !!(owner && owner.cardFlags && owner.cardFlags.rentBoost > 0);
  return {rent: boosted ? rent*2 : rent, boosted};
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
  myTeamKey = safeKey(team.name);
  enterApp('team');
});
document.getElementById('gate-admin-enter-btn').addEventListener('click', async ()=>{
  const val = document.getElementById('gate-admin-pass').value;
  const statusEl = document.getElementById('gate-admin-status');
  if(val !== config.adminPasscode){ statusEl.textContent = 'Incorrect passcode.'; statusEl.className='status-line err'; return; }
  adminUnlocked = true;
  enterApp('admin');
});
function listen(path, cb){
  const ref = db.ref(gamePath(path));
  ref.on('value', cb);
  sessionListeners.push({ref, cb});
}
// Same as listen() but for a query (e.g. the last few activity entries).
function listenQuery(query, cb){
  query.on('value', cb);
  sessionListeners.push({ref: query, cb});
}
function teardownSession(){
  endTour(false);
  if(typeof closeBigScreen === 'function' && bigScreenOn) closeBigScreen();
  bigScreenWired = false;
  positionsCache = {};
  sessionListeners.forEach(({ref, cb})=>ref.off('value', cb));
  sessionListeners = [];
  activeAuctionListener = null;
  if(auctionTimerInterval){ clearInterval(auctionTimerInterval); auctionTimerInterval = null; }
  if(gpsWatchId != null && navigator.geolocation){ navigator.geolocation.clearWatch(gpsWatchId); gpsWatchId = null; }
  if(wakeLock){ try{ wakeLock.release(); }catch(e){} wakeLock = null; }
  teamsCache = {}; myTeamKey = null; latestAuction = null;
  notifiedIds = new Set(); playerMapCentred = false;
}
document.getElementById('switch-role-btn').addEventListener('click', ()=>{
  teardownSession();
  currentTeam = null; currentRole = null; adminUnlocked = false;
  document.getElementById('app-main').style.display = 'none';
  document.getElementById('role-gate').style.display = 'block';
  document.getElementById('gate-team-pin').value = '';
  document.getElementById('gate-admin-pass').value = '';
  showGateForm(null);
});

function configureNavForRole(role){
  const map = { team:['play','board','leaderboard','help'], admin:['admin','board','leaderboard','help'], spectator:['leaderboard','help'] };
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
  if(viewName==='help') renderHelp();
  if(viewName==='admin' && currentRole==='admin'){ renderTracking(); }
  if(viewName==='play' && playerMap) setTimeout(()=>playerMap.invalidateSize(), 60);
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
    if(btn.dataset.adminTab === 'play'){
      ensureAdminLiveMap();
      renderTracking();
    }
    if(btn.dataset.adminTab === 'log'){
      renderActionLog();
    }
  });
});

async function enterApp(role){
  currentRole = role;
  await loadConfig();
  document.getElementById('role-gate').style.display = 'none';
  document.getElementById('app-main').style.display = 'block';
  configureNavForRole(role);
  const envBadge = document.getElementById('env-badge');
  if(envBadge){ envBadge.textContent = currentGameName || currentGameId; envBadge.style.display = 'inline-block'; }
  const subtitles = {
    admin: 'Organiser view — setup, safety tracking, and results.',
    spectator: 'Following along live — leaderboard only.'
  };
  document.getElementById('role-subtitle').textContent = subtitles[role] || '';
  // Every role follows config live, so finalise / end time / radius changes reach phones immediately.
  listen('/config', snap=>{
    config = snap.exists() ? {...DEFAULT_CONFIG, ...snap.val()} : {...DEFAULT_CONFIG};
    if(currentRole==='team'){ renderEventClock(); scheduleTeamRender(); }
    if(currentRole==='admin') renderGameStatus();
  });
  if(role==='team'){
    myTeamKey = safeKey(currentTeam.name);
    updateTeamIdentity();
    await migrateOwnedShape(currentTeam.name);
    await ensureOwnershipIndex();
    listen('/teams', onTeamsSnapshot);
    listen('/locations', snap=>{
      const val = snap.val();
      applyLocations(val ? (Array.isArray(val) ? val.filter(Boolean) : Object.values(val)) : []);
      scheduleTeamRender();
    });
    // Other teams' positions — only drawn when the organiser allows it for this game.
    listen('/positions', snap=>{ positionsCache = snap.val() || {}; if(config.showTeamLocations) scheduleTeamRender(); });
    startGPS();
    requestWakeLock();
    renderOwnPropertyActivity();
    renderTeamChallenges();
    activeAuctionListener = (snap)=>{ latestAuction = snap.val(); renderAuctionUI(latestAuction); };
    listen('/activeAuction', activeAuctionListener);
    checkMeetupFine();
    switchView('play');
    maybeStartTour('team');
  } else if(role==='admin'){
    migrateCoordOverrides();
    ensureOwnershipIndex();
    // The organiser's screen also settles auctions, so one closes even if no team has the app open.
    listen('/activeAuction', snap=>{ latestAuction = snap.val(); });
    document.getElementById('cfg-startmoney').value = config.startMoney;
    document.getElementById('cfg-radius').value = config.geofenceRadius;
    document.getElementById('cfg-end').value = config.eventEnd || '';
    document.getElementById('cfg-passcode').value = config.adminPasscode;
    document.getElementById('cfg-show-locations').checked = !!config.showTeamLocations;
    document.getElementById('cfg-contact').value = config.organiserContact || '';
    document.getElementById('cfg-game-name').value = currentGameName || '';
    document.getElementById('cfg-card-mode').value = config.cardMode || 'location';
    document.getElementById('cfg-card-price').value = config.cardPrice != null ? config.cardPrice : DEFAULT_CONFIG.cardPrice;
    fillBigScreenLink();
    renderGameStatus();
    loadMeetupPlanIntoForm();
    populateIconSelect(document.getElementById('new-team-icon'), null);
    renderTeamLinks();
    populateManageTeamSelect();
    renderCardsManager();
    switchView('admin');
    maybeStartTour('admin');
  } else {
    switchView('leaderboard');
    maybeStartTour('spectator');
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
// Prefer a north-referenced heading: iOS gives webkitCompassHeading; Android gives it via
// deviceorientationabsolute. A plain (relative) deviceorientation alpha is NOT north-based, so
// once an absolute source has been seen the relative events are ignored, and on their own they
// are never used.
window.addEventListener('deviceorientationabsolute', handleOrientation);
window.addEventListener('deviceorientation', handleOrientation);
let compassFrame = null;
function handleOrientation(e){
  if(e.webkitCompassHeading != null){ deviceHeading = e.webkitCompassHeading; hasAbsoluteHeading = true; }
  else if((e.type === 'deviceorientationabsolute' || e.absolute === true) && e.alpha != null){ deviceHeading = (360 - e.alpha) % 360; hasAbsoluteHeading = true; }
  else return;
  if(!compassFrame) compassFrame = requestAnimationFrame(()=>{ compassFrame = null; updateCompass(); });
}

// ================= TEAM SESSION (live data) =================
// Fires on every change to any team. Keeps currentTeam fresh (rent received, organiser edits,
// auction wins…) and follows an organiser rename by matching this phone's token.
function onTeamsSnapshot(snap){
  const val = snap.val() || {};
  const byName = {};
  Object.keys(val).forEach(k=>{ const t = val[k]; if(t && t.name) byName[t.name] = t; });
  teamsCache = byName;
  let mine = val[myTeamKey];
  if((!mine || !mine.name) && currentTeam && currentTeam.token){
    const match = Object.values(byName).find(t=>t.token === currentTeam.token);
    if(match){ mine = match; myTeamKey = safeKey(match.name); }
  }
  if(mine && mine.name){
    const renamed = currentTeam && currentTeam.name !== mine.name;
    currentTeam = mine;
    if(renamed) updateTeamIdentity();
  }
  scheduleTeamRender();
  renderOwnPropertyActivity();
}
function updateTeamIdentity(){
  if(!currentTeam) return;
  const label = (currentTeam.icon ? currentTeam.icon + ' ' : '') + currentTeam.name;
  document.getElementById('role-subtitle').textContent = 'Playing as ' + label;
  const w = document.getElementById('wallet-team-name');
  if(w) w.textContent = label;
}
// Converts a legacy array-shaped `owned` to the map shape once, at sign-in.
async function migrateOwnedShape(teamName){
  try{
    await db.ref(teamPath(teamName, 'owned')).transaction(cur=>{
      if(cur == null) return null;
      if(Array.isArray(cur) || Object.values(cur).some(v=>typeof v === 'string')) return toOwnedMap(cur);
      return; // already a map — leave it
    });
  }catch(e){}
}
let teamRenderTimer = null;
function scheduleTeamRender(){
  if(teamRenderTimer) return;
  teamRenderTimer = setTimeout(()=>{ teamRenderTimer = null; renderTeamView(); }, 250);
}
function renderTeamView(){
  if(currentRole !== 'team' || !currentTeam) return;
  refreshWallet();
  renderStops();
  renderSpecials();
  updateCompass();
  renderPlayerMap();
}
async function requestWakeLock(){
  if(currentRole !== 'team' || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
  try{ wakeLock = await navigator.wakeLock.request('screen'); }catch(e){}
}
document.addEventListener('visibilitychange', ()=>{
  if(document.visibilityState === 'visible' && currentRole === 'team'){ requestWakeLock(); scheduleTeamRender(); checkMeetupFine(); }
});

function refreshWallet(){
  if(!currentTeam) return;
  const cashEl = document.getElementById('cash-display');
  cashEl.textContent = fmtMoney(currentTeam.cash);
  cashEl.classList.toggle('stat-alert', (currentTeam.cash||0) < 0);
  const negNote = document.getElementById('negative-note');
  if(negNote) negNote.style.display = (currentTeam.cash||0) < 0 ? 'block' : 'none';
  document.getElementById('portfolio-display').textContent = ownedIds(currentTeam).length;
  const visitedCount = PROPERTIES.filter(p=>currentTeam.visited && currentTeam.visited[p.id]).length;
  const pct = PROPERTIES.length ? Math.round((visitedCount / PROPERTIES.length) * 100) : 0;
  document.getElementById('visited-progress-label').textContent = visitedCount + ' / ' + PROPERTIES.length + ' visited';
  const fill = document.getElementById('visited-progress-fill');
  fill.style.width = pct + '%';
  fill.className = 'ba-progress-fill ' + (pct >= 66 ? 'on-plan' : pct >= 33 ? 'warn' : 'behind');
  const flags = currentTeam.cardFlags || {};
  const bits = [];
  if(flags.fineImmunity) bits.push(flags.fineImmunity + '× Fine Immunity');
  if(flags.rentBoost) bits.push(flags.rentBoost + '× Rent Boost');
  document.getElementById('cards-display').textContent = bits.length ? 'Active cards: ' + bits.join(', ') : 'No bonus cards held';
  renderEventClock();
}
// Countdown to config.eventEnd, and the "board locked" banner once the game is over.
let lastLockState = null;
function renderEventClock(){
  const clock = document.getElementById('event-clock');
  const banner = document.getElementById('lock-banner');
  const locked = isGameLocked();
  if(banner){
    banner.style.display = locked ? 'block' : 'none';
    banner.textContent = lockedMessage();
    banner.classList.toggle('waiting', /not-started|paused/.test(gameLockReason() || ''));
  }
  if(clock){
    const end = eventEndTs();
    if(locked || end == null || isNaN(end)){ clock.style.display = 'none'; }
    else{
      const mins = Math.max(0, Math.ceil((end - Date.now())/60000));
      clock.style.display = 'block';
      clock.textContent = '⏱ Game ends in ' + (mins >= 60 ? Math.floor(mins/60) + 'h ' + String(mins%60).padStart(2,'0') + 'm' : mins + ' min');
      clock.className = 'event-clock' + (mins <= 15 ? ' soon' : '');
    }
  }
  if(lastLockState !== null && lastLockState !== locked) scheduleTeamRender();
  lastLockState = locked;
}
setInterval(()=>{ if(currentRole==='team') renderEventClock(); }, 10000);

// ================= GPS =================
function startGPS(){
  const statusEl = document.getElementById('gps-status');
  if(!navigator.geolocation){ statusEl.textContent = 'Geolocation not supported.'; statusEl.className='status-line err'; return; }
  if(gpsWatchId != null) navigator.geolocation.clearWatch(gpsWatchId);
  gpsWatchId = navigator.geolocation.watchPosition(
    pos=>{
      currentPosition = pos.coords;
      const acc = Math.round(pos.coords.accuracy);
      const weak = pos.coords.accuracy > config.geofenceRadius;
      statusEl.textContent = weak
        ? `GPS is weak (±${acc}m) — check-ins need ±${config.geofenceRadius}m or better. Step away from tall buildings.`
        : `Location locked · accuracy ±${acc}m`;
      statusEl.className = 'status-line ' + (weak ? 'warn' : 'good');
      maybeWriteLocation();
      scheduleTeamRender();
      maybeCheckMeetup();
    },
    err=>{ statusEl.textContent = 'Location unavailable: ' + err.message; statusEl.className='status-line err'; },
    {enableHighAccuracy:true, maximumAge:5000, timeout:15000}
  );
}
// Position lives at /positions/{team} — never on the team record — so a ping can't overwrite
// cash or properties.
async function maybeWriteLocation(){
  if(!currentTeam || !currentPosition || !myTeamKey) return;
  const now = Date.now();
  if(now - lastLocationWrite < 15000) return;
  lastLocationWrite = now;
  try{
    await db.ref(gamePath('/positions/'+myTeamKey)).set({lat:currentPosition.latitude, lng:currentPosition.longitude, acc:Math.round(currentPosition.accuracy), ts:now});
  }catch(e){}
}

// ================= COMPASS =================
function updateCompass(){
  if(!currentTeam || !currentPosition) return;
  const targetEl = document.getElementById('compass-target');
  const distEl = document.getElementById('compass-dist');
  const arrow = document.getElementById('compass-arrow');
  const rose = document.getElementById('compass-rose');
  const useHeading = hasAbsoluteHeading && deviceHeading != null;
  // The N marker turns with the phone when the arrow is phone-relative, so it always points north.
  if(rose) rose.style.transform = `rotate(${useHeading ? -deviceHeading : 0}deg)`;
  const next = getNearestRemaining();
  if(!next){
    const anyLeft = PROPERTIES.some(p=>!(currentTeam.visited && currentTeam.visited[p.id]))
      || activeSpecials().some(s=>!(currentTeam.specialDraws && currentTeam.specialDraws[s.id]));
    targetEl.textContent = anyLeft ? 'You\'re at your next stop' : 'All stops visited!';
    distEl.textContent = '';
    arrow.style.opacity = '0';
    return;
  }
  arrow.style.opacity = '1';
  const nc = getLatLng(next.stop);
  const b = bearing(currentPosition.latitude, currentPosition.longitude, nc.lat, nc.lng);
  const arrowRotation = useHeading ? (b - deviceHeading + 360) % 360 : b;
  arrow.style.transform = `rotate(${arrowRotation}deg)`;
  targetEl.textContent = 'Next: ' + next.stop.name;
  distEl.textContent = fmtDist(next.dist) + (useHeading ? ' · arrow follows your phone' : ' · arrow is from north (N at top)');
}

// ================= BOARD RENDER (Play tab) =================
// What a team can do at a property right now. Shared by the main list and the "You're here" card.
function propertyAction(p, teamsData, owners){
  const visited = currentTeam.visited && currentTeam.visited[p.id];
  const owner = owners[p.id];
  const prox = proximity(p);
  const due = rentDue(p, owner, teamsData);
  const dis = busyActions.has('prop:'+p.id) ? ' disabled' : '';
  const id = esc(p.id);
  let html, actionable = false;
  if(isGameLocked()) html = `<button class="act-disabled" disabled>${lockedButtonLabel()}</button>`;
  else if(owner === currentTeam.name) html = `<button class="act-visited" disabled>OWNED BY YOU</button>`;
  else if(visited) html = `<button class="act-visited" disabled>VISITED</button>`;
  else if(prox.weak) html = `<button class="act-disabled" disabled>GPS WEAK</button>`;
  else if(!prox.inRange) html = `<button class="act-disabled" disabled>TOO FAR</button>`;
  else if(!owner){
    actionable = true;
    html = `<button class="act-buy" data-action="buy" data-id="${id}"${dis}>BUY £${p.price}</button><button class="act-visited" data-action="pass" data-id="${id}"${dis}>JUST VISIT</button>`;
  } else {
    actionable = true;
    html = `<button class="act-rent" data-action="rent" data-id="${id}"${dis}>PAY RENT £${due.rent}</button>`;
  }
  return {html, actionable, prox, owner, due};
}
function buildStopRow(p, teamsData, owners, compact){
  const a = propertyAction(p, teamsData, owners);
  const mine = a.owner === currentTeam.name;
  const row = document.createElement('div');
  row.className = 'stop' + (a.prox.inRange ? ' inrange' : '') + (mine ? ' mine' : a.owner ? ' theirs' : '');
  const ownerTag = a.owner ? `<span class="owner-tag ${mine?'mine':'theirs'}">${mine?'YOURS':esc(a.owner)}</span>` : '';
  const rentLabel = 'rent £' + a.due.rent + (a.due.boosted ? ' (Rent Boost!)' : '');
  const meta = `${a.prox.dist!==null?fmtDist(a.prox.dist)+' away':'locating…'} · £${p.price} to buy · ${rentLabel} · ${esc(p.group)}`;
  const isOpen = openInfo.has(p.id);
  const info = compact ? '' : `
      <button class="info-toggle" data-info="${esc(p.id)}">${isOpen?'Hide info':'ℹ️ info'}</button>
      <div class="stop-detail${isOpen?' open':''}">
        <div>${esc(p.fact||'')}</div>
        <img data-photo="${esc(p.id)}" alt="" ${photoCache[p.id] ? `src="${esc(photoCache[p.id])}"` : 'style="display:none;"'}>
      </div>`;
  row.innerHTML = `
    <div class="stop-swatch" style="background:${esc(p.color)}"></div>
    <div class="stop-body">
      <div class="stop-name">${esc(p.name)} ${ownerTag}</div>
      <div class="stop-meta">${meta}</div>${info}
    </div>
    <div class="stop-actions">${a.html}</div>
  `;
  return row;
}
// Open/closed state lives in openInfo so a re-render (GPS tick, someone else's purchase) keeps it.
async function toggleInfo(propId, rowEl){
  if(!rowEl) return;
  const detail = rowEl.querySelector('.stop-detail');
  const btn = rowEl.querySelector('.info-toggle');
  const opening = !openInfo.has(propId);
  if(opening) openInfo.add(propId); else openInfo.delete(propId);
  if(detail) detail.classList.toggle('open', opening);
  if(btn) btn.textContent = opening ? 'Hide info' : 'ℹ️ info';
  if(!opening || photoCache[propId]) return;
  const prop = PROPERTIES.find(p=>p.id===propId);
  if(!prop || !prop.wikiTitle) return;
  try{
    const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(prop.wikiTitle));
    if(res.ok){
      const data = await res.json();
      if(data.thumbnail && data.thumbnail.source){
        photoCache[propId] = data.thumbnail.source;
        document.querySelectorAll(`img[data-photo="${CSS.escape(propId)}"]`).forEach(img=>{ img.src = data.thumbnail.source; img.style.display = 'block'; });
      }
    }
  }catch(e){}
}
function wireStopButtons(container){
  container.querySelectorAll('[data-action]').forEach(btn=>{
    btn.addEventListener('click', ()=>handleAction(btn.dataset.action, btn.dataset.id));
  });
  container.querySelectorAll('[data-info]').forEach(btn=>{
    btn.addEventListener('click', ()=>toggleInfo(btn.dataset.info, btn.closest('.stop')));
  });
  container.querySelectorAll('[data-special]').forEach(btn=>{
    btn.addEventListener('click', ()=>drawCard(btn.dataset.special));
  });
  container.querySelectorAll('[data-buy-card]').forEach(btn=>{
    btn.addEventListener('click', ()=>buyCard());
  });
}
// Pinned at the top of Play: only the stops this team can act on right now.
function renderHereCard(teamsData, owners){
  const card = document.getElementById('here-card');
  const body = document.getElementById('here-body');
  if(!card || !body) return;
  const rows = [];
  if(!isGameLocked()){
    PROPERTIES.forEach(p=>{ if(propertyAction(p, teamsData, owners).actionable) rows.push(buildStopRow(p, teamsData, owners, true)); });
    activeSpecials().forEach(s=>{ if(specialState(s).actionable) rows.push(buildSpecialRow(s)); });
  }
  if(!rows.length){ card.style.display = 'none'; body.innerHTML = ''; return; }
  card.style.display = 'block';
  body.innerHTML = '';
  rows.forEach(r=>body.appendChild(r));
  wireStopButtons(body);
}
// Synchronous: works off the live teamsCache, so a GPS tick doesn't re-read every team.
function renderStops(){
  if(!currentTeam) return;
  const teamsData = teamsCache;
  const owners = ownershipMap(teamsData);

  PROPERTIES.forEach(p=>{
    if(notifiedIds.has(p.id) || (currentTeam.visited && currentTeam.visited[p.id])) return;
    if(isGameLocked() || !proximity(p).inRange) return;
    notifiedIds.add(p.id);
    const owner = owners[p.id];
    if(owner === currentTeam.name) return;
    const due = rentDue(p, owner, teamsData);
    notify('You reached ' + p.name, owner
      ? ('Owned by ' + owner + ' — pay rent £' + due.rent + (due.boosted ? ' (doubled by their Rent Boost)' : ''))
      : ('Unowned — buy for £' + p.price));
  });
  renderHereCard(teamsData, owners);

  const container = document.getElementById('stops-container');
  container.innerHTML = '';
  if(PROPERTIES.length === 0){ container.innerHTML = '<div class="empty">No properties on this board yet.</div>'; return; }
  if(sortMode === 'distance'){
    const sorted = [...PROPERTIES].sort((a,b)=>{
      if(!currentPosition) return 0;
      return proximity(a).dist - proximity(b).dist;
    });
    const grid = document.createElement('div');
    grid.className = 'group-grid';
    sorted.forEach(p=>grid.appendChild(buildStopRow(p, teamsData, owners)));
    container.appendChild(grid);
  } else {
    // "Near you": stops still worth visiting within NEAR_RADIUS, nearest first. The full board
    // follows, folded by colour group with set progress, so the list stays short on a phone.
    const near = currentPosition ? PROPERTIES.filter(p=>{
      const d = proximity(p).dist;
      return d <= NEAR_RADIUS && !(currentTeam.visited && currentTeam.visited[p.id]) && owners[p.id] !== currentTeam.name;
    }).sort((a,b)=>proximity(a).dist - proximity(b).dist) : [];
    if(near.length){
      const nh = document.createElement('div');
      nh.className = 'group-header';
      nh.innerHTML = `<span class="swatch" style="background:var(--ba-blue-corp)"></span><span class="group-title">Near you · within ${NEAR_RADIUS} m</span>`;
      container.appendChild(nh);
      const nearGrid = document.createElement('div');
      nearGrid.className = 'group-grid';
      near.forEach(p=>nearGrid.appendChild(buildStopRow(p, teamsData, owners)));
      container.appendChild(nearGrid);
    }
    GROUP_ORDER.forEach(group=>{
      const items = PROPERTIES.filter(p=>p.group===group);
      const det = document.createElement('details');
      det.className = 'group-block';
      det.open = openGroups.has(group);
      const sp = setProgress(group, owners);
      det.innerHTML = `<summary class="group-summary">
          <span class="swatch" style="background:${esc(items[0].color)}"></span>
          <span class="group-title">${esc(group)}</span>
          <span class="set-dots">${sp.dots}</span>
          <span class="set-text">${esc(sp.text)}</span>
        </summary>`;
      det.addEventListener('toggle', ()=>{ if(det.open) openGroups.add(group); else openGroups.delete(group); });
      const groupGrid = document.createElement('div');
      groupGrid.className = 'group-grid';
      items.forEach(p=>groupGrid.appendChild(buildStopRow(p, teamsData, owners)));
      det.appendChild(groupGrid);
      container.appendChild(det);
    });
  }
  wireStopButtons(container);
}
const NEAR_RADIUS = 500;
const openGroups = new Set();
// One dot per property in a colour group (yours / another team's / unowned) plus a short summary:
// how many you own, whether a rival is one away from the set, and how many you've visited.
function setProgress(group, owners){
  const items = PROPERTIES.filter(p=>p.group===group);
  const n = items.length;
  const isStations = items.every(p=>p.type === 'station');
  const me = currentTeam ? currentTeam.name : null;
  const counts = {};
  items.forEach(p=>{ const o = owners[p.id]; if(o) counts[o] = (counts[o]||0) + 1; });
  const dots = items.map(p=>{
    const o = owners[p.id];
    const cls = !o ? 'free' : o === me ? 'mine' : 'theirs';
    return `<i class="set-dot ${cls}" title="${esc(p.name)}${o ? ' — ' + esc(o) : ''}"></i>`;
  }).join('');
  const parts = [];
  const mine = me ? (counts[me] || 0) : 0;
  if(mine) parts.push(!isStations && mine === n ? 'Set complete — double rent' : `You own ${mine} of ${n}`);
  Object.keys(counts).filter(o=>o !== me).forEach(o=>{
    if(isStations) return;
    if(counts[o] === n) parts.push(`${o} has the set`);
    else if(n > 1 && counts[o] === n - 1) parts.push(`${o} needs 1 more`);
  });
  if(currentTeam){
    const v = items.filter(p=>currentTeam.visited && currentTeam.visited[p.id]).length;
    parts.push(`${v}/${n} visited`);
  }
  return {dots, text: parts.join(' · ')};
}
document.querySelectorAll('.sort-row button[data-sort]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    sortMode = btn.dataset.sort;
    document.querySelectorAll('.sort-row button[data-sort]').forEach(b=>b.classList.toggle('active', b===btn));
    renderStops();
  });
});

// Every action is guarded three ways: the button is disabled on tap, the action key is held in
// busyActions until it finishes, and the scoring write is gated by a Firebase transaction that
// claims the visit / ownership / draw first — so a double tap can only ever charge once.
async function handleAction(action, propId){
  const prop = PROPERTIES.find(p=>p.id===propId);
  if(!prop || !currentTeam) return;
  const key = 'prop:'+propId;
  if(busyActions.has(key)) return;
  if(isGameLocked()){ toast(lockedMessage()); return; }
  if(!proximity(prop).inRange){ toast('You need to be at ' + prop.name + ' to do that.'); return; }
  busyActions.add(key);
  document.querySelectorAll(`[data-id="${CSS.escape(propId)}"]`).forEach(b=>{ b.disabled = true; });
  try{
    if(action === 'pass'){
      if(confirm(`Just visit ${prop.name} without buying it?\n\nThis can't be undone — you won't be able to buy it later.`)) await doPass(prop);
    } else if(action === 'buy') await doBuy(prop);
    else if(action === 'rent') await doRent(prop);
  }catch(e){
    toast('That didn\'t go through — check your signal and try again.');
  }finally{
    busyActions.delete(key);
    scheduleTeamRender();
  }
}
// Claims this team's visit to a stop. Only the first claim commits.
async function claimVisit(propId){
  const tx = await db.ref(teamPath(currentTeam.name, 'visited/'+propId)).transaction(cur=>cur ? undefined : Date.now());
  return tx.committed;
}
async function doPass(prop){
  if(!await claimVisit(prop.id)){ toast('You\'ve already visited ' + prop.name + '.'); return; }
  await logActivity('visit', currentTeam.name, {propertyId: prop.id, propertyName: prop.name});
  toast('Marked ' + prop.name + ' as visited.');
}
async function doBuy(prop){
  const name = currentTeam.name;
  const owner = ownershipMap(teamsCache)[prop.id];
  if(owner){ toast(owner === name ? 'You already own ' + prop.name + '.' : prop.name + ' is already owned by ' + owner + '.'); return; }
  if(currentTeam.visited && currentTeam.visited[prop.id]){ toast('You\'ve already visited ' + prop.name + '.'); return; }
  if((currentTeam.cash||0) < prop.price){ toast('Not enough cash to buy ' + prop.name + '.'); return; }
  // The ownership claim is the lock: if two teams tap Buy at once, only one transaction commits.
  const claim = await db.ref(gamePath('/ownership/'+prop.id)).transaction(cur=>cur ? undefined : name);
  if(!claim.committed){ toast('Too late — someone else just bought ' + prop.name + '.'); return; }
  const now = Date.now();
  await addOwned(name, prop.id);
  await db.ref(teamPath(name)).update({cash: inc(-prop.price), ['visited/'+prop.id]: now, lastPurchase: {name: prop.name, ts: now}});
  await logActivity('buy', name, {propertyId: prop.id, propertyName: prop.name, price: prop.price});
  toast('Bought ' + prop.name + ' for £' + prop.price + '!');
}
async function doRent(prop){
  const me = currentTeam.name;
  const ownerName = ownershipMap(teamsCache)[prop.id];
  if(!ownerName || ownerName === me){ toast('There\'s no rent to pay here.'); return; }
  if(!await claimVisit(prop.id)){ toast('You\'ve already paid at ' + prop.name + '.'); return; }
  let rent = currentRent(prop, ownerName, teamsCache);
  // Consume one of the owner's Rent Boost cards, if they have any left.
  const boostTx = await db.ref(teamPath(ownerName, 'cardFlags/rentBoost')).transaction(cur=>(cur||0) > 0 ? cur - 1 : undefined);
  const boosted = boostTx.committed;
  if(boosted) rent *= 2;
  await db.ref(gamePath('')).update({
    ['teams/'+safeKey(me)+'/cash']: inc(-rent),
    ['teams/'+safeKey(ownerName)+'/cash']: inc(rent)
  });
  await logActivity('rent', me, {propertyId: prop.id, propertyName: prop.name, owner: ownerName, amount: rent, boosted});
  toast('Paid £' + rent + ' rent to ' + ownerName + (boosted ? ' (doubled by their Rent Boost card!)' : '') + '.');
}

// ================= SPECIALS =================
function specialState(s){
  const drawn = currentTeam.specialDraws && currentTeam.specialDraws[s.id];
  const prox = proximity(s);
  const dis = busyActions.has('special:'+s.id) ? ' disabled' : '';
  let html, actionable = false;
  if(isGameLocked()) html = `<button class="act-disabled" disabled>${lockedButtonLabel()}</button>`;
  else if(drawn) html = `<button class="act-visited" disabled>DRAWN</button>`;
  else if(prox.weak) html = `<button class="act-disabled" disabled>GPS WEAK</button>`;
  else if(!prox.inRange) html = `<button class="act-disabled" disabled>TOO FAR</button>`;
  else { actionable = true; html = `<button class="act-buy" data-special="${esc(s.id)}"${dis}>DRAW CARD</button>`; }
  return {html, actionable, prox, drawn};
}
function buildSpecialRow(s){
  const st = specialState(s);
  const row = document.createElement('div');
  row.className = 'stop' + (st.prox.inRange && !st.drawn ? ' inrange' : '');
  row.innerHTML = `
    <div class="stop-swatch" style="background:var(--red)"></div>
    <div class="stop-body">
      <div class="stop-name">${esc(s.name)}</div>
      <div class="stop-meta">${s.note ? esc(s.note) + ' · ' : ''}${st.prox.dist!==null?fmtDist(st.prox.dist)+' away':'locating…'}</div>
    </div>
    <div class="stop-actions">${st.html}</div>
  `;
  return row;
}
// How teams get Chance cards is a per-game setting (Admin → Event settings):
//   'location' — one free draw at each Chance / Community Chest point (the original game)
//   'buy'      — bought from the app, anywhere, for config.cardPrice
//   'both'     — either
function cardMode(){ return config.cardMode || 'location'; }
function drawPointsActive(){ return cardMode() !== 'buy'; }
function cardBuyingActive(){ return cardMode() !== 'location'; }
function cardPrice(){ return config.cardPrice != null ? config.cardPrice : DEFAULT_CONFIG.cardPrice; }
function activeSpecials(){ return drawPointsActive() ? SPECIALS : []; }

function buildBuyCardRow(){
  const price = cardPrice();
  const busy = busyActions.has('buycard');
  const bought = currentTeam.cardsBought || 0;
  let html;
  if(isGameLocked()) html = `<button class="act-disabled" disabled>${lockedButtonLabel()}</button>`;
  else if((currentTeam.cash||0) < price) html = `<button class="act-disabled" disabled>NEED ${fmtMoney(price)}</button>`;
  else html = `<button class="act-buy" data-buy-card="1"${busy ? ' disabled' : ''}>BUY CARD ${fmtMoney(price)}</button>`;
  const row = document.createElement('div');
  row.className = 'stop buy-card-row';
  row.innerHTML = `
    <div class="mini-card" aria-hidden="true"><span>?</span></div>
    <div class="stop-body">
      <div class="stop-name">Buy a Chance card</div>
      <div class="stop-meta">A random card from the deck, wherever you are${bought ? ` · ${bought} bought so far` : ''}</div>
    </div>
    <div class="stop-actions">${html}</div>`;
  return row;
}
function renderSpecials(){
  if(!currentTeam) return;
  const container = document.getElementById('special-stops');
  const buying = cardBuyingActive();
  const points = activeSpecials();
  if(!buying && points.length === 0){ container.innerHTML = ''; return; }
  container.innerHTML = `<div class="group-header"><span class="swatch" style="background:var(--red)"></span><span class="group-title">${points.length ? 'Chance &amp; Community Chest' : 'Chance cards'}</span></div>`;
  const specialGrid = document.createElement('div');
  specialGrid.className = 'group-grid';
  if(buying) specialGrid.appendChild(buildBuyCardRow());
  points.forEach(s=>specialGrid.appendChild(buildSpecialRow(s)));
  container.appendChild(specialGrid);
  wireStopButtons(container);
}
// Applies a card's effect. A bought card's price comes off in the same write as its effect.
async function applyCard(card, name, detail, price){
  price = price || 0;
  if(card.type === 'auction'){
    if(price) await db.ref(teamPath(name, 'cash')).set(inc(-price));
    await logActivity('chance_auction_trigger', name, {...detail, text: card.text});
    await startAuction();
  } else if(card.cash != null){
    await db.ref(teamPath(name, 'cash')).set(inc(card.cash - price));
    await logActivity('chance_cash', name, {...detail, text: card.text, cash: card.cash});
  } else if(card.flag){
    const upd = {['cardFlags/'+card.flag]: inc(1)};
    if(price) upd.cash = inc(-price);
    await db.ref(teamPath(name)).update(upd);
    await logActivity('chance_flag', name, {...detail, text: card.text, flag: card.flag});
  }
}
async function drawCard(specialId){
  if(!currentTeam) return;
  const key = 'special:'+specialId;
  if(busyActions.has(key)) return;
  if(isGameLocked()){ toast(lockedMessage()); return; }
  if(!drawPointsActive()){ toast('In this game, cards are bought rather than drawn at locations.'); return; }
  const specialObj = SPECIALS.find(s=>s.id===specialId);
  if(!specialObj || !proximity(specialObj).inRange){ toast('You need to be at the draw point to do that.'); return; }
  if(CARDS.length === 0){ toast('The card deck is empty — let your organiser know.'); return; }
  busyActions.add(key);
  document.querySelectorAll(`[data-special="${CSS.escape(specialId)}"]`).forEach(b=>{ b.disabled = true; });
  try{
    const name = currentTeam.name;
    const claim = await db.ref(teamPath(name, 'specialDraws/'+specialId)).transaction(cur=>cur ? undefined : true);
    if(!claim.committed){ toast('You\'ve already drawn a card here.'); return; }
    const card = CARDS[Math.floor(Math.random()*CARDS.length)];
    await applyCard(card, name, {specialId, locationLabel: specialObj.name});
    await showCardReveal(card, {deck: specialObj.name});
  }catch(e){
    toast('That didn\'t go through — check your signal and try again.');
  }finally{
    busyActions.delete(key);
    scheduleTeamRender();
  }
}
// Buying a card: one at a time (the button stays locked until the reveal is closed), and only
// with enough cash for the price.
async function buyCard(){
  if(!currentTeam) return;
  const key = 'buycard';
  if(busyActions.has(key)) return;
  if(isGameLocked()){ toast(lockedMessage()); return; }
  if(!cardBuyingActive()){ toast('In this game, cards are drawn at the Chance and Community Chest locations.'); return; }
  const price = cardPrice();
  if((currentTeam.cash||0) < price){ toast('You need ' + fmtMoney(price) + ' to buy a card.'); return; }
  if(CARDS.length === 0){ toast('The card deck is empty — let your organiser know.'); return; }
  busyActions.add(key);
  document.querySelectorAll('[data-buy-card]').forEach(b=>{ b.disabled = true; });
  try{
    const name = currentTeam.name;
    const card = CARDS[Math.floor(Math.random()*CARDS.length)];
    await db.ref(teamPath(name, 'cardsBought')).set(inc(1));
    await applyCard(card, name, {bought: true, price}, price);
    await showCardReveal(card, {deck: 'Chance', price});
  }catch(e){
    toast('That didn\'t go through — check your signal and try again.');
  }finally{
    busyActions.delete(key);
    scheduleTeamRender();
  }
}

// ================= CARD REVEAL ANIMATION =================
// The card flies in face down, shakes, flips to show its text and effect, then bursts. Resolves
// when the player closes it. Respects reduced-motion (shows the face straight away).
function cardEffect(card){
  if(card.type === 'auction') return {label: 'Auction!', sub: 'A sealed-bid auction is starting for a random property — check the red banner.', tone: 'auction'};
  if(card.cash != null) return {label: (card.cash >= 0 ? '+' : '-') + '£' + Math.abs(card.cash), sub: card.cash >= 0 ? 'Added to your cash' : 'Taken from your cash', tone: card.cash >= 0 ? 'good' : 'bad'};
  if(card.flag === 'fineImmunity') return {label: 'Fast Track', sub: 'Bonus card: cancels your biggest end-of-game fine', tone: 'bonus'};
  return {label: 'Rent Boost', sub: 'Bonus card: doubles the next rent another team pays you', tone: 'bonus'};
}
function showCardReveal(card, opts){
  opts = opts || {};
  return new Promise(resolve=>{
    const eff = cardEffect(card);
    const ov = document.createElement('div');
    ov.className = 'card-reveal';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Your card');
    ov.innerHTML = `
      <div class="cr-stage">
        <div class="cr-burst"></div>
        <div class="cr-card">
          <div class="cr-face cr-back"><div class="cr-back-inner"><div class="cr-q">?</div><div class="cr-back-label"></div></div></div>
          <div class="cr-face cr-front tone-${eff.tone}">
            <div class="cr-deck"></div>
            <div class="cr-text"></div>
            <div class="cr-effect"></div>
            <div class="cr-sub"></div>
          </div>
        </div>
      </div>
      <div class="cr-caption" aria-live="polite"></div>
      <button class="btn cr-close" type="button" disabled>Collect</button>`;
    ov.querySelector('.cr-back-label').textContent = (opts.deck || 'Chance').toUpperCase();
    ov.querySelector('.cr-deck').textContent = opts.deck || 'Chance';
    ov.querySelector('.cr-text').textContent = card.text;
    ov.querySelector('.cr-effect').textContent = eff.label;
    ov.querySelector('.cr-sub').textContent = eff.sub;
    const caption = ov.querySelector('.cr-caption');
    caption.textContent = opts.price ? `Card bought for ${fmtMoney(opts.price)} — opening…` : 'Drawing your card…';
    document.body.appendChild(ov);
    let revealed = false, done = false;
    const close = ()=>{
      if(!revealed || done) return;
      done = true;
      ov.classList.add('leaving');
      document.removeEventListener('keydown', onKey);
      setTimeout(()=>{ ov.remove(); resolve(); }, 250);
    };
    const onKey = e=>{ if(e.key === 'Escape' || e.key === 'Enter') close(); };
    const reveal = ()=>{
      revealed = true;
      ov.classList.add('revealed');
      caption.textContent = card.text + ' — ' + eff.label;
      const btn = ov.querySelector('.cr-close');
      btn.disabled = false;
      btn.focus();
    };
    ov.querySelector('.cr-close').addEventListener('click', close);
    ov.addEventListener('click', e=>{ if(e.target === ov) close(); });
    document.addEventListener('keydown', onKey);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){ ov.classList.add('enter', 'flip'); reveal(); return; }
    requestAnimationFrame(()=>ov.classList.add('enter'));
    setTimeout(()=>ov.classList.add('shake'), 650);
    setTimeout(()=>{ ov.classList.remove('shake'); ov.classList.add('flip'); }, 1450);
    setTimeout(reveal, 2150);
  });
}

// ================= BOARD OVERVIEW =================
let boardMode = 'ring';
document.querySelectorAll('[data-board-mode]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    boardMode = btn.dataset.boardMode;
    document.querySelectorAll('[data-board-mode]').forEach(b=>b.classList.toggle('active', b===btn));
    renderBoardOverview();
  });
});
async function renderBoardOverview(){
  const el = document.getElementById('board-overview');
  const ringWrap = document.getElementById('board-ring-wrap');
  const teamsData = await listTeams();
  const owners = ownershipMap(teamsData);
  ringWrap.style.display = boardMode === 'ring' ? '' : 'none';
  el.style.display = boardMode === 'list' ? '' : 'none';
  if(boardMode === 'ring'){
    buildBoardRing(document.getElementById('board-ring'), teamsData, {interactive: true, detailEl: document.getElementById('ring-detail')});
    renderActivityFeed('board-activity-list', 40);
    return;
  }
  el.innerHTML = '';
  GROUP_ORDER.forEach(group=>{
    const items = PROPERTIES.filter(p=>p.group===group);
    const gh = document.createElement('div');
    gh.className = 'group-header';
    gh.innerHTML = `<span class="swatch" style="background:${esc(items[0].color)}"></span><span class="group-title">${esc(group)}</span>`;
    el.appendChild(gh);
    const grid = document.createElement('div');
    grid.className = 'group-grid';
    items.forEach(p=>{
      const owner = owners[p.id];
      const due = rentDue(p, owner, teamsData);
      const row = document.createElement('div');
      row.className = 'stop';
      row.innerHTML = `
        <div class="stop-swatch" style="background:${esc(p.color)}"></div>
        <div class="stop-body">
          <div class="stop-name">${esc(p.name)} ${owner?`<span class="owner-tag theirs">${esc(owner)}</span>`:''}</div>
          <div class="stop-meta">£${p.price} · rent £${due.rent}${due.boosted?' (Rent Boost)':''}</div>
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
    const portfolioValue = ownedIds(t).reduce((sum,id)=>{ const p=PROPERTIES.find(pp=>pp.id===id); return sum+(p?p.price:0); },0);
    t.netWorth = (t.cash||0) + portfolioValue;
  });
  teams.sort((a,b)=>b.netWorth - a.netWorth || String(a.name).localeCompare(String(b.name)));
  if(podiumEl){
    if(config.finalized){
      const medals = ['🥇','🥈','🥉'];
      const podiumHtml = teams.slice(0,3).map((t,i)=>`
        <div style="flex:1; text-align:center; background:${i===0?'var(--ba-blue-dark)':'var(--white)'}; color:${i===0?'var(--white)':'var(--navy)'}; border:1px solid #ddd; border-radius:8px; padding:${i===0?'22px 12px':'14px 10px'}; ${i===0?'order:2;':i===1?'order:1;':'order:3;'}">
          <div style="font-size:${i===0?'34px':'26px'};">${medals[i]}</div>
          <div style="font-weight:800; font-size:${i===0?'15px':'13px'}; margin-top:4px;">${esc(t.icon?t.icon+' ':'')}${esc(t.name)}</div>
          <div style="font-size:11px; opacity:0.8; margin-top:2px;">${fmtMoney(t.netWorth)}</div>
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
  const showLoc = canSeeTeamLocations();
  const rows = teams.map((t,i)=>{
    const lastBought = t.lastPurchase ? t.lastPurchase.name : 'none yet';
    return `<tr>
      <td class="ba-rank-cell ${i===0?'gold':''}">${i+1}</td>
      <td><strong>${esc(t.icon?t.icon+' ':'')}${esc(t.name)}</strong></td>
      <td>${ownedIds(t).length}</td>
      <td>${moneyHtml(t.cash)}</td>
      <td>${esc(lastBought)}</td>
      ${showLoc ? `<td>${esc(nearestLabelFor(t.lastLocation))}</td>` : ''}
      <td style="font-weight:800; color:var(--ba-blue-corp);">${moneyHtml(t.netWorth)}</td>
    </tr>`;
  }).join('');
  listEl.innerHTML = `<div class="scroll-x"><table class="ba-table">
    <thead><tr><th></th><th>Team</th><th>Owned</th><th>Cash</th><th>Last bought</th>${showLoc ? '<th>Last seen</th>' : ''}<th>Net worth</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
  renderLeaderboardMap(teams, showLoc);
  renderActivityFeed('public-activity-list', 15);
}
// Per-game choice (Admin → Event settings): can teams and spectators see where other teams are?
// The organiser always can.
function canSeeTeamLocations(){ return currentRole === 'admin' || !!config.showTeamLocations; }
let lbMap = null, lbLayer = null;
function renderLeaderboardMap(teams, show){
  const card = document.getElementById('lb-map-card');
  if(!card) return;
  card.style.display = show ? 'block' : 'none';
  if(!show) return;
  if(!lbMap){
    lbMap = L.map('lb-map').setView([51.510, -0.125], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(lbMap);
    lbLayer = L.layerGroup().addTo(lbMap);
  }
  lbLayer.clearLayers();
  teams.forEach(t=>{
    if(!t.lastLocation) return;
    const stale = (Date.now() - t.lastLocation.ts) > 300000;
    const marker = L.marker([t.lastLocation.lat, t.lastLocation.lng], {icon: makeTeamPinIcon(stale, esc(t.icon))});
    marker.bindTooltip(esc((t.icon?t.icon+' ':'') + t.name), {permanent:true, direction:'top', className:'team-label', offset:[0,-22]});
    marker.addTo(lbLayer);
  });
  setTimeout(()=>lbMap.invalidateSize(), 60);
}
document.getElementById('lb-refresh-btn').addEventListener('click', renderLeaderboard);

// ================= ADMIN =================
document.getElementById('cfg-save-btn').addEventListener('click', async ()=>{
  config.startMoney = parseInt(document.getElementById('cfg-startmoney').value) || DEFAULT_CONFIG.startMoney;
  config.geofenceRadius = parseInt(document.getElementById('cfg-radius').value) || DEFAULT_CONFIG.geofenceRadius;
  config.eventEnd = document.getElementById('cfg-end').value || null;
  config.adminPasscode = document.getElementById('cfg-passcode').value || DEFAULT_CONFIG.adminPasscode;
  config.showTeamLocations = document.getElementById('cfg-show-locations').checked;
  config.organiserContact = document.getElementById('cfg-contact').value.trim();
  config.cardMode = document.getElementById('cfg-card-mode').value;
  const cardPrice = parseInt(document.getElementById('cfg-card-price').value);
  config.cardPrice = isNaN(cardPrice) || cardPrice < 0 ? DEFAULT_CONFIG.cardPrice : cardPrice;
  const newGameName = document.getElementById('cfg-game-name').value.trim();
  if(newGameName && newGameName !== currentGameName){
    await db.ref(gamePath('/meta/name')).set(newGameName);
    currentGameName = newGameName;
    const envBadge = document.getElementById('env-badge');
    if(envBadge) envBadge.textContent = currentGameName;
  }
  await saveConfig();
  document.getElementById('cfg-status').textContent = 'Settings saved.';
  document.getElementById('cfg-status').className = 'status-line good';
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
    visited: {}, owned: {}, cardFlags: {}, specialDraws: {}, lastPurchase: null,
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
  document.getElementById('edit-team-name').value = team.name || '';
  populateIconSelect(document.getElementById('edit-team-icon'), team.icon);
  document.getElementById('edit-team-pin').value = team.pin || '';
  document.getElementById('edit-team-players').value = (team.players||[]).join(', ');
  document.getElementById('edit-team-ec-name').value = (team.emergencyContact && team.emergencyContact.name) || '';
  document.getElementById('edit-team-ec-phone').value = (team.emergencyContact && team.emergencyContact.phone) || '';
  document.getElementById('edit-team-cash').value = team.cash || 0;
  editTeamLoadedCash = team.cash || 0;
  fieldsEl.style.display = 'block';
});
// Cash shown in the form when it was opened. Saving applies only the *difference* the organiser
// typed (as an increment), so rent the team received in the meantime isn't wiped.
let editTeamLoadedCash = 0;
document.getElementById('edit-team-save-btn').addEventListener('click', async ()=>{
  let name = document.getElementById('manage-team-select').value;
  if(!name) return;
  const statusEl = document.getElementById('edit-team-status');
  const newName = document.getElementById('edit-team-name').value.trim();
  if(!newName){ statusEl.textContent = 'Team name is required.'; statusEl.className = 'status-line err'; return; }
  if(safeKey(newName) !== safeKey(name) && await loadTeam(newName)){
    statusEl.textContent = 'A team with that name already exists.'; statusEl.className = 'status-line err'; return;
  }
  if(!await loadTeam(name)) return;
  const renamed = newName !== name;
  if(renamed){ await renameTeam(name, newName); name = newName; }
  const typedCash = parseInt(document.getElementById('edit-team-cash').value);
  const delta = isNaN(typedCash) ? 0 : typedCash - editTeamLoadedCash;
  const fields = {
    icon: document.getElementById('edit-team-icon').value,
    players: document.getElementById('edit-team-players').value.split(',').map(s=>s.trim()).filter(Boolean),
    emergencyContact: {name: document.getElementById('edit-team-ec-name').value.trim(), phone: document.getElementById('edit-team-ec-phone').value.trim()}
  };
  const pin = document.getElementById('edit-team-pin').value.trim();
  if(pin) fields.pin = pin;
  if(delta) fields.cash = inc(delta);
  await db.ref(teamPath(name)).update(fields);
  if(delta){
    await logActivity('admin_cash', name, {delta});
    editTeamLoadedCash = typedCash;
  }
  statusEl.textContent = (renamed ? `Saved — renamed to "${newName}". Their team link still works.` : 'Saved.') + (delta ? ` Cash ${delta>0?'+':'-'}£${Math.abs(delta)} (logged).` : '');
  statusEl.className = 'status-line good';
  if(renamed){
    await populateManageTeamSelect();
    document.getElementById('manage-team-select').value = newName;
  }
  renderTeamLinks(); renderTracking(); renderLeaderboard();
});
document.getElementById('edit-team-unlock-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('manage-team-select').value;
  if(!name) return;
  if(!await loadTeam(name)) return;
  await db.ref(teamPath(name, 'lockedDeviceId')).remove();
  document.getElementById('edit-team-status').textContent = 'Device unlocked — they can sign in on a new device now.';
  document.getElementById('edit-team-status').className = 'status-line good';
});
document.getElementById('edit-team-reset-btn').addEventListener('click', async ()=>{
  const name = document.getElementById('manage-team-select').value;
  if(!name) return;
  if(!confirm(`Reset ${name}'s progress? This clears their cash, properties and visits back to the start — players and PIN are kept.`)) return;
  if(!await loadTeam(name)) return;
  await db.ref(teamPath(name)).update({cash: config.startMoney, visited: null, owned: null, cardFlags: null, specialDraws: null, lastPurchase: null, cardsBought: null});
  // Logged so a later recalculation from the log replays the reset instead of undoing it.
  await logActivity('team_reset', name, {startMoney: config.startMoney});
  await rebuildOwnershipIndex();
  editTeamLoadedCash = config.startMoney;
  document.getElementById('edit-team-cash').value = config.startMoney;
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
    if(!t.token){ t.token = generateToken(); await db.ref(teamPath(t.name, 'token')).set(t.token); }
    const link = base + '?game=' + encodeURIComponent(currentGameId) + '&team=' + encodeURIComponent(t.token);
    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=' + encodeURIComponent(link);
    const label = (t.icon?t.icon+' ':'') + t.name;
    const row = document.createElement('div');
    row.className = 'track-row team-link-row';
    row.innerHTML = `
      <img src="${esc(qrUrl)}" alt="QR code for ${esc(t.name)}" title="Click to enlarge" data-qr-big="${esc(qrUrl.replace('120x120','600x600'))}" data-qr-name="${esc(label)}" width="44" height="44" style="border-radius:4px; border:1px solid #ddd; flex-shrink:0; cursor:zoom-in;">
      <div class="track-name team-link-name">${esc(label)}</div>
      <input type="text" readonly value="${esc(link)}" class="team-link-input" onclick="this.select()">
      <div class="team-link-btns">
        <button class="btn secondary" data-copy-link="${esc(link)}">Copy</button>
        <a class="btn secondary" href="${esc(qrUrl.replace('120x120','400x400'))}" target="_blank" style="text-decoration:none;">Print QR</a>
      </div>
    `;
    el.appendChild(row);
  }
  el.querySelectorAll('[data-qr-big]').forEach(img=>{
    img.addEventListener('click', ()=>showQrLightbox(img.dataset.qrBig, img.dataset.qrName));
  });
  el.querySelectorAll('[data-copy-link]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      try{ await navigator.clipboard.writeText(btn.dataset.copyLink); toast('Link copied.'); }
      catch(e){ toast('Could not copy automatically — tap the link field and copy manually.'); }
    });
  });
}
document.getElementById('team-links-refresh-btn').addEventListener('click', renderTeamLinks);
function showQrLightbox(src, name){
  const overlay = document.createElement('div');
  overlay.className = 'qr-lightbox';
  overlay.innerHTML = `<div class="qr-lightbox-inner"><div class="qr-lightbox-name"></div><img alt=""><div class="small-note">Click anywhere or press Esc to close</div></div>`;
  overlay.querySelector('.qr-lightbox-name').textContent = name;
  overlay.querySelector('img').src = src;
  overlay.querySelector('img').alt = 'QR code for ' + name;
  const close = ()=>{ overlay.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e=>{ if(e.key === 'Escape') close(); };
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.body.appendChild(overlay);
}

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
    return `<div class="track-row"><div class="track-name" style="flex:1;">${esc(c.text)} <span style="color:var(--ba-warm-grey); font-weight:400;">(${esc(effectLabel)})</span></div>
      <button class="btn secondary" data-edit-card="${esc(c.id)}" style="padding:4px 8px; font-size:10.5px;">Edit</button>
      <button class="btn danger" data-delete-card="${esc(c.id)}" style="padding:4px 8px; font-size:10.5px;">Delete</button></div>`;
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
  if(!el.children.length) el.innerHTML = '<div class="empty">Loading…</div>';
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
      <td><strong>${esc(t.icon?t.icon+' ':'')}${esc(t.name)}</strong><br><span style="color:var(--ba-warm-grey); font-size:10px;">PIN ${esc(t.pin||'—')}</span></td>
      <td style="font-size:10.5px; color:var(--ba-warm-grey);">${esc((t.players||[]).join(', ')||'no players listed')}</td>
      <td>${loc?fmtAgo(loc.ts):'no signal'}</td>
      <td style="font-size:10.5px;">${esc(ec)}</td>
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
// Draws team pins on whichever admin maps exist: the live map on Play control and the
// Locations map in Game setup.
function renderTeamMarkersOnMap(teamsData){
  [teamMarkersLayer, adminLiveLayer].forEach(layer=>{
    if(!layer) return;
    layer.clearLayers();
    Object.values(teamsData).forEach(t=>{
      if(!t.lastLocation) return;
      const stale = (Date.now() - t.lastLocation.ts) > 300000;
      const marker = L.marker([t.lastLocation.lat, t.lastLocation.lng], {icon: makeTeamPinIcon(stale, esc(t.icon))});
      marker.bindTooltip(esc((t.icon?t.icon+' ':'') + t.name + (stale ? ' (no signal)' : '')), {permanent:true, direction:'top', className:'team-label', offset:[0,-22]});
      marker.addTo(layer);
    });
  });
}
function ensureAdminLiveMap(){
  if(adminLiveMap){ setTimeout(()=>adminLiveMap.invalidateSize(), 60); return; }
  adminLiveMap = L.map('admin-live-map').setView([51.510, -0.125], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(adminLiveMap);
  const stopsLayer = L.layerGroup().addTo(adminLiveMap);
  ALL_POINTS.forEach(item=>{
    const {lat,lng} = getLatLng(item);
    const isSpecial = item.type === 'special';
    const icon = L.divIcon({className:'', html:`<div style="width:10px;height:10px;border-radius:50%;background:${isSpecial?'var(--red)':esc(item.color)};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4);"></div>`, iconSize:[10,10], iconAnchor:[5,5]});
    L.marker([lat,lng], {icon, title:item.name}).addTo(stopsLayer);
  });
  if(config.lunchPoint) plotLunchPoint(stopsLayer, false);
  adminLiveLayer = L.layerGroup().addTo(adminLiveMap);
  setTimeout(()=>adminLiveMap.invalidateSize(), 60);
}
function plotStartPoint(targetLayer){
  const sp = (config.startPoint) || DEFAULT_CONFIG.startPoint;
  const icon = L.divIcon({
    className:'',
    html:`<div style="width:16px;height:16px;border-radius:50%;background:var(--navy);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>`,
    iconSize:[16,16], iconAnchor:[8,8]
  });
  const editable = targetLayer === leafletMarkersLayer;
  const marker = L.marker([sp.lat, sp.lng], {icon, title:'Starting location', draggable: editable});
  marker.bindTooltip('START', {permanent:true, direction:'top', className:'team-label', offset:[0,-12]});
  if(editable) marker.on('dragend', e=>setSpecialPoint('start', e.target.getLatLng()));
  marker.addTo(targetLayer);
}
function plotLunchPoint(targetLayer, draggable = true){
  const lp = config.lunchPoint;
  if(!lp) return;
  const icon = L.divIcon({
    className:'',
    html:`<div style="width:24px;height:24px;border-radius:50%;background:var(--white);border:2px solid var(--navy);box-shadow:0 1px 4px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:13px;">🍽️</div>`,
    iconSize:[24,24], iconAnchor:[12,12]
  });
  const marker = L.marker([lp.lat, lp.lng], {icon, title:'Lunch spot', draggable});
  marker.bindTooltip('LUNCH', {permanent:true, direction:'top', className:'team-label', offset:[0,-14]});
  if(draggable) marker.on('dragend', e=>setSpecialPoint('lunch', e.target.getLatLng()));
  marker.addTo(targetLayer);
}
// Start / lunch placement on the admin Locations map
let placingPoint = null;
function setPlacingPoint(kind){
  placingPoint = (placingPoint === kind) ? null : kind;
  document.getElementById('place-start-btn').classList.toggle('active', placingPoint==='start');
  document.getElementById('place-lunch-btn').classList.toggle('active', placingPoint==='lunch');
  const statusEl = document.getElementById('special-points-status');
  statusEl.textContent = placingPoint ? `Click on the map to drop the ${placingPoint==='start'?'START':'LUNCH'} pin.` : '';
  statusEl.className = 'status-line';
  if(leafletMap) leafletMap.getContainer().style.cursor = placingPoint ? 'crosshair' : '';
}
async function setSpecialPoint(kind, latlng){
  const pt = {lat: +latlng.lat.toFixed(6), lng: +latlng.lng.toFixed(6)};
  if(kind === 'start') config.startPoint = pt; else config.lunchPoint = pt;
  await saveConfig();
  renderLocationsMap();
  renderMeetupPointSummary();
  const statusEl = document.getElementById('special-points-status');
  statusEl.textContent = `${kind==='start'?'Starting location':'Lunch spot'} saved (${pt.lat.toFixed(5)}, ${pt.lng.toFixed(5)}).`;
  statusEl.className = 'status-line good';
}
document.getElementById('place-start-btn').addEventListener('click', ()=>{ ensureLeafletMap(); setPlacingPoint('start'); });
document.getElementById('place-lunch-btn').addEventListener('click', ()=>{ ensureLeafletMap(); setPlacingPoint('lunch'); });

// ================= PLAYER'S OWN MAP =================
function ensurePlayerMap(){
  if(playerMap) return;
  playerMap = L.map('player-map').setView([51.510,-0.125], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(playerMap);
  playerMarkersLayer = L.layerGroup().addTo(playerMap);
  setTimeout(()=>{ if(playerMap) playerMap.invalidateSize(); }, 60);
}
// Markers refresh on every update, but the view only re-centres on the first GPS fix or when the
// player taps "Centre on me" — so they can pan around freely.
function renderPlayerMap(){
  if(!currentTeam) return;
  ensurePlayerMap();
  playerMarkersLayer.clearLayers();
  const visitedMap = currentTeam.visited || {};
  PROPERTIES.forEach(p=>{
    const {lat,lng} = getLatLng(p);
    const visited = visitedMap[p.id];
    const size = 12;
    const icon = L.divIcon({className:'', html:`<div style="width:${size}px;height:${size}px;border-radius:50%;background:${esc(p.color)};border:2px solid ${visited?'#2E5C99':'white'};opacity:${visited?0.5:1};"></div>`, iconSize:[size,size], iconAnchor:[size/2,size/2]});
    L.marker([lat,lng], {icon, title:p.name}).addTo(playerMarkersLayer);
  });
  plotStartPoint(playerMarkersLayer);
  if(config.showTeamLocations){
    Object.values(teamsCache).forEach(t=>{
      const k = safeKey(t.name);
      const pos = positionsCache[k];
      if(k === myTeamKey || !pos) return;
      const stale = (Date.now() - pos.ts) > 300000;
      const m = L.marker([pos.lat, pos.lng], {icon: makeTeamPinIcon(stale, esc(t.icon))});
      m.bindTooltip(esc((t.icon?t.icon+' ':'') + t.name), {direction:'top', className:'team-label', offset:[0,-22]});
      m.addTo(playerMarkersLayer);
    });
  }
  if(currentPosition){
    const here =[currentPosition.latitude, currentPosition.longitude];
    if(playerMeMarker){ playerMeMarker.setLatLng(here); }
    else{ playerMeMarker = L.circleMarker(here, {radius:8, color:'white', weight:2, fillColor:'#CE210F', fillOpacity:1}).addTo(playerMap); }
    if(!playerMapCentred){ playerMap.setView(here, 16); playerMapCentred = true; }
  }
}
document.getElementById('centre-me-btn').addEventListener('click', ()=>{
  if(!currentPosition || !playerMap){ toast('Still waiting for your location.'); return; }
  playerMap.setView([currentPosition.latitude, currentPosition.longitude], Math.max(playerMap.getZoom(), 16));
});
document.getElementById('open-google-maps-btn').addEventListener('click', ()=>{
  const n = getNearestRemaining();
  if(!n){ toast('No remaining stops to navigate to.'); return; }
  const c = getLatLng(n.stop);
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}&travelmode=walking`, '_blank');
});
document.getElementById('open-apple-maps-btn').addEventListener('click', ()=>{
  const n = getNearestRemaining();
  if(!n){ toast('No remaining stops to navigate to.'); return; }
  const c = getLatLng(n.stop);
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
  const teamsData = Object.keys(teamsCache).length ? teamsCache : await listTeams();
  const owners = ownershipMap(teamsData);
  const unowned = PROPERTIES.filter(p=>!owners[p.id]);
  const pool = unowned.length ? unowned : PROPERTIES;
  if(pool.length === 0) return;
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
  // Returning undefined aborts — an auction already running is left alone.
  await ref.transaction(current => (current && !current.resolved) ? undefined : auctionObj);
}
// Bids are stored as {amount, ts}; older ones were bare numbers.
function bidAmount(b){ return typeof b === 'number' ? b : (b && b.amount) || 0; }
function bidTs(b){ return (b && typeof b === 'object' && b.ts) || 0; }
function renderAuctionUI(auction){
  const card = document.getElementById('auction-card');
  const body = document.getElementById('auction-body');
  if(!card || !body) return;
  if(auctionTimerInterval){ clearInterval(auctionTimerInterval); auctionTimerInterval = null; }
  if(!auction){ card.style.display = 'none'; return; }
  if(auction.resolved){
    card.style.display = 'block';
    body.innerHTML = `<div>${esc((auction.result && auction.result.text) || 'Auction closed — working out the winner…')}</div><div class="btn-row"><button class="btn secondary" id="auction-dismiss-btn" style="background:white;color:var(--red);">Dismiss</button></div>`;
    const dbtn = document.getElementById('auction-dismiss-btn');
    if(dbtn) dbtn.addEventListener('click', ()=>{ card.style.display='none'; });
    return;
  }
  const prop = PROPERTIES.find(p=>p.id===auction.propertyId);
  if(!prop) return;
  card.style.display = 'block';
  const myKey = currentTeam ? safeKey(currentTeam.name) : null;
  function render(){
    const myBid = myKey && auction.bids && auction.bids[myKey] != null ? bidAmount(auction.bids[myKey]) : null;
    const msLeft = auction.endTs - Date.now();
    if(msLeft <= 0){
      body.innerHTML = `<div>Bidding closed for ${esc(prop.name)} — resolving…</div>`;
      maybeResolveAuction();
      return;
    }
    const mm = Math.floor(msLeft/60000), ss = Math.floor((msLeft%60000)/1000);
    const timeEl = document.getElementById('auction-time');
    // Only rebuild the form once — otherwise the bid input would be wiped every second.
    if(timeEl && body.dataset.bidState === String(myBid)){ timeEl.textContent = `${mm}:${String(ss).padStart(2,'0')}`; return; }
    body.dataset.bidState = String(myBid);
    body.innerHTML = `
      <div>Sealed-bid auction for <strong>${esc(prop.name)}</strong>${auction.ownerAtStart ? (' (currently owned by '+esc(auction.ownerAtStart)+')') : ' (unowned)'}. Closes in <span id="auction-time">${mm}:${String(ss).padStart(2,'0')}</span>. Highest bid wins; ties go to whoever bid first.</div>
      ${myBid != null
        ? `<div style="margin-top:8px;">Your sealed bid: £${myBid} ✓</div>`
        : `<label class="field-label" style="color:rgba(255,255,255,0.85);">Your sealed bid (£)</label>
           <input type="number" id="auction-bid-input" min="0" inputmode="numeric">
           <div class="btn-row"><button class="btn" id="auction-bid-btn" style="background:white;color:var(--red);">Submit bid</button></div>`}
    `;
    if(myBid == null){
      const bidBtn = document.getElementById('auction-bid-btn');
      if(bidBtn) bidBtn.addEventListener('click', ()=>submitAuctionBid(bidBtn));
    }
  }
  delete body.dataset.bidState;
  render();
  auctionTimerInterval = setInterval(render, 1000);
}
async function submitAuctionBid(btn){
  if(!currentTeam) return;
  const input = document.getElementById('auction-bid-input');
  const val = parseInt(input ? input.value : '');
  if(isNaN(val) || val < 0){ toast('Enter a valid bid.'); return; }
  if(isGameLocked()){ toast(lockedMessage()); return; }
  if(val > (currentTeam.cash||0)){ toast('You cannot bid more than your current cash.'); return; }
  if(btn) btn.disabled = true;
  const myKey = safeKey(currentTeam.name);
  const ref = db.ref(gamePath('/activeAuction'));
  const tx = await ref.transaction(current=>{
    if(current === null) return null;
    if(current.resolved || Date.now() >= current.endTs) return;
    if(current.bids && current.bids[myKey] != null) return;
    current.bids = current.bids || {};
    current.bids[myKey] = {amount: val, ts: Date.now()};
    return current;
  });
  const a = tx.snapshot && tx.snapshot.val();
  if(tx.committed && a && a.bids && a.bids[myKey] != null) toast('Bid submitted.');
  else{ toast('Bidding has closed.'); if(btn) btn.disabled = false; }
}
let lastResolveAttempt = 0;
function maybeResolveAuction(){
  if(Date.now() - lastResolveAttempt < 4000) return;
  lastResolveAttempt = Date.now();
  tryResolveAuction();
}
// Any open screen (team or organiser) may try to close the auction. Only the one whose
// transaction flips `resolved` to true goes on to settle it — every other attempt aborts
// (returns undefined), so the winner is charged exactly once.
async function tryResolveAuction(){
  const ref = db.ref(gamePath('/activeAuction'));
  let didResolve = false;
  const tx = await ref.transaction(current=>{
    didResolve = false;
    if(current === null) return null;
    if(current.resolved || Date.now() < current.endTs) return;
    current.resolved = true;
    current.resolvedAt = Date.now();
    didResolve = true;
    return current;
  });
  if(!tx.committed || !didResolve) return;
  const auction = tx.snapshot.val();
  if(auction) await settleAuction(auction);
}
async function settleAuction(auction){
  const ref = db.ref(gamePath('/activeAuction'));
  const prop = PROPERTIES.find(p=>p.id===auction.propertyId);
  if(!prop){ await ref.update({result:{text:'Auction cancelled — that property is no longer on the board.'}}); return; }
  const teamsData = await listTeams();
  const byKey = {};
  Object.values(teamsData).forEach(t=>{ byKey[safeKey(t.name)] = t; });
  // Highest bid wins, ties go to the earliest bid. A bid the team can no longer afford is skipped.
  const bids = Object.entries(auction.bids || {})
    .map(([k,b])=>({key:k, amount:bidAmount(b), ts:bidTs(b)}))
    .filter(b=>b.amount > 0)
    .sort((a,b)=>b.amount - a.amount || a.ts - b.ts);
  const skipped = [];
  let winner = null;
  for(const b of bids){
    const t = byKey[b.key];
    if(!t) continue;
    if((t.cash||0) >= b.amount){ winner = {team:t, amount:b.amount}; break; }
    skipped.push(t.name);
  }
  let resultText;
  if(!winner){
    resultText = `No valid bids came in — ${prop.name} stays as it was.`;
  } else {
    const w = winner.team.name, amt = winner.amount, now = Date.now();
    const prevOwnerName = ownershipMap(teamsData)[prop.id] || null;
    const paidToPrev = prevOwnerName && prevOwnerName !== w;
    const updates = {
      ['teams/'+safeKey(w)+'/cash']: inc(-amt),
      ['teams/'+safeKey(w)+'/visited/'+prop.id]: now,
      ['teams/'+safeKey(w)+'/lastPurchase']: {name: prop.name, ts: now},
      ['ownership/'+prop.id]: w
    };
    if(paidToPrev) updates['teams/'+safeKey(prevOwnerName)+'/cash'] = inc(amt);
    await db.ref(gamePath('')).update(updates);
    await addOwned(w, prop.id);
    if(paidToPrev) await removeOwned(prevOwnerName, prop.id);
    await logActivity('auction_won', w, {propertyId: prop.id, propertyName: prop.name, amount: amt, prevOwner: paidToPrev ? prevOwnerName : null});
    resultText = paidToPrev ? `${w} won ${prop.name} for £${amt} — paid to ${prevOwnerName}.` : `${w} won ${prop.name} for £${amt}.`;
  }
  if(skipped.length) resultText += ` (Higher bid from ${skipped.join(', ')} skipped — not enough cash.)`;
  await ref.update({result:{text: resultText}});
  // Clear it after a while, but only if it's still this auction.
  setTimeout(()=>{ ref.transaction(cur=>(cur && cur.startTs === auction.startTs) ? null : undefined).catch(()=>{}); }, 20000);
}
setInterval(()=>{
  if(currentRole === 'admin' && latestAuction && !latestAuction.resolved && Date.now() >= latestAuction.endTs) maybeResolveAuction();
}, 3000);

// ================= HALFWAY MEETUP CHALLENGE =================
function meetupFormValues(){
  return {
    deadlineStr: document.getElementById('meetup-deadline').value,
    fineAmount: parseInt(document.getElementById('meetup-fine').value) || 50,
    radius: parseInt(document.getElementById('meetup-radius').value) || 150,
    stopAfter: parseInt(document.getElementById('meetup-stop-after').value) || 60
  };
}
function renderMeetupPointSummary(){
  const el = document.getElementById('meetup-point-summary');
  if(!el) return;
  const lp = config.lunchPoint;
  el.textContent = lp ? `📍 ${lp.lat.toFixed(5)}, ${lp.lng.toFixed(5)} — move it by dragging the LUNCH pin on the Locations map in Game setup.`
                      : 'Not set yet — place the lunch pin on the Locations map in Game setup.';
  el.className = 'status-line' + (lp ? ' good' : ' warn');
}
function loadMeetupPlanIntoForm(){
  const plan = config.meetupPlan || {};
  if(plan.deadlineStr) document.getElementById('meetup-deadline').value = plan.deadlineStr;
  if(plan.fineAmount) document.getElementById('meetup-fine').value = plan.fineAmount;
  if(plan.radius) document.getElementById('meetup-radius').value = plan.radius;
  if(plan.stopAfter) document.getElementById('meetup-stop-after').value = plan.stopAfter;
  renderMeetupPointSummary();
}
document.getElementById('meetup-save-btn').addEventListener('click', async ()=>{
  config.meetupPlan = meetupFormValues();
  await saveConfig();
  const statusEl = document.getElementById('meetup-status');
  statusEl.textContent = 'Meetup plan saved — press Start challenge on the day.';
  statusEl.className = 'status-line good';
});
document.getElementById('meetup-start-btn').addEventListener('click', async ()=>{
  const {deadlineStr, fineAmount, radius, stopAfter} = meetupFormValues();
  const statusEl = document.getElementById('meetup-status');
  const lp = config.lunchPoint;
  if(!lp){ statusEl.textContent = 'Place the lunch spot on the Locations map in Game setup first.'; statusEl.className='status-line err'; return; }
  if(!deadlineStr){ statusEl.textContent = 'Set a deadline first.'; statusEl.className='status-line err'; return; }
  config.meetupPlan = {deadlineStr, fineAmount, radius, stopAfter};
  await saveConfig();
  const deadline = new Date(deadlineStr).getTime();
  await db.ref(gamePath('/meetup')).set({lat: lp.lat, lng: lp.lng, deadline, endsAt: deadline + stopAfter*60000, startedAt: Date.now(), fineAmount, radius, active:true, teamFineState:{}});
  statusEl.textContent = `Meetup challenge started. Fines stop ${stopAfter} minutes after the deadline.`;
  statusEl.className = 'status-line good';
});
document.getElementById('meetup-cancel-btn').addEventListener('click', async ()=>{
  await db.ref(gamePath('/meetup')).update({active:false});
  document.getElementById('meetup-status').textContent = 'Meetup challenge cancelled.';
  document.getElementById('meetup-status').className = 'status-line';
});
function meetupEndTs(m){ return m.endsAt || (m.deadline + 60*60000); }
// Number of 5-minute fines owed if the clock stopped at `stopAt`. The first lands at the deadline.
function meetupFinesDue(m, stopAt){
  if(stopAt <= m.deadline) return 0;
  return Math.floor((stopAt - m.deadline) / 300000) + 1;
}
// Charges whatever meetup fines one team owes. Safe to call from that team's phone and the
// organiser's screen at once — the transaction on teamFineState decides who charges what.
// The fine clock stops at the team's first arrival (arrivedAt), so walking on afterwards
// costs nothing, and at the meetup's end time.
async function applyMeetupFines(m, teamName, pos){
  const key = safeKey(teamName);
  const now = Date.now();
  const inRange = !!pos && haversine(pos.lat, pos.lng, m.lat, m.lng) <= (m.radius || 150);
  let delta = 0;
  const tx = await db.ref(gamePath('/meetup/teamFineState/'+key)).transaction(cur=>{
    delta = 0;
    const state = cur || {};
    const arrivedAt = state.arrivedAt || (inRange ? Math.min(pos.ts || now, now) : null);
    const stopAt = Math.min(arrivedAt || Infinity, meetupEndTs(m), now);
    const applied = state.finesApplied || 0;
    delta = Math.max(0, meetupFinesDue(m, stopAt) - applied);
    if(!delta && arrivedAt === (state.arrivedAt || null)) return;
    return {...state, arrivedAt: arrivedAt || null, finesApplied: applied + delta};
  });
  if(!tx.committed || delta <= 0) return 0;
  const fineTotal = delta * (m.fineAmount || 50);
  await db.ref(teamPath(teamName, 'cash')).set(inc(-fineTotal));
  await logActivity('meetup_fine', teamName, {amount: fineTotal});
  return fineTotal;
}
function renderMeetupCard(m, state, dist){
  const card = document.getElementById('meetup-card');
  const body = document.getElementById('meetup-body');
  if(!card || !body) return;
  const now = Date.now();
  if(!m || !m.active || now > meetupEndTs(m)){ card.style.display = 'none'; return; }
  card.style.display = 'block';
  state = state || {};
  if(state.arrivedAt){
    const fines = (state.finesApplied || 0) * (m.fineAmount || 50);
    body.innerHTML = `<div>✅ You've checked in at the meetup point${fines ? ` (late fines: £${fines})` : ' — no fine'}. You're free to carry on.</div>`;
  } else if(now <= m.deadline){
    const mins = Math.max(0, Math.ceil((m.deadline - now)/60000));
    body.innerHTML = `<div>Get your whole team to the halfway point within ${mins} minute(s)${dist!=null?` — you're ${fmtDist(dist)} away`:''}. After that, a fine of £${m.fineAmount||50} lands every 5 minutes until you arrive.</div>`;
  } else {
    body.innerHTML = `<div>⏰ The deadline has passed and you're ${dist!=null?fmtDist(dist):'some way'} from the meetup point — £${m.fineAmount||50} is added every 5 minutes until you arrive.</div>`;
  }
}
let lastMeetupCheck = 0;
function maybeCheckMeetup(){ if(Date.now() - lastMeetupCheck > 20000) checkMeetupFine(); }
async function checkMeetupFine(){
  if(!currentTeam || currentRole !== 'team') return;
  lastMeetupCheck = Date.now();
  try{
    const snap = await db.ref(gamePath('/meetup')).once('value');
    const m = snap.val();
    if(!m || !m.active){ renderMeetupCard(null); return; }
    const pos = currentPosition ? {lat:currentPosition.latitude, lng:currentPosition.longitude, ts:Date.now()} : null;
    const dist = pos ? haversine(pos.lat, pos.lng, m.lat, m.lng) : null;
    const fined = await applyMeetupFines(m, currentTeam.name, pos);
    const stateSnap = await db.ref(gamePath('/meetup/teamFineState/'+safeKey(currentTeam.name))).once('value');
    renderMeetupCard(m, stateSnap.val(), dist);
    if(fined) toast(`Meetup fine: -£${fined} for not being at the meetup point.`);
  }catch(e){}
}
// Organiser-side sweep: records arrivals from each team's last ping and charges fines for teams
// whose phone isn't open, so the meetup doesn't depend on every team having the app in front.
async function sweepMeetupFines(){
  try{
    const m = (await db.ref(gamePath('/meetup')).once('value')).val();
    if(!m || !m.active) return;
    const teams = await listTeams();
    for(const t of Object.values(teams)){
      const loc = t.lastLocation && (!m.startedAt || t.lastLocation.ts >= m.startedAt) ? t.lastLocation : null;
      await applyMeetupFines(m, t.name, loc);
    }
  }catch(e){}
}
setInterval(()=>{ if(currentRole==='team') checkMeetupFine(); }, 60000);
setInterval(()=>{ if(currentRole==='admin') sweepMeetupFines(); }, 60000);
setInterval(()=>{ if(currentRole==='admin') saveSnapshot(); }, 3600000);

// ================= GAME START / PAUSE =================
// Nothing a team does counts until the organiser presses Start game. Pause stops play the same
// way (e.g. for a safety issue) without ending the game.
function renderGameStatus(){
  const el = document.getElementById('game-status-line');
  const startBtn = document.getElementById('game-start-btn');
  const pauseBtn = document.getElementById('game-pause-btn');
  if(!el || !startBtn || !pauseBtn) return;
  const reason = gameLockReason();
  const since = config.startedAt ? new Date(config.startedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
  const text = {
    'not-started': 'Not started — teams can sign in and look around, but can\'t buy, pay, draw cards or bid.',
    'paused': 'Paused — teams can\'t do anything until you start again.',
    'finalized': 'Finalised — the board is locked.',
    'ended': 'The event end time has passed — the board is locked.'
  }[reason] || ('Running since ' + since + '.');
  el.textContent = text;
  el.className = 'game-status ' + (reason ? (reason === 'not-started' || reason === 'paused' ? 'waiting' : 'over') : 'running');
  startBtn.textContent = reason === 'paused' ? 'Resume game' : 'Start game';
  startBtn.style.display = (reason === 'not-started' || reason === 'paused') ? '' : 'none';
  pauseBtn.style.display = reason === null ? '' : 'none';
}
document.getElementById('game-start-btn').addEventListener('click', async ()=>{
  const resuming = !!config.startedAt;
  if(!confirm(resuming ? 'Resume the game? Teams can play again straight away.' : 'Start the game? Teams can buy, pay rent and draw cards from now on.')) return;
  await db.ref(gamePath('/config')).update({started: true, startedAt: config.startedAt || Date.now()});
  await logActivity(resuming ? 'game_resumed' : 'game_started', '', {});
});
document.getElementById('game-pause-btn').addEventListener('click', async ()=>{
  if(!confirm('Pause the game? Teams won\'t be able to buy, pay rent, draw cards or bid until you resume.')) return;
  await db.ref(gamePath('/config/started')).set(false);
  await logActivity('game_paused', '', {});
});

document.getElementById('finalize-btn').addEventListener('click', async ()=>{
  if(!confirm('This applies end-of-event fines to every team for unvisited properties and locks the board. Continue?')) return;
  const statusEl = document.getElementById('finalize-status');
  const res = await finalizeGameById(currentGameId);
  if(res.already){
    statusEl.textContent = 'Already finalised — fines were not applied again. Re-open the board first if you need to redo it.';
    statusEl.className = 'status-line warn';
    return;
  }
  statusEl.textContent = 'Event finalised — fines applied, board locked.';
  statusEl.className = 'status-line good';
  renderLeaderboard();
});
document.getElementById('unlock-board-btn').addEventListener('click', async ()=>{
  if(!confirm('Re-open the board? Any end-of-event fines from the last Finalise are refunded and their log entries removed.')) return;
  const res = await unlockGameById(currentGameId);
  const statusEl = document.getElementById('finalize-status');
  statusEl.textContent = res.reversed ? 'Board re-opened — end-of-event fines refunded.' : 'Board re-opened.';
  statusEl.className = 'status-line good';
  renderLeaderboard();
});
document.getElementById('admin-reset-btn').addEventListener('click', async ()=>{
  if(!confirm('This wipes every team, plus the activity log, live auction, meetup challenge, and challenge submissions. Continue?')) return;
  await resetGameById(currentGameId);
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
  leafletMap.on('click', e=>{
    if(!placingPoint) return;
    const kind = placingPoint;
    setPlacingPoint(null);
    setSpecialPoint(kind, e.latlng);
  });
}
function renderLocationsMap(){
  ensureLeafletMap();
  leafletMarkersLayer.clearLayers();
  ALL_POINTS.forEach(item=>{
    const {lat,lng} = getLatLng(item);
    const isSpecial = SPECIALS.some(s=>s.id===item.id);
    const tpl = templateCoords(item.id);
    const moved = !!tpl && (Math.abs(tpl.lat-lat) > 1e-6 || Math.abs(tpl.lng-lng) > 1e-6);
    const size = isSpecial ? 18 : 14;
    const icon = L.divIcon({
      className:'',
      html:`<div style="width:${size}px;height:${size}px;border-radius:50%;background:${isSpecial?'var(--red)':esc(item.color)};border:2px solid ${moved?'var(--blue)':'white'};box-shadow:0 1px 4px rgba(0,0,0,0.5);"></div>`,
      iconSize:[size,size], iconAnchor:[size/2,size/2]
    });
    const marker = L.marker([lat,lng], {icon, draggable:true, title:item.name});
    marker.on('click', ()=>selectLocationForEdit(item.id));
    marker.on('dragend', async (e)=>{
      const pos = e.target.getLatLng();
      await setLocationCoords(item.id, pos.lat, pos.lng);
      selectLocationForEdit(item.id);
      toast('Updated location for ' + item.name);
    });
    marker.addTo(leafletMarkersLayer);
  });
  plotStartPoint(leafletMarkersLayer);
  plotLunchPoint(leafletMarkersLayer);
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
// Coordinates have one home: the game's own /locations/{id}. Dragging a pin here and editing in
// the table editor both write there, so neither can silently override the other.
function templateCoords(id){
  const t = MONOPOLY_TEMPLATE_LOCATIONS.find(l=>l.id===id);
  return t ? {lat:t.lat, lng:t.lng} : null;
}
async function setLocationCoords(id, lat, lng){
  lat = +lat.toFixed(6); lng = +lng.toFixed(6);
  const ref = db.ref(gamePath('/locations/'+id));
  if(!(await ref.child('name').once('value')).exists()){ toast('Could not find that location in this game\'s board.'); return; }
  await ref.update({lat, lng});
  const item = ALL_POINTS.find(p=>p.id===id);
  if(item){ item.lat = lat; item.lng = lng; }
  if(config.coordOverrides && config.coordOverrides[id]){
    delete config.coordOverrides[id];
    await db.ref(gamePath('/config/coordOverrides/'+id)).remove();
  }
}
// One-off: fold pins dragged under the old system (config.coordOverrides) into /locations.
async function migrateCoordOverrides(){
  const o = config.coordOverrides || {};
  const ids = Object.keys(o).filter(id=>ALL_POINTS.some(p=>p.id===id));
  if(!ids.length) return;
  try{
    for(const id of ids) await setLocationCoords(id, o[id].lat, o[id].lng);
  }catch(e){}
}
async function saveLocationOverrideFromInputs(){
  if(!selectedMapId) return;
  const lat = parseFloat(document.getElementById('loc-edit-lat').value);
  const lng = parseFloat(document.getElementById('loc-edit-lng').value);
  if(isNaN(lat) || isNaN(lng)) return;
  await setLocationCoords(selectedMapId, lat, lng);
  renderLocationsMap();
  toast('Updated location for ' + ALL_POINTS.find(p=>p.id===selectedMapId).name);
}
document.getElementById('loc-save-btn').addEventListener('click', saveLocationOverrideFromInputs);
document.getElementById('loc-reset-btn').addEventListener('click', async ()=>{
  if(!selectedMapId) return;
  const tpl = templateCoords(selectedMapId);
  if(!tpl){ toast('This is a custom location — there are no default coordinates to go back to.'); return; }
  await setLocationCoords(selectedMapId, tpl.lat, tpl.lng);
  selectLocationForEdit(selectedMapId);
  renderLocationsMap();
  toast('Reset to default coordinates.');
});
document.getElementById('loc-reset-all-btn').addEventListener('click', async ()=>{
  if(!confirm('Reset every Monopoly location back to its default coordinates? Custom locations are left alone.')) return;
  for(const item of ALL_POINTS){
    const tpl = templateCoords(item.id);
    if(tpl) await setLocationCoords(item.id, tpl.lat, tpl.lng);
  }
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
  // Big-screen link: sign in as a spectator and go straight to the projector view.
  if(!token && params.get('screen')){
    await enterApp('spectator');
    openBigScreen();
    return;
  }
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
      return `<div class="track-row"><div class="track-name" style="flex:1;">${esc(meta.name || id)} <span style="color:var(--ba-warm-grey); font-weight:400;">(${meta.count||0} locations)</span></div>
        <button class="btn secondary" data-edit-tpl="${id}" data-edit-tpl-name="${esc(meta.name || id)}" style="padding:4px 8px; font-size:10.5px;">Edit</button>
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
  sel.innerHTML = '<option value="monopoly-builtin">Monopoly (built-in — 26 London streets)</option><option value="blank-custom">Blank — add my own locations</option>';
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
        games.push({id: legacyId, name: await getGameName(legacyId), createdAt: 0, archived: false, legacy: true});
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
      <td><strong>${esc(g.name)}</strong>${g.archived?' <span style="color:var(--ba-warm-grey); font-size:10px;">(archived)</span>':''}</td>
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
      applyLocations(locations);
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
    <td><strong>${esc(l.name)}</strong></td>
    <td>${esc(l.group||'')}</td>
    <td>${esc(l.type)}</td>
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
  // Start from the existing record so fields the form doesn't show (e.g. wikiTitle for the photo) survive.
  const existing = locEditorEditingId ? (locEditorLocations.find(l=>l.id===locEditorEditingId) || {}) : {};
  const loc = {
    ...existing,
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
// removes a bad log entry, so scores stay trustworthy. Organiser cash
// edits (admin_cash) and per-team resets (team_reset) are logged too, so
// they replay rather than being lost. Rent or an auction payment to a team
// that no longer owns the property at that point in the replay (because
// its purchase was removed) is skipped.
async function recalculateGameFromLog(){
  const teamsData = await listTeams();
  const fresh = ()=>({cash: config.startMoney, owned: [], visited: {}, cardFlags: {}, specialDraws: {}, lastPurchase: null, cardsBought: 0});
  const reset = {};
  Object.values(teamsData).forEach(t=>{ reset[t.name] = fresh(); });
  let entries = [];
  try{
    const snap = await db.ref(gamePath('/activity')).once('value');
    if(snap.exists()){
      const val = snap.val();
      entries = Object.keys(val).map(k=>({...val[k], logId:k})).sort((a,b)=>a.ts-b.ts);
    }
  }catch(e){}

  const ownerOf = pid=>Object.keys(reset).find(n=>reset[n].owned.includes(pid));
  entries.forEach(e=>{
    const d = e.detail || {};
    const team = reset[e.team];
    if(!team) return;
    if(e.type === 'buy'){
      if(ownerOf(d.propertyId)) return; // someone already owns it in the replay
      team.cash -= d.price;
      team.owned.push(d.propertyId);
      team.visited[d.propertyId] = e.ts;
      team.lastPurchase = {name: d.propertyName, ts: e.ts};
    } else if(e.type === 'visit'){
      team.visited[d.propertyId] = e.ts;
    } else if(e.type === 'rent'){
      team.visited[d.propertyId] = e.ts;
      const owner = reset[d.owner];
      if(owner && owner.owned.includes(d.propertyId)){
        team.cash -= d.amount;
        owner.cash += d.amount;
        if(d.boosted && owner.cardFlags.rentBoost > 0) owner.cardFlags.rentBoost -= 1;
      }
    } else if(e.type === 'chance_cash' || e.type === 'chance_flag' || e.type === 'chance_auction_trigger'){
      // A bought card carries its price; a location draw marks that draw point as used.
      if(e.type === 'chance_cash') team.cash += d.cash;
      if(e.type === 'chance_flag') team.cardFlags[d.flag] = (team.cardFlags[d.flag]||0) + 1;
      if(d.bought){ team.cash -= (d.price || 0); team.cardsBought += 1; }
      if(d.specialId) team.specialDraws[d.specialId] = true;
    } else if(e.type === 'auction_won'){
      team.cash -= d.amount;
      const prev = d.prevOwner && reset[d.prevOwner];
      if(prev && prev.owned.includes(d.propertyId)){
        prev.owned = prev.owned.filter(id=>id!==d.propertyId);
        prev.cash += d.amount;
      } else {
        const holder = ownerOf(d.propertyId);
        if(holder && holder !== e.team) reset[holder].owned = reset[holder].owned.filter(id=>id!==d.propertyId);
      }
      if(!team.owned.includes(d.propertyId)) team.owned.push(d.propertyId);
      team.visited[d.propertyId] = e.ts;
      team.lastPurchase = {name: d.propertyName, ts: e.ts};
    } else if(e.type === 'meetup_fine' || e.type === 'finalize_fine'){
      team.cash -= d.amount;
    } else if(e.type === 'fine_immunity_used'){
      team.cardFlags.fineImmunity = Math.max(0, (team.cardFlags.fineImmunity||0) - (d.count||0));
    } else if(e.type === 'challenge_bonus'){
      team.cash += d.amount;
    } else if(e.type === 'admin_cash'){
      team.cash += d.delta;
    } else if(e.type === 'team_reset'){
      reset[e.team] = fresh();
      if(d.startMoney != null) reset[e.team].cash = d.startMoney;
    }
  });

  // Write only the scoring fields, so name/PIN/token/device lock aren't touched.
  const updates = {};
  Object.keys(reset).forEach(name=>{
    const r = reset[name], k = safeKey(name);
    const owned = {}; r.owned.forEach(id=>{ owned[id] = true; });
    updates['teams/'+k+'/cash'] = r.cash;
    updates['teams/'+k+'/owned'] = owned;
    updates['teams/'+k+'/visited'] = r.visited;
    updates['teams/'+k+'/cardFlags'] = r.cardFlags;
    updates['teams/'+k+'/specialDraws'] = r.specialDraws;
    updates['teams/'+k+'/lastPurchase'] = r.lastPurchase;
    updates['teams/'+k+'/cardsBought'] = r.cardsBought || null;
  });
  if(Object.keys(updates).length) await db.ref(gamePath('')).update(updates);
  await rebuildOwnershipIndex();
}

// ================= ACTION LOG (admin) =================
function actionLogLine(e){
  const d = e.detail || {};
  switch(e.type){
    case 'buy': return `${e.team} bought ${d.propertyName} for £${d.price}`;
    case 'visit': return `${e.team} visited ${d.propertyName}`;
    case 'rent': return `${e.team} paid £${d.amount} rent on ${d.propertyName} to ${d.owner}${d.boosted?' (doubled)':''}`;
    case 'chance_cash': case 'chance_flag':
      return d.bought ? `${e.team} bought a card for £${d.price}: "${d.text}"` : `${e.team} drew "${d.text}" at ${d.locationLabel}`;
    case 'chance_auction_trigger': return d.bought ? `${e.team} bought a card for £${d.price} and triggered an auction` : `${e.team} triggered an auction at ${d.locationLabel}`;
    case 'auction_won': return `${e.team} won ${d.propertyName} at auction for £${d.amount}`;
    case 'meetup_fine': return `${e.team} fined £${d.amount} for missing the meetup`;
    case 'finalize_fine': return `${e.team} fined £${d.amount} for not visiting ${d.propertyName}`;
    default: return activityText(e);
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
        <td>${esc(actionLogLine(e))}</td>
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
      return `<div class="track-row"><div class="track-name" style="flex:1;">${esc(ch.title)} <span style="color:var(--ba-warm-grey); font-weight:400;">(£${ch.bonus})</span></div><button class="btn danger" data-delete-challenge="${cid}" style="padding:4px 8px; font-size:10px;">Delete</button></div>`;
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
        rowsHtml += `<div class="track-row"><div class="track-name" style="flex:1;">${esc(ch.title)} — <span style="color:var(--ba-warm-grey);">${esc(teamKey)}</span> (£${ch.bonus})</div>
          <button class="btn" data-approve-challenge="${esc(cid+'|'+teamKey)}" style="padding:4px 8px; font-size:10px;">Approve</button>
          <button class="btn secondary" data-reject-challenge="${esc(cid+'|'+teamKey)}" style="padding:4px 8px; font-size:10px;">Reject</button></div>`;
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
        // Flip submitted → approved first; only the click that wins this pays the bonus.
        const tx = await subRef.transaction(cur=>{
          if(cur === null) return null;
          if(cur.status !== 'submitted') return;
          return {...cur, status:'approved', approvedAt: Date.now()};
        });
        const after = tx.snapshot && tx.snapshot.val();
        if(tx.committed && after && after.status === 'approved'){
          await db.ref(teamPath(team.name, 'cash')).set(inc(ch.bonus));
          await logActivity('challenge_bonus', team.name, {challengeId: cid, challengeTitle: ch.title, amount: ch.bonus});
        }
      }
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
      return `<div class="stop"><div class="stop-body"><div class="stop-name">${esc(ch.title)}</div><div class="stop-meta">${ch.description ? esc(ch.description) + ' · ' : ''}£${ch.bonus} bonus</div></div><div class="stop-actions">${actionHtml}</div></div>`;
    }).join('');
    el.querySelectorAll('[data-submit-challenge]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        if(isGameLocked()){ toast(lockedMessage()); return; }
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
  const fallback = gameId==='live' ? 'Live (existing event)' : gameId==='test' ? 'Test (existing rehearsal)' : gameId;
  try{
    const snap = await db.ref(pathPrefixFor(gameId)+'/meta/name').once('value');
    return snap.exists() ? snap.val() : fallback;
  }catch(e){ return fallback; }
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
  const owned = ownedIds(owner);
  if(prop.type==='station'){
    const n = owned.filter(id=>{ const p = properties.find(pp=>pp.id===id); return p && p.type==='station'; }).length;
    return STATION_RENT[n] || STATION_RENT[4];
  }
  let rent = Math.round(prop.price/5);
  const groupProps = properties.filter(p=>p.group===prop.group);
  const ownsAll = groupProps.every(p=>owned.includes(p.id));
  if(ownsAll) rent *= 2;
  return rent;
}
async function resetGameById(gameId){
  const prefix = pathPrefixFor(gameId);
  await db.ref(prefix).update({
    teams: null, activity: null, activeAuction: null, meetup: null, challengeSubmissions: null,
    positions: null, ownership: null,
    'config/finalized': false, 'config/finalizeRecord': null,
    'config/started': false, 'config/startedAt': null
  });
}
// Re-opens a finalised game and reverses the fines that Finalise applied (cash refunded,
// Fast Track cards given back, the fine log entries removed), so Finalise → Unlock → Finalise
// charges each team once, not twice.
async function unlockGameById(gameId){
  const prefix = pathPrefixFor(gameId);
  const [recSnap, teamsSnap] = await Promise.all([
    db.ref(prefix+'/config/finalizeRecord').once('value'),
    db.ref(prefix+'/teams').once('value')
  ]);
  const rec = recSnap.val();
  const teams = teamsSnap.val() || {};
  const updates = {'config/finalized': false, 'config/finalizeRecord': null};
  if(rec){
    Object.keys(rec.teams || {}).forEach(k=>{
      const r = rec.teams[k];
      // Follow a rename since finalising: match by key first, then by name.
      const key = teams[k] ? k : Object.keys(teams).find(tk=>teams[tk] && teams[tk].name === r.name);
      if(!key) return;
      if(r.fined) updates['teams/'+key+'/cash'] = inc(r.fined);
      if(r.immunityUsed) updates['teams/'+key+'/cardFlags/fineImmunity'] = inc(r.immunityUsed);
    });
    const actSnap = await db.ref(prefix+'/activity').once('value');
    const act = actSnap.val() || {};
    Object.keys(act).forEach(id=>{ if(act[id] && act[id].detail && act[id].detail.finalizeId === rec.id) updates['activity/'+id] = null; });
  }
  await db.ref(prefix).update(updates);
  return {reversed: !!rec};
}
// Applies the end-of-event fines once. The transaction on config/finalized is the lock: a second
// Finalise (or two organisers at once) aborts instead of fining everyone again. What was charged
// is kept in config/finalizeRecord so Unlock can reverse it exactly.
async function finalizeGameById(gameId){
  const prefix = pathPrefixFor(gameId);
  const lock = await db.ref(prefix+'/config/finalized').transaction(cur=>cur ? undefined : true);
  if(!lock.committed) return {already:true};
  const finalizeId = 'fin_' + Date.now();
  const properties = await loadLocationsFor(gameId);
  const teamsSnap = await db.ref(prefix+'/teams').once('value');
  const teamsByName = {};
  const keyByName = {};
  Object.entries(teamsSnap.val() || {}).forEach(([k,t])=>{ if(t && t.name){ teamsByName[t.name] = t; keyByName[t.name] = k; } });
  const owners = {};
  Object.values(teamsByName).forEach(t=>ownedIds(t).forEach(id=>{ owners[id] = t.name; }));
  const record = {id: finalizeId, ts: Date.now(), teams: {}};
  const updates = {};
  const ts = Date.now();
  for(const t of Object.values(teamsByName)){
    const k = keyByName[t.name];
    const visited = t.visited || {};
    const fines = properties.filter(p=>!visited[p.id])
      .map(p=>({p, fine: Math.round(1.5*rentForBulk(p, owners[p.id], teamsByName, properties))}))
      .sort((a,b)=>b.fine-a.fine);
    let immunity = (t.cardFlags && t.cardFlags.fineImmunity) || 0;
    let total = 0, immunityUsed = 0;
    for(const f of fines){
      if(immunity > 0){ immunity -= 1; immunityUsed += 1; continue; }
      total += f.fine;
      updates['activity/'+db.ref(prefix+'/activity').push().key] = {type:'finalize_fine', team:t.name, detail:{propertyId:f.p.id, propertyName:f.p.name, amount:f.fine, finalizeId}, ts};
    }
    if(immunityUsed){
      updates['teams/'+k+'/cardFlags/fineImmunity'] = inc(-immunityUsed);
      updates['activity/'+db.ref(prefix+'/activity').push().key] = {type:'fine_immunity_used', team:t.name, detail:{count:immunityUsed, finalizeId}, ts};
    }
    if(total) updates['teams/'+k+'/cash'] = inc(-total);
    record.teams[k] = {name:t.name, fined:total, immunityUsed};
  }
  updates['config/finalizeRecord'] = record;
  await db.ref(prefix).update(updates);
  return {ok:true};
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
      if(!t || !t.name) return;
      const portfolioValue = ownedIds(t).reduce((sum,id)=>{ const p=properties.find(pp=>pp.id===id); return sum+(p?p.price:0); },0);
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
      return `<div class="track-row"><div class="track-name" style="flex:1;">${esc(meta.name||id)} <span style="color:var(--ba-warm-grey); font-weight:400;">(${memberCount} game${memberCount===1?'':'s'})</span></div>
        <button class="btn secondary" data-manage-group="${id}" data-group-name="${esc(meta.name||id)}" style="padding:4px 8px; font-size:10.5px;">Manage</button>
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
    rows.push(`<div class="track-row"><div class="track-name" style="flex:1;">${esc(name)}</div><button class="btn danger" data-remove-group-game="${gid}" style="padding:4px 8px; font-size:10px;">Remove</button></div>`);
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
    <td><strong>${esc(t.icon?t.icon+' ':'')}${esc(t.name)}</strong></td>
    <td style="font-size:10.5px; color:var(--ba-warm-grey);">${esc(t.gameName)}</td>
    <td style="font-weight:800; color:var(--ba-blue-corp);">${moneyHtml(t.netWorth)}</td>
  </tr>`).join('');
  el.innerHTML = `<div class="scroll-x"><table class="ba-table"><thead><tr><th></th><th>Team</th><th>Game</th><th>Net worth</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
document.getElementById('group-unlock-all-btn').addEventListener('click', async ()=>{
  if(!currentGroupId) return;
  const statusEl = document.getElementById('group-bulk-status');
  const snap = await db.ref('groups/'+currentGroupId+'/games').once('value');
  const gameIds = snap.exists() ? Object.keys(snap.val()) : [];
  for(const gid of gameIds){
    await unlockGameById(gid);
    const prefix = pathPrefixFor(gid);
    const cfg = (await db.ref(prefix+'/config').once('value')).val() || {};
    if(!cfg.started){
      await db.ref(prefix+'/config').update({started: true, startedAt: cfg.startedAt || Date.now()});
      await db.ref(prefix+'/activity').push({type: cfg.startedAt ? 'game_resumed' : 'game_started', team: '', detail: {}, ts: Date.now()});
    }
  }
  statusEl.textContent = 'All games in this group started (any finalised ones re-opened and their fines refunded).';
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
  let skipped = 0;
  for(const gid of gameIds){ const r = await finalizeGameById(gid); if(r.already) skipped++; }
  statusEl.textContent = 'All games in this group finalised.' + (skipped ? ` ${skipped} were already finalised and were not fined again.` : '');
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

// Distances and the event clock drift even without GPS or data changes, so refresh occasionally.
setInterval(()=>{ if(currentRole==='team' && currentTeam) scheduleTeamRender(); }, 20000);
setInterval(()=>{ if(currentRole==='admin' && document.getElementById('view-admin').classList.contains('active')) renderTracking(); }, 15000);
