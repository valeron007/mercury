(function(){var X=this;
var T=X._;
var B={};
var J=Array.prototype,d=Object.prototype,g=Function.prototype;
var V=J.slice,Z=J.unshift,Y=d.toString,P=d.hasOwnProperty;
var N=J.forEach,I=J.map,b=J.reduce,E=J.reduceRight,M=J.filter,A=J.every,a=J.some,W=J.indexOf,F=J.lastIndexOf,C=Array.isArray,c=Object.keys,K=g.bind;
var f=function(i){return new G(i)
};
if(typeof exports!=="undefined"){if(typeof module!=="undefined"&&module.exports){exports=module.exports=f
}exports._=f
}else{X._=f
}f.VERSION="1.3.1";
var D=f.each=f.forEach=function(p,o,n){if(p==null){return 
}if(N&&p.forEach===N){p.forEach(o,n)
}else{if(p.length===+p.length){for(var m=0,j=p.length;
m<j;
m++){if(m in p&&o.call(n,p[m],m,p)===B){return 
}}}else{for(var k in p){if(f.has(p,k)){if(o.call(n,p[k],k,p)===B){return 
}}}}}};
f.map=f.collect=function(l,k,j){var i=[];
if(l==null){return i
}if(I&&l.map===I){return l.map(k,j)
}D(l,function(o,m,n){i[i.length]=k.call(j,o,m,n)
});
if(l.length===+l.length){i.length=l.length
}return i
};
f.reduce=f.foldl=f.inject=function(m,l,i,k){var j=arguments.length>2;
if(m==null){m=[]
}if(b&&m.reduce===b){if(k){l=f.bind(l,k)
}return j?m.reduce(l,i):m.reduce(l)
}D(m,function(p,n,o){if(!j){i=p;
j=true
}else{i=l.call(k,i,p,n,o)
}});
if(!j){throw new TypeError("Reduce of empty array with no initial value")
}return i
};
f.reduceRight=f.foldr=function(m,l,i,k){var j=arguments.length>2;
if(m==null){m=[]
}if(E&&m.reduceRight===E){if(k){l=f.bind(l,k)
}return j?m.reduceRight(l,i):m.reduceRight(l)
}var n=f.toArray(m).reverse();
if(k&&!j){l=f.bind(l,k)
}return j?f.reduce(n,l,i,k):f.reduce(n,l)
};
f.find=f.detect=function(l,k,j){var i;
R(l,function(o,m,n){if(k.call(j,o,m,n)){i=o;
return true
}});
return i
};
f.filter=f.select=function(l,k,j){var i=[];
if(l==null){return i
}if(M&&l.filter===M){return l.filter(k,j)
}D(l,function(o,m,n){if(k.call(j,o,m,n)){i[i.length]=o
}});
return i
};
f.reject=function(l,k,j){var i=[];
if(l==null){return i
}D(l,function(o,m,n){if(!k.call(j,o,m,n)){i[i.length]=o
}});
return i
};
f.every=f.all=function(l,k,j){var i=true;
if(l==null){return i
}if(A&&l.every===A){return l.every(k,j)
}D(l,function(o,m,n){if(!(i=i&&k.call(j,o,m,n))){return B
}});
return i
};
var R=f.some=f.any=function(l,k,j){k||(k=f.identity);
var i=false;
if(l==null){return i
}if(a&&l.some===a){return l.some(k,j)
}D(l,function(o,m,n){if(i||(i=k.call(j,o,m,n))){return B
}});
return !!i
};
f.include=f.contains=function(k,j){var i=false;
if(k==null){return i
}if(W&&k.indexOf===W){return k.indexOf(j)!=-1
}i=R(k,function(l){return l===j
});
return i
};
f.invoke=function(j,k){var i=V.call(arguments,2);
return f.map(j,function(l){return(f.isFunction(k)?k||l:l[k]).apply(l,i)
})
};
f.pluck=function(j,i){return f.map(j,function(k){return k[i]
})
};
f.max=function(l,k,j){if(!k&&f.isArray(l)){return Math.max.apply(Math,l)
}if(!k&&f.isEmpty(l)){return -Infinity
}var i={computed:-Infinity};
D(l,function(p,m,o){var n=k?k.call(j,p,m,o):p;
n>=i.computed&&(i={value:p,computed:n})
});
return i.value
};
f.min=function(l,k,j){if(!k&&f.isArray(l)){return Math.min.apply(Math,l)
}if(!k&&f.isEmpty(l)){return Infinity
}var i={computed:Infinity};
D(l,function(p,m,o){var n=k?k.call(j,p,m,o):p;
n<i.computed&&(i={value:p,computed:n})
});
return i.value
};
f.shuffle=function(k){var i=[],j;
D(k,function(n,l,m){if(l==0){i[0]=n
}else{j=Math.floor(Math.random()*(l+1));
i[l]=i[j];
i[j]=n
}});
return i
};
f.sortBy=function(k,j,i){return f.pluck(f.map(k,function(n,l,m){return{value:n,criteria:j.call(i,n,l,m)}
}).sort(function(o,n){var m=o.criteria,l=n.criteria;
return m<l?-1:m>l?1:0
}),"value")
};
f.groupBy=function(k,l){var i={};
var j=f.isFunction(l)?l:function(m){return m[l]
};
D(k,function(o,m){var n=j(o,m);
(i[n]||(i[n]=[])).push(o)
});
return i
};
f.sortedIndex=function(n,m,k){k||(k=f.identity);
var i=0,l=n.length;
while(i<l){var j=(i+l)>>1;
k(n[j])<k(m)?i=j+1:l=j
}return i
};
f.toArray=function(i){if(!i){return[]
}if(i.toArray){return i.toArray()
}if(f.isArray(i)){return V.call(i)
}if(f.isArguments(i)){return V.call(i)
}return f.values(i)
};
f.size=function(i){return f.toArray(i).length
};
f.first=f.head=function(k,j,i){return(j!=null)&&!i?V.call(k,0,j):k[0]
};
f.initial=function(k,j,i){return V.call(k,0,k.length-((j==null)||i?1:j))
};
f.last=function(k,j,i){if((j!=null)&&!i){return V.call(k,Math.max(k.length-j,0))
}else{return k[k.length-1]
}};
f.rest=f.tail=function(k,i,j){return V.call(k,(i==null)||j?1:i)
};
f.compact=function(i){return f.filter(i,function(j){return !!j
})
};
f.flatten=function(j,i){return f.reduce(j,function(k,l){if(f.isArray(l)){return k.concat(i?l:f.flatten(l))
}k[k.length]=l;
return k
},[])
};
f.without=function(i){return f.difference(i,V.call(arguments,1))
};
f.uniq=f.unique=function(m,l,k){var j=k?f.map(m,k):m;
var i=[];
f.reduce(j,function(n,p,o){if(0==o||(l===true?f.last(n)!=p:!f.include(n,p))){n[n.length]=p;
i[i.length]=m[o]
}return n
},[]);
return i
};
f.union=function(){return f.uniq(f.flatten(arguments,true))
};
f.intersection=f.intersect=function(j){var i=V.call(arguments,1);
return f.filter(f.uniq(j),function(k){return f.every(i,function(l){return f.indexOf(l,k)>=0
})
})
};
f.difference=function(j){var i=f.flatten(V.call(arguments,1));
return f.filter(j,function(k){return !f.include(i,k)
})
};
f.zip=function(){var j=V.call(arguments);
var m=f.max(f.pluck(j,"length"));
var l=new Array(m);
for(var k=0;
k<m;
k++){l[k]=f.pluck(j,""+k)
}return l
};
f.indexOf=function(o,m,n){if(o==null){return -1
}var k,j;
if(n){k=f.sortedIndex(o,m);
return o[k]===m?k:-1
}if(W&&o.indexOf===W){return o.indexOf(m)
}for(k=0,j=o.length;
k<j;
k++){if(k in o&&o[k]===m){return k
}}return -1
};
f.lastIndexOf=function(l,k){if(l==null){return -1
}if(F&&l.lastIndexOf===F){return l.lastIndexOf(k)
}var j=l.length;
while(j--){if(j in l&&l[j]===k){return j
}}return -1
};
f.range=function(n,l,m){if(arguments.length<=1){l=n||0;
n=0
}m=arguments[2]||1;
var j=Math.max(Math.ceil((l-n)/m),0);
var i=0;
var k=new Array(j);
while(i<j){k[i++]=n;
n+=m
}return k
};
var H=function(){};
f.bind=function h(l,j){var k,i;
if(l.bind===K&&K){return K.apply(l,V.call(arguments,1))
}if(!f.isFunction(l)){throw new TypeError
}i=V.call(arguments,2);
return k=function(){if(!(this instanceof k)){return l.apply(j,i.concat(V.call(arguments)))
}H.prototype=l.prototype;
var n=new H;
var m=l.apply(n,i.concat(V.call(arguments)));
if(Object(m)===m){return m
}return n
}
};
f.bindAll=function(j){var i=V.call(arguments,1);
if(i.length==0){i=f.functions(j)
}D(i,function(k){j[k]=f.bind(j[k],j)
});
return j
};
f.memoize=function(k,j){var i={};
j||(j=f.identity);
return function(){var l=j.apply(this,arguments);
return f.has(i,l)?i[l]:(i[l]=k.apply(this,arguments))
}
};
f.delay=function(j,k){var i=V.call(arguments,2);
return setTimeout(function(){return j.apply(j,i)
},k)
};
f.defer=function(i){return f.delay.apply(f,[i,1].concat(V.call(arguments,1)))
};
f.throttle=function(n,p){var l,i,o,m,k;
var j=f.debounce(function(){k=m=false
},p);
return function(){l=this;
i=arguments;
var q=function(){o=null;
if(k){n.apply(l,i)
}j()
};
if(!o){o=setTimeout(q,p)
}if(m){k=true
}else{n.apply(l,i)
}j();
m=true
}
};
f.debounce=function(i,k){var j;
return function(){var n=this,m=arguments;
var l=function(){j=null;
i.apply(n,m)
};
clearTimeout(j);
j=setTimeout(l,k)
}
};
f.once=function(k){var i=false,j;
return function(){if(i){return j
}i=true;
return j=k.apply(this,arguments)
}
};
f.wrap=function(i,j){return function(){var k=[i].concat(V.call(arguments,0));
return j.apply(this,k)
}
};
f.compose=function(){var i=arguments;
return function(){var j=arguments;
for(var k=i.length-1;
k>=0;
k--){j=[i[k].apply(this,j)]
}return j[0]
}
};
f.after=function(j,i){if(j<=0){return i()
}return function(){if(--j<1){return i.apply(this,arguments)
}}
};
f.keys=c||function(k){if(k!==Object(k)){throw new TypeError("Invalid object")
}var j=[];
for(var i in k){if(f.has(k,i)){j[j.length]=i
}}return j
};
f.values=function(i){return f.map(i,f.identity)
};
f.functions=f.methods=function(k){var j=[];
for(var i in k){if(f.isFunction(k[i])){j.push(i)
}}return j.sort()
};
f.extend=function(i){D(V.call(arguments,1),function(j){for(var k in j){i[k]=j[k]
}});
return i
};
f.defaults=function(i){D(V.call(arguments,1),function(j){for(var k in j){if(i[k]==null){i[k]=j[k]
}}});
return i
};
f.clone=function(i){if(!f.isObject(i)){return i
}return f.isArray(i)?i.slice():f.extend({},i)
};
f.tap=function(j,i){i(j);
return j
};
function e(l,k,j){if(l===k){return l!==0||1/l==1/k
}if(l==null||k==null){return l===k
}if(l._chain){l=l._wrapped
}if(k._chain){k=k._wrapped
}if(l.isEqual&&f.isFunction(l.isEqual)){return l.isEqual(k)
}if(k.isEqual&&f.isFunction(k.isEqual)){return k.isEqual(l)
}var o=Y.call(l);
if(o!=Y.call(k)){return false
}switch(o){case"[object String]":return l==String(k);
case"[object Number]":return l!=+l?k!=+k:(l==0?1/l==1/k:l==+k);
case"[object Date]":case"[object Boolean]":return +l==+k;
case"[object RegExp]":return l.source==k.source&&l.global==k.global&&l.multiline==k.multiline&&l.ignoreCase==k.ignoreCase
}if(typeof l!="object"||typeof k!="object"){return false
}var p=j.length;
while(p--){if(j[p]==l){return true
}}j.push(l);
var n=0,i=true;
if(o=="[object Array]"){n=l.length;
i=n==k.length;
if(i){while(n--){if(!(i=n in l==n in k&&e(l[n],k[n],j))){break
}}}}else{if("constructor" in l!="constructor" in k||l.constructor!=k.constructor){return false
}for(var m in l){if(f.has(l,m)){n++;
if(!(i=f.has(k,m)&&e(l[m],k[m],j))){break
}}}if(i){for(m in k){if(f.has(k,m)&&!(n--)){break
}}i=!n
}}j.pop();
return i
}f.isEqual=function(j,i){return e(j,i,[])
};
f.isEmpty=function(j){if(f.isArray(j)||f.isString(j)){return j.length===0
}for(var i in j){if(f.has(j,i)){return false
}}return true
};
f.isElement=function(i){return !!(i&&i.nodeType==1)
};
f.isArray=C||function(i){return Y.call(i)=="[object Array]"
};
f.isObject=function(i){return i===Object(i)
};
f.isArguments=function(i){return Y.call(i)=="[object Arguments]"
};
if(!f.isArguments(arguments)){f.isArguments=function(i){return !!(i&&f.has(i,"callee"))
}
}f.isFunction=function(i){return Y.call(i)=="[object Function]"
};
f.isString=function(i){return Y.call(i)=="[object String]"
};
f.isNumber=function(i){return Y.call(i)=="[object Number]"
};
f.isNaN=function(i){return i!==i
};
f.isBoolean=function(i){return i===true||i===false||Y.call(i)=="[object Boolean]"
};
f.isDate=function(i){return Y.call(i)=="[object Date]"
};
f.isRegExp=function(i){return Y.call(i)=="[object RegExp]"
};
f.isNull=function(i){return i===null
};
f.isUndefined=function(i){return i===void 0
};
f.has=function(j,i){return P.call(j,i)
};
f.noConflict=function(){X._=T;
return this
};
f.identity=function(i){return i
};
f.times=function(m,l,k){for(var j=0;
j<m;
j++){l.call(k,j)
}};
f.escape=function(i){return(""+i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")
};
f.mixin=function(i){D(f.functions(i),function(j){S(j,f[j]=i[j])
})
};
var L=0;
f.uniqueId=function(i){var j=L++;
return i?i+j:j
};
f.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};
var U=/.^/;
var Q=function(i){return i.replace(/\\\\/g,"\\").replace(/\\'/g,"'")
};
f.template=function(l,k){var m=f.templateSettings;
var i="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+l.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(m.escape||U,function(n,o){return"',_.escape("+Q(o)+"),'"
}).replace(m.interpolate||U,function(n,o){return"',"+Q(o)+",'"
}).replace(m.evaluate||U,function(n,o){return"');"+Q(o).replace(/[\r\n\t]/g," ")+";__p.push('"
}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');";
var j=new Function("obj","_",i);
if(k){return j(k,f)
}return function(n){return j.call(this,n,f)
}
};
f.chain=function(i){return f(i).chain()
};
var G=function(i){this._wrapped=i
};
f.prototype=G.prototype;
var O=function(j,i){return i?f(j).chain():j
};
var S=function(i,j){G.prototype[i]=function(){var k=V.call(arguments);
Z.call(k,this._wrapped);
return O(j.apply(f,k),this._chain)
}
};
f.mixin(f);
D(["pop","push","reverse","shift","sort","splice","unshift"],function(i){var j=J[i];
G.prototype[i]=function(){var k=this._wrapped;
j.apply(k,arguments);
var l=k.length;
if((i=="shift"||i=="splice")&&l===0){delete k[0]
}return O(k,this._chain)
}
});
D(["concat","join","slice"],function(i){var j=J[i];
G.prototype[i]=function(){return O(j.apply(this._wrapped,arguments),this._chain)
}
});
G.prototype.chain=function(){this._chain=true;
return this
};
G.prototype.value=function(){return this._wrapped
}
}).call(this);
(function(){var P=this;
var N=P.Backbone;
var O=Array.prototype.slice;
var X=Array.prototype.splice;
var C;
if(typeof exports!=="undefined"){C=exports
}else{C=P.Backbone={}
}C.VERSION="0.9.1";
var Z=P._;
if(!Z&&(typeof require!=="undefined")){Z=require("underscore")
}var F=P.jQuery||P.Zepto||P.ender;
C.setDomLibrary=function(b){F=b
};
C.noConflict=function(){P.Backbone=N;
return this
};
C.emulateHTTP=false;
C.emulateJSON=false;
var M=C.Events={on:function(e,i,d){var c,g,f,b,h;
if(!i){return this
}e=e.split(/\s+/);
c=this._callbacks||(this._callbacks={});
while(g=e.shift()){h=c[g];
f=h?h.tail:{};
f.next=b={};
f.context=d;
f.callback=i;
c[g]={tail:b,next:h?h.next:f}
}return this
},off:function(i,g,c){var b,j,d,f,e,h;
if(!i){delete this._callbacks
}else{if(j=this._callbacks){i=i.split(/\s+/);
while(b=i.shift()){d=j[b];
delete j[b];
if(!g||!d){continue
}f=d.tail;
while((d=d.next)!==f){e=d.callback;
h=d.context;
if(e!==g||(c&&h!==c)){this.on(b,e,h)
}}}}}return this
},trigger:function(e){var i,h,d,c,b,g,f;
if(!(d=this._callbacks)){return this
}g=d.all;
e=e.split(/\s+/);
f=O.call(arguments,1);
while(i=e.shift()){if(h=d[i]){c=h.tail;
while((h=h.next)!==c){h.callback.apply(h.context||this,f)
}}if(h=g){c=h.tail;
b=[i].concat(f);
while((h=h.next)!==c){h.callback.apply(h.context||this,b)
}}}return this
}};
M.bind=M.on;
M.unbind=M.off;
var J=C.Model=function(b,c){var d;
b||(b={});
if(c&&c.parse){b=this.parse(b)
}if(d=D(this,"defaults")){b=Z.extend({},d,b)
}if(c&&c.collection){this.collection=c.collection
}this.attributes={};
this._escapedAttributes={};
this.cid=Z.uniqueId("c");
this.changed={};
this._silent={};
this._pending={};
this.set(b,{silent:true});
this.changed={};
this._silent={};
this._pending={};
this._previousAttributes=Z.clone(this.attributes);
this.initialize.apply(this,arguments)
};
Z.extend(J.prototype,M,{changed:null,_silent:null,_pending:null,idAttribute:"id",initialize:function(){},toJSON:function(){return Z.clone(this.attributes)
},get:function(b){return this.attributes[b]
},escape:function(b){var c;
if(c=this._escapedAttributes[b]){return c
}var d=this.attributes[b];
return this._escapedAttributes[b]=Z.escape(d==null?"":""+d)
},has:function(b){return this.attributes[b]!=null
},set:function(i,h,k){var j,f,d;
if(Z.isObject(i)||i==null){j=i;
k=h
}else{j={};
j[i]=h
}k||(k={});
if(!j){return this
}if(j instanceof J){j=j.attributes
}if(k.unset){for(f in j){j[f]=void 0
}}if(!this._validate(j,k)){return false
}if(this.idAttribute in j){this.id=j[this.idAttribute]
}var g=k.changes={};
var c=this.attributes;
var b=this._escapedAttributes;
var e=this._previousAttributes||{};
for(f in j){d=j[f];
if(!Z.isEqual(c[f],d)||(k.unset&&Z.has(c,f))){delete b[f];
(k.silent?this._silent:g)[f]=true
}k.unset?delete c[f]:c[f]=d;
if(!Z.isEqual(e[f],d)||(Z.has(c,f)!=Z.has(e,f))){this.changed[f]=d;
if(!k.silent){this._pending[f]=true
}}else{delete this.changed[f];
delete this._pending[f]
}}if(!k.silent){this.change(k)
}return this
},unset:function(b,c){(c||(c={})).unset=true;
return this.set(b,null,c)
},clear:function(b){(b||(b={})).unset=true;
return this.set(Z.clone(this.attributes),b)
},fetch:function(c){c=c?Z.clone(c):{};
var b=this;
var d=c.success;
c.success=function(g,e,f){if(!b.set(b.parse(g,f),c)){return false
}if(d){d(b,g)
}};
c.error=C.wrapError(c.error,b,c);
return(this.sync||C.sync).call(this,"read",this,c)
},save:function(g,f,k){var h,e;
if(Z.isObject(g)||g==null){h=g;
k=f
}else{h={};
h[g]=f
}k=k?Z.clone(k):{};
if(k.wait){e=Z.clone(this.attributes)
}var c=Z.extend({},k,{silent:true});
if(h&&!this.set(h,k.wait?c:k)){return false
}var d=this;
var i=k.success;
k.success=function(o,l,n){var m=d.parse(o,n);
if(k.wait){m=Z.extend(h||{},m)
}if(!d.set(m,k)){return false
}if(i){i(d,o)
}else{d.trigger("sync",d,o,k)
}};
k.error=C.wrapError(k.error,d,k);
var b=this.isNew()?"create":"update";
var j=(this.sync||C.sync).call(this,b,this,k);
if(k.wait){this.set(e,c)
}return j
},destroy:function(c){c=c?Z.clone(c):{};
var b=this;
var f=c.success;
var e=function(){b.trigger("destroy",b,b.collection,c)
};
if(this.isNew()){return e()
}c.success=function(g){if(c.wait){e()
}if(f){f(b,g)
}else{b.trigger("sync",b,g,c)
}};
c.error=C.wrapError(c.error,b,c);
var d=(this.sync||C.sync).call(this,"delete",this,c);
if(!c.wait){e()
}return d
},url:function(){var b=D(this.collection,"url")||D(this,"urlRoot")||S();
if(this.isNew()){return b
}return b+(b.charAt(b.length-1)=="/"?"":"/")+encodeURIComponent(this.id)
},parse:function(c,b){return c
},clone:function(){return new this.constructor(this.attributes)
},isNew:function(){return this.id==null
},change:function(c){c||(c={});
var e=this._changing;
this._changing=true;
for(var b in this._silent){this._pending[b]=true
}var d=Z.extend({},c.changes,this._silent);
this._silent={};
for(var b in d){this.trigger("change:"+b,this,this.attributes[b],c)
}if(e){return this
}while(!Z.isEmpty(this._pending)){this._pending={};
this.trigger("change",this,c);
for(var b in this.changed){if(this._pending[b]||this._silent[b]){continue
}delete this.changed[b]
}this._previousAttributes=Z.clone(this.attributes)
}this._changing=false;
return this
},hasChanged:function(b){if(!arguments.length){return !Z.isEmpty(this.changed)
}return Z.has(this.changed,b)
},changedAttributes:function(d){if(!d){return this.hasChanged()?Z.clone(this.changed):false
}var f,e=false,c=this._previousAttributes;
for(var b in d){if(Z.isEqual(c[b],(f=d[b]))){continue
}(e||(e={}))[b]=f
}return e
},previous:function(b){if(!arguments.length||!this._previousAttributes){return null
}return this._previousAttributes[b]
},previousAttributes:function(){return Z.clone(this._previousAttributes)
},isValid:function(){return !this.validate(this.attributes)
},_validate:function(d,c){if(c.silent||!this.validate){return true
}d=Z.extend({},this.attributes,d);
var b=this.validate(d,c);
if(!b){return true
}if(c&&c.error){c.error(this,b,c)
}else{this.trigger("error",this,b,c)
}return false
}});
var a=C.Collection=function(c,b){b||(b={});
if(b.comparator){this.comparator=b.comparator
}this._reset();
this.initialize.apply(this,arguments);
if(c){this.reset(c,{silent:true,parse:b.parse})
}};
Z.extend(a.prototype,M,{model:J,initialize:function(){},toJSON:function(){return this.map(function(b){return b.toJSON()
})
},add:function(c,m){var h,k,e,j,l,d,f={},b={},g=[];
m||(m={});
c=Z.isArray(c)?c.slice():[c];
for(h=0,e=c.length;
h<e;
h++){if(!(j=c[h]=this._prepareModel(c[h],m))){throw new Error("Can't add an invalid model to a collection")
}l=j.cid;
d=j.id;
if(f[l]||this._byCid[l]||((d!=null)&&(b[d]||this._byId[d]))){g.push(h);
continue
}f[l]=b[d]=j
}h=g.length;
while(h--){c.splice(g[h],1)
}for(h=0,e=c.length;
h<e;
h++){(j=c[h]).on("all",this._onModelEvent,this);
this._byCid[j.cid]=j;
if(j.id!=null){this._byId[j.id]=j
}}this.length+=e;
k=m.at!=null?m.at:this.models.length;
X.apply(this.models,[k,0].concat(c));
if(this.comparator){this.sort({silent:true})
}if(m.silent){return this
}for(h=0,e=this.models.length;
h<e;
h++){if(!f[(j=this.models[h]).cid]){continue
}m.index=h;
j.trigger("add",j,this,m)
}return this
},remove:function(g,e){var f,b,d,c;
e||(e={});
g=Z.isArray(g)?g.slice():[g];
for(f=0,b=g.length;
f<b;
f++){c=this.getByCid(g[f])||this.get(g[f]);
if(!c){continue
}delete this._byId[c.id];
delete this._byCid[c.cid];
d=this.indexOf(c);
this.models.splice(d,1);
this.length--;
if(!e.silent){e.index=d;
c.trigger("remove",c,this,e)
}this._removeReference(c)
}return this
},push:function(c,b){c=this._prepareModel(c,b);
this.add(c,b);
return c
},pop:function(c){var b=this.at(this.length-1);
this.remove(b,c);
return b
},unshift:function(c,b){c=this._prepareModel(c,b);
this.add(c,Z.extend({at:0},b));
return c
},shift:function(c){var b=this.at(0);
this.remove(b,c);
return b
},get:function(b){if(b==null){return void 0
}return this._byId[b.id!=null?b.id:b]
},getByCid:function(b){return b&&this._byCid[b.cid||b]
},at:function(b){return this.models[b]
},sort:function(c){c||(c={});
if(!this.comparator){throw new Error("Cannot sort a set without a comparator")
}var b=Z.bind(this.comparator,this);
if(this.comparator.length==1){this.models=this.sortBy(b)
}else{this.models.sort(b)
}if(!c.silent){this.trigger("reset",this,c)
}return this
},pluck:function(b){return Z.map(this.models,function(c){return c.get(b)
})
},reset:function(e,c){e||(e=[]);
c||(c={});
for(var d=0,b=this.models.length;
d<b;
d++){this._removeReference(this.models[d])
}this._reset();
this.add(e,{silent:true,parse:c.parse});
if(!c.silent){this.trigger("reset",this,c)
}return this
},fetch:function(b){b=b?Z.clone(b):{};
if(b.parse===undefined){b.parse=true
}var d=this;
var c=b.success;
b.success=function(g,e,f){d[b.add?"add":"reset"](d.parse(g,f),b);
if(c){c(d,g)
}};
b.error=C.wrapError(b.error,d,b);
return(this.sync||C.sync).call(this,"read",this,b)
},create:function(c,b){var d=this;
b=b?Z.clone(b):{};
c=this._prepareModel(c,b);
if(!c){return false
}if(!b.wait){d.add(c,b)
}var e=b.success;
b.success=function(f,h,g){if(b.wait){d.add(f,b)
}if(e){e(f,h)
}else{f.trigger("sync",c,h,b)
}};
c.save(null,b);
return c
},parse:function(c,b){return c
},chain:function(){return Z(this.models).chain()
},_reset:function(b){this.length=0;
this.models=[];
this._byId={};
this._byCid={}
},_prepareModel:function(d,c){c||(c={});
if(!(d instanceof J)){var b=d;
c.collection=this;
d=new this.model(b,c);
if(!d._validate(d.attributes,c)){d=false
}}else{if(!d.collection){d.collection=this
}}return d
},_removeReference:function(b){if(this==b.collection){delete b.collection
}b.off("all",this._onModelEvent,this)
},_onModelEvent:function(d,c,e,b){if((d=="add"||d=="remove")&&e!=this){return 
}if(d=="destroy"){this.remove(c,b)
}if(c&&d==="change:"+c.idAttribute){delete this._byId[c.previous(c.idAttribute)];
this._byId[c.id]=c
}this.trigger.apply(this,arguments)
}});
var V=["forEach","each","map","reduce","reduceRight","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","max","min","sortBy","sortedIndex","toArray","size","first","initial","rest","last","without","indexOf","shuffle","lastIndexOf","isEmpty","groupBy"];
Z.each(V,function(b){a.prototype[b]=function(){return Z[b].apply(Z,[this.models].concat(Z.toArray(arguments)))
}
});
var Y=C.Router=function(b){b||(b={});
if(b.routes){this.routes=b.routes
}this._bindRoutes();
this.initialize.apply(this,arguments)
};
var H=/:\w+/g;
var W=/\*\w+/g;
var E=/[-[\]{}()+?.,\\^$|#\s]/g;
Z.extend(Y.prototype,M,{initialize:function(){},route:function(b,c,d){C.history||(C.history=new B);
if(!Z.isRegExp(b)){b=this._routeToRegExp(b)
}if(!d){d=this[c]
}C.history.route(b,Z.bind(function(f){var e=this._extractParameters(b,f);
d&&d.apply(this,e);
this.trigger.apply(this,["route:"+c].concat(e));
C.history.trigger("route",this,c,e)
},this));
return this
},navigate:function(c,b){C.history.navigate(c,b)
},_bindRoutes:function(){if(!this.routes){return 
}var c=[];
for(var d in this.routes){c.unshift([d,this.routes[d]])
}for(var e=0,b=c.length;
e<b;
e++){this.route(c[e][0],c[e][1],this[c[e][1]])
}},_routeToRegExp:function(b){b=b.replace(E,"\\$&").replace(H,"([^/]+)").replace(W,"(.*?)");
return new RegExp("^"+b+"$")
},_extractParameters:function(b,c){return b.exec(c).slice(1)
}});
var B=C.History=function(){this.handlers=[];
Z.bindAll(this,"checkUrl")
};
var L=/^[#\/]/;
var I=/msie [\w.]+/;
B.started=false;
Z.extend(B.prototype,M,{interval:50,getFragment:function(c,b){if(c==null){if(this._hasPushState||b){c=window.location.pathname;
var d=window.location.search;
if(d){c+=d
}}else{c=window.location.hash
}}c=decodeURIComponent(c);
if(!c.indexOf(this.options.root)){c=c.substr(this.options.root.length)
}return c.replace(L,"")
},start:function(d){if(B.started){throw new Error("Backbone.history has already been started")
}B.started=true;
this.options=Z.extend({},{root:"/"},this.options,d);
this._wantsHashChange=this.options.hashChange!==false;
this._wantsPushState=!!this.options.pushState;
this._hasPushState=!!(this.options.pushState&&window.history&&window.history.pushState);
var c=this.getFragment();
var b=document.documentMode;
var f=(I.exec(navigator.userAgent.toLowerCase())&&(!b||b<=7));
if(f){this.iframe=F('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow;
this.navigate(c)
}if(this._hasPushState){F(window).bind("popstate",this.checkUrl)
}else{if(this._wantsHashChange&&("onhashchange" in window)&&!f){F(window).bind("hashchange",this.checkUrl)
}else{if(this._wantsHashChange){this._checkUrlInterval=setInterval(this.checkUrl,this.interval)
}}}this.fragment=c;
var g=window.location;
var e=g.pathname==this.options.root;
if(this._wantsHashChange&&this._wantsPushState&&!this._hasPushState&&!e){this.fragment=this.getFragment(null,true);
window.location.replace(this.options.root+"#"+this.fragment);
return true
}else{if(this._wantsPushState&&this._hasPushState&&e&&g.hash){this.fragment=g.hash.replace(L,"");
window.history.replaceState({},document.title,g.protocol+"//"+g.host+this.options.root+this.fragment)
}}if(!this.options.silent){return this.loadUrl()
}},stop:function(){F(window).unbind("popstate",this.checkUrl).unbind("hashchange",this.checkUrl);
clearInterval(this._checkUrlInterval);
B.started=false
},route:function(b,c){this.handlers.unshift({route:b,callback:c})
},checkUrl:function(c){var b=this.getFragment();
if(b==this.fragment&&this.iframe){b=this.getFragment(this.iframe.location.hash)
}if(b==this.fragment||b==decodeURIComponent(this.fragment)){return false
}if(this.iframe){this.navigate(b)
}this.loadUrl()||this.loadUrl(window.location.hash)
},loadUrl:function(d){var c=this.fragment=this.getFragment(d);
var b=Z.any(this.handlers,function(e){if(e.route.test(c)){e.callback(c);
return true
}});
return b
},navigate:function(c,b){if(!B.started){return false
}if(!b||b===true){b={trigger:b}
}var d=(c||"").replace(L,"");
if(this.fragment==d||this.fragment==decodeURIComponent(d)){return 
}if(this._hasPushState){if(d.indexOf(this.options.root)!=0){d=this.options.root+d
}this.fragment=d;
window.history[b.replace?"replaceState":"pushState"]({},document.title,d)
}else{if(this._wantsHashChange){this.fragment=d;
this._updateHash(window.location,d,b.replace);
if(this.iframe&&(d!=this.getFragment(this.iframe.location.hash))){if(!b.replace){this.iframe.document.open().close()
}this._updateHash(this.iframe.location,d,b.replace)
}}else{window.location.assign(this.options.root+c)
}}if(b.trigger){this.loadUrl(c)
}},_updateHash:function(b,c,d){if(d){b.replace(b.toString().replace(/(javascript:|#).*$/,"")+"#"+c)
}else{b.hash=c
}}});
var R=C.View=function(b){this.cid=Z.uniqueId("view");
this._configure(b||{});
this._ensureElement();
this.initialize.apply(this,arguments);
this.delegateEvents()
};
var A=/^(\S+)\s*(.*)$/;
var T=["model","collection","el","id","attributes","className","tagName"];
Z.extend(R.prototype,M,{tagName:"div",$:function(b){return this.$el.find(b)
},initialize:function(){},render:function(){return this
},remove:function(){this.$el.remove();
return this
},make:function(c,b,e){var d=document.createElement(c);
if(b){F(d).attr(b)
}if(e){F(d).html(e)
}return d
},setElement:function(b,c){this.$el=F(b);
this.el=this.$el[0];
if(c!==false){this.delegateEvents()
}return this
},delegateEvents:function(f){if(!(f||(f=D(this,"events")))){return 
}this.undelegateEvents();
for(var e in f){var g=f[e];
if(!Z.isFunction(g)){g=this[f[e]]
}if(!g){throw new Error('Method "'+f[e]+'" does not exist')
}var d=e.match(A);
var c=d[1],b=d[2];
g=Z.bind(g,this);
c+=".delegateEvents"+this.cid;
if(b===""){this.$el.bind(c,g)
}else{this.$el.delegate(b,c,g)
}}},undelegateEvents:function(){this.$el.unbind(".delegateEvents"+this.cid)
},_configure:function(d){if(this.options){d=Z.extend({},this.options,d)
}for(var e=0,c=T.length;
e<c;
e++){var b=T[e];
if(d[b]){this[b]=d[b]
}}this.options=d
},_ensureElement:function(){if(!this.el){var b=D(this,"attributes")||{};
if(this.id){b.id=this.id
}if(this.className){b["class"]=this.className
}this.setElement(this.make(this.tagName,b),false)
}else{this.setElement(this.el,false)
}}});
var U=function(b,c){var d=K(this,b,c);
d.extend=this.extend;
return d
};
J.extend=a.extend=Y.extend=R.extend=U;
var Q={create:"POST",update:"PUT","delete":"DELETE",read:"GET"};
C.sync=function(f,c,b){var d=Q[f];
var e={type:d,dataType:"json"};
if(!b.url){e.url=D(c,"url")||S()
}if(!b.data&&c&&(f=="create"||f=="update")){e.contentType="application/json";
e.data=JSON.stringify(c.toJSON())
}if(C.emulateJSON){e.contentType="application/x-www-form-urlencoded";
e.data=e.data?{model:e.data}:{}
}if(C.emulateHTTP){if(d==="PUT"||d==="DELETE"){if(C.emulateJSON){e.data._method=d
}e.type="POST";
e.beforeSend=function(g){g.setRequestHeader("X-HTTP-Method-Override",d)
}
}}if(e.type!=="GET"&&!C.emulateJSON){e.processData=false
}return F.ajax(Z.extend(e,b))
};
C.wrapError=function(c,d,b){return function(e,f){f=e===d?f:e;
if(c){c(d,f,b)
}else{d.trigger("error",d,f,b)
}}
};
var G=function(){};
var K=function(c,b,d){var e;
if(b&&b.hasOwnProperty("constructor")){e=b.constructor
}else{e=function(){c.apply(this,arguments)
}
}Z.extend(e,c);
G.prototype=c.prototype;
e.prototype=new G();
if(b){Z.extend(e.prototype,b)
}if(d){Z.extend(e,d)
}e.prototype.constructor=e;
e.__super__=c.prototype;
return e
};
var D=function(b,c){if(!(b&&b[c])){return null
}return Z.isFunction(b[c])?b[c]():b[c]
};
var S=function(){throw new Error('A "url" property or function must be specified')
}
}).call(this);
