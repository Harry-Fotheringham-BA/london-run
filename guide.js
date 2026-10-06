// ================= IN-APP GUIDES (Help tab) =================
// Player and organiser guides. Game-specific numbers (radius, starting money, meetup fines, end
// time, whether teams can see each other) come from this game's live config, so the guide always
// matches the rules actually being played. Loaded after app.js and uses its globals.

function helpFacts(){
  const plan = config.meetupPlan || {};
  const end = eventEndTs();
  return {
    start: fmtMoney(config.startMoney),
    radius: config.geofenceRadius + ' m',
    end: end && !isNaN(end) ? new Date(end).toLocaleString([], {weekday:'long', hour:'2-digit', minute:'2-digit'}) : null,
    fine: fmtMoney(plan.fineAmount || 50),
    meetupRadius: (plan.radius || 150) + ' m',
    stopAfter: plan.stopAfter || 60,
    contact: (config.organiserContact || '').trim(),
    cardMode: config.cardMode || 'location',
    cardPrice: fmtMoney(config.cardPrice != null ? config.cardPrice : 50),
    seeTeams: !!config.showTeamLocations
  };
}

function playerGuideSections(){
  const f = helpFacts();
  return [
    {title: 'Quick start', open: true, html: `
      <ol>
        <li>Wait for the organiser to press <strong>Start</strong>. Until then you can look around, but nothing counts.</li>
        <li>Walk to any stop on your map. When you're within <strong>${f.radius}</strong> of it, it appears at the top of Play under <strong>You're here</strong>.</li>
        <li>At each property you get <strong>one</strong> action for the whole game: buy it, pay rent to its owner, or just visit.</li>
        <li>The team with the highest <strong>net worth</strong> wins: cash plus the price of every property you own. You start with <strong>${f.start}</strong>.</li>
        <li>${f.end ? `The board locks at <strong>${esc(f.end)}</strong>.` : 'The board locks when the organiser ends the game.'} Unvisited properties are fined at the end, so try to reach them all.</li>
      </ol>
      <p>Keep this phone's screen on and the app open while you walk. ${f.seeTeams ? 'In this game you can see the other teams on your map and on Leaders.' : 'In this game other teams\' locations are hidden.'}</p>
      ${f.contact ? `<p class="help-contact">Organiser: <strong>${esc(f.contact)}</strong></p>` : ''}`},
    {title: 'Checking in at a property', html: `
      <table class="ba-table help-table"><thead><tr><th>You find</th><th>Button</th><th>What happens</th></tr></thead><tbody>
        <tr><td>Nobody owns it</td><td><strong>BUY</strong></td><td>You pay its price and own it. Other teams pay you rent here.</td></tr>
        <tr><td>Nobody owns it</td><td><strong>JUST VISIT</strong></td><td>Counts as visited without buying. You confirm first, because you can never buy it afterwards.</td></tr>
        <tr><td>Another team owns it</td><td><strong>PAY RENT</strong></td><td>You pay that team. It counts as your visit.</td></tr>
        <tr><td>You own it</td><td>OWNED BY YOU</td><td>Nothing to do.</td></tr>
      </tbody></table>
      <p>Tap once. The button greys out straight away and you're never charged twice, even on a poor signal.</p>
      <ul>
        <li><strong>TOO FAR</strong>: keep walking towards the pin.</li>
        <li><strong>GPS WEAK</strong>: you're close but your location is fuzzy. Step out from under tall buildings and wait a few seconds.</li>
        <li><strong>NOT STARTED</strong>, <strong>PAUSED</strong> or <strong>ENDED</strong>: the organiser hasn't started the game, has paused it, or time is up.</li>
      </ul>`},
    {title: 'Chance cards', html: `
      ${f.cardMode !== 'buy' ? `<p><strong>At locations:</strong> the red stops are draw points. Walk to one and tap <strong>DRAW CARD</strong>. Each team gets one free card per draw point.</p>` : ''}
      ${f.cardMode !== 'location' ? `<p><strong>Buying:</strong> tap <strong>BUY CARD</strong> in the Chance section on Play, wherever you are. Each card costs <strong>${f.cardPrice}</strong>, and you can buy as many as you can afford while the game is running.</p>` : ''}
      <p>Every card is a random pick from the same deck and opens with a reveal. Cards don't arrive on a timer.</p>
      <ul>
        <li><strong>Cash</strong> cards add or take money straight away.</li>
        <li><strong>Fast Track</strong> cancels your biggest end-of-game fine.</li>
        <li><strong>Upgrade voucher (Rent Boost)</strong> doubles the next rent another team pays you.</li>
        <li><strong>Landing Rights Auction</strong> opens a sealed-bid auction for a random property.</li>
      </ul>`},
    {title: 'Auctions', html: `
      <p>An auction runs for 5 minutes on every team's phone, wherever you are.</p>
      <ol>
        <li>Enter one sealed bid. You can't change it, and you can't bid more than the cash you have.</li>
        <li>Highest bid wins; if two bids are equal, the earlier one wins.</li>
        <li>If the winner can no longer afford their bid, it's skipped and the next highest wins.</li>
        <li>If another team owned the property, they receive the money.</li>
      </ol>`},
    {title: 'Halfway meetup', html: `
      <p>When the organiser starts the meetup, a blue banner shows the deadline. Get the whole team within ${f.meetupRadius} of the lunch spot in time.</p>
      <ul>
        <li>Your arrival is recorded as soon as your phone is in range. After that you're never fined, even when you walk on.</li>
        <li>Late teams pay <strong>${f.fine}</strong> at the deadline and every 5 minutes after, until they arrive or ${f.stopAfter} minutes have passed.</li>
      </ul>`},
    {title: 'Challenges', html: `<p>Do the task, then tap <strong>Mark as done</strong>. It shows <em>Pending review</em> until the organiser approves it and adds the bonus. Keep a photo as evidence.</p>`},
    {title: 'Money and scoring', html: `
      <table class="ba-table help-table"><thead><tr><th>Property</th><th>Rent a visitor pays</th></tr></thead><tbody>
        <tr><td>Street</td><td>One fifth of its price</td></tr>
        <tr><td>Street, owner has the whole colour group</td><td>Double</td></tr>
        <tr><td>Station, owner has 1 / 2 / 3 / 4</td><td>£25 / £50 / £100 / £200</td></tr>
        <tr><td>Owner holds a Rent Boost card</td><td>Double again, once</td></tr>
      </tbody></table>
      <p><strong>Going below £0.</strong> Rent, cards and fines are always taken in full, so you can go negative. Your cash then shows in red, e.g. -£150. You can still pay rent, draw cards, just visit and do challenges, but you can't buy or bid until you have enough again.</p>
      <p><strong>Ranking.</strong> Net worth counts negative cash: -£150 cash plus a £400 property is a net worth of £250.</p>
      <p><strong>End of game.</strong> Each property you never visited costs 1.5 times its current rent. Each Fast Track card cancels your biggest fine.</p>`},
    {title: 'Troubleshooting', html: `
      <table class="ba-table help-table"><thead><tr><th>Problem</th><th>Fix</th></tr></thead><tbody>
        <tr><td>"Location unavailable"</td><td>Allow location for your browser in the phone's settings, then reload.</td></tr>
        <tr><td>Location stops updating</td><td>Keep the screen on and the app in front. iPhones stop sharing location when locked.</td></tr>
        <tr><td>Compass looks wrong</td><td>On iPhone tap <strong>Enable compass</strong>. Otherwise hold the phone flat, top facing north.</td></tr>
        <tr><td>"Already signed in on another device"</td><td>Ask the organiser to unlock your team, then open your link again.</td></tr>
        <tr><td>Wrong button tapped</td><td>Tell the organiser straight away. They can undo it.</td></tr>
        <tr><td>Phone died</td><td>Sign in on another phone once the organiser unlocks your team. Nothing is lost.</td></tr>
      </tbody></table>
      ${f.contact ? `<p class="help-contact">Organiser: <strong>${esc(f.contact)}</strong></p>` : ''}`}
  ];
}

