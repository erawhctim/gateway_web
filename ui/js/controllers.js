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
		{
			$rootScope.hasSearched = false;
			$rootScope.stringSearch = null;
		}
		// Refresh user listings on home page
		else
		{
			gapi.client.gateway.listings.getListByUser({'id':$rootScope.authService.currentUser()}).execute(function(resp) {
				$rootScope.myListResults = resp.listings;
				$rootScope.$apply();
			});

			gapi.client.gateway.listings.getWatchByUser({'id':$rootScope.authService.currentUser()}).execute(function(resp) {
				$rootScope.myWatchResults = resp.listings;
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
	$rootScope.stringSearch = $scope.searchQuery;
	
    }

    // individual listing page
	$scope.moveToListingPage = function(documentId)
	{
		$state.transitionTo('listing-page');
		gapi.client.gateway.listings.getListById({'idx':documentId}).execute(function(resp) {
			$rootScope.selectedListing = resp;
			$rootScope.watchingPost = false;
			$rootScope.stringSearch = null;
			$rootScope.watch_text = "I can help";
			//$rootScope.myStyle = {'background-color':default};
			if($rootScope.myListResults)
			{
				for(i=0;i<$rootScope.myListResults.length;i++)
				{
					if($rootScope.myListResults[i].list_id == resp.list_id)
					{
						$rootScope.watchingPost = true;
						$rootScope.myStyle={'background-color':'green'};
						//$rootScope.watch_text = "Unwatch Post";

						break;
					}

				}
			}
			$rootScope.$apply();
		});
	}

}]);

// Controller for 
myApp.controller('myListCtrl',['$scope','$state','$rootScope', function($scope,$state,$rootScope) {

	// retrieve user listings
	$scope.getMyListings = function()
	{
		gapi.client.gateway.listings.getListByUser({'id':$scope.authService.currentUser()}).execute(function(resp) {
			$rootScope.myListResults = resp.listings;
			$rootScope.$apply();
		});

		gapi.client.gateway.listings.getWatchByUser({'id':$scope.authService.currentUser()}).execute(function(resp) {
			$rootScope.myWatchResults = resp.listings;
			$rootScope.$apply();
		});
	}

	// individual listing page
	$scope.moveToListingPage = function(documentId)
	{
		$state.transitionTo('listing-page');
		gapi.client.gateway.listings.getListById({'idx':documentId}).execute(function(resp) {
			$rootScope.selectedListing = resp;
			$rootScope.watch_text = "I can help";
			//$rootScope.myStyle = {'background-color':default};
			if($rootScope.myWatchResults)
			{
				for(i=0;i<$rootScope.myWatchResults.length;i++)
				{
					if($rootScope.myWatchResults[i].list_id == resp.list_id)
					{
						$rootScope.watchingPost = true;
						$rootScope.myStyle={'background-color':'green'};
						//$rootScope.watch_text = "Unwatch Post";

						break;
					}

				}
			}
			$rootScope.$apply();
		});
	}
}]);


myApp.controller('NavCtrl', ['$scope', '$filter','$rootScope', function ($scope, $filter, $rootScope) {


    // This is used so both the login button and "enter" keypress can be tied to the same login action
    $scope.submitLoginForm = function () {
        $scope.authService.login($scope.email, $scope.password);
    };

    // submit the new user form
    $scope.submitUserForm = function() {

	var isValidUser = 0;
	gapi.client.gateway.users.newUser( {
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
	$scope.email = null;
	$scope.username = null;
	$scope.password = null;
	$scope.newEmailField = null;
	$scope.newUsernameField = null;
	$scope.newPasswordField = null;
	$scope.confirmPassword = null;
    }

    $scope.show = function (thisModal) {
        $scope.clear();
        $(thisModal).modal('show');
    };
    $scope.hide = function (thisModal) {
	$scope.clear();
        $(thisModal).modal('hide');
    };

    $scope.submitListing = function () {

	gapi.client.gateway.listings.postListing(
	{'date':$scope.date,
	'title':$scope.title,
	//'location':document.querySelector('#listingAddr').value,
	'description':$scope.description,
	'owner':$scope.authService.currentUser()
	}).execute( function() { ;

		$scope.hide('#newListingModal');

		// Update listings
		gapi.client.gateway.listings.getListByUser({'id':$scope.authService.currentUser()}).execute(function(resp) {
			$rootScope.myListResults = resp.listings;
			$rootScope.$apply();
		});

		gapi.client.gateway.listings.getWatchByUser({'id':$scope.authService.currentUser()}).execute(function(resp) {
			$rootScope.myWatchResults = resp.listings;
			$rootScope.$apply();
		});
	});

    }
}]);

myApp.controller('SelectedListingCtrl',['$scope','$rootScope','$state', function($scope,$rootScope,$state) {

	$rootScope.moveToMessagePage = function()
	{
		$state.transitionTo('message');
		gapi.client.gateway.messages.get({'origin':$rootScope.authService.currentUser(),'dest':$rootScope.selectedListing.owner}).execute(function(resp){ 
			$rootScope.Msgs = resp.instMsgs;
			$rootScope.$apply();
		});
	}

	$scope.addWatchUser = function()
	{
		$rootScope.watch_text = "I can help";
		//$rootScope.myStyle = {'background-color':default};
		gapi.client.gateway.listings.addWatchUser({'user':$scope.authService.currentUser(),'listing_id':$rootScope.selectedListing.list_id}).execute(function(resp){ 
			if(resp.boolResult) {
				//$rootScope.watch_text = "Unwatch Post";
				$rootScope.myStyle={'background-color':'green'};
				$rootScope.$apply();
			}
		});	
	}

	$scope.deleteListing = function()
	{
		gapi.client.gateway.deleteElement({'kind':'listing','id':$rootScope.selectedListing.list_id}).execute(function() {
			// Update listings
			gapi.client.gateway.listings.getListByUser({'id':$scope.authService.currentUser()}).execute(function(response) {
				$rootScope.myListResults = response.listings;
				$state.transitionTo('logged-in');
				$rootScope.$apply();
			});
		});	
	}
}]);


myApp.controller('MessageCtrl',
    ['$rootScope','$scope', function ($scope,$rootScope) {

	$scope.sendMessage = function() {

		gapi.client.gateway.messages.send({'userId':$rootScope.selectedListing.owner,'content':'me','origin':$scope.authService.currentUser()}).execute();
	}

}]);
