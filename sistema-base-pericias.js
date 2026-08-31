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

let renderingSkills=false;
let skillsObserver=null;

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

function trainingLabel(value){
    const labels={
        "0":"Sem treino",
        "1d4":"Treinado (1d4)",
        "1d8":"Veterano (1d8)",
        "1d12":"Especialista (1d12)"
    };
    return labels[value]||labels["0"];
}

function findSavedSkill(character,definition){
    const lists=[character?.skills,character?.pericias,character?.systemData?.skills];
    const list=lists.find(Array.isArray)||[];
    return list.find(skill=>{
        const candidate=normalizeText(skill?.id||skill?.name||skill?.skill||"");
        return candidate===definition.id||candidate===normalizeText(definition.name);
    })||null;
}

function findSnapshotSkill(snapshot,definition){
    if(!Array.isArray(snapshot)) return null;
    return snapshot.find(skill=>skill.id===definition.id)||null;
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
    summary.innerHTML=`<strong>Perícias treinadas: ${used} / ${limit}</strong>`;
}

function showSkillToast(title,detail,result=null){
    let toast=document.getElementById("systemV2SkillToast");
    if(!toast){
        toast=document.createElement("div");
        toast.id="systemV2SkillToast";
        toast.className="system-v2-skill-toast";
        document.body.appendChild(toast);
        toast.addEventListener("click",()=>toast.classList.remove("visible"));
    }

    toast.innerHTML=`
        <span class="system-v2-skill-toast-icon">🎲</span>
        <div>
            <strong>${title}</strong>
            <p>${detail}</p>
            ${result===null?"":`<b>Total: ${result}</b>`}
        </div>
    `;

    toast.classList.remove("visible");
    void toast.offsetWidth;
    toast.classList.add("visible");

    clearTimeout(showSkillToast.timeout);
    showSkillToast.timeout=setTimeout(()=>toast.classList.remove("visible"),5000);
}

function rollSkill(row,event){
    event?.preventDefault();
    event?.stopPropagation();

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

    const parts=[`1d12: ${baseRoll}`];
    if(trainingSides) parts.push(`${trainingLabel(training)}: ${trainingRoll}`);
    parts.push(`${attribute.toUpperCase()}: +${attributeValue}`);
    if(bonus) parts.push(`Bônus: +${bonus}`);
    if(penalty) parts.push(`Penalidade: -${penalty}`);

    showSkillToast(name,parts.join(" • "),result);
}

function enforceTrainingLimit(changedSelect,previousValue){
    if(trainedCount()<=initialSkillLimit()) return true;
    changedSelect.value=previousValue;
    showSkillToast(
        "Limite de perícias",
        `Você pode treinar até ${initialSkillLimit()} perícias com seu Nexo atual.`
    );
    return false;
}

function adjustSkillsTable(){
    const header=document.querySelector(".skills-table-header");
    if(header){
        [...header.children].forEach(label=>{
            if(normalizeText(label.textContent)==="total") label.remove();
        });
    }

    if(document.getElementById("systemV2SkillsStyle")) return;
    const style=document.createElement("style");
    style.id="systemV2SkillsStyle";
    style.textContent=`
        .skills-table-header,
        .system-v2-skill-row{
            grid-template-columns:minmax(170px,2fr) minmax(90px,.75fr) minmax(180px,1.35fr) minmax(72px,.55fr) minmax(72px,.55fr) minmax(88px,.65fr)!important;
            align-items:center;
            column-gap:10px;
        }
        .system-v2-skill-training{width:100%;min-width:0;}
        .system-v2-skill-roll{width:100%;min-width:78px;}
        .skill-attribute{text-align:center;font-weight:700;}
        .system-v2-skill-toast{
            position:fixed;left:50%;bottom:28px;z-index:5000;
            width:min(560px,calc(100vw - 32px));
            display:flex;gap:12px;align-items:flex-start;
            padding:15px 18px;border-radius:15px;
            background:rgba(21,21,30,.98);border:1px solid rgba(145,87,255,.55);
            box-shadow:0 16px 45px rgba(0,0,0,.45),0 0 24px rgba(123,44,255,.15);
            color:white;opacity:0;pointer-events:none;
            transform:translate(-50%,18px) scale(.97);
            transition:.22s ease;
        }
        .system-v2-skill-toast.visible{opacity:1;pointer-events:auto;transform:translate(-50%,0) scale(1);}
        .system-v2-skill-toast-icon{font-size:24px;line-height:1;}
        .system-v2-skill-toast strong{display:block;font-family:'Orbitron',sans-serif;font-size:14px;margin-bottom:5px;}
        .system-v2-skill-toast p{font-size:12px;line-height:1.5;color:var(--text2);margin:0 0 5px;}
        .system-v2-skill-toast b{font-family:'Orbitron',sans-serif;font-size:18px;color:white;}
        @media(max-width:900px){
            .skills-table-header,.system-v2-skill-row{
                grid-template-columns:minmax(130px,1.5fr) 70px minmax(140px,1fr) 62px 62px 76px!important;
            }
        }
    `;
    document.head.appendChild(style);
}

function renderSkills(snapshot=null){
    const list=document.getElementById("skillsEditorList");
    if(!list) return;

    renderingSkills=true;
    const character=getEditingCharacter();

    adjustSkillsTable();
    list.innerHTML="";

    SYSTEM_SKILLS.forEach(definition=>{
        const saved=findSnapshotSkill(snapshot,definition)||findSavedSkill(character,definition)||{};
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
                <option value="1d4" ${training==="1d4"?"selected":""}>Treinado (1d4)</option>
                <option value="1d8" ${training==="1d8"?"selected":""}>Veterano (1d8)</option>
                <option value="1d12" ${training==="1d12"?"selected":""}>Especialista (1d12)</option>
            </select>
            <input class="system-v2-skill-bonus" type="number" value="${bonus}" aria-label="Bônus de ${definition.name}">
            <input class="system-v2-skill-penalty" type="number" min="0" value="${penalty}" aria-label="Penalidade de ${definition.name}">
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
            updateSummary();
        });

        row.querySelector(".system-v2-skill-roll")?.addEventListener("click",event=>rollSkill(row,event));
        list.appendChild(row);
    });

    document.getElementById("buySkillPoints")?.classList.add("hidden");
    updateSummary();
    renderingSkills=false;
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
        const input=document.getElementById(id);
        if(!input) return;

        input.addEventListener("input",()=>{
            const snapshot=collectSkills();

            setTimeout(()=>{
                const list=document.getElementById("skillsEditorList");
                const hasOldRows=list && !list.querySelector(".system-v2-skill-row");

                if(hasOldRows){
                    renderSkills(snapshot);
                }
                else{
                    updateSummary();
                }
            },0);
        },true);
    });
}

function observeLegacyRerenders(){
    const list=document.getElementById("skillsEditorList");
    if(!list||skillsObserver) return;

    skillsObserver=new MutationObserver(()=>{
        if(renderingSkills) return;

        const hasRows=list.children.length>0;
        const hasV2Rows=Boolean(list.querySelector(".system-v2-skill-row"));

        if(hasRows&&!hasV2Rows){
            setTimeout(()=>renderSkills(),0);
        }
    });

    skillsObserver.observe(list,{childList:true});
}

function init(){
    if(!document.querySelector(".character-editor-page")) return;
    renderSkills();
    patchCharacterMigration();
    bindAttributeUpdates();
    observeLegacyRerenders();
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0));
else setTimeout(init,0);

window.SYSTEM_BASE_V2_SKILLS=SYSTEM_SKILLS;
window.collectSystemBaseV2Skills=collectSkills;
})();
