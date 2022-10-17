// CHART INIT ------------------------------
import * as d3 from "https://unpkg.com/d3?module";

let type = document.getElementById("group-by").value;
let direction = true;

var margin = { top: 60, right: 60, bottom: 60, left: 60 };

var width = 700 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

// create svg with margin convention
let svg = d3
	.select(".chart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// create scales without domains
let xScale = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);

let yScale = d3.scaleLinear().range([height, 0]);

const xAxis = d3.axisBottom().scale(xScale).ticks(5, "s");

const yAxis = d3.axisLeft().scale(yScale);

// create axes and axis title containers

svg.append("g")
	.attr("class", "axis x-axis")
	.call(xAxis)
	.attr("transform", `translate(0, ${height})`);

svg.append("g").attr("class", "axis y-axis").call(yAxis);

svg.select("text.axis-title").remove();

svg.append("text")
	.attr("class", "axis-title")
	.attr("x", 10)
	.attr("y", -15)
	.attr("dy", ".1em")
	.style("text-anchor", "end")
	.text(type);

// (Later) Define update parameters: measure type, sorting direction

// CHART UPDATE FUNCTION -------------------
function update(data, type) {
	let xRange = d3.extent(data, function (i) {
		console.log(i, type);
		return i[type];
	});
	console.log(xRange);

	if (direction) {
		console.log("1");
		data = data
			.sort((a, b) => {
				return a[type] - b[type];
			})
			.reverse();
	} else {
		console.log("2");
		data = data.sort((a, b) => {
			return a[type] - b[type];
		});
	}

	svg.select(".axis.y-axis").remove();
	svg.select(".axis.x-axis").remove();

	// update domains
	xScale.domain(data.map((d) => d.company));
	yScale.domain(xRange);

	svg.append("g")
		.attr("class", "axis x-axis")
		.transition()
		.duration(1000)
		.call(xAxis)
		.attr("transform", `translate(0, ${height})`);

	svg.append("g")
		.attr("class", "axis y-axis")
		.transition()
		.duration(1000)
		.call(yAxis);

	svg.selectAll("axis").exit().remove();

	svg.select(".axis-title").text(type);

	// update bars
	const bars = svg.selectAll("rect").data(data, (d) => d.company);

	bars.enter()
		.append("rect")
		.attr("x", width)
		.attr("y", function (d) {
			return yScale(d[type]);
		})
		.attr("width", xScale.bandwidth())
		.attr("height", function (d) {
			return height - yScale(d[type]);
		})
		.attr("fill", function (d) {
			return "rgb(0, 0, " + 100 + ")";
		})
		.merge(bars) //Update…
		.transition()
		.duration(1000)
		.attr("x", function (d, i) {
			return xScale(d.company);
		})
		.attr("y", function (d) {
			return yScale(d[type]);
		})
		.attr("width", xScale.bandwidth())
		.attr("height", function (d) {
			return height - yScale(d[type]);
		});

	bars.exit()
		.transition()
		.duration(1000)
		.attr("x", -xScale.bandwidth()) // <-- Exit stage left
		.remove();

	// Update axes and axis title
}
// CHART UPDATES ---------------------------

// Loading data
d3.csv("coffee-house-chains.csv", d3.autoType).then((data) => {
	update(data, type);
	document.querySelector("#group-by").addEventListener("change", (e) => {
		update(data, e.target.value);
	});

	document.querySelector(".sort").addEventListener("click", (e) => {
		direction = !direction;
		update(data, type);
	});
});

// (Later) Handling the type change

// (Later) Handling the sorting direction change
