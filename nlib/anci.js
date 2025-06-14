









var anci = {} ;

if(globalThis.anci)
  anci = globalThis.anci;


Object.assign(anci , 
              { droidscript_resolves:{},
                alert2_resolves:{},
                showlist_resolves:{}  } ) ;


anci._absorb=(func,falias)=>{
  if( func && (func.Name || func.name) )
  {
    let key = func.Name || func.name ;
    if( anci[key] )
    {
      anci[key+"Browser"] = anci[key] ;
      anci[key]=func; 
    }
    else   
      anci[key]=func; 
  }
  if(falias)
    anci[falias]=func;
}


function ge(elementID){return document.getElementById(elementID);}

const tic = "`" ;
const hh = "\r\n";
const jss = JSON.stringify;
const jsp = JSON.parse;
const csl = s=>console.log(s);


let nodeapi;

let InBrowser = (globalThis.window == globalThis) ;
let InNodeRuntime = (! InBrowser && typeof(process)!=="undefined") ;

csl("InBrowser:"+InBrowser);
csl("InNodeRuntime:"+InNodeRuntime);


// #region  {  Default Parameters

    anci.AppVersion = 0.87;              
    // The app version for Node.js web/electron APP
    anci.ProVersion = false;
    anci.DroidOrientation = "Default";    
    /* 
      Orientation for Android DroidScript APP, 
      Available values: 
        Default,Portrait,Landscape,
        ReversePortrait,ReverseLandscape, 
        or use number 0~4
    */

// #endregion  }  Default Parameters





// #region  {  Common API


  // #region  {  Network


async function RunRemoteApp(url="",param={})
{
  url+='';
  
  let rmurl = anci.isremote() ;
  
  if(!url.match(/[\\\/]/g))
  {
    let appname = url ;

    let rpn = "/sdcard/napps/"+appname;
    let rp1 = '/bin/'+appname+'/{app_entry}.html' ;
    let rp2 = '/media/sdcard/napps/' + appname + '/{app_entry}.html' ;
    
    if( await anci.hasf( rp1 ) )
      url = await anci.RealPath( rp1 ) ;
    else if( await anci.hasf( rp2 ) )
      url = await anci.RealPath( rp2 ) ;
    else if(anci.platform=="android")
      return "No app "+url+" found in /bin and /media/sdcard/napps" ;
    else if( await anci.hasd( rpn ) )
      url = rpn + "/main.app" ;
    else if( await anci.hasurl( "../"+appname+'/{app_entry}.html' ) )
    {
      url =  "../"+appname+'/{app_entry}.html' ;
      rmurl = "" ;
    }
    else
    {
      return "Failed to find app: " + appname ;
    }
    
    if( rmurl )
      url = new URL( rmurl ).origin + url ;

  }

  
  let obj = { platform:anci.platform  ,  ...param };
  
  
  
  if( rmurl = anci.isremote() )
  {
    let u = new URL( rmurl );
    rmurl = u.href.replace( u.search, "") ;
    obj.storage_location_url = rmurl ;
  }
  else
    obj.storage_location_url = location.origin + "/storage_local"

  if(anci.passwd)
    obj.passwd = anci.passwd;

  let query = anci.genurlp( obj );
  
  if(    !confirm("Will now open other APP(inherits permissions) 將開啟其他APP(將繼承權限):\r\n"+url+'?'+query )    )
    return false;

  

  if(anci.platform == "android")
    location.href = (url + "?" + query );
  else
    anci.openu( url + "?" + query )
  return true;
}

var remoteapp=RunRemoteApp;
anci._absorb(remoteapp,"remoteapp");


function isRemoteApp()
{
  if( anci.platform == "web" )
    return anci.nodeapi( { test:1 }, true, true ) ;


  if(  ( anci.platform == "android" && 
          (location.pathname.startsWith("/android_asset/") ||
          location.pathname.startsWith("/storage/emulated/") )
        ) )
    return false;
  else
    return true;
  
}

anci._absorb( isRemoteApp , "isremote" );


function normalizePort(url) {
  if (url.port) return url.port;
  return url.protocol === "https:" ? "443" : url.protocol === "http:" ? "80" : "";
}


function isSameOriginStrict(url1, url2) {
  const a = new URL(url1);
  const b = new URL(url2);
  return a.protocol === b.protocol &&
         a.hostname === b.hostname &&
         normalizePort(a) === normalizePort(b);
}


function DownloadFile(url,file_path,headers,method)
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

  return nodeapi( sobj ) ;
}

var dlf=DownloadFile;
anci._absorb(dlf,"dlf");


function DownloadFilePost(url,file_path,headers)
{
  return anci.dlf(url,file_path,headers,"POST");
}

var dlfp=DownloadFilePost;
anci._absorb(dlfp,"dlfp");


function HttpRequest(method_optional,url,encoding,data,headers)
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
	  url = method_optional + "" ;
	  method_optional="GET"
  }

  var sobj={"cmd":"app.xhr",
                url,
                "body":data,
                method:method_optional,
                headers,
                encoding  };

  return nodeapi( sobj ) ;

}

var xhr=HttpRequest;
anci._absorb(xhr,"xhr");


function HttpRequestInBytes(url)
{
  url = ( url || "" ) + "";
  
return new Promise(resolve=>{

const xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
xhr.responseType = 'blob'; // 取得 Blob 物件

xhr.onload = function () {
  if (xhr.status === 200) {
    const blob = xhr.response; // 這是 Blob

    // 轉成 byte array（使用 FileReader）
    const reader = new FileReader();
    reader.onload = function () {
      const arrayBuffer = reader.result;
      const uint8Array = new Uint8Array(arrayBuffer);
      resolve(Array.from(uint8Array) );

      // 可選：處理 uint8Array，例如下載、檢查內容
    };
    reader.readAsArrayBuffer(blob);
  } else {
    console.error('下載失敗，狀態碼：' + xhr.status);
  }
};

xhr.onerror = function () {
  console.error('請求錯誤');
};

xhr.send();

});

}

var xhrb=HttpRequestInBytes;
anci._absorb(xhrb,"xhrb");


function HttpRequestXhr(url)
{
  url = ( url || "" ) + "";

return new Promise(resolve=>{
$.ajax({
  url,
  type: 'Get', 
  dataType:'text',
  success: function(data, status, xhr) {
    resolve(data);
  },
  error:e=>resolve("Failed to request")
});
});

}

var xhrt=HttpRequestXhr;
anci._absorb(xhrt,"xhrt");


function CheckUrlExistence(url)
{

  return new Promise(resolve=>{

  $.ajax( { url:url+"" , type:"HEAD", dataType:"text",
    success:()=>resolve(true), error:()=>resolve(false)});

  });

}

var hasurl = CheckUrlExistence ;
anci._absorb( hasurl , "hasurl" ) ;


  // #endregion  }  Network


  // #region  {  File system operations


