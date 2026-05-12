export const BASE_STATS = {
    maxHp: 100, attack: 20, speed: 200, dashSpeed: 800, cdr: 1.0, attackSpeed: 1.0
};

export const ENEMY_STATS = {
    baseHp: 20, hpScalePerKill: 2.5, baseSpeed: 100, speedVariance: 50,
    size: 25, baseDamage: 10, damageScalePerKill: 0.2, spawnRate: 1.5,
    color: '#111', strokeColor: '#6600aa',
    names: ["Huyết Bức", "Ma Lang", "Cốt Tướng", "Oán Hồn", "Độc Chu", "Hắc Hổ", "Quỷ Mị"]
};

// --- PHẦN MỚI: CẤU HÌNH BOSS ---
export const BOSS_CONFIG = {
    // Điều kiện xuất hiện
    spawnKills: 10,      // Đạt 10 mạng
    spawnTime: 120,      // HOẶC sống sót sau 120 giây (2 phút)

    // Chỉ số chiến đấu
    maxHp: 3000,
    speed: 70,
    size: 80,
    attackInterval: 4.0, // Thời gian nghỉ giữa các chiêu
    warningDuration: 1.5,// Thời gian vòng đỏ cảnh báo

    // Skill 2 (Mưa đá)
    mountainCount: 20,
    mountainHp: 40,
    mountainRadius: 25
};

// --- PHẦN MỚI: CẤU HÌNH HIỂN THỊ (VISUALS) ---
export const VISUAL_CONFIG = {
    gridSize: 100,
    gridColor: 'rgba(0, 255, 255, 0.1)',
    playerAuraRadius: 30,
    crosshairSize: 10,
    damageFloatSpeed: -50,
    damageLifeTime: 1.0
};

export const WEAPONS = {
    sword: {
        id: 'sword', name: "Kiếm Tiên",
        bonus: { hp: 50, attack: 5, speed: 20, attackSpeed: 0.2 },
        skills: {
            lmb: { cd: 2.0, dmgMult: 1.0 }, rmb: { cd: 4.0, dmgMult: 1.5 },
            s1: { cd: 5.0, dmgMult: 3.5 }, s2: { cd: 6.0, dmgMult: 2.0 },
            s3: { cd: 15.0, dmgMult: 1.0 }, dash: { cd: 3.0 }
        }
    },
    bow: {
        id: 'bow', name: "Tiên Cung",
        bonus: { hp: 0, attack: 10, speed: 60, attackSpeed: 0.5 },
        skills: {
            lmb: { cd: 2.0, dmgMult: 1.2 }, rmb: { cd: 3.0, dmgMult: 0.8 },
            s1: { cd: 8.0, dmgMult: 0.8 }, s2: { cd: 8.0, dmgMult: 3.5 },
            s3: { cd: 12.0, dmgMult: 1.0 }, dash: { cd: 3.0 }
        }
    }
};

export const LEVEL_CONFIG = {
    baseExp: 100,           // Kinh nghiệm cần để lên Level 2
    expGrowth: 1.5,         // Hệ số tăng trưởng XP mỗi cấp

    // Chỉ số cộng thêm mỗi khi Level Up
    bonuses: {
        maxHp: 20,
        attack: 5,
        speed: 10,
        attackSpeed: 0.05 // 5%
    }
};

export const XP_ORB_CONFIG = {
    magnetRadius: 150,      // Bán kính bắt đầu hút vào người (Pixel)
    flySpeed: 500,          // Tốc độ bay khi bị hút
    size: 6,                // Kích thước hạt
    color: '#00ffcc',       // Màu xanh ngọc đặc trưng của linh khí
    xpPerEnemyHp: 0.5       // 1 HP của quái chết = 0.5 XP
};

export const INVENTORY_CONFIG = {
    slots: 25, // 5x5
    columns: 5
};

// MAP CONFIGS

