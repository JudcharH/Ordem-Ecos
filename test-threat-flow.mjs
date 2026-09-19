import fs from "node:fs";
import vm from "node:vm";

const listeners = new Map();
const storage = new Map();
const document = {
    addEventListener(type, handler) {
        const list = listeners.get(type) || [];
        list.push(handler);
        listeners.set(type, list);
    },
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() {
        return {
            classList: { add() {}, remove() {}, toggle() {} },
            appendChild() {},
            addEventListener() {},
            dataset: {},
            style: {}
        };
    },
    body: { appendChild() {} }
};

const context = vm.createContext({
    console,
    document,
    window: {
        location: { search: "", href: "" },
        addEventListener() {},
        setInterval() {},
        clearInterval() {}
    },
    localStorage: {
        getItem(key) { return storage.has(key) ? storage.get(key) : null; },
        setItem(key, value) { storage.set(key, String(value)); },
        removeItem(key) { storage.delete(key); }
    },
    URLSearchParams,
    Date,
    Math,
    JSON,
    Number,
    String,
    Array,
    Object,
    Map,
    Set,
    alert() {},
    confirm() { return true; },
    setTimeout() {},
    clearTimeout() {}
});

vm.runInContext(fs.readFileSync("mesa.js", "utf8"), context, { filename: "mesa.js" });

vm.runInContext(`
    let openedEnemy = null;
    let selectedEnemy = null;
    let saved = 0;
    openEnemyControlSheet = enemy => { openedEnemy = enemy; };
    openPositionSelector = (type, enemy) => { selectedEnemy = { type, enemy }; };
    closeCurrentPanel = () => {};
    closeCurrentPositionModal = () => {};
    renderCombatPositions = () => {};
    addSystemChatMessage = () => {};
    saveTableCampaign = () => { saved += 1; };
    currentTableRole = "master";
    currentTableCampaign = {
        id: "campaign-test",
        enemies: [{
            id: "enemy-instance-1",
            enemyId: "enemy-instance-1",
            templateId: 42,
            name: "Criatura Teste",
            position: 3,
            size: 2,
            foco: 5,
            corpo: 1,
            pa: 3,
            pv: 40,
            skills: { Presteza: 2 }
        }],
        players: [],
        npcs: [],
        combat: {}
    };
`, context);

vm.runInContext("bindTableEvents()", context);
const click = listeners.get("click")?.at(-1);
if (!click) throw new Error("O clique delegado da ameaça não foi registrado.");

const token = { dataset: { enemyInstanceId: "enemy-instance-1", enemyPosition: "3" } };
click({
    target: { closest: () => token },
    preventDefault() {},
    stopPropagation() {}
});

if (!vm.runInContext("openedEnemy?.name === 'Criatura Teste'", context)) {
    throw new Error("O clique no token não abriu a ficha da criatura.");
}

storage.set("ordem_threats", JSON.stringify([{ id: 42, name: "Modelo numérico" }]));
vm.runInContext("startEnemyPlacement('42')", context);
if (!vm.runInContext("selectedEnemy?.enemy?.name === 'Modelo numérico'", context)) {
    throw new Error("A ameaça com ID numérico não foi localizada pelo dataset.");
}

vm.runInContext(`
    const movingEnemy = currentTableCampaign.enemies[0];
    placeEntityAtPosition("enemy", movingEnemy, 5);
`, context);
if (!vm.runInContext("currentTableCampaign.enemies.length === 1 && currentTableCampaign.enemies[0].position === 5", context)) {
    throw new Error("Mover a criatura duplicou a instância ou não atualizou a posição.");
}

vm.runInContext("removeEntityFromScene('enemy', currentTableCampaign.enemies[0])", context);
if (!vm.runInContext("currentTableCampaign.enemies.length === 0", context)) {
    throw new Error("Remover a criatura não retirou a instância da mesa.");
}

vm.runInContext(`
    currentTableCampaign.enemies = [{
        id: "enemy-instance-2",
        enemyId: "enemy-instance-2",
        name: "Criatura Teste",
        position: 3,
        foco: 5,
        corpo: 1,
        skills: { Luta: 2, Presteza: 2 }
    }];
    currentTableCampaign.combat = {
        initiativeRequest: {
            active: true,
            participants: [{
                type: "enemy",
                enemyId: "enemy-instance-2",
                rolled: false
            }]
        }
    };
    let rolledFormula = "";
    let initiativeSavedBeforeChat = false;
    rollDiceExpression = formula => { rolledFormula = formula; return { total: 17, details: [] }; };
    saveTableCampaign = () => { initiativeSavedBeforeChat = currentTableCampaign.combat.initiativeRequest.participants[0].rolled === true; };
    addRollChatMessage = () => { if(!initiativeSavedBeforeChat) throw new Error("A iniciativa foi publicada antes de ser salva."); };
    finalizeInitiativeIfReady = () => {};
    rollEnemyInitiatives();
`, context);

const initiative = vm.runInContext(`({
    formula: rolledFormula,
    participant: currentTableCampaign.combat.initiativeRequest.participants[0]
})`, context);

if (initiative.formula !== "1d12+1d8+5") {
    throw new Error(`Fórmula de iniciativa incorreta: ${initiative.formula}`);
}
if (!initiative.participant.rolled || initiative.participant.attribute !== "foco" || initiative.participant.attributeValue !== 5) {
    throw new Error(`Registro de iniciativa incorreto: ${JSON.stringify(initiative.participant)}`);
}

const skillRolls = vm.runInContext(`(() => {
    const formulas = [];
    rollDiceExpression = formula => ({ total: 12, details: [], expression: (formulas.push(formula), formula) });
    addRollChatMessage = (label, formula, total, detail, metadata) => formulas.push({ label, formula, total, metadata });
    const enemy = currentTableCampaign.enemies[0];
    rollEnemySkill(enemy, "Luta", { rollKind: "attack" });
    rollEnemySkill(enemy, "Presteza");
    return formulas;
})()`, context);

if (skillRolls[0] !== "1d12+1d8+1" || skillRolls[2] !== "1d12+1d8+1") {
    throw new Error(`Fórmulas de perícia incorretas: ${JSON.stringify(skillRolls)}`);
}
if (!vm.runInContext("ENEMY_CONDITION_CATALOG.length >= 20", context)) {
    throw new Error("A lista de condições da criatura está incompleta.");
}
if (!vm.runInContext("addEnemyDamageDie('2d12 + 6') === '3d12 + 6'", context)) {
    throw new Error("O dado adicional da Investida não foi aplicado corretamente.");
}

console.log(JSON.stringify({
    ok: true,
    clickOpenedSheet: true,
    numericTemplateId: true,
    moveAndRemove: true,
    initiativeFormula: initiative.formula,
    initiativeSavedBeforeChat: true,
    skillFormula: skillRolls[0],
    conditionCatalog: true,
    chargeDamageDie: true
}, null, 2));
