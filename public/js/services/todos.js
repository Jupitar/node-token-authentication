angular.module('todoService', [])

// super simple service
// each function returns a promise object
.factory('Daily', function($http) {
    return {
      get: function() {
        return $http.get('/api/daily');
      },
      create: function(todoData) {
        return $http.post('/api/daily', todoData);
      },
      delete: function(id) {
        return $http.delete('/api/daily/' + id);
      },
      done: function(id) {
        return $http.post('/api/daily/' + id);
      }
    }
  })
  .factory('Weekly', function($http) {
    return {
      get: function() {
        return $http.get('/api/weekly');
      },
      create: function(todoData) {
        return $http.post('/api/weekly', todoData);
      },
      delete: function(id) {
        return $http.delete('/api/weekly/' + id);
      },
      done: function(id) {
        return $http.post('/api/weekly/' + id);
      }
    }
  })
  .factory('Monthly', function($http) {
    return {
      get: function() {
        return $http.get('/api/monthly');
      },
      create: function(todoData) {
        return $http.post('/api/monthly', todoData);
      },
      delete: function(id) {
        return $http.delete('/api/monthly/' + id);
      },
      done: function(id) {
        return $http.post('/api/monthly/' + id);
      }
    }
  })
  .factory('socket', function (socketFactory) {
    return socketFactory();
  });
