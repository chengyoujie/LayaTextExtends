import { ui } from "./ui/layaMaxUI"
/**
 * 测试文本例子
 * @author cyj
 */
export default class Test extends ui.TestUI {
    onEnable(): void {
        let s = this;
        // s.txtTest.text = "测试"
        s.txtTip.text = "富文本"
        s.txtTest.htmlText = `"设置文本颜色<font color='#FF0000'>红色</font>,<font color='#00FF00'>绿色</font>的字体         
START<font width="200" align="left">指定宽度[居左]</font>END
START<font width="200" align="center">指定宽度[居中]</font>END
START<font width="200" align="right">指定宽度[居右]</font>END
<font align="center">居中对齐</font>
前面有些文字<font align="center">居中对齐</font>
<font align="right">靠右对齐</font>
显示图片：<img src="comp/image.png" width="120" height="120"/>
<b>粗体</b><font stroke="4" strokeColor="#00FF00">描边</font>
<font size='46'>改变文字大小</font>
<i>斜体</i>
<u underlineColor="#00FF00">下划线</u>
<font color='#0000FF'><a href="超链参数">超链</a></font> 如果文本设置高度 不要让超链的显示位置超过高度否则会点击无效";`
        s.txtTest.bgColor = "#FFFC00"
        s.txtTest.on(Laya.Event.LINK, s, s.handleTextLink)
        s.imgBg.height = s.txtTest.y + s.txtTest.textHeight + 10;
    }

    private handleTextLink(str:string){
        console.log("点击了文本： "+str)
        this.txtTip.text = "点击了文本"+str;
    }
}