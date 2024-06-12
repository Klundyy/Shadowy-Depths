class titleScreen extends Phaser.Scene {
    constructor(){
        super("titleScreen")
    }
    init(){
        
    }
    preload(){
        this.load.setPath("./assets/");
        this.load.image('title','title.png');
    }
    create(){
        this.add.image(720,450,'title').setScale(1.4);
    }
    update(){
        let my = this.my;
        this.input.on('pointerdown', (pointer) =>{
            this.scene.launch("loadScene");
            this.scene.stop();
        }
        )
    }
}