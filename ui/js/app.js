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

// configure states and router
myApp.config(function ($stateProvider, $urlRouterProvider) {

    // For any unmatched url, redirect to home
    $urlRouterProvider.otherwise("/");

    // Now set up the states
    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "partials/landing-page.html"
        })
        .state('logged-in', {
            url: "/logged-in",
            templateUrl: "partials/main.html"
        })
        .state('about', {
            url: "/about",
            templateUrl: "partials/about.html"
        })
        .state('help', {
            url: "/help",
            templateUrl: "partials/help.html"
        })
        .state('createListing', {
        	url:"/createListing",
        	templateUrl: "partials/createListing.html"
        })
	.state('search', {
		url:"/search",
		templateUrl: "partials/search.html"
	})
	.state('listing-page', {
		url:"/listing-page",
		templateUrl: "partials/listing-page.html"
	})
});

// this is run after angular is instantiated and bootstrapped
myApp.run(function ($rootScope, $location, $http, $timeout, AuthService, RESTService,$state) {

    // *****
    // Eager load some data using simple REST client
    // *****

    $rootScope.restService = RESTService;

    $rootScope.hasSearched = false;

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
	    gapi.client.gateway.listings.getListByUser({'id':'consumer'}).execute(function(resp) {
			$rootScope.myListResults = resp.listings;
			$rootScope.$apply();
		});
            $location.path("/");
        }

        // when user logs out, redirect to home
        if (!$rootScope.authService.authorized()) {
            $location.path("/");
        }
    });

});
