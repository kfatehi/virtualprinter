var VirtualPrinter = require('./')

/*
 * AngularJS directive for rendering ESC data to an HTML5 canvas
 */
angular.module('virtualprinter', []).directive('escRender', function() {
  var vp = new VirtualPrinter();
  return {
    restrict: 'AE',
    scope: {
      data: '=',
    },
    link: function(scope, iElement, iAttrs, ctrl) {
      scope.$watch('data', function(newData) {
        if (newData) {
          var as = iAttrs.as;
          if (as === 'html') {
            console.log('html');
            vp.generateHTMLFromByteArray(newData, function(result) {
              iElement.append(result);
            });
          } else if (as === 'canvas') {
            console.log('canvas');
            vp.analyzeAndGenerateCanvasFromByteArray(newData, function(result) {
              iElement.append(result);
            });
          } else {
            throw new Error('Must specify attribute as=[html|canvas]');
          }
        }
      }, true);
    }
  }
});
