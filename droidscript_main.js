









gbcache={};
const csl=console.log;
const jss=JSON.stringify;
const jsp=JSON.parse;
const hh="\r\n";

dexists=(d)=>
{
  d+='';
  if(!d) return false;
  if( d.startsWith('content://') )
  {
    let fp=d + '/file_for_testing_folder_existence.jpg' ;
    app.WriteFile( fp , 'A' );
    if( fexists(fp) )
    {
      app.DeleteFile(fp);
      return true ;
    }
    else
      return false ;
  }
  else
    return app.FolderExists(d);
 }
fexists=(f)=>
{
  f+='';
  if(f.startsWith('content://'))
    return !!app.ReadFile(f) ;
  else
    return app.FileExists(f) ;
}

//  These 2 lines below makes DroidScript register your app to Android's share via menu when in APK 下面這兩行會讓DroidScript把你的APP註冊到安卓系統的分享選單(當你建立APK時)
//  If your app doesn't want to receive shared data, remove these 2 lines 如果你的APP並不想接收分享的資料, 請移除這兩行
app.GetSharedFiles();
app.GetSharedText();

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

function OnData(isStartup)
{
if(!isStartup)
	web.Execute("if(typeof OnData=='function') OnData()");
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

function retres(str,func,spread_array)
{
	str=str || "";
	var obj={str};
	if(!spread_array)
	  web.Execute(`anci.tmpobj=${JSON.stringify(obj)};
                   ${func}(anci.tmpobj.str)`);
    else
	  web.Execute(`anci.tmpobj=${JSON.stringify(obj)};
                   ${func}(...anci.tmpobj.str)`);
	
	return;
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

function ls(p,debug)
{

  if(!dexists(p)   )
  {
    return ( "Failed to list:"+hh+p );
  }
  if(debug)
    alert(app.RealPath(p));
    
    let files=app.ListFolder(p);
    if(files && files.length>0)
      return ( (files) );
    else
    {
      files=app.WalkFolder(p,null,1)
      if(files)
      {
        files=files[  Object.keys(files)[0]  ];
        files=files.map(i=>i.name);
        return ( (files) );
      }
      else
      {
        return ( "Failed to list:"+hh+p );
      }
    }
}  //  function ls

async function lsr(path, get_date_size)
{
  if(path.slice(-1)=="/")
    path=path.slice(0,-1);
  let farr=await ls(path);
  farr=farr.map(i=>path+"/"+i)
  for(let ind=0;ind<farr.length;ind++)
  {
    web.Execute(` anci.showp( [${ind},${farr.length}] ) `);
    if(ind%10==0)
      await new Promise(  r=>setTimeout(r,1)  )  ;
    let f=farr[ind] ;
    if(await app.FolderExists(f))
      {
        farr.splice( ind, 1,
                           ...await lsr(f,get_date_size)) ;
        ind--;
      }
    else if( get_date_size && 
                 await app.FileExists(f) )
      {
        if(typeof f == "string")
          {
            f=farr[ind]=new String(f)
            
            f.d=await app.GetFileDate(f)
            f.s=await app.GetFileSize(f)
            
          }
      }
  }
  web.Execute( `anci.hidep()` );
  return farr.slice();
};  //  function lsr

function rf(rpath,rencoding)
{
  var rrpath = rrp(rpath);
  rencoding = rencoding || "utf8";

  if(  !rrpath  &&  !rpath.startsWith('content://')  )
  {
    return "Failed to read:" +hh+ rpath ;
  }
  else  //  path valid
  {
  
    if(  rpath.startsWith('content://')  )
    {
      return app.ReadFile(  rpath , rencoding ) ;
    }
    
    if(  rrpath.startsWith('/android_asset/') )
    {
      return app.ReadFile( rrpath , rencoding ) ;
    }
    
    var data = readallbytes( rrpath ) ;
    if(!data)
    {
       return "Failed to read:" +hh+ rpath ;
    }
	
    
    return iconv.decode(  new Uint8Array(data) , rencoding  ) ;

  }  //  else path valid

}  //  function rf

function wf(rpath, rtext, rencoding, test_existence)
{
  var rrpath = rrp( rpath ) ;
  if(  !rrpath  &&  !rpath.startsWith('content://')  )
  {
    return "Failed to write to:" +hh+ rpath ;
  }
  
  //  path valid
  let rrdir = rrpath.substr(0, rrpath.lastIndexOf('/') ) ;
  let rdir = rpath.substr(0, rpath.lastIndexOf('/') ) ;
  
  if(  rpath.startsWith('content://')  )
  {
    mkdir(rdir) ;
    app.DeleteFile(rpath) ;
    app.WriteFile( rpath, rtext, null, "UTF-8" ) ;
    if( ! test_existence ) return 'Tried to write, results unkown:' + hh + rpath ;
    if( fexists( rpath ) )
      return 'Successfully written to:' + hh + rpath ;
    else
      return "Failed to write to:" +hh+ rpath ;
  }
  else
  {
    mkdir(rrdir) ;
  
    rencoding=rencoding || "utf8";
    rtext = (rtext || "")+'' ;

    var fbuff=Array.from(iconv.encode(rtext,rencoding));
  
    let ret=writeallbytes( rrpath , fbuff );
    return ret ;
  
  }  //  else valid path
}  //  function wf

function rfb(rpath)
{
      var rrpath=rrp(rpath);
  
      if(  rpath.startsWith('content://')  )
      var ret = atob(app.ReadFile( rpath, "base64"  ))
                      .split('').map(i=>i.charCodeAt(0));
    else
      var ret = readallbytes(  rrpath  );
    
    return ret ;
}  //  rfb

function wfb(rpath, rbyteArray)
{
    var rrpath=rrp(rpath);
    
    let rrdir = rrpath.substr(0, rrpath.lastIndexOf('/') ) ;
    let rdir = rpath.substr(0, rpath.lastIndexOf('/') ) ;
    mkdir(rrdir || rdir);
  
    if(  rpath.startsWith('content://')  )
    {
       app.DeleteFile( rpath ) ;
       app.WriteFile( rpath, btoa(rbyteArray
              .map(i=>String.fromCharCode(i)).join('')), 'Base64') ;
       var ret= 'Successfully written to:' + hh + rpath ;
     }
    else
       var ret = writeallbytes(  rrpath , rbyteArray  );
       
     return ret;
}  //  wfb

function mkdir( rpath )
{
  var failt="Failed to create"+hh+rpath ;
  var rrpath=rrp(rpath);
  if( rpath.startsWith('content://') )
    rrpath=rpath;
  
  if(  rrpath == ""  )
  {
      return failt;
  }
  else if(  false && rpath.startsWith('content://')  )
  {
      app.MakeFolder( rpath );
      return "Tried to create folder, results unknown:" + hh + rpath;
  }
  
  var farr=rrpath.match(/(content:\/)*\/[^\/]+/g);
  var fparr = farr.map( (i,ind) => farr.slice(0,ind+1).join('') );
  for( var i=fparr.length-1; i>=0; i-- )
  {
    let item=fparr[i] ;
    if( dexists( item ) ) break;
  }
  if( i==-1 ) return failt;
  
  for( ; i<fparr.length; i++)
  {
    let item=fparr[i] ;
    app.MakeFolder( item );
    if( !dexists( item ) ) return failt + hh + 'Failed at:' + hh + item;
  }
  
  return "Successfully created"+hh+rpath ;
  
  return;
}  //  function mkdir

function freepath( rnpathn )
{
  while(fexists(rnpathn) || dexists(rnpathn))
  {
    var tind=rnpathn.lastIndexOf(".") ;
    if(tind==-1)
       rnpathn+="_1";
    else
       rnpathn=rnpathn.substr(0,tind)+"_1"+rnpathn.substr(tind) ;
  }
  //alert(rnpathn)
  return rnpathn;
}  //  freepath


async function EvaluateAppCommand(r,res)
{
var simple_functions=["GetClipboardText",
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
		              ];

try{

r.cmd=r.cmd || "";
var rrpath=rrp(r.path);
console.log(r.cmd);

if(r.cmd==="app.ReadFile")
{
  if(r.encoding=="mem")
  {
    csl("Read From Memory:"+hh+r.path);
    retres(gbcache[r.path] ?? "",res);
    return true;
  }  //  if encoding==mem

  retres(  rf( r.path ) , res  ) ;
  return ;
}
else if(r.cmd==="SetOnKey")
{
  app.SetOnKey((...arr)=>retres(arr,"anci.SetOnKey_callback",true))
  retres("Set OnKey callback",res);
}
else if(r.cmd==="SetOrientation")
{
	r.param=r.param[0];
	if(!isNaN(r.param))
	{
		r.param-=0;
		r.param=["Default","Portrait","Landscape","ReversePortrait","ReverseLandscape"][r.param];
	}
	else
	  r.param+='';
  
	app.SetOrientation(r.param,()=>
	{
	  retres("Successfully set orientation to: "+r.param,res);
	});
}
else if(simple_functions.includes(r.cmd))  //  simple functions
{
	if(r.cmd=="OpenUrl" || r.cmd=="DisableKeys")
	  r.param[0]+='';
	retres(app[r.cmd](...r.param),res)
}
else if(r.cmd==="RealPath")
{
  r.param=r.param[0]+'';
  if(!rrp(r.param))
    retres("Error, path doesn't exist or not allowed!",res);
  else
    retres(    app.RealPath( rrp(r.param) ) , res    ) ;
}
else if(r.cmd==="OpenFile")
{
  r.param=r.param[0]+'';
  if(!rrp(r.param))
    retres("Error, file doesn't exist or not allowed!",res);
  else
    retres(app.OpenFile(rrp(r.param)),res)
}
else if(r.cmd==="app.ChooseFile")
{
	app.ChooseFile("請選擇檔案 Please choose a file",null,r=>retres(r,res),rrp(r.folder)||null);
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
    var ret=wfb(r.path);
    retres(ret,res);
}
else if(r.cmd==="app.ReadFileInBytes")
{
    var ret=rfb(r.path);
    retres(ret,res);
}
else if(r.cmd==="app.WriteFile")
{
  if(r.encoding=="mem")
  {
    csl("Written to memory:"+hh+r.path);
    gbcache[r.path]=r.text ?? "";
    retres("Written to memory:"+hh+r.path,res);
    return true;
  }
  else if(r.encoding=="email")
  {
      var obj=JSON.parse(r.text);
      sendmail(obj.to,obj.subject,obj.content,res);
      return true;
  }
  
  retres(  wf( r.path , r.text , r.encoding ) , res ) ;
  return ;
}
else if(r.cmd==="app.MakeFolder")
{
  retres(  mkdir( r.path ) , res  );
  return ;
}
else if(r.cmd.startsWith("app.Rename"))
{
  r.path+=''; r.npath+='';
  if( ! r.path.startsWith( 'content://' ) )
    r.path=rrp(r.path);
  if( ! r.npath.startsWith( 'content://' ) )
    r.npath=rrp(r.npath);
    
  if(  r.path=="" || r.npath==""  )
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
because ${r.path} dose not exist!!`,res);
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
        //  First delete destination path
        if(tfe2)
          app.DeleteFile(r.npath);
        else // tde2
          app.DeleteFolder(r.npath);
		  
		    //  Then rename source path
		    if(fe1)
          app.RenameFile(r.path,r.npath);
	      else if(de1)
		      app.RenameFolder(r.path,r.npath);
	  
        retres("Successfully renamed"+hh+r.path+hh+"to"+hh+r.npath,res);
        return true;
      } // overwrite r.npath
      else // do not overwrite r.npath
      {
          var rnpathn=freepath(r.npath) ;
          
	        if(fe1)
		      {
            app.RenameFile( r.path,rnpathn );
		      }
		      else if(de1)
		      {
            app.RenameFolder( r.path , rnpathn );
		      }
		      
          retres("Successfully renamed"+hh+r.path+hh+"to"+hh+r.npath,res);
          return true;
      } // do not overwrite r.npath
    } // r.npath has file or folder
}  //  else if cmd Rename
else if(r.cmd==="app.CopyFile")
{
  let failt="Failed to copy:"+hh+r.path+hh+"to"+hh+r.npath+hh ;

  r.path+=''; r.npath+='';
  if( ! r.path.startsWith( 'content://' ) )
    r.path=rrp(r.path);
  if( ! r.npath.startsWith( 'content://' ) )
    r.npath=rrp(r.npath);
    
  if(  r.path=="" || r.npath==""  )
    retres( failt + "because permission was denied!" , res ) ;
  
  let barr=rfb( r.path );
  if(r.overwrite) 
    var ret=wfb( r.npath , barr );
  else
    var ret=wfb( r.npath = freepath( r.npath ) , barr );
  //app.CopyFile(r.path,r.npath,r.overwrite)
  //alert(jss([r.path,r.npath,barr],null,1));
  retres(`Successfully copied ${hh+r.path+hh}to${hh+r.npath}`,res);
  return true ;
}  //  cmd CopyFile
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
  if(  rrpath==="" && ! r.path.startsWith('content://')  )
    {
      retres("Failed to test existence of" +hh+ r.path,res);
      return false;
    }
  if(fexists(rrpath)  ||  
          ( r.path.startsWith('content://') && fexists(r.path) )
     )
  {
    retres("1",res);
    return true;
  }
  retres("0",res);
  return false;
}
else if(r.cmd===("app.FolderExists"))
{
  if(  rrpath==="" && ! r.path.startsWith('content://')  )
    {
      retres("Failed to test existence of" +hh+ r.path,res);
      return false;
    }
  if(  ( dexists(rrpath) )  ||  
          ( r.path.startsWith('content://') && dexists(r.path) )
     )
  {
    retres("1",res);
    return true;
  }
  retres("0",res);
  return false;
}  //  cmd FolderExists
else if(r.cmd==="app.ListFolder")
{
  let p=rrp(r.path);
  if(r.recursive)
    var ret=await lsr(p);
  else
    var ret=ls(p);
  if(typeof ret=='string')
    retres( ret , res );
  else
    retres( jss(ret) , res );
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
    try{
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
    //  ↑確保路徑為 aaa/bbb/ccc
    
    
    let tarr=istr.split("/");
    for(let i of tarr)
    {
      if(i=="." || i=="..")
      return "";
    }
    //  ↑確保沒有上一層指示符夾雜
    
    
    let patt=[  ( /^sdcard[\/]/g ) , ( /^sdcard$/g ) ,
                       ( /^sd[\/]/g ) , ( /^sd$/g ) ,
                       ( /^bin[\/]/g ) , ( /^bin$/g ) ,
                       ( /^apps[\/]/g ) , ( /^apps$/g ) ,
                       ( /^~[\/]/g ) , ( /^~$/g ) ,
                       ( /^android_asset[\/]/g ) , ( /^android_asset$/g ) ,
                       ( /^private[\/]/g ) , ( /^private$/g ) ,
                       ( /^home[\/]/g ) , ( /^home$/g ) ,
                       ( /^Internal[\/]/g ) , ( /^Internal$/g ) ,
                    ];
                    
    let iistr='/'+istr;
    let pv = app.GetPrivateFolder().replace('/files','');
    if(  iistr.startsWith(pv+'/') || 
          iistr==pv   ) 
      return iistr;
    
    if( istr=='private' || istr.startsWith('private/') )
      return iistr.replace('/private',pv);
    
    
    let retnull=true;
    
    for(let i of patt)
      if( istr.match(i) ) retnull=false;
      
    if(retnull) return "";

    let nd='/sdcard/ndata'; let nnd='/sd/ndata';
    let na='/sdcard/napps'; let nna='/sd/napps';
    app.MakeFolder(nd);
    app.MakeFolder(na);
    if( iistr == nd || iistr.startsWith( nd+'/' ) )
      return iistr;
    if( iistr == nnd || iistr.startsWith( nnd+'/' ) )
      return iistr.replace('/sd/','/sdcard/') ;
    if( iistr == na || iistr.startsWith( na+'/' ) )
      return iistr;
    if( iistr == nna || iistr.startsWith( nna+'/' ) )
      return iistr.replace('/sd/','/sdcard/') ;
    if( istr=="~" || istr.startsWith("~/") )
      return iistr.replace('/~',nd);
    if( istr=='home' || istr.startsWith('home/'))
      return iistr.replace('/home',nd);
      
      
    if(  istr.match(patt[0]) || istr.match(patt[1])  )
      return ("/"+istr).replace("/sdcard","/storage/emulated/0");
    else if(  istr.match(patt[2]) || istr.match(patt[3])  )
      return ("/"+istr).replace("/sd","/storage/emulated/0");
    else if(  istr.match(patt[16]) || istr.match(patt[17])  )
      return ("/"+istr).replace("/Internal","/storage/emulated/0");
    else if(  istr.match(patt[10])  )
      return iistr;
    else if(  istr.match(patt[11])  )
      return iistr+'/';
    else if(  istr.match(patt[5]) || istr.match(patt[7])  )
      return na;
    else if(  istr.match(patt[4]) || istr.match(patt[6])  )
      return na+istr.substr(istr.indexOf('/'));
    else
      return "";
    }catch(e)
    {
      alert(e.stack)
    }
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









