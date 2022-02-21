import { GameObjects, Scene } from "phaser";

export interface CharacterOptions {
  name: string;
  texture: string;
  cookiePerSecond: number;
  price: number;
}

const LABEL_FONT_SIZE = "12px";
export class Character extends GameObjects.Container {
  private options: CharacterOptions;
  private characterSprite!: GameObjects.Sprite;
  private nameLabel!: GameObjects.Text;
  private ownedLabel!: GameObjects.Text;
  private cookiePerSecondLabel!: GameObjects.Text;
  private priceLabel!: GameObjects.Text;
  private owned = 0;

  constructor(scene: Scene, x: number, y: number, options: CharacterOptions) {
    super(scene, x, y, []);
    this.options = options;

    this.create(scene);
    scene.add.existing(this);
  }

  private create(scene: Scene) {
    this.characterSprite = scene.add
      .sprite(this.x, this.y, this.options.texture)
      .setDisplaySize(60, 60)
      .setOrigin(0, 0)
      .setInteractive({ pixelPerfect: true })
      .on("pointerdown", this.onClickCharacter, this);

    this.nameLabel = scene.add
      .text(this.x + 72, this.y, this.options.name, {
        fontSize: LABEL_FONT_SIZE,
      })
      .setOrigin(0, 0);

    this.cookiePerSecondLabel = scene.add
      .text(
        this.x + 72,
        this.y + 16,
        `Cookie Per Second: ${this.options.cookiePerSecond}`,
        {
          fontSize: LABEL_FONT_SIZE,
        },
      )
      .setOrigin(0, 0);
    this.priceLabel = scene.add
      .text(this.x + 72, this.y + 32, `Price: ${this.options.price}`, {
        fontSize: LABEL_FONT_SIZE,
      })
      .setOrigin(0, 0);
    this.ownedLabel = scene.add
      .text(this.x + 72, this.y + 48, `Owned: ${this.owned}`, {
        fontSize: LABEL_FONT_SIZE,
      })
      .setOrigin(0, 0);
  }

  onClickCharacter(obj: GameObjects.Sprite) {
    console.log(obj);
  }

  // preUpdate(time, delta) {}
}
