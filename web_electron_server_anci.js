/* 
Start of the block for letting this node app
 restart automatically when an error occurs
*/

global.joinp=(path_original)=>{
    if( !path_original )
      return ``;
    let pret = require("path").join(  __dirname , path_original  );
        pret = pret.replace(/\\/g,"/");
    return pret ;
};

global.platform = global.platform || "web";


if(global.platform=="web")
{
	
var cluster = require('cluster');
if (cluster.isMaster) {
  cluster.fork();
  cluster.on('exit', function(worker, code, signal) {
    cluster.fork();
  });
}
if (cluster.isWorker) {
runApp();
}

}
else if(global.platform=="electron")
{
	global.runApp=runApp;
}

/*
End of the block for letting this node app
 restart automatically when an error occurs
*/

function runApp(){
	
const web_portn=8081;
const hostName="::ffff:127.0.0.1";


var iconv=require("iconv-lite");  // for endoding conversion
var https=require("https");
var http = require("http");
var url = require("url");
var fs=require("fs");  // file system
  var fse=require("fs-extra");
  var fsp=fs.promises;
var express=require("express");
var app=express();
fetch=require("node-fetch");
const util = require('util');
var sentryr=fs.readFileSync(global.joinp("app_entry_template.html")).toString("utf8");
var sanci=fs.readFileSync(global.joinp("nlib/web_electron_api_anci.js")).toString("utf8");
var sdefbox=`





<div id="progress_fullscreen" style="padding:50px 10px 50px 10px;text-align:center;position:fixed;left:20%;top:15%;width:60%;display:none;z-index:100;background-color:#333333;color:white;border-radius:20px;font-size:24px;" onclick="this.style.display='none';"></div>

<input id="browser_file_select_dialog" type="file" style="position: absolute; top: -100em">





`;
var gbcache={};
var gbsecret={};

var passwd=(()=>
{
  var min=100000001,max=999999999
  rnd=Math.floor(Math.random() * (max - min) + min)
  return rnd+""+Date.now();
})()

var pathn;

{  //  preset files
if(!fexists(global.joinp("trusted.pass")))
{
  var trustedclients="{\"tmpauths\":[],\"ip\":[]}";
  fs.writeFileSync(global.joinp("trusted.pass"),trustedclients);
}
else
{
  var trustedclients=fs.readFileSync(global.joinp("trusted.pass")).toString("utf8");
}

if(fexists(global.joinp("pathmap.txt")))
  var pmarr=JSON.parse(fs.readFileSync(global.joinp("pathmap.txt"),"utf8"));

}  //  preset files end

const hh="\r\n";
const jss=JSON.stringify;
const jsp=JSON.parse;
const csl=console.log;



app.use((req,res,next)=>{
csl(new Date().toLocaleString()+"↓↓");
csl("Client IP: "+req.connection.remoteAddress+hh+"Server IP: "+req.connection.localAddress);
pathn=decodeURIComponent(req.path);
csl(req.method+" "+pathn);
csl(jss(req.query));
csl(jss(req.headers)+hh);

next();
});

app.use(authfunc);

app.get("/",(q,s)=>s.redirect("/sdcard/napps/0/main.app"));

app.get("/favicon.ico",(q,s)=>s.sendFile(global.joinp("favicon.ico")));

app.get(/\/sdcard\/napps\/[^\/]+\/main.app/,(req,res)=>{
  gen_app_html(req,res);
  //res.end("<h1>hello app</h1>");
});

app.use(/\/sdcard\/napps\/[^\/]+\/nlib/,express.static(global.joinp("nlib")));

app.use("/sdcard",express.static(global.joinp("sdcard")));

app.use(express.json({limit:"50mb"}));

app.post("/json",(req,res)=>{
  csl(req.body);
  res.end("ok");
});

app.get("/pdf",(req,res)=>{
  csl("calling remote pdf...");
  res.type(".pdf");
  fetch("http://www.africau.edu/images/default/sample.pdf")
  .then(r=>r.buffer())
  .then(r=>res.end(r))
  .catch(e=>res.end(e.stack));
});

app.use((q,s,n)=>
{
    if(q.query.passwd==passwd)
      s.set("Access-Control-Allow-Origin","*");
      s.set("Access-Control-Allow-Headers","Content-Type");
    n()
});

app.post("/storage_local",(req,res)=>{
  if(req.body.cmd)
    EvaluateAppCommand(req.body,res);
  else
    res.end("No command found");
});

app.post("/storage_proxy",(req,res)=>{

  csl(req.body);

  if(req.body.url && req.body.cmd)
  {
    if(req.body.url.constructor.name=="Array")
    {
      csl( 'Starts proxying urls' + hh );

      const agent = new https.Agent({
        rejectUnauthorized: false,
      });
      
      let furl = req.body.url.shift() + "" ;
    
      fetch(  furl  ,
            {
              agent:  furl.startsWith('https') ? agent : null ,
              method:"post",
              body:JSON.stringify(req.body),
              headers:{"Content-Type":"application/json"}
            })
      .then(r=>r.text())
      .then(r=>res.end(r))
      .catch( e=>{  res.end(e.stack); csl(e.stack);  } );
    }
  }
  else
    res.end("No proxy URLs found!");

});

if(global.platform=="web")
{

  if(process.argv[2] == "--https")
  {
    var path = require("path");
    const options = {
      key: fs.readFileSync(path.join(__dirname, 'server.key')),
      cert: fs.readFileSync(path.join(__dirname, 'server.crt')),
    };
    //  you may test by openssl req -newkey rsa:2048 -nodes -keyout server.key -x509 -days 365 -out server.crt

    server=https.createServer( options, app );
    server.listen(web_portn,hostName);
    csl(`Server Started on ${hostName}, port:`+web_portn+hh);
  }
  else
  {
    server=app.listen(web_portn,hostName);//.listen(portn,"::1");
    csl(`Server Started on ${hostName}, port:`+web_portn+hh);
  }
  
}
else if(global.platform=="electron")
{
  server = app.listen(0, "::ffff:127.0.0.1", () => {
  console.log('Server Started on ::ffff:127.0.0.1, port:', server.address().port);
  global.resolvePort && global.resolvePort(server.address().port);
});
}




var os = require('os');

csl( os.platform(), os.release(), global.platform );

if( !(os.release().toLowerCase().includes("proot") && global.platform=="electron") )
{
    

var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      csl(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
      csl(ifname, iface.address);
    }
    ++alias;
  });
});

}  //  end of printing ip address

