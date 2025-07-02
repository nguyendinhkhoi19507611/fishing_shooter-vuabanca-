// Game Configuration File
// Sửa đổi các giá trị này để tùy chỉnh game

const GameConfig = {
    // Cấu hình cơ bản
    INITIAL_COINS: 1000,
    CANVAS_BORDER_COLOR: '#FFD700',
    
    // Cấu hình súng cannon
    WEAPON: {
        name: 'Heavy Cannon',
        cost: 25,           // Giá mỗi viên đạn (coin)
        damage: 60,         // Sát thương mỗi viên
        speed: 10,          // Tốc độ bay của đạn
        size: 8,            // Kích thước đạn
        fireRate: 100       // Thời gian giữa các lần bắn (ms)
    },

    // Đường dẫn hình ảnh
    IMAGES: {
        cannon: 'images/cannon7.png',
        bullet: 'images/bullet7.png'
    },

    // Cấu hình cá
    FISH_TYPES: [
        {
            name: 'Small Fish',
            size: 25,
            speed: 1.2,
            hp: 40,
            reward: 30,
            color: '#FF6B6B',
            emoji: '🐠',
            spawnRate: 0.3  // Tỷ lệ xuất hiện (0-1)
        },
        {
            name: 'Medium Fish',
            size: 35,
            speed: 0.9,
            hp: 80,
            reward: 60,
            color: '#4ECDC4',
            emoji: '🐟',
            spawnRate: 0.25
        },
        {
            name: 'Puffer Fish',
            size: 30,
            speed: 1.0,
            hp: 60,
            reward: 45,
            color: '#45B7D1',
            emoji: '🐡',
            spawnRate: 0.2
        },
        {
            name: 'Big Fish',
            size: 45,
            speed: 0.7,
            hp: 120,
            reward: 100,
            color: '#96CEB4',
            emoji: '🐠',
            spawnRate: 0.15
        },
        {
            name: 'Shark Boss',
            size: 65,
            speed: 0.5,
            hp: 250,
            reward: 250,
            color: '#FFEAA7',
            emoji: '🦈',
            spawnRate: 0.1
        }
    ],

    // Cấu hình spawn
    SPAWN: {
        fishSpawnInterval: 3000,    // Thời gian spawn cá (ms)
        initialFishCount: 8,        // Số cá ban đầu
        maxFishOnScreen: 15,        // Số cá tối đa trên màn hình
        bubbleSpawnInterval: 2000   // Thời gian spawn bubble (ms)
    },

    // Cấu hình hiệu ứng
    EFFECTS: {
        particleCount: 8,           // Số particle khi bắn trúng
        particleLifetime: 30,       // Thời gian sống của particle
        bulletLifetime: 100,        // Thời gian sống của đạn
        notificationDuration: 2000  // Thời gian hiển thị thông báo (ms)
    },

    // Cấu hình màu sắc
    COLORS: {
        oceanGradient: {
            top: '#87CEEB',
            middle: '#4682B4', 
            bottom: '#191970'
        },
        ui: {
            gold: '#FFD700',
            success: '#00FF00',
            error: '#FF4444',
            warning: '#FFA500'
        },
        cannon: {
            base: '#8B4513',
            barrel: '#444444'
        }
    },

    // Cấu hình âm thanh (nếu có)
    SOUNDS: {
        enabled: false,
        shoot: 'sounds/shoot.mp3',
        hit: 'sounds/hit.mp3',
        kill: 'sounds/kill.mp3',
        coin: 'sounds/coin.mp3'
    },

    // Cấu hình responsive
    MOBILE: {
        enableTouch: true,
        touchSensitivity: 1.0,
        vibrationEnabled: false
    },

    // Cấu hình debug
    DEBUG: {
        showFPS: false,
        showCollisionBoxes: false,
        logEvents: false
    },

    // Cấu hình game balance
    BALANCE: {
        coinMultiplier: 1.0,        // Nhân hệ số coin nhận được
        difficultyIncrease: false,   // Tăng độ khó theo thời gian
        maxCoins: 999999,           // Số coin tối đa
        minCoinsToPlay: 25          // Số coin tối thiểu để chơi tiếp
    }
};

// Export config để sử dụng trong game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}

// Hàm helper để lấy random fish type dựa trên spawn rate
GameConfig.getRandomFishType = function() {
    const rand = Math.random();
    let cumulativeRate = 0;
    
    for (let fishType of this.FISH_TYPES) {
        cumulativeRate += fishType.spawnRate;
        if (rand <= cumulativeRate) {
            return fishType;
        }
    }
    
    // Fallback to first fish type
    return this.FISH_TYPES[0];
};

// Hàm validation config
GameConfig.validate = function() {
    const errors = [];
    
    // Kiểm tra spawn rates
    const totalSpawnRate = this.FISH_TYPES.reduce((sum, fish) => sum + fish.spawnRate, 0);
    if (totalSpawnRate > 1.0) {
        errors.push('Total fish spawn rate exceeds 1.0');
    }
    
    // Kiểm tra weapon config
    if (this.WEAPON.cost <= 0) {
        errors.push('Weapon cost must be positive');
    }
    
    if (this.WEAPON.damage <= 0) {
        errors.push('Weapon damage must be positive');
    }
    
    // Kiểm tra fish config
    this.FISH_TYPES.forEach((fish, index) => {
        if (fish.hp <= 0) {
            errors.push(`Fish ${index} HP must be positive`);
        }
        if (fish.reward <= 0) {
            errors.push(`Fish ${index} reward must be positive`);
        }
    });
    
    if (errors.length > 0) {
        console.error('Game config validation errors:', errors);
        return false;
    }
    
    return true;
};

// Auto validate config khi load
GameConfig.validate();