async function OpenFile(filepath,absext, openashtml)
{	
  if(!filepath) 
    return false;

  filepath+='';

  if(!(await anci.FileExists(filepath))) 
    return false;
    
  let rp = await anci.realp( filepath ) ;
  
  let rmurl = anci.isremote() ;
    if( ! rmurl )
      rp = location.origin + rp ;
    else
      rp = new URL( rmurl ).origin + rp ;
  
  if( await anci.hasurl( rp ) && ! openashtml )
  {
    return await anci.showu( rp );
  }

  var absexists, fext;

  var tind=filepath.lastIndexOf(".");
  if(tind==-1)
    fext="No Ext";
  else
    fext=filepath.substr(tind).toLowerCase();

if(absext!=null && absext!="" && typeof(absext)==="string")
{
  fext=absext.toLowerCase();absexists=true;
}

var htmlf=".html";
var txtf=".js/.css/.txt/.c/.json";
var imgf=".jpg/.jpeg/.png/.gif/.svg/.bmp/.ico";
var audf=".mp3/.wav";
var vidf=".mp4/.webm/.ogg";



if(htmlf.indexOf(fext)+txtf.indexOf(fext)+imgf.indexOf(fext)+audf.indexOf(fext)+vidf.indexOf(fext)==-5 && !absexists || fext==".select")
{
  var item = await anci.showlist(filepath+"\n選擇檔案類型： Select file type:","文字 Text,圖片 Image,音樂 Audio,影片 Video,下載 Download" );

  if(item.startsWith("文"))
    fext = (".txt");
  else if(item.startsWith("圖"))
    fext = (".jpg");
  else if(item.startsWith("音"))
    fext = (".mp3");
  else if(item.startsWith("影"))
    fext = (".mp4");
  else if(item.startsWith("下"))
    fext = (".download");

} // if other file types

var nfext = fext;


if(htmlf.indexOf(nfext)!=-1)
{
	var t=await anci.rf(filepath);

  return await anci.showc(t) ;
}
else if(txtf.indexOf(nfext)!=-1)
{

  if( await anci.hasd("/bin/notepad") && ! openashtml )
  {
    return await anci.remoteapp("notepad", {filep:filepath} );
  }
  
    var text = await anci.rf( filepath );
    
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var blobUrl = URL.createObjectURL(blob);
    
    //alert2(blobUrl);
    
    return await anci.showu( blobUrl ) ;
}
else if(imgf.indexOf(nfext)!=-1)
{
    var b64=await anci.ReadFile(filepath,"base64");
    var datauri="data:image/"+nfext.substr(1)+";base64,"+b64;
    
    return await anci.showc(`<img src="${datauri}">`);
}
else if(audf.indexOf(nfext)!=-1)
{
    if(nfext==".mp3") nfext=".mpeg";
    var b64=await anci.ReadFile(filepath,"base64");

    var datauri="data:audio/"+nfext.substr(1)+";base64,"+b64;
    
    return await anci.showc(`<audio controls="controls" 
                        autobuffer="autobuffer">
                        <source src="${datauri}" />
                      </audio>`);
    
}
else if((vidf).indexOf(nfext)!=-1)
{
  var b64 = await anci.ReadFile(filepath,"base64");
  
  var datauri="data:video/"+nfext.substr(1)+";base64,"+b64;

  return await anci.showc(`<video controls>
                      <source src="${datauri}">
                    </video>`);

}
else //(nfext===".download" or more)
{
    var b64=await anci.ReadFile(filepath,"base64");
    var tind=filepath.lastIndexOf("/")+1;
    return await anci.bdlf(b64,filepath.substr(tind));
}



}  //  open file ends

var openf = OpenFile ;
anci._absorb( openf , "openf" ) ;

//anci.OpenFileBrowser = anci.OpenFile;  //  already done by _absorb


async function BrowserUploadFile(overwrite, upload_path="/sdcard/Download")
{
    if( upload_path.slice(-1) != "/" )
        upload_path += "/" ;
    const dlp = upload_path ;

    if(!window.browser_file_select_dialog)
        $("body").append(anci._bfsd);

    await new Promise(resolve=>{
        browser_file_select_dialog.onchange=resolve;
        browser_file_select_dialog.click();
    });

    var fr=new FileReader();
    await new Promise(resolve=>{
     fr.onload=resolve;
     fr.readAsDataURL(browser_file_select_dialog.files[0]);
    });

    if( ! fr.result ) return "Failed to read file";
    
    let b64s = (fr.result+"")
                     .substr(  fr.result.indexOf( "base64," ) + 7  );
    b64s = new String( b64s );

    b64s.fname = browser_file_select_dialog
                              .files[0].name ; 

    browser_file_select_dialog.onchange=null;
    browser_file_select_dialog.value=null;

    if(  typeof overwrite != "boolean"  )
        return b64s ; 
    else  //  overwrite is boolean
    {
      if( overwrite == false )
      {
        if( ! await anci.hasd( upload_path ) )
        {
          await anci.mkdir( upload_path );

          if( ! await anci.hasd( upload_path ) )
            return "Failed: No such folder" + hh + upload_path ;
        }

        while(  await anci.hasf( dlp + b64s.fname )  )
        {
          var tind = b64s.fname.lastIndexOf(".");
          if( tind===-1 )
              b64s.fname += "_1";
          else
              b64s.fname = b64s.fname.substr(0,tind) +
                             "_1" + b64s.fname.substr(tind) ;
        }  //  while filename exists
      }  //  if overwrite false

  return await anci
                        .wf( dlp+b64s.fname, b64s+"", "base64" );

    }  //  overwrite is boolean
}  //  bulf ends

var bulf = BrowserUploadFile ;
anci._absorb( bulf , "bulf" ) ;


function ReadFileInBytes(filePath)
{
  var sobj={"cmd":"app.ReadFileInBytes",
                "path": (filePath || "")+"",
           };

  return nodeapi( sobj ) ;
}

var rfb = ReadFileInBytes ;
anci._absorb( rfb , "rfb" ) ;


function WriteFileInBytes(filePath,byteArray)
{
  if(!byteArray) return "Write file error: No contents specified";

  var sobj={"cmd":"app.WriteFileInBytes",
                "path":filePath,
                byteArray };

  return nodeapi( sobj ) ;
}

var wfb = WriteFileInBytes ;
anci._absorb( wfb , "wfb" ) ;


function ReadFile(filePath,textEncoding)
{
	textEncoding=textEncoding || "utf8";

    var sobj={"cmd":"app.ReadFile",
                "path":filePath+'',
                "encoding":textEncoding };

    return nodeapi( sobj ) ;
}  //  read file ends

var rf = ReadFile ;
anci._absorb( rf , "rf" ) ;


function WriteFile(filePath,textToWrite,textEncoding)
{
  if(textToWrite==null) return "Write file error: No contents specified";
  textEncoding=textEncoding || "utf8";

  var sobj={"cmd":"app.WriteFile",
                "path":filePath,
                "text":textToWrite+"",
                "encoding":textEncoding };
  return nodeapi( sobj ) ;
}  //  write file ends

var wf = WriteFile ;
anci._absorb( wf , "wf" ) ;


function MakeFolder(folderPath)
{
  var sobj={"cmd":"app.MakeFolder",
                "path":folderPath+'' };
  return nodeapi( sobj ) ;
}

var mkdir = MakeFolder ;
anci._absorb( mkdir , "mkdir" ) ;


function DeleteFile(filePath)
{
  var sobj={"cmd":"app.DeleteFile",
                "path":filePath+'' };
  return nodeapi( sobj ) ;
}

var rm = DeleteFile ;
anci._absorb( rm , "rm" ) ;


function DeleteFolder(folderPath)
{
  var sobj={"cmd":"app.DeleteFolder",
                "path":folderPath+'' };
  return nodeapi( sobj ) ;
}

var rmdir = DeleteFolder ;
anci._absorb( rmdir , "rmdir" ) ;


function RealPath(filepath)
{
  var sobj={"cmd":"RealPath",
                "param":[filepath+''] };
  return nodeapi( sobj ) ;
}

var realp = RealPath ;
anci._absorb( realp , "realp" ) ;


function RenameFile(oldPath,newPath,overwrite,isFolder)
{
  var sobj={"cmd": (isFolder?"app.RenameFolder":"app.RenameFile"),
                "path":oldPath,
                "npath":newPath,
                overwrite };
  return nodeapi( sobj ) ;
}

var mv = RenameFile ;
anci._absorb( mv , "mv" ) ;


function RenameFolder(oldPath,newPath,overwrite)
{ return anci.RenameFile(oldPath,newPath,overwrite,true); }

var mvd = RenameFolder ;
anci._absorb( mvd , "mvd" ) ;


function CopyFile(sourcePath,destinationPath,overwrite,isFolder)
{
  var sobj={"cmd": (isFolder?"app.CopyFolder":"app.CopyFile"),
                "path":sourcePath,
                "npath":destinationPath,
                "overwrite":overwrite };
  return nodeapi( sobj ) ;
}

var cp = CopyFile ;
anci._absorb( cp , "cp" ) ;


function CopyFolder(sourcePath,destinationPath,overwrite)
{ return anci.CopyFile(sourcePath,destinationPath,overwrite,true); }

var cpd = CopyFolder ;
anci._absorb( cpd , "cpd" ) ;


async function FileExists(filePath,isFolder)
{
  var sobj={"cmd":(isFolder?"app.FolderExists":"app.FileExists"),
                "path":filePath+''  };

  var res=await nodeapi( sobj ) ;

  if(res=="1")
    return true;

  return false;

}

var hasf = FileExists ;
anci._absorb( hasf , "hasf" ) ;


