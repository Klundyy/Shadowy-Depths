class creditScreen extends Phaser.Scene {
    constructor(){
        super("creditScreen")
    }
    init(){
        
    }
    preload(){
    }
    create(){
        this.escKey = this.input.keyboard.addKey('ESC');
        let text1 = this.add.bitmapText(660, 250, "rocketSquare", "Credits").setScale(1.5);
        let text2 = this.add.bitmapText(540, 350, "rocketSquare", "Made by: William Klunder");
        let text3 = this.add.bitmapText(580, 450,"rocketSquare", "Assets: axolostudio, ");
        let text4 = this.add.bitmapText(420, 550, "rocketSquare", "egordorichev and Kenney Assets");
    }
    update(){
        let my = this.my;
        this.input.on('pointerdown', (pointer) =>{
            this.scene.launch("titleScreen");
            this.scene.stop();
        }
        )
        if(Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.scene.launch("titleScreen");
            this.scene.stop();
        }
    }
}