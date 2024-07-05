const config = {
    type: Phaser.AUTO,
    width: 1600, // 幅を2倍に
    height: 1200, // 高さを2倍に
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('player', 'assets/player.jpg');
    this.load.image('bullet', 'assets/bullet.png');  
    this.load.image('enemy1', 'assets/enemy1.jpg');  
    this.load.image('enemy2', 'assets/enemy2.jpg');  
}

let score = 0;
let scoreText;
let lastEnemyTime = 0;
let enemyInterval = 2000; // 初期の敵の落ちてくる間隔
let enemySpeed = 400; // 敵の速度

function create() {
    this.add.rectangle(800, 600, 1600, 1200, 0xFFFFFF).setOrigin(0.5, 0.5); // フィールドの背景を設定

    this.player = this.physics.add.sprite(800, 1000, 'player').setScale(1); // プレイヤーの位置とスケールを調整
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 10
    });

    this.enemies = this.physics.add.group();

    this.physics.add.collider(this.bullets, this.enemies, hitEnemy, null, this);
    this.physics.add.collider(this.player, this.enemies, hitPlayer, null, this);

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    this.lastFired = 0;

    // 最初の敵の落ちてくる時間を設定
    scheduleNextEnemy(this.time.now);
}

function update(time) {
    // 前後の移動
    if (this.cursors.up.isDown) {
        this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(200);
    } else {
        this.player.setVelocityY(0);
    }

    // 左右の移動
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
    } else {
        this.player.setVelocityX(0);
    }

    // 前進移動
    if (this.cursors.space.isDown) {
        this.player.setVelocityX(200);
    } else {
        this.player.setVelocityX(0);
    }

    if (this.spaceBar.isDown && time > this.lastFired) {
        const bullet = this.bullets.get(this.player.x, this.player.y - 20);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.velocity.y = -300;
            bullet.setScale(0.5);
            this.lastFired = time + 300;
        }
    }

    this.bullets.children.each(function(bullet) {
        if (bullet.active && bullet.y < 0) {
            bullet.setActive(false);
            bullet.setVisible(false);
        }
    }, this);
}

function scheduleNextEnemy(currentTime) {
    const delay = Phaser.Math.Between(1000, 3000); // ランダムな待機時間を計算
    game.time.addEvent({
        delay: delay,
        callback: createEnemy,
        callbackScope: this,
        loop: false
    });

    // 次の敵の落ちてくる時間を設定
    lastEnemyTime = currentTime + delay;
}

function createEnemy() {
    const side = Phaser.Math.Between(1, 4); // 上下左右のどこから出現するかランダムに決定
    let x, y, velocityX, velocityY;

    switch(side) {
        case 1: // 上から
            x = Phaser.Math.Between(100, 1500); // フィールド内の広い範囲に敵をランダムに配置
            y = 0;
            velocityX = 0;
            velocityY = enemySpeed; // 高速化した速度
            break;
        case 2: // 下から
            x = Phaser.Math.Between(100, 1500);
            y = 1200;
            velocityX = 0;
            velocityY = -enemySpeed; // 高速化した速度
            break;
        case 3: // 左から
            x = 0;
            y = Phaser.Math.Between(100, 1100);
            velocityX = enemySpeed; // 高速化した速度
            velocityY = 0;
            break;
        case 4: // 右から
            x = 1600;
            y = Phaser.Math.Between(100, 1100);
            velocityX = -enemySpeed; // 高速化した速度
            velocityY = 0;
            break;
    }

    const enemyType = Phaser.Math.Between(1, 2);
    const enemy = this.enemies.create(x, y, 'enemy' + enemyType);
    enemy.setVelocity(velocityX, velocityY);
    enemy.setScale(0.5);
    enemy.hp = 2; // 2発撃たないと死なないようにHPを設定

    // 次の敵の落ちてくる時間をスケジュール
    scheduleNextEnemy(this.time.now);
}

function hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.hp--; // 弾が当たったら敵のHPを減らす

    if (enemy.hp <= 0) {
        enemy.destroy(); // HPが0以下になったら敵を破壊
        score += 10;
        scoreText.setText('Score: ' + score);
    }
}

function hitPlayer(player, enemy) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    alert('ゲームオーバー');
    location.reload();
}
