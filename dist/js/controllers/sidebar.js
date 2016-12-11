'use strict';

angular.module('MyApp').controller('SidebarCtrl', function ($scope, $auth, Account) {
  $scope.isAuthenticated = function () {
    return $auth.isAuthenticated();
  };

  $scope.isActive = false;

  $scope.toggleActive = function () {
    $scope.isActive = !$scope.isActive;
  };

  var getAccount = Account.getProfile();
  getAccount.then(function (response) {
    $scope.user = response.data;
    console.log(response.data);
  });
});