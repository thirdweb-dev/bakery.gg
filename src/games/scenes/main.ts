import { Scene, GameObjects, Cameras } from "phaser";
import { Character } from "../entities/character";

export class MainScene extends Scene {
  private cookieCountLabel!: GameObjects.Text;
  private cookie!: GameObjects.Sprite;
  private characters!: Character[] = new Array(5);
  private upgrades!: GameObjects.Sprite[] = new Array(5);
  private camera!: Cameras.Scene2D.Camera;
  private lastUpdateTime = 0;
  private cookieCount = 0;
  private cookiePerSecond = 1.0;
  private cookieClickReward = 1.0;

  init() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor("#24252A");
    this.scale.on("resize", this.resize, this);
  }

  preload() {
    this.load.image("goldcookie", "assets/goldcookie.png");
  }

  create() {
    this.lastUpdateTime = this.time.now;

    this.cookie = this.add
      .sprite(200, 200, "goldcookie")
      .setDisplaySize(64, 64)
      .setInteractive({ pixelPerfect: true })
      .on("pointerdown", this.onClickCookie, this);

    this.cookieCountLabel = this.add.text(0, 0, "", {
      fontFamily: "Rancho",
      fontSize: "24px",
    });

    this.createCharacters();
    this.createUpgrades();
  }

  createCharacters() {
    for (let i = 0; i < 5; i++) {
      this.characters[i] = new Character(this, 400, 200 + i * 72, {
        name: `Character #${i}`,
        texture: "goldcookie",
        cookiePerSecond: i,
        price: 1000 * i,
      });
    }
  }

  createUpgrades() {}

  update() {
    const now = this.time.now;
    const dt = (now - this.lastUpdateTime) / 1000;
    this.cookieCount += dt * this.cookiePerSecond;
    this.lastUpdateTime = now;
    this.cookieCountLabel.setText(
      `Cookie count: ${this.cookieCount.toFixed(2)}`,
    );
  }

  // event handlers
  onClickCookie() {
    this.cookieCount += this.cookieClickReward;
  }

  onClickCharacter(obj: GameObjects.Sprite) {
    console.log(obj);
  }

  resize(gameSize: GameObjects.Components.Size) {
    this.cameras.resize(gameSize.width, gameSize.height);
  }
}
