'use strict';

angular.module('MyApp').controller('SidebarCntrl', function ($scope, $auth) {
  $scope.isAuthenticated = function () {
    return $auth.isAuthenticated();
  };
});