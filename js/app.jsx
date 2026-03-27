const { useState, useEffect, useCallback, useRef } = React;

// ═══════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════
function Toast({msg,err}) {
  return msg ? <div style={{position:'fixed',bottom:20,left:'50%',transform:'translateX(-50%)',
    background:'var(--d3)',border:`1px solid ${err?'var(--blood)':'var(--gold)'}`,
    color:err?'#FF8888':'var(--text)',padding:'10px 20px',borderRadius:3,fontFamily:'Cinzel,serif',
    fontSize:11,letterSpacing:'.05em',zIndex:300,whiteSpace:'nowrap',
    boxShadow:'0 4px 20px rgba(0,0,0,.8)'}}>{msg}</div> : null;
}

function Card({title,children}) {
  return <div style={S.card}><div style={S.cardTop}/>{title&&<div style={S.cardTitle}>{title}</div>}{children}</div>;
}

function ConfirmModal({title,body,onOk,onClose}) {
  return <div style={S.overlay}><div style={{...S.modalBox,maxWidth:340}}>
    <div style={{fontFamily:'Cinzel,serif',color:'var(--gold)',fontSize:14,marginBottom:10,letterSpacing:'.08em'}}>{title}</div>
    <div style={{color:'var(--steel)',fontSize:13,lineHeight:1.5}}>{body}</div>
    <div style={{display:'flex',gap:8,marginTop:14}}>
      <button style={{...S.btn('danger'),marginBottom:0,flex:1}} onClick={onOk}>Confirm</button>
      <button style={{...S.btn('gold'),marginBottom:0,flex:1}} onClick={onClose}>Cancel</button>
    </div>
  </div></div>;
}

