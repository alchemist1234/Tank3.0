/**
 * Created by ZhanChen on 2016/11/29.
 */
//为Array类添加find方法，返回第一个找到的下标
Array.prototype.find=function(val){
    for(var i=0;i<this.length;i++){
        if (this[i]==val) {return i;}
    }
    return -1;
};
function Tank(type,x,y,direction,speed,maxHP,HP,godTime,bulletType,damage,bulletSpeed,maxLoad,loaded,loadRate,borning,borningProc) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.maxHP = maxHP;
    this.HP = HP;
    this.godTime = godTime;
    this.bulletType = bulletType;
    this.damage = damage;
    this.bulletSpeed = bulletSpeed;
    this.maxLoad = maxLoad;
    this.loaded = loaded;
    this.loadRate = loadRate;
    this.borning = borning;			//是否正在出生
    this.borningProc = borningProc;	//出生的进度
    //this.speedMultiple = 1.0;			//移动速度倍率
    this.loadingProc = 100;			//装载子弹进度
    this.pass = 0;
    this.arr_move = [];
    switch (type) {
        case TankType.heroA:
            this.color1 = Color.heroA_Color1;
            this.color2 = Color.heroA_Color2;
            this.color3 = Color.heroA_Color3;
            break;
        case TankType.heroB:
            this.color1 = Color.heroB_Color1;
            this.color2 = Color.heroB_Color2;
            this.color3 = Color.heroB_Color3;
            break;
        case TankType.enemyA:
            this.color1 = Color.enemyA_Color1;
            this.color2 = Color.enemyA_Color2;
            this.color3 = Color.enemyA_Color3;
            break;
        case TankType.enemyB:
            this.color1 = Color.enemyB_Color1;
            this.color2 = Color.enemyB_Color2;
            this.color3 = Color.enemyB_Color3;
            break;
        case TankType.enemyC:
            this.color1 = Color.enemyC_Color1;
            this.color2 = Color.enemyC_Color2;
            this.color3 = Color.enemyC_Color3;
            break;
    }
}
Tank.prototype.move=function (direction) {
    //拾取物品
    for(var i in arr_items){
        var it=arr_items[i];
        if (this.x>=it.x-g_cellLength&&this.x<it.x+g_cellLength&&this.y>=it.y-g_cellLength&&this.y<it.y+g_cellLength) {
            this.getItem(it);
            arr_items.splice(Number(i),1);
        }
    }
    //转向时自动调整位置
    if(this.direction!=direction){
        if ((this.direction==Direction.up||this.direction==Direction.down)&&(direction==Direction.left||direction==Direction.right)) {
            if (this.y%(g_cellLength/2)>Math.floor(g_cellLength/4)) {
                this.y+=(g_cellLength/2-this.y%(g_cellLength/2));
            }else{
                this.y-=this.y%(g_cellLength/2);
            }
        }
        if ((this.direction==Direction.left||this.direction==Direction.right)&&(direction==Direction.up||direction==Direction.down)) {
            if (this.x%(g_cellLength/2)>Math.floor(g_cellLength/4)) {
                this.x+=(g_cellLength/2-this.x%(g_cellLength/2));
            }else{
                this.x-=this.x%(g_cellLength/2);
            }
        }
        this.direction=direction;
    }
    //前进
    else{
        var allMove=true;
        switch (this.direction){
            //向上
            case Direction.up:
                //碰撞坦克
                for(var i in arr_tanks){
                    var t=arr_tanks[i];
                    if(this!=t)
                        if(this.x>t.x-g_cellLength&&this.x<t.x+g_cellLength&&this.y-this.speed>=t.y&&this.y-this.speed<t.y+g_cellLength)
                            allMove=false;
                }
                //碰撞边界
                if (this.y-this.speed<0)
                    allMove=false;
                //碰撞基地
                if (this.x>g_base.x-g_cellLength&&this.x<g_base.x+g_cellLength&&this.y<=g_base.y+g_cellLength&&this.y>=g_base.y) {allMove=false;}
                //碰撞障碍物
                var cellId=getCellId(this.x,this.y-1);
                if (cellId!=-1) {
                    var obs=arr_obstacles[cellId];
                    if (this.x%g_cellLength==0) {
                        if (this.pass<obs.pass&&obs.state&3&&this.y>obs.y+g_cellLength/2) {allMove=false;}
                        if (this.pass<obs.pass&&obs.state&12&&this.y<=obs.y+g_cellLength/2) {allMove=false;}
                    }else{
                        var obs_beside=arr_obstacles[cellId+1];
                        if (((this.pass<obs.pass&&obs.state&1)||(this.pass<obs_beside.pass&&obs_beside.state&2))&&this.y>obs.y+g_cellLength/2) {allMove=false;}
                        if (((this.pass<obs.pass&&obs.state&4)||(this.pass<obs_beside.pass&&obs_beside.state&8))&&this.y<=obs.y+g_cellLength/2) {allMove=false;}
                    }
                }
                if (allMove){
                    this.y-=this.speed;
                }
                break;
            case Direction.down:
                for(var i in arr_tanks){
                    var t=arr_tanks[i];
                    if(this!=t)
                        if(this.x>t.x-g_cellLength&&this.x<t.x+g_cellLength&&this.y+this.speed+g_cellLength>=t.y&&this.y+this.speed<t.y)
                            allMove=false;
                }
                if (this.y+this.speed>g_fieldHeight-g_cellLength)
                    allMove=false;
                if (this.x>g_base.x-g_cellLength&&this.x<g_base.x+g_cellLength&&this.y>=g_base.y-g_cellLength&&this.y<=g_base.y) {allMove=false;}
                var cellId=getCellId(this.x,this.y+g_cellLength);
                if (cellId!=-1) {
                    var obs=arr_obstacles[cellId];
                    if (this.x%g_cellLength==0) {
                        if (this.pass<obs.pass&&obs.state&12&&this.y<=obs.y-g_cellLength/2) {allMove=false;}
                        if (this.pass<obs.pass&&obs.state&3&&this.y>=obs.y-g_cellLength/2) {allMove=false;}
                    }else{
                        var obs_beside=arr_obstacles[cellId+1];
                        if (((this.pass<obs.pass&&obs.state&1)||(this.pass<obs_beside.pass&&obs_beside.state&2))&&this.y>=obs.y-g_cellLength/2) {allMove=false;}
                        if (((this.pass<obs.pass&&obs.state&4)||(this.pass<obs_beside.pass&&obs_beside.state&8))&&this.y<=obs.y-g_cellLength/2) {allMove=false;}
                    }
                }
                if (allMove){
                    this.y+=this.speed;
                }
                break;
            case Direction.left:
                for(var i in arr_tanks){
                    var t=arr_tanks[i];
                    if(this!=t)
                        if(this.x-this.speed>=t.x&&this.x-this.speed<t.x+g_cellLength&&this.y>t.y-g_cellLength&&this.y<t.y+g_cellLength)
                            allMove=false;
                }
                if (this.x-this.speed<0)
                    allMove=false;
                if (this.x<=g_base.x+g_cellLength&&this.x>=g_base.x&&this.y>g_base.y-g_cellLength&&this.y<g_base.y+g_cellLength) {allMove=false;}
                var cellId=getCellId(this.x-1,this.y);
                if (cellId!=-1) {
                    var obs=arr_obstacles[cellId];
                    if (this.y%g_cellLength==0) {
                        if (this.pass<obs.pass&&obs.state&5&&this.x>obs.x+g_cellLength/2) {allMove=false;}
                        if (this.pass<obs.pass&&obs.state&10&&this.x<=obs.x+g_cellLength/2) {allMove=false;}
                    }else{
                        var obs_beside=arr_obstacles[cellId+15];
                        if (((this.pass<obs.pass&&obs.state&1)||(this.pass<obs_beside.pass&&obs_beside.state&4))&&this.x>obs.x+g_cellLength/2) {allMove=false;}
                        if (((this.pass<obs.pass&&obs.state&2)||(this.pass<obs_beside.pass&&obs_beside.state&8))&&this.x<=obs.x+g_cellLength/2) {allMove=false;}
                    }
                }
                if (allMove){
                    this.x-=this.speed;
                }
                break;
            case Direction.right:
                for(var i in arr_tanks){
                    var t=arr_tanks[i];
                    if(this!=t)
                        if(this.x+this.speed+g_cellLength>=t.x&&this.x+this.speed<t.x&&this.y>t.y-g_cellLength&&this.y<t.y+g_cellLength)
                            allMove=false;
                }
                if (this.x+this.speed>g_fieldWidth-g_cellLength)
                    allMove=false;
                if (this.x>=g_base.x-g_cellLength&&this.x<=g_base.x&&this.y>g_base.y-g_cellLength&&this.y<g_base.y+g_cellLength) {allMove=false;}
                var cellId=getCellId(this.x+g_cellLength,this.y);
                if (cellId!=-1) {
                    var obs=arr_obstacles[cellId];
                    if (this.y%g_cellLength==0) {
                        if (this.pass<obs.pass&&obs.state&5&&this.x>=obs.x-g_cellLength/2) {allMove=false;}
                        if (this.pass<obs.pass&&obs.state&10&&this.x<=obs.x-g_cellLength/2) {allMove=false;}
                    }else{
                        var obs_beside=arr_obstacles[cellId+15];
                        if (((this.pass<obs.pass&&obs.state&1)||(this.pass<obs_beside.pass&&obs_beside.state&4))&&this.x>=obs.x-g_cellLength/2) {allMove=false;}
                        if (((this.pass<obs.pass&&obs.state&2)||(this.pass<obs_beside.pass&&obs_beside.state&8))&&this.x<=obs.x-g_cellLength/2) {allMove=false;}
                    }
                }
                if (allMove){
                    this.x+=this.speed;
                }
                break;
        }
    }
};
Tank.prototype.shoot=function () {
    if (this.loaded>0&&!this.borning) {
        var bulletFrom;
        if (this==g_heroA) {
            if(chk_sound.checked) {
                au_heroAShoot.currentTime = 0;
                au_heroAShoot.play();
            }
            bulletFrom=TankType.heroA;

        }else if (this==g_heroB) {
            if(chk_sound.checked) {
                au_heroBShoot.currentTime = 0;
                au_heroBShoot.play();
            }
            bulletFrom=TankType.heroB;
        }else{
            bulletFrom=TankType.enemy;
        }
        switch(this.direction){
            case Direction.up:
                var bullet=new Bullet(this.bulletType,this.x+24,this.y,this.direction,this.bulletSpeed,this.damage,bulletFrom,this);
                break;
            case Direction.right:
                var bullet=new Bullet(this.bulletType,this.x+48,this.y+25,this.direction,this.bulletSpeed,this.damage,bulletFrom,this);
                break;
            case Direction.down:
                var bullet=new Bullet(this.bulletType,this.x+24,this.y+48,this.direction,this.bulletSpeed,this.damage,bulletFrom,this);
                break;
            case Direction.left:
                var bullet=new Bullet(this.bulletType,this.x,this.y+25,this.direction,this.bulletSpeed,this.damage,bulletFrom,this);
                break;
        }
        arr_bullets.push(bullet);
        this.loaded--;
    }
};
Tank.prototype.getItem=function (item) {
    if (item.type!=ItemType.life&&item.type!=ItemType.bomb&&chk_sound.checked) {
        au_getItem.currentTime=0;
        au_getItem.play();
    }else if(item.type==ItemType.life&&chk_sound.checked){
        au_lifeUp.currentTime=0;
        au_lifeUp.play();
    }
    switch(item.type){
        case ItemType.bomb://炸弹
            if (this.category==TankType.heroA||this.category==TankType.heroB) {
                for(var i=0;i<arr_tanks.length;i++){
                    if (arr_tanks[i].category==TankType.enemy&&arr_tanks[i].godTime<0) {
                        arr_tanks[i].destroy();
                        i--;
                    }
                }
            }else{
                if (g_heroA!=undefined&&g_heroA.godTime<0) {
                    g_heroA.destroy();
                }
                if (g_heroB!=undefined&&g_heroB.godTime<0) {
                    g_heroB.destroy();
                }
            }
            arr_text.push(new Text("Boom!",this.x,this.y));
            break;
        case ItemType.bulletSpeed://增加子弹速度
            if (this.bulletSpeed<Config.bulletSpeedLimit) {
                var speedIncrement=2;
                if(this.bulletSpeed+speedIncrement>Config.bulletSpeedLimit){
                    speedIncrement=Config.bulletSpeedLimit-this.bulletSpeed;
                }
                this.bulletSpeed+=speedIncrement;
                if (g_heroA!=undefined) {g_heroABulletSpeed=g_heroA.bulletSpeed;}
                if (g_heroB!=undefined) {g_heroBBulletSpeed=g_heroB.bulletSpeed;}
                if(this.bulletSpeed>=Config.bulletSpeedLimit){
                    arr_text.push(new Text("子弹速度已达上限",this.x,this.y));
                }else{
                    arr_text.push(new Text("子弹速度+"+speedIncrement,this.x,this.y));
                }
            }else{
                arr_text.push(new Text("子弹速度已达上限",this.x,this.y));
            }
            break;
        case ItemType.freeze://定时
            if (this.category!=TankType.enemy) {
                if (!g_enemyFreezed) {
                    clearInterval(timer_enemyAuto);
                    g_enemyFreezeTime=Config.enemyFreezeTime;
                    timer_enemyFreeze=setInterval(enemyFreezeTimeChange,1000);
                    g_enemyFreezed=true;
                }else{
                    g_enemyFreezeTime=Config.enemyFreezeTime;
                }
                for(var i in arr_enemies){
                    arr_enemies[i].freezeTime=g_enemyFreezeTime;
                    arr_enemies[i].arr_move.splice(0,arr_enemies[i].arr_move.length);
                }
            }else{
                if (!g_heroFreezed) {
                    g_heroFreezeTime=Config.heroFreezeTime;
                    timer_heroFreeze=setInterval(heroFreezeTimeChange,1000);
                    g_heroFreezed=true;
                    document.body.removeEventListener("keydown",keyDownControl,true);
                    document.body.removeEventListener("keyup",keyUpControl,true)
                }else{
                    g_heroFreezeTime=Config.heroFreezeTime;
                }
                if (g_heroA!=undefined) {
                    g_heroA.arr_move.splice(0,g_heroA.arr_move.length);
                    g_heroA.freezeTime=g_heroFreezeTime;
                }
                if (g_heroB!=undefined) {
                    g_heroB.arr_move.splice(0,g_heroB.arr_move.length);
                    g_heroB.freezeTime=g_heroFreezeTime;
                }
            }
            arr_text.push(new Text("stop!",this.x,this.y));
            break;
        case ItemType.heal://恢复全部HP
            this.HP=this.maxHP;
            arr_text.push(new Text("生命恢复",this.x,this.y));
            break;
        case ItemType.life://增加坦克数量
            if (this==g_heroA) {g_heroALives++;}
            if (this==g_heroB) {g_heroBLives++;}
            if (this.category==TankType.enemy) {g_enemyNum++;}
            arr_text.push(new Text("生命+1",this.x,this.y));
            break;
        case ItemType.load://增加最大载弹量
            if (this.maxLoad<Config.loadLimit) {
                this.maxLoad++;
                if (g_heroA!=undefined) {g_heroAMaxLoad=g_heroA.maxLoad;}
                if (g_heroB!=undefined) {g_heroBMaxLoad=g_heroB.maxLoad;}
                if(this.maxLoad>=Config.loadLimit){
                    arr_text.push(new Text("载弹量已达上限",this.x,this.y));
                }else {
                    arr_text.push(new Text("载弹量+1", this.x, this.y));
                }
            }else{
                arr_text.push(new Text("载弹量已达上限",this.x,this.y));
            }
            break;
        case ItemType.shield://保护伞
            this.godTime=Config.shieldTime;
            arr_text.push(new Text("Hit Me!",this.x,this.y));
            break;
        case ItemType.speed://增加移速
            if (this.speed<Config.speedLimit) {
                this.speed++;
                if (g_heroA!=undefined) {g_heroASpeed=g_heroA.speed;}
                if (g_heroB!=undefined) {g_heroBSpeed=g_heroB.speed;}
                if(this.speed>=Config.speedLimit){
                    arr_text.push(new Text("移动速度已达上限",this.x,this.y));
                }else{
                    arr_text.push(new Text("移动速度+1",this.x,this.y));
                }
            }else{
                arr_text.push(new Text("移动速度已达上限",this.x,this.y));
            }
            break;
        case ItemType.upgrade://增加子弹伤害
            if (this.damage<Config.damageLimit) {
                var damageIncrement = Config.damageIncrement;
                if (this.damage + Config.damageIncrement > Config.damageLimit) {
                    damageIncrement = Config.damageLimit - this.damage;
                }
                this.damage += damageIncrement;
                if (g_heroA != undefined) {
                    g_heroADamage = g_heroA.damage;
                }
                if (g_heroB != undefined) {
                    g_heroBDamage = g_heroB.damage;
                }
                if (this.damage >= Config.damageLimit) {
                    arr_text.push(new Text("子弹伤害已达上限", this.x, this.y));
                } else {
                    arr_text.push(new Text("子弹伤害+" + damageIncrement, this.x, this.y));
                }
            }else{
                arr_text.push(new Text("子弹伤害已达上限", this.x, this.y));
            }
            break;
        case ItemType.loadRate://增加装载速度
            if (this.loadRate<Config.loadRateLimit) {
                this.loadRate++;
                if (g_heroA!=undefined) {g_heroALoadRate=g_heroA.loadRate;}
                if (g_heroB!=undefined) {g_heroBLoadRate=g_heroB.loadRate;}
                if(this.loadRate>=Config.loadRateLimit){
                    arr_text.push(new Text("装载速度已达上限",this.x,this.y));
                }else{
                    arr_text.push(new Text("装载速度+1",this.x,this.y));
                }
            }else{
                arr_text.push(new Text("装载速度已达上限",this.x,this.y));
            }
            break;
        case ItemType.spade://改变基地周围防御
            if (this.category==TankType.enemy) {
                g_base.changeProtect(ObstacleType.empty);
            }else{
                g_base.changeProtect(ObstacleType.steel);
            }
            setTimeout(function(){g_base.changeProtect(ObstacleType.brick);},Config.spadeTime*1000);
            arr_text.push(new Text("WOW!",this.x,this.y));
            break;
    }
};
Tank.prototype.destroy=function () {
    if(chk_sound.checked) {
        au_boom.currentTime = 0;
        au_boom.play();
    }
    if (this==g_heroA) {
        arr_tanks.splice(arr_tanks.find(this),1);
        g_heroA=undefined;
    }else if (this==g_heroB) {
        arr_tanks.splice(arr_tanks.find(this),1);
        g_heroB=undefined;
    }else{
        arr_enemies.splice(arr_enemies.find(this),1);
        arr_tanks.splice(arr_tanks.find(this),1);
    }
    if (g_enemyNum==0&&arr_enemies.length==0) {
        nextStage();
    }
    if (g_heroA==undefined&&g_heroB==undefined&&g_heroALives==0&&g_heroBLives==0) {
        gameOver(false);
    }
};
function reload() {
    if (g_heroA!=undefined) {
        if (g_heroA.loaded<g_heroA.maxLoad) {
            if (g_heroA.loadingProc<100) {g_heroA.loadingProc+=g_heroA.loadRate;}
            else{
                g_heroA.loaded++;
                g_heroA.loadingProc=0;
            }
        }
    }
    if (g_heroB!=undefined) {
        if (g_heroB.loaded<g_heroB.maxLoad) {
            if (g_heroB.loadingProc<100) {g_heroB.loadingProc+=g_heroB.loadRate;}
            else{
                g_heroB.loaded++;
                g_heroB.loadingProc=0;
            }
        }
    }
    if (arr_enemies.length>0) {
        for(var i in arr_enemies){
            if (arr_enemies[i].loaded<arr_enemies[i].maxLoad) {
                if (arr_enemies[i].loadingProc<100) {arr_enemies[i].loadingProc+=arr_enemies[i].loadRate;}
                else{
                    arr_enemies[i].loaded++;
                    arr_enemies[i].loadingProc=0;
                }
            }
        }
    }
}
function born(){
    if (g_heroA!=undefined){
        if(g_heroA.borningProc<g_cellLength) {
            g_heroA.borningProc++;
            g_heroA.godTime=Config.heroAGodTime;
        }
        else{g_heroA.borning=false;}
    }
    if (g_heroB!=undefined){
        if(g_heroB.borningProc<g_cellLength) {
            g_heroB.borningProc++;
            g_heroB.godTime=Config.heroBGodTime;
        }
        else{g_heroB.borning=false;}
    }
    for(var i in arr_enemies){
        if (arr_enemies[i].borningProc<g_cellLength) {
            arr_enemies[i].borningProc++;
            arr_enemies[i].godTime=Config.enemyAGodTime;
        }
        else{
            arr_enemies[i].borning=false;
        }
    }
}
function Hero(type,x,y,direction,speed,maxHP,HP,godTime,bulletType,damage,bulletSpeed,maxLoad,loaded,loadRate,borning,borningProc){
    this.tank=Tank;
    this.arr_move=[];
    this.tank(type,x,y,direction,speed,maxHP,HP,godTime,bulletType,damage,bulletSpeed,maxLoad,loaded,loadRate,borning,borningProc);
    this.category=type;
}
Hero.prototype=Tank.prototype;
function Enemy(type,x,y,direction,speed,maxHP,HP,godTime,bulletType,damage,bulletSpeed,maxLoad,loaded,loadRate,borning,borningProc,reward){
    this.tank=Tank;
    this.tank(type,x,y,direction,speed,maxHP,HP,godTime,bulletType,damage,bulletSpeed,maxLoad,loaded,loadRate,borning,borningProc);
    this.reward=reward;
    this.category=TankType.enemy;
}
Enemy.prototype=Tank.prototype;

