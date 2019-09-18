import * as Phaser from "phaser"

(function(){
	let size;
	let game;
	let angle = 0;
	let colorGemMass = new Array(5);
	let selectedDonuts=[];
	let sameDonuts=[];
	let check;
function main(){
	let config = {
		type: Phaser.AUTO,
		width: size,
		height: size,
		scene: {
			preload: preload,
			create: create,
			update: update,
		}, 
		physics:{
			default: "arcade",
			arcade: { 
				debug: false
			}
		}, 
	}
	game = new Phaser.Game(config);
};

   

function preload(){
	let canvas = document.getElementsByTagName("canvas")[0];
	//console.log(canvas.width, canvas.height); 

	this.load.image("background", "./static/images/backgrounds/background.jpg");
	this.load.image("player", "./static/images/game/hand.png");

	this.load.image("gem_0", "./static/images/game/gem-01.png");
	this.load.image("gem_1", "./static/images/game/gem-02.png");
	this.load.image("gem_2", "./static/images/game/gem-03.png");
	this.load.image("gem_3", "./static/images/game/gem-04.png");
	this.load.image("gem_4", "./static/images/game/gem-05.png");
	this.load.image("gem_5", "./static/images/game/gem-06.png"); 
	this.load.image("shadow_gem", "./static/images/big-shadow.png");
	this.load.image("light_gem", "./static/images/big-light.png");  
	this.load.image("score", "./static/images/bg-score.png"); 
	this.load.image("music", "./static/images/btn-sfx.png"); 

};
function create(){ 
	let countGem = 8;
	let canvas = document.getElementsByTagName("canvas")[0];
	let width = canvas.width;
	let height = canvas.height;
	let offsetX = width/8;
	let offsetY = height/4;	
	
	let marginX = width/16;
	let marginY = height/24;

	let offserForInput = height/12;
	let ii = 0;	
	this.shadowGem = [];
	//colorGemMass = this.physics.add.group();

	this.background = this.add.sprite(0,0,"background");
	this.background.setDisplaySize(width*2, height*2);

	this.score = this.add.sprite(marginX, offserForInput,"score");
	this.score.setDisplaySize(width/4, height/6);
 
	for(let i=0; i<5; i++){
		colorGemMass[i] = new Array(5);
		for(let j=0; j<5; j++){
			let weight = Phaser.Math.Between(0, 5);
			let name = "gem_"+ weight; 
			let x = ((marginX + width /countGem) * j) + offsetX;
			let y = ((marginY + height/countGem) * i) + offsetY; 
			//this.shadowGem = this.add.sprite(x,y,"shadow_gem"); 

			this.someGem = this.add.sprite(x,y,name); 
			this.someGem.weight=(weight+10); 
			this.someGem.row = i;
			this.someGem.col = j;
 			this.someGem.id = ii++;
		 	this.someGem.setInteractive();﻿ 
		    this.someGem.on('pointerdown', function(event) {
		    	console.log("id: ", this.id, "row: ", this.row, "col: ", this.col, "weight: ", this.weight) 
		    	doSelect(this); 
		    });
		    //console.log("-----------------------------");
		    console.log("id: ", this.someGem.id, "row: ", this.someGem.row, "col: ", this.someGem.col, "weight: ", this.someGem.weight) 
		    colorGemMass[i][j] = this.someGem;

		}
	}
	
	this.player = this.add.sprite(this.game.input.mousePointer.x,this.game.input.mousePointer.y,"player"); 
 	this.player.setDisplaySize(width/16, height/15);
 
};  
function update(){
	this.player.x = this.game.input.mousePointer.x;
	this.player.y = this.game.input.mousePointer.y;
	angle += 1.5;
	if(angle >= 360)angle = 0; 
	if(check){
		selectedDonuts[0].angle = angle;
	}  
};



 
function doSelect(element){  
	selectedDonuts.push(element); 
	check = true;
	//console.log(selectedDonuts);
 	if(selectedDonuts.length === 2){
 		console.log(...selectedDonuts)
 		if(selectedDonuts[0].row === selectedDonuts[1].row && 
 			Math.abs(selectedDonuts[0].col - selectedDonuts[1].col) === 1){ 
 			changePos( );
			changeRowCol( );
//			changeWeight(...selectedDonuts); 
//			 checkGems();
 		}
		else if(selectedDonuts[0].col === selectedDonuts[1].col && 
 			Math.abs(selectedDonuts[0].row - selectedDonuts[1].row ) === 1){ 
 			changePos( );
			changeRowCol( );
//			changeWeight(...selectedDonuts); 
//			checkGems();
 		}
		check = false;
		selectedDonuts.length=0; 
 	}
}
function changePos( ){ 
	console.log("-----------------------------");

	let firstPosX = selectedDonuts[0].x;
	let firstPosY = selectedDonuts[0].y;

	let secondPosX = selectedDonuts[1].x;
	let secondPosY = selectedDonuts[1].y;



	colorGemMass[selectedDonuts[0].row][selectedDonuts[0].col].x = secondPosX;
	colorGemMass[selectedDonuts[0].row][selectedDonuts[0].col].y = secondPosY;

	colorGemMass[selectedDonuts[1].row][selectedDonuts[1].col].x = firstPosX;
	colorGemMass[selectedDonuts[1].row][selectedDonuts[1].col].y = firstPosY; 

 
/*	console.log("1. selectedDonuts X", selectedDonuts[0].x,"selectedDonuts Y", selectedDonuts[0].y);
	console.log("2. selectedDonuts X", selectedDonuts[1].x,"selectedDonuts Y", selectedDonuts[1].y);
	console.log("X",colorGemMass[selectedDonuts[0].row][selectedDonuts[0].col].x, "Y", colorGemMass[selectedDonuts[0].row][selectedDonuts[0].col].y);
	console.log("X",colorGemMass[selectedDonuts[1].row][selectedDonuts[1].col].x, "Y", colorGemMass[selectedDonuts[1].row][selectedDonuts[1].col].y);
*/
/*
	colorGemMass[element1.col][element1.row].x = secondPosX;
	colorGemMass[element1.col][element1.row].y = secondPosY;

	colorGemMass[element2.col][element2.row].x = firstPosX;
	colorGemMass[element2.col][element2.row].y = firstPosY; 
*/
}
 
function changeRowCol(){  
	
	let firstRow = selectedDonuts[0].row;
	let firstCol = selectedDonuts[0].col;

	let secondRow = selectedDonuts[1].row;
	let secondCol = selectedDonuts[1].col;

	colorGemMass[selectedDonuts[0].row][selectedDonuts[0].col].row = secondRow;
	colorGemMass[selectedDonuts[0].row][selectedDonuts[0].col].col = secondCol;

	colorGemMass[selectedDonuts[1].row][selectedDonuts[1].col].row = firstRow;
	colorGemMass[selectedDonuts[1].row][selectedDonuts[1].col].col = firstCol;  
/*
	colorGemMass[element1.col][element1.row].row = secondRow;
	colorGemMass[element1.col][element1.row].col = secondCol;

	colorGemMass[element2.col][element2.row].row = firstRow;
	colorGemMass[element2.col][element2.row].col = firstCol;  
*/
	//console.log("firstRow ", firstRow, "firstCol ", firstCol)
	//console.log("Row ", colorGemMass[firstRow][firstCol].row, "Col ", colorGemMass[firstRow][firstCol].col)
	//console.log("x ", selectedDonuts[0].x, "y ", selectedDonuts[0].y)
} 
function changeWeight(element1, element2){  
	let firstWeight = selectedDonuts[0].weight;
	let secondWeight = selectedDonuts[1].weight;

	selectedDonuts[0].weight = secondWeight;
	selectedDonuts[1].weight = firstWeight;

	colorGemMass[element1.row][element1.col].weight = secondWeight; 
	colorGemMass[element2.row][element2.col].weight = firstWeight; 
/*
	colorGemMass[element1.col][element1.row].weight = secondWeight; 
	colorGemMass[element2.col][element2.row].weight = firstWeight;  
*/
}

function checkGems(){  
    for (let i = 0; i < colorGemMass.length; i++) {
        let numBlocs = 1;
        let weight = colorGemMass[i][0].weight;
        for (let j = 1; j < colorGemMass[i].length; j++) {
        	//console.log("el: ", colorGemMass[i][j].id,"row: ", colorGemMass[i][j].row,"col: ", colorGemMass[i][j].col,"weight: ", colorGemMass[i][j].weight);
            if (weight === colorGemMass[i][j].weight) {
                numBlocs++;
            } else if ((weight !== colorGemMass[i][j].weight) && numBlocs > 2) {
                for (let r = 0; r < numBlocs; r++) {
                	console.log("row: ",colorGemMass[i][j - r - 1].row, "col: ", colorGemMass[i][j - r - 1].col,"weight: ", colorGemMass[i][j - r - 1].weight);
                	colorGemMass[i][j - r - 1].destroy(true);
                } 
                numBlocs = 1;
                weight = colorGemMass[i][j].weight;
            } else {
                numBlocs = 1;
                weight = colorGemMass[i][j].weight;
            }
        } 
        if (numBlocs > 2) {
            for (let r = 0; r < numBlocs; r++) {
            	console.log("row: ",colorGemMass[i][j - r - 1].row, "col: ", colorGemMass[i][j - r - 1].col,"weight: ", colorGemMass[i][j - r - 1].weight);
                colorGemMass[i][colorGemMass[i].length - r - 1].destroy(true);
            }
        }
    }
/*
    for (let i = 0; i < colorGemMass.length; i++) {
        let numBlocs = 1;
        let weight = colorGemMass[0][i].weight;
        for (let j = 1; j < colorGemMass[i].length; j++) {
            if (weight === colorGemMass[j][i].weight) {
                numBlocs++;
            } else if ((weight !== colorGemMass[i].weight) && numBlocs > 2) {
                for (let r = 0; r < numBlocs; r++) {
                    colorGemMass[j - r - 1][i].destroy(true);
                } 
                numBlocs = 1;
                weight = colorGemMass[j][i].weight;
            } else {
                numBlocs = 1;
                weight = colorGemMass[j][i].weight;
            }
        }  
        if (numBlocs > 2) {
            for (let r = 0; r < numBlocs; r++) {
                colorGemMass[colorGemMass.length - r - 1][i].destroy(true);
            }
        }
    }
*/ 
    console.log("check end"); 
} 









window.onload = function(){
	if(window.innerWidth > window.innerHeight){ 
		size = window.innerHeight;
	} else{
		size = window.innerWidth;
	}
	main();
}
window.onresize = function(){ 
	let canvas = document.getElementsByTagName("canvas")[0];
	if(window.innerWidth > window.innerHeight){ 
		size = window.innerHeight;
	}else{ 
		size = window.innerWidth;
	}
	main();
}

})()
