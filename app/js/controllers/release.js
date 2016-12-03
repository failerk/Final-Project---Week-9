angular.module('MyApp')
  .controller('ReleaseCtrl', function($scope, AllReleases, Account) {
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    let vm = this; 

    let getAll = AllReleases.getReleases()
    getAll.then(function(response,err,){
      console.log(err);
      vm.allNewReleases = response.data
    })
  });
