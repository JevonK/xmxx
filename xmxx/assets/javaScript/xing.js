
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {},

    init:function(blockType){
        if (blockType == 0) {//蓝色
            this.node.color = new cc.Color(68,191,255)
        }else if (blockType == 1) {//绿色
            this.node.color = new cc.Color(102,202,28)
        }else if (blockType == 2) {//粉色
            this.node.color = new cc.Color(193,60,255)
        }else if (blockType == 3) {//红色
            this.node.color = new cc.Color(226,69,109)
        }else if (blockType == 4) {//黄色
            this.node.color = new cc.Color(255,184,12)
        }

        this.numRandom = Math.random()
        this.numSuDu = Math.random()*8
    },

    start () {

    },

    update (dt) {
        if (this.numRandom > 0.5) {//向右移动
            this.node.x = this.node.x + this.numSuDu
        }else{//向左移动
            this.node.x = this.node.x - this.numSuDu
        }
    },
});
