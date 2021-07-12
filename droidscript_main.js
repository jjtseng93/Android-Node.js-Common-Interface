gbcache={};
const csl=console.log;
const jss=JSON.stringify;
const jsp=JSON.parse;
const hh="\r\n";
dexists=app.FolderExists;
fexists=app.FileExists;

function OnBack()
{
  if(web.CanGoBack())
  {
    web.Back()
	return;
  }
  
  web.Execute("if(typeof(OnStop)=='function') OnStop();");
  app.Exit();
}

function OnConfig()
{
      let a,b;
	  a=app.GetScreenWidth();b=app.GetDisplayHeight();
	  web.SetPosition(0,0,a,b,"px");
}

function OnStart()
{
	tts_running=null;
	
	app.EnableBackKey(false);
	
	app.LoadScript("nlib/iconv.js");
	
    var min=101,max=999
    rnd=Math.floor(Math.random() * (max - min) + min)
	window.passwd=rnd+""+Date.now();

    lay = app.CreateLayout( "absolute" );

    web = app.CreateWebView( 1, 1, "NoApp" );
    web.SetOnConsole( web_OnConsole );
    lay.AddChild( web );

    app.AddLayout( lay );
	
	web.LoadUrl( "{app_entry}.html" );
    
    web.SetOnProgress(prog=>
	  {
        //if(prog-100==0)
        web.Execute( `prompt = window.anci && window.anci.Prompt;
	                  window.passwd="${window.passwd}";` )
      });

}

function web_OnConsole( consoleMsg )
{
  consoleMsg=consoleMsg || "";
  consoleMsg+="";

  if(consoleMsg.startsWith(window.passwd))
  {
	  let d=new TextDecoder();
      let decoded=d.decode(new Uint8Array(consoleMsg.substr(window.passwd.length).split(",")))
      var obj=JSON.parse(decoded);

	  EvaluateAppCommand(obj,"anci.droidscript_resolves['"+obj.func+"']");
  }
  else if(!app.IsAPK())	  
    alert("Main: " + consoleMsg);
}

