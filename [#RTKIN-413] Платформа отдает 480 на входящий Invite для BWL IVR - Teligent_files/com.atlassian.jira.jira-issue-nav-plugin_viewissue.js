JIRA.Messages.showMsgOnReload=function(B,A){JIRA.one(JIRA.Events.ISSUE_REFRESHED,function(){A.type=JIRA.Messages.Types[A.type];
JIRA.Messages.showMsg(B,A)
})
};
(function(){var B;
JIRA.Issues.overrideIssueDialogs=function(H){B=H;
JIRA.unbind("QuickEdit.sessionComplete");
JIRA.bind("QuickEdit.sessionComplete",D);
JIRA.unbind("QuickCreateSubtask.sessionComplete");
JIRA.bind("QuickCreateSubtask.sessionComplete",D);
JIRA.bind("Dialog.show",function(K,J,I){if(I){I.issueId=E()
}});
JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(J,I){I.find(".issueaction-workflow-transition").each(function(){var L=AJS.$(this);
var K=L.attr("href");
K=K.replace(/atl_token=[^&]*/,"atl_token="+atl_token());
L.attr("href",K)
})
});
JIRA.bind(JIRA.Events.NEW_CONTENT_ADDED,function(M,K){var L=AJS.$("#ops-login-lnk");
if(L.length==0){return 
}var I=window.location;
var J=parseUri(L.attr("href"));
J.queryKey.os_destination=I.pathname.slice(contextPath.length)+I.search;
L.attr("href",J.path+"?"+AJS.$.param(J.queryKey))
})
};
var F=JIRA.FormDialog.prototype._getDefaultOptions;
JIRA.FormDialog.prototype._getDefaultOptions=function(){var H=F.apply(this,arguments);
H.onDialogFinished=C;
return H
};
var A=JIRA.FormDialog.prototype._performRedirect;
JIRA.FormDialog.prototype._performRedirect=C;
function E(){var H=B.getSelectedIssueModel();
return H&&H.getEntity().id
}function C(){if(this.options.id==="clone-issue-dialog"){A.apply(this,arguments)
}else{if(this.options.id==="delete-issue-dialog"){var I=this._getTargetUrlValue();
if(I&&I!==""){AJS.reloadViaWindowLocation(I)
}else{if(AJS.$(".page-navigation #next-issue").length>0){AJS.reloadViaWindowLocation(AJS.$(".page-navigation #next-issue").attr("href"))
}else{if(AJS.$(".page-navigation #return-to-search").length>0){AJS.reloadViaWindowLocation(AJS.$(".page-navigation #return-to-search").attr("href"))
}else{AJS.reloadViaWindowLocation(AJS.$("#find_link").attr("href"))
}}}}else{var H=this;
this.showFooterLoadingIndicator();
G(this.issueId).always(function(){H.hideFooterLoadingIndicator();
H.hide()
})
}}}function D(){var H=E();
if(!H){console.log("Unexpected: no selected issue");
return 
}G(H)
}function G(I){var H=AJS.$.Deferred();
if(I===B.getSelectedIssueModel().getEntity().id){B.getSelectedIssueModel().getIssueEventBus().triggerRefreshIssue({success:function(){H.resolve(arguments)
},error:function(){H.reject(arguments)
}})
}else{H.resolve()
}return H.promise()
}})();
// This file was automatically generated from viewissue-header.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.ViewIssue == 'undefined') { JIRA.Templates.ViewIssue = {}; }
if (typeof JIRA.Templates.ViewIssue.Header == 'undefined') { JIRA.Templates.ViewIssue.Header = {}; }


JIRA.Templates.ViewIssue.Header.issueHeader = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="issue-header-content"><div id="heading-avatar"><img id="project-avatar" alt="" class="project-avatar-48" height="48" src="', soy.$$escapeHtml(opt_data.issue.project.avatarUrls['48x48']), '" width="48"></div><ul class="breadcrumbs"><li><a id="project-name-val" href="', soy.$$escapeHtml(""), '/browse/', soy.$$escapeHtml(opt_data.issue.project.key), '">', soy.$$escapeHtml(opt_data.issue.project.name), '</a> </li>', (opt_data.issue.parent && opt_data.issue.parent.id) ? '<li><a title="' + soy.$$escapeHtml(opt_data.issue.parent.summary) + '" id="parent_issue_summary" href="' + soy.$$escapeHtml("") + '/browse/' + soy.$$escapeHtml(opt_data.issue.parent.key) + '">' + soy.$$escapeHtml(opt_data.issue.parent.key) + ' ' + soy.$$escapeHtml(opt_data.issue.parent.summary) + '</a> </li>' : '', '<li><a id="key-val" rel="', soy.$$escapeHtml(opt_data.issue.id), '" href="', soy.$$escapeHtml(""), '/browse/', soy.$$escapeHtml(opt_data.issue.key), '">', soy.$$escapeHtml(opt_data.issue.key), '</a></li></ul><h1 id="summary-val">', soy.$$escapeHtml(opt_data.issue.summary), '</h1><div class="command-bar"></div></div>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Header.linkGroup = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  if (opt_data.group.header && opt_data.group.header.label && (opt_data.group.links.length > 0 || opt_data.group.groups.length > 0 || opt_data.parentGroup && opt_data.parentGroup.links.length > 0)) {
    JIRA.Templates.ViewIssue.Header.dropdownLink(opt_data.group, output);
  } else {
    output.append('<ul ', (opt_data.group.id) ? 'id="' + soy.$$escapeHtml(opt_data.group.id) + '" ' : '', 'class="toolbar-group">');
    var linkList48 = opt_data.group.links;
    var linkListLen48 = linkList48.length;
    for (var linkIndex48 = 0; linkIndex48 < linkListLen48; linkIndex48++) {
      var linkData48 = linkList48[linkIndex48];
      JIRA.Templates.ViewIssue.Header.toolbarItem({link: linkData48}, output);
    }
    var subGroupList52 = opt_data.group.groups;
    var subGroupListLen52 = subGroupList52.length;
    for (var subGroupIndex52 = 0; subGroupIndex52 < subGroupListLen52; subGroupIndex52++) {
      var subGroupData52 = subGroupList52[subGroupIndex52];
      JIRA.Templates.ViewIssue.Header.linkGroup({group: subGroupData52, parentGroup: opt_data.group}, output);
    }
    output.append('</ul>');
  }
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Header.dropdownLink = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li class="toolbar-item toolbar-dropdown', (opt_data.links.length == 0 && opt_data.groups.length == 0) ? ' disabled' : '', '"><div>', (opt_data.links.length == 0 && opt_data.groups.length == 0) ? '<span' : '<a href="#"', (opt_data.header.id) ? ' id="' + soy.$$escapeHtml(opt_data.header.id) + '"' : '');
  JIRA.Templates.ViewIssue.Header.titleAttr({title: opt_data.header.title, label: opt_data.header.label}, output);
  output.append('class="toolbar-trigger ', (opt_data.links.length > 0 || opt_data.groups.length > 0) ? ' js-default-dropdown' : '', (opt_data.header.styleClass) ? ' ' + soy.$$escapeHtml(opt_data.header.styleClass) : '', '" >', (opt_data.header.iconClass) ? '<span class="icon ' + soy.$$escapeHtml(opt_data.header.iconClass) + '"></span>' : '', '<span class="dropdown-text">', soy.$$truncate(soy.$$escapeHtml(opt_data.header.label), 25, true), '</span><span class="icon drop-menu"></span>', (opt_data.links.length == 0 && opt_data.groups.length == 0) ? '</span>' : '</a>', '<div class="aui-list hidden">');
  if (opt_data.links.length > 0) {
    output.append('<ul class="aui-list-section aui-first', (opt_data.groups.length == 0) ? ' aui-last' : '', '">');
    var linkList108 = opt_data.links;
    var linkListLen108 = linkList108.length;
    for (var linkIndex108 = 0; linkIndex108 < linkListLen108; linkIndex108++) {
      var linkData108 = linkList108[linkIndex108];
      JIRA.Templates.ViewIssue.Header.dropdownItem(linkData108, output);
    }
    output.append('</ul>');
  }
  var groupList112 = opt_data.groups;
  var groupListLen112 = groupList112.length;
  for (var groupIndex112 = 0; groupIndex112 < groupListLen112; groupIndex112++) {
    var groupData112 = groupList112[groupIndex112];
    output.append('<ul class="aui-list-section', (opt_data.links.length == 0 && groupIndex112 == 0) ? ' aui-first' : '', (groupIndex112 == groupListLen112 - 1) ? ' aui-last' : '', '">');
    var linkList121 = groupData112.links;
    var linkListLen121 = linkList121.length;
    for (var linkIndex121 = 0; linkIndex121 < linkListLen121; linkIndex121++) {
      var linkData121 = linkList121[linkIndex121];
      JIRA.Templates.ViewIssue.Header.dropdownItem(linkData121, output);
    }
    output.append('</ul>');
  }
  output.append('</div></div></li>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Header.dropdownItem = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li class="aui-list-item"><a  href="', (opt_data.href) ? soy.$$escapeHtml(opt_data.href) : '#', '" class="aui-list-item-link', (opt_data.styleClass) ? ' ' + soy.$$escapeHtml(opt_data.styleClass) : '', '"');
  JIRA.Templates.ViewIssue.Header.titleAttr(opt_data, output);
  output.append((opt_data.id) ? 'id="' + soy.$$escapeHtml(opt_data.id) + '"' : '', '>', soy.$$truncate(soy.$$escapeHtml(opt_data.label), 25, true), '</a></li>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Header.toolbarItem = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<li class="toolbar-item"><a id="', soy.$$escapeHtml(opt_data.link.id), '"');
  JIRA.Templates.ViewIssue.Header.titleAttr({title: opt_data.link.title, label: opt_data.link.label}, output);
  output.append('class="toolbar-trigger', (opt_data.link.styleClass) ? ' ' + soy.$$escapeHtml(opt_data.link.styleClass) : '', '" href="', (opt_data.link.href) ? soy.$$escapeHtml(opt_data.link.href) : '#', '">', (opt_data.link.iconClass) ? '<span class="icon ' + soy.$$escapeHtml(opt_data.link.iconClass) + '"></span><span class="trigger-text">' + soy.$$truncate(soy.$$escapeHtml(opt_data.link.label), 25, true) + '</span>' : soy.$$truncate(soy.$$escapeHtml(opt_data.link.label), 25, true), '</a></li>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Header.titleAttr = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append((opt_data.title) ? 'title="' + soy.$$escapeHtml(opt_data.title) + '"' : (opt_data.label && opt_data.label.length > 25) ? 'title="' + soy.$$escapeHtml(opt_data.label) + '"' : '');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Header.opsbar = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="ops-cont"><div class="ops-menus aui-toolbar">');
  var linkGroupList195 = opt_data.issue.operations.linkGroups;
  var linkGroupListLen195 = linkGroupList195.length;
  for (var linkGroupIndex195 = 0; linkGroupIndex195 < linkGroupListLen195; linkGroupIndex195++) {
    var linkGroupData195 = linkGroupList195[linkGroupIndex195];
    output.append((linkGroupData195.id && linkGroupData195.id == 'view.issue.opsbar') ? '<div class="toolbar-split toolbar-split-left">' : (linkGroupData195.id && linkGroupData195.id == 'jira.issue.tools') ? '<div class="toolbar-split toolbar-split-right">' : '');
    JIRA.Templates.ViewIssue.Header.linkGroup({group: linkGroupData195}, output);
    output.append('</div>');
  }
  output.append('</div></div>');
  return opt_sb ? '' : output.toString();
};

