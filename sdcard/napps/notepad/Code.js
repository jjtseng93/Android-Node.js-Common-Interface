


//Global Variables
var hh="\r\n";
const root_dir="/sdcard/";
var ruflag=0;
var rumax=100;
var ruarr=["Egg0","Egg1","Egg2","Egg3","Egg4","Egg5"];
var repobj={ 
btn:`
<button onclick=""></button>
`,

txta:`
<textarea id="" rows="" cols=""></textarea>
`,

txt:`
<input type=text id="" value="">
`,

pass:`
<input type=password id="">
`,

form:`
<form method="POST" action="">

</form>
`,

a:`
<a href=""></a>
`,

img:`
<img src="">
`,

submit:`
<input type="submit" id="">
`,

reset:`
<input type="reset" id="">
`,

script:`<scr`+`ipt>

</scr`+`ipt>
`,

fn:`
function ()
{
  
}
`,

pfor:`for(i=0;i<arr.length;i++)
{
  
}
`,

pif:`if()
{
  
}
`,

pelse:`else
{
  
}
`,

pwhile:`while()
{
  
}
`,

dw:`document.write();
`,

sto:`setTimeout(()=>{  },1000);
`,

cto:`clearTimeout();
`,

ido:`indexOf()
`,

ssl:`substr()
`,

ssi:`substring()
`,

other:`
< id="" style="" class=""></>
`,

media:`
<div id="media_blk_id"><video id="media_id1" autoplay controls><source src="your_media's_source" type="video/mp4"><embed id="media_id2" src="the_same_media's_source" controller="true" autoplay="true" autostart="true" type="video/mp4"></embed></video></div>
`

};

var gbcache=
{
  symbolArray: `!@#$%^&*()-_=+\t{}[]|\\:;"'?/`.split(''),
  func_fs:["anci.ReadFile","anci.WriteFile","anci.wfb","anci.rfb","''",
           "anci.FileExists","anci.RenameFile","anci.DeleteFile","''",
		   "anci.FolderExists","anci.RenameFolder","anci.DeleteFolder",
		   "anci.ListFolder","anci.MakeFolder","''","anci.GetAppPath","''","anci.OpenFile","anci.selectf"],
  func_net:["anci.xhr","anci.OpenUrl"],
  chi:true,
};

function OnSetup()
{
   document.title="JavaScript Editor";         // The window title for Node.js web/electron APP
   anci.AppVersion="1.87";              // The app version for Node.js web/electron APP
   anci.ProVersion=false;
   anci.DroidOrientation="Default";    // Orientation for Android DroidScript APP, Available values: Default,Portrait,Landscape,ReversePortrait,ReverseLandscape, or use 0~4
}  //  OnSetup End


// **** This function is run when your APP started, if you have vue to initialize, please put it here
function OnLoad()  
{
ge("th").selectionStart=0;
ge("th").selectionEnd=0;

new Vue(
{
  el: '#rootdiv',
  data: gbcache,
  methods:
  {
	get_func_ins:s=>
	  {
		  let tfs=eval(s).toString();
		  let tind=tfs.indexOf(")");
		  return s+"("+"  ,".repeat(tfs.substr(0,tind).split(",").length-1)+"  )";
	  },
    get_func_help:s=>
	  {
		  let tfs=eval(s).toString();
		  let tind=tfs.indexOf(")");
		  return tfs.substr(0,tind+1).replace("function",s);
	  }	
  },
});

Vue.nextTick(
function(){
ge("filep").onkeyup=(e)=>
 {
  if(e.keyCode==13)
   {
    ge("filep").value=ge("filep").value.replace("\n","");
    openf(ge("filep").value);
   }
 };

if(anci.query)
  openf(anci.query.filep);

}
);

}

function runCode(tobj)
{
if(!tobj) tobj=th.value;
if(typeof tobj=="object")
	tobj=tobj.value;
try{
eval(tobj);
}catch(e){alert("Error from client:\r\n"+e+"\r\n"+e.stack);}
}

function ttoph(phrase)
{
var s=ge("th").value;
var reps=ge("retext").value;
var tind=ge("th").selectionStart-reps.length;
if(tind<0) tind=0;
tind=s.indexOf(reps,tind);
if(tind==-1) return 0;
s=s.substr(0,tind)+phrase+s.substr(tind+reps.length);
ge("th").value=(s);
saverudo();
}

function saverudo()
{
  ruflag++;
  if(ruflag>rumax) ruflag=0;
  ruarr[ruflag]=ge("th").value;
  ge("filep").style.color="red";
}

function tundo()
{
  ruflag--;
  if(ruflag<0) ruflag=rumax;
  ge("th").value=ruarr[ruflag];
  ge("filep").style.color="red";
}

function tredo()
{
  ruflag++;
  if(ruflag>rumax) ruflag=0;
  ge("th").value=ruarr[ruflag];
  ge("filep").style.color="red";
}

async function openf(res,enc)
{
try{
  if(!await anci.FileExists(res)) return 0;
  ge("th").value=await anci.ReadFile(res,enc);
  ge("filep").value=res;
  saverudo();
  filep.style.color='black';
}catch(e){alert(e.stack);}
}


async function pushnote()
{
  var s=ge("th").value;
  s=s.split('\n').join('\r\n');
  var npath=root_dir+fmdate(new Date())+".txt";
  alert(await anci.WriteFile(npath,s,"utf8"));
  filep.value=npath;
  filep.style.color='black';
}

