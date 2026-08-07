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

    updateLifeSystem();

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