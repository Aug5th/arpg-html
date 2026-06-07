export const BASE_STATS = {
    maxHp: 100, attack: 20, speed: 200, dashSpeed: 800, cdr: 1.0, attackSpeed: 1.0
};

export const ENEMY_STATS = {
    baseHp: 20, hpScalePerKill: 2.5, baseSpeed: 100, speedVariance: 50,
    size: 25, baseDamage: 10, damageScalePerKill: 0.2, spawnRate: 1.5,
    color: '#111', strokeColor: '#6600aa',
    names: ["Huyết Bức", "Ma Lang", "Cốt Tướng", "Oán Hồn", "Độc Chu", "Hắc Hổ", "Quỷ Mị"]
};

// =========================================================
// HỆ THỐNG PHÂN NHÁNH PHÁP KHÍ BẢN MỆNH (FULL CONFIGS)
// =========================================================

export const WEAPON_BRANCHES = {
    'sword': {
        'blood': {
            id: 'sword_blood', // assets/icon/weapon/sword/sword_blood.png
            name: 'Xích Long',
            desc: 'Thanh kiếm đúc từ huyết tinh của chân rồng, gây ra những vết thương vĩnh viễn không thể khép miệng.',
            pros: 'Gây trạng thái Chảy Máu (Bleeding) theo thời gian, sát thương dồn cực mạnh lên Boss.',
            cons: 'Cần thời gian để tích lũy sát thương, không có khả năng khống chế.',
            tiers: [
                { tier: 1, name: 'Xích Long Kiếm', color: '#55ff55', stats: { attack: 120, maxHp: 500, attackSpeed: 0.05, crit: 5, bleed: 10 } },
                { tier: 2, name: 'Xích Long Kiếm +1', color: '#00ccff', stats: { attack: 280, maxHp: 1200, attackSpeed: 0.1, crit: 8, bleed: 25 } },
                { tier: 3, name: 'Xích Long Kiếm +2', color: '#cc00ff', stats: { attack: 650, maxHp: 3000, attackSpeed: 0.15, crit: 12, bleed: 60 } },
                { tier: 4, name: 'Xích Long Kiếm +3', color: '#ffaa00', stats: { attack: 1500, maxHp: 7500, attackSpeed: 0.25, crit: 18, bleed: 150 } },
                { tier: 5, name: 'Xích Long Huyết Kiếm', color: '#ff3333', stats: { attack: 3500, maxHp: 18000, attackSpeed: 0.4, crit: 25, bleed: 400 } }
            ]
        },
        'ice': {
            id: 'sword_ice', // assets/icon/weapon/sword/sword_ice.png
            name: 'Hàn Băng',
            desc: 'Lưỡi kiếm tỏa ra hàn khí tuyệt đối của Bắc Cực, có khả năng làm ngưng trệ dòng máu của mọi sinh linh.',
            pros: 'Khống chế kẻ địch mạnh mẽ bằng hiệu ứng Làm Chậm (Slow) và Đóng Băng (Freeze).',
            cons: 'Sát thương cơ bản chỉ ở mức trung bình.',
            tiers: [
                { tier: 1, name: 'Hàn Băng Kiếm', color: '#55ff55', stats: { attack: 100, maxHp: 400, attackSpeed: 0.1, crit: 5, freeze: 5 } },
                { tier: 2, name: 'Hàn Băng Kiếm +1', color: '#00ccff', stats: { attack: 240, maxHp: 1000, attackSpeed: 0.15, crit: 10, freeze: 10 } },
                { tier: 3, name: 'Hàn Băng Kiếm +2', color: '#cc00ff', stats: { attack: 550, maxHp: 2500, attackSpeed: 0.2, crit: 15, freeze: 20 } },
                { tier: 4, name: 'Hàn Băng Kiếm +3', color: '#ffaa00', stats: { attack: 1300, maxHp: 6000, attackSpeed: 0.3, crit: 20, freeze: 35 } },
                { tier: 5, name: 'Hàn Băng Linh Kiếm', color: '#ff3333', stats: { attack: 3000, maxHp: 15000, attackSpeed: 0.5, crit: 30, freeze: 60 } }
            ]
        },
        'sea': {
            id: 'sword_sea', // assets/icon/weapon/sword/sword_sea.png
            name: 'Trấn Hải',
            desc: 'Mang theo hơi thở của đại dương, thanh kiếm này bảo hộ chủ nhân bằng dòng năng lượng hồi phục vô tận.',
            pros: 'Hút máu (Lifesteal) cực tốt và tăng lượng máu tối đa rất lớn, giúp nhân vật bất tử.',
            cons: 'Sát thương thấp nhất trong 4 hệ kiếm.',
            tiers: [
                { tier: 1, name: 'Trấn Hải Kiếm', color: '#55ff55', stats: { attack: 80, maxHp: 800, attackSpeed: 0.05, crit: 2, lifesteal: 5 } },
                { tier: 2, name: 'Trấn Hải Kiếm +1', color: '#00ccff', stats: { attack: 200, maxHp: 2000, attackSpeed: 0.1, crit: 5, lifesteal: 8 } },
                { tier: 3, name: 'Trấn Hải Kiếm +2', color: '#cc00ff', stats: { attack: 450, maxHp: 5000, attackSpeed: 0.15, crit: 8, lifesteal: 12 } },
                { tier: 4, name: 'Trấn Hải Kiếm +3', color: '#ffaa00', stats: { attack: 1100, maxHp: 12000, attackSpeed: 0.2, crit: 12, lifesteal: 18 } },
                { tier: 5, name: 'Trấn Hải Thần Kiếm', color: '#ff3333', stats: { attack: 2500, maxHp: 30000, attackSpeed: 0.3, crit: 20, lifesteal: 30 } }
            ]
        },
        'sand': {
            id: 'sword_sand', // assets/icon/weapon/sword/sword_sand.png
            name: 'Huyễn Sa',
            desc: 'Cung làm từ linh cốt mãng xà cổ đại, tiêm kịch độc ăn mòn sinh mệnh mục tiêu qua từng phát bắn.',
            pros: 'Gây sát thương kịch độc rút máu cực mạnh, các tick độc có thể bạo kích.',
            cons: 'Sát thương bạo kích ban đầu của đòn bắn bị phân tách nhẹ.',
            tiers: [
                { tier: 1, name: 'Huyễn Sa Kiếm', color: '#55ff55', stats: { attack: 200, maxHp: 400, attackSpeed: -0.1, crit: 10 } },
                { tier: 2, name: 'Huyễn Sa Kiếm +1', color: '#00ccff', stats: { attack: 450, maxHp: 900, attackSpeed: -0.15, crit: 15 } },
                { tier: 3, name: 'Huyễn Sa Kiếm +2', color: '#cc00ff', stats: { attack: 1000, maxHp: 2200, attackSpeed: -0.2, crit: 20 } },
                { tier: 4, name: 'Huyễn Sa Kiếm +3', color: '#ffaa00', stats: { attack: 2200, maxHp: 5000, attackSpeed: -0.25, crit: 30 } },
                { tier: 5, name: 'Huyễn Sa Trọng Kiếm', color: '#ff3333', stats: { attack: 5000, maxHp: 12000, attackSpeed: -0.3, crit: 45 } }
            ]
        }
    },
    'bow': {
        'poison': {
            id: 'bow_poison', // assets/icon/weapon/bow/bow_poison.png
            name: 'Độc Xà',
            desc: 'Mũi tên mang theo kịch độc của mãng xà cổ đại, thấm vào máu thịt kẻ thù ngay khi chạm phải.',
            pros: 'Gây sát thương Độc (Poison DoT) cực mạnh, hiệu quả cao khi đánh quái đông.',
            cons: 'Không thể gây sát thương chí mạng (0% Crit).',
            tiers: [
                { tier: 1, name: 'Độc Xà Cung', color: '#55ff55', stats: { attack: 100, maxHp: 200, attackSpeed: 0.1, crit: 0, poison: 15 } },
                { tier: 2, name: 'Độc Xà Cung +1', color: '#00ccff', stats: { attack: 220, maxHp: 500, attackSpeed: 0.2, crit: 0, poison: 35 } },
                { tier: 3, name: 'Độc Xà Cung +2', color: '#cc00ff', stats: { attack: 500, maxHp: 1200, attackSpeed: 0.35, crit: 0, poison: 80 } },
                { tier: 4, name: 'Độc Xà Cung +3', color: '#ffaa00', stats: { attack: 1200, maxHp: 3000, attackSpeed: 0.6, crit: 0, poison: 200 } },
                { tier: 5, name: 'Độc Xà Thiết Cung', color: '#ff3333', stats: { attack: 2800, maxHp: 7000, attackSpeed: 1.0, crit: 0, poison: 500 } }
            ]
        },
        'ice': {
            id: 'bow_ice', // assets/icon/weapon/bow/bow_ice.png
            name: 'Băng Sương',
            desc: 'Những mũi tên buốt giá làm chậm mọi hành động của mục tiêu, khiến chúng trở thành bia tập bắn.',
            pros: 'Tốc độ bắn rất nhanh, khả năng thả diều (Kiting) kẻ địch tuyệt vời.',
            cons: 'Sát thương mỗi mũi tên thấp hơn so với các hệ cung khác.',
            tiers: [
                { tier: 1, name: 'Băng Sương Cung', color: '#55ff55', stats: { attack: 90, maxHp: 200, attackSpeed: 0.15, crit: 10, slow: 20 } },
                { tier: 2, name: 'Băng Sương Cung +1', color: '#00ccff', stats: { attack: 200, maxHp: 450, attackSpeed: 0.25, crit: 15, slow: 30 } },
                { tier: 3, name: 'Băng Sương Cung +2', color: '#cc00ff', stats: { attack: 450, maxHp: 1000, attackSpeed: 0.4, crit: 25, slow: 45 } },
                { tier: 4, name: 'Băng Sương Cung +3', color: '#ffaa00', stats: { attack: 1100, maxHp: 2500, attackSpeed: 0.7, crit: 40, slow: 60 } },
                { tier: 5, name: 'Băng Sương Xuyên Cung', color: '#ff3333', stats: { attack: 2500, maxHp: 6000, attackSpeed: 1.2, crit: 60, slow: 80 } }
            ]
        },
        'sea': {
            id: 'bow_sea', // assets/icon/weapon/bow/bow_sea.png
            name: 'Giao Long',
            desc: 'Sử dụng linh phách của Giao Long để hồi phục linh lực cho chủ nhân qua mỗi phát bắn.',
            pros: 'Hồi phục máu tầm xa, giúp nhân vật cực kỳ bền bỉ trong các trận chiến dài.',
            cons: 'Chỉ số tấn công và phòng thủ ở mức trung bình, không có đột phá.',
            tiers: [
                { tier: 1, name: 'Giao Long Cung', color: '#55ff55', stats: { attack: 85, maxHp: 300, attackSpeed: 0.1, crit: 5, lifesteal: 3 } },
                { tier: 2, name: 'Giao Long Cung +1', color: '#00ccff', stats: { attack: 190, maxHp: 700, attackSpeed: 0.2, crit: 10, lifesteal: 6 } },
                { tier: 3, name: 'Giao Long Cung +2', color: '#cc00ff', stats: { attack: 420, maxHp: 1600, attackSpeed: 0.35, crit: 18, lifesteal: 10 } },
                { tier: 4, name: 'Giao Long Cung +3', color: '#ffaa00', stats: { attack: 1000, maxHp: 4000, attackSpeed: 0.6, crit: 28, lifesteal: 15 } },
                { tier: 5, name: 'Giao Long Cốt Cung', color: '#ff3333', stats: { attack: 2300, maxHp: 10000, attackSpeed: 1.0, crit: 45, lifesteal: 25 } }
            ]
        },
        'sun': {
            id: 'bow_sun', // assets/icon/weapon/bow/bow_sun.png
            name: 'Lạc Nhật',
            desc: 'Mang theo uy năng của thái dương, mũi tên bắn ra có sức mạnh hủy diệt vạn vật.',
            pros: 'Sát thương chí mạng và sát thương vật lý lớn nhất, kết liễu mục tiêu cực nhanh.',
            cons: 'Tốc độ bắn rất chậm, yêu cầu khả năng căn vị trí tốt.',
            tiers: [
                { tier: 1, name: 'Lạc Nhật Cung', color: '#55ff55', stats: { attack: 150, maxHp: 150, attackSpeed: -0.1, crit: 15 } },
                { tier: 2, name: 'Lạc Nhật Cung +1', color: '#00ccff', stats: { attack: 350, maxHp: 350, attackSpeed: -0.15, crit: 25 } },
                { tier: 3, name: 'Lạc Nhật Cung +2', color: '#cc00ff', stats: { attack: 800, maxHp: 800, attackSpeed: -0.2, crit: 40 } },
                { tier: 4, name: 'Lạc Nhật Cung +3', color: '#ffaa00', stats: { attack: 1800, maxHp: 1800, attackSpeed: -0.25, crit: 60 } },
                { tier: 5, name: 'Lạc Nhật Thần Cung', color: '#ff3333', stats: { attack: 4500, maxHp: 4500, attackSpeed: -0.3, crit: 85 } }
            ]
        }
    }
};