function FolderExists(folderPath)
{ return anci.FileExists(folderPath,true); }

var hasd = FolderExists ;
anci._absorb( hasd , "hasd" ) ;


async function ListFolder(folderPath,recursive)
{
  var sobj={"cmd":"app.ListFolder", recursive,
                "path":folderPath+'' };

try
{
  var lsd=await nodeapi( sobj ) ;

  if(!lsd.startsWith("Fail"))
    return JSON.parse(lsd);
}
catch(e){alert(e.stack)}

  return [];
}

var ls = ListFolder ;
anci._absorb( ls , "ls" ) ;


function ListFolderRecursive(folderPath)
{ return anci.ls(folderPath,true); }

var lsr = ListFolderRecursive ;
anci._absorb( lsr , "lsr" ) ;


async function GetFileState(filePath)
{
  var sobj={"cmd":"app.GetFileState",
                "path":filePath+'' };
  let stat=await nodeapi( sobj ) ;
  try{
	  stat=JSON.parse(stat);
  }catch(e){
	  stat="Failed to GetFileState of "+filePath+"\r\n"+stat;
  }
  
  return stat;
  
}

var stat = GetFileState ;
anci._absorb( stat , "stat" ) ;


async function ChooseFile(default_folders,multi_select)
{

var deflist=["/sdcard", "/home", "/bin", "/media"];
deflist.unshift("<<手動輸入... Manually enter...>>");

if(anci.platform=="android") 
{  
  deflist.unshift("Use System Dialog");
  deflist.push("/android_asset");
  deflist.push("/private");
}

if(typeof(default_folders)=="string" && default_folders)
{
  deflist.push(...default_folders.split(","));
}
else if(default_folders && default_folders.constructor==Array)
{
  deflist.push(...default_folders);
}

var selected_file = await anci.showlist("選擇檔案 Select a file",deflist);

if(anci.platform=="android" && selected_file=="Use System Dialog")  
{
    var sobj={"cmd":"app.ChooseFile",
                "folder":"" };
    return await nodeapi( sobj ) ;
}
else
{

var file_selected=async (selected_file)=>{

if(!selected_file) return "";

selected_file+="";
if(selected_file.startsWith("<span"))
{
  selected_file=$(selected_file).data("path");
}

var special_selection=selected_file.substr(0,3);

if(special_selection=="無項目")
	return "";
else if(special_selection=="<<手")
	return file_selected(await prompt("輸入檔案路徑 Enter file path"));

if(await anci.hasf(selected_file))
	return selected_file;
else if(await anci.hasd(selected_file))
{
	if(selected_file.slice(-1)=="/")
		selected_file=selected_file.slice(0,-1);
	let parentFolder=selected_file.substr(0,selected_file.lastIndexOf("/")+1);

    let icon=i=>
    {
      i=(i+'').toLowerCase();
      if(!i.includes("."))
        return anci.faicon`r,folder-open`;
      else if([".jpg",".jpeg",".bmp",".png",".tiff",".tif",".eps",".ai",".psd",".xcf",".cdr",".raw",".cr2",".nef",".orf",".sr2","webp"].some(ii=>i.endsWith(ii)))
        return anci.faicon`r,image`;
      else if([".mp4",".wmv",".3gp",".flv",".avi",".gif",".mov",".mkv",".avchd",".webm",".mpg"].some(ii=>i.endsWith(ii)))
        return anci.faicon`s,file-video`;
      else if([".mp3",".wav",".mid",".midi",".flac",".amr",".ape",".wv",".m4a",".pcm",".au",".aiff",".bwf",".aac",".ogg"].some(ii=>i.endsWith(ii)))
        return anci.faicon`s,file-audio`;
      else if([".txt",".doc",".docx",".rtf",".json"].some(ii=>i.endsWith(ii)))
        return anci.faicon`s,file-word`;
      else if(i.endsWith(".html") || i.endsWith(".htm"))
        return anci.faicon`b,chrome`;
      else if(i.endsWith(".js"))
        return anci.faicon`s,file-code`;
      else
        return "";
    };

	let listArray = await anci.ls(selected_file);
	listArray.sort((a,b)=>
	{
		a+='',b+='';
	    if(a.includes(".")^b.includes("."))
		      return a.includes(".")?1:-1;

	    return a>b?1:-1;
	});
	
	anci.multi_files=new Set;
	
	listArray=listArray.map(i=>`<span data-path="${i}">${!multi_select?"":`<input type="checkbox" onclick="event.stopPropagation();" 
	                               onchange="let d=$(this).parent().data('path');this.checked?anci.multi_files.add(d):anci.multi_files.delete(d);">`} ${icon(i)} ${anci.ttoh(i)}</span>`);
	
	multi_select && listArray.unshift(`<span data-path="&quot;multi_files&quot;">
	                                    選擇以下多個 Select Multiple Files Below<textarea style="display:none;">"multi_files"</textarea>
									   </span>`);
    
    listArray.unshift(`<span data-path="${parentFolder}">${anci.faicon("r,folder-open")}.. 上一層 Parent<textarea style="display:none;">${selected_file}</textarea></span>`);
	let sel2=await anci.showlist(selected_file,listArray,true);
	if(!sel2) return "";
	
    sel2+='';
  
    if(sel2===selected_file)
      return sel2;

    if(sel2.startsWith("<span"))
      sel2=$(sel2).data("path");
  
    if(sel2==`"multi_files"`) return [...anci.multi_files].map(i=>(selected_file+"/"+i));

	if(sel2!=parentFolder)
		selected_file+="/"+sel2;
	else
		selected_file=parentFolder;

	//alert(selected_file);
	return await file_selected(selected_file);
}
else if( selected_file == "/" )
{
  return await anci.selectf(default_folders,multi_select);
}


};

return await file_selected(selected_file);

}  //  if platform not android or not use system dialog


}  //  end of anci.ChooseFile

var selectf = ChooseFile ;
anci._absorb( selectf , "selectf" ) ;


async function GetFileDate(filePath)
{  
    let mtimeMs=(await anci.GetFileState(filePath+'')).mtimeMs-0;
    //alert(mtimeMs);
    return new Date(mtimeMs.toFixed()-0);  
}

var filemtime = GetFileDate ;
anci._absorb( filemtime , "filemtime" ) ;


async function GetFileSize(filePath="")
{  
  filePath+="";
    
  if( filePath.startsWith('content:') )
  {
    return await anci.urlsize( filePath );
  }
    
  let fsize=(await anci.GetFileState(filePath)).size-0;
  return fsize;  
}

var filesize = GetFileSize ;
anci._absorb( filesize , "filesize" ) ;


  // #endregion  }  File system operations End


  // #region  {  System


function EvalServer(command_to_evaluate)
{
  var sobj={"cmd":"EvalServer",
                "param":[command_to_evaluate+""] };
  return nodeapi( sobj ) ;
}
  
var evalserver = EvalServer ;
anci._absorb( evalserver , "evalserver" ) ;


async function SetClipboardText(txt)
{
  txt+='';

  if( window.clipboardData && window.clipboardData.setData )
  {
    window.clipboardData.setData("Text", txt);
    return "Successfully set to clipboard: " + txt;
  }

  var obj=document.createElement("textarea");

  obj.value=txt;

  document.body.append(obj);

  obj.select();

  document.execCommand("copy");

  obj.remove();

  return "Successfully set to clipboard: " + txt;
}

var setcb = SetClipboardText ;
anci._absorb( setcb , "setcb" ) ;


function GetDisplayWidth()
{
  return window.innerWidth;
}

var getdisplayw = GetDisplayWidth ;
anci._absorb( getdisplayw , "getdisplayw" ) ;


function GetDisplayHeight()
{
  return window.innerHeight;
}

var getdisplayh = GetDisplayHeight ;
anci._absorb( getdisplayh , "getdisplayh" ) ;


// #endregion  }  System


// #endregion  }  Common API





// #region  {  Common libraries


  // #region  {  Utilities



