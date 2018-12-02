// For todays date;
Date.prototype.today = function () {
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

// For the time now
Date.prototype.timeNow = function () {
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
}

function loadDataTZK(url, id){
  let origin = 'https://allorigins.ml/get?url=' +
  encodeURIComponent(url) +
  'callback=?';
  $.get(origin, function(response){
    var array = response.contents.match(/Page [0-9]+/g);
    console.log(response.contents);
    //var num = array.length;
    //var lastUpdate = array[num - 1].match(/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}/)[0];
    //updateChapterField(id,num,lastUpdate);
  });
}

function loadDataRROld(url, id){
  console.log('loading ' + url + '.....');
  let array = null;
  let array2 = null;
  let num = null;
  let lastUpdate = null;
  let latest = null;
  let origin = 'https://allorigins.ml/get?url=' +
  encodeURIComponent(url) +
  'callback=?';
  $.get(origin, function(response){
    if(response != null){
	//console.log('No response from ' + url);
	console.log(response.contents);
    }else{
    
    array = response.contents.match(/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}\<\/time> ago/g);
    array2 = response.contents.match(/\/chapter\/.+\/.+">/g);
    newUrl = url + array2[array2.length-1];
    newUrl = newUrl.substring(0,newUrl.length - 2);
    num = array.length;
    lastUpdate = array[num - 1].match(/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}/)[0];
    updateChapterField(id,num,newUrl);
    updateDateField(id + '/',lastUpdate);
    }
  });
}

function loadDataRR(url, id){
  console.log('loading ' + url + '.....');
  let array = null;
  let array2 = null;
  let num = null;
  let lastUpdate = null;
  let latest = null;
  let origin = 'https://allorigins.ml/get?url=' +
  encodeURIComponent(url) +
  'callback=?';
  $.get(origin, function(response){
    if(response == null){
	//console.log('No response from ' + url);
	console.log(response.contents);
    }else{
    
    array = response.contents.match(/(?<=\<time format=\"agoshort\" >).+(?=\<\/time>)/g);
    num = array.length - 1;
    lastUpdate = array[num] + 'ago';
    array2 = response.contents.match(/\/chapter\/.+\/.+(?=">)/g);
    newUrl = url + array2[array2.length-1];

    updateChapterField(id,num,newUrl);
    updateDateField(id + '/',lastUpdate);
    }
  });
}

function loadDataAO3(url, id){
  let origin = 'https://allorigins.ml/get?url=' +
  encodeURIComponent(url) +
  'callback=?';
  let array = null;
  let num = null;
  let lastUpdate = null;
  $.get(origin, function(response){
    array = response.contents.match(/Updated:.+"chapters"\>[0-9]{1,3}/);
    num = array[0].match(/"chapters"\>[0-9]{1,3}/)[0];
    num = num.match(/[0-9]{1,3}/)[0];
    lastUpdate = array[0].match(/[0-9]{1,2}-[0-9]{1,2}-[0-9]{1,4}/)[0]
    updateChapterField(id,num,url);
    updateDateField(id + '/',lastUpdate);
  });
}

function loadDataFP(url, id){
  var origin = 'https://allorigins.ml/get?url=' +
  encodeURIComponent(url) +
  'callback=?';
  $.get(origin, function(response){
    var array = response.contents.match(/<span class="xgray xcontrast_txt"\> == \$0 .+ Published:/);
    console.log(array);
    //var num = array.length;
    //var lastUpdate = array[num - 1].match(/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,4}/)[0];
    //updateChapterField(id,num + ' ' + lastUpdate);
  });
}

function loadDataGeneric(url, id, regex){
  var origin = 'https://allorigins.ml/get?url=' +
  encodeURIComponent(url) +
  'callback=?';
  $.get(origin, function(response){
    var array = response.contents.match(regex);
    var num = array[0];
    updateChapterField(id,num);
  });
}

function loadDataTest(url){
	let origin = 'https://allorigins.ml/get?url=' +
  	encodeURIComponent(url) +
  	'callback=?';
  	$.get(origin, function(response){
		if(response != null){
			console.log(response);	
		} else{
			console.log('returned null');
		}
	});
}

function updateChapterField(id,chapter,url){
  current = document.getElementById(id);
  current.innerHTML = 'Last Chapter: ' + chapter;
  current.href = url;
}

function updateDateField(id,date){
  current = document.getElementById(id);
  current.innerHTML = 'Last Updated: ' + date;
}

function updateField(id,content){
  current = document.getElementById(id);
  current.innerHTML = content;
}

function checking(){
  let novels = null;
  let id = null;
  novels = document.getElementsByClassName('subtitle');
  for(let i = 0; i < novels.length; i++){
    id = novels[i].id;
    if(id.indexOf('/') > -1){
      updateField(id,'Last Updated: Checking...');
    }
    else if(id != ''){
      updateField(id,'Last Chapter: Checking...');
    }
  }
}

function getDateTime(){
  var currentDateTime = new Date;
  return 'Last Check: ' + currentDateTime.today() + ' @ ' + currentDateTime.timeNow();
}


function checkUpdates(){
  checking();
  loadDataRR('http://royalroad.com/fiction/8894/everybody-loves-large-chests','ELLC');
  loadDataRR('http://royalroad.com/fiction/5701/savage-divinity', 'SD');
  loadDataRR('https://royalroad.com/fiction/15925/the-daily-grind', 'TDG');
  loadDataRR('https://www.royalroad.com/fiction/11209/the-legend-of-randidly-ghosthound', 'RG');
  loadDataRR('https://www.royalroad.com/fiction/16545/brimstone-fantasy','BF');
  loadDataAO3('http://archiveofourown.org/works/11478249/chapters/25740126','WTC');
}

window.onload = checkUpdates();
