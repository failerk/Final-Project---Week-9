'use strict';

angular.module('MyApp').factory('AllReleases', function ($http, $auth, Account) {

    var getReleases = function getReleases() {

        var apicall = $http({
            method: 'GET',
            url: 'https://api.spotify.com/v1/browse/new-releases'
        });
        return apicall;
    };

    var getAllReleases = function getAllReleases() {

        var apicall = $http({
            method: 'GET',
            url: 'https://api.spotify.com/v1/search?q=tag:new&type=album&market=US'
        });
        return apicall;
    };

    return {
        getReleases: getReleases,
        getAllReleases: getAllReleases
    };
});