async function SaveValue(...i)
{
  if(i.length==1)
    [ key_name, value, database_file ] =
  [ null, i[0], 'default_db' ];
  else if(i.length==2)
    [ key_name, value, database_file ] =
  [ i[0], i[1], 'default_db' ];
  else if(i.length==3)
    [ key_name, value, database_file ] = i ;
  
  key_name+=""; 
  let appd="/home/"+(await anci.appn);
  if( ! await anci.hasd(appd) ) 
    await anci.mkdir(appd);
  database_file = appd +
  "/" + database_file + ".txt";
  if( await anci.hasf(database_file) )
    {
    try{
      var obj=JSON
      .parse( await anci.rf(database_file) );
    }catch(e){ var obj={}; }
  }
  else
  var obj={};
  
  obj[ key_name ] = value;
  try{
    var ret=await anci.wf( database_file, 
      JSON.stringify(obj) );
    }catch(e){  var ret=e.stack;  }
    return ret;
}
SaveValue.Desc=`f(value) or f(key,value) or f(key,value,database_file)`;

var savev = SaveValue ;
anci._absorb( savev , "savev" ) ;


async function LoadValue(optional_key_name,
                         optional_defvalue,
                         optional_database_file)
{
      if(optional_key_name==null)
        optional_key_name='null';
      if(optional_defvalue==null)
        optional_defvalue="";
      if(!optional_database_file)
        optional_database_file='default_db';

      optional_key_name+=""; 
      let appd="/home/"+(await anci.appn);
      if( ! await anci.hasd(appd) ) 
        await anci.mkdir(appd);

      let database_file = appd +
          "/" + optional_database_file + ".txt";
      if( await anci.hasf(database_file) )
      {
        try{
        var obj=JSON
              .parse( await anci.rf(database_file) );
        }catch(e){ var obj={}; }
      }
      else
        var obj={};
      
      let ret=obj[ optional_key_name ];
      if(ret==null) ret=optional_defvalue;

      return ret;
}

var loadv = LoadValue ;
anci._absorb( loadv , "loadv" ) ;


function ParseUrlParam(url)
{
  url+='';
  let i=url.lastIndexOf('?');
  if(i==-1) return {};
  url=url.substr(i+1);
  let qarr=url.split("&")
              .map(  ii=>( ii.split("=").map(iii=>decodeURIComponent(iii)) )  );

  return Object.fromEntries(qarr);
}

var parseurlp = ParseUrlParam ;
anci._absorb( parseurlp , "parseurlp" ) ;
  

function GenerateUrlParam(param={})
{
  return Object.keys(param).map(i=>{
    return encodeURIComponent(i)+'='+encodeURIComponent(param[i]);
  }).join('&');
}

var genurlp = GenerateUrlParam ;
anci._absorb( genurlp , "genurlp" ) ;


function GetDocumentation(outputHTML,filterString, testButton=true)
{
  let arr=
  Object.keys(anci)
  .filter(ii=>(ii.toLowerCase()==ii && anci[ii]?.Name));

  arr=arr.map(ii=>
    {
	    let par=(anci[ii].toString().match(/\(.*?\)/) || [])[0] || "";
      let tarr=[ii+":"+anci[ii].Name+par];
      if(anci[ii].Desc) 
        tarr.push(anci[ii].Desc);
        
      let bth="";
      if( testButton && anci[ii].Test )
        bth = `<button
               onclick="anci.eval(decodeURIComponent(`+tic+
                           encodeURIComponent(anci[ii].Test)+tic+
                              `)).then(alert2)">
                   Test</button>
                   <div>Test code: ${anci.ttoh(anci[ii].Test)}</div>` ;

      let ohtml=`
  <details onclick="event.stopPropagation();">
    <summary>${tarr[0]}</summary>
    <b>${tarr[1]||""}</b>
    <div style="text-align:center">${bth}</div>
  </details>
  `

      return outputHTML?ohtml:tarr;
    });

  if(filterString)
    arr=arr.filter( i=>{
      return (i+"").toLowerCase().includes((filterString+"").toLowerCase());
    } );

  return arr;
}

var getdoc = GetDocumentation ;
anci._absorb( getdoc , "getdoc" ) ;

Object.defineProperty(anci,"doc",{get:anci.getdoc});


function GetDocumentationAbbreviation(limitLength=25)
{
  let arr=
  Object.keys(anci)
  .filter(ii=>(ii.toLowerCase()==ii && anci[ii]?.Name))
  .map(ii=>
    {
	    let par=(anci[ii].toString().match(/\(.*?\)/) || [])[0] || "";
      let tarr=[ii+":"+anci[ii].Name+par];
      if(anci[ii].Desc) 
        tarr.push(anci[ii].Desc.toString().slice(0,limitLength));

      return tarr;
    })

  return arr;
}

var getdoca = GetDocumentationAbbreviation ;
anci._absorb( getdoca , "getdoca" ) ;

Object.defineProperty(anci,"doca",{get:anci.getdoca});


function Help(filterString="", testButton=true)
{
  filterString=filterString || "";

  if( InBrowser )
  {
    anci.showlist( anci.getdoc(true,filterString+"",testButton) , true );
  }
  else 
  {
    if(typeof process=="object")
      if(process?.argv)
        filterString = filterString || process.argv[2] || "";

    console.log( anci.getdoc(false,filterString+"") );
  }
}

var help = Help ;
anci._absorb( help , "help" ) ;


function OpenErudaConsole(copyOneLineForPastingToAddressBar)
{
  if(copyOneLineForPastingToAddressBar)
  {
    anci.setcb(`avascript:(()=>  {    var script = document.createElement('script');	script.src='https://cdn.jsdelivr.net/npm/eruda';	document.body.appendChild(script);	script.onload = function () { eruda.init(); }  })();`);
    alert2("Paste to address bar and add j in the beginning, then choose the one with a blank globe icon rather than google icon!")
    return true;
  }

  return new Promise(resolve=>
  {
    var script = document.createElement('script');
	script.src="https://cdn.jsdelivr.net/npm/eruda";
	document.body.appendChild(script);
	script.onload = function () { eruda.init();resolve(); }
  });

}

anci._absorb( OpenErudaConsole , "eruda" ) ;


function ListObjectProperties(obj)
{
  let objO=obj;
  let listK={};
  while(obj!=null)
  {
    Object.getOwnPropertyNames(obj).forEach(i=>
    {
      listK[i]=1;
    });
    obj=obj.__proto__;
  }
  let ret=Object.keys(listK);
  let oname=objO.constructor && objO.constructor.name;
  if(oname=="Number" || oname=="Boolean")
    ret.unshift(objO);
  else if(oname=="String")
  {
    ret = ret.filter( i=> isNaN(i) );
    ret.unshift(objO.substr(0,1000));
  }
  else if(oname=="Array")
    ret.unshift(objO.slice(0,10).join(","));
  else if(oname=="Function" || oname=="AsyncFunction")
    ret.unshift(objO.toString().slice(0,1000))
  
  ret.unshift(oname || "No Constructor");
  return ret;
}

var objls = ListObjectProperties ;
anci._absorb( objls , "objls" ) ;


async function ObjectBrowser(rootObj)
{
    const eu=encodeURIComponent;
    const du=decodeURIComponent;
  
    if(!rootObj) return;

    let prt=(s)=>{
      let tind=s.lastIndexOf("][");
      if(tind!=-1)
        return s.substr(0,tind+1);
      else
        return "rootObj";
    };

    let children=anci.objls(rootObj);

    children = children.map(i=>(`<span data-path="rootObj[decodeURIComponent(`+"`"+eu(i)+"`"+`)]">${anci.ttoh(i)}</span>`));

    var reso=await anci.showlist("rootObj",children,true);
    
    if(!reso) return "";
    
    var res=$(reso.toString()).data("path");

    //console.log(res);

    var prop=null;
    prop=eval(res);

    if(prop!=null)
    {
      while(1)
      {

        let children=anci.objls(prop);
        children=children.map(i=>(`<span data-path="${res}[decodeURIComponent(`+"`"+eu(i)+"`"+`)]">${anci.ttoh(i)}</span>`));
        children.unshift(`<span data-path="${prt(res)}">上一層 Parent</span>`);

        reso=await anci.showlist(res,children,true);
        res=$(reso.toString()).data("path");
        if(!res) return;
        //console.log(res)
        prop=eval(res);

        if(prop==null)
          {
            res=prt(res);
            prop=eval(res);
          }
      }
    }
    else
      return anci.objbs(rootObj);
}  //  objbs

var objbs = ObjectBrowser ;
anci._absorb( objbs , "objbs" ) ;


