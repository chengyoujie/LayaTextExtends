module layaTextExt {
    /**
     * 
     * HtmlTextParser 解析HTML格式的类
     * @author cyj
     * create on 2022-08-09 13:32:01 
     */
    export class HtmlTextParser {

        private static _htmlStackArray: HtmlStyle[] = [];
        private static _htmlTagPropReg = /^(\w+)\s*=/;
        private static _htmlTagReg = /^(font|a|img|image|b|i|u)(\s|$)/; //需要解析的标签

        public static parser(htmlText: string): HtmlParseResult {
            let s = this;
            htmlText = htmlText.replace(/\n\r?/gi, "<br/>")
            s._htmlStackArray.length = 0;
            let firstIndex = 0;
            let len = htmlText.length;
            let result: HtmlParseResult = {
                htmlStyle: [],
                text: ""
            };
            while (firstIndex < len) {
                let startIdx = htmlText.indexOf("<", firstIndex);
                if (startIdx < 0) {
                    s.addHtmlText(htmlText.substring(firstIndex), result);
                    firstIndex = len;
                } else {
                    if (firstIndex != startIdx)
                        s.addHtmlText(htmlText.substring(firstIndex, startIdx), result);
                    let fontEnd = htmlText.indexOf(">", startIdx);
                    if (fontEnd == -1) {
                        console.error("文本没有找到结束标签： " + htmlText);
                        fontEnd = startIdx;
                    } else if (htmlText.charAt(startIdx + 1) == "\/") {
                        s._htmlStackArray.pop();
                    } else {
                        let htmlTag = htmlText.substring(startIdx + 1, fontEnd).trim();
                        let tagInfo = s.addHtmlTag(htmlTag, result);
                        if (tagInfo.tag && htmlTag.charAt(htmlTag.length - 1) == "\/") { //对于类似于<image src=xxx/>的处理 br不处理
                            s.addHtmlText("", result);
                            s._htmlStackArray.pop();
                        }
                    }
                    firstIndex = fontEnd + 1;
                }
            }
            return result;
        }

        private static addHtmlText(value: string, result: HtmlParseResult) {
            let s = this;
            if (s._htmlStackArray.length > 0) {
                result.text += value;
                result.htmlStyle.push({
                    text: value,
                    style: s._htmlStackArray[s._htmlStackArray.length - 1]
                })
            } else {
                result.htmlStyle.push({
                    text: value
                })
            }
        }

        private static addHtmlTag(htmlTag: string, result: HtmlParseResult) {
            let s = this;
            let info: HtmlStyle = s.htmlTag2Style(htmlTag, result);
            if (s._htmlStackArray.length == 0) {
                s._htmlStackArray.push(info);
            } else {
                let lastInfo = s._htmlStackArray[s._htmlStackArray.length - 1];
                for (let key in lastInfo) {
                    if (info[key] == null) {
                        info[key] = lastInfo[key];
                    }
                }
                s._htmlStackArray.push(info);
            }
            return info;
        }

        private static htmlTag2Style(htmlTag: string, result: HtmlParseResult) {
            htmlTag = htmlTag.trim();
            let s = this;
            let info: HtmlStyle = {
                tag: null
            };

            let header;
            let next = 0;
            if (htmlTag.match(/^(br)[\/\\]?/gi)) {
                s.addHtmlText("\n", result)
            } else if (header = htmlTag.match(s._htmlTagReg)) { //支持的标签
                htmlTag = htmlTag.substring(header[0].length);
                info.tag = header[0].trim();
                if (info.tag == "i" || info.tag == "u" || info.tag == "b") {
                    s.addHtmlStyleAttr(info, info.tag, "true")
                }
                let attrs: string[];
                while (attrs = htmlTag.match(s._htmlTagPropReg)) {
                    let prop = attrs[1];
                    let value = "";
                    htmlTag = htmlTag.substring(attrs[0].length).trim();
                    if (htmlTag.charAt(0) == "\"") {
                        next = htmlTag.indexOf("\"", 1);
                        value = htmlTag.substring(1, next);
                        next += 1;
                    } else if (htmlTag.charAt(0) == "\'") {
                        next = htmlTag.indexOf("\'", 1);
                        value = htmlTag.substring(1, next);
                        next += 1;
                    } else {
                        value = htmlTag.match(/(\S)+/)[0];
                        next += value.length;
                    }
                    // info[prop] = value;
                    s.addHtmlStyleAttr(info, prop, value)
                    htmlTag = htmlTag.substring(next).trim();
                }
            }
            return info;
        }

        private static addHtmlStyleAttr(info: HtmlStyle, prop: string, value: string) {
            switch (prop) {
                case "color":
                    info.color = value;
                    break;
                case "stroke":
                    info.stroke = +value;
                    break;
                case "strokeColor":
                    info.strokeColor = value;
                    break;
                case "width":
                    info.width = +value;
                    break;
                case "height":
                    info.height = +value;
                    break;
                case "align":
                    info.align = value;
                    break;
                case "valign":
                    info.valign = value;
                    break;
                case "font":
                    info.font = value;
                    break;
                case "size":
                    info.size = +value;
                    break;
                case "i":
                case "italic":
                    info.italic = value == "true"
                    break;
                case "b":
                case "bold":
                    info.bold = value == "true"
                    break;
                case "u":
                    info.underline = value == "true"
                    break;
                case "underlineColor":
                    info.underlineColor = value;
                    break;
                default:
                    info[prop] = value;
                    break;
            }
        }



    }

    type HtmlParseResult = {
        htmlStyle: HtmlTextInfo[],
        text: string
    };
    /**
     * 解析后文本的样式
     */
    export interface HtmlTextInfo {
        text: string;
        style ? : HtmlStyle;
        // width?:number;
    }

    module Laya {
        interface TextStyle {
            htmlStyle: HtmlStyle[];
        }
    }

    /**
     * html文本样式
     */
    export interface HtmlStyle {

        //----------公用属性-------------

        /**标签的名字（不需要手动设置） */
        tag: "font" | "image" | "img" | "br" | "b" | "u" | "i" | "a" | string;
        /**文本宽度 */
        width ? : number;
        /**高度 */
        height ? : number;
        /**文本对其方式 `left` `right` `center`*/
        align ? : string;
        /**竖直方向的对其方式  `bottom`  `middle`  `top` */
        valign ? : string;

        //------------font标签属性------------

        /**文本颜色 */
        color ? : string;
        /**文本描边颜色 */
        strokeColor ? : string;
        /**文本描边 */
        stroke ? : number;
        /**字体 */
        font ? : string;
        /**字体大小 */
        size ? : number;
        /**下划线 */
        underline ? : boolean;
        /**下划线颜色 */
        underlineColor ? : string;
        /**字体加粗 */
        bold ? : boolean;
        /**字体斜体 */
        italic ? : boolean;
        /**a标签的特有属性 超链 */
        href ? : string;

        //-----------img或image标签属性-------------

        /** 图片资源路径 */
        src ? : string;
    }
}