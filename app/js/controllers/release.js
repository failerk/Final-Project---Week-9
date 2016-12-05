angular.module('MyApp')
  .controller('ReleaseCtrl', function($scope, AllReleases, Account) {
    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };
    let vm = this; 

    let getAll = AllReleases.getReleases()
    getAll.then(function(response,err,){
      console.log(response.data);
      vm.allNewReleases = response.data
    })

    let getAllReleases = AllReleases.getAllReleases()
    getAllReleases.then(function(response,err,){
      console.log(response.data);
    })
  });
