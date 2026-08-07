/*==========================================================
=                 EDITOR-FICHA.JS - PARTE 1
==========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    initCharacterEditor
);


/*==========================================================
=                       STORAGE
==========================================================*/

const CHARACTER_EDITOR_STORAGE =
    "ordem_characters";

const CAMPAIGN_EDITOR_STORAGE =
    "ordem_campaigns";


/*==========================================================
=                       ESTADO
==========================================================*/

let editorCharacters = [];

let editorCampaigns = [];

let editingCharacter = null;

let characterPhotoBase64 = "";

let linkedCampaignId = null;

let characterBodyState = {};


/*==========================================================
=                       ELEMENTOS
==========================================================*/

const characterEditorName =
    document.getElementById(
        "characterEditorName"
    );

const characterLevel =
    document.getElementById(
        "characterLevel"
    );

const characterOrigin =
    document.getElementById(
        "characterOrigin"
    );

const characterAge =
    document.getElementById(
        "characterAge"
    );


/*==========================================================
=                       FOTO
==========================================================*/

const characterPhotoInput =
    document.getElementById(
        "characterPhotoInput"
    );

const characterPhotoPreview =
    document.querySelector(
        ".character-photo-preview"
    );


/*==========================================================
=                       VIDA
==========================================================*/

const lifeMode =
    document.getElementById(
        "lifeMode"
    );

const classicLifeSystem =
    document.getElementById(
        "classicLifeSystem"
    );

const bodyLifeSystem =
    document.getElementById(
        "bodyLifeSystem"
    );


/*==========================================================
=                       PV
==========================================================*/

const characterPV =
    document.getElementById(
        "characterPV"
    );

const characterPVMax =
    document.getElementById(
        "characterPVMax"
    );

const characterPVTemp =
    document.getElementById(
        "characterPVTemp"
    );


/*==========================================================
=                       PD
==========================================================*/

const characterPD =
    document.getElementById(
        "characterPD"
    );

const characterPDMax =
    document.getElementById(
        "characterPDMax"
    );

const characterPDTemp =
    document.getElementById(
        "characterPDTemp"
    );


/*==========================================================
=                       PA
==========================================================*/

const characterPA =
    document.getElementById(
        "characterPA"
    );

const characterPAMax =
    document.getElementById(
        "characterPAMax"
    );


/*==========================================================
=                 PARTES DO CORPO
==========================================================*/

const bodyHead =
    document.getElementById(
        "bodyHead"
    );

const bodyChest =
    document.getElementById(
        "bodyChest"
    );

const bodyAbdomen =
    document.getElementById(
        "bodyAbdomen"
    );

const bodyLeftArm =
    document.getElementById(
        "bodyLeftArm"
    );

const bodyRightArm =
    document.getElementById(
        "bodyRightArm"
    );

const bodyLeftLeg =
    document.getElementById(
        "bodyLeftLeg"
    );

const bodyRightLeg =
    document.getElementById(
        "bodyRightLeg"
    );

const bodyTemporaryPV =
    document.getElementById(
        "bodyTemporaryPV"
    );


/*==========================================================
=                       ATRIBUTOS
==========================================================*/

const attributeFOR =
    document.getElementById(
        "attributeFOR"
    );

const attributeAGI =
    document.getElementById(
        "attributeAGI"
    );

const attributeINT =
    document.getElementById(
        "attributeINT"
    );

const attributeVIG =
    document.getElementById(
        "attributeVIG"
    );

const attributePRE =
    document.getElementById(
        "attributePRE"
    );


/*==========================================================
=                 VÍNCULO COM CAMPANHA
==========================================================*/

const characterCampaignCode =
    document.getElementById(
        "characterCampaignCode"
    );

const linkCharacterCampaign =
    document.getElementById(
        "linkCharacterCampaign"
    );

const unlinkCharacterCampaign =
    document.getElementById(
        "unlinkCharacterCampaign"
    );

const linkedCampaignInfo =
    document.getElementById(
        "linkedCampaignInfo"
    );

const linkedCampaignName =
    document.getElementById(
        "linkedCampaignName"
    );


/*==========================================================
=                       SALVAR
==========================================================*/

const saveCharacterEditor =
    document.getElementById(
        "saveCharacterEditor"
    );


/*==========================================================
=                       MODAL
==========================================================*/

const characterEditorMessage =
    document.getElementById(
        "characterEditorMessage"
    );

const characterEditorMessageTitle =
    document.getElementById(
        "characterEditorMessageTitle"
    );

const characterEditorMessageText =
    document.getElementById(
        "characterEditorMessageText"
    );

const characterEditorMessageIcon =
    document.getElementById(
        "characterEditorMessageIcon"
    );

const closeCharacterEditorMessage =
    document.getElementById(
        "closeCharacterEditorMessage"
    );


/*==========================================================
=                 INICIALIZAÇÃO
==========================================================*/

