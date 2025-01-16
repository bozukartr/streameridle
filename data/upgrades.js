class UpgradeSystem {
    constructor(game) {
        this.game = game;
        this.upgrades = {
            // Yayın Kalitesi Yükseltmeleri
            resolution1080p: {
                id: 'resolution1080p',
                name: '1080p Çözünürlük',
                description: 'Daha net bir yayın deneyimi',
                cost: 1000,
                requirement: 100,
                purchased: false,
                category: 'quality',
                icon: 'hd'
            },
            resolution1440p: {
                id: 'resolution1440p',
                name: '1440p Çözünürlük',
                description: 'Kristal netliğinde yayın kalitesi',
                cost: 5000,
                requirement: 500,
                purchased: false,
                category: 'quality',
                icon: 'high_quality'
            },
            resolution4k: {
                id: 'resolution4k',
                name: '4K Çözünürlük',
                description: 'Ultra HD yayın deneyimi',
                cost: 15000,
                requirement: 1000,
                purchased: false,
                category: 'quality',
                icon: '4k'
            },

            // FPS Yükseltmeleri
            fps60: {
                id: 'fps60',
                name: '60 FPS',
                description: 'Daha akıcı yayın',
                cost: 2000,
                requirement: 200,
                purchased: false,
                category: 'performance',
                icon: 'speed'
            },
            fps120: {
                id: 'fps120',
                name: '120 FPS',
                description: 'Ultra akıcı yayın deneyimi',
                cost: 8000,
                requirement: 800,
                purchased: false,
                category: 'performance',
                icon: 'running_with_errors'
            },

            // Bitrate Yükseltmeleri
            bitrate4000: {
                id: 'bitrate4000',
                name: '4000 Kbps',
                description: 'Daha yüksek kaliteli yayın',
                cost: 3000,
                requirement: 300,
                purchased: false,
                category: 'quality',
                icon: 'network_check'
            },
            bitrate8000: {
                id: 'bitrate8000',
                name: '8000 Kbps',
                description: 'Maksimum yayın kalitesi',
                cost: 10000,
                requirement: 1000,
                purchased: false,
                category: 'quality',
                icon: 'network_wifi'
            },

            // Chat Yükseltmeleri
            autoMod: {
                id: 'autoMod',
                name: 'Gelişmiş AutoMod',
                description: 'Daha iyi chat moderasyonu',
                cost: 1500,
                requirement: 150,
                purchased: false,
                category: 'moderation',
                icon: 'security'
            },
            autoReply: {
                id: 'autoReply',
                name: 'Otomatik Cevaplama',
                description: 'Chat mesajlarına otomatik cevap ver',
                cost: 4000,
                requirement: 400,
                purchased: false,
                category: 'interaction',
                icon: 'quickreply'
            },
            emoteSlots: {
                id: 'emoteSlots',
                name: 'Özel Emote Slotları',
                description: 'Daha fazla özel emote ekle',
                cost: 2500,
                requirement: 250,
                purchased: false,
                category: 'interaction',
                icon: 'emoji_emotions'
            }
        };

        this.categories = {
            quality: 'Yayın Kalitesi',
            performance: 'Performans',
            moderation: 'Moderasyon',
            interaction: 'Etkileşim'
        };

        this.initializeUpgradeUI();
    }

    initializeUpgradeUI() {
        const container = document.createElement('div');
        container.id = 'upgradeModal';
        container.className = 'modal';

        container.innerHTML = `
            <div class="modal-content upgrade-modal">
                <div class="modal-header">
                    <h2>Yükseltmeler</h2>
                    <button class="close-modal"><i class="material-icons">close</i></button>
                </div>
                <div class="upgrade-categories">
                    ${Object.entries(this.categories).map(([key, name]) => `
                        <button class="category-btn" data-category="${key}">${name}</button>
                    `).join('')}
                </div>
                <div class="upgrades-grid"></div>
            </div>
        `;

        document.body.appendChild(container);
        this.bindEvents();
        this.showCategory('quality'); // Varsayılan kategoriyi göster
    }

    bindEvents() {
        const modal = document.getElementById('upgradeModal');
        const closeBtn = modal.querySelector('.close-modal');
        const categoryBtns = modal.querySelectorAll('.category-btn');

        closeBtn.addEventListener('click', () => this.closeUpgradeModal());
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showCategory(btn.dataset.category));
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeUpgradeModal();
            }
        });
    }

    showUpgradeModal() {
        document.getElementById('upgradeModal').classList.add('active');
        this.showCategory('quality'); // Varsayılan kategori
    }

    closeUpgradeModal() {
        document.getElementById('upgradeModal').classList.remove('active');
    }

    showCategory(category) {
        const upgradesGrid = document.querySelector('.upgrades-grid');
        const categoryBtns = document.querySelectorAll('.category-btn');

        // Aktif kategori butonunu güncelle
        categoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        // Yükseltmeleri filtrele ve göster
        const filteredUpgrades = Object.values(this.upgrades).filter(upgrade => 
            upgrade.category === category
        );

        upgradesGrid.innerHTML = filteredUpgrades.map(upgrade => `
            <div class="upgrade-item ${upgrade.purchased ? 'purchased' : ''} ${this.canPurchase(upgrade) ? 'available' : 'locked'}">
                <div class="upgrade-icon">
                    <i class="material-icons">${upgrade.icon}</i>
                </div>
                <div class="upgrade-info">
                    <h3>${upgrade.name}</h3>
                    <p>${upgrade.description}</p>
                    <div class="upgrade-requirements">
                        <span class="cost">💰 ${upgrade.cost}</span>
                        <span class="followers">👥 ${upgrade.requirement}</span>
                    </div>
                </div>
                <button class="upgrade-btn" data-upgrade="${upgrade.id}" 
                    ${upgrade.purchased ? 'disabled' : ''}>
                    ${upgrade.purchased ? 'Satın Alındı' : 'Satın Al'}
                </button>
            </div>
        `).join('');

        // Satın alma butonlarına event listener ekle
        upgradesGrid.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', () => this.purchaseUpgrade(btn.dataset.upgrade));
        });
    }

    canPurchase(upgrade) {
        return !upgrade.purchased && 
               this.game.stats.money >= upgrade.cost && 
               this.game.stats.followers >= upgrade.requirement;
    }

    purchaseUpgrade(upgradeId) {
        const upgrade = this.upgrades[upgradeId];
        
        if (!this.canPurchase(upgrade)) return;

        // Yükseltmeyi satın al
        this.game.stats.money -= upgrade.cost;
        upgrade.purchased = true;
        this.game.upgrades[upgradeId] = true;

        // UI'ı güncelle
        this.game.updateDisplay();
        this.game.checkProFeatures();
        this.showCategory(upgrade.category);

        // Satın alma mesajı göster
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = `✨ Yeni yükseltme: ${upgrade.name}`;
        this.game.elements.chatMessages.appendChild(messageElement);
        this.game.elements.chatMessages.scrollTop = this.game.elements.chatMessages.scrollHeight;
    }
} 