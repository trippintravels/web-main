// Dashboard markup + logic, ported verbatim from the Claude Design artifact.
// Step A: runs with the design's placeholder data. Step B wires it to the API.

import { get, post, patch } from './api.js';
import { computeD } from './dashlib.js';
import { I, svg } from './icons.js';

const DASH_MAIN = `
      <div class="tt-loader" id="tt-loader"><div class="tt-spin"></div><div class="tt-loadtxt">brewing...</div></div>
      <div class="tt-head">
        <div>
          <h1 class="tt-h1">Dashboard</h1>
          <div class="tt-lede" id="lede"></div>
        </div>
        <div class="tt-actions">
          <button class="tt-btn ghost" data-nav="expenses">Add expense</button>
          <button class="tt-btn prim" data-nav="travel">New booking</button>
        </div>
      </div>

      <div class="tt-group"><h3>Operations</h3><span class="rule"></span></div>
      <div class="tt-primes" id="primes"></div>

      <div class="tt-group"><h3>Fleet, people &amp; money</h3><span class="rule"></span></div>
      <div class="tt-stats" id="stats"></div>

      <!-- ACTION REQUIRED -->
      <div class="tt-card tt-ac" style="margin-top:22px;">
        <div class="tt-cardhd">
          <h2>Action required <span class="tt-count" id="ac-count">0</span></h2>
          <span class="tt-link" id="ac-mark">Snooze all</span>
        </div>
        <div class="tt-filters" id="ac-filters"></div>
        <div id="ac-list"></div>
      </div>

      <div class="tt-row">
        <div class="tt-card">
          <div class="tt-cardhd"><h2>Bookings</h2><span class="meta">Last 8 weeks</span></div>
          <div class="tt-legend">
            <span><i style="background:var(--tt-terra)"></i>Travel</span>
            <span><i style="background:var(--tt-olive)"></i>Car</span>
          </div>
          <div class="tt-chartwrap" id="bk-wrap">
            <svg id="bk-chart" width="100%" viewBox="0 0 660 230" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Weekly bookings"></svg>
            <div class="tt-tip" id="bk-tip"></div>
          </div>
        </div>
        <div class="tt-card">
          <div class="tt-cardhd"><h2>Monthly revenue</h2><span class="meta">Gross</span></div>
          <div class="tt-chartwrap" id="rev-wrap" style="margin-top:6px;">
            <svg id="rev-chart" width="100%" viewBox="0 0 360 190" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Monthly revenue"></svg>
            <div class="tt-tip" id="rev-tip"></div>
          </div>
          <div class="tt-revnote">
            <span>October gross <b id="rev-gross">—</b></span>
            <span>Net after costs <b id="rev-net">—</b></span>
          </div>
        </div>
      </div>

      <div class="tt-row">
        <div class="tt-card">
          <div class="tt-cardhd"><h2>Recent activity</h2><span class="tt-link" data-nav="travel">All bookings</span></div>
          <div style="margin-top:12px; overflow-x:auto;"><div id="activity"></div></div>
        </div>
        <div class="tt-card">
          <div class="tt-cardhd"><h2>Upcoming departures</h2></div>
          <div id="dep" style="margin-top:6px;"></div>
        </div>
      </div>

      <div class="tt-toastwrap" id="toastwrap"></div>
    `;