function initCharacterEditor(){

    loadCharacterEditorStorage();

    discoverEditingCharacter();

    bindCharacterEditorEvents();

    bindAutomaticStatEvents();

    bindCurrentValueLimits();

    bindBodyConditionEvents();


    if(!editingCharacter){

        initializeBodyStates();

    }


    updateLifeSystem();

    calculateAutomaticStats();

}


/*==========================================================
=                 CARREGAR STORAGE
==========================================================*/

function loadCharacterEditorStorage(){

    try{

        const savedCharacters =
            JSON.parse(
                localStorage.getItem(
                    CHARACTER_EDITOR_STORAGE
                )
            );

        editorCharacters =
            Array.isArray(savedCharacters)
                ? savedCharacters
                : [];

    }
    catch(error){

        console.error(
            "Erro ao carregar fichas:",
            error
        );

        editorCharacters = [];

    }


    try{

        const savedCampaigns =
            JSON.parse(
                localStorage.getItem(
                    CAMPAIGN_EDITOR_STORAGE
                )
            );

        editorCampaigns =
            Array.isArray(savedCampaigns)
                ? savedCampaigns
                : [];

    }
    catch(error){

        console.error(
            "Erro ao carregar campanhas:",
            error
        );

        editorCampaigns = [];

    }

}


/*==========================================================
=                 DESCOBRIR SE ESTÁ EDITANDO
==========================================================*/

function discoverEditingCharacter(){

    const params =
        new URLSearchParams(
            window.location.search
        );

    const characterId =
        params.get("id") ||
        params.get("character");

    if(!characterId){

        return;

    }

    editingCharacter =
        editorCharacters.find(
            character =>
                character.id ===
                characterId
        ) || null;

    if(!editingCharacter){

        return;

    }

    loadCharacterIntoEditor();

}


/*==========================================================
=                       EVENTOS
==========================================================*/

function bindCharacterEditorEvents(){

    lifeMode?.addEventListener(
        "change",
        updateLifeSystem
    );


    characterPhotoInput?.addEventListener(
        "change",
        handleCharacterPhoto
    );


    linkCharacterCampaign?.addEventListener(
        "click",
        linkCharacterToCampaignByCode
    );


    unlinkCharacterCampaign?.addEventListener(
        "click",
        unlinkCharacterFromCampaign
    );


    saveCharacterEditor?.addEventListener(
        "click",
        saveCharacter
    );


    characterCampaignCode?.addEventListener(
        "input",
        () => {

            characterCampaignCode.value =
                characterCampaignCode.value
                    .toUpperCase()
                    .replace(
                        /[^A-Z0-9]/g,
                        ""
                    );

        }
    );


    characterCampaignCode?.addEventListener(
        "keydown",
        event => {

            if(event.key === "Enter"){

                linkCharacterToCampaignByCode();

            }

        }
    );

}


/*==========================================================
=              TROCAR SISTEMA DE VIDA
==========================================================*/

function updateLifeSystem(){

    if(
        !lifeMode ||
        !classicLifeSystem ||
        !bodyLifeSystem
    ){

        return;

    }

    const mode =
        lifeMode.value;


    if(mode === "body"){

        classicLifeSystem.classList.add(
            "hidden"
        );

        bodyLifeSystem.classList.remove(
            "hidden"
        );

    }
    else{

        bodyLifeSystem.classList.add(
            "hidden"
        );

        classicLifeSystem.classList.remove(
            "hidden"
        );

    }

}


/*==========================================================
=                       FOTO
==========================================================*/

async function handleCharacterPhoto(){

    const file =
        characterPhotoInput?.files?.[0];

    if(!file){

        return;

    }

    try{

        characterPhotoBase64 =
            await characterFileToBase64(
                file
            );

        renderCharacterPhoto();

    }
    catch(error){

        console.error(
            "Erro ao carregar foto:",
            error
        );

        showCharacterEditorMessage(
            "Erro na imagem",
            "Não foi possível carregar a foto selecionada."
        );

    }

}


/*==========================================================
=                 MOSTRAR FOTO
==========================================================*/

function renderCharacterPhoto(){

    if(
        !characterPhotoPreview ||
        !characterPhotoBase64
    ){

        return;

    }

    characterPhotoPreview.innerHTML =
        "";

    const image =
        document.createElement(
            "img"
        );

    image.src =
        characterPhotoBase64;

    image.alt =
        characterEditorName?.value ||
        "Personagem";

    characterPhotoPreview.appendChild(
        image
    );

}


/*==========================================================
=                 ARQUIVO PARA BASE64
==========================================================*/

function characterFileToBase64(file){

    return new Promise(
        (resolve,reject) => {

            const reader =
                new FileReader();

            reader.onload =
                () => resolve(
                    reader.result
                );

            reader.onerror =
                reject;

            reader.readAsDataURL(
                file
            );

        }
    );

}


/*==========================================================
=              VINCULAR PELO CÓDIGO
==========================================================*/

