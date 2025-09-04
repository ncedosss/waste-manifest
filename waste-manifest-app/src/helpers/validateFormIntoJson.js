import Validation from "./fieldValidations";

// InputValidations is an object that contains all the validation types for each input where the key is the input name and the value is the validation type
const InputValidations =  {
  username: "phone",
  cellNumber: "phone",
  password: "password",
  userPassword: "password",
  idNumber: "id",
  netIncome: "number",
  email: "email",
  employerName: "basic",
  employmentTypeId: "basic",
  salaryFrequencyId: "basic",
  payDate: "basic",
  netSalary: "currency_min_1000_max_200000",
  grossIncome: "currency_max_250000",
  otherIncome: "currency_optional",
  otherExpenses: "currency_min_1",
  bureauExpenses: "currency_optional",
};
// validate form submission and return json object of inputs and values
// return false if not valid or json object where input name is key and value is value

const validateToJson = (e) => {

    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newData = {};
    for (let [key, value] of formData.entries()) {
      
        // Remove commas from netSalary value if the key is netSalary
        if (key === 'netSalary' || key === 'grossIncome'  || key === 'otherExpenses'|| key === 'otherIncome' || key === 'bureauExpenses') {//
          value = value.replace(/,/g, ''); // Remove commas globally from the value
      }

      newData[key] = value;
    }

    if (typeof InputValidations === "object") {
      //loop through all newData and check if they are valid

      for (let [key, value] of Object.entries(newData)) {

        

        if (InputValidations[key]) {
          if( !Validation(value, InputValidations[key]) ) {
            let fields = document.querySelectorAll(`[name="${key}"]`);
            for (let i = 0; i < fields.length; i++) {
              fields[i].focus();
              fields[i].blur();
            }
            return false;
          }
        }

      }

    }

  return newData;

}

export default validateToJson;