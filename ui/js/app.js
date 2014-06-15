'use strict';

// declare top-level module which depends on filters,and services
var myApp = angular.module('myApp',
    [
        'ui.router',
        'myApp.filters',
        'myApp.directives',
        'ngGrid',
        'ui.bootstrap'
    ]);

var filters = angular.module('myApp.filters', []);
var directives = angular.module('myApp.directives', []);


myApp.config(function ($stateProvider, $urlRouterProvider) {

    // For any unmatched url, redirect to home
    $urlRouterProvider.otherwise("/");

    // Now set up the states
    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "partials/home.html"
        })
        .state('login', {
            url: "/login",
            templateUrl: "partials/login.html"
        })
        .state('about', {
            url: "/about",
            templateUrl: "partials/about.html"
        })
        .state('help', {
            url: "/help",
            templateUrl: "partials/help.html"
        });

/** this is an example state with a bundled controller */
//        .state('state2.list', {
//            url: "/list",
//            templateUrl: "partials/state2.list.html",
//            controller: function($scope) {
//                $scope.things = ["A", "Set", "Of", "Things"];
//            }
//        })
});


// this is run after angular is instantiated and bootstrapped
myApp.run(function ($rootScope, $location, $http, $timeout, AuthService, RESTService) {

    // *****
    // Eager load some data using simple REST client
    // *****

//    $rootScope.restService = RESTService;
//
//    // async load data do be used in table (playgound grid widget)
//    $rootScope.listData = [];
//    $rootScope.restService.get('data/generic-list.json', function (data) {
//        $rootScope.listData = data;
//    });

    // *****
    // Initialize authentication
    // *****
    $rootScope.authService = AuthService;

    $rootScope.$watch('authService.authorized()', function () {

        // if never logged in, do nothing (otherwise bookmarks fail)
        if ($rootScope.authService.initialState()) {
            // we are public browsing
            return;
        }

        // when user logs in, redirect to home
        if ($rootScope.authService.authorized()) {
            $location.path("/");
        }

        // when user logs out, redirect to home
        if (!$rootScope.authService.authorized()) {
            $location.path("/");
        }

    }, true);

});