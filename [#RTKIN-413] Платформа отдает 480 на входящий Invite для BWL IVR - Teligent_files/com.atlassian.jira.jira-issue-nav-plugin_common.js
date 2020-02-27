(function(){AJS.namespace("JIRA.Issues.Analytics");
JIRA.Issues.Analytics=_.clone(Backbone.Events);
JIRA.Issues.Analytics.convertToLogEvent=function(C,D){var B="***** Analytics log ["+C+"]";
if(D){B+="["+JSON.stringify(D)+"]"
}AJS.log(B);
if(AJS.EventQueue){AJS.EventQueue.push({name:C,properties:D||{}})
}};
AJS.$(document).keydown(function(B){if(B.keyCode===70&&(B.metaKey||B.ctrlKey)){JIRA.Issues.Analytics.trigger("kickass.inbrowsersearch")
}});
var A=function(B){JIRA.Issues.Analytics.on(B,function(C){JIRA.Issues.Analytics.convertToLogEvent(B,C)
})
};
A("kickass.search");
A("kickass.switchtokeyword");
A("kickass.switchtoadvanced");
A("kickass.scroll");
A("kickass.returntosearch");
A("kickass.searchWithFilter");
A("kickass.editFields");
A("kickass.editMultipleFields");
A("kickass.editClientDuration");
A("kickass.editClientCancelledDuration");
A("kickass.editSaveonserverDuration");
A("kickass.inbrowsersearch");
A("kickass.issueLoadDuration");
A("kickass.issueTotalSaveDuration");
A("kickass.focusshifteropened")
})();
(function(){var A=!(AJS.$.browser.msie&&parseInt(AJS.$.browser.version,10)<9);
if(A){AJS.$.ajax({url:"https://jira.atlassian.com/s/en_UKr2b6v9/713/4/1.0.20-beta/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?collectorId=bc1a3f9b",type:"get",cache:true,dataType:"script",timeout:5000})
}AJS.$(function(){if(AJS.Meta.get("isAtlassianStaff")){function C(G,E,F){$contents=G;
if($contents.children().length){F();
return 
}$contents.html(JIRA.Templates.Issues.Util.exitPopup());
var H=$contents.find("textarea");
H.click(function(I){I.stopPropagation()
});
$contents.find("form").submit(function(J){J.preventDefault();
var I=AJS.$.trim(H.val());
if(I===""){alert("Try again. I'm not going to let you leave until you tell me why you want to leave!")
}else{AJS.$.ajax({type:"POST",contentType:"application/json",dataType:"json",url:contextPath+"/rest/issueNav/1/optoutfeedback",data:JSON.stringify({note:H.val()})});
window.location.href=E.href
}});
F()
}var B={width:273,offsetY:17,offsetX:-100,hideDelay:3600000,useLiveEvents:true};
var D=AJS.InlineDialog(AJS.$("#exit-beta-navigator a"),"exit-kickass-popup",C,B)
}})
})();
(function(A){A.fn.stalker=function(J){var B=this,G,C;
if(!B.length||B.data("stalker-applied")){return 
}B.data("stalker-applied",true);
J=J||{};
J.offsetTop=J.offsetTop||0;
function I(){if(G){B.css({position:"",top:"",left:"",width:"",height:""}).removeClass("detached");
B.unbind("stalkerHeightUpdated",H);
G.remove();
G=null
}}function F(){if(!G){G=jQuery("<div class='stalker-placeholder' />").css("visibility","hidden").addClass(B[0].className).height(B.outerHeight()).width(B.outerWidth()).insertBefore(B);
B.bind("stalkerHeightUpdated",H);
B.css({position:"fixed",top:J.offsetTop,left:C.left,width:J.width||B.width()}).addClass("detached");
if(typeof D.timeout==="undefined"){D()
}}}function H(){G.height(B.height())
}function E(){if(!B.is(":visible")){return 
}if(!C){C=B.offset()
}if(A(window).scrollTop()+J.offsetTop>=C.top){F()
}else{I()
}}function D(){if(G){E();
D.timeout=setTimeout(D,250)
}else{delete D.timeout
}}A(window).bind("resize scroll",E);
E();
return{unstalk:function(){I();
A(window).unbind("resize scroll",E)
}}
}
})(AJS.$);
(function(A){A(document).bind("InlineLayer.beforeHide",function(E,C,D){var B=A(E.target);
if(B.closest(".calendar").length){E.preventDefault()
}})
})(AJS.$);
AJS.namespace("JIRA.Issues.ResultsScrollingHelper");
JIRA.Issues.ResultsScrollingHelper=function(){var B=AJS.$(window),M,D=false,C,A,I,G,K;
function L(){M=AJS.$(".results-panel").css({position:"static",visibility:"hidden"});
G=AJS.$(".navigator-content");
K=M.offset().top;
A=AJS.$(window).height();
I=A-G.offset().top;
M.css({position:"fixed",visibility:""});
I=I-parseInt(M.css("bottom"),10);
G.height(I)
}function J(){AJS.$(window).scrollTop(0);
G.scrollTop(C)
}function F(){var N=I+jQuery(window).scrollTop();
if(N<A-K){G.height(N)
}else{G.height(A-K)
}}function E(){if(D){return 
}L();
F();
J();
B.resize(L);
B.scroll(F);
D=true
}function H(){if(D){var N=G.scrollTop();
B.unbind("resize",L).unbind("scroll",F);
M.css({position:"",visibility:""});
G.css({height:""});
AJS.$(window).scrollTop(N);
D=false
}}return{setup:function(N){N.bind("beforeIssueRequest",function(){C=AJS.$(window).scrollTop()
}).bindIssueLoaded(E).bind("issueDismissed",H)
}}
}();
(function(){var B=".advanced-search";
AJS.$(document).delegate(B,"focus",A);
function A(){if(!AJS.params.autocompleteEnabled||AJS.$(this).data("JQLAutoComplete_init")){return 
}AJS.$(this).data("JQLAutoComplete_init",true);
var G=AJS.$(this);
var D=JSON.parse(jQuery("#jqlFieldz").text());
var E=JSON.parse(jQuery("#jqlFunctionNamez").text());
var F=JSON.parse(jQuery("#jqlReservedWordz").text());
var C=JIRA.JQLAutoComplete({fieldID:this.id,parser:JIRA.JQLAutoComplete.MyParser(F),queryDelay:0.65,jqlFieldNames:D,jqlFunctionNames:E,minQueryLength:0,allowArrowCarousel:true,autoSelectFirst:false,errorID:"jqlerrormsg"});
C.buildResponseContainer();
C.parse(G.text());
C.updateColumnLineCount();
G.keypress(function(H){if(C.dropdownController===null||!C.dropdownController.displayed||C.selectedIndex<0){if(H.keyCode==13&&!H.ctrlKey&&!H.shiftKey){H.preventDefault();
jQuery(this.form).submit()
}}});
G.click(function(){C.dropdownController.hideDropdown()
})
}})();
(function(A){A.fn.htmlCatchExceptions=function(B){try{this.html.apply(this,arguments)
}catch(C){if(console&&console.error){console.error("Error while inserting HTML: "+C.message+", in: ",B)
}}return this
}
})(AJS.$);
AJS.namespace("JIRA.Issues.Mixin.Navigatable");
JIRA.Issues.Mixin.Navigatable={initialize:function(){var A=this.render;
this.render=function(){var B=A.apply(this,arguments);
AJS.$(document).unbind("shortcut");
AJS.whenIType("j").execute(function(){this.model.next()
}.bind(this));
AJS.whenIType("k").execute(function(){this.model.prev()
}.bind(this));
return B
}
}};
JIRA.Issues.Mixin.SingleSelect={properties:["collection"],selectById:function(A){this.setSelected(this.getCollection().get(A))
},selectAt:function(A){this.setSelected(this.getCollection().at(A))
},clearSelection:function(){this.setSelected()
},next:function(){var D=this.getSelected(),C=this.getCollection();
if(!D){if(C.length>0){this.setSelected(C.first())
}}else{var B=C.indexOf(D);
var A=(B+1)%C.length;
this.setSelected(C.at(A))
}},prev:function(){var D=this.getSelected(),C=this.getCollection();
if(!D){if(C.length>0){this.setSelected(C.last())
}}else{var B=C.indexOf(D);
var A=(B+C.length-1)%C.length;
this.setSelected(C.at(A))
}}};
JIRA.Issues.Mixin.LoadingClass={addLoadingClass:function(){this.$el.addClass("loading")
},removeLoadingClass:function(){this.$el.removeClass("loading")
}};
AJS.namespace("JIRA.Issues.Mixin.PageTitleView");
JIRA.Issues.Mixin.PageTitleView={_pageTitle:document.title,updatePageTitle:function(A){document.title=A
},prependToPageTitle:function(B,C){var A=C?" ":"";
this.updatePageTitle(B+A+document.title)
},appendToPageTitle:function(B,C){var A=C?" ":"";
this.updatePageTitle(document.title+A+B)
},restorePreviousPageTitle:function(){document.title=this._pageTitle
}};
JIRA.ViewInlineLayer=AJS.InlineLayer.extend({init:function(A){A.contentRetriever=new JIRA.ViewContentRetriever({view:A.view,cache:A.cache});
this._super(A);
A.view.dialog=this
},_validateClickToClose:function(C){var B=jQuery.Event("InlineLayer.beforeHide"),A={clickOutside:"clickOutside"};
AJS.$(C.target).trigger(B,[this.$layer,A]);
if(B.isDefaultPrevented()){return false
}else{if(C.target===this.offsetTarget()[0]){return false
}else{if(C.target===this.layer()[0]){return false
}else{if(this.offsetTarget().has(C.target).length>0){return false
}else{if(this.layer().has(C.target).length>0){return false
}}}}}return true
}});
JIRA.ViewContentRetriever=AJS.ContentRetriever.extend({init:function(A){this.options=A;
this.view=A.view
},content:function(B){var A=AJS.$("<div />");
this.view.setElement(A);
this.view.render();
B(A)
},cache:function(){return this.options.cache
},isLocked:function(){},startingRequest:function(){},finishedRequest:function(){}});
AJS.namespace("JIRA.Issues.QueryStringParser");
JIRA.Issues.QueryStringParser={parser:/(?:^|&)([^&=]*)=?([^&]*)/g,parse:function(B){if(!B&&B!==0){return{}
}B=""+B;
if("?"===B.charAt(0)){B=B.substring(1)
}var A={};
B.replace(this.parser,function(D,C,E){A[decodeURIComponent(C)]=decodeURIComponent(E)
});
return A
}};
JIRA.Issues.IssueEventBus=JIRA.Issues.BaseModel.extend({properties:["issueId"],namedEvents:["save","saveSuccess","savingStarted","saveError","panelRendered","dismiss","refreshIssue","issueRefreshed","updateFromDom","updateStatusColor","quickEditKeyPressed","openFocusShifter"]});
AJS.namespace("JIRA.Issues.IssuePanelModel");
JIRA.Issues.IssuePanelModel=JIRA.Issues.BaseModel.extend({properties:["entity","updateLocked"],namedEvents:["updated"],initialize:function(){JIRA.bind(JIRA.Events.LOCK_PANEL_REFRESHING,_.bind(function(A,B){if(B===this.getEntity().id){this.setUpdateLocked(true)
}},this));
JIRA.bind(JIRA.Events.UNLOCK_PANEL_REFRESHING,_.bind(function(A,B){if(B===this.getEntity().id){this.setUpdateLocked(false)
}},this))
},applyUpdates:function(F,B,E,C){if((AJS.$.browser.msie&&parseInt(AJS.$.browser.version,10)<9)&&F.text()===B.text()){return false
}var D,A,G=[];
var H=_.any(C,function(I){return B.find(JIRA.Issues.IssueFieldUtil.getFieldSelector(I)).length===1
});
if(!H){A=F;
D="replace";
G.push(F)
}else{_.each(E,function(K){var J=B.find(JIRA.Issues.IssueFieldUtil.getFieldSelector(K));
if(J.length===1){var I=F.find(JIRA.Issues.IssueFieldUtil.getFieldSelector(K));
if(I.length===1){J.replaceWith(I);
G.push(I)
}else{J.closest("li, dl").remove()
}}});
D="update";
A=B
}return{type:D,$existing:B,$el:A,updates:G}
},update:function(A,B){if(!this.getUpdateLocked()){this.setEntity(A);
this.triggerUpdated(B)
}},getPanelId:function(){return(this.getEntity().prefix||"")+this.getEntity().id
}});
AJS.namespace("JIRA.Issues.IssuePanelsModel");
JIRA.Issues.IssuePanelsModel=JIRA.Issues.BaseModel.extend({properties:["leftPanels","rightPanels","infoPanels"],namedEvents:["panelRemoved","panelAdded"],initialize:function(){this.set({leftPanels:[],rightPanels:[],infoPanels:[]},{silent:true})
},DESC_MODULE:{completeKey:"com.atlassian.jira.jira-view-issue-plugin:descriptionmodule",headerLinks:{links:[],groups:[]},html:"<div id='description-val'><em>"+"Click to add description"+"</em></div>",id:"descriptionmodule",label:"Description",prefix:"",renderHeader:true,styleClass:"",subpanelHtmls:[]},update:function(E,D){var A=this;
if(D.editable){var C=_.any(E.leftPanels,function(F){return F.id==="descriptionmodule"
});
if(!C){var B=[];
_.each(E.leftPanels,function(F){B[B.length]=F;
if(F.id==="details-module"){B[B.length]=A.DESC_MODULE
}});
E.leftPanels=B
}}this.updatePanels("leftPanels",E.leftPanels,D);
this.updatePanels("rightPanels",E.rightPanels,D);
this.updatePanels("infoPanels",E.infoPanels,D)
},addDescriptionPanel:function(){var B=[],A=this;
if(!_.any(this.getLeftPanels(),function(C){return C.id==="descriptionmodule"
})){_.each(this.getLeftPanels(),function(C){B[B.length]=C;
if(C.id==="details-module"){var D=A.DESC_MODULE;
var E=new JIRA.Issues.IssuePanelModel({id:D.id,entity:D});
B[B.length]=E;
A.triggerPanelAdded({location:"leftPanels",panel:E,index:B.length-1})
}});
this.setLeftPanels(B,{silent:true})
}},updatePanels:function(C,G,F){var A=this;
var B=this.get(C);
var E=[];
_.each(B,function(I){var H=I.getEntity().id;
if(!_.any(G,function(J){return J.id===H
})){A.triggerPanelRemoved({location:C,panel:I})
}});
_.each(G,function(I,J){var H=_.find(B,function(K){return K.id===I.id
});
if(H){H.update(I,F)
}else{H=new JIRA.Issues.IssuePanelModel({id:I.id,entity:I});
A.triggerPanelAdded({location:C,panel:H,index:J})
}E.push(H)
});
var D={};
D[C]=E;
this.set(D,{silent:true})
},createPlaceholderModel:function(D,C){var B,A=this.get(D);
if(!_.any(A,function(E){return E.id===C
})){B=new JIRA.Issues.IssuePanelModel({id:C,entity:{id:C}});
A.push(B);
return B
}}});
AJS.namespace("JIRA.Issues.IssueViewModel");
JIRA.Issues.IssueViewModel=JIRA.Issues.BaseModel.extend({namedEvents:["returnToSearch","updated"],properties:["id","entity","panels","issueEventBus","statusColorSupport","standalone"],initialize:function(){_.bindAll(this);
this.set({panels:new JIRA.Issues.IssuePanelsModel()});
if(this.getStatusColorSupport()){this.on("change",_.bind(function(){this.getIssueEventBus().triggerUpdateStatusColor()
},this))
}},isStandalone:function(){return jQuery("body").hasClass("navigator-issue-only")
},update:function(B,A){this.setEntity(B.issue);
this.getPanels().update(B.panels,A);
this.triggerUpdated(A)
},returnToSearch:function(){this.triggerReturnToSearch()
},getStatusClass:function(){return JIRA.Issues.StatusUtil.getClass(this.getEntity().status)
},dismiss:function(){this.getIssueEventBus().triggerDismiss()
}});
AJS.namespace("JIRA.Issues.IssueRowModel");
JIRA.Issues.IssueRowModel=JIRA.Issues.BaseModel.extend({namedEvents:["selected"],properties:["id","entity"],initialize:function(){_.bindAll(this)
},getStatusClass:function(){return JIRA.Issues.StatusUtil.getClass(this.getEntity().fields.status)
}});
AJS.namespace("JIRA.Issues.StatusUtil");
JIRA.Issues.StatusUtil={getClass:function(A){return"status-"+A.name.toLowerCase().replace(/\s/g,"")
}};