// --- PHẦN MỚI: CẤU HÌNH BOSS ---
export const DUNGEON_BOSS_CONFIG = {
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
    BOAR_TUSK: { id: 'boar_tusk', name: 'Nanh Heo Rừng', icon: '🦴', type: 'material', pickupType: 'instant', stackable: true },
    WOLF_PELT: { id: 'wolf_pelt', name: 'Da Sói', icon: '🟫', type: 'material', pickupType: 'instant', stackable: true },

    // Sa Mạc (20-30)
    CACTUS: { id: 'cactus', name: 'Xương Rồng', icon: '🌵', type: 'material', stackable: true },
    IRON: { id: 'iron', name: 'Thiết Khoáng', icon: '🪨', type: 'material', stackable: true },
    SCORPION_TAIL: { id: 'scorpion_tail', name: 'Đuôi Bọ Cạp', icon: '🦂', type: 'material', pickupType: 'instant', stackable: true },
    SNAKE_VENOM: { id: 'snake_venom', name: 'Nọc Rắn', icon: '🐍', type: 'material', pickupType: 'instant', stackable: true },

    // Băng Tuyết (30-40)
    SNOW_LOTUS: { id: 'snow_lotus', name: 'Tuyết Liên', icon: '❄️', type: 'material', stackable: true },
    ICE_CRYSTAL: { id: 'ice_crystal', name: 'Băng Tinh', icon: '💎', type: 'material', stackable: true },
    YETI_FUR: { id: 'yeti_fur', name: 'Lông Dã Nhân', icon: '🧥', type: 'material', pickupType: 'instant', stackable: true },
    ICE_BEAR_CLAW: { id: 'ice_bear_claw', name: 'Móng Gấu', icon: '🐾', type: 'material', pickupType: 'instant', stackable: true },

    // Biển Sâu (40-50)
    SEAWEED: { id: 'seaweed', name: 'Hải Tảo', icon: '🥬', type: 'material', stackable: true },
    PEARL: { id: 'pearl', name: 'Trân Châu', icon: '🦪', type: 'material', stackable: true },
    SHARK_FIN: { id: 'shark_fin', name: 'Vây Cá Mập', icon: '🦈', type: 'material', pickupType: 'instant', stackable: true },
    CRAB_SHELL: { id: 'crab_shell', name: 'Mai Cua', icon: '🦀', type: 'material', pickupType: 'instant', stackable: true },

    // Núi Lửa (50-60)
    FIRE_FLOWER: { id: 'fire_flower', name: 'Hỏa Diệm Hoa', icon: '🔥', type: 'material', stackable: true },
    OBSIDIAN: { id: 'obsidian', name: 'Hắc Diện Thạch', icon: '🖤', type: 'material', stackable: true },
    DRAGON_SCALE: { id: 'dragon_scale', name: 'Vảy Rồng', icon: '🐉', type: 'material', pickupType: 'instant', stackable: true },
    DEMON_HORN: { id: 'demon_horn', name: 'Sừng Ác Quỷ', icon: '😈', type: 'material', pickupType: 'instant', stackable: true },

    // BOSSES
    // --- LÕI YÊU ĐAN (BOSS DROPS) ---
    BOAR_KING_CORE: { id: 'boar_king_core', name: 'Yêu Đan Huyết Trư', icon: '🔴', type: 'material', pickupType: 'manual', desc: 'Lõi sức mạnh của Huyết Trư Yêu Vương.' },
    SCORPION_KING_CORE: { id: 'scorpion_king_core', name: 'Yêu Đan Ma Yết', icon: '🟠', type: 'material', pickupType: 'manual', desc: 'Lõi sức mạnh của Tử Sa Ma Yết.' },
    FROST_APE_CORE: { id: 'frost_ape_core', name: 'Yêu Đan Cự Viên', icon: '🔵', type: 'material', pickupType: 'manual', desc: 'Lõi sức mạnh của Băng Sương Cự Viên.' },
    FLOOD_DRAGON_CORE: { id: 'flood_dragon_core', name: 'Yêu Đan Giao Long', icon: '🟣', type: 'material', pickupType: 'manual', desc: 'Lõi sức mạnh của Độc Giác Giao Long.' },
    DEMON_LORD_CORE: { id: 'demon_lord_core', name: 'Ma Tôn Bản Nguyên', icon: '❤️‍🔥', type: 'material', pickupType: 'manual', desc: 'Bản nguyên chi lực của Luyện Ngục Ma Tôn.' }

};

