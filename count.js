/*
function predictLastRequestResponseTime (inFlightRequests, syncProcessingTime, asyncProcessingTime) {
  let count = asyncProcessingTime
  for (let i = 0; i < inFlightRequests; i++) {
    count += syncProcessingTime
  }

  return count
}

for (const i of [10, 20, 30, 40, 50]) {
  console.log(i, 'requests => ', predictLastRequestResponseTime(i, 20, 10))
}
*/

class LatencyPredictor {
  constructor (syncProcessingTime, asyncProcessingTime) {
    this.requests = []
    this.syncProcessingTime = syncProcessingTime
    this.asyncProcessingTime = asyncProcessingTime
    this.carryOver = 0
  }

  advanceOneSecond (requests) {
    let count = this.carryOver
    for (let i = 0; i < requests; i++) {
      count += this.syncProcessingTime
    }

    this.carryOver = Math.max(count - 1000, 0) // one second

    return { count, carryOver: this.carryOver }
  }

  predictLastRequestResponseTime () {
    return this.carryOver + this.asyncProcessingTime
  }
}

var myLineChart = null;

function updateChart() {
  if (myLineChart) {
    myLineChart.destroy()
  }
  var syncProcessingTime = Number(document.getElementById('synchronousProcessing').value);
  var asyncProcessingTime = Number(document.getElementById('asynchronousProcessing').value);
  var requestsPerSecond = Number(document.getElementById('requestsPerSecond').value);

  const predictor = new LatencyPredictor(syncProcessingTime, asyncProcessingTime)

  // Your chart data
  var data = {
    labels: [],
    datasets: [{
      label: `Response Time (sync: ${syncProcessingTime}, async: ${asyncProcessingTime}, rps: ${requestsPerSecond})`,
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      data: [],
      fill: false
    }]
  };

  for (let i = 0; i < 60; i++) {
    data.labels.push(i)
    console.log(i, ' second, carry over:', predictor.advanceOneSecond(requestsPerSecond))
    data.datasets[0].data.push(predictor.predictLastRequestResponseTime())
  }

  data.labels.push(60)

  console.log('last request response time:', predictor.predictLastRequestResponseTime())
  var ctx = document.getElementById('myLineChart').getContext('2d');

  // Configuration options
  var options = {
    responsive: false,
    maintainAspectRatio: false
  };

  // Create the line chart
  myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
  });
}
