var gadgets=gadgets||{};gadgets.rpc=function(){var CALLBACK_NAME="__cb";var DEFAULT_NAME="";var FE_G2C_CHANNEL="__g2c_rpc";var FE_C2G_CHANNEL="__c2g_rpc";var services={};var iframePool=[];var relayUrl={};var useLegacyProtocol={};var authToken={};var callId=0;var callbacks={};var setup={};var sameDomain={};var params={};if(gadgets.util){params=gadgets.util.getUrlParameters()}authToken[".."]=params.rpctoken||params.ifpctok||0;function getRelayChannel(){return typeof window.postMessage==="function"?"wpm":typeof document.postMessage==="function"?"dpm":navigator.product==="Gecko"?"fe":"ifpc"}function setupChannel(){if(relayChannel==="dpm"||relayChannel==="wpm"){window.addEventListener("message",function(packet){process(gadgets.json.parse(packet.data))},false)}}var relayChannel=getRelayChannel();setupChannel();services[DEFAULT_NAME]=function(){throw new Error("Unknown RPC service: "+this.s)};services[CALLBACK_NAME]=function(callbackId,result){var callback=callbacks[callbackId];if(callback){delete callbacks[callbackId];callback(result)}};function setupFrame(frameId){if(setup[frameId]){return }if(relayChannel==="fe"){try{var frame=document.getElementById(frameId);frame[FE_G2C_CHANNEL]=function(args){process(gadgets.json.parse(args))}}catch(e){}}setup[frameId]=true}function encodeLegacyData(args){var stringify=gadgets.json.stringify;var argsEscaped=[];for(var i=0,j=args.length;i<j;++i){argsEscaped.push(encodeURIComponent(stringify(args[i])))}return argsEscaped.join("&")}function process(rpc){if(rpc&&typeof rpc.s==="string"&&typeof rpc.f==="string"&&rpc.a instanceof Array){if(authToken[rpc.f]){if(authToken[rpc.f]!=rpc.t){if(AJS.debug){console.log("Invalid auth token received for operation: "+rpc.s)}return }}if(rpc.c){rpc.callback=function(result){gadgets.rpc.call(rpc.f,CALLBACK_NAME,null,rpc.c,result)}}var result=(services[rpc.s]||services[DEFAULT_NAME]).apply(rpc,rpc.a);if(rpc.c&&typeof result!="undefined"){gadgets.rpc.call(rpc.f,CALLBACK_NAME,null,rpc.c,result)}}}function callFrameElement(targetId,serviceName,from,rpcData,callArgs){try{if(from!=".."){var fe=window.frameElement;if(typeof fe[FE_G2C_CHANNEL]==="function"){if(typeof fe[FE_G2C_CHANNEL][FE_C2G_CHANNEL]!=="function"){fe[FE_G2C_CHANNEL][FE_C2G_CHANNEL]=function(args){process(gadgets.json.parse(args))}}fe[FE_G2C_CHANNEL](rpcData);return }}else{var frame=document.getElementById(targetId);if(typeof frame[FE_G2C_CHANNEL]==="function"&&typeof frame[FE_G2C_CHANNEL][FE_C2G_CHANNEL]==="function"){frame[FE_G2C_CHANNEL][FE_C2G_CHANNEL](rpcData);return }}}catch(e){}callIfpc(targetId,serviceName,from,rpcData,callArgs)}function callIfpc(targetId,serviceName,from,rpcData,callArgs){var relay=gadgets.rpc.getRelayUrl(targetId);if(!relay){throw new Error("No relay file assigned for IFPC")}var src=null;if(useLegacyProtocol[targetId]){src=[relay,"#",encodeLegacyData([from,callId,1,0,encodeLegacyData([from,serviceName,"","",from].concat(callArgs))])].join("")}else{src=[relay,"#",targetId,"&",from,"@",callId,"&1&0&",encodeURIComponent(rpcData)].join("")}emitInvisibleIframe(src)}function emitInvisibleIframe(src){var iframe;for(var i=iframePool.length-1;i>=0;--i){var ifr=iframePool[i];try{if(ifr&&(ifr.recyclable||ifr.readyState==="complete")){ifr.parentNode.removeChild(ifr);if(window.ActiveXObject){iframePool[i]=ifr=null;iframePool.splice(i,1)}else{ifr.recyclable=false;iframe=ifr;break}}}catch(e){}}if(!iframe){iframe=document.createElement("iframe");iframe.style.border=iframe.style.width=iframe.style.height="0px";iframe.style.visibility="hidden";iframe.style.position="absolute";iframe.onload=function(){this.recyclable=true};iframePool.push(iframe)}iframe.src=src;setTimeout(function(){document.body.appendChild(iframe)},0)}function callSameDomain(target,rpc){if(typeof sameDomain[target]==="undefined"){sameDomain[target]=false;var targetEl=null;if(target===".."){targetEl=parent}else{targetEl=frames[target]}try{sameDomain[target]=targetEl.gadgets.rpc.receiveSameDomain}catch(e){}}if(typeof sameDomain[target]==="function"){sameDomain[target](rpc);return true}return false}if(gadgets.config){function init(config){if(config.rpc.parentRelayUrl.substring(0,7)==="http://"){relayUrl[".."]=config.rpc.parentRelayUrl}else{var params=document.location.search.substring(0).split("&");var parentParam="";for(var i=0,param;param=params[i];++i){if(param.indexOf("parent=")===0){parentParam=decodeURIComponent(param.substring(7));break}}relayUrl[".."]=parentParam+config.rpc.parentRelayUrl}useLegacyProtocol[".."]=!!config.rpc.useLegacyProtocol}var requiredConfig={parentRelayUrl:gadgets.config.NonEmptyStringValidator};gadgets.config.register("rpc",requiredConfig,init)}return{register:function(serviceName,handler){if(serviceName==CALLBACK_NAME){throw new Error("Cannot overwrite callback service")}if(serviceName==DEFAULT_NAME){throw new Error("Cannot overwrite default service:"+" use registerDefault")}services[serviceName]=handler},unregister:function(serviceName){if(serviceName==CALLBACK_NAME){throw new Error("Cannot delete callback service")}if(serviceName==DEFAULT_NAME){throw new Error("Cannot delete default service:"+" use unregisterDefault")}delete services[serviceName]},registerDefault:function(handler){services[""]=handler},unregisterDefault:function(){delete services[""]},call:function(targetId,serviceName,callback,var_args){++callId;targetId=targetId||"..";if(callback){callbacks[callId]=callback}var from="..";if(targetId===".."){from=window.name}var rpc={s:serviceName,f:from,c:callback?callId:0,a:Array.prototype.slice.call(arguments,3),t:authToken[targetId]};if(callSameDomain(targetId,rpc)){return }var rpcData=gadgets.json.stringify(rpc);var channelType=relayChannel;if(useLegacyProtocol[targetId]){channelType="ifpc"}switch(channelType){case"dpm":var targetDoc=targetId===".."?parent.document:frames[targetId].document;targetDoc.postMessage(rpcData);break;case"wpm":var targetWin=targetId===".."?parent:frames[targetId];targetWin.postMessage(rpcData,relayUrl[targetId]);break;case"fe":callFrameElement(targetId,serviceName,from,rpcData,rpc.a);break;default:callIfpc(targetId,serviceName,from,rpcData,rpc.a);break}},getRelayUrl:function(targetId){return relayUrl[targetId]},setRelayUrl:function(targetId,url,opt_useLegacy){relayUrl[targetId]=url;useLegacyProtocol[targetId]=!!opt_useLegacy},setAuthToken:function(targetId,token){authToken[targetId]=token;setupFrame(targetId)},getRelayChannel:function(){return relayChannel},receive:function(fragment){if(fragment.length>4){process(gadgets.json.parse(decodeURIComponent(fragment[fragment.length-1])))}},receiveSameDomain:function(rpc){rpc.a=Array.prototype.slice.call(rpc.a);window.setTimeout(function(){process(rpc)},0)}}}();
Function.prototype.inherits=function(parentCtor){function tempCtor(){}tempCtor.prototype=parentCtor.prototype;this.superClass_=parentCtor.prototype;this.prototype=new tempCtor();this.prototype.constructor=this};
var gadgets=gadgets||{};gadgets.json=function(){function f(n){return n<10?"0"+n:n}Date.prototype.toJSON=function(){return[this.getUTCFullYear(),"-",f(this.getUTCMonth()+1),"-",f(this.getUTCDate()),"T",f(this.getUTCHours()),":",f(this.getUTCMinutes()),":",f(this.getUTCSeconds()),"Z"].join("")};var m={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};function stringify(value){var a,i,k,l,r=/["\\\x00-\x1f\x7f-\x9f]/g,v;switch(typeof value){case"string":return r.test(value)?'"'+value.replace(r,function(a){var c=m[a];if(c){return c}c=a.charCodeAt();return"\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16)})+'"':'"'+value+'"';case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}a=[];if(typeof value.length==="number"&&!(value.propertyIsEnumerable("length"))){l=value.length;for(i=0;i<l;i+=1){a.push(stringify(value[i])||"null")}return"["+a.join(",")+"]"}for(k in value){if(value.hasOwnProperty(k)){if(typeof k==="string"){v=stringify(value[k]);if(v){a.push(stringify(k)+":"+v)}}}}return"{"+a.join(",")+"}"}}return{stringify:stringify,parse:function(text){if(/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/b-u]/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){return eval("("+text+")")}return false}}}();
var gadgets=gadgets||{};gadgets.error={};gadgets.error.SUBCLASS_RESPONSIBILITY="subclass responsibility";gadgets.error.TO_BE_DONE="to be done";gadgets.log=function(message){if(window.console&&console.log){console.log(message)}else{var logEntry=document.createElement("div");logEntry.className="gadgets-log-entry";logEntry.innerHTML=message;document.body.appendChild(logEntry)}};gadgets.Extensible=function(){};gadgets.Extensible.prototype.setDependencies=function(dependencies){for(var p in dependencies){this[p]=dependencies[p]}};gadgets.Extensible.prototype.getDependencies=function(name){return this[name]};gadgets.UserPrefStore=function(){};gadgets.UserPrefStore.prototype.getPrefs=function(gadget){throw Error(gadgets.error.SUBCLASS_RESPONSIBILITY)};gadgets.UserPrefStore.prototype.savePrefs=function(gadget){throw Error(gadgets.error.SUBCLASS_RESPONSIBILITY)};gadgets.DefaultUserPrefStore=function(){gadgets.UserPrefStore.call(this)};gadgets.DefaultUserPrefStore.inherits(gadgets.UserPrefStore);gadgets.DefaultUserPrefStore.prototype.getPrefs=function(gadget){};gadgets.DefaultUserPrefStore.prototype.savePrefs=function(gadget){};gadgets.GadgetService=function(){};gadgets.GadgetService.prototype.setHeight=function(elementId,height){throw Error(gadgets.error.SUBCLASS_RESPONSIBILITY)};gadgets.GadgetService.prototype.setTitle=function(gadget,title){throw Error(gadgets.error.SUBCLASS_RESPONSIBILITY)};gadgets.GadgetService.prototype.setUserPref=function(id){throw Error(gadgets.error.SUBCLASS_RESPONSIBILITY)};gadgets.IfrGadgetService=function(){gadgets.GadgetService.call(this);var service=this;gadgets.rpc.register("resize_iframe",function(){service.setHeight.apply(this,arguments)});gadgets.rpc.register("set_pref",function(){service.setUserPref.apply(this,arguments)});gadgets.rpc.register("set_title",function(){service.setTitle.apply(this,arguments)});gadgets.rpc.register("requestNavigateTo",function(){service.requestNavigateTo.apply(this,arguments)})};gadgets.IfrGadgetService.inherits(gadgets.GadgetService);gadgets.IfrGadgetService.prototype.setHeight=function(height){if(height>gadgets.container.maxheight_){height=gadgets.container.maxheight_}var element=document.getElementById(this.f);if(element){element.style.height=height+"px"}};gadgets.IfrGadgetService.prototype.requestNavigateTo=function(view,opt_params){var id=this.getGadgetIdFromModuleId(this.f);var url=this.getUrlForView(view);if(opt_params){var paramStr=JSON.stringify(opt_params);if(paramStr.length>0){url+="&appParams="+encodeURIComponent(paramStr)}}if(url&&document.location.href.indexOf(url)==-1){document.location.href=url}};gadgets.IfrGadgetService.prototype.getUrlForView=function(view){if(view==="canvas"){return"/canvas"}else{if(view==="profile"){return"/profile"}else{return null}}};gadgets.IfrGadgetService.prototype.getGadgetIdFromModuleId=function(moduleId){return parseInt(moduleId.match(/_([0-9]+)$/)[1],10)};gadgets.LayoutManager=function(){};gadgets.LayoutManager.prototype.getGadgetChrome=function(gadget){throw Error(gadgets.error.SUBCLASS_RESPONSIBILITY)};gadgets.StaticLayoutManager=function(){gadgets.LayoutManager.call(this)};gadgets.StaticLayoutManager.inherits(gadgets.LayoutManager);gadgets.StaticLayoutManager.prototype.setGadgetChromeIds=function(gadgetChromeIds){this.gadgetChromeIds_=gadgetChromeIds};gadgets.StaticLayoutManager.prototype.getGadgetChrome=function(gadget){var chromeId=this.gadgetChromeIds_[gadget.id];return chromeId?document.getElementById(chromeId):null};gadgets.FloatLeftLayoutManager=function(layoutRootId){gadgets.LayoutManager.call(this);this.layoutRootId_=layoutRootId};gadgets.FloatLeftLayoutManager.inherits(gadgets.LayoutManager);gadgets.FloatLeftLayoutManager.prototype.getGadgetChrome=function(gadget){var layoutRoot=document.getElementById(this.layoutRootId_);if(layoutRoot){var chrome=document.createElement("div");chrome.className="gadgets-gadget-chrome";chrome.style.cssFloat="left";layoutRoot.appendChild(chrome);return chrome}else{return null}};
gadgets.Container=function(){this.parentUrl_="http://"+document.location.host;this.country_="ALL";this.language_="ALL";this.view_="default";this.nocache_=1;this.maxheight_=2147483647};gadgets.Container.inherits(gadgets.Extensible);gadgets.Container.prototype.userPrefStore=new gadgets.DefaultUserPrefStore();gadgets.Container.prototype.gadgetService=new gadgets.GadgetService();gadgets.Container.prototype.layoutManager=new gadgets.StaticLayoutManager();gadgets.Container.prototype.setParentUrl=function(url){this.parentUrl_=url};gadgets.Container.prototype.setCountry=function(country){this.country_=country};gadgets.Container.prototype.setNoCache=function(nocache){this.nocache_=nocache};gadgets.Container.prototype.setLanguage=function(language){this.language_=language};gadgets.Container.prototype.setView=function(view){this.view_=view};gadgets.Container.prototype.setMaxHeight=function(maxheight){this.maxheight_=maxheight};gadgets.Container.prototype.getGadgetKey_=function(instanceId){return"gadget_"+instanceId};gadgets.IfrContainer=function(){gadgets.Container.call(this)};gadgets.IfrContainer.inherits(gadgets.Container);gadgets.IfrContainer.prototype.gadgetService=new gadgets.IfrGadgetService();gadgets.IfrContainer.prototype.setParentUrl=function(url){if(!url.match(/^http[s]?:\/\//)){url=document.location.href.match(/^[^?#]+\//)[0]+url}this.parentUrl_=url};gadgets.container=new gadgets.IfrContainer();
new gadgets.IfrGadgetService();gadgets.IfrGadgetService.prototype.setTitle=function(title){};
Calendar=function(firstDayOfWeek,dateStr,onSelected,onClose){this.activeDiv=null;this.currentDateEl=null;this.getDateStatus=null;this.getDateToolTip=null;this.getDateText=null;this.timeout=null;this.onSelected=onSelected||null;this.onClose=onClose||null;this.dragging=false;this.hidden=false;this.minYear=1970;this.maxYear=2050;this.dateFormat=Calendar._TT["DEF_DATE_FORMAT"];this.ttDateFormat=Calendar._TT["TT_DATE_FORMAT"];this.isPopup=true;this.weekNumbers=true;this.firstDayOfWeek=typeof firstDayOfWeek=="number"?firstDayOfWeek:Calendar._FD;this.showsOtherMonths=false;this.dateStr=dateStr;this.ar_days=null;this.showsTime=false;this.time24=true;this.yearStep=2;this.hiliteToday=true;this.multiple=null;this.table=null;this.element=null;this.tbody=null;this.firstdayname=null;this.monthsCombo=null;this.yearsCombo=null;this.hilitedMonth=null;this.activeMonth=null;this.hilitedYear=null;this.activeYear=null;this.dateClicked=false;if(typeof Calendar._SDN=="undefined"){if(typeof Calendar._SDN_len=="undefined"){Calendar._SDN_len=3}var ar=new Array();for(var i=8;i>0;){ar[--i]=Calendar._DN[i].substr(0,Calendar._SDN_len)}Calendar._SDN=ar;if(typeof Calendar._SMN_len=="undefined"){Calendar._SMN_len=3}ar=new Array();for(var i=12;i>0;){ar[--i]=Calendar._MN[i].substr(0,Calendar._SMN_len)}Calendar._SMN=ar}};Calendar._C=null;Calendar.is_ie=(/msie/i.test(navigator.userAgent)&&!/opera/i.test(navigator.userAgent));Calendar.is_ie5=(Calendar.is_ie&&/msie 5\.0/i.test(navigator.userAgent));Calendar.is_ie6=(Calendar.is_ie&&/msie 6\.0/i.test(navigator.userAgent));Calendar.is_opera=/opera/i.test(navigator.userAgent);Calendar.is_khtml=/Konqueror|Safari|KHTML/i.test(navigator.userAgent);Calendar.getAbsolutePos=function(el){var coords=jQuery(el).offset();coords.x=coords.left;coords.y=coords.top;return coords};Calendar.isRelated=function(el,evt){var related=evt.relatedTarget;if(!related){var type=evt.type;if(type=="mouseover"){related=evt.fromElement}else{if(type=="mouseout"){related=evt.toElement}}}while(related){if(related==el){return true}related=related.parentNode}return false};Calendar.removeClass=function(el,className){if(!(el&&el.className)){return }var cls=el.className.split(" ");var ar=new Array();for(var i=cls.length;i>0;){if(cls[--i]!=className){ar[ar.length]=cls[i]}}el.className=ar.join(" ")};Calendar.addClass=function(el,className){Calendar.removeClass(el,className);el.className+=" "+className};Calendar.getElement=function(ev){var f=Calendar.is_ie?window.event.srcElement:ev.currentTarget;while(f.nodeType!=1||/^div$/i.test(f.tagName)){f=f.parentNode}return f};Calendar.getTargetElement=function(ev){var f=Calendar.is_ie?window.event.srcElement:ev.target;while(f.nodeType!=1){f=f.parentNode}return f};Calendar.stopEvent=function(ev){if(!ev){ev=window.event}if(ev.stopPropagation){ev.preventDefault();ev.stopPropagation()}else{ev.cancelBubble=true;ev.returnValue=false}return false};Calendar.addEvent=function(el,evname,func){if(el.attachEvent){el.attachEvent("on"+evname,func)}else{if(el.addEventListener){el.addEventListener(evname,func,true)}else{el["on"+evname]=func}}};Calendar.removeEvent=function(el,evname,func){if(el.detachEvent){el.detachEvent("on"+evname,func)}else{if(el.removeEventListener){el.removeEventListener(evname,func,true)}else{el["on"+evname]=null}}};Calendar.createElement=function(type,parent){var el=null;if(document.createElementNS){el=document.createElementNS("http://www.w3.org/1999/xhtml",type)}else{el=document.createElement(type)}if(typeof parent!="undefined"){parent.appendChild(el)}return el};Calendar._add_evs=function(el){with(Calendar){addEvent(el,"mouseover",dayMouseOver);addEvent(el,"mousedown",dayMouseDown);addEvent(el,"mouseout",dayMouseOut);if(is_ie){addEvent(el,"dblclick",dayMouseDblClick);el.setAttribute("unselectable",true)}}};Calendar.findMonth=function(el){if(typeof el.month!="undefined"){return el}else{if(typeof el.parentNode.month!="undefined"){return el.parentNode}}return null};Calendar.findYear=function(el){if(typeof el.year!="undefined"){return el}else{if(typeof el.parentNode.year!="undefined"){return el.parentNode}}return null};Calendar.showMonthsCombo=function(){var cal=Calendar._C;if(!cal){return false}var cal=cal;var cd=cal.activeDiv;var mc=cal.monthsCombo;if(cal.hilitedMonth){Calendar.removeClass(cal.hilitedMonth,"hilite")}if(cal.activeMonth){Calendar.removeClass(cal.activeMonth,"active")}var mon=cal.monthsCombo.getElementsByTagName("div")[cal.date.getMonth()];Calendar.addClass(mon,"active");cal.activeMonth=mon;var s=mc.style;s.display="block";if(cd.navtype<0){s.left=cd.offsetLeft+"px"}else{var mcw=mc.offsetWidth;if(typeof mcw=="undefined"){mcw=50}s.left=(cd.offsetLeft+cd.offsetWidth-mcw)+"px"}s.top=(cd.offsetTop+cd.offsetHeight)+"px"};Calendar.showYearsCombo=function(fwd){var cal=Calendar._C;if(!cal){return false}var cal=cal;var cd=cal.activeDiv;var yc=cal.yearsCombo;if(cal.hilitedYear){Calendar.removeClass(cal.hilitedYear,"hilite")}if(cal.activeYear){Calendar.removeClass(cal.activeYear,"active")}cal.activeYear=null;var Y=cal.date.getFullYear()+(fwd?1:-1);var yr=yc.firstChild;var show=false;for(var i=12;i>0;--i){if(Y>=cal.minYear&&Y<=cal.maxYear){yr.innerHTML=Y;yr.year=Y;yr.style.display="block";show=true}else{yr.style.display="none"}yr=yr.nextSibling;Y+=fwd?cal.yearStep:-cal.yearStep}if(show){var s=yc.style;s.display="block";if(cd.navtype<0){s.left=cd.offsetLeft+"px"}else{var ycw=yc.offsetWidth;if(typeof ycw=="undefined"){ycw=50}s.left=(cd.offsetLeft+cd.offsetWidth-ycw)+"px"}s.top=(cd.offsetTop+cd.offsetHeight)+"px"}};Calendar.tableMouseUp=function(ev){var cal=Calendar._C;if(!cal){return false}if(cal.timeout){clearTimeout(cal.timeout)}var el=cal.activeDiv;if(!el){return false}var target=Calendar.getTargetElement(ev);ev||(ev=window.event);Calendar.removeClass(el,"active");if(target==el||target.parentNode==el){Calendar.cellClick(el,ev)}var mon=Calendar.findMonth(target);var date=null;if(mon){date=new Date(cal.date);if(mon.month!=date.getMonth()){date.setMonth(mon.month);cal.setDate(date);cal.dateClicked=false;cal.callHandler()}}else{var year=Calendar.findYear(target);if(year){date=new Date(cal.date);if(year.year!=date.getFullYear()){date.setFullYear(year.year);cal.setDate(date);cal.dateClicked=false;cal.callHandler()}}}with(Calendar){removeEvent(document,"mouseup",tableMouseUp);removeEvent(document,"mouseover",tableMouseOver);removeEvent(document,"mousemove",tableMouseOver);cal._hideCombos();_C=null;return stopEvent(ev)}};Calendar.tableMouseOver=function(ev){var cal=Calendar._C;if(!cal){return }var el=cal.activeDiv;var target=Calendar.getTargetElement(ev);if(target==el||target.parentNode==el){Calendar.addClass(el,"hilite active");Calendar.addClass(el.parentNode,"rowhilite")}else{if(typeof el.navtype=="undefined"||(el.navtype!=50&&(el.navtype==0||Math.abs(el.navtype)>2))){Calendar.removeClass(el,"active")}Calendar.removeClass(el,"hilite");Calendar.removeClass(el.parentNode,"rowhilite")}ev||(ev=window.event);if(el.navtype==50&&target!=el){var pos=Calendar.getAbsolutePos(el);var w=el.offsetWidth;var x=ev.clientX;var dx;var decrease=true;if(x>pos.x+w){dx=x-pos.x-w;decrease=false}else{dx=pos.x-x}if(dx<0){dx=0}var range=el._range;var current=el._current;var count=Math.floor(dx/10)%range.length;for(var i=range.length;--i>=0;){if(range[i]==current){break}}while(count-->0){if(decrease){if(--i<0){i=range.length-1}}else{if(++i>=range.length){i=0}}}var newval=range[i];el.innerHTML=newval;cal.onUpdateTime()}var mon=Calendar.findMonth(target);if(mon){if(mon.month!=cal.date.getMonth()){if(cal.hilitedMonth){Calendar.removeClass(cal.hilitedMonth,"hilite")}Calendar.addClass(mon,"hilite");cal.hilitedMonth=mon}else{if(cal.hilitedMonth){Calendar.removeClass(cal.hilitedMonth,"hilite")}}}else{if(cal.hilitedMonth){Calendar.removeClass(cal.hilitedMonth,"hilite")}var year=Calendar.findYear(target);if(year){if(year.year!=cal.date.getFullYear()){if(cal.hilitedYear){Calendar.removeClass(cal.hilitedYear,"hilite")}Calendar.addClass(year,"hilite");cal.hilitedYear=year}else{if(cal.hilitedYear){Calendar.removeClass(cal.hilitedYear,"hilite")}}}else{if(cal.hilitedYear){Calendar.removeClass(cal.hilitedYear,"hilite")}}}return Calendar.stopEvent(ev)};Calendar.tableMouseDown=function(ev){if(Calendar.getTargetElement(ev)==Calendar.getElement(ev)){return Calendar.stopEvent(ev)}};Calendar.calDragIt=function(ev){var cal=Calendar._C;if(!(cal&&cal.dragging)){return false}var posX;var posY;if(Calendar.is_ie){posY=window.event.clientY+document.body.scrollTop;posX=window.event.clientX+document.body.scrollLeft}else{posX=ev.pageX;posY=ev.pageY}var st=cal.element.style;st.left=(posX-cal.xOffs)+"px";st.top=(posY-cal.yOffs)+"px";return Calendar.stopEvent(ev)};Calendar.calDragEnd=function(ev){var cal=Calendar._C;if(!cal){return false}cal.dragging=false;with(Calendar){removeEvent(document,"mousemove",calDragIt);removeEvent(document,"mouseup",calDragEnd);tableMouseUp(ev)}};Calendar.dayMouseDown=function(ev){var el=Calendar.getElement(ev);if(el.disabled){return false}var cal=el.calendar;cal.activeDiv=el;Calendar._C=cal;if(el.navtype!=300){with(Calendar){if(el.navtype==50){el._current=el.innerHTML;addEvent(document,"mousemove",tableMouseOver)}else{addEvent(document,Calendar.is_ie5?"mousemove":"mouseover",tableMouseOver)}addClass(el,"hilite active");addEvent(document,"mouseup",tableMouseUp)}}else{if(cal.isPopup){cal._dragStart(ev)}}if(el.navtype==-1||el.navtype==1){if(cal.timeout){clearTimeout(cal.timeout)}cal.timeout=setTimeout("Calendar.showMonthsCombo()",250)}else{if(el.navtype==-2||el.navtype==2){if(cal.timeout){clearTimeout(cal.timeout)}cal.timeout=setTimeout((el.navtype>0)?"Calendar.showYearsCombo(true)":"Calendar.showYearsCombo(false)",250)}else{cal.timeout=null}}return Calendar.stopEvent(ev)};Calendar.dayMouseDblClick=function(ev){Calendar.cellClick(Calendar.getElement(ev),ev||window.event);if(Calendar.is_ie){document.selection.empty()}};Calendar.dayMouseOver=function(ev){var el=Calendar.getElement(ev);if(Calendar.isRelated(el,ev)||Calendar._C||el.disabled){return false}if(el.ttip){if(el.ttip.substr(0,1)=="_"){el.ttip=el.caldate.print(el.calendar.ttDateFormat)+el.ttip.substr(1)}el.calendar.tooltips.innerHTML=el.ttip}if(el.navtype!=300){Calendar.addClass(el,"hilite");if(el.caldate){Calendar.addClass(el.parentNode,"rowhilite")}}return Calendar.stopEvent(ev)};Calendar.dayMouseOut=function(ev){with(Calendar){var el=getElement(ev);if(isRelated(el,ev)||_C||el.disabled){return false}removeClass(el,"hilite");if(el.caldate){removeClass(el.parentNode,"rowhilite")}if(el.calendar){el.calendar.tooltips.innerHTML=_TT["SEL_DATE"]}return stopEvent(ev)}};Calendar.cellClick=function(el,ev){var cal=el.calendar;var closing=false;var newdate=false;var date=null;if(typeof el.navtype=="undefined"){if(cal.currentDateEl){Calendar.removeClass(cal.currentDateEl,"selected");Calendar.addClass(el,"selected");closing=(cal.currentDateEl==el);if(!closing){cal.currentDateEl=el}}cal.date.setDateOnly(el.caldate);date=cal.date;var other_month=!(cal.dateClicked=!el.otherMonth);if(!other_month&&!cal.currentDateEl){cal._toggleMultipleDate(new Date(date))}else{newdate=!el.disabled}if(other_month){cal._init(cal.firstDayOfWeek,date)}}else{if(el.navtype==200){Calendar.removeClass(el,"hilite");cal.callCloseHandler();return }date=new Date(cal.date);if(el.navtype==0){date.setDateOnly(new Date())}cal.dateClicked=false;var year=date.getFullYear();var mon=date.getMonth();function setMonth(m){var day=date.getDate();var max=date.getMonthDays(m);if(day>max){date.setDate(max)}date.setMonth(m)}switch(el.navtype){case 400:Calendar.removeClass(el,"hilite");var text=Calendar._TT["ABOUT"];if(typeof text!="undefined"){text+=cal.showsTime?Calendar._TT["ABOUT_TIME"]:""}else{text="Help and about box text is not translated into this language.\n"+"If you know this language and you feel generous please update\n"+'the corresponding file in "lang" subdir to match calendar-en.js\n'+"and send it back to <mihai_bazon@yahoo.com> to get it into the distribution  ;-)\n\n"+"Thank you!\n"+"http://dynarch.com/mishoo/calendar.epl\n"}alert(text);return ;case -2:if(year>cal.minYear){date.setFullYear(year-1)}break;case -1:if(mon>0){setMonth(mon-1)}else{if(year-->cal.minYear){date.setFullYear(year);setMonth(11)}}break;case 1:if(mon<11){setMonth(mon+1)}else{if(year<cal.maxYear){date.setFullYear(year+1);setMonth(0)}}break;case 2:if(year<cal.maxYear){date.setFullYear(year+1)}break;case 100:cal.setFirstDayOfWeek(el.fdow);return ;case 50:var range=el._range;var current=el.innerHTML;for(var i=range.length;--i>=0;){if(range[i]==current){break}}if(ev&&ev.shiftKey){if(--i<0){i=range.length-1}}else{if(++i>=range.length){i=0}}var newval=range[i];el.innerHTML=newval;cal.onUpdateTime();return ;case 0:if((typeof cal.getDateStatus=="function")&&cal.getDateStatus(date,date.getFullYear(),date.getMonth(),date.getDate())){return false}break}if(!date.equalsTo(cal.date)){cal.setDate(date);newdate=true}else{if(el.navtype==0){newdate=closing=true}}}if(newdate){ev&&cal.callHandler()}if(closing){Calendar.removeClass(el,"hilite");ev&&cal.callCloseHandler()}};Calendar.prototype.create=function(_par){var parent=null;if(!_par){parent=document.getElementsByTagName("body")[0];this.isPopup=true}else{parent=_par;this.isPopup=false}if(this.dateStr){this.date=new Date(this.dateStr)}if(!this.date||isNaN(this.date)){this.date=new Date()}var table=Calendar.createElement("table");this.table=table;table.cellSpacing=0;table.cellPadding=0;table.calendar=this;Calendar.addEvent(table,"mousedown",Calendar.tableMouseDown);var div=Calendar.createElement("div");this.element=div;div.className="calendar";if(this.isPopup){div.style.position="absolute";div.style.display="none"}div.appendChild(table);var thead=Calendar.createElement("thead",table);var cell=null;var row=null;var cal=this;var hh=function(text,cs,navtype){cell=Calendar.createElement("td",row);cell.colSpan=cs;cell.className="button";if(navtype!=0&&Math.abs(navtype)<=2){cell.className+=" nav"}Calendar._add_evs(cell);cell.calendar=cal;cell.navtype=navtype;cell.innerHTML="<div unselectable='on'>"+text+"</div>";return cell};row=Calendar.createElement("tr",thead);var title_length=6;(this.isPopup)&&--title_length;(this.weekNumbers)&&++title_length;hh("?",1,400).ttip=Calendar._TT["INFO"];this.title=hh("",title_length,300);this.title.className="title";if(this.isPopup){this.title.ttip=Calendar._TT["DRAG_TO_MOVE"];this.title.style.cursor="move";hh("&#x00d7;",1,200).ttip=Calendar._TT["CLOSE"]}row=Calendar.createElement("tr",thead);row.className="headrow";this._nav_py=hh("&#x00ab;",1,-2);this._nav_py.ttip=Calendar._TT["PREV_YEAR"];this._nav_pm=hh("&#x2039;",1,-1);this._nav_pm.ttip=Calendar._TT["PREV_MONTH"];this._nav_now=hh(Calendar._TT["TODAY"],this.weekNumbers?4:3,0);this._nav_now.ttip=Calendar._TT["GO_TODAY"];this._nav_nm=hh("&#x203a;",1,1);this._nav_nm.ttip=Calendar._TT["NEXT_MONTH"];this._nav_ny=hh("&#x00bb;",1,2);this._nav_ny.ttip=Calendar._TT["NEXT_YEAR"];row=Calendar.createElement("tr",thead);row.className="daynames";if(this.weekNumbers){cell=Calendar.createElement("td",row);cell.className="name wn";cell.innerHTML=Calendar._TT["WK"]}for(var i=7;i>0;--i){cell=Calendar.createElement("td",row);if(!i){cell.navtype=100;cell.calendar=this;Calendar._add_evs(cell)}}this.firstdayname=(this.weekNumbers)?row.firstChild.nextSibling:row.firstChild;this._displayWeekdays();var tbody=Calendar.createElement("tbody",table);this.tbody=tbody;for(i=6;i>0;--i){row=Calendar.createElement("tr",tbody);if(this.weekNumbers){cell=Calendar.createElement("td",row)}for(var j=7;j>0;--j){cell=Calendar.createElement("td",row);cell.calendar=this;Calendar._add_evs(cell)}}if(this.showsTime){row=Calendar.createElement("tr",tbody);row.className="time";cell=Calendar.createElement("td",row);cell.className="time";cell.colSpan=2;cell.innerHTML=Calendar._TT["TIME"]||"&nbsp;";cell=Calendar.createElement("td",row);cell.className="time";cell.colSpan=this.weekNumbers?4:3;(function(){function makeTimePart(className,init,range_start,range_end){var part=Calendar.createElement("span",cell);part.className=className;part.innerHTML=init;part.calendar=cal;part.ttip=Calendar._TT["TIME_PART"];part.navtype=50;part._range=[];if(typeof range_start!="number"){part._range=range_start}else{for(var i=range_start;i<=range_end;++i){var txt;if(i<10&&range_end>=10){txt="0"+i}else{txt=""+i}part._range[part._range.length]=txt}}Calendar._add_evs(part);return part}var hrs=cal.date.getHours();var mins=cal.date.getMinutes();var t12=!cal.time24;var pm=(hrs>12);if(t12&&pm){hrs-=12}var H=makeTimePart("hour",hrs,t12?1:0,t12?12:23);var span=Calendar.createElement("span",cell);span.innerHTML=":";span.className="colon";var M=makeTimePart("minute",mins,0,59);var AP=null;cell=Calendar.createElement("td",row);cell.className="time";cell.colSpan=2;if(t12){AP=makeTimePart("ampm",pm?Calendar._TT["PM"]:Calendar._TT["AM"],[Calendar._TT["am"],Calendar._TT["pm"]])}else{cell.innerHTML="&nbsp;"}cal.onSetTime=function(){var pm,hrs=this.date.getHours(),mins=this.date.getMinutes();if(t12){pm=(hrs>=12);if(pm){hrs-=12}if(hrs==0){hrs=12}AP.innerHTML=pm?Calendar._TT["pm"]:Calendar._TT["am"]}H.innerHTML=(hrs<10)?("0"+hrs):hrs;M.innerHTML=(mins<10)?("0"+mins):mins};cal.onUpdateTime=function(){var date=this.date;var h=parseInt(H.innerHTML,10);if(t12){if(new RegExp(Calendar._TT["pm"],"i").test(AP.innerHTML)&&h<12){h+=12}else{if(new RegExp(Calendar._TT["am"],"i").test(AP.innerHTML)&&h==12){h=0}}}var d=date.getDate();var m=date.getMonth();var y=date.getFullYear();date.setHours(h);date.setMinutes(parseInt(M.innerHTML,10));date.setFullYear(y);date.setMonth(m);date.setDate(d);this.dateClicked=false;this.callHandler()}})()}else{this.onSetTime=this.onUpdateTime=function(){}}var tfoot=Calendar.createElement("tfoot",table);row=Calendar.createElement("tr",tfoot);row.className="footrow";cell=hh(Calendar._TT["SEL_DATE"],this.weekNumbers?8:7,300);cell.className="ttip";if(this.isPopup){cell.ttip=Calendar._TT["DRAG_TO_MOVE"];cell.style.cursor="move"}this.tooltips=cell;div=Calendar.createElement("div",this.element);this.monthsCombo=div;div.className="combo";for(i=0;i<Calendar._MN.length;++i){var mn=Calendar.createElement("div");mn.className=Calendar.is_ie?"label-IEfix":"label";mn.month=i;mn.innerHTML=Calendar._SMN[i];div.appendChild(mn)}div=Calendar.createElement("div",this.element);this.yearsCombo=div;div.className="combo";for(i=12;i>0;--i){var yr=Calendar.createElement("div");yr.className=Calendar.is_ie?"label-IEfix":"label";div.appendChild(yr)}this._init(this.firstDayOfWeek,this.date);parent.appendChild(this.element);Calendar.addEvent(this.element,"mousedown",function(ev){ev.preventDefault?ev.preventDefault():ev.returnValue=false})};Calendar._upkeyEvent=function(e){if(e.keyCode===27){window.setTimeout(function(){var cal=window._dynarch_popupCalendar;if(!cal||cal.multiple){return false}else{cal.callCloseHandler()}},0)}};Calendar._keyEvent=function(ev){var cal=window._dynarch_popupCalendar;if(!cal||cal.multiple){return false}var act=(Calendar.is_ie||ev.type=="keydown"),K=ev.keyCode;if(ev.ctrlKey){switch(K){case 37:act&&Calendar.cellClick(cal._nav_pm);break;case 38:act&&Calendar.cellClick(cal._nav_py);break;case 39:act&&Calendar.cellClick(cal._nav_nm);break;case 40:act&&Calendar.cellClick(cal._nav_ny);break}}else{switch(K){case 32:Calendar.cellClick(cal._nav_now);break;case 37:case 38:case 39:case 40:if(act){var prev,x,y,ne,el,step;prev=K==37||K==38;step=(K==37||K==39)?1:7;function setVars(){el=cal.currentDateEl;var p=el.pos;x=p&15;y=p>>4;ne=cal.ar_days[y][x]}setVars();function prevMonth(){var date=new Date(cal.date);date.setDate(date.getDate()-step);cal.setDate(date)}function nextMonth(){var date=new Date(cal.date);date.setDate(date.getDate()+step);cal.setDate(date)}while(1){switch(K){case 37:if(--x>=0){ne=cal.ar_days[y][x]}else{x=6;K=38;continue}break;case 38:if(--y>=0){ne=cal.ar_days[y][x]}else{prevMonth();setVars()}break;case 39:if(++x<7){ne=cal.ar_days[y][x]}else{x=0;K=40;continue}break;case 40:if(++y<cal.ar_days.length){ne=cal.ar_days[y][x]}else{nextMonth();setVars()}break}break}if(ne){if(!ne.disabled){Calendar.cellClick(ne)}else{if(prev){prevMonth()}else{nextMonth()}}}}break;case 13:if(act){Calendar.cellClick(cal.currentDateEl,ev)}break}}return Calendar.stopEvent(ev)};Calendar.prototype._init=function(firstDayOfWeek,date){var today=new Date(),TY=today.getFullYear(),TM=today.getMonth(),TD=today.getDate();this.table.style.visibility="hidden";var year=date.getFullYear();if(year<this.minYear){year=this.minYear;date.setFullYear(year)}else{if(year>this.maxYear){year=this.maxYear;date.setFullYear(year)}}this.firstDayOfWeek=firstDayOfWeek;this.date=new Date(date);var month=date.getMonth();var mday=date.getDate();var no_days=date.getMonthDays();date.setDate(1);var day1=(date.getDay()-this.firstDayOfWeek)%7;if(day1<0){day1+=7}date.setDate(-day1);date.setDate(date.getDate()+1);var row=this.tbody.firstChild;var MN=Calendar._SMN[month];var ar_days=this.ar_days=new Array();var weekend=Calendar._TT["WEEKEND"];var dates=this.multiple?(this.datesCells={}):null;for(var i=0;i<6;++i,row=row.nextSibling){var cell=row.firstChild;if(this.weekNumbers){cell.className="day wn";var monthStartDate=date;if(month==0&&i==0&&Date.useISO8601WeekNumbers==false){monthStartDate=new Date(year,month,1)}cell.innerHTML=monthStartDate.getWeekNumber(this.firstDayOfWeek);cell=cell.nextSibling}row.className="daysrow";var hasdays=false,iday,dpos=ar_days[i]=[];for(var j=0;j<7;++j,cell=cell.nextSibling,date.setDate(iday+1)){iday=date.getDate();var wday=date.getDay();cell.className="day day-"+iday;cell.pos=i<<4|j;dpos[j]=cell;var current_month=(date.getMonth()==month);if(!current_month){if(this.showsOtherMonths){cell.className+=" othermonth";cell.otherMonth=true}else{cell.className="emptycell";cell.innerHTML="&nbsp;";cell.disabled=true;continue}}else{cell.otherMonth=false;hasdays=true}cell.disabled=false;cell.innerHTML=this.getDateText?this.getDateText(date,iday):iday;if(dates){dates[date.print("%Y%m%d")]=cell}if(this.getDateStatus){var status=this.getDateStatus(date,year,month,iday);if(this.getDateToolTip){var toolTip=this.getDateToolTip(date,year,month,iday);if(toolTip){cell.title=toolTip}}if(status===true){cell.className+=" disabled";cell.disabled=true}else{if(/disabled/i.test(status)){cell.disabled=true}cell.className+=" "+status}}if(!cell.disabled){cell.caldate=new Date(date);cell.ttip="_";if(!this.multiple&&current_month&&iday==mday&&this.hiliteToday){cell.className+=" selected";this.currentDateEl=cell}if(date.getFullYear()==TY&&date.getMonth()==TM&&iday==TD){cell.className+=" today";cell.ttip+=Calendar._TT["PART_TODAY"]}if(weekend.indexOf(wday.toString())!=-1){cell.className+=cell.otherMonth?" oweekend":" weekend"}}}if(!(hasdays||this.showsOtherMonths)){row.className="emptyrow"}}this.title.innerHTML=Calendar._MN[month]+", "+year;this.onSetTime();this.table.style.visibility="visible";this._initMultipleDates()};Calendar.prototype._initMultipleDates=function(){if(this.multiple){for(var i in this.multiple){var cell=this.datesCells[i];var d=this.multiple[i];if(!d){continue}if(cell){cell.className+=" selected"}}}};Calendar.prototype._toggleMultipleDate=function(date){if(this.multiple){var ds=date.print("%Y%m%d");var cell=this.datesCells[ds];if(cell){var d=this.multiple[ds];if(!d){Calendar.addClass(cell,"selected");this.multiple[ds]=date}else{Calendar.removeClass(cell,"selected");delete this.multiple[ds]}}}};Calendar.prototype.setDateToolTipHandler=function(unaryFunction){this.getDateToolTip=unaryFunction};Calendar.prototype.setDate=function(date){if(!date.equalsTo(this.date)){this._init(this.firstDayOfWeek,date)}};Calendar.prototype.refresh=function(){this._init(this.firstDayOfWeek,this.date)};Calendar.prototype.setFirstDayOfWeek=function(firstDayOfWeek){this._init(firstDayOfWeek,this.date);this._displayWeekdays()};Calendar.prototype.setDateStatusHandler=Calendar.prototype.setDisabledHandler=function(unaryFunction){this.getDateStatus=unaryFunction};Calendar.prototype.setRange=function(a,z){this.minYear=a;this.maxYear=z};Calendar.prototype.callHandler=function(){if(this.onSelected){this.onSelected(this,this.date.print(this.dateFormat))}};Calendar.prototype.callCloseHandler=function(){if(this.onClose){this.onClose(this)}};Calendar.prototype.destroy=function(){var el=this.element.parentNode;el.removeChild(this.element);Calendar._C=null;window._dynarch_popupCalendar=null};Calendar.prototype.reparent=function(new_parent){var el=this.element;el.parentNode.removeChild(el);new_parent.appendChild(el)};Calendar._checkCalendar=function(ev){var calendar=window._dynarch_popupCalendar;if(!calendar){return false}var el=Calendar.is_ie?Calendar.getElement(ev):Calendar.getTargetElement(ev);for(;el!=null&&el!=calendar.element;el=el.parentNode){}if(el==null){window._dynarch_popupCalendar.callCloseHandler();return Calendar.stopEvent(ev)}};Calendar.prototype.show=function(){var rows=this.table.getElementsByTagName("tr");for(var i=rows.length;i>0;){var row=rows[--i];Calendar.removeClass(row,"rowhilite");var cells=row.getElementsByTagName("td");for(var j=cells.length;j>0;){var cell=cells[--j];Calendar.removeClass(cell,"hilite");Calendar.removeClass(cell,"active")}}Calendar.current=this;this.element.style.display="block";this.element.className+=" active";this.hidden=false;if(this.isPopup){window._dynarch_popupCalendar=this;Calendar.addEvent(document,"keyup",Calendar._upkeyEvent);Calendar.addEvent(document,"keydown",Calendar._keyEvent);Calendar.addEvent(document,"mousedown",Calendar._checkCalendar)}};Calendar.prototype.hide=function(){if(this.isPopup){Calendar.removeEvent(document,"keyup",Calendar._upkeyEvent);Calendar.removeEvent(document,"keydown",Calendar._keyEvent);Calendar.removeEvent(document,"mousedown",Calendar._checkCalendar)}Calendar.current=null;this.element.style.display="none";this.element.className=this.element.className.replace(/active/gi,"");this.hidden=true};Calendar.prototype.showAt=function(x,y){var s=this.element.style;s.left=x+"px";s.top=y+"px";this.show()};Calendar.prototype.showAtElement=function(el,opts){var self=this;var p=Calendar.getAbsolutePos(el);if(!opts||typeof opts!="string"){this.showAt(p.x,p.y+el.offsetHeight);return true}function fixPosition(box){if(box.x<0){box.x=0}if(box.y<0){box.y=0}var cp=document.createElement("div");var s=cp.style;s.position="absolute";s.right=s.bottom=s.width=s.height="0px";document.body.appendChild(cp);var br=Calendar.getAbsolutePos(cp);document.body.removeChild(cp);br.y+=jQuery(window).scrollTop();br.x+=jQuery(window).scrollLeft();var tmp=box.x+box.width-br.x;if(tmp>0){box.x-=tmp}tmp=box.y+box.height-br.y;if(tmp>0){box.y-=tmp}}this.element.style.display="block";Calendar.continuation_for_the_khtml_browser=function(){var w=jQuery(self.element).outerWidth();var h=jQuery(self.element).outerHeight();self.element.style.display="none";var valign=opts.substr(0,1);var halign="l";if(opts.length>1){halign=opts.substr(1,1)}switch(valign){case"T":p.y-=h;break;case"B":p.y+=jQuery(el).outerHeight();break;case"C":p.y+=(jQuery(el).outerHeight()-h)/2;break;case"t":p.y+=jQuery(el).outerHeight()-h;break;case"b":break}switch(halign){case"L":p.x-=w;break;case"R":p.x+=jQuery(el).outerWidth();break;case"C":p.x+=(jQuery(el).outerWidth()-w)/2;break;case"l":p.x+=jQuery(el).outerWidth()-w;break;case"r":break}p.width=w;p.height=h+40;self.monthsCombo.style.display="none";fixPosition(p);self.showAt(p.x,p.y)};Calendar.continuation_for_the_khtml_browser()};Calendar.prototype.setDateFormat=function(str){this.dateFormat=str};Calendar.prototype.setTtDateFormat=function(str){this.ttDateFormat=str};Calendar.prototype.parseDate=function(str,fmt){if(!fmt){fmt=this.dateFormat}this.setDate(Date.parseDate(str,fmt))};Calendar.prototype._displayWeekdays=function(){var fdow=this.firstDayOfWeek;var cell=this.firstdayname;var weekend=Calendar._TT["WEEKEND"];for(var i=0;i<7;++i){cell.className="day name";var realday=(i+fdow)%7;if(i){cell.ttip=Calendar._TT["DAY_FIRST"].replace("%s",Calendar._DN[realday]);cell.navtype=100;cell.calendar=this;cell.fdow=realday;Calendar._add_evs(cell)}if(weekend.indexOf(realday.toString())!=-1){Calendar.addClass(cell,"weekend")}cell.innerHTML=Calendar._SDN[(i+fdow)%7];cell=cell.nextSibling}};Calendar.prototype._hideCombos=function(){this.monthsCombo.style.display="none";this.yearsCombo.style.display="none"};Calendar.prototype._dragStart=function(ev){if(this.dragging){return }this.dragging=true;var posX;var posY;if(Calendar.is_ie){posY=window.event.clientY+document.body.scrollTop;posX=window.event.clientX+document.body.scrollLeft}else{posY=ev.clientY+window.scrollY;posX=ev.clientX+window.scrollX}var st=this.element.style;this.xOffs=posX-parseInt(st.left);this.yOffs=posY-parseInt(st.top);with(Calendar){addEvent(document,"mousemove",calDragIt);addEvent(document,"mouseup",calDragEnd)}};Date._MD=new Array(31,28,31,30,31,30,31,31,30,31,30,31);Date.SECOND=1000;Date.MINUTE=60*Date.SECOND;Date.HOUR=60*Date.MINUTE;Date.DAY=24*Date.HOUR;Date.WEEK=7*Date.DAY;Date._multisplit=function(s,seps){if(s==null){return null}if(seps==null){seps=""}var arr=[];var len=s.length;var token="";var inWord=false;for(i=0;i<len;i++){var c=s.charAt(i);if(seps.indexOf(c)==-1){inWord=true;token+=c}else{if(inWord){arr[arr.length]=token;token="";inWord=false}}}if(token.length>0){arr[arr.length]=token}if(arr.length==0){arr[arr.length]=""}return arr};Date._parseNonDateFormatChars=function(s){var magicChars="aAbBCdeHIJklmMnpPRSstUWVuwyY%";var nonMagicChars="";var len=s.length;var inMagic=false;for(i=0;i<len;i++){var c=s.charAt(i);if(c=="%"){var peekc="";if(i+1<len){peekc=s.charAt(i+1)}i=i+1;if(peekc.length>0&&magicChars.indexOf(peekc)!=-1){continue}else{if(nonMagicChars.indexOf(c)==-1){nonMagicChars+=c}if(peekc.length>0&&nonMagicChars.indexOf(peekc)==-1){nonMagicChars+=peekc}}}else{if(nonMagicChars.indexOf(c)==-1){nonMagicChars+=c}}}return nonMagicChars};Date.parseDate=function(str,fmt){var today=new Date();var y=0;var m=-1;var d=0;var seps=Date._parseNonDateFormatChars(fmt);var a=Date._multisplit(str,seps);var b=fmt.match(/%./g);var i=0,j=0;var hr=0;var min=0;for(i=0;i<a.length;++i){if(!a[i]){continue}switch(b[i]){case"%d":case"%e":d=parseInt(a[i],10);break;case"%m":m=parseInt(a[i],10)-1;break;case"%Y":case"%y":y=parseInt(a[i],10);(y<100)&&(y+=(y>29)?1900:2000);break;case"%b":case"%B":var monthName=a[i].toLowerCase();var found=false;if(b[i]=="%b"){for(j=0;j<12;++j){if(Calendar._SMN[j].substr(0,monthName.length).toLowerCase()==monthName){m=j;found=true;break}}}if(!found){for(j=0;j<12;++j){if(Calendar._MN[j].substr(0,monthName.length).toLowerCase()==monthName){m=j;break}}}break;case"%H":case"%I":case"%k":case"%l":hr=parseInt(a[i],10);break;case"%P":case"%p":if(/pm/i.test(a[i])&&hr<12){hr+=12}else{if(/am/i.test(a[i])&&hr>=12){hr-=12}}break;case"%M":min=parseInt(a[i],10);break;case"%R":var hrMinString=a[i];var hrMinSeparator=hrMinString.indexOf(":");var hrString=hrMinString.substring(0,hrMinSeparator);var minString=hrMinSeparator==-1?0:hrMinString.substring(hrMinSeparator+1);hr=parseInt(hrString,10);min=parseInt(minString,10);break}}if(isNaN(y)){y=today.getFullYear()}if(isNaN(m)){m=today.getMonth()}if(isNaN(d)){d=today.getDate()}if(isNaN(hr)){hr=today.getHours()}if(isNaN(min)){min=today.getMinutes()}if(y!=0&&m!=-1&&d!=0){return new Date(y,m,d,hr,min,0)}y=0;m=-1;d=0;for(i=0;i<a.length;++i){if(a[i].search(/[a-zA-Z]+/)!=-1){var t=-1;for(j=0;j<12;++j){if(Calendar._MN[j].substr(0,a[i].length).toLowerCase()==a[i].toLowerCase()){t=j;break}}if(t!=-1){if(m!=-1){d=m+1}m=t}}else{if(parseInt(a[i],10)<=12&&m==-1){m=a[i]-1}else{if(parseInt(a[i],10)>31&&y==0){y=parseInt(a[i],10);(y<100)&&(y+=(y>29)?1900:2000)}else{if(d==0){d=a[i]}}}}}if(y==0){y=today.getFullYear()}if(m!=-1&&d!=0){return new Date(y,m,d,hr,min,0)}return today};Date.prototype.getMonthDays=function(month){var year=this.getFullYear();if(typeof month=="undefined"){month=this.getMonth()}if(((0==(year%4))&&((0!=(year%100))||(0==(year%400))))&&month==1){return 29}else{return Date._MD[month]}};Date.prototype.getDayOfYear=function(){var now=new Date(this.getFullYear(),this.getMonth(),this.getDate(),0,0,0);var then=new Date(this.getFullYear(),0,0,0,0,0);var time=now-then;return Math.floor(time/Date.DAY)};Date.prototype.getWeekNumber=function(startOfWeek){if(Date.useISO8601WeekNumbers){return this.getISO8601WeekNumber()}else{return this.getSimpleWeekNumber(startOfWeek)}};Date.prototype.getISO8601WeekNumber=function(){function gregdaynumber(year,month,day){y=year;m=month;if(month<3){y=y-1}if(month<3){m=m+12}return Math.floor(365.25*y)-Math.floor(y/100)+Math.floor(y/400)+Math.floor(30.6*(m+1))+day-62}function isocalendar1(date){year=date.getFullYear();month=date.getMonth();day=date.getDate();wday=date.getDay();weekday=((wday+6)%7)+1;isoyear=year;d0=gregdaynumber(year,1,0);weekday0=((d0+4)%7)+1;d=gregdaynumber(year,month+1,day);isoweeknr=Math.floor((d-d0+weekday0+6)/7)-Math.floor((weekday0+3)/7);if((month==11)&&((day-weekday)>27)){isoweeknr=1;isoyear=isoyear+1}if((month==0)&&((weekday-day)>3)){d0=gregdaynumber(year-1,1,0);weekday0=((d0+4)%7)+1;isoweeknr=Math.floor((d-d0+weekday0+6)/7)-Math.floor((weekday0+3)/7);isoyear=isoyear-1}return isoweeknr}return isocalendar1(this)};Date.prototype.getSimpleWeekNumber=function(startOfWeek){function OddWkNo1(D,d1,d2){var Yr=D.getFullYear(),Jan1=new Date(Yr,0,1),Q;Q=Math.round((D-Jan1)/86400000);if(d1!=null){Q-=(7+d1-Jan1.getDay())%7}if(d2!=null){Q+=d2}return[Yr,1+Q/7|0,1+(7+Q)%7]}return OddWkNo1(this,startOfWeek?startOfWeek:6,6)[1]};Date.prototype.equalsTo=function(date){return((this.getFullYear()==date.getFullYear())&&(this.getMonth()==date.getMonth())&&(this.getDate()==date.getDate())&&(this.getHours()==date.getHours())&&(this.getMinutes()==date.getMinutes()))};Date.prototype.setDateOnly=function(date){var tmp=new Date(date);this.setDate(1);this.setFullYear(tmp.getFullYear());this.setMonth(tmp.getMonth());this.setDate(tmp.getDate())};Date.prototype.print=function(str){var m=this.getMonth();var d=this.getDate();var y=this.getFullYear();var wn=this.getWeekNumber();var w=this.getDay();var s={};var hr=this.getHours();var pm=(hr>=12);var ir=(pm)?(hr-12):hr;var dy=this.getDayOfYear();if(ir==0){ir=12}var min=this.getMinutes();var sec=this.getSeconds();s["%a"]=Calendar._SDN[w];s["%A"]=Calendar._DN[w];s["%b"]=Calendar._SMN[m];s["%B"]=Calendar._MN[m];s["%C"]=1+Math.floor(y/100);s["%d"]=(d<10)?("0"+d):d;s["%e"]=d;s["%H"]=(hr<10)?("0"+hr):hr;s["%I"]=(ir<10)?("0"+ir):ir;s["%j"]=(dy<100)?((dy<10)?("00"+dy):("0"+dy)):dy;s["%k"]=hr;s["%l"]=ir;s["%m"]=(m<9)?("0"+(1+m)):(1+m);s["%M"]=(min<10)?("0"+min):min;s["%n"]="\n";s["%p"]=pm?Calendar._TT["PM"]:Calendar._TT["AM"];s["%P"]=pm?Calendar._TT["PM"]:Calendar._TT["AM"];s["%R"]=s["%k"]+":"+s["%M"];s["%s"]=Math.floor(this.getTime()/1000);s["%S"]=(sec<10)?("0"+sec):sec;s["%t"]="\t";s["%U"]=s["%W"]=s["%V"]=(wn<10)?("0"+wn):wn;s["%u"]=w+1;s["%w"]=w;s["%y"]=(""+y).substr(2,2);s["%Y"]=y;s["%%"]="%";var re=/%./g;if(!Calendar.is_ie5&&!Calendar.is_khtml){return str.replace(re,function(par){return s[par]||par})}var a=str.match(re);for(var i=0;i<a.length;i++){var tmp=s[a[i]];if(tmp){re=new RegExp(a[i],"g");str=str.replace(re,tmp)}}return str};Date.prototype.__msh_oldSetFullYear=Date.prototype.setFullYear;Date.prototype.setFullYear=function(y){var d=new Date(this);d.__msh_oldSetFullYear(y);if(d.getMonth()!=this.getMonth()){this.setDate(28)}this.__msh_oldSetFullYear(y)};window._dynarch_popupCalendar=null;
Calendar.setup=function(params){function param_default(pname,def){if(typeof params[pname]=="undefined"){params[pname]=def}}param_default("inputField",null);param_default("context",null);param_default("displayArea",null);param_default("button",null);param_default("eventName","click");param_default("ifFormat","%Y/%m/%d");param_default("daFormat","%Y/%m/%d");param_default("singleClick",true);param_default("disableFunc",null);param_default("dateStatusFunc",params["disableFunc"]);param_default("dateText",null);param_default("firstDay",null);param_default("align","Br");param_default("range",[1900,2999]);param_default("weekNumbers",true);param_default("useISO8601WeekNumbers",false);param_default("flat",null);param_default("flatCallback",null);param_default("onSelect",null);param_default("onClose",null);param_default("onUpdate",null);param_default("date",null);param_default("showsTime",false);param_default("timeFormat","24");param_default("electric",true);param_default("step",1);param_default("position",null);param_default("cache",false);param_default("showOthers",false);param_default("multiple",null);var tmp=["inputField","displayArea","button"];for(var i in tmp){if(typeof params[tmp[i]]=="string"){var id="#"+params[tmp[i]].escapejQuerySelector();if(params.context){params[tmp[i]]=AJS.$(params.context).find(id).get(0)}else{params[tmp[i]]=AJS.$(id).get(0)}}}if(!(params.flat||params.multiple||params.inputField||params.displayArea||params.button)){AJS.log("Calendar.setup:\n  Nothing to setup (no fields found).  Please check your code");return false}if(params.firstDay&&params.firstDay!==null){params.firstDay=+params.firstDay}function onSelect(cal){var p=cal.params;var update=(cal.dateClicked||p.electric);if(update&&p.inputField){p.inputField.value=cal.date.print(p.ifFormat);jQuery(p.inputField).change()}if(update&&p.displayArea){p.displayArea.innerHTML=cal.date.print(p.daFormat)}if(update&&typeof p.onUpdate=="function"){p.onUpdate(cal)}if(update&&p.flat){if(typeof p.flatCallback=="function"){p.flatCallback(cal)}}if(p.singleClick==="true"){p.singleClick=true}else{if(p.singleClick==="false"){p.singleClick=false}}if(update&&p.singleClick&&cal.dateClicked){cal.callCloseHandler()}}if(params.flat!=null){if(typeof params.flat=="string"){params.flat=document.getElementById(params.flat)}if(!params.flat){AJS.log("Calendar.setup:\n  Flat specified but can't find parent.");return false}var cal=new Calendar(params.firstDay,params.date,params.onSelect||onSelect);cal.showsOtherMonths=params.showOthers;cal.showsTime=params.showsTime;cal.time24=(params.timeFormat=="24");cal.params=params;cal.weekNumbers=params.weekNumbers;cal.setRange(params.range[0],params.range[1]);cal.setDateStatusHandler(params.dateStatusFunc);cal.getDateText=params.dateText;if(params.ifFormat){cal.setDateFormat(params.ifFormat)}if(params.inputField&&typeof params.inputField.value=="string"){cal.parseDate(params.inputField.value)}cal.create(params.flat);cal.show();return false}var triggerEl=params.button||params.displayArea||params.inputField;jQuery(triggerEl).bind(params.eventName,function(e){e.preventDefault();createCalendar()});if(params.inputField){enhanceInputField()}function createCalendar(){if(Calendar._UNSUPPORTED===true){alert("The JIRA Calendar does not currently support your language.");return }var dateEl=params.inputField||params.displayArea;var dateFmt=params.inputField?params.ifFormat:params.daFormat;var mustCreate=false;var cal=window.calendar;if(cal){cal.hide()}if(dateEl){if(dateEl.value||dateEl.innerHTML){params.date=Date.parseDate(dateEl.value||dateEl.innerHTML,dateFmt)}}if(!(cal&&params.cache)){window.calendar=cal=new Calendar(params.firstDay,params.date,params.onSelect||onSelect,params.onClose||function(cal){cal.hide()});cal.showsTime=params.showsTime;cal.time24=(params.timeFormat=="24");cal.weekNumbers=params.weekNumbers;Date.useISO8601WeekNumbers=params.useISO8601WeekNumbers;if(params.useISO8601WeekNumbers){cal.firstDayOfWeek=1}mustCreate=true}else{if(params.date){cal.setDate(params.date)}cal.hide()}if(params.multiple){cal.multiple={};for(var i=params.multiple.length;--i>=0;){var d=params.multiple[i];var ds=d.print("%Y%m%d");cal.multiple[ds]=d}}cal.showsOtherMonths=params.showOthers;cal.yearStep=params.step;cal.setRange(params.range[0],params.range[1]);cal.params=params;cal.setDateStatusHandler(params.dateStatusFunc);cal.getDateText=params.dateText;cal.setDateFormat(dateFmt);if(mustCreate){cal.create()}cal.refresh();if(!params.position){cal.showAtElement(params.button||params.displayArea||params.inputField,params.align)}else{cal.showAt(params.position[0],params.position[1])}return false}function enhanceInputField(){var $inputField=jQuery(params.inputField);if(params.button){jQuery(params.button).mousedown(function(e){e.preventDefault();if(!$inputField.is(":focus")){$inputField.focus()}})}$inputField.keydown(function(e){var cal=window.calendar;if(e.keyCode===40){if(!cal||cal.hidden){setTimeout(function(){createCalendar()},1)}}})}return cal};
JIRA.Dropdown=function(){var instances=[];return{addInstance:function(){instances.push(this)},hideInstances:function(){var that=this;jQuery(instances).each(function(){if(that!==this){this.hideDropdown()}})},getHash:function(){if(!this.hash){this.hash={container:this.dropdown,hide:this.hideDropdown,show:this.displayDropdown}}return this.hash},displayDropdown:function(){if(JIRA.Dropdown.current===this){return }this.hideInstances();JIRA.Dropdown.current=this;this.dropdown.css({display:"block"});this.displayed=true;var dd=this.dropdown;if(!window.top.JIRA.Dialog.current){setTimeout(function(){var win=jQuery(window);var minScrollTop=dd.offset().top+dd.prop("offsetHeight")-win.height()+10;if(win.scrollTop()<minScrollTop){jQuery("html,body").animate({scrollTop:minScrollTop},300,"linear")}},100)}},hideDropdown:function(){if(this.displayed===false){return }JIRA.Dropdown.current=null;this.dropdown.css({display:"none"});this.displayed=false},init:function(trigger,dropdown){var that=this;this.addInstance(this);this.dropdown=jQuery(dropdown);this.dropdown.css({display:"none"});jQuery(document).keydown(function(e){if(e.keyCode===9){that.hideDropdown()}});if(trigger.target){jQuery.aop.before(trigger,function(){if(!that.displayed){that.displayDropdown()}})}else{that.dropdown.css("top",jQuery(trigger).outerHeight()+"px");trigger.click(function(e){if(!that.displayed){that.displayDropdown();e.stopPropagation()}else{that.hideDropdown()}e.preventDefault()})}jQuery(document.body).click(function(){if(that.displayed){that.hideDropdown()}})}}}();JIRA.Dropdown.Standard=function(trigger,dropdown){var that=begetObject(JIRA.Dropdown);that.init(trigger,dropdown);return that};JIRA.Dropdown.AutoComplete=function(trigger,dropdown){var that=begetObject(JIRA.Dropdown);that.init=function(trigger,dropdown){this.addInstance(this);this.dropdown=jQuery(dropdown).click(function(e){e.stopPropagation()});this.dropdown.css({display:"none"});if(trigger.target){jQuery.aop.before(trigger,function(){if(!that.displayed){that.displayDropdown()}})}else{trigger.click(function(e){if(!that.displayed){that.displayDropdown();e.stopPropagation()}})}jQuery(document.body).click(function(){if(that.displayed){that.hideDropdown()}})};that.init(trigger,dropdown);return that};AJS.namespace("jira.widget.dropdown",null,JIRA.Dropdown);
JIRA.AutoComplete=function(){var inFocus;var delay=function(callback,l){if(delay.t){clearTimeout(delay.t);delay.t=undefined}delay.t=setTimeout(callback,l*1000)};var INVALID_KEYS={9:true,13:true,14:true,25:true,27:true,38:true,40:true,224:true};return{dispatcher:function(){},getSavedResponse:function(){},saveResponse:function(){},renderSuggestions:function(){},disable:function(){this.disabled=true},enable:function(){this.disabled=false},set:function(options){for(var name in options){if(options.hasOwnProperty(name)){this[name]=options[name]}}},completeField:function(value){if(value){this.field.val(value).focus();this.field.trigger("change")}},textToSuggestionCursorPosition:function(){return this.field.val()},_makeRequest:function(options){var that=this,requestParams=AJS.copyObject(options);if(this.pendingRequest){this.pendingRequest.abort()}requestParams.complete=function(){that.pendingRequest=null};requestParams.error=function(xhr){if(!xhr.aborted&&xhr.status!==0&&options.error){options.error.apply(this,arguments)}};return this.pendingRequest=JIRA.SmartAjax.makeRequest(requestParams)},addSuggestionControls:function(suggestionNodes){var that=this;var evaluateIndex=function(idx,max){var minBoundary=(that.autoSelectFirst===false)?-1:0;if(that.allowArrowCarousel){if(idx>max){return minBoundary}else{if(idx<minBoundary){return max}else{return idx}}}else{if(idx>max){return max}else{if(idx<minBoundary){that.responseContainer.scrollTop(0);return minBoundary}else{return idx}}}};var setActive=function(idx){if(that.selectedIndex!==undefined&&that.selectedIndex>-1){that.suggestionNodes[that.selectedIndex][0].removeClass("active")}that.selectedIndex=evaluateIndex(idx,that.suggestionNodes.length-1);if(that.selectedIndex>-1){that.suggestionNodes[that.selectedIndex][0].addClass("active")}};var evaluateIfActive=function(){return that.suggestionNodes&&that.suggestionNodes[that.selectedIndex]&&that.suggestionNodes[that.selectedIndex][0].hasClass("active")};var keyPressHandler=function(e){if(that.responseContainer.is(":visible")){if(e.keyCode===13){if(evaluateIfActive()&&!that.pendingRequest){that.completeField(that.suggestionNodes[that.selectedIndex][1])}e.preventDefault();e.stopPropagation()}}};var keyboardNavigateHandler=function(e){if(that.responseContainer.is(":visible")){if(that.field[0]!==document.activeElement){that.field.focus()}if(e.keyCode===40){setActive(that.selectedIndex+1);if(that.selectedIndex>=0){var containerHeight=that.responseContainer.height();var bottom=that.suggestionNodes[that.selectedIndex][0].position().top+that.suggestionNodes[that.selectedIndex][0].outerHeight();if(bottom-containerHeight>0){that.responseContainer.scrollTop(that.responseContainer.scrollTop()+bottom-containerHeight+2)}}else{that.responseContainer.scrollTop(0)}e.preventDefault()}else{if(e.keyCode===38){setActive(that.selectedIndex-1);if(that.selectedIndex>=0){var top=that.suggestionNodes[that.selectedIndex][0].position().top;if(top<0){that.responseContainer.scrollTop(that.responseContainer.scrollTop()+top-2)}}e.preventDefault()}else{if(e.keyCode===9){if(evaluateIfActive()){that.completeField(that.suggestionNodes[that.selectedIndex][1]);e.preventDefault()}else{that.dropdownController.hideDropdown()}}}}}};if(suggestionNodes.length){this.selectedIndex=0;this.suggestionNodes=suggestionNodes;for(var i=0;i<that.suggestionNodes.length;i++){var eventData={instance:this,index:i};this.suggestionNodes[i][0].bind("mouseover",eventData,activate).bind("mouseout",eventData,deactivate).bind("click",eventData,complete)}if(!this.keyboardHandlerBinded){jQuery(this.field).keypress(keyPressHandler);if(jQuery.browser.mozilla){jQuery(this.field).keypress(keyboardNavigateHandler)}else{jQuery(this.field).keydown(keyboardNavigateHandler)}this.keyboardHandlerBinded=true}if(that.autoSelectFirst===false){setActive(-1)}else{setActive(0)}inFocus=this}function activate(event){if(that.dropdownController.displayed){setActive(event.data.index)}}function deactivate(event){if(event.data.index===0){that.selectedIndex=-1}jQuery(this).removeClass("active")}function complete(event){that.completeField(that.suggestionNodes[event.data.index][1])}},clearResponseContainer:function(){this.responseContainer.empty();this.suggestionNodes=undefined},delay:delay,buildResponseContainer:function(){var inputParent=this.field.parent().addClass("atlassian-autocomplete");this.responseContainer=jQuery(document.createElement("div"));this.responseContainer.addClass("suggestions").css({top:this.field.outerHeight()+"px"}).appendTo(inputParent)},keyUpHandler:(function(){var isIe8=jQuery.browser.msie&&jQuery.browser.version==8;function callback(){if(!this.responseContainer){this.buildResponseContainer()}this.dispatcher(this.field.val())}return function(e){if(this.field.val().length>=this.minQueryLength){if(!(e.keyCode in INVALID_KEYS)||(this.responseContainer&&!this.responseContainer.is(":visible")&&(e.keyCode==38||e.keyCode==40))){if(isIe8){delay(jQuery.proxy(callback,this),0.2)}else{callback.call(this)}}}return e}})(),addMultiSelectAdvice:function(delim){var that=this;var alertUserValueAlreadyExists=function(val){if(!alertUserValueAlreadyExists.isAlerting){alertUserValueAlreadyExists.isAlerting=true;var userAlert=jQuery(document.createElement("div")).css({"float":"left",display:"none"}).addClass("warningBox").html("Oops! You have already entered the value <em>"+val+"</em>").appendTo(that.field.parent()).show("fast",function(){that.delay(function(){userAlert.hide("fast",function(){userAlert.remove();alertUserValueAlreadyExists.isAlerting=false})},4)})}};jQuery.aop.before({target:this,method:"dispatcher"},function(innvocation){var val=this.field.val();innvocation[0]=jQuery.trim(val.slice(val.lastIndexOf(delim)+1));return innvocation});jQuery.aop.before({target:this,method:"completeField"},function(args){var valueToAdd=args[0],untrimmedVals=this.field.val().split(delim);var trimmedVals=jQuery(untrimmedVals).map(function(){return jQuery.trim(this)}).get();if(!this.allowDuplicates&&new RegExp("(?:^|[\\s"+delim+"])"+valueToAdd+"\\s*"+delim).test(this.field.val())){alertUserValueAlreadyExists(valueToAdd);trimmedVals[trimmedVals.length-1]=""}else{trimmedVals[trimmedVals.length-1]=valueToAdd;trimmedVals[trimmedVals.length]=""}args[0]=trimmedVals.join(delim.replace(/([^\s]$)/,"$1 "));return args})},addDropdownAdvice:function(){var that=this;jQuery.aop.after({target:this,method:"buildResponseContainer"},function(args){this.dropdownController=JIRA.Dropdown.AutoComplete({target:this,method:"renderSuggestions"},this.responseContainer);if(AJS.$.browser.msie){jQuery.aop.before({target:this.dropdownController,method:"displayDropdown"},function(){that.field.parent().addClass("atlassian-autocomplete")});jQuery.aop.after({target:this.dropdownController,method:"hideDropdown"},function(){that.field.parent().removeClass("atlassian-autocomplete")})}jQuery.aop.after({target:this.dropdownController,method:"hideDropdown"},function(){this.dropdown.removeClass("dropdown-ready")});return args});jQuery.aop.after({target:this,method:"renderSuggestions"},function(args){if(args&&args.length>0){this.dropdownController.displayDropdown();if(this.maxHeight&&this.dropdownController.dropdown.prop("scrollHeight")>this.maxHeight){this.dropdownController.dropdown.css({height:this.maxHeight,overflowX:"visible",overflowY:"scroll"})}else{if(this.maxHeight){this.dropdownController.dropdown.css({height:"",overflowX:"",overflowY:""})}}this.dropdownController.dropdown.addClass("dropdown-ready")}else{this.dropdownController.hideDropdown()}return args});jQuery.aop.after({target:this,method:"completeField"},function(args){this.dropdownController.hideDropdown();return args});jQuery.aop.after({target:this,method:"keyUpHandler"},function(e){if((!(this.field.val().length>=this.minQueryLength)||e.keyCode===27)&&this.dropdownController&&this.dropdownController.displayed){this.dropdownController.hideDropdown();if(e.keyCode===27){e.stopPropagation()}}return e})},init:function(options){var that=this;this.set(options);this.field=this.field||jQuery("#"+this.fieldID);this.field.attr("autocomplete","off").keyup(function(e){if(!that.disabled){that.keyUpHandler(e)}}).keydown(function(e){var ESC_KEY=27;if(e.keyCode===ESC_KEY&&that.responseContainer&&that.responseContainer.is(":visible")){e.preventDefault()}}).click(function(e){if(inFocus===that){e.stopPropagation()}}).blur(function(){if(that.pendingRequest){that.pendingRequest.abort()}});this.addDropdownAdvice();if(options.delimChar){this.addMultiSelectAdvice(options.delimChar)}}}}();AJS.namespace("jira.widget.autocomplete",null,JIRA.AutoComplete);
JIRA.RESTAutoComplete=function(){var that=begetObject(JIRA.AutoComplete);that.dispatcher=function(reqFieldVal){var that=this;if(reqFieldVal.length<this.minQueryLength){return }if(!this.getSavedResponse(reqFieldVal)){this.delay(function(){var params=that.getAjaxParams();params.data.query=reqFieldVal;params.success=function(data){that.saveResponse(reqFieldVal,data);that.responseContainer.scrollTop(0);that.renderSuggestions(data)};that._makeRequest(params)},that.queryDelay)}else{that.renderSuggestions(that.getSavedResponse(reqFieldVal));that.responseContainer.scrollTop(0)}};that.getAjaxParams=function(){};that.getSavedResponse=function(val){if(!this.requested){this.requested={}}return this.requested[val]};that.saveResponse=function(val,response){if(typeof val==="string"&&typeof response==="object"){if(!this.requested){this.requested={}}this.requested[val]=response}};return that}();AJS.namespace("jira.widget.autocomplete.REST",null,JIRA.RESTAutoComplete);
JIRA.IssueAutoComplete=function(options){var that=begetObject(JIRA.RESTAutoComplete);that.getAjaxParams=function(){return{url:contextPath+"/rest/api/1.0/issues/picker",data:options.ajaxData,dataType:"json",type:"GET"}};that.renderSuggestions=function(response){var resultsContainer,suggestionNodes=[];this.clearResponseContainer();if(response&&response.sections&&response.sections.length>0){resultsContainer=AJS.$("<ul/>").appendTo(this.responseContainer);AJS.$(response.sections).each(function(){var section=this;var subSection=AJS.$("<div/>").attr("id",options.fieldID+"_s_"+section.id).addClass("yag").text(section.label);if(section.sub){subSection.append(AJS.$("<span/>").addClass("yagt").text("("+section.sub+")"))}resultsContainer.append(AJS.$("<li/>").append(subSection).mouseover(function(){AJS.$(this).addClass("active")}).mouseout(function(){AJS.$(this).removeClass("active")}));if(section.msg){var msg=AJS.$("<div/>").attr("id",options.fieldID+"_i_"+section.id+"_n").addClass("yad").text(section.msg);resultsContainer.append(AJS.$("<li/>").append(msg).mouseover(function(){AJS.$(this).addClass("active")}).mouseout(function(){AJS.$(this).removeClass("active")}))}if(section.issues&&section.issues.length>0){AJS.$(section.issues).each(function(){var imgUrl;if(/^http/.test(this.img)){imgUrl=this.img}else{imgUrl=contextPath+this.img}var issueNode=AJS.$("<li/>").append(AJS.$("<div/>").attr("id",options.fieldID+"_i_"+section.id+"_"+this.key).addClass("yad").append(AJS.$("<table/>").addClass("yat").attr({cellpadding:"0",cellspacing:"0"}).append(AJS.$("<tr/>").append(AJS.$("<td/>").append(AJS.$("<img/>").attr("src",imgUrl))).append(AJS.$("<td/>").append(AJS.$("<div/>").addClass("yak").html(this.keyHtml))).append(AJS.$("<td/>").css("width","100%").html(this.summary)))));resultsContainer.append(issueNode);suggestionNodes.push([issueNode,this.key])})}});that.addSuggestionControls(suggestionNodes);return suggestionNodes}};options.minQueryLength=1;options.queryDelay=0.25;that.init(options);return that};JIRA.IssueAutoComplete.init=function(){AJS.$("fieldset.issue-picker-params").each(function(){var params=JIRA.parseOptionsFromFieldset(AJS.$(this)),$container=AJS.$("#"+params.fieldId+"-container").add("#"+params.fieldName+"_container");$container.find("a.popup-trigger").click(function(e){var url=contextPath+"/secure/popups/IssuePicker.jspa?";url+="currentIssue="+params.currentIssueKey+"&";url+="singleSelectOnly="+params.singleSelectOnly+"&";url+="showSubTasks="+params.showSubTasks+"&";url+="showSubTasksParent="+params.showSubTaskParent;if(params.currentProjectId&&params.currentProjectId!=""){url+="&selectedProjectId="+params.currentProjectId}JIRA.IssuePicker.callback=function(keysMap){var $formElement,keys=[];keysMap=JSON.parse(keysMap);if(params.fieldId&&keys){$formElement=AJS.$("#"+params.fieldId);if($formElement){AJS.$.each(keysMap,function(){keys.push(this.value)});$formElement.val(keys.join(", "))}}};var vWinUsers=window.open(url,"IssueSelectorPopup","status=no,resizable=yes,top=100,left=200,width=620,height=500,scrollbars=yes,resizable");vWinUsers.opener=self;vWinUsers.focus();e.preventDefault()});if(!params.fieldId){params.fieldId=params.fieldName}if(params.issuePickerEnabled===true){JIRA.IssueAutoComplete({fieldID:params.fieldId,delimChar:params.singleSelectOnly===true?undefined:",",ajaxData:params})}})};AJS.namespace("jira.widget.autocomplete.Issues",null,JIRA.IssueAutoComplete);
JIRA.UserAutoComplete=function(options){var that=begetObject(JIRA.RESTAutoComplete);that.getAjaxParams=function(){return{url:contextPath+"/rest/api/1.0/users/picker",data:{fieldName:options.fieldID},dataType:"json",type:"GET"}};function fieldsFormHasBeenSubmitted(field){var submitting=false,form=field.closest("form");if(form.length&&form.hasClass("submitting")){submitting=true}return submitting}that.renderSuggestions=function(response){if(fieldsFormHasBeenSubmitted(this.field)||!AJS.isSelenium()&&!AJS.elementIsFocused(this.field)){return false}var resultsContainer,suggestionNodes=[];this.clearResponseContainer();if(response&&response.users&&response.users.length>0){resultsContainer=jQuery("<ul/>").appendTo(this.responseContainer);jQuery(response.users).each(function(){suggestionNodes.push([jQuery("<li/>").html(this.html).appendTo(resultsContainer),this.name])})}if(response.footer){this.responseContainer.append(jQuery("<div/>").addClass("yui-ac-ft").html(response.footer).css("display","block"))}if(suggestionNodes.length>0){that.addSuggestionControls(suggestionNodes);AJS.$(".atlassian-autocomplete div.yad, .atlassian-autocomplete .labels li").textOverflow("&#x2026;",true)}return suggestionNodes};options.minQueryLength=2;options.queryDelay=0.25;that.init(options);return that};JIRA.UserAutoComplete.init=function(parent){AJS.$("fieldset.user-picker-params",parent).each(function(){var params=JIRA.parseOptionsFromFieldset(AJS.$(this)),field=(params.fieldId||params.fieldName),$container=AJS.$("#"+field+"_container");$container.find("a.popup-trigger").click(function(e){var url=contextPath,vWinUsers;e.preventDefault();if(!params.formName){params.formName=$container.find("#"+field).parents("form").attr("name")}if(params.actionToOpen){url=url+params.actionToOpen}else{url=url+"/secure/popups/UserPickerBrowser.jspa"}url+="?formName="+params.formName+"&";url+="multiSelect="+params.multiSelect+"&";url+="decorator=popup&";url+="element="+field;vWinUsers=window.open(url,"UserPicker","status=yes,resizable=yes,top=100,left=100,width=800,height=750,scrollbars=yes");vWinUsers.opener=self;vWinUsers.focus()});if(params.userPickerEnabled===true){JIRA.UserAutoComplete({field:parent?parent.find("#"+field):null,fieldID:field,delimChar:params.multiSelect===false?undefined:",",ajaxData:{fieldName:params.fieldName}})}})};AJS.namespace("jira.widget.autocomplete.Users",null,JIRA.UserAutoComplete);
JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){JIRA.UserAutoComplete.init(context);JIRA.IssueAutoComplete.init(context)}});AJS.$(function(){AJS.$("fieldset.user-searcher-params").each(function(){var params=JIRA.parseOptionsFromFieldset(AJS.$(this)),$container=AJS.$("#"+params.fieldId+"_container");if(params.userPickerEnabled===true){var autocompleter=JIRA.UserAutoComplete({fieldID:params.fieldId,delimChar:params.multiSelect===true?",":undefined,ajaxData:{fieldName:params.fieldName}})}var setupFields=function(related){var field=AJS.$("#"+params.fieldId);var userImage=AJS.$("#"+params.fieldId+"Image");var groupImage=AJS.$("#"+params.fieldId+"GroupImage");var fieldDesc=AJS.$("#"+params.fieldId+"_desc");if(related==="select.list.none"){field.val("").attr("disabled","true");userImage.hide();groupImage.hide();fieldDesc.hide()}else{field.removeAttr("disabled");if(related==="select.list.group"){userImage.hide();groupImage.show();if(params.userPickerEnabled===true){autocompleter.disable();fieldDesc.hide()}}else{userImage.show();groupImage.hide();if(params.userPickerEnabled===true){autocompleter.enable();fieldDesc.show()}}}};AJS.$("#"+params.userSelect).change(function(){var related=AJS.$(this).find("option:selected").attr("rel");setupFields(related)}).find("option:selected").each(function(){setupFields(AJS.$(this).attr("rel"))});$container.find("a.user-popup-trigger").click(function(e){var url=contextPath+"/secure/popups/UserPickerBrowser.jspa?";url+="formName="+params.formName+"&";url+="multiSelect="+params.multiSelect+"&";url+="decorator=popup&";url+="element="+params.fieldId;var vWinUsers=window.open(url,"UserPicker","status=yes,resizable=yes,top=100,left=100,width=800,height=750,scrollbars=yes");vWinUsers.opener=self;vWinUsers.focus();e.preventDefault()});$container.find("a.group-popup-trigger").click(function(e){var url=contextPath+"/secure/popups/GroupPickerBrowser.jspa?";url+="formName="+params.formName+"&";url+="multiSelect="+params.multiSelect+"&";url+="decorator=popup&";url+="element="+params.fieldId;var vWinUsers=window.open(url,"GroupPicker","status=yes,resizable=yes,top=100,left=100,width=800,height=750,scrollbars=yes");vWinUsers.opener=self;vWinUsers.focus();e.preventDefault()})})});
JIRA.GroupPickerUtil={formatSuggestions:function(data){var ret=[];AJS.$(data).each(function(i,suggestions){var groupDescriptor=new AJS.GroupDescriptor({weight:i,label:suggestions.header});AJS.$(suggestions.groups).each(function(){groupDescriptor.addItem(new AJS.ItemDescriptor({value:this.name,label:this.name,html:this.html}))});ret.push(groupDescriptor)});return ret}};
(function(){function initMultiGroupPickers(ctx){ctx.find(".js-default-multi-group-picker").each(function(){new AJS.MultiSelect({element:this,itemAttrDisplayed:"label",showDropdownButton:false,ajaxOptions:{data:function(query){return{query:query,exclude:this.model.getSelectedValues()}},url:JIRA.REST_BASE_URL+"/groups/picker",query:true,formatResponse:JIRA.GroupPickerUtil.formatSuggestions}})})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){initMultiGroupPickers(context)}})})();
(function($){JIRA.UserPickerUtil={formatSuggestions:function(data){var ret=[],selectedVals=this.model.getSelectedValues();$(data).each(function(i,suggestions){var selectedInList=0;var groupDescriptor=new AJS.GroupDescriptor({weight:i,label:suggestions.footer});$(suggestions.users).each(function(){if($.inArray(this.name,selectedVals)===-1){groupDescriptor.addItem(new AJS.ItemDescriptor({value:this.name,label:this.displayName,html:this.html,icon:this.avatarUrl,allowDuplicate:false}))}else{++selectedInList}});ret.push(groupDescriptor)});return ret}}})(AJS.$);
(function($){function createSingleUserPickers(ctx){var restPath="/rest/api/1.0/users/picker";$(".js-default-user-picker",ctx).each(function(){var $this=$(this);if($this.data("aui-ss")){return }var data={showAvatar:true},inputText=$this.data("inputValue");new AJS.SingleSelect({element:$this,submitInputVal:true,showDropdownButton:!!$this.data("show-dropdown-button"),errorMessage:AJS.format("There is no user \'\'{0}\'\'.","'{0}'"),ajaxOptions:{url:contextPath+restPath,query:true,minQueryLength:1,data:data,formatResponse:JIRA.UserPickerUtil.formatSuggestions},inputText:inputText})})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){createSingleUserPickers(context)}})})(AJS.$);
(function(){function initMultiUserPicker(ctx){ctx.find(".js-default-multi-user-picker").each(function(){if(AJS.params.currentUserCanBrowseUsers){new AJS.MultiSelect({element:this,itemAttrDisplayed:"label",showDropdownButton:false,removeOnUnSelect:true,submitInputVal:true,ajaxOptions:{url:contextPath+"/rest/api/1.0/users/picker",query:true,data:function(query){return{showAvatar:true,query:query,exclude:this.model.getSelectedValues()}},formatResponse:JIRA.UserPickerUtil.formatSuggestions}})}else{new AJS.NoBrowseUserNamePicker({element:this})}})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){initMultiUserPicker(context)}})})();
// This file was automatically generated from field-templates.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.Fields == 'undefined') { JIRA.Templates.Fields = {}; }


JIRA.Templates.Fields.username = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.escape) ? soy.$$escapeHtml(opt_data.displayName) : opt_data.displayName);
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Fields.recipientUsername = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li data-username="', soy.$$escapeHtml(opt_data.username), '" title=', soy.$$escapeHtml(opt_data.username), '><span><span class="user-hover" rel="', soy.$$escapeHtml(opt_data.username), '"><img src="', soy.$$escapeHtml(opt_data.icon), '" title="');
  JIRA.Templates.Fields.username(opt_data, output);
  output.append('"><span title="');
  JIRA.Templates.Fields.username(opt_data, output);
  output.append('">');
  JIRA.Templates.Fields.username(opt_data, output);
  output.append('</span></span>', (! opt_data.readOnly) ? '<span class="remove-recipient item-delete"/>' : '', '</span></li>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Fields.recipientEmail = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li data-email="', soy.$$escapeHtml(opt_data.email), '" title=', soy.$$escapeHtml(opt_data.email), '><span><img src="', soy.$$escapeHtml(opt_data.icon), '" title="', soy.$$escapeHtml(opt_data.email), '"><span title="', soy.$$escapeHtml(opt_data.email), '">', soy.$$escapeHtml(opt_data.email), '</span><span class="remove-recipient item-delete"/></span></li>');
  return opt_sb ? '' : output.toString();
};

JIRA.IssuePicker=AJS.MultiSelect.extend({_formatResponse:function(response){var ret=[],canonicalBaseUrl=(function(){var uri=parseUri(window.location);return uri.protocol+"://"+uri.authority})();if(response&&response.sections){AJS.$(response.sections).each(function(i,section){var groupDescriptor=new AJS.GroupDescriptor({weight:i,label:section.label,description:section.sub});if(section.issues&&section.issues.length>0){AJS.$(section.issues).each(function(){groupDescriptor.addItem(new AJS.ItemDescriptor({value:this.key,label:this.key+" - "+this.summaryText,icon:this.img?canonicalBaseUrl+contextPath+this.img:null,html:this.keyHtml+" - "+this.summary}))})}ret.push(groupDescriptor)})}return ret},getAjaxOptions:function(){var ajaxOptions=this._super();if(this.$field.val().length===0){delete ajaxOptions.data.currentJQL}return ajaxOptions},hasUserInputtedOption:function(){return this.$field.val().length!==0},_launchPopup:function(){function getWithDefault(value,def){if(typeof value=="undefined"||value==null){return def}else{return value}}var url,urlParam,vWinUsers,options,instance=this;JIRA.IssuePicker.callback=function(items){if(typeof items==="string"){items=JSON.parse(items)}instance._addMultipleItems(items,true);instance.$field.focus()};options=this.options.ajaxOptions.data;url=contextPath+"/secure/popups/IssuePicker.jspa?";urlParam={singleSelectOnly:"false",decorator:"popup",currentIssue:options.currentIssueKey||"",showSubTasks:getWithDefault(options.showSubTasks,false),showSubTasksParent:getWithDefault(options.showSubTaskParent,false)};if(options.currentProjectId){urlParam["currentProjectId"]=options.currentProjectId}url+=AJS.$.param(urlParam);vWinUsers=window.open(url,"IssueSelectorPopup","status=no,resizable=yes,top=100,left=200,width="+this.options.popupWidth+",height="+this.options.popupHeight+",scrollbars=yes,resizable");vWinUsers.opener=self;vWinUsers.focus()},_createFurniture:function(disabled){var $popupLink;this._super(disabled);$popupLink=this._render("popupLink");this._assignEvents("popupLink",$popupLink);this.$container.addClass("hasIcon");$popupLink.appendTo(this.$container)},handleFreeInput:function(){var values=this.$field.val().toUpperCase().match(/\S+/g);if(values){this._addMultipleItems(jQuery.map(values,function(value){return{value:value,label:value}}))}this.$field.val("")},_events:{popupLink:{click:function(e){this._launchPopup();e.preventDefault()}}},_renders:{popupLink:function(){return AJS.$("<a class='issue-picker-popup' />").attr({href:"#",title:this.options.popupLinkMessage}).text(""+this.options.popupLinkMessage+"")}}});AJS.namespace("jira.issuepicker",null,JIRA.IssuePicker);AJS.namespace("AJS.IssuePicker",null,JIRA.IssuePicker);
JIRA.LabelPicker=AJS.MultiSelect.extend({_getDefaultOptions:function(){return AJS.$.extend(true,this._super(),{ajaxOptions:{url:contextPath+"/includes/js/ajs/layer/labeldata.js",query:true},removeOnUnSelect:true,userEnteredOptionsMsg:"New Label"})},isValidItem:function(itemValue){return !/\s/.test(itemValue)},_handleServerSuggestions:function(data){if(data&&data.token){if(AJS.$.trim(this.$field.val())!==data.token){return }}this._super(data)},_handleDown:function(e){if(!this.suggestionsVisible){this._requestThenResetSuggestions();e.stopPropagation()}},_handleSpace:function(){if(AJS.$.trim(this.$field.val())!==""){if(this.handleFreeInput()){this.hideSuggestions()}}},keys:{"Spacebar":function(event){this._handleSpace();event.preventDefault()}},_formatResponse:function(data){var optgroup=new AJS.GroupDescriptor({label:"Suggestions",type:"optgroup",weight:1,styleClass:"labels-suggested"});if(data&&data.suggestions){AJS.$.each(data.suggestions,function(){optgroup.addItem(new AJS.ItemDescriptor({value:this.label,label:this.label,html:this.html}))})}return[optgroup]},handleFreeInput:function(){var values=AJS.$.trim(this.$field.val()).match(/\S+/g);if(values){for(var value,i=0;value=values[i];i++){this.addItem({value:value,label:value})}this.model.$element.trigger("change")}this.$field.val("")}});AJS.namespace("AJS.LabelPicker",null,JIRA.LabelPicker);
(function($){var emailExpression=/^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;JIRA.MultiUserListPicker=AJS.MultiSelect.extend({init:function(options){var restPath="/rest/api/1.0/users/picker";function formatResponse(response){var ret=[];$(response).each(function(i,suggestions){var groupDescriptor=new AJS.GroupDescriptor({weight:i,label:suggestions.footer});$(suggestions.users).each(function(){groupDescriptor.addItem(new AJS.ItemDescriptor({value:this.name,label:this.displayName,html:this.html,icon:this.avatarUrl,allowDuplicate:false}))});ret.push(groupDescriptor)});return ret}$.extend(options,{itemAttrDisplayed:"label",userEnteredOptionsMsg:"Email address",showDropdownButton:false,removeOnUnSelect:true,ajaxOptions:{url:contextPath+restPath,query:true,data:{showAvatar:true},formatResponse:formatResponse},itemGroup:new AJS.Group(),itemBuilder:function(descriptor){return new JIRA.MultiUserListPicker.Item({descriptor:descriptor,container:this.$selectedItemsContainer})}});this._super(options)},_createFurniture:function(disabled){this._super(disabled);if(this.options.description){this._render("description",this.options.description).insertAfter(this.$field)}},hasUserInputtedOption:function(){if(this.options.freeEmailInput){var entry=$.trim(this.$field.val());return emailExpression.test(entry)}},updateItemsIndent:function(){},_renders:{selectedItemsWrapper:function(){return $('<div class="recipients"></div>')},selectedItemsContainer:function(){return $("<ol />")},description:function(description){return $("<div />").addClass("description").text(description)}}})}(AJS.$));
JIRA.MultiUserListPicker.Item=AJS.Control.extend({init:function(options){this._setOptions(options);this.$lozenge=this._render("item");this.$removeButton=this.$lozenge.find(".remove-recipient");this._assignEvents("instance",this);this._assignEvents("lozenge",this.$lozenge);this._assignEvents("removeButton",this.$removeButton);this.$lozenge.prependTo(this.options.container)},_getDefaultOptions:function(){return{label:null,title:null,container:null,focusClass:"focused"}},_renders:{"item":function(){var descriptor=this.options.descriptor;var data;if(descriptor.noExactMatch()!==true){data={escape:false,username:descriptor.value(),icon:descriptor.icon(),displayName:AJS.escapeHtml(descriptor.label())};return AJS.$(JIRA.Templates.Fields.recipientUsername(data))}else{data={email:descriptor.value(),icon:AJS.Meta.get("default-avatar-url")};return AJS.$(JIRA.Templates.Fields.recipientEmail(data))}}},_events:{"instance":{"remove":function(){this.$lozenge.remove()}},"removeButton":{"click":function(e){e.stopPropagation();this.trigger("remove")}}}});
(function(){function initCascadingSelect(el){AJS.$(el||document.body).find("div.aui-field-cascadingselect").add("tr.aui-field-cascadingselect").add("td.aui-field-cascadingselect").each(function(){var $container=AJS.$(this),parent=$container.find(".cascadingselect-parent"),parentOptions=parent.find("option"),oldClass="",child=$container.find(".cascadingselect-child"),childOptions=child.find("option"),selectedChild=child.find(":selected");function update(){var placeholder,currentClass=parent.find("option:selected").attr("class");if(currentClass!==oldClass){placeholder=jQuery("<span />").insertAfter(child);child.detach();child.find("option").each(function(i,elem){elem.parentNode.removeChild(this)});child.insertAfter(placeholder);placeholder.remove();childOptions.filter("."+parent.find("option:selected").attr("class")).appendTo(child);if(selectedChild.hasClass(parent.find("option:selected").attr("class"))){child.val(selectedChild.val())}else{child.val(child.find("option:first").val())}oldClass=currentClass}}parent.bind("cascadingSelectChanged",update).change(function(){AJS.$(this).trigger("cascadingSelectChanged")}).trigger("cascadingSelectChanged")})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){initCascadingSelect(context)}})})();
(function(){function createPicker($selectField){new AJS.MultiSelect({element:$selectField,itemAttrDisplayed:"label",errorMessage:"{0} is not a valid component.",maxInlineResultsDisplayed:15})}function locateSelect(parent){var $parent=AJS.$(parent),$selectField;if($parent.is("select")){$selectField=$parent}else{$selectField=$parent.find("select")}return $selectField}var DEFAULT_SELECTORS=["div.aui-field-componentspicker.frother-control-renderer","td.aui-field-componentspicker.frother-control-renderer","tr.aui-field-componentspicker.frother-control-renderer"];function findComponentSelectAndConvertToPicker(context,selector){selector=selector||DEFAULT_SELECTORS.join(", ");AJS.$(selector,context).each(function(){var $selectField=locateSelect(this);if($selectField.length){createPicker($selectField)}})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){findComponentSelectAndConvertToPicker(context)}})})();
(function(){function initDatePicker(el){AJS.$(el||document.body).find("div.aui-field-datepicker").add("tr.aui-field-datepicker").add("td.aui-field-datepicker").each(function(){var $container=AJS.$(this),field=$container.find("input:text"),defaultCheckbox=$container.find("#useCurrentDate"),params=JIRA.parseOptionsFromFieldset($container.find("fieldset.datepicker-params"));params.context=el;Calendar.setup(params);function toggleField(){field.prop("disabled",defaultCheckbox.is(":checked"))}if(defaultCheckbox.length){toggleField();defaultCheckbox.click(toggleField)}})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){initDatePicker(context)}})})();
(function(){function initLegacyGroupPicker(el){AJS.$(el||document.body).find("div.aui-field-grouppicker").add("tr.aui-field-grouppicker").add("td.aui-field-grouppicker").each(function(){var $container=AJS.$(this),trigger=$container.find("a.grouppicker-trigger"),url=trigger.attr("href");function openGroupPickerWindow(e){e.preventDefault();window.open(url,"GroupPicker","status=yes,resizable=yes,top=100,left=100,width=800,height=750,scrollbars=yes")}trigger.click(openGroupPickerWindow)})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){initLegacyGroupPicker(context)}})})();
(function(){function initIssuePicker(el){AJS.$(el||document.body).find(".aui-field-issuepicker").each(function(){new JIRA.IssuePicker({element:AJS.$(this),userEnteredOptionsMsg:"Enter issue key",uppercaseUserEnteredOnSelect:true})})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){initIssuePicker(context)}})})();
(function(){function createPicker($fieldset,context){var opts=JIRA.parseOptionsFromFieldset($fieldset),$select=AJS.$("#"+opts.id,context),issueId=opts.issueId,data={};if(/customfield_\d/.test(opts.id)){data.customFieldId=parseInt(opts.id.replace("customfield_",""),10)}new JIRA.LabelPicker({element:$select,ajaxOptions:{url:contextPath+"/rest/api/1.0/labels"+(issueId?"/"+issueId:"")+"/suggest",data:data}})}function locateFieldset(parent){var $parent=AJS.$(parent),$fieldset;if($parent.is(FIELDSET_SELECTOR)){$fieldset=$parent}else{$fieldset=$parent.find(FIELDSET_SELECTOR)}return $fieldset}var DEFAULT_SELECTORS=["div.aui-field-labelpicker","td.aui-field-labelpicker","tr.aui-field-labelpicker"];var FIELDSET_SELECTOR="fieldset.labelpicker-params";function findLabelsFieldsetAndConvertToPicker(context,selector){selector=selector||DEFAULT_SELECTORS.join(", ");AJS.$(selector,context).each(function(){var $fieldset=locateFieldset(this);if($fieldset.length>0){createPicker($fieldset,context)}})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){findLabelsFieldsetAndConvertToPicker(context)}})})();
(function(){function createPicker($selectField){new AJS.MultiSelect({element:$selectField,itemAttrDisplayed:"label",removeOnUnSelect:false,submitInputVal:true,errorMessage:"{0} is not a valid version.",maxInlineResultsDisplayed:15})}function locateSelect(parent){var $parent=AJS.$(parent),$selectField;if($parent.is("select")){$selectField=$parent}else{$selectField=$parent.find("select")}return $selectField}var DEFAULT_SELECTORS=["div.aui-field-versionspicker.frother-control-renderer","td.aui-field-versionspicker.frother-control-renderer","tr.aui-field-versionspicker.frother-control-renderer"];function findVersionSelectAndConvertToPicker(context,selector){selector=selector||DEFAULT_SELECTORS.join(", ");AJS.$(selector,context).each(function(){var $selectField=locateSelect(this);if($selectField.length){createPicker($selectField)}})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){findVersionSelectAndConvertToPicker(context)}})})();
(function(){function applyCommentControls(context){if(context.attr("id")==="addcomment"){context=AJS.$("#issue-comment-add")}var securityLevelSelects=jQuery("#commentLevel",context);securityLevelSelects.each(function(){new AJS.SecurityLevelSelect(AJS.$(this,context))});var wikiRenders=jQuery(".wiki-js-prefs",context);wikiRenders.each(function(){JIRA.wikiPreview(this,context).init()})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){applyCommentControls(context)})})();
JIRA.ProjectIssueTypeSelect=Class.extend({init:function(options){var val,instance=this;this.$project=options.project;this.backgroundImages=this.removeBackgroundImages(options.issueTypeSelect);this.$refIssueTypeSelect=jQuery(options.issueTypeSelect).clone(true,true);this.$issueTypeSelect=options.issueTypeSelect;this.$projectIssueTypesSchemes=options.projectIssueTypesSchemes;this.$issueTypeSchemeIssueDefaults=options.issueTypeSchemeIssueDefaults;this.projectIssueTypeSchemes=this.getProjectIssueTypeSchemesFromDom();this.issueTypesSchemeDefaults=this.getIssueTypeSchemeIssueDefaults();if(instance.$project.length>0){val=instance.$project.val();instance.setIssueTypeScheme(instance.getIssueTypeSchemeForProject(val));if(this.$project.is("select")){this.$project.change(function(){var val=instance.$project.val();instance.lastIssueType=instance.$issueTypeSelect.find(":selected:first").val();instance.$refIssueTypeSelect.val("");instance.setIssueTypeScheme(instance.getIssueTypeSchemeForProject(val));instance.$issueTypeSelect.trigger("reset")})}}},getIssueTypeSchemeForProject:function(projectId){return this.projectIssueTypeSchemes[projectId]},getDefaultIssueTypeForScheme:function(issueTypeSchemeId){return this.issueTypesSchemeDefaults[issueTypeSchemeId]},removeBackgroundImages:function(issueTypeSelect){var map={};jQuery(issueTypeSelect).find("option[style]").each(function(){map[jQuery(this).attr("id")]=jQuery(this).css("background-image");jQuery(this).attr("style","");jQuery(this).removeAttr("style")});return map},addBackgroundImages:function(){var that=this;this.$issueTypeSelect.find("option").each(function(){jQuery(this).css("background-image",that.backgroundImages[jQuery(this).attr("id")])})},setIssueTypeScheme:function(issueTypeSchemeId){var selectedIssueType,instance=this,$toSelect,$placeholder=jQuery("<span class='hidden' />"),$optgroups=this.$refIssueTypeSelect.find("optgroup");$placeholder.insertAfter(this.$issueTypeSelect);this.$issueTypeSelect.detach().empty();if($optgroups.length){$optgroups.each(function(){var $optgroup=jQuery(this);if($optgroup.is("[data-scheme-id='"+issueTypeSchemeId+"']")){instance.$issueTypeSelect.append($optgroup.clone(true).children());return false}})}else{this.$issueTypeSelect.append(this.$refIssueTypeSelect.children())}selectedIssueType=this.$issueTypeSelect.find("option[data-selected]").val()||"";if(instance.lastIssueType){$toSelect=this.$issueTypeSelect.find("option[value='"+instance.lastIssueType+"']")}else{if(selectedIssueType){$toSelect=this.$issueTypeSelect.find("option[value='"+selectedIssueType+"']")}}if($toSelect&&$toSelect.length!==0){$toSelect.attr("selected","selected");this.$issueTypeSelect.val($toSelect.val())}else{this.setDefaultIssueType(issueTypeSchemeId)}this.$issueTypeSelect.insertAfter($placeholder);this.addBackgroundImages();this.$issueTypeSelect.attr("data-project",this.$project.val());$placeholder.remove()},setDefaultIssueType:function(issueTypeSchemeId){var defaultIssueType=this.getDefaultIssueTypeForScheme(issueTypeSchemeId);if(defaultIssueType!==""){this.$issueTypeSelect.find("option[value='"+defaultIssueType+"']").attr("selected","selected")}else{this.$issueTypeSelect.find("option").each(function(i,option){if(this.value&&this.value!==""){jQuery(option).attr("selected","selected");return false}})}},getProjectIssueTypeSchemesFromDom:function(){var projectIssueTypes={};this.$projectIssueTypesSchemes.find("input").each(function(i,input){var $input=jQuery(input),project=$input.attr("title"),issueTypes=$input.val();projectIssueTypes[project]=issueTypes});return projectIssueTypes},getIssueTypeSchemeIssueDefaults:function(){var issueTypesSchemeDefaults={};this.$issueTypeSchemeIssueDefaults.find("input").each(function(i,input){var $input=jQuery(input),issueTypeScheme=$input.attr("title"),defaultIssueType=$input.val();issueTypesSchemeDefaults[issueTypeScheme]=defaultIssueType});return issueTypesSchemeDefaults}});
(function(){function findProjectAndIssueTypeSelectAndConvertToPicker(ctx){var $ctx=ctx||jQuery("body"),$project=$ctx.find(".project-field, .project-field-readonly"),$issueTypeSelect=$ctx.find(".issuetype-field"),$projectIssueTypes=$ctx.find(".project-issue-types"),$defaultProjectIssueTypes=$ctx.find(".default-project-issue-type");$project.each(function(i){new JIRA.ProjectIssueTypeSelect({project:jQuery(this),issueTypeSelect:$issueTypeSelect.eq(i),projectIssueTypesSchemes:$projectIssueTypes.eq(i),issueTypeSchemeIssueDefaults:$defaultProjectIssueTypes.eq(i)})})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){findProjectAndIssueTypeSelectAndConvertToPicker(context)}})})();
(function(){function createissueTypePicker(context){context.find(".issuetype-field").each(function(){var $select=jQuery(this);$select.bind("reset",function(){$select.find("option[value='']").remove()}).trigger("reset");new AJS.SingleSelect({element:this,revertOnInvalid:true})})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){createissueTypePicker(context)}})})();
(function(){function createProjectPicker(context){context.find(".project-field").each(function(){new AJS.SingleSelect({element:this,revertOnInvalid:true})})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){createProjectPicker(context)}})})();
(function($){JIRA.Events.VALIDATE_TIMETRACKING="validateTimeTracking";function toggleTimeTrackingContainer(context,activate){var $logWorkContainer=$(context).find("#worklog-logworkcontainer"),$timeTrackingContainer=$(context).find("#worklog-timetrackingcontainer"),$logWorkCheckbox=$(context).find("#log-work-activate");if(activate){$logWorkContainer.removeClass("hidden");$timeTrackingContainer.addClass("hidden");$logWorkCheckbox.prop("checked",true)}else{$logWorkContainer.addClass("hidden");$timeTrackingContainer.removeClass("hidden");$logWorkCheckbox.prop("checked",false)}}function applyLogworkControls(context){$("#log-work-adjust-estimate-new-value, #log-work-adjust-estimate-manual-value",context).attr("disabled","disabled");$("#log-work-adjust-estimate-"+$("input[name=worklog_adjustEstimate]:checked,input[name=adjustEstimate]:checked",context).val()+"-value",context).removeAttr("disabled");$("input[name=worklog_adjustEstimate],input[name=adjustEstimate]",context).change(function(){$("#log-work-adjust-estimate-new-value,#log-work-adjust-estimate-manual-value",context).attr("disabled","disabled");$("#log-work-adjust-estimate-"+$(this).val()+"-value",context).removeAttr("disabled")});$(context).find("#log-work-activate").change(function(){toggleTimeTrackingContainer(context,$(this).is(":checked"))})}JIRA.bind(JIRA.Events.VALIDATE_TIMETRACKING,function(e,context){toggleTimeTrackingContainer(context,true)});JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){applyLogworkControls(context)}})})(AJS.$);
(function($){function createPriorityPicker(context){context.find("select#priority").each(function(i,el){new AJS.SingleSelect({element:el,revertOnInvalid:true})})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){createPriorityPicker(context)}})})(AJS.$);
(function(){function createInlineAttach(context){context.find("input[type=file]:not('.ignore-inline-attach')").inlineAttach()}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){createInlineAttach(context)}})})();
(function($){$.fn.ieImitationPlaceholder=function(){if($.browser.msie){var form=this,fields=form.find("[placeholder]");fields.focus(clearTextIfUnchanged);fields.blur(setTextFromPlaceholder);form.submit(clearAllIfUnchanged);fields.each(setTextFromPlaceholder);function setTextFromPlaceholder(){var field=$(this);if(field.text()===""){field.text(field.attr("placeholder"))}}function clearTextIfUnchanged(){var field=$(this);if(field.text()===field.attr("placeholder")){field.text("")}}function clearAllIfUnchanged(){fields.each(clearTextIfUnchanged)}}}})(AJS.$);
/*
 * Copyright 2008 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview
 * Utility functions and classes for Soy.
 *
 * <p>
 * The top portion of this file contains utilities for Soy users:<ul>
 *   <li> soy.StringBuilder: Compatible with the 'stringbuilder' code style.
 *   <li> soy.renderElement: Render template and set as innerHTML of an element.
 *   <li> soy.renderAsFragment: Render template and return as HTML fragment.
 * </ul>
 *
 * <p>
 * The bottom portion of this file contains utilities that should only be called
 * by Soy-generated JS code. Please do not use these functions directly from
 * your hand-writen code. Their names all start with '$$'.
 *
 * @author Mike Samuel
 * @author Kai Huang
 * @author Aharon Lenin
 */


// COPIED FROM nogoog_shim.js

// Create closure namespaces.
var goog;
if (typeof goog == "undefined") {
  goog = {};
}

goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {}
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};


// Just enough browser detection for this file.
if (!goog.userAgent) {
  goog.userAgent = (function() {
    var userAgent = "";
    if ("undefined" !== typeof navigator && navigator
        && "string" == typeof navigator.userAgent) {
      userAgent = navigator.userAgent;
    }
    var isOpera = userAgent.indexOf('Opera') == 0;
    return {
      /**
       * @type {boolean}
       */
      HAS_JSCRIPT: typeof 'ScriptEngine' in this,
      /**
       * @type {boolean}
       */
      IS_OPERA: isOpera,
      /**
       * @type {boolean}
       */
      IS_IE: !isOpera && userAgent.indexOf('MSIE') != -1,
      /**
       * @type {boolean}
       */
      IS_WEBKIT: !isOpera && userAgent.indexOf('WebKit') != -1
    };
  })();
}

if (!goog.asserts) {
  goog.asserts = {
    fail: function () {}
  };
}


// Stub out the document wrapper used by renderAs*.
if (!goog.dom) {
  goog.dom = {
    DomHelper: function (d) {
      d = d || document;
      return {
        createElement: function (name) { return d.createElement(name); },
        createDocumentFragment: function () {
          return d.createDocumentFragment();
        }
      };
    }
  };
}


if (!goog.format) {
  goog.format = {
    insertWordBreaks: function(str, maxCharsBetweenWordBreaks) {
      str = String(str);

      var resultArr = [];
      var resultArrLen = 0;

      // These variables keep track of important state inside str.
      var isInTag = false;  // whether we're inside an HTML tag
      var isMaybeInEntity = false;  // whether we might be inside an HTML entity
      var numCharsWithoutBreak = 0;  // number of chars since last word break
      var flushIndex = 0;  // index of first char not yet flushed to resultArr

      for (var i = 0, n = str.length; i < n; ++i) {
        var charCode = str.charCodeAt(i);

        // If hit maxCharsBetweenWordBreaks, and not space next, then add <wbr>.
        if (numCharsWithoutBreak >= maxCharsBetweenWordBreaks &&
            // space
            charCode != 32) {
          resultArr[resultArrLen++] = str.substring(flushIndex, i);
          flushIndex = i;
          resultArr[resultArrLen++] = goog.format.WORD_BREAK;
          numCharsWithoutBreak = 0;
        }

        if (isInTag) {
          // If inside an HTML tag and we see '>', it's the end of the tag.
          if (charCode == 62) {
            isInTag = false;
          }

        } else if (isMaybeInEntity) {
          switch (charCode) {
            // Inside an entity, a ';' is the end of the entity.
            // The entity that just ended counts as one char, so increment
            // numCharsWithoutBreak.
          case 59:  // ';'
            isMaybeInEntity = false;
            ++numCharsWithoutBreak;
            break;
            // If maybe inside an entity and we see '<', we weren't actually in
            // an entity. But now we're inside and HTML tag.
          case 60:  // '<'
            isMaybeInEntity = false;
            isInTag = true;
            break;
            // If maybe inside an entity and we see ' ', we weren't actually in
            // an entity. Just correct the state and reset the
            // numCharsWithoutBreak since we just saw a space.
          case 32:  // ' '
            isMaybeInEntity = false;
            numCharsWithoutBreak = 0;
            break;
          }

        } else {  // !isInTag && !isInEntity
          switch (charCode) {
            // When not within a tag or an entity and we see '<', we're now
            // inside an HTML tag.
          case 60:  // '<'
            isInTag = true;
            break;
            // When not within a tag or an entity and we see '&', we might be
            // inside an entity.
          case 38:  // '&'
            isMaybeInEntity = true;
            break;
            // When we see a space, reset the numCharsWithoutBreak count.
          case 32:  // ' '
            numCharsWithoutBreak = 0;
            break;
            // When we see a non-space, increment the numCharsWithoutBreak.
          default:
            ++numCharsWithoutBreak;
            break;
          }
        }
      }

      // Flush the remaining chars at the end of the string.
      resultArr[resultArrLen++] = str.substring(flushIndex);

      return resultArr.join('');
    },
    /**
     * String inserted as a word break by insertWordBreaks(). Safari requires
     * <wbr></wbr>, Opera needs the 'shy' entity, though this will give a
     * visible hyphen at breaks. Other browsers just use <wbr>.
     * @type {string}
     * @private
     */
    WORD_BREAK: goog.userAgent.IS_WEBKIT
        ? '<wbr></wbr>' : goog.userAgent.IS_OPERA ? '&shy;' : '<wbr>'
  };
}


if (!goog.i18n) {
  goog.i18n = {
    /**
     * Utility class for formatting text for display in a potentially
     * opposite-directionality context without garbling. Provides the following
     * functionality:
     *
     * @param {goog.i18n.bidi.Dir|number|boolean} contextDir The context
     *     directionality as a number
     *     (positive = LRT, negative = RTL, 0 = unknown).
     * @constructor
     */
    BidiFormatter: function (dir) {
      this.dir_ = dir;
    },
    bidi: {
      /**
       * Check the directionality of a piece of text, return true if the piece
       * of text should be laid out in RTL direction.
       * @param {string} text The piece of text that need to be detected.
       * @param {boolean=} opt_isHtml Whether {@code text} is HTML/HTML-escaped.
       *     Default: false.
       * @return {boolean}
       * @private
       */
      detectRtlDirectionality: function(text, opt_isHtml) {
        text = soyshim.$$bidiStripHtmlIfNecessary_(text, opt_isHtml);
        return soyshim.$$bidiRtlWordRatio_(text)
            > soyshim.$$bidiRtlDetectionThreshold_;
      }
    }
  };
}


/**
 * Returns "dir=ltr" or "dir=rtl", depending on {@code text}'s estimated
 * directionality, if it is not the same as the context directionality.
 * Otherwise, returns the empty string.
 *
 * @param {string} text Text whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether {@code text} is HTML / HTML-escaped.
 *     Default: false.
 * @return {string} "dir=rtl" for RTL text in non-RTL context; "dir=ltr" for LTR
 *     text in non-LTR context; else, the empty string.
 */
goog.i18n.BidiFormatter.prototype.dirAttr = function (text, opt_isHtml) {
  var dir = soy.$$bidiTextDir(text, opt_isHtml);
  return dir && dir != this.dir_ ? dir < 0 ? 'dir=rtl' : 'dir=ltr' : '';
};

/**
 * Returns the trailing horizontal edge, i.e. "right" or "left", depending on
 * the global bidi directionality.
 * @return {string} "left" for RTL context and "right" otherwise.
 */
goog.i18n.BidiFormatter.prototype.endEdge = function () {
  return this.dir_ < 0 ? 'left' : 'right';
};

/**
 * Returns the Unicode BiDi mark matching the context directionality (LRM for
 * LTR context directionality, RLM for RTL context directionality), or the
 * empty string for neutral / unknown context directionality.
 *
 * @return {string} LRM for LTR context directionality and RLM for RTL context
 *     directionality.
 */
goog.i18n.BidiFormatter.prototype.mark = function () {
  return (
      (this.dir_ > 0) ? '\u200E' /*LRM*/ :
      (this.dir_ < 0) ? '\u200F' /*RLM*/ :
      '');
};

/**
 * Returns a Unicode BiDi mark matching the context directionality (LRM or RLM)
 * if the directionality or the exit directionality of {@code text} are opposite
 * to the context directionality. Otherwise returns the empty string.
 *
 * @param {string} text The input text.
 * @param {boolean=} opt_isHtml Whether {@code text} is HTML / HTML-escaped.
 *     Default: false.
 * @return {string} A Unicode bidi mark matching the global directionality or
 *     the empty string.
 */
goog.i18n.BidiFormatter.prototype.markAfter = function (text, opt_isHtml) {
  var dir = soy.$$bidiTextDir(text, opt_isHtml);
  return soyshim.$$bidiMarkAfterKnownDir_(this.dir_, dir, text, opt_isHtml);
};

/**
 * Formats a string of unknown directionality for use in HTML output of the
 * context directionality, so an opposite-directionality string is neither
 * garbled nor garbles what follows it.
 *
 * @param {string} str The input text.
 * @return {string} Input text after applying the above processing.
 */
goog.i18n.BidiFormatter.prototype.spanWrap = function(str) {
  str = String(str);
  var textDir = soy.$$bidiTextDir(str, true);
  var reset = soyshim.$$bidiMarkAfterKnownDir_(this.dir_, textDir, str, true);
  if (textDir > 0 && this.dir_ <= 0) {
    str = '<span dir=ltr>' + str + '</span>';
  } else if (textDir < 0 && this.dir_ >= 0) {
    str = '<span dir=rtl>' + str + '</span>';
  }
  return str + reset;
};

/**
 * Returns the leading horizontal edge, i.e. "left" or "right", depending on
 * the global bidi directionality.
 * @return {string} "right" for RTL context and "left" otherwise.
 */
goog.i18n.BidiFormatter.prototype.startEdge = function () {
  return this.dir_ < 0 ? 'right' : 'left';
};

/**
 * Formats a string of unknown directionality for use in plain-text output of
 * the context directionality, so an opposite-directionality string is neither
 * garbled nor garbles what follows it.
 * As opposed to {@link #spanWrap}, this makes use of unicode BiDi formatting
 * characters. In HTML, its *only* valid use is inside of elements that do not
 * allow mark-up, e.g. an 'option' tag.
 *
 * @param {string} str The input text.
 * @return {string} Input text after applying the above processing.
 */
goog.i18n.BidiFormatter.prototype.unicodeWrap = function(str) {
  str = String(str);
  var textDir = soy.$$bidiTextDir(str, true);
  var reset = soyshim.$$bidiMarkAfterKnownDir_(this.dir_, textDir, str, true);
  if (textDir > 0 && this.dir_ <= 0) {
    str = '\u202A' + str + '\u202C';
  } else if (textDir < 0 && this.dir_ >= 0) {
    str = '\u202B' + str + '\u202C';
  }
  return str + reset;
};


goog.string = {
  /**
   * Utility class to facilitate much faster string concatenation in IE,
   * using Array.join() rather than the '+' operator.  For other browsers
   * we simply use the '+' operator.
   *
   * @param {Object|number|string|boolean=} opt_a1 Optional first initial item
   *     to append.
   * @param {...Object|number|string|boolean} var_args Other initial items to
   *     append, e.g., new goog.string.StringBuffer('foo', 'bar').
   * @constructor
   */
  StringBuffer: function(opt_a1, var_args) {

    /**
     * Internal buffer for the string to be concatenated.
     * @type {string|Array}
     * @private
     */
    this.buffer_ = goog.userAgent.HAS_JSCRIPT ? [] : '';

    if (opt_a1 != null) {
      this.append.apply(this, arguments);
    }
  },
  /**
   * Converts \r\n, \r, and \n to <br>s
   * @param {*} str The string in which to convert newlines.
   * @return {string} A copy of {@code str} with converted newlines.
   */
  newlineToBr: function(str) {

    str = String(str);

    // This quick test helps in the case when there are no chars to replace,
    // in the worst case this makes barely a difference to the time taken.
    if (!goog.string.NEWLINE_TO_BR_RE_.test(str)) {
      return str;
    }

    return str.replace(/(\r\n|\r|\n)/g, '<br>');
  },
  urlEncode: encodeURIComponent,
  /**
   * Regular expression used within newlineToBr().
   * @type {RegExp}
   * @private
   */
  NEWLINE_TO_BR_RE: /[\r\n]/
};


/**
 * Length of internal buffer (faster than calling buffer_.length).
 * Only used for IE.
 * @type {number}
 * @private
 */
goog.string.StringBuffer.prototype.bufferLength_ = 0;

/**
 * Appends one or more items to the string.
 *
 * Calling this with null, undefined, or empty arguments is an error.
 *
 * @param {Object|number|string|boolean} a1 Required first string.
 * @param {Object|number|string|boolean=} opt_a2 Optional second string.
 * @param {...Object|number|string|boolean} var_args Other items to append,
 *     e.g., sb.append('foo', 'bar', 'baz').
 * @return {goog.string.StringBuffer} This same StringBuilder object.
 */
goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {

  if (goog.userAgent.HAS_JSCRIPT) {
    if (opt_a2 == null) {  // no second argument (note: undefined == null)
      // Array assignment is 2x faster than Array push.  Also, use a1
      // directly to avoid arguments instantiation, another 2x improvement.
      this.buffer_[this.bufferLength_++] = a1;
    } else {
      var arr = /**@type {Array.<number|string|boolean>}*/this.buffer_;
      arr.push.apply(arr, arguments);
      this.bufferLength_ = this.buffer_.length;
    }

  } else {

    // Use a1 directly to avoid arguments instantiation for single-arg case.
    this.buffer_ += a1;
    if (opt_a2 != null) {  // no second argument (note: undefined == null)
      for (var i = 1; i < arguments.length; i++) {
        this.buffer_ += arguments[i];
      }
    }
  }

  return this;
};


/**
 * Clears the string.
 */
goog.string.StringBuffer.prototype.clear = function() {

  if (goog.userAgent.HAS_JSCRIPT) {
     this.buffer_.length = 0;  // reuse array to avoid creating new object
     this.bufferLength_ = 0;

   } else {
     this.buffer_ = '';
   }
};


/**
 * Returns the concatenated string.
 *
 * @return {string} The concatenated string.
 */
goog.string.StringBuffer.prototype.toString = function() {

  if (goog.userAgent.HAS_JSCRIPT) {
    var str = this.buffer_.join('');
    // Given a string with the entire contents, simplify the StringBuilder by
    // setting its contents to only be this string, rather than many fragments.
    this.clear();
    if (str) {
      this.append(str);
    }
    return str;

  } else {
    return /** @type {string} */ (this.buffer_);
  }
};


if (!goog.soy) goog.soy = {
  /**
   * Helper function to render a Soy template and then set the
   * output string as the innerHTML of an element. It is recommended
   * to use this helper function instead of directly setting
   * innerHTML in your hand-written code, so that it will be easier
   * to audit the code for cross-site scripting vulnerabilities.
   *
   * @param {Element} element The element whose content we are rendering.
   * @param {Function} template The Soy template defining element's content.
   * @param {Object=} opt_templateData The data for the template.
   * @param {Object=} opt_injectedData The injected data for the template.
   */
  renderAsElement: function(
    template, opt_templateData, opt_injectedData, opt_document) {
    return /** @type {!Element} */ (soyshim.$$renderWithWrapper_(
        template, opt_templateData, opt_document, true /* asElement */,
        opt_injectedData));
  },
  /**
   * Helper function to render a Soy template into a single node or
   * a document fragment. If the rendered HTML string represents a
   * single node, then that node is returned (note that this is
   * *not* a fragment, despite them name of the method). Otherwise a
   * document fragment is returned containing the rendered nodes.
   *
   * @param {Function} template The Soy template defining element's content.
   * @param {Object=} opt_templateData The data for the template.
   * @param {Document=} opt_document The document used to create DOM nodes.
   *     If not specified, global document object is used.
   * @param {Object=} opt_injectedData The injected data for the template.
   * @return {!Node} The resulting node or document fragment.
   */
  renderAsFragment: function(
    template, opt_templateData, opt_injectedData, opt_document) {
    return soyshim.$$renderWithWrapper_(
        template, opt_templateData, opt_document, false /* asElement */,
        opt_injectedData);
  },
  /**
   * Helper function to render a Soy template and then set the output string as
   * the innerHTML of an element. It is recommended to use this helper function
   * instead of directly setting innerHTML in your hand-written code, so that it
   * will be easier to audit the code for cross-site scripting vulnerabilities.
   *
   * NOTE: New code should consider using goog.soy.renderElement instead.
   *
   * @param {Element} element The element whose content we are rendering.
   * @param {Function} template The Soy template defining the element's content.
   * @param {Object=} opt_templateData The data for the template.
   * @param {Object=} opt_injectedData The injected data for the template.
   */
  renderElement: function(
      element, template, opt_templateData, opt_injectedData) {
    element.innerHTML = template(opt_templateData, null, opt_injectedData);
  }
};


var soy = { esc: {} };
var soydata = {};
var soyshim = {};
/**
 * Helper function to render a Soy template into a single node or a document
 * fragment. If the rendered HTML string represents a single node, then that
 * node is returned. Otherwise a document fragment is created and returned
 * (wrapped in a DIV element if #opt_singleNode is true).
 *
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 * @param {Document=} opt_document The document used to create DOM nodes. If
 *     not specified, global document object is used.
 * @param {boolean=} opt_asElement Whether to wrap the fragment in an
 *     element if the template does not render a single element. If true,
 *     result is always an Element.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @return {!Node} The resulting node or document fragment.
 * @private
 */
soyshim.$$renderWithWrapper_ = function(
    template, opt_templateData, opt_document, opt_asElement, opt_injectedData) {

  var doc = opt_document || document;
  var wrapper = doc.createElement('div');
  wrapper.innerHTML = template(
    opt_templateData || soyshim.$$DEFAULT_TEMPLATE_DATA_, undefined,
    opt_injectedData);

  // If the template renders as a single element, return it.
  if (wrapper.childNodes.length == 1) {
    var firstChild = wrapper.firstChild;
    if (!opt_asElement || firstChild.nodeType == 1 /* Element */) {
      return /** @type {!Node} */ (firstChild);
    }
  }

  // If we're forcing it to be a single element, return the wrapper DIV.
  if (opt_asElement) {
    return wrapper;
  }

  // Otherwise, create and return a fragment.
  var fragment = doc.createDocumentFragment();
  while (wrapper.firstChild) {
    fragment.appendChild(wrapper.firstChild);
  }
  return fragment;
};


/**
 * Returns a Unicode BiDi mark matching bidiGlobalDir (LRM or RLM) if the
 * directionality or the exit directionality of text are opposite to
 * bidiGlobalDir. Otherwise returns the empty string.
 * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
 * in text, making the logic suitable for HTML and HTML-escaped text.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {number} dir text's directionality: 1 if ltr, -1 if rtl, 0 if unknown.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {string} A Unicode bidi mark matching bidiGlobalDir, or
 *     the empty string when text's overall and exit directionalities both match
 *     bidiGlobalDir, or bidiGlobalDir is 0 (unknown).
 * @private
 */
soyshim.$$bidiMarkAfterKnownDir_ = function(
    bidiGlobalDir, dir, text, opt_isHtml) {
  return (
      bidiGlobalDir > 0 && (dir < 0 ||
          soyshim.$$bidiIsRtlExitText_(text, opt_isHtml)) ? '\u200E' : // LRM
      bidiGlobalDir < 0 && (dir > 0 ||
          soyshim.$$bidiIsLtrExitText_(text, opt_isHtml)) ? '\u200F' : // RLM
      '');
};


/**
 * Strips str of any HTML mark-up and escapes. Imprecise in several ways, but
 * precision is not very important, since the result is only meant to be used
 * for directionality detection.
 * @param {string} str The string to be stripped.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {string} The stripped string.
 * @private
 */
soyshim.$$bidiStripHtmlIfNecessary_ = function(str, opt_isHtml) {
  return opt_isHtml ? str.replace(soyshim.$$BIDI_HTML_SKIP_RE_, ' ') : str;
};


/**
 * Simplified regular expression for am HTML tag (opening or closing) or an HTML
 * escape - the things we want to skip over in order to ignore their ltr
 * characters.
 * @type {RegExp}
 * @private
 */
soyshim.$$BIDI_HTML_SKIP_RE_ = /<[^>]*>|&[^;]+;/g;


/**
 * A practical pattern to identify strong LTR character. This pattern is not
 * theoretically correct according to unicode standard. It is simplified for
 * performance and small code size.
 * @type {string}
 * @private
 */
soyshim.$$bidiLtrChars_ =
    'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
    '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF';


/**
 * A practical pattern to identify strong neutral and weak character. This
 * pattern is not theoretically correct according to unicode standard. It is
 * simplified for performance and small code size.
 * @type {string}
 * @private
 */
soyshim.$$bidiNeutralChars_ =
    '\u0000-\u0020!-@[-`{-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF';


/**
 * A practical pattern to identify strong RTL character. This pattern is not
 * theoretically correct according to unicode standard. It is simplified for
 * performance and small code size.
 * @type {string}
 * @private
 */
soyshim.$$bidiRtlChars_ = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC';


/**
 * Regular expressions to check if a piece of text is of RTL directionality
 * on first character with strong directionality.
 * @type {RegExp}
 * @private
 */
soyshim.$$bidiRtlDirCheckRe_ = new RegExp(
    '^[^' + soyshim.$$bidiLtrChars_ + ']*[' + soyshim.$$bidiRtlChars_ + ']');


/**
 * Regular expressions to check if a piece of text is of neutral directionality.
 * Url are considered as neutral.
 * @type {RegExp}
 * @private
 */
soyshim.$$bidiNeutralDirCheckRe_ = new RegExp(
    '^[' + soyshim.$$bidiNeutralChars_ + ']*$|^http://');


/**
 * Check the directionality of the a piece of text based on the first character
 * with strong directionality.
 * @param {string} str string being checked.
 * @return {boolean} return true if rtl directionality is being detected.
 * @private
 */
soyshim.$$bidiIsRtlText_ = function(str) {
  return soyshim.$$bidiRtlDirCheckRe_.test(str);
};


/**
 * Check the directionality of the a piece of text based on the first character
 * with strong directionality.
 * @param {string} str string being checked.
 * @return {boolean} true if all characters have neutral directionality.
 * @private
 */
soyshim.$$bidiIsNeutralText_ = function(str) {
  return soyshim.$$bidiNeutralDirCheckRe_.test(str);
};


/**
 * This constant controls threshold of rtl directionality.
 * @type {number}
 * @private
 */
soyshim.$$bidiRtlDetectionThreshold_ = 0.40;


/**
 * Returns the RTL ratio based on word count.
 * @param {string} str the string that need to be checked.
 * @return {number} the ratio of RTL words among all words with directionality.
 * @private
 */
soyshim.$$bidiRtlWordRatio_ = function(str) {
  var rtlCount = 0;
  var totalCount = 0;
  var tokens = str.split(' ');
  for (var i = 0; i < tokens.length; i++) {
    if (soyshim.$$bidiIsRtlText_(tokens[i])) {
      rtlCount++;
      totalCount++;
    } else if (!soyshim.$$bidiIsNeutralText_(tokens[i])) {
      totalCount++;
    }
  }

  return totalCount == 0 ? 0 : rtlCount / totalCount;
};


/**
 * Regular expressions to check if the last strongly-directional character in a
 * piece of text is LTR.
 * @type {RegExp}
 * @private
 */
soyshim.$$bidiLtrExitDirCheckRe_ = new RegExp(
    '[' + soyshim.$$bidiLtrChars_ + '][^' + soyshim.$$bidiRtlChars_ + ']*$');


/**
 * Regular expressions to check if the last strongly-directional character in a
 * piece of text is RTL.
 * @type {RegExp}
 * @private
 */
soyshim.$$bidiRtlExitDirCheckRe_ = new RegExp(
    '[' + soyshim.$$bidiRtlChars_ + '][^' + soyshim.$$bidiLtrChars_ + ']*$');


/**
 * Check if the exit directionality a piece of text is LTR, i.e. if the last
 * strongly-directional character in the string is LTR.
 * @param {string} str string being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether LTR exit directionality was detected.
 * @private
 */
soyshim.$$bidiIsLtrExitText_ = function(str, opt_isHtml) {
  str = soyshim.$$bidiStripHtmlIfNecessary_(str, opt_isHtml);
  return soyshim.$$bidiLtrExitDirCheckRe_.test(str);
};


/**
 * Check if the exit directionality a piece of text is RTL, i.e. if the last
 * strongly-directional character in the string is RTL.
 * @param {string} str string being checked.
 * @param {boolean=} opt_isHtml Whether str is HTML / HTML-escaped.
 *     Default: false.
 * @return {boolean} Whether RTL exit directionality was detected.
 * @private
 */
soyshim.$$bidiIsRtlExitText_ = function(str, opt_isHtml) {
  str = soyshim.$$bidiStripHtmlIfNecessary_(str, opt_isHtml);
  return soyshim.$$bidiRtlExitDirCheckRe_.test(str);
};


// =============================================================================
// COPIED FROM soyutils_usegoog.js


// -----------------------------------------------------------------------------
// StringBuilder (compatible with the 'stringbuilder' code style).


/**
 * Utility class to facilitate much faster string concatenation in IE,
 * using Array.join() rather than the '+' operator.  For other browsers
 * we simply use the '+' operator.
 *
 * @param {Object} var_args Initial items to append,
 *     e.g., new soy.StringBuilder('foo', 'bar').
 * @constructor
 */
soy.StringBuilder = goog.string.StringBuffer;


// -----------------------------------------------------------------------------
// soydata: Defines typed strings, e.g. an HTML string {@code "a<b>c"} is
// semantically distinct from the plain text string {@code "a<b>c"} and smart
// templates can take that distinction into account.

/**
 * A type of textual content.
 * @enum {number}
 */
soydata.SanitizedContentKind = {

  /**
   * A snippet of HTML that does not start or end inside a tag, comment, entity,
   * or DOCTYPE; and that does not contain any executable code
   * (JS, {@code <object>}s, etc.) from a different trust domain.
   */
  HTML: 0,

  /**
   * A sequence of code units that can appear between quotes (either kind) in a
   * JS program without causing a parse error, and without causing any side
   * effects.
   * <p>
   * The content should not contain unescaped quotes, newlines, or anything else
   * that would cause parsing to fail or to cause a JS parser to finish the
   * string its parsing inside the content.
   * <p>
   * The content must also not end inside an escape sequence ; no partial octal
   * escape sequences or odd number of '{@code \}'s at the end.
   */
  JS_STR_CHARS: 1,

  /** A properly encoded portion of a URI. */
  URI: 2,

  /** An attribute name and value such as {@code dir="ltr"}. */
  HTML_ATTRIBUTE: 3
};


/**
 * A string-like object that carries a content-type.
 * @param {string} content
 * @constructor
 * @private
 */
soydata.SanitizedContent = function(content) {
  /**
   * The textual content.
   * @type {string}
   */
  this.content = content;
};

/** @type {soydata.SanitizedContentKind} */
soydata.SanitizedContent.prototype.contentKind;

/** @override */
soydata.SanitizedContent.prototype.toString = function() {
  return this.content;
};


/**
 * Content of type {@link soydata.SanitizedContentKind.HTML}.
 * @param {string} content A string of HTML that can safely be embedded in
 *     a PCDATA context in your app.  If you would be surprised to find that an
 *     HTML sanitizer produced {@code s} (e.g. it runs code or fetches bad URLs)
 *     and you wouldn't write a template that produces {@code s} on security or
 *     privacy grounds, then don't pass {@code s} here.
 * @constructor
 * @extends {soydata.SanitizedContent}
 */
soydata.SanitizedHtml = function(content) {
  soydata.SanitizedContent.call(this, content);
};
goog.inherits(soydata.SanitizedHtml, soydata.SanitizedContent);

/** @override */
soydata.SanitizedHtml.prototype.contentKind = soydata.SanitizedContentKind.HTML;


/**
 * Content of type {@link soydata.SanitizedContentKind.JS_STR_CHARS}.
 * @param {string} content A string of JS that when evaled, produces a
 *     value that does not depend on any sensitive data and has no side effects
 *     <b>OR</b> a string of JS that does not reference any variables or have
 *     any side effects not known statically to the app authors.
 * @constructor
 * @extends {soydata.SanitizedContent}
 */
soydata.SanitizedJsStrChars = function(content) {
  soydata.SanitizedContent.call(this, content);
};
goog.inherits(soydata.SanitizedJsStrChars, soydata.SanitizedContent);

/** @override */
soydata.SanitizedJsStrChars.prototype.contentKind =
    soydata.SanitizedContentKind.JS_STR_CHARS;


/**
 * Content of type {@link soydata.SanitizedContentKind.URI}.
 * @param {string} content A chunk of URI that the caller knows is safe to
 *     emit in a template.
 * @constructor
 * @extends {soydata.SanitizedContent}
 */
soydata.SanitizedUri = function(content) {
  soydata.SanitizedContent.call(this, content);
};
goog.inherits(soydata.SanitizedUri, soydata.SanitizedContent);

/** @override */
soydata.SanitizedUri.prototype.contentKind = soydata.SanitizedContentKind.URI;


/**
 * Content of type {@link soydata.SanitizedContentKind.HTML_ATTRIBUTE}.
 * @param {string} content An attribute name and value, such as
 *     {@code dir="ltr"}.
 * @constructor
 * @extends {soydata.SanitizedContent}
 */
soydata.SanitizedHtmlAttribute = function(content) {
  soydata.SanitizedContent.call(this, content);
};
goog.inherits(soydata.SanitizedHtmlAttribute, soydata.SanitizedContent);

/** @override */
soydata.SanitizedHtmlAttribute.prototype.contentKind =
    soydata.SanitizedContentKind.HTML_ATTRIBUTE;


// -----------------------------------------------------------------------------
// Public utilities.


/**
 * Helper function to render a Soy template and then set the output string as
 * the innerHTML of an element. It is recommended to use this helper function
 * instead of directly setting innerHTML in your hand-written code, so that it
 * will be easier to audit the code for cross-site scripting vulnerabilities.
 *
 * NOTE: New code should consider using goog.soy.renderElement instead.
 *
 * @param {Element} element The element whose content we are rendering.
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 * @param {Object=} opt_injectedData The injected data for the template.
 */
soy.renderElement = goog.soy.renderElement;


/**
 * Helper function to render a Soy template into a single node or a document
 * fragment. If the rendered HTML string represents a single node, then that
 * node is returned (note that this is *not* a fragment, despite them name of
 * the method). Otherwise a document fragment is returned containing the
 * rendered nodes.
 *
 * NOTE: New code should consider using goog.soy.renderAsFragment
 * instead (note that the arguments are different).
 *
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 * @param {Document=} opt_document The document used to create DOM nodes. If not
 *     specified, global document object is used.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @return {!Node} The resulting node or document fragment.
 */
soy.renderAsFragment = function(
    template, opt_templateData, opt_document, opt_injectedData) {
  return goog.soy.renderAsFragment(
      template, opt_templateData, opt_injectedData,
      new goog.dom.DomHelper(opt_document));
};


/**
 * Helper function to render a Soy template into a single node. If the rendered
 * HTML string represents a single node, then that node is returned. Otherwise,
 * a DIV element is returned containing the rendered nodes.
 *
 * NOTE: New code should consider using goog.soy.renderAsElement
 * instead (note that the arguments are different).
 *
 * @param {Function} template The Soy template defining the element's content.
 * @param {Object=} opt_templateData The data for the template.
 * @param {Document=} opt_document The document used to create DOM nodes. If not
 *     specified, global document object is used.
 * @param {Object=} opt_injectedData The injected data for the template.
 * @return {!Element} Rendered template contents, wrapped in a parent DIV
 *     element if necessary.
 */
soy.renderAsElement = function(
    template, opt_templateData, opt_document, opt_injectedData) {
  return goog.soy.renderAsElement(
      template, opt_templateData, opt_injectedData,
      new goog.dom.DomHelper(opt_document));
};


// -----------------------------------------------------------------------------
// Below are private utilities to be used by Soy-generated code only.


/**
 * Builds an augmented data object to be passed when a template calls another,
 * and needs to pass both original data and additional params. The returned
 * object will contain both the original data and the additional params. If the
 * same key appears in both, then the value from the additional params will be
 * visible, while the value from the original data will be hidden. The original
 * data object will be used, but not modified.
 *
 * @param {!Object} origData The original data to pass.
 * @param {Object} additionalParams The additional params to pass.
 * @return {Object} An augmented data object containing both the original data
 *     and the additional params.
 */
soy.$$augmentData = function(origData, additionalParams) {

  // Create a new object whose '__proto__' field is set to origData.
  /** @constructor */
  function TempCtor() {}
  TempCtor.prototype = origData;
  var newData = new TempCtor();

  // Add the additional params to the new object.
  for (var key in additionalParams) {
    newData[key] = additionalParams[key];
  }

  return newData;
};


/**
 * Gets the keys in a map as an array. There are no guarantees on the order.
 * @param {Object} map The map to get the keys of.
 * @return {Array.<string>} The array of keys in the given map.
 */
soy.$$getMapKeys = function(map) {
  var mapKeys = [];
  for (var key in map) {
    mapKeys.push(key);
  }
  return mapKeys;
};


/**
 * Gets a consistent unique id for the given delegate template name. Two calls
 * to this function will return the same id if and only if the input names are
 * the same.
 *
 * <p> Important: This function must always be called with a string constant.
 *
 * <p> If Closure Compiler is not being used, then this is just this identity
 * function. If Closure Compiler is being used, then each call to this function
 * will be replaced with a short string constant, which will be consistent per
 * input name.
 *
 * @param {string} delTemplateName The delegate template name for which to get a
 *     consistent unique id.
 * @return {string} A unique id that is consistent per input name.
 *
 * @consistentIdGenerator
 */
soy.$$getDelegateId = function(delTemplateName) {
  return delTemplateName;
};


/**
 * Map from registered delegate template id/name to the priority of the
 * implementation.
 * @type {Object}
 * @private
 */
soy.$$DELEGATE_REGISTRY_PRIORITIES_ = {};

/**
 * Map from registered delegate template id/name to the implementation function.
 * @type {Object}
 * @private
 */
soy.$$DELEGATE_REGISTRY_FUNCTIONS_ = {};


/**
 * Registers a delegate implementation. If the same delegate template id/name
 * has been registered previously, then priority values are compared and only
 * the higher priority implementation is stored (if priorities are equal, an
 * error is thrown).
 *
 * @param {string} delTemplateId The delegate template id/name to register.
 * @param {number} delPriority The implementation's priority value.
 * @param {Function} delFn The implementation function.
 */
soy.$$registerDelegateFn = function(delTemplateId, delPriority, delFn) {
  var mapKey = 'key_' + delTemplateId;
  var currPriority = soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey];
  if (currPriority === undefined || delPriority > currPriority) {
    // Registering new or higher-priority function: replace registry entry.
    soy.$$DELEGATE_REGISTRY_PRIORITIES_[mapKey] = delPriority;
    soy.$$DELEGATE_REGISTRY_FUNCTIONS_[mapKey] = delFn;
  } else if (delPriority == currPriority) {
    // Registering same-priority function: error.
    throw Error(
        'Encountered two active delegates with same priority (id/name "' +
        delTemplateId + '").');
  } else {
    // Registering lower-priority function: do nothing.
  }
};


/**
 * Retrieves the (highest-priority) implementation that has been registered for
 * a given delegate template id/name. If no implementation has been registered
 * for the id/name, then returns an implementation that is equivalent to an
 * empty template (i.e. rendered output would be empty string).
 *
 * @param {string} delTemplateId The delegate template id/name to get.
 * @return {Function} The retrieved implementation function.
 */
soy.$$getDelegateFn = function(delTemplateId) {
  var delFn = soy.$$DELEGATE_REGISTRY_FUNCTIONS_['key_' + delTemplateId];
  return delFn ? delFn : soy.$$EMPTY_TEMPLATE_FN_;
};


/**
 * Private helper soy.$$getDelegateFn(). This is the empty template function
 * that is returned whenever there's no delegate implementation found.
 *
 * @param {Object.<string, *>=} opt_data
 * @param {soy.StringBuilder=} opt_sb
 * @param {Object.<string, *>=} opt_ijData
 * @return {string}
 * @private
 */
soy.$$EMPTY_TEMPLATE_FN_ = function(opt_data, opt_sb, opt_ijData) {
  return '';
};


// -----------------------------------------------------------------------------
// Escape/filter/normalize.


/**
 * Escapes HTML special characters in a string.  Escapes double quote '"' in
 * addition to '&', '<', and '>' so that a string can be included in an HTML
 * tag attribute value within double quotes.
 * Will emit known safe HTML as-is.
 *
 * @param {*} value The string-like value to be escaped.  May not be a string,
 *     but the value will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeHtml = function(value) {
  if (typeof value === 'object' && value &&
      value.contentKind === soydata.SanitizedContentKind.HTML) {
    return value.content;
  }
  return soy.esc.$$escapeHtmlHelper(value);
};


/**
 * Escapes HTML special characters in a string so that it can be embedded in
 * RCDATA.
 * <p>
 * Escapes HTML special characters so that the value will not prematurely end
 * the body of a tag like {@code <textarea>} or {@code <title>}.  RCDATA tags
 * cannot contain other HTML entities, so it is not strictly necessary to escape
 * HTML special characters except when part of that text looks like an HTML
 * entity or like a close tag : {@code </textarea>}.
 * <p>
 * Will normalize known safe HTML to make sure that sanitized HTML (which could
 * contain an innocuous {@code </textarea>} don't prematurely end an RCDATA
 * element.
 *
 * @param {*} value The string-like value to be escaped.  May not be a string,
 *     but the value will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeHtmlRcdata = function(value) {
  if (typeof value === 'object' && value &&
      value.contentKind === soydata.SanitizedContentKind.HTML) {
    return soy.esc.$$normalizeHtmlHelper(value.content);
  }
  return soy.esc.$$escapeHtmlHelper(value);
};


/**
 * Removes HTML tags from a string of known safe HTML so it can be used as an
 * attribute value.
 *
 * @param {*} value The HTML to be escaped.  May not be a string, but the
 *     value will be coerced to a string.
 * @return {string} A representation of value without tags, HTML comments, or
 *     other content.
 */
soy.$$stripHtmlTags = function(value) {
  return String(value).replace(soy.esc.$$HTML_TAG_REGEX_, '');
};


/**
 * Escapes HTML special characters in an HTML attribute value.
 *
 * @param {*} value The HTML to be escaped.  May not be a string, but the
 *     value will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeHtmlAttribute = function(value) {
  if (typeof value === 'object' && value &&
      value.contentKind === soydata.SanitizedContentKind.HTML) {
    return soy.esc.$$normalizeHtmlHelper(soy.$$stripHtmlTags(value.content));
  }
  return soy.esc.$$escapeHtmlHelper(value);
};


/**
 * Escapes HTML special characters in a string including space and other
 * characters that can end an unquoted HTML attribute value.
 *
 * @param {*} value The HTML to be escaped.  May not be a string, but the
 *     value will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeHtmlAttributeNospace = function(value) {
  if (typeof value === 'object' && value &&
      value.contentKind === soydata.SanitizedContentKind.HTML) {
    return soy.esc.$$normalizeHtmlNospaceHelper(
        soy.$$stripHtmlTags(value.content));
  }
  return soy.esc.$$escapeHtmlNospaceHelper(value);
};


/**
 * Filters out strings that cannot be a substring of a valid HTML attribute.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} A valid HTML attribute name part or name/value pair.
 *     {@code "zSoyz"} if the input is invalid.
 */
soy.$$filterHtmlAttribute = function(value) {
  if (typeof value === 'object' && value &&
      value.contentKind === soydata.SanitizedContentKind.HTML_ATTRIBUTE) {
    return value.content.replace(/=([^"']*)$/, '="$1"');
  }
  return soy.esc.$$filterHtmlAttributeHelper(value);
};


/**
 * Filters out strings that cannot be a substring of a valid HTML element name.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} A valid HTML element name part.
 *     {@code "zSoyz"} if the input is invalid.
 */
soy.$$filterHtmlElementName = function(value) {
  return soy.esc.$$filterHtmlElementNameHelper(value);
};


/**
 * Escapes characters in the value to make it valid content for a JS string
 * literal.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 * @deprecated
 */
soy.$$escapeJs = function(value) {
  return soy.$$escapeJsString(value);
};


/**
 * Escapes characters in the value to make it valid content for a JS string
 * literal.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeJsString = function(value) {
  if (typeof value === 'object' &&
      value.contentKind === soydata.SanitizedContentKind.JS_STR_CHARS) {
    return value.content;
  }
  return soy.esc.$$escapeJsStringHelper(value);
};


/**
 * Encodes a value as a JavaScript literal.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} A JavaScript code representation of the input.
 */
soy.$$escapeJsValue = function(value) {
  // We surround values with spaces so that they can't be interpolated into
  // identifiers by accident.
  // We could use parentheses but those might be interpreted as a function call.
  if (value == null) {  // Intentionally matches undefined.
    // Java returns null from maps where there is no corresponding key while
    // JS returns undefined.
    // We always output null for compatibility with Java which does not have a
    // distinct undefined value.
    return ' null ';
  }
  switch (typeof value) {
    case 'boolean': case 'number':
      return ' ' + value + ' ';
    default:
      return "'" + soy.esc.$$escapeJsStringHelper(String(value)) + "'";
  }
};


/**
 * Escapes characters in the string to make it valid content for a JS regular
 * expression literal.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeJsRegex = function(value) {
  return soy.esc.$$escapeJsRegexHelper(value);
};


/**
 * Matches all URI mark characters that conflict with HTML attribute delimiters
 * or that cannot appear in a CSS uri.
 * From <a href="http://www.w3.org/TR/CSS2/grammar.html">G.2: CSS grammar</a>
 * <pre>
 *     url        ([!#$%&*-~]|{nonascii}|{escape})*
 * </pre>
 *
 * @type {RegExp}
 * @private
 */
soy.$$problematicUriMarks_ = /['()]/g;

/**
 * @param {string} ch A single character in {@link soy.$$problematicUriMarks_}.
 * @return {string}
 * @private
 */
soy.$$pctEncode_ = function(ch) {
  return '%' + ch.charCodeAt(0).toString(16);
};

/**
 * Escapes a string so that it can be safely included in a URI.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeUri = function(value) {
  if (typeof value === 'object' &&
      value.contentKind === soydata.SanitizedContentKind.URI) {
    return soy.$$normalizeUri(value);
  }
  // Apostophes and parentheses are not matched by encodeURIComponent.
  // They are technically special in URIs, but only appear in the obsolete mark
  // production in Appendix D.2 of RFC 3986, so can be encoded without changing
  // semantics.
  var encoded = soy.esc.$$escapeUriHelper(value);
  soy.$$problematicUriMarks_.lastIndex = 0;
  if (soy.$$problematicUriMarks_.test(encoded)) {
    return encoded.replace(soy.$$problematicUriMarks_, soy.$$pctEncode_);
  }
  return encoded;
};


/**
 * Removes rough edges from a URI by escaping any raw HTML/JS string delimiters.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$normalizeUri = function(value) {
  return soy.esc.$$normalizeUriHelper(value);
};


/**
 * Vets a URI's protocol and removes rough edges from a URI by escaping
 * any raw HTML/JS string delimiters.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$filterNormalizeUri = function(value) {
  return soy.esc.$$filterNormalizeUriHelper(value);
};


/**
 * Escapes a string so it can safely be included inside a quoted CSS string.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} An escaped version of value.
 */
soy.$$escapeCssString = function(value) {
  return soy.esc.$$escapeCssStringHelper(value);
};


/**
 * Encodes a value as a CSS identifier part, keyword, or quantity.
 *
 * @param {*} value The value to escape.  May not be a string, but the value
 *     will be coerced to a string.
 * @return {string} A safe CSS identifier part, keyword, or quanitity.
 */
soy.$$filterCssValue = function(value) {
  // Uses == to intentionally match null and undefined for Java compatibility.
  if (value == null) {
    return '';
  }
  return soy.esc.$$filterCssValueHelper(value);
};


// -----------------------------------------------------------------------------
// Basic directives/functions.


/**
 * Converts \r\n, \r, and \n to <br>s
 * @param {*} str The string in which to convert newlines.
 * @return {string} A copy of {@code str} with converted newlines.
 */
soy.$$changeNewlineToBr = function(str) {
  return goog.string.newLineToBr(String(str), false);
};


/**
 * Inserts word breaks ('wbr' tags) into a HTML string at a given interval. The
 * counter is reset if a space is encountered. Word breaks aren't inserted into
 * HTML tags or entities. Entites count towards the character count; HTML tags
 * do not.
 *
 * @param {*} str The HTML string to insert word breaks into. Can be other
 *     types, but the value will be coerced to a string.
 * @param {number} maxCharsBetweenWordBreaks Maximum number of non-space
 *     characters to allow before adding a word break.
 * @return {string} The string including word breaks.
 */
soy.$$insertWordBreaks = function(str, maxCharsBetweenWordBreaks) {
  return goog.format.insertWordBreaks(String(str), maxCharsBetweenWordBreaks);
};


/**
 * Truncates a string to a given max length (if it's currently longer),
 * optionally adding ellipsis at the end.
 *
 * @param {*} str The string to truncate. Can be other types, but the value will
 *     be coerced to a string.
 * @param {number} maxLen The maximum length of the string after truncation
 *     (including ellipsis, if applicable).
 * @param {boolean} doAddEllipsis Whether to add ellipsis if the string needs
 *     truncation.
 * @return {string} The string after truncation.
 */
soy.$$truncate = function(str, maxLen, doAddEllipsis) {

  str = String(str);
  if (str.length <= maxLen) {
    return str;  // no need to truncate
  }

  // If doAddEllipsis, either reduce maxLen to compensate, or else if maxLen is
  // too small, just turn off doAddEllipsis.
  if (doAddEllipsis) {
    if (maxLen > 3) {
      maxLen -= 3;
    } else {
      doAddEllipsis = false;
    }
  }

  // Make sure truncating at maxLen doesn't cut up a unicode surrogate pair.
  if (soy.$$isHighSurrogate_(str.charAt(maxLen - 1)) &&
      soy.$$isLowSurrogate_(str.charAt(maxLen))) {
    maxLen -= 1;
  }

  // Truncate.
  str = str.substring(0, maxLen);

  // Add ellipsis.
  if (doAddEllipsis) {
    str += '...';
  }

  return str;
};

/**
 * Private helper for $$truncate() to check whether a char is a high surrogate.
 * @param {string} ch The char to check.
 * @return {boolean} Whether the given char is a unicode high surrogate.
 * @private
 */
soy.$$isHighSurrogate_ = function(ch) {
  return 0xD800 <= ch && ch <= 0xDBFF;
};

/**
 * Private helper for $$truncate() to check whether a char is a low surrogate.
 * @param {string} ch The char to check.
 * @return {boolean} Whether the given char is a unicode low surrogate.
 * @private
 */
soy.$$isLowSurrogate_ = function(ch) {
  return 0xDC00 <= ch && ch <= 0xDFFF;
};


// -----------------------------------------------------------------------------
// Bidi directives/functions.


/**
 * Cache of bidi formatter by context directionality, so we don't keep on
 * creating new objects.
 * @type {!Object.<!goog.i18n.BidiFormatter>}
 * @private
 */
soy.$$bidiFormatterCache_ = {};


/**
 * Returns cached bidi formatter for bidiGlobalDir, or creates a new one.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @return {goog.i18n.BidiFormatter} A formatter for bidiGlobalDir.
 * @private
 */
soy.$$getBidiFormatterInstance_ = function(bidiGlobalDir) {
  return soy.$$bidiFormatterCache_[bidiGlobalDir] ||
         (soy.$$bidiFormatterCache_[bidiGlobalDir] =
             new goog.i18n.BidiFormatter(bidiGlobalDir));
};


/**
 * Estimate the overall directionality of text. If opt_isHtml, makes sure to
 * ignore the LTR nature of the mark-up and escapes in text, making the logic
 * suitable for HTML and HTML-escaped text.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {number} 1 if text is LTR, -1 if it is RTL, and 0 if it is neutral.
 */
soy.$$bidiTextDir = function(text, opt_isHtml) {
  if (!text) {
    return 0;
  }
  return goog.i18n.bidi.detectRtlDirectionality(text, opt_isHtml) ? -1 : 1;
};


/**
 * Returns "dir=ltr" or "dir=rtl", depending on text's estimated
 * directionality, if it is not the same as bidiGlobalDir.
 * Otherwise, returns the empty string.
 * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
 * in text, making the logic suitable for HTML and HTML-escaped text.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {soydata.SanitizedHtmlAttribute} "dir=rtl" for RTL text in non-RTL
 *     context; "dir=ltr" for LTR text in non-LTR context;
 *     else, the empty string.
 */
soy.$$bidiDirAttr = function(bidiGlobalDir, text, opt_isHtml) {
  return new soydata.SanitizedHtmlAttribute(
      soy.$$getBidiFormatterInstance_(bidiGlobalDir).dirAttr(text, opt_isHtml));
};


/**
 * Returns a Unicode BiDi mark matching bidiGlobalDir (LRM or RLM) if the
 * directionality or the exit directionality of text are opposite to
 * bidiGlobalDir. Otherwise returns the empty string.
 * If opt_isHtml, makes sure to ignore the LTR nature of the mark-up and escapes
 * in text, making the logic suitable for HTML and HTML-escaped text.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {string} text The text whose directionality is to be estimated.
 * @param {boolean=} opt_isHtml Whether text is HTML/HTML-escaped.
 *     Default: false.
 * @return {string} A Unicode bidi mark matching bidiGlobalDir, or the empty
 *     string when text's overall and exit directionalities both match
 *     bidiGlobalDir, or bidiGlobalDir is 0 (unknown).
 */
soy.$$bidiMarkAfter = function(bidiGlobalDir, text, opt_isHtml) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
  return formatter.markAfter(text, opt_isHtml);
};


/**
 * Returns str wrapped in a <span dir=ltr|rtl> according to its directionality -
 * but only if that is neither neutral nor the same as the global context.
 * Otherwise, returns str unchanged.
 * Always treats str as HTML/HTML-escaped, i.e. ignores mark-up and escapes when
 * estimating str's directionality.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {*} str The string to be wrapped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} The wrapped string.
 */
soy.$$bidiSpanWrap = function(bidiGlobalDir, str) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
  return formatter.spanWrap(str + '', true);
};


/**
 * Returns str wrapped in Unicode BiDi formatting characters according to its
 * directionality, i.e. either LRE or RLE at the beginning and PDF at the end -
 * but only if str's directionality is neither neutral nor the same as the
 * global context. Otherwise, returns str unchanged.
 * Always treats str as HTML/HTML-escaped, i.e. ignores mark-up and escapes when
 * estimating str's directionality.
 * @param {number} bidiGlobalDir The global directionality context: 1 if ltr, -1
 *     if rtl, 0 if unknown.
 * @param {*} str The string to be wrapped. Can be other types, but the value
 *     will be coerced to a string.
 * @return {string} The wrapped string.
 */
soy.$$bidiUnicodeWrap = function(bidiGlobalDir, str) {
  var formatter = soy.$$getBidiFormatterInstance_(bidiGlobalDir);
  return formatter.unicodeWrap(str + '', true);
};


// -----------------------------------------------------------------------------
// Generated code.




// START GENERATED CODE FOR ESCAPERS.

/**
 * @type {function (*) : string}
 */
soy.esc.$$escapeUriHelper = function(v) {
  return encodeURIComponent(String(v));
};

/**
 * Maps charcters to the escaped versions for the named escape directives.
 * @type {Object.<string, string>}
 * @private
 */
soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_ = {
  '\x00': '\x26#0;',
  '\x22': '\x26quot;',
  '\x26': '\x26amp;',
  '\x27': '\x26#39;',
  '\x3c': '\x26lt;',
  '\x3e': '\x26gt;',
  '\x09': '\x26#9;',
  '\x0a': '\x26#10;',
  '\x0b': '\x26#11;',
  '\x0c': '\x26#12;',
  '\x0d': '\x26#13;',
  ' ': '\x26#32;',
  '-': '\x26#45;',
  '\/': '\x26#47;',
  '\x3d': '\x26#61;',
  '`': '\x26#96;',
  '\x85': '\x26#133;',
  '\xa0': '\x26#160;',
  '\u2028': '\x26#8232;',
  '\u2029': '\x26#8233;'
};

/**
 * A function that can be used with String.replace..
 * @param {string} ch A single character matched by a compatible matcher.
 * @return {string} A token in the output language.
 * @private
 */
soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_[ch];
};

/**
 * Maps charcters to the escaped versions for the named escape directives.
 * @type {Object.<string, string>}
 * @private
 */
soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_ = {
  '\x00': '\\x00',
  '\x08': '\\x08',
  '\x09': '\\t',
  '\x0a': '\\n',
  '\x0b': '\\x0b',
  '\x0c': '\\f',
  '\x0d': '\\r',
  '\x22': '\\x22',
  '\x26': '\\x26',
  '\x27': '\\x27',
  '\/': '\\\/',
  '\x3c': '\\x3c',
  '\x3d': '\\x3d',
  '\x3e': '\\x3e',
  '\\': '\\\\',
  '\x85': '\\x85',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
  '$': '\\x24',
  '(': '\\x28',
  ')': '\\x29',
  '*': '\\x2a',
  '+': '\\x2b',
  ',': '\\x2c',
  '-': '\\x2d',
  '.': '\\x2e',
  ':': '\\x3a',
  '?': '\\x3f',
  '[': '\\x5b',
  ']': '\\x5d',
  '^': '\\x5e',
  '{': '\\x7b',
  '|': '\\x7c',
  '}': '\\x7d'
};

/**
 * A function that can be used with String.replace..
 * @param {string} ch A single character matched by a compatible matcher.
 * @return {string} A token in the output language.
 * @private
 */
soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_[ch];
};

/**
 * Maps charcters to the escaped versions for the named escape directives.
 * @type {Object.<string, string>}
 * @private
 */
soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_CSS_STRING_ = {
  '\x00': '\\0 ',
  '\x08': '\\8 ',
  '\x09': '\\9 ',
  '\x0a': '\\a ',
  '\x0b': '\\b ',
  '\x0c': '\\c ',
  '\x0d': '\\d ',
  '\x22': '\\22 ',
  '\x26': '\\26 ',
  '\x27': '\\27 ',
  '(': '\\28 ',
  ')': '\\29 ',
  '*': '\\2a ',
  '\/': '\\2f ',
  ':': '\\3a ',
  ';': '\\3b ',
  '\x3c': '\\3c ',
  '\x3d': '\\3d ',
  '\x3e': '\\3e ',
  '@': '\\40 ',
  '\\': '\\5c ',
  '{': '\\7b ',
  '}': '\\7d ',
  '\x85': '\\85 ',
  '\xa0': '\\a0 ',
  '\u2028': '\\2028 ',
  '\u2029': '\\2029 '
};

/**
 * A function that can be used with String.replace..
 * @param {string} ch A single character matched by a compatible matcher.
 * @return {string} A token in the output language.
 * @private
 */
soy.esc.$$REPLACER_FOR_ESCAPE_CSS_STRING_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_ESCAPE_CSS_STRING_[ch];
};

/**
 * Maps charcters to the escaped versions for the named escape directives.
 * @type {Object.<string, string>}
 * @private
 */
soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = {
  '\x00': '%00',
  '\x01': '%01',
  '\x02': '%02',
  '\x03': '%03',
  '\x04': '%04',
  '\x05': '%05',
  '\x06': '%06',
  '\x07': '%07',
  '\x08': '%08',
  '\x09': '%09',
  '\x0a': '%0A',
  '\x0b': '%0B',
  '\x0c': '%0C',
  '\x0d': '%0D',
  '\x0e': '%0E',
  '\x0f': '%0F',
  '\x10': '%10',
  '\x11': '%11',
  '\x12': '%12',
  '\x13': '%13',
  '\x14': '%14',
  '\x15': '%15',
  '\x16': '%16',
  '\x17': '%17',
  '\x18': '%18',
  '\x19': '%19',
  '\x1a': '%1A',
  '\x1b': '%1B',
  '\x1c': '%1C',
  '\x1d': '%1D',
  '\x1e': '%1E',
  '\x1f': '%1F',
  ' ': '%20',
  '\x22': '%22',
  '\x27': '%27',
  '(': '%28',
  ')': '%29',
  '\x3c': '%3C',
  '\x3e': '%3E',
  '\\': '%5C',
  '{': '%7B',
  '}': '%7D',
  '\x7f': '%7F',
  '\x85': '%C2%85',
  '\xa0': '%C2%A0',
  '\u2028': '%E2%80%A8',
  '\u2029': '%E2%80%A9',
  '\uff01': '%EF%BC%81',
  '\uff03': '%EF%BC%83',
  '\uff04': '%EF%BC%84',
  '\uff06': '%EF%BC%86',
  '\uff07': '%EF%BC%87',
  '\uff08': '%EF%BC%88',
  '\uff09': '%EF%BC%89',
  '\uff0a': '%EF%BC%8A',
  '\uff0b': '%EF%BC%8B',
  '\uff0c': '%EF%BC%8C',
  '\uff0f': '%EF%BC%8F',
  '\uff1a': '%EF%BC%9A',
  '\uff1b': '%EF%BC%9B',
  '\uff1d': '%EF%BC%9D',
  '\uff1f': '%EF%BC%9F',
  '\uff20': '%EF%BC%A0',
  '\uff3b': '%EF%BC%BB',
  '\uff3d': '%EF%BC%BD'
};

/**
 * A function that can be used with String.replace..
 * @param {string} ch A single character matched by a compatible matcher.
 * @return {string} A token in the output language.
 * @private
 */
soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = function(ch) {
  return soy.esc.$$ESCAPE_MAP_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_[ch];
};

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_ESCAPE_HTML_ = /[\x00\x22\x26\x27\x3c\x3e]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_ = /[\x00\x22\x27\x3c\x3e]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_ESCAPE_HTML_NOSPACE_ = /[\x00\x09-\x0d \x22\x26\x27\x2d\/\x3c-\x3e`\x85\xa0\u2028\u2029]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_NOSPACE_ = /[\x00\x09-\x0d \x22\x27\x2d\/\x3c-\x3e`\x85\xa0\u2028\u2029]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_ESCAPE_JS_STRING_ = /[\x00\x08-\x0d\x22\x26\x27\/\x3c-\x3e\\\x85\u2028\u2029]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_ESCAPE_JS_REGEX_ = /[\x00\x08-\x0d\x22\x24\x26-\/\x3a\x3c-\x3f\x5b-\x5e\x7b-\x7d\x85\u2028\u2029]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_ESCAPE_CSS_STRING_ = /[\x00\x08-\x0d\x22\x26-\x2a\/\x3a-\x3e@\\\x7b\x7d\x85\xa0\u2028\u2029]/g;

/**
 * Matches characters that need to be escaped for the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_ = /[\x00- \x22\x27-\x29\x3c\x3e\\\x7b\x7d\x7f\x85\xa0\u2028\u2029\uff01\uff03\uff04\uff06-\uff0c\uff0f\uff1a\uff1b\uff1d\uff1f\uff20\uff3b\uff3d]/g;

/**
 * A pattern that vets values produced by the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$FILTER_FOR_FILTER_CSS_VALUE_ = /^(?!-*(?:expression|(?:moz-)?binding))(?:[.#]?-?(?:[_a-z0-9-]+)(?:-[_a-z0-9-]+)*-?|-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[a-z]{1,2}|%)?|!important|)$/i;

/**
 * A pattern that vets values produced by the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_URI_ = /^(?:(?:https?|mailto):|[^&:\/?#]*(?:[\/?#]|$))/i;

/**
 * A pattern that vets values produced by the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$FILTER_FOR_FILTER_HTML_ATTRIBUTE_ = /^(?!style|on|action|archive|background|cite|classid|codebase|data|dsync|href|longdesc|src|usemap)(?:[a-z0-9_$:-]*)$/i;

/**
 * A pattern that vets values produced by the named directives.
 * @type RegExp
 * @private
 */
soy.esc.$$FILTER_FOR_FILTER_HTML_ELEMENT_NAME_ = /^(?!script|style|title|textarea|xmp|no)[a-z0-9_$:-]*$/i;

/**
 * A helper for the Soy directive |escapeHtml
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$escapeHtmlHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_ESCAPE_HTML_,
      soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

/**
 * A helper for the Soy directive |normalizeHtml
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$normalizeHtmlHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_,
      soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

/**
 * A helper for the Soy directive |escapeHtmlNospace
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$escapeHtmlNospaceHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_ESCAPE_HTML_NOSPACE_,
      soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

/**
 * A helper for the Soy directive |normalizeHtmlNospace
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$normalizeHtmlNospaceHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_NORMALIZE_HTML_NOSPACE_,
      soy.esc.$$REPLACER_FOR_ESCAPE_HTML__AND__NORMALIZE_HTML__AND__ESCAPE_HTML_NOSPACE__AND__NORMALIZE_HTML_NOSPACE_);
};

/**
 * A helper for the Soy directive |escapeJsString
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$escapeJsStringHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_ESCAPE_JS_STRING_,
      soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_);
};

/**
 * A helper for the Soy directive |escapeJsRegex
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$escapeJsRegexHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_ESCAPE_JS_REGEX_,
      soy.esc.$$REPLACER_FOR_ESCAPE_JS_STRING__AND__ESCAPE_JS_REGEX_);
};

/**
 * A helper for the Soy directive |escapeCssString
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$escapeCssStringHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_ESCAPE_CSS_STRING_,
      soy.esc.$$REPLACER_FOR_ESCAPE_CSS_STRING_);
};

/**
 * A helper for the Soy directive |filterCssValue
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$filterCssValueHelper = function(value) {
  var str = String(value);
  if (!soy.esc.$$FILTER_FOR_FILTER_CSS_VALUE_.test(str)) {
    return 'zSoyz';
  }
  return str;
};

/**
 * A helper for the Soy directive |normalizeUri
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$normalizeUriHelper = function(value) {
  var str = String(value);
  return str.replace(
      soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_,
      soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_);
};

/**
 * A helper for the Soy directive |filterNormalizeUri
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$filterNormalizeUriHelper = function(value) {
  var str = String(value);
  if (!soy.esc.$$FILTER_FOR_FILTER_NORMALIZE_URI_.test(str)) {
    return 'zSoyz';
  }
  return str.replace(
      soy.esc.$$MATCHER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_,
      soy.esc.$$REPLACER_FOR_NORMALIZE_URI__AND__FILTER_NORMALIZE_URI_);
};

/**
 * A helper for the Soy directive |filterHtmlAttribute
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$filterHtmlAttributeHelper = function(value) {
  var str = String(value);
  if (!soy.esc.$$FILTER_FOR_FILTER_HTML_ATTRIBUTE_.test(str)) {
    return 'zSoyz';
  }
  return str;
};

/**
 * A helper for the Soy directive |filterHtmlElementName
 * @param {*} value Can be of any type but will be coerced to a string.
 * @return {string} The escaped text.
 */
soy.esc.$$filterHtmlElementNameHelper = function(value) {
  var str = String(value);
  if (!soy.esc.$$FILTER_FOR_FILTER_HTML_ELEMENT_NAME_.test(str)) {
    return 'zSoyz';
  }
  return str;
};

/**
 * Matches all tags, HTML comments, and DOCTYPEs in tag soup HTML.
 *
 * @type {RegExp}
 * @private
 */
soy.esc.$$HTML_TAG_REGEX_ = /<(?:!|\/?[a-zA-Z])(?:[^>'"]|"[^"]*"|'[^']*')*>/g;

// END GENERATED CODE

window.atl_soy=window.atl_soy||{};
atl_soy.concat=function(B,A){if(B.concat){return B.concat(A)
}var C={};
for(var D in B){if(B.hasOwnProperty(D)){C[D]=B[D]
}}for(var D in A){if(A.hasOwnProperty(D)){C[D]=A[D]
}}return C
};
jQuery.namespace("JIRA.Forms");
Class.prototype.triggerEvent=function(C,A,B){jQuery(this).trigger(C,A);
if(B&&this.globalEventNamespaces){jQuery.each(this.globalEventNamespaces,function(E,D){jQuery(AJS).trigger(D+"."+C,A)
})
}return this
};
Class.prototype.bind=function(A,B){jQuery(this).bind(A,B);
return this
};
JIRA.makePropertyFunc=function(A){if(jQuery.isFunction(A)){return A
}else{return function(){return A
}
}};
JIRA.Dialog.getAttrFromActiveTrigger=function(B){var C=JIRA.Dialog.current,A=C.$activeTrigger;
if(A){return A.attr(B)
}};
JIRA.Dialog.getIssueActionTitle=function(B,C){var A=JIRA.Dialog.getActionIssueKey();
if(!A){return B
}if(C){return B+" : <a class='header-issue-key' href='"+contextPath+"/browse/"+A+"'>"+A+"</a>"
}else{return B+" : "+A
}};
JIRA.Dialog.getActionIssueKey=function(){var A=JIRA.Dialog.getAttrFromActiveTrigger("data-issueKey");
if(!A&&JIRA.Issue){A=JIRA.Issue.getIssueKey()
}if(!A&&JIRA.IssueNavigator){A=JIRA.IssueNavigator.getSelectedIssueKey()
}return A
};
JIRA.activateTabWithChild=function(E){var C,B,A,D=E.closest(".tabs-pane");
if(D.length){B=D.closest(".aui-tabs");
C=D.attr("id");
A=B.find("a[href='#"+C+"']");
A.click()
}};
JIRA.applyErrorsToForm=function(B,C){var A;
jQuery.each(C,function(E,H){var G,D,F=B.find(":input[name='"+E+"']").last();
if(F.length===1){if(!A){A=F
}D=jQuery("<div class='error' />").attr("data-field",E).text(H);
G=F.closest(".field-group, .group");
G.find(".error").remove();
G.append(D)
}});
JIRA.activateTabWithChild(B.find(".error:first"));
if(A){A.focus()
}};
JIRA.extractScripts=function(B){var A=jQuery(B);
return{html:A.not("script"),scripts:A.filter("script")}
};
JIRA.applyMessageToForm=function(A,C,B,E){var D=C.find(".aui-message-context");
if(!D.length){D=jQuery("<div class='aui-message-context' />");
if(JIRA.useLegacyDecorator()){D.prependTo(C.find(".content-body"))
}else{D.prependTo(C.find(".form-body"))
}}D.empty();
AJS.messages[A](D,{shadowed:false,closeable:E,body:B})
};
JIRA.useLegacyDecorator=function(){return !JIRA.Version.isGreaterThanOrEqualTo("5.0")
};
JIRA.applyErrorMessageToForm=function(B,A){return JIRA.applyMessageToForm("error",B,A,false)
};
JIRA.applySuccessMessageToForm=function(B,A){return JIRA.applyMessageToForm("success",B,A,true)
};
JIRA.Forms.Model=Class.extend({init:function(A){this.userFieldsResource=A.userFieldsResource;
this.fieldsResource=A.fieldsResource;
this.retainedFields=[];
this._hasRetainFeature=false;
this._hasVisibilityFeature=true
},getFieldsResource:function(){return this.fieldsResource
},getAtlToken:function(){return this.atlToken
},getActiveFieldIds:function(){return this.getUserFields()
},addFieldToRetainValue:function(A){if(this._hasRetainFeature){this.removeFieldToRetainValue(A);
this.retainedFields.push(A)
}else{throw new Error("getFieldsWithRetainedValues: cannot be called. Must enable retain feature first by specifiying [_hasRetainFeature=true]")
}},clearRetainedFields:function(){this.retainedFields=[]
},removeFieldToRetainValue:function(B){if(this._hasRetainFeature){var A=jQuery.inArray(B,this.retainedFields);
if(A!=-1){this.retainedFields.splice(A,1)
}}else{throw new Error("getFieldsWithRetainedValues: cannot be called. Must enable retain feature first by specifiying [_hasRetainFeature=true]")
}},getFieldsWithRetainedValues:function(){if(this._hasRetainFeature){return this.retainedFields
}else{throw new Error("getFieldsWithRetainedValues: cannot be called. Must enable retain feature first by specifiying [_hasRetainFeature=true]")
}},hasRetainedValue:function(A){if(this._hasRetainFeature){return jQuery.inArray(A.id,this.retainedFields)!==-1
}else{throw new Error("HasRetainedValue: cannot be called. Must enable retain feature first by specifiying [_hasRetainFeature=true]")
}},refresh:function(C){var A=this,B=jQuery.Deferred(),D;
if(C){D=C+"&retainValues=true"
}JIRA.SmartAjax.makeRequest({url:this.getFieldsResource(),type:"POST",data:D,success:function(E){A.atlToken=E.atl_token;
A.fields=E.fields;
A.sortedTabs=E.sortedTabs;
A.userPreferences=E.userPreferences
},complete:function(F,G,E){if(E.successful){B.resolveWith(A,arguments)
}else{A.triggerEvent("serverError",[E]);
B.rejectWith(A,[E])
}}});
return B.promise()
},setFields:function(A){this.fields=A
},getConfigurableFields:function(){return this.getFields()
},getFields:function(){var A=this,B=jQuery.Deferred();
if(!this.fields){this.refresh().done(function(){B.resolve(A.fields)
})
}else{B.resolve(A.fields)
}return B.promise()
},_mungeTabs:function(B){var A=0,C=[];
jQuery.each(B,function(D,E){A++;
if(E.tab){if(!C[E.tab.position]){C[E.tab.position]=AJS.copyObject(E.tab)
}if(E.tab.position===0){C[E.tab.position].isFirst=true
}if(!C[E.tab.position].fields){C[E.tab.position].fields=[]
}C[E.tab.position].fields.push(AJS.copyObject(E))
}});
return C
},getTabs:function(){var A=this,B=jQuery.Deferred();
this.getFields().done(function(C){var D=A._mungeTabs(C);
B.resolve(D)
});
return B.promise()
},getSortedTabs:function(){var A=jQuery.Deferred();
if(!this.sortedTabs){this.refresh().done(function(){A.resolve(this.sortedTabs)
})
}else{A.resolve(this.sortedTabs)
}return A.promise()
},getUserFields:function(){var A=this,B=jQuery.Deferred();
if(!this.userPreferences){this.refresh().done(function(){B.resolve(A.userPreferences.fields)
})
}else{B.resolve(A.userPreferences.fields)
}return B.promise()
},setUserFields:function(A){var B={};
B.fields=A;
return this.updateUserPrefs(B)
},hasRetainFeature:function(){return !!this._hasRetainFeature
},hasVisibilityFeature:function(){return !!this._hasVisibilityFeature
},getUseConfigurableForm:function(){var A=this,B=jQuery.Deferred();
if(!this.userPreferences){this.refresh().done(function(){B.resolve(A.userPreferences.useQuickForm)
}).fail(function(){B.reject()
})
}else{B.resolve(A.userPreferences.useQuickForm)
}return B.promise()
},setUseConfigurableForm:function(A){var B={};
B.useQuickForm=A;
return this.updateUserPrefs(B)
},updateUserPrefs:function(C){var B=jQuery.Deferred(),A=this;
if(AJS.Meta.get("remote-user")===""){B.done();
return B.promise()
}if(!this.userPreferences){console.log("JIRA.Forms.Model: Cannot update user preferences if there are none to update");
B.reject();
return B.promise()
}if(!C.fields){C.fields=this.userPreferences.fields
}if(typeof C.showWelcomeScreen==="undefined"){C.showWelcomeScreen=this.userPreferences.showWelcomeScreen
}if(typeof C.useQuickForm==="undefined"){C.useQuickForm=this.userPreferences.useQuickForm
}return JIRA.SmartAjax.makeRequest({url:this.userFieldsResource,type:"POST",data:JSON.stringify(C),dataType:"json",contentType:"application/json",complete:function(E,F,D){if(D.successful){A.userPreferences=C
}else{A.triggerEvent("serverError",[D])
}}})
}});
// This file was automatically generated from quickform.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.QuickForm == 'undefined') { JIRA.Templates.QuickForm = {}; }


JIRA.Templates.QuickForm.field = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append(opt_data.editHtml);
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.QuickForm.fieldPicker = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="qf-picker"><div class="qf-picker-header"><dl><dt>', soy.$$escapeHtml("Show Fields:"), '</dt>', (opt_data.isConfigurable) ? '<dd><a class="qf-unconfigurable" href="#">' + soy.$$escapeHtml("All") + '</a></dd><dd>' + soy.$$escapeHtml("Custom") + '</dd>' : '<dd>' + soy.$$escapeHtml("All") + '</dd><dd><a class="qf-configurable" href="#">' + soy.$$escapeHtml("Custom") + '</a></dd>', '</dl></div><div class="qf-picker-content ', (! opt_data.isConfigurable) ? 'qf-picker-unconfigurable' : '', '"></div><div class="qf-picker-footer"></div></div>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.QuickForm.configurablePickerButton = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a title="', soy.$$escapeHtml(opt_data.label), '" data-field-id="', soy.$$escapeHtml(opt_data.fieldId), '" class="qf-picker-button', (opt_data.isActive) ? ' qf-active' : '', '" href="#">', soy.$$escapeHtml(opt_data.label), (opt_data.required) ? '<span class="aui-icon icon-required"></span>' : '', '</a>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.QuickForm.unconfigurablePickerButton = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<span title="', soy.$$escapeHtml(opt_data.label), '" data-field-id="', soy.$$escapeHtml(opt_data.fieldId), '" class="qf-picker-button', (opt_data.isActive) ? ' qf-active' : '', '" href="#">', soy.$$escapeHtml(opt_data.label), (opt_data.required) ? '<span class="aui-icon icon-required"></span>' : '', '</span>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.QuickForm.errorMessage = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="aui-message error"><span class="aui-icon icon-error"></span>', soy.$$escapeHtml(opt_data.message), '</div>');
  return opt_sb ? '' : output.toString();
};

JIRA.Forms.ConfigurableField=AJS.Control.extend({init:function(A){this.descriptor=A;
this.$element=jQuery("<div />").attr("id","qf-field-"+this.getId())
},focus:function(){this.$element.find(":input:first").focus()
},highlight:function(){var A=this;
this.$element.css("backgroundColor","#fff").animate({backgroundColor:"lightyellow"},function(){A.$element.animate({backgroundColor:"#fff"},function(){A.$element.css("backgroundColor","")
})
})
},getLabel:function(){return this.descriptor.label
},getId:function(){return this.descriptor.id
},activate:function(B){var A;
this.active=true;
this.$element.addClass("qf-field-active").show();
this.$element.find("textarea").trigger("refreshInputHeight");
if(!B){A=this.render();
this.$element.append(A.scripts);
this.focus();
JIRA.trigger(JIRA.Events.NEW_CONTENT_ADDED,[this.$element]);
this.$element.scrollIntoView();
this.triggerEvent("activated")
}},hasVisibilityFeature:function(){return !!this.descriptor.hasVisibilityFeature
},hasRetainFeature:function(){return !!this.descriptor.hasRetainFeature
},isActive:function(){return this.active
},disable:function(A){this.render();
this.active=false;
this.$element.removeClass("qf-field-active").hide();
if(!A){this.triggerEvent("disabled")
}},render:function(){var B=JIRA.Templates.QuickForm.field(this.descriptor),A=JIRA.extractScripts(B);
this.$element.html(A.html).addClass("qf-field").data("model",this);
return{element:this.$element,scripts:A.scripts}
}});
JIRA.Forms.FieldPicker=AJS.Control.extend({INLINE_DIALOG_ID:"field_picker_popup",init:function(){this.buttons=[]
},switchToAll:function(A){this.isConfigurable=false;
if(A!==true){this.hideCallback=function(){this.remove()
};
this.inlineDialog.hide();
this.triggerEvent("switchedToAll")
}},setForm:function(A){this.form=A
},switchToCustom:function(A){this.isConfigurable=true;
if(A!==true){this.hideCallback=function(){this.remove()
};
this.inlineDialog.hide();
this.triggerEvent("switchedToCustom")
}},hideCallback:function(){},bindInlineDialog:function(){var B=this,A=this.getInlineDialogTrigger();
function C(F,D,E){B.render().done(function(G){if(F.find(".qf-picker").length===0){F.html(G);
F.click(function(K){K.stopPropagation()
})
}var J=jQuery("#qf-field-picker-trigger:visible").offset().top-jQuery(window).scrollTop(),I=jQuery(window).height(),H=I-J-100;
F.find(".qf-picker-content").css("maxHeight",H);
E()
})
}if(this.inlineDialog){this.inlineDialog.remove()
}this.inlineDialog=AJS.InlineDialog(A,this.INLINE_DIALOG_ID,C,{width:400,upfrontCallback:function(){A.parent().addClass("active")
},hideCallback:function(){A.parent().removeClass("active")
},nobind:true});
A.click(function(D){if(jQuery("#inline-dialog-"+B.INLINE_DIALOG_ID).is(":visible")){B.inlineDialog.hide()
}else{B.inlineDialog.show()
}});
return this.inlineDialog
},getInlineDialogTrigger:function(){return this.form.$element.find("#qf-field-picker-trigger")
},renderButtons:function(B){var A=this,C=jQuery('<ul class="qf-picker-buttons" />').appendTo(this.$content);
jQuery.each(B,function(E,F){var G,D;
if(A.isConfigurable){A.form.getFieldById(F.id).done(function(I){if(I&&I.hasVisibilityFeature()){var J=jQuery("<li />").appendTo(C);
var H=new JIRA.Forms.FieldPicker.ConfigurableButton({field:I});
H.render().appendTo(J);
A.buttons.push(H)
}})
}else{D=new JIRA.Forms.FieldPicker.UnconfigurableButton(F);
G=jQuery("<li />").appendTo(C);
D.render().appendTo(G)
}});
if(C.children().length===0){C.addClass("qf-no-fields").append("<li><em>"+"No fields can be configured for this tab"+"</em></li>")
}},renderContents:function(){var A=this,B=jQuery.Deferred();
this.form.model.getSortedTabs().done(function(C){if(C.length===1){A.renderButtons(C[0].fields)
}else{jQuery.each(C,function(D,E){if(E.fields.length>0){jQuery("<h4><span></span></h4>").appendTo(A.$content).find("span").text(E.label);
A.renderButtons(E.fields)
}})
}B.resolveWith(A,[A.$element])
});
return B.promise()
},show:function(){this.inlineDialog.show()
},render:function(){this.$element=jQuery(JIRA.Templates.QuickForm.fieldPicker({isConfigurable:this.isConfigurable}));
this.$content=this.$element.find(".qf-picker-content");
this._assignEvents("switchToCustom",this.$element.find(".qf-configurable"));
this._assignEvents("switchToAll",this.$element.find(".qf-unconfigurable"));
return this.renderContents()
},_events:{switchToCustom:{click:function(A){this.switchToCustom();
A.preventDefault()
}},switchToAll:{click:function(A){this.switchToAll();
A.preventDefault()
}}}});
JIRA.Forms.FieldPicker.UnconfigurableButton=AJS.Control.extend({init:function(A){this.descriptor=A
},render:function(){this.$element=jQuery(JIRA.Templates.QuickForm.unconfigurablePickerButton({required:this.descriptor.required,label:this.descriptor.label,fieldId:this.descriptor.id,isActive:true}));
return this.$element
}});
JIRA.Forms.FieldPicker.ConfigurableButton=AJS.Control.extend({init:function(B){var A=this;
this.field=B.field;
this.field.bind("disabled",function(){A.$element.removeClass("qf-active")
}).bind("activated",function(){A.$element.addClass("qf-active")
})
},toggle:function(){if(this.field.isActive()){this.field.disable()
}else{this.field.activate()
}},getId:function(){return this.field.getId()
},render:function(){this.$element=jQuery(JIRA.Templates.QuickForm.configurablePickerButton({required:this.field.descriptor.required,label:this.field.getLabel(),fieldId:this.field.getId(),isActive:this.field.isActive()}));
this._assignEvents("button",this.$element);
return this.$element
},_events:{button:{click:function(A){this.toggle();
A.preventDefault()
}}}});
JIRA.Forms.AbstractForm=AJS.Control.extend({submit:function(){var A=this;
A.getForm().addClass("submitting");
return JIRA.SmartAjax.makeRequest({url:this.getAction(),type:"POST",beforeSend:function(){A.disable()
},data:this.serialize(),complete:function(E,G,B){var C=B.data;
A.getForm().find(".aui-message-context").remove();
A.enable();
A.getForm().find(".error").remove();
if(B.successful){if(C&&C.fields){A.invalidateFieldsCache();
A.model.setFields(C.fields)
}if(typeof C==="string"){A.$element.html(AJS.extractBodyFromResponse(B.data));
A.triggerEvent("rendered",[A.$element])
}else{A.handleSubmitSuccess(B.data)
}}else{var F;
try{F=JSON.parse(E.responseText)
}catch(D){}if(F){if(F.errorMessages&&F.errorMessages.length){JIRA.applyErrorMessageToForm(A.getForm(),F.errorMessages[0])
}if(F&&F.errors&&E.status===400){if(A.getFieldById){jQuery.each(F.errors,function(H){if(/^timetracking/.test(H)){A.getFieldById("timetracking").done(function(I){JIRA.trigger(JIRA.Events.VALIDATE_TIMETRACKING,[A.$element]);
I.activate(true)
})
}else{if(/^worklog/.test(H)){A.getFieldById("worklog").done(function(I){JIRA.trigger(JIRA.Events.VALIDATE_TIMETRACKING,[A.$element]);
I.activate(true)
})
}else{A.getFieldById(H).done(function(I){I.activate(true)
})
}}})
}JIRA.applyErrorsToForm(A.getForm(),F.errors);
A.triggerEvent("validationError",[A,F.errors],true)
}}}A.getForm().removeClass("submitting")
}})
},disable:function(){this.getForm().find(":input").attr("disabled","disabled").trigger("disable");
this.getForm().find(":submit").attr("disabled","disabled")
},enable:function(){this.getForm().find(":input").removeAttr("disabled").trigger("enable");
this.getForm().find(":submit").removeAttr("disabled")
},getActiveFieldIds:function(){throw new Error("getActiveFieldIds: Abstract, must be implemented by sub class")
},serialize:function(C){var A=this,B=this.getForm().serialize();
if(this.model.hasRetainFeature()){jQuery.each(this.getActiveFieldIds(),function(E,D){A.model.addFieldToRetainValue(D,C)
});
jQuery.each(this.model.getFieldsWithRetainedValues(),function(D,E){B=B+"&fieldsToRetain="+E
})
}return B
},invalidateFieldsCache:function(){delete this.fields
},setInitialFocus:function(){this.getFormContent().find(":input:first").focus()
},handleSubmitSuccess:function(){this.triggerEvent("submitted");
AJS.reloadViaWindowLocation()
},getAction:function(){return this.action
},getFormContent:function(){return this.$element.find("div.content")
},getForm:function(){return this.$element.find("form")
},createField:function(){throw new Error("JIRA.Forms.AbstractForm: You must implement [createField] method in subclass.")
},render:function(C){var B=jQuery.Deferred(),A=this;
if(C){this.invalidateFieldsCache();
this.model.refresh(C).done(function(){A._render().done(function(E,D){A.triggerEvent("rendered",[A.$element]);
B.resolveWith(A,[A.$element,D])
})
})
}else{A._render().done(function(E,D){A.triggerEvent("rendered",[A.$element]);
B.resolveWith(A,[A.$element,D])
})
}return B.promise()
}});
JIRA.Forms.AbstractConfigurableForm=JIRA.Forms.AbstractForm.extend({getFields:function(){var B=jQuery.Deferred(),A=this;
if(!this.fields){this.fields=[];
this.model.getConfigurableFields().done(function(C){jQuery.each(C,function(D,F){var E=A.createField(F);
A.fields.push(E)
});
B.resolveWith(A,[A.fields])
})
}else{B.resolveWith(this,[this.fields])
}return B.promise()
},getActiveFieldIds:function(){var B=[],A=this.$element.find(".qf-field.qf-field-active:not(.qf-required)");
jQuery.each(A,function(D,E){var C=jQuery(E);
B.push(C.data("model").getId())
});
return B
},createField:function(C){C.hasVisibilityFeature=this.model.hasVisibilityFeature(C);
if(this.model.hasRetainFeature(C)){C.hasRetainFeature=true;
C.retainValue=this.model.hasRetainedValue(C)
}var A=this,B=new JIRA.Forms.ConfigurableField(C);
if(C.hasVisibilityFeature){B.bind("activated",function(){A.model.setUserFields(A.getActiveFieldIds());
B.highlight();
A.triggerEvent("QuickForm.fieldAdded",[B])
}).bind("disabled",function(){A.model.setUserFields(A.getActiveFieldIds());
A.triggerEvent("QuickForm.fieldRemoved",[B])
})
}return B
},getFieldById:function(C){var A=this,B=jQuery.Deferred();
this.getFields().done(function(D){jQuery.each(D,function(E,F){if(F.getId()===C){B.resolveWith(A,[F])
}});
B.rejectWith(A,[])
});
return B.promise()
},hasNoVisibleFields:function(){var A=jQuery.Deferred();
A.resolve(this.getActiveFieldIds().length===0);
return A.promise()
},renderFormContents:function(){var C=jQuery.Deferred(),B=jQuery(),A=this;
A.getFields().done(function(D){A.model.getActiveFieldIds().done(function(E){jQuery.each(D,function(){var F=this.render();
B=B.add(F.scripts);
A.getFormContent().append(F.element)
});
jQuery.each(E,function(G,F){jQuery.each(D,function(){if(this.getId()===F){this.activate(true)
}})
});
jQuery.each(D,function(){if(!this.isActive()){this.disable(true)
}});
A.hasNoVisibleFields().done(function(G){if(G===true){for(var F=0;
F<3;
F++){if(D[F]){D[F].activate(true)
}}}C.resolveWith(this,[A.$element,B])
})
})
});
return C.promise()
}});
JIRA.Forms.AbstractUnconfigurableForm=JIRA.Forms.AbstractForm.extend({getFieldsHtml:function(){var A=this,B=jQuery.Deferred(),C={};
this.model.getTabs().done(function(D){if(D.length===1){C.fields=D[0].fields
}else{C.tabs=D;
C.hasTabs=true
}B.resolveWith(A,[JIRA.Templates.Issue.issueFields(C)])
});
return B.promise()
},getActiveFieldIds:function(){var A=[];
this.model.getFields().done(function(B){jQuery.each(B,function(C,D){A.push(D.id)
})
});
return A
},getFields:function(){var B=jQuery.Deferred(),A=this;
if(!this.fields){this.fields=[];
this.model.getFields().done(function(C){jQuery.each(C,function(D,F){var E=A.createField(F);
A.fields.push(E)
});
B.resolveWith(A,[A.fields])
})
}else{B.resolveWith(this,[this.fields])
}return B.promise()
}});
JIRA.Forms.Error=AJS.Control.extend({getErrorMessageFromSmartAjax:function(A){var B,C;
if(A.hasData&&A.status!==401){try{C=JSON.parse(A.data);
if(C.errorMessages&&C.errorMessages.length>0){B=JIRA.Templates.QuickForm.errorMessage({message:C.errorMessages[0]})
}else{B=JIRA.SmartAjax.buildDialogErrorContent(A,true).html()
}}catch(D){B=JIRA.SmartAjax.buildDialogErrorContent(A,true).html()
}}else{B=JIRA.SmartAjax.buildDialogErrorContent(A,true).html()
}return B
},render:function(B){var A=this.getErrorMessageFromSmartAjax(B);
return this._render(A)
}});
JIRA.Forms.Container=AJS.Control.extend({init:function(A){this.$element=jQuery("<div />").addClass("qf-container");
this.options=JIRA.makePropertyFunc(A);
this.fieldPicker=new JIRA.Forms.FieldPicker();
this.successData=[]
},decorateRenderers:function(){var A=this;
if(!this.fieldPicker.decorated){this.fieldPicker.bind("switchedToAll",function(){A.unconfigurableForm.render(A.currentView.serialize(true)).done(function(){A.fieldPicker.show()
})
});
this.fieldPicker.bind("switchedToCustom",function(){A.configurableForm.render(A.currentView.serialize(true)).done(function(){A.fieldPicker.show()
})
});
this.fieldPicker.decorated=true
}if(!this.configurableForm.decorated){this.configurableForm.bind("rendered",function(C,B){A.currentView=A.configurableForm;
A.fieldPicker.switchToCustom(true);
A.fieldPicker.setForm(A.configurableForm);
A.fieldPicker.bindInlineDialog();
A.applyGlobalDecorator(B);
A.model.setUseConfigurableForm(true);
A.triggerEvent("configurableFormRendered")
});
this.configurableForm.bind("submitted",function(C,B){A.successData.push(B);
A.triggerEvent("configurableFormSubmitted")
});
this.configurableForm.decorated=true
}if(!this.unconfigurableForm.decorated){this.unconfigurableForm.bind("rendered",function(C,B){A.fieldPicker.switchToAll(true);
A.fieldPicker.setForm(A.unconfigurableForm);
A.fieldPicker.bindInlineDialog();
A.currentView=A.unconfigurableForm;
A.applyGlobalDecorator(B);
A.model.setUseConfigurableForm(false);
A.triggerEvent("unconfigurableFormRendered")
});
this.unconfigurableForm.bind("submitted",function(C,B){A.successData.push(B);
A.triggerEvent("unconfigurableFormSubmitted")
});
this.unconfigurableForm.decorated=true
}},applyGlobalDecorator:function(C){function B(){if(A.currentView.setInitialFocus){A.currentView.setInitialFocus()
}}var A=this;
C.detach();
this.$element.html(C);
this.triggerEvent("contentRefreshed",[this.$element]);
if(jQuery.browser.msie){window.setTimeout(B,0)
}else{B()
}},asDialog:function(B){var A=this,C;
this.dialog=C=new JIRA.FormDialog({id:B.id,trigger:B.trigger,windowTitle:B.windowTitle,width:JIRA.Dialog.WIDTH_PRESETS.large,delayShowUntil:JIRA.Dialogs.waitForSavesToComplete,content:function(D){A.render().done(function(){D(A.$element)
});
A.triggerEvent("dialogShown")
},submitHandler:function(E,D){E.preventDefault();
A.currentView.submit().then(D,D)
},stacked:true});
this.dialog._focusFirstField=function(){JIRA.FormDialog.prototype._focusFirstField.apply(this,["div.content :input:visible:first"])
};
this.bind("initialized",function(){this.unconfigurableForm.bind("sessionComplete",function(){C.hide()
});
this.configurableForm.bind("sessionComplete",function(){C.hide()
})
}).bind("contentRefreshed",function(){C.notifyOfNewContent()
});
C.bind("Dialog.hide",function(){if(A.successData.length){A.triggerEvent("sessionComplete",[A.successData],true);
A.successData=[]
}});
A.$element.ajaxStart(function(){C.showFooterLoadingIndicator()
}).ajaxStop(function(){C.hideFooterLoadingIndicator()
});
C.getQuickForm=function(){return A
};
C.dirtyFormWarning();
return C
},lazyInit:function(){var A=this,B=this.options.call(this);
this.model=B.model;
this.errorHandler=B.errorHandler;
this.globalEventNamespaces=B.globalEventNamespaces;
this.configurableForm=B.configurableForm;
this.unconfigurableForm=B.unconfigurableForm;
this.sessionComplete=B.sessionComplete;
this.model.clearRetainedFields();
this.configurableForm.invalidateFieldsCache();
this.model.bind("serverError",function(D,C){A.$element.html(A.errorHandler.render(C));
A.triggerEvent("contentRefreshed",[this.$element])
});
this.triggerEvent("initialized");
this.decorateRenderers()
},render:function(){var A=this,B=jQuery.Deferred();
this.lazyInit();
A.model.getUseConfigurableForm().done(function(C){if(C===true){A.configurableForm.render().done(function(E,D){B.resolveWith(A,[A.$element]);
A.$element.append(D)
})
}else{A.unconfigurableForm.render().done(function(E,D){B.resolveWith(A,[A.$element,D]);
A.$element.append(D)
})
}}).fail(function(){B.resolveWith(A,[A.$element])
});
return B.promise()
}});
JIRA.Forms.EditIssueModel=JIRA.Forms.Model.extend({getUnconfigurableTabs:function(){var A=this,B=jQuery.Deferred();
A.getTabs().done(function(D){var C=D.slice(0);
C[0].fields=C[0].fields.slice(0);
jQuery.each(C[0].fields,function(E,F){if(F.id==="comment"){C[0].fields.splice(E,1);
return false
}});
B.resolve(C)
});
return B.promise()
},getCommentField:function(){var A=jQuery.Deferred();
this.getFields().done(function(B){jQuery.each(B,function(C,D){if(D.id==="comment"){A.resolve(D)
}});
A.reject()
});
return A.promise()
}});
JIRA.Forms.EditIssueError=JIRA.Forms.Error.extend({_render:function(A){return jQuery(JIRA.Templates.Issue.editIssueError({errorHtml:A,useLegacyDecorator:JIRA.useLegacyDecorator()}))
}});
JIRA.Forms.UnconfigurableEditIssueForm=JIRA.Forms.AbstractUnconfigurableForm.extend({init:function(A){this.globalEventNamespaces=A.globalEventNamespaces||[];
this.model=A.model;
this.issueId=A.issueId;
this.title=A.title;
this.action=contextPath+"/secure/QuickEditIssue.jspa?issueId="+A.issueId+"&decorator=none";
this.$element=jQuery("<div class='qf-unconfigurable-form' />")
},getFieldsHtml:function(){var A=this,B=jQuery.Deferred(),C={};
this.model.getUnconfigurableTabs().done(function(D){if(D.length===1){C.fields=D[0].fields
}else{C.tabs=D;
C.hasTabs=true
}B.resolveWith(A,[JIRA.Templates.Issue.issueFields(C)])
});
return B.promise()
},handleSubmitSuccess:function(A){this.triggerEvent("submitted",[A]);
this.triggerEvent("issueEdited",[A]);
this.triggerEvent("sessionComplete")
},_render:function(){var B=jQuery.Deferred(),A=this;
this.getFieldsHtml().done(function(C){var D={fieldsHtml:C,title:A.title,issueId:A.issueId,atlToken:A.model.getAtlToken(),useLegacyDecorator:JIRA.useLegacyDecorator(),modifierKey:AJS.Navigator.modifierKey(),showFieldConfigurationToolBar:!JIRA.Users.LoggedInUser.isAnonymous()};
this.model.getCommentField().then(function(G){var F,E;
D.commentField=G;
F=JIRA.Templates.Issue.editIssueForm(D);
E=JIRA.extractScripts(F);
A.$element.html(E.html);
B.resolveWith(A,[A.$element,E.scripts])
},function(){var F=JIRA.Templates.Issue.editIssueForm(D),E=JIRA.extractScripts(F);
A.$element.html(E.html);
B.resolveWith(A,[A.$element,E.scripts])
})
});
return B.promise()
}});
JIRA.Forms.ConfigurableEditIssueForm=JIRA.Forms.AbstractConfigurableForm.extend({init:function(A){this.model=A.model;
this.globalEventNamespaces=A.globalEventNamespaces||[];
this.issueId=A.issueId;
this.title=A.title;
this.action=contextPath+"/secure/QuickEditIssue.jspa?issueId="+A.issueId+"&decorator=none";
this.$element=jQuery("<div />").addClass("qf-form qf-configurable-form")
},handleSubmitSuccess:function(A){this.triggerEvent("submitted",[A]);
this.triggerEvent("issueEdited",[A]);
this.triggerEvent("sessionComplete")
},hasNoVisibleFields:function(){var A=jQuery.Deferred(),B=this.getActiveFieldIds();
this.model.getUserFields().done(function(C){if(C.length===1&&C[0]==="comment"){A.resolve(false)
}else{if(B.length===0||(B.length===1&&B[0]==="comment")){A.resolve(true)
}else{A.resolve(false)
}}});
return A.promise()
},_render:function(){var B=jQuery.Deferred(),A=this,C=JIRA.Templates.Issue.editIssueForm({issueId:this.issueId,title:this.title,atlToken:A.model.getAtlToken(),isConfigurable:true,useLegacyDecorator:JIRA.useLegacyDecorator(),modifierKey:AJS.Navigator.modifierKey(),showFieldConfigurationToolBar:!JIRA.Users.LoggedInUser.isAnonymous()});
this.$element.html(C);
A.renderFormContents().done(function(E,D){A.getFieldById("comment").done(function(F){A.getFormContent().append(F.$element)
});
B.resolveWith(A,[A.$element,D])
});
return B.promise()
}});
JIRA.Forms.Model.createQuickEditIssueModel=function(A){return new JIRA.Forms.EditIssueModel({fieldsResource:contextPath+"/secure/QuickEditIssue!default.jspa?issueId="+A+"&decorator=none",userFieldsResource:contextPath+"/rest/quickedit/1.0/userpreferences/edit"})
};
JIRA.Dialog.shouldShowIssueKeyInTitle=function(){return JIRA.IssueNavigator.isNavigator()||JIRA.Dialog.getAttrFromActiveTrigger("data-issueKey")
};
JIRA.Forms.createEditIssueForm=function(){function A(C){var D=JIRA.Dialog.getAttrFromActiveTrigger("data-issueId");
if(jQuery.isFunction(C.issueId)){return C.issueId(C)
}else{if(C.issueId){return C.issueId
}else{if(D){return D
}else{return JIRA.Issue.getIssueId()||JIRA.IssueNavigator.getSelectedIssueId()
}}}}function B(){var C="Edit Issue";
if(JIRA.Dialog.shouldShowIssueKeyInTitle()){return JIRA.Dialog.getIssueActionTitle(C,true)
}else{return C
}}return function(C){C=C||{};
return new JIRA.Forms.Container(function(){var H=A(C),G=B(),D=JIRA.Forms.Model.createQuickEditIssueModel(H),F=new JIRA.Forms.ConfigurableEditIssueForm({title:G,model:D,issueId:H,globalEventNamespaces:["QuickEdit"]}),E=new JIRA.Forms.UnconfigurableEditIssueForm({title:G,model:D,issueId:H,globalEventNamespaces:["QuickEdit"]});
return{globalEventNamespaces:["QuickEdit"],model:D,errorHandler:new JIRA.Forms.EditIssueError(),configurableForm:F,unconfigurableForm:E}
})
}
}();
jQuery(function(){if(!JIRA.Version.isGreaterThanOrEqualTo("5.0")){return 
}JIRA.Forms.createEditIssueForm().asDialog({windowTitle:function(){return JIRA.Dialog.getIssueActionTitle("Edit Issue",false)
},trigger:".issueaction-edit-issue",id:"edit-issue-dialog"});
jQuery(document).bind("dialogContentReady",function(){AJS.tabs.setup()
})
});
// This file was automatically generated from issue.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.Issue == 'undefined') { JIRA.Templates.Issue = {}; }


JIRA.Templates.Issue.editIssueError = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<h2>', soy.$$escapeHtml("Edit Issue"), '</h2><div class="', (opt_data.useLegacyDecorator) ? 'content-body' : 'form-body', '">', opt_data.errorHtml, '</div>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issue.editIssueForm = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<form action="#" name="jiraform" class="aui"><h2>', (opt_data.showFieldConfigurationToolBar) ? '<div class="qf-form-operations aui-toolbar"><div class="toolbar-split toolbar-split-right"><div class="toolbar-group"><span class="toolbar-item"><a href="#" class="toolbar-trigger" id="qf-field-picker-trigger"><span class="icon icon-tools"></span>' + soy.$$escapeHtml("Configure Fields") + '<span class="icon drop-menu"></span></a></span></div></div></div>' : '', opt_data.title, '</h2><div class="', (opt_data.useLegacyDecorator) ? 'content-body' : 'form-body', '"><input type="hidden" name="id" value="', soy.$$escapeHtml(opt_data.issueId), '" /><input type="hidden" name="atl_token" value="', soy.$$escapeHtml(opt_data.atlToken), '" /><div class="content">', (opt_data.fieldsHtml) ? opt_data.fieldsHtml : '', (opt_data.commentField) ? opt_data.commentField.editHtml : '', '<!-- fields inserted here via javascript --></div></div><div class="buttons-container ', (opt_data.useLegacyDecorator) ? 'content-footer' : 'form-footer', '"><div class="buttons"><input accesskey="', soy.$$escapeHtml("s"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to submit this form","s",opt_data.modifierKey)), '" class="button" id="edit-issue-submit" name="Edit" type="submit" value="', soy.$$escapeHtml("Update"), '" /><a href="#" accesskey="', soy.$$escapeHtml("`"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to cancel","`",opt_data.modifierKey)), '" class="cancel">', soy.$$escapeHtml("Cancel"), '</a></div></div></form>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issue.issueFields = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  if (opt_data.hasTabs) {
    output.append('<div class="aui-tabs horizontal-tabs" id="horizontal"><ul class="tabs-menu">');
    var tabList66 = opt_data.tabs;
    var tabListLen66 = tabList66.length;
    for (var tabIndex66 = 0; tabIndex66 < tabListLen66; tabIndex66++) {
      var tabData66 = tabList66[tabIndex66];
      output.append((tabData66) ? '<li class="menu-item ' + ((tabData66.isFirst) ? 'first active-tab' : '') + ' "><a href="#tab-' + soy.$$escapeHtml(tabData66.position) + '" ><strong>' + soy.$$escapeHtml(tabData66.label) + '</strong></a></li>' : '');
    }
    output.append('</ul>');
    var tabList80 = opt_data.tabs;
    var tabListLen80 = tabList80.length;
    for (var tabIndex80 = 0; tabIndex80 < tabListLen80; tabIndex80++) {
      var tabData80 = tabList80[tabIndex80];
      if (tabData80) {
        output.append('<div class="tabs-pane ', (tabData80.isFirst) ? 'active-pane' : '', '" id="tab-', soy.$$escapeHtml(tabData80.position), '">');
        var fieldList90 = tabData80.fields;
        var fieldListLen90 = fieldList90.length;
        for (var fieldIndex90 = 0; fieldIndex90 < fieldListLen90; fieldIndex90++) {
          var fieldData90 = fieldList90[fieldIndex90];
          output.append((fieldData90.editHtml) ? fieldData90.editHtml : '');
        }
        output.append('</div>');
      }
    }
    output.append('</div>');
  } else {
    var fieldList100 = opt_data.fields;
    var fieldListLen100 = fieldList100.length;
    for (var fieldIndex100 = 0; fieldIndex100 < fieldListLen100; fieldIndex100++) {
      var fieldData100 = fieldList100[fieldIndex100];
      output.append((fieldData100.editHtml) ? fieldData100.editHtml : '');
    }
  }
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issue.createIssueForm = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<form name="jiraform" action="#" class="aui"><h2>', (opt_data.showFieldConfigurationToolBar) ? '<div class="qf-form-operations aui-toolbar"><div class="toolbar-split toolbar-split-right"><div class="toolbar-group"><span class="toolbar-item"><a href="#" class="toolbar-trigger" id="qf-field-picker-trigger"><span class="icon icon-tools"></span>' + soy.$$escapeHtml("Configure Fields") + '<span class="icon drop-menu"></span></a></span></div></div></div>' : '', soy.$$escapeHtml(opt_data.title), '</h2><div class="', (opt_data.useLegacyDecorator) ? 'content-body' : 'form-body', '">');
  if (opt_data.issueSetupFields) {
    output.append('<div class="issue-setup-fields">');
    var fieldList124 = opt_data.issueSetupFields;
    var fieldListLen124 = fieldList124.length;
    for (var fieldIndex124 = 0; fieldIndex124 < fieldListLen124; fieldIndex124++) {
      var fieldData124 = fieldList124[fieldIndex124];
      output.append('<div class="qf-field qf-field-', soy.$$escapeHtml(fieldData124.id), ' qf-required">', fieldData124.editHtml, '</div>');
    }
    output.append('</div>');
  }
  output.append((opt_data.parentIssueId) ? '<input type="hidden" name="parentIssueId" value="' + soy.$$escapeHtml(opt_data.parentIssueId) + '" />' : '', '<input type="hidden" name="atl_token" value="', soy.$$escapeHtml(opt_data.atlToken), '" /><div class="content">', (opt_data.fieldsHtml) ? opt_data.fieldsHtml : '', '<!-- fields inserted here via javascript --></div></div><div class="buttons-container ', (opt_data.useLegacyDecorator) ? 'content-footer' : 'form-footer', '"><div class="buttons"><label for="qf-create-another" class="qf-create-another"><input id="qf-create-another" type="checkbox" ', (opt_data.multipleMode) ? 'checked="checked"' : '', ' />', soy.$$escapeHtml("Create another"), '</label><input accesskey="', soy.$$escapeHtml("s"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to submit this form","s",opt_data.modifierKey)), '" class="button" id="create-issue-submit" name="Edit" type="submit" value="', soy.$$escapeHtml("Create"), '" /><a href="#" accesskey="', soy.$$escapeHtml("`"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to cancel","`",opt_data.modifierKey)), '" class="cancel">', soy.$$escapeHtml("Cancel"), '</a></div></div></form>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issue.createIssueError = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<h2>', soy.$$escapeHtml("Create Issue"), '</h2><div class="', (opt_data.useLegacyDecorator) ? 'content-body' : 'form-footer', '">', opt_data.errorHtml, '</div>');
  return opt_sb ? '' : output.toString();
};

(function($) {
    $.event.props.push("dataTransfer");

    $('[draggable=true]').live("dragstart", function(evt) {
        var $this = AJS.$(this);
        var dataTransfer = evt.dataTransfer;
        dataTransfer.effectAllowed = 'copy';
        dataTransfer.dropEffect = 'copy';
        dataTransfer.setData("DownloadURL", $this.data('downloadurl'));
        if (!$this.find('img').length) {
            dataTransfer.setDragImage($this.closest('li').find('img:visible')[0], 8, 8);
        }
    });
})(AJS.$);
var tempo=(function(x){var E="%e/%b/%y";var s="%e/%b/%y %H:%M";var n="Period is invalid";var d="You must be logged in to JIRA to perform this action. Session might have timed out!";var f="(|.*?(\\s+|\\())({0})(.*)";x.extend(x.expr[":"],{focus:function(M){return M==document.activeElement}});x.fn.fixDirtyForm=function(){x(this).addClass("ajs-dirty-warning-exempt");if(AJS.DIRTY_FORM_VALUE){return this.data(AJS.DIRTY_FORM_VALUE,null)}return this};x.fn.cleanFormValidation=function(){var M=x(this);var N=M.find("ul.error-list");M.find(":input:visible").removeClass("error-field").removeClass("valid");N.empty();return this};x.fn.resetFormFields=function(){var M=x(this);M.find(".resetable :checkbox").attr("checked",false);M.find(".resetable select, .resetable textarea, .resetable input[type=text]").val("");M.find(".enddate").hide();M.find("select.tempoDynamicDropDown").empty();M.find("select.tempoDynamicDropDown").attr("selectedValue","");return this};var C=AJS.SingleSelect.extend({submitForm:function(){if(!this.suggestionsVisible){this.handleFreeInput();if(this.options.submitHandler){this.options.submitHandler()}}}});x.fn.tempoAccountPicker=function(){var N=x(this);var M={};new AJS.SingleSelect({element:N,showDropdownButton:true,removeOnUnSelect:true,matchingStrategy:f,submitInputVal:true,noQueryNoRequest:false,ajaxOptions:{url:contextPath+"/rest/tempo-rest/2.0/accounts/picker",query:true,minQueryLength:1,data:M,formatResponse:function(O){var P=[];x(O).each(function(R,Q){x(Q.group).each(function(T,S){var U=new AJS.GroupDescriptor({weight:T,id:"tempo-report-account-search-"+T,replace:true,label:S.title});x(S.item).each(function(){U.addItem(new AJS.ItemDescriptor({value:this.type+"-"+this.key,label:this.name,html:this.html,allowDuplicate:false}))});P.push(U)})});return P}}})};x.fn.tempoFilterPicker=function(M){var O=x(this);var N={};new AJS.SingleSelect({element:O,showDropdownButton:true,removeOnUnSelect:true,matchingStrategy:f,submitInputVal:true,noQueryNoRequest:false,ajaxOptions:{url:contextPath+"/rest/tempo-rest/2.0/filters/picker",query:true,minQueryLength:1,data:N,formatResponse:function(Q){var R=[];if(M=="timesheet"){var P=new AJS.GroupDescriptor({weight:0,id:"tempo-default-suggested",replace:true});P.addItem(new AJS.ItemDescriptor({value:"-1",label:"User Timesheet",allowDuplicate:false}))}x(Q).each(function(T,S){var U=new AJS.GroupDescriptor({weight:T+1,id:"tempo-report-filter-suggested-"+1,replace:true,label:"Filters"});x(S.filters).each(function(){var V=this.name;if(this.description){V+=" ("+this.description+")"}U.addItem(new AJS.ItemDescriptor({value:""+this.id,label:V,allowDuplicate:false}))});R.push(P);R.push(U)});return R}}})};x.fn.tempoIssuePicker=function(N){var M;if(N!=null&&N.type!=null){M=N.type}else{M=""}var P=x(this);var O={};new C({submitHandler:N?N.submitHandler:null,element:P,showDropdownButton:true,removeOnUnSelect:true,submitInputVal:true,noQueryNoRequest:false,ajaxOptions:{url:contextPath+"/rest/tempo-rest/2.0/issues/picker/"+M,query:true,minQueryLength:1,data:O,formatResponse:function(Q){var R=[];x(Q).each(function(T,S){x(S.group).each(function(V,U){var W=new AJS.GroupDescriptor({weight:V,id:"tempo-report-issue-search-"+V,replace:true,label:U.title});x(U.item).each(function(){W.addItem(new AJS.ItemDescriptor({value:this.key,label:this.key+" - "+this.name,html:this.html,allowDuplicate:false,title:this.name,icon:contextPath+this.icon}))});R.push(W)})});return R}}})};x.fn.tempoSingleProjectPicker=function(){var N=x(this);var M={};new AJS.SingleSelect({element:N,matchingStrategy:f,showDropdownButton:true,removeOnUnSelect:true,submitInputVal:true,noQueryNoRequest:false,ajaxOptions:{url:contextPath+"/rest/tempo-rest/2.0/projects/picker",query:true,minQueryLength:1,data:M,formatResponse:function(O){var P=[];x(O).each(function(R,Q){x(Q.group).each(function(T,S){var U=new AJS.GroupDescriptor({weight:T,id:"tempo-report-project-search-"+T,replace:true,label:S.title});x(S.item).each(function(){U.addItem(new AJS.ItemDescriptor({value:this.id+"",label:this.name+" ("+this.key+")",html:this.html,allowDuplicate:false}))});P.push(U)})});return P}}})};x.fn.tempoSingleUserPicker=function(M){var N;if(M!=null&&M.type!=null){N=M.type}else{N=""}x(this).each(function(R){var Q=x(this);var P={showAvatar:true};var O=new C({submitHandler:M?M.submitHandler:null,element:Q,showDropdownButton:true,removeOnUnSelect:false,submitInputVal:true,noQueryNoRequest:true,ajaxOptions:{url:contextPath+"/rest/tempo-rest/2.0/users/picker/"+N,query:true,minQueryLength:3,data:P,formatResponse:function(S){var T=[];x(S).each(function(V,U){var W=new AJS.GroupDescriptor({weight:V+1,id:"tempo-report-user-suggested-"+1,replace:true,label:U.footer});x(U.users).each(function(){W.addItem(new AJS.ItemDescriptor({value:this.name,label:this.displayName+" ("+this.name+")",allowDuplicate:false,icon:this.avatarUrl}))});T.push(W)});return T}}});Q.data("userPicker",O);Q.bind("change",function(){var T=Q.closest("form");var S=T.find(":input[name=user]").val();var V=T.find("input[name=date]");var U=T.find("input[name=enddate]");g(T,S,V,U)})})};x.fn.tempoMultiUserPicker=function(M){var N;if(M!=null){N=M.type}else{N=""}x(this).each(function(R){var Q=x(this);var P={showAvatar:true};var O=new AJS.MultiSelect({element:Q,showDropdownButton:true,removeOnUnSelect:false,submitInputVal:true,noQueryNoRequest:true,ajaxOptions:{url:contextPath+"/rest/api/1.0/users/picker"+N,query:true,minQueryLength:3,data:P,formatResponse:function(T){var S=[];x(T).each(function(V,U){var W=new AJS.GroupDescriptor({weight:V,label:U.footer});x(U.users).each(function(){W.addItem(new AJS.ItemDescriptor({value:this.name,label:this.displayName,html:this.html,icon:this.avatarUrl,allowDuplicate:false,highlighted:true}))});S.push(W)});return S}}});Q.data("userPicker",O);Q.bind("change",function(){var T=Q.closest("form");var S=T.find(":input[name=user]").val();var V=T.find("input[name=date]");var U=T.find("input[name=enddate]");g(T,S,V,U)})})};x.fn.tempoDatePicker=function(M){x(this).each(function(){var W=x(this);var S=W.find("input");var Q=W.find("img,span.icon-date");var V=S.attr("id");var R=Q.attr("id");var T=W.hasClass("ISO8061WeekNumbers");var U=W.hasClass("showStartTime");var O=E;if(U){O=s}Calendar.setup({context:W,firstDay:0,inputField:V,button:R,align:"Tl",singleClick:true,ifFormat:O,daFormat:O,showsTime:U,timeFormat:"24",useISO8601WeekNumbers:T,electric:false});if(M.validate){var N=S.closest(".tempo-datepicker");var P=N.closest("form");Q.bind("click",function(){Q.data("cal",window.calendar)}).closest("a").bind("keyup",function(X){if(X.keyCode==32){Q.trigger("click")}});S.bind("blur",function(){var X=Q.data("cal");if(X){X.callCloseHandler()}}).bind("change",function(){P.cleanFormValidation();var Y=P.find("input[name=planning]").val()=="true";var X=P.find(":input[name=user]").val();if(!X){X=P.find("select.dialog-user-picker").val()}var Z=i(S,X,Y);var ab=N.find(":checkbox").is(":checked");if(Z){var ad=N.find("input[name=date]");var ac=N.find("input[name=enddate]");var aa=P.find("input.availability");if(ab){if(this.name=="date"){if(ac.val()==""){return}Z=i(ac,X,Y)}else{Z=i(ad,X,Y)}if(Z){Z=u(ad.val(),ac.val(),P.find("input[name=startTimeEnabled]").val()==="true");if(!Z){P.find("ul.error-list").append(x("<li/>").text(n))}else{P.find("input[name=time]").trigger("change");g(P,X,ad,ac)}}}else{g(P,X,ad,ac)}}return true})}});return this};function g(O,M,S,R){if(!M){return}var Q=O.find("input.availability");if(Q.length===1){var N=contextPath+"/rest/tempo-rest/2.0/user/getUser";if(!O.find(".showperiod").is(":checked")||R.val()==""){R=S}var P={from:S.val(),to:R.val(),username:M};x.ajax({url:N,cache:false,data:P,success:function(T){O.find("input.availability").val(T.availableString);O.find("input.workingdays").val(T.workDaysString)},error:function(U,T,V){alert(T)}})}}function j(O,S,P){if(P!=""){var M=O.find(":input[name=issue]");if(M.val()!=""){var R=O.find("input[name=date]");var Q=O.find("input[name=enddate]");var N=O.find("input[name=user]").val();if(!N){N=O.find("select.dialog-user-picker").val()}if(!Q.is(":visible")){Q=R}x.ajax({data:{username:N},async:false,url:contextPath+"/rest/tempo-rest/1.0/worklogs/remainingEstimate/calculate/"+M.val()+"/"+J(R.val())+"/"+J(Q.val())+"/"+P,cache:false,success:function(T){S.val(T);if(S.is(":focus")){S.select()}},error:function(U,T,V){if(V=="Unauthorized"){alert(d)}else{alert(T)}}})}}}x.fn.tempoTimePicker=function(){x.each(x(this),function(){var M=x(this);var P=M.closest("form");var N=P.find(":input[name=issue]");var Q=M.find(":input[name=time]");var S=M.find("input[name=remainingEstimate]");var R=M.find("input[name=billedTime]");var O=P.find("div.tempo-datepicker");Q.bind("blur",function(U){if(N.find("option").val()&&N.val()==null){var T=N.find("option").val();N.val(T);x("select.tempo-issue-picker").trigger("change")}if(S.length>0||R.length>0){if(R.length>0){R.val(this.value)}if(S.length>0){j(P,S,this.value)}}});O.bind("change",function(){if(O.find("div.enddate").is(":visible")){Q.trigger("blur")}})});return this};function p(Q,P,M){if(P.error!=undefined&&P.error!=null&&P.error!=""){alert("Error in TDD query: "+P.error);return}Q.empty();var N=Q.attr("selectedValue");var O=N;x.each(P.values,function(R,S){x("<option/>").val(S.key).text(S.value).appendTo(Q);if(S.key==N&&S.key!=""){O=S.value}});if(N){Q.val(N)}if(N&&Q.val()!=N){O=N+" - "+"Unknown account";x("<option/>").val(N).text(O).appendTo(Q);Q.val(N)}if(O!=""){Q.siblings("span.edit-select").text(O)}}var w={};var B={};function m(P,N){var O=B[N];if(O==null){var M=!tempo.isEmptyString(P.attr("issueKey"));O=x.ajax({async:M,url:encodeURI(N),dataType:"jsonp",success:function(Q){w[N]=Q},error:function(R,Q,S){alert("Got error in TDD query: "+R+", status: "+Q+", error: "+S+", element: "+P.attr("id")+", URL:"+N)}});B[N]=O}return O}function G(M,P){var N=w[M];if(N==null){var O=m(P,M);O.done(function(Q){p(P,Q,M)})}else{p(P,N,M)}}var b={};var h={};function o(M,P){var N=M+":"+P;var O=h[N];if(O==null){O=x.ajax({async:true,cache:false,url:contextPath+"/rest/tempo-rest/1.0/worklogs/customFieldValue/"+M+"/"+P,success:function(Q){b[N]=Q}});h[N]=O}return O}function D(N,O,M){return N.replace("{"+O+"}",M)}function a(N,R,M,Q){var O=b[N];if(O==null){var P=o(M,Q);P.done(function(S){if(!tempo.isEmptyString(S)){G(D(N,Q,S),R)}})}else{if(!tempo.isEmptyString(O)){G(D(N,Q,O),R)}}}x.fn.populateDynamicDropdown=function(M){x(this).each(function(){var W=x(this);var P=M;if(P==null){P=W.attr("issueKey")}var O=W.attr("externalURL");if(tempo.isEmptyString(O)){return}if(O.indexOf("{")>0){if(tempo.isEmptyString(P)){return}var T=O.indexOf("{")+1;var R=O.indexOf("}");var N=O.substr(T,(R-T));var S=W.attr("id");var V=S.substr(0,S.indexOf("_"));var U=P;var Q=x("#"+V+N);if(Q.length>0){U=Q.val()}else{if(N!="IssueKey"){a(O,W,P,N);return}}if(tempo.isEmptyString(U)){return}O=D(O,N,U)}G(O,W)});return this};function J(M){return M.replace(/\//g,"-")}var F={};function i(N,M,O){var P=false;var Q=M+"_"+N.val()+"_"+O;if(F[Q]){P=F[Q]}else{x.ajax({type:"POST",url:contextPath+"/rest/tempo-rest/1.0/worklogs/validation/date/full",async:false,data:{date:N.val(),formFieldId:N.attr("name"),user:M,planning:O},success:function(R){P=H(R,N.closest("form"))}});F[Q]=P}return P}function u(O,N,M){var Q=Date.parseDate(O,E);if(M){Q=Date.parseDate(O,s)}var P=Date.parseDate(N,E);return Q.getTime()<=P.getTime()}function H(M,N){var P=N.find("ul.error-list");var O=true;x(M).find("submit-result").each(function(){var Q=x(this);if(Q.attr("valid")=="false"){Q.find("errors").each(function(){var R=x(this);P.append(x("<li/>").text(R.find("errorMessage").text()))});O=false}});return O}function v(N,M){tb_show(this.innerHTML,"#TB_inline?height="+M+"&amp;width=780&amp;inlineId="+N+"&amp;modal=true")}var L={dirty:false,locked:false,popup_title:{}};var c=x('<div id="tempo-blanket"/>').css("z-index","2000").css("height","100%").hide();var z={show:function(M){c.addClass("aui-blanket").css("z-index",M||"2000").show();if(x.fancybox){x.fancybox.showActivity()}else{x("div.aui-loading").show()}},hide:function(){c.removeClass("aui-blanket").css("z-index","2000").hide();x("div.aui-loading").hide();if(x.fancybox){x.fancybox.hideActivity()}}};var K=function(M){z.show();if(M){window.location=M}else{window.location.reload()}return this};function q(){x("#submitSearch").addClass("refresh-required")}function r(P){if(tempo.state.locked){return}tempo.spinner.show("9000");tempo.state.locked=true;x(":button").attr("disabled",true);var O=x(this).find("form");var R=O.find("ul.error-list");var M=O.find("input[name=user]").val();if(!M){M=x(O.find("select.dialog-user-picker").val()).get(0)}var Q=O.serialize();var N=O.attr("action");N=N.replace("{issueKey}",O.find(":input[name=issue]").val());N=N.replace("{id}",O.find("input[name=id]").val());N=N.replace("{type}",O.find("input[name=type]").val());x.ajax({async:true,type:"POST",url:N,data:Q,success:function(S){O.cleanFormValidation();x(S).find("submit-result").each(function(){var T=x(this);if(T.attr("valid")=="false"){T.find("errors").each(function(){var W=x(this);var X=W.find("formFieldId").text();x('[name="'+X+'"]',O).addClass("error-field");R.append(x("<li/>").text(W.find("errorMessage").text()))})}else{tempo.state.dirty=true;O.fixDirtyForm();if(O.find("input[name=tracker]").val()=="true"){tempobar.stopTracker()}if(P.type=="add-close"||P.type=="update"||P.type=="move"||P.type=="split"){tempo.reload();return}else{O.resetFormFields();if(O.find(":input[name=planning]").val()=="true"){var V=O.find("input[name=date]");var U=O.find("input[name=enddate]");g(O,M,V,U)}else{tempo.issue.get(O.find(":input[name=issue]").val(),O)}O.find("select.tempoDynamicDropDown").populateDynamicDropdown(O.find(":input[name=issue]").val())}}});x(":button").attr("disabled",false);tempo.spinner.hide();tempo.state.locked=false},error:function(S,U,T){if(T=="Unauthorized"){alert(d)}else{if(U=="timeout"){alert("Add hours failed - Service timed out - Please try again")}else{alert(tempo.extractErrorMessage(S.responseText))}}x(":button").attr("disabled",false);tempo.spinner.hide();tempo.state.locked=false},dataType:"xml"})}function k(M){return M==undefined||M==null||M.length==0}function t(M){return M.match(/(.*)\((.*)\).*/)}var I=function(){};var y=AJS||JIRA?{Dropdown:AJS.Dropdown?AJS.Dropdown:AJS.DropDown,formatSuccess:jira.app.fragments?jira.app.fragments.issueActionsFragment:JIRA.FRAGMENTS.issueActionsFragment,FormPopup:AJS.FormPopup||(JIRA?JIRA.FormDialog:I),containDropdown:AJS.containDropdown||(JIRA?JIRA.containDropdown:I),sessionStorage:(jira.app.session?jira.app.session.storage:JIRA.SessionStorage)}:{};function A(N){var M=jQuery(N).find("message").text();if(M){return M}return N}function l(){var P=x(this).closest("form");P.find(".enddate").toggle(this.checked);P.find("input[name=date]").trigger("change");var N=P.find("label.timepicker-label");var O=N.attr("tmp");var M=N.text();N.attr("tmp",M);N.text(O)}function e(O){var Q=x("#timesheet-mlink");if(Q.length>0){if(jira.app.issue.getIssueKey()){var M=(O.planning==true)?"TempoAllocateTime!default.jspa?type=issue&id=":"TempoAddHours!default.jspa?id=";var N=contextPath+"/secure/"+M+jira.app.issue.getIssueId();var R=x("<a>").attr("href",N).addClass("issueaction-tempo-add-hours-on-issue hidden");x("header").first().append(R);R.click().remove()}else{var P=(O.planning==true)?x("#tempo-plan-button"):x("#tempo-add-button");if(P.length===1){P.click()}else{window.location=Q.attr("href")}}}}return{$:x,DATE_FORMAT:E,DATE_TIME_FORMAT:s,MATCHING_STRATEGY:f,spinner:z,reload:K,requireReload:q,state:L,submit:r,changeDateFormatForRest:J,calculateRemainingEstimate:j,widget:y,isEmptyString:k,extractUser:t,blanket:c,extractErrorMessage:A,processValidationResult:H,thickbox:{open:v,close:function(){tb_removeNoRefresh()}},shortcutOpenDialog:e,showHoursLabel:l}})(jQuery);tempo.$(function(f){f("a#log-work-link").bind("click",function(k){h(k)});JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(l,k){f(k).find("a#log-work-link").bind("click",function(m){h(m)})});function h(m){var k=f("a#issue-view-tempo-panel-log-work");if(k.length===1){m.preventDefault();m.stopPropagation();var l=contextPath+"/secure/TempoAddHours!default.jspa?id="+jira.app.issue.getIssueId();f(this).attr("href",l).addClass("issueaction-tempo-add-hours-on-issue");k.trigger("click")}}var c=new tempo.widget.FormPopup({id:"tempo-medium-form",trigger:"a.tempoaction-open-medium-form",ajaxOptions:{data:{inline:true,decorator:"dialog"}},initCallback:function(){hideFunction=this.hide},widthClass:"medium",onContentRefresh:function(){var k=this.get$popupContent()}});var a=new tempo.widget.FormPopup({id:"tempo-small-form",trigger:"a.tempoaction-open-small-form",ajaxOptions:{data:{inline:true,decorator:"dialog"}},initCallback:function(){hideFunction=this.hide},widthClass:"small",onContentRefresh:function(){var k=this.get$popupContent()}});var j=new tempo.widget.FormPopup({id:"tempo-add-hours-issue-dialog",trigger:"a.issueaction-tempo-add-hours-on-issue",ajaxOptions:{data:{inline:true,decorator:"dialog"}},widthClass:"medium",onContentRefresh:function(){var l=this.get$popupContent();var k=l.find("form").attr("data-form-type");f(l).siblings().first().addClass(k);g(f(l[0]));this._focusFirstField=function(){f(":input[name=time]",l).trigger("focus")}}});new tempo.widget.FormPopup({id:"tempo-grace-form",trigger:"a.tempoaction-open-dialog-form",ajaxOptions:{data:{inline:true,decorator:"dialog"}},initCallback:function(){hideFunction=this.hide},widthClass:"medium",onContentRefresh:function(){var k=this.get$popupContent();f("div.datepicker",k).tempoDatePicker({validate:true})}});new tempo.widget.FormPopup({id:"tempo-planning-create-team",trigger:"a.tempo-planning-create-team",ajaxOptions:{data:{inline:true,decorator:"dialog"}},widthClass:"medium",onContentRefresh:function(){var l=this.get$popupContent();var k=this;f("div.datepicker",l).tempoDatePicker({validate:false});f("input.button",l).bind("click",function(){var m=f(this).closest("form");f("form",l).each(function(){if(this.id!=m.attr("id")){f(this).find("input:hidden").remove()}})});this._focusFirstField=function(){f(":input[name=time]",l).trigger("focus")};g(f(l[0]))}});function g(m){f("select.tempoDynamicDropDown",m).bind("change",function(){});f("select.tempo-tracker-picker",m).tempoIssuePicker();f("select.plan-user-picker",m).tempoSingleUserPicker();f("div.datepicker",m).tempoDatePicker({validate:true});f("div.tempo-timepicker",m).tempoTimePicker();f("#tempo-logwork-issue-cancel",m).bind("click",function(){if(tempo.state.dirty){tempo.reload()}});f("div.dialog-panel-form",m).attr("title","");var l=f("input.tempo-show-period",m);if(l.attr("checked")){tempo.showHoursLabel.apply(l[0])}l.bind("click",tempo.showHoursLabel);f(m).bind("add-close",tempo.submit).bind("add",tempo.submit);f("#issue-add-button",m).bind("click",function(o){var n=f(m).find("form *:input#issue-add-another");if(n.attr("checked")){f(m).trigger("add");f(m).find("form:first *:input[type!=hidden]:first").focus()}else{f(m).trigger("add-close")}return false});var k=f("#tempo-log-work input.tempoIssueKey",m).val();if(k){f("#tempo-log-work form select.tempoDynamicDropDown",m).populateDynamicDropdown(k)}}var e=f('#gh_column_contents a.item-link[href*="/TempoAllocateTime!default.jspa"]');if(e.length>0){var i=f("<a/>").addClass("issueaction-tempo-add-hours-on-issue");i.appendTo("body");e.bind("click",function(k){i.attr("href",this.href);i.trigger("click");return false})}var b=f("<a/>").addClass("tempo-planning-create-team");b.appendTo("body");var d=f('#gh_column_contents a.item-link[href*="/AllocateTeam!default.jspa"]');d.bind("click",function(k){b.attr("href",this.href);b.trigger("click");return false});f("select.tempo-user-picker-admin").tempoSingleUserPicker({type:"admins"});f("select.tempo-user-picker-user").tempoSingleUserPicker();f("select.tempo-worklog-validation-picker").tempoIssuePicker();jQuery("select.tempoDynamicDropDown").bind("change",function(){});jQuery("select.issue-select").bind("change",function(){});tempo.blanket.appendTo("body")});
tempo.issue=(function(f){function g(h,j,m){j.cleanFormValidation();var l=j.find("input[name=user]").val();if(j.find("select.dialog-user-picker").val()){l=f(j.find("select.dialog-user-picker").val()).get(0)}var k=j.find("ul.error-list");if(l!=""){var i=contextPath+"/rest/tempo-rest/2.0/issue/"+h+"/"+true;f.ajax({url:i,data:{username:l},cache:false,success:function(n){f(n).find("issue").each(function(){var o=f(this);if(o.attr("issue-valid")=="false"){var p=f(this).find("error");k.append(f("<li/>").text(p.attr("message")))}else{if(!m){a(j,h,o)}}})}})}}function a(k,h,i){k.find("select.tempoDynamicDropDown").populateDynamicDropdown(h);var m=i.attr("issue-internal")=="true";if(m){k.find("div.remaining-and-billed-hours-container").hide()}else{k.find("div.remaining-and-billed-hours-container").show();var j=k.find("input.remaining");j.val(i.attr("remaining-estimate"));k.find("span.originalEstimate").text(i.attr("original-estimate"));k.find("span.remainingEstimate").text(i.attr("remaining-estimate"));k.find("span.totalSpent").text(i.attr("hours-spent"));var l=k.find(":input[name=time]");if(l.length>0&&l.val()!=""){tempo.calculateRemainingEstimate(k,j,l.val())}}}function d(i,l){var m=l.find(".tempo-subtask-container");var h=l.find("select.tempo-subtask-picker");m.addClass("hidden");h.empty();h.append(f("<option>",{value:i}).text("Select Sub-task"));var k=contextPath+"/rest/tempo-rest/2.0/issues/picker/subTasks/"+i;var j=l.find("select.tempo-subtask-picker").attr("data-counter");f.ajax({url:k,cache:false,success:function(n){f(n).find("item").each(function(p){var o=f(this);h.append(f("<option>",{value:o.attr("key")}).text(o.attr("key")+" "+o.attr("name")))});if(f(n).find("item").size()==0){m.addClass("hidden");l.find(".tempo-issue-container").removeClass("highlighted")}else{if(j==3){m.removeClass("hidden");l.find(".tempo-issue-container").addClass("highlighted");l.find(".tempo-subtask-container").removeClass("highlighted")}}}})}function c(h){return h!=null&&h!=""&&h.match(/^\w+-\d+$/)}function b(j){var i=f(this).closest("form").cleanFormValidation();var h;if(i.find("select.tempo-issue-picker").val()!=null){h=f(i.find("select.tempo-issue-picker").val()).get(0)}var k=f(j.currentTarget).hasClass("dialog-user-picker");if(c(h)){if(i.find("select.tempo-subtask-picker").length!=0&&!k){d(h,i);f("select.tempo-subtask-picker").trigger("change")}else{g(h,i,k)}}}function e(k){var j=f(this).closest("form").cleanFormValidation();var h=f(j.find("select.tempo-issue-picker").val()).get(0);var i=j.find("select.tempo-subtask-picker").attr("data-counter");if(f(this).children().length>1){if(i==3&&(this.value==j.find("select.tempo-issue-picker").val())){j.find(".tempo-issue-container").addClass("highlighted");j.find(".tempo-subtask-container").removeClass("highlighted")}else{j.find(".tempo-issue-container").removeClass("highlighted");j.find(".tempo-subtask-container").addClass("highlighted");h=j.find("select.tempo-subtask-picker").val()}}var l=f(k.currentTarget).hasClass("dialog-user-picker");if(c(h)){g(h,j,l)}}f("select.tempo-issue-picker").live("change",b);f("select.sub-issue-select").live("change",e);f("select.dialog-user-picker").live("change",b);f("select.tempo-filter-dropdown").live("change",function(i){var h=i.target.value;f(this).closest("form").find("select.tempo-issue-picker-filter").parent().html("<label for='tempo-issue-picker-filter'>"+"Issue"+"</label><select id='tempo-issue-picker' class='tempo-issue-picker tempo-issue-picker-filter' name='issue'/>");f("select.tempo-issue-picker-filter").tempoIssuePicker({type:"filter/"+h})});return{get:g,select:b,valid:c}})(jQuery);
jQuery.fn.editInPlace=function(a){var b={url:"",params:"",field_type:"text",select_options:"",textarea_cols:"25",textarea_rows:"10",bg_over:"#ffc",bg_out:"transparent",saving_text:"Saving...",saving_image:"",default_text:"(Click here to add text)",select_text:"Choose new value",value_required:null,element_id:"element_id",update_value:"update_value",original_html:"original_html",save_button:'<button class="inplace_save">Save</button>',cancel_button:'<button class="inplace_cancel">Cancel</button>',show_buttons:false,on_blur:"save",callback:null,callbackShowErrors:true,success:null,error:function(d){alert("Failed to save value: "+d.responseText||"Unspecified Error")}};if(a){jQuery.extend(b,a)}if(b.saving_image!=""){var c=new Image();c.src=b.saving_image}String.prototype.trim=function(){return this.replace(/^\s+/,"").replace(/\s+$/,"")};String.prototype.escape_html=function(){return this.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")};return this.each(function(){if(jQuery(this).html()==""){jQuery(this).html(b.default_text)}var d=false;var e=jQuery(this);var f=0;jQuery(this).mouseover(function(){jQuery(this).css("background",b.bg_over)}).mouseout(function(){jQuery(this).css("background",b.bg_out)}).click(function(){f++;if(!d){d=true;var m=jQuery(this).html();var q=(b.show_buttons)?b.save_button+" "+b.cancel_button:"";if(m==b.default_text){jQuery(this).html("")}if(b.field_type=="textarea"){var p='<textarea name="inplace_value" class="inplace_field">'+jQuery(this).text().trim().escape_html()+"</textarea>"}else{if(b.field_type=="text"){var p='<input type="text" name="inplace_value" class="inplace_field" value="'+jQuery(this).text().trim().escape_html()+'" />'}else{if(b.field_type=="select"){var n=b.select_options.split(",");var p='<select name="inplace_value" class="inplace_field"><option value="">'+b.select_text+"</option>";for(var l=0;l<n.length;l++){var h=n[l].split(":");var o=h[1]||h[0];var k=o==m?'selected="selected" ':"";p+="<option "+k+'value="'+o.trim().escape_html()+'">'+h[0].trim().escape_html()+"</option>"}p+="</select>"}}}jQuery(this).html('<form class="inplace_form" style="display: inline; margin: 0; padding: 0;">'+p+" "+q+"</form>")}if(f==1){function g(){d=false;f=0;e.css("background",b.bg_out);e.html(m);return false}function j(){e.css("background",b.bg_out);var i=jQuery(this);var s=(i.is("form"))?i.children(0).val():i.parent().children(0).val();if(b.saving_image!=""){var r='<img src="'+b.saving_image+'" alt="Saving..." />'}else{var r=b.saving_text}e.html(r);if(b.params!=""){b.params="&"+b.params}if(b.callback){html=b.callback(e.attr("id"),s,m,b.params);d=false;f=0;if(html){e.html(html||s)}else{if(b.callbackShowErrors){alert("Failed to save value: "+s)}e.html(m)}}else{if(b.value_required&&(s==""||s==undefined)){d=false;f=0;e.html(m);alert("Error: You must enter a value to save this field")}else{jQuery.ajax({url:b.url,type:"POST",data:b.update_value+"="+s+"&"+b.element_id+"="+e.attr("id")+b.params+"&"+b.original_html+"="+m,dataType:"html",complete:function(t){d=false;f=0},success:function(u){var t=u||b.default_text;e.html(t);if(b.success){b.success(u,e)}},error:function(t){e.html(m);if(b.error){b.error(t,e)}}})}}return false}e.children("form").children(".inplace_field").focus().select();e.children("form").children(".inplace_cancel").click(g);e.children("form").children(".inplace_save").click(j);if(!b.show_buttons){if(b.on_blur=="save"){e.children("form").children(".inplace_field").blur(j)}else{e.children("form").children(".inplace_field").blur(g)}}jQuery(document).keyup(function(i){if(i.keyCode==27){g()}});e.children("form").submit(j)}})})};
tempo.dropdown=(function(b){function a(){var d=b(this.hash);var e=d.is(":visible");b("div.action-list .box, div.actions-list.box").hide();b("a.open-dropdown").removeClass("active");if(!e){d.show();b(this).addClass("active")}else{d.hide();b(this).removeClass("active")}return false}function c(){b("a.open-dropdown").bind("click",a);b(document).bind("click",function(){var d=b(this);if(!d.is(".action-list *,.open-dropdown,.open-dropdown *")){b("div.action-list .box, div.actions-list.box").hide();b("a.open-dropdown:not(.open-issue)").removeClass("active")}});b("a.open-dropdown:not(.open-issue)").removeClass("active");tempo.widget.Dropdown.create({trigger:".tempo-actions-trigger",ajaxOptions:{dataType:"json",cache:false,formatSuccess:function(d){jiraFragment=tempo.widget.formatSuccess(d);jiraFragment.find("ul:first").remove();return jiraFragment}}})}return{init:c,handler:a}})(jQuery);
tempo.ui=(function(a){function b(){a("a.tempo-spinner").live("click",function(){tempo.spinner.show()});a("a.no-link").live("click",function(){return false});a("select.tempoDynamicDropDown").live("change",function(){var d=a(this);d.attr("selectedValue",d.val())});var c=window.onbeforeunload;window.onbeforeunload=function(){a("form.tempo-form").fixDirtyForm();if(a.isFunction(c)){return c.call([])}return true}}return{init:b}})(jQuery);

tempo.inplace=(function(c){function b(g){var h=false;jQuery(g).find("submit-result").each(function(){var i=c(this);if(i.attr("valid")=="false"){i.find("errors").each(function(){var j=c(this);alert(j.find("errorMessage").text())});h=false}else{h=true}});return h}function f(g){return jQuery("<div/>").text(g).html()}function e(l,k,j,h,i,g){var m=f(k);c.ajax({url:h,async:false,type:"POST",data:i,dataType:"xml",success:function(n){if(!b(n)){return j}else{a(g)}},error:function(n,p,o){alert("Error: "+tempo.extractErrorMessage(n.responseText));return j}});return m}function a(g){if(g){tempo.state.dirty=true}else{tempo.requireReload()}}function d(j,g){j=j||document;var h="Save";var i="Cancel";c("span.tempo-edit-inplace",j).each(function(){var k=c(this);var n=k.hasClass("required");var l=k.attr("data-type")||"text";var m=k.attr("data-resource");if(l!="select"){k.editInPlace({value_required:n,show_buttons:true,save_button:'<a class="inplace_save" title="'+h+'">saveText</a>',cancel_button:'<a class="inplace_cancel" title="'+i+'">cancelText</a>',callbackShowErrors:false,field_type:l,callback:function(r,p,o){var q=e(r,p,o,m,{value:p},g);a(g);return c(o).text(p)}})}else{k.bind("click",function(){var o=k.siblings("select");k.hide();o.show()})}});tempo.widget.Dropdown.create({trigger:".tempo-actions-trigger",ajaxOptions:{dataType:"json",cache:false,formatSuccess:function(k){jiraFragment=tempo.widget.formatSuccess(k);jiraFragment.find("ul:first").remove();return jiraFragment}}});var h="Save";var i="Cancel";c("span.editHours",j).editInPlace({value_required:true,show_buttons:true,save_button:'<a class="inplace_save" title="'+h+'">saveText</a>',cancel_button:'<a class="inplace_cancel" title="'+i+'">cancelText</a>',callbackShowErrors:false,field_type:"text",callback:function(o,l,k){var n=c("#"+o).attr("hourtype");var p=o.replace(n+"_","");var m=e(o,l,k,contextPath+"/rest/tempo-rest/1.0/worklogs/hours/update",{worklogId:p,worklogHours:l,hourType:n},g);if(m!=k){a(g);return c(k).text(l)}return m}});c("span.editDesc",j).editInPlace({value_required:true,callbackShowErrors:false,show_buttons:true,save_button:'<a class="inplace_save" title="'+h+'">saveText</a>',cancel_button:'<a class="inplace_cancel" title="'+i+'">cancelText</a>',field_type:"textarea",textarea_rows:3,callback:function(n,l,k){var o=n.replace("comment_","");var m=e(n,l,k,contextPath+"/rest/tempo-rest/1.0/worklogs/description/update",{worklogId:o,worklogDescription:l},g);return c(k).text(l)}});c("span.tempo-calendar-inline",j).each(function(){var l=c(this);var q=l.find(".tempo-calendar-display");var m=l.find(".tempo-calendar-input");var n=l.find(".tempo-calendar-trigger");var p=m.attr("id").replace("date_","");q.editInPlace({value_required:true,callbackShowErrors:false,show_buttons:true,save_button:'<a class="inplace_save" title="'+h+'">saveText</a>',cancel_button:'<a class="inplace_cancel" title="'+i+'">cancelText</a>',field_type:"text",callback:function(u,t,s){return e(u,t,s,contextPath+"/rest/tempo-rest/1.0/worklogs/date/update",{worklogId:p,worklogDate:t},g)}});m.bind("change",function(){e(this,this.value,this.value,contextPath+"/rest/tempo-rest/1.0/worklogs/date/update",{worklogId:p,worklogDate:this.value},g)});var o=l.hasClass("showStartTime");var r=l.hasClass("ISO8061WeekNumbers");var k=tempo.DATE_FORMAT;if(o){k=tempo.DATE_TIME_FORMAT}Calendar.setup({context:l,firstDay:0,displayArea:q.attr("id"),inputField:m.attr("id"),button:n.attr("id"),align:"Tl",singleClick:true,ifFormat:k,daFormat:k,timeFormat:"24",showsTime:o,useISO8601WeekNumbers:r,electric:false})})}return d})(jQuery);
tempo.worklogforms=(function(a){function d(){var e=new tempo.widget.FormPopup({id:"tempo-split-form-dialog",trigger:"a.worklogaction-tempo-split-worklog",ajaxOptions:{data:{inline:true,decorator:"dialog"}},widthClass:"medium",onContentRefresh:function(){var i=this.get$popupContent();i.bind("split",tempo.submit);a("#issue-split-button",i).bind("click",function(){i.trigger("split");return false});b(i,"split");c("splitIssue");a(".tempo-timepicker",i).tempoTimePicker();a("select.tempo-issue-picker",i).tempoIssuePicker({submitHandler:function(){i.trigger("split")}})}});var h=new tempo.widget.FormPopup({id:"tempo-move-form-dialog",trigger:"a.worklogaction-tempo-move-worklog",ajaxOptions:{data:{inline:true,decorator:"dialog"}},widthClass:"medium",onContentRefresh:function(){var i=this.get$popupContent();i.bind("move",tempo.submit);a("#issue-move-button",i).bind("click",function(){i.trigger("move");return false});b(i,"move");c("moveIssueKey");a(".tempo-timepicker",i).tempoTimePicker();a("select.tempo-issue-picker",i).tempoIssuePicker({submitHandler:function(){i.trigger("move")}})}});var f=new tempo.widget.FormPopup({id:"tempo-delete-form-dialog",trigger:"a.worklogaction-tempo-delete-worklog",ajaxOptions:{data:{inline:true,decorator:"dialog"}},widthClass:"small"});a("a.delete-worklog").live("click",function(){var j=a("#comment_"+this.id.split("_")[1]).text();var i=confirm(this.title+"\n '"+a.trim(j)+"'");if(i){jQuery.ajax({async:false,url:this.href,type:"DELETE",success:function(k){tempo.reload()},error:function(k){alert("Error during delete: "+tempo.extractErrorMessage(k.responseText))}})}return false});var g=a("#tempo-report-module.stalker-original").find(":input.worklog-attribute");g.live("click",function(){var i=a(this);if(i.val()!=null&&i.parent().find(".no-value").length==1){i.trigger("change")}});g.live("change",function(){var k=a(this);var i=k.attr("data-worklog");var j=k.attr("data-key");var l=k.val();if(k.is(":checkbox")&&!k.is(":checked")){l=""}a.ajax({url:contextPath+"/rest/tempo-rest/2.0/worklogs/"+i+"/attributes/"+j,data:{value:l},type:"POST",dataType:"xml",success:function(m){a(m).find("submit-result").each(function(){var o=a(this);if(o.attr("valid")=="false"){o.find("errors").each(function(){var q=a(this);alert(q.find("errorMessage").text())})}else{tempo.requireReload();if(k.hasClass("tempoDynamicDropDown")){var n=k.siblings("span.edit-select");if(n.length>0){var p=k.children("option:selected").text();k.hide();n.text(p).show()}}}})},error:function(m,o,n){alert("Unknown update error: "+o)}})})}function c(e){jira.widget.autocomplete.Issues({fieldID:e,ajaxData:{fieldName:e,showSubTasks:"true",currentJQL:""}})}function b(f,e){if(a.browser.msie){a(f).find(":not([autocomplete])").keypress(function(g){if(g.which==13){f.trigger(e);return false}});a(f).find("[autocomplete]").keypress(function(g){if(g.which==13){return false}})}}return{init:d}})(jQuery);
tempo.ui.init();tempo.worklogforms.init();tempo.dropdown.init();JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(h,d,g){if(JIRA.Issues&&JIRA.Issues.InlineEdit){JIRA.Issues.InlineEdit.BlurTriggerMapping.custom.billingKeys=JIRA.Issues.InlineEdit.BlurTriggers.Default}var b=AJS.$(d);if(b.find("#tempo-content")){var i=b.find("#tempo-content");if(i.hasClass("empty")){a("");i.removeClass("empty")}}b.find("a.selectperiod").live("click",function(j){var k=jQuery(this).attr("id").replace("period_","");a(k);j.preventDefault();return false});function a(e){jQuery.ajax({async:true,url:contextPath+"/TempoIssuePanel!default.jspa?id="+jira.app.issue.getIssueId()+"&period="+e,type:"GET",success:function(j){c(j);tempo.inplace(b.find("#tempo-content"));b.find("#tempo-content a.open-dropdown").bind("click",tempo.dropdown.handler)}})}function c(e){b.find("#tempo-content").empty().append(e)}function f(){var j={};var e=window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(k,l,n){j[l]=n});return j}});
jQuery(function(A){var B={getContextPath:function(){return contextPath
},getParamsFromFieldSet:function(C){var D={};
C.find("input").each(function(){D[this.name]=this.value
});
return D
},initShowMoreButton:function(E,F,D,H){if(E.data("initialised")===undefined){var C=E.parent();
var G=this.getParamsFromFieldSet(C.children("fieldset"));
E.click(function(I){E.hide();
C.append("<img src='"+B.getContextPath()+"/images/icons/wait.gif'/>");
A.ajax({type:"GET",url:B.getContextPath()+F,dataType:D,data:G,success:function(J){C.remove();
H(J)
}});
I.preventDefault();
I.stopPropagation();
return false
})
}},createTemporaryInvisibleDiv:function(){return A(document.createElement("div")).hide()
},initShowMoreButtonInIssueTab:function(C){var D=A("a[id^='issue_key_']").text()||A("#key-val").text();
if(D){C.parent().children("fieldset").find("input[name='issueKey']").attr("value",D)
}this.initShowMoreButton(C,"/browse/"+D,"html",function(G){var F=A("#issue_actions_container");
var E=B.createTemporaryInvisibleDiv();
E.html(G);
E.find("div.issuePanelContainer table, div.issuePanelContainer div.plugin_subversion_showmore_issuetab").appendTo(F);
B.initShowMoreButtonInIssueTab(F.find("input.plugin_subversion_showmore_issuetab_button"))
});
C.data("initialised",true)
},initShowMoreButtonInProjectTab:function(D){var E=A("select[name='selectedVersion'] option:selected");
var C=D.parent().children("fieldset");
var F=this.getParamsFromFieldSet(C);
if(E.length==1){C.find("input[name='versionId']").attr("value",E.attr("value"))
}this.initShowMoreButton(D,"/browse/"+F.projectKey,"json",function(H){var K=A("div.projectPanel table.plugin_subversion_projectcommits_table");
var G=B.createTemporaryInvisibleDiv();
G.html(H.content);
var I=G.find("table.plugin_subversion_projectcommits_table");
var J=I.children("tbody");
if(J.length>0){I=J
}I.appendTo(K);
B.initShowMoreButtonInProjectTab(K.find("input.plugin_subversion_showmore_projectab_button"))
})
},initVersionSelectForm:function(C){C.find("select[name='selectedVersion']").change(function(){C.submit()
})
}};
if(JIRA.ViewIssueTabs&&JIRA.ViewIssueTabs.onTabReady&&A.isFunction(JIRA.ViewIssueTabs.onTabReady)){JIRA.ViewIssueTabs.onTabReady(function(){A("input.plugin_subversion_showmore_issuetab_button").each(function(){B.initShowMoreButtonInIssueTab(A(this))
})
})
}A(".plugin_subversion_showmore_issuetab_button").click(function(){A(this).data("initialised",false)
});
A("input.plugin_subversion_showmore_projectab_button").each(function(){B.initShowMoreButtonInProjectTab(A(this))
});
B.initVersionSelectForm(A("form.plugin_subversion_versionselect_form"))
});
AJS.$(function() {
    AJS.JFEP = AJS.JFEP || {};

    var tabReadyCallback = function($container) {
        AJS.$('.twixi-toggle', $container).live('click', function (e) {
            e.preventDefault();
            if (AJS.$(e.target).hasClass('expand-all')) {
                AJS.$('.twixi-block.collapsed').removeClass('collapsed').addClass('expanded');
            } else {
                if (AJS.$(e.target).hasClass('collapse-all')) {
                    AJS.$('.twixi-block.expanded').removeClass('expanded').addClass('collapsed');
                }
            }
        });
        AJS.$('.review-filter', $container).live('change', function (e) {
            var val = AJS.$(e.target).val(),
                    visibility = AJS.$(e.target).is(':checked') ? 'block' : 'none';
            AJS.$('.review-status-' + val).css('display', visibility);
        });
        AJS.$('.tab-content', $container).find('.project-activity:gt(0)').addClass('hidden');
        AJS.$('.activity-filter input', $container).live('change', function (e) {
            var val = AJS.$('.activity-filter input:checked').val();
            AJS.$('.project-activity').addClass('hidden');
            AJS.$('.limit-' + val).removeClass('hidden');
        });

        AJS.$("#hide_tab", $container).live('click', function(e) {
            AJS.$("#preview_form").submit();
            e.preventDefault();
        });
    };

    // register JS to be called on tab ready if possible
    if (JIRA.ViewIssueTabs) {
        JIRA.ViewIssueTabs.onTabReady(tabReadyCallback);
    } else {
        tabReadyCallback(document);
    }

    AJS.JFEP.tabControl = function () {
        AJS.$('.tabs2').each(function () {
            var container = AJS.$(this);
            container.find('.tab-content:gt(0)').addClass('hidden').end().find('.tabs a').click(function (e) {
                e.preventDefault();
                var trigger = AJS.$(this),
                        target = AJS.$(this).attr('href');
                if (target.length) {
                    container.find('.tab-content:visible').addClass('hidden').end()
                            .find('.active').removeClass('active').end()
                            .find(target).removeClass('hidden');
                    trigger.parent('li').addClass('active');
                }
            });
        });
    };

    AJS.JFEP.reviewIssueToggle = function () {
        AJS.$('.review-issue-target').addClass('hidden');
        AJS.$('.review-issue-trigger').click(function(e) {
            e.preventDefault(); // Leave the mouse focus on the trigger
            var target = AJS.$(this).attr('href');
            AJS.$(target).toggleClass('hidden');
        });
    };

    AJS.JFEP.ignoreCookieName = function() {
        var username = AJS.$("#header-details-user-fullname").attr("data-username");
        if (!username) {
            username = "__ANON";
        }
        return "JFEP.ignoredAppLinks." + username;
    };

    AJS.JFEP.ignoreAppLink = function(applicationId) {
        // append cookie - have to hand-roll our cookie handling code until AJS-574 is fixed
        var cookieValue;
        var cookie = document.cookie;
        if (cookie.indexOf(AJS.JFEP.ignoreCookieName() + "=") > -1) {
            var rx = new RegExp(AJS.JFEP.ignoreCookieName() + "=([^;]*)");
            cookieValue = rx.exec(cookie)[1];
        } else {
            cookieValue = "";
        }

        if (cookieValue.indexOf(applicationId) == -1) {
            // set cookie so error messages suppressed
            cookieValue += (cookieValue.length > 0 ? "|" : "") + applicationId;
            var expires=new Date();
            expires.setDate(expires.getDate()+365);
            document.cookie = AJS.JFEP.ignoreCookieName() + "=" + cookieValue + "; " +
                    "expires=" + expires.toUTCString() + "; " +
                    "path=" + contextPath;
        }
    };

    AJS.JFEP.clearIgnoredAppLinks = function() {
        // clear cookie - have to hand-roll our cookie handling code until AJS-574 is fixed
        var expires=new Date();
        expires.setDate(expires.getDate()-5);
        document.cookie = AJS.JFEP.ignoreCookieName() + "=expired;" +
                    "expires=" + expires.toUTCString() + "; " +
                    "path=" + contextPath;
    };

    AJS.$(".ignore-applink").live("click", function () {
        var applinkId = AJS.$(this).attr("data-id");
        AJS.JFEP.ignoreAppLink(applinkId);
        AJS.$(this).parents(".credentials-required-message").slideUp();
    });

    AJS.$(".clear-ignored-applinks").live("click", function () {
        AJS.JFEP.clearIgnoredAppLinks();
        document.location.reload(true);
    });

    AJS.JFEP.loadMoreChangesets = function (contextPath, issueKey, searchIndexParam) {
        jQuery("#more-changesets-action-spinner").show();
        jQuery("#more-changesets-blurb").hide();
        JIRA.SmartAjax.makeRequest({
            url: contextPath + "/rest/tabs/1.0/more-changesets/" + issueKey + searchIndexParam,
            type: "GET",
            dataType: "json",
            contentType: "application/json",
            complete: function (xhr, status, smartAjaxResult) {
                if (!smartAjaxResult.successful) {
                    // The REST service provides nice and informative error messages, so let's use them,
                    // *except* for some cases where JIRA.SmartAjax.buildSimpleErrorContent() provides better
                    // error messages. Lovely.
                    // TODO: JIRA.SmartAjax.buildSimpleErrorContent() should really handle this logic for us.
                    var errorContent = (smartAjaxResult.status !== 401 || smartAjaxResult.statusText === JIRA.SmartAjax.SmartAjaxResult.TIMEOUT)
                        ? JSON.parse(smartAjaxResult.data).errorMessages
                        : JIRA.SmartAjax.buildSimpleErrorContent(smartAjaxResult);
                    jQuery(document).trigger(JIRA.SERVER_ERROR_EVENT, errorContent);
                } else {
                    var changesets = smartAjaxResult.data.changesets,
                        changesetLinks = [];
                    for (var i = 0, len = changesets.length;i < len;i++) {
                        var cs = changesets[i];
                        if (AJS.$('#changeset-' + cs.repository + cs.csid).length === 0) {
                            changesetLinks.push(AJS.template.load("more-changesets-template").fill({href:cs.uri, repository:cs.repository, csid:cs.csid}));
                        }
                    }
                    jQuery("#more-changesets-action-spinner").hide();
                    jQuery("#more-changesets-action").append(":").append(changesetLinks.join(","));
                    jQuery("#more-changesets-blurb").show();
                }
            }
        });
        jQuery("#more-changeset-link").unbind('click');
    };
});
(function(A){if(typeof JBAM==="undefined"){JBAM={}
}if(typeof JBAM.CONFIG==="undefined"){JBAM.CONFIG={$planSelect:A(),$buildTypes:A(),buildResultsContainerId:"bamboo-build-results",stagesContainerId:"bamboo-plan-stages",variablesContainerId:"bamboo-override-variables",initialised:false,updateTimeout:null,init:function(){if(JBAM.CONFIG.initialised){return 
}A(document).bind("dialogContentReady",function(D){var C=JBAM.CONFIG.buildResultsContainerId,B=JBAM.CONFIG.stagesContainerId,E=JBAM.CONFIG.variablesContainerId;
JBAM.CONFIG.$planSelect=A("#bamboo-plan").change(JBAM.CONFIG.onPlanChange);
JBAM.CONFIG.BuildResults.init({container:{id:C,insertAfter:JBAM.CONFIG.$planSelect.closest(".field-group")}});
JBAM.CONFIG.Stages.init({container:{id:B,insertAfter:"#"+C}});
JBAM.CONFIG.Variables.init({container:{id:E,insertAfter:"#"+B}});
JBAM.CONFIG.$buildTypes=A("input:radio[name='buildType']").change(JBAM.CONFIG.onBuildTypeChange).filter(":checked").change().end()
});
JBAM.CONFIG.initialised=true
}};
JBAM.CONFIG.Spinner=function(B,C){this.beforeShow=C;
this.add=function(){return A(AJS.template.load(JBAM.templates.icon).fill({type:"loading"}).toString()).appendTo(B)
}
};
JBAM.CONFIG.Spinner.prototype.show=function(){var B=this.$spinner;
this.beforeShow();
if(!B||(B&&(!B.length||!B.parent().length))){this.$spinner=this.add()
}else{B.show()
}return this
};
JBAM.CONFIG.Spinner.prototype.hide=function(){this.$spinner.hide();
return this
}
}JBAM.CONFIG.onPlanChange=function(H){var D=A("#existing-build").is(":checked"),G=A(this),C=G.add(JBAM.CONFIG.$buildTypes).attr("disabled",true),K=G.find("option:selected"),F=(D?K.attr("data-selected-build-result"):null),L=(D?null:K.attr("data-selected-stages")),I=(D?null:K.attr("data-selected-variables")),J,E,B;
if(I){I=A.parseJSON(I)
}JBAM.CONFIG.BuildResults.updateSelectedBuildResult(F);
JBAM.CONFIG.Stages.updateSelectedStages(L);
JBAM.CONFIG.Variables.updateSelectedVariables(I);
JBAM.CONFIG.Variables.hide();
if(D){JBAM.CONFIG.Stages.hide();
JBAM.CONFIG.BuildResults.showSpinner();
J=JBAM.restURL+"history/"+JBAM.jiraProjectKey+"/"+G.val()+"/5";
E={continuable:true,buildstate:"successful"};
B=function(M){if(M.results.result&&M.results.result.length){JBAM.CONFIG.BuildResults.show(M.results.result)
}else{JBAM.CONFIG.BuildResults.showNoResultsMsg()
}C.attr("disabled",false)
}
}else{JBAM.CONFIG.BuildResults.hide();
JBAM.CONFIG.Stages.showSpinner();
J=JBAM.restURL+"plan/"+JBAM.jiraProjectKey+"/"+G.val();
B=function(M){if(M.stages.stage&&M.stages.stage.length){JBAM.CONFIG.Stages.show(M.stages.stage)
}else{JBAM.CONFIG.Stages.showNoStagesMsg()
}if(M.variableContext.variable&&M.variableContext.variable.length){JBAM.CONFIG.Variables.show(M.variableContext.variable)
}C.attr("disabled",false)
}
}A.ajax({url:J,dataType:"json",data:E,success:B,error:function(S,T){var O,R,M,N,P=A('<div class="form-body"></div><div class="form-footer"><a class="cancel">Cancel</a></div>');
P.find(".cancel").click(function(U){if(JBAM.CONFIG.FormDialog&&JBAM.CONFIG.FormDialog.hide){JBAM.CONFIG.FormDialog.hide()
}});
try{N=S.responseText||S.response;
if(N){O=A.parseJSON(N);
R=O.message;
M=(O.messageBody?"<p>"+O.messageBody+"</p>":null);
if(O.oauthCallback){P.filter(".content-footer").prepend('<a href="'+O.oauthCallback+"&amp;redirectUrl="+encodeURIComponent(JBAM.baseURL)+'">Login &amp; Approve</a> | ')
}}else{throw"noJSONResponse"
}}catch(Q){R="An error occurred while trying to retrieve the build information."
}AJS.messages.warning(P.filter(".form-body"),{title:R,body:M,closeable:false});
G.closest("form").replaceWith(P)
}})
};
JBAM.CONFIG.onBuildTypeChange=function(E){var B=A(this),D=B.closest("fieldset.group"),C=D.nextAll(".field-group,.group"),F=A("#"+JBAM.CONFIG.buildResultsContainerId);
switch(B.val()){case"no-build":C.hide();
D.css({"margin-bottom":0,"padding-bottom":0});
break;
case"new-build":C.show();
F.hide();
D.css({"margin-bottom":"","padding-bottom":""});
JBAM.CONFIG.$planSelect.change();
break;
case"existing-build":C.show();
D.css({"margin-bottom":"","padding-bottom":""});
JBAM.CONFIG.$planSelect.change();
break
}};
JBAM.CONFIG.Stages=(function(){var C={container:{id:null,insertAfter:null,i18n:{legend:"Stages"}},selectedStages:null},J,I,E,F=function(){I=A("<fieldset/>",{id:J.container.id,"class":"group",html:E}).insertAfter(J.container.insertAfter).delegate("input:checkbox","click",G)
},B=function(L){var K=false,U,N,W;
for(N=0,W=L.length;
N<W;
N++){var P=L[N],Q=!!(P.state&&P.state!="Unknown"),V=!!(P.manual),M=!!(!P.manual||Q),O,S,T="stage-"+N,R;
if(!K&&P.manual&&!Q){K=true
}S=A('<input type="checkbox" />').attr({name:"selectedStages",id:T,"class":"checkbox",checked:V,disabled:M}).val(P.name);
R=A("<label />",{text:P.name,"for":T});
O=A("<div/>",{"class":"checkbox"+(P.manual?(Q?" already-run":" manual"):"")+(!K?" selected":"")}).append(S).append(R).appendTo(I);
if(!Q&&V){U=O
}}if(U){U.find("input:checkbox").trigger("click",true)
}},D=function(){I.find("div.checkbox,p").remove()
},G=function(O,K){if(K){O.preventDefault()
}var L=A(this),N=L.is(":checked"),M=false;
L.closest("div.checkbox").toggleClass("selected",N).prevAll("div.checkbox").each(function(R){var Q=A(this),S=Q.children("input:checkbox"),P=Q.hasClass("manual");
if(N){Q.addClass("selected");
if(P){S.attr("checked","checked").attr("disabled","disabled")
}}else{if(P&&!M){S.removeAttr("disabled");
M=true
}}}).end().nextAll("div.checkbox").each(function(Q){var P=A(this);
if(P.hasClass("manual")){return false
}else{P.toggleClass("selected",N)
}})
},H;
return{init:function(K){J=A.extend(true,C,K);
E="<legend><span>"+J.container.i18n.legend+"</span></legend>";
F();
H=new JBAM.CONFIG.Spinner(I,D)
},show:function(K){I.html(E).show();
B(K)
},hide:function(){I.hide().html(E)
},showNoStagesMsg:function(){H.hide();
I.append(A("<p/>",{text:"No stages found."}))
},showSpinner:function(){H.show()
},updateSelectedStages:function(K){J.selectedStages=K
}}
})();
JBAM.CONFIG.Variables=(function(){var B={container:{id:null,insertAfter:null,i18n:{legend:"Build Variables"}},selectedVariables:null},K,I,J,F,G=function(){I=A("<fieldset/>",{id:K.container.id,"class":"group",html:F}).insertAfter(K.container.insertAfter).delegate("#override-another","click",H).delegate(".bamboo-icon-variable-delete","click",E).delegate("select","change",D)
},C=function(Q){var L,P,N,O;
J=A("<select/>",{"class":"select"});
for(N=0,O=Q.length;
N<O;
N++){var M=Q[N];
if(L!=M.variableType){L=M.variableType;
P=A("<optgroup/>",{label:L}).appendTo(J)
}A("<option/>",{text:M.key,data:{"server-value":M.value}}).appendTo(P)
}},H=function(){var M=J.clone(true),N,O,P,L="";
if(arguments.length==2){O=M.find("option[text='"+arguments[0]+"']");
L=arguments[1]
}else{O=M.find("option:first")
}O.attr("selected","selected");
P=A('<input type="text" />').attr({name:"variable_"+O.val(),placeholder:O.data("server-value"),"class":"text medium-field"}).val(L);
N=A("<div/>",{"class":"field-group"}).append(M).append(P).append(AJS.template.load(JBAM.templates.icon).fill({type:"variable-delete"}).toString()).insertBefore(I.children("a"))
},E=function(L){A(this).closest(".field-group").remove()
},D=function(N){var L=A(this),M=L.find("option:selected");
L.nextAll(".text").attr({name:"variable_"+M.val(),placeholder:M.data("server-value")})
};
return{init:function(L){K=A.extend(true,B,L);
F="<legend><span>"+K.container.i18n.legend+'</span></legend><a id="override-another">Override variable<span class="icon icon-edit-sml"></span></a>';
G()
},show:function(L){C(L);
if(K.selectedVariables&&K.selectedVariables.variables){A.each(K.selectedVariables.variables,H)
}I.show()
},hide:function(){I.hide().html(F)
},updateSelectedVariables:function(L){K.selectedVariables=L
}}
})();
JBAM.CONFIG.BuildResults=(function(){var D={container:{id:null,insertAfter:null,i18n:{legend:"Existing Build"}},selectedBuildResult:null},J,I,F,G=function(){I=A("<fieldset/>",{id:J.container.id,"class":"group",html:F}).insertAfter(J.container.insertAfter).delegate("input:radio","change",E).delegate("a","click",function(K){K.preventDefault();
window.open(this.href)
})
},C=function(O){var N,P,M="build-result-"+O.number,K,L=(O.lifeCycleState=="Finished"?(O.continuable?"SuccessfulPartial":O.state):O.lifeCycleState);
P=A('<input type="radio" />').attr({name:"buildResult",id:M,"class":"radio",checked:(O.key==J.selectedBuildResult)}).val(O.key).data("stages",(O.stages.stage&&O.stages.stage.length?O.stages.stage:[]));
K=A("<label />",{html:'<a href="'+JBAM.bambooBaseURL+"/browse/"+O.key+'" class="'+L+'">#'+O.number+'</a><span class="trigger-reason">'+JBAM.replaceWithBambooIcon(O.buildReason)+"</span>","for":M}).prepend(AJS.template.load(JBAM.templates.icon).fill({type:L}).toString());
N=A("<div/>",{"class":"radio"}).append(P).append(K).appendTo(I)
},B=function(){I.find("div.radio,p").remove()
},E=function(K){var L=A(this).data("stages");
if(L&&L.length){JBAM.CONFIG.Stages.show(L)
}else{JBAM.CONFIG.Stages.showNoStagesMsg()
}},H;
return{init:function(K){J=A.extend(true,D,K);
F="<legend><span>"+J.container.i18n.legend+"</span></legend>";
G();
H=new JBAM.CONFIG.Spinner(I,B)
},show:function(M){I.html(F).show();
for(var K=0,L=M.length;
K<L;
K++){C(M[K])
}},hide:function(){I.hide().html(F)
},showNoResultsMsg:function(){H.hide();
I.append(A("<p/>",{text:"No builds found with unbuilt manual stages."})).show()
},showSpinner:function(){H.show()
},updateSelectedBuildResult:function(K){J.selectedBuildResult=K
}}
})();
JBAM.CheckReleaseBuildStatus=function(C,B){A.ajax({url:JBAM.restURL+"status/"+JBAM.jiraVersionId+"/"+C,dataType:"json",success:function(G){var E=G.bamboo,F=(E.lifeCycleState=="Finished"?(E.continuable?"SuccessfulPartial":E.state):E.lifeCycleState),D;
if((E.lifeCycleState!="InProgress"&&E.lifeCycleState!="Queued")||(G.jira&&G.jira.forceRefresh)){AJS.reloadViaWindowLocation()
}else{if(E.lifeCycleState=="InProgress"&&E.progress){if(!B){D=A("#build-details");
B=A(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Duration",keyClass:"duration","value:html":E.progress.prettyBuildTime+" &ndash; <span>"+E.progress.prettyTimeRemaining+"</span>"}).toString()).appendTo(D).find("dd");
D.find(".build + dd > span.bamboo-icon").replaceWith(AJS.template.load(JBAM.templates.icon).fill({type:F}).toString())
}else{B.html(E.progress.prettyBuildTime+" &ndash; <span>"+E.progress.prettyTimeRemaining+"</span>")
}}}clearTimeout(JBAM.CONFIG.updateTimeout);
JBAM.CONFIG.updateTimeout=setTimeout(function(){JBAM.CheckReleaseBuildStatus(C,B)
},5000)
},error:function(J,K){var G,I,E,F,D=A("#build-details").empty();
try{F=J.responseText||J.response;
if(F){G=A.parseJSON(F);
I=G.message;
E=(G.messageBody?"<p>"+G.messageBody+"</p>":"");
if(G.oauthCallback){E+='<p><a href="'+G.oauthCallback+"&amp;redirectUrl="+encodeURIComponent(JBAM.baseURL)+'">Login &amp; Approve</a></p>'
}}else{throw"noJSONResponse"
}}catch(H){I="An error occurred while trying to retrieve the build information."
}AJS.messages.warning(D,{title:I,body:E,closeable:false})
}})
};
JBAM.ShowBuildReleaseDetails=function(D){var C=A("#build-details"),B=A(AJS.template.load(JBAM.templates.icon).fill({type:"loading"}).toString());
if(C.length){B.appendTo(C);
A.ajax({url:JBAM.restURL+"status/"+JBAM.jiraVersionId+"/"+D,dataType:"json",success:function(O){var P=O.bamboo,F=(P.lifeCycleState=="Finished"?(P.continuable?"SuccessfulPartial":P.state):P.lifeCycleState),I=[],G,N,J=[],E,H,K;
if(O.jira&&O.jira.forceRefresh){AJS.reloadViaWindowLocation()
}B.remove();
C.append(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Build",keyClass:"build","value:html":AJS.template.load(JBAM.templates.icon).fill({type:F}).toString()+' <a href="'+JBAM.bambooBaseURL+"/browse/"+D+'"><span class="'+F+'">#'+P.number+"</span> "+P.planName+"</a>"}).toString());
C.append(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Trigger",keyClass:"trigger","value:html":JBAM.replaceWithBambooIcon(P.buildReason)}).toString());
if(P.vcsRevisionKey){C.append(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Revision",keyClass:"revision","value:html":P.vcsRevisionKey}).toString())
}if(P.labels.label&&P.labels.label.length){for(G=0,N=P.labels.label.length;
G<N;
G++){var L=P.labels.label[G];
I.push(AJS.template.load(JBAM.templates.labelItem).fill({name:L.name}).toString())
}C.append(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Labels",keyClass:"labels","value:html":'<ul class="labels">'+I.join("")+"</ul>"}).toString())
}if(P.lifeCycleState=="InProgress"||P.lifeCycleState=="Queued"){if(P.lifeCycleState=="InProgress"&&P.progress){K=A(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Duration",keyClass:"duration","value:html":P.progress.prettyBuildTime+" &ndash; <span>"+P.progress.prettyTimeRemaining+"</span>"}).toString()).appendTo(C).find("dd")
}clearTimeout(JBAM.CONFIG.updateTimeout);
JBAM.CONFIG.updateTimeout=setTimeout(function(){JBAM.CheckReleaseBuildStatus(D,K)
},5000)
}else{if(P.lifeCycleState=="Finished"){if(P.buildCompletedTime){C.append(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Completed",keyClass:"completed","value:html":'<time datetime="'+P.buildCompletedTime+'">'+P.prettyBuildCompletedTime+" &ndash; <span>"+P.buildRelativeTime+"</span></time>"}).toString())
}if(P.buildDuration){C.append(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Duration",keyClass:"duration","value:html":P.buildDurationDescription}).toString())
}}else{if(P.lifeCycleState=="NotBuilt"){if(P.buildStartedTime){C.append(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Started",keyClass:"started","value:html":'<time datetime="'+P.buildStartedTime+'">'+P.prettyBuildStartedTime+"</time>"}).toString())
}if(P.buildCompletedTime){C.append(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Completed",keyClass:"completed","value:html":'<time datetime="'+P.buildCompletedTime+'">'+P.prettyBuildCompletedTime+" &ndash; <span>"+P.buildRelativeTime+"</span></time>"}).toString())
}C.append(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Status",keyClass:"status","value:html":(P.buildStartedTime&&!P.buildCompletedTime?"Reason for not completing is unknown":"Reason for not building is unknown")}).toString())
}}}if(P.artifacts.artifact&&P.artifacts.artifact.length){for(E=0,H=P.artifacts.artifact.length;
E<H;
E++){var M=P.artifacts.artifact[E];
J.push(AJS.template.load(JBAM.templates.artifactItem).fill({id:M.name,url:M.link.href,name:M.name,size:M.prettySizeDescription}).toString())
}C.append(AJS.template.load(JBAM.templates.buildDetail).fill({key:"Artifacts",keyClass:"artifacts","value:html":'<ul id="shared-artifacts">'+J.join("")+"</ul>"}).toString())
}},error:function(J,K){var G,I,E,F;
B.remove();
try{F=J.responseText||J.response;
if(F){G=A.parseJSON(F);
I=G.message;
E=(G.messageBody?"<p>"+G.messageBody+"</p>":"");
if(G.oauthCallback){E+='<p><a href="'+G.oauthCallback+"&amp;redirectUrl="+encodeURIComponent(JBAM.baseURL)+'">Login &amp; Approve</a></p>'
}}else{throw"noJSONResponse"
}}catch(H){I="An error occurred while trying to retrieve the build information."
}AJS.messages.warning(C,{title:I,body:E,closeable:false})
}})
}};
JBAM.replaceWithBambooIcon=function(B){return B.replace(/(\b)icon(\b)/g,"$1bamboo-icon$2")
};
JBAM.init=(function(){JBAM.CONFIG.init();
A(function(){var B=A("#runRelease");
if(B.length){JBAM.CONFIG.FormDialog=new JIRA.FormDialog({trigger:B,widthClass:"large",autoClose:true});
if(/showReleaseDialog=true/.test(window.location.href)){B.click()
}}})
})()
})(AJS.$);
// This file was automatically generated from share-dialog.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.Dialogs == 'undefined') { JIRA.Templates.Dialogs = {}; }
if (typeof JIRA.Templates.Dialogs.Share == 'undefined') { JIRA.Templates.Dialogs.Share = {}; }


JIRA.Templates.Dialogs.Share.contentPopup = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<form action="#" method="post" class="aui recipients-form share-content-popup"><fieldset><label for="sharenames-multi-select">', soy.$$escapeHtml("User name or email"), '</label><div class="autocomplete-user-target"><select id="sharenames" name="sharenames" class="share-user-picker hidden" multiple="multiple"></select></div><ol class="recipients"></ol><div><label for="note">', soy.$$escapeHtml("Note"), '</label></div><textarea class="textarea" id="note" placeholder="', soy.$$escapeHtml("Add an optional note"), '"/></fieldset><div class="button-panel"><div class="icon"></div><div class="progress-messages"></div><input accesskey="', soy.$$escapeHtml("s"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to submit this form","s",opt_data.modifierKey)), '" class="button submit" type="submit" value="', soy.$$escapeHtml("Share"), '" disabled/> <a accesskey="', soy.$$escapeHtml("`"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to cancel","`",opt_data.modifierKey)), '" class="close-dialog" href="javascript:">', soy.$$escapeHtml("Cancel"), '</a></div></form>');
  return opt_sb ? '' : output.toString();
};

(function(A){function B(C){A(".share-user-picker",C).each(function(){var D=new JIRA.MultiUserListPicker({element:A(this),width:250,freeEmailInput:true});A(document).trigger("ready.multi-select.share-user",D)})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(E,C,D){if(D!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){B(C)}})}(AJS.$));
(function(C){var E,J;function G(K){if(K){C(document).one("hideLayer",function(N,M,L){if(M=="inlineDialog"&&L.popup==E){C(document).unbind(".share-dialog");J.empty()}})}E.hide();return false}function F(){return AJS.$(this).attr("data-username")}function D(){return AJS.$(this).attr("data-email")}function H(){var R=J.find(".recipients");var L=R.find("li[data-username]").map(F).toArray();var Q=R.find("li[data-email]").map(D).toArray();if(!(L.length||Q.length)){return false}C("button,input,textarea",this).attr("disabled","disabled");var S=J.find(".button-panel .icon");S.css("left","10px").css("position","absolute");var T=Raphael.spinner(S[0],7,"#666");var O=J.find(".progress-messages");O.text("Sending");O.css("padding-left",S.innerWidth()+5);var U=J.find("#note").val();var P={usernames:L,emails:Q,message:U};var K=contextPath+"/rest/share/1.0";var M=JIRA.Meta.getIssueKey();if(M){K+="/issue/"+M}else{var N=AJS.Meta.get("filter-id");if(N){K+="/filter/"+N}else{P.jql=AJS.Meta.get("filter-jql");K+="/search"}}JIRA.SmartAjax.makeRequest({type:"POST",contentType:"application/json",dataType:"json",url:K,data:JSON.stringify(P),success:function(){T();S.addClass("icon-tick");O.text("Sent");setTimeout(function(){G(true)},1000)},error:function(W,V){T();S.addClass("icon-cross");O.text("Error while sending")}});return false}function A(K){J.find(".submit").prop("disabled",!K)}function I(K){AJS.$(K).handleAccessKeys({selective:false})}function B(M,K,L){J=M;if(J.children().length){L();return }J.append(JIRA.Templates.Dialogs.Share.contentPopup({modifierKey:AJS.Navigator.modifierKey()}));if(AJS.$.browser.msie){J.find("form").ieImitationPlaceholder()}A(false);J.find("#sharenames").bind("change unselect",function(){var N=C(this).val();A(N&&N.length)});J.find(".close-dialog").click(function(){G(true)});J.find("form").submit(function(){H();return false});C(document).bind("keyup.share-dialog",function(N){if(N.keyCode==27){return G(false)}return true});C(document).bind("showLayer.share-dialog",function(P,O,N){if(O=="inlineDialog"&&N.popup==E){J.find("#sharenames-textarea").focus()}});I(AJS.$("form",J));L();JIRA.trigger(JIRA.Events.NEW_CONTENT_ADDED,[J])}AJS.toInit(function(L){var K={hideCallback:function(){L(".dashboard-actions .explanation").hide()},width:273,offsetY:17,offsetX:-100,hideDelay:3600000,useLiveEvents:true};E=AJS.InlineDialog(L("#jira-share-trigger"),"share-entity-popup",B,K);L("#jira-share-trigger").live("click",function(){if(E.find(".contents:visible").length){E.find("a.close-dialog").click()}});AJS.$(document).bind("showLayer",function(O,M,N){if(M&&M==="inlineDialog"&&N&&N.id&&N.id==="share-entity-popup"){L("body").unbind("click.share-entity-popup.inline-dialog-check")}});AJS.$(document).bind("keydown",function(M){if(M.keyCode===27&&AJS.InlineDialog.current!=E&&E.is(":visible")){if(AJS.InlineDialog.current){AJS.InlineDialog.current.hide()}E.hide()}});AJS.$(window).scroll(function(){G(false)})})})(AJS.$);
(function(){var B=JIRA.FormDialog.extend({_performRedirect:function(D){AJS.$(AJS).trigger("gh.issueaction.gotorapidboard",{action:"direct"});window.location.href=D}});var C=new B({id:"gh-rapidboard-dialog",trigger:"a.issueaction-greenhopper-rapidboard-operation",ajaxOptions:JIRA.Dialogs.getDefaultAjaxOptions});var A=function(E){var F="";var D=AJS.$(E);if(D.hasClass("js-rapidboard-operation-sprint")){F="sprint"}else{if(D.hasClass("js-rapidboard-operation-issue")){F="issue"}}return F};AJS.$(function(){AJS.$(document).delegate(".issueaction-greenhopper-rapidboard-operation","click",function(D){D.preventDefault();var E=A(D.currentTarget);AJS.$(AJS).trigger("gh.issueaction.gotorapidboard",{eventSuffix:E,action:"open"});C.show()});AJS.$(document).delegate(".js-select-rapidboard","click",function(D){var E=A(D.currentTarget);AJS.$(AJS).trigger("gh.issueaction.gotorapidboard",{eventSuffix:E,action:"chosen"})})})})();
JIRA.EpicPicker=AJS.SingleSelect.extend({init:function(C){var E=C.element;var B=this;function A(G){return{searchQuery:G,projectKey:AJS.$(E).attr("data-project-key"),maxResults:10}}function D(M,H,J){M=soy.$$escapeHtml(M);H=soy.$$escapeHtml(H);J=soy.$$escapeHtml(J);var N=J.toUpperCase();var I=M.toUpperCase();var O=H.toUpperCase();var N=(N+"").replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g,"\\$1");var G=new RegExp("("+N+")","gi");var K=I.search(G);var L;if(K>-1){L=M.slice(K,K+J.length);M=M.replace(L,"<em>"+L+"</em>")}K=O.search(G);if(K>-1){L=H.slice(K,K+J.length);H=H.replace(L,"<em>"+L+"</em>")}return M+" - ("+H+")"}function F(J){if(!J.epicNames){return[]}var O=[];var I=J.epicNames;var P=B.getQueryVal();var K=new AJS.GroupDescriptor({weight:1,id:"epic-names",label:P.length===0?"Suggestions":AJS.format("Showing {0} of {1} matching epics",I.length,J.total),replace:true});for(var L=0,M=I.length;L<M;L++){var H=I[L];var G=H.key;var N=H.name;var Q=N+" - ("+G+")";var R=D(N,G,P);K.addItem(new AJS.ItemDescriptor({value:"key:"+G,fieldText:N,label:R,html:R,allowDuplicate:false,highlighted:true}))}O.push(K);return O}AJS.$.extend(C,{submitInputVal:true,showDropdownButton:true,removeDuplicates:true,ajaxOptions:{url:contextPath+"/rest/greenhopper/1.0/epics",query:true,data:A,formatResponse:F}});this._super(C)}});JIRA.EpicPicker.READY_EVENT="gh.epic-picker.ready";
(function(B){function A(C){B(".js-epic-picker",C).each(function(){var E=B(this);var D=new JIRA.EpicPicker({element:E});B(document).trigger(JIRA.EpicPicker.READY_EVENT,D)})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(E,C,D){if(D!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){A(C)}})})(AJS.$);
(function(B){B.namespace("gh.app.globalkeyboardshortcuts");var A=gh.app.globalkeyboardshortcuts;A.findSelectedIssueId=function(){var C;if(jira&&jira.app&&jira.app.issuenavigator&&jira.app.issuenavigator.getSelectedIssueId){C=jira.app.issuenavigator.getSelectedIssueId()}if(!C&&jira&&jira.app&&jira.app.issue&&jira.app.issue.getIssueId){C=jira.app.issue.getIssueId()}return C};A.goToAgile=function(){var C=(contextPath?contextPath:"")+"/secure/GreenHopper.jspa";window.location.href=C};A.followLink=function(C){var D=B(C);if(D.length>0&&(D[0].nodeName.toLowerCase()==="a"||D[0].nodeName.toLowerCase()==="link")){D.click();window.location.href=D.attr("href")}};A.sendToTop=function(D,E){if(window.GH&&GH.RapidBoard&&GH.Shortcut&&GH.Shortcut.sendToTop){GH.Shortcut.sendToTop(D);A.closeDialogAndPopMessage();return }if(D!="Action"){return }var C=E||A.findSelectedIssueId();if(!contextPath){contextPath=""}JIRA.SmartAjax.makeRequest({type:"post",contentType:"application/json",url:contextPath+"/rest/greenhopper/1.0/rank/global/first",data:JSON.stringify({issueId:C}),success:A.handleRankSuccess});AJS.$(AJS).trigger("gh.global.rankissues",{action:"rankToTop"+(D?D:""),count:1})};A.sendToBottom=function(D,E){if(window.GH&&GH.RapidBoard&&GH.Shortcut&&GH.Shortcut.sendToBottom){GH.Shortcut.sendToBottom(D);A.closeDialogAndPopMessage();return }if(D!="Action"){return }var C=E||A.findSelectedIssueId();if(!contextPath){contextPath=""}JIRA.SmartAjax.makeRequest({type:"post",contentType:"application/json",url:contextPath+"/rest/greenhopper/1.0/rank/global/last",data:JSON.stringify({issueId:C}),success:A.handleRankSuccess});AJS.$(AJS).trigger("gh.global.rankissues",{action:"rankToBottom"+(D?D:""),count:1})};A.closeDialogAndPopMessage=function(){if(JIRA.IssueNavigator.isNavigator()){AJS.reloadViaWindowLocation()}else{if(JIRA.Dialog&&JIRA.Dialog.current){JIRA.Dialog.current.hide()}if(window.GH){if(GH.Message&&GH.Message.showIssueMessage){GH.Message.showIssueMessage()}else{if(GH.RapidBoard&&GH.Notification&&GH.Notification.showIssueMessage){GH.Notification.showIssueMessage()}}if(window.Boards){Boards.refreshAll()}}else{if(JIRA.IssueNavigator&&JIRA.IssueNavigator.Shortcuts&&JIRA.IssueNavigator.Shortcuts.flashIssueRow){JIRA.IssueNavigator.Shortcuts.flashIssueRow()}}}};A.handleRankSuccess=function(C,E,D){A.storeSuccessMessage(C.issueId,C.issueKey,"thanks_issue_updated");A.closeDialogAndPopMessage()};A.storeSuccessMessage=function(E,C,D){var F=JIRA.SessionStorage;F.setItem("selectedIssueId",E);F.setItem("selectedIssueKey",C);F.setItem("selectedIssueMsg",D)};AJS.$(function(){AJS.$(document).delegate(".issueaction-greenhopper-rank-top-operation","click",function(C){C.preventDefault();var D=AJS.$(this).attr("data-issueid");A.sendToTop("Action",D)});AJS.$(document).delegate(".issueaction-greenhopper-rank-bottom-operation","click",function(C){C.preventDefault();var D=AJS.$(this).attr("data-issueid");A.sendToBottom("Action",D)})})})(AJS.$);
(function(E){function B(G){if(typeof google!=="undefined"&&typeof google.maps!=="undefined"){G()
}else{window.onGMapsLoad=G;
E("body").append(E("<script src='https://maps-api-ssl.google.com/maps/api/js?v=3&sensor=false&callback=onGMapsLoad'><\/script>"))
}}function D(G,H){B(function(){window.onGMapsLoad=null;
new google.maps.Geocoder().geocode({address:G},H)
})
}function A(G){if(G.hasClass("open")||G.hasClass("notFound")){F(G)
}else{C(G)
}}function F(G){G.removeClass("open");
G.removeClass("notFound")
}function C(I){var G=I.find("a.location").text(),H=I.find(".jsuMap");
D(G,function(K,J){if(J==google.maps.GeocoderStatus.OK){I.addClass("open");
var L=new google.maps.Map(H.get(0),{zoom:8,center:K[0].geometry.location,mapTypeId:google.maps.MapTypeId.ROADMAP});
new google.maps.Marker({map:L,position:K[0].geometry.location,title:G})
}else{I.addClass("notFound")
}})
}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(I,G){var H=E(".jsuLocation.ready",G);
H.removeClass("ready");
H.each(function(J,K){K=E(K);
K.find("> a").click(function(L){L.preventDefault();
A(K)
})
})
});
JIRA.bind(JIRA.Events.INLINE_EDIT_STARTED,function(){JIRA.Issues.InlineEdit.BlurTriggerMapping.custom.locationselect=JIRA.Issues.InlineEdit.BlurTriggers.Default;
JIRA.Issues.InlineEdit.BlurTriggerMapping.custom.locationtextfield=JIRA.Issues.InlineEdit.BlurTriggers.Default
})
})(AJS.$);
var ApplinksUtils=ApplinksUtils||(function(F){var C={},B={};
var P="com_atlassian_applinks_authentication";
function O(R){var Q=F('<span class="aui-icon icon-close"></span>').click(function(){R.trigger("messageClose",[this]).remove()
});
R.append(Q);
Q.each(AJS.icons.addIcon.init)
}function G(){if(window===parent.window){return null
}var R=null,Q=window;
F("iframe",parent.document.body).each(function(S){if(this.contentWindow.window===Q){R=this
}});
return R
}function D(R,W,V,Q,S){if(W in C){var T=C[W];
if(V){T.authAdminUri=Q;
delete C[W]
}J(T,V)
}if(!S&&parent&&(parent!==window)){var U=window;
F("iframe",parent.document.body).each(function(X,Z){var Y=Z.contentWindow;
if(Y!==U){if(Y.AJS&&Y.AJS.$){Y.AJS.$(Y.document).trigger("applinks.auth.completion",[W,V,Q,true])
}}})
}}function J(Q,T){var S=F(document);
if(T){var R=function(U){if(U.isDefaultPrevented()){M(Q)
}else{H(Q);
document.location.reload(true)
}};
S.bind("applinks.auth.approved",R);
S.trigger("applinks.auth.approved",Q);
S.unbind("applinks.auth.approved",R)
}else{S.trigger("applinks.auth.denied",Q)
}}function K(R,Q){var S=R.find("a.applink-authenticate");
if(R.hasClass("aui-message")){O(R)
}S.click(function(T){window.open(Q.authUri,P);
T.preventDefault()
});
C[Q.id]=Q;
return R
}function N(){F(".applinks-auth-request").each(function(T){var S=F(this),V=S.find(".applinkId").val(),Q=S.find(".appName").val(),R=S.find(".appUri").val(),U=S.find(".authUri").val();
if(V&&U){K(S,{id:V,appName:Q,appUri:R,authUri:U})
}})
}function I(Q){var R=F('<div class="aui-message warning closeable shadowed applinks-auth-request"><p><span class="aui-icon icon-applinks-key"></span></p></div>');
R.append(AJS.format("Additional information may be available, please \u003ca class=\"applink-authenticate\" href=\"{0}\">authenticate\u003c\/a> with \u003ca href=\"{1}\">{2}\u003c\/a>.",AJS.escapeHtml(Q.authUri),AJS.escapeHtml(Q.appUri),AJS.escapeHtml(Q.appName)));
K(R,Q);
return R
}function E(U,R){var Q=F('<span class="applinks-auth-request"></span>'),S=F('<span class="applinks-request-description"></span>'),T=AJS.format("\u003ca class=\"applink-authenticate\" href=\"{0}\">Authenticate\u003c\/a> to see additional information.",AJS.escapeHtml(R.authUri));
if(U){S.append(U);
S.append(" - ")
}S.append(T);
Q.append(S);
K(Q,R);
return Q
}function H(Q){var R=G();
if((!R)||(!R.id)){return 
}if(!parent.ApplinksUtils.pendingConfirmations){parent.ApplinksUtils.pendingConfirmations={}
}if(!(R.id in parent.ApplinksUtils.pendingConfirmations)){parent.ApplinksUtils.pendingConfirmations[R.id]=[]
}parent.ApplinksUtils.pendingConfirmations[R.id].push(Q);
return 
}function L(){if(parent&&parent.ApplinksUtils&&parent.ApplinksUtils.pendingConfirmations){var R=G();
if(R){if(R.id in parent.ApplinksUtils.pendingConfirmations){var S=parent.ApplinksUtils.pendingConfirmations[R.id];
delete parent.ApplinksUtils.pendingConfirmations[R.id];
for(var Q=0,T=S.length;
Q<T;
Q++){M(S[Q])
}}}}}function M(S){var T=F(document),R=F('<div class="aui-message success closeable shadowed applinks-auth-confirmation"><p><span class="aui-icon icon-applinks-key-success"></span></p></div>'),Q=T.find("div.applinks-auth-confirmation-container");
if(!Q.length){Q=T.find("body")
}R.append(AJS.format("This application is now using \u003ca href=\"{0}\">{1}\u003c\/a>\'\'s credentials. Revoke access at any time by going to \u003ca href=\"{2}\">OAuth access tokens\u003c\/a>.",AJS.escapeHtml(S.appUri),AJS.escapeHtml(S.appName),AJS.escapeHtml(S.authAdminUri)));
O(R);
Q.prepend(R);
setTimeout(function(){R.fadeOut(1000,function(){F(this).remove()
})
},5000)
}function A(){if(parent&&!(parent===window)){if(!parent.ApplinksUtils){parent.ApplinksUtils={}
}}F(document).bind("applinks.auth.completion",D);
N();
L()
}F(document).ready(A);
return{createAuthRequestBanner:I,createAuthRequestInline:E}
})(AJS.$);
if(jQuery!=undefined&&AJS!=undefined){jQuery=AJS.$
};
AppLinks=AJS.$.extend(window.AppLinks||{},{Event:{NAMESPACE:"applinks",PREREADY:this.NAMESPACE+".preready",READY:this.NAMESPACE+".ready"}});
if(AJS.AppLinksInitialisationBinder){AppLinks.initialisationBinder=AJS.AppLinksInitialisationBinder
}else{AppLinks.initialisationBinder=function(A){AJS.toInit(A)
}
}AppLinks.initialisationBinder(function(){AppLinks=AJS.$.extend(window.AppLinks||{},{failure:function(E){if(E.status==401){window.location.reload()
}else{var C=AppLinks.parseError(E);
var D=AJS.$(".page-error");
if(D.length>0){D.html(C).fadeIn("slow")
}else{alert("REST request failed: "+C)
}}},jsonRequest:function(D,E,F,G,C){if(F){F=JSON.stringify(F)
}AJS.$(".page-error").fadeOut("fast");
if(!C){C=AppLinks.failure
}jQuery.ajax({url:D,type:E,data:F,dataType:"json",contentType:"application/json; charset=utf-8",cache:false,success:G,error:C})
},parseError:function(E){var C;
try{C=JSON.parse(E.responseText)
}catch(D){if(E.statusText){return C=E.statusText
}else{return E
}}if(C.message){if(AJS.$.isArray(C.message)){return C.message.join(" ")
}return C.message
}else{return E.statusText
}},put:function(D,E,F,C){AppLinks.jsonRequest(D,"PUT",E,F,C)
},post:function(D,E,F,C){AppLinks.jsonRequest(D,"POST",E,F,C)
},update:function(D,E,C){AppLinks.put(AppLinks.self_link(D),D,E,C)
},get:function(D,E,C){AppLinks.jsonRequest(D,"GET",null,E,C)
},self_link:function(E){for(var C=0,F=E.link.length;
C<F;
C++){var D=E.link[C];
if(D.rel=="self"){return D.href
}}throw"No self-link found"
},del:function(F,E,D){var C;
if(typeof (F)=="string"){C=F
}else{C=AppLinks.self_link(F)
}AppLinks.jsonRequest(C,"DELETE",null,E,D)
},SPI:{BASE_URL:AJS.contextPath()+"/rest/applinks/1.0",getAllLinks:function(E,D){var C=AppLinks.SPI.BASE_URL+"/applicationlink";
AppLinks.get(C,E,D)
},getAllLinksWithAuthInfo:function(E,D){var C=AppLinks.SPI.BASE_URL+"/listApplicationlinks";
AppLinks.get(C,E,D)
},getLinksOfType:function(E,F,D){var C=AppLinks.SPI.BASE_URL+"/applicationlink/type/"+E;
AppLinks.get(C,F,D)
},tryToFetchManifest:function(E,F,D){var C=AppLinks.SPI.BASE_URL+"/applicationlinkForm/manifest.json?url="+encodeURIComponent(E);
AppLinks.get(C,F,D)
},getManifestFor:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/manifest/"+F+".json";
AppLinks.get(C,E,D)
},createStaticUrlAppLink:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/applicationlinkForm/createStaticUrlAppLink?typeId="+F;
AppLinks.post(C,null,E,D)
},createLink:function(J,H,L,D,I,K,F,M,E){var C=AppLinks.SPI.BASE_URL+"/applicationlinkForm/createAppLink";
var G={applicationLink:J,username:H,password:L,createTwoWayLink:D,customRpcURL:I,rpcUrl:K,configFormValues:F};
AppLinks.post(C,G,M,E)
},createLinkWithOrphanedTrust:function(J,H,M,D,I,K,F,L,N,E){var C=AppLinks.SPI.BASE_URL+"/applicationlinkForm/createAppLink";
var G={applicationLink:J,username:H,password:M,createTwoWayLink:D,customRpcURL:I,rpcUrl:K,configFormValues:F,orphanedTrust:L};
AppLinks.post(C,G,N,E)
},verifyTwoWayLinkDetails:function(C,I,J,F,H,E){var D=AppLinks.SPI.BASE_URL+"/applicationlinkForm/details";
var G={username:J,password:F,remoteUrl:C,rpcUrl:I};
AppLinks.post(D,G,H,E)
},getApplicationLinkInfo:function(E,F,D){var C=AppLinks.SPI.BASE_URL+"/applicationlinkInfo/id/"+E;
AppLinks.get(C,F,D)
},deleteLink:function(G,C,F,E){var D=AppLinks.SPI.BASE_URL+"/applicationlink/"+G.id;
if(C){D+="?reciprocate=true"
}AppLinks.del(D,F,E)
},makePrimary:function(E,D){var C=AppLinks.SPI.BASE_URL+"/applicationlink/primary/"+E.id;
AppLinks.post(C,null,D)
},relocate:function(H,F,C,G,E){var D=AppLinks.SPI.BASE_URL+"/relocateApplicationlink/"+H.id+"?newUrl="+encodeURIComponent(F)+"&nowarning="+(C?"true":"false");
AppLinks.post(D,null,G,E)
},legacyUpgrade:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/upgrade/legacy/"+F.id;
AppLinks.post(C,null,E,D)
},ualUpgrade:function(G,C,F,E){var D=AppLinks.SPI.BASE_URL+"/upgrade/ual/"+G.id;
AppLinks.post(D,C,F,E)
},getEntityTypesForApplicationType:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/type/entity/"+F;
AppLinks.get(C,E,D)
},getLocalEntitiesWithLinksToApplication:function(C,F,E){var D=AppLinks.SPI.BASE_URL+"/entitylink/localEntitiesWithLinksTo/"+C+".json";
AppLinks.get(D,F,E)
},getEntityLinksForApplication:function(C,F,E){var D=AppLinks.SPI.BASE_URL+"/entities/"+C+".json";
AppLinks.get(D,F,E)
},getEntityLinksForApplicationUsingAnonymousAccess:function(C,F,E){var D=AppLinks.SPI.BASE_URL+"/entities/anonymous/"+C+".json";
AppLinks.get(D,F,E)
},createNonUalEntityLink:function(L,G,D,F,J,E,K,I){var C=AppLinks.SPI.BASE_URL+"/entitylink/"+L+"/"+G+"?reciprocate=false";
var H={applicationId:D,typeId:F,key:J,name:E,isPrimary:false};
AppLinks.put(C,H,K,I)
},createEntityLink:function(H,G,D,C,I,F){var E=AppLinks.SPI.BASE_URL+"/entitylink/"+H+"/"+G+"?reciprocate=";
E+=(C?"true":"false");
AppLinks.put(E,D,I,F)
},getConfiguredEntityLinks:function(F,E,G,D){var C=AppLinks.SPI.BASE_URL+"/entitylink/primaryLinks/"+F+"/"+E+".json";
AppLinks.get(C,G,D)
},deleteEntityLink:function(H,G,D,C,I,F){var E=AppLinks.SPI.BASE_URL+"/entitylink/"+H+"/"+G+"?typeId="+D.typeId+"&key="+D.key+"&applicationId="+D.applicationId+"&reciprocate="+C;
AppLinks.del(E,I,F)
},makePrimaryEntityLink:function(G,F,C,H,E){var D=AppLinks.SPI.BASE_URL+"/entitylink/primary/"+G+"/"+F+"?typeId="+C.typeId+"&key="+C.key+"&applicationId="+C.applicationId;
AppLinks.post(D,null,H,E)
},canDeleteAppLink:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/permission/reciprocate-application-delete/"+F;
AppLinks.get(C,E,D)
},canDeleteEntityLink:function(G,F,C,H,E){var D=AppLinks.SPI.BASE_URL+"/permission/reciprocate-entity-delete/"+C.applicationId+"/"+G+"/"+F+"/"+C.typeId+"/"+C.key;
AppLinks.get(D,H,E)
},canCreateReciprocateEntityLink:function(F,E,D){var C=AppLinks.SPI.BASE_URL+"/permission/reciprocate-entity-create/"+F;
AppLinks.get(C,E,D)
},processPermissionCode:function(D){var C={noPermission:function(){},missing:function(){},credentialsRequired:function(E){},authenticationFailed:function(E){},noAuthentication:function(E){},noAuthenticationConfigured:function(){},noConnection:function(){},allowed:function(){},unrecognisedCode:function(E){},updateView:function(G,F,E){}};
if(!D){D={}
}D=AJS.$.extend(C,D);
return function(F){var E=F.code;
if(E=="NO_PERMISSION"){D.noPermission()
}else{if(E=="MISSING"){D.missing()
}else{if(E=="CREDENTIALS_REQUIRED"){D.credentialsRequired(F.url)
}else{if(E=="AUTHENTICATION_FAILED"){D.authenticationFailed(F.url)
}else{if(E=="NO_AUTHENTICATION"){D.noAuthentication(F.url)
}else{if(E=="NO_AUTHENTICATION_CONFIGURED"){D.noAuthenticationConfigured()
}else{if(E=="NO_CONNECTION"){D.noConnection()
}else{if(E=="ALLOWED"){D.allowed()
}else{D.unrecognisedCode(F.code)
}}}}}}}}}
},addAuthenticationTrigger:function(E,C,D){if(!D){D={}
}if(typeof D.onSuccess=="undefined"){D.onSuccess=function(){location.reload()
}
}if(typeof D.onFailure=="undefined"){D.onFailure=function(){return true
}
}AJS.$(E).unbind("click");
AJS.$(E).click(function(){if(D.before){D.before()
}AppLinks.authenticateRemoteCredentials(C,D.onSuccess,D.onFailure)
})
},deleteOrphanedTrust:function(G,E,F,D){var C=AppLinks.SPI.BASE_URL+"/orphaned-trust/"+E+"/"+G;
AppLinks.del(C,F,D)
},getOrphanedTrust:function(E,D){var C=AppLinks.SPI.BASE_URL+"/orphaned-trust/";
AppLinks.get(C,E,D)
}}});
var B="applinks";
var A=function(F,E){if(E){if(!AJS.$.isArray(E)){E=[new String(E)]
}for(var C=0;
C<E.length;
C++){var D=new RegExp("\\{"+C+"\\}","g");
F=F.replace(D,E[C])
}}return F
};
AppLinks.UI={showInfoBox:function(C){AJS.$(".aui-message.success").remove();
AppLinks.UI.createMessage("success",C,"page-info")
},hideInfoBox:function(){AJS.$(".aui-message.success").remove()
},showErrorBox:function(C){AppLinks.UI.createMessage("error",C,"page-error")
},hideErrorBox:function(){AJS.$(".aui-message.error").remove()
},showWarningBox:function(D){if(AJS.$.isArray(D)&&D.length>0){var C=AJS.$("<ul></ul>");
AJS.$(D).each(function(F){C.append(AJS.$("<li/>",{text:D[F]}))
});
var E=AJS.$('<div class="page-warning"></div>').append(C);
AppLinks.UI.createMessage("warning",E.html(),"page-warning")
}else{AppLinks.UI.createMessage("warning",D,"page-warning")
}},hideWarningBox:function(){AJS.$(".aui-message.warning").remove()
},shortenString:function(D,C){if(D.length>C){D=D.substring(0,C)+"..."
}return D
},createMessage:function(D,E,C){var F=AJS.$('<div class="'+C+'">');
F.html(E);
AJS.messages[D](".applinks-message-bar",{title:"",body:F.wrap("<div></div>").parent().html(),closeable:true,shadowed:true})
},displayValidationErrorMessages:function(C,E,D){if(AJS.$.isArray(D)){AJS.$(D).each(function(H,G){var I=AJS.$('<div class="error applinks-error">');
I.text(G);
AJS.$(E).find("."+C).append(I)
})
}else{var F=AJS.$('<div class="error applinks-error">');
F.text(D.toString());
AJS.$(E).find("."+C).append(F)
}},displayValidationError:function(C,D,E){return function(J){if(J.status==401){window.location.reload();
return 
}AJS.$(".applinks-error").remove();
AJS.$(".loading").remove();
var H=J.responseText;
var I=AJS.$.parseJSON(H);
var G=I.message;
if(typeof I.fields=="undefined"){AppLinks.UI.displayValidationErrorMessages(C,D,G)
}else{var F=I.fields;
AJS.$(F).each(function(K){var L=AJS.$('<div class="error applinks-error" id="'+F[K]+'-error">');
L.text(G[K]);
if(AJS.$(D).find("."+F[K]).length>0){L.insertAfter(AJS.$(D).find("."+F[K]))
}else{L.insertAfter(AJS.$(D).find("."+C).append(L))
}})
}AJS.$(D).find("."+C).addClass("fully-populated-errors");
if(E){E()
}}
},addProtocolToURL:function(C){var F=AJS.$.trim(C);
var E=F.toLowerCase();
var D=false;
if(E.length>=7){if(E.substring(0,7).indexOf("http")!=-1){D=true
}}if(!D){F="http://"+F
}return F
},prettyJoin:function(D,G,F){if(!F){F=AppLinks.I18n.getText("applinks.and")
}var C=D.length;
var E="";
AJS.$.each(D,function(H,I){if(H==(C-1)&&C>1){E+=" "+F+"  "+G(I)
}else{E+=G(I);
if(H+2<C){E+=", "
}}});
return E
},showLoadingIcon:function(C){AJS.$('<span class="loading">&nbsp;</span>').insertAfter(C)
},hideLoadingIcon:function(C){AJS.$(C).next(".loading").remove()
},findUrl:function(F){var E=undefined;
var G=F.toLowerCase();
var D=G.indexOf("http:");
if(D==-1){D=G.indexOf("https:")
}if(D>-1){var C=G.indexOf(" ",D);
if(C==-1){C=G.length
}E=F.substring(D,C)
}return E
},findApplicationType:function(C){C=C.toLowerCase();
if(C.indexOf("jira")!=-1){return"jira"
}else{if(C.indexOf("fisheye")!=-1){return"fecru"
}else{if(C.indexOf("confluence")!=-1){return"confluence"
}else{if(C.indexOf("refapp")!=-1){return"refapp"
}else{return undefined
}}}}},escapeSelector:function(C){return C.replace(/([#;&,\.\+\*\~':"\!\^$\[\]\(\)=>\|])/g,"\\$1")
},sanitiseHTML:function(C){var D={"<":"&lt;",'"':"&quot;","&":"&amp;"};
return C.replace(/[<"&]/g,function(E){return D[E]
})
},refreshOrphanedTrust:function(){var C=function(D){AJS.$("tr.orphaned-trust-row").each(function(){var I=AJS.$(this);
var J=I.attr("data-id");
var G=I.attr("data-type");
var F=false;
for(var E=0;
E<D.orphanedTrust.length;
E++){var H=D.orphanedTrust[E];
if(J==H.id&&G==H.type){F=true;
break
}}if(!F){I.remove();
if(D.orphanedTrust.length==0){AJS.$(".orphaned-trust-warning").hide()
}}})
};
AppLinks.SPI.getOrphanedTrust(C)
},removeCssClass:function(C,D){AJS.$(C).removeClass(function(F,H){var G=H.split(" ");
var E="";
AJS.$.each(G,function(I,J){if(J.indexOf(D)!=-1){E=J
}});
return E
})
}};
AppLinks.I18n={getTextWithPrefix:function(C,D){return A(appLinksI18n.entries[B+"."+C],D)
},getText:function(C,D){return A(AppLinks.I18n.resolveValue(C),D)
},getApplicationTypeName:function(C){return appLinksI18n.entries["applinks.application.type."+C]
},getEntityTypeName:function(C){return appLinksI18n.entries["applinks.entity.type."+C]
},getPluralizedEntityTypeName:function(C){return appLinksI18n.entries["applinks.entity.type.plural."+C]
},getAuthenticationTypeName:function(C){return appLinksI18n.entries["applinks.auth.provider."+C]
},resolveValue:function(C){var D=appLinksI18n.entries[C];
return typeof D=="undefined"?C:D
}};
AppLinks.Docs={createDocLink:function(D,E,C){if(!C){C=""
}else{C=" "+C
}return AJS.$("<a/>",{"class":"ual-help-link"+C,href:AppLinks.Docs.getDocHref(D,E),target:"_blank",text:AppLinks.I18n.getText("applinks.help"),title:AppLinks.I18n.getText("applinks.help")})
},getDocHref:function(D,E){var C=AppLinks.Docs.resolveValue("applinks.docs.root")+"/"+AppLinks.Docs.resolveValue(D);
if(E){C+="#"+AppLinks.Docs.resolveValue(E)
}return C
},resolveValue:function(C){var D=applinksDocs.entries[C];
return typeof D=="undefined"?C:D
}};
AJS.$(document).trigger(AppLinks.Event.PREREADY);
AJS.$(document).trigger(AppLinks.Event.READY)
});
if(!this.JSON){this.JSON={}
}(function(){function f(n){return n<10?"0"+n:n
}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null
};
String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()
}
}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;
function quote(string){escapable.lastIndex=0;
return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];
return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)
})+'"':'"'+string+'"'
}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];
if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)
}if(typeof rep==="function"){value=rep.call(holder,key,value)
}switch(typeof value){case"string":return quote(value);
case"number":return isFinite(value)?String(value):"null";
case"boolean":case"null":return String(value);
case"object":if(!value){return"null"
}gap+=indent;
partial=[];
if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;
for(i=0;
i<length;
i+=1){partial[i]=str(i,value)||"null"
}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";
gap=mind;
return v
}if(rep&&typeof rep==="object"){length=rep.length;
for(i=0;
i<length;
i+=1){k=rep[i];
if(typeof k==="string"){v=str(k,value);
if(v){partial.push(quote(k)+(gap?": ":":")+v)
}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);
if(v){partial.push(quote(k)+(gap?": ":":")+v)
}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";
gap=mind;
return v
}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;
gap="";
indent="";
if(typeof space==="number"){for(i=0;
i<space;
i+=1){indent+=" "
}}else{if(typeof space==="string"){indent=space
}}rep=replacer;
if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")
}return str("",{"":value})
}
}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;
function walk(holder,key){var k,v,value=holder[key];
if(value&&typeof value==="object"){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);
if(v!==undefined){value[k]=v
}else{delete value[k]
}}}}return reviver.call(holder,key,value)
}text=String(text);
cx.lastIndex=0;
if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)
})
}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");
return typeof reviver==="function"?walk({"":j},""):j
}throw new SyntaxError("JSON.parse")
}
}}());
AJS.$(document).bind(AppLinks.Event.READY,function(){AppLinks.autoComplete={cacheManager:function(C){var A={},B=[],C=C||30;
return{get:function(D){return A[D]
},put:function(D,E){A[D]=E;
B.push(D);
if(B.length>C){delete A[B.shift()]
}},clear:function(){A={};
B=[]
}}
}};
(function(D){var C=function(F){AJS.log("InputDrivenDropDown: truncating text");
var H=F.$.closest(".aui-dropdown").width(),G=20;
D("a span:not(.icon)",F.$).each(function(){var J=D(this),I=AJS("var","&#8230;"),L=I.width(),K=false;
J.wrapInner(D("<em>"));
D("em",J).each(function(){var M=D(this);
M.show();
if(this.offsetLeft+this.offsetWidth>H){var T=this.childNodes,S=false;
for(var O=T.length-1;
O>=0;
O--){var P=T[O],N=1,R=(P.nodeType==3)?"nodeValue":"innerHTML",Q=P[R];
do{if(N<=Q.length){P[R]=Q.substr(0,Q.length-N++)
}else{break
}}while(this.offsetLeft+this.offsetWidth+L>H-G);
if(N<=Q.length){S=true;
break
}}if(S){K=true
}else{M.hide()
}}});
if(K){J.append(I);
this.elpss=I
}})
};
var B=function(F,K){if(!K.length||!K[0]){return 
}AJS.log("InputDrivenDropDown: highlighting tokens");
for(var H=0,I=K.length;
H<I;
H++){var G=K[H];
K[H]=G?G.replace(/[\.\*\+\?\|\(\)\[\]{}\\]/g,"\\$"):""
}var J=new RegExp("("+K.join("|")+")","gi");
D("li a:not(.dropdown-prevent-highlight) span",F.$).each(function(){var M=D(this),L=M.html().replace(J,"<strong>$1</strong>");
M.html(L)
})
};
var E=function(J,G){var I=J.options,H=J.dd;
if(H){H.hide();
H.$.remove()
}I.ajsDropDownOptions=I.ajsDropDownOptions||{};
if(I.ajsDropDownOptions&&!I.ajsDropDownOptions.alignment){I.ajsDropDownOptions.alignment="left"
}I.ajsDropDownOptions.selectionHandler=I.ajsDropDownOptions.selectionHandler||function(L,K){if(L.type!="click"){L.preventDefault();
D("a",K).click();
document.location=D("a",K).attr("href")
}};
I.ajsDropDownOptions.displayHandler=function(K){return AJS.escapeHtml(K.name)
};
var F=J.dd=new AJS.dropDown(G.matrix,I.ajsDropDownOptions)[0];
if(I.ajsDropDownOptions&&I.ajsDropDownOptions.className){F.$.addClass(I.ajsDropDownOptions.className)
}if(I.dropdownPlacement){I.dropdownPlacement(F.$)
}else{AJS.log("No dropdownPlacement function specified. Appending dropdown to the body.");
D("body").append(F.$)
}B(F,G.queryTokens||[G.query]);
C(F);
if(I.dropdownPostprocess){I.dropdownPostprocess(F.$)
}F.show(J._effect);
if(typeof I.onShow=="function"){I.onShow.call(F,F.$)
}return F
};
function A(G,F){this._effect="appear";
this._timer=null;
this.id=G;
this.options=F;
this.inactive=false;
this.busy=false;
this.cacheManager=AppLinks.autoComplete.cacheManager()
}A.prototype.clearCache=function(){this.cacheManager.clear()
};
A.prototype.change=function(H,G){var F=this;
if(H!=F._value||G){F._value=H;
F.busy=false;
clearTimeout(F._timer);
if(G||(/\S{0,}/).test(H)){var I=F.cacheManager.get(H);
if(I){E(F,I)
}else{F.busy=true;
F._timer=setTimeout(function(){F.options.getDataAndRunCallback.call(F,H,F.show)
},200)
}}else{F.dd&&F.dd.hide()
}}};
A.prototype.dropDownLength=function(){return this.dd.links?this.dd.links.length:0
};
A.prototype.dropDownItem=function(F){return this.dropDownLength()>F?this.dd.links[F]:null
};
A.prototype.hide=function(){this.dd&&this.dd.hide()
};
A.prototype.remove=function(){var F=this.dd;
if(F){this.hide();
F.$.remove()
}this.inactive=true;
this.options.onDeath&&this.options.onDeath()
};
A.prototype.show=function(G,I,H){if(this.inactive){AJS.log("Quick search abandoned before server response received, ignoring. "+this);
return 
}var F={matrix:G,query:I,queryTokens:H};
this.cacheManager.put(I,F);
E(this,F);
this.busy=false
};
AppLinks.inputDrivenDropdown=function(F){return new A("inputdriven-dropdown",F)
}
})(jQuery)
});
AJS.$(document).bind(AppLinks.Event.PREREADY,function(){(function(D){D.fn.wizard=function(V){var U={width:500,height:350,onshow:function(W,X){return true
},aftershow:function(){return true
},oncancel:function(){return true
},onsubmit:function(){return true
},aftersubmit:function(){return true
},onnext:function(){return true
},onprevious:function(){return true
},cancelLabel:AppLinks.I18n.getText("applinks.cancel"),submitLabel:AppLinks.I18n.getText("applinks.create"),nextLabel:AppLinks.I18n.getText("applinks.next"),previousLabel:AppLinks.I18n.getText("applinks.previous"),id:""};
if(!V){V={}
}V=D.extend(U,V);
var T=this;
this.each(function(){var d=D(this);
var W=new AJS.Dialog(V.width,V.height,V.id);
var l=Q(W,V.onshow,V.aftershow);
var k=C(W,V.oncancel);
var Z=H(W,V.onsubmit,V.aftersubmit);
var m=A(W,V.onprevious);
var i=M(W,V.onnext);
var g=K(W);
var b=O(W);
var c=G(W);
var h=L(W);
var j=S(W);
var e=N(W);
if(V.showButtonId){D("#"+V.showButtonId).click(l)
}var Y=F(d);
for(var a=0;
a<Y.length;
a++){var f=Y[a];
J(W,f);
if(f.className){W.addHeader(f.title,f.className+"-header")
}else{W.addHeader(f.title)
}if(a!=0&&D(f.div).attr("previous")!="false"){W.addButton(V.previousLabel,m,"applinks-previous-button")
}if(a<Y.length-1&&D(f.div).attr("submit")!="true"&&D(f.div).attr("next")!="false"){W.addButton(V.nextLabel,i,"applinks-next-button")
}if(D(f.div).attr("submit")=="true"){W.addButton(V.submitLabel,Z,"wizard-submit")
}if(!W.getPage(a).buttonpanel){W.addButton("",null);
D(W.getPage(a).buttonpanel).empty();
var X=D('<a class="button-panel-button applinks-cancel-link">'+V.cancelLabel+"</a>");
W.getPage(a).buttonpanel.append(X);
X.click(k)
}else{var X=D('<a class="applinks-cancel-link">'+V.cancelLabel+"</a>");
D(W.getPage(a).buttonpanel).append(X);
X.click(k)
}if(a<Y.length-1){W.addPage()
}}T={dialog:W,nextPage:i,prevPage:m,submit:Z,cancel:k,show:l,disableNextBtn:g,enableNextBtn:b,disableSubmitBtn:c,enableSubmitBtn:h,disablePreviousBtn:j,enablePreviousBtn:e};
W.gotoPage(0);
W.gotoPanel(0)
});
return T
};
function S(T){return function(){B(R(T,"applinks-previous-button"))
}
}function N(T){return function(){I(R(T,"applinks-previous-button"))
}
}function K(T){return function(){B(R(T,"applinks-next-button"))
}
}function O(T){return function(){I(R(T,"applinks-next-button"))
}
}function G(T){return function(V){var U=R(T,"wizard-submit");
B(U);
if(typeof (V)=="undefined"||V){D('<span class="loading">&nbsp;</span>').insertBefore(U)
}else{U.parent().find(".loading").remove()
}}
}function L(T){return function(){var U=R(T,"wizard-submit");
I(U);
U.parent().find(".loading").remove()
}
}function R(U,T){return D(U.getPage(U.curpage).buttonpanel).find("."+T)
}function P(T){D(T.popup.element).find("form").each(function(){this.reset()
})
}function I(T){T.attr("disabled",false)
}function B(T){T.attr("disabled",true)
}function Q(T,U,V){return function(W){if(U(T,W)!==false){T.gotoPage(0);
T.gotoPanel(0);
D(document).unbind("keydown.ual.dialog");
D(document).bind("keydown.ual.dialog",E(T));
T.show();
V()
}}
}function C(T,U){return function(){if(U(T)!==false){T.hide();
P(T)
}}
}function A(T,U){return function(){if(U(T)!==false){T.prevPage()
}}
}function M(T,U){return function(){if(U(T)!==false){T.nextPage()
}}
}function E(T){return function(U){if(U.keyCode===27){P(T);
D(document).unbind("keydown.ual.dialog")
}}
}function H(U,V,T){return function(){if(V(U)!==false){T(U);
P(U)
}}
}function J(V,W){var U=D("> div[panel]",W.div);
if(U.length>0){U.each(function(Y,Z){var X=V.addPanel(Z.title,null,Z.className,"menu-"+Z.id);
X.getCurrentPanel().body.append(U[Y])
})
}else{var T=V.addPanel(W.title);
T.getCurrentPanel().body.append(W.div)
}}function F(V){var U=D(" > div",V);
var T=[];
U.each(function(X){var W=D(this);
T[X]={title:W.attr("title")||null,className:W.attr("class"),div:W}
});
return T
}})(jQuery)
});
(function(A){AppLinks.Wizard={initAuthenticationUI:function(D){var H=A(D);
var F=H.find(".create-reciprocal-link");
var C=H.find(".ual-arrow");
var L=H.find(".two-way-link-details");
var J=H.find(".reciprocal-link-description");
var B=H.find(".no-reciprocal-link-description");
F.click(function(){if(F.is(":checked")){C.removeClass("no-background");
L.show();
J.show();
B.hide()
}else{C.addClass("no-background");
L.hide();
J.hide();
B.show()
}});
var I=H.find(".same-user-radio-btn");
var K=H.find(".different-user-radio-btn");
var E=H.find(".different-userbase-image");
var G=H.find(".same-userbase-image");
I.click(function(){E.addClass("different-userbase-image-grey");
G.removeClass("same-userbase-image-grey")
});
K.click(function(){G.addClass("same-userbase-image-grey");
E.removeClass("different-userbase-image-grey")
})
},initNonUALUI:function(E){var C=A(E);
var B=C.find(".application-types");
for(var D=0;
D<nonAppLinksApplicationTypes.length;
D++){A('<option value="'+nonAppLinksApplicationTypes[D].typeId+'">'+nonAppLinksApplicationTypes[D].label+"</option>").appendTo(B)
}},fetchManifest:function(E,H,D,B){var I=H.find("#application-url");
if(I.val()==""){var C=H.find("#application-types");
if(C.val()==""){A('<div class="error applinks-error">'+AppLinks.I18n.getText("applinks.error.url.field.empty")+"</div>").insertAfter(I);
return false
}var G=function(J){E.enableSubmitBtn();
E.enablePreviousBtn();
E.cancel();
AppLinks.UI.listApplicationLinks(J.applicationLink.id,"new",J)
};
AppLinks.SPI.createStaticUrlAppLink(C.val(),G,null);
return true
}var F=AppLinks.UI.addProtocolToURL(I.val());
AppLinks.UI.showLoadingIcon(I);
var G=function(L){var K=L;
E.enableNextBtn();
H.find(".loading").remove();
H.find(".reciprocal-rpc-url").val(A("#baseUrl").val());
if(typeof L.typeId!="undefined"){AppLinks.Wizard.handleUALManifest(K,H);
E.dialog.gotoPage(2);
H.find(".reciprocal-link-username").focus();
if(D){D(K)
}}else{if(L.code=="applinks.warning.unknown.host"&&!I.data("forceWhenHostIsOffline")){AppLinks.UI.displayValidationErrorMessages("manifest-validation-errors",H,L.warning);
I.data("forceWhenHostIsOffline","true");
var J=function(){A(I).removeData("forceWhenHostIsOffline");
A(I).unbind("change",J)
};
I.bind("change",J)
}else{if(K.code=="applinks.warning.unknown.host"){delete K.warning;
delete K.code
}AppLinks.Wizard.handleNonUALManifest(K,F,H);
E.dialog.gotoPage(1);
H.find(".application-name").focus();
if(B){B(K)
}}}};
E.disableNextBtn();
AppLinks.SPI.tryToFetchManifest(F,G,AppLinks.UI.displayValidationError("manifest-validation-errors",H,function(){E.enableNextBtn()
}));
return F
},handleUALManifest:function(E,D){var B=A(D);
B.find(".remote-app-image").removeClass(function(G,I){var H=I.split(" ");
var F="";
A.each(H,function(J,K){if(K.indexOf("application-type-image-")!=-1){F=K
}});
return F
});
B.find(".remote-app-image").addClass("application-type-image-"+E.typeId);
B.find(".link-to-app-type").html(AppLinks.I18n.getText("applinks.create.title.link.to",AppLinks.I18n.getApplicationTypeName(E.typeId)));
B.find(".remote-app-name").html(AppLinks.UI.shortenString(E.name,20));
B.find(".create-reciprocal-link").attr("checked",true);
B.find("#reciprocal-link-back-to-server").html(AppLinks.I18n.getText("applinks.create.link.back.to.server",E.name));
var C=["administrator",E.name,'<a target="_blank" href="'+AppLinks.Docs.getDocHref("applinks.docs.adding.application.link")+'">',"</a>"];
if(E.typeId=="jira"||E.typeId=="confluence"){C[0]="system administrator"
}B.find(".reciprocal-link-description").html(AppLinks.I18n.getText("applinks.create.two.way.link",C));
B.find(".no-reciprocal-link-description").hide();
B.find(".no-reciprocal-link-description").html(AppLinks.I18n.getText("applinks.create.two.way.no.link",E.name));
B.find(".reciprocal-link-username").val("");
B.find(".reciprocal-link-password").val("");
B.find(".ual-arrow").removeClass("no-background");
B.find(".two-way-link-details").show();
B.find(".reciprocal-link-description").show();
B.find(".no-reciprocal-link-description").hide()
},handleNonUALManifest:function(D,E,C){var B=A(C);
B.find(".application-name").val("");
B.find(".application-types option:first-child").attr("selected","selected");
B.find(".non-ual-application-url").text(E);
if(D.warning){B.find(".create-non-ual-warning").show();
B.find(".create-non-ual-warning").html(D.warning)
}else{B.find(".create-non-ual-warning").hide()
}},checkReciprocalLinkForm:function(C,D,G,J,F){var H=A(C);
if(H.find(".create-reciprocal-link").is(":checked")){var K=A.trim(H.find(".reciprocal-rpc-url").val());
if(K==""){A("<div class='error applinks-error'>"+AppLinks.I18n.getText("applinks.error.url.field.empty")+"</div>").insertAfter(H.find(".reciprocal-rpc-url"));
if(F){F()
}return 
}var E=H.find(".reciprocal-link-username");
var B=H.find(".reciprocal-link-password");
if(E.val()==""){A('<div class="error applinks-error">'+AppLinks.I18n.getText("applinks.error.username.empty")+"</div>").insertAfter(E);
if(F){F()
}return false
}var I=function(L){H.find(".same-user-description").find("input").attr("checked",true);
H.find(".trust-radio-btn").attr("checked",true);
H.find(".same-user-radio-btn").click();
G(L)
};
K=AppLinks.UI.addProtocolToURL(K);
AppLinks.SPI.verifyTwoWayLinkDetails(J,K,E.val(),B.val(),I,AppLinks.UI.displayValidationError("two-way-link-errors",C,F));
return false
}else{D();
return false
}}}
})(AJS.$);
/**
 * Initialises anything requiring OAuth authentication. Requires the following elements:
 * <div class="issue-link-applinks-authentication-message"></div>
 */
var IssueLinkAppLinks = IssueLinkAppLinks || (function($) {
    function createHelper(servers, context, settings) {
        var helper = {};
        var selectedServer = null;

        function selectServer(appId) {
            selectedServer = getServer(servers, appId);

            var authenticationRequired = selectedServer && selectedServer.requireCredentials;
            doAuthenticationRequired(authenticationRequired, context);

            return {"authenticationRequired": authenticationRequired};
        }

        function setAuthenticationRequired(appId, authenticationRequired) {
            var server = getServer(servers, appId);
            if (server) {
                server.requireCredentials = authenticationRequired;

                // Refresh the authenication message if we have updated the selected server
                if (selectedServer && selectedServer.id === appId) {
                    doAuthenticationRequired(authenticationRequired, context);
                }
            }
        }

        function doAuthenticationRequired(required, context) {
            $(".issue-link-applinks-authentication-message", context).empty();
            if (required) {
                createAuthRequiredBanner($(".issue-link-applinks-authentication-message", context), context);
                $(".issue-link-oauth-toggle").hide();
                $(".buttons-container input[type=submit]", context).attr("disabled", "disabled")
            } else {
                $(".issue-link-oauth-toggle").show();
                $(".buttons-container input[type=submit]", context).removeAttr("disabled");
            }
        }

        function createAuthRequiredBanner($container, context) {
            var oauthCallbacks = {
                onSuccess: function () {
                    selectedServer.requireCredentials = false;
                    doAuthenticationRequired(false, context);
                    if (settings.onAuthenticationSuccessCallback) {
                        settings.onAuthenticationSuccessCallback(context, selectedServer.id, helper);
                    }
                },
                onFailure: function () {
                    if (settings.onAuthenticationFailedCallback) {
                        settings.onAuthenticationFailedCallback(context, selectedServer.id, helper);
                    }
                }
            };

            var encodedServerName = AJS.escapeHtml(selectedServer.name);
            if (selectedServer.authUrl) {
                var $banner = $('<div class="aui-message warning closeable shadowed applinks-auth-request"><p><span class="aui-icon icon-applinks-key"></span></p></div>');
                $banner.append(AJS.format("Authorization required to create issue link. Please \u003ca href=\"{0}\" class=\"applink-authenticate\">authenticate\u003c\/a> with \u003ca href=\"{1}\">{2}\u003c\/a>.", selectedServer.authUrl, selectedServer.url, encodedServerName));
                $("a", $banner).addClass("applink-authenticate");
                $('.applink-authenticate', $banner).click(function (e) {
                    authenticateRemoteCredentials(selectedServer.authUrl, oauthCallbacks.onSuccess, oauthCallbacks.onFailure);
                    e.preventDefault();
                });
                $container.append($banner);
            } else {
                var warningMessage = AJS.format("Unable to create a link to \u003ca href=\"{0}\">{1}\u003c\/a> as the application does not have any authentication configured.", selectedServer.url, encodedServerName);
                AJS.messages.warning($container, {body: warningMessage});
            }
        }

        function createOAuthCallback() {
            if (!AppLinks.OAuthCallback && typeof(oauthCallback) === "undefined") {
                AppLinks.OAuthCallback = function() {

                };

                AppLinks.OAuthCallback.prototype.success = function() {
                    this.aouthWindow.close();
                    this.onSuccess();
                    delete oauthCallback;
                    delete AppLinks.OAuthCallback;
                };

                AppLinks.OAuthCallback.prototype.failure = function() {
                    this.aouthWindow.close();
                    this.onFailure();
                    delete oauthCallback;
                    delete AppLinks.OAuthCallback;
                };

                AppLinks.OAuthCallback.prototype.show = function(url, onSuccess, onFailure) {
                    this.onSuccess = onSuccess;
                    this.onFailure = onFailure;
                    this.aouthWindow = window.open(url, "com_atlassian_applinks_authentication");
                };
                // set the global oAuthCallback variable required by AppLinks
                oauthCallback = new AppLinks.OAuthCallback();
            }
        }

        function authenticateRemoteCredentials(url, onSuccess, onFailure) {
            createOAuthCallback();

            $('.applinks-error').remove();
            oauthCallback.show(url, onSuccess, onFailure);
        }

        return $.extend(helper, {
            selectServer: selectServer,
            setAuthenticationRequired: setAuthenticationRequired
        });
    }

    function getServer(servers, appId) {
        var i;
        if (servers.length) {
            for (i = 0; i < servers.length; i++) {
                if (servers[i].id === appId) {
                    return servers[i];
                }
            }
        }
        return null;
    }

    /**
     * Called only once during the initialisation to retrieve the list of servers.
     *
     * @param context the context to perform the initialisation. This is either the inline dialog or the entire document
     *                body.
     */
    function initApplinkServers(settings, context, deferred) {
        var currentAppId = settings.getCurrentAppId(context);
        var applicationType = $(".issue-link-applinks-application-type", context).val();
        $.get(AJS.contextPath() + '/rest/issueLinkAppLink/1/appLink/info?type=' + applicationType, function (servers) {
            var helper = createHelper(servers, context, settings);
            var currentRequiresCredentials;
            if (servers && servers.length) {
                var currentServer = getServer(servers, currentAppId);
                if (currentServer) {
                    currentRequiresCredentials = $(".issue-link-applinks-authentication-message", context).hasClass("required");
                    if (currentRequiresCredentials) {
                        currentServer.requireCredentials = true;
                    }
                    helper.selectServer(currentAppId);
                }
                deferred.resolve(context, helper);
            } else {
                deferred.reject(context);
            }
        });
    }

    /**
     * @return jQuery.Promise<String>
     */
    function init(settings, context) {
        var deferred = $.Deferred();

        var isIssueLinkAppLinkContent = $(".issue-link-applinks-authentication-message", context).length !== 0;
        if (isIssueLinkAppLinkContent && settings.shouldExecute(context)) {
            initApplinkServers(settings, context, deferred);
        }

        return deferred.promise();
    }

    return {
        init: init
    };
})(AJS.$);

/**
 * Initialises OAuth authentication for JIRA Application Links. Requires the following elements:
 * <div class="issue-link-applinks-authentication-message"></div>
 */
(function ($) {

    var settings = {
        getCurrentAppId: function (context) {
            return $("#jira-app-link", context).val();
        },
        shouldExecute: function (context) {
            return $("#jira-app-link", context).length !== 0;
        }
    };

    var updateIssuePicker = function($select, appId) {
        if ($select.length) {
            // Update the appId param
            $select.attr("data-ajax-options.data.app-id", appId);
            if (appId && appId !== "") {
                // Set the url for remote JIRA queries
                $select.attr("data-ajax-options.url", contextPath + "/rest/remoteJiraIssueLink/1/remoteJira/picker");
            }
            else {
                // Set the url for local JIRA queries
                $select.attr("data-ajax-options.url", contextPath + "/rest/api/1.0/issues/picker");
            }
        
            $select.trigger("updateOptions");

            // Now that we have changed server, our current issue selection is no longer relevant
            $select.trigger("clearSelection");
        }
    };

    var updateCreateReciprocalCheckbox = function(appId, context) {
        var $reciprocalCheckbox = $("#create-reciprocal", context);
        if ($reciprocalCheckbox.length) {
            if (appId && appId !== "") {
                // Default to no reciprocal for remote issue links
                $reciprocalCheckbox.removeAttr("checked");
                $reciprocalCheckbox.removeAttr("disabled");
                $("#create-reciprocal-fieldset", context).removeClass("disabled");
            } else {
                // Set to checked for local links, as they always create a reciprocal link
                $reciprocalCheckbox.attr("checked", "checked");
                $reciprocalCheckbox.attr("disabled", "disabled");
                $("#create-reciprocal-fieldset", context).addClass("disabled");
            }
        }
    };

    JIRA.bind(JIRA.Events.NEW_PAGE_ADDED, function (e, context) {

        var $select = $("#jira-issue-keys", context);
        if ($select.length) {
            var appId = $("#jira-app-link", context).val();
            updateIssuePicker($select, appId);
            updateCreateReciprocalCheckbox(appId, context);
        }

        IssueLinkAppLinks.init(settings, context).done(function (context, helper) {
            $("#jira-app-link", context).change(function () {
                var appId = $(this).val();
                helper.selectServer(appId);
                updateIssuePicker($select, appId);
                updateCreateReciprocalCheckbox(appId, context);
            });
        });
    });
})(AJS.$);

/**
 * Instantiates jql autocomplete functionality on request instead of on page load.
 */
var IssueLinkJQLAutoComplete = IssueLinkJQLAutoComplete || (function($) {

    /**
     * Initializes an auto complete field
     */
    function initialize(options) {

        var fieldID = options.fieldID;
        var errorID = options.errorID;
        var autoCompleteUrl = options.autoCompleteUrl;
        var autoCompleteData = options.autoCompleteData;
        var formSubmitFunction = options.formSubmitFunction;

        var $field = $('#'+fieldID);
        var hasFocus = $field.length > 0 && $field[0] == document.activeElement;

        var jqlFieldNames = autoCompleteData.visibleFieldNames || [];
        var jqlFunctionNames = autoCompleteData.visibleFunctionNames || [];
        var jqlReservedWords = autoCompleteData.jqlReservedWords || [];

        var jqlAutoComplete = JIRA.JQLAutoComplete({
            fieldID: fieldID,
            parser: JIRA.JQLAutoComplete.MyParser(jqlReservedWords),
            queryDelay: .65,
            jqlFieldNames: jqlFieldNames,
            jqlFunctionNames: jqlFunctionNames,
            minQueryLength: 0,
            allowArrowCarousel: true,
            autoSelectFirst: false,
            errorID: errorID,
            autoCompleteUrl: autoCompleteUrl
        });

        $field.unbind("keypress", submitOnEnter);

        if (formSubmitFunction) {
            $field.keypress(function (e) {
                if (jqlAutoComplete.dropdownController === null || !jqlAutoComplete.dropdownController.displayed || jqlAutoComplete.selectedIndex < 0) {
                    if (e.keyCode == 13 && !e.ctrlKey && ! e.shiftKey)
                    {
                        formSubmitFunction();
                        return false;
                    }
                    else
                    {
                        return true;
                    }
                }
            });
        }

        jqlAutoComplete.buildResponseContainer();
        jqlAutoComplete.parse($field.text());
        jqlAutoComplete.updateColumnLineCount();

        $field.click(function(){
            jqlAutoComplete.dropdownController.hideDropdown();
        });

        if (hasFocus) {
            $field.select();
        }
    }

    return {
        initialize: initialize
    };
})(AJS.$);

AJS.$(function ($) {
    var remoteJiraSearchDialog =  new JIRA.FormDialog({
        id: "remote-jira-search-dialog",
        trigger: "#link-jira-issue .remote-jira-search-trigger",
        widthClass: "large",
        height: "565px",
        content: function (render) {
            var content = JIRA.Templates.RemoteJiraIssueSearch.dialog();
            var $dialogWrapper = $(content);
            initSearchDialog($dialogWrapper);
            render($dialogWrapper);
        },
        submitHandler: function(e, callback){
            e.preventDefault();
            $("#search-panel-button").click().removeAttr("disabled");
            callback();
        }
    });

    function initSearchDialog($dialog) {
        // Gather the JQL auto complete data
        var appId = $("#jira-app-link").val();
        var autoCompletePromise = getJqlAutoCompleteData(appId);

        // Bind the simple search button
        $("#simple-search-panel-button", $dialog).click(function () {
            $("#search-results-table", $dialog).empty();
            var searchText = $("#link-search-text", $dialog).val();
            searchText = $.trim(searchText);
            if (searchText) {
                doSimpleSearch(searchText, $dialog);
            } else {
                AJS.messages.info("#search-results-table", {
                    body: "Please enter search value.",
                    closeable: false
                });
            }

            return false;
        });

        // Bind the advanced search button
        $("#advanced-search-panel-button", $dialog).click(function() {
            advancedSearchButtonClick($dialog);
            return false;
        });

        $("#simple-search-toggle", $dialog).click(function() {
            $("#remote-jira-simple-search-form", $dialog).show();
            $("#remote-jira-advanced-search-form", $dialog).hide();
            return false;
        });

        $("#advanced-search-toggle", $dialog).click(function() {
            $("#remote-jira-advanced-search-form", $dialog).show();
            $("#remote-jira-simple-search-form", $dialog).hide();

            // Initialise the JQL auto complete once we have the data
            // Ensure that we only initialise it once only
            var $jqlSearchText = $("#jql-search-text");
            if (!$jqlSearchText.attr("jql-initialized")) {
                setAutoCompleteLoadingIconVisible(true, $dialog);
                autoCompletePromise.done(function (smartAjaxResult) {
                    if (smartAjaxResult.successful) {
                        // Enable JQL AutoComplete
                        IssueLinkJQLAutoComplete.initialize({
                            fieldID: "jql-search-text",
                            errorID: "jql-search-error",
                            autoCompleteUrl: getAutoCompleteUrl(appId),
                            autoCompleteData: smartAjaxResult.data,
                            formSubmitFunction: function() {
                                advancedSearchButtonClick($dialog);
                            }
                        });
                    }
                    else {
                        setJQLErrorVisible(false, $dialog);
                        setAutoCompleteFailedIconVisible(true, $dialog);
                    }
                    setAutoCompleteLoadingIconVisible(false, $dialog);
                    $jqlSearchText.attr("jql-initialized", 1);
                });
            }
            $jqlSearchText.focus();

            return false;
        });
    }

    function getAutoCompleteUrl(appId) {
        if (appId && appId !== "") {
            // Remote JIRA instance
            return contextPath + "/rest/remoteJiraIssueLink/1/remoteJira/autocomplete?appId=" + appId;
        }
        // Local JIRA instance - will use the default URL in JQLAutoComplete
        return "";
    }

    function advancedSearchButtonClick($dialog) {
        $("#search-results-table", $dialog).empty();
        var searchText = $("#jql-search-text", $dialog).val();
        searchText = $.trim(searchText);
        if (searchText) {
            doAdvancedSearch(searchText, $dialog);
        } else {
            AJS.messages.info("#search-results-table", {
                body: "Please enter search value.",
                closeable: false
            });
        }
    }

    function setLoadingIconVisible(visible, $context) {
        $("#link-search-loading", $context).toggleClass("hidden", !visible);
    }

    function setAutoCompleteLoadingIconVisible(visible, $context) {
        $("#autocomplete-loading", $context).toggleClass("hidden", !visible);
    }

    function setAutoCompleteFailedIconVisible(visible, $context) {
        $("#autocomplete-failed", $context).toggleClass("hidden", !visible);
    }

    function setJQLErrorVisible(visible, $context) {
        $("#jql-search-error", $context).toggleClass("hidden", !visible);
    }

    function doSimpleSearch(searchText, $context) {
        setLoadingIconVisible(true, $context);
        var appId = $("#jira-app-link").val();
        var issueKeyJql = 'key = "' + searchText + '"';
        var projectJql = 'project = "' + searchText + '"';
        var plainTextJql = 'summary ~ "' + searchText + '" OR description ~ "' + searchText + '" OR comment ~ "' + searchText + '"';

        // First, check if search text is an issue key
        // We need to do this because the search will fail if it is not an issue key,
        // even if it is OR'd with a condition that returns results!
        jqlSearch(issueKeyJql, appId).done(function (smartAjaxResult) {
            if (smartAjaxResult.successful && smartAjaxResult.data.issues.length > 0) {
                setLoadingIconVisible(false, $context);
                showResults(smartAjaxResult, $context);
            } else {

                // Then check if search text is a project
                jqlSearch(projectJql, appId).done(function (smartAjaxResult) {
                    if (smartAjaxResult.successful && smartAjaxResult.data.issues.length > 0) {
                        // The search text is a project name or key
                        setLoadingIconVisible(false, $context);
                        showResults(smartAjaxResult, $context);
                    } else {

                        // Finally, a plain text search
                        jqlSearch(plainTextJql, appId).done(function (smartAjaxResult) {
                            setLoadingIconVisible(false, $context);
                            if (smartAjaxResult.successful) {
                                showResults(smartAjaxResult, $context);
                            } else {
                                showResultsError(smartAjaxResult);
                            }
                        });
                    }
                });
            }
        });
    }

    function doAdvancedSearch(jql, $context) {
        setLoadingIconVisible(true, $context);
        var appId = $("#jira-app-link").val();
        jqlSearch(jql, appId).done(function (smartAjaxResult) {
            setLoadingIconVisible(false, $context);
            if (smartAjaxResult.successful) {
                showResults(smartAjaxResult, $context);
            } else {
                if (smartAjaxResult.status === 400) {
                    AJS.messages.warning("#search-results-table", {
                        body: "Invalid JQL query.",
                        closeable: false
                    });
                } else {
                    showResultsError(smartAjaxResult);
                }
            }
        });
    }

    function jqlSearch(jql, appId) {
        var deferred = $.Deferred();
        var url;
        if (appId && appId !== "") {
            // Remote JIRA instance
            url = contextPath + "/rest/remoteJiraIssueLink/1/remoteJira/search?jql=" + jql + "&appId=" + appId + "&maxResults=10";
        } else {
            // Local JIRA instance
            // Filter out current issue from results
            var currentIssueKey = $("#current-issue-key").val();
            jql = "(" + jql + ") and key != " + currentIssueKey;
            url = contextPath + "/rest/api/2/search?jql=" + jql + "&maxResults=10";
        }
        JIRA.SmartAjax.makeRequest({
            url: url,
            complete: function (xhr, textStatus, smartAjaxResult) {
                deferred.resolve(smartAjaxResult);
            }
        });
        return deferred.promise();
    }

    function getJqlAutoCompleteData(appId) {
        var deferred = $.Deferred();
        var remote;
        var url;
        if (appId && appId !== "") {
            // Remote JIRA instance
            url = contextPath + "/rest/remoteJiraIssueLink/1/remoteJira/autocompletedata?appId=" + appId;
            remote = true;
        } else {
            // Local JIRA instance
            url = contextPath + "/rest/api/2/jql/autocompletedata";
            remote = false;
        }
        JIRA.SmartAjax.makeRequest({
            url: url,
            complete: function (xhr, textStatus, smartAjaxResult) {
                if (!smartAjaxResult.successful && remote) {
                    // If a remote JIRA request fails, it probably doesn't have the autocompletedata REST endpoint (added in JIRA v5.1)
                    // Get the auto complete data by parsing the issue navigator page
                    JIRA.SmartAjax.makeRequest({
                        url: contextPath + "/rest/remoteJiraIssueLink/1/remoteJira/autocompletedata/legacy?appId=" + appId,
                        complete: function (xhr, textStatus, smartAjaxResult) {
                            deferred.resolve(smartAjaxResult);
                        }
                    });
                } else {
                    deferred.resolve(smartAjaxResult);
                }
            }
        });
        return deferred.promise();
    }

    function showResults(smartAjaxResult, $context) {
        var resultHtml = JIRA.Templates.RemoteJiraIssueSearch.resultsTable({result: smartAjaxResult.data});
        $("#search-results-table", $context).html(resultHtml);

        $("#remote-jira-searchresult tbody tr", $context).click(function () {
            var issueKey = $(this).children().first().data("key");
            $("#jira-issue-keys").trigger("selectOption", [{
                value: issueKey
            }]);

            // Clear all error messages on the parent dialog, as we now have a newly selected issue
            $("#link-issue-dialog .error").hide();

            remoteJiraSearchDialog.hide();
            $("#link-issue-dialog").show();
            //$("#confluence-page-url").focus().select();
        });
    }

    function showResultsError(smartAjaxResult) {
        AJS.messages.error("#search-results-table", {
            body: JIRA.SmartAjax.buildSimpleErrorContent(smartAjaxResult),
            closeable: false
        });
    }
});

// This file was automatically generated from linkjiraissue-search.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.RemoteJiraIssueSearch == 'undefined') { JIRA.Templates.RemoteJiraIssueSearch = {}; }


JIRA.Templates.RemoteJiraIssueSearch.dialog = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<h2>', soy.$$escapeHtml("Find JIRA issues"), '</h2><div class="aui-group"><form class="aui search-form" id="remote-jira-simple-search-form" action="#" method="post"><fieldset><label for="link-search-text">', soy.$$escapeHtml("Search"), ':</label><input id="link-search-text" type="text" tabindex="0" class="text" size="50"><span class="buttons"><input type="submit" tabindex="0" class="button" id="simple-search-panel-button" value="', soy.$$escapeHtml("Search"), '"></span><a id="advanced-search-toggle" href="" title="', soy.$$escapeHtml("Perform a JQL search"), '">', soy.$$escapeHtml("Advanced Search"), '</a><span id="link-search-loading" class="icon loading throbber hidden"/></fieldset></form><form class="aui search-form" id="remote-jira-advanced-search-form" action="#" method="post"><fieldset><label for="jql-search-text"><span id="jql-search-error" class="icon jqlgood" />', soy.$$escapeHtml("JQL Search"), '<span id="autocomplete-loading" class="hidden"><span class="icon loading throbber"/>', soy.$$escapeHtml("Loading auto-complete"), '</span><span id="autocomplete-failed" class="hidden">', soy.$$escapeHtml("(auto-complete unavailable)"), '</span></label><div class="atlassian-autocomplete"><textarea id="jql-search-text" tabindex="0" /></div><span class="buttons"><input type="submit" tabindex="0" class="button" id="advanced-search-panel-button" value="', soy.$$escapeHtml("Search"), '"></span><a id="simple-search-toggle" href="" title="', soy.$$escapeHtml("Perform a plain text search"), '">', soy.$$escapeHtml("Simple Search"), '</a><span id="link-search-loading" class="icon loading throbber hidden"/></fieldset></form><div class="message-panel hidden"></div><div id="search-results-table" class="data-table"></div></div><div class="buttons-container form-footer"><div class="buttons"><a accesskey="`" class="cancel" href="#" id="remote-jira-link-cancel" title="', soy.$$escapeHtml("Press Esc to close"), '">', soy.$$escapeHtml("Close"), '</a></div></div>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.RemoteJiraIssueSearch.resultsTable = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  if (opt_data.result.issues.length > 0) {
    output.append('<table id="remote-jira-searchresult" class="aui"><thead><tr><th width="40px">', soy.$$escapeHtml("Type"), '</th><th width="50px">', soy.$$escapeHtml("Key"), '</th><th width="600px">', soy.$$escapeHtml("Summary"), '</th><th width="100px">', soy.$$escapeHtml("Status"), '</th></tr></thead><tbody>');
    var issueList42 = opt_data.result.issues;
    var issueListLen42 = issueList42.length;
    for (var issueIndex42 = 0; issueIndex42 < issueListLen42; issueIndex42++) {
      var issueData42 = issueList42[issueIndex42];
      output.append('<tr title="', soy.$$escapeHtml(issueData42.key), '"><td class="type" data-key="', soy.$$escapeHtml(issueData42.key), '">');
      JIRA.Templates.RemoteJiraIssueSearch.issueType({issueType: issueData42.fields.issuetype}, output);
      output.append('</td><td class="key">', soy.$$escapeHtml(issueData42.key), '</td><td class="summary">', soy.$$escapeHtml(issueData42.fields.summary), '</td><td class="status">');
      JIRA.Templates.RemoteJiraIssueSearch.status({status: issueData42.fields.status}, output);
      output.append('</td></tr>');
    }
    output.append('</tbody></table>');
  } else {
    output.append('<div class="aui-message info"><span class="aui-icon icon-info"></span><p>', soy.$$escapeHtml("Search returned no results."), '</p></div>');
  }
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.RemoteJiraIssueSearch.issueType = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<img src="', soy.$$escapeHtml(opt_data.issueType.iconUrl), '" alt="', soy.$$escapeHtml(opt_data.issueType.name), '" title="', soy.$$escapeHtml(opt_data.issueType.name), ' - ', soy.$$escapeHtml(opt_data.issueType.description), '"/>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.RemoteJiraIssueSearch.status = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<img src="', soy.$$escapeHtml(opt_data.status.iconUrl), '" alt="" title=""/> ', soy.$$escapeHtml(opt_data.status.name));
  return opt_sb ? '' : output.toString();
};

(function(){function a(j,f){var g=JIRA.parseOptionsFromFieldset(j),e=AJS.$("#"+g.id,f),i=g.issueId,h={};if(g.customFieldId){h.customFieldId=parseInt(g.customFieldId)}else{if(/customfield_\d/.test(g.id)){h.customFieldId=parseInt(g.id.replace("customfield_",""),10)}}new JIRA.LabelPicker({element:e,ajaxOptions:{url:contextPath+"/rest/private-label/1.0/private-labels"+(i?"/"+i:"")+"/suggest",data:h}})}function b(e){var f=AJS.$(e),g;if(f.is(d)){return f}else{return f.find(d)}}var d="fieldset.labelpicker-params";function c(f,e){e=e||".aui-field-private-labelpicker";AJS.$(e,f).each(function(){var g=b(this);if(g.length>0){a(g,f)}})}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(h,f,g){c(f)})})();
(function(n,D,P,k,K,h){var B=this;
var N=Math.floor(Math.random()*10000);
var Q=Function.prototype;
var q=/^((http.?:)\/\/([^:\/\s]+)(:\d+)*)/;
var r=/[\-\w]+\/\.\.\//;
var f=/([^:])\/\//g;
var i="";
var O={};
var m=n.easyXDM;
var u="easyXDM_";
var e;
var Y=false;
var I;
var H;
function c(x,z){var y=typeof x[z];
return y=="function"||(!!(y=="object"&&x[z]))||y=="unknown"
}function U(x,y){return !!(typeof (x[y])=="object"&&x[y])
}function R(x){return Object.prototype.toString.call(x)==="[object Array]"
}function C(){try{var x=new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
I=Array.prototype.slice.call(x.GetVariable("$version").match(/(\d+),(\d+),(\d+),(\d+)/),1);
H=parseInt(I[0],10)>9&&parseInt(I[1],10)>0;
x=null;
return true
}catch(y){return false
}}var V,X;
if(c(n,"addEventListener")){V=function(z,x,y){z.addEventListener(x,y,false)
};
X=function(z,x,y){z.removeEventListener(x,y,false)
}
}else{if(c(n,"attachEvent")){V=function(x,z,y){x.attachEvent("on"+z,y)
};
X=function(x,z,y){x.detachEvent("on"+z,y)
}
}else{throw new Error("Browser not supported")
}}var w=false,j=[],l;
if("readyState" in D){l=D.readyState;
w=l=="complete"||(~navigator.userAgent.indexOf("AppleWebKit/")&&(l=="loaded"||l=="interactive"))
}else{w=!!D.body
}function S(){if(w){return 
}w=true;
for(var x=0;
x<j.length;
x++){j[x]()
}j.length=0
}if(!w){if(c(n,"addEventListener")){V(D,"DOMContentLoaded",S)
}else{V(D,"readystatechange",function(){if(D.readyState=="complete"){S()
}});
if(D.documentElement.doScroll&&n===top){var G=function(){if(w){return 
}try{D.documentElement.doScroll("left")
}catch(x){k(G,1);
return 
}S()
};
G()
}}V(n,"load",S)
}function g(y,x){if(w){y.call(x);
return 
}j.push(function(){y.call(x)
})
}function M(){var z=parent;
if(i!==""){for(var x=0,y=i.split(".");
x<y.length;
x++){z=z[y[x]]
}}return z.easyXDM
}function E(x){n.easyXDM=m;
i=x;
if(i){u="easyXDM_"+i.replace(".","_")+"_"
}return O
}function Z(x){return x.match(q)[3]
}function F(x){return x.match(q)[4]||""
}function J(z){var x=z.toLowerCase().match(q);
var AA=x[2],AB=x[3],y=x[4]||"";
if((AA=="http:"&&y==":80")||(AA=="https:"&&y==":443")){y=""
}return AA+"//"+AB+y
}function b(x){x=x.replace(f,"$1/");
if(!x.match(/^(http||https):\/\//)){var y=(x.substring(0,1)==="/")?"":P.pathname;
if(y.substring(y.length-1)!=="/"){y=y.substring(0,y.lastIndexOf("/")+1)
}x=P.protocol+"//"+P.host+y+x
}while(r.test(x)){x=x.replace(r,"")
}return x
}function p(x,AA){var AC="",z=x.indexOf("#");
if(z!==-1){AC=x.substring(z);
x=x.substring(0,z)
}var AB=[];
for(var y in AA){if(AA.hasOwnProperty(y)){AB.push(y+"="+h(AA[y]))
}}return x+(Y?"#":(x.indexOf("?")==-1?"?":"&"))+AB.join("&")+AC
}var s=(function(x){x=x.substring(1).split("&");
var z={},AA,y=x.length;
while(y--){AA=x[y].split("=");
z[AA[0]]=K(AA[1])
}return z
}(/xdm_e=/.test(P.search)?P.search:P.hash));
function T(x){return typeof x==="undefined"
}var o=function(){var y={};
var z={a:[1,2,3]},x='{"a":[1,2,3]}';
if(typeof JSON!="undefined"&&typeof JSON.stringify==="function"&&JSON.stringify(z).replace((/\s/g),"")===x){return JSON
}if(Object.toJSON){if(Object.toJSON(z).replace((/\s/g),"")===x){y.stringify=Object.toJSON
}}if(typeof String.prototype.evalJSON==="function"){z=x.evalJSON();
if(z.a&&z.a.length===3&&z.a[2]===3){y.parse=function(AA){return AA.evalJSON()
}
}}if(y.stringify&&y.parse){o=function(){return y
};
return y
}return null
};
function t(x,y,z){var AB;
for(var AA in y){if(y.hasOwnProperty(AA)){if(AA in x){AB=y[AA];
if(typeof AB==="object"){t(x[AA],AB,z)
}else{if(!z){x[AA]=y[AA]
}}}else{x[AA]=y[AA]
}}}return x
}function A(){var y=D.body.appendChild(D.createElement("form")),x=y.appendChild(D.createElement("input"));
x.name=u+"TEST"+N;
e=x!==y.elements[x.name];
D.body.removeChild(y)
}function a(x){if(T(e)){A()
}var z;
if(e){z=D.createElement('<iframe name="'+x.props.name+'"/>')
}else{z=D.createElement("IFRAME");
z.name=x.props.name
}z.id=z.name=x.props.name;
delete x.props.name;
if(x.onLoad){V(z,"load",x.onLoad)
}if(typeof x.container=="string"){x.container=D.getElementById(x.container)
}if(!x.container){t(z.style,{position:"absolute",top:"-2000px"});
x.container=D.body
}var y=x.props.src;
delete x.props.src;
t(z,x.props);
z.border=z.frameBorder=0;
z.allowTransparency=true;
x.container.appendChild(z);
z.src=y;
x.props.src=y;
return z
}function v(AA,z){if(typeof AA=="string"){AA=[AA]
}var y,x=AA.length;
while(x--){y=AA[x];
y=new RegExp(y.substr(0,1)=="^"?y:("^"+y.replace(/(\*)/g,".$1").replace(/\?/g,".")+"$"));
if(y.test(z)){return true
}}return false
}function L(z){var AE=z.protocol,y;
z.isHost=z.isHost||T(s.xdm_p);
Y=z.hash||false;
if(!z.props){z.props={}
}if(!z.isHost){z.channel=s.xdm_c;
z.secret=s.xdm_s;
z.remote=s.xdm_e;
AE=s.xdm_p;
if(z.acl&&!v(z.acl,z.remote)){throw new Error("Access denied for "+z.remote)
}}else{z.remote=b(z.remote);
z.channel=z.channel||"default"+N++;
z.secret=Math.random().toString(16).substring(2);
if(T(AE)){if(J(P.href)==J(z.remote)){AE="4"
}else{if(c(n,"postMessage")||c(D,"postMessage")){AE="1"
}else{if(z.swf&&c(n,"ActiveXObject")&&C()){AE="6"
}else{if(navigator.product==="Gecko"&&"frameElement" in n&&navigator.userAgent.indexOf("WebKit")==-1){AE="5"
}else{if(z.remoteHelper){z.remoteHelper=b(z.remoteHelper);
AE="2"
}else{AE="0"
}}}}}}}z.protocol=AE;
switch(AE){case"0":t(z,{interval:100,delay:2000,useResize:true,useParent:false,usePolling:false},true);
if(z.isHost){if(!z.local){var AC=P.protocol+"//"+P.host,x=D.body.getElementsByTagName("img"),AD;
var AA=x.length;
while(AA--){AD=x[AA];
if(AD.src.substring(0,AC.length)===AC){z.local=AD.src;
break
}}if(!z.local){z.local=n
}}var AB={xdm_c:z.channel,xdm_p:0};
if(z.local===n){z.usePolling=true;
z.useParent=true;
z.local=P.protocol+"//"+P.host+P.pathname+P.search;
AB.xdm_e=z.local;
AB.xdm_pa=1
}else{AB.xdm_e=b(z.local)
}if(z.container){z.useResize=false;
AB.xdm_po=1
}z.remote=p(z.remote,AB)
}else{t(z,{channel:s.xdm_c,remote:s.xdm_e,useParent:!T(s.xdm_pa),usePolling:!T(s.xdm_po),useResize:z.useParent?false:z.useResize})
}y=[new O.stack.HashTransport(z),new O.stack.ReliableBehavior({}),new O.stack.QueueBehavior({encode:true,maxLength:4000-z.remote.length}),new O.stack.VerifyBehavior({initiate:z.isHost})];
break;
case"1":y=[new O.stack.PostMessageTransport(z)];
break;
case"2":y=[new O.stack.NameTransport(z),new O.stack.QueueBehavior(),new O.stack.VerifyBehavior({initiate:z.isHost})];
break;
case"3":y=[new O.stack.NixTransport(z)];
break;
case"4":y=[new O.stack.SameOriginTransport(z)];
break;
case"5":y=[new O.stack.FrameElementTransport(z)];
break;
case"6":if(!I){C()
}y=[new O.stack.FlashTransport(z)];
break
}y.push(new O.stack.QueueBehavior({lazy:z.lazy,remove:true}));
return y
}function d(AA){var AB,z={incoming:function(AD,AC){this.up.incoming(AD,AC)
},outgoing:function(AC,AD){this.down.outgoing(AC,AD)
},callback:function(AC){this.up.callback(AC)
},init:function(){this.down.init()
},destroy:function(){this.down.destroy()
}};
for(var y=0,x=AA.length;
y<x;
y++){AB=AA[y];
t(AB,z,true);
if(y!==0){AB.down=AA[y-1]
}if(y!==x-1){AB.up=AA[y+1]
}}return AB
}function W(x){x.up.down=x.down;
x.down.up=x.up;
x.up=x.down=null
}t(O,{version:"2.4.15.118",query:s,stack:{},apply:t,getJSONObject:o,whenReady:g,noConflict:E});
O.DomHelper={on:V,un:X,requiresJSON:function(x){if(!U(n,"JSON")){D.write('<script type="text/javascript" src="'+x+'"><\/script>')
}}};
(function(){var x={};
O.Fn={set:function(y,z){x[y]=z
},get:function(z,y){var AA=x[z];
if(y){delete x[z]
}return AA
}}
}());
O.Socket=function(y){var x=d(L(y).concat([{incoming:function(AB,AA){y.onMessage(AB,AA)
},callback:function(AA){if(y.onReady){y.onReady(AA)
}}}])),z=J(y.remote);
this.origin=J(y.remote);
this.destroy=function(){x.destroy()
};
this.postMessage=function(AA){x.outgoing(AA,z)
};
x.init()
};
O.Rpc=function(z,y){if(y.local){for(var AB in y.local){if(y.local.hasOwnProperty(AB)){var AA=y.local[AB];
if(typeof AA==="function"){y.local[AB]={method:AA}
}}}}var x=d(L(z).concat([new O.stack.RpcBehavior(this,y),{callback:function(AC){if(z.onReady){z.onReady(AC)
}}}]));
this.origin=J(z.remote);
this.destroy=function(){x.destroy()
};
x.init()
};
O.stack.SameOriginTransport=function(y){var z,AB,AA,x;
return(z={outgoing:function(AD,AE,AC){AA(AD);
if(AC){AC()
}},destroy:function(){if(AB){AB.parentNode.removeChild(AB);
AB=null
}},onDOMReady:function(){x=J(y.remote);
if(y.isHost){t(y.props,{src:p(y.remote,{xdm_e:P.protocol+"//"+P.host+P.pathname,xdm_c:y.channel,xdm_p:4}),name:u+y.channel+"_provider"});
AB=a(y);
O.Fn.set(y.channel,function(AC){AA=AC;
k(function(){z.up.callback(true)
},0);
return function(AD){z.up.incoming(AD,x)
}
})
}else{AA=M().Fn.get(y.channel,true)(function(AC){z.up.incoming(AC,x)
});
k(function(){z.up.callback(true)
},0)
}},init:function(){g(z.onDOMReady,z)
}})
};
O.stack.FlashTransport=function(AA){var AC,x,AB,AD,y,AE;
function AF(AH,AG){k(function(){AC.up.incoming(AH,AD)
},0)
}function z(AH){var AG=AA.swf+"?host="+AA.isHost;
var AJ="easyXDM_swf_"+Math.floor(Math.random()*10000);
O.Fn.set("flash_loaded"+AH.replace(/[\-.]/g,"_"),function(){O.stack.FlashTransport[AH].swf=y=AE.firstChild;
var AK=O.stack.FlashTransport[AH].queue;
for(var AL=0;
AL<AK.length;
AL++){AK[AL]()
}AK.length=0
});
if(AA.swfContainer){AE=(typeof AA.swfContainer=="string")?D.getElementById(AA.swfContainer):AA.swfContainer
}else{AE=D.createElement("div");
t(AE.style,H&&AA.swfNoThrottle?{height:"20px",width:"20px",position:"fixed",right:0,top:0}:{height:"1px",width:"1px",position:"absolute",overflow:"hidden",right:0,top:0});
D.body.appendChild(AE)
}var AI="callback=flash_loaded"+AH.replace(/[\-.]/g,"_")+"&proto="+B.location.protocol+"&domain="+Z(B.location.href)+"&port="+F(B.location.href)+"&ns="+i;
AE.innerHTML="<object height='20' width='20' type='application/x-shockwave-flash' id='"+AJ+"' data='"+AG+"'><param name='allowScriptAccess' value='always'></param><param name='wmode' value='transparent'><param name='movie' value='"+AG+"'></param><param name='flashvars' value='"+AI+"'></param><embed type='application/x-shockwave-flash' FlashVars='"+AI+"' allowScriptAccess='always' wmode='transparent' src='"+AG+"' height='1' width='1'></embed></object>"
}return(AC={outgoing:function(AH,AI,AG){y.postMessage(AA.channel,AH.toString());
if(AG){AG()
}},destroy:function(){try{y.destroyChannel(AA.channel)
}catch(AG){}y=null;
if(x){x.parentNode.removeChild(x);
x=null
}},onDOMReady:function(){AD=AA.remote;
O.Fn.set("flash_"+AA.channel+"_init",function(){k(function(){AC.up.callback(true)
})
});
O.Fn.set("flash_"+AA.channel+"_onMessage",AF);
AA.swf=b(AA.swf);
var AH=Z(AA.swf);
var AG=function(){O.stack.FlashTransport[AH].init=true;
y=O.stack.FlashTransport[AH].swf;
y.createChannel(AA.channel,AA.secret,J(AA.remote),AA.isHost);
if(AA.isHost){if(H&&AA.swfNoThrottle){t(AA.props,{position:"fixed",right:0,top:0,height:"20px",width:"20px"})
}t(AA.props,{src:p(AA.remote,{xdm_e:J(P.href),xdm_c:AA.channel,xdm_p:6,xdm_s:AA.secret}),name:u+AA.channel+"_provider"});
x=a(AA)
}};
if(O.stack.FlashTransport[AH]&&O.stack.FlashTransport[AH].init){AG()
}else{if(!O.stack.FlashTransport[AH]){O.stack.FlashTransport[AH]={queue:[AG]};
z(AH)
}else{O.stack.FlashTransport[AH].queue.push(AG)
}}},init:function(){g(AC.onDOMReady,AC)
}})
};
O.stack.PostMessageTransport=function(AA){var AC,AD,y,z;
function x(AE){if(AE.origin){return J(AE.origin)
}if(AE.uri){return J(AE.uri)
}if(AE.domain){return P.protocol+"//"+AE.domain
}throw"Unable to retrieve the origin of the event"
}function AB(AF){var AE=x(AF);
if(AE==z&&AF.data.substring(0,AA.channel.length+1)==AA.channel+" "){AC.up.incoming(AF.data.substring(AA.channel.length+1),AE)
}}return(AC={outgoing:function(AF,AG,AE){y.postMessage(AA.channel+" "+AF,AG||z);
if(AE){AE()
}},destroy:function(){X(n,"message",AB);
if(AD){y=null;
AD.parentNode.removeChild(AD);
AD=null
}},onDOMReady:function(){z=J(AA.remote);
if(AA.isHost){var AE=function(AF){if(AF.data==AA.channel+"-ready"){y=("postMessage" in AD.contentWindow)?AD.contentWindow:AD.contentWindow.document;
X(n,"message",AE);
V(n,"message",AB);
k(function(){AC.up.callback(true)
},0)
}};
V(n,"message",AE);
t(AA.props,{src:p(AA.remote,{xdm_e:J(P.href),xdm_c:AA.channel,xdm_p:1}),name:u+AA.channel+"_provider"});
AD=a(AA)
}else{V(n,"message",AB);
y=("postMessage" in n.parent)?n.parent:n.parent.document;
y.postMessage(AA.channel+"-ready",z);
k(function(){AC.up.callback(true)
},0)
}},init:function(){g(AC.onDOMReady,AC)
}})
};
O.stack.FrameElementTransport=function(y){var z,AB,AA,x;
return(z={outgoing:function(AD,AE,AC){AA.call(this,AD);
if(AC){AC()
}},destroy:function(){if(AB){AB.parentNode.removeChild(AB);
AB=null
}},onDOMReady:function(){x=J(y.remote);
if(y.isHost){t(y.props,{src:p(y.remote,{xdm_e:J(P.href),xdm_c:y.channel,xdm_p:5}),name:u+y.channel+"_provider"});
AB=a(y);
AB.fn=function(AC){delete AB.fn;
AA=AC;
k(function(){z.up.callback(true)
},0);
return function(AD){z.up.incoming(AD,x)
}
}
}else{if(D.referrer&&J(D.referrer)!=s.xdm_e){n.top.location=s.xdm_e
}AA=n.frameElement.fn(function(AC){z.up.incoming(AC,x)
});
z.up.callback(true)
}},init:function(){g(z.onDOMReady,z)
}})
};
O.stack.NameTransport=function(AB){var AC;
var AE,AI,AA,AG,AH,y,x;
function AF(AL){var AK=AB.remoteHelper+(AE?"#_3":"#_2")+AB.channel;
AI.contentWindow.sendMessage(AL,AK)
}function AD(){if(AE){if(++AG===2||!AE){AC.up.callback(true)
}}else{AF("ready");
AC.up.callback(true)
}}function AJ(AK){AC.up.incoming(AK,y)
}function z(){if(AH){k(function(){AH(true)
},0)
}}return(AC={outgoing:function(AL,AM,AK){AH=AK;
AF(AL)
},destroy:function(){AI.parentNode.removeChild(AI);
AI=null;
if(AE){AA.parentNode.removeChild(AA);
AA=null
}},onDOMReady:function(){AE=AB.isHost;
AG=0;
y=J(AB.remote);
AB.local=b(AB.local);
if(AE){O.Fn.set(AB.channel,function(AL){if(AE&&AL==="ready"){O.Fn.set(AB.channel,AJ);
AD()
}});
x=p(AB.remote,{xdm_e:AB.local,xdm_c:AB.channel,xdm_p:2});
t(AB.props,{src:x+"#"+AB.channel,name:u+AB.channel+"_provider"});
AA=a(AB)
}else{AB.remoteHelper=AB.remote;
O.Fn.set(AB.channel,AJ)
}AI=a({props:{src:AB.local+"#_4"+AB.channel},onLoad:function AK(){var AL=AI||this;
X(AL,"load",AK);
O.Fn.set(AB.channel+"_load",z);
(function AM(){if(typeof AL.contentWindow.sendMessage=="function"){AD()
}else{k(AM,50)
}}())
}})
},init:function(){g(AC.onDOMReady,AC)
}})
};
O.stack.HashTransport=function(z){var AC;
var AH=this,AF,AA,x,AD,AM,AB,AL;
var AG,y;
function AK(AO){if(!AL){return 
}var AN=z.remote+"#"+(AM++)+"_"+AO;
((AF||!AG)?AL.contentWindow:AL).location=AN
}function AE(AN){AD=AN;
AC.up.incoming(AD.substring(AD.indexOf("_")+1),y)
}function AJ(){if(!AB){return 
}var AN=AB.location.href,AP="",AO=AN.indexOf("#");
if(AO!=-1){AP=AN.substring(AO)
}if(AP&&AP!=AD){AE(AP)
}}function AI(){AA=setInterval(AJ,x)
}return(AC={outgoing:function(AN,AO){AK(AN)
},destroy:function(){n.clearInterval(AA);
if(AF||!AG){AL.parentNode.removeChild(AL)
}AL=null
},onDOMReady:function(){AF=z.isHost;
x=z.interval;
AD="#"+z.channel;
AM=0;
AG=z.useParent;
y=J(z.remote);
if(AF){z.props={src:z.remote,name:u+z.channel+"_provider"};
if(AG){z.onLoad=function(){AB=n;
AI();
AC.up.callback(true)
}
}else{var AP=0,AN=z.delay/50;
(function AO(){if(++AP>AN){throw new Error("Unable to reference listenerwindow")
}try{AB=AL.contentWindow.frames[u+z.channel+"_consumer"]
}catch(AQ){}if(AB){AI();
AC.up.callback(true)
}else{k(AO,50)
}}())
}AL=a(z)
}else{AB=n;
AI();
if(AG){AL=parent;
AC.up.callback(true)
}else{t(z,{props:{src:z.remote+"#"+z.channel+new Date(),name:u+z.channel+"_consumer"},onLoad:function(){AC.up.callback(true)
}});
AL=a(z)
}}},init:function(){g(AC.onDOMReady,AC)
}})
};
O.stack.ReliableBehavior=function(y){var AA,AC;
var AB=0,x=0,z="";
return(AA={incoming:function(AF,AD){var AE=AF.indexOf("_"),AG=AF.substring(0,AE).split(",");
AF=AF.substring(AE+1);
if(AG[0]==AB){z="";
if(AC){AC(true)
}}if(AF.length>0){AA.down.outgoing(AG[1]+","+AB+"_"+z,AD);
if(x!=AG[1]){x=AG[1];
AA.up.incoming(AF,AD)
}}},outgoing:function(AF,AD,AE){z=AF;
AC=AE;
AA.down.outgoing(x+","+(++AB)+"_"+AF,AD)
}})
};
O.stack.QueueBehavior=function(z){var AC,AD=[],AG=true,AA="",AF,x=0,y=false,AB=false;
function AE(){if(z.remove&&AD.length===0){W(AC);
return 
}if(AG||AD.length===0||AF){return 
}AG=true;
var AH=AD.shift();
AC.down.outgoing(AH.data,AH.origin,function(AI){AG=false;
if(AH.callback){k(function(){AH.callback(AI)
},0)
}AE()
})
}return(AC={init:function(){if(T(z)){z={}
}if(z.maxLength){x=z.maxLength;
AB=true
}if(z.lazy){y=true
}else{AC.down.init()
}},callback:function(AI){AG=false;
var AH=AC.up;
AE();
AH.callback(AI)
},incoming:function(AK,AI){if(AB){var AJ=AK.indexOf("_"),AH=parseInt(AK.substring(0,AJ),10);
AA+=AK.substring(AJ+1);
if(AH===0){if(z.encode){AA=K(AA)
}AC.up.incoming(AA,AI);
AA=""
}}else{AC.up.incoming(AK,AI)
}},outgoing:function(AL,AI,AK){if(z.encode){AL=h(AL)
}var AH=[],AJ;
if(AB){while(AL.length!==0){AJ=AL.substring(0,x);
AL=AL.substring(AJ.length);
AH.push(AJ)
}while((AJ=AH.shift())){AD.push({data:AH.length+"_"+AJ,origin:AI,callback:AH.length===0?AK:null})
}}else{AD.push({data:AL,origin:AI,callback:AK})
}if(y){AC.down.init()
}else{AE()
}},destroy:function(){AF=true;
AC.down.destroy()
}})
};
O.stack.VerifyBehavior=function(AB){var AC,AA,y,z=false;
function x(){AA=Math.random().toString(16).substring(2);
AC.down.outgoing(AA)
}return(AC={incoming:function(AF,AD){var AE=AF.indexOf("_");
if(AE===-1){if(AF===AA){AC.up.callback(true)
}else{if(!y){y=AF;
if(!AB.initiate){x()
}AC.down.outgoing(AF)
}}}else{if(AF.substring(0,AE)===y){AC.up.incoming(AF.substring(AE+1),AD)
}}},outgoing:function(AF,AD,AE){AC.down.outgoing(AA+"_"+AF,AD,AE)
},callback:function(AD){if(AB.initiate){x()
}}})
};
O.stack.RpcBehavior=function(AD,y){var AA,AF=y.serializer||o();
var AE=0,AC={};
function x(AG){AG.jsonrpc="2.0";
AA.down.outgoing(AF.stringify(AG))
}function AB(AG,AI){var AH=Array.prototype.slice;
return function(){var AJ=arguments.length,AL,AK={method:AI};
if(AJ>0&&typeof arguments[AJ-1]==="function"){if(AJ>1&&typeof arguments[AJ-2]==="function"){AL={success:arguments[AJ-2],error:arguments[AJ-1]};
AK.params=AH.call(arguments,0,AJ-2)
}else{AL={success:arguments[AJ-1]};
AK.params=AH.call(arguments,0,AJ-1)
}AC[""+(++AE)]=AL;
AK.id=AE
}else{AK.params=AH.call(arguments,0)
}if(AG.namedParams&&AK.params.length===1){AK.params=AK.params[0]
}x(AK)
}
}function z(AN,AM,AI,AL){if(!AI){if(AM){x({id:AM,error:{code:-32601,message:"Procedure not found."}})
}return 
}var AK,AH;
if(AM){AK=function(AO){AK=Q;
x({id:AM,result:AO})
};
AH=function(AO,AP){AH=Q;
var AQ={id:AM,error:{code:-32099,message:AO}};
if(AP){AQ.error.data=AP
}x(AQ)
}
}else{AK=AH=Q
}if(!R(AL)){AL=[AL]
}try{var AG=AI.method.apply(AI.scope,AL.concat([AK,AH]));
if(!T(AG)){AK(AG)
}}catch(AJ){AH(AJ.message)
}}return(AA={incoming:function(AH,AG){var AI=AF.parse(AH);
if(AI.method){if(y.handle){y.handle(AI,x)
}else{z(AI.method,AI.id,y.local[AI.method],AI.params)
}}else{var AJ=AC[AI.id];
if(AI.error){if(AJ.error){AJ.error(AI.error)
}}else{if(AJ.success){AJ.success(AI.result)
}}delete AC[AI.id]
}},init:function(){if(y.remote){for(var AG in y.remote){if(y.remote.hasOwnProperty(AG)){AD[AG]=AB(y.remote[AG],AG)
}}}AA.down.init()
},destroy:function(){for(var AG in y.remote){if(y.remote.hasOwnProperty(AG)&&AD.hasOwnProperty(AG)){delete AD[AG]
}}AA.down.destroy()
}})
};
B.easyXDM=O
})(window,document,location,window.setTimeout,decodeURIComponent,encodeURIComponent);
var RemoteApps=RemoteApps||{};
(function(C){function B(D){var E=[];
C.each(D,function(){E.push(C("."+this))
});
C.each(E,function(){this.attr("disabled","disabled")
});
return{enable:function(){C.each(E,function(){this.removeAttr("disabled")
})
}}
}function A(H,E){var G=C(window);
var D={header:"Remote Apps Dialog Title",submitHandler:function(L,K){},cancelHandler:function(L,K){},headerClass:"ra-dialog-header",width:G.width()*0.5,height:G.height()*0.5,closeOnOutsideClick:true,submitText:"Submit",cancelText:"Cancel",submitClass:"ra-dialog-submit",cancelClass:"ra-dialog-cancel",keypressListener:function(K){if(K.keyCode===27){F.remove()
}}};
var J=C.extend({},D,E);
var F=new AJS.Dialog(J);
F.addHeader(J.header,J.headerClass);
F.addButton(J.submitText,function(K,M){var L=B([J.submitClass,J.cancelClass]);
RemoteAppsRpc.dialogMessage("submit",function(N){if(N.result||N){K.remove();
window.RemoteAppsRpc.destroy();
J.submitHandler(K,N)
}else{L.enable()
}})
},J.submitClass);
F.addCancel(J.cancelText,function(K,M){var L=B([J.submitClass,J.cancelClass]);
RemoteAppsRpc.dialogMessage("cancel",function(N){if(N.result||N){K.remove();
window.RemoteAppsRpc.destroy();
J.cancelHandler(K,N)
}else{L.enable()
}})
});
var I="<div class='ra-servlet-placeholder'>Loading...</div>";
F.addPanel("Main",I,"ra-dialog-content");
return{show:function(){F.show();
var K=C(".ra-dialog-content");
if(H.indexOf("?")>0){H+="&"
}else{H+="?"
}H+="width="+K.width()+"&height="+K.height();
C.ajax(H,{dataType:"html",success:function(L){C(".ra-servlet-placeholder").html(L)
},error:function(L,N,M){C(".ra-servlet-placeholder").html("<p>The content could no be retrieved.</p>");
AJS.log(N+" "+M)
}})
}}
}RemoteApps.makeDialog=A
})(AJS.$);
AJS.toInit(function(B){var A=B(".ra-dialog");
A.each(function(C,D){var E=B(D);
E.click(function(G){G.preventDefault();
var F=RemoteApps.makeDialog(E.attr("href"),{header:E.text()});
F.show()
})
})
})(AJS.$);
jQuery.fn.avataror=function(options){var $=jQuery,$document=$(document);this.each(function(){var $this=$(this);var imgsrc=$this.find("img").attr("src");$this.css({"-moz-border-radius":"10px","-webkit-border-radius":"10px"});$this.html("<p>Loading?</p>");var avataror={previewSize:48};avataror.preview=$("<div/>").addClass("avataror-preview").css({border:"solid 1px #000","float":"left",height:avataror.previewSize+"px",overflow:"hidden",width:avataror.previewSize+"px",position:"relative",top:"-9999em",left:"-9999em"});avataror.preview.prependTo(options.previewElement);avataror.img=$('<img src="'+imgsrc+'" alt="Avatar Source"/>');avataror.img.load(function(){avataror.image=$("<div/>").css({background:"url('"+imgsrc+"') no-repeat",clear:"left",position:"relative"});avataror.marker=$("<div/>").css({cursor:"move",position:"relative"});avataror.dash=$("<div/>");avataror.shadow=$("<div/>");avataror.dash.add(avataror.shadow).css({cursor:"move",opacity:0.5,left:0,top:0,position:"absolute"});avataror.image.append(avataror.shadow).append(avataror.dash).append(avataror.marker);$this.append(avataror.image);avataror.marker.html("<div></div><div></div><div></div><div></div>");$("div",avataror.marker).each(function(i){var $this=$(this);$this.css({background:"#000",border:"solid 1px #fff",width:"10px",height:"10px",position:"absolute","font-size":"1px"});$this.css(["left","right","right","left"][i],"-6px");$this.css(["top","top","bottom","bottom"][i],"-6px");$this.css("cursor",["nw-resize","ne-resize","se-resize","sw-resize"][i]);$this.mousedown(function(e){e.preventDefault();e.stopPropagation();avataror.dragging={x:e.pageX,y:e.pageY,ax:avataror.x,ay:avataror.y,w:avataror.width,h:avataror.height,i:i+1};avataror.shadow.hide()})});avataror.marker.add(avataror.image).mousedown(function(e){e.preventDefault();avataror.dragging={x:e.pageX,y:e.pageY,ax:avataror.x,ay:avataror.y,w:avataror.width,h:avataror.height};avataror.shadow.hide()});$document.mouseup(function(e){avataror.handleMouseUp(e)});$document.mousemove(function(e){if(avataror.dragging){avataror.handleMouseMove(e.pageX,e.pageY);e.preventDefault()}});avataror.imgwidth=avataror.img.width();avataror.imgheight=avataror.img.height();avataror.x=parseInt($("#avatar-offsetX").val());avataror.y=parseInt($("#avatar-offsetY").val());avataror.width=parseInt($("#avatar-width").val());avataror.height=avataror.width;avataror.image.css({width:avataror.imgwidth+"px",height:avataror.imgheight+"px"});avataror.setMarker();$this.css({width:avataror.imgwidth+"px"});avataror.preview.css({position:"static"});$("p",$this).remove();$this.trigger("AvatarImageLoaded")});avataror.preview.append(avataror.img);avataror.setMarker=function(){avataror.marker.css("border","dashed 1px #fff");avataror.dash.css("border","solid 1px #000");avataror.shadow.css("border","solid 1px #000");avataror.marker.add(this.dash).css("left",this.x-1+"px");avataror.marker.add(avataror.dash).css("top",avataror.y-1+"px");avataror.shadow.css("border-left-width",avataror.x+"px");avataror.shadow.css("border-right-width",avataror.imgwidth-avataror.x-avataror.width+"px");avataror.shadow.css("border-top-width",avataror.y+"px");avataror.shadow.css("border-bottom-width",avataror.imgheight-avataror.y-avataror.height+"px");avataror.shadow.css("width",avataror.width+"px");avataror.shadow.css("height",avataror.height+"px");avataror.marker.add(avataror.dash).css("width",avataror.width+"px");avataror.marker.add(avataror.dash).css("height",avataror.height+"px")};avataror.adjustPreview=function(){avataror.img.attr("width",avataror.imgwidth*avataror.previewSize/avataror.width);avataror.img.attr("height",avataror.imgheight*avataror.previewSize/avataror.height);avataror.img.css("margin-left","-"+avataror.x*avataror.previewSize/avataror.width+"px");avataror.img.css("margin-top","-"+avataror.y*avataror.previewSize/avataror.height+"px");avataror.preview.select()};avataror.handleMouseMove=function(newX,newY){avataror.dragging.nextExec=avataror.dragging.nextExec||0;if(avataror.dragging.nextExec==0){avataror.dragging.nextExec=3}else{avataror.dragging.nextExec--;return }var dx=newX-avataror.dragging.x;var dy=newY-avataror.dragging.y;if(this.dragging.i){var handler=avataror.resizeHandlers[this.dragging.i-1];handler(dx,dy)}else{avataror.x=avataror.dragging.ax+dx;avataror.y=avataror.dragging.ay+dy;if(avataror.x+avataror.width>avataror.imgwidth){avataror.x=avataror.imgwidth-avataror.width}if(avataror.y+avataror.height>avataror.imgheight){avataror.y=avataror.imgheight-avataror.height}if(avataror.x<0){avataror.x=0}if(avataror.y<0){avataror.y=0}}avataror.setMarker();avataror.adjustPreview()};avataror.handleMouseUp=function(e){$("#avatar-offsetX").val(avataror.x);$("#avatar-offsetY").val(avataror.y);$("#avatar-width").val(avataror.width);avataror.dragging=null;avataror.shadow.show()};avataror.originX=function(){return avataror.dragging.ax};avataror.originY=function(){return avataror.dragging.ay};avataror.originBottomX=function(){return avataror.dragging.ax+avataror.dragging.w};avataror.originBottomY=function(){return avataror.dragging.ay+avataror.dragging.h};avataror.originNw=function(){return{x:avataror.originX(),y:avataror.originY()}};avataror.originNe=function(){return{x:avataror.originBottomX(),y:avataror.originY()}};avataror.originSe=function(){return{x:avataror.originBottomX(),y:avataror.originBottomY()}};avataror.originSw=function(){return{x:avataror.originX(),y:avataror.originBottomY()}};avataror.nwHandler=function(dx,dy){var anchor=avataror.originSe();var tmpBase={x:avataror.originX()+dx,y:avataror.originY()+dy};var diffX=Math.abs(tmpBase.x-anchor.x),diffY=Math.abs(tmpBase.y-anchor.y);var newSize=Math.min(diffX,diffY);if(newSize<20){newSize=20}if(anchor.x-newSize<0){newSize=anchor.x}if(anchor.y-newSize<0){newSize=anchor.y}avataror.x=anchor.x-newSize;avataror.y=anchor.y-newSize;avataror.width=avataror.height=newSize};avataror.neHandler=function(dx,dy){var anchor=avataror.originSw();var tmpBase={x:avataror.originBottomX()+dx,y:avataror.originY()+dy};var diffX=Math.abs(tmpBase.x-anchor.x),diffY=Math.abs(tmpBase.y-anchor.y);var newSize=Math.min(diffX,diffY);if(newSize<20){newSize=20}if(anchor.x+newSize>avataror.imgwidth){newSize=avataror.imgwidth-anchor.x}if(anchor.y-newSize<0){newSize=anchor.y}avataror.y=anchor.y-newSize;avataror.width=avataror.height=newSize};avataror.seHandler=function(dx,dy){var anchor=avataror.originNw();var tmpBase={x:avataror.originBottomX()+dx,y:avataror.originBottomY()+dy};var diffX=Math.abs(tmpBase.x-anchor.x),diffY=Math.abs(tmpBase.y-anchor.y);var newSize=Math.min(diffX,diffY);if(newSize<20){newSize=20}if(anchor.x+newSize>avataror.imgwidth){newSize=avataror.imgwidth-anchor.x}if(anchor.y+newSize>avataror.imgheight){newSize=avataror.imgheight-anchor.y}avataror.width=avataror.height=newSize};avataror.swHandler=function(dx,dy){var anchor=avataror.originNe();var tmpBase={x:avataror.originX()+dx,y:avataror.originBottomY()+dy};var diffX=Math.abs(tmpBase.x-anchor.x),diffY=Math.abs(tmpBase.y-anchor.y);var newSize=Math.min(diffX,diffY);if(newSize<20){newSize=20}if(anchor.x-newSize<0){newSize=anchor.x}if(anchor.y+newSize>avataror.imgheight){newSize=avataror.imgheight-anchor.y}avataror.x=anchor.x-newSize;avataror.width=avataror.height=newSize};avataror.resizeHandlers=[avataror.nwHandler,avataror.neHandler,avataror.seHandler,avataror.swHandler]})};
JIRA.Avatar=Class.extend({init:function(options){this._id=options.id;this._isSystemAvatar=options.isSystemAvatar;this._isSelected=options.isSelected},setUnSelected:function(){this._isSelected=false},setSelected:function(){this._isSelected=true},isSelected:function(){return !!this._isSelected},isSystemAvatar:function(){return this._isSystemAvatar},getId:function(){return this._id},toJSON:function(){return{id:this._id,isSystemAvatar:this._isSystemAvatar,isSelected:this._isSelected}}});JIRA.Avatar.createCustomAvatar=function(descriptor){descriptor.isSystemAvatar=false;return new JIRA.Avatar(descriptor)};JIRA.Avatar.createSystemAvatar=function(descriptor){descriptor.isSystemAvatar=true;return new JIRA.Avatar(descriptor)};JIRA.Avatar.LARGE={param:"large",height:48,width:48};JIRA.Avatar.MEDIUM={param:"medium",width:32,height:32};JIRA.Avatar.SMALL={param:"small",width:16,height:16};
JIRA.AvatarManager=Class.extend({init:function(options){this.store=options.store;this.ownerId=options.ownerId;this.anonymousAvatarId=options.anonymousAvatarId;this.avatarSrcBaseUrl=options.avatarSrcBaseUrl},selectAvatar:function(avatar,options){return this.store.selectAvatar(avatar,options)},getById:function(id){return this.store.getById(id)},destroy:function(avatar,options){this.store.destroy(avatar,options)},update:function(avatar,options){this.store.update(avatar,options)},add:function(avatar,options){this.store._add(avatar,options)},getAllSystemAvatars:function(){return this.store.getAllSystemAvatars()},getAllCustomAvatars:function(){return this.store.getAllCustomAvatars()},getSelectedAvatar:function(){return this.store.getSelectedAvatar()},getAllAvatars:function(){return this.store.getAllAvatars()},getAllAvatarsRenderData:function(size){var i,instance=this,avatars=this.getAllAvatars(),renderData={system:[],custom:[]};for(i=0;i<avatars.system.length;i++){renderData.system.push(instance.getAvatarRenderData(avatars.system[i],size))}for(i=0;i<avatars.custom.length;i++){renderData.custom.push(instance.getAvatarRenderData(avatars.custom[i],size))}return renderData},getAvatarRenderData:function(avatar,size){var data=avatar.toJSON();data.src=this.getAvatarSrc(avatar,size);data.width=size.width;data.height=size.height;return data},refreshStore:function(options){this.store.refresh(options)},getAvatarSrc:function(avatar,size){if(this.store.isTempAvatar(avatar)){return contextPath+"/secure/temporaryavatar?"+jQuery.param({cropped:true,magic:new Date().getTime(),size:size.param})}return this.avatarSrcBaseUrl+"?"+jQuery.param({avatarId:avatar.getId(),ownerId:this.ownerId,size:size.param})},createTemporaryAvatar:function(field,options){this.store.createTemporaryAvatar(field,options)},createAvatarFromTemporary:function(instructions,options){this.store.createAvatarFromTemporary(instructions,options)},getAnonymousAvatarId:function(){return this.anonymousAvatarId}});JIRA.AvatarManager.createProjectAvatarManager=function(options){var restQueryUrl,restUpdateUrl="",restCreateTempUrl="",restUpdateTempUrl="",restSingleAvatarUrl="";if(options.projectKey){restQueryUrl=contextPath+"/rest/api/latest/project/"+options.projectKey+"/avatars";restUpdateUrl=contextPath+"/rest/api/latest/project/"+options.projectKey+"/avatar";restCreateTempUrl=contextPath+"/rest/api/latest/project/"+options.projectKey+"/avatar/temporary";restUpdateTempUrl=restUpdateUrl;restSingleAvatarUrl=restUpdateUrl}else{restQueryUrl=contextPath+"/rest/api/latest/avatar/project/system";restCreateTempUrl=contextPath+"/rest/api/latest/avatar/project/temporary";restUpdateTempUrl=contextPath+"/rest/api/latest/avatar/project/temporaryCrop"}var store=new JIRA.AvatarStore({restQueryUrl:restQueryUrl,restUpdateUrl:restUpdateUrl,restCreateTempUrl:restCreateTempUrl,restUpdateTempUrl:restUpdateTempUrl,restSingleAvatarUrl:restSingleAvatarUrl,defaultAvatarId:options.defaultAvatarId});return new JIRA.AvatarManager({store:store,ownerId:options.projectId,avatarSrcBaseUrl:contextPath+"/secure/projectavatar"})};JIRA.AvatarManager.createUserAvatarManager=function(options){var userRestUrl=contextPath+"/rest/api/latest/user";var store=new JIRA.AvatarStore({restQueryUrl:userRestUrl+"/avatars",restUpdateUrl:userRestUrl+"/avatar",restCreateTempUrl:userRestUrl+"/avatar/temporary",restUpdateTempUrl:userRestUrl+"/avatar",restSingleAvatarUrl:userRestUrl+"/avatar",restParams:{"username":options.username},defaultAvatarId:options.defaultAvatarId});return new JIRA.AvatarManager({store:store,ownerId:options.username,avatarSrcBaseUrl:contextPath+"/secure/useravatar"})};
JIRA.AvatarStore=Class.extend({TEMP_ID:"TEMP",init:function(options){if(!options.restQueryUrl){throw new Error("JIRA.AvatarStore.init: You must specify [restQueryUrl], The rest url for querying avatars (see class description)")}if(!options.restCreateTempUrl){throw new Error("JIRA.AvatarStore.init: You must specify [restCreateTempUrl], The rest url for creating a temporary avatar (see class description)")}if(!options.restUpdateTempUrl){throw new Error("JIRA.AvatarStore.init: You must specify [restUpdateTempUrl], The rest url for updating a temporary avatar (see class description)")}if(!options.defaultAvatarId){throw new Error("JIRA.AvatarStore.init: You must specify [defaultAvatarId] to the contructor so the store "+"knows what to select if you delete the selected one")}this.restQueryUrl=options.restQueryUrl;this.restUpdateUrl=options.restUpdateUrl;this.restCreateTempUrl=options.restCreateTempUrl;this.restUpdateTempUrl=options.restUpdateTempUrl;this.restSingleAvatarUrl=options.restSingleAvatarUrl;this.restParams=options.restParams;this.defaultAvatarId=options.defaultAvatarId;this.avatars={system:[],custom:[]}},_buildCompleteUrl:function(url){var completeUrl=url;if(this.restParams){var queryParams="";for(var name in this.restParams){queryParams+=AJS.format("&{0}={1}",encodeURIComponent(name),encodeURIComponent(this.restParams[name]))}completeUrl+=("?"+queryParams.substr(1))}return completeUrl},getById:function(avatarId){var match;jQuery.each(this.avatars.system,function(i,avatar){if(this.getId()===avatarId){match=avatar;return false}});if(!match){jQuery.each(this.avatars.custom,function(i,avatar){if(this.getId()===avatarId){match=avatar;return false}})}return match},isTempAvatar:function(avatar){return(avatar.getId()===this.TEMP_ID)},_selectAvatar:function(avatar){var selected=this.getSelectedAvatar();if(selected){selected.setUnSelected()}avatar.setSelected()},selectAvatar:function(avatar,options){var instance=this;if(!avatar){throw new Error("JIRA.AvatarStore.selectAvatar: Cannot select Avatar that does not exist")}if(this.restUpdateUrl){JIRA.SmartAjax.makeRequest({type:"PUT",contentType:"application/json",dataType:"json",url:this._buildCompleteUrl(this.restUpdateUrl),data:JSON.stringify(avatar.toJSON()),success:function(){instance._selectAvatar(avatar);if(options.success){options.success.call(this,avatar)}},error:options.error})}else{instance._selectAvatar(avatar);if(options.success){options.success.call(this,avatar)}}},_destory:function(avatar){var index=jQuery.inArray(avatar,this.avatars.custom);if(index!==-1){this.avatars.custom.splice(index,1)}else{throw new Error("JIRA.AvatarStore._destroy: Cannot remove avatar ["+avatar.getId()+"], "+"it might be a system avatar (readonly) or does not exist.")}},destroy:function(avatar,options){var instance=this;options=options||{};if(!avatar){throw new Error("JIRA.AvatarStore.destroy: Cannot delete Avatar that does not exist")}JIRA.SmartAjax.makeRequest({type:"DELETE",url:this.getRestUrlForAvatar(avatar),success:function(){instance._destory(avatar);if(avatar.isSelected()){instance.selectAvatar(instance.getById(instance.defaultAvatarId),options)}else{if(options.success){options.success.apply(this,arguments)}}},error:options.error})},getSelectedAvatar:function(){for(var i=0;i<this.avatars.custom.length;i++){if(this.avatars.custom[i].isSelected()){return this.avatars.custom[i]}}for(i=0;i<this.avatars.system.length;i++){if(this.avatars.system[i].isSelected()){return this.avatars.system[i]}}},_update:function(avatar){var instance=this;if(this.getById(avatar.getId())){jQuery.each(this.avatars.custom,function(i){if(this.getId()===avatar.getId()){instance.avatars.custom[i]=avatar}})}else{throw new Error("JIRA.AvatarStore._update: Cannot update avatar ["+avatar.getId()+"], "+"it might be a system avatar (readonly) or does not exist.")}},update:function(avatar,options){var instance=this;options=options||{};JIRA.SmartAjax.makeRequest({type:"PUT",url:this.getRestUrlForAvatar(avatar),error:options.error,success:function(){instance._update(avatar);if(options.success){options.success.apply(this,arguments)}}})},_add:function(avatar){if(avatar.isSystemAvatar()){this.avatars.system.push(avatar)}else{this.avatars.custom.push(avatar)}},createAvatarFromTemporary:function(instructions,options){var instance=this;options=options||{};if(this.restUpdateTempUrl){JIRA.SmartAjax.makeRequest({type:"POST",url:this._buildCompleteUrl(this.restUpdateTempUrl),data:JSON.stringify(instructions),contentType:"application/json",dataType:"json",success:function(data){if(!data){data={id:instance.TEMP_ID,isSelected:true}}var avatar=JIRA.Avatar.createCustomAvatar(data);instance._add(avatar);if(options.success){options.success.call(this,data)}},error:options.error})}},createTemporaryAvatar:function(fileInput,options){options=AJS.$.extend(true,{},options,{params:this.restParams});JIRA.AvatarUtil.uploadTemporaryAvatar(this.restCreateTempUrl,fileInput,options)},_refresh:function(avatars){var instance=this;instance.avatars.system=[];instance.avatars.custom=[];if(avatars.system){jQuery.each(avatars.system,function(i,descriptor){instance.avatars.system.push(JIRA.Avatar.createSystemAvatar(descriptor))})}if(avatars.custom){jQuery.each(avatars.custom,function(i,descriptor){instance.avatars.custom.push(JIRA.Avatar.createCustomAvatar(descriptor))})}},refresh:function(options){var instance=this;var tempAvatar=this.getById(instance.TEMP_ID);options=options||{};JIRA.SmartAjax.makeRequest({url:this._buildCompleteUrl(this.restQueryUrl),error:options.error,success:function(avatars){instance._refresh(avatars);if(tempAvatar){instance._add(tempAvatar)}if(options.success){options.success.apply(this,arguments)}}})},getAllAvatars:function(){return this.avatars},getAllSystemAvatars:function(){return this.avatars.system},getAllCustomAvatars:function(){return this.avatars.custom},getRestUrlForAvatar:function(avatar){return this._buildCompleteUrl(this.restSingleAvatarUrl+"/"+avatar.getId())}});
JIRA.AvatarUtil={uploadUsingIframeRemoting:function(url,field,options){options=options||{};var fileName=field.val(),form=new AJS.InlineAttach.Form(new AJS.InlineAttach.FileInput(field,false)),progress=form.addStaticProgress(fileName);var $oldInput=form.cloneFileInput();form.fileSelector.clear();var timer=new AJS.InlineAttach.Timer(function(){!this.cancelled&&progress.show()},this);var upload=new AJS.InlineAttach.FormUpload({$input:$oldInput,url:url,params:AJS.$.extend({},options.params,{filename:fileName,atl_token:atl_token()}),scope:this,before:function(){!this.cancelled&&progress.start()},success:function(val,status){if(val.errorMessages&&val.errorMessages.length){form.addErrorWithFileName(val.errorMessages[0],fileName,JIRA.AvatarUtil.getErrorTarget(form))}else{if(options.success){options.success(val,status)}}},error:function(text){console.log(text);if(this.cancelled){return }if(text.indexOf("SecurityTokenMissing")>=0){form.addError(AJS.InlineAttach.Text.tr("upload.xsrf.timeout",fileName),JIRA.AvatarUtil.getErrorTarget(form))}else{form.addError(AJS.InlineAttach.Text.tr("upload.error.unknown",fileName),JIRA.AvatarUtil.getErrorTarget(form))}},after:function(){timer.cancel();progress.remove();if(!this.cancelled){form.enable()}}});progress.onCancel(function(){upload.abort()});upload.upload()},uploadUsingFileApi:function(url,field,options){var timer,upload,cancelled,file=field[0].files[0],form=new AJS.InlineAttach.Form(new AJS.InlineAttach.FileInput(field,false)),progress=form.addProgress(file);options=options||{};timer=new AJS.InlineAttach.Timer(function(){if(!cancelled){progress.show()}});upload=new AJS.InlineAttach.AjaxUpload({file:file,params:AJS.$.extend({},options.params,{filename:file.name,size:file.size,atl_token:atl_token()}),scope:this,url:url,before:function(){field.hide();!cancelled&&progress.start()},progress:function(val){progress.progress.$progress.parent().parent().show();!cancelled&&progress.update(val)},success:function(val,status){if(cancelled){return }if(val.errorMessages&&val.errorMessages.length){form.addErrorWithFileName(val.errorMessages[0],file.name,JIRA.AvatarUtil.getErrorTarget(form))}else{if(status===201){options.success(val,status)}}},error:function(text,status){if(status<0){form.addError(text,JIRA.AvatarUtil.getErrorTarget(form))}else{form.addError(AJS.InlineAttach.Text.tr("upload.error.unknown",file.name),JIRA.AvatarUtil.getErrorTarget(form))}if(options.error){options.error(text,status)}},after:function(){timer.cancel();progress.finish().remove();field.val("").show()}});upload.upload();progress.onCancel(function(){upload.abort()})},getErrorTarget:function(form){return{$element:form.$form.find(".error")}},uploadTemporaryAvatar:function(url,field,options){if(AJS.InlineAttach.AjaxPresenter.isSupported(field)){this.uploadUsingFileApi(url,field,options)}else{this.uploadUsingIframeRemoting(url,field,options)}}};
JIRA.AvatarPicker=AJS.Control.extend({init:function(options){this.avatarManager=options.avatarManager;this.avatarRenderer=options.avatarRenderer;this.imageEditor=options.imageEditor;this.size=options.size;this.selectCallback=options.select},render:function(ready){var instance=this;this.avatarManager.refreshStore({success:function(){instance.element=jQuery('<div id="jira-avatar-picker" />');instance.element.html(JIRA.Templates.AvatarPicker.picker({avatars:instance.avatarManager.getAllAvatarsRenderData(instance.size)}));instance._assignEvents("selectAvatar",instance.element.find(".jira-avatar img"));instance._assignEvents("deleteAvatar",instance.element.find(".jira-delete-avatar"));instance._assignEvents("uploader",instance.element.find("#jira-avatar-uploader"));ready(instance.element)},error:function(xhr,error,textStatus,smartAjaxResult){instance.appendErrorContent(instance.element,smartAjaxResult);ready(instance.element)}})},appendErrorContent:function(el,smartAjaxResult){try{var errors=JSON.parse(smartAjaxResult.data);if(errors&&errors.errorMessages){jQuery.each(errors.errorMessages,function(i,message){AJS.messages.error(el,{body:AJS.escapeHTML(message),closeable:false,shadowed:false})})}else{el.append(JIRA.SmartAjax.buildDialogErrorContent(smartAjaxResult,true))}}catch(e){el.append(JIRA.SmartAjax.buildDialogErrorContent(smartAjaxResult,true))}},uploadTempAvatar:function(field){var instance=this;this.avatarManager.createTemporaryAvatar(field,{success:function(data){if(data.id){instance.render(function(){instance.selectAvatar(data.id)})}else{field.val("");instance.element.parent().parent().find(".jira-avatar-upload-form").hide();instance.element.hide();instance.element.parent().append(instance.imageEditor.render(data));instance.imageEditor.edit({confirm:function(instructions){instance.avatarManager.createAvatarFromTemporary(instructions,{success:function(data){instance.render(function(){instance.selectAvatar(data.id)})}})},cancel:function(){instance.imageEditor.element.remove();instance.element.show();instance.element.parent().parent().find(".jira-avatar-upload-form").show()}})}},error:function(){console.log(arguments)}})},getAvatarElById:function(id){return this.element.find(".jira-avatar[data-id='"+id+"']")},selectAvatar:function(id){var avatar,instance=this;avatar=this.avatarManager.getById(id);this.avatarManager.selectAvatar(this.avatarManager.getById(id),{error:function(){},success:function(){instance.getAvatarElById(id).remove();if(instance.selectCallback){instance.selectCallback.call(instance,avatar,instance.avatarManager.getAvatarSrc(avatar,instance.size))}}})},deleteAvatar:function(id){var instance=this;if(confirm("Are you sure you want to delete avatar?")){this.avatarManager.destroy(this.avatarManager.getById(id),{error:function(){},success:function(){var selectedAvatar=instance.avatarManager.getSelectedAvatar(),$avatar=instance.getAvatarElById(id);$avatar.fadeOut(function(){$avatar.remove()});if(selectedAvatar.getId()!==id){instance.getAvatarElById(selectedAvatar.getId()).addClass("jira-selected-avatar");instance.selectCallback.call(instance,selectedAvatar,instance.avatarManager.getAvatarSrc(selectedAvatar,instance.size),true)}}})}},_events:{uploader:{change:function(e,el){this.uploadTempAvatar(el)}},deleteAvatar:{click:function(e,el){this.deleteAvatar(el.attr("data-id"))}},selectAvatar:{click:function(e,el){if(e.target===el[0]){this.selectAvatar(el.attr("data-id"))}}}}});JIRA.AvatarPicker.ImageEditor=AJS.Control.extend({render:function(data){this.element=jQuery("<div />").html(JIRA.Templates.AvatarPicker.imageEditor(data));return this.element},edit:function(options){var instance=this,avator=this.element.find(".avataror");options=options||{};avator.bind("AvatarImageLoaded",function(){window.setTimeout(function(){AJS.$(instance).trigger(JIRA.AvatarPicker.ImageEditor.LOADED)},10)});avator.find("img").load(function(){avator.avataror({previewElement:instance.element.find(".jira-avatar-cropper-header"),parent:instance.element})});jQuery("#avataror").submit(function(e){e.preventDefault();if(options.confirm){options.confirm({cropperOffsetX:jQuery("#avatar-offsetX").val(),cropperOffsetY:jQuery("#avatar-offsetY").val(),cropperWidth:jQuery("#avatar-width").val()})}}).find(".cancel").click(function(e){if(options.cancel){options.cancel()}AJS.$(instance).trigger(JIRA.AvatarPicker.ImageEditor.DISMISSED);e.preventDefault()})}});JIRA.AvatarPicker.ImageEditor.LOADED="imageEditorLoaded";JIRA.AvatarPicker.ImageEditor.DISMISSED="imageEditorDismissed";JIRA.AvatarPicker.createProjectAvatarPicker=function(options){return new JIRA.AvatarPicker({avatarManager:JIRA.AvatarManager.createProjectAvatarManager({projectKey:options.projectKey,projectId:options.projectId,defaultAvatarId:options.defaultAvatarId}),imageEditor:new JIRA.AvatarPicker.ImageEditor(),size:JIRA.Avatar.LARGE,select:options.select})};JIRA.AvatarPicker.createUserAvatarPicker=function(options){return new JIRA.AvatarPicker({avatarManager:JIRA.AvatarManager.createUserAvatarManager({username:options.username,defaultAvatarId:options.defaultAvatarId}),imageEditor:new JIRA.AvatarPicker.ImageEditor(),size:JIRA.Avatar.LARGE,select:options.select})};JIRA.createProjectAvatarPickerDialog=function(options){var projectAvatarDialog=new JIRA.FormDialog({trigger:options.trigger,id:"project-avatar-picker",width:560,content:function(ready){var avatarPicker,$dialogWrapper;$dialogWrapper=jQuery("<div />");jQuery("<h2 />").text("Select a Project Avatar").appendTo($dialogWrapper);avatarPicker=JIRA.AvatarPicker.createProjectAvatarPicker({projectKey:options.projectKey,projectId:options.projectId,defaultAvatarId:options.defaultAvatarId,select:function(avatar,src,implicit){if(options.select){options.select.apply(this,arguments)}if(!implicit){projectAvatarDialog.hide()}}});AJS.$(avatarPicker.imageEditor).bind(JIRA.AvatarPicker.ImageEditor.DISMISSED,function(){projectAvatarDialog._positionInCenter();projectAvatarDialog.getButtonsContainer().show()});AJS.$(avatarPicker.imageEditor).bind(JIRA.AvatarPicker.ImageEditor.LOADED,function(){projectAvatarDialog._positionInCenter();projectAvatarDialog.getButtonsContainer().hide()});avatarPicker.render(function(content){$dialogWrapper.append(content);ready($dialogWrapper)})}});projectAvatarDialog._focusFirstField=function(){}};JIRA.createUserAvatarPickerDialog=function(options){var userAvatarDialog=new JIRA.FormDialog({trigger:options.trigger,id:"user-avatar-picker",width:560,content:function(ready){var avatarPicker,$dialogWrapper;$dialogWrapper=jQuery("<div />");jQuery("<h2 />").text("Select a User Avatar").appendTo($dialogWrapper);avatarPicker=JIRA.AvatarPicker.createUserAvatarPicker({username:options.username,defaultAvatarId:options.defaultAvatarId,select:function(avatar,src,implicit){if(options.select){options.select.apply(this,arguments)}jQuery(".avatar-image").attr("src",src);if(!implicit){userAvatarDialog.hide()}}});AJS.$(avatarPicker.imageEditor).bind(JIRA.AvatarPicker.ImageEditor.DISMISSED,function(){userAvatarDialog._positionInCenter();userAvatarDialog.getButtonsContainer().show()});AJS.$(avatarPicker.imageEditor).bind(JIRA.AvatarPicker.ImageEditor.LOADED,function(){userAvatarDialog._positionInCenter();userAvatarDialog.getButtonsContainer().hide()});avatarPicker.render(function(content){$dialogWrapper.append(content);ready($dialogWrapper)})}});userAvatarDialog._focusFirstField=function(){}};jQuery(function(){JIRA.createUserAvatarPickerDialog({trigger:"#user_avatar_image",username:jQuery("#avatar-owner-id").text(),defaultAvatarId:jQuery("#default-avatar-id").text()})});
(function(){AJS.namespace("JIRA.GravatarUtil");JIRA.GravatarUtil.showGravatarHelp=function(data){if(typeof (data)!=="undefined"&&typeof (data.entry)!=="undefined"){AJS.$(".gravatar-signup-text").addClass("hidden");AJS.$(".gravatar-login-text").removeClass("hidden")}};var displayGravatarHelp=function(){var gravatarJsonUrl=AJS.$("#gravatar_json_url");if(gravatarJsonUrl.length){AJS.$.ajax(gravatarJsonUrl.val(),{dataType:"jsonp",success:JIRA.GravatarUtil.showGravatarHelp})}};AJS.$(document).ready(function(){if(AJS.$("#gravatar_help_params")){displayGravatarHelp()}})}());
// This file was automatically generated from AvatarPicker.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.AvatarPicker == 'undefined') { JIRA.Templates.AvatarPicker = {}; }


JIRA.Templates.AvatarPicker.picker = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<form class="jira-avatar-upload-form" action="#"><input name="id" value="10000" type="hidden" ><input name="pid" value="10000" type="hidden" ><div class="field-group"><label>', soy.$$escapeHtml("Upload a new avatar"), '</label><input type="file" class="ignore-inline-attach" name="avatar" id="jira-avatar-uploader" /><div class="error"></div></div></form><div class="form-body"><ul class="jira-avatars">');
  var avatarList6 = opt_data.avatars.system;
  var avatarListLen6 = avatarList6.length;
  for (var avatarIndex6 = 0; avatarIndex6 < avatarListLen6; avatarIndex6++) {
    var avatarData6 = avatarList6[avatarIndex6];
    output.append('<li class="jira-avatar jira-system-avatar ', (avatarData6.isSelected) ? 'jira-selected-avatar' : '', '" title="Select this Avatar" data-id="', soy.$$escapeHtml(avatarData6.id), '"><span><img id="avatar-', soy.$$escapeHtml(avatarData6.id), '" data-id="', soy.$$escapeHtml(avatarData6.id), '" src="', soy.$$escapeHtml(avatarData6.src), '" width="', soy.$$escapeHtml(avatarData6.width), '" height="', soy.$$escapeHtml(avatarData6.height), '" /></span></li>');
  }
  var avatarList25 = opt_data.avatars.custom;
  var avatarListLen25 = avatarList25.length;
  for (var avatarIndex25 = 0; avatarIndex25 < avatarListLen25; avatarIndex25++) {
    var avatarData25 = avatarList25[avatarIndex25];
    output.append('<li class="jira-avatar jira-custom-avatar ', (avatarData25.isSelected) ? 'jira-selected-avatar' : '', '" title="Select this avatar" data-id="', soy.$$escapeHtml(avatarData25.id), '"><span><img id="avatar-', soy.$$escapeHtml(avatarData25.id), '" data-id="', soy.$$escapeHtml(avatarData25.id), '" src="', soy.$$escapeHtml(avatarData25.src), '" width="', soy.$$escapeHtml(avatarData25.width), '" height="', soy.$$escapeHtml(avatarData25.height), '" /></span><span class="jira-delete-avatar" data-id="', soy.$$escapeHtml(avatarData25.id), '" title="', soy.$$escapeHtml("Delete this Avatar"), '">Delete</span></li>');
  }
  output.append('</ul></div>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.AvatarPicker.imageEditor = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<form id="avataror" class="jira-avatar-cropper-form aui" action="/jira/secure/project/AvatarPicker.jspa"><input type="hidden" name="cropperOffsetX" id="avatar-offsetX" value="', soy.$$escapeHtml(opt_data.cropperOffsetX), '"><input type="hidden" name="cropperOffsetY" id="avatar-offsetY" value="', soy.$$escapeHtml(opt_data.cropperOffsetY), '"><input type="hidden" name="cropperWidth" id="avatar-width"  value="', soy.$$escapeHtml(opt_data.cropperWidth), '"><div class="jira-avatar-cropper-header"><p>', soy.$$escapeHtml("Please select which part of the uploaded image you wish to use as the avatar."), '</p></div><div class="form-body"><div class="avataror"><img src="', soy.$$escapeHtml(opt_data.url), '" height="300" /></div></div><div class="form-footer buttons-container"><div class="buttons"><input type="submit" class="aui-button" value="', soy.$$escapeHtml("Confirm"), '"><a class="cancel aui-button-cancel" href="#">', soy.$$escapeHtml("Cancel"), '</a></div></div></form>');
  return opt_sb ? '' : output.toString();
};

(function(){var AvatarPickerContentRetriever=AJS.ContentRetriever.extend({init:function(avatarPicker){this.avatarPicker=avatarPicker},content:function(finished){this.avatarPicker.render(function(el){finished(jQuery("<div />").html(el))})},cache:function(){return false},isLocked:function(){},startingRequest:function(){},finishedRequest:function(){}});var InlineAvatarPicker=AJS.InlineLayer.extend({init:function(options){var instance=this;this.avatarPicker=JIRA.AvatarPicker.createProjectAvatarPicker({projectId:options.projectId,projectKey:options.projectKey,defaultAvatarId:options.defaultAvatarId,select:function(avatar,src,implicit){if(options.select){options.select.apply(this,arguments)}if(!implicit){instance.hide()}instance.$offsetTarget.attr("src",src);instance.$offsetTarget.trigger("AvatarSelected")}});options.contentRetriever=new AvatarPickerContentRetriever(this.avatarPicker);jQuery(this.avatarPicker.imageEditor).bind(JIRA.AvatarPicker.ImageEditor.LOADED,function(){instance.setWidth(instance.layer().attr("scrollWidth"))});this._super(options);var $triggerImg=this.offsetTarget();var $triggerContainer=jQuery("<span class='jira-avatar-picker-trigger'></span>");$triggerContainer.insertBefore($triggerImg).append($triggerImg);this._assignEvents("offsetTarget",$triggerContainer)},_events:{offsetTarget:{click:function(e){this.show()}}}});function initProjectAvatarPicker(ctx){var triggerImg=jQuery("#project_avatar_image",ctx);JIRA.createProjectAvatarPickerDialog({trigger:triggerImg,projectId:jQuery(ctx).find("#avatar-owner-id").text(),projectKey:jQuery(ctx).find("#avatar-owner-key").text(),defaultAvatarId:jQuery(ctx).find("#default-avatar-id").text(),select:function(avatar,src){triggerImg.attr("src",src)}})}function initProjectInlineAvatarPicker(ctx){var $triggerImg=jQuery(".jira-inline-avatar-picker-trigger",ctx);if($triggerImg.length){new InlineAvatarPicker({offsetTarget:$triggerImg,projectId:jQuery(ctx).find("#avatar-owner-id").text(),projectKey:jQuery(ctx).find("#avatar-owner-key").text(),defaultAvatarId:jQuery(ctx).find("#default-avatar-id").text(),alignment:AJS.LEFT,width:420,allowDownsize:true})}}JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(e,context,reason){if(reason!==JIRA.CONTENT_ADDED_REASON.panelRefreshed){initProjectAvatarPicker(context);initProjectInlineAvatarPicker(context)}})})();
JIRA.Forms.CreateIssueModel=JIRA.Forms.Model.extend({init:function(A){A=A||{};
this.userFieldsResource=contextPath+"/rest/quickedit/1.0/userpreferences/create";
this._hasRetainFeature=true;
this._hasVisibilityFeature=true;
this.retainedFields=[];
this.initIssueType=A.issueType;
this.initProjectId=A.projectId;
this.parentIssueId=A.parentIssueId
},getParentIssueId:function(){return this.parentIssueId
},isInMultipleMode:function(){return this.multipleMode
},setIsMultipleMode:function(A){this.multipleMode=A
},getActiveFieldIds:function(){var A=this,B=jQuery.Deferred(),C=[];
this.getUserFields().done(function(D){jQuery.each(D,function(F,E){C.push(E)
});
A.getRequiredFields().done(function(E){jQuery.each(E,function(G,F){if(jQuery.inArray(F.id,C)===-1){C.push(F.id)
}});
B.resolve(C)
})
});
return B.promise()
},hasVisibilityFeature:function(A){return !A.required
},getFieldsResource:function(){var A=contextPath+"/secure/QuickCreateIssue!default.jspa?decorator=none";
if(this.parentIssueId){return A+"&parentIssueId="+this.parentIssueId
}if(this.initIssueType){A=A+"&issuetype="+this.initIssueType;
delete this.initIssueType
}if(this.initProjectId){A=A+"&pid="+this.initProjectId;
delete this.initProjectId
}return A
},addFieldToRetainValue:function(B,A){if(A||B!=="summary"){this._super(B)
}},getRequiredFields:function(){var A=jQuery.Deferred(),B=[];
this.getFields().done(function(C){jQuery.each(C,function(D,E){if(E.required){B.push(E)
}});
A.resolve(B)
});
return A.promise()
},getConfigurableFields:function(){var A=jQuery.Deferred(),B=[];
this.getFields().done(function(C){jQuery.each(C,function(D,E){if(E.id!=="project"&&E.id!=="issuetype"){B.push(E)
}});
A.resolve(B)
});
return A.promise()
},getIssueSetupFields:function(){var A=jQuery.Deferred(),B=[];
this.getFields().done(function(C){jQuery.each(C,function(D,E){if(E.id==="project"||E.id==="issuetype"){B.push(E)
}});
A.resolve(B)
});
return A.promise()
}});
JIRA.Forms.CreateIssueHelper=Class.extend({init:function(A){this.form=A
},handleSubmitSuccess:function(D){function C(E,G,F){var H='<a href="'+F+'">'+E+" - "+AJS.escapeHTML(G)+"</a>";
return AJS.format("Issue {0} has been successfully created",H)
}var A=this,B=this.form.$element.find("#summary").val();
D.summary=B;
this.form.triggerEvent("submitted",[D,this]);
this.form.triggerEvent("issueCreated",[D,this],true);
if(A.form.model.isInMultipleMode()){this.form.render().done(function(){var E=C(D.issueKey,B,contextPath+"/browse/"+D.issueKey);
JIRA.applySuccessMessageToForm(A.form.getForm(),E)
})
}else{this.form.triggerEvent("sessionComplete")
}},getCreateAnotherCheckbox:function(){return this.form.$element.find("#qf-create-another")
},isInMultipleMode:function(){return this.getCreateAnotherCheckbox().is(":checked")
},getProjectField:function(){return this.form.$element.find(".issue-setup-fields #project")
},getIssueTypeField:function(){return this.form.$element.find(".issue-setup-fields #issuetype")
},serializeForToggle:function(){if(!this.form.model.hasRetainFeature()){return this.form.getForm().serialize()
}var D=this.form.model.prevActiveFields||[];
var I=this.form.getForm().serializeArray();
var C=this.form.getActiveFieldIds();
var E=jQuery.grep(I,function(J){return jQuery.inArray(J.name,C)!==-1
});
var A=jQuery.grep(D,function(J){return jQuery.inArray(J.name,C)===-1
});
var B=jQuery.map(A,function(J){return J.name
});
var F=jQuery.merge(E,A);
var G=jQuery.merge(C,B);
this.form.model.prevActiveFields=F;
var H=jQuery.merge([{name:"retainValues",value:true}],F);
jQuery.each(I,function(J,K){if(K.name==="pid"||K.name==="issuetype"){H.push(K)
}});
jQuery.each(G,function(J,K){H.push({name:"fieldsToRetain",value:K})
});
return jQuery.param(H)
},setIssueType:function(){var A=this,B=this.serializeForToggle();
this.form.invalidateFieldsCache();
this.form.disable();
this.form.model.refresh(B).done(function(){A.form.render();
A.form.enable()
})
},setProjectId:function(){var A=this,B=this.serializeForToggle();
this.form.invalidateFieldsCache();
this.form.disable();
this.form.model.refresh(B).done(function(){A.form.render();
A.form.enable()
})
},decorate:function(){var A=this;
this.getProjectField().change(function(){A.setProjectId(this.value)
});
this.getIssueTypeField().change(function(){A.setIssueType(this.value)
});
this.getCreateAnotherCheckbox().change(function(){A.form.model.setIsMultipleMode(this.checked)
})
}});
JIRA.Forms.CreateIssueError=JIRA.Forms.Error.extend({_render:function(A){return jQuery(JIRA.Templates.Issue.createIssueError({errorHtml:A,useLegacyDecorator:JIRA.useLegacyDecorator()}))
}});
JIRA.Forms.UnconfigurableCreateIssueForm=JIRA.Forms.AbstractUnconfigurableForm.extend({init:function(A){this._serialization={};
this.globalEventNamespaces=A.globalEventNamespaces||[];
this.model=A.model;
this.helper=new JIRA.Forms.CreateIssueHelper(this);
this.title=A.title;
this.action=contextPath+"/secure/QuickCreateIssue.jspa?decorator=none";
this.$element=jQuery("<div class='qf-unconfigurable-form' />")
},handleSubmitError:function(A,B){this.helper.handleSubmitError(A,B)
},handleSubmitSuccess:function(A){this.helper.handleSubmitSuccess(A)
},_render:function(){var B=jQuery.Deferred(),A=this;
this.getFieldsHtml().done(function(C){A.model.getIssueSetupFields().done(function(F){var E=JIRA.Templates.Issue.createIssueForm({issueSetupFields:F,fieldsHtml:C,parentIssueId:A.model.getParentIssueId(),atlToken:A.model.getAtlToken(),title:A.title,multipleMode:A.model.isInMultipleMode(),useLegacyDecorator:JIRA.useLegacyDecorator(),showFieldConfigurationToolBar:!JIRA.Users.LoggedInUser.isAnonymous(),modifierKey:AJS.Navigator.modifierKey()}),D=JIRA.extractScripts(E);
A.$element.empty().append(D.html);
A.helper.decorate();
B.resolveWith(A,[A.$element,D.scripts])
})
});
return B.promise()
}});
JIRA.Forms.ConfigurableCreateIssueForm=JIRA.Forms.AbstractConfigurableForm.extend({init:function(A){this.model=A.model;
this.helper=new JIRA.Forms.CreateIssueHelper(this);
this.globalEventNamespaces=A.globalEventNamespaces||[];
this.issueId=A.issueId;
this.title=A.title;
this._serialization={};
this.action=contextPath+"/secure/QuickCreateIssue.jspa?decorator=none";
this.$element=jQuery("<div />").addClass("qf-form qf-configurable-form")
},handleSubmitSuccess:function(A){return this.helper.handleSubmitSuccess(A)
},handleSubmitError:function(A,B){this.helper.handleSubmitError(A,B)
},_render:function(){var B=jQuery.Deferred(),A=this;
A.model.getIssueSetupFields().done(function(D){var C=JIRA.Templates.Issue.createIssueForm({issueSetupFields:D,atlToken:A.model.getAtlToken(),isConfigurable:true,title:A.title,parentIssueId:A.model.getParentIssueId(),useLegacyDecorator:JIRA.useLegacyDecorator(),multipleMode:A.model.isInMultipleMode(),showFieldConfigurationToolBar:!JIRA.Users.LoggedInUser.isAnonymous(),modifierKey:AJS.Navigator.modifierKey()});
A.$element.html(C);
A.helper.decorate();
A.renderFormContents().done(function(F,E){B.resolveWith(A,[A.$element,E])
})
});
return B.promise()
}});
JIRA.Forms.createCreateIssueForm=function(A){A=A||{};
return new JIRA.Forms.Container(function(){A.globalEventNamespaces=A.globalEventNamespaces||["QuickCreateIssue"];
var E="Create Issue",B=new JIRA.Forms.CreateIssueModel({pid:A.pid,issueType:A.issueType}),D=new JIRA.Forms.ConfigurableCreateIssueForm({model:B,title:E,globalEventNamespaces:A.globalEventNamespaces}),C=new JIRA.Forms.UnconfigurableCreateIssueForm({model:B,title:E,globalEventNamespaces:A.globalEventNamespaces});
return{globalEventNamespaces:A.globalEventNamespaces,model:B,errorHandler:new JIRA.Forms.CreateIssueError(),configurableForm:D,unconfigurableForm:C}
})
};
JIRA.Forms.createSubtaskForm=function(){function A(B){return B.parentIssueId||JIRA.Issue.getIssueId()||JIRA.IssueNavigator.getSelectedIssueId()
}return function(B){B=B||{};
return new JIRA.Forms.Container(function(){B.globalEventNamespaces=B.globalEventNamespaces||["QuickCreateSubtask"];
var F=A(B),G=JIRA.Dialog.getIssueActionTitle("Create Subtask"),C=new JIRA.Forms.CreateIssueModel({parentIssueId:F,pid:B.pid,issueType:B.issueType}),E=new JIRA.Forms.ConfigurableCreateIssueForm({model:C,title:G,globalEventNamespaces:B.globalEventNamespaces}),D=new JIRA.Forms.UnconfigurableCreateIssueForm({model:C,title:G,globalEventNamespaces:B.globalEventNamespaces});
return{globalEventNamespaces:B.globalEventNamespaces,model:C,errorHandler:new JIRA.Forms.CreateIssueError(),configurableForm:E,unconfigurableForm:D}
})
}
}();
jQuery(function(){var A;
if(!JIRA.Version.isGreaterThanOrEqualTo("5.0")){return 
}JIRA.Forms.createCreateIssueForm().asDialog({trigger:".create-issue",id:"create-issue-dialog",windowTitle:"Create Issue"});
jQuery("#create-issue .create-issue-type").each(function(){var B=jQuery(this);
JIRA.Forms.createCreateIssueForm({pid:B.attr("data-pid"),issueType:B.attr("data-issue-type")}).asDialog({windowTitle:"Create Issue",trigger:this,id:"create-issue-dialog"})
});
A=document.getElementById("stqc_show");
if(A){A.onclick=null
}JIRA.Forms.createSubtaskForm().asDialog({windowTitle:function(){return JIRA.Dialog.getIssueActionTitle("Create Subtask")
},trigger:".issueaction-create-subtask",id:"create-subtask-dialog"})
});
// This file was automatically generated from issue.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.Issue == 'undefined') { JIRA.Templates.Issue = {}; }


JIRA.Templates.Issue.editIssueError = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<h2>', soy.$$escapeHtml("Edit Issue"), '</h2><div class="', (opt_data.useLegacyDecorator) ? 'content-body' : 'form-body', '">', opt_data.errorHtml, '</div>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issue.editIssueForm = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<form action="#" name="jiraform" class="aui"><h2>', (opt_data.showFieldConfigurationToolBar) ? '<div class="qf-form-operations aui-toolbar"><div class="toolbar-split toolbar-split-right"><div class="toolbar-group"><span class="toolbar-item"><a href="#" class="toolbar-trigger" id="qf-field-picker-trigger"><span class="icon icon-tools"></span>' + soy.$$escapeHtml("Configure Fields") + '<span class="icon drop-menu"></span></a></span></div></div></div>' : '', opt_data.title, '</h2><div class="', (opt_data.useLegacyDecorator) ? 'content-body' : 'form-body', '"><input type="hidden" name="id" value="', soy.$$escapeHtml(opt_data.issueId), '" /><input type="hidden" name="atl_token" value="', soy.$$escapeHtml(opt_data.atlToken), '" /><div class="content">', (opt_data.fieldsHtml) ? opt_data.fieldsHtml : '', (opt_data.commentField) ? opt_data.commentField.editHtml : '', '<!-- fields inserted here via javascript --></div></div><div class="buttons-container ', (opt_data.useLegacyDecorator) ? 'content-footer' : 'form-footer', '"><div class="buttons"><input accesskey="', soy.$$escapeHtml("s"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to submit this form","s",opt_data.modifierKey)), '" class="button" id="edit-issue-submit" name="Edit" type="submit" value="', soy.$$escapeHtml("Update"), '" /><a href="#" accesskey="', soy.$$escapeHtml("`"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to cancel","`",opt_data.modifierKey)), '" class="cancel">', soy.$$escapeHtml("Cancel"), '</a></div></div></form>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issue.issueFields = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  if (opt_data.hasTabs) {
    output.append('<div class="aui-tabs horizontal-tabs" id="horizontal"><ul class="tabs-menu">');
    var tabList66 = opt_data.tabs;
    var tabListLen66 = tabList66.length;
    for (var tabIndex66 = 0; tabIndex66 < tabListLen66; tabIndex66++) {
      var tabData66 = tabList66[tabIndex66];
      output.append((tabData66) ? '<li class="menu-item ' + ((tabData66.isFirst) ? 'first active-tab' : '') + ' "><a href="#tab-' + soy.$$escapeHtml(tabData66.position) + '" ><strong>' + soy.$$escapeHtml(tabData66.label) + '</strong></a></li>' : '');
    }
    output.append('</ul>');
    var tabList80 = opt_data.tabs;
    var tabListLen80 = tabList80.length;
    for (var tabIndex80 = 0; tabIndex80 < tabListLen80; tabIndex80++) {
      var tabData80 = tabList80[tabIndex80];
      if (tabData80) {
        output.append('<div class="tabs-pane ', (tabData80.isFirst) ? 'active-pane' : '', '" id="tab-', soy.$$escapeHtml(tabData80.position), '">');
        var fieldList90 = tabData80.fields;
        var fieldListLen90 = fieldList90.length;
        for (var fieldIndex90 = 0; fieldIndex90 < fieldListLen90; fieldIndex90++) {
          var fieldData90 = fieldList90[fieldIndex90];
          output.append((fieldData90.editHtml) ? fieldData90.editHtml : '');
        }
        output.append('</div>');
      }
    }
    output.append('</div>');
  } else {
    var fieldList100 = opt_data.fields;
    var fieldListLen100 = fieldList100.length;
    for (var fieldIndex100 = 0; fieldIndex100 < fieldListLen100; fieldIndex100++) {
      var fieldData100 = fieldList100[fieldIndex100];
      output.append((fieldData100.editHtml) ? fieldData100.editHtml : '');
    }
  }
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issue.createIssueForm = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<form name="jiraform" action="#" class="aui"><h2>', (opt_data.showFieldConfigurationToolBar) ? '<div class="qf-form-operations aui-toolbar"><div class="toolbar-split toolbar-split-right"><div class="toolbar-group"><span class="toolbar-item"><a href="#" class="toolbar-trigger" id="qf-field-picker-trigger"><span class="icon icon-tools"></span>' + soy.$$escapeHtml("Configure Fields") + '<span class="icon drop-menu"></span></a></span></div></div></div>' : '', soy.$$escapeHtml(opt_data.title), '</h2><div class="', (opt_data.useLegacyDecorator) ? 'content-body' : 'form-body', '">');
  if (opt_data.issueSetupFields) {
    output.append('<div class="issue-setup-fields">');
    var fieldList124 = opt_data.issueSetupFields;
    var fieldListLen124 = fieldList124.length;
    for (var fieldIndex124 = 0; fieldIndex124 < fieldListLen124; fieldIndex124++) {
      var fieldData124 = fieldList124[fieldIndex124];
      output.append('<div class="qf-field qf-field-', soy.$$escapeHtml(fieldData124.id), ' qf-required">', fieldData124.editHtml, '</div>');
    }
    output.append('</div>');
  }
  output.append((opt_data.parentIssueId) ? '<input type="hidden" name="parentIssueId" value="' + soy.$$escapeHtml(opt_data.parentIssueId) + '" />' : '', '<input type="hidden" name="atl_token" value="', soy.$$escapeHtml(opt_data.atlToken), '" /><div class="content">', (opt_data.fieldsHtml) ? opt_data.fieldsHtml : '', '<!-- fields inserted here via javascript --></div></div><div class="buttons-container ', (opt_data.useLegacyDecorator) ? 'content-footer' : 'form-footer', '"><div class="buttons"><label for="qf-create-another" class="qf-create-another"><input id="qf-create-another" type="checkbox" ', (opt_data.multipleMode) ? 'checked="checked"' : '', ' />', soy.$$escapeHtml("Create another"), '</label><input accesskey="', soy.$$escapeHtml("s"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to submit this form","s",opt_data.modifierKey)), '" class="button" id="create-issue-submit" name="Edit" type="submit" value="', soy.$$escapeHtml("Create"), '" /><a href="#" accesskey="', soy.$$escapeHtml("`"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to cancel","`",opt_data.modifierKey)), '" class="cancel">', soy.$$escapeHtml("Cancel"), '</a></div></div></form>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issue.createIssueError = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<h2>', soy.$$escapeHtml("Create Issue"), '</h2><div class="', (opt_data.useLegacyDecorator) ? 'content-body' : 'form-footer', '">', opt_data.errorHtml, '</div>');
  return opt_sb ? '' : output.toString();
};

(function(A){JIRA.bind(JIRA.Events.NEW_PAGE_ADDED,function(C,B){A("#consolation-login-link").click(function(){AJS.EventQueue&&AJS.EventQueue.push({name:"invitationsignupconsolationlogin",properties:{}})
})
})
})(AJS.$);
tempobar=(function(h){var v='<span class="issue"><span class="image"><a><img width="16" height="16" border="0" align="absmiddle"></a></span><span class="key"><a></a></span><span class="summary"><a></a></span></span>';var d=contextPath+"/rest/api/2/issue/";var t=contextPath+"/secure/TempoAddHours!default.jspa";var m=1000;var w=null;var o=null;var f="Tempo.TRACKER_ISTRACKING";var b="Tempo.TRACKER_PREV_DURATION";var x="Tempo.TRACKER_CYCLE_START";var z="Tempo.TRACKER_INITIAL_START";var A="Tempo.TRACKER_ISSUEKEY";var l="Tempo.TRACKER_PAUSED";var n="Tempo.SHOW_TRACKER";var y;function c(){return(AJS.Cookie.read(f)=="true")}function j(){return(AJS.Cookie.read(l)=="true")}function s(){return(AJS.Cookie.read(n)=="true")}function q(){return Number(AJS.Cookie.read(b))+(new Date().getTime()-new Date(AJS.Cookie.read(x)).getTime())/1000}function a(F,G){if(F==null||F==undefined||F<=0){return"0m"}var E=Math.round(F);var H=E%60;var D;if(G){D=Math.floor(E/60)%60}else{D=Math.round(E/60)%60}var C=Math.floor(E/3600);var I="";if(C>0){I=I+C+"h"}if(D>=0){if(C>0){I=I+" "}I=I+D+"m"}if(G&&H){I=I+" "+H+"s"}return I.toString()}function k(){if(s()){var F=w.find("span.clock");F.show().text(a(p(),true));var C=AJS.Cookie.read(A);if(C&&!y){e(C)}else{if(C&&y){var D=w.find("span.issue");var E=D.find("img");E.attr("src",y.iconUrl);D.find("span a").attr("href",y.href);D.find("span.key a").text(y.key);D.find("span.summary a").text(y.summary);D.show()}}w.show()}if(c()&&!j()){clearTimeout(o);o=setTimeout(function(){k()},m)}}function p(){if(j()){var C=Number(AJS.Cookie.read(b));if(C==null||C==undefined){C=0}return C}return q()}function e(C){var D=d+C;h.get(D,function(E){y={id:E.id,key:E.key,iconUrl:E.fields.issuetype.iconUrl,href:contextPath+"/browse/"+E.key,summary:E.fields.summary};k()})}function u(){if(AJS.params.loggedInUser==""){return}var F=h('<div id="tempo-bar"><span class="tempo-bar-logo">TEMPO</span></div>').hide();var J=h('<a href="#" id="tempo-bar-tracker"></a>');J.appendTo(F);var C=h("<a>",{id:"tempo-bar-close",href:contextPath+"/secure/TempoTrackerConfirmation!default.jspa?returnUrl="+document.URL,"class":"tempoaction-open-dialog-form",text:"Close Tracker",title:"Close Tracker"});C.bind("click",function(){if(!c()){B();F.hide();return false}return true});C.appendTo(F);var I=h('<ul class="action-buttons ops aui-buttons"></ul>');var E=h("<a>",{href:"#","class":"play button aui-button first last",text:"Start Tracker",title:"Start Tracker"});E.prepend('<span class="icon"></span>');var H=h("<a>",{href:"#","class":"pause button aui-button first",text:"Pause Tracker",title:"Pause Tracker"});H.prepend('<span class="icon"></span>');var K=h("<a>",{href:"#","class":"stop issueaction-tempo-add-hours-on-issue button aui-button last",text:"Stop Tracker",title:"Stop Tracker"});K.prepend('<span class="icon"></span>');I.append(h("<li>").append(E));I.append(h("<li>").append(H));I.append(h("<li>").append(K));E.bind("click",function(){if(!c()){AJS.Cookie.save(f,"true");AJS.Cookie.save(z,new Date());AJS.Cookie.save(x,new Date());AJS.Cookie.save(b,"0");i();k()}else{AJS.Cookie.save(x,new Date());AJS.Cookie.erase(l);k()}H.parent().show();E.parent().hide();K.parent().show()});H.bind("click",function(){H.parent().hide();E.removeClass("last").parent().show();if(c()){AJS.Cookie.save(b,q());AJS.Cookie.save(l,"true")}});K.bind("click",function(){if(c()){clearTimeout(o);var M=new Date(AJS.Cookie.read(z));var N=t+"?tracker=true&systemTimeStamp="+M.getTime();k();var L=w.find("span.clock");if(AJS.Cookie.read(A)!=undefined){N+="&key="+AJS.Cookie.read(A)}K.attr("href",N+"&time="+a(p(),false));return true}return false});I.appendTo(F);var D=h('<span class="clock"></span>').hide();D.appendTo(F);var G=h(v).hide();G.appendTo(F);F.appendTo("body");h("a.tempo-bar-show").click(function(){AJS.Cookie.save(n,"true");k();g();return false});h("a.tempo-bar-start").live("click",function(){i(h(this).data("issuekey"));if(c()){k()}else{AJS.Cookie.save(n,"true");E.trigger("click")}g();return false});w=F;if(c()&&!j()){H.parent().show();E.parent().hide()}else{H.parent().hide();E.removeClass("last").parent().show()}if(!c()){K.parent().hide();E.addClass("last")}k()}function g(){h(document).click()}function i(C){if(!C){C=jira.app.issue.getIssueKey()}if(C){AJS.Cookie.save(A,C)}y=null}function B(){AJS.Cookie.erase(n);r()}function r(){AJS.Cookie.erase(f);AJS.Cookie.erase(z);AJS.Cookie.erase(x);AJS.Cookie.erase(b);AJS.Cookie.erase(A);AJS.Cookie.erase(l)}return{init:u,clearTracker:B,stopTracker:r}})(jQuery);jQuery(function(a){tempobar.init()});
(function () {
    var $hiddenImg = AJS.$("<img>"),
        $iconUrlInput,
        $urlInput,
        faviconUrl,
        throbberTimeoutId;

    $hiddenImg.load(function() {
        $iconUrlInput.val(faviconUrl);
        $urlInput.css("background-image", 'url("' + faviconUrl + '")');

        clearTimeout(throbberTimeoutId);
        $urlInput.removeClass("loading");
    });
    $hiddenImg.error(function() {
        clearTimeout(throbberTimeoutId);
        $urlInput.removeClass("loading");
    });

    function init(context) {
        $iconUrlInput = AJS.$("#web-link-icon-url", context);
        $urlInput = AJS.$("#web-link-url", context).bind("change", fetchFavicon);

        if ($iconUrlInput.val()) {
            $urlInput.css("background-image", "url(" + $iconUrlInput.val() + ")");
        }
    }

    function fetchFavicon() {
        // Initialise state
        $hiddenImg.attr("src", '');
        $iconUrlInput.val('');
        $urlInput.css("background-image", '');
        faviconUrl = parseFaviconUrl($urlInput.val());

        if (!faviconUrl) {
            return;
        }

        /**
         * IE specific hack: For some reason I cannot change the class inside event handler for the event source.
         */
        setTimeout(function() { $urlInput.addClass("loading"); }, 0);
        throbberTimeoutId = setTimeout(function() { $urlInput.removeClass("loading"); }, 3000);

        $hiddenImg.attr("src", faviconUrl);
    }

    function parseFaviconUrl(url) {
        var hostUrl = url.match(/^([^/]*\/\/[^/]+)/)[1];

        if (!hostUrl) {
            return;
        }

        return hostUrl + "/favicon.ico"
    }

    JIRA.bind(JIRA.Events.NEW_PAGE_ADDED, function (e, context) {
        init(context);
    });
})();
/**
 * Initialises OAuth authentication for Confluence Application Links. Requires the following elements:
 * <div class="issue-link-applinks-authentication-message"></div>
 */
(function ($) {

    var settings = {
        getCurrentAppId: function (context) {
            return $("#issue-link-confluence-app-id", context).val();
        },
        shouldExecute: function (context) {
            return $("#confluence-page-link", context).length !== 0;
        }
    };

    JIRA.bind(JIRA.Events.NEW_PAGE_ADDED, function (e, context) {
        IssueLinkAppLinks.init(settings, context);
    });

})(AJS.$);
AJS.$(function ($) {
    var confluenceSearchDialog =  new JIRA.FormDialog({
        id: "confluence-page-search-dialog",
        trigger: "#confluence-page-link .confluence-search-trigger",
        widthClass: "large",
        height: "565px",
        content: function (render) {
            JIRA.SmartAjax.makeRequest({
                url: contextPath + "/rest/confluenceIssueLink/1/confluence/applink",
                complete: function (xhr, textStatus, smartAjaxResult) {
                    var $dialogWrapper;
                    if (smartAjaxResult.successful) {
                        var appLinks = smartAjaxResult.data.applicationLinks;
                        var content = JIRA.Templates.ConfluencePageSearch.result({appLinks: appLinks});
                        $dialogWrapper = $(content);

                        initAppLinks($dialogWrapper).done(function (context, helper) {
                            initSearchDialog($dialogWrapper, helper);
                            render($dialogWrapper);
                            $("#link-search-text", $dialogWrapper).focus();
                        });
                    } else {
                        AJS.messages.error("#search-results-table", {
                            body: "The JIRA server could not be contacted.  This may be a temporary glitch or the server may be down.",
                            closeable: false
                        });
                        render();
                    }
                }
            });
        },
        submitHandler: function(e, callback){
            e.preventDefault();
            $("#search-panel-button").click().removeAttr("disabled");
            callback();
        }
    });

    function initSearchDialog($dialog, helper) {
        // Bind the select drop-down
        $("#confluence-app-link", $dialog).change(function () {
            var authenticationRequired = helper.selectServer($(this).val()).authenticationRequired;
            if (!authenticationRequired) {
                populateSpaces($dialog, $(this).val(), helper);
            }
            $("#search-results-table", $dialog).empty();

            // Any previous errors are not relevant to our new selection
            setSearchControlsEnabled(true, $dialog);
        });

        // Bind the search button
        $("#search-panel-button", $dialog).click(function () {
            $("#search-results-table", $dialog).empty();
            var searchText = $("#link-search-text", $dialog).val();
            searchText = $.trim(searchText);
            if (searchText) {
                doSearch(searchText, $dialog);
            } else {
                AJS.messages.info("#search-results-table", {
                    body: "Please enter search value.",
                    closeable: false
                });
            }

            return false;
        });
    }

    var spaceAjaxId = 0;
    function populateSpaces($context, appId, helper) {
        $("select#search-panel-space", $context).html(JIRA.Templates.ConfluencePageSearch.allSpacesOption());
        var myAjaxId = ++spaceAjaxId;
        JIRA.SmartAjax.makeRequest({
            url: contextPath + "/rest/confluenceIssueLink/1/confluence/space?appId=" + appId,
            complete: function (xhr, textStatus, smartAjaxResult) {
                if (myAjaxId !== spaceAjaxId) {
                    return;
                }
                if (smartAjaxResult.successful) {
                    var spaces = smartAjaxResult.data.spaces;
                    $("select#search-panel-space", $context).html(JIRA.Templates.ConfluencePageSearch.spaceOptions({spaces: spaces}));
                } else {
                    if (smartAjaxResult.status === 401) {
                        helper.setAuthenticationRequired(appId, true);
                    } else {
                        // Since we have an error, prevent the user from submitting a search
                        setSearchControlsEnabled(false, $context);

                        var msg;
                        if (smartAjaxResult.status === 403) {
                            msg = "Content on the Confluence site could not be accessed because the Confluence server\'s \'Remote API\' feature is disabled. The Confluence system administrator must enable this \'Remote API\' feature for JIRA to successfully access this content.";
                        } else {
                            msg = "Unable to gather information from the selected Confluence instance.";
                        }
                        AJS.messages.error("#search-results-table", {
                            body: msg,
                            closeable: false
                        });
                    }
                }
            }
        });
    }

    function setSearchControlsEnabled(enabled, $context) {
        if (enabled) {
            $("#link-search-text", $context).removeAttr("disabled");
            $("#search-panel-space", $context).removeAttr("disabled");
            $("#search-panel-button", $context).removeAttr("disabled");
        } else {
            $("#link-search-text", $context).attr("disabled", "disabled");
            $("#search-panel-space", $context).attr("disabled", "disabled");
            $("#search-panel-button", $context).attr("disabled", "disabled");
        }
    }

    function setLoadingIconVisible(visible, $context) {
        $("#link-search-loading", $context).toggleClass("hidden", !visible);
    }

    function doSearch(searchText, $context) {
        setLoadingIconVisible(true, $context);
        var appLinkId = $("#confluence-app-link", $context).val();
        var spaceKey = $("#search-panel-space option:selected", $context).val();
        JIRA.SmartAjax.makeRequest({
            url: contextPath + "/rest/confluenceIssueLink/1/confluence/search?query=" + searchText + "&appId=" + appLinkId + "&spaceKey=" + spaceKey + "&maxResults=10",
            complete: function (xhr, textStatus, smartAjaxResult) {
                setLoadingIconVisible(false, $context);
                if (smartAjaxResult.successful) {
                    var results = smartAjaxResult.data.result;
                    var resultHtml = JIRA.Templates.ConfluencePageSearch.resultsTable({results: results});
                    $("#search-results-table", $context).html(resultHtml);
                } else {
                    // This replicates the JIRA.SmartAjax.buildSimpleErrorContent method, but we can't use that because
                    // it mentions a JIRA instance.
                    var msg;
                    if (smartAjaxResult.hasData) {
                        msg = "The JIRA server was contacted but has returned an error response. We are unsure of the result of this operation.";
                    } else {
                        msg = "The JIRA server could not be contacted.  This may be a temporary glitch or the server may be down.";
                    }
                    AJS.messages.error("#search-results-table", {
                        body: msg,
                        closeable: false
                    });
                }

                $("#confluence-searchresult tbody tr", $context).click(function () {
                    var linkUrl = $(this).children().first().data("url");
                    $("#confluence-page-url").val(linkUrl);

        ////        If we want to display the title in the 'description' area on the main dialog
        ////        var linkTitle = $(this).children().first().text();
        ////        $("#confluence-page-url").siblings(".description").text(linkTitle);

                    // Clear all error messages on the parent dialog, as we now have a newly selected URL
                    $("#link-issue-dialog .error").hide();

                    confluenceSearchDialog.hide();
                    $("#link-issue-dialog").show();
                    $("#confluence-page-url").focus().select();
                });
            }
        });
    }

    function initAppLinks($dialog) {
        var settings = {
            getCurrentAppId: function (context) {
                return $("#confluence-app-link", context).val();
            },
            shouldExecute: function (context) {
                return $("#confluence-app-link", context).length !== 0;
            },
            onAuthenticationSuccessCallback: function (context, currentAppId, helper) {
                populateSpaces(context, currentAppId, helper);
            }
        };

        return IssueLinkAppLinks.init(settings, $dialog).done(function (context, helper) {
            populateSpaces(context, settings.getCurrentAppId(context), helper);
        });
    }
});

// This file was automatically generated from searchresult.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.ConfluencePageSearch == 'undefined') { JIRA.Templates.ConfluencePageSearch = {}; }


JIRA.Templates.ConfluencePageSearch.result = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<h2>', soy.$$escapeHtml("Find a Confluence page"), '</h2><div class="aui-group"><form class="aui search-form" id="confluence-page-search-form" action="#" method="post"><fieldset><label for="confluence-app-link">', soy.$$escapeHtml("Server"), ':</label>');
  if (opt_data.appLinks.length == 1) {
    output.append('<span class="field-value">', soy.$$escapeHtml(opt_data.appLinks[0].name), '</span><input id="confluence-app-link" class="hidden" type="hidden" name="appId" value="', soy.$$escapeHtml(opt_data.appLinks[0].id), '"/>');
  } else {
    output.append('<select id="confluence-app-link" class="select" name="appId">');
    var appLinkList17 = opt_data.appLinks;
    var appLinkListLen17 = appLinkList17.length;
    for (var appLinkIndex17 = 0; appLinkIndex17 < appLinkListLen17; appLinkIndex17++) {
      var appLinkData17 = appLinkList17[appLinkIndex17];
      output.append('<option value="', soy.$$escapeHtml(appLinkData17.id), '">', soy.$$escapeHtml(appLinkData17.name), '</option>');
    }
    output.append('</select>');
  }
  output.append('</fieldset><div class="issue-link-applinks-authentication-message applinks-message-bar"></div><div class="hidden"><input class="issue-link-applinks-application-type" type="hidden" value="com.atlassian.applinks.api.application.confluence.ConfluenceApplicationType"/></div><div class="issue-link-oauth-toggle"><fieldset><label for="link-search-text" id="linkSearch-label">', soy.$$escapeHtml("Search"), ':</label><input id="link-search-text" type="text" tabindex="0" class="text" name="linkSearch" size="50"><select tabindex="0" class="search-space select" id="search-panel-space"><option value="">', soy.$$escapeHtml("All Spaces"), '</option></select><span class="buttons"><input type="submit" tabindex="0" class="button" id="search-panel-button" value="', soy.$$escapeHtml("Search"), '"></span><span id="link-search-loading" class="icon loading throbber hidden"/></fieldset></div></form><div class="message-panel hidden"></div><div id="search-results-table" class="data-table"></div></div><div class="buttons-container form-footer"><div class="buttons"><a accesskey="`" class="cancel" href="#" id="confluence-link-cancel" title="', soy.$$escapeHtml("Press Esc to close"), '">', soy.$$escapeHtml("Close"), '</a></div></div>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ConfluencePageSearch.resultsTable = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  if (opt_data.results.length > 0) {
    output.append('<table id="confluence-searchresult" class="aui"><thead><tr><th width="180px">', soy.$$escapeHtml("Title"), '</th><th width="550px">', soy.$$escapeHtml("Excerpt"), '</th></tr></thead><tbody>');
    var resultList44 = opt_data.results;
    var resultListLen44 = resultList44.length;
    for (var resultIndex44 = 0; resultIndex44 < resultListLen44; resultIndex44++) {
      var resultData44 = resultList44[resultIndex44];
      output.append('<tr title="', soy.$$escapeHtml(resultData44.title), '"><td class="title" data-url="', soy.$$escapeHtml(resultData44.url), '">', soy.$$escapeHtml(resultData44.title), '</td><td class="excerpt">', soy.$$escapeHtml(resultData44.excerpt), '</td></tr>');
    }
    output.append('</tbody></table>');
  } else {
    output.append('<div class="aui-message info"><span class="aui-icon icon-info"></span><p>', soy.$$escapeHtml("Search returned no results."), '</p></div>');
  }
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ConfluencePageSearch.spaceOptions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<option value="">', soy.$$escapeHtml("All Spaces"), '</option>');
  var spaceList64 = opt_data.spaces;
  var spaceListLen64 = spaceList64.length;
  for (var spaceIndex64 = 0; spaceIndex64 < spaceListLen64; spaceIndex64++) {
    var spaceData64 = spaceList64[spaceIndex64];
    output.append('<option value="', soy.$$escapeHtml(spaceData64.key), '">', soy.$$escapeHtml(spaceData64.name), '</option>');
  }
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ConfluencePageSearch.allSpacesOption = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<option value="">', soy.$$escapeHtml("All Spaces"), '</option><option value="" disabled="disabled">', soy.$$escapeHtml("Loading..."), '</option>');
  return opt_sb ? '' : output.toString();
};

// This file was automatically generated from whats-new.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.WhatsNew == 'undefined') { JIRA.Templates.WhatsNew = {}; }


JIRA.Templates.WhatsNew.whatsNewDialogPanel = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="whats-new-dialog-text"><div class="whats-new-throbber hidden"></div><div class="whats-new-timeout hidden"><div class="aui-message warning"><p class="title"><span class="aui-icon icon-warning"></span><strong>', soy.$$escapeHtml("Oops."), '</strong></p><p>', AJS.format("We\u2019re having trouble downloading the \x3ca target\x3d\x22_blank\x22 href\x3d\x22{0}\x22\x3eWhat\u2019s New content\x3c/a\x3e from the Atlassian website. This may be because you have a slow internet connection or that no internet connection is available.",opt_data.whatsNewFullLink), '</p></div></div></div><iframe id="whats-new-iframe" class="hidden" scrolling="no" frameborder="0" src="', soy.$$escapeHtml(opt_data.whatsNewHelpLink), '"></iframe>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.WhatsNew.whatsNewDialogTipPanel = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="dialog-tip"><input id="dont-show-whats-new" type="checkbox" name="dontshow"><label for="dont-show-whats-new" type="checkbox"><span class="checkbox-label">', soy.$$escapeHtml("Don\u2019t show again"), '</span></label>', (! opt_data.isOnDemand) ? '<span>' + soy.$$escapeHtml("(Access from \u2018Profile\u2019 menu)") + '</span>' : '', '</div>');
  return opt_sb ? '' : output.toString();
};

Raphael.spinner=function(J,F,H){var N=H||"#fff",M=F*13/60,Q=F*35/60,O=F,D=O+M,C=O+M,L=Raphael(J,O*2+M*2,O*2+M*2),K=[],E=[],S=2*Math.PI/12,I={stroke:N,"stroke-width":M,"stroke-linecap":"round"};
for(var P=0;
P<12;
P++){var G=S*P-Math.PI/2,B=Math.cos(G),A=Math.sin(G);
E[P]=P/12;
K[P]=L.path([["M",D+Q*B,C+Q*A],["L",D+O*B,C+O*A]]).attr(I)
}var R;
(function T(){E.unshift(E.pop());
for(var U=0;
U<12;
U++){K[U].attr("opacity",E[U])
}L.safari();
R=setTimeout(T,80)
})();
return function(){clearTimeout(R);
L.remove()
}
};
var dim=AJS.dim;
AJS.dim=function(){try{dim.apply(this,arguments)
}catch(A){}};
AJS.toInit(function(L){var I=L("#whats-new-menu-link"),E,C,A,M,H,G,K=function(P){var O=!L(this).attr("checked");
var N=contextPath+"/rest/whatsnew/1.0/show";
L.ajax({url:N,data:{},type:O?"POST":"DELETE",success:function(){AJS.log("whatsnew > toggleDontShow > isShownForUser set to: "+O)
}})
},D=function(){if(!C){return 
}G&&clearTimeout(G);
F();
AJS.setVisible(C,true)
},J=function(P){var O=new AJS.Dialog({width:855,height:545,id:"whats-new-dialog",onCancel:function(){O.hide().remove();
G&&clearTimeout(G)
}});
var S=AJS.Meta.get("whats-new-iframe-src-override");
if(typeof (S)=="undefined"||S===""){S=AJS.Meta.get("whatsnew-full-link")
}var R="What\u2019s New in JIRA {0}";
var Q=AJS.Meta.get("version-number").match(/^\d+\.\d+/);
var T=AJS.format(R,Q);
O.addHeader(T);
var N=JIRA.Templates.WhatsNew.whatsNewDialogPanel({whatsNewHelpLink:S,whatsNewFullLink:AJS.Meta.get("whatsnew-full-link")});
O.addPanel("default",N);
O.addCancel("Close",function(){O.hide().remove();
G&&clearTimeout(G);
return false
});
A=O.popup.element;
if(AJS.Meta.get("remote-user")){O.page[O.curpage].buttonpanel.append(JIRA.Templates.WhatsNew.whatsNewDialogTipPanel({isOnDemand:AJS.DarkFeatures.isEnabled("com.atlassian.jira.config.CoreFeatures.ON_DEMAND")}));
A.find("#dont-show-whats-new").change(K).attr("checked",P?"":"checked")
}C=A.find("iframe");
C.load(D);
M=A.find(".whats-new-timeout");
return O
},F=function(){if(H){H();
H=null
}E.addClass("hidden")
},B=function(){var N=contextPath+"/rest/whatsnew/1.0/show";
L.getJSON(N,function(O){J(O.isShownForUser).show();
E=A.find(".whats-new-throbber.hidden");
E.removeClass("hidden");
H=Raphael.spinner(E[0],80,"#666");
G=setTimeout(function(){C=null;
F();
AJS.setVisible(M,true)
},10000)
})
};
I.click(function(N){N.preventDefault();
B()
});
AJS.Meta.getBoolean("show-whats-new")&&B()
});
// This file was automatically generated from welcome.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.WelcomeScreen == 'undefined') { JIRA.Templates.WelcomeScreen = {}; }


JIRA.Templates.WelcomeScreen.welcomeScreenPanel = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="aui-group"><div class="welcome-screen-splash aui-item"><h1><span class="assistive">JIRA</span></h1></div><div class="welcome-screen-content-container aui-item"><div class="welcome-screen-content">', (opt_data.theirName) ? '<h1>' + soy.$$escapeHtml(AJS.format("Welcome, {0}!",opt_data.theirName)) + '</h1>' : '<h1>' + soy.$$escapeHtml("Welcome!") + '</h1>', '<p>', soy.$$escapeHtml("To begin working with JIRA, you need to create a new project."), '</p><ul class="welcome-screen-options"><li>');
  JIRA.Templates.WelcomeScreen.welcomeScreenAction({type: 'blankproject', href: '/secure/admin/AddProject!default.jspa?nextAction=browseproject', title: "Create a new project", description: "Start with an empty project to begin managing your issues.", cssClass: 'add-project-trigger'}, output);
  output.append('</li></ul></div><div class="welcome-screen-alternate-options"><p>', AJS.format("{0}I\x27\x27ll skip this{1}, I know what I\x27\x27m doing.",opt_data.cancelLinkHtml,'</a>'), '</p></div></div></div>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.WelcomeScreen.welcomeScreenAction = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a class="welcome-screen-action ', soy.$$escapeHtml(opt_data.cssClass), '" data-type="', soy.$$escapeHtml(opt_data.type), '" href="', soy.$$escapeHtml(""), soy.$$escapeHtml(opt_data.href), '"><h3>', soy.$$escapeHtml(opt_data.title), '</h3>', (opt_data.description) ? '<p>' + soy.$$escapeHtml(opt_data.description) + '</p>' : '', '</a>');
  return opt_sb ? '' : output.toString();
};

(function(C){var B=contextPath+"/rest/welcome/1.0/show",D="welcome-screen-cancel-trigger";
function A(){return JIRA.Templates.WelcomeScreen.welcomeScreenPanel({theirName:AJS.Meta.get("remote-user-fullname")||"",cancelLinkHtml:'<a class="'+D+'" href="'+contextPath+'/">'})
}AJS.toInit(function(I){var F;
var E=function(){var J=new AJS.Dialog({width:860,height:600,id:"welcome-dialog",onCancel:function(){}});
J.addPanel("default",A());
JIRA.bind("Dialog.beforeHide",H);
I("a",J.popup.element).click(function(K){JIRA.unbind("Dialog.beforeHide",H)
});
I("."+D,J.popup.element).click(G);
I(".welcome-screen-action",J.popup.element).click(function(){AJS.EventQueue&&AJS.EventQueue.push({name:"welcomescreen.action",properties:{type:this.getAttribute("data-type")}});
I.ajax({url:B,type:"DELETE",success:function(){AJS.log("welcome dialog > action clicked > don't show dialog anymore")
}})
});
return J
},H=function(J){if(JIRA.Dialog&&JIRA.Dialog.current&&F&&JIRA.Dialog.current.$popup==F.popup.element){J.preventDefault()
}},G=function(J){J.preventDefault();
F.hide().remove();
AJS.EventQueue&&AJS.EventQueue.push({name:"welcomescreen.dismiss"});
I.ajax({url:B,type:"DELETE",success:function(){AJS.log("welcome dialog > don't show dialog anymore")
}})
};
if(AJS.Meta.getBoolean("show-welcome-screen")){if(AJS.$("#gh").length){return 
}F=E();
F.show()
}})
})(AJS.$);
var XRegExp;if(XRegExp){throw Error("can't load XRegExp twice in the same frame")}(function(x){function z(c,a){if(!XRegExp.isRegExp(c)){throw TypeError("type RegExp expected")}var d=c._xregexp;return c=XRegExp(c.source,v(c)+(a||"")),d&&(c._xregexp={source:d.source,captureNames:d.captureNames?d.captureNames.slice(0):null}),c}function v(a){return(a.global?"g":"")+(a.ignoreCase?"i":"")+(a.multiline?"m":"")+(a.extended?"x":"")+(a.sticky?"y":"")}function g(s,G,h,c){var d=D.length,F,E,p;q=!0;try{while(d--){p=D[d];if(h&p.scope&&(!p.trigger||p.trigger.call(c))){p.pattern.lastIndex=G,E=p.pattern.exec(s);if(E&&E.index===G){F={output:p.handler.call(c,E,h),match:E};break}}}}catch(i){throw i}finally{q=!1}return F}function y(d,a,f){if(Array.prototype.indexOf){return d.indexOf(a,f)}for(var c=f||0;c<d.length;c++){if(d[c]===a){return c}}return -1}XRegExp=function(F,c){var G=[],E=XRegExp.OUTSIDE_CLASS,o=0,l,i,n,p,e;if(XRegExp.isRegExp(F)){if(c!==x){throw TypeError("can't supply flags when constructing one RegExp from another")}return z(F)}if(q){throw Error("can't call the XRegExp constructor within token definition functions")}c=c||"",l={hasNamedCapture:!1,captureNames:[],hasFlag:function(a){return c.indexOf(a)>-1},setFlag:function(a){c+=a}};while(o<F.length){i=g(F,o,E,l),i?(G.push(i.output),o+=i.match[0].length||1):(n=j.exec.call(m[E],F.slice(o)))?(G.push(n[0]),o+=n[0].length):(p=F.charAt(o),p==="["?E=XRegExp.INSIDE_CLASS:p==="]"&&(E=XRegExp.OUTSIDE_CLASS),G.push(p),o++)}return e=RegExp(G.join(""),j.replace.call(c,k,"")),e._xregexp={source:F,captureNames:l.hasNamedCapture?l.captureNames:null},e},XRegExp.version="1.5.1",XRegExp.INSIDE_CLASS=1,XRegExp.OUTSIDE_CLASS=2;var C=/\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g,k=/[^gimy]+|([\s\S])(?=[\s\S]*\1)/g,b=/^(?:[?*+]|{\d+(?:,\d*)?})\??/,q=!1,D=[],j={exec:RegExp.prototype.exec,test:RegExp.prototype.test,match:String.prototype.match,replace:String.prototype.replace,split:String.prototype.split},B=j.exec.call(/()??/,"")[1]===x,A=function(){var a=/^/g;return j.test.call(a,""),!a.lastIndex}(),w=RegExp.prototype.sticky!==x,m={};m[XRegExp.INSIDE_CLASS]=/^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/,m[XRegExp.OUTSIDE_CLASS]=/^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/,XRegExp.addToken=function(d,a,f,c){D.push({pattern:z(d,"g"+(w?"y":"")),handler:a,scope:f||XRegExp.OUTSIDE_CLASS,trigger:c||null})},XRegExp.cache=function(c,a){var d=c+"/"+(a||"");return XRegExp.cache[d]||(XRegExp.cache[d]=XRegExp(c,a))},XRegExp.copyAsGlobal=function(a){return z(a,"g")},XRegExp.escape=function(a){return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")},XRegExp.execAt=function(h,c,l,f){var a=z(c,"g"+(f&&w?"y":"")),d;return a.lastIndex=l=l||0,d=a.exec(h),f&&d&&d.index!==l&&(d=null),c.global&&(c.lastIndex=d?a.lastIndex:0),d},XRegExp.freezeTokens=function(){XRegExp.addToken=function(){throw Error("can't run addToken after freezeTokens")}},XRegExp.isRegExp=function(a){return Object.prototype.toString.call(a)==="[object RegExp]"},XRegExp.iterate=function(h,c,p,f){var a=z(c,"g"),d=-1,l;while(l=a.exec(h)){c.global&&(c.lastIndex=a.lastIndex),p.call(f,l,++d,h,c),a.lastIndex===l.index&&a.lastIndex++}c.global&&(c.lastIndex=0)},XRegExp.matchChain=function(c,a){return function d(p,n){var h=a[n].regex?a[n]:{regex:a[n]},l=z(h.regex,"g"),t=[],f;for(f=0;f<p.length;f++){XRegExp.iterate(p[f],l,function(i){t.push(h.backref?i[h.backref]||"":i[0])})}return n===a.length-1||!t.length?t:d(t,n+1)}([c],0)},RegExp.prototype.apply=function(c,a){return this.exec(a[0])},RegExp.prototype.call=function(c,a){return this.exec(a)},RegExp.prototype.exec=function(c){var l,e,a,d;this.global||(d=this.lastIndex),l=j.exec.apply(this,arguments);if(l){!B&&l.length>1&&y(l,"")>-1&&(a=RegExp(this.source,j.replace.call(v(this),"g","")),j.replace.call((c+"").slice(l.index),a,function(){for(var f=1;f<arguments.length-2;f++){arguments[f]===x&&(l[f]=x)}}));if(this._xregexp&&this._xregexp.captureNames){for(var h=1;h<l.length;h++){e=this._xregexp.captureNames[h-1],e&&(l[e]=l[h])}}!A&&this.global&&!l[0].length&&this.lastIndex>l.index&&this.lastIndex--}return this.global||(this.lastIndex=d),l},RegExp.prototype.test=function(c){var a,d;return this.global||(d=this.lastIndex),a=j.exec.call(this,c),a&&!A&&this.global&&!a[0].length&&this.lastIndex>a.index&&this.lastIndex--,this.global||(this.lastIndex=d),!!a},String.prototype.match=function(c){XRegExp.isRegExp(c)||(c=RegExp(c));if(c.global){var a=j.match.apply(this,arguments);return c.lastIndex=0,a}return c.exec(this)},String.prototype.replace=function(o,p){var l=XRegExp.isRegExp(o),f,h,d,c;return l?(o._xregexp&&(f=o._xregexp.captureNames),o.global||(c=o.lastIndex)):o+="",Object.prototype.toString.call(p)==="[object Function]"?h=j.replace.call(this+"",o,function(){if(f){arguments[0]=new String(arguments[0]);for(var a=0;a<f.length;a++){f[a]&&(arguments[0][f[a]]=arguments[a+1])}}return l&&o.global&&(o.lastIndex=arguments[arguments.length-2]+arguments[0].length),p.apply(null,arguments)}):(d=this+"",h=j.replace.call(d,o,function(){var a=arguments;return j.replace.call(p+"",C,function(e,F,u){if(!F){var E=+u;return E<=a.length-3?a[E]:(E=f?y(f,u):-1,E>-1?a[E+1]:e)}switch(F){case"$":return"$";case"&":return a[0];case"`":return a[a.length-1].slice(0,a[a.length-2]);case"'":return a[a.length-1].slice(a[a.length-2]+a[0].length);default:var i="";F=+F;if(!F){return e}while(F>a.length-3){i=String.prototype.slice.call(F,-1)+i,F=Math.floor(F/10)}return(F?a[F]||"":"$")+i}})})),l&&(o.global?o.lastIndex=0:o.lastIndex=c),h},String.prototype.split=function(f,o){if(!XRegExp.isRegExp(f)){return j.split.apply(this,arguments)}var l=this+"",e=[],h=0,d,c;if(o===x||+o<0){o=Infinity}else{o=Math.floor(+o);if(!o){return[]}}f=XRegExp.copyAsGlobal(f);while(d=f.exec(l)){if(f.lastIndex>h){e.push(l.slice(h,d.index)),d.length>1&&d.index<l.length&&Array.prototype.push.apply(e,d.slice(1)),c=d[0].length,h=f.lastIndex;if(e.length>=o){break}}f.lastIndex===d.index&&f.lastIndex++}return h===l.length?(!j.test.call(f,"")||c)&&e.push(""):e.push(l.slice(h)),e.length>o?e.slice(0,o):e},XRegExp.addToken(/\(\?#[^)]*\)/,function(a){return j.test.call(b,a.input.slice(a.index+a[0].length))?"":"(?:)"}),XRegExp.addToken(/\((?!\?)/,function(){return this.captureNames.push(null),"("}),XRegExp.addToken(/\(\?<([$\w]+)>/,function(a){return this.captureNames.push(a[1]),this.hasNamedCapture=!0,"("}),XRegExp.addToken(/\\k<([\w$]+)>/,function(c){var a=y(this.captureNames,c[1]);return a>-1?"\\"+(a+1)+(isNaN(c.input.charAt(c.index+c[0].length))?"":"(?:)"):c[0]}),XRegExp.addToken(/\[\^?]/,function(a){return a[0]==="[]"?"\\b\\B":"[\\s\\S]"}),XRegExp.addToken(/^\(\?([imsx]+)\)/,function(a){return this.setFlag(a[1]),""}),XRegExp.addToken(/(?:\s+|#.*)+/,function(a){return j.test.call(b,a.input.slice(a.index+a[0].length))?"":"(?:)"},XRegExp.OUTSIDE_CLASS,function(){return this.hasFlag("x")}),XRegExp.addToken(/\./,function(){return"[\\s\\S]"},XRegExp.OUTSIDE_CLASS,function(){return this.hasFlag("s")})})();if(typeof SyntaxHighlighter=="undefined"){var SyntaxHighlighter=function(){function aa(b,a){return b.className.indexOf(a)!=-1}function af(a,b){aa(a,b)||(a.className+=" "+b)}function ac(b,a){b.className=b.className.replace(a,"")}function aj(b){var a=[];for(var c=0;c<b.length;c++){a.push(b[c])}return a}function ab(a){return a.split(/\r?\n/)}function ae(b){var a="highlighter_";return b.indexOf(a)==0?b:a+b}function Z(a){return an.vars.highlighters[ae(a)]}function ar(a){return document.getElementById(ae(a))}function am(a){an.vars.highlighters[ae(a.id)]=a}function ah(g,c,k){if(g==null){return null}var f=k!=1?g.childNodes:[g.parentNode],b={"#":"id",".":"className"}[c.substr(0,1)]||"nodeName",d,h;d=b!="nodeName"?c.substr(1):c.toUpperCase();if((g[b]||"").indexOf(d)!=-1){return g}for(var a=0;f&&a<f.length&&h==null;a++){h=ah(f[a],c,k)}return h}function ap(b,a){return ah(b,a,!0)}function ak(c,a,d){d=Math.max(d||0,0);for(var b=d;b<c.length;b++){if(c[b]==a){return b}}return -1}function ad(a){return(a||"")+Math.round(Math.random()*1000000).toString()}function ao(c,a){var d={},b;for(b in c){d[b]=c[b]}for(b in a){d[b]=a[b]}return d}function Y(b){var a={"true":!0,"false":!1}[b];return a==null?b:a}function ag(g,c,k,f,b){var d=(screen.width-k)/2,h=(screen.height-f)/2;b+=", left="+d+", top="+h+", width="+k+", height="+f,b=b.replace(/^,/,"");var a=window.open(g,c,b);return a.focus(),a}function al(d,b,f,c){function a(g){g=g||window.event,g.target||(g.target=g.srcElement,g.preventDefault=function(){this.returnValue=!1}),f.call(c||window,g)}d.attachEvent?d.attachEvent("on"+b,a):d.addEventListener(b,a,!1)}function V(a){window.alert(an.config.strings.alert+a)}function aq(e,k){var g=an.vars.discoveredBrushes,d=null;if(g==null){g={};for(var f in an.brushes){var h=an.brushes[f],c=h.aliases;if(c==null){continue}h.brushName=f.toLowerCase();for(var b=0;b<c.length;b++){g[c[b]]=f}}an.vars.discoveredBrushes=g}return d=an.brushes[g[e]],d==null&&k&&V(an.config.strings.noBrush+e),d}function X(c,a){var d=ab(c);for(var b=0;b<d.length;b++){d[b]=a(d[b],b)}return d.join("\r\n")}function K(a){return a.replace(/^[ ]*[\n]+|[\n]*[ ]*$/g,"")}function q(f){var b,h={},d=new XRegExp("^\\[(?<values>(.*?))\\]$"),a=new XRegExp("(?<name>[\\w-]+)\\s*:\\s*(?<value>[\\w-%#]+|\\[.*?\\]|\".*?\"|'.*?')\\s*;?","g");while((b=a.exec(f))!=null){var c=b.value.replace(/^['"]|['"]$/g,"");if(c!=null&&d.test(c)){var g=d.exec(c);c=g.values.length>0?g.values.split(/\s*,\s*/):[]}h[b.name]=c}return h}function W(a,b){return a==null||a.length==0||a=="\n"?a:(a=a.replace(/</g,"&lt;"),a=a.replace(/ {2,}/g,function(c){var e="";for(var d=0;d<c.length-1;d++){e+=an.config.space}return e+" "}),b!=null&&(a=X(a,function(d){if(d.length==0){return""}var c="";return d=d.replace(/^(&nbsp;| )+/,function(f){return c=f,""}),d.length==0?c:c+'<code class="'+b+'">'+d+"</code>"})),a)}function j(b,a){var c=b.toString();while(c.length<a){c="0"+c}return c}function F(c,a){var d="";for(var b=0;b<a;b++){d+=" "}return c.replace(/\t/g,d)}function R(f,c){function a(k,i,l){return k.substr(0,i)+b.substr(0,l)+k.substr(i+1,k.length)}var h=ab(f),d="	",b="";for(var g=0;g<50;g++){b+="                    "}return f=X(f,function(l){if(l.indexOf(d)==-1){return l}var m=0;while((m=l.indexOf(d))!=-1){var k=c-m%c;l=a(l,m,k)}return l}),f}function ai(a){var b=/<br\s*\/?>|&lt;br\s*\/?&gt;/gi;return an.config.bloggerMode==1&&(a=a.replace(b,"\n")),an.config.stripBrs==1&&(a=a.replace(b,"")),a}function I(a){return a.replace(/^\s+|\s+$/g,"")}function U(h){var f=ab(ai(h)),l=new Array,g=/^\s*/,d=1000;for(var k=0;k<f.length&&d>0;k++){var c=f[k];if(I(c).length==0){continue}var b=g.exec(c);if(b==null){return h}d=Math.min(b[0].length,d)}if(d>0){for(var k=0;k<f.length;k++){f[k]=f[k].substr(d)}}return f.join("\n")}function B(b,a){return b.index<a.index?-1:b.index>a.index?1:b.length<a.length?-1:b.length>a.length?1:0}function G(e,k){function g(i,a){return i[0]}var d=0,f=null,h=[],c=k.func?k.func:g;while((f=k.regex.exec(e))!=null){var b=c(f,k);typeof b=="string"&&(b=[new an.Match(b,f.index,k.css)]),h=h.concat(b)}return h}function at(a){var b=/(.*)((&gt;|&lt;).*)/;return a.replace(an.regexLib.url,function(f){var c="",d=null;if(d=b.exec(f)){f=d[1],c=d[2]}return'<a href="'+f+'">'+f+"</a>"+c})}function Q(){var b=document.getElementsByTagName("script"),a=[];for(var c=0;c<b.length;c++){b[c].type=="syntaxhighlighter"&&a.push(b[c])}return a}function z(g){var c="<![CDATA[",k="]]>",f=I(g),b=!1,d=c.length,h=k.length;f.indexOf(c)==0&&(f=f.substring(d),b=!0);var a=f.length;return f.indexOf(k)==a-h&&(f=f.substring(0,a-h),b=!0),b?f:g}function J(l){var n=l.target,d=ap(n,".syntaxhighlighter"),r=ap(n,".container"),c=document.createElement("textarea"),m;if(!r||!d||ah(r,"textarea")){return}m=Z(d.id),af(d,"source");var k=r.childNodes,g=[];for(var b=0;b<k.length;b++){g.push(k[b].innerText||k[b].textContent)}g=g.join("\r"),g=g.replace(/\u00a0/g," "),c.appendChild(document.createTextNode(g)),r.appendChild(c),c.focus(),c.select(),al(c,"blur",function(a){c.parentNode.removeChild(c),ac(d,"source")})}typeof require!="undefined"&&typeof XRegExp=="undefined"&&(XRegExp=require("XRegExp").XRegExp);var an={defaults:{"class-name":"","first-line":1,"pad-line-numbers":!1,highlight:null,title:null,"smart-tabs":!0,"tab-size":4,gutter:!0,toolbar:!0,"quick-code":!0,collapse:!1,"auto-links":!0,light:!1,unindent:!0,"html-script":!1},config:{space:"&nbsp;",useScriptTags:!0,bloggerMode:!1,stripBrs:!1,tagName:"pre",strings:{expandSource:"expand source",help:"?",alert:"SyntaxHighlighter\n\n",noBrush:"Can't find brush for: ",brushNotHtmlScript:"Brush wasn't configured for html-script option: ",aboutDialog:"@ABOUT@"}},vars:{discoveredBrushes:null,highlighters:{}},brushes:{},regexLib:{multiLineCComments:/\/\*[\s\S]*?\*\//gm,singleLineCComments:/\/\/.*$/gm,singleLinePerlComments:/#.*$/gm,doubleQuotedString:/"([^\\"\n]|\\.)*"/g,singleQuotedString:/'([^\\'\n]|\\.)*'/g,multiLineDoubleQuotedString:new XRegExp('"([^\\\\"]|\\\\.)*"',"gs"),multiLineSingleQuotedString:new XRegExp("'([^\\\\']|\\\\.)*'","gs"),xmlComments:/(&lt;|<)!--[\s\S]*?--(&gt;|>)/gm,url:/\w+:\/\/[\w-.\/?%&=:@;#]*/g,phpScriptTags:{left:/(&lt;|<)\?(?:=|php)?/g,right:/\?(&gt;|>)/g,eof:!0},aspScriptTags:{left:/(&lt;|<)%=?/g,right:/%(&gt;|>)/g},scriptScriptTags:{left:/(&lt;|<)\s*script.*?(&gt;|>)/gi,right:/(&lt;|<)\/\s*script\s*(&gt;|>)/gi}},toolbar:{getHtml:function(b){function c(g,h){return an.toolbar.getButtonHtml(g,h,an.config.strings[h])}var f='<div class="toolbar">',d=an.toolbar.items,a=d.list;for(var e=0;e<a.length;e++){f+=(d[a[e]].getHtml||c)(b,a[e])}return f+="</div>",f},getButtonHtml:function(b,a,c){return'<span><a href="#" class="toolbar_item command_'+a+" "+a+'">'+c+"</a></span>"},handler:function(b){function a(h){var g=new RegExp(h+"_(\\w+)"),i=g.exec(d);return i?i[1]:null}var f=b.target,d=f.className||"",c=Z(ap(f,".syntaxhighlighter").id),e=a("command");c&&e&&an.toolbar.items[e].execute(c),b.preventDefault()},items:{list:["expandSource","help"],expandSource:{getHtml:function(a){if(a.getParam("collapse")!=1){return""}var b=a.getParam("title");return an.toolbar.getButtonHtml(a,"expandSource",b?b:an.config.strings.expandSource)},execute:function(b){var a=ar(b.id);ac(a,"collapsed")}},help:{execute:function(a){var c=ag("","_blank",500,250,"scrollbars=0"),b=c.document;b.write(an.config.strings.aboutDialog),b.close(),c.focus()}}}},findElements:function(d,h){var f=h?[h]:aj(document.getElementsByTagName(an.config.tagName)),e=an.config,g=[];e.useScriptTags&&(f=f.concat(Q()));if(f.length===0){return g}for(var c=0;c<f.length;c++){var b={target:f[c],params:ao(d,q(f[c].className))};if(b.params.brush==null){continue}g.push(b)}return g},highlight:function(y,e){var b=this.findElements(y,e),k="innerHTML",A=null,d=an.config;if(b.length===0){return}for(var x=0;x<b.length;x++){var e=b[x],w=e.target,p=e.params,g=p.brush,v;if(g==null){continue}if(p["html-script"]=="true"||an.defaults["html-script"]==1){A=new an.HtmlScript(g),g="htmlscript"}else{var m=aq(g);if(!m){continue}A=new m}v=w[k],d.useScriptTags&&(v=z(v)),(w.title||"")!=""&&(p.title=w.title),p.brush=g,A.init(p),e=A.getDiv(v),(w.id||"")!=""&&(e.id=w.id),w.parentNode.replaceChild(e,w)}},all:function(a){al(window,"load",function(){an.highlight(a)})}};return an.Match=function(b,a,c){this.value=b,this.index=a,this.length=b.length,this.css=c,this.brushName=null},an.Match.prototype.toString=function(){return this.value},an.HtmlScript=function(p){function h(f,a){for(var i=0;i<f.length;i++){f[i].index+=a}}function e(x,D){var r=x.code,E=[],f=b.regexList,C=x.index+x.left.length,A=b.htmlScript,n;for(var y=0;y<f.length;y++){n=G(r,f[y]),h(n,C),E=E.concat(n)}A.left!=null&&x.left!=null&&(n=G(x.left,A.left),h(n,x.index),E=E.concat(n)),A.right!=null&&x.right!=null&&(n=G(x.right,A.right),h(n,x.index+x[0].lastIndexOf(x.right)),E=E.concat(n));for(var w=0;w<E.length;w++){E[w].brushName=d.brushName}return E}var d=aq(p),b,g=new an.brushes.Xml,v=null,c=this,m="getDiv getHtml init".split(" ");if(d==null){return}b=new d;for(var k=0;k<m.length;k++){(function(){var a=m[k];c[a]=function(){return g[a].apply(g,arguments)}})()}if(b.htmlScript==null){V(an.config.strings.brushNotHtmlScript+p);return}g.regexList.push({regex:b.htmlScript.code,func:e})},an.Highlighter=function(){},an.Highlighter.prototype={getParam:function(b,a){var c=this.params[b];return Y(c==null?a:c)},create:function(a){return document.createElement(a)},findMatches:function(c,a){var d=[];if(c!=null){for(var b=0;b<c.length;b++){typeof c[b]=="object"&&(d=d.concat(G(a,c[b])))}}return this.removeNestedMatches(d.sort(B))},removeNestedMatches:function(f){for(var b=0;b<f.length;b++){if(f[b]===null){continue}var g=f[b],d=g.index+g.length;for(var a=b+1;a<f.length&&f[b]!==null;a++){var c=f[a];if(c===null){continue}if(c.index>d){break}c.index==g.index&&c.length>g.length?f[b]=null:c.index>=g.index&&c.index<d&&(f[a]=null)}}return f},figureOutLineNumbers:function(b){var a=[],c=parseInt(this.getParam("first-line"));return X(b,function(f,d){a.push(d+c)}),a},isLineHighlighted:function(b){var a=this.getParam("highlight",[]);return typeof a!="object"&&a.push==null&&(a=[a]),ak(a,b.toString())!=-1},getLineHtml:function(c,a,d){var b=["line","number"+a,"index"+c,"alt"+(a%2==0?1:2).toString()];return this.isLineHighlighted(a)&&b.push("highlighted"),a==0&&b.push("break"),'<div class="'+b.join(" ")+'">'+d+"</div>"},getLineNumbersHtml:function(e,l){var g="",d=ab(e).length,k=parseInt(this.getParam("first-line")),c=this.getParam("pad-line-numbers");c==1?c=(k+d-1).toString().length:isNaN(c)==1&&(c=0);for(var b=0;b<d;b++){var h=l?l[b]:k+b,e=h==0?an.config.space:j(h,c);g+=this.getLineHtml(b,h,e)}return g},getCodeLinesHtml:function(x,e){x=I(x);var b=ab(x),k=this.getParam("pad-line-numbers"),d=parseInt(this.getParam("first-line")),x="",w=this.getParam("brush");for(var v=0;v<b.length;v++){var p=b[v],g=/^(&nbsp;|\s)+/.exec(p),s=null,m=e?e[v]:d+v;g!=null&&(s=g[0].toString(),p=p.substr(s.length),s=s.replace(" ",an.config.space)),p=I(p),p.length==0&&(p=an.config.space),x+=this.getLineHtml(v,m,(s!=null?'<code class="'+w+' spaces">'+s+"</code>":"")+p)}return x},getTitleHtml:function(a){return a?"<caption>"+a+"</caption>":""},getMatchesHtml:function(g,l){function m(i){var a=i?i.brushName||f:f;return a?a+" ":""}var d=0,b="",f=this.getParam("brush","");for(var c=0;c<l.length;c++){var k=l[c],h;if(k===null||k.length===0){continue}h=m(k),b+=W(g.substr(d,k.index-d),h+"plain")+W(k.value,h+k.css),d=k.index+k.length+(k.offset||0)}return b+=W(g.substr(d),m()+"plain"),b},getHtml:function(c){var f="",e=["syntaxhighlighter"],b,d,a;return this.getParam("light")==1&&(this.params.toolbar=this.params.gutter=!1),className="syntaxhighlighter",this.getParam("collapse")==1&&e.push("collapsed"),(gutter=this.getParam("gutter"))==0&&e.push("nogutter"),e.push(this.getParam("class-name")),e.push(this.getParam("brush")),c=K(c).replace(/\r/g," "),b=this.getParam("tab-size"),c=this.getParam("smart-tabs")==1?R(c,b):F(c,b),this.getParam("unindent")&&(c=U(c)),gutter&&(a=this.figureOutLineNumbers(c)),d=this.findMatches(this.regexList,c),f=this.getMatchesHtml(c,d),f=this.getCodeLinesHtml(f,a),this.getParam("auto-links")&&(f=at(f)),typeof navigator!="undefined"&&navigator.userAgent&&navigator.userAgent.match(/MSIE/)&&e.push("ie"),f='<div id="'+ae(this.id)+'" class="'+e.join(" ")+'">'+(this.getParam("toolbar")?an.toolbar.getHtml(this):"")+'<table border="0" cellpadding="0" cellspacing="0">'+this.getTitleHtml(this.getParam("title"))+"<tbody><tr>"+(gutter?'<td class="gutter">'+this.getLineNumbersHtml(c)+"</td>":"")+'<td class="code"><div class="container">'+f+"</div></td></tr></tbody></table></div>",f},getDiv:function(a){a===null&&(a=""),this.code=a;var b=this.create("div");return b.innerHTML=this.getHtml(a),this.getParam("toolbar")&&al(ah(b,".toolbar"),"click",an.toolbar.handler),this.getParam("quick-code")&&al(ah(b,".code"),"dblclick",J),b},init:function(a){this.id=ad(),am(this),this.params=ao(an.defaults,a||{}),this.getParam("light")==1&&(this.params.toolbar=this.params.gutter=!1)},getKeywords:function(a){return a=a.replace(/^\s+|\s+$/g,"").replace(/\s+/g,"|"),"\\b(?:"+a+")\\b"},forHtmlScript:function(b){var a={end:b.right.source};b.eof&&(a.end="(?:(?:"+a.end+")|$)"),this.htmlScript={left:{regex:b.left,css:"script"},right:{regex:b.right,css:"script"},code:new XRegExp("(?<left>"+b.left.source+")(?<code>.*?)(?<right>"+a.end+")","sgi")}}},an}()}typeof exports!="undefined"?exports.SyntaxHighlighter=SyntaxHighlighter:null;
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["text","plain"];SyntaxHighlighter.brushes.Plain=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var b="abstract assert boolean break byte case catch char class const continue default do double else enum extends false final finally float for goto if implements import instanceof int interface long native new null package private protected public return short static strictfp super switch synchronized this throw throws true transient try void volatile while";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:/\/\*([^\*][\s\S]*?)?\*\//gm,css:"comments"},{regex:/\/\*(?!\*\/)\*[\s\S]*?\*\//gm,css:"preprocessor"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\b([\d]+(\.[\d]+)?|0x[a-f0-9]+)\b/gi,css:"value"},{regex:/(?!\@interface\b)\@[\$\w]+\b/g,css:"color1"},{regex:/\@interface\b/g,css:"color2"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"keyword"}];this.forHtmlScript({left:/(&lt;|<)%[@!=]?/g,right:/%(&gt;|>)/g})}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["java"];SyntaxHighlighter.brushes.Java=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var c="abs avg case cast coalesce convert count current_timestamp current_user day isnull left lower month nullif replace right session_user space substring sum system_user upper user year";var d="absolute action add after alter as asc at authorization begin bigint binary bit by cascade char character check checkpoint close collate column commit committed connect connection constraint contains continue create cube current current_date current_time cursor database date deallocate dec decimal declare default delete desc distinct double drop dynamic else end end-exec escape except exec execute false fetch first float for force foreign forward free from full function global goto grant group grouping having hour ignore index inner insensitive insert instead int integer intersect into is isolation key last level load local max min minute modify move name national nchar next no numeric of off on only open option order out output partial password precision prepare primary prior privileges procedure public read real references relative repeatable restrict return returns revoke rollback rollup rows rule schema scroll second section select sequence serializable set size smallint static statistics table temp temporary then time timestamp to top transaction translation trigger true truncate uncommitted union unique update values varchar varying view when where with work";var b="all and any between cross in join like not null or outer some";this.regexList=[{regex:/--(.*)$/gm,css:"comments"},{regex:/\/\*([^\*][\s\S]*?)?\*\//gm,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineDoubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.multiLineSingleQuotedString,css:"string"},{regex:new RegExp(this.getKeywords(c),"gmi"),css:"color2"},{regex:new RegExp(this.getKeywords(b),"gmi"),css:"color1"},{regex:new RegExp(this.getKeywords(d),"gmi"),css:"keyword"}]}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["sql"];SyntaxHighlighter.brushes.Sql=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){function b(g){return"\\b([a-z_]|)"+g.replace(/ /g,"(?=:)\\b|\\b([a-z_\\*]|\\*|)")+"(?=:)\\b"}function d(g){return"\\b"+g.replace(/ /g,"(?!-)(?!:)\\b|\\b()")+":\\b"}var e="ascent azimuth background-attachment background-color background-image background-position background-repeat background baseline bbox border-collapse border-color border-spacing border-style border-top border-right border-bottom border-left border-top-color border-right-color border-bottom-color border-left-color border-top-style border-right-style border-bottom-style border-left-style border-top-width border-right-width border-bottom-width border-left-width border-width border bottom cap-height caption-side centerline clear clip color content counter-increment counter-reset cue-after cue-before cue cursor definition-src descent direction display elevation empty-cells float font-size-adjust font-family font-size font-stretch font-style font-variant font-weight font height left letter-spacing line-height list-style-image list-style-position list-style-type list-style margin-top margin-right margin-bottom margin-left margin marker-offset marks mathline max-height max-width min-height min-width orphans outline-color outline-style outline-width outline overflow padding-top padding-right padding-bottom padding-left padding page page-break-after page-break-before page-break-inside pause pause-after pause-before pitch pitch-range play-during position quotes right richness size slope src speak-header speak-numeral speak-punctuation speak speech-rate stemh stemv stress table-layout text-align top text-decoration text-indent text-shadow text-transform unicode-bidi unicode-range units-per-em vertical-align visibility voice-family volume white-space widows width widths word-spacing x-height z-index";var c="above absolute all always aqua armenian attr aural auto avoid baseline behind below bidi-override black blink block blue bold bolder both bottom braille capitalize caption center center-left center-right circle close-quote code collapse compact condensed continuous counter counters crop cross crosshair cursive dashed decimal decimal-leading-zero default digits disc dotted double embed embossed e-resize expanded extra-condensed extra-expanded fantasy far-left far-right fast faster fixed format fuchsia gray green groove handheld hebrew help hidden hide high higher icon inline-table inline inset inside invert italic justify landscape large larger left-side left leftwards level lighter lime line-through list-item local loud lower-alpha lowercase lower-greek lower-latin lower-roman lower low ltr marker maroon medium message-box middle mix move narrower navy ne-resize no-close-quote none no-open-quote no-repeat normal nowrap n-resize nw-resize oblique olive once open-quote outset outside overline pointer portrait pre print projection purple red relative repeat repeat-x repeat-y rgb ridge right right-side rightwards rtl run-in screen scroll semi-condensed semi-expanded separate se-resize show silent silver slower slow small small-caps small-caption smaller soft solid speech spell-out square s-resize static status-bar sub super sw-resize table-caption table-cell table-column table-column-group table-footer-group table-header-group table-row table-row-group teal text-bottom text-top thick thin top transparent tty tv ultra-condensed ultra-expanded underline upper-alpha uppercase upper-latin upper-roman url visible wait white wider w-resize x-fast x-high x-large x-loud x-low x-slow x-small x-soft xx-large xx-small yellow";var f="[mM]onospace [tT]ahoma [vV]erdana [aA]rial [hH]elvetica [sS]ans-serif [sS]erif [cC]ourier mono sans serif";this.regexList=[{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\#[a-fA-F0-9]{3,6}/g,css:"value"},{regex:/(-?\d+)(\.\d+)?(px|em|pt|\:|\%|)/g,css:"value"},{regex:/!important/g,css:"color3"},{regex:new RegExp(b(e),"gm"),css:"keyword"},{regex:new RegExp(d(c),"g"),css:"value"},{regex:new RegExp(this.getKeywords(f),"g"),css:"color1"}];this.forHtmlScript({left:/(&lt;|<)\s*style.*?(&gt;|>)/gi,right:/(&lt;|<)\/\s*style\s*(&gt;|>)/gi})}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["css"];SyntaxHighlighter.brushes.CSS=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var d="bool byte char creal dchar double float idouble ifloat int ireal long real short ubyte ucent uint ulong ushort wchar wstring void size_t sizediff_t";var b="abstract alias align asm assert auto break case cast cdouble cent cfloat const continue debug default delegate delete deprecated export extern final finally function goto immutable import inout invariant is lazy macro module new nothrow override package pragma private protected public pure ref return shared short static super synchronized template this throw typedef typeid typeof volatile __FILE__ __LINE__ __gshared __traits __vector __parameters body catch class do else enum for foreach foreach_reverse if in interface mixin out scope struct switch try union unittest version while with";var c="assert";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/^ *#.*/gm,css:"preprocessor"},{regex:new RegExp(this.getKeywords(d),"gm"),css:"color1 bold"},{regex:new RegExp(this.getKeywords(c),"gm"),css:"functions bold"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"keyword bold"}]}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["d","di"];SyntaxHighlighter.brushes.D=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var b="after and andalso band begin bnot bor bsl bsr bxor case catch cond div end fun if let not of or orelse query receive rem try when xor module export import define";this.regexList=[{regex:new RegExp("[A-Z][A-Za-z0-9_]+","g"),css:"constants"},{regex:new RegExp("\\%.+","gm"),css:"comments"},{regex:new RegExp("\\?[A-Za-z0-9_]+","g"),css:"preprocessor"},{regex:new RegExp("[a-z0-9_]+:[a-z0-9_]+","g"),css:"functions"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"keyword"}]}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["erl","erlang"];SyntaxHighlighter.brushes.Erlang=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){this.regexList=[{regex:/^\+\+\+ .*$/gm,css:"color2"},{regex:/^\-\-\- .*$/gm,css:"color2"},{regex:/^\s.*$/gm,css:"color1"},{regex:/^@@.*@@.*$/gm,css:"variable"},{regex:/^\+.*$/gm,css:"string"},{regex:/^\-.*$/gm,css:"color3"}]}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["diff","patch"];SyntaxHighlighter.brushes.Diff=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){function b(f,j){var g=SyntaxHighlighter.Match,i=f[0],d=new XRegExp("(&lt;|<)[\\s\\/\\?]*(?<name>[:\\w-\\.]+)","xg").exec(i),c=[];if(f.attributes!=null){var e,h=new XRegExp("(?<name> [\\w:\\-\\.]+)\\s*=\\s*(?<value> \".*?\"|'.*?'|\\w+)","xg");while((e=h.exec(i))!=null){c.push(new g(e.name,f.index+e.index,"color1"));c.push(new g(e.value,f.index+e.index+e[0].indexOf(e.value),"string"))}}if(d!=null){c.push(new g(d.name,f.index+d[0].indexOf(d.name),"keyword"))}return c}this.regexList=[{regex:new XRegExp("(\\&lt;|<)\\!\\[[\\w\\s]*?\\[(.|\\s)*?\\]\\](\\&gt;|>)","gm"),css:"color2"},{regex:SyntaxHighlighter.regexLib.xmlComments,css:"comments"},{regex:new XRegExp("(&lt;|<)[\\s\\/\\?]*(\\w+)(?<attributes>.*?)[\\s\\/\\?]*(&gt;|>)","sg"),func:b}]}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["xml","xhtml","xslt","html"];SyntaxHighlighter.brushes.Xml=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var b="abs accept alarm atan2 bind binmode chdir chmod chomp chop chown chr chroot close closedir connect cos crypt defined delete each endgrent endhostent endnetent endprotoent endpwent endservent eof exec exists exp fcntl fileno flock fork format formline getc getgrent getgrgid getgrnam gethostbyaddr gethostbyname gethostent getlogin getnetbyaddr getnetbyname getnetent getpeername getpgrp getppid getpriority getprotobyname getprotobynumber getprotoent getpwent getpwnam getpwuid getservbyname getservbyport getservent getsockname getsockopt glob gmtime grep hex index int ioctl join keys kill lc lcfirst length link listen localtime lock log lstat map mkdir msgctl msgget msgrcv msgsnd oct open opendir ord pack pipe pop pos print printf prototype push quotemeta rand read readdir readline readlink readpipe recv rename reset reverse rewinddir rindex rmdir scalar seek seekdir select semctl semget semop send setgrent sethostent setnetent setpgrp setpriority setprotoent setpwent setservent setsockopt shift shmctl shmget shmread shmwrite shutdown sin sleep socket socketpair sort splice split sprintf sqrt srand stat study substr symlink syscall sysopen sysread sysseek system syswrite tell telldir time times tr truncate uc ucfirst umask undef unlink unpack unshift utime values vec wait waitpid warn write say";var c="bless caller continue dbmclose dbmopen die do dump else elsif eval exit for foreach goto if import last local my next no our package redo ref require return sub tie tied unless untie until use wantarray while given when default try catch finally has extends with before after around override augment";this.regexList=[{regex:/(<<|&lt;&lt;)((\w+)|(['"])(.+?)\4)[\s\S]+?\n\3\5\n/g,css:"string"},{regex:/#.*$/gm,css:"comments"},{regex:/^#!.*\n/g,css:"preprocessor"},{regex:/-?\w+(?=\s*=(>|&gt;))/g,css:"string"},{regex:/\bq[qwxr]?\([\s\S]*?\)/g,css:"string"},{regex:/\bq[qwxr]?\{[\s\S]*?\}/g,css:"string"},{regex:/\bq[qwxr]?\[[\s\S]*?\]/g,css:"string"},{regex:/\bq[qwxr]?(<|&lt;)[\s\S]*?(>|&gt;)/g,css:"string"},{regex:/\bq[qwxr]?([^\w({<[])[\s\S]*?\1/g,css:"string"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/(?:&amp;|[$@%*]|\$#)[a-zA-Z_](\w+|::)*/g,css:"variable"},{regex:/\b__(?:END|DATA)__\b[\s\S]*$/g,css:"comments"},{regex:/(^|\n)=\w[\s\S]*?(\n=cut\s*\n|$)/g,css:"comments"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"functions"},{regex:new RegExp(this.getKeywords(c),"gm"),css:"keyword"}];this.forHtmlScript(SyntaxHighlighter.regexLib.phpScriptTags)}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["perl","Perl","pl"];SyntaxHighlighter.brushes.Perl=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var b="abs acos acosh addcslashes addslashes array_change_key_case array_chunk array_combine array_count_values array_diff array_diff_assoc array_diff_key array_diff_uassoc array_diff_ukey array_fill array_filter array_flip array_intersect array_intersect_assoc array_intersect_key array_intersect_uassoc array_intersect_ukey array_key_exists array_keys array_map array_merge array_merge_recursive array_multisort array_pad array_pop array_product array_push array_rand array_reduce array_reverse array_search array_shift array_slice array_splice array_sum array_udiff array_udiff_assoc array_udiff_uassoc array_uintersect array_uintersect_assoc array_uintersect_uassoc array_unique array_unshift array_values array_walk array_walk_recursive atan atan2 atanh base64_decode base64_encode base_convert basename bcadd bccomp bcdiv bcmod bcmul bindec bindtextdomain bzclose bzcompress bzdecompress bzerrno bzerror bzerrstr bzflush bzopen bzread bzwrite ceil chdir checkdate checkdnsrr chgrp chmod chop chown chr chroot chunk_split class_exists closedir closelog copy cos cosh count count_chars date decbin dechex decoct deg2rad delete ebcdic2ascii echo empty end ereg ereg_replace eregi eregi_replace error_log error_reporting escapeshellarg escapeshellcmd eval exec exit exp explode extension_loaded feof fflush fgetc fgetcsv fgets fgetss file_exists file_get_contents file_put_contents fileatime filectime filegroup fileinode filemtime fileowner fileperms filesize filetype floatval flock floor flush fmod fnmatch fopen fpassthru fprintf fputcsv fputs fread fscanf fseek fsockopen fstat ftell ftok getallheaders getcwd getdate getenv gethostbyaddr gethostbyname gethostbynamel getimagesize getlastmod getmxrr getmygid getmyinode getmypid getmyuid getopt getprotobyname getprotobynumber getrandmax getrusage getservbyname getservbyport gettext gettimeofday gettype glob gmdate gmmktime ini_alter ini_get ini_get_all ini_restore ini_set interface_exists intval ip2long is_a is_array is_bool is_callable is_dir is_double is_executable is_file is_finite is_float is_infinite is_int is_integer is_link is_long is_nan is_null is_numeric is_object is_readable is_real is_resource is_scalar is_soap_fault is_string is_subclass_of is_uploaded_file is_writable is_writeable mkdir mktime nl2br parse_ini_file parse_str parse_url passthru pathinfo print readlink realpath rewind rewinddir rmdir round str_ireplace str_pad str_repeat str_replace str_rot13 str_shuffle str_split str_word_count strcasecmp strchr strcmp strcoll strcspn strftime strip_tags stripcslashes stripos stripslashes stristr strlen strnatcasecmp strnatcmp strncasecmp strncmp strpbrk strpos strptime strrchr strrev strripos strrpos strspn strstr strtok strtolower strtotime strtoupper strtr strval substr substr_compare";var d="abstract and array as break case catch cfunction class clone const continue declare default die do else elseif enddeclare endfor endforeach endif endswitch endwhile extends final for foreach function global goto if implements include include_once interface instanceof insteadof namespace new old_function or private protected public return require require_once static switch trait throw try use var while xor ";var c="__FILE__ __LINE__ __METHOD__ __FUNCTION__ __CLASS__";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\$\w+/g,css:"variable"},{regex:new RegExp(this.getKeywords(b),"gmi"),css:"functions"},{regex:new RegExp(this.getKeywords(c),"gmi"),css:"constants"},{regex:new RegExp(this.getKeywords(d),"gm"),css:"keyword"}];this.forHtmlScript(SyntaxHighlighter.regexLib.phpScriptTags)}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["php"];SyntaxHighlighter.brushes.Php=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var c="Boolean Byte Character Double Duration Float Integer Long Number Short String Void";var b="abstract after and as assert at before bind bound break catch class continue def delete else exclusive extends false finally first for from function if import in indexof init insert instanceof into inverse last lazy mixin mod nativearray new not null on or override package postinit protected public public-init public-read replace return reverse sizeof step super then this throw true try tween typeof var where while with attribute let private readonly static trigger";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:/(-?\.?)(\b(\d*\.?\d+|\d+\.?\d*)(e[+-]?\d+)?|0x[a-f\d]+)\b\.?/gi,css:"color2"},{regex:new RegExp(this.getKeywords(c),"gm"),css:"variable"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"keyword"}];this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["jfx","javafx"];SyntaxHighlighter.brushes.JavaFX=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var b="break case catch continue default delete do else false  for function if in instanceof new null return super switch this throw true try typeof var while with";var c=SyntaxHighlighter.regexLib;this.regexList=[{regex:c.multiLineDoubleQuotedString,css:"string"},{regex:c.multiLineSingleQuotedString,css:"string"},{regex:c.singleLineCComments,css:"comments"},{regex:c.multiLineCComments,css:"comments"},{regex:/\s*#.*/gm,css:"preprocessor"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"keyword"}];this.forHtmlScript(c.scriptScriptTags)}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["js","jscript","javascript"];SyntaxHighlighter.brushes.JScript=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var b="AddHandler AddressOf AndAlso Alias And Ansi As Assembly Auto Boolean ByRef Byte ByVal Call Case Catch CBool CByte CChar CDate CDec CDbl Char CInt Class CLng CObj Const CShort CSng CStr CType Date Decimal Declare Default Delegate Dim DirectCast Do Double Each Else ElseIf End Enum Erase Error Event Exit False Finally For Friend Function Get GetType GoSub GoTo Handles If Implements Imports In Inherits Integer Interface Is Let Lib Like Long Loop Me Mod Module MustInherit MustOverride MyBase MyClass Namespace New Next Not Nothing NotInheritable NotOverridable Object On Option Optional Or OrElse Overloads Overridable Overrides ParamArray Preserve Private Property Protected Public RaiseEvent ReadOnly ReDim REM RemoveHandler Resume Return Select Set Shadows Shared Short Single Static Step Stop String Structure Sub SyncLock Then Throw To True Try TypeOf Unicode Until Variant When While With WithEvents WriteOnly Xor";this.regexList=[{regex:/'.*$/gm,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:/^\s*#.*$/gm,css:"preprocessor"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"keyword"}];this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["vb","vbnet"];SyntaxHighlighter.brushes.Vb=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var d="ATOM BOOL BOOLEAN BYTE CHAR COLORREF DWORD DWORDLONG DWORD_PTR DWORD32 DWORD64 FLOAT HACCEL HALF_PTR HANDLE HBITMAP HBRUSH HCOLORSPACE HCONV HCONVLIST HCURSOR HDC HDDEDATA HDESK HDROP HDWP HENHMETAFILE HFILE HFONT HGDIOBJ HGLOBAL HHOOK HICON HINSTANCE HKEY HKL HLOCAL HMENU HMETAFILE HMODULE HMONITOR HPALETTE HPEN HRESULT HRGN HRSRC HSZ HWINSTA HWND INT INT_PTR INT32 INT64 LANGID LCID LCTYPE LGRPID LONG LONGLONG LONG_PTR LONG32 LONG64 LPARAM LPBOOL LPBYTE LPCOLORREF LPCSTR LPCTSTR LPCVOID LPCWSTR LPDWORD LPHANDLE LPINT LPLONG LPSTR LPTSTR LPVOID LPWORD LPWSTR LRESULT PBOOL PBOOLEAN PBYTE PCHAR PCSTR PCTSTR PCWSTR PDWORDLONG PDWORD_PTR PDWORD32 PDWORD64 PFLOAT PHALF_PTR PHANDLE PHKEY PINT PINT_PTR PINT32 PINT64 PLCID PLONG PLONGLONG PLONG_PTR PLONG32 PLONG64 POINTER_32 POINTER_64 PSHORT PSIZE_T PSSIZE_T PSTR PTBYTE PTCHAR PTSTR PUCHAR PUHALF_PTR PUINT PUINT_PTR PUINT32 PUINT64 PULONG PULONGLONG PULONG_PTR PULONG32 PULONG64 PUSHORT PVOID PWCHAR PWORD PWSTR SC_HANDLE SC_LOCK SERVICE_STATUS_HANDLE SHORT SIZE_T SSIZE_T TBYTE TCHAR UCHAR UHALF_PTR UINT UINT_PTR UINT32 UINT64 ULONG ULONGLONG ULONG_PTR ULONG32 ULONG64 USHORT USN VOID WCHAR WORD WPARAM WPARAM WPARAM char bool short int __int32 __int64 __int8 __int16 long float double __wchar_t clock_t _complex _dev_t _diskfree_t div_t ldiv_t _exception _EXCEPTION_POINTERS FILE _finddata_t _finddatai64_t _wfinddata_t _wfinddatai64_t __finddata64_t __wfinddata64_t _FPIEEE_RECORD fpos_t _HEAPINFO _HFILE lconv intptr_t jmp_buf mbstate_t _off_t _onexit_t _PNH ptrdiff_t _purecall_handler sig_atomic_t size_t _stat __stat64 _stati64 terminate_function time_t __time64_t _timeb __timeb64 tm uintptr_t _utimbuf va_list wchar_t wctrans_t wctype_t wint_t signed";var b="auto break case catch class const decltype __finally __exception __try const_cast continue private public protected __declspec default delete deprecated dllexport dllimport do dynamic_cast else enum explicit extern if for friend goto inline mutable naked namespace new noinline noreturn nothrow register reinterpret_cast return selectany sizeof static static_cast struct switch template this thread throw true false try typedef typeid typename union using uuid virtual void volatile whcar_t while";var c="assert isalnum isalpha iscntrl isdigit isgraph islower isprintispunct isspace isupper isxdigit tolower toupper errno localeconv setlocale acos asin atan atan2 ceil cos cosh exp fabs floor fmod frexp ldexp log log10 modf pow sin sinh sqrt tan tanh jmp_buf longjmp setjmp raise signal sig_atomic_t va_arg va_end va_start clearerr fclose feof ferror fflush fgetc fgetpos fgets fopen fprintf fputc fputs fread freopen fscanf fseek fsetpos ftell fwrite getc getchar gets perror printf putc putchar puts remove rename rewind scanf setbuf setvbuf sprintf sscanf tmpfile tmpnam ungetc vfprintf vprintf vsprintf abort abs atexit atof atoi atol bsearch calloc div exit free getenv labs ldiv malloc mblen mbstowcs mbtowc qsort rand realloc srand strtod strtol strtoul system wcstombs wctomb memchr memcmp memcpy memmove memset strcat strchr strcmp strcoll strcpy strcspn strerror strlen strncat strncmp strncpy strpbrk strrchr strspn strstr strtok strxfrm asctime clock ctime difftime gmtime localtime mktime strftime time";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/^ *#.*/gm,css:"preprocessor"},{regex:new RegExp(this.getKeywords(d),"gm"),css:"color1 bold"},{regex:new RegExp(this.getKeywords(c),"gm"),css:"functions bold"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"keyword bold"}]}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["cpp","c"];SyntaxHighlighter.brushes.Cpp=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var c="abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit volatile extern false finally fixed float for foreach get goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed set short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using virtual void while var from group by into select let where orderby join on equals ascending descending";function b(d,f){var e=(d[0].indexOf("///")==0)?"color1":"comments";return[new SyntaxHighlighter.Match(d[0],d.index,e)]}this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,func:b},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:/@"(?:[^"]|"")*"/g,css:"string"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/^\s*#.*/gm,css:"preprocessor"},{regex:new RegExp(this.getKeywords(c),"gm"),css:"keyword"},{regex:/\bpartial(?=\s+(?:class|interface|struct)\b)/g,css:"keyword"},{regex:/\byield(?=\s+(?:return|break)\b)/g,css:"keyword"}];this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["c#","c-sharp","csharp"];SyntaxHighlighter.brushes.CSharp=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var b="alias and BEGIN begin break case class def define_method defined do each else elsif END end ensure false for if in module new next nil not or raise redo rescue retry return self super then throw true undef unless until when while yield";var c="Array Bignum Binding Class Continuation Dir Exception FalseClass File::Stat File Fixnum Fload Hash Integer IO MatchData Method Module NilClass Numeric Object Proc Range Regexp String Struct::TMS Symbol ThreadGroup Thread Time TrueClass";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLinePerlComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\b[A-Z0-9_]+\b/g,css:"constants"},{regex:/:[a-z][A-Za-z0-9_]*/g,css:"color2"},{regex:/(\$|@@|@)\w+/g,css:"variable bold"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"keyword"},{regex:new RegExp(this.getKeywords(c),"gm"),css:"color1"}];this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["ruby","rails","ror","rb"];SyntaxHighlighter.brushes.Ruby=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var d="and assert break class continue def del elif else except exec finally for from global if import in is lambda not or pass print raise return try yield while";var b="__import__ abs all any apply basestring bin bool buffer callable chr classmethod cmp coerce compile complex delattr dict dir divmod enumerate eval execfile file filter float format frozenset getattr globals hasattr hash help hex id input int intern isinstance issubclass iter len list locals long map max min next object oct open ord pow print property range raw_input reduce reload repr reversed round set setattr slice sorted staticmethod str sum super tuple type type unichr unicode vars xrange zip";var c="None True False self cls class_";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLinePerlComments,css:"comments"},{regex:/^\s*@\w+/gm,css:"decorator"},{regex:/(['\"]{3})([^\1])*?\1/gm,css:"comments"},{regex:/"(?!")(?:\.|\\\"|[^\""\n])*"/gm,css:"string"},{regex:/'(?!')(?:\.|(\\\')|[^\''\n])*'/gm,css:"string"},{regex:/\+|\-|\*|\/|\%|=|==/gm,css:"keyword"},{regex:/\b\d+\.?\w*/g,css:"value"},{regex:new RegExp(this.getKeywords(b),"gmi"),css:"functions"},{regex:new RegExp(this.getKeywords(d),"gm"),css:"keyword"},{regex:new RegExp(this.getKeywords(c),"gm"),css:"color1"}];this.forHtmlScript(SyntaxHighlighter.regexLib.aspScriptTags)}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["py","python"];SyntaxHighlighter.brushes.Python=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
SyntaxHighlighter.brushes.Tcl=function(){var a="after append apply array bgerror binary cd chan clock close concat dde dict encoding eof error eval exec exit expr fblocked fconfigure fcopy file fileevent filename flush format gets glob history http incr info interp join lappend lassign lindex linsert list llength load lrange lrepeat lreplace lreverse lsearch lset lsort mathfunc mathop memory msgcat open parray pid platform puts pwd read refchan regexp registry regsub rename scan seek socket source split string subst switch tcltest tclvars tell time tm trace unknown unload update uplevel variable vwait";var b="proc if then return while for set unset break continue foreach package namespace catch upvar global";this.regexList=[{regex:new RegExp("^\\s*#.*$","gm"),css:"comments"},{regex:new RegExp(";\\s*#.*$","gm"),css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:new RegExp("\\$[A-Za-z]\\w*","g"),css:"variable"},{regex:new RegExp("\\b\\d+\\b","g"),css:"constants"},{regex:new RegExp("[\\[\\]]","g"),css:"color2"},{regex:new RegExp(this.getKeywords(b),"g"),css:"keyword"},{regex:new RegExp(this.getKeywords(a),"g"),css:"functions bold"},{regex:/array (anymore|donesearch|exists|get|names|nextelement|set|size|startsearch|statistics|unset)/g,css:"functions bold"},{regex:/dict (append|create|exists|filter|for|get|incr|info|keys|lappend|merge|remove|replace|set|size|unset|update|values|with)/g,css:"functions bold"},{regex:/string (bytelength|compare|equal|first|index|is|last|length|map|match|range|repeat|replace|reverse|tolower|totitle|toupper|trim|trimleft|trimright|wordend|wordstart)/g,css:"functions bold"}]};SyntaxHighlighter.brushes.Tcl.prototype=new SyntaxHighlighter.Highlighter();SyntaxHighlighter.brushes.Tcl.aliases=["tcl"];
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var d="ATOM BOOL BOOLEAN BYTE CHAR COLORREF DWORD DWORDLONG DWORD_PTR DWORD32 DWORD64 FLOAT HACCEL HALF_PTR HANDLE HBITMAP HBRUSH HCOLORSPACE HCONV HCONVLIST HCURSOR HDC HDDEDATA HDESK HDROP HDWP HENHMETAFILE HFILE HFONT HGDIOBJ HGLOBAL HHOOK HICON HINSTANCE HKEY HKL HLOCAL HMENU HMETAFILE HMODULE HMONITOR HPALETTE HPEN HRESULT HRGN HRSRC HSZ HWINSTA HWND INT INT_PTR INT32 INT64 LANGID LCID LCTYPE LGRPID LONG LONGLONG LONG_PTR LONG32 LONG64 LPARAM LPBOOL LPBYTE LPCOLORREF LPCSTR LPCTSTR LPCVOID LPCWSTR LPDWORD LPHANDLE LPINT LPLONG LPSTR LPTSTR LPVOID LPWORD LPWSTR LRESULT PBOOL PBOOLEAN PBYTE PCHAR PCSTR PCTSTR PCWSTR PDWORDLONG PDWORD_PTR PDWORD32 PDWORD64 PFLOAT PHALF_PTR PHANDLE PHKEY PINT PINT_PTR PINT32 PINT64 PLCID PLONG PLONGLONG PLONG_PTR PLONG32 PLONG64 POINTER_32 POINTER_64 PSHORT PSIZE_T PSSIZE_T PSTR PTBYTE PTCHAR PTSTR PUCHAR PUHALF_PTR PUINT PUINT_PTR PUINT32 PUINT64 PULONG PULONGLONG PULONG_PTR PULONG32 PULONG64 PUSHORT PVOID PWCHAR PWORD PWSTR SC_HANDLE SC_LOCK SERVICE_STATUS_HANDLE SHORT SIZE_T SSIZE_T TBYTE TCHAR UCHAR UHALF_PTR UINT UINT_PTR UINT32 UINT64 ULONG ULONGLONG ULONG_PTR ULONG32 ULONG64 USHORT USN VOID WCHAR WORD WPARAM WPARAM WPARAM char bool short int __int32 __int64 __int8 __int16 long float double __wchar_t clock_t _complex _dev_t _diskfree_t div_t ldiv_t _exception _EXCEPTION_POINTERS FILE _finddata_t _finddatai64_t _wfinddata_t _wfinddatai64_t __finddata64_t __wfinddata64_t _FPIEEE_RECORD fpos_t _HEAPINFO _HFILE lconv intptr_t id jmp_buf mbstate_t _off_t _onexit_t _PNH ptrdiff_t _purecall_handler sig_atomic_t size_t _stat __stat64 _stati64 terminate_function time_t __time64_t _timeb __timeb64 tm uintptr_t _utimbuf va_list wchar_t wctrans_t wctype_t wint_t signed";var b="break case catch class copy const __finally __exception __try const_cast continue private public protected __declspec default delete deprecated dllexport dllimport do dynamic_cast else enum explicit extern if for friend getter goto inline mutable naked namespace new nil NO noinline nonatomic noreturn nothrow NULL readonly readwrite register reinterpret_cast retain return SEL selectany self setter sizeof static static_cast struct super switch template this thread throw true false try typedef typeid typename union using uuid virtual void volatile whcar_t while YES";var c="assert isalnum isalpha iscntrl isdigit isgraph islower isprintispunct isspace isupper isxdigit tolower toupper errno localeconv setlocale acos asin atan atan2 ceil cos cosh exp fabs floor fmod frexp ldexp log log10 modf pow sin sinh sqrt tan tanh jmp_buf longjmp setjmp raise signal sig_atomic_t va_arg va_end va_start clearerr fclose feof ferror fflush fgetc fgetpos fgets fopen fprintf fputc fputs fread freopen fscanf fseek fsetpos ftell fwrite getc getchar gets perror printf putc putchar puts remove rename rewind scanf setbuf setvbuf sprintf sscanf tmpfile tmpnam ungetc vfprintf vprintf vsprintf abort abs atexit atof atoi atol bsearch calloc div exit free getenv labs ldiv malloc mblen mbstowcs mbtowc qsort rand realloc srand strtod strtol strtoul system wcstombs wctomb memchr memcmp memcpy memmove memset strcat strchr strcmp strcoll strcpy strcspn strerror strlen strncat strncmp strncpy strpbrk strrchr strspn strstr strtok strxfrm asctime clock ctime difftime gmtime localtime mktime strftime time";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/^ *#.*/gm,css:"preprocessor"},{regex:/^#!.*$/gm,css:"preprocessor"},{regex:new RegExp(this.getKeywords(d),"gm"),css:"keyword bold"},{regex:new RegExp(this.getKeywords(c),"gm"),css:"functions bold"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"keyword bold"},{regex:new RegExp("\\bNS\\w+\\b","gm"),css:"keyword bold"},{regex:new RegExp("\\bUI\\w+\\b","gm"),css:"keyword bold"},{regex:new RegExp("\\bIB\\w+\\b","gm"),css:"keyword bold"},{regex:new RegExp("@\\w+\\b","gm"),css:"keyword bold"},]}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["obj-c","objc"];SyntaxHighlighter.brushes.ObjC=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var c="val sealed case def true trait implicit forSome import match object null finally super override try lazy for var catch throw type extends class while with new final yield abstract else do if return protected private this package false";var b="[_:=><%#@]+";this.regexList=[{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.multiLineSingleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.multiLineDoubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/0x[a-f0-9]+|\d+(\.\d+)?/gi,css:"value"},{regex:new RegExp(this.getKeywords(c),"gm"),css:"keyword"},{regex:new RegExp(b,"gm"),css:"keyword"}]}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["scala"];SyntaxHighlighter.brushes.Scala=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var c="if fi then elif else for do done until while break continue case esac function return in eq ne ge le";var b="alias apropos awk basename bash bc bg builtin bzip2 cal cat cd cfdisk chgrp chmod chown chrootcksum clear cmp comm command cp cron crontab csplit cut date dc dd ddrescue declare df diff diff3 dig dir dircolors dirname dirs du echo egrep eject enable env ethtool eval exec exit expand export expr false fdformat fdisk fg fgrep file find fmt fold format free fsck ftp gawk getopts grep groups gzip hash head history hostname id ifconfig import install join kill less let ln local locate logname logout look lpc lpr lprint lprintd lprintq lprm ls lsof make man mkdir mkfifo mkisofs mknod more mount mtools mv netstat nice nl nohup nslookup open op passwd paste pathchk ping popd pr printcap printenv printf ps pushd pwd quota quotacheck quotactl ram rcp read readonly renice remsync rm rmdir rsync screen scp sdiff sed select seq set sftp shift shopt shutdown sleep sort source split ssh strace su sudo sum symlink sync tail tar tee test time times touch top traceroute trap tr true tsort tty type ulimit umask umount unalias uname unexpand uniq units unset unshar useradd usermod users uuencode uudecode v vdir vi watch wc whereis which who whoami Wget xargs yes";this.regexList=[{regex:/^#!.*$/gm,css:"preprocessor bold"},{regex:/\/[\w-\/]+/gm,css:"plain"},{regex:SyntaxHighlighter.regexLib.singleLinePerlComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.doubleQuotedString,css:"string"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:new RegExp(this.getKeywords(c),"gm"),css:"keyword"},{regex:new RegExp(this.getKeywords(b),"gm"),css:"functions"}]}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["bash","shell","sh"];SyntaxHighlighter.brushes.Bash=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
(function(){SyntaxHighlighter=SyntaxHighlighter||(typeof require!=="undefined"?require("shCore").SyntaxHighlighter:null);function a(){var b="abs addr and ansichar ansistring array as asm begin boolean byte cardinal case char class comp const constructor currency destructor div do double downto else end except exports extended false file finalization finally for function goto if implementation in inherited int64 initialization integer interface is label library longint longword mod nil not object of on or packed pansichar pansistring pchar pcurrency pdatetime pextended pint64 pointer private procedure program property pshortstring pstring pvariant pwidechar pwidestring protected public published raise real real48 record repeat set shl shortint shortstring shr single smallint string then threadvar to true try type unit until uses val var varirnt while widechar widestring with word write writeln xor";this.regexList=[{regex:/\(\*[\s\S]*?\*\)/gm,css:"comments"},{regex:/{(?!\$)[\s\S]*?}/gm,css:"comments"},{regex:SyntaxHighlighter.regexLib.singleLineCComments,css:"comments"},{regex:SyntaxHighlighter.regexLib.singleQuotedString,css:"string"},{regex:/\{\$[a-zA-Z]+ .+\}/g,css:"color1"},{regex:/\b[\d\.]+\b/g,css:"value"},{regex:/\$[a-zA-Z0-9]+\b/g,css:"value"},{regex:new RegExp(this.getKeywords(b),"gmi"),css:"keyword"}]}a.prototype=new SyntaxHighlighter.Highlighter();a.aliases=["delphi","pascal","pas"];SyntaxHighlighter.brushes.Delphi=a;typeof(exports)!="undefined"?exports.Brush=a:null})();
