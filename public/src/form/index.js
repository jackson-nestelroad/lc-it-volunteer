// date picker and time picker initialization
var datePicker = $('.datepicker-here').datepicker({
    position: 'top left',
    language: 'en',
    minDate: new Date(`${(new Date()).getMonth()+1}/1/${(new Date()).getFullYear()-1}`),
    maxDate: new Date(`${(new Date()).getMonth()+2}/1/${(new Date()).getFullYear()}`)
})

datePicker.data('datepicker').selectDate(new Date());

var startPicker = $('.only-time-start').datepicker({
    dateFormat: ' ',
    timepicker: true,
    onlyTimepicker: true,
    position: 'top left',
    language: 'en',
    timeFormat: 'hh:ii AA',
    startDate: new Date('1/1/2000 08:00')
});

var endPicker = $('.only-time-end').datepicker({
    dateFormat: ' ',
    timepicker: true,
    onlyTimepicker: true,
    position: 'top left',
    language: 'en',
    timeFormat: 'hh:ii AA',
    startDate: new Date('1/1/2000 08:00')
});

startPicker.data('datepicker').selectDate(new Date('1/1/2000 08:00'));
endPicker.data('datepicker').selectDate(new Date('1/1/2000 08:00'));

// teams -- fetched from database onload
var teams = [];
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
const select = document.getElementById('team-input');

const check = document.getElementById('time-check');
const hoursInput = document.getElementsByClassName('input hours')[1];
const start = document.getElementsByClassName('input start time')[0];
const end = document.getElementsByClassName('input end time')[0];

// function destroyDate(){
//     $('.only-time-start').datepicker().data('datepicker').destroy();
//     $('.only-time-end').datepicker().data('datepicker').destroy();
// }
// detect checkbox changes and add or remove fields
check.addEventListener('change', function(event){
    if(check.checked){
        hoursInput.style['display'] = 'none';
        start.style['display'] = 'block';
        end.style['display'] = 'block';
    }
    else{
        hoursInput.style['display'] = 'block';
        start.style['display'] = 'none';
        end.style['display'] = 'none';
        // setTimeout(destroyDate, 10);
    }
})
// change arrow on dropdown
document.getElementsByTagName('body')[0].addEventListener('click', function(event){
	if(event.target.id == 'team-input'){
		select.className == 'closed small' ? select.className = 'open small' : select.className = 'closed small';	
    }
	else{
		select.className == 'open small' ? select.className = 'closed small' : select.className = 'closed small';
    }
})
// database button at top sends to database page
data.addEventListener('click', function(event){
    window.location.replace('/search');
})
// close button in error modal
close4.addEventListener('click', function(event){
    document.getElementById('httpsqlerror').style['display'] = 'none';
    enter = true;
})
// close button in email validation modal
close3.addEventListener('click', function(event){
    document.getElementById('validate').style['display'] = 'none';
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
        if(date < min || date > max){
            error.push('Please enter a date within the last year.');
            error.push('You may not enter a future month\'s volunteers.');
            return false;
        }
        else{
            return true;
        }
    }
}
// get hours volunteered for
function getHours(){
    // start and end time given
    if(check.checked){
        var startTime = document.getElementById('start-input').value;
        var endTime = document.getElementById('end-input').value;
        if(startTime == '' || endTime == ''){
            return false;
        }
        startTime = new Date('1/1/2000 ' + startTime);
        endTime = new Date('1/1/2000 ' + endTime);
        var diff = endTime - startTime;
        diff = diff/60000/60;
        // negative or zero hours
        if(diff <= 0){
            error.push('End time cannot be before start time!');
            return false;
        }
        // less than one hour
        if(diff < 1){
            return Math.ceil(diff);
        }
        // more than one hour
        if(diff >= 1){
            return Math.round(diff);
        }
        // more than 24 hours
        if(diff >= 24){
            return false;
        }
    }
    // hours given as number
    else{
        if(document.getElementById('hours-input').value == ''){
            return false;
        }
        var num = parseInt(document.getElementById('hours-input').value);
        num = (num > 0) ? num : false;
        num = (num > 24) ? false : num;
        return num;
    }
}

// get team data for dropdown
window.onload = function(){
    $.ajax({
        method: 'GET',
        url: '/teams',
        context: document.body
    })
    .done(function(rows){
        console.log(rows.length);
        if(rows == 'error'){
            document.getElementById('httpsqlerror').style['display'] = 'block';
            error = ['ERROR fetching team data from Google Cloud "Teams" Table.']; 
            displayError();
        }
        else if(rows.length == 0){
            document.getElementById('httpsqlerror').style['display'] = 'block';
            error = ['ERROR fetching team data from Google Cloud "Teams" Table.']; 
            displayError();
        }
        else{
            for(var k = 0; k < rows.length; k++)
            {
                teams.push(k + 1);
                var option = document.createElement('option');
                option.setAttribute('value', k + 1);
                option.innerHTML = rows[k].full_name;
                select.appendChild(option);
            }
        }
    })
    .fail(function(code){
        document.getElementById('httpsqlerror').style['display'] = 'block';
    })
}

// form tries to submit
submit.addEventListener('click', function(event){
    // get the values
    var name = document.getElementById('name-input').value.trim();
    var team = document.getElementById('team-input').value;
    var date = document.getElementById('date-input').value;
    // check some of the values logically
    var datePossible = checkDate(date);
    var hours = getHours();
    // make sure the number of hours is positive and less than 24
    // make sure they didn't enter a fake team
    team = (teams.includes(parseInt(team))) ? team : false;
    var values = {
        'name': name,
        'team': team,
        'date': datePossible,
        'hours': hours,
        'start': hours,
        'end': hours
    }
    // info not given correctly, tell them why
    if(name == '' || !datePossible || team == '' || !team || !hours){
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
                // error occurred in PostgreSQL
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
                    enter = true;
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
    var email = document.getElementById('email-input').value.trim();
    // see if email is any valid email
    var emailTest = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    emailTest = emailTest.test(email);
    // invalid email
    if(!emailTest){
        document.getElementById(`email-input`).style['background-color'] = 'rgba(255,0,0,0.1)';   
        document.getElementById('validate-text').style['color'] = '#ff4949';
        enter = true;
        return;
    }
    // email is legit -- need to check database if it exists there
    // double check inputs -- they can be changed in Google Chrome console!
    var name = document.getElementById('name-input').value.trim();
    var team = document.getElementById('team-input').value;
    var date = document.getElementById('date-input').value;
    var datePossible = checkDate(date);
    var hours = getHours();
    team = (teams.includes(parseInt(team))) ? team : false;
    var values = {
        'name': name,
        'team': team,
        'date': datePossible,
        'hours': hours,
        'start': hours,
        'end': hours
    }
    // info not given correctly, tell them why
    if(name == '' || !datePossible || team == '' || !team || !hours){
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
    else{
        $.ajax({
            method: 'POST',
            context: document.body,
            data: {
                'name': name,
                'team': team,
                'date': date,
                'hours': hours,
                'email': email
            }
        })
        .done(function(code){
            if(code == 'error'){
                // error occurred in PostgreSQL
                document.getElementById('httpsqlerror').style['display'] = 'block';
            }
            else{
                // volunteer not found
                if(code == 'dne'){
                    document.getElementById('validate-text').innerHTML = 'Email not found.';
                    enter = true;
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
