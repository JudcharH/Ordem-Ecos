/* Grimório V2.6 — DTs 12/16/20 + acabamento do gerenciador */
(function(){
"use strict";
const DT16=new Set(["Arruinar","Devastar","Prender","Ocultar","Silenciar","Teleportar"]);
const DT20=new Set(["Revelar","Detectar","Iludir","Selar","Invocar","Dissipar"]);
function desiredDt(name){return DT16.has(name)?16:DT20.has(name)?20:12;}
function patchStored(){
  try{
    const list=JSON.parse(localStorage.getItem("ordem_characters")||"[]");
    let changed=false;
    for(const c of list){
      const g=c?.grimoireV2||c?.grimoire;
      if(!g||!Array.isArray(g.rituals))continue;
      for(const r of g.rituals){
        const key=String(r.action||"").toLowerCase();
        const dt=["arruinar","devastar","prender","ocultar","silenciar","teleportar"].includes(key)?16:["revelar","detectar","iludir","selar","invocar","dissipar"].includes(key)?20:12;
        if(r.dt!==dt){r.dt=dt;changed=true;}
        if(r.calculated&&r.calculated.dt!==dt){r.calculated.dt=dt;changed=true;}
      }
    }
    if(changed)localStorage.setItem("ordem_characters",JSON.stringify(list));
  }catch(e){}
}
function patchVisible(root=document){
  root.querySelectorAll('.g25-actions-learn label').forEach(card=>{
    const name=card.querySelector('b')?.textContent?.trim();
    const small=card.querySelector('small');
    if(name&&small)small.textContent=`DT ${desiredDt(name)}`;
    card.dataset.dt=String(desiredDt(name||""));
  });
  root.querySelectorAll('#g25Actions button').forEach(card=>{
    const name=card.querySelector('b')?.textContent?.trim();
    const dt=card.querySelector('i');
    if(name&&dt)dt.textContent=`DT ${desiredDt(name)}`;
  });
  root.querySelectorAll('#g25Saved article').forEach(card=>{
    const p=card.querySelector('p'); if(!p)return;
    const action=(p.textContent.split('•')[1]||'').trim();
    if(action)p.textContent=p.textContent.replace(/DT\s+\d+/i,`DT ${desiredDt(action)}`);
  });
}
function style(){if(document.getElementById('grim26Style'))return;const s=document.createElement('style');s.id='grim26Style';s.textContent=`
.g25-manager{position:relative;overflow:hidden;padding:22px!important;border:1px solid #ffffff18!important;border-radius:20px!important;background:radial-gradient(circle at 0 0,rgba(123,44,255,.14),transparent 36%),linear-gradient(145deg,#15111b,#0a080e)!important;box-shadow:inset 0 1px #ffffff08,0 18px 40px #0005!important}
.g25-manager:before{content:"CONHECIMENTO DO OCULTISTA";display:block;margin-bottom:5px;color:#a97cff;font:700 .72rem Orbitron,Inter,sans-serif;letter-spacing:.16em}.g25-manager>h3{margin:0 0 18px!important;font-size:1.25rem!important}.g25-manager>h3:after{content:"Elementos, ações e aprimoramentos que o personagem aprendeu.";display:block;margin-top:6px;color:#8f8998;font:400 .78rem Inter,sans-serif}
.g25-manager .g25-grid{gap:9px!important}.g25-manager .g25-grid label{position:relative;min-height:48px;padding:11px 13px!important;border:1px solid #ffffff13!important;border-radius:12px!important;background:linear-gradient(145deg,#ffffff08,#ffffff03)!important;transition:.18s;cursor:pointer}.g25-manager .g25-grid label:hover{transform:translateY(-1px);border-color:#8d5cff88!important;background:#8d5cff12!important}.g25-manager .g25-grid label:has(input:checked){border-color:#9c6cff!important;background:linear-gradient(145deg,#8d5cff28,#8d5cff0b)!important;box-shadow:0 0 20px #7b2cff20,inset 3px 0 #9c6cff}.g25-manager input[type=checkbox]{width:16px;height:16px;accent-color:#9c6cff}
.g25-actions-learn{margin-top:14px!important;padding-top:14px;border-top:1px solid #ffffff0e}.g25-actions-learn label span{display:flex!important;align-items:center;justify-content:space-between;gap:8px;width:100%}.g25-actions-learn label small{flex:none;padding:4px 7px;border:1px solid #ffffff15;border-radius:999px;background:#0005;color:#b8b1c2!important;font-size:.68rem!important}.g25-actions-learn label[data-dt="16"] small{color:#e6c978!important}.g25-actions-learn label[data-dt="20"] small{color:#e69a9a!important}
.g25-enh-learn{margin-top:14px!important;padding-top:14px;border-top:1px solid #ffffff0e;display:grid!important;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px!important}.g25-enh-learn>div{min-height:62px;padding:11px 12px!important;border:1px solid #ffffff13!important;border-radius:13px!important;background:linear-gradient(145deg,#ffffff08,#ffffff03)!important;box-shadow:inset 0 1px #ffffff06}.g25-enh-learn>div>span{min-width:0}.g25-enh-learn>div>span>b{display:block;color:#eee9f2}.g25-enh-learn>div small{display:block;margin-top:4px;color:#918a99!important}.g25-enh-learn i{font-style:normal;color:#b18aff;font-weight:800}.g25-enh-learn button{width:34px!important;height:34px!important;border-radius:10px!important;border:1px solid #8d5cff66!important;background:#8d5cff18!important;color:#fff!important;font-size:1.05rem;cursor:pointer;transition:.15s}.g25-enh-learn button:hover{background:#8d5cff35!important;transform:scale(1.05)}
@media(max-width:760px){.g25-enh-learn{grid-template-columns:1fr}.g25-actions-learn label span{align-items:flex-start;flex-direction:column}}
`;document.head.appendChild(s)}
function install(){style();patchStored();const run=()=>patchVisible();run();new MutationObserver(run).observe(document.body,{childList:true,subtree:true});window.addEventListener('storage',patchStored);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();