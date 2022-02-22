import { GameObjects, Scene } from "phaser";
import { EVENT_COOKIE_CLICKED } from "../constants";

export interface CookieTier {
  texture: string;
  cookiePerSecond: number;
  cookiePerClick: number;
}

export interface CookieOptions {
  tiers: CookieTier[];
}

export class Cookie extends GameObjects.Container {
  private options: CookieOptions;
  private sprite!: GameObjects.Sprite;
  private activeTier = 0;

  constructor(scene: Scene, x: number, y: number, options: CookieOptions) {
    super(scene, x, y, []);
    this.options = options;

    this.create(scene);
    scene.add.existing(this);
  }

  private create(scene: Scene) {
    this.sprite = scene.add
      .sprite(this.x + 150, this.y, this.options.tiers[this.activeTier].texture)
      .setInteractive({ pixelPerfect: true })
      .on("pointerdown", this.onDown, this)
      .on("pointerup", this.onUp, this);
  }

  private onDown() {
    this.sprite.setScale(0.95);
    this.emit(EVENT_COOKIE_CLICKED, this.options.tiers[this.activeTier]);
  }

  private onUp() {
    this.sprite.setScale(1.0);
  }

  // preUpdate(time, delta) {}
}
