'use strict';

angular.module('MyApp').factory('AllReleases', function ($http, $auth, Account) {
    // ------------------------------------------------------------
    // Get All Users
    // ------------------------------------------------------------
    var getToken = Account.getProfile();
    getToken.then(function (response, err) {
        var spotifyToken = response.data.spotifyToken;
        localStorage.setItem('spotifyToken', JSON.stringify(spotifyToken));
    });

    // const getToken = function() {
    //     Account.getProfile()
    //      getToken.then(function(response,err){
    //     let spotifyToken = response.data.spotifyToken
    //     localStorage.setItem('spotifyToken', JSON.stringify(spotifyToken));
    //     })
    // }

    var getReleases = function getReleases() {
        var spotifyToken = localStorage.getItem('spotifyToken');

        var token = JSON.parse(spotifyToken);
        var apicall = $http({
            method: 'GET',
            headers: { Authorization: token },
            url: 'https://api.spotify.com/v1/browse/new-releases'
        });
        return apicall;
    };

    return {
        getToken: getToken,
        getReleases: getReleases

    };
});