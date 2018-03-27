d3.queue()
    .defer(d3.csv, "../data/texas_last_statement.csv")
    .await(ready)

function ready(error, data) {
  if (error) throw error

  var offenders_sum = d3.nest()
    .key(function(d) { return d.Race })
    .rollup(function(v) { return {
      count: v.length,
      num_victim: d3.sum(v, function(d) { return parseInt(d.NumberVictim) }),
      avg_num_victim: d3.mean(v, function(d) { return parseInt(d.NumberVictim) })
    } })
    .entries(data)

  drawGraph1(offenders_sum)
  drawGraph2(offenders_sum)
  drawGraph3(data)

}

// Number of Victim Group by Offender Race
function drawGraph1(offenders_sum){
    
  var races = offenders_sum.map(d => d.key)
  var color = d3.scaleOrdinal()
    .domain(races)
    .range(["#ead8d0", "#f7e4dd", "#dec0bb", "#847f87"])

  var svg_graph1 = d3.select("#graph-1").append("svg")
  
  var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    x = d3.scaleBand().padding(0.1),
    y = d3.scaleLinear()

  var g_graph1 = svg_graph1.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  g_graph1.append("g")
    .attr("class", "axis axis--x")

  var bounds = svg_graph1.node().getBoundingClientRect(),
    width = bounds.width - margin.left - margin.right,
    height = bounds.height - margin.top - margin.bottom

  x.domain(offenders_sum.map(function (d) { return d.key }))
  y.domain([0, d3.max(offenders_sum, function (d) { return d.value.count })])

  draw_inside_graph1()
  d3.select(window).on('resize', draw_inside_graph1)

  function draw_inside_graph1(){
    x.rangeRound([0, width])
    y.rangeRound([height, 0])

    g_graph1.select(".axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))


    var g_bar_text = g_graph1.append("g")

    var bars = g_bar_text.selectAll("rect").data(offenders_sum)
    // ENTER
    bars.enter().append("rect")
      .attr("class", "bars")
      .attr("x", function (d) { return x(d.key) })
      .attr("y", function (d) { return y(d.value.count) })
      .style("fill", function(d){ return color(d.key)})
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return height - y(d.value.count) })


    var texts = g_bar_text.selectAll("text").data(offenders_sum)
    // ENTER
    texts.enter().append("text")
      .attr("x", function (d) { return x(d.key) + 20})
      .attr("y", function (d) { return y(d.value.count) - 5 })
      .style("margin-bottom", "10")
      .text(function(d){return d.value.count})

    }

}

// Number of Offender Group by Offender Race
function drawGraph2(offenders_sum){

  var races = offenders_sum.map(d => d.key)
  var color = d3.scaleOrdinal()
    .domain(races)
    .range(["#ead8d0", "#f7e4dd", "#dec0bb", "#847f87"])

  var svg_graph2 = d3.select("#graph-2").append("svg")
  
  var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    x = d3.scaleBand().padding(0.1),
    y = d3.scaleLinear()

  var g_graph2 = svg_graph2.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  g_graph2.append("g")
    .attr("class", "axis axis--x")


  var bounds = svg_graph2.node().getBoundingClientRect(),
    width = bounds.width - margin.left - margin.right,
    height = bounds.height - margin.top - margin.bottom

  x.domain(offenders_sum.map(function (d) { return d.key }))
  y.domain([0, d3.max(offenders_sum, function (d) { return d.value.avg_num_victim })])

  draw_inside_graph2()
  d3.select(window).on('resize', draw_inside_graph2)

  function draw_inside_graph2(){
    x.rangeRound([0, width])
    y.rangeRound([height, 0])

    g_graph2.select(".axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))


    var g_bar_text = g_graph2.append("g")

    var bars = g_bar_text.selectAll("rect").data(offenders_sum)
    bars.enter().append("rect")
      .attr("class", "bars")
      .attr("x", function (d) { return x(d.key) })
      .attr("y", function (d) { return y(Number((d.value.avg_num_victim).toFixed(2))) })
      .style("fill", function(d){ return color(d.key)})
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return height - y(Number((d.value.avg_num_victim).toFixed(2))) })


    var texts = g_bar_text.selectAll("text").data(offenders_sum)
    texts.enter().append("text")
      .attr("x", function (d) { return x(d.key) + 20})
      .attr("y", function (d) { return y(Number((d.value.avg_num_victim).toFixed(2))) - 5 })
      .style("margin-bottom", "10")
      .text(function(d){return Number((d.value.avg_num_victim).toFixed(2))})

    }

}

function drawGraph3(data){

}

