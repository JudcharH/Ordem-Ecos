/*==========================================================
=                    FICHAS.JS - PARTE 1
==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    initCharacters();

});


/*==========================================================
=                    ESTADO
==========================================================*/

let characters = [];

const CHARACTER_STORAGE_KEY = "ordem_characters";


/*==========================================================
=                    ELEMENTOS
==========================================================*/

const characterList =
    document.getElementById("characterList");

const newCharacterButton =
    document.getElementById("newCharacter");

const searchCharacterInput =
    document.getElementById("searchCharacter");

const newCharacterModal =
    document.getElementById("newCharacterModal");

const characterNameInput =
    document.getElementById("characterName");

const characterClassInput =
    document.getElementById("characterClass");

const characterOriginInput =
    document.getElementById("characterOrigin");

const characterPhotoInput =
    document.getElementById("characterPhoto");

const createCharacterButton =
    document.getElementById("createCharacter");

const cancelCharacterButton =
    document.getElementById("cancelCharacter");


/*==========================================================
=                    INICIALIZAÇÃO
==========================================================*/

function initCharacters(){

    loadCharacters();

    renderCharacters();

    bindCharacterEvents();

}


/*==========================================================
=                    EVENTOS
==========================================================*/

function bindCharacterEvents(){

    if(newCharacterButton){

        newCharacterButton.addEventListener(
            "click",
            openCreateCharacter
        );

    }

    if(cancelCharacterButton){

        cancelCharacterButton.addEventListener(
            "click",
            closeCreateCharacter
        );

    }

    if(createCharacterButton){

        createCharacterButton.addEventListener(
            "click",
            createCharacter
        );

    }

    if(searchCharacterInput){

        searchCharacterInput.addEventListener(
            "input",
            event => {

                renderCharacters(
                    event.target.value
                );

            }
        );

    }

    if(newCharacterModal){

        newCharacterModal.addEventListener(
            "click",
            event => {

                if(event.target === newCharacterModal){

                    closeCreateCharacter();

                }

            }
        );

    }

}


/*==========================================================
=                    ABRIR CRIAÇÃO
==========================================================*/

function openCreateCharacter(){

    window.location.href = "editor-ficha.html";

}


/*==========================================================
=                    FECHAR
==========================================================*/

function closeCreateCharacter(){

    if(!newCharacterModal){

        return;

    }

    newCharacterModal.classList.add(
        "hidden"
    );

    clearCharacterForm();

}


/*==========================================================
=                    LIMPAR
==========================================================*/

function clearCharacterForm(){

    if(characterNameInput){

        characterNameInput.value = "";

    }

    if(characterClassInput){

        characterClassInput.value = "";

    }

    if(characterOriginInput){

        characterOriginInput.value = "";

    }

    if(characterPhotoInput){

        characterPhotoInput.value = "";

    }

}


/*==========================================================
=                    CRIAR FICHA
==========================================================*/

async function createCharacter(){

    const name =
        characterNameInput?.value.trim() || "";

    const characterClass =
        characterClassInput?.value.trim() || "";

    const origin =
        characterOriginInput?.value.trim() || "";

    if(!name){

        alert("Digite o nome do personagem.");

        characterNameInput?.focus();

        return;

    }

    let photo = "";

    const file =
        characterPhotoInput?.files?.[0];

    if(file){

        photo = await fileToBase64(file);

    }

    const character = {

        id:createCharacterId(),

        name,

        class:characterClass,

        origin,

        level:1,

        photo,

        campaignId:null,

        attributes:{

            for:1,

            agi:1,

            int:1,

            vig:1,

            pre:1

        },

        status:{

            pvAtual:0,

            pvMax:0,

            pdAtual:0,

            pdMax:0,

            paAtual:0,

            paMax:0

        },

        inventory:[],

        conditions:[],

        assimilations:[],

        abilities:[],

        grimoire:[],

        attacks:[],

        notes:"",

        createdAt:Date.now(),

        updatedAt:Date.now()

    };

    characters.unshift(character);

    saveCharacters();

    renderCharacters();

    closeCreateCharacter();

}





/*==========================================================
=                    GERAR ID
==========================================================*/

function createCharacterId(){

    if(
        typeof crypto !== "undefined" &&
        crypto.randomUUID
    ){

        return crypto.randomUUID();

    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );

}


/*==========================================================
=                    IMAGEM BASE64
==========================================================*/