// --- DANH SÁCH VẬT PHẨM ---
export const ITEMS = {
    // Rừng Rậm (1-10)
    HERB: { id: 'herb', name: 'Linh Thảo', icon: '🌿', type: 'material', stackable: true },
    COPPER: { id: 'copper', name: 'Đồng Khoáng', icon: '🧱', type: 'material', stackable: true },
    BOAR_TUSK: { id: 'boar_tusk', name: 'Nanh Heo Rừng', icon: '🦴', type: 'material', stackable: true },
    WOLF_PELT: { id: 'wolf_pelt', name: 'Da Sói', icon: '🟫', type: 'material', stackable: true },

    // Sa Mạc (20-30)
    CACTUS: { id: 'cactus', name: 'Xương Rồng', icon: '🌵', type: 'material', stackable: true },
    IRON: { id: 'iron', name: 'Thiết Khoáng', icon: '🪨', type: 'material', stackable: true },
    SCORPION_TAIL: { id: 'scorpion_tail', name: 'Đuôi Bọ Cạp', icon: '🦂', type: 'material', stackable: true },
    SNAKE_VENOM: { id: 'snake_venom', name: 'Nọc Rắn', icon: '🐍', type: 'material', stackable: true },

    // Băng Tuyết (30-40)
    SNOW_LOTUS: { id: 'snow_lotus', name: 'Tuyết Liên', icon: '❄️', type: 'material', stackable: true },
    ICE_CRYSTAL: { id: 'ice_crystal', name: 'Băng Tinh', icon: '💎', type: 'material', stackable: true },
    YETI_FUR: { id: 'yeti_fur', name: 'Lông Dã Nhân', icon: '🧥', type: 'material', stackable: true },
    ICE_BEAR_CLAW: { id: 'ice_bear_claw', name: 'Móng Gấu', icon: '🐾', type: 'material', stackable: true },

    // Biển Sâu (40-50)
    SEAWEED: { id: 'seaweed', name: 'Hải Tảo', icon: '🥬', type: 'material', stackable: true },
    PEARL: { id: 'pearl', name: 'Trân Châu', icon: '🦪', type: 'material', stackable: true },
    SHARK_FIN: { id: 'shark_fin', name: 'Vây Cá Mập', icon: '🦈', type: 'material', stackable: true },
    CRAB_SHELL: { id: 'crab_shell', name: 'Mai Cua', icon: '🦀', type: 'material', stackable: true },

    // Núi Lửa (50-60)
    FIRE_FLOWER: { id: 'fire_flower', name: 'Hỏa Diệm Hoa', icon: '🔥', type: 'material', stackable: true },
    OBSIDIAN: { id: 'obsidian', name: 'Hắc Diện Thạch', icon: '🖤', type: 'material', stackable: true },
    DRAGON_SCALE: { id: 'dragon_scale', name: 'Vảy Rồng', icon: '🐉', type: 'material', stackable: true },
    DEMON_HORN: { id: 'demon_horn', name: 'Sừng Ác Quỷ', icon: '😈', type: 'material', stackable: true },

    // BOSSES
    // --- LÕI YÊU ĐAN (BOSS DROPS) ---
    BOAR_KING_CORE: { id: 'boar_king_core', name: 'Yêu Đan Huyết Trư', icon: '🔴', type: 'material', desc: 'Lõi sức mạnh của Huyết Trư Yêu Vương.' },
    SCORPION_KING_CORE: { id: 'scorpion_king_core', name: 'Yêu Đan Ma Yết', icon: '🟠', type: 'material', desc: 'Lõi sức mạnh của Tử Sa Ma Yết.' },
    FROST_APE_CORE: { id: 'frost_ape_core', name: 'Yêu Đan Cự Viên', icon: '🔵', type: 'material', desc: 'Lõi sức mạnh của Băng Sương Cự Viên.' },
    FLOOD_DRAGON_CORE: { id: 'flood_dragon_core', name: 'Yêu Đan Giao Long', icon: '🟣', type: 'material', desc: 'Lõi sức mạnh của Độc Giác Giao Long.' },
    DEMON_LORD_CORE: { id: 'demon_lord_core', name: 'Ma Tôn Bản Nguyên', icon: '❤️‍🔥', type: 'material', desc: 'Bản nguyên chi lực của Luyện Ngục Ma Tôn.' }
    
};

