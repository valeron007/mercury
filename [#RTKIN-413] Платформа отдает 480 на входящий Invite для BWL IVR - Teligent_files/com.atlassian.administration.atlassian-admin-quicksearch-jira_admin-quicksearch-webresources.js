// This file was automatically generated from adminQuickNavDialog.soy.
// Please don't edit this file by hand.

if (typeof JIRA == 'undefined') { var JIRA = {}; }
if (typeof JIRA.Templates == 'undefined') { JIRA.Templates = {}; }


JIRA.Templates.adminQuickNavDialog = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<h2 class="aui-popup-heading">', soy.$$escapeHtml("Administration Search"), '</h2><div class="aui-popup-content"><form id="admin-quicknav-dialog-form" class="aui ajs-dirty-warning-exempt"><div class="form-body"><div id="administration-suggestions" class="aui-list"></div><div class=\'description\'>', soy.$$escapeHtml("Begin typing for available operations or press down to see all"), '</div></div></form><div class="buttons-container form-footer"><div class="buttons"><a href="#" class="cancel" id="aui-dialog-close">', soy.$$escapeHtml("Close"), '</a></div></div></div>');
  return opt_sb ? '' : output.toString();
};

/**
 * Admin quickseach autocompletes.
 * - Exports instance of adminQuickNavDialog, which shows autocomplete in a dialog. This is used in conjuction with
 * keyboard shortcut "g then g"
 * - Attaches autocomplete to the header "Administration" menu when it is opened
 */
jQuery(function () {

    function flattenSections(group, section) {

        if (section && section.items) {
            jQuery.each(section.items, function () {
                addItemTo(group, this);
            });
        }

        if (section && section.sections) {
            jQuery.each(section.sections, function (i, section) {
                flattenSections(group, section);
            });
        }
    }

    function addItemTo(group, jsonItem) {
        group.addItem(new AJS.ItemDescriptor({
            href: jsonItem.linkUrl,
            label: jsonItem.label,
            keywords: jsonItem.aliases
        }));
    }

    // Generic options for admin autocomplete
    function getAdminQuickNavOptions(element) {

        return {

            element: element, // suggestions container
            id: "admin-quick-nav",
            ajaxOptions: {
                dataType: "json",
                url: contextPath + "/rest/adminquicksearch/latest/links/default",
                formatResponse: function (suggestions) {

                    var ret = [];

                    var topLevelLinksGroup = new AJS.GroupDescriptor({label:"", showLabel:false});
                    jQuery.each(suggestions.items, function () {
                        addItemTo(topLevelLinksGroup, this);
                    });
                    ret.push(topLevelLinksGroup);

                    AJS.$.each(suggestions.sections, function(name, topLevelSection) {

                        var groupDescriptor = new AJS.GroupDescriptor({
                            label: topLevelSection.label // Heading of group
                        });

                        flattenSections(groupDescriptor, topLevelSection);
                        ret.push(groupDescriptor);
                    });

                    return ret;
                }

            },
            showDropdownButton: true
        };
    }


    // export dialog, this method is called using keyboard shortcut. See system-keyboard-shortcuts-plugin.xml
    jira.app.adminQuickNavDialog = new JIRA.Dialog({

        id: "admin-quicknav-dialog",

        // call soy template for dialog contents. Contains header cancel button etc.
        content: function (callback) {
            callback(JIRA.Templates.adminQuickNavDialog());
        },

        // every time we refresh the dialog contents we recreate the control
        onContentRefresh: function () {

            var suggestionsContainer = jQuery("#administration-suggestions", this.$content),
                    autocompleteOptions = getAdminQuickNavOptions(suggestionsContainer),
                    autocomplete, instance = this;

            autocompleteOptions.loadOnInit = true; // make request for suggestion on construction
            autocomplete = new AJS.QueryableDropdownSelect(autocompleteOptions);

            autocomplete._handleServerError = function(smartAjaxResult) {
                var errMsg = JIRA.SmartAjax.buildSimpleErrorContent(smartAjaxResult);
                var errorClass = smartAjaxResult.status === 401?'warning':'error';

                AJS.$("#admin-quicknav-dialog-form", this.$content).html(AJS.$('<div class="ajaxerror"><div class="aui-message ' + errorClass+'"><p>' + errMsg + '</p></div></div>'), false);
            }

            autocomplete.$field.focus();

            //need to hookup the 'close' link to close the dialog.
            $cancel = AJS.$(".cancel", this.$content);
            $cancel.click(function (e) {
                if (instance.xhr)
                {
                    instance.xhr.abort();
                }
                instance.xhr = null;
                instance.cancelled = true;
                instance.hide();
                e.preventDefault();
            });
        },

        widthClass: "small"
    });

    // Add Quicksearch to header (only visible when in administration)
    var suggestionsContainer = jQuery("#header-administration-suggestions"),
            autocompleteOptions;

    if (suggestionsContainer.length === 1) {
        autocompleteOptions = getAdminQuickNavOptions(suggestionsContainer);
        autocompleteOptions.overlabel = "Administration Quick Search";
        new AJS.QueryableDropdownSelect(autocompleteOptions);
    }

});





/**
 * Capture some events that better explain how people use JIRA administration in general.
 */
(function($) {
    $(function() {
        var projectKey = $('meta[name="projectKey"]').attr('content'),
                contextPath = ((typeof AJS.contextPath == "function") ? AJS.contextPath() : contextPath) || "";

        /**
         * Convenience to create and return an object that represents a navigation action in administration.
         *
         * @param type    a unique name to represent the specific kind of navigation action used
         * @param opts    an object containing any particular properties of relevance for this navigation type.
         */
        function adminNavEvent(type, opts) {
            opts = (typeof opts != 'object') ? {} : opts;
            type = type || "unknown";
            var props = jQuery.extend({
                type: type
            }, opts);
            return { name: "administration.navigate" + "." + type, properties: props };
        }

        /**
         * Remove, anonymize and normalize any sensitive information in a URL for the purposes of
         * collection for statistical analysis.
         */
        function filterUri(href) {
            if (typeof href != 'string') return null;

            var uri = parseUri(href),
                    filtered;

            // Remove the protocol, domain and context path from the URL.
            filtered = uri.path.slice(contextPath.length);

            // Remove project keys
            projectKey && (filtered = filtered.replace(new RegExp("\\b" + projectKey + "\\b"), "PROJECTKEY"));

            return filtered;
        }

        $(document).delegate("#administration-suggestions .aui-list-item-link,#administration-quicksearch-suggestions .aui-list-item-link", "click", function() {
            if (AJS.EventQueue) {
                var el = $(this),
                        href = filterUri(el.attr('href'));
                AJS.EventQueue.push(adminNavEvent('keyboardshortcut', {
                    href: href,
                    title: el.attr('title')
                }));
            }
        });
    }); //onReady
})(AJS.$);

