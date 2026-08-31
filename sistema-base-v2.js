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

function applyBodyPartMaximums(level,corpo){
    const maximums=getBodyMaximums(level,corpo);
    const inputIds={
        head:"bodyHead",
        chest:"bodyChest",
        leftArm:"bodyLeftArm",
        rightArm:"bodyRightArm",
        leftLeg:"bodyLeftLeg",
        rightLeg:"bodyRightLeg"
    };

    Object.entries(inputIds).forEach(([partName,inputId])=>{
        const input=document.getElementById(inputId);
        if(!input) return;

        const state=(typeof characterBodyState!=="undefined")
            ? characterBodyState?.[partName]
            : null;

        if(state?.type&&state.type!=="natural") return;

        const maximum=maximums[partName];
        const current=Number(input.value);

        input.dataset.max=String(maximum);
        input.max=String(maximum);

        /*
            O campo representa o PV atual. Não deve ser preenchido novamente
            toda vez que nível ou Corpo mudarem. Apenas inicializamos campos
            vazios e impedimos que o atual fique acima do novo máximo.
        */
        if(!Number.isFinite(current)||input.value===""){
            input.value=String(maximum);
        }
        else if(current>maximum){
            input.value=String(maximum);
        }

        input.dataset.initialized="true";
    });

    if(typeof renderBodyStates==="function"){
        renderBodyStates();
    }
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
