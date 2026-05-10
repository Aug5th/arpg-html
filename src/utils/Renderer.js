import { VISUAL_CONFIG, XP_ORB_CONFIG } from '../data/GameData.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    draw(state, input) {
        const ctx = this.ctx;
        ctx.fillStyle = '#070b19'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save(); ctx.translate(-state.camX, -state.camY);

        // Lưới nền
        const grid = VISUAL_CONFIG.gridSize; // Lấy kích thước lưới từ Data

        ctx.strokeStyle = VISUAL_CONFIG.gridColor; // Lấy màu sắc từ Data
        ctx.lineWidth = 1;

        const startX = Math.floor(state.camX / grid) * grid;
        const startY = Math.floor(state.camY / grid) * grid;

        ctx.beginPath();
        for (let x = startX; x < startX + this.canvas.width + grid; x += grid) {
            ctx.moveTo(x, state.camY);
            ctx.lineTo(x, state.camY + this.canvas.height);
        }
        for (let y = startY; y < startY + this.canvas.height + grid; y += grid) {
            ctx.moveTo(state.camX, y);
            ctx.lineTo(state.camX + this.canvas.width, y);
        }
        ctx.stroke();

        // VFX đất
        state.vfxs.forEach(v => {
            ctx.save();
            if (v.type === 'slash') {
                ctx.translate(v.x, v.y); ctx.rotate(v.angle);
                ctx.beginPath(); ctx.arc(0, 0, v.radius, -v.arc / 2, v.arc / 2);
                ctx.strokeStyle = v.color; ctx.lineWidth = 20 * (v.life / v.maxLife); ctx.shadowBlur = 15; ctx.shadowColor = v.color; ctx.stroke();
            } else if (v.type === 'rect') {
                ctx.translate(v.x, v.y); ctx.rotate(v.angle); ctx.fillStyle = `rgba(255, 170, 0, ${v.life / v.maxLife})`; ctx.fillRect(-v.w / 2, -v.h / 2, v.w, v.h);
            } else if (v.type === 'circle' || v.type === 'bossAOE') {
                ctx.beginPath(); ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2); ctx.fillStyle = v.type === 'bossAOE' ? 'rgba(255,0,0,0.2)' : v.color; ctx.fill();
                if (v.type === 'bossAOE') { ctx.strokeStyle = 'red'; ctx.lineWidth = 2; ctx.stroke(); }
            } else if (v.type === 'mountainWarning') {
                ctx.beginPath(); ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 0, 0, ${0.1 + Math.sin(v.life * 15) * 0.1})`; ctx.fill();
                ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 3; ctx.setLineDash([10, 5]); ctx.stroke(); ctx.setLineDash([]);
            }
            ctx.restore();
        });

        state.tornados.forEach(t => { ctx.beginPath(); ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2); ctx.fillStyle = 'rgba(50, 255, 170, 0.4)'; ctx.fill(); ctx.strokeStyle = '#33ffaa'; ctx.lineWidth = 2; ctx.stroke(); });
        state.arrowRains.forEach(r => { ctx.beginPath(); ctx.arc(r.x, r.y, 150, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(50, 255, 80, 0.5)'; ctx.lineWidth = 2; ctx.stroke(); });

        // Đá
        state.mountains.forEach(m => {
            ctx.save(); ctx.translate(m.x, m.y);
            const hpPct = m.hp / m.maxHp;
            ctx.beginPath(); ctx.moveTo(0, -m.radius); ctx.lineTo(m.radius * 0.8, -m.radius * 0.4); ctx.lineTo(m.radius, m.radius * 0.6); ctx.lineTo(0, m.radius); ctx.lineTo(-m.radius * 0.7, m.radius * 0.5); ctx.lineTo(-m.radius, -m.radius * 0.3); ctx.closePath();
            ctx.fillStyle = hpPct < 0.5 ? '#1a1a1a' : '#2b2b2b'; ctx.fill();
            ctx.strokeStyle = hpPct < 0.5 ? '#555' : '#ff3300'; ctx.lineWidth = 3; ctx.stroke();
            ctx.restore();
        });

        // Quái
        state.enemies.forEach(e => {
            ctx.save(); ctx.translate(e.x, e.y); if (e.isTossed > 0) { ctx.translate(0, -30); }
            ctx.rotate(Math.atan2(state.player.y - e.y, state.player.x - e.x));
            ctx.fillStyle = '#111'; ctx.fillRect(-15, -15, 30, 30); ctx.strokeStyle = '#6600aa'; ctx.lineWidth = 2; ctx.strokeRect(-15, -15, 30, 30);
            ctx.fillStyle = 'red'; ctx.shadowBlur = 10; ctx.shadowColor = 'red'; ctx.fillRect(5, -8, 12, 4); ctx.fillRect(5, 4, 12, 4);
            ctx.restore();
            ctx.fillStyle = '#220022'; ctx.fillRect(e.x - 20, e.y - 30, 40, 5); ctx.fillStyle = '#aa00ff'; ctx.fillRect(e.x - 20, e.y - 30, 40 * (e.hp / e.maxHp), 5);

            // --- BỔ SUNG ĐOẠN VẼ TÊN ---
            ctx.fillStyle = '#ffaa00'; // Màu vàng cam tiên hiệp
            ctx.font = 'bold 12px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';

            // Vẽ chữ lùi lên trên (trừ đi nửa chiều cao của quái và thêm 15px để không bị đè vào thanh máu)
            const nameY = e.y - (e.size || 30) / 2 - 20;

            // Thêm viền đen (Stroke) mỏng cho chữ dễ đọc trên nền tối
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#000000';
            ctx.strokeText(e.name, e.x, nameY);
            ctx.fillText(e.name, e.x, nameY);
        });

        // Boss
        if (state.boss) {
            const b = state.boss;
            ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(performance.now() * 0.001); ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255, 0, 85, 0.8)'; ctx.lineWidth = 5; ctx.setLineDash([20, 10]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
            ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(state.player.y - b.y, state.player.x - b.x));
            ctx.fillStyle = '#050011'; ctx.fillRect(-40, -40, 80, 80); ctx.strokeStyle = '#ff0033'; ctx.lineWidth = 3; ctx.strokeRect(-40, -40, 80, 80);
            ctx.fillStyle = '#ff0033'; ctx.shadowBlur = 20; ctx.shadowColor = '#ff0033'; ctx.fillRect(20, -25, 20, 10); ctx.fillRect(20, 15, 20, 10);
            ctx.restore();
        }

        // Đạn
        state.projectiles.forEach(p => {
            ctx.save(); ctx.translate(p.x, p.y);
            if (p.type === 'arrow' || p.type === 'bigarrow') {
                ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillStyle = p.type === 'arrow' ? '#33ff55' : '#ff3300'; ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle; ctx.fillRect(0, -2, p.type === 'arrow' ? 20 : 40, p.type === 'arrow' ? 4 : 10);
            } else if (p.type === 'bossOrb') {
                ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fillStyle = '#ff00ff'; ctx.shadowBlur = 15; ctx.shadowColor = '#ff00ff'; ctx.fill();
            } else if (p.type === 'slashwave') {
                ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.beginPath(); ctx.arc(0, 0, 40, -Math.PI / 4, Math.PI / 4); ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 10; ctx.shadowBlur = 20; ctx.shadowColor = '#00ffff'; ctx.stroke();
            } else if (p.type === 'expandingRing') {
                ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2); ctx.globalAlpha = Math.max(0, p.life / (p.maxRadius / p.expansionSpeed)); ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 6; ctx.shadowBlur = 15; ctx.shadowColor = '#ff00ff'; ctx.stroke();
            }
            ctx.restore();
        });

        // Vẽ XP Orbs (Vẽ trước Player để nằm dưới chân)
        state.xpOrbs.forEach(orb => {
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, XP_ORB_CONFIG.size, 0, Math.PI * 2);
            ctx.fillStyle = XP_ORB_CONFIG.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = XP_ORB_CONFIG.color;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset shadow để không lag
        });

        state.flyingSwords.forEach(s => { ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.angle); ctx.fillStyle = '#ccffff'; ctx.shadowBlur = 15; ctx.shadowColor = '#00aaff'; ctx.fillRect(-15, -4, 30, 8); ctx.restore(); });

        // --- VẼ LÀNG TÂN THỦ ---
        if (state.currentMap === 'village') {

            const env = state.villageEnv;

            // Vẽ Cỏ (Mấy nét gạch nhỏ)
            ctx.strokeStyle = '#1a3300';
            ctx.lineWidth = 2;
            env.grass.forEach(g => {
                ctx.beginPath();
                ctx.moveTo(g.x, g.y); ctx.lineTo(g.x - 5, g.y - 10);
                ctx.moveTo(g.x, g.y); ctx.lineTo(g.x + 5, g.y - 10);
                ctx.stroke();
            });

            // Vẽ Cây
            env.trees.forEach(t => {
                ctx.fillStyle = '#4d2600'; // Thân cây
                ctx.fillRect(t.x - 10, t.y, 20, 40);
                ctx.beginPath(); // Tán lá
                ctx.arc(t.x, t.y - 20, 40, 0, Math.PI * 2);
                ctx.fillStyle = '#004d00';
                ctx.fill();
            });

            // Vẽ Nhà (Hình vuông + Mái tam giác)
            env.houses.forEach(h => {
                ctx.fillStyle = '#804000'; // Thân nhà
                ctx.fillRect(h.x - 60, h.y, 120, 80);
                ctx.beginPath(); // Mái nhà
                ctx.moveTo(h.x - 80, h.y);
                ctx.lineTo(h.x, h.y - 60);
                ctx.lineTo(h.x + 80, h.y);
                ctx.fillStyle = '#4d0000';
                ctx.fill();
                ctx.fillStyle = '#000'; // Cửa sổ
                ctx.fillRect(h.x - 10, h.y + 40, 20, 30);
            });

            // Vẽ ông lão
            ctx.beginPath();
            ctx.arc(state.npc.x, state.npc.y, state.npc.size / 2, 0, Math.PI * 2);
            ctx.fillStyle = '#cccccc'; // Màu áo xám tro
            ctx.fill();

            // Vẽ Thiết Trùy Đại Sư (Thợ Rèn)
            ctx.font = `${state.blacksmith.size}px Arial`;
            ctx.fillText('🧔', state.blacksmith.x, state.blacksmith.y); // Icon ông chú râu quai nón
            ctx.fillStyle = '#ff4444'; // Tên màu đỏ cam cho ngầu
            ctx.font = '14px Arial';
            ctx.fillText(state.blacksmith.name, state.blacksmith.x, state.blacksmith.y - 35);
            ctx.font = '20px Arial';
            ctx.fillText('🔨', state.blacksmith.x + 20, state.blacksmith.y + 10); // Vẽ thêm cái búa kế bên

            // Vẽ tên Lão Nhân
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 14px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(state.npc.name, state.npc.x, state.npc.y - 30);

            // CẬP NHẬT HIỆU ỨNG TRÊN ĐẦU
            if (!state.selectedClass) {
                // Chưa chọn class: Hiện dấu hỏi chấm vàng
                ctx.fillStyle = '#ffaa00';
                ctx.font = '20px sans-serif';
                ctx.fillText('❓', state.npc.x, state.npc.y - 50 + Math.sin(performance.now() * 0.005) * 5);
            } else {
                // Đã chọn class: Hiện bong bóng chat trắng
                ctx.fillStyle = '#ffffff';
                ctx.font = '16px sans-serif';
                ctx.fillText('💬', state.npc.x, state.npc.y - 50 + Math.sin(performance.now() * 0.005) * 3);
            }

            const port = state.portal;
            const time = performance.now() * 0.002;

            // Vẽ vòng tròn phát sáng xoay tròn
            ctx.save();
            ctx.translate(port.x, port.y);
            ctx.rotate(time);

            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 3;
            ctx.setLineDash([20, 10]); // Nét đứt tạo hiệu ứng vòng quay
            ctx.beginPath();
            ctx.arc(0, 0, port.size / 2, 0, Math.PI * 2);
            ctx.stroke();

            // Lớp hào quang ở giữa
            ctx.restore();
            ctx.beginPath();
            ctx.arc(port.x, port.y, port.size / 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            ctx.fill();

            // Chữ bên trên cổng
            ctx.fillStyle = '#00ffff';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText("CỔNG DỊCH CHUYỂN", port.x, port.y - 60);
        }

        if (state.currentMap === 'forest') {
            // Vẽ Thảo Dược
            state.forestEnv.herbs.forEach(h => {
                ctx.font = '20px Arial';
                ctx.fillText('🌿', h.x, h.y);
            });

            // Vẽ Khoáng Sản
            state.forestEnv.ores.forEach(o => {
                ctx.font = '24px Arial';
                ctx.fillText('🧱', o.x, o.y);
            });

            // VẼ THANH TIẾN TRÌNH ĐÀO KHOÁNG
            if (state.isMining) {
                const barW = 60, barH = 8;
                const progress = (3.0 - state.miningTimer) / 3.0;

                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                // Đã đổi p.x thành state.player.x
                ctx.fillRect(state.player.x - barW / 2, state.player.y - 60, barW, barH);

                ctx.fillStyle = '#00ffff';
                ctx.fillRect(state.player.x - barW / 2, state.player.y - 60, barW * progress, barH);

                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center'; // Thêm dòng này để chữ canh giữa cho đẹp
                ctx.fillText("ĐANG ĐÀO...", state.player.x, state.player.y - 65);
            }
        }

        // Player
        ctx.save(); ctx.translate(state.player.x, state.player.y);
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0, 255, 255, 0.1)'; ctx.fill(); ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.rotate(state.player.angle);
        ctx.globalAlpha = (state.player.iFrames > 0 || state.player.isDashing) ? 0.4 : 1.0;
        ctx.fillStyle = '#eeeeee'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
        if (state.selectedClass === 'sword') {
            ctx.fillStyle = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(10, 10, 40, 5);
        } else if (state.selectedClass === 'bow') {
            ctx.beginPath();
            ctx.arc(10, 0, 20, -Math.PI / 2, Math.PI / 2);
            ctx.strokeStyle = '#33ff55';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        ctx.restore();

        // Particles
        state.vfxs.forEach(v => {
            if (v.type === 'particle') { ctx.fillStyle = v.color; ctx.globalAlpha = v.life * 2; ctx.beginPath(); ctx.arc(v.x, v.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
            else if (v.type === 'fallingArrow') { ctx.fillStyle = '#33ff55'; ctx.globalAlpha = v.life * 3; ctx.fillRect(v.x, v.y, 2, 20); ctx.globalAlpha = 1; }
        });

        ctx.restore();

        // Crosshair
        if (state.gameRunning && !state.isDead && !state.isVictory) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(input.mouseX - 10, input.mouseY); ctx.lineTo(input.mouseX + 10, input.mouseY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(input.mouseX, input.mouseY - 10); ctx.lineTo(input.mouseX, input.mouseY + 10); ctx.stroke();
        }
    }
}