// --- CẤU HÌNH CÁC MAP & QUÁI VẬT ---
export const MAP_CONFIG = {
    forest: {
        id: 'forest', name: 'Thanh Diệp Lâm', minLv: 1, type: 'farm',
        bgColor: '#061a0a', obstacle: '🌲', icon: '🌳',
        herb: { item: ITEMS.HERB }, ore: { item: ITEMS.COPPER },
        enemies: [
            { name: 'Heo Rừng', hp: 50, speed: 80, damage: 8, icon: '🐗', xp: 20, drop: ITEMS.BOAR_TUSK, dropRate: 0.3 },
            { name: 'Sói Xám', hp: 40, speed: 120, damage: 12, icon: '🐺', xp: 25, drop: ITEMS.WOLF_PELT, dropRate: 0.3 }
        ]
    },
    desert: {
        id: 'desert', name: 'Huyễn Sa Mạc', minLv: 10, type: 'farm',
        bgColor: '#2b1d06', obstacle: '🌴', icon: '🏜️',
        herb: { item: ITEMS.CACTUS }, ore: { item: ITEMS.IRON },
        enemies: [
            { name: 'Bọ Cạp', hp: 200, speed: 90, damage: 30, icon: '🦂', xp: 80, drop: ITEMS.SCORPION_TAIL, dropRate: 0.4 },
            { name: 'Rắn Độc', hp: 150, speed: 140, damage: 45, icon: '🐍', xp: 100, drop: ITEMS.SNAKE_VENOM, dropRate: 0.4 }
        ]
    },
    ice: {
        id: 'ice', name: 'Cực Hàn Băng Ngục', minLv: 20, type: 'farm',
        bgColor: '#0b1626', obstacle: '🏔️', icon: '❄️',
        herb: { item: ITEMS.SNOW_LOTUS }, ore: { item: ITEMS.ICE_CRYSTAL },
        enemies: [
            { name: 'Dã Nhân', hp: 500, speed: 100, damage: 80, icon: '🦍', xp: 200, drop: ITEMS.YETI_FUR, dropRate: 0.4 },
            { name: 'Gấu Tuyết', hp: 800, speed: 70, damage: 120, icon: '🐻‍❄️', xp: 250, drop: ITEMS.ICE_BEAR_CLAW, dropRate: 0.5 }
        ]
    },
    ocean: {
        id: 'ocean', name: 'Thâm Đáy Hải Vực', minLv: 30, type: 'farm',
        bgColor: '#001122', obstacle: '🪸', icon: '🌊',
        herb: { item: ITEMS.SEAWEED }, ore: { item: ITEMS.PEARL },
        enemies: [
            { name: 'Cá Mập', hp: 1200, speed: 150, damage: 200, icon: '🦈', xp: 500, drop: ITEMS.SHARK_FIN, dropRate: 0.4 },
            { name: 'Cua Đá', hp: 1500, speed: 80, damage: 250, icon: '🦀', xp: 600, drop: ITEMS.CRAB_SHELL, dropRate: 0.5 }
        ]
    },
    volcano: {
        id: 'volcano', name: 'Luyện Ngục Diệm Sơn', minLv: 40, type: 'farm',
        bgColor: '#2a0000', obstacle: '🌋', icon: '🌋',
        herb: { item: ITEMS.FIRE_FLOWER }, ore: { item: ITEMS.OBSIDIAN },
        enemies: [
            { name: 'Hỏa Long', hp: 3000, speed: 130, damage: 500, icon: '🐉', xp: 1200, drop: ITEMS.DRAGON_SCALE, dropRate: 0.5 },
            { name: 'Ác Quỷ', hp: 2000, speed: 180, damage: 400, icon: '👿', xp: 1000, drop: ITEMS.DEMON_HORN, dropRate: 0.4 }
        ]
    },

    // --- TAB SỰ KIỆN (EVENT) ---
    dungeon: {
        id: 'dungeon', name: 'Ma Tôn Vực', minLv: 1, maxLv: 99, type: 'event',
        icon: '👹', desc: 'Boss Thế Giới'
    }
};