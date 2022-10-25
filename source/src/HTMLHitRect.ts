module layaTextExt {
    /**
     * 文本超链点击区域
     * @author cyj
     */
    export class HTMLHitRect implements IPool {

        rec: Laya.Rectangle;
        href: string;

        //TODO:coverage
        constructor() {
            this.rec = new Laya.Rectangle();
            this.onPool();
        }

        onPool(): HTMLHitRect {
            this.rec.reset();
            this.href = null;
            return this;
        }
    }
}