// This file was automatically generated from viewissue-body.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.ViewIssue == 'undefined') { JIRA.Templates.ViewIssue = {}; }
if (typeof JIRA.Templates.ViewIssue.Body == 'undefined') { JIRA.Templates.ViewIssue.Body = {}; }


JIRA.Templates.ViewIssue.Body.issueBody = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="content-body aui-panel"><div class="aui-group issue-body"><div class="aui-item issue-main-column"></div><div id="viewissuesidebar" class="aui-item issue-side-column"></div></div></div>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Body.issuePanel = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  if (opt_data.renderHeader) {
    output.append('<div id="', soy.$$escapeHtml(opt_data.id), '_heading" class="mod-header"><ul class="ops">');
    var linkList10 = opt_data.headerLinks.links;
    var linkListLen10 = linkList10.length;
    for (var linkIndex10 = 0; linkIndex10 < linkListLen10; linkIndex10++) {
      var linkData10 = linkList10[linkIndex10];
      output.append('<li>');
      JIRA.Templates.Issues.Util.simpleLink({link: linkData10}, output);
      output.append('</li>');
    }
    if (opt_data.headerLinks.groups.length > 0) {
      output.append('<li class="drop"><div class="aui-dd-parent"><a href="#" class="icon drop-menu js-default-dropdown" title="', soy.$$escapeHtml("Options"), '"><span>', soy.$$escapeHtml("Options"), '</span></a><div class="aui-dropdown-content aui-list">');
      var groupList23 = opt_data.headerLinks.groups;
      var groupListLen23 = groupList23.length;
      for (var groupIndex23 = 0; groupIndex23 < groupListLen23; groupIndex23++) {
        var groupData23 = groupList23[groupIndex23];
        output.append((groupData23.header && groupData23.header.label) ? '<h5>' + soy.$$escapeHtml(groupData23.header.label) + '</h5>' : '', '<ul ', (groupData23.header && groupData23.header.id) ? 'id="' + soy.$$escapeHtml(groupData23.header.id) + '"' : '', 'class="aui-list-section', (groupData23.header && groupData23.header.styleClass) ? ' ' + soy.$$escapeHtml(groupData23.header.styleClass) : '', (groupIndex23 == 0) ? ' aui-first' : '', (groupIndex23 == groupListLen23 - 1) ? ' aui-last' : '', '">');
        var linkList47 = groupData23.links;
        var linkListLen47 = linkList47.length;
        for (var linkIndex47 = 0; linkIndex47 < linkListLen47; linkIndex47++) {
          var linkData47 = linkList47[linkIndex47];
          output.append('<li class="aui-list-item">');
          JIRA.Templates.Issues.Util.simpleLink({link: linkData47, additionalStyleClass: 'aui-list-item-link'}, output);
          output.append('</li>');
        }
        output.append('</ul>');
      }
      output.append('</div></div></li>');
    }
    output.append('</ul>');
    if (opt_data.subpanelHtmls.length > 0) {
      output.append('<div class="mod-header-panels">');
      var subPanelList61 = opt_data.subpanelHtmls;
      var subPanelListLen61 = subPanelList61.length;
      for (var subPanelIndex61 = 0; subPanelIndex61 < subPanelListLen61; subPanelIndex61++) {
        var subPanelData61 = subPanelList61[subPanelIndex61];
        output.append('<div class="mod-header-panel">', subPanelData61, '</div>');
      }
      output.append('</div>');
    }
    output.append('<h3 class="toggle-title">', soy.$$escapeHtml(opt_data.label), '</h3></div><div class="mod-content">', opt_data.html, '</div>');
  } else {
    output.append(opt_data.html);
  }
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Body.errorsLoading = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append(soy.$$escapeHtml("There were errors loading the issue."));
  if (opt_data.errorMessages) {
    output.append('<ul>');
    var msgList82 = opt_data.errorMessages;
    var msgListLen82 = msgList82.length;
    for (var msgIndex82 = 0; msgIndex82 < msgListLen82; msgIndex82++) {
      var msgData82 = msgList82[msgIndex82];
      output.append('<li>', soy.$$escapeHtml(msgData82), '</li>');
    }
    output.append('</ul>');
  }
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Body.focusShifter = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="aui-message closeable" id="focus-shifter"><label><span>', soy.$$escapeHtml("Go to field:"), '</span><div id="focus-shifter-content"></div></label><span class="aui-icon icon-close"></span></div>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Body.focusShifterTip = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="aui-message closeable" id="focus-shifter-tip"><strong>', soy.$$escapeHtml("Hint:"), '</strong> ', AJS.format("Press {0} to jump to fields for editing",'<kbd>,</kbd>'), '<br/><a href="', soy.$$escapeHtml(""), '/secure/ViewKeyboardShortcuts!default.jspa">', soy.$$escapeHtml("Show other keyboard shortcuts"), '</a><span class="aui-icon icon-close"/></div>');
  return opt_sb ? '' : output.toString();
};

// This file was automatically generated from viewissue-fields.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.ViewIssue == 'undefined') { JIRA.Templates.ViewIssue = {}; }
if (typeof JIRA.Templates.ViewIssue.Fields == 'undefined') { JIRA.Templates.ViewIssue.Fields = {}; }


