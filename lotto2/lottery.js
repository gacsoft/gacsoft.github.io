var _fc = 0;
var _fr = 0;
var _sc = 0;
var _sr = 0;
var _index = -1;
var _editing = false;
var _newLotto = false;
var _selected = [];
var _pending = [];
var _history = [];
var _userData = [];
var _userOverride = [];
var _ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
var _gen = 1;	
var _weight = [1,1,1,1,1,1,2,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,7,7,8,8,9,9,10,11,12,13,14,15];
var prevViewedTab = null;
var _historyURL = "history.json";
var _loaded = false;

var getOrdinal = function(n) {
   var s=["th","st","nd","rd"],
       v=n%100;
   return n+(s[(v-20)%10]||s[v]||s[0]);
}

function pageLoad() {
	initForms();
	initTabs();
	initDeltaTab();
	setupList();

	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			_history = JSON.parse(this.responseText);
			if (checkStorage()) {
				userdata = localStorage.getItem("userlotto");
				if (userdata && userdata != "") 
					_userData = JSON.parse(userdata);
					
				userOverride = localStorage.getItem("useroverride");
				if (userOverride && userOverride != "") 
					_userOverride = JSON.parse(userOverride);											
			}	
			
			_loaded = true;
			setLotteryList();
		}
	};
	xmlhttp.open("GET", _historyURL, true);
	xmlhttp.send();
}

function checkStorage() {
	var mod = "23d34f345g34gf3aew";
	try {
		localStorage.setItem(mod, mod);
		localStorage.removeItem(mod);
		return true;
	} catch(e) {
		return false;
	}
}

function displayTab(id) {
	var idOfTabToDisplay = id; 

	if (id === "tab1") {
		showNew();		
		if (isEditable())
			enableEdit();
		else {
			disableEdit();
			enableButton("#subButton3");
			$("#subButton3").attr("href", 'javascript:showPopup()')	
				.html('<div class="button-text">HELP</div>');			
		}

	} else if (id === "tab2") {
		enableButton("#subButton1");
		$("#subButton1").attr("href", "javascript:initDeltaTab()")
			.html('<div class="button-text">RESET</div>');
		enableButton("#subButton2");
		$("#subButton2").attr("href", "javascript:generateDelta()")
			.attr('class', "menu-button button-BL button-red")
			.html('<div class="button-text">GENERATE</div>');
		enableButton("#subButton3");
		$("#subButton3").attr("href", 'javascript:displayTab("tab5")')	
			.html('<div class="button-text">HELP</div>');
		initDeltaTab();	
	} else if (id === "tab3") {
		enableButton("#subButton1");
		$("#subButton1").attr("href", 'javascript:displayTab("tab4")')
			.html('<div class="button-text-twoline">VIEW<br />DATA</div>');		
		enableButton("#subButton2");
		$("#subButton2").attr("href", "javascript:generateHistory()")
			.attr('class', "menu-button button-BL button-red")
			.html('<div class="button-text">GENERATE</div>');
		enableButton("#subButton3");
		$("#subButton3").attr("href", 'javascript:displayTab("tab6")')
			.html('<div class="button-text">HELP</div>');	
		document.getElementById('history-result').innerHTML = "";			
	} else if (id === "tab4") {
		var ucount = 0;
		if (_userData) ucount = _userData.length;
		var url;
		if (_index >= ucount) {
			url = _history[_index - ucount].url;
		} else {
			url = _userData[_index].url;
		}
		if ( url && url != "" ){
			enableButton("#subButton1");
			$("#subButton1").attr("href", 'javascript:window.open("' + url + '")')
			.html('<div class="button-text">UPDATE</div>');				
		} else {
			disableButton("#subButton1");
		}	
		enableButton("#subButton2");
		$("#subButton2").attr("href", 'javascript:displayTab("tab3")')
			.html('<div class="button-text">BACK</div>');			
		enableButton("#subButton3");
		$("#subButton3").attr("href", 'javascript:saveHistory()')
			.html('<div class="button-text">SAVE</div>');				
		viewHistory();
	
	} else if (id === "tab5") {
		disableButton("#subButton1");
		enableButton("#subButton2");
		$("#subButton2").attr("href", 'javascript:displayTab("tab2")')
			.html('<div class="button-text">BACK</div>');		
		disableButton("#subButton3");	

	} else if (id === "tab6") {
		disableButton("#subButton1");
		enableButton("#subButton2");
		$("#subButton2").attr("href", 'javascript:displayTab("tab3")')
			.html('<div class="button-text">BACK</div>');		
		disableButton("#subButton3");			
		
	} else if (id === "tab7") {
		disableButton("#subButton1");
		disableButton("#subButton2");	
		disableButton("#subButton3");	
	}	

if(prevViewedTab) {
  prevViewedTab.style.display = 'none';
}

var tabToDisplay = document.getElementById(id);
  tabToDisplay.style.display = 'block';
  prevViewedTab = tabToDisplay;
}

