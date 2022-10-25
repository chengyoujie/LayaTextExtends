/**引擎中添加属性声明 */
declare module Laya {
    export interface TextStyle {
        
		/**
		 * html文本的属性
		 */
		htmlStyle: { style?: layaTextExt.HtmlStyle, text: string }[] | null;
    }

    export interface Text {
        /**
         * 设置htmlText
         * 
         * 示例：
         ```
         <font color='#FF0000'>红色</font>         
         <font width="200" >指定宽度</font>
         <img src="comp/image.png" width="120" height="120"/>
         <b>粗体</b>
         <font size='46'>改变文字大小</font>
         <i>斜体</i>
         <u underlineColor="#00FF00">下划线</u>
         <a href="Laya.Event.LINK事件派发的参数">超链</a>
         ```
         */
		htmlText:string;
    }
}

module layaTextExt {
    
    /**
     * Text拓展、修改 
     * @author cyj
     */
    export class TextExtends {
        /**
         * 按钮拓展
         * 增加单张图片点击的效果
         */
        static extend(){
            /**存放文字中图片的容器 */
        let imgContentName = "__textImageContent";//sprite
        /** 存储行高数组的属性名字 */
        let lineHeightPropName = "__textLineHeights";//number[]
        /** 存储点击区域的数组属性名字 */
        let htmlHitListPropName = "__htmlHitList";//HTMLHitRect[]
        /** 对于居中对齐时计算小的字符的测试文本*/    
        let samlTestText = "1"
        /** 对于文本居中对齐时 是否需要计算文本的高度正则   只有全是小文本【高度比较低的文本】的才计算 */
        let smalHeightTextReg = /^(\d|\.|\+|\-|[a-z]| )+$/gi;
        //重写TextStyle .reset 清空htmlStyle
        let textStylePrototype = Laya.TextStyle.prototype;
        let oldReset = textStylePrototype.reset;
        Object.defineProperties(textStylePrototype, {
            reset:{
                value:function(){
                    this.htmlStyle = undefined;
                    return oldReset.call(this)
                }
            }
        });
        //Laya.Text 增加htmlText属性
        let textPrototype = Laya.Text.prototype;
        let oldSetText = textPrototype.set_text;
        let oldDestroy = textPrototype.destroy;
        Object.defineProperties(textPrototype,
            {

                destroy:{
                    value:function(destroyChild: boolean = true){
                        this.clearHtml();
                        oldDestroy.call(this, destroyChild)
                    },
                    enumerable:true,
                },
                /**
                 * 清除html相关内容
                 */
                clearHtml:{
                    value:function(){
                        if(this[imgContentName]){
                            this.removeImageContent();
                            this[imgContentName].removeSelf();
                            this[imgContentName] = null;
                        }
                        this.off(Laya.Event.CLICK, this, this._handleClickText)
                        this[lineHeightPropName] = null;
                        if(this[htmlHitListPropName]){
                            let list:HTMLHitRect[] = this[htmlHitListPropName];
                            for(let i=0;i<list.length; i++){
                                PoolPush(list[i]);
                            }
                            list.length = 0;
                            this[htmlHitListPropName] = null;
                        }
                    },
                    enumerable:false,
                },

                htmlText:{
                    set(value: string): void {
                        // if(this._htmlText != value)//todo 后面去掉注释
                        {
                            this._htmlText = value;
                            this.clearHtml();
                            let textInfo = HtmlTextParser.parser(value);
                            this._getTextStyle().htmlStyle=textInfo.htmlStyle;
                            this._text = textInfo.text;
                            this.lang(value + "");
                            this.isChanged = true;
                            this.event(Laya.Event.CHANGE);
                            if (this.borderColor) {
                                this._setBorderStyleColor(0, 0, this.width, this.height, this.borderColor, 1);
                            }
                        }
                    },
                    get():string{
                        return this._htmlText;
                    },
                    enumerable:true
                },
                //重写设置文本
                set_text:{
                    value:function(value:string){
                        this._htmlText = null;
                        this._getTextStyle().htmlStyle = null;
                        this.clearHtml();
                        oldSetText.call(this, value);
                    },
                    enumerable:true
                    
                },
                //行的高度列表
                _lineHeights:{
                    get:function(){
                        if(!this[lineHeightPropName])this[lineHeightPropName] = [];
                        return this[lineHeightPropName];
                    }, 
                    enumerable:true,
                },
                //html中有交互的列表
                _htmlHitList:{
                    get:function(){
                        if(!this[htmlHitListPropName])this[htmlHitListPropName] = [];
                        return this[htmlHitListPropName];
                    },
                    enumerable:true,
                },
                removeImageContent:{
                    value:function(){
                        let content = this[imgContentName] as Laya.Sprite;
                        if(content){
                            for(let i=content.numChildren-1; i>=0; i--){
                                let item = content.getChildAt(i);
                                PoolPush(item);
                            }
                        }
                    },
                    enumerable:true,
                },
                //重写渲染文本
                _renderText:{
                    value:function(){
                        this.removeImageContent();
                        var padding = this.padding;
                        var visibleLineCount = this._lines.length;
                        // overflow为scroll或visible时会截行
                        if (this.overflow != Laya.Text.VISIBLE) {
                            visibleLineCount = Math.min(visibleLineCount, Math.floor((this.height - padding[0] - padding[2]) / (this.leading + this._charSize.height)) + 1);
                        }

                        var beginLine = this.scrollY / (this._charSize.height + this.leading) | 0;

                        var graphics = this.graphics;
                        graphics.clear(true);

                        var ctxFont = this._getContextFont();
                        Laya.Browser.context.font = ctxFont;

                        //处理垂直对齐
                        var startX = padding[3];
                        var textAlgin = "left";
                        var lines = this._lines;
                        var lineHeight = this.leading + this._charSize.height;
                        var style = <Laya.TextStyle>this._style;
                        var tCurrBitmapFont = ((<Laya.TextStyle>this._style)).currBitmapFont;
                        if (tCurrBitmapFont) {
                            lineHeight = this.leading + tCurrBitmapFont.getMaxHeight();
                        }
                        var startY = padding[0];

                        //处理水平对齐
                        if ((!tCurrBitmapFont) && this._width > 0 && this._textWidth <= this._width) {
                            if (this.align == "right") {
                                textAlgin = "right";
                                startX = this._width - padding[1];
                            } else if (this.align == "center") {
                                textAlgin = "center";
                                startX = this._width * 0.5 + padding[3] - padding[1];
                            }
                        }

                        //drawBg(style);
                        let bitmapScale=1;
                        if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
                            bitmapScale = tCurrBitmapFont.fontSize / this.fontSize;
                        }
                        if (this._height > 0) {
                            var tempVAlign = (this._textHeight > this._height) ? "top" : this.valign;
                            if (tempVAlign === "middle")
                                startY = (this._height - visibleLineCount /bitmapScale* lineHeight) * 0.5 + padding[0] - padding[2];
                            else if (tempVAlign === "bottom")
                                startY = this._height - visibleLineCount /bitmapScale* lineHeight - padding[2];
                        }

                        //渲染
                        if (this._clipPoint) {
                            graphics.save();
                            if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
                                var tClipWidth: number;
                                var tClipHeight: number;

                                this._width ? tClipWidth = (this._width - padding[3] - padding[1]) : tClipWidth = this._textWidth;
                                this._height ? tClipHeight = (this._height - padding[0] - padding[2]) : tClipHeight = this._textHeight;

                                tClipWidth *= bitmapScale;
                                tClipHeight *= bitmapScale;

                                graphics.clipRect(padding[3], padding[0], tClipWidth, tClipHeight);
                            } else {
                                graphics.clipRect(padding[3], padding[0], this._width ? (this._width - padding[3] - padding[1]) : this._textWidth, this._height ? (this._height - padding[0] - padding[2]) : this._textHeight);
                            }
                            this.repaint();
                        }

                        var password = style.asPassword;
                        // 输入框的prompt始终显示明文
                        if (("prompt" in (this as any)) && (this as any)['prompt'] == this._text)
                            password = false;
                        
                        var x = 0, y = 0;
                        var end = Math.min(this._lines.length, visibleLineCount + beginLine) || 1;
                        if(this[imgContentName]){
                            this[imgContentName].removeChildren();
                        }
                        if(style.htmlStyle){//处理html文本
                            let lineOffY = 0;//每行文本的偏移位置
                            let htmlLineHeight = 0;
                            let lineIndex = 0;
                            let htmlCtxFont = ctxFont;//当前浏览器使用的字体信息
                            let needListenerClick = false;
                            if(this._height>0){//计算开始的Y值
                                var tempVAlign = (this._textHeight > this._height) ? "top" : this.valign;
                                if (tempVAlign === "middle")
                                    startY = (this._height - this._textHeight) * 0.5 + padding[0] - padding[2];
                                else if (tempVAlign === "bottom")
                                    startY = this._height - this._textHeight - padding[2];
                            }
                            y = startY  - (this._clipPoint ? this._clipPoint.y : 0);
                            for (var i = 0; i < style.htmlStyle.length; i++) {
                                let htmlInfo = style.htmlStyle[i];
                                var htmlText = htmlInfo.text;
                                //ctxFont 检查
                                let curHtmlCtxFont = ctxFont;
                                if(htmlInfo.style){
                                    if(htmlInfo.style.font  || htmlInfo.style.size || htmlInfo.style.italic || htmlInfo.style.bold){
                                        curHtmlCtxFont = this._getContextFontCustom({font:htmlInfo.style.font, 
                                            fontSize:htmlInfo.style.size,italic:htmlInfo.style.italic, bold:htmlInfo.style.bold})
                                    }
                                }
                                if(htmlCtxFont != curHtmlCtxFont){
                                    htmlCtxFont = curHtmlCtxFont;
                                    Laya.Browser.context.font = htmlCtxFont
                                }
                                let charsWidth = this._getTextWidth(htmlText);
                                let charsContentWidth = charsWidth;
                                var _word: any;
                                if (password) {
                                    let len = htmlText.length;
                                    htmlText = "";
                                    for (var j:number = len; j > 0; j--) {
                                        htmlText += "●";
                                    }
                                }
                                if (htmlText == null) htmlText = "";

                                if(i==0 || htmlText=="\n"){//对于左对齐或者右对齐的 需要在开始或者换行后计算下开始位置
                                    if(htmlText == "\n")
                                    {
                                        y += htmlLineHeight + this.leading;
                                        lineIndex ++;
                                        if(this.overflow == Laya.Text.HIDDEN){//超过隐藏后面的就不渲染了
                                            if(this.height && y>=this.height){
                                                return;
                                            }
                                        }
                                    }
                                    x = padding[3] - (this._clipPoint ? this._clipPoint.x : 0);
                                    let nextLineW = this._lineWidths[lineIndex];//this._getTextWidth(nextLineTxt);
                                    htmlLineHeight = this._lineHeights[lineIndex];
                                    if(textAlgin == "center")
                                    {
                                        x = this._width * 0.5 + padding[3] - padding[1] - nextLineW*0.5;
                                    }else if(textAlgin == "right"){
                                        x = this._width - padding[1] - nextLineW;
                                    }
                                }
                                if(htmlText == "\n"){//换行处理
                                    continue;
                                }
                                let color = this.color;
                                let stroke = style.stroke;
                                let strokeColor = style.strokeColor;
                                let align = "left";
                                let addWidth = charsWidth;
                                let height = this._charSize.height;
                                let valign = this.valign;
                                let underline = this.underline;
                                let underlineColor = this.underlineColor;
                                let addItem:Laya.Sprite;//添加的子对象如图片
                                lineOffY = 0;
                                if(htmlInfo.style){//处理htmltext的属性
                                    if(htmlInfo.style.color)color = htmlInfo.style.color;
                                    if(htmlInfo.style.stroke)stroke = htmlInfo.style.stroke;
                                    if(htmlInfo.style.valign)valign = htmlInfo.style.valign;
                                    if(htmlInfo.style.size)height = htmlInfo.style.size;
                                    if(htmlInfo.style.height)height = htmlInfo.style.height;
                                    if(htmlInfo.style.underline)underline = htmlInfo.style.underline;
                                    if(htmlInfo.style.underlineColor)underlineColor = htmlInfo.style.underlineColor;
                                    if(htmlInfo.style.strokeColor)strokeColor = htmlInfo.style.strokeColor;
                                    
                                    if(htmlInfo.style.width)
                                    {
                                        charsWidth = htmlInfo.style.width;
                                        addWidth = charsWidth;
                                    }
                                    if(htmlInfo.style.tag == "image"||htmlInfo.style.tag == "img"){
                                        if(!charsWidth)
                                        {
                                            charsWidth = this.fontSize;
                                            addWidth = charsWidth;
                                        }
                                    }
                                    if(htmlInfo.style.align)
                                    {
                                        align = htmlInfo.style.align;
                                        let pos = 0;
                                        let w = htmlInfo.style.width;
                                        if(!w){
                                            if(i+1<style.htmlStyle.length){
                                                if(style.htmlStyle[i+1].text == "\n"){
                                                    w = this._textWidth - x;
                                                }
                                            }
                                        }
                                        if(w)
                                        {
                                            if(w>charsContentWidth){
                                                if (align == "right") {
                                                    pos = x+w;// - charsWidth;
                                                    if(x < pos)x = pos;
                                                    addWidth = 0;
                                                } else if (align == "center") {
                                                    pos = x + w* 0.5;
                                                    if(x < pos)x = pos;
                                                    addWidth = w*0.5;
                                                }
                                            }
                                        }else{
                                            if(align=="right")
                                            {
                                                x = x + charsWidth;
                                                addWidth = 0;
                                            }else if(align == "center"){
                                                addWidth = charsWidth/2;
                                                x = x + charsWidth/2;
                                            }
                                        }
                                        
                                    }
                                    if(htmlInfo.style.tag == "image"||htmlInfo.style.tag == "img"){
                                        if(!this[imgContentName]){
                                            this[imgContentName] = new Laya.Sprite();
                                            this.addChild(this[imgContentName])
                                        }
                                        let img = PoolGet(TextImage);
                                        img.skin = htmlInfo.style.src;
                                        addItem = img;
                                        this[imgContentName].addChild(addItem);
                                    }
                                    if(htmlInfo.style.tag == "a"){
                                        needListenerClick = true;
                                        var hitRec: HTMLHitRect = PoolGet(HTMLHitRect);
                                        hitRec.rec.setTo(x, y, charsWidth, height);
                                        hitRec.href = htmlInfo.style?htmlInfo.style.href:null;
                                        this._htmlHitList.push(hitRec);
                                    }
                                }
                                if(htmlLineHeight > height + this.leading){//文本垂直对其处理
                                    let h = height;
                                    //判断是否全数字的
                                    smalHeightTextReg.lastIndex = -1;
                                    if(smalHeightTextReg.test(htmlInfo.text)){//如果全部数字， 重新算下行高
                                        var measureResult: any = null;
                                        if (Laya.Render.isConchApp) {
                                            measureResult = (window as any).conchTextCanvas.measureText(samlTestText);
                                        } else {
                                            measureResult = Laya.Browser.context.measureText(samlTestText);
                                        }
                                        if(measureResult){
                                            h = (measureResult.height || (measureResult.actualBoundingBoxAscent) || this.fontSize)
                                        }
                                    }
                                    if(valign=="bottom"){
                                        lineOffY = htmlLineHeight - h;
                                    }else if(valign == "middle"){
                                        lineOffY = (htmlLineHeight - h)/2;
                                    }else{
                                        lineOffY = 0;
                                    }
                                }
                                if(addItem){
                                    addItem.width = charsWidth;
                                    addItem.height = height;
                                    addItem.x = x;
                                    addItem.y = y+lineOffY;
                                }
                                if(underline){//下划线
                                    let underlineX = x;
                                    let underlineY = y;
                                    switch (align) {
                                        case 'center':
                                            underlineX -= charsWidth / 2;
                                            break;
                                        case 'right':
                                            underlineX -= charsWidth;
                                            break;
                                        case 'left':
                                        default:
                                            break;
                                    }
                                    underlineY += this._charSize.height+lineOffY;
                                    this._graphics.drawLine(underlineX, underlineY, underlineX + charsWidth, underlineY, underlineColor || color, 1);
                                }
    
                                this._words || (this._words = []);
                                if (this._words.length > (i - beginLine)) {
                                    _word = this._words[i - beginLine];
                                } else {
                                    _word = new Laya.WordText();
                                    this._words.push(_word);
                                }
                                _word.setText(htmlText);
                                ((<Laya.WordText>_word)).splitRender = this._singleCharRender;
                                
                                stroke ? graphics.fillBorderText(_word, x, y+lineOffY, htmlCtxFont, color, align, stroke, strokeColor) : graphics.fillText(_word, x, y+lineOffY, htmlCtxFont, color, align);
                                x += addWidth;
                            }//loop end
                            if(needListenerClick){
                                this.on(Laya.Event.CLICK, this, this._handleClickText)
                            }
                        }else{//处理text的显示
                            for (var i = beginLine; i < end; i++) {
                                var word = lines[i];
                                var _word: any;
                                if (password) {
                                    let len = word.length;
                                    word = "";
                                    for (var j:number = len; j > 0; j--) {
                                        word += "●";
                                    }
                                }
    
                                if (word == null) word = "";
                                x = startX - (this._clipPoint ? this._clipPoint.x : 0);
                                y = startY + lineHeight * i - (this._clipPoint ? this._clipPoint.y : 0);
    
                                this.underline && this._drawUnderline(textAlgin, x, y, i);
    
                                if (tCurrBitmapFont) {
                                    var tWidth = this.width;
                                    if (tCurrBitmapFont.autoScaleSize) {
                                        tWidth = this.width * bitmapScale;
                                        x*=bitmapScale;
                                        y*=bitmapScale;
                                    }
                                    tCurrBitmapFont["_drawText"](word, this, x, y, this.align, tWidth);
                                } else {
                                    this._words || (this._words = []);
                                    if (this._words.length > (i - beginLine)) {
                                        _word = this._words[i - beginLine];
                                    } else {
                                        _word = new Laya.WordText();
                                        this._words.push(_word);
                                    }
                                    _word.setText(word);
                                    ((<Laya.WordText>_word)).splitRender = this._singleCharRender;
                                    style.stroke ? graphics.fillBorderText(_word, x, y, ctxFont, this.color, textAlgin, style.stroke, style.strokeColor) : graphics.fillText(_word, x, y, ctxFont, this.color, textAlgin);
                                }
                            }
                        }
                        
                        if (tCurrBitmapFont && tCurrBitmapFont.autoScaleSize) {
                            var tScale = 1 / bitmapScale;
                            this.scale(tScale, tScale);
                        }

                        if (this._clipPoint) graphics.restore();

                        this._startX = startX;
                        this._startY = startY;
                    },
                    enumerable:true,
                    writable:true
                },
                /**
                 * 用户自定义文本格式
                 */
                _getContextFontCustom:{
                    value:function(custom:{italic:boolean, bold:boolean, fontSize:number, font:string}): string {
                        let italic = custom.italic!=undefined?custom.italic:this.italic;
                        let bold = custom.bold!=undefined?custom.bold:this.bold;
                        let fontSize = custom.fontSize!=undefined?custom.fontSize:this.fontSize;
                        let font = custom.font!=undefined?custom.font:this.font;
                        return (italic ? "italic " : "") + (bold ? "bold " : "") + fontSize + "px " + (Laya.Browser.onIPhone ? (Laya.Text.fontFamilyMap[font] || font) : font);
                    },
                    enumerable:false,
                },

                /**
                 * 用户点击文本， 只有有a标签的文本才会触发
                 */
                _handleClickText:{
                    value:function(){
                        var tX: number = this.mouseX;
                        var tY: number = this.mouseY;
                        var i: number, len: number;
                        var tHit: HTMLHitRect;
                        len = this._htmlHitList.length;
                        for (i = 0; i < len; i++) {
                            tHit = this._htmlHitList[i];
                            if (tHit.rec.contains(tX, tY)) {
                                this.event(Laya.Event.LINK, [tHit.href]);
                            }
                        }
                       
                    }
                },
                
                /** 测量文本尺寸*/
                _evalTextSize:{
                    value:function(): void {
                        var style = <Laya.TextStyle>this._style;
                        var nw: number, nh: number;
                        nw = Math.max.apply(this, this._lineWidths);

                        //计算textHeight
                        let bmpFont = (this._style as Laya.TextStyle) .currBitmapFont;
                        if (bmpFont){
                            let h = bmpFont.getMaxHeight();
                            if(bmpFont.autoScaleSize){
                                h = this.fontSize;
                            }
                            nh = this._lines.length * (h + this.leading) + this.padding[0] + this.padding[2];
                        }else if(style.htmlStyle){//html 的文本计算高度
                            let heights = this._lineHeights;
                            nh  = this.padding[0] + this.padding[2];
                            for(let i=0; i<heights.length; i++){
                                nh += heights[i] + this.leading;
                            }
                            if(heights.length){
                                nh-=this.leading; 	// 去掉最后一行的leading，否则多算了。
                            }
                        }else{
                            nh = this._lines.length * (this._charSize.height + this.leading) + this.padding[0] + this.padding[2];
                            if(this._lines.length){
                                nh-=this.leading; 	// 去掉最后一行的leading，否则多算了。
                            }
                        }
                        if (nw != this._textWidth || nh != this._textHeight) {
                            this._textWidth = nw;
                            this._textHeight = nh;
                            //TODO:
                            //if (!_width || !_height)
                            //conchModel && conchModel.size(_width || _textWidth, _height || _textHeight);
                        }
                    },
                    enumerable:true,
                },

                //分析文本换行
                _parseLines:{
                    value:function(text: string): void {
                        //自动换行和HIDDEN都需要计算换行位置或截断位置
                        var needWordWrapOrTruncate = this.wordWrap || this.overflow == Laya.Text.HIDDEN;
                        if (needWordWrapOrTruncate) {
                            var wordWrapWidth = this._getWordWrapWidth();
                        }
                
                        var bitmapFont = ((<Laya.TextStyle>this._style)).currBitmapFont;
                        if (bitmapFont) {
                            this._charSize.width = bitmapFont.getMaxWidth();
                            this._charSize.height = bitmapFont.getMaxHeight();
                        } else {
                            var measureResult: any = null;
                            if (Laya.Render.isConchApp) {
                                measureResult = (window as any).conchTextCanvas.measureText(Laya.Text["_testWord"]);
                            } else {
                                measureResult = Laya.Browser.context.measureText(Laya.Text["_testWord"]);
                            }
                            if (!measureResult) measureResult = { width: 100 };
                            this._charSize.width = measureResult.width;
                            this._charSize.height = (measureResult.height || this.fontSize);
                        }
                        
                        var style = <Laya.TextStyle>this._style;
                        if(style.htmlStyle){
                            let styleIndex = 0;
                            let endIndex = 0;
                            // 开启了自动换行需要计算换行位置
                            // overflow为hidden需要计算截断位置
                            if (!needWordWrapOrTruncate)
                            {
                                wordWrapWidth = 1000000;//不换行把这个值设置的大点
                            }
                            this._lineHeights.length = 0;
                            for (var i:number = 0; i < style.htmlStyle.length; i++) {
                                let curStyleInfo = style.htmlStyle[i];
                                if(curStyleInfo.text !="\n"){
                                    endIndex = i;
                                    if(i!=style.htmlStyle.length-1)continue;
                                }
                                let addNum = this._parseStyleLine(wordWrapWidth, styleIndex, endIndex);
                                i = i + addNum;
                                styleIndex = i+1;
                                // line = "";
                            }
                        }else{
                            var lines: any[] = text.replace(/\r\n/g, "\n").split("\n");
                            for (var i = 0, n = lines.length; i < n; i++) {
                                var line = lines[i];
                                // 开启了自动换行需要计算换行位置
                                // overflow为hidden需要计算截断位置
                                if (needWordWrapOrTruncate)
                                    this._parseLine(line, wordWrapWidth);
                                else {
                                    this._lineWidths.push(this._getTextWidth(line));
                                    this._lines.push(line);
                                }
                            }
                        }
                        
                    },
                    enumerable:true,
                    writable:true
            },

            //解析行文本。
            _parseStyleLine:{
                value:function(wordWrapWidth: number, styleIndex:number, endIndex:number): number {
                    let addNum = 0;
                    let totalAddNum = 0;
                    var style = <Laya.TextStyle>this._style;
                    if(!style.htmlStyle)return totalAddNum;
                    let textWidth = 0;
                    let lineText = "";
                    var ctxFont = this._getContextFont();
                    let htmlCtxFont = ctxFont;
                    var lineHeight = this._charSize.height;
                    let textHeight = lineHeight;//每行文本的最大高度
                    for (var i:number = styleIndex; i <= endIndex; i++) {
                        let htmlInfo = style.htmlStyle[i];
                        let curHtmlCtxFont = ctxFont;
                        let txtH = lineHeight;
                        if(htmlInfo.style){
                            if(htmlInfo.style.font  || htmlInfo.style.size || htmlInfo.style.italic || htmlInfo.style.bold){
                                curHtmlCtxFont = this._getContextFontCustom({font:htmlInfo.style.font, 
                                    fontSize:htmlInfo.style.size,italic:htmlInfo.style.italic, bold:htmlInfo.style.bold})
                            }
                            if(htmlInfo.style.height){
                                txtH = htmlInfo.style.height;
                            }else if(htmlInfo.style.size){
                                txtH = htmlInfo.style.size;
                            }
                        }
                        if(htmlCtxFont != curHtmlCtxFont){
                            htmlCtxFont = curHtmlCtxFont;
                            Laya.Browser.context.font = htmlCtxFont
                        }
                        let fixedwidth = (htmlInfo.style&&htmlInfo.style.width!=undefined);//是否是固定的宽高
                        let txtW = fixedwidth?htmlInfo.style.width:this._getTextWidth(htmlInfo.text);
                        if(textWidth+txtW<=wordWrapWidth)
                        {
                            if(txtH>textHeight)textHeight = txtH;
                            textWidth += txtW;
                            lineText+= htmlInfo.text;
                            continue;
                        }
                        if(fixedwidth){//样式中固定宽度的
                            this._lines.push(lineText)
                            this._lineWidths.push(textWidth);
                            this._lineHeights.push(textHeight);
                            style.htmlStyle.splice(i, 0, {text:"\n"});
                            addNum = 1;
                            textWidth = txtW;
                            lineText = htmlInfo.text;
                            textHeight = txtH;
                        }else{//需要计算文本的宽度
                            if(txtH>textHeight)textHeight = txtH;
                            let htmlText = htmlInfo.text;
                            let appendInfos:HtmlTextInfo[] = [];
                            let curInfo:HtmlTextInfo = {text:"", style:htmlInfo.style}
                            let idx = 0;
                            let tempText:string;
                            while(idx < htmlText.length){
                                let mabeStarIndex = Math.floor((wordWrapWidth-textWidth)/this._charSize.width);
                                if(mabeStarIndex>0){
                                    tempText = htmlText.substring(idx, idx+mabeStarIndex);
                                    textWidth = textWidth + this._getTextWidth(tempText)
                                    curInfo.text += tempText;
                                    lineText += tempText;
                                    idx = idx + mabeStarIndex
                                }
                                tempText = htmlText.charAt(idx);
                                let w = this._getTextWidth(tempText);
                                if(textWidth+w>wordWrapWidth){
                                    appendInfos.push(curInfo)
                                    appendInfos.push({text:"\n"})
                                    this._lines.push(lineText)
                                    this._lineWidths.push(textWidth);
                                    this._lineHeights.push(textHeight);
                                    curInfo = {text:"", style:htmlInfo.style}
                                    textWidth = 0;
                                    lineText = "";
                                }else{
                                    curInfo.text += tempText;
                                    lineText += tempText;
                                    idx = idx + 1
                                    textWidth+=w
                                }
                            }
                            appendInfos.push(curInfo)
                            style.htmlStyle.splice(i,1, ...appendInfos);
                            addNum = appendInfos.length-1;
                        }
                        endIndex += addNum;
                        i+= addNum;
                        totalAddNum += addNum;

                    }
                    if(lineText||textWidth>0||textHeight>0){
                        this._lines.push(lineText)
                        this._lineWidths.push(textWidth);
                        this._lineHeights.push(textHeight);
                        lineText = "";
                        textWidth = 0;
                        textHeight = 0;
                    }
                    return totalAddNum;
                },
                enumerable:true,
                writable:true
            },

            });
        }

    }
}