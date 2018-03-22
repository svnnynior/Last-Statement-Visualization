var format = d3.format(",")


var div = d3.select("body")
    .append("div") 
    .attr("class", "tooltip")       

var viewportWidth = document.getElementById("map-container").offsetWidth
var viewportHeight = document.getElementById("map-container").offsetHeight/2
var width = viewportWidth * .97;
var height = width/1.85;

//Define map projection 
var projection = d3.geoAlbers()
    .center([0,31.9686])
    .rotate([99.9018,0])
    .parallels([35,37])
    .scale([width*15/3.5])
    .translate([width/2,height/2]);

//Define path generator
var path = d3.geoPath()
    .projection(projection)

var svg = d3.select("#map-container")
    .append("svg")
    .attr("width",width)
    .attr("height",height);

d3.json("../data/tx_counties.topojson", function(error, texas) {
  if (error) throw error;

  svg.append("g")
      .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(texas, texas.objects.tx_counties).features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) { 
        return "#e4e4e4c2;" 
      })
      .on('mouseover',function(d){

        div.transition()
         .duration(200)
         .style("opacity", .9)
        console.log(d.properties.SQUARE_MIL)
        div.html("<strong style='font-size:16px;margin-top:5px'>" + d.properties.COUNTY + "<br></strong>" + "<span>" + d.properties.SQUARE_MIL +" offenders</span>")
          .style("left", (d3.event.pageX + 32) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
        console.log(d)
      })
      .on('mouseout', function(d){

        div.transition()
         .duration(500)
         .style("opacity", 0)

      });

  svg.append("path")
      .attr("class", "state-borders")
      .attr("d", path(topojson.mesh(texas, texas.objects.tx_counties, function(a, b) {return a !== b; })))
})

d3.select(window).on('resize', resize);

function resize() {
  
  width = parseInt(d3.select('#map-container').style('width'));
  width = document.getElementById("map-container").offsetWidth * .97;
  height = width/1.85;

 projection
    .center([0,31.9686])
    .rotate([99.9018,0])
    .parallels([35,37])
    .scale([width*15/3.5])
    .translate([width/2,height/2]);

  
 d3.select("#map-container").attr("width",width).attr("height",height);
 d3.select("svg").attr("width",width).attr("height",height);

 d3.selectAll("path").attr('d', path);


}