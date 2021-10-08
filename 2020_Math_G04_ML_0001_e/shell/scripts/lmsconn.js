var API_obj = null, datamodel = null, lresult, i_time, isexiting, v_lessonstat, AICC_SID, AICC_URL, AICC_DATA = new Object(), hasLS = 0;
v_lessonstat = ["incomplete", "completed", "failed", "passed"]
var c_dmn = document.domain.split(".")

function f_lmsdatatype() {
	datamodel = new Object();
	switch (v_lmsmode) {
		case "1_2":
			datamodel.lesson_status = "cmi.core.lesson_status"
			datamodel.student_name = "cmi.core.student_name"
			datamodel.student_id = "cmi.core.student_id"
			datamodel.suspend_data = "cmi.suspend_data"
			datamodel.score = "cmi.core.score.raw"
			datamodel.minscore = "cmi.core.score.min"
			datamodel.maxscore = "cmi.core.score.max"
			datamodel.lesson_location = "cmi.core.lesson_location"
			datamodel.session_time = "cmi.core.session_time"
			datamodel.interactions = "cmi.interactions"
			break;
		case "1_3":
			datamodel.lesson_status = "cmi.completion_status"
			datamodel.student_name = "cmi.learner_name"
			datamodel.student_id = "cmi.learner_id"
			datamodel.suspend_data = "cmi.suspend_data"
			datamodel.score = "cmi.score.raw"
			datamodel.minscore = "cmi.score.min"
			datamodel.maxscore = "cmi.score.max"
			datamodel.scorescaled = "cmi.score.scaled"
			datamodel.asmnt_status = "cmi.success_status"
			datamodel.lesson_location = "cmi.location"
			datamodel.session_time = "cmi.session_time"
			datamodel.progress = "cmi.progress_measure"
			datamodel.interactions = "cmi.interactions"
			datamodel.objectives = "cmi.objectives"
			datamodel.launch_data = "cmi.launch_data"
			break;
		case "AICC":
			datamodel.lesson_status = "lesson_status"
			datamodel.student_name = "student_name"
			datamodel.student_id = "student_id"
			datamodel.suspend_data = "core_lesson"
			datamodel.score = "score"
			datamodel.minscore = ""
			datamodel.maxscore = ""
			datamodel.lesson_location = "lesson_location"
			datamodel.session_time = "time"
			break;
		case "xAPI":
			datamodel.lesson_status = v_lessonstat[0]		//completion_status
			datamodel.student_name = ""		//learner_name
			datamodel.language = ""			//language
			datamodel.student_id = ""			//learner_id
			datamodel.suspend_data = ""		//suspend_data
			datamodel.score = ""				//score.raw
			datamodel.minscore = ""			//score.min
			datamodel.maxscore = ""			//score.max
			datamodel.scorescaled = ""		//score.scaled
			datamodel.asmnt_status = ""		//success_status
			datamodel.lesson_location = ""	//location
			datamodel.session_time = ""		//session_time
			datamodel.progress = ""			//progress_measure
			datamodel.interactions = "cmi.interactions"		//interactions
			break;
	}
	try {
		if (!v_clientinfo.islocal && typeof (Storage) !== "undefined" && localStorage) hasLS = 1
	} catch (e) {
		f_log(e)
	}
}