csl("");

process.stdin.setEncoding('utf8');

/*
process.stdin.on('readable', () => {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    if(chunk == "r\n" || chunk=="r\r\n") process.exit(1);
    csl(jss(chunk));
  }
});
*/

{  //  Reading command prompt input
	
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pack_to_droidscript()
{
  console.log("Which APP do you want to pack? 你想打包哪個APP?")
  
  fs.readdir(global.joinp("sdcard/napps"),(err,files)=>
  {
    if(err) {console.log("/sdcard/napps Does not exist 目錄不存在");ask();return false;}
    console.log(files.map((ii,ind)=>(ind+1+". "+ii)).join("\n"))
	rl.question(">", async (reply)=>
    {
	  try{
	  reply-=1
      if(isNaN(reply) || !files[reply]) {console.log("No such options! 無該選項！");ask();return false;}
	  
	  complement_appentry("sdcard/napps/"+files[reply]+"/",files[reply])
	  
	  csl("\x1b[36m%s\x1b[0m","\r\nCopying /sdcard/napps/APP folder to /DroidScript...\r\n")
	  console.log(await CopyFolder(global.joinp("sdcard/napps/"+files[reply]),global.joinp("DroidScript"),true));
	  csl("\x1b[36m%s\x1b[0m","\r\nCopying nlib folder to /DroidScript/APP...\r\n")
	  console.log(await CopyFolder(global.joinp("nlib"),global.joinp("DroidScript/"+files[reply]),true));
	  csl("\x1b[36m%s\x1b[0m","\r\nCopying droidscript_main.js to "+"DroidScript/"+files[reply]+"/"+files[reply]+".js...\r\n");
	  console.log( CopyFile(global.joinp("droidscript_main.js"),global.joinp("DroidScript/"+files[reply]+"/"+files[reply]+".js"),true) )
	  
	  console.log(`\r\nSuccessfully packed APP ${files[reply]}!`)
	  console.log("Enjoy it at /DroidScript/"+files[reply]+" and copy this folder to /sdcard/DroidScript on Android\r\n")
	  
	  ask();
	  }catch(e){console.log(e); ask();}
	  
    });
  });
  
  
}

function evaluate_stdin()
{
	console.log("Please enter the code you want to run 請輸入要執行的程式碼\r\n>");
	rl.question(">", async (reply)=>
	{
		eval(reply);
		console.log("\r\n執行完畢\r\n");
		ask();
	});
}

function ask()
{

console.log("\x1b[33m%s\x1b[0m",`Welcome to Android Node.js Common Interface (ANCI) 歡迎來到安卓和Node.js的通用介面(ANCI)
Select a function below: 請選擇一項功能
p = Pack APP to Android's DroidScript ----- p = 打包APP到安卓的DroidScript
r = Restart Server ----- r = 重新啟動伺服器
e = Evaluate inputs ----- e = 執行輸入的程式碼

public = Restart server and permit all ip sources ----- public = 重新啟動伺服器，並且開放所有IP來源

  Warning: "public" will automatically permit anyone from the internal network, i.e. IP starting with 192.168.x.x or 10.x.x.x to use your APP. 
  If you use NAT, anyone from the public may use your APP! 
  Use at your own risk! You can use "r" to resume secure environment.
  
  警告：如果使用"public"功能，所有來自內部網路的使用者都能使用您的APP，也就是IP開頭是192.168.x.x或是10.x.x.x的使用者。
  如果您使用了NAT功能，則任何公眾皆有可能使用您的APP！
  請您自行小心使用！您可以使用"r"功能來回到安全環境。
  
CTRL+C * 2 = Exit Server

`);

rl.question(">", (answer) => {

  switch(answer)
  {

  case "r":
	  process.exit(1);
	  break;

	case "p":
	  pack_to_droidscript();
	  return;
	  break;

	case "e":
	  evaluate_stdin();
	  return;
	  break;

	case "public":
	  server.close();
	  server.listen(web_portn);
	  break;

  case "permit":
    if (typeof gbsecret.evalserver === 'function') {
      gbsecret.evalserver();
    }
    break;

	default:
	  console.log(`Unknown command ${answer}`)

  }  //  end of switch answer
  
  ask();
});

}

if(global.platform=="web")
  ask()

}  // Reading command prompt input End



























