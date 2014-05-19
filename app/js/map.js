(function(){
  $('#stop').hide();
  $('#weekend').hide();

  var url = 'https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png',
      attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id = 'examples.map-20v6611k'
    tilelayer = new L.TileLayer(url, {maxZoom: 18, attribution: attribution, id: id});
 
  var map = new L.Map('map', {
    center: new L.LatLng(40.725,-73.98), 
    zoom: 13, 
    layers: [tilelayer]
  });
          
  // Initialize the SVG layer
  map._initPathRoot()
 
  // Pick up the SVG from the map object
  var svg = d3.select('#map').select('svg'),
  g = svg.append('g');
  
  var color = d3.scale.category20();

  queue()
      .defer(d3.json, 'app/data/nodes.json')
      .defer(d3.json, 'app/data/edges.json')
      .defer(d3.json, 'app/data/neighborhoods.json')
      .await(ready);

  function ready(error, nodes, edges, neighborhoods) {
    L.geoJson(neighborhoods).addTo(map).bringToBack();

    var transform = d3.geo.transform({point: projectPoint}),
        path = d3.geo.path().projection(transform);

    // Use Leaflet to implement a D3 geometric transformation.
    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }

    var radius = d3.scale.sqrt()
      .domain([0, 250])
      .range([0, 10]);



        var edge = g.selectAll('.edge')
          .data(edges.features)
          .enter().append('path')
          .attr('class', 'edge')
          .attr('stroke', function(d) { return color(d.properties.NTAName);});


        var node = g.selectAll('.node')
          .data(nodes.features)
          .enter().append('path')
          .attr('class', 'node')
          .attr('fill', function(d) { return color(d.properties.NTAName);}); 

        map.on('viewreset', update);

        var weekday = 1;
        var hour = 0;

        var regex = /(M\w+,(-)?\w+)(L)([0-9]+)(,)([0-9]+)(L)([0-9]+)(,)([0-9]+)/;
        var sub = "$1Q $4 $6 $8 $10";

        function updateedge() {
          edge
          .attr('d', function(d) { return path(d).replace(regex, sub);})
          .attr('stroke-width', function(d) {
            if(weekday) {
              return ((d.properties.count[weekday][hour])/15);
            }
            else {
              return ((d.properties.count[weekday][hour])/6);
            };
          });
        };

        function updatenode() {
          node
            .attr('d', path.pointRadius(function(d) { 
              if(weekday) {
                return radius(d.properties.count[weekday][hour]);
              }
              else {
                return radius((d.properties.count[weekday][hour])*0.4);
              };
            })
          );
        };

        function animateedge() {
          edge.transition()
            .duration(1000)
            .ease('linear')
            .attr('d', function(d) { return path(d).replace(regex, sub);})
            .attr('stroke-width', function(d) {
            if(weekday) {
              return ((d.properties.count[weekday][hour])/15);
            }
            else {
              return ((d.properties.count[weekday][hour])/6);
            };
          })
        };

        function animatenode() {
          node.transition()
            .duration(1000)
            .ease('linear')
            .attr('d', path.pointRadius(function(d) { 
              if(weekday) {
                return radius(d.properties.count[weekday][hour]);
              }
              else {
                return radius((d.properties.count[weekday][hour])*0.4);
              };
            })
          );
        };


        function update() {
          updatenode();
          updateedge();  
        }

        $("#slider").noUiSlider({
          start: 0,
          step: 1,
          range: {
            'min': 0,
            'max': 23
          },
          connect: "lower",
          serialization: {
            lower: [
              $.Link({
                target: $("#time"),
                method: "html",
                format: {
                  decimals: 0,
                  to: function(value) {
                    if (value > 12) {
                      return value - 12 + " PM";
                    }
                    else if (value == 0) {
                      return "12 AM";
                    }
                    else {
                      return value + " AM";
                    }
                  }
                } 
              })
            ]
          }
        });

        function sliderchange() {   
          hour = parseInt($('#slider').val());
          if(animating) {
            toggleanimation();
          };
          animatenode();
          animateedge();
        };

        $('#slider').on({
          slide: function(){
            sliderchange();
          },
          set: function(){
            sliderchange();
          }
        });

        $('#slider').change(function() {sliderchange();});
        

        function toggleanimation() {
          if(animating){
            $('#stop').hide();
            $('#start').show();
          }
          else {
            $('#start').hide();
            $('#stop').show();
          };
          animating = !animating;
          animate(animating);
        };

        function toggleweek() {
          if(weekday){
            $('#weekday').hide();
            $('#weekend').show();
          }
          else {
            $('#weekend').hide();
            $('#weekday').show();
          };
          weekday ^= 1;
          update();
        };

        var animating = false;

        $('#start, #stop').click(function() {toggleanimation()});
        $('#weekend, #weekday').click(function() {toggleweek()});

        function animate(animating) {
          if(animating) {
            hour++;
            $("#slider").val(hour);
            animatenode();
            animateedge();
            if(hour == 23) {
                hour = 0;
                $("#slider").val(hour);
                toggleanimation();
              }
            window.interval = setInterval(function() {
              hour++;
              $("#slider").val(hour);
              animatenode();
              animateedge();
              if(hour == 23) {
                hour = 0;
                $("#slider").val(hour);
                clearInterval(interval);
                toggleanimation();
              }
            }, 1000);
          }
          else {
            clearInterval(window.interval);
          }
        };


      update();

    };

}());