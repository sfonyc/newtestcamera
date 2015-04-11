var PwNApp = angular.module('starter', [
  'ionic',
  'ngCordova',
  'firebase'
]);
var fb = new Firebase('https://xyz.firebaseio.com/');
PwNApp.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
PwNApp.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('firebase', {
    url: '/firebase',
    templateUrl: 'templates/firebase.html',
    controller: 'FirebaseController',
    cache: false
  }).state('secure', {
    url: '/secure',
    templateUrl: 'templates/secure.html',
    controller: 'SecureController'
  });
  $urlRouterProvider.otherwise('/firebase');
});
PwNApp.controller('FirebaseController', function ($scope, $state, $firebaseAuth) {
  var fbAuth = $firebaseAuth(fb);
  $scope.login = function (username, password) {
    fbAuth.$authWithPassword({
      email: username,
      password: password
    }).then(function (authData) {
      $state.go('secure');
    }).catch(function (error) {
      console.error('ERROR: ' + error);
    });
  };
  $scope.register = function (username, password) {
    fbAuth.$createUser({
      email: username,
      password: password
    }).then(function (userData) {
      return fbAuth.$authWithPassword({
        email: username,
        password: password
      });
    }).then(function (authData) {
      $state.go('secure');
    }).catch(function (error) {
      console.error('ERROR: ' + error);
    });
  };
});
PwNApp.controller('SecureController', function ($scope, $ionicHistory, $firebaseArray, $cordovaCamera) {
  $ionicHistory.clearHistory();
  $scope.images = [];
  var fbAuth = fb.getAuth();
  if (fbAuth) {
    var userReference = fb.child('users/' + fbAuth.uid);
    var syncArray = $firebaseArray(userReference.child('images'));
    $scope.images = syncArray;
  } else {
    $state.go('firebase');
  }
  $scope.upload = function () {
    var options = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: false
    };
    $cordovaCamera.getPicture(options).then(function (imageData) {
      syncArray.$add({ image: imageData }).then(function () {
        alert('Image has been uploaded');
      });
    }, function (error) {
      console.error(error);
    });
  };
});