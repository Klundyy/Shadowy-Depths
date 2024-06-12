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
        this.inGameTime = 0;
        this.playerHeight = 0;
    }
    preload(){
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
        
    }

    create() {
        this.map = this.add.tilemap("depths-level", 8, 8);

        // Tileset
        this.tileset = this.map.addTilesetImage("tiles", "tilemap_tiles");

        // Layers
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0).setScale(this.SCALE);
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0).setScale(this.SCALE);
        this.objectLayer = this.map.createLayer("Objects", this.tileset, 0, 0);
        this.animatedTiles.init(this.map);
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.dinos = this.map.createFromObjects("Objects", {
            name: "dinos",
            key: "tilemap_sheet",
            frame: 47
        });
        this.flag = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 22
        })
        // Static Objects
        this.physics.world.enable(this.flag, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.dinos, Phaser.Physics.Arcade.STATIC_BODY);

        // Object Groups
        this.dinoGroup = this.add.group(this.dinos);
        // Player Avatar
        my.sprite.player = this.physics.add.sprite(8, 880, "Player_Knight_idle_0.png").setScale(this.SCALE);
        my.sprite.player.setSize(8,8);
        my.sprite.player.setOffset(8,8);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setMaxVelocity(this.MAX_X_VEL, this.MAX_Y_VEL);
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
        // Moving platforms setup
        this.movingPlatform1 = this.physics.add.sprite(88, 496, 'movingPlatform').setDisplaySize(16,16); // Set up sprite and size for moving platform
        this.movingPlatform1.body.setAllowGravity(false); // Platform can float
        this.movingPlatform1.body.setImmovable(true);   // 
        this.movingPlatform1.body.velocity.x = 25;
        this.physics.add.collider(my.sprite.player, this.movingPlatform1);
        this.movingPlatform2 = this.physics.add.sprite(160, 352, 'movingPlatform').setDisplaySize(16,16); // Set up sprite and size for moving platform
        this.movingPlatform2.body.setAllowGravity(false); // Platform can float
        this.movingPlatform2.body.setImmovable(true);   // 
        this.movingPlatform2.body.velocity.y = 25;
        this.physics.add.collider(my.sprite.player, this.movingPlatform2);
        // Overlap Handling
        this.physics.add.overlap(my.sprite.player, this.flag, (obj1, obj2) => {
            this.scene.start("winScreen",  my.sprite.player.collectibles);
        });
        this.physics.add.overlap(my.sprite.player, this.dinos, (obj1, obj2) => {
            my.sprite.player.collectibles += 1;
            this.sound.play('coinAudio');
            obj2.destroy();
        });
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');
        this.zKey = this.input.keyboard.addKey('Z');
        this.lKey = this.input.keyboard.addKey('L');
        this.eKey = this.input.keyboard.addKey('E');
        this.escKey = this.input.keyboard.addKey('ESC');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        my.vfx.jumping = this.add.particles(-2, -2, "kenny-particles", {
            frame: ['slash_01.png', 'slash_02.png'],
            random: true,
            scale: {start: 0.01, end: 0.05},
            maxAliveParticles: 20,
            lifespan: 100,
            gravityY: 100,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping.stop();

        //this.cameras.main.ignore(this.uiContainer);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(40, 60);
        this.cameras.main.setZoom(6);
        this.scene.launch("userInterface",this.playerHeight);
    }
    update() {
        // Calculate Player height and update scene
        this.playerHeight = (892-my.sprite.player.y)/8;
        this.playerHeight = (this.playerHeight > 100) ? 100: Math.trunc(this.playerHeight);
        this.events.emit('updateHeightCounter', this.playerHeight);
        // Inputs
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);


        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
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
        // Jump hold handling  
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
        
        // Moving Platforms
        if (this.movingPlatform1.x >= 145) {
            this.movingPlatform1.body.velocity.x = -25;
        } else if (this.movingPlatform1.x <= 72) {
            this.movingPlatform1.body.velocity.x = 25;
        }
        if (this.movingPlatform2.y >= 402) {
            this.movingPlatform2.body.velocity.y = -25;
        } else if (this.movingPlatform2.y <= 342) {
            this.movingPlatform2.body.velocity.y = 25;
        }
        // Testing
        this.input.on('pointerdown', (pointer) =>{
           my.sprite.player.x = pointer.x;
           my.sprite.player.y = pointer.y;
        });
        if(Phaser.Input.Keyboard.JustDown(this.zKey)){
            this.cameras.main.setZoom(6);
        }
        if(Phaser.Input.Keyboard.JustUp(this.zKey)){
            this.cameras.main.setZoom(1);
        }
        if(Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.scene.launch("pauseMenu");
            this.scene.pause("Platformer");
        }
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}