import { BASE_STATS, WEAPONS, ENEMY_STATS, BOSS_CONFIG, VISUAL_CONFIG, LEVEL_CONFIG, XP_ORB_CONFIG, ITEMS, FOREST_ENEMIES } from './data/GameData.js';
import { InputManager } from './systems/InputManager.js';
import { UIManager } from './systems/UIManager.js';
import { Renderer } from './utils/Renderer.js';

// Init Systems
const canvas = document.getElementById('gameCanvas');
const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
window.addEventListener('resize', resize); resize();

const input = new InputManager();
const ui = new UIManager();
const renderer = new Renderer(canvas);

const SAVE_KEY = 'tu_tien_lo_local_saves';

// --- GLOBAL STATE ---
const state = {
    currentMap: 'village',
    villageEnv: {
        houses: [{ x: -300, y: -400 }, { x: 300, y: -350 }],
        trees: [{ x: -500, y: 100 }, { x: 400, y: 200 }, { x: -100, y: 300 }],
        grass: []
    },
    promptTimer: 0,
    isPromptInRange: false,
    portal: { x: 400, y: 0, size: 80 },
    npc: { x: 0, y: -250, name: "Vô Danh Lão Nhân", size: 40 },
    blacksmith: { x: -250, y: -100, name: "Thiết Trùy Đại Sư", size: 45 },
    isBlacksmithOpen: false,
    selectedCraftId: null,
    playTime: 0,
    gameRunning: false, isPaused: false, isDead: false, isVictory: false,
    isEquipmentOpen: false,
    isInventoryOpen: false,
    selectedClass: null, kills: 0, lastTime: performance.now(),
    camX: 0, camY: 0, lastSpawn: 0,
    player: {
        x: 0, y: 0, angle: 0, iFrames: 0, hp: 0, maxHp: 0, attack: 0, speed: 0,
        isDashing: false, dashTime: 0, dashDir: { x: 0, y: 0 },
        pendingSlashes: 0, slashTimer: 0, level: 1, exp: 0, nextLevelExp: LEVEL_CONFIG.baseExp,
    },
    xpOrbs: [], cd: { lmb: 0, rmb: 0, s1: 0, s2: 0, s3: 0, dash: 0 },
    enemies: [], projectiles: [], vfxs: [], tornados: [], arrowRains: [], flyingSwords: [], mountains: [], boss: null,
    inventory: [], isMining: false, miningTimer: 0, miningTarget: null,
    forestEnv: { enemies: [], herbs: [], ores: [] },
};

const CRAFT_RECIPES = {
    'helm_1': { id: 'helm_1', name: 'Nón Tu Sĩ', icon: '🪖', type: 'helmet', stats: { maxHp: 50 }, req: [{id: 'herb', name: 'Linh Thảo', icon:'🌿', count: 5}, {id: 'copper', name: 'Đồng Khoáng', icon:'🧱', count: 2}] },
    'armor_1': { id: 'armor_1', name: 'Thanh Y', icon: '🦺', type: 'armor', stats: { maxHp: 100, speed: 5 }, req: [{id: 'herb', name: 'Linh Thảo', icon:'🌿', count: 8}, {id: 'copper', name: 'Đồng Khoáng', icon:'🧱', count: 5}] },
    'gloves_1': { id: 'gloves_1', name: 'Hộ Thể Quyền', icon: '🧤', type: 'gloves', stats: { attack: 2 }, req: [{id: 'herb', name: 'Linh Thảo', icon:'🌿', count: 3}, {id: 'copper', name: 'Đồng Khoáng', icon:'🧱', count: 4}] },
    'boots_1': { id: 'boots_1', name: 'Tật Phong Hài', icon: '👢', type: 'boots', stats: { speed: 15 }, req: [{id: 'herb', name: 'Linh Thảo', icon:'🌿', count: 5}, {id: 'copper', name: 'Đồng Khoáng', icon:'🧱', count: 3}] },
    'ring_1': { id: 'ring_1', name: 'Huyết Ngọc Giới', icon: '💍', type: 'ring', stats: { attack: 5 }, req: [{id: 'copper', name: 'Đồng Khoáng', icon:'🧱', count: 10}] },
    'neck_1': { id: 'neck_1', name: 'Tụ Linh Xuyến', icon: '📿', type: 'necklace', stats: { maxHp: 50, attack: 3 }, req: [{id: 'herb', name: 'Linh Thảo', icon:'🌿', count: 10}, {id: 'copper', name: 'Đồng Khoáng', icon:'🧱', count: 8}] }
};

for (let i = 0; i < 30; i++) {
    state.villageEnv.grass.push({ x: (Math.random() - 0.5) * 2000, y: (Math.random() - 0.5) * 2000 });
}