function EnableObjectChaining()
{

anci.branched_obj=[]

let chainf=function(func,spread)
{
  if(typeof(func)=="function")
  {
    if(spread)
      return func(...this);
    else
      return func(this);
  }
  return this+func;
}

Object.defineProperty(Object.prototype,"c",{
  value:chainf,
  configurable:true,
  enumerable:false,
  writable:true
})



let branchf=function(func)
{
  anci.branched_obj.push(this);
  return this.c(func);
}

Object.defineProperty(Object.prototype,"b",{
  value:branchf,
  configurable:true,
  enumerable:false,
  writable:true
})


let mergef=function(func)
{
  var that=[...anci.branched_obj,this];
  anci.branched_obj=[];
  return this.c.call(that,func,true);
}

Object.defineProperty(Object.prototype,"m",{
  value:mergef,
  configurable:true,
  enumerable:false,
  writable:true
})


}  //  obj chaining on 

var objchainon = EnableObjectChaining ;
anci._absorb( objchainon , "objchainon" ) ;


function DisableObjectChaining()
{
  delete Object.prototype.c;
  delete Object.prototype.b;
  delete Object.prototype.m;

  anci.branched_obj=[]
}

var objchainoff = DisableObjectChaining ;
anci._absorb( objchainoff , "objchainoff" ) ;


async function EvaluateCommand(command_text)
{
  let t = ( command_text || "" ) + '' ;
  
  let temp_chain_is_on = ( !! Object.prototype.c ) ;
  
	if( ! temp_chain_is_on )
	    anci.objchainon();

  t=`(async ()=>{

	  try{

	    ${t}

	  }catch(e){
		  console.log(e);
	    alert2( "Error from client:" +hh +e +hh +e.stack );
	    return e.stack ;
	  }

      })()`;
      
  

  let ret = await eval(t);
  
  if( ! temp_chain_is_on )
      anci.objchainoff();
  
  return ret ;
}

anci.eval=EvaluateCommand;
anci._absorb( EvaluateCommand ) ;

// #endregion  }  Utilities


  // #region  {  GUI

function GetCssClasses(filterString)
{
  var classNames = new Set();

for (const sheet of document.styleSheets) {
  try {
    for (const rule of sheet.cssRules) {
      if (rule.selectorText) {
        const matches = rule.selectorText.match(/\.[\w-]+/g);
        if (matches) {
          matches.forEach(cls => classNames.add(cls.slice(1)));
        }
      }
    }
  } catch (e) {
    // 有些 stylesheet 可能是跨域的，會拋錯
  }
}

let arr=([...classNames]);

if(filterString)
  arr=arr.filter(i=>i.toLowerCase().includes(filterString.toLowerCase()));
  
return arr;
}  //  getcssc

anci._absorb( GetCssClasses , "getcssc" );

function FontAwesomeIcon(iconstr)
{
  if( (iconstr+"") != "show" )
  {
  iconstr=(iconstr || "r,folder-open")+'';
  let [t,n]=iconstr.split(",");
  return `<i class="fa${t} fa-${n}"></i>`;
  }
  else
  {
    let arr=anci.getcssc("fa-");
    arr=arr.map(i=>(  i.slice(3)+anci.faicon('r,'+i.slice(3))+" | "+
                                     anci.faicon('s,'+i.slice(3))+" | "+
                                     anci.faicon('b,'+i.slice(3))  ));
    arr.unshift("name, r, s, b");
    
    anci.showlist(arr,true);
  }
}

var faicon = FontAwesomeIcon ;
anci._absorb( faicon , "faicon" ) ;


function ShowProgress(msg)
{
  if(!window.progress_fullscreen)
  {
    $("body").append(anci._pgfs);
  }
    msg=(msg || "Loading... 載入中...")+"";
    ge("progress_fullscreen").innerHTML=msg;
    ge("progress_fullscreen").style.display="inline";
}

var showp = ShowProgress ;
anci._absorb( showp , "showp" ) ;


function HideProgress()
{
  if(window.progress_fullscreen)
    ge("progress_fullscreen").onclick();
}

var hidep = HideProgress ;
anci._absorb( hidep , "hidep" ) ;


async function ShowPopup(msg,delayMilliseconds)
{
  msg=(msg || "Hello 你好")+"";

  anci.ShowProgress(msg);

  await anci.Sleep(delayMilliseconds || msg.length * 300);

	anci.HideProgress();
}

var toast = ShowPopup ;
anci._absorb( toast , "toast" ) ;



async function Alert2(msg,textAsHtml,focus_ok=true)
{
  if(msg && (msg.constructor==Object || msg.constructor==Array))
    msg=JSON.stringify(msg,null,1);

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
          .attr("onclick",
  `$(this).remove();anci.alert2_resolves['${uniqueID}']?.();setTimeout(()=>{delete anci.alert2_resolves['${uniqueID}'];},2000);`);

  if(textAsHtml)
    dlg.html(msg);
  else
    dlg[0].innerText=(msg);

  dlg.append(`<div class="text-center">
                  <button onclick="event.stopPropagation();$(this).parent().parent()[0].scroll(0,0)">
                    ↑Top↑
                  </button>&nbsp;&nbsp;
                  <button onclick="anci.alert2_resolves['${uniqueID}']?.($(this).parent().parent().find('textarea').val());">
                    OK
                  </button>
              </div>`);

  $("body").append(dlg);

  if(focus_ok)
    dlg.find("button").last().focus();

  return await new Promise(resolve=>{
	  anci.alert2_resolves[uniqueID]=r=>resolve(r);
  });

}

var alert2 = Alert2 ;
anci._absorb( alert2 , "alert2" ) ;


async function AlertChain(msg)
{
  await alert2( msg );
  return msg ;
}

var alertc = AlertChain ;
anci._absorb( alertc , "alertc" ) ;


async function Prompt(msg,default_value,textAsHtml)
{
  msg=(msg || document.title)+"";
  return await alert2(`${textAsHtml?msg:anci.ttoh(msg)}<br><textarea style="width:100%;height:70%" onclick="event.stopPropagation();">${default_value || ""}</textarea>`,true,false)
}

var prompt = Prompt ;
anci._absorb( prompt , "prompt" ) ;


async function ShowUrlInIframe( url , showCrossOrigin)
{
  if( ! url ) return false;
  url+="";
  
  if( await anci.hasurl( url ) || url.startsWith('blob') || showCrossOrigin )
  {
  
    await alert2(`<iframe style="width:100%;height:85%;
          background-color:white;"
          src="${url}">
          </iframe>
          
          <div style="text-align:center;"><button onclick="event.stopPropagation();anci.openu(  $(this).parent().prev().attr('src')  )">
                    ${anci.faicon('s,external-link-alt')}
                    </button>${anci.faicon('s,link')}</div>
                    
          ` , true,false );
          
    return "Success: Opened" + hh + url;    
  
  }
}

var showu = ShowUrlInIframe ;
anci._absorb( showu , "showu" ) ;


async function ShowContentInIframe( content )
{
  if( ! content ) 
      return false;
  
  
    let ff=$(`<iframe style="width:100%;height:70vh;
          background-color:white;">
          </iframe>`);

    ff.attr("srcdoc",content+"");

    alert2(`<div class="class-for-appending-iframe"></div>`,true,false)

    $(".class-for-appending-iframe").append(ff);
    
    ff.after( `<div style="text-align:center;"><button onclick="event.stopPropagation();anci.showcn(  $(this).parent().prev().attr('srcdoc')  )">
                    ${anci.faicon('s,external-link-alt')}
                    </button> ${anci.faicon('s,file-alt')}</div>` )

    //await anci.sleep(1000);

    return ff[0].contentWindow;
  
}

var showc = ShowContentInIframe ;
anci._absorb( showc , "showc" ) ;


