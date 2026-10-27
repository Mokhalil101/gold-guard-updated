/* Gold Guard dashboard prototype. All records below are demo-only until connected to the backend. */
'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const pad = n => String(n).padStart(2, '0');
const nowDate = () => new Date();
const timeOf = date => `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
const ago = minutes => { const d = new Date(Date.now() - minutes * 60000); return d.toISOString(); };
const displayTime = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? String(value || '—') : d.toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); };
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
const uid = prefix => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const IDENTIFICATION = {
  MATCHED: ['Matched', 'ok'], CANDIDATE: ['Candidate', 'in'], UNKNOWN: ['Unknown', 'purple'],
  AMBIGUOUS: ['Ambiguous', 'wa'], FAILED: ['Failed', 'cr']
};
const PRODUCT_STATES = {
  ACTIVE: ['Active inventory', 'ok'], PENDING: ['Pending registration', 'wa'],
  SOLD: ['Sold', 'nu'], RETIRED: ['Retired', 'nu'], ARCHIVED: ['Archived', 'nu']
};
const ALERT_STATES = ['New', 'Acknowledged', 'Under Review', 'Resolved', 'False Alarm'];
const SEVERITIES = ['critical', 'warning', 'info'];
const TYPES = ['Ring', 'Necklace', 'Bracelet', 'Earrings', 'Pendant', 'Watch'];
const ZONES = [
  { name:'Showcase A', cameraId:'CAM-01', x:[8,39], y:[24,60], kind:'disp' },
  { name:'Showcase B', cameraId:'CAM-02', x:[58,88], y:[24,60], kind:'disp' },
  { name:'Customer Area', cameraId:'CAM-03', x:[31,67], y:[66,88], kind:'' },
  { name:'Exit Zone', cameraId:'CAM-04', x:[79,94], y:[70,90], kind:'exit' }
];
const randIn = range => range[0] + Math.random() * (range[1] - range[0]);

const cameras = [
  { id:'CAM-01', name:'Showcase Camera A', location:'Display Area A', status:'online', fps:13, resolution:'1920 × 1080', lastSeen:ago(0), source:'Demo stream' },
  { id:'CAM-02', name:'Showcase Camera B', location:'Display Area B', status:'online', fps:12, resolution:'1920 × 1080', lastSeen:ago(0), source:'Demo stream' },
  { id:'CAM-03', name:'Interaction Camera', location:'Customer Interaction Area', status:'online', fps:12, resolution:'1280 × 720', lastSeen:ago(0), source:'Demo stream' },
  { id:'CAM-04', name:'Exit Camera', location:'Exit', status:'online', fps:14, resolution:'1920 × 1080', lastSeen:ago(0), source:'Demo stream' },
  { id:'CAM-05', name:'Overhead Camera', location:'Central / Overhead', status:'online', fps:11, resolution:'1280 × 720', lastSeen:ago(0), source:'Demo stream' },
  { id:'CAM-06', name:'Backup Camera', location:'Backup / Blind-spot', status:'warning', fps:8, resolution:'1280 × 720', lastSeen:ago(3), source:'Demo stream' }
];
const products = [];
for (let i = 0; i < 24; i++) {
  const zone = ZONES[i % 2];
  products.push({
    id:`GG-${1001 + i}`, type:TYPES[i % TYPES.length], description:`${TYPES[i % TYPES.length]} · inventory sample ${i + 1}`,
    status:'ACTIVE', identification:i % 11 === 0 ? 'AMBIGUOUS' : 'MATCHED', matchScore:i % 11 === 0 ? null : Number((0.82 + Math.random() * 0.15).toFixed(2)),
    candidateIds:i % 11 === 0 ? [`GG-${1001+i}`, `GG-${1002+i}`] : [], referenceImages:[], zone:zone.name, cameraId:zone.cameraId,
    lastSeen:ago(i % 20), visibleFeatures:['metallic finish', i % 2 ? 'fine detail' : 'curved profile'], createdAt:ago(60 + i * 7)
  });
}
products.push({ id:'GG-1042', type:'Bracelet', description:'Gold bracelet · sample with unresolved identity', status:'ACTIVE', identification:'UNKNOWN', matchScore:null, candidateIds:[], referenceImages:[], zone:'Showcase B', cameraId:'CAM-03', lastSeen:ago(5), visibleFeatures:['chain pattern'], createdAt:ago(240) });
products[1].zone = 'Customer Area'; products[1].cameraId = 'CAM-03';
products[4].zone = 'Exit Zone'; products[4].cameraId = 'CAM-04'; products[4].identification = 'CANDIDATE'; products[4].matchScore = 0.61;
products[8].status = 'SOLD';

const tracks = [
  { id:'TRK-C01-0084', cameraId:'CAM-01', productId:'GG-1001', identification:'MATCHED', startedAt:ago(4), lastSeen:ago(0), confidence:0.94, x:22, y:41, zone:'Showcase A' },
  { id:'TRK-C03-0017', cameraId:'CAM-03', productId:'GG-1002', identification:'MATCHED', startedAt:ago(3), lastSeen:ago(1), confidence:0.89, x:48, y:74, zone:'Customer Area' },
  { id:'TRK-C04-0031', cameraId:'CAM-04', productId:'GG-1005', identification:'CANDIDATE', startedAt:ago(2), lastSeen:ago(0), confidence:0.61, x:86, y:80, zone:'Exit Zone' },
  { id:'TRK-C02-0062', cameraId:'CAM-02', productId:null, identification:'UNKNOWN', startedAt:ago(6), lastSeen:ago(5), confidence:0.77, x:73, y:42, zone:'Showcase B' },
  { id:'TRK-C02-0063', cameraId:'CAM-02', productId:null, identification:'AMBIGUOUS', startedAt:ago(7), lastSeen:ago(2), confidence:null, x:65, y:50, zone:'Showcase B', candidateIds:['GG-1011','GG-1012'] }
];
const observations = [
  { id:'OBS-2401', type:'Detection', cameraId:'CAM-01', productId:'GG-1001', trackId:'TRK-C01-0084', identification:'MATCHED', confidence:0.94, time:ago(1), zone:'Showcase A', details:'Registered product candidate observed in the showcase region.' },
  { id:'OBS-2402', type:'Movement', cameraId:'CAM-03', productId:'GG-1002', trackId:'TRK-C03-0017', identification:'MATCHED', confidence:0.89, time:ago(2), zone:'Customer Area', details:'A tracked observation appeared in the customer interaction region.' },
  { id:'OBS-2403', type:'Identification', cameraId:'CAM-02', productId:null, trackId:'TRK-C02-0063', identification:'AMBIGUOUS', confidence:null, time:ago(3), zone:'Showcase B', details:'Multiple visually similar products remain plausible candidates.' },
  { id:'OBS-2404', type:'Tracking', cameraId:'CAM-03', productId:'GG-1042', trackId:null, identification:'UNKNOWN', confidence:null, time:ago(5), zone:'Showcase B', details:'An observation could not be confidently linked to a registered product.' },
  { id:'OBS-2405', type:'Camera', cameraId:'CAM-06', productId:null, trackId:null, identification:'FAILED', confidence:null, time:ago(8), zone:'Backup / Blind-spot', details:'Camera is operating below the configured demo frame-rate threshold.' }
];
const transactions = [
  { id:'TX-2001', productId:'GG-1009', type:'Sale', status:'Recorded', time:ago(25), actor:'Demo Manager', notes:'Sample transaction record.' },
  { id:'TX-2002', productId:'GG-1013', type:'Authorized handover', status:'Recorded', time:ago(40), actor:'Demo Manager', notes:'Sample handover record.' }
];
let alerts = [
  { id:'ALT-3101', severity:'critical', title:'Candidate observation near exit zone needs review', productId:'GG-1005', trackId:'TRK-C04-0031', cameraId:'CAM-04', zone:'Exit Zone', time:ago(2), riskScore:70, status:'New', identity:'CANDIDATE', reason:['Observation in configured exit zone','Identity is not confirmed'], transaction:'No matching demo transaction found', evidence:'Simulated evidence panel only; no real frame or recording is connected.', notes:'', reviewedBy:'', reviewedAt:null },
  { id:'ALT-3102', severity:'warning', title:'Product observation is outside the expected view', productId:'GG-1042', trackId:null, cameraId:'CAM-03', zone:'Showcase B', time:ago(5), riskScore:20, status:'New', identity:'UNKNOWN', reason:['Identity could not be established','Observation history requires review'], transaction:'Not checked in demo mode', evidence:'No real image evidence is available in demo mode.', notes:'', reviewedBy:'', reviewedAt:null },
  { id:'ALT-3103', severity:'warning', title:'Camera 06 is processing at a reduced frame rate', productId:null, trackId:null, cameraId:'CAM-06', zone:'Backup / Blind-spot', time:ago(10), riskScore:null, status:'Acknowledged', identity:'FAILED', reason:['Demo frame rate is below 10 FPS'], transaction:'Not applicable', evidence:'Synthetic camera-health event.', notes:'Check stream configuration when connected.', reviewedBy:'Demo Manager', reviewedAt:ago(8) },
  { id:'ALT-3104', severity:'info', title:'Sample sale record available for correlation', productId:'GG-1009', trackId:null, cameraId:'CAM-03', zone:'Customer Area', time:ago(25), riskScore:null, status:'Resolved', identity:'MATCHED', reason:['A sample transaction record exists'], transaction:'TX-2001', evidence:'No real image evidence is available in demo mode.', notes:'Demo review completed.', reviewedBy:'Demo Manager', reviewedAt:ago(20) }
];
let auditLogs = [
  { id:'AUD-5001', action:'DEMO_INITIALIZED', entityType:'System', entityId:'Gold Guard demo', actor:'System', time:ago(60), details:'Synthetic records loaded in browser memory.' }
];
let notifications = alerts.filter(a => a.status === 'New').map(a => ({ id:a.id, text:a.title, severity:a.severity, read:false, time:a.time }));
let page = 'dashboard';
let charts = [];
let sortKey = 'id';
let sortDirection = 1;
let filters = { q:'', productStatus:'', identification:'', type:'', alertStatus:'', severity:'', camera:'', eventType:'', eventProduct:'', eventDateFrom:'', eventDateTo:'' };
let currentRole = 'Shop Manager';
const roles = ['Administrator', 'Shop Manager', 'Authorized Employee', 'Technical Maintainer'];
const permissions = {
  Administrator:['dashboard','live','map','products','enrollment','alerts','events','cameras','transactions','reports','audit','settings','users'],
  'Shop Manager':['dashboard','live','map','products','enrollment','alerts','events','cameras','transactions','reports'],
  'Authorized Employee':['dashboard','live','products','enrollment','alerts','events','transactions'],
  'Technical Maintainer':['dashboard','live','cameras','events','health','settings']
};
const PAGES = [
  ['dashboard','◧','Dashboard','Overview'], ['live','◉','Live Monitoring','Camera views and simulated detections'], ['map','⌖','Store Map','Regions and current observations'],
  ['products','◇','Inventory','Registered jewelry and identity states'], ['enrollment','＋','Product Enrollment','Review and register jewelry reference images'],
  ['alerts','⚑','Alerts','Explainable alerts and human review'], ['events','≡','Event History','Observations, tracks and event context'],
  ['cameras','▣','Cameras','Camera configuration and health'], ['transactions','↔','Sales & Handovers','Recorded transaction context'],
  ['reports','▤','Reports','Demo summaries and CSV export'], ['audit','◷','Audit Log','Traceable demo actions'], ['health','⌁','System Health','Services and operational diagnostics'],
  ['settings','⚙','Settings','Monitoring preferences and role demo'], ['users','♙','Users & Roles','Demo user and role overview']
];
const activeAlerts = () => alerts.filter(a => !['Resolved','False Alarm'].includes(a.status));
const canSee = key => (permissions[currentRole] || []).includes(key);
const pill = (label, cls='nu') => `<span class="pill ${cls}"><i></i>${escapeHTML(label)}</span>`;
const identificationPill = status => { const s = IDENTIFICATION[status] || ['Unknown','nu']; return pill(s[0],s[1]); };
const productStatusPill = status => { const s = PRODUCT_STATES[status] || ['Unknown','nu']; return pill(s[0],s[1]); };
const severityPill = severity => pill(severity === 'critical' ? 'Critical' : severity === 'warning' ? 'Warning' : 'Info', severity === 'critical' ? 'cr' : severity === 'warning' ? 'wa' : 'in');
const alertStatusPill = status => pill(status, status === 'New' ? 'cr' : status === 'Acknowledged' ? 'wa' : status === 'Under Review' ? 'in' : status === 'Resolved' ? 'ok' : 'nu');
const cameraStatusPill = status => pill(status === 'online' ? 'Connected' : status === 'warning' ? 'Degraded' : status === 'offline' ? 'Disconnected' : 'Error', status === 'online' ? 'ok' : status === 'warning' ? 'wa' : 'cr');
const productById = id => products.find(p => p.id === id);
const cameraById = id => cameras.find(c => c.id === id);
const audit = (action, entityType, entityId, details='') => auditLogs.unshift({ id:uid('AUD'), action, entityType, entityId, actor:currentRole, time:new Date().toISOString(), details });
function toast(message) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = message; $('#toastRegion').appendChild(el); window.setTimeout(() => el.remove(), 2800); }
function go(nextPage) {
  if (!PAGES.some(p => p[0] === nextPage)) nextPage = 'dashboard';
  if (!canSee(nextPage)) { toast('This demo role does not have access to that section.'); return; }
  page = nextPage; location.hash = nextPage; $('#sidebar').classList.remove('open'); $('#shade').classList.remove('on'); draw();
}
function toggleMenu() { $('#sidebar').classList.toggle('open'); $('#shade').classList.toggle('on'); }
function openModal(content) { $('#modalBox').innerHTML = content; $('#modal').classList.add('show'); $('#modal').setAttribute('aria-hidden','false'); const first = $('button,input,select,textarea,[tabindex="0"]', $('#modalBox')); if (first) first.focus(); }
function closeModal() { $('#modal').classList.remove('show'); $('#modal').setAttribute('aria-hidden','true'); }
function renderChrome() {
  const nav = $('#nav');
  nav.innerHTML = PAGES.filter(p => canSee(p[0])).map(p => `<button class="nav-i ${page === p[0] ? 'on' : ''}" data-page="${p[0]}" type="button"><span class="nav-icon" aria-hidden="true">${p[1]}</span><span>${p[2]}</span>${p[0] === 'alerts' && activeAlerts().length ? `<b class="nav-count">${activeAlerts().length}</b>` : ''}</button>`).join('');
  const current = PAGES.find(p => p[0] === page) || PAGES[0];
  $('#title').textContent = current[2]; $('#subtitle').textContent = current[3];
  const critical = activeAlerts().some(a => a.severity === 'critical');
  const degraded = cameras.some(c => c.status !== 'online');
  $('#sys').className = `pill ${critical ? 'cr' : degraded ? 'wa' : 'ok'}`;
  $('#sys span').textContent = critical ? 'Review required' : degraded ? 'Health warning' : 'Demo data';
  const unread = notifications.filter(n => !n.read).length; $('#ncount').textContent = unread || ''; $('#ncount').hidden = !unread;
  renderNotifications();
}
function draw() {
  charts.forEach(chart => chart.destroy()); charts = [];
  renderChrome();
  const renderer = V[page] || V.dashboard;
  $('#view').innerHTML = renderer();
  if (AFTER[page]) AFTER[page]();
  $('#view').focus({ preventScroll:true }); window.scrollTo({ top:0, behavior:'instant' });
}
function emptyState(title, description='Try changing the filters or adding a record in demo mode.') { return `<div class="empty"><strong>${escapeHTML(title)}</strong>${escapeHTML(description)}</div>`; }
function eventRow(event) {
  const dot = event.identification === 'FAILED' ? 'cr' : event.identification === 'UNKNOWN' || event.identification === 'AMBIGUOUS' ? 'wa' : 'in';
  return `<div class="ev"><time>${escapeHTML(timeOf(new Date(event.time)))}</time><i class="sd s-${dot}"></i><div style="flex:1;min-width:0"><strong>${escapeHTML(event.type)}</strong> · ${escapeHTML(event.details)}<br><small class="muted">${escapeHTML(event.cameraId || 'System')}${event.productId ? ` · ${escapeHTML(event.productId)}` : ''}${event.trackId ? ` · ${escapeHTML(event.trackId)}` : ''}</small></div>${identificationPill(event.identification || 'FAILED')}</div>`;
}
function productRow(product) {
  return `<tr class="c" data-product="${escapeHTML(product.id)}"><td data-label="Product"><span class="table-title">${escapeHTML(product.id)}</span><span class="table-sub">${escapeHTML(product.description)}</span></td><td data-label="Type">${escapeHTML(product.type)}</td><td data-label="Inventory status">${productStatusPill(product.status)}</td><td data-label="Identification">${identificationPill(product.identification)}</td><td data-label="Last camera">${escapeHTML(product.cameraId || '—')}</td><td data-label="Last observed">${escapeHTML(displayTime(product.lastSeen))}</td></tr>`;
}
function alertCard(alert) {
  const isClosed = ['Resolved','False Alarm'].includes(alert.status);
  const product = productById(alert.productId);
  return `<article class="alert ${escapeHTML(alert.severity)} ${isClosed ? 'done' : ''}"><div class="alert-head">${severityPill(alert.severity)}<strong>${escapeHTML(alert.title)}</strong>${alertStatusPill(alert.status)}</div><div class="meta"><span>${escapeHTML(alert.id)}</span><span>${escapeHTML(alert.cameraId || 'System')}</span><span>${escapeHTML(alert.zone || '—')}</span><span>${escapeHTML(displayTime(alert.time))}</span>${product ? `<span>${escapeHTML(product.id)}</span>` : ''}${alert.riskScore !== null ? `<span>Rule score: ${escapeHTML(alert.riskScore)} / 100</span>` : ''}</div><div class="act"><button class="btn s p" data-alert-view="${escapeHTML(alert.id)}">Review details</button>${alert.status === 'New' ? `<button class="btn s" data-alert-action="${escapeHTML(alert.id)}" data-status="Acknowledged">Acknowledge</button>` : ''}${!isClosed ? `<button class="btn s" data-alert-action="${escapeHTML(alert.id)}" data-status="Under Review">Start review</button>` : ''}</div></article>`;
}
function feedHTML(camera) {
  if (camera.status === 'offline' || camera.status === 'error') return `<div class="feed off"><div class="offmsg">${camera.status === 'offline' ? 'Camera disconnected' : 'Camera processing error'}<br><small>Demo status · no live stream connected</small></div></div>`;
  const seenTracks = tracks.filter(t => t.cameraId === camera.id).slice(0,3);
  const boxes = seenTracks.map(track => {
    const className = track.identification === 'UNKNOWN' ? 'unknown' : track.identification === 'AMBIGUOUS' ? 'ambiguous' : '';
    const label = track.productId && track.identification === 'MATCHED' ? track.productId : track.identification[0] + track.identification.slice(1).toLowerCase();
    return `<span class="bbox ${className}" style="left:${Math.max(6,track.x-7)}%;top:${Math.max(10,track.y-12)}%;width:18%;height:26%"><span class="box-label">${escapeHTML(label)}</span></span>`;
  }).join('');
  return `<div class="feed"><span class="ov">${escapeHTML(camera.id)} · ${escapeHTML(camera.location)}</span><span class="rec"></span>${boxes}<span class="ts">DEMO · ${escapeHTML(timeOf(nowDate()))}</span></div>`;
}
function cameraCard(camera) {
  const detections = tracks.filter(t => t.cameraId === camera.id).length;
  return `<div class="card cam-card" data-camera="${escapeHTML(camera.id)}">${feedHTML(camera)}<div class="cam-info"><b>${escapeHTML(camera.id)}</b>${cameraStatusPill(camera.status)}</div><div class="cam-info"><small>${escapeHTML(camera.fps)} demo FPS · ${detections} sample tracks</small><small>${escapeHTML(camera.location)}</small></div></div>`;
}
function productDetailsModal(id) {
  const product = productById(id); if (!product) return;
  const relatedAlerts = alerts.filter(a => a.productId === id);
  const relatedObservations = observations.filter(o => o.productId === id);
  const relatedTransactions = transactions.filter(t => t.productId === id);
  openModal(`<div class="mh"><div><h2 id="modalTitle">${escapeHTML(product.type)} · ${escapeHTML(product.id)}</h2><p>Product record · demo data only</p></div><button class="x" data-close aria-label="Close">×</button></div><div class="kv"><div><small>Product ID</small><strong>${escapeHTML(product.id)}</strong></div><div><small>Inventory status</small>${productStatusPill(product.status)}</div><div><small>Identification state</small>${identificationPill(product.identification)}</div><div><small>Similarity score</small>${product.matchScore === null ? 'Not available' : escapeHTML(product.matchScore)} <small>Not a probability of correctness</small></div><div><small>Last observed camera</small>${escapeHTML(product.cameraId || '—')}</div><div><small>Last observed region</small>${escapeHTML(product.zone || '—')}</div><div><small>Last observed</small>${escapeHTML(displayTime(product.lastSeen))}</div><div><small>Reference images</small>${product.referenceImages.length} demo-uploaded image(s)</div></div><div class="notice">A matched candidate is a model result, not a guarantee of identity. Unknown and Ambiguous states are retained when evidence is insufficient.</div><h3>Visible features</h3><p class="sub">${escapeHTML(product.visibleFeatures.join(', ') || 'No verified features recorded.')}</p>${product.candidateIds?.length ? `<h3>Possible candidates</h3><p class="sub">${product.candidateIds.map(escapeHTML).join(' · ')}</p>` : ''}<h3>Observation history</h3>${relatedObservations.length ? `<div class="tl">${relatedObservations.map(o => `<div class="it"><b>${escapeHTML(o.type)} · ${escapeHTML(o.cameraId)}</b><br><small>${escapeHTML(displayTime(o.time))} · ${escapeHTML(o.details)}</small></div>`).join('')}</div>` : emptyState('No observation records','No demo observation is linked to this product.') }<h3 style="margin-top:12px">Sales and handovers</h3>${relatedTransactions.length ? relatedTransactions.map(t => `<div class="ev"><div style="flex:1"><b>${escapeHTML(t.type)} · ${escapeHTML(t.id)}</b><br><small class="muted">${escapeHTML(displayTime(t.time))} · ${escapeHTML(t.actor)}</small></div>${pill(t.status,'ok')}</div>`).join('') : '<p class="sub">No related transaction record in demo data.</p>'}<h3>Related alerts</h3>${relatedAlerts.length ? relatedAlerts.map(alertCard).join('') : emptyState('No related alerts') }<div class="form-actions"><button class="btn" data-edit-product="${escapeHTML(product.id)}">Edit metadata</button><button class="btn p" data-close>Close</button></div>`);
}
function alertDetailsModal(id) {
  const alert = alerts.find(a => a.id === id); if (!alert) return;
  const product = productById(alert.productId);
  openModal(`<div class="mh"><div><h2 id="modalTitle">${escapeHTML(alert.title)}</h2><p>${escapeHTML(alert.id)} · ${escapeHTML(displayTime(alert.time))}</p></div><button class="x" data-close aria-label="Close">×</button></div><div class="kv"><div><small>Severity</small>${severityPill(alert.severity)}</div><div><small>Current status</small>${alertStatusPill(alert.status)}</div><div><small>Camera / region</small>${escapeHTML(alert.cameraId || 'System')} · ${escapeHTML(alert.zone || '—')}</div><div><small>Risk rule score</small>${alert.riskScore === null ? 'Not calculated' : `${escapeHTML(alert.riskScore)} / 100`}<small>Not a probability of theft</small></div><div><small>Product candidate</small>${product ? `<button class="btn s" data-product="${escapeHTML(product.id)}">${escapeHTML(product.id)}</button>` : 'No confirmed product'}</div><div><small>Identification state</small>${identificationPill(alert.identity)}</div><div><small>Transaction context</small>${escapeHTML(alert.transaction || 'Not available')}</div><div><small>Reviewer</small>${escapeHTML(alert.reviewedBy || 'Not reviewed')}</div></div><h3>Why this alert was raised</h3><ul>${alert.reason.map(reason => `<li>${escapeHTML(reason)}</li>`).join('')}</ul><h3 style="margin-top:14px">Evidence</h3><div class="feed off" style="margin-bottom:8px"><div class="offmsg">Evidence preview unavailable<br><small>No real camera footage is connected in this demo.</small></div></div><p class="sub">${escapeHTML(alert.evidence)}</p><h3>Review outcome and notes</h3><div class="field"><label for="reviewNotes">Reviewer notes</label><textarea id="reviewNotes" rows="3" placeholder="Add context, observations, or reason for the review…">${escapeHTML(alert.notes || '')}</textarea></div><div class="form-actions">${alert.status === 'New' ? `<button class="btn" data-alert-action="${escapeHTML(alert.id)}" data-status="Acknowledged">Acknowledge</button>` : ''}${!['Resolved','False Alarm'].includes(alert.status) ? `<button class="btn" data-alert-action="${escapeHTML(alert.id)}" data-status="Under Review">Under review</button><button class="btn p" data-alert-resolve="${escapeHTML(alert.id)}" data-status="Resolved">Resolve alert</button><button class="btn danger" data-alert-resolve="${escapeHTML(alert.id)}" data-status="False Alarm">Mark false alarm</button>` : ''}<button class="btn" data-save-notes="${escapeHTML(alert.id)}">Save notes</button></div><p class="sub" style="margin-top:12px">An alert is a request for human review, not proof of theft. Original observations are not changed by the review outcome.</p>`);
}
function cameraDetailsModal(id) {
  const camera = cameraById(id); if (!camera) return;
  openModal(`<div class="mh"><div><h2 id="modalTitle">${escapeHTML(camera.name)}</h2><p>${escapeHTML(camera.id)} · ${escapeHTML(camera.location)}</p></div><button class="x" data-close aria-label="Close">×</button></div>${feedHTML(camera)}<div class="kv" style="margin-top:14px"><div><small>Status</small>${cameraStatusPill(camera.status)}</div><div><small>Demo processing rate</small>${escapeHTML(camera.fps)} FPS</div><div><small>Resolution</small>${escapeHTML(camera.resolution)}</div><div><small>Source</small>${escapeHTML(camera.source)}</div><div><small>Last seen</small>${escapeHTML(displayTime(camera.lastSeen))}</div><div><small>Associated sample tracks</small>${tracks.filter(t => t.cameraId === camera.id).length}</div></div><div class="notice">This panel displays simulated health information. It does not connect to, control, or verify a physical camera.</div><div class="form-actions"><button class="btn" data-close>Close</button>${canSee('settings') ? `<button class="btn p" data-camera-edit="${escapeHTML(camera.id)}">Edit camera metadata</button>` : ''}</div>`);
}
function productFormModal(product = null) {
  const isEdit = Boolean(product);
  openModal(`<div class="mh"><div><h2 id="modalTitle">${isEdit ? 'Edit product metadata' : 'Register jewelry product'}</h2><p>${isEdit ? 'Update the demo inventory record.' : 'Create a product record; identity confirmation remains a human action.'}</p></div><button class="x" data-close aria-label="Close">×</button></div><form id="productForm" data-product-id="${isEdit ? escapeHTML(product.id) : ''}"><div class="form-grid"><div class="field"><label for="productId">Product ID *</label><input id="productId" name="productId" required maxlength="40" value="${isEdit ? escapeHTML(product.id) : ''}" ${isEdit ? 'readonly' : ''} placeholder="e.g. GG-1050"></div><div class="field"><label for="productType">Jewelry type *</label><select id="productType" name="productType" required>${TYPES.map(t => `<option ${product?.type === t ? 'selected' : ''}>${escapeHTML(t)}</option>`).join('')}</select></div><div class="field wide"><label for="productDescription">Description</label><input id="productDescription" name="description" maxlength="180" value="${isEdit ? escapeHTML(product.description) : ''}" placeholder="Material, shape, visible details"></div><div class="field"><label for="productState">Inventory state</label><select id="productState" name="status">${Object.entries(PRODUCT_STATES).map(([key,val]) => `<option value="${key}" ${(product?.status || 'ACTIVE') === key ? 'selected' : ''}>${escapeHTML(val[0])}</option>`).join('')}</select></div><div class="field"><label for="productIdentification">Identification review state</label><select id="productIdentification" name="identification">${Object.entries(IDENTIFICATION).map(([key,val]) => `<option value="${key}" ${(product?.identification || 'UNKNOWN') === key ? 'selected' : ''}>${escapeHTML(val[0])}</option>`).join('')}</select><small>Demo reviewer selection only; no AI matching is performed.</small></div><div class="field wide"><label for="productFeatures">Visible features</label><textarea id="productFeatures" name="features" rows="2" placeholder="Distinctive appearance notes">${isEdit ? escapeHTML(product.visibleFeatures.join(', ')) : ''}</textarea></div><div class="field wide"><label for="referenceImages">Reference images (multiple allowed)</label><input id="referenceImages" name="images" type="file" accept="image/*" multiple><small>Selected images are kept only in browser memory for this demo. They are not uploaded to a server or used to create visual embeddings.</small><div id="imagePreview" class="thumbs"></div></div></div><div class="form-actions"><button class="btn" type="button" data-close>Cancel</button><button class="btn p" type="submit">${isEdit ? 'Save demo changes' : 'Confirm demo registration'}</button></div></form>`);
  $('#referenceImages').addEventListener('change', previewSelectedImages);
  $('#productForm').addEventListener('submit', saveProductForm);
}
function previewSelectedImages(event) {
  const files = [...event.target.files];
  if (files.some(file => !file.type.startsWith('image/'))) { toast('Please choose image files only.'); event.target.value = ''; return; }
  if (files.some(file => file.size > 8 * 1024 * 1024)) { toast('Each demo image must be 8 MB or smaller.'); event.target.value = ''; return; }
  $('#imagePreview').innerHTML = files.map(file => `<span class="hint">${escapeHTML(file.name)}</span>`).join('');
}
function saveProductForm(event) {
  event.preventDefault();
  const form = event.currentTarget; const data = new FormData(form); const id = String(data.get('productId') || '').trim().toUpperCase();
  const isEdit = Boolean(form.dataset.productId); const existing = productById(form.dataset.productId || id);
  if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(id)) { toast('Use a valid product ID with letters, numbers, hyphens or underscores.'); return; }
  if (!isEdit && productById(id)) { toast('That product ID already exists. Choose a unique ID.'); return; }
  const files = [...($('#referenceImages')?.files || [])];
  const next = {
    id, type:String(data.get('productType')), description:String(data.get('description') || '').trim() || `${data.get('productType')} · no description`,
    status:String(data.get('status')), identification:String(data.get('identification')), visibleFeatures:String(data.get('features') || '').split(',').map(s => s.trim()).filter(Boolean),
    referenceImages:[...(existing?.referenceImages || []), ...files.map(f => ({ name:f.name, size:f.size, type:f.type }))]
  };
  if (existing) Object.assign(existing, next, { updatedAt:new Date().toISOString() });
  else products.unshift({ ...next, matchScore:null, candidateIds:[], zone:'Not yet observed', cameraId:null, lastSeen:null, createdAt:new Date().toISOString() });
  audit(isEdit ? 'PRODUCT_UPDATED_DEMO' : 'PRODUCT_REGISTERED_DEMO','Product',id,`${files.length} reference image(s) selected in browser demo.`);
  toast(isEdit ? 'Product updated in demo memory.' : 'Product registered in demo memory.'); closeModal(); draw();
}
function transactionFormModal() {
  openModal(`<div class="mh"><div><h2 id="modalTitle">Record sale or authorized handover</h2><p>Demo record for event context; this will not update an external inventory system.</p></div><button class="x" data-close aria-label="Close">×</button></div><form id="transactionForm"><div class="form-grid"><div class="field"><label for="txProduct">Product *</label><select id="txProduct" name="productId" required><option value="">Choose a registered product</option>${products.map(p => `<option value="${escapeHTML(p.id)}">${escapeHTML(p.id)} · ${escapeHTML(p.type)}</option>`).join('')}</select></div><div class="field"><label for="txType">Record type *</label><select id="txType" name="type" required><option>Sale</option><option>Authorized handover</option></select></div><div class="field wide"><label for="txNotes">Notes</label><textarea id="txNotes" name="notes" rows="3" placeholder="Optional transaction context"></textarea></div></div><div class="form-actions"><button class="btn" type="button" data-close>Cancel</button><button class="btn p" type="submit">Save demo record</button></div></form>`);
  $('#transactionForm').addEventListener('submit', event => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const productId = String(data.get('productId') || '');
    if (!productById(productId)) { toast('Select an existing product.'); return; }
    const tx = { id:uid('TX'), productId, type:String(data.get('type')), status:'Recorded', time:new Date().toISOString(), actor:currentRole, notes:String(data.get('notes') || '').trim() };
    transactions.unshift(tx); audit('TRANSACTION_RECORDED_DEMO','Transaction',tx.id,`${tx.type} for ${productId}.`); toast('Transaction added to demo memory.'); closeModal(); draw();
  });
}
function cameraEditModal(id = null) {
  const camera = id ? cameraById(id) : null;
  openModal(`<div class="mh"><div><h2 id="modalTitle">${camera ? 'Edit camera metadata' : 'Register camera'}</h2><p>Stream credentials and connection setup are not configured in this frontend demo.</p></div><button class="x" data-close aria-label="Close">×</button></div><form id="cameraForm" data-camera-id="${camera ? escapeHTML(camera.id) : ''}"><div class="form-grid"><div class="field"><label for="cameraId">Camera ID *</label><input id="cameraId" name="id" required maxlength="32" value="${camera ? escapeHTML(camera.id) : ''}" ${camera ? 'readonly' : ''} placeholder="CAM-07"></div><div class="field"><label for="cameraName">Camera name *</label><input id="cameraName" name="name" required maxlength="80" value="${camera ? escapeHTML(camera.name) : ''}"></div><div class="field"><label for="cameraLocation">Location *</label><input id="cameraLocation" name="location" required maxlength="100" value="${camera ? escapeHTML(camera.location) : ''}"></div><div class="field"><label for="cameraStatus">Demo status</label><select id="cameraStatus" name="status">${[['online','Connected'],['warning','Degraded'],['offline','Disconnected'],['error','Error']].map(([key,label]) => `<option value="${key}" ${(camera?.status || 'online') === key ? 'selected' : ''}>${label}</option>`).join('')}</select></div></div><div class="form-actions"><button class="btn" type="button" data-close>Cancel</button><button class="btn p" type="submit">Save demo metadata</button></div></form>`);
  $('#cameraForm').addEventListener('submit', event => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const cameraId = String(data.get('id')).trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,32}$/.test(cameraId)) { toast('Enter a valid camera ID.'); return; }
    const existing = cameraById(event.currentTarget.dataset.cameraId || cameraId);
    if (!existing && cameraById(cameraId)) { toast('That camera ID already exists.'); return; }
    if (existing) Object.assign(existing,{ id:cameraId, name:String(data.get('name')).trim(), location:String(data.get('location')).trim(), status:String(data.get('status')), lastSeen:new Date().toISOString() });
    else cameras.push({ id:cameraId, name:String(data.get('name')).trim(), location:String(data.get('location')).trim(), status:String(data.get('status')), fps:0, resolution:'Not configured', lastSeen:null, source:'Not connected' });
    audit(existing ? 'CAMERA_UPDATED_DEMO' : 'CAMERA_REGISTERED_DEMO','Camera',cameraId,'Metadata saved in browser memory; no stream configured.'); toast('Camera metadata saved in demo memory.'); closeModal(); draw();
  });
}
function userOverviewModal() {
  openModal(`<div class="mh"><div><h2 id="modalTitle">Demo user and role</h2><p>Role switching is a UI demonstration, not authentication or authorization.</p></div><button class="x" data-close aria-label="Close">×</button></div><div class="field"><label for="roleSelect">View as role</label><select id="roleSelect">${roles.map(role => `<option ${role === currentRole ? 'selected' : ''}>${escapeHTML(role)}</option>`).join('')}</select></div><div class="notice" style="margin-top:14px">Real permissions must be enforced by backend endpoints. This selector only changes which demo navigation items are visible.</div><div class="form-actions"><button class="btn p" data-apply-role>Apply demo role</button></div>`);
}
function applyAlertStatus(id, nextStatus) {
  const alert = alerts.find(a => a.id === id); if (!alert) return;
  if (!ALERT_STATES.includes(nextStatus)) { toast('Unsupported alert status.'); return; }
  const allowed = { New:['Acknowledged','Under Review'], Acknowledged:['Under Review','Resolved','False Alarm'], 'Under Review':['Resolved','False Alarm','Acknowledged'], Resolved:[], 'False Alarm':[] };
  if (!(allowed[alert.status] || []).includes(nextStatus)) { toast(`Cannot move an alert from ${alert.status} to ${nextStatus}.`); return; }
  alert.status = nextStatus; alert.reviewedBy = currentRole; alert.reviewedAt = new Date().toISOString();
  const notesField = $('#reviewNotes'); if (notesField) alert.notes = notesField.value.trim();
  audit('ALERT_STATUS_CHANGED_DEMO','Alert',id,`Status changed to ${nextStatus}.`);
  const note = notifications.find(n => n.id === id); if (note) note.read = true;
  toast(`Alert status changed to ${nextStatus} in demo memory.`); closeModal(); draw();
}
function renderNotifications() {
  $('#notif').innerHTML = `<div class="notif-head"><strong>Notifications</strong><button type="button" data-mark-notifications>Mark all read</button></div>${notifications.length ? notifications.map(n => `<div class="ni ${n.read ? 'read' : ''}" data-notification="${escapeHTML(n.id)}"><i class="sd s-${n.severity === 'critical' ? 'cr' : n.severity === 'warning' ? 'wa' : 'in'}"></i><div><div>${escapeHTML(n.text)}</div><small class="muted">${escapeHTML(displayTime(n.time))}</small></div></div>`).join('') : emptyState('No notifications')}`;
}
function toggleNotifications() { $('#notif').classList.toggle('show'); }
function chartOptions() { return { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, grid:{ color:'#eef1f5' } }, x:{ grid:{ display:false } } } }; }
function makeChart(id, type, labels, datasets) { const canvas = $('#'+id); if (!canvas || typeof Chart === 'undefined') return; charts.push(new Chart(canvas,{ type, data:{ labels, datasets:datasets.map(d=>({ ...d, borderColor:'#D4AF37', backgroundColor:type === 'bar' ? '#0B1F33' : '#D4AF3722', fill:type === 'line', tension:.35 })) }, options:chartOptions() })); }
function csvEscape(value) { const text = String(value ?? ''); return `"${text.replace(/"/g,'""')}"`; }
function downloadCSV(filename, rows) {
  const content = rows.map(row => row.map(csvEscape).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${content}`],{type:'text/csv;charset=utf-8;'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

const V = {
  dashboard() {
    const open = activeAlerts(); const matched = products.filter(p => p.identification === 'MATCHED').length; const online = cameras.filter(c => c.status === 'online').length;
    return `<p class="sub">Overview of inventory records, sample observations, camera health and alerts. Values shown here are synthetic demo data.</p><div class="grid g4" style="margin-bottom:14px"><div class="card kpi"><div class="kpi-top"><span>Registered products</span><span class="kpi-icon">◇</span></div><div class="n">${products.length}</div><div class="l">Inventory records in browser memory</div></div><div class="card kpi"><div class="kpi-top"><span>Matched observations</span><span class="kpi-icon">⌕</span></div><div class="n">${matched}</div><div class="l">Current sample identity state</div></div><div class="card kpi ${open.length ? 'hl' : ''}"><div class="kpi-top"><span>Active alerts</span><span class="kpi-icon">⚑</span></div><div class="n">${open.length}</div><div class="l">${open.filter(a=>a.severity==='critical').length} critical · requires human review</div></div><div class="card kpi"><div class="kpi-top"><span>Cameras connected</span><span class="kpi-icon">▣</span></div><div class="n">${online}/${cameras.length}</div><div class="l">${cameras.filter(c=>c.status!=='online').length} degraded or disconnected</div></div></div><div class="grid g2"><section class="card"><h3>Alerts requiring attention <button class="muted-link" data-go="alerts">View all</button></h3>${open.slice(0,3).map(alertCard).join('') || emptyState('No active alerts')}</section><section class="card"><h3>Recent observations <button class="muted-link" data-go="events">View history</button></h3>${observations.slice(0,5).map(eventRow).join('')}</section></div><div class="grid g2" style="margin-top:14px"><section class="card"><h3>Observation activity <span class="pill nu">Demo metrics</span></h3><div class="chartbox"><canvas id="overviewChart" aria-label="Sample observations over time"></canvas></div></section><section class="card"><h3>Camera status <button class="muted-link" data-go="cameras">Details</button></h3>${cameras.map(c=>`<div class="ev" style="align-items:center"><b style="width:66px">${escapeHTML(c.id)}</b><span style="flex:1;color:var(--mu)">${escapeHTML(c.location)}</span>${cameraStatusPill(c.status)}</div>`).join('')}</section></div><div class="notice" style="margin-top:14px">The dashboard does not infer theft. Unknown identity, lost visibility, or a missing transaction is contextual information for an authorized reviewer—not a verdict.</div>`;
  },
  live() { return `<div class="section-head"><div><h2>Camera monitoring</h2><p>Simulated camera panels with sample object boxes; no actual video stream is connected.</p></div><button class="btn" data-go="cameras">Manage cameras</button></div><div class="grid g2"><div class="grid g3" style="grid-template-columns:repeat(auto-fill,minmax(245px,1fr))">${cameras.map(cameraCard).join('')}</div><section class="card"><h3>Recent processing events</h3>${observations.slice(0,8).map(eventRow).join('')}</section></div>`; },
  map() { return `<p class="sub">Schematic floor-plan demo. Locations are sample coordinates, not calibrated physical measurements.</p><div class="card"><div class="map" id="storeMap">${ZONES.map(z=>`<div class="zone ${z.kind}" style="left:${z.x[0]-3}%;top:${z.y[0]-8}%;width:${z.x[1]-z.x[0]+6}%;height:${z.y[1]-z.y[0]+14}%">${escapeHTML(z.name.toUpperCase())}</div>`).join('')}${cameras.map((c,i)=>{const positions=[[5,10],[95,10],[50,95],[95,94],[50,10],[5,94]][i];return `<span class="cm ${c.status==='online'?'':c.status==='warning'?'warning':'off'}" style="left:${positions[0]}%;top:${positions[1]}%">${escapeHTML(c.id)}</span>`}).join('')}${tracks.map(t=>`<button type="button" class="mk ${t.identification==='UNKNOWN'?'unknown':t.identification==='AMBIGUOUS'?'ambiguous':t.zone==='Exit Zone'?'alerting':t.identification==='MATCHED'?'in':''}" style="left:${t.x}%;top:${t.y}%" title="${escapeHTML(t.id)}" aria-label="View track ${escapeHTML(t.id)}" data-track="${escapeHTML(t.id)}"></button>`).join('')}</div><div class="legend"><span>🟡 Registered / candidate</span><span>🔵 Matched</span><span>🟣 Unknown</span><span>🟠 Ambiguous</span><span>🔴 Requires review</span><span>▰ Camera</span></div></div><div id="mapDetails" style="margin-top:14px"></div>`; },
  products() {
    let list = products.filter(p => `${p.id} ${p.type} ${p.description} ${p.cameraId || ''}`.toLowerCase().includes(filters.q.toLowerCase()) && (!filters.productStatus || p.status === filters.productStatus) && (!filters.identification || p.identification === filters.identification) && (!filters.type || p.type === filters.type));
    list.sort((a,b)=>String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''))*sortDirection);
    const th = (key,label) => `<th><button class="table-sort" type="button" data-sort="${key}">${label}${sortKey===key?(sortDirection>0?' ▲':' ▼'):''}</button></th>`;
    return `<div class="section-head"><div><h2>Jewelry inventory</h2><p>Permanent product records are distinct from temporary track IDs.</p></div>${canSee('enrollment')?'<button class="btn p" data-new-product>＋ Register product</button>':''}</div><div class="bar"><input type="search" id="productSearch" value="${escapeHTML(filters.q)}" placeholder="Search product ID, type or description"><select id="productStatusFilter"><option value="">All inventory states</option>${Object.entries(PRODUCT_STATES).map(([key,val])=>`<option value="${key}" ${filters.productStatus===key?'selected':''}>${escapeHTML(val[0])}</option>`).join('')}</select><select id="identificationFilter"><option value="">All identification states</option>${Object.entries(IDENTIFICATION).map(([key,val])=>`<option value="${key}" ${filters.identification===key?'selected':''}>${escapeHTML(val[0])}</option>`).join('')}</select><select id="typeFilter"><option value="">All jewelry types</option>${TYPES.map(type=>`<option ${filters.type===type?'selected':''}>${escapeHTML(type)}</option>`).join('')}</select></div><div class="card tw"><table class="rt"><thead><tr>${th('id','Product ID')}${th('type','Type')}${th('status','Inventory state')}${th('identification','Identification')}${th('cameraId','Last camera')}${th('lastSeen','Last observed')}</tr></thead><tbody>${list.map(productRow).join('')}</tbody></table>${!list.length?emptyState('No products found','Try changing your filters or registering a demo product.'):''}</div><p class="sub" style="margin-top:10px">${list.length} product record(s) · Reference images and embeddings are not persisted by this demo.</p>`;
  },
  enrollment() { return `<div class="section-head"><div><h2>Product enrollment</h2><p>Register an item with verified metadata and optional reference images.</p></div><button class="btn p" data-new-product>＋ New product</button></div><div class="notice">This prototype does not run jewelry detection on an uploaded image. A real batch-enrollment workflow needs the backend and detection service to return individual crops for human review before saving.</div><div class="grid g22"><section class="card"><h3>Register a product</h3><p class="sub">Create a distinct inventory record, set an initial review state, and select multiple reference images if available.</p><button class="btn p" data-new-product>Open product registration form</button></section><section class="card"><h3>Recent registrations</h3>${products.slice(0,6).map(p=>`<div class="ev"><div style="flex:1"><b>${escapeHTML(p.id)} · ${escapeHTML(p.type)}</b><br><small class="muted">${escapeHTML(displayTime(p.createdAt))} · ${p.referenceImages.length} selected reference image(s)</small></div>${productStatusPill(p.status)}</div>`).join('')}</section></div>`; },
  alerts() {
    let list = alerts.filter(a => (!filters.q || `${a.id} ${a.title} ${a.productId || ''} ${a.cameraId || ''}`.toLowerCase().includes(filters.q.toLowerCase())) && (!filters.alertStatus || a.status === filters.alertStatus) && (!filters.severity || a.severity === filters.severity) && (!filters.camera || a.cameraId === filters.camera));
    return `<div class="section-head"><div><h2>Alert review queue</h2><p>Each alert explains its trigger and preserves identity uncertainty for a human reviewer.</p></div><span class="pill ${activeAlerts().length?'wa':'ok'}">${activeAlerts().length} unresolved</span></div><div class="notice">An alert means “please review.” No alert is a confirmed theft verdict. Product visibility loss or absent transaction records are not proof of unauthorized activity.</div><div class="bar"><input id="alertSearch" type="search" value="${escapeHTML(filters.q)}" placeholder="Search alert, product or camera"><select id="alertStatusFilter"><option value="">All statuses</option>${ALERT_STATES.map(s=>`<option ${filters.alertStatus===s?'selected':''}>${s}</option>`).join('')}</select><select id="severityFilter"><option value="">All severities</option>${SEVERITIES.map(s=>`<option value="${s}" ${filters.severity===s?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}</select><select id="alertCameraFilter"><option value="">All cameras</option>${cameras.map(c=>`<option value="${c.id}" ${filters.camera===c.id?'selected':''}>${escapeHTML(c.id)}</option>`).join('')}</select></div>${list.map(alertCard).join('') || `<div class="card">${emptyState('No alerts match these filters')}</div>`}`;
  },
  events() {
    let list = observations.filter(o => (!filters.q || `${o.id} ${o.type} ${o.productId || ''} ${o.cameraId} ${o.trackId || ''} ${o.details}`.toLowerCase().includes(filters.q.toLowerCase())) && (!filters.eventType || o.type === filters.eventType) && (!filters.camera || o.cameraId === filters.camera) && (!filters.eventProduct || o.productId === filters.eventProduct) && (!filters.eventDateFrom || o.time.slice(0,10) >= filters.eventDateFrom) && (!filters.eventDateTo || o.time.slice(0,10) <= filters.eventDateTo));
    return `<div class="section-head"><div><h2>Observation and event history</h2><p>Detection, tracking, identity status and camera context remain separate fields.</p></div><button class="btn" data-export-events>Export filtered CSV</button></div><div class="bar"><input id="eventSearch" type="search" value="${escapeHTML(filters.q)}" placeholder="Search observations or track IDs"><select id="eventTypeFilter"><option value="">All event types</option>${[...new Set(observations.map(o=>o.type))].map(t=>`<option ${filters.eventType===t?'selected':''}>${escapeHTML(t)}</option>`).join('')}</select><select id="eventCameraFilter"><option value="">All cameras</option>${cameras.map(c=>`<option value="${c.id}" ${filters.camera===c.id?'selected':''}>${escapeHTML(c.id)}</option>`).join('')}</select><select id="eventProductFilter"><option value="">All products</option>${products.map(p=>`<option value="${p.id}" ${filters.eventProduct===p.id?'selected':''}>${escapeHTML(p.id)}</option>`).join('')}</select></div><div class="card">${list.length ? list.map(eventRow).join('') : emptyState('No observations match these filters')}</div><p class="sub" style="margin-top:10px">${list.length} sample observation(s) · track IDs are temporary and do not establish permanent product identity.</p>`;
  },
  cameras() { return `<div class="section-head"><div><h2>Camera management</h2><p>Monitor connection state and metadata for configured video sources.</p></div>${currentRole==='Administrator'||currentRole==='Technical Maintainer'?'<button class="btn p" data-new-camera>＋ Register camera</button>':''}</div><div class="notice">All streams in this prototype are simulated. Registering a camera here saves only browser-side metadata; stream credentials, ingestion, recovery and health checks require backend integration.</div><div class="grid g3">${cameras.map(cameraCard).join('')}</div><div class="card" style="margin-top:14px"><h3>Camera status summary</h3><div class="tw"><table><thead><tr><th>Camera</th><th>Location</th><th>Status</th><th>Demo FPS</th><th>Last signal</th><th>Source</th></tr></thead><tbody>${cameras.map(c=>`<tr><td><b>${escapeHTML(c.id)}</b><span class="table-sub">${escapeHTML(c.name)}</span></td><td>${escapeHTML(c.location)}</td><td>${cameraStatusPill(c.status)}</td><td>${c.fps}</td><td>${escapeHTML(displayTime(c.lastSeen))}</td><td>${escapeHTML(c.source)}</td></tr>`).join('')}</tbody></table></div></div>`; },
  transactions() { return `<div class="section-head"><div><h2>Sales and authorized handovers</h2><p>Transaction records add context to observations but do not rewrite original visual events.</p></div><button class="btn p" data-new-transaction>＋ Record transaction</button></div><div class="notice">An absent transaction record does not prove unauthorized activity. Product status changes must be explicit and authorized.</div><div class="card tw"><table class="rt"><thead><tr><th>Record ID</th><th>Product</th><th>Type</th><th>Recorded by</th><th>Status</th><th>Time</th><th>Notes</th></tr></thead><tbody>${transactions.map(t=>`<tr><td data-label="Record ID"><b>${escapeHTML(t.id)}</b></td><td data-label="Product"><button class="btn s" data-product="${escapeHTML(t.productId)}">${escapeHTML(t.productId)}</button></td><td data-label="Type">${escapeHTML(t.type)}</td><td data-label="Recorded by">${escapeHTML(t.actor)}</td><td data-label="Status">${pill(t.status,'ok')}</td><td data-label="Time">${escapeHTML(displayTime(t.time))}</td><td data-label="Notes">${escapeHTML(t.notes || '—')}</td></tr>`).join('')}</tbody></table>${transactions.length ? '' : emptyState('No transaction records')}</div>`; },
  reports() { const open=activeAlerts().length; const online=cameras.filter(c=>c.status==='online').length; return `<div class="section-head"><div><h2>Reports</h2><p>Export the current demo records. Reports are not based on real-time services.</p></div><button class="btn p" data-export-report>Download inventory CSV</button></div><div class="bar"><label class="field"><span>From date</span><input type="date" id="reportFrom"></label><label class="field"><span>To date</span><input type="date" id="reportTo"></label><button class="btn" data-report-refresh>Apply period</button></div><p class="report-meta" id="reportRange">Report generated from browser demo data at ${escapeHTML(displayTime(new Date().toISOString()))}.</p><div class="grid g4"><div class="card kpi"><div class="l">Inventory records</div><div class="n">${products.length}</div><div class="l">All product states</div></div><div class="card kpi"><div class="l">Active alerts</div><div class="n">${open}</div><div class="l">Not resolved or false alarm</div></div><div class="card kpi"><div class="l">Camera availability</div><div class="n">${cameras.length ? Math.round(online/cameras.length*100) : 0}%</div><div class="l">Demo connection status</div></div><div class="card kpi"><div class="l">Transactions</div><div class="n">${transactions.length}</div><div class="l">Sales and handovers</div></div></div><div class="grid g22" style="margin-top:14px"><section class="card"><h3>Inventory by identification state</h3><div class="chartbox"><canvas id="reportIdentityChart"></canvas></div></section><section class="card"><h3>Alerts by severity</h3><div class="chartbox"><canvas id="reportAlertChart"></canvas></div></section></div><div class="card" style="margin-top:14px"><h3>Available demo exports</h3><div class="inline-actions"><button class="btn" data-export-products>Products CSV</button><button class="btn" data-export-alerts>Alerts CSV</button><button class="btn" data-export-events>Observations CSV</button><button class="btn" data-export-transactions>Transactions CSV</button><button class="btn" data-export-audit>Audit log CSV</button></div></div>`; },
  audit() { return `<div class="section-head"><div><h2>Audit log</h2><p>Demo changes are recorded in browser memory. Production logs must be persisted and protected by the backend.</p></div><button class="btn" data-export-audit>Export CSV</button></div><div class="notice">This demo audit log is not tamper-proof and is cleared when the page state is reset. It must not be treated as a production audit system.</div><div class="card tw"><table class="rt"><thead><tr><th>Audit ID</th><th>Action</th><th>Entity</th><th>Record</th><th>Actor</th><th>Time</th><th>Details</th></tr></thead><tbody>${auditLogs.map(a=>`<tr><td data-label="Audit ID"><span class="mono">${escapeHTML(a.id)}</span></td><td data-label="Action">${escapeHTML(a.action)}</td><td data-label="Entity">${escapeHTML(a.entityType)}</td><td data-label="Record">${escapeHTML(a.entityId)}</td><td data-label="Actor">${escapeHTML(a.actor)}</td><td data-label="Time">${escapeHTML(displayTime(a.time))}</td><td data-label="Details">${escapeHTML(a.details)}</td></tr>`).join('')}</tbody></table></div>`; },
  health() { const online=cameras.filter(c=>c.status==='online').length; return `<div class="notice">Health values below are based on synthetic demo state. No service checks, backend logs, model metrics or database probes are running.</div><div class="grid g3"><div class="card"><h3>Video ingestion</h3>${pill('Not connected','wa')}<p class="sub" style="margin-top:9px">No actual video frames are received.</p></div><div class="card"><h3>Detection / tracking</h3>${pill('Simulated','wa')}<p class="sub" style="margin-top:9px">Boxes and tracks are sample objects.</p></div><div class="card"><h3>Re-identification</h3>${pill('Simulated','wa')}<p class="sub" style="margin-top:9px">No embeddings or similarity search are executed.</p></div><div class="card"><h3>Backend API</h3>${pill('Not configured','cr')}<p class="sub" style="margin-top:9px">No API endpoint has been supplied.</p></div><div class="card"><h3>Database</h3>${pill('Browser memory only','wa')}<p class="sub" style="margin-top:9px">Records are not persisted after reset.</p></div><div class="card"><h3>Camera demo status</h3>${pill(`${online}/${cameras.length} marked online`,'in')}<p class="sub" style="margin-top:9px">This is not a physical connection check.</p></div></div><div class="card" style="margin-top:14px"><h3>Recent diagnostic observations</h3>${observations.filter(o=>o.type==='Camera'||o.identification==='FAILED').map(eventRow).join('') || emptyState('No demo diagnostic events')}</div>`; },
  settings() { return `<div class="grid g22"><section class="card"><h3>Store information</h3><div class="kv"><div><small>Application</small>Gold Guard</div><div><small>Environment</small>Browser demo</div><div><small>Store</small>Al-Nour Gold &amp; Jewelry</div><div><small>Branch</small>Assiut</div></div></section><section class="card"><h3>Demo role and access preview</h3><p class="sub">Current role: ${escapeHTML(currentRole)}. This is not an authenticated user session.</p><button class="btn p" data-open-role>Change demo role</button><div class="notice" style="margin-top:12px">Backend endpoints must enforce access control. Hiding navigation is not a security boundary.</div></section><section class="card"><h3>Monitoring preferences</h3><label class="ev"><span style="flex:1">Show simulated detection boxes</span><input type="checkbox" checked disabled aria-label="Simulated detection boxes enabled"></label><label class="ev"><span style="flex:1">Auto-refresh demo timestamps</span><input type="checkbox" checked disabled aria-label="Demo timestamps enabled"></label><p class="sub">Preference persistence is not implemented.</p></section><section class="card"><h3>Security and retention</h3><p class="sub">Configure authentication, permissions, evidence access, retention and deletion policy on the backend before deployment.</p>${pill('Backend integration required','wa')}</section></div>`; },
  users() { return `<div class="section-head"><div><h2>Users and roles</h2><p>Role overview based on the SRS. No actual user accounts or passwords are managed here.</p></div><button class="btn p" data-open-role>Change demo role</button></div><div class="notice">Authentication, password hashing, account status and backend authorization are not implemented in this frontend prototype.</div><div class="grid g2">${roles.map(role=>`<section class="card"><h3>${escapeHTML(role)} ${role===currentRole?pill('Current demo role','in'):''}</h3><p class="sub">Visible demo modules</p><div class="inline-actions">${(permissions[role]||[]).map(key=>`<span class="pill nu">${escapeHTML((PAGES.find(p=>p[0]===key)||[key,'',key])[2])}</span>`).join('')}</div></section>`).join('')}</div>`; }
};
const AFTER = {
  dashboard() { makeChart('overviewChart','line',['09:00','10:00','11:00','12:00','13:00','14:00'],[{label:'Sample observations',data:[3,6,4,8,7,10]}]); },
  reports() { makeChart('reportIdentityChart','bar',Object.values(IDENTIFICATION).map(s=>s[0]),[{label:'Products',data:Object.keys(IDENTIFICATION).map(key=>products.filter(p=>p.identification===key).length)}]); makeChart('reportAlertChart','bar',['Critical','Warning','Info'],[{label:'Alerts',data:SEVERITIES.map(s=>alerts.filter(a=>a.severity===s).length)}]); }
};

/* Delegated interactions keep controls working after each page re-render. */
document.addEventListener('click', event => {
  const target = event.target.closest('button,[data-product],[data-camera],[data-alert-view],[data-alert-action],[data-alert-resolve],[data-save-notes],[data-go],[data-track],[data-notification]');
  if (!target) return;
  if (target.matches('[data-page]')) { go(target.dataset.page); return; }
  if (target.matches('[data-go]')) { go(target.dataset.go); return; }
  if (target.matches('[data-close]')) { closeModal(); return; }
  if (target.matches('[data-product]')) { productDetailsModal(target.dataset.product); return; }
  if (target.matches('[data-camera]')) { cameraDetailsModal(target.dataset.camera); return; }
  if (target.matches('[data-alert-view]')) { alertDetailsModal(target.dataset.alertView); return; }
  if (target.matches('[data-alert-action]')) { applyAlertStatus(target.dataset.alertAction,target.dataset.status); return; }
  if (target.matches('[data-alert-resolve]')) { applyAlertStatus(target.dataset.alertResolve,target.dataset.status); return; }
  if (target.matches('[data-save-notes]')) { const a=alerts.find(x=>x.id===target.dataset.saveNotes); if(a){const field=$('#reviewNotes');a.notes=field?field.value.trim():a.notes;audit('ALERT_NOTES_SAVED_DEMO','Alert',a.id,'Review notes updated.');toast('Review notes saved in demo memory.');closeModal();draw();} return; }
  if (target.matches('[data-track]')) { const track=tracks.find(t=>t.id===target.dataset.track); const detail=$('#mapDetails'); if(track&&detail){detail.innerHTML=`<div class="card"><h3>Track ${escapeHTML(track.id)} ${identificationPill(track.identification)}</h3><div class="kv"><div><small>Temporary track ID</small>${escapeHTML(track.id)}</div><div><small>Camera</small>${escapeHTML(track.cameraId)}</div><div><small>Candidate product</small>${escapeHTML(track.productId || 'Unknown / not assigned')}</div><div><small>Track confidence</small>${track.confidence===null?'Not available':escapeHTML(track.confidence)}</div><div><small>First observed</small>${escapeHTML(displayTime(track.startedAt))}</div><div><small>Last observed</small>${escapeHTML(displayTime(track.lastSeen))}</div></div>${track.productId?`<button class="btn" data-product="${escapeHTML(track.productId)}">View product candidate</button>`:''}</div>`;} return; }
  if (target.matches('[data-notification]')) { const n=notifications.find(x=>x.id===target.dataset.notification); if(n)n.read=true; $('#notif').classList.remove('show'); const a=alerts.find(x=>x.id===target.dataset.notification); if(a)alertDetailsModal(a.id); renderChrome(); return; }
  if (target.matches('[data-mark-notifications]')) { notifications.forEach(n=>n.read=true); renderChrome(); return; }
  if (target.matches('[data-new-product]')) { productFormModal(); return; }
  if (target.matches('[data-edit-product]')) { const p=productById(target.dataset.editProduct); closeModal(); productFormModal(p); return; }
  if (target.matches('[data-new-transaction]')) { transactionFormModal(); return; }
  if (target.matches('[data-new-camera]')) { cameraEditModal(); return; }
  if (target.matches('[data-camera-edit]')) { const id=target.dataset.cameraEdit; closeModal(); cameraEditModal(id); return; }
  if (target.matches('[data-open-role]')) { userOverviewModal(); return; }
  if (target.matches('[data-apply-role]')) { const role=$('#roleSelect').value; currentRole=role; audit('DEMO_ROLE_SWITCHED','DemoRole',role,'UI visibility changed; no authentication performed.'); closeModal(); if(!canSee(page))page='dashboard'; draw(); toast(`Demo role changed to ${role}.`); return; }
  if (target.matches('[data-export-report]') || target.matches('[data-export-products]')) { exportProducts(); return; }
  if (target.matches('[data-export-alerts]')) { exportAlerts(); return; }
  if (target.matches('[data-export-events]')) { exportObservations(); return; }
  if (target.matches('[data-export-transactions]')) { exportTransactions(); return; }
  if (target.matches('[data-export-audit]')) { exportAudit(); return; }
  if (target.matches('[data-report-refresh]')) { const from=$('#reportFrom').value,to=$('#reportTo').value;if(from&&to&&from>to){toast('Start date must be before end date.');return;}$('#reportRange').textContent=`Demo report period: ${from||'earliest available'} to ${to||'latest available'} · Generated ${displayTime(new Date().toISOString())}.`;toast('Report period updated for display.');return; }
  if (target.matches('[data-sort]')) { const key=target.dataset.sort;sortDirection=sortKey===key?-sortDirection:1;sortKey=key;draw();return; }
});
$('#menuBtn').addEventListener('click',toggleMenu);
$('#shade').addEventListener('click',toggleMenu);
$('#notifBtn').addEventListener('click',event=>{event.stopPropagation();toggleNotifications();});
document.addEventListener('click',event=>{if(!event.target.closest('.notif-wrap'))$('#notif').classList.remove('show');if(event.target=== $('#modal'))closeModal();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeModal();$('#notif').classList.remove('show');$('#sidebar').classList.remove('open');$('#shade').classList.remove('on');}});
$('#gsearch').addEventListener('input',event=>{filters.q=event.target.value;if(!['products','alerts','events'].includes(page))page='products';draw();const field=$('#productSearch')||$('#alertSearch')||$('#eventSearch');if(field){field.focus();field.setSelectionRange(field.value.length,field.value.length);}});
$('#view').addEventListener('input',event=>{
  const id=event.target.id;
  if(id==='productSearch'){filters.q=event.target.value;const pos=event.target.selectionStart;draw();const field=$('#productSearch');field.focus();field.setSelectionRange(pos,pos);}
  if(id==='alertSearch'){filters.q=event.target.value;const pos=event.target.selectionStart;draw();const field=$('#alertSearch');field.focus();field.setSelectionRange(pos,pos);}
  if(id==='eventSearch'){filters.q=event.target.value;const pos=event.target.selectionStart;draw();const field=$('#eventSearch');field.focus();field.setSelectionRange(pos,pos);}
});
$('#view').addEventListener('change',event=>{
  const map={productStatusFilter:'productStatus',identificationFilter:'identification',typeFilter:'type',alertStatusFilter:'alertStatus',severityFilter:'severity',alertCameraFilter:'camera',eventTypeFilter:'eventType',eventCameraFilter:'camera',eventProductFilter:'eventProduct'};
  if(map[event.target.id]){filters[map[event.target.id]]=event.target.value;draw();}
});
function exportProducts(){downloadCSV('gold-guard-products-demo.csv',[['Product ID','Type','Description','Inventory Status','Identification State','Similarity Score','Camera','Region','Last Observed','Reference Image Count'],...products.map(p=>[p.id,p.type,p.description,PRODUCT_STATES[p.status]?.[0]||p.status,IDENTIFICATION[p.identification]?.[0]||p.identification,p.matchScore,p.cameraId,p.zone,p.lastSeen,p.referenceImages.length])]);}
function exportAlerts(){downloadCSV('gold-guard-alerts-demo.csv',[['Alert ID','Title','Severity','Status','Product ID','Track ID','Camera','Region','Time','Risk Rule Score','Identity State','Explanation','Reviewer','Reviewed At','Notes'],...alerts.map(a=>[a.id,a.title,a.severity,a.status,a.productId,a.trackId,a.cameraId,a.zone,a.time,a.riskScore,a.identity,a.reason.join('; '),a.reviewedBy,a.reviewedAt,a.notes])]);}
function exportObservations(){downloadCSV('gold-guard-observations-demo.csv',[['Observation ID','Type','Camera','Product ID','Track ID','Identification','Confidence','Time','Region','Details'],...observations.map(o=>[o.id,o.type,o.cameraId,o.productId,o.trackId,o.identification,o.confidence,o.time,o.zone,o.details])]);}
function exportTransactions(){downloadCSV('gold-guard-transactions-demo.csv',[['Transaction ID','Product ID','Type','Status','Time','Actor','Notes'],...transactions.map(t=>[t.id,t.productId,t.type,t.status,t.time,t.actor,t.notes])]);}
function exportAudit(){downloadCSV('gold-guard-audit-demo.csv',[['Audit ID','Action','Entity Type','Entity ID','Actor','Time','Details'],...auditLogs.map(a=>[a.id,a.action,a.entityType,a.entityId,a.actor,a.time,a.details])]);}

/* Demo activity refreshes display timestamps only; it does not ingest video or run AI. */
window.setInterval(()=>{
  cameras.filter(c=>c.status==='online').forEach(c=>{c.lastSeen=new Date().toISOString();});
  tracks.forEach(t=>{if(t.identification==='MATCHED')t.lastSeen=new Date().toISOString();});
  if(page==='live'||page==='cameras'){
    $$('[data-ts]').forEach(el=>el.textContent=`DEMO · ${timeOf(nowDate())}`);
  }
},5000);

page=(location.hash||'#dashboard').slice(1);
if(!V[page]||!PAGES.some(p=>p[0]===page)||!canSee(page))page='dashboard';
draw();
