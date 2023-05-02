const loadtest = require('loadtest');
const Table = require('cli-table');
const url = 'http://localhost:3000/transfer';

const options = {
  url: url,
  method: 'GET',
  maxRequests: 100,
  concurrency: 10,
};

const results = [];

const table = new Table({
  head: ['Request', 'Error', 'Status', 'Latency (ms)', 'Req/Sec'],
});

function onResult(error, result) {
  results.push(result);
  const row = [
    result.requestIndex,
    error || result.error,
    result.statusCode,
    result.latencyMs,
    result.requestIndex / (result.durationMs / 1000),
  ];
  table.push(row);
}

function onComplete() {
  console.log(table.toString());
  const totalRequests = results.length;
  const totalErrors = results.filter((result) => result.error).length;
  const totalTime = results.reduce((acc, result) => acc + result.durationMs, 0);
  const averageLatency = results.reduce((acc, result) => acc + result.latencyMs, 0) / totalRequests;
  const requestsPerSecond = totalRequests / (totalTime / 1000);
  console.log(`Total requests: ${totalRequests}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Average latency: ${averageLatency.toFixed(2)} ms`);
  console.log(`Requests per second: ${requestsPerSecond.toFixed(2)}`);
}

loadtest.loadTest(options, onResult, onComplete);
