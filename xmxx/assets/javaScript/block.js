
cc.Class({
    extends: cc.Component,

    properties: {
        spf_block:{
            type:[cc.SpriteFrame],
            default:[]
        },
        node_xiaoChu:{
            type:cc.Node,
            default:null
        }
    },

    onLoad () {
        // var i_random = Math.floor(Math.random()*5) //0-4
        // this.init(i_random)
    },

    init:function(_type){
        this.blockType = _type //什么类型的元素块
        this.is_xiaoChu = false //是否该消除掉
        this.is_tiShi = false //是否提示
        this.is_chuiZi = false //是否要锤它
        this.is_biShua = false //是否笔刷它
        this.node_xiaoChu.active = false

        this.node.getComponent(cc.Sprite).spriteFrame = this.spf_block[this.blockType]
    },

    // //用笔刷改变它
    // gaiBian:function(num_type){
    //     this.blockType = num_type //什么类型的元素块
    //     this.node.getComponent(cc.Sprite).spriteFrame = this.spf_block[this.blockType]
    // },

    //可以消除了
    canXiaoChu:function(){
        this.is_xiaoChu = true
        this.node_xiaoChu.active = true
    },

    //取消消除操作
    quXiaoXiaoChu:function(){
        this.is_xiaoChu = false
        this.node_xiaoChu.active = false
    },

    //可以提示了
    canTiShi:function(){
        this.is_tiShi = true
        this.node_xiaoChu.active = true
    },

    //取消提示操作
    quXiaoTiShi:function(){
        this.is_tiShi = false
        this.node_xiaoChu.active = false
    },

    //要锤它了
    chuiZi:function(){
        this.is_chuiZi = true
        this.node_xiaoChu.active = true
    },

    //取消锤子
    quXiaoChuiZi:function(){
        this.is_chuiZi = false
        this.node_xiaoChu.active = false
    },

    //要画它了
    biShua:function(){
        this.is_biShua = true
        this.node_xiaoChu.active = true

        this.node.stopAllActions()
        this.node.scale = 1
        var act_1 = cc.scaleTo(0.4,0.6)
        var act_2 = cc.scaleTo(0.4,1)
        var act_3 = cc.sequence(act_1,act_2)
        var end = cc.repeatForever(act_3)
        this.node.runAction(end)
    },

    //取消笔刷
    quXiaoBiShua:function(){
        this.is_biShua = false
        this.node_xiaoChu.active = false
        this.node.stopAllActions()
        this.node.scale = 1
    },

    start () {

    },

    // update (dt) {},
});
