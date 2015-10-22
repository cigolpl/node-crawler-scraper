'use strict';

(function (module) {

  module.makeSuite = function addSuite(name, tests) {

    describe(name, function describe() {
      before(function before(done) {
        done();
      });

      tests();

      after(function after(done) {
        done();
      });
    });
  };
})(exports);
