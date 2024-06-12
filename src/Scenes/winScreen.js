class winScreen extends Phaser.Scene {
    constructor(){
        super("winScreen")
    }
    init(collectibles){
        this.collectibles = isNaN(collectibles) ? 0 : collectibles;
    }
    preload(){
        this.my = {sprite: {}, text: {}};
    }
    create(){
        let my = this.my;
        this.escKey = this.input.keyboard.addKey('ESC');
        this.cKey = this.input.keyboard.addKey('C');
        this.add.image(200,200, 'walk1').setScale(30);
        let win = this.add.bitmapText(660, 250, "rocketSquare", "You Win");
        let retry = this.add.bitmapText(570, 350, "rocketSquare", "Click to retry");
        let highscore = this.add.bitmapText(470, 550,"rocketSquare", "You collected  " + this.collectibles + "/3 dinos");
        let credits = this.add.bitmapText(520, 450, "rocketSquare", "Press C for Credits");
    }
    update(){
        let my = this.my;
        this.input.on('pointerdown', (pointer) =>{
            this.scene.start("Platformer");
        }
        )
        if(Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.scene.launch("titleScreen");
            this.scene.stop();
        }
        if(Phaser.Input.Keyboard.JustDown(this.cKey)) {
            this.scene.launch("creditScreen");
            this.scene.stop();
        }
    }
}