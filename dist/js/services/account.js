'use strict';

angular.module('MyApp').factory('Account', function ($http, $auth) {
  return {
    getProfile: function getProfile() {
      return $http({
        method: 'POST',
        data: { id: $auth.getToken() },
        url: 'http://localhost:3000/api/me'
      });
    },
    updateProfile: function updateProfile(profileData) {
      return $http.put('http://localhost:3000/api/me', profileData);
    }
  };
});