function f_lmsaction(cmd, param, val) {
	if (v_clientinfo == null || v_clientinfo == undefined) {
		f_devicecheck(true)
	}
	if (cmd == "finish") {
		if ('speechSynthesis' in window) {
			window.speechSynthesis.pause()
			window.speechSynthesis.cancel()
		}
	}
	if (v_clientinfo.pmod || v_clientinfo.edmode == 1) return

	if (!datamodel) f_lmsdatatype()
	// if(v_lmsmode=="1_2" || v_lmsmode=="1_3"){
	// 	f_getAPI(window)
	// }else if(!API_obj){
	// 	API_obj=true;
	// }
	API_obj = true;
	var qrstr = document.location.href
	var pos = qrstr.indexOf("?")
	qrstr = qrstr.substr(pos)
	if (API_obj) {

		switch (cmd) {
			case "start":
				i_time = new Date().getTime()
				isexiting = 0
				if (v_lmsmode == "1_2") {
					// lresult=API_obj.LMSInitialize("")
				} else if (v_lmsmode == "1_3") {
					lresult = API_obj.Initialize("")
				} else if (v_lmsmode == "AICC") {
					AICC_SID = getpropdata("AICC_SID", qrstr);
					AICC_URL = unescape(getpropdata("AICC_URL", qrstr));
					API_obj = getajax()
					if (API_obj != null) {
						var Params;
						Params = "command=GetParam&version=2.2&session_id=" + escape(AICC_SID);
						API_obj.open("POST", AICC_URL, false);
						API_obj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
						API_obj.send(Params);

						ac_data = API_obj.responseText.toLowerCase();
						AICC_DATA[datamodel.lesson_status] = getpropdata(datamodel.lesson_status, ac_data, "\r\n");
						AICC_DATA[datamodel.lesson_location] = getpropdata(datamodel.lesson_location, ac_data, "\r\n");
						AICC_DATA[datamodel.score] = getpropdata(datamodel.score, ac_data, "\r\n");
						AICC_DATA[datamodel.suspend_data] = getpropdata(datamodel.suspend_data, ac_data, "\r\n");
						AICC_DATA[datamodel.student_name] = getpropdata(datamodel.student_name, ac_data, "\r\n");
						AICC_DATA[datamodel.student_id] = getpropdata(datamodel.student_id, ac_data, "\r\n");
						AICC_DATA[datamodel.session_time] = "00:00:00"
						stdname = AICC_DATA[datamodel.student_name].split(" ");
						for (i = 0; i < stdname.length; i++) {
							stdname[i] = stdname[i].substr(0, 1).toUpperCase() + stdname[i].substr(1)
						}
						stdname = stdname.join(" ")

						stdname = stdname.replace(/'/gi, "@");
						stdname = stdname.replace(/\./gi, "$");
						AICC_DATA[datamodel.student_name] = stdname

						if (AICC_DATA[datamodel.lesson_status] == "n,a" || AICC_DATA[datamodel.lesson_status] == "not attempted" || AICC_DATA[datamodel.lesson_status] == "na" || AICC_DATA[datamodel.lesson_status] == "not attempted,ab-initio") {
							AICC_DATA[datamodel.lesson_status] = "incomplete";
						}
					}
				} else if (v_lmsmode == "xAPI") {
					contentStarted(_course.lcID);
					console.log("content started")
					var lresult = getProgress(_course.lcID);
					suspenData = ""
					lresult.then(result => {

						// const { foo, bar } = result.data;
						console.log("getvalue=" + JSON.stringify(result))
						//
						if (!result) {
							result = ""
						}
						suspenData = result["state_data"]
						f_datarcvd()
						// rest of script
					}, error => {
						// const { foo, bar } = result.data;
						console.log(error)
						f_datarcvd()
						// rest of script
					});

				}

				f_geterror("INITIALIZE", lresult)

				if (v_lmsmode != "xAPI" && _course.keepAlive) setInterval(f_keepalive, 1000 * 60 * 5);

				if (v_lmsmode == "1_2" || v_lmsmode == "1_3") {
					var c_stat = f_getvalue("lesson_status")
					if (c_stat == "not attempted" || c_stat == "unknown") {
						f_setvalue("lesson_status", "incomplete")
					}
					/*if(v_lmsmode=="1_3"){
						f_setvalue("minscore",0)
						f_setvalue("maxscore",100)
					}*/
				}
				break;
			case "getvalue":
				return f_getvalue(param);
				break;
			case "setvalue":
				f_setvalue(param, val)
				break;
			case "saveinteractions":
				f_setIntData(param)
				break;
			case "time":
				f_settime();
				break;
			case "commit":
				f_commit();
				break;
			case "finish":
				if (!isexiting) {
					if (v_lmsmode == "xAPI") {
						// x_updcoursestat("suspended")
						contentFinished(_course.lcID, suspenData);
						console.log("contentFinished")
					} else {
						// f_settime()
						// f_commit()
						// f_finish()

					}
					try {
						window.opener.exitmode = 1;
						window.opener.close();
					} catch (e) {
					}
				}
				isexiting = 1
				break;
		}
	} else {
		f_log("LMS could not be connected.")
		return ""
	}
}
function f_getvalue(prop) {

	var lprop = datamodel[prop]
	if (!lprop) lprop = prop
	if (v_lmsmode == "1_2") {
		//lresult=API_obj.LMSGetValue(lprop);
	} else if (v_lmsmode == "1_3") {
		lresult = API_obj.GetValue(lprop);
	} else if (v_lmsmode == "AICC") {
		lresult = AICC_DATA[lprop];
	} else if (v_lmsmode == "xAPI") {
		lresult = datamodel[prop]
		lprop = prop
		if (prop == "suspend_data") {

			lresult = suspenData;

		}
		else {
			lresult = " "
		}
	}
	console.log("value=" + lresult);
	if (prop == "lesson_status" && lresult) lresult = lresult.toLowerCase()

	f_geterror("GET(" + lprop + ")", lresult, lresult)
	return lresult
}
var suspenData;
function f_setvalue(prop, val) {
	var lprop = datamodel[prop]
	if (!lprop) lprop = prop
	if (v_lmsmode == "1_2") {
		//lresult=API_obj.LMSSetValue(lprop, val);

	} else if (v_lmsmode == "1_3") {
		lresult = API_obj.SetValue(lprop, val);
	} else if (v_lmsmode == "AICC") {
		AICC_DATA[lprop] = val;
	} else if (v_lmsmode == "xAPI") {
		// 	var lcomp = datamodel.lesson_status
		// 	datamodel[prop] = val
		// 	x_saveState()
		// 	if (lcomp != datamodel.lesson_status && datamodel.lesson_status == v_lessonstat[1]) x_updcoursestat(v_lessonstat[1])
		// 	lprop = prop
		if (prop == "suspend_data") {
			suspenData = val;
			//setProgress(_course.lcID, val);
			var json_data = {"state_data":val }
			setProgress(_course.lcID, json_data);
			console.log("setvalue=" + JSON.stringify(json_data))
		}
	}
	if (!v_debugmode && (lprop.indexOf(".correct_responses") != -1 || lprop.indexOf(".result") != -1)) {
		val = ""
	}
	f_geterror("SET(" + lprop + ")", lresult, val)
}
function f_getdatastore(id) {
	var iID, i, len
	len = f_getvalue("adl.data._count");
	for (i = 0; i < len; i++) {
		iID = f_getvalue("adl.data." + i + ".id");
		if (iID == id) return "adl.data." + i;
	}
	return -1
}
function f_getstorevalue(id) {
	var ref = f_getdatastore(id)
	if (ref != -1) {
		return f_getvalue(ref + ".store")
	} else {
		return ""
	}
}
function f_setstorevalue(id, val) {
	var ref = f_getdatastore(id)
	if (ref != -1) f_setvalue(ref + ".store", val)
}

function f_getObjective(id) {
	var iID, i, len
	len = f_getvalue(datamodel["objectives"] + "._count");

	for (i = 0; i < len; i++) {
		iID = f_getvalue(datamodel["objectives"] + "." + i + ".id");
		if (iID == id) return datamodel["objectives"] + "." + i;
	}
	f_setvalue(datamodel["objectives"] + "." + i + ".id", id)
	return datamodel["objectives"] + "." + i
}
function f_getIntRef(id) {
	var iID, i, len
	len = f_getvalue(datamodel["interactions"] + "._count");

	for (i = 0; i < len; i++) {
		iID = f_getvalue(datamodel["interactions"] + "." + i + ".id");
		if (iID == id) return [datamodel["interactions"] + "." + i];
	}
	return [-1, len]
}
function f_getIntData(id) {
	if (v_lmsmode != "1_3") return "NA"
	var iref = f_getIntRef(id)
	if (iref[0] == -1) return -1
	iref = iref[0]
	var iobj = new Object()
	iobj.qid = f_getvalue(iref + ".id")
	iobj.qtype = f_getvalue(iref + ".type")
	iobj.qresult = f_getvalue(iref + ".result")
	iobj.qtime = f_getvalue(iref + ".latency")

	iobj.cresp = []
	var len, i, c_ans
	len = f_getvalue(iref + ".correct_responses._count")
	for (i = 0; i < len; i++) {
		c_ans = f_getvalue(iref + ".correct_responses." + i + ".pattern")
		iobj.cresp.push(c_ans);
	}
	iobj.lresp = f_getvalue(iref + ".learner_response")
	iobj.quest = f_getvalue(iref + ".description")
	return iobj
}

function f_setIntData(i_obj) {
	if (v_lmsmode == "AICC") return "NA"
	var typarr = ["true-false", "choice", "fill-in", "long-fill-in", "matching", "performance", "sequencing", "likert", "numeric", "other"]
	qtype = typarr[i_obj.qtype]
	qtype = "fill-in"
	var suc = (i_obj.qres == 1) ? true : false
	i_obj.qres = (i_obj.qres == 1) ? "correct" : (v_lmsmode == "1_2") ? "wrong" : "incorrect"
	if (v_lmsmode == "xAPI") {
		var qobj = {
			id: datamodel.base.id + "/" + _course.moduleID + "/" + _course.pageID + "#" + i_obj.qid,
			definition: {
				type: "http://adlnet.gov/expapi/activities/cmi.interaction",
				description: {
					"en-US": i_obj.quest
				},
				interactionType: qtype,
				correctResponsesPattern: i_obj.cresp
			}
		};
		var resp = [];
		for (var i = 0; i < i_obj.lresp.length; i++) {
			resp.push({ id: "Option-" + (i + 1), description: { "en-US": i_obj.lresp[i] } })
		}
		qobj.definition["choices"] = resp
		var stmt = {
			verb: x_getverb("answered"),
			object: qobj,
			result: {
				score: {
					raw: i_obj.score
				},
				response: i_obj.lresp.join(","),
				success: suc
			},
			context: x_getcontext()
		};
		x_sendData(stmt, _course.moduleID + _course.pageID + i_obj.qid)
	} else {
		var iref = f_getIntRef(i_obj.qid)
		if (iref[0] == -1) iref = datamodel["interactions"] + "." + iref[1];
		f_setvalue(iref + ".id", i_obj.qid)
		f_setvalue(iref + ".type", qtype)
		f_setvalue(iref + ".result", i_obj.qres)
		var ltime = f_formattime(i_obj.qtime)
		f_setvalue(iref + ".latency", ltime)
		f_setvalue(iref + ".objectives.0.id", i_obj.qobj.split(" ").join("_"))

		i_obj.correct_responses = []
		var len, i, c_ans
		len = f_getvalue(iref + ".correct_responses._count")
		//for (i=0; i < i_obj.cresp.length; i++){
		f_setvalue(iref + ".correct_responses.0.pattern", i_obj.cresp.join("<OPTION>"))
		//}
		if (v_lmsmode == "1_3") {
			f_setvalue(iref + ".learner_response", i_obj.lresp.join("<OPTION>"))
		} else {
			f_setvalue(iref + ".student_response", i_obj.lresp.join("<OPTION>"))
		}
		f_setvalue(iref + ".description", i_obj.quest)
	}
}
function f_commit() {
	if (v_lmsmode == "1_2") {
		lresult = API_obj.LMSCommit("")
	} else if (v_lmsmode == "1_3") {
		lresult = API_obj.Commit("")
	} else if (v_lmsmode == "AICC") {
		lmsdata = "[CORE]\n"
		lmsdata += datamodel.lesson_status + "=" + AICC_DATA[datamodel.lesson_status] + "\n"
		lmsdata += datamodel.lesson_location + "=" + AICC_DATA[datamodel.lesson_location] + "\n"
		lmsdata += datamodel.score + "=" + AICC_DATA[datamodel.score] + "\n"
		f_settime()
		lmsdata += datamodel.session_time + "=" + AICC_DATA[datamodel.session_time] + "\n"
		lmsdata += "[CORE_LESSON]\n"
		lmsdata += datamodel.suspend_data + "=" + AICC_DATA[datamodel.suspend_data] + "\n"

		var Path = "command=PutParam&version=2.2&session_id=" + escape(AICC_SID) + "&AICC_DATA=" + lmsdata;
		API_obj = getajax()
		API_obj.open("POST", AICC_URL, true);
		API_obj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		API_obj.send(Path);
		lresult = API_obj.responseText;
	}
	f_geterror("COMMIT", lresult)
}

function formatstring(str) {
	str = str.replace(/\W/g, "_");
	return newValue;
}
function f_finish() {
	if (v_lmsmode == "1_2") {
		f_setvalue("cmi.core.exit", "suspend")
		lresult = API_obj.LMSFinish("")
	} else if (v_lmsmode == "1_3") {
		f_setvalue("cmi.exit", "suspend")
		lresult = API_obj.Terminate("")
	} else if (v_lmsmode == "AICC") {
		lresult = true
	} else if (v_lmsmode == "xAPI") {
		//xapi.terminateAttempt();
	}
	f_geterror("FINISH", lresult)
}

function f_findAPI(win) {
	var tries = 0, api = null
	while (true) {
		if (v_lmsmode == "1_2") {
			api = win.API
		} else {
			api = win.API_1484_11
		}
		if (api != null || !win.parent || win.parent == win || tries > 100) {
			break;
		}
		tries++;
		win = win.parent;
	}
	return api
}

function f_getAPI(win) {
	if (!API_obj && win != null) {
		try {
			API_obj = f_findAPI(win);
			if (!API_obj && win.parent && win.parent != win) API_obj = f_findAPI(win.parent);
			if (!API_obj && win.opener) API_obj = f_findAPI(win.opener);
			if (!API_obj && (parent.window != null) && (parent.window.opener != null) && (typeof (parent.window.opener) != "undefined")) API_obj = f_findAPI(parent.window.opener);
			if (!API_obj && win.top.opener) API_obj = f_findAPI(win.top.opener);
			if (!API_obj && win.top.opener && win.top.opener.document) API_obj = f_findAPI(win.top.opener.document);
		} catch (e) {
			if (e.code == 18 && c_dmn.length > 2) {
				c_dmn.shift()
				var dmn = c_dmn.join(".")
				document.domain = dmn
				f_getAPI(win)
				return
			}
			f_log(e)
		}
		if (API_obj != null) {
			f_log("LMS API Found!!!")
		} else {
			f_log("LMS connection failure. Your progress will not be tracked.")
		}
	}
}

function f_settime(bool) {
	var c_time = new Date().getTime()
	var t_time = (c_time - i_time) / 1000
	t_time = f_formattime(t_time)
	//if(v_lmsmode!="AICC") t_time+=".00"
	if (bool) return t_time
	f_setvalue("session_time", t_time)
}
function f_formattime(t_time) {
	var hh, mm, ss
	ss = parseInt(t_time % 60, 10)
	mm = parseInt(t_time / 60, 10)
	hh = parseInt(mm / 60, 10)
	mm = parseInt(mm % 60, 10)
	if (hh < 10) hh = "0" + hh
	if (mm < 10) mm = "0" + mm
	if (ss < 10) ss = "0" + ss
	if (v_lmsmode == "1_3" || v_lmsmode == "xAPI") {
		t_time = "PT" + hh + "H" + mm + "M" + ss + "S"
	} else {
		t_time = hh + ":" + mm + ":" + ss
	}
	return t_time
}
function f_geterror(cmd, res, val) {
	return
	if ((res == "false" || res == false || res == 0) && v_lmsmode != "xAPI") {
		var err, err_cd
		if (v_lmsmode == "1_2") {
			err_cd = API_obj.LMSGetLastError().toString();
			err = API_obj.LMSGetErrorString(err_cd);
		} if (v_lmsmode == "1_3") {
			err_cd = API_obj.GetLastError().toString();
			err = API_obj.GetErrorString(err_cd);
		}
		if (err_cd != 0) {
			err = "LMS: " + cmd + ", RESULT=Failed, REASON=" + err
		}
	} else {
		err = "LMS: " + cmd + ", RESULT=Success"
	}
	if (val != null && val != undefined) err += ", VALUE=" + val
	f_log(err)
}
function f_keepalive() {
	f_lmsaction("commit")
}
function getajax() {
	var xhr;
	if (window.ActiveXObject) {
		try {
			xhr = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
				xhr = false;
			}
		}
	} else if (window.XMLHttpRequest) {
		try {
			xhr = new XMLHttpRequest();
		} catch (e) {
			xhr = false;
		}
	}
	return xhr;
}

