// systems/BattleManager.js
import { WEAPONS, BASE_STATS, XP_ORB_CONFIG, ITEMS } from '../data/GameData.js';
import { worldToIso } from '../utils/MathHelper.js';

export class BattleManager {
    constructor(state, ui) {
        this.state = state;
        this.ui = ui;
    }

    /**
     * Lấy thời gian hồi chiêu đã giảm trừ theo thuộc tính nhân vật
     */
    getSkillCd(key) {
        // Nếu là phím lướt (Dash), lấy trực tiếp từ chỉ số cơ bản hoặc config riêng biệt
        if (key === 'dash') {
            return BASE_STATS.dashCd || 1.5; // Điền lượng CD mặc định của dash nếu thiếu config
        }

        const cls = this.state.selectedClass;
        if (!cls || !WEAPONS[cls] || !WEAPONS[cls].skills[key]) return 0;

        // Đòn đánh thường (lmb) scale theo Tốc đánh, Kỹ năng (s1, s2, s3) scale theo Giảm hồi chiêu (CDR)
        return key === 'lmb' 
            ? WEAPONS[cls].skills[key].cd / this.state.player.attackSpeed 
            : WEAPONS[cls].skills[key].cd * (BASE_STATS.cdr || 1);
    }

    /**
     * Lấy sát thương thực tế dựa trên tỷ lệ skill và công kích nhân vật
     */
    getSkillDmg(key) {
        const cls = this.state.selectedClass;
        if (!cls || !WEAPONS[cls]) return 0;
        return this.state.player.attack * WEAPONS[cls].skills[key].dmgMult;
    }

    /**
     * Xử lý kích hoạt kỹ năng từ Input chuột (LMB / RMB)
     */
    handleMouseActions(input) {
        const p = this.state.player;
        if (!this.state.selectedClass || this.state.currentMap === 'village' || this.state.isMining) return;

        // Đòn đánh thường (LMB)
        if (input.isLmbDown && this.state.cd.lmb <= 0) {
            const dmg = this.getSkillDmg('lmb');
            if (this.state.selectedClass === 'sword') {
                this.createSlash(p.x, p.y, p.angle, 100, Math.PI / 1.5, dmg, '#00ffff', 0.2);
            } else {
                this.state.projectiles.push({
                    x: p.x + Math.cos(p.angle) * 20, y: p.y + Math.sin(p.angle) * 20,
                    vx: Math.cos(p.angle) * 800, vy: Math.sin(p.angle) * 800,
                    life: 1.5, type: 'arrow', dmg: dmg, pierce: false, hitList: []
                });
            }
            this.state.cd.lmb = this.getSkillCd('lmb');
        }

        // Kỹ năng phụ (RMB)
        if (input.isRmbDown && this.state.cd.rmb <= 0) {
            const dmg = this.getSkillDmg('rmb');
            if (this.state.selectedClass === 'sword') {
                this.state.projectiles.push({
                    x: p.x, y: p.y, radius: 10, maxRadius: 200, expansionSpeed: 600,
                    life: 200 / 600, type: 'expandingRing', dmg: dmg, hitList: []
                });
            } else {
                for (let i = -2; i <= 2; i++) {
                    this.state.projectiles.push({
                        x: p.x, y: p.y,
                        vx: Math.cos(p.angle + i * 0.15) * 700, vy: Math.sin(p.angle + i * 0.15) * 700,
                        life: 1.5, type: 'arrow', dmg: dmg, pierce: false, hitList: []
                    });
                }
            }
            this.state.cd.rmb = this.getSkillCd('rmb');
        }
    }

    createSlash(px, py, ang, radius, arc, dmg, color, life) {
        this.state.vfxs.push({ x: px, y: py, angle: ang, radius: radius, arc: arc, life: life, maxLife: life, type: 'slash', color: color });
        this.checkConeDamage(px, py, ang, radius, arc, dmg);
    }

