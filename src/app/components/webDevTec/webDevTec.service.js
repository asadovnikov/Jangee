(function() {
  'use strict';

  angular
      .module('jangee')
      .service('webDevTec', webDevTec);

  /** @ngInject */
  function webDevTec() {
    var data = [
      {
        'title': 'Image 1',
        'url': 'https://angularjs.org/',
        'description': 'Tru la la',
        'logo': 'http://reproarte.com/images/stories/virtuemart/product/turner_joseph_mallord_william/art-04_schneesturm.jpg'
      }
    ];

    this.getTec = getTec;

    function getTec() {
      return data;
    }
  }

})();
