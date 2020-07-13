let game
const gameOptions = {
    fieldSize: 7,
    gemColors: 6,
    gemSize: 100,
    gemShadowSize: 72,
    swapSpeed: 200,
    fallSpeed: 100,
    destroySpeed: 200,
    score: 0,
    timer: 60
}
const HORIZONTAL = 1
const VERTICAL = 2
const fontFamily = '"Fredoka One", cursive'

window.onload = function () {
  game = new Phaser.Game({
    width: 1000,
    height: 700,
    scene: [
      loadGame,
      menuGame,
      playGame
    ]
  })
  window.focus()
  resize()
  window.addEventListener('resize', resize, false)
}

class loadGame extends Phaser.Scene {
  constructor() {
    super('loadGame')
  }

  preload() {
    //images
    this.load.image('background', 'images/backgrounds/background.jpg')
    this.load.image('btn-play', 'images/btn-play.png')
    this.load.image('logo', 'images/donuts_logo.png')
    this.load.image('time-up', 'images/text-timeup.png')
    this.load.image('score', 'images/bg-score.png')
    this.load.image('donut', 'images/donut.png')
    this.load.image('hand', 'images/game/hand.png')

    //anim
    this.load.spritesheet('boom', 'images/explosion.png', {frameWidth: 64, frameHeight: 64, endFrame: 23})

    //gem sprites
    for (let i = 0; i <= 5; i++) {
      let j = i + 1
      this.load.image('gem' + i, 'images/game/gem-0' + j + '.png', {
        frameWidth: gameOptions.gemSize,
        frameHeight: gameOptions.gemSize
      })
    }
    //shadows
    for (let i = 0; i <= 4; i++) {
      let j = i + 1
      this.load.spritesheet('gem_shadow-' + i, 'images/particles/particle-' + j + '.png', {
        frameWidth: gameOptions.gemShadowSize,
        frameHeight: gameOptions.gemShadowSize
      })
    }
    this.load.spritesheet('gem_shadow-5', 'images/particles/particle_ex1.png', {
      frameWidth: 62,
      frameHeight: 62
    })
    //loading line
    this.add.text(420, 480, 'LOADING...', {fontFamily: '"Roboto Condensed"', fontSize: '40px'})
    const loadingBar = this.add.graphics({
      fillStyle: {
        color: 0xffffff
      }
    })
    this.load.on('progress', percent => {
      loadingBar.fillRect(0, this.game.renderer.height * 0.8, this.game.renderer.width * percent, 20)
    })
  }

  create() {
    this.scene.start('menuGame', 'load complete')
  }
}

class menuGame extends Phaser.Scene {
  constructor() {
    super('menuGame')
  }

  create() {
    //fon and logo
    this.add.tileSprite(640, 480, 1280, 960, 'background')
    this.add.tileSprite(500, 150, 605, 225, 'logo')

    //buttons
    const playButton = this.add.tileSprite(500, 400, 286, 180, 'btn-play')

    //buttons play effect on hover
    playButton.setInteractive()
    playButton.on('pointerover', () => {
      playButton.setScale(1.02)
    })
    playButton.on('pointerout', () => {
      playButton.setScale(1)
    })
    playButton.on('pointerup', () => {
      this.scene.start('playGame', 'can play')
    })
  }
}

class playGame extends Phaser.Scene {
  constructor() {
    super('playGame')
  }

  create() {
    //margin left from gems
    const left = (gameOptions.fieldSize - 1) * gameOptions.gemSize + gameOptions.fieldSize * gameOptions.gemSize / 2.5
    this.gameOver = false
    this.timeUpdate = true
    this.add.tileSprite(640, 480, 1280, 960, 'background')
    //score image
    this.add.tileSprite(left, 100, 605, 225, 'score').setScale(0.8)
    this.drawField()
    this.selectedGem = null

    //check this to fix bag
    this.input.on('pointerdown', this.gemSelect, this)

    //game score
    this.Score = this.add.text(left - 20, 60, '0', {fontFamily, fontSize: '45px'})

    this.Timer = this.add.text(left - 125, 240, '0' + Math.floor(gameOptions.timer / 60) + ':' + (gameOptions.timer % 60), {
      fontFamily,
      fontSize: '70px',
      color: 'black'
    })

    this.timer_run = this.time.addEvent({
      delay: 1000,
      callback: this.timeRun,
      callbackScope: this,
      repeat: gameOptions.timer - 1,
      startAt: 0
    });
    this.gameStarted = true;
    this.canPick = true;
  }

