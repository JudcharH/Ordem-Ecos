/*==========================================================
= MESA V2 — CORREÇÃO DA ROLAGEM DE DANO
==========================================================*/
(function(){
"use strict";

function num(value){
    const parsed=Number(value);
    return Number.isFinite(parsed)?parsed:0;
}

function refresh(){
    if(typeof refreshCurrentTableCampaign==="function") refreshCurrentTableCampaign();
    if(typeof refreshCurrentTableCharacter==="function") refreshCurrentTableCharacter();
    if(typeof syncCurrentTableCharacterV2==="function") syncCurrentTableCharacterV2();
}

function currentAttacks(){
    refresh();
    const character=currentTableCharacter;
    if(!character) return [];
    const source=[character.quickAttacks,character.attacks,character.ataquesRapidos]
        .find(Array.isArray)||[];
    return source.slice(0,3);
}

function resolveV2Formula(formula,character){
    const attrs=character?.attributes||{};
    const replacements={
        corpo:num(attrs.corpo??attrs.for??attrs.vig),
        foco:num(attrs.foco??attrs.agi??attrs.pre),
        nexo:num(attrs.nexo??attrs.int),
        for:num(attrs.corpo??attrs.for??attrs.vig),
        agi:num(attrs.foco??attrs.agi??attrs.pre),
        int:num(attrs.nexo??attrs.int),
        vig:num(attrs.corpo??attrs.vig??attrs.for),
        pre:num(attrs.foco??attrs.pre??attrs.agi)
    };

    let resolved=String(formula||"");
    Object.entries(replacements).forEach(([key,value])=>{
        resolved=resolved.replace(new RegExp(`\\b${key}\\b`,"gi"),String(value));
    });

    if(typeof resolveCharacterFormula==="function"){
        try{
            resolved=resolveCharacterFormula(resolved,character)||resolved;
        }
        catch(error){
            console.warn("Falha ao resolver fórmula de dano V2:",error);
        }
    }
    return resolved;
}

function rollFormula(formula){
    if(typeof rollDiceExpression!=="function") return null;
    try{
        return rollDiceExpression(formula);
    }
    catch(error){
        console.error("Erro ao rolar dano:",error);
        return null;
    }
}

function detailOf(result){
    if(result?.detail) return result.detail;
    if(Array.isArray(result?.details)){
        return result.details.map(part=>{
            if(part?.type==="dice") return `${part.formula} [${(part.rolls||[]).join(", ")}]`;
            return String(part?.value??"");
        }).join(" + ");
    }
    return "";
}

function notifyDamage(attack,total){
    refresh();
    if(!currentTableCampaign) return;
    currentTableCampaign.actionNotification={
        id:`action_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
        kind:"Dano",
        icon:"💥",
        title:`${currentTableCharacter?.name||"O personagem"} rolou dano`,
        detail:`${attack.name||"Ataque"}: ${total} de dano.`,
        createdAt:Date.now()
    };
    if(typeof saveTableCampaign==="function") saveTableCampaign();
}

function rollDamageV2(index){
    refresh();
    const attack=currentAttacks()[Number(index)];
    if(!attack){
        if(typeof addSystemChatMessage==="function") addSystemChatMessage("O ataque selecionado não foi encontrado.");
        return;
    }

    const raw=String(attack.damage||attack.dano||"").trim();
    if(!raw){
        if(typeof addSystemChatMessage==="function") addSystemChatMessage(`${attack.name||"Este ataque"} não possui dano configurado.`);
        return;
    }

    const formula=resolveV2Formula(raw,currentTableCharacter);
    const result=rollFormula(formula);
    if(!result){
        if(typeof addSystemChatMessage==="function") addSystemChatMessage(`Não foi possível rolar a fórmula de dano: ${raw}.`);
        return;
    }

    const total=num(result.total);
    if(typeof addRollChatMessage==="function"){
        addRollChatMessage(
            `Dano • ${attack.name||`Ataque ${Number(index)+1}`}`,
            formula,
            total,
            detailOf(result),
            {
                rollKind:"damage",
                attackIndex:Number(index),
                attackName:attack.name||`Ataque ${Number(index)+1}`,
                damageType:attack.damageType||attack.tipoDano||"impacto",
                applied:false
            }
        );
    }
    notifyDamage(attack,total);
}

window.rollTableV2Damage=rollDamageV2;

// Usa delegação em captura para funcionar mesmo quando o painel é recriado.
document.addEventListener("click",event=>{
    const button=event.target.closest?.(".table-v2-roll-damage");
    if(!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    rollDamageV2(Number(button.dataset.index)||0);
},true);
})();
