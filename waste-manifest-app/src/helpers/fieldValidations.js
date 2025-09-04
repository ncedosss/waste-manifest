const ValidateEmail = (text) => {

    // validate text as email
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(text).toLowerCase());


}

const isDateYYMMDD = (dateString) => {
    // console.log("isDateYYMMDD", dateString);
    // dateString must be valid date in format YYMMDD
    const re = /^[0-9]{6}$/;
    if(! re.test(String(dateString).toLowerCase()) ){
        return false;
    }
    let year = dateString.substring(0,2);
    let month = dateString.substring(2,4);
    let day = dateString.substring(4,6);
    // console.log("year", year);
    // console.log("month", month);
    // console.log("day", day);
    if(year < "20"){
        year = "20" + year;
    }else{
        year = "19" + year;
    }
    // console.log("year", year);
    if(month < "01" || month > "12"){
        // console.log("month", month);
        return false;
    }
    if(day < "01" || day > "31"){
        // console.log("day", day);
        return false;
    }
    let date = new Date(year + "-" + month + "-" + day);
    // console.log("date", date);
    if(date.getFullYear() === Number(year) && date.getMonth() === Number(month) -1 && date.getDate() === Number(day)){
        return true;
    }
    return false;


}


const ValidateSouthAfricanIdNumber = (text) => {
    // remove spaces
    text = text.replace(/\s/g, '');
    // validate text as South African Identity Number
    const re = /^[0-9]{13}$/;
    if(! re.test(String(text).toLowerCase()) ){
      //  console.log("ValidateSouthAfricanIdNumber, length or cahracters incorrect", text);
       return false;
    }

    // first 6 characters must be valid date in format YYMMDD

    if(!isDateYYMMDD(text.substring(0, 6))){

        return false;
    }

    //if value is not 0 or 1
   let citizen = text.substring(10,11);

    if( parseInt(citizen) > 1){
       // console.log("citizen error", citizen);
        return false;
    }


   // last character
   let Z = text.substring(12,13);
//    console.log("last char",Z);
   let validateZ = text.substring(0,12); // after Luhn check must be equal to Z
  // console.log("validateZ", validateZ);

   // add odd digits of validateZ together
    let oddSum = 0;
    for(let i = 0; i < validateZ.length; i+=2){
        oddSum += Number(validateZ.charAt(i));
    }
   // console.log( "oddSum", oddSum);

    ///create a number from even digits and double it
    let evenNumber = "";
    for(let i = 1; i < validateZ.length; i+=2){
        evenNumber += validateZ.charAt(i);
    }
    //console.log("evenNumber", evenNumber);
    evenNumber = parseInt(evenNumber) * 2;
   // console.log("evenNumber*2", evenNumber);
    //turn int even number into string
    evenNumber = evenNumber.toString();

    //add digits of even number together
    let evenSum = 0;
    for(let i = 0; i < evenNumber.length; i++){
        evenSum += Number(evenNumber.charAt(i));
    }

    let total = oddSum + evenSum;
    // console.log("total", total);
    //get last digit of total
    let lastDigit = total % 10;
    // console.log("lastDigit", lastDigit);
    // if last digit is 0 then last digit is 10
    if(parseInt(Z) !== 0){
    //   console.log("  lastDigit = 10 - lastDigit;");
        lastDigit = 10 - lastDigit;
    }

    if(lastDigit !== Number(Z)){
        //  console.log("checksum failed");
        //  console.log("lastDigit", lastDigit);
        //  console.log("z", Z);
        return false;
    }

    return true;


}

const ValidatePassword = (text) => {
    text = text.replace(/\s/g, '');
    // validate if text is a valid password WIP
    const re = /[\d+\W+a-zA-Z]{3,}$/;
    return re.test(String(text).toLowerCase());
}

const ValidateAsDayOfMonth = (text) => {
    //Ternary Regex Combo - 1 0f regexes used depending on number(text) returned
    const re = text < 30 && text >= 10 ? /^[1-2]{1}[0-9]{0,1}$/ : text < 10 ? /^[0-0]?[1-9]{1}$/ : /^[3]{1}[0-1]{0,1}$/;
    return re.test(String(text).toLowerCase());
}

const ValidateCurrency = (text) => {
    text = text.replace(/\s/g, '');
    // validate text as number
    const re = /^[0-9]{1,}(\.[0-9]{1,2})?$/;
    return re.test(String(text).toLowerCase());
}

const ValidateNumber = (text) => {
    //remove spaces
    text = text.replace(/\s/g, '');
    // validate text as number
    const re = /^[0-9]{1,}$/;
    return re.test(String(text).toLowerCase());
}

const ValidatePhoneNumber = (text) => {
    //remove spaces
    text = text.replace(/\s/g, '');
    // validate text as phone number
    const re = /^[0-9]{10}$/;
    return re.test(String(text).toLowerCase());
}

const BasicValidation = (text) => {
    return text.length > 0;
}

const Validation = (text, type) => {

    //check if String type has _optional and remove
    let optional = false;
    if(type.includes("_optional")){
        optional = true;
        type = type.replace("_optional", "");
    }
    // if optional and empty return true
    if(optional && text.length === 0){
        return true;
    }


    switch (type) {
        case 'number':
            return ValidateNumber(text);
        case 'email':
            return ValidateEmail(text);
        case 'id':
            return ValidateSouthAfricanIdNumber(text);
        case 'day_of_month':
            return ValidateAsDayOfMonth(text);
        case 'phone':
            return ValidatePhoneNumber(text);
        case 'currency':
            return ValidateCurrency(text);
        case 'currency_max_250000':
            return ValidateCurrency(text) && parseInt(text) <= 250000;
        case 'currency_min_1000_max_200000':
            return ValidateCurrency(text) && parseInt(text) >= 1000 && parseInt(text) <= 200000;
            case 'currency_min_200_max_20000':
                return ValidateCurrency(text) && parseInt(text) >= 200 && parseInt(text) <= 20000;            
        case 'currency_min_1':
            return ValidateCurrency(text) && parseFloat(text) >= 1;
        case 'password':
            return ValidatePassword(text); //TODO: finalize password validation
        default:
            return BasicValidation(text);
    }
}

export default Validation;