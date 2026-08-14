/*==========================================================
=                    MESA.JS - PARTE 1
==========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    initTable
);


/*==========================================================
=                    STORAGE
==========================================================*/

const TABLE_CAMPAIGN_STORAGE =
    "ordem_campaigns";

const TABLE_CHARACTER_STORAGE =
    "ordem_characters";

const TABLE_ROLE_STORAGE =
    "ordem_table_role";

const TABLE_CHARACTER_CURRENT =
    "ordem_table_character";


/*==========================================================
=                    ESTADO
==========================================================*/

let tableCampaigns = [];

let tableCharacters = [];

let currentTableCampaign = null;

let currentTableCharacter = null;

let currentTableRole = null;

let selectedPosition = null;

let lastInitiativeRequestShown = null;


/*==========================================================
=                    ELEMENTOS
==========================================================*/

const tableCampaignName =
    document.getElementById(
        "tableCampaignName"
    );

const tableCampaignLabel =
    document.getElementById(
        "tableCampaignLabel"
    );

const tableRoleName =
    document.getElementById(
        "tableRoleName"
    );

const tableRoleIcon =
    document.getElementById(
        "tableRoleIcon"
    );

const sidebarRoleTitle =
    document.getElementById(
        "sidebarRoleTitle"
    );

const tableMenu =
    document.getElementById(
        "tableMenu"
    );

const leaveTableButton =
    document.getElementById(
        "leaveTable"
    );

const sceneBackground =
    document.getElementById(
        "sceneBackground"
    );

const tablePanelOverlay =
    document.getElementById(
        "tablePanelOverlay"
    );

const tableSidePanel =
    document.getElementById(
        "tableSidePanel"
    );

const tablePanelLabel =
    document.getElementById(
        "tablePanelLabel"
    );

const tablePanelTitle =
    document.getElementById(
        "tablePanelTitle"
    );

const tablePanelContent =
    document.getElementById(
        "tablePanelContent"
    );

const closeTablePanel =
    document.getElementById(
        "closeTablePanel"
    );

const positionModal =
    document.getElementById(
        "positionModal"
    );

const positionModalTitle =
    document.getElementById(
        "positionModalTitle"
    );

const positionModalBody =
    document.getElementById(
        "positionModalBody"
    );

const closePositionModal =
    document.getElementById(
        "closePositionModal"
    );

const diceModal =
    document.getElementById(
        "diceModal"
    );

const closeDiceModal =
    document.getElementById(
        "closeDiceModal"
    );

const campaignMusicPlayer =
    document.getElementById(
        "campaignMusicPlayer"
    );

const sceneUploadInput =
    document.getElementById(
        "sceneUploadInput"
    );

const musicUploadInput =
    document.getElementById(
        "musicUploadInput"
    );


/*==========================================================
=                    INICIALIZAÇÃO
==========================================================*/

function initTable(){

    loadTableStorage();

    discoverTableSession();

    if(!currentTableCampaign){

        return;

    }

    initializeCombatState();

    initializePublicChat();

    fillTableHeader();

    loadScene();

    loadMusic();

    createRoleMenu();

    bindTableEvents();

    renderCombatPositions();

    renderPublicChat();

    checkInitiativeRequest();

}


/*==========================================================
=                    CARREGAR STORAGE
==========================================================*/

function loadTableStorage(){

    try{

        tableCampaigns =
            JSON.parse(
                localStorage.getItem(
                    TABLE_CAMPAIGN_STORAGE
                )
            ) || [];

    }
    catch(error){

        console.error(
            "Erro ao carregar campanhas:",
            error
        );

        tableCampaigns = [];

    }

    try{

        tableCharacters =
            JSON.parse(
                localStorage.getItem(
                    TABLE_CHARACTER_STORAGE
                )
            ) || [];

    }
    catch(error){

        console.error(
            "Erro ao carregar fichas:",
            error
        );

        tableCharacters = [];

    }

}


/*==========================================================
=                    DESCOBRIR SESSÃO
==========================================================*/

function discoverTableSession(){

    const params =
        new URLSearchParams(
            window.location.search
        );

    const campaignId =
        params.get("campaign") ||
        localStorage.getItem(
            "ordem_current_campaign"
        );

    currentTableRole =
        params.get("role") ||
        localStorage.getItem(
            TABLE_ROLE_STORAGE
        );

    const characterId =
        params.get("character") ||
        localStorage.getItem(
            TABLE_CHARACTER_CURRENT
        );

    if(!campaignId){

        window.location.href =
            "campanhas.html";

        return;

    }

    currentTableCampaign =
        tableCampaigns.find(
            campaign =>
                campaign.id ===
                campaignId
        ) || null;

    if(!currentTableCampaign){

        window.location.href =
            "campanhas.html";

        return;

    }

    if(
        currentTableRole !== "player" &&
        currentTableRole !== "master"
    ){

        window.location.href =
            `mesa-login.html?campaign=${encodeURIComponent(
                currentTableCampaign.id
            )}`;

        return;

    }

    if(currentTableRole === "player"){

        currentTableCharacter =
            tableCharacters.find(
                character =>
                    character.id ===
                    characterId
            ) || null;

        if(!currentTableCharacter){

            window.location.href =
                `mesa-login.html?campaign=${encodeURIComponent(
                    currentTableCampaign.id
                )}`;

            return;

        }

    }

}


/*==========================================================
=                    CABEÇALHO
==========================================================*/

function fillTableHeader(){

    if(tableCampaignName){

        tableCampaignName.textContent =
            currentTableCampaign.name ||
            "Campanha";

    }

    if(tableCampaignLabel){

        tableCampaignLabel.textContent =
            currentTableRole === "master"
                ? "CONTROLE DO MESTRE"
                : "CAMPANHA";

    }

    if(currentTableRole === "master"){

        if(tableRoleName){

            tableRoleName.textContent =
                "Mestre";

        }

        if(tableRoleIcon){

            tableRoleIcon.textContent =
                "♛";

        }

        if(sidebarRoleTitle){

            sidebarRoleTitle.textContent =
                "MESTRE";

        }

    }
    else{

        if(tableRoleName){

            tableRoleName.textContent =
                currentTableCharacter?.name ||
                "Jogador";

        }

        if(tableRoleIcon){

            tableRoleIcon.textContent =
                "◇";

        }

        if(sidebarRoleTitle){

            sidebarRoleTitle.textContent =
                "JOGADOR";

        }

    }

}


/*==========================================================
=                    MENUS
==========================================================*/

const playerMenuItems = [

    {
        id:"character",
        icon:"👤",
        label:"Ficha"
    },

    {
        id:"attacks",
        icon:"⚔",
        label:"Ataques"
    },

    {
        id:"inventory",
        icon:"🎒",
        label:"Inventário"
    },

    {
        id:"conditions",
        icon:"◈",
        label:"Condições"
    },

    {
        id:"grimoire",
        icon:"✦",
        label:"Grimório"
    },

    {
        id:"dice",
        icon:"🎲",
        label:"Dados"
    },

    {
        id:"notes",
        icon:"📝",
        label:"Anotações"
    }

];


const masterMenuItems = [


    {
    id:"initiative",
    icon:"⚡",
    label:"Iniciativa"
},

{
    id:"next-round",
    icon:"⟳",
    label:"Passar Rodada"
},

    {
        id:"enemies",
        icon:"☠",
        label:"Ameaças"
    },

    {
        id:"npcs",
        icon:"♟",
        label:"NPCs"
    },

    {
        id:"map",
        icon:"🗺",
        label:"Mapa"
    },

    {
        id:"music",
        icon:"♫",
        label:"Música"
    },

    {
        id:"grimoire",
        icon:"✦",
        label:"Grimório"
    },

    {
        id:"dice",
        icon:"🎲",
        label:"Dados"
    },

    {
        id:"notes",
        icon:"📝",
        label:"Anotações"
    }

];


/*==========================================================
=                    CRIAR MENU
==========================================================*/

function createRoleMenu(){

    if(!tableMenu){

        return;

    }

    tableMenu.innerHTML = "";

    const items =
        currentTableRole === "master"
            ? masterMenuItems
            : playerMenuItems;

    items.forEach(item => {

        const button =
            document.createElement(
                "button"
            );

        button.type = "button";

        button.className =
            "table-menu-button";

        button.dataset.panel =
            item.id;

        button.innerHTML = `

            <span class="table-menu-icon">
                ${item.icon}
            </span>

            <span class="table-menu-label">
                ${item.label}
            </span>

        `;

        button.addEventListener(
            "click",
            () => handleMenuAction(
                item.id,
                button
            )
        );

        tableMenu.appendChild(
            button
        );

    });

}


/*==========================================================
=                    AÇÃO DO MENU
==========================================================*/

function handleMenuAction(
    action,
    button
){

    clearActiveMenuButtons();

    if(button){

        button.classList.add(
            "active"
        );

    }

    switch(action){

        case "initiative":

    openInitiativeControlPanel();

    break;


case "next-round":

    openNextRoundConfirmation();

    break;

        case "character":

            openCharacterPanel();

            break;


        case "attacks":

            openAttacksPanel();

            break;


        case "inventory":

            openInventoryPanel();

            break;


        case "conditions":

            openConditionsPanel();

            break;


        case "grimoire":

            openGrimoirePanel();

            break;


        case "dice":

            openDicePanel();

            break;


        case "notes":

            openNotesPanel();

            break;


        case "enemies":

            openEnemiesPanel();

            break;


        case "npcs":

            openNPCPanel();

            break;


        case "map":

            openMapPanel();

            break;


        case "music":

            openMusicPanel();

            break;

    }

}

/*==========================================================
=              PAINEL DE INICIATIVA
==========================================================*/

function openInitiativeControlPanel(){

    if(
        currentTableRole !== "master"
    ){

        return;

    }


    const combat =
        currentTableCampaign.combat;


    const pending =
        combat.initiativeRequest?.active ===
        true;


    const participants =
        Array.isArray(
            combat.turnOrder
        )
            ? combat.turnOrder
            : [];


    openTablePanel(
        "COMBATE",
        "Iniciativa",
        `

        <div class="table-panel-section">

            <div class="table-panel-card">

                <h3>
                    Estado atual
                </h3>

                <p>
                    Combate:
                    <strong>
                        ${
                            combat.active
                                ? "Ativo"
                                : "Inativo"
                        }
                    </strong>
                </p>

                <p>
                    Rodada:
                    <strong>
                        ${combat.round || 0}
                    </strong>
                </p>

                <p>
                    Solicitação:
                    <strong>
                        ${
                            pending
                                ? "Aguardando jogadores"
                                : "Nenhuma"
                        }
                    </strong>
                </p>

            </div>


            <button
                type="button"
                id="requestInitiativeButton"
                class="primary-button full-button">

                ${
                    pending
                        ? "Solicitar novamente"
                        : "Solicitar iniciativa"
                }

            </button>


            ${
                participants.length
                    ? `

                        <div class="table-panel-card">

                            <h3>
                                Ordem atual
                            </h3>

                            ${participants
                                .map(
                                    (participant,index) => `

                                        <p>

                                            ${index + 1}.
                                            ${escapeTableHTML(
                                                participant.name ||
                                                "Participante"
                                            )}

                                            ${
                                                participant.result !==
                                                undefined
                                                    ? `— ${participant.result}`
                                                    : ""
                                            }

                                        </p>

                                    `
                                )
                                .join("")}

                        </div>

                    `
                    : ""
            }


            ${
                combat.active
                    ? `

                        <button
                            type="button"
                            id="endCombatButton"
                            class="secondary-button full-button">

                            Encerrar combate

                        </button>

                    `
                    : ""
            }

        </div>

        `
    );


    document
        .getElementById(
            "requestInitiativeButton"
        )
        ?.addEventListener(
            "click",
            requestInitiativeRolls
        );


    document
        .getElementById(
            "endCombatButton"
        )
        ?.addEventListener(
            "click",
            endTableCombat
        );

}

/*==========================================================
=              SOLICITAR INICIATIVA
==========================================================*/

function requestInitiativeRolls(){

    if(
        currentTableRole !== "master"
    ){

        return;

    }


    const players =
        Array.isArray(
            currentTableCampaign.players
        )
            ? currentTableCampaign.players
            : [];


    const enemies =
        Array.isArray(
            currentTableCampaign.enemies
        )
            ? currentTableCampaign.enemies
            : [];


    const expectedParticipants = [];


    players.forEach(player => {

        if(!player.characterId){

            return;

        }


        expectedParticipants.push({

            type:"player",

            id:player.characterId,

            characterId:
                player.characterId,

            name:
                player.name ||
                "Jogador",

            position:
                Number(
                    player.position
                ) || null,

            rolled:false,

            result:null

        });

    });


    enemies.forEach(enemy => {

        expectedParticipants.push({

            type:"enemy",

            id:
                enemy.enemyId ||
                enemy.id,

            enemyId:
                enemy.enemyId ||
                enemy.id,

            name:
                enemy.name ||
                "Ameaça",

            position:
                Number(
                    enemy.position
                ) || null,

            rolled:false,

            result:null

        });

    });


    currentTableCampaign.combat.active =
        false;


    currentTableCampaign.combat.round =
        0;


    currentTableCampaign.combat.currentTurnIndex =
        0;


    currentTableCampaign.combat.turnOrder =
        [];


    currentTableCampaign.combat.initiativeRequest = {

        id:
            `initiative_${Date.now()}`,

        active:true,

        requestedAt:
            Date.now(),

        requestedBy:"master",

        participants:
            expectedParticipants

    };


    currentTableCampaign.combat.updatedAt =
        Date.now();


    saveTableCampaign();

    rollEnemyInitiatives();

    saveTableCampaign();


    addSystemChatMessage(
        "O mestre solicitou testes de iniciativa."
    );


    openInitiativeControlPanel();

}

