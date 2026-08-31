/*==========================================================
=              SISTEMAS DE RPG DISPONÍVEIS
==========================================================*/

const RPG_SYSTEMS={
    paranormal:{
        id:"paranormal",
        name:"Sistema Paranormal",
        shortName:"Paranormal",
        description:"Sistema de habilidades, assimilações, rituais e manifestações paranormais.",
        enabled:true,
        color:"#7B2CFF",
        icon:"◇",
        features:{abilities:true,assimilations:true,grimoire:true,blessings:false,spells:false,akumas:false,stories:false,noblePowers:false,emotions:false,fantasyPowers:false}
    },
    blessings:{
        id:"blessings",
        name:"Sistema de Bênçãos",
        shortName:"Bênçãos",
        description:"Sistema baseado em bênçãos, milagres, marcas e poderes concedidos.",
        enabled:false,
        color:"#E7C65B",
        icon:"✦",
        features:{abilities:false,assimilations:false,grimoire:false,blessings:true,spells:false,akumas:false,stories:false,noblePowers:false,emotions:false,fantasyPowers:false}
    },
    sorcerers:{
        id:"sorcerers",
        name:"Sistema de Feiticeiros",
        shortName:"Feiticeiros",
        description:"Sistema baseado em feitiços, técnicas, energia e domínios.",
        enabled:false,
        color:"#4B8CFF",
        icon:"✧",
        features:{abilities:false,assimilations:false,grimoire:false,blessings:false,spells:true,akumas:false,stories:false,noblePowers:false,emotions:false,fantasyPowers:false}
    },
    akumas:{
        id:"akumas",
        name:"Sistema de Akumas",
        shortName:"Akumas",
        description:"Sistema baseado em poderes, transformações e manifestações de Akumas.",
        enabled:false,
        color:"#D54444",
        icon:"☠",
        features:{abilities:false,assimilations:false,grimoire:false,blessings:false,spells:false,akumas:true,stories:false,noblePowers:false,emotions:false,fantasyPowers:false}
    },
    stories:{
        id:"stories",
        name:"Sistema de Histórias",
        shortName:"Histórias",
        description:"Sistema baseado em histórias, narrativas e poderes ligados ao passado dos personagens.",
        enabled:false,
        color:"#B98552",
        icon:"📖",
        features:{abilities:false,assimilations:false,grimoire:false,blessings:false,spells:false,akumas:false,stories:true,noblePowers:false,emotions:false,fantasyPowers:false}
    },
    noble:{
        id:"noble",
        name:"Sistema Nobre",
        shortName:"Nobre",
        description:"Sistema baseado em linhagens, títulos, autoridade e poderes nobres.",
        enabled:false,
        color:"#B69AFF",
        icon:"♛",
        features:{abilities:false,assimilations:false,grimoire:false,blessings:false,spells:false,akumas:false,stories:false,noblePowers:true,emotions:false,fantasyPowers:false}
    },
    emotions:{
        id:"emotions",
        name:"Sistema de Emoções",
        shortName:"Emoções",
        description:"Sistema baseado em emoções, estados mentais e manifestações emocionais.",
        enabled:false,
        color:"#FF6FAE",
        icon:"♥",
        features:{abilities:false,assimilations:false,grimoire:false,blessings:false,spells:false,akumas:false,stories:false,noblePowers:false,emotions:true,fantasyPowers:false}
    },
    fantasy:{
        id:"fantasy",
        name:"Sistema Fantasioso",
        shortName:"Fantasioso",
        description:"Sistema de fantasia com poderes, equipamentos, magias e habilidades próprias.",
        enabled:false,
        color:"#54C78A",
        icon:"⚔",
        features:{abilities:false,assimilations:false,grimoire:false,blessings:false,spells:false,akumas:false,stories:false,noblePowers:false,emotions:false,fantasyPowers:true}
    }
};

const DEFAULT_RPG_SYSTEM_ID="paranormal";

function getRPGSystem(systemId){
    const id=String(systemId||DEFAULT_RPG_SYSTEM_ID).trim().toLowerCase();
    return RPG_SYSTEMS[id]||RPG_SYSTEMS[DEFAULT_RPG_SYSTEM_ID];
}

function getAllRPGSystems(){return Object.values(RPG_SYSTEMS);}
function getEnabledRPGSystems(){return getAllRPGSystems().filter(system=>system.enabled===true);}
function isValidRPGSystem(systemId){return Boolean(RPG_SYSTEMS[String(systemId||"").trim().toLowerCase()]);}
function isRPGSystemEnabled(systemId){return Boolean(RPG_SYSTEMS[String(systemId||"").trim().toLowerCase()]?.enabled===true);}
function normalizeRPGSystemId(systemId){return isValidRPGSystem(systemId)?String(systemId).trim().toLowerCase():DEFAULT_RPG_SYSTEM_ID;}
function areRPGSystemsCompatible(firstSystemId,secondSystemId){return normalizeRPGSystemId(firstSystemId)===normalizeRPGSystemId(secondSystemId);}

function loadPageExtension(src,dataKey,guard){
    if(!guard()||document.querySelector(`script[data-extension="${dataKey}"]`)) return;
    const script=document.createElement("script");
    script.src=src;
    script.async=false;
    script.dataset.extension=dataKey;
    document.body.appendChild(script);
}

window.addEventListener("DOMContentLoaded",()=>{
    loadPageExtension("mesa-reacoes.js","table-reactions",()=>Boolean(document.querySelector(".table-app")));
    loadPageExtension("mesa-sistema-v2.js","table-system-v2",()=>Boolean(document.querySelector(".table-app")));
    loadPageExtension("mesa-habilidades-v2.js","table-abilities-v2",()=>Boolean(document.querySelector(".table-app")));
    loadPageExtension("mesa-efeitos-habilidades-v2.js","table-ability-effects-v2",()=>Boolean(document.querySelector(".table-app")));
    loadPageExtension("sistema-base-v2.js","system-base-v2",()=>Boolean(document.querySelector(".character-editor-page")));
    loadPageExtension("sistema-base-habilidades-nomes.js","system-base-ability-names",()=>Boolean(document.querySelector(".character-editor-page")||document.querySelector(".table-app")));
});
