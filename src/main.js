import {
    BASE_STATS
    , WEAPONS
    , ENEMY_STATS
    , BOSS_CONFIG
    , DUNGEON_BOSS_CONFIG
    , VISUAL_CONFIG
    , LEVEL_CONFIG
    , XP_ORB_CONFIG
    , ITEMS
    , MAP_CONFIG
} from './data/GameData.js';
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

    mapEnv: { herbs: [], ores: [], trees: [], portal: { x: 0, y: 0 }, decorations: [] },

    mapTimer: 0,
    portalSpawned: false,
    portalPos: { x: 0, y: 0 },
    canEnterPortal: false,
    isInBossMap: false,
    bossLockTimeLeft: 0
};


// =========================================================
// HỆ THỐNG ĐAN DƯỢC (ALCHEMY RECIPES)
// =========================================================
const ALCHEMY_RECIPES = {
    // --- 1. THUỐC HỒI PHỤC (Dùng chung) ---
    'heal_1': {
        id: 'heal_1', name: 'Hồi Huyết Đan', icon: '🧪', type: 'healing', healHp: 500, time: 10,
        desc: 'Hồi 500 HP. Dược liệu cơ bản.',
        req: [{ id: 'herb', count: 5 }]
    },
    'heal_2': {
        id: 'heal_2', name: 'Đại Phục Đan', icon: '🍷', type: 'healing', healHp: 2000, time: 30,
        desc: 'Hồi 2.000 HP. Dược liệu sa mạc.',
        req: [{ id: 'cactus', count: 10 }, { id: 'snake_venom', count: 2 }]
    },
    'heal_3': {
        id: 'heal_3', name: 'Tuyết Liên Đan', icon: '🧊', type: 'healing', healHp: 5000, time: 60,
        desc: 'Hồi 5.000 HP. Dược liệu băng giá.',
        req: [{ id: 'snow_lotus', count: 15 }, { id: 'yeti_fur', count: 3 }]
    },

    // --- 2. ĐAN ĐỘT PHÁ CẢNH GIỚI (Cực kỳ quan trọng) ---

    // Đột phá Lv 9 -> 10 (Mở khóa Sa Mạc) | Farm ở: Thanh Diệp Lâm
    'pill_trucco': {
        id: 'pill_trucco', name: 'Trúc Cơ Đan', icon: '💊', type: 'breakthrough', targetLv: 9, time: 60,
        desc: 'Đột phá Trúc Cơ Kỳ (Lv.10).',
        req: [{ id: 'herb', count: 20 }, { id: 'boar_tusk', count: 10 }, { id: 'boar_king_core', count: 1 }]
    },

    // Đột phá Lv 19 -> 20 (Mở khóa Băng Ngục) | Farm ở: Huyễn Sa Mạc
    'pill_kimdan': {
        id: 'pill_kimdan', name: 'Ngưng Kim Đan', icon: '🟡', type: 'breakthrough', targetLv: 19, time: 120,
        desc: 'Đột phá Kim Đan Kỳ (Lv.20).',
        req: [{ id: 'cactus', count: 30 }, { id: 'scorpion_tail', count: 15 }, { id: 'scorpion_king_core', count: 1 }]
    },

    // Đột phá Lv 29 -> 30 (Mở khóa Hải Vực) | Farm ở: Cực Hàn Băng Ngục
    'pill_nguyenanh': {
        id: 'pill_nguyenanh', name: 'Kết Anh Đan', icon: '🔮', type: 'breakthrough', targetLv: 29, time: 300,
        desc: 'Đột phá Nguyên Anh Kỳ (Lv.30).',
        req: [{ id: 'snow_lotus', count: 40 }, { id: 'ice_bear_claw', count: 20 }, { id: 'frost_ape_core', count: 1 }]
    },

    // Đột phá Lv 39 -> 40 (Mở khóa Diệm Sơn) | Farm ở: Thâm Đáy Hải Vực
    'pill_hoathan': {
        id: 'pill_hoathan', name: 'Tạo Hóa Đan', icon: '🪷', type: 'breakthrough', targetLv: 39, time: 600,
        desc: 'Đột phá Hóa Thần Kỳ (Lv.40).',
        req: [{ id: 'seaweed', count: 50 }, { id: 'shark_fin', count: 25 }, { id: 'flood_dragon_core', count: 1 }]
    },

    // Đột phá Lv 49 -> 50 (Cảnh Giới Tối Thượng) | Farm ở: Luyện Ngục Diệm Sơn
    'pill_luyenhu': {
        id: 'pill_luyenhu', name: 'Hư Không Đan', icon: '🔥', type: 'breakthrough', targetLv: 49, time: 1200,
        desc: 'Đột phá Luyện Hư Kỳ (Lv.50).',
        req: [{ id: 'fire_flower', count: 80 }, { id: 'demon_horn', count: 40 }, { id: 'demon_lord_core', count: 1 }]
    }
};

const CRAFT_RECIPES = {
    // =========================================================
    // TIER 1: THANH DIỆP LÂM (Forest)
    // =========================================================
    'helm_1': { id: 'helm_1', name: 'Nón Trúc', icon: '👒', type: 'helmet', stats: { maxHp: 50 }, req: [{ id: 'copper', count: 5 }, { id: 'boar_tusk', count: 3 }] },
    'armor_1': { id: 'armor_1', name: 'Bì Giáp Sói', icon: '👕', type: 'armor', stats: { maxHp: 150, speed: 5 }, req: [{ id: 'wolf_pelt', count: 8 }, { id: 'copper', count: 5 }] },
    'gloves_1': { id: 'gloves_1', name: 'Sói Trảo Băng', icon: '🧤', type: 'gloves', stats: { attack: 5 }, req: [{ id: 'wolf_pelt', count: 4 }, { id: 'boar_tusk', count: 4 }] },
    'boots_1': { id: 'boots_1', name: 'Tật Phong Hài', icon: '👞', type: 'boots', stats: { speed: 15 }, req: [{ id: 'wolf_pelt', count: 5 }, { id: 'copper', count: 3 }] },
    'ring_1': { id: 'ring_1', name: 'Đồng Giới', icon: '💍', type: 'ring', stats: { attack: 8 }, req: [{ id: 'copper', count: 10 }] },
    'neck_1': { id: 'neck_1', name: 'Nanh Sói Xuyến', icon: '📿', type: 'necklace', stats: { maxHp: 50, attack: 5 }, req: [{ id: 'boar_tusk', count: 8 }, { id: 'copper', count: 5 }] },

    // =========================================================
    // TIER 2: HUYỄN SA MẠC (Desert)
    // =========================================================
    'helm_2': { id: 'helm_2', name: 'Thiết Sa Quán', icon: '🪖', type: 'helmet', stats: { maxHp: 200, attack: 10 }, req: [{ id: 'iron', count: 8 }, { id: 'scorpion_tail', count: 4 }] },
    'armor_2': { id: 'armor_2', name: 'Độc Nhãn Giáp', icon: '🦺', type: 'armor', stats: { maxHp: 400, speed: 10 }, req: [{ id: 'iron', count: 12 }, { id: 'snake_venom', count: 5 }] },
    'gloves_2': { id: 'gloves_2', name: 'Độc Trảo Quyền', icon: '🥊', type: 'gloves', stats: { attack: 25 }, req: [{ id: 'snake_venom', count: 8 }, { id: 'scorpion_tail', count: 5 }] },
    'boots_2': { id: 'boots_2', name: 'Huyễn Sa Hài', icon: '👢', type: 'boots', stats: { speed: 25 }, req: [{ id: 'scorpion_tail', count: 6 }, { id: 'iron', count: 5 }] },
    'ring_2': { id: 'ring_2', name: 'Hắc Thiết Giới', icon: '💍', type: 'ring', stats: { attack: 30 }, req: [{ id: 'iron', count: 15 }, { id: 'snake_venom', count: 2 }] },
    'neck_2': { id: 'neck_2', name: 'Độc Hạt Xuyến', icon: '📿', type: 'necklace', stats: { maxHp: 200, attack: 15 }, req: [{ id: 'scorpion_tail', count: 10 }, { id: 'iron', count: 8 }] },

    // =========================================================
    // TIER 3: CỰC HÀN BĂNG NGỤC (Ice)
    // =========================================================
    'helm_3': { id: 'helm_3', name: 'Băng Tinh Mão', icon: '🧢', type: 'helmet', stats: { maxHp: 600, attack: 25 }, req: [{ id: 'ice_crystal', count: 10 }, { id: 'yeti_fur', count: 5 }] },
    'armor_3': { id: 'armor_3', name: 'Tuyết Hùng Giáp', icon: '🧥', type: 'armor', stats: { maxHp: 1200, speed: 15 }, req: [{ id: 'yeti_fur', count: 15 }, { id: 'ice_bear_claw', count: 5 }] },
    'gloves_3': { id: 'gloves_3', name: 'Băng Hùng Quyền', icon: '🧤', type: 'gloves', stats: { attack: 60 }, req: [{ id: 'ice_bear_claw', count: 8 }, { id: 'ice_crystal', count: 6 }] },
    'boots_3': { id: 'boots_3', name: 'Đạp Tuyết Hài', icon: '👢', type: 'boots', stats: { speed: 40 }, req: [{ id: 'yeti_fur', count: 8 }, { id: 'ice_crystal', count: 5 }] },
    'ring_3': { id: 'ring_3', name: 'Băng Tinh Giới', icon: '💎', type: 'ring', stats: { attack: 80 }, req: [{ id: 'ice_crystal', count: 20 }] },
    'neck_3': { id: 'neck_3', name: 'Băng Xuyên Xuyến', icon: '📿', type: 'necklace', stats: { maxHp: 600, attack: 40 }, req: [{ id: 'ice_bear_claw', count: 10 }, { id: 'yeti_fur', count: 8 }] },

    // =========================================================
    // TIER 4: THÂM ĐÁY HẢI VỰC (Ocean)
    // =========================================================
    'helm_4': { id: 'helm_4', name: 'Cự Giải Quán', icon: '⛑️', type: 'helmet', stats: { maxHp: 1500, attack: 60 }, req: [{ id: 'crab_shell', count: 12 }, { id: 'pearl', count: 5 }] },
    'armor_4': { id: 'armor_4', name: 'Hải Long Giáp', icon: '🛡️', type: 'armor', stats: { maxHp: 3000, speed: 20 }, req: [{ id: 'crab_shell', count: 15 }, { id: 'shark_fin', count: 8 }] },
    'gloves_4': { id: 'gloves_4', name: 'Cuồng Sa Quyền', icon: '🥊', type: 'gloves', stats: { attack: 150 }, req: [{ id: 'shark_fin', count: 10 }, { id: 'crab_shell', count: 8 }] },
    'boots_4': { id: 'boots_4', name: 'Lăng Ba Hài', icon: '👢', type: 'boots', stats: { speed: 60 }, req: [{ id: 'shark_fin', count: 8 }, { id: 'pearl', count: 5 }] },
    'ring_4': { id: 'ring_4', name: 'Trân Châu Giới', icon: '💍', type: 'ring', stats: { attack: 200 }, req: [{ id: 'pearl', count: 25 }] },
    'neck_4': { id: 'neck_4', name: 'Hải Uyên Xuyến', icon: '📿', type: 'necklace', stats: { maxHp: 1500, attack: 100 }, req: [{ id: 'pearl', count: 15 }, { id: 'shark_fin', count: 5 }] },

    // =========================================================
    // TIER 5: LUYỆN NGỤC DIỆM SƠN (Volcano)
    // =========================================================
    'helm_5': { id: 'helm_5', name: 'Hỏa Long Mão', icon: '👑', type: 'helmet', stats: { maxHp: 4000, attack: 150 }, req: [{ id: 'obsidian', count: 15 }, { id: 'demon_horn', count: 5 }] },
    'armor_5': { id: 'armor_5', name: 'Hỏa Long Chân Giáp', icon: '🔱', type: 'armor', stats: { maxHp: 8000, speed: 30 }, req: [{ id: 'dragon_scale', count: 20 }, { id: 'obsidian', count: 10 }] },
    'gloves_5': { id: 'gloves_5', name: 'Ác Quỷ Quyền', icon: '🧤', type: 'gloves', stats: { attack: 400 }, req: [{ id: 'demon_horn', count: 12 }, { id: 'dragon_scale', count: 8 }] },
    'boots_5': { id: 'boots_5', name: 'Cửu U Hài', icon: '👢', type: 'boots', stats: { speed: 80 }, req: [{ id: 'dragon_scale', count: 10 }, { id: 'obsidian', count: 8 }] },
    'ring_5': { id: 'ring_5', name: 'Hắc Diện Giới', icon: '💍', type: 'ring', stats: { attack: 600 }, req: [{ id: 'obsidian', count: 30 }] },
    'neck_5': { id: 'neck_5', name: 'Chân Long Xuyến', icon: '📿', type: 'necklace', stats: { maxHp: 4000, attack: 300 }, req: [{ id: 'dragon_scale', count: 15 }, { id: 'demon_horn', count: 10 }, { id: 'obsidian', count: 5 }] }
};

