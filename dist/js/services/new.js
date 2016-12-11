'use strict';

angular.module('MyApp').factory('AllReleases', function ($http, $auth, Account) {
    //Get artists the user follows
    var getFollowed = function getFollowed() {
        var apicall = $http({
            method: 'GET',
            url: 'https://api.spotify.com/v1/me/following?type=artist'
        });
        return apicall;
    };

    //Primary playlist caller, kicks off api call chain
    var getPlaylists = function getPlaylists() {
        var apicall = $http({
            method: 'GET',
            url: 'https://api.spotify.com/v1/me/playlists'
        });
        return apicall;
    };

    //Gets playlist artists
    var getPlaylistArtist = function getPlaylistArtist(tracksurl) {
        tracksurl.forEach(function (track) {
            var apicall = $http({
                method: 'GET',
                url: '' + track
            });
            apicall.then(function (response) {
                someArray.push(response.data);
                if (someArray.length == tracksurl.length) {
                    getArtistPlay(someArray);
                }
            });
        });
    };

    //Empty arrays used for functions
    var someArray = [];

    var playlistArtists = [];

    var albums = [];

    //Get the arists of your playlists and put the in an array
    function getArtistPlay(someArray) {
        someArray.forEach(function (array) {
            array.items.forEach(function (e) {
                playlistArtists.push(e.track.artists[0].id);
            });
        });
        callArtistId(playlistArtists);
    }

    //URL builder from artist id
    function callArtistId(playlistArtists) {
        // Pulling five artists to save on api calls for now
        var apiQuery = playlistArtists.slice(0, 10);
        getArtistDisc(apiQuery);
    }

    //Get an artists discography
    function getArtistDisc(apiQuery) {
        apiQuery.forEach(function (artistId) {
            var apicall = $http({
                method: 'GET',
                url: 'https://api.spotify.com/v1/artists/' + artistId + '/albums'
            });
            apicall.then(function (response) {
                var artistAlbums = response.data;
                offsetCheck(artistAlbums);
            });
        });
    }

    //Check if results have offset api call
    function offsetCheck(artistAlbums) {
        if (artistAlbums.next !== null) {
            var nextUrl = artistAlbums.next;
            getAlbumId(artistAlbums);
            offsetCall(nextUrl);
        } else {
            getAlbumId(artistAlbums);
        }
    }

    //Make api call if offset is !null, check again for offset
    function offsetCall(nextUrl) {
        var apicall = $http({
            method: 'GET',
            url: '' + nextUrl
        });
        apicall.then(function (response) {
            var artistAlbums = response.data;
            offsetCheck(artistAlbums);
        });
    }

    //Add some function to get IDs for albums and push them onto an array
    function getAlbumId(artistAlbums) {
        var albumIds = [];
        var something = function something(artistAlbums) {
            artistAlbums.items.forEach(function (album) {
                var diskid = album.id;
                return diskid;
            });
        };
        albumIds.push(something);
    }

    // Get 20 Ids from album array and build url for the call, queue next set of 20 

    //Make albums call to get release date, limit 20


    return {
        getFollowed: getFollowed,
        getPlaylists: getPlaylists,
        getPlaylistArtist: getPlaylistArtist,
        getArtistPlay: getArtistPlay
    };
});