/**
 * @license AngularJS v1.6.4
 * (c) 2010-2017 Google, Inc. http://angularjs.org
 * License: MIT
 */
!function(window,angular){"use strict";function assertArg(arg,name,reason){if(!arg)throw ngMinErr("areq","Argument '{0}' is {1}",name||"?",reason||"required");return arg}function mergeClasses(a,b){return a||b?a?b?(isArray(a)&&(a=a.join(" ")),isArray(b)&&(b=b.join(" ")),a+" "+b):a:b:""}function packageStyles(options){var styles={};return options&&(options.to||options.from)&&(styles.to=options.to,styles.from=options.from),styles}function pendClasses(classes,fix,isPrefix){var className="";return classes=isArray(classes)?classes:classes&&isString(classes)&&classes.length?classes.split(/\s+/):[],forEach(classes,function(klass,i){klass&&klass.length>0&&(className+=i>0?" ":"",className+=isPrefix?fix+klass:klass+fix)}),className}function removeFromArray(arr,val){var index=arr.indexOf(val);val>=0&&arr.splice(index,1)}function stripCommentsFromElement(element){if(element instanceof jqLite)switch(element.length){case 0:return element;case 1:
// there is no point of stripping anything if the element
// is the only element within the jqLite wrapper.
// (it's important that we retain the element instance.)
if(element[0].nodeType===ELEMENT_NODE)return element;break;default:return jqLite(extractElementNode(element))}if(element.nodeType===ELEMENT_NODE)return jqLite(element)}function extractElementNode(element){if(!element[0])return element;for(var i=0;i<element.length;i++){var elm=element[i];if(elm.nodeType===ELEMENT_NODE)return elm}}function $$addClass($$jqLite,element,className){forEach(element,function(elm){$$jqLite.addClass(elm,className)})}function $$removeClass($$jqLite,element,className){forEach(element,function(elm){$$jqLite.removeClass(elm,className)})}function applyAnimationClassesFactory($$jqLite){return function(element,options){options.addClass&&($$addClass($$jqLite,element,options.addClass),options.addClass=null),options.removeClass&&($$removeClass($$jqLite,element,options.removeClass),options.removeClass=null)}}function prepareAnimationOptions(options){if(options=options||{},!options.$$prepared){var domOperation=options.domOperation||noop;options.domOperation=function(){options.$$domOperationFired=!0,domOperation(),domOperation=noop},options.$$prepared=!0}return options}function applyAnimationStyles(element,options){applyAnimationFromStyles(element,options),applyAnimationToStyles(element,options)}function applyAnimationFromStyles(element,options){options.from&&(element.css(options.from),options.from=null)}function applyAnimationToStyles(element,options){options.to&&(element.css(options.to),options.to=null)}function mergeAnimationDetails(element,oldAnimation,newAnimation){var target=oldAnimation.options||{},newOptions=newAnimation.options||{},toAdd=(target.addClass||"")+" "+(newOptions.addClass||""),toRemove=(target.removeClass||"")+" "+(newOptions.removeClass||""),classes=resolveElementClasses(element.attr("class"),toAdd,toRemove);newOptions.preparationClasses&&(target.preparationClasses=concatWithSpace(newOptions.preparationClasses,target.preparationClasses),delete newOptions.preparationClasses);
// noop is basically when there is no callback; otherwise something has been set
var realDomOperation=target.domOperation!==noop?target.domOperation:null;
// TODO(matsko or sreeramu): proper fix is to maintain all animation callback in array and call at last,but now only leave has the callback so no issue with this.
return extend(target,newOptions),realDomOperation&&(target.domOperation=realDomOperation),classes.addClass?target.addClass=classes.addClass:target.addClass=null,classes.removeClass?target.removeClass=classes.removeClass:target.removeClass=null,oldAnimation.addClass=target.addClass,oldAnimation.removeClass=target.removeClass,target}function resolveElementClasses(existing,toAdd,toRemove){function splitClassesToLookup(classes){isString(classes)&&(classes=classes.split(" "));var obj={};return forEach(classes,function(klass){
// sometimes the split leaves empty string values
// incase extra spaces were applied to the options
klass.length&&(obj[klass]=!0)}),obj}var ADD_CLASS=1,REMOVE_CLASS=-1,flags={};existing=splitClassesToLookup(existing),toAdd=splitClassesToLookup(toAdd),forEach(toAdd,function(value,key){flags[key]=ADD_CLASS}),toRemove=splitClassesToLookup(toRemove),forEach(toRemove,function(value,key){flags[key]=flags[key]===ADD_CLASS?null:REMOVE_CLASS});var classes={addClass:"",removeClass:""};return forEach(flags,function(val,klass){var prop,allow;val===ADD_CLASS?(prop="addClass",allow=!existing[klass]||existing[klass+REMOVE_CLASS_SUFFIX]):val===REMOVE_CLASS&&(prop="removeClass",allow=existing[klass]||existing[klass+ADD_CLASS_SUFFIX]),allow&&(classes[prop].length&&(classes[prop]+=" "),classes[prop]+=klass)}),classes}function getDomNode(element){return element instanceof jqLite?element[0]:element}function applyGeneratedPreparationClasses(element,event,options){var classes="";event&&(classes=pendClasses(event,EVENT_CLASS_PREFIX,!0)),options.addClass&&(classes=concatWithSpace(classes,pendClasses(options.addClass,ADD_CLASS_SUFFIX))),options.removeClass&&(classes=concatWithSpace(classes,pendClasses(options.removeClass,REMOVE_CLASS_SUFFIX))),classes.length&&(options.preparationClasses=classes,element.addClass(classes))}function clearGeneratedClasses(element,options){options.preparationClasses&&(element.removeClass(options.preparationClasses),options.preparationClasses=null),options.activeClasses&&(element.removeClass(options.activeClasses),options.activeClasses=null)}function blockTransitions(node,duration){
// we use a negative delay value since it performs blocking
// yet it doesn't kill any existing transitions running on the
// same element which makes this safe for class-based animations
var value=duration?"-"+duration+"s":"";return applyInlineStyle(node,[TRANSITION_DELAY_PROP,value]),[TRANSITION_DELAY_PROP,value]}function blockKeyframeAnimations(node,applyBlock){var value=applyBlock?"paused":"",key=ANIMATION_PROP+ANIMATION_PLAYSTATE_KEY;return applyInlineStyle(node,[key,value]),[key,value]}function applyInlineStyle(node,styleTuple){var prop=styleTuple[0],value=styleTuple[1];node.style[prop]=value}function concatWithSpace(a,b){return a?b?a+" "+b:a:b}function getCssKeyframeDurationStyle(duration){return[ANIMATION_DURATION_PROP,duration+"s"]}function getCssDelayStyle(delay,isKeyframeAnimation){var prop=isKeyframeAnimation?ANIMATION_DELAY_PROP:TRANSITION_DELAY_PROP;return[prop,delay+"s"]}function computeCssStyles($window,element,properties){var styles=Object.create(null),detectedStyles=$window.getComputedStyle(element)||{};return forEach(properties,function(formalStyleName,actualStyleName){var val=detectedStyles[formalStyleName];if(val){var c=val.charAt(0);
// only numerical-based values have a negative sign or digit as the first value
("-"===c||"+"===c||c>=0)&&(val=parseMaxTime(val)),
// by setting this to null in the event that the delay is not set or is set directly as 0
// then we can still allow for negative values to be used later on and not mistake this
// value for being greater than any other negative value.
0===val&&(val=null),styles[actualStyleName]=val}}),styles}function parseMaxTime(str){var maxValue=0,values=str.split(/\s*,\s*/);return forEach(values,function(value){
// it's always safe to consider only second values and omit `ms` values since
// getComputedStyle will always handle the conversion for us
"s"===value.charAt(value.length-1)&&(value=value.substring(0,value.length-1)),value=parseFloat(value)||0,maxValue=maxValue?Math.max(value,maxValue):value}),maxValue}function truthyTimingValue(val){return 0===val||null!=val}function getCssTransitionDurationStyle(duration,applyOnlyDuration){var style=TRANSITION_PROP,value=duration+"s";return applyOnlyDuration?style+=DURATION_KEY:value+=" linear all",[style,value]}function createLocalCacheLookup(){var cache=Object.create(null);return{flush:function(){cache=Object.create(null)},count:function(key){var entry=cache[key];return entry?entry.total:0},get:function(key){var entry=cache[key];return entry&&entry.value},put:function(key,value){cache[key]?cache[key].total++:cache[key]={total:1,value:value}}}}
// we do not reassign an already present style value since
// if we detect the style property value again we may be
// detecting styles that were added via the `from` styles.
// We make use of `isDefined` here since an empty string
// or null value (which is what getPropertyValue will return
// for a non-existing style) will still be marked as a valid
// value for the style (a falsy value implies that the style
// is to be removed at the end of the animation). If we had a simple
// "OR" statement then it would not be enough to catch that.
function registerRestorableStyles(backup,node,properties){forEach(properties,function(prop){backup[prop]=isDefined(backup[prop])?backup[prop]:node.style.getPropertyValue(prop)})}var TRANSITION_PROP,TRANSITIONEND_EVENT,ANIMATION_PROP,ANIMATIONEND_EVENT,ELEMENT_NODE=1,ADD_CLASS_SUFFIX="-add",REMOVE_CLASS_SUFFIX="-remove",EVENT_CLASS_PREFIX="ng-",ACTIVE_CLASS_SUFFIX="-active",PREPARE_CLASS_SUFFIX="-prepare",NG_ANIMATE_CLASSNAME="ng-animate",NG_ANIMATE_CHILDREN_DATA="$$ngAnimateChildren",CSS_PREFIX="";
// If unprefixed events are not supported but webkit-prefixed are, use the latter.
// Otherwise, just use W3C names, browsers not supporting them at all will just ignore them.
// Note: Chrome implements `window.onwebkitanimationend` and doesn't implement `window.onanimationend`
// but at the same time dispatches the `animationend` event and not `webkitAnimationEnd`.
// Register both events in case `window.onanimationend` is not supported because of that,
// do the same for `transitionend` as Safari is likely to exhibit similar behavior.
// Also, the only modern browser that uses vendor prefixes for transitions/keyframes is webkit
// therefore there is no reason to test anymore for other vendor prefixes:
// http://caniuse.com/#search=transition
void 0===window.ontransitionend&&void 0!==window.onwebkittransitionend?(CSS_PREFIX="-webkit-",TRANSITION_PROP="WebkitTransition",TRANSITIONEND_EVENT="webkitTransitionEnd transitionend"):(TRANSITION_PROP="transition",TRANSITIONEND_EVENT="transitionend"),void 0===window.onanimationend&&void 0!==window.onwebkitanimationend?(CSS_PREFIX="-webkit-",ANIMATION_PROP="WebkitAnimation",ANIMATIONEND_EVENT="webkitAnimationEnd animationend"):(ANIMATION_PROP="animation",ANIMATIONEND_EVENT="animationend");var copy,extend,forEach,isArray,isDefined,isElement,isFunction,isObject,isString,isUndefined,jqLite,noop,DURATION_KEY="Duration",PROPERTY_KEY="Property",DELAY_KEY="Delay",TIMING_KEY="TimingFunction",ANIMATION_ITERATION_COUNT_KEY="IterationCount",ANIMATION_PLAYSTATE_KEY="PlayState",SAFE_FAST_FORWARD_DURATION_VALUE=9999,ANIMATION_DELAY_PROP=ANIMATION_PROP+DELAY_KEY,ANIMATION_DURATION_PROP=ANIMATION_PROP+DURATION_KEY,TRANSITION_DELAY_PROP=TRANSITION_PROP+DELAY_KEY,TRANSITION_DURATION_PROP=TRANSITION_PROP+DURATION_KEY,ngMinErr=angular.$$minErr("ng"),$$rAFSchedulerFactory=["$$rAF",function($$rAF){function scheduler(tasks){
// we make a copy since RAFScheduler mutates the state
// of the passed in array variable and this would be difficult
// to track down on the outside code
queue=queue.concat(tasks),nextTick()}function nextTick(){if(queue.length){for(var items=queue.shift(),i=0;i<items.length;i++)items[i]();cancelFn||$$rAF(function(){cancelFn||nextTick()})}}var queue,cancelFn;/* waitUntilQuiet does two things:
   * 1. It will run the FINAL `fn` value only when an uncanceled RAF has passed through
   * 2. It will delay the next wave of tasks from running until the quiet `fn` has run.
   *
   * The motivation here is that animation code can request more time from the scheduler
   * before the next wave runs. This allows for certain DOM properties such as classes to
   * be resolved in time for the next animation to run.
   */
return queue=scheduler.queue=[],scheduler.waitUntilQuiet=function(fn){cancelFn&&cancelFn(),cancelFn=$$rAF(function(){cancelFn=null,fn(),nextTick()})},scheduler}],$$AnimateChildrenDirective=["$interpolate",function($interpolate){return{link:function(scope,element,attrs){function setData(value){value="on"===value||"true"===value,element.data(NG_ANIMATE_CHILDREN_DATA,value)}var val=attrs.ngAnimateChildren;isString(val)&&0===val.length?//empty attribute
element.data(NG_ANIMATE_CHILDREN_DATA,!0):(
// Interpolate and set the value, so that it is available to
// animations that run right after compilation
setData($interpolate(val)(scope)),attrs.$observe("ngAnimateChildren",setData))}}}],ANIMATE_TIMER_KEY="$$animateCss",ONE_SECOND=1e3,ELAPSED_TIME_MAX_DECIMAL_PLACES=3,CLOSING_TIME_BUFFER=1.5,DETECT_CSS_PROPERTIES={transitionDuration:TRANSITION_DURATION_PROP,transitionDelay:TRANSITION_DELAY_PROP,transitionProperty:TRANSITION_PROP+PROPERTY_KEY,animationDuration:ANIMATION_DURATION_PROP,animationDelay:ANIMATION_DELAY_PROP,animationIterationCount:ANIMATION_PROP+ANIMATION_ITERATION_COUNT_KEY},DETECT_STAGGER_CSS_PROPERTIES={transitionDuration:TRANSITION_DURATION_PROP,transitionDelay:TRANSITION_DELAY_PROP,animationDuration:ANIMATION_DURATION_PROP,animationDelay:ANIMATION_DELAY_PROP},$AnimateCssProvider=["$animateProvider",/** @this */function($animateProvider){var gcsLookup=createLocalCacheLookup(),gcsStaggerLookup=createLocalCacheLookup();this.$get=["$window","$$jqLite","$$AnimateRunner","$timeout","$$forceReflow","$sniffer","$$rAFScheduler","$$animateQueue",function($window,$$jqLite,$$AnimateRunner,$timeout,$$forceReflow,$sniffer,$$rAFScheduler,$$animateQueue){function gcsHashFn(node,extraClasses){var KEY="$$ngAnimateParentKey",parentNode=node.parentNode,parentID=parentNode[KEY]||(parentNode[KEY]=++parentCounter);return parentID+"-"+node.getAttribute("class")+"-"+extraClasses}function computeCachedCssStyles(node,className,cacheKey,properties){var timings=gcsLookup.get(cacheKey);
// we keep putting this in multiple times even though the value and the cacheKey are the same
// because we're keeping an internal tally of how many duplicate animations are detected.
return timings||(timings=computeCssStyles($window,node,properties),"infinite"===timings.animationIterationCount&&(timings.animationIterationCount=1)),gcsLookup.put(cacheKey,timings),timings}function computeCachedCssStaggerStyles(node,className,cacheKey,properties){var stagger;
// if we have one or more existing matches of matching elements
// containing the same parent + CSS styles (which is how cacheKey works)
// then staggering is possible
if(gcsLookup.count(cacheKey)>0&&(stagger=gcsStaggerLookup.get(cacheKey),!stagger)){var staggerClassName=pendClasses(className,"-stagger");$$jqLite.addClass(node,staggerClassName),stagger=computeCssStyles($window,node,properties),
// force the conversion of a null value to zero incase not set
stagger.animationDuration=Math.max(stagger.animationDuration,0),stagger.transitionDuration=Math.max(stagger.transitionDuration,0),$$jqLite.removeClass(node,staggerClassName),gcsStaggerLookup.put(cacheKey,stagger)}return stagger||{}}function waitUntilQuiet(callback){rafWaitQueue.push(callback),$$rAFScheduler.waitUntilQuiet(function(){gcsLookup.flush(),gcsStaggerLookup.flush();
// we use a for loop to ensure that if the queue is changed
// during this looping then it will consider new requests
for(var pageWidth=$$forceReflow(),i=0;i<rafWaitQueue.length;i++)rafWaitQueue[i](pageWidth);rafWaitQueue.length=0})}function computeTimings(node,className,cacheKey){var timings=computeCachedCssStyles(node,className,cacheKey,DETECT_CSS_PROPERTIES),aD=timings.animationDelay,tD=timings.transitionDelay;return timings.maxDelay=aD&&tD?Math.max(aD,tD):aD||tD,timings.maxDuration=Math.max(timings.animationDuration*timings.animationIterationCount,timings.transitionDuration),timings}var applyAnimationClasses=applyAnimationClassesFactory($$jqLite),parentCounter=0,rafWaitQueue=[];return function(element,initialOptions){function endFn(){close()}function cancelFn(){close(!0)}function close(rejected){
// if the promise has been called already then we shouldn't close
// the animation again
if(!(animationClosed||animationCompleted&&animationPaused)){animationClosed=!0,animationPaused=!1,options.$$skipPreparationClasses||$$jqLite.removeClass(element,preparationClasses),$$jqLite.removeClass(element,activeClasses),blockKeyframeAnimations(node,!1),blockTransitions(node,!1),forEach(temporaryStyles,function(entry){
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
element.off(events.join(" "),onAnimationProgress);
//Cancel the fallback closing timeout and remove the timer data
var animationTimerData=element.data(ANIMATE_TIMER_KEY);animationTimerData&&($timeout.cancel(animationTimerData[0].timer),element.removeData(ANIMATE_TIMER_KEY)),
// if the preparation function fails then the promise is not setup
runner&&runner.complete(!rejected)}}function applyBlocking(duration){flags.blockTransition&&blockTransitions(node,duration),flags.blockKeyframeAnimation&&blockKeyframeAnimations(node,!!duration)}function closeAndReturnNoopAnimator(){
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
if(!animationClosed){if(applyBlocking(!1),forEach(temporaryStyles,function(entry){var key=entry[0],value=entry[1];node.style[key]=value}),applyAnimationClasses(element,options),$$jqLite.addClass(element,activeClasses),flags.recalculateTimingStyles){if(fullClassName=node.getAttribute("class")+" "+preparationClasses,cacheKey=gcsHashFn(node,fullClassName),timings=computeTimings(node,fullClassName,cacheKey),relativeDelay=timings.maxDelay,maxDelay=Math.max(relativeDelay,0),maxDuration=timings.maxDuration,0===maxDuration)return void close();flags.hasTransitions=timings.transitionDuration>0,flags.hasAnimations=timings.animationDuration>0}if(flags.applyAnimationDelay&&(relativeDelay="boolean"!=typeof options.delay&&truthyTimingValue(options.delay)?parseFloat(options.delay):relativeDelay,maxDelay=Math.max(relativeDelay,0),timings.animationDelay=relativeDelay,delayStyle=getCssDelayStyle(relativeDelay,!0),temporaryStyles.push(delayStyle),node.style[delayStyle[0]]=delayStyle[1]),maxDelayTime=maxDelay*ONE_SECOND,maxDurationTime=maxDuration*ONE_SECOND,options.easing){var easeProp,easeVal=options.easing;flags.hasTransitions&&(easeProp=TRANSITION_PROP+TIMING_KEY,temporaryStyles.push([easeProp,easeVal]),node.style[easeProp]=easeVal),flags.hasAnimations&&(easeProp=ANIMATION_PROP+TIMING_KEY,temporaryStyles.push([easeProp,easeVal]),node.style[easeProp]=easeVal)}timings.transitionDuration&&events.push(TRANSITIONEND_EVENT),timings.animationDuration&&events.push(ANIMATIONEND_EVENT),startTime=Date.now();var timerTime=maxDelayTime+CLOSING_TIME_BUFFER*maxDurationTime,endTime=startTime+timerTime,animationsData=element.data(ANIMATE_TIMER_KEY)||[],setupFallbackTimer=!0;if(animationsData.length){var currentTimerData=animationsData[0];setupFallbackTimer=endTime>currentTimerData.expectedEndTime,setupFallbackTimer?$timeout.cancel(currentTimerData.timer):animationsData.push(close)}if(setupFallbackTimer){var timer=$timeout(onAnimationExpired,timerTime,!1);animationsData[0]={timer:timer,expectedEndTime:endTime},animationsData.push(close),element.data(ANIMATE_TIMER_KEY,animationsData)}events.length&&element.on(events.join(" "),onAnimationProgress),options.to&&(options.cleanupStyles&&registerRestorableStyles(restoreStyles,node,Object.keys(options.to)),applyAnimationToStyles(element,options))}}function onAnimationExpired(){var animationsData=element.data(ANIMATE_TIMER_KEY);
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
isFirst&&!options.skipBlocking&&blockTransitions(node,SAFE_FAST_FORWARD_DURATION_VALUE);var timings=computeTimings(node,fullClassName,cacheKey),relativeDelay=timings.maxDelay;maxDelay=Math.max(relativeDelay,0),maxDuration=timings.maxDuration;var flags={};if(flags.hasTransitions=timings.transitionDuration>0,flags.hasAnimations=timings.animationDuration>0,flags.hasTransitionAll=flags.hasTransitions&&"all"===timings.transitionProperty,flags.applyTransitionDuration=hasToStyles&&(flags.hasTransitions&&!flags.hasTransitionAll||flags.hasAnimations&&!flags.hasTransitions),flags.applyAnimationDuration=options.duration&&flags.hasAnimations,flags.applyTransitionDelay=truthyTimingValue(options.delay)&&(flags.applyTransitionDuration||flags.hasTransitions),flags.applyAnimationDelay=truthyTimingValue(options.delay)&&flags.hasAnimations,flags.recalculateTimingStyles=addRemoveClassName.length>0,(flags.applyTransitionDuration||flags.applyAnimationDuration)&&(maxDuration=options.duration?parseFloat(options.duration):maxDuration,flags.applyTransitionDuration&&(flags.hasTransitions=!0,timings.transitionDuration=maxDuration,applyOnlyDuration=node.style[TRANSITION_PROP+PROPERTY_KEY].length>0,temporaryStyles.push(getCssTransitionDurationStyle(maxDuration,applyOnlyDuration))),flags.applyAnimationDuration&&(flags.hasAnimations=!0,timings.animationDuration=maxDuration,temporaryStyles.push(getCssKeyframeDurationStyle(maxDuration)))),0===maxDuration&&!flags.recalculateTimingStyles)return closeAndReturnNoopAnimator();if(null!=options.delay){var delayStyle;"boolean"!=typeof options.delay&&(delayStyle=parseFloat(options.delay),
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
pause:null},runner=new $$AnimateRunner(runnerHost),waitUntilQuiet(start),runner}}}}]}],$$AnimateCssDriverProvider=["$$animationProvider",/** @this */function($$animationProvider){function isDocumentFragment(node){return node.parentNode&&11===node.parentNode.nodeType}$$animationProvider.drivers.push("$$animateCssDriver");var NG_ANIMATE_SHIM_CLASS_NAME="ng-animate-shim",NG_ANIMATE_ANCHOR_CLASS_NAME="ng-anchor",NG_OUT_ANCHOR_CLASS_NAME="ng-anchor-out",NG_IN_ANCHOR_CLASS_NAME="ng-anchor-in";this.$get=["$animateCss","$rootScope","$$AnimateRunner","$rootElement","$sniffer","$$jqLite","$document",function($animateCss,$rootScope,$$AnimateRunner,$rootElement,$sniffer,$$jqLite,$document){function filterCssClasses(classes){
//remove all the `ng-` stuff
return classes.replace(/\bng-\S+\b/g,"")}function getUniqueValues(a,b){return isString(a)&&(a=a.split(" ")),isString(b)&&(b=b.split(" ")),a.filter(function(val){return b.indexOf(val)===-1}).join(" ")}function prepareAnchoredAnimation(classes,outAnchor,inAnchor){function calculateAnchorStyles(anchor){var styles={},coords=getDomNode(anchor).getBoundingClientRect();
// we iterate directly since safari messes up and doesn't return
// all the keys for the coords object when iterated
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
// we also special case the doc fragment case because our unit test code
// appends the $rootElement to the body after the app has been bootstrapped
isDocumentFragment(rootNode)||bodyNode.contains(rootNode)?rootNode:bodyNode);return function(animationDetails){return animationDetails.from&&animationDetails.to?prepareFromToAnchorAnimation(animationDetails.from,animationDetails.to,animationDetails.classes,animationDetails.anchors):prepareRegularAnimation(animationDetails)}}]}],$$AnimateJsProvider=["$animateProvider",/** @this */function($animateProvider){this.$get=["$injector","$$AnimateRunner","$$jqLite",function($injector,$$AnimateRunner,$$jqLite){function lookupAnimations(classes){classes=isArray(classes)?classes:classes.split(" ");for(var matches=[],flagMap={},i=0;i<classes.length;i++){var klass=classes[i],animationFactory=$animateProvider.$$registeredAnimations[klass];animationFactory&&!flagMap[klass]&&(matches.push($injector.get(animationFactory)),flagMap[klass]=!0)}return matches}var applyAnimationClasses=applyAnimationClassesFactory($$jqLite);
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
3===arguments.length&&isObject(classes)&&(options=classes,classes=null),options=prepareAnimationOptions(options),classes||(classes=element.attr("class")||"",options.addClass&&(classes+=" "+options.addClass),options.removeClass&&(classes+=" "+options.removeClass));var before,after,classesToAdd=options.addClass,classesToRemove=options.removeClass,animations=lookupAnimations(classes);if(animations.length){var afterFn,beforeFn;"leave"===event?(beforeFn="leave",afterFn="afterLeave"):(beforeFn="before"+event.charAt(0).toUpperCase()+event.substr(1),afterFn=event),"enter"!==event&&"move"!==event&&(before=packageAnimations(element,event,options,animations,beforeFn)),after=packageAnimations(element,event,options,animations,afterFn)}
// no matching animations
if(before||after){var runner;return{$$willAnimate:!0,end:function(){return runner?runner.end():(close(),runner=new $$AnimateRunner,runner.complete(!0)),runner},start:function(){function onComplete(success){close(success),runner.complete(success)}function endAnimations(cancelled){animationClosed||((closeActiveAnimations||noop)(cancelled),onComplete(cancelled))}if(runner)return runner;runner=new $$AnimateRunner;var closeActiveAnimations,chain=[];return before&&chain.push(function(fn){closeActiveAnimations=before(fn)}),chain.length?chain.push(function(fn){applyOptions(),fn(!0)}):applyOptions(),after&&chain.push(function(fn){closeActiveAnimations=after(fn)}),runner.setHost({end:function(){endAnimations()},cancel:function(){endAnimations(!0)}}),$$AnimateRunner.chain(chain,onComplete),runner}}}}}]}],$$AnimateJsDriverProvider=["$$animationProvider",/** @this */function($$animationProvider){$$animationProvider.drivers.push("$$animateJsDriver"),this.$get=["$$animateJs","$$AnimateRunner",function($$animateJs,$$AnimateRunner){function prepareAnimation(animationDetails){
// TODO(matsko): make sure to check for grouped animations and delegate down to normal animations
var element=animationDetails.element,event=animationDetails.event,options=animationDetails.options,classes=animationDetails.classes;return $$animateJs(element,event,classes,options)}return function(animationDetails){if(animationDetails.from&&animationDetails.to){var fromAnimation=prepareAnimation(animationDetails.from),toAnimation=prepareAnimation(animationDetails.to);if(!fromAnimation&&!toAnimation)return;return{start:function(){function endFnFactory(){return function(){forEach(animationRunners,function(runner){
// at this point we cannot cancel animations for groups just yet. 1.5+
runner.end()})}}function done(status){runner.complete(status)}var animationRunners=[];fromAnimation&&animationRunners.push(fromAnimation.start()),toAnimation&&animationRunners.push(toAnimation.start()),$$AnimateRunner.all(animationRunners,done);var runner=new $$AnimateRunner({end:endFnFactory(),cancel:endFnFactory()});return runner}}}return prepareAnimation(animationDetails)}}]}],NG_ANIMATE_ATTR_NAME="data-ng-animate",NG_ANIMATE_PIN_DATA="$ngAnimatePin",$$AnimateQueueProvider=["$animateProvider",/** @this */function($animateProvider){function makeTruthyCssClassMap(classString){if(!classString)return null;var keys=classString.split(ONE_SPACE),map=Object.create(null);return forEach(keys,function(key){map[key]=!0}),map}function hasMatchingClasses(newClassString,currentClassString){if(newClassString&&currentClassString){var currentClassMap=makeTruthyCssClassMap(currentClassString);return newClassString.split(ONE_SPACE).some(function(className){return currentClassMap[className]})}}function isAllowed(ruleType,currentAnimation,previousAnimation){return rules[ruleType].some(function(fn){return fn(currentAnimation,previousAnimation)})}function hasAnimationClasses(animation,and){var a=(animation.addClass||"").length>0,b=(animation.removeClass||"").length>0;return and?a&&b:a||b}var PRE_DIGEST_STATE=1,RUNNING_STATE=2,ONE_SPACE=" ",rules=this.rules={skip:[],cancel:[],join:[]};rules.join.push(function(newAnimation,currentAnimation){
// if the new animation is class-based then we can just tack that on
return!newAnimation.structural&&hasAnimationClasses(newAnimation)}),rules.skip.push(function(newAnimation,currentAnimation){
// there is no need to animate anything if no classes are being added and
// there is no structural animation that will be triggered
return!newAnimation.structural&&!hasAnimationClasses(newAnimation)}),rules.skip.push(function(newAnimation,currentAnimation){
// why should we trigger a new structural animation if the element will
// be removed from the DOM anyway?
return"leave"===currentAnimation.event&&newAnimation.structural}),rules.skip.push(function(newAnimation,currentAnimation){
// if there is an ongoing current animation then don't even bother running the class-based animation
return currentAnimation.structural&&currentAnimation.state===RUNNING_STATE&&!newAnimation.structural}),rules.cancel.push(function(newAnimation,currentAnimation){
// there can never be two structural animations running at the same time
return currentAnimation.structural&&newAnimation.structural}),rules.cancel.push(function(newAnimation,currentAnimation){
// if the previous animation is already running, but the new animation will
// be triggered, but the new animation is structural
return currentAnimation.state===RUNNING_STATE&&newAnimation.structural}),rules.cancel.push(function(newAnimation,currentAnimation){
// cancel the animation if classes added / removed in both animation cancel each other out,
// but only if the current animation isn't structural
if(currentAnimation.structural)return!1;var nA=newAnimation.addClass,nR=newAnimation.removeClass,cA=currentAnimation.addClass,cR=currentAnimation.removeClass;
// early detection to save the global CPU shortage :)
// early detection to save the global CPU shortage :)
return!(isUndefined(nA)&&isUndefined(nR)||isUndefined(cA)&&isUndefined(cR))&&(hasMatchingClasses(nA,cR)||hasMatchingClasses(nR,cA))}),this.$get=["$$rAF","$rootScope","$rootElement","$document","$$Map","$$animation","$$AnimateRunner","$templateRequest","$$jqLite","$$forceReflow","$$isDocumentHidden",function($$rAF,$rootScope,$rootElement,$document,$$Map,$$animation,$$AnimateRunner,$templateRequest,$$jqLite,$$forceReflow,$$isDocumentHidden){function postDigestTaskFactory(){var postDigestCalled=!1;return function(fn){
// we only issue a call to postDigest before
// it has first passed. This prevents any callbacks
// from not firing once the animation has completed
// since it will be out of the digest cycle.
postDigestCalled?fn():$rootScope.$$postDigest(function(){postDigestCalled=!0,fn()})}}function normalizeAnimationDetails(element,animation){return mergeAnimationDetails(element,animation,{})}function findCallbacks(targetParentNode,targetNode,event){var matches=[],entries=callbackRegistry[event];return entries&&forEach(entries,function(entry){contains.call(entry.node,targetNode)?matches.push(entry.callback):"leave"===event&&contains.call(entry.node,targetParentNode)&&matches.push(entry.callback)}),matches}function filterFromRegistry(list,matchContainer,matchCallback){var containerNode=extractElementNode(matchContainer);return list.filter(function(entry){var isMatch=entry.node===containerNode&&(!matchCallback||entry.callback===matchCallback);return!isMatch})}function cleanupEventListeners(phase,node){"close"!==phase||node.parentNode||
// If the element is not attached to a parentNode, it has been removed by
// the domOperation, and we can safely remove the event callbacks
$animate.off(node)}function queueAnimation(originalElement,event,initialOptions){function notifyProgress(runner,event,phase,data){runInNextPostDigestOrNow(function(){var callbacks=findCallbacks(parentNode,node,event);callbacks.length?
// do not optimize this call here to RAF because
// we don't know how heavy the callback code here will
// be and if this code is buffered then this can
// lead to a performance regression.
$$rAF(function(){forEach(callbacks,function(callback){callback(element,phase,data)}),cleanupEventListeners(phase,node)}):cleanupEventListeners(phase,node)}),runner.progress(event,phase,data)}function close(reject){clearGeneratedClasses(element,options),applyAnimationClasses(element,options),applyAnimationStyles(element,options),options.domOperation(),runner.complete(!reject)}
// we always make a copy of the options since
// there should never be any side effects on
// the input data when running `$animateCss`.
var options=copy(initialOptions),element=stripCommentsFromElement(originalElement),node=getDomNode(element),parentNode=node&&node.parentNode;options=prepareAnimationOptions(options);
// we create a fake runner with a working promise.
// These methods will become available after the digest has passed
var runner=new $$AnimateRunner,runInNextPostDigestOrNow=postDigestTaskFactory();
// there are situations where a directive issues an animation for
// a jqLite wrapper that contains only comment nodes... If this
// happens then there is no way we can perform an animation
if(isArray(options.addClass)&&(options.addClass=options.addClass.join(" ")),options.addClass&&!isString(options.addClass)&&(options.addClass=null),isArray(options.removeClass)&&(options.removeClass=options.removeClass.join(" ")),options.removeClass&&!isString(options.removeClass)&&(options.removeClass=null),options.from&&!isObject(options.from)&&(options.from=null),options.to&&!isObject(options.to)&&(options.to=null),!node)return close(),runner;var className=[node.getAttribute("class"),options.addClass,options.removeClass].join(" ");if(!isAnimatableClassName(className))return close(),runner;var isStructural=["enter","move","leave"].indexOf(event)>=0,documentHidden=$$isDocumentHidden(),skipAnimations=!animationsEnabled||documentHidden||disabledElementsLookup.get(node),existingAnimation=!skipAnimations&&activeAnimationsLookup.get(node)||{},hasExistingAnimation=!!existingAnimation.state;if(
// there is no point in traversing the same collection of parent ancestors if a followup
// animation will be run on the same element that already did all that checking work
skipAnimations||hasExistingAnimation&&existingAnimation.state===PRE_DIGEST_STATE||(skipAnimations=!areAnimationsAllowed(node,parentNode,event)),skipAnimations)
// Callbacks should fire even if the document is hidden (regression fix for issue #14120)
return documentHidden&&notifyProgress(runner,event,"start"),close(),documentHidden&&notifyProgress(runner,event,"close"),runner;isStructural&&closeChildAnimations(node);var newAnimation={structural:isStructural,element:element,event:event,addClass:options.addClass,removeClass:options.removeClass,close:close,options:options,runner:runner};if(hasExistingAnimation){var skipAnimationFlag=isAllowed("skip",newAnimation,existingAnimation);if(skipAnimationFlag)return existingAnimation.state===RUNNING_STATE?(close(),runner):(mergeAnimationDetails(element,existingAnimation,newAnimation),existingAnimation.runner);var cancelAnimationFlag=isAllowed("cancel",newAnimation,existingAnimation);if(cancelAnimationFlag)if(existingAnimation.state===RUNNING_STATE)
// this will end the animation right away and it is safe
// to do so since the animation is already running and the
// runner callback code will run in async
existingAnimation.runner.end();else{if(!existingAnimation.structural)
// this will merge the new animation options into existing animation options
return mergeAnimationDetails(element,existingAnimation,newAnimation),existingAnimation.runner;
// this means that the animation is queued into a digest, but
// hasn't started yet. Therefore it is safe to run the close
// method which will call the runner methods in async.
existingAnimation.close()}else{
// a joined animation means that this animation will take over the existing one
// so an example would involve a leave animation taking over an enter. Then when
// the postDigest kicks in the enter will be ignored.
var joinAnimationFlag=isAllowed("join",newAnimation,existingAnimation);if(joinAnimationFlag){if(existingAnimation.state!==RUNNING_STATE)
//we return the same runner since only the option values of this animation will
//be fed into the `existingAnimation`.
return applyGeneratedPreparationClasses(element,isStructural?event:null,options),event=newAnimation.event=existingAnimation.event,options=mergeAnimationDetails(element,existingAnimation,newAnimation),existingAnimation.runner;normalizeAnimationDetails(element,newAnimation)}}}else
// normalization in this case means that it removes redundant CSS classes that
// already exist (addClass) or do not exist (removeClass) on the element
normalizeAnimationDetails(element,newAnimation);
// when the options are merged and cleaned up we may end up not having to do
// an animation at all, therefore we should check this before issuing a post
// digest callback. Structural animations will always run no matter what.
var isValidAnimation=newAnimation.structural;if(isValidAnimation||(
// animate (from/to) can be quickly checked first, otherwise we check if any classes are present
isValidAnimation="animate"===newAnimation.event&&Object.keys(newAnimation.options.to||{}).length>0||hasAnimationClasses(newAnimation)),!isValidAnimation)return close(),clearElementAnimationState(node),runner;
// the counter keeps track of cancelled animations
var counter=(existingAnimation.counter||0)+1;return newAnimation.counter=counter,markElementAnimationState(node,PRE_DIGEST_STATE,newAnimation),$rootScope.$$postDigest(function(){
// It is possible that the DOM nodes inside `originalElement` have been replaced. This can
// happen if the animated element is a transcluded clone and also has a `templateUrl`
// directive on it. Therefore, we must recreate `element` in order to interact with the
// actual DOM nodes.
// Note: We still need to use the old `node` for certain things, such as looking up in
//       HashMaps where it was used as the key.
element=stripCommentsFromElement(originalElement);var animationDetails=activeAnimationsLookup.get(node),animationCancelled=!animationDetails;animationDetails=animationDetails||{};
// if addClass/removeClass is called before something like enter then the
// registered parent element may not be present. The code below will ensure
// that a final value for parent element is obtained
var parentElement=element.parent()||[],isValidAnimation=parentElement.length>0&&("animate"===animationDetails.event||animationDetails.structural||hasAnimationClasses(animationDetails));
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
return animationCancelled&&(applyAnimationClasses(element,options),applyAnimationStyles(element,options)),(animationCancelled||isStructural&&animationDetails.event!==event)&&(options.domOperation(),runner.end()),void(isValidAnimation||clearElementAnimationState(node));
// this combined multiple class to addClass / removeClass into a setClass event
// so long as a structural event did not take over the animation
event=!animationDetails.structural&&hasAnimationClasses(animationDetails,!0)?"setClass":animationDetails.event,markElementAnimationState(node,RUNNING_STATE);var realRunner=$$animation(element,event,animationDetails.options);
// this will update the runner's flow-control events based on
// the `realRunner` object.
runner.setHost(realRunner),notifyProgress(runner,event,"start",{}),realRunner.done(function(status){close(!status);var animationDetails=activeAnimationsLookup.get(node);animationDetails&&animationDetails.counter===counter&&clearElementAnimationState(node),notifyProgress(runner,event,"close",{})})}),runner}function closeChildAnimations(node){var children=node.querySelectorAll("["+NG_ANIMATE_ATTR_NAME+"]");forEach(children,function(child){var state=parseInt(child.getAttribute(NG_ANIMATE_ATTR_NAME),10),animationDetails=activeAnimationsLookup.get(child);if(animationDetails)switch(state){case RUNNING_STATE:animationDetails.runner.end();/* falls through */
case PRE_DIGEST_STATE:activeAnimationsLookup["delete"](child)}})}function clearElementAnimationState(node){node.removeAttribute(NG_ANIMATE_ATTR_NAME),activeAnimationsLookup["delete"](node)}/**
     * This fn returns false if any of the following is true:
     * a) animations on any parent element are disabled, and animations on the element aren't explicitly allowed
     * b) a parent element has an ongoing structural animation, and animateChildren is false
     * c) the element is not a child of the body
     * d) the element is not a child of the $rootElement
     */
function areAnimationsAllowed(node,parentNode,event){var animateChildren,bodyNode=$document[0].body,rootNode=getDomNode($rootElement),bodyNodeDetected=node===bodyNode||"HTML"===node.nodeName,rootNodeDetected=node===rootNode,parentAnimationDetected=!1,elementDisabled=disabledElementsLookup.get(node),parentHost=jqLite.data(node,NG_ANIMATE_PIN_DATA);for(parentHost&&(parentNode=getDomNode(parentHost));parentNode&&(rootNodeDetected||(
// angular doesn't want to attempt to animate elements outside of the application
// therefore we need to ensure that the rootElement is an ancestor of the current element
rootNodeDetected=parentNode===rootNode),parentNode.nodeType===ELEMENT_NODE);){var details=activeAnimationsLookup.get(parentNode)||{};
// either an enter, leave or move animation will commence
// therefore we can't allow any animations to take place
// but if a parent animation is class-based then that's ok
if(!parentAnimationDetected){var parentNodeDisabled=disabledElementsLookup.get(parentNode);if(parentNodeDisabled===!0&&elementDisabled!==!1){
// disable animations if the user hasn't explicitly enabled animations on the
// current element
elementDisabled=!0;
// element is disabled via parent element, no need to check anything else
break}parentNodeDisabled===!1&&(elementDisabled=!1),parentAnimationDetected=details.structural}if(isUndefined(animateChildren)||animateChildren===!0){var value=jqLite.data(parentNode,NG_ANIMATE_CHILDREN_DATA);isDefined(value)&&(animateChildren=value)}
// there is no need to continue traversing at this point
if(parentAnimationDetected&&animateChildren===!1)break;if(bodyNodeDetected||(
// we also need to ensure that the element is or will be a part of the body element
// otherwise it is pointless to even issue an animation to be rendered
bodyNodeDetected=parentNode===bodyNode),bodyNodeDetected&&rootNodeDetected)
// If both body and root have been found, any other checks are pointless,
// as no animation data should live outside the application
break;parentNode=rootNodeDetected||
// If `rootNode` is not detected, check if `parentNode` is pinned to another element
!(parentHost=jqLite.data(parentNode,NG_ANIMATE_PIN_DATA))?parentNode.parentNode:getDomNode(parentHost)}var allowAnimation=(!parentAnimationDetected||animateChildren)&&elementDisabled!==!0;return allowAnimation&&rootNodeDetected&&bodyNodeDetected}function markElementAnimationState(node,state,details){details=details||{},details.state=state,node.setAttribute(NG_ANIMATE_ATTR_NAME,state);var oldValue=activeAnimationsLookup.get(node),newValue=oldValue?extend(oldValue,details):details;activeAnimationsLookup.set(node,newValue)}var activeAnimationsLookup=new $$Map,disabledElementsLookup=new $$Map,animationsEnabled=null,deregisterWatch=$rootScope.$watch(function(){return 0===$templateRequest.totalPendingRequests},function(isEmpty){isEmpty&&(deregisterWatch(),
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
null===animationsEnabled&&(animationsEnabled=!0)})}))}),callbackRegistry=Object.create(null),classNameFilter=$animateProvider.classNameFilter(),isAnimatableClassName=classNameFilter?function(className){return classNameFilter.test(className)}:function(){return!0},applyAnimationClasses=applyAnimationClassesFactory($$jqLite),contains=window.Node.prototype.contains||/** @this */function(arg){
// eslint-disable-next-line no-bitwise
return this===arg||!!(16&this.compareDocumentPosition(arg))},$animate={on:function(event,container,callback){var node=extractElementNode(container);callbackRegistry[event]=callbackRegistry[event]||[],callbackRegistry[event].push({node:node,callback:callback}),
// Remove the callback when the element is removed from the DOM
jqLite(container).on("$destroy",function(){var animationDetails=activeAnimationsLookup.get(node);animationDetails||
// If there's an animation ongoing, the callback calling code will remove
// the event listeners. If we'd remove here, the callbacks would be removed
// before the animation ends
$animate.off(event,container,callback)})},off:function(event,container,callback){if(1!==arguments.length||isString(arguments[0])){var entries=callbackRegistry[event];entries&&(callbackRegistry[event]=1===arguments.length?null:filterFromRegistry(entries,container,callback))}else{container=arguments[0];for(var eventType in callbackRegistry)callbackRegistry[eventType]=filterFromRegistry(callbackRegistry[eventType],container)}},pin:function(element,parentElement){assertArg(isElement(element),"element","not an element"),assertArg(isElement(parentElement),"parentElement","not an element"),element.data(NG_ANIMATE_PIN_DATA,parentElement)},push:function(element,event,options,domOperation){return options=options||{},options.domOperation=domOperation,queueAnimation(element,event,options)},
// this method has four signatures:
//  () - global getter
//  (bool) - global setter
//  (element) - element getter
//  (element, bool) - element setter<F37>
enabled:function(element,bool){var argCount=arguments.length;if(0===argCount)
// () - Global getter
bool=!!animationsEnabled;else{var hasElement=isElement(element);if(hasElement){var node=getDomNode(element);1===argCount?
// (element) - Element getter
bool=!disabledElementsLookup.get(node):
// (element, bool) - Element setter
disabledElementsLookup.set(node,!bool)}else
// (bool) - Global setter
bool=animationsEnabled=!!element}return bool}};return $animate}]}],$$AnimationProvider=["$animateProvider",/** @this */function($animateProvider){function setRunner(element,runner){element.data(RUNNER_STORAGE_KEY,runner)}function removeRunner(element){element.removeData(RUNNER_STORAGE_KEY)}function getRunner(element){return element.data(RUNNER_STORAGE_KEY)}var NG_ANIMATE_REF_ATTR="ng-animate-ref",drivers=this.drivers=[],RUNNER_STORAGE_KEY="$$animationRunner";this.$get=["$$jqLite","$rootScope","$injector","$$AnimateRunner","$$Map","$$rAFScheduler",function($$jqLite,$rootScope,$injector,$$AnimateRunner,$$Map,$$rAFScheduler){function sortAnimations(animations){function processNode(entry){if(entry.processed)return entry;entry.processed=!0;var elementNode=entry.domNode,parentNode=elementNode.parentNode;lookup.set(elementNode,entry);for(var parentEntry;parentNode;){if(parentEntry=lookup.get(parentNode)){parentEntry.processed||(parentEntry=processNode(parentEntry));break}parentNode=parentNode.parentNode}return(parentEntry||tree).children.push(entry),entry}function flatten(tree){var i,result=[],queue=[];for(i=0;i<tree.children.length;i++)queue.push(tree.children[i]);var remainingLevelEntries=queue.length,nextLevelEntries=0,row=[];for(i=0;i<queue.length;i++){var entry=queue[i];remainingLevelEntries<=0&&(remainingLevelEntries=nextLevelEntries,nextLevelEntries=0,result.push(row),row=[]),row.push(entry.fn),entry.children.forEach(function(childEntry){nextLevelEntries++,queue.push(childEntry)}),remainingLevelEntries--}return row.length&&result.push(row),result}var i,tree={children:[]},lookup=new $$Map;
// this is done first beforehand so that the map
// is filled with a list of the elements that will be animated
for(i=0;i<animations.length;i++){var animation=animations[i];lookup.set(animation.domNode,animations[i]={domNode:animation.domNode,fn:animation.fn,children:[]})}for(i=0;i<animations.length;i++)processNode(animations[i]);return flatten(tree)}var animationQueue=[],applyAnimationClasses=applyAnimationClassesFactory($$jqLite);
// TODO(matsko): document the signature in a better way
return function(element,event,options){
// TODO(matsko): change to reference nodes
function getAnchorNodes(node){var SELECTOR="["+NG_ANIMATE_REF_ATTR+"]",items=node.hasAttribute(NG_ANIMATE_REF_ATTR)?[node]:node.querySelectorAll(SELECTOR),anchors=[];return forEach(items,function(node){var attr=node.getAttribute(NG_ANIMATE_REF_ATTR);attr&&attr.length&&anchors.push(node)}),anchors}function groupAnimations(animations){var preparedAnimations=[],refLookup={};forEach(animations,function(animation,index){var element=animation.element,node=getDomNode(element),event=animation.event,enterOrMove=["enter","move"].indexOf(event)>=0,anchorNodes=animation.structural?getAnchorNodes(node):[];if(anchorNodes.length){var direction=enterOrMove?"to":"from";forEach(anchorNodes,function(anchor){var key=anchor.getAttribute(NG_ANIMATE_REF_ATTR);refLookup[key]=refLookup[key]||{},refLookup[key][direction]={animationID:index,element:jqLite(anchor)}})}else preparedAnimations.push(animation)});var usedIndicesLookup={},anchorGroups={};return forEach(refLookup,function(operations,key){var from=operations.from,to=operations.to;if(!from||!to){
// only one of these is set therefore we can't have an
// anchor animation since all three pieces are required
var index=from?from.animationID:to.animationID,indexKey=index.toString();return void(usedIndicesLookup[indexKey]||(usedIndicesLookup[indexKey]=!0,preparedAnimations.push(animations[index])))}var fromAnimation=animations[from.animationID],toAnimation=animations[to.animationID],lookupKey=from.animationID.toString();if(!anchorGroups[lookupKey]){var group=anchorGroups[lookupKey]={structural:!0,beforeStart:function(){fromAnimation.beforeStart(),toAnimation.beforeStart()},close:function(){fromAnimation.close(),toAnimation.close()},classes:cssClassesIntersection(fromAnimation.classes,toAnimation.classes),from:fromAnimation,to:toAnimation,anchors:[]};
// the anchor animations require that the from and to elements both have at least
// one shared CSS class which effectively marries the two elements together to use
// the same animation driver and to properly sequence the anchor animation.
group.classes.length?preparedAnimations.push(group):(preparedAnimations.push(fromAnimation),preparedAnimations.push(toAnimation))}anchorGroups[lookupKey].anchors.push({out:from.element,"in":to.element})}),preparedAnimations}function cssClassesIntersection(a,b){a=a.split(" "),b=b.split(" ");for(var matches=[],i=0;i<a.length;i++){var aa=a[i];if("ng-"!==aa.substring(0,3))for(var j=0;j<b.length;j++)if(aa===b[j]){matches.push(aa);break}}return matches.join(" ")}function invokeFirstDriver(animationDetails){
// we loop in reverse order since the more general drivers (like CSS and JS)
// may attempt more elements, but custom drivers are more particular
for(var i=drivers.length-1;i>=0;i--){var driverName=drivers[i],factory=$injector.get(driverName),driver=factory(animationDetails);if(driver)return driver}}function beforeStart(){element.addClass(NG_ANIMATE_CLASSNAME),tempClasses&&$$jqLite.addClass(element,tempClasses),prepareClassName&&($$jqLite.removeClass(element,prepareClassName),prepareClassName=null)}function updateAnimationRunners(animation,newRunner){function update(element){var runner=getRunner(element);runner&&runner.setHost(newRunner)}animation.from&&animation.to?(update(animation.from.element),update(animation.to.element)):update(animation.element)}function handleDestroyedElement(){var runner=getRunner(element);!runner||"leave"===event&&options.$$domOperationFired||runner.end()}function close(rejected){element.off("$destroy",handleDestroyedElement),removeRunner(element),applyAnimationClasses(element,options),applyAnimationStyles(element,options),options.domOperation(),tempClasses&&$$jqLite.removeClass(element,tempClasses),element.removeClass(NG_ANIMATE_CLASSNAME),runner.complete(!rejected)}options=prepareAnimationOptions(options);var isStructural=["enter","move","leave"].indexOf(event)>=0,runner=new $$AnimateRunner({end:function(){close()},cancel:function(){close(!0)}});if(!drivers.length)return close(),runner;setRunner(element,runner);var classes=mergeClasses(element.attr("class"),mergeClasses(options.addClass,options.removeClass)),tempClasses=options.tempClasses;tempClasses&&(classes+=" "+tempClasses,options.tempClasses=null);var prepareClassName;
// we only want there to be one function called within the post digest
// block. This way we can group animations for all the animations that
// were apart of the same postDigest flush call.
// we only want there to be one function called within the post digest
// block. This way we can group animations for all the animations that
// were apart of the same postDigest flush call.
return isStructural&&(prepareClassName="ng-"+event+PREPARE_CLASS_SUFFIX,$$jqLite.addClass(element,prepareClassName)),animationQueue.push({
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
$$rAFScheduler(sortAnimations(toBeSortedAnimations))}),runner)}}]}],ngAnimateSwapDirective=["$animate","$rootScope",function($animate,$rootScope){return{restrict:"A",transclude:"element",terminal:!0,priority:600,// we use 600 here to ensure that the directive is caught before others
link:function(scope,$element,attrs,ctrl,$transclude){var previousElement,previousScope;scope.$watchCollection(attrs.ngAnimateSwap||attrs["for"],function(value){previousElement&&$animate.leave(previousElement),previousScope&&(previousScope.$destroy(),previousScope=null),(value||0===value)&&(previousScope=scope.$new(),$transclude(previousScope,function(element){previousElement=element,$animate.enter(element,null,$element)}))})}}}];/**
 * @ngdoc service
 * @name $animate
 * @kind object
 *
 * @description
 * The ngAnimate `$animate` service documentation is the same for the core `$animate` service.
 *
 * Click here {@link ng.$animate to learn more about animations with `$animate`}.
 */
angular.module("ngAnimate",[],function(){
// Access helpers from angular core.
// Do it inside a `config` block to ensure `window.angular` is available.
noop=angular.noop,copy=angular.copy,extend=angular.extend,jqLite=angular.element,forEach=angular.forEach,isArray=angular.isArray,isString=angular.isString,isObject=angular.isObject,isUndefined=angular.isUndefined,isDefined=angular.isDefined,isFunction=angular.isFunction,isElement=angular.isElement}).info({angularVersion:"1.6.4"}).directive("ngAnimateSwap",ngAnimateSwapDirective).directive("ngAnimateChildren",$$AnimateChildrenDirective).factory("$$rAFScheduler",$$rAFSchedulerFactory).provider("$$animateQueue",$$AnimateQueueProvider).provider("$$animation",$$AnimationProvider).provider("$animateCss",$AnimateCssProvider).provider("$$animateCssDriver",$$AnimateCssDriverProvider).provider("$$animateJs",$$AnimateJsProvider).provider("$$animateJsDriver",$$AnimateJsDriverProvider)}(window,window.angular);