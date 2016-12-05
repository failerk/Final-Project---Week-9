'use strict';

angular.module('MyApp').controller('ReleaseCtrl', function ($scope, AllReleases, Account) {
  $scope.isAuthenticated = function () {
    return $auth.isAuthenticated();
  };
  var vm = this;

  var getAll = AllReleases.getReleases();
  getAll.then(function (response, err) {
    console.log(response.data);
    vm.allNewReleases = response.data;
  });

  var getAllReleases = AllReleases.getAllReleases();
  getAllReleases.then(function (response, err) {
    console.log(response.data);
  });
});