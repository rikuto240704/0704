const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
    this.load.image('player', player.jpg');
    this.load.image('bullet', bullet.jpg');
    this.load.image('enemy', 'enemy.jpg');
}

let score = 0;
let scoreText;
let lastEnemyTime = 0;

function create() {
    this.player = this.physics.add.sprite(400, 500, 'player');
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

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

    this.lastFired = 0;
}

function update(time) {
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
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
            this.lastFired = time + 300;
        }
    }

    this.bullets.children.each(function(bullet) {
        if (bullet.active && bullet.y < 0) {
            bullet.setActive(false);
            bullet.setVisible(false);
        }
    }, this);

    // 敵のランダム出現
    if (time > lastEnemyTime) {
        const x = Phaser.Math.Between(50, 750);
        const enemy = this.enemies.create(x, 0, 'enemy');
        enemy.setVelocityY(100);
        lastEnemyTime = time + 2000; // 次の敵が出現するまでの間隔を設定
    }

    this.enemies.children.each(function(enemy) {
        if (enemy.active && enemy.y > 600) {
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
    player.anims.play('turn');
    alert('ゲームオーバー');
    location.reload();
}
