export default class Score {
  constructor(player, strokes, hole) {
    this.player = player;
    this.strokes = strokes;
    this.hole = hole;
  }

  isValid() {
    return this.player && Number.isInteger(this.strokes) && Number.isInteger(this.hole);
  }
}