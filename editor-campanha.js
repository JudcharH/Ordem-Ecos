/*==========================================================
=              EDITOR-CAMPANHA.JS - PARTE 1
==========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    initCampaignEditor
);


/*==========================================================
=                    STORAGE
==========================================================*/

const STORAGE_KEY =
    "ordem_campaigns";


let campaigns = [];

let editingCampaign = null;


/*==========================================================
=                    ELEMENTOS
==========================================================*/

const editorTitle =
    document.getElementById(
        "editorTitle"
    );

const campaignName =
    document.getElementById(
        "campaignEditorName"
    );

const campaignDescription =
    document.getElementById(
        "campaignEditorDescription"
    );

const campaignMaxPlayers =
    document.getElementById(
        "campaignMaxPlayers"
    );

const campaignVisibility =
    document.getElementById(
        "campaignVisibility"
    );

const campaignCoverInput =
    document.getElementById(
        "campaignCoverInput"
    );

const campaignCoverPreview =
    document.getElementById(
        "campaignCoverPreview"
    );

const removeCampaignCover =
    document.getElementById(
        "removeCampaignCover"
    );

const inviteCode =
    document.getElementById(
        "campaignInviteCode"
    );

const copyInviteCode =
    document.getElementById(
        "copyInviteCode"
    );

const generateInviteCode =
    document.getElementById(
        "generateInviteCode"
    );

const saveButton =
    document.getElementById(
        "saveCampaignEditor"
    );

const descriptionCounter =
    document.getElementById(
        "descriptionCounter"
    );

const saveStatus =
    document.getElementById(
        "saveStatus"
    );


/*==========================================================
=                    INICIALIZAÇÃO
==========================================================*/

function initCampaignEditor(){

    loadCampaigns();

    discoverEditingCampaign();

    bindEvents();

    updateDescriptionCounter();

}


/*==========================================================
=                    EVENTOS
==========================================================*/

function bindEvents(){

    campaignDescription?.addEventListener(

        "input",

        updateDescriptionCounter

    );

    campaignCoverInput?.addEventListener(

        "change",

        updateCoverPreview

    );

    removeCampaignCover?.addEventListener(

        "click",

        removeCoverImage

    );

    generateInviteCode?.addEventListener(

        "click",

        generateNewInviteCode

    );

    copyInviteCode?.addEventListener(

        "click",

        copyCurrentInviteCode

    );

    saveButton?.addEventListener(

        "click",

        saveCampaign

    );

}


/*==========================================================
=              DESCOBRIR EDIÇÃO
==========================================================*/

function discoverEditingCampaign(){

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");

    if(!id){

        inviteCode.textContent =
            createInviteCode();

        return;

    }

    editingCampaign =
        campaigns.find(

            campaign =>

                campaign.id === id

        );

    if(!editingCampaign){

        inviteCode.textContent =
            createInviteCode();

        return;

    }

    loadCampaignData();

}


/*==========================================================
=              CARREGAR DADOS
==========================================================*/

function loadCampaignData(){

    editorTitle.textContent =
        "EDITAR CAMPANHA";

    campaignName.value =
        editingCampaign.name;

    campaignDescription.value =
        editingCampaign.description || "";

    campaignMaxPlayers.value =
        editingCampaign.maxPlayers || 4;

    campaignVisibility.value =
        editingCampaign.visibility || "private";

    inviteCode.textContent =
        editingCampaign.inviteCode;

    if(editingCampaign.cover){

        showCoverImage(
            editingCampaign.cover
        );

    }

}


/*==========================================================
=              CARREGAR STORAGE
==========================================================*/

function loadCampaigns(){

    try{

        campaigns =
            JSON.parse(

                localStorage.getItem(
                    STORAGE_KEY
                )

            ) || [];

    }

    catch{

        campaigns = [];

    }

}

/*==========================================================
=              EDITOR-CAMPANHA.JS - PARTE 2
==========================================================*/

/*==========================================================
=              CONTADOR DESCRIÇÃO
==========================================================*/

function updateDescriptionCounter(){

    if(
        !campaignDescription ||
        !descriptionCounter
    ){

        return;

    }

    const length =
        campaignDescription.value.length;

    descriptionCounter.textContent =
        `${length} / 800`;

}


/*==========================================================
=              PREVIEW DA CAPA
==========================================================*/

async function updateCoverPreview(){

    const file =
        campaignCoverInput?.files?.[0];

    if(!file){

        return;

    }

    const base64 =
        await fileToBase64(file);

    showCoverImage(base64);

}


/*==========================================================
=              MOSTRAR CAPA
==========================================================*/

function showCoverImage(src){

    if(!campaignCoverPreview){

        return;

    }

    campaignCoverPreview.innerHTML = "";

    const img =
        document.createElement("img");

    img.src = src;

    img.alt =
        "Capa da campanha";

    campaignCoverPreview.appendChild(img);

    removeCampaignCover
        ?.classList
        .remove("hidden");

}


/*==========================================================
=              REMOVER CAPA
==========================================================*/

