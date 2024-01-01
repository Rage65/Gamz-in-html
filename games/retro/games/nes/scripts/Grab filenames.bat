@echo off
setlocal enabledelayedexpansion

rem Specify the directory where your .nes files are located
set "nesDirectory=C:\Users\Administrator\Documents\GitHub\Gamz-in-html\games\retro\games\nes"

rem Specify the output file name
set "outputFile=output.txt"

rem Remove the existing output file
if exist "%outputFile%" del "%outputFile%"

rem Loop through all .nes files in the specified directory
for %%F in ("%nesDirectory%\*.nes") do (
    rem Extract the file name without extension
    set "fileName=%%~nF"
    
    rem Append the file name to the output file
    echo !fileName! >> "%outputFile%"
)

echo "File names written to %outputFile%"
pause
