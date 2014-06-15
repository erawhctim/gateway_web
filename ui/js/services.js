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
    function ($state) {
        var currentUser = null, authorized = false,
            isConsumer = false;

        // not sure what this is for, gonna remove it later
        var initialState = true;

        //TODO: get rid of this fake validation
        var isConsumerEmail = function (email) {
            return email && email === 'consumer@gmail.com';
        };

        var isProviderEmail = function (email) {
            return email && email === 'provider@gmail.com';
        };

        var isValidEmail = function (email) {
            return isConsumerEmail(email) || isProviderEmail(email);
        };

        var isValidPassword = function (password) {
            return password && password === 'password';
        };

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
            //transition to main search page
            if (authorized) {
                $state.transitionTo(isConsumer ? 'consumerHome' : 'providerHome');
            } else {
                $state.transitionTo('home');
            }
        };

        return {
            initialState:function () {
                return initialState;
            },
            login:function (email, password) {

                authorized = isValidEmail(email) && isValidPassword(password);

                if (authorized) {
                    isConsumer = isConsumerEmail(email);

                    currentUser = isConsumer ? 'Consumer' : 'Provider';
                    initialState = false;

                    dismissLoginModal();

                    goHome();
                }
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
            },
            isConsumer:function () {
                return authorized && isConsumer;
            },
            isProvider:function () {
                return authorized && !isConsumer;
            }
        };
    }
);