function linkCharacterToCampaignByCode(){

    const code =
        characterCampaignCode
            ?.value
            .trim()
            .toUpperCase() || "";

    if(!code){

        showCharacterEditorMessage(
            "Código necessário",
            "Digite o código de convite da campanha."
        );

        characterCampaignCode?.focus();

        return;

    }


    const campaign =
        editorCampaigns.find(
            item =>
                String(
                    item.inviteCode || ""
                ).toUpperCase() ===
                code
        );


    if(!campaign){

        showCharacterEditorMessage(
            "Campanha não encontrada",
            "Não existe uma campanha com esse código neste navegador."
        );

        return;

    }


    const maxPlayers =
        Number(
            campaign.maxPlayers
        ) || 4;

    const players =
        Array.isArray(
            campaign.players
        )
            ? campaign.players
            : [];


    const characterId =
        editingCharacter?.id;


    const alreadyLinked =
        characterId
            ? players.some(
                player =>
                    player.characterId ===
                    characterId
            )
            : false;


    if(
        !alreadyLinked &&
        players.length >= maxPlayers
    ){

        showCharacterEditorMessage(
            "Campanha cheia",
            "Essa campanha atingiu o limite máximo de jogadores."
        );

        return;

    }


    linkedCampaignId =
        campaign.id;


    if(linkedCampaignName){

        linkedCampaignName.textContent =
            campaign.name;

    }


    linkedCampaignInfo
        ?.classList
        .remove("hidden");


    showCharacterEditorMessage(
        "Campanha encontrada",
        `A ficha será vinculada à campanha "${campaign.name}" quando for salva.`
    );

}


/*==========================================================
=              REMOVER VÍNCULO
==========================================================*/

function unlinkCharacterFromCampaign(){

    linkedCampaignId = null;


    linkedCampaignInfo
        ?.classList
        .add("hidden");


    if(characterCampaignCode){

        characterCampaignCode.value =
            "";

    }

}


/*==========================================================
=                 GERAR ID
==========================================================*/

function createCharacterEditorId(){

    if(
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ){

        return crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .slice(2)
    );

}


/*==========================================================
=                 SALVAR FICHA
==========================================================*/

function saveCharacter(){

    const name =
        characterEditorName
            ?.value
            .trim() || "";


    if(!name){

        showCharacterEditorMessage(
            "Nome obrigatório",
            "Digite o nome do personagem antes de salvar."
        );

        characterEditorName?.focus();

        return;

    }


    const characterId =
        editingCharacter?.id ||
        createCharacterEditorId();


    const oldCharacter =
        editingCharacter || {};


    const characterData = {

        ...oldCharacter,

        id:
            characterId,

        name:
            name,

        level:
            Number(
                characterLevel?.value
            ) || 1,

        origin:
            characterOrigin?.value.trim() ||
            "",

        age:
            Number(
                characterAge?.value
            ) || 0,

        photo:
            characterPhotoBase64 ||
            oldCharacter.photo ||
            "",

        lifeMode:
            lifeMode?.value ||
            "classic",

        campaignId:
            linkedCampaignId ||
            null,

            bodyState:
    structuredCloneSafe(
        characterBodyState
    ),


        /*==================================================
=                       STATUS
==================================================*/

        status:{

            ...(oldCharacter.status || {}),

            pvAtual:
                Number(
                    characterPV?.value
                ) || 0,

            pvMax:
                Number(
                    characterPVMax?.value
                ) || 0,

            pvTemp:
                Number(
                    characterPVTemp?.value
                ) || 0,

            pdAtual:
                Number(
                    characterPD?.value
                ) || 0,

            pdMax:
                Number(
                    characterPDMax?.value
                ) || 0,

            pdTemp:
                Number(
                    characterPDTemp?.value
                ) || 0,

            paAtual:
                Number(
                    characterPA?.value
                ) || 0,

            paMax:
                Number(
                    characterPAMax?.value
                ) || 0

        },


        /*==================================================
=                       CORPO
==================================================*/

        body:{

            ...(oldCharacter.body || {}),

            head:
                Number(
                    bodyHead?.value
                ) || 0,

            chest:
                Number(
                    bodyChest?.value
                ) || 0,

            abdomen:
                Number(
                    bodyAbdomen?.value
                ) || 0,

            leftArm:
                Number(
                    bodyLeftArm?.value
                ) || 0,

            rightArm:
                Number(
                    bodyRightArm?.value
                ) || 0,

            leftLeg:
                Number(
                    bodyLeftLeg?.value
                ) || 0,

            rightLeg:
                Number(
                    bodyRightLeg?.value
                ) || 0,

            temporaryPV:
                Number(
                    bodyTemporaryPV?.value
                ) || 0

        },


        /*==================================================
=                       ATRIBUTOS
==================================================*/

        attributes:{

            ...(oldCharacter.attributes || {}),

            for:
                Number(
                    attributeFOR?.value
                ) || 1,

            agi:
                Number(
                    attributeAGI?.value
                ) || 1,

            int:
                Number(
                    attributeINT?.value
                ) || 1,

            vig:
                Number(
                    attributeVIG?.value
                ) || 1,

            pre:
                Number(
                    attributePRE?.value
                ) || 1

        },


        /*==================================================
=            DADOS QUE VAMOS IMPLEMENTAR DEPOIS
==================================================*/

        skills:
            oldCharacter.skills || [],

        abilities:
            oldCharacter.abilities || [],

        assimilations:
            oldCharacter.assimilations || [],

        inventory:
            oldCharacter.inventory || [],

        conditions:
            oldCharacter.conditions || [],

        grimoire:
            oldCharacter.grimoire || [],

        attacks:
            collectQuickAttacks(
                oldCharacter.attacks || []
            ),


        createdAt:
            oldCharacter.createdAt ||
            Date.now(),

        updatedAt:
            Date.now()

    };


    saveCharacterToStorage(
        characterData
    );

}

