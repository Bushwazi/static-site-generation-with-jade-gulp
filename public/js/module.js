var Module = (function () {

  var _privateMethod = function () {
    // private
    console.log("LOGGING: Module._privateMethod");
  };

  var someMethod = function () {
  	console.log("LOGGING: Module.someMethod");
    // public
  };

  var anotherMethod = function () {
  	console.log("LOGGING: Module.anotherMethod");
    // public
    _privateMethod();
  };
  
  return {
    someMethod: someMethod,
    anotherMethod: anotherMethod
  };

})();

var ModuleTwo = (function (Module) {
	Module.extension = function () {
		// another method!
		console.log("LOGGING: Module.extension");
	};
	return Module;
})(Module || {});