@echo off
echo ������Ŀ
call tsc
echo �������
echo ��ʼ����
::�������ⲿ��bin��
echo F|xcopy %dp0%bin\layaTextExt.d.ts %dp0%..\bin\layaTextExt.d.ts  /y /f 
echo F|xcopy %dp0%bin\layaTextExt.js %dp0%..\bin\layaTextExt.js /y /f 
::ѹ��js
echo ��ʼѹ�������û�а�װuglifyjs����ע�͵�ѹ������
call uglifyjs %dp0%..\bin\layaTextExt.js -m -o %dp0%..\bin\layaTextExt.min.js
echo ѹ�����
::������demo��
echo F|xcopy %dp0%bin\layaTextExt.js %dp0%..\demo\bin\layaTextExt.js /y /f
echo F|xcopy %dp0%bin\layaTextExt.d.ts %dp0%..\demo\libs\layaTextExt.d.ts /y /f
echo �������
pause