d3.queue()
    .defer(d3.json, "../data/tx_counties.topojson")
    .defer(d3.csv, "../data/texas_last_statement.csv")
    .await(ready)

var div = d3.select("body")
    .append("div") 
    .attr("class", "tooltip")       

var viewportWidth = document.getElementById("map-container").offsetWidth
var viewportHeight = document.getElementById("map-container").offsetHeight/2
var width = viewportWidth * .97
var height = width/1.85

//Define map projection 
var projection = d3.geoAlbers()
    .center([0,31.9686])
    .rotate([99.9018,0])
    .parallels([35,37])
    .scale([width*15/3.5])
    .translate([width/2,height/2])

//Define path generator
var path = d3.geoPath()
    .projection(projection)

var svg = d3.select("#map-container")
    .append("svg")
    .attr("width",width)
    .attr("height",height)

function ready(error, geo, data) {
  if (error) throw error

  drawMap(geo, data)

}


d3.select(window).on('resize', resize)
function resize() {
      
  width = parseInt(d3.select('#map-container').style('width'))
  width = document.getElementById("map-container").offsetWidth * .97
  height = width/1.85

  projection
    .center([0,31.9686])
    .rotate([99.9018,0])
    .parallels([35,37])
    .scale([width*15/3.5])
    .translate([width/2,height/2])

  
  d3.select("#map-container").attr("width",width).attr("height",height)
  d3.select("svg").attr("width",width).attr("height",height)

  d3.selectAll("path").attr('d', path).style("stroke", "white")

}


function drawMap(geo, data){

  var countByCounty = d3.nest()
    .key(function(d) { return d.CountyOfConviction })
    .rollup(function(v) { return v.length })
    .entries(data)

  var countNum = countByCounty.map(d => d.value)
  countNum.push(0)

  var color = d3.scaleThreshold()
  .domain([1,5,10,20,25,40,50,60,150])
  // .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)","rgb(33,113,181)","rgb(8,81,156)","rgb(8,48,107)","rgb(3,19,43)"])
  .range(["rgb(255,247,240)", "rgb(247,228,221)", "rgb(239,219,208)", "rgb(225,202,190)", "rgb(214,189,157)", "rgb(198,146,129)","rgb(181,133,103)","rgb(156,101,58)","rgb(107,68,28)","rgb(53,19,11)"])

      

    svg.append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(geo, geo.objects.tx_counties).features)
    .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) {

        var numberoffenders = countByCounty.filter(county => county.key === d.properties.COUNTY.slice(0, -7))

        if (numberoffenders[0]){
          number_value = numberoffenders[0].value
        }else{
          number_value = 0
        }

        return color(number_value)

      })
      .on('mouseover',function(d){
        var numberoffenders = countByCounty.filter(county => county.key === d.properties.COUNTY.slice(0, -7))

        if (numberoffenders[0]){
          var number_value = numberoffenders[0].value
          div.transition()
            .duration(200)
            .style("opacity", .9)
          div.html("<div style='margin-top:7px'><strong style='font-size:16px'>" + d.properties.COUNTY.slice(0, -7) + "<br></strong></div>" + "<span><strong style='color:black'>" + number_value.toString() +"</strong> offenders</span>")
            .style("left", (d3.event.pageX + 32) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
        }else{
          div.transition()
            .duration(200)
            .style("opacity", .9)
          div.html("<div style='margin-top:7px'><strong style='font-size:16px'>" + d.properties.COUNTY.slice(0, -7) + "<br></strong></div>" + "<span>No offenders</span>")
            .style("left", (d3.event.pageX + 32) + "px")
            .style("top", (d3.event.pageY - 28) + "px")
        }

    })
    .on('mouseout', function(d){
      div.transition()
       .duration(500)
       .style("opacity", 0)

    })

    svg.append("path")
        .attr("class", "state-borders")
        .attr("d", path(topojson.mesh(geo, geo.objects.tx_counties, function(a, b) {return a !== b })))

}
