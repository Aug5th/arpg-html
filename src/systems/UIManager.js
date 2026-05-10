export class UIManager {
    constructor() {
        this.elCd = {
            rmb: { over: document.getElementById('cd-over-rmb'), txt: document.getElementById('cd-text-rmb') },
            s1: { over: document.getElementById('cd-over-1'), txt: document.getElementById('cd-text-1') },
            s2: { over: document.getElementById('cd-over-2'), txt: document.getElementById('cd-text-2') },
            s3: { over: document.getElementById('cd-over-3'), txt: document.getElementById('cd-text-3') },
            dash: { over: document.getElementById('cd-over-space'), txt: document.getElementById('cd-text-space') }
        };
    }

    updateHp(hp, maxHp) {
        document.getElementById('player-hp-fill').style.width = (hp / maxHp * 100) + '%';
        document.getElementById('player-hp-text').innerText = Math.ceil(hp) + ' / ' + maxHp;
    }

    updateStats(atk, spd) {
        document.getElementById('stat-atk').innerText = atk;
        document.getElementById('stat-spd').innerText = spd;
    }

    updateCd(key, current, max) {
        // Tạo một từ điển map từ tên biến trong state sang ID trên HTML
        const keyMap = {
            'dash': 'space',
            's1': '1',
            's2': '2',
            's3': '3'
        };
        
        // Nếu có trong từ điển thì lấy tên mới, không có thì giữ nguyên (lmb, rmb)
        let uiKey = keyMap[key] || key;
        
        const over = document.getElementById('cd-over-' + uiKey);
        const text = document.getElementById('cd-text-' + uiKey);
        
        if (!over || !text) return; 

        if (current > 0) {
            over.style.display = 'block';
            text.style.display = 'block';
            
            const pct = (current / max) * 100;
            over.style.setProperty('--cd', pct + '%');
            text.innerText = current.toFixed(1);
        } else {
            over.style.display = 'none';
            text.style.display = 'none';
        }
    }

    createDmgText(dmg, color, container) {
        const el = document.createElement('div');
        el.className = 'floating-damage';
        if (color === '#ff0000') el.classList.add('player-dmg');
        el.innerText = '-' + Math.ceil(dmg);
        el.style.color = color;
        container.appendChild(el);
        return el;
    }

    toggleScreen(id, isShow) {
        document.getElementById(id).style.display = isShow ? 'flex' : 'none';
    }

    setElementDisplay(id, display) {
        document.getElementById(id).style.display = display;
    }

    updateLevel(level) {
        document.getElementById('player-level').innerText = level;
    }

    updateXp(currentXp, nextLevelXp) {
        const pct = (currentXp / nextLevelXp) * 100;
        document.getElementById('player-xp-fill').style.width = pct + '%';
    }

    updateEquipment(equipment) {
        // Cập nhật Vũ khí bản mệnh
        document.getElementById('eq-weapon').innerText = equipment.weapon || '';

        // Cập nhật các ô khác (hiện tại có thể đang null)
        document.getElementById('eq-helmet').innerText = equipment.helmet || '';
        document.getElementById('eq-armor').innerText = equipment.armor || '';
        document.getElementById('eq-gloves').innerText = equipment.gloves || '';
        document.getElementById('eq-boots').innerText = equipment.boots || '';
        document.getElementById('eq-ring1').innerText = equipment.ring1 || '';
        document.getElementById('eq-ring2').innerText = equipment.ring2 || '';
        document.getElementById('eq-necklace').innerText = equipment.necklace || '';
        document.getElementById('eq-mount').innerText = equipment.mount || '';
    }
}