// variable for allowing enter to be used to submit form
var enter = true;
// error array
var error = ['Please enter a valid email address!'];
// button variables
const submit = document.getElementById('submitBtn');
const close = document.getElementById('closeBtn');
const close2 = document.getElementById('closeBtn2');
const back = document.getElementById('backBtn');

// back button at top sends back to base volunteer form
back.addEventListener('click', function(event){
    window.location.replace('/');
})
// confirmation modal is closed -> reset the page
close.addEventListener('click', function(event){
    window.location.reload(false);
})
// warning modal is closed -> DON'T reload
close2.addEventListener('click', function(event){
    document.getElementById('warning').style['display'] = 'none';
})
// use enter key to submit form
document.onkeydown = function(evt){
    var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
    if(keyCode == 13 && enter)
    {
        submit.click();
    }
}
// display error at top of form
function displayError(){
    document.getElementById('error').innerHTML = error.join('<br><br>');
    document.getElementById('error').style.display = 'inline';
    error = ['Please fill out the following information!'];
}

function validate(type, string){
    if(string == ''){
        return false;
    }
    else{
        if(type == 'email'){
            // this basically tests for ANY possible email
            var emailTest = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            return emailTest.test(string); 
        }
    }
}

// form tries to submit
submit.addEventListener('click', function(event){
    var email = document.getElementById('email-input').value;
    var emailTrue = validate('email', email);
    // email not given correctly
    if(!emailTrue){
        displayError();
        document.getElementById('email-input').style['background-color'] = 'rgba(255,0,0,0.1)';
    }
    // email was given correctly, so submit the form
    else{
        // disable form submission multiple times
        enter = false;
        // send a POST request
        $.ajax({
            url: '/validate',
            method: 'POST',
            context: document.body,
            data: {
                'email': email
            }
        })
        .done(function(code){
            if(code == 'error'){
                // error occurred in SQL
                error = ['An error occurred while connecting to the database! Please try again.'];
                displayError();
            }
            else{
                // we got to the database... what did it do?
                if(code == 'dne'){
                    // email not found
                    document.getElementById('warning').style['display'] = 'block';
                }
                else{
                    // volunteer registered and logged
                    document.getElementById('confirmation').style['display'] = 'block';
                }
            }
        })
        .fail(function(){
            // error occurred in HTTP POST request
            error = ['An error occurred while sending your HTTP request! Please try again.'];
            displayError();
        })
    }
})