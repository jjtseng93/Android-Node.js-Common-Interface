


//Global Variables
var crlf="\r\n";


//  **** Setting basic parameters
function OnSetup()
{
   document.title="ANCI_Demo";         // The window title for Node.js web/electron APP
   anci.AppVersion="1.87";              // The app version for Node.js web/electron APP
   anci.ProVersion=false;
   anci.DroidOrientation="Default";    // Orientation for Android DroidScript APP, Available values: Default,Portrait,Landscape,ReversePortrait,ReverseLandscape, or use 0~4
}  //  OnSetup End

async function OnLoad()
{

gbcache=
{
	msg:"test msg",
	applist:["app1","app2","app3"],
	selectedApp:0,
	platform_not_android: (window.platform!="android")
};

  new Vue(
  {
	el:"#applistdiv",
    data:gbcache,	
  });

await new Promise(resolve=>{
Vue.nextTick(resolve);
});


  $("#jstest")[0].onkeyup=function(e)
    {
      //alert(e.keyCode);
      if(e.code=="F2" )
        runCode();
      else
	    {
          var tind=$("#jstest")[0].selectionStart;
          var s=$("#jstest").val();
          if(s.substr(tind-1,1)=="~")
          {
            $("#jstest")[0].value=s.substr(0,tind-1)+s.substr(tind);
            runCode();
          }
		}
    };

gbcache.applist=await anci.ListFolder('/sdcard/napps');

}

function runCode()
{
  anci.eval(jstest.value);
}

function runSelectedApp()
{
  let t=storage_location_url.value;
  let l=location.href;
  l=l.substr(0,  l.lastIndexOf("main.app")+8  )
     .replace(/napps\/.*?\/main.app/, 'napps/'+
	                                  gbcache.applist[gbcache.selectedApp-1]+
									  '/main.app?storage_location_url=' + t);
  window.open(l);
}

async function testlist()
{
var f=await anci.CreateListDialog("Fruits水果","Apple蘋果,Pineapple鳳梨,Banana香蕉,Peach水蜜桃,Watermelon西瓜,Mango芒果,Guava芭樂,Orange橘子,Lemon檸檬");
alert(f);
}

async function newAPP()
{
  let tn=await anci.CreateListDialog("Select a template",await anci.ListFolder("/sdcard/napps"));
    {
      let appName=await prompt("Enter a name for your new app");
      if(!appName) return;
      let appf="/sdcard/napps/"+appName;
      if( (await anci.FolderExists(appf)) || (await anci.FileExists(appf)) )
        {
          alert("Sorry, "+appf+" already exists!");
          return;
        }
      const lph="/sdcard/napps/long_phrase_that_shouldnt_repeat";
      await anci.CopyFolder("/sdcard/napps/"+tn,lph);
      await anci.RenameFolder(lph+"/"+tn,appf);
      await anci.DeleteFolder(lph);
      if(await anci.FileExists(appf+"/"+tn+".html"))
        await anci.DeleteFile(appf+"/"+tn+".html");
      if(await anci.FileExists(appf+"/Img/"+tn+".png"))
        await anci.RenameFile(appf+"/Img/"+tn+".png",appf+"/Img/"+appName+".png");

      alert("Successfully created app "+appName+"!");
    }
}