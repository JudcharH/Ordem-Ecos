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

    setValue("bodyHead",2+corpo);
    setValue("bodyChest",2+corpo);
    setValue("bodyLeftArm",1+corpo);
    setValue("bodyRightArm",1+corpo);
    setValue("bodyLeftLeg",1+corpo);
    setValue("bodyRightLeg",1+corpo);

    const pv=document.getElementById("characterPV");
    const pm=document.getElementById("characterPD");

    if(pv&&!pv.value) pv.value=String(pvMax);
    if(pm&&!pm.value) pm.value=String(pmMax);
    if(pv&&Number(pv.value)>pvMax) pv.value=String(pvMax);
    if(pm&&Number(pm.value)>pmMax) pm.value=String(pmMax);

    const summary=document.getElementById("skillPointsSummary");
    if(summary&&!document.querySelector(".system-v2-skill-row")){
        summary.innerHTML=`<strong>Perícias iniciais: ${initialSkillPoints}</strong><span>7 + Nexo (${nexo})</span>`;
    }
}

function migrateCharacterData(character){
    if(!character||typeof character!=="object") return character;

    const corpo=Math.max(0,numberValue("attributeFOR",1));
    const foco=Math.max(0,numberValue("attributeAGI",1));
    const nexo=Math.max(0,numberValue("attributeINT",1));

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
    ["characterLevel","attributeFOR","attributeAGI","attributeINT","characterDefenseBonus"]
        .forEach(id=>{
            document.getElementById(id)?.addEventListener("input",()=>{
                queueMicrotask(calculateSystemBaseStats);
            });
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
    queueMicrotask(calculateSystemBaseStats);
    loadSkillsModule();
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
else init();

window.calculateSystemBaseV2Stats=calculateSystemBaseStats;
window.migrateSystemBaseV2Character=migrateCharacterData;
})();