function enableButton(id){
	if (id == "#subButton1")
		$(id).attr('class', "menu-button button-BL");
	else if (id == "#subButton2")
		$(id).attr('class', "menu-button button-BM");
	else if (id == "#subButton3")
		$(id).attr('class', "menu-button button-BR");		
	else if (id == "#topButton2")
		$(id).attr('class', "menu-button button-TM")
		 .attr("href", 'javascript:displayTab("tab2")')
		 .html('<div class="button-text-twoline">DELTA<br />METHOD</div>');
	else if (id == "#topButton3")
		$(id).attr('class', "menu-button button-TR")
		 .attr("href", 'javascript:displayTab("tab3")')
		 .html('<div class="button-text-twoline">HISTORIC<br />DATA</div>');	
}

function disableButton(id) {
	if (id == "#subButton1")
		$(id).attr('class', "menu-button button-BL-off")
		 .attr("href", '#')
		 .html('<div class="button-text"></div>');
	else if (id == "#subButton2")
		$(id).attr('class', "menu-button button-BM-off")
		 .attr("href", '#')
		 .html('<div class="button-text"></div>');
	else if (id == "#subButton3")
		$(id).attr('class', "menu-button button-BR-off")
		 .attr("href", '#')
		 .html('<div class="button-text"></div>');		
	else if (id == "#topButton2")
		$(id).attr('class', "menu-button button-TM-off")
		 .attr("href", '#')
		 .html('<div class="button-text"></div>');	
	else if (id == "#topButton3")
		$(id).attr('class', "menu-button button-TR-off")
		 .attr("href", '#')
		 .html('<div class="button-text"></div>');	
}

function initTabs() {	
	var defaultTab = document.getElementsByClassName('default-tab')
	  if (defaultTab.length) {
		defaultTab[0].style.display = 'block';
		prevViewedTab = defaultTab[0];
	  }	
	  displayTab("tab1");
}	  

function initDeltaTab() {
	document.getElementById('delta-result').innerHTML = "";
	document.getElementById('result-text').innerHTML = "";		
	document.getElementById('delta-section').style.minHeight = (180+ ((+_fc)+(+_sc)) * 22 + Math.floor(((+_fc)+(+_sc)-1) / 6) * 60 ) + "px";	
	_selected = [];
	var newSelect = document.createElement('li');
	newSelect.innerHTML = '<label class="cell toright">Select the first number:</label> <select class ="cell" id="delta1" onChange="deltaChanged(1)"></select>';
	newSelect.className = 'table-li';
	deltaSegment = document.getElementById('deltaInner');
	deltaSegment.innerHTML = "";
	deltaSegment.appendChild(newSelect);
	var delta1 = document.getElementById('delta1');
	if (_sc > 0) {
		var max = Math.min( (+_sr) - ((+_sc) - 1) 
						  , (+_fr) - (((+_sc) + (+_fc)) - 1) ) ;
	} else {
		var max = (+_fr) - ((+_fc) - 1);
	}
	if (max > 15) max = 15;
	for (var i = 0; i <= max; i++) {
		var opt = document.createElement('option');
		opt.innerHTML = i == 0 ? "--" : i;
		opt.value = i == 0 ? 0 : i;
		delta1.appendChild(opt);	
	}	
	
	buildResult();

}

function newLotto() {
	if (!checkStorage()) {
		alert("You are browsing in Privacy/Incognito mode, your Local Storage is disabled or your browser does not support Local Storage. Custom settings cannot be saved.");
		return;
	}
	document.getElementById("selectNumbers").style.display = 'block';	
	enableNumberEditing();
	$("#nameEdit").val("");
	$("#countryEdit").val("");
	$("#urlEdit").val("");
	showEdit();
	_newLotto = true;	
}

