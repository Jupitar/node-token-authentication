angular.module('todoController', [])

// inject the Todo service factory into our controller
.controller('mainController', function($scope, $http, $log, Daily, Weekly, Monthly, socket) {
  $scope.formData = {};
  socket.emit('ready', '');

  // GET =====================================================================
  // when landing on the page, get all todos and show them
  // use the service to get all the todos
  Daily.get()
    .success(function(data) {
      $scope.daily = data;
    });
    Weekly.get()
    .success(function(data) {
      $scope.weekly = data;
    });
    Monthly.get()
    .success(function(data) {
      $scope.monthly = data;
    });

    socket.on('refresh-client', function () {
      $log.debug('refresh-client event recieved');
        Daily.get()
        .success(function(data) {
          $scope.daily = data;
        });
        Weekly.get()
        .success(function(data) {
          $scope.weekly = data;
        });
        Monthly.get()
        .success(function(data) {
          $scope.monthly = data;
        });
    })

  // CREATE ==================================================================
  // when submitting the add form, send the text to the node API
  $scope.createDaily = function() {

    // validate the formData to make sure that something is there
    // if form is empty, nothing will happen
    // people can't just hold enter to keep adding the same to-do anymore
    if ($scope.formData) {

      // call the create function from our service (returns a promise object)
      Daily.create($scope.formData)

      // if successful creation, call our get function to get all the new todos
      .success(function(data) {
        $scope.formData = {}; // clear the form so our user is ready to enter another
        $scope.daily = data; // assign our new list of todos
        socket.emit('refresh', '');
      });
    }
  };

  $scope.createWeekly = function() {

    // validate the formData to make sure that something is there
    // if form is empty, nothing will happen
    // people can't just hold enter to keep adding the same to-do anymore
    if ($scope.formData) {

      // call the create function from our service (returns a promise object)
      Weekly.create($scope.formData)

      // if successful creation, call our get function to get all the new todos
      .success(function(data) {
        $scope.formData = {}; // clear the form so our user is ready to enter another
        $scope.weekly = data; // assign our new list of todos
        socket.emit('refresh', '');
      });
    }
  };

  $scope.createMonthly = function() {

    // validate the formData to make sure that something is there
    // if form is empty, nothing will happen
    // people can't just hold enter to keep adding the same to-do anymore
    if ($scope.formData) {

      // call the create function from our service (returns a promise object)
      Monthly.create($scope.formData)

      // if successful creation, call our get function to get all the new todos
      .success(function(data) {
        $scope.formData = {}; // clear the form so our user is ready to enter another
        $scope.monthly = data; // assign our new list of todos
        socket.emit('refresh', '');
      });
    }
  };

  // DELETE ==================================================================
  // delete a todo after checking it
  $scope.deleteDaily = function(id) {
    Daily.delete(id)
      // if successful creation, call our get function to get all the new todos
      .success(function(data) {
        $scope.daily = data; // assign our new list of todos
        socket.emit('refresh', '');
      });
  };

  $scope.deleteWeekly = function(id) {
    Weekly.delete(id)
      // if successful creation, call our get function to get all the new todos
      .success(function(data) {
        $scope.weekly = data; // assign our new list of todos
        socket.emit('refresh', '');
      });
  };

  $scope.deleteMonthly = function(id) {
    Monthly.delete(id)
      // if successful creation, call our get function to get all the new todos
      .success(function(data) {
        $scope.monthly = data; // assign our new list of todos
        socket.emit('refresh', '');
      });
  };

  // DONE ==================================================================
  //
  $scope.doneDaily = function(id) {
    Daily.done(id)
      // if successful creation, call our get function to get all the new todos
      .success(function(data) {
        $scope.daily = data; // assign our new list of todos
        socket.emit('refresh', '');
      });
  };

  $scope.doneWeekly = function(id) {
    Weekly.done(id)
      // if successful creation, call our get function to get all the new todos
      .success(function(data) {
        $scope.weekly = data; // assign our new list of todos
        socket.emit('refresh', '');
      });
  };

  $scope.doneMonthly = function(id) {
    Monthly.done(id)
      // if successful creation, call our get function to get all the new todos
      .success(function(data) {
        $scope.monthly = data; // assign our new list of todos
        socket.emit('refresh', '');
      });
  };
});
