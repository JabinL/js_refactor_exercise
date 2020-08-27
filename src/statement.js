function format(amount) {
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format;
  return format(amount/100);
}

function calculateAmount(play, perf) {
  let thisAmount = 0;
  switch (play.type) {
    case 'tragedy':
      thisAmount = 40000;
      if (perf.audience > 30) {
        thisAmount += 1000 * (perf.audience - 30);
      }
      break;
    case 'comedy':
      thisAmount = 30000;
      if (perf.audience > 20) {
        thisAmount += 10000 + 500 * (perf.audience - 20);
      }
      thisAmount += 300 * perf.audience;
      break;
      default:
        throw new Error(`unknown type: ${play.type}`);
  }
  return thisAmount;
}

function calculateVolumeCredits(perf, play) {
  let volumeCredits = 0;
  volumeCredits += Math.max(perf.audience - 30, 0);
  if ('comedy' === play.type) volumeCredits += Math.floor(perf.audience / 5);
  return volumeCredits;
}

function createStatementData(invoice, plays) {
  let volumeCredits = 0;
  let data = Object.assign([], invoice);
  data.performances.map(perf => {
    volumeCredits += calculateVolumeCredits(perf, plays[perf.playID])
    perf.thisAmount = calculateAmount(plays[perf.playID],perf )
  })
  data.totalAmount = data.performances.reduce((total, perf) => total + perf.thisAmount, 0);
  data.volumeCredits = volumeCredits;
  data.plays = plays;
  return data;
}
function renderStatmentText(data) {
  let result = `Statement for ${data.customer}\n`;
  for (const perf of data.performances) {
    result += ` ${data.plays[perf.playID].name}: ${format(perf.thisAmount)} (${perf.audience} seats)\n`;
  }
  result += `Amount owed is ${format(data.totalAmount)}\n`;
  result += `You earned ${data.volumeCredits} credits \n`;
  return result;
}

function renderStatementHtml(data) {
  let result = `<h1>Statement for ${data.customer}</h1>\n` +
      '<table>\n' +
      '<tr><th>play</th><th>seats</th><th>cost</th></tr>';
  for (const perf of data.performances) {
    result += `<tr><td>${data.plays[perf.playID].name}</td><td>${perf.audience}</td><td>${format(perf.thisAmount)}</td></tr>\n`;
  }
  result += '</table>\n' +
      `<p>Amount owed is <em>${format(data.totalAmount)}</em></p>\n` +
      `<p>You earned <em>${data.volumeCredits}</em> credits</p>\n`

  return result

}
function statement (invoice, plays) {
  let data = createStatementData(invoice, plays);
  return renderStatmentText(data);
}

const renderHtml = (invoice, plays) => {

  let data = createStatementData(invoice, plays);

  return renderStatementHtml(data);
}

module.exports = {
  statement,
  renderHtml
};