function editLotto() {
	if (!isEditable()) return;
	enableNumberEditing();
	$("#nameEdit").val(_userData[_index].name);
	$("#countryEdit").val(_userData[_index].country);
	$("#urlEdit").val(_userData[_index].url);
	showEdit();
	_newLotto = false;	
}

function cancelNoSet() {
	showNew();
	document.getElementById("selectNumbers").style.display = 'none';	
	disableButton("#topButton2");
	disableButton("#topButton3");	
}

function cancelLotto() {
	disableNumberEditing();	
	cancelNoSet();
	setLotteryList();
}

function saveLotto() {
	showNew();
	disableNumberEditing();
	_fc = document.getElementById('firstCount').value;
	_fr = document.getElementById('firstRange').value;
	_sc = document.getElementById('secondCount').value;
	_sr = document.getElementById('secondRange').value;		
	
	if (!_newLotto) {
		_userData.splice(_index, 1);
	}
	
	var name = $("#nameEdit").val();
	if (name == "") name = "Unnamed Lottery";
	var cc = $("#countryEdit").val();
	if (cc == "") cc = "---";	
	var url = $("#urlEdit").val();
	
	var newItem = {
		"country" : cc,
		"name" : name,
		"url" : url,
		"format" : _fc + "x" + _fr + "." + _sc + "x" + _sr,
		"lastUpdate" : Date.now(),
		"numbers" : ""
	};
		
	_userData.unshift(newItem);
	setLotteryList();	
	store();
	document.getElementById("selectNumbers").style.display = 'none';	
	disableButton("#topButton2");
	disableButton("#topButton3");		
}

function isEditable() {
	if (_index == "-1") return false;
	var editable = true;
	if (!_userData) editable = false;
	if (_userData.length < 1) editable = false;
	if (_index > _userData.length - 1) editable = false;
	return editable;
}

function deleteLotto() {
	if (!isEditable()) return;
	
	_userData.splice(_index, 1);

	setLotteryList();
	store();
	document.getElementById("selectNumbers").style.display = 'none';	
	disableButton("#topButton2");
	disableButton("#topButton3");		
}

function enableEdit() { 
	enableButton("#subButton2");
	$("#subButton2").attr("href", "javascript:editLotto()");
	$("#subButton2").html('<div class="button-text">EDIT</div>');		
	enableButton("#subButton3");
	$("#subButton3").attr("href", "javascript:deleteLotto()");
	$("#subButton3").html('<div class="button-text">DELETE</div>');					
}

function disableEdit() {
	disableButton("#subButton2");
	//disableButton("#subButton3");
		enableButton("#subButton3");
		$("#subButton3").attr("href", 'javascript:showPopup()')	
			.html('<div class="button-text">HELP</div>');		
}

function showNew() {
	document.getElementById("nameHide").style.display = "none";
	enableButton("#subButton1");
	$("#subButton1").attr("href", "javascript:newLotto()");
	$("#subButton1").html('<div class="button-text">NEW</div>');		
	$("#subButton2").attr("href", "javascript:editLotto()");
	$("#subButton2").html('<div class="button-text">EDIT</div>');			
	$("#subButton3").attr("href", "javascript:deleteLotto()");
	$("#subButton3").html('<div class="button-text">DELETE</div>');		
}

function showEdit() {
	document.getElementById("nameHide").style.display = "block";
	$("#subButton1").attr("href", "javascript:saveLotto()");
	$("#subButton1").html('<div class="button-text">SAVE</div>');	
	enableButton("#subButton1");
	$("#subButton2").attr("href", "javascript:cancelLotto()");
	$("#subButton2").html('<div class="button-text">CANCEL</div>');		
	enableButton("#subButton2");
	disableButton("#subButton3");
}

function store() {
	if (checkStorage()) {
		localStorage.setItem("userlotto", JSON.stringify(_userData));
		localStorage.setItem("useroverride", JSON.stringify(_userOverride));
	}	
}