JIRA.Templates.ViewIssue.Fields.saveErrorMessage = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var issueLink__soy3 = new soy.StringBuilder();
  if (opt_data.isAccessible) {
    JIRA.Templates.Issues.Util.issueAnchor(opt_data, issueLink__soy3);
  } else {
    issueLink__soy3.append(soy.$$escapeHtml(opt_data.issueKey));
  }
  issueLink__soy3 = issueLink__soy3.toString();
  output.append(AJS.format("Saving of \x3cstrong\x3e{0}\x3c/strong\x3e failed!",issueLink__soy3), '<ul>');
  var messageList12 = opt_data.errors;
  var messageListLen12 = messageList12.length;
  for (var messageIndex12 = 0; messageIndex12 < messageListLen12; messageIndex12++) {
    var messageData12 = messageList12[messageIndex12];
    output.append('<li>', soy.$$escapeHtml(messageData12), '</li>');
  }
  output.append('</ul>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Fields.field = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<form id="', soy.$$escapeHtml(opt_data.issue.id), '-form" class="ajs-dirty-warning-exempt" action= "#"><div class="inline-edit-fields">', opt_data.issue.editHtml, '</div><span class="overlay-icon throbber" /><div class="save-options"><button type="submit" class="aui-button submit" accessKey="', soy.$$escapeHtml("s"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to submit this form","s",opt_data.accessKey)), '"><span class="icon icon-save">', soy.$$escapeHtml("Save"), '</span></button><button type="cancel" class="aui-button cancel" accessKey="', soy.$$escapeHtml("`"), '" title="', soy.$$escapeHtml(AJS.format("Press {1}+{0} to cancel","`",opt_data.accessKey)), '"><span class="icon icon-cancel">', soy.$$escapeHtml("Cancel"), '</span></button></div></form>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.ViewIssue.Fields.resumableSaveErrorMessage = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  JIRA.Templates.ViewIssue.Fields.saveErrorMessage(opt_data, output);
  output.append('<div class="buttons-container"><button type="button" id="fix" class="aui-button">', (opt_data.isCurrentIssue) ? soy.$$escapeHtml("Fix errors") : soy.$$escapeHtml("Return to Issue"), '</button><a class="aui-button-cancel ignore" href="#">', soy.$$escapeHtml("Ignore"), '</a></div>');
  return opt_sb ? '' : output.toString();
};

// This file was automatically generated from util.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }
if (typeof JIRA.Templates.Issues == 'undefined') { JIRA.Templates.Issues = {}; }
if (typeof JIRA.Templates.Issues.Util == 'undefined') { JIRA.Templates.Issues.Util = {}; }


JIRA.Templates.Issues.Util.throbber = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="icon throbber" />');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issues.Util.simpleLink = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a', (opt_data.link.id) ? ' id="' + soy.$$escapeHtml(opt_data.link.id) + '"' : '', 'href="', (opt_data.link.href) ? soy.$$escapeHtml(opt_data.link.href) : '#', '"', (opt_data.link.styleClass || opt_data.additionalStyleClass) ? 'class="' + soy.$$escapeHtml(opt_data.link.styleClass) + ((opt_data.additionalStyleClass) ? ' ' + soy.$$escapeHtml(opt_data.additionalStyleClass) : '') + '"' : '', (opt_data.link.title) ? 'title="' + soy.$$escapeHtml(opt_data.link.title) + '"' : '', '><span>', soy.$$escapeHtml(opt_data.link.label), '</span></a>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issues.Util.exitPopup = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<form action="#" method="post" class="aui share-content-popup"><fieldset><div><label for="note">Woah! Not so fast. Please tell use why you\'re leaving Kickass:</label></div><textarea class="textarea" id="note"/></fieldset><div class="button-panel"><input class="button submit" type="submit" value="Submit"/></div></form>');
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issues.Util.issueNotFound = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append(AJS.format("The issue {0} does not exist in the search.",opt_data.issueAnchor));
  return opt_sb ? '' : output.toString();
};


JIRA.Templates.Issues.Util.issueAnchor = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a href="', soy.$$escapeHtml(""), '/browse/', soy.$$escapeHtml(opt_data.issueKey), '"> ', soy.$$escapeHtml(opt_data.issueKey), ' </a>');
  return opt_sb ? '' : output.toString();
};

