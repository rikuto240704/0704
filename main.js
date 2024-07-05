const config = {
    type: Phaser.AUTO,
    width: 1200, // 横幅を1.5倍に変更
    height: 900, // 縦幅を1.5倍に変更
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
let gameStarted = false;
let startText;

function create() {
    // 背景色を白色に設定
    this.add.rectangle(600, 450, 1200, 900, 0xFFFFFF).setOrigin(0.5, 0.5);

    // ゲーム説明テキストを表示
    startText = this.add.text(600, 450, 'Enterキーを押してゲーム開始', { fontSize: '32px', fill: '#000' }).setOrigin(0.5, 0.5);

    // Enterキー入力を検出
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // ゲーム開始後に使う要素を予め作成
    this.player = this.physics.add.sprite(600, 750, 'player').setScale(0.5).setCollideWorldBounds(true).setVisible(false);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 10
    });
    this.enemies = this.physics.add.group();
    this.physics.add.collider(this.bullets, this.enemies, hitEnemy, null, this);
    this.physics.add.collider(this.player, this.enemies, hitPlayer, null, this);
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' }).setVisible(false);

    // ゲームが開始されていない状態でupdate関数の一部をスキップするためのフラグ
    this.input.keyboard.on('keydown-ENTER', startGame, this);
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        startText.setVisible(false);
        this.player.setVisible(true);
        scoreText.setVisible(true);
    }
}

function update(time) {
    if (!gameStarted) return;

    // プレイヤーの移動
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
    } else {
        this.player.setVelocityX(0);
    }

    // スペースキーが押されたら弾を発射
    if (this.spaceBar.isDown && time > this.lastFired) {
        const bullet = this.bullets.get(this.player.x, this.player.y - 20);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.velocity.y = -300;
            bullet.setScale(0.5); // サイズを小さく設定
            this.lastFired = time + 300;
        }
    }

    // 弾の自動除去
    this.bullets.children.each(function(bullet) {
        if (bullet.active && bullet.y < 0) {
            bullet.setActive(false);
            bullet.setVisible(false);
        }
    }, this);

    // 敵のランダム出現
    if (time > lastEnemyTime) {
        const x = Phaser.Math.Between(75, 1125); // X座標を調整
        const enemyType = Phaser.Math.Between(1, 2); // 1 または 2 をランダムに選択
        const enemy = this.enemies.create(x, 0, 'enemy' + enemyType); // enemy1 または enemy2 を生成
        enemy.setVelocityY(100);
        enemy.setScale(0.5); // サイズを小さく設定
        lastEnemyTime = time + 2000; // 次の敵が出現するまでの間隔を設定
    }

    // 敵の自動除去
    this.enemies.children.each(function(enemy) {
        if (enemy.active && enemy.y > 900) { // Y座標の条件を調整
            enemy.destroy();
        }
    }, this);
}

function hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    score += 10;
    scoreText.setText('Score: ' + score);
}

function hitPlayer(player, enemy) {
    this.physics.pause();
    player.setTint(0xff0000);
    alert('ゲームオーバー');
    location.reload();
}
