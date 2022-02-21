import { Scene, GameObjects, Cameras } from "phaser";

export class MainScene extends Scene {
  private helloLabel!: GameObjects.Text;
  private camera!: Cameras.Scene2D.Camera;
  private lastUpdateTime = 0;
  private cookieCount = 0;
  private cookiePerSecond = 1.0;

  init() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor("#24252A");
  }

  create() {
    const { centerX, centerY } = this.camera;
    this.lastUpdateTime = this.time.now;

    this.helloLabel = this.add.text(0, 0, "Hello World", {
      fontFamily: "Rancho",
      fontSize: "40px",
    });
  }

  update() {
    const now = this.time.now;
    const dt = (now - this.lastUpdateTime) / 1000;
    this.cookieCount += dt * this.cookiePerSecond;
    this.lastUpdateTime = now;
    this.helloLabel.setText(`Cookie count: ${this.cookieCount.toFixed(2)}`);
  }
}