function getpropdata(str, prop, delim, equal) {
	if (prop == null) prop = document.location.search
	if (prop.indexOf("?") == 0) prop = prop.substr(1);
	if (delim == null) delim = "&"
	if (equal == null) equal = "="

	if (prop.indexOf(str) != -1) {
		var ary1 = prop.split(delim);
		for (var i = 0; i < ary1.length; i++) {
			var ary2 = ary1[i].split(equal)
			if (ary2[0] == str) {
				return ary1[i].substring((ary1[i].indexOf(equal) + 1), ary1[i].length);
			}
		}
	}
	return "";
}

//-------------------------------xAPI helper functions-------------------------------
function x_sendData(stmt, actID) {
	return
	if (datamodel.connected && navigator.onLine) {
		var res = API_obj.sendStatement(stmt, { callback: x_LMSresp })
	} else {
		if (hasLS) {
			var lstmt = localStorage[_course.lcID + "_stmnts"]
			if (lstmt == "undefined" || lstmt == undefined) lstmt = ","
			if (lstmt.indexOf("," + actID + ",") == -1) lstmt += actID + ","
			localStorage[_course.lcID + "_stmnts"] = lstmt
			localStorage[_course.lcID + "_" + actID] = JSON.stringify(stmt)
		}
	}

}
function x_LMSresp(err, prm1, prm2) {
	return
	var x = "1"
}
function x_saveState() {
	return
	var dt = {
		suspend_data: datamodel.suspend_data,
		completion_status: datamodel.lesson_status,
		asmnt_status: datamodel.asmnt_status,
		score: datamodel.score
	};
	if (datamodel.connected && navigator.onLine) {
		API_obj.setState("resume", dt, { contentType: "application/json", overwriteJSON: false, callback: function () { } }, datamodel.base.id);
	}
	if (hasLS) localStorage[_course.lcID + "_crsdata"] = JSON.stringify(dt)
}
function x_getState() {
	return
	if (hasLS) {
		var lcdata = localStorage[_course.lcID + "_crsdata"]
		if (lcdata) {
			var obj = { contents: JSON.parse(lcdata) }
			var stmt = localStorage[_course.lcID + "_stmnts"]
			datamodel.statements = {}
			if (stmt) {
				stmt = stmt.split(",")
				stmt.shift()
				stmt.pop()
				for (var i = 0; i < stmt.length; i++) {
					datamodel.statements[stmt[i]] = JSON.parse(localStorage[_course.lcID + "_" + stmt[i]])
				}
			}
		}
	}
	if (datamodel.connected && navigator.onLine) {
		API_obj.getState("resume", { callback: x_fromLMS })
	} else {
		x_fromLMS(null, null)
	}
}
function x_getverb(vrb) {
	return
	return { id: "http://adlnet.gov/expapi/verbs/" + vrb, display: { "en-US": vrb } };
}

