





window.platform = window.platform || "web";

anci={alert2_resolves:{},showlist_resolves:{}};

$(OnStart);

{  //  Node API

let saveToFile=saveAs;
delete saveAs;

window.nodeapi=(data,cbf)=>{  //  will be overrided later on Android

var url;

  url=( (  ge("storage_location_url") && ge("storage_location_url").value  ) ||
  	    "local"  
	  ).trim();

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

anci.DownloadFile=(url,file_path,headers,method)=>
{
  if(typeof headers=="string")
  {
    try{
      headers=JSON.parse(headers);
    }catch(e){headers={};}
  }
  
  var sobj={"cmd":"downloadfile",
                url,headers,
                "path":file_path,
                "method":(method || "GET")};
				
  return nodeapi(JSON.stringify(sobj),"pm");
}

anci.dlf=anci.DownloadFile;

anci.DownloadFilePost=(url,file_path,headers)=>anci.dlf(url,file_path,headers,"POST");

anci.dlfp=anci.DownloadFilePost;

anci.HttpRequest=(method_optional,url,encoding,data,headers)=>
{
  if(typeof headers=="string")
    try{
      headers=JSON.parse(headers);
    }catch(e){headers={};}
	
  let tmpm=	(method_optional+"").toLowerCase().trim();
  if(!("head,get,post,put,delete,connect,options,trace,patch").split(",").includes(tmpm)) 
  {
	  headers=data
	  data=encoding
	  encoding=url;
	  url=method_optional
	  method_optional="GET"
  }

  var sobj={"cmd":"app.xhr",
                url,
                "body":data,
                method:method_optional,
                headers,
                encoding  };
  return nodeapi(JSON.stringify(sobj),"pm");

};

anci.xhr=anci.HttpRequest;

}  //  Network End


{ //  File system operations

anci.BrowserUploadFile=(overwrite)=>
{
	if(typeof overwrite != "boolean")
	    overwrite="pm";
	
return new Promise(resolve=>{
browser_file_select_dialog.onchange=function()
  {
    var fr=new FileReader();
    fr.onload=function()
      {
        if(overwrite=="pm")
          overwrite=resolve;
        else
          {
            var s=overwrite;
            overwrite=async function(res)
              {
                if(s==false)
                  {
                    while(await anci.FileExists("/sdcard/"+res.fname))
                      {
                        var tind=res.fname.lastIndexOf(".");
                        if(tind===-1)
                          res.fname+="-new";
                        else
                          res.fname=res.fname.substr(0,tind)+"-new"+res.fname.substr(tind);
                      }
                  }
                resolve(await anci.WriteFile("/sdcard/"+res.fname,res,"base64"));
              };
          }

        if(fr.result==null) fr.result="";
		var b64s=new String(fr.result.substr(fr.result.indexOf("base64,")+7));
		b64s.fname=browser_file_select_dialog.files[0].name;
        overwrite(b64s);
        browser_file_select_dialog.onchange=null;
        browser_file_select_dialog.value=null;
      };
    fr.readAsDataURL(browser_file_select_dialog.files[0]);
  };
browser_file_select_dialog.click();
});
}

anci.bulf=anci.BrowserUploadFile;

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

anci.ReadFileInBytes=async (filePath)=>anci.b64arr(await anci.ReadFile(filePath,"base64"));

anci.rfb=anci.ReadFileInBytes;

anci.WriteFileInBytes=async (filePath,byteArray,cbf)=>(await anci.WriteFile(filePath,anci.arrb64(byteArray),"base64"));

anci.wfb=anci.WriteFileInBytes;

anci.ReadFile=function(filePath,textEncoding)
{
	textEncoding=textEncoding || "utf8";

    var sobj={"cmd":"app.ReadFile",
                "path":filePath,
                "encoding":textEncoding };
				
    return nodeapi(JSON.stringify(sobj),"pm");
};

anci.rf=anci.ReadFile;

anci.WriteFile=function(filePath,textToWrite,textEncoding)
{
  if(textToWrite==null) return "Write file error: No contents specified";
  textEncoding=textEncoding || "utf8";

  var sobj={"cmd":"app.WriteFile",
                "path":filePath,
                "text":textToWrite,
                "encoding":textEncoding };
  return nodeapi(JSON.stringify(sobj),"pm");
};

anci.wf=anci.WriteFile;

anci.MakeFolder=function(folderPath)
{
  var sobj={"cmd":"app.MakeFolder",
                "path":folderPath };
  return nodeapi(JSON.stringify(sobj),"pm");
};

anci.mkdir=anci.MakeFolder;

anci.DeleteFile=function(filePath)
{
  var sobj={"cmd":"app.DeleteFile",
                "path":filePath };
  return nodeapi(JSON.stringify(sobj),"pm");
};

anci.rm=anci.DeleteFile;

anci.DeleteFolder=function(folderPath)
{
  var sobj={"cmd":"app.DeleteFolder",
                "path":folderPath };
  return nodeapi(JSON.stringify(sobj),"pm");
};

anci.rmdir=anci.DeleteFolder;

anci.RenameFile=function(oldPath,newPath,overwrite,isFolder)
{
  var sobj={"cmd": (isFolder?"app.RenameFolder":"app.RenameFile"),
                "path":oldPath,
                "npath":newPath,
                overwrite };
  return nodeapi(JSON.stringify(sobj),"pm");
};

anci.mv=anci.RenameFile;

anci.RenameFolder=(oldPath,newPath,overwrite)=>anci.RenameFile(oldPath,newPath,overwrite,true);

anci.mvd=anci.RenameFolder;

anci.CopyFile=function(sourcePath,destinationPath,overwrite,isFolder)
{
  var sobj={"cmd": (isFolder?"app.CopyFolder":"app.CopyFile"),
                "path":sourcePath,
                "npath":destinationPath,
                "overwrite":overwrite };
  return nodeapi(JSON.stringify(sobj),"pm");
};

anci.cp=anci.CopyFile;

anci.CopyFolder=(sourcePath,destinationPath,overwrite)=>anci.CopyFile(sourcePath,destinationPath,overwrite,true);

anci.cpd=anci.CopyFolder;

anci.FileExists=async (filePath,isFolder)=>
{
  var sobj={"cmd":(isFolder?"app.FolderExists":"app.FileExists"),
                "path":filePath  };

  var res=await nodeapi(JSON.stringify(sobj),"pm");

  if(res=="1")
    return true;

  return false;

};

anci.hasf=anci.FileExists;

anci.FolderExists=(folderPath)=>anci.FileExists(folderPath,true);

anci.hasd=anci.FolderExists;

anci.ListFolder=async (folderPath)=>
{
  var sobj={"cmd":"app.ListFolder",
                "path":folderPath };

try
{
  var lsd=await nodeapi(JSON.stringify(sobj),"pm");

  if(!lsd.startsWith("Fail"))
    return JSON.parse(lsd);
}
catch(e){alert(e.stack)}
	
  return [];
}

anci.ls=anci.ListFolder;

anci.ChooseFile=async (default_folders,manually_enter)=>
{
var deflist=["/sdcard"];
if(manually_enter)
	deflist.unshift("手動輸入... Manually enter...");

if(typeof(default_folders)=="string" && default_folders)
{
  deflist.push(...default_folders.split(","));
}
else if(default_folders)
{
  deflist.push(...default_folders);
}

var selected_file = await anci.showlist("選擇檔案 Select a file",deflist);

var file_selected=async (selected_file)=>{
	
if(!selected_file) return "";

selected_file+="";
var special_selection=selected_file.substr(0,3);

if(special_selection=="無項目")
	return "";
else if(special_selection=="手動輸")
	return file_selected(await prompt("輸入檔案路徑 Enter file path"));

if(await anci.hasf(selected_file))
	return selected_file;
else if(await anci.hasd(selected_file))
{
	if(selected_file.slice(-1)=="/")
		selected_file=selected_file.slice(0,-1);
	let parentFolder=selected_file.substr(0,selected_file.lastIndexOf("/")+1);
	let sel2=await anci.showlist("選擇檔案 Select a file",[parentFolder,...(await anci.ls(selected_file))]);
	if(sel2!=parentFolder)
		selected_file+="/"+sel2;
	else
		selected_file=parentFolder;
	
	//alert(selected_file);
	return await file_selected(selected_file);
}

	

};

return await file_selected(selected_file);

}

anci.selectf=anci.ChooseFile;


}  //  File system operations End


anci.SetClipboardText=async function(txt)
{
if( window.clipboardData && window.clipboardData.setData )
  {
    window.clipboardData.setData("Text", txt);
    return "Successfully set to clipboard: " + txt;
  }
  
  obj=document.createElement("textarea");

  obj.value=(txt+"");

  document.body.append(obj);

  obj.select();

  document.execCommand("copy");

  obj.remove();
  
  return "Successfully set to clipboard: " + txt;

};

anci.setcb=anci.SetClipboardText;

anci.GetClipboardText=async function()
{
var s=await navigator.clipboard.readText();
return s;
};

anci.getcb=anci.GetClipboardText;



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

anci.GetDisplayWidth=function()
 {
 return window.innerWidth;
 };

anci.GetDisplayHeight=function()
 {
 return window.innerHeight;
 };

anci.OpenUrl=function(url)
{
	let upmost=window;
	while(upmost.opener!=null)
		upmost=upmost.opener;
    return upmost.open(url);
};

anci.openu=anci.OpenUrl;

anci.OpenFile=async function(filepath,absext)
{
if(!filepath) return false;
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

anci.TextToSpeech=function( rtext,rpitch,rrate)
{
try{
  var msg = new window.SpeechSynthesisUtterance(rtext);

  msg.pitch=rpitch;
  msg.rate=rrate;

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

window.speechSynthesis.speak(msg);

});


}catch(e){alert(e.stack);}
};

