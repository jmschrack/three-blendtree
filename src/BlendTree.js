import { Plane, Vector2, Vector3,AnimationAction } from "three";


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


export class BlendTree2D {
    /**
     * 
     * @param {AnimationAction[]} actions 
     * @param {Vector2[]} thresholds An array of x,y pairs corresponding to the thresholds for each action
     */
    constructor(actions,thresholds){
        this.actions=actions;
        /** @type {Vector2[]} */
        this.thresholds=thresholds;
        /** @type {Vector2[][]} */
        this.pipj=[];
        this.calculateInfluenceVectors();
        actions.forEach((action, i) => {
            if (i > 0) {
                action.syncWith(this.actions[i - 1]);
            }
            action.play();

        })
    }
    calculateInfluenceVectors(){
        this.pipj=this.thresholds.map((pi,i)=>{
            return this.thresholds.map((pj,j)=>{
                if(i==j) return null;
                return this._convertToInfluenceVector(pi,pj);
            });
        });
        
    }
    /**
     * 
     * @param {Vector2} pi 
     * @param {Vector2} pj 
     * @returns 
     */
    _convertToInfluenceVector(pi,pj){
        const x=(pj.length()-pi.length())/((pj.length()+pi.length())/2);
        const y = signedAngleTo(pj,pi) * 2;
        return new Vector2(x,y);
    }
    /**
     * 
     * @param {Vector2} value 
     * @param {number} i 
     */
    _findInfluence(value,i){
        const pip=this._convertToInfluenceVector(this.thresholds[i],value);
        let hip=Number.MAX_VALUE;
        this.thresholds.forEach((t,j)=>{
            if(i==j) return;
            const pipj=this.pipj[i][j];
            const h=1-(pip.dot(pipj)/(pipj.length()*pipj.length()));
            hip=Math.min(hip,h);
        });
        return hip;
    }
    /**
     * 
     * @param {Vector2} value 
     */
    updateWeights(value){
        let sum=0;
        //bonus fun fact, did you know in most modern browsers, forEach is faster than for...of? 
        //for every animation action, calculate the influence for the given value to find the weight (also sum the weights for normalization)
        const hips=this.thresholds.map((t,i)=>{

            const infl = this._findInfluence(value,i)
            sum+=infl;
            return infl;
        });
        //normalize the weights
        this.actions.forEach((action,i)=>{
            action.setEffectiveWeight(Math.max(0,Math.min(1,hips[i]/sum)));
        });
    }
}



/**
 * 
 * @param {Vector3} u 
 * @param {Vector3} v 
 * @returns 
 */
function signedAngleTo(u, v) {
    // Get the signed angle between u and v, in the range [-pi, pi]
    const angle = u.angleTo(v);
    const normal =new Plane().setFromCoplanarPoints(new Vector3(), u, v).normal;
    return normal.z * angle;
}