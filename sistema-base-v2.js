/*==========================================================
=  SISTEMA BASE V2 — MIGRAÇÃO PRINCIPAL
=  Corpo, Foco, Nexo, PV, PM e Defesa
==========================================================*/
(function(){
"use strict";

const STORAGE_KEY="ordem_characters";

function numberValue(id,fallback=0){
    const element=document.getElementById(id);
    const value=Number(element?.value);
    return Number.isFinite(value)?value:fallback;
}

function setValue(id,value){
    const element=document.getElementById(id);
    if(element) element.value=String(value);
}

function renameCard(inputId,label){
    const input=document.getElementById(inputId);
    const card=input?.closest(".attribute-card");
    const title=card?.querySelector("span");
    if(title) title.textContent=label;
}

function hideCard(inputId){
    const input=document.getElementById(inputId);
    const card=input?.closest(".attribute-card");
    if(card) card.style.display="none";
}

function renamePDToPM(){
    document.querySelectorAll(".pd-grid .status-card span").forEach(label=>{
        label.textContent=label.textContent.replace(/PD/g,"PM");
    });
}

function getEditingCharacter(){
    try{
        const params=new URLSearchParams(location.search);
        const id=params.get("id")||params.get("character");
        if(!id) return null;
        const characters=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
        return Array.isArray(characters)?characters.find(item=>item.id===id)||null:null;
    }
    catch{return null;}
}

function loadNewAttributes(){
    const character=getEditingCharacter();
    if(!character) return;

    const attributes=character.attributes||{};
    const status=character.status||{};

    setValue("attributeFOR",attributes.corpo??attributes.for??attributes.vig??1);
    setValue("attributeAGI",attributes.foco??attributes.agi??attributes.pre??1);
    setValue("attributeINT",attributes.nexo??attributes.int??1);

    if(status.pmAtual!==undefined) setValue("characterPD",status.pmAtual);
    if(status.pmMax!==undefined) setValue("characterPDMax",status.pmMax);
    if(status.pmTemp!==undefined) setValue("characterPDTemp",status.pmTemp);
}

function getDefenseAttribute(){
    return getEditingCharacter()?.combatConfig?.defenseAttribute||"corpo";
}

function calculateBodyPartMax(basePerLevel,level,corpo){
    return (basePerLevel*level)+corpo;
}

function getBodyMaximums(level,corpo){
    return {
        head:calculateBodyPartMax(1,level,corpo),
        chest:calculateBodyPartMax(2,level,corpo),
        leftArm:calculateBodyPartMax(1,level,corpo),
        rightArm:calculateBodyPartMax(1,level,corpo),
        leftLeg:calculateBodyPartMax(1,level,corpo),
        rightLeg:calculateBodyPartMax(1,level,corpo)
    };
}

const BODY_INPUT_IDS={
    head:"bodyHead",
    chest:"bodyChest",
    leftArm:"bodyLeftArm",
    rightArm:"bodyRightArm",
    leftLeg:"bodyLeftLeg",
    rightLeg:"bodyRightLeg"
};

function isNaturalBodyPart(partName){
    if(typeof characterBodyState==="undefined") return true;
    const state=characterBodyState?.[partName];
    return !state?.type||state.type==="natural";
}

function enforceNaturalBodyDisplay(maximums){
    Object.entries(BODY_INPUT_IDS).forEach(([partName,inputId])=>{
        if(!isNaturalBodyPart(partName)) return;

        const input=document.getElementById(inputId);
        if(!input) return;

        const maximum=maximums[partName];
        let current=Number(input.value);

        input.dataset.max=String(maximum);
        input.max=String(maximum);
        input.dataset.initialized="true";

        if(!Number.isFinite(current)||input.value===""||current>maximum){
            current=maximum;
            input.value=String(maximum);
        }

        const row=input.closest(".body-member-row");
        const badge=row?.querySelector(".body-state-badge.natural");
        if(badge){
            badge.textContent=current<=0
                ? "INUTILIZADO"
                : `NATURAL • ${current}/${maximum}`;
        }
    });
}

function applyBodyPartMaximums(level,corpo){
    const maximums=getBodyMaximums(level,corpo);

    /* Aplica antes do render antigo. */
    enforceNaturalBodyDisplay(maximums);

    if(typeof renderBodyStates==="function"){
        renderBodyStates();
    }

    /*
        O render antigo ainda possui a fórmula anterior e pode sobrescrever
        o campo e o selo NATURAL. Reaplicamos depois dele sem renderizar de
        novo, evitando o cálculo antigo e qualquer ciclo de atualização.
    */
    queueMicrotask(()=>enforceNaturalBodyDisplay(maximums));
    requestAnimationFrame(()=>enforceNaturalBodyDisplay(maximums));
    setTimeout(()=>enforceNaturalBodyDisplay(maximums),0);
}

function calculateSystemBaseStats(){
    const level=Math.max(1,numberValue("characterLevel",1));
    const corpo=Math.max(0,numberValue("attributeFOR",1));
    const foco=Math.max(0,numberValue("attributeAGI",1));
    const nexo=Math.max(0,numberValue("attributeINT",1));

    const pvMax=(7*level)+corpo;
    const pmMax=(4*level)+foco;
    const defenseAttributeValue=getDefenseAttribute()==="foco"?foco:corpo;
    const defenseBase=5+defenseAttributeValue;
    const initialSkillPoints=7+nexo;

    setValue("characterPVMax",pvMax);
    setValue("characterPDMax",pmMax);
    setValue("characterDefenseBase",defenseBase);

    const defenseBonus=numberValue("characterDefenseBonus",0);
    setValue("characterDefense",Math.max(0,defenseBase+defenseBonus));

    /*
        PV máximo por membros:
        Cabeça, braços e pernas: (1 × nível) + Corpo.
        Torso: (2 × nível) + Corpo.
    */
    applyBodyPartMaximums(level,corpo);

    const pv=document.getElementById("characterPV");
    const pm=document.getElementById("characterPD");

    if(pv&&!pv.value) pv.value=String(pvMax);
    if(pm&&!pm.value) pm.value=String(pmMax);
    if(pv&&Number(pv.value)>pvMax) pv.value=String(pvMax);
    if(pm&&Number(pm.value)>pmMax) pm.value=String(pmMax);

    const summary=document.getElementById("skillPointsSummary");
    if(summary&&!document.querySelector(".system-v2-skill-row")){
        summary.innerHTML=`<strong>Perícias iniciais: ${initialSkillPoints}</strong>`;
    }
}

function scheduleSystemBaseCalculation(){
    calculateSystemBaseStats();
    queueMicrotask(calculateSystemBaseStats);
    requestAnimationFrame(()=>{
        calculateSystemBaseStats();
        requestAnimationFrame(calculateSystemBaseStats);
    });
}

function migrateCharacterData(character){
    if(!character||typeof character!=="object") return character;

    const level=Math.max(1,numberValue("characterLevel",1));
    const corpo=Math.max(0,numberValue("attributeFOR",1));
    const foco=Math.max(0,numberValue("attributeAGI",1));
    const nexo=Math.max(0,numberValue("attributeINT",1));
    const bodyMaximums=getBodyMaximums(level,corpo);

    character.attributes={
        ...(character.attributes||{}),
        corpo,
        foco,
        nexo,
        for:corpo,
        agi:foco,
        int:nexo,
        vig:corpo,
        pre:foco
    };

    character.status={
        ...(character.status||{}),
        pmAtual:numberValue("characterPD",0),
        pmMax:numberValue("characterPDMax",0),
        pmTemp:numberValue("characterPDTemp",0),
        pdAtual:numberValue("characterPD",0),
        pdMax:numberValue("characterPDMax",0),
        pdTemp:numberValue("characterPDTemp",0)
    };

    character.body={
        ...(character.body||{}),
        head:numberValue("bodyHead",bodyMaximums.head),
        chest:numberValue("bodyChest",bodyMaximums.chest),
        leftArm:numberValue("bodyLeftArm",bodyMaximums.leftArm),
        rightArm:numberValue("bodyRightArm",bodyMaximums.rightArm),
        leftLeg:numberValue("bodyLeftLeg",bodyMaximums.leftLeg),
        rightLeg:numberValue("bodyRightLeg",bodyMaximums.rightLeg),
        headMax:bodyMaximums.head,
        chestMax:bodyMaximums.chest,
        leftArmMax:bodyMaximums.leftArm,
        rightArmMax:bodyMaximums.rightArm,
        leftLegMax:bodyMaximums.leftLeg,
        rightLegMax:bodyMaximums.rightLeg
    };

    character.combatConfig={
        ...(character.combatConfig||{}),
        defenseAttribute:character.combatConfig?.defenseAttribute||"corpo"
    };

    character.progression={
        ...(character.progression||{}),
        initialSkillPoints:7+nexo,
        skillPointsFromNexo:nexo
    };

    character.systemVersion=2;
    return character;
}

function patchStorageSave(){
    if(typeof window.saveCharacterToStorage!=="function") return;
    const original=window.saveCharacterToStorage;
    window.saveCharacterToStorage=function(characterData){
        const migration=typeof window.migrateSystemBaseV2Character==="function"
            ? window.migrateSystemBaseV2Character
            : migrateCharacterData;
        return original(migration(characterData));
    };
}

function updateInterface(){
    renameCard("attributeFOR","CORPO");
    renameCard("attributeAGI","FOCO");
    renameCard("attributeINT","NEXO");
    hideCard("attributeVIG");
    hideCard("attributePRE");
    renamePDToPM();

    const grid=document.querySelector(".attributes-grid");
    if(grid) grid.style.gridTemplateColumns="repeat(3,minmax(0,1fr))";
}

function bindEvents(){
    ["characterLevel","attributeFOR","attributeAGI","attributeINT","characterDefenseBonus","lifeMode"]
        .forEach(id=>{
            const element=document.getElementById(id);
            element?.addEventListener("input",scheduleSystemBaseCalculation,true);
            element?.addEventListener("change",scheduleSystemBaseCalculation,true);
        });
}

function loadSkillsModule(){
    if(document.querySelector('script[data-system-v2-skills="true"]')) return;
    const script=document.createElement("script");
    script.src="sistema-base-pericias.js";
    script.async=false;
    script.dataset.systemV2Skills="true";
    document.body.appendChild(script);
}

function init(){
    if(!document.querySelector(".character-editor-page")) return;
    updateInterface();
    loadNewAttributes();
    window.migrateSystemBaseV2Character=migrateCharacterData;
    patchStorageSave();
    bindEvents();
    scheduleSystemBaseCalculation();
    loadSkillsModule();
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
else init();

window.calculateSystemBaseV2Stats=calculateSystemBaseStats;
window.scheduleSystemBaseV2Calculation=scheduleSystemBaseCalculation;
window.migrateSystemBaseV2Character=migrateCharacterData;
})();