function organiserGuideSections(){
  const f = helpFacts();
  return [
    {title: 'On the day, in order', open: true, html: `
      <ol>
        <li>Open <strong>Admin → Play control</strong> on a plugged-in laptop and leave it open all day. It closes auctions and charges meetup fines for teams whose app is closed.</li>
        <li>Check every team has signed in and shows a red pin on the live map.</li>
        <li>Press <strong>Start game</strong>. Until then teams can't do anything that scores.</li>
        <li>Press <strong>Start challenge</strong> for the halfway meetup when appropriate.</li>
        <li>Approve challenges under <strong>Game setup → Submissions to review</strong>.</li>
        <li>When everyone is back, press <strong>Finalise &amp; apply fines</strong>, then show <strong>Leaders</strong>.</li>
      </ol>
      <p>Use <strong>Pause game</strong> to stop all play at once, for example for a safety issue.</p>`},
    {title: 'Before the day', html: `
      <ul class="help-checklist">
        <li>Change the organiser passcode and the Control Centre passcode from their defaults.</li>
        <li>Set the check-in radius (now <strong>${f.radius}</strong>; 50–75 m suits central London) and the event end time.</li>
        <li>Decide whether teams may see each other's locations (now <strong>${f.seeTeams ? 'visible' : 'hidden'}</strong>).</li>
        <li>Add an organiser contact so it appears in every player's Help tab${f.contact ? ` (now <strong>${esc(f.contact)}</strong>)` : ''}.</li>
        <li>Check the pins on <strong>Game setup → Locations map</strong>. Place START away from any property, and place LUNCH.</li>
        <li>Choose how teams get Chance cards (now <strong>${{location: 'at locations', buy: 'bought for ' + f.cardPrice, both: 'at locations or bought for ' + f.cardPrice}[f.cardMode]}</strong>), review the deck, and add challenges.</li>
        <li>For a projector, open the <strong>Big screen</strong> link from Play control on the screen's computer.</li>
        <li>Save the meetup plan: deadline, fine, arrival radius and when fines stop.</li>
        <li>Register teams and send each one its own link or QR code from <strong>Teams → Team links</strong>.</li>
        <li>Rehearse in a separate test game from the Control Centre.</li>
      </ul>`},
    {title: 'Teams, links and devices', html: `
      <ul>
        <li><strong>Register a team</strong> with a name, icon, players and emergency contact. Leave the PIN blank to generate one.</li>
        <li>Each team's link signs them straight in. Send each team only its own link.</li>
        <li>A team is locked to the first phone that signs in. If they change phone, use <strong>Manage teams → Unlock device</strong>.</li>
        <li>The <strong>Live tracking</strong> table lists each team's last ping and emergency contact. A grey pin hasn't reported for 5 minutes.</li>
      </ul>`},
    {title: 'Fixing mistakes', html: `
      <table class="ba-table help-table"><thead><tr><th>Situation</th><th>What to do</th></tr></thead><tbody>
        <tr><td>Give or take money</td><td>Manage teams → change <strong>Cash balance</strong> → Save. Only the difference is applied, and it's logged.</td></tr>
        <tr><td>Wrong Buy, Rent or Just Visit</td><td>Action log → <strong>Remove</strong>. Scores are rebuilt from the remaining log.</td></tr>
        <tr><td>Rename a team or change its PIN</td><td>Manage teams → edit → Save. Their link keeps working.</td></tr>
        <tr><td>A team needs a fresh start</td><td>Manage teams → <strong>Reset this team's progress</strong>. It's logged.</td></tr>
      </tbody></table>
      <p>Always fix things through these screens so the log and scores stay in step.</p>`},
    {title: 'Ending the game', html: `
      <ul>
        <li>The board locks automatically at the end time${f.end ? ` (<strong>${esc(f.end)}</strong>)` : ''}. Fines are applied only when you press <strong>Finalise</strong>.</li>
        <li>Finalise fines each team 1.5 times the current rent for every unvisited property, then shows a podium on Leaders. It only ever runs once.</li>
        <li><strong>Re-open board</strong> refunds those fines exactly, so you can fix something and finalise again.</li>
        <li><strong>Reset all teams</strong> wipes teams and the log but keeps settings. It can't be undone.</li>
      </ul>`},
    {title: 'Scoring rules', html: `<p>See the player guide (switch above) for rent, auctions, the meetup and negative balances. Teams are ranked by net worth, which can be negative.</p>`},
    {title: 'Known limits', html: `
      <ul>
        <li>Data isn't locked down yet. Someone using browser developer tools could read PINs and sealed bids, so run games among trusted colleagues.</li>
        <li>Phones must stay awake for positions, arrivals and auctions to update.</li>
      </ul>`}
  ];
}