async function initDashboard(){
var root = document.getElementById('dash-root'); if(!root) return;
  var $ = function(id){ return document.getElementById(id); };

  function money(n){ return '₹'+n.toLocaleString('en-IN'); }

  /* ---------- live data (computed from the API) ---------- */
  var D = null, pendingTotal = 0, pendingCount = 0;
  function todayISO(){ return new Date().toISOString().slice(0,10); }

  /* ---------- sidebar ---------- */

  /* ---------- helpers ---------- */
  function arrow(dir){ return dir==='up'?'▲':dir==='down'?'▼':'·'; }
  function sparkline(series, color){
    var w=62,h=22,pad=2, mn=Math.min.apply(null,series), mx=Math.max.apply(null,series), rng=(mx-mn)||1;
    var pts=series.map(function(v,i){ var x=pad+i*((w-2*pad)/(series.length-1)); var y=h-pad-((v-mn)/rng)*(h-2*pad); return x.toFixed(1)+','+y.toFixed(1); });
    var last=pts[pts.length-1].split(',');
    return '<svg class="tt-spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><polyline points="'+pts.join(' ')+'" fill="none" stroke="'+color+'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="'+last[0]+'" cy="'+last[1]+'" r="1.9" fill="'+color+'"/></svg>';
  }
  var sparkColor={terra:'#9D5636',sky:'#5B6F82',gold:'#B58A4E'};

  function buildPrimes(){
    $('primes').innerHTML = D.primes.map(function(m){
      return '<div class="tt-prime">'+sparkline(m.series, sparkColor[m.cls])
        +'<div class="cap"><span class="tt-ic '+m.cls+'">'+svg(I[m.ic])+'</span>'+m.label+'</div>'
        +'<div class="tt-num">'+m.value+'</div>'
        +'<div class="tt-meta"><span class="tt-sub">'+m.sub+'</span><span class="tt-delta '+m.dir+'">'+arrow(m.dir)+' '+m.delta+'</span></div></div>';
    }).join('');
  }
  function buildStats(){
    $('stats').innerHTML = D.stats.map(function(s){
      return '<div class="tt-stat'+(s.alert?' alert':'')+(s.money?' money':'')+'">'
        +'<span class="tt-ic '+s.cls+'">'+svg(I[s.ic])+'</span>'
        +'<div><div class="v"'+(s.id?' id="'+s.id+'-v"':'')+'>'+s.v+'</div><div class="l">'+s.l+'</div><div class="h"'+(s.id?' id="'+s.id+'-h"':'')+'>'+s.h+'</div></div></div>';
    }).join('');
  }

  /* ---------- action center ---------- */
  var activeFilter='all';
  var resolved={}; // id -> true

  function acActiveItems(){ return D.actions.filter(function(a){ return !resolved[a.id]; }); }
  function acVisible(){ return acActiveItems().filter(function(a){ return activeFilter==='all'||a.cat===activeFilter; }); }

  function buildFilters(){
    $('ac-filters').innerHTML = D.filters.map(function(f){
      var n = f.k==='all' ? acActiveItems().length : acActiveItems().filter(function(a){return a.cat===f.k;}).length;
      if(f.k!=='all' && n===0) return '';
      return '<button class="tt-fchip'+(activeFilter===f.k?' on':'')+'" data-f="'+f.k+'">'+f.l+' <span class="c">'+n+'</span></button>';
    }).join('');
    var chips=$('ac-filters').querySelectorAll('.tt-fchip');
    for(var i=0;i<chips.length;i++){ chips[i].addEventListener('click', function(){ activeFilter=this.getAttribute('data-f'); renderAC(); }); }
  }
  function actionControl(a){
    if(a.act.k==='received') return '<button class="tt-abtn" data-act="received" data-id="'+a.id+'">Received remaining '+money(a.act.amt)+'?</button>';
    if(a.act.k==='distance') return '<button class="tt-abtn" data-act="distance" data-id="'+a.id+'">Enter distance</button>';
    return '<button class="tt-abtn soft" data-act="link" data-id="'+a.id+'">'+a.act.l+'</button>';
  }
  function itemRow(a){
    return '<div class="tt-aitem sev-'+a.sev+'" id="ai-'+a.id+'">'
      +'<span class="tt-aic">'+svg(I[a.ic])+'</span>'
      +'<div class="tt-abody"><div class="tt-atitle">'+a.t+'</div><div class="tt-asub">'+a.s+'</div></div>'
      +'<span class="tt-atag">'+a.tag+'</span>'
      +'<span class="tt-aact">'+actionControl(a)+'</span></div>';
  }
  function renderAC(){
    var vis=acVisible();
    $('ac-list').innerHTML = vis.length ? vis.map(itemRow).join('')
      : '<div class="tt-empty">Nothing here — you’re all caught up in this group. ✦</div>';
    $('ac-count').textContent = acActiveItems().length;
    buildFilters();
    wireActions();
  }
  function wireActions(){
    var btns=$('ac-list').querySelectorAll('[data-act]');
    for(var i=0;i<btns.length;i++){
      btns[i].addEventListener('click', function(){
        var kind=this.getAttribute('data-act'), id=this.getAttribute('data-id');
        if(kind==='received'){ resolveReceived(id); }
        else if(kind==='distance'){ promptDistance(id, this); }
        else { var a=find(id); go(linkTarget(a)); }
      });
    }
  }
  function find(id){ for(var i=0;i<D.actions.length;i++){ if(D.actions[i].id===id) return D.actions[i]; } }
  function go(key){ document.dispatchEvent(new CustomEvent('tt-nav', { detail: key })); }
  // route an action-centre "link" button to the right screen
  function linkTarget(a){
    if(!a) return 'dashboard';
    if(a.cat==='document') return a.ic==='driver' ? 'drivers' : 'cars';  // renew driver licence vs car doc
    if(a.cat==='fleet') return 'carb';                                    // assign driver on a car booking
    if(a.cat==='payment') return 'payments';
    return 'dashboard';
  }

  async function resolveReceived(id){
    var a=find(id); if(!a) return;
    var payload={ amount:a.act.amt, received_on:todayISO() };
    payload[(a.act.bt==='car'?'car_booking_id':'travel_booking_id')]=a.act.bid;
    try{ await post('payments', payload); }
    catch(e){ toast('Could not save payment: '+(e&&e.message||e), false); return; }
    pendingTotal=Math.max(0,pendingTotal-a.act.amt); pendingCount=Math.max(0,pendingCount-1);
    var pv=$('stat-pending-v'), ph=$('stat-pending-h');
    if(pv) pv.textContent=money(pendingTotal); if(ph) ph.textContent=pendingCount+' bookings';
    markDone(id, 'Payment settled · '+money(a.act.amt)+' received');
    toast(money(a.act.amt)+' marked received — '+a.t.split('—')[1].trim(), true);
  }
  function promptDistance(id, btn){
    var wrap=btn.parentNode;
    wrap.innerHTML='<span class="tt-dinput"><input type="number" min="0" placeholder="km" id="din-'+id+'"><button class="tt-abtn" data-save="'+id+'">Save</button></span>';
    var inp=$('din-'+id); inp.focus();
    wrap.querySelector('[data-save]').addEventListener('click', function(){ saveDistance(id, inp.value); });
    inp.addEventListener('keydown', function(e){ if(e.key==='Enter') saveDistance(id, inp.value); });
  }
  async function saveDistance(id, val){
    var km=Number(val); if(!km||km<=0){ var inp=$('din-'+id); if(inp){ inp.focus(); inp.style.borderColor='var(--tt-bad)'; } return; }
    var a=find(id);
    try{ await patch('car-bookings/'+a.act.bid, { distance_km: km }); }
    catch(e){ toast('Could not save distance: '+(e&&e.message||e), false); return; }
    markDone(id, 'Distance '+km+' km saved · fare now computed');
    toast('Distance saved for '+a.t.split('—')[1].trim()+' — amount computed', true);
  }
  function markDone(id, label){
    resolved[id]=true;
    var el=$('ai-'+id); if(!el) return;
    el.className='tt-aitem done';
    el.querySelector('.tt-aic').innerHTML=svg(I.check);
    el.querySelector('.tt-atag').style.display='none';
    el.querySelector('.tt-aact').innerHTML='<span class="tt-done-lab">'+svg(I.check)+label+'</span>';
    $('ac-count').textContent=acActiveItems().length;
    setTimeout(function(){
      if(el && el.parentNode){ el.style.transition='opacity .4s, transform .4s'; el.style.opacity='0'; el.style.transform='translateX(10px)';
        setTimeout(renderAC, 420); }
    }, 1400);
  }

  /* ---------- toast ---------- */
  function toast(msg, good){
    var t=document.createElement('div'); t.className='tt-toast';
    t.innerHTML=(good?'<span class="ck">'+svg(I.check)+'</span>':'')+msg;
    $('toastwrap').appendChild(t);
    requestAnimationFrame(function(){ t.classList.add('show'); });
    setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 240); }, 2600);
  }

  /* ---------- recent activity + departures ---------- */
  function buildActivity(){
    var rows=D.activity.map(function(r){
      return '<tr><td class="tt-ref">'+r.ref+'</td>'
        +'<td><span class="tt-type '+r.type.toLowerCase()+'">'+r.type+'</span></td>'
        +'<td><span class="tt-who">'+r.who+'</span><div style="font-size:12px;color:var(--tt-muted);margin-top:1px;">'+r.detail+'</div></td>'
        +'<td class="tt-amt">'+r.amt+'</td>'
        +'<td><span class="tt-badge '+r.badge+'">'+r.bl+'</span></td>'
        +'<td style="color:var(--tt-muted);font-size:12px;white-space:nowrap;">'+r.when+'</td></tr>';
    }).join('');
    $('activity').innerHTML='<table class="tt-t"><thead><tr><th>Ref</th><th>Type</th><th>Guest</th><th>Amount</th><th>Status</th><th>When</th></tr></thead><tbody>'+rows+'</tbody></table>';
  }
  function buildDep(){
    $('dep').innerHTML=D.departures.map(function(d){
      return '<div class="tt-dep"><div class="tt-when"><div class="d">'+d.d+'</div><div class="m">'+d.m+'</div></div>'
        +'<div class="dinfo"><div class="place">'+d.place+'</div><div class="guests">'+d.guests+'</div></div>'
        +'<div class="dstat"><span class="tt-badge '+d.stat+'">'+d.sl+'</span></div></div>';
    }).join('');
  }

  /* ---------- bookings chart (grouped bars) ---------- */
  function drawBookings(){
    var el=$('bk-chart'); if(!el) return;
    var W=660,H=230,L=34,R=14,T=14,B=34, d=D.trend, n=d.labels.length;
    var ymax=Math.max(5, Math.ceil(Math.max.apply(null,d.travel.concat(d.car))/5)*5), iw=W-L-R, ih=H-T-B, band=iw/n, bw=Math.min(24,band*0.5), gap=3;
    function y(v){ return T+ih-(v/ymax)*ih; }
    var g='';
    for(var t=0;t<=ymax;t+=ymax/4){ var yy=y(t); g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yy.toFixed(1)+'" y2="'+yy.toFixed(1)+'" stroke="#E2D9C7"/>'+'<text x="'+(L-8)+'" y="'+(yy+3.5).toFixed(1)+'" text-anchor="end" font-size="10" fill="#A99A84">'+t+'</text>'; }
    for(var i=0;i<n;i++){
      var cx=L+band*i+band/2, x1=cx-bw-gap/2, x2=cx+gap/2, tv=d.travel[i], cv=d.car[i];
      g+='<rect class="tt-bar" data-i="'+i+'" x="'+x1.toFixed(1)+'" y="'+y(tv).toFixed(1)+'" width="'+bw+'" height="'+(ih-(y(tv)-T)).toFixed(1)+'" rx="3" fill="#9D5636"/>';
      g+='<rect class="tt-bar" data-i="'+i+'" x="'+x2.toFixed(1)+'" y="'+y(cv).toFixed(1)+'" width="'+bw+'" height="'+(ih-(y(cv)-T)).toFixed(1)+'" rx="3" fill="#5F7A37"/>';
      g+='<text x="'+cx.toFixed(1)+'" y="'+(H-12)+'" text-anchor="middle" font-size="10" fill="#8C7C66">'+d.labels[i]+'</text>';
      g+='<rect class="tt-hz" data-i="'+i+'" x="'+(L+band*i).toFixed(1)+'" y="'+T+'" width="'+band.toFixed(1)+'" height="'+ih+'" fill="transparent"/>';
    }
    el.innerHTML=g;
    var wrap=$('bk-wrap'), tip=$('bk-tip');
    hoverBars(el,wrap,tip,function(i){ return '<b>'+d.labels[i]+'</b><br><span class="t">■</span> Travel '+d.travel[i]+'  <span class="c">■</span> Car '+d.car[i]; });
  }
  function drawRevenue(){
    var el=$('rev-chart'); if(!el) return;
    var W=360,H=190,L=30,R=10,T=12,B=30, d=D.revenue, n=d.labels.length;
    var ymax=Math.max(1, Math.ceil(Math.max.apply(null,d.gross))), iw=W-L-R, ih=H-T-B, band=iw/n, bw=Math.min(30,band*0.56);
    function y(v){ return T+ih-(v/ymax)*ih; }
    var g='';
    for(var t=0;t<=ymax;t+=ymax/3){ var yy=y(t); g+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yy.toFixed(1)+'" y2="'+yy.toFixed(1)+'" stroke="#E2D9C7"/>'+'<text x="'+(L-7)+'" y="'+(yy+3.5).toFixed(1)+'" text-anchor="end" font-size="9.5" fill="#A99A84">'+(Math.round(t*100)/100)+'L</text>'; }
    for(var i=0;i<n;i++){
      var cx=L+band*i+band/2, x=cx-bw/2, last=(i===n-1);
      g+='<rect class="tt-bar" data-i="'+i+'" x="'+x.toFixed(1)+'" y="'+y(d.gross[i]).toFixed(1)+'" width="'+bw+'" height="'+(ih-(y(d.gross[i])-T)).toFixed(1)+'" rx="3" fill="'+(last?'#9D5636':'#D9C9AE')+'"/>';
      g+='<text x="'+cx.toFixed(1)+'" y="'+(H-10)+'" text-anchor="middle" font-size="9.5" fill="#8C7C66">'+d.labels[i]+'</text>';
      g+='<rect class="tt-hz" data-i="'+i+'" x="'+(L+band*i).toFixed(1)+'" y="'+T+'" width="'+band.toFixed(1)+'" height="'+ih+'" fill="transparent"/>';
    }
    el.innerHTML=g;
    var wrap=$('rev-wrap'), tip=$('rev-tip');
    hoverBars(el,wrap,tip,function(i){ return '<b>'+d.labels[i]+'</b> &nbsp;₹'+d.gross[i].toFixed(2)+'L gross'; });
    $('rev-gross').textContent='₹'+d.gross[n-1].toFixed(2)+'L';
    $('rev-net').textContent='₹'+d.net.toFixed(1)+'L';
  }
  function hoverBars(el,wrap,tip,fmt){
    var zones=el.querySelectorAll('.tt-hz');
    for(var z=0;z<zones.length;z++){ (function(zone){
      zone.addEventListener('mousemove', function(e){
        var i=+zone.getAttribute('data-i'); var r=wrap.getBoundingClientRect();
        tip.style.left=(e.clientX-r.left)+'px'; tip.style.top='12px'; tip.innerHTML=fmt(i); tip.style.opacity='1';
        var bars=el.querySelectorAll('.tt-bar'); for(var b=0;b<bars.length;b++){ bars[b].style.opacity=(bars[b].getAttribute('data-i')==''+i)?'1':'0.35'; }
      });
      zone.addEventListener('mouseleave', function(){ tip.style.opacity='0'; var bars=el.querySelectorAll('.tt-bar'); for(var b=0;b<bars.length;b++){ bars[b].style.opacity='1'; } });
    })(zones[z]); }
  }

  /* ---------- nav / misc clicks ---------- */
  function wireNav(){
    var ns=root.querySelectorAll('[data-nav]');
    for(var i=0;i<ns.length;i++){ ns[i].addEventListener('click', function(){ go(this.getAttribute('data-nav')); }); }
    $('ac-mark').addEventListener('click', function(){ toast('Snoozed today’s alerts', false); });
  }
  function dateStr(){ var dt=new Date(), days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], mon=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return days[dt.getDay()]+', '+dt.getDate()+' '+mon[dt.getMonth()]; }

  /* ---------- init ---------- */
  try{
    var res = await Promise.all(['travel-bookings','car-bookings','cars','drivers','users','payments'].map(function(p){ return get(p); }));
    D = computeD({ travel:res[0].data, car:res[1].data, cars:res[2].data, drivers:res[3].data, users:res[4].data, payments:res[5].data });
    pendingTotal = D._pendingTotal; pendingCount = D._pendingCount;
  }catch(e){
    var _ld=$('tt-loader'); if(_ld) _ld.innerHTML='<div class="tt-loadtxt">Could not load — '+(e&&e.message||e)+'</div>';
    return;
  }
  buildPrimes();
  buildStats();
  $('lede').innerHTML = dateStr()+' · <b>'+D.actions.length+' items</b> need action · <b>'+money(pendingTotal)+'</b> pending across '+pendingCount+' bookings.';
  renderAC();
  buildActivity();
  buildDep();
  drawBookings();
  drawRevenue();
  wireNav();
  var _ld2=$('tt-loader'); if(_ld2) _ld2.style.display='none';
}

export function renderDashboard(main){
  main.innerHTML = DASH_MAIN;
  initDashboard();
}
