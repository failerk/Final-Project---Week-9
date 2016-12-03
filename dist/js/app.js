'use strict';

angular.module('MyApp', ['ngResource', 'ngMessages', 'ngAnimate', 'toastr', 'ui.router', 'satellizer']).config(function ($stateProvider, $urlRouterProvider, $authProvider) {

  /**
   * Helper auth functions
   */
  var skipIfLoggedIn = ['$q', '$auth', function ($q, $auth) {
    var deferred = $q.defer();
    if ($auth.isAuthenticated()) {
      deferred.reject();
    } else {
      deferred.resolve();
    }
    return deferred.promise;
  }];

  var loginRequired = ['$q', '$location', '$auth', function ($q, $location, $auth) {
    var deferred = $q.defer();
    if ($auth.isAuthenticated()) {
      deferred.resolve();
    } else {
      $location.path('/login');
    }
    return deferred.promise;
  }];

  /**
   * App routes
   */
  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'partials/login.html',
    views: {
      aside: {
        templateUrl: 'partials/navbar.html',
        controller: 'LoginCtrl'
      },
      content: {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
      }
    },
    resolve: {
      skipIfLoggedIn: skipIfLoggedIn
    }
  }).state('logout', {
    url: '/logout',
    template: null,
    controller: 'LogoutCtrl'
  }).state('profile', {
    url: '/profile',
    templateUrl: 'partials/profile.html',
    controller: 'ProfileCtrl',
    resolve: {
      loginRequired: loginRequired
    }
  }).state('newreleases', {
    url: '/newreleases',
    views: {
      aside: {
        templateUrl: 'partials/sidebar.html',
        controller: 'SidebarCtrl'
      },
      content: {
        templateUrl: 'partials/newreleases.html',
        controller: 'ReleaseCtrl'
      }
    },
    resolve: {
      loginRequired: loginRequired
    }
  }).state('home', {
    url: '/',
    views: {
      aside: {
        templateUrl: 'partials/navbar.html',
        controller: 'NavbarCtrl'
      },
      content: {
        templateUrl: 'partials/home.html',
        controller: 'HomeCtrl'
      }
    }
  });
  $urlRouterProvider.otherwise('/');

  /**
   *  Satellizer config
   */
  $authProvider.spotify({
    clientId: '7186f05dbb42497884aba2c91c287165',
    url: 'http://localhost:3000/auth/spotify',
    scope: ['user-top-read']
  });
});