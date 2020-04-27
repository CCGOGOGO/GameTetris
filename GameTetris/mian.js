//每次移动的距离
var STEP=40;  
// 18行，10列
var ROW_COUNT=18;
var COL_COUNT=10;

//创建每个模型的数据源
var MODELS=[
    // 第一个模型数据源
    {
        0:{
            row:2,
            col:0
        },//在一个4*4方格里面根据行数和列数把块元素列出来
        1:{
            row:2,
            col:1
        },
        2:{
            row:2,
            col:2
        },
        3:{
            row:1,
            col:2
        }
    },
    // 凸形
    {
        0:{
            row:1,
            col:1
        },//在一个4*4方格里面根据行数和列数把块元素列出来
        1:{
            row:0,
            col:0
        },
        2:{
            row:1,
            col:0
        },
        3:{
            row:2,
            col:0
        }
    },
    {
        0:{
            row:1,
            col:1
        },//在一个4*4方格里面根据行数和列数把块元素列出来
        1:{
            row:1,
            col:2
        },
        2:{
            row:2,
            col:1
        },
        3:{
            row:2,
            col:2
        }
    },
    {
        0:{
            row:0,
            col:0
        },//在一个4*4方格里面根据行数和列数把块元素列出来
        1:{
            row:0,
            col:1
        },
        2:{
            row:0,
            col:2
        },
        3:{
            row:0,
            col:3
        }
    },
    {
        0:{
            row:1,
            col:1
        },//在一个4*4方格里面根据行数和列数把块元素列出来
        1:{
            row:1,
            col:2
        },
        2:{
            row:2,
            col:2
        },
        3:{
            row:2,
            col:3
        }
    },
   
]

// 变量
// 当前使用的模型
var currentModel={}
// 标记16宫格的位置
var currentX=0;
var currentY=0;

//每个对象都以key和value的的形式，k=行_列:v=块元素
var fixedBlocks={}// 通过这个对象记录所有块元素的位置

var timer=null;

//入口方法
function init(){
    createModel();
    onkeyDown();
}

// 根据模型的数据源来创建对应的块元素
function createModel(){
    if(isGameOver()){
        gameOver();
        return;
    }

    // 确定当前使用哪个模型
    currentModel=MODELS[_.random(0,MODELS.length-1)];
    // 重新初始化16宫格的位置
    currentX=0;
    currentY=0;
    // 生成对应数量的块元素
    for(var key in currentModel){
        var divEle=document.createElement("div");
        divEle.className="active";
        document.getElementById("container").appendChild(divEle);
    }
    //定位块元素的位置
    locationBlocks();

    autoDown();
}

// 根据数据源定位块元素的位置
function locationBlocks(){
    checkBound();  //在元素定位之前判断一下越界行为
    //1. 拿到所有的块元素
    var eles=document.getElementsByClassName("active");
    for(var i=0;i<eles.length;i++)
    {
        // activity,单个块元素
        var activity=eles[i];
        // 2.找到每个块元素对应的数据（行/列）
        var blockModel=currentModel[i];
        // 3.根据每个块元素对应的数据来指定块元素的位置
        activity.style.top=(currentY+blockModel.row)*STEP+"px";
        activity.style.left=(currentX+blockModel.col)*STEP+"px";
    }
}


//控制移动
function onkeyDown(){
    document.onkeydown=function(event){
    switch(event.keyCode){
        case 37:
            move(-1,0);
            console.log("左");
            break;
        case 38:
            rotate();
            console.log("上");
            break;
        case 39:
            move(1,0);
            console.log("右");
            break;
        case 40:
            move(0,1);
            console.log("下");
            break;
    }
    }
}

function move(x,y){
    // var activity=document.getElementsByClassName("active");
    // activity.style.top=parseInt(activity.style.top||0)+STEP*y+"px";
    // activity.style.left=parseInt(activity.style.left||0)+STEP*x+"px";

    if(isMeet(currentX+x,currentY+y,currentModel)){
        // 底部的触碰发生在移动16宫格的时候，并且这移动是y轴的变化
        if(y!==0){
            // 模型之间底部发生触碰
            fixedBottomModel();
        }
        return;
    }

    currentX += x;
    currentY += y;
    // 根据16宫格的位置来重新定位块元素
    locationBlocks();

}