// --- INPUT BINDINGS ---
input.onEscape = () => {
    if (!state.gameRunning || state.isDead || state.isVictory) return;

    if (state.isEquipmentOpen || state.isInventoryOpen) {
        state.isEquipmentOpen = false;
        state.isInventoryOpen = false;
        state.isBlacksmithOpen = false;
        updateMenuVisibility();
        return;
    }

    state.isPaused = !state.isPaused;
    ui.toggleScreen('blocker', state.isPaused);

    // KIỂM TRA HIỆN NÚT VỀ LÀNG
    const exitBtn = document.getElementById('btn-exit-village');
    if (exitBtn) {
        // Chỉ hiện nút nếu không ở Village
        exitBtn.style.display = (state.currentMap !== 'village') ? 'block' : 'none';
    }

    if (!state.isPaused) {
        state.lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
};

input.onKeyDownAction = (k) => {
    if (k === 'e') {
        if (state.currentMap === 'village') {
            const distNPC = Math.hypot(state.player.x - state.npc.x, state.player.y - state.npc.y);
            const distSmith = Math.hypot(state.player.x - state.blacksmith.x, state.player.y - state.blacksmith.y);
            const distPortal = Math.hypot(state.player.x - state.portal.x, state.player.y - state.portal.y);
            if (distNPC < 120) {
                if (!state.selectedClass) window.showClassSelection();
                else {
                    state.isDialogueOpen = !state.isDialogueOpen;
                    document.getElementById('npc-dialogue').style.display = state.isDialogueOpen ? 'block' : 'none';
                    if (state.isDialogueOpen) document.getElementById('interaction-prompt').style.display = 'none';
                }
            } else if (distPortal < 120) {
                if (state.selectedClass) {
                    document.getElementById('teleport-map').style.display = 'flex';
                    state.isPaused = true;
                    document.getElementById('interaction-prompt').style.display = 'none';
                } else alert("Bạn cần gặp Lão Nhân để thức tỉnh Pháp Khí trước khi rời làng!");
            } else if (distSmith < 120) {
                if (state.selectedClass) {
                    window.openBlacksmith();
                } else {
                    alert("Phàm nhân chưa có tu vi, không thể chịu nổi nhiệt độ của Lò Rèn!");
                }
            }
            return;
        }

        if (state.currentMap === 'forest') {
            if (state.isMining) { state.isMining = false; return; }
            const herb = state.forestEnv.herbs.find(h => Math.hypot(state.player.x - h.x, state.player.y - h.y) < 60);
            if (herb) {
                addItemToInventory(ITEMS ? ITEMS.HERB : null);
                state.forestEnv.herbs = state.forestEnv.herbs.filter(h => h !== herb); return;
            }
            const ore = state.forestEnv.ores.find(o => Math.hypot(state.player.x - o.x, state.player.y - o.y) < 60);
            if (ore) {
                state.isMining = true; state.miningTimer = 3.0; state.miningTarget = ore; return;
            }
        }
    }

    if (k === 'c') {
        if (!state.gameRunning || state.isDead || state.isVictory) return;
        state.isEquipmentOpen = !state.isEquipmentOpen;
        if (state.isEquipmentOpen) {
            document.getElementById('eq-weapon').innerText = state.selectedClass === 'sword' ? '🗡️' : (state.selectedClass === 'bow' ? '🏹' : '');
        }
        updateMenuVisibility(); return;
    }

    if (k === 'b') {
        if (!state.gameRunning || state.isDead || state.isVictory) return;
        state.isInventoryOpen = !state.isInventoryOpen;
        if (state.isInventoryOpen) updateInventoryUI();
        updateMenuVisibility(); return;
    }

    if (state.isPaused || state.isMining) return;
    if (!state.selectedClass || state.currentMap === 'village') return;

    const p = state.player;
    if (k === ' ' && state.cd.dash <= 0 && !p.isDashing) {
        p.isDashing = true; p.dashTime = 0.2;
        let dx = 0, dy = 0; if (input.keys.w) dy -= 1; if (input.keys.s) dy += 1; if (input.keys.a) dx -= 1; if (input.keys.d) dx += 1;
        if (dx === 0 && dy === 0) { dx = Math.cos(p.angle); dy = Math.sin(p.angle); }
        const len = Math.hypot(dx, dy); p.dashDir = { x: dx / len, y: dy / len };
        p.iFrames = 0.3; state.cd.dash = getSkillCd('dash');
    }

    if (k === '1' && state.cd.s1 <= 0) {
        const dmg = getSkillDmg('s1');
        if (state.selectedClass === 'sword') {
            const w = 150, h = 300, cx = p.x + Math.cos(p.angle) * (h / 2 + 20), cy = p.y + Math.sin(p.angle) * (h / 2 + 20);
            state.vfxs.push({ x: cx, y: cy, w: h, h: w, angle: p.angle, life: 0.4, maxLife: 0.4, type: 'rect', color: '#ffaa00' });
            checkRectDamage(cx, cy, p.angle, h, w, dmg);
        } else {
            state.arrowRains.push({ x: input.mouseX + state.camX, y: input.mouseY + state.camY, life: 3.0, radius: 150, tick: 0, dmg: dmg });
            state.vfxs.push({ x: input.mouseX + state.camX, y: input.mouseY + state.camY, radius: 150, life: 3.0, maxLife: 3.0, type: 'circle', color: 'rgba(50,255,100,0.2)' });
        }
        state.cd.s1 = getSkillCd('s1');
    }

    if (k === '2' && state.cd.s2 <= 0) {
        if (state.selectedClass === 'sword') { p.pendingSlashes = 3; p.slashTimer = 0; }
        else state.projectiles.push({ x: p.x, y: p.y, vx: Math.cos(p.angle) * 1200, vy: Math.sin(p.angle) * 1200, life: 2.0, type: 'bigarrow', dmg: getSkillDmg('s2'), pierce: true });
        state.cd.s2 = getSkillCd('s2');
    }

    if (k === '3' && state.cd.s3 <= 0) {
        if (state.selectedClass === 'sword') for (let i = 0; i < 4; i++) state.flyingSwords.push({ angleOffset: i * Math.PI / 2, state: 'orbit', target: null, x: p.x, y: p.y, dmg: getSkillDmg('s3') });
        else state.tornados.push({ x: p.x, y: p.y, vx: Math.cos(p.angle) * 100, vy: Math.sin(p.angle) * 100, life: 5.0, tick: 0, radius: 80, dmg: getSkillDmg('s3') });
        state.cd.s3 = getSkillCd('s3');
    }
};

function updateMenuVisibility() {
    const anyMenuOpen = state.isEquipmentOpen || state.isInventoryOpen;
    state.isPaused = anyMenuOpen;
    ui.setElementDisplay('menu-overlay', anyMenuOpen ? 'flex' : 'none');
    ui.setElementDisplay('equipment-panel', state.isEquipmentOpen ? 'flex' : 'none');
    ui.setElementDisplay('inventory-panel', state.isInventoryOpen ? 'flex' : 'none');
    ui.setElementDisplay('blacksmith-panel', state.isBlacksmithOpen ? 'flex' : 'none');
    if (!anyMenuOpen) { state.lastTime = performance.now(); requestAnimationFrame(gameLoop); }
}

function handleActions(dt) {
    if (!state.selectedClass || state.currentMap === 'village' || state.isMining) return;

    if (input.isLmbDown && state.cd.lmb <= 0) {
        const dmg = getSkillDmg('lmb');
        if (state.selectedClass === 'sword') createSlash(state.player.x, state.player.y, state.player.angle, 100, Math.PI / 1.5, dmg, '#00ffff', 0.2);
        else state.projectiles.push({ x: state.player.x + Math.cos(state.player.angle) * 20, y: state.player.y + Math.sin(state.player.angle) * 20, vx: Math.cos(state.player.angle) * 800, vy: Math.sin(state.player.angle) * 800, life: 1.5, type: 'arrow', dmg: dmg, pierce: false });
        state.cd.lmb = getSkillCd('lmb');
    }

    if (input.isRmbDown && state.cd.rmb <= 0) {
        const dmg = getSkillDmg('rmb');
        if (state.selectedClass === 'sword') state.projectiles.push({ x: state.player.x, y: state.player.y, radius: 10, maxRadius: 200, expansionSpeed: 600, life: 200 / 600, type: 'expandingRing', dmg: dmg, hitList: [] });
        else for (let i = -2; i <= 2; i++) state.projectiles.push({ x: state.player.x, y: state.player.y, vx: Math.cos(state.player.angle + i * 0.15) * 700, vy: Math.sin(state.player.angle + i * 0.15) * 700, life: 1.5, type: 'arrow', dmg: dmg, pierce: false });
        state.cd.rmb = getSkillCd('rmb');
    }
}

const getSkillCd = (k) => k === 'lmb' ? WEAPONS[state.selectedClass].skills[k].cd / state.player.attackSpeed : WEAPONS[state.selectedClass].skills[k].cd * BASE_STATS.cdr;
const getSkillDmg = (k) => state.player.attack * WEAPONS[state.selectedClass].skills[k].dmgMult;

function createSlash(px, py, ang, radius, arc, dmg, color, life) {
    state.vfxs.push({ x: px, y: py, angle: ang, radius: radius, arc: arc, life: life, maxLife: life, type: 'slash', color: color });
    checkConeDamage(px, py, ang, radius, arc, dmg);
}
function checkConeDamage(px, py, ang, radius, arc, dmg) {
    [...state.enemies, state.boss, ...state.mountains].forEach(e => {
        if (!e || e.hp <= 0) return;
        const dist = Math.hypot(e.x - px, e.y - py) - (e.size || e.radius || 30) / 2;
        if (dist <= radius) {
            let diff = Math.abs(ang - Math.atan2(e.y - py, e.x - px));
            if (diff > Math.PI) diff = 2 * Math.PI - diff;
            if (arc >= 6.1 || diff <= arc / 2) applyDamage(e, dmg);
        }
    });
}
function checkRectDamage(cx, cy, ang, len, wid, dmg) {
    const dx = Math.cos(ang), dy = Math.sin(ang);
    [...state.enemies, state.boss, ...state.mountains].forEach(e => {
        if (!e || e.hp <= 0) return;
        const vx = e.x - cx, vy = e.y - cy;
        if (Math.abs(vx * dx + vy * dy) <= len / 2 && Math.abs(vx * -dy + vy * dx) <= wid / 2) applyDamage(e, dmg);
    });
}
function applyDamage(entity, dmg) {
    entity.hp -= dmg;
    const dmgEl = ui.createDmgText(dmg, '#ffcc00', document.getElementById('damage-container'));
    state.vfxs.push({ type: 'text', el: dmgEl, x: entity.x + (Math.random() - 0.5) * 40, y: entity.y, vy: -50, life: 1.0 });
    for (let i = 0; i < 5; i++) state.vfxs.push({ type: 'particle', x: entity.x, y: entity.y, vx: Math.cos(Math.random() * 6.28) * (Math.random() * 200 + 50), vy: Math.sin(Math.random() * 6.28) * (Math.random() * 200 + 50), life: 0.5, color: '#ff0000' });

    if (entity.hp <= 0) {
        if (entity === state.boss) { state.boss = null; state.isVictory = true; ui.toggleScreen('victory-screen', true); }
        else if (state.enemies.includes(entity)) {
            state.xpOrbs.push({ x: entity.x, y: entity.y, value: Math.ceil(entity.maxHp * XP_ORB_CONFIG.xpPerEnemyHp), vx: (Math.random() - 0.5) * 100, vy: (Math.random() - 0.5) * 100 });
            state.enemies = state.enemies.filter(en => en !== entity); state.kills++; document.getElementById('kill-count').innerText = state.kills;
        } else if (state.mountains.includes(entity)) state.mountains = state.mountains.filter(m => m !== entity);
    }
}
function takePlayerDamage(amount) {
    if (state.player.iFrames > 0 || state.isDead || state.isVictory) return;
    state.player.hp = Math.max(0, state.player.hp - amount); state.player.iFrames = 0.5; ui.updateHp(state.player.hp, state.player.maxHp);
    const dmgEl = ui.createDmgText(amount, '#ff0000', document.getElementById('damage-container'));
    state.vfxs.push({ type: 'text', el: dmgEl, x: state.player.x + (Math.random() - 0.5) * 40, y: state.player.y, vy: -50, life: 1.0 });
    if (state.player.hp <= 0) { state.isDead = true; document.getElementById('final-score').innerText = state.kills; ui.toggleScreen('game-over-screen', true); }
}

function spawnDungeonEnemy() {
    if (state.boss) return;
    const ang = Math.random() * Math.PI * 2; const dist = Math.max(canvas.width, canvas.height) / 2 + 100;
    const hp = ENEMY_STATS.baseHp + Math.floor(state.kills * ENEMY_STATS.hpScalePerKill);
    const speed = ENEMY_STATS.baseSpeed + Math.random() * ENEMY_STATS.speedVariance;
    const damage = ENEMY_STATS.baseDamage + Math.floor(state.kills * ENEMY_STATS.damageScalePerKill);
    const randomName = ENEMY_STATS.names ? ENEMY_STATS.names[Math.floor(Math.random() * ENEMY_STATS.names.length)] : "Yêu Thú";
    state.enemies.push({ x: state.player.x + Math.cos(ang) * dist, y: state.player.y + Math.sin(ang) * dist, hp: hp, maxHp: hp, speed: speed, size: ENEMY_STATS.size, damage: damage, name: randomName });
}

function spawnForestEnemy() {
    const ang = Math.random() * Math.PI * 2; const dist = Math.max(canvas.width, canvas.height) / 2 + 100;
    const stats = Math.random() > 0.5 ? FOREST_ENEMIES.WOLF : FOREST_ENEMIES.BOAR;
    state.enemies.push({ x: state.player.x + Math.cos(ang) * dist, y: state.player.y + Math.sin(ang) * dist, hp: stats.hp, maxHp: stats.hp, speed: stats.speed, size: 40, damage: stats.damage, name: stats.name });
}

function spawnBoss() {
    state.enemies = []; ui.setElementDisplay('boss-warning', 'block'); setTimeout(() => ui.setElementDisplay('boss-warning', 'none'), 3000);
    state.boss = { x: state.player.x, y: state.player.y - 400, hp: BOSS_CONFIG.maxHp, maxHp: BOSS_CONFIG.maxHp, speed: BOSS_CONFIG.speed, size: BOSS_CONFIG.size, currentCd: 2.0, state: 'idle', timer: 0 };
    ui.setElementDisplay('boss-ui', 'flex');
}

function addItemToInventory(item) {
    if (!item) return;
    const existing = state.inventory.find(i => i.id === item.id);
    if (existing) existing.count++; else state.inventory.push({ ...item, count: 1 });
    updateInventoryUI();
}

function updateInventoryUI() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    grid.innerHTML = '';
    // Vẽ cứng 16 ô túi đồ
    for (let i = 0; i < 16; i++) {
        const item = state.inventory[i];
        if (item) {
            grid.innerHTML += `<div class="inv-slot"><div class="item-icon">${item.icon}</div><div class="item-count">${item.count}</div></div>`;
        } else {
            grid.innerHTML += `<div class="inv-slot" style="background: rgba(0,0,0,0.3); border: 1px dashed #444;"></div>`;
        }
    }
}

