import * as Phaser from "phaser.js";

class Game{
	constructor(){
		type: Phaser.AUTO,
		width: 800,
		height: 620,
		backgroundColor:0x000000,
		scene: {
			preload: preload,
			create: create,
			update: update,
		}
		this.game = new Phaser.Game(config);
	}
	preload(){}
	create(){}
	update(){}
	
}




module.exports = () => {Game}