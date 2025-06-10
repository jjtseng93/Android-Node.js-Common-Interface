









let anci={droidscript_resolves:{},alert2_resolves:{},showlist_resolves:{}};

let ge=(elementID)=>document.getElementById(elementID);
let hh="\r\n";
let jss=JSON.stringify;
let jsp=JSON.parse;
let csl = s=>console.log(s);

let alert2;

let nodeapi;

{  //  Default Parameters
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
}

{  //  Node API

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

  return nodeapi( sobj ) ;
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

};

anci.xhr=anci.HttpRequest;

anci.CheckUrlExistence=(url)=>{
  return new Promise(resolve=>{

  $.ajax( { url:url+"" , type:"HEAD", dataType:"text",
    success:()=>resolve(true), error:()=>resolve(false)});

  });
}

anci.hasurl=anci.CheckUrlExistence;


}  //  Network End


{ //  File system operations

anci.BrowserUploadFile = async (overwrite, download_path="/sdcard/Download")=>
{
    if( download_path.slice(-1) != "/" )
        download_path += "/" ;
    const dlp = download_path ;

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
        if( ! await anci.hasd( download_path ) )
          return "Failed: No such folder" ;

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

anci.bulf=anci.BrowserUploadFile;

anci.ReadFileInBytes=function(filePath)
{
  var sobj={"cmd":"app.ReadFileInBytes",
                "path": (filePath || "")+"",
           };

  return nodeapi( sobj ) ;
};
	
anci.rfb=anci.ReadFileInBytes;

anci.WriteFileInBytes=function(filePath,byteArray)
{
  if(!byteArray) return "Write file error: No contents specified";

  var sobj={"cmd":"app.WriteFileInBytes",
                "path":filePath,
                byteArray };

  return nodeapi( sobj ) ;
};

anci.wfb=anci.WriteFileInBytes;

anci.ReadFile=function(filePath,textEncoding)
{
	textEncoding=textEncoding || "utf8";

    var sobj={"cmd":"app.ReadFile",
                "path":filePath+'',
                "encoding":textEncoding };

    return nodeapi( sobj ) ;
};

anci.rf=anci.ReadFile;

anci.WriteFile=function(filePath,textToWrite,textEncoding)
{
  if(textToWrite==null) return "Write file error: No contents specified";
  textEncoding=textEncoding || "utf8";

  var sobj={"cmd":"app.WriteFile",
                "path":filePath,
                "text":textToWrite+"",
                "encoding":textEncoding };
  return nodeapi( sobj ) ;
};

anci.wf=anci.WriteFile;

anci.MakeFolder=function(folderPath)
{
  var sobj={"cmd":"app.MakeFolder",
                "path":folderPath+'' };
  return nodeapi( sobj ) ;
};

anci.mkdir=anci.MakeFolder;

anci.DeleteFile=function(filePath)
{
  var sobj={"cmd":"app.DeleteFile",
                "path":filePath+'' };
  return nodeapi( sobj ) ;
};

anci.rm=anci.DeleteFile;

anci.DeleteFolder=function(folderPath)
{
  var sobj={"cmd":"app.DeleteFolder",
                "path":folderPath+'' };
  return nodeapi( sobj ) ;
};

anci.rmdir=anci.DeleteFolder;

anci.RealPath=function(filepath)
{
  var sobj={"cmd":"RealPath",
                "param":[filepath+''] };
  return nodeapi( sobj ) ;
};

anci.realp=anci.RealPath;

anci.RenameFile=function(oldPath,newPath,overwrite,isFolder)
{
  var sobj={"cmd": (isFolder?"app.RenameFolder":"app.RenameFile"),
                "path":oldPath,
                "npath":newPath,
                overwrite };
  return nodeapi( sobj ) ;
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
  return nodeapi( sobj ) ;
};

anci.cp=anci.CopyFile;

anci.CopyFolder=(sourcePath,destinationPath,overwrite)=>anci.CopyFile(sourcePath,destinationPath,overwrite,true);

anci.cpd=anci.CopyFolder;

anci.FileExists=async (filePath,isFolder)=>
{
  var sobj={"cmd":(isFolder?"app.FolderExists":"app.FileExists"),
                "path":filePath+''  };

  var res=await nodeapi( sobj ) ;

  if(res=="1")
    return true;

  return false;

};

anci.hasf=anci.FileExists;

anci.FolderExists=(folderPath)=>anci.FileExists(folderPath,true);

anci.hasd=anci.FolderExists;

anci.ListFolder=async (folderPath,recursive)=>
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

anci.ls=anci.ListFolder;

anci.ListFolderRecursive=(folderPath)=>anci.ls(folderPath,true);
anci.lsr=anci.ListFolderRecursive;


anci.GetFileState=async function(filePath)
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
  
};

anci.stat=anci.GetFileState;

anci.ChooseFile=async (default_folders,multi_select)=>
{

var deflist=["/sdcard", "/home", "/bin", "/media"];
deflist.unshift("<<手動輸入... Manually enter...>>");

if(platform=="android") 
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

if(platform=="android" && selected_file=="Use System Dialog")  
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

anci.selectf=anci.ChooseFile;

anci.GetFileDate=async (filePath)=>
  {  
    let mtimeMs=(await anci.GetFileState(filePath+'')).mtimeMs-0;
    //alert(mtimeMs);
    return new Date(mtimeMs.toFixed()-0);  
  };

anci.filemtime=anci.GetFileDate;

anci.GetFileSize=async (filePath="")=>
  {  
    filePath+="";
    
    if( filePath.startsWith('content:') )
    {
      return await anci.urlsize( filePath );
    }
    
    let fsize=(await anci.GetFileState(filePath)).size-0;
    return fsize;  
  };

anci.filesize=anci.GetFileSize;


}  //  File system operations End

anci.EvalServer=function(command_to_evaluate)
{
  var sobj={"cmd":"EvalServer",
                "param":[command_to_evaluate+""] };
  return nodeapi( sobj ) ;
};
  
anci.evalserver=anci.EvalServer;

anci.SetClipboardText=async function(txt)
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

};