    checkConeDamage(px, py, ang, radius, arc, dmg) {
        [...this.state.enemies, this.state.boss, ...this.state.mountains].forEach(e => {
            if (!e || e.hp <= 0) return;
            const dist = Math.hypot(e.x - px, e.y - py) - (e.size || e.radius || 30) / 2;
            if (dist <= radius) {
                let diff = Math.abs(ang - Math.atan2(e.y - py, e.x - px));
                if (diff > Math.PI) diff = 2 * Math.PI - diff;
                if (arc >= 6.1 || diff <= arc / 2) this.applyDamage(e, dmg);
            }
        });
    }

    checkRectDamage(cx, cy, ang, len, wid, dmg) {
        const dx = Math.cos(ang), dy = Math.sin(ang);
        [...this.state.enemies, this.state.boss, ...this.state.mountains].forEach(e => {
            if (!e || e.hp <= 0) return;
            const vx = e.x - cx, vy = e.y - cy;
            if (Math.abs(vx * dx + vy * dy) <= len / 2 && Math.abs(vx * -dy + vy * dx) <= wid / 2) {
                this.applyDamage(e, dmg);
            }
        });
    }

    applyDamage(entity, baseDmg, isCritOverride = null, damageType = 'normal') {
        let isCrit = false;

        // 1. XỬ LÝ CRIT
        if (isCritOverride !== null) {
            isCrit = isCritOverride;
        } else if (damageType === 'normal') {
            const critChance = (this.state.player.crit || 0) / 100;
            if (Math.random() < critChance) {
                baseDmg = baseDmg * 2;
                isCrit = true;
            }
        }
        let finalDmg = Math.floor(baseDmg);

        // 2. XỬ LÝ HIỆU ỨNG NHÁNH VŨ KHÍ
        const isEnemyTarget = (this.state.enemies.includes(entity) || (this.state.boss && entity === this.state.boss));
        if (damageType === 'normal' && isEnemyTarget) {
            if (this.state.player.weaponBranch === 'poison') {
                if (!entity.effects) entity.effects = {};
                const originalDmg = finalDmg;
                finalDmg = Math.round(originalDmg * 0.8);
                const damagePerTick = Math.round(originalDmg * 0.15);

                entity.effects.poison = { ticksLeft: 6, timer: 0, damagePerTick: Math.max(1, damagePerTick) };
                damageType = 'poison_hit';
            } 
            else if (this.state.player.weaponBranch === 'ice') {
                if (!entity.effects) entity.effects = {};
                if (!entity.effects.ice) {
                    entity.effects.ice = { stacks: 0, durationLeft: 5.0, explodeTimer: -1, baseDamageRef: finalDmg };
                }
                let ice = entity.effects.ice;
                if (ice.explodeTimer < 0) {
                    ice.stacks = Math.min(3, ice.stacks + 1);
                    ice.durationLeft = 5.0;
                    ice.baseDamageRef = finalDmg;
                    if (ice.stacks === 3) ice.explodeTimer = 0.5;
                }
            } 
            else if (this.state.player.weaponBranch === 'blood') {
                if (!entity.effects) entity.effects = {};
                const originalDmg = finalDmg;
                finalDmg = Math.round(originalDmg * 0.5);
                const damagePerTick = Math.round(originalDmg * 0.15); // Đã buff theo bản cập nhật của bạn

                if (!entity.effects.bleed) {
                    entity.effects.bleed = { stacks: 0, durationLeft: 3.0, timer: 0, damagePerTick: Math.max(1, damagePerTick), baseDamageRef: originalDmg };
                }
                let bleed = entity.effects.bleed;
                bleed.stacks = Math.min(6, bleed.stacks + 1);
                bleed.durationLeft = 3.0;
                bleed.timer = 0;
                bleed.baseDamageRef = originalDmg;

                if (bleed.stacks === 6) {
                    const explodeDmg = bleed.baseDamageRef;
                    delete entity.effects.bleed;
                    this.applyDamage(entity, explodeDmg, false, 'bleed_explode');
                    this.state.vfxs.push({ type: 'circle', color: 'rgba(255, 0, 50, 0.6)', x: entity.x, y: entity.y, radius: 65, life: 0.2, maxLife: 0.2 });
                    return;
                } else {
                    damageType = 'bleed_hit';
                }
            }
        }

        entity.hp -= finalDmg;

        // 3. HIỂN THỊ DAMAGE TEXT UI
        let color = '#ffcc00';
        if (isCrit) color = '#ff3333';
        if (damageType === 'poison_dot') color = isCrit ? '#76ff03' : '#33ff55';
        else if (damageType === 'ice_explode') color = '#00d4ff';
        else if (damageType === 'bleed_dot' || damageType === 'bleed_explode') color = '#ff1111';

        const dmgEl = this.ui.createDmgText(finalDmg, color, document.getElementById('damage-container'));

        if (damageType === 'poison_dot') {
            dmgEl.innerText = `☠️ ${finalDmg}`;
            dmgEl.style.fontSize = '18px'; dmgEl.style.fontWeight = 'bold';
            dmgEl.style.textShadow = '0 0 6px #33ff55, 1px 1px 2px black';
        } else if (damageType === 'bleed_dot') {
            dmgEl.innerText = `🩸 ${finalDmg}`;
            dmgEl.style.fontSize = '18px'; dmgEl.style.fontWeight = 'bold';
            dmgEl.style.textShadow = '0 0 6px #ff1111, 1px 1px 2px black';
        } else if (damageType === 'ice_explode') {
            dmgEl.innerText = `❄️💥 ${finalDmg}`;
            dmgEl.style.fontSize = '28px'; dmgEl.style.fontWeight = 'bold';
            dmgEl.style.textShadow = '0 0 12px #00d4ff, 1px 1px 3px black';
        } else if (damageType === 'bleed_explode') {
            dmgEl.innerText = `🩸💥 ${finalDmg}`;
            dmgEl.style.fontSize = '32px'; dmgEl.style.fontWeight = '900';
            dmgEl.style.textShadow = '0 0 15px #ff0000, 1px 1px 4px black';
        } else {
            if (isCrit) {
                dmgEl.innerText = `💥${finalDmg}`;
                dmgEl.style.fontSize = '35px'; dmgEl.style.fontWeight = '900';
                dmgEl.style.textShadow = '0 0 15px #ff0000, 2px 2px 5px black';
                dmgEl.style.zIndex = '50';
            }
        }

        this.state.vfxs.push({
            type: 'text', el: dmgEl,
            x: entity.x + (Math.random() - 0.5) * 40,
            y: entity.y - (damageType.endsWith('_dot') ? 25 : 0),
            vy: damageType.endsWith('_dot') ? -45 : -60,
            life: damageType.endsWith('_dot') ? 0.9 : 1.2
        });

        // 4. XỬ LÝ QUÁI CHẾT
        if (entity.hp <= 0) {
            this.handleEntityDeath(entity);
        }
    }