/*==========================================================
=              EDITOR-FICHA.JS - PARTE 2
==========================================================*/

/*==========================================================
=              COLETAR ATAQUES RÁPIDOS
==========================================================*/

function collectQuickAttacks(oldAttacks = []){

    const attacks = [];

    for(let index = 1; index <= 4; index++){

        const name =
            document.getElementById(
                `attack${index}Name`
            )?.value.trim() || "";

        const roll =
            document.getElementById(
                `attack${index}Roll`
            )?.value.trim() || "";

        const damage =
            document.getElementById(
                `attack${index}Damage`
            )?.value.trim() || "";

        const oldAttack =
            oldAttacks[index - 1] || {};

        if(
            !name &&
            !roll &&
            !damage
        ){

            continue;

        }

        attacks.push({

            id:
                oldAttack.id ||
                createCharacterEditorId(),

            name,

            roll,

            damage,

            icon:
                oldAttack.icon || ""

        });

    }

    return attacks;

}


/*==========================================================
=              SALVAR FICHA NO STORAGE
==========================================================*/

function saveCharacterToStorage(
    characterData
){

    const index =
        editorCharacters.findIndex(
            character =>
                character.id ===
                characterData.id
        );

    if(index === -1){

        editorCharacters.unshift(
            characterData
        );

    }
    else{

        editorCharacters[index] =
            characterData;

    }

    localStorage.setItem(
        CHARACTER_EDITOR_STORAGE,
        JSON.stringify(
            editorCharacters
        )
    );


    syncCharacterCampaign(
        characterData
    );


    editingCharacter =
        characterData;


    showCharacterEditorMessage(
        "Ficha salva",
        "A ficha foi salva com sucesso.",
        true
    );

}


/*==========================================================
=              SINCRONIZAR COM CAMPANHA
==========================================================*/

function syncCharacterCampaign(
    character
){

    let changed = false;


    /*
        Primeiro removemos a ficha de qualquer campanha
        antiga onde ela ainda esteja cadastrada.
    */

    editorCampaigns.forEach(
        campaign => {

            if(
                !Array.isArray(
                    campaign.players
                )
            ){

                campaign.players = [];

            }

            const before =
                campaign.players.length;

            campaign.players =
                campaign.players.filter(
                    player =>
                        player.characterId !==
                        character.id
                );

            if(
                before !==
                campaign.players.length
            ){

                changed = true;

            }

        }
    );


    /*
        Se a ficha estiver vinculada a uma campanha,
        adicionamos novamente nela.
    */

    if(character.campaignId){

        const campaign =
            editorCampaigns.find(
                item =>
                    item.id ===
                    character.campaignId
            );

        if(campaign){

            if(
                !Array.isArray(
                    campaign.players
                )
            ){

                campaign.players = [];

            }

            const maxPlayers =
                Number(
                    campaign.maxPlayers
                ) || 4;


            if(
                campaign.players.length <
                maxPlayers
            ){

                campaign.players.push({

                    characterId:
                        character.id,

                    name:
                        character.name,

                    photo:
                        character.photo || "",

                    position:null

                });

                changed = true;

            }
            else{

                /*
                    Segurança caso a campanha tenha lotado
                    entre a vinculação e o salvamento.
                */

                character.campaignId = null;

                linkedCampaignId = null;

                showCharacterEditorMessage(
                    "Campanha cheia",
                    "A campanha atingiu o limite de jogadores. A ficha foi salva sem vínculo."
                );

            }

        }

    }


    if(changed){

        localStorage.setItem(
            CAMPAIGN_EDITOR_STORAGE,
            JSON.stringify(
                editorCampaigns
            )
        );

    }

}


/*==========================================================
=              CARREGAR FICHA NO EDITOR
==========================================================*/

