/*==========================================================
=              SISTEMAS DE RPG DISPONÍVEIS
==========================================================*/

const RPG_SYSTEMS = {

    paranormal:{

        id:"paranormal",

        name:"Sistema Paranormal",

        shortName:"Paranormal",

        description:
            "Sistema de habilidades, assimilações, rituais e manifestações paranormais.",

        enabled:true,

        color:"#7B2CFF",

        icon:"◇",

        features:{

            abilities:true,

            assimilations:true,

            grimoire:true,

            blessings:false,

            spells:false,

            akumas:false,

            stories:false,

            noblePowers:false,

            emotions:false,

            fantasyPowers:false

        }

    },


    blessings:{

        id:"blessings",

        name:"Sistema de Bênçãos",

        shortName:"Bênçãos",

        description:
            "Sistema baseado em bênçãos, milagres, marcas e poderes concedidos.",

        enabled:false,

        color:"#E7C65B",

        icon:"✦",

        features:{

            abilities:false,

            assimilations:false,

            grimoire:false,

            blessings:true,

            spells:false,

            akumas:false,

            stories:false,

            noblePowers:false,

            emotions:false,

            fantasyPowers:false

        }

    },


    sorcerers:{

        id:"sorcerers",

        name:"Sistema de Feiticeiros",

        shortName:"Feiticeiros",

        description:
            "Sistema baseado em feitiços, técnicas, energia e domínios.",

        enabled:false,

        color:"#4B8CFF",

        icon:"✧",

        features:{

            abilities:false,

            assimilations:false,

            grimoire:false,

            blessings:false,

            spells:true,

            akumas:false,

            stories:false,

            noblePowers:false,

            emotions:false,

            fantasyPowers:false

        }

    },


    akumas:{

        id:"akumas",

        name:"Sistema de Akumas",

        shortName:"Akumas",

        description:
            "Sistema baseado em poderes, transformações e manifestações de Akumas.",

        enabled:false,

        color:"#D54444",

        icon:"☠",

        features:{

            abilities:false,

            assimilations:false,

            grimoire:false,

            blessings:false,

            spells:false,

            akumas:true,

            stories:false,

            noblePowers:false,

            emotions:false,

            fantasyPowers:false

        }

    },


    stories:{

        id:"stories",

        name:"Sistema de Histórias",

        shortName:"Histórias",

        description:
            "Sistema baseado em histórias, narrativas e poderes ligados ao passado dos personagens.",

        enabled:false,

        color:"#B98552",

        icon:"📖",

        features:{

            abilities:false,

            assimilations:false,

            grimoire:false,

            blessings:false,

            spells:false,

            akumas:false,

            stories:true,

            noblePowers:false,

            emotions:false,

            fantasyPowers:false

        }

    },


    noble:{

        id:"noble",

        name:"Sistema Nobre",

        shortName:"Nobre",

        description:
            "Sistema baseado em linhagens, títulos, autoridade e poderes nobres.",

        enabled:false,

        color:"#B69AFF",

        icon:"♛",

        features:{

            abilities:false,

            assimilations:false,

            grimoire:false,

            blessings:false,

            spells:false,

            akumas:false,

            stories:false,

            noblePowers:true,

            emotions:false,

            fantasyPowers:false

        }

    },


    emotions:{

        id:"emotions",

        name:"Sistema de Emoções",

        shortName:"Emoções",

        description:
            "Sistema baseado em emoções, estados mentais e manifestações emocionais.",

        enabled:false,

        color:"#FF6FAE",

        icon:"♥",

        features:{

            abilities:false,

            assimilations:false,

            grimoire:false,

            blessings:false,

            spells:false,

            akumas:false,

            stories:false,

            noblePowers:false,

            emotions:true,

            fantasyPowers:false

        }

    },


    fantasy:{

        id:"fantasy",

        name:"Sistema Fantasioso",

        shortName:"Fantasioso",

        description:
            "Sistema de fantasia com poderes, equipamentos, magias e habilidades próprias.",

        enabled:false,

        color:"#54C78A",

        icon:"⚔",

        features:{

            abilities:false,

            assimilations:false,

            grimoire:false,

            blessings:false,

            spells:false,

            akumas:false,

            stories:false,

            noblePowers:false,

            emotions:false,

            fantasyPowers:true

        }

    }

};


/*==========================================================
=              SISTEMA PADRÃO
==========================================================*/

const DEFAULT_RPG_SYSTEM_ID =
    "paranormal";


/*==========================================================
=              PEGAR SISTEMA PELO ID
==========================================================*/

function getRPGSystem(
    systemId
){

    const normalizedId =
        String(
            systemId ||
            DEFAULT_RPG_SYSTEM_ID
        )
            .trim()
            .toLowerCase();


    return (
        RPG_SYSTEMS[
            normalizedId
        ] ||
        RPG_SYSTEMS[
            DEFAULT_RPG_SYSTEM_ID
        ]
    );

}


/*==========================================================
=              PEGAR TODOS OS SISTEMAS
==========================================================*/

function getAllRPGSystems(){

    return Object.values(
        RPG_SYSTEMS
    );

}


/*==========================================================
=              SISTEMAS ATIVOS
==========================================================*/

function getEnabledRPGSystems(){

    return getAllRPGSystems()
        .filter(
            system =>
                system.enabled === true
        );

}


/*==========================================================
=              VERIFICAR SE EXISTE
==========================================================*/

function isValidRPGSystem(
    systemId
){

    return Boolean(
        RPG_SYSTEMS[
            String(
                systemId || ""
            )
                .trim()
                .toLowerCase()
        ]
    );

}


/*==========================================================
=              VERIFICAR SE ESTÁ DISPONÍVEL
==========================================================*/

function isRPGSystemEnabled(
    systemId
){

    const system =
        RPG_SYSTEMS[
            String(
                systemId || ""
            )
                .trim()
                .toLowerCase()
        ];


    return Boolean(
        system &&
        system.enabled === true
    );

}


/*==========================================================
=              NORMALIZAR ID
==========================================================*/

function normalizeRPGSystemId(
    systemId
){

    if(
        !isValidRPGSystem(
            systemId
        )
    ){

        return DEFAULT_RPG_SYSTEM_ID;

    }


    return String(
        systemId
    )
        .trim()
        .toLowerCase();

}


/*==========================================================
=              COMPATIBILIDADE
==========================================================*/

function areRPGSystemsCompatible(
    firstSystemId,
    secondSystemId
){

    return (
        normalizeRPGSystemId(
            firstSystemId
        ) ===
        normalizeRPGSystemId(
            secondSystemId
        )
    );

}


/*==========================================================
=       CARREGAR EXTENSÕES EXCLUSIVAS DA MESA
==========================================================*/

window.addEventListener(
    "DOMContentLoaded",
    () => {

        if(
            !document.querySelector(
                ".table-app"
            )
        ){
            return;
        }

        if(
            document.querySelector(
                'script[data-table-reactions="true"]'
            )
        ){
            return;
        }

        const script =
            document.createElement("script");

        script.src =
            "mesa-reacoes.js";

        script.async =
            false;

        script.dataset.tableReactions =
            "true";

        document.body.appendChild(
            script
        );

    }
);