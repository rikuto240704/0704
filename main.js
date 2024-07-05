const config = {
    type: Phaser.AUTO,
    width: 1200, // 横幅を1.5倍に変更
    height: 900, // 縦幅を1.5倍に変更
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // 重力を無効化
            debug: false // デバッグ表示を無効化
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config); // ゲームを作成

function preload() {
    this.load.image('player', 'assets/player.jpg'); // プレイヤーの画像を読み込み
    this.load.image('bullet', 'assets/bullet.png'); // 弾の画像を読み込み
    this.load.image('enemy1', 'assets/enemy1.jpg'); // 敵1の画像を読み込み
    this.load.image('enemy2', 'assets/enemy2.jpg'); // 敵2の画像を読み込み
}

let score = 0; // スコアを初期化
let scoreText; // スコア表示用のテキスト
let lastEnemyTime = 0; // 最後に敵が出現した時間
let lastTapTime = 0; // 最後にタップされた時間
let touchStartX = 0; // スワイプの開始位置
let touchEndX = 0; // スワイプの終了位置

function create() {
    // 背景色を白色に設定
    this.add.rectangle(600, 450, 1200, 900, 0xFFFFFF).setOrigin(0.5, 0.5);

    // プレイヤーを作成し、サイズを小さく設定
    this.player = this.physics.add.sprite(600, 750, 'player').setScale(0.5);
    this.player.setCollideWorldBounds(true); // 画面端での衝突を有効化

    // キーボード入力を設定
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 弾のグループを作成
    this.bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 10
    });

    // 敵のグループを作成
    this.enemies = this.physics.add.group();

    // 弾と敵の衝突を検出
    this.physics.add.collider(this.bullets, this.enemies, hitEnemy, null, this);
    // プレイヤーと敵の衝突を検出
    this.physics.add.collider(this.player, this.enemies, hitPlayer, null, this);

    // スコア表示用のテキストを設定
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    // 最後に敵が出現した時間を初期化
    this.lastFired = 0;

    // タッチ入力を設定
    this.input.on('pointerdown', function(pointer) {
        const currentTime = this.time.now;

        // スワイプの開始位置を記録
        touchStartX = pointer.x;

        // ダブルタップの判定
        if (currentTime - lastTapTime < 300) {
            fireBullet.call(this, currentTime);
        }
        lastTapTime = currentTime;
    }, this);

    // タッチ移動を設定
    this.input.on('pointermove', function(pointer) {
        if (pointer.isDown) {
            touchEndX = pointer.x;
            const diffX = touchEndX - touchStartX;

            if (Math.abs(diffX) > 10) {
                this.player.setVelocityX(diffX * 2);
            } else {
                this.player.setVelocityX(0);
            }
        }
    }, this);

    // タッチ終了を設定
    this.input.on('pointerup', function() {
        this.player.setVelocityX(0);
    }, this);
}

function update(time) {
    // キーボードによるプレイヤーの移動
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
    } else {
        this.player.setVelocityX(0);
    }

    // キーボードによる弾の発射
    if (this.spaceBar.isDown && time > this.lastFired) {
        fireBullet.call(this, time);
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
        enemy.setVelocityY(100); // 下方向に移動
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

function fireBullet(time) {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.body.velocity.y = -300;
        bullet.setScale(0.5); // サイズを小さく設定
        this.lastFired = time + 300; // 発射間隔を設定
    }
}

function hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy(); // 敵を破壊

    score += 10; // スコアを加算
    scoreText.setText('Score: ' + score); // スコアを更新
}

function hitPlayer(player, enemy) {
    this.physics.pause(); // 物理演算を停止
    player.setTint(0xff0000); // プレイヤーを赤く表示
    player.anims.play('turn'); // プレイヤーのアニメーションを再生
    alert('ゲームオーバー'); // ゲームオーバーのアラートを表示
    location.reload(); // ページをリロードしてゲームを再開
}