function generateHistory() {
	var h = getHistoryData(_index);
	var nums = h.numbers;
	if (!nums || nums == [] || nums.length == 0 || nums == "" || nums == " ") {
		document.getElementById('history-result').innerHTML = "Please add past winning numbers in the <b>View Data</b> menu before trying to generate numbers.";	
		document.getElementById('history-result-text').innerHTML = "";		
		return;
	}
	playLoadingAnim();	
	allResults = [];
	results = [];
	_selected = [];
	
	if ((+_sc) > 0) { 
		
		var arr = nums;	
		var firstNums = "";
		var secondNums = "";	
		for (var i = 0; i < arr.length; i++) {
			var n = arr[i].split(" ");
			var first = n.slice(0, _fc);
			var second = n.slice(_fc, n.length);				

			for (var j = 0; j < first.length; j++) {
				firstNums+= first[j] + " ";
			}
			for (var j = 0; j < second.length; j++) {
				secondNums+= second[j] + " ";
			}
		}		
		var firstCounts = getMostCommon(firstNums);
		var secondCounts = getMostCommon(secondNums);	
		for (var k = 0; k < 100; k++) {
			var index = 0;		
			results = [];
			for (var i = 0; i < (+_sc); i++) {
				if (Math.floor((Math.random() * 10) + 1) > 7) {
					results.push(secondCounts[index + 1].idx);
					index+=2;
				} else {
					results.push(secondCounts[index].idx);
					index++;
				}
			}
			index = 0;
			for (var i = 0; i < (+_fc); i++) {
				if (Math.floor((Math.random() * 10) + 1) > 7) {
					results.push(firstCounts[index + 1].idx);
					index+=2;
				} else {
					results.push(firstCounts[index].idx);
					index++;
				}
			}
			allResults.push(results);
		}
		
	} else {
		var counts = getMostCommon(nums.join());		
		for (var k = 0; k < 100; k++) {
			var index = 0;
			results = [];
			for (var i = 0; i < (+_fc); i++) {
				if (Math.floor((Math.random() * 10) + 1) > 7) {
					results.push(counts[index + 1].idx);
					index+=2;
				} else {
					results.push(counts[index].idx);
					index++;
				}
			}
			allResults.push(results);
		}
	}	

	buildFullResult(allResults, 1);
}

function getHistoryData(index) {
	var ucount = 0;
	if (_userData) ucount = _userData.length;
	var entry;
	
	if (index >= ucount) {
		entry = _history[index - ucount];
		var foundID = -1;
		item = _history[_index - ucount];
		if (_userOverride.length != 0) {			
			for (var i = 0; i < _userOverride.length; i++) {
				if (_userOverride[i].name == item.name) {
					foundID = i;
					break;
				}			
			}					
		}
		if (foundID != -1) {		
			return _userOverride[foundID];
		}
		
	} else {
		entry = _userData[index];	
	}
	return entry;	
	
	
	
	
var ucount = 0;
	if (_userData) ucount = _userData.length;
	
	var item;
	if (_index >= ucount) {
		var foundID = -1;
		item = _history[_index - ucount];
		if (_userOverride.length != 0) {			
			for (var i = 0; i < _userOverride.length; i++) {
				if (_userOverride[i].name == item.name) {
					foundID = i;
					break;
				}			
			}					
		}
		if (foundID == -1) {
			_userOverride.push( {"name": item.name, "lastUpdate": Date.now(), "numbers": numbers } );
		} else {
			_userOverride[foundID].lastUpdate = (Date.now() / 1000);
			_userOverride[foundID].numbers = numbers;
		}
		
	} else {
		var entry = _userData[_index];
		entry.lastUpdate =  (Date.now() / 1000);
		entry.numbers = numbers;
	}			
	
	
}

function getMostCommon(nums) {
	var counts = [];	
	for (var i = 1; i <= 100; i++) {
		var n = i;
		if (i < 10) n = "0" + n;		
		var count = (nums.match(new RegExp(n,"g")) || []).length;		
		counts.push ({idx: i, cnt: count});
	}	
	
	counts.sort(function(a, b) {
		return b.cnt - a.cnt;
	});
	return counts;
}

function playLoadingAnim() {
	document.getElementById("loadingAnim").style.display = "";	
	setTimeout(function() {
		document.getElementById("loadingAnim").style.display = "none";
	}, 1000);	
	
}