function retres(str,func)
{
	str=str || "";
	str+="";
	var tic="`";
	if(str.includes(tic))
	{
	  str=str.replace(/`/g,window.passwd);
	  web.Execute(`${func}(${tic+str+tic}.replace(/${window.passwd}/g,"${tic}"))`);
	}
	else
	  web.Execute(`${func}(${tic+str+tic})`);
}

function EvaluateAppCommand(r,res)
{
var simple_functions=["GetClipboardText",
					  "GetAppPath",
					  "GetAppName",
					  "GetVersion",
		              "OpenUrl"];

try{

if(r.cmd==null) r.cmd="";
console.log(r.cmd);

if(r.cmd==="app.ReadFile")
{
 if(r.encoding=="mem")
  {
   csl("Read From Memory:"+hh+r.path);
    if(gbcache[r.path]==null)
      {
        retres("",res);
      }
    else
      {
        retres(gbcache[r.path],res);
      }
   return false;
  } //if encoding==mem
if(rrp(r.path)==="")
  {
    retres("Failed to read" +hh+ r.path,res);
    return false;
  }
else
  {

    data=readallbytes(rrp(r.path));
     if(data==null)
     {
       retres("Failed to read" +hh+ r.path,res);
       return false;
     }
     if(r.encoding==null)
     r.encoding="utf8";
     retres(iconv.decode(new Uint8Array(data),r.encoding),res);
     return true;

  } //else encoding!=mem
}
else if(r.cmd==="SetOrientation")
{
	if(!isNaN(r.param))
	{
		r.param-=0;
		r.param=["Default","Portrait","Landscape","ReversePortrait","ReverseLandscape"][r.param];
	}
	app.SetOrientation(r.param,()=>
	{
	  retres("Successfully set orientation to: "+r.param,res);
	});
}
else if(simple_functions.includes(r.cmd))  //  simple functions
{
	retres(app[r.cmd](r.param),res)
}
else if(r.cmd==="OpenFile")
{
  if(!rrp(r.param))
    retres("Error, file doesn't exist or not allowed!",res);
  else
    retres(app.OpenFile(rrp(r.param)),res)
}
else if(r.cmd==="app.TextToSpeech")
{
  if(tts_running)
  {
    retres("Read Text & Interrupted",tts_running);
	tts_running=null;
	app.TextToSpeech("");
  }

  app.TextToSpeech(r.text,r.pitch,r.rate,()=>{
	retres("Read text",res)  
	tts_running=null;
  },r.stream,r.locale,r.engine);
  
  tts_running=res;
}
else if(r.cmd==="app.WriteFileInBytes")
{
    writeallbytes(rrp(r.path),r.byteArray)
    retres("Successfully written"+hh+r.path,res);
}
else if(r.cmd==="app.WriteFile")
{
 if(r.encoding=="mem")
  {
   csl("Written to memory:"+hh+r.path);
    if(r.text==null)
      r.text="";
    gbcache[r.path]=r.text;
    retres("Written to memory:"+hh+r.path,res);
   return false;
  } //if encoding==mem
else if(r.encoding=="email")
    {
      try
       {
         var obj=JSON.parse(r.text);
         sendmail(obj.to,obj.subject,obj.content,res);
       }
      catch(e)
       {
         retres(util.inspect(e),res);
       }
     return false;
    }
if(rrp(r.path)==="")
  {
    retres("Failed to write to" +hh+ r.path,res);
    return false;
  }
else
  {

    if(r.encoding==null)
      r.encoding="utf8";
    if(r.text==null) r.text="";

    var fbuff=Array.from(iconv.encode(r.text,r.encoding));
  
    writeallbytes(rrp(r.path),fbuff)
    retres("Successfully written"+hh+r.path,res);
  

  } //else encoding!=mem
}
else if(r.cmd==="app.MakeFolder")
{
  r.path=rrp(r.path);
  if(r.path=="")
    {
     retres("Failed to create"+hh+r.path,res);

     return false;
    }
  var farr=r.path.split("/");
  var tmpf=farr[0];
  var tflag=false;
  farr.forEach((item,index)=>
    {
      if(index>0) tmpf+="/"+item;
      var tde=dexists(tmpf);
      var fde=fexists(tmpf);
      if(!tde && !fde)
        app.MakeFolder(tmpf);
      else if(!tde && fde)
        {
          retres("Failed to create folder because file exists"+hh+r.path,res);
          tflag=true;
          return false;
        }
    });
  if(tflag) return false;
  retres("Successfully created"+hh+r.path,res);
  return true;
}
else if(r.cmd.startsWith("app.Rename"))
{
  r.path=rrp(r.path);
  r.npath=rrp(r.npath);
  if(r.path=="" || r.npath=="")
    {
      retres(`Failed to rename
${r.path}
to
${r.npath}
because the permission is denied!!`,res);
      return false;
    }
	
  var fe1=fexists(r.path);
  var de1=dexists(r.path);
  var tfe1=(fe1 || de1); tfe2=fexists(r.npath); tde2=dexists(r.npath);
  if(!tfe1)
    {
      retres(`Failed to rename
${r.path}
to
${r.npath}
because ${r.path} dosen't exist!!`,res);
      return false;
    }
  else if(tfe1 && (!tfe2 && !tde2))
    {
      app.RenameFile(r.path,r.npath);
      retres("Successfully renamed"+hh+r.path+hh+"to"+hh+r.npath,res);
      return true;
    }
  else // r.npath has file or folder
    {
      if(r.overwrite==true)
        {
        if(tfe2)
          app.DeleteFile(r.npath);
        else // tde2
          app.DeleteFolder(r.npath);
		  
		if(fe1)
          app.RenameFile(r.path,r.npath);
	    else if(de1)
		  app.RenameFolder(r.path,r.npath);
	  
        retres("Successfully renamed"+hh+r.path+hh+"to"+hh+r.npath,res);
        return true;
        } // overwrite r.npath
      else // do not overwrite r.npath
        {
          var rnpathn=r.npath;
          while(fexists(rnpathn) || dexists(rnpathn))
            {
            var tind=rnpathn.lastIndexOf(".");
            if(tind==-1)
              rnpathn+="-new";
            else
              rnpathn=rnpathn.substr(0,tind)+"-new"+rnpathn.substr(tind);
            }
			
	      if(fe1)
		  {
            tfe2? app.RenameFile(r.npath,rnpathn):app.RenameFolder(r.npath,rnpathn)
            app.RenameFile(r.path,r.npath);
		  }
		  else if(de1)
		  {
            tfe2? app.RenameFile(r.npath,rnpathn):app.RenameFolder(r.npath,rnpathn)
            app.RenameFolder(r.path,r.npath);
		  }
          retres("Successfully renamed"+hh+r.path+hh+"to"+hh+r.npath,res);
          return true;
        } // do not overwrite r.npath
    } // r.npath has file or folder
}
else if(r.cmd==="app.CopyFile")
{
  r.path=rrp(r.path);
  r.npath=rrp(r.npath);
  app.CopyFile(r.path,r.npath,r.overwrite)
  retres(`Successfully copied ${hh+r.path+hh}to${hh+r.npath}`,res);
  return 0;
}
else if(r.cmd==="app.CopyFolder")
{
  r.path=rrp(r.path);
  r.npath=rrp(r.npath);
  app.CopyFolder(r.path,r.npath,r.overwrite)
  retres(`Successfully copied ${hh+r.path+hh}to${hh+r.npath}`,res);
  return 0;
}
else if(r.cmd==="app.DeleteFile")
{
  r.path=rrp(r.path);
  app.DeleteFile(r.path);
  retres("Successfully deleted"+hh+r.path,res);
  return 0;
}
else if(r.cmd==="app.DeleteFolder")
{
  r.path=rrp(r.path);
  if(r.path=="" || r.path=="sdcard")
    {
      retres("Failed to delete"+hh+r.path,res);
      return false;
    }
  if(dexists(r.path))
    {
      app.DeleteFolder(r.path);

      retres("Successfully deleted"+hh+r.path,res);
      return true;
    }
  else
    {
      retres("Failed to delete"+hh+r.path,res);
      return true;
    }
}
else if(r.cmd===("app.FileExists"))
{
  if(rrp(r.path)==="")
    {
      retres("Failed to test existence of" +hh+ r.path,res);
      return false;
    }
  if(fexists(rrp(r.path)))
  {
    retres("1",res);
    return true;
  }
  retres("0",res);
  return false;
}
else if(r.cmd===("app.FolderExists"))
{
  if(rrp(r.path)==="")
    {
      retres("Failed to test existence of" +hh+ r.path,res);
      return false;
    }
  if(dexists(rrp(r.path)))
  {
    retres("1",res);
    return true;
  }
  retres("0",res);
  return false;
}
else if(r.cmd==="app.ListFolder")
{
if(!dexists(rrp(r.path)))
 {
 retres("Failed to list:"+hh+r.path,res);
 return false;
 }
    var files=app.ListFolder(rrp(r.path))
    retres(JSON.stringify(files),res);

}
   //xhpost(r.url,r.data,cbf,r.method,"1",r.hhead);
else if(r.cmd==="app.xhr" || r.cmd=="downloadfile")
{
  if(r.cmd==="downloadfile")
  {
    if(rrp(r.path)==="")
    {
    retres("Failed to download to"+hh+r.path,res);
    return false;
    }
  }

  r.method=r.method || "GET";
  r.body=r.method.toLowerCase()!="post"?null:r.body;
  r.headers=r.headers || { "Content-Type":"application/json" };
  if(!r.encoding)
    r.encoding="utf8";

  let fr=fetch(r.url,
        {
          method:r.method,
          body:r.body,
          headers:r.headers
        }
       );

  if(r.cmd=="downloadfile")
    fr.then(r=>r.arrayBuffer()).then((result)=>
     {
       console.log(r.path);
       writeallbytes(rrp(r.path),Array.from(new Uint8Array(result)))
       retres("Successfully downloaded"+hh+r.url,res);
     })
    .catch(e=>retres(e.stack));
  else
    fr.then(r=>r.arrayBuffer()).then((result)=>
     {
        result=iconv.decode(new Uint8Array(result),r.encoding);
        retres(result,res);
     })
    .catch(e=>retres(e.stack));

   //xhpost(r.url,r.data,cbf,r.method,"1",r.hhead);
}
else
{
retres("已處理:" +hh+jss(r),res);
}

}catch(e)
  {
   retres(e.stack,res);
  }
}