function initForestMap() {
    state.enemies = []; state.projectiles = []; state.xpOrbs = []; state.forestEnv.herbs = []; state.forestEnv.ores = [];
    for (let i = 0; i < 5; i++) state.forestEnv.herbs.push({ x: (Math.random() - 0.5) * 1500, y: (Math.random() - 0.5) * 1500 });
    for (let i = 0; i < 3; i++) state.forestEnv.ores.push({ x: (Math.random() - 0.5) * 1200, y: (Math.random() - 0.5) * 1200 });
}

window.clearMapState = () => {
    // 1. Dọn sạch thực thể
    state.enemies = [];
    state.projectiles = [];
    state.xpOrbs = [];
    state.vfxs = [];
    state.flyingSwords = [];
    state.tornados = [];
    state.arrowRains = [];
    state.mountains = [];
    state.boss = null;

    // 2. Reset các trạng thái hành động đang dang dở
    state.isMining = false;
    state.player.isDashing = false;
    state.player.iFrames = 0;

    // 3. Reset các bộ đếm thời gian
    state.lastSpawn = 0;
    state.playTime = 0;

    // 4. Reset máu của quái vật map rừng (nếu có)
    state.forestEnv.herbs = [];
    state.forestEnv.ores = [];
};

// --- GAME LOOP ---
function update(dt) {
    if (state.isDead || state.isVictory) return;

    const p = state.player;
    p.angle = Math.atan2(input.mouseY + state.camY - p.y, input.mouseX + state.camX - p.x);
    if (p.iFrames > 0) p.iFrames -= dt;
    handleActions(dt);

    if (p.isDashing) {
        p.dashTime -= dt; p.x += p.dashDir.x * BASE_STATS.dashSpeed * dt; p.y += p.dashDir.y * BASE_STATS.dashSpeed * dt;
        if (p.dashTime <= 0) p.isDashing = false;
    } else {
        let dx = 0, dy = 0; if (input.keys.w) dy -= 1; if (input.keys.s) dy += 1; if (input.keys.a) dx -= 1; if (input.keys.d) dx += 1;
        if (dx !== 0 || dy !== 0) { const len = Math.hypot(dx, dy); p.x += (dx / len) * p.speed * dt; p.y += (dy / len) * p.speed * dt; }
    }

    state.camX = p.x - canvas.width / 2; state.camY = p.y - canvas.height / 2;

    // ----- LOGIC MAP LÀNG -----
    if (state.currentMap === 'village') {
        const LIMIT = 1000; p.x = Math.max(-LIMIT, Math.min(LIMIT, p.x)); p.y = Math.max(-LIMIT, Math.min(LIMIT, p.y));
        const distNPC = Math.hypot(p.x - state.npc.x, p.y - state.npc.y); 
        const distPortal = Math.hypot(p.x - state.portal.x, p.y - state.portal.y);
        const distSmith = Math.hypot(p.x - state.blacksmith.x, p.y - state.blacksmith.y);
        const currentlyInRange = (distNPC < 120 || distPortal < 120 || distSmith < 120);

        if (currentlyInRange) {
            if (!state.isPromptInRange && !state.isDialogueOpen) {
                state.isPromptInRange = true; state.promptTimer = 3.0;
                const promptEl = document.getElementById('interaction-prompt');
                
                if (distNPC < 120) promptEl.innerText = state.selectedClass ? "BẤM [E] ĐỂ TRÒ CHUYỆN" : "BẤM [E] ĐỂ NHẬN KỲ DUYÊN";
                else if (distPortal < 120) promptEl.innerText = "BẤM [E] ĐỂ DỊCH CHUYỂN";
                else if (distSmith < 120) promptEl.innerText = "BẤM [E] ĐỂ RÈN TRANG BỊ";
                
                promptEl.style.display = 'block';
            }
        } else {
            state.isPromptInRange = false; state.promptTimer = 0; document.getElementById('interaction-prompt').style.display = 'none';
            if (state.isDialogueOpen) { state.isDialogueOpen = false; document.getElementById('npc-dialogue').style.display = 'none'; }
        }
        if (state.promptTimer > 0) { state.promptTimer -= dt; if (state.promptTimer <= 0) document.getElementById('interaction-prompt').style.display = 'none'; }
    }

    // ----- LOGIC MAP THANH DIỆP LÂM -----
    if (state.currentMap === 'forest') {
        const promptEl = document.getElementById('interaction-prompt');
        let canInteract = false;

        if (state.isMining) {
            promptEl.innerText = "BẤM [E] ĐỂ HỦY ĐÀO"; canInteract = true;
            state.miningTimer -= dt;
            if (state.miningTimer <= 0) {
                if (ITEMS && ITEMS.COPPER) addItemToInventory(ITEMS.COPPER);
                state.forestEnv.ores = state.forestEnv.ores.filter(o => o !== state.miningTarget);
                state.isMining = false;
            }
        } else {
            const closeHerb = state.forestEnv.herbs.find(h => Math.hypot(p.x - h.x, p.y - h.y) < 60);
            const closeOre = state.forestEnv.ores.find(o => Math.hypot(p.x - o.x, p.y - o.y) < 60);
            if (closeHerb) { promptEl.innerText = "BẤM [E] ĐỂ HÁI LINH THẢO"; canInteract = true; }
            else if (closeOre) { promptEl.innerText = "BẤM [E] ĐỂ ĐÀO ĐỒNG KHOÁNG"; canInteract = true; }
        }
        promptEl.style.display = canInteract ? 'block' : 'none';

        state.lastSpawn += dt;
        if (state.lastSpawn > 3.0) { spawnForestEnemy(); state.lastSpawn = 0; }
    }

    // ----- LOGIC MAP MA TÔN VỰC (DUNGEON) -----
    if (state.currentMap === 'dungeon') {
        state.playTime += dt;
        const tutorialEl = document.getElementById('boss-goal-tutorial');
        if (!state.boss) {
            const timeLeft = Math.max(0, BOSS_CONFIG.spawnTime - state.playTime);
            const minutes = Math.floor(timeLeft / 60); const seconds = Math.floor(timeLeft % 60).toString().padStart(2, '0');
            tutorialEl.innerText = `Ma Tôn giá lâm sau: ${minutes}:${seconds}`; tutorialEl.style.color = '#ffaa00';
            if (state.playTime >= BOSS_CONFIG.spawnTime) spawnBoss();
        } else {
            tutorialEl.innerText = `⚠️ TIÊU DIỆT MA TÔN! ⚠️`; tutorialEl.style.color = '#ff3333';
        }

        state.lastSpawn += dt;
        if (!state.boss && state.lastSpawn > ENEMY_STATS.spawnRate) { spawnDungeonEnemy(); state.lastSpawn = 0; }

        if (state.boss) {
            const b = state.boss; document.getElementById('boss-hp-fill').style.width = (b.hp / b.maxHp * 100) + '%'; document.getElementById('boss-hp-text').innerText = Math.ceil(b.hp) + ' / ' + b.maxHp;
            if (b.state === 'idle') {
                const ang = Math.atan2(p.y - b.y, p.x - b.x); b.x += Math.cos(ang) * b.speed * dt; b.y += Math.sin(ang) * b.speed * dt;
                if (Math.hypot(p.x - b.x, p.y - b.y) < 50) takePlayerDamage(20);
                b.currentCd -= dt;
                if (b.currentCd <= 0) {
                    b.skillType = Math.floor(Math.random() * 3); b.state = b.skillType === 2 ? 'firing' : 'casting'; b.timer = b.skillType === 2 ? 3.0 : 1.5; b.targetX = p.x; b.targetY = p.y;
                    if (b.skillType === 0) state.vfxs.push({ type: 'bossAOE', x: p.x, y: p.y, life: 1.5, maxLife: 1.5, radius: 150 });
                    else if (b.skillType === 1) { b.pendingMountains = []; for (let i = 0; i < 20; i++) { const rx = p.x + (Math.random() - 0.5) * 1200, ry = p.y + (Math.random() - 0.5) * 1200; state.vfxs.push({ type: 'mountainWarning', x: rx, y: ry, life: 1.5, maxLife: 1.5, radius: 25 }); b.pendingMountains.push({ x: rx, y: ry }); } }
                }
            } else if (b.state === 'casting') {
                b.timer -= dt;
                if (b.timer <= 0) {
                    if (b.skillType === 0) { state.vfxs.push({ type: 'circle', color: 'rgba(255,0,0,0.6)', x: b.targetX, y: b.targetY, radius: 150, life: 0.5, maxLife: 0.5 }); if (Math.hypot(p.x - b.targetX, p.y - b.targetY) <= 150) takePlayerDamage(50); }
                    else if (b.skillType === 1 && b.pendingMountains) { b.pendingMountains.forEach(pos => state.mountains.push({ x: pos.x, y: pos.y, radius: 25, hp: 40, maxHp: 40 })); b.pendingMountains = []; }
                    b.state = 'idle'; b.currentCd = 4.0;
                }
            } else if (b.state === 'firing') {
                b.timer -= dt; b.fireTick = (b.fireTick || 0) - dt;
                if (b.fireTick <= 0) { state.projectiles.push({ x: b.x, y: b.y, vx: Math.cos(Math.atan2(p.y - b.y, p.x - b.x)) * 500, vy: Math.sin(Math.atan2(p.y - b.y, p.x - b.x)) * 500, life: 3.0, type: 'bossOrb', dmg: 20 }); b.fireTick = 0.15; }
                if (b.timer <= 0) { b.state = 'idle'; b.currentCd = 4.0; }
            }
        }
    }

    // ----- COMMON COMBAT LOGIC -----
    if (state.currentMap === 'dungeon' || state.currentMap === 'forest') {
        for (let k in state.cd) { if (state.cd[k] > 0) { state.cd[k] -= dt; if (state.cd[k] <= 0) state.cd[k] = 0; if (state.selectedClass) ui.updateCd(k, state.cd[k], getSkillCd(k)); } }

        state.enemies.forEach(e => {
            const ang = Math.atan2(p.y - e.y, p.x - e.x); e.x += Math.cos(ang) * e.speed * dt; e.y += Math.sin(ang) * e.speed * dt;
            if (e.isTossed > 0) e.isTossed -= dt;
            if (Math.hypot(p.x - e.x, p.y - e.y) < 30 + e.size / 2) takePlayerDamage(e.damage);
        });

        for (let i = state.xpOrbs.length - 1; i >= 0; i--) {
            let orb = state.xpOrbs[i]; const dist = Math.hypot(p.x - orb.x, p.y - orb.y);
            if (dist < XP_ORB_CONFIG.magnetRadius) {
                const ang = Math.atan2(p.y - orb.y, p.x - orb.x); orb.x += Math.cos(ang) * XP_ORB_CONFIG.flySpeed * dt; orb.y += Math.sin(ang) * XP_ORB_CONFIG.flySpeed * dt;
                if (dist < 20) { p.exp += orb.value; state.xpOrbs.splice(i, 1); checkLevelUp(); continue; }
            } else { orb.x += orb.vx * dt; orb.y += orb.vy * dt; orb.vx *= 0.95; orb.vy *= 0.95; }
        }
        ui.updateXp(p.exp, p.nextLevelExp);

        if (p.pendingSlashes > 0) {
            p.slashTimer -= dt;
            if (p.slashTimer <= 0) {
                const ang = p.angle + (Math.random() - 0.5) * 0.6;
                state.projectiles.push({ x: p.x, y: p.y, vx: Math.cos(ang) * 1000, vy: Math.sin(ang) * 1000, life: 2.0, type: 'slashwave', dmg: getSkillDmg('s2'), pierce: true });
                p.pendingSlashes--; p.slashTimer = 0.15;
            }
        }

        for (let i = state.projectiles.length - 1; i >= 0; i--) {
            let pr = state.projectiles[i]; if (pr.type !== 'expandingRing') { pr.x += pr.vx * dt; pr.y += pr.vy * dt; } pr.life -= dt; let hit = false;
            if (pr.type === 'bossOrb') { if (Math.hypot(p.x - pr.x, p.y - pr.y) < 20) { takePlayerDamage(pr.dmg); hit = true; } }
            else if (pr.type === 'expandingRing') {
                pr.radius += pr.expansionSpeed * dt;
                [...state.enemies, state.boss, ...state.mountains].forEach(e => { if (e && e.hp > 0 && Math.hypot(e.x - pr.x, e.y - pr.y) - (e.size || e.radius || 30) / 2 <= pr.radius && !pr.hitList.includes(e)) { applyDamage(e, pr.dmg); pr.hitList.push(e); } });
            } else {
                [...state.enemies, state.boss, ...state.mountains].forEach(e => { if (e && e.hp > 0 && !hit && Math.hypot(e.x - pr.x, e.y - pr.y) < (e.size || e.radius || 25) + 10) { if (!pr.pierce) hit = true; pr.hitList = pr.hitList || []; if (!pr.hitList.includes(e)) { applyDamage(e, pr.dmg); pr.hitList.push(e); } } });
            }
            if (pr.life <= 0 || hit) state.projectiles.splice(i, 1);
        }

        for (let i = state.arrowRains.length - 1; i >= 0; i--) { let r = state.arrowRains[i]; r.life -= dt; r.tick -= dt; if (r.tick <= 0) { [...state.enemies, state.boss, ...state.mountains].forEach(e => { if (e && Math.hypot(e.x - r.x, e.y - r.y) < 150) applyDamage(e, r.dmg); }); state.vfxs.push({ type: 'fallingArrow', x: r.x + (Math.random() - 0.5) * 300, y: r.y + (Math.random() - 0.5) * 300, life: 0.3, maxLife: 0.3 }); r.tick = 0.5; } if (r.life <= 0) state.arrowRains.splice(i, 1); }
        for (let i = state.tornados.length - 1; i >= 0; i--) { let t = state.tornados[i]; t.x += t.vx * dt; t.y += t.vy * dt; t.life -= dt; t.tick -= dt; if (t.tick <= 0) { [...state.enemies, state.boss, ...state.mountains].forEach(e => { if (e && Math.hypot(e.x - t.x, e.y - t.y) < t.radius) { applyDamage(e, t.dmg); e.isTossed = 0.5; } }); t.tick = 0.5; } if (t.life <= 0) state.tornados.splice(i, 1); }
        state.mountains.forEach(m => { if (Math.hypot(p.x - m.x, p.y - m.y) < m.radius + 15) takePlayerDamage(10); });

        for (let i = state.flyingSwords.length - 1; i >= 0; i--) {
            let s = state.flyingSwords[i];
            if (s.state === 'orbit') {
                const ang = (performance.now() * 0.003) + s.angleOffset; s.x += ((p.x + Math.cos(ang) * 80) - s.x) * 5 * dt; s.y += ((p.y + Math.sin(ang) * 80) - s.y) * 5 * dt; s.angle = ang + Math.PI / 2;
                if (!s.cd || s.cd <= 0) { let t = null, md = 300;[...state.enemies, state.boss, ...state.mountains].forEach(e => { if (e) { let d = Math.hypot(e.x - p.x, e.y - p.y); if (d < md) { md = d; t = e; } } }); if (t) { s.state = 'attack'; s.target = t; } } else s.cd -= dt;
            } else if (s.state === 'attack') {
                if (s.target && s.target.hp > 0) { const a = Math.atan2(s.target.y - s.y, s.target.x - s.x); s.x += Math.cos(a) * 800 * dt; s.y += Math.sin(a) * 800 * dt; s.angle = a; if (Math.hypot(s.target.x - s.x, s.target.y - s.y) < 20) { applyDamage(s.target, s.dmg); s.state = 'return'; } } else s.state = 'return';
            } else if (s.state === 'return') {
                const a = Math.atan2((p.y + Math.sin(performance.now() * 0.003 + s.angleOffset) * 80) - s.y, (p.x + Math.cos(performance.now() * 0.003 + s.angleOffset) * 80) - s.x);
                s.x += Math.cos(a) * 600 * dt; s.y += Math.sin(a) * 600 * dt; s.angle = a; if (Math.hypot((p.x + Math.cos(performance.now() * 0.003 + s.angleOffset) * 80) - s.x, (p.y + Math.sin(performance.now() * 0.003 + s.angleOffset) * 80) - s.y) < 20) { s.state = 'orbit'; s.cd = 0.5; }
            }
            s.life = state.cd.s3; if (s.life <= 0) state.flyingSwords.splice(i, 1);
        }

        for (let i = state.vfxs.length - 1; i >= 0; i--) { let v = state.vfxs[i]; v.life -= dt; if (v.type === 'text') { v.y += v.vy * dt; v.el.style.left = (v.x - state.camX) + 'px'; v.el.style.top = (v.y - state.camY) + 'px'; v.el.style.opacity = v.life; } if (v.type === 'particle') { v.x += v.vx * dt; v.y += v.vy * dt; v.vx *= 0.9; v.vy *= 0.9; } if (v.life <= 0) { if (v.el) v.el.remove(); state.vfxs.splice(i, 1); } }
    }
}