function loadCharacterIntoEditor(){

    if(!editingCharacter){

        return;

    }


    if(characterEditorName){

        characterEditorName.value =
            editingCharacter.name || "";

    }

    if(characterLevel){

        characterLevel.value =
            editingCharacter.level || 1;

    }

    if(characterOrigin){

        characterOrigin.value =
            editingCharacter.origin || "";

    }

    if(characterAge){

        characterAge.value =
            editingCharacter.age || "";

    }


    /*======================================================
=                       FOTO
=======================================================*/

    characterPhotoBase64 =
        editingCharacter.photo || "";

    if(characterPhotoBase64){

        renderCharacterPhoto();

    }


    /*======================================================
=                 SISTEMA DE VIDA
=======================================================*/

    if(lifeMode){

        lifeMode.value =
            editingCharacter.lifeMode ||
            "classic";

    }


    const status =
        editingCharacter.status || {};


    if(characterPV){

        characterPV.value =
            status.pvAtual ?? 0;

    }

    if(characterPVMax){

        characterPVMax.value =
            status.pvMax ?? 0;

    }

    if(characterPVTemp){

        characterPVTemp.value =
            status.pvTemp ?? 0;

    }


    if(characterPD){

        characterPD.value =
            status.pdAtual ?? 0;

    }

    if(characterPDMax){

        characterPDMax.value =
            status.pdMax ?? 0;

    }

    if(characterPDTemp){

        characterPDTemp.value =
            status.pdTemp ?? 0;

    }


    if(characterPA){

        characterPA.value =
            status.paAtual ?? 0;

    }

    if(characterPAMax){

        characterPAMax.value =
            status.paMax ?? 0;

    }


    /*======================================================
=                       CORPO
=======================================================*/

    const body =
        editingCharacter.body || {};

        characterBodyState =
    structuredCloneSafe(
        editingCharacter.bodyState ||
        {}
    );


    if(bodyHead){

        bodyHead.value =
            body.head ?? 0;

    }

    if(bodyChest){

        bodyChest.value =
            body.chest ?? 0;

    }

    if(bodyAbdomen){

        bodyAbdomen.value =
            body.abdomen ?? 0;

    }

    if(bodyLeftArm){

        bodyLeftArm.value =
            body.leftArm ?? 0;

    }

    if(bodyRightArm){

        bodyRightArm.value =
            body.rightArm ?? 0;

    }

    if(bodyLeftLeg){

        bodyLeftLeg.value =
            body.leftLeg ?? 0;

    }

    if(bodyRightLeg){

        bodyRightLeg.value =
            body.rightLeg ?? 0;

    }

    if(bodyTemporaryPV){

        bodyTemporaryPV.value =
            body.temporaryPV ?? 0;

    }


    /*======================================================
=                       ATRIBUTOS
=======================================================*/

    const attributes =
        editingCharacter.attributes || {};


    if(attributeFOR){

        attributeFOR.value =
            attributes.for ?? 1;

    }

    if(attributeAGI){

        attributeAGI.value =
            attributes.agi ?? 1;

    }

    if(attributeINT){

        attributeINT.value =
            attributes.int ?? 1;

    }

    if(attributeVIG){

        attributeVIG.value =
            attributes.vig ?? 1;

    }

    if(attributePRE){

        attributePRE.value =
            attributes.pre ?? 1;

    }


    /*======================================================
=                     ATAQUES
=======================================================*/

    loadQuickAttacks(
        editingCharacter.attacks || []
    );


    /*======================================================
=                     CAMPANHA
=======================================================*/

    linkedCampaignId =
        editingCharacter.campaignId ||
        null;


    if(linkedCampaignId){

        const campaign =
            editorCampaigns.find(
                item =>
                    item.id ===
                    linkedCampaignId
            );

        if(campaign){

            if(linkedCampaignName){

                linkedCampaignName.textContent =
                    campaign.name;

            }

            linkedCampaignInfo
                ?.classList
                .remove("hidden");

            if(characterCampaignCode){

                characterCampaignCode.value =
                    campaign.inviteCode || "";

            }

        }

    }

    initializeBodyStates();

calculateAutomaticStats();

    updateLifeSystem();

}


/*==========================================================
=              CARREGAR ATAQUES
==========================================================*/

function loadQuickAttacks(attacks){

    for(let index = 1; index <= 4; index++){

        const attack =
            attacks[index - 1];

        if(!attack){

            continue;

        }

        const name =
            document.getElementById(
                `attack${index}Name`
            );

        const roll =
            document.getElementById(
                `attack${index}Roll`
            );

        const damage =
            document.getElementById(
                `attack${index}Damage`
            );


        if(name){

            name.value =
                attack.name || "";

        }

        if(roll){

            roll.value =
                attack.roll || "";

        }

        if(damage){

            damage.value =
                attack.damage || "";

        }

    }

}


/*==========================================================
=              MENSAGEM DO EDITOR
==========================================================*/

function showCharacterEditorMessage(
    title,
    text,
    redirectAfter = false
){

    if(
        !characterEditorMessage ||
        !characterEditorMessageTitle ||
        !characterEditorMessageText
    ){

        if(redirectAfter){

            window.location.href =
                "ficha.html";

        }

        return;

    }


    characterEditorMessageTitle.textContent =
        title;

    characterEditorMessageText.textContent =
        text;

    if(characterEditorMessageIcon){

        characterEditorMessageIcon.textContent =
            "✓";

    }

    characterEditorMessage
        .classList
        .remove("hidden");


    if(closeCharacterEditorMessage){

        const newButton =
            closeCharacterEditorMessage
                .cloneNode(true);

        closeCharacterEditorMessage
            .replaceWith(
                newButton
            );


        newButton.addEventListener(
            "click",
            () => {

                characterEditorMessage
                    .classList
                    .add("hidden");

                if(redirectAfter){

                    window.location.href =
                        "ficha.html";

                }

            }
        );

    }

}


