angular.module('MyApp')
    .factory('AllReleases', function ($http, $auth, Account) {
        //Get artists the user follows
        const getFollowed = function () {
            let apicall = $http({
                method: 'GET',
                url: 'https://api.spotify.com/v1/me/following?type=artist',
            })
            return apicall
        }

        //Primary playlist caller, kicks off api call chain
        const getPlaylists = function () {
            let apicall = $http({
                method: 'GET',
                url: 'https://api.spotify.com/v1/me/playlists',
            })
            return apicall
        }

        //Gets playlist artists
        const getPlaylistArtist = function (tracksurl) {
            tracksurl.forEach(function (track) {
                let apicall = $http({
                    method: 'GET',
                    url: `${track}`
                });
                apicall.then(function (response) {
                    someArray.push(response.data);
                    if (someArray.length == tracksurl.length) {
                        getArtistPlay(someArray)
                    }
                })
            })
        }

        //Empty arrays used for functions
        let someArray = []

        let playlistArtists = []

        let albums = []

        //Get the arists of your playlists and put the in an array
        function getArtistPlay(someArray) {
            someArray.forEach(function (array) {
                array.items.forEach(function (e) {
                    playlistArtists.push(e.track.artists[0].id)
                });
            });
            callArtistId(playlistArtists)
        }

        //URL builder from artist id
        function callArtistId(playlistArtists) {
            // Pulling five artists to save on api calls for now
            let apiQuery = playlistArtists.slice(0, 10)
            getArtistDisc(apiQuery)
        }

        //Get an artists discography
        function getArtistDisc(apiQuery) {
            apiQuery.forEach(function (artistId) {
                let apicall = $http({
                    method: 'GET',
                    url: `https://api.spotify.com/v1/artists/${artistId}/albums`
                });
                apicall.then(function (response) {
                    let artistAlbums = response.data
                    offsetCheck(artistAlbums)
                })
            })
        }

        //Check if results have offset api call
        function offsetCheck(artistAlbums) {
            if (artistAlbums.next !== null) {
                let nextUrl = artistAlbums.next
                getAlbumId(artistAlbums)
                offsetCall(nextUrl)
            } else {
                getAlbumId(artistAlbums)
            }
        }

        //Make api call if offset is !null, check again for offset
        function offsetCall(nextUrl) {
            let apicall = $http({
                method: 'GET',
                url: `${nextUrl}`
            });
            apicall.then(function (response) {
                let artistAlbums = response.data
                offsetCheck(artistAlbums)
            })
        }

        //Add some function to get IDs for albums and push them onto an array
        function getAlbumId(artistAlbums) {
            let albumIds = []
            let something = function (artistAlbums) { 
                artistAlbums.items.forEach(function (album) {
                let diskid = album.id
                return diskid
            })
        }
            albumIds.push(something)
        }

        // Get 20 Ids from album array and build url for the call, queue next set of 20 

        //Make albums call to get release date, limit 20


        return {
            getFollowed,
            getPlaylists,
            getPlaylistArtist,
            getArtistPlay
        }
    });