    takePlayerDamage(amount) {
        const p = this.state.player;
        if (p.iFrames > 0 || this.state.isDead || this.state.isVictory) return;
        p.hp = Math.max(0, p.hp - amount);
        p.iFrames = 0.5;
        this.ui.updateHp(p.hp, p.maxHp);

        const dmgEl = this.ui.createDmgText(amount, '#ff0000', document.getElementById('damage-container'));
        this.state.vfxs.push({ type: 'text', el: dmgEl, x: p.x + (Math.random() - 0.5) * 40, y: p.y, vy: -50, life: 1.0 });

        if (p.hp <= 0) {
            this.state.isDead = true;
            this.ui.toggleScreen('game-over-screen', true);
        }
    }

    updateEntityStatusEffects(entity, dt) {
        if (!entity || !entity.effects || entity.hp <= 0) return;

        for (let effectKey in entity.effects) {
            const effect = entity.effects[effectKey];

            switch (effectKey) {
                case 'poison':
                    effect.timer += dt;
                    if (effect.timer >= 0.5) {
                        effect.timer -= 0.5;
                        effect.ticksLeft--;
                        this.applyDamage(entity, effect.damagePerTick, false, 'poison_dot');
                        if (effect.ticksLeft <= 0 || entity.hp <= 0) delete entity.effects.poison;
                    }
                    break;

                case 'ice':
                    if (effect.explodeTimer < 0) {
                        effect.durationLeft -= dt;
                        if (effect.durationLeft <= 0) { delete entity.effects.ice; break; }
                    }
                    if (effect.explodeTimer > 0) {
                        effect.explodeTimer -= dt;
                        if (effect.explodeTimer <= 0) {
                            const explodeDmg = Math.floor(effect.baseDamageRef * 0.75);
                            this.applyDamage(entity, explodeDmg, false, 'ice_explode');
                            delete entity.effects.ice;
                        }
                    }
                    break;

                case 'bleed':
                    effect.durationLeft -= dt;
                    if (effect.durationLeft <= 0) { delete entity.effects.bleed; break; }
                    effect.timer += dt;
                    if (effect.timer >= 0.5) {
                        effect.timer -= 0.5;
                        this.applyDamage(entity, effect.damagePerTick, false, 'bleed_dot');
                    }
                    break;
            }
        }
    }

