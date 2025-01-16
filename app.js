class IdleStreamer {
    constructor() {
        this.stats = {
            followers: 0,
            money: 0,
            streamQuality: 100,
            viewers: 0,
            hypeLevel: 0,
            moderatorCount: 0,
            vipCount: 0,
            totalStreamTime: 0,
            totalMessages: 0,
            networkingPoints: 0,
            lastNetworkingTime: 0
        };
        
        // Yayıncı adını localStorage'dan al
        this.streamerName = localStorage.getItem('streamerName') || 'Yayıncı';
        
        this.upgrades = {
            resolution1080p: false,
            resolution1440p: false,
            resolution4k: false,
            fps60: false,
            fps120: false,
            bitrate4000: false,
            bitrate8000: false,
            autoReply: false,
            emoteSlots: false,
            autoMod: false
        };

        this.streamActive = false;
        this.streamTimer = null;
        this.streamStartTime = null;
        this.currentStreamTopic = 'gaming';
        this.lastMessageTime = {};
        this.hypeDecayTimer = null;
        
        this.streamSettings = {
            title: "",
            topic: "gaming",
            language: "tr",
            resolution: "720p",
            fps: "30",
            bitrate: "2000",
            chatMode: "everyone",
            autoMod: "0",
            slowMode: false
        };
        
        this.networkingActivities = {
            discordServer: false,
            socialMedia: false,
            communityEvents: false,
            collaboration: false
        };
        
        this.streamEvents = {
            giveaway: {
                active: false,
                cost: 50,
                duration: 300, // 5 dakika
                participants: 0,
                minFollowers: 100
            },
            challenge: {
                active: false,
                cost: 30,
                duration: 600, // 10 dakika
                participants: 0,
                minFollowers: 50
            },
            poll: {
                active: false,
                cost: 20,
                duration: 180, // 3 dakika
                participants: 0,
                minFollowers: 20
            },
            raid: {
                active: false,
                cost: 100,
                duration: 60, // 1 dakika
                participants: 0,
                minFollowers: 200
            }
        };

        this.activeEventTimer = null;
        this.lastEventTime = 0;
        
        this.chatControls = {
            shoutout: {
                cost: 10,
                cooldown: 300000, // 5 dakika
                lastUsed: 0,
                viewerBonus: 5,
                followerChance: 0.3
            },
            hashtag: {
                cost: 25,
                cooldown: 600000, // 10 dakika
                lastUsed: 0,
                viewerBonus: 15,
                followerChance: 0.5
            },
            hype: {
                cost: 0,
                cooldown: 900000, // 15 dakika
                lastUsed: 0,
                viewerBonus: 3,
                hypeBonus: 20
            },
            raid: {
                cost: 0,
                cooldown: 1200000, // 20 dakika
                lastUsed: 0,
                viewerBonus: 8,
                raidChance: 0.4
            }
        };

        this.streamVideos = [
            'videos/stream1.mp4',
            'videos/stream2.mp4',
            'videos/stream3.mp4'
        ];
        
        this.currentVideo = null;

        this.initializeElements();
        this.initializeEventListeners();
        this.updateDisplay();
        this.checkProFeatures();

        // Yayıncı adını başlığa ekle
        if (this.elements.currentTitle) {
            this.elements.currentTitle.textContent = this.streamerName + ' - Yayın başlamadı';
        }

        // Başlangıçta STOP butonunu gizle
        if (this.elements.endStreamBtn) {
            this.elements.endStreamBtn.style.display = 'none';
        }

        // Yükseltme sistemini başlat
        this.upgradeSystem = new UpgradeSystem(this);
    }

    initializeElements() {
        this.elements = {
            followers: document.getElementById('followers'),
            money: document.getElementById('money'),
            streamQuality: document.getElementById('streamQuality'),
            viewers: document.getElementById('viewers'),
            streamTime: document.getElementById('streamTime'),
            hypeLevel: document.getElementById('hypeLevel'),
            chatMessages: document.getElementById('chatMessages'),
            streamArea: document.getElementById('streamArea'),
            currentTitle: document.getElementById('currentTitle'),
            qualityBadge: document.getElementById('qualityBadge'),
            fpsBadge: document.getElementById('fpsBadge'),
            
            // Modal elementleri
            settingsModal: document.getElementById('settingsModal'),
            streamTitle: document.getElementById('streamTitle'),
            streamTopic: document.getElementById('streamTopic'),
            streamLanguage: document.getElementById('streamLanguage'),
            streamResolution: document.getElementById('streamResolution'),
            streamFPS: document.getElementById('streamFPS'),
            bitrate: document.getElementById('bitrate'),
            chatMode: document.getElementById('chatMode'),
            autoMod: document.getElementById('autoMod'),
            slowMode: document.getElementById('slowMode'),
            
            // Chat kontrol butonları
            shoutoutButton: document.querySelector('.chat-control-btn:nth-child(1)'),
            hashtagButton: document.querySelector('.chat-control-btn:nth-child(2)'),
            upgradeButton: document.querySelector('.chat-control-btn:nth-child(3)'),
            hypeButton: document.querySelector('.chat-control-btn:nth-child(4)'),
            raidButton: document.querySelector('.chat-control-btn:nth-child(5)'),
            
            // Yayın kontrol butonları
            startStreamBtn: document.getElementById('startStream'),
            saveSettingsBtn: document.getElementById('saveSettings'),
            endStreamBtn: document.getElementById('endStream'),
            streamVideo: document.getElementById('streamVideo')
        };
    }

    initializeEventListeners() {
        // Modal kontrolleri
        document.getElementById('showSettings').addEventListener('click', () => this.openSettingsModal());
        
        const closeModalBtn = document.querySelector('.close-modal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeSettingsModal());
        }

        // Yayın başlatma ve ayar kaydetme
        if (this.elements.startStreamBtn) {
            this.elements.startStreamBtn.addEventListener('click', () => {
                this.saveSettings();
                this.startStream();
                this.closeSettingsModal();
            });
        }

        if (this.elements.saveSettingsBtn) {
            this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        // Stream kontrolleri
        document.getElementById('endStream').addEventListener('click', () => this.endStream());
        document.getElementById('muteStream').addEventListener('click', () => this.toggleMute());

        // Yükseltme butonu
        if (this.elements.upgradeButton) {
            this.elements.upgradeButton.addEventListener('click', () => {
                if (this.upgradeSystem) {
                    this.upgradeSystem.showUpgradeModal();
                }
            });
        }

        // Hype butonu
        if (this.elements.hypeButton) {
            this.elements.hypeButton.addEventListener('click', () => this.useHypeBoost());
            // İkon ve tooltip ekle
            const hypeIcon = document.createElement('i');
            hypeIcon.className = 'material-icons';
            hypeIcon.textContent = 'trending_up';
            this.elements.hypeButton.innerHTML = '';
            this.elements.hypeButton.appendChild(hypeIcon);
            this.elements.hypeButton.title = 'Hype Boost (Ücretsiz, 15dk Cooldown) - Yayın hype\'ını artır!';
        }

        // Raid butonu
        if (this.elements.raidButton) {
            this.elements.raidButton.addEventListener('click', () => this.useRaidBoost());
            // İkon ve tooltip ekle
            const raidIcon = document.createElement('i');
            raidIcon.className = 'material-icons';
            raidIcon.textContent = 'groups';
            this.elements.raidButton.innerHTML = '';
            this.elements.raidButton.appendChild(raidIcon);
            this.elements.raidButton.title = 'Raid Boost (Ücretsiz, 20dk Cooldown) - Başka bir yayıncıdan raid alma şansı!';
        }

        // Ayarları değiştirme
        if (this.elements.streamTopic) {
            this.elements.streamTopic.addEventListener('change', (e) => {
                this.currentStreamTopic = e.target.value;
            });
        }

        // Modal dışına tıklama
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.settingsModal) {
                this.closeSettingsModal();
            }
        });

        // Shoutout butonu
        if (this.elements.shoutoutButton) {
            this.elements.shoutoutButton.addEventListener('click', () => this.useShoutout());
            // İkon ve tooltip ekle
            const shoutoutIcon = document.createElement('i');
            shoutoutIcon.className = 'material-icons';
            shoutoutIcon.textContent = 'campaign';
            this.elements.shoutoutButton.innerHTML = '';
            this.elements.shoutoutButton.appendChild(shoutoutIcon);
            this.elements.shoutoutButton.title = 'Shoutout ($10) - Başka bir yayıncıya shoutout vererek izleyici çek!';
        }

        // Hashtag butonu
        if (this.elements.hashtagButton) {
            this.elements.hashtagButton.addEventListener('click', () => this.useHashtag());
            // İkon ve tooltip ekle
            const hashtagIcon = document.createElement('i');
            hashtagIcon.className = 'material-icons';
            hashtagIcon.textContent = 'tag';
            this.elements.hashtagButton.innerHTML = '';
            this.elements.hashtagButton.appendChild(hashtagIcon);
            this.elements.hashtagButton.title = 'Hashtag ($25) - Trend bir hashtag başlat!';
        }
    }

    openSettingsModal() {
        this.elements.settingsModal.classList.add('active');
        // Mevcut ayarları form'a doldur
        this.elements.streamTitle.value = this.streamSettings.title;
        this.elements.streamTopic.value = this.streamSettings.topic;
        this.elements.streamLanguage.value = this.streamSettings.language;
        this.elements.streamResolution.value = this.streamSettings.resolution;
        this.elements.streamFPS.value = this.streamSettings.fps;
        this.elements.bitrate.value = this.streamSettings.bitrate;
        this.elements.chatMode.value = this.streamSettings.chatMode;
        this.elements.autoMod.value = this.streamSettings.autoMod;
        this.elements.slowMode.checked = this.streamSettings.slowMode;

        // Yayın açıksa başlat butonunu deaktive et
        if (this.elements.startStreamBtn) {
            this.elements.startStreamBtn.disabled = this.streamActive;
            this.elements.startStreamBtn.style.opacity = this.streamActive ? '0.5' : '1';
            this.elements.startStreamBtn.style.cursor = this.streamActive ? 'not-allowed' : 'pointer';
        }
    }

    closeSettingsModal() {
        this.elements.settingsModal.classList.remove('active');
    }

    saveSettings() {
        this.streamSettings = {
            title: this.elements.streamTitle.value || "Harika bir yayın!",
            topic: this.elements.streamTopic.value,
            language: this.elements.streamLanguage.value,
            resolution: this.elements.streamResolution.value,
            fps: this.elements.streamFPS.value,
            bitrate: this.elements.bitrate.value,
            chatMode: this.elements.chatMode.value,
            autoMod: this.elements.autoMod.value,
            slowMode: this.elements.slowMode.checked
        };

        // Yayın başlığını güncelle
        this.elements.currentTitle.textContent = this.streamSettings.title;
        
        // Kalite göstergelerini güncelle
        this.elements.qualityBadge.textContent = this.streamSettings.resolution;
        this.elements.fpsBadge.textContent = `${this.streamSettings.fps} FPS`;

        // Yayın kalitesini hesapla
        this.calculateStreamQuality();
    }

    toggleMute() {
        const muteButton = document.getElementById('muteStream');
        const icon = muteButton.querySelector('i');
        const videoElement = this.elements.streamVideo;
        
        if (icon.textContent === 'volume_up') {
            icon.textContent = 'volume_off';
            videoElement.muted = true;
        } else {
            icon.textContent = 'volume_up';
            videoElement.muted = false;
        }
    }

    calculateHypeLevel() {
        // Eğer yayın aktif değilse hype düşmeye devam etsin ama minimum 5'in altına inmesin
        if (!this.streamActive) {
            this.stats.hypeLevel = Math.max(5, Math.floor(this.stats.hypeLevel - 1));
            return;
        }

        // Hype hesaplama faktörleri
        const viewerFactor = this.stats.viewers / (Math.max(this.stats.followers, 50) * 0.1);
        const messageFactor = this.stats.totalMessages / (this.stats.totalStreamTime + 1);
        const qualityFactor = this.stats.streamQuality / 100;

        // Mevcut hype'ı koru ve üzerine ekle
        let hypeChange = Math.floor(
            (viewerFactor * 0.4) + 
            (messageFactor * 0.4) + 
            (qualityFactor * 0.2)
        );

        // Minimum değişim miktarı
        if (hypeChange > 0 && hypeChange < 1) hypeChange = 1;
        if (hypeChange < 0 && hypeChange > -1) hypeChange = -1;

        // Yeni hype değerini hesapla ve sınırla
        let newHype = Math.floor(this.stats.hypeLevel + hypeChange);
        this.stats.hypeLevel = Math.max(5, Math.min(100, newHype));
    }

    calculateStreamQuality() {
        let quality = 100;

        // Çözünürlük etkisi
        const resolutionImpact = {
            '720p': 0,
            '1080p': 10,
            '1440p': 20,
            '4k': 30
        };
        quality += resolutionImpact[this.streamSettings.resolution] || 0;

        // FPS etkisi
        const fpsImpact = {
            '30': 0,
            '60': 10,
            '120': 20
        };
        quality += fpsImpact[this.streamSettings.fps] || 0;

        // Bitrate etkisi
        const bitrateImpact = {
            '2000': 0,
            '4000': 10,
            '8000': 20
        };
        quality += bitrateImpact[this.streamSettings.bitrate] || 0;

        this.stats.streamQuality = Math.min(150, quality);
        this.updateDisplay();
    }

    updateDisplay() {
        // Stats güncelleme
        if (this.elements.followers) this.elements.followers.textContent = Math.floor(this.stats.followers);
        if (this.elements.money) this.elements.money.textContent = this.stats.money.toFixed(2);
        if (this.elements.streamQuality) this.elements.streamQuality.textContent = Math.floor(this.stats.streamQuality);
        if (this.elements.viewers) this.elements.viewers.textContent = this.stats.viewers;
        if (this.elements.hypeLevel) this.elements.hypeLevel.textContent = this.stats.hypeLevel;
    }

    // ... Diğer mevcut metodlar ...

    updateStream() {
        const currentTime = new Date();
        const streamDuration = Math.floor((currentTime - this.streamStartTime) / 1000);
        this.stats.totalStreamTime = streamDuration;

        const hours = Math.floor(streamDuration / 3600);
        const minutes = Math.floor((streamDuration % 3600) / 60);
        const seconds = streamDuration % 60;
        this.elements.streamTime.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Progress bar güncelleme (2 saatlik maksimum yayın süresi varsayalım)
        const progress = (streamDuration / (2 * 60 * 60)) * 100;
        document.querySelector('.progress-fill').style.width = `${Math.min(100, progress)}%`;

        this.updateViewers();
        this.generateIncome();
        this.updateStreamQuality();
        this.calculateHypeLevel();
        this.updateDisplay();

        if (this.stats.followers >= 50 && Math.random() < 0.05) {
            this.generateDonation();
        }
        if (this.stats.followers >= 1000 && Math.random() < 0.03) {
            this.generateSubscription();
        }
    }

    checkProFeatures() {
        // Pro özellikleri kontrol et ve kilitle/aç
        const resolutionSelect = this.elements.streamResolution;
        const fpsSelect = this.elements.streamFPS;
        const bitrateSelect = this.elements.bitrate;

        // Çözünürlük seçeneklerini kontrol et
        Array.from(resolutionSelect.options).forEach(option => {
            if (option.value === '1080p' && !this.upgrades.resolution1080p ||
                option.value === '1440p' && !this.upgrades.resolution1440p ||
                option.value === '4k' && !this.upgrades.resolution4k) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });

        // FPS seçeneklerini kontrol et
        Array.from(fpsSelect.options).forEach(option => {
            if (option.value === '60' && !this.upgrades.fps60 ||
                option.value === '120' && !this.upgrades.fps120) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });

        // Bitrate seçeneklerini kontrol et
        Array.from(bitrateSelect.options).forEach(option => {
            if (option.value === '4000' && !this.upgrades.bitrate4000 ||
                option.value === '8000' && !this.upgrades.bitrate8000) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });

        // AutoMod seviyelerini kontrol et
        if (this.upgrades.autoMod) {
            this.elements.autoMod.querySelector('option[value="2"]').disabled = false;
            this.elements.autoMod.querySelector('option[value="3"]').disabled = false;
        } else {
            this.elements.autoMod.querySelector('option[value="2"]').disabled = true;
            this.elements.autoMod.querySelector('option[value="3"]').disabled = true;
        }
    }

    startStream() {
        if (!this.streamSettings.title) {
            this.saveSettings();
        }

        this.streamActive = true;
        
        // Hype düşüş timer'ını durdur
        if (this.hypeDecayTimer) {
            clearInterval(this.hypeDecayTimer);
            this.hypeDecayTimer = null;
        }

        this.streamStartTime = new Date();
        this.activeUsers = new Set();
        this.maxActiveUsers = 0;
        this.lastViewerCount = 0;
        this.viewerUpdateCounter = 0;
        
        // Yayın alanını göster
        if (this.elements.streamArea) {
            this.elements.streamArea.style.display = 'block';
        }

        // STOP butonunu göster
        if (this.elements.endStreamBtn) {
            this.elements.endStreamBtn.style.display = 'block';
        }
        
        // Başlangıç mesajı ve başlık güncelleme
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = `🎥 ${this.streamerName} yayına başladı: ${this.streamSettings.title}`;
        this.elements.chatMessages.appendChild(messageElement);
        
        // Yayın başlığını güncelle
        if (this.elements.currentTitle) {
            this.elements.currentTitle.textContent = `${this.streamerName} - ${this.streamSettings.title}`;
        }
        
        // Timer'ları başlat
        this.streamTimer = setInterval(() => {
            this.updateStream();
        }, 1000);

        // Chat mesaj hızını izleyici sayısına göre ayarla
        this.updateChatInterval();

        // UI'ı güncelle
        this.updateDisplay();

        // Rastgele bir video seç ve oynat
        this.playRandomVideo();
    }

    updateChatInterval() {
        if (this.chatTimer) {
            clearInterval(this.chatTimer);
        }

        // İzleyici sayısına göre chat mesaj aralığını hesapla
        let interval = this.calculateChatInterval();
        
        this.chatTimer = setInterval(() => {
            this.generateChatMessage();
        }, interval);
    }

    calculateChatInterval() {
        const viewers = this.stats.viewers;
        
        // İzleyici sayısına göre mesaj aralığını hesapla
        if (viewers <= 5) return 5000; // 5 saniye
        if (viewers <= 20) return 4000; // 4 saniye
        if (viewers <= 50) return 3000; // 3 saniye
        if (viewers <= 100) return 2000; // 2 saniye
        if (viewers <= 500) return 1000; // 1 saniye
        return 500; // 0.5 saniye (çok izleyicili yayınlar için)
    }

    calculateMaxActiveUsers() {
        const viewers = this.stats.viewers;
        
        // İzleyici sayısına göre aktif kullanıcı sayısını hesapla
        if (viewers <= 5) return Math.max(1, Math.floor(viewers * 0.5)); // %50'si aktif
        if (viewers <= 20) return Math.max(2, Math.floor(viewers * 0.4)); // %40'ı aktif
        if (viewers <= 50) return Math.max(5, Math.floor(viewers * 0.3)); // %30'u aktif
        if (viewers <= 100) return Math.max(10, Math.floor(viewers * 0.25)); // %25'i aktif
        if (viewers <= 500) return Math.max(20, Math.floor(viewers * 0.2)); // %20'si aktif
        return Math.max(50, Math.floor(viewers * 0.15)); // %15'i aktif (çok izleyicili yayınlar için)
    }

    updateViewers() {
        // Her 5 saniyede bir izleyici sayısını güncelle
        this.viewerUpdateCounter++;
        if (this.viewerUpdateCounter < 5) return;
        this.viewerUpdateCounter = 0;

        // Temel izleyici hesaplaması
        const baseViewers = Math.floor(this.stats.followers * 0.1) + 1;
        
        // Yeni izleyici hesaplaması
        const randomFactor = Math.random() * 0.1 + 0.95; // Değişim aralığını küçülttük (0.95-1.05)
        const qualityFactor = this.stats.streamQuality / 100;
        const hypeFactor = 1 + (this.stats.hypeLevel / 100);
        const networkingBonus = this.calculateNetworkingBonus();
        
        // Hype seviyesine göre ekstra izleyici şansı
        let extraViewers = 0;
        if (this.stats.hypeLevel > 0) {
            const maxExtraViewers = Math.floor(this.stats.hypeLevel * 0.5);
            extraViewers = Math.floor(Math.random() * maxExtraViewers);
        }
        
        // Yeni izleyici sayısını hesapla
        const calculatedViewers = Math.floor((baseViewers * randomFactor * qualityFactor * hypeFactor * networkingBonus) + extraViewers);
        
        // Önceki izleyici sayısı ile yeni sayı arasında yumuşak geçiş yap
        if (this.lastViewerCount === 0) {
            this.stats.viewers = calculatedViewers;
        } else {
            // Maksimum değişim miktarını sınırla
            const maxChange = Math.max(1, Math.floor(this.lastViewerCount * 0.1)); // Maksimum %10 değişim
            const difference = calculatedViewers - this.lastViewerCount;
            const change = Math.min(Math.abs(difference), maxChange) * Math.sign(difference);
            this.stats.viewers = this.lastViewerCount + change;
        }
        
        this.lastViewerCount = this.stats.viewers;
        
        // Chat hızını güncelle
        this.maxActiveUsers = this.calculateMaxActiveUsers();
        this.updateChatInterval();
    }

    calculateNetworkingBonus() {
        let bonus = 1.0;
        
        // Her networking aktivitesi için bonus
        if (this.networkingActivities.discordServer) bonus += 0.2;
        if (this.networkingActivities.socialMedia) bonus += 0.15;
        if (this.networkingActivities.communityEvents) bonus += 0.25;
        if (this.networkingActivities.collaboration) bonus += 0.3;
        
        // Networking puanlarına göre ek bonus
        bonus += (this.stats.networkingPoints * 0.01);
        
        return bonus;
    }

    performNetworking() {
        const currentTime = Date.now();
        // Her 5 dakikada bir networking yapılabilir
        if (currentTime - this.stats.lastNetworkingTime < 300000) {
            return false;
        }

        const successChance = Math.random();
        if (successChance > 0.7) { // %30 başarı şansı
            const pointsGained = Math.floor(Math.random() * 3) + 1;
            this.stats.networkingPoints += pointsGained;
            this.stats.lastNetworkingTime = currentTime;
            return true;
        }
        
        return false;
    }

    unlockNetworkingActivity(activity) {
        const costs = {
            discordServer: { points: 10, money: 50 },
            socialMedia: { points: 15, money: 30 },
            communityEvents: { points: 25, money: 100 },
            collaboration: { points: 30, money: 150 }
        };

        if (this.networkingActivities[activity]) return false;
        
        const cost = costs[activity];
        if (this.stats.networkingPoints >= cost.points && this.stats.money >= cost.money) {
            this.stats.networkingPoints -= cost.points;
            this.stats.money -= cost.money;
            this.networkingActivities[activity] = true;
            return true;
        }
        
        return false;
    }

    generateChatMessage() {
        if (!this.streamActive) return;

        // Chat modu kontrolü
        if (this.streamSettings.chatMode === 'followers' && Math.random() > 0.7) {
            return;
        }
        if (this.streamSettings.chatMode === 'subscribers' && Math.random() > 0.5) {
            return;
        }

        // Yavaş mod kontrolü
        if (this.streamSettings.slowMode && Math.random() > 0.7) {
            return;
        }

        // Aktif kullanıcı sayısı kontrolü
        if (this.activeUsers.size >= this.maxActiveUsers && Math.random() > 0.3) {
            // Mevcut aktif kullanıcılardan birini seç
            const activeUsersList = Array.from(this.activeUsers);
            const username = activeUsersList[Math.floor(Math.random() * activeUsersList.length)];
            this.createChatMessage(username);
        } else {
            // Yeni kullanıcı ekle
            let username;
            const messageType = Math.random();

            if (messageType < 0.05 && this.stats.moderatorCount > 0) {
                username = this.selectModeratorUsername();
            } else if (messageType < 0.1 && this.stats.vipCount > 0) {
                username = this.selectVIPUsername();
            } else {
                username = usernames.generateRandomUsername();
            }

            this.activeUsers.add(username);
            this.createChatMessage(username);

            // Belirli bir şansla kullanıcıyı aktif listeden çıkar
            if (Math.random() < 0.2) {
                setTimeout(() => {
                    this.activeUsers.delete(username);
                }, Math.random() * 60000); // 0-60 saniye arası
            }
        }
    }

    createChatMessage(username) {
        // Kullanıcının son mesajından bu yana geçen süreyi kontrol et
        const now = Date.now();
        if (this.lastMessageTime[username] && now - this.lastMessageTime[username] < 2000) {
            return;
        }
        this.lastMessageTime[username] = now;

        // Mesaj havuzunu seç
        let messagePool;
        if (username.includes('Moderator') || username.includes('Admin') || username.includes('Guard')) {
            messagePool = chatMessages.moderator;
        } else if (username.includes('VIP') || username.includes('Sub')) {
            messagePool = chatMessages.vip;
        } else {
            messagePool = chatMessages[this.currentStreamTopic];
        }

        const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
        
        if (this.streamSettings.autoMod !== "0" && this.isMessageBlocked(randomMessage)) {
            return;
        }

        let reaction = '';
        if (Math.random() < 0.3) {
            reaction = ' ' + chatMessages.reactions[Math.floor(Math.random() * chatMessages.reactions.length)];
        }

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        if (username.includes('Moderator') || username.includes('Admin') || username.includes('Guard')) {
            messageElement.className += ' moderator-message';
        } else if (username.includes('VIP') || username.includes('Sub')) {
            messageElement.className += ' vip-message';
        }

        // Rastgele renk oluştur
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 30) + 70;
        const lightness = Math.floor(Math.random() * 20) + 60;
        const userColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'username';
        usernameSpan.style.color = userColor;
        usernameSpan.textContent = username;

        const messageContent = document.createElement('span');
        messageContent.className = 'message-content';
        messageContent.textContent = `: ${randomMessage}${reaction}`;

        messageElement.appendChild(usernameSpan);
        messageElement.appendChild(messageContent);
        
        if (this.elements.chatMessages) {
            this.elements.chatMessages.appendChild(messageElement);
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }
        
        this.stats.totalMessages++;
    }

    endStream() {
        this.streamActive = false;
        clearInterval(this.streamTimer);
        clearInterval(this.chatTimer);
        
        if (this.elements.streamArea) {
            this.elements.streamArea.style.display = 'none';
        }

        // STOP butonunu gizle
        if (this.elements.endStreamBtn) {
            this.elements.endStreamBtn.style.display = 'none';
        }
        
        // Yayın sonu istatistikleri
        const streamDuration = Math.floor((Date.now() - this.streamStartTime) / 1000);
        const averageViewers = Math.floor(this.stats.viewers * 0.8);
        
        // Takipçi kazanma şansı
        const followerChance = Math.min(0.3, (this.stats.hypeLevel / 200));
        const potentialFollowers = Math.floor(averageViewers * followerChance);
        const newFollowers = Math.floor(Math.random() * potentialFollowers) + 1;
        
        this.stats.followers += newFollowers;
        
        // Yayın sonu mesajı
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = `📊 ${this.streamerName}'in yayını sona erdi! ${streamDuration} saniye yayın yaptı. ${newFollowers} yeni takipçi kazandı!`;
        this.elements.chatMessages.appendChild(messageElement);
        
        // Reset stream-specific stats
        this.stats.streamQuality = 100;
        this.stats.viewers = 0;
        this.stats.hypeLevel = Math.max(5, Math.floor(this.stats.hypeLevel * 0.5));
        
        // Yayın başlığını güncelle
        if (this.elements.currentTitle) {
            this.elements.currentTitle.textContent = this.streamerName + ' - Yayın başlamadı';
        }
        
        if (this.elements.chatMessages) {
            setTimeout(() => {
                this.elements.chatMessages.innerHTML = '';
            }, 3000);
        }
        
        this.updateDisplay();

        // Videoyu durdur ve gizle
        if (this.elements.streamVideo) {
            this.elements.streamVideo.pause();
            this.elements.streamVideo.classList.remove('active');
            this.elements.streamVideo.querySelector('source').src = '';
            this.elements.streamVideo.load();
        }

        // Hype düşüş timer'ını başlat
        this.startHypeDecay();
    }

    generateIncome() {
        const baseIncome = this.stats.viewers * 0.001;
        this.stats.money += baseIncome;
    }

    updateStreamQuality() {
        const qualityDecreaseRate = 0.01;
        this.stats.streamQuality = Math.max(0, this.stats.streamQuality - qualityDecreaseRate);
    }

    generateDonation() {
        if (!this.streamActive) return;

        const donationAmount = Math.floor(Math.random() * 50) + 5;
        const donationMessage = chatMessages.donations[Math.floor(Math.random() * chatMessages.donations.length)];
        const username = usernames.generateRandomUsername();

        const messageElement = document.createElement('div');
        messageElement.className = 'donation-message';
        messageElement.textContent = `💰 ${username} bağış yaptı ($${donationAmount}): ${donationMessage}`;
        
        if (this.elements.chatMessages) {
            this.elements.chatMessages.appendChild(messageElement);
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }

        this.stats.money += donationAmount;
        this.stats.hypeLevel = Math.min(100, this.stats.hypeLevel + 10);
        this.updateDisplay();
    }

    generateSubscription() {
        if (!this.streamActive) return;

        const subMessage = chatMessages.subscriptions[Math.floor(Math.random() * chatMessages.subscriptions.length)];
        const username = usernames.generateRandomUsername();

        const messageElement = document.createElement('div');
        messageElement.className = 'subscription-message';
        messageElement.textContent = `🌟 ${username} abone oldu: ${subMessage}`;
        
        if (this.elements.chatMessages) {
            this.elements.chatMessages.appendChild(messageElement);
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }

        this.stats.money += 5; // Abonelik geliri
        this.stats.hypeLevel = Math.min(100, this.stats.hypeLevel + 15);
        this.updateDisplay();
    }

    selectModeratorUsername() {
        const moderators = usernames.specialUsers.filter(name => 
            name.includes('Moderator') || name.includes('Admin') || name.includes('Guard')
        );
        return moderators[Math.floor(Math.random() * moderators.length)];
    }

    selectVIPUsername() {
        const vips = usernames.specialUsers.filter(name => 
            name.includes('VIP') || name.includes('Sub')
        );
        return vips[Math.floor(Math.random() * vips.length)];
    }

    isMessageBlocked(message) {
        const autoModLevel = parseInt(this.streamSettings.autoMod);
        const messageLength = message.length;
        const capsCount = (message.match(/[A-Z]/g) || []).length;
        const capsRatio = capsCount / messageLength;
        const emojiCount = (message.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;

        switch (autoModLevel) {
            case 1: // Düşük
                return capsRatio > 0.8 || emojiCount > 5;
            case 2: // Orta
                return capsRatio > 0.6 || emojiCount > 3;
            case 3: // Yüksek
                return capsRatio > 0.4 || emojiCount > 2;
            default:
                return false;
        }
    }

    startStreamEvent(eventType) {
        if (!this.streamActive) return false;
        if (this.streamEvents[eventType].active) return false;
        
        const event = this.streamEvents[eventType];
        const currentTime = Date.now();
        
        // Son etkinlikten en az 2 dakika geçmiş olmalı
        if (currentTime - this.lastEventTime < 120000) {
            return false;
        }
        
        // Yeterli takipçi kontrolü
        if (this.stats.followers < event.minFollowers) {
            return false;
        }
        
        // Maliyet kontrolü
        if (this.stats.money < event.cost) {
            return false;
        }
        
        this.stats.money -= event.cost;
        event.active = true;
        event.participants = 0;
        this.lastEventTime = currentTime;
        
        // Etkinlik başlangıç mesajı
        const messageElement = document.createElement('div');
        messageElement.className = 'event-message';
        
        switch(eventType) {
            case 'giveaway':
                messageElement.textContent = '🎉 Çekiliş başladı! Katılmak için !join yazın!';
                break;
            case 'challenge':
                messageElement.textContent = '🎮 Yayıncı meydan okuması başladı! !challenge yazarak katılın!';
                break;
            case 'poll':
                messageElement.textContent = '📊 Yeni anket başladı! Oy vermek için !vote yazın!';
                break;
            case 'raid':
                messageElement.textContent = '⚔️ Raid başlıyor! !raid yazarak katılın!';
                break;
        }
        
        this.elements.chatMessages.appendChild(messageElement);
        
        // Etkinlik süresi
        this.activeEventTimer = setTimeout(() => {
            this.endStreamEvent(eventType);
        }, event.duration * 1000);
        
        // Her saniye katılımcı sayısını artır
        const participantInterval = setInterval(() => {
            if (!event.active) {
                clearInterval(participantInterval);
                return;
            }
            
            const viewerCount = this.stats.viewers;
            const participationRate = Math.random();
            
            // İzleyici sayısına göre katılım oranı
            if (viewerCount < 50) {
                if (participationRate < 0.1) event.participants++;
            } else if (viewerCount < 200) {
                if (participationRate < 0.2) event.participants++;
            } else {
                if (participationRate < 0.3) event.participants++;
            }
        }, 1000);
        
        return true;
    }

    endStreamEvent(eventType) {
        const event = this.streamEvents[eventType];
        if (!event.active) return;
        
        event.active = false;
        clearTimeout(this.activeEventTimer);
        
        // Etkinlik sonuç mesajı
        const messageElement = document.createElement('div');
        messageElement.className = 'event-message';
        
        // Etkinlik tiplerine göre ödüller ve bonuslar
        switch(eventType) {
            case 'giveaway':
                const newFollowers = Math.floor(event.participants * 0.5);
                this.stats.followers += newFollowers;
                messageElement.textContent = `🎉 Çekiliş sona erdi! ${event.participants} katılımcı! ${newFollowers} yeni takipçi kazandınız!`;
                break;
                
            case 'challenge':
                const hypeBonus = Math.floor(event.participants * 0.3);
                this.stats.hypeLevel = Math.min(100, this.stats.hypeLevel + hypeBonus);
                messageElement.textContent = `🎮 Meydan okuma sona erdi! ${event.participants} katılımcı! Hype +${hypeBonus}`;
                break;
                
            case 'poll':
                const qualityBonus = Math.floor(event.participants * 0.2);
                this.stats.streamQuality = Math.min(150, this.stats.streamQuality + qualityBonus);
                messageElement.textContent = `📊 Anket sona erdi! ${event.participants} oy! Yayın kalitesi +${qualityBonus}`;
                break;
                
            case 'raid':
                const viewerBonus = Math.floor(event.participants * 2);
                this.stats.viewers += viewerBonus;
                messageElement.textContent = `⚔️ Raid tamamlandı! ${event.participants} katılımcı! ${viewerBonus} yeni izleyici!`;
                break;
        }
        
        this.elements.chatMessages.appendChild(messageElement);
        this.updateDisplay();
    }

    useShoutout() {
        if (!this.streamActive) {
            this.showNotification('❌ Yayın açık değil!');
            return;
        }

        const control = this.chatControls.shoutout;
        const currentTime = Date.now();

        if (currentTime - control.lastUsed < control.cooldown) {
            const remainingTime = Math.ceil((control.cooldown - (currentTime - control.lastUsed)) / 1000);
            this.showNotification(`⏳ ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')} sonra tekrar kullanabilirsin!`);
            return;
        }

        if (this.stats.money < control.cost) {
            this.showNotification('💰 Yeterli paran yok!');
            return;
        }

        this.stats.money -= control.cost;
        control.lastUsed = currentTime;

        // Rastgele bir yayıncı seç
        const streamers = ['Ninja', 'Pokimane', 'xQc', 'Shroud', 'VALORANT_TR', 'Elraenn', 'Wtcn', 'Kendine_Muzisyen'];
        const randomStreamer = streamers[Math.floor(Math.random() * streamers.length)];

        // Chat mesajı oluştur
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = `🎯 ${randomStreamer} yayıncısına shoutout verdiniz! "${this.streamSettings.title}" yayınına göz atın!`;
        this.elements.chatMessages.appendChild(messageElement);

        // İzleyici ve takipçi bonusu
        const viewerGain = Math.floor(Math.random() * control.viewerBonus) + 1;
        this.stats.viewers += viewerGain;

        if (Math.random() < control.followerChance) {
            const followerGain = Math.floor(viewerGain * 0.5) + 1;
            this.stats.followers += followerGain;
            this.showNotification(`📈 ${viewerGain} izleyici ve ${followerGain} takipçi kazandın!`);
        } else {
            this.showNotification(`📈 ${viewerGain} izleyici kazandın!`);
        }

        this.updateDisplay();
    }

    useHashtag() {
        if (!this.streamActive) {
            this.showNotification('❌ Yayın açık değil!');
            return;
        }

        const control = this.chatControls.hashtag;
        const currentTime = Date.now();

        if (currentTime - control.lastUsed < control.cooldown) {
            const remainingTime = Math.ceil((control.cooldown - (currentTime - control.lastUsed)) / 1000);
            this.showNotification(`⏳ ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')} sonra tekrar kullanabilirsin!`);
            return;
        }

        if (this.stats.money < control.cost) {
            this.showNotification('💰 Yeterli paran yok!');
            return;
        }

        this.stats.money -= control.cost;
        control.lastUsed = currentTime;

        // Rastgele bir hashtag oluştur
        const hashtags = [
            '#YayındaOlanlar',
            '#TwitchTR',
            '#YeniYayıncı',
            '#DestekOl',
            '#OyunZamanı',
            '#YayınAçık',
            '#GelinBuraya',
            '#EnİyiYayın'
        ];
        const randomHashtag = hashtags[Math.floor(Math.random() * hashtags.length)];

        // Chat mesajı oluştur
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = `🔥 ${randomHashtag} etiketi trend olmaya başladı! Yayınınız öne çıkıyor!`;
        this.elements.chatMessages.appendChild(messageElement);

        // İzleyici ve takipçi bonusu
        const viewerGain = Math.floor(Math.random() * control.viewerBonus) + 5;
        this.stats.viewers += viewerGain;

        if (Math.random() < control.followerChance) {
            const followerGain = Math.floor(viewerGain * 0.7) + 2;
            this.stats.followers += followerGain;
            this.showNotification(`🚀 ${viewerGain} izleyici ve ${followerGain} takipçi kazandın!`);
        } else {
            this.showNotification(`🚀 ${viewerGain} izleyici kazandın!`);
        }

        // Hype bonus
        const hypeGain = Math.floor(Math.random() * 10) + 5;
        this.stats.hypeLevel = Math.min(100, this.stats.hypeLevel + hypeGain);

        this.updateDisplay();
    }

    useHypeBoost() {
        if (!this.streamActive) {
            this.showNotification('❌ Yayın açık değil!', 'error');
            return;
        }

        const control = this.chatControls.hype;
        const currentTime = Date.now();

        if (currentTime - control.lastUsed < control.cooldown) {
            const remainingTime = Math.ceil((control.cooldown - (currentTime - control.lastUsed)) / 1000);
            this.showNotification(`⏳ ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')} sonra tekrar kullanabilirsin!`, 'warning');
            return;
        }

        control.lastUsed = currentTime;

        // Hype ve izleyici bonusu
        const viewerGain = Math.floor(Math.random() * control.viewerBonus) + 1;
        this.stats.viewers += viewerGain;
        
        const hypeGain = Math.floor(Math.random() * control.hypeBonus) + 10;
        this.stats.hypeLevel = Math.min(100, this.stats.hypeLevel + hypeGain);

        this.showNotification(`🚀 ${viewerGain} izleyici ve ${hypeGain} hype kazandın!`, 'success');
        this.updateDisplay();
    }

    useRaidBoost() {
        if (!this.streamActive) {
            this.showNotification('❌ Yayın açık değil!', 'error');
            return;
        }

        const control = this.chatControls.raid;
        const currentTime = Date.now();

        if (currentTime - control.lastUsed < control.cooldown) {
            const remainingTime = Math.ceil((control.cooldown - (currentTime - control.lastUsed)) / 1000);
            this.showNotification(`⏳ ${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')} sonra tekrar kullanabilirsin!`, 'warning');
            return;
        }

        control.lastUsed = currentTime;

        // Raid şansı kontrolü
        if (Math.random() > control.raidChance) {
            const messageElement = document.createElement('div');
            messageElement.className = 'system-message';
            messageElement.textContent = `😔 Maalesef raid gelmedi. Tekrar dene!`;
            this.elements.chatMessages.appendChild(messageElement);
            this.showNotification('😔 Raid başarısız oldu!', 'error');
            return;
        }

        // Rastgele bir yayıncı seç
        const streamers = ['KüçükYayıncı', 'YeniStreamer', 'GameLover', 'StreamerBaşlangıç', 'YayıncıAdayı'];
        const randomStreamer = streamers[Math.floor(Math.random() * streamers.length)];

        // Chat mesajı oluştur
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = `⚔️ ${randomStreamer} ${Math.floor(Math.random() * 20) + 5} kişiyle raid atıyor!`;
        this.elements.chatMessages.appendChild(messageElement);

        // İzleyici bonusu
        const viewerGain = Math.floor(Math.random() * control.viewerBonus) + 3;
        this.stats.viewers += viewerGain;

        // Hype bonus
        const hypeGain = Math.floor(Math.random() * 5) + 3;
        this.stats.hypeLevel = Math.min(100, this.stats.hypeLevel + hypeGain);

        this.showNotification(`⚔️ Raid başarılı! ${viewerGain} izleyici ve ${hypeGain} hype kazandın!`, 'success');
        this.updateDisplay();
    }

    showNotification(message, type = 'info') {
        // Önceki bildirimleri temizle
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });

        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${type}`;

        // İkon ekle
        const icon = document.createElement('i');
        icon.className = 'material-icons';
        switch(type) {
            case 'success':
                icon.textContent = 'check_circle';
                break;
            case 'error':
                icon.textContent = 'error';
                break;
            case 'warning':
                icon.textContent = 'warning';
                break;
            default:
                icon.textContent = 'info';
        }
        
        const textElement = document.createElement('span');
        textElement.textContent = message;

        notificationElement.appendChild(icon);
        notificationElement.appendChild(textElement);
        document.body.appendChild(notificationElement);

        // 3 saniye sonra bildirimi kaldır
        setTimeout(() => {
            notificationElement.classList.add('fade-out');
            setTimeout(() => {
                if (notificationElement.parentElement) {
                    document.body.removeChild(notificationElement);
                }
            }, 300);
        }, 3000);
    }

    playRandomVideo() {
        // Rastgele bir video seç
        const randomIndex = Math.floor(Math.random() * this.streamVideos.length);
        this.currentVideo = this.streamVideos[randomIndex];
        
        // Video kaynağını ayarla
        const videoElement = this.elements.streamVideo;
        const sourceElement = videoElement.querySelector('source');
        sourceElement.src = this.currentVideo;
        
        // Videoyu yükle ve oynat
        videoElement.load();
        videoElement.play().then(() => {
            videoElement.classList.add('active');
        }).catch(error => {
            console.error('Video oynatma hatası:', error);
        });
    }

    startHypeDecay() {
        // Her 30 saniyede bir hype seviyesini düşür
        this.hypeDecayTimer = setInterval(() => {
            if (this.stats.hypeLevel > 5) { // Minimum 5'in altına düşmesin
                const decayAmount = Math.max(1, Math.floor(this.stats.hypeLevel * 0.05)); // Mevcut hype'ın %5'i kadar düşüş
                this.stats.hypeLevel = Math.max(5, this.stats.hypeLevel - decayAmount);
                this.updateDisplay();
            } else {
                clearInterval(this.hypeDecayTimer);
                this.hypeDecayTimer = null;
            }
        }, 30000); // 30 saniye
    }
}

// Oyunu başlat
window.addEventListener('load', () => {
    window.game = new IdleStreamer();
}); 