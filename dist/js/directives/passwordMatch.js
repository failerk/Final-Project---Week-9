'use strict';

angular.module('MyApp').directive('passwordMatch', function () {
  return {
    require: 'ngModel',
    scope: {
      otherModelValue: '=passwordMatch'
    },
    link: function link(scope, element, attributes, ngModel) {
      ngModel.$validators.compareTo = function (modelValue) {
        return modelValue === scope.otherModelValue;
      };
      scope.$watch('otherModelValue', function () {
        ngModel.$validate();
      });
    }
  };
});