    handleEntityDeath(entity) {
        if (entity === this.state.boss) {
            if (entity.drops) {
                entity.drops.forEach(drop => {
                    if (Math.random() <= drop.rate) {
                        const itemData = Object.values(ITEMS).find(i => i.id === drop.id);
                        if (itemData) {
                            this.state.droppedItems.push({
                                x: entity.x + (Math.random() - 0.5) * 120, y: entity.y + (Math.random() - 0.5) * 120,
                                item: itemData, count: drop.count
                            });
                        }
                    }
                });
                this.state.player.exp += entity.xp || 0;
                if (window.checkLevelUp) window.checkLevelUp();
                this.state.player.souls += 100;
            }
            this.state.bossReturnPortal = { x: entity.x, y: entity.y };
            this.state.boss = null;
        } 
        else if (this.state.enemies.includes(entity)) {
            this.state.xpOrbs.push({
                x: entity.x, y: entity.y,
                value: Math.ceil(entity.maxHp * XP_ORB_CONFIG.xpPerEnemyHp),
                vx: (Math.random() - 0.5) * 100, vy: (Math.random() - 0.5) * 100
            });
            this.state.enemies = this.state.enemies.filter(e => e !== entity);
            this.state.kills++;
            this.state.player.souls += Math.floor(Math.random() * 3) + 1;

            const safeMaxHp = entity.maxHp || entity.hp || 10;
            const gemDrop = Math.floor(Math.random() * (safeMaxHp / 5)) + 5;
            this.state.player.gem += gemDrop;

            const ltEl = document.createElement('div');
            ltEl.style = "position: absolute; color: #00ffff; font-weight: bold; font-size: 18px; text-shadow: 0 0 5px #00ffff, 1px 1px 2px black; pointer-events: none;";
            ltEl.innerText = `💎 +${gemDrop}`;
            document.getElementById('damage-container').appendChild(ltEl);
            this.state.vfxs.push({ type: 'text', el: ltEl, x: entity.x + 20, y: entity.y - 20, vy: -50, life: 1.2 });

            if (window.updateInventoryUI) window.updateInventoryUI();

            if (entity.drop && Math.random() < entity.dropRate) {
                if (window.addItemToInventory && window.addItemToInventory(entity.drop)) {
                    const dropEl = document.createElement('div');
                    dropEl.style = "position: absolute; color: #55ff55; font-weight: bold; font-size: 18px; text-shadow: 1px 1px 3px black; pointer-events: none;";
                    dropEl.innerText = `+1 ${entity.drop.name}`;
                    document.getElementById('damage-container').appendChild(dropEl);
                    this.state.vfxs.push({ type: 'text', el: dropEl, x: entity.x, y: entity.y - 30, vy: -40, life: 1.5 });
                }
            }
        } 
        else if (this.state.mountains.includes(entity)) {
            this.state.mountains = this.state.mountains.filter(m => m !== entity);
        }
    }
}