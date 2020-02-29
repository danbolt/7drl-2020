class StallCurve extends Phaser.Curves.Curve {
    constructor(x, y, pauseLength) {
        super('StallCurve');

        this.pausePos = new Phaser.Math.Vector2(x, y);
        this.pauseLength = pauseLength;
    };

    getLength() {
        return this.pauseLength;
    }

    getPoint(u, out) {
        return this.getPointAt(u, out);
    }

    getPointAt(u, out) {
        if (out === undefined) { out = new Phaser.Math.Vector2(); }
        out.x = this.pausePos.x;
        out.y = this.pausePos.y;
        return out;
    }

    fromJSON(payload) {
        this.type = payload.type;
        this.pausePos = new Phaser.Math.Vector2(payload.points[0], payload.points[1]);
        this.pauseLength = payload.length;
    }

    toJSON() {
        return {
            type: this.type,
            length: this.pauseLength,
            points: [this.pausePos.x, this.pausePos.y]
        };
    }
};