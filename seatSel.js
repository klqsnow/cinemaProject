/*params = {
    container_seats:null,//座位容器
    container_radar:null,//雷达图容器
    img_screen:null,//屏幕图片
    img_watermark:null,//水印图片
    seatsData:[],//座位数据,

}*/
let cameraMapUtil = function (params) {
    if(!(this instanceof cameraMapUtil)) return new cameraMapUtil(params);

    //数据存储
    let originData = {
        canvas_seats: null,
        canvas_radar: null,
        img_screen: null,
        img_seat: null,
        img_watermark: null,
        seatsData: [],
        rows: 0,
        columns: 0,
        seatsAreaWidth: 0,
        seatsAreaHeight: 0,
    };

    //根据参数初始化数据值
    for(let key in originData){
        originData[key] = params[key]||originData[key]
    }

    let me = this;

    let columns = originData.columns; //列
    let rows = originData.rows;//行

    let canvasSeat = originData.canvas_seats;
    let canvasRadar = originData.canvas_radar;
    let ctxSeat = canvasSeat.getContext('2d');
    let ctxRadar = canvasRadar.getContext('2d');

    let img_screen = originData.img_screen;
    let img_seat = originData.img_seat;

    let ctxSeatData = {
        x:0,
        y:0,
        scale:1
    }

    canvasSeat.width = 2*originData.seatsAreaWidth;
    canvasSeat.height = 2*originData.seatsAreaHeight;
    canvasSeat.style = "width: " + originData.seatsAreaWidth + "px;height: "+originData.seatsAreaHeight+"px;background: rgba(0,0,0,.1);"

    let seatCellSpace = Math.floor((canvasSeat.width-50)*8/(9*columns - 1));//计算座位占据的空间大小
    let allSeatWidth =  seatCellSpace*columns+seatCellSpace/8*(columns-1);
    let allSeatHeight = seatCellSpace*rows + seatCellSpace/4*(rows-1);
    let seatsPaddingLR = (canvasSeat.width - allSeatWidth) / 2;
    let seatsOffsetTop = 80;//座位距顶部的距离
    let seatsOffsetBottom = 80;//座位距顶部的距离


    function drawScreen() {
        ctxSeat.save();
        var x = ctxSeatData.x+ seatsPaddingLR + allSeatWidth/2*ctxSeatData.scale
        var y = 0;
        ctxSeat.drawImage(img_screen, 0, 0, 301, 44, x - 150, y, 301, 50);
        ctxSeat.font="30px Arial";
        var txt="1号厅银幕";
        var txtWidth = ctxSeat.measureText(txt).width
        ctxSeat.fillText(txt,x-txtWidth/2,38);
        ctxSeat.restore();
    }

    function drawSeats() {
        ctxSeat.save();
        let space = seatCellSpace * ctxSeatData.scale;
        let startX = ctxSeatData.x + seatsPaddingLR, startY = ctxSeatData.y + seatsOffsetTop, columnSpace = space/8, rowspace = space/4;
        for(let i=0;i<rows;++i){
            for(let j=0;j<columns;++j){
                ctxSeat.drawImage(img_seat, 0, 0, 80, 80, startX, startY, space, space);
                startX += space + columnSpace;
            }
            startY += space + rowspace;
            startX = ctxSeatData.x + seatsPaddingLR;
        }
        ctxSeat.restore();
    }

    function drawSeatIndex() {
        ctxSeat.save()
        //设置座位引导图的属性
        let width = 32;
        let offsetX = 10;
        let offsetY = seatsOffsetTop + ctxSeatData.y;

        let paddingTB = 5;

        let space = seatCellSpace*ctxSeatData.scale;

        ctxSeat.beginPath();
        ctxSeat.arc(offsetX+width/2, offsetY-paddingTB, width/2, 0, Math.PI, true);
        ctxSeat.lineTo(offsetX,offsetY+space*5/4*rows - space/4+paddingTB);
        ctxSeat.arc(offsetX+width/2, offsetY+space*5/4*rows - space/4+paddingTB, width/2,Math.PI ,0, true);
        ctxSeat.lineTo(offsetX+width, offsetY-paddingTB)
        ctxSeat.fillStyle = 'rgba(0,0,0,.3)';
        ctxSeat.fill()
        /*ctx.restore();
        //画排号
        ctx.save();*/
        ctxSeat.font="30px Arial";
        ctxSeat.fillStyle = 'white'

        for(let row=0;row<rows;++row){
            let txt = (row+1)+'';
            let txtWidth = ctxSeat.measureText(txt).width
            ctxSeat.fillText(txt,offsetX + (width-txtWidth)/2, offsetY + seatCellSpace*ctxSeatData.scale*5/4*row + (seatCellSpace*ctxSeatData.scale + 16)/2)
        }
        ctxSeat.restore();
    }

    function drawCenterLine() {
        //画一条中线
        ctxSeat.save()
        //ctx.translate(ctxCurrentXY.x*scale,0);
        let space = seatCellSpace*ctxSeatData.scale;
        let y = ctxSeatData.y + seatsOffsetTop;
        let x = ctxSeatData.x + seatsPaddingLR;
        ctxSeat.beginPath();
        ctxSeat.setLineDash([20,5]);
        ctxSeat.moveTo(x + allSeatWidth*ctxSeatData.scale/2, y)
        ctxSeat.lineTo(x + allSeatWidth*ctxSeatData.scale/2, y+allSeatHeight*ctxSeatData.scale)
        ctxSeat.lineWidth = 1*ctxSeatData.scale;
        ctxSeat.strokeStyle = "red";
        ctxSeat.stroke()
        ctxSeat.restore()
    }

    function initEventListener(){
        canvasSeat.addEventListener('click', me)
        canvasSeat.addEventListener('touchstart', me)
        canvasSeat.addEventListener('touchmove', me)
        canvasSeat.addEventListener('touchend', me)
    }

    me.init = function init(){
        me.drawCanvas();
        me.drawRadarCanvas();
        initEventListener();
        return me;
    }

    me.drawCanvas = function drawCanvas() {
        ctxSeat.clearRect(0,0,canvasSeat.width,canvasSeat.height);
        drawCenterLine()
        drawSeats();
        drawScreen();
        drawSeatIndex();
        return me;
    }

    me.checkBound = function checkBound() {
        if(ctxSeatData.x > 0){
            ctxSeatData.x = 0;
        }else if(ctxSeatData.x + allSeatWidth*ctxSeatData.scale + 2*seatsPaddingLR < canvasSeat.width){
            ctxSeatData.x = canvasSeat.width - allSeatWidth*ctxSeatData.scale - 2*seatsPaddingLR;
        }
        if(ctxSeatData.y > 0){
            ctxSeatData.y = 0;
        }else if(ctxSeatData.y + seatsOffsetTop + allSeatHeight*ctxSeatData.scale + seatsOffsetBottom < canvasSeat.height){
            if(allSeatHeight*ctxSeatData.scale+seatsOffsetTop+seatsOffsetBottom<canvasSeat.height){
                ctxSeatData.y = 0 ;
            }else{
                ctxSeatData.y = canvasSeat.height- allSeatHeight*ctxSeatData.scale - seatsOffsetTop - seatsOffsetBottom
            }
        }
    }


    let data = {};
    me.handleEvent = function handleEvent(event) {

        switch (event.type) {
            case 'touchstart':
                handleTouchStart(event);
                break;
            case 'touchmove':
                handleTouchMove(event);
                break;
            case 'touchend':
                handleTouchEnd(event);
                break;
            case 'click':
                handleClick(event)
            default:
                break;
        }

        if(!callbacks[event.type]){
            return;
        }
        callbacks[event.type].forEach(function (func) {
            func();
        })

        function handleTouchStart (e) {
            e = e.targetTouches[0];
            data.startX = e.pageX;
            data.startY = e.pageY;
            data.isDrag = true;
        }
        function handleTouchMove(e) {
            if(!data.isDrag) return;
            e = e.targetTouches[0];

            var offsetX = e.pageX - data.startX;
            var offsetY = e.pageY - data.startY;

            data.startX = e.pageX;
            data.startY = e.pageY;
            ctxSeatData.x += offsetX*2;
            ctxSeatData.y += offsetY*2;



            me.drawCanvas();
            me.drawRadarCanvas();

        }
        function handleTouchEnd(e) {
            data.isDrag = false;

            if(ctxSeatData.x > 0){
                ctxSeatData.x = 0;
            }else if(ctxSeatData.x + allSeatWidth*ctxSeatData.scale + 2*seatsPaddingLR < canvasSeat.width){
                ctxSeatData.x = canvasSeat.width - allSeatWidth*ctxSeatData.scale - 2*seatsPaddingLR;
            }
            if(ctxSeatData.y > 0){
                ctxSeatData.y = 0;
            }else if(ctxSeatData.y + seatsOffsetTop + allSeatHeight*ctxSeatData.scale + seatsOffsetBottom < canvasSeat.height){
                if(allSeatHeight*ctxSeatData.scale+seatsOffsetTop+seatsOffsetBottom<canvasSeat.height){
                    ctxSeatData.y = 0 ;
                }else{
                    ctxSeatData.y = canvasSeat.height- allSeatHeight*ctxSeatData.scale - seatsOffsetTop - seatsOffsetBottom
                }
            }
            me.drawCanvas()
            me.drawRadarCanvas();

        }
        function handleClick(e) {
            //判断点击位置
            let cellColOffset = (e.offsetX*2 - ctxSeatData.x - seatsPaddingLR)%(seatCellSpace*9/8*ctxSeatData.scale);
            let column  = Math.floor((e.offsetX*2 - ctxSeatData.x - seatsPaddingLR)/(seatCellSpace*9/8*ctxSeatData.scale));
            let cellRowOffset = (e.offsetY*2 - ctxSeatData.y - seatsOffsetTop)%(seatCellSpace*5/4*ctxSeatData.scale);
            let row  = Math.floor((e.offsetY*2 - ctxSeatData.y - seatsOffsetTop)/(seatCellSpace*5/4*ctxSeatData.scale));

            if(cellColOffset>0&&cellColOffset<=seatCellSpace*ctxSeatData.scale&&column>=0&&cellRowOffset>0&&row>=0&&cellRowOffset<=seatCellSpace*ctxSeatData.scale){
                console.log('click seat',(row+1)+'排'+(column+1) + '座位',cellColOffset,seatCellSpace*ctxSeatData.scale);
            }

            let seatX = e.offsetX*2 - ctxSeatData.x - seatsPaddingLR;
            let seatY = e.offsetY*2 - ctxSeatData.y - seatsOffsetTop;
            ctxSeatData.x -= 0.1 * seatX/ctxSeatData.scale;
            ctxSeatData.y -= 0.1 * seatY/ctxSeatData.scale;

            ctxSeatData.scale = (ctxSeatData.scale*10+1)/10;

            me.checkBound();
            me.drawCanvas();
            me.drawRadarCanvas();
        }
    }


    //雷达图参数
    let seatSpace_radar = 8,colSpace_radar = 4,rowSpace_radar = 4,padding_radar=12,paddingTop_radar= 30;
    canvasRadar.width = seatSpace_radar*columns+colSpace_radar*(columns - 1)+2*padding_radar;
    canvasRadar.height = seatSpace_radar*rows + rowSpace_radar*(rows - 1)+padding_radar+paddingTop_radar;

    canvasRadar.style = "width: " + canvasRadar.width/2 + "px;height: "+canvasRadar.height/2+"px;background: rgba(0,0,0,.6);"

    me.drawRadarCanvas = function drawRadarCanvas() {
        ctxRadar.clearRect(0,0,canvasRadar.width, canvasRadar.height);
        drawRadarScreen();
        drawRadarSeats();
        drawRadarRangeRect();
    }

    function drawRadarScreen() {
        ctxRadar.save()
        ctxRadar.strokeStyle = '#0abaff';
        ctxRadar.fillStyle = 'green';
        ctxRadar.lineWidth = 2;
        let width = canvasRadar.width*0.8;
        let height = 8;
        let startX =canvasRadar.width*0.1;
        let startY = 8 ;
        ctxRadar.strokeRect(startX, startY, width, height)
        ctxRadar.restore();
    }

    function drawRadarSeats() {
        ctxRadar.save();
        ctxRadar.fillStyle = 'white';
        let startX = padding_radar,startY=paddingTop_radar;

        for(let row=0;row<rows;++row){
            for(let col=0;col<columns;++col){
                if(col == 5){
                    ctxRadar.save()
                    ctxRadar.fillStyle = 'red';
                    ctxRadar.fillRect(startX,startY,seatSpace_radar,seatSpace_radar);
                    ctxRadar.restore();
                }else{
                    ctxRadar.fillRect(startX,startY,seatSpace_radar,seatSpace_radar);
                }

                startX += seatSpace_radar + colSpace_radar;
            }
            startX = padding_radar;
            startY += seatSpace_radar + rowSpace_radar;
        }

        ctxRadar.restore();
    }

    function drawRadarRangeRect() {
        ctxRadar.save();
        ctxRadar.strokeStyle = 'red';
        ctxRadar.lineWidth = 2;
        let startX = padding_radar-5, startY = paddingTop_radar-5;
        let seatsWidth = seatSpace_radar*columns+colSpace_radar*(columns - 1),seatsHeight = seatSpace_radar*rows + rowSpace_radar*(rows - 1);

        let scaleY = allSeatHeight*ctxSeatData.scale/(canvasSeat.height-seatsOffsetTop-seatsOffsetBottom);
        let rangeRectHeight = seatsHeight/(scaleY<1?1:scaleY);

        let scaleX = allSeatWidth*ctxSeatData.scale/(canvasSeat.width-2*seatsPaddingLR);
        let rangeRectWidth = seatsWidth/(scaleX<1?1:scaleX);

        let rectOffsetX = ctxSeatData.x*seatsWidth/(canvasSeat.width*ctxSeatData.scale);
        let rectOffsetY = ctxSeatData.y*seatsHeight/(allSeatHeight*ctxSeatData.scale)

        ctxRadar.strokeRect(startX-rectOffsetX, startY-rectOffsetY, rangeRectWidth+10, rangeRectHeight+10);

        ctxRadar.restore();
    }

    let callbacks = {};
    me.on = function (eventType, callback) {
        if (!callbacks[eventType]){
            callbacks[eventType] = [];
        }
        callbacks[eventType].push(callback)
        return me;
    }

}