function rrp(istr)
  {
    if(istr==null || typeof(istr)!="string") return "";
    istr=istr.replace(/\\/g,"/");
 
    var tind=istr.indexOf(":/");
    while(tind!=-1)
    {
      istr=istr.substr(tind+2);
      tind=istr.indexOf(":/");
    }
    while(istr.startsWith("/"))
    {
      istr=istr.substr(1);
    }
    while(istr.endsWith("/"))
    {
      istr=istr.substr(0,istr.length-1);
    }
    if(!istr.startsWith("sdcard/") && istr!="sdcard" && !istr.startsWith("Assets")) return "";
    //if(istr.indexOf("/")===-1 && istr!=="sdcard") return "";
    var tarr=istr.split("/");
    for(let i of tarr)
    {
      if(i=="." || i=="..")
      return "";
    }
    	

    return ("/"+istr).replace("/sdcard","/storage/emulated/0");
  } // function rrp
  

function readallbytes(filen)
{	
    if(!fexists(filen)) return "Failed reading "+filen;
    var f=app.CreateFile(filen,"r");
    let ii=f.ReadData( f.GetLength(), "int" );
    f.Close();
	return ii;
}

function writeallbytes(filen,barr)
{
    app.DeleteFile( filen );
	
    var f=app.CreateFile(filen,"rw");
    f.WriteData( barr.join(",") , "int" );
    f.Close();
}

  

(async ()=>{
window.promConsole=new Promise(res=>{
window.resConsole=res;
});

console.log("hey")
alert(await window.promConsole)


})

