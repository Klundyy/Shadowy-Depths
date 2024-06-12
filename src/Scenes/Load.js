class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
        // Load characters spritesheet

        // Load tilemap information
        this.load.image("tilemap_tiles", "tiles.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("depths-level", "depths-level.tmj");   // Tilemap in JSON
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tiles.png", {
            frameWidth: 8,
            frameHeight: 8
        });

        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
        // this.load.audio('coinAudio',['Collectibles_2.wav']);
        // this.load.audio('keyAudio',['Collectibles_6.wav']);
        this.load.audio('jumpAudio',['Bounce_3.wav']);
        this.load.image('walk1','Player_Knight_walk_0.png');
        this.load.image('walk2','Player_Knight_walk_1.png');
        this.load.image('walk3','Player_Knight_walk_2.png');
        this.load.image('walk4','Player_Knight_walk_3.png');
        this.load.image('idle1','Player_Knight_idle_0.png');
        this.load.image('idle2','Player_Knight_idle_1.png');
        this.load.image('idle3','Player_Knight_idle_2.png');
        this.load.image('idle4','Player_Knight_idle_3.png');
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: [
                {key: 'walk1'},
                {key: 'walk2'},
                {key: 'walk3'},
                {key: 'walk4', duration: 50 }
            ],
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [
                {key: 'idle1'},
                {key: 'idle2'},
                {key: 'idle3'},
                {key: 'idle4', duration: 50 }
            ],
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [
                { key: 'walk1' }
            ],

        });

         // ...and pass to the next Scene
         this.scene.start("Platformer");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}