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

    /*==========================================================
=                    SISTEMA DE RPG
==========================================================*/

const campaignSystem =
    document.getElementById(
        "campaignSystem"
    );


const campaignSystemPreview =
    document.getElementById(
        "campaignSystemPreview"
    );


const campaignSystemIcon =
    document.getElementById(
        "campaignSystemIcon"
    );


const campaignSystemName =
    document.getElementById(
        "campaignSystemName"
    );


const campaignSystemDescription =
    document.getElementById(
        "campaignSystemDescription"
    );


const campaignSystemWarning =
    document.getElementById(
        "campaignSystemWarning"
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

    const campaignMasterPassword =
    document.getElementById(
        "campaignMasterPassword"
    );

const campaignMasterPasswordConfirm =
    document.getElementById(
        "campaignMasterPasswordConfirm"
    );

const showMasterPassword =
    document.getElementById(
        "showMasterPassword"
    );

const masterPasswordStrengthFill =
    document.getElementById(
        "masterPasswordStrengthFill"
    );

const masterPasswordStrengthText =
    document.getElementById(
        "masterPasswordStrengthText"
    );


/*==========================================================
=                    INICIALIZAÇÃO
==========================================================*/
function initCampaignEditor(){

    loadCampaigns();

    populateCampaignSystemSelect();

    discoverEditingCampaign();

    bindEvents();

    updateDescriptionCounter();

    updateCampaignSystemPreview();

}

/*==========================================================
=              PREENCHER SISTEMAS DA CAMPANHA
==========================================================*/

function populateCampaignSystemSelect(){

    if(
        !campaignSystem ||
        typeof getAllRPGSystems !==
        "function"
    ){

        return;

    }


    const systems =
        getAllRPGSystems();


    campaignSystem.innerHTML =
        "";


    systems.forEach(system => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            system.id;


        option.textContent =
            system.enabled
                ? system.name
                : `${system.name} — Em desenvolvimento`;


        /*
            Sistemas futuros aparecem,
            mas ainda não podem ser selecionados.
        */

        option.disabled =
            system.enabled !== true;


        campaignSystem.appendChild(
            option
        );

    });


    campaignSystem.value =
        DEFAULT_RPG_SYSTEM_ID;

}

/*==========================================================
=              PREVIEW DO SISTEMA
==========================================================*/

