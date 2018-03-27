d3.queue()
  .defer(d3.csv, "../data/texas_last_statement.csv")
  .await(ready)

function ready(error, data) {
  if (error) throw error

  var races_data = d3.nest()
    .key(function(d) { return d.Race })
    .rollup(function(v) { return {
      // count: v.length,
      // num_hispanic_victim: d3.sum(v, function(d) { return parseInt(d.HispanicVictim) }),
      // num_white_victim: d3.sum(v, function(d) { return parseInt(d.WhiteVictim) }),
      // num_black_victim: d3.sum(v, function(d) { return parseInt(d.BlackVictim) }),
      // num_other_victim: d3.sum(v, function(d) { return parseInt(d.VictimOther) }),
      avg_hispanic_victim: d3.sum(v, function(d) { return parseInt(d.HispanicVictim)/v.length }),
      avg_white_victim: d3.sum(v, function(d) { return parseInt(d.WhiteVictim)/v.length }),
      avg_black_victim: d3.sum(v, function(d) { return parseInt(d.BlackVictim)/v.length }),
      avg_other_victim: d3.sum(v, function(d) { return parseInt(d.VictimOther)/v.length }),
      // avg_hispanic_victim: d3.sum(v, function(d) { return Number(parseInt(d.HispanicVictim)/v.length).toFixed(2) }),
      // avg_white_victim: d3.sum(v, function(d) { return Number(parseInt(d.WhiteVictim)/v.length).toFixed(2) }),
      // avg_black_victim: d3.sum(v, function(d) { return Number(parseInt(d.BlackVictim)/v.length).toFixed(2) }),
      // avg_other_victim: d3.sum(v, function(d) { return Number(parseInt(d.VictimOther)/v.length).toFixed(2) })
    } })
    .entries(data)

    var transformed_data = []
    races_data.forEach(d => {
      transformed_data.push(...[
        {
          offender_race: d.key,
          victim_race: "Hispanic",
          value: d.value.avg_hispanic_victim
        },{
          offender_race: d.key,
          victim_race: "White",
          value: d.value.avg_white_victim
        },{
          offender_race: d.key,
          victim_race: "Black",
          value: d.value.avg_black_victim
        },{
          offender_race: d.key,
          victim_race: "Other",
          value: d.value.avg_other_victim
        },
      ])
    })
  
  console.log(transformed_data)
  drawHeatmap(transformed_data)

}

function drawHeatmap(races_data){

  var div = d3.select("body")
    .append("div") 
    .attr("class", "heatmaptip")      

  var margin = { top: 50, right: 0, bottom: 100, left: 30 },
    buckets = 3,
    colors = ["rgb(255,247,240)", "rgb(255,247,240)","rgb(225,202,190)","rgb(198,146,129)"] 
    offender_races = ["Hispanic", "White", "Black", "Other"],
    victim_races = ["Hispanic", "White", "Black", "Other"],
    x = d3.scaleBand().padding(0.1),
    y = d3.scaleBand().padding(0.1)

  var svg_heatmap = d3.select("#race-heatmap").append("svg")

  var bounds = svg_heatmap.node().getBoundingClientRect(),
    width = bounds.width - margin.left - margin.right,
    height = bounds.height - margin.top - margin.bottom,
    gridSize = Math.floor(width /7),
    legendElementWidth = gridSize*2

  svg_heatmap.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  x.domain(races_data.map(function (d) { return d.offender_race }))
  y.domain(races_data.map(function (d) { return d.victim_race }))


  const offenderLabels = svg_heatmap.selectAll(".offenderLabel")
      .data(offender_races)
      .enter().append("text")
        .text(function (d) { return d })
        .attr("x", 4*gridSize + 90)
        .attr("y", function(d, i){ return i * gridSize + 10*i + 20})
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .style("fill", "black")
        .style("font-size", "12px")

  const victimLabels = svg_heatmap.selectAll(".victimLabel")
      .data(victim_races)
      .enter().append("text")
        .text((d) => d)
        .attr("x", function(d, i){ return i * gridSize + 12*i + 45})
        .attr("y", 15)
        .style("fill", "black")
        .style("font-size", "12px")

  var colorScale = d3.scaleQuantile()
      .domain([0, 0.01, 0.7, d3.max(races_data, (d) => d.value)])
      .range(colors)

  var cards = svg_heatmap.selectAll("rect")
      .data(races_data)

  console.log(colorScale.quantiles())

  cards.enter().append("rect")
    .attr("class", "heatmap-rect")
    .attr("x", function(d){ return (x(d.offender_race)) * gridSize * 5 + 40})
    .attr("y", function(d){ return (y(d.victim_race)) * gridSize * 5 + 20})
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width", gridSize)
    .attr("height", gridSize)
    .style("fill", function(d){ return colorScale(d.value)})
    .on('mouseover', function(d){
      div.transition()
        .duration(200)
        .style("opacity", .9)
      div.html("<div style='margin-top:7px'>" + Number(d.value).toFixed(2) + "</div>" )
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px")
    })
    .on('mouseout', function(){
      div.transition()
       .duration(500)
       .style("opacity", 0)
    })

  // cards.select("title").text(function(d){d.value})

}