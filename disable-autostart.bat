@echo off
chcp 65001 >nul
echo ========================================
echo   PicPin - 取消开机自启
echo ========================================
echo.

set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"

if exist "%STARTUP_DIR%\PicPin.lnk" (
    del "%STARTUP_DIR%\PicPin.lnk"
    echo [成功] 已移除开机自启项
) else (
    echo [提示] 未发现开机自启项
)

if exist "%DESKTOP_DIR%\PicPin.lnk" (
    del "%DESKTOP_DIR%\PicPin.lnk"
    echo [成功] 已移除桌面快捷方式
) else (
    echo [提示] 未发现桌面快捷方式
)

echo.
echo 按任意键退出...
pause >nul
