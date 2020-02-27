AJS.namespace("JIRA.Issues.AttributesMixinCreator");
(function(){JIRA.Issues.AttributesMixinCreator={create:function(B){var A={};
if(_.indexOf(B,"id")===-1){B.unshift("id")
}_.each(B,function(D){var E=JIRA.Issues.Mixins.createMethodName("set",D);
A[E]=function(H,F){var G={};
G[D]=H;
this.set(G,F);
return this
};
var C=JIRA.Issues.Mixins.createMethodName("get",D);
A[C]=function(){return this.get(D)
}
});
return A
}}
})();
(function(){JIRA.Issues.EventsMixinCreator={create:function(B){var A={};
var C=function(E){var D=JIRA.Issues.Mixins.createMethodName("bind",E);
A[D]=function(){return this.bind.apply(this,[E].concat(_.toArray(arguments)))
};
var G=JIRA.Issues.Mixins.createMethodName("unbind",E);
A[G]=function(){return this.unbind.apply(this,[E].concat(_.toArray(arguments)))
};
var F=JIRA.Issues.Mixins.createMethodName("trigger",E);
A[F]=function(){return this.trigger.apply(this,[E].concat(_.toArray(arguments)))
};
var H=JIRA.Issues.Mixins.createMethodName("one",E);
A[H]=function(){var I=this;
var J=arguments[0];
var L=function(){I.unbind(E,L);
J(arguments)
};
var K=_.toArray(arguments).slice(1);
return this.bind.apply(this,[E,L].concat(K))
}
};
_.each(B,_.bind(C,this));
return A
}}
})();
AJS.namespace("JIRA.Issues.BaseModel");
AJS.namespace("JIRA.Issues.BaseCollection");
AJS.namespace("JIRA.Issues.BaseView");
AJS.namespace("JIRA.Issues.BaseRouter");
(function(){function D(G,F){_.forEach(_.keys(F),function(K){var L=G.prototype;
if("initialize"===K){var I=L.initialize;
L.initialize=function(){F.initialize.apply(this,arguments);
if(I){I.apply(this,arguments)
}};
return 
}if("validate"===K){var J=L.validate;
L.validate=function(){var O=F.validate.apply(this,arguments);
if(O){return O
}if(J){return J.apply(this,arguments)
}};
return 
}if("defaults"===K){var M=L.defaults||(L.defaults={});
var H=F[K];
for(var N in H){if(M.hasOwnProperty(N)){throw"Mixin error: object "+G+" already has default "+N+" defined for mixin "+F
}M[N]=H[N]
}return 
}if("properties"===K){if(!_.isArray(F[K])){throw"Expects properties member on mixin to be an array"
}if(!L.properties){L.properties=[]
}L.properties=L.properties.concat(F[K]);
return 
}if("namedEvents"===K){if(!_.isArray(F[K])){throw"Expects events member on mixin to be an array"
}if(!L.namedEvents){L.namedEvents=[]
}L.namedEvents=L.namedEvents.concat(F[K]);
return 
}if(L.hasOwnProperty(K)){throw"Mixin error: object "+G+" already has property "+K+" for mixin "+F
}L[K]=F[K]
},this)
}function C(F){return function(I,J){var K;
var H=_.extend({},I);
var G;
if(I&&I.mixins){G=I.mixins;
delete H.mixins
}K=F.call(this,H,J);
if(G){_.each(I.mixins,function(L){D(K,L)
})
}if(K.prototype.namedEvents){D(K,JIRA.Issues.EventsMixinCreator.create(K.prototype.namedEvents))
}if(K.prototype.properties){D(K,JIRA.Issues.AttributesMixinCreator.create(K.prototype.properties))
}K.extend=arguments.callee;
return K
}
}function B(J,H){var I=J.prototype;
var F=H.prototype;
var G=I.set;
F.set=function(P,Q,N){var M,O=this.properties;
if(O){if(_.isObject(P)||P==null){M=P
}else{M={};
M[P]=Q
}for(var L in M){if(_.indexOf(O,L)<0){throw"Property '"+L+"' does not exist"
}}}return G.apply(this,arguments)
};
var K=I.get;
F.get=function(L){if(this.properties&&_.indexOf(this.properties,L)<0){throw"Property '"+L+"' does not exist"
}return K.apply(this,arguments)
}
}function A(F){var H=F.extend();
var G=F.extend;
H.extend=C(G);
return H
}function E(F){var G=A(F);
B(F,G);
return G
}JIRA.Issues.BaseModel=E(Backbone.Model);
JIRA.Issues.BaseCollection=A(Backbone.Collection);
JIRA.Issues.BaseView=A(Backbone.View);
JIRA.Issues.BaseRouter=A(Backbone.Router);
_.mixin({lambda:function(F){return function(){return F
}
},isNotBlank:function(F){return !!F
}})
})();
(function(){JIRA.Issues.Mixins={createMethodName:function(A,B){return A+B.charAt(0).toUpperCase()+B.substr(1)
}}
})();