function gameLoop(time) {
    if (!state.gameRunning || state.isPaused) return;
    const dt = (time - state.lastTime) / 1000; state.lastTime = time;
    update(Math.min(dt, 0.1)); renderer.draw(state, input); requestAnimationFrame(gameLoop);
}

function checkLevelUp() {
    if (state.player.exp >= state.player.nextLevelExp) {
        state.player.level++; state.player.exp -= state.player.nextLevelExp;
        state.player.nextLevelExp = Math.floor(LEVEL_CONFIG.baseExp * Math.pow(state.player.level, LEVEL_CONFIG.expGrowth));
        state.player.maxHp += LEVEL_CONFIG.bonuses.maxHp; state.player.attack += LEVEL_CONFIG.bonuses.attack; state.player.speed += LEVEL_CONFIG.bonuses.speed; state.player.attackSpeed += LEVEL_CONFIG.bonuses.attackSpeed;
        ui.updateLevel(state.player.level); ui.updateHp(state.player.hp, state.player.maxHp); ui.updateStats(state.player.attack, state.player.speed);
        for (let i = 0; i < 20; i++) state.vfxs.push({ type: 'particle', x: state.player.x, y: state.player.y, vx: (Math.random() - 0.5) * 500, vy: (Math.random() - 0.5) * 500, life: 0.8, color: '#00ffcc' });
        checkLevelUp();
    }
}

