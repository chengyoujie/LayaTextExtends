/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import View=Laya.View;
import Dialog=Laya.Dialog;
import Scene=Laya.Scene;
var REG: Function = Laya.ClassUtils.regClass;
export module ui {
    export class TestUI extends View {
		public txtTip:Laya.Text;
		public imgBg:Laya.Image;
		public txtTest:Laya.Text;
        constructor(){ super()}
        createChildren():void {
            super.createChildren();
            this.loadScene("Test");
        }
    }
    REG("ui.TestUI",TestUI);
}