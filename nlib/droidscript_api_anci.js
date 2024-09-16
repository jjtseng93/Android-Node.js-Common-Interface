









{
  window.passwd = window.passwd || anci.query.passwd || '' ;
  window.platform = window.platform || anci.query.platform || "android";
}


if(window.platform == "android")
{  //  if platform matches



{  //  Node API

window.nodeapi=(data)=>{

    data=data || [];
	
	try{
		data=JSON.parse(data);
	}catch(e){
		console.log(e.stack);
		return false;
		}

    if(data && typeof(data)=="object")
	{
      var min=101,max=999
      rnd=Math.floor(Math.random() * (max - min) + min)
	  var uniqueID=rnd+""+Date.now();
	  data.func=uniqueID;
      data=JSON.stringify(data);
	}

return new Promise(resolve=>
 {
    anci.droidscript_resolves[uniqueID]=(r)=>
	{
		resolve(r);
		delete anci.droidscript_resolves[uniqueID];
	}
	
	let e=new TextEncoder();
    console.log(window.passwd+e.encode(data));
 });
  
}


{  //  Network 

anci.RunRemoteApp=async (url)=>
{
  url+='';
  let pk=await anci.GetPackageName();
  
  if(!url.match(/[\\\/]/g))
  {
    let rp='';
    if( await anci.hasd( rp = '/bin/'+url) )
      url=await anci.RealPath(rp+'/{app_entry}.html');
    else if( await anci.hasd( rp = '/sd/Android/media/'+pk+'/napps/'+url ) )
      url=await anci.RealPath(rp+'/{app_entry}.html');
  }
  
  if(!confirm("Will now open other APP(inherits permissions) 將開啟其他APP(將繼承權限):\r\n"+url))
    return;
  location.href=(url+`?passwd=${window.passwd}`);
}  //  func remoteApp

anci.remoteapp=anci.RunRemoteApp;

}  //  Network End


{ //  File system operations

let saveToFile=saveAs;
delete saveAs;

anci.BrowserDownloadFile=async (b64_or_arr,file_name)=>
    {
      if(typeof(b64_or_arr)=="string")
        var barr = Array
                          .from(anci.b64arr(b64_or_arr));
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

anci.OpenFile=async function(filepath,mime)
{
  let rfilepath=await anci.realp( filepath )
  
  alert2(`<iframe style="width:100%;height:85%;
          background-color:white;"
          src="${rfilepath}">
          </iframe>` , true )
  
  var sobj={"cmd":"OpenFile",
                "param":[filepath+'',mime+''] };

  await anci.sleep(1000);
  
  return await nodeapi(JSON.stringify(sobj),"pm");

}  //  anci.OpenFile

}  //  File system operations End

anci.GetByFunctionName=function(funcName,param)
{
  var sobj={"cmd": funcName,param};
  return nodeapi(JSON.stringify(sobj),"pm");
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
		   "GetFileSize",
		   "GetFileDate",
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
anci.openf=anci.OpenFile;
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
    nodeapi(JSON.stringify(sobj),"pm");  
  }
  anci.SetOnKey_callbacks.push(callback);
}

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
  return nodeapi(JSON.stringify(sobj),"pm");
};

anci.tts=anci.TextToSpeech;


}  //  Node API End


for(let i of Object.keys(anci))
  {
    if((i+"").toLowerCase()!=i) anci[i].Name=i;
  }


}  //  if platform matches End









