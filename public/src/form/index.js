// variable for if we are checking an email address
var emailOn = false;
// variable for allowing enter to be used to submit form
var enter = true;
// error array
var error = ['Please fill out the following information!'];
// button variables
const submit = document.getElementById('submitBtn');
const display = document.getElementById('displayBtn');
const close = document.getElementById('closeBtn');
const close2 = document.getElementById('closeBtn2');
const close3 = document.getElementById('closeBtn3');
const close4 = document.getElementById('closeBtn4');
const register = document.getElementById('registerBtn');
const register2 = document.getElementById('registerBtn2');
const data = document.getElementById('dataBtn');
const emailSubmit = document.getElementById('emailBtn');
// database button at top sends to database page
data.addEventListener('click', function(event){
    window.location.replace('/data');
})
// close button in error modal
close4.addEventListener('click', function(event){
    document.getElementById('httpsqlerror').style['display'] = 'none';
    enter = true;
})
// close button in email validation modal
close3.addEventListener('click', function(event){
    document.getElementById('validate').style['display'] = 'none';
    enter = true;
    emailOn = false;
})
// close button in warning modal
close2.addEventListener('click', function(event){
    document.getElementById('warning').style['display'] = 'none';
    enter = true;
})
// register button in warning modal
register2.addEventListener('click', function(event){
    window.location.replace('/new');
})
// register button at top send to register page
register.addEventListener('click', function(event){
    window.location.replace('/new');
})
// confirmation modal is closed -> reset the page
close.addEventListener('click', function(event){
    window.location.reload(false);
})
// display button at top sends to display page
display.addEventListener('click', function(event){
    window.location.replace('/display');
})
// use enter key to submit form
document.onkeydown = function(evt){
    var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
    if(keyCode == 13 && enter)
    {
        if(emailOn){
            emailSubmit.click();
        }
        if(!emailOn){
            submit.click();
        }
    }
    // test keys (Z and X) for modal display
    // if(keyCode == 90){
    //     emailOn = true;
    //     document.getElementById('validate').style['display'] = 'block';
    // }
    // if(keyCode == 88){
    //     enter = false;
    //     document.getElementById('httpsqlerror').style['display'] = 'block';
    // }
}
// display error at top of form
function displayError(){
    document.getElementById('error').innerHTML = error.join('<br><br>');
    document.getElementById('error').style.display = 'inline';
    error = ['Please fill out the following information!'];
}
// check if date is valid for database function i.e. not too far away
function checkDate(date){
    if(date == ''){
        return false;
    }
    else{
        // min is first day of the same month last year
        var min = new Date(`${(new Date()).getMonth()+1}/1/${(new Date()).getFullYear()-1}`);
        // max is next month
        var max = new Date(`${(new Date()).getMonth()+2}/1/${(new Date()).getFullYear()}`);
        date = new Date(date);
        if(date <= min || date > max){
            error.push('Please enter a date within the last year.');
            error.push('You may not enter a future month\'s volunteers.');
            return false;
        }
        else{
            return true;
        }
    }
}

// form tries to submit
submit.addEventListener('click', function(event){
    var name = document.getElementById('name-input').value;
    var team = document.getElementById('team-input').value;
    var date = document.getElementById('date-input').value;
    var datePossible = checkDate(date);
    var hours = parseInt(document.getElementById('hours-input').value);
    var values = {
        'name': name,
        'team': team,
        'date': datePossible,
        'hours': hours
    }
// info not given correctly, tell them why
    if(name == '' || !date || team == '' || !hours){
        displayError();
        for(var i = 0; i < Object.keys(values).length; i++){
            var element = values[Object.keys(values)[i]];
            if(element == '' || !element){
                document.getElementById(`${Object.keys(values)[i]}-input`).style['background-color'] = 'rgba(255,0,0,0.1)';
            }
            else{
                document.getElementById(`${Object.keys(values)[i]}-input`).style['background-color'] = '';
            }
        }
    }
// info given correctly, so submit the form
    else{
        // disable form submission multiple times
        enter = false;
        // can use now.getDay() to get the day of week to reset the engagement statistics per week for team
        // send a POST request
        $.ajax({
            method: 'POST',
            context: document.body,
            data: {
                'name': name,
                'team': team,
                'date': date,
                'hours': hours
            }
        })
        .done(function(code){
            if(code == 'error'){
                // error occurred in SQL
                document.getElementById('httpsqlerror').style['display'] = 'block';
            }
            else{
                // volunteer not registered
                if(code == 'dne'){
                    document.getElementById('warning').style['display'] = 'block';
                }
                // more than one volunteer with the same name -> validate the email
                else if(code == 'validate'){
                    emailOn = true;
                    document.getElementById('validate').style['display'] = 'block';
                }
                else{
                    // volunteer registered and logged
                    document.getElementById('confirmation').style['display'] = 'block';
                }
            }
        })
        .fail(function(){
            // error occurred in HTTP POST request
            document.getElementById('httpsqlerror').style['display'] = 'block';
        })
    }
})
// submit with an email validation -- for duplicate names
emailSubmit.addEventListener('click', function(event){
    // disable form submission multiple times
    enter = false;
    var email = document.getElementById('email-input').value;
    var emailTest = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    emailTest = emailTest.test(email);
    // invalid email
    if(!emailTest){
        document.getElementById(`email-input`).style['background-color'] = 'rgba(255,0,0,0.1)';   
        document.getElementById('validate-text').style['color'] = '#ff4949';
    }
    // email is legit -- need to check database if it exists there
    else{
        $.ajax({
            method: 'POST',
            context: document.body,
            data: {
                'name': document.getElementById('name-input').value,
                'team': document.getElementById('team-input').value,
                'date': document.getElementById('date-input').value,
                'hours': parseInt(document.getElementById('hours-input').value),
                'email': email
            }
        })
        .done(function(code){
            if(code == 'error'){
                // error occurred in SQL
                document.getElementById('httpsqlerror').style['display'] = 'block';
            }
            else{
                // volunteer not found
                if(code == 'dne'){
                    document.getElementById('validate-text').innerHTML = 'Email not found.';
                }
                else{
                    // volunteer registered and logged
                    document.getElementById('confirmation').style['display'] = 'block';
                }
            }
        })
        .fail(function(code){
            // error occurred in HTTP POST request
            document.getElementById('httpsqlerror').style['display'] = 'block';
        })
    }
})