function generateDelta() {
	initDeltaTab();
	playLoadingAnim();
	document.getElementById('deltaInner').innerHTML = "";
	var results = [];
	
	
	for (var k = 0; k < 100; k++) {
		_selected = [];
		_gen = 1;
			
		for (var i = 1; i <=  (+_fc) + (+_sc); i++) {
			var len = _selected.length;

			if (i <= (+_sc)) {
				if (len > 0) {
					var max = Math.min( (+_sr) - _selected[len - 1] - ((+_sc) -  i)
									  , (+_fr) - _selected[len - 1] - ((+_fc) + (+_sc) - i));
				} else {
					var max = Math.min( (+_sr) - ((+_sc) - 1)
									  , (+_fr) - (((+_fc) + (+_sc)) - 1));
				}			
			} else {
				if (len > 0) {
					var max = (+_fr) - _selected[len - 1] - ((+_fc) + (+_sc) - i);
				} else {
					var max = (+_fr) - ((+_fc) - 1);
				}	
			}	
			if (isNaN(max) || max < 1) return; //sanity check to prevent infinite loop
			
			var rng = Math.floor((Math.random() * _weight.length));
			while (_weight[rng] > max) {
				rng = Math.floor((Math.random() * _weight.length));		
			}
			rng = _weight[rng];

			
			if (len > 0) {
				_selected.push((+_selected[len - 1]) + (+rng));					
			} else {
				_selected.push(rng);
			}
			
			

		}
		results.push(_selected);
	}
	
	buildFullResult(results, 0);
	
}

function generateAnimation() {
	disableButton("#subButton2");
	
	setTimeout(function() {
		enableButton("#subButton2");
	}, 2000);
}

function deltaChanged(id) {

	var select = document.getElementById("delta"+id);
	var value = select.value;
	select.disabled = true;
	
	var len = _selected.length;
	if (len - id + 2 != 1) return; //user somehow manipulated a locked control	
	
	if (len > 0) {
		_selected.push((+_selected[len - 1]) + (+value));					
	} else {
		_selected.push(value);
	}
	len++;
	buildResult();
		
	if (id < ((+_fc) + (+_sc))) {
		deltaSegment = document.getElementById('deltaInner');

		if (len - 1 > 10) {
			var ordinal = len - 1 + "th";
		} else {
			var ordinal = _ordinals[len - 1];
		}
		var nxt = id + 1;
		var newSelect = document.createElement('li');
		newSelect.className = 'table-li';
		newSelect.innerHTML =  '<label class="cell toright">Select the '+ ordinal +' delta: </label><select class="cell" id="delta' + nxt + '" onChange="deltaChanged(' + nxt + ')"></select>';
		deltaSegment.appendChild(newSelect);
		var delta = document.getElementById('delta' + nxt);
		if (nxt <= (+_sc)) {
			if (len > 0) {
				var max = Math.min( (+_sr) - _selected[len - 1] - ((+_sc) -  nxt)
								  , (+_fr) - _selected[len - 1] - ((+_fc) + (+_sc) - nxt));
			} else {
				var max = Math.min( (+_sr) - ((+_sc) - 1)
								  , (+_fr) - (((+_fc) + (+_sc)) - 1));
			}			
		} else {
			if (len > 0) {
				var max = (+_fr) - _selected[len - 1] - ((+_fc) + (+_sc) - nxt);
			} else {
				var max = (+_fr) - ((+_fc) - 1);
			}	
		}			
		if (max > 15) max = 15;				
		
		for (var i = 0; i <= max; i++) {
			var opt = document.createElement('option');
			opt.innerHTML = i == 0 ? "--" : i;
			opt.value = i == 0 ? 0 : i;
			delta.appendChild(opt);	
		}			
	}	
}

function viewHistory() {
	var ucount = 0;
	var entry = getHistoryData(_index);
	var url = entry.url;
	var numbers = entry.numbers;	
	
	$("#numbers").val(formatNumbers(numbers));	
	$("#lastUpdate").text("Last updated: " + new Date((entry.lastUpdate) * 1000).toDateString());
}

function formatNumbers(numbers) {
	var text = "";
	for (var i = 0; i<numbers.length; i++) {
		var nums = numbers[i].split(' ');
		for (var j = 0; j < nums.length; j++) {
			var num = nums[j];
			if ( num.length == 1 && (+num) < 10 ) num = "0" + num;
			if (j < nums.length -1)
				text += num + ' ';
			else
				text += num;
		}
		text += '\n';
	}
	return text;
}

