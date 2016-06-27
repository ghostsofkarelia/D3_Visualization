
/**
This class contains all the methods and helper functions to get & transform data for the bubble chart. It creates the bubble chart and updates it 
on user actions
@author: Akshay Singh 
**/
var Chart = function() {
 seattleGovData = [];
 this.getData = function() { //Function to retrieve data via an ajax call
  $.ajax({
   async: false,
   url: '/getData',
   success: function(data) {
    seattleGovData = JSON.parse(data)
   }
  });
 }

 this.prepareData = function() { //Preparing data for the D3 bubble charts
  //Call to get data on first call of render data
  //debugger;
  var bubbleData = [];
  for (var dept in seattleGovData) {
   var sum = 0;
   var bclString = '';
   for (var bcl in seattleGovData[dept]) {
    var array = seattleGovData[dept][bcl];
    bclString = bcl
    for (var i = 0; i < array.length; i++) {
     sum = sum + array[i].proposed; //Calculate total exp of each bcl
    }
   }
   //Creating a D3 bubble chart object
   if (!isNaN(sum)) {
    var bubbleObj = {};
    bubbleObj.name = dept;
    bubbleObj.className = dept.toLowerCase();
    bubbleObj.size = sum;
    bubbleObj.bcl = bclString;
    var color = "hsl(" + Math.random() * 360 + ",100%,50%)"; //Assigning random color
    bubbleObj.color = color;
    bubbleData.push(bubbleObj);
   }
  }
  return {
   children: bubbleData //return a valid D3 bubble object
  };
 }

 this.prepareUpdatedData = function(department, bcl) { //Preparing data for D3 bubble charts on click of Dept bubble
  var bubbleDataNextLevel = [];
  var sum = 0;
  for (var bclVar in seattleGovData[department]) {
   //debugger;
   var deptObj = seattleGovData[department][bclVar];
   for (var array in deptObj) {
    var name = deptObj[array].name;
    var proposed = deptObj[array].proposed;
    console.log(name + " and " + proposed);
    if (proposed != 0) {
     var color = "hsl(" + Math.random() * 360 + ",100%,50%)";
     bubbleDataNextLevel.push({
      name: name,
      className: name.toLowerCase(),
      size: proposed,
      color: color
     });
    }
   }
  }
  //console.log(bubbleDataNextLevel);
  return {
   children: bubbleDataNextLevel
  }
 }
 
 this.createBubbleChart = function() {

  var tempChartObj = this;
  var svg = d3.select('#vis-container')   //the SVG to add stuff to
   .append('svg')
   .attr('height', 800) //can adjust size as desired
   .attr('width', 800)
   //.style('border','1px solid gray'); //to show a border

  //Creating bubble chart
  var bubble = d3.layout.pack()
   .size([800, 800])
   .value(function(d) {
    return d.size;
   })
   .sort(null)
   .padding(1.5);

  //Creating a D3 tooltip
  var tip = d3.tip()
   .attr('class', 'd3-tip')
   .offset([-10, 0])
   .html(function(d) {
    return "<span style='color:black'>" + d.bcl + " has expenditure " + formatNumberAsMoney(d.size) + "</span>";
   });

  //Filter the outer bubble
  var nodes = bubble.nodes(this.prepareData())
   .filter(function(d) {
    return !d.children;
   }); // filter out the outer bubble

  //Adding click events and appending G element
  var vis = svg.selectAll('circle')
   .data(nodes)
   .enter()
   .append("g")
   .on("click", function(d) {
    //console.log(d);
    tempChartObj.updateBubbleChart(d.name, d.bcl, tip)
   })
   .attr("class", "node")
   .attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
   })

  vis.on('mouseover', function() {
   d3.select(this).transition().attr('r', function(d) {
    return d.bigradius;
   });
  });

  vis.append('circle')
   //.attr("stroke", "gray")
   .attr('r', function(d) {
    return d.r;
   })
   .attr('class', function(d) {
    return d.className;
   })
   .style('fill', function(d) {
    return d.color;
   });

  //Creating bubble labels
  vis.append("text")
   .attr("dy", ".3em")
   .style("text-anchor", "middle")
   .style("font-size", function(d) {
    var len = d.name.substring(0, d.r / 3).length;
    var size = d.r / 3;
    size *= 5 / len;
    size += 1;
    return Math.round(size) + 'px';
   })
   .text(function(d) {
    return d.name;
   });

  //Calling tip functions on svg
  svg.call(tip);

  //On mouseover and out events
  vis.on('mouseover', tip.show)
   .on('mouseout', tip.hide)

 }

 this.updateBubbleChart = function(department, bcl, tip) { //Code to update D3 bubble chart with data from prepareUpdatedData
  var tempChartObj = this;
  $("#citation").remove();
  $("#mainDiv").append("<button type='button'id='reset'onclick='return resetChart();' class='btn btn-primary btn-md' style='margin-top:1%;margin-bottom:2%;'>Reset Graph</button>");
  $("#mainDiv").append("<p id='citation'>Data retrieved from https://data.seattle.gov/Finance/Expenditures-dollars/frxe-s3us")
  var $title = $('#title');
  $title.text("Proposed Expenditure for each Program within Dept."); //Changing title
  d3.select("svg").remove();
  tip.destroy(); //destorying higher level tooltip
  $(".d3-tip n").remove();
  var svg = d3.select('#vis-container')
   .append('svg')
   .attr('height', 800) //can adjust size as desired
   .attr('width', 800);
  //.style('border','1px solid gray'); //to show a border

  var bubble = d3.layout.pack()
   .size([800, 800])
   .value(function(d) {
    return d.size;
   })
   .sort(null)
   .padding(1.5);

  var nodes = bubble.nodes(this.prepareUpdatedData(department, bcl)) //Calling update function to show drilled down data
   .filter(function(d) {
    return !d.children;
   }); // filter out the outer bubble

  var visEnter = svg.selectAll('circle')
   .data(nodes)
   .enter()
   .append("g")
   //.on("click", function(d){console.log(d);prepareDataOnclick(d.name,d.bcl)})
   .attr("class", "node")
   .attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
   })

  visEnter.append('circle')
   //.attr("stroke", "gray")
   .attr('r', function(d) {
    return d.r;
   })
   .attr('class', function(d) {
    return d.className;
   })
   .style('fill', function(d) {
    return d.color;
   })
   .transition()
   .duration(240)
   .style('opacity', 1);

  visEnter.append('circle')
    //.attr("stroke", "gray")
    .attr('r', function(d) {
      return d.r;
    })
    .attr('class', function(d) {
      return d.className;
    })
    .style('fill', function(d) {
      return d.color;
    })
    .transition()
    .duration(240)
    .style('opacity', 1);

	//Adding labels to bubbles
  visEnter.append("text")
   .attr("dy", ".3em")
   .style("text-anchor", "middle")
   .style("font-size", function(d) {
    var len = d.name.substring(0, d.r / 3).length;
    var size = d.r / 3;
    size *= 6 / len;
    size += 1;
    return Math.round(size) + 'px';
   })
   .text(function(d) {
    return d.name;
   });

  //Adding toolti[]
  var tip = d3.tip()
   .attr('class', 'd3-tip')
   .offset([-10, 0])
   .html(function(d) { //Formatting tooltip
    return "<span style='color:black'>" + d.name + " has expenditure " + formatNumberAsMoney(d.size) + "</span>";
   });

  svg.call(tip); //Binding tip to the svg

  visEnter.on('mouseover', tip.show) //Mouse events
   .on('mouseout', tip.hide)
 }

 formatNumberAsMoney = function(value) { //Helper function to format number as money
  var num = '$' + value.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  return num;
 }

 resetChart = function() { //Resetting chart on click of RESET button
  location.reload(true);
 }

}


$(function() { //on html page ready ready run the following code
 //Adding text to the citation element
 var $source = $('#citation');
 $source.text("Data retrieved from https://data.seattle.gov/Finance/Expenditures-dollars/frxe-s3us. Click on ARTS or FG for comprehensive results");

 //Create chart object
 var chart = new Chart();
 
 //Get data using an API
 chart.getData();
 
 //Create bubble chart with data
 chart.createBubbleChart();

})