function generateTank(){
    if (g_heroA==undefined&&g_heroALives>0) {
        g_heroA=new Hero(TankType.heroA,200,700,Direction.up,Config.heroASpeed,Config.heroAMaxHP,Config.heroAMaxHP,Config.heroAGodTime,Config.heroABulletType,Config.heroADamage,Config.heroABulletSpeed,Config.heroAMaxLoad,Config.heroAMaxLoad,Config.heroALoadRate,true,0);
        g_heroALives--;
        g_heroASpeed=Config.heroASpeed;
        g_heroAMaxLoad=Config.heroAMaxLoad;
        g_heroADamage=Config.heroADamage;
        g_heroALoadRate=Config.heroALoadRate;
        g_heroABulletSpeed=Config.heroABulletSpeed;
        arr_tanks.push(g_heroA);
    }
    if (g_players==2&&g_heroB==undefined&&g_heroBLives>0) {
        g_heroB=new Hero(TankType.heroB,500,700,Direction.up,Config.heroBSpeed,Config.heroBMaxHP,Config.heroBMaxHP,Config.heroBGodTime,Config.heroBBulletType,Config.heroBDamage,Config.heroBBulletSpeed,Config.heroBMaxLoad,Config.heroBMaxLoad,Config.heroBLoadRate,true,0);
        g_heroBLives--;
        g_heroBSpeed=Config.heroBSpeed;
        g_heroBMaxLoad=Config.heroBMaxLoad;
        g_heroBDamage=Config.heroBDamage;
        g_heroBLoadRate=Config.heroBLoadRate;
        g_heroBBulletSpeed=Config.heroBBulletSpeed;
        arr_tanks.push(g_heroB);
    }
    if (g_enemyNum>0&&arr_enemies.length<Config.enemiesOnScreen) {
        var occupied=0;
        var loc=(Config.enemyNum-g_enemyNum)%3;
        for(var i in arr_tanks){
            var tank=arr_tanks[i];
            if(tank.y<g_cellLength){
                if(tank.x<g_cellLength)
                    occupied|=4;
                if (tank.x>=300&&tank.x<400)
                    occupied|=2;
                if(tank.x>=650)
                    occupied|=1;
            }
        }
        if (!(occupied&Math.pow(2,(2-loc)))) {
            var ran=Math.random();
            var enemy;
            if (ran<Config.enemyAChance)
                enemy=new Enemy(TankType.enemyA,350*(loc),0,Direction.down,Config.enemyASpeed,Config.enemyAMaxHP,Config.enemyAMaxHP,Config.enemyAGodTime,Config.enemyABulletType,Config.enemyADamage,Config.enemyABulletSpeed,Config.enemyAMaxLoad,Config.enemyAMaxLoad,Config.enemyALoadRate,true,0,Config.enemyAReward);
            else if(ran<Config.enemyAChance+Config.enemyBChance)
                enemy=new Enemy(TankType.enemyB,350*(loc),0,Direction.down,Config.enemyBSpeed,Config.enemyBMaxHP,Config.enemyBMaxHP,Config.enemyBGodTime,Config.enemyBBulletType,Config.enemyBDamage,Config.enemyBBulletSpeed,Config.enemyBMaxLoad,Config.enemyBMaxLoad,Config.enemyBLoadRate,true,0,Config.enemyBReward);
            else
                enemy=new Enemy(TankType.enemyC,350*(loc),0,Direction.down,Config.enemyCSpeed,Config.enemyCMaxHP,Config.enemyCMaxHP,Config.enemyCGodTime,Config.enemyCBulletType,Config.enemyCDamage,Config.enemyCBulletSpeed,Config.enemyCMaxLoad,Config.enemyCMaxLoad,Config.enemyCLoadRate,true,0,Config.enemyCReward);
            enemy.arr_move.push(Direction.down);
            arr_enemies.push(enemy);
            arr_tanks.push(enemy);
            g_enemyNum--;
        }
    }
}
function heroAuto(){
    if (g_heroA!=undefined) {
        if (g_heroA.arr_move.length>0&&!g_heroA.borning) {
            g_heroA.move(g_heroA.arr_move[g_heroA.arr_move.length-1]);
        }
    }
    if (g_heroB!=undefined) {
        if (g_heroB.arr_move.length>0&&!g_heroB.borning) {
            g_heroB.move(g_heroB.arr_move[g_heroB.arr_move.length-1]);
        }
    }
    if ((g_heroA!=undefined&&g_heroA.arr_move.length>0)||(g_heroB!=undefined&&g_heroB.arr_move.length>0)) {
        if (au_heroMove.paused&&(au_stageStart.ended||au_stageStart.currentTime==0)&&chk_sound.checked) {
            au_heroMove.play();}
    }else{
        au_heroMove.pause();
    }
}
function enemyAuto(){
    if (arr_enemies.length>0) {
        for(var i=0;i<arr_enemies.length;i++){
            var enemy=arr_enemies[i];
            if (enemy.arr_move.length>0&&!enemy.borning) {
                enemy.move(enemy.arr_move[enemy.arr_move.length-1]);
            }
            if (Math.random()<=Config.enemyChangeDirection) {
                enemy.arr_move.splice(0,1,Math.floor(Math.random()*4));
            }
            if (Math.random()<=Config.enemyShoot) {
                enemy.shoot();
            }
        }
        if (au_enemyMove.paused&&(au_stageStart.ended||au_stageStart.currentTime==0)&&chk_sound.checked) {
             au_enemyMove.play();
        }

    }else{au_enemyMove.pause();}
}
function godTimeChange(){
    if (g_heroA!=undefined&&g_heroA.godTime>=0) {
        g_heroA.godTime--;
    }
    if (g_heroB!=undefined&&g_heroB.godTime>=0) {
        g_heroB.godTime--;
    }
    for(var i in arr_enemies){
        if (arr_enemies[i].godTime>=0) {
            arr_enemies[i].godTime--;
        }
    }
}
function heroFreezeTimeChange(){
    if (--g_heroFreezeTime<0) {
        document.body.addEventListener("keydown",keyDownControl,true);
        document.body.addEventListener("keyup",keyUpControl,true);
        g_heroFreezed=false;
        g_heroFreezeTime=-1;
        clearInterval(timer_heroFreeze);
    }
    if (g_heroA!=undefined) {g_heroA.freezeTime=g_heroFreezeTime;}
    if (g_heroB!=undefined) {g_heroB.freezeTime=g_heroFreezeTime;}
}
function enemyFreezeTimeChange(){
    if (--g_enemyFreezeTime<0) {
        timer_enemyAuto=setInterval("enemyAuto()",Config.moveInterval);
        g_enemyFreezed=false;
        g_enemyFreezeTime=-1;
        clearInterval(timer_enemyFreeze);
    }
    for(var i in arr_enemies){
        arr_enemies[i].freezeTime=g_enemyFreezeTime;
    }
}
function Bullet(type,x,y,direction,speed,damage,from,tank){
    this.type=type;
    this.x=x;
    this.y=y;
    this.direction=direction;
    this.speed=speed;
    this.damage=damage;
    this.from=from;
    this.tank=tank;
}
Bullet.prototype.hit=function(){
    //击中边界
    if (this.x<=0||this.x>g_fieldWidth-2||this.y<0||this.y>g_fieldHeight) {
        this.destroy();
        if ((this.from==TankType.heroA||this.from==TankType.heroB)&&chk_sound.checked) {
            au_shootIndestructible.currentTime=0;
            au_shootIndestructible.play();
        }
    }
    //击中坦克
    for(var i in arr_tanks){
        var tank=arr_tanks[i];
        if (!tank.borning) {
            if (this.x>=tank.x-1&&this.x<=tank.x+g_cellLength&&this.y>=tank.y&&this.y<=tank.y+g_cellLength&&this.tank!=tank) {
                if (((this.from==TankType.heroA||this.from==TankType.heroB)&&tank.category==TankType.enemy)||(this.from==TankType.enemy&&(tank.category==TankType.heroA||tank.category==TankType.heroB))) {
                    if (tank.godTime<0) {
                        if (tank.HP>this.damage) {
                            tank.HP-=this.damage;
                            if ((this.from==TankType.heroA||this.from==TankType.heroB)&&chk_sound.checked) {
                                au_shootIndestructible.currentTime=0;
                                au_shootIndestructible.play();
                            }
                        }else{
                            if (this.from==TankType.heroA) {
                                g_heroAScore+=tank.reward;
                                if (g_heroAScore>=g_findItemScoreA){
                                    generateItem();
                                    g_findItemScoreA+=Config.findItemScore;
                                }
                            }
                            if (this.from==TankType.heroB) {
                                g_heroBScore+=tank.reward;
                                if (g_heroBScore>=g_findItemScoreB) {
                                    generateItem();
                                    g_findItemScoreB += Config.findItemScore;
                                }
                            }
                            tank.destroy();
                        }
                    }else if ((this.from==TankType.heroA||this.from==TankType.heroB)&&chk_sound.checked) {
                        au_shootIndestructible.currentTime=0;
                        au_shootIndestructible.play();
                    }
                }
                this.destroy();
                break;
            }
        }
    }
    //击中子弹
    for(var i in arr_bullets){
        var bullet=arr_bullets[i];
        var dis=Math.ceil((this.speed+bullet.speed)/2);
        console.log(dis);
        if (this.x>=bullet.x-dis&&this.x<=bullet.x+dis&&this.y>=bullet.y-dis&&this.y<=bullet.y+dis&&this!=bullet) {
            this.destroy();
            bullet.destroy();
            break;
        }
    }
    //击中基地
    if (this.x>=g_base.x-1&&this.x<=g_base.x+g_cellLength&&this.y>=g_base.y&&this.y<=g_base.y+g_cellLength&&!g_base.destroy&&chk_sound.checked) {
        au_baseDestroy.currentTime=0;
        au_baseDestroy.play();
        g_base.destroy=true;
        this.destroy();
        gameOver(false);
    }
    //击中障碍物
    var cellId=getCellId(this.x,this.y);
    if(cellId!=-1){
        var obs=arr_obstacles[cellId];
        if(this.direction==Direction.up||this.direction==Direction.down) {
            if (this.x % g_cellLength > 5&&this.x%g_cellLength<45) {
                if (obs.hardness > 0 || (obs.hardness < 0 && this.tank.damage > Math.abs(obs.hardness))) {
                    if (obs.state & 3 && this.y >= obs.y + g_cellLength / 2) {
                        if (this.tank.damage > Math.abs(obs.hardness)) {
                            obs.state = obs.state & 12;
                        } else if (this.from != TankType.enemy&&chk_sound.checked) {
                            au_shootIndestructible.currentTime = 0;
                            au_shootIndestructible.play();
                        }
                        this.destroy();
                    }
                    if (obs.state&12&&this.y<obs.y+g_cellLength/2) {
                        if (this.tank.damage>Math.abs(obs.hardness)) {
                            obs.state=obs.state&3;
                        }else if(this.from!=TankType.enemy&&chk_sound.checked){
                            au_shootIndestructible.currentTime=0;
                            au_shootIndestructible.play();
                        }
                        this.destroy();
                    }
                }
            }else{
                if (obs.hardness > 0 || (obs.hardness < 0 && this.tank.damage > Math.abs(obs.hardness))) {
                    if (obs.state & 1 && this.y >= obs.y + g_cellLength / 2) {
                        if (this.tank.damage > Math.abs(obs.hardness)) {
                            obs.state = obs.state & 14;
                        } else if (this.from != TankType.enemy&&chk_sound.checked) {
                            au_shootIndestructible.currentTime = 0;
                            au_shootIndestructible.play();
                        }
                        this.destroy();
                    }
                    if (obs.state&4&&this.y<obs.y+g_cellLength/2) {
                        if (this.tank.damage>Math.abs(obs.hardness)) {
                            obs.state=obs.state&11;
                        }else if(this.from!=TankType.enemy&&chk_sound.checked){
                            au_shootIndestructible.currentTime=0;
                            au_shootIndestructible.play();
                        }
                        this.destroy();
                    }
                }
                if(this.x<700){
                    var obs_beside=arr_obstacles[cellId+1];
                    if (obs_beside.hardness > 0 || (obs_beside.hardness < 0 && this.tank.damage > Math.abs(obs_beside.hardness))) {
                        if (obs_beside.state & 2 && this.y >= obs_beside.y + g_cellLength / 2) {
                            if (this.tank.damage > Math.abs(obs_beside.hardness)) {
                                obs_beside.state = obs_beside.state & 13;
                            } else if (this.from != TankType.enemy&&chk_sound.checked) {
                                au_shootIndestructible.currentTime = 0;
                                au_shootIndestructible.play();
                            }
                            this.destroy();
                        }
                        if (obs_beside.state&8&&this.y<obs_beside.y+g_cellLength/2) {
                            if (this.tank.damage>Math.abs(obs_beside.hardness)) {
                                obs_beside.state=obs_beside.state&7;
                            }else if(this.from!=TankType.enemy&&chk_sound.checked){
                                au_shootIndestructible.currentTime=0;
                                au_shootIndestructible.play();
                            }
                            this.destroy();
                        }
                    }
                }
            }
        }else{
            if (this.y % g_cellLength > 5&&this.y%g_cellLength<45) {
                if (obs.hardness > 0 || (obs.hardness < 0 && this.tank.damage > Math.abs(obs.hardness))) {
                    if (obs.state & 5 && this.x >= obs.x + g_cellLength / 2) {
                        if (this.tank.damage > Math.abs(obs.hardness)) {
                            obs.state = obs.state & 10;
                        } else if (this.from != TankType.enemy&&chk_sound.checked) {
                            au_shootIndestructible.currentTime = 0;
                            au_shootIndestructible.play();
                        }
                        this.destroy();
                    }
                    if (obs.state&10&&this.x<obs.x+g_cellLength/2) {
                        if (this.tank.damage>Math.abs(obs.hardness)) {
                            obs.state=obs.state&5;
                        }else if(this.from!=TankType.enemy&&chk_sound.checked){
                            au_shootIndestructible.currentTime=0;
                            au_shootIndestructible.play();
                        }
                        this.destroy();
                    }
                }
            }else{
                if (obs.hardness > 0 || (obs.hardness < 0 && this.tank.damage > Math.abs(obs.hardness))) {
                    if (obs.state & 4 && this.x >= obs.x + g_cellLength / 2) {
                        if (this.tank.damage > Math.abs(obs.hardness)) {
                            obs.state = obs.state & 11;
                        } else if (this.from != TankType.enemy&&chk_sound.checked) {
                            au_shootIndestructible.currentTime = 0;
                            au_shootIndestructible.play();
                        }
                        this.destroy();
                    }
                    if (obs.state&8&&this.x<obs.x+g_cellLength/2) {
                        if (this.tank.damage>Math.abs(obs.hardness)) {
                            obs.state=obs.state&7;
                        }else if(this.from!=TankType.enemy&&chk_sound.checked){
                            au_shootIndestructible.currentTime=0;
                            au_shootIndestructible.play();
                        }
                        this.destroy();
                    }
                }
                if(cellId-15>=0){
                    var obs_beside=arr_obstacles[cellId-15];
                    if (obs_beside.hardness > 0 || (obs_beside.hardness < 0 && this.tank.damage > Math.abs(obs_beside.hardness))) {
                        if (obs_beside.state & 2 && this.x < obs_beside.x + g_cellLength / 2) {
                            if (this.tank.damage > Math.abs(obs_beside.hardness)) {
                                obs_beside.state = obs_beside.state & 13;
                            } else if (this.from != TankType.enemy&&chk_sound.checked) {
                                au_shootIndestructible.currentTime = 0;
                                au_shootIndestructible.play();
                            }
                            this.destroy();
                        }
                        if (obs_beside.state&1&&this.x>=obs_beside.x+g_cellLength/2) {
                            if (this.tank.damage>Math.abs(obs_beside.hardness)) {
                                obs_beside.state=obs_beside.state&14;
                            }else if(this.from!=TankType.enemy&&chk_sound.checked){
                                au_shootIndestructible.currentTime=0;
                                au_shootIndestructible.play();
                            }
                            this.destroy();
                        }
                    }
                }
            }
        }
    }
};
Bullet.prototype.move=function(){
    switch(this.direction){
        case Direction.up:
            this.y-=this.speed;
            break;
        case Direction.right:
            this.x+=this.speed;
            break;
        case Direction.down:
            this.y+=this.speed;
            break;
        case Direction.left:
            this.x-=this.speed;
            break;
    }
    this.hit();
};
Bullet.prototype.destroy=function(){
    var index=arr_bullets.find(this);
    if (index!=-1) {
        arr_bullets.splice(index,1);
    }
};
function bulletMove(){
    if (arr_bullets.length>0) {
        for(var i in arr_bullets){
            arr_bullets[i].move();
        }
    }
}
function Obstacle(type,x,y,pass,hardness,state){
    this.type=type;
    this.x=x;
    this.y=y;
    this.pass=pass;
    this.hardness=hardness;
    this.state=state;
}
Obstacle.prototype.changeType=function(type){
    switch(type){
        case ObstacleType.empty:
            this.state=0;
            this.type=ObstacleType.empty;
            this.pass=ObstaclePass.empty;
            this.hardness=ObstacleHardness.empty;
            break;
        case ObstacleType.brick:
            this.type=ObstacleType.brick;
            this.pass=ObstaclePass.brick;
            this.hardness=ObstacleHardness.brick;
            break;
        case ObstacleType.steel:
            this.type=ObstacleType.steel;
            this.pass=ObstaclePass.steel;
            this.hardness=ObstacleHardness.steel;
            break;
        case ObstacleType.grass:
            this.type=ObstacleType.grass;
            this.pass=ObstaclePass.grass;
            this.hardness=ObstacleHardness.grass;
            break;
        case ObstacleType.water:
            this.type=ObstacleType.water;
            this.pass=ObstaclePass.water;
            this.hardness=ObstacleHardness.water;
            break;
        case ObstacleType.ice:
            this.type=ObstacleType.ice;
            this.pass=ObstaclePass.ice;
            this.hardness=ObstacleHardness.ice;
            break;
    }
};
Obstacle.prototype.destroy=function(){
    this.state=0;
    this.type=ObstacleType.empty;
    this.pass=ObstaclePass.empty;
    this.hardness=ObstacleHardness.empty;
};
function getCellId(x,y){
    if (x<0||x>=g_fieldWidth||y<0||y>=g_fieldHeight) {return -1;}
    var row=Math.floor(y/g_cellLength);
    var col=Math.floor(x/g_cellLength);
    return row*15+col;
}
function Item(type,x,y){
    this.type=type;
    this.x=x;
    this.y=y;
    this.time=Config.itemDestroy;
}
//生成物品
function generateItem(){
    var type=Math.floor(Math.random()*11);
    var x=Math.floor(Math.random()*(g_fieldWidth-g_cellLength));
    var y=Math.floor(Math.random()*(g_fieldHeight-g_cellLength*2)+g_cellLength);
    var item=new Item(type,x,y);
    arr_items.push(item);
    if(chk_sound.checked) {
        au_findItem.currentTime = 0;
        au_findItem.play();
    }
    for(var i in arr_tanks){
        var tank=arr_tanks[i];
        if (x>tank.x-g_cellLength&&x<tank.x+g_cellLength&&y>tank.y-g_cellLength&&y<tank.y+g_cellLength) {
            tank.getItem(item);
            arr_items.splice(arr_items.find(item),1);
        }
    }
}
//物品自动消失
function itemAutoDestroy(){
    for(var i in arr_items){
        if(arr_items[i].time>0)
            arr_items[i].time--;
        else
            arr_items.splice(i,1);
    }
}
function Text(text,x,y){
    this.text=text;
    this.x=x;
    this.y=y;
    this.opacity=1;
    this.time=2500;
    this.speed=Config.textSpeed;
}
Text.prototype.move=function () {
    this.y-=this.speed;
    this.opacity-=0.01;
    if(this.opacity<=0){
        this.destroy();
    }
};
Text.prototype.destroy=function () {
    var index = arr_text.find(this);
    if (index!=-1)
        arr_text.splice(index,1);
};
function textAutoDestroy() {
    if (arr_text.length>0)
        for(var i in arr_text)
            arr_text[i].move();
}
function Base(){
    this.protect=ObstacleType.brick;
    this.destroy=false;
    this.x=350;
    this.y=700;
}
Base.prototype.changeProtect=function(type){
    this.protect=type;
    arr_obstacles[201].changeType(type);
    arr_obstacles[202].changeType(type);
    arr_obstacles[203].changeType(type);
    arr_obstacles[216].changeType(type);
    arr_obstacles[218].changeType(type);
    if (type!=ObstacleType.empty) {
        arr_obstacles[201].state=15;
        arr_obstacles[202].state=15;
        arr_obstacles[203].state=15;
        arr_obstacles[216].state=15;
        arr_obstacles[218].state=15;
    }
};
function generateMap() {
    for (var i = 0; i < 225; i++) {
        var ran = Math.random();
        if (ran < MapChance.empty){
            arr_map[i]=ObstacleType.empty;
            arr_mapstate[i]=0;
        } else {
            if (ran < MapChance.empty + MapChance.brick){
                arr_map[i]=ObstacleType.brick;
            } else if (ran < MapChance.empty + MapChance.brick + MapChance.steel){
                arr_map[i]=ObstacleType.steel;
            }else if (ran < MapChance.empty + MapChance.brick + MapChance.steel + MapChance.water){
                arr_map[i]=ObstacleType.water;
            } else if (ran < MapChance.empty + MapChance.brick + MapChance.steel + MapChance.water + MapChance.grass){
                arr_map[i]=ObstacleType.grass;
            }
            var stateRan=Math.random();
            if (stateRan<0.78)
                arr_mapstate[i]=15;
            else if(stateRan<0.85)
                arr_mapstate[i]=3;
            else if(stateRan<0.9)
                arr_mapstate[i]=5;
            else if(stateRan<0.95)
                arr_mapstate[i]=10;
            else
                arr_mapstate[i]=12;
        }
    }
    arr_map[0]=ObstacleType.empty;
    arr_map[7]=ObstacleType.empty;
    arr_map[14]=ObstacleType.empty;
    arr_map[214]=ObstacleType.empty;
    arr_map[220]=ObstacleType.empty;
    arr_map[201]=ObstacleType.brick;
    arr_map[202]=ObstacleType.brick;
    arr_map[203]=ObstacleType.brick;
    arr_map[216]=ObstacleType.brick;
    arr_map[217]=ObstacleType.empty;
    arr_map[218]=ObstacleType.brick;
    arr_map[112]=ObstacleType.steel;
    arr_mapstate[0]=0;
    arr_mapstate[7]=0;
    arr_mapstate[14]=0;
    arr_mapstate[214]=0;
    arr_mapstate[220]=0;
    arr_mapstate[201]=15;
    arr_mapstate[202]=15;
    arr_mapstate[203]=15;
    arr_mapstate[216]=15;
    arr_mapstate[217]=0;
    arr_mapstate[218]=15;
    arr_mapstate[112]=15;
}
function loadMap(){
    for(var i in arr_map){
        var x=i%15*50;
        var y=Math.floor(i/15)*50;
        switch(arr_map[i]){
            case ObstacleType.empty:
                arr_obstacles.push(new Obstacle(ObstacleType.empty,x,y,ObstaclePass.empty,ObstacleHardness.empty,arr_mapstate[i]));
                break;
            case ObstacleType.brick:
                arr_obstacles.push(new Obstacle(ObstacleType.brick,x,y,ObstaclePass.brick,ObstacleHardness.brick,arr_mapstate[i]));
                break;
            case ObstacleType.steel:
                arr_obstacles.push(new Obstacle(ObstacleType.steel,x,y,ObstaclePass.steel,ObstacleHardness.steel,arr_mapstate[i]));
                break;
            case ObstacleType.water:
                arr_obstacles.push(new Obstacle(ObstacleType.water,x,y,ObstaclePass.water,ObstacleHardness.water,arr_mapstate[i]));
                break;
            case ObstacleType.grass:
                arr_obstacles.push(new Obstacle(ObstacleType.grass,x,y,ObstaclePass.grass,ObstacleHardness.grass,arr_mapstate[i]));
                break;
            case ObstacleType.ice:
                arr_obstacles.push(new Obstacle(ObstacleType.ice,x,y,ObstaclePass.ice,ObstacleHardness.ice,arr_mapstate[i]));
                break;
        }
    }
}
//刷新页面数据显示
function updateData(){
    document.getElementById("CurrentStage").innerHTML="当前关卡："+Number(g_currentStage+1);
    document.getElementById("EnemyCount").innerHTML="剩余敌方坦克数量："+g_enemyNum;
    document.getElementById("HeroA_Load").innerHTML=g_heroAMaxLoad;
    document.getElementById("HeroA_LoadRate").innerHTML=g_heroALoadRate;
    document.getElementById("HeroA_BulletSpeed").innerHTML=g_heroABulletSpeed;
    document.getElementById("HeroA_Damage").innerHTML=g_heroADamage;
    document.getElementById("HeroA_Speed").innerHTML=g_heroASpeed;
    document.getElementById("HeroA_Life").innerHTML=g_heroALives;
    document.getElementById("HeroA_Score").innerHTML=g_heroAScore;
    if (g_players==2) {
        document.getElementById("HeroB_Score").innerHTML=g_heroBScore;
        document.getElementById("HeroB_Load").innerHTML=g_heroBLoaded;
        document.getElementById("HeroB_LoadRate").innerHTML=g_heroBLoadRate;
        document.getElementById("HeroB_BulletSpeed").innerHTML=g_heroBBulletSpeed;
        document.getElementById("HeroB_Damage").innerHTML=g_heroBDamage;
        document.getElementById("HeroB_Speed").innerHTML=g_heroBSpeed;
        document.getElementById("HeroB_Life").innerHTML=g_heroBLives;
    }else{
        document.getElementById("HeroB_Score").innerHTML="";
        document.getElementById("HeroB_Load").innerHTML="";
        document.getElementById("HeroB_LoadRate").innerHTML="";
        document.getElementById("HeroB_BulletSpeed").innerHTML="";
        document.getElementById("HeroB_Damage").innerHTML="";
        document.getElementById("HeroB_Speed").innerHTML="";
        document.getElementById("HeroB_Life").innerHTML="";
    }
}
function drawHomePage(){
    ctx.fillStyle=Color.homePageTitle;
    ctx.font="100px Cooper";
    ctx.fillText("T A N K",185,240);
    ctx.fillStyle=Color.homePageSub;
    ctx.font="40px Cooper";
    ctx.fillText("1 Player",305,400);
    ctx.fillText("2 Players",300,500);
    var x=250;
    var y;
    if (g_players==1) {
        y=390;
    }else{
        y=490;
    }
    ctx.beginPath();
    ctx.arc(x,y,10,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
}
function drawMap(type){
    for(var i in arr_obstacles){
        var o=arr_obstacles[i];
        if (o.type==type) {
            if (o.state&8){
                drawObstacle(o.type,o.x,o.y);
            }
            if (o.state&4){
                drawObstacle(o.type,o.x+g_cellLength/2,o.y);
            }
            if (o.state&2){
                drawObstacle(o.type,o.x,o.y+g_cellLength/2);
            }
            if (o.state&1){
                drawObstacle(o.type,o.x+g_cellLength/2,o.y+g_cellLength/2);
            }
        }
    }
}
function drawObstacle(type,x,y){
    switch(type){
        case ObstacleType.brick:
            ctx.fillStyle=Color.brink1;
            ctx.fillRect(x,y,g_cellLength/2,g_cellLength/2);
            ctx.fillStyle=Color.brink2;
            ctx.fillRect(x,y,11,1);
            ctx.fillRect(x,y+1,12,8);
            ctx.fillRect(x+17,y,8,1);
            ctx.fillRect(x+17,y+1,8,8);
            ctx.fillRect(x+16,y+1,1,7);
            ctx.fillRect(x+5,y+12,19,1);
            ctx.fillRect(x+5,y+13,20,8);
            ctx.fillRect(x+4,y+13,1,7);
            ctx.fillStyle=Color.brink3;
            ctx.fillRect(x,y+3,12,6);
            ctx.fillRect(x+20,y+3,5,6);
            ctx.fillRect(x+8,y+15,17,6);
            break;
        case ObstacleType.steel:
            ctx.fillStyle=Color.steel1;
            ctx.fillRect(x,y,g_cellLength/2,g_cellLength/2);
            ctx.fillStyle=Color.steel2;
            ctx.beginPath();
            ctx.moveTo(x,y+25);
            ctx.lineTo(x+25,y+25);
            ctx.lineTo(x+25,y);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle=Color.steel3;
            ctx.fillRect(x+6,y+6,13,13);
            break;
        case ObstacleType.water:
            ctx.fillStyle=Color.water1;
            ctx.fillRect(x,y,g_cellLength/2,g_cellLength/2);
            ctx.fillStyle=Color.water2;
            ctx.fillRect(x+3,y+3,3,3);
            ctx.fillRect(x+6,y+6,3,3);
            ctx.fillRect(x+9,y+9,3,3);
            ctx.fillRect(x+21,y,3,3);
            ctx.fillRect(x+17,y+9,3,3);
            ctx.fillRect(x+20,y+12,3,3);
            ctx.fillRect(x+9,y+15,3,3);
            ctx.fillRect(x+6,y+18,3,3);
            ctx.fillRect(x+12,y+18,3,3);
            ctx.fillRect(x,y+21,3,3);
            break;
        case ObstacleType.grass:
            ctx.fillStyle=Color.grass1;
            ctx.fillRect(x+2,y,21,25);
            ctx.fillRect(x,y+2,25,21);
            ctx.fillRect(x+1,y+1,23,23);
            ctx.fillStyle=Color.grass2;
            ctx.beginPath();
            ctx.moveTo(x+2,y);
            ctx.lineTo(x+2,y+2);
            ctx.lineTo(x,y+2);
            ctx.lineTo(x,y+19);
            ctx.lineTo(x+19,y);
            ctx.closePath();
            ctx.fill();
            ctx.fillRect(x+17,y+20,3,3);
            ctx.fillRect(x+17,y+11,6,3);
            ctx.fillRect(x+9,y+22,3,3);
            ctx.fillRect(x+19,y,3,2);
            ctx.fillRect(x+22,y+8,2,3);
            break;

    }
    //ctx.strokeStyle=Color.obstacleBorder;
    //ctx.strokeRect(x,y,g_cellLength/2,g_cellLength/2);
}
function drawBase(){
    var x=g_base.x;
    var y=g_base.y;
    ctx.fillStyle=Color.base;
    if (!g_base.destroy) {
        ctx.beginPath();
        ctx.moveTo(x+20,y+10);
        ctx.lineTo(x+40,y+25);
        ctx.lineTo(x+20,y+25);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(x+20,y+11,2,35);
        ctx.fillRect(x+12,y+45,20,2);
    }else{
        ctx.fillRect(x+20,y+35,2,10);
        ctx.fillRect(x+12,y+45,20,2);
    }
}
function drawTank(tank){
    ctx.fillStyle=tank.color1;
    ctx.strokeStyle=tank.color2;
    switch (tank.direction){
        case Direction.up:
            if (tank.borningProc<42) {
                ctx.fillRect(tank.x,tank.y+g_cellLength-tank.borningProc,11,tank.borningProc);
                ctx.fillRect(tank.x+39,tank.y+g_cellLength-tank.borningProc,11,tank.borningProc);
            }else{
                ctx.fillRect(tank.x,tank.y+8,11,42);
                ctx.fillRect(tank.x+39,tank.y+8,11,42);
            }
            if (tank.borningProc>5&&tank.borningProc<37) {
                ctx.fillRect(tank.x+12,tank.y+g_cellLength-tank.borningProc,26,tank.borningProc-5);
            }else if (tank.borningProc>=37) {ctx.fillRect(tank.x+12,tank.y+13,26,32);
            }
            if (tank.borningProc>11&&tank.borningProc<31) {
                ctx.beginPath();
                ctx.arc(tank.x+25,tank.y+29,10,Math.PI/2-Math.acos((22-tank.borningProc)/10),Math.PI/2+Math.acos((22-tank.borningProc)/10),false);
                ctx.closePath();
                ctx.fillStyle=tank.color2;
                ctx.fill();
            }else if (tank.borningProc>=31) {
                ctx.beginPath();
                ctx.arc(tank.x+25,tank.y+29,10,0,Math.PI*2,true);
                ctx.closePath();
                ctx.fillStyle=tank.color2;
                ctx.fill();
            }
            if (tank.borningProc>=21) {
                ctx.fillRect(tank.x+24,tank.y+g_cellLength-tank.borningProc,2,tank.borningProc-21);
                ctx.stroke();
            }
            //绘制生命条
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.g_lifeBorder;
                ctx.fillRect(tank.x+43,tank.y+9,3,40);
                if (tank.HP>tank.maxHP*0.7)
                    ctx.fillStyle=Color.fullLife;
                else if (tank.HP>tank.maxHP*0.3)
                    ctx.fillStyle=Color.midLife;
                else
                    ctx.fillStyle=Color.lowLife;
                var lifeRectHeight=Math.ceil(tank.HP/tank.maxHP*40);
                ctx.fillRect(tank.x+43,tank.y+9+40-lifeRectHeight,3,lifeRectHeight);
            }
            //绘制子弹装载条
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.reloadBorder;
                ctx.fillRect(tank.x+4,tank.y+9,3,40);
                ctx.fillStyle=Color.reloadBar;
                var reloadRectHeight=Math.ceil(tank.loadingProc/100*40);
                if (tank.loaded==tank.maxLoad) {
                    ctx.fillRect(tank.x+4,tank.y+9,3,40);
                }else{
                    ctx.fillRect(tank.x+4,tank.y+9+40-reloadRectHeight,3,reloadRectHeight);
                }
            }
            //绘制已装载子弹
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.bulletLoaded;
                for (var i=0;i<tank.loaded;i++) {
                    //ctx.fillRect(tank.x+28+i*4,tank.y+3,2,2);
                    ctx.fillRect(tank.x+24,tank.y+i*3+19,2,2);
                }
            }
            break;
        case Direction.right:
            ctx.fillRect(tank.x,tank.y,42,11);
            ctx.fillRect(tank.x,tank.y+39,42,11);
            ctx.fillRect(tank.x+5,tank.y+12,32,26);
            ctx.beginPath();
            ctx.arc(tank.x+22,tank.y+25,10,0,Math.PI*2,true);
            ctx.closePath();
            ctx.fillStyle=tank.color2;
            ctx.fill();
            ctx.fillRect(tank.x+22,tank.y+25,29,2);
            ctx.stroke();
            //绘制生命条
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.g_lifeBorder;
                ctx.fillRect(tank.x+1,tank.y+4,40,3);
                if (tank.HP>tank.maxHP*0.7)
                    ctx.fillStyle=Color.fullLife;
                else if (tank.HP>tank.maxHP*0.3)
                    ctx.fillStyle=Color.midLife;
                else
                    ctx.fillStyle=Color.lowLife;
                var lifeRectHeight=Math.ceil(tank.HP/tank.maxHP*40);
                ctx.fillRect(tank.x+1,tank.y+4,lifeRectHeight,3);
            }
            //绘制子弹装载条
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.reloadBorder;
                ctx.fillRect(tank.x+1,tank.y+43,40,3);
                ctx.fillStyle=Color.reloadBar;
                var reloadRectHeight=Math.ceil(tank.loadingProc/100*40);
                if (tank.loaded==tank.maxLoad) {
                    ctx.fillRect(tank.x+1,tank.y+43,40,3);
                }else{
                    ctx.fillRect(tank.x+1,tank.y+43,reloadRectHeight,3);
                }
            }
            //绘制已装载子弹
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.bulletLoaded;
                for (var i=0;i<tank.loaded;i++) {
                    //ctx.fillRect(tank.x+45,tank.y+29+i*4,2,2);
                    ctx.fillRect(tank.x+30-i*3,tank.y+25,2,2);
                }
            }
            break;
        case Direction.down:
            if (tank.borningProc<42) {
                ctx.fillRect(tank.x,tank.y,11,tank.borningProc);
                ctx.fillRect(tank.x+39,tank.y,11,tank.borningProc);
            }else{
                ctx.fillRect(tank.x,tank.y,11,42);
                ctx.fillRect(tank.x+39,tank.y,11,42);
            }
            if (tank.borningProc>5&&tank.borningProc<37) {
                ctx.fillRect(tank.x+12,tank.y+5,26,tank.borningProc-5);
            }else if (tank.borningProc>=37) {
                ctx.fillRect(tank.x+12,tank.y+5,26,32);
            }
            if (tank.borningProc>11&&tank.borningProc<31) {
                ctx.beginPath();
                ctx.arc(tank.x+25,tank.y+21,10,Math.PI*3/2-Math.acos((22-tank.borningProc)/10),Math.PI*3/2+Math.acos((22-tank.borningProc)/10),false);
                ctx.closePath();
                ctx.fillStyle=tank.color2;
                ctx.fill();
            }
            else if(tank.borningProc>=31){
                ctx.beginPath();
                ctx.arc(tank.x+25,tank.y+21,10,0,Math.PI*2,true);
                ctx.closePath();
                ctx.fillStyle=tank.color2;
                ctx.fill();
            }
            if (tank.borningProc>21) {
                ctx.fillRect(tank.x+24,tank.y+21,2,tank.borningProc-21);
                ctx.stroke();
            }
            //绘制生命条
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.g_lifeBorder;
                ctx.fillRect(tank.x+43,tank.y+1,3,40);
                if (tank.HP>tank.maxHP*0.7)
                    ctx.fillStyle=Color.fullLife;
                else if (tank.HP>tank.maxHP*0.3)
                    ctx.fillStyle=Color.midLife;
                else
                    ctx.fillStyle=Color.lowLife;
                var lifeRectHeight=Math.ceil(tank.HP/tank.maxHP*40);
                ctx.fillRect(tank.x+43,tank.y+1,3,lifeRectHeight);
            }
            //绘制子弹装载条
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.reloadBorder;
                ctx.fillRect(tank.x+4,tank.y+1,3,40);
                ctx.fillStyle=Color.reloadBar;
                var reloadRectHeight=Math.ceil(tank.loadingProc/100*40);
                if (tank.loaded==tank.maxLoad) {
                    ctx.fillRect(tank.x+4,tank.y+1,3,40);
                }else{
                    ctx.fillRect(tank.x+4,tank.y+1+40-reloadRectHeight,3,reloadRectHeight);
                }
            }
            //绘制已装载子弹
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.bulletLoaded;
                for (var i=0;i<tank.loaded;i++) {
                    //ctx.fillRect(tank.x+20-i*4,tank.y+45,2,2);
                    ctx.fillRect(tank.x+24,tank.y+29-i*3,2,2);
                }
            }
            break;
        case Direction.left:
            ctx.fillRect(tank.x+8,tank.y,42,11);
            ctx.fillRect(tank.x+8,tank.y+39,42,11);
            ctx.fillRect(tank.x+13,tank.y+12,32,26);
            ctx.beginPath();
            ctx.arc(tank.x+29,tank.y+25,10,0,Math.PI*2,true);
            ctx.closePath();
            ctx.fillStyle=tank.color2;
            ctx.fill();
            ctx.fillRect(tank.x,tank.y+25,29,2);
            ctx.stroke();
            //绘制生命条
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.g_lifeBorder;
                ctx.fillRect(tank.x+9,tank.y+4,40,3);
                if (tank.HP>tank.maxHP*0.7)
                    ctx.fillStyle=Color.fullLife;
                else if (tank.HP>tank.maxHP*0.3)
                    ctx.fillStyle=Color.midLife;
                else
                    ctx.fillStyle=Color.lowLife;
                var lifeRectHeight=Math.ceil(tank.HP/tank.maxHP*40);
                ctx.fillRect(tank.x+9+40-lifeRectHeight,tank.y+4,lifeRectHeight,3);
            }
            //绘制子弹装载条
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.reloadBorder;
                ctx.fillRect(tank.x+9,tank.y+43,40,3);
                ctx.fillStyle=Color.reloadBar;
                var reloadRectHeight=Math.ceil(tank.loadingProc/100*40);
                if (tank.loaded==tank.maxLoad) {
                    ctx.fillRect(tank.x+9,tank.y+43,40,3);
                }else{
                    ctx.fillRect(tank.x+9,tank.y+43,reloadRectHeight,3);
                }
            }
            //绘制已装载子弹
            if (tank.borningProc>=g_cellLength) {
                ctx.fillStyle=Color.bulletLoaded;
                for (var i=0;i<tank.loaded;i++) {
                    //ctx.fillRect(tank.x+3,tank.y+21-i*4,2,2);
                    ctx.fillRect(tank.x+19+i*3,tank.y+25,2,2);
                }
            }
            break;
    }
    //绘制无敌外框及无敌时间倒计时
    if (tank.godTime>=0) {
        ctx.font="18px SimSun";
        ctx.fillStyle=tank.color3;
        ctx.strokeRect(tank.x,tank.y,g_cellLength,g_cellLength);
        ctx.fillText(tank.godTime,tank.x+2,tank.y+16);
    }
    //绘制定时倒计时
    if (tank.freezeTime>=0) {
        ctx.font="18px SimSun";
        ctx.fillStyle=Color.freezeTime;
        ctx.fillText(tank.freezeTime,tank.x+2,tank.y+g_cellLength-2);
    }
}
function drawBullets(){
    ctx.fillStyle=Color.bullet;
    for (var i in arr_bullets){
        ctx.fillRect(arr_bullets[i].x-1,arr_bullets[i].y-1,3,3);
    }
}
function drawItems(item){
    ctx.strokeStyle=Color.item;
    ctx.fillStyle=Color.item;
    ctx.strokeRect(item.x,item.y,g_cellLength,g_cellLength);
    var x=item.x;
    var y=item.y;
    switch(item.type){
        case ItemType.life:
            ctx.beginPath();
            ctx.moveTo(x+25,y+15);
            ctx.bezierCurveTo(x+10,y,x-5,y+20,x+25,y+40);
            ctx.bezierCurveTo(x+55,y+20,x+40,y,x+25,y+15);
            ctx.closePath();
            //ctx.stroke();
            ctx.fill();
            break;
        case ItemType.bomb:
            ctx.beginPath();
            ctx.moveTo(x+30,y+3);
            ctx.lineTo(x+31,y+16);
            ctx.lineTo(x+39,y+15);
            ctx.lineTo(x+32,y+25);
            ctx.lineTo(x+44,y+37);
            ctx.lineTo(x+32,y+34);
            ctx.lineTo(x+35,y+47);
            ctx.lineTo(x+26,y+37);
            ctx.lineTo(x+22,y+44);
            ctx.lineTo(x+19,y+36);
            ctx.lineTo(x+6,y+40);
            ctx.lineTo(x+17,y+27);
            ctx.lineTo(x+5,y+13);
            ctx.lineTo(x+17,y+17);
            ctx.lineTo(x+16,y+8);
            ctx.lineTo(x+24,y+15);
            ctx.closePath();
            ctx.fill();
            break;
        case ItemType.heal:
            ctx.fillRect(x+18,y+7,14,36);
            ctx.fillRect(x+7,y+18,36,14);
            break;
        case ItemType.shield:
            ctx.beginPath();
            ctx.moveTo(x+25,y+7);
            ctx.quadraticCurveTo(x+35,y+15,x+42,y+15);
            ctx.quadraticCurveTo(x+42,y+38,x+25,y+45);
            ctx.quadraticCurveTo(x+8,y+38,x+8,y+15);
            ctx.quadraticCurveTo(x+15,y+15,x+25,y+8);
            ctx.closePath();
            ctx.fill();
            break;
        case ItemType.upgrade:
            ctx.beginPath();
            ctx.moveTo(x+25,y+8);
            ctx.lineTo(x+10,y+23);
            ctx.lineTo(x+19,y+23);
            ctx.lineTo(x+19,y+42);
            ctx.lineTo(x+31,y+42);
            ctx.lineTo(x+31,y+23);
            ctx.lineTo(x+40,y+23);
            ctx.closePath();
            ctx.fill();
            break;
        case ItemType.speed:
            ctx.beginPath();
            ctx.arc(x+25,y+25,20,0,Math.PI*2,true);
            ctx.lineTo(x+40,y+25);
            ctx.arc(x+25,y+25,15,0,Math.PI*2,false);
            ctx.lineTo(x+45,y+25);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x+25,y+25,10,0,Math.PI*2,true);
            ctx.closePath();
            ctx.stroke();
            for(var i=0;i<5;i++){
                ctx.beginPath();
                ctx.moveTo(x+25+Math.cos(Math.PI*(0.3+0.4*i))*5,y+25+Math.sin(Math.PI*(0.3+0.4*i))*5);
                ctx.arc(x+25,y+25,8,(0.15+0.4*i)*Math.PI,(0.45+0.4*i)*Math.PI);
                ctx.closePath();
                ctx.stroke();
            }
            break;
        case ItemType.bulletSpeed:
            ctx.fillRect(x+8,y+20,16,10)
            ctx.beginPath();
            ctx.moveTo(x+24,y+21);
            ctx.quadraticCurveTo(x+33,y+21,x+38,y+25);
            ctx.quadraticCurveTo(x+33,y+29,x+24,y+29);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x+30,y+15);
            ctx.lineTo(x+40,y+21);
            ctx.moveTo(x+30,y+35);
            ctx.lineTo(x+40,y+29);
            ctx.stroke();
            ctx.closePath();
            break;
        case ItemType.freeze:
            ctx.beginPath();
            ctx.arc(x+25,y+25,20,0,Math.PI*2);
            ctx.arc(x+25,y+25,19,0,Math.PI*2);
            ctx.closePath();
            ctx.fillRect(x+24,y+10,2,15);
            ctx.fillRect(x+24,y+24,12,2);
            ctx.stroke();
            break;
        case ItemType.load:
            for(i=-1;i<2;i++){
                ctx.beginPath();
                ctx.moveTo(x+25+10*i,y+8);
                ctx.quadraticCurveTo(x+21+10*i,y+14,x+22+10*i,y+22);
                ctx.lineTo(x+28+10*i,y+20);
                ctx.quadraticCurveTo(x+29+10*i,y+14,x+25+10*i,y+8);
                ctx.closePath();
                ctx.fill();
                ctx.fillRect(x+21+10*i,y+20,8,20);
            }
            break;
        case ItemType.loadRate:
            ctx.beginPath();
            ctx.arc(x+25,y+25,4,0,Math.PI*2);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x+25,y+25,14,0,Math.PI*2,true);
            ctx.lineTo(x+32,y+25);
            ctx.arc(x+25,y+25,7,0,Math.PI*2,false);
            ctx.lineTo(x+39,y+25);
            ctx.closePath();
            ctx.fill();
            for(var i=0;i<6;i++){
                ctx.beginPath();
                ctx.moveTo(x+25+Math.sin(Math.PI*i/3+Math.PI/12)*20,y+25+Math.cos(Math.PI*i/3+Math.PI/12)*20);
                ctx.lineTo(x+25+Math.sin(Math.PI*i/3+Math.PI/4)*20,y+25+Math.cos(Math.PI*i/3+Math.PI/4)*20);
                ctx.lineTo(x+25+Math.sin(Math.PI*i/3+Math.PI*7/24)*14,y+25+Math.cos(Math.PI*i/3+Math.PI*7/24)*14);
                ctx.lineTo(x+25+Math.sin(Math.PI*i/3+Math.PI/24)*14,y+25+Math.cos(Math.PI*i/3+Math.PI/24)*14);
                ctx.closePath();
                ctx.fill();
            }
            break;
        case ItemType.spade:
            ctx.beginPath();
            ctx.moveTo(x+6,y+17);
            ctx.lineTo(x+17,y+6);
            ctx.lineTo(x+19,y+8);
            ctx.lineTo(x+8,y+19);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x+12,y+12);
            ctx.lineTo(x+35,y+35);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x+30,y+40);
            ctx.lineTo(x+40,y+30);
            ctx.lineTo(x+46,y+36);
            ctx.lineTo(x+46,y+46);
            ctx.lineTo(x+36,y+46);
            ctx.closePath();
            ctx.fill();
            break;
    }
}
function drawText(){
    ctx.fillStyle=Color.text;
    ctx.font="20px Cooper";
    for (var i in arr_text){
        ctx.globalAlpha=arr_text[i].opacity;
        ctx.fillText(arr_text[i].text,arr_text[i].x,arr_text[i].y);
    }
    ctx.globalAlpha=1;
}
function drawStageChange(){
    ctx.fillStyle=Color.stageChangeBackground;
    ctx.fillRect(0,0,g_fieldWidth,g_stageAnimationVal);
    ctx.fillRect(0,g_fieldHeight-g_stageAnimationVal,g_fieldWidth,g_stageAnimationVal);
    if (g_stageAnimationVal>=g_fieldHeight/2) {
        ctx.fillStyle=Color.stageChangeText;
        ctx.font="40px Cooper";
        ctx.fillText("Stage  "+parseInt(g_currentStage+1),300,400);
    }
}
//关卡切换时的动画
function stageAnimation(state){
    if(state==0){
        if (g_stageAnimationVal<=g_fieldHeight/2) {
            g_stageAnimationVal+=Config.stageAnimationSpeed;
        }else{
            g_stageAnimationState=1;
            clearInterval(timer_stageChange);
        }
    }else if (state==1) {
        if (g_stageAnimationVal>0) {
            g_stageAnimationVal-=Config.stageAnimationSpeed;
        }else{
            g_stageAnimationState=0;
            g_stageAnimationVal=0;
            g_flashPage=2;
            //loadMap(g_currentStage);
            clearInterval(timer_stageChange);
            stageStart();
        }
    }
}
function drawGameOverText(){
    ctx.fillStyle=Color.failText;
    ctx.font="40px Cooper";
    if (g_win) {
        ctx.fillText("You Win",287,g_gameOverTextY);
    }else{
        ctx.fillText("Game Over",262,g_gameOverTextY);
    }
}
function gameOverTextTimer(){
    if (g_gameOverTextY<=Config.gameOverTextEndY) {
        clearInterval(timer_gameOverText);
    }else{
        g_gameOverTextY-=2;
    }
}
function flash(){
    if (g_flashPage==0) {
        ctx.clearRect(0,0,g_fieldWidth,g_fieldHeight);
        drawHomePage();
    }else if (g_flashPage==1) {
        if (g_stageAnimationState==1) {
            ctx.clearRect(0,0,g_fieldWidth,g_fieldHeight);
            ///画下一关背景
            drawMap();
        }
        drawStageChange();
    }else if (g_flashPage==2||g_flashPage==3) {
        ctx.clearRect(0,0,g_fieldWidth,g_fieldHeight);
        drawMap(ObstacleType.brick);
        drawMap(ObstacleType.steel);
        drawMap(ObstacleType.water);
        drawBase();
        if (g_heroA!=undefined) {drawTank(g_heroA);}
        if (g_heroB!=undefined) {drawTank(g_heroB);}
        if (arr_enemies.length>0) {
            for (var i=0;i<arr_enemies.length;i++) {
                drawTank(arr_enemies[i]);
            }
        }
        drawMap(ObstacleType.grass);
        drawBullets();
        for(var i in arr_items){
            drawItems(arr_items[i]);
        }
        drawText();
        updateData();
        if (g_flashPage==3) {
            drawGameOverText();
        }
    }
}
function initialization(){
    document.body.addEventListener("keydown",keyDown,true);
    document.body.addEventListener("keydown",keyDownControl,true);
    document.body.addEventListener("keyup",keyUpControl,true);
    canvas=document.getElementById("field");
    ctx=canvas.getContext("2d");
    chk_sound=document.getElementById("sound");
    chk_sound.addEventListener("click",soundSwitch,true);
    //g_sound=chk_sound.checked;
    au_stageStart=document.getElementById("au_stageStart");
    au_heroAShoot=document.getElementById("au_heroAShoot");
    au_heroBShoot=document.getElementById("au_heroBShoot");
    au_shootIndestructible=document.getElementById("au_shootIndestructible");
    au_boom=document.getElementById("au_boom");
    au_findItem=document.getElementById("au_findItem");
    au_getItem=document.getElementById("au_getItem");
    au_lifeUp=document.getElementById("au_lifeUp");
    au_baseDestroy=document.getElementById("au_baseDestroy");
    au_pause=document.getElementById("au_pause");
    au_enemyMove=document.getElementById("au_enemyMove");
    au_heroMove=document.getElementById("au_heroMove");
    au_enemyMove.pause();
    au_heroMove.pause();
    au_enemyMove.loop=true;
    au_enemyMove.volume=0.5;
    au_heroMove.loop=true;
    au_heroMove.volume=0.8;
    g_fieldWidth=750;
    g_fieldHeight=750;
    g_cellLength=50;
    //g_gameStart=false;
    g_flashPage=0;//0:首页;1:关卡切换;2:游戏界面
    g_players=1;
    g_stageAnimationVal=0;
    g_stageAnimationState=0;//0：关卡结束动画，1：关卡开始动画
    g_currentStage=0;
    g_gameOverTextY=750;
    g_enemyNum=Config.enemyNum;
    //坦克A参数
    g_heroALives=Config.heroALives;
    g_heroAMaxHP=Config.heroAMaxHP;
    g_heroAHP=g_heroAMaxHP;
    g_heroASpeed=Config.heroASpeed;
    g_heroABulletType=Config.heroABulletType;
    g_heroAMaxLoad=Config.heroAMaxLoad;
    g_heroALoaded=g_heroAMaxLoad;
    g_heroALoadRate=Config.heroALoadRate;
    g_heroABulletSpeed=Config.heroABulletSpeed;
    g_heroADamage=Config.heroADamage;
    g_heroAScore=0;
    //坦克B参数
    g_heroBLives=0;
    g_heroBMaxHP=Config.heroBMaxHP;
    g_heroBHP=g_heroBMaxHP;
    g_heroBSpeed=Config.heroBSpeed;
    g_heroBBulletType=Config.heroBBulletType;
    g_heroBMaxLoad=Config.heroBMaxLoad;
    g_heroBLoaded=g_heroBMaxLoad;
    g_heroBLoadRate=Config.heroBLoadRate;
    g_heroBBulletSpeed=Config.heroBBulletSpeed;
    g_heroBDamage=Config.heroBDamage;
    g_heroBScore=0;
    //其它全局变量
    g_heroA=undefined;
    g_heroB=undefined;
    g_findItemScoreA=Config.findItemScore;
    g_findItemScoreB=Config.findItemScore;
    g_heroFreezeTime=-1;
    g_enemyFreezeTime=-1;
    g_heroFreezed=false;
    g_enemyFreezed=false;
    g_paused=false;
    g_win=false;
    //全局数组变量
    arr_map=[];
    arr_mapstate=[];
    arr_tanks=[];
    arr_enemies=[];
    arr_obstacles=[];
    arr_bullets=[];
    arr_items=[];
    arr_enemyDirection=[];
    arr_text=[];
    generateMap();

    timer_flash=setInterval(flash,Config.timer_flasherval);
}
function stageStart(){
    generateMap();
    g_base=new Base();
    timer_heroMove=setInterval("heroAuto()",Config.moveInterval);
    timer_enemyAuto=setInterval("enemyAuto()",Config.moveInterval);
    timer_born=setInterval(born,Config.bornInterval);
    timer_reload=setInterval(reload,Config.reloadInterval);
    timer_bulletMove=setInterval(bulletMove,Config.bulletMoveInterval);
    timer_godTime=setInterval(godTimeChange,1000);
    timer_generateTank=setInterval(generateTank,500);
    timer_generateItem=setInterval(generateItem,1000*Config.itemInterval);
    timer_itemAutoDestroy=setInterval(itemAutoDestroy,1000);
    timer_textAutoDestroy=setInterval(textAutoDestroy,Config.textInterval)
}
function nextStage(){
    if(g_currentStage+1==Config.stageNum){
        gameOver(true);
    }else {
        setTimeout(function () {
            clearInterval(timer_heroMove);
            clearInterval(timer_enemyAuto);
            clearInterval(timer_born);
            clearInterval(timer_reload);
            clearInterval(timer_bulletMove);
            clearInterval(timer_godTime);
            clearInterval(timer_generateTank);
            clearInterval(timer_generateItem);
            clearInterval(timer_itemAutoDestroy);
            clearInterval(timer_textAutoDestroy);
            if (g_heroFreezed) {
                clearInterval(timer_heroFreeze);
            }
            if (g_enemyFreezed) {
                clearInterval(timer_enemyFreeze);
            }
            arr_items.splice(0, arr_items.length);
            arr_bullets.splice(0, arr_bullets.length);
            arr_text.splice(0, arr_text.length);
            g_flashPage = 1;
            g_stageAnimationState = 0;
            timer_stageChange = setInterval("stageAnimation(" + g_stageAnimationState + ")", 5);
            arr_obstacles.splice(0, arr_obstacles.length);
            if (g_heroA != undefined) {
                g_heroA.arr_move.splice(0, g_heroA.arr_move.length);
                g_heroA.HP = g_heroA.maxHP;
                g_heroA.direction = Direction.up;
                g_heroA.freezeTime = -1;
                g_heroA.x = 200;
                g_heroA.y = 700;
                g_heroA.borning = true;
                g_heroA.borningProc = 0;
            }
            if (g_heroB != undefined) {
                g_heroB.arr_move.splice(0, g_heroB.arr_move.length);
                g_heroB.HP = g_heroB.maxHP;
                g_heroB.x = 500;
                g_heroB.y = 700;
                g_heroB.direction = Direction.up;
                g_heroB.freezeTime = -1;
                g_heroB.borning = true;
                g_heroB.borningProc = 0;
            }
            g_enemyNum = Config.enemyNum;
            g_currentStage++;
            loadMap(g_currentStage);
        }, 3000);
    }
}
function gameOver(win){
    g_win=win;
    if (!win) {
        document.body.removeEventListener("keydown",keyDownControl,true);
        document.body.removeEventListener("keyup",keyUpControl,true);
        if (g_heroA!=undefined) {g_heroA.arr_move.splice(0,g_heroA.arr_move.length);}
        if (g_heroB!=undefined) {g_heroB.arr_move.splice(0,g_heroB.arr_move.length);}
    }
    g_flashPage=3;
    timer_gameOverText=setInterval(gameOverTextTimer,Config.endTextInterval);
}
function pause(pause){
    if (pause) {
        if(chk_sound.checked) {
            au_pause.currentTime = 0;
            au_pause.play();
        }
        clearInterval(timer_heroMove);
        clearInterval(timer_enemyAuto);
        clearInterval(timer_born);
        clearInterval(timer_reload);
        clearInterval(timer_bulletMove);
        clearInterval(timer_godTime);
        clearInterval(timer_generateTank);
        clearInterval(timer_generateItem);
        clearInterval(timer_itemAutoDestroy);
        clearInterval(timer_textAutoDestroy);
        if (g_heroFreezed) {clearInterval(timer_heroFreeze);}
        if (g_enemyFreezed) {clearInterval(timer_enemyFreeze);}
        document.body.removeEventListener("keydown",keyDownControl,true);
        document.body.removeEventListener("keyup",keyUpControl,true)
        for(var i in arr_enemies){
            arr_enemyDirection.push(arr_enemies[i].arr_move.pop());
        }
        if (g_heroA!=undefined) {
            g_heroA.arr_move.splice(0,g_heroA.arr_move.length);
        }
        if (g_players==2&&g_heroB!=undefined) {
            g_heroB.arr_move.splice(0,g_heroB.arr_move.length);
        }
        if(chk_sound.checked) {
            if (!au_stageStart.ended && au_stageStart.currentTime != 0) {au_stageStart.pause();}
            if (!au_boom.ended && au_boom.currentTime != 0) {au_boom.pause();}
            if (!au_findItem.ended && au_findItem.currentTime != 0) {au_findItem.pause();}
            if (!au_getItem.ended && au_getItem.currentTime != 0) {au_getItem.pause();}
            if (!au_heroAShoot.ended && au_heroAShoot.currentTime != 0) {au_heroAShoot.pause();}
            if (!au_heroBShoot.ended && au_heroBShoot.currentTime != 0) {au_heroBShoot.pause();}
            if (!au_shootIndestructible.ended && au_shootIndestructible.currentTime != 0) {au_shootIndestructible.pause();}
            if (!au_lifeUp.ended && au_lifeUp.currentTime != 0) {au_lifeUp.pause();}
            if (!au_baseDestroy.ended && au_baseDestroy.currentTime != 0) {au_baseDestroy.pause();}
            if (!au_heroMove.ended && au_heroMove.currentTime != 0) {au_heroMove.pause();}
            if (!au_enemyMove.ended && au_enemyMove.currentTime != 0) {au_enemyMove.pause();}
        }
    }else{
        timer_heroMove=setInterval("heroAuto()",Config.moveInterval);
        timer_enemyAuto=setInterval("enemyAuto()",Config.moveInterval);
        timer_born=setInterval(born,Config.bornInterval);
        timer_reload=setInterval(reload,Config.reloadInterval);
        timer_bulletMove=setInterval(bulletMove,Config.bulletMoveInterval);
        timer_godTime=setInterval(godTimeChange,1000);
        timer_generateTank=setInterval(generateTank,500);
        timer_generateItem=setInterval(generateItem,1000*Config.itemInterval);
        timer_itemAutoDestroy=setInterval(itemAutoDestroy,1000);
        timer_textAutoDestroy=setInterval(textAutoDestroy,Config.textInterval);
        if (g_heroFreezed) {timer_heroFreeze=setInterval(heroFreezeTimeChange,1000);}
        if (g_enemyFreezed) {timer_enemyFreeze=setInterval(enemyFreezeTimeChange,1000);}
        document.body.addEventListener("keydown",keyDownControl,true);
        document.body.addEventListener("keyup",keyUpControl,true)
        for(var i in arr_enemies){
            arr_enemies[i].arr_move.push(arr_enemyDirection.shift());
        }
        if (chk_sound.checked){
            if (!au_stageStart.ended&&au_stageStart.currentTime!=0) {au_stageStart.play();}
            if (!au_boom.ended&&au_boom.currentTime!=0) {au_boom.play();}
            if (!au_findItem.ended&&au_findItem.currentTime!=0) {au_findItem.play();}
            if (!au_getItem.ended&&au_getItem.currentTime!=0) {au_getItem.play();}
            if (!au_heroAShoot.ended&&au_heroAShoot.currentTime!=0) {au_heroAShoot.play();}
            if (!au_heroBShoot.ended&&au_heroBShoot.currentTime!=0) {au_heroBShoot.play();}
            if (!au_shootIndestructible.ended&&au_shootIndestructible.currentTime!=0) {au_shootIndestructible.play();}
            if (!au_lifeUp.ended&&au_lifeUp.currentTime!=0) {au_lifeUp.play();}
            if (!au_baseDestroy.ended&&au_baseDestroy.currentTime!=0) {au_baseDestroy.play();}
            if (!au_heroMove.ended&&au_heroMove.currentTime!=0) {au_heroMove.play();}
            if (!au_enemyMove.ended&&au_enemyMove.currentTime!=0) {au_enemyMove.play();}
        }
    }
}
function keyDown(e){
    var code=e.keyCode;
    if (g_flashPage==0) {
        if (code==38||code==40) {//上下方向键
            if (g_players==1) {g_players=2;g_heroBLives=Config.heroBLives;}
            else{g_players=1;g_heroBLives=0;}
        }
        if (code==13) {//回车键
            timer_stageChange=setInterval("stageAnimation("+g_stageAnimationState+")",5);
            loadMap(g_currentStage);
            g_flashPage=1;
        }
    }else if (g_flashPage==1) {
        if (g_stageAnimationState==1&&g_stageAnimationVal>=g_fieldHeight/2&&code==13) {
            if (chk_sound.checked)
                au_stageStart.play();
            timer_stageChange=setInterval("stageAnimation("+g_stageAnimationState+")",5);
        }
    }else if (g_flashPage==2) {
        if(code==80){
            if (g_paused) {
                pause(false);
            }else{
                pause(true);
            }
            g_paused=!g_paused;
        }
    }else if (g_flashPage==3){
        if (code==13&&g_gameOverTextY<=Config.gameOverTextEndY) {
            g_flashPage=0;
            clearInterval(timer_heroMove);
            clearInterval(timer_enemyAuto);
            clearInterval(timer_born);
            clearInterval(timer_reload);
            clearInterval(timer_bulletMove);
            clearInterval(timer_godTime);
            clearInterval(timer_generateTank);
            clearInterval(timer_generateItem);
            clearInterval(timer_itemAutoDestroy);
            clearInterval(timer_textAutoDestroy);
            if (g_heroFreezed) {clearInterval(timer_heroFreeze);}
            if (g_enemyFreezed) {clearInterval(timer_enemyFreeze);}
            initialization();
        }
    }
}
function keyDownControl(e){
    var code=e.keyCode;
    if (g_flashPage==2) {
        switch (code) {
            case 74://J
                if (g_heroA!=undefined) {g_heroA.shoot();}
                break;
            case 97://1
                if (g_heroB!=undefined) {g_heroB.shoot();}
                break;
            case 87://W
                if (g_heroA!=undefined&&g_heroA.arr_move.find(0)==-1) {g_heroA.arr_move.push(Direction.up);}
                break;
            case 68://D
                if (g_heroA!=undefined&&g_heroA.arr_move.find(1)==-1) {g_heroA.arr_move.push(Direction.right);}
                break;
            case 83://S
                if (g_heroA!=undefined&&g_heroA.arr_move.find(2)==-1) {g_heroA.arr_move.push(Direction.down);}
                break;
            case 65://A
                if (g_heroA!=undefined&&g_heroA.arr_move.find(3)==-1) {g_heroA.arr_move.push(Direction.left);}
                break;
            case 37://左
                if (g_heroB!=undefined&&g_heroB.arr_move.find(3)==-1) {g_heroB.arr_move.push(Direction.left);}
                break;
            case 38://上
                if (g_heroB!=undefined&&g_heroB.arr_move.find(0)==-1) {g_heroB.arr_move.push(Direction.up);}
                break;
            case 39://右
                if (g_heroB!=undefined&&g_heroB.arr_move.find(1)==-1) {g_heroB.arr_move.push(Direction.right);}
                break;
            case 40://下
                if (g_heroB!=undefined&&g_heroB.arr_move.find(2)==-1) {g_heroB.arr_move.push(Direction.down);}
                break;
        }
    }
}
function keyUpControl(e){
    var code=e.keyCode;
    if (g_flashPage==2) {
        switch (code) {
            case 87://W
                if (g_heroA!=undefined) {g_heroA.arr_move.splice(g_heroA.arr_move.find(Direction.up),1);}
                break;
            case 68://D
                if (g_heroA!=undefined) {g_heroA.arr_move.splice(g_heroA.arr_move.find(Direction.right),1);}
                break;
            case 83://S
                if (g_heroA!=undefined) {g_heroA.arr_move.splice(g_heroA.arr_move.find(Direction.down),1);}
                break;
            case 65://A
                if (g_heroA!=undefined) {g_heroA.arr_move.splice(g_heroA.arr_move.find(Direction.left),1);}
                break;
            case 37://左
                if (g_heroB!=undefined) {g_heroB.arr_move.splice(g_heroB.arr_move.find(Direction.left),1);}
                break;
            case 38://上
                if (g_heroB!=undefined) {g_heroB.arr_move.splice(g_heroB.arr_move.find(Direction.up),1);}
                break;
            case 39://右
                if (g_heroB!=undefined) {g_heroB.arr_move.splice(g_heroB.arr_move.find(Direction.right),1);}
                break;
            case 40://下
                if (g_heroB!=undefined) {g_heroB.arr_move.splice(g_heroB.arr_move.find(Direction.down),1);}
                break;
        }
    }
}
function soundSwitch() {
    if (!chk_sound.checked){
        au_stageStart.pause();
        au_heroAShoot.pause();
        au_heroBShoot.pause();
        au_shootIndestructible.pause();
        au_boom.pause();
        au_findItem.pause();
        au_getItem.pause();
        au_lifeUp.pause();
        au_baseDestroy.pause();
        au_pause.pause();
        au_enemyMove.pause();
        au_heroMove.pause();
        au_stageStart.currentTime=0;
        au_heroAShoot.currentTime=0;
        au_heroBShoot.currentTime=0;
        au_shootIndestructible.currentTime=0;
        au_boom.currentTime=0;
        au_findItem.currentTime=0;
        au_getItem.currentTime=0;
        au_lifeUp.currentTime=0;
        au_baseDestroy.currentTime=0;
        au_pause.currentTime=0;
        au_enemyMove.currentTime=0;
        au_heroMove.currentTime=0;
    }
}
initialization();