function authfunc(req, res,next)
{

var tlist=jsp(trustedclients);

var cryptip=(iipn,ikey)=>
  {
    return Math.floor(iipn*ikey).toString().substr(0,9).replace(".","");
  }

var cip=req.connection.remoteAddress;
var otherpass=(cip.indexOf(":192.168.")!=-1 || cip.indexOf(":10.")!=-1 );

if((tlist.ip).indexOf(cip)===-1 && !otherpass)
  {
    var cipn=cip;
    cipn=cipn.split(":").join("").split(".").join("");
    cipn=parseInt(cipn,16);

    var goodauth=false;
    tlist.tmpauths.forEach((item,index)=>
      {
        if(dexists(global.joinp(cryptip(cipn,item))))
          {
            goodauth=true;
              tlist.tmpauths.splice(index,1);
          }
      }); // for each chech temp authentication
    if(goodauth)
      {
      tlist.ip.unshift(cip);
      trustedclients=jss(tlist);
      fs.writeFileSync(global.joinp("trusted.pass"),trustedclients);
        next();
      }
    else
      {
        var tkey=Math.ceil(new Date().getTime()/(Math.random()*90+10)).toString();
        if(tlist.tmpauths.length>50) tlist.tmpauths=tlist.tmpauths.slice(0,49);
        tlist.tmpauths.unshift(tkey);
        trustedclients=jss(tlist);
        fs.writeFileSync(global.joinp("trusted.pass"),trustedclients);
        retres("Wrong Password!"+hh+"Please create a folder named:\""+cryptip(cipn,tkey)+"\" to verify"+hh,res);
      }
  } // if client ip not on list
else
  {
    next();
  }

}  // authfunc