/*==========================================================
=              ESC FECHA MENSAGEM
==========================================================*/

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape" &&
            characterEditorMessage &&
            !characterEditorMessage
                .classList
                .contains("hidden")
        ){

            characterEditorMessage
                .classList
                .add("hidden");

        }

    }
);


/*==========================================================
=              STATUS AUTOMÁTICOS
==========================================================*/

function calculateAutomaticStats(){

    const level =
        Math.max(
            1,
            Number(
                characterLevel?.value
            ) || 1
        );

    const vig =
        Math.max(
            0,
            Number(
                attributeVIG?.value
            ) || 0
        );

    const pre =
        Math.max(
            0,
            Number(
                attributePRE?.value
            ) || 0
        );


    /*======================================================
    =                    PV CLÁSSICO
    ======================================================*/

    const calculatedPV =
        (7 + vig) * level;


    if(characterPVMax){

        characterPVMax.value =
            calculatedPV;

    }


    /*======================================================
    =                       PD
    ======================================================*/

    const calculatedPD =
        (4 + pre) * level;


    if(characterPDMax){

        characterPDMax.value =
            calculatedPD;

    }


    /*======================================================
    =                       PA
    ======================================================*/

    /*
        Nível 1–9  = 3 PA
        Nível 10–19 = 4 PA
        Nível 20–29 = 5 PA
        etc.
    */

    const calculatedPA =
        3 +
        Math.floor(
            level / 10
        );


    if(characterPAMax){

        characterPAMax.value =
            calculatedPA;

    }


    /*======================================================
    =              PARTES DO CORPO
    ======================================================*/

    calculateBodyMaximums(
        vig
    );

}


/*==========================================================
=              PV DAS PARTES DO CORPO
==========================================================*/

/*==========================================================
=              PV DAS PARTES DO CORPO
==========================================================*/

function calculateBodyMaximums(vig){

    const bodyValues = {

        head:
            2 + vig,

        chest:
            2 + vig,

        leftArm:
            1 + vig,

        rightArm:
            1 + vig,

        leftLeg:
            1 + vig,

        rightLeg:
            1 + vig

    };


    updateBodyPartMaximum(
        "head",
        bodyHead,
        bodyValues.head
    );

    updateBodyPartMaximum(
        "chest",
        bodyChest,
        bodyValues.chest
    );

    updateBodyPartMaximum(
        "leftArm",
        bodyLeftArm,
        bodyValues.leftArm
    );

    updateBodyPartMaximum(
        "rightArm",
        bodyRightArm,
        bodyValues.rightArm
    );

    updateBodyPartMaximum(
        "leftLeg",
        bodyLeftLeg,
        bodyValues.leftLeg
    );

    updateBodyPartMaximum(
        "rightLeg",
        bodyRightLeg,
        bodyValues.rightLeg
    );


    renderBodyStates();

}


/*==========================================================
=              ATUALIZAR MEMBRO
==========================================================*/

/*==========================================================
=              ATUALIZAR PV MÁXIMO DO MEMBRO
==========================================================*/

function updateBodyPartMaximum(
    partName,
    input,
    calculatedMax
){

    if(!input){

        return;

    }


    const state =
        characterBodyState[
            partName
        ] || {

            type:"natural"

        };


    /*
        Membro ausente não recebe cálculo.
    */

    if(state.type === "missing"){

        input.dataset.max = "0";

        return;

    }


    /*
        Prótese possui PV próprio.
    */

    if(state.type === "prosthetic"){

        input.dataset.max =
            Number(
                state.maxPV
            ) || 0;

        return;

    }


    /*
        Membro natural.
    */

    input.dataset.max =
        calculatedMax;


    /*
        Na criação da ficha, se estiver vazio,
        começa cheio.

        Depois disso aumentar VIG NÃO cura.
    */

    if(
        input.value === "" ||
        input.value === null
    ){

        input.value =
            calculatedMax;

    }


    /*
        Se o máximo diminuir e o atual estiver
        acima dele, reduzimos até o novo máximo.
    */

    if(
        Number(input.value) >
        calculatedMax
    ){

        input.value =
            calculatedMax;

    }

}


/*==========================================================
=              EVENTOS DOS CÁLCULOS
==========================================================*/

function bindAutomaticStatEvents(){

    characterLevel?.addEventListener(
        "input",
        calculateAutomaticStats
    );

    attributeVIG?.addEventListener(
        "input",
        calculateAutomaticStats
    );

    attributePRE?.addEventListener(
        "input",
        calculateAutomaticStats
    );

}


/*==========================================================
=              LIMITES DO PV ATUAL
==========================================================*/

