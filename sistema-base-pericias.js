/*==========================================================
=  SISTEMA BASE V2 — PERÍCIAS E TESTES
==========================================================*/
(function(){
"use strict";

const STORAGE_KEY="ordem_characters";

const SYSTEM_SKILLS=[
    {id:"manobra",name:"Manobra",attribute:"corpo"},
    {id:"disciplina",name:"Disciplina",attribute:"foco"},
    {id:"especializacao",name:"Especialização",attribute:"nexo"},
    {id:"discreto",name:"Discreto",attribute:"foco"},
    {id:"interacao",name:"Interação",attribute:"foco"},
    {id:"fortitude",name:"Fortitude",attribute:"corpo"},
    {id:"intimidacao",name:"Intimidação",attribute:"foco"},
    {id:"deducao",name:"Dedução",attribute:"nexo"},
    {id:"luta",name:"Luta",attribute:"corpo"},
    {id:"medicina",name:"Medicina",attribute:"nexo"},
    {id:"ocultismo",name:"Ocultismo",attribute:"nexo"},
    {id:"percepcao",name:"Percepção",attribute:"foco"},
    {id:"pilotagem",name:"Pilotagem",attribute:"foco"},
    {id:"pontaria",name:"Pontaria",attribute:"foco"},
    {id:"presteza",name:"Presteza",attribute:"corpo"},
    {id:"sobrevivencia",name:"Sobrevivência",attribute:"nexo"},
    {id:"informacao",name:"Informação",attribute:"nexo"},
    {id:"vontade",name:"Vontade",attribute:"foco"},
    {id:"sorte",name:"Sorte",attribute:"foco"}
];

function normalizeText(value){
    return String(value||"")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g,"-")
        .replace(/^-|-$/g,"");
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

function readAttribute(attribute){
    const ids={corpo:"attributeFOR",foco:"attributeAGI",nexo:"attributeINT"};
    const value=Number(document.getElementById(ids[attribute])?.value);
    return Number.isFinite(value)?value:0;
}

function rollDie(sides){
    return Math.floor(Math.random()*sides)+1;
}

function parseTraining(value){
    const match=String(value||"0").match(/1d(4|8|12)/i);
    return match?Number(match[1]):0;
}

function findSavedSkill(character,definition){
    const lists=[character?.skills,character?.pericias,character?.systemData?.skills];
    const list=lists.find(Array.isArray)||[];
    return list.find(skill=>{
        const candidate=normalizeText(skill?.id||skill?.name||skill?.skill||"");
        return candidate===definition.id||candidate===normalizeText(definition.name);
    })||null;
}

function initialSkillLimit(){
    return 7+Math.max(0,readAttribute("nexo"));
}

function trainedCount(){
    return [...document.querySelectorAll(".system-v2-skill-training")]
        .filter(select=>parseTraining(select.value)>0)
        .length;
}

function updateSummary(){
    const summary=document.getElementById("skillPointsSummary");
    if(!summary) return;
    const limit=initialSkillLimit();
    const used=trainedCount();
    summary.innerHTML=`
        <strong>Perícias treinadas: ${used} / ${limit}</strong>
        <span>Base: 7 + Nexo (${readAttribute("nexo")})</span>
    `;
}

function updateRow(row){
    const attribute=row.dataset.attribute;
    const training=row.querySelector(".system-v2-skill-training")?.value||"0";
    const bonus=Number(row.querySelector(".system-v2-skill-bonus")?.value)||0;
    const penalty=Math.max(0,Number(row.querySelector(".system-v2-skill-penalty")?.value)||0);
    const attributeValue=readAttribute(attribute);
    const total=row.querySelector(".system-v2-skill-total");
    const trainingText=parseTraining(training)>0?training:"0";
    if(total){
        total.textContent=`1d12 + ${trainingText} + ${attributeValue} + ${bonus} - ${penalty}`;
    }
}

function rollSkill(row){
    const name=row.dataset.name;
    const attribute=row.dataset.attribute;
    const training=row.querySelector(".system-v2-skill-training")?.value||"0";
    const bonus=Number(row.querySelector(".system-v2-skill-bonus")?.value)||0;
    const penalty=Math.max(0,Number(row.querySelector(".system-v2-skill-penalty")?.value)||0);
    const attributeValue=readAttribute(attribute);
    const baseRoll=rollDie(12);
    const trainingSides=parseTraining(training);
    const trainingRoll=trainingSides?rollDie(trainingSides):0;
    const result=baseRoll+trainingRoll+attributeValue+bonus-penalty;
    const detail=`1d12 (${baseRoll})${trainingSides?` + 1d${trainingSides} (${trainingRoll})`:""} + ${attribute.toUpperCase()} ${attributeValue}${bonus?` + bônus ${bonus}`:""}${penalty?` - penalidade ${penalty}`:""}`;

    if(typeof window.showCharacterEditorMessage==="function"){
        window.showCharacterEditorMessage(name,`${detail} = ${result}`,"🎲");
    }
    else{
        alert(`${name}: ${detail} = ${result}`);
    }
}

function enforceTrainingLimit(changedSelect,previousValue){
    if(trainedCount()<=initialSkillLimit()) return true;
    changedSelect.value=previousValue;
    if(typeof window.showCharacterEditorMessage==="function"){
        window.showCharacterEditorMessage("Limite de perícias",`Você pode treinar até ${initialSkillLimit()} perícias com seu Nexo atual.`,"!");
    }
    else{
        alert(`Você pode treinar até ${initialSkillLimit()} perícias.`);
    }
    return false;
}

function renderSkills(){
    const list=document.getElementById("skillsEditorList");
    if(!list) return;
    const character=getEditingCharacter();

    list.innerHTML="";

    SYSTEM_SKILLS.forEach(definition=>{
        const saved=findSavedSkill(character,definition)||{};
        const training=saved.training||saved.treino||saved.trainingDie||"0";
        const bonus=Number(saved.bonus)||0;
        const penalty=Math.abs(Number(saved.penalty??saved.penalidade)||0);
        const row=document.createElement("div");
        row.className="skill-editor-row system-v2-skill-row";
        row.dataset.skillId=definition.id;
        row.dataset.name=definition.name;
        row.dataset.attribute=definition.attribute;
        row.innerHTML=`
            <strong class="skill-name">${definition.name}</strong>
            <span class="skill-attribute">${definition.attribute.toUpperCase()}</span>
            <select class="system-v2-skill-training" aria-label="Treino de ${definition.name}">
                <option value="0" ${training==="0"?"selected":""}>Sem treino</option>
                <option value="1d4" ${training==="1d4"?"selected":""}>1d4</option>
                <option value="1d8" ${training==="1d8"?"selected":""}>1d8</option>
                <option value="1d12" ${training==="1d12"?"selected":""}>1d12</option>
            </select>
            <input class="system-v2-skill-bonus" type="number" value="${bonus}" aria-label="Bônus de ${definition.name}">
            <input class="system-v2-skill-penalty" type="number" min="0" value="${penalty}" aria-label="Penalidade de ${definition.name}">
            <span class="system-v2-skill-total"></span>
            <button type="button" class="secondary-button system-v2-skill-roll">Rolar</button>
        `;

        const trainingSelect=row.querySelector(".system-v2-skill-training");
        trainingSelect.dataset.previousValue=trainingSelect.value;
        trainingSelect.addEventListener("focus",()=>{
            trainingSelect.dataset.previousValue=trainingSelect.value;
        });
        trainingSelect.addEventListener("change",()=>{
            const previous=trainingSelect.dataset.previousValue||"0";
            if(enforceTrainingLimit(trainingSelect,previous)){
                trainingSelect.dataset.previousValue=trainingSelect.value;
            }
            updateRow(row);
            updateSummary();
        });

        row.querySelectorAll("input").forEach(input=>{
            input.addEventListener("input",()=>updateRow(row));
        });
        row.querySelector(".system-v2-skill-roll")?.addEventListener("click",()=>rollSkill(row));
        list.appendChild(row);
        updateRow(row);
    });

    document.getElementById("buySkillPoints")?.classList.add("hidden");
    updateSummary();
}

function collectSkills(){
    return [...document.querySelectorAll(".system-v2-skill-row")].map(row=>({
        id:row.dataset.skillId,
        name:row.dataset.name,
        attribute:row.dataset.attribute,
        training:row.querySelector(".system-v2-skill-training")?.value||"0",
        bonus:Number(row.querySelector(".system-v2-skill-bonus")?.value)||0,
        penalty:Math.max(0,Number(row.querySelector(".system-v2-skill-penalty")?.value)||0),
        rollBase:"1d12"
    }));
}

function patchCharacterMigration(){
    const original=window.migrateSystemBaseV2Character;
    if(typeof original!=="function") return;
    window.migrateSystemBaseV2Character=function(character){
        const migrated=original(character);
        migrated.skills=collectSkills();
        migrated.pericias=migrated.skills;
        migrated.progression={
            ...(migrated.progression||{}),
            initialSkillPoints:initialSkillLimit(),
            skillPointsFromNexo:readAttribute("nexo"),
            trainedSkills:trainedCount()
        };
        return migrated;
    };
}

function bindAttributeUpdates(){
    ["attributeFOR","attributeAGI","attributeINT"].forEach(id=>{
        document.getElementById(id)?.addEventListener("input",()=>{
            document.querySelectorAll(".system-v2-skill-row").forEach(updateRow);
            updateSummary();
        });
    });
}

function init(){
    if(!document.querySelector(".character-editor-page")) return;
    renderSkills();
    patchCharacterMigration();
    bindAttributeUpdates();
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0));
else setTimeout(init,0);

window.SYSTEM_BASE_V2_SKILLS=SYSTEM_SKILLS;
window.collectSystemBaseV2Skills=collectSkills;
})();
