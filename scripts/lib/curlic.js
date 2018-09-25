'use strict';

function Curlic(text = "")
{
  this.text = `${text}`;

  const runes = {
    "*":{tag:"b"},
    "_":{tag:"i"},
    "#":{tag:"code"},
  }

  function validate(t)
  {
    if(t.indexOf("(") > -1 && t.indexOf(")") < 0){ console.warn(`Missing closing(:${t}`); }
    if(t.indexOf("[") > -1 && t.indexOf("]") < 0){ console.warn(`Missing closing[:${t}`); }
    if(t.indexOf("{") > -1 && t.indexOf("}") < 0){ console.warn(`Missing closing{:${t}`); }
  }

  function evaluate(t)
  {
    try{ return `${eval(t)}`; }
    catch(err){ console.warn(`Cannot eval:${t}`,err); return t; }
  }

  function wrap(s,c,r)
  {
    if(s.indexOf(c) > 0){ return s; }
    s = s.replace(c,`<${r.tag}>`).replace(c,`</${r.tag}>`);
    return r.fn ? s.replace(s,r.fn(s)) : s
  }

  function link(s,t)
  {
    let target = t.substr(1,t.length-2).trim();
    let external = target.indexOf("//") > -1
    let name = s.replace(`(${target})`,"").trim();
    let location = target.toLowerCase().replace(/ /g,"+").replace(/[^0-9a-z\+\:\-\.\/]/gi,"").trim();
    
    return `<a href='${external ? target : '#'+location}' target='${external ? '_blank' : '_self'}' class='${external ? 'external' : 'local'}' data-goto='${external ? '' : target}'>${name ? name : target}</a>`
  }

  function parse(s)
  {
    validate(s);

    let to_eval = s.match(/\[(.*)\]/g)
    if(to_eval){ s = s.replace(to_eval[0],evaluate(to_eval[0])); }

    let to_link = s.match(/\((.*)\)/g)
    if(to_link){ s = s.replace(to_link[0],""); }

    for(let ch in runes){
      if(s.indexOf(ch) < 0){ continue; }
      s = wrap(s,ch,runes[ch])
    }

    if(to_link){
      s = link(s,to_link[0])
    }
    
    return s
  }

  this.extract = function()
  {
    return this.text.match(/[^{\}]+(?=})/g);
  }

  this.toString = function()
  {
    let matches = this.extract();

    if(!matches){ return this.text; }
    
    matches.forEach(el => {
      this.text = this.text.replace(`{${el}}`,parse(el))
    })
    return this.text
  }
}

String.prototype.to_curlic = function(){ return `${new Curlic(this)}`; }
