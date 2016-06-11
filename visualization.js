'use strict'; //strict mode: catch silly errors
//Saving data for global use
var seattleGovData = [];
var globalData = [];
//Your code goes here!

//Function to retrieve data via an ajax call
var getData = function() {
  $.ajax({
    async: false,
    url: 'https://data.seattle.gov/resource/i2xy-tcyk.json',
    success: function(data) {
      for (var i = 0; i < data.length; i++) {
        seattleGovData.push(data[i]);
      }
    }
  });
}
//Preparing data in a valid JSON format and returning the array
var DataPrep = function() {
  this.transformData = function() {
    getData();
    var expenditure = {};
    for (var i = 0; i < seattleGovData.length; i++) {
      var programsArray = [];
      var deptName = seattleGovData[i]['department'];
      var bclName = seattleGovData[i]['bcl'];
      var programName = seattleGovData[i]['program'];
      var proposed = parseInt(seattleGovData[i]['_2014_proposed']);
      var endorsed = parseInt(seattleGovData[i]['_2014_endorsed']);
      if (expenditure[deptName]) {
        //console.log("Exists");
        var temp = expenditure[deptName][bclName];
        if (temp) {
          temp.push({
            name: programName,
            proposed: proposed,
            endorsed: endorsed
          });
        }
      } else {
        if (deptName != '') {
          var bcl = {};
          programsArray.push({
            name: programName,
            proposed: proposed,
            endorsed: endorsed
          });
          bcl[bclName] = programsArray;
          expenditure[deptName] = bcl;
        }
      }
    }
    //console.log(expenditure);
    return expenditure;
  }
}

//Preparing data for the D3 bubble charts
var prepareData = function() {
  globalData = new DataPrep().transformData();
  var bubbleData = [];
  for (var dept in globalData) {
    var sum = 0;
    var bclString = '';
    for (var bcl in globalData[dept]) {
      var array = globalData[dept][bcl];
      bclString = bcl
      for (var i = 0; i < array.length; i++) {
        sum = sum + array[i].proposed;
      }
    }
    if (!isNaN(sum)) {
      var bubbleObj = {};
      bubbleObj.name = dept;
      bubbleObj.className = dept.toLowerCase();
      bubbleObj.size = sum;
      bubbleObj.bcl = bclString;
      var color = "hsl(" + Math.random() * 360 + ",100%,50%)";
      bubbleObj.color = color;
      bubbleData.push(bubbleObj);
    }
  }
  return {
    children: bubbleData
  };
}

//Preparing data for D3 bubble charts on click of Dept bubble
var prepareUpdatedData = function(department, bcl) {
  var bubbleDataNextLevel = [];
  var sum = 0;
  for (var bclVar in globalData[department]) {
    //debugger;
    var deptObj = globalData[department][bclVar];
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

//Code to update D3 bubble chart with data from prepareUpdatedData
var updateBubbleChart = function(department, bcl, tip) {
  $("#citation").remove();
  $("#mainDiv").append("<button type='button'id='reset'onclick='return resetChart();' class='btn btn-primary btn-md' style='margin-top:1%;margin-bottom:2%;'>Reset Graph</button>");
  $("#mainDiv").append("<p id='citation'>Data retrieved from https://data.seattle.gov/Finance/Expenditures-dollars/frxe-s3us")
  var $title = $('#title');
  $title.text("Proposed Expenditure for each Program within Dept.");
  d3.select("svg").remove();
  tip.destroy();
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


  var nodes = bubble.nodes(prepareUpdatedData(department, bcl))
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

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<span style='color:black'>" + d.name + " has expenditure " + formatNumberAsMoney(d.size) + "</span>";
    });

  svg.call(tip);

  visEnter.on('mouseover', tip.show)
    .on('mouseout', tip.hide)
}

//Helper function to format number as money
var formatNumberAsMoney = function(value) {
  var num = '$' + value.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  return num;
}

//Resetting chart on click of RESET button
var resetChart = function() {
  location.reload(true);
}

//Adding text to the citation element
var $source = $('#citation');
$source.text("Data retrieved from https://data.seattle.gov/Finance/Expenditures-dollars/frxe-s3us. Click on ARTS or FG for comprehensive results");


//the SVG to add stuff to
var svg = d3.select('#vis-container')
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
var nodes = bubble.nodes(prepareData())
  .filter(function(d) {
    return !d.children;
  }); // filter out the outer bubble

 //Adding click events and appending G element
var vis = svg.selectAll('circle')
  .data(nodes)
  .enter()
  .append("g")
  .on("click", function(d) {
    console.log(d);
    updateBubbleChart(d.name, d.bcl, tip)
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
