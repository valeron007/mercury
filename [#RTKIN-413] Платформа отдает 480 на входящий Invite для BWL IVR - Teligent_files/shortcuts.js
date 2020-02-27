AJS.keys = {"shortcuts":[{"keys":[["g","d"]],"context":"global","op":"followLink","param":"#home_link"},{"keys":[["e"]],"context":"issueaction","op":"evaluate","param":"if(!jira.app.issue.getIssueKey() && !jira.app.issuenavigator.isRowSelected()) {\n                    //we're not on view issue and no focused issue was found on the issue nav. Do nothing!\n                    return;\n                }\n\n                if (JIRA.Version.isGreaterThanOrEqualTo(\"5.0\")) {\n                    this.click(\".issueaction-edit-issue\"); // go to quick edit in 5.0+ versions\n                } else {\n                    this.followLink(\".issueaction-edit-issue\"); // otherwise go to old edit page\n                }"},{"keys":[["g","p"]],"context":"global","op":"followLink","param":"#browse_link"},{"keys":[["g","h"]],"context":"global","op":"execute","param":"gh.app.globalkeyboardshortcuts.goToAgile();"},{"keys":[["a"]],"context":"issueaction","op":"click","param":".issueaction-assign-issue"},{"keys":[["g","a"]],"context":"global","op":"execute","param":"gh.app.globalkeyboardshortcuts.goToAgile();"},{"keys":[["g","c"]],"context":"global","op":"execute","param":"gh.app.globalkeyboardshortcuts.goToAgile();"},{"keys":[["g","r"]],"context":"global","op":"execute","param":"gh.app.globalkeyboardshortcuts.goToAgile();"},{"keys":[["g","i"]],"context":"global","op":"followLink","param":"#find_link"},{"keys":[["m"]],"context":"issueaction","op":"click","param":"#comment-issue"},{"keys":[["g","g"]],"context":"global","op":"execute","param":"if (AJS.Meta.get('admin-quicksearch-show')) {\n              jira.app.adminQuickNavDialog.show();\n            }"},{"keys":[["g","t"]],"context":"global","op":"followLink","param":"#tempo_menu"},{"keys":[["s"]],"context":"issueaction","op":"click","param":"#jira-share-trigger"},{"keys":[["l"]],"context":"issueaction","op":"click","param":"#edit-labels"},{"keys":[["/"]],"context":"global","op":"moveToAndFocus","param":"#quickSearchInput, #admin-quick-nav-field"},{"keys":[["["]],"context":"issuenavigation","op":"click","param":".toggle-lhc"},{"keys":[["n"]],"context":"issuenavigation","op":"moveToNextItem","param":".issue-data-block:visible"},{"keys":[["."]],"context":"issueaction","op":"execute","param":"jira.app.issueActionsPopup.show();"},{"keys":[["c"]],"context":"global","op":"moveToAndClick","param":"#create_link"},{"keys":[[","]],"context":"issueaction","op":"execute","param":"if (JIRA.Issues && JIRA.Issues.Api.openFocusShifter) {\n                    JIRA.Issues.Api.openFocusShifter();\n                }"},{"keys":[["f"]],"context":"issuenavigation","op":"execute","param":"jira.app.issuenavigator.shortcuts.focusSearch();"},{"keys":[["o"]],"context":"issuenavigation","op":"execute","param":"if(JIRA.Issues && JIRA.Issues.Api.switchToDetailedView) {\n                    //we're in kickass\n                    JIRA.Issues.Api.switchToDetailedView();\n                } else {\n                    //we're on the old issue nav.\n                    jira.app.issuenavigator.shortcuts.viewSelectedIssue();\n                }"},{"keys":[["u"]],"context":"issuenavigation","op":"execute","param":"if(JIRA.Issues && JIRA.Issues.Api.switchToSearchView) {\n                    //we're in kickass\n                    JIRA.Issues.Api.switchToSearchView();\n                } else {\n                    //we're on the old issue nav.\n                    this.followLink(\"link[rel=index]:first\");\n                    this._executer();\n                }"},{"keys":[["j"]],"context":"issuenavigation","op":"execute","param":"if(JIRA.Issues && JIRA.Issues.Api.nextIssue) {\n                    //we're in kickass\n                    JIRA.Issues.Api.nextIssue();\n                } else {\n                    //we're on the old issue nav.\n\n                    if(AJS.$(\".page-navigation #next-issue\").length > 0) {\n                        this.followLink(\"#next-issue\");\n                        this._executer();\n                    } else {\n                        jira.app.issuenavigator.shortcuts.selectNextIssue();\n                    }\n                }"},{"keys":[["k"]],"context":"issuenavigation","op":"execute","param":"if(JIRA.Issues && JIRA.Issues.Api.prevIssue) {\n                    //we're in kickass\n                    JIRA.Issues.Api.prevIssue();\n                } else {\n                    //we're on the old issue nav.\n\n                    if(AJS.$(\".page-navigation #previous-issue\").length > 0) {\n                        this.followLink(\"#previous-issue\");\n                        this._executer();\n                    } else {\n                        jira.app.issuenavigator.shortcuts.selectPreviousIssue();\n                    }\n                }"},{"keys":[["i"]],"context":"issuenavigation","op":"execute","param":"if (JIRA.Issues) {\n                    this.click(\"#assign-to-me\");\n                    this._executer();\n                } else {\n                    this.followLink(\"#assign-to-me\");\n                    this._executer();\n                }"},{"keys":[["w"]],"context":"issueaction","op":"execute","param":"tempo.shortcutOpenDialog({});"},{"keys":[["t"]],"context":"global","op":"execute","param":"if (JIRA.Issues && JIRA.Issues.Api && JIRA.Issues.Api.switchLayouts &&\n                    JIRA.Issues.Api.isQueryValid && JIRA.Issues.Api.isQueryValid() &&\n                    JIRA.Issues.Api.isFullScreenIssueVisible && !JIRA.Issues.Api.isFullScreenIssueVisible() ) {\n                    JIRA.Issues.Api.switchLayouts(); // copied from issue-nav-plugin\n                } else {\n                    tempo.shortcutOpenDialog({});\n                }"},{"keys":[["p"]],"context":"global","op":"execute","param":"tempo.shortcutOpenDialog({planning: true});"},{"keys":[["?"]],"context":"global","op":"click","param":"#keyshortscuthelp"}]};