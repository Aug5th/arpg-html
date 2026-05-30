import { VISUAL_CONFIG, XP_ORB_CONFIG, MAP_CONFIG } from '../data/GameData.js';
import { worldToIso, isoToWorld } from './MathHelper.js'; // Giả định bạn lưu toán hệ ở bước 1 vào đây

// Hàm Helper sinh màu tối hơn tự động để đổ bóng vách đá 3D
const shadeColor = (hex, percent) => {
    let R = parseInt(hex.substring(1,3),16);
    let G = parseInt(hex.substring(3,5),16);
    let B = parseInt(hex.substring(5,7),16);
    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);
    R = (R<255)?R:255; G = (G<255)?G:255; B = (B<255)?B:255;
    const rHex = (R.toString(16).length==1)?"0"+R.toString(16):R.toString(16);
    const gHex = (G.toString(16).length==1)?"0"+G.toString(16):G.toString(16);
    const bHex = (B.toString(16).length==1)?"0"+B.toString(16):B.toString(16);
    return "#"+rHex+gHex+bHex;
};

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Khởi tạo mảng tinh vân tĩnh cho lớp Parallax Thiên Không (Tối ưu performance)
        this.parallaxStars = [];
        for(let i=0; i<60; i++) {
            this.parallaxStars.push({
                x: Math.random() * 3000 - 1500,
                y: Math.random() * 2000 - 1000,
                size: Math.random() * 2.5 + 1,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
    }

    draw(state, input) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Màu hư không nền sâu thẳm bên ngoài hòn đảo lơ lửng
        ctx.fillStyle = '#03050c'; 
        ctx.fillRect(0, 0, width, height);

        // Tính toán tọa độ Isometric gốc của Player để đồng bộ hóa camera
        const playerIso = worldToIso(state.player.x, state.player.y);

        // =========================================================
        // KIẾN TRÚC 1: HIỆU ỨNG PARALLAX THIÊN KHÔNG (BACKGROUND DEPTH)
        // =========================================================
        ctx.save();
        ctx.translate(width / 2, height / 2);
        // Di chuyển chậm hơn camera 6 lần để tạo cảm giác khoảng cách xa xăm vô tận
        ctx.translate(-playerIso.x * 0.15, -playerIso.y * 0.15);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
        this.parallaxStars.forEach(star => {
            ctx.globalAlpha = star.alpha + Math.sin(performance.now() * 0.002 + star.x) * 0.1; // Nhấp nháy nhẹ
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        ctx.globalAlpha = 1.0; // Reset alpha

        // Khởi tạo ma trận Camera chính cho thế giới game
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.translate(-playerIso.x, -playerIso.y);

        // Xác định cấu hình map hiện tại
        let mapBaseColor = '#0b1126';
        if (['forest', 'desert', 'ice', 'ocean', 'volcano'].includes(state.currentMap)) {
            mapBaseColor = MAP_CONFIG[state.currentMap].bgColor;
        }

        // =========================================================
        // KIẾN TRÚC 2: DỰNG KHỐI VÁCH ĐÁ NÚI 3D CHO ĐẠI LỤC (EXTRUSION)
        // =========================================================
        if (['forest', 'desert', 'ice', 'ocean', 'volcano'].includes(state.currentMap)) {
            const LIMIT = 1600; // Biên giới thực của map logic phẳng
            const cliffThickness = 180; // Độ dày vách núi 3D đổ xuống trục đứng

            const lt = worldToIso(-LIMIT, -LIMIT);
            const rt = worldToIso(LIMIT, -LIMIT);
            const rb = worldToIso(LIMIT, LIMIT);
            const lb = worldToIso(-LIMIT, LIMIT);

            // Màu của vách đá khuất ánh sáng (Tự động tính theo theme màu của Map)
            const wallColor = shadeColor(mapBaseColor, -50);
            const wallShadowColor = shadeColor(mapBaseColor, -70);

            // 1. Vẽ vách núi sườn Tây-Nam (Từ góc Trái sang góc Dưới)
            ctx.fillStyle = wallColor;
            ctx.beginPath();
            ctx.moveTo(lb.x, lb.y); ctx.lineTo(rb.x, rb.y);
            ctx.lineTo(rb.x, rb.y + cliffThickness); ctx.lineTo(lb.x, lb.y + cliffThickness);
            ctx.closePath(); ctx.fill();
            // Đan các thớ vân vách đá dọc để tạo nét gồ ghề 3D
            ctx.strokeStyle = shadeColor(wallColor, -20); ctx.lineWidth = 2;
            for(let step = lb.x; step <= rb.x; step += 120) {
                const ratio = (step - lb.x) / (rb.x - lb.x);
                const startY = lb.y + (rb.y - lb.y) * ratio;
                ctx.beginPath(); ctx.moveTo(step, startY); ctx.lineTo(step, startY + cliffThickness); ctx.stroke();
            }

            // 2. Vẽ vách núi sườn Đông-Nam (Từ góc Dưới sang góc Phải)
            ctx.fillStyle = wallShadowColor;
            ctx.beginPath();
            ctx.moveTo(rb.x, rb.y); ctx.lineTo(rt.x, rt.y);
            ctx.lineTo(rt.x, rt.y + cliffThickness); ctx.lineTo(rb.x, rb.y + cliffThickness);
            ctx.closePath(); ctx.fill();
            // Vân đá dọc cho mặt bóng râm
            ctx.strokeStyle = shadeColor(wallShadowColor, -20);
            for(let step = rb.x; step <= rt.x; step += 120) {
                const ratio = (step - rb.x) / (rt.x - rb.x);
                const startY = rb.y + (rt.y - rb.y) * ratio;
                ctx.beginPath(); ctx.moveTo(step, startY); ctx.lineTo(step, startY + cliffThickness); ctx.stroke();
            }

            // 3. Phủ bề mặt phẳng trên cùng của hòn đảo để làm thảm địa hình
            ctx.fillStyle = mapBaseColor;
            ctx.beginPath();
            ctx.moveTo(lt.x, lt.y); ctx.lineTo(rt.x, rt.y); ctx.lineTo(rb.x, rb.y); ctx.lineTo(lb.x, lb.y);
            ctx.closePath(); ctx.fill();
        }

        // =========================================================
        // KIẾN TRÚC 3: KẾT CẤU SÀN CARO ĐA SẮC ĐỔ KHỐI ĐỊA HÌNH
        // =========================================================
        const grid = VISUAL_CONFIG.gridSize;
        
        // Tính toán phạm vi Culling (chỉ render vùng trong tầm mắt người chơi + 1 khoảng đệm rộng)
        const rangeX = Math.min(1600, Math.max(1000, width * 0.8));
        const rangeY = Math.min(1600, Math.max(1000, height * 1.2));
        const startX = Math.floor((state.player.x - rangeX) / grid) * grid;
        const endX = Math.ceil((state.player.x + rangeX) / grid) * grid;
        const startY = Math.floor((state.player.y - rangeY) / grid) * grid;
        const endY = Math.ceil((state.player.y + rangeY) / grid) * grid;

        // Quét ma trận hai vòng lặp vẽ các phiến đá kim cương
        for (let x = startX; x <= endX; x += grid) {
            for (let y = startY; y <= endY; y += grid) {
                // Giới hạn trong khuôn khổ map thực thể 1600 để tránh vẽ tràn ra không trung
                if (Math.abs(x) <= 1600 && Math.abs(y) <= 1600) {
                    const tileTop = worldToIso(x, y);
                    const tileRight = worldToIso(x + grid, y);
                    const tileBottom = worldToIso(x + grid, y + grid);
                    const tileLeft = worldToIso(x, y + grid);

                    ctx.beginPath();
                    ctx.moveTo(tileTop.x, tileTop.y);
                    ctx.lineTo(tileRight.x, tileRight.y);
                    ctx.lineTo(tileBottom.x, tileBottom.y);
                    ctx.lineTo(tileLeft.x, tileLeft.y);
                    ctx.closePath();

                    // Kỹ thuật gạch bàn cờ (Checkerboard Shading) tạo khối tương phản chuyển động 3D
                    const isEven = (Math.floor(x / grid) + Math.floor(y / grid)) % 2 === 0;
                    if (isEven) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.025)'; // Ô sáng mờ nhẹ
                    } else {
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';       // Ô tối mờ nhẹ
                    }
                    ctx.fill();

                    // Vẽ đường chỉ khâu nối mạch gạch kim cương
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.015)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // ==========================================
        // LAYER 2: CHUẨN BỊ RENDER QUEUE SẮP XẾP ĐỘ SÂU Y-SORT (PAINTER'S ALGORITHM)
        // ==========================================
        const renderQueue = [];

        // Thảm cỏ mọc trang trí nền làng Tân Thủ thôn
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

        // Nạp Player vào hàng đợi vẽ chiều sâu đứng
        renderQueue.push({
            zOrder: state.player.x + state.player.y,
            draw: () => this.drawPlayer(ctx, state)
        });

        // Nạp kiến trúc cấu trúc map Làng Tân Thủ
        if (state.currentMap === 'village') {
            renderQueue.push({ zOrder: state.npc.x + state.npc.y, draw: () => this.drawBillboardNPC(ctx, state.npc, '#cccccc', !state.selectedClass ? '❓' : '💬') });
            renderQueue.push({ zOrder: state.blacksmith.x + state.blacksmith.y, draw: () => this.drawBlacksmithNPC(ctx, state.blacksmith) });
            renderQueue.push({ zOrder: state.portal.x + state.portal.y - 60, draw: () => this.drawVillagePortal(ctx, state.portal) });
            state.villageEnv.trees.forEach(t => renderQueue.push({ zOrder: t.x + t.y, draw: () => this.drawVillageTree(ctx, t) }));
            state.villageEnv.houses.forEach(h => renderQueue.push({ zOrder: h.x + h.y + 40, draw: () => this.drawVillageHouse(ctx, h) }));
        }

        // Nạp tài nguyên phân rã map Dã Ngoại cày cuốc
        if (['forest', 'desert', 'ice', 'ocean', 'volcano'].includes(state.currentMap)) {
            const mapConfig = MAP_CONFIG[state.currentMap];

            // Cây cối vật cản bản đồ dựng đứng
            state.mapEnv.trees.forEach(t => renderQueue.push({
                zOrder: t.x + t.y,
                draw: () => this.drawStaticBillboard(ctx, t.x, t.y, mapConfig.obstacle, 40)
            }));

            // Thảo dược linh sơn hái lượm
            state.mapEnv.herbs.forEach(h => renderQueue.push({
                zOrder: h.x + h.y,
                draw: () => this.drawResourceNode(ctx, h.x, h.y, mapConfig.herb.item.icon, mapConfig.herb.item.name, '#55ff55', 20)
            }));

            // Khoáng thạch tinh anh
            state.mapEnv.ores.forEach(o => renderQueue.push({
                zOrder: o.x + o.y,
                draw: () => this.drawResourceNode(ctx, o.x, o.y, mapConfig.ore.item.icon, mapConfig.ore.item.name, '#ffaa00', 25)
            }));

            // Cổng vào Yêu Vương
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

        // Quái thú thường và Thượng cổ Boss Ma tộc
        state.enemies.forEach(e => renderQueue.push({ zOrder: e.x + e.y, draw: () => this.drawEnemy(ctx, e) }));
        if (state.boss) renderQueue.push({ zOrder: state.boss.x + state.boss.y, draw: () => this.drawBoss(ctx, state.boss) });

        // Thực thi giải thuật Painter's sắp xếp chiều sâu
        renderQueue.sort((a, b) => a.zOrder - b.zOrder);
        renderQueue.forEach(element => element.draw());

        // ==========================================
        // LAYER 3: KÝ NĂNG CHIẾU ĐỨNG, KIẾM KHÍ CHÉM XOAY VÀ LỐC XOÁY
        // ==========================================
        this.drawProjectilesAndVFX(ctx, state);

        ctx.restore(); // Khôi phục ma trận camera phẳng gốc của Canvas

        // =========================================================
        // KIẾN TRÚC 4: VÒNG SÁT THƯƠNG VIGNETTE LIGHTING (MÔI TRƯỜNG 3D)
        // =========================================================
        // Tạo luồng hào quang tỏa sáng bao bọc người chơi, làm tối mờ mịt các góc khuất màn hình
        const screenCenterX = width / 2;
        const screenCenterY = height / 2;
        const vignetteGrad = ctx.createRadialGradient(screenCenterX, screenCenterY, 180, screenCenterX, screenCenterY, Math.max(width, height) * 0.75);
        vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignetteGrad.addColorStop(1, 'rgba(4, 6, 15, 0.65)'); // Đổ bóng mờ tối mịt về rìa màn hình nhằm tăng tính huyền ảo tâm linh
        ctx.fillStyle = vignetteGrad;
        ctx.fillRect(0, 0, width, height);

        // UI phẳng hồng tâm ngắm định hướng chuột ngoài màn hình UI phẳng
        if (state.gameRunning && !state.isDead && !state.isVictory) {
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(input.mouseX - 10, input.mouseY); ctx.lineTo(input.mouseX + 10, input.mouseY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(input.mouseX, input.mouseY - 10); ctx.lineTo(input.mouseX, input.mouseY + 10); ctx.stroke();
        }
    }

    // =========================================================
    // CÁC KHỐI PHƯƠNG THỨC MODULE DỰNG HÌNH THÀNH PHẦN CHI TIẾT
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

    drawProjectilesAndVFX(ctx, state) {
        const playerIso = worldToIso(state.player.x, state.player.y);

        state.tornados.forEach(t => {
            const iso = worldToIso(t.x, t.y);
            ctx.save(); ctx.translate(iso.x, iso.y);
            ctx.save(); ctx.scale(1, 0.5);
            ctx.beginPath(); ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(50, 255, 170, 0.18)'; ctx.fill();
            ctx.strokeStyle = '#33ffaa'; ctx.lineWidth = 2; ctx.stroke();
            ctx.restore();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '40px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const rumbleY = Math.sin(performance.now() * 0.01) * 5;
            ctx.fillText('🌪️', 0, -25 + rumbleY);
            ctx.restore();
        });

        state.arrowRains.forEach(r => {
            const iso = worldToIso(r.x, r.y);
            ctx.save(); ctx.translate(iso.x, iso.y);
            ctx.scale(1, 0.5);
            ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(50, 255, 80, 0.4)'; ctx.lineWidth = 2; ctx.stroke();
            ctx.restore();
        });

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

        state.xpOrbs.forEach(orb => {
            const iso = worldToIso(orb.x, orb.y);
            ctx.save(); ctx.beginPath(); ctx.arc(iso.x, iso.y, XP_ORB_CONFIG.size, 0, Math.PI * 2);
            ctx.fillStyle = XP_ORB_CONFIG.color; ctx.shadowBlur = 10; ctx.shadowColor = XP_ORB_CONFIG.color; ctx.fill(); ctx.restore();
            ctx.shadowBlur = 0;
        });

        state.flyingSwords.forEach(s => {
            const iso = worldToIso(s.x, s.y);
            ctx.save(); ctx.translate(iso.x, iso.y); ctx.rotate(s.angle); ctx.fillStyle = '#ccffff'; ctx.shadowBlur = 15; ctx.shadowColor = '#00aaff'; ctx.fillRect(-15, -4, 30, 8); ctx.restore();
            ctx.shadowBlur = 0;
        });

        state.mountains.forEach(m => {
            const iso = worldToIso(m.x, m.y);
            ctx.save(); ctx.translate(iso.x, iso.y); ctx.beginPath(); ctx.moveTo(0, -m.radius); ctx.lineTo(m.radius * 0.8, -m.radius * 0.4); ctx.lineTo(m.radius, m.radius * 0.6); ctx.lineTo(0, m.radius); ctx.lineTo(-m.radius * 0.7, m.radius * 0.5); ctx.lineTo(-m.radius, -m.radius * 0.3); ctx.closePath();
            ctx.fillStyle = '#2b2b2b'; ctx.fill(); ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
        });

        state.vfxs.forEach(v => {
            const iso = worldToIso(v.x, v.y);
            
            if (v.type === 'slash') {
                ctx.save(); ctx.translate(iso.x, iso.y);
                ctx.transform(1, 0.5, -1, 0.5, 0, 0);
                ctx.rotate(v.angle);
                ctx.beginPath(); ctx.arc(0, 0, v.radius, -v.arc / 2, v.arc / 2);
                ctx.strokeStyle = v.color; ctx.lineWidth = 20 * (v.life / v.maxLife); ctx.shadowBlur = 15; ctx.shadowColor = v.color; ctx.stroke();
                ctx.restore(); ctx.shadowBlur = 0;
            } else if (v.type === 'rect') {
                ctx.save(); ctx.translate(iso.x, iso.y);
                ctx.transform(1, 0.5, -1, 0.5, 0, 0);
                ctx.rotate(v.angle);
                ctx.fillStyle = `rgba(255, 170, 0, ${v.life / v.maxLife})`;
                ctx.fillRect(-v.w / 2, -v.h / 2, v.w, v.h);
                ctx.restore();
            } else if (v.type === 'circle' || v.type === 'bossAOE') {
                ctx.save(); ctx.translate(iso.x, iso.y); ctx.scale(1, 0.5); ctx.beginPath(); ctx.arc(0, 0, v.radius, 0, Math.PI * 2);
                ctx.fillStyle = v.type === 'bossAOE' ? 'rgba(255,0,0,0.2)' : v.color; ctx.fill();
                if (v.type === 'bossAOE') { ctx.strokeStyle = 'red'; ctx.lineWidth = 2; ctx.stroke(); }
                ctx.restore();
            } else if (v.type === 'mountainWarning') {
                ctx.save(); ctx.translate(iso.x, iso.y); ctx.scale(1, 0.5); ctx.beginPath(); ctx.arc(0, 0, v.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 0, 0, 0.15)`; ctx.fill(); ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 3; ctx.stroke();
                ctx.restore();
            } else if (v.type === 'text') {
                v.el.style.left = (iso.x - playerIso.x + this.canvas.width / 2) + 'px';
                v.el.style.top = (iso.y - playerIso.y + this.canvas.height / 2) + 'px';
                v.el.style.opacity = v.life;
            } else if (v.type === 'particle') {
                ctx.save(); ctx.translate(iso.x, iso.y); ctx.fillStyle = v.color; ctx.globalAlpha = Math.max(0, Math.min(1, v.life * 2));
                ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1.0;
            } else if (v.type === 'fallingArrow') {
                ctx.save(); ctx.translate(iso.x, iso.y); ctx.fillStyle = '#33ff55'; ctx.globalAlpha = Math.max(0, Math.min(1, v.life * 3));
                ctx.fillRect(-1, -25, 2, 20); ctx.restore(); ctx.globalAlpha = 1.0;
            }
        });
    }
}