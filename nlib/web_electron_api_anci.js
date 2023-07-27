









window.platform = window.platform || "web";

if(window.platform == "web" || window.platform == "electron")
{  //  if platform matches


$(OnStart);

{  //  Node API

window.nodeapi=(data,cbf)=>{  //  will be overrided later on Android

var url;

  url=( anci.query.storage_location_url || (  ge("storage_location_url") && ge("storage_location_url").value  ) ||
  	    "local"  
	  ).trim();
  
  if(ge("storage_location_url"))
    ge("storage_location_url").value=url;

  var xhr;
  if (window.XMLHttpRequest)
  {
    xhr = new XMLHttpRequest();
  }
  else
  {
    // code for older browsers
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }

  if(url=="local")
    var localorp="/storage_local"
  else
  {
    var localorp="/storage_proxy";

    var dobj=JSON.parse(data || "{}");
    dobj.url=[];
    if(url.startsWith("["))
      dobj.url.push(...JSON.parse(url));
    else
      dobj.url.push(url);

    data=JSON.stringify(dobj);
	
    if(!location.pathname.endsWith("/main.app"))
      localorp=dobj.url.shift()+"?passwd="+window.passwd;
  }


  if(cbf!=null)
  {
    //console.log(cbf);

    return new Promise(resolve=>{
    xhr.onreadystatechange = function()
    {
     if ((xhr.readyState == 4 && xhr.status == 200))
      {


        if(cbf=="pm")
          resolve(xhr.responseText);
        else
          cbf(xhr.responseText);
      }
    };

    xhr.open("POST", localorp, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(data);

    });
  }

  xhr.open("POST", localorp, false);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(data);
  
  return (xhr.responseText);
}


{  //  Network 

anci.RunRemoteApp=(url)=>
{
    anci.OpenUrl(url+`?platform=${window.platform}&passwd=${window.passwd}&storage_location_url=${location.protocol+"//"+location.host+"/storage_local"}`);
}

anci.remoteapp=anci.RunRemoteApp;

}  //  Network End


{ //  File system operations

let saveToFile=saveAs;
delete saveAs;

anci.BrowserDownloadFile=(b64_or_arr,file_name)=>
{
  if(typeof(b64_or_arr)=="string")
    var barr=new Uint8Array(anci.b64arr(b64_or_arr));
  else
    var barr=new Uint8Array(b64_or_arr);

  var blob=new Blob([barr],{type:"application/octet-stream"});
  saveToFile(blob,file_name);
}

anci.bdlf=anci.BrowserDownloadFile;

}  //  File system operations End


anci.GetClipboardText=async function()
{
var s=await navigator.clipboard.readText();
return s;
};

anci.getcb=anci.GetClipboardText;

Object.defineProperty(anci,"cb",{set:anci.setcb,get:anci.getcb});

anci.GetAppPath=async function(onlyName)
 {
   var tmps="/sdcard/napps/";
   var s=location.href;
   s=s.substr(s.indexOf(tmps)+tmps.length);
   s=s.substr(0,s.indexOf("/main.app"));
   
   if(onlyName)
	   return s;
   
   return tmps+s;
 };

anci.GetAppName=()=>anci.GetAppPath(true);


anci.GetVersion=async function()
 {
   return anci.AppVersion || "0.0";
 };
 

anci.getappp=anci.GetAppPath;
anci.getappn=anci.GetAppName;
anci.getv=anci.GetVersion;

Object.defineProperty(anci,"appp",{get:anci.getappp});
Object.defineProperty(anci,"appn",{get:anci.getappn});
Object.defineProperty(anci,"ver",{get:anci.getv});

anci.OpenUrl=function(url)
{
	if(window.platform == "electron")
	{
	  let upmost=window;
	  while(upmost.opener!=null)
		upmost=upmost.opener;
	  return upmost.open(url);
	}
	else
	  return window.open(url);
    
};

anci.openu=anci.OpenUrl;

anci.OpenFile=async function(filepath,absext)
{	
if(!filepath) return false;
filepath+='';

if(!(await anci.FileExists(filepath))) return false;
var absexists;
var tind=filepath.lastIndexOf(".");
if(tind==-1)
var fext="No Ext";
else
var fext=filepath.substr(tind).toLowerCase();

if(absext!=null && absext!="" && typeof(absext)==="string")
{
fext=absext.toLowerCase();absexists=true;
}

var htmlf=".html";
var txtf=".js/.css/.txt/.c/.json";
var imgf=".jpg/.jpeg/.png/.gif/.svg/.bmp/.ico";
var audf=".mp3/.wav";
var vidf=".mp4/.webm/.ogg";

cbf=async function(nfext)
{ // cbf start

if(htmlf.indexOf(nfext)!=-1)
{
	var t=await anci.rf(filepath);
	var cwin=anci.openu("about:blank");
	cwin.document.write(t);
}
else if(txtf.indexOf(nfext)!=-1)
{

    if(await anci.FolderExists("/sdcard/napps/notepad"))
    {
      //var tobj={filep:filepath,"storage_location_url":};
      var turl=location.href;
      var tind=turl.indexOf("napps/")+6;
      turl=turl.substr(0,tind)+`notepad/main.app?filep=${filepath}&storage_location_url=${ge("storage_location_url").value}`;
      anci.openu(turl);
      return 0;
    }
    var t=await anci.ReadFile(filepath,null,"pm");
    var cwin=anci.openu("about:blank");
    cwin.document.write("<text"+"area id=\"tall\" style=\"width:100%;height:95%;\"></text"+"area><br><but"+"ton onclick=\"var cwin=window.opener.open(\'about:blank\');cwin.document.write(tall.value);\">Html preview</but"+"ton>");
    cwin.document.getElementById("tall").value=t;

}
else if(imgf.indexOf(nfext)!=-1)
{
    var b64=await anci.ReadFile(filepath,"base64","pm");
    var datauri="data:image/"+nfext.substr(1)+";base64,"+b64;
    var cwin=anci.openu("about:blank");
    cwin.document.write("<img src=\""+datauri+"\">");
}
else if(audf.indexOf(nfext)!=-1)
{
    //if(nfext==".mp3") nfext=".mpeg";
    var b64=await anci.ReadFile(filepath,"base64","pm");
    /*var tind=filepath.lastIndexOf("/")+1;
    bdownloadfile(b64,filepath.substr(tind));
    return false;
    */
    var datauri="data:audio/"+nfext.substr(1)+";base64,"+b64;
    var cwin=anci.openu();
    cwin.document.write("<audio controls=\"controls\" autobuffer=\"autobuffer\"><source src=\""+datauri+"\" /></audio>");
    //cwin.document.write("<video controls><source src=\""+datauri+"\"></video>");
}
else if((vidf).indexOf(nfext)!=-1)
{
    var b64=await anci.ReadFile(filepath,"base64","pm");
    var datauri="data:video/"+nfext.substr(1)+";base64,"+b64;
    var cwin=anci.openu("about:blank");
    cwin.document.write("<video controls><source src=\""+datauri+"\"></video>");
}
else //(nfext===".download" or more)
{
    var b64=await anci.ReadFile(filepath,"base64","pm");
    var tind=filepath.lastIndexOf("/")+1;
    anci.bdlf(b64,filepath.substr(tind));
    return false;
}

} // cbf ends

if(htmlf.indexOf(fext)+txtf.indexOf(fext)+imgf.indexOf(fext)+audf.indexOf(fext)+vidf.indexOf(fext)==-5 && !absexists || fext==".select")
{
var item=await anci.CreateListDialog(filepath+"\n選擇檔案類型： Select file type:","文字 Text,圖片 Image,音樂 Audio,影片 Video,下載 Download",null,null,"pm");

  if(item.startsWith("文"))
  cbf(".txt");
  else if(item.startsWith("圖"))
  cbf(".jpg");
  else if(item.startsWith("音"))
  cbf(".mp3");
  else if(item.startsWith("影"))
  cbf(".mp4");
  else if(item.startsWith("下"))
  cbf(".download");

} // if other file types
else
cbf(fext);

};

anci.openf=anci.OpenFile;

anci.GetFileDate=async (filePath)=>{return new Date((await anci.GetFileState(filePath)).mtime);};

anci.GetFileSize=async (filePath)=>{return ((await anci.GetFileState(filePath)).size);};

anci.TextToSpeech=function( rtext,rpitch,rrate)
{
try{
  rtext+='';
  
  var msg = new window.SpeechSynthesisUtterance(rtext);

  msg.pitch=rpitch || 1;
  msg.rate=rrate || 1;

var engc=0;

for(var i=0;i<rtext.length;i++)
{
if(rtext.charCodeAt(i)<128)
engc++;
}

if(engc/rtext.length>0.5)
msg.lang='en-US';
else
msg.lang='zh-TW';


return new Promise(resolve=>{

msg.onend=resolve;

window.speechSynthesis.cancel()
window.speechSynthesis.speak(msg);

});


}catch(e){alert(e.stack);}
};

anci.tts=anci.TextToSpeech;


}  //  Node API End


for(let i of Object.keys(anci))
  {
    if((i+"").toLowerCase()!=i) anci[i].Name=i;
  }


}  //  if platform matches End









