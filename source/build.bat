@echo off
echo 编译项目
call tsc
echo 编译完成
echo 开始拷贝
::拷贝到外部的bin中
echo F|xcopy %dp0%bin\layaTextExt.d.ts %dp0%..\bin\layaTextExt.d.ts  /y /f 
echo F|xcopy %dp0%bin\layaTextExt.js %dp0%..\bin\layaTextExt.js /y /f 
::压缩js
echo 开始压缩，如果没有安装uglifyjs可以注释掉压缩部分
call uglifyjs %dp0%..\bin\layaTextExt.js -m -o %dp0%..\bin\layaTextExt.min.js
echo 压缩完毕
::拷贝到demo中
echo F|xcopy %dp0%bin\layaTextExt.js %dp0%..\demo\bin\layaTextExt.js /y /f
echo F|xcopy %dp0%bin\layaTextExt.d.ts %dp0%..\demo\libs\layaTextExt.d.ts /y /f
echo 拷贝完成
pause