AJS.$(document).ready(function(){AJS.$("#watching-toggle").ajaxComplete(function(D,C,A){var F=AJS.$(D.target).attr("rel");
if(C.status==200&&F!==undefined){var B=new RegExp(contextPath+"/rest/api/(.+)/issues/"+F+"/watchers(.*)","ig");
var E=atl_token();
if(B.test(A.url)){AJS.$.ajax({url:contextPath+"/rest/watcherfield/latest/watchers?atl_token="+E+"&issueId="+F,type:"GET",dataType:"json",success:function(G){var H="";
if(G.watchers!==undefined){AJS.$(G.watchers).each(function(I,J){H+='<span class="tinylink">';
H+='<a href="/jira/secure/ViewProfile.jspa?name='+J.username+'" id="multiuser_cf_'+J.username+'">'+J.displayName+"</a>";
H+="</span>, "
})
}H=H.replace(/(, )$/,"");
AJS.$(G.fieldIds).each(function(I,J){AJS.$("#"+J+"-field").html(H)
})
},error:function(G,I,H){console.log("Error in REST call to get watcher: "+G.status+","+G.statusText);
console.log(G)
}})
}}})
});