function x_getcontext() {
	return
	var ctx = { contextActivities: { grouping: { id: datamodel.base.id } } };
	ctx.contextActivities.parent = { id: datamodel.base.id };
	return ctx
}

function x_fromLMS(err, obj) {
	return
	if (obj && err === null && obj.contents !== "") {
		var data = obj.contents;
		datamodel.suspend_data = data.suspend_data;
		var cs = data.completion_status
		datamodel.lesson_status = (cs == null || cs == "") ? v_lessonstat[0] : cs;
		datamodel.asmnt_status = data.asmnt_status;
		datamodel.score = data.score;
		var bool = 0, pos
		if (hasLS) {
			var stmt = localStorage[_course.lcID + "_stmnts"]
			if (stmt) {
				stmt = stmt.split(",")
				for (i in datamodel.statements) {
					x_sendData(datamodel.statements[i])
					localStorage.removeItem(_course.lcID + "_" + i)
					pos = stmt.indexOf(i)
					if (pos != -1) stmt.splice(pos, 1)
					bool = 1
				}
				if (bool) {
					localStorage[_course.lcID + "_stmnts"] = stmt.join(",")
					var stat = localStorage[_course.lcID + "_crsdata"]
					if (stat != "undefined") {
						stat = JSON.parse(stat)
						datamodel.suspend_data = stat.suspend_data;
						var cs = stat.completion_status
						datamodel.lesson_status = (cs == null || cs == "") ? v_lessonstat[0] : cs;
						datamodel.asmnt_status = stat.asmnt_status;
						datamodel.score = stat.score;
					}
				}
			}
		}
		x_updcoursestat("resumed")
	} else {
		x_updcoursestat("initialized")
	}
	f_datarcvd()
}