function updateCampaignSystemPreview(){

    if(!campaignSystem){

        return;

    }


    const system =
        getRPGSystem(
            campaignSystem.value
        );


    if(campaignSystemIcon){

        campaignSystemIcon.textContent =
            system.icon || "◇";


        campaignSystemIcon.style.color =
            system.color || "";

    }


    if(campaignSystemName){

        campaignSystemName.textContent =
            system.name;

    }


    if(campaignSystemDescription){

        campaignSystemDescription.textContent =
            system.description || "";

    }


    if(campaignSystemPreview){

        campaignSystemPreview.style
            .setProperty(
                "--system-color",
                system.color ||
                "#7B2CFF"
            );

    }

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

    campaignSystem?.addEventListener(
    "change",
    () => {

        updateCampaignSystemPreview();

        markUnsaved();

    }
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

    campaignMasterPassword?.addEventListener(
    "input",
    () => {

        updateMasterPasswordStrength();

        markUnsaved();

    }
);

campaignMasterPasswordConfirm?.addEventListener(
    "input",
    markUnsaved
);

showMasterPassword?.addEventListener(
    "change",
    () => {

        const type =
            showMasterPassword.checked
                ? "text"
                : "password";

        campaignMasterPassword.type =
            type;

        campaignMasterPasswordConfirm.type =
            type;

    }
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

        const editingSystemId =
    normalizeRPGSystemId(
        editingCampaign.systemId
    );


if(campaignSystem){

    campaignSystem.value =
        editingSystemId;

}


updateCampaignSystemPreview();

const campaignPlayers =
    Array.isArray(
        editingCampaign.players
    )
        ? editingCampaign.players
        : [];


const systemIsLocked =
    campaignPlayers.length > 0;


if(campaignSystem){

    campaignSystem.disabled =
        systemIsLocked;

}


campaignSystemWarning
    ?.classList
    .toggle(
        "hidden",
        !systemIsLocked
    );

    inviteCode.textContent =
        editingCampaign.inviteCode;

    if(editingCampaign.cover){

        showCoverImage(
            editingCampaign.cover
        );

    }

    campaignMasterPassword.value =
    editingCampaign.masterPassword || "";

campaignMasterPasswordConfirm.value =
    editingCampaign.masterPassword || "";

updateMasterPasswordStrength();

}

/*==========================================================
=          FORÇA DA SENHA DO MESTRE
==========================================================*/

function updateMasterPasswordStrength(){

    if(
        !campaignMasterPassword ||
        !masterPasswordStrengthFill ||
        !masterPasswordStrengthText
    ){

        return;

    }

    const password =
        campaignMasterPassword.value;

    let strength = 0;

    if(password.length >= 4){
        strength++;
    }

    if(password.length >= 8){
        strength++;
    }

    if(/[A-Z]/.test(password)){
        strength++;
    }

    if(/[0-9]/.test(password)){
        strength++;
    }

    if(/[^A-Za-z0-9]/.test(password)){
        strength++;
    }

    const percent =
        Math.min(
            strength * 20,
            100
        );

    masterPasswordStrengthFill.style.width =
        `${percent}%`;

    if(password.length === 0){

        masterPasswordStrengthText.textContent =
            "Nenhuma senha definida";

        return;

    }

    if(strength <= 1){

        masterPasswordStrengthText.textContent =
            "Senha fraca";

    }
    else if(strength <= 3){

        masterPasswordStrengthText.textContent =
            "Senha média";

    }
    else{

        masterPasswordStrengthText.textContent =
            "Senha forte";

    }

}


/*==========================================================
=              CARREGAR STORAGE
==========================================================*/

function loadCampaigns(){

    try{

        const savedCampaigns =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                )
            );


        campaigns =
            Array.isArray(
                savedCampaigns
            )
                ? savedCampaigns
                : [];


        let changed =
            false;


        campaigns.forEach(campaign => {

            /*
                Toda campanha criada antes da
                implementação pertence ao
                Sistema Paranormal.
            */

            if(!campaign.systemId){

                campaign.systemId =
                    DEFAULT_RPG_SYSTEM_ID;

                changed =
                    true;

            }
            else{

                const normalized =
                    normalizeRPGSystemId(
                        campaign.systemId
                    );


                if(
                    normalized !==
                    campaign.systemId
                ){

                    campaign.systemId =
                        normalized;

                    changed =
                        true;

                }

            }

        });


        if(changed){

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    campaigns
                )
            );

        }

    }
    catch(error){

        console.error(
            "Erro ao carregar campanhas:",
            error
        );

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
    campaignSystem,
    campaignMaxPlayers,
    campaignVisibility

].forEach(element => {

    element?.addEventListener(
        "input",
        markUnsaved
    );

});


/*==========================================================
=                    SALVAR CAMPANHA
==========================================================*/