for (let i = 0; i < 30; i++) {
    state.villageEnv.grass.push({ x: (Math.random() - 0.5) * 2000, y: (Math.random() - 0.5) * 2000 });
}

// --- INPUT BINDINGS ---
input.onEscape = () => {
    if (!state.gameRunning || state.isDead || state.isVictory) return;

    if (state.isEquipmentOpen || state.isInventoryOpen || state.isBlacksmithOpen) {
        state.isEquipmentOpen = false;
        state.isInventoryOpen = false;
        state.isBlacksmithOpen = false;
        updateMenuVisibility();
        return; // Thoát luôn, không chạy xuống lệnh Pause bên dưới
    }

    state.isPaused = !state.isPaused;
    ui.toggleScreen('blocker', state.isPaused);

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
                    window.openMapSelection();
                    document.getElementById('interaction-prompt').style.display = 'none';
                } else alert("Phàm nhân chưa có tu vi, bước vào Trận Pháp sẽ tan xương nát thịt!");
            } else if (distSmith < 120) {
                if (state.selectedClass) {
                    window.openBlacksmith();
                } else {
                    alert("Phàm nhân chưa có tu vi, không thể chịu nổi nhiệt độ của Lò Rèn!");
                }
            }
            return;
        }

        const farmMaps = ['forest', 'desert', 'ice', 'ocean', 'volcano'];
        if (farmMaps.includes(state.currentMap)) {
            if (state.isMining) { state.isMining = false; return; }

            const mapConfig = MAP_CONFIG[state.currentMap];

            if (state.canEnterPortal && !state.isInBossMap) {
                window.enterBossMap();
                return;
            }

            const herb = state.mapEnv.herbs.find(h => Math.hypot(state.player.x - h.x, state.player.y - h.y) < 60);
            if (herb) {
                addItemToInventory(mapConfig.herb.item);
                state.mapEnv.herbs = state.mapEnv.herbs.filter(h => h !== herb); return;
            }

            const ore = state.mapEnv.ores.find(o => Math.hypot(state.player.x - o.x, state.player.y - o.y) < 60);
            if (ore) {
                state.isMining = true; state.miningTimer = 3.0; state.miningTarget = ore; return;
            }

            const distPortal = Math.hypot(state.player.x - state.mapEnv.portal.x, state.player.y - state.mapEnv.portal.y);
            if (distPortal < 80) {
                window.exitToVillage();
                return;
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
        if (state.isInventoryOpen) window.updateInventoryUI();
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
    window.updateEquipmentUI();
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

function applyDamage(entity, baseDmg) {
    // 1. TÍNH TOÁN BẠO KÍCH (CRIT)
    let finalDmg = baseDmg;
    let isCrit = false;

    // Tỷ lệ bạo kích (VD: player.crit = 15 -> 15%)
    const critChance = (state.player.crit || 0) / 100;
    if (Math.random() < critChance) {
        finalDmg = finalDmg * 2; // Sát thương Bạo Kích x2
        isCrit = true;
    }

    finalDmg = Math.floor(finalDmg); // Làm tròn sát thương
    entity.hp -= finalDmg;

    // 2. TẠO CHỮ SÁT THƯƠNG
    const color = isCrit ? '#ff3333' : '#ffcc00';

    // FIX LỖI NaN: Truyền số finalDmg gốc vào để hệ thống tính toán trước
    const dmgEl = ui.createDmgText(finalDmg, color, document.getElementById('damage-container'));

    // SAU ĐÓ mới ghi đè nội dung và chỉnh CSS nếu là Bạo Kích
    if (isCrit) {
        dmgEl.innerText = `💥${finalDmg}`;
        dmgEl.style.fontSize = '35px';
        dmgEl.style.fontWeight = '900';
        dmgEl.style.textShadow = '0 0 15px #ff0000, 2px 2px 5px black';
        dmgEl.style.zIndex = '50';
    }

    // Đẩy hiệu ứng text bay lên (Crit bay cao hơn, tồn tại lâu hơn 1 xíu)
    state.vfxs.push({ type: 'text', el: dmgEl, x: entity.x + (Math.random() - 0.5) * 40, y: entity.y, vy: isCrit ? -80 : -50, life: isCrit ? 1.5 : 1.0 });

    // 3. HIỆU ỨNG MÁU VĂNG (Crit văng nhiều máu hơn)
    const pCount = isCrit ? 15 : 5;
    for (let i = 0; i < pCount; i++) {
        state.vfxs.push({ type: 'particle', x: entity.x, y: entity.y, vx: Math.cos(Math.random() * 6.28) * (Math.random() * 200 + 50), vy: Math.sin(Math.random() * 6.28) * (Math.random() * 200 + 50), life: 0.5, color: '#ff0000' });
    }

    // 4. LOGIC QUÁI CHẾT & RỚT ĐỒ (Giữ nguyên)
    if (entity.hp <= 0) {
        if (entity === state.boss) {
            // VÒNG LẶP RỚT ĐỒ THEO CONFIG CỦA BOSS THƯỜNG
            if (entity.drops) {
                entity.drops.forEach(drop => {
                    if (Math.random() <= drop.rate) {
                        const itemData = Object.values(ITEMS).find(i => i.id === drop.id);
                        if (itemData) {
                            for (let i = 0; i < drop.count; i++) addItemToInventory(itemData);
                            // Rớt chữ tím cực xịn
                            const dropEl = ui.createDmgText(`+${drop.count} ${itemData.name}`, "#ff33ff", document.getElementById('damage-container'));
                            state.vfxs.push({ type: 'text', el: dropEl, x: entity.x + (Math.random() - 0.5) * 100, y: entity.y + (Math.random() - 0.5) * 100, vy: -50, life: 3.0 });
                        }
                    }
                });
                state.player.exp += entity.xp || 0; checkLevelUp(); // Cộng EXP từ boss
            }

            state.boss = null;
            state.isVictory = true;
            ui.toggleScreen('victory-screen', true);
        } else if (state.enemies.includes(entity)) {
            state.xpOrbs.push({ x: entity.x, y: entity.y, value: Math.ceil(entity.maxHp * XP_ORB_CONFIG.xpPerEnemyHp), vx: (Math.random() - 0.5) * 100, vy: (Math.random() - 0.5) * 100 });
            state.enemies = state.enemies.filter(en => en !== entity);
            state.kills++;

            // --- THÊM LOGIC RỚT LINH THẠCH ---
            // Số lượng ngẫu nhiên dựa vào Max HP của quái (Quái càng trâu, rớt càng nhiều)
            const safeMaxHp = entity.maxHp || entity.hp || 10;
            const gemDrop = Math.floor(Math.random() * (safeMaxHp / 5)) + 5;
            state.player.gem += gemDrop;

            // Hiệu ứng chữ Linh Thạch bay lên (Màu xanh dương Cyan)
            const ltEl = document.createElement('div');
            ltEl.style.position = 'absolute';
            ltEl.style.color = '#00ffff';
            ltEl.style.fontWeight = 'bold';
            ltEl.style.fontSize = '18px';
            ltEl.style.textShadow = '0 0 5px #00ffff, 1px 1px 2px black';
            ltEl.style.pointerEvents = 'none';
            ltEl.innerText = `💎 +${gemDrop}`;
            document.getElementById('damage-container').appendChild(ltEl);

            // Bay lệch sang phải một chút để không đè lên text rớt Trang Bị
            state.vfxs.push({ type: 'text', el: ltEl, x: entity.x + 20, y: entity.y - 20, vy: -50, life: 1.2 });

            // Gọi update UI nếu đang mở túi đồ
            if (state.isInventoryOpen) window.updateInventoryUI();

            if (entity.drop && Math.random() < entity.dropRate) {
                addItemToInventory(entity.drop);
                const dropEl = document.createElement('div');
                dropEl.style.position = 'absolute';
                dropEl.style.color = '#55ff55';
                dropEl.style.fontWeight = 'bold';
                dropEl.style.fontSize = '18px';
                dropEl.style.textShadow = '1px 1px 3px black';
                dropEl.style.pointerEvents = 'none';
                dropEl.innerText = `+1 ${entity.drop.name}`;

                document.getElementById('damage-container').appendChild(dropEl);
                state.vfxs.push({ type: 'text', el: dropEl, x: entity.x, y: entity.y - 30, vy: -40, life: 1.5 });
            }
        } else if (state.mountains.includes(entity)) {
            state.mountains = state.mountains.filter(m => m !== entity);
        }

    }
}

function takePlayerDamage(amount) {
    if (state.player.iFrames > 0 || state.isDead || state.isVictory) return;
    state.player.hp = Math.max(0, state.player.hp - amount); state.player.iFrames = 0.5; ui.updateHp(state.player.hp, state.player.maxHp);
    const dmgEl = ui.createDmgText(amount, '#ff0000', document.getElementById('damage-container'));
    state.vfxs.push({ type: 'text', el: dmgEl, x: state.player.x + (Math.random() - 0.5) * 40, y: state.player.y, vy: -50, life: 1.0 });
    if (state.player.hp <= 0) {
        state.isDead = true;
        ui.toggleScreen('game-over-screen', true);
    }
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

function spawnMapEnemy() {
    if (state.enemies.length >= 15) return;
    const mapConfig = MAP_CONFIG[state.currentMap];
    if (!mapConfig) return;

    // Bốc random 1 con quái trong danh sách của map hiện tại
    const enemyTemplate = mapConfig.enemies[Math.floor(Math.random() * mapConfig.enemies.length)];

    const angle = Math.random() * Math.PI * 2;
    const dist = 600 + Math.random() * 200;

    state.enemies.push({
        ...enemyTemplate, // Clone mọi chỉ số (hp, dame, drop...)
        maxHp: enemyTemplate.hp,
        x: state.player.x + Math.cos(angle) * dist,
        y: state.player.y + Math.sin(angle) * dist,
        vx: 0, vy: 0, size: 30
    });
}

function spawnBoss() {
    state.enemies = []; ui.setElementDisplay('boss-warning', 'block'); setTimeout(() => ui.setElementDisplay('boss-warning', 'none'), 3000);
    state.boss = { x: state.player.x, y: state.player.y - 400, hp: DUNGEON_BOSS_CONFIG.maxHp, maxHp: DUNGEON_BOSS_CONFIG.maxHp, speed: DUNGEON_BOSS_CONFIG.speed, size: DUNGEON_BOSS_CONFIG.size, currentCd: 2.0, state: 'idle', timer: 0 };
    ui.setElementDisplay('boss-ui', 'flex');
}

const MAX_INV_SLOTS = 40; // Mở rộng lên 40 ô
function addItemToInventory(item) {
    if (!item) return false;
    const existing = state.inventory.find(i => i.id === item.id);

    if (existing) {
        existing.count++;
    } else {
        // Kiểm tra nếu túi đã chạm mốc 40 ô
        if (state.inventory.length >= MAX_INV_SLOTS) {
            return false; // Trả về false báo hiệu nhặt thất bại
        }
        state.inventory.push({ ...item, count: 1 });
    }
    window.updateInventoryUI();
    return true;
}

window.updateInventoryUI = () => {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // Ép CSS để Lưới (Grid) chứa được 40 ô và hiển thị thanh cuộn (Scrollbar)
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(5, 1fr)'; // Hiển thị 5 cột
    grid.style.gap = '8px';
    grid.style.overflowY = 'auto'; // Bật thanh cuộn dọc
    grid.style.maxHeight = '280px'; // Giới hạn chiều cao để không trào ra khỏi bảng UI
    grid.style.paddingRight = '5px';

    const gemEl = document.getElementById('inv-gem');
    if (gemEl) {
        gemEl.innerText = (state.player.gem || 0).toLocaleString('vi-VN');
        gemEl.title = `${(state.player.gem || 0).toLocaleString('vi-VN')} 💎`;
    }

    // Vẽ 40 ô túi đồ
    for (let i = 0; i < MAX_INV_SLOTS; i++) {
        const item = state.inventory[i];
        if (item) {
            // Hiển thị viền màu phẩm chất cho Trang bị (Đã update ở bài trước)
            const borderColor = item.isEquipment && item.color ? item.color : '#444';
            const shadow = item.rarity === 'epic' || item.rarity === 'rare' ? `box-shadow: 0 0 10px ${borderColor} inset;` : '';

            grid.innerHTML += `
                <div class="inv-slot" style="cursor: ${item.isEquipment ? 'pointer' : 'default'}; border: 1px solid ${borderColor}; ${shadow}"
                     onmouseenter="window.showItemTooltip(event, ${i})"
                     onmouseleave="window.hideItemTooltip()"
                     onmousemove="window.moveItemTooltip(event)"
                     onclick="window.useItem(${i})">
                    <div class="item-icon">${item.icon}</div>
                    <div class="item-count">${item.count > 1 ? item.count : ''}</div>
                </div>`;
        } else {
            // Ô trống
            grid.innerHTML += `<div class="inv-slot" style="background: rgba(0,0,0,0.3); border: 1px dashed #444;"></div>`;
        }
    }
}

function initFarmMap(mapId) {
    state.enemies = []; state.projectiles = []; state.xpOrbs = []; state.vfxs = [];
    state.mapEnv.herbs = []; state.mapEnv.ores = []; state.mapEnv.trees = []; state.mapEnv.decorations = [];

    const mapLimit = 1600;
    const config = MAP_CONFIG[mapId];

    for (let i = -mapLimit; i <= mapLimit; i += 60) {
        state.mapEnv.trees.push({ x: i, y: -mapLimit });
        state.mapEnv.trees.push({ x: i, y: mapLimit });
        state.mapEnv.trees.push({ x: -mapLimit, y: i });
        state.mapEnv.trees.push({ x: mapLimit, y: i });
    }

    for (let i = 0; i < 400; i++) {
        let rx = (Math.random() - 0.5) * 3100;
        let ry = (Math.random() - 0.5) * 3100;
        state.mapEnv.decorations.push({ x: rx, y: ry, type: Math.floor(Math.random() * 3) });
    }

    while (state.mapEnv.herbs.length < 16) {
        let rx = (Math.random() - 0.5) * 3000; let ry = (Math.random() - 0.5) * 3000;
        if (Math.hypot(rx, ry) > 250) state.mapEnv.herbs.push({ x: rx, y: ry });
    }

    while (state.mapEnv.ores.length < 10) {
        let rx = (Math.random() - 0.5) * 3000; let ry = (Math.random() - 0.5) * 3000;
        if (Math.hypot(rx, ry) > 300) state.mapEnv.ores.push({ x: rx, y: ry });
    }
}

window.teleportToMap = (mapId) => {
    const map = MAP_CONFIG[mapId];

    // Kiểm tra level một lần nữa cho chắc chắn
    if (state.player.level < map.minLv) {
        alert(`Tu vi chưa đủ! Cần đạt Cấp ${map.minLv} để vào ${map.name}`);
        return;
    }

    window.closeMapSelection();
    window.clearMapState();

    state.currentMap = mapId;

    if (mapId === 'dungeon') {
        // Logic vào Map Boss
        window.changeScene('scene-dungeon');
        document.getElementById('score-board').style.display = 'flex';
        state.playTime = 0;
    } else {
        // Logic vào các Map Farm
        window.changeScene('scene-forest');
        initFarmMap(mapId);
    }

    document.getElementById('global-player-hud').style.display = 'block';
    document.getElementById('skill-panel').style.display = 'flex';
    state.player.x = 0; state.player.y = 80;

    ui.updateHp(state.player.hp, state.player.maxHp);
    ui.updateLevel(state.player.level);

    // Bắt đầu lại Game Loop
    state.isPaused = false;
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
};

window.clearMapState = () => {

    state.vfxs.forEach(v => {
        if (v.el) v.el.remove();
    });

    const dmgContainer = document.getElementById('damage-container');
    if (dmgContainer) dmgContainer.innerHTML = '';

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

    state.mapTimer = 0;
    state.portalSpawned = false;
    state.canEnterPortal = false;
    state.isInBossMap = false;
    state.bossLockTimeLeft = 0;

    // 4. Reset máu của quái vật map rừng (nếu có)
    state.mapEnv.herbs = [];
    state.mapEnv.ores = [];

    const tutorialEl = document.getElementById('boss-goal-tutorial');
    if (tutorialEl) tutorialEl.style.display = 'none';
    const bossPortalEl = document.getElementById('boss-portal-el');
    if (bossPortalEl) bossPortalEl.style.display = 'none';
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
        let dx = 0, dy = 0;

        if (input.keys.w)
            dy -= 1;
        if (input.keys.s)
            dy += 1;
        if (input.keys.a)
            dx -= 1;
        if (input.keys.d)
            dx += 1;

        if (state.isMining) {
            dx = 0;
            dy = 0;
        }

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

    // ----- LOGIC MAP FARM NGUYÊN LIỆU -----
    const farmMaps = ['forest', 'desert', 'ice', 'ocean', 'volcano'];
    if (farmMaps.includes(state.currentMap)) {
        const mapConfig = MAP_CONFIG[state.currentMap];

        // Chặn Player không cho vượt qua hàng rào (dùng 1560 vì mapLimit = 1600)
        const LIMIT = 1560;
        p.x = Math.max(-LIMIT, Math.min(LIMIT, p.x));
        p.y = Math.max(-LIMIT, Math.min(LIMIT, p.y));

        const promptEl = document.getElementById('interaction-prompt');
        let canInteract = false;

        const distPortal = Math.hypot(p.x - state.mapEnv.portal.x, p.y - state.mapEnv.portal.y);

        if (state.canEnterPortal) {
            promptEl.innerText = "BẤM [E] ĐỂ VÀO ĐỘNG PHỦ YÊU VƯƠNG"; canInteract = true;
        } else if (state.isMining) {
            promptEl.innerText = "BẤM [E] ĐỂ HỦY ĐÀO"; canInteract = true;
            state.miningTimer -= dt;
            if (state.miningTimer <= 0) {
                addItemToInventory(mapConfig.ore.item);
                state.mapEnv.ores = state.mapEnv.ores.filter(o => o !== state.miningTarget);
                state.isMining = false;
            }
        }
        else if (distPortal < 80) {
            promptEl.innerText = "BẤM [E] ĐỂ VỀ LÀNG"; canInteract = true;
        }
        else {
            const closeHerb = state.mapEnv.herbs.find(h => Math.hypot(p.x - h.x, p.y - h.y) < 60);
            const closeOre = state.mapEnv.ores.find(o => Math.hypot(p.x - o.x, p.y - o.y) < 60);
            if (closeHerb) { promptEl.innerText = `BẤM [E] ĐỂ HÁI ${mapConfig.herb.item.name.toUpperCase()}`; canInteract = true; }
            else if (closeOre) { promptEl.innerText = `BẤM [E] ĐỂ ĐÀO ${mapConfig.ore.item.name.toUpperCase()}`; canInteract = true; }
        }
        promptEl.style.display = canInteract ? 'block' : 'none';

    }

    // ========================================================
    // LOGIC ĐỒNG HỒ, XUẤT HIỆN CỔNG BOSS & MA TÔN VỰC
    // ========================================================
    if (state.currentMap !== 'village') {
        state.playTime += dt;
        const tutorialEl = document.getElementById('boss-goal-tutorial');
        if (state.currentMap !== 'village') {
            tutorialEl.style.display = 'block';
            state.mapTimer += dt;

            if (state.isInBossMap) {
                // 1. ĐANG Ở TRONG PHÓ BẢN YÊU VƯƠNG (LOCK TIME)
                state.bossLockTimeLeft -= dt;
                if (state.bossLockTimeLeft <= 0) {
                    state.bossLockTimeLeft = 0;
                    alert("⏳ HẾT GIỜ! Yêu Vương quá mạnh, bạn bị đánh văng về làng!");
                    window.exitToVillage();
                    return;
                }
                const m = Math.floor(state.bossLockTimeLeft / 60);
                const s = Math.floor(state.bossLockTimeLeft % 60).toString().padStart(2, '0');
                tutorialEl.innerText = `⚠️ THỜI GIAN SINH TỬ: ${m}:${s}`;
                tutorialEl.style.color = '#ff3333';

            } else if (state.currentMap === 'dungeon') {
                // 2. MAP SỰ KIỆN: MA TÔN VỰC (Dungeon Cũ)
                if (!state.boss) {
                    const timeLeft = Math.max(0, DUNGEON_BOSS_CONFIG.spawnTime - state.mapTimer);
                    const m = Math.floor(timeLeft / 60);
                    const s = Math.floor(timeLeft % 60).toString().padStart(2, '0');
                    tutorialEl.innerText = `Ma Tôn giá lâm sau: ${m}:${s}`;
                    tutorialEl.style.color = '#ffaa00';
                    if (state.mapTimer >= DUNGEON_BOSS_CONFIG.spawnTime) spawnBoss();
                } else {
                    tutorialEl.innerText = `⚠️ TIÊU DIỆT MA TÔN! ⚠️`;
                    tutorialEl.style.color = '#ff3333';
                }
            } else {
                // 3. MAP FARM: ĐẾM GIỜ MỞ CỔNG YÊU VƯƠNG
                const mapConfig = MAP_CONFIG[state.currentMap];
                if (mapConfig && mapConfig.portalSpawnTime) {
                    if (!state.portalSpawned) {
                        const timeLeft = Math.max(0, mapConfig.portalSpawnTime - state.mapTimer);
                        if (timeLeft <= 0) {
                            state.portalSpawned = true;

                            // Tính toán vị trí ngẫu nhiên cách người chơi một khoảng
                            let targetX = state.player.x + (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 500);
                            let targetY = state.player.y + (Math.random() > 0.5 ? 1 : -1) * (300 + Math.random() * 500);

                            // GIỚI HẠN (CLAMP): Map rộng 1600, chặn ở mức 1450 để cổng không lọt ra ngoài hàng rào
                            const PORTAL_LIMIT = 1450;
                            state.portalPos = {
                                x: Math.max(-PORTAL_LIMIT, Math.min(PORTAL_LIMIT, targetX)),
                                y: Math.max(-PORTAL_LIMIT, Math.min(PORTAL_LIMIT, targetY))
                            };
                        } else {
                            const m = Math.floor(timeLeft / 60);
                            const s = Math.floor(timeLeft % 60).toString().padStart(2, '0');
                            tutorialEl.innerText = `Cánh cửa dẫn đến yêu vương sẽ xuất hiện sau: ${m}:${s}`;
                            tutorialEl.style.color = '#ffaa00';
                        }
                    } else {
                        tutorialEl.innerText = `CÁNH CỬA ĐÃ XUẤT HIỆN! TÌM KIẾM 🌀`;
                        tutorialEl.style.color = '#ff33ff';
                    }
                }
            }
        } else {
            tutorialEl.style.display = 'none';
        }

        // 4. HIỂN THỊ CÁNH CỬA PORTAL (Bằng HTML DOM để sáng đẹp, không cần đụng Renderer.js)
        let bossPortalEl = document.getElementById('boss-portal-el');
        if (state.portalSpawned && !state.isInBossMap && state.currentMap !== 'village') {
            if (!bossPortalEl) {
                bossPortalEl = document.createElement('div');
                bossPortalEl.id = 'boss-portal-el';
                bossPortalEl.style.position = 'absolute';
                bossPortalEl.style.fontSize = '60px';
                bossPortalEl.style.textShadow = '0 0 20px #ff33ff'; // Tỏa sáng màu tím cực mạnh
                bossPortalEl.style.zIndex = '5';
                bossPortalEl.innerText = '🌀';
                document.body.appendChild(bossPortalEl);
            }
            bossPortalEl.style.display = 'block';
            // Tính toán vị trí Render chuẩn xác so với Camera
            bossPortalEl.style.left = (state.portalPos.x - state.camX - 30) + 'px';
            bossPortalEl.style.top = (state.portalPos.y - state.camY - 30) + 'px';

            // Tính toán khoảng cách để hiện nút [E]
            const dist = Math.hypot(p.x - state.portalPos.x, p.y - state.portalPos.y);
            state.canEnterPortal = dist < 80;
        } else if (bossPortalEl) {
            bossPortalEl.style.display = 'none';
            state.canEnterPortal = false;
        }

        // ========================================================
        // LOGIC SPAWN QUÁI (ĐÃ GỘP CHUNG)
        // ========================================================
        state.lastSpawn += dt;
        if (!state.isInBossMap && !state.boss) { // Không đẻ quái thường khi đang đánh Boss
            const farmMaps = ['forest', 'desert', 'ice', 'ocean', 'volcano'];

            if (farmMaps.includes(state.currentMap)) {
                // Map Farm: 3 giây đẻ 1 con
                if (state.lastSpawn > 3.0) {
                    spawnMapEnemy();
                    state.lastSpawn = 0;
                }
            } else if (state.currentMap === 'dungeon') {
                // Map Ma Tôn: Đẻ nhanh theo ENEMY_STATS.spawnRate
                if (state.lastSpawn > ENEMY_STATS.spawnRate) {
                    spawnDungeonEnemy();
                    state.lastSpawn = 0;
                }
            }
        }

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
    if (state.currentMap !== 'village') {
        for (let k in state.cd) { if (state.cd[k] > 0) { state.cd[k] -= dt; if (state.cd[k] <= 0) state.cd[k] = 0; if (state.selectedClass) ui.updateCd(k, state.cd[k], getSkillCd(k)); } }

        state.enemies.forEach(e => {
            const ang = Math.atan2(p.y - e.y, p.x - e.x); e.x += Math.cos(ang) * e.speed * dt; e.y += Math.sin(ang) * e.speed * dt;
            if (e.isTossed > 0) e.isTossed -= dt;
            if (Math.hypot(p.x - e.x, p.y - e.y) < 30 + e.size / 2) takePlayerDamage(e.damage);
        });

        if (state.boss) {
            const b = state.boss;
            ui.setElementDisplay('boss-ui', 'flex');
            document.getElementById('boss-name').innerText = b.name || "MA TÔN";
            document.getElementById('boss-hp-fill').style.width = (b.hp / b.maxHp * 100) + '%';
            document.getElementById('boss-hp-text').innerText = Math.ceil(b.hp) + ' / ' + b.maxHp;

            if (b.state === 'idle') {
                const ang = Math.atan2(p.y - b.y, p.x - b.x); b.x += Math.cos(ang) * b.speed * dt; b.y += Math.sin(ang) * b.speed * dt;
                if (Math.hypot(p.x - b.x, p.y - b.y) < (b.size / 2 + 20)) takePlayerDamage(b.damage || 20); // Dùng dmg config
                b.currentCd -= dt;
                if (b.currentCd <= 0) {
                    b.skillType = Math.floor(Math.random() * 3); b.state = b.skillType === 2 ? 'firing' : 'casting'; b.timer = b.skillType === 2 ? 3.0 : 1.5; b.targetX = p.x; b.targetY = p.y;
                    if (b.skillType === 0) state.vfxs.push({ type: 'bossAOE', x: p.x, y: p.y, life: 1.5, maxLife: 1.5, radius: 150 });
                    else if (b.skillType === 1) { b.pendingMountains = []; for (let i = 0; i < 20; i++) { const rx = p.x + (Math.random() - 0.5) * 1200, ry = p.y + (Math.random() - 0.5) * 1200; state.vfxs.push({ type: 'mountainWarning', x: rx, y: ry, life: 1.5, maxLife: 1.5, radius: 25 }); b.pendingMountains.push({ x: rx, y: ry }); } }
                }
            } else if (b.state === 'casting') {
                b.timer -= dt;
                if (b.timer <= 0) {
                    if (b.skillType === 0) { state.vfxs.push({ type: 'circle', color: 'rgba(255,0,0,0.6)', x: b.targetX, y: b.targetY, radius: 150, life: 0.5, maxLife: 0.5 }); if (Math.hypot(p.x - b.targetX, p.y - b.targetY) <= 150) takePlayerDamage(b.damage || 50); }
                    else if (b.skillType === 1 && b.pendingMountains) { b.pendingMountains.forEach(pos => state.mountains.push({ x: pos.x, y: pos.y, radius: 25, hp: 40, maxHp: 40 })); b.pendingMountains = []; }
                    b.state = 'idle'; b.currentCd = 4.0;
                }
            } else if (b.state === 'firing') {
                b.timer -= dt; b.fireTick = (b.fireTick || 0) - dt;
                if (b.fireTick <= 0) { state.projectiles.push({ x: b.x, y: b.y, vx: Math.cos(Math.atan2(p.y - b.y, p.x - b.x)) * 500, vy: Math.sin(Math.atan2(p.y - b.y, p.x - b.x)) * 500, life: 3.0, type: 'bossOrb', dmg: (b.damage / 2) || 20 }); b.fireTick = 0.15; }
                if (b.timer <= 0) { b.state = 'idle'; b.currentCd = 4.0; }
            }
        } else {
            ui.setElementDisplay('boss-ui', 'none');
        }

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

        // TỰ ĐỘNG TÌM XEM CẤP ĐỘ HIỆN TẠI CÓ CẦN ĐAN ĐỘT PHÁ KHÔNG?
        let requiredPill = null;
        for (let key in ALCHEMY_RECIPES) {
            const recipe = ALCHEMY_RECIPES[key];
            if (recipe.type === 'breakthrough' && recipe.targetLv === state.player.level) {
                requiredPill = recipe;
                break; // Tìm thấy thuốc rồi thì dừng vòng lặp
            }
        }

        // NẾU TÌM THẤY THUỐC -> CHỨNG TỎ ĐANG KẸT BÌNH CẢNH
        if (requiredPill) {
            // KẸT BÌNH CẢNH: Ép EXP dừng đúng ở mức 100%
            state.player.exp = state.player.nextLevelExp;

            // Thỉnh thoảng hiện chữ cảnh báo lấy trực tiếp tên của Đan Dược đó
            if (Math.random() < 0.1) {
                const bcEl = ui.createDmgText(`⚠️ BÌNH CẢNH: CẦN ${requiredPill.name.toUpperCase()}!`, "#ff3333", document.getElementById('damage-container'));
                bcEl.style.fontSize = '15px';
                bcEl.style.fontWeight = 'bold';
                bcEl.style.textShadow = '0 0 5px black';
                state.vfxs.push({ type: 'text', el: bcEl, x: state.player.x, y: state.player.y - 40, vy: -30, life: 1.5 });
            }
        }
        // NẾU KHÔNG CẦN THUỐC -> LÊN CẤP BÌNH THƯỜNG
        else {
            state.player.level++;
            state.player.exp -= state.player.nextLevelExp;
            state.player.nextLevelExp = Math.floor(state.player.nextLevelExp * 1.5);

            // Thưởng chỉ số khi lên cấp bình thường
            state.player.maxHp += 20;
            state.player.hp = state.player.maxHp;
            state.player.attack += 2;

            // Hiệu ứng chữ Thăng Cấp
            const levelUpEl = ui.createDmgText("THĂNG CẤP!", "#00ffff", document.getElementById('damage-container'));
            levelUpEl.style.fontSize = '25px';
            levelUpEl.style.fontWeight = 'bold';
            levelUpEl.style.textShadow = '0 0 10px #00ffff';
            state.vfxs.push({ type: 'text', el: levelUpEl, x: state.player.x, y: state.player.y - 40, vy: -50, life: 1.5 });
        }
    }

    // Cập nhật lại thanh UI phía trên cùng
    ui.updateXp(state.player.exp, state.player.nextLevelExp);
    ui.updateLevel(state.player.level);
    ui.updateHp(state.player.hp, state.player.maxHp);
}

// --- SCENE & MENU MANAGEMENT ---
window.changeScene = function (sceneId) {
    document.querySelectorAll('.scene').forEach(s => s.style.display = 'none');
    const target = document.getElementById(sceneId);
    if (target) target.style.display = 'block'; else console.error("Không tìm thấy Scene ID: " + sceneId);
};

window.startVillage = (isLoad = false) => {
    state.currentMap = 'village';
    window.changeScene('scene-village');

    if (!isLoad) {
        state.selectedClass = null;
        state.player = { x: 0, y: 0, angle: 0, speed: 150, hp: 100, maxHp: 100, attack: 5, attackSpeed: 1, crit: 0, gem: 0, level: 1, exp: 0, nextLevelExp: 100, iFrames: 0, isDashing: false, dashTime: 0, dashDir: { x: 0, y: 0 }, equipment: { weapon: null, helmet: null, armor: null, gloves: null, boots: null, ring1: null, ring2: null, necklace: null, mount: null } };
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
    document.getElementById('interaction-prompt').style.display = 'none';
    window.changeScene('scene-class-selection');
    document.getElementById('global-player-hud').style.display = 'none';
};

window.selectClass = (cls) => {
    state.selectedClass = cls; ui.toggleScreen('class-selection', false);
    const w = WEAPONS[cls];
    state.player.maxHp = BASE_STATS.maxHp + w.bonus.hp; state.player.hp = state.player.maxHp; state.player.attack = BASE_STATS.attack + w.bonus.attack; state.player.speed = BASE_STATS.speed + w.bonus.speed; state.player.attackSpeed = BASE_STATS.attackSpeed + w.bonus.attackSpeed;
    const eqWeapon = document.getElementById('eq-weapon'); if (eqWeapon) eqWeapon.innerText = (cls === 'sword' ? '🗡️' : '🏹');
    window.startVillage(true); if (window.saveGame) window.saveGame();
};

window.exitToVillage = () => {
    // 1. Reset các trạng thái kết thúc game (phòng trường hợp đang ở màn hình Chết/Thắng)
    state.isDead = false;
    state.isVictory = false;

    // 2. Hồi đầy máu cho nhân vật
    state.player.hp = state.player.maxHp;

    // 3. Tắt trạng thái Pause và ẩn toàn bộ các màn hình overlay
    state.isPaused = false;
    ui.toggleScreen('blocker', false);
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('victory-screen').style.display = 'none';

    // 4. Quay về làng (isLoad = true để giữ nguyên level/exp/túi đồ)
    window.startVillage(true);

    console.log("Đã phục hồi trạng thái và trở về làng.");
};

// ================= HỆ THỐNG LÒ RÈN =================


// --- HỆ THỐNG ROLL OPTIONS (CHỈ SỐ PHỤ) ---
const RARITY_COLORS = {
    'normal': '#cccccc',   // Trắng (Thường)
    'magic': '#33ff55',    // Xanh lá (Tốt)
    'rare': '#cc33ff',     // Tím (Hiếm)
    'epic': '#ffaa00'      // Vàng (Tuyệt Phẩm)
};

function generateRandomSubStats(tier) {
    // 1. Roll Phẩm chất (Rarity)
    const roll = Math.random();
    let rarity, maxStats, multiplier;

    if (roll < 0.05) { rarity = 'epic'; maxStats = 3; multiplier = 2.0; } // 5% ra Tuyệt Phẩm
    else if (roll < 0.20) { rarity = 'rare'; maxStats = 2; multiplier = 1.5; } // 15% ra Hiếm
    else if (roll < 0.60) { rarity = 'magic'; maxStats = 1; multiplier = 1.0; } // 40% ra Tốt
    else { rarity = 'normal'; maxStats = 0; multiplier = 0; } // 40% ra Thường (Không có dòng phụ)

    let subStats = [];
    if (maxStats > 0) {
        // Danh sách các dòng phụ có thể roll ra (scale theo Bậc của trang bị)
        const possibleOptions = [
            { type: 'maxHp', name: 'Máu tối đa', val: Math.floor((Math.random() * 50 + 20) * tier * multiplier) },
            { type: 'attack', name: 'Công kích', val: Math.floor((Math.random() * 10 + 5) * tier * multiplier) },
            { type: 'speed', name: 'Tốc chạy', val: Math.floor((Math.random() * 5 + 2) * multiplier) },
            { type: 'crit', name: 'Tỷ lệ bạo kích', val: Math.floor((Math.random() * 3 + 1) * multiplier) } // %
        ];

        // Xáo trộn và bốc ngẫu nhiên số lượng dòng theo Rarity
        possibleOptions.sort(() => 0.5 - Math.random());
        for (let i = 0; i < maxStats; i++) {
            subStats.push(possibleOptions[i]);
        }
    }

    return { rarity: rarity, stats: subStats, color: RARITY_COLORS[rarity] };
}

window.formatShortNumber = (num) => {
    if (num >= 1e9) return (Math.floor(num / 1e7) / 100) + 'B'; // Tỷ
    if (num >= 1e6) return (Math.floor(num / 1e4) / 100) + 'M'; // Triệu
    if (num >= 1e3) return (Math.floor(num / 10) / 100) + 'K';  // Nghìn
    return num.toString();
}

state.currentBlacksmithTier = 1; // Mặc định là Bậc 1

window.switchBlacksmithTab = (tier) => {
    state.currentBlacksmithTier = tier;

    // --- 1. CẤU HÌNH GIAO DIỆN THEO BẬC (TIER CONFIG) ---
    const tierConfig = {
        1: { color: '#dddddd', bg: 'rgba(255, 255, 255, 0.05)', glow: 'none', label: 'PHÀM KHÍ' },
        2: { color: '#55ff55', bg: 'rgba(85, 255, 85, 0.05)', glow: '0 0 10px rgba(85,255,85,0.2)', label: 'LINH KHÍ' },
        3: { color: '#00ffff', bg: 'rgba(0, 255, 255, 0.05)', glow: '0 0 12px rgba(0,255,255,0.3)', label: 'BẢO KHÍ' },
        4: { color: '#cc33ff', bg: 'rgba(204, 51, 255, 0.08)', glow: '0 0 15px rgba(204,51,255,0.4)', label: 'TIÊN KHÍ' },
        5: { color: '#ffaa00', bg: 'rgba(255, 170, 0, 0.1)', glow: '0 0 20px rgba(255,170,0,0.5) inset, 0 0 10px rgba(255,170,0,0.5)', label: 'THẦN KHÍ' }
    };

    const theme = tierConfig[tier];

    // --- 2. CẬP NHẬT MÀU SẮC CÁC NÚT TAB Ở TRÊN CÙNG ---
    for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById(`bs-tab-${i}`);
        if (i === tier) {
            btn.style.borderColor = theme.color;
            btn.style.color = theme.color;
            btn.style.background = theme.bg;
            btn.style.boxShadow = theme.glow;
        } else {
            btn.style.borderColor = '#555';
            btn.style.color = '#aaa';
            btn.style.background = 'transparent';
            btn.style.boxShadow = 'none';
        }
    }

    // --- 3. ĐỔ DỮ LIỆU CÁC THẺ CARD TRANG BỊ ---
    const container = document.getElementById('bs-card-container');
    container.innerHTML = '';

    for (let key in CRAFT_RECIPES) {
        if (!key.endsWith('_' + tier)) continue;

        const item = CRAFT_RECIPES[key];

        let statsStr = "";
        if (item.stats.maxHp) statsStr += `❤️ HP: +${item.stats.maxHp}<br>`;
        if (item.stats.attack) statsStr += `⚔️ Công: +${item.stats.attack}<br>`;
        if (item.stats.speed) statsStr += `👟 Tốc: +${item.stats.speed}`;

        let matStr = "";
        let canCraft = true;
        item.req.forEach(r => {
            const invItem = state.inventory.find(i => i.id === r.id);
            const count = invItem ? invItem.count : 0;
            const isEnough = count >= r.count;
            if (!isEnough) canCraft = false;

            const baseItem = Object.values(ITEMS).find(i => i.id === r.id) || { name: r.id, icon: '❓' };

            matStr += `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-size: 13px; color: #ccc;">${baseItem.icon} ${baseItem.name}</span>
                    <span style="font-size: 13px; font-weight: bold; color: ${isEnough ? '#00ff00' : '#ff3333'};">${count}/${r.count}</span>
                </div>
            `;
        });

        const craftCost = tier * 100;
        const hasEnoughGem = state.player.gem >= craftCost;
        if (!hasEnoughGem) canCraft = false; // Thiếu tiền thì khóa nút Rèn

        const shortGem = window.formatShortNumber(state.player.gem);
        const shortCost = window.formatShortNumber(craftCost);
        // Vẽ Thẻ Card với Theme của Bậc hiện tại
        container.innerHTML += `
            <div class="class-card" style="width: 155px; padding: 10px; display: flex; flex-direction: column; border: 1px solid ${canCraft ? theme.color : '#444'}; background: ${canCraft ? theme.bg : 'rgba(0,0,0,0.6)'}; border-radius: 8px; box-shadow: ${canCraft ? theme.glow : 'none'}; position: relative; overflow: hidden; transition: 0.3s; height: 100%;">
                
                <div style="position: absolute; top: 0; right: 0; background: ${canCraft ? theme.color : '#555'}; color: #000; font-size: 9px; font-weight: bold; padding: 3px 6px; border-bottom-left-radius: 5px;">
                    ${theme.label}
                </div>

                <div style="display: flex; flex-direction: column; flex-grow: 1;">
                    <div style="font-size: 35px; text-align: center; margin-bottom: 5px; margin-top: 8px; text-shadow: 0 0 10px ${canCraft ? theme.color : 'transparent'};">
                        ${item.icon}
                    </div>
                    
                    <div class="class-title" style="font-size: 15px; color: ${canCraft ? theme.color : '#aaa'}; text-align: center; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 0 5px ${canCraft ? theme.color : 'transparent'};">
                        ${item.name}
                    </div>
                    
                    <div style="font-size: 11px; color: #fff; background: rgba(0, 0, 0, 0.4); padding: 5px; border-radius: 5px; margin-bottom: 8px; text-align: center; min-height: 35px; display: flex; flex-direction: column; justify-content: center; line-height: 1.4; border: 1px solid rgba(255,255,255,0.1);">
                        ${statsStr}
                    </div>
                    
                    <div style="background: rgba(0, 0, 0, 0.5); padding: 5px; border-radius: 5px; border: 1px solid rgba(0,0,0,0.8); display: flex; flex-direction: column; flex-grow: 1;">
                        
                        <div>
                            ${matStr}
                        </div>
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 5px; border-top: 1px dashed rgba(255,255,255,0.2);">
                            <span style="font-size: 13px; color: #00ffff;">💎 Phí Rèn</span>
                            <span style="font-size: 13px; font-weight: bold; color: ${hasEnoughGem ? '#00ffff' : '#ff3333'};" title="Sở hữu: ${(state.player.gem || 0).toLocaleString('vi-VN')}">
                                ${shortGem} / ${shortCost}
                            </span>
                        </div>

                    </div>
                </div>
                
                <button class="btn" style="margin-top: 10px; padding: 6px; width: 100%; font-size: 11px; font-weight: bold; border-color: ${canCraft ? theme.color : '#555'}; color: ${canCraft ? '#fff' : '#555'}; background: ${canCraft ? theme.color + '33' : 'transparent'}; pointer-events: ${canCraft ? 'auto' : 'none'}; text-shadow: 1px 1px 2px black;" 
                    onclick="window.executeCraft('${key}')">
                    ${canCraft ? 'RÈN ĐÚC' : 'THIẾU VẬT LIỆU'}
                </button>
            </div>
        `;
    }
};

window.executeCraft = (key) => {
    const item = CRAFT_RECIPES[key];

    // ==========================================
    // 0. KIỂM TRA ĐIỀU KIỆN TÚI ĐẦY TRƯỚC KHI RÈN
    // ==========================================
    let slotsUsed = state.inventory.length;

    item.req.forEach(r => {
        const invItem = state.inventory.find(i => i.id === r.id);
        // Nếu số lượng khoáng thạch dùng bằng đúng số đang có trong túi, ta sẽ mất ô đó -> trống 1 ô
        if (invItem && invItem.count <= r.count) {
            slotsUsed--;
        }
    });

    if (slotsUsed >= MAX_INV_SLOTS) {
        // Bắn chữ cảnh báo màu đỏ chói giữa màn hình
        const errEl = document.createElement('div');
        errEl.style.position = 'absolute';
        errEl.style.color = '#ff3333';
        errEl.style.fontWeight = 'bold';
        errEl.style.fontSize = '26px';
        errEl.style.textShadow = '0 0 15px #ff3333, 2px 2px 5px black';
        errEl.style.pointerEvents = 'none';
        errEl.style.zIndex = '100';
        errEl.style.left = '50%';
        errEl.style.top = '50%';
        errEl.style.transform = 'translate(-50%, -50%)';
        errEl.innerText = `❌ Túi đồ đã đầy! Vui lòng bán hoặc dọn dẹp.`;
        document.body.appendChild(errEl);

        let life = 1.0; let posY = 50;
        const anim = setInterval(() => {
            life -= 0.05; posY += 2;
            errEl.style.top = `calc(50% - ${posY}px)`;
            errEl.style.opacity = life;
            if (life <= 0) { clearInterval(anim); errEl.remove(); }
        }, 50);

        return; // Dừng việc chế tạo lại ngay lập tức
    }
    // ==========================================

    const craftCost = state.currentBlacksmithTier * 100;
    if (state.player.gem < craftCost) return; // Đề phòng click trộm
    state.player.gem -= craftCost;

    item.req.forEach(r => {
        const invItem = state.inventory.find(i => i.id === r.id);
        if (invItem) invItem.count -= r.count;
    });

    state.inventory = state.inventory.filter(i => i.count > 0);
    window.updateInventoryUI();

    // --- THÊM LOGIC ĐỔ XÚC XẮC Ở ĐÂY ---
    const options = generateRandomSubStats(state.currentBlacksmithTier);

    // Cộng gộp dòng chính (stats) và dòng phụ (subStats) lại
    const finalStats = { ...item.stats };
    options.stats.forEach(opt => {
        if (!finalStats[opt.type]) finalStats[opt.type] = 0;
        finalStats[opt.type] += opt.val;
    });

    addItemToInventory({
        id: item.id + '_' + Date.now(), // Thêm Date.now để mỗi món đồ là duy nhất (không bị gộp dồn trong túi)
        name: item.name,
        icon: item.icon,
        type: item.type,
        stats: finalStats,           // Chỉ số đã được cộng gộp
        subOptions: options.stats,   // Lưu lại dòng phụ để hiển thị
        rarity: options.rarity,      // Lưu lại phẩm chất
        color: options.color,        // Lưu màu viền
        isEquipment: true
    });

    // Cập nhật dòng chữ thông báo theo màu phẩm chất
    const notiEl = document.createElement('div');
    notiEl.style.position = 'absolute';
    notiEl.style.color = options.color; // Chữ sáng theo màu Tuyệt phẩm, Hiếm...
    notiEl.style.fontWeight = 'bold';
    notiEl.style.fontSize = '30px';
    notiEl.style.textShadow = `0 0 15px ${options.color}, 2px 2px 5px black`;
    notiEl.style.pointerEvents = 'none';
    notiEl.style.zIndex = '100';
    notiEl.style.left = '50%';
    notiEl.style.top = '50%';
    notiEl.style.transform = 'translate(-50%, -50%)';

    // Thay đổi thông báo nếu ra đồ ngon
    let prefix = "";
    if (options.rarity === 'epic') prefix = "🎉 Cực Phẩm: ";
    else if (options.rarity === 'rare') prefix = "✨ Trân Phẩm: ";

    notiEl.innerText = `${prefix} Chế tạo thành công: ${item.name}!`;
    document.body.appendChild(notiEl);

    let life = 1.0; let posY = 50;
    const anim = setInterval(() => {
        life -= 0.05; posY += 2;
        notiEl.style.top = `calc(50% - ${posY}px)`;
        notiEl.style.opacity = life;
        if (life <= 0) { clearInterval(anim); notiEl.remove(); }
    }, 50);

    window.switchBlacksmithTab(state.currentBlacksmithTier);
};

window.openBlacksmith = () => {
    state.isBlacksmithOpen = true;
    document.getElementById('interaction-prompt').style.display = 'none';
    updateMenuVisibility();

    // Luôn load dữ liệu Bậc hiện tại khi mở Lò Rèn
    window.switchBlacksmithTab(state.currentBlacksmithTier);
};

window.closeBlacksmith = () => {
    state.isBlacksmithOpen = false;
    updateMenuVisibility();
};

// MAP SECLECTION

window.switchPortalTab = (tab) => {
    const btnFarm = document.getElementById('tab-btn-farm');
    const btnEvent = document.getElementById('tab-btn-event');
    const tabFarm = document.getElementById('portal-tab-farm');
    const tabEvent = document.getElementById('portal-tab-event');

    if (tab === 'farm') {
        btnFarm.style.borderColor = '#00ffff'; btnFarm.style.color = '#00ffff';
        btnEvent.style.borderColor = '#555'; btnEvent.style.color = '#aaa';
        tabFarm.style.display = 'flex';
        tabEvent.style.display = 'none';
    } else {
        btnEvent.style.borderColor = '#00ffff'; btnEvent.style.color = '#00ffff';
        btnFarm.style.borderColor = '#555'; btnFarm.style.color = '#aaa';
        tabEvent.style.display = 'flex';
        tabFarm.style.display = 'none';
    }
};

window.openMapSelection = () => {
    state.isPaused = true;
    document.getElementById('map-selection-panel').style.display = 'flex';
    document.getElementById('interaction-prompt').style.display = 'none';

    window.switchPortalTab('farm'); // Mặc định mở Tab Farm

    const farmTab = document.getElementById('portal-tab-farm');
    const eventTab = document.getElementById('portal-tab-event');

    farmTab.innerHTML = '';
    eventTab.innerHTML = '';

    for (const key in MAP_CONFIG) {
        const map = MAP_CONFIG[key];
        const canEnter = state.player.level >= map.minLv;

        // Tạo HTML cho Card
        const cardHTML = `
            <div class="class-card" 
                 style="width: 200px; padding: 15px; ${canEnter ? '' : 'opacity: 0.6; cursor: not-allowed; border-color: #555;'}" 
                 onclick="${canEnter ? `window.teleportToMap('${key}')` : ''}">
                <div style="font-size: 40px;">${map.icon}</div>
                <div class="class-title" style="font-size: 18px; color: ${canEnter ? '#00ffff' : '#777'};">${map.name}</div>
                <div style="font-size: 13px; margin: 5px 0; color: ${canEnter ? '#00ff00' : '#ff3333'};">
                    ${canEnter ? `Cấp yêu cầu: ${map.minLv}+` : `Khóa: Cần Cấp ${map.minLv}`}
                </div>
                <p style="font-size: 11px; color: #aaa; margin: 0;">
                    ${map.type === 'farm' ? '(Farm Nguyên Liệu)' : `(${map.desc})`}
                </p>
            </div>
        `;

        // Bỏ vào đúng Tab
        if (map.type === 'farm') farmTab.innerHTML += cardHTML;
        else eventTab.innerHTML += cardHTML;
    }
};

window.closeMapSelection = () => {
    state.isPaused = false;
    document.getElementById('map-selection-panel').style.display = 'none';
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
};

// ================= HỆ THỐNG TOOLTIP & TRANG BỊ =================

window.showItemTooltip = (e, itemOrIndex, isEquipped = false) => {
    // Lấy item từ inventory (nếu truyền số) hoặc dùng luôn object
    const item = (typeof itemOrIndex === 'number') ? state.inventory[itemOrIndex] : itemOrIndex;
    if (!item) return;

    const tt = document.getElementById('item-tooltip');

    // Đổi màu tên món đồ theo phẩm chất, mặc định là vàng cam
    document.getElementById('tt-name').innerText = item.name;
    document.getElementById('tt-name').style.color = item.color || '#ffaa00';

    const typeVN = { 'helmet': 'Nón', 'armor': 'Áo giáp', 'gloves': 'Bao tay', 'boots': 'Giày', 'ring': 'Nhẫn', 'necklace': 'Dây chuyền', 'ring1': 'Nhẫn', 'ring2': 'Nhẫn' };
    document.getElementById('tt-type').innerText = 'Loại: ' + (typeVN[item.type] || item.type || 'Vật phẩm');

    let desc = '';
    if (item.isEquipment) {
        // Lọc lấy đúng ID gốc để lấy chỉ số cơ bản (vì ID lúc rèn có nối thêm thời gian)
        let baseStats = item.stats;
        if (item.id) {
            const idParts = item.id.split('_');
            if (idParts.length >= 2) {
                const baseId = idParts[0] + '_' + idParts[1];
                // Lấy chỉ số cơ bản từ sổ tay chế tạo để không bị trộn lẫn với dòng phụ
                if (CRAFT_RECIPES[baseId]) {
                    baseStats = CRAFT_RECIPES[baseId].stats;
                }
            }
        }

        // Vẽ Thuộc tính cơ bản
        desc += `<div style="color: #00ffff; font-size: 13px; margin-bottom: 5px;">--- Thuộc tính cơ bản ---</div>`;
        if (baseStats.maxHp) desc += `❤️ HP: +${baseStats.maxHp}<br>`;
        if (baseStats.attack) desc += `⚔️ Công: +${baseStats.attack}<br>`;
        if (baseStats.speed) desc += `👟 Tốc: +${baseStats.speed}<br>`;

        // Vẽ Option ngẫu nhiên (nếu có)
        if (item.subOptions && item.subOptions.length > 0) {
            desc += `<div style="color: ${item.color || '#ffaa00'}; font-size: 13px; margin-top: 8px; margin-bottom: 5px;">--- Dòng phụ (Tẩy luyện) ---</div>`;
            item.subOptions.forEach(opt => {
                let suffix = opt.type === 'crit' ? '%' : '';
                desc += `<span style="color: #ffaa00;">✦ ${opt.name}: +${opt.val}${suffix}</span><br>`;
            });
        }
    } else {
        // Giao diện cho vật phẩm không phải trang bị (nguyên liệu)
        desc = '<span style="color: #ccc;">Nguyên liệu dùng để chế tạo.</span>';
    }

    document.getElementById('tt-desc').innerHTML = desc;

    const actionEl = document.getElementById('tt-action');
    if (item.isEquipment) {
        actionEl.innerText = isEquipped ? '🖱️ Chuột trái để Tháo' : '🖱️ Chuột trái để Trang bị';
        actionEl.style.display = 'block';
    } else {
        actionEl.style.display = 'none';
    }

    tt.style.display = 'block';
    tt.style.left = (e.pageX + 15) + 'px';
    tt.style.top = (e.pageY + 15) + 'px';
};

window.hideItemTooltip = () => { document.getElementById('item-tooltip').style.display = 'none'; };

window.moveItemTooltip = (e) => {
    const tt = document.getElementById('item-tooltip');
    if (tt.style.display === 'block') { tt.style.left = (e.pageX + 15) + 'px'; tt.style.top = (e.pageY + 15) + 'px'; }
};

window.applyEquipmentStats = (item, isEquipping) => {
    if (!item || !item.stats) return;
    const sign = isEquipping ? 1 : -1;

    if (item.stats.maxHp) {
        state.player.maxHp += item.stats.maxHp * sign;
        // Tránh tình trạng máu hiện tại cao hơn maxHp khi tháo đồ
        if (!isEquipping && state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;
        // Bơm máu khi mặc đồ có maxHp
        if (isEquipping) state.player.hp += item.stats.maxHp;
    }
    if (item.stats.attack) state.player.attack += item.stats.attack * sign;
    if (item.stats.speed) state.player.speed += item.stats.speed * sign;

    // THÊM LOGIC CỘNG/TRỪ CHỈ SỐ BẠO KÍCH (CRIT) TẠI ĐÂY
    if (item.stats.crit) {
        // Đảm bảo nhân vật có sẵn gốc crit = 0 nếu chưa được khởi tạo
        if (state.player.crit === undefined) state.player.crit = 0;
        state.player.crit += item.stats.crit * sign;
    }
};

// Hàm MẶC trang bị
window.useItem = (index) => {
    const item = state.inventory[index];
    if (!item) return;

    // Ẩn Tooltip ngay khi click để tránh bị kẹt UI
    window.hideItemTooltip();

    // ===============================================
    // LOGIC 1: ĐAN HỒI PHỤC (Healing)
    // ===============================================
    if (item.type === 'healing') {
        if (state.player.hp >= state.player.maxHp) {
            alert("⚠️ Khí huyết đã đầy, không cần dùng đan dược!");
            return;
        }

        // Hồi máu
        state.player.hp += item.healHp;
        if (state.player.hp > state.player.maxHp) state.player.hp = state.player.maxHp;

        // Trừ vật phẩm
        if (item.count > 1) item.count--;
        else state.inventory.splice(index, 1);

        // Hiệu ứng chữ máu nhảy lên cực ngầu
        const healEl = document.createElement('div');
        healEl.style.position = 'absolute';
        healEl.style.color = '#55ff55';
        healEl.style.fontWeight = 'bold';
        healEl.style.fontSize = '22px';
        healEl.style.textShadow = '0 0 10px #55ff55, 1px 1px 2px black';
        healEl.style.pointerEvents = 'none';
        healEl.style.zIndex = '100';
        healEl.innerText = `+${item.healHp} HP 💖`;
        document.getElementById('damage-container').appendChild(healEl);

        state.vfxs.push({ type: 'text', el: healEl, x: state.player.x, y: state.player.y - 40, vy: -40, life: 1.5 });

        window.updateInventoryUI();
        ui.updateHp(state.player.hp, state.player.maxHp);
        return; // Kết thúc hàm
    }

    // ===============================================
    // LOGIC 2: ĐAN ĐỘT PHÁ CẢNH GIỚI (Breakthrough)
    // ===============================================
    if (item.type === 'breakthrough') {
        if (state.player.level === item.targetLv && state.player.exp >= state.player.nextLevelExp) {
            // 1. Trừ Đan Dược
            if (item.count > 1) item.count--;
            else state.inventory.splice(index, 1);

            // 2. Kích hoạt Level Up
            state.player.exp -= state.player.nextLevelExp; // Trừ đi lượng EXP kẹt lại
            state.player.level++;
            state.player.nextLevelExp = Math.floor(state.player.nextLevelExp * 1.5);

            // 3. Thưởng chỉ số KHỔNG LỒ khi đột phá Đại Cảnh Giới
            state.player.maxHp += 100;
            state.player.hp = state.player.maxHp;
            state.player.attack += 15;
            state.player.speed += 5;

            // 4. Hiệu ứng độ kiếp / Đột phá thành công chấn động màn hình
            const notiEl = document.createElement('div');
            notiEl.style.position = 'absolute';
            notiEl.style.color = '#ffaa00';
            notiEl.style.fontWeight = 'bold';
            notiEl.style.fontSize = '40px';
            notiEl.style.textShadow = '0 0 20px #ffaa00, 2px 2px 5px black';
            notiEl.style.pointerEvents = 'none';
            notiEl.style.zIndex = '100';
            notiEl.style.left = '50%';
            notiEl.style.top = '30%';
            notiEl.style.transform = 'translate(-50%, -50%)';
            notiEl.innerText = `⚡ ĐỘT PHÁ THÀNH CÔNG: CẤP ${state.player.level}!`;
            document.body.appendChild(notiEl);

            let life = 1.0; let posY = 30;
            const anim = setInterval(() => {
                life -= 0.05; posY += 1;
                notiEl.style.top = `calc(${posY}%)`;
                notiEl.style.opacity = life;
                if (life <= 0) { clearInterval(anim); notiEl.remove(); }
            }, 50);

            // Cập nhật lại toàn bộ Bảng thông số (Bấm C sẽ thấy máu và công nhảy vọt)
            window.updateInventoryUI();
            window.updateEquipmentUI();
            ui.updateLevel(state.player.level);
            ui.updateXp(state.player.exp, state.player.nextLevelExp);
            ui.updateHp(state.player.hp, state.player.maxHp);

        } else if (state.player.level < item.targetLv) {
            alert(`⚠️ Cảnh giới chưa đủ! Đan dược này dùng để bứt phá Lv ${item.targetLv}.`);
        } else if (state.player.level === item.targetLv && state.player.exp < state.player.nextLevelExp) {
            alert("⚠️ Tu vi chưa viên mãn! Cần đạt 100% EXP để có thể dùng Đan Đột Phá.");
        } else {
            alert("⚠️ Bạn đã vượt qua cảnh giới này rồi, viên đan này không còn tác dụng!");
        }
        return; // Kết thúc hàm
    }

    // ===============================================
    // LOGIC 3: MẶC TRANG BỊ VÀO NGƯỜI (Equipment)
    // ===============================================
    if (!item.isEquipment) return; // Không phải đồ mặc (vd: Khoáng, Thảo dược) thì click không có tác dụng

    let slotType = item.type;

    // Logic tự động nhét Nhẫn vào ô trống (Ring1 hoặc Ring2)
    if (slotType === 'ring') {
        if (!state.player.equipment.ring1) slotType = 'ring1';
        else if (!state.player.equipment.ring2) slotType = 'ring2';
        else slotType = 'ring1'; // Nếu cả 2 đều đầy, đè lên Nhẫn 1
    }

    const oldItem = state.player.equipment[slotType];
    if (oldItem) {
        window.applyEquipmentStats(oldItem, false); // Trừ stat đồ cũ
        state.inventory[index] = oldItem;           // Vứt đồ cũ lại vào đúng vị trí ô túi đồ đó
    } else {
        state.inventory.splice(index, 1);           // Nếu không có đồ cũ thì xóa hẳn món mới khỏi túi
    }

    state.player.equipment[slotType] = item;        // Đeo đồ mới lên người
    window.applyEquipmentStats(item, true);         // Cộng stat đồ mới

    window.updateInventoryUI();
    window.updateEquipmentUI();
};

// Hàm THÁO trang bị
window.unequipItem = (slotType) => {
    const item = state.player.equipment[slotType];
    if (!item) return;

    if (state.inventory.length >= 16) {
        alert("Túi đồ đã đầy, không thể tháo trang bị!");
        return;
    }

    window.hideItemTooltip();
    window.applyEquipmentStats(item, false); // Trừ chỉ số
    state.inventory.push(item); // Vứt lại vào túi
    state.player.equipment[slotType] = null; // Làm trống slot

    window.updateInventoryUI();
    window.updateEquipmentUI();
    ui.updateHp(state.player.hp, state.player.maxHp);
    ui.updateStats(state.player.attack, state.player.speed);
};

// Vẽ trang bị đang mặc lên Bảng Trang Bị (Phím C)
window.updateEquipmentUI = () => {
    const slots = ['helmet', 'armor', 'gloves', 'boots', 'necklace', 'ring1', 'ring2'];
    slots.forEach(slot => {
        const el = document.getElementById('eq-' + slot);
        if (!el) return;

        const item = state.player.equipment[slot];
        if (item) {
            el.innerHTML = `<div style="font-size:30px;">${item.icon}</div>`;
            el.classList.remove('locked');
            el.style.cursor = 'pointer';

            // Vẽ viền màu và hiệu ứng Shadow theo Rarity
            const borderColor = item.color || '#ffaa00';
            el.style.border = `2px solid ${borderColor}`;
            if (item.rarity === 'epic' || item.rarity === 'rare') {
                el.style.boxShadow = `0 0 10px ${borderColor} inset, 0 0 5px ${borderColor}`;
            } else {
                el.style.boxShadow = 'none';
            }

            el.onmouseenter = (e) => window.showItemTooltip(e, item, true);
            el.onmouseleave = () => window.hideItemTooltip();
            el.onmousemove = (e) => window.moveItemTooltip(e);
            el.onclick = () => window.unequipItem(slot);
        } else {
            el.innerHTML = '';
            el.style.cursor = 'default';
            el.style.border = '1px solid #444'; // Trả về viền mặc định khi tháo đồ
            el.style.boxShadow = 'none';
            el.onmouseenter = null;
            el.onclick = null;
        }
    });

    // CẬP NHẬT BẢNG STATS CHI TIẾT
    const p = state.player;
    const hpEl = document.getElementById('eq-stat-hp');
    const atkEl = document.getElementById('eq-stat-atk');
    const spdEl = document.getElementById('eq-stat-spd');
    const aspdEl = document.getElementById('eq-stat-aspd');
    const critEl = document.getElementById('eq-stat-crit');

    if (hpEl) hpEl.innerText = Math.floor(p.maxHp).toLocaleString();
    if (atkEl) atkEl.innerText = Math.floor(p.attack).toLocaleString();
    if (spdEl) spdEl.innerText = Math.floor(p.speed).toLocaleString();
    if (aspdEl) aspdEl.innerText = p.attackSpeed.toFixed(2) + "x";

    // Thuộc tính bạo kích (Crit)
    if (critEl) {
        const critVal = p.crit || 0; // Nếu Base chưa có Crit thì mặc định là 0
        critEl.innerText = critVal + "%";
        // Nếu crit > 0 thì đổi màu cho ngầu
        critEl.style.color = critVal > 0 ? '#ffaa00' : '#888';
    }
};

window.teleportTo = (loc) => {
    window.closeTeleportMap();
    window.clearMapState();
    if (loc === 'dungeon') {
        state.currentMap = 'dungeon'; window.changeScene('scene-dungeon');
        document.getElementById('global-player-hud').style.display = 'block'; document.getElementById('skill-panel').style.display = 'flex'; document.getElementById('score-board').style.display = 'flex';
        state.playTime = 0; state.enemies = []; state.boss = null; state.projectiles = []; state.vfxs = []; state.xpOrbs = [];
    }
    ui.updateHp(state.player.hp, state.player.maxHp); ui.updateLevel(state.player.level); ui.updateStats(state.player.attack, state.player.speed);
    ui.updateXp(state.player.exp, state.player.nextLevelExp);
    state.isPaused = false; state.lastTime = performance.now(); requestAnimationFrame(gameLoop);
};

window.enterBossMap = () => {
    const bossConfigId = `boss_${state.currentMap}`;
    const bossData = BOSS_CONFIG[bossConfigId];

    if (!bossData) { alert("Thiếu cấu hình Boss!"); return; }

    state.isInBossMap = true;
    state.portalSpawned = false;
    state.canEnterPortal = false;
    state.bossLockTimeLeft = bossData.lockTime;

    // Tẩy trắng map (Xóa quái, đá, kinh nghiệm...)
    state.enemies = [];
    state.xpOrbs = [];
    state.vfxs = [];
    state.projectiles = [];

    // Đẩy nhân vật ra giữa
    state.player.x = 0; state.player.y = 0;

    // Spawn Boss cách nhân vật một chút (Tái sử dụng AI của Ma Tôn Vực)
    state.boss = {
        ...bossData,
        x: 0, y: -250,
        currentHp: bossData.hp, maxHp: bossData.hp,
        currentCd: 2.0, state: 'idle', timer: 0
    };

    // Hiệu ứng giật gân
    alert(`😈 ${bossData.name.toUpperCase()} GIÁ LÂM! BẠN CÓ ${bossData.lockTime} GIÂY SINH TỒN!`);
};



// ================= HỆ THỐNG LUYỆN ĐAN =================
let alchemyInterval = null;

window.openAlchemyPanel = () => {
    document.getElementById('alchemy-overlay').style.display = 'flex';

    const listEl = document.getElementById('alchemy-list');
    listEl.innerHTML = '';

    for (let key in ALCHEMY_RECIPES) {
        const item = ALCHEMY_RECIPES[key];

        let reqStr = '';
        let canCraft = true;
        item.req.forEach(r => {
            const invItem = state.inventory.find(i => i.id === r.id);
            const count = invItem ? invItem.count : 0;
            if (count < r.count) canCraft = false;

            // 👇 Tìm thông tin gốc của vật phẩm từ kho ITEMS
            const baseItem = Object.values(ITEMS).find(i => i.id === r.id) || { name: r.id, icon: '❓' };

            reqStr += `<div style="font-size: 12px;">${baseItem.icon} ${baseItem.name}: <span style="color: ${count >= r.count ? '#55ff55' : '#ff5555'}">${count}/${r.count}</span></div>`;
        });

        // Disable nút nếu Lò đang bận
        const isFurnaceBusy = state.alchemy && state.alchemy.activeId !== null;
        const btnState = (canCraft && !isFurnaceBusy) ? 'auto' : 'none';
        const btnColor = (canCraft && !isFurnaceBusy) ? '#55ff55' : '#555';

        listEl.innerHTML += `
            <div style="background: rgba(0,0,0,0.6); border: 1px solid #335533; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="display: flex; gap: 10px; align-items: center; border-bottom: 1px dashed #335533; padding-bottom: 5px; margin-bottom: 5px;">
                    <span style="font-size: 30px;">${item.icon}</span>
                    <div>
                        <div style="color: #55ff55; font-weight: bold; font-size: 14px;">${item.name}</div>
                        <div style="color: #aaa; font-size: 11px;">⏱️ ${item.time}s</div>
                    </div>
                </div>
                <div style="font-size: 11px; color: #888; margin-bottom: 5px;">${item.desc}</div>
                <div style="margin-bottom: 10px;">${reqStr}</div>
                <button class="btn" style="padding: 5px; font-size: 12px; pointer-events: ${btnState}; border-color: ${btnColor}; color: ${btnColor};" onclick="window.startAlchemy('${key}')">
                    🔥 LUYỆN ĐAN
                </button>
            </div>
        `;
    }

    window.updateFurnaceUI();
    if (alchemyInterval) clearInterval(alchemyInterval);
    alchemyInterval = setInterval(window.updateFurnaceUI, 1000);
};

window.closeAlchemyPanel = () => {
    document.getElementById('alchemy-overlay').style.display = 'none';
    state.isPaused = false;
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
};

window.startAlchemy = (key) => {
    const item = ALCHEMY_RECIPES[key];

    // 1. Trừ nguyên liệu
    item.req.forEach(r => {
        const invItem = state.inventory.find(i => i.id === r.id);
        if (invItem) invItem.count -= r.count;
    });
    
    // ==========================================
    // ĐÃ FIX: Dọn dẹp túi đồ an toàn và chính xác
    // ==========================================
    state.inventory = state.inventory.filter(i => i.count !== 0);
    
    if (!state.inventory) state.inventory = []; // Tránh lỗi

    // 2. Kích hoạt Lò
    const now = Date.now();
    state.alchemy = {
        activeId: key,
        startTime: now,
        endTime: now + (item.time * 1000),
        isFinished: false
    };

    window.updateInventoryUI();
    window.openAlchemyPanel(); // Refresh lại nút bấm
};

window.updateFurnaceUI = () => {
    const visual = document.getElementById('furnace-visual');
    const status = document.getElementById('furnace-status');
    const nameEl = document.getElementById('furnace-item-name');
    const progBg = document.getElementById('furnace-progress-bg');
    const progBar = document.getElementById('furnace-progress-bar');
    const timeLeft = document.getElementById('furnace-time-left');
    const btnCollect = document.getElementById('furnace-collect-btn');
    const fireBg = document.getElementById('furnace-fire-bg');
    const container = document.getElementById('furnace-container');

    // Bơm CSS keyframes vào game để làm hiệu ứng chớp nháy (Aura)
    if (!document.getElementById('alchemy-styles')) {
        const style = document.createElement('style');
        style.id = 'alchemy-styles';
        style.innerHTML = `
            @keyframes auraBlink {
                0% { filter: drop-shadow(0 0 10px #55ff55) drop-shadow(0 0 20px #fff); transform: scale(1.1) translateY(0); }
                50% { filter: drop-shadow(0 0 30px #55ff55) drop-shadow(0 0 60px #fff); transform: scale(1.2) translateY(-5px); }
                100% { filter: drop-shadow(0 0 10px #55ff55) drop-shadow(0 0 20px #fff); transform: scale(1.1) translateY(0); }
            }
            @keyframes furnaceRumble {
                0% { transform: translate(0, 0) scale(1); }
                25% { transform: translate(2px, -2px) scale(1.02); }
                50% { transform: translate(-2px, 2px) scale(0.98); }
                75% { transform: translate(-2px, -2px) scale(1.01); }
                100% { transform: translate(2px, 2px) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    if (!state.alchemy || !state.alchemy.activeId) {
        visual.innerText = '🏺';
        visual.style.animation = 'none';
        visual.style.transform = 'scale(1)';
        visual.style.filter = 'drop-shadow(0 0 10px #ffaa00)';
        status.innerText = 'LÒ ĐANG TRỐNG'; status.style.color = '#777';
        nameEl.innerText = ''; progBg.style.display = 'none'; btnCollect.style.display = 'none';

        fireBg.style.height = '0%';
        fireBg.style.background = 'linear-gradient(0deg, rgba(255,60,0,0.6) 0%, rgba(255,170,0,0) 100%)';
        container.style.borderColor = '#335533';
        container.style.boxShadow = 'none';
        return;
    }

    const item = ALCHEMY_RECIPES[state.alchemy.activeId];
    nameEl.innerText = `${item.icon} ${item.name}`;

    if (state.alchemy.isFinished || Date.now() >= state.alchemy.endTime) {
        // ================= LUYỆN XONG (BLINK BLINK) =================
        state.alchemy.isFinished = true;

        visual.innerText = item.icon; // Đổi icon cái Lò thành Icon của Đan Dược
        visual.style.animation = 'auraBlink 1.5s infinite ease-in-out'; // Chớp nháy lấp lánh và bay lơ lửng

        status.innerText = 'ĐAN DƯỢC ĐÃ THÀNH!'; status.style.color = '#55ff55';
        progBg.style.display = 'none'; btnCollect.style.display = 'block';

        // Background biến thành ánh hào quang tỏa tròn
        fireBg.style.height = '100%';
        fireBg.style.background = 'radial-gradient(circle, rgba(85,255,85,0.4) 0%, rgba(0,0,0,0) 70%)';
        container.style.borderColor = '#55ff55';
        container.style.boxShadow = 'inset 0 0 40px rgba(85,255,85,0.3)';
    } else {
        // ================= ĐANG LUYỆN (LỬA BẬP BÙNG) =================
        visual.innerText = '🏺';
        visual.style.animation = 'furnaceRumble 0.3s infinite'; // Lò rung lắc liên tục
        visual.style.filter = 'drop-shadow(0 0 15px #ffaa00)';

        status.innerText = 'ĐANG VẬN CHÂN HỎA...'; status.style.color = '#ffaa00';
        progBg.style.display = 'block'; btnCollect.style.display = 'none';

        fireBg.style.height = '60%';
        fireBg.style.background = 'linear-gradient(0deg, rgba(255,60,0,0.6) 0%, rgba(255,170,0,0) 100%)';
        container.style.borderColor = '#ff5500';
        container.style.boxShadow = 'inset 0 0 30px rgba(255,85,0,0.2)';

        const totalTime = state.alchemy.endTime - state.alchemy.startTime;
        const passedTime = Date.now() - state.alchemy.startTime;
        const percent = Math.min(100, (passedTime / totalTime) * 100);
        const secLeft = Math.ceil((state.alchemy.endTime - Date.now()) / 1000);

        progBar.style.width = `${percent}%`;
        timeLeft.innerText = `${secLeft}s`;
    }
};

window.collectAlchemy = () => {
    if (state.inventory.length >= 40) {
        alert("❌ Túi đồ đã đầy! Vui lòng dọn dẹp trước khi lấy thuốc.");
        return;
    }

    const item = ALCHEMY_RECIPES[state.alchemy.activeId];

    // Check xem có đồ chưa, có thì cộng dồn
    const existing = state.inventory.find(i => i.id === item.id);
    if (existing) existing.count++;
    else state.inventory.push({ ...item, count: 1 });

    // Reset Lò
    state.alchemy = { activeId: null, startTime: 0, endTime: 0, isFinished: false };

    window.updateInventoryUI();
    window.openAlchemyPanel();
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
            attackSpeed: state.player.attackSpeed,
            crit: state.player.crit || 0,
            gem: state.player.gem || 0,
            equipment: state.player.equipment
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

    // Sửa lỗi cho các file Save cũ không có Crit
    if (state.player.crit === undefined) state.player.crit = 0;
    if (state.player.gem === undefined) state.player.gem = 0;

    state.inventory = data.inventory || [];

    // Tính toán lại toàn bộ chỉ số từ trang bị (Bao gồm cả Crit)
    let totalCrit = 0;
    for (let slot in state.player.equipment) {
        let item = state.player.equipment[slot];
        if (item && item.stats && item.stats.crit) {
            totalCrit += item.stats.crit;
        }
    }
    // Ghi đè lại Crit từ đồ để tránh lỗi mất stat 
    state.player.crit = totalCrit;

    window.updateInventoryUI();
    window.updateEquipmentUI();

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
    window.updateInventoryUI();

    window.startVillage();
    window.saveGame();
};

window.changeScene('scene-main-menu');




// ================= HỆ THỐNG CHEAT TOOL =================

window.openCheatMenu = () => {
    state.isPaused = true;
    document.getElementById('cheat-panel').style.display = 'flex';
    document.getElementById('cheat-player-lv').innerText = `Cấp hiện tại: ${state.player.level}`;

    // Đổ danh sách nguyên liệu từ GameData vào bảng cheat
    const container = document.getElementById('cheat-items-list');
    container.innerHTML = '';

    // Duyệt qua tất cả vật phẩm có trong ITEMS (GameData)
    for (let key in ITEMS) {
        const itm = ITEMS[key];
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style = "font-size: 12px; padding: 5px; min-width: 100px; border-color: #555;";
        btn.innerHTML = `${itm.icon} ${itm.name}`;
        btn.onclick = () => {
            // Thêm 50 cái mỗi lần bấm
            for (let i = 0; i < 50; i++) addItemToInventory(itm);
            // Hiệu ứng chữ nổi báo thành công
            state.vfxs.push({ type: 'text', el: ui.createDmgText("CHEAT +50", "#ff00ff", document.getElementById('damage-container')), x: state.player.x, y: state.player.y, vy: -60, life: 1.0 });
        };
        container.appendChild(btn);
    }
};

window.closeCheatMenu = () => {
    state.isPaused = false;
    document.getElementById('cheat-panel').style.display = 'none';
    state.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
};

// Hàm tăng cấp nhanh để test map
window.cheatAddLv = (amount) => {
    state.player.level += amount;
    state.player.exp = 0;
    // Cập nhật lại chỉ số theo level mới (nếu có logic scale)
    ui.updateLevel(state.player.level);
    document.getElementById('cheat-player-lv').innerText = `Cấp hiện tại: ${state.player.level}`;
};

window.cheatAddLvWithLimit = (amount) => {
    for (let i = 0; i < amount; i++) {

        // 1. Kiểm tra xem cấp độ hiện tại có phải là Bình Cảnh không
        let requiredPill = null;
        for (let key in ALCHEMY_RECIPES) {
            const recipe = ALCHEMY_RECIPES[key];
            if (recipe.type === 'breakthrough' && recipe.targetLv === state.player.level) {
                requiredPill = recipe;
                break;
            }
        }

        // 2. Xử lý Logic
        if (requiredPill && state.player.exp < state.player.nextLevelExp) {
            // Đang ở cấp kẹt, nhưng EXP chưa đầy -> Bơm đầy 100% EXP rồi dừng cheat
            state.player.exp = state.player.nextLevelExp;

            const txtEl = ui.createDmgText(`MAX EXP! CẦN ${requiredPill.name.toUpperCase()}`, "#ffaa00", document.getElementById('damage-container'));
            state.vfxs.push({ type: 'text', el: txtEl, x: state.player.x, y: state.player.y - 40, vy: -50, life: 1.5 });

            break; // Ngắt vòng lặp cheat, không cho tăng cấp độ nữa

        } else if (requiredPill && state.player.exp >= state.player.nextLevelExp) {
            // Đã full 100% EXP rồi mà vẫn cố bấm Cheat
            alert(`⚠️ Tu vi đã kịch trần! Bạn phải nuốt ${requiredPill.name} để đột phá chứ cheat không có tác dụng nữa đâu!`);
            break; // Ngắt vòng lặp

        } else {
            // Không bị kẹt (hoặc đã đột phá xong) -> Cho lên 1 cấp bình thường
            state.player.level++;
            state.player.exp = 0; // Reset exp về 0 cho cấp mới
            state.player.nextLevelExp = Math.floor(state.player.nextLevelExp * 1.5);

            // Thưởng chỉ số cơ bản
            state.player.maxHp += 20;
            state.player.hp = state.player.maxHp;
            state.player.attack += 2;
        }
    }

    // 3. Cập nhật lại toàn bộ UI
    window.updateInventoryUI();
    window.updateEquipmentUI();
    ui.updateLevel(state.player.level);
    ui.updateXp(state.player.exp, state.player.nextLevelExp);
    ui.updateHp(state.player.hp, state.player.maxHp);

    // Cập nhật text ở trong bảng Cheat (Nếu có)
    const cheatLvText = document.getElementById('cheat-player-lv');
    if (cheatLvText) cheatLvText.innerText = 'Lv ' + state.player.level;
};

window.cheatAddGem = (amount) => {
    // Nếu chưa khởi tạo biến thì set bằng 0 trước
    if (state.player.gem === undefined) state.player.gem = 0;

    state.player.gem += amount;

    // Cập nhật lại UI Túi đồ nếu đang mở
    window.updateInventoryUI();

    // Nếu đang mở Lò rèn thì Load lại để update hiển thị "Phí Rèn"
    if (state.isBlacksmithOpen) {
        window.switchBlacksmithTab(state.currentBlacksmithTier);
    }

    // Tạo hiệu ứng chữ bay lên ngay tại chỗ nhân vật đứng (Dùng formatShortNumber cho gọn)
    const textToShow = `+${window.formatShortNumber(amount)} 💎`;
    const gemEl = ui.createDmgText(textToShow, "#00ffff", document.getElementById('damage-container'));

    gemEl.style.fontSize = '25px';
    gemEl.style.textShadow = '0 0 10px #00ffff, 2px 2px 5px black';
    gemEl.style.fontWeight = 'bold';

    state.vfxs.push({ type: 'text', el: gemEl, x: state.player.x, y: state.player.y - 20, vy: -60, life: 1.5 });
};

// Gán phím tắt F2 để mở bảng Cheat
window.addEventListener('keydown', (e) => {
    if (e.key === 'v' || e.key === 'V') {
        const overlay = document.getElementById('alchemy-overlay');
        if (overlay.style.display === 'none' || overlay.style.display === '') {
            if (!state.isPaused) {
                state.isPaused = true;
                window.openAlchemyPanel();
            }
        } else {
            window.closeAlchemyPanel();
        }
    }

    if (e.key === 'F2') {
        if (document.getElementById('cheat-panel').style.display === 'none') {
            window.openCheatMenu();
        } else {
            window.closeCheatMenu();
        }
    }
});

window.addEventListener('keyup', (e) => {
    // Ép nhả phím dựa trên phím vật lý, bất chấp Unikey đang bật Telex hay VNI
    if (e.code === 'KeyW') input.keys['w'] = false;
    if (e.code === 'KeyS') input.keys['s'] = false;
    if (e.code === 'KeyA') input.keys['a'] = false;
    if (e.code === 'KeyD') input.keys['d'] = false;
});

// Chống kẹt phím khi người chơi lỡ click chuột ra ngoài cửa sổ game hoặc Alt+Tab
window.addEventListener('blur', () => {
    if (input.keys) {
        input.keys['w'] = false;
        input.keys['s'] = false;
        input.keys['a'] = false;
        input.keys['d'] = false;
    }
});