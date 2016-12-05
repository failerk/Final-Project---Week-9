angular.module('MyApp')
  .factory('AllReleases', function ($http, $auth, Account) {

            const getReleases = function() {
        
                let apicall = $http({
                    method: 'GET',
                    url: `https://api.spotify.com/v1/browse/new-releases`,
                })
                return apicall
            }

            const getAllReleases = function() {
        
                let apicall = $http({
                    method: 'GET',
                    url: 'https://api.spotify.com/v1/search?q=tag:new&type=album&market=US',
                })
                return apicall
            }
            
            return {
                getReleases,
                getAllReleases    
            }
  });