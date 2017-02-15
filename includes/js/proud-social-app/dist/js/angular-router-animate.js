/**
 * @license AngularJS v1.4.9
 * (c) 2010-2015 Google, Inc. http://angularjs.org
 * License: MIT
 */
!function(window,angular,undefined){"use strict";function assertArg(arg,name,reason){if(!arg)throw ngMinErr("areq","Argument '{0}' is {1}",name||"?",reason||"required");return arg}function mergeClasses(a,b){return a||b?a?b?(isArray(a)&&(a=a.join(" ")),isArray(b)&&(b=b.join(" ")),a+" "+b):a:b:""}function packageStyles(options){var styles={};return options&&(options.to||options.from)&&(styles.to=options.to,styles.from=options.from),styles}function pendClasses(classes,fix,isPrefix){var className="";return classes=isArray(classes)?classes:classes&&isString(classes)&&classes.length?classes.split(/\s+/):[],forEach(classes,function(klass,i){klass&&klass.length>0&&(className+=i>0?" ":"",className+=isPrefix?fix+klass:klass+fix)}),className}function removeFromArray(arr,val){var index=arr.indexOf(val);val>=0&&arr.splice(index,1)}function stripCommentsFromElement(element){if(element instanceof jqLite)switch(element.length){case 0:return[];case 1:
// there is no point of stripping anything if the element
// is the only element within the jqLite wrapper.
// (it's important that we retain the element instance.)
if(element[0].nodeType===ELEMENT_NODE)return element;break;default:return jqLite(extractElementNode(element))}if(element.nodeType===ELEMENT_NODE)return jqLite(element)}function extractElementNode(element){if(!element[0])return element;for(var i=0;i<element.length;i++){var elm=element[i];if(elm.nodeType==ELEMENT_NODE)return elm}}function $$addClass($$jqLite,element,className){forEach(element,function(elm){$$jqLite.addClass(elm,className)})}function $$removeClass($$jqLite,element,className){forEach(element,function(elm){$$jqLite.removeClass(elm,className)})}function applyAnimationClassesFactory($$jqLite){return function(element,options){options.addClass&&($$addClass($$jqLite,element,options.addClass),options.addClass=null),options.removeClass&&($$removeClass($$jqLite,element,options.removeClass),options.removeClass=null)}}function prepareAnimationOptions(options){if(options=options||{},!options.$$prepared){var domOperation=options.domOperation||noop;options.domOperation=function(){options.$$domOperationFired=!0,domOperation(),domOperation=noop},options.$$prepared=!0}return options}function applyAnimationStyles(element,options){applyAnimationFromStyles(element,options),applyAnimationToStyles(element,options)}function applyAnimationFromStyles(element,options){options.from&&(element.css(options.from),options.from=null)}function applyAnimationToStyles(element,options){options.to&&(element.css(options.to),options.to=null)}function mergeAnimationOptions(element,target,newOptions){var toAdd=(target.addClass||"")+" "+(newOptions.addClass||""),toRemove=(target.removeClass||"")+" "+(newOptions.removeClass||""),classes=resolveElementClasses(element.attr("class"),toAdd,toRemove);newOptions.preparationClasses&&(target.preparationClasses=concatWithSpace(newOptions.preparationClasses,target.preparationClasses),delete newOptions.preparationClasses);
// noop is basically when there is no callback; otherwise something has been set
var realDomOperation=target.domOperation!==noop?target.domOperation:null;
// TODO(matsko or sreeramu): proper fix is to maintain all animation callback in array and call at last,but now only leave has the callback so no issue with this.
return extend(target,newOptions),realDomOperation&&(target.domOperation=realDomOperation),classes.addClass?target.addClass=classes.addClass:target.addClass=null,classes.removeClass?target.removeClass=classes.removeClass:target.removeClass=null,target}function resolveElementClasses(existing,toAdd,toRemove){function splitClassesToLookup(classes){isString(classes)&&(classes=classes.split(" "));var obj={};return forEach(classes,function(klass){
// sometimes the split leaves empty string values
// incase extra spaces were applied to the options
klass.length&&(obj[klass]=!0)}),obj}var ADD_CLASS=1,REMOVE_CLASS=-1,flags={};existing=splitClassesToLookup(existing),toAdd=splitClassesToLookup(toAdd),forEach(toAdd,function(value,key){flags[key]=ADD_CLASS}),toRemove=splitClassesToLookup(toRemove),forEach(toRemove,function(value,key){flags[key]=flags[key]===ADD_CLASS?null:REMOVE_CLASS});var classes={addClass:"",removeClass:""};return forEach(flags,function(val,klass){var prop,allow;val===ADD_CLASS?(prop="addClass",allow=!existing[klass]):val===REMOVE_CLASS&&(prop="removeClass",allow=existing[klass]),allow&&(classes[prop].length&&(classes[prop]+=" "),classes[prop]+=klass)}),classes}function getDomNode(element){return element instanceof angular.element?element[0]:element}function applyGeneratedPreparationClasses(element,event,options){var classes="";event&&(classes=pendClasses(event,EVENT_CLASS_PREFIX,!0)),options.addClass&&(classes=concatWithSpace(classes,pendClasses(options.addClass,ADD_CLASS_SUFFIX))),options.removeClass&&(classes=concatWithSpace(classes,pendClasses(options.removeClass,REMOVE_CLASS_SUFFIX))),classes.length&&(options.preparationClasses=classes,element.addClass(classes))}function clearGeneratedClasses(element,options){options.preparationClasses&&(element.removeClass(options.preparationClasses),options.preparationClasses=null),options.activeClasses&&(element.removeClass(options.activeClasses),options.activeClasses=null)}function blockTransitions(node,duration){
// we use a negative delay value since it performs blocking
// yet it doesn't kill any existing transitions running on the
// same element which makes this safe for class-based animations
var value=duration?"-"+duration+"s":"";return applyInlineStyle(node,[TRANSITION_DELAY_PROP,value]),[TRANSITION_DELAY_PROP,value]}function blockKeyframeAnimations(node,applyBlock){var value=applyBlock?"paused":"",key=ANIMATION_PROP+ANIMATION_PLAYSTATE_KEY;return applyInlineStyle(node,[key,value]),[key,value]}function applyInlineStyle(node,styleTuple){var prop=styleTuple[0],value=styleTuple[1];node.style[prop]=value}function concatWithSpace(a,b){return a?b?a+" "+b:a:b}function getCssKeyframeDurationStyle(duration){return[ANIMATION_DURATION_PROP,duration+"s"]}function getCssDelayStyle(delay,isKeyframeAnimation){var prop=isKeyframeAnimation?ANIMATION_DELAY_PROP:TRANSITION_DELAY_PROP;return[prop,delay+"s"]}function computeCssStyles($window,element,properties){var styles=Object.create(null),detectedStyles=$window.getComputedStyle(element)||{};return forEach(properties,function(formalStyleName,actualStyleName){var val=detectedStyles[formalStyleName];if(val){var c=val.charAt(0);
// only numerical-based values have a negative sign or digit as the first value
("-"===c||"+"===c||c>=0)&&(val=parseMaxTime(val)),
// by setting this to null in the event that the delay is not set or is set directly as 0
// then we can still allow for zegative values to be used later on and not mistake this
// value for being greater than any other negative value.
0===val&&(val=null),styles[actualStyleName]=val}}),styles}function parseMaxTime(str){var maxValue=0,values=str.split(/\s*,\s*/);return forEach(values,function(value){
// it's always safe to consider only second values and omit `ms` values since
// getComputedStyle will always handle the conversion for us
"s"==value.charAt(value.length-1)&&(value=value.substring(0,value.length-1)),value=parseFloat(value)||0,maxValue=maxValue?Math.max(value,maxValue):value}),maxValue}function truthyTimingValue(val){return 0===val||null!=val}function getCssTransitionDurationStyle(duration,applyOnlyDuration){var style=TRANSITION_PROP,value=duration+"s";return applyOnlyDuration?style+=DURATION_KEY:value+=" linear all",[style,value]}function createLocalCacheLookup(){var cache=Object.create(null);return{flush:function(){cache=Object.create(null)},count:function(key){var entry=cache[key];return entry?entry.total:0},get:function(key){var entry=cache[key];return entry&&entry.value},put:function(key,value){cache[key]?cache[key].total++:cache[key]={total:1,value:value}}}}
// we do not reassign an already present style value since
// if we detect the style property value again we may be
// detecting styles that were added via the `from` styles.
// We make use of `isDefined` here since an empty string
// or null value (which is what getPropertyValue will return
// for a non-existing style) will still be marked as a valid
// value for the style (a falsy value implies that the style
// is to be removed at the end of the animation). If we had a simple
// "OR" statement then it would not be enough to catch that.
function registerRestorableStyles(backup,node,properties){forEach(properties,function(prop){backup[prop]=isDefined(backup[prop])?backup[prop]:node.style.getPropertyValue(prop)})}/* jshint ignore:start */
var TRANSITION_PROP,TRANSITIONEND_EVENT,ANIMATION_PROP,ANIMATIONEND_EVENT,noop=angular.noop,copy=angular.copy,extend=angular.extend,jqLite=angular.element,forEach=angular.forEach,isArray=angular.isArray,isString=angular.isString,isObject=angular.isObject,isUndefined=angular.isUndefined,isDefined=angular.isDefined,isFunction=angular.isFunction,isElement=angular.isElement,ELEMENT_NODE=1,ADD_CLASS_SUFFIX="-add",REMOVE_CLASS_SUFFIX="-remove",EVENT_CLASS_PREFIX="ng-",ACTIVE_CLASS_SUFFIX="-active",NG_ANIMATE_CLASSNAME="ng-animate",NG_ANIMATE_CHILDREN_DATA="$$ngAnimateChildren",CSS_PREFIX="";
// If unprefixed events are not supported but webkit-prefixed are, use the latter.
// Otherwise, just use W3C names, browsers not supporting them at all will just ignore them.
// Note: Chrome implements `window.onwebkitanimationend` and doesn't implement `window.onanimationend`
// but at the same time dispatches the `animationend` event and not `webkitAnimationEnd`.
// Register both events in case `window.onanimationend` is not supported because of that,
// do the same for `transitionend` as Safari is likely to exhibit similar behavior.
// Also, the only modern browser that uses vendor prefixes for transitions/keyframes is webkit
// therefore there is no reason to test anymore for other vendor prefixes:
// http://caniuse.com/#search=transition
isUndefined(window.ontransitionend)&&isDefined(window.onwebkittransitionend)?(CSS_PREFIX="-webkit-",TRANSITION_PROP="WebkitTransition",TRANSITIONEND_EVENT="webkitTransitionEnd transitionend"):(TRANSITION_PROP="transition",TRANSITIONEND_EVENT="transitionend"),isUndefined(window.onanimationend)&&isDefined(window.onwebkitanimationend)?(CSS_PREFIX="-webkit-",ANIMATION_PROP="WebkitAnimation",ANIMATIONEND_EVENT="webkitAnimationEnd animationend"):(ANIMATION_PROP="animation",ANIMATIONEND_EVENT="animationend");var DURATION_KEY="Duration",PROPERTY_KEY="Property",DELAY_KEY="Delay",TIMING_KEY="TimingFunction",ANIMATION_ITERATION_COUNT_KEY="IterationCount",ANIMATION_PLAYSTATE_KEY="PlayState",SAFE_FAST_FORWARD_DURATION_VALUE=9999,ANIMATION_DELAY_PROP=ANIMATION_PROP+DELAY_KEY,ANIMATION_DURATION_PROP=ANIMATION_PROP+DURATION_KEY,TRANSITION_DELAY_PROP=TRANSITION_PROP+DELAY_KEY,TRANSITION_DURATION_PROP=TRANSITION_PROP+DURATION_KEY,ngMinErr=angular.$$minErr("ng"),$$rAFSchedulerFactory=["$$rAF",function($$rAF){function scheduler(tasks){
// we make a copy since RAFScheduler mutates the state
// of the passed in array variable and this would be difficult
// to track down on the outside code
queue=queue.concat(tasks),nextTick()}function nextTick(){if(queue.length){for(var items=queue.shift(),i=0;i<items.length;i++)items[i]();cancelFn||$$rAF(function(){cancelFn||nextTick()})}}var queue,cancelFn;/* waitUntilQuiet does two things:
   * 1. It will run the FINAL `fn` value only when an uncancelled RAF has passed through
   * 2. It will delay the next wave of tasks from running until the quiet `fn` has run.
   *
   * The motivation here is that animation code can request more time from the scheduler
   * before the next wave runs. This allows for certain DOM properties such as classes to
   * be resolved in time for the next animation to run.
   */
return queue=scheduler.queue=[],scheduler.waitUntilQuiet=function(fn){cancelFn&&cancelFn(),cancelFn=$$rAF(function(){cancelFn=null,fn(),nextTick()})},scheduler}],$$AnimateChildrenDirective=[function(){return function(scope,element,attrs){var val=attrs.ngAnimateChildren;angular.isString(val)&&0===val.length?//empty attribute
element.data(NG_ANIMATE_CHILDREN_DATA,!0):attrs.$observe("ngAnimateChildren",function(value){value="on"===value||"true"===value,element.data(NG_ANIMATE_CHILDREN_DATA,value)})}}],ANIMATE_TIMER_KEY="$$animateCss",ONE_SECOND=1e3,ELAPSED_TIME_MAX_DECIMAL_PLACES=3,CLOSING_TIME_BUFFER=1.5,DETECT_CSS_PROPERTIES={transitionDuration:TRANSITION_DURATION_PROP,transitionDelay:TRANSITION_DELAY_PROP,transitionProperty:TRANSITION_PROP+PROPERTY_KEY,animationDuration:ANIMATION_DURATION_PROP,animationDelay:ANIMATION_DELAY_PROP,animationIterationCount:ANIMATION_PROP+ANIMATION_ITERATION_COUNT_KEY},DETECT_STAGGER_CSS_PROPERTIES={transitionDuration:TRANSITION_DURATION_PROP,transitionDelay:TRANSITION_DELAY_PROP,animationDuration:ANIMATION_DURATION_PROP,animationDelay:ANIMATION_DELAY_PROP},$AnimateCssProvider=["$animateProvider",function($animateProvider){var gcsLookup=createLocalCacheLookup(),gcsStaggerLookup=createLocalCacheLookup();this.$get=["$window","$$jqLite","$$AnimateRunner","$timeout","$$forceReflow","$sniffer","$$rAFScheduler","$$animateQueue",function($window,$$jqLite,$$AnimateRunner,$timeout,$$forceReflow,$sniffer,$$rAFScheduler,$$animateQueue){function gcsHashFn(node,extraClasses){var KEY="$$ngAnimateParentKey",parentNode=node.parentNode,parentID=parentNode[KEY]||(parentNode[KEY]=++parentCounter);return parentID+"-"+node.getAttribute("class")+"-"+extraClasses}function computeCachedCssStyles(node,className,cacheKey,properties){var timings=gcsLookup.get(cacheKey);
// we keep putting this in multiple times even though the value and the cacheKey are the same
// because we're keeping an interal tally of how many duplicate animations are detected.
return timings||(timings=computeCssStyles($window,node,properties),"infinite"===timings.animationIterationCount&&(timings.animationIterationCount=1)),gcsLookup.put(cacheKey,timings),timings}function computeCachedCssStaggerStyles(node,className,cacheKey,properties){var stagger;
// if we have one or more existing matches of matching elements
// containing the same parent + CSS styles (which is how cacheKey works)
// then staggering is possible
if(gcsLookup.count(cacheKey)>0&&(stagger=gcsStaggerLookup.get(cacheKey),!stagger)){var staggerClassName=pendClasses(className,"-stagger");$$jqLite.addClass(node,staggerClassName),stagger=computeCssStyles($window,node,properties),
// force the conversion of a null value to zero incase not set
stagger.animationDuration=Math.max(stagger.animationDuration,0),stagger.transitionDuration=Math.max(stagger.transitionDuration,0),$$jqLite.removeClass(node,staggerClassName),gcsStaggerLookup.put(cacheKey,stagger)}return stagger||{}}function waitUntilQuiet(callback){rafWaitQueue.push(callback),$$rAFScheduler.waitUntilQuiet(function(){gcsLookup.flush(),gcsStaggerLookup.flush();
// we use a for loop to ensure that if the queue is changed
// during this looping then it will consider new requests
for(var pageWidth=$$forceReflow(),i=0;i<rafWaitQueue.length;i++)rafWaitQueue[i](pageWidth);rafWaitQueue.length=0})}function computeTimings(node,className,cacheKey){var timings=computeCachedCssStyles(node,className,cacheKey,DETECT_CSS_PROPERTIES),aD=timings.animationDelay,tD=timings.transitionDelay;return timings.maxDelay=aD&&tD?Math.max(aD,tD):aD||tD,timings.maxDuration=Math.max(timings.animationDuration*timings.animationIterationCount,timings.transitionDuration),timings}var applyAnimationClasses=applyAnimationClassesFactory($$jqLite),parentCounter=0,rafWaitQueue=[];return function(element,initialOptions){function endFn(){close()}function cancelFn(){close(!0)}function close(rejected){// jshint ignore:line
// if the promise has been called already then we shouldn't close
// the animation again
animationClosed||animationCompleted&&animationPaused||(animationClosed=!0,animationPaused=!1,options.$$skipPreparationClasses||$$jqLite.removeClass(element,preparationClasses),$$jqLite.removeClass(element,activeClasses),blockKeyframeAnimations(node,!1),blockTransitions(node,!1),forEach(temporaryStyles,function(entry){
// There is only one way to remove inline style properties entirely from elements.
// By using `removeProperty` this works, but we need to convert camel-cased CSS
// styles down to hyphenated values.
node.style[entry[0]]=""}),applyAnimationClasses(element,options),applyAnimationStyles(element,options),Object.keys(restoreStyles).length&&forEach(restoreStyles,function(value,prop){value?node.style.setProperty(prop,value):node.style.removeProperty(prop)}),
// the reason why we have this option is to allow a synchronous closing callback
// that is fired as SOON as the animation ends (when the CSS is removed) or if
// the animation never takes off at all. A good example is a leave animation since
// the element must be removed just after the animation is over or else the element
// will appear on screen for one animation frame causing an overbearing flicker.
options.onDone&&options.onDone(),events&&events.length&&
// Remove the transitionend / animationend listener(s)
element.off(events.join(" "),onAnimationProgress),
// if the preparation function fails then the promise is not setup
runner&&runner.complete(!rejected))}function applyBlocking(duration){flags.blockTransition&&blockTransitions(node,duration),flags.blockKeyframeAnimation&&blockKeyframeAnimations(node,!!duration)}function closeAndReturnNoopAnimator(){
// should flush the cache animation
return runner=new $$AnimateRunner({end:endFn,cancel:cancelFn}),waitUntilQuiet(noop),close(),{$$willAnimate:!1,start:function(){return runner},end:endFn}}function onAnimationProgress(event){event.stopPropagation();var ev=event.originalEvent||event,timeStamp=ev.$manualTimeStamp||Date.now(),elapsedTime=parseFloat(ev.elapsedTime.toFixed(ELAPSED_TIME_MAX_DECIMAL_PLACES));/* $manualTimeStamp is a mocked timeStamp value which is set
         * within browserTrigger(). This is only here so that tests can
         * mock animations properly. Real events fallback to event.timeStamp,
         * or, if they don't, then a timeStamp is automatically created for them.
         * We're checking to see if the timeStamp surpasses the expected delay,
         * but we're using elapsedTime instead of the timeStamp on the 2nd
         * pre-condition since animationPauseds sometimes close off early */
Math.max(timeStamp-startTime,0)>=maxDelayTime&&elapsedTime>=maxDuration&&(
// we set this flag to ensure that if the transition is paused then, when resumed,
// the animation will automatically close itself since transitions cannot be paused.
animationCompleted=!0,close())}function start(){function triggerAnimationStart(){
// just incase a stagger animation kicks in when the animation
// itself was cancelled entirely
if(!animationClosed){if(applyBlocking(!1),forEach(temporaryStyles,function(entry){var key=entry[0],value=entry[1];node.style[key]=value}),applyAnimationClasses(element,options),$$jqLite.addClass(element,activeClasses),flags.recalculateTimingStyles){if(fullClassName=node.className+" "+preparationClasses,cacheKey=gcsHashFn(node,fullClassName),timings=computeTimings(node,fullClassName,cacheKey),relativeDelay=timings.maxDelay,maxDelay=Math.max(relativeDelay,0),maxDuration=timings.maxDuration,0===maxDuration)return void close();flags.hasTransitions=timings.transitionDuration>0,flags.hasAnimations=timings.animationDuration>0}if(flags.applyAnimationDelay&&(relativeDelay="boolean"!=typeof options.delay&&truthyTimingValue(options.delay)?parseFloat(options.delay):relativeDelay,maxDelay=Math.max(relativeDelay,0),timings.animationDelay=relativeDelay,delayStyle=getCssDelayStyle(relativeDelay,!0),temporaryStyles.push(delayStyle),node.style[delayStyle[0]]=delayStyle[1]),maxDelayTime=maxDelay*ONE_SECOND,maxDurationTime=maxDuration*ONE_SECOND,options.easing){var easeProp,easeVal=options.easing;flags.hasTransitions&&(easeProp=TRANSITION_PROP+TIMING_KEY,temporaryStyles.push([easeProp,easeVal]),node.style[easeProp]=easeVal),flags.hasAnimations&&(easeProp=ANIMATION_PROP+TIMING_KEY,temporaryStyles.push([easeProp,easeVal]),node.style[easeProp]=easeVal)}timings.transitionDuration&&events.push(TRANSITIONEND_EVENT),timings.animationDuration&&events.push(ANIMATIONEND_EVENT),startTime=Date.now();var timerTime=maxDelayTime+CLOSING_TIME_BUFFER*maxDurationTime,endTime=startTime+timerTime,animationsData=element.data(ANIMATE_TIMER_KEY)||[],setupFallbackTimer=!0;if(animationsData.length){var currentTimerData=animationsData[0];setupFallbackTimer=endTime>currentTimerData.expectedEndTime,setupFallbackTimer?$timeout.cancel(currentTimerData.timer):animationsData.push(close)}if(setupFallbackTimer){var timer=$timeout(onAnimationExpired,timerTime,!1);animationsData[0]={timer:timer,expectedEndTime:endTime},animationsData.push(close),element.data(ANIMATE_TIMER_KEY,animationsData)}events.length&&element.on(events.join(" "),onAnimationProgress),options.to&&(options.cleanupStyles&&registerRestorableStyles(restoreStyles,node,Object.keys(options.to)),applyAnimationToStyles(element,options))}}function onAnimationExpired(){var animationsData=element.data(ANIMATE_TIMER_KEY);
// this will be false in the event that the element was
// removed from the DOM (via a leave animation or something
// similar)
if(animationsData){for(var i=1;i<animationsData.length;i++)animationsData[i]();element.removeData(ANIMATE_TIMER_KEY)}}if(!animationClosed){if(!node.parentNode)return void close();
// even though we only pause keyframe animations here the pause flag
// will still happen when transitions are used. Only the transition will
// not be paused since that is not possible. If the animation ends when
// paused then it will not complete until unpaused or cancelled.
var playPause=function(playAnimation){if(animationCompleted)animationPaused&&playAnimation&&(animationPaused=!1,close());else if(animationPaused=!playAnimation,timings.animationDuration){var value=blockKeyframeAnimations(node,animationPaused);animationPaused?temporaryStyles.push(value):removeFromArray(temporaryStyles,value)}},maxStagger=itemIndex>0&&(timings.transitionDuration&&0===stagger.transitionDuration||timings.animationDuration&&0===stagger.animationDuration)&&Math.max(stagger.animationDelay,stagger.transitionDelay);maxStagger?$timeout(triggerAnimationStart,Math.floor(maxStagger*itemIndex*ONE_SECOND),!1):triggerAnimationStart(),
// this will decorate the existing promise runner with pause/resume methods
runnerHost.resume=function(){playPause(!0)},runnerHost.pause=function(){playPause(!1)}}}
// all of the animation functions should create
// a copy of the options data, however, if a
// parent service has already created a copy then
// we should stick to using that
var options=initialOptions||{};options.$$prepared||(options=prepareAnimationOptions(copy(options)));var restoreStyles={},node=getDomNode(element);if(!node||!node.parentNode||!$$animateQueue.enabled())return closeAndReturnNoopAnimator();var animationClosed,animationPaused,animationCompleted,runner,runnerHost,maxDelay,maxDelayTime,maxDuration,maxDurationTime,startTime,temporaryStyles=[],classes=element.attr("class"),styles=packageStyles(options),events=[];if(0===options.duration||!$sniffer.animations&&!$sniffer.transitions)return closeAndReturnNoopAnimator();var method=options.event&&isArray(options.event)?options.event.join(" "):options.event,isStructural=method&&options.structural,structuralClassName="",addRemoveClassName="";isStructural?structuralClassName=pendClasses(method,EVENT_CLASS_PREFIX,!0):method&&(structuralClassName=method),options.addClass&&(addRemoveClassName+=pendClasses(options.addClass,ADD_CLASS_SUFFIX)),options.removeClass&&(addRemoveClassName.length&&(addRemoveClassName+=" "),addRemoveClassName+=pendClasses(options.removeClass,REMOVE_CLASS_SUFFIX)),
// there may be a situation where a structural animation is combined together
// with CSS classes that need to resolve before the animation is computed.
// However this means that there is no explicit CSS code to block the animation
// from happening (by setting 0s none in the class name). If this is the case
// we need to apply the classes before the first rAF so we know to continue if
// there actually is a detected transition or keyframe animation
options.applyClassesEarly&&addRemoveClassName.length&&applyAnimationClasses(element,options);var preparationClasses=[structuralClassName,addRemoveClassName].join(" ").trim(),fullClassName=classes+" "+preparationClasses,activeClasses=pendClasses(preparationClasses,ACTIVE_CLASS_SUFFIX),hasToStyles=styles.to&&Object.keys(styles.to).length>0,containsKeyframeAnimation=(options.keyframeStyle||"").length>0;
// there is no way we can trigger an animation if no styles and
// no classes are being applied which would then trigger a transition,
// unless there a is raw keyframe value that is applied to the element.
if(!containsKeyframeAnimation&&!hasToStyles&&!preparationClasses)return closeAndReturnNoopAnimator();var cacheKey,stagger;if(options.stagger>0){var staggerVal=parseFloat(options.stagger);stagger={transitionDelay:staggerVal,animationDelay:staggerVal,transitionDuration:0,animationDuration:0}}else cacheKey=gcsHashFn(node,fullClassName),stagger=computeCachedCssStaggerStyles(node,preparationClasses,cacheKey,DETECT_STAGGER_CSS_PROPERTIES);options.$$skipPreparationClasses||$$jqLite.addClass(element,preparationClasses);var applyOnlyDuration;if(options.transitionStyle){var transitionStyle=[TRANSITION_PROP,options.transitionStyle];applyInlineStyle(node,transitionStyle),temporaryStyles.push(transitionStyle)}if(options.duration>=0){applyOnlyDuration=node.style[TRANSITION_PROP].length>0;var durationStyle=getCssTransitionDurationStyle(options.duration,applyOnlyDuration);
// we set the duration so that it will be picked up by getComputedStyle later
applyInlineStyle(node,durationStyle),temporaryStyles.push(durationStyle)}if(options.keyframeStyle){var keyframeStyle=[ANIMATION_PROP,options.keyframeStyle];applyInlineStyle(node,keyframeStyle),temporaryStyles.push(keyframeStyle)}var itemIndex=stagger?options.staggerIndex>=0?options.staggerIndex:gcsLookup.count(cacheKey):0,isFirst=0===itemIndex;
// this is a pre-emptive way of forcing the setup classes to be added and applied INSTANTLY
// without causing any combination of transitions to kick in. By adding a negative delay value
// it forces the setup class' transition to end immediately. We later then remove the negative
// transition delay to allow for the transition to naturally do it's thing. The beauty here is
// that if there is no transition defined then nothing will happen and this will also allow
// other transitions to be stacked on top of each other without any chopping them out.
isFirst&&!options.skipBlocking&&blockTransitions(node,SAFE_FAST_FORWARD_DURATION_VALUE);var timings=computeTimings(node,fullClassName,cacheKey),relativeDelay=timings.maxDelay;maxDelay=Math.max(relativeDelay,0),maxDuration=timings.maxDuration;var flags={};if(flags.hasTransitions=timings.transitionDuration>0,flags.hasAnimations=timings.animationDuration>0,flags.hasTransitionAll=flags.hasTransitions&&"all"==timings.transitionProperty,flags.applyTransitionDuration=hasToStyles&&(flags.hasTransitions&&!flags.hasTransitionAll||flags.hasAnimations&&!flags.hasTransitions),flags.applyAnimationDuration=options.duration&&flags.hasAnimations,flags.applyTransitionDelay=truthyTimingValue(options.delay)&&(flags.applyTransitionDuration||flags.hasTransitions),flags.applyAnimationDelay=truthyTimingValue(options.delay)&&flags.hasAnimations,flags.recalculateTimingStyles=addRemoveClassName.length>0,(flags.applyTransitionDuration||flags.applyAnimationDuration)&&(maxDuration=options.duration?parseFloat(options.duration):maxDuration,flags.applyTransitionDuration&&(flags.hasTransitions=!0,timings.transitionDuration=maxDuration,applyOnlyDuration=node.style[TRANSITION_PROP+PROPERTY_KEY].length>0,temporaryStyles.push(getCssTransitionDurationStyle(maxDuration,applyOnlyDuration))),flags.applyAnimationDuration&&(flags.hasAnimations=!0,timings.animationDuration=maxDuration,temporaryStyles.push(getCssKeyframeDurationStyle(maxDuration)))),0===maxDuration&&!flags.recalculateTimingStyles)return closeAndReturnNoopAnimator();if(null!=options.delay){var delayStyle;"boolean"!=typeof options.delay&&(delayStyle=parseFloat(options.delay),
// number in options.delay means we have to recalculate the delay for the closing timeout
maxDelay=Math.max(delayStyle,0)),flags.applyTransitionDelay&&temporaryStyles.push(getCssDelayStyle(delayStyle)),flags.applyAnimationDelay&&temporaryStyles.push(getCssDelayStyle(delayStyle,!0))}
// TODO(matsko): for 1.5 change this code to have an animator object for better debugging
// we need to recalculate the delay value since we used a pre-emptive negative
// delay value and the delay value is required for the final event checking. This
// property will ensure that this will happen after the RAF phase has passed.
return null==options.duration&&timings.transitionDuration>0&&(flags.recalculateTimingStyles=flags.recalculateTimingStyles||isFirst),maxDelayTime=maxDelay*ONE_SECOND,maxDurationTime=maxDuration*ONE_SECOND,options.skipBlocking||(flags.blockTransition=timings.transitionDuration>0,flags.blockKeyframeAnimation=timings.animationDuration>0&&stagger.animationDelay>0&&0===stagger.animationDuration),options.from&&(options.cleanupStyles&&registerRestorableStyles(restoreStyles,node,Object.keys(options.from)),applyAnimationFromStyles(element,options)),flags.blockTransition||flags.blockKeyframeAnimation?applyBlocking(maxDuration):options.skipBlocking||blockTransitions(node,!1),{$$willAnimate:!0,end:endFn,start:function(){if(!animationClosed)
// we don't have access to pause/resume the animation
// since it hasn't run yet. AnimateRunner will therefore
// set noop functions for resume and pause and they will
// later be overridden once the animation is triggered
return runnerHost={end:endFn,cancel:cancelFn,resume:null,//this will be set during the start() phase
pause:null},runner=new $$AnimateRunner(runnerHost),waitUntilQuiet(start),runner}}}}]}],$$AnimateCssDriverProvider=["$$animationProvider",function($$animationProvider){function isDocumentFragment(node){return node.parentNode&&11===node.parentNode.nodeType}$$animationProvider.drivers.push("$$animateCssDriver");var NG_ANIMATE_SHIM_CLASS_NAME="ng-animate-shim",NG_ANIMATE_ANCHOR_CLASS_NAME="ng-anchor",NG_OUT_ANCHOR_CLASS_NAME="ng-anchor-out",NG_IN_ANCHOR_CLASS_NAME="ng-anchor-in";this.$get=["$animateCss","$rootScope","$$AnimateRunner","$rootElement","$sniffer","$$jqLite","$document",function($animateCss,$rootScope,$$AnimateRunner,$rootElement,$sniffer,$$jqLite,$document){function filterCssClasses(classes){
//remove all the `ng-` stuff
return classes.replace(/\bng-\S+\b/g,"")}function getUniqueValues(a,b){return isString(a)&&(a=a.split(" ")),isString(b)&&(b=b.split(" ")),a.filter(function(val){return b.indexOf(val)===-1}).join(" ")}function prepareAnchoredAnimation(classes,outAnchor,inAnchor){function calculateAnchorStyles(anchor){var styles={},coords=getDomNode(anchor).getBoundingClientRect();
// we iterate directly since safari messes up and doesn't return
// all the keys for the coods object when iterated
return forEach(["width","height","top","left"],function(key){var value=coords[key];switch(key){case"top":value+=bodyNode.scrollTop;break;case"left":value+=bodyNode.scrollLeft}styles[key]=Math.floor(value)+"px"}),styles}function prepareOutAnimation(){var animator=$animateCss(clone,{addClass:NG_OUT_ANCHOR_CLASS_NAME,delay:!0,from:calculateAnchorStyles(outAnchor)});
// read the comment within `prepareRegularAnimation` to understand
// why this check is necessary
return animator.$$willAnimate?animator:null}function getClassVal(element){return element.attr("class")||""}function prepareInAnimation(){var endingClasses=filterCssClasses(getClassVal(inAnchor)),toAdd=getUniqueValues(endingClasses,startingClasses),toRemove=getUniqueValues(startingClasses,endingClasses),animator=$animateCss(clone,{to:calculateAnchorStyles(inAnchor),addClass:NG_IN_ANCHOR_CLASS_NAME+" "+toAdd,removeClass:NG_OUT_ANCHOR_CLASS_NAME+" "+toRemove,delay:!0});
// read the comment within `prepareRegularAnimation` to understand
// why this check is necessary
return animator.$$willAnimate?animator:null}function end(){clone.remove(),outAnchor.removeClass(NG_ANIMATE_SHIM_CLASS_NAME),inAnchor.removeClass(NG_ANIMATE_SHIM_CLASS_NAME)}var clone=jqLite(getDomNode(outAnchor).cloneNode(!0)),startingClasses=filterCssClasses(getClassVal(clone));outAnchor.addClass(NG_ANIMATE_SHIM_CLASS_NAME),inAnchor.addClass(NG_ANIMATE_SHIM_CLASS_NAME),clone.addClass(NG_ANIMATE_ANCHOR_CLASS_NAME),rootBodyElement.append(clone);var animatorIn,animatorOut=prepareOutAnimation();
// the user may not end up using the `out` animation and
// only making use of the `in` animation or vice-versa.
// In either case we should allow this and not assume the
// animation is over unless both animations are not used.
if(!animatorOut&&(animatorIn=prepareInAnimation(),!animatorIn))return end();var startingAnimator=animatorOut||animatorIn;return{start:function(){function endFn(){currentAnimation&&currentAnimation.end()}var runner,currentAnimation=startingAnimator.start();return currentAnimation.done(function(){
// in the event that there is no `in` animation
return currentAnimation=null,!animatorIn&&(animatorIn=prepareInAnimation())?(currentAnimation=animatorIn.start(),currentAnimation.done(function(){currentAnimation=null,end(),runner.complete()}),currentAnimation):(end(),void runner.complete())}),runner=new $$AnimateRunner({end:endFn,cancel:endFn})}}}function prepareFromToAnchorAnimation(from,to,classes,anchors){var fromAnimation=prepareRegularAnimation(from,noop),toAnimation=prepareRegularAnimation(to,noop),anchorAnimations=[];
// no point in doing anything when there are no elements to animate
if(forEach(anchors,function(anchor){var outElement=anchor.out,inElement=anchor["in"],animator=prepareAnchoredAnimation(classes,outElement,inElement);animator&&anchorAnimations.push(animator)}),fromAnimation||toAnimation||0!==anchorAnimations.length)return{start:function(){function endFn(){forEach(animationRunners,function(runner){runner.end()})}var animationRunners=[];fromAnimation&&animationRunners.push(fromAnimation.start()),toAnimation&&animationRunners.push(toAnimation.start()),forEach(anchorAnimations,function(animation){animationRunners.push(animation.start())});var runner=new $$AnimateRunner({end:endFn,cancel:endFn});return $$AnimateRunner.all(animationRunners,function(status){runner.complete(status)}),runner}}}function prepareRegularAnimation(animationDetails){var element=animationDetails.element,options=animationDetails.options||{};animationDetails.structural&&(options.event=animationDetails.event,options.structural=!0,options.applyClassesEarly=!0,
// we special case the leave animation since we want to ensure that
// the element is removed as soon as the animation is over. Otherwise
// a flicker might appear or the element may not be removed at all
"leave"===animationDetails.event&&(options.onDone=options.domOperation)),
// We assign the preparationClasses as the actual animation event since
// the internals of $animateCss will just suffix the event token values
// with `-active` to trigger the animation.
options.preparationClasses&&(options.event=concatWithSpace(options.event,options.preparationClasses));var animator=$animateCss(element,options);
// the driver lookup code inside of $$animation attempts to spawn a
// driver one by one until a driver returns a.$$willAnimate animator object.
// $animateCss will always return an object, however, it will pass in
// a flag as a hint as to whether an animation was detected or not
return animator.$$willAnimate?animator:null}
// only browsers that support these properties can render animations
if(!$sniffer.animations&&!$sniffer.transitions)return noop;var bodyNode=$document[0].body,rootNode=getDomNode($rootElement),rootBodyElement=jqLite(
// this is to avoid using something that exists outside of the body
// we also special case the doc fragement case because our unit test code
// appends the $rootElement to the body after the app has been bootstrapped
isDocumentFragment(rootNode)||bodyNode.contains(rootNode)?rootNode:bodyNode);applyAnimationClassesFactory($$jqLite);return function(animationDetails){return animationDetails.from&&animationDetails.to?prepareFromToAnchorAnimation(animationDetails.from,animationDetails.to,animationDetails.classes,animationDetails.anchors):prepareRegularAnimation(animationDetails)}}]}],$$AnimateJsProvider=["$animateProvider",function($animateProvider){this.$get=["$injector","$$AnimateRunner","$$jqLite",function($injector,$$AnimateRunner,$$jqLite){function lookupAnimations(classes){classes=isArray(classes)?classes:classes.split(" ");for(var matches=[],flagMap={},i=0;i<classes.length;i++){var klass=classes[i],animationFactory=$animateProvider.$$registeredAnimations[klass];animationFactory&&!flagMap[klass]&&(matches.push($injector.get(animationFactory)),flagMap[klass]=!0)}return matches}var applyAnimationClasses=applyAnimationClassesFactory($$jqLite);
// $animateJs(element, 'enter');
return function(element,event,classes,options){function applyOptions(){options.domOperation(),applyAnimationClasses(element,options)}function close(){animationClosed=!0,applyOptions(),applyAnimationStyles(element,options)}function executeAnimationFn(fn,element,event,options,onDone){var args;switch(event){case"animate":args=[element,options.from,options.to,onDone];break;case"setClass":args=[element,classesToAdd,classesToRemove,onDone];break;case"addClass":args=[element,classesToAdd,onDone];break;case"removeClass":args=[element,classesToRemove,onDone];break;default:args=[element,onDone]}args.push(options);var value=fn.apply(fn,args);if(value)if(isFunction(value.start)&&(value=value.start()),value instanceof $$AnimateRunner)value.done(onDone);else if(isFunction(value))
// optional onEnd / onCancel callback
return value;return noop}function groupEventedAnimations(element,event,options,animations,fnName){var operations=[];return forEach(animations,function(ani){var animation=ani[fnName];animation&&
// note that all of these animations will run in parallel
operations.push(function(){var runner,endProgressCb,resolved=!1,onAnimationComplete=function(rejected){resolved||(resolved=!0,(endProgressCb||noop)(rejected),runner.complete(!rejected))};return runner=new $$AnimateRunner({end:function(){onAnimationComplete()},cancel:function(){onAnimationComplete(!0)}}),endProgressCb=executeAnimationFn(animation,element,event,options,function(result){var cancelled=result===!1;onAnimationComplete(cancelled)}),runner})}),operations}function packageAnimations(element,event,options,animations,fnName){var operations=groupEventedAnimations(element,event,options,animations,fnName);if(0===operations.length){var a,b;"beforeSetClass"===fnName?(a=groupEventedAnimations(element,"removeClass",options,animations,"beforeRemoveClass"),b=groupEventedAnimations(element,"addClass",options,animations,"beforeAddClass")):"setClass"===fnName&&(a=groupEventedAnimations(element,"removeClass",options,animations,"removeClass"),b=groupEventedAnimations(element,"addClass",options,animations,"addClass")),a&&(operations=operations.concat(a)),b&&(operations=operations.concat(b))}if(0!==operations.length)
// TODO(matsko): add documentation
return function(callback){var runners=[];return operations.length&&forEach(operations,function(animateFn){runners.push(animateFn())}),runners.length?$$AnimateRunner.all(runners,callback):callback(),function(reject){forEach(runners,function(runner){reject?runner.cancel():runner.end()})}}}var animationClosed=!1;
// the `classes` argument is optional and if it is not used
// then the classes will be resolved from the element's className
// property as well as options.addClass/options.removeClass.
3===arguments.length&&isObject(classes)&&(options=classes,classes=null),options=prepareAnimationOptions(options),classes||(classes=element.attr("class")||"",options.addClass&&(classes+=" "+options.addClass),options.removeClass&&(classes+=" "+options.removeClass));var before,after,classesToAdd=options.addClass,classesToRemove=options.removeClass,animations=lookupAnimations(classes);if(animations.length){var afterFn,beforeFn;"leave"==event?(beforeFn="leave",afterFn="afterLeave"):(beforeFn="before"+event.charAt(0).toUpperCase()+event.substr(1),afterFn=event),"enter"!==event&&"move"!==event&&(before=packageAnimations(element,event,options,animations,beforeFn)),after=packageAnimations(element,event,options,animations,afterFn)}
// no matching animations
if(before||after){var runner;return{$$willAnimate:!0,end:function(){return runner?runner.end():(close(),runner=new $$AnimateRunner,runner.complete(!0)),runner},start:function(){function onComplete(success){close(success),runner.complete(success)}function endAnimations(cancelled){animationClosed||((closeActiveAnimations||noop)(cancelled),onComplete(cancelled))}if(runner)return runner;runner=new $$AnimateRunner;var closeActiveAnimations,chain=[];return before&&chain.push(function(fn){closeActiveAnimations=before(fn)}),chain.length?chain.push(function(fn){applyOptions(),fn(!0)}):applyOptions(),after&&chain.push(function(fn){closeActiveAnimations=after(fn)}),runner.setHost({end:function(){endAnimations()},cancel:function(){endAnimations(!0)}}),$$AnimateRunner.chain(chain,onComplete),runner}}}}}]}],$$AnimateJsDriverProvider=["$$animationProvider",function($$animationProvider){$$animationProvider.drivers.push("$$animateJsDriver"),this.$get=["$$animateJs","$$AnimateRunner",function($$animateJs,$$AnimateRunner){function prepareAnimation(animationDetails){
// TODO(matsko): make sure to check for grouped animations and delegate down to normal animations
var element=animationDetails.element,event=animationDetails.event,options=animationDetails.options,classes=animationDetails.classes;return $$animateJs(element,event,classes,options)}return function(animationDetails){if(animationDetails.from&&animationDetails.to){var fromAnimation=prepareAnimation(animationDetails.from),toAnimation=prepareAnimation(animationDetails.to);if(!fromAnimation&&!toAnimation)return;return{start:function(){function endFnFactory(){return function(){forEach(animationRunners,function(runner){
// at this point we cannot cancel animations for groups just yet. 1.5+
runner.end()})}}function done(status){runner.complete(status)}var animationRunners=[];fromAnimation&&animationRunners.push(fromAnimation.start()),toAnimation&&animationRunners.push(toAnimation.start()),$$AnimateRunner.all(animationRunners,done);var runner=new $$AnimateRunner({end:endFnFactory(),cancel:endFnFactory()});return runner}}}return prepareAnimation(animationDetails)}}]}],NG_ANIMATE_ATTR_NAME="data-ng-animate",NG_ANIMATE_PIN_DATA="$ngAnimatePin",$$AnimateQueueProvider=["$animateProvider",function($animateProvider){function makeTruthyCssClassMap(classString){if(!classString)return null;var keys=classString.split(ONE_SPACE),map=Object.create(null);return forEach(keys,function(key){map[key]=!0}),map}function hasMatchingClasses(newClassString,currentClassString){if(newClassString&&currentClassString){var currentClassMap=makeTruthyCssClassMap(currentClassString);return newClassString.split(ONE_SPACE).some(function(className){return currentClassMap[className]})}}function isAllowed(ruleType,element,currentAnimation,previousAnimation){return rules[ruleType].some(function(fn){return fn(element,currentAnimation,previousAnimation)})}function hasAnimationClasses(options,and){options=options||{};var a=(options.addClass||"").length>0,b=(options.removeClass||"").length>0;return and?a&&b:a||b}var PRE_DIGEST_STATE=1,RUNNING_STATE=2,ONE_SPACE=" ",rules=this.rules={skip:[],cancel:[],join:[]};rules.join.push(function(element,newAnimation,currentAnimation){
// if the new animation is class-based then we can just tack that on
return!newAnimation.structural&&hasAnimationClasses(newAnimation.options)}),rules.skip.push(function(element,newAnimation,currentAnimation){
// there is no need to animate anything if no classes are being added and
// there is no structural animation that will be triggered
return!newAnimation.structural&&!hasAnimationClasses(newAnimation.options)}),rules.skip.push(function(element,newAnimation,currentAnimation){
// why should we trigger a new structural animation if the element will
// be removed from the DOM anyway?
return"leave"==currentAnimation.event&&newAnimation.structural}),rules.skip.push(function(element,newAnimation,currentAnimation){
// if there is an ongoing current animation then don't even bother running the class-based animation
return currentAnimation.structural&&currentAnimation.state===RUNNING_STATE&&!newAnimation.structural}),rules.cancel.push(function(element,newAnimation,currentAnimation){
// there can never be two structural animations running at the same time
return currentAnimation.structural&&newAnimation.structural}),rules.cancel.push(function(element,newAnimation,currentAnimation){
// if the previous animation is already running, but the new animation will
// be triggered, but the new animation is structural
return currentAnimation.state===RUNNING_STATE&&newAnimation.structural}),rules.cancel.push(function(element,newAnimation,currentAnimation){var nA=newAnimation.options.addClass,nR=newAnimation.options.removeClass,cA=currentAnimation.options.addClass,cR=currentAnimation.options.removeClass;
// early detection to save the global CPU shortage :)
// early detection to save the global CPU shortage :)
return!(isUndefined(nA)&&isUndefined(nR)||isUndefined(cA)&&isUndefined(cR))&&(hasMatchingClasses(nA,cR)||hasMatchingClasses(nR,cA))}),this.$get=["$$rAF","$rootScope","$rootElement","$document","$$HashMap","$$animation","$$AnimateRunner","$templateRequest","$$jqLite","$$forceReflow",function($$rAF,$rootScope,$rootElement,$document,$$HashMap,$$animation,$$AnimateRunner,$templateRequest,$$jqLite,$$forceReflow){function postDigestTaskFactory(){var postDigestCalled=!1;return function(fn){
// we only issue a call to postDigest before
// it has first passed. This prevents any callbacks
// from not firing once the animation has completed
// since it will be out of the digest cycle.
postDigestCalled?fn():$rootScope.$$postDigest(function(){postDigestCalled=!0,fn()})}}function normalizeAnimationOptions(element,options){return mergeAnimationOptions(element,options,{})}function findCallbacks(parent,element,event){var targetNode=getDomNode(element),targetParentNode=getDomNode(parent),matches=[],entries=callbackRegistry[event];return entries&&forEach(entries,function(entry){contains.call(entry.node,targetNode)?matches.push(entry.callback):"leave"===event&&contains.call(entry.node,targetParentNode)&&matches.push(entry.callback)}),matches}function queueAnimation(element,event,initialOptions){function notifyProgress(runner,event,phase,data){runInNextPostDigestOrNow(function(){var callbacks=findCallbacks(parent,element,event);callbacks.length&&
// do not optimize this call here to RAF because
// we don't know how heavy the callback code here will
// be and if this code is buffered then this can
// lead to a performance regression.
$$rAF(function(){forEach(callbacks,function(callback){callback(element,phase,data)})})}),runner.progress(event,phase,data)}function close(reject){// jshint ignore:line
clearGeneratedClasses(element,options),applyAnimationClasses(element,options),applyAnimationStyles(element,options),options.domOperation(),runner.complete(!reject)}
// we always make a copy of the options since
// there should never be any side effects on
// the input data when running `$animateCss`.
var node,parent,options=copy(initialOptions);element=stripCommentsFromElement(element),element&&(node=getDomNode(element),parent=element.parent()),options=prepareAnimationOptions(options);
// we create a fake runner with a working promise.
// These methods will become available after the digest has passed
var runner=new $$AnimateRunner,runInNextPostDigestOrNow=postDigestTaskFactory();
// there are situations where a directive issues an animation for
// a jqLite wrapper that contains only comment nodes... If this
// happens then there is no way we can perform an animation
if(isArray(options.addClass)&&(options.addClass=options.addClass.join(" ")),options.addClass&&!isString(options.addClass)&&(options.addClass=null),isArray(options.removeClass)&&(options.removeClass=options.removeClass.join(" ")),options.removeClass&&!isString(options.removeClass)&&(options.removeClass=null),options.from&&!isObject(options.from)&&(options.from=null),options.to&&!isObject(options.to)&&(options.to=null),!node)return close(),runner;var className=[node.className,options.addClass,options.removeClass].join(" ");if(!isAnimatableClassName(className))return close(),runner;var isStructural=["enter","move","leave"].indexOf(event)>=0,skipAnimations=!animationsEnabled||$document[0].hidden||disabledElementsLookup.get(node),existingAnimation=!skipAnimations&&activeAnimationsLookup.get(node)||{},hasExistingAnimation=!!existingAnimation.state;if(
// there is no point in traversing the same collection of parent ancestors if a followup
// animation will be run on the same element that already did all that checking work
skipAnimations||hasExistingAnimation&&existingAnimation.state==PRE_DIGEST_STATE||(skipAnimations=!areAnimationsAllowed(element,parent,event)),skipAnimations)return close(),runner;isStructural&&closeChildAnimations(element);var newAnimation={structural:isStructural,element:element,event:event,close:close,options:options,runner:runner};if(hasExistingAnimation){var skipAnimationFlag=isAllowed("skip",element,newAnimation,existingAnimation);if(skipAnimationFlag)return existingAnimation.state===RUNNING_STATE?(close(),runner):(mergeAnimationOptions(element,existingAnimation.options,options),existingAnimation.runner);var cancelAnimationFlag=isAllowed("cancel",element,newAnimation,existingAnimation);if(cancelAnimationFlag)if(existingAnimation.state===RUNNING_STATE)
// this will end the animation right away and it is safe
// to do so since the animation is already running and the
// runner callback code will run in async
existingAnimation.runner.end();else{if(!existingAnimation.structural)
// this will merge the new animation options into existing animation options
return mergeAnimationOptions(element,existingAnimation.options,newAnimation.options),existingAnimation.runner;
// this means that the animation is queued into a digest, but
// hasn't started yet. Therefore it is safe to run the close
// method which will call the runner methods in async.
existingAnimation.close()}else{
// a joined animation means that this animation will take over the existing one
// so an example would involve a leave animation taking over an enter. Then when
// the postDigest kicks in the enter will be ignored.
var joinAnimationFlag=isAllowed("join",element,newAnimation,existingAnimation);if(joinAnimationFlag){if(existingAnimation.state!==RUNNING_STATE)
//we return the same runner since only the option values of this animation will
//be fed into the `existingAnimation`.
return applyGeneratedPreparationClasses(element,isStructural?event:null,options),event=newAnimation.event=existingAnimation.event,options=mergeAnimationOptions(element,existingAnimation.options,newAnimation.options),existingAnimation.runner;normalizeAnimationOptions(element,options)}}}else
// normalization in this case means that it removes redundant CSS classes that
// already exist (addClass) or do not exist (removeClass) on the element
normalizeAnimationOptions(element,options);
// when the options are merged and cleaned up we may end up not having to do
// an animation at all, therefore we should check this before issuing a post
// digest callback. Structural animations will always run no matter what.
var isValidAnimation=newAnimation.structural;if(isValidAnimation||(
// animate (from/to) can be quickly checked first, otherwise we check if any classes are present
isValidAnimation="animate"===newAnimation.event&&Object.keys(newAnimation.options.to||{}).length>0||hasAnimationClasses(newAnimation.options)),!isValidAnimation)return close(),clearElementAnimationState(element),runner;
// the counter keeps track of cancelled animations
var counter=(existingAnimation.counter||0)+1;return newAnimation.counter=counter,markElementAnimationState(element,PRE_DIGEST_STATE,newAnimation),$rootScope.$$postDigest(function(){var animationDetails=activeAnimationsLookup.get(node),animationCancelled=!animationDetails;animationDetails=animationDetails||{};
// if addClass/removeClass is called before something like enter then the
// registered parent element may not be present. The code below will ensure
// that a final value for parent element is obtained
var parentElement=element.parent()||[],isValidAnimation=parentElement.length>0&&("animate"===animationDetails.event||animationDetails.structural||hasAnimationClasses(animationDetails.options));
// this means that the previous animation was cancelled
// even if the follow-up animation is the same event
if(animationCancelled||animationDetails.counter!==counter||!isValidAnimation)
// if another animation did not take over then we need
// to make sure that the domOperation and options are
// handled accordingly
// if the event changed from something like enter to leave then we do
// it, otherwise if it's the same then the end result will be the same too
// in the event that the element animation was not cancelled or a follow-up animation
// isn't allowed to animate from here then we need to clear the state of the element
// so that any future animations won't read the expired animation data.
return animationCancelled&&(applyAnimationClasses(element,options),applyAnimationStyles(element,options)),(animationCancelled||isStructural&&animationDetails.event!==event)&&(options.domOperation(),runner.end()),void(isValidAnimation||clearElementAnimationState(element));
// this combined multiple class to addClass / removeClass into a setClass event
// so long as a structural event did not take over the animation
event=!animationDetails.structural&&hasAnimationClasses(animationDetails.options,!0)?"setClass":animationDetails.event,markElementAnimationState(element,RUNNING_STATE);var realRunner=$$animation(element,event,animationDetails.options);realRunner.done(function(status){close(!status);var animationDetails=activeAnimationsLookup.get(node);animationDetails&&animationDetails.counter===counter&&clearElementAnimationState(getDomNode(element)),notifyProgress(runner,event,"close",{})}),
// this will update the runner's flow-control events based on
// the `realRunner` object.
runner.setHost(realRunner),notifyProgress(runner,event,"start",{})}),runner}function closeChildAnimations(element){var node=getDomNode(element),children=node.querySelectorAll("["+NG_ANIMATE_ATTR_NAME+"]");forEach(children,function(child){var state=parseInt(child.getAttribute(NG_ANIMATE_ATTR_NAME)),animationDetails=activeAnimationsLookup.get(child);if(animationDetails)switch(state){case RUNNING_STATE:animationDetails.runner.end();/* falls through */
case PRE_DIGEST_STATE:activeAnimationsLookup.remove(child)}})}function clearElementAnimationState(element){var node=getDomNode(element);node.removeAttribute(NG_ANIMATE_ATTR_NAME),activeAnimationsLookup.remove(node)}function isMatchingElement(nodeOrElmA,nodeOrElmB){return getDomNode(nodeOrElmA)===getDomNode(nodeOrElmB)}/**
     * This fn returns false if any of the following is true:
     * a) animations on any parent element are disabled, and animations on the element aren't explicitly allowed
     * b) a parent element has an ongoing structural animation, and animateChildren is false
     * c) the element is not a child of the body
     * d) the element is not a child of the $rootElement
     */
function areAnimationsAllowed(element,parentElement,event){var animateChildren,bodyElement=jqLite($document[0].body),bodyElementDetected=isMatchingElement(element,bodyElement)||"HTML"===element[0].nodeName,rootElementDetected=isMatchingElement(element,$rootElement),parentAnimationDetected=!1,elementDisabled=disabledElementsLookup.get(getDomNode(element)),parentHost=element.data(NG_ANIMATE_PIN_DATA);for(parentHost&&(parentElement=parentHost);parentElement&&parentElement.length;){rootElementDetected||(
// angular doesn't want to attempt to animate elements outside of the application
// therefore we need to ensure that the rootElement is an ancestor of the current element
rootElementDetected=isMatchingElement(parentElement,$rootElement));var parentNode=parentElement[0];if(parentNode.nodeType!==ELEMENT_NODE)
// no point in inspecting the #document element
break;var details=activeAnimationsLookup.get(parentNode)||{};
// either an enter, leave or move animation will commence
// therefore we can't allow any animations to take place
// but if a parent animation is class-based then that's ok
if(!parentAnimationDetected){var parentElementDisabled=disabledElementsLookup.get(parentNode);if(parentElementDisabled===!0&&elementDisabled!==!1){
// disable animations if the user hasn't explicitly enabled animations on the
// current element
elementDisabled=!0;
// element is disabled via parent element, no need to check anything else
break}parentElementDisabled===!1&&(elementDisabled=!1),parentAnimationDetected=details.structural}if(isUndefined(animateChildren)||animateChildren===!0){var value=parentElement.data(NG_ANIMATE_CHILDREN_DATA);isDefined(value)&&(animateChildren=value)}
// there is no need to continue traversing at this point
if(parentAnimationDetected&&animateChildren===!1)break;if(bodyElementDetected||(
// we also need to ensure that the element is or will be a part of the body element
// otherwise it is pointless to even issue an animation to be rendered
bodyElementDetected=isMatchingElement(parentElement,bodyElement)),bodyElementDetected&&rootElementDetected)
// If both body and root have been found, any other checks are pointless,
// as no animation data should live outside the application
break;parentElement=rootElementDetected||
// If no rootElement is detected, check if the parentElement is pinned to another element
!(parentHost=parentElement.data(NG_ANIMATE_PIN_DATA))?parentElement.parent():parentHost}var allowAnimation=(!parentAnimationDetected||animateChildren)&&elementDisabled!==!0;return allowAnimation&&rootElementDetected&&bodyElementDetected}function markElementAnimationState(element,state,details){details=details||{},details.state=state;var node=getDomNode(element);node.setAttribute(NG_ANIMATE_ATTR_NAME,state);var oldValue=activeAnimationsLookup.get(node),newValue=oldValue?extend(oldValue,details):details;activeAnimationsLookup.put(node,newValue)}var activeAnimationsLookup=new $$HashMap,disabledElementsLookup=new $$HashMap,animationsEnabled=null,deregisterWatch=$rootScope.$watch(function(){return 0===$templateRequest.totalPendingRequests},function(isEmpty){isEmpty&&(deregisterWatch(),
// Now that all templates have been downloaded, $animate will wait until
// the post digest queue is empty before enabling animations. By having two
// calls to $postDigest calls we can ensure that the flag is enabled at the
// very end of the post digest queue. Since all of the animations in $animate
// use $postDigest, it's important that the code below executes at the end.
// This basically means that the page is fully downloaded and compiled before
// any animations are triggered.
$rootScope.$$postDigest(function(){$rootScope.$$postDigest(function(){
// we check for null directly in the event that the application already called
// .enabled() with whatever arguments that it provided it with
null===animationsEnabled&&(animationsEnabled=!0)})}))}),callbackRegistry={},classNameFilter=$animateProvider.classNameFilter(),isAnimatableClassName=classNameFilter?function(className){return classNameFilter.test(className)}:function(){return!0},applyAnimationClasses=applyAnimationClassesFactory($$jqLite),contains=Node.prototype.contains||function(arg){
// jshint bitwise: false
return this===arg||!!(16&this.compareDocumentPosition(arg))};return{on:function(event,container,callback){var node=extractElementNode(container);callbackRegistry[event]=callbackRegistry[event]||[],callbackRegistry[event].push({node:node,callback:callback})},off:function(event,container,callback){function filterFromRegistry(list,matchContainer,matchCallback){var containerNode=extractElementNode(matchContainer);return list.filter(function(entry){var isMatch=entry.node===containerNode&&(!matchCallback||entry.callback===matchCallback);return!isMatch})}var entries=callbackRegistry[event];entries&&(callbackRegistry[event]=1===arguments.length?null:filterFromRegistry(entries,container,callback))},pin:function(element,parentElement){assertArg(isElement(element),"element","not an element"),assertArg(isElement(parentElement),"parentElement","not an element"),element.data(NG_ANIMATE_PIN_DATA,parentElement)},push:function(element,event,options,domOperation){return options=options||{},options.domOperation=domOperation,queueAnimation(element,event,options)},
// this method has four signatures:
//  () - global getter
//  (bool) - global setter
//  (element) - element getter
//  (element, bool) - element setter<F37>
enabled:function(element,bool){var argCount=arguments.length;if(0===argCount)
// () - Global getter
bool=!!animationsEnabled;else{var hasElement=isElement(element);if(hasElement){var node=getDomNode(element),recordExists=disabledElementsLookup.get(node);1===argCount?
// (element) - Element getter
bool=!recordExists:
// (element, bool) - Element setter
disabledElementsLookup.put(node,!bool)}else
// (bool) - Global setter
bool=animationsEnabled=!!element}return bool}}}]}],$$AnimationProvider=["$animateProvider",function($animateProvider){function setRunner(element,runner){element.data(RUNNER_STORAGE_KEY,runner)}function removeRunner(element){element.removeData(RUNNER_STORAGE_KEY)}function getRunner(element){return element.data(RUNNER_STORAGE_KEY)}var NG_ANIMATE_REF_ATTR="ng-animate-ref",drivers=this.drivers=[],RUNNER_STORAGE_KEY="$$animationRunner";this.$get=["$$jqLite","$rootScope","$injector","$$AnimateRunner","$$HashMap","$$rAFScheduler",function($$jqLite,$rootScope,$injector,$$AnimateRunner,$$HashMap,$$rAFScheduler){function sortAnimations(animations){function processNode(entry){if(entry.processed)return entry;entry.processed=!0;var elementNode=entry.domNode,parentNode=elementNode.parentNode;lookup.put(elementNode,entry);for(var parentEntry;parentNode;){if(parentEntry=lookup.get(parentNode)){parentEntry.processed||(parentEntry=processNode(parentEntry));break}parentNode=parentNode.parentNode}return(parentEntry||tree).children.push(entry),entry}function flatten(tree){var i,result=[],queue=[];for(i=0;i<tree.children.length;i++)queue.push(tree.children[i]);var remainingLevelEntries=queue.length,nextLevelEntries=0,row=[];for(i=0;i<queue.length;i++){var entry=queue[i];remainingLevelEntries<=0&&(remainingLevelEntries=nextLevelEntries,nextLevelEntries=0,result.push(row),row=[]),row.push(entry.fn),entry.children.forEach(function(childEntry){nextLevelEntries++,queue.push(childEntry)}),remainingLevelEntries--}return row.length&&result.push(row),result}var i,tree={children:[]},lookup=new $$HashMap;
// this is done first beforehand so that the hashmap
// is filled with a list of the elements that will be animated
for(i=0;i<animations.length;i++){var animation=animations[i];lookup.put(animation.domNode,animations[i]={domNode:animation.domNode,fn:animation.fn,children:[]})}for(i=0;i<animations.length;i++)processNode(animations[i]);return flatten(tree)}var animationQueue=[],applyAnimationClasses=applyAnimationClassesFactory($$jqLite);
// TODO(matsko): document the signature in a better way
return function(element,event,options){
// TODO(matsko): change to reference nodes
function getAnchorNodes(node){var SELECTOR="["+NG_ANIMATE_REF_ATTR+"]",items=node.hasAttribute(NG_ANIMATE_REF_ATTR)?[node]:node.querySelectorAll(SELECTOR),anchors=[];return forEach(items,function(node){var attr=node.getAttribute(NG_ANIMATE_REF_ATTR);attr&&attr.length&&anchors.push(node)}),anchors}function groupAnimations(animations){var preparedAnimations=[],refLookup={};forEach(animations,function(animation,index){var element=animation.element,node=getDomNode(element),event=animation.event,enterOrMove=["enter","move"].indexOf(event)>=0,anchorNodes=animation.structural?getAnchorNodes(node):[];if(anchorNodes.length){var direction=enterOrMove?"to":"from";forEach(anchorNodes,function(anchor){var key=anchor.getAttribute(NG_ANIMATE_REF_ATTR);refLookup[key]=refLookup[key]||{},refLookup[key][direction]={animationID:index,element:jqLite(anchor)}})}else preparedAnimations.push(animation)});var usedIndicesLookup={},anchorGroups={};return forEach(refLookup,function(operations,key){var from=operations.from,to=operations.to;if(!from||!to){
// only one of these is set therefore we can't have an
// anchor animation since all three pieces are required
var index=from?from.animationID:to.animationID,indexKey=index.toString();return void(usedIndicesLookup[indexKey]||(usedIndicesLookup[indexKey]=!0,preparedAnimations.push(animations[index])))}var fromAnimation=animations[from.animationID],toAnimation=animations[to.animationID],lookupKey=from.animationID.toString();if(!anchorGroups[lookupKey]){var group=anchorGroups[lookupKey]={structural:!0,beforeStart:function(){fromAnimation.beforeStart(),toAnimation.beforeStart()},close:function(){fromAnimation.close(),toAnimation.close()},classes:cssClassesIntersection(fromAnimation.classes,toAnimation.classes),from:fromAnimation,to:toAnimation,anchors:[]};
// the anchor animations require that the from and to elements both have at least
// one shared CSS class which effictively marries the two elements together to use
// the same animation driver and to properly sequence the anchor animation.
group.classes.length?preparedAnimations.push(group):(preparedAnimations.push(fromAnimation),preparedAnimations.push(toAnimation))}anchorGroups[lookupKey].anchors.push({out:from.element,"in":to.element})}),preparedAnimations}function cssClassesIntersection(a,b){a=a.split(" "),b=b.split(" ");for(var matches=[],i=0;i<a.length;i++){var aa=a[i];if("ng-"!==aa.substring(0,3))for(var j=0;j<b.length;j++)if(aa===b[j]){matches.push(aa);break}}return matches.join(" ")}function invokeFirstDriver(animationDetails){
// we loop in reverse order since the more general drivers (like CSS and JS)
// may attempt more elements, but custom drivers are more particular
for(var i=drivers.length-1;i>=0;i--){var driverName=drivers[i];if($injector.has(driverName)){// TODO(matsko): remove this check
var factory=$injector.get(driverName),driver=factory(animationDetails);if(driver)return driver}}}function beforeStart(){element.addClass(NG_ANIMATE_CLASSNAME),tempClasses&&$$jqLite.addClass(element,tempClasses)}function updateAnimationRunners(animation,newRunner){function update(element){getRunner(element).setHost(newRunner)}animation.from&&animation.to?(update(animation.from.element),update(animation.to.element)):update(animation.element)}function handleDestroyedElement(){var runner=getRunner(element);!runner||"leave"===event&&options.$$domOperationFired||runner.end()}function close(rejected){// jshint ignore:line
element.off("$destroy",handleDestroyedElement),removeRunner(element),applyAnimationClasses(element,options),applyAnimationStyles(element,options),options.domOperation(),tempClasses&&$$jqLite.removeClass(element,tempClasses),element.removeClass(NG_ANIMATE_CLASSNAME),runner.complete(!rejected)}options=prepareAnimationOptions(options);var isStructural=["enter","move","leave"].indexOf(event)>=0,runner=new $$AnimateRunner({end:function(){close()},cancel:function(){close(!0)}});if(!drivers.length)return close(),runner;setRunner(element,runner);var classes=mergeClasses(element.attr("class"),mergeClasses(options.addClass,options.removeClass)),tempClasses=options.tempClasses;
// we only want there to be one function called within the post digest
// block. This way we can group animations for all the animations that
// were apart of the same postDigest flush call.
// we only want there to be one function called within the post digest
// block. This way we can group animations for all the animations that
// were apart of the same postDigest flush call.
return tempClasses&&(classes+=" "+tempClasses,options.tempClasses=null),animationQueue.push({
// this data is used by the postDigest code and passed into
// the driver step function
element:element,classes:classes,event:event,structural:isStructural,options:options,beforeStart:beforeStart,close:close}),element.on("$destroy",handleDestroyedElement),animationQueue.length>1?runner:($rootScope.$$postDigest(function(){var animations=[];forEach(animationQueue,function(entry){
// the element was destroyed early on which removed the runner
// form its storage. This means we can't animate this element
// at all and it already has been closed due to destruction.
getRunner(entry.element)?animations.push(entry):entry.close()}),
// now any future animations will be in another postDigest
animationQueue.length=0;var groupedAnimations=groupAnimations(animations),toBeSortedAnimations=[];forEach(groupedAnimations,function(animationEntry){toBeSortedAnimations.push({domNode:getDomNode(animationEntry.from?animationEntry.from.element:animationEntry.element),fn:function(){
// it's important that we apply the `ng-animate` CSS class and the
// temporary classes before we do any driver invoking since these
// CSS classes may be required for proper CSS detection.
animationEntry.beforeStart();var startAnimationFn,closeFn=animationEntry.close,targetElement=animationEntry.anchors?animationEntry.from.element||animationEntry.to.element:animationEntry.element;if(getRunner(targetElement)){var operation=invokeFirstDriver(animationEntry);operation&&(startAnimationFn=operation.start)}if(startAnimationFn){var animationRunner=startAnimationFn();animationRunner.done(function(status){closeFn(!status)}),updateAnimationRunners(animationEntry,animationRunner)}else closeFn()}})}),
// we need to sort each of the animations in order of parent to child
// relationships. This ensures that the child classes are applied at the
// right time.
$$rAFScheduler(sortAnimations(toBeSortedAnimations))}),runner)}}]}];/* global angularAnimateModule: true,

   $$AnimateAsyncRunFactory,
   $$rAFSchedulerFactory,
   $$AnimateChildrenDirective,
   $$AnimateQueueProvider,
   $$AnimationProvider,
   $AnimateCssProvider,
   $$AnimateCssDriverProvider,
   $$AnimateJsProvider,
   $$AnimateJsDriverProvider,
*/
/**
 * @ngdoc module
 * @name ngAnimate
 * @description
 *
 * The `ngAnimate` module provides support for CSS-based animations (keyframes and transitions) as well as JavaScript-based animations via
 * callback hooks. Animations are not enabled by default, however, by including `ngAnimate` the animation hooks are enabled for an Angular app.
 *
 * <div doc-module-components="ngAnimate"></div>
 *
 * # Usage
 * Simply put, there are two ways to make use of animations when ngAnimate is used: by using **CSS** and **JavaScript**. The former works purely based
 * using CSS (by using matching CSS selectors/styles) and the latter triggers animations that are registered via `module.animation()`. For
 * both CSS and JS animations the sole requirement is to have a matching `CSS class` that exists both in the registered animation and within
 * the HTML element that the animation will be triggered on.
 *
 * ## Directive Support
 * The following directives are "animation aware":
 *
 * | Directive                                                                                                | Supported Animations                                                     |
 * |----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
 * | {@link ng.directive:ngRepeat#animations ngRepeat}                                                        | enter, leave and move                                                    |
 * | {@link ngRoute.directive:ngView#animations ngView}                                                       | enter and leave                                                          |
 * | {@link ng.directive:ngInclude#animations ngInclude}                                                      | enter and leave                                                          |
 * | {@link ng.directive:ngSwitch#animations ngSwitch}                                                        | enter and leave                                                          |
 * | {@link ng.directive:ngIf#animations ngIf}                                                                | enter and leave                                                          |
 * | {@link ng.directive:ngClass#animations ngClass}                                                          | add and remove (the CSS class(es) present)                               |
 * | {@link ng.directive:ngShow#animations ngShow} & {@link ng.directive:ngHide#animations ngHide}            | add and remove (the ng-hide class value)                                 |
 * | {@link ng.directive:form#animation-hooks form} & {@link ng.directive:ngModel#animation-hooks ngModel}    | add and remove (dirty, pristine, valid, invalid & all other validations) |
 * | {@link module:ngMessages#animations ngMessages}                                                          | add and remove (ng-active & ng-inactive)                                 |
 * | {@link module:ngMessages#animations ngMessage}                                                           | enter and leave                                                          |
 *
 * (More information can be found by visiting each the documentation associated with each directive.)
 *
 * ## CSS-based Animations
 *
 * CSS-based animations with ngAnimate are unique since they require no JavaScript code at all. By using a CSS class that we reference between our HTML
 * and CSS code we can create an animation that will be picked up by Angular when an the underlying directive performs an operation.
 *
 * The example below shows how an `enter` animation can be made possible on an element using `ng-if`:
 *
 * ```html
 * <div ng-if="bool" class="fade">
 *    Fade me in out
 * </div>
 * <button ng-click="bool=true">Fade In!</button>
 * <button ng-click="bool=false">Fade Out!</button>
 * ```
 *
 * Notice the CSS class **fade**? We can now create the CSS transition code that references this class:
 *
 * ```css
 * /&#42; The starting CSS styles for the enter animation &#42;/
 * .fade.ng-enter {
 *   transition:0.5s linear all;
 *   opacity:0;
 * }
 *
 * /&#42; The finishing CSS styles for the enter animation &#42;/
 * .fade.ng-enter.ng-enter-active {
 *   opacity:1;
 * }
 * ```
 *
 * The key thing to remember here is that, depending on the animation event (which each of the directives above trigger depending on what's going on) two
 * generated CSS classes will be applied to the element; in the example above we have `.ng-enter` and `.ng-enter-active`. For CSS transitions, the transition
 * code **must** be defined within the starting CSS class (in this case `.ng-enter`). The destination class is what the transition will animate towards.
 *
 * If for example we wanted to create animations for `leave` and `move` (ngRepeat triggers move) then we can do so using the same CSS naming conventions:
 *
 * ```css
 * /&#42; now the element will fade out before it is removed from the DOM &#42;/
 * .fade.ng-leave {
 *   transition:0.5s linear all;
 *   opacity:1;
 * }
 * .fade.ng-leave.ng-leave-active {
 *   opacity:0;
 * }
 * ```
 *
 * We can also make use of **CSS Keyframes** by referencing the keyframe animation within the starting CSS class:
 *
 * ```css
 * /&#42; there is no need to define anything inside of the destination
 * CSS class since the keyframe will take charge of the animation &#42;/
 * .fade.ng-leave {
 *   animation: my_fade_animation 0.5s linear;
 *   -webkit-animation: my_fade_animation 0.5s linear;
 * }
 *
 * @keyframes my_fade_animation {
 *   from { opacity:1; }
 *   to { opacity:0; }
 * }
 *
 * @-webkit-keyframes my_fade_animation {
 *   from { opacity:1; }
 *   to { opacity:0; }
 * }
 * ```
 *
 * Feel free also mix transitions and keyframes together as well as any other CSS classes on the same element.
 *
 * ### CSS Class-based Animations
 *
 * Class-based animations (animations that are triggered via `ngClass`, `ngShow`, `ngHide` and some other directives) have a slightly different
 * naming convention. Class-based animations are basic enough that a standard transition or keyframe can be referenced on the class being added
 * and removed.
 *
 * For example if we wanted to do a CSS animation for `ngHide` then we place an animation on the `.ng-hide` CSS class:
 *
 * ```html
 * <div ng-show="bool" class="fade">
 *   Show and hide me
 * </div>
 * <button ng-click="bool=true">Toggle</button>
 *
 * <style>
 * .fade.ng-hide {
 *   transition:0.5s linear all;
 *   opacity:0;
 * }
 * </style>
 * ```
 *
 * All that is going on here with ngShow/ngHide behind the scenes is the `.ng-hide` class is added/removed (when the hidden state is valid). Since
 * ngShow and ngHide are animation aware then we can match up a transition and ngAnimate handles the rest.
 *
 * In addition the addition and removal of the CSS class, ngAnimate also provides two helper methods that we can use to further decorate the animation
 * with CSS styles.
 *
 * ```html
 * <div ng-class="{on:onOff}" class="highlight">
 *   Highlight this box
 * </div>
 * <button ng-click="onOff=!onOff">Toggle</button>
 *
 * <style>
 * .highlight {
 *   transition:0.5s linear all;
 * }
 * .highlight.on-add {
 *   background:white;
 * }
 * .highlight.on {
 *   background:yellow;
 * }
 * .highlight.on-remove {
 *   background:black;
 * }
 * </style>
 * ```
 *
 * We can also make use of CSS keyframes by placing them within the CSS classes.
 *
 *
 * ### CSS Staggering Animations
 * A Staggering animation is a collection of animations that are issued with a slight delay in between each successive operation resulting in a
 * curtain-like effect. The ngAnimate module (versions >=1.2) supports staggering animations and the stagger effect can be
 * performed by creating a **ng-EVENT-stagger** CSS class and attaching that class to the base CSS class used for
 * the animation. The style property expected within the stagger class can either be a **transition-delay** or an
 * **animation-delay** property (or both if your animation contains both transitions and keyframe animations).
 *
 * ```css
 * .my-animation.ng-enter {
 *   /&#42; standard transition code &#42;/
 *   transition: 1s linear all;
 *   opacity:0;
 * }
 * .my-animation.ng-enter-stagger {
 *   /&#42; this will have a 100ms delay between each successive leave animation &#42;/
 *   transition-delay: 0.1s;
 *
 *   /&#42; As of 1.4.4, this must always be set: it signals ngAnimate
 *     to not accidentally inherit a delay property from another CSS class &#42;/
 *   transition-duration: 0s;
 * }
 * .my-animation.ng-enter.ng-enter-active {
 *   /&#42; standard transition styles &#42;/
 *   opacity:1;
 * }
 * ```
 *
 * Staggering animations work by default in ngRepeat (so long as the CSS class is defined). Outside of ngRepeat, to use staggering animations
 * on your own, they can be triggered by firing multiple calls to the same event on $animate. However, the restrictions surrounding this
 * are that each of the elements must have the same CSS className value as well as the same parent element. A stagger operation
 * will also be reset if one or more animation frames have passed since the multiple calls to `$animate` were fired.
 *
 * The following code will issue the **ng-leave-stagger** event on the element provided:
 *
 * ```js
 * var kids = parent.children();
 *
 * $animate.leave(kids[0]); //stagger index=0
 * $animate.leave(kids[1]); //stagger index=1
 * $animate.leave(kids[2]); //stagger index=2
 * $animate.leave(kids[3]); //stagger index=3
 * $animate.leave(kids[4]); //stagger index=4
 *
 * window.requestAnimationFrame(function() {
 *   //stagger has reset itself
 *   $animate.leave(kids[5]); //stagger index=0
 *   $animate.leave(kids[6]); //stagger index=1
 *
 *   $scope.$digest();
 * });
 * ```
 *
 * Stagger animations are currently only supported within CSS-defined animations.
 *
 * ### The `ng-animate` CSS class
 *
 * When ngAnimate is animating an element it will apply the `ng-animate` CSS class to the element for the duration of the animation.
 * This is a temporary CSS class and it will be removed once the animation is over (for both JavaScript and CSS-based animations).
 *
 * Therefore, animations can be applied to an element using this temporary class directly via CSS.
 *
 * ```css
 * .zipper.ng-animate {
 *   transition:0.5s linear all;
 * }
 * .zipper.ng-enter {
 *   opacity:0;
 * }
 * .zipper.ng-enter.ng-enter-active {
 *   opacity:1;
 * }
 * .zipper.ng-leave {
 *   opacity:1;
 * }
 * .zipper.ng-leave.ng-leave-active {
 *   opacity:0;
 * }
 * ```
 *
 * (Note that the `ng-animate` CSS class is reserved and it cannot be applied on an element directly since ngAnimate will always remove
 * the CSS class once an animation has completed.)
 *
 *
 * ## JavaScript-based Animations
 *
 * ngAnimate also allows for animations to be consumed by JavaScript code. The approach is similar to CSS-based animations (where there is a shared
 * CSS class that is referenced in our HTML code) but in addition we need to register the JavaScript animation on the module. By making use of the
 * `module.animation()` module function we can register the ainmation.
 *
 * Let's see an example of a enter/leave animation using `ngRepeat`:
 *
 * ```html
 * <div ng-repeat="item in items" class="slide">
 *   {{ item }}
 * </div>
 * ```
 *
 * See the **slide** CSS class? Let's use that class to define an animation that we'll structure in our module code by using `module.animation`:
 *
 * ```js
 * myModule.animation('.slide', [function() {
 *   return {
 *     // make note that other events (like addClass/removeClass)
 *     // have different function input parameters
 *     enter: function(element, doneFn) {
 *       jQuery(element).fadeIn(1000, doneFn);
 *
 *       // remember to call doneFn so that angular
 *       // knows that the animation has concluded
 *     },
 *
 *     move: function(element, doneFn) {
 *       jQuery(element).fadeIn(1000, doneFn);
 *     },
 *
 *     leave: function(element, doneFn) {
 *       jQuery(element).fadeOut(1000, doneFn);
 *     }
 *   }
 * }]);
 * ```
 *
 * The nice thing about JS-based animations is that we can inject other services and make use of advanced animation libraries such as
 * greensock.js and velocity.js.
 *
 * If our animation code class-based (meaning that something like `ngClass`, `ngHide` and `ngShow` triggers it) then we can still define
 * our animations inside of the same registered animation, however, the function input arguments are a bit different:
 *
 * ```html
 * <div ng-class="color" class="colorful">
 *   this box is moody
 * </div>
 * <button ng-click="color='red'">Change to red</button>
 * <button ng-click="color='blue'">Change to blue</button>
 * <button ng-click="color='green'">Change to green</button>
 * ```
 *
 * ```js
 * myModule.animation('.colorful', [function() {
 *   return {
 *     addClass: function(element, className, doneFn) {
 *       // do some cool animation and call the doneFn
 *     },
 *     removeClass: function(element, className, doneFn) {
 *       // do some cool animation and call the doneFn
 *     },
 *     setClass: function(element, addedClass, removedClass, doneFn) {
 *       // do some cool animation and call the doneFn
 *     }
 *   }
 * }]);
 * ```
 *
 * ## CSS + JS Animations Together
 *
 * AngularJS 1.4 and higher has taken steps to make the amalgamation of CSS and JS animations more flexible. However, unlike earlier versions of Angular,
 * defining CSS and JS animations to work off of the same CSS class will not work anymore. Therefore the example below will only result in **JS animations taking
 * charge of the animation**:
 *
 * ```html
 * <div ng-if="bool" class="slide">
 *   Slide in and out
 * </div>
 * ```
 *
 * ```js
 * myModule.animation('.slide', [function() {
 *   return {
 *     enter: function(element, doneFn) {
 *       jQuery(element).slideIn(1000, doneFn);
 *     }
 *   }
 * }]);
 * ```
 *
 * ```css
 * .slide.ng-enter {
 *   transition:0.5s linear all;
 *   transform:translateY(-100px);
 * }
 * .slide.ng-enter.ng-enter-active {
 *   transform:translateY(0);
 * }
 * ```
 *
 * Does this mean that CSS and JS animations cannot be used together? Do JS-based animations always have higher priority? We can make up for the
 * lack of CSS animations by using the `$animateCss` service to trigger our own tweaked-out, CSS-based animations directly from
 * our own JS-based animation code:
 *
 * ```js
 * myModule.animation('.slide', ['$animateCss', function($animateCss) {
 *   return {
 *     enter: function(element) {
*        // this will trigger `.slide.ng-enter` and `.slide.ng-enter-active`.
 *       return $animateCss(element, {
 *         event: 'enter',
 *         structural: true
 *       });
 *     }
 *   }
 * }]);
 * ```
 *
 * The nice thing here is that we can save bandwidth by sticking to our CSS-based animation code and we don't need to rely on a 3rd-party animation framework.
 *
 * The `$animateCss` service is very powerful since we can feed in all kinds of extra properties that will be evaluated and fed into a CSS transition or
 * keyframe animation. For example if we wanted to animate the height of an element while adding and removing classes then we can do so by providing that
 * data into `$animateCss` directly:
 *
 * ```js
 * myModule.animation('.slide', ['$animateCss', function($animateCss) {
 *   return {
 *     enter: function(element) {
 *       return $animateCss(element, {
 *         event: 'enter',
 *         structural: true,
 *         addClass: 'maroon-setting',
 *         from: { height:0 },
 *         to: { height: 200 }
 *       });
 *     }
 *   }
 * }]);
 * ```
 *
 * Now we can fill in the rest via our transition CSS code:
 *
 * ```css
 * /&#42; the transition tells ngAnimate to make the animation happen &#42;/
 * .slide.ng-enter { transition:0.5s linear all; }
 *
 * /&#42; this extra CSS class will be absorbed into the transition
 * since the $animateCss code is adding the class &#42;/
 * .maroon-setting { background:red; }
 * ```
 *
 * And `$animateCss` will figure out the rest. Just make sure to have the `done()` callback fire the `doneFn` function to signal when the animation is over.
 *
 * To learn more about what's possible be sure to visit the {@link ngAnimate.$animateCss $animateCss service}.
 *
 * ## Animation Anchoring (via `ng-animate-ref`)
 *
 * ngAnimate in AngularJS 1.4 comes packed with the ability to cross-animate elements between
 * structural areas of an application (like views) by pairing up elements using an attribute
 * called `ng-animate-ref`.
 *
 * Let's say for example we have two views that are managed by `ng-view` and we want to show
 * that there is a relationship between two components situated in within these views. By using the
 * `ng-animate-ref` attribute we can identify that the two components are paired together and we
 * can then attach an animation, which is triggered when the view changes.
 *
 * Say for example we have the following template code:
 *
 * ```html
 * <!-- index.html -->
 * <div ng-view class="view-animation">
 * </div>
 *
 * <!-- home.html -->
 * <a href="#/banner-page">
 *   <img src="./banner.jpg" class="banner" ng-animate-ref="banner">
 * </a>
 *
 * <!-- banner-page.html -->
 * <img src="./banner.jpg" class="banner" ng-animate-ref="banner">
 * ```
 *
 * Now, when the view changes (once the link is clicked), ngAnimate will examine the
 * HTML contents to see if there is a match reference between any components in the view
 * that is leaving and the view that is entering. It will scan both the view which is being
 * removed (leave) and inserted (enter) to see if there are any paired DOM elements that
 * contain a matching ref value.
 *
 * The two images match since they share the same ref value. ngAnimate will now create a
 * transport element (which is a clone of the first image element) and it will then attempt
 * to animate to the position of the second image element in the next view. For the animation to
 * work a special CSS class called `ng-anchor` will be added to the transported element.
 *
 * We can now attach a transition onto the `.banner.ng-anchor` CSS class and then
 * ngAnimate will handle the entire transition for us as well as the addition and removal of
 * any changes of CSS classes between the elements:
 *
 * ```css
 * .banner.ng-anchor {
 *   /&#42; this animation will last for 1 second since there are
 *          two phases to the animation (an `in` and an `out` phase) &#42;/
 *   transition:0.5s linear all;
 * }
 * ```
 *
 * We also **must** include animations for the views that are being entered and removed
 * (otherwise anchoring wouldn't be possible since the new view would be inserted right away).
 *
 * ```css
 * .view-animation.ng-enter, .view-animation.ng-leave {
 *   transition:0.5s linear all;
 *   position:fixed;
 *   left:0;
 *   top:0;
 *   width:100%;
 * }
 * .view-animation.ng-enter {
 *   transform:translateX(100%);
 * }
 * .view-animation.ng-leave,
 * .view-animation.ng-enter.ng-enter-active {
 *   transform:translateX(0%);
 * }
 * .view-animation.ng-leave.ng-leave-active {
 *   transform:translateX(-100%);
 * }
 * ```
 *
 * Now we can jump back to the anchor animation. When the animation happens, there are two stages that occur:
 * an `out` and an `in` stage. The `out` stage happens first and that is when the element is animated away
 * from its origin. Once that animation is over then the `in` stage occurs which animates the
 * element to its destination. The reason why there are two animations is to give enough time
 * for the enter animation on the new element to be ready.
 *
 * The example above sets up a transition for both the in and out phases, but we can also target the out or
 * in phases directly via `ng-anchor-out` and `ng-anchor-in`.
 *
 * ```css
 * .banner.ng-anchor-out {
 *   transition: 0.5s linear all;
 *
 *   /&#42; the scale will be applied during the out animation,
 *          but will be animated away when the in animation runs &#42;/
 *   transform: scale(1.2);
 * }
 *
 * .banner.ng-anchor-in {
 *   transition: 1s linear all;
 * }
 * ```
 *
 *
 *
 *
 * ### Anchoring Demo
 *
  <example module="anchoringExample"
           name="anchoringExample"
           id="anchoringExample"
           deps="angular-animate.js;angular-route.js"
           animations="true">
    <file name="index.html">
      <a href="#/">Home</a>
      <hr />
      <div class="view-container">
        <div ng-view class="view"></div>
      </div>
    </file>
    <file name="script.js">
      angular.module('anchoringExample', ['ngAnimate', 'ngRoute'])
        .config(['$routeProvider', function($routeProvider) {
          $routeProvider.when('/', {
            templateUrl: 'home.html',
            controller: 'HomeController as home'
          });
          $routeProvider.when('/profile/:id', {
            templateUrl: 'profile.html',
            controller: 'ProfileController as profile'
          });
        }])
        .run(['$rootScope', function($rootScope) {
          $rootScope.records = [
            { id:1, title: "Miss Beulah Roob" },
            { id:2, title: "Trent Morissette" },
            { id:3, title: "Miss Ava Pouros" },
            { id:4, title: "Rod Pouros" },
            { id:5, title: "Abdul Rice" },
            { id:6, title: "Laurie Rutherford Sr." },
            { id:7, title: "Nakia McLaughlin" },
            { id:8, title: "Jordon Blanda DVM" },
            { id:9, title: "Rhoda Hand" },
            { id:10, title: "Alexandrea Sauer" }
          ];
        }])
        .controller('HomeController', [function() {
          //empty
        }])
        .controller('ProfileController', ['$rootScope', '$routeParams', function($rootScope, $routeParams) {
          var index = parseInt($routeParams.id, 10);
          var record = $rootScope.records[index - 1];

          this.title = record.title;
          this.id = record.id;
        }]);
    </file>
    <file name="home.html">
      <h2>Welcome to the home page</h1>
      <p>Please click on an element</p>
      <a class="record"
         ng-href="#/profile/{{ record.id }}"
         ng-animate-ref="{{ record.id }}"
         ng-repeat="record in records">
        {{ record.title }}
      </a>
    </file>
    <file name="profile.html">
      <div class="profile record" ng-animate-ref="{{ profile.id }}">
        {{ profile.title }}
      </div>
    </file>
    <file name="animations.css">
      .record {
        display:block;
        font-size:20px;
      }
      .profile {
        background:black;
        color:white;
        font-size:100px;
      }
      .view-container {
        position:relative;
      }
      .view-container > .view.ng-animate {
        position:absolute;
        top:0;
        left:0;
        width:100%;
        min-height:500px;
      }
      .view.ng-enter, .view.ng-leave,
      .record.ng-anchor {
        transition:0.5s linear all;
      }
      .view.ng-enter {
        transform:translateX(100%);
      }
      .view.ng-enter.ng-enter-active, .view.ng-leave {
        transform:translateX(0%);
      }
      .view.ng-leave.ng-leave-active {
        transform:translateX(-100%);
      }
      .record.ng-anchor-out {
        background:red;
      }
    </file>
  </example>
 *
 * ### How is the element transported?
 *
 * When an anchor animation occurs, ngAnimate will clone the starting element and position it exactly where the starting
 * element is located on screen via absolute positioning. The cloned element will be placed inside of the root element
 * of the application (where ng-app was defined) and all of the CSS classes of the starting element will be applied. The
 * element will then animate into the `out` and `in` animations and will eventually reach the coordinates and match
 * the dimensions of the destination element. During the entire animation a CSS class of `.ng-animate-shim` will be applied
 * to both the starting and destination elements in order to hide them from being visible (the CSS styling for the class
 * is: `visibility:hidden`). Once the anchor reaches its destination then it will be removed and the destination element
 * will become visible since the shim class will be removed.
 *
 * ### How is the morphing handled?
 *
 * CSS Anchoring relies on transitions and keyframes and the internal code is intelligent enough to figure out
 * what CSS classes differ between the starting element and the destination element. These different CSS classes
 * will be added/removed on the anchor element and a transition will be applied (the transition that is provided
 * in the anchor class). Long story short, ngAnimate will figure out what classes to add and remove which will
 * make the transition of the element as smooth and automatic as possible. Be sure to use simple CSS classes that
 * do not rely on DOM nesting structure so that the anchor element appears the same as the starting element (since
 * the cloned element is placed inside of root element which is likely close to the body element).
 *
 * Note that if the root element is on the `<html>` element then the cloned node will be placed inside of body.
 *
 *
 * ## Using $animate in your directive code
 *
 * So far we've explored how to feed in animations into an Angular application, but how do we trigger animations within our own directives in our application?
 * By injecting the `$animate` service into our directive code, we can trigger structural and class-based hooks which can then be consumed by animations. Let's
 * imagine we have a greeting box that shows and hides itself when the data changes
 *
 * ```html
 * <greeting-box active="onOrOff">Hi there</greeting-box>
 * ```
 *
 * ```js
 * ngModule.directive('greetingBox', ['$animate', function($animate) {
 *   return function(scope, element, attrs) {
 *     attrs.$observe('active', function(value) {
 *       value ? $animate.addClass(element, 'on') : $animate.removeClass(element, 'on');
 *     });
 *   });
 * }]);
 * ```
 *
 * Now the `on` CSS class is added and removed on the greeting box component. Now if we add a CSS class on top of the greeting box element
 * in our HTML code then we can trigger a CSS or JS animation to happen.
 *
 * ```css
 * /&#42; normally we would create a CSS class to reference on the element &#42;/
 * greeting-box.on { transition:0.5s linear all; background:green; color:white; }
 * ```
 *
 * The `$animate` service contains a variety of other methods like `enter`, `leave`, `animate` and `setClass`. To learn more about what's
 * possible be sure to visit the {@link ng.$animate $animate service API page}.
 *
 *
 * ### Preventing Collisions With Third Party Libraries
 *
 * Some third-party frameworks place animation duration defaults across many element or className
 * selectors in order to make their code small and reuseable. This can lead to issues with ngAnimate, which
 * is expecting actual animations on these elements and has to wait for their completion.
 *
 * You can prevent this unwanted behavior by using a prefix on all your animation classes:
 *
 * ```css
 * /&#42; prefixed with animate- &#42;/
 * .animate-fade-add.animate-fade-add-active {
 *   transition:1s linear all;
 *   opacity:0;
 * }
 * ```
 *
 * You then configure `$animate` to enforce this prefix:
 *
 * ```js
 * $animateProvider.classNameFilter(/animate-/);
 * ```
 *
 * This also may provide your application with a speed boost since only specific elements containing CSS class prefix
 * will be evaluated for animation when any DOM changes occur in the application.
 *
 * ## Callbacks and Promises
 *
 * When `$animate` is called it returns a promise that can be used to capture when the animation has ended. Therefore if we were to trigger
 * an animation (within our directive code) then we can continue performing directive and scope related activities after the animation has
 * ended by chaining onto the returned promise that animation method returns.
 *
 * ```js
 * // somewhere within the depths of the directive
 * $animate.enter(element, parent).then(function() {
 *   //the animation has completed
 * });
 * ```
 *
 * (Note that earlier versions of Angular prior to v1.4 required the promise code to be wrapped using `$scope.$apply(...)`. This is not the case
 * anymore.)
 *
 * In addition to the animation promise, we can also make use of animation-related callbacks within our directives and controller code by registering
 * an event listener using the `$animate` service. Let's say for example that an animation was triggered on our view
 * routing controller to hook into that:
 *
 * ```js
 * ngModule.controller('HomePageController', ['$animate', function($animate) {
 *   $animate.on('enter', ngViewElement, function(element) {
 *     // the animation for this route has completed
 *   }]);
 * }])
 * ```
 *
 * (Note that you will need to trigger a digest within the callback to get angular to notice any scope-related changes.)
 */
/**
 * @ngdoc service
 * @name $animate
 * @kind object
 *
 * @description
 * The ngAnimate `$animate` service documentation is the same for the core `$animate` service.
 *
 * Click here {@link ng.$animate to learn more about animations with `$animate`}.
 */
angular.module("ngAnimate",[]).directive("ngAnimateChildren",$$AnimateChildrenDirective).factory("$$rAFScheduler",$$rAFSchedulerFactory).provider("$$animateQueue",$$AnimateQueueProvider).provider("$$animation",$$AnimationProvider).provider("$animateCss",$AnimateCssProvider).provider("$$animateCssDriver",$$AnimateCssDriverProvider).provider("$$animateJs",$$AnimateJsProvider).provider("$$animateJsDriver",$$AnimateJsDriverProvider)}(window,window.angular);