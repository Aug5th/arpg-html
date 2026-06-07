// systems/AlchemyManager.js
import { ALCHEMY_RECIPES, ITEMS } from '../data/GameData.js';

export class AlchemyManager {
    constructor(state, ui) {
        this.state = state;
        this.ui = ui;
        this.alchemyInterval = null;
    }

    /**
     * Mở giao diện luyện đan và kích hoạt bộ đếm thời gian thực cho lò luyện
     */
    openAlchemyPanel() {
        document.getElementById('alchemy-overlay').style.display = 'flex';

        const listEl = document.getElementById('alchemy-list');
        if (!listEl) return;
        listEl.innerHTML = '';

        for (let key in ALCHEMY_RECIPES) {
            const item = ALCHEMY_RECIPES[key];

            let reqStr = '';
            let canCraft = true;
            item.req.forEach(r => {
                const invItem = this.state.inventory.find(i => i.id === r.id);
                const count = invItem ? invItem.count : 0;
                if (count < r.count) canCraft = false;

                const baseItem = Object.values(ITEMS).find(i => i.id === r.id) || { name: r.id, icon: '❓' };
                reqStr += `<div style="font-size: 12px;">${baseItem.icon} ${baseItem.name}: <span style="color: ${count >= r.count ? '#55ff55' : '#ff5555'}">${count}/${r.count}</span></div>`;
            });

            const isFurnaceBusy = this.state.alchemy && this.state.alchemy.activeId !== null;
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

        this.updateFurnaceUI();
        
        // KIẾN TRÚC AN TOÀN: Xóa bỏ interval cũ trước khi tạo mới để tránh Memory Leaks
        if (this.alchemyInterval) clearInterval(this.alchemyInterval);
        this.alchemyInterval = setInterval(() => this.updateFurnaceUI(), 1000);
    }

    /**
     * Đóng giao diện, xóa dọn dẹp interval để giải phóng RAM của trình duyệt
     */
    closeAlchemyPanel() {
        document.getElementById('alchemy-overlay').style.display = 'none';
        
        if (this.alchemyInterval) {
            clearInterval(this.alchemyInterval);
            this.alchemyInterval = null;
        }
        
        this.state.isPaused = false;
        this.state.lastTime = performance.now();
        // Không gọi trực tiếp requestAnimationFrame ở đây, để main loop tự quản lý điều phối
    }

    /**
     * Khởi động quá trình vận hỏa luyện đan
     */
    startAlchemy(key) {
        const item = ALCHEMY_RECIPES[key];
        if (!item) return;

        // Trừ nguyên liệu tiêu tốn trong túi đồ
        item.req.forEach(r => {
            const invItem = this.state.inventory.find(i => i.id === r.id);
            if (invItem) invItem.count -= r.count;
        });

        // Dọn dẹp sạch sẽ các ô nguyên liệu đã cạn số lượng về 0
        this.state.inventory = this.state.inventory.filter(i => i.count > 0);

        // Kích hoạt dữ liệu Lò Luyện trong bang state toàn cục
        const now = Date.now();
        this.state.alchemy = {
            activeId: key,
            startTime: now,
            endTime: now + (item.time * 1000),
            isFinished: false
        };

        if (window.updateInventoryUI) window.updateInventoryUI();
        this.openAlchemyPanel(); // Làm mới lại trạng thái hiển thị các nút
    }

    /**
     * Cập nhật Renderer đồ họa và trạng thái CSS của Lò luyện chân hỏa theo thời gian thực
     */
    updateFurnaceUI() {
        const visual = document.getElementById('furnace-visual');
        const status = document.getElementById('furnace-status');
        const nameEl = document.getElementById('furnace-item-name');
        const progBg = document.getElementById('furnace-progress-bg');
        const progBar = document.getElementById('furnace-progress-bar');
        const timeLeft = document.getElementById('furnace-time-left');
        const btnCollect = document.getElementById('furnace-collect-btn');
        const fireBg = document.getElementById('furnace-fire-bg');
        const container = document.getElementById('furnace-container');

        if (!visual || !status || !nameEl) return;

        // Bơm các hiệu ứng hoạt họa Aura lấp lánh vào CSS của DOM một lần duy nhất
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

        // Trường hợp Lò Trống
        if (!this.state.alchemy || !this.state.alchemy.activeId) {
            visual.innerText = '🏺';
            visual.style.animation = 'none';
            visual.style.transform = 'scale(1)';
            visual.style.filter = 'drop-shadow(0 0 10px #ffaa00)';
            status.innerText = 'LÒ ĐANG TRỐNG'; status.style.color = '#777';
            nameEl.innerText = ''; 
            if (progBg) progBg.style.display = 'none'; 
            if (btnCollect) btnCollect.style.display = 'none';

            if (fireBg) {
                fireBg.style.height = '0%';
                fireBg.style.background = 'linear-gradient(0deg, rgba(255,60,0,0.6) 0%, rgba(255,170,0,0) 100%)';
            }
            if (container) {
                container.style.borderColor = '#335533';
                container.style.boxShadow = 'none';
            }
            return;
        }

        const item = ALCHEMY_RECIPES[this.state.alchemy.activeId];
        nameEl.innerText = `${item.icon} ${item.name}`;

        if (this.state.alchemy.isFinished || Date.now() >= this.state.alchemy.endTime) {
            // ----- TRẠNG THÁI: THÀNH ĐAN LUYỆN XONG -----
            this.state.alchemy.isFinished = true;

            visual.innerText = item.icon; 
            visual.style.animation = 'auraBlink 1.5s infinite ease-in-out'; 

            status.innerText = 'ĐAN DƯỢC ĐÃ THÀNH!'; status.style.color = '#55ff55';
            if (progBg) progBg.style.display = 'none'; 
            if (btnCollect) btnCollect.style.display = 'block';

            if (fireBg) {
                fireBg.style.height = '100%';
                fireBg.style.background = 'radial-gradient(circle, rgba(85,255,85,0.4) 0%, rgba(0,0,0,0) 70%)';
            }
            if (container) {
                container.style.borderColor = '#55ff55';
                container.style.boxShadow = 'inset 0 0 40px rgba(85,255,85,0.3)';
            }
        } else {
            // ----- TRẠNG THÁI: ĐANG VẬN CHÂN HỎA THIÊU ĐỐT -----
            visual.innerText = '🏺';
            visual.style.animation = 'furnaceRumble 0.3s infinite'; 
            visual.style.filter = 'drop-shadow(0 0 15px #ffaa00)';

            status.innerText = 'ĐANG VẬN CHÂN HỎA...'; status.style.color = '#ffaa00';
            if (progBg) progBg.style.display = 'block'; 
            if (btnCollect) btnCollect.style.display = 'none';

            if (fireBg) {
                fireBg.style.height = '60%';
                fireBg.style.background = 'linear-gradient(0deg, rgba(255,60,0,0.6) 0%, rgba(255,170,0,0) 100%)';
            }
            if (container) {
                container.style.borderColor = '#ff5500';
                container.style.boxShadow = 'inset 0 0 30px rgba(255,85,0,0.2)';
            }

            const totalTime = this.state.alchemy.endTime - this.state.alchemy.startTime;
            const passedTime = Date.now() - this.state.alchemy.startTime;
            const percent = Math.min(100, (passedTime / totalTime) * 100);
            const secLeft = Math.ceil((this.state.alchemy.endTime - Date.now()) / 1000);

            if (progBar) progBar.style.width = `${percent}%`;
            if (timeLeft) timeLeft.innerText = `${secLeft}s`;
        }
    }

    /**
     * Nhận thuốc từ lò luyện cất vào túi đồ cá nhân
     */
    collectAlchemy() {
        const maxSlots = 40; // Đồng bộ tối đa 40 ô chứa theo cấu hình nâng cấp của bạn
        if (this.state.inventory.length >= maxSlots) {
            alert("❌ Túi đồ đã đầy! Vui lòng dọn dẹp trước khi lấy thuốc.");
            return;
        }

        const item = ALCHEMY_RECIPES[this.state.alchemy.activeId];
        if (!item) return;

        // Kiểm tra xem trong túi đã có sẵn loại thuốc này chưa để cộng dồn
        const existing = this.state.inventory.find(i => i.id === item.id);
        if (existing) {
            existing.count++;
        } else {
            this.state.inventory.push({ ...item, count: 1 });
        }

        // Reset trạng thái Lò luyện về trống rỗng hoàn toàn
        this.state.alchemy = { activeId: null, startTime: 0, endTime: 0, isFinished: false };

        if (window.updateInventoryUI) window.updateInventoryUI();
        this.openAlchemyPanel(); // Refresh lại panel giao diện
    }
}