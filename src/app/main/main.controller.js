(function() {
  'use strict';

  angular
    .module('jangee')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, webDevTec, toastr, $http, $scope, $templateCache, $mdDialog) {
    var vm = this;
    $scope.goodImages = [];
    $scope.chunks = [];
    $scope.images = [];
    vm.images = $scope.goodImages;

    vm.awesomeThings = [];
    $scope.gridOptions = {
      urlKey      :     "url",
      sortKey     :     "nth",
      onClicked   :     function(image) {
        //vm.awesomeThings;
        //$scope.goodImages.push(image);
        //toastr.success(image.path);
        //alert(JSON.stringify($scope.goodImages))
      },
      onDOMReady   :     function() {
        console.log ("built completed!")
        $scope.isBuildingGrid = false;


      },
      margin      :     5,
      maxLength   :     5,
      isSquare : true
    };


    activate();

    function activate() {
      $templateCache.put("photo_grid.html",
        "<ul class='photo-grid-wrapper' ng-style = 'parentStyle'><li data-image='{{image.css_class}}' class='grid-cell' ng-repeat= 'image in loadedImages track by $index' ng-style = 'image.cellStyle' ng-click='cellClicked(image)' end-repeat='' ng-attr-data-src='{{image[defaultOptions.urlKey] | photoUrlSafe}}'><img data-image='{{image.css_class}}' class='grid-cell-image' ng-style = 'image.imageStyle' ng-src='{{image[defaultOptions.urlKey]}}' alt='#'/></li></ul>");
      getWebDevTec();
      $('.splash-screen').addClass('doIt');
      $timeout(function() {
        $('.splash-screen').addClass('ready');
        $('.md-button').addClass('available');
      }, 1000);

      var previousPosition =  $(window).scrollTop();

      function moveHorizontaly(el, pos, previousPosition){
        var horOffset = el.parent().width() - el.width();
        var velocity = horOffset/$(window).width();
        velocity = velocity*-1;
        var newPosition = el.position().left - (((pos - previousPosition)*velocity));

        var delta = el.parent().width() - el.width();

        var deltaOffset = newPosition > 0 ? newPosition : newPosition*-1;
        var modalDelta = delta > 0 ? delta: delta* -1;
        if(deltaOffset > modalDelta)
        {
          return;
        }

        if(newPosition > 0)
        {
          return;
        }
        el.attr('data-top', newPosition);

        el.css({
          left: newPosition + 'px'
        });

      }

      function moveVerticaly(el, pos, previousPosition){
        var imgOffset = el.parent().height() - el.height();
        var imgVelocity = imgOffset/$(window).height();
        imgVelocity = imgVelocity*-1;

        var newPosition = el.position().top - (((pos - previousPosition)*imgVelocity));
        if(newPosition > 0)
        {
          return;
        }

        var delta = el.parent().height() - el.height();

        var deltaOffset = newPosition > 0 ? newPosition : newPosition*-1;
        var modalDelta = delta > 0 ? delta: delta* -1;
        if(deltaOffset > modalDelta)
        {
          return;
        }


        el.attr('data-top', newPosition);

        el.css({
          top: newPosition + 'px'
        });

      }


      $(window).scroll(function(){
        var viewLineOffset = 0;
        var pos = $(window).scrollTop();
        var viewLine = pos + $(window).height() - viewLineOffset; //bottomline



        $('.photo-grid-wrapper img').each(function(index, value){

          var el = $(value);

          if(el.parent().offset().top > viewLine || el.parent().offset().top + el.parent().height() + $(window).height() < viewLine)
          {
            return;
          }

          if(el.width() > el.parent().width())
          {
            moveHorizontaly(el, pos, previousPosition);
          }
          if(el.height() > el.parent().height()){
            moveVerticaly(el, pos, previousPosition);
          }

        });
        previousPosition = $(window).scrollTop();
      });
    }

    function getWebDevTec() {

      $http.get('app/info.json').then(function(response){
        vm.awesomeThings = response.data;
        var imageChunk = [];
        $scope.images = [];
        var counter = 0;
        for(var key in response.data){
          if(counter <5){
            imageChunk.push(response.data[key]);
            counter++;
          }
          else {
            $scope.chunks.push(imageChunk);
            imageChunk = [];
            imageChunk.push(response.data[key]);
            counter = 1;
          }
          $scope.images.push(response.data[key]);
        }
        if(imageChunk.length > 0){
          $scope.chunks.push(imageChunk);
        }
        console.log($scope.images.length);
        //$scope.images.push({"1": "1"});

      });


      //function getRandomSize(min, max) {
      //  return Math.round(Math.random() * (max - min) + min);
      //}
      //
      //for (var i = 0; i < 25; i++) {
      //  var width = getRandomSize(200, 400);
      //  var height =  getRandomSize(200, 400);
      //  var imageSrc = 'http://lorempixel.com/'+width+'/'+height+'/cats';
      //  vm.awesomeThings.push({src: imageSrc, name: 'test'})
      //  //$('#photos').append('<img src="//www.lorempixel.com/'+width+'/'+height+'/cats" alt="pretty kitty">');
      //}
      ////vm.awesomeThings = webDevTec.getTec();

    }
  }
})();