function buildResult() {
	document.getElementById('result-aligner').style.bottom = Math.floor(((+_fc)+(+_sc)-1) / 6) * 70 
														   - Math.floor((_selected.length-1) / 6) * 70 - 20 + "px";
	var resultText = _selected.length + " out of " + ((+_fc) + (+_sc)) + " numbers selected<br/><br/>\n";
	document.getElementById('result-text').innerHTML = resultText;	
	var result = "";
	for (var i = 0; i < _selected.length; i++ ) {
		var ballType = "ball_gold.png";
		if (_sc > 0 && i < _sc ) {
			ballType = "ball_silver.png";
		}			
		result += '<div class="result-balls">'
			+ '<img src="images/' + ballType +'" width="60" height="60" alt="Results" />'
			+ '<div align="center" style="font-size: 36; color:white; position: absolute; height: 60px; width: 60px; left: 0; top: 0; line-height: 60px; vertical-align: middle; horizontal-align: middle; opacity: 1;">'
			+ _selected[i] + '</div>\n</div>';		
	}
	document.getElementById('result').innerHTML = result;	
	
}

function buildFullResult(results, which) {	
	var resultHTML = "";
	
	for (var k = 0; k < results.length; k++) {
		var result = results[k];
		resultHTML += '<div class="res-line"><span>Result ' + (k + 1) + '</span></div>';
		for (var i = 0; i < result.length; i++ ) {
			var ballType = "ball_gold.png";
			if (_sc > 0 && i < _sc ) {
				ballType = "ball_silver.png";
			}										
			resultHTML += '<div class="result-balls">'
				+ '<img src="images/' + ballType +'" width="60" height="60" alt="Results" />'
				+ '<div align="center" style="font-size: 36; color:white; position: absolute; height: 60px; width: 60px; left: 0; top: 0; line-height: 60px; vertical-align: middle; horizontal-align: middle; opacity: 1;">'
				+ result[i] + '</div>\n</div>';		
		}
	}
	if (which == 0) {
		document.getElementById('delta-result').innerHTML = resultHTML;
		document.getElementById('result-text').innerHTML = "";			
	
	} else if (which == 1) {
		document.getElementById('history-result').innerHTML = resultHTML;		
		document.getElementById('history-result-text').innerHTML = "";			
	} else return;	
}

function saveHistory() {
	var numbers = parseHistory();
		
	var ucount = 0;
	if (_userData) ucount = _userData.length;
	
	var item;
	if (_index >= ucount) {
		var foundID = -1;
		item = _history[_index - ucount];
		if (_userOverride.length != 0) {			
			for (var i = 0; i < _userOverride.length; i++) {
				if (_userOverride[i].name == item.name) {
					foundID = i;
					break;
				}			
			}					
		}
		if (foundID == -1) {
			_userOverride.push( {"name": item.name, "lastUpdate": Date.now(), "numbers": numbers } );
		} else {
			_userOverride[foundID].lastUpdate = (Date.now() / 1000);
			_userOverride[foundID].numbers = numbers;
		}
		
	} else {
		var entry = _userData[_index];
		entry.lastUpdate =  (Date.now() / 1000);
		entry.numbers = numbers;
	}		
	store();
	displayTab("tab3");
}

/* do not change or bad things happen */
function parse() {
	parseHistory();
}

function parseHistory() {
	var raw = $("#numbers").val();		
	if (!raw || raw == "") return [];
	var arr = raw.match(/[^\r\n]+/g);
	var results = new Array();
	var partial = new Array();

	var rfr = rex(_fr);	
	var rsr = ""; 
	if ((+_sc) > 0) {
		rsr = rex(_sr);	
	}	
	
	LineBegin:
	for (var i = 0; i < arr.length; i++) {
		var regString = "(\\b(" + rfr + ")(?!\\d)[ \\u2002\\u2003]*[\\t,-]?[ \\u2002\\u2003]*){" + _fc + "}";
		if ((+_sc) > 0) regString += "((?!\\d)[ \\u2002\\u2003\\t]*[\\t,-]?[ \\u2002\\u2003\\t]*(" + rsr + ")(?!\\d)){" + _sc + "}";
		var regexp = new RegExp(regString, "g");		
		var line = arr[i];
		var result = line.match(regexp);
		
		if (result != null) {
			results.push(cleanLine(result[0]));
		}	
		else if (result == null && (+_sc) > 0) {
			regexp = new RegExp("(\\b(" + rfr + ")(?!\\d)[ \\u2002\\u2003]*[\\t,-]?[ \\u2002\\u2003]*){" + _fc + "}", "g");
			var result = line.match(regexp);
			if (result == null)
				continue LineBegin;			
			for (var j = 1; j <= 5; j++) {
				if (arr[i+j]) {
					var readAhead = arr[i+j];
					var regexp2 = new RegExp("(\\b(" + rsr + ")(?!\\d)[ \\u2002\\u2003]*[\\t,-]?[ \\u2002\\u2003]*){" + _sc + "}", "g");
					var result2 = readAhead.match(regexp2);
					if (result2 != null) {
						results.push(cleanLine(result + " " + result2));
						i = i + j - 1;
						continue LineBegin;
					}
				}
			}
		}		
	}	
	
	if (!results || results == "") {
		$("#numbers").val("Extracting numbers was unsuccessful. Please make sure that you set the correct number format on the Game Rules page, or select another website to import from.");	
	} else {
		$("#numbers").val(formatNumbers(results));		
		return results;
	}
	return [];	
}