function fileToBase64(file){

    return new Promise((resolve,reject) => {

        const reader =
            new FileReader();

        reader.onload = () => {

            resolve(reader.result);

        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}


/*==========================================================
=                    SALVAR
==========================================================*/

function saveCharacters(){

    localStorage.setItem(
        CHARACTER_STORAGE_KEY,
        JSON.stringify(characters)
    );

}


/*==========================================================
=                    CARREGAR
==========================================================*/

function loadCharacters(){

    try{

        const saved =
            localStorage.getItem(
                CHARACTER_STORAGE_KEY
            );

        characters =
            saved
                ? JSON.parse(saved)
                : [];

        if(!Array.isArray(characters)){

            characters = [];

        }

    }
    catch(error){

        console.error(
            "Erro ao carregar fichas:",
            error
        );

        characters = [];

    }

}

/*==========================================================
=                    FICHAS.JS - PARTE 2
==========================================================*/

/*==========================================================
=                  RENDERIZAR FICHAS
==========================================================*/

function renderCharacters(search = ""){

    if(!characterList){

        return;

    }

    const term =
        search.trim().toLowerCase();

    const filteredCharacters =
        characters.filter(character => {

            const name =
                character.name?.toLowerCase() || "";

            const origin =
                character.origin?.toLowerCase() || "";

            const characterClass =
                character.class?.toLowerCase() || "";

            return (
                name.includes(term) ||
                origin.includes(term) ||
                characterClass.includes(term)
            );

        });

    characterList.innerHTML = "";

    if(filteredCharacters.length === 0){

        renderEmptyCharacters(term);

        return;

    }

    filteredCharacters.forEach(character => {

        const card =
            createCharacterCard(character);

        characterList.appendChild(card);

    });

}


/*==========================================================
=                    ESTADO VAZIO
==========================================================*/

function renderEmptyCharacters(searchTerm = ""){

    const empty =
        document.createElement("div");

    empty.className =
        "empty-characters";

    if(searchTerm){

        empty.innerHTML = `

            <div class="icon">🔎</div>

            <h3>
                Nenhuma ficha encontrada
            </h3>

            <p>
                Nenhuma ficha corresponde a
                "<strong>${escapeCharacterHTML(searchTerm)}</strong>".
            </p>

        `;

    }
    else{

        empty.innerHTML = `

            <div class="icon">👤</div>

            <h3>
                Nenhuma ficha criada
            </h3>

            <p>
                Crie seu primeiro personagem para começar.
            </p>

        `;

    }

    characterList.appendChild(empty);

}


/*==========================================================
=                    CRIAR CARD
==========================================================*/

function createCharacterCard(character){

    const card =
        document.createElement("article");

    card.className =
        "character-card";

    card.dataset.characterId =
        character.id;

    const photo =
        document.createElement("div");

    photo.className =
        "character-photo";

    if(character.photo){

        const image =
            document.createElement("img");

        image.src =
            character.photo;

        image.alt =
            character.name || "Personagem";

        photo.appendChild(image);

    }
    else{

        photo.textContent = "👤";

    }

    const info =
        document.createElement("div");

    info.className =
        "character-info";

    info.innerHTML = `

        <h2>
            ${escapeCharacterHTML(character.name)}
        </h2>

        <p>
            ${
                character.origin
                    ? escapeCharacterHTML(character.origin)
                    : "Sem origem"
            }
        </p>

        <p>
            Nível ${Number(character.level) || 1}
        </p>

    `;

    const buttons =
        document.createElement("div");

    buttons.className =
        "character-buttons";

    const openButton =
        document.createElement("button");

    openButton.className =
        "campaign-button";

    openButton.textContent =
        "Abrir Ficha";

    openButton.addEventListener(
        "click",
        () => openCharacter(character.id)
    );

    const editButton =
        document.createElement("button");

    editButton.className =
        "edit-button";

    editButton.textContent =
        "Editar";

    editButton.addEventListener(
        "click",
        () => editCharacter(character.id)
    );

    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "delete-character-button";

    deleteButton.textContent =
        "Excluir";

    deleteButton.addEventListener(
        "click",
        () => deleteCharacter(character.id)
    );

    buttons.append(
        openButton,
        editButton,
        deleteButton
    );

    card.append(
        photo,
        info,
        buttons
    );

    return card;

}


/*==========================================================
=                    ABRIR FICHA
==========================================================*/

function openCharacter(id){

    const character =
        characters.find(
            character =>
                character.id === id
        );

    if(!character){

        return;

    }

    localStorage.setItem(
        "ordem_current_character",
        id
    );

    /*
        Quando criarmos o editor completo da ficha,
        este endereço será usado.
    */

    window.location.href =
        `personagem.html?character=${encodeURIComponent(id)}`;

}


/*==========================================================
=                    EDITAR FICHA
==========================================================*/

function editCharacter(id){

    const character =
        characters.find(
            character =>
                character.id === id
        );

    if(!character){

        return;

    }

    const newName = prompt(
        "Nome do personagem:",
        character.name
    );

    if(newName === null){

        return;

    }

    const cleanName =
        newName.trim();

    if(!cleanName){

        alert(
            "O nome não pode ficar vazio."
        );

        return;

    }

    const newOrigin = prompt(
        "Origem:",
        character.origin || ""
    );

    if(newOrigin === null){

        return;

    }

    character.name =
        cleanName;

    character.origin =
        newOrigin.trim();

    character.updatedAt =
        Date.now();

    saveCharacters();

    renderCharacters(
        searchCharacterInput?.value || ""
    );

}


/*==========================================================
=                    EXCLUIR FICHA
==========================================================*/

function deleteCharacter(id){

    const character =
        characters.find(
            character =>
                character.id === id
        );

    if(!character){

        return;

    }

    const confirmed =
        confirm(
            `Excluir a ficha "${character.name}"?\n\nEssa ação não poderá ser desfeita.`
        );

    if(!confirmed){

        return;

    }

    characters =
        characters.filter(
            character =>
                character.id !== id
        );

    saveCharacters();

    renderCharacters(
        searchCharacterInput?.value || ""
    );

}


/*==========================================================
=                    ESC FECHA MODAL
==========================================================*/

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape" &&
            newCharacterModal &&
            !newCharacterModal.classList.contains("hidden")
        ){

            closeCreateCharacter();

        }

    }
);