  timeRun() {
    if (gameOptions.timer >= 0) {
      gameOptions.timer--
      this.sec = gameOptions.timer % 60
      this.min = Math.floor(gameOptions.timer / 60)
    }
  }

  timeUp() {
    if (gameOptions.timer === 0 && !this.gameOver) {
      this.canPick = false
      this.time.delayedCall(2000, this.drawEndScore, [], this)
      this.gameOver = true
    }
  }

  //end score in 2 sec after game end(2 sec wait to show the right score)
  drawEndScore() {
    this.canPick = false
    const scoreBard = this.add.graphics({
      fillStyle: {
        color: 0x525861
      }
    })
    scoreBard.fillRect(
      this.game.renderer.width / 5,
      this.game.renderer.height / 2,
      this.game.renderer.width / 1.7,
      150
    ).setDepth(10)
    this.add.tileSprite(540, 240, 464, 112, 'time-up').setScale(1.5).setDepth(10)
    this.add.text(this.game.renderer.width / 3, this.game.renderer.height / 2 + 20, 'Your core: ' + gameOptions.score, {
      fontFamily,
      fontSize: '50px'
    }).setDepth(15)
  }

  drawField() {
    this.gameArray = []
    this.gameShadowsArray = []
    this.poolArray = []
    this.gemGroup = this.add.group()
    this.gemShadowsGroup = this.add.group()

    this.gemsArray = ['gem0', 'gem1', 'gem2', 'gem3', 'gem4', 'gem5']
    this.gems_shadowArray = ['gem_shadow-0', 'gem_shadow-1', 'gem_shadow-2', 'gem_shadow-3', 'gem_shadow-4', 'gem_shadow-5']

    for (let i = 0; i < gameOptions.fieldSize; i++) {
      this.gameArray[i] = []
      this.gameShadowsArray[i] = []
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        do {
          const randomColor = Phaser.Math.Between(0, gameOptions.gemColors - 1)

          const gem = this.add.sprite(
            gameOptions.gemSize * j + gameOptions.gemSize / 2,
            gameOptions.gemSize * i + gameOptions.gemSize / 2,
            this.gemsArray[randomColor]
          ).setDepth(1)
          gem.visible = false

          const gem_shadow = this.add.sprite(
            gameOptions.gemSize * j + gameOptions.gemSize / 2 - 10,
            gameOptions.gemSize * i + gameOptions.gemSize / 2,
            this.gems_shadowArray[randomColor]
          ).setDepth(0)
          gem_shadow.setScale(1.5)
          gem_shadow.visible = false

          this.gemGroup.add(gem)
          this.gemShadowsGroup.add(gem_shadow)

          gem.setFrame(randomColor)
          gem_shadow.setFrame(randomColor)
          this.gameArray[i][j] = {
            gemColor: randomColor,
            gemSprite: gem,
            isEmpty: false
          }
          this.gameShadowsArray[i][j] = {
            gemColor: randomColor,
            gemSprite: gem_shadow,
            isEmpty: false
          }
        } while (this.isMatch(i, j))

        this.gameArray[i][j].gemSprite.visible = true
        this.gameShadowsArray[i][j].gemSprite.visible = true
      }
    }