// --- SCENE & MENU MANAGEMENT ---
window.changeScene = function (sceneId) {
    document.querySelectorAll('.scene').forEach(s => s.style.display = 'none');
    const target = document.getElementById(sceneId);
    if (target) target.style.display = 'block'; else console.error("Không tìm thấy Scene ID: " + sceneId);
};

window.startVillage = (isLoad = false) => {
    state.currentMap = 'village';
    changeScene('scene-village');

    if (!isLoad) {
        state.selectedClass = null;
        state.player = { x: 0, y: 0, angle: 0, speed: 150, hp: 100, maxHp: 100, attack: 5, attackSpeed: 1, level: 1, exp: 0, nextLevelExp: 100, iFrames: 0, isDashing: false, dashTime: 0, dashDir: { x: 0, y: 0 }, equipment: { weapon: null, helmet: null, armor: null, gloves: null, boots: null, ring1: null, ring2: null, necklace: null, mount: null } };
    } else {
        // Đưa người chơi về chính giữa làng
        state.player.x = 0;
        state.player.y = 0;
    }

    window.clearMapState();

    document.getElementById('global-player-hud').style.display = 'block';
    const villageTutorial = document.getElementById('village-tutorial');
    if (state.selectedClass) {
        document.getElementById('instr-title').innerText = state.selectedClass === 'sword' ? "KIẾM TIÊN" : "TIÊN CUNG";
        document.getElementById('player-avatar').innerText = state.selectedClass === 'sword' ? "🗡️" : "🏹";
        document.getElementById('skill-panel').style.display = 'flex'; document.getElementById('score-board').style.display = 'flex';
        if (villageTutorial) villageTutorial.style.display = 'none';
    } else {
        document.getElementById('instr-title').innerText = "PHÀM NHÂN"; document.getElementById('player-avatar').innerText = "👤";
        document.getElementById('skill-panel').style.display = 'none'; document.getElementById('score-board').style.display = 'none';
        if (villageTutorial) villageTutorial.style.display = 'block';
    }
    ui.updateHp(state.player.hp, state.player.maxHp); ui.updateLevel(state.player.level); ui.updateStats(state.player.attack, state.player.speed);
    state.gameRunning = true; state.lastTime = performance.now(); requestAnimationFrame(gameLoop);

    ui.updateXp(state.player.exp, state.player.nextLevelExp);

    if (state.currentSlot) {
        window.saveGame();
    }

    state.gameRunning = true;
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);

};

