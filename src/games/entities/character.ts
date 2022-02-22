import { GameObjects, Scene } from "phaser";
import { EVENT_CHARACTER_CLICKED } from "../constants";

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
    this.characterSprite = this.scene.add
      .sprite(0, 0, this.options.texture)
      .setScale(0.2, 0.2)
      .setDisplayOrigin(0, 0)
      .setInteractive()
      .on("pointerdown", this.onClickCharacter, this);

    this.nameLabel = scene.add.text(72, 0, this.options.name, {
      fontSize: LABEL_FONT_SIZE,
    });

    this.cookiePerSecondLabel = scene.add.text(
      72,
      16,
      `Cookie Per Second: ${this.options.cookiePerSecond}`,
      {
        fontSize: LABEL_FONT_SIZE,
      },
    );

    this.priceLabel = scene.add.text(72, 32, `Price: ${this.options.price}`, {
      fontSize: LABEL_FONT_SIZE,
    });

    this.ownedLabel = scene.add.text(72, 48, `Owned: ${this.owned}`, {
      fontSize: LABEL_FONT_SIZE,
    });

    this.add([
      this.characterSprite,
      this.nameLabel,
      this.cookiePerSecondLabel,
      this.priceLabel,
      this.ownedLabel,
    ]);
  }

  onClickCharacter() {
    // TODO: in the scene calls, subscribe to the events, then add new spawned characters to the scene.
    console.log(EVENT_CHARACTER_CLICKED, this);
  }

  // preUpdate(time, delta) {}
}
