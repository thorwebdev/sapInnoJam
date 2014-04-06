'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'ui.bootstrap',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/start', {templateUrl: 'partials/start.html', controller: 'StartCtrl'});

  $routeProvider.otherwise({redirectTo: '/start'});
}]);
