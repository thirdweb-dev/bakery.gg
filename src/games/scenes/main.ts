import { Scene, GameObjects, Cameras } from "phaser";

export class MainScene extends Scene {
  private cookieCountLabel!: GameObjects.Text;
  private cookie!: GameObjects.Sprite;
  private camera!: Cameras.Scene2D.Camera;
  private lastUpdateTime = 0;
  private cookieCount = 0;
  private cookiePerSecond = 1.0;
  private cookieClickReward = 100.0;

  init() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor("#24252A");
    this.scale.on("resize", this.resize, this);

    this.load.image("cookie", "assets/goldcookie.png");
  }

  create() {
    this.lastUpdateTime = this.time.now;

    this.cookie = this.add
      .sprite(200, 200, "cookie")
      .setInteractive({ pixelPerfect: true })
      .on("pointerdown", this.onClickCookie, this);

    this.cookieCountLabel = this.add.text(0, 0, "Hello World", {
      fontFamily: "Rancho",
      fontSize: "24px",
    });
  }

  update() {
    const now = this.time.now;
    const dt = (now - this.lastUpdateTime) / 1000;
    this.cookieCount += dt * this.cookiePerSecond;
    this.lastUpdateTime = now;
    this.cookieCountLabel.setText(
      `Cookie count: ${this.cookieCount.toFixed(2)}`,
    );
  }

  onClickCookie() {
    this.cookieCount += this.cookieClickReward;
  }

  resize(gameSize: GameObjects.Components.Size) {
    this.cameras.resize(gameSize.width, gameSize.height);
  }
}