function complement_appentry(wkp,appnp)
{
	   
   var sentry=sentryr;
	   
   if(!fexists(global.joinp(wkp+"{app_entry}.html")))
     {
       let icp1=("Img/app-icon.png");
       let icp2=("Img/app-icon.ico");
       if(  fexists(  global.joinp( wkp+icp1 ))  )
         sentry=sentry.replace(  /\/favicon\.ico/g  , icp1 )
                   .replace(/x\-icon/g,"png");
       else if(  fexists(  global.joinp( wkp+icp2 ))  )
         sentry=sentry.replace(  /\/favicon\.ico/g  , icp2 )

	   sentry=sentry.replace("title_string_to_be_replaced",appnp);

       fs.writeFileSync(global.joinp(wkp+"{app_entry}.html"),sentry);
     }
   else
     {
       sentry=fs.readFileSync(global.joinp(wkp+"{app_entry}.html")).toString("utf8");
     }
   sentry=sentry.substr(0,sentry.indexOf("</head>")+7)
                .replace("title_string_to_be_replaced",appnp);
	 return sentry;
}  //  function complement_appentry End 

function gen_app_html(req,res)
{

try{

   var tindex=rrp(pathn).lastIndexOf("/");
   var wkp=rrp(pathn).substr(0,tindex); // sdcard/napps/app_name
   var appnp=wkp.substr(wkp.lastIndexOf("/")+1);  //  app_name
   wkp+="/";  // sdcard/napps/app_name/

   var sui=fs.readFileSync(global.joinp(wkp+"UI.html")).toString("utf8");
   tindex=sui.indexOf("id=\"storage_location_url\"");
   if(tindex==-1)
   {
   sui="<textarea id=\"storage_location_url\" rows=\"2\" style=\"display:none;\">local</textarea>"+hh+hh+sui;
   tindex=10;
   }

   var s_code=fs.readFileSync(global.joinp(wkp+"Code.js")).toString("utf8");

   var sentry=complement_appentry(wkp,appnp);

       var spasswd=`  window.passwd="${passwd}" ; `;
       var stlocurl=req.query.storage_location_url;
       if(stlocurl)
         {
           var tindex2=sui.indexOf("</textarea>",tindex);
           tindex=sui.indexOf("\">",tindex)+2;
           sui=sui.substr(0,tindex)+stlocurl+sui.substr(tindex2);
         }

   res.end(
            sentry + hh + hh +
            "<scr"+"ipt>" + hh +
            spasswd + hh + hh +
            s_code + hh + hh +
            "</scr"+"ipt>" + hh + hh +
            "<body>" + sdefbox + sui + hh + hh +
            "</body>" + hh +
            "</html>"
          );

}catch(e){res.end(util.inspect(e));}

}



/**
 * 遞迴列出所有檔案的完整路徑
 * @param {string} dir - 目錄路徑
 * @returns {Promise<string[]>} - 所有檔案的絕對路徑清單
 */
async function lsr(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return await lsr(fullPath); // 遞迴
    } else {
      return fullPath; // 是檔案
    }
  }));
  return files.flat(); // 展平成單一陣列
}



function objls(obj)
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
    let oname=objO.constructor.name;
    if(oname=="Number")
      ret.unshift(objO);
    else if(oname=="String")
      ret.unshift(objO.substr(0,1000));
    else if(oname=="Array")
      ret.unshift(objO.slice(0,10).join(","));

    ret.unshift(objO.constructor.name);
    return ret;
  }

function retres(str,res)
{
  if(!res) res=this;
  if(res==global) return;

  if(typeof(str)!="string") str=util.inspect(str);
  console.log("\r\nServer reply:\r\n"+str.substr(0,1000)+hh);

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(str);
}

