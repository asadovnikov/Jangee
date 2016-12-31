(function() {
  'use strict';

  angular
    .module('jangee')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