let helpMode = null; // 'player' | 'organiser'
function renderHelp(){
  const el = document.getElementById('help-content');
  if(!el) return;
  if(!helpMode || currentRole !== 'admin') helpMode = currentRole === 'admin' ? 'organiser' : 'player';
  const sections = helpMode === 'organiser' ? organiserGuideSections() : playerGuideSections();
  const switcher = currentRole === 'admin'
    ? `<div class="sort-row"><button data-help-mode="organiser" class="${helpMode==='organiser'?'active':''}">Organiser guide</button><button data-help-mode="player" class="${helpMode==='player'?'active':''}">Player guide</button></div>`
    : '';
  el.innerHTML = `
    ${switcher}
    <div class="card help-intro">
      <h2>${helpMode === 'organiser' ? 'Organiser guide' : 'How to play'}</h2>
      <div class="status-line">${helpMode === 'organiser' ? 'Running a game from setup to results.' : 'Everything your team needs, with this game\'s own rules filled in.'}</div>
      <div class="btn-row"><button class="btn" id="help-tour-btn">Take the tour</button></div>
    </div>
    ${sections.map(s=>`<details class="card help-section"${s.open?' open':''}><summary>${s.title}</summary><div class="help-body">${s.html}</div></details>`).join('')}`;
  el.querySelectorAll('[data-help-mode]').forEach(b=>b.addEventListener('click', ()=>{ helpMode = b.dataset.helpMode; renderHelp(); }));
  document.getElementById('help-tour-btn').addEventListener('click', ()=>{
    const home = {team:'play', admin:'admin', spectator:'leaderboard'}[currentRole];
    if(home) switchView(home);
    startTour(currentRole);
  });
}

