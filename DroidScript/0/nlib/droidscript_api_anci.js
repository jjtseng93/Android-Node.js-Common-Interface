









if(window.platform == "android")
{  //  if platform matches



function routine_init()
{
  window.OnLoad_Promise=new Promise(async (resolve)=>
  {

    await anci.SetOrientation(anci.DroidOrientation);


    $.get("UI.html").then(UI_html=>
    {
      $(document.body).append(UI_html);
	  $(async ()=>{
	    if(typeof(OnLoad)=="function")
          await OnLoad();
		  
		resolve("OnLoad run!");
		
		(typeof(OnData) == "function") && (await OnData(true))
	  });

    }); // get UI.html then

  });  // html onstart finish resolve

}



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

anci.RunRemoteApp=(url)=>
{
    location.href=(url+`?passwd=${window.passwd}`);
}

anci.remoteapp=anci.RunRemoteApp;

}  //  Network End


{ //  File system operations

let saveToFile=saveAs;
delete saveAs;

anci.BrowserDownloadFile=(not_supported_function)=>
{
  var s="Not supported in DroidScript webview"; 
  console.log(s);
  return s;
}

anci.bdlf=anci.BrowserDownloadFile;

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
		   "OpenFile",
		   "PreventScreenLock",
		   "SetSharedApp",
		   "GetSharedText",
		   "GetSharedFiles",
		   "DisableKeys"];
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









