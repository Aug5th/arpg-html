export const BASE_STATS = {
    maxHp: 100, attack: 20, speed: 200, dashSpeed: 800, cdr: 1.0, attackSpeed: 1.0
};

export const ENEMY_STATS = {
    baseHp: 20, hpScalePerKill: 2.5, baseSpeed: 100, speedVariance: 50,
    size: 25, baseDamage: 10, damageScalePerKill: 0.2, spawnRate: 1.5,
    color: '#111', strokeColor: '#6600aa',
    names: ["Huyết Bức", "Ma Lang", "Cốt Tướng", "Oán Hồn", "Độc Chu", "Hắc Hổ", "Quỷ Mị"]
};

// Map FOREST
export const ITEMS = {
    HERB: { id: 'herb', name: 'Linh Thảo', icon: '🌿', stackable: true },
    COPPER: { id: 'copper', name: 'Đồng Khoáng', icon: '🧱', stackable: true }
};

export const FOREST_ENEMIES = {
    BOAR: { name: 'Heo Rừng', hp: 50, speed: 80, damage: 8, icon: '🐗', xp: 20 },
    WOLF: { name: 'Sói Xám', hp: 40, speed: 120, damage: 12, icon: '🐺', xp: 25 }
};

// End Map FOREST

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