/*==========================================================
=              CONFIRMAR NOVA RODADA
==========================================================*/

function openNextRoundConfirmation(){

    if(
        currentTableRole !== "master"
    ){

        return;

    }


    const combat =
        currentTableCampaign.combat;


    const nextRound =
        Math.max(
            1,
            Number(
                combat.round
            ) + 1
        );


    openTablePanel(
        "COMBATE",
        "Passar Rodada",
        `

        <div class="table-panel-section">

            <div class="table-panel-card">

                <h3>
                    Iniciar Rodada ${nextRound}
                </h3>

                <p>
                    Todos os jogadores e ameaças recuperarão o PA máximo.
                </p>

                <p>
                    O turno voltará ao primeiro participante da iniciativa.
                </p>

            </div>


            <button
                type="button"
                id="confirmNextRoundButton"
                class="primary-button full-button">

                Confirmar nova rodada

            </button>

        </div>

        `
    );


    document
        .getElementById(
            "confirmNextRoundButton"
        )
        ?.addEventListener(
            "click",
            passTableRound
        );

}

/*==========================================================
=              RESTAURAR PA DOS JOGADORES
==========================================================*/

function restorePlayersActionPoints(){

    const players =
        Array.isArray(
            currentTableCampaign.players
        )
            ? currentTableCampaign.players
            : [];


    players.forEach(player => {

        const characterId =
            player.characterId;


        if(!characterId){

            return;

        }


        const character =
            tableCharacters.find(
                item =>
                    item.id ===
                    characterId
            );


        if(!character){

            return;

        }


        if(
            !character.status ||
            typeof character.status !== "object"
        ){

            character.status = {};

        }


        const maximum =
            Math.max(
                0,
                Number(
                    character.status.paMax
                ) || 0
            );


        character.status.paAtual =
            maximum;

    });

}

/*==========================================================
=              RESTAURAR PA DAS AMEAÇAS
==========================================================*/

function restoreEnemiesActionPoints(){

    const enemies =
        Array.isArray(
            currentTableCampaign.enemies
        )
            ? currentTableCampaign.enemies
            : [];


    enemies.forEach(enemy => {

        /*
            Suporta ameaça com status.
        */

        if(
            enemy.status &&
            typeof enemy.status === "object"
        ){

            const maximum =
                Math.max(
                    0,
                    Number(
                        enemy.status.paMax
                    ) || 0
                );


            enemy.status.paAtual =
                maximum;


            return;

        }


        /*
            Suporta ameaça com PA diretamente.
        */

        const maximum =
            Math.max(
                0,
                Number(
                    enemy.paMax
                ) || 0
            );


        enemy.paAtual =
            maximum;

    });

}


/*==========================================================
=              LIMPAR BOTÃO ATIVO
==========================================================*/

function clearActiveMenuButtons(){

    document
        .querySelectorAll(
            ".table-menu-button"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });

}


/*==========================================================
=                    EVENTOS BASE
==========================================================*/

function bindTableEvents(){

    leaveTableButton?.addEventListener(
        "click",
        leaveTable
    );

    closeTablePanel?.addEventListener(
        "click",
        closeCurrentPanel
    );

    closePositionModal?.addEventListener(
        "click",
        closeCurrentPositionModal
    );

    closeDiceModal?.addEventListener(
        "click",
        () => {

            diceModal?.classList.add(
                "hidden"
            );

            clearActiveMenuButtons();

        }
    );

    tablePanelOverlay?.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                tablePanelOverlay
            ){

                closeCurrentPanel();

            }

        }
    );

    positionModal?.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                positionModal
            ){

                closeCurrentPositionModal();

            }

        }
    );

}


/*==========================================================
=                    SAIR DA MESA
==========================================================*/

function leaveTable(){

    localStorage.removeItem(
        TABLE_ROLE_STORAGE
    );

    localStorage.removeItem(
        TABLE_CHARACTER_CURRENT
    );

    window.location.href =
        "campanhas.html";

}


/*==========================================================
=                    PAINEL GENÉRICO
==========================================================*/

function openTablePanel(
    label,
    title,
    content
){

    if(
        !tablePanelOverlay ||
        !tablePanelContent
    ){

        return;

    }

    if(tablePanelLabel){

        tablePanelLabel.textContent =
            label;

    }

    if(tablePanelTitle){

        tablePanelTitle.textContent =
            title;

    }

    tablePanelContent.innerHTML =
        content;

    tablePanelOverlay
        .classList
        .remove("hidden");

}


/*==========================================================
=                    FECHAR PAINEL
==========================================================*/

function closeCurrentPanel(){

    tablePanelOverlay
        ?.classList
        .add("hidden");

    clearActiveMenuButtons();

}


/*==========================================================
=              FECHAR POSIÇÃO
==========================================================*/

function closeCurrentPositionModal(){

    positionModal
        ?.classList
        .add("hidden");

    selectedPosition = null;

}


/*==========================================================
=                    CENÁRIO
==========================================================*/

function loadScene(){

    if(!sceneBackground){

        return;

    }

    const scene =
        currentTableCampaign.scene ||
        currentTableCampaign.background ||
        "";

    if(!scene){

        return;

    }

    sceneBackground.innerHTML = "";

    const image =
        document.createElement("img");

    image.src = scene;

    image.alt =
        "Cenário da campanha";

    sceneBackground.appendChild(
        image
    );

}


/*==========================================================
=                    MÚSICA
==========================================================*/

function loadMusic(){

    if(
        !campaignMusicPlayer ||
        !currentTableCampaign.music
    ){

        return;

    }

    campaignMusicPlayer.src =
        currentTableCampaign.music;

    campaignMusicPlayer.volume =
        Number(
            currentTableCampaign.musicVolume
        ) || .5;

}

/*==========================================================
=                    MESA.JS - PARTE 2
==========================================================*/

/*==========================================================
=                    FICHA DO JOGADOR
==========================================================*/

function openCharacterPanel(){

    refreshCurrentTableCharacter();


    if(!currentTableCharacter){

        return;

    }

    const attrs =
        currentTableCharacter.attributes || {};


    const status =
        currentTableCharacter.status || {};

    const html = `

        <div class="table-panel-section">

            <h3 class="table-panel-section-title">
                ${escapeTableHTML(
                    currentTableCharacter.name ||
                    "Personagem"
                )}
            </h3>

            <div class="table-panel-card">

                <p>
                    Origem:
                    <strong>
                        ${
                            currentTableCharacter.origin
                                ? escapeTableHTML(
                                    currentTableCharacter.origin
                                )
                                : "—"
                        }
                    </strong>
                </p>

                <p>
                    Nível:
                    <strong>
                        ${Number(
                            currentTableCharacter.level
                        ) || 1}
                    </strong>
                </p>

            </div>

        </div>

        <div class="table-panel-section">

            <h3 class="table-panel-section-title">
                Recursos
            </h3>

            <div class="table-panel-list">

                <div class="table-panel-item">
                    <strong>PV</strong>
                    <span>
                        ${status.pvAtual ?? 0}
                        /
                        ${status.pvMax ?? 0}
                    </span>
                </div>

                <div class="table-panel-item">
                    <strong>PD</strong>
                    <span>
                        ${status.pdAtual ?? 0}
                        /
                        ${status.pdMax ?? 0}
                    </span>
                </div>

                <div class="table-panel-item">
                    <strong>PA</strong>
                    <span>
                        ${status.paAtual ?? 0}
                        /
                        ${status.paMax ?? 0}
                    </span>
                </div>

            </div>

        </div>

        <div class="table-panel-section">

            <h3 class="table-panel-section-title">
                Atributos
            </h3>

            <div class="table-panel-list">

                <div class="table-panel-item">
                    <strong>FOR</strong>
                    <span>${attrs.for ?? 1}</span>
                </div>

                <div class="table-panel-item">
                    <strong>AGI</strong>
                    <span>${attrs.agi ?? 1}</span>
                </div>

                <div class="table-panel-item">
                    <strong>INT</strong>
                    <span>${attrs.int ?? 1}</span>
                </div>

                <div class="table-panel-item">
                    <strong>VIG</strong>
                    <span>${attrs.vig ?? 1}</span>
                </div>

                <div class="table-panel-item">
                    <strong>PRE</strong>
                    <span>${attrs.pre ?? 1}</span>
                </div>

            </div>

        </div>

    `;

    openTablePanel(
        "PERSONAGEM",
        "Ficha",
        html
    );

    bindTableCharacterSkillButtons();

}

function bindTableCharacterSkillButtons(){

    document
        .querySelectorAll(
            ".table-skill-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    refreshCurrentTableCharacter();


                    rollTableCharacterSkill(
                        currentTableCharacter,
                        button.dataset.skill
                    );

                }
            );

        });

}


/*==========================================================
=                    ATAQUES
==========================================================*/

function openAttacksPanel(){

        refreshCurrentTableCharacter();

    if(!currentTableCharacter){

        return;

    }

    const attacks =
        Array.isArray(
            currentTableCharacter.attacks
        )
            ? currentTableCharacter.attacks
            : [];

    if(attacks.length === 0){

        openTablePanel(
            "COMBATE",
            "Ataques",
            `

            <div class="editor-empty-state">

                <span>⚔</span>

                <p>
                    Nenhum ataque rápido configurado.
                </p>

            </div>

            `
        );

        return;

    }

    const html = attacks
        .slice(0,4)
        .map(
            (attack,index) => `

                <div class="table-panel-card">

                    <h3>
                        ${index + 1}.
                        ${escapeTableHTML(
                            attack.name ||
                            "Ataque"
                        )}
                    </h3>

                    <p>
                        Ataque:
                        ${escapeTableHTML(
                            attack.roll ||
                            "—"
                        )}
                    </p>

                    <p>
                        Dano:
                        ${escapeTableHTML(
                            attack.damage ||
                            "—"
                        )}
                    </p>

                    <div
                        style="
                            display:grid;
                            grid-template-columns:1fr 1fr;
                            gap:8px;
                            margin-top:12px;
                        "
                    >

                        <button
                            type="button"
                            class="primary-button"
                            onclick="rollQuickAttack(${index}, 'attack')">

                            Ataque

                        </button>

                        <button
                            type="button"
                            class="secondary-button"
                            onclick="rollQuickAttack(${index}, 'damage')">

                            Dano

                        </button>

                    </div>

                </div>

            `
        )
        .join("");

    openTablePanel(
        "COMBATE",
        "Ataques",
        `

        <div class="table-panel-list">
            ${html}
        </div>

        `
    );

}


/*==========================================================
=                    INVENTÁRIO
==========================================================*/

function openInventoryPanel(){

    refreshCurrentTableCharacter();

    if(!currentTableCharacter){

        return;

    }

    const inventory =
        Array.isArray(
            currentTableCharacter.inventory
        )
            ? currentTableCharacter.inventory
            : [];

    if(inventory.length === 0){

        openTablePanel(
            "PERSONAGEM",
            "Inventário",
            `

            <div class="editor-empty-state">

                <span>🎒</span>

                <p>
                    O inventário está vazio.
                </p>

            </div>

            `
        );

        return;

    }

    const html = inventory
        .map(item => `

            <div class="table-panel-card">

                <h3>
                    ${escapeTableHTML(
                        item.name ||
                        "Item"
                    )}
                </h3>

                ${
                    item.category
                        ? `
                            <p>
                                ${escapeTableHTML(
                                    item.category
                                )}
                            </p>
                        `
                        : ""
                }

                ${
                    item.description
                        ? `
                            <p>
                                ${escapeTableHTML(
                                    item.description
                                )}
                            </p>
                        `
                        : ""
                }

            </div>

        `)
        .join("");

    openTablePanel(
        "PERSONAGEM",
        "Inventário",
        `

        <div class="table-panel-list">
            ${html}
        </div>

        `
    );

}


/*==========================================================
=                    CONDIÇÕES
==========================================================*/

