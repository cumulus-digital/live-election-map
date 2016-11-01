!function(t,e){function a(){o("")}function o(t){var e=s.qs(".emap-loading-log");e&&(e.innerHTML=t)}function n(t,e,a){var o=s.qs(".emap-log"),n=s.intHash(t+e);if(!(o.innerHTML.indexOf('data-hash="'+n+'"')>-1)){var i=r.document.createElement("div");i.setAttribute("data-hash",n),i.setAttribute("class",a);var l=r.document.createElement("time");l.setAttribute("class","emap-log-ts"),l.setAttribute("datetime",t.toDate().toISOString()),i.appendChild(l);var d=r.document.createElement("span");d.setAttribute("class","emap-log-body"),d.innerHTML=e,i.appendChild(d),o.insertBefore(i,o.firstChild)}}function i(){if(moment){var t=s.qsa(".emap-log time");t=[].slice.call(t),t.forEach(function(t){var e=t.getAttribute("datetime");e&&(e=moment(e),t.innerText=e.fromNow())})}}var r=t;r.eMap=r.eMap||{};var s=r.eMap,l={},d,c,u,p=!1,h={displayMap:function(){s.aEL(r,"emap.loaded",function(){return a(),p?void r.removeEventListener("emap.loaded",this):(p=!0,s.addClass(s.qs("#election-container"),"loaded"),a(),void setTimeout(function(){s.qs(".emap-loading").style.display="none"},600))})},showLoading:function(){s.aEL(r,"emap.loading",function(){o("Refreshing Data&hellip;")})},showError:function(){s.aEL(r,"emap.error",function(t){o(t.detail)})},stateTooltips:function(){var t=[].slice.call(s.qsa("g.em-state"));t.forEach(function(t){s.aEL(t,"mouseover",function(t){var e=t.target;"g"!==t.target.nodeName&&(e=t.target.parentNode),e.getAttribute("data-state")&&l[e.getAttribute("data-state")]&&c.update(l[e.getAttribute("data-state")]).show()}),s.aEL(t,"mouseout",c.hide)})},callStateFill:function(){s.aEL(r,"emap.state.called",function(t){if(t.detail&&t.detail.state&&t.detail.for){var e=s.qs('.em-state[data-state="'+t.detail.state+'"]');s.hasClass(e,"called-"+t.detail.for)||(s.removeClass(e,/called[\-DRLG\s]*/g),s.addClass(e,"called"),s.addClass(e,"called-"+t.detail.for))}})},callStateFireworks:function(){s.aEL(r,"emap.state.called",function(t){p&&t.detail&&t.detail.state&&t.detail.for&&("D"!==t.detail.for&&"R"!==t.detail.for||(s.log("LAUNCHING FIREWORKS!",t),r.launchFireworks("D"===t.detail.for?"blue":"red",u)))})},callStateLog:function(){s.aEL(r,"emap.state.update",function(t){if(!(t.detail&&t.detail.State&&t.detail.CalledFor&&t.detail.timestamp))return void s.log("Skipping log due to failed conditions.",t);var e={D:"Hillary Clinton",R:"Donald J. Trump",L:"Garry Johnson",G:"Jill Stein"};return e[t.detail.CalledFor]?(s.log("Updating log with call for "+t.detail.StateAbbr,t),void n(t.detail.timestamp,"<strong>"+t.detail.State+"</strong> called for "+e[t.detail.CalledFor],"emap-log-"+t.detail.CalledFor)):void s.log("["+t.detail.StateAbbr+"] Skipping log due to mismatched candidate.",t)})},updateState:function(){s.aEL(r,"emap.state.update",function(t){if(t.detail&&t.detail.StateAbbr){s.log("Caught updateState ["+t.detail.StateAbbr+"]",t);var e=s.qs('.em-state[data-state="'+t.detail.StateAbbr+'"]');e&&s.hasClass(e,"called")&&!t.detail.CalledFor&&(s.log("Removing call from state ["+t.detail.StateAbbr+"]"),s.removeClass(e,/\s*called[\-DRLG\s]*/g),t.detail.timestamp||(t.detail.timestamp=moment()),n(t.detail.timestamp,"<strong>"+t.detail.State+"</strong> recalled!"))}})},updateBar:function(){s.aEL(r,"emap.loaded",function(){function t(t,e){var a=s.qs("span",t);a.innerText!==e&&(a.innerText=e,s.addClass(t,"egraph-updating"),t.style.width=100*(e/538)+"%",setTimeout(function(){s.removeClass(t,"egraph-updating")},1500))}if(!l.TOTALS)return void s.log("Attempted to update bar without totals",l);var e;l.TOTALS.RVotes&&(e=s.qs(".egraph-bar-r"),t(e,l.TOTALS.RVotes)),l.TOTALS.DVotes&&(e=s.qs(".egraph-bar-d"),t(e,l.TOTALS.DVotes))})},closeWelcome:function(){function t(){s.log("Closing welcome message.");var a=s.qs(".emap-welcome");s.addClass(a,"emap-closed"),s.rEL(e,"click",t),s.rEL(r,"click",t)}var e=s.qs(".emap-w-close");s.aEL(e,"click",t),s.aEL(r,"click",t)},launchOnClick:function(){s.aEL(s.qs(".egraph-d img"),"click",function(){r.launchFireworks("blue")}),s.aEL(s.qs(".egraph-r img"),"click",function(){r.launchFireworks("red")})}};r.eMapInit=function(){var t=new Miso.Dataset({importer:Miso.Dataset.Importers.GoogleSpreadsheet,parser:Miso.Dataset.Parsers.GoogleSpreadsheet,key:"1BAZmjnL7qWjJeVykQG78Ol2C4fneULJVItTSYugZbiE",worksheet:"1",columns:[{name:"State",type:"string"},{name:"StateAbbr",type:"string"},{name:"ElVotes",type:"number"},{name:"CalledFor",type:"string"},{name:"RVotes",type:"string"},{name:"DVotes",type:"string"},{name:"LVotes",type:"string"},{name:"GVotes",type:"string"},{name:"timestamp",type:"time",format:"YYYY-MM-DD[T]HH:mm:ssZ"}]});d=new r.eMapImporter(t,l,{autoInit:!0}),c=new r.eMapToolTip;for(var e in h)h[e]()},setInterval(i,1e3)}(window),function(t,e){var a=t,o=a.document,n=a.eMap||{};n.log=t._CMLS?t._CMLS.logger:function(){if(n.DEBUG)try{var t=new Date,e=[].slice.call(arguments);t=t.toISOString()?t.toISOString():t.toUTCString(),e.unshift("[eMap]"),a.top.console.groupCollapsed.apply(a.top.console,e),a.top.console.log("TIMESTAMP:",t),a.top.console.trace(),a.top.console.groupEnd()}catch(t){}},n.hasClass=function(t,e){var a=t.getAttribute("class");return!!(a&&(a=a.split(" "),a.indexOf(e)>-1))},n.addClass=function(t,e){var a=t.getAttribute("class");if(a){if(a=a.split(" "),a.indexOf(e)>-1)return}else a=[];a.push(e),t.setAttribute("class",a.join(" "))},n.removeClass=function(t,e){t.setAttribute("class",t.getAttribute("class").replace(e,""))},n.qsa=function(t,e){return(e||o).querySelectorAll(t)},n.qs=function(t,e){return n.qsa(t,e)[0]},n.aEL=function(t,e,o,n){return(t||a).addEventListener(e,o,n)},n.rEL=function(t,e,o){return(t||a).removeEventListener(e,o)},n.intHash=function(t){for(var e=5381,a=t.length;a;)e=33*e^t.charCodeAt(--a);return e>>>0}}(window),function(t,e){function a(e,a,o){function n(t,e){var o=a[t]||{};if(a[t]=e,p.fireEvent(d,"emap.state.update",e),T("Updating state ["+t+"]",o,e),e.CalledFor&&(!o.CalledFor||o.CalledFor!==e.CalledFor)){var n={state:e.StateAbbr,elVotes:e.ElVotes,for:e.CalledFor};T("STATE CALLED",n),p.fireEvent(d,"emap.state.called",n)}}function i(){return clearTimeout(f),f=null}function r(){return e?(T("Fetching new data..."),p.fireEvent(d,"emap.loading"),i(),p.settings.dataSource.reset(),void p.settings.dataSource.fetch({success:function(){s()},error:function(){return g>10?void p.fireEvent(d,"emap-error",{message:"Too many errors fetching data, please reload the page at a later time."}):(g++,i(),void(f=setTimeout(r,2e3)))}})):void T("No datasource provided.")}function s(){T("Data received"),g=0,p.settings.dataSource.sort(function(t,e){return t.timestamp>e.timestamp?1:t.timestamp<e.timestamp?-1:0});var t=p.settings.dataSource.rows(),e=_.after(t.length,function(){T("New Totals: ",a.TOTALS),c[h]?T("Document is hidden, will not start timer."):p.startFetchTimer(),p.fireEvent(d,"emap.loaded")});a.TOTALS={RVotes:0,DVotes:0,LVotes:0,GVotes:0},T("Pre-fetch Totals:",a.TOTALS),t.each(function(t){t.StateAbbr&&n.call(p,t.StateAbbr,t),"TOTALS"===t.State&&(a.TOTALS={RVotes:t.RVotes,DVotes:t.DVotes,LVotes:t.LVotes,GVotes:t.GVotes}),e()})}function l(){var t=new Date;if(c[h])f&&(T("Tab is hidden.  Pausing timer with "+((y.getTime()-t.getTime())/1e3||"unknown")+" seconds remaining."),p.stopFetchTimer(),v=!0);else if(v){var e;y&&t.getTime()<y.getTime()?(e=y.getTime()-t.getTime(),p.startFetchTimer(e),v=!1):(T("Tab was focused after original refresh time, fetching new data immediately."),r())}else p.startFetchTimer()}o=o||{},this.settings={dataSource:e||null,stateData:a||{},refreshTime:o.refreshTime||6e4,randomPad:o.randomPad||6e4,autoInit:o.autoInit||!1};var d=t,c=d.document,u=d.eMap||{},p=this,h,m,f,g,v,y,T=t._CMLS?t._CMLS.logger:u&&u.log?u.log:function(){if(u.DEBUG)try{var t=new Date,e=[].slice.call(arguments);t=t.toISOString()?t.toISOString():t.toUTCString(),e.unshift("[eMI]"),d.top.console.groupCollapsed.apply(d.top.console,e),d.top.console.log("TIMESTAMP:",t),d.top.console.trace(),d.top.console.groupEnd()}catch(t){}};p.fireEvent=function t(e,a,o){var n;c.createEvent?(n=c.createEvent("CustomEvent"),n.initCustomEvent(a,!0,!0,o)):n=new CustomEvent(a,{detail:o}),e.dispatchEvent(n)},this.forceFetchData=r,p.stopFetchTimer=function(){i()},p.startFetchTimer=function(t){if(p.settings.refreshTime){var e=t||p.settings.refreshTime+Math.floor(Math.random()*p.settings.randomPad);T("Refreshing data in "+e/1e3+" seconds."),f=setTimeout(r,e),y=new Date((new Date).getTime()+e)}},"undefined"!=typeof c.hidden?(h="hidden",m="visibilitychange"):"undefined"!=typeof c.msHidden?(h="msHidden",m="msvisibilitychange"):"undefined"!=typeof c.webkitHidden&&(h="webkitHidden",m="webkitvisibilitychange"),"undefined"!=typeof c.addEventListener&&"undefined"!=typeof c[h]&&c.addEventListener(m,l,!1);var S=p.settings.randomPad;d.addEventListener("blur",function(){p.settings.randomPad=2*S,T("Window lost focus, slowing down updates.",p.settings.refreshTime,p.settings.randomPad)}),d.addEventListener("focus",function(){p.settings.randomPad=S,T("Window regained focus, restoring original update speed.",p.settings.refreshTime,p.settings.randomPad)}),T("eMapImporter initialized."),p.init=function(){r()},p.settings.autoInit===!0&&p.init(),d.emapForceFetchData=p.forceFetchData}t.eMapImporter=a}(window),function(t,e){function a(e){function a(){this.movementListener=_.throttle(n,30),h.addEventListener("mousemove",this.movementListener)}function o(){this.movementListener&&h.removeEventListener("mousemove",this.movementListener)}function n(t){var e=parseInt(m.offsetWidth,10),a=parseInt(m.offsetHeight,10),o=parseInt(f.offsetWidth,10),n=parseInt(f.offsetHeight,10),i=t.pageX-e/2,r=t.pageY-a-n-12,s=t.pageX-o/2,l=h.getBoundingClientRect();i+e>l.right&&(i=l.right-e),i<l.left&&(i=l.left),m.style.left=i+"px",m.style.top=r+"px",s+o>i+e&&(s=i+e-o-1),s<i&&(s=i+1),f.style.left=s+"px",f.style.top=r+a+"px"}e=e||{},this.settings={template:e.template||"#tooltip-template",boundary:e.boundaryContainer||".tooltip-boundary",ttBody:e.ttBody||".tt-inner",ttArrow:e.ttArrow||".tt-arrow"};var i=t,r=i.document,s=i.eMap||{},l=function(t,e){return(e||r).querySelectorAll(t)},d=function(t,e){return(e||r).querySelector(t)},c=this,u=t._CMLS?t._CMLS.logger:function(){if(s.DEBUG)try{var t=new Date,e=[].slice.call(arguments);t=t.toISOString()?t.toISOString():t.toUTCString(),e.unshift("[eMI]"),i.top.console.groupCollapsed.apply(i.top.console,e),i.top.console.log("TIMESTAMP:",t),i.top.console.trace(),i.top.console.groupEnd()}catch(t){}};c.clearTooltip=function(){v.currentState=null},c.hide=function(){g=setTimeout(function(){u("Hiding tooltip."),v.style.display="none",c.clearTooltip()},100),o()},c.show=function(){u("Displaying tooltip"),clearTimeout(g),g=null,v.style.display="block",a()},c.update=function(t){if(v.currentState===t.State)return c;u("Received new data for tooltip",t),v.className="";var e=[].slice.call(l("[data-var]",v));return e.forEach(function(e){var a=e.getAttribute("data-var");return t[a]?"timestamp"===a&&moment?void(e.innerText="Updated "+t[a].fromNow()):(u(a,t[a]),"NOTONBALLOT"===t[a]&&a.indexOf("Votes")>-1&&(v.className+=" hide-"+a.substr(0,1)),void(e.innerText=t[a])):void(e.innerText="")}),t.CalledFor&&(v.className+=" called called-"+t.CalledFor),v.currentState=t.State,c};var p=d(c.settings.template),h=d(c.settings.boundary),m,f,g,v=r.createElement("div");v.innerHTML=p.innerHTML,v.style.display="none",v.id="ToolTip"+Math.floor(1e3*Math.random()),d("body").appendChild(v),m=d(c.settings.ttBody,v),f=d(c.settings.ttArrow,v)}a.prototype.checkForValue=function t(e,a){return"string"==typeof e&&e.toLowerCase()===a.toLowerCase()||e===a},t.eMapToolTip=a}(window),function(t,e){function a(){function t(t){var e=10*t;m.width=e,m.height=e,f.globalCompositeOperation="destination-over";for(var a=0;a<100;a++){var o=a*t,n=o%e,i=Math.floor(o/e)*t,r=n+t/2,s=i+t/2,l=f.createRadialGradient(r,s,t/1.4,r,s,1);l.addColorStop(0,"hsla("+Math.round(3.6*a)+", 150%, 0%, 0"),l.addColorStop(1,"hsla("+Math.round(3.6*a)+", 100%, 60%, 1"),f.fillStyle=l,f.fillRect(n,i,t,t)}}function e(){p.width=g,p.height=v}function a(){p.width=p.width}function s(){for(var t=u.length;t--;){var e=u[t];e.update()&&(u.splice(t,1),e.usePhysics||(Math.random()<.8?c.FireworkExplosions.star(e):c.FireworkExplosions.circle(e))),e.render(h,m)}}function l(){return S?[S.innerWidth,S.innerHeight]:[n.innerWidth,n.innerHeight]}function d(){var t=l();g=t[0],v=t[1],p&&e()}var c=this,u=[],p=null,h=null,m=null,f=null,g=0,v=0,y=0;this.FireworkExplosions={circle:function(t){for(var e=130,a=2*Math.PI/e;e--;){var o=4+4*Math.random(),n=e*a;c.createParticle(t.pos,null,{x:Math.cos(n)*o,y:Math.sin(n)*o},t.color,!0)}},star:function(t){var e=6+Math.round(15*Math.random()),a=3+Math.round(7*Math.random()),o=12,n=80,i=-(3*Math.random()-6),r=0,s=0,l=2*Math.PI,d=Math.random()*l;do{r=s,s=(s+a)%e;for(var u=r/e*l-d,p=(r+a)/e*l-d,h={x:t.pos.x+Math.cos(u)*n,y:t.pos.y+Math.sin(u)*n},m={x:t.pos.x+Math.cos(p)*n,y:t.pos.y+Math.sin(p)*n},f={x:m.x-h.x,y:m.y-h.y,a:p-u},g=0;g<o;g++){var v=g/o,y=u+v*f.a;c.createParticle({x:h.x+v*f.x,y:h.y+v*f.y},null,{x:Math.cos(y)*i,y:Math.sin(y)*i},t.color,!0)}}while(0!==s)}},this.createFirework=function t(e){y=0,c.createParticle(0,0,0,e)},this.update=function t(){return y>1e3?void c.destroy():(u.length<1&&y++,n.requestAnimFrame(c.update),a(),void s())},this.destroy=function t(){r("Destroying previously created fireworks canvas."),p.parentNode.removeChild(p),n.removeEventListener("resize",T)},this.createParticle=function t(e,a,n,i,r){e=e||{},a=a||{},n=n||{};var s=12*Math.floor(5*Math.random());s*=1===Math.floor(2*Math.random())?1:-1,i+=s,u.push(new o({x:e.x||.5*g,y:e.y||v+10},{y:a.y||200+200*Math.random()},{x:n.x||10*Math.random()-5,y:n.y||0},i||12*Math.floor(100*Math.random()),r))},d();var T=d;n._&&(T=n._.throttle(d,100)),n.addEventListener("resize",T),r("CREATING NEW CANVAS"),p=i.createElement("canvas"),p.id="mainFireworksCanvas"+Math.floor(1e6*Math.random()),p.style.position="absolute",p.style.top=0,p.style.left="50%",p.style.transform="translateX(-50%)",h=p.getContext("2d");var S=i.querySelector("#election-container");S?S.appendChild(p):i.body.appendChild(p),m=i.createElement("canvas"),f=m.getContext("2d"),t(12),e(),this.update()}function o(t,e,a,o,n){this.GRAVITY=.2,this.alpha=1,this.easing=.04*Math.random(),this.fade=.1*Math.random()+.018,this.gridX=o%120,this.gridY=12*Math.floor(o/120),this.color=o,this.pos={x:t.x||0,y:t.y||0},this.vel={x:a.x||0,y:a.y||0},this.lastPos={x:this.pos.x,y:this.pos.y},this.target={y:e.y||0},this.usePhysics=n||!1,this.update=function t(){if(this.lastPos.x=this.pos.x,this.lastPos.y=this.pos.y,this.usePhysics)this.vel.y+=this.GRAVITY,this.pos.y+=this.vel.y,this.alpha-=this.fade;else{var e=this.target.y-this.pos.y;this.pos.y+=e*(.03+this.easing),this.alpha=Math.min(e*e*5e-5,1)}return this.pos.x+=this.vel.x,this.alpha<.005},this.render=function t(e,a){var o=Math.round(this.pos.x),n=Math.round(this.pos.y),i=(o-this.lastPos.x)*-5,r=(n-this.lastPos.y)*-5;e.save(),e.globalCompositeOperation="xor",e.globalAlpha=Math.random()*this.alpha,e.fillStyle="rgba(255,255,255,0.3",e.beginPath(),e.moveTo(this.pos.x,this.pos.y),e.lineTo(this.pos.x+1.5,this.pos.y),e.lineTo(this.pos.x+i,this.pos.y+r),e.lineTo(this.pos.x-1.5,this.pos.y),e.closePath(),e.fill(),e.drawImage(a,this.gridX,this.gridY,12,12,o-6,n-6,12,12);var s=e.createRadialGradient(o,n,4,o,n,0);s.addColorStop(0,"rgba(255,255,255,0)"),s.addColorStop(1,"rgba(255,255,255,1)"),e.fillStyle=s,e.fillRect(o-3,n-3,6,6),1===Math.floor(2*Math.random())}}var n=t,i=n.document;n.requestAnimFrame=function(){return n.requestAnimationFrame||n.webkitRequestAnimationFrame||n.mozRequestAnimationFrame||n.oRequestAnimationFrame||n.msRequestAnimationFrame||function(t){n.setTimeout(t,1e3/60)}}();var r=t._CMLS?t._CMLS.logger:n.eMap&&n.eMap.log?n.eMap.log:function(){if(!n.eMap||n.eMap.DEBUG)try{var t=new Date,e=[].slice.call(arguments);t=t.toISOString()?t.toISOString():t.toUTCString(),e.unshift("[eMF]"),n.top.console.groupCollapsed.apply(n.top.console,e),n.top.console.log("TIMESTAMP:",t),n.top.console.trace(),n.top.console.groupEnd()}catch(t){}},s=4,l={red:{currentCount:0,color:1092,timer:null,launching:!1},blue:{currentCount:0,color:720,timer:null,launching:!1}};n.launchFireworks=function(t,e){function o(t){function e(){setTimeout(function(){n.createFirework(l[t].color)},100+2500*Math.random())}if(l[t].currentCount>s)return r("DONE LAUNCHING"),l[t].currentCount=0,l[t].launching=!1,clearTimeout(l[t].timer),void(l[t].timer=null);r("FIREWORKS VOLLEY "+l[t].currentCount);var a=Math.floor(3*Math.random())+2;r("LAUNCHING "+a+" FIREWORKS");for(var i=a;i>0;i--)e();l[t].currentCount++,l[t].launching=!0,clearTimeout(l[t].timer),l[t].timer=null,l[t].timer=setTimeout(function(){o(t)},3200*Math.random())}if(l[t].currentCount=0,l[t].launching)return void r("TEAM IS ALREADY LAUNCHING");r("LAUNCHING FIREWORKS",t);var n=e||new a;o(t)}}(window);
//# sourceMappingURL=./base-min.js.map