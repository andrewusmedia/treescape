module.exports = ()=>{
  let out = {};
  out.p = "<p args()>block()</p>";
  out.div = "<div args()>block()</div>";
  out.html = "<doctype html><html args()>block()</html>";
  out.head = "<head args()>block()</head>";
  out.body = "<body args()>block()</body>";
  // out.p = {
  //   before:"<p>",
  //   after:"</p>"
  // }
  // out.div = {
  //   before:"<div>",
  //   after:"</div>"
  // }
  // out.loop = {
  //   before:'"; for(let i = 0; i < 10; i++){out+="',
  //   after:'"} out+="'
  // }
  return out;
}