function openConditionsPanel(){

    refreshCurrentTableCharacter();


    if(!currentTableCharacter){

        return;

    }

    const conditions =
        Array.isArray(
            currentTableCharacter.conditions
        )
            ? currentTableCharacter.conditions
            : [];

    if(conditions.length === 0){

        openTablePanel(
            "ESTADO",
            "Condições",
            `

            <div class="editor-empty-state">

                <span>◈</span>

                <p>
                    Nenhuma condição ativa.
                </p>

            </div>

            `
        );

        return;

    }

    const html =
        conditions
            .map(condition => {

                const name =
                    typeof condition === "string"
                        ? condition
                        : condition.name;

                return `

                    <div class="table-panel-card">

                        <h3>
                            ${escapeTableHTML(
                                name || "Condição"
                            )}
                        </h3>

                        ${
                            typeof condition === "object" &&
                            condition.description
                                ? `
                                    <p>
                                        ${escapeTableHTML(
                                            condition.description
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                `;

            })
            .join("");

    openTablePanel(
        "ESTADO",
        "Condições",
        `

        <div class="table-panel-list">
            ${html}
        </div>

        `
    );

}


/*==========================================================
=                    GRIMÓRIO
==========================================================*/

function openGrimoirePanel(){

     refreshCurrentTableCharacter();


    let grimoire = [];

    if(
        currentTableRole === "player" &&
        currentTableCharacter
    ){

        grimoire =
            Array.isArray(
                currentTableCharacter.grimoire
            )
                ? currentTableCharacter.grimoire
                : [];

    }

    if(grimoire.length === 0){

        openTablePanel(
            "PARANORMAL",
            "Grimório",
            `

            <div class="editor-empty-state">

                <span>✦</span>

                <p>
                    Nenhum ritual disponível.
                </p>

            </div>

            `
        );

        return;

    }

    const html =
        grimoire
            .map(ritual => `

                <div class="table-panel-card">

                    <h3>
                        ${escapeTableHTML(
                            ritual.name ||
                            "Ritual"
                        )}
                    </h3>

                    ${
                        ritual.element
                            ? `
                                <p>
                                    Elemento:
                                    ${escapeTableHTML(
                                        ritual.element
                                    )}
                                </p>
                            `
                            : ""
                    }

                    ${
                        ritual.description
                            ? `
                                <p>
                                    ${escapeTableHTML(
                                        ritual.description
                                    )}
                                </p>
                            `
                            : ""
                    }

                </div>

            `)
            .join("");

    openTablePanel(
        "PARANORMAL",
        "Grimório",
        `

        <div class="table-panel-list">
            ${html}
        </div>

        `
    );

}


/*==========================================================
=                    DADOS
==========================================================*/

function openDicePanel(){

    diceModal
        ?.classList
        .remove("hidden");

}


/*==========================================================
=                    ANOTAÇÕES
==========================================================*/

function openNotesPanel(){

    const storageKey =
        currentTableRole === "master"
            ? `ordem_notes_master_${currentTableCampaign.id}`
            : `ordem_notes_${currentTableCampaign.id}_${currentTableCharacter?.id || "player"}`;

    const savedNotes =
        localStorage.getItem(
            storageKey
        ) || "";

    openTablePanel(
        "SESSÃO",
        "Anotações",
        `

        <div class="table-panel-section">

            <textarea
                id="tableNotesTextarea"
                placeholder="Escreva suas anotações..."
                style="
                    min-height:420px;
                    resize:vertical;
                "
            >${escapeTableHTML(savedNotes)}</textarea>

            <button
                type="button"
                id="saveTableNotes"
                class="primary-button">

                Salvar Anotações

            </button>

        </div>

        `
    );

    document
        .getElementById(
            "saveTableNotes"
        )
        ?.addEventListener(
            "click",
            () => {

                const text =
                    document
                        .getElementById(
                            "tableNotesTextarea"
                        )
                        ?.value || "";

                localStorage.setItem(
                    storageKey,
                    text
                );

            }
        );

}


/*==========================================================
=              ROLAR ATAQUE RÁPIDO
==========================================================*/
function rollQuickAttack(
    index,
    type
){

    refreshCurrentTableCharacter();


    if(!currentTableCharacter){

        return;

    }


    const attack =
        currentTableCharacter
            .attacks?.[index];


    if(!attack){

        return;

    }


    let formula =
        type === "damage"
            ? attack.damage
            : attack.roll;


    if(!formula){

        return;

    }


    /*
        Substitui FOR, AGI, INT,
        VIG e PRE pelos valores atuais.
    */

    formula =
        resolveCharacterFormula(
            formula,
            currentTableCharacter
        );


    const result =
        rollDiceExpression(
            formula
        );


    if(!result){

        addSystemChatMessage(
            `Não foi possível interpretar: ${formula}`
        );

        return;

    }


    const detail =
        result.details
            .map(part => {

                if(
                    part.type === "dice"
                ){

                    return `${part.formula} [${part.rolls.join(", ")}]`;

                }


                return String(
                    part.value
                );

            })
            .join(" + ");


    addRollChatMessage(

        type === "damage"
            ? `Dano • ${attack.name || "Ataque"}`
            : `Ataque • ${attack.name || "Ataque"}`,

        formula,

        result.total,

        detail

    );

}


/*==========================================================
=              ROLAR FÓRMULA SIMPLES
==========================================================*/

function rollFormulaToChat(
    formula,
    label
){

    const result =
        parseSimpleDiceFormula(
            formula
        );

    if(!result){

        addSystemChatMessage(
            `Não foi possível interpretar: ${formula}`
        );

        return;

    }

    addRollChatMessage(
        label,
        formula,
        result.total,
        result.detail
    );

}


/*==========================================================
=              INTERPRETAR DADOS
==========================================================*/

function parseSimpleDiceFormula(formula){

    const clean =
        String(formula)
            .replace(/\s+/g,"")
            .toLowerCase();

    const match =
        clean.match(
            /^(\d*)d(\d+)([+-]\d+)?$/
        );

    if(!match){

        return null;

    }

    const amount =
        Number(match[1]) || 1;

    const sides =
        Number(match[2]);

    const modifier =
        Number(match[3]) || 0;

    if(
        amount < 1 ||
        sides < 2 ||
        amount > 100
    ){

        return null;

    }

    const rolls = [];

    let sum = 0;

    for(
        let i=0;
        i<amount;
        i++
    ){

        const roll =
            Math.floor(
                Math.random() * sides
            ) + 1;

        rolls.push(roll);

        sum += roll;

    }

    return {

        total:
            sum + modifier,

        detail:
            `[${rolls.join(", ")}]${
                modifier
                    ? ` ${modifier >= 0 ? "+" : ""}${modifier}`
                    : ""
            }`

    };

}


/*==========================================================
=              PROTEÇÃO HTML
==========================================================*/

function escapeTableHTML(value){

    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}

/*==========================================================
=                    MESA.JS - PARTE 3
==========================================================*/

/*==========================================================
=                    AMEAÇAS
==========================================================*/

function openEnemiesPanel(){

    if(currentTableRole !== "master"){

        return;

    }

    let enemies = [];

    try{

        enemies =
            JSON.parse(
                localStorage.getItem(
                    "ordem_enemies"
                )
            ) || [];

    }
    catch{

        enemies = [];

    }

    if(!Array.isArray(enemies)){

        enemies = [];

    }

    if(enemies.length === 0){

        openTablePanel(
            "CONTROLE",
            "Ameaças",
            `

            <div class="editor-empty-state">

                <span>☠</span>

                <p>
                    Nenhuma ameaça criada.
                </p>

            </div>

            `
        );

        return;

    }

    const html =
        enemies
            .map(enemy => `

                <div class="table-panel-card">

                    <h3>
                        ${escapeTableHTML(
                            enemy.name ||
                            "Ameaça"
                        )}
                    </h3>

                    ${
                        enemy.element
                            ? `
                                <p>
                                    Elemento:
                                    ${escapeTableHTML(
                                        enemy.element
                                    )}
                                </p>
                            `
                            : ""
                    }

                    ${
                        enemy.level
                            ? `
                                <p>
                                    Nível:
                                    ${escapeTableHTML(
                                        enemy.level
                                    )}
                                </p>
                            `
                            : ""
                    }

                    <button
                        type="button"
                        class="primary-button enemy-place-button"
                        data-enemy-id="${escapeTableHTML(
                            enemy.id
                        )}"
                        style="margin-top:12px;width:100%;">

                        Colocar no Cenário

                    </button>

                </div>

            `)
            .join("");

    openTablePanel(
        "CONTROLE",
        "Ameaças",
        `

        <div class="table-panel-list">
            ${html}
        </div>

        `
    );

    document
        .querySelectorAll(
            ".enemy-place-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    startEnemyPlacement(
                        button.dataset.enemyId
                    );

                }
            );

        });

}


/*==========================================================
=              INICIAR POSICIONAMENTO AMEAÇA
==========================================================*/

function startEnemyPlacement(enemyId){

    let enemies = [];

    try{

        enemies =
            JSON.parse(
                localStorage.getItem(
                    "ordem_enemies"
                )
            ) || [];

    }
    catch{

        enemies = [];

    }

    const enemy =
        enemies.find(
            item => item.id === enemyId
        );

    if(!enemy){

        return;

    }

    closeCurrentPanel();

    openPositionSelector(
        "enemy",
        enemy
    );

}


/*==========================================================
=                    NPCs
==========================================================*/

function openNPCPanel(){

    if(currentTableRole !== "master"){

        return;

    }

    let npcs =
        Array.isArray(
            currentTableCampaign.npcs
        )
            ? currentTableCampaign.npcs
            : [];

    if(npcs.length === 0){

        openTablePanel(
            "CONTROLE",
            "NPCs",
            `

            <div class="editor-empty-state">

                <span>♟</span>

                <p>
                    Nenhum NPC disponível nesta campanha.
                </p>

            </div>

            `
        );

        return;

    }

    const html =
        npcs
            .map(npc => `

                <div class="table-panel-card">

                    <h3>
                        ${escapeTableHTML(
                            npc.name ||
                            "NPC"
                        )}
                    </h3>

                    ${
                        npc.description
                            ? `
                                <p>
                                    ${escapeTableHTML(
                                        npc.description
                                    )}
                                </p>
                            `
                            : ""
                    }

                    <button
                        type="button"
                        class="primary-button npc-place-button"
                        data-npc-id="${escapeTableHTML(
                            npc.id
                        )}"
                        style="margin-top:12px;width:100%;">

                        Colocar no Cenário

                    </button>

                </div>

            `)
            .join("");

    openTablePanel(
        "CONTROLE",
        "NPCs",
        `

        <div class="table-panel-list">
            ${html}
        </div>

        `
    );

    document
        .querySelectorAll(
            ".npc-place-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const npc =
                        npcs.find(
                            item =>
                                item.id ===
                                button.dataset.npcId
                        );

                    if(!npc){

                        return;

                    }

                    closeCurrentPanel();

                    openPositionSelector(
                        "npc",
                        npc
                    );

                }
            );

        });

}


/*==========================================================
=                    MAPA
==========================================================*/

function openMapPanel(){

    if(currentTableRole !== "master"){

        return;

    }

    openTablePanel(
        "CENÁRIO",
        "Mapa",
        `

        <div class="table-panel-section">

            <h3 class="table-panel-section-title">
                Cenário Atual
            </h3>

            <div class="table-panel-card">

                <p>
                    Troque a imagem exibida no centro da mesa.
                </p>

                <button
                    type="button"
                    id="uploadSceneButton"
                    class="primary-button"
                    style="width:100%;margin-top:12px;">

                    Selecionar Cenário

                </button>

                <button
                    type="button"
                    id="removeSceneButton"
                    class="secondary-button"
                    style="width:100%;margin-top:10px;">

                    Remover Cenário

                </button>

            </div>

        </div>

        `
    );

    document
        .getElementById(
            "uploadSceneButton"
        )
        ?.addEventListener(
            "click",
            () => {

                sceneUploadInput?.click();

            }
        );

    document
        .getElementById(
            "removeSceneButton"
        )
        ?.addEventListener(
            "click",
            removeScene
        );

}


/*==========================================================
=              UPLOAD DO CENÁRIO
==========================================================*/

sceneUploadInput?.addEventListener(
    "change",
    async () => {

        const file =
            sceneUploadInput.files?.[0];

        if(!file){

            return;

        }

        const image =
            await tableFileToBase64(
                file
            );

        currentTableCampaign.scene =
            image;

        saveTableCampaign();

        loadScene();

        closeCurrentPanel();

        addSystemChatMessage(
            "O mestre alterou o cenário."
        );

        sceneUploadInput.value = "";

    }
);


/*==========================================================
=              REMOVER CENÁRIO
==========================================================*/

function removeScene(){

    currentTableCampaign.scene = "";

    saveTableCampaign();

    if(sceneBackground){

        sceneBackground.innerHTML = `

            <div class="scene-placeholder">

                <span>✦</span>

                <strong>
                    Nenhum cenário definido
                </strong>

                <small>
                    O mestre pode adicionar um mapa ou imagem de cenário.
                </small>

            </div>

        `;

    }

    closeCurrentPanel();

    addSystemChatMessage(
        "O cenário foi removido."
    );

}


/*==========================================================
=                    MÚSICA
==========================================================*/

function openMusicPanel(){

    if(currentTableRole !== "master"){

        return;

    }

    const volume =
        Number(
            currentTableCampaign.musicVolume
        );

    const safeVolume =
        Number.isFinite(volume)
            ? volume
            : .5;

    openTablePanel(
        "ÁUDIO",
        "Música",
        `

        <div class="table-panel-section">

            <div class="table-panel-card">

                <h3>
                    Música da Campanha
                </h3>

                <p>
                    Escolha um arquivo de áudio para tocar durante a sessão.
                </p>

                <button
                    type="button"
                    id="uploadMusicButton"
                    class="primary-button"
                    style="width:100%;margin-top:12px;">

                    Selecionar Música

                </button>

            </div>

            <div class="table-panel-card">

                <h3>
                    Volume
                </h3>

                <input
                    type="range"
                    id="tableMusicVolume"
                    min="0"
                    max="100"
                    value="${Math.round(
                        safeVolume * 100
                    )}">

            </div>

            <div
                style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:10px;
                "
            >

                <button
                    type="button"
                    id="playTableMusic"
                    class="primary-button">

                    ▶ Tocar

                </button>

                <button
                    type="button"
                    id="pauseTableMusic"
                    class="secondary-button">

                    ⏸ Pausar

                </button>

            </div>

            <button
                type="button"
                id="removeTableMusic"
                class="secondary-button"
                style="width:100%;">

                Remover Música

            </button>

        </div>

        `
    );

    document
        .getElementById(
            "uploadMusicButton"
        )
        ?.addEventListener(
            "click",
            () => {

                musicUploadInput?.click();

            }
        );

    document
        .getElementById(
            "playTableMusic"
        )
        ?.addEventListener(
            "click",
            playTableMusic
        );

    document
        .getElementById(
            "pauseTableMusic"
        )
        ?.addEventListener(
            "click",
            pauseTableMusic
        );

    document
        .getElementById(
            "removeTableMusic"
        )
        ?.addEventListener(
            "click",
            removeTableMusic
        );

    document
        .getElementById(
            "tableMusicVolume"
        )
        ?.addEventListener(
            "input",
            event => {

                const value =
                    Number(
                        event.target.value
                    ) / 100;

                currentTableCampaign.musicVolume =
                    value;

                if(campaignMusicPlayer){

                    campaignMusicPlayer.volume =
                        value;

                }

                saveTableCampaign();

            }
        );

}


/*==========================================================
=              UPLOAD DE MÚSICA
==========================================================*/

musicUploadInput?.addEventListener(
    "change",
    async () => {

        const file =
            musicUploadInput.files?.[0];

        if(!file){

            return;

        }

        const audio =
            await tableFileToBase64(
                file
            );

        currentTableCampaign.music =
            audio;

        if(
            currentTableCampaign.musicVolume ===
            undefined
        ){

            currentTableCampaign.musicVolume =
                .5;

        }

        saveTableCampaign();

        loadMusic();

        addSystemChatMessage(
            "O mestre alterou a música da campanha."
        );

        musicUploadInput.value = "";

    }
);


/*==========================================================
=              TOCAR MÚSICA
==========================================================*/

async function playTableMusic(){

    if(
        !campaignMusicPlayer ||
        !currentTableCampaign.music
    ){

        addSystemChatMessage(
            "Nenhuma música foi selecionada."
        );

        return;

    }

    try{

        await campaignMusicPlayer.play();

        currentTableCampaign.musicPlaying =
            true;

        saveTableCampaign();

    }
    catch(error){

        console.error(
            "Não foi possível iniciar o áudio:",
            error
        );

    }

}


/*==========================================================
=              PAUSAR MÚSICA
==========================================================*/

function pauseTableMusic(){

    campaignMusicPlayer?.pause();

    currentTableCampaign.musicPlaying =
        false;

    saveTableCampaign();

}


/*==========================================================
=              REMOVER MÚSICA
==========================================================*/

function removeTableMusic(){

    currentTableCampaign.music = "";

    currentTableCampaign.musicPlaying =
        false;

    saveTableCampaign();

    if(campaignMusicPlayer){

        campaignMusicPlayer.pause();

        campaignMusicPlayer.removeAttribute(
            "src"
        );

        campaignMusicPlayer.load();

    }

    closeCurrentPanel();

    addSystemChatMessage(
        "A música da campanha foi removida."
    );

}


/*==========================================================
=              SELETOR DE POSIÇÃO
==========================================================*/

function openPositionSelector(
    type,
    entity
){

    if(!positionModal){

        return;

    }

    selectedPosition = {

        type,

        entity

    };

    if(positionModalTitle){

        positionModalTitle.textContent =
            type === "enemy"
                ? "Posicionar Ameaça"
                : "Posicionar NPC";

    }

    let positions = [];

    if(type === "enemy"){

        positions = [1,2,3,4,5,6];

    }
    else{

        positions = [1,2,3];

    }

    const buttons =
        positions
            .map(position => `

                <button
                    type="button"
                    class="position-select-button"
                    data-position="${position}">

                    Posição ${position}

                </button>

            `)
            .join("");

    positionModalBody.innerHTML = `

        <div class="table-panel-card">

            <h3>
                ${escapeTableHTML(
                    entity.name ||
                    "Entidade"
                )}
            </h3>

            <p>
                Escolha a posição que será ocupada.
            </p>

        </div>

        <div
            style="
                display:grid;
                grid-template-columns:repeat(2,1fr);
                gap:10px;
            "
        >

            ${buttons}

        </div>

    `;

    positionModal
        .classList
        .remove("hidden");

    document
        .querySelectorAll(
            ".position-select-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    placeEntityAtPosition(
                        type,
                        entity,
                        Number(
                            button.dataset.position
                        )
                    );

                }
            );

        });

}


/*==========================================================
=              COLOCAR ENTIDADE NA POSIÇÃO
==========================================================*/

function placeEntityAtPosition(
    type,
    entity,
    position
){

    if(type === "enemy"){

        if(
            !Array.isArray(
                currentTableCampaign.enemies
            )
        ){

            currentTableCampaign.enemies = [];

        }

        currentTableCampaign.enemies =
            currentTableCampaign.enemies
                .filter(
                    item =>
                        item.position !== position &&
                        item.enemyId !== entity.id
                );

        currentTableCampaign.enemies.push({

            enemyId:
                entity.id,

            name:
                entity.name || "Ameaça",

            photo:
                entity.photo ||
                entity.image ||
                "",

            position

        });

    }
    else{

        if(
            !Array.isArray(
                currentTableCampaign.npcs
            )
        ){

            currentTableCampaign.npcs = [];

        }

        const existing =
            currentTableCampaign.npcs.find(
                npc =>
                    npc.id === entity.id
            );

        currentTableCampaign.npcs =
            currentTableCampaign.npcs
                .filter(
                    npc =>
                        npc.position !== position &&
                        npc.id !== entity.id
                );

        currentTableCampaign.npcs.push({

            ...entity,

            position

        });

        if(existing){

            currentTableCampaign.npcs[
                currentTableCampaign.npcs.length - 1
            ] = {

                ...existing,

                ...entity,

                position

            };

        }

    }

    saveTableCampaign();

    closeCurrentPositionModal();

    renderCombatPositions();

    addSystemChatMessage(
        `${entity.name || "Entidade"} foi colocado na posição ${position}.`
    );

}


/*==========================================================
=              SALVAR CAMPANHA
==========================================================*/

function saveTableCampaign(){

    const index =
        tableCampaigns.findIndex(
            campaign =>
                campaign.id ===
                currentTableCampaign.id
        );

    if(index === -1){

        return;

    }

    currentTableCampaign.updatedAt =
        Date.now();

    tableCampaigns[index] =
        currentTableCampaign;

    localStorage.setItem(
        TABLE_CAMPAIGN_STORAGE,
        JSON.stringify(
            tableCampaigns
        )
    );

}


/*==========================================================
=              ARQUIVO -> BASE64
==========================================================*/

function tableFileToBase64(file){

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
=                    MESA.JS - PARTE 4
==========================================================*/

/*==========================================================
=              PARTICIPANTE DO TURNO ATUAL
==========================================================*/

function getCurrentTurnParticipant(){

    const combat =
        currentTableCampaign
            ?.combat;


    if(
        !combat ||
        combat.active !== true ||
        !Array.isArray(
            combat.turnOrder
        ) ||
        combat.turnOrder.length === 0
    ){

        return null;

    }


    const index =
        Math.max(
            0,
            Number(
                combat.currentTurnIndex
            ) || 0
        );


    return (
        combat.turnOrder[index] ||
        null
    );

}


/*==========================================================
=              VERIFICAR TOKEN DO TURNO
==========================================================*/

function isEntityCurrentTurn(
    entity,
    type
){

    if(!entity){

        return false;

    }


    const participant =
        getCurrentTurnParticipant();


    if(!participant){

        return false;

    }


    if(type === "player"){

        return (
            participant.type === "player" &&
            participant.characterId ===
            entity.characterId
        );

    }


    if(type === "enemy"){

        const enemyId =
            entity.enemyId ||
            entity.id;


        return (
            participant.type === "enemy" &&
            (
                participant.enemyId ===
                enemyId ||
                participant.id ===
                enemyId
            )
        );

    }


    return false;

}


/*==========================================================
=              PODE PASSAR O TURNO
==========================================================*/

function canPassCurrentTurn(){

    const participant =
        getCurrentTurnParticipant();


    if(!participant){

        return false;

    }


    if(
        currentTableRole === "master"
    ){

        return true;

    }


    return (
        currentTableRole === "player" &&
        participant.type === "player" &&
        participant.characterId ===
        currentTableCharacter?.id
    );

}

/*==========================================================
=              PASSAR TURNO
==========================================================*/

function passCurrentCombatTurn(){

    refreshCurrentTableCampaign();


    const combat =
        currentTableCampaign
            ?.combat;


    if(
        !combat ||
        combat.active !== true ||
        !Array.isArray(
            combat.turnOrder
        ) ||
        combat.turnOrder.length === 0
    ){

        return;

    }


    if(!canPassCurrentTurn()){

        addSystemChatMessage(
            "Você não pode passar este turno."
        );

        return;

    }


    const currentParticipant =
        getCurrentTurnParticipant();


    const nextIndex =
        Number(
            combat.currentTurnIndex
        ) + 1;


    /*
        Chegou ao final da ordem.
        O mestre precisa passar a rodada.
    */

    if(
        nextIndex >=
        combat.turnOrder.length
    ){

        combat.currentTurnIndex =
            combat.turnOrder.length - 1;


        combat.waitingNextRound =
            true;


        combat.updatedAt =
            Date.now();


        saveTableCampaign();


        renderCombatPositions();


        addSystemChatMessage(
            "Todos os participantes agiram. O mestre deve passar a rodada."
        );


        return;

    }


    combat.currentTurnIndex =
        nextIndex;


    combat.waitingNextRound =
        false;


    combat.updatedAt =
        Date.now();


    saveTableCampaign();


    renderCombatPositions();


    const nextParticipant =
        getCurrentTurnParticipant();


    addSystemChatMessage(
        `${currentParticipant?.name || "Participante"} passou o turno. Agora é a vez de ${nextParticipant?.name || "outro participante"}.`
    );

}

/*==========================================================
=              RENDERIZAR POSIÇÕES
==========================================================*/

function renderCombatPositions(){

    renderPlayerPositions();

    renderEnemyPositions();

    renderNPCPositions();

}


/*==========================================================
=              JOGADORES
==========================================================*/

function renderPlayerPositions(){

    const playerSlots =
        document.querySelectorAll(
            ".player-position"
        );

    playerSlots.forEach(slot => {

        const position =
            Number(
                slot.dataset.position
            );

        const tokenSlot =
            slot.querySelector(
                ".position-token-slot"
            );

        if(!tokenSlot){

            return;

        }

        const player =
            Array.isArray(
                currentTableCampaign.players
            )
                ? currentTableCampaign.players.find(
                    item =>
                        Number(item.position) ===
                        position
                )
                : null;

        renderPositionSlot(
            slot,
            tokenSlot,
            player,
            "player",
            position
        );

    });

}


/*==========================================================
=              AMEAÇAS
==========================================================*/

function renderEnemyPositions(){

    const enemySlots =
        document.querySelectorAll(
            ".enemy-position"
        );

    enemySlots.forEach(slot => {

        const position =
            Number(
                slot.dataset.position
            );

        const tokenSlot =
            slot.querySelector(
                ".position-token-slot"
            );

        if(!tokenSlot){

            return;

        }

        const enemy =
            Array.isArray(
                currentTableCampaign.enemies
            )
                ? currentTableCampaign.enemies.find(
                    item =>
                        Number(item.position) ===
                        position
                )
                : null;

        renderPositionSlot(
            slot,
            tokenSlot,
            enemy,
            "enemy",
            position
        );

    });

}


/*==========================================================
=              NPCs
==========================================================*/

function renderNPCPositions(){

    const npcSlots =
        document.querySelectorAll(
            ".npc-position"
        );

    npcSlots.forEach(slot => {

        const position =
            Number(
                slot.dataset.npcPosition
            );

        const tokenSlot =
            slot.querySelector(
                ".position-token-slot"
            );

        if(!tokenSlot){

            return;

        }

        const npc =
            Array.isArray(
                currentTableCampaign.npcs
            )
                ? currentTableCampaign.npcs.find(
                    item =>
                        Number(item.position) ===
                        position
                )
                : null;

        renderPositionSlot(
            slot,
            tokenSlot,
            npc,
            "npc",
            position
        );

    });

}


/*==========================================================
=              RENDERIZAR SLOT
==========================================================*/

function renderPositionSlot(
    container,
    tokenSlot,
    entity,
    type,
    position
){

    tokenSlot.innerHTML = "";

    container
    .querySelectorAll(
        ".combat-turn-indicator, .combat-pass-turn-button"
    )
    .forEach(element => element.remove());

    container.classList.toggle(
        "occupied",
        Boolean(entity)
    );

    const currentTurn =
    isEntityCurrentTurn(
        entity,
        type
    );


container.classList.toggle(
    "current-turn",
    currentTurn
);

    if(entity){

        const token =
            document.createElement("div");

        token.className =
            "combat-token";

        let photo = "";

        if(currentTurn){

    token.classList.add(
        "current-turn"
    );

}


if(
    type === "player" &&
    entity.characterId
){

    const character =
        getLiveCharacter(
            entity.characterId
        );


    if(character){

        photo =
            getCharacterCurrentPhoto(
                character
            );

    }

}
else{

    photo =
        entity.photo ||
        entity.image ||
        "";

}

        if(photo){

            const image =
                document.createElement("img");

            image.src = photo;

            image.alt =
                entity.name || "Token";

            token.appendChild(image);

        }
        else{

            const fallback =
                document.createElement("div");

            fallback.className =
                "combat-token-fallback";

            fallback.textContent =
                type === "enemy"
                    ? "☠"
                    : type === "npc"
                        ? "♟"
                        : "👤";

            token.appendChild(
                fallback
            );

        }

        const name =
            document.createElement("span");

        name.className =
            "combat-token-name";

        name.textContent =
            entity.name ||
            "Sem nome";

        token.appendChild(name);

 



        tokenSlot.appendChild(
            token
        );

        if(currentTurn){

    const turnIndicator =
        document.createElement(
            "span"
        );

    turnIndicator.className =
        "combat-turn-indicator";

    const isOwnTurn =
        type === "player" &&
        entity.characterId ===
        currentTableCharacter?.id;

    turnIndicator.textContent =
        isOwnTurn
            ? "SUA VEZ"
            : "TURNO";

    container.appendChild(
        turnIndicator
    );


    if(canPassCurrentTurn()){

        const passButton =
            document.createElement(
                "button"
            );

        passButton.type =
            "button";

        passButton.className =
            "combat-pass-turn-button";

        passButton.textContent =
            "Passar";

        passButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                passCurrentCombatTurn();

            }
        );

        container.appendChild(
            passButton
        );

    }

}

        tokenSlot.onclick = () => {

            openOccupiedPosition(
                type,
                entity,
                position
            );

        };

        return;

    }

    const marker =
        document.createElement("span");

    marker.className =
        "empty-position-marker";

    marker.textContent = "○";

    tokenSlot.appendChild(
        marker
    );

    tokenSlot.onclick = () => {

        handleEmptyPosition(
            type,
            position
        );

    };

}


/*==========================================================
=              POSIÇÃO VAZIA
==========================================================*/

function handleEmptyPosition(
    type,
    position
){

    if(type === "player"){

        if(currentTableRole === "player"){

            placeCurrentPlayer(
                position
            );

            return;

        }

        if(currentTableRole === "master"){

            openPlayerPlacementPanel(
                position
            );

        }

        return;

    }

    if(currentTableRole !== "master"){

        return;

    }

    if(type === "enemy"){

        openEnemiesForPosition(
            position
        );

        return;

    }

    if(type === "npc"){

        openNPCsForPosition(
            position
        );

    }

}


/*==========================================================
=              JOGADOR ENTRA NA POSIÇÃO
==========================================================*/

function placeCurrentPlayer(position){

    if(
        !currentTableCharacter ||
        !Array.isArray(
            currentTableCampaign.players
        )
    ){

        return;

    }

    const occupied =
        currentTableCampaign.players.some(
            player =>
                Number(player.position) ===
                position &&
                player.characterId !==
                currentTableCharacter.id
        );

    if(occupied){

        addSystemChatMessage(
            `A posição ${position} já está ocupada.`
        );

        return;

    }

    const player =
        currentTableCampaign.players.find(
            item =>
                item.characterId ===
                currentTableCharacter.id
        );

    if(!player){

        return;

    }

    player.position =
        position;

    player.name =
        currentTableCharacter.name;

    player.photo =
        currentTableCharacter.photo || "";

    saveTableCampaign();

    renderCombatPositions();

    addSystemChatMessage(
        `${currentTableCharacter.name} moveu para a posição ${position}.`
    );

}


/*==========================================================
=              MESTRE ESCOLHE JOGADOR
==========================================================*/

function openPlayerPlacementPanel(position){

    const players =
        Array.isArray(
            currentTableCampaign.players
        )
            ? currentTableCampaign.players
            : [];

    if(players.length === 0){

        openTablePanel(
            "POSIÇÃO",
            `Posição ${position}`,
            `

            <div class="editor-empty-state">

                <span>👤</span>

                <p>
                    Nenhum jogador está vinculado à campanha.
                </p>

            </div>

            `
        );

        return;

    }

    const html =
        players
            .map(player => `

                <button
                    type="button"
                    class="table-panel-card player-position-choice"
                    data-character-id="${escapeTableHTML(
                        player.characterId
                    )}"
                    style="
                        width:100%;
                        text-align:left;
                        cursor:pointer;
                    "
                >

                    <h3>
                        ${escapeTableHTML(
                            player.name ||
                            "Personagem"
                        )}
                    </h3>

                    <p>
                        ${
                            player.position
                                ? `Posição atual: ${player.position}`
                                : "Fora do cenário"
                        }
                    </p>

                </button>

            `)
            .join("");

    openTablePanel(
        "POSIÇÃO",
        `Posição ${position}`,
        `

        <div class="table-panel-list">

            ${html}

        </div>

        `
    );

    document
        .querySelectorAll(
            ".player-position-choice"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    moveCampaignPlayer(
                        button.dataset.characterId,
                        position
                    );

                    closeCurrentPanel();

                }
            );

        });

}


/*==========================================================
=              MOVER JOGADOR
==========================================================*/

function moveCampaignPlayer(
    characterId,
    position
){

    const players =
        currentTableCampaign.players;

    const occupied =
        players.find(
            player =>
                Number(player.position) ===
                position &&
                player.characterId !==
                characterId
        );

    if(occupied){

        addSystemChatMessage(
            `A posição ${position} já está ocupada por ${occupied.name}.`
        );

        return;

    }

    const player =
        players.find(
            item =>
                item.characterId ===
                characterId
        );

    if(!player){

        return;

    }

    player.position =
        position;

    saveTableCampaign();

    renderCombatPositions();

    addSystemChatMessage(
        `${player.name} foi movido para a posição ${position}.`
    );

}


/*==========================================================
=              AMEAÇAS PARA POSIÇÃO
==========================================================*/

function openEnemiesForPosition(position){

    let enemies = [];

    try{

        enemies =
            JSON.parse(
                localStorage.getItem(
                    "ordem_enemies"
                )
            ) || [];

    }
    catch{

        enemies = [];

    }

    if(enemies.length === 0){

        openEnemiesPanel();

        return;

    }

    const html =
        enemies
            .map(enemy => `

                <button
                    type="button"
                    class="table-panel-card enemy-position-choice"
                    data-enemy-id="${escapeTableHTML(
                        enemy.id
                    )}"
                    style="
                        width:100%;
                        text-align:left;
                        cursor:pointer;
                    "
                >

                    <h3>
                        ${escapeTableHTML(
                            enemy.name ||
                            "Ameaça"
                        )}
                    </h3>

                    <p>
                        Clique para posicionar.
                    </p>

                </button>

            `)
            .join("");

    openTablePanel(
        "AMEAÇAS",
        `Posição ${position}`,
        `

        <div class="table-panel-list">
            ${html}
        </div>

        `
    );

    document
        .querySelectorAll(
            ".enemy-position-choice"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const enemy =
                        enemies.find(
                            item =>
                                item.id ===
                                button.dataset.enemyId
                        );

                    if(!enemy){

                        return;

                    }

                    placeEntityAtPosition(
                        "enemy",
                        enemy,
                        position
                    );

                    closeCurrentPanel();

                }
            );

        });

}


/*==========================================================
=              NPCs PARA POSIÇÃO
==========================================================*/

function openNPCsForPosition(position){

    const npcs =
        Array.isArray(
            currentTableCampaign.npcs
        )
            ? currentTableCampaign.npcs
            : [];

    if(npcs.length === 0){

        openNPCPanel();

        return;

    }

    const html =
        npcs
            .map(npc => `

                <button
                    type="button"
                    class="table-panel-card npc-position-choice"
                    data-npc-id="${escapeTableHTML(
                        npc.id
                    )}"
                    style="
                        width:100%;
                        text-align:left;
                        cursor:pointer;
                    "
                >

                    <h3>
                        ${escapeTableHTML(
                            npc.name ||
                            "NPC"
                        )}
                    </h3>

                    <p>
                        Clique para posicionar.
                    </p>

                </button>

            `)
            .join("");

    openTablePanel(
        "NPC",
        `Posição ${position}`,
        `

        <div class="table-panel-list">
            ${html}
        </div>

        `
    );

    document
        .querySelectorAll(
            ".npc-position-choice"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const npc =
                        npcs.find(
                            item =>
                                String(item.id) ===
                                String(
                                    button.dataset.npcId
                                )
                        );

                    if(!npc){

                        return;

                    }

                    placeEntityAtPosition(
                        "npc",
                        npc,
                        position
                    );

                    closeCurrentPanel();

                }
            );

        });

}


/*==========================================================
=              POSIÇÃO OCUPADA
==========================================================*/

function openOccupiedPosition(
    type,
    entity,
    position
){

    if(!positionModal){

        return;

    }

    if(positionModalTitle){

        positionModalTitle.textContent =
            entity.name ||
            `Posição ${position}`;

    }

    const canControl =
        currentTableRole === "master" ||
        (
            type === "player" &&
            currentTableCharacter &&
            entity.characterId ===
                currentTableCharacter.id
        );

    positionModalBody.innerHTML = `

        <div class="table-panel-card">

            <h3>
                ${escapeTableHTML(
                    entity.name ||
                    "Entidade"
                )}
            </h3>

            <p>
                Posição ${position}
            </p>

        </div>

        ${
            canControl
                ? `

                    <div
                        style="
                            display:grid;
                            grid-template-columns:1fr 1fr;
                            gap:10px;
                        "
                    >

                        <button
                            type="button"
                            id="movePositionEntity"
                            class="primary-button">

                            Mover

                        </button>

                        <button
                            type="button"
                            id="removePositionEntity"
                            class="secondary-button">

                            Remover

                        </button>

                    </div>

                `
                : ""
        }

    `;

    positionModal.classList.remove(
        "hidden"
    );

    if(canControl){

        document
            .getElementById(
                "movePositionEntity"
            )
            ?.addEventListener(
                "click",
                () => {

                    startMoveEntity(
                        type,
                        entity
                    );

                }
            );

        document
            .getElementById(
                "removePositionEntity"
            )
            ?.addEventListener(
                "click",
                () => {

                    removeEntityFromScene(
                        type,
                        entity
                    );

                }
            );

    }

}


/*==========================================================
=              MOVER ENTIDADE
==========================================================*/

function startMoveEntity(
    type,
    entity
){

    closeCurrentPositionModal();

    if(type === "player"){

        if(
            currentTableRole === "player"
        ){

            openTablePanel(
                "MOVIMENTO",
                "Escolha uma posição",
                createPositionButtons(
                    6,
                    "move-current-player"
                )
            );

            bindMoveCurrentPlayerButtons();

        }
        else{

            openTablePanel(
                "MOVIMENTO",
                entity.name || "Personagem",
                createPositionButtons(
                    6,
                    "move-master-player"
                )
            );

            bindMasterPlayerMoveButtons(
                entity
            );

        }

        return;

    }

    if(type === "enemy"){

        openTablePanel(
            "MOVIMENTO",
            entity.name || "Ameaça",
            createPositionButtons(
                6,
                "move-enemy"
            )
        );

        bindEntityMoveButtons(
            "enemy",
            entity
        );

        return;

    }

    if(type === "npc"){

        openTablePanel(
            "MOVIMENTO",
            entity.name || "NPC",
            createPositionButtons(
                3,
                "move-npc"
            )
        );

        bindEntityMoveButtons(
            "npc",
            entity
        );

    }

}


/*==========================================================
=              BOTÕES DE POSIÇÃO
==========================================================*/

function createPositionButtons(
    amount,
    className
){

    let html = `

        <div
            style="
                display:grid;
                grid-template-columns:repeat(2,1fr);
                gap:10px;
            "
        >

    `;

    for(
        let position = 1;
        position <= amount;
        position++
    ){

        html += `

            <button
                type="button"
                class="primary-button ${className}"
                data-position="${position}">

                Posição ${position}

            </button>

        `;

    }

    html += "</div>";

    return html;

}


/*==========================================================
=              MOVER JOGADOR ATUAL
==========================================================*/

function bindMoveCurrentPlayerButtons(){

    document
        .querySelectorAll(
            ".move-current-player"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    placeCurrentPlayer(
                        Number(
                            button.dataset.position
                        )
                    );

                    closeCurrentPanel();

                }
            );

        });

}


/*==========================================================
=              MESTRE MOVE JOGADOR
==========================================================*/

function bindMasterPlayerMoveButtons(
    entity
){

    document
        .querySelectorAll(
            ".move-master-player"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    moveCampaignPlayer(
                        entity.characterId,
                        Number(
                            button.dataset.position
                        )
                    );

                    closeCurrentPanel();

                }
            );

        });

}


/*==========================================================
=              MOVER NPC / AMEAÇA
==========================================================*/

function bindEntityMoveButtons(
    type,
    entity
){

    const selector =
        type === "enemy"
            ? ".move-enemy"
            : ".move-npc";

    document
        .querySelectorAll(
            selector
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    placeEntityAtPosition(
                        type,
                        entity,
                        Number(
                            button.dataset.position
                        )
                    );

                    closeCurrentPanel();

                }
            );

        });

}


/*==========================================================
=              REMOVER DO CENÁRIO
==========================================================*/

function removeEntityFromScene(
    type,
    entity
){

    if(type === "player"){

        const player =
            currentTableCampaign.players?.find(
                item =>
                    item.characterId ===
                    entity.characterId
            );

        if(player){

            player.position = null;

        }

    }

    if(type === "enemy"){

        currentTableCampaign.enemies =
            (
                currentTableCampaign.enemies ||
                []
            ).filter(
                item =>
                    item.enemyId !==
                    entity.enemyId
            );

    }

    if(type === "npc"){

        const npc =
            currentTableCampaign.npcs?.find(
                item =>
                    String(item.id) ===
                    String(entity.id)
            );

        if(npc){

            npc.position = null;

        }

    }

    saveTableCampaign();

    closeCurrentPositionModal();

    renderCombatPositions();

    addSystemChatMessage(
        `${entity.name || "Entidade"} saiu do cenário.`
    );

}

/*==========================================================
=              ID DE MENSAGEM
==========================================================*/

function createChatMessageId(){

    return (
        `chat_${Date.now()}_` +
        Math.random()
            .toString(36)
            .slice(2,10)
    );

}

/*==========================================================
=              SALVAR MENSAGEM PÚBLICA
==========================================================*/

function savePublicChatMessage(
    message
){

    refreshCurrentTableCampaign();


    if(
        !Array.isArray(
            currentTableCampaign.chatMessages
        )
    ){

        currentTableCampaign.chatMessages = [];

    }


    currentTableCampaign
        .chatMessages
        .push(message);


    /*
        Impede que o localStorage cresça sem limite.
    */

    if(
        currentTableCampaign
            .chatMessages
            .length > 200
    ){

        currentTableCampaign.chatMessages =
            currentTableCampaign
                .chatMessages
                .slice(-200);

    }


    saveTableCampaign();

    renderPublicChat();

}


/*==========================================================
=              CHAT
==========================================================*/

const tableChat =
    document.getElementById(
        "tableChat"
    );

const chatMessages =
    document.getElementById(
        "chatMessages"
    );

const chatInput =
    document.getElementById(
        "chatInput"
    );

const sendChatMessageButton =
    document.getElementById(
        "sendChatMessage"
    );

const collapseChat =
    document.getElementById(
        "collapseChat"
    );

const toggleChat =
    document.getElementById(
        "toggleChat"
    );


/*==========================================================
=              EVENTOS DO CHAT
==========================================================*/

sendChatMessageButton?.addEventListener(
    "click",
    sendTableChatMessage
);

chatInput?.addEventListener(
    "keydown",
    event => {

        if(event.key === "Enter"){

            sendTableChatMessage();

        }

    }
);

collapseChat?.addEventListener(
    "click",
    toggleTableChat
);

toggleChat?.addEventListener(
    "click",
    toggleTableChat
);


/*==========================================================
=              ENVIAR MENSAGEM
==========================================================*/
function sendTableChatMessage(){

    const text =
        chatInput?.value.trim();


    if(!text){

        return;

    }


    const author =
        currentTableRole === "master"
            ? "Mestre"
            : currentTableCharacter?.name ||
              "Jogador";


    const characterId =
        currentTableRole === "player"
            ? currentTableCharacter?.id || null
            : null;


    const photo =
        currentTableRole === "player"
            ? getCharacterCurrentPhoto(
                currentTableCharacter
            )
            : "";


    savePublicChatMessage({

        id:
            createChatMessageId(),

        type:
            "message",

        author,

        role:
            currentTableRole,

        characterId,

        photo,

        text,

        createdAt:
            Date.now()

    });


    chatInput.value = "";

}





/*==========================================================
=              MENSAGEM DO SISTEMA
==========================================================*/

function addSystemChatMessage(
    text
){

    if(
        !currentTableCampaign
    ){

        return;

    }


    savePublicChatMessage({

        id:
            createChatMessageId(),

        type:
            "system",

        author:
            "Sistema",

        text:
            String(text),

        createdAt:
            Date.now()

    });

}


/*==========================================================
=              ROLAGEM NO CHAT
==========================================================*/

function addRollChatMessage(
    label,
    formula,
    total,
    detail
){

    if(
        !currentTableCampaign
    ){

        return;

    }


    const author =
        currentTableRole === "master"
            ? "Mestre"
            : currentTableCharacter?.name ||
              "Jogador";


    const characterId =
        currentTableRole === "player"
            ? currentTableCharacter?.id || null
            : null;


    const photo =
        currentTableRole === "player"
            ? getCharacterCurrentPhoto(
                currentTableCharacter
            )
            : "";


    savePublicChatMessage({

        id:
            createChatMessageId(),

        type:
            "roll",

        author,

        role:
            currentTableRole,

        characterId,

        photo,

        label:
            String(label || "Rolagem"),

        formula:
            String(formula || ""),

        total:
            Number(total) || 0,

        detail:
            String(detail || ""),

        createdAt:
            Date.now()

    });

}


/*==========================================================
=              DADOS RÁPIDOS
==========================================================*/

document
    .querySelectorAll(
        ".dice-quick-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const sides =
                    Number(
                        button.dataset.die
                    );

                const result =
                    Math.floor(
                        Math.random() * sides
                    ) + 1;

                addRollChatMessage(
                    `d${sides}`,
                    `1d${sides}`,
                    result,
                    `[${result}]`
                );

                diceModal?.classList.add(
                    "hidden"
                );

                clearActiveMenuButtons();

            }
        );

    });


/*==========================================================
=              ROLAGEM CUSTOMIZADA
==========================================================*/

document
    .getElementById(
        "rollCustomDice"
    )
    ?.addEventListener(
        "click",
        () => {

            const amount =
                Number(
                    document.getElementById(
                        "diceAmount"
                    )?.value
                ) || 1;

            const sides =
                Number(
                    document.getElementById(
                        "diceSides"
                    )?.value
                ) || 20;

            const modifier =
                Number(
                    document.getElementById(
                        "diceModifier"
                    )?.value
                ) || 0;

            const rolls = [];

            let sum = 0;

            for(
                let i = 0;
                i < amount;
                i++
            ){

                const roll =
                    Math.floor(
                        Math.random() *
                        sides
                    ) + 1;

                rolls.push(roll);

                sum += roll;

            }

            const total =
                sum + modifier;

            const formula =
                `${amount}d${sides}${
                    modifier
                        ? `${modifier >= 0 ? "+" : ""}${modifier}`
                        : ""
                }`;

            const detail =
                `[${rolls.join(", ")}]${
                    modifier
                        ? ` ${modifier >= 0 ? "+" : ""}${modifier}`
                        : ""
                }`;

            addRollChatMessage(
                "Rolagem",
                formula,
                total,
                detail
            );

            diceModal?.classList.add(
                "hidden"
            );

            clearActiveMenuButtons();

        }
    );


/*==========================================================
=              ABRIR / FECHAR CHAT
==========================================================*/

function toggleTableChat(){

    if(!tableChat){

        return;

    }


    const playArea =
        document.querySelector(
            ".table-play-area"
        );


    const collapsed =
        tableChat.classList.toggle(
            "collapsed"
        );


    playArea
        ?.classList
        .toggle(
            "chat-collapsed",
            collapsed
        );


    if(collapseChat){

        collapseChat.textContent =
            collapsed
                ? "‹"
                : "›";

    }

}


/*==========================================================
=              SCROLL CHAT
==========================================================*/

function scrollTableChat(){

    if(!chatMessages){

        return;

    }

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*==========================================================
=              HORÁRIO
==========================================================*/

function getTableTime(){

    const now =
        new Date();

    return now.toLocaleTimeString(
        "pt-BR",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}


/*==========================================================
=              ESC
==========================================================*/

document.addEventListener(
    "keydown",
    event => {

        if(event.key !== "Escape"){

            return;

        }

        if(
            positionModal &&
            !positionModal
                .classList
                .contains("hidden")
        ){

            closeCurrentPositionModal();

            return;

        }

        if(
            diceModal &&
            !diceModal
                .classList
                .contains("hidden")
        ){

            diceModal.classList.add(
                "hidden"
            );

            clearActiveMenuButtons();

            return;

        }

        if(
            tablePanelOverlay &&
            !tablePanelOverlay
                .classList
                .contains("hidden")
        ){

            closeCurrentPanel();

        }

    }
);

/*==========================================================
=              PEGAR FICHA ATUALIZADA
==========================================================*/

function getLiveCharacter(
    characterId
){

    const characters =
        JSON.parse(
            localStorage.getItem(
                "ordem_characters"
            ) || "[]"
        );


    return characters.find(
        character =>
            character.id === characterId
    ) || null;

}

function refreshCurrentTableCharacter(){

    if(
        currentTableRole !== "player" ||
        !currentTableCharacter
    ){

        return;

    }


    const updated =
        getLiveCharacter(
            currentTableCharacter.id
        );


    if(updated){

        currentTableCharacter =
            updated;

    }

}

/*==========================================================
=              ATUALIZAR CAMPANHA DA MESA
==========================================================*/

function refreshCurrentTableCampaign(){

    let campaigns = [];

    try{

        campaigns =
            JSON.parse(
                localStorage.getItem(
                    TABLE_CAMPAIGN_STORAGE
                ) || "[]"
            );

    }
    catch(error){

        console.error(
            "Erro ao atualizar campanha:",
            error
        );

        return false;

    }


    const updatedCampaign =
        campaigns.find(
            campaign =>
                campaign.id ===
                currentTableCampaign?.id
        );


    if(!updatedCampaign){

        return false;

    }


    tableCampaigns =
        campaigns;


    currentTableCampaign =
        updatedCampaign;


    initializeCombatState();


    return true;

}

/*==========================================================
=              CAMPANHA AO VIVO
==========================================================*/

window.addEventListener(
    "storage",
    event => {

        if(
            event.key !==
            TABLE_CAMPAIGN_STORAGE
        ){

            return;

        }


        refreshCurrentTableCampaign();

        refreshCurrentTableCharacter();

        renderCombatPositions();

        renderPublicChat();

        checkInitiativeRequest();

    }
);

/*==========================================================
=              VERIFICAR INICIATIVA
==========================================================*/

function checkInitiativeRequest(){

    if(
        currentTableRole !== "player" ||
        !currentTableCharacter ||
        !currentTableCampaign
    ){

        return;

    }


    const request =
        currentTableCampaign
            .combat
            ?.initiativeRequest;


    if(
        !request ||
        request.active !== true
    ){

        return;

    }


    const participant =
        request.participants
            ?.find(
                item =>
                    item.type === "player" &&
                    item.characterId ===
                    currentTableCharacter.id
            );


    if(
        !participant ||
        participant.rolled === true
    ){

        return;

    }


    if(
        lastInitiativeRequestShown ===
        request.id
    ){

        return;

    }


    lastInitiativeRequestShown =
        request.id;


    openPlayerInitiativePanel();

}

/*==========================================================
=              PAINEL DO JOGADOR
==========================================================*/

function openPlayerInitiativePanel(){

    if(
        currentTableRole !== "player" ||
        !currentTableCharacter
    ){

        return;

    }


    const attributes =
        currentTableCharacter.attributes || {};


    const attributeButtons = [

        {
            id:"for",
            name:"FOR",
            value:
                Number(
                    attributes.for
                ) || 1
        },

        {
            id:"agi",
            name:"AGI",
            value:
                Number(
                    attributes.agi
                ) || 1
        },

        {
            id:"int",
            name:"INT",
            value:
                Number(
                    attributes.int
                ) || 1
        },

        {
            id:"vig",
            name:"VIG",
            value:
                Number(
                    attributes.vig
                ) || 1
        },

        {
            id:"pre",
            name:"PRE",
            value:
                Number(
                    attributes.pre
                ) || 1
        }

    ];


    openTablePanel(
        "COMBATE",
        "Rolar Iniciativa",
        `

        <div class="table-panel-section">

            <div class="table-panel-card">

                <h3>
                    Teste solicitado
                </h3>

                <p>
                    Escolha qual atributo será utilizado.
                </p>

                <p>
                    Serão rolados vários d20 conforme o atributo, usando o maior resultado, mais o dado de treino de Presteza.
                </p>

            </div>


            <div class="initiative-attribute-grid">

                ${
                    attributeButtons
                        .map(
                            attribute => `

                                <button
                                    type="button"
                                    class="initiative-attribute-button"
                                    data-attribute="${attribute.id}">

                                    <strong>
                                        ${attribute.name}
                                    </strong>

                                    <span>
                                        ${attribute.value}d20
                                    </span>

                                </button>

                            `
                        )
                        .join("")
                }

            </div>

        </div>

        `
    );


    document
        .querySelectorAll(
            ".initiative-attribute-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    rollPlayerInitiative(
                        button.dataset.attribute
                    );

                }
            );

        });

}

/*==========================================================
=              PEGAR PRESTEZA
==========================================================*/

function getCharacterReadinessSkill(
    character
){

    const skills =
        Array.isArray(
            character.skills
        )
            ? character.skills
            : [];


    return skills.find(skill => {

        const id =
            String(
                skill.id || ""
            )
                .toLowerCase()
                .trim();


        const name =
            String(
                skill.name || ""
            )
                .toLowerCase()
                .trim();


        return (
            id === "presteza" ||
            name === "presteza"
        );

    }) || null;

}

/*==========================================================
=              ROLAR INICIATIVA DO JOGADOR
==========================================================*/

function rollPlayerInitiative(
    attributeName
){

    refreshCurrentTableCampaign();

    refreshCurrentTableCharacter();


    if(
        currentTableRole !== "player" ||
        !currentTableCharacter
    ){

        return;

    }


    const request =
        currentTableCampaign
            .combat
            ?.initiativeRequest;


    if(
        !request ||
        request.active !== true
    ){

        addSystemChatMessage(
            "Não existe uma solicitação de iniciativa ativa."
        );

        return;

    }


    const participant =
        request.participants
            ?.find(
                item =>
                    item.type === "player" &&
                    item.characterId ===
                    currentTableCharacter.id
            );


    if(!participant){

        return;

    }


    if(participant.rolled){

        addSystemChatMessage(
            "Você já rolou sua iniciativa."
        );

        closeCurrentPanel();

        return;

    }


    const attributeValue =
        Math.max(
            1,
            Number(
                currentTableCharacter
                    .attributes
                    ?.[attributeName]
            ) || 1
        );


    const d20Rolls = [];


    for(
        let index = 0;
        index < attributeValue;
        index++
    ){

        d20Rolls.push(
            Math.floor(
                Math.random() * 20
            ) + 1
        );

    }


    const bestD20 =
        Math.max(
            ...d20Rolls
        );


    const readiness =
        getCharacterReadinessSkill(
            currentTableCharacter
        );


    const trainingFormula =
        readiness?.training &&
        readiness.training !== "0"
            ? readiness.training
            : "0";


    const trainingResult =
        rollDiceExpression(
            trainingFormula
        );


    const trainingValue =
        trainingResult?.total || 0;


    const skillModifier =
        (
            Number(
                readiness?.bonus
            ) || 0
        )
        +
        (
            Number(
                readiness?.penalty
            ) || 0
        );


    const total =
        bestD20 +
        trainingValue +
        skillModifier;


    participant.rolled =
        true;


    participant.result =
        total;


    participant.attribute =
        attributeName;


    participant.attributeValue =
        attributeValue;


    participant.d20Rolls =
        d20Rolls;


    participant.bestD20 =
        bestD20;


    participant.readinessTraining =
        trainingFormula;


    participant.readinessRoll =
        trainingValue;


    participant.modifier =
        skillModifier;


    participant.rolledAt =
        Date.now();


    currentTableCampaign
        .combat
        .updatedAt =
        Date.now();


    saveTableCampaign();


    const detail = [

        `${attributeValue}d20 [${d20Rolls.join(", ")}]`,

        `maior ${bestD20}`,

        trainingFormula !== "0"
            ? `Presteza ${trainingFormula} = ${trainingValue}`
            : "Presteza sem treino",

        skillModifier
            ? `modificador ${skillModifier >= 0 ? "+" : ""}${skillModifier}`
            : ""

    ]
        .filter(Boolean)
        .join(" • ");


    addRollChatMessage(
        `Iniciativa • ${currentTableCharacter.name}`,
        `${attributeValue}d20 + ${trainingFormula}`,
        total,
        detail
    );


    closeCurrentPanel();


    addSystemChatMessage(
        `Iniciativa registrada: ${total}.`
    );


    finalizeInitiativeIfReady();

}

/*==========================================================
=              ROLAR INICIATIVA DAS AMEAÇAS
==========================================================*/

function rollEnemyInitiatives(){

    const request =
        currentTableCampaign
            .combat
            ?.initiativeRequest;


    if(!request){

        return;

    }


    let enemyLibrary = [];

    try{

        enemyLibrary =
            JSON.parse(
                localStorage.getItem(
                    "ordem_enemies"
                ) || "[]"
            );

    }
    catch{

        enemyLibrary = [];

    }


    request.participants
        .filter(
            participant =>
                participant.type === "enemy" &&
                participant.rolled !== true
        )
        .forEach(participant => {

            const enemy =
                enemyLibrary.find(
                    item =>
                        item.id ===
                        participant.enemyId
                ) || {};


            const attributes =
                enemy.attributes || {};


            const agility =
                Math.max(
                    1,
                    Number(
                        attributes.agi ??
                        enemy.agi ??
                        enemy.agility
                    ) || 1
                );


            const d20Rolls = [];


            for(
                let index = 0;
                index < agility;
                index++
            ){

                d20Rolls.push(
                    Math.floor(
                        Math.random() * 20
                    ) + 1
                );

            }


            const bestD20 =
                Math.max(
                    ...d20Rolls
                );


            const skills =
                Array.isArray(
                    enemy.skills
                )
                    ? enemy.skills
                    : [];


            const readiness =
                skills.find(skill => {

                    const id =
                        String(
                            skill.id || ""
                        ).toLowerCase();


                    const name =
                        String(
                            skill.name || ""
                        ).toLowerCase();


                    return (
                        id === "presteza" ||
                        name === "presteza"
                    );

                });


            const trainingFormula =
                readiness?.training &&
                readiness.training !== "0"
                    ? readiness.training
                    : "0";


            const trainingResult =
                rollDiceExpression(
                    trainingFormula
                );


            const trainingValue =
                trainingResult?.total || 0;


            const modifier =
                (
                    Number(
                        readiness?.bonus
                    ) || 0
                )
                +
                (
                    Number(
                        readiness?.penalty
                    ) || 0
                );


            participant.rolled =
                true;


            participant.result =
                bestD20 +
                trainingValue +
                modifier;


            participant.attribute =
                "agi";


            participant.attributeValue =
                agility;


            participant.d20Rolls =
                d20Rolls;


            participant.bestD20 =
                bestD20;


            participant.readinessTraining =
                trainingFormula;


            participant.readinessRoll =
                trainingValue;


            participant.modifier =
                modifier;


            participant.rolledAt =
                Date.now();

        });


    currentTableCampaign
        .combat
        .updatedAt =
        Date.now();


    saveTableCampaign();

}


/*==========================================================
=              SINCRONIZAÇÃO AO VIVO
==========================================================*/

/*==========================================================
=              SINCRONIZAÇÃO AO VIVO
==========================================================*/

window.addEventListener(
    "storage",
    event => {

        if(
            event.key !==
            TABLE_CHARACTER_STORAGE
        ){

            return;

        }


        loadTableStorage();

        refreshCurrentTableCharacter();

        renderCombatPositions();

    }
);




/*==========================================================
=              FOTO ATUAL DO PERSONAGEM
==========================================================*/

function getCharacterCurrentPhoto(
    character
){

    const conditions =
        Array.isArray(
            character.conditions
        )
            ? character.conditions
            : [];


    const wounded =
        conditions.some(
            condition =>
                condition.id ===
                "machucado"
        );


    if(
        wounded &&
        character.woundedPhoto
    ){

        return character.woundedPhoto;

    }


 return character.photo || "";

}

/*==========================================================
=              ROLAR EXPRESSÃO DE DADOS
==========================================================*/

function rollDiceExpression(
    expression
){

    if(!expression){

        return null;

    }


    const clean =
        String(
            expression
        )
            .toLowerCase()
            .replace(/\s+/g,"");


    /*
        Aceita:
        1d20
        1d20+1d8
        2d6+5
        1d20+1d8-3
    */

    const parts =
        clean.match(
            /[+-]?[^+-]+/g
        );


    if(!parts){

        return null;

    }


    let total = 0;

    const details = [];


    for(
        const rawPart
        of parts
    ){

        let sign = 1;

        let part =
            rawPart;


        if(part.startsWith("+")){

            part =
                part.slice(1);

        }
        else if(
            part.startsWith("-")
        ){

            sign = -1;

            part =
                part.slice(1);

        }


        const dice =
            part.match(
                /^(\d+)d(\d+)$/
            );


        if(dice){

            const amount =
                Number(
                    dice[1]
                );


            const sides =
                Number(
                    dice[2]
                );


            const rolls = [];


            for(
                let i = 0;
                i < amount;
                i++
            ){

                rolls.push(
                    Math.floor(
                        Math.random() *
                        sides
                    ) + 1
                );

            }


            const subtotal =
                rolls.reduce(
                    (sum,value) =>
                        sum + value,
                    0
                ) * sign;


            total +=
                subtotal;


            details.push({

                type:"dice",

                formula:
                    `${amount}d${sides}`,

                rolls,

                sign,

                subtotal

            });


            continue;

        }


        const numeric =
            Number(
                part
            );


        if(
            Number.isFinite(
                numeric
            )
        ){

            const value =
                numeric * sign;


            total +=
                value;


            details.push({

                type:"number",

                value,

                subtotal:value

            });


            continue;

        }


        /*
            Se tiver algo que ainda não
            entendemos, aborta.
        */

        return null;

    }


    return {

        expression:
            clean,

        total,

        details

    };

}


function rollQuickAttackDamage(
    character,
    attack
){

    const formula =
        resolveCharacterFormula(
            attack.damage,
            character
        );


    const result =
        rollDiceExpression(
            formula
        );


    if(!result){

        addSystemChatMessage(
            `Não foi possível interpretar o dano "${attack.damage}".`
        );

        return;

    }


    addDiceChatMessage({

        characterName:
            character.name,

        title:
            attack.name,

        type:
            "Dano",

        formula,

        result

    });

}

function resolveCharacterFormula(
    expression,
    character
){

    const attributes =
        character.attributes || {};


    return String(
        expression || ""
    )
        .replace(
            /\bFOR\b/gi,
            Number(
                attributes.for
            ) || 0
        )
        .replace(
            /\bAGI\b/gi,
            Number(
                attributes.agi
            ) || 0
        )
        .replace(
            /\bINT\b/gi,
            Number(
                attributes.int
            ) || 0
        )
        .replace(
            /\bVIG\b/gi,
            Number(
                attributes.vig
            ) || 0
        )
        .replace(
            /\bPRE\b/gi,
            Number(
                attributes.pre
            ) || 0
        );

}



    function renderTableCharacterSkills(
    character
){

    const container =
        document.getElementById(
            "tableCharacterSkills"
        );


    if(!container){

        return;

    }


    const skills =
        Array.isArray(
            character.skills
        )
            ? character.skills
            : [];


    if(!skills.length){

        container.innerHTML = `

            <div class="sheet-empty">
                Nenhuma perícia configurada.
            </div>

        `;

        return;

    }


    container.innerHTML =
        skills
            .map(
                skill => `

                    <button
                        type="button"
                        class="table-skill-button"
                        data-skill="${skill.id}"
                    >

                        <div>

                            <strong>
                                ${escapeTableHTML(
                                    skill.name
                                )}
                            </strong>

                            <span>

                                ${String(
                                    skill.selectedAttribute ||
                                    ""
                                ).toUpperCase()}

                                •

                                ${
                                    skill.training === "0"
                                        ? "Sem treino"
                                        : skill.training
                                }

                            </span>

                        </div>


                        <span>
                            🎲
                        </span>

                    </button>

                `
            )
            .join("");


    container
        .querySelectorAll(
            ".table-skill-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    rollTableCharacterSkill(
                        character,
                        button.dataset.skill
                    );

                }
            );

        });

}

function rollTableCharacterSkill(
    character,
    skillId
){

    const skill =
        character.skills
            ?.find(
                item =>
                    item.id ===
                    skillId
            );


    if(!skill){

        return;

    }


    const attribute =
        skill.selectedAttribute;


    const attributeValue =
        Math.max(
            1,
            Number(
                character.attributes
                    ?.[attribute]
            ) || 1
        );


    const d20Rolls = [];


    for(
        let i = 0;
        i < attributeValue;
        i++
    ){

        d20Rolls.push(
            Math.floor(
                Math.random() * 20
            ) + 1
        );

    }


    const bestD20 =
        Math.max(
            ...d20Rolls
        );


    const training =
        rollDiceExpression(
            skill.training === "0"
                ? "0"
                : skill.training
        );


    const trainingValue =
        training?.total || 0;


    const modifier =
        (
            Number(
                skill.bonus
            ) || 0
        )
        +
        (
            Number(
                skill.penalty
            ) || 0
        )
        +
        getTableSkillConditionModifier(
            character,
            skill
        );


    const total =
        bestD20 +
        trainingValue +
        modifier;


    addDiceChatMessage({

        characterName:
            character.name,

        title:
            skill.name,

        type:
            "Perícia",

        formula:
            `${attributeValue}d20 + ${skill.training}`,

        result:{

            total,

            d20Rolls,

            selectedD20:
                bestD20,

            trainingRoll:
                trainingValue,

            modifier

        }

    });

}

function renderTableConditions(
    character
){

    const conditions =
        character.conditions || [];


    // gera os chips aqui

}

function hasTableCondition(
    character,
    conditionId
){

    return (
        character.conditions || []
    ).some(
        condition =>
            condition.id ===
            conditionId
    );

}

window.addEventListener(
    "focus",
    () => {

        refreshTableLiveData();

    }
);


document.addEventListener(
    "visibilitychange",
    () => {

        if(
            document.visibilityState ===
            "visible"
        ){

            refreshTableLiveData();

        }

    }
);
function refreshTableLiveData(){

    loadTableStorage();

    refreshCurrentTableCharacter();


    /*
        Atualiza tokens.
    */

    renderCombatPositions();

    renderPublicChat();

    checkInitiativeRequest();

finalizeInitiativeIfReady();


    /*
        Se o painel de ficha estiver aberto,
        reabre com os dados novos.
    */

    if(
        tablePanelOverlay &&
        !tablePanelOverlay
            .classList
            .contains("hidden")
    ){

        const active =
            document.querySelector(
                '.table-menu-button.active'
            );


        if(
            active?.dataset.panel ===
            "character"
        ){

            openCharacterPanel();

        }

    }

}

window.addEventListener(
    "storage",
    event => {

        if(
            event.key !==
            TABLE_CHARACTER_STORAGE
        ){

            return;

        }


        refreshTableLiveData();

    }
);

/*==========================================================
=              ESTADO DE COMBATE
==========================================================*/

function createDefaultCombatState(){

    return {

        active:false,

        round:0,

        currentTurnIndex:0,

        turnOrder:[],

        initiativeRequest:null,

        updatedAt:Date.now()

    };

}


function initializeCombatState(){

    if(
        !currentTableCampaign.combat ||
        typeof currentTableCampaign.combat !== "object"
    ){

        currentTableCampaign.combat =
            createDefaultCombatState();

        saveTableCampaign();

        return;

    }


    const combat =
        currentTableCampaign.combat;


    combat.active =
        Boolean(
            combat.active
        );


    combat.round =
        Math.max(
            0,
            Number(
                combat.round
            ) || 0
        );


    combat.currentTurnIndex =
        Math.max(
            0,
            Number(
                combat.currentTurnIndex
            ) || 0
        );


    combat.turnOrder =
        Array.isArray(
            combat.turnOrder
        )
            ? combat.turnOrder
            : [];


    combat.initiativeRequest =
        combat.initiativeRequest &&
        typeof combat.initiativeRequest === "object"
            ? combat.initiativeRequest
            : null;

}

/*==========================================================
=              INICIALIZAR CHAT PÚBLICO
==========================================================*/

function initializePublicChat(){

    if(
        !Array.isArray(
            currentTableCampaign.chatMessages
        )
    ){

        currentTableCampaign.chatMessages = [];

        saveTableCampaign();

    }

}

/*==========================================================
=              SALVAR FICHAS DA MESA
==========================================================*/

function saveTableCharacters(){

    localStorage.setItem(
        TABLE_CHARACTER_STORAGE,
        JSON.stringify(
            tableCharacters
        )
    );

}

/*==========================================================
=              PASSAR RODADA
==========================================================*/

function passTableRound(){

    if(
        currentTableRole !== "master"
    ){

        return;

    }


    const combat =
        currentTableCampaign.combat;


    combat.active =
        true;


    combat.round =
        Math.max(
            1,
            Number(
                combat.round
            ) + 1
        );


    combat.currentTurnIndex =
        0;

        combat.waitingNextRound =
    false;


    combat.initiativeRequest =
        null;


    combat.updatedAt =
        Date.now();


    restorePlayersActionPoints();

    restoreEnemiesActionPoints();


    saveTableCharacters();

    saveTableCampaign();


    /*
        Atualiza a ficha do próprio jogador,
        caso a aba seja recarregada ou sincronizada.
    */

    refreshCurrentTableCharacter();

    renderCombatPositions();


    closeCurrentPanel();


    addSystemChatMessage(
        `Rodada ${combat.round} iniciada. Todos recuperaram seu PA máximo.`
    );

}

/*==========================================================
=              ENCERRAR COMBATE
==========================================================*/

function endTableCombat(){

    if(
        currentTableRole !== "master"
    ){

        return;

    }


    currentTableCampaign.combat =
        createDefaultCombatState();


    saveTableCampaign();


    closeCurrentPanel();


    addSystemChatMessage(
        "O mestre encerrou o combate."
    );


    renderCombatPositions();

}

/*==========================================================
=              FINALIZAR INICIATIVA
==========================================================*/

function finalizeInitiativeIfReady(){

    refreshCurrentTableCampaign();


    const combat =
        currentTableCampaign
            ?.combat;


    const request =
        combat?.initiativeRequest;


    if(
        !request ||
        request.active !== true
    ){

        return false;

    }


    const participants =
        Array.isArray(
            request.participants
        )
            ? request.participants
            : [];


    if(!participants.length){

        return false;

    }


    const allRolled =
        participants.every(
            participant =>
                participant.rolled === true &&
                Number.isFinite(
                    Number(
                        participant.result
                    )
                )
        );


    if(!allRolled){

        return false;

    }


    const ordered =
        [...participants]
            .sort(
                (first,second) => {

                    const resultDifference =
                        Number(
                            second.result
                        ) -
                        Number(
                            first.result
                        );


                    if(resultDifference !== 0){

                        return resultDifference;

                    }


                    const attributeDifference =
                        Number(
                            second.attributeValue
                        ) -
                        Number(
                            first.attributeValue
                        );


                    if(attributeDifference !== 0){

                        return attributeDifference;

                    }


                    return String(
                        first.name || ""
                    ).localeCompare(
                        String(
                            second.name || ""
                        ),
                        "pt-BR"
                    );

                }
            )
            .map(
                (participant,index) => ({

                    ...participant,

                    order:
                        index + 1

                })
            );


    combat.active =
        true;


    combat.round =
        1;


    combat.currentTurnIndex =
        0;


    combat.turnOrder =
        ordered;


    combat.initiativeRequest =
        null;


    combat.updatedAt =
        Date.now();


    saveTableCampaign();


    renderCombatPositions();


    showInitiativeOrderInChat(
        ordered
    );


    return true;

}

/*==========================================================
=              ORDEM NO CHAT
==========================================================*/

function showInitiativeOrderInChat(
    participants
){

    if(!chatMessages){

        return;

    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "chat-roll-message initiative-order-message";


    message.innerHTML = `

        <div class="chat-roll-header">

            <strong>
                Ordem de Iniciativa
            </strong>

            <span class="chat-roll-label">
                RODADA 1
            </span>

        </div>


        <div class="initiative-order-list">

            ${
                participants
                    .map(
                        (participant,index) => `

                            <div class="initiative-order-item">

                                <span>
                                    ${index + 1}
                                </span>

                                <strong>
                                    ${escapeTableHTML(
                                        participant.name ||
                                        "Participante"
                                    )}
                                </strong>

                                <b>
                                    ${Number(
                                        participant.result
                                    ) || 0}
                                </b>

                            </div>

                        `
                    )
                    .join("")
            }

        </div>

    `;


    chatMessages.appendChild(
        message
    );


    scrollTableChat();

}

/*==========================================================
=              RENDERIZAR CHAT PÚBLICO
==========================================================*/

function renderPublicChat(){

    if(
        !chatMessages ||
        !currentTableCampaign
    ){

        return;

    }


    const messages =
        Array.isArray(
            currentTableCampaign.chatMessages
        )
            ? currentTableCampaign.chatMessages
            : [];


    chatMessages.innerHTML = "";


    if(messages.length === 0){

        const welcome =
            document.createElement(
                "div"
            );


        welcome.className =
            "chat-system-message";


        welcome.innerHTML = `

            <span class="chat-system-icon">
                ◇
            </span>

            <div>

                <strong>
                    Sistema
                </strong>

                <p>
                    Bem-vindo à mesa.
                </p>

            </div>

        `;


        chatMessages.appendChild(
            welcome
        );

        return;

    }


    messages.forEach(message => {

        const element =
            createPublicChatElement(
                message
            );


        if(element){

            chatMessages.appendChild(
                element
            );

        }

    });


    scrollTableChat();

}

/*==========================================================
=              ELEMENTO DO CHAT
==========================================================*/

function createPublicChatElement(
    message
){

    if(!message){

        return null;

    }


    if(
        message.type === "system"
    ){

        return createSystemChatElement(
            message
        );

    }


    if(
        message.type === "roll"
    ){

        return createRollChatElement(
            message
        );

    }


    return createNormalChatElement(
        message
    );

}

function createNormalChatElement(
    message
){

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "chat-message";


    const avatar =
        document.createElement(
            "div"
        );


    avatar.className =
        "chat-message-avatar";


    if(message.photo){

        const image =
            document.createElement(
                "img"
            );


        image.src =
            message.photo;


        image.alt =
            message.author ||
            "Personagem";


        avatar.appendChild(
            image
        );

    }
    else{

        avatar.textContent =
            message.role === "master"
                ? "♛"
                : "◇";

    }


    const body =
        document.createElement(
            "div"
        );


    body.className =
        "chat-message-body";


    body.innerHTML = `

        <strong>
            ${escapeTableHTML(
                message.author ||
                "Jogador"
            )}
        </strong>

        <p>
            ${escapeTableHTML(
                message.text ||
                ""
            )}
        </p>

        <span class="chat-message-time">

            ${formatPublicChatTime(
                message.createdAt
            )}

        </span>

    `;


    element.append(
        avatar,
        body
    );


    return element;

}


function createSystemChatElement(
    message
){

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "chat-system-message";


    element.innerHTML = `

        <span class="chat-system-icon">
            ◇
        </span>

        <div>

            <strong>
                Sistema
            </strong>

            <p>
                ${escapeTableHTML(
                    message.text ||
                    ""
                )}
            </p>

            <span class="chat-message-time">

                ${formatPublicChatTime(
                    message.createdAt
                )}

            </span>

        </div>

    `;


    return element;

}

function createRollChatElement(
    message
){

    const element =
        document.createElement(
            "div"
        );


    element.className =
        "chat-roll-message";


    element.innerHTML = `

        <div class="chat-roll-header">

            <strong>
                ${escapeTableHTML(
                    message.author ||
                    "Jogador"
                )}
            </strong>

            <span class="chat-roll-label">

                ${escapeTableHTML(
                    message.label ||
                    "Rolagem"
                )}

            </span>

        </div>

        <div class="chat-roll-result">

            <span class="chat-roll-total">

                ${Number(
                    message.total
                ) || 0}

            </span>

            <span class="chat-roll-formula">

                ${escapeTableHTML(
                    message.formula ||
                    ""
                )}

            </span>

        </div>

        <div class="chat-roll-detail">

            ${escapeTableHTML(
                message.detail ||
                ""
            )}

        </div>

        <span class="chat-message-time">

            ${formatPublicChatTime(
                message.createdAt
            )}

        </span>

    `;


    return element;

}

function formatPublicChatTime(
    timestamp
){

    const date =
        new Date(
            Number(timestamp) ||
            Date.now()
        );


    return date.toLocaleTimeString(
        "pt-BR",
        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}