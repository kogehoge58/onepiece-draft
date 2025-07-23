@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

rem 出力ファイルを初期化
> result.txt echo.

rem ファイルとパスの一覧（ファイル名:パス）
set files[0]=server.js
set files[1]=public\index.html
set files[2]=public\script.js

rem ループ処理
for /L %%i in (0,1,2) do (
    call set "filepath=%%files[%%i]%%"
    for %%F in (!filepath!) do (
        if exist "%%F" (
            echo ■%%~nxF >> result.txt
            type "%%F" >> result.txt
            echo. >> result.txt
            echo. >> result.txt
        ) else (
            echo [警告] %%F が見つかりませんでした >> result.txt
            echo. >> result.txt
        )
    )
)

echo.
echo 出力完了: result.txt に3ファイルの内容をまとめました。
pause > nul
