myApp.controller('HomeCtrl',['$scope', function ($scope) {


}]);

myApp.controller('NavCtrl',['$scope', function ($scope) {

    // This is used so both the login button and "enter" keypress can be tied to the same login action
    $scope.submitLoginForm = function () {
        $scope.authService.login($scope.email, $scope.password);
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
