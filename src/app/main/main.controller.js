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


      $(window).scroll(function(){
        var velocity = 0.5;
        var viewLineOffset = 0;
        var pos = $(window).scrollTop();
        var viewLine = pos + $(window).height() - viewLineOffset; //bottomline
        console.log(viewLine);

        $('.photo-grid-wrapper img').each(function(index, value){

          var el = $(value);

          if(el.parent().offset().top > viewLine)
          {
            return;
          }

          if(el.parent().offset().top + el.parent().height() + $(window).height() < viewLine){
            return;
          }

          if(el.attr('data-image') === 'imgTall'){

            var imgVelocity = el.attr('data-velocity');
            if(imgVelocity === undefined) {
              var imgOffset = el.parent().height() - el.height();
              imgVelocity = imgOffset/$(window).height();
              imgVelocity = imgVelocity*-1;
              el.attr('data-velocity', imgVelocity);
            }

            var newPosition = el.position().top - (((pos - previousPosition)*imgVelocity));

            el.attr('data-top', newPosition);

            el.css({
              top: newPosition + 'px'
            });
            if(el.attr('src') === '%2Fassets%2Fimages%2Fcompressed%2Frabbit.jpg')
            {
              console.log('previous position: ' + previousPosition);
              console.log('scroll position: ' + pos);
              console.log('scrollDiff: ' + (pos - previousPosition));
              console.log('pos ' + el.position().top);
              console.log('new position for rabbit is: ' + newPosition);
            }

          }
          else{
            var imgVelocity = el.attr('data-velocity');
            if(imgVelocity === undefined) {
              var imgOffset = el.parent().width() - el.width();
              imgVelocity = imgOffset/$(window).width();
              imgVelocity = imgVelocity*-1;
              el.attr('data-velocity', imgVelocity);
            }
            var newPosition = el.position().left - (((pos - previousPosition)*imgVelocity));

            el.attr('data-top', newPosition);

            el.css({
              left: newPosition + 'px'
            });


          }

        });
        previousPosition = $(window).scrollTop();
      });
    }

    function getWebDevTec() {

      $http.get('/app/info.json').then(function(response){
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
