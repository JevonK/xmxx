
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // onLoad () {},

    init:function(numScore,f_time,posEnd){
        this.node.getComponent(cc.Label).string = numScore
        var act_1 = cc.moveTo(f_time,posEnd)
        var act_2 = cc.scaleTo(f_time,0.5)
        var act_3 = cc.spawn(act_1,act_2)
        var act_4 = cc.callFunc(function(){
            this.node.removeFromParent()
            cc.xiaobai.game.addScore(numScore)
        },this)
        var end = cc.sequence(act_3,act_4)
        this.node.runAction(end)
    }

    // update (dt) {},
});