window.showClassSelection = () => {
    state.gameRunning = false; state.isPaused = false; ui.toggleScreen('blocker', false);
    document.getElementById('interaction-prompt').style.display = 'none'; changeScene('scene-class-selection'); document.getElementById('global-player-hud').style.display = 'none';
};

window.selectClass = (cls) => {
    state.selectedClass = cls; ui.toggleScreen('class-selection', false);
    const w = WEAPONS[cls];
    state.player.maxHp = BASE_STATS.maxHp + w.bonus.hp; state.player.hp = state.player.maxHp; state.player.attack = BASE_STATS.attack + w.bonus.attack; state.player.speed = BASE_STATS.speed + w.bonus.speed; state.player.attackSpeed = BASE_STATS.attackSpeed + w.bonus.attackSpeed;
    const eqWeapon = document.getElementById('eq-weapon'); if (eqWeapon) eqWeapon.innerText = (cls === 'sword' ? '🗡️' : '🏹');
    window.startVillage(true); if (window.saveGame) window.saveGame();
};

window.exitToVillage = () => {
    // 1. Tắt trạng thái Pause
    state.isPaused = false;
    ui.toggleScreen('blocker', false);

    // 2. Quay về làng (isLoad = true để giữ nguyên chỉ số hiện tại)
    window.startVillage(true);

    // 3. Thông báo lưu game
    console.log("Đã bảo toàn tài nguyên và trở về làng.");
};

