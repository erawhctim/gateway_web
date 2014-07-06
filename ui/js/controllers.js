/** google global namespace for Google projects. */

var google = google || {};

/** appengine namespace for Google Developer Relations projects. */
google.appengine = google.appengine || {};

google.appengine.gateway = google.appengine.gateway || {};

// Function on initialization
google.appengine.gateway.init = function(apiRoot) {
	var apisToLoad;
	var callback = function() {
		if(--apisToLoad == 0) {
			//google.appengine.gateway.postListing();
		}
	}

	apisToLoad = 1;
	gapi.client.load('gateway','v1',callback,apiRoot);	
};



// TODO: want posted listings to show up when you're on the home page even
// after you just posted it.
// Also some redundant functions here. May want to add them to the services.


myApp.controller('NewListingCtrl', ['$scope', function ($scope) {


}]);

myApp.controller('SidebarCtrl', ['$scope' , '$state', '$rootScope', function($scope, $state, $rootScope) {
	$scope.setPage = function(page) {
		// Change to proper state
		$state.transitionTo(page);
		// Used for knowing when to display "no results"
		if(page != 'logged-in')
			$rootScope.hasSearched = false;
		// Refresh user listings on home page
		else
		{
			gapi.client.gateway.listings.getListByUser({'id':$rootScope.authService.currentUser()}).execute(function(resp) {
				$rootScope.myListResults = resp.listings;
				$rootScope.$apply();
			});
		}
	};

	// Return if the given state is active to know when to highlight 	 // sidebar item
	$scope.getActivePage = function(page) {
		if($state.is(page))
		{
			return "active";
		}
		else 
		{
			return null;
		}

	}

}]);


// Get all the listings
// This will likely be depracated
/*
myApp.controller('ListingsCtrl', ['$scope', function ($scope) {

	// Print the current listings
	$scope.getCurListings = function() 
	{
		gapi.client.gateway.listings.getListings(
			{'maxResults':'10', 'sortOrder':'newest'}).execute(function(resp) {
			$scope.curListings = resp.listings;			
			$scope.$apply();
		});
	};
}]);
*/

// Search for a keyword
myApp.controller('SearchCtrl', ['$scope','$rootScope','$state', function ($scope,$rootScope,$state) {

    // Perform a search using built-in Google function
    // Number of returned search listings is hard coded to 10 for now
    $scope.searchListings = function()
    {
	var keyword = $scope.searchQuery;
	gapi.client.gateway.listings.searchListings(
	{'search_keyword':keyword,'num_search_listings':'10'}).execute(function(resp) {
			$scope.searchResults = resp.listings;
			$scope.$apply();
	});
	$rootScope.hasSearched = true;
    }

    // Go to the listing page template to show info on individual listing
    $scope.moveToListingPage = function(documentId)
	{
		$state.transitionTo('listing-page');
		gapi.client.gateway.listings.getDocById({'idx':documentId}).execute(function(resp) {
			$rootScope.selectedListing = resp;
			$rootScope.$apply();
		});
	}

}]);

// Controller for 
myApp.controller('myListCtrl',['$scope','$state','$rootScope', function($scope,$state,$rootScope) {
	
	// retrieve user listings
	$scope.getMyListings = function()
	{
		gapi.client.gateway.listings.getListByUser({'id':authService.currentUser()}).execute(function(resp) {
			$scope.myListResults = resp.listings;
			//$scope.$apply();
		});
	}

	// individual listing page
	$scope.moveToListingPage = function(documentId)
	{
		$state.transitionTo('listing-page');
		gapi.client.gateway.listings.getDocById({'idx':documentId}).execute(function(resp) {
			$rootScope.selectedListing = resp;
			$rootScope.$apply();
		});
	}
}]);
		

myApp.controller('NavCtrl', ['$scope', '$filter', function ($scope, $filter) {


    // This is used so both the login button and "enter" keypress can be tied to the same login action
    $scope.submitLoginForm = function () {
        $scope.authService.login($scope.email, $scope.password);
    };

    // submit the new user form
    $scope.submitUserForm = function() {
	var newUser = { 
		"username" : $scope.newUsernameField,
		"email" : $scope.newEmailField,
		"password" : $scope.newPasswordField
	};

	var isValidUser = 0;
	gapi.client.gateway.listings.newUser( {
		'username' : $scope.newUsernameField,
		'email' : $scope.newEmailField,
		'password' : $scope.newPasswordField
	}).execute(function (resp) {
		var isValidUser = resp.boolResult;
		if(isValidUser)
		{
			// Login with the same credentials
			$scope.authService.login($scope.newUsernameField,$scope.newPasswordField);
		}
		else
		{
			// Show error dialog
		}
	});
    }
	
    // TODO: need to have this clear out the modal fields of a given modal
    $scope.clear = function () {
        $scope.title = null;
        $scope.description = null;
        $scope.date = null;
    }

    $scope.show = function (thisModal) {
        $scope.clear();
        $(thisModal).modal('show');
    };
    $scope.hide = function (thisModal) {
        $(thisModal).modal('hide');
    };

    $scope.submitListing = function () {
        var newItem = {
            "title" : $scope.title,
            "description" : $scope.description,
            "owner" : $scope.authService.currentUser()
        };

        if ($scope.date) {
            newItem["date"] = $filter('date')($scope.date, "MM/dd/yy")
        }

	gapi.client.gateway.listings.postListing(
	{'date':newItem["date"],
	'title':newItem["title"],
	//'location':document.querySelector('#listingAddr').value,
	'description':newItem["description"],
	'owner':newItem["owner"]
	}).execute();

        $scope.hide('#newListingModal');

	// Update listings
	// NOT WORKING
	gapi.client.gateway.listings.getListByUser({'id':$scope.authService.currentUser()}).execute(function(resp) {
		$scope.myListResults = resp.listings;
		$scope.$apply();
	});

    }
}]);


myApp.controller('PlaygroundCtrl',
    ['$scope', '$routeParams', '$http', function ($scope, $routeParams, $http) {


}]);

myApp.controller('createListCtrl',['$scope', function ($scope) {

	
}]);