anci.tts=anci.TextToSpeech;


}  //  Node API End









{  //  Common libraries

anci.GetDocumentation=()=>
{
let str=JSON.stringify(
Object.fromEntries(
  Object.keys(anci)
  .filter(ii=>(ii.toLowerCase()!=ii))
  .map(ii=>
    {
	  let par=(anci[ii].toString().match(/\(.*?\)/) || [])[0] || "";
      return [anci[ii].Name+par,anci[ii].Desc || "NIL"]
    })
)
,null,1)

return str;
}

anci.getdoc=anci.GetDocumentation;

anci.GetDocumentationAbbreviation=()=>
{
let str=JSON.stringify(
Object.fromEntries(
  Object.keys(anci)
  .filter(ii=>(ii.toLowerCase()==ii))
  .map(ii=>
    {
	  let par=(anci[ii].toString().match(/\(.*?\)/) || [])[0] || "";
      return [ii+par,anci[ii].Name]
    })
)
,null,1)

return str;
}

anci.getdoca=anci.GetDocumentationAbbreviation;

anci.OpenErudaConsole=()=>
{
  return new Promise(resolve=>
  {
    var script = document.createElement('script');
	script.src="https://cdn.jsdelivr.net/npm/eruda";
	document.body.appendChild(script);
	script.onload = function () { eruda.init();resolve(); }
  });
}

anci.eruda=anci.OpenErudaConsole;

anci.ListObjectProperties=function(obj)
{
          let objO=obj;
          let listK={};
          while(obj!=null)
            {
                Object.getOwnPropertyNames(obj).forEach(i=>{
                    listK[i]=1;
                });
                obj=obj.__proto__;
            }
          let ret=Object.keys(listK);
          let oname=objO.constructor && objO.constructor.name;
          if(oname=="Number")
            ret.unshift(objO);
          else if(oname=="String")
            ret.unshift(objO.substr(0,1000));
          else if(oname=="Array")
            ret.unshift(objO.slice(0,10).join(","));

          ret.unshift(oname || "No Constructor");
          return ret;
}

anci.objls=anci.ListObjectProperties;

{  //  GUI

anci.ShowProgress=function(msg)
{
    msg=(msg || "Loading... 載入中...")+"";
    ge("progress_fullscreen").innerHTML=msg;
    ge("progress_fullscreen").style.display="inline";
};

anci.showp=anci.ShowProgress;

anci.HideProgress=function()
{
    ge("progress_fullscreen").onclick();
};

anci.hidep=anci.HideProgress;

anci.ShowPopup=async function(msg,delayMilliseconds)
{
    msg=(msg || "Hello 你好")+"";
    anci.ShowProgress(msg);
    await anci.Sleep(delayMilliseconds || msg.length * 300);
	anci.HideProgress();
};

anci.toast=anci.ShowPopup;



alert2=async (msg,textAsHtml)=>{
  if(msg && typeof(msg)=="object")
    msg=JSON.stringify(msg,null,1);

  //msg=(msg==null)?"":msg;
  
  msg+="";
  
  var uniqueID=anci.rndtime();
  
  
  var dlg=$(`<div>
</div>
`)
          .css("position","fixed")
          .css("width","80vw")
          .css("height","80vh")
          .css("left","10vw")
          .css("top","5vh")
          .css("background-color","#38383c")
          .css("color","white")
          .css("overflow-wrap","break-word")
          .css("border-radius","20px")
          .css("font-size","20px")
          .css("padding","10px")
          .css("overflow","auto")
          .attr("onclick",`$(this).remove();anci.alert2_resolves[${uniqueID}]();delete anci.alert2_resolves[${uniqueID}];`);
		  
  if(textAsHtml)
    dlg.html(msg);
  else
    dlg[0].innerText=(msg);

  dlg.append(`<div class="text-center"><button onclick="anci.alert2_resolves[${uniqueID}]($(this).parent().parent().find('textarea').val());">OK</button></div>`);
  
  $("body").append(dlg);
  
  dlg.find("button").last().focus();
  
  return await new Promise(resolve=>{
	  anci.alert2_resolves[uniqueID]=resolve;
  });
  
};

anci.Prompt=async (msg,default_value,textAsHtml)=>
{
  msg=msg || document.title; 
  return await alert2(`${textAsHtml?msg:anci.ttoh(msg)}<br><textarea style="width:100%;height:70%" onclick="event.stopPropagation();">${default_value || ""}</textarea>`,true)
}

prompt=anci.Prompt;  
  
anci.showlist=async (title_optional,list,listAsHtml)=>{
  if(!list || typeof(list)=='boolean')
  {
	  listAsHtml=list;
	  list=title_optional;
	  title_optional=document.title;
  }
  
  if(typeof(list)=="string")
    {
      list=list.split(",");
    }

  if(!list) list=["無項目 No Items"];
  
  var uniqueID=anci.rndtime();

  return (await new Promise(resolve=>{

  anci.showlist_resolves[uniqueID]=resolve;

  alert2(`<h3 class="alert alert-success text-center">
${title_optional}</h3>
\n`+
  `<ul class="list-group">\n`+
  `
<li class="list-group-item list-group-item-danger text-center" onclick="anci.showlist_resolves[${uniqueID}]('');delete anci.showlist_resolves[${uniqueID}];">取消Cancel</li>
`+
  list.map((i,ind)=>(`
<li class="list-group-item list-group-item-info" onclick="var res=new String(anci.b64d('${anci.b64e(i)}'));res.index=${ind};anci.showlist_resolves[${uniqueID}](res);delete anci.showlist_resolves[${uniqueID}];">${listAsHtml?i:anci.ttoh(i)}</li>
`)).join("\n")+
  `</ul>
`,true);

  })); //new Promise
};

anci.showlist.Name="ShowList";

anci.CreateListDialog=anci.showlist;

}  //  GUI End

{  //  String handling

// base64 <-> bytes Array <-> string

let base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
let base64DecodeChars = new Array(
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
    -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
    -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);


anci.Base64ToBarr=(str)=>{
	
    var cbyte=0;
    var c1, c2, c3, c4;
    var i, len, out;

    len = str.length;
    i = 0;
    out = new Array();
    while(i < len) {
	/* c1 */
	do {
	    c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
	} while(i < len && c1 == -1);
	if(c1 == -1)
	    break;

	/* c2 */
	do {
	    c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
	} while(i < len && c2 == -1);
	if(c2 == -1)
	    break;

	out[cbyte] = ((c1 << 2) | ((c2 & 0x30) >> 4));
        cbyte++;

	/* c3 */
	do {
	    c3 = str.charCodeAt(i++) & 0xff;
	    if(c3 == 61)
		return out;
	    c3 = base64DecodeChars[c3];
	} while(i < len && c3 == -1);
	if(c3 == -1)
	    break;

	out[cbyte] = (((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
        cbyte++;

	/* c4 */
	do {
	    c4 = str.charCodeAt(i++) & 0xff;
	    if(c4 == 61)
		return out;
	    c4 = base64DecodeChars[c4];
	} while(i < len && c4 == -1);
	if(c4 == -1)
	    break;
	out[cbyte] = (((c3 & 0x03) << 6) | c4);
        cbyte++;
    }
    return out;
}

anci.b64arr=anci.Base64ToBarr;

anci.BarrToBase64=(str)=>{
    var out, i, len;
    var c1, c2, c3;

    len = str.length;
    i = 0;
    out = "";
    while(i < len) {
	c1 = str[i++] & 0xff;
	if(i == len)
	{
	    out += base64EncodeChars.charAt(c1 >> 2);
	    out += base64EncodeChars.charAt((c1 & 0x3) << 4);
	    out += "==";
	    break;
	}
	c2 = str[i++];
	if(i == len)
	{
	    out += base64EncodeChars.charAt(c1 >> 2);
	    out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
	    out += base64EncodeChars.charAt((c2 & 0xF) << 2);
	    out += "=";
	    break;
	}
	c3 = str[i++];
	out += base64EncodeChars.charAt(c1 >> 2);
	out += base64EncodeChars.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
	out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >>6));
	out += base64EncodeChars.charAt(c3 & 0x3F);
    }
    return out;
}

anci.arrb64=anci.BarrToBase64;

anci.Base64Encode=(str)=>{
let e=new TextEncoder();
return anci.arrb64(e.encode(str));
}

anci.b64e=anci.Base64Encode;

anci.Base64Decode=(str)=>{
let d=new TextDecoder();
return d.decode(new Uint8Array(anci.b64arr(str)));
}

anci.b64d=anci.Base64Decode;

//  Text <-> Html

anci.TextToHtml=(text)=>
{
  var cvt=$("<div>")
  cvt[0].innerText=text
  return cvt.html()
}

anci.ttoh=anci.TextToHtml;

anci.HtmlToText=(html)=>
{
  html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
  html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
  html = html.replace(/<\/div>/ig, '\n');
  html = html.replace(/<\/li>/ig, '\n');
  html = html.replace(/<li>/ig, '  *  ');
  html = html.replace(/<\/ul>/ig, '\n');
  html = html.replace(/<\/p>/ig, '\n');
  html = html.replace(/<br\s*[\/]?>/gi, "\n");
  html = html.replace(/<[^>]+>/ig, '');
  return html;
}

anci.htot=anci.HtmlToText;

}  //  String handling End

{  //  Time handling

anci.Sleep=(milliSeconds)=>
{
    return new Promise(resolve=>{
    setTimeout(resolve,milliSeconds);
	});
}

anci.sleep=anci.Sleep;

anci.WaitForValue=async (obj,key,value,milliSeconds)=>{
	if(value!=null)
	{
	  while(obj[key]!=value)
        await anci.sleep(milliSeconds || 100);
	}
	else
	{
      while(!obj[key])
        await anci.sleep(milliSeconds || 100);
	}
}

anci.waitv=anci.WaitForValue;

anci.RandomTimestamp=()=>
{
  var min=101,max=999
  rnd=Math.floor(Math.random() * (max - min) + min)
  return rnd+""+Date.now();
}

anci.rndtime=anci.RandomTimestamp;

anci.Timer=function(action_function,interval_msec)
{
    this.action=action_function;
    this.interval=interval_msec;
    //alert(this.ctrl==null);
    this.start=function()
      {
      this.stop();
      if(this.action!=null && this.interval>0)
      this.ctrl=setInterval(this.action,interval_msec);
      }
    this.stop=function()
      {
      if(this.ctrl!=null)
      clearInterval(this.ctrl);
      }
}

}  //  Time handling End

for(let i of Object.keys(anci))
  {
    if((i+"").toLowerCase()!=i) anci[i].Name=i;
  }

ge=(elementID)=>document.getElementById(elementID);




}  //  Common libraries End