// ================= HỆ THỐNG LÒ RÈN =================
window.openBlacksmith = () => {
    state.isBlacksmithOpen = true;
    document.getElementById('interaction-prompt').style.display = 'none';
    updateMenuVisibility();

    const listEl = document.getElementById('craft-list');
    listEl.innerHTML = '';
    
    // Vẽ danh sách item bên trái
    const typeVN = {
        'helmet': 'Nón',
        'armor': 'Áo giáp',
        'gloves': 'Bao tay',
        'boots': 'Giày',
        'ring': 'Nhẫn',
        'necklace': 'Dây chuyền'
    };

    for (let key in CRAFT_RECIPES) {
        const item = CRAFT_RECIPES[key];
        const loaiVN = typeVN[item.type] || item.type; // Dịch tên loại

        listEl.innerHTML += `
            <div class="craft-item-row" style="display: flex; align-items: center; padding: 8px; margin-bottom: 5px; background: rgba(255,255,255,0.05); border-radius: 5px; cursor: pointer; border: 1px solid transparent; transition: 0.2s;" 
                 onclick="window.selectCraftItem('${key}')" id="craft-row-${key}"
                 onmouseover="this.style.background='rgba(255,170,0,0.2)'" onmouseout="if(state.selectedCraftId !== '${key}') this.style.background='rgba(255,255,255,0.05)'">
                 
                <div style="font-size: 20px; margin-right: 12px; width: 30px; text-align: center;">${item.icon}</div>
                <div style="text-align: left;">
                    <div style="color: #fff; font-weight: bold; font-size: 14px;">${item.name}</div>
                    <div style="color: #888; font-size: 11px;">Loại: ${loaiVN}</div>
                </div>
            </div>
        `;
    }
    window.selectCraftItem('helm_1'); // Mặc định chọn món đầu tiên
};

window.closeBlacksmith = () => {
    state.isBlacksmithOpen = false;
    updateMenuVisibility();
};