function removeCoverImage(){

    if(!campaignCoverPreview){

        return;

    }

    campaignCoverPreview.innerHTML = `

        <div class="cover-placeholder">

            <span class="cover-icon">
                ✦
            </span>

            <strong>
                Adicionar imagem
            </strong>

            <small>
                PNG, JPG ou WEBP
            </small>

        </div>

    `;

    if(campaignCoverInput){

        campaignCoverInput.value = "";

    }

    if(editingCampaign){

        editingCampaign.cover = "";

    }

    removeCampaignCover
        ?.classList
        .add("hidden");

}


/*==========================================================
=              ARQUIVO PARA BASE64
==========================================================*/

function fileToBase64(file){

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
=              GERAR CÓDIGO
==========================================================*/

function createInviteCode(){

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for(let i=0;i<8;i++){

        const index =
            Math.floor(
                Math.random() *
                chars.length
            );

        code += chars[index];

    }

    return code;

}


/*==========================================================
=              GERAR NOVO CÓDIGO
==========================================================*/

function generateNewInviteCode(){

    if(!inviteCode){

        return;

    }

    inviteCode.textContent =
        createInviteCode();

    markUnsaved();

}


/*==========================================================
=              COPIAR CÓDIGO
==========================================================*/

async function copyCurrentInviteCode(){

    const code =
        inviteCode?.textContent?.trim();

    if(!code){

        return;

    }

    try{

        await navigator
            .clipboard
            .writeText(code);

        showEditorMessage(
            "Código copiado",
            `O código ${code} foi copiado.`
        );

    }
    catch{

        showEditorMessage(
            "Código de convite",
            code
        );

    }

}


/*==========================================================
=              MARCAR NÃO SALVO
==========================================================*/

function markUnsaved(){

    if(!saveStatus){

        return;

    }

    saveStatus.textContent =
        "Alterações não salvas";

}


/*==========================================================
=              OUVIR ALTERAÇÕES
==========================================================*/

[
    campaignName,
    campaignDescription,
    campaignMaxPlayers,
    campaignVisibility

].forEach(element => {

    element?.addEventListener(
        "input",
        markUnsaved
    );

});


/*==========================================================
=              SALVAR CAMPANHA
==========================================================*/

async function saveCampaign(){

    const name =
        campaignName?.value.trim();

    const description =
        campaignDescription?.value.trim() || "";

    const maxPlayers =
        Number(
            campaignMaxPlayers?.value
        ) || 4;

    const visibility =
        campaignVisibility?.value ||
        "private";

    const currentInviteCode =
        inviteCode?.textContent?.trim() ||
        createInviteCode();

    if(!name){

        showEditorMessage(
            "Nome obrigatório",
            "Digite um nome para a campanha antes de salvar."
        );

        campaignName?.focus();

        return;

    }

    let cover =
        editingCampaign?.cover || "";

    const file =
        campaignCoverInput?.files?.[0];

    if(file){

        cover =
            await fileToBase64(file);

    }

    if(editingCampaign){

        editingCampaign.name =
            name;

        editingCampaign.description =
            description;

        editingCampaign.maxPlayers =
            maxPlayers;

        editingCampaign.visibility =
            visibility;

        editingCampaign.inviteCode =
            currentInviteCode;

        editingCampaign.cover =
            cover;

        editingCampaign.updatedAt =
            Date.now();

    }
    else{

        const newCampaign = {

            id:createCampaignId(),

            name,

            description,

            maxPlayers,

            visibility,

            inviteCode:
                currentInviteCode,

            cover,

            players:[],

            enemies:[],

            npcs:[],

            scene:"",

            music:"",

            createdAt:
                Date.now(),

            updatedAt:
                Date.now()

        };

        campaigns.unshift(
            newCampaign
        );

    }

    saveCampaignsToStorage();

    if(saveStatus){

        saveStatus.textContent =
            "Salvo";

    }

    showEditorMessage(
        editingCampaign
            ? "Campanha atualizada"
            : "Campanha criada",
        "As alterações foram salvas com sucesso.",
        true
    );

}


/*==========================================================
=              GERAR ID
==========================================================*/

function createCampaignId(){

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
=              SALVAR STORAGE
==========================================================*/

function saveCampaignsToStorage(){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(campaigns)
    );

}


/*==========================================================
=              MENSAGEM DO EDITOR
==========================================================*/

function showEditorMessage(
    title,
    text,
    redirectAfter = false
){

    const modal =
        document.getElementById(
            "editorMessage"
        );

    const titleElement =
        document.getElementById(
            "editorMessageTitle"
        );

    const textElement =
        document.getElementById(
            "editorMessageText"
        );

    const closeButton =
        document.getElementById(
            "closeEditorMessage"
        );

    if(
        !modal ||
        !titleElement ||
        !textElement ||
        !closeButton
    ){

        if(redirectAfter){

            window.location.href =
                "campanhas.html";

        }

        return;

    }

    titleElement.textContent =
        title;

    textElement.textContent =
        text;

    modal.classList.remove(
        "hidden"
    );

    const newButton =
        closeButton.cloneNode(true);

    closeButton.replaceWith(
        newButton
    );

    newButton.addEventListener(
        "click",
        () => {

            modal.classList.add(
                "hidden"
            );

            if(redirectAfter){

                window.location.href =
                    "campanhas.html";

            }

        }
    );

}