/*==========================================================
=                    PROTEÇÃO HTML
==========================================================*/

function escapeCharacterHTML(value){

    return String(value)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");

}


/*==========================================================
=                    API
==========================================================*/

window.CharacterAPI = {

    getAll(){

        return [...characters];

    },

    getById(id){

        return characters.find(
            character =>
                character.id === id
        ) || null;

    },

    getCurrentId(){

        const params =
            new URLSearchParams(
                window.location.search
            );

        return (
            params.get("character") ||
            localStorage.getItem(
                "ordem_current_character"
            )
        );

    },

    update(id,changes){

        const index =
            characters.findIndex(
                character =>
                    character.id === id
            );

        if(index === -1){

            return false;

        }

        characters[index] = {

            ...characters[index],

            ...changes,

            id:characters[index].id,

            updatedAt:Date.now()

        };

        saveCharacters();

        renderCharacters(
            searchCharacterInput?.value || ""
        );

        return true;

    },

    remove(id){

        deleteCharacter(id);

    },

    reload(){

        loadCharacters();

        renderCharacters();

    }

};

/*==========================================================
=                    FICHAS.JS - PARTE 3
==========================================================*/

/*==========================================================
=              CAMPANHAS DISPONÍVEIS
==========================================================*/

function getAvailableCampaigns(){

    try{

        const saved =
            localStorage.getItem(
                "ordem_campaigns"
            );

        const campaigns =
            saved
                ? JSON.parse(saved)
                : [];

        return Array.isArray(campaigns)
            ? campaigns
            : [];

    }
    catch(error){

        console.error(
            "Erro ao carregar campanhas:",
            error
        );

        return [];

    }

}


/*==========================================================
=          ESCOLHER CAMPANHA PARA A FICHA
==========================================================*/

function assignCharacterToCampaign(characterId){

    const character =
        characters.find(
            character =>
                character.id === characterId
        );

    if(!character){

        return;

    }

    const campaigns =
        getAvailableCampaigns();

    if(campaigns.length === 0){

        showCharacterMessage(
            "Nenhuma campanha disponível",
            "Crie uma campanha primeiro para poder adicionar esta ficha."
        );

        return;

    }

    openCampaignSelector(
        character,
        campaigns
    );

}


/*==========================================================
=          SELETOR VISUAL DE CAMPANHA
==========================================================*/

