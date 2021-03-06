- Use HTML+CSS+JavaScript to design cross-platform APPs!
- If you want to start with Android development directly and skip Web/Electron, [jump to that secion directly](#start-with-pure-android-development-right-away)
# Introduction
- This framework is named Android/Node.js Common Interface, abbreviated ANCI
- Aim: Write your program ONLY ONCE by HTML+CSS+JavaScript, 
- And be able to run it as
  + Android APP by DroidScript framework
  + Web APP by Node.js+Express server
  + Windows/Linux/MacOS Desktop APP by Electron
# Usage
- Install Node.js first at https://nodejs.org/
  * Android users can install Termux and run pkg install nodejs or git
  * Then after git clone and cd, use npm install --no-bin-links to install dependencies
  * if you want to store this package under /sdcard, you have to run termux-setup-storage first
- Use git clone command or download the zip of this repo directly, and under the ANCI path run npm install
```
git clone https://github.com/jjtseng93/Android-Node.js-Common-Interface.git
cd Android-Node.js-Common-Interface
npm install
```
## Running the APP for Web or Electron
- Then, on Windows simply run the batch files named run_xxx.bat for different platforms
- On other platforms' terminal
```
# To start as Electron APP
npm start

# To start as Node.js+Express server or Packaging to Android's DroidScript 
npm run web
```
- If you run web, open a browser and navigate to http://localhost:8081 to run the Web APP by default
## Running the APP for Android's DroidScript
- You have to install DroidScript on Android first at https://play.google.com/store/apps/details?id=com.smartphoneremote.androidscriptfree
- Run web first, and you'll see the packing tool in the command prompt
- Use numbers to select which APP to pack
  * I have a default app called 0 for demonstrating the APIs in ANCI, you can test ANCI's functions there
- After packing, your APP will be ready under DroidScript/app_name
  1. Copy it directly to /sdcard/DroidScript
  2. or Zip the app_name folder to app_name.zip, and change the file extension to .spk, open it by the DroidScript APP on Android
- Open DroidScript and you'll find your APP installed, click on it to run directly or long-click to edit
- By default all the console.log will be shown as alert message, 
- if you want to disable it, edit droidscript_main.js or app_name.js and mark out the alert("Main: " in the web_OnConsole function
## Start development on PC
- if you have followed all the steps above, you will have a ANCI folder containing /sdcard/napps/0
- you can revise its Code.js and UI.html directly and run as original
### Using your own APP name
- By GUI
  + Use the ADD button inside the default APP 0 and choose a template
  + Edit /sdcard/napps/your_app_name/Code.js and UI.html with your preferred text editor
  + Run by the PLAY button inside the default APP 0
- Manually
  + Copy the folder /sdcard/napps/your_preferred_template_app to /sdcard/napps/your_app_name manually
  + Edit /sdcard/napps/your_app_name/Code.js and UI.html with your preferred text editor
  + Run on Web by changing the URL to /sdcard/napps/your_app_name/main.app
  + Run on Electron by changing this line in web_electron_server_anci.js:
```
app.get("/",(q,s)=>s.redirect("/sdcard/napps/0/main.app")); // Change 0 to your_app_name
```
## Start with pure Android development right away
- Install DroidScript on Android at https://play.google.com/store/apps/details?id=com.smartphoneremote.androidscriptfree
- Download the 0.spk from this repo's DroidScript folder and open it with DroidScript: https://jjtseng93.github.io/Android-Node.js-Common-Interface/DroidScript/0.spk
- If you failed installing this way, rename the 0.spk to 0.zip and extract the folder "0" to /sdcard/DroidScript manually
- A new APP called 0 will be installed to your DroidScript; run it to test ANCI's functions
- Revise the Code.js and UI.html under /sdcard/DroidScript/0 to develop your own APP
- Edit by your preferred text editor or use DroidScript directly by long-pressing on the APP icon
- By default all the console.log will be shown as alert message, 
- if you want to disable it, edit app_name.js and mark out the alert("Main: " in the web_OnConsole function
- Later if you want to run your APP on Web or Electron, follow the instructions above and then manually copy your Code.js and UI.html to /sdcard/napps/app_name folder
# File system structure
## Overview
- For a comprehensive view, please look at the Project_Structure.pptx or the demo image below
- My design targets to let you only focus on the 2 files: UI.html and Code.js for User Interface and Functionality
![image](https://jjtseng93.github.io/Android-Node.js-Common-Interface/Project_Structure.jpg)
## sdcard (/sdcard)
- Access by RELATIVE path in HTML files, but when using filesystem operations by anci.operations in JS files, use absolute path starting with /sdcard
- As to emulate the environment of Android system
- The uppermost folder that the client side can access to protect server's code
+ napps folder: abbreviation of Node.js APPs, where your APPs are stored
  * /sdcard/napps/app_name on Node.js
  * the corresponding folder on Android is /sdcard/DroidScript/app_name
  * Call anci.GetAppPath() to access
+ nlib folder: abbreviation of Node.js libraries, the common lib for all APPs
  * this folder will be mapped under /sdcard/napps/app_name/nlib on Node.js
  * and copied to /sdcard/DroidScript/app_name/nlib on Android
  * Call anci.GetAppPath() to access
+ ndata folder: stores application data on the filesystem
  * this folder will remain accessed as /sdcard/ndata on both Android/Node.js
  * So use ABSOLUTE path to access it
## sdcard/napps/app_name/main.app
- A virtual path to evoke server-side generation of an APP's complete HTML
- the app_name 0 is the default app
- if the server was called w/o path, i.e http://xxx.xxx.x.x, default APP runs
  at http://xxx.xxx.x.x/sdcard/napps/0/main.app
- the APPs' complete HTML comprises
  + ~app_entry.html (/sdcard/napps/app_name/~app_entry.html)
  + xxx_api_anci.js (web_electron or droidscript)
  + query parameters (URL?para1=val_a&parameter2=val_b) as anci.query
  + Code.js (/sdcard/napps/app_name/Code.js)
  + UI.html (/sdcard/napps/app_name/UI.html)
