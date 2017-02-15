'use strict';

angular.module('socialApp', [
  // 'iso.directives',
  'ngResource',
  'ngSanitize',
  'dynamicLayout',
  'readMore'
])

.run(
  [          '$rootScope', '$window', 
    function ($rootScope,   $window) {
      $rootScope.socialApi = _.get(Proud, 'settings.proud_social_app.socialApi') || 'https://feeds.proudcity.com/api/';
      var user = _.get(Proud, 'settings.global.location.city') || '';
      if(user) {
        user += ', ' + _.get(Proud, 'settings.global.location.state') || '';
        user = user.replace(/ /g, '_');
      }
      $rootScope.socialUser = user || 'West_Carrollton,_Ohio';
    }
  ]
)

// See https://www.wikipedia.com/services/api/wikipedia.photos.search.html
// Photo url documentation: https://www.wikipedia.com/services/api/misc.urls.html
.factory('SocialFeed', ['$resource', '$rootScope', function ($resource, $rootScope) {
  var baseUrl = $rootScope.socialApi + '/' + $rootScope.socialUser + '/feed';
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
    getCustomFeed: function(accounts) {
      return $resource(baseUrl + '/accounts/' + accounts, {
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
    }
  }
}])

.filter('parseSocialText', function () {
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

.controller('SocialController', ['$scope', 'SocialFeed', '$filter', '$sce', '$rootScope', '$timeout', 
                         function($scope,   SocialFeed,   $filter,   $sce,   $rootScope ,  $timeout){
  var self = this;
  $scope.inited = false;

  // Get app settings

  var appSettings = _.get(Proud, 'settings.proud_social_app.instances.' + $rootScope.appId);

  // Make defaults
  self.appServices = {
    'facebook': {name: 'Facebook', icon: 'fa-facebook-square'},
    'twitter': {name: 'Twitter', icon: 'fa-twitter-square'},
    'youtube': {name: 'Youtube', icon: 'fa-youtube-play'},
    'instagram': {name: 'Instagram', icon: 'fa-instagram'},
    'ical': {'name':  'iCal', 'icon':  'fa-calendar'},
    'rss': {'name':  'RSS Feed', 'icon':  'fa-rss'}
  };

  // Inits vars with directives
  $scope.initVars = function($attributes) {
    // We have custom account settings
    if($attributes.socialAccountsCustom) {
      var accounts = encodeURIComponent(_.values($scope.$eval($attributes.socialAccountsCustom)).join());
      self.userFeed = SocialFeed.getCustomFeed(accounts);
    }
    else {
      // We have services settings ?
      var services = $scope.$eval($attributes.socialActiveServices);
      // reduce master list
      if(_.isArray(services)) {
        self.appServices = _.pick(self.appServices, function(service, key) {
          return _.contains($attributes.socialActiveServices, key);
        });
      }
    }
    // Default feed
    if(!self.userFeed) {
      self.userFeed = SocialFeed.getFeed();
    }
    // Get other options
    $scope.socialPostCount    = $attributes.socialPostCount || 20;
    $scope.socialHideControls = $attributes.socialHideControls || false;
    $scope.socialStaticCols   = $attributes.socialStaticCols || 3;
    self.preSort = true;
    $scope.activeServices = 'all';
  }

  // Applies a active flag to services 
  // that are present in inital query
  self.applyActiveServices = function(data) {
    // Init holder vars
    var active = [];
    // Find services in result
    _.map(data, function(item, key) {
      active = _.union(active, [item.service]);
    });
    // Run through appServices, 
    _.map(self.appServices, function(service, key) {
      if(_.contains(active, key)) {
       self.appServices[key].active = true;
      }
    });
    $scope.services = self.appServices;
  }

  // Runs through and processes images once they are loaded
  self.calculateAspectRatios = function(social, callback) {
    var imageCount = {};

    // Checks if we're still in the queue
    function imagesChecker(key) {
      delete imageCount[key];
      // Finished with images
      if(!_.size(imageCount)) {
        callback(social);
      }
    }

    _.map(social, function(item, key) {
      // Add template file
      social[key]['template'] = 'views/apps/socialApp/default-card-style.html';
      // Adding to queue
      imageCount[key] = true;
      if(item.image) {
        // Create new offscreen image to test
        var theImage = new Image();
        theImage.src = item.image;
  
        // Allow for errors
        theImage.onerror = function() {
           imagesChecker(key);
        };

        // Get accurate measurements from that.
        theImage.addEventListener('load', function () { 
          var loaded = true;
          if(this.naturalWidth >= this.naturalHeight ) {
            social[key].styleAttr = (this.naturalHeight / this.naturalWidth * 100);
          }
          else {
            social[key].styleAttr = 100;
            social[key].imgStyleAttr = ((this.naturalHeight / this.naturalWidth * 100) - 100)/3;
          }
          imagesChecker(key);
        }, true);
      }
      else {
        setTimeout(function () {
          imagesChecker(key);
        }, 1);
      }
    });
  }

  // Calls feed with parameter
  self.serviceFeed = function(service, limit, callback) {
    var params = {
      'services[]': $scope.activeServices == 'all' ? _.keys(self.appServices) : $scope.activeServices,
      limit: limit
    };
    self.userFeed.query(params, function(data) {
      // First time through, find available services
      if(!$scope.inited) {
        self.applyActiveServices(data);
      }
      // Sort / limit data
      data = _.slice(
                self.preSort 
                ? _.chain(data).sortBy('date').reverse().value()
                : data
            ,0, limit);
      // Load our images, calculate ratios
      self.calculateAspectRatios(data, function() {
        $scope.inited = true;
        callback(data);
      });
    });
  }

  // Toggle social source
  $scope.switchService = function(event, service, limit, callback) {
    // First reset
    $scope.social = [];
    // init default callback
    callback = callback || function() {};
    if(event) {
      event.preventDefault();  
    }
    var isActive = $scope.isServiceActive(service),
        runQuery = false,
        callback = callback || function() {},
        limit    = limit || $scope.socialPostCount;

    // switch active
    if($scope.inited && !isActive) {
      $scope.activeServices = service;
      runQuery = true;
    }
    // Run the query
    if(runQuery || !$scope.inited) {
      self.serviceFeed(service, limit, function(data) {
        callback();
        // Set data after exiting digest loop
        $timeout(function() {
          $scope.social = data;
        });
      });
    }
  };

  // We pre-sorting?
  $scope.setPreSort = function(sort) {
    self.preSort = sort;
  }

  // Is tab active service?
  $scope.isServiceActive = function(service) {
    return $scope.activeServices == service;
  }

  // Should the tab appear?
  $scope.showServiceTab = function(service) {
    return $scope.services[service].active;
  }

  // Sorts by recent
  $scope.recent = function() {
    $timeout(function() {
      $scope.container.isotope({sortBy : 'date'});
    });
  }

  // Shuffles order
  $scope.shuffle = function() {
    $timeout(function() {
      $scope.$emit('iso-method', {name:'shuffle', params:null});
    });
  }

  // Returns date time in proper format;
  $scope.getPublishedDate = function(date) {
    return new Date(date).getTime();
  }

  $scope.getAccountUrl = function(item) {
    switch(item.service) {
      case 'facebook':
        return 'https://www.facebook.com/' + item.account

      case 'twitter':
        return 'https://twitter.com/' + item.account;

      case 'youtube':
        return 'https://www.youtube.com/user/' + item.account

      case 'instagram':
        return 'https://www.instagram.com/' + item.account
    }
  }

  $scope.getAccountTitle = function(item) {
    // If facebook and the account doesn't have a clean URL
    if(item.service == 'facebook' && item.account && !isNaN(item.account)) {
      return item.agencyName;
    }
    else {
      return item.match;
    }
  }

  // Gets post URL from item
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
    return $sce.trustAsHtml($filter('parseSocialText')(text, '_blank', service));
  }

}])


// Isotope social wall
.directive('socialWall', function factory($window, $rootScope, $browser, $http, $timeout) {
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
        $scope.switchService(null, null, $scope.socialPostCount);
      }

      $scope.toggleText = function() {
        $timeout(function(){
          $rootScope.$broadcast("dynamicLayout.layout");
        });
      }
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
        $scope.switchService(null, null, $scope.socialPostCount);
      }

      // Watch social
      $scope.$watch('social', function(value) {
        if($scope.social) {
          console.log('ok');
        }
      });
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
      $scope.timelineSwitchService = function(event, service) {
        
        $scope.switchService(event, service, $scope.socialPostCount, function() {
          $scope.oddEvenSwitch = $scope.oddEvenSwitch ? 0 : 1;
        });
      }

      // call init
      if(!$scope.inited) {
        $scope.switchService(null, null, $scope.socialPostCount);
      }
    }
  }
})