function fmdate(d)
 {
  var glen=(istr,gl)=>
   {
    if(gl==null) gl=1;
    if(istr==null) return "0".repeat(gl);
    istr=""+istr;
    if(istr.length<gl)
      return "0".repeat(gl-istr.length)+istr;
    else
      return istr;
   }
   return ""+d.getFullYear()+glen(d.getMonth()+1,2)+glen(d.getDate(),2)+`(${d.getDay()==0?7:d.getDay()})`+glen(d.getHours(),2)+glen(d.getMinutes(),2)+glen(d.getSeconds(),2)+glen(d.getMilliseconds(),3);
 }

async function fileprev()
{
var dir=root_dir;//"/sdcard/"; 
var rlobj=await anci.ListFolder(dir).map((item)=>dir+item);
var OpenFileS=async (fpath,aext)=>
  {
    if(await anci.FileExists(fpath) && fpath.endsWith(".txt"))
      {
      var s=await anci.ReadFile(fpath,"utf8");
      s=s.substr(0,300);
      s=s.replace(new RegExp("<","g"),"");
      s=`<di`+`v style="border-style:double;width:80%;position:relative;left:10%;">`+s+`</di`+`v>`;
      return s;
      }
    else
      return fpath;
  };
var k=await anci.CreateListDialog("Select note",rlobj.map(OpenFileS),true);
openf(rlobj[k.index],"utf8");
}

async function prevf(inc,aind)
{
try{
 if(inc==null) inc=1;
 var dir=root_dir;//"/sdcard/Download/";
 var rlobj=await anci.ListFolder(dir);
 rlobj=rlobj.sort((itema,itemb)=>itemb.localeCompare(itema));
 rlobj=rlobj.map((res)=>dir+res);
 var tind =rlobj.indexOf(ge("filep").value);

if(aind==255) tind=rlobj.length;
if(aind==0) tind=-1;

if(tind==-1)
   {
     inc=1;
   }
for(var i=tind+inc;i*(i-rlobj.length+1)<=0;i+=inc)
   {
     var item=rlobj[i];
     if(await anci.FileExists(item) && item.endsWith(".txt"))
      {
       openf(item,"utf8");
       break;
      }
   }

}catch(e){alert(e.message);}
}

function nextf()
{
  prevf(-1);
}


function edtins( text )
{    
var ssback=th.selectionStart;

var tmps=th.value;
tmps=tmps.substr(0,th.selectionStart)+text+tmps.substr(th.selectionEnd);

th.value=tmps;
jumpto(ssback+text.length);
saverudo();
}

function getsse(tmps,starts,ends){tmps=tmps.substr(tmps.indexOf(starts)+starts.length);  tmps=tmps.substr(0,tmps.indexOf(ends));return tmps;}

function jumpto(ssse)
{
th.selectionStart=ssse;
th.selectionEnd=ssse;
th.focus();
}

function findfunc1()
{
var tmps=th.value;
selectfunc.innerHTML='<option>函式列表 Function List</option>';
var tindex=tmps.indexOf('function ');
while( tindex!=-1 )
 {
var tmptmps=tmps.substr(tindex);
 selectfunc.innerHTML+='<option value='+tindex+'>'+getsse(tmptmps,'function ','(')+'</option>';
 tindex=tmps.indexOf('function ',tindex+10);
 }
alert('尋找函式成功 Find functions success');
}

function findfunc()
{
  var tmps=th.value;
  selectfunc.innerHTML='<option>函式列表 Function List</option>';
  tmps.replace(/function .*?\(/g,(m,o)=>
  {
	m=m.slice(m.indexOf(" ")+1,-1);
	selectfunc.innerHTML+=`<option value="${o+9}">${m}</option>`;
  });
alert('尋找函式成功 Find functions Success');
}

function findid1()
{
var tmps=th.value;
selectid.innerHTML='<option>ID列表 ID List</option>';
var tindex=tmps.indexOf('id=');
while( tindex!=-1 )
 {
var tmptmps=tmps.substr(tindex);
var tmpgetsse=getsse(tmptmps,'id=','>');
if(tmpgetsse.indexOf(' ')!=-1)
tmpgetsse=tmpgetsse.substr(0,tmpgetsse.indexOf(' '));
if(tmpgetsse.substr(0,1)=='\'' || tmpgetsse.substr(0,1)=='\"')
tmpgetsse=tmpgetsse.substring(1,tmpgetsse.length-1);
 selectid.innerHTML+='<option>'+tmpgetsse+'</option>';
 tindex=tmps.indexOf('id=',tindex+3);
 }
alert('尋找ID成功 Find ID Success');
}

function findid()
{
  var tmps=th.value;
  selectid.innerHTML='<option>ID列表 ID List</option>';
  tmps.replace(/ id=.*?>/g,(m,o)=>
  {
	if(m.substr(4,1)==`"`)
		m=m.match(/".*?"/g)[0].slice(1,-1);
	else if(m.substr(4,1)==`'`)
		m=m.match(/'.*?'/g)[0].slice(1,-1);
	else
		m=m.substring(4,m.indexOf(" ",1));
	selectid.innerHTML+=`<option value="${o+4}">${m}</option>`;
  });
alert('尋找ID成功 Find ID Success');
}


