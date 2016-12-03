angular.module('MyApp')
  .factory('AllReleases', function ($http, $auth, Account) {
             // ------------------------------------------------------------
            // Get All Users
            // ------------------------------------------------------------
            let getToken = Account.getProfile()
            getToken.then(function(response,err){
            let spotifyToken = response.data.spotifyToken
            localStorage.setItem('spotifyToken', JSON.stringify(spotifyToken));
            })

            // const getToken = function() {
            //     Account.getProfile()
            //      getToken.then(function(response,err){
            //     let spotifyToken = response.data.spotifyToken
            //     localStorage.setItem('spotifyToken', JSON.stringify(spotifyToken));
            //     })
            // }

            const getReleases = function() {
                var spotifyToken = localStorage.getItem('spotifyToken');
        
                let token = JSON.parse(spotifyToken)
                let apicall = $http({
                    method: 'GET',
                    headers: {Authorization:token},
                    url: `https://api.spotify.com/v1/browse/new-releases`,
                })
                return apicall
            }

            return {
                getToken,
                getReleases
                
                
            }
  });