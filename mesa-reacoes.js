/*==========================================================
=        MESA - REAÇÕES AVANÇADAS E CONTRA-ATAQUES
==========================================================*/

(function(){

    "use strict";

    const CLICKABLE_REACTION_ABILITIES = [
        "desvio-absoluto",
        "revidar",
        "devolver-ataque"
    ];


    function normalizeId(value){

        return String(value || "")
            .trim()
            .toLowerCase();

    }


    function getAcquiredAbilityById(
        character,
        abilityId
    ){

        const id =
            normalizeId(abilityId);

        const abilities =
            typeof getCharacterAcquiredAbilities === "function"
                ? getCharacterAcquiredAbilities(character)
                : Array.isArray(character?.abilities)
                    ? character.abilities
                    : [];

        return abilities
            .map(ability =>
                typeof normalizeCharacterAbility === "function"
                    ? normalizeCharacterAbility(ability)
                    : ability
            )
            .find(ability =>
                normalizeId(
                    ability?.id ||
                    ability?.abilityId ||
                    ability?.name
                ) === id
            ) || null;

    }


    function characterHasAbility(
        character,
        abilityId
    ){

        return Boolean(
            getAcquiredAbilityById(
                character,
                abilityId
            )
        );

    }


    function getAbilityPACost(ability){

        const possibleCosts = [
            ability?.useCost,
            ability?.activationCost,
            ability?.cost
        ];

        const paCost =
            possibleCosts.find(cost =>
                cost &&
                normalizeId(cost.type) === "pa"
            );

        return Math.max(
            0,
            Number(paCost?.value) || 0
        );

    }


    function spendReactionPA(
        character,
        amount
    ){

        const cost =
            Math.max(0,Number(amount) || 0);

        if(!character.status){
            character.status = {};
        }

        const currentPA =
            Math.max(
                0,
                Number(character.status.paAtual) || 0
            );

        if(currentPA < cost){

            addSystemChatMessage(
                `${character.name || "O personagem"} não possui PA suficiente.`
            );

            return false;

        }

        character.status.paAtual =
            currentPA - cost;

        return saveDamagedCharacter(character);

    }


    function getAggressorCharacter(request){

        if(!request?.attackerCharacterId){
            return null;
        }

        return getLiveCharacter(
            request.attackerCharacterId
        );

    }


    function getCharacterDefense(character){

        return Math.max(
            0,
            Number(character?.defense?.total) || 0
        );

    }


    function getAttackFormula(attack){

        return (
            attack?.attack ||
            attack?.roll ||
            attack?.test ||
            attack?.formula ||
            "1d20"
        );

    }


    function getAttackDisplayFormula(attack){

        return String(
            getAttackFormula(attack)
        );

    }


    function finishOriginalAttackRequest(
        request,
        character,
        options = {}
    ){

        const baseDefense =
            getCharacterDefense(character);

        const baseRD =
            Math.max(
                0,
                Number(
                    character?.damageReduction?.total
                ) || 0
            );

        request.reaction = {
            type:
                options.reactionType ||
                "ability",
            abilityId:
                options.abilityId ||
                null,
            paCost:
                Math.max(
                    0,
                    Number(options.paCost) || 0
                ),
            baseDefense,
            finalDefense:
                baseDefense,
            baseRD,
            reactionRD:
                baseRD,
            answeredAt:
                Date.now()
        };

        request.hit =
            options.forceMiss === true
                ? false
                : Number(request.attackResult) >=
                    baseDefense;

        request.resolved = true;
        request.active = false;
        request.updatedAt = Date.now();

        if(request.hit){

            currentTableCampaign.combat.damageContext = {
                id:
                    `damage_${Date.now()}`,
                active:true,
                attackRequestId:
                    request.id,
                attackName:
                    request.attackName,
                attackerCharacterId:
                    request.attackerCharacterId || null,
                targetCharacterId:
                    character.id,
                targetName:
                    character.name || "Alvo",
                reaction:
                    options.reactionType || "ability",
                abilityId:
                    options.abilityId || null,
                damageReduction:
                    baseRD,
                flatReduction:
                    Math.max(
                        0,
                        Number(options.flatReduction) || 0
                    ),
                damageMultiplier:
                    Number.isFinite(
                        Number(options.damageMultiplier)
                    )
                        ? Math.max(
                            0,
                            Number(options.damageMultiplier)
                        )
                        : 1,
                consumed:false,
                createdAt:
                    Date.now()
            };

        }
        else{

            currentTableCampaign.combat.damageContext =
                null;

        }

        currentTableCampaign.combat.updatedAt =
            Date.now();

        markAttackMessageAsApplied(request);
        saveTableCampaign();
        closeCurrentPanel();
        refreshCurrentTableCharacter();
        refreshOpenCharacterPanel();
        renderPublicChat();
        publishAttackResult(request,character);

    }


    function addResolvedReactionAttackRoll({
        character,
        attack,
        attackIndex,
        result,
        target,
        label,
        hit,
        comparisonLabel,
        comparisonValue,
        abilityId
    }){

        addRollChatMessage(
            `${label} • ${attack.name || "Ataque"}`,
            result.formula,
            result.total,
            result.detail || "",
            {
                rollKind:"attack",
                attackIndex,
                attackName:
                    attack.name || "Ataque",
                applied:true,
                isCounterAttack:true,
                forcedTargetCharacterId:
                    target?.id || null
            }
        );

        refreshCurrentTableCampaign();

        const messages =
            Array.isArray(
                currentTableCampaign.chatMessages
            )
                ? currentTableCampaign.chatMessages
                : [];

        const message =
            [...messages]
                .reverse()
                .find(item =>
                    item.type === "roll" &&
                    item.characterId === character.id &&
                    item.attackName ===
                        (attack.name || "Ataque") &&
                    Number(item.total) ===
                        Number(result.total)
                );

        if(message){

            message.applied = true;
            message.attackApplication = {
                targetCharacterId:
                    target?.id || null,
                targetName:
                    target?.name || "Agressor",
                attackResult:
                    Number(result.total) || 0,
                finalDefense:
                    Number(comparisonValue) || 0,
                reaction:
                    abilityId,
                comparisonLabel,
                hit:
                    Boolean(hit)
            };

            saveTableCampaign();
            renderPublicChat();

        }

    }


    function rollPreparedReactionAttack(
        attack,
        attackIndex
    ){

        const rawFormula =
            getAttackFormula(attack);

        const formula =
            resolveCharacterFormula(
                rawFormula,
                currentTableCharacter
            );

        const roll =
            rollDiceExpression(formula);

        if(!roll){
            return null;
        }

        return {
            ...roll,
            formula
        };

    }


    function openReactionAttackChoice(
        abilityId,
        request
    ){

        const attacks =
            getCharacterReadyAttacks(
                currentTableCharacter
            );

        const aggressor =
            getAggressorCharacter(request);

        if(!aggressor){

            addSystemChatMessage(
                "O agressor não possui uma ficha válida para receber a reação."
            );

            return;

        }

        openTablePanel(
            "REAÇÃO",
            abilityId === "revidar"
                ? "Revidar"
                : "Devolver Ataque",
            `
                <div class="table-panel-card">
                    <h3>
                        Alvo: ${escapeTableHTML(
                            aggressor.name || "Agressor"
                        )}
                    </h3>
                    <p>
                        Escolha um dos ataques prontos da sua ficha.
                    </p>
                </div>

                <div class="table-panel-list">
                    ${
                        attacks.length
                            ? attacks.map((attack,index) => `
                                <button
                                    type="button"
                                    class="table-panel-card advanced-reaction-attack"
                                    data-index="${index}">
                                    <h3>
                                        ${escapeTableHTML(
                                            attack.name ||
                                            `Ataque ${index + 1}`
                                        )}
                                    </h3>
                                    <p>
                                        ${escapeTableHTML(
                                            getAttackDisplayFormula(attack)
                                        )}
                                    </p>
                                </button>
                            `).join("")
                            : `
                                <div class="editor-empty-state">
                                    <span>⚔</span>
                                    <p>Nenhum ataque pronto foi encontrado na ficha.</p>
                                </div>
                            `
                    }
                </div>
            `
        );

        document
            .querySelectorAll(
                ".advanced-reaction-attack"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(button.dataset.index);

                        resolveReactionAbilityAttack(
                            abilityId,
                            request,
                            attacks[index],
                            index,
                            aggressor
                        );

                    }
                );

            });

    }


    function resolveReactionAbilityAttack(
        abilityId,
        request,
        attack,
        attackIndex,
        aggressor
    ){

        if(!attack){
            return;
        }

        const result =
            rollPreparedReactionAttack(
                attack,
                attackIndex
            );

        if(!result){
            return;
        }

        if(abilityId === "revidar"){

            const aggressorDefense =
                getCharacterDefense(aggressor);

            const success =
                Number(result.total) >=
                aggressorDefense;

            addResolvedReactionAttackRoll({
                character:
                    currentTableCharacter,
                attack,
                attackIndex,
                result,
                target:
                    aggressor,
                label:
                    "Revidar",
                hit:
                    success,
                comparisonLabel:
                    "Defesa",
                comparisonValue:
                    aggressorDefense,
                abilityId
            });

            finishOriginalAttackRequest(
                request,
                currentTableCharacter,
                {
                    reactionType:"ability",
                    abilityId,
                    paCost:
                        request.reactionAbilityCost || 0,
                    damageMultiplier:
                        success ? 0.5 : 1
                }
            );

            addSystemChatMessage(
                success
                    ? `${currentTableCharacter.name} acertou Revidar. O dano do ataque original será reduzido pela metade após a RD.`
                    : `${currentTableCharacter.name} errou Revidar. O ataque original será resolvido normalmente.`
            );

            return;

        }

        const originalAttackResult =
            Number(request.attackResult) || 0;

        const success =
            Number(result.total) >
            originalAttackResult;

        addResolvedReactionAttackRoll({
            character:
                currentTableCharacter,
            attack,
            attackIndex,
            result,
            target:
                aggressor,
            label:
                "Devolver Ataque",
            hit:
                success,
            comparisonLabel:
                "Ataque original",
            comparisonValue:
                originalAttackResult,
            abilityId
        });

        finishOriginalAttackRequest(
            request,
            currentTableCharacter,
            {
                reactionType:"ability",
                abilityId,
                paCost:
                    request.reactionAbilityCost || 0,
                forceMiss:
                    success
            }
        );

        addSystemChatMessage(
            success
                ? `${currentTableCharacter.name} superou o ataque original com Devolver Ataque. O ataque foi anulado e a reação atingiu o agressor.`
                : `${currentTableCharacter.name} não superou o ataque original com Devolver Ataque.`
        );

    }


    /*======================================================
    =      LISTA CORRETA DE HABILIDADES CLICÁVEIS
    ======================================================*/

    openAttackReactionAbilityPanel = function(){

        refreshCurrentTableCharacter();

        const character =
            currentTableCharacter;

        const abilities =
            CLICKABLE_REACTION_ABILITIES
                .map(id =>
                    getAcquiredAbilityById(
                        character,
                        id
                    )
                )
                .filter(Boolean);

        if(!abilities.length){

            openTablePanel(
                "REAÇÃO",
                "Habilidades",
                `
                    <div class="editor-empty-state">
                        <span>◇</span>
                        <p>Nenhuma habilidade de reação disponível.</p>
                        <button
                            type="button"
                            id="returnToAttackReaction"
                            class="secondary-button">
                            Voltar
                        </button>
                    </div>
                `
            );

            document
                .getElementById(
                    "returnToAttackReaction"
                )
                ?.addEventListener(
                    "click",
                    () => {

                        const request =
                            currentTableCampaign
                                ?.combat
                                ?.pendingAttack;

                        if(request){
                            openAttackReactionPanel(request);
                        }

                    }
                );

            return;

        }

        const currentPA =
            Math.max(
                0,
                Number(character.status?.paAtual) || 0
            );

        openTablePanel(
            "REAÇÃO",
            "Escolher Habilidade",
            `
                <div class="table-panel-list">
                    ${abilities.map(ability => {

                        const paCost =
                            getAbilityPACost(ability);

                        return `
                            <button
                                type="button"
                                class="table-panel-card reaction-ability-choice"
                                data-ability-id="${escapeTableHTML(
                                    normalizeId(ability.id)
                                )}"
                                ${paCost > currentPA ? "disabled" : ""}>
                                <h3>
                                    ${escapeTableHTML(
                                        ability.name || "Habilidade"
                                    )}
                                </h3>
                                <p>
                                    ${escapeTableHTML(
                                        ability.description || ""
                                    )}
                                </p>
                                <span class="reaction-ability-cost">
                                    ${paCost} PA
                                </span>
                            </button>
                        `;

                    }).join("")}
                </div>
            `
        );

        document
            .querySelectorAll(
                ".reaction-ability-choice"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => selectAttackReactionAbility(
                        button.dataset.abilityId
                    )
                );

            });

    };


    /*======================================================
    =              EXECUTAR HABILIDADE
    ======================================================*/

    selectAttackReactionAbility = function(
        abilityId
    ){

        refreshCurrentTableCampaign();
        refreshCurrentTableCharacter();

        const request =
            currentTableCampaign
                ?.combat
                ?.pendingAttack;

        const character =
            currentTableCharacter;

        if(
            !request ||
            !character ||
            request.targetCharacterId !==
                character.id ||
            request.resolved === true
        ){
            return;
        }

        const id =
            normalizeId(abilityId);

        const ability =
            getAcquiredAbilityById(
                character,
                id
            );

        if(!ability){

            addSystemChatMessage(
                "A habilidade selecionada não foi encontrada na ficha."
            );

            return;

        }

        const paCost =
            getAbilityPACost(ability);

        if(!spendReactionPA(character,paCost)){
            return;
        }

        request.reactionAbilityCost =
            paCost;

        request.reactionAbilityId =
            id;

        if(id === "desvio-absoluto"){

            finishOriginalAttackRequest(
                request,
                character,
                {
                    reactionType:"ability",
                    abilityId:id,
                    paCost,
                    forceMiss:true
                }
            );

            addSystemChatMessage(
                `${character.name || "O personagem"} utilizou Desvio Absoluto. O ataque errou automaticamente.`
            );

            return;

        }

        currentTableCampaign.combat.reactionAbilityContext = {
            id:
                `reaction_${Date.now()}`,
            active:true,
            abilityId:id,
            originalAttackId:
                request.id,
            defenderCharacterId:
                character.id,
            aggressorCharacterId:
                request.attackerCharacterId || null,
            createdAt:
                Date.now()
        };

        saveTableCampaign();

        openReactionAttackChoice(
            id,
            request
        );

    };


    /*======================================================
    =       CONTRA-ATAQUE COM ALVO AUTOMÁTICO
    ======================================================*/

    const originalStartAttackTargetSelection =
        startAttackTargetSelection;

    startAttackTargetSelection = function(
        messageId
    ){

        refreshCurrentTableCampaign();

        const messages =
            Array.isArray(
                currentTableCampaign?.chatMessages
            )
                ? currentTableCampaign.chatMessages
                : [];

        const message =
            messages.find(item =>
                item.id === messageId
            );

        if(
            message?.forcedTargetCharacterId
        ){

            if(
                currentTableRole !== "master" &&
                message.characterId !==
                    currentTableCharacter?.id
            ){

                addSystemChatMessage(
                    "Você não pode aplicar o ataque de outro personagem."
                );

                return;

            }

            const target =
                getLiveCharacter(
                    message.forcedTargetCharacterId
                );

            if(!target){

                addSystemChatMessage(
                    "O agressor definido para o contra-ataque não foi encontrado."
                );

                return;

            }

            pendingAttackApplication = {
                messageId:
                    message.id,
                attackResult:
                    Math.max(
                        0,
                        Number(message.total) || 0
                    ),
                attackName:
                    message.attackName || "Ataque",
                attackIndex:
                    message.attackIndex ?? null,
                attackerCharacterId:
                    message.characterId || null,
                attackerName:
                    message.author || "Atacante"
            };

            createAttackReactionRequest(target);
            return;

        }

        originalStartAttackTargetSelection(
            messageId
        );

    };


    /*======================================================
    =          SEMPRE ALERTA AUTOMÁTICO NA ESQUIVA
    ======================================================*/

    const originalAnswerAttackReaction =
        answerAttackReaction;

    answerAttackReaction = function(
        reactionType
    ){

        const isDodge =
            reactionType === "dodge";

        const characterBefore =
            currentTableCharacter;

        const hasAlwaysAlert =
            isDodge &&
            characterHasAbility(
                characterBefore,
                "sempre-alerta"
            );

        const agility =
            Math.max(
                0,
                Number(
                    characterBefore?.attributes?.agi
                ) || 0
            );

        originalAnswerAttackReaction(
            reactionType
        );

        if(!hasAlwaysAlert){
            return;
        }

        refreshCurrentTableCampaign();

        const damageContext =
            currentTableCampaign
                ?.combat
                ?.damageContext;

        if(
            damageContext &&
            damageContext.active === true &&
            damageContext.targetCharacterId ===
                characterBefore?.id
        ){

            damageContext.flatReduction =
                agility * 2;

            damageContext.automaticAbility =
                "sempre-alerta";

            saveTableCampaign();

            addSystemChatMessage(
                `${characterBefore.name || "O personagem"} ativou Sempre Alerta: o dano deste ataque será reduzido em ${agility * 2}.`
            );

        }

    };


    /*======================================================
    =       APLICAR REDUÇÃO/MULTIPLICADOR NO DANO
    ======================================================*/

    const originalApplyClassicDamageToCharacter =
        applyClassicDamageToCharacter;

    applyClassicDamageToCharacter = function(
        character
    ){

        const context =
            currentTableCampaign
                ?.combat
                ?.damageContext;

        const matchesContext =
            context &&
            context.active === true &&
            context.consumed !== true &&
            context.targetCharacterId ===
                character?.id &&
            pendingDamageApplication;

        if(!matchesContext){

            originalApplyClassicDamageToCharacter(
                character
            );

            return;

        }

        const originalDamage =
            Math.max(
                0,
                Number(
                    pendingDamageApplication.damage
                ) || 0
            );

        const reactionRD =
            Math.max(
                0,
                Number(context.damageReduction) || 0
            );

        const flatReduction =
            Math.max(
                0,
                Number(context.flatReduction) || 0
            );

        const multiplier =
            Number.isFinite(
                Number(context.damageMultiplier)
            )
                ? Math.max(
                    0,
                    Number(context.damageMultiplier)
                )
                : 1;

        const afterRD =
            Math.max(
                0,
                originalDamage - reactionRD
            );

        const afterFlatReduction =
            Math.max(
                0,
                afterRD - flatReduction
            );

        const finalDamage =
            Math.floor(
                afterFlatReduction * multiplier
            );

        context.damageReduction =
            Math.max(
                0,
                originalDamage - finalDamage
            );

        context.calculation = {
            originalDamage,
            baseRD:reactionRD,
            flatReduction,
            multiplier,
            finalDamage
        };

        saveTableCampaign();

        originalApplyClassicDamageToCharacter(
            character
        );

    };


})();
