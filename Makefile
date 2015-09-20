default: angular virtualprinter

virtualprinter:
	webpack src/entry.js dist/virtualprinter.js

angular:
	webpack src/angular.js dist/angular.js
