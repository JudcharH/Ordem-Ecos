/*==========================================================
= SISTEMA BASE V2 — ATAQUES RÁPIDOS, CURA E CARREGADORES
==========================================================*/
(function(){
"use strict";

const STORAGE_KEY="ordem_characters";
const DAMAGE_TYPES=["balistico","impacto","perfuracao","corte","fogo"];

function normalizeText(value){
    return String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
}
function getEditingCharacter(){
    try{
        const params=new URLSearchParams(location.search);
        const id=params.get("id")||params.get("character");
        const list=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
        return Array.isArray(list)?list.find(item=>item.id===id)||null:null;
    }catch{return null;}
}
function readAttribute(attribute){
    const ids={corpo:"attributeFOR",foco:"attributeAGI",nexo:"attributeINT"};
    const value=Number(document.getElementById(ids[attribute])?.value);
    return Number.isFinite(value)?value:0;
}
function getSkill(skillId){
    const row=document.querySelector(`.system-v2-skill-row[data-skill-id="${skillId}"]`);
    if(row){
        return {
            training:row.querySelector(".system-v2-skill-training")?.value||"0",
            bonus:Number(row.querySelector(".system-v2-skill-bonus")?.value)||0,
            penalty:Math.max(0,Number(row.querySelector(".system-v2-skill-penalty")?.value)||0)
        };
    }
    const character=getEditingCharacter();
    const list=character?.skills||character?.pericias||[];
    const saved=list.find(skill=>normalizeText(skill?.id||skill?.name)===skillId)||{};
    return {
        training:saved.training||saved.treino||"0",
        bonus:Number(saved.bonus)||0,
        penalty:Math.max(0,Number(saved.penalty??saved.penalidade)||0)
    };
}
function formulaFor(skillId){
    const configs={
        luta:{attribute:"corpo",label:"Luta"},
        pontaria:{attribute:"foco",label:"Pontaria"},
        medicina:{attribute:"nexo",label:"Medicina"}
    };
    const config=configs[skillId]||configs.luta;
    const skill=getSkill(skillId);
    const attributeValue=readAttribute(config.attribute);
    const parts=["1d12"];
    if(skill.training!=="0")parts.push(skill.training);
    parts.push(String(attributeValue));
    if(skill.bonus)parts.push(String(skill.bonus));
    if(skill.penalty)parts.push(`-${skill.penalty}`);
    const criticalOn=typeof window.getSystemBaseCriticalThreshold==="function"
        ?window.getSystemBaseCriticalThreshold({attackType:skillId})
        :12;
    return {
        text:parts.join(" + ").replace(/\+ -/g,"- "),
        skill:skillId,skillName:config.label,attribute:config.attribute,
        attributeValue,training:skill.training,bonus:skill.bonus,penalty:skill.penalty,
        baseDie:"1d12",criticalOn,criticalEffect:"roll-training-again"
    };
}
function damageTypeLabel(value){
    return {balistico:"Balístico",impacto:"Impacto",perfuracao:"Perfuração",corte:"Corte",fogo:"Fogo"}[value]||"Impacto";
}
function createSelect(id,options,value){
    const select=document.createElement("select");
    select.id=id;
    options.forEach(option=>{
        const element=document.createElement("option");
        element.value=option.value;
        element.textContent=option.label;
        element.selected=option.value===value;
        select.appendChild(element);
    });
    return select;
}
function insertFieldBefore(reference,labelText,control){
    const field=document.createElement("div");
    field.className="field system-v2-attack-field";
    const label=document.createElement("label");
    label.htmlFor=control.id;
    label.textContent=labelText;
    field.append(label,control);
    reference.parentElement.insertBefore(field,reference);
}
function findSavedEntry(character,index){
    const list=[character?.quickAttacks,character?.attacks,character?.ataquesRapidos].find(Array.isArray)||[];
    return list[index-1]||{};
}
function updateAutomaticFormula(index){
    const rollInput=document.getElementById(`attack${index}Roll`);
    if(!rollInput)return;
    const skillId=index===4?"medicina":document.getElementById(`attack${index}Skill`)?.value||"luta";
    const formula=formulaFor(skillId);
    rollInput.value=formula.text;
    rollInput.dataset.skill=skillId;
    rollInput.dataset.attribute=formula.attribute;
    rollInput.dataset.criticalOn=String(formula.criticalOn);
    rollInput.dataset.criticalEffect="roll-training-again";
}
function configureAttackCard(index,character){
    const nameInput=document.getElementById(`attack${index}Name`);
    const rollInput=document.getElementById(`attack${index}Roll`);
    const damageInput=document.getElementById(`attack${index}Damage`);
    const card=nameInput?.closest(".quick-attack-card");
    if(!nameInput||!rollInput||!damageInput||!card)return;
    const saved=findSavedEntry(character,index);
    const header=card.querySelector("h3");
    const rollField=rollInput.closest(".field");
    const damageField=damageInput.closest(".field");
    rollInput.readOnly=true;
    rollInput.classList.add("system-v2-automatic-roll");

    if(index<=3){
        if(header)header.textContent=`Ataque ${index}`;
        card.dataset.entryType="attack";
        const skillValue=saved.skill||saved.testSkill||saved.pericia||"luta";
        let skillSelect=document.getElementById(`attack${index}Skill`);
        if(!skillSelect){
            skillSelect=createSelect(`attack${index}Skill`,[
                {value:"luta",label:"Luta — Corpo a corpo"},
                {value:"pontaria",label:"Pontaria — À distância"}
            ],skillValue);
            insertFieldBefore(rollField,"Perícia do ataque",skillSelect);
        }
        let damageType=document.getElementById(`attack${index}DamageType`);
        if(!damageType){
            const savedType=normalizeText(saved.damageType||saved.tipoDano||"impacto").replace(/ç/g,"c");
            damageType=createSelect(`attack${index}DamageType`,
                DAMAGE_TYPES.map(value=>({value,label:damageTypeLabel(value)})),
                DAMAGE_TYPES.includes(savedType)?savedType:"impacto");
            const field=document.createElement("div");
            field.className="field system-v2-damage-type-field";
            const label=document.createElement("label");
            label.htmlFor=damageType.id;
            label.textContent="Tipo de dano";
            field.append(label,damageType);
            damageField.parentElement.insertBefore(field,damageField.nextElementSibling);
        }
        rollField.querySelector("label").textContent="Teste automático";
        damageField.querySelector("label").textContent="Dano";
        damageInput.placeholder="Ex: 2d10 + Corpo";
        skillSelect.addEventListener("change",()=>updateAutomaticFormula(index));
    }else{
        if(header)header.textContent="Cura";
        card.dataset.entryType="healing";
        rollField.querySelector("label").textContent="Teste de Medicina";
        damageField.querySelector("label").textContent="Cura";
        nameInput.placeholder="Ex: Primeiros Socorros";
        damageInput.placeholder="Ex: 2d8 + Nexo";
        rollInput.dataset.skill="medicina";
        document.getElementById("attack4DamageType")?.closest(".field")?.remove();
    }
    updateAutomaticFormula(index);
}
function collectQuickEntries(){
    return [1,2,3,4].map(index=>{
        const type=index===4?"healing":"attack";
        const skill=index===4?"medicina":document.getElementById(`attack${index}Skill`)?.value||"luta";
        const formula=formulaFor(skill);
        const value=document.getElementById(`attack${index}Damage`)?.value?.trim()||"";
        const entry={
            slot:index,type,
            name:document.getElementById(`attack${index}Name`)?.value?.trim()||"",
            icon:document.getElementById(`attack${index}Icon`)?.dataset?.base64||"",
            skill,skillName:formula.skillName,attribute:formula.attribute,
            roll:formula.text,rollBase:"1d12",training:formula.training,
            bonus:formula.bonus,penalty:formula.penalty,
            criticalOn:formula.criticalOn,criticalDie:"main",criticalEffect:"roll-training-again"
        };
        if(type==="attack"){
            entry.damage=value;
            entry.damageType=document.getElementById(`attack${index}DamageType`)?.value||"impacto";
        }else{
            entry.healing=value;
            entry.cure=value;
            entry.damage="";
            entry.damageType=null;
        }
        return entry;
    });
}
function patchCharacterMigration(){
    const original=window.migrateSystemBaseV2Character;
    if(typeof original!=="function"||original.__systemV2AttacksPatched)return;
    const patched=function(character){
        const migrated=original(character);
        const entries=collectQuickEntries();
        migrated.quickAttacks=entries;
        migrated.attacks=entries;
        migrated.ataquesRapidos=entries;
        migrated.quickHealing=entries[3];
        return migrated;
    };
    patched.__systemV2AttacksPatched=true;
    window.migrateSystemBaseV2Character=patched;
}
function updateAllFormulas(){[1,2,3,4].forEach(updateAutomaticFormula);}
function addStyle(){
    if(document.getElementById("systemV2QuickAttackStyle"))return;
    const style=document.createElement("style");
    style.id="systemV2QuickAttackStyle";
    style.textContent=`
        .system-v2-automatic-roll{opacity:.86;cursor:not-allowed}
        .quick-attack-card[data-entry-type="healing"]{border-color:rgba(85,200,140,.35)}
        .quick-attack-card[data-entry-type="healing"] .quick-attack-slot{background:rgba(55,160,110,.18);color:#9ff0c4}
        .system-v2-attack-field select,.system-v2-damage-type-field select{width:100%}
    `;
    document.head.appendChild(style);
}
function loadAbilitiesModule(){
    if(document.querySelector('script[data-system-v2-abilities="true"]'))return;
    const script=document.createElement("script");
    script.src="sistema-base-habilidades.js";
    script.async=false;
    script.dataset.systemV2Abilities="true";
    script.addEventListener("load",updateAllFormulas);
    document.body.appendChild(script);
}
function init(){
    if(!document.querySelector(".character-editor-page"))return;
    const character=getEditingCharacter();
    addStyle();
    [1,2,3,4].forEach(index=>configureAttackCard(index,character));
    patchCharacterMigration();
    ["attributeFOR","attributeAGI","attributeINT"].forEach(id=>{
        document.getElementById(id)?.addEventListener("input",updateAllFormulas,true);
    });
    document.getElementById("skillsEditorList")?.addEventListener("change",event=>{
        if(event.target.matches(".system-v2-skill-training,.system-v2-skill-bonus,.system-v2-skill-penalty")){
            updateAllFormulas();
        }
    });
    const description=document.querySelector(".quick-attacks-grid")?.previousElementSibling?.querySelector(".section-description");
    if(description)description.textContent="Configure três ataques automáticos e uma ação de cura para acesso rápido durante a campanha.";
    loadAbilitiesModule();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,0));
else setTimeout(init,0);
window.collectSystemBaseV2QuickEntries=collectQuickEntries;
window.updateSystemBaseV2AttackFormulas=updateAllFormulas;
})();