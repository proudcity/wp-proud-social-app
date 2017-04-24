'use strict';

//***************************************

// Main Application

//***************************************

angular.module('socialAppParent', [
  'socialApp',
  "angular-inview",
  "angular-lazycompile"
])

// Hash conflict issues require this.
.config(
  [          '$locationProvider',
    function ($locationProvider) {
      $locationProvider.hashPrefix('');
    }
  ]
)