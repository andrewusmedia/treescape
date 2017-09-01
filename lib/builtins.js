exports.p = {
  before:"<p>",
  after:"</p>"
}

exports.div = {
  before:"<div>",
  after:"</div>"
}

module.exports = ()=>{
  let out = {};
  out.p = "<p args()>block()</p>";
  out.div = "<div args()>block()</div>";
  out.html = "doctype html<html args()>block()</html>";
  out.head = "<head args()>block()</head>";
  out.body = "<body args()>block()</body>";
}