function openCampaignSelector(
    character,
    campaigns
){

    closeCampaignSelector();

    const overlay =
        document.createElement("div");

    overlay.id =
        "campaignSelectorModal";

    overlay.className =
        "game-modal";

    const panel =
        document.createElement("div");

    panel.className =
        "game-modal-content";

    panel.innerHTML = `

        <div class="game-modal-header">

            <div>

                <span class="game-modal-label">
                    VINCULAR PERSONAGEM
                </span>

                <h2>
                    Escolha uma campanha
                </h2>

                <p>
                    Selecione onde
                    <strong>${escapeCharacterHTML(character.name)}</strong>
                    será utilizado.
                </p>

            </div>

            <button
                type="button"
                class="game-modal-close"
                id="closeCampaignSelector">

                ✕

            </button>

        </div>

        <div
            id="campaignSelectorList"
            class="campaign-selector-list">
        </div>

    `;

    overlay.appendChild(panel);

    document.body.appendChild(overlay);

    const list =
        panel.querySelector(
            "#campaignSelectorList"
        );

    campaigns.forEach(campaign => {

        const option =
            document.createElement("button");

        option.type =
            "button";

        option.className =
            "campaign-selector-card";

        const playerCount =
            Array.isArray(campaign.players)
                ? campaign.players.length
                : 0;

        option.innerHTML = `

            <div class="campaign-selector-icon">
                🗡
            </div>

            <div class="campaign-selector-info">

                <strong>
                    ${escapeCharacterHTML(campaign.name)}
                </strong>

                <span>
                    ${playerCount}
                    ${playerCount === 1 ? "jogador" : "jogadores"}
                </span>

            </div>

            <div class="campaign-selector-arrow">
                →
            </div>

        `;

        option.addEventListener(
            "click",
            () => {

                connectCharacterToCampaign(
                    character,
                    campaign
                );

                closeCampaignSelector();

            }
        );

        list.appendChild(option);

    });

    panel
        .querySelector(
            "#closeCampaignSelector"
        )
        .addEventListener(
            "click",
            closeCampaignSelector
        );

    overlay.addEventListener(
        "click",
        event => {

            if(event.target === overlay){

                closeCampaignSelector();

            }

        }
    );

}


/*==========================================================
=          CONECTAR PERSONAGEM
==========================================================*/

function connectCharacterToCampaign(
    character,
    campaign
){

    character.campaignId =
        campaign.id;

    character.updatedAt =
        Date.now();

    saveCharacters();

    addCharacterToCampaign(
        character,
        campaign
    );

    renderCharacters(
        searchCharacterInput?.value || ""
    );

    showCharacterMessage(
        "Ficha adicionada",
        `${character.name} agora está vinculado à campanha ${campaign.name}.`
    );

}


/*==========================================================
=          FECHAR SELETOR
==========================================================*/

function closeCampaignSelector(){

    document
        .getElementById(
            "campaignSelectorModal"
        )
        ?.remove();

}


/*==========================================================
=          MENSAGEM DO SISTEMA
==========================================================*/

function showCharacterMessage(
    title,
    message
){

    document
        .getElementById(
            "characterMessageModal"
        )
        ?.remove();

    const overlay =
        document.createElement("div");

    overlay.id =
        "characterMessageModal";

    overlay.className =
        "game-modal";

    overlay.innerHTML = `

        <div class="game-message">

            <div class="game-message-icon">
                ◈
            </div>

            <h2>
                ${escapeCharacterHTML(title)}
            </h2>

            <p>
                ${escapeCharacterHTML(message)}
            </p>

            <button
                type="button"
                class="primary-button"
                id="closeCharacterMessage">

                Continuar

            </button>

        </div>

    `;

    document.body.appendChild(
        overlay
    );

    overlay
        .querySelector(
            "#closeCharacterMessage"
        )
        .addEventListener(
            "click",
            () => overlay.remove()
        );

}


/*==========================================================
=          ADICIONAR PERSONAGEM NA CAMPANHA
==========================================================*/

function addCharacterToCampaign(
    character,
    campaign
){

    const campaigns =
        getAvailableCampaigns();

    const campaignIndex =
        campaigns.findIndex(
            item =>
                item.id === campaign.id
        );

    if(campaignIndex === -1){

        return;

    }

    if(
        !Array.isArray(
            campaigns[campaignIndex].players
        )
    ){

        campaigns[campaignIndex].players = [];

    }

    const exists =
        campaigns[campaignIndex]
            .players
            .some(
                player =>
                    player.characterId ===
                    character.id
            );

    if(!exists){

        campaigns[campaignIndex]
            .players
            .push({

                characterId:character.id,

                name:character.name,

                photo:character.photo || "",

                position:null

            });

    }

    localStorage.setItem(
        "ordem_campaigns",
        JSON.stringify(campaigns)
    );

}


/*==========================================================
=              REMOVER DA CAMPANHA
==========================================================*/