// --- CẤU HÌNH CÁC MAP & QUÁI VẬT ---
export const MAP_CONFIG = {
    forest: {
        id: 'forest', name: 'Thanh Diệp Lâm', minLv: 1, type: 'farm',
        bgColor: '#061a0a', obstacle: '🌲', icon: '🌳',
        portalSpawnTime: 60, // Phải farm 60 giây (1 phút) cổng mới mở
        herb: { item: ITEMS.HERB }, ore: { item: ITEMS.COPPER },
        enemies: [
            { name: 'Heo Rừng', hp: 50, speed: 80, damage: 8, icon: '🐗', xp: 20, drop: ITEMS.BOAR_TUSK, dropRate: 0.3 },
            { name: 'Sói Xám', hp: 40, speed: 120, damage: 12, icon: '🐺', xp: 25, drop: ITEMS.WOLF_PELT, dropRate: 0.3 }
        ]
    },
    desert: {
        id: 'desert', name: 'Huyễn Sa Mạc', minLv: 10, type: 'farm',
        bgColor: '#2b1d06', obstacle: '🌴', icon: '🏜️',
        portalSpawnTime: 120, // 2 phút
        herb: { item: ITEMS.CACTUS }, ore: { item: ITEMS.IRON },
        enemies: [
            { name: 'Bọ Cạp', hp: 200, speed: 90, damage: 30, icon: '🦂', xp: 80, drop: ITEMS.SCORPION_TAIL, dropRate: 0.4 },
            { name: 'Rắn Độc', hp: 150, speed: 140, damage: 45, icon: '🐍', xp: 100, drop: ITEMS.SNAKE_VENOM, dropRate: 0.4 }
        ]
    },
    ice: {
        id: 'ice', name: 'Cực Hàn Băng Ngục', minLv: 20, type: 'farm',
        bgColor: '#0b1626', obstacle: '🏔️', icon: '❄️',
        portalSpawnTime: 180, // 3 phút
        herb: { item: ITEMS.SNOW_LOTUS }, ore: { item: ITEMS.ICE_CRYSTAL },
        enemies: [
            { name: 'Dã Nhân', hp: 500, speed: 100, damage: 80, icon: '🦍', xp: 200, drop: ITEMS.YETI_FUR, dropRate: 0.4 },
            { name: 'Gấu Tuyết', hp: 800, speed: 70, damage: 120, icon: '🐻‍❄️', xp: 250, drop: ITEMS.ICE_BEAR_CLAW, dropRate: 0.5 }
        ]
    },
    ocean: {
        id: 'ocean', name: 'Thâm Đáy Hải Vực', minLv: 30, type: 'farm',
        bgColor: '#001122', obstacle: '🪸', icon: '🌊',
        portalSpawnTime: 240, // 4 phút
        herb: { item: ITEMS.SEAWEED }, ore: { item: ITEMS.PEARL },
        enemies: [
            { name: 'Cá Mập', hp: 1200, speed: 150, damage: 200, icon: '🦈', xp: 500, drop: ITEMS.SHARK_FIN, dropRate: 0.4 },
            { name: 'Cua Đá', hp: 1500, speed: 80, damage: 250, icon: '🦀', xp: 600, drop: ITEMS.CRAB_SHELL, dropRate: 0.5 }
        ]
    },
    volcano: {
        id: 'volcano', name: 'Luyện Ngục Diệm Sơn', minLv: 40, type: 'farm',
        bgColor: '#2a0000', obstacle: '🌋', icon: '🌋',
        portalSpawnTime: 300, // 5 phút sinh tử
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

// =========================================================
// HỆ THỐNG BOSS DUNGEON (TIME-ATTACK)
// =========================================================
export const BOSS_CONFIG = {
    // 1. Boss Thanh Diệp Lâm (Dành cho cấp 9 đột phá)
    'boss_forest': {
        id: 'boss_forest',
        name: 'Huyết Trư Yêu Vương',
        icon: '👹',
        mapSpawn: 'forest',
        hp: 2500,               // Máu cực trâu so với Heo thường (50 HP)
        damage: 40,             // Sát thương cao, ép người chơi phải né hoặc có giáp tốt
        size: 80,               // Kích thước to gấp đôi quái thường (Quái thường ~ 40px)
        speed: 120,             // Tốc độ chạy lùa người chơi
        lockTime: 60,           // 60 giây để dứt điểm (Thời gian thực)
        xp: 1000,
        drops: [
            { id: 'boar_king_core', count: 1, rate: 1.0 }, // 100% rớt 1 Yêu Đan (Bắt buộc)
            { id: 'boar_tusk', count: 5, rate: 1.0 },      // Khuyến mãi thêm 5 nanh heo
            { id: 'copper', count: 5, rate: 0.5 }          // 50% rớt thêm khoáng
        ]
    },

    // 2. Boss Huyễn Sa Mạc (Dành cho cấp 19 đột phá)
    'boss_desert': {
        id: 'boss_desert',
        name: 'Tử Sa Ma Yết',
        icon: '🦂', // Sẽ vẽ to ra nhờ thuộc tính size
        mapSpawn: 'desert',
        hp: 12000,
        damage: 150,
        size: 100,              // Rất to
        speed: 140,
        lockTime: 90,           // 90 giây cho trận chiến
        xp: 3000,
        drops: [
            { id: 'scorpion_king_core', count: 1, rate: 1.0 },
            { id: 'scorpion_tail', count: 8, rate: 1.0 },
            { id: 'iron', count: 8, rate: 0.5 }
        ]
    },

    // 3. Boss Cực Hàn Băng Ngục (Dành cho cấp 29 đột phá)
    'boss_ice': {
        id: 'boss_ice',
        name: 'Băng Sương Cự Viên',
        icon: '🧌',
        mapSpawn: 'ice',
        hp: 45000,
        damage: 400,
        size: 120,              // Khổng lồ
        speed: 110,             // Chạy chậm nhưng gõ đau
        lockTime: 120,          // 2 phút
        xp: 8000,
        drops: [
            { id: 'frost_ape_core', count: 1, rate: 1.0 },
            { id: 'ice_bear_claw', count: 10, rate: 1.0 },
            { id: 'ice_crystal', count: 10, rate: 0.5 }
        ]
    },

    // 4. Boss Thâm Đáy Hải Vực (Dành cho cấp 39 đột phá)
    'boss_ocean': {
        id: 'boss_ocean',
        name: 'Độc Giác Giao Long',
        icon: '🐉',
        mapSpawn: 'ocean',
        hp: 150000,
        damage: 1200,
        size: 150,              // Chiếm cả màn hình
        speed: 180,             // Rất nhanh
        lockTime: 180,          // 3 phút
        xp: 25000,
        drops: [
            { id: 'flood_dragon_core', count: 1, rate: 1.0 },
            { id: 'shark_fin', count: 12, rate: 1.0 },
            { id: 'pearl', count: 12, rate: 0.5 }
        ]
    },

    // 5. Boss Luyện Ngục Diệm Sơn (Dành cho cấp 49 đột phá)
    'boss_volcano': {
        id: 'boss_volcano',
        name: 'Luyện Ngục Ma Tôn',
        icon: '👺',
        mapSpawn: 'volcano',
        hp: 500000,             // Boss tối thượng, máu nửa triệu
        damage: 3500,
        size: 180,              // Áp đảo tuyệt đối
        speed: 220,             // Nhanh như chớp
        lockTime: 300,          // 5 phút sinh tử
        xp: 100000,
        drops: [
            { id: 'demon_lord_core', count: 1, rate: 1.0 },
            { id: 'demon_horn', count: 15, rate: 1.0 },
            { id: 'obsidian', count: 15, rate: 1.0 }       // Boss cuối rớt 100% khoáng hiếm
        ]
    }
};

export const ALCHEMY_RECIPES = {
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
    'pill_trucco': {
        id: 'pill_trucco', name: 'Trúc Cơ Đan', icon: '💊', type: 'breakthrough', targetLv: 9, time: 60,
        desc: 'Đột phá Trúc Cơ Kỳ (Lv.10).',
        req: [{ id: 'herb', count: 20 }, { id: 'boar_tusk', count: 10 }, { id: 'boar_king_core', count: 1 }]
    },
    'pill_kimdan': {
        id: 'pill_kimdan', name: 'Ngưng Kim Đan', icon: '🟡', type: 'breakthrough', targetLv: 19, time: 120,
        desc: 'Đột phá Kim Đan Kỳ (Lv.20).',
        req: [{ id: 'cactus', count: 30 }, { id: 'scorpion_tail', count: 15 }, { id: 'scorpion_king_core', count: 1 }]
    },
    'pill_nguyenanh': {
        id: 'pill_nguyenanh', name: 'Kết Anh Đan', icon: '🔮', type: 'breakthrough', targetLv: 29, time: 300,
        desc: 'Đột phá Nguyên Anh Kỳ (Lv.30).',
        req: [{ id: 'snow_lotus', count: 40 }, { id: 'ice_bear_claw', count: 20 }, { id: 'frost_ape_core', count: 1 }]
    },
    'pill_hoathan': {
        id: 'pill_hoathan', name: 'Tạo Hóa Đan', icon: '🪷', type: 'breakthrough', targetLv: 39, time: 600,
        desc: 'Đột phá Hóa Thần Kỳ (Lv.40).',
        req: [{ id: 'seaweed', count: 50 }, { id: 'shark_fin', count: 25 }, { id: 'flood_dragon_core', count: 1 }]
    },
    'pill_luyenhu': {
        id: 'pill_luyenhu', name: 'Hư Không Đan', icon: '🔥', type: 'breakthrough', targetLv: 49, time: 1200,
        desc: 'Đột phá Luyện Hư Kỳ (Lv.50).',
        req: [{ id: 'fire_flower', count: 80 }, { id: 'demon_horn', count: 40 }, { id: 'demon_lord_core', count: 1 }]
    }
};