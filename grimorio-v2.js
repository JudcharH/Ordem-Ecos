/*==========================================================
= GRIMÓRIO V2 — PALAVRAS RITUAIS, CONSTRUTOR E MESA
==========================================================*/
(function(){
"use strict";

const STORAGE="ordem_characters";
const DRAFT_KEY="ordem_grimoire_v2_draft";
const ELEMENTS={
 sangue:"Sangue",morte:"Morte",energia:"Energia",conhecimento:"Conhecimento",medo:"Medo"
};
const ACTIONS={
 atormentar:{name:"Atormentar",description:"Causa 1d6 de dano do elemento escolhido."},
 aliviar:{name:"Aliviar",description:"Recupera 1d6 PV de um alvo."},
 transmutar:{name:"Transmutar",description:"Cria, altera ou modifica um objeto de acordo com o elemento utilizado."},
 potencializar:{name:"Potencializar",description:"Concede +1 em um atributo pelo tempo do ritual."},
 resguardar:{name:"Resguardar",description:"Concede 5 pontos de RD temporários."},
 preservar:{name:"Preservar",description:"Concede 5 PV temporários."},
 arruinar:{name:"Arruinar",description:"Reduz a Defesa do alvo em 3."},
 devastar:{name:"Devastar",description:"Reduz a DT dos testes realizados pelo alvo."},
 prender:{name:"Prender",description:"O alvo testa contra a DT do ritual; em falha fica Imobilizado até escapar."},
 revelar:{name:"Revelar",description:"Descobre informação oculta, fraqueza, resistência, vulnerabilidade ou ritual ativo."},
 ocultar:{name:"Ocultar",description:"Esconde um objeto, criatura ou presença paranormal."},
 silenciar:{name:"Silenciar",description:"Impede o alvo de conjurar rituais enquanto durar o efeito."},
 detectar:{name:"Detectar",description:"Detecta criaturas, objetos, energias ou fenômenos paranormais próximos."},
 invocar:{name:"Invocar",description:"Invoca criatura previamente selada ou vinculada. Exige DT 30."},
 dissipar:{name:"Dissipar",description:"Cancela ou impede um ritual. Exige DT 25."},
 selar:{name:"Selar",description:"Neutraliza habilidades de uma criatura até permitir seu selamento."},
 teleportar:{name:"Teleportar",description:"Move instantaneamente o conjurador para uma posição próxima."},
 iludir:{name:"Iludir",description:"Cria ilusão, clone ilusório ou camuflagem. DT 25 para perceber."}
};
const ENHANCEMENTS={
 canalizar:{name:"Canalizar",description:"Adiciona +1 dado ao efeito principal."},
 propagar:{name:"Propagar",description:"Adiciona +1 alvo ao ritual."},
 incorporar:{name:"Incorporar",description:"Aplica uma condição relacionada ao elemento."},
 assegurar:{name:"Assegurar",description:"Aumenta em +4 o dano ou a cura."},
 maximizar:{name:"Maximizar",description:"Dobra a quantidade de dados do ritual."},
 elevar:{name:"Elevar",description:"Concede +5 PV temporários ou +5 RD adicionais."},
 focar:{name:"Focar",description:"Aumenta em um passo o dado do ritual."},
 dificultar:{name:"Dificultar",description:"Aumenta a DT do ritual em +5."},
 empurrar:{name:"Empurrar",description:"Empurra o alvo 1 posição ou 3 metros."},
 atrair:{name:"Atrair",description:"Puxa o alvo 1 posição em direção ao conjurador."}
};
const CONDITIONS={
 sangue:"Sangramento ou Enfraquecido",morte:"Envenenado ou Cansado",
 energia:"Em Chamas ou Confuso",conhecimento:"Vulnerável ou Desprevenido",
 medo:"Condição especial escolhida pelo mestre"
};

function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
function readCharacters(){try{const v=JSON.parse(localStorage.getItem(STORAGE)||"[]");return Array.isArray(v)?v:[];}catch{return[];}}
function writeCharacters(list){localStorage.setItem(STORAGE,JSON.stringify(list));}
function currentCharacterId(){const p=new URLSearchParams(location.search);return p.get("id")||p.get("character")||localStorage.getItem("ordem_table_character");}
function emptyGrimoire(){return {version:2,elements:[],actions:[],enhancements:{},rituals:[]};}
function normalizeGrimoire(value){const g=value&&typeof value==="object"?value:{};return {version:2,elements:Array.isArray(g.elements)?g.elements:[],actions:Array.isArray(g.actions)?g.actions:[],enhancements:g.enhancements&&typeof g.enhancements==="object"?g.enhancements:{},rituals:Array.isArray(g.rituals)?g.rituals:[]};}
function getDraft(){try{return normalizeGrimoire(JSON.parse(sessionStorage.getItem(DRAFT_KEY)||"null"));}catch{return emptyGrimoire();}}
function setDraft(g){sessionStorage.setItem(DRAFT_KEY,JSON.stringify(normalizeGrimoire(g)));}
function getCurrentGrimoire(){const id=currentCharacterId();const c=readCharacters().find(x=>x.id===id);return c?normalizeGrimoire(c.grimoireV2||c.grimoire):getDraft();}
function saveCurrentGrimoire(g){g=normalizeGrimoire(g);setDraft(g);const id=currentCharacterId();const list=readCharacters();const index=list.findIndex(x=>x.id===id);if(index>=0){list[index].grimoireV2=g;list[index].grimoire=g;writeCharacters(list);if(typeof currentTableCharacter!=="undefined"&&currentTableCharacter?.id===id){currentTableCharacter.grimoireV2=g;currentTableCharacter.grimoire=g;}}}
function syncAfterMainSave(){setTimeout(()=>{const draft=getDraft();const list=readCharacters();const id=currentCharacterId();let index=list.findIndex(x=>x.id===id);if(index<0){const name=document.getElementById("characterEditorName")?.value?.trim();for(let i=list.length-1;i>=0;i--){if(!name||list[i].name===name){index=i;break;}}}if(index>=0){list[index].grimoireV2=draft;list[index].grimoire=draft;writeCharacters(list);}},250);}

function calculateRitual(actionId,enhancements,element){
 let diceCount=1,die=6,flat=0,targets=1,dt=20,extra=[];
 const count=id=>Math.max(0,Number(enhancements[id])||0);
 diceCount+=count("canalizar");
 const steps=[6,8,10,12];die=steps[Math.min(steps.length-1,count("focar"))];
 diceCount*=Math.pow(2,count("maximizar"));
 flat+=count("assegurar")*4;targets+=count("propagar");dt+=count("dificultar")*5;
 if(count("empurrar")) extra.push(`Empurra ${count("empurrar")} posição(ões)`);
 if(count("atrair")) extra.push(`Atrai ${count("atrair")} posição(ões)`);
 if(count("incorporar")) extra.push(`Condição: ${CONDITIONS[element]||"relacionada ao elemento"}`);
 if(count("elevar")) extra.push(`+${count("elevar")*5} PV temporários ou RD`);
 let formula="";
 if(actionId==="atormentar"||actionId==="aliviar") formula=`${diceCount}d${die}${flat?` + ${flat}`:""}`;
 if(actionId==="resguardar") formula=String(5+count("elevar")*5);
 if(actionId==="preservar") formula=String(5+count("elevar")*5);
 return {formula,targets,dt,extra,description:ACTIONS[actionId]?.description||""};
}

function editorHTML(g){
 const elementCards=Object.entries(ELEMENTS).map(([id,name])=>`<label class="grim-v2-check"><input type="checkbox" data-grim-element="${id}" ${g.elements.includes(id)?"checked":""}><strong>${name}</strong></label>`).join("");
 const actionCards=Object.entries(ACTIONS).map(([id,a])=>`<label class="grim-v2-check grim-v2-wide"><input type="checkbox" data-grim-action="${id}" ${g.actions.includes(id)?"checked":""}><span><strong>${a.name}</strong><small>${a.description}</small></span></label>`).join("");
 const enhancementRows=Object.entries(ENHANCEMENTS).map(([id,a])=>`<div class="grim-v2-counter"><div><strong>${a.name}</strong><small>${a.description}</small></div><button type="button" data-grim-minus="${id}">−</button><span data-grim-count="${id}">${Number(g.enhancements[id])||0}</span><button type="button" data-grim-plus="${id}">+</button></div>`).join("");
 return `<div class="grim-v2-editor">
 <div class="section-heading"><span class="section-label">PALAVRAS RITUAIS</span><h2>Conhecimento do Ocultista</h2></div>
 <h3>Elementos aprendidos</h3><div class="grim-v2-grid">${elementCards}</div>
 <h3>Palavras de Ação aprendidas</h3><div class="grim-v2-grid">${actionCards}</div>
 <h3>Palavras de Aprimoramento</h3><p class="section-description">Todos os aprimoramentos podem ser aprendidos várias vezes.</p><div class="grim-v2-counters">${enhancementRows}</div>
 <div class="grim-v2-builder"><h3>Criar Ritual</h3>
 <div class="grim-v2-fields"><label>Nome<input id="grimV2Name" type="text" placeholder="Nome personalizado"></label><label>Elemento<select id="grimV2Element"><option value="">Selecione</option>${g.elements.map(id=>`<option value="${id}">${ELEMENTS[id]}</option>`).join("")}</select></label><label>Ação<select id="grimV2Action"><option value="">Selecione</option>${g.actions.map(id=>`<option value="${id}">${ACTIONS[id]?.name||id}</option>`).join("")}</select></label></div>
 <div id="grimV2BuilderEnhancements" class="grim-v2-builder-enh"></div><div id="grimV2Preview" class="grim-v2-preview">Escolha elemento e ação.</div><button type="button" id="grimV2SaveRitual" class="primary-button">Salvar Ritual</button></div>
 <div class="grim-v2-saved"><h3>Rituais salvos</h3><div id="grimV2SavedList"></div></div></div>`;
}

function renderBuilderEnhancements(g){const root=document.getElementById("grimV2BuilderEnhancements");if(!root)return;root.innerHTML=Object.entries(ENHANCEMENTS).filter(([id])=>(Number(g.enhancements[id])||0)>0).map(([id,a])=>`<label>${a.name}<input type="number" min="0" max="${g.enhancements[id]}" value="0" data-grim-use="${id}"><small>Aprendido: ${g.enhancements[id]}</small></label>`).join("")||"<p>Nenhum aprimoramento aprendido.</p>";root.querySelectorAll("input").forEach(i=>i.addEventListener("input",updatePreview));}
function selectedUses(){const out={};document.querySelectorAll("[data-grim-use]").forEach(i=>{const n=Math.max(0,Math.min(Number(i.max)||0,Number(i.value)||0));if(n)out[i.dataset.grimUse]=n;});return out;}
function updatePreview(){const element=document.getElementById("grimV2Element")?.value;const action=document.getElementById("grimV2Action")?.value;const root=document.getElementById("grimV2Preview");if(!root)return;if(!element||!action){root.textContent="Escolha elemento e ação.";return;}const uses=selectedUses();const calc=calculateRitual(action,uses,element);const words=Object.entries(uses).map(([id,n])=>`${ENHANCEMENTS[id].name} ×${n}`).join(" • ");root.innerHTML=`<strong>${ELEMENTS[element]} + ${ACTIONS[action].name}</strong><p>${esc(calc.description)}</p>${calc.formula?`<p><b>Efeito:</b> ${esc(calc.formula)}</p>`:""}<p><b>Alvos:</b> ${calc.targets} • <b>DT:</b> ${calc.dt}</p>${words?`<p>${esc(words)}</p>`:""}${calc.extra.map(x=>`<p>${esc(x)}</p>`).join("")}`;}
function renderSaved(g){const root=document.getElementById("grimV2SavedList");if(!root)return;root.innerHTML=g.rituals.length?g.rituals.map((r,i)=>`<div class="grim-v2-ritual"><div><strong>${esc(r.name)}</strong><p>${esc(ELEMENTS[r.element]||r.element)} • ${esc(ACTIONS[r.action]?.name||r.action)}</p><small>${Object.entries(r.enhancements||{}).map(([id,n])=>`${ENHANCEMENTS[id]?.name||id} ×${n}`).join(" • ")||"Sem aprimoramentos"}</small></div><button type="button" data-grim-delete="${i}">Excluir</button></div>`).join(""):"<p>Nenhum ritual salvo.</p>";root.querySelectorAll("[data-grim-delete]").forEach(b=>b.addEventListener("click",()=>{g.rituals.splice(Number(b.dataset.grimDelete),1);saveCurrentGrimoire(g);renderSaved(g);}));}

function installEditor(){const old=document.querySelector("#addRitualEditor")?.closest("section.editor-section-card");if(!old||old.dataset.grimV2)return;old.dataset.grimV2="true";const g=getCurrentGrimoire();old.innerHTML=editorHTML(g);renderBuilderEnhancements(g);renderSaved(g);
 old.querySelectorAll("[data-grim-element]").forEach(i=>i.addEventListener("change",()=>{g.elements=Array.from(old.querySelectorAll("[data-grim-element]:checked")).map(x=>x.dataset.grimElement);saveCurrentGrimoire(g);installEditorRefresh(old,g);}));
 old.querySelectorAll("[data-grim-action]").forEach(i=>i.addEventListener("change",()=>{g.actions=Array.from(old.querySelectorAll("[data-grim-action]:checked")).map(x=>x.dataset.grimAction);saveCurrentGrimoire(g);installEditorRefresh(old,g);}));
 old.querySelectorAll("[data-grim-plus]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.grimPlus;g.enhancements[id]=(Number(g.enhancements[id])||0)+1;saveCurrentGrimoire(g);b.parentElement.querySelector(`[data-grim-count="${id}"]`).textContent=g.enhancements[id];renderBuilderEnhancements(g);updatePreview();}));
 old.querySelectorAll("[data-grim-minus]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.grimMinus;g.enhancements[id]=Math.max(0,(Number(g.enhancements[id])||0)-1);saveCurrentGrimoire(g);b.parentElement.querySelector(`[data-grim-count="${id}"]`).textContent=g.enhancements[id];renderBuilderEnhancements(g);updatePreview();}));
 document.getElementById("grimV2Element")?.addEventListener("change",updatePreview);document.getElementById("grimV2Action")?.addEventListener("change",updatePreview);
 document.getElementById("grimV2SaveRitual")?.addEventListener("click",()=>{const name=document.getElementById("grimV2Name")?.value.trim();const element=document.getElementById("grimV2Element")?.value;const action=document.getElementById("grimV2Action")?.value;if(!name||!element||!action){alert("Preencha nome, elemento e ação.");return;}const enhancements=selectedUses();const calc=calculateRitual(action,enhancements,element);g.rituals.push({id:`ritual_${Date.now()}`,name,element,action,enhancements,calculated:calc,createdAt:Date.now()});saveCurrentGrimoire(g);document.getElementById("grimV2Name").value="";renderSaved(g);});
 document.getElementById("saveCharacterEditor")?.addEventListener("click",syncAfterMainSave);
}
function installEditorRefresh(section,g){section.dataset.grimV2="";installEditor();}

function mesaRitualCard(r,index){const calc=calculateRitual(r.action,r.enhancements||{},r.element);return `<div class="table-panel-card"><h3>${esc(r.name)}</h3><p>${esc(ELEMENTS[r.element]||r.element)} • ${esc(ACTIONS[r.action]?.name||r.action)}</p><p>${esc(calc.description)}</p>${calc.formula?`<p><strong>${r.action==="aliviar"?"Cura":"Efeito"}:</strong> ${esc(calc.formula)}</p>`:""}<p>Alvos: ${calc.targets} • DT: ${calc.dt}</p>${calc.extra.map(x=>`<p>${esc(x)}</p>`).join("")}<button type="button" class="primary-button grim-v2-use" data-index="${index}">Usar</button></div>`;}
function useRitual(r){const calc=calculateRitual(r.action,r.enhancements||{},r.element);let result=null;if(calc.formula&&typeof rollDiceExpression==="function")result=rollDiceExpression(calc.formula);const total=result?Number(result.total)||0:null;const kind=r.action==="aliviar"?"healing":r.action==="atormentar"?"damage":"ritual";if(result&&typeof addRollChatMessage==="function")addRollChatMessage(`${r.action==="aliviar"?"Cura ritual":"Ritual"} • ${r.name}`,calc.formula,total,result.detail||"",{rollKind:kind,ritual:true,ritualId:r.id,element:r.element,applied:false});if(typeof refreshCurrentTableCampaign==="function")refreshCurrentTableCampaign();if(typeof currentTableCampaign!=="undefined"&&currentTableCampaign){currentTableCampaign.actionNotification={id:`ritual_${Date.now()}`,kind:"Ritual",icon:"✦",title:`${currentTableCharacter?.name||"Personagem"} utilizou ${r.name}`,detail:total!==null?`${ELEMENTS[r.element]} • Resultado: ${total}`:`${ELEMENTS[r.element]} • ${ACTIONS[r.action]?.name}`,createdAt:Date.now()};if(typeof saveTableCampaign==="function")saveTableCampaign();}if(typeof addSystemChatMessage==="function")addSystemChatMessage(`${currentTableCharacter?.name||"O personagem"} utilizou o ritual ${r.name}.`);}
function openGrimoireV2(){if(typeof syncCurrentTableCharacterV2==="function")syncCurrentTableCharacterV2();const g=normalizeGrimoire(currentTableCharacter?.grimoireV2||currentTableCharacter?.grimoire);openTablePanel("GRIMÓRIO","Rituais",`<div class="table-panel-list">${g.rituals.length?g.rituals.map(mesaRitualCard).join(""):'<div class="editor-empty-state"><p>Nenhum ritual salvo na ficha.</p></div>'}</div>`);document.querySelectorAll(".grim-v2-use").forEach(b=>b.addEventListener("click",()=>useRitual(g.rituals[Number(b.dataset.index)])));}
function installMesa(){if(typeof openTablePanel!=="function")return;window.openGrimoirePanel=openGrimoireV2;try{openGrimoirePanel=openGrimoireV2;}catch{} }

function addStyle(){if(document.getElementById("grimorioV2Style"))return;const s=document.createElement("style");s.id="grimorioV2Style";s.textContent=`.grim-v2-editor h3{margin:22px 0 10px}.grim-v2-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}.grim-v2-check{display:flex;gap:9px;align-items:flex-start;padding:11px;border:1px solid var(--border);border-radius:11px;background:#15151d}.grim-v2-check small,.grim-v2-counter small{display:block;color:var(--text3);margin-top:4px;line-height:1.4}.grim-v2-counters{display:flex;flex-direction:column;gap:8px}.grim-v2-counter{display:grid;grid-template-columns:1fr 34px 38px 34px;gap:7px;align-items:center;padding:10px;border:1px solid var(--border);border-radius:11px;background:#15151d}.grim-v2-counter button{height:34px;border-radius:8px;border:1px solid var(--border);background:#20202b;color:white}.grim-v2-counter span{text-align:center;font-weight:800}.grim-v2-builder{margin-top:24px;padding:16px;border:1px solid var(--primary);border-radius:15px;background:#12121a}.grim-v2-fields,.grim-v2-builder-enh{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.grim-v2-fields label,.grim-v2-builder-enh label{display:flex;flex-direction:column;gap:6px}.grim-v2-fields input,.grim-v2-fields select,.grim-v2-builder-enh input{width:100%}.grim-v2-preview{margin:14px 0;padding:13px;border-radius:11px;background:#0d0d13;border:1px solid var(--border)}.grim-v2-ritual{display:flex;justify-content:space-between;gap:12px;padding:12px;margin:8px 0;border:1px solid var(--border);border-radius:11px;background:#15151d}.grim-v2-ritual p{margin:5px 0}.grim-v2-ritual small{color:var(--text3)}`;document.head.appendChild(s);}

function init(){addStyle();if(document.querySelector(".character-editor-page"))installEditor();if(document.querySelector(".table-app")){const t=setInterval(()=>{installMesa();if(typeof openTablePanel==="function")clearInterval(t);},100);}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();