// ================= FIRST-RUN TOUR =================
// A short spotlight tour shown the first time each role signs in on this device. Replay it from
// Help. Steps whose target isn't on screen (e.g. "You're here" before reaching a stop) fall back
// to a related element, or are skipped.
const TOURS = {
  team: [
    {title: 'Welcome to The London Run', text: ()=>`You're playing as ${currentTeam ? currentTeam.name : 'your team'}. This takes under a minute — tap Next.`},
    {sel: '#lock-banner', title: 'Waiting to start', text: 'Nothing counts until the organiser presses Start. This banner tells you when the board is locked, paused or finished.', onlyIf: ()=>isGameLocked()},
    {sel: '#here-card', fallback: '#wallet-card', title: 'You\'re here', text: 'When you reach a stop, it appears at the very top with its Buy, Pay Rent or Draw Card button. Tap once — you\'re never charged twice.'},
    {sel: '#wallet-card', title: 'Your wallet', text: 'Cash, properties owned and how much of the board you\'ve visited. The countdown shows when the game ends. Cash can go below £0 — it shows in red.'},
    {sel: '#compass-widget', title: 'Compass', text: 'Points to your nearest stop you haven\'t visited yet, with the distance. On an iPhone, tap Enable compass first.'},
    {sel: '#player-map', title: 'Your map', text: 'Every property, faded once visited. Drag to look around; Centre on me jumps back. The buttons below open walking directions to your next stop.'},
    {sel: '#stops-container', title: 'Every property', text: 'The full board by colour group, with distance, price and rent. Tap info for a fact and a photo.'},
    {sel: 'nav.tabs', title: 'Tabs', text: 'Board shows who owns what, Leaders shows the live standings, and Help has the full guide and this tour.'}
  ],
  admin: [
    {title: 'Organiser view', text: 'A quick look at where everything is. You can replay this from Help at any time.'},
    {sel: '#admin-subnav', title: 'Four areas', text: 'Teams for registration and links, Play control for running the day, Game setup for the board, cards and challenges, and the Action log for fixing mistakes.'},
    {sel: '[data-admin-tab="play"]', title: 'Play control', text: 'Start, pause and finalise the game here, watch the live team map and run the halfway meetup. Keep it open all day.'},
    {sel: '[data-admin-tab="teams"]', title: 'Teams', text: 'Register teams, send each one its own link or QR code, unlock devices and see emergency contacts.'},
    {sel: 'nav.tabs', title: 'Help is always here', text: 'The organiser guide and the player guide are both under Help.'}
  ],
  spectator: [
    {title: 'Following along', text: 'You\'re watching the game live. Standings update as teams buy, pay rent and draw cards.'},
    {sel: '#leaderboard-list', title: 'Standings', text: 'Teams are ranked by net worth: cash plus the value of the properties they own. Negative cash shows in red.'},
    {sel: 'nav.tabs', title: 'Help', text: 'Open Help to see how the game works.'}
  ]
};
let tourState = null;
function tourSeenKey(role){ return 'lr_tour_seen_' + role; }
function maybeStartTour(role){
  let seen = false;
  try{ seen = localStorage.getItem(tourSeenKey(role)) === '1'; }catch(e){}
  if(!seen) setTimeout(()=>{ if(currentRole === role && !bigScreenOn) startTour(role); }, 900);
}
function startTour(role){
  endTour(false);
  const steps = TOURS[role] || [];
  if(!steps.length) return;
  const back = document.createElement('div'); back.className = 'tour-backdrop';
  const spot = document.createElement('div'); spot.className = 'tour-spot';
  const pop = document.createElement('div'); pop.className = 'tour-pop';
  pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true'); pop.setAttribute('aria-labelledby', 'tour-title');
  document.body.append(back, spot, pop);
  tourState = {role, steps, i: -1, back, spot, pop, target: null};
  window.addEventListener('resize', positionTour);
  window.addEventListener('scroll', positionTour, true);
  document.addEventListener('keydown', tourKeys);
  goTourStep(0, 1);
}
function endTour(markSeen){
  if(!tourState) return;
  const {role, back, spot, pop} = tourState;
  [back, spot, pop].forEach(n=>n.remove());
  window.removeEventListener('resize', positionTour);
  window.removeEventListener('scroll', positionTour, true);
  document.removeEventListener('keydown', tourKeys);
  if(markSeen){ try{ localStorage.setItem(tourSeenKey(role), '1'); }catch(e){} }
  tourState = null;
}
function tourKeys(e){
  if(!tourState) return;
  if(e.key === 'Escape') endTour(true);
  else if(e.key === 'ArrowRight') goTourStep(tourState.i + 1, 1);
  else if(e.key === 'ArrowLeft') goTourStep(tourState.i - 1, -1);
}
function visibleEl(sel){
  if(!sel) return null;
  const el = document.querySelector(sel);
  if(!el) return null;
  const r = el.getBoundingClientRect();
  return (r.width > 0 && r.height > 0) ? el : null;
}
function goTourStep(i, dir){
  if(!tourState) return;
  const {steps} = tourState;
  while(i >= 0 && i < steps.length){
    const s = steps[i];
    const ok = (!s.onlyIf || s.onlyIf()) && (!s.sel || visibleEl(s.sel) || visibleEl(s.fallback));
    if(ok) break;
    i += dir;
  }
  if(i >= steps.length){ endTour(true); return; }
  if(i < 0) i = 0;
  const s = steps[i];
  tourState.i = i;
  tourState.target = s.sel ? (visibleEl(s.sel) || visibleEl(s.fallback)) : null;
  const visibleCount = steps.filter(x=>(!x.onlyIf || x.onlyIf()) && (!x.sel || visibleEl(x.sel) || visibleEl(x.fallback))).length;
  const pos = steps.slice(0, i + 1).filter(x=>(!x.onlyIf || x.onlyIf()) && (!x.sel || visibleEl(x.sel) || visibleEl(x.fallback))).length;
  const pop = tourState.pop;
  pop.innerHTML = `
    <div class="tour-count"></div>
    <div class="tour-title" id="tour-title"></div>
    <div class="tour-text"></div>
    <div class="tour-btns">
      <button class="tour-skip" type="button">Skip tour</button>
      <span style="flex:1"></span>
      ${i > 0 ? '<button class="btn secondary tour-back" type="button">Back</button>' : ''}
      <button class="btn tour-next" type="button">${pos >= visibleCount ? 'Done' : 'Next'}</button>
    </div>`;
  pop.querySelector('.tour-count').textContent = pos + ' of ' + visibleCount;
  pop.querySelector('.tour-title').textContent = s.title;
  pop.querySelector('.tour-text').textContent = typeof s.text === 'function' ? s.text() : s.text;
  pop.querySelector('.tour-skip').addEventListener('click', ()=>endTour(true));
  pop.querySelector('.tour-next').addEventListener('click', ()=>goTourStep(i + 1, 1));
  const b = pop.querySelector('.tour-back'); if(b) b.addEventListener('click', ()=>goTourStep(i - 1, -1));
  const t = tourState.target;
  if(t && getComputedStyle(t).position !== 'fixed'){
    const tall = t.getBoundingClientRect().height > window.innerHeight * 0.5;
    t.scrollIntoView({block: tall ? 'start' : 'center', behavior: 'auto'});
    if(tall) window.scrollBy(0, -70);
  }
  requestAnimationFrame(positionTour);
  pop.querySelector('.tour-next').focus();
}
function positionTour(){
  if(!tourState) return;
  const {spot, pop, target} = tourState;
  const vw = window.innerWidth, vh = window.innerHeight, m = 12;
  const pw = Math.min(360, vw - 32);
  pop.style.width = pw + 'px';
  if(!target){
    spot.style.display = 'none';
    tourState.back.classList.add('dim');
    pop.style.left = ((vw - pw) / 2) + 'px';
    pop.style.top = Math.max(16, (vh - pop.offsetHeight) / 2) + 'px';
    return;
  }
  tourState.back.classList.remove('dim');
  const r = target.getBoundingClientRect(), pad = 6;
  const top = Math.max(4, r.top - pad), bottom = Math.min(vh - 4, r.bottom + pad);
  const left = Math.max(4, r.left - pad), right = Math.min(vw - 4, r.right + pad);
  Object.assign(spot.style, {display: 'block', top: top + 'px', left: left + 'px', width: (right - left) + 'px', height: Math.max(0, bottom - top) + 'px'});
  const ph = pop.offsetHeight;
  let py;
  if(vh - bottom >= ph + m) py = bottom + m;
  else if(top >= ph + m) py = top - ph - m;
  else py = Math.max(16, vh - ph - 16);
  const px = Math.min(Math.max(16, (left + right) / 2 - pw / 2), vw - pw - 16);
  pop.style.left = px + 'px';
  pop.style.top = py + 'px';
}
