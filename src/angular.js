var VirtualPrinter = require('./')

var vp = new VirtualPrinter();

/*
 * AngularJS directive for rendering ESC data to an HTML5 canvas
 */
angular.module('virtualprinter', []).directive('escRender', function() {
  return {
    restrict: 'AE',
    scope: {
      data: '=',
    },
    link: function(scope, iElement, iAttrs, ctrl) {
      var as = iAttrs.as;
      var method = null;
      if (as === 'html') {
        method = 'generateHTMLFromByteArray'; 
      } else if (as === 'canvas') {
        method = 'analyzeAndGenerateCanvasFromByteArray';
      } else {
        throw new Error('Must specify attribute as=[html|canvas]');
      } 
      scope.$watch('data', function(newData) {
        if (newData) {
          vp[method](newData, function(result) {
            iElement.empty().append(result);
          });
        }
      }, true);
    }
  }
});
