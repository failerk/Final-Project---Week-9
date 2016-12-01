'use strict';

angular.module('MyApp').factory('Account', function ($http) {
  return {
    getProfile: function getProfile() {
      return $http.get('http://localhost:3000/api/me');
    },
    updateProfile: function updateProfile(profileData) {
      return $http.put('http://localhost:3000/api/me', profileData);
    }
  };
});