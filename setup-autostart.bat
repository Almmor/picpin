@echo off
chcp 65001 >nul
echo ========================================
echo   PicPin - 设置开机自启
echo ========================================
echo.

set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "DESKTOP_DIR=%USERPROFILE%\Desktop"
set "INSTALL_DIR=%~dp0"

set "VBS_SCRIPT=%TEMP%\PicPin_Shortcut.vbs"

echo [1/3] 正在创建启动脚本...
echo @echo off > "%INSTALL_DIR%launch.bat"
echo chcp 65001 ^>nul >> "%INSTALL_DIR%launch.bat"
echo cd /d "%INSTALL_DIR%" >> "%INSTALL_DIR%launch.bat"
echo if exist "%INSTALL_DIR%..\..\PicPinCore.exe" ( >> "%INSTALL_DIR%launch.bat"
echo     start "" "%INSTALL_DIR%..\..\PicPinCore.exe" >> "%INSTALL_DIR%launch.bat"
echo ) else ( >> "%INSTALL_DIR%launch.bat"
echo     echo PicPin runtime not found. Please place this folder in the apps/ directory. >> "%INSTALL_DIR%launch.bat"
echo     timeout /t 3 ^>nul >> "%INSTALL_DIR%launch.bat"
echo ) >> "%INSTALL_DIR%launch.bat"

echo [2/3] 正在创建快捷方式...

echo Set WshShell = CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo Set startupLink = WshShell.CreateShortcut("%STARTUP_DIR%\PicPin.lnk") >> "%VBS_SCRIPT%"
echo startupLink.TargetPath = "%INSTALL_DIR%launch.bat" >> "%VBS_SCRIPT%"
echo startupLink.WorkingDirectory = "%INSTALL_DIR%" >> "%VBS_SCRIPT%"
echo startupLink.WindowStyle = 7 >> "%VBS_SCRIPT%"
echo startupLink.Description = "PicPin Desktop Widget" >> "%VBS_SCRIPT%"
echo startupLink.Save >> "%VBS_SCRIPT%"
echo. >> "%VBS_SCRIPT%"
echo Set desktopLink = WshShell.CreateShortcut("%DESKTOP_DIR%\PicPin.lnk") >> "%VBS_SCRIPT%"
echo desktopLink.TargetPath = "%INSTALL_DIR%launch.bat" >> "%VBS_SCRIPT%"
echo desktopLink.WorkingDirectory = "%INSTALL_DIR%" >> "%VBS_SCRIPT%"
echo desktopLink.WindowStyle = 1 >> "%VBS_SCRIPT%"
echo desktopLink.Description = "PicPin Desktop Widget" >> "%VBS_SCRIPT%"
echo desktopLink.Save >> "%VBS_SCRIPT%"

cscript //nologo "%VBS_SCRIPT%"
del "%VBS_SCRIPT%"

echo [3/3] 完成！
echo.
echo   开机自启项已添加到：
echo     %STARTUP_DIR%\PicPin.lnk
echo   桌面快捷方式已创建。
echo.
echo   下次开机将自动启动挂件运行时。
echo   按任意键退出...
pause >nul
