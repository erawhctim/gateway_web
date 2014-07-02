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
			gapi.client.gateway.listings.getListByUser({'id':'consumer'}).execute(function(resp) {
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
			return "";
		}

		$scope.$apply();
	}

}]);


// Get all the listings
// This will likely be depracated
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
	
	$scope.getMyListings = function()
	{
		gapi.client.gateway.listings.getListByUser({'id':'consumer'}).execute(function(resp) {
			$scope.myListResults = resp.listings;
			$scope.$apply();
		});
	}

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

    $scope.clear = function () {
        $scope.title = null;
        $scope.description = null;
        $scope.date = null;
    }

    $scope.show = function () {
        $scope.clear();
        $('#newListingModal').modal('show');
    };
    $scope.hide = function () {
        $('#newListingModal').modal('hide');
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

        //$scope.listings.push(newItem);

        $scope.hide();

	$scope.$apply();
    }
}]);


myApp.controller('PlaygroundCtrl',
    ['$scope', '$routeParams', '$http', function ($scope, $routeParams, $http) {

    // add service name to the scope...
//    $scope.widgetName = $routeParams.widgetName;
//
//    // tree support
//    $scope.deleteNode = function (data) {
//        data.nodes = [];
//    };
//
//    $scope.addNode = function (data) {
//        var post = data.nodes.length + 1;
//        var newName = data.name + '-' + post;
//        data.nodes.push({name: newName, nodes: []});
//    };
//
//    $scope.tree = [
//        {name: "Node", nodes: []}
//    ];
//
//
//    // data grid
//    createDataGrid($scope, $http, 'playground/emp.json');
//
//    $scope.setPage = function (pageNo) {
//        $scope.currentPage = pageNo;
//    };
//
//    // date
//    $scope.date2 = null;
//
//    $scope.addChild = function () {
//        $scope.events.push({
//            title: 'Open Sesame',
//            start: new Date(y, m, 28),
//            end: new Date(y, m, 29)
//        });
//    }
//
//    $scope.remove = function (index) {
//        $scope.events.splice(index, 1);
//    }
//
//    // alerts (angular ui)
//    $scope.alertSet = [
//        { type: 'error', msg: 'Oh snap! Change a few things up and try submitting again.' },
//        { type: 'success', msg: 'Well done! You successfully read this important alert message.' }
//    ];
//
//    $scope.addToAlertSet = function () {
//        $scope.alertSet.push({msg: "Another alert!"});
//    };
//
//    $scope.closeTheAlert = function (index) {
//        $scope.alertSet.splice(index, 1);
//    };
//
//    // angularstrap
//    $scope.modal2 = {content: 'Hello Modal', saved: false};
//    $scope.tooltip = {title: "Hello Tooltip<br />This is a multiline message!", checked: false};
//    $scope.popover = {content: "Hello Popover<br />This is a multiline message!", saved: false};
//    $scope.alerts = [
//        {type: 'success', title: 'Hello!', content: 'This is a success msg.<br><br><pre>2 + 3 = {{ 2 + 3 }}</pre>'}
//    ];
//    $scope.addAlert = function (type) {
//        $scope.alerts.push({type: type, title: 'Alert!', content: 'This is another alert...'});
//    };
//    $scope.button = {active: true};
//    $scope.buttonSelect = {price: '89,99', currency: 'Ã¢â€šÂ¬'};
//    $scope.checkbox = {left: false, middle: true, right: false};
//    $scope.radio = {left: false, middle: true, right: false};
//    $scope.radioValue = 'middle';
//    $scope.typeahead = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Dakota", "North Carolina", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
//    $scope.datepicker = {dateStrap: '12/12/2012'};
//    $scope.timepicker = {timeStrap: '05:30 PM'};
//
//    // form validation and binding
//    $scope.master = "";
//
//    $scope.saveForm = function (user) {
//        console.log("User..." + $scope.user);
//        $scope.master = user;
//    }

}]);

myApp.controller('createListCtrl',['$scope', function ($scope) {

	
}]);

