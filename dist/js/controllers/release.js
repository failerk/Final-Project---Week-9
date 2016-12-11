'use strict';

angular.module('MyApp').controller('ReleaseCtrl', function (AllReleases) {
  var vm = this;

  vm.isAuthenticated = function () {
    return $auth.isAuthenticated();
  };
  // Get Followed Artists
  var getFollowed = AllReleases.getFollowed();
  getFollowed.then(function (response, err) {
    console.log(response.data);
  });

  // Get User Playlists
  var getPlaylists = AllReleases.getPlaylists();
  getPlaylists.then(function (response, err) {
    var playListTracks = response.data.items;
    var playListArtists = [];
    // Get Playlist track endpoint for each user playlist
    playListTracks.forEach(function (playListTracks) {
      var artist = playListTracks.tracks.href;
      playListArtists.push(artist);
    });
    AllReleases.getPlaylistArtist(playListArtists);
  });
});