function x_updcoursestat(vrb) {
	return
	var stmt = {
		verb: x_getverb(vrb),
		object: datamodel.base,
		result: {
			completion: (datamodel.lesson_status == v_lessonstat[1]) ? true : false,
			duration: f_settime(true)
		},
		context: x_getcontext()
	};
	x_sendData(stmt, "course")
}
function x_sendpagestmnt(typ, vrb) {
	return
	var pgobj = {
		id: datamodel.base.id + "/" + _course.moduleID + "/" + _course.pageID,
		definition: {
			type: "http://adlnet.gov/expapi/activities/" + typ,
			name: {
				"en-US": _course.pageTitle
			},
			description: {
				"en-US": vrb + " Page: " + _course.pageTitle + " from Module:" + _course.moduleTitle + "  of Course: " + _course.courseTitle
			}
		}
	};
	var stmt = {
		verb: x_getverb(vrb),
		object: pgobj,
		context: x_getcontext()
	};
	x_sendData(stmt, _course.moduleID + _course.pageID)
}

function x_sendactvstmnt(typ, vrb, actid) {
	return
	var pgobj = {
		id: datamodel.base.id + "/" + _course.moduleID + "/" + _course.pageID + "#" + actid,
		definition: {
			type: "http://adlnet.gov/expapi/activities/" + typ,
			name: {
				"en-US": _course.pageTitle
			},
			description: {
				"en-US": vrb + "Activity: " + actid + " Page: " + _course.pageTitle + " from Module:" + _course.moduleTitle
			}
		}
	};
	var stmt = {
		verb: x_getverb(vrb),
		object: pgobj,
		context: x_getcontext()
	};
	x_sendData(stmt, _course.moduleID + _course.pageID + actid)
}
function x_asmntinit() {
	return
	var pgobj = {
		id: datamodel.base.id + "/" + _course.moduleID,
		definition: {
			type: "http://adlnet.gov/expapi/activities/assessment",
			name: {
				"en-US": _course.moduleTitle
			},
			description: {
				"en-US": "Assessment Module: " + _course.moduleTitle + " initialized"
			}
		}
	};
	var stmt = {
		verb: x_getverb("initialized"),
		object: pgobj,
		context: x_getcontext()
	};
	x_sendData(stmt, _course.moduleID)
}
function x_asmntupd() {
	return
	var pgobj = {
		id: datamodel.base.id + "/" + _course.moduleID,
		definition: {
			type: "http://adlnet.gov/expapi/activities/assessment",
			name: {
				"en-US": _course.moduleTitle
			},
			description: {
				"en-US": datamodel.asmnt_status + " Assessment Module: " + _course.moduleTitle
			}
		}
	};
	var stmt = {
		verb: x_getverb(datamodel.lesson_status),
		object: pgobj,
		result: {
			score: {
				scaled: parseFloat(datamodel.scorescaled),
				raw: parseInt(datamodel.score, 10),
				min: 0,
				max: 100
			},
			completion: (datamodel.lesson_status == "completed") ? true : false,
			success: (datamodel.asmnt_status == "passed") ? true : false,
			duration: f_settime(true)
		},
		context: x_getcontext()
	};
	x_sendData(stmt, _course.moduleID)
}
function x_simulation(objid, score, b_success) {
	return
	var pgobj = {
		id: datamodel.base.id + "/" + _course.moduleID + "/" + _course.pageID + "/" + objid,
		definition: {
			type: "http://adlnet.gov/expapi/activities/simulation",
			name: {
				"en-US": _course.moduleTitle
			},
			description: {
				"en-US": "Completed simulation in module '" + _course.moduleTitle + "' on page '" + _course.pageTitle + "'"
			}
		}
	};
	var stmt = {
		verb: x_getverb("scored"),
		object: pgobj,
		result: {
			score: {
				scaled: parseFloat(score / 100),
				raw: parseInt(score, 10),
				min: 0,
				max: 100
			},
			completion: true,
			success: b_success,
		},
		context: x_getcontext()
	};
	x_sendData(stmt, _course.moduleID)
}