async function EvaluateAppCommand(r,res)
{
  try{
    MakeFolder("/home");
    MakeFolder("/bin");
  }catch(e){ csl(e); }

  var apath = global.joinp(rrp(r.path));

  var wfp=util.promisify(fs.writeFile);
  var rf=util.promisify(fs.readFile);

var wf=async (path,buff)=>
{
  path+='';
  let fdp=path.substr(0,path.lastIndexOf('/'))
  await fse.ensureDir(fdp);
  return await wfp(path,buff);
}

try{

r.cmd = r.cmd || "";
console.log(r.cmd);

if(r.cmd==="app.ReadFile")
{
  if(r.encoding == "mem")
  {
    csl("Read From Memory:"+hh+r.path);
    retres( gbcache[r.path] != null ? gbcache[r.path] : "" ,res);
    return true;
  }  //  if encoding == mem

  if(!rrp(r.path))
  {
    retres("Failed to read" +hh+ r.path,res);
    return false;
  }
  else
  {
    var data = await rf( apath );

    if(!data)
    {
      retres("Failed to read" +hh+ r.path,res);
      return false;
    }
	
    r.encoding=r.encoding || "utf8";
  
    retres(  iconv.decode(data,r.encoding)  ,res);
    return true;
	
  }  //  else encoding!=mem && r.path
}
else if(r.cmd==="app.ReadFileInBytes")
{
    var data = await rf( apath );
    retres( Array.from(data) , res);
}
else if(r.cmd==="app.WriteFileInBytes")
{
    await wf(  apath , Buffer.from(r.byteArray) )
    
    if( fexists( apath ) )
        retres("Success: Written to"+hh+r.path,res);
    else
        retres("Failed to write to"+hh+r.path,res);
}
else if(r.cmd==="app.WriteFile")
{
  if(r.encoding=="mem")
  {
    csl("Written to memory:"+hh+r.path);
    gbcache[r.path] = r.text != null ? r.text : "";
    retres("Written to memory:"+hh+r.path,res);
    return true;
  }
  else if(r.encoding=="email")
  {
      var obj=JSON.parse(r.text);
      sendmail(obj.to,obj.subject,obj.content,res);
  }
  
  if(!rrp(r.path))
  {
    retres("Failed to write to" +hh+ r.path,res);
    return false;
  }
  else
  {
    r.encoding=r.encoding || "utf8";
    r.text=r.text || "";
	
    var fbuff=iconv.encode(r.text,r.encoding);
    await wf(   apath   , fbuff );
    
    if( fexists( apath ) )
	      retres("Success: Written to"+hh+r.path,res);
	  else    
	      retres("Failed to write to"+hh+r.path,res);
	  
  }  //  else encoding!=mem && r.path
}
else if(r.cmd==="app.MakeFolder")
{
  retres(  MakeFolder(r.path) , res  ) ;
  return;
}
else if(r.cmd==="RealPath")
{
  r.param=r.param[0]+'';
  let p=rrp(r.param);
  if( !p )
    retres("Error, path doesn't exist or not allowed:"+hh+r.param,res);
  else
    retres(  p , res  ) ;
}
else if(r.cmd.startsWith("app.Rename"))
{
  r.path= apath ;
  r.npath=global.joinp(rrp(r.npath));
  if(r.path=="" || r.npath=="")
    {
      retres(`Failed to rename
${r.path}
to
${r.npath}
because the permission is denied!!`,res);
      return false;
    }
  var tfe1=(fexists(r.path) || dexists(r.path)); tfe2=fexists(r.npath); tde2=dexists(r.npath);
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
      fs.renameSync(r.path,r.npath);
      retres("Successfully renamed"+hh+r.path+hh+"to"+hh+r.npath,res);
      return true;
    }
  else // r.npath has file or folder
    {
      if(r.overwrite==true)
        {
        if(tfe2)
          DeleteFile(r.npath);
        else // tde2
          DeleteFolder(r.npath);
        fs.renameSync(r.path,r.npath);
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
          fs.renameSync(r.npath,rnpathn);
          fs.renameSync(r.path,r.npath);
          retres("Successfully renamed"+hh+r.path+hh+"to"+hh+r.npath,res);
          return true;
        } // do not overwrite r.npath
    } // r.npath has file or folder
}
else if(r.cmd==="app.CopyFile")
{
  r.path= apath ;
  r.npath=global.joinp(rrp(r.npath));
  retres(CopyFile(r.path,r.npath,r.overwrite),res);
  return 0;
}
else if(r.cmd==="app.CopyFolder")
{
  r.path= apath ;
  r.npath=global.joinp(rrp(r.npath));
  retres(await CopyFolder(r.path,r.npath,r.overwrite),res);
  return 0;
}
else if(r.cmd==="app.DeleteFile")
{
  r.path= apath ;
  retres(DeleteFile(r.path),res);
  return 0;
}
else if(r.cmd==="app.DeleteFolder")
{
  r.path= apath ;
  if(r.path=="" || r.path=="sdcard")
    {
      retres("Failed to delete"+hh+r.path,res);
      return false;
    }
  if(dexists(r.path))
    {
      DeleteFolder(r.path);

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
  if(fexists( apath ))
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
  if(dexists( apath ))
  {
    retres("1",res);
    return true;
  }
  retres("0",res);
  return false;
}
else if(r.cmd==="app.ListFolder")
{
if(!dexists( apath ))
 {
   retres("Failed to list:"+hh+r.path,res);
   return false;
 }
 
if( ! r.recursive )
{
fs.readdir( apath ,(err,files)=>
  {
    if(err) {retres("Failed",res);return false;}
    retres(JSON.stringify(files),res);
  });
}
else
{
  
    var ret=await lsr( apath );
    if( Array.isArray(ret) )
      ret=ret.map( i=>(i+'').replace( apath, r.path ) );
  
  retres( jss( ret ) , res);
}
  
  
}  //  app.ListFolder
else if(r.cmd==="app.GetFileState")
{
  r.path= apath ;
  retres(jss(await fsp.stat(r.path)),res);
  return 0;
}
else if(r.cmd==="EvalServer")
{
  r.param=r.param[0]+'';
  csl( `即將在伺服器執行以下安全性未知指令，確定嗎？
        允許的話輸入"permit"`+hh+
       `Will execute on server the following safety unknown command, are you sure?
        Type "permit" to allow`+hh+r.param)  
 
  gbsecret.evalserver=async function(){
    let cmd=`(async ()=>{
      ${   this.r.param   };
    })() ;`
  
    let ret=await eval(cmd);
    retres(  ret , this.res  );

  }.bind({r,res});

  return true;
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
    fr.then(r=>r.buffer()).then((result)=>
     {
       console.log(r.path);
       fs.writeFile( apath ,result, (err) =>
       {
         if (err)
         {
         retres("Failed to write to"+hh+r.path,res);
         return false;
         }
         retres("Successfully downloaded"+hh+r.url,res);
       });
     })
    .catch(e=>retres(e.stack,res));
  else
    fr.then(r=>r.buffer()).then((result)=>
     {
        result=iconv.decode(result,r.encoding);
        retres(result,res);
     })
    .catch(e=>retres(e.stack,res));

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

function fexists(fpath)
{
try
  {
    stats=fs.lstatSync(fpath);
    if(stats.isFile())
    return true;
    return false;
  }
catch(e)
  {
    return false;
  }
}

function dexists(dpath)
{
try
  {
    stats=fs.lstatSync(dpath);
    if(stats.isDirectory())
    return true;
    return false;
  }
catch(e)
  {
    return false;
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
    
    
    let pattrep=['/sdcard/napps', '/sdcard/napps',
                          '/sdcard/ndata', '/sdcard/ndata',
                          '/sd/napps', '/sdcard/napps',
                          '/sd/ndata', '/sdcard/ndata',
                           '/sd', '/sdcard',
		           '/sdcard','/sdcard',
                           '/Internal', '/sdcard',
                           '/storage/emulated/0', '/sdcard',
                           '/bin', '/sdcard/napps',
                           '/apps', '/sdcard/napps',
                           '/home', '/sdcard/ndata',
                           '/~', '/sdcard/ndata',
                           '/private', '/sdcard/private',
                           '/media', '/sdcard'
                           ];
                           
    let iistr='/'+istr;

    let okflag=false;
    
    for( let i=0; i<pattrep.length; i+=2)
    {
      let item1=pattrep[i] ;
      let item2=pattrep[i+1] ;
        if( typeof item1=='string' )
        {
          if( iistr.startsWith(item1+'/') || iistr==item1 )
          {
            istr=iistr.replace( item1, item2 );
	    okflag=true;
	    break;
          }
        }
        else if( item1 instanceof RegExp && iistr.match(item1) )
	{
          istr=iistr.replace( item1, item2 );
	  okflag=true;
	  break;
	}
    }

    if(!okflag) return ``;

  if(pmarr!=null)
  {
    for(let item of pmarr)
    {
      if( istr.includes(item) )
      {
        istr=istr.replace(item.s,item.d);
	return istr;
      }
    }
  }

    return istr;
	
}catch(e)
{
  console.log(e.stack);
}
    
} // function rrp

function MakeFolder(rpath)
{
  let failt="Failed to create:"+hh+rpath+hh ;
  rpath=global.joinp(rrp(rpath));
  if(!rpath)
  {
    return failt + "Access Denied!"
  }
  
  var farr=rpath.match(/\/[^\/]+/g);
  var tmpf=farr[0];
  var tflag=false;
  for(let [index,item] of farr.entries())
    {
      if(index>0) tmpf+=item;
      var tde=dexists(tmpf);
      var fde=fexists(tmpf);
      if(!tde && !fde)
        fs.mkdirSync(tmpf);
      else if(!tde && fde)
        {
          return failt+"because file exists" ;
        }
    }
  if(dexists(rpath))
    return ("Successfully created"+hh+rpath);
  else
    return failt;
}  //  MakeFolder

function DeleteFile(rpath)
 {
  if(fexists(rpath))
    {
      fs.unlinkSync(rpath);
      return "Successfully deleted"+hh+rpath;
    }
  else
    {
      return "Failed to delete"+hh+rpath;
    }
 } // Delete File

function DeleteFolder(path)
  {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        DeleteFolder(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }

function CopyFile(path1,path2,ovr)
{
  if(fexists(path1))
    {
      var tmpf=fs.readFileSync(path1);

      var tfe2=fexists(path2); var tde2=dexists(path2);

     if(!tfe2 && !tde2)
     {
       fs.writeFileSync(path2,tmpf);
       return ("Successfully copied"+hh+path1+hh+"to"+hh+path2);
     }
     else
     {
      if(ovr==true)
        {
        if(tfe2)
          DeleteFile(path2);
        else // tde2
          DeleteFolder(path2);
        fs.writeFileSync(path2,tmpf);
        return ("Successfully copied"+hh+path1+hh+"to"+hh+path2);
        } // overwrite path2
      else // do not overwrite r.npath
        {
          var rnpathn=path2;
          while(fexists(rnpathn) || dexists(rnpathn))
            {
            var tind=rnpathn.lastIndexOf(".");
            if(tind==-1)
              rnpathn+="-new";
            else
              rnpathn=rnpathn.substr(0,tind)+"-new"+rnpathn.substr(tind);
            }
          fs.renameSync(path2,rnpathn);
          fs.writeFileSync(path2,tmpf);
          return ("Successfully copied"+hh+path1+hh+"to"+hh+path2);
        } // do not overwrite r.npath
     } // if path2 has file or folder
    } // if path1 exists
  else
    return `Failed to copy
${path1}
to
${path2}
because ${path1} doesn't exist!!`;
}

async function CopyFolder(src,dest,ovr)
  {
    try{

    if(!src || !dest) return;
    ovr=ovr || false;
    let fdn=src.substr(src.lastIndexOf("/")+1);
    if(dest.slice(-1)=="/") dest=dest.slice(0,-1);
    await fse.ensureDir(dest+"/"+fdn);
    await fse.copy(src,dest+"/"+fdn,{
      overwrite:ovr,
      errorOnExist:true,
    })
    return `Copied ${src} to ${dest} successfully!`

    }catch(e)
      {
        console.log(e);
        return e.stack;
      }
  }

}  // End of runApp