function removeCharacterFromCampaign(characterId){

    const character =
        characters.find(
            character =>
                character.id === characterId
        );

    if(!character){

        return;

    }

    if(!character.campaignId){

        return;

    }

    const campaigns =
        getAvailableCampaigns();

    const campaign =
        campaigns.find(
            item =>
                item.id ===
                character.campaignId
        );

    if(campaign){

        campaign.players =
            Array.isArray(campaign.players)
                ? campaign.players.filter(
                    player =>
                        player.characterId !==
                        character.id
                )
                : [];

        localStorage.setItem(
            "ordem_campaigns",
            JSON.stringify(campaigns)
        );

    }

    character.campaignId = null;

    character.updatedAt =
        Date.now();

    saveCharacters();

    renderCharacters(
        searchCharacterInput?.value || ""
    );

}


/*==========================================================
=              CAMPANHA DA FICHA
==========================================================*/

function getCharacterCampaign(character){

    if(!character.campaignId){

        return null;

    }

    const campaigns =
        getAvailableCampaigns();

    return campaigns.find(
        campaign =>
            campaign.id ===
            character.campaignId
    ) || null;

}


/*==========================================================
=              ADICIONAR BOTÃO CAMPANHA
==========================================================*/

const originalCreateCharacterCard =
    createCharacterCard;

createCharacterCard = function(character){

    const card =
        originalCreateCharacterCard(
            character
        );

    const buttons =
        card.querySelector(
            ".character-buttons"
        );

    if(!buttons){

        return card;

    }

    const campaign =
        getCharacterCampaign(
            character
        );

    const campaignButton =
        document.createElement("button");

    campaignButton.className =
        "character-campaign-button";

    if(campaign){

        campaignButton.textContent =
            `Campanha: ${campaign.name}`;

        campaignButton.addEventListener(
            "click",
            () => {

                const remove =
                    confirm(
                        `Remover "${character.name}" da campanha "${campaign.name}"?`
                    );

                if(remove){

                    removeCharacterFromCampaign(
                        character.id
                    );

                }

            }
        );

    }
    else{

        campaignButton.textContent =
            "Adicionar à Campanha";

        campaignButton.addEventListener(
            "click",
            () => {

                assignCharacterToCampaign(
                    character.id
                );

            }
        );

    }

    buttons.appendChild(
        campaignButton
    );

    return card;

};


/*==========================================================
=              ESTILOS EXTRAS
==========================================================*/

function injectCharacterStyles(){

    if(
        document.getElementById(
            "characterDynamicStyles"
        )
    ){

        return;

    }

    const style =
        document.createElement("style");

    style.id =
        "characterDynamicStyles";

    style.textContent = `

        .delete-character-button{

            background:#571B1B;

            color:#FFD6D6;

            border:1px solid #762929;

        }

        .delete-character-button:hover{

            background:#7C2828;

            border-color:#A13A3A;

        }

        .character-campaign-button{

            background:#202029;

            color:white;

            border:1px solid var(--border);

        }

        .character-campaign-button:hover{

            border-color:var(--primary);

            background:#292934;

        }

    `;

    document.head.appendChild(
        style
    );

}


/*==========================================================
=              INICIALIZAÇÃO EXTRA
==========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        injectCharacterStyles();

    }
);


/*==========================================================
=              API FINAL
==========================================================*/

window.CharacterAPI = {

    getAll(){

        return [...characters];

    },

    getById(id){

        return characters.find(
            character =>
                character.id === id
        ) || null;

    },

    getCurrentId(){

        const params =
            new URLSearchParams(
                window.location.search
            );

        return (
            params.get("character") ||
            localStorage.getItem(
                "ordem_current_character"
            )
        );

    },

    getCampaign(id){

        const character =
            characters.find(
                character =>
                    character.id === id
            );

        if(!character){

            return null;

        }

        return getCharacterCampaign(
            character
        );

    },

    assignCampaign(id){

        assignCharacterToCampaign(
            id
        );

    },

    removeFromCampaign(id){

        removeCharacterFromCampaign(
            id
        );

    },

    update(id,changes){

        const index =
            characters.findIndex(
                character =>
                    character.id === id
            );

        if(index === -1){

            return false;

        }

        characters[index] = {

            ...characters[index],

            ...changes,

            id:characters[index].id,

            updatedAt:Date.now()

        };

        saveCharacters();

        renderCharacters(
            searchCharacterInput?.value || ""
        );

        return true;

    },

    reload(){

        loadCharacters();

        renderCharacters();

    }

};