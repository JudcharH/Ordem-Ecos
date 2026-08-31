/*==========================================================
= MESA — EFEITOS AUTOMÁTICOS DAS HABILIDADES V2
==========================================================*/
(function(){
"use strict";

let installed=false;
const processed=new Set();

function slug(value){
    return String(value||"")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim().toLowerCase()
        .replace(/[^a-z0-9]+/g,"-")
        .replace(/^-+|-+$/g,"");
}

function abilitiesOf(character){
    const lists=[
        character?.abilities,
        character?.acquiredAbilities,
        character?.systemData?.abilities,
        character?.skills?.abilities
    ];
    const list=lists.find(Array.isArray)||[];
    return list.map(item=>{
        if(typeof normalizeCharacterAbility==="function") return normalizeCharacterAbility(item);
        if(typeof item==="string") return {id:slug(item),name:item};
        return item;
    }).filter(Boolean);
}

function hasAbility(character,id){
    const wanted=slug(id);
    return abilitiesOf(character).some(item=>slug(item?.id||item?.abilityId||item?.name)===wanted);
}

function state(){
    currentTableCampaign.combat=currentTableCampaign.combat||{};
    currentTableCampaign.combat.abilityState=currentTableCampaign.combat.abilityState||{};
    const result=currentTableCampaign.combat.abilityState;
    result.processedEffects=result.processedEffects||{};
    result.pressure=result.pressure||{};
    result.nextAttackBonuses=result.nextAttackBonuses||{};
    result.roundUses=result.roundUses||{};
    return result;
}

function round(){return Number(currentTableCampaign?.combat?.round)||0;}
function roundKey(id,characterId){return `${id}:${characterId}:${round()}`;}

function notify(title,detail,icon="✦"){
    currentTableCampaign.actionNotification={
        id:`ability_effect_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        kind:"Habilidade",
        icon,
        title,
        detail,
        createdAt:Date.now()
    };
}

function addCondition(character,name,source){
    if(!character) return false;
    const id=slug(name);
    const list=Array.isArray(character.conditions)
        ? character.conditions
        : Array.isArray(character.status?.conditions)
            ? character.status.conditions
            : [];

    const exists=list.some(condition=>slug(
        typeof condition==="string"?condition:condition?.id||condition?.name
    )===id);

    if(!exists){
        list.push({id,name,source,appliedAt:Date.now()});
    }

    character.conditions=list;
    character.status=character.status||{};
    character.status.conditions=list;
    return saveDamagedCharacter(character);
}

function recoverTemporaryPA(character,amount){
    character.status=character.status||{};
    const current=Math.max(0,Number(character.status.paAtual)||0);
    const maximum=Math.max(current,Number(character.status.paMax)||0);
    character.status.paAtual=Math.min(maximum,current+Math.max(0,Number(amount)||0));
    return saveDamagedCharacter(character);
}

function attackerOf(message){
    const id=message?.characterId||message?.attackerCharacterId||message?.authorCharacterId;
    return id&&typeof getLiveCharacter==="function"?getLiveCharacter(id):null;
}

function targetOf(message){
    const application=message?.attackApplication||{};
    const id=application.targetCharacterId||message?.forcedTargetCharacterId||message?.targetCharacterId;
    return id&&typeof getLiveCharacter==="function"?getLiveCharacter(id):null;
}

function isAttack(message){
    return message?.type==="roll"&&(
        message?.rollKind==="attack"||
        message?.attackName||
        message?.attackIndex!==undefined
    );
}

function wasApplied(message){
    return message?.applied===true||Boolean(message?.attackApplication);
}

function wasHit(message){
    return message?.attackApplication?.hit===true||message?.hit===true;
}

function wasCritical(message){
    return message?.critical===true||message?.isCritical===true||message?.criticalHit===true;
}

function processCriticalEffects(message,attacker,target){
    if(!wasCritical(message)||!attacker||!target) return;

    if(hasAbility(attacker,"carrasco")){
        addCondition(target,"Debilitado","Carrasco");
        notify(`${attacker.name} ativou Carrasco`,`${target.name} recebeu a condição Debilitado.`,"☠");
        addSystemChatMessage(`${attacker.name} ativou Carrasco: ${target.name} ficou Debilitado.`);
    }

    if(hasAbility(attacker,"ferimento-profundo")){
        addCondition(target,"Sangramento","Ferimento Profundo");
        notify(`${attacker.name} causou Ferimento Profundo`,`${target.name} recebeu Sangramento.`,"🩸");
        addSystemChatMessage(`${attacker.name} ativou Ferimento Profundo: ${target.name} recebeu Sangramento.`);
    }

    if(hasAbility(attacker,"aproveitador")){
        const key=roundKey("aproveitador",attacker.id);
        const effects=state();
        if(!effects.roundUses[key]){
            effects.roundUses[key]=Date.now();
            recoverTemporaryPA(attacker,1);
            notify(`${attacker.name} ativou Aproveitador`,`Recuperou 1 PA temporário.`,"⚡");
            addSystemChatMessage(`${attacker.name} ativou Aproveitador e recuperou 1 PA.`);
        }
    }
}

function processPressure(message,attacker,target,hit){
    if(!attacker||!hasAbility(attacker,"pressao-constante")) return;
    const effects=state();
    const record=effects.pressure[attacker.id]||{targetId:null,hits:0,active:false};

    if(!hit){
        record.targetId=null;
        record.hits=0;
        record.active=false;
    }
    else if(record.targetId!==target?.id){
        record.targetId=target?.id||null;
        record.hits=1;
        record.active=false;
    }
    else{
        record.hits+=1;
        record.active=record.hits>=2;
    }

    effects.pressure[attacker.id]=record;

    if(record.active){
        notify(`${attacker.name} ativou Pressão Constante`,`A partir do próximo ataque contra ${target?.name||"o mesmo alvo"}, recebe +1 dado de dano até errar ou trocar de alvo.`,"💢");
    }
}

function processInstinct(message,attacker,target,hit){
    if(hit||!attacker||!target) return;
    if(!hasAbility(target,"instinto-de-combate")) return;

    const effects=state();
    effects.nextAttackBonuses[target.id]={
        source:"instinto-de-combate",
        bonus:3,
        targetId:attacker.id,
        createdAt:Date.now()
    };
    notify(`${target.name} ativou Instinto de Combate`,`Recebe +3 no próximo ataque contra ${attacker.name}.`,"⚔");
    addSystemChatMessage(`${target.name} ativou Instinto de Combate e recebe +3 no próximo ataque contra ${attacker.name}.`);
}

function processAttack(message){
    if(!isAttack(message)||!wasApplied(message)) return;
    const id=message.id||`${message.createdAt}:${message.characterId}:${message.total}`;
    if(processed.has(id)||state().processedEffects[id]) return;

    const attacker=attackerOf(message);
    const target=targetOf(message);
    const hit=wasHit(message);

    processCriticalEffects(message,attacker,target);
    processPressure(message,attacker,target,hit);
    processInstinct(message,attacker,target,hit);

    processed.add(id);
    state().processedEffects[id]=Date.now();
    saveTableCampaign();
}

function processMessages(){
    if(typeof refreshCurrentTableCampaign!=="function"||typeof saveTableCampaign!=="function") return;
    refreshCurrentTableCampaign();
    if(!currentTableCampaign) return;
    const messages=currentTableCampaign.chatMessages||[];
    messages.slice(-80).forEach(processAttack);
}

function exposeBonuses(){
    window.getSystemBasePendingAttackBonus=function(characterId,targetId){
        refreshCurrentTableCampaign();
        const bonus=state().nextAttackBonuses?.[characterId];
        if(!bonus||bonus.targetId!==targetId) return 0;
        return Math.max(0,Number(bonus.bonus)||0);
    };

    window.consumeSystemBasePendingAttackBonus=function(characterId,targetId){
        refreshCurrentTableCampaign();
        const effects=state();
        const bonus=effects.nextAttackBonuses?.[characterId];
        if(!bonus||bonus.targetId!==targetId) return 0;
        const value=Math.max(0,Number(bonus.bonus)||0);
        delete effects.nextAttackBonuses[characterId];
        saveTableCampaign();
        return value;
    };

    window.getSystemBasePressureDamageDice=function(characterId,targetId){
        refreshCurrentTableCampaign();
        const record=state().pressure?.[characterId];
        return record?.active&&record.targetId===targetId?1:0;
    };
}

function install(){
    if(installed||!document.querySelector(".table-app")) return;
    if(typeof refreshCurrentTableCampaign!=="function") return;
    installed=true;
    exposeBonuses();
    setInterval(processMessages,450);
    processMessages();
}

const timer=setInterval(()=>{
    install();
    if(installed) clearInterval(timer);
},100);
setTimeout(install,0);
})();
