

export class BlendTree1D {
    /**
     * NB: This also calls syncWith on the actions
     * @param {AnimationAction[]} actions 
     * @param {number[]} thresholds 
     * @param {boolean} overdrive Scale the timescale of the last animation to match values greater than the last threshold
     */
    constructor(actions, thresholds, overdrive = false) {
        /** @type {AnimationAction[]} */
        this.actions = actions;
        /** @type {number[]} */
        this.thresholds = thresholds;
        this.actions.forEach((action, i) => {
            if (i > 0) {
                action.syncWith(this.actions[i - 1]);
            }
            action.play();

        })
        this.overdrive = overdrive;
    }
    updateWeights(value) {
        this.actions.forEach((action, i) => {
            if (this.overdrive)
                action.setEffectiveTimeScale(1);
            const b = this.thresholds[i];
            if (value == b) return action.setEffectiveWeight(1);
            let a;
            if (value < this.thresholds[i]) {
                if (i == 0) {//if the value is less than the first threshold
                    action.setEffectiveWeight(1);
                    return;
                }
                a = this.thresholds[i - 1];
            } else if (i == this.thresholds.length - 1) {//if the value is greater than the last threshold
                action.setEffectiveWeight(1);
                if (this.overdrive) {
                    action.setEffectiveTimeScale(value / this.thresholds[i]);
                }
                return;
            } else {//if the value is greater than the threshold
                a = this.thresholds[i + 1];
            }
            action.setEffectiveWeight(InverseLerp(a, b, value));
        });
    }
    
}


function InverseLerp(a, b, v) {
    if (a == b) return 1;
    let t = (v - a) / (b - a);
    return Math.max(0, t);
}