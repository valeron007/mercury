AJS.$(function(){var B=new JIRA.Issues.SaveInProgressManager();
var A=new JIRA.Issues.ViewIssueController({viewIssueContext:jQuery(".content-container").find(".result-panel"),saveInProgressManager:B});
A.applyToDom({key:AJS.$("#key-val").text(),id:AJS.$("#key-val").attr("rel"),statusColorSupport:false});
JIRA.Issues.overrideIssueDialogs(A);
JIRA.Issues.Api=JIRA.Issues.Api||{};
JIRA.Issues.Api.openFocusShifter=function(){A.getSelectedIssueModel().getIssueEventBus().triggerOpenFocusShifter()
};
JIRA.Issues.Api.hasSavesInProgress=function(){return B.hasSavesInProgress()
}
});
