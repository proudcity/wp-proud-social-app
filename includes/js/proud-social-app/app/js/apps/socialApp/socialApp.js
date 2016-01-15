'use strict';

angular.module('socialApp', [
  'iso.directives',
  'ngResource',
  'ngSanitize',
])

.run(
  [          '$rootScope', '$window', 
    function ($rootScope,   $window) {
      $rootScope.socialApi = _.get(Proud, 'settings.proud_social_app.socialApi') || 'http://45.55.8.62:8080/api/';
      $rootScope.socialUser = _.get(Proud, 'settings.proud_social_app.social_user') || 'newyork_ny';
    }
  ]
)

// See https://www.wikipedia.com/services/api/wikipedia.photos.search.html
// Photo url documentation: https://www.wikipedia.com/services/api/misc.urls.html
.factory('SocialFeed', ['$resource', '$rootScope', function ($resource, $rootScope) {
  var baseUrl = $rootScope.socialApi + '/' + $rootScope.socialUser + '/feed'
  return {
    getFeed: function() {
      return $resource(baseUrl, {
        format: 'json',
        action: 'query',
        callback: 'JSON_CALLBACK'
      }, { 
        'query': {
          cache : true,
          method: 'GET',
          isArray: true
        }
      });
    },
    getAgency: function() {
      return $resource($rootScope.socialApi + '/:userId/feed/:agency', {
       format: 'json',
        action: 'query',
        callback: 'JSON_CALLBACK'
      }, { 
        'query': {
          cache : true,
          method: 'GET',
          isArray: true
        }
      });
    },
    getSingle: function() {
      return $resource($rootScope.socialApi + '/:userId/feed/', {
       format: 'json',
        action: 'query',
        callback: 'JSON_CALLBACK'
      }, { 
        'query': {
          cache : true,
          method: 'GET',
          isArray: true
        }
      });
    },
  }
}])

.filter('parseUrlFilter', function () {
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
    var hashPattern = /(^|\s)#(\w*[a-zA-Z_]+\w*)/gim;
    var mentionPattern =  /(^|\s)\@(\w*[a-zA-Z_]+\w*)/gim;
    return function (text, target, service) {
      var replacedText = text 
                       ? text.replace(urlPattern, '<a target="' + target + '" href="$&">$&</a>')
                       : text;
      if(replacedText) {
        if(service === 'twitter'){
            // replace #hashtags and send them to twitter
            replacedText = replacedText.replace(hashPattern, '$1<a class="hashtag" href="https://twitter.com/search?q=%23$2" target="' + target + '">#$2</a>');
            replacedText = replacedText.replace(mentionPattern, '$1<a class="hashtag" href="https://twitter.com/$2" target="' + target + '">@$2</a>');
        } 
        else if(service === 'instagram'){
            replacedText = replacedText.replace(hashPattern, '$1<a class="hashtag" href="https://instagram.com/explore/tags/$2" target="' + target + '">#$2</a>');
            replacedText = replacedText.replace(mentionPattern, '$1<a class="hashtag" href="https://instagram.com/$2" target="' + target + '">@$2</a>');

        }
        else if(service === 'facebook'){
            replacedText = replacedText.replace(hashPattern, '$1<a class="hashtag" href="https://facebook.com/hashtag/$2" target="' + target + '">#$2</a>');
        }
      }
      return replacedText;
    };
})

