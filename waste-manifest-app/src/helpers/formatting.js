const doubleDigit = (date) => {
    return date < 10 ? date = "0" + date : date;
  }

const formatDate = (dateString) => {

const currentDate = new Date(dateString);
dateString = `${doubleDigit(currentDate.getDate())}/${doubleDigit(1 + currentDate.getMonth())}/${doubleDigit(currentDate.getFullYear())}`;

return dateString;
}

const CommaSeperated = (amount) => {
    var delimiter = ",";
    var a = amount.toString().split('.', 2);
    var d = a[1];
    var i = parseInt(a[0], 10);
    if (isNaN(i)) { return ''; }
    var minus = '';
    if (i < 0) { minus = '-'; }
    i = Math.abs(i);
    var n = String(i);
    a = [];
    while (n.length > 3) {
        var nn = n.substr(n.length - 3);
        a.unshift(nn);
        n = n.substr(0, n.length - 3);
    }
    if (n.length > 0) { a.unshift(n); }
    n = a.join(delimiter);
    if (d) {
        amount = n + '.' + d;
    } else {
        amount = n;
    }
    amount = minus + amount;
    return amount;
}


const formatCurrency = (amount) => {
return CommaSeperated((Math.round(amount * 100) / 100).toFixed(2));
}

const formatCurrencyNoCents = (amount) => {
	 return CommaSeperated(parseInt(amount));
	}

export { formatDate, formatCurrency, formatCurrencyNoCents };