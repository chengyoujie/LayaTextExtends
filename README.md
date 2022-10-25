# 拓展`Laya`的`Text`，支持简单的Html文本

[github地址](https://github.com/chengyoujie/LayaTextExtends)



## 使用说明

1. 将`bin/layaTextExt.js`和拷贝到项目中，并在`index.js`中引入。（压缩后文件大小`15k`）

2. 将`bin/layaTextExt.d.ts`拷贝到项目`libs`中, 添加声明文件

3. 在游戏初始化的时候 调用`layaTextExt.TextExtends.extend();` 初始化文本拓展

4. 为需要使用富文本的`Text`实例调用`htmlText`属性赋值

## 示例

[demo预览地址: https://chengyoujie.github.io/LayaTextExtends/demo/bin/](https://github.com/chengyoujie/LayaTextExtends)



``` javascript
test.htmlText = `
<font color='#FF0000'>红色</font>         
<font width="200" >指定宽度</font>
<img src="comp/image.png" width="120" height="120"/>
<b>粗体</b>
<font size='46'>改变文字大小</font>
<i>斜体</i>
<u underlineColor="#00FF00">下划线</u>
<a href="Laya.Event.LINK事件派发的参数">超链</a>
`
```

## 属性说明

### 通用属性

| 属性   | 类型                    | 说明         | 示例 |
| ------ | ----------------------- | ------------ | ---- |
| width  |        number                 | 文本宽度     | width="100" |
| height |        number              | 文本高度     | height="30" |
| align  | `left` `right` `center`   | 水平对齐方式 | align="center" |
| valign | `bottom`  `middle`  `top` | 竖直对齐方式 | valign="middle" |

## `font` 字体标签属性

| 属性   | 类型                    | 说明         | 示例 |
| ---- | ---- | ---- | ---- |
|  color    |   string   |  文本颜色    | color="#FF0000" |
|  strokeColor    |  string    |  文本描边颜色    | strokeColor="#CC00CC" |
|    stroke  |   number   |   文本描边大小   | stroke="2" |
|  font    | string     |   字体   | font="微软雅黑" |
|    size  | number     |  字体大小    | size="16" |
|    underline  |   boolean   |   下划线   | underline="true" |
|    underlineColor  |   string   |    下划线颜色  | underlineColor="#00FF00" |
|    bold 或 单个b标签 |    boolean  |    字体加粗  | bold="true" 或`<b>粗体</b>` |
| italic 或 单个i标签    |   boolean   |   字体斜体   | italic="true"或`<i>斜体</i>` |

## `a` 超链标签属性

| 属性   | 类型                    | 说明         | 示例 |
| ---- | ---- | ---- | ---- |
|  href    |   string   | 超链内容,点击派发`Laya.Event.LINK`事件， 参数为 `href`内容 | `<a href='eventLink内容'>超链</a>` |

## `img`或`image` 图片标签属性

| 属性   | 类型                    | 说明         | 示例 |
| ---- | ---- | ---- | ---- |
|  src    |   string   |  图片的链接地址   | `<img src="comp/image.png" width="120" height="120"/>` |