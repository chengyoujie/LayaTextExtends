module layaTextExt {
    /**
     *  文本中表情的类， 方便使用缓存池
     * @author cyj
     * create on 2022-09-09 19:50:52 
    */
    export class TextImage extends Laya.Image{

        /**
         * 放进缓存池的时候执行的方法
         */
        public onPool(){
            let s = this;
            s.x = 0;
            s.y = 0;
            s.skin = null;
            s.scaleX = s.scaleY = 1;
            s.width = undefined;
            s.height = undefined;
        }
    }
}