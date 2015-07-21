var VirtualPrinter = require('./')

var vp = new VirtualPrinter();

/*
 * AngularJS directive for rendering ESC data to an HTML5 canvas
 */
angular.module('virtualprinter', []).directive('escRender', function() {
  return {
    restrict: 'AE',
    scope: {
      receipt: '=',
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
      scope.$watch('receipt.data.data', function(data) {
        if (data) {
          if (as === "canvas" && scope.receipt._dataURL) {
            iElement.empty().append($('<img src="'+scope.receipt._dataURL+'">'));
          } else {
            vp[method](data, function(result) {
              if (as === "canvas") {
                scope.receipt._dataURL = result.toDataURL();
                iElement.empty().append($('<img src="'+scope.receipt._dataURL+'">'));
              } else {
                iElement.empty().append(result);
              }
            });
          }
        }
      }, true);
    }
  }
});
