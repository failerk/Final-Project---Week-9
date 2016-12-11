angular.module('MyApp')
  .factory('Account', function ($http, $auth) {
    return {
      getProfile: function () {
        return $http({
                method: 'POST',
                data:{id:$auth.getToken()},
                url: 'http://localhost:3000/api/me',
            })
      },
      updateProfile: function (profileData) {
        return $http.put('http://localhost:3000/api/me', profileData);
      }
    };
  });