async function saveCampaign(){

    const name =
        campaignName?.value.trim() || "";

    const description =
        campaignDescription?.value.trim() || "";

    const maxPlayers =
        Number(
            campaignMaxPlayers?.value
        ) || 4;

    const visibility =
        campaignVisibility?.value ||
        "private";

        const selectedSystemId =
    normalizeRPGSystemId(
        campaignSystem?.value
    );


const selectedSystem =
    getRPGSystem(
        selectedSystemId
    );

    const masterPassword =
        campaignMasterPassword?.value || "";

    const masterPasswordConfirm =
        campaignMasterPasswordConfirm?.value || "";

    const currentInviteCode =
        inviteCode?.textContent?.trim() ||
        createInviteCode();


    /*======================================================
    =                    VALIDAÇÕES
    ======================================================*/

    if(!name){

        showEditorMessage(
            "Nome obrigatório",
            "Digite um nome para a campanha."
        );

        campaignName?.focus();

        return;

    }


    if(masterPassword.length < 4){

        showEditorMessage(
            "Senha do mestre",
            "A senha do mestre precisa ter pelo menos 4 caracteres."
        );

        campaignMasterPassword?.focus();

        return;

    }


    if(
        masterPassword !==
        masterPasswordConfirm
    ){

        showEditorMessage(
            "Senhas diferentes",
            "A confirmação da senha do mestre está diferente."
        );

        campaignMasterPasswordConfirm?.focus();

        return;

    }

    if(
    !isValidRPGSystem(
        selectedSystemId
    )
){

    showEditorMessage(
        "Sistema inválido",
        "Selecione um sistema de RPG válido."
    );

    campaignSystem?.focus();

    return;

}


if(
    !isRPGSystemEnabled(
        selectedSystemId
    )
){

    showEditorMessage(
        "Sistema indisponível",
        `${selectedSystem.name} ainda está em desenvolvimento.`
    );

    campaignSystem?.focus();

    return;

}


    /*======================================================
    =                    CAPA
    ======================================================*/

    let cover =
        editingCampaign?.cover || "";

    const file =
        campaignCoverInput?.files?.[0];

    if(file){

        try{

            cover =
                await fileToBase64(file);

        }
        catch(error){

            console.error(
                "Erro ao carregar imagem:",
                error
            );

            showEditorMessage(
                "Erro na imagem",
                "Não foi possível carregar a imagem da campanha."
            );

            return;

        }

    }


    /*======================================================
    =                    EDITANDO
    ======================================================*/

    if(editingCampaign){

        editingCampaign.name =
            name;

        editingCampaign.description =
            description;

        editingCampaign.maxPlayers =
            maxPlayers;

        editingCampaign.visibility =
            visibility;

            const existingPlayers =
    Array.isArray(
        editingCampaign.players
    )
        ? editingCampaign.players
        : [];


/*
    Se já houver jogadores,
    mantém o sistema antigo.
*/

if(existingPlayers.length === 0){

    editingCampaign.systemId =
        selectedSystemId;

}
else{

    editingCampaign.systemId =
        normalizeRPGSystemId(
            editingCampaign.systemId
        );

}

        editingCampaign.inviteCode =
            currentInviteCode;

        editingCampaign.masterPassword =
            masterPassword;

        editingCampaign.cover =
            cover;

        editingCampaign.updatedAt =
            Date.now();

    }


    /*======================================================
    =                    NOVA CAMPANHA
    ======================================================*/

    else{

        const newCampaign = {

            id:createCampaignId(),

            name:name,

            description:description,

            systemId:
    selectedSystemId,

            maxPlayers:maxPlayers,

            visibility:visibility,

            inviteCode:
                currentInviteCode,

            masterPassword:
                masterPassword,

            cover:cover,

            players:[],

            enemies:[],

            npcs:[],

            scene:"",

            music:"",

            musicVolume:.5,

            musicPlaying:false,

            createdAt:Date.now(),

            updatedAt:Date.now()

        };

        campaigns.unshift(
            newCampaign
        );

        editingCampaign =
            newCampaign;

    }


    /*======================================================
    =                    SALVAR
    ======================================================*/

    saveCampaignsToStorage();


    if(saveStatus){

        saveStatus.textContent =
            "Salvo";

    }


    /*======================================================
    =                    FINALIZAÇÃO
    ======================================================*/

    showEditorMessage(
        editingCampaign
            ? "Campanha salva"
            : "Campanha criada",

        "Sua campanha foi salva com sucesso.",

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