var electron=require("electron");

window.platform="electron";

window.dialog=electron.remote.dialog;

window.alert=(msg)=>
{
  window.dialog.showMessageBoxSync({message:(msg+""),title:document.title});
}

window.confirm=(msg)=>
{
  var ind=window.dialog.showMessageBoxSync({message:(msg+""),buttons:["Yes","No"],title:document.title});
  return !ind;
}