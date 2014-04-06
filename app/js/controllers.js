'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('StartCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
        var services = $scope.services = ['Dublin Bus','Luas','Irish Rail','Bus Eireann'];
        $scope.selectedService = '';
        $scope.routes = [];
        $scope.ROUTE_MESSAGE = "Select a Route";
        $scope.selectedRoute = {};
        $scope.selectedRoute.label = $scope.ROUTE_MESSAGE;
        $scope.stops = ["D", "E", "and F"];
        $scope.FROM_STOP_MESSAGE = "From";
        $scope.TO_STOP_MESSAGE = "To";
        $scope.fromStop = {};
        $scope.fromStop.STOPNAME = $scope.FROM_STOP_MESSAGE;
        $scope.toStop = {};
        $scope.toStop.STOPNAME = $scope.TO_STOP_MESSAGE;
        var days = $scope.days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        $scope.selectedDay = days[new Date().getDay()];
        var fares = $scope.fares = ["1.80", "2.35", "2.60", "3.05"];
        
        var fromStage = null;
        var toStage = null;
        
        $scope.duration = "";
        $scope.departureTime ="";
        $scope.expectedFare = "";
        
        $scope.loading = false;
        
        var generateResults = function() {
            if($scope.selectedRoute.label != $scope.ROUTE_MESSAGE && $scope.fromStop.STOPNAME != $scope.FROM_STOP_MESSAGE && $scope.toStop.STOPNAME != $scope.TO_STOP_MESSAGE) {
                var stagesTraveled = Math.abs(toStage - fromStage);
                var fareTier = 0;
                
                if(stagesTraveled < 4) fareTier = 0;
                if(stagesTraveled > 3 && stagesTraveled < 8) fareTier = 1;
                if(stagesTraveled > 7 && stagesTraveled < 14) fareTier = 2;
                if(stagesTraveled > 13) fareTier = 3;
                $scope.expectedFare = fares[fareTier];
                
                
                var route = $scope.selectedRoute.ROUTEID;
                var start = $scope.fromStop.STOPID;
                var stop = $scope.toStop.STOPID;
                
                var service_id = $routeParams.service_id || 1;
                
                
                $scope.loading = true;
                $http.get('api/getduration?service_id='+ service_id +'&route=' + route + '&start=' + start + '&stop=' + stop).success(function(data){
                    $scope.loading = false;
                    var avg = [];
                    var hours = [];
                    
                    for(var i = 0; i < data.length; i++) {
                        avg.push(parseFloat(data[i].avg_duration));
                        hours.push(data[i].hour);
                    }
                    console.log(avg);
                    initialiseChart(avg, hours);
                    // initialiseChart(data.sun);
                });
                
                // $scope.loading = true;
                // $http.get('api/getduration').success(function(data){
                //     $scope.loading = false;
                //     initialiseChart(data.thu);
                //     // initialiseChart(data.sun);
                // });
            }
        }
        
        $scope.selectService = function(service){
            $(".graphContainer").empty();
            $scope.routes = [];
            $scope.selectedRoute.label = $scope.ROUTE_MESSAGE;
            $scope.fromStop = {};
            $scope.fromStop.STOPNAME = $scope.FROM_STOP_MESSAGE;
            $scope.toStop = {};
            $scope.toStop.STOPNAME = $scope.TO_STOP_MESSAGE;
            
            switch(service) {
                case services[0]:
                    $scope.loading = true;
                    $http.get('api/getroutes/DUBLINBUS').success(function(data){
                        $scope.loading = false;
                        for(var i = 0; i < data.length; i++) {
                            data[i].ROUTEID = data[i].route_id;
                            data[i].ROUTESHORTNAME = data[i].route_short_name;
                            data[i].ROUTELONGNAME = data[i].route_long_name;
                            
                            data[i].label = data[i].ROUTESHORTNAME;
                        }
                        $scope.routes = data;
                        $scope.selectedService = service;
                    });
                    break;
                case services[1]:
                    $scope.loading = true;
                    $http.get('api/getroutes/LUAS').success(function(data){
                        $scope.loading = false;
                        for(var i = 0; i < data.length; i++) {
                            data[i].label = data[i].ROUTELONGNAME;
                        }
                        $scope.routes = data;
                        console.log($scope.routes);
                        $scope.selectedService = service;
                    });
                    break;
                case services[2]:
                    $scope.loading = true;
                    $http.get('api/getroutes/IR').success(function(data){
                        $scope.loading = false;
                        for(var i = 0; i < data.length; i++) {
                            data[i].label = data[i].ROUTELONGNAME;
                        }
                        $scope.routes = data;
                        $scope.selectedService = service;
                    });
                    break;
                case services[3]:
                    $scope.loading = true;
                    $http.get('api/getroutes/BE').success(function(data){
                        $scope.loading = false;
                        for(var i = 0; i < data.length; i++) {
                            data[i].label = data[i].ROUTELONGNAME;
                        }
                        $scope.routes = data;
                        $scope.selectedService = service;
                    });
                    break;
            }
        };
        
        $scope.selectRoute = function(index, route){
            $(".graphContainer").empty();
            $scope.fromStop = {};
            $scope.fromStop.STOPNAME = $scope.FROM_STOP_MESSAGE;
            $scope.toStop = {};
            $scope.toStop.STOPNAME = $scope.TO_STOP_MESSAGE;
            
            var direction = $routeParams.direction || 0;
            
            $scope.loading = true;
            var service = "";
            switch($scope.selectedService) {
                case services[0]:
                    service = "DUBLINBUS";
                    break;
                case services[1]:
                    service = "LUAS";
                    break;
                case services[2]:
                    service = "IR";
                    break;
                case services[3]:
                    service = "BE";
                    break;
            }
                $scope.selectedRoute = route;
            $http.get('api/getstops?direction='+ direction +'&service=' + service + "&route=" + $scope.selectedRoute.ROUTEID).success(function(data){
                $scope.loading = false;
                if($scope.selectedService === "Dublin Bus") {
                    for(var i = 0; i < data.length; i++) {
                        data[i].STOPID = data[i].stop_id;
                        data[i].STOPNAME = data[i].stop_name;
                    }
                }
                $scope.stops = data;
                $scope.trip_headsign = data[0].trip_headsign;
                console.log($scope.trip_headsign);
                
            });
        };
        
        $scope.selectFromStop = function(index, stop){
            $scope.fromStop = stop;
            
            fromStage = index;
            
            generateResults();
        };
        
        $scope.selectToStop = function(index, stop){
            $scope.toStop = stop;
            
            toStage = index;
            
            generateResults();
        };
        
        $scope.selectDay = function(index, day){
            $scope.selectedDay = day;
        };
        
        $scope.arriveTime = function(departure, duration) {
            // var ampm = false;
            // if(departure.slice(-2) === "PM") {
            //     ampm = true;
            // }
            // departure = departure.substr(0, departure.length - 2);
            // if(departure.split(":").length > 1) {
            //     var parts = departure.split(":");
            //     departure = (parseInt(parts[0]) * 60) + parseInt(parts[1]);
            // }
            // else {
            //     departure = parseInt(departure) * 60;
            // }
            
            // if(ampm)
            //     departure += 720;
            departure = departure * 60;
            var arrive = departure - duration;
            arrive = Math.round(arrive);
            
            var hours = Math.floor(arrive / 60); 
            var minutes = arrive % 60;
            
            var str = hours + ":";
            if(minutes < 10) {
                str = str + "0" + minutes;
            }
            else {
                str = str + minutes;
            }
            if(hours < 12)
                str = str + "AM";
            else
                str = str + "PM";
            
            console.log(str);
            
            return str;
        }
        
        var pointClick = function() {
            $scope.departureTime = this.category;
            $scope.duration = this.y;
            $scope.$apply();
        }
        
        /*------------------------------------Graph-----------------------------------------------------------------------*/ 
        var initialiseChart = function(durations, hours) {
            $scope.ready = true;
            
            var chart = $(".graphContainer").highcharts({
                
                chart: {
                   // width: $(document).width() - $(".controller").width(),
                    type: 'column',
                    backgroundColor: '#353a42',
 
                       
                },
                exporting: { 
                    enabled: false
                },
                title: {
                    text: 'Click a Bar',
                    x: -20, //center
                   style: {
                     color: '#fff',
                     font: ' "lato", sans-serif'
                  }
                },
                subtitle: {
                    text: '',
                    x: -20, //center
                   style: {
                     color: '#fff',
                     font: ' "lato", sans-serif'
                  }
                },plotOptions: {
                    column: {
                        pointPadding: 0,
                        groupPadding: 0,
                        borderWidth: 0, 
                        shadow: true
                    },
                    series: {
                      cursor: 'pointer',
                      point: {events: {click: pointClick}}
                     ,
                    states: {
                        hover: {
                            color: '#7ed979'
                        }
                    }
                   
                
                    }
                },
                  credits: {
                     enabled: false
                }
                ,
                xAxis: {
                    
                    title: {
                        text: 'Departure Time', //center
                           style: { fontFamily: '\'Lato\', sans-serif', lineHeight: '18px', fontSize: '18px', color:'#fff', marginTop: '50px' }
                    },labels: {
                        style: { fontFamily: '\'Lato\', sans-serif', lineHeight: '18px', fontSize: '10px', color:'#fff' }
    			    },
                    categories: hours//,
                       //minTickInterval: 2
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Journey Time (min)', //center
                         
                           style: { fontFamily: '\'Lato\', sans-serif', lineHeight: '18px', fontSize: '18px', color:'#fff' }
                    },gridLineWidth: 0,
                    
                    labels: {
                        style: {
                            color: '#fff',
                            font: '12px Lato',
                            
                        },
                    step:2
    			    }
                
            
                },
                tooltip: {
                    
                    valueSuffix: 'min',
                    backgroundColor: '#7ed979',
                    style: {
                        color : '#fff',
                        font: '12px Lato',
                       
                    }
                   
                },
                legend: {
                    itemStyle: {
                        color: '#fff',
                        fontSize: '12px',
                        fontfamily: 'lato'
                    },
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                series: [/*{
                    name: 'Maximum Time',
                    color: '#b585d6',
                    
                    lineWidth: 0,
                    marker: {
                        radius: 2
                    },
                    data: durations.max
                },*/ {
                    name: 'Average Time',
                    color: '#fff',
                     
                    lineWidth: 0,
                    marker: {
                        radius: 2
                    },
                    data: durations
                }/*, {
                    name: 'Minimum Time',
                    color: '#7ed979',
                    
                    lineWidth: 0,
                    marker: {
                        radius: 2
                    },
                    data: durations.min
                }*/],
                
                marker: {
                     radius: 2// Play around with this value as needed.
                }
            });
        }
        
        var opts = {
          lines: 13, // The number of lines to draw
          length: 8, // The length of each line
          width: 2, // The line thickness
          radius: 10, // The radius of the inner circle
          corners: 1, // Corner roundness (0..1)
          rotate: 0, // The rotation offset
          direction: 1, // 1: clockwise, -1: counterclockwise
          color: '#fff', // #rgb or #rrggbb or array of colors
          speed: 1, // Rounds per second
          trail: 30, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: 'auto', // Top position relative to parent in px
          left: 'auto' // Left position relative to parent in px
        };
        
        var target = document.getElementById('spinner-container');
        var spinner = new Spinner(opts).spin(target);
  }])
  
  /*-------------------------------------- FIN ---------------------------------*/