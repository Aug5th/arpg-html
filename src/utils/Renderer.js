import { VISUAL_CONFIG, XP_ORB_CONFIG, MAP_CONFIG } from '../data/GameData.js';
import { worldToIso, isoToWorld } from './MathHelper.js'; // Giả định bạn lưu toán hệ ở bước 1 vào đây

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    draw(state, input) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Đổ màu nền chủ đề theo cấu hình map dã ngoại
        let currentBgColor = '#070b19';
        if (['forest', 'desert', 'ice', 'ocean', 'volcano'].includes(state.currentMap)) {
            currentBgColor = MAP_CONFIG[state.currentMap].bgColor;
        }
        ctx.fillStyle = currentBgColor; 
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        // Di chuyển gốc ma trận về chính tâm màn hình (Điểm neo Camera)
        ctx.translate(width / 2, height / 2);

        // Đuổi theo người chơi theo góc nhìn đứng Isometric
        const playerIso = worldToIso(state.player.x, state.player.y);
        ctx.translate(-playerIso.x, -playerIso.y);

        // ==========================================
        // LAYER 1: DỰNG LƯỚI KIM CƯƠNG ISOMETRIC
        // ==========================================
        const grid = VISUAL_CONFIG.gridSize;
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
        ctx.lineWidth = 1;

        const range = 2000;
        const startX = Math.floor((state.player.x - range) / grid) * grid;
        const endX = Math.ceil((state.player.x + range) / grid) * grid;
        const startY = Math.floor((state.player.y - range) / grid) * grid;
        const endY = Math.ceil((state.player.y + range) / grid) * grid;

        for (let x = startX; x <= endX; x += grid) {
            const p1 = worldToIso(x, startY); const p2 = worldToIso(x, endY);
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        }
        for (let y = startY; y <= endY; y += grid) {
            const p1 = worldToIso(startX, y); const p2 = worldToIso(endX, y);
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
        }

        // Biên giới Map dã ngoại lơ lửng chống trôi vật thể
        if (['forest', 'desert', 'ice', 'ocean', 'volcano'].includes(state.currentMap)) {
            const LIMIT = 1600;
            const lt = worldToIso(-LIMIT, -LIMIT); const rt = worldToIso(LIMIT, -LIMIT);
            const rb = worldToIso(LIMIT, LIMIT); const lb = worldToIso(-LIMIT, LIMIT);
            ctx.beginPath();
            ctx.moveTo(lt.x, lt.y); ctx.lineTo(rt.x, rt.y); ctx.lineTo(rb.x, rb.y); ctx.lineTo(lb.x, lb.y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.01)'; ctx.fill();
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.12)'; ctx.lineWidth = 2; ctx.stroke();
        }

        // ==========================================
        // LAYER 2: CHUẨN BỊ RENDER QUEUE SẮP XẾP ĐỘ SÂU Y-SORT (PAINTER'S ALGORITHM)
        // ==========================================
        const renderQueue = [];

        // Thảm cỏ nền làng nhân gian
        if (state.currentMap === 'village' && state.villageEnv.grass) {
            state.villageEnv.grass.forEach(g => {
                const gIso = worldToIso(g.x, g.y);
                ctx.strokeStyle = '#1a3300'; ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(gIso.x, gIso.y); ctx.lineTo(gIso.x - 5, gIso.y - 10);
                ctx.moveTo(gIso.x, gIso.y); ctx.lineTo(gIso.x + 5, gIso.y - 10);
                ctx.stroke();
            });
        }

        // Đưa người chơi vào queue vẽ đứng chiều sâu
        renderQueue.push({
            zOrder: state.player.x + state.player.y,
            draw: () => this.drawPlayer(ctx, state)
        });

        // Nạp kiến trúc thực thể map Làng Tân Thủ
        if (state.currentMap === 'village') {
            renderQueue.push({ zOrder: state.npc.x + state.npc.y, draw: () => this.drawBillboardNPC(ctx, state.npc, '#cccccc', !state.selectedClass ? '❓' : '💬') });
            renderQueue.push({ zOrder: state.blacksmith.x + state.blacksmith.y, draw: () => this.drawBlacksmithNPC(ctx, state.blacksmith) });
            renderQueue.push({ zOrder: state.portal.x + state.portal.y - 60, draw: () => this.drawVillagePortal(ctx, state.portal) });
            state.villageEnv.trees.forEach(t => renderQueue.push({ zOrder: t.x + t.y, draw: () => this.drawVillageTree(ctx, t) }));
            state.villageEnv.houses.forEach(h => renderQueue.push({ zOrder: h.x + h.y + 40, draw: () => this.drawVillageHouse(ctx, h) }));
        }

        // Nạp tài nguyên thực thể bản đồ cày cuốc dã ngoại
        if (['forest', 'desert', 'ice', 'ocean', 'volcano'].includes(state.currentMap)) {
            const mapConfig = MAP_CONFIG[state.currentMap];

            // Cây xanh chướng ngại vật rìa map
            state.mapEnv.trees.forEach(t => renderQueue.push({
                zOrder: t.x + t.y,
                draw: () => this.drawStaticBillboard(ctx, t.x, t.y, mapConfig.obstacle, 40)
            }));

            // Thảo dược linh sơn hái lượm
            state.mapEnv.herbs.forEach(h => renderQueue.push({
                zOrder: h.x + h.y,
                draw: () => this.drawResourceNode(ctx, h.x, h.y, mapConfig.herb.item.icon, mapConfig.herb.item.name, '#55ff55', 20)
            }));

            // Khoáng mạch đúc binh khí lò rèn
            state.mapEnv.ores.forEach(o => renderQueue.push({
                zOrder: o.x + o.y,
                draw: () => this.drawResourceNode(ctx, o.x, o.y, mapConfig.ore.item.icon, mapConfig.ore.item.name, '#ffaa00', 25)
            }));

            // Cổng vào Yêu Vương đại dịch bản xứ
            if (state.mapEnv.portal) {
                renderQueue.push({
                    zOrder: state.mapEnv.portal.x + state.mapEnv.portal.y - 50,
                    draw: () => this.drawWorldPortal(ctx, state.mapEnv.portal.x, state.mapEnv.portal.y, '🌀', 'rgba(0, 255, 255, 0.2)', '#00ffff', 'CỔNG VỀ LÀNG')
                });
            }

            // Cổng rút lui Boss quay về nhân giới
            if (state.bossReturnPortal) {
                renderQueue.push({
                    zOrder: state.bossReturnPortal.x + state.bossReturnPortal.y - 50,
                    draw: () => this.drawWorldPortal(ctx, state.bossReturnPortal.x, state.bossReturnPortal.y, '🌀', 'rgba(255, 0, 255, 0.4)', '#ff00ff', 'ĐỘNG PHỦ YÊU VƯƠNG')
                });
            }

            // Bảo vật rơi rớt dưới đất từ Boss chết
            if (state.droppedItems) {
                state.droppedItems.forEach(drop => renderQueue.push({
                    zOrder: drop.x + drop.y,
                    draw: () => this.drawDroppedItem(ctx, drop)
                }));
            }
        }

        // Quái thú thường và Thượng cổ Ma tôn
        state.enemies.forEach(e => renderQueue.push({ zOrder: e.x + e.y, draw: () => this.drawEnemy(ctx, e) }));
        if (state.boss) renderQueue.push({ zOrder: state.boss.x + state.boss.y, draw: () => this.drawBoss(ctx, state.boss) });

        // Thực thi sắp xếp Painter vẽ thực thể từ xa đến gần cực kỳ ổn định
        renderQueue.sort((a, b) => a.zOrder - b.zOrder);
        renderQueue.forEach(element => element.draw());

        // ==========================================
        // LAYER 3: KÝ NĂNG CHIẾU ĐỨNG, KIẾM KHÍ CHÉM XOAY VÀ LỐC XOÁY
        // ==========================================
        this.drawProjectilesAndVFX(ctx, state);

        ctx.restore(); // Khôi phục ma trận camera phẳng

        // UI phẳng hồng tâm ngắm định hướng chiêu pháp
        if (state.gameRunning && !state.isDead && !state.isVictory) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(input.mouseX - 10, input.mouseY); ctx.lineTo(input.mouseX + 10, input.mouseY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(input.mouseX, input.mouseY - 10); ctx.lineTo(input.mouseX, input.mouseY + 10); ctx.stroke();
        }
    }

    // =========================================================
    // CÁC KHỐI PHƯƠNG THỨC MODULE DỰNG HÌNH THÀNH PHẦN TĨNH/ĐỘNG
    // =========================================================

    drawPlayer(ctx, state) {
        const p = state.player; const iso = worldToIso(p.x, p.y);
        ctx.save(); ctx.translate(iso.x, iso.y);

        ctx.beginPath(); ctx.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.12)'; ctx.fill();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'; ctx.lineWidth = 1.5; ctx.stroke();

        ctx.rotate(p.angle);
        ctx.globalAlpha = (p.iFrames > 0 || p.isDashing) ? 0.4 : 1.0;
        
        ctx.fillStyle = '#eeeeee'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();

        if (state.selectedClass === 'sword') {
            ctx.fillStyle = '#00ffff'; ctx.shadowBlur = 10; ctx.shadowColor = '#00ffff';
            ctx.fillRect(10, 10, 40, 5);
        } else if (state.selectedClass === 'bow') {
            ctx.beginPath(); ctx.arc(10, 0, 20, -Math.PI / 2, Math.PI / 2);
            ctx.strokeStyle = '#33ff55'; ctx.lineWidth = 4; ctx.stroke();
        }
        ctx.restore();
    }

    drawEnemy(ctx, e) {
        const iso = worldToIso(e.x, e.y);
        ctx.save(); ctx.translate(iso.x, iso.y);
        if (e.isTossed > 0) ctx.translate(0, -30);

        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(e.icon || '🐗', 0, 10);

        ctx.fillStyle = '#220022'; ctx.fillRect(-20, -32, 40, 5);
        ctx.fillStyle = '#aa00ff'; ctx.fillRect(-20, -32, 40 * (e.hp / e.maxHp), 5);

        if (e.effects && e.effects.ice) {
            ctx.fillStyle = '#00ffff'; ctx.font = 'bold 11px Arial'; ctx.fillText('❄️ ' + e.effects.ice.stacks, 0, -42);
        } else if (e.effects && e.effects.bleed) {
            ctx.fillStyle = '#ff1111'; ctx.font = 'bold 11px Arial'; ctx.fillText('🩸 ' + e.effects.bleed.stacks, 0, -42);
        }

        ctx.fillStyle = '#ffaa00'; ctx.font = 'bold 11px "Segoe UI", sans-serif'; ctx.textAlign = 'center';
        ctx.lineWidth = 2; ctx.strokeStyle = '#000000';
        ctx.strokeText(e.name, 0, -52); ctx.fillText(e.name, 0, -52);
        ctx.restore();
    }

    drawBoss(ctx, b) {
        const iso = worldToIso(b.x, b.y);
        ctx.save(); ctx.translate(iso.x, iso.y);
        ctx.scale(1, 0.5); ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 0, 85, 0.8)'; ctx.lineWidth = 5; ctx.setLineDash([20, 10]); ctx.stroke();
        
        ctx.scale(1, 2); ctx.fillStyle = '#ffffff';
        ctx.font = '72px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(b.icon || '👹', 0, 20);
        ctx.restore();
    }

    drawStaticBillboard(ctx, wx, wy, emoji, size) {
        const iso = worldToIso(wx, wy);
        ctx.save(); ctx.translate(iso.x, iso.y);
        ctx.fillStyle = '#ffffff';
        ctx.font = `${size}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(emoji, 0, 10);
        ctx.restore();
    }

    drawResourceNode(ctx, wx, wy, icon, name, nameColor, iconSize) {
        const iso = worldToIso(wx, wy);
        ctx.save(); ctx.translate(iso.x, iso.y);
        ctx.fillStyle = '#ffffff';
        ctx.font = `${iconSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(icon, 0, 10);
        
        ctx.fillStyle = nameColor; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center';
        ctx.lineWidth = 2; ctx.strokeStyle = '#000';
        ctx.strokeText(name, 0, -15); ctx.fillText(name, 0, -15);
        ctx.restore();
    }

    drawWorldPortal(ctx, wx, wy, emoji, fillColor, strokeColor, label) {
        const iso = worldToIso(wx, wy);
        ctx.save(); ctx.translate(iso.x, iso.y);
        ctx.scale(1, 0.5); ctx.fillStyle = fillColor; ctx.beginPath(); ctx.arc(0, 0, 45, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = strokeColor; ctx.lineWidth = 3; ctx.stroke();
        
        ctx.scale(1, 2); ctx.fillStyle = '#ffffff';
        ctx.font = '34px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(emoji, 0, -10);
        ctx.fillStyle = strokeColor; ctx.font = 'bold 12px Arial'; ctx.lineWidth = 3; ctx.strokeStyle = '#000';
        ctx.strokeText(label, 0, -42); ctx.fillText(label, 0, -42);
        ctx.restore();
    }

    drawDroppedItem(ctx, drop) {
        const iso = worldToIso(drop.x, drop.y);
        ctx.save(); ctx.translate(iso.x, iso.y);
        const bounceY = Math.sin(performance.now() * 0.005 + drop.x) * 4;
        ctx.fillStyle = '#ffffff'; ctx.font = '26px Arial'; ctx.textAlign = 'center';
        ctx.fillText(drop.item.icon, 0, bounceY);

        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 12px "Segoe UI"'; ctx.textAlign = 'center';
        const txt = `${drop.item.name} x${drop.count}`;
        ctx.lineWidth = 3; ctx.strokeStyle = '#000000';
        ctx.strokeText(txt, 0, -25 + bounceY); ctx.fillText(txt, 0, -25 + bounceY);
        ctx.restore();
    }

    drawBillboardNPC(ctx, npc, color, bubble) {
        const iso = worldToIso(npc.x, npc.y);
        ctx.save(); ctx.translate(iso.x, iso.y);
        ctx.beginPath(); ctx.arc(0, 0, npc.size / 2, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.fillStyle = '#00ffff'; ctx.font = 'bold 14px "Segoe UI"'; ctx.textAlign = 'center';
        ctx.fillText(npc.name, 0, -30);
        ctx.fillStyle = '#ffffff'; ctx.font = '20px sans-serif'; ctx.fillText(bubble, 0, -50 + Math.sin(performance.now() * 0.005) * 4);
        ctx.restore();
    }

    drawBlacksmithNPC(ctx, smith) {
        const iso = worldToIso(smith.x, smith.y);
        ctx.save(); ctx.translate(iso.x, iso.y); ctx.fillStyle = '#ffffff';
        ctx.font = `${smith.size}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText('🧔', 0, 10);
        ctx.fillStyle = '#ff4444'; ctx.font = 'bold 14px Arial'; ctx.fillText(smith.name, 0, -35);
        ctx.font = '20px Arial'; ctx.fillText('🔨', 20, -10);
        ctx.restore();
    }

    drawVillagePortal(ctx, port) {
        const iso = worldToIso(port.x, port.y);
        ctx.save(); ctx.translate(iso.x, iso.y); ctx.rotate(performance.now() * 0.002); ctx.scale(1, 0.5);
        ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 3; ctx.setLineDash([20, 10]);
        ctx.beginPath(); ctx.arc(0, 0, port.size / 2, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        ctx.save(); ctx.translate(iso.x, iso.y); ctx.scale(1, 0.5); ctx.beginPath(); ctx.arc(0, 0, port.size / 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.2)'; ctx.fill();
        ctx.scale(1, 2); ctx.fillStyle = '#00ffff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText("CỔNG DỊCH CHUYỂN", 0, -50);
        ctx.restore();
    }

    drawVillageTree(ctx, t) {
        const iso = worldToIso(t.x, t.y);
        ctx.save(); ctx.translate(iso.x, iso.y);
        ctx.fillStyle = '#4d2600'; ctx.fillRect(-10, 0, 20, 40);
        ctx.beginPath(); ctx.arc(0, -20, 40, 0, Math.PI * 2); ctx.fillStyle = '#004d00'; ctx.fill();
        ctx.restore();
    }

    drawVillageHouse(ctx, h) {
        const iso = worldToIso(h.x, h.y);
        ctx.save(); ctx.translate(iso.x, iso.y);
        ctx.fillStyle = '#804000'; ctx.fillRect(-60, 0, 120, 80);
        ctx.beginPath(); ctx.moveTo(-80, 0); ctx.lineTo(0, -60); ctx.lineTo(80, 0);
        ctx.fillStyle = '#4d0000'; ctx.fill();
        ctx.fillStyle = '#000'; ctx.fillRect(-10, 40, 20, 30);
        ctx.restore();
    }

    // =========================================================
    // HỆ THỐNG PHÂN TÁCH ĐẠN BAY CHIẾU ĐỨNG CHI TIẾT KỸ NĂNG VÀ VFX (FIX BUG CORES)
    // =========================================================
    drawProjectilesAndVFX(ctx, state) {
        // FIX BUG 1: Tái định nghĩa biến Camera nhân vật cục bộ để triệt tiêu lỗi scope crash
        const playerIso = worldToIso(state.player.x, state.player.y);

        // FIX BUG 3: KHÔI PHỤC VÀ DỰNG HÌNH LỐC XOÁY DI CHUYỂN (TIÊN CUNG CHIÊU 3)
        state.tornados.forEach(t => {
            const iso = worldToIso(t.x, t.y);
            ctx.save(); ctx.translate(iso.x, iso.y);
            
            // Tâm bão quét dẹp phẳng dưới mặt sàn
            ctx.save(); ctx.scale(1, 0.5);
            ctx.beginPath(); ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(50, 255, 170, 0.18)'; ctx.fill();
            ctx.strokeStyle = '#33ffaa'; ctx.lineWidth = 2; ctx.stroke();
            ctx.restore();
            
            // Thân lốc xoáy cuộn trào đứng thẳng Billboard dập dềnh
            ctx.fillStyle = '#ffffff';
            ctx.font = '40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const rumbleY = Math.sin(performance.now() * 0.01) * 5;
            ctx.fillText('🌪️', 0, -25 + rumbleY);
            ctx.restore();
        });

        // Khôi phục hiển thị vùng phạm vi Mưa Tên (Tiên Cung Chiêu 1)
        state.arrowRains.forEach(r => {
            const iso = worldToIso(r.x, r.y);
            ctx.save(); ctx.translate(iso.x, iso.y);
            ctx.scale(1, 0.5);
            ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(50, 255, 80, 0.4)'; ctx.lineWidth = 2; ctx.stroke();
            ctx.restore();
        });

        // Vẽ các tia Linh Tiễn đạn lạc bay lượn
        state.projectiles.forEach(p => {
            const iso = worldToIso(p.x, p.y);
            ctx.save(); ctx.translate(iso.x, iso.y);
            if (p.type === 'arrow' || p.type === 'bigarrow') {
                const isoV = worldToIso(p.vx, p.vy); ctx.rotate(Math.atan2(isoV.y, isoV.x));
                ctx.fillStyle = p.type === 'arrow' ? '#33ff55' : '#ff3300'; ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
                ctx.fillRect(0, -2, p.type === 'arrow' ? 20 : 40, p.type === 'arrow' ? 4 : 10);
            } else if (p.type === 'bossOrb') {
                ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fillStyle = '#ff00ff'; ctx.shadowBlur = 15; ctx.shadowColor = '#ff00ff'; ctx.fill();
            } else if (p.type === 'slashwave') {
                const isoV = worldToIso(p.vx, p.vy); ctx.rotate(Math.atan2(isoV.y, isoV.x));
                ctx.beginPath(); ctx.arc(0, 0, 40, -Math.PI / 4, Math.PI / 4); ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 10; ctx.stroke();
            } else if (p.type === 'expandingRing') {
                ctx.scale(1, 0.5); ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
                ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 6; ctx.stroke();
            }
            ctx.restore();
            ctx.shadowBlur = 0;
        });

        // Hạt đốm Linh Khí rơi ra từ xác quái (XP Orbs)
        state.xpOrbs.forEach(orb => {
            const iso = worldToIso(orb.x, orb.y);
            ctx.save(); ctx.beginPath(); ctx.arc(iso.x, iso.y, XP_ORB_CONFIG.size, 0, Math.PI * 2);
            ctx.fillStyle = XP_ORB_CONFIG.color; ctx.shadowBlur = 10; ctx.shadowColor = XP_ORB_CONFIG.color; ctx.fill(); ctx.restore();
            ctx.shadowBlur = 0;
        });

        // Kiếm trận ngự kiếm phi hành xoay quanh nhân vật phím 3
        state.flyingSwords.forEach(s => {
            const iso = worldToIso(s.x, s.y);
            ctx.save(); ctx.translate(iso.x, iso.y); ctx.rotate(s.angle); ctx.fillStyle = '#ccffff'; ctx.shadowBlur = 15; ctx.shadowColor = '#00aaff'; ctx.fillRect(-15, -4, 30, 8); ctx.restore();
            ctx.shadowBlur = 0;
        });

        // Khối núi đá thạch ghim đất từ kỹ năng Boss (Mountains)
        state.mountains.forEach(m => {
            const iso = worldToIso(m.x, m.y);
            ctx.save(); ctx.translate(iso.x, iso.y); ctx.beginPath(); ctx.moveTo(0, -m.radius); ctx.lineTo(m.radius * 0.8, -m.radius * 0.4); ctx.lineTo(m.radius, m.radius * 0.6); ctx.lineTo(0, m.radius); ctx.lineTo(-m.radius * 0.7, m.radius * 0.5); ctx.lineTo(-m.radius, -m.radius * 0.3); ctx.closePath();
            ctx.fillStyle = '#2b2b2b'; ctx.fill(); ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        });

        // ==========================================
        // KHÔI PHỤC HOÀN TOÀN LAYER 4: MẢNG VÒNG LẶP HỘI TỤ VFX (BUG FIX 2)
        // ==========================================
        state.vfxs.forEach(v => {
            const iso = worldToIso(v.x, v.y);
            
            // FIX BUG KIẾM TIÊN ĐÁNH THƯỜNG LMB: Dựng tia Kiếm khí hình quạt nằm sát mặt đất
            if (v.type === 'slash') {
                ctx.save();
                ctx.translate(iso.x, iso.y);
                ctx.transform(1, 0.5, -1, 0.5, 0, 0); // Kỹ thuật bẻ cong không gian chép phẳng sàn thế giới thực
                ctx.rotate(v.angle);
                ctx.beginPath(); ctx.arc(0, 0, v.radius, -v.arc / 2, v.arc / 2);
                ctx.strokeStyle = v.color; ctx.lineWidth = 20 * (v.life / v.maxLife); ctx.shadowBlur = 15; ctx.shadowColor = v.color; ctx.stroke();
                ctx.restore();
                ctx.shadowBlur = 0;
            } 
            // FIX BUG KIẾM TIÊN CHIÊU 1: Vùng quét Trọng kích hình hộp chữ nhật dán phẳng nền
            else if (v.type === 'rect') {
                ctx.save();
                ctx.translate(iso.x, iso.y);
                ctx.transform(1, 0.5, -1, 0.5, 0, 0); // Đưa về hệ ma trận phẳng
                ctx.rotate(v.angle);
                ctx.fillStyle = `rgba(255, 170, 0, ${v.life / v.maxLife})`;
                ctx.fillRect(-v.w / 2, -v.h / 2, v.w, v.h);
                ctx.restore();
            } 
            // Vùng cảnh báo vòng tròn và AOE Độc/Đóng băng của quái vật
            else if (v.type === 'circle' || v.type === 'bossAOE') {
                ctx.save(); ctx.translate(iso.x, iso.y); ctx.scale(1, 0.5); ctx.beginPath(); ctx.arc(0, 0, v.radius, 0, Math.PI * 2);
                ctx.fillStyle = v.type === 'bossAOE' ? 'rgba(255,0,0,0.2)' : v.color; ctx.fill();
                if (v.type === 'bossAOE') { ctx.strokeStyle = 'red'; ctx.lineWidth = 2; ctx.stroke(); }
                ctx.restore();
            } 
            // Vòng tròn nét đứt cảnh báo mưa đá của Boss kịch tính
            else if (v.type === 'mountainWarning') {
                ctx.save(); ctx.translate(iso.x, iso.y); ctx.scale(1, 0.5); ctx.beginPath(); ctx.arc(0, 0, v.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 0, 0, 0.15)`; ctx.fill(); ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 3; ctx.stroke();
                ctx.restore();
            } 
            // FIX BUG CHỮ SÁT THƯƠNG BAY MÀU: Độc lập vị trí theo pixel HTML DOM phẳng
            else if (v.type === 'text') {
                v.el.style.left = (iso.x - playerIso.x + this.canvas.width / 2) + 'px';
                v.el.style.top = (iso.y - playerIso.y + this.canvas.height / 2) + 'px';
                v.el.style.opacity = v.life;
            } 
            // Các hạt bụi ma pháp nhỏ li ti (Particles)
            else if (v.type === 'particle') {
                ctx.save(); ctx.translate(iso.x, iso.y); ctx.fillStyle = v.color; ctx.globalAlpha = Math.max(0, Math.min(1, v.life * 2));
                ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
                ctx.globalAlpha = 1.0;
            } 
            // Tia cung tên rơi tự do từ kỹ năng Mưa Tên phím 1 cung thủ
            else if (v.type === 'fallingArrow') {
                ctx.save(); ctx.translate(iso.x, iso.y); ctx.fillStyle = '#33ff55'; ctx.globalAlpha = Math.max(0, Math.min(1, v.life * 3));
                ctx.fillRect(-1, -25, 2, 20); ctx.restore();
                ctx.globalAlpha = 1.0;
            }
        });
    }
}