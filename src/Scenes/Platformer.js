class Platformer extends Phaser.Scene {
    constructor() {
        super("Platformer");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 200;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 500;
        this.MAX_X_VEL = 50;
        this.MAX_Y_VEL = 200;
        this.JUMP_VELOCITY = -160;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 1;
        this.jumpStartTime;
        this.isJumping;
    }
    preload(){
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        this.roomGen = false;
        this.map = this.add.tilemap("depths-level", 8, 8);

        // Tileset
        this.tileset = this.map.addTilesetImage("tiles", "tilemap_tiles");

        // Layers
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0).setScale(this.SCALE);
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0).setScale(this.SCALE);
        //this.objectLayer = this.map.createLayer("Objects", this.tileset, 0, 0);
        this.animatedTiles.init(this.map);
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // this.coins = this.map.createFromObjects("Objects", {
        //     name: "coin",
        //     key: "tilemap_sheet",
        //     frame: 151
        // });
        // Static Objects
        //this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // Object Groups
        // this.coinGroup = this.add.group(this.coins);
        // this.lockGroup = this.add.group(this.lock);

        // Player Avatar
        my.sprite.player = this.physics.add.sprite(116, 892, "Player_Knight_idle_0.png").setScale(this.SCALE);
        my.sprite.player.setSize(8,8);
        my.sprite.player.setOffset(8,8);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setMaxVelocity(this.MAX_X_VEL, this.MAX_Y_VEL);
        my.sprite.player.coins = 0;
        my.sprite.player.collectibles = 0;
        // Physics World Properties
        this.physics.world.setBounds(0,0,240,900);
        this.physics.world.TILE_BIAS = 20;

        // Collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer, null,(obj1, obj2) => {
            if(obj2.properties.collideDown){ // One sided collision check during process callback (If using the collide callback, collision already happens resulting in velocty being 0)
                if (obj1.body.velocity.y >= 0) {
                    return true;
                } else {
                    return false;
                } 
            }
            return true;
        });
        // Overlap Handling
        // this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
        //     my.sprite.player.coins += 1;
        //     this.sound.play('coinAudio');
        //     this.map.removeTileAtWorldXY(obj2.x, obj2.y);
        //     obj2.destroy();
        // });
        // this.physics.add.overlap(my.sprite.player, this.flag, (obj1, obj2) => {
        //     this.scene.start("winScreen", my.sprite.player.collectibles);
        // });
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        my.vfx.walking = this.add.particles(0, -2, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            random: true,
            scale: {start: 0.005, end: 0.01},
            maxAliveParticles: 12,
            lifespan: 100,
            gravityY: 100,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['slash_01.png', 'slash_02.png'],
            random: true,
            scale: {start: 0.01, end: 0.05},
            maxAliveParticles: 20,
            lifespan: 100,
            gravityY: 100,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping.stop();
        

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(40, 60);
        this.cameras.main.setZoom(6);
    }
    update() {
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-15, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }
        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            my.vfx.jumping.stop();
        }
        if(my.sprite.player.body.blocked.down && cursors.up.isDown) {
            if(!this.isJumping){
                this.jumpStartTime = this.time.now; // Jump starting hold time
                this.isJumping = true;
            }
        }
        if(my.sprite.player.body.blocked.down && cursors.up.isUp && this.isJumping){
            const jumpTime = this.time.now - this.jumpStartTime; // Jump hold duration
            let jumpForce = jumpTime * .1;
            jumpForce = (jumpForce > 50) ? 50 : jumpForce;  // Setting max jump force
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY-jumpForce);
            this.isJumping = false;
            this.sound.play('jumpAudio');
            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.jumping.start();
        }
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}