function cleanLine(line) {
	if (line == null) return "";
	var a = line.replace(/[^0-9]/g, " ");		
	var c = a.replace(/[ ]+/g, " ");
	return c;
}

function rex(num) {
	var n = (+num);
	if (n < 10)
		return "0?[1-" + n + "]";
	else if (n >= 10 && n <= 19) {
		var ones = n % 10;
		return "0?[1-9]|" + "1[0-" + ones + "]";
		}
	else {
		var tens = Math.floor(n / 10);
		var ones = n % 10;
		return "0?[1-9]|" + "[1-" + (tens - 1) + "]" + "\\d|" + tens + "[0-" + ones + "]";
	}
}

var show = function(id) {
	$(id).style.display ='block';
}
var hide = function(id) {
	$(id).style.display ='none';
}


function setupList() {
$(document).ready(function(){
  $('.clicker').click(function(){
    if($('ul').hasClass('closed')){    
   $('#ull').slideDown(100).show();
    $('#ull').addClass('open');
      $('#ull').removeClass('closed'); 
    }
    else
    {
      $('#ull').slideUp(100).fadeOut();
      $('#ull').addClass('closed');
      $('#ull').removeClass('open');
    } 
  });
  
  setupListItems();
  
  $('.options').click(function(){
	if($('ul').hasClass('closed')){
    
   $('#ull').slideDown(100).show();
    $('#ull').addClass('open');
      $('#ull').removeClass('closed'); 
    }
    else
    {
      $('#ull').slideUp(100).fadeOut();
      $('#ull').addClass('closed');
      $('#ull').removeClass('open');
    }   
  });
}); 
}

function setupListItems() {
  $('#ull li').click(function(){
  var className = $(this).attr('class');
  if (className == "0") {
	_index = -1;
	return;
  }
  $('.options').html($(this).html());
    $('#ull').slideUp(0).fadeOut();
      $('#ull').addClass('closed');
      $('#ull').removeClass('open');
       
	   _index = className - 1;
		lotteryChanged(_index);
  });
}


function setLotteryList() {
	var sel = document.getElementById('ull');
	$('#ull').empty();
	
	var ucount = 0;	
	if (_userData) ucount = _userData.length;	

	var opt = document.createElement('li');
	opt.innerHTML = '<div class="lname">' + "Select a game" + '</div>';
	opt.className = 0;
	sel.appendChild(opt);		

	for(i = 0; i < ucount; i++) {
		var opt = document.createElement('li');
		opt.innerHTML = '<div class="ccode">'+ _userData[i].country +'</div>' + '<div class="lname">' + _userData[i].name + '</div>';
		opt.className = i + 1;
		sel.appendChild(opt);	
	}		

	
	if (_history) {
		for(i = 0; i < _history.length; i++) {
			var opt = document.createElement('li');
			opt.innerHTML = '<div class="ccode">'+ _history[i].country +'</div>' + '<div class="lname">' + _history[i].name + '</div>';
			opt.className = i + ucount + 1;
			sel.appendChild(opt);	
		}	
	}
	
	initDeltaTab();
	setupListItems();
		
	$('.options').text("Select a game");	
	_index = -1;	
	disableEdit();
}

