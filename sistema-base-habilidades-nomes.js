/*==========================================================
= SISTEMA BASE V2 — NOMES DAS HABILIDADES
==========================================================*/
(function(){
"use strict";

const STORAGE_KEY="ordem_characters";
const LOWERCASE_WORDS=new Set(["a","as","o","os","de","da","das","do","dos","e","em","para","por","com","sem","pelo","pela","pelos","pelas"]);

function titleCase(value){
    const words=String(value||"").trim().toLocaleLowerCase("pt-BR").split(/\s+/);
    return words.map((word,index)=>{
        if(index>0&&LOWERCASE_WORDS.has(word)) return word;
        return word.charAt(0).toLocaleUpperCase("pt-BR")+word.slice(1);
    }).join(" ");
}

function normalizeAbilityName(ability){
    if(!ability||typeof ability!=="object"||!ability.name) return ability;
    ability.name=titleCase(ability.name);
    return ability;
}

function normalizeKnownCollections(){
    [
        window.SYSTEM_BASE_V2_ABILITIES,
        window.OFFICIAL_ABILITIES,
        window.DEFAULT_ABILITIES
    ].forEach(list=>{
        if(Array.isArray(list)) list.forEach(normalizeAbilityName);
    });

    if(typeof characterAbilitiesState!=="undefined"&&Array.isArray(characterAbilitiesState)){
        characterAbilitiesState.forEach(normalizeAbilityName);
    }
}

function normalizeStorage(){
    try{
        const characters=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
        if(!Array.isArray(characters)) return;
        let changed=false;

        characters.forEach(character=>{
            const lists=[character?.abilities,character?.habilidades,character?.characterAbilities];
            lists.forEach(list=>{
                if(!Array.isArray(list)) return;
                list.forEach(ability=>{
                    const before=ability?.name;
                    normalizeAbilityName(ability);
                    if(before!==ability?.name) changed=true;
                });
            });
        });

        if(changed){
            localStorage.setItem(STORAGE_KEY,JSON.stringify(characters));
        }
    }
    catch(error){
        console.warn("Não foi possível normalizar os nomes das habilidades:",error);
    }
}

function looksLikeAbilityContainer(element){
    if(!(element instanceof Element)) return false;
    const context=`${element.className||""} ${element.id||""} ${element.parentElement?.className||""}`.toLowerCase();
    return context.includes("abilit")||context.includes("ability");
}

function normalizeVisibleNames(root=document){
    root.querySelectorAll("h2,h3,h4,strong,.ability-name,.habilidade-nome").forEach(element=>{
        if(!looksLikeAbilityContainer(element)) return;
        const text=element.textContent?.trim();
        if(!text||!/[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(text)) return;
        if(text!==text.toLocaleUpperCase("pt-BR")) return;
        element.textContent=titleCase(text);
    });
}

function refresh(){
    normalizeKnownCollections();
    normalizeStorage();
    normalizeVisibleNames();

    if(typeof renderAbilityEditorList==="function"){
        try{renderAbilityEditorList();}catch{}
    }
}

function init(){
    refresh();
    setTimeout(refresh,100);
    setTimeout(refresh,500);

    const observer=new MutationObserver(mutations=>{
        mutations.forEach(mutation=>{
            mutation.addedNodes.forEach(node=>{
                if(node instanceof Element){
                    normalizeVisibleNames(node);
                }
            });
        });
    });

    observer.observe(document.body,{childList:true,subtree:true});
}

if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init);
}
else{
    init();
}

window.formatSystemBaseAbilityName=titleCase;
})();
