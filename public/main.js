//main.js - fck-afd URL shortener - Maximilian Schiller
const input = document.getElementById('url-input'),
    input2 = document.getElementById('custom-input2')
    button2 = document.getElementById('custom-button'),
    copybutton = document.getElementById('copy-button'),
    out = document.getElementById('out'),
    out2 = document.getElementById('custom-input');
    var $body = document.getElementsByTagName('body')[0];
    


input.focus();

async function shorten(href){
    const data = {href};
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    const response = await fetch('/api', options);
    const json = await response.json();
    if (json.status == 409){
      out.innerHTML = `<p id=text >Wird bereits verwendet</p>`;
    }
    else if (json.status == 400){
      out.innerHTML = `<p id=text >Fehler, bitte gib eine valide URL ein. </p>`;
    }
    else if (json.status == 422){
      out.innerHTML = `<p id=text >Fehler, bitte gib eine validen Code ein. Er darf keine lücken enthalten.</p>`;
    }
    else if (json.status == 418){
      out.innerHTML = `<p id=text >Fehler, bitte gib eine validen Code ein. Er darf nur A-z und 0-9 enthalten.</p>`;
    }
    else if (json.status == 200){
      console.log(json);
      const link = json.url;
      console.log(link);
      out.innerHTML = `<a href="http://${link}" target="_blank">${link}</a>`;
      copybutton.innerHTML = `<button id=copybutton2 class=copybutton onclick="copy('${link}')">Kopieren</button>`;
    }
    else{
      out.innerHTML = `<p id=text >${json.status}: Es ist ein Fehler aufgetreten, bitte veruche es erneut. </p>`;
    }
}

async function shorten2(href, code){
  const data = {href, code};
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
  const response = await fetch('/api', options);
  const json = await response.json();
  if (json.status == 409){
    out.innerHTML = `<p id=text >${code} wird bereits verwendet.</p>`;
  }
  else if (json.status == 400){
    out.innerHTML = `<p id=text >Fehler, bitte gib eine valide URL ein. </p>`;
  }
  else if (json.status == 422){
    out.innerHTML = `<p id=text >Fehler, bitte gib eine validen Code ein. Er darf keine lücken enthalten.</p>`;
  }
  else if (json.status == 418){
    out.innerHTML = `<p id=text >Fehler, bitte gib eine validen Code ein. Er darf nur A-z und 0-9 enthalten.</p>`;
  }
  else if (json.status == 200){
    console.log(json);
    const link = json.url;
    out.innerHTML = `<a href="http://${link}" target="_blank">${link}</a>`;
    copybutton.innerHTML = `<button id=copybutton2 class=copybutton onclick="copy('${link}')">Kopieren</button>`;
  }
  else{
    out.innerHTML = `<p id=text >${json.status}: Es ist ein Fehler aufgetreten, bitte versuche es erneut. </p>`;
  }
}


function copy(resp) {
  var $tempInput = document.createElement('INPUT');
  $body.appendChild($tempInput);
  $tempInput.setAttribute('value', resp)
  $tempInput.select();
  document.execCommand('copy');
  $body.removeChild($tempInput);
  copybutton2.setAttribute('class', 'copybuttonb');
  copybutton2.innerHTML = 'URL Kopiert!';
}


var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
} 

var coll = document.getElementsByClassName("collapsible2");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active2");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
} 

function button() {
    shorten(input.value)
}
function button3() {
    
    shorten2(input.value, document.getElementById('custom-input2').value)
}

button2.addEventListener('click', async () => {   
    out2.innerHTML = `<input type="text" id="custom-input2" class=show placeholder="custom code">`;
    document.getElementById("shorten-button").onclick = button3;
    
});











