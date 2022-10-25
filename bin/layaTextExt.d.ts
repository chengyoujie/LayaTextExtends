declare module layaTextExt {
    /**
     * 类的工具类
     * @author cyj
     */
    class ClassUtil {
        private static _CLASS_ID_SIGN;
        private static _CLASS_ID;
        private static _CLASS_DIC;
        /**
         * 获取类的classId如果为空则创建一个
         * @param cls
         * @returns
         */
        static getClassId(cls: any): string;
        /**
         * 根据实例获取 对应类的classId
         * @param instance
         * @returns
         */
        static getClassIdByInstance(instance: {
            constructor: any;
        }): string;
        /**
         * 注册类的classId
         * @param cls
         * @param classId
         */
        static regClassId(cls: any, classId: string): void;
        /**
         * 根据id返回对应的类
         * @param id
         * @returns
         */
        static getClassById(id: string): any;
    }
}
declare module layaTextExt {
    /**
     * 文本超链点击区域
     * @author cyj
     */
    class HTMLHitRect implements IPool {
        rec: Laya.Rectangle;
        href: string;
        constructor();
        onPool(): HTMLHitRect;
    }
}
declare module layaTextExt {
    /**
     *
     * HtmlTextParser 解析HTML格式的类
     * @author cyj
     * create on 2022-08-09 13:32:01
     */
    export class HtmlTextParser {
        private static _htmlStackArray;
        private static _htmlTagPropReg;
        private static _htmlTagReg;
        static parser(htmlText: string): HtmlParseResult;
        private static addHtmlText;
        private static addHtmlTag;
        private static htmlTag2Style;
        private static addHtmlStyleAttr;
    }
    type HtmlParseResult = {
        htmlStyle: HtmlTextInfo[];
        text: string;
    };
    /**
     * 解析后文本的样式
     */
    export interface HtmlTextInfo {
        text: string;
        style?: HtmlStyle;
    }
    /**
     * html文本样式
     */
    export interface HtmlStyle {
        /**标签的名字（不需要手动设置） */
        tag: "font" | "image" | "img" | "br" | "b" | "u" | "i" | "a" | string;
        /**文本宽度 */
        width?: number;
        /**高度 */
        height?: number;
        /**文本对其方式 `left` `right` `center`*/
        align?: string;
        /**竖直方向的对其方式  `bottom`  `middle`  `top` */
        valign?: string;
        /**文本颜色 */
        color?: string;
        /**文本描边颜色 */
        strokeColor?: string;
        /**文本描边 */
        stroke?: number;
        /**字体 */
        font?: string;
        /**字体大小 */
        size?: number;
        /**下划线 */
        underline?: boolean;
        /**下划线颜色 */
        underlineColor?: string;
        /**字体加粗 */
        bold?: boolean;
        /**字体斜体 */
        italic?: boolean;
        /**a标签的特有属性 超链 */
        href?: string;
        /** 图片资源路径 */
        src?: string;
    }
    export {};
}
declare module layaTextExt {
    /**缓存池的对象 */
    var POOLS: {
        [name: string]: IPool[];
    };
    /**
     * 缓存池
     * @param cls 类名， 类中必须实现`onReset`方法，在放入缓存池中调用
     * @author cyj
     */
    function PoolGet<T>(cls: {
        new (): T & IPool;
    }): T;
    /**
     * 将对象放到缓存池中
     * @param instance
     * @returns
     */
    function PoolPush<T>(instance: T & IPool): void;
    interface IPool {
        onPool?(): void;
    }
}
/**引擎中添加属性声明 */
declare module Laya {
    interface TextStyle {
        /**
         * html文本的属性
         */
        htmlStyle: {
            style?: layaTextExt.HtmlStyle;
            text: string;
        }[] | null;
    }
    interface Text {
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
        htmlText: string;
    }
}
declare module layaTextExt {
    /**
     * Text拓展、修改
     * @author cyj
     */
    class TextExtends {
        /**
         * 按钮拓展
         * 增加单张图片点击的效果
         */
        static extend(): void;
    }
}
declare module layaTextExt {
    /**
     *  文本中表情的类， 方便使用缓存池
     * @author cyj
     * create on 2022-09-09 19:50:52
    */
    class TextImage extends Laya.Image {
        /**
         * 放进缓存池的时候执行的方法
         */
        onPool(): void;
    }
}
