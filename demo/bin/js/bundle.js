(function () {
    'use strict';

    var View = Laya.View;
    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        class TestUI extends View {
            constructor() { super(); }
            createChildren() {
                super.createChildren();
                this.loadScene("Test");
            }
        }
        ui.TestUI = TestUI;
        REG("ui.TestUI", TestUI);
    })(ui || (ui = {}));

    class Test extends ui.TestUI {
        onEnable() {
            let s = this;
            s.txtTip.text = "富文本";
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
<font color='#0000FF'><a href="超链参数">超链</a></font> 如果文本设置高度 不要让超链的显示位置超过高度否则会点击无效";`;
            s.txtTest.bgColor = "#FFFC00";
            s.txtTest.on(Laya.Event.LINK, s, s.handleTextLink);
            s.imgBg.height = s.txtTest.y + s.txtTest.textHeight + 10;
        }
        handleTextLink(str) {
            console.log("点击了文本： " + str);
            this.txtTip.text = "点击了文本" + str;
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("Test.ts", Test);
        }
    }
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedheight";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "Test.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = true;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            layaTextExt.TextExtends.extend();
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