function bindCurrentValueLimits(){

    characterPV?.addEventListener(
        "change",
        () => {

            const max =
                Number(
                    characterPVMax?.value
                ) || 0;

            let current =
                Number(
                    characterPV.value
                ) || 0;

            current =
                Math.max(
                    0,
                    Math.min(
                        current,
                        max
                    )
                );

            characterPV.value =
                current;

        }
    );


    characterPD?.addEventListener(
        "change",
        () => {

            const max =
                Number(
                    characterPDMax?.value
                ) || 0;

            let current =
                Number(
                    characterPD.value
                ) || 0;

            current =
                Math.max(
                    0,
                    Math.min(
                        current,
                        max
                    )
                );

            characterPD.value =
                current;

        }
    );


    characterPA?.addEventListener(
        "change",
        () => {

            const max =
                Number(
                    characterPAMax?.value
                ) || 0;

            let current =
                Number(
                    characterPA.value
                ) || 0;

            current =
                Math.max(
                    0,
                    Math.min(
                        current,
                        max
                    )
                );

            characterPA.value =
                current;

        }
    );

}


/*==========================================================
=              MEMBRO EM 0 = INUTILIZADO
==========================================================*/

function bindBodyConditionEvents(){

    const bodyInputs = [

        {
            name:"head",
            label:"Cabeça",
            input:bodyHead
        },

        {
            name:"chest",
            label:"Torso",
            input:bodyChest
        },

        {
            name:"leftArm",
            label:"Braço Esquerdo",
            input:bodyLeftArm
        },

        {
            name:"rightArm",
            label:"Braço Direito",
            input:bodyRightArm
        },

        {
            name:"leftLeg",
            label:"Perna Esquerda",
            input:bodyLeftLeg
        },

        {
            name:"rightLeg",
            label:"Perna Direita",
            input:bodyRightLeg
        }

    ];


    bodyInputs.forEach(part => {

        part.input?.addEventListener(
            "input",
            () => {

                updateBodyPartCondition(
                    part.name,
                    part.label,
                    part.input
                );

            }
        );

    });

}


/*==========================================================
=              ESTADO DO MEMBRO
==========================================================*/

function updateBodyPartCondition(
    partName,
    label,
    input
){

    if(!input){

        return;

    }

    const current =
        Number(
            input.value
        ) || 0;


    const max =
        Number(
            input.dataset.max
        ) || current;


    if(current < 0){

        input.value = 0;

    }


    if(current > max){

        input.value = max;

    }


    const row =
        input.closest(
            ".body-member-row"
        ) ||
        input.closest(
            ".status-card"
        );


    if(
        Number(input.value) <= 0
    ){

        row?.classList.add(
            "body-part-disabled"
        );

        input.dataset.condition =
            "disabled";

    }
    else{

        row?.classList.remove(
            "body-part-disabled"
        );

        input.dataset.condition =
            "normal";

    }

}

/*==========================================================
=              SISTEMA DE MEMBROS
==========================================================*/

const detachableBodyParts = {

    leftArm:{

        label:"Braço Esquerdo",

        input:bodyLeftArm

    },

    rightArm:{

        label:"Braço Direito",

        input:bodyRightArm

    },

    leftLeg:{

        label:"Perna Esquerda",

        input:bodyLeftLeg

    },

    rightLeg:{

        label:"Perna Direita",

        input:bodyRightLeg

    }

};


/*==========================================================
=              INICIALIZAR ESTADO DOS MEMBROS
==========================================================*/

function initializeBodyStates(){

    const saved =
        editingCharacter?.bodyState;


    if(
        saved &&
        typeof saved === "object"
    ){

        characterBodyState =
            structuredCloneSafe(saved);

    }


    const allParts = [

        "head",
        "chest",
        "leftArm",
        "rightArm",
        "leftLeg",
        "rightLeg"

    ];


    allParts.forEach(part => {

        if(!characterBodyState[part]){

            characterBodyState[part] = {

                type:"natural"

            };

        }

    });


    renderBodyStates();

}


/*==========================================================
=              CLONE SEGURO
==========================================================*/

function structuredCloneSafe(value){

    try{

        return structuredClone(
            value
        );

    }
    catch{

        return JSON.parse(
            JSON.stringify(value)
        );

    }

}


/*==========================================================
=              RENDERIZAR ESTADO DOS MEMBROS
==========================================================*/

function renderBodyStates(){

    Object.entries(
        detachableBodyParts
    )
    .forEach(
        ([partName,data]) => {

            renderDetachableBodyPart(
                partName,
                data
            );

        }
    );


    updateBodyPartCondition(
        "head",
        "Cabeça",
        bodyHead
    );

    updateBodyPartCondition(
        "chest",
        "Torso",
        bodyChest
    );

}


/*==========================================================
=              RENDERIZAR MEMBRO
==========================================================*/

