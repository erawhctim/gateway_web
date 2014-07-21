'use strict';



// simple stub that could use a lot of work...

myApp.factory('RESTService',

    function ($http) {

        return {

            get:function (url, callback) {

                return $http({method:'GET', url:url}).

                    success(function (data, status, headers, config) {

                        callback(data);

                        //console.log(data.json);

                    }).

                    error(function (data, status, headers, config) {

                        console.log("failed to retrieve data");

                    });

            }

        };

    }

);





// simple auth service that can use a lot of work... 

myApp.factory('AuthService',

    function ($state,$rootScope) {

        var currentUser = null, authorized = false,

            isConsumer = false;



        // not sure what this is for, gonna remove it later

        var initialState = true;



        var dismissLoginModal = function () {

            if ($('#loginModal') && $('#loginModal').modal) {



                $('#loginModal').modal('hide');

            }

        };



        /**

         * Shows the correct home page based on whether a consumer or provider is

         * logged in, or redirects back to the main home page if you log out.

         */

        var goHome = function () {

            $state.transitionTo(authorized ? 'logged-in' : 'home');

        };



        return {

            initialState:function () {

                return initialState;

            },

            login:function (email, password) {



		// Call backend API for logging in

		gapi.client.gateway.users.loginUser({'username':email,'password':password}).execute( function(resp) {

			authorized = resp.boolResult;

			// This needs to be in the function for it to wait for the response			

			if (authorized == 1) {



                    		currentUser = email;

                    		//initialState = false;



                    		dismissLoginModal();



                    		goHome();



		    		// Get current listings

		    		gapi.client.gateway.listings.getListByUser({'id':currentUser}).execute(function(resp) {

					$rootScope.myListResults = resp.listings;

					$rootScope.$apply();

		    		});



				gapi.client.gateway.listings.getWatchByUser({'id':$rootScope.authService.currentUser()}).execute(function(resp) {

					$rootScope.myWatchResults = resp.listings;

					$rootScope.$apply();

				});



				authorized = true;	

				$rootScope.badLogin = false;

                	}

			else

			{

				authorized = false;

				$rootScope.badLogin = true;

			}

		});



                

            },

            logout:function () {

                currentUser = null;

                authorized = false;



		goHome();

            },

            isLoggedIn:function () {

                return authorized;

            },

            currentUser:function () {

                return currentUser;

            }

        };

    }

);
