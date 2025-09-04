// create a function that calculates from formula
// based on spreadsheet formula "=-PMT(E11/12,E10,MIN(E6*0.15,165+(E6-1000)*0.1,1050)*1.115+E6,0)+E6/1000*E15+MIN(-PMT(E11/12,E10,MIN(E6*0.15,165+(E6-1000)*0.1,1050)*1.115+E6,0)*0.15,60*1.15)"
const basicInstallmentCalculator = (amount, numberOfMonths, intrestRate = 25.75, existingBalance = 0 ) => {

    intrestRate = intrestRate / 100;
    let creditLifePerThousand = 4.5;

    // initiationFee = =MIN(amount*0.15,165+(amount-1000)*0.1,1050)*1.115
    let initiationFee = Math.min(amount * 0.15, 165 + (amount - 1000) * 0.1, 1050) * 1.15;

    let principalDebt = amount + initiationFee + existingBalance;

    let monthlyBaseInstallment = -1*pmt(intrestRate/12, numberOfMonths, principalDebt, 0, 0);
    let monthlyCreditLife = principalDebt / 1000 * creditLifePerThousand;
    let monthlyServiceFeePlusVat = Math.min(monthlyBaseInstallment * 0.15, 60 * 1.15);

    let monthlyInstallment = monthlyBaseInstallment + monthlyCreditLife + monthlyServiceFeePlusVat;

  return monthlyInstallment;

}

// PMT function
const pmt = (rate, nper, pv, fv, type) => {
    if (!fv) fv = 0;
    if (!type) type = 0;

    if (rate === 0) return -(pv + fv)/nper;

    var pvif = Math.pow(1 + rate, nper);
    var pmt = rate / (pvif - 1) * -(pv * pvif + fv);

    if (type === 1) {
        pmt /= (1 + rate);
    }

    return pmt;
}

export default basicInstallmentCalculator;