.controller('SocialController', ['$scope', 'SocialFeed', '$filter', '$sce', '$rootScope', 
                         function($scope,   SocialFeed,   $filter,   $sce,   $rootScope){

  $scope.inited = false;

  // Get app settings
  var appSettings = _.get(Proud, 'settings.proud_social_app.' + $rootScope.appId);

  var services = {
    'facebook': {name: 'Facebook', icon: 'fa-facebook-square'},
    'twitter': {name: 'Twitter', icon: 'fa-twitter-square'},
    'youtube': {name: 'Youtube', icon: 'fa-youtube-play'},
    'instagram': {name: 'Instagram', icon: 'fa-instagram'},
    'ical': {'name':  'iCal', 'icon':  'fa-calendar'},
    'rss': {'name':  'RSS Feed', 'icon':  'fa-rss'}
  };

  // if(_.has(settings, 'agencies') && settings.agencies.length) {
  //   citySocial = settings.city + '_' + settings.state_short;
  //   citySocial = citySocial.toLowerCase().replace(' ', '');
  // }

  this.serviceFeed = function() {
    this.userFeed.query({
      'services[]': $scope.activeServices == 'all' ? _.keys(services) : [$scope.activeServices],
      limit: limit
    }, function(data) {
      // First time through, find available services
      if(!$scope.inited) {
        var active = [];
        _.map(data, function(item) {
          active = _.union(active, [item.service]);
        });
        _.map(services, function(service, key) {
          if(_.contains(active, key)) {
            services[key].active = true;
          }
        });
        $scope.services = services;
      }
      // Set data
      $scope.social = _.slice(
                    this.preSort 
                      ? _.chain(data).sortBy('date').reverse().value()
                      : data
                    , 0, limit);
      $scope.inited = true;
      callback();
    });
  }

  // Toggle social source
  $scope.switchService = function(service, limit, callback) {
    var isActive = $scope.isServiceActive(service),
        runQuery = false,
        callback = callback || function() {},
        limit    = limit || 20;

    // switch active
    if($scope.inited && !isActive) {
      $scope.activeServices = service;
      runQuery = true;
    }
    // Run the query
    if(runQuery || !$scope.inited) {
      if($scope.socialAccount == 'custom') {
      }
    }
    return false;
  };

  $scope.initVars = function($attributes) {
    $scope.socialAccount = $attributes.socialAccount || 'all';
    if($scope.socialAccount == 'custom') {
      $scope.activeServices = $attributes.socialActiveServices || 'all';
      this.userFeed = SocialFeed.getSingle();
    }
    else {
      $scope.activeServices = $attributes.socialActiveServices || 'all';
      this.userFeed = SocialFeed.getFeed();
    }
    $scope.socialPostCount    = $attributes.socialPostCount || 20;
    $scope.socialHideControls = $attributes.socialHideControls || false;
    $scope.socialStaticCols   = $attributes.socialStaticCols || 3;
    this.preSort = true;
  }

  $scope.setPreSort = function(sort) {
    this.preSort = sort;
  }

  $scope.isServiceActive = function(service) {
    return $scope.activeServices == service;
  }

  $scope.showServiceTab = function(service) {
    return $scope.services[service].active;
  }

  $scope.recent = function() {
    $scope.container.isotope({sortBy : 'date'});
  }

  $scope.shuffle = function() {
    $scope.$emit('iso-method', {name:'shuffle', params:null});
  }

  $scope.getPublishedDate = function(date) {
    return new Date(date).getTime();
  }

  $scope.getPostUrl = function(item) {
    switch(item.service) {
      case 'facebook':
        var url = 'http://facebook.com/' + item.account;
        return item.id
             ? url + '/posts/' + item.id.substring((item.id.indexOf('_') + 1))
             : url;
        break;
      
      default:
        return item.url;
        break;
    }
  }

  $scope.toSafe = function(text, service) {
    return $sce.trustAsHtml($filter('parseUrlFilter')(text, '_blank', service));
  }

}])


// Isotope social wall
.directive('socialWall', function factory($window, $browser, $http, $timeout) {
  return {
    restrict: 'A',
    controller: "SocialController",
    templateUrl: 'views/apps/socialApp/social.html',
    link: function($scope, $element, $attributes) {
      // Init vars
      $scope.initVars($attributes);
      $scope.setPreSort(true);

      // call init
      if(!$scope.inited) {
        $scope.switchService(null, $scope.socialPostCount);
      }

      // Grab container jquery ref
      $scope.container = $element.children('[isotope-container]');

      // Watch social
      $scope.$watch('social', function(value) {
        if(!$scope.inited) {
          $scope.container.isotope({
            getSortData : {
              date: function($elem) {
                return $elem.data('date');
              }
            }
          });
        }
        if($scope.social) {
          $timeout(function() {
            var imgLoad = imagesLoaded($element);
            imgLoad.on('always', function( instance ) {
              
              //$scope.$emit('iso-option', {sortBy : 'date'});
              $scope.container.isotope({sortBy : 'date', sortAscending: false});
              // $scope.refreshIso();
              // 
            });
          }, 0);
        }
      });
    }
  }
})

// Simple social timeline
.directive('socialStatic', function factory($window, $browser, $http, $timeout) {
  return {
    restrict: 'A',
    controller: "SocialController",
    templateUrl: 'views/apps/socialApp/social-static.html',
    link: function($scope, $element, $attributes) {
      // Init vars
      $scope.initVars($attributes);

      var columnClasses = 'card-columns-xs-1'
      if($scope.socialStaticCols > 1) {
        columnClasses += ' card-columns-sm-2';
      }
      if($scope.socialStaticCols > 2) {
        columnClasses += ' card-columns-md-3';
      }
      if($scope.socialStaticCols > 3) {
        columnClasses += ' card-columns-lg-' + $scope.socialStaticCols;
      }
      $scope.columnClasses = columnClasses;
      $scope.setPreSort(true);

      // call init
      if(!$scope.inited) {
        $scope.switchService(null, $scope.socialPostCount);
      }
    }
  }
})



// Simple social timeline
.directive('socialTimeline', function factory($window, $browser, $http, $timeout) {
  return {
    restrict: 'A',
    controller: "SocialController",
    templateUrl: 'views/apps/socialApp/social-timeline.html',
    link: function($scope, $element, $attributes) {
      // Init vars
      $scope.initVars($attributes);

      // so we can switch right/left ordering on tab change
      $scope.oddEvenSwitch = 0;
      $scope.timelineSwitchService = function(service) {
        
        $scope.switchService(service, $scope.socialPostCount, function() {
          $scope.oddEvenSwitch = $scope.oddEvenSwitch ? 0 : 1;
        });
      }

      // call init
      if(!$scope.inited) {
        $scope.switchService(null, $scope.socialPostCount);
      }
    }
  }
})