// 旋转模型
function rotate(){
    // 旋转后的行=旋转前的列,旋转后的列=3-旋转前的行

    // 克隆currentModel
    var cloneCurrentModel=_.cloneDeep(currentModel);

    // 遍历我们的模型数据源
    for(var key in cloneCurrentModel){
        // 块元素的数据源
        var blockModel=cloneCurrentModel[key];
        // 实现算法
        var temp=blockModel.row;
        blockModel.row=blockModel.col;
        blockModel.col=3-temp;
    }

    // 如果旋转之后会发生触碰，那么久不需要进行旋转了
    if(isMeet(currentX,currentY,cloneCurrentModel)){
        return;
    }

    currentModel=cloneCurrentModel;

    locationBlocks();
}

// 控制模型只能在容器中移动
function checkBound(){
    var leftBound=0,
        rightBound=COL_COUNT,
        bottomBound=ROW_COUNT;
    for(var key in currentModel){
        var blockModel=currentModel[key];
        // 左侧越界
        if((blockModel.col+currentX)<leftBound){
            currentX++;
        }
        // 右侧越界
        if((blockModel.col+currentX)>=rightBound){
            currentX--;
        }
        if((blockModel.row+currentY)>=bottomBound){
            currentY--;
            // 到了底部调用这个函数，函数里面讲元素的类名改变了，元素也不能再用动的方法不能再动了
            fixedBottomModel();  
        }
    }
}

// 把模型固定在底部
function fixedBottomModel(){
    // 1.改变模型样式
    // 2.让模型不可以再进行移动
    var activity=document.getElementsByClassName("active");
    for(var i=activity.length-1;i>=0;i--){  //从后往前
        //拿到每个块元素
        var activityEle=activity[i];
        // 更改块元素的类名
        activityEle.className="fixed_model";
        // 把该元素放入变量中
        var blockModel=currentModel[i];
        fixedBlocks[(currentY+blockModel.row)+'_'+(currentX+blockModel.col)]=activityEle;
    }
    
    isRemoveLine()
    // 3.创建新的模型
    createModel();
}

// 判断模型中的触碰问题
// x,y表示16宫格将要移动到的位置，model表示模型将要完成的变化
function isMeet(x,y,model){
    // 判断触碰就是判断活动中的模型将要移动到的位置是否已有元素，如果存在返回true，否则返回true
    for(var k in model){
        var blockModel=model[k];
        // 判断该位置是否已存在块元素
        if(fixedBlocks[(y+blockModel.row)+'_'+(x+blockModel.col)]){
            return true;
        }
    }
    return false;
}

// 判断一行是否被铺满
function isRemoveLine(){
    // 判断在一行中每一列都存在块元素
    // 遍历所有行中的所有列
    for(var i=0;i<ROW_COUNT;i++){//行
        var flag=true;//这是一个标记符，先假设这一行是铺满的
        for(var j=0;j<COL_COUNT;j++){//列
            if(!fixedBlocks[i+"_"+j]){
                flag=false;
                break;
            }
        }
        if(flag){// 此时该行已经被铺满
            removeLine(i);
        }
    }
}

// 清理被铺满的这一行
function removeLine(line){
    for(var i=0;i<COL_COUNT;i++){
        // 1.删除该行中所有的块元素
        document.getElementById("container").removeChild(fixedBlocks[line+"_"+i]);
        // 2.删除该行中所有块元素所记录的位置信息
        fixedBlocks[line+"_"+i]=null;
    }
    downLine(line);
}

// 被清理行之上的块元素下落
function downLine(line){
    for(var i=line-1;i>=0;i--){
        for(var j=0;j<COL_COUNT;j++){
            if(!fixedBlocks[i+"_"+j]){
                continue;
            }
            // 1.被清理行之上的所有块元素所在行数+1
            fixedBlocks[(i+1)+"_"+j]=fixedBlocks[i+"_"+j];
             // 2.让块元素在容器中的位置下落
            fixedBlocks[(i+1)+"_"+j].style.top=(i+1)*STEP+"px";
             // 3.清理掉之前的块元素
             fixedBlocks[i+"_"+j]=null;
        }
    }
}

// 让模型自动的下落
function autoDown(){
    if(timer){
        clearInterval(timer);
    }
    timer=setInterval(function(){
        move(0,1);
    },600)
}

// 判断游戏结束
function isGameOver(){
    // 当第0行存在块元素的时候，游戏结束
    for(var i=0;i<COL_COUNT;i++){
        if(fixedBlocks["0_"+i]){
            return true;
        }
    }
    return false;
}

// 结束游戏
function gameOver(){
    // 1.停止定时器
    if(timer){
        clearInterval(timer);
    }
    // 弹出对话框
    alert('游戏结束！');
}