jQuery.fn.serializeObject=function(){var B={};
var A=this.find(":input").serializeArray();
jQuery.each(A,function(){if(B[this.name]){if(!B[this.name].push){B[this.name]=[B[this.name]]
}B[this.name].push(this.value||"")
}else{B[this.name]=this.value||""
}});
return B
};
AJS.namespace("JIRA.Issues.EditIssueController");
JIRA.Issues.EditIssueController=JIRA.Issues.BaseModel.extend({properties:["issueId","issueKey","issueViewContext","fields","issueEventBus"],namedEvents:["save"],initialize:function(){_.bindAll(this);
this.set({fields:new JIRA.Issues.IssueFieldCollection()},{silent:true});
this.getFields().bind("add",this.createFieldView).bind("updated",this.handleFieldUpdate).bind("save",this.save);
this.getIssueEventBus().bindSavingStarted(this._handleSavingStarted);
this.getIssueEventBus().bindSaveSuccess(this._handleSaveSuccess);
this.getIssueEventBus().bindSaveError(this._handleSaveError);
this.getIssueEventBus().bindDismiss(this.save);
this.getIssueEventBus().bindSave(this.save);
this.getIssueEventBus().bindSave(this.cancelUneditedFields)
},_saveById:function(B){var A=this.getFields().get(B);
if(A){A.blurEdit()
}},_handleSaveError:function(D,C,B){var A=this;
if(B){this.applyErrors(B)
}else{_.each(C,function(F){var E=A.getFields().get(F);
if(E){E.handleSaveError()
}})
}},_handleSavingStarted:function(A){this.getFields().each(function(B){if(_.include(A,B.id)){B.handleSaveStarted()
}})
},handleFieldUpdate:function(B){var A=jQuery(JIRA.Issues.IssueFieldUtil.getFieldSelector(B.id));
if(!A.hasClass("editable-field")){this.createFieldView(B)
}},applyErrors:function(C){var A=C.errorCollection;
if(A&&A.errors){this.getFields().each(function(D){if(A.errors[D.id]){var E=_.find(C.fields,function(F){return F.id==D.id
});
if(E){D.setValidationError(E.editHtml,A.errors[D.id])
}}})
}if(A.errorMessages&&A.errorMessages.length){var B=JIRA.Templates.ViewIssue.Fields.saveErrorMessage({errors:A.errorMessages,issueKey:this.getIssueKey()});
JIRA.Messages.showErrorMsg(B,{closeable:true})
}},reset:function(){this.getFields().reset()
},cancelEdit:function(){this.getFields().each(function(A){A.cancelEdit()
})
},_handleSaveSuccess:function(B,C){var A=this.getFields().filter(function(D){return _.indexOf(C,D.id)>=0
});
_.each(A,function(D){D.handleSaveSuccess()
})
},getDirtyEditsInProgress:function(){return _.pluck(this.getFields().filter(function(A){return A.getEditing()&&A.isDirty()
}),"id")
},getEditsInProgress:function(){return _.pluck(this.getFields().filter(function(A){return A.getEditing()
}),"id")
},save:function(B,A){var E={},D=[];
var C=[B];
if(!B){C=this.getFields().filter(function(F){return !F.getSaving()&&F.getEditing()&&F.isDirty()
})
}else{if(!B.getEditing()||B.getSaving()){return 
}}_.each(C,function(F){D.push(F.getId());
_.extend(E,F.getCurrentParams())
});
if(D.length>0){this.triggerSave(this.getIssueId(),D,E,A)
}},cancelUneditedFields:function(){this.getFields().each(function(A){if(A.getEditing()&&!A.isDirty()&&!A.hasValidationError()){A.cancelEdit()
}})
},update:function(A){this.getFields().update(A)
},createFieldView:function(B){var A=jQuery(JIRA.Issues.IssueFieldUtil.getFieldSelector(B.id));
if(A.length===1){new JIRA.Issues.IssueFieldView({model:B,el:A,issueEventBus:this.getIssueEventBus()})
}}});
JIRA.Issues.SaveInProgressManager=JIRA.Issues.BaseModel.extend({properties:["savesInProgress"],namedEvents:["savingStarted","saveSuccess","saveError"],initialize:function(){this.setSavesInProgress([])
},saveIssue:function(G,C,F,D){var A=this,B,E;
E=_.extend(F,{issueId:G,atl_token:atl_token(),singleFieldEdit:true,fieldsToForcePresent:C});
var H=_.extend({type:"POST",url:contextPath+"/secure/IssueAction.jspa?decorator=none",error:function(I){A._handleSaveError(G,C,I)
},success:function(M,K,L,I){var J=I.data;
if(typeof J=="string"){A._handleHtmlResponse(G,C,J)
}else{A.triggerSaveSuccess(G,C,J)
}},complete:function(){A.removeSaveInProgress(B);
JIRA.trigger(JIRA.Events.INLINE_EDIT_SAVE_COMPLETE)
},data:E},D);
B=JIRA.SmartAjax.makeRequest(H);
this.addSaveInProgress(B);
this.triggerSavingStarted(G,C,F)
},hasSavesInProgress:function(){return this.getSavesInProgress().length>0
},removeSaveInProgress:function(A){this.setSavesInProgress(_.without(this.getSavesInProgress(),A))
},addSaveInProgress:function(A){var B=this.getSavesInProgress();
B.push(A);
this.setSavesInProgress(B)
},_handleHtmlResponse:function(G,B,D){var A=this;
var F=AJS.$(AJS.extractBodyFromResponse(D));
var E=F.find("#atl_token").val();
if(E){AJS.$("#atlassian-token").attr("content",E)
}var C=new JIRA.FormDialog({offsetTarget:"body",content:F});
this.triggerSaveError(G,B);
C._handleServerSuccess=function(H){C.hide();
var I=A._parseResponse(H);
if(I){A.triggerSaveSuccess(G,B,I)
}};
C.show()
},_handleSaveError:function(D,A,C){var B=this._parseResponse(C.responseText);
if(B){this.triggerSaveError(D,A,B)
}},_parseResponse:function(A){try{return JSON.parse(A)
}catch(B){this._showFatalErrorMessage();
return null
}},_showFatalErrorMessage:function(){var A="<p>"+"Communications Breakdown"+"</p><p>"+"Close this dialog and press refresh in your browser"+"</p>";
JIRA.Messages.showErrorMsg(A,{closeable:true})
}});
JIRA.Events.INLINE_EDIT_SAVE_COMPLETE="inlineEditSaveComplete";
AJS.namespace("JIRA.Issues.IssueFieldModel");
JIRA.Issues.IssueFieldModel=JIRA.Issues.BaseModel.extend({namedEvents:["editingStarted","focusRequested","editingCancelled","save","saveError","savingStarted","saveComplete","saveSuccess","updateRequired","validationError","modelDestroyed"],properties:["id","initParams","params","editHtml","viewHtml","required","fieldType","editing","saving","error","label"],initialize:function(){_.bindAll(this);
if(this.collection){this.collection.on("reset",this.handleCollectionReset)
}this.on("change:viewHtml",function(){var A=this.previous("viewHtml");
if(A){jQuery.cleanData(A)
}});
this.bindModelDestroyed(function(){var A=this.getViewHtml();
if(A){jQuery.cleanData(A)
}})
},handleCollectionReset:function(){this.triggerModelDestroyed()
},blurEdit:function(){if(this.getEditing()){if(this.isDirty()||this.hasValidationError()){this.save()
}else{this.cancelEdit()
}}},setValidationError:function(B,A){this.setSaving(false);
this.setError(A);
this.edit({ignoreBlur:true});
this.triggerSaveError();
this.triggerValidationError(B)
},handleSaveError:function(){this.setSaving(false);
this.triggerSaveError()
},cancelEdit:function(B){if(!this.cancelLocked){var A=new AJS.$.Event(JIRA.Events.BEFORE_INLINE_EDIT_CANCEL);
JIRA.trigger(A,[this.getId(),this.getFieldType(),B]);
if(!A.isDefaultPrevented()){this.cancelLocked=true;
if(this.getEditing()||this.getSaving()){this.setEditing(false);
this.setSaving(false);
this.unset("params");
this.unset("initParams");
this.triggerEditingCancelled();
this.unset("viewHtml")
}delete this.cancelLocked
}}},edit:function(A){if(!this.getEditing()){this.setEditing(true);
this.triggerEditingStarted(this,A)
}else{if(!A||!A.ignoreBlur){this.triggerFocusRequested(this,A)
}}},getCurrentParams:function(){this.triggerUpdateRequired();
var C={};
if(this.getParams()){C=this.getParams()
}else{if(this.getInitParams()){C=this.getInitParams()
}else{var B=AJS.$("<div />").html(this.getEditHtml());
this.setInitParams(B.serializeObject());
C=this.getInitParams()
}}var A={};
_.each(C,function(E,D){A[D]=E
});
return A
},isEditable:function(){if(this.getEditHtml()){return AJS.$(this.getEditHtml()).find("textarea, :text,:radio,:checkbox, select").length!==0
}return false
},hasValidationError:function(){return !!this.getError()
},switchElToEdit:function(A){if(!this.getViewHtml()){this.setViewHtml(A.contents())
}A.contents().detach();
A.html(JIRA.Templates.ViewIssue.Fields.field({issue:this.toJSON(),accessKey:JIRA.Issues.IssueFieldUtil.getAccessKeyModifier()}));
if(!this.getInitParams()){this.setInitParams(A.serializeObject())
}this.setEditing(true)
},update:function(A){if(this.getEditing()){this.setParams(A.serializeObject())
}},handleSaveSuccess:function(){this.setSaving(false);
this.setEditing(false);
this.unset("viewHtml");
this.unset("initParams");
this.setError(null)
},handleSaveStarted:function(){this.setSaving(true);
this.triggerSavingStarted()
},save:function(){if(!this.getSaving()){this.triggerUpdateRequired();
this.triggerSave(this)
}},isDirty:function(){this.triggerUpdateRequired();
return this._isDirty(this.getCurrentParams())
},_isDirty:function(A){return JSON.stringify(A)!==JSON.stringify(this.getInitParams())
},matchesFieldSelector:function(){return JIRA.Issues.IssueFieldUtil.matchesFieldSelector(this.id)
}},{IS_EDITABLE:function(A){return A.isEditable()
}});
AJS.namespace("JIRA.Issues.IssueFieldCollection");
JIRA.Issues.IssueFieldCollection=JIRA.Issues.BaseCollection.extend({model:JIRA.Issues.IssueFieldModel,initialize:function(){_.bindAll(this);
this.bind("editingStarted",this._handleEditingStarted)
},_handleEditingStarted:function(B,A){A=A||{};
if(A.ignoreBlur){return 
}this.each(function(C){if(B!==C&&C.getEditing()){C.blurEdit()
}})
},update:function(B){var A=this;
_.each(B,function(D){var C=A.get(D.id);
if(C){if(C.hasValidationError()){delete D.editHtml
}C.set(D,{silent:true});
A.trigger("updated",C)
}else{A.add(D)
}})
},cancelEdit:function(){this.each(function(A){A.cancelEdit()
})
},isDirty:function(){return this.any(function(A){return A.isDirty()
})
},getDirtyFields:function(){return this.filter(function(A){return A.isDirty()
})
}});
JIRA.Events.INLINE_EDIT_STARTED="inlineEditStarted";
JIRA.Events.BEFORE_INLINE_EDIT_CANCEL="inlineEditCancelled";
JIRA.Events.INLINE_EDIT_BLURRED="inlineEditBlurred";
JIRA.Events.INLINE_EDIT_FOCUSED="inlineEditFocused";
JIRA.Events.INLINE_EDIT_REQUESTED="inlineEditRequested";
JIRA.Events.PANEL_REFRESHED="panelRefreshed";
JIRA.Events.LOCK_PANEL_REFRESHING="lockPanelRefreshing";
JIRA.Events.UNLOCK_PANEL_REFRESHING="unlockPanelRefreshing";
JIRA.Events.REFRESH_ISSUE_PAGE="refreshIssuePage";
JIRA.Issues.CANCEL_REASON={escPressed:"escPressed"};
AJS.$(function(){AJS.namespace("JIRA.Issues.InlineEdit");
JIRA.Issues.InlineEdit.BLUR_FOCUS_TIMEOUT=50;
var A=JIRA.Issues.InlineEdit.BlurTriggers={Default:function(E,I){I=I.nextAll(".save-options").andSelf();
var H=":input, a[href], [tabindex]";
var G;
var F=B(I);
var D={focus:function(){if(!F){F=true;
JIRA.trigger(JIRA.Events.INLINE_EDIT_FOCUSED,[E])
}},blur:function(){if(G){clearTimeout(G)
}G=setTimeout(C,JIRA.Issues.InlineEdit.BLUR_FOCUS_TIMEOUT)
}};
I.attr("tabindex",1).bind(D).delegate(H,D);
function C(){if(!B(I)){F=false;
JIRA.trigger(JIRA.Events.INLINE_EDIT_BLURRED,[E])
}}}};
function B(D){var C=document.activeElement;
return D.find(C).length>0||D.filter(C).length>0
}JIRA.Issues.InlineEdit.BlurTriggerMapping={system:{summary:A.Default,priority:A.Default,issuetype:A.Default,components:A.Default,versions:A.Default,fixVersions:A.Default,assignee:A.Default,reporter:A.Default,environment:A.Default,description:A.Default,labels:A.Default,duedate:A.Default},custom:{cascadingselect:A.Default,datepicker:A.Default,datetime:A.Default,"float":A.Default,grouppicker:A.Default,labels:A.Default,multicheckboxes:A.Default,multigrouppicker:A.Default,multiselect:A.Default,multiuserpicker:A.Default,multiversion:A.Default,project:A.Default,select:A.Default,radiobuttons:A.Default,textarea:A.Default,textfield:A.Default,url:A.Default,userpicker:A.Default,version:A.Default}};
JIRA.bind(JIRA.Events.INLINE_EDIT_STARTED,function(F,D,C,G){var E;
if(C){E=JIRA.Issues.InlineEdit.BlurTriggerMapping.custom[C]
}else{E=JIRA.Issues.InlineEdit.BlurTriggerMapping.system[D]
}if(E){E(D,G)
}})
});
JIRA.Issues.UnhandledSaveErrorView=JIRA.Issues.BaseView.extend({render:function(C){if(!C.response||!C.response.errorCollection){return 
}var F=C.issueEntity.id;
var B=C.response.errorCollection;
var G=B.errorMessages.concat(_.values(B.errors));
var E=this._getTemplate(C);
var D;
D=JIRA.Templates.ViewIssue.Fields[E]({errors:G,issueKey:C.issueEntity.key,isAccessible:this._isAccessible(C),isCurrentIssue:C.isCurrentIssue});
var A=JIRA.Messages.showErrorMsg(D,{closeable:true});
A.find("#fix").click(function(H){C.viewIssueLoader.replaySaveError(C.issueEntity,C.attemptedSavedIds,C.response);
H.preventDefault();
A.remove()
});
A.find(".ignore").click(function(H){A.remove();
H.preventDefault()
})
},_isAccessible:function(A){return !!(A.response.fields&&A.response.fields.length)
},_getTemplate:function(A){var B=_.any(A.response.fields,function(C){return C.id===A.attemptedSavedIds[0]&&C.editHtml
});
return B?"resumableSaveErrorMessage":"saveErrorMessage"
}});
JIRA.Issues.ViewIssueController=JIRA.Issues.BaseModel.extend({namedEvents:["unhandledSaveError","issueDataUpdated","issueLoaded","issueLoading","returnToSearch"],properties:["saveInProgressManager","viewIssueContext","selectedIssueModel","selectedEditIssueController"],initialize:function(){var A=this;
_.bindAll(this);
var C=jQuery(window);
var B=window.onbeforeunload;
window.onbeforeunload=function(){return B.apply(this,arguments)||A._handleUnload.apply(this,arguments)
};
this.on("destroy",function(){window.onbeforeunload=B
});
JIRA.bind(JIRA.Events.REFRESH_ISSUE_PAGE,function(E,F,D){if(parseInt(F,10)===parseInt(A.getSelectedIssueModel().id,10)){A.getSelectedIssueModel().getIssueEventBus().triggerRefreshIssue(D)
}});
this.getSaveInProgressManager().bindSaveSuccess(function(E,F,D){if(A.getSelectedIssueModel()&&E===A.getSelectedIssueModel().id){A._handleSelectedIssueSaveSuccess(E,F,D)
}});
this.getSaveInProgressManager().bindSaveError(function(H,F,D){if(D){A._parseLoadResponseData(D)
}var E=AJS.$(".aui-blanket:visible").length>0;
var G=A.getSelectedIssueModel()&&H===A.getSelectedIssueModel().id;
if(G){if(E){new JIRA.Issues.UnhandledSaveErrorView().render({issueEntity:A.getSelectedIssueModel().getEntity(),attemptedSavedIds:F,response:D,viewIssueLoader:A,isCurrentIssue:G});
A.getSelectedEditIssueController().cancelEdit()
}else{A._handleSelectedIssueSaveError(H,F,D)
}}else{A.triggerUnhandledSaveError(H,F,D)
}A._checkRefreshIssueRowData(H)
});
this.getSaveInProgressManager().bindSavingStarted(function(E,D){A._recordTimeStampForAnalytic();
if(A.getSelectedIssueModel()&&E===A.getSelectedIssueModel().id){A.getSelectedIssueModel().getIssueEventBus().triggerSavingStarted(D)
}})
},replaySaveError:function(A,C,B){var E=A.id;
if(this.getSelectedIssueModel()&&E===this.getSelectedIssueModel().id){this._handleSelectedIssueSaveError(E,C,B);
var D=this.getSelectedEditIssueController().getFields().filter(function(F){return F.getEditing()
});
if(D.length===1){D[0].triggerFocusRequested()
}}else{this.load(A,B)
}},_destroySelectedViewIssue:function(){var A=this.getSelectedIssueModel();
if(this.getSelectedIssueModel()){this.setSelectedIssueModel(undefined);
A.dismiss()
}},_getFieldsData:function(C){var A=this,B=jQuery.Deferred();
jQuery.ajax({url:contextPath+"/secure/EditAction!default.jspa?decorator=none",data:{issueId:C},success:function(D){var E=JIRA.Issues.IssueFieldUtil.transformFieldHtml(D);
B.resolveWith(A,[E.fields])
},error:function(D){if(D.status===400||D.status===401){B.resolveWith(A,[null])
}else{B.rejectWith(A,arguments)
}}});
return B.promise()
},_checkRefreshIssueRowData:function(B){if(this._refreshRowDataAfterUpdate){var A=this;
return jQuery.ajax({url:contextPath+"/rest/api/latest/issue/"+B+"?expand=operations",success:function(C){A.triggerIssueDataUpdated(B,C)
}})
}},refreshRowDataAfterUpdate:function(){this._refreshRowDataAfterUpdate=true;
return this
},_parsePanelData:function(A){return{leftPanels:A.leftPanels,rightPanels:A.rightPanels,infoPanels:A.infoPanels}
},showLoadingIndicator:function(){var A=this,B=440,C=0;
this.hideLoadingIndicator();
this.loadingWait=window.setTimeout(function(){clearInterval(A.loadingTimer);
A.$loadingIndicator=AJS.$("<div />").addClass("aui-loading").appendTo("body").show();
A.loadingTimer=window.setInterval(function(){if(C===B){C=0
}C=C+40;
A.$loadingIndicator.css("backgroundPosition","0 -"+C+"px")
},50)
},200)
},hideLoadingIndicator:function(){clearInterval(this.loadingWait);
clearInterval(this.loadingTimer);
if(this.$loadingIndicator){this.$loadingIndicator.remove();
delete this.$loadingIndicator
}},_update:function(B){var A=this;
this.startIssueLoad=new Date();
jQuery.ajax({url:contextPath+"/secure/IssueAction!default.jspa?decorator=none&issueId="+B.issueId,success:function(C){A._handleLoadSuccess(B,C)
},error:function(F){var C;
try{C=JSON.parse(F.responseText)||{}
}catch(E){C={}
}var D=JIRA.Templates.ViewIssue.Body.errorsLoading(C);
JIRA.Messages.showErrorMsg(D,{closeable:true});
A._handleLoadError(B)
}})
},_handleLoadSuccess:function(B,C){var D=new Date().getTime();
this._parseLoadResponseData(C);
this._checkRefreshIssueRowData(B.issueId);
if(C){var A=B.editable=C.fields&&C.fields.length;
if(A){B.fieldsInProgress=B.editIssueController.getEditsInProgress()
}if(B.lastEditData&&B.lastEditData.errorCollection){B.editIssueController.applyErrors(B.lastEditData)
}if(A){B.issueViewModel.update(C,B);
B.editIssueController.update(C.fields,B.fieldsSaved)
}else{B.editIssueController.reset();
B.issueViewModel.update(C,B)
}}this._handleLoadComplete(B);
this.triggerIssueLoaded(B.issueViewModel);
if(B.success){B.success()
}if(B.complete){B.complete()
}console.log("Client updated issue in "+(new Date().getTime()-D)+"ms")
},_handleLoadError:function(A,B){if(B&&(!B.fields||!B.fields.length)){A.editIssueController.reset();
A.issueViewModel.update(B,A)
}this._handleLoadComplete(A);
if(A.error){A.error()
}if(A.complete){A.complete()
}},_handleLoadComplete:function(A){if(this.startIssueLoad){JIRA.Issues.Analytics.trigger("kickass.issueLoadDuration",{duration:new Date()-this.startIssueLoad})
}this.hideLoadingIndicator();
A.issueViewModel.getIssueEventBus().triggerIssueRefreshed(A.issueId);
JIRA.trace("jira.issue.refreshed",{id:A.issueId});
JIRA.trigger(JIRA.Events.ISSUE_REFRESHED,[A.issueId]);
this._logAnalyticAfterUpdate()
},_parseLoadResponseData:function(A){A=JIRA.Issues.IssueFieldUtil.transformFieldHtml(A);
if(A.panels){A.panels=this._parsePanelData(A.panels)
}},dismiss:function(){this.deactivateViewIssueScrolling();
this._destroySelectedViewIssue()
},deactivateViewIssueScrolling:function(){if(this.getSelectedIssueModel()){this.trigger("issueDismissed",this.getSelectedIssueModel())
}},_recordTimeStampForAnalytic:function(){if(!this._saveStarted){this._saveStarted=[]
}this._saveStarted.push((new Date).getTime())
},_logAnalyticAfterUpdate:function(){if(this._saveStarted&&this._saveStarted.length){var A=this._saveStarted.shift();
JIRA.Issues.Analytics.trigger("kickass.issueTotalSaveDuration",{duration:(new Date).getTime()-A})
}},_handleSelectedIssueSaveError:function(H,D,E){var C=this.getSelectedEditIssueController(),B=this.getSelectedIssueModel().getIssueEventBus(),A=this.getSelectedIssueModel(),G,F;
if(E){G=_.keys(E.errorCollection.errors);
F=_.without(D,G)
}B.triggerSaveError(H,D,E);
this._handleLoadError({editIssueController:C,issueViewModel:A,issueId:H,fieldsSaved:F,initialize:false},E)
},_handleSelectedIssueSaveSuccess:function(E,F,D){var C=this.getSelectedEditIssueController(),B=this.getSelectedIssueModel().getIssueEventBus(),A=this.getSelectedIssueModel();
B.triggerSaveSuccess.apply(B,arguments);
this._handleLoadSuccess({editIssueController:C,issueViewModel:A,issueId:E,fieldsSaved:F,fieldsInProgress:C.getEditsInProgress(),initialize:false},D)
},_handleUnload:function(){var A=this.getSelectedEditIssueController();
if(A){if(A.getDirtyEditsInProgress().length>0){return "You are still editing this page. Are you sure you want to leave?"
}}},_initIssueObjects:function(D){var B=this;
var E=new JIRA.Issues.IssueEventBus({issueId:D.id});
E.bindOpenFocusShifter(this._openFocusShifter);
E.bindRefreshIssue(function(F){F=F||{};
B._update({editIssueController:C,issueViewModel:A,issueId:D.id,success:F.success,error:F.error,complete:F.complete})
});
var A=new JIRA.Issues.IssueViewModel({id:D.id,issueEventBus:E,statusColorSupport:D.statusColorSupport});
A.bindReturnToSearch(function(){B.triggerReturnToSearch()
});
this.setSelectedIssueModel(A);
var C=new JIRA.Issues.EditIssueController({issueId:D.id,issueKey:D.key,issueViewContext:jQuery(this.getViewIssueContext()),issueEventBus:E});
C.bindSave(function(I,G,H,F){B.getSaveInProgressManager().saveIssue(I,G,H,F)
});
this.setSelectedEditIssueController(C);
new JIRA.Issues.IssueView({model:A,el:this.getViewIssueContext()});
return{issueEventBus:E,issueViewModel:A,editIssueController:C}
},applyToDom:function(B){var A;
B.id=+B.id;
A=this._initIssueObjects(B);
this._getFieldsData(B.id).done(function(C){var D=C&&C.length;
if(D){A.editIssueController.update(C);
this._showFocusShifterTip()
}});
A.issueViewModel.setEntity(B);
A.issueEventBus.triggerUpdateFromDom(this.getViewIssueContext());
this.triggerIssueLoaded(A.issueViewModel)
},load:function(B,C){this.triggerIssueLoading(B.id,C);
this.trigger("beforeIssueRequest");
this._destroySelectedViewIssue();
var A=this._initIssueObjects(B);
this._update({editIssueController:A.editIssueController,issueViewModel:A.issueViewModel,issueId:B.id,lastEditData:C,initialize:true});
this.showLoadingIndicator()
},_openFocusShifter:function(){new JIRA.Issues.FocusShifter({viewIssueController:this,hideTriggers:{"Dialog.show":JIRA,"editingStarted focusRequested":this.getSelectedEditIssueController().getFields()}})
},_showFocusShifterTip:function(){var A=this.getSelectedEditIssueController().getFields().models;
var B=JIRA.Issues.FocusShifter._shouldShow(A);
if(B&&JIRA.Issues.FocusShifterTip){new JIRA.Issues.FocusShifterTip()
}}});
JIRA.Events.ISSUE_REFRESHED="issueRefreshed";
AJS.namespace("JIRA.Issues.FocusShifter");
JIRA.Issues.FocusShifter=function(D){_.extend(this,Backbone.Events);
D=_.defaults(D,{messageFactory:JIRA.Messages.showMsg});
var E=50;
var F=27;
var C=D.viewIssueController;
var A=C.getSelectedEditIssueController();
this._bindHideTriggers=function(){this.bind("show",function(){_.each(D.hideTriggers,function(G,H){G.bind(H,this.hide)
});
this.bind("hide",function(){_.each(D.hideTriggers,function(G,H){G.unbind(H,this.hide)
})
})
})
};
this._hide=function(){if(this.$message){this.$message.detach()
}this.trigger("hide")
};
this._hideOnBlur=function(){var G=this;
AJS.$("*",this.$message).blur(function(H){setTimeout(function(){if(!G.queryableDropdownSelect.disabled){var I=G.$message;
if(I&&!I.find(document.activeElement).length&&I!==document.activeElement){G._hide()
}}},E)
})
};
this._loadLastField=function(){var J=sessionStorage.getItem("JIRA.Issues.FocusShifter.lastFieldId");
if(J!==null){var H=A.getFields().models;
var G=JIRA.Issues.FocusShifter._suggestions(H)();
var I=_.find(G,function(K){return K.value()===J
});
if(I){this.queryableDropdownSelect.$field.val(I.label());
this.queryableDropdownSelect._handleCharacterInput(false,false)
}}};
this._show=function(){if(!this.$message){this.$message=D.messageFactory("",{closeable:true,type:JIRA.Templates.ViewIssue.Body.focusShifter})
}var H=A.getFields();
var I=AJS.$("<div/>").addClass("aui-list").appendTo("#focus-shifter-content");
this.queryableDropdownSelect=new AJS.QueryableDropdownSelect({element:I,suggestions:JIRA.Issues.FocusShifter._suggestions(H.models)});
this._loadLastField();
this.queryableDropdownSelect.$field.focus().select();
var G=this;
this.$message.keyup(function(J){if(J.keyCode===F){J.stopPropagation();
G._hide()
}});
I.delegate("li","click",function(L){var K=AJS.$(this).data("descriptor");
if(K){var J=H.get(K.value());
if(J){sessionStorage.setItem("JIRA.Issues.FocusShifter.lastFieldId",J.id);
if(!J.getSaving()){J.edit()
}else{G.queryableDropdownSelect.disable();
JIRA.one(JIRA.Events.ISSUE_REFRESHED,function(){G._hide();
J.edit()
})
}}}L.preventDefault()
});
JIRA.Issues.FocusShifter.suppressTip();
this._hideOnBlur();
this.trigger("show")
};
_.bindAll(this);
this._bindHideTriggers();
var B=A.getFields().models;
if(JIRA.Issues.FocusShifter._shouldShow(B)){this._show()
}JIRA.Issues.Analytics.trigger("kickass.focusshifteropened")
};
JIRA.Issues.FocusShifter._shouldShow=function(A){return JIRA.Issues.FocusShifter._suggestions(A)().length>0
};
JIRA.Issues.FocusShifter._suggestions=function(B){var C=function(D){return new AJS.ItemDescriptor({label:D.getLabel(),value:D.id})
};
var A=function(D){return JIRA.Issues.IssueFieldModel.IS_EDITABLE(D)&&D.matchesFieldSelector()
};
return function(){var D=_.filter(B,A);
return _.map(D,C)
}
};
JIRA.Issues.FocusShifter.suppressTip=function(){AJS.$.ajax({data:"tipKey=focusShifter",type:"POST",url:contextPath+"/rest/issueNav/1/suppressedTips"})
};
JIRA.Issues.IssueFieldView=JIRA.Issues.BaseView.extend({events:{"click .cancel":"onClickCancel",keydown:"onKeyCancel","click .submit":"onSubmit",click:"onEdit","submit form":"onSubmit","beforeBlurInput *":"_preventBlurByEsc"},initialize:function(A){_.bindAll(this);
this.model.bindValidationError(this.handleValidationError);
this.model.bindEditingStarted(this.switchToEdit);
this.model.bindFocusRequested(this.focus);
this.model.bindEditingCancelled(this.switchToRead);
this.model.bindSaveError(this.handleSaveError);
this.model.bindUpdateRequired(this.updateModel);
this.model.bindSavingStarted(this.handleSavingStarted);
this.model.bindModelDestroyed(this.destroy);
this.decorate();
this.issueEventBus=A.issueEventBus;
this.issueEventBus.bindPanelRendered(this.handlePanelRendered);
this.model.setFieldType(this.$el.data("fieldtype"));
this._editDelay=0;
JIRA.bind(JIRA.Events.INLINE_EDIT_BLURRED,_.bind(function(C,B){if(B===this.model.getId()){this._onPossibleBlur()
}},this));
JIRA.bind(JIRA.Events.INLINE_EDIT_REQUESTED,_.bind(function(C,B){if(B!==this.model.getId()&&this._editDelay!==0){clearTimeout(this._editDelay);
this._editDelay=0
}},this))
},destroy:function(){this.issueEventBus.off("panelRendered",this.handlePanelRendered)
},decorate:function(){if(this.model.isEditable()&&!this.model.getEditing()){this.$el.addClass("editable-field inactive");
this.$el.append('<span class="overlay-icon icon icon-edit-sml" />');
this._addToolTip()
}},getEditElements:function(){return this.$el.find(".inline-edit-fields")
},_addToolTip:function(){this.$el.attr("title","Click to edit");
jQuery("a:not([title])",this.$el).attr("title","Follow link")
},_removeToolTip:function(){this.$el.removeAttr("title")
},_stealAccessKeys:function(){jQuery("[accessKey='"+"s"+"']").attr("accessKey","_s");
jQuery("[accessKey='"+"`"+"']").attr("accessKey","_x")
},_returnAccessKeys:function(){jQuery("[accessKey=_s]").attr("accessKey","s");
jQuery("[accessKey=_x]").attr("accessKey","`")
},_handleEditingStarted:function(){var A=this.$el.find(".field-tools");
JIRA.trigger(JIRA.Events.NEW_CONTENT_ADDED,[this.$el,JIRA.CONTENT_ADDED_REASON.inlineEditStarted]);
JIRA.trigger(JIRA.Events.INLINE_EDIT_STARTED,[this.model.getId(),this.model.getFieldType(),this.getEditElements(),this.$el]);
this.$el.find(".save-options").attr("tabindex",1).prepend(A)
},handleValidationError:function(A){this.$el.html(JIRA.Templates.ViewIssue.Fields.field({issue:{id:this.model.id,editHtml:A},accessKey:JIRA.Issues.IssueFieldUtil.getAccessKeyModifier()}));
this.$el.find(".error").attr("data-field",this.model.id);
this._handleEditingStarted()
},handlePanelRendered:function(A,B){var C=jQuery(JIRA.Issues.IssueFieldUtil.getFieldSelector(this.model.id),B);
if(C.length===1){this.$el=C;
this.el=this.$el[0];
this.decorate();
this.delegateEvents()
}},handleSaveError:function(){this.$el.find(":input").removeAttr("disabled").trigger("enable");
this.$el.removeClass("saving saving-"+this.model.id)
},handleSavingStarted:function(){this.$el.find(":input").attr("disabled","disabled").trigger("disable");
this.$el.addClass("saving saving-"+this.model.id)
},updateModel:function(){this.model.update(this.$el)
},reveal:function(){var A=this.$el.height()*2;
this.$el.scrollIntoView({marginTop:AJS.$("#stalker").height()+A,marginBottom:A});
this.$el.trigger("reveal")
},focus:function(){this.reveal();
this.$el.find(":input").removeAttr("disabled");
if(jQuery(".aui-blanket").length===0){this.$el.find(":input:visible:first").focus().select()
}},switchToEdit:function(){this._stealAccessKeys();
this._removeToolTip();
this.$el.data("originalHeight",this.$el.height());
this.$el.removeClass("inactive saving").addClass("active");
this.model.switchElToEdit(this.$el);
this._handleEditingStarted();
this.focus()
},switchToRead:function(){this._addToolTip();
this.$el.addClass("inactive").removeClass("active");
this.$el.html(this.model.getViewHtml());
this.$el.closest("form").unbind("submit",this.onSubmit);
this._returnAccessKeys()
},onKeyCancel:function(A){if(A.keyCode===27){this.model.cancelEdit(JIRA.Issues.CANCEL_REASON.escPressed);
A.preventDefault()
}},onClickCancel:function(A){this.model.cancelEdit();
A.preventDefault()
},onSubmit:function(B){var A=new jQuery.Event("before-submit");
this.$el.find("form").trigger(A);
if(!A.isDefaultPrevented()){this.$el.find(":focus").blur();
this.model.save();
this._returnAccessKeys()
}B.preventDefault()
},onEdit:function(B){var C=new Date().getTime();
if(this._editDelay!==0){clearTimeout(this._editDelay);
this._editDelay=0
}else{if(this.$el.hasClass("inactive")&&jQuery(B.target).closest("a, .uneditable").length===0&&this._getCurrentlySelectedText()===""){JIRA.trigger(JIRA.Events.INLINE_EDIT_REQUESTED,[this.model.getId()]);
var A=this;
if(jQuery(B.target).is(".overlay-icon.icon-edit-sml")){jQuery(document).one("click",function(D){if(!D.isDefaultPrevented()){A.model.edit()
}})
}else{this._editDelay=setTimeout(function(){if(!B.isDefaultPrevented()&&A.$el.hasClass("inactive")&&A._getCurrentlySelectedText()===""){A.model.edit()
}A._editDelay=0
},250)
}}}},_onPossibleBlur:function(){if(this.model.getSaving()){return 
}if(jQuery(".aui-blanket").length>0){return 
}this.model.blurEdit()
},_preventBlurByEsc:function(A){A.preventDefault()
},_getCurrentlySelectedText:function(){if(jQuery(document.activeElement).is(":input")){return""
}if(document.selection&&document.selection.createRange){return document.selection.createRange().text||""
}if(window.getSelection){return window.getSelection().toString()
}return""
}});
JIRA.Issues.IssueFieldUtil={getFieldSelector:function(A){if(A==="issuetype"){return"#type-val"
}else{if(A==="fixVersions"){return"#fixfor-val"
}else{if(A==="summary"){return"#summary-val"
}else{if(A==="labels"){return"#wrap-labels .value"
}else{if(A==="duedate"){return"#due-date"
}else{return"#"+A+"-val"
}}}}}},matchesFieldSelector:function(A){return jQuery(JIRA.Issues.IssueFieldUtil.getFieldSelector(A)).length===1
},transformFieldHtml:function(A){A.fields=_.map(A.fields,function(C){var B=AJS.$("<div />").htmlCatchExceptions(C.editHtml);
B.find("legend,label").eq(0).remove();
return{id:C.id,label:C.label,editHtml:B.html(),required:C.required}
});
return A
},getAccessKeyModifier:function(){var B=AJS.$("#home_link_drop").attr("title"),A=/\(([\w\+]+)\+\w\)/i;
if(A.test(B)){return A.exec(B)[1]
}else{return"Alt"
}}};
AJS.namespace("JIRA.Issues.IssuePanelView");
(function(A){JIRA.Issues.IssuePanelView=JIRA.Issues.BaseView.extend({tagName:"div",template:JIRA.Templates.ViewIssue.Body.issuePanel,initialize:function(B){_.bindAll(this);
this.issueEventBus=B.issueEventBus;
this.model.bindUpdated(this.applyDomUpdate)
},applyDomUpdate:function(C){var B=this.model.applyUpdates(this._renderPanel(),this.$el,C.fieldsSaved,C.fieldsInProgress);
if(B){if(B.type==="replace"){this.$el.replaceWith(B.$el);
this.setElement(B.$el)
}JIRA.trigger(JIRA.Events.PANEL_REFRESHED,[this.model.id,this.$el,B.$existing]);
this.issueEventBus.triggerPanelRendered(this.model.id,this.$el);
_.each(B.updates,function(D){JIRA.trigger(JIRA.Events.NEW_CONTENT_ADDED,[D,JIRA.CONTENT_ADDED_REASON.panelRefreshed])
})
}},render:function(){return this.$el=this._renderPanel()
},_renderPanel:function(){var C;
var B=this.model.getEntity();
if(B.renderHeader){C=jQuery("<div/>");
C.attr("id",this.model.getPanelId());
C.addClass("module toggle-wrap");
if(B.styleClass){C.addClass(B.styleClass)
}C.html(this.template(B))
}else{C=A(this.template(B))
}return C
}})
})(AJS.$);
AJS.namespace("JIRA.Issues.IssueBodyView");
(function(A){JIRA.Issues.IssueBodyView=JIRA.Issues.BaseView.extend({tagName:"div",className:"content-container issue-body-content",panelLocations:{leftPanels:".issue-main-column",rightPanels:".issue-side-column",infoPanels:".issue-body"},template:JIRA.Templates.ViewIssue.Body.issueBody,initialize:function(){_.bindAll(this);
this.model.getPanels().bindPanelRemoved(this.removePanel);
this.model.getPanels().bindPanelAdded(this.addPanel);
this.model.getIssueEventBus().bindUpdateFromDom(this.updateFromDom)
},updateFromDom:function(D){var B=this;
this.setElement(D.find(".issue-body-content"));
function C(H,F){var G=F.id;
if(G==="addcomment"){G="addcommentmodule"
}var E=B.model.getPanels().createPlaceholderModel(H,G);
if(E){new JIRA.Issues.IssuePanelView({el:F,model:E,issueEventBus:B.model.getIssueEventBus()})
}}this.$el.find(this.panelLocations.leftPanels+" .module").each(function(){C("leftPanels",this)
});
this.$el.find(this.panelLocations.rightPanels+" .module").each(function(){C("rightPanels",this)
});
this.$el.find(this.panelLocations.infoPanels+". module").each(function(){C("infoPanels",this)
});
if(A("#edit-issue").length===1){if(this.$el.find("#descriptionmodule").length===0){this.model.getPanels().addDescriptionPanel()
}}},render:function(){var C=this.model.getPanels();
var B=A(this.template());
this.$el.html(B);
this._renderPanels(C.getLeftPanels(),"leftPanels");
this._renderPanels(C.getRightPanels(),"rightPanels");
this._renderPanels(C.getInfoPanels(),"infoPanels");
this.expandToScreenEdge();
return this.$el
},expandToScreenEdge:function(){var B=20;
this.$el.css("height",AJS.$(window).height()-this.$el.offset().top-B)
},removePanel:function(C){var B=this._convertLocation(C.location);
this.$(B).find("#"+C.panel.getPanelId()).remove()
},addPanel:function(C){var D=new JIRA.Issues.IssuePanelView({model:C.panel,issueEventBus:this.model.getIssueEventBus()});
var E=this.$(this._convertLocation(C.location));
var B=E.children();
if(C.index>=B.length){E.append(D.render())
}else{jQuery(B[C.index-1]).after(D.render())
}JIRA.trigger(JIRA.Events.NEW_CONTENT_ADDED,[E,JIRA.CONTENT_ADDED_REASON.panelRefreshed])
},_convertLocation:function(B){return this.panelLocations[B]
},_renderPanels:function(D,C){var B=this;
_.each(D,function(E,F){B.addPanel({location:C,panel:E,index:F})
})
}})
})(AJS.$);
AJS.namespace("JIRA.Issues.IssueHeaderView");
(function(A){JIRA.Issues.IssueHeaderView=JIRA.Issues.BaseView.extend({tagName:"header",className:"issue-header js-stalker",template:JIRA.Templates.ViewIssue.Header.issueHeader,initialize:function(){var B=this;
_.bindAll(this);
this.model.bindUpdated(function(C){if(!C.initialize){if(!_.include(C.fieldsInProgress,"summary")){B.render();
B.updateWindowTitle()
}else{B.renderOpsBar()
}B.model.getIssueEventBus().triggerPanelRendered("header",B.$el)
}});
this.model.getIssueEventBus().bindUpdateFromDom(this.updateFromDom)
},updateFromDom:function(B){this.setElement(B.find(".issue-header"))
},updateWindowTitle:function(){var C=this.$el.find("#key-val:first").text();
var B=this.$el.find("#summary-val:first").text();
var D=AJS.Meta.get("app-title");
if(!D||!B||!C){console.warn("JIRA.Issues.IssueHeaderView: Parsing of title failed")
}else{document.title="[#"+C+"] "+B+" - "+D
}},renderOpsBar:function(){this.opsbarView=new JIRA.Issues.IssueOpsbarView({el:this.$el.find(".command-bar"),model:this.model});
this.opsbarView.render();
JIRA.trigger(JIRA.Events.NEW_CONTENT_ADDED,[this.$el,JIRA.CONTENT_ADDED_REASON.panelRefreshed])
},render:function(){var E,C=this,D=this.template({issue:this.model.getEntity()}),B=this.$el.find(".page-navigation").remove(),F=this.$el.find("#issue-comment-add").remove();
this.$el.attr("class",this.className);
this.$el.empty();
this.$el.append(D);
this.opsbarView=new JIRA.Issues.IssueOpsbarView({el:this.$el.find(".command-bar"),model:this.model});
this.opsbarView.render();
this.$el.find(".issue-header-content").prepend(B);
E=this.$el.find("#comment-issue").addClass("inline-comment");
if(F.length===1){this.$el.addClass("action").find(".ops-cont").append(F);
E.addClass("active")
}JIRA.trigger(JIRA.Events.NEW_CONTENT_ADDED,[C.$el,JIRA.CONTENT_ADDED_REASON.panelRefreshed]);
return this.$el
},_onAssigneeUpdate:function(){this.model.getIssueEventBus().triggerRefreshIssue()
}})
})(AJS.$);
AJS.namespace("JIRA.Issues.IssueOpsbarView");
(function(A){JIRA.Issues.IssueOpsbarView=JIRA.Issues.BaseView.extend({template:JIRA.Templates.ViewIssue.Header.opsbar,render:function(){var B=this.template({issue:this.model.getEntity()});
this.$el.empty();
this.$el.append(B);
return this.$el
}})
})(AJS.$);
AJS.namespace("JIRA.Issues.IssueView");
(function(A){JIRA.Issues.IssueView=JIRA.Issues.BaseView.extend({mixins:[JIRA.Issues.Mixin.PageTitleView,JIRA.Issues.Mixin.LoadingClass],events:{"click #close-return":"_onBackToSearch"},ISSUE_ACTION_SELECTOR:"a[class*='issueaction-'], .toggle-title",initialize:function(){var B=this;
_.bindAll(this);
A(document).delegate(this.ISSUE_ACTION_SELECTOR,"click",this._handleActionClicked);
this.model.getIssueEventBus().bindUpdateStatusColor(this.updateStatusClass);
this.model.getIssueEventBus().bindDismiss(this.destroy);
this.model.getIssueEventBus().bindUpdateFromDom(this.updateFromDom);
this.model.getIssueEventBus().bindRefreshIssue(this.addLoadingClass);
this.model.getIssueEventBus().bindIssueRefreshed(this.removeLoadingClass);
this.model.bindUpdated(function(C){if(C.initialize){B.render()
}});
this.header=new JIRA.Issues.IssueHeaderView({model:this.model});
this.body=new JIRA.Issues.IssueBodyView({model:this.model});
AJS.$("#return-to-search").click(this._onBackToSearch)
},_handleActionClicked:function(){this.model.getIssueEventBus().trigger("save")
},updateFromDom:function(B){this.setElement(B.find("#issue-content"));
this.$form=this.$el
},destroy:function(){this.undelegateEvents();
A(document).undelegate(this.ISSUE_ACTION_SELECTOR,"click",this._handleActionClicked)
},render:function(){AJS.log("IssueView: Render started for issue ["+this.model.getEntity().key+"]");
this.$el.empty();
this.$form=A("<div />").attr({id:"issue-content"}).addClass("issue-edit-form").appendTo(this.$el);
this.updateStatusClass();
this.$form.prepend(this.header.render());
this.$form.append(this.body.render());
this.body.expandToScreenEdge();
return this.$el
},_onBackToSearch:function(B){if(!this.model.isStandalone()){this.model.returnToSearch();
B.preventDefault()
}},updateStatusClass:function(){this.$el.attr("class","result-panel "+this.model.getStatusClass())
}})
})(AJS.$);
AJS.$(function(){var C=function(E,H,L,F,N){var M=H+"-on",I=H+"-off",J=E.find(".icon"),K="/voters",G,D="POST";
if(J.hasClass(M)){D="DELETE"
}if(H.indexOf("watch")!==-1){K="/watchers"
}J.removeClass(M).removeClass(I);
if(D==="POST"){G={dummy:true}
}AJS.$(JIRA.SmartAjax.makeRequest({url:contextPath+"/rest/api/1.0/issues/"+E.attr("rel")+K,type:D,dataType:"json",data:G,contentType:"application/json",complete:function(P,Q,O){if(O.successful){if(D==="POST"){J.addClass(M);
E.attr("title",N.titleOn).find(".action-text").text(N.actionTextOn);
F.attr("title",N.titleOn).text(N.textOn)
}else{J.addClass(I);
E.attr("title",N.titleOff).find(".action-text").text(N.actionTextOff);
F.attr("title",N.titleOff).text(N.textOff)
}L.text(O.data.count)
}else{alert(JIRA.SmartAjax.buildSimpleErrorContent(O,{alert:true}));
if(D==="POST"){J.addClass(I);
E.attr("title",N.titleOff).find(".action-text").text(N.actionTextOff);
F.attr("title",N.titleOff).text(N.textOff)
}else{J.addClass(M);
E.attr("title",N.titleOn).find(".action-text").text(N.actionTextOn);
F.attr("title",N.titleOn).text(N.textOn)
}}}})).throbber({target:J})
};
function A(){AJS.$("#watching-toggle").click()
}AJS.$(document).delegate("#toggle-vote-issue","click",function(D){D.preventDefault();
AJS.$("#vote-toggle").click()
});
AJS.$(document).delegate("#toggle-watch-issue","click",function(D){D.preventDefault();
A()
});
var B=function(D){AJS.$("input[type=hidden][id|=error]").each(function(E,G){var F=G.id.replace("error-","");
D[F]=G.value
})
};
AJS.$(document).delegate("#vote-toggle","click",function(E){E.preventDefault();
var D={titleOn:"Remove vote for this issue",titleOff:"Vote for this issue",textOn:"Remove Vote",textOff:"Add Vote",actionTextOff:"Vote",actionTextOn:"Voted"};
B(D);
C(AJS.$(this),"icon-vote",AJS.$("#vote-data"),AJS.$("#toggle-vote-issue"),D)
});
AJS.$(document).delegate("#watching-toggle","click",function(E){E.preventDefault();
var D={titleOn:"Stop watching this issue",titleOff:"Start watching this issue",textOn:"Stop Watching",textOff:"Watch Issue",actionTextOff:"Watch",actionTextOn:"Watching"};
B(D);
C(AJS.$(this),"icon-watch",AJS.$("#watcher-data"),AJS.$("#toggle-watch-issue"),D)
})
});
