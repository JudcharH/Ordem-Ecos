/*==========================================================
= MESA - REAÇÕES, HABILIDADES E AVISOS DE AÇÃO
==========================================================*/
(function(){
"use strict";

const REACTION_IDS=["desvio-absoluto","revidar","devolver-ataque"];
const DEFAULT_COSTS={"desvio-absoluto":2,"revidar":1,"devolver-ataque":1};
let lastNoticeId=null;
let noticeTimer=null;

function slug(value){
return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}

function abilitiesOf(character){
if(!character)return[];
const lists=[character.abilities,character.acquiredAbilities,character.systemData?.abilities,character.skills?.abilities];
const list=lists.find(Array.isArray)||[];
return list.map(ability=>{
if(typeof normalizeCharacterAbility==="function")return normalizeCharacterAbility(ability);
if(typeof ability==="string")return{id:slug(ability),name:ability,description:""};
return ability||null;
}).filter(Boolean);
}

function abilityById(character,id){
const wanted=slug(id);
return abilitiesOf(character).find(ability=>slug(ability.id||ability.abilityId||ability.name)===wanted)||null;
}

function hasAbility(character,id){return Boolean(abilityById(character,id));}
function abilityName(ability){return String(ability?.name||ability?.title||"Habilidade");}

function abilityCost(ability){
const id=slug(ability?.id||ability?.abilityId||ability?.name);
for(const cost of [ability?.useCost,ability?.activationCost,ability?.cost]){
if(cost&&typeof cost==="object"&&slug(cost.type)==="pa")return Math.max(0,Number(cost.value)||0);
}
for(const value of [ability?.paCost,ability?.costPA,ability?.actionPointCost,typeof ability?.cost==="number"?ability.cost:null]){
if(value!==null&&value!==undefined&&Number.isFinite(Number(value)))return Math.max(0,Number(value)||0);
}
const text=[ability?.cost,ability?.description,ability?.effect].filter(v=>typeof v==="string").join(" ");
const match=text.match(/(\d+)\s*PA\b/i);
if(match)return Math.max(0,Number(match[1])||0);
return DEFAULT_COSTS[id]||0;
}

function isPassive(ability){
const type=slug(ability?.type||ability?.activationType||ability?.category||ability?.kind);
return ability?.passive===true||type==="passivo"||type==="passive";
}

function spendPA(character,cost){
cost=Math.max(0,Number(cost)||0);
character.status=character.status||{};
const current=Math.max(0,Number(character.status.paAtual)||0);
if(current<cost){addSystemChatMessage(`${character.name||"O personagem"} não possui PA suficiente.`);return false;}
character.status.paAtual=current-cost;
const saved=saveDamagedCharacter(character);
if(saved){refreshCurrentTableCharacter();refreshOpenCharacterPanel();}
return saved;
}

function aggressorOf(request){return request?.attackerCharacterId?getLiveCharacter(request.attackerCharacterId):null;}
function defenseOf(character){return Math.max(0,Number(character?.defense?.total)||0);}
function attackFormula(attack){return attack?.attack||attack?.roll||attack?.test||attack?.formula||"1d20";}

function ensureNoticeStyle(){
if(document.getElementById("tableActionNoticeStyle"))return;
const style=document.createElement("style");
style.id="tableActionNoticeStyle";
style.textContent=`
.table-action-layer{position:fixed;inset:0;z-index:5000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(3,3,8,.08);cursor:pointer}
.table-action-card{width:min(410px,calc(100vw - 40px));min-height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:26px 30px;border-radius:22px;background:radial-gradient(circle at 50% 0%,rgba(130,70,230,.20),transparent 55%),linear-gradient(180deg,rgba(23,23,33,.98),rgba(10,10,16,.98));border:1px solid rgba(180,125,255,.52);box-shadow:0 0 0 1px rgba(255,255,255,.035) inset,0 24px 80px rgba(0,0,0,.70),0 0 35px rgba(105,45,190,.30);text-align:center;animation:tableActionIn .34s cubic-bezier(.2,.85,.25,1.2)}
.table-action-card.leaving{animation:tableActionOut .22s ease forwards}
.table-action-icon{width:54px;height:54px;display:flex;align-items:center;justify-content:center;border-radius:16px;background:rgba(120,65,215,.17);border:1px solid rgba(180,125,255,.32);font-size:27px;color:#D5B5FF}
.table-action-kind{font-family:'Orbitron',sans-serif;font-size:9px;font-weight:800;letter-spacing:2.2px;text-transform:uppercase;color:#B98AFF}
.table-action-title{font-family:'Orbitron',sans-serif;font-size:17px;line-height:1.35;color:white}
.table-action-detail{max-width:330px;font-size:12px;line-height:1.55;color:var(--text2,#B9B9C6)}
.table-action-hint{margin-top:7px;font-size:9px;color:var(--text3,#777786)}
.ability-card-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px}.ability-card-footer span{font-size:10px;color:var(--primaryLight,#C9A6FF)}
@keyframes tableActionIn{from{opacity:0;transform:scale(.78) translateY(18px);filter:blur(4px)}to{opacity:1;transform:scale(1);filter:blur(0)}}
@keyframes tableActionOut{to{opacity:0;transform:scale(.92) translateY(-8px);filter:blur(3px)}}`;
document.head.appendChild(style);
}

function closeNotice(){
const layer=document.querySelector(".table-action-layer");
if(!layer)return;
layer.querySelector(".table-action-card")?.classList.add("leaving");
setTimeout(()=>layer.remove(),210);
if(noticeTimer){clearTimeout(noticeTimer);noticeTimer=null;}
}

function showNotice(notice){
if(!notice?.id||notice.id===lastNoticeId)return;
lastNoticeId=notice.id;ensureNoticeStyle();closeNotice();
const layer=document.createElement("div");layer.className="table-action-layer";
layer.innerHTML=`<div class="table-action-card"><div class="table-action-icon">${escapeTableHTML(notice.icon||"✦")}</div><span class="table-action-kind">${escapeTableHTML(notice.kind||"Ação")}</span><strong class="table-action-title">${escapeTableHTML(notice.title||"Ação realizada")}</strong>${notice.detail?`<p class="table-action-detail">${escapeTableHTML(notice.detail)}</p>`:""}<small class="table-action-hint">Clique em qualquer lugar para fechar</small></div>`;
layer.addEventListener("click",closeNotice,{once:true});document.body.appendChild(layer);noticeTimer=setTimeout(closeNotice,4200);
}

function publishNotice({kind="Ação",icon="✦",title,detail=""}){
refreshCurrentTableCampaign();if(!currentTableCampaign)return;
const notice={id:`action_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,kind,icon,title,detail,createdAt:Date.now()};
currentTableCampaign.actionNotification=notice;saveTableCampaign();showNotice(notice);
}

function checkNotice(){
refreshCurrentTableCampaign();const notice=currentTableCampaign?.actionNotification;if(notice&&notice.id!==lastNoticeId)showNotice(notice);
}

function installAbilityMenu(){
if(typeof playerMenuItems==="undefined"||!Array.isArray(playerMenuItems))return;
if(!playerMenuItems.some(item=>item.id==="abilities")){
const index=playerMenuItems.findIndex(item=>item.id==="attacks");
playerMenuItems.splice(index>=0?index+1:1,0,{id:"abilities",icon:"✦",label:"Habilidades"});
}
if(currentTableRole==="player")createRoleMenu();
}

function renderAbilityCard(ability,passive){
const id=slug(ability.id||ability.abilityId||ability.name);const cost=abilityCost(ability);const reactionOnly=REACTION_IDS.includes(id);
return `<div class="table-panel-card"><h3>${escapeTableHTML(abilityName(ability))}</h3><p>${escapeTableHTML(ability.description||ability.effect||"Sem descrição.")}</p><div class="ability-card-footer"><span>${passive?"Passiva":reactionOnly?"Usada como reação":`${cost} PA`}</span>${!passive&&!reactionOnly?`<button type="button" class="primary-button use-table-ability" data-ability-id="${escapeTableHTML(id)}">Usar</button>`:""}</div></div>`;
}

function openAbilitiesPanel(){
refreshCurrentTableCharacter();const character=currentTableCharacter;const abilities=abilitiesOf(character);const passive=abilities.filter(isPassive);const active=abilities.filter(a=>!isPassive(a));
openTablePanel("PERSONAGEM","Habilidades",`<div class="table-panel-section"><h3 class="table-panel-section-title">Passivas</h3><div class="table-panel-list">${passive.length?passive.map(a=>renderAbilityCard(a,true)).join(""):'<div class="editor-empty-state"><p>Nenhuma habilidade passiva.</p></div>'}</div></div><div class="table-panel-section"><h3 class="table-panel-section-title">Ativas</h3><div class="table-panel-list">${active.length?active.map(a=>renderAbilityCard(a,false)).join(""):'<div class="editor-empty-state"><p>Nenhuma habilidade ativa.</p></div>'}</div></div>`);
document.querySelectorAll(".use-table-ability").forEach(button=>button.addEventListener("click",()=>useMenuAbility(button.dataset.abilityId)));
}

function useMenuAbility(id){
refreshCurrentTableCharacter();const character=currentTableCharacter;const ability=abilityById(character,id);if(!ability||isPassive(ability))return;const cost=abilityCost(ability);if(!spendPA(character,cost))return;
publishNotice({kind:"Habilidade",icon:"✦",title:`${character.name||"Personagem"} utilizou ${abilityName(ability)}`,detail:cost?`Custo: ${cost} PA`:"Sem custo de PA"});
addSystemChatMessage(`${character.name||"O personagem"} utilizou ${abilityName(ability)}${cost?` e gastou ${cost} PA`:""}.`);openAbilitiesPanel();
}

const originalHandleMenuAction=handleMenuAction;
handleMenuAction=function(action,button){if(action==="abilities"){clearActiveMenuButtons();button?.classList.add("active");openAbilitiesPanel();return;}originalHandleMenuAction(action,button);};

function finishOriginalAttack(request,character,options={}){
const baseDefense=defenseOf(character);const baseRD=Math.max(0,Number(character?.damageReduction?.total)||0);
request.reaction={type:"ability",abilityId:options.abilityId||null,abilityName:options.abilityName||"Habilidade",paCost:Math.max(0,Number(options.paCost)||0),baseDefense,finalDefense:baseDefense,baseRD,reactionRD:baseRD,answeredAt:Date.now()};
request.hit=options.forceMiss===true?false:Number(request.attackResult)>=baseDefense;request.resolved=true;request.active=false;request.updatedAt=Date.now();
if(request.hit){currentTableCampaign.combat.damageContext={id:`damage_${Date.now()}`,active:true,attackRequestId:request.id,attackName:request.attackName,attackerCharacterId:request.attackerCharacterId||null,targetCharacterId:character.id,targetName:character.name||"Alvo",reaction:"ability",abilityId:options.abilityId||null,damageReduction:baseRD,flatReduction:Math.max(0,Number(options.flatReduction)||0),damageMultiplier:Number.isFinite(Number(options.damageMultiplier))?Math.max(0,Number(options.damageMultiplier)):1,consumed:false,createdAt:Date.now()};}else currentTableCampaign.combat.damageContext=null;
currentTableCampaign.combat.updatedAt=Date.now();markAttackMessageAsApplied(request);saveTableCampaign();closeCurrentPanel();refreshCurrentTableCharacter();refreshOpenCharacterPanel();renderPublicChat();publishAttackResult(request,character);
}

const originalPublishAttackResult=publishAttackResult;
publishAttackResult=function(request,target){
if(request?.reaction?.type!=="ability"){originalPublishAttackResult(request,target);return;}
const name=request.reaction.abilityName||request.reaction.abilityId||"Habilidade";const attack=Number(request.attackResult)||0;const defense=Number(request.reaction.finalDefense)||0;
addSystemChatMessage(request.hit?`${target.name||"O alvo"} utilizou ${name}. Ataque ${attack} contra Defesa ${defense}: o ataque acertou.`:`${target.name||"O alvo"} utilizou ${name}. O ataque errou.`);
};

function rollReactionAttack(attack){const formula=resolveCharacterFormula(attackFormula(attack),currentTableCharacter);const roll=rollDiceExpression(formula);return roll?{...roll,formula}:null;}

function addReactionRoll({character,attack,index,result,target,label,hit,comparison,value,abilityId}){
addRollChatMessage(`${label} • ${attack.name||"Ataque"}`,result.formula,result.total,result.detail||"",{rollKind:"attack",attackIndex:index,attackName:attack.name||"Ataque",applied:true,isCounterAttack:true,forcedTargetCharacterId:target?.id||null});
refreshCurrentTableCampaign();const message=[...(currentTableCampaign.chatMessages||[])].reverse().find(item=>item.type==="roll"&&item.characterId===character.id&&item.attackName===(attack.name||"Ataque")&&Number(item.total)===Number(result.total));
if(message){message.applied=true;message.attackApplication={targetCharacterId:target?.id||null,targetName:target?.name||"Agressor",attackResult:Number(result.total)||0,finalDefense:Number(value)||0,reaction:abilityId,comparisonLabel:comparison,hit:Boolean(hit)};saveTableCampaign();renderPublicChat();}
}

function openReactionAttackChoice(id,ability,request){
const attacks=getCharacterReadyAttacks(currentTableCharacter);const aggressor=aggressorOf(request);if(!aggressor){addSystemChatMessage("O agressor não possui uma ficha válida.");return;}
openTablePanel("REAÇÃO",abilityName(ability),`<div class="table-panel-card"><h3>Alvo: ${escapeTableHTML(aggressor.name||"Agressor")}</h3><p>Escolha um dos ataques prontos da sua ficha.</p></div><div class="table-panel-list">${attacks.length?attacks.map((attack,index)=>`<button type="button" class="table-panel-card advanced-reaction-attack" data-index="${index}"><h3>${escapeTableHTML(attack.name||`Ataque ${index+1}`)}</h3><p>${escapeTableHTML(String(attackFormula(attack)))}</p></button>`).join(""):'<div class="editor-empty-state"><p>Nenhum ataque pronto foi encontrado.</p></div>'}</div>`);
document.querySelectorAll(".advanced-reaction-attack").forEach(button=>button.addEventListener("click",()=>resolveReactionAttack(id,ability,request,attacks[Number(button.dataset.index)],Number(button.dataset.index),aggressor)));
}

function resolveReactionAttack(id,ability,request,attack,index,aggressor){
if(!attack)return;const result=rollReactionAttack(attack);if(!result)return;const name=abilityName(ability);const cost=abilityCost(ability);
if(id==="revidar"){
const defense=defenseOf(aggressor);const success=Number(result.total)>=defense;addReactionRoll({character:currentTableCharacter,attack,index,result,target:aggressor,label:name,hit:success,comparison:"Defesa",value:defense,abilityId:id});finishOriginalAttack(request,currentTableCharacter,{abilityId:id,abilityName:name,paCost:cost,damageMultiplier:success?.5:1});publishNotice({kind:"Reação",icon:"↩",title:`${currentTableCharacter.name} utilizou ${name}`,detail:success?`Acertou ${aggressor.name}; o dano original será reduzido pela metade.`:`Errou contra ${aggressor.name}; o ataque original continua.`});return;
}
const original=Number(request.attackResult)||0;const success=Number(result.total)>original;addReactionRoll({character:currentTableCharacter,attack,index,result,target:aggressor,label:name,hit:success,comparison:"Ataque original",value:original,abilityId:id});finishOriginalAttack(request,currentTableCharacter,{abilityId:id,abilityName:name,paCost:cost,forceMiss:success});publishNotice({kind:"Reação",icon:"⇄",title:`${currentTableCharacter.name} utilizou ${name}`,detail:success?`Superou o ataque original e atingiu ${aggressor.name}.`:"Não superou o ataque original."});
}

openAttackReactionAbilityPanel=function(){
refreshCurrentTableCharacter();const character=currentTableCharacter;const abilities=REACTION_IDS.map(id=>abilityById(character,id)).filter(Boolean);
if(!abilities.length){openTablePanel("REAÇÃO","Habilidades",'<div class="editor-empty-state"><p>Nenhuma habilidade de reação disponível.</p><button type="button" id="returnToAttackReaction" class="secondary-button">Voltar</button></div>');document.getElementById("returnToAttackReaction")?.addEventListener("click",()=>{const request=currentTableCampaign?.combat?.pendingAttack;if(request)openAttackReactionPanel(request);});return;}
const current=Math.max(0,Number(character.status?.paAtual)||0);openTablePanel("REAÇÃO","Escolher Habilidade",`<div class="table-panel-list">${abilities.map(ability=>{const cost=abilityCost(ability);const id=slug(ability.id||ability.abilityId||ability.name);return `<button type="button" class="table-panel-card reaction-ability-choice" data-ability-id="${escapeTableHTML(id)}" ${cost>current?"disabled":""}><h3>${escapeTableHTML(abilityName(ability))}</h3><p>${escapeTableHTML(ability.description||ability.effect||"")}</p><span class="reaction-ability-cost">${cost} PA</span></button>`;}).join("")}</div>`);document.querySelectorAll(".reaction-ability-choice").forEach(button=>button.addEventListener("click",()=>selectAttackReactionAbility(button.dataset.abilityId)));
};

selectAttackReactionAbility=function(id){
refreshCurrentTableCampaign();refreshCurrentTableCharacter();const request=currentTableCampaign?.combat?.pendingAttack;const character=currentTableCharacter;if(!request||!character||request.targetCharacterId!==character.id||request.resolved===true)return;
id=slug(id);const ability=abilityById(character,id);if(!ability){addSystemChatMessage("A habilidade selecionada não foi encontrada.");return;}const cost=abilityCost(ability);if(!spendPA(character,cost))return;
if(id==="desvio-absoluto"){finishOriginalAttack(request,character,{abilityId:id,abilityName:abilityName(ability),paCost:cost,forceMiss:true});publishNotice({kind:"Reação",icon:"◇",title:`${character.name} utilizou ${abilityName(ability)}`,detail:"O ataque errou automaticamente."});return;}
currentTableCampaign.combat.reactionAbilityContext={id:`reaction_${Date.now()}`,active:true,abilityId:id,originalAttackId:request.id,defenderCharacterId:character.id,aggressorCharacterId:request.attackerCharacterId||null,createdAt:Date.now()};saveTableCampaign();openReactionAttackChoice(id,ability,request);
};

const originalStartAttackTargetSelection=startAttackTargetSelection;
startAttackTargetSelection=function(messageId){
refreshCurrentTableCampaign();const message=(currentTableCampaign?.chatMessages||[]).find(item=>item.id===messageId);
if(message?.forcedTargetCharacterId){if(currentTableRole!=="master"&&message.characterId!==currentTableCharacter?.id){addSystemChatMessage("Você não pode aplicar o ataque de outro personagem.");return;}const target=getLiveCharacter(message.forcedTargetCharacterId);if(!target){addSystemChatMessage("O agressor definido não foi encontrado.");return;}pendingAttackApplication={messageId:message.id,attackResult:Math.max(0,Number(message.total)||0),attackName:message.attackName||"Ataque",attackIndex:message.attackIndex??null,attackerCharacterId:message.characterId||null,attackerName:message.author||"Atacante"};createAttackReactionRequest(target);return;}originalStartAttackTargetSelection(messageId);
};

const originalCreateAttackReactionRequest=createAttackReactionRequest;
createAttackReactionRequest=function(target){const attacker=pendingAttackApplication?.attackerName||currentTableCharacter?.name||"Atacante";const attack=pendingAttackApplication?.attackName||"Ataque";originalCreateAttackReactionRequest(target);publishNotice({kind:"Ataque",icon:"⚔",title:`${attacker} atacou ${target?.name||"o alvo"}`,detail:attack});};

const originalAnswerAttackReaction=answerAttackReaction;
answerAttackReaction=function(type){
const dodge=type==="dodge";const character=currentTableCharacter;const always=dodge&&hasAbility(character,"sempre-alerta");const agility=Math.max(0,Number(character?.attributes?.agi)||0);originalAnswerAttackReaction(type);if(!always)return;refreshCurrentTableCampaign();const context=currentTableCampaign?.combat?.damageContext;if(context&&context.active===true&&context.targetCharacterId===character?.id){context.flatReduction=agility*2;context.automaticAbility="sempre-alerta";saveTableCampaign();publishNotice({kind:"Passiva",icon:"👁",title:`${character.name} ativou Sempre Alerta`,detail:`O dano será reduzido em ${agility*2}.`});}
};

const originalApplyClassicDamageToCharacter=applyClassicDamageToCharacter;
applyClassicDamageToCharacter=function(character){
const context=currentTableCampaign?.combat?.damageContext;const matches=context&&context.active===true&&context.consumed!==true&&context.targetCharacterId===character?.id&&pendingDamageApplication;if(!matches){originalApplyClassicDamageToCharacter(character);return;}
const original=Math.max(0,Number(pendingDamageApplication.damage)||0);const rd=Math.max(0,Number(context.damageReduction)||0);const flat=Math.max(0,Number(context.flatReduction)||0);const multiplier=Number.isFinite(Number(context.damageMultiplier))?Math.max(0,Number(context.damageMultiplier)):1;const final=Math.floor(Math.max(0,Math.max(0,original-rd)-flat)*multiplier);context.damageReduction=Math.max(0,original-final);context.calculation={originalDamage:original,baseRD:rd,flatReduction:flat,multiplier,finalDamage:final};saveTableCampaign();originalApplyClassicDamageToCharacter(character);
};

installAbilityMenu();ensureNoticeStyle();checkNotice();
window.addEventListener("storage",event=>{if(event.key===TABLE_CAMPAIGN_STORAGE)setTimeout(checkNotice,30);});
setInterval(checkNotice,700);

})();