function createHtmlBlobUrl(htmlString) {
  const blob = new Blob([htmlString], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

async function ShowContentInNewWindow( content )
{
  if( ! content ) 
      return false;
  else
  {
    content+="";
    
    let burl = createHtmlBlobUrl( content ) ;
    
    return anci.openu( burl );
    
    /*
    var cwin = anci.openu("about:blank") ;
	  cwin.document.write(content);

    return cwin;
    */
  }
}

var showcn = ShowContentInNewWindow ;
anci._absorb( showcn , "showcn" ) ;


async function CreateListDialog(title_optional,list,listAsHtml,multi_select)
{
  if(!list || typeof(list)=='boolean')
  {
	  multi_select=listAsHtml;
	  listAsHtml=list;
	  list=title_optional;
	  title_optional=document.title;
  }

  if(typeof(list)=="string")
    {
      list=list.split(",");
    }

  if(!list) list=["無項目 No Items"];

  return (await new Promise(async (resolve)=>{

  var uniqueID=anci.rndtime();

  anci.showlist_resolves[uniqueID]=resolve;
  
  anci.multi_items=new Set;

  let result=await alert2(`
<h3 class="alert alert-success text-center">
  ${title_optional}
</h3>
<ul class="list-group">
  <li 
  class="list-group-item list-group-item-danger text-center" 
  onclick="anci.showlist_resolves['${uniqueID}']?.('');setTimeout(()=>{delete anci.showlist_resolves['${uniqueID}'];},2000);">
    取消Cancel &nbsp;&nbsp;
    
    <button onclick="event.stopPropagation();
    (async ()=>{
    let p = await prompt('Search for?(Leave blank to clear filtering) 請輸入篩選詞(留空清除篩選)');
    p = (p || '').toLowerCase();
    let i = $(this).parent().nextAll();
    if( !p ){ i.show(); return; }
    i.hide(); 
    i.filter((ind,ii)=>$(ii).text().trim()
                               .toLowerCase().includes(p)).show();
    })();">
  ${anci.faicon('s,search')}</button>
    
  ${!multi_select?"":`
  <textarea style="display:none;">"multi_items"</textarea>
  `}
  </li>`+
  list.map((i,ind)=>(`
  <li 
  class="list-group-item list-group-item-info"
  onclick="var res=new String(anci.b64d('${anci.b64e(i)}'));res.index=${ind};anci.showlist_resolves['${uniqueID}'](res);setTimeout(()=>{delete anci.showlist_resolves['${uniqueID}'];},2000);">
  ${
  !multi_select?"":`
  <input type="checkbox" 
  onclick="event.stopPropagation();" 
  onchange="let d=anci.b64d('${anci.b64e(i)}');this.checked?anci.multi_items.add(d):anci.multi_items.delete(d);">
  `
  }
    ${listAsHtml?i:anci.ttoh(i)}
  </li>
`)).join("\n")+
  `
</ul>`,true,false);

if(result==`"multi_items"`) 
    resolve([...anci.multi_items]);
else if(result)
    resolve(result);
else
	resolve("");

  })); //new Promise

}

var showlist = CreateListDialog ;
anci._absorb( showlist , "showlist" ) ;


function DoubleClick(single_click_handler,double_click_handler,button_this,event_obj)
{
  if(button_this.getAttribute("clicked_before"))
    {
      clearTimeout(button_this.getAttribute("clicked_before"))
      button_this.setAttribute("clicked_before","")
      double_click_handler(event_obj)
    }
  else
    {
	  var h=setTimeout(()=>{ single_click_handler(event_obj);button_this.setAttribute("clicked_before",""); },500);
      button_this.setAttribute("clicked_before",h)
    }
}

var dclick = DoubleClick ;
anci._absorb( dclick , "dclick" ) ;


  // #endregion  }  GUI


  // #region  {  String handling

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


function Base64ToBarr(str)
{
	str+="";

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

var b64arr = Base64ToBarr ;
anci._absorb( b64arr , "b64arr" ) ;


function BarrToBase64(str)
{
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

var arrb64 = BarrToBase64 ;
anci._absorb( arrb64 , "arrb64" ) ;


function Base64Encode(str="")
{
let e=new TextEncoder();
return anci.arrb64(e.encode(str+""));
}

var b64e = Base64Encode ;
anci._absorb( b64e , "b64e" ) ;


function Base64Decode(str="")
{
let d=new TextDecoder();
return d.decode(new Uint8Array(anci.b64arr(str+"")));
}

var b64d = Base64Decode ;
anci._absorb( b64d , "b64d" ) ;


//  Text <-> Html


function TextToHtml(text="")
{
  var cvt=$("<div>")
  cvt[0].innerText=text+""
  return cvt.html()
}

var ttoh = TextToHtml ;
anci._absorb( ttoh , "ttoh" ) ;


function HtmlToText(html="")
{
  html+='';
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

var htot = HtmlToText ;
anci._absorb( htot , "htot" ) ;


  // #endregion  }  String handling


  // #region  {  Time handling


function Sleep(milliSeconds)
{
    if(isNaN(milliSeconds))
      milliSeconds=100;
    else
      milliSeconds-=0;

  return new Promise(resolve=>{
    setTimeout(resolve,milliSeconds);
	});
}

var sleep = Sleep ;
anci._absorb( sleep , "sleep" ) ;


async function WaitForValue(obj,key,value,milliSeconds)
{
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

var waitv = WaitForValue ;
anci._absorb( waitv , "waitv" ) ;


function RandomTimestamp(digits_of_rnd=2)
{
  if( isNaN(digits_of_rnd) ) digits_of_rnd=2;
  var min = "1".repeat(digits_of_rnd)-0;
  var max = "9".repeat(digits_of_rnd)-0;
  
  var rnd=Math.floor(Math.random() * (max - min) + min)
  return rnd+""+Date.now();
}

var rndtime = RandomTimestamp ;
anci._absorb( rndtime , "rndtime" ) ;


function Timer(action_function,interval_msec)
{
  this.action=action_function;
  this.interval=interval_msec;
  
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

var timer = Timer ;
anci._absorb( timer , "timer" ) ;


  // #endregion  }  Time handling


// #endregion  }  Common libraries


anci.GenerateNameForCapitalFunctions=()=>{
  for(let i of Object.keys(anci))
  {
    if(anci[i] && typeof anci[i]=="function" && (i+"").toLowerCase()!=i) 
      anci[i].Name=i;
      
    if(anci[i] && typeof anci[i]=="function")
    {
      anci[i].copy=()=>anci.setcb(anci[i].toString())
      anci[i].show=()=>alert2(anci[i].toString())
    } 
  }
}


//  Execution part 立即執行的部分 可能會污染全局

// #region  {  Immediate Execution

anci.GenerateNameForCapitalFunctions();

globalThis.anci=anci;  //  will change to export in the future 

//console.log("anci ready");

if( InBrowser )  //  in a browser environment 
{  
  globalThis.alert2 = alert2;
  globalThis.prompt2 = anci.Prompt;


  anci.query = anci.parseurlp(location.href);

  anci.passwd = anci.passwd || anci.query.passwd || '' ;

  if(location.pathname.endsWith("/main.app"))
    anci.platform = "web";
  else if(location.pathname.startsWith("/android_asset/") ||
          location.pathname.startsWith("/storage/emulated/"))
    anci.platform = "android";

    anci.platform = anci.query.platform || anci.platform || "web";
    
  //  Ensure jQuery and progress dialog and file upload control
  if(typeof(jQuery)!="function")
  {
    try{
    (function () { try{var script = document.createElement('script'); script.src="https://code.jquery.com/jquery-3.7.1.min.js"; script.integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="; script.crossOrigin="anonymous"; document.documentElement.appendChild(script);}catch(e){alert(e.stack)} })()
    }catch(e){alert(e.stack)}
  }
  anci._bfsd=`<input id="browser_file_select_dialog" type="file" style="position: absolute; top: -100em">`;
  anci._pgfs=`<div id="progress_fullscreen" style="padding:50px 10px 50px 10px;text-align:center;position:fixed;left:20%;top:15%;width:60%;display:none;z-index:100;background-color:#333333;color:white;border-radius:20px;font-size:24px;" onclick="this.style.display='none';"></div>`;


//  wait for jquery and body and trigger onload 
(async ()=>{
  await anci.waitv(document,'body');
  await anci.waitv(window,'jQuery');

  if(window.theme_from_app_entry && !location.pathname.endsWith("/main.app"))
  {
    await anci.waitv(anci,"ui_resolve");
    await anci.ui_resolve;
  }

  if(typeof(OnStop)=="function")
    window.onbeforeunload=OnStop;
  
  if(  typeof(OnLoad) == "function"  )
    await OnLoad();
  if(  typeof(OnData) == "function"  )
    await OnData(true);

  if(anci.platform=="android")
  {
    await anci.SetOrientation(anci.DroidOrientation || "Default");
    anci.AppVersion = (await anci.ver) || 0.87;
  }
  
})();  //  await for jQuery and body


}  //  in a browser environment 
else  //  in a nodejs runtime
{
  InNodeRuntime = true ;
}

// #endregion  }  Immediate Execution










// #region  {  Electron / NodeJS client part



anci.nodeapi=(data,synchronized, justTestRemote)=>{  

  if(!data)
    return false;

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
  
  var dobj;

  if(url=="local")
  {
    var localorp="/storage_local"
    
    if( justTestRemote )
        return false;

    if(typeof data=="object")
      data=JSON.stringify(data);
  }
  else
  {
    //  default: operationing under /main.app
    var localorp="/storage_proxy";

    try{
    
    if(typeof data=="string")
      dobj = JSON.parse(data || "{}");
    else
      dobj = data;

    dobj.url=[];
    if(url.startsWith("["))
      dobj.url.push(...JSON.parse(url));
    else
      dobj.url.push(url);
	
    if(!location.pathname.endsWith("/main.app"))  //  no /storage_proxy available
    {  
      localorp = dobj.url.shift() ;
      if(anci.passwd)
        localorp += "?passwd="+anci.passwd;
    }

    data=JSON.stringify(dobj);

    }catch(e){ return e.stack; }

  }  //  url not local 

if( justTestRemote )
{
  if( localorp=="/storage_proxy" )
  {
    if( isSameOriginStrict( dobj?.url?.[0] , location.href ) )
      return false ; 
    else
      return dobj?.url?.[0] ;
  }
  else if( isSameOriginStrict( localorp , location.href ) )
  {
    return false ;
  }
  else
    return localorp;
}

if(!synchronized || synchronized=="pm")
{
  return new Promise(resolve=>{
    xhr.onreadystatechange = function()
    {
      if ((xhr.readyState == 4 && xhr.status == 200))
        resolve(xhr.responseText);
    };

    xhr.open("POST", localorp, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(data);

  });
}
else  //  synchronized xhr not recommended
{
  xhr.open("POST", localorp, false);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(data);
  
  return (xhr.responseText);
}

}  //  nodeapi ends


/*
if(anci.platform == "web" || 
   anci.platform == "electron" || InNodeRuntime)*/
//  if platform is web or electron


  nodeapi=anci.nodeapi;


{ //  File system operations


anci.BrowserDownloadFile=(b64_or_arr,file_name="downloaded.txt")=>
{
  if(typeof(b64_or_arr)=="string" || b64_or_arr?.[0]?.length>0)
    var barr=new Uint8Array(anci.b64arr(b64_or_arr+""));
  else
    var barr=new Uint8Array(b64_or_arr);

  var blob=new Blob([barr],{type:"application/octet-stream"});
  saveAs(blob,file_name);
}

anci.bdlf=anci.BrowserDownloadFile;


}  //  File system operations End


anci.GetClipboardText=async function()
{
var s=await navigator.clipboard.readText();
return s;
};

anci.getcb=anci.GetClipboardText;

Object.defineProperty(anci,"cb",{set:anci.setcb,get:anci.getcb,configurable:true});


anci.GetAppPath=async function(onlyName)
{
    var s = location.pathname
                .split("/").at(-2) || "";

    var tmps="/sdcard/napps/";
   
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

Object.defineProperty(anci,"appp",{get:anci.getappp,configurable:true});
Object.defineProperty(anci,"appn",{get:anci.getappn,configurable:true});
Object.defineProperty(anci,"ver",{get:anci.getv,configurable:true});


function OpenUrl(url)
{
  url = ( url || "" ) + "";
	if(anci.platform == "electron")
	{
	  let upmost=window;
	  while(upmost.opener!=null)
		upmost=upmost.opener;
	  return upmost.open(url);
	}
	else
	  return window.open(url);
    
}

var openu=OpenUrl;
anci._absorb( openu , "openu" );



function TextToSpeech( rtext, rpitch, rrate )
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
}

var tts = TextToSpeech ; 
anci._absorb( tts , 'tts' ) ;



anci.GenerateNameForCapitalFunctions();


//  if platform is web or electron End


// #endregion  }  Electron / NodeJS client part










// #region  {  Android DroidScript part



anci.dsapi=(sobj)=>
{
    if( !anci.sobj ) anci.sobj = {} ;    

    if(typeof sobj=="string")
    {
      try{sobj=JSON.parse(sobj);}
      catch(e){ return (e.stack); }
    }

    sobj.func = anci.rndtime() ;
    anci.sobj[ sobj.func ] = sobj ;

    return new Promise(resolve=>{
      anci.droidscript_resolves[sobj.func]=resolve;
      console.log( anci.passwd+"|"+sobj.func ) ;
    });
};  //  dsapi



  // #region  {  Network 


anci.GetUrlDate=(url)=>{
  url = ( url || "" ) + "";
return new Promise(resolve=>{
$.ajax({
  url,
  type: 'HEAD', // 不下載內容，只取 headers
  dataType:'text',
  success: function(data, status, xhr) {
    let lm = xhr.getResponseHeader('Last-Modified');
    
    if(!lm)
    {
      resolve("No mtime data in headers");
      return;
    }
    let d=new Date(lm);
    resolve(d);
  },
  error:e=>resolve("Failed to request")
});
});
};

anci.urlmtime=anci.GetUrlDate ;


anci.GetUrlSize=(url)=>{
  url = ( url || "" ) + "";
return new Promise(resolve=>{
$.ajax({
  url,
  type: 'HEAD', // 不下載內容，只取 headers
  dataType:'text',
  success: function(data, status, xhr) {
    let ctl = xhr.getResponseHeader('Content-Length');
    
    if(!ctl)
    {
      resolve("No size data in headers");
      return;
    }
    resolve(ctl);
  },
  error:e=>resolve("Failed to request")
});
});
};


anci.urlsize=anci.GetUrlSize ;


  // #endregion  }  Network


if(anci.platform == "android" || InNodeRuntime)
{  //  if platform is DroidScript


  nodeapi=anci.dsapi;


  // #region  {  ds File system operations


let BrowserDownloadFile=async function(b64_or_arr,file_name="downloaded.txt")
    {
      if(typeof(b64_or_arr)=="string" || b64_or_arr?.[0]?.length>0)
        var barr = Array
                          .from(anci.b64arr(b64_or_arr+""));
      else
        var barr = Array.from(b64_or_arr);
      
      if( file_name.lastIndexOf(".") == -1 )
          file_name+='.txt';

      while(await anci.hasf('/sdcard/Download/'+
                                            file_name)      )
      {
        let pos = file_name.lastIndexOf(".");
        file_name=file_name.substr(0,pos)+"_1"+
                            file_name.substr(pos)
      }
      let fullp='/sdcard/Download/'+
                                            file_name;

      return await anci.wfb(fullp,barr);
    }

anci._absorb( BrowserDownloadFile , "bdlf" ) ;


var openf = async function OpenFile(filepath, mime,
                                                                         forceSystemOpen)
{
  if( ! filepath )
    return false;
    
  filepath += '';

  if( filepath.startsWith("http") || filepath.startsWith("data:") || filepath.startsWith("content"))
    var rfilepath=filepath;
  else
  {
    var rfilepath = await anci.realp( filepath ) ;
    
    let rmurl = anci.isremote() ;
    if( ! rmurl )
      rfilepath = location.origin + rfilepath ;
    else
      rfilepath = new URL( rmurl ).origin + rfilepath ;
  }

  if(await anci.hasurl(rfilepath) && !forceSystemOpen)
  {
      return await anci.showu( rfilepath );
  }
  else if( await anci.hasf(rfilepath) && !forceSystemOpen )
  {
    return await anci.OpenFileBrowser(rfilepath,null,true);
  }
  else 
  {
    var sobj={"cmd":"OpenFile",
                "param":[filepath+'',mime+''] };

    //await anci.sleep(1000);
  
    return nodeapi(sobj);

  }
}  //  anci.OpenFile

anci._absorb( openf , "openf" ) ;


anci.UpdateAnci=async function(){
  let res=await anci.showlist( "Which one to update?", 
                  [ "main(droidscript_main.js -> DroidScript/app_name/app_name.js)" ,
                     "anci(anci.js -> DroidScript/app_name/nlib/anci.js)"  ] );
  res+="";
  
  let pkn = await anci.getpkn();
  let a = await anci.appn ; 
  
  if( res.startsWith("main") )
  {
    if( pkn == "com.smartphoneremote.androidscriptfree" )
    {
      
      //  Update/更新  droidscript_main.js
      anci.bulf().then(anci.b64arr)
        .then(JSON.stringify).then(r=>{
            anci.evalserver(`
          
              let barr=${r};
              writeallbytes( '/sdcard/DroidScript/${a}/${a}.js',barr);

            `);
        });
    }  //  if is not apk, developing inside DroidScript
    else
    {
      alert2( "Cannot update main in APK!" );
    }
    
  }
  else
  {
    if( pkn == "com.smartphoneremote.androidscriptfree" )
    {
        //  更新anci.js
  anci.bulf().then(anci.b64arr)
    .then(JSON.stringify).then(r=>{
    anci.evalserver(`
        let barr=${r};
        writeallbytes( '/sdcard/DroidScript/${a}/nlib/anci.js',barr);

    `);
    });
    
    }  //  if is not apk, developing inside DroidScript
    else
    {
      await alert2( "In APK will update /bin/../../nlib/anci.js and /media/nlib/anci.js" )
      
      let brp=await anci.realp('/bin');
      brp=brp.replace("files/sdcard/napps", "files/nlib/anci.js")
      
      let b64 = await anci.bulf() ;
      alert2( await anci.wf( brp, b64, "base64" ) );
      alert2( await anci.wf( '/media/nlib/anci.js' , b64, "base64") );
    }
  }  //  else selected update anci.js
  

}  //  anci.UpdateAnci

anci.update=anci.UpdateAnci ;


  // #endregion  }  ds File system operations


    // #region  {  batching simple functions


anci.GetByFunctionName=function(funcName,param)
{
  var sobj={"cmd": funcName,param};
  return nodeapi(sobj);
};

let fnarr=["GetClipboardText",
           "SetOrientation",
		   "GetAppPath",
		   "GetAppName",
		   "GetVersion",
		   "OpenUrl",
		   
		   "PreventScreenLock",
		   "SetSharedApp",
		   "GetSharedText",
		   "GetSharedFiles",
		   "DisableKeys", "GetConsoleMessages",
	           "Exit",
	           "GetPackageName" ];
	           
for(let i of fnarr)
{
	let func=(...param)=>anci.GetByFunctionName(i,param);
	func.Name = i ;
	anci._absorb( func );
}
	

anci.OpenUrlDs=anci.OpenUrl;

anci.OpenUrl=url=>
{
  if( ! url ) return false;
  url+="";
  
  if( url.startsWith('http') )
    anci.OpenUrlDs( url )
  else
    location.href=( url );
}

	
anci.getcb=anci.GetClipboardText;
anci.seto=anci.SetOrientation;
anci.getappp=anci.GetAppPath;
anci.getappn=anci.GetAppName;
anci.getv=anci.GetVersion;
anci.openu=anci.OpenUrl;

anci.wakelock=anci.PreventScreenLock;
anci.getsharedt=anci.GetSharedText;
anci.getsharedf=anci.GetSharedFiles;
anci.disablekeys=anci.DisableKeys;

anci.getcslm=anci.GetConsoleMessages;

anci.exit=anci.Exit;

anci.getpkn=anci.GetPackageName;


Object.defineProperty(anci,"cb",{set:anci.setcb,get:anci.getcb,configurable:true});
Object.defineProperty(anci,"appp",{get:anci.getappp,configurable:true});
Object.defineProperty(anci,"appn",{get:anci.getappn,configurable:true});
Object.defineProperty(anci,"ver",{get:anci.getv,configurable:true});


    // #endregion  }  batching simple functions End


anci.SetOnKey_callbacks=[];

anci.SetOnKey=(callback)=>
{
  if(anci.SetOnKey_callbacks.length==0)
  {
    var sobj={"cmd": "SetOnKey"};
    nodeapi(sobj);
  }
  anci.SetOnKey_callbacks.push(callback);
}

anci.onkey=anci.SetOnKey;

anci.SetOnKey_callback=(...arr)=>
{
  for(let i of anci.SetOnKey_callbacks)
  {
    if(typeof(i) == "function") i(...arr); 
  }
}
 
 
var tts = function TextToSpeech(text, pitch, rate, stream, locale, engine)
{
  pitch=pitch || 1; rate=rate || 1;
  text+='';
  
  var sobj={"cmd":"app.TextToSpeech",text,pitch,rate,stream,locale,engine};
  return nodeapi(sobj);
};

anci._absorb( tts , "tts" );


anci.GenerateNameForCapitalFunctions();


}  //  if platform is DroidScript End

// #endregion  }  Android DroidScript part










//  in a node runtime, immediately show functions list
if( InNodeRuntime )  
  anci.help();


//  Starts writing descriptions of all functions
try{

  anci.dlf.Desc="Uses fetch to download url to Server folder";
  anci.dlf.Test=` return await anci.dlf( 'https://api.github.com/',
                                      '/media/gg.html' ); `
  
  anci.xhr.Desc="Uses fetch to get url content" ;
  anci.xhr.Test="return await anci.xhr`https://api.github.com` "
  
  anci.xhrt.Desc="Uses jQuery.ajax to get text, CORS+ for web"
  anci.xhrt.Test=`return await anci.xhrt('Code.js');`
  
  anci.hasurl.Desc="Uses jQuery.ajax to check for head, abide by CORS"
  anci.hasurl.Test="return await anci.hasurl('Code.js');"
  
  anci.rfb.Test=`return await anci.rfb('/sd/Download/test.txt')`
  
  anci.wfb.Test=` return await anci.wfb('/sd/Download/test.txt',[ 0x48, 0x49, 240, 159, 152, 128, 10, 228, 184, 150, 231, 149, 140 ] ); `;
  
  anci.rf.Test=" return await anci.rf`/sd/Download/test.txt` "
  
  anci.rm.Test=" return await anci.rm`/media/gg.html` "

  anci.filesize.Test=" return await anci.filesize`/sd/Download/test.txt` "
  
  anci.filemtime.Test=" return await anci.filemtime`/sd/Download/test.txt` "
  
  anci.urlmtime.Test=" return await anci.urlmtime('Code.js') "

  anci.realp.Test="return await anci.realp('/bin');";

  anci.lsr.Test=" return await anci.lsr`/bin` ";

  anci.stat.Test=
            " return await anci.stat`/bin/notepad/Code.js` " ;
  
  anci.setcb.Test=" return await anci.setcb('hello你好'); ";
  
  anci.getcb.Test=" return await anci.getcb() ";
  
  
  anci.objbs.Test=" anci.objbs(anci); " ;
  
  anci.getcssc.Test=" return await anci.getcssc(); "
  
  anci.faicon.Desc="Get font-awesome icons; e.g. 's,search', use 'show' to show available icons";
  
  anci.faicon.Test=" anci.faicon`show` " ;
  
  anci.toast.Desc="Show a popup msg that will auto disappear";
  anci.toast.Test=" anci.toast`hello🐬` ";
  
  anci.b64e.Test=" return anci.b64e('hi') "
  anci.b64d.Test=" return anci.b64d('aGk=') "
  
  anci.rndtime.Test=" return anci.rndtime() "
  
  anci.bdlf.Test=" return await anci.bdlf( [111, 107, 240, 159, 166, 156 ] ) ";
  
  anci.openu.Test=" anci.openu('https://github.com') "
  
  anci.tts.Test=" return await anci.tts('Hi I am John') "
  
  anci.getappn.Test = " return await anci.appn ";
  
  anci.isremote.Test= "return anci.isremote()" ;
  
  
  //  Below is android specific Desc & Test 以下為安卓專用
  
  anci.getcslm.Test=" return await anci.getcslm() ";
  
  anci.getsharedt.Test = " return await anci.getsharedt() " ;
  
  anci.getpkn.Test=" return await anci.getpkn() ";
  
  anci.seto.Desc=` Available values: 
        Default,Portrait,Landscape,
        ReversePortrait,ReverseLandscape, 
        or use number 0~4 `;
  

}catch(e){
  console.log(e.stack);
}