function initForms() {
	var firstCount = document.getElementById('firstCount');
	firstCount.innerHTML = "";
	for (var i = 1; i < 51; i++) {
		var opt = document.createElement('option');
		opt.innerHTML = i;
		opt.value = i;
		firstCount.appendChild(opt);	
	}
	var firstRange = document.getElementById('firstRange');
	firstRange.innerHTML = "";
	for (var i = 1; i < 101; i++) {
		var opt = document.createElement('option');
		opt.innerHTML = i;
		opt.value = i;
		firstRange.appendChild(opt);	
	}	
	var secondCount = document.getElementById('secondCount');
	secondCount.innerHTML = "";
	for (var i = 0; i < 11; i++) {
		var opt = document.createElement('option');
		opt.innerHTML = i;
		opt.value = i;
		secondCount.appendChild(opt);	
	}
	var secondRange = document.getElementById('secondRange');
	secondRange.innerHTML = "";
	for (var i = 0; i < 101; i++) {
		var opt = document.createElement('option');
		opt.innerHTML = i;
		opt.value = i;
		secondRange.appendChild(opt);	
	}		
}

function numbersChanged() {
	_fc = document.getElementById('firstCount').value;
	_fr = document.getElementById('firstRange').value;
	_sc = document.getElementById('secondCount').value;
	_sr = document.getElementById('secondRange').value;			 
	$('#secondRange').empty();
	var secondRange = document.getElementById('secondRange');
	for (var i = 0; i <= (+_fr); i++) {
		var opt = document.createElement('option');
		opt.innerHTML = i;
		opt.value = i;
		secondRange.appendChild(opt);	
	}	
	if ((+_sr) > (+_fr)) {
		_sr = (+_fr);
		document.getElementById('secondRange').value = _sr;	
	}
	setSelectNumbers(_fc,_fr,_sc,_sr);
	initDeltaTab();
}

function setSelectNumbers(firstCount, firstRange, secondCount, secondRange) {
	var firstCountSelect = document.getElementById('firstCount');
	var firstRangeSelect = document.getElementById('firstRange');
	var secondCountSelect = document.getElementById('secondCount');
	var secondRangeSelect = document.getElementById('secondRange');
	firstCountSelect.value = firstCount;
	firstRangeSelect.value = firstRange;
	secondCountSelect.value = secondCount;
	secondRangeSelect.value = secondRange;	
}

function lotteryChanged(index) {
	if (index == -1) return;
	if(!_loaded) return;
	initForms();
	
	var ucount = 0;
	var hcount = 0;
	if (_userData) ucount = _userData.length;
	if (_history) hcount = _history.length;
	var item = null;
	if (index >= ucount) {
		item = _history[index - ucount];
	} else {
		item = _userData[index];
	}	

	var format = item.format;     			 // format is
	var formatArr = format.split(".");       // firstCountxfirstRange.secondCountxsecondRange
	var first = formatArr[0];				 // ex. 6x45.1x20
	var second = formatArr[1];
	var firstArr = first.split("x");
	var secondArr = second.split("x");
	var firstCount = firstArr[0];	
	var firstRange = firstArr[1];
	var secondCount = secondArr[0];
	var secondRange = secondArr[1];			
	_fc = firstCount;
	_fr = firstRange;
	_sc = secondCount;
	_sr = secondRange;
	setSelectNumbers(firstCount, firstRange, secondCount, secondRange);
	initDeltaTab();		
	cancelNoSet();
	if (index >= ucount) {
		disableEdit();		
	} else {
		enableEdit();		
	}		
	enableButton("#topButton2");
	enableButton("#topButton3");	
	document.getElementById("selectNumbers").style.display = 'block';	
}

function disableNumberEditing() {
	$("#firstCount").prop( "disabled", true )
	.attr('class', "cell blue");
	$("#firstRange").prop( "disabled", true )
	.attr('class', "cell blue");
	$("#secondCount").prop( "disabled", true )
	.attr('class', "cell blue");
	$("#secondRange").prop( "disabled", true )
	.attr('class', "cell blue");
}

function enableNumberEditing() {
	$("#firstCount").prop( "disabled", false )
	.attr('class', "cell red" );
	$("#firstRange").prop( "disabled", false )
	.attr('class', "cell red" );
	$("#secondCount").prop( "disabled", false )
	.attr('class', "cell red" );
	$("#secondRange").prop( "disabled", false )
	.attr('class', "cell red" );
}

function hidePopup() {
	$('#popup1')[0].style.display = 'none'
}

function showPopup() {
	$('#popup1')[0].style.display = 'block'
}
