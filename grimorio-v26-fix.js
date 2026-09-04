/* Grimório V2.6 fix — restaura tabela e aplica DTs 12/16/20 */
(function(){
"use strict";
const STORAGE="ordem_characters";
const DT={arruinar:16,devastar:16,prender:16,ocultar:16,silenciar:16,teleportar:16,revelar:20,detectar:20,iludir:20,selar:20,invocar:20,dissipar:20};
const dtFor=a=>DT[String(a||"").toLowerCase()]||12;
function migrate(){try{const list=JSON.parse(localStorage.getItem(STORAGE)||"[]");let dirty=false;list.forEach(c=>{const gs=[c?.grimoireV2,c?.grimoire].filter(Boolean);gs.forEach(g=>(g.rituals||[]).forEach(r=>{const dt=dtFor(r.action);if(r.dt!==dt){r.dt=dt;dirty=true}if(r.calculated&&r.calculated.dt!==dt){r.calculated.dt=dt;dirty=true}}))});if(dirty)localStorage.setItem(STORAGE,JSON.stringify(list));}catch(e){}}
function fixTable(){if(!document.querySelector('.table-app'))return;document.querySelectorAll('[data-grim-table],.grim-table,.g25-table,.grimoire-table').forEach(el=>{el.style.removeProperty('display');el.hidden=false;});document.querySelectorAll('[data-ritual-action],.grim-ritual-card,.g25-ritual-card').forEach(card=>{const action=card.dataset.ritualAction||card.dataset.action;const node=card.querySelector('[data-ritual-dt],.ritual-dt,.g25-dt');if(action&&node)node.textContent=`DT ${dtFor(action)}`;});}
function install(){migrate();fixTable();let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;fixTable();});}).observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();