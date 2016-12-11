angular.module('MyApp')
  .controller('ReleaseCtrl', function (AllReleases) {
    let vm = this;

    vm.isAuthenticated = function () {
      return $auth.isAuthenticated();
    };
    // Get Followed Artists
    let getFollowed = AllReleases.getFollowed()
    getFollowed.then(function (response, err, ) {
      console.log(response.data);
    })

    // Get User Playlists
    let getPlaylists = AllReleases.getPlaylists()
    getPlaylists.then(function (response, err, ) {
      let playListTracks = response.data.items
      let playListArtists = []
        // Get Playlist track endpoint for each user playlist
      playListTracks.forEach(function (playListTracks) {
        let artist = playListTracks.tracks.href
        playListArtists.push(artist)
      })
      AllReleases.getPlaylistArtist(playListArtists)
    })

  });
  