class Platformer extends Phaser.Scene {
    constructor() {
        super("Platformer");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 200;
        this.DRAG = 1000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 2000;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
    }
    preload(){
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        this.roomGen = false;
        this.map = this.add.tilemap("depths-level", 8, 8, 30, 120);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tiles", "tilemap_tiles");

        // Create a layer
        this.backgroundLayer = this.map.createLayer("Background", this.bgtileset, 0, 0).setScrollFactor(.6).setScale(1.25);
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
        this.objectLayer = this.map.createLayer("Objects", this.tileset, 0, 0);
        this.animatedTiles.init(this.map);
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.flag = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 111
        });
        this.key = this.map.createFromObjects("Objects", {
            name: "key",
            key: "tilemap_sheet",
            frame: 27
        });
        this.zoomBuff = this.map.createFromObjects("Objects",{
            name: "zoomBuff",
            key: "tilemap_sheet",
            frame: 67
        });
        this.lock = this.map.createFromObjects("Lock",{
            name: "lock",
            key: "tilemap_sheet",
            frame: 28
        });
        
        // Static Objects
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.flag, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.zoomBuff, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.lock, Phaser.Physics.Arcade.STATIC_BODY);

        // Object Groups
        this.coinGroup = this.add.group(this.coins);
        this.lockGroup = this.add.group(this.lock);

        // Player Avatar
        my.sprite.player = this.physics.add.sprite(0, 250, "platformer_characters", "tile_0000.png").setScale(.8);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setMaxVelocity(200, 1000);
        my.sprite.player.coins = 0;
        my.sprite.player.collectibles = 0;

        // Collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.lockGroup);

        // Overlap Handling
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            my.sprite.player.coins += 1;
            this.sound.play('coinAudio');
            this.map.removeTileAtWorldXY(obj2.x, obj2.y);
            obj2.destroy();
        });
        this.physics.add.overlap(my.sprite.player, this.zoomBuff, (obj1, obj2) => {
            my.sprite.player.collectibles += 1;
            this.cameras.main.setZoom(4);
            my.sprite.player.setMaxVelocity(400, 1200);
            this.sound.play('keyAudio');
            obj2.destroy();
        });
        this.physics.add.overlap(my.sprite.player, this.flag, (obj1, obj2) => {
            this.scene.start("winScreen", my.sprite.player.collectibles);
        });
        this.physics.add.overlap(my.sprite.player, this.key, (obj1, obj2) => {
            my.sprite.player.collectibles += 1;
            this.lockGroup.setVisible(false);
            this.physics.world.disable(this.lock, Phaser.Physics.Arcade.STATIC_BODY);
            this.sound.play('keyAudio');
            obj2.destroy();
        });
        this.physics.add.overlap(my.sprite.player, this.water-20, (obj1, obj2) => {
            scene.restart();
        });
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            random: true,
            scale: {start: 0.01, end: 0.03},
            maxAliveParticles: 12,
            lifespan: 200,
            gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['slash_01.png', 'slash_02.png'],
            random: true,
            scale: {start: 0.05, end: 0.1},
            maxAliveParticles: 20,
            lifespan: 200,
            gravityY: 400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping.stop();
        

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 80);
        this.cameras.main.setZoom(5);
    }
    update() {
        if(my.sprite.player.coins == 5 && this.roomGen == false){
            this.map.putTilesAt([[22,3,3,4],[121,-1,-1,-1],[121,-1,-1,-1],[122,23,23,23]],0,14,true,this.groundLayer);
            this.map.setCollision([3,4,5,22,23,121,122],true,this.groundLayer);
            this.zoomBuff[0].visible = true;
            this.roomGen = true;
        }
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
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
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.sound.play('jumpAudio');
            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.jumping.start();
        }
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}