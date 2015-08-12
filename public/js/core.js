angular.module('todo', ['todoController', 'todoService', 'btford.socket-io'])
  .directive("daily", function() {
    return {
      restrict: 'E',
      templateUrl: "/html/daily.html"
    };
  })
  .directive("weekly", function() {
    return {
      restrict: 'E',
      templateUrl: "/html/week.html"
    };
  })
  .directive("monthly", function() {
    return {
      restrict: "E",
      templateUrl: "/html/month.html"
    };
  })
  .directive("tabs", function() {
    return {
      restrict: "E",
      templateUrl: "/html/tabs.html",
      controller: function() {
        this.tab = 1;

        this.isSet = function(checkTab) {
          return this.tab === checkTab;
        };

        this.setTab = function(activeTab) {
          this.tab = activeTab;
        };

        var a=document.getElementsByClassName("link");

        for(var i=0;i<a.length;i++) {
          a[i].onclick=function() {
            window.location=this.getAttribute("href");
            return false
          }
        }
      },
      controllerAs: "tab"
    };
  });