window.selectCraftItem = (key) => {
    state.selectedCraftId = key;
    const item = CRAFT_RECIPES[key];
    
    // Reset background của list
    document.querySelectorAll('.craft-item-row').forEach(el => {
        el.style.background = 'rgba(255,255,255,0.05)';
        el.style.borderColor = 'transparent';
    });
    const selectedRow = document.getElementById(`craft-row-${key}`);
    if (selectedRow) {
        selectedRow.style.background = 'rgba(255,170,0,0.2)';
        selectedRow.style.borderColor = '#ffaa00';
    }

    // Hiển thị chi tiết
    document.getElementById('craft-icon').innerText = item.icon;
    document.getElementById('craft-name').innerText = item.name;
    
    let statsStr = '';
    if (item.stats.maxHp) statsStr += `Máu tối đa: +${item.stats.maxHp} &nbsp;&nbsp;`;
    if (item.stats.attack) statsStr += `Sát thương: +${item.stats.attack} &nbsp;&nbsp;`;
    if (item.stats.speed) statsStr += `Tốc độ: +${item.stats.speed}`;
    document.getElementById('craft-stats').innerHTML = statsStr;

    // Kiểm tra nguyên liệu
    const matEl = document.getElementById('craft-materials');
    matEl.innerHTML = '';
    let canCraft = true;

    item.req.forEach(req => {
        const invItem = state.inventory.find(i => i.id === req.id);
        const currentCount = invItem ? invItem.count : 0;
        const color = currentCount >= req.count ? '#00ff00' : '#ff3333';
        if (currentCount < req.count) canCraft = false;

        matEl.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 3px;">
                <span>${req.icon} ${req.name}</span>
                <span style="color: ${color}; font-weight: bold;">${currentCount} / ${req.count}</span>
            </div>
        `;
    });

    const btn = document.getElementById('btn-craft');
    if (canCraft) {
        btn.style.opacity = '1'; btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 0 15px rgba(0,255,0,0.5)';
    } else {
        btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed';
        btn.style.boxShadow = 'none';
    }
};

window.doCraft = () => {
    if (!state.selectedCraftId) return;
    const item = CRAFT_RECIPES[state.selectedCraftId];
    
    // Kiểm tra lại lần cuối
    let canCraft = true;
    item.req.forEach(req => {
        const invItem = state.inventory.find(i => i.id === req.id);
        if (!invItem || invItem.count < req.count) canCraft = false;
    });

    if (!canCraft) return;

    // Kiểm tra túi đồ có bị đầy không (giới hạn 16 ô)
    if (state.inventory.length >= 16) {
        alert("Túi đồ đã đầy! Hãy dọn dẹp trước khi chế tạo.");
        return;
    }

    // 1. Trừ nguyên liệu
    item.req.forEach(req => {
        const invItem = state.inventory.find(i => i.id === req.id);
        invItem.count -= req.count;
    });
    // Dọn dẹp các nguyên liệu đã hết (count <= 0)
    state.inventory = state.inventory.filter(i => i.count > 0);

    // 2. Thêm Trang bị mới vào túi đồ (Là 1 object riêng biệt vì trang bị không cộng dồn)
    state.inventory.push({
        id: item.id + '_' + Date.now(), // ID duy nhất để không bị gộp chung
        baseId: item.id,
        name: item.name,
        icon: item.icon,
        type: item.type,
        stats: item.stats,
        count: 1, 
        isEquipment: true // Cờ đánh dấu đây là trang bị, không phải nguyên liệu
    });

    // 3. Render lại
    updateInventoryUI();
    window.selectCraftItem(state.selectedCraftId); // Cập nhật lại số nguyên liệu hiện tại
    
    // Hiệu ứng nhẹ
    const iconEl = document.getElementById('craft-icon');
    iconEl.style.transform = 'scale(1.5)';
    setTimeout(() => iconEl.style.transform = 'scale(1)', 200);
};

window.teleportTo = (loc) => {
    window.closeTeleportMap();
    window.clearMapState();
    if (loc === 'dungeon') {
        state.currentMap = 'dungeon'; window.changeScene('scene-dungeon');
        document.getElementById('global-player-hud').style.display = 'block'; document.getElementById('skill-panel').style.display = 'flex'; document.getElementById('score-board').style.display = 'flex';
        state.playTime = 0; state.enemies = []; state.boss = null; state.projectiles = []; state.vfxs = []; state.xpOrbs = [];
    } else if (loc === 'forest') {
        state.currentMap = 'forest'; window.changeScene('scene-forest');
        document.getElementById('global-player-hud').style.display = 'block'; document.getElementById('skill-panel').style.display = 'flex'; document.getElementById('score-board').style.display = 'flex';
        initForestMap();
    }
    ui.updateHp(state.player.hp, state.player.maxHp); ui.updateLevel(state.player.level); ui.updateStats(state.player.attack, state.player.speed);
    ui.updateXp(state.player.exp, state.player.nextLevelExp);
    state.isPaused = false; state.lastTime = performance.now(); requestAnimationFrame(gameLoop);
};

window.closeTeleportMap = () => { document.getElementById('teleport-map').style.display = 'none'; state.isPaused = false; state.lastTime = performance.now(); requestAnimationFrame(gameLoop); };
window.resumeGame = () => { state.isPaused = false; ui.toggleScreen('blocker', false); state.lastTime = performance.now(); requestAnimationFrame(gameLoop); };
window.getSaves = () => { const data = localStorage.getItem(SAVE_KEY); return data ? JSON.parse(data) : { slot1: null, slot2: null, slot3: null }; };

window.saveGame = () => {
    if (!state.currentSlot) return;

    const saves = getSaves();
    saves[state.currentSlot] = {
        selectedClass: state.selectedClass,
        currentMap: state.currentMap,
        inventory: state.inventory,
        player: {
            level: state.player.level,
            exp: state.player.exp,
            nextLevelExp: state.player.nextLevelExp, // THÊM DÒNG NÀY
            hp: state.player.hp,
            maxHp: state.player.maxHp,
            attack: state.player.attack,
            speed: state.player.speed,
            attackSpeed: state.player.attackSpeed
        },
        kills: state.kills,
        timestamp: new Date().toLocaleString('vi-VN')
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
    console.log("Đã lưu Tiên Phủ và Tiến trình Kinh nghiệm.");
};

window.loadGame = (slotId) => {
    const saves = getSaves();
    const data = saves[slotId];
    if (!data) return;

    state.currentSlot = slotId;
    state.selectedClass = data.selectedClass;
    state.currentMap = data.currentMap;
    state.kills = data.kills;
    state.player = { ...state.player, ...data.player };

    // THÊM 2 DÒNG NÀY ĐỂ TẢI TÚI ĐỒ
    state.inventory = data.inventory || [];
    updateInventoryUI();

    window.startVillage(true);
};

window.updateSaveSlotsUI = () => {
    const saves = getSaves(); const container = document.getElementById('save-slots'); container.innerHTML = '';
    ['slot1', 'slot2', 'slot3'].forEach((id, index) => {
        const slotData = saves[id]; const div = document.createElement('div'); div.className = `save-slot ${slotData ? '' : 'empty'}`;
        if (slotData) {
            const className = slotData.selectedClass === 'sword' ? 'Kiếm Tiên' : (slotData.selectedClass === 'bow' ? 'Tiên Cung' : 'Phàm Nhân');
            div.innerHTML = `<button class="delete-save-btn" onclick="event.stopPropagation(); window.deleteSave('${id}')">❌</button><div class="slot-name">TIÊN PHỦ ${index + 1}</div><div style="font-size: 50px; margin: 10px 0;">${slotData.selectedClass ? '✨' : '👤'}</div><div class="slot-info">Cảnh giới: <b style="color:white">${slotData.player.level}</b><br>Hệ: <b style="color:#ffaa00">${className}</b><br><span style="font-size: 12px; color: #888">${slotData.timestamp}</span></div><button class="btn" style="margin-top:20px; font-size:12px; padding: 5px 20px; border-color:#00ff00; color:#00ff00;" onclick="event.stopPropagation(); loadGame('${id}')">TẢI TRẬN</button>`;
            div.onclick = () => loadGame(id);
        } else {
            div.innerHTML = `<div class="slot-name" style="color:#444; text-shadow:none;">TRỐNG</div><div style="font-size: 60px; margin: 20px 0; color: #333">+</div><div class="slot-info" style="color: #666;">Bấm để khai mở<br>con đường tu tiên mới</div>`;
            div.onclick = () => startNewGame(id);
        }
        container.appendChild(div);
    });
};
window.deleteSave = (slotId) => { const isConfirm = confirm("Bạn có chắc chắn muốn hủy diệt Tiên Phủ này không? Toàn bộ tu vi sẽ mất vĩnh viễn!"); if (isConfirm) { const saves = getSaves(); saves[slotId] = null; localStorage.setItem(SAVE_KEY, JSON.stringify(saves)); window.updateSaveSlotsUI(); } };
window.startNewGame = (slotId) => {
    state.currentSlot = slotId;

    // RESET TÚI ĐỒ KHI TẠO MỚI
    state.inventory = [];
    updateInventoryUI();

    window.startVillage();
    saveGame();
};

changeScene('scene-main-menu');