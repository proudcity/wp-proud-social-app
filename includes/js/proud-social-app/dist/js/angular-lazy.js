!function(){"use strict";function inViewDirective($parse){return{restrict:"A",require:"?^^inViewContainer",link:function(scope,element,attrs,container){var options={};attrs.inViewOptions&&(options=scope.$eval(attrs.inViewOptions)),options.offset&&(options.offset=normalizeOffset(options.offset)),options.viewportOffset&&(options.viewportOffset=normalizeOffset(options.viewportOffset));var viewportEventSignal=signalSingle({type:"initial"}).merge(signalFromEvent(window,"checkInView click ready wheel mousewheel DomMouseScroll MozMousePixelScroll resize scroll touchmove mouseup keydown"));container&&(viewportEventSignal=viewportEventSignal.merge(container.eventsSignal)),options.throttle&&(viewportEventSignal=viewportEventSignal.throttle(options.throttle));var inviewInfoSignal=viewportEventSignal.map(function(event){var viewportRect;viewportRect=container?container.getViewportRect():getViewportRect(),viewportRect=offsetRect(viewportRect,options.viewportOffset);var elementRect=offsetRect(element[0].getBoundingClientRect(),options.offset),isVisible=!!(element[0].offsetWidth||element[0].offsetHeight||element[0].getClientRects().length),info={inView:isVisible&&intersectRect(elementRect,viewportRect),event:event,element:element,elementRect:elementRect,viewportRect:viewportRect};return options.generateParts&&info.inView&&(info.parts={},info.parts.top=elementRect.top>=viewportRect.top,info.parts.left=elementRect.left>=viewportRect.left,info.parts.bottom=elementRect.bottom<=viewportRect.bottom,info.parts.right=elementRect.right<=viewportRect.right),info}).scan({},function(lastInfo,newInfo){return options.generateDirection&&newInfo.inView&&lastInfo.elementRect&&(newInfo.direction={horizontal:newInfo.elementRect.left-lastInfo.elementRect.left,vertical:newInfo.elementRect.top-lastInfo.elementRect.top}),newInfo.changed=newInfo.inView!==lastInfo.inView||!angular.equals(newInfo.parts,lastInfo.parts)||!angular.equals(newInfo.direction,lastInfo.direction),newInfo}).filter(function(info){return!!info.changed&&!("initial"===info.event.type&&!info.inView)}),inViewExpression=$parse(attrs.inView),dispose=inviewInfoSignal.subscribe(function(info){scope.$applyAsync(function(){inViewExpression(scope,{$inview:info.inView,$inviewInfo:info})})});scope.$on("$destroy",dispose)}}}function inViewContainerDirective(){return{restrict:"A",controller:["$element",function($element){this.element=$element,this.eventsSignal=signalFromEvent($element,"scroll"),this.getViewportRect=function(){return $element[0].getBoundingClientRect()}}]}}function getViewportRect(){var result={top:0,left:0,width:window.innerWidth,right:window.innerWidth,height:window.innerHeight,bottom:window.innerHeight};if(result.height)return result;var mode=document.compatMode;return"CSS1Compat"===mode?(result.width=result.right=document.documentElement.clientWidth,result.height=result.bottom=document.documentElement.clientHeight):(result.width=result.right=document.body.clientWidth,result.height=result.bottom=document.body.clientHeight),result}function intersectRect(r1,r2){return!(r2.left>r1.right||r2.right<r1.left||r2.top>r1.bottom||r2.bottom<r1.top)}function normalizeOffset(offset){return angular.isArray(offset)?2==offset.length?offset.concat(offset):3==offset.length?offset.concat([offset[1]]):offset:[offset,offset,offset,offset]}function offsetRect(rect,offset){if(!offset)return rect;var offsetObject={top:isPercent(offset[0])?parseFloat(offset[0])*rect.height:offset[0],right:isPercent(offset[1])?parseFloat(offset[1])*rect.width:offset[1],bottom:isPercent(offset[2])?parseFloat(offset[2])*rect.height:offset[2],left:isPercent(offset[3])?parseFloat(offset[3])*rect.width:offset[3]};return{top:rect.top-offsetObject.top,left:rect.left-offsetObject.left,bottom:rect.bottom+offsetObject.bottom,right:rect.right+offsetObject.right,height:rect.height+offsetObject.top+offsetObject.bottom,width:rect.width+offsetObject.left+offsetObject.right}}function isPercent(n){return angular.isString(n)&&n.indexOf("%")>0}function QuickSignal(didSubscribeFunc){this.didSubscribeFunc=didSubscribeFunc}function signalMerge(){var signals=arguments;return new QuickSignal(function(subscriber){for(var disposables=[],i=signals.length-1;i>=0;i--)disposables.push(signals[i].subscribe(function(){subscriber.apply(null,arguments)}));subscriber.$dispose=function(){for(var i=disposables.length-1;i>=0;i--)disposables[i]&&disposables[i]()}})}function signalFromEvent(target,event){return new QuickSignal(function(subscriber){var handler=function(e){subscriber(e)},el=angular.element(target);el.on(event,handler),subscriber.$dispose=function(){el.off(event,handler)}})}function signalSingle(value){return new QuickSignal(function(subscriber){setTimeout(function(){subscriber(value)})})}var angularInviewModule=angular.module("angular-inview",[]).directive("inView",["$parse",inViewDirective]).directive("inViewContainer",inViewContainerDirective);QuickSignal.prototype.subscribe=function(subscriber){this.didSubscribeFunc(subscriber);var dispose=function(){subscriber.$dispose&&(subscriber.$dispose(),subscriber.$dispose=null)};return dispose},QuickSignal.prototype.map=function(f){var s=this;return new QuickSignal(function(subscriber){subscriber.$dispose=s.subscribe(function(nextValue){subscriber(f(nextValue))})})},QuickSignal.prototype.filter=function(f){var s=this;return new QuickSignal(function(subscriber){subscriber.$dispose=s.subscribe(function(nextValue){f(nextValue)&&subscriber(nextValue)})})},QuickSignal.prototype.scan=function(initial,scanFunc){var s=this;return new QuickSignal(function(subscriber){var last=initial;subscriber.$dispose=s.subscribe(function(nextValue){last=scanFunc(last,nextValue),subscriber(last)})})},QuickSignal.prototype.merge=function(signal){return signalMerge(this,signal)},QuickSignal.prototype.throttle=function(threshhold){var last,deferTimer,s=this;return new QuickSignal(function(subscriber){var chainDisposable=s.subscribe(function(){var now=+new Date,args=arguments;last&&now<last+threshhold?(clearTimeout(deferTimer),deferTimer=setTimeout(function(){last=now,subscriber.apply(null,args)},threshhold)):(last=now,subscriber.apply(null,args))});subscriber.$dispose=function(){clearTimeout(deferTimer),chainDisposable&&chainDisposable()}})},"function"==typeof define&&define.amd?define(["angular"],angularInviewModule):"undefined"!=typeof module&&module&&module.exports&&(module.exports=angularInviewModule)}(),angular.module("angular-lazycompile",[]).directive("lazyCompile",["$compile","$timeout",function($compile,$timeout){return{scope:{lazyCompile:"=",lazyDecode:"=",lazyTimeout:"=",lazyTimeoutDur:"="},replace:!0,link:function(scope,element,attrs){var voidCompile,timeout,rendered=!1,timeoutVal=scope.lazyTimeout,timeoutDur=scope.lazyTimeoutDur||1e3,compile=function(value){if(value&&"false"!=value){scope.lazyDecode&&(value=decodeURIComponent(value));var lazyContent=angular.element(value);element.after(lazyContent),$compile(lazyContent)(scope.$parent),setTimeout(function(){scope.$destroy(),scope=null,element.remove(),element=null},0),rendered=!0,voidCompile(),timeout&&$timeout.cancel(timeout)}};voidCompile=scope.$watch("lazyCompile",function(value,oldVal){var doRender=!rendered&&value&&"false"!==value&&value!==oldVal;doRender&&compile(value)}),timeoutVal&&(timeout=$timeout(function(){rendered||compile(timeoutVal)},parseInt(timeoutDur)))}}}]);