    this.handleMatches()
  }

  update() {
    if (this.min > 0 && this.sec >= 10) {
      this.Timer.setText('0' + this.min + ':' + (this.sec - this.timer_run.getProgress().toString().substr(0, 2)))
    }

    if (this.min > 0 && this.sec < 10) {
      this.Timer.setText('0' + this.min + ':0' + (this.sec - this.timer_run.getProgress().toString().substr(0, 2)))
    }

    if (this.min <= 0 && this.sec >= 10) {
      this.Timer.setText('00:' + (this.sec - this.timer_run.getProgress().toString().substr(0, 2)))
    }

    if (this.min <= 0 && this.sec < 10 && this.timeUpdate) {
      this.Timer.setText('00:0' + (this.sec - this.timer_run.getProgress().toString().substr(0, 2)))
    }

    if (this.min === 0 && this.sec === 0 && this.timeUpdate) {
      this.Timer.setText('00:00')
      this.timeUpdate = false
    }

    this.timeUp()

    if (this.gameStarted) {
      for (let i = 0; i < gameOptions.fieldSize; i++) {
        for (let j = 0; j < gameOptions.fieldSize; j++) {
          this.gameShadowsArray[i][j].gemColor = this.gameArray[i][j].gemColor
          this.gameShadowsArray[i][j].gemSprite.setFrame(this.gameArray[i][j].gemColor)
          this.gameShadowsArray[i][j].gemSprite.setTexture('gem_shadow-' + this.gameArray[i][j].gemColor)
          this.gameShadowsArray[i][j].gemSprite.visible = true
          this.gameShadowsArray[i][j].gemSprite.x = this.gameArray[i][j].gemSprite.x - 10
          this.gameShadowsArray[i][j].gemSprite.y = this.gameArray[i][j].gemSprite.y
          this.gameShadowsArray[i][j].gemSprite.alpha = 1
          this.gameShadowsArray[i][j].isEmpty = false
        }
      }
    }
  }

  isMatch(row, col) {
    return this.isHorizontalMatch(row, col) || this.isVerticalMatch(row, col)
  }

  isHorizontalMatch(row, col) {
    return this.gemAt(row, col).gemColor === this.gemAt(row, col - 1).gemColor &&
      this.gemAt(row, col).gemColor === this.gemAt(row, col - 2).gemColor
  }

  isVerticalMatch(row, col) {
    return this.gemAt(row, col).gemColor === this.gemAt(row - 1, col).gemColor &&
      this.gemAt(row, col).gemColor === this.gemAt(row - 2, col).gemColor
  }

  gemAt(row, col) {
    if (row < 0 || row >= gameOptions.fieldSize || col < 0 || col >= gameOptions.fieldSize) {
      return -1
    }

    return this.gameArray[row][col]
  }

  gemSelect(pointer) {
    if (this.canPick) {
      const row = Math.floor(pointer.y / gameOptions.gemSize)
      const col = Math.floor(pointer.x / gameOptions.gemSize)
      const pickedGem = this.gemAt(row, col)

      if (pickedGem !== -1) {
        if (!this.selectedGem) {
          pickedGem.gemSprite.setScale(1.1)
          pickedGem.gemSprite.setDepth(1)
          this.selectedGem = pickedGem
        } else {
          if (this.areTheSame(pickedGem, this.selectedGem)) {
            this.selectedGem.gemSprite.setScale(1)
            this.selectedGem = null
          } else {
            if (this.areNext(pickedGem, this.selectedGem)) {
              this.selectedGem.gemSprite.setScale(1)
              this.swapGems(this.selectedGem, pickedGem, true)
            } else {
              this.selectedGem.gemSprite.setScale(1)
              pickedGem.gemSprite.setScale(1.1)
              this.selectedGem = pickedGem
            }
          }
        }
      }
    }
  }

  areTheSame(gem1, gem2) {
    return this.getGemRow(gem1) === this.getGemRow(gem2) && this.getGemCol(gem1) === this.getGemCol(gem2)
  }

  getGemRow(gem) {
    return Math.floor(gem.gemSprite.y / gameOptions.gemSize)
  }

  getGemCol(gem) {
    return Math.floor(gem.gemSprite.x / gameOptions.gemSize)
  }

  areNext(gem1, gem2) {
    return Math.abs(this.getGemRow(gem1) - this.getGemRow(gem2)) + Math.abs(this.getGemCol(gem1) - this.getGemCol(gem2)) === 1
  }

  swapGems(gem1, gem2, swapBack) {
    this.swappingGems = 2
    this.canPick = false
    const fromColor = gem1.gemColor
    const fromSprite = gem1.gemSprite
    const toColor = gem2.gemColor
    const toSprite = gem2.gemSprite
    const gem1Row = this.getGemRow(gem1)
    const gem1Col = this.getGemCol(gem1)
    const gem2Row = this.getGemRow(gem2)
    const gem2Col = this.getGemCol(gem2)
    this.gameArray[gem1Row][gem1Col].gemColor = toColor
    this.gameArray[gem1Row][gem1Col].gemSprite = toSprite
    this.gameArray[gem2Row][gem2Col].gemColor = fromColor
    this.gameArray[gem2Row][gem2Col].gemSprite = fromSprite

    this.tweenGem(gem1, gem2, swapBack)
    this.tweenGem(gem2, gem1, swapBack)
  }

  tweenGem(gem1, gem2, swapBack) {
    const row = this.getGemRow(gem1)
    const col = this.getGemCol(gem1)

    this.tweens.add({
      targets: this.gameArray[row][col].gemSprite,
      x: col * gameOptions.gemSize + gameOptions.gemSize / 2,
      y: row * gameOptions.gemSize + gameOptions.gemSize / 2,
      duration: gameOptions.swapSpeed,
      callbackScope: this,
      onComplete: function () {
        this.swappingGems--
        if (this.swappingGems === 0) {
          if (!this.matchInBoard() && swapBack) {
            this.swapGems(gem1, gem2, false)
          } else {
            if (this.matchInBoard()) {
              this.handleMatches()
            } else {
              this.canPick = true
              this.selectedGem = null
            }
          }
        }
      }.bind(this)
    })
  }

  matchInBoard() {
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        if (this.isMatch(i, j)) {
          return true
        }
      }
    }
    return false
  }

  handleMatches() {
    this.removeMap = []
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      this.removeMap[i] = []
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        this.removeMap[i].push(0)
      }
    }
    this.markMatches(HORIZONTAL)
    this.markMatches(VERTICAL)
    this.destroyGems()
  }

  drawScore() {
    this.Score.setText(gameOptions.score)
  }

  markMatches(direction) {
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      let colorStreak = 1
      let currentColor = -1
      let startStreak = 0
      let colorToWatch = 0
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        if (direction === HORIZONTAL) {
          colorToWatch = this.gemAt(i, j).gemColor
        } else {
          colorToWatch = this.gemAt(j, i).gemColor
        }
        if (colorToWatch === currentColor) {
          colorStreak++
        }

        if (colorToWatch !== currentColor || j === gameOptions.fieldSize - 1) {
          if (colorStreak >= 3) {
            gameOptions.score += colorStreak
            this.drawScore()

            for (let k = 0; k < colorStreak; k++) {
              if (direction === HORIZONTAL) {
                this.removeMap[i][startStreak + k]++
              } else {
                this.removeMap[startStreak + k][i]++
              }
            }
          }
          startStreak = j
          colorStreak = 1
          currentColor = colorToWatch
        }
      }
    }
  }

  destroyGems() {
    let destroyed = 0
    for (let i = 0; i < gameOptions.fieldSize; i++) {
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        if (this.removeMap[i][j] > 0) {
          destroyed++
          this.tweens.add({
            targets: this.gameArray[i][j].gemSprite,
            alpha: 0.5,
            duration: gameOptions.destroySpeed,
            callbackScope: this,
            onComplete: function () {
              destroyed--

              this.animationEffect(
                j * gameOptions.gemSize + gameOptions.gemSize / 2,
                i * gameOptions.gemSize + gameOptions.gemSize / 2
              )
              this.gameArray[i][j].gemSprite.visible = false
              this.poolArray.push(this.gameArray[i][j].gemSprite)
              if (destroyed === 0) {
                setTimeout(this.makeGemsFall.bind(this), 500)
                setTimeout(this.fillFields.bind(this), 500)
              }
            }.bind(this)
          })
          this.gameArray[i][j].isEmpty = true
        }
      }
    }
  }

  animationEffect(x, y) {
    this.anims.create({
      key: 'explode',
      frames: this.anims.generateFrameNumbers('boom', {start: 0, end: 24}),
      frameRate: 60,
      repeat: 0
    })
    this.add.sprite(x, y, 'boom').play('explode').setDepth(3)
  }

  makeGemsFall() {
    for (let i = gameOptions.fieldSize - 2; i >= 0; i--) {
      for (let j = 0; j < gameOptions.fieldSize; j++) {
        if (!this.gameArray[i][j].isEmpty) {
          const fallTiles = this.holesBelow(i, j)

          if (fallTiles > 0) {
            this.tweens.add({
              targets: this.gameArray[i][j].gemSprite,
              y: this.gameArray[i][j].gemSprite.y + fallTiles * gameOptions.gemSize,
              duration: gameOptions.fallSpeed * fallTiles
            })
            this.gameArray[i + fallTiles][j] = {
              gemSprite: this.gameArray[i][j].gemSprite,
              gemColor: this.gameArray[i][j].gemColor,
              isEmpty: false
            }
            this.gameArray[i][j].isEmpty = true
          }
        }
      }
    }
  }

  holesBelow(row, col) {
    let result = 0

    for (let i = row + 1; i < gameOptions.fieldSize; i++) {
      if (this.gameArray[i][col].isEmpty) {
        result++
      }
    }

    return result
  }

  fillFields() {
    let filled = 0
    this.canPick = false
    for (let j = 0; j < gameOptions.fieldSize; j++) {
      const emptySpots = this.holesInCol(j)
      if (emptySpots > 0) {
        for (let i = 0; i < emptySpots; i++) {
          filled++
          const randomColor = Phaser.Math.Between(0, gameOptions.gemColors - 1)
          this.gameArray[i][j].gemColor = randomColor
          this.gameArray[i][j].gemSprite = this.poolArray.pop()
          this.gameArray[i][j].gemSprite.setFrame(randomColor)
          this.gameArray[i][j].gemSprite.setTexture('gem' + randomColor)//правильна картинка
          this.gameArray[i][j].gemSprite.visible = true
          this.gameArray[i][j].gemSprite.x = gameOptions.gemSize * j + gameOptions.gemSize / 2
          this.gameArray[i][j].gemSprite.y = gameOptions.gemSize / 2 - (emptySpots - i) * gameOptions.gemSize
          this.gameArray[i][j].gemSprite.alpha = 1
          this.gameArray[i][j].isEmpty = false
          this.tweens.add({
            targets: this.gameArray[i][j].gemSprite,
            y: gameOptions.gemSize * i + gameOptions.gemSize / 2,
            duration: gameOptions.fallSpeed * emptySpots,
            callbackScope: this,
            onComplete: function () {
              filled--
              if (filled === 0) {
                if (this.matchInBoard()) {
                  this.time.addEvent({
                    delay: 250,
                    callback: this.handleMatches()
                  })
                } else {
                  this.canPick = true
                  this.selectedGem = null
                }
              }
            }.bind(this)
          })
        }
      }
    }
  }

  holesInCol(col) {
    let result = 0

    for (let i = 0; i < gameOptions.fieldSize; i++) {
      if (this.gameArray[i][col].isEmpty) {
        result++
      }
    }

    return result
  }
}

function resize() {
  const canvas = document.querySelector('canvas')
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const windowRatio = windowWidth / windowHeight
  const gameRatio = game.config.width / game.config.height

  if (windowRatio < gameRatio) {
    canvas.style.width = windowWidth + 'px'
    canvas.style.height = (windowWidth / gameRatio) + 'px'
  } else {
    canvas.style.width = (windowHeight * gameRatio) + 'px'
    canvas.style.height = windowHeight + 'px'
  }
}