function BPModal({table,onSave,onClose}) {
  const [rows,setRows]=useState(JSON.parse(JSON.stringify(table)));
  function upd(i,f,v){
    const n=rows.map((r,j)=>j===i?{...r,[f]:v}:r);
    if(f==='hi'&&i<n.length-1)n[i+1]={...n[i+1],lo:v};
    if(f==='lo'&&i>0)n[i-1]={...n[i-1],hi:v};
    setRows(n);
  }
  function addRow(){
    const last=rows[rows.length-1],prev=rows[rows.length-2];
    const mid=Math.round((prev.lo+last.lo)/2)||prev.lo+200;
    const nr=[...rows];nr[nr.length-2]={...nr[nr.length-2],hi:mid};
    nr.splice(nr.length-1,0,{lo:mid,hi:last.lo,w:16});setRows(nr);
  }
  function delRow(i){if(rows.length<=2)return;const nr=[...rows];if(i>0)nr[i-1]={...nr[i-1],hi:nr[i].hi};nr.splice(i,1);setRows(nr);}
  return <div style={S.overlay}><div style={S.modalBox}>
    <div style={{fontFamily:'Cinzel,serif',color:'var(--gold)',fontSize:14,marginBottom:8,letterSpacing:'.08em'}}>🎯 BP Conversion Table</div>
    <div style={{fontSize:12,color:'var(--steel)',marginBottom:10,lineHeight:1.5}}>VP diff → BP. Winner gets shown BP, loser gets 20 minus that.<br/>Win: BP&gt;10 · Draw: BP=10 · Loss: BP&lt;10</div>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
        <thead><tr>
          {['VP ≥','VP <','Win BP','Loss BP',''].map((h,i)=><th key={i} style={{fontFamily:'Cinzel,serif',fontSize:10,color:'var(--gold)',padding:'6px 4px',borderBottom:'1px solid rgba(201,168,76,.3)',textAlign:'center',letterSpacing:'.05em'}}>{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((row,i)=>(
          <tr key={i}>
            <td style={{padding:'3px',textAlign:'center'}}><input style={{width:58,background:'var(--d3)',border:'1px solid rgba(201,168,76,.28)',borderRadius:3,color:'var(--text)',fontSize:13,padding:'5px 4px',outline:'none',textAlign:'center'}} type="number" value={row.lo} readOnly={i===0} onChange={e=>upd(i,'lo',+e.target.value)}/></td>
            <td style={{padding:'3px',textAlign:'center'}}><input style={{width:58,background:'var(--d3)',border:'1px solid rgba(201,168,76,.28)',borderRadius:3,color:'var(--text)',fontSize:13,padding:'5px 4px',outline:'none',textAlign:'center'}} type="number" value={row.hi>=99999?'':row.hi} placeholder="∞" readOnly={i===rows.length-1} onChange={e=>upd(i,'hi',e.target.value===''?99999:+e.target.value)}/></td>
            <td style={{padding:'3px',textAlign:'center'}}><input style={{width:52,background:'var(--d3)',border:'1px solid rgba(201,168,76,.28)',borderRadius:3,color:'var(--text)',fontSize:13,padding:'5px 4px',outline:'none',textAlign:'center'}} type="number" min="10" max="20" value={row.w} onChange={e=>upd(i,'w',+e.target.value)}/></td>
            <td style={{padding:'3px',textAlign:'center',fontFamily:'Cinzel,serif',fontSize:12,color:row.w===10?'var(--draw)':'var(--loss)'}}>{20-row.w}</td>
            <td style={{padding:'3px',textAlign:'center'}}>{i>0&&i<rows.length-1&&<button onClick={()=>delRow(i)} style={{background:'none',border:'none',color:'#FF6666',cursor:'pointer',fontSize:14,padding:'2px 6px'}}>✕</button>}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
    <button onClick={addRow} style={{...S.btn('outline',true),marginTop:8,fontSize:11}}>+ Add Row</button>
    <div style={{display:'flex',gap:8,marginTop:14}}>
      <button style={{...S.btn('red'),marginBottom:0,flex:1}} onClick={()=>onSave(rows)}>✓ Save</button>
      <button style={{...S.btn('outline'),marginBottom:0,flex:1}} onClick={()=>setRows(JSON.parse(JSON.stringify(DEFAULT_BP)))}>↺ Defaults</button>
      <button style={{...S.btn('danger'),marginBottom:0,flex:1}} onClick={onClose}>Cancel</button>
    </div>
  </div></div>;
}

function QRModal({url, onClose}) {
  const qrRef = useRef();
  useEffect(()=>{
    if (qrRef.current && window.QRCode) {
      qrRef.current.innerHTML = '';
      new window.QRCode(qrRef.current, {
        text: url, width: 220, height: 220,
        colorDark:'#C9A84C', colorLight:'#1A1410',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    }
  },[url]);
  return <div style={S.overlay} onClick={onClose}>
    <div style={{...S.modalBox,maxWidth:300,textAlign:'center'}} onClick={e=>e.stopPropagation()}>
      <div style={{fontFamily:'Cinzel,serif',color:'var(--gold)',fontSize:14,marginBottom:4,letterSpacing:'.08em'}}>📡 Live Standings</div>
      <div style={{fontSize:12,color:'var(--steel)',marginBottom:16,lineHeight:1.5}}>
        Pelaajat skannaavat tämän — näkevät live-sijoitukset
      </div>
      <div ref={qrRef} style={{display:'inline-block',padding:12,background:'var(--d3)',borderRadius:6,border:'1px solid rgba(201,168,76,.3)'}}/>
      <div style={{fontSize:11,color:'var(--steel)',marginTop:12,wordBreak:'break-all',lineHeight:1.4}}>{url}</div>
      <button style={{...S.btn('gold'),marginTop:14,marginBottom:0}} onClick={()=>navigator.clipboard?.writeText(url).then(()=>{})}>Copy Link</button>
      <button style={{...S.btn('outline'),marginBottom:0,marginTop:8}} onClick={onClose}>Close</button>
    </div>
  </div>;
}

function SaveModal({adminUrl, onClose}) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(adminUrl).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  }
  return <div style={S.overlay} onClick={onClose}>
    <div style={{...S.modalBox,maxWidth:320}} onClick={e=>e.stopPropagation()}>
      <div style={{fontFamily:'Cinzel,serif',color:'var(--gold)',fontSize:14,marginBottom:6,letterSpacing:'.08em'}}>💾 Tallenna turnaus</div>
      <div style={{fontSize:12,color:'var(--steel)',marginBottom:16,lineHeight:1.6}}>
        Kopioi tämä linkki — avaa se toisella koneella tai selaimella jatkaaksesi hallintaa.
      </div>
      <div style={{background:'var(--d3)',border:'1px solid rgba(201,168,76,.25)',borderRadius:3,
        padding:'10px 12px',fontSize:11,color:'var(--steel)',wordBreak:'break-all',
        lineHeight:1.5,marginBottom:12}}>
        {adminUrl}
      </div>
      <button style={{...S.btn('gold'),marginBottom:8}} onClick={copy}>
        {copied ? '✓ Kopioitu!' : '📋 Kopioi linkki'}
      </button>
      <button style={{...S.btn('outline'),marginBottom:0}} onClick={onClose}>Sulje</button>
    </div>
  </div>;
}

// ═══════════════════════════════════
//  STANDINGS TABLE (shared component)
// ═══════════════════════════════════
function StandingsTable({standings, round, live=false}) {
  const rankColor = i => i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'var(--steel)';
  return <>
    {live && <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:'var(--win)',boxShadow:'0 0 6px var(--win)'}}/>
      <span style={{fontSize:11,color:'var(--steel)',fontFamily:'Cinzel,serif',letterSpacing:'.06em'}}>LIVE · Round {round}</span>
    </div>}
    <table style={S.stTable}>
      <thead><tr>
        <th style={S.stTh}>#</th>
        <th style={S.stTh}>Player</th>
        <th style={{...S.stTh,textAlign:'center'}}>W/D/L</th>
        <th style={{...S.stTh,textAlign:'right'}}>BP</th>
        <th style={{...S.stTh,textAlign:'right'}}>VP</th>
        <th style={{...S.stTh,textAlign:'right'}}>SoS</th>
      </tr></thead>
      <tbody>{standings.map((p,i)=>(
        <tr key={p.id}>
          <td style={{...S.stTd,fontFamily:'Cinzel,serif',fontWeight:700,color:rankColor(i)}}>{i+1}</td>
          <td style={S.stTd}>{p.name}{p.dropped&&<span style={{color:'#555',fontSize:10}}> (D)</span>}</td>
          <td style={{...S.stTd,textAlign:'center'}}>
            <span style={{color:'var(--win)'}}>{p.rec.w}</span>/
            <span style={{color:'var(--draw)'}}>{p.rec.d}</span>/
            <span style={{color:'var(--loss)'}}>{p.rec.l}</span>
          </td>
          <td style={{...S.stTd,color:'var(--gold)',fontWeight:600,textAlign:'right'}}>{p.bp}</td>
          <td style={{...S.stTd,color:'var(--steel)',fontSize:12,textAlign:'right'}}>{p.vp.toLocaleString()}</td>
          <td style={{...S.stTd,color:'var(--steel)',fontSize:12,textAlign:'right'}}>{p.sos}</td>
        </tr>
      ))}</tbody>
    </table>
    <div style={{marginTop:8,fontSize:11,color:'var(--steel)',lineHeight:1.8}}>
      <strong style={{color:'var(--gold)'}}>SoS</strong> = Strength of Schedule (vastustajien yhteispisteet)<br/>
      <strong style={{color:'var(--gold)'}}>Tiebreakers:</strong> BP → VP → H2H → SoS
    </div>
  </>;
}

// ═══════════════════════════════════
//  VIEWER SCREEN (read-only live)
// ═══════════════════════════════════
function ViewerRoundCard({roundScenarios, currentRound}) {
  const [expanded, setExpanded] = useState(null);

  return <div style={{marginBottom:12}}>
    {/* All rounds list */}
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      {(roundScenarios||[]).map((rs,i)=>{
        const rn = i+1;
        const sc = SCENARIOS.find(s=>s.id===rs.scenario);
        if(!sc) return null;
        const isCur = rn===currentRound;
        const isPast = rn<currentRound;
        const isFuture = rn>currentRound;
        const reqSec=(sc.secRequired||[]).map(k=>SEC_OBJ[k]).filter(Boolean);
        const optSec=Object.entries(rs.secObjs||{}).filter(([,v])=>v).map(([k])=>SEC_OBJ[k]).filter(Boolean);
        const allSec=[...new Map([...reqSec,...optSec].map(o=>[o.name,o])).values()];
        const isOpen = expanded===rn || isCur;

        return <div key={i}
          style={{background:'var(--d2)',
            border:`1px solid ${isCur?'var(--gold)':isPast?'rgba(201,168,76,.12)':'rgba(201,168,76,.2)'}`,
            borderRadius:4,overflow:'hidden',opacity:isFuture?.7:1}}>

          {/* Row header — clickable */}
          <div onClick={()=>setExpanded(isOpen&&!isCur?null:rn)}
            style={{display:'flex',gap:0,cursor:'pointer',alignItems:'stretch'}}>
            <div style={{width:70,flexShrink:0}}>
              <img src={SCENARIO_MAPS[sc.id]} alt={sc.name}
                style={{width:'100%',display:'block',opacity:isFuture?.5:isPast?.65:1}}/>
            </div>
            <div style={{padding:'8px 10px',flex:1,minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                {isCur&&<span style={{width:7,height:7,borderRadius:'50%',background:'var(--win)',
                  boxShadow:'0 0 5px var(--win)',flexShrink:0,display:'inline-block'}}/>}
                {isPast&&<span style={{fontSize:11,color:'var(--steel)'}}>✓</span>}
                <span style={{fontFamily:'Cinzel,serif',fontSize:11,
                  color:isCur?'var(--gold)':isPast?'var(--steel)':'var(--text)',
                  letterSpacing:'.05em'}}>
                  Round {rn}{isCur?' — NOW PLAYING':''}
                </span>
              </div>
              <div style={{fontSize:12,color:isCur?'var(--text)':'var(--steel)',
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {sc.name}
              </div>
              {allSec.length>0&&<div style={{fontSize:10,color:'var(--steel)',marginTop:2,
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {allSec.map(o=>o.icon+' '+o.name).join(' · ')}
              </div>}
            </div>
            <div style={{padding:'0 10px',display:'flex',alignItems:'center',
              color:'var(--steel)',fontSize:12,flexShrink:0}}>
              {isOpen?'▲':'▼'}
            </div>
          </div>

          {/* Expanded detail */}
          {isOpen&&<div style={{borderTop:`1px solid ${isCur?'rgba(201,168,76,.3)':'rgba(201,168,76,.1)'}`,
            padding:'12px 14px',background:'var(--d3)'}}>

            {/* Map full size */}
            <img src={SCENARIO_MAPS[sc.id]} alt={sc.name}
              style={{width:'100%',borderRadius:3,display:'block',marginBottom:10}}/>

            <div style={{fontFamily:'Cinzel,serif',fontSize:13,color:'var(--gold)',
              marginBottom:4,letterSpacing:'.06em'}}>{sc.id}. {sc.name}</div>
            <div style={{fontSize:12,color:'var(--steel)',lineHeight:1.6,marginBottom:6}}>{sc.desc}</div>
            {sc.special!=='No special rules.'&&
              <div style={{fontSize:12,color:'#E0D0B0',lineHeight:1.5,marginBottom:6,
                background:'rgba(201,168,76,.05)',border:'1px solid rgba(201,168,76,.15)',
                borderRadius:3,padding:'8px 10px'}}>
                ⚡ {sc.special}
              </div>}
            <div style={{fontSize:11,color:'var(--steel)',marginBottom:allSec.length?12:0}}>
              ⏱ {sc.gameLength}
            </div>

            {/* Secondary objectives */}
            {allSec.length>0&&<>
              <div style={{fontFamily:'Cinzel,serif',fontSize:10,color:'var(--gold)',
                letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>
                Secondary Objectives
              </div>
              {allSec.map(obj=>{
                const objKey=Object.keys(SEC_OBJ).find(k=>SEC_OBJ[k]===obj);
                const objMap=OBJECTIVE_MAPS[objKey];
                return <div key={obj.name} style={{marginBottom:10}}>
                  <div style={{display:'flex',gap:8,padding:'8px 10px',
                    background:'rgba(201,168,76,.06)',border:'1px solid rgba(201,168,76,.18)',
                    borderRadius:3,marginBottom:objMap?6:0}}>
                    <span style={{fontSize:16,flexShrink:0}}>{obj.icon}</span>
                    <div>
                      <div style={{fontFamily:'Cinzel,serif',fontSize:11,color:'var(--gold)',marginBottom:2}}>{obj.name}</div>
                      <div style={{fontSize:11,color:'var(--steel)',lineHeight:1.4}}>{obj.desc}</div>
                    </div>
                  </div>
                  {objMap&&<img src={objMap} alt={obj.name}
                    style={{width:'100%',borderRadius:3,display:'block'}}/>}
                </div>;
              })}
            </>}
          </div>}
        </div>;
      })}
    </div>
  </div>;
}

function ViewerScreen({tourneyId}) {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [tab, setTab] = useState('standings');

  useEffect(()=>{
    fbOn(`tournaments/${tourneyId}`, val => {
      if (val) { setData(val); setConnected(true); }
    });
  },[tourneyId]);

  if (!connected) return (
    <div style={{minHeight:'100vh',background:'var(--dark)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
      <div style={{fontFamily:'Cinzel,serif',color:'var(--gold)',fontSize:14,letterSpacing:'.1em'}}>Connecting…</div>
      <div style={{fontSize:12,color:'var(--steel)'}}>Ladataan sijoituksia</div>
    </div>
  );
  if (!data || !data.players) return (
    <div style={{minHeight:'100vh',background:'var(--dark)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontFamily:'Cinzel,serif',color:'var(--steel)',fontSize:13}}>No tournament data.</div>
    </div>
  );

  const standings = calcStandings(data.players, data.matches||[], data.config?.bpTable||DEFAULT_BP);
  const round = data.round||0;
  const cfg = data.config||{};
  const tabs = [{k:'standings',label:'🏆 Standings'},{k:'rounds',label:'🗺 Rounds'}];

  return (
    <div style={{minHeight:'100vh',background:'var(--dark)',backgroundImage:'radial-gradient(ellipse at 20% 0%,rgba(139,0,0,.12) 0%,transparent 50%)'}}>
      <div style={S.hdr}>
        <div style={S.h1}>{cfg.name||'Tournament'}</div>
        <div style={S.hsub}>
          Round {round}/{cfg.rounds||'?'} &nbsp;·&nbsp;
          <span style={{color:'var(--win)'}}>● LIVE</span>
        </div>
      </div>
      <div style={S.nav}>
        {tabs.map(t=><button key={t.k} style={S.navBtn(tab===t.k)} onClick={()=>setTab(t.k)}>{t.label}</button>)}
      </div>
      <div style={S.page}>
        {tab==='standings'&&<Card title="🏆 Standings">
          <StandingsTable standings={standings} round={round} live={true}/>
        </Card>}
        {tab==='rounds'&&<Card title="🗺 Scenarios & Rules">
          <ViewerRoundCard
            roundScenarios={cfg.roundScenarios}
            currentRound={round}
          />
        </Card>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════
//  SCENARIO COMPONENTS
// ═══════════════════════════════════
function ScenarioMap({id, style={}}) {
  const src = SCENARIO_MAPS[id];
  if (!src) return null;
  return <img src={src} alt={'Scenario '+id}
    style={{width:'100%',display:'block',...style}}/>;
}

function ScenarioPicker({value, onChange}) {
  const [expanded, setExpanded] = useState(value);
  const sel = SCENARIOS.find(s=>s.id===value);

  return <div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
      {SCENARIOS.map(s=>(
        <div key={s.id}
          onClick={()=>{onChange(s.id);setExpanded(s.id);}}
          style={{borderRadius:4,overflow:'hidden',cursor:'pointer',position:'relative',
            border:`2px solid ${value===s.id?'var(--gold)':'rgba(201,168,76,.18)'}`,
            boxShadow:value===s.id?'0 0 12px rgba(201,168,76,.3)':'none',
            transition:'all .2s'}}>
          <ScenarioMap id={s.id} style={{opacity:value===s.id?1:.65}}/>
          <div style={{padding:'6px 8px',background:value===s.id?'rgba(201,168,76,.12)':'var(--d3)'}}>
            <div style={{fontFamily:'Cinzel,serif',fontSize:10,color:value===s.id?'var(--gold)':'var(--steel)',
              letterSpacing:'.06em',lineHeight:1.3}}>
              {s.id}. {s.name}
            </div>
          </div>
          {value===s.id&&<div style={{position:'absolute',top:4,right:4,background:'var(--gold)',
            borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',
            justifyContent:'center',fontFamily:'Cinzel,serif',fontSize:11,color:'var(--dark)',fontWeight:700}}>✓</div>}
        </div>
      ))}
    </div>
    {sel&&<div style={{background:'var(--d3)',border:'1px solid rgba(201,168,76,.2)',borderRadius:3,padding:'10px 12px',fontSize:12,color:'var(--steel)',lineHeight:1.6}}>
      <div style={{fontFamily:'Cinzel,serif',fontSize:11,color:'var(--gold)',marginBottom:4,letterSpacing:'.06em'}}>{sel.name}</div>
      <div style={{marginBottom:4}}>{sel.desc}</div>
      {sel.special!=='No special rules.'&&<div style={{color:'var(--p2)',marginBottom:4}}>⚡ {sel.special}</div>}
      <div style={{fontSize:11}}>⏱ {sel.gameLength}</div>
    </div>}
  </div>;
}

function SecObjPicker({scenario, value, onChange}) {
  const sc = SCENARIOS.find(s=>s.id===scenario);
  const required = sc?.secRequired || [];
  const allowed  = sc?.secAllowed  || [];
  const allKeys  = [...new Set([...required,...allowed])];

  useEffect(()=>{
    if (!sc) return;
    const newVal = {...value};
    required.forEach(k=>{ newVal[k]=true; });
    onChange(newVal);
  },[scenario]);

  if (!sc) return null;

  return <div style={{display:'flex',flexDirection:'column',gap:6}}>
    {allKeys.map(k=>{
      const obj = SEC_OBJ[k];
      if (!obj) return null;
      const isReq = required.includes(k);
      const isOn  = value[k]||isReq;
      return <div key={k}
        onClick={()=>{ if(isReq)return; onChange({...value,[k]:!value[k]}); }}
        style={{display:'flex',gap:10,padding:'9px 12px',borderRadius:3,
          cursor:isReq?'default':'pointer',
          background:isOn?'rgba(201,168,76,.07)':'var(--d3)',
          border:`1px solid ${isOn?'var(--gold)':'rgba(201,168,76,.18)'}`}}>
        <div style={{width:20,height:20,borderRadius:3,flexShrink:0,marginTop:1,
          border:`2px solid ${isOn?'var(--gold)':'var(--steel)'}`,
          background:isOn?'var(--gold)':'transparent',
          display:'flex',alignItems:'center',justifyContent:'center'}}>
          {isOn&&<span style={{color:'var(--dark)',fontSize:12,fontWeight:700}}>✓</span>}
        </div>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:2}}>
            <span style={{fontSize:14}}>{obj.icon}</span>
            <span style={{fontFamily:'Cinzel,serif',fontSize:11,color:isOn?'var(--gold)':'var(--steel)',letterSpacing:'.06em'}}>{obj.name}</span>
            {isReq&&<span style={{fontSize:9,color:'var(--blood)',fontFamily:'Cinzel,serif',letterSpacing:'.05em',border:'1px solid rgba(139,0,0,.4)',padding:'1px 5px',borderRadius:2}}>REQUIRED</span>}
          </div>
          <div style={{fontSize:11,color:'var(--steel)',lineHeight:1.4}}>{obj.desc}</div>
        </div>
      </div>;
    })}
  </div>;
}

// ═══════════════════════════════════
//  ROUND SCENARIOS PANEL (collapsible)
// ═══════════════════════════════════
function RoundScenariosPanel({config, curRd}) {
  const [open, setOpen] = useState(false);
  const allRounds = config.roundScenarios||[];
  return <div style={{marginBottom:12}}>
    <button style={{...S.btn('outline'),marginBottom:0,padding:'8px 14px',
      fontSize:11,letterSpacing:'.06em'}}
      onClick={()=>setOpen(v=>!v)}>
      🗺 {open?'Hide':'Show'} Scenarios All Rounds
    </button>
    {open&&<div style={{marginTop:8,display:'flex',flexDirection:'column',gap:8}}>
      {allRounds.map((rs,i)=>{
        const sc=SCENARIOS.find(s=>s.id===rs.scenario);
        if(!sc)return null;
        const isCur=i+1===curRd.round;
        const isPast=i+1<curRd.round;
        const reqSec=(sc.secRequired||[]).map(k=>SEC_OBJ[k]).filter(Boolean);
        const optSec=Object.entries(rs.secObjs||{}).filter(([,v])=>v).map(([k])=>SEC_OBJ[k]).filter(Boolean);
        const allSec=[...new Map([...reqSec,...optSec].map(o=>[o.name,o])).values()];
        return <div key={i} style={{background:'var(--d3)',
          border:`1px solid ${isCur?'var(--gold)':isPast?'rgba(201,168,76,.1)':'rgba(201,168,76,.2)'}`,
          borderRadius:4,overflow:'hidden',opacity:isPast?.65:1}}>
          <div style={{display:'flex',gap:0}}>
            <div style={{width:80,flexShrink:0}}>
              <ScenarioMap id={sc.id}/>
            </div>
            <div style={{padding:'8px 10px',flex:1}}>
              <div style={{fontFamily:'Cinzel,serif',fontSize:11,
                color:isCur?'var(--gold)':'var(--steel)',
                letterSpacing:'.05em',marginBottom:3}}>
                {isCur&&<span style={{color:'var(--win)'}}>● </span>}
                Round {i+1} · {sc.name}
              </div>
              {sc.special!=='No special rules.'&&
                <div style={{fontSize:10,color:'#E0D0B0',lineHeight:1.4,marginBottom:3}}>
                  ⚡ {sc.special}
                </div>}
              {allSec.length>0&&<div style={{fontSize:10,color:'var(--steel)',lineHeight:1.4}}>
                {allSec.map(o=>o.icon+' '+o.name).join(' · ')}
              </div>}
            </div>
          </div>
          {isCur&&allSec.length>0&&<div style={{padding:'6px 10px 8px',
            borderTop:'1px solid rgba(201,168,76,.1)'}}>
            {allSec.map(obj=>{
              const objMap=OBJECTIVE_MAPS[Object.keys(SEC_OBJ).find(k=>SEC_OBJ[k]===obj)];
              return <div key={obj.name} style={{marginBottom:8}}>
                <div style={{display:'flex',gap:6,fontSize:11,marginBottom:objMap?6:0}}>
                  <span>{obj.icon}</span>
                  <div>
                    <span style={{color:'var(--gold)',fontFamily:'Cinzel,serif',fontSize:10}}>
                      {obj.name}
                    </span>
                    <span style={{color:'var(--steel)'}}> — {obj.desc}</span>
                  </div>
                </div>
                {objMap&&<img src={objMap} alt={obj.name}
                  style={{width:'100%',borderRadius:3,display:'block'}}/>}
              </div>;
            })}
          </div>}
        </div>;
      })}
    </div>}
  </div>;
}

// ═══════════════════════════════════
//  ROUND SCENARIO SETUP MODAL
// ═══════════════════════════════════
function RoundScenarioModal({roundNum, initial, onSave, onClose}) {
  const [scenario, setScenario] = useState(initial?.scenario||1);
  const [secObjs,  setSecObjs]  = useState(initial?.secObjs||{});
  const sc = SCENARIOS.find(s=>s.id===scenario);

  return <div style={S.overlay}>
    <div style={{...S.modalBox, maxWidth:480}}>
      <div style={{fontFamily:'Cinzel,serif',color:'var(--gold)',fontSize:14,marginBottom:14,letterSpacing:'.08em'}}>
        ⚔ Round {roundNum} — Scenario & Objectives
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:12}}>
        {SCENARIOS.map(s=>(
          <div key={s.id} onClick={()=>setScenario(s.id)}
            style={{borderRadius:3,overflow:'hidden',cursor:'pointer',
              border:`2px solid ${scenario===s.id?'var(--gold)':'rgba(201,168,76,.15)'}`,
              opacity:scenario===s.id?1:.65, transition:'all .2s'}}>
            <ScenarioMap id={s.id}/>
            <div style={{padding:'4px 6px',background:scenario===s.id?'rgba(201,168,76,.12)':'var(--d3)',
              fontSize:9,fontFamily:'Cinzel,serif',
              color:scenario===s.id?'var(--gold)':'var(--steel)',lineHeight:1.3}}>
              {s.id}. {s.name}
            </div>
          </div>
        ))}
      </div>

      {sc&&<div style={{background:'var(--d3)',border:'1px solid rgba(201,168,76,.2)',
        borderRadius:3,padding:'10px 12px',marginBottom:12,fontSize:12}}>
        <div style={{fontFamily:'Cinzel,serif',fontSize:12,color:'var(--gold)',marginBottom:4}}>{sc.name}</div>
        <div style={{color:'var(--steel)',lineHeight:1.5,marginBottom:sc.special!=='No special rules.'?4:0}}>{sc.desc}</div>
        {sc.special!=='No special rules.'&&<div style={{color:'#E0D0B0',lineHeight:1.5,marginBottom:4}}>⚡ {sc.special}</div>}
        <div style={{fontSize:11,color:'var(--steel)',marginBottom:8}}>⏱ {sc.gameLength}</div>
        <ScenarioMap id={sc.id} style={{borderRadius:3,marginBottom:8}}/>
        {[...sc.secRequired,...(secObjs?Object.entries(secObjs).filter(([,v])=>v).map(([k])=>k):[])].map(k=>{
          const objMap=OBJECTIVE_MAPS[k];
          if(!objMap)return null;
          const obj=SEC_OBJ[k];
          return <div key={k} style={{marginTop:6}}>
            <div style={{fontSize:10,color:'var(--gold)',fontFamily:'Cinzel,serif',
              letterSpacing:'.06em',marginBottom:4}}>📍 {obj?.name} — placement</div>
            <img src={objMap} alt={obj?.name}
              style={{width:'100%',borderRadius:3,display:'block'}}/>
          </div>;
        })}
      </div>}

      <div style={{fontFamily:'Cinzel,serif',fontSize:10,color:'var(--gold)',
        letterSpacing:'.08em',textTransform:'uppercase',marginBottom:8}}>
        Secondary Objectives
      </div>
      <SecObjPicker scenario={scenario} value={secObjs} onChange={setSecObjs}/>

      <div style={{display:'flex',gap:8,marginTop:14}}>
        <button style={{...S.btn('red'),marginBottom:0,flex:1}}
          onClick={()=>onSave({scenario,secObjs,scenarioName:sc?.name})}>
          ✓ Save Round {roundNum}
        </button>
        <button style={{...S.btn('outline'),marginBottom:0,flex:1}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>;
}

// ═══════════════════════════════════
//  START SCREEN
// ═══════════════════════════════════
function StartScreen({onStart}) {
  const [name,    setName]    = useState('Warhammer: The Old World');
  const [rounds,  setRounds]  = useState(5);
  const [tables,  setTables]  = useState(5);
  const [scoring, setScoring] = useState('tow');
  const [bpTable, setBpTable] = useState(JSON.parse(JSON.stringify(DEFAULT_BP)));
  const [showBP,  setShowBP]  = useState(false);
  const [roundScenarios, setRoundScenarios] = useState([]);
  const [editingRound,   setEditingRound]   = useState(null);

  useEffect(()=>{
    setRoundScenarios(prev=>{
      const next=[];
      for(let i=0;i<rounds;i++) next.push(prev[i]||{scenario:1,secObjs:{},scenarioName:'Upon the Field of Glory'});
      return next;
    });
  },[rounds]);

  const drawRow  = bpTable.find(r=>r.w===10);
  const maxRow   = [...bpTable].sort((a,b)=>b.w-a.w)[0];
  const drawUpto = drawRow?(drawRow.hi>=99999?'∞':drawRow.hi):'–';

  function saveRound(rn, data) {
    setRoundScenarios(prev=>prev.map((r,i)=>i===rn-1?data:r));
    setEditingRound(null);
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--dark)',
      backgroundImage:'radial-gradient(ellipse at 20% 10%,rgba(139,0,0,.18) 0%,transparent 55%)'}}>

      {showBP&&<BPModal table={bpTable}
        onSave={t=>{setBpTable(t);setShowBP(false);}}
        onClose={()=>setShowBP(false)}/>}

      {editingRound&&<RoundScenarioModal
        roundNum={editingRound}
        initial={roundScenarios[editingRound-1]}
        onSave={d=>saveRound(editingRound,d)}
        onClose={()=>setEditingRound(null)}/>}

      <div style={{textAlign:'center',padding:'40px 20px 28px',borderBottom:'1px solid rgba(201,168,76,.2)'}}>
        <div style={{fontSize:32,marginBottom:8}}>⚔</div>
        <h1 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(20px,7vw,32px)',fontWeight:900,
          color:'var(--gold)',letterSpacing:'.12em',
          textShadow:'0 0 30px rgba(201,168,76,.5)',lineHeight:1.1,margin:0}}>WARHAMMER</h1>
        <div style={{fontFamily:'Cinzel,serif',fontSize:'clamp(11px,3vw,14px)',color:'var(--steel)',
          letterSpacing:'.25em',textTransform:'uppercase',marginTop:4}}>
          Tournament Organiser
        </div>
      </div>

      <div style={{padding:'20px 16px',maxWidth:480,margin:'0 auto'}}>

        <Card title="⚙ Tournament Setup">
          <label style={S.label}>Tournament Name</label>
          <input style={S.input} value={name}
            onChange={e=>setName(e.target.value)} placeholder="Tournament name…"/>
          <div style={{display:'flex',gap:10}}>
            <div style={{flex:1}}><label style={S.label}>Rounds</label>
              <select style={S.select} value={rounds}
                onChange={e=>setRounds(+e.target.value)}>
                {[3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div style={{flex:1}}><label style={S.label}>Tables</label>
              <input style={S.input} type="number" min="1" max="60" value={tables}
                onChange={e=>setTables(+e.target.value||1)}/>
            </div>
          </div>
        </Card>

        <Card title="🗺 Scenarios — one per round">
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {roundScenarios.map((rs,i)=>{
              const sc=SCENARIOS.find(s=>s.id===rs.scenario);
              const secList=Object.entries(rs.secObjs||{})
                .filter(([,v])=>v).map(([k])=>SEC_OBJ[k]?.name).filter(Boolean);
              const reqList=(sc?.secRequired||[]).map(k=>SEC_OBJ[k]?.name).filter(Boolean);
              const allSec=[...new Set([...reqList,...secList])];
              return (
                <div key={i}
                  style={{display:'flex',gap:10,alignItems:'center',padding:'9px 12px',
                    background:'var(--d3)',border:'1px solid rgba(201,168,76,.18)',borderRadius:3}}>
                  <div style={{width:52,flexShrink:0,borderRadius:2,overflow:'hidden'}}>
                    <ScenarioMap id={sc?.id}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:'Cinzel,serif',fontSize:11,color:'var(--gold)',
                      letterSpacing:'.05em',marginBottom:2}}>
                      Round {i+1} · {sc?.name}
                    </div>
                    <div style={{fontSize:11,color:'var(--steel)',lineHeight:1.3,
                      whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                      {allSec.length?allSec.join(' · '):'No secondary objectives'}
                    </div>
                  </div>
                  <button style={{...S.btn('outline',true),fontSize:10,flexShrink:0}}
                    onClick={()=>setEditingRound(i+1)}>
                    Edit
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="📊 Scoring">
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
            {[{k:'tow',  label:'VP Table (0–20 BP)',   sub:'Enter raw VP → auto BP via conversion table'},
              {k:'simple',label:'Simple W/D/L',         sub:'Win=20BP · Draw=10BP · Loss=0BP'}
            ].map(opt=>(
              <div key={opt.k} onClick={()=>setScoring(opt.k)}
                style={{display:'flex',gap:10,padding:'10px 12px',cursor:'pointer',borderRadius:3,
                  border:`1px solid ${scoring===opt.k?'var(--gold)':'rgba(201,168,76,.18)'}`,
                  background:scoring===opt.k?'rgba(201,168,76,.07)':'var(--d3)'}}>
                <div style={{width:16,height:16,borderRadius:'50%',flexShrink:0,marginTop:2,
                  border:`2px solid ${scoring===opt.k?'var(--gold)':'var(--steel)'}`,
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {scoring===opt.k&&<div style={{width:8,height:8,borderRadius:'50%',background:'var(--gold)'}}/>}
                </div>
                <div>
                  <div style={{fontFamily:'Cinzel,serif',fontSize:12,color:'var(--gold)',marginBottom:2}}>{opt.label}</div>
                  <div style={{fontSize:12,color:'var(--steel)'}}>{opt.sub}</div>
                </div>
              </div>
            ))}
          </div>
          {scoring==='tow'&&<div style={{background:'var(--d3)',border:'1px solid rgba(201,168,76,.15)',
            borderRadius:3,padding:'10px 12px',marginBottom:4}}>
            <div style={{fontSize:12,color:'var(--steel)',lineHeight:1.8}}>
              Draw when VP diff &lt; <strong style={{color:'var(--gold)'}}>{drawUpto}</strong><br/>
              Max win: <strong style={{color:'var(--gold)'}}>{maxRow.w}–{20-maxRow.w}</strong> BP
              &nbsp;≥ <strong style={{color:'var(--gold)'}}>{maxRow.lo}</strong> diff
            </div>
            <button style={{...S.btn('outline',true),marginTop:8,fontSize:11}}
              onClick={()=>setShowBP(true)}>✎ Edit BP Table</button>
          </div>}
        </Card>

        <button
          style={{...S.btn('red'),fontSize:14,padding:'14px 20px',
            letterSpacing:'.12em',boxShadow:'0 4px 20px rgba(139,0,0,.5)'}}
          onClick={()=>{
            if(!name.trim())return;
            onStart({
              name:name.trim(),rounds,tables,scoring,
              bpTable:scoring==='tow'?bpTable:DEFAULT_BP,
              roundScenarios,
            });
          }}>
          ⚔ Start Tournament
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
//  EXPORT MODAL
// ═══════════════════════════════════
function ExportModal({onClose, standings, matches, config, players}) {
  function exportCSV() {
    const lines = [
      ['Sija','Pelaaja','BP','VP','V','T','H','SOS'].join(','),
      ...standings.map((p,i)=>[
        i+1, `"${p.name}"`, p.bp, p.vp, p.rec.w, p.rec.d, p.rec.l, p.sos
      ].join(','))
    ];
    lines.push('');
    lines.push(['Kierros','Pöytä','Pelaaja 1','VP1','BP1','Pelaaja 2','VP2','BP2'].join(','));
    matches.forEach(rd=>{
      rd.pairs.forEach(p=>{
        const pl1=players.find(x=>x.id===p.p1);
        const pl2=players.find(x=>x.id===p.p2);
        if(p.bye){lines.push([rd.round,'','','BYE',`"${pl1?.name||''}"`,20,'',''].join(','));return;}
        if(p.vp1==null){lines.push([rd.round,p.table,`"${pl1?.name||''}"`,'-','-',`"${pl2?.name||''}"`,'-','-'].join(','));return;}
        const c=calcBP(p.vp1,p.vp2,config.bpTable);
        lines.push([rd.round,p.table,`"${pl1?.name||''}"`,p.vp1,c.bp1,`"${pl2?.name||''}"`,p.vp2,c.bp2].join(','));
      });
    });
    const blob=new Blob(['\uFEFF'+lines.join('\n')],{type:'text/csv;charset=utf-8'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`${config.name.replace(/\s+/g,'-')}-tulokset.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportPDF() {
    const rows=standings.map((p,i)=>`
      <tr>
        <td>${i+1}</td><td>${p.name}</td><td><strong>${p.bp}</strong></td>
        <td>${p.vp.toLocaleString()}</td>
        <td>${p.rec.w}–${p.rec.d}–${p.rec.l}</td><td>${p.sos}</td>
      </tr>`).join('');
    const rdRows=[...matches].reverse().map(rd=>{
      const pairs=rd.pairs.map(p=>{
        const pl1=players.find(x=>x.id===p.p1),pl2=players.find(x=>x.id===p.p2);
        if(p.bye)return`<tr><td colspan="4">${pl1?.name} — <em>BYE +20BP</em></td></tr>`;
        if(p.vp1==null)return`<tr><td>${pl1?.name}</td><td colspan="3">${pl2?.name} — <em>ei tulosta</em></td></tr>`;
        const c=calcBP(p.vp1,p.vp2,config.bpTable);
        return`<tr><td>${pl1?.name}</td><td>${p.vp1} VP · ${c.bp1} BP</td><td>${p.vp2} VP · ${c.bp2} BP</td><td>${pl2?.name}</td></tr>`;
      }).join('');
      return`<h3>Kierros ${rd.round}</h3><table>${pairs}</table>`;
    }).join('');
    const w=window.open('','_blank');
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>${config.name}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:32px;color:#111}
        h1{font-size:22px;margin-bottom:4px}h2{font-size:16px;color:#555;margin-top:24px}h3{font-size:14px;margin:16px 0 6px;color:#333}
        table{border-collapse:collapse;width:100%;margin-bottom:16px}
        th,td{border:1px solid #ddd;padding:6px 10px;text-align:left;font-size:13px}
        th{background:#f5f5f5;font-weight:600}tr:nth-child(even){background:#fafafa}
        @media print{body{margin:16px}}
      </style></head><body>
      <h1>${config.name}</h1>
      <p style="color:#666;font-size:13px">${config.rounds} kierrosta · ${players.length} pelaajaa</p>
      <h2>Sijoitukset</h2>
      <table><thead><tr><th>Sija</th><th>Pelaaja</th><th>BP</th><th>VP</th><th>V–T–H</th><th>SOS</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <h2>Tulokset</h2>${rdRows}
      </body></html>`);
    w.document.close();
    setTimeout(()=>w.print(),400);
  }

  return <div style={S.overlay}><div style={{...S.modalBox,maxWidth:320}}>
    <div style={{fontFamily:'Cinzel,serif',color:'var(--gold)',fontSize:14,marginBottom:14,letterSpacing:'.08em'}}>📤 Vie tulokset</div>
    <button style={{...S.btn('gold'),marginBottom:10}} onClick={exportCSV}>
      📊 CSV — Excel / Google Sheets
    </button>
    <div style={{fontSize:11,color:'var(--steel)',marginBottom:14,marginTop:-6,lineHeight:1.5}}>
      Sijoitukset + kaikki kierrostulokset
    </div>
    <button style={{...S.btn('red'),marginBottom:10}} onClick={exportPDF}>
      🖨 PDF — Tulostettava raportti
    </button>
    <div style={{fontSize:11,color:'var(--steel)',marginBottom:14,marginTop:-6,lineHeight:1.5}}>
      Avautuu uuteen välilehteen → tulosta tai tallenna PDF
    </div>
    <button style={{...S.btn('outline'),marginBottom:0}} onClick={onClose}>Sulje</button>
  </div></div>;
}

// ═══════════════════════════════════
//  TOURNAMENT APP
// ═══════════════════════════════════
function TournamentApp({initConfig, tourneyId, onReset}) {
  const SAVE_KEY = 'wh_tourney_v4';

  const loadedState = (()=>{try{const d=localStorage.getItem(SAVE_KEY);if(d)return JSON.parse(d);}catch(e){}return null;})();

  const [tab,     setTab]     = useState('players');
  const [players, setPlayers] = useState(loadedState?.players  || []);
  const [matches, setMatches] = useState(loadedState?.matches  || []);
  const [round,   setRound]   = useState(loadedState?.round    || 0);
  const [nextId,  setNextId]  = useState(loadedState?.nextId   || 1);
  const [config,  setConfig]  = useState(loadedState?.config   || initConfig);
  const [toast,   setToast]   = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showBP,     setShowBP]     = useState(false);
  const [showQR,     setShowQR]     = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSave,   setShowSave]   = useState(false);
  const [newName, setNewName] = useState('');
  const toastRef    = useRef();
  const firstRender = useRef(true);

  useEffect(()=>{
    if(firstRender.current){firstRender.current=false;return;}
    try{localStorage.setItem(SAVE_KEY,JSON.stringify({players,matches,round,nextId,config}));}catch(e){}
  },[players,matches,round,nextId,config]);

  useEffect(()=>{
    if(firstRender.current) return;
    fbSet(`tournaments/${tourneyId}`,{players,matches,round,config});
  },[players,matches,round,config]);

  const showToast = useCallback((msg,err=false)=>{
    setToast({msg,err});clearTimeout(toastRef.current);
    toastRef.current=setTimeout(()=>setToast(null),2800);
  },[]);

  const activePlayers = players.filter(p=>!p.dropped);
  const curRd  = matches[round-1];
  const curDone = rdDone(curRd);

  function addPlayer() {
    const name=newName.trim();
    if(!name){showToast('Enter a name!',true);return;}
    if(players.find(p=>p.name.toLowerCase()===name.toLowerCase()&&!p.dropped)){showToast('Already exists!',true);return;}
    setPlayers(prev=>[...prev,{id:nextId,name,dropped:false}]);
    setNextId(n=>n+1);setNewName('');showToast(`${name} added.`);
  }

  function doGenerateRound() {
    if(activePlayers.length<2){showToast('Need at least 2 players!',true);return;}
    if(curRd&&!curDone){showToast('Enter all scores first!',true);return;}
    if(round>=config.rounds){showToast('Tournament complete!',true);return;}
    const rn=round+1;
    const rd=generatePairings(players,matches,config.bpTable,rn);
    setMatches(prev=>[...prev,rd]);setRound(rn);setTab('round');
    showToast(`Round ${rn} pairings generated!`);
  }

  function setScore(roundNum,pairIdx,field,val) {
    setMatches(prev=>prev.map(rd=>{
      if(rd.round!==roundNum)return rd;
      return{...rd,pairs:rd.pairs.map((p,i)=>i===pairIdx?{...p,[field]:val===''?null:+val}:p)};
    }));
  }

  function statusMsg() {
    if(activePlayers.length<2)return{msg:'Add at least 2 players to begin.',canGen:false};
    if(round===0)return{msg:`${activePlayers.length} players ready.`,canGen:true,label:'⚔ Generate Round 1'};
    if(!curDone)return{msg:`Round ${round} in progress.`,canGen:false};
    if(round>=config.rounds)return{msg:'🏆 Tournament complete!',canGen:false};
    return{msg:`Round ${round} done.`,canGen:true,label:`⚔ Generate Round ${round+1}`};
  }
  const status=statusMsg();

  const standings = calcStandings(players,matches,config.bpTable);
  const viewerURL = `${window.location.origin}${window.location.pathname}?t=${tourneyId}`;
  const adminURL  = `${window.location.origin}${window.location.pathname}?admin=${tourneyId}`;
  const tabs=[{k:'players',label:'Players'},{k:'round',label:'Round'},{k:'history',label:'History'},{k:'settings',label:'Settings'}];

  return (
    <div style={S.screen}>
      {toast   &&<Toast msg={toast.msg} err={toast.err}/>}
      {confirm &&<ConfirmModal {...confirm} onClose={()=>setConfirm(null)}/>}
      {showBP  &&<BPModal table={config.bpTable} onSave={t=>{setConfig(c=>({...c,bpTable:t}));setShowBP(false);showToast('BP table saved!');}} onClose={()=>setShowBP(false)}/>}
      {showQR     &&<QRModal url={viewerURL} onClose={()=>setShowQR(false)}/>}
      {showExport &&<ExportModal onClose={()=>setShowExport(false)} standings={standings} matches={matches} config={config} players={players}/>}
      {showSave   &&<SaveModal adminUrl={adminURL} onClose={()=>setShowSave(false)}/>}

      <div style={S.hdr}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{flex:1}}/>
          <div style={S.h1}>{config.name}</div>
          <div style={{flex:1,display:'flex',justifyContent:'flex-end'}}>
            <button onClick={()=>setShowQR(true)}
              style={{background:'none',border:'1px solid rgba(201,168,76,.3)',borderRadius:3,
                color:'var(--gold)',fontFamily:'Cinzel,serif',fontSize:10,padding:'4px 8px',cursor:'pointer',letterSpacing:'.05em'}}>
              📡 Share
            </button>
          </div>
        </div>
        <div style={S.hsub}>Round {round}/{config.rounds} &nbsp;·&nbsp; {activePlayers.length} players &nbsp;·&nbsp; {config.tables} tables
          {config.scenarioName&&<> &nbsp;·&nbsp; {config.scenarioName}</>}
        </div>
      </div>

      <div style={S.nav}>
        {tabs.map(t=><button key={t.k} style={S.navBtn(tab===t.k)} onClick={()=>setTab(t.k)}>{t.label}</button>)}
      </div>

      <div style={S.page}>

        {/* ── PLAYERS + STANDINGS ── */}
        {tab==='players'&&<>
          {round>0&&<Card title="🏆 Standings">
            <StandingsTable standings={standings} round={round}/>
          </Card>}
          <Card>
            <div style={S.msg}>{status.msg}</div>
            {status.canGen&&<button style={S.btn('red')} onClick={doGenerateRound}>{status.label}</button>}
          </Card>
          <Card title="+ Add Player">
            <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
              <input style={{...S.input,flex:1,marginBottom:0}} value={newName}
                onChange={e=>setNewName(e.target.value)} placeholder="Player name…"
                onKeyDown={e=>e.key==='Enter'&&addPlayer()}/>
              <button style={{...S.btn('gold',true),height:41,padding:'0 18px'}} onClick={addPlayer}>Add</button>
            </div>
          </Card>
          <Card title={<><span>📋 Roster</span><span style={{...S.badge('rd'),marginLeft:4}}>{activePlayers.length} players</span></>}>
            {!players.length&&<div style={{color:'var(--steel)',textAlign:'center',padding:16}}>No players yet.</div>}
            {players.filter(p=>!p.dropped).map(p=>(
              <div key={p.id} style={S.playerRow}>
                <span style={{fontWeight:600}}>{p.name}</span>
                <button style={S.btn('danger',true)} onClick={()=>{
                  if(round>0)setPlayers(prev=>prev.map(x=>x.id===p.id?{...x,dropped:true}:x));
                  else setPlayers(prev=>prev.filter(x=>x.id!==p.id));
                }}>{round>0?'Drop':'✕'}</button>
              </div>
            ))}
            {players.filter(p=>p.dropped).length>0&&<>
              <div style={S.divider}><span>Dropped</span></div>
              {players.filter(p=>p.dropped).map(p=>(
                <div key={p.id} style={{...S.playerRow,opacity:.4}}>
                  <span style={{textDecoration:'line-through'}}>{p.name}</span>
                  <button style={S.btn('gold',true)} onClick={()=>setPlayers(prev=>prev.map(x=>x.id===p.id?{...x,dropped:false}:x))}>Reinstate</button>
                </div>
              ))}
            </>}
          </Card>
        </>}

        {/* ── ROUND ── */}
        {tab==='round'&&<>
          {!round&&<Card><div style={{color:'var(--steel)',textAlign:'center',padding:20}}>No active round. Go to Players tab.</div></Card>}
          {curRd&&<>
            <div style={{fontFamily:'Cinzel,serif',fontSize:15,color:'var(--gold)',letterSpacing:'.1em',textAlign:'center',marginBottom:12}}>
              ⚔ ROUND {curRd.round}&nbsp;&nbsp;
              <span style={S.badge(curDone?'ok':'rd')}>{curDone?'Complete':'In Progress'}</span>
            </div>

            <RoundScenariosPanel config={config} curRd={curRd}/>

            {curRd.pairs.map((p,i)=>{
              if(p.bye){const pl=players.find(x=>x.id===p.p1);return(
                <div key={i} style={S.pairCard}><div style={{padding:'11px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><div style={{fontWeight:600,fontSize:14}}>{pl?.name}</div>
                  <div style={{fontSize:11,color:'var(--steel)',marginTop:2}}>{getPlayerBP(p.p1,matches,config.bpTable)}BP total</div></div>
                  <span style={{background:'rgba(201,168,76,.14)',color:'var(--gold)',fontSize:11,padding:'3px 10px',borderRadius:2,fontFamily:'Cinzel,serif',border:'1px solid rgba(201,168,76,.3)'}}>BYE +20BP</span>
                </div></div>
              );}
              const pl1=players.find(x=>x.id===p.p1),pl2=players.find(x=>x.id===p.p2);
              const hasBoth=p.vp1!=null&&p.vp2!=null;
              const calc=hasBoth?calcBP(p.vp1,p.vp2,config.bpTable):null;
              return(
                <div key={i} style={S.pairCard}><div style={{padding:'10px 12px'}}>
                  <div style={{fontFamily:'Cinzel,serif',fontSize:10,color:'var(--steel)',letterSpacing:'.12em',textTransform:'uppercase',textAlign:'center',marginBottom:8}}>Table {p.table}</div>
                  <div style={{display:'grid',gridTemplateColumns:config.scoring==='tow'?'1fr 28px 1fr':'1fr',gap:4,alignItems:'start'}}>
                    {config.scoring==='tow' ? <>
                      <div style={{display:'flex',flexDirection:'column',gap:4}}>
                        <div style={{fontWeight:600,fontSize:14,lineHeight:1.2}}>{pl1?.name}</div>
                        <div style={{fontSize:11,color:'var(--steel)'}}>{getPlayerBP(p.p1,matches,config.bpTable)}BP total</div>
                        <input style={S.scoreInput} type="number" min="0" max="999999" placeholder="VP"
                          value={p.vp1??''} onChange={e=>setScore(curRd.round,i,'vp1',e.target.value)}/>
                        {hasBoth&&<div style={S.resBadge(calc.bp1)}>{wdl(calc.bp1)} · {calc.bp1}BP</div>}
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:2,gap:4}}>
                        <div style={{fontFamily:'Cinzel,serif',fontSize:11,color:'var(--blood)',fontWeight:700}}>VS</div>
                        {hasBoth&&<div style={{fontFamily:'Cinzel,serif',fontSize:10,color:'var(--steel)',textAlign:'center',lineHeight:1.4,marginTop:6}}>
                          <span style={{color:'var(--gold)',fontSize:13,display:'block'}}>{calc.bp1}</span>
                          <span style={{fontSize:9}}>BP</span>
                          <span style={{color:'var(--steel)',fontSize:11,display:'block'}}>–</span>
                          <span style={{color:'var(--gold)',fontSize:13,display:'block'}}>{calc.bp2}</span>
                          <span style={{fontSize:9}}>BP</span>
                        </div>}
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
                        <div style={{fontWeight:600,fontSize:14,lineHeight:1.2,textAlign:'right'}}>{pl2?.name}</div>
                        <div style={{fontSize:11,color:'var(--steel)'}}>{getPlayerBP(p.p2,matches,config.bpTable)}BP total</div>
                        <input style={S.scoreInput} type="number" min="0" max="999999" placeholder="VP"
                          value={p.vp2??''} onChange={e=>setScore(curRd.round,i,'vp2',e.target.value)}/>
                        {hasBoth&&<div style={{...S.resBadge(calc.bp2)}}>{wdl(calc.bp2)} · {calc.bp2}BP</div>}
                      </div>
                    </> : <>
                      <div style={{gridColumn:'1/-1',display:'flex',flexDirection:'column',gap:8}}>
                        <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:4}}>
                          <div>
                            <div style={{fontWeight:600,fontSize:14}}>{pl1?.name}</div>
                            <div style={{fontSize:11,color:'var(--steel)'}}>{getPlayerBP(p.p1,matches,config.bpTable)}BP total</div>
                          </div>
                          <div style={{fontFamily:'Cinzel,serif',fontSize:11,color:'var(--blood)',fontWeight:700,alignSelf:'center',padding:'0 4px'}}>VS</div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontWeight:600,fontSize:14}}>{pl2?.name}</div>
                            <div style={{fontSize:11,color:'var(--steel)'}}>{getPlayerBP(p.p2,matches,config.bpTable)}BP total</div>
                          </div>
                        </div>
                        {!hasBoth
                          ? <div style={{display:'flex',flexDirection:'column',gap:6}}>
                              <button
                                style={{...S.btn('outline'),marginBottom:0,padding:'10px 12px',
                                  border:p.vp1===2000&&p.vp2===0?'1px solid var(--win)':'1px solid rgba(201,168,76,.25)',
                                  color:p.vp1===2000&&p.vp2===0?'var(--win)':'var(--steel)',
                                  background:p.vp1===2000&&p.vp2===0?'rgba(0,100,0,.2)':'transparent'}}
                                onClick={()=>{setScore(curRd.round,i,'vp1',2000);setScore(curRd.round,i,'vp2',0);}}>
                                <span style={{fontWeight:600}}>{pl1?.name}</span>&nbsp; wins
                              </button>
                              <button
                                style={{...S.btn('outline'),marginBottom:0,padding:'10px 12px',
                                  border:p.vp1===1000&&p.vp2===1000?'1px solid var(--draw)':'1px solid rgba(201,168,76,.25)',
                                  color:p.vp1===1000&&p.vp2===1000?'var(--draw)':'var(--steel)',
                                  background:p.vp1===1000&&p.vp2===1000?'rgba(100,80,0,.2)':'transparent'}}
                                onClick={()=>{setScore(curRd.round,i,'vp1',1000);setScore(curRd.round,i,'vp2',1000);}}>
                                Draw
                              </button>
                              <button
                                style={{...S.btn('outline'),marginBottom:0,padding:'10px 12px',
                                  border:p.vp1===0&&p.vp2===2000?'1px solid var(--win)':'1px solid rgba(201,168,76,.25)',
                                  color:p.vp1===0&&p.vp2===2000?'var(--win)':'var(--steel)',
                                  background:p.vp1===0&&p.vp2===2000?'rgba(0,100,0,.2)':'transparent'}}
                                onClick={()=>{setScore(curRd.round,i,'vp1',0);setScore(curRd.round,i,'vp2',2000);}}>
                                <span style={{fontWeight:600}}>{pl2?.name}</span>&nbsp; wins
                              </button>
                            </div>
                          : <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0'}}>
                              <div style={S.resBadge(calc.bp1)}>{wdl(calc.bp1)} · {calc.bp1}BP</div>
                              <div style={{fontFamily:'Cinzel,serif',fontSize:13,color:'var(--gold)'}}>{calc.bp1}–{calc.bp2}</div>
                              <div style={S.resBadge(calc.bp2)}>{wdl(calc.bp2)} · {calc.bp2}BP</div>
                            </div>
                        }
                        {hasBoth&&<button style={{...S.btn('outline',true),fontSize:10,color:'var(--steel)'}}
                          onClick={()=>{setScore(curRd.round,i,'vp1',null);setScore(curRd.round,i,'vp2',null);}}>
                          ✕ Clear result
                        </button>}
                      </div>
                    </>}
                  </div>
                </div></div>
              );
            })}
            {status.canGen&&<button style={{...S.btn('red'),marginTop:4}} onClick={doGenerateRound}>{status.label}</button>}
            {!curDone&&round<config.rounds&&<div style={{fontSize:12,color:'var(--steel)',textAlign:'center',marginBottom:8}}>Enter all scores before generating next round.</div>}
          </>}
        </>}

        {/* ── HISTORY ── */}
        {tab==='history'&&<>
          <Card title="📜 History">
            {!matches.length?<div style={{color:'var(--steel)',textAlign:'center',padding:16}}>No rounds yet.</div>
            :[...matches].reverse().map(rd=>(
              <div key={rd.round}>
                <div style={S.divider}><span>Round {rd.round}{rdDone(rd)?'':' · in progress'}</span></div>
                {rd.pairs.map((p,i)=>{
                  const pl1=players.find(x=>x.id===p.p1),pl2=players.find(x=>x.id===p.p2);
                  if(p.bye)return<div key={i} style={{...S.playerRow,marginBottom:5}}><span style={{fontWeight:600}}>{pl1?.name}</span><span style={{fontFamily:'Cinzel,serif',fontSize:11,color:'var(--gold)'}}>BYE</span></div>;
                  const has=p.vp1!=null;
                  const calc=has?calcBP(p.vp1,p.vp2,config.bpTable):null;
                  return<div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'7px 10px',background:'var(--d3)',border:'1px solid rgba(201,168,76,.1)',borderRadius:3,marginBottom:5,fontSize:13}}>
                    <div style={{flex:1}}><div style={{fontWeight:600}}>{pl1?.name}</div>{has&&<div style={S.resBadge(calc.bp1)}>{wdl(calc.bp1)} {calc.bp1}BP</div>}</div>
                    <div style={{textAlign:'center',minWidth:80,fontFamily:'Cinzel,serif',fontSize:12,color:'var(--gold)'}}>
                      {has?<>{p.vp1?.toLocaleString()}<br/>{p.vp2?.toLocaleString()}</>:'–'}
                      {has&&<div style={{fontSize:10,color:'var(--steel)',marginTop:2}}>{calc.bp1}–{calc.bp2} BP</div>}
                    </div>
                    <div style={{flex:1,textAlign:'right'}}><div style={{fontWeight:600}}>{pl2?.name}</div>{has&&<div style={{...S.resBadge(calc.bp2),float:'right',clear:'both'}}>{wdl(calc.bp2)} {calc.bp2}BP</div>}</div>
                  </div>;
                })}
              </div>
            ))}
          </Card>
        </>}

        {/* ── SETTINGS ── */}
        {tab==='settings'&&<>
          <Card title="⚙ Settings">
            <label style={S.label}>Tournament Name</label>
            <input style={S.input} value={config.name} onChange={e=>setConfig(c=>({...c,name:e.target.value}))}/>
            <div style={{display:'flex',gap:10}}>
              <div style={{flex:1}}><label style={S.label}>Rounds</label>
                <select style={S.select} value={config.rounds} onChange={e=>setConfig(c=>({...c,rounds:+e.target.value}))}>
                  {[3,4,5,6,7,8].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div style={{flex:1}}><label style={S.label}>Tables</label>
                <input style={S.input} type="number" min="1" max="60" value={config.tables} onChange={e=>setConfig(c=>({...c,tables:+e.target.value||1}))}/>
              </div>
            </div>
          </Card>
          {config.scoring==='tow'&&<Card title="🎯 BP Table">
            {(()=>{const dr=config.bpTable.find(r=>r.w===10),mx=[...config.bpTable].sort((a,b)=>b.w-a.w)[0],du=dr?(dr.hi>=99999?'∞':dr.hi):'–';return(
              <div style={{fontSize:13,color:'var(--steel)',lineHeight:1.9,marginBottom:12}}>
                Draw when VP diff &lt; <strong style={{color:'var(--gold)'}}>{du}</strong><br/>
                Max win: <strong style={{color:'var(--gold)'}}>{mx.w}–{20-mx.w}</strong> BP (diff ≥ <strong style={{color:'var(--gold)'}}>{mx.lo}</strong>)
              </div>
            );})()}
            <button style={S.btn('gold')} onClick={()=>setShowBP(true)}>✎ Edit BP Table</button>
          </Card>}
          {config.scenario&&<Card title="🗺 Scenario">
            {(()=>{
              const sc=SCENARIOS.find(s=>s.id===config.scenario);
              if(!sc)return null;
              const activeSecObjs=Object.entries(config.secObjs||{}).filter(([,v])=>v).map(([k])=>SEC_OBJ[k]).filter(Boolean);
              return <>
                <ScenarioMap id={sc.id} style={{borderRadius:3,marginBottom:10,opacity:.9}}/>
                <div style={{fontFamily:'Cinzel,serif',fontSize:13,color:'var(--gold)',marginBottom:4}}>{sc.id}. {sc.name}</div>
                <div style={{fontSize:12,color:'var(--steel)',lineHeight:1.6,marginBottom:6}}>{sc.desc}</div>
                {sc.special!=='No special rules.'&&<div style={{fontSize:12,color:'var(--p2)',lineHeight:1.5,marginBottom:6}}>⚡ {sc.special}</div>}
                <div style={{fontSize:11,color:'var(--steel)',marginBottom:activeSecObjs.length?8:0}}>⏱ {sc.gameLength}</div>
                {activeSecObjs.length>0&&<>
                  <div style={{fontFamily:'Cinzel,serif',fontSize:10,color:'var(--gold)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:6}}>Secondary Objectives</div>
                  {activeSecObjs.map(obj=><div key={obj.name} style={{display:'flex',gap:6,padding:'7px 8px',background:'rgba(201,168,76,.05)',border:'1px solid rgba(201,168,76,.15)',borderRadius:3,marginBottom:5,fontSize:12}}>
                    <span style={{fontSize:16,flexShrink:0}}>{obj.icon}</span>
                    <div><div style={{color:'var(--gold)',fontFamily:'Cinzel,serif',fontSize:11,marginBottom:2}}>{obj.name}</div>
                    <div style={{color:'var(--steel)',fontSize:11,lineHeight:1.4}}>{obj.desc}</div></div>
                  </div>)}
                </>}
              </>;
            })()}
          </Card>}
          <Card title="📡 Live Standings">
            <div style={S.msg}>Pelaajat voivat seurata sijoituksia live QR-koodin tai linkin kautta.</div>
            <button style={S.btn('blue')} onClick={()=>setShowQR(true)}>📡 Show QR Code</button>
          </Card>
          <Card title="💾 Tallenna turnaus">
            <div style={S.msg}>Jatka hallintaa toisella koneella tai selaimella.</div>
            <button style={S.btn('blue')} onClick={()=>setShowSave(true)}>💾 Save Tournament Link</button>
          </Card>
          <Card title="📤 Vie tulokset">
            <button style={S.btn('gold')} onClick={()=>setShowExport(true)}>📤 Export CSV / PDF</button>
          </Card>
          <Card title="⚠ Danger Zone">
            <button style={S.btn('danger')} onClick={()=>setConfirm({
              title:'End Tournament',body:'Return to start screen? All data will be cleared.',
              onOk:()=>{localStorage.removeItem(SAVE_KEY);setConfirm(null);onReset();}
            })}>↺ End &amp; Reset Tournament</button>
          </Card>
        </>}

      </div>
    </div>
  );
}

// ═══════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════
function App() {
  const SAVE_KEY = 'wh_tourney_v4';

  const params    = new URLSearchParams(window.location.search);
  const viewerId  = params.get('t');
  const adminId   = params.get('admin');

  const hasSession = !!localStorage.getItem(SAVE_KEY);
  const [started,       setStarted]       = useState(hasSession || !!adminId);
  const [config,        setConfig]        = useState(null);
  const [remoteLoading, setRemoteLoading] = useState(!!adminId && !hasSession);

  const [tourneyId] = useState(()=>{
    if (adminId) {
      localStorage.setItem('wh_tourney_id', adminId);
      return adminId;
    }
    const stored = localStorage.getItem('wh_tourney_id');
    if (stored) return stored;
    const id = 'T' + Date.now().toString(36).toUpperCase();
    localStorage.setItem('wh_tourney_id', id);
    return id;
  });

  useEffect(()=>{
    if (!adminId || hasSession) return;
    fbOn(`tournaments/${adminId}`, val => {
      if (val) {
        localStorage.setItem(SAVE_KEY, JSON.stringify(val));
        setRemoteLoading(false);
        window.history.replaceState({}, '', window.location.pathname);
      }
    });
  }, []);

  if (viewerId) return <ViewerScreen tourneyId={viewerId}/>;

  if (remoteLoading) return (
    <div style={{minHeight:'100vh',background:'var(--dark)',display:'flex',alignItems:'center',
      justifyContent:'center',flexDirection:'column',gap:16}}>
      <div style={{fontFamily:'Cinzel,serif',color:'var(--gold)',fontSize:14,letterSpacing:'.1em'}}>Ladataan turnausta…</div>
      <div style={{fontSize:12,color:'var(--steel)'}}>Haetaan tietoja Firebasesta</div>
    </div>
  );

  function handleStart(cfg) {
    localStorage.removeItem(SAVE_KEY);
    setConfig(cfg);
    setStarted(true);
  }

  if (!started) return <StartScreen onStart={handleStart}/>;
  return <TournamentApp
    initConfig={config||{name:'Tournament',rounds:5,tables:8,scoring:'tow',bpTable:DEFAULT_BP}}
    tourneyId={tourneyId}
    onReset={()=>{setStarted(false);setConfig(null);}}
  />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
