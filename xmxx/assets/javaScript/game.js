
cc.Class({
    extends: cc.Component,

    properties: {
        layerReady:{
            type:cc.Node,
            default:null
        },
        layerGame:{
            type:cc.Node,
            default:null
        },
        layerZanTing:{
            type:cc.Node,
            default:null
        },
        layerFaild:{
            type:cc.Node,
            default:null
        },
        prefab_block:{
            type:cc.Prefab,
            default:null
        },
        prefab_xing:{
            type:cc.Prefab,
            default:null
        },
        prefab_blockScore:{ //元素块的分数
            type:cc.Prefab,
            default:null
        },
        block_parent:{
            type:cc.Node,
            default:null
        },
        xingXing_parent:{
            type:cc.Node,
            default:null
        },
        tx_chuiZi:{
            type:cc.Node,
            default:null
        },
        tx_biShua:{
            type:cc.Node,
            default:null
        },
        bg_btn_biShu:{
            type:cc.Node,
            default:null
        },
        node_bestScore:{
            type:cc.Node,
            default:null
        },
        audio_sound:{
            type:[cc.AudioClip],
            default:[]
        },
    },

    onLoad () {
        console.log('wx:cocoscreator_666');
        console.log('QQ:2504549300');

        if(cc.xiaobai == null){
            cc.xiaobai = {}
        }
        cc.xiaobai.game = this

        //window.game = this

        this.layerReady.active = true
        this.layerGame.active = false
        this.layerZanTing.active = false
        this.layerFaild.active = false

        this.is_sound = true
        this.shuaXinSoundBtn()

        this.time_tiShi = 0 //用于提示计时
        this.num_block_wh = 64
        this.num_jianGe = 2
        this.num_w = 10 //宽
        this.num_h = 10 //高
        this.gameType = 0//0:游戏开始前 1：正在游戏中  2：游戏结束
        this.numLevel = 1 //第几关
        this.numScore_curr = 0 //当前分数

        this.node_scoreCurr = this.layerGame.getChildByName('label_scoreCurr')
        this.node_lianXiao = this.layerGame.getChildByName('label_lianXiao')
        this.node_good = this.layerGame.getChildByName('node_good')
        this.node_success = this.layerGame.getChildByName('node_success')

         //声明二维数组
         this.arr_blocks = []
         for(let i = 0; i < this.num_h; i++){
             this.arr_blocks[i] = []
         }

        this.setParent()

        this.setTouch()

        //目标分数数组
        this.arrMuBiao = [0,1000,3000,5500,7500,9500,11500,14000,9999999]

        //cc.sys.localStorage.removeItem('userData_xmxx')
        this.userData = JSON.parse(cc.sys.localStorage.getItem('userData_xmxx'))
        this.saveUserData()
        this.shuaXinBestScore()

        {//设备分辨率
            var fbl_sheBei = cc.director.getWinSizeInPixels()
            console.log('宽：'+fbl_sheBei.width + ' 高：'+fbl_sheBei.height);

            var f_scale = fbl_sheBei.width / 720.0
            this.block_parent.scale = f_scale * 720.0 / this.block_parent.width
            this.xingXing_parent.scale = f_scale * 720.0 / this.block_parent.width
            this.bg_btn_biShu.scale = f_scale
        }
        
    },

    //刷新最高分数
    shuaXinBestScore:function(){
        if (this.userData.num_score_best) {
            this.node_bestScore.getComponent(cc.Label).string = this.userData.num_score_best
        }
    },

    //设置元素块和星星的父节点
    setParent:function(){
        this.block_parent.width = (this.num_block_wh+this.num_jianGe) * this.num_w+this.num_jianGe
        this.block_parent.height = (this.num_block_wh+this.num_jianGe) * this.num_h+this.num_jianGe
        this.block_parent.y = -640 + this.block_parent.height / 2 + 105

        this.xingXing_parent.width = this.block_parent.width
        this.xingXing_parent.height = this.block_parent.height
        this.xingXing_parent.y = this.block_parent.y
    },

    //屏幕触摸
    setTouch:function(){
        this.block_parent.on('touchstart', function (event) {
            if (this.gameType != 1) {
                return
            }
            if (this.is_moveing) {
                return
            }
            var pos_start_world = event.getLocation()
            var pos_start_node = this.block_parent.convertToNodeSpaceAR(pos_start_world)
            console.log('pos_start_node:' + pos_start_node);
            
            var children = this.block_parent.children
            for (let i = 0; i < children.length; i++) {
                var rect_block = children[i].getBoundingBox()
                if(rect_block.contains(pos_start_node)){
                    
                    console.log('选中了：' + i);
                    this.time_tiShi = 0
                    this.quXiaoTiShi()
                    if (this.tx_chuiZi.active) {//有锤子特效

                        var js_block =  children[i].getComponent('block')
                        if(js_block.is_chuiZi){

                            this.tx_chuiZi.active = false
                            var pos_block = children[i].getPosition()
                            var blockType = children[i].getComponent('block').blockType
                            for (let i = 0; i < 3; i++) {
                                this.createXing(pos_block,blockType)
                            }
                            children[i].removeFromParent()
                            this.shuaXinArr()
                            this.moveBlocks_down()
                            return
                        }
                        this.quXiaoChuiZi()
                        var pos_touch = children[i].getPosition()
                        this.tx_chuiZi.x = pos_touch.x + 20
                        this.tx_chuiZi.y = pos_touch.y
                        js_block.chuiZi()
                        
                        return
                    }else if (this.tx_biShua.active) {//有笔刷特效

                        if (this.isShuaing) {
                            return
                        }
                        var js_block =  children[i].getComponent('block')
                        if(js_block.is_biShua){

                            return
                        }
                        this.quXiaoBiShua()
                        this.tx_biShua.stopAllActions()
                        
                        var pos_touch = children[i].getPosition()
                        this.tx_biShua.x = pos_touch.x + 15
                        this.tx_biShua.y = pos_touch.y + 45
                        
                        var act_1 = cc.moveBy(0.2,0,20)
                        var act_2 = cc.moveBy(0.2,0,-20)
                        var act_3 = cc.sequence(act_1,act_2)
                        var end = cc.repeatForever(act_3)
                        this.tx_biShua.runAction(end)
                        children[i].getComponent('block').biShua()
                        var block_type = children[i].getComponent('block').blockType
                        this.shuaXinBgBiShua(block_type)
                        
                        return
                    }

                    this.touchOne(i)

                    var num_xiaoChuGeShu = 0 //消除块的个数
                    var children_j = this.block_parent.children
                    for (let j = 0; j < children_j.length; j++) {
                        var js_block = children_j[j].getComponent('block')
                        if (js_block.is_xiaoChu) {
                            num_xiaoChuGeShu++
                        }
                    }
                    if (num_xiaoChuGeShu > 1) {//可以消除
                        this.is_moveing = true
                        if(this.is_sound){
                            cc.audioEngine.play(this.audio_sound[1], false, 1);
                        }
                       
                        this.xiaoChuBlocks()
                        {//连消动画
                            this.node_lianXiao.opacity = 255
                            this.node_lianXiao.stopAllActions()
                            this.node_lianXiao.scale = 0

                            var numFenShu = 0
                            for (let i = 0; i < num_xiaoChuGeShu; i++) {
                                numFenShu = numFenShu + 5 + 10 * i
                            }
                            this.node_lianXiao.getComponent(cc.Label).string = num_xiaoChuGeShu + '连消' + numFenShu + '分'

                            var act_1 = cc.scaleTo(0.2,1)
                            var act_2 = cc.fadeOut(2)
                            var end = cc.sequence(act_1,act_2)
                            this.node_lianXiao.runAction(end)
                        }
                        if (num_xiaoChuGeShu >= 6) {//good动画
                            if(this.is_sound){
                                cc.audioEngine.play(this.audio_sound[0], false, 1);
                            }
                            this.node_good.opacity = 255
                            this.node_good.stopAllActions()
                            this.node_good.scale = 0
                            var children = this.node_good.children
                            var i_random = Math.floor(Math.random() * children.length)
                            for (let i = 0; i < children.length; i++) {
                                if (i == i_random) {
                                    children[i].active = true
                                }else{
                                    children[i].active = false
                                }
                            }
                            var act_1 = cc.scaleTo(0.2,1)
                            var act_2 = cc.blink(0.5,5)
                            var act_3 = cc.fadeOut(1.5)
                            var end = cc.sequence(act_1,act_2,act_3)
                            this.node_good.runAction(end)
                        }
                    }else{
                        var js_block = children[i].getComponent('block')
                        js_block.quXiaoXiaoChu()
                    }

                    this.shuaXinArr()
                    this.moveBlocks_down()
                }
            }

        }, this);

        // this.block_parent.on('touchmove', function (event) {
        //     console.log('touchmove');
        // }, this);

        // this.block_parent.on('touchend', function (event) {
        //     console.log('touchend');
        // }, this);
    },

    //保存数据到本地
    saveUserData:function(){
        if (!this.userData) {
            this.userData = {
                arr_blocks_save: [],//元素块的二维数组
                num_level_save: 1,//当前关卡
                num_score_save: 0,//当前分数
                num_score_fh: 0,//复活分数
                num_score_best: 0,//最高分数
            };
        }
        cc.sys.localStorage.setItem('userData_xmxx', JSON.stringify(this.userData));
    },

    //开始前动画
    actStart:function(){
        this.gameType = 0
        this.is_moveing = false //元素块是否在移动中
        
        this.layerGame.getChildByName('btn_zanTing').active = true
        this.node_success.active = false
        this.node_good.opacity = 0
        this.node_lianXiao.opacity = 0
        var node_guanQia = this.layerGame.getChildByName('label_guanQia')
        var node_muBiao = this.layerGame.getChildByName('label_muBiao')
        var node_guanQia_2 = this.layerGame.getChildByName('label_guanQia_2')
        var node_muBiao_2 = this.layerGame.getChildByName('label_muBiao_2')

        {
            var act_1 = cc.blink(2,8)
            node_muBiao.runAction(act_1)
        }

        this.saveUserData()

        if (this.userData.num_level_save) {
            this.numLevel = this.userData.num_level_save
        }else{
            this.numLevel = 1
        }

        if (this.userData.num_score_save) {
            this.numScore_curr = this.userData.num_score_save
        }else{
            this.numScore_curr = 0
        }

        if (this.numLevel == 1) {
            this.userData.num_score_fh = 0
            this.saveUserData()
        }

        node_guanQia.getComponent(cc.Label).string = '关卡：' + this.numLevel
        node_guanQia_2.getComponent(cc.Label).string = '关卡 ' + this.numLevel
        node_muBiao.getComponent(cc.Label).string = '目标：' + this.arrMuBiao[this.numLevel]
        node_muBiao_2.getComponent(cc.Label).string = '目标分数 ' + this.arrMuBiao[this.numLevel]

        this.node_scoreCurr.getComponent(cc.Label).string = this.numScore_curr

    
        this.tx_chuiZi.active = false
        this.tx_biShua.active = false
        this.bg_btn_biShu.active = false

        this.block_parent.removeAllChildren()

        if (this.userData.arr_blocks_save.length > 0) {
            this.createBlocksByBenDi()
            this.shuaXinArr()
            this.gameType = 1
            this.time_tiShi = 0
            return
        }

        node_guanQia_2.x = 528
        node_muBiao_2.x = 528

        {
            var act_1 = cc.moveTo(0.5,0,node_guanQia_2.y).easing(cc.easeCubicActionOut())//越来越慢
            var act_2 = cc.delayTime(1.5)
            var act_3 = cc.moveTo(0.3,-528,node_guanQia_2.y)
            var end = cc.sequence(act_1,act_2,act_3)
            node_guanQia_2.runAction(end)
        }

        {
            var act_1 = cc.delayTime(0.5)
            var act_2 = cc.moveTo(0.5,0,node_muBiao_2.y).easing(cc.easeCubicActionOut())//越来越慢
            var act_3 = cc.delayTime(1)
            var act_4 = cc.moveTo(0.3,-528,node_muBiao_2.y)
            var end = cc.sequence(act_1,act_2,act_3,act_4)
            node_muBiao_2.runAction(end)
        }

        this.createBlocks()
        this.shuaXinArr()
        
        var children = this.block_parent.children
        for (let i = 0; i < children.length; i++) {
            children[i].y = children[i].y + 1500
            var act_1 = cc.delayTime(2.3)
            var act_2 = cc.moveBy(0.5+i*0.008,0,-1500)
            var act_3 = cc.sequence(act_1,act_2)
            children[i].runAction(act_3)
        }

        var f_bigTime = 2.3 + 0.5+0.008*(children.length - 1)

        this.scheduleOnce(function(){
            this.gameType = 1
            this.time_tiShi = 0
        },f_bigTime+0.02)

    },

    //取消所有元素块的锤子
    quXiaoChuiZi:function(){
        var children = this.block_parent.children
        for (let i = 0; i < children.length; i++) {
            children[i].getComponent('block').quXiaoChuiZi()
        }
    },

    //取消所有元素块的笔刷
    quXiaoBiShua:function(){
        var children = this.block_parent.children
        for (let i = 0; i < children.length; i++) {
            children[i].getComponent('block').quXiaoBiShua()
        }
    },

    //点中的块 
    touchOne:function(touchOne){
        var children = this.block_parent.children
        var i_touch = touchOne
        children[i_touch].getComponent('block').canXiaoChu()
        var pos_touch = children[i_touch].getPosition()
        var num_type_touch = children[i_touch].getComponent('block').blockType

        var arr_touch = []
        var children_j = this.block_parent.children
        for (let j = 0; j < children_j.length; j++) {
            if (i_touch == j) {
                continue
            }
            var pos_j = children_j[j].getPosition()
            var f_juLi = (pos_touch.x-pos_j.x)*(pos_touch.x-pos_j.x) + (pos_touch.y-pos_j.y)*(pos_touch.y-pos_j.y)
            f_juLi = Math.sqrt(f_juLi)
            if (f_juLi <= this.num_block_wh + this.num_jianGe + 10) {
                var num_type_j = children_j[j].getComponent('block').blockType
                if (num_type_touch == num_type_j) {
                    if (children_j[j].getComponent('block').is_xiaoChu) {
                        continue
                    }
                    children_j[j].getComponent('block').canXiaoChu()
                    arr_touch.push(j)
                }
            }
        }

        for (let i = 0; i < arr_touch.length; i++) {
            this.touchOne(arr_touch[i])
        }
    },

    //点击某一元素块 
    touchOneTiShi:function(touchOne){
        var children = this.block_parent.children
        var i_touch = touchOne
        children[i_touch].getComponent('block').canTiShi()
        var pos_touch = children[i_touch].getPosition()
        var num_type_touch = children[i_touch].getComponent('block').blockType

        var arr_touch = []
        var children_j = this.block_parent.children
        for (let j = 0; j < children_j.length; j++) {
            if (i_touch == j) {
                continue
            }
            var pos_j = children_j[j].getPosition()
            var f_juLi = (pos_touch.x-pos_j.x)*(pos_touch.x-pos_j.x) + (pos_touch.y-pos_j.y)*(pos_touch.y-pos_j.y)
            f_juLi = Math.sqrt(f_juLi)
            if (f_juLi <= this.num_block_wh + this.num_jianGe + 10) {
                var num_type_j = children_j[j].getComponent('block').blockType
                if (num_type_touch == num_type_j) {
                    if (children_j[j].getComponent('block').is_tiShi) {
                        continue
                    }
                    children_j[j].getComponent('block').canTiShi()
                    arr_touch.push(j)
                }
            }
        }

        for (let i = 0; i < arr_touch.length; i++) {
            this.touchOneTiShi(arr_touch[i])
        }
    },

    //消除选中的块
    xiaoChuBlocks:function(){
        var children = this.block_parent.children
        var num_num = -1
        for (let i = children.length - 1; i >= 0; i--) {
            var js_block = children[i].getComponent('block')
            if (js_block.is_xiaoChu) {
                var pos_block = children[i].getPosition()
                var blockType = children[i].getComponent('block').blockType
                children[i].removeFromParent()

                for (let i = 0; i < 5; i++) {
                    this.createXing(pos_block,blockType)
                }

                num_num++
                var num_score = 5 + 10 * num_num
                var block_score = cc.instantiate(this.prefab_blockScore) //实例化
                block_score.parent = this.xingXing_parent
                block_score.setPosition(pos_block)

                var f_time = 0.5+num_num*0.09

                //把cocos1的坐标转成世界坐标pos1 （只能父节点转）
                var pos1 = this.layerGame.convertToWorldSpaceAR(this.node_scoreCurr.getPosition());
               
                //把（世界坐标pos1）转成相对于节点cocos1的坐标
                var pos_end = this.xingXing_parent.convertToNodeSpaceAR(pos1);

                block_score.getComponent('blockScore').init(num_score,f_time,pos_end)

            }
        }
    },

    //添加分数
    addScore:function(num_score){
        this.numScore_curr = this.numScore_curr + num_score
        if (this.userData.num_score_best < this.numScore_curr) {
            this.userData.num_score_best = this.numScore_curr
            this.shuaXinBestScore()
        }
        this.userData.num_score_save = this.numScore_curr
        this.saveUserData()
        this.node_scoreCurr.getComponent(cc.Label).string = this.numScore_curr
        if (this.node_success.active == false && this.numScore_curr >= this.arrMuBiao[this.numLevel]) {
            this.node_success.active = true
            this.node_success.x = 560
            var act_1 = cc.moveTo(0.5,0,this.node_success.y)
            this.node_success.runAction(act_1)
        }
    },

    //创建星星
    createXing:function(pos_start,numType){
        var xing = cc.instantiate(this.prefab_xing) //实例化
        xing.parent = this.xingXing_parent
        xing.setPosition(pos_start)
        xing.getComponent('xing').init(numType)
        xing.scale = 0.3 + Math.random() * 0.6


        var xx = 5 + Math.random() * 150
        if (Math.random() > 0.5) {
            xx = xx * -1
        }

        var yy = 50 + Math.random() * 150
        var f_time = 0.3 + Math.random() * 0.4

        var act_0 = cc.delayTime(Math.random()*0.05)
        var act_1 = cc.moveBy(f_time,0, yy).easing(cc.easeCubicActionOut())//越来越慢
        var act_2 = cc.moveBy(f_time,0, -yy+10-Math.random() * 40).easing(cc.easeCubicActionIn())//越来越块
        var act_3 = cc.callFunc(function(){
            xing.removeFromParent()
        })
        var end = cc.sequence(act_0,act_1,act_2,act_3)
        xing.runAction(end)
    },

    //创建所有的元素块
    createBlocks:function(){

        var f_qiShi_x = -this.block_parent.width/2 +  this.num_block_wh/2 +  this.num_jianGe
        var f_qiShi_y = -this.block_parent.height/2 +  this.num_block_wh/2 +  this.num_jianGe

        for (let i = 0; i < this.num_h; i++) {//高
            for (let j = 0; j < this.num_w; j++) {//宽
                var block = cc.instantiate(this.prefab_block) //实例化
                block.parent = this.block_parent
                block.x = (this.num_block_wh+this.num_jianGe)*j + f_qiShi_x
                block.y = (this.num_block_wh+this.num_jianGe)*i + f_qiShi_y
                var js_block = block.getComponent('block')
                var i_random = Math.floor(Math.random()*2) //0-4
                js_block.init(i_random)

                // if (i==9 && j==9) {
                //     this.tx_chuiZi.x = block.x + 20
                //     this.tx_chuiZi.y = block.y
                // }
            }
        }
    },

    //通过本地数据来创建元素块
    createBlocksByBenDi:function(){
        var f_qiShi_x = -this.block_parent.width/2 +  this.num_block_wh/2 +  this.num_jianGe
        var f_qiShi_y = -this.block_parent.height/2 +  this.num_block_wh/2 +  this.num_jianGe

        for (let i = 0; i < this.num_h; i++) {//高
            for (let j = 0; j < this.num_w; j++) {//宽
                var num_save = this.userData.arr_blocks_save[i][j]
                if (num_save == -1) {
                    continue
                }
                var block = cc.instantiate(this.prefab_block) //实例化
                block.parent = this.block_parent
                block.x = (this.num_block_wh+this.num_jianGe)*j + f_qiShi_x
                block.y = (this.num_block_wh+this.num_jianGe)*i + f_qiShi_y
                var js_block = block.getComponent('block')
                js_block.init(num_save)

            }
        }
    },

    //通过元素块的坐标得到对应二维数据的角标
    getArrByPos:function(pos) {
        //console.log('pos:'+pos);
        var pos_x = this.block_parent.width / 2 + pos.x
        var pos_y = this.block_parent.height / 2 + pos.y

        var ii = Math.floor(pos_y / (this.num_block_wh + this.num_jianGe)) 
        var jj = Math.floor(pos_x / (this.num_block_wh + this.num_jianGe))

        //console.log('ii:'+ii + ' jj:'+jj);
        return cc.v2(ii,jj)
    },

    //刷新二维数据
    shuaXinArr:function(){
        //二维数组初始化 0
        for (let i = 0; i < this.num_h; i++) {
            for (let j = 0; j < this.num_w; j++) {
                this.arr_blocks[i][j] = -1
            }
        }

        var children = this.block_parent.children
        for (let i = 0; i < children.length; i++) {
            var type_block = children[i].getComponent('block').blockType
            var pos_block = children[i].getPosition()
            var pos_arr = this.getArrByPos(pos_block)

            this.arr_blocks[pos_arr.x][pos_arr.y] = type_block
        }

        this.logArr()
    },

    //判断是否游戏结束
    pdGameOver:function(){
        for (let i = 0; i < this.num_h; i++) {
            for (let j = 0; j < this.num_w; j++) {
                if (i+1 < this.num_h && this.arr_blocks[i][j] == this.arr_blocks[i+1][j] && this.arr_blocks[i][j] != -1) {
                    return false
                }
                if (i-1 >= 0 && this.arr_blocks[i][j] == this.arr_blocks[i-1][j] && this.arr_blocks[i][j] != -1) {
                    return false
                }

                if (j+1 < this.num_w && this.arr_blocks[i][j] == this.arr_blocks[i][j+1] && this.arr_blocks[i][j] != -1) {
                    return false
                }
                if (j-1 >= 0 && this.arr_blocks[i][j] == this.arr_blocks[i][j-1] && this.arr_blocks[i][j] != -1) {
                    return false
                }
            }
        }
        return true
    },

    //游戏结束的小动画
    actGameOver:function(){
        
        var children = this.block_parent.children
        for (let i = children.length-1; i >= 0; i--) {
            
            var act_1 = cc.blink(1.5,4)
            var act_2 = cc.delayTime(0.03*i)
            var act_3 = cc.callFunc(function(){
                var pos_block = children[i].getPosition()
                var blockType = children[i].getComponent('block').blockType
                for (let i = 0; i < 3; i++) {
                    this.createXing(pos_block,blockType)
                }
                children[i].active = false
            },this)

            var end = cc.sequence(act_1,act_2,act_3)
            children[i].runAction(end)
            
        }

        var f_time_big = 1.5 + 0.03*(children.length-1)

        if (this.node_success.active) {
            this.numLevel++
            this.userData.num_level_save = this.numLevel
            this.scheduleOnce(function(){
                this.userData.num_score_fh = this.numScore_curr
                this.saveUserData()
                this.actStart()
            },f_time_big+1)
        }else{
            this.scheduleOnce(function(){
                this.userData.num_level_save = 1
                this.userData.num_score_save = 0
                this.saveUserData()
                this.layerFaild.active = true
                this.layerGame.getChildByName('btn_zanTing').active = false
            },f_time_big+1)
        }
        
    },

    //刷新所有的元素块
    shuaXinBlocks:function(){
        var children = this.block_parent.children
        for (let i = 0; i < children.length; i++) {
           
            var act_1 = cc.scaleTo(0.2,0)
            var act_2 = cc.callFunc(function(){
                var num_random = Math.floor(Math.random()*children.length)
                var pos_block_1 = children[i].getPosition()
                var pos_block_2 = children[num_random].getPosition()
                children[i].setPosition(pos_block_2)
                children[num_random].setPosition(pos_block_1)
            })
            var act_3 = cc.scaleTo(0.2,1)
            var end = cc.sequence(act_1,act_2,act_3)
            children[i].runAction(end)
        }
    },

    //移动所有的元素块向下移动
    moveBlocks_down:function(){
        var children = this.block_parent.children
        var f_time_big = 0.08
        var f_time_1 = 0.08

        for (let i = 0; i < children.length; i++) {
            var pos_block = children[i].getPosition()
            var pos_arr = this.getArrByPos(pos_block)
            
            var i_null = 0
            for (let i = pos_arr.x; i >= 0; i--) {
                if (this.arr_blocks[i][pos_arr.y] == -1) {
                    i_null++
                }
            }

            var need_time = f_time_1*i_null
            if (f_time_big <  need_time) {
                f_time_big = need_time
            }
            var act_1 = cc.moveBy(need_time,0,-(this.num_jianGe+this.num_block_wh)*i_null)
            children[i].runAction(act_1)
            //console.log('空块：' + i_null);
        }

        this.scheduleOnce(function() {
            this.shuaXinArr()
            this.moveBlocks_left()
        }, f_time_big+0.02);

    },

    //移动所有的元素块向左移动
    moveBlocks_left:function(){
        var children = this.block_parent.children
        var f_time_big = 0.08
        var f_time_1 = 0.08

        for (let i = 0; i < children.length; i++) {
            var pos_block = children[i].getPosition()
            var pos_arr = this.getArrByPos(pos_block)
            
            var i_null = 0
            for (let j = pos_arr.y; j >= 0; j--) {
                if (pos_arr.x != 0) {
                    continue
                }
                if (this.arr_blocks[pos_arr.x][j] == -1) {
                    i_null++
                }
            }

            var need_time = f_time_1*i_null
            if (f_time_big <  need_time) {
                f_time_big = need_time
            }

            for (let ii = 0; ii < children.length; ii++) {
                var pos_block_move = children[ii].getPosition()
                var pos_arr_move = this.getArrByPos(pos_block_move)
                if (pos_arr_move.y == pos_arr.y) {
                    var act_1 = cc.moveBy(need_time,-(this.num_jianGe+this.num_block_wh)*i_null,0)
                    children[ii].runAction(act_1)
                }
            }
        }

        this.scheduleOnce(function() {
            this.shuaXinArr()
            this.userData.arr_blocks_save = this.arr_blocks
            this.saveUserData()
            this.is_moveing = false
            if (this.pdGameOver()) {
                this.gameType = 2
                this.userData.arr_blocks_save = []
                this.saveUserData()
                console.log('游戏结束');
                this.actGameOver()
            }else{
                console.log('没结束');
            }
        }, f_time_big+0.02);

    },

    //自动提示功能
    ziDongTiShi:function(){
        if(this.tx_biShua.active || this.tx_chuiZi.active){
            return
        }
        var children = this.block_parent.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block.is_tiShi) {
                return
            }
        }
        for (let i = 0; i < children.length; i++) {
            this.touchOneTiShi(i)
            var num_tiShiGeShu = 0 //提示块的个数
            var children_j = this.block_parent.children
            for (let j = 0; j < children_j.length; j++) {
                var js_block = children_j[j].getComponent('block')
                if (js_block.is_tiShi) {
                    num_tiShiGeShu++
                }
            }
            if (num_tiShiGeShu > 1) {//可以提示
                this.jinXingTiShi()
                return
            }else{
                var js_block = children[i].getComponent('block')
                js_block.quXiaoTiShi()
            }
        }
    },

    //进行提示操作
    jinXingTiShi:function(){
        var children = this.block_parent.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block.is_tiShi) {
                var act_1 = cc.scaleTo(0.4,0.8)
                var act_2 = cc.scaleTo(0.4,1)
                var act_3 = cc.sequence(act_1,act_2)
                var end = cc.repeatForever(act_3)
                children[i].runAction(end)
            }
        }
    },

    //取消提示操作
    quXiaoTiShi:function(){
        var children = this.block_parent.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block.is_tiShi) {
                js_block.quXiaoTiShi()
                children[i].stopAllActions()
                children[i].scale = 1
            }
        }
    },

    //按钮回调
    btn_callBack:function(sender,str){
        if(this.is_sound){
            cc.audioEngine.play(this.audio_sound[2], false, 1);
        }
       if (str == 'btn_play') {
           this.layerReady.active = false
           this.layerGame.active = true
           this.actStart()
           if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showBanner", "()V");
            }
       }else if (str == 'btn_zanTing') {
            if (this.gameType != 1) {
                return
            }
            this.layerZanTing.active = true
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showChaPing", "()V");
            }
       }else if (str == 'btn_home') {
            this.layerReady.active = true
            this.layerGame.active = false
            this.layerZanTing.active = false
       }else if (str == 'btn_rePlay') {//重新开始
            this.layerZanTing.active = false
            this.layerReady.active = false
            this.layerGame.active = true
            this.numLevel = 1
            this.numScore_curr = 0
            this.node_scoreCurr.getComponent(cc.Label).string = this.numScore_curr
            this.userData.arr_blocks_save = []
            this.userData.num_level_save = 1
            this.userData.num_score_save = 0
            this.saveUserData()
            this.actStart()
       }else if (str == 'btn_close_zanTing') {
            this.layerZanTing.active = false
       }else if (str == 'btn_shuaXin') {//刷新
            if (this.gameType != 1) {
                return
            }
            if (this.tx_biShua.active || this.tx_chuiZi.active) {
                return
            }
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showShiPin", "()V");
            }else{
                this.quXiaoTiShi()
                this.shuaXinBlocks()
            }
       }else if (str == 'btn_chuiZI') {//锤子
            if (this.gameType != 1) {
                return
            }
            if (this.tx_biShua.active) {
                return
            }
            this.quXiaoTiShi()
            if (this.tx_chuiZi.active) {
                this.tx_chuiZi.active = false
                this.quXiaoChuiZi()
                return
            }
            this.tx_chuiZi.active = true
            var children = this.block_parent.children
            if (children.length > 0) {
                var num_random = Math.floor(Math.random()*children.length)
                var pos_random = children[num_random].getPosition()
                this.tx_chuiZi.x = pos_random.x + 20
                this.tx_chuiZi.y = pos_random.y
                children[num_random].getComponent('block').chuiZi()
            }
            
       }else if (str == 'btn_biShua') {
            if (this.gameType != 1) {
                return
            }
           if (this.tx_biShua.active || this.tx_chuiZi.active) {
               return
           }
           this.quXiaoTiShi()
            this.tx_biShua.active = true
            this.bg_btn_biShu.active = true
            var children = this.block_parent.children
            if (children.length > 0) {
                this.tx_biShua.stopAllActions()
                var num_random = Math.floor(Math.random()*children.length)
                var pos_random = children[num_random].getPosition()
                console.log('笔刷位置：'+pos_random);
                this.tx_biShua.x = pos_random.x + 15
                this.tx_biShua.y = pos_random.y + 45
                
                var act_1 = cc.moveBy(0.2,0,20)
                var act_2 = cc.moveBy(0.2,0,-20)
                var act_3 = cc.sequence(act_1,act_2)
                var end = cc.repeatForever(act_3)
                this.tx_biShua.runAction(end)
                children[num_random].getComponent('block').biShua()
                var block_type = children[num_random].getComponent('block').blockType
                this.shuaXinBgBiShua(block_type)
            }
       }else if (str == 'btn_back_faild') {
            this.layerReady.active = true
            this.layerGame.active = false
            this.layerZanTing.active = false
            this.layerFaild.active = false
            this.numLevel = 1
       }else if(str == 'btn_fuHuo'){
            this.fuHuoBtn()
       }else if (str == 'btn_on') {
           this.is_sound = false
           this.shuaXinSoundBtn()
       }else if (str == 'btn_off') {
            this.is_sound = true
            this.shuaXinSoundBtn()
        }
    },

    //刷新音效按钮
    shuaXinSoundBtn:function(){
        var btn_on = this.layerZanTing.getChildByName('bg').getChildByName('bg_1').getChildByName('sp_yinXiao_bg').getChildByName('btn_on')
        var btn_off = this.layerZanTing.getChildByName('bg').getChildByName('bg_1').getChildByName('sp_yinXiao_bg').getChildByName('btn_off')

        if (this.is_sound) {
            btn_on.active = true
            btn_off.active = false
        }else{
            btn_on.active = false
            btn_off.active = true
        }
    },

    //刷新笔刷按钮
    shuaXinBgBiShua:function(num_block){
        if(this.is_sound){
            cc.audioEngine.play(this.audio_sound[2], false, 1);
        }
        var children = this.bg_btn_biShu.children
        for (let i = 0; i < children.length; i++) {
            if (num_block == i) {
                children[i].active = false
            }else{
                children[i].active = true
            }
        }

        var f_start = -215
        var f_jianGe = 108
        var i_num = -1
        for (let i = 0; i < children.length; i++) {
            if (children[i].active) {
                i_num++
                children[i].x = f_start + f_jianGe * i_num
            }
        }
    },

    //笔刷按钮的回调
    btn_biShua:function(sender,str){
        if (str == 'btn_quXiao') {//取消
            this.tx_biShua.active = false
            this.bg_btn_biShu.active = false
            this.quXiaoBiShua()
        }else{
            this.isShuaing = true //正在刷
            var children = this.block_parent.children
            for (let i = 0; i < children.length; i++) {
                var js_block = children[i].getComponent('block')
                if (js_block.is_biShua) {
                    var i_num = parseInt(str)
                    js_block.init(i_num)
                   
                    this.bg_btn_biShu.active = false
                    this.quXiaoBiShua()

                    this.tx_biShua.stopAllActions()
                    this.tx_biShua.y = this.tx_biShua.y - 20
                    var anim = this.tx_biShua.getComponent(cc.Animation)
                    anim.biShuaOver = function(){
                        this.tx_biShua.active = false
                        this.isShuaing = false
                    }.bind(this)
                    anim.play()
                    return
                }
            }
        }
    },

    //输出二维数组
    logArr:function(){
        for (let i = this.num_h-1; i >= 0; i--) {
            console.log(this.arr_blocks[i]);
        }
        console.log('**************************************');
    },

    update (dt) {//1秒执行60次
        if (this.gameType == 1) {
            this.time_tiShi++
            if (this.time_tiShi >= 5*60) {
                this.time_tiShi = 0
                this.ziDongTiShi()
            }
        }
    },

    //复活操作
    fuHuoBtn:function(str){
        this.layerFaild.active = false
        this.userData.num_score_save = this.userData.num_score_fh
        this.userData.num_level_save = this.numLevel
        this.saveUserData()
        this.actStart()
    },

    //刷新操作
    shuXinBtn:function(str){
        this.quXiaoTiShi()
        this.shuaXinBlocks()
    },

});