function renderDetachableBodyPart(
    partName,
    data
){

    const input =
        data.input;

    if(!input){

        return;

    }


    const row =
        input.closest(
            ".body-member-row"
        );

    if(!row){

        return;

    }


    let controls =
        row.querySelector(
            ".body-part-controls"
        );


    if(!controls){

        controls =
            document.createElement(
                "div"
            );

        controls.className =
            "body-part-controls";

        row.appendChild(
            controls
        );

    }


    const state =
        characterBodyState[
            partName
        ] || {

            type:"natural"

        };


    row.classList.remove(
        "body-part-missing",
        "body-part-prosthetic",
        "body-part-disabled"
    );


    /*======================================================
    =                    AUSENTE
    ======================================================*/

    if(state.type === "missing"){

        row.classList.add(
            "body-part-missing"
        );

        input.disabled = true;

        input.value = "";

        controls.innerHTML = `

            <span class="body-state-badge missing">
                AUSENTE
            </span>

            <button
                type="button"
                class="body-action-button regenerate"
                data-part="${partName}">

                Regenerar

            </button>

            <button
                type="button"
                class="body-action-button prosthetic"
                data-part="${partName}">

                Instalar Prótese

            </button>

        `;


        bindBodyControlButtons(
            controls
        );

        return;

    }


    /*======================================================
    =                    PRÓTESE
    ======================================================*/

    if(state.type === "prosthetic"){

        row.classList.add(
            "body-part-prosthetic"
        );

        input.disabled = false;

        input.dataset.max =
            Number(
                state.maxPV
            ) || 0;


        if(
            state.currentPV !==
            undefined
        ){

            input.value =
                state.currentPV;

        }


        controls.innerHTML = `

            <span
                class="body-state-badge prosthetic"
                title="${escapeCharacterEditorHTML(
                    state.name ||
                    "Prótese"
                )}"
            >

                ${escapeCharacterEditorHTML(
                    state.name ||
                    "PRÓTESE"
                )}

                • ${Number(
                    input.value
                ) || 0}/${Number(
                    state.maxPV
                ) || 0}

            </span>

            <button
                type="button"
                class="body-action-button remove-prosthetic"
                data-part="${partName}">

                Remover

            </button>

        `;


        bindBodyControlButtons(
            controls
        );

        return;

    }


    /*======================================================
    =                    NATURAL
    ======================================================*/

    input.disabled = false;


    const current =
        Number(
            input.value
        ) || 0;


    const max =
        Number(
            input.dataset.max
        ) || 0;


    if(current <= 0){

        row.classList.add(
            "body-part-disabled"
        );

    }


    controls.innerHTML = `

        <span class="body-state-badge natural">

            ${
                current <= 0
                    ? "INUTILIZADO"
                    : `NATURAL • ${current}/${max}`
            }

        </span>

        <button
            type="button"
            class="body-action-button dismember"
            data-part="${partName}">

            Desmembrar

        </button>

    `;


    bindBodyControlButtons(
        controls
    );

}

/*==========================================================
=              EVENTOS DOS BOTÕES DO CORPO
==========================================================*/

function bindBodyControlButtons(
    container
){

    container
        .querySelector(
            ".dismember"
        )
        ?.addEventListener(
            "click",
            event => {

                dismemberBodyPart(
                    event.currentTarget
                        .dataset.part
                );

            }
        );


    container
        .querySelector(
            ".regenerate"
        )
        ?.addEventListener(
            "click",
            event => {

                regenerateBodyPart(
                    event.currentTarget
                        .dataset.part
                );

            }
        );


    container
        .querySelector(
            ".prosthetic"
        )
        ?.addEventListener(
            "click",
            event => {

                openProstheticCreator(
                    event.currentTarget
                        .dataset.part
                );

            }
        );


    container
        .querySelector(
            ".remove-prosthetic"
        )
        ?.addEventListener(
            "click",
            event => {

                removeProsthetic(
                    event.currentTarget
                        .dataset.part
                );

            }
        );

}


/*==========================================================
=                    DESMEMBRAR
==========================================================*/

function dismemberBodyPart(
    partName
){

    const part =
        detachableBodyParts[
            partName
        ];

    if(!part){

        return;

    }


    characterBodyState[
        partName
    ] = {

        type:"missing"

    };


    part.input.value = "";

    part.input.disabled = true;


    renderBodyStates();


    showCharacterEditorMessage(
        "Membro desmembrado",
        `${part.label} foi removido. Agora ele pode ser regenerado ou substituído por uma prótese.`
    );

}


/*==========================================================
=                    REGENERAR
==========================================================*/

function regenerateBodyPart(
    partName
){

    const part =
        detachableBodyParts[
            partName
        ];

    if(!part){

        return;

    }


    characterBodyState[
        partName
    ] = {

        type:"natural"

    };


    part.input.disabled = false;


    const vig =
        Math.max(
            0,
            Number(
                attributeVIG?.value
            ) || 0
        );


    const naturalMax =
        (
            partName === "leftArm" ||
            partName === "rightArm" ||
            partName === "leftLeg" ||
            partName === "rightLeg"
        )
            ? 1 + vig
            : 2 + vig;


    part.input.dataset.max =
        naturalMax;


    /*
        Regenerar traz o membro de volta
        com o PV natural máximo.
    */

    part.input.value =
        naturalMax;


    renderBodyStates();


    showCharacterEditorMessage(
        "Membro regenerado",
        `${part.label} foi restaurado.`
    );

}