anci.setcb=anci.SetClipboardText;

anci.GetDisplayWidth=function()
 {
 return window.innerWidth;
 };

anci.GetDisplayHeight=function()
 {
 return window.innerHeight;
 };


}  //  Node API End









{  //  Common libraries

anci.ParseUrlParam = (url)=>
{
  url+='';
  let i=url.lastIndexOf('?');
  if(i==-1) return {};
  url=url.substr(i+1);
  let qarr=url.split("&")
              .map(  ii=>( ii.split("=").map(iii=>decodeURIComponent(iii)) )  );

  return Object.fromEntries(qarr);
}

anci.parseurlp = anci.ParseUrlParam;
  

anci.GenerateUrlParam = (param={})=>
{
  return Object.keys(param).map(i=>{
    return encodeURIComponent(i)+'='+encodeURIComponent(param[i]);
  }).join('&');
}

anci.genurlp=anci.GenerateUrlParam;

anci.GetDocumentation=(outputHTML,filterString)=>
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

      let ohtml=`
  <details onclick="event.stopPropagation();">
    <summary>${tarr[0]}</summary>
    ${tarr[1]||""}
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

anci.getdoc=anci.GetDocumentation;

Object.defineProperty(anci,"doc",{get:anci.getdoc});

anci.GetDocumentationAbbreviation=(limitLength=25)=>
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

anci.getdoca=anci.GetDocumentationAbbreviation;

Object.defineProperty(anci,"doca",{get:anci.getdoca});

anci.help=(filterString="")=>{
  if(globalThis.window == globalThis)
  {
    anci.showlist( anci.getdoc(true,filterString+"") , true );
  }
  else 
  {
    if(typeof process=="object")
      if(process?.argv)
        filterString = filterString || process.argv[2] || "";

    console.log( anci.getdoc(false,filterString+"") );
  }
}

anci.help.Name="Help";

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

anci.objls=anci.ListObjectProperties;

anci.ObjectBrowser=async function(rootObj)
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

    children=children.map(i=>(`<span data-path="rootObj[decodeURIComponent(`+"`"+eu(i)+"`"+`)]">${anci.ttoh(i)}</span>`));

    var reso=await anci.showlist("rootObj",children,true);
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
      return objBrowser(rootObj);
}

anci.objbs=anci.ObjectBrowser;

anci.EnableObjectChaining=()=>
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


}

anci.objchainon=anci.EnableObjectChaining;

anci.DisableObjectChaining=()=>
{
delete Object.prototype.c;
delete Object.prototype.b;
delete Object.prototype.m;

anci.branched_obj=[]
}

anci.objchainoff=anci.DisableObjectChaining;

anci.EvaluateCommand=(command_text)=>
{
  let t=command_text+'';

  t=`(async ()=>{

	  try{

	    let temp_chain_status=(!!Object.prototype.c);
	    !temp_chain_status && anci.objchainon();
	    //var csl=console.log,jss=JSON.stringify,jsp=JSON.parse;

	    ${t}

	    !temp_chain_status && anci.objchainoff();


	  }catch(e){
		console.log(e);
	    alert2("Error from client:\\r\\n"+e+"\\r\\n"+e.stack,null,true);
	  }

      })()`;

  eval(t);


}

anci.eval=anci.EvaluateCommand;

{  //  GUI

anci.FontAwesomeIcon=(iconstr)=>
{
  iconstr=(iconstr || "r,folder-open")+'';
  let [t,n]=iconstr.split(",");
  return `<i class="fa${t} fa-${n}"></i>`;
}

anci.faicon=anci.FontAwesomeIcon;

anci.ShowProgress=function(msg)
{
  if(!window.progress_fullscreen)
  {
    $("body").append(anci._pgfs);
  }
    msg=(msg || "Loading... 載入中...")+"";
    ge("progress_fullscreen").innerHTML=msg;
    ge("progress_fullscreen").style.display="inline";
};

anci.showp=anci.ShowProgress;

anci.HideProgress=function()
{
  if(window.progress_fullscreen)
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



alert2=async (msg,textAsHtml,focus_ok=true)=>{
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
          .attr("onclick",`$(this).remove();anci.alert2_resolves['${uniqueID}']?.();setTimeout(()=>{delete anci.alert2_resolves['${uniqueID}'];},2000);`);

  if(textAsHtml)
    dlg.html(msg);
  else
    dlg[0].innerText=(msg);

  dlg.append(`<div class="text-center"><button onclick="anci.alert2_resolves['${uniqueID}']?.($(this).parent().parent().find('textarea').val());">OK</button></div>`);

  $("body").append(dlg);

  if(focus_ok)
    dlg.find("button").last().focus();

  return await new Promise(resolve=>{
	  anci.alert2_resolves[uniqueID]=r=>resolve(r);
  });

};

anci.alert2=alert2;
alert2.Name="Alert2";

anci.Prompt=async (msg,default_value,textAsHtml)=>
{
  msg=(msg || document.title)+"";
  return await alert2(`${textAsHtml?msg:anci.ttoh(msg)}<br><textarea style="width:100%;height:70%" onclick="event.stopPropagation();">${default_value || ""}</textarea>`,true,false)
}

anci.prompt=anci.Prompt;


anci.showlist=async (title_optional,list,listAsHtml,multi_select)=>{
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
    取消Cancel
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
};

anci.showlist.Name="ShowList";

anci.CreateListDialog=anci.showlist;

anci.DoubleClick=(single_click_handler,double_click_handler,button_this,event_obj)=>
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

anci.dclick=anci.DoubleClick;

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

anci.Base64Encode=(str="")=>{
let e=new TextEncoder();
return anci.arrb64(e.encode(str+""));
}

anci.b64e=anci.Base64Encode;

anci.Base64Decode=(str="")=>{
let d=new TextDecoder();
return d.decode(new Uint8Array(anci.b64arr(str+"")));
}

anci.b64d=anci.Base64Decode;

//  Text <-> Html

anci.TextToHtml=(text="")=>
{
  var cvt=$("<div>")
  cvt[0].innerText=text+""
  return cvt.html()
}

anci.ttoh=anci.TextToHtml;

anci.HtmlToText=(html="")=>
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

anci.htot=anci.HtmlToText;

}  //  String handling End

{  //  Time handling

anci.Sleep=(milliSeconds)=>
{
    if(isNaN(milliSeconds))
      milliSeconds=100;
    else
      milliSeconds-=0;

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

anci.SaveValue = async (...i)=>
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
    };
anci.savev=anci.SaveValue;

anci.LoadValue = async (optional_key_name,
                             optional_defvalue,
                             optional_database_file)=>
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
    };
anci.loadv=anci.LoadValue;

anci.RandomTimestamp=(digits_of_rnd=2)=>
{
  if( isNaN(digits_of_rnd) ) digits_of_rnd=2;
  var min = "1".repeat(digits_of_rnd)-0;
  var max = "9".repeat(digits_of_rnd)-0;
  
  var rnd=Math.floor(Math.random() * (max - min) + min)
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

anci.timer=anci.Timer;

}  //  Time handling End



}  //  Common libraries End




//  Execution part 立即執行的部分 可能會污染全局

for(let i of Object.keys(anci))
  {
    if(anci[i] && typeof anci[i]=="function" && (i+"").toLowerCase()!=i) 
      anci[i].Name=i;
  }

globalThis.anci=anci;  //  will change to export in the future 

//console.log("anci ready");

if(globalThis.window == globalThis)  //  in a browser environment 
{  
  globalThis.alert2=alert2;
  globalThis.prompt2 = globalThis.prompt;
  globalThis.prompt = anci.Prompt;


  anci.query = anci.parseurlp(location.href);

  window.passwd = window.passwd || anci.query.passwd || '' ;

  if(location.pathname.endsWith("/main.app"))
    window.platform = "web";
  else
    window.platform = window.platform || anci.query.platform || "android";
    
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

  if(window.platform=="android")
  {
    await anci.SetOrientation(anci.DroidOrientation || "Default");
    anci.AppVersion = (await anci.ver) || 0.87;
  }
  
})();  //  await for jQuery and body


}  //  in a browser environment 
else  //  in a nodejs runtime
{
  anci.help();
}


{  //  Android DroidScript part

if(globalThis.platform == "android")
{  //  if platform matches


{  //  Node API

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
      console.log( window.passwd+"|"+sobj.func ) ;
    });
};

nodeapi=anci.dsapi;

{  //  Network 


anci.RunRemoteApp=async (url,param={})=>
{
  url+='';
  param='&'+Object.keys(param).map(i=>{
    return encodeURIComponent(i)+'='+encodeURIComponent(param[i]);
  }).join('&');
  let pk=await anci.GetPackageName();
  
  if(!url.match(/[\\\/]/g))
  {
    let rp='';
    if( await anci.hasd( rp = '/bin/'+url) )
      url=await anci.RealPath(rp+'/{app_entry}.html');
    else if( await anci.hasd( rp = '/sd/Android/media/'+pk+'/napps/'+url ) )
      url=await anci.RealPath(rp+'/{app_entry}.html');
  }

  
  if(!confirm("Will now open other APP(inherits permissions) 將開啟其他APP(將繼承權限):\r\n"+url+'?passwd=...'+param))
    return false;

  location.href=(url+`?passwd=${window.passwd+param}`);
  return true;
}

anci.remoteapp=anci.RunRemoteApp;


anci.HttpRequestInBytes = (url)=>{
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
};

anci.xhrb=anci.HttpRequestInBytes;

anci.HttpRequestXhr=(url)=>{
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
};

anci.xhrt=anci.HttpRequestXhr ;

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


}  //  Network End


{ //  File system operations


anci.BrowserDownloadFile=async (b64_or_arr,file_name="downloaded.txt")=>
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

anci.bdlf=anci.BrowserDownloadFile;

anci.OpenFile=async function(filepath,mime,forceSystemOpen)
{
  filepath+='';

  if( filepath.startsWith("http") || filepath.startsWith("data:") || filepath.startsWith("content"))
    var rfilepath=filepath;
  else
    var rfilepath=await anci.realp( filepath ) ;

  if(await anci.hasurl(rfilepath) && !forceSystemOpen)
  {

    await alert2(`<iframe style="width:100%;height:85%;
          background-color:white;"
          src="${rfilepath}">
          </iframe>` , true,false );
    return "Success: Opened" + hh + rfilepath;    

  }
  else 
  {
    var sobj={"cmd":"OpenFile",
                "param":[filepath+'',mime+''] };

    await anci.sleep(1000);
  
    return nodeapi(sobj);

  }
}  //  anci.OpenFile

anci.openf=anci.OpenFile;

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


}  //  File system operations End

anci.GetByFunctionName=function(funcName,param)
{
  var sobj={"cmd": funcName,param};
  return nodeapi(sobj);
};

{  //  batching simple functions
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
		   "DisableKeys",
	           "Exit",
	           "GetPackageName" ];
for(let i of fnarr)
	anci[i]=(...param)=>anci.GetByFunctionName(i,param);
	
}  //  batching simple functions End

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
anci.exit=anci.Exit;

anci.getpkn=anci.GetPackageName;

Object.defineProperty(anci,"cb",{set:anci.setcb,get:anci.getcb});
Object.defineProperty(anci,"appp",{get:anci.getappp});
Object.defineProperty(anci,"appn",{get:anci.getappn});
Object.defineProperty(anci,"ver",{get:anci.getv});

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
 
anci.TextToSpeech=function(text,pitch,rate,stream,locale,engine)
{
  pitch=pitch || 1; rate=rate || 1;
  text+='';
  
  var sobj={"cmd":"app.TextToSpeech",text,pitch,rate,stream,locale,engine};
  return nodeapi(sobj);
};

anci.tts=anci.TextToSpeech;


}  //  Node API End


for(let i of Object.keys(anci))
  {
    if(anci[i] && typeof anci[i]=="function" && (i+"").toLowerCase()!=i) 
      anci[i].Name=i;
  }


}  //  if platform matches End

}  //  Android DroidScript part End


{  //  Electron / NodeJS client part

if(globalThis.platform == "web" || globalThis.platform == "electron")
{  //  if platform matches


{  //  Node API


anci.nodeapi=(data,synchronized)=>{  

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

  if(url=="local")
  {
    var localorp="/storage_local"

    if(typeof data=="object")
      data=JSON.stringify(data);
  }
  else
  {
    //  default: operationing under /main.app
    var localorp="/storage_proxy";

    var dobj;

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
	
    if(!location.pathname.endsWith("/main.app"))  //  not same origin and no /storage_proxy available
    {  
      localorp = dobj.url.shift() ;
      if(window.passwd)
        localorp += "?passwd="+window.passwd;
    }

    data=JSON.stringify(dobj);

    }catch(e){ return e.stack; }

  }  //  url not local 


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

nodeapi=anci.nodeapi;

{  //  Network 

anci.RunRemoteApp=(url,param={})=>
{
  param='&'+Object.keys(param).map(i=>{
    return encodeURIComponent(i)+'='+encodeURIComponent(param[i]);
  }).join('&');
  url+='';
  
  if( !url.match(/[\\\/]/g) )
    url='/sdcard/napps/'+url+'/main.app';

  if(!confirm("Will now open other APP(inherits permissions) 將開啟其他APP(將繼承權限):\r\n"+url+'?passwd=...'+param))
    return false;

  anci.OpenUrl(url+`?platform=${window.platform}&passwd=${window.passwd}&storage_location_url=${location.protocol+"//"+location.host+"/storage_local"+param}`);
  return true;
}

anci.remoteapp=anci.RunRemoteApp;

}  //  Network End


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
  url = ( url || "" ) + "";
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

var cbf=async function(nfext)
{ // cbf start

if(htmlf.indexOf(nfext)!=-1)
{
	var t=await anci.rf(filepath);
	var cwin=anci.openu("about:blank");
	cwin.document.write(t);
}
else if(txtf.indexOf(nfext)!=-1)
{

    if( await anci.hasd("/bin/notepad") )
    {
      return await anci.remoteapp("notepad", {filep:filepath} );
    }

    var t = await anci.ReadFile(filepath);
    var cwin=anci.openu("about:blank");
    cwin.document.write("<text"+"area id=\"tall\" style=\"width:100%;height:95%;\"></text"+"area><br><but"+"ton onclick=\"var cwin=window.opener.open(\'about:blank\');cwin.document.write(tall.value);\">Html preview</but"+"ton>");
    cwin.document.getElementById("tall").value=t;

    return true;
}
else if(imgf.indexOf(nfext)!=-1)
{
    var b64=await anci.ReadFile(filepath,"base64");
    var datauri="data:image/"+nfext.substr(1)+";base64,"+b64;
    var cwin=anci.openu("about:blank");
    cwin.document.write("<img src=\""+datauri+"\">");

    return true;
}
else if(audf.indexOf(nfext)!=-1)
{
    if(nfext==".mp3") nfext=".mpeg";
    var b64=await anci.ReadFile(filepath,"base64");

    var datauri="data:audio/"+nfext.substr(1)+";base64,"+b64;
    var cwin=anci.openu();
    cwin.document.write("<audio controls=\"controls\" autobuffer=\"autobuffer\"><source src=\""+datauri+"\" /></audio>");
    //cwin.document.write("<video controls><source src=\""+datauri+"\"></video>");

    return true;
}
else if((vidf).indexOf(nfext)!=-1)
{
    var b64=await anci.ReadFile(filepath,"base64");
    var datauri="data:video/"+nfext.substr(1)+";base64,"+b64;
    var cwin=anci.openu("about:blank");
    cwin.document.write("<video controls><source src=\""+datauri+"\"></video>");

    return true;
}
else //(nfext===".download" or more)
{
    var b64=await anci.ReadFile(filepath,"base64");
    var tind=filepath.lastIndexOf("/")+1;
    return await anci.bdlf(b64,filepath.substr(tind));
}

} // cbf ends

if(htmlf.indexOf(fext)+txtf.indexOf(fext)+imgf.indexOf(fext)+audf.indexOf(fext)+vidf.indexOf(fext)==-5 && !absexists || fext==".select")
{
var item=await anci.CreateListDialog(filepath+"\n選擇檔案類型： Select file type:","文字 Text,圖片 Image,音樂 Audio,影片 Video,下載 Download",null,null,"pm");

  if(item.startsWith("文"))
    return cbf(".txt");
  else if(item.startsWith("圖"))
    return cbf(".jpg");
  else if(item.startsWith("音"))
    return cbf(".mp3");
  else if(item.startsWith("影"))
    return cbf(".mp4");
  else if(item.startsWith("下"))
    return cbf(".download");

} // if other file types
else
  return cbf(fext);

};

anci.openf=anci.OpenFile;


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
    if(anci[i] && typeof anci[i]=="function" && (i+"").toLowerCase()!=i) 
      anci[i].Name=i;
  }


}  //  if platform matches End

}  //  Electron / NodeJS client part End


try{
  anci.hasurl.Desc="Uses jQuery.ajax to check for head, abide by CORS"


}catch(e){
  console.log(e.stack);
}
