









anci={droidscript_resolves:{},alert2_resolves:{},showlist_resolves:{}};


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
	if(!["true","false"].includes(overwrite+''))
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
            var s=overwrite+'';
            overwrite=async function(res)
              {
                if(s=='false')
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

anci.ReadFileInBytes=async (filePath)=>anci.b64arr(await anci.ReadFile(filePath,"base64"));

anci.rfb=anci.ReadFileInBytes;

anci.WriteFileInBytes=function(filePath,byteArray)
{
  if(!byteArray) return "Write file error: No contents specified";

  var sobj={"cmd":"app.WriteFileInBytes",
                "path":filePath,
                byteArray };

  return nodeapi(JSON.stringify(sobj),"pm");
};

anci.wfb=anci.WriteFileInBytes;

anci.ReadFile=function(filePath,textEncoding)
{
	textEncoding=textEncoding || "utf8";

    var sobj={"cmd":"app.ReadFile",
                "path":filePath+'',
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
                "path":folderPath+'' };
  return nodeapi(JSON.stringify(sobj),"pm");
};

anci.mkdir=anci.MakeFolder;

anci.DeleteFile=function(filePath)
{
  var sobj={"cmd":"app.DeleteFile",
                "path":filePath+'' };
  return nodeapi(JSON.stringify(sobj),"pm");
};

anci.rm=anci.DeleteFile;

anci.DeleteFolder=function(folderPath)
{
  var sobj={"cmd":"app.DeleteFolder",
                "path":folderPath+'' };
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
                "path":filePath+''  };

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
                "path":folderPath+'' };

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

anci.ChooseFile=async (default_folders,multi_select)=>
{
var deflist=["/sdcard"];
deflist.unshift("<<手動輸入... Manually enter...>>");

if(typeof(default_folders)=="string" && default_folders)
{
  deflist.push(...default_folders.split(","));
}
else if(default_folders && default_folders.constructor==Array)
{
  deflist.push(...default_folders);
}

var selected_file = await anci.showlist("選擇檔案 Select a file",deflist);

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
    
    listArray.unshift(`<span data-path="${parentFolder}">${anci.faicon("r,folder-open")}.. 上一層 Parent</span>`);
	let sel2=await anci.showlist(selected_file,listArray,true);
	if(!sel2) return "";
	
    sel2+='';

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



};

return await file_selected(selected_file);

}

anci.selectf=anci.ChooseFile;


}  //  File system operations End

anci.SetClipboardText=async function(txt)
{
  txt+='';

  if( window.clipboardData && window.clipboardData.setData )
  {
    window.clipboardData.setData("Text", txt);
    return "Successfully set to clipboard: " + txt;
  }

  obj=document.createElement("textarea");

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

Object.defineProperty(anci,"doc",{get:anci.getdoc});

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

Object.defineProperty(anci,"doca",{get:anci.getdoca});

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
		  else if(oname=="Function" || oname=="AsyncFunction")
			ret.unshift(objO.toString().match(/\(.*?\)/) || "")

          ret.unshift(oname || "No Constructor");
          return ret;
}

anci.objls=anci.ListObjectProperties;

anci.ObjectBrowser=async function(rootObj)
  {
    if(!rootObj) return;

    let prt=(s)=>{
      let tind=s.lastIndexOf("][");
      if(tind!=-1)
        return s.substr(0,tind+1);
      else
        return "rootObj";
    };

    let children=anci.objls(rootObj);

    children=children.map(i=>(`<span data-path="rootObj[`+"`"+i+"`"+`]">${i}</span>`));

    var reso=await anci.showlist("rootObj",children,true);
    var res=$(reso.toString()).data("path");

    console.log(res);

    var prop=null;
    prop=eval(res);

    if(prop!=null)
    {
      while(1)
      {

        let children=anci.objls(prop);
        children=children.map(i=>(`<span data-path="${res}[`+"`"+i+"`"+`]">${i}</span>`));
        children.unshift(`<span data-path="${prt(res)}">上一層 Parent</span>`);

        reso=await anci.showlist(res,children,true);
        res=$(reso.toString()).data("path");
        if(!res) return;
        console.log(res)
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

Object.prototype.c=function(func,spread)
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

Object.prototype.b=function(func)
{
  anci.branched_obj.push(this);
  return this.c(func);
}

Object.prototype.m=function(func)
{
  var that=[...anci.branched_obj,this];
  anci.branched_obj=[];
  return this.c.call(that,func,true);
}


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
	    var csl=console.log,jss=JSON.stringify,jsp=JSON.parse;

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



alert2=async (msg,textAsHtml,focus_ok)=>{
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
          .attr("onclick",`$(this).remove();anci.alert2_resolves[${uniqueID}]();delete anci.alert2_resolves[${uniqueID}];`);

  if(textAsHtml)
    dlg.html(msg);
  else
    dlg[0].innerText=(msg);

  dlg.append(`<div class="text-center"><button onclick="anci.alert2_resolves[${uniqueID}]($(this).parent().parent().find('textarea').val());">OK</button></div>`);

  $("body").append(dlg);

  if(focus_ok)
    dlg.find("button").last().focus();

  return await new Promise(resolve=>{
	  anci.alert2_resolves[uniqueID]=r=>resolve(r);
  });

};

anci.Prompt=async (msg,default_value,textAsHtml)=>
{
  msg=(msg || document.title)+"";
  return await alert2(`${textAsHtml?msg:anci.ttoh(msg)}<br><textarea style="width:100%;height:70%" onclick="event.stopPropagation();">${default_value || ""}</textarea>`,true)
}

prompt=anci.Prompt;

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

  var uniqueID=anci.rndtime();

  return (await new Promise(async (resolve)=>{

  anci.showlist_resolves[uniqueID]=resolve;
  
  anci.multi_items=new Set;

  let result=await alert2(`
<h3 class="alert alert-success text-center">
  ${title_optional}
</h3>
<ul class="list-group">
  <li 
  class="list-group-item list-group-item-danger text-center" 
  onclick="anci.showlist_resolves[${uniqueID}]('');delete anci.showlist_resolves[${uniqueID}];">
    取消Cancel
  ${!multi_select?"":`
  <textarea style="display:none;">"multi_items"</textarea>
  `}
  </li>`+
  list.map((i,ind)=>(`
  <li 
  class="list-group-item list-group-item-info"
  onclick="var res=new String(anci.b64d('${anci.b64e(i)}'));res.index=${ind};anci.showlist_resolves[${uniqueID}](res);delete anci.showlist_resolves[${uniqueID}];">
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
</ul>`,true);

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
	$.isNumeric(milliSeconds) && (milliSeconds-=0);

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

ge=(elementID)=>document.getElementById(elementID);

}  //  Common libraries End





