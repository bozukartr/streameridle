const usernames = {
    prefixes: [
        "Cool", "Pro", "Gamer", "Dark", "Light", "Super", "Ultra", "Mega", "Epic", "Royal",
        "King", "Queen", "Lord", "Master", "Elite", "Shadow", "Ghost", "Ninja", "Dragon", "Star",
        "Toxic", "Sweet", "Crazy", "Wild", "Silent", "Loud", "Quick", "Fast", "Slow", "Lazy",
        "Happy", "Sad", "Mad", "Angry", "Cute", "Baby", "Old", "Young", "Big", "Small",
        "Neon", "Cyber", "Tech", "Digital", "Virtual", "Real", "Fake", "True", "False", "Random"
    ],
    
    suffixes: [
        "Player", "Warrior", "Hunter", "Gamer", "Master", "Legend", "Champion", "Knight", "Slayer", "Boss",
        "Gaming", "Stream", "TV", "Live", "YT", "TTV", "Pro", "X", "TR", "HD",
        "Official", "Original", "Real", "Best", "Top", "Elite", "Prime", "Plus", "Max", "Ultra",
        "Team", "Squad", "Clan", "Guild", "Family", "Nation", "Empire", "Kingdom", "World", "Universe",
        "_xXx_", "_TV", "_YT", "_Live", "_Gaming", "_Pro", "_TR", "_EN", "_DE", "_FR"
    ],
    
    commonNames: [
        "Ahmet", "Mehmet", "Ali", "Ayşe", "Fatma", "Can", "Cem", "Deniz", "Efe", "Eren",
        "Zeynep", "Elif", "Berk", "Burak", "Çağlar", "Derya", "Emre", "Furkan", "Gizem", "Hakan",
        "İrem", "Kaan", "Leyla", "Mert", "Nur", "Ozan", "Pelin", "Rüzgar", "Selin", "Tolga",
        "Ufuk", "Volkan", "Yağmur", "Zara", "Alp", "Bora", "Ceyda", "Demir", "Eylül", "Ferhat",
        "Gamze", "Hande", "İlker", "Jale", "Kemal", "Lale", "Mine", "Nazlı", "Orhan", "Pınar"
    ],
    
    numbers: ["", "123", "34", "35", "06", "07", "01", "02", "55", "61", "00", "99", "58", "16", "27",
             "42", "31", "53", "38", "45", "48", "67", "71", "78", "81", "90", "1905", "1907", "1903", "1967",
             "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010",
             "xD", "LOL", "GG", "EZ", "WP", "AFK", "OMG", "PRO", "NOOB", "MVP"],
    
    specialUsers: [
        "ModeratorBatu", "AdminEce", "VIPKemal", "SubKral", "YayinciDost",
        "TwitchPartner", "StreamerBuddy", "ModSquad", "VIPUye", "EliteModerator",
        "YayinciMod", "TwitchAdmin", "GlobalMod", "VIPSponsor", "SubModerator",
        "StreamManager", "CommunityLead", "ChatGuard", "StreamProtector", "ModeratorTeam",
        "BotKoruyucu", "YayinKoruma", "ChatMod", "VIPModTeam", "AdminTeam",
        "ModeratorPro", "VIPGuard", "StreamSecurity", "ChatProtect", "ModSquadLead"
    ],

    // Yeni: Yayıncı takma adları
    streamerNicknames: [
        "yayinci", "streamer", "fenomen", "gamer", "oyuncu",
        "pro", "reis", "kral", "prenses", "kraliçe",
        "abi", "abla", "hoca", "usta", "master",
        "şef", "kaptan", "lider", "patron", "başkan"
    ],

    // Yeni: Oyun karakterleri
    gameCharacters: [
        "Valorant", "CSGO", "LoL", "Minecraft", "GTA",
        "Fortnite", "PUBG", "Apex", "Roblox", "AmongUs",
        "Zed", "Yasuo", "Phoenix", "Jett", "Sage",
        "Steve", "Creeper", "Mario", "Sonic", "Pikachu"
    ],
    
    // Rastgele kullanıcı adı oluşturmak için yardımcı fonksiyon
    generateRandomUsername: function() {
        const randomType = Math.random();
        
        if (randomType < 0.1 && this.specialUsers.length > 0) {
            // %10 ihtimalle özel kullanıcı
            return this.specialUsers[Math.floor(Math.random() * this.specialUsers.length)];
        } else if (randomType < 0.2) {
            // %10 ihtimalle oyun karakteri + numara
            const character = this.gameCharacters[Math.floor(Math.random() * this.gameCharacters.length)];
            const number = this.numbers[Math.floor(Math.random() * this.numbers.length)];
            return character + number;
        } else if (randomType < 0.3) {
            // %10 ihtimalle yayıncı takma adı + isim
            const nickname = this.streamerNicknames[Math.floor(Math.random() * this.streamerNicknames.length)];
            const name = this.commonNames[Math.floor(Math.random() * this.commonNames.length)];
            return name + nickname;
        } else if (randomType < 0.5) {
            // %20 ihtimalle prefix + commonName + number
            const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
            const name = this.commonNames[Math.floor(Math.random() * this.commonNames.length)];
            const number = this.numbers[Math.floor(Math.random() * this.numbers.length)];
            return prefix + name + number;
        } else if (randomType < 0.7) {
            // %20 ihtimalle commonName + suffix + number
            const name = this.commonNames[Math.floor(Math.random() * this.commonNames.length)];
            const suffix = this.suffixes[Math.floor(Math.random() * this.suffixes.length)];
            const number = this.numbers[Math.floor(Math.random() * this.numbers.length)];
            return name + suffix + number;
        } else {
            // %30 ihtimalle prefix + suffix + number
            const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
            const suffix = this.suffixes[Math.floor(Math.random() * this.suffixes.length)];
            const number = this.numbers[Math.floor(Math.random() * this.numbers.length)];
            return prefix + suffix + number;
        }
    }
}; 