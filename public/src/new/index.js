// variable for allowing enter to be used to submit form
var enter = true;
// error array
var error = ['Please fill out the following information!'];
// button variables
const submit = document.getElementById('submitBtn');
const close = document.getElementById('closeBtn');
const close2 = document.getElementById('closeBtn2');
const close4 = document.getElementById('closeBtn4');
const back = document.getElementById('backBtn');

// back button at top sends back to base volunteer form
back.addEventListener('click', function(event){
    window.location.replace('/');
})
// close button in error modal
close4.addEventListener('click', function(event){
    document.getElementById('httpsqlerror').style['display'] = 'none';
    enter = true;
})
// confirmation modal is closed -> reset the page
close.addEventListener('click', function(event){
    window.location.reload(false);
})
// warning modal is closed -> reset the page
close2.addEventListener('click', function(event){
    window.location.reload(false);
})
// use enter key to submit form
document.onkeydown = function(evt){
    var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
    if(keyCode == 13 && enter)
    {
        submit.click();
    }
    // test keys (Z and X) for modal display
    // if(keyCode == 90){
    //     enter = false;
    //     document.getElementById('warning').style['display'] = 'block';
    // }
    // if(keyCode == 88){
    //     enter = false;
    //     document.getElementById('confirmation').style['display'] = 'block';
    // }
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
        if(type == 'phone'){
            // this only assures we have 10 digits -- assuming we have no international volunteers
            return string.match(/\d/g).length == 10;
        }
        if(type == 'name'){
            if(string == string.toLowerCase()){
                return string.substring(0,1).toUpperCase() + string.substring(1);
            }
            else{
                return string;
            }
        }
    }
}

// form tries to submit
submit.addEventListener('click', function(event){
    var first = document.getElementById('first-input').value;
    var last = document.getElementById('last-input').value;
    var email = document.getElementById('email-input').value;
    var phone = document.getElementById('phone-input').value;
    first = validate('name', first);
    last = validate('name', last);
    var emailTrue = validate('email', email);
    var phoneTrue = validate('phone', phone);
    var values = {
        'first': first,
        'last': last,
        'email': emailTrue,
        'phone': phoneTrue
    }
// info not given correctly, tell them why
    if(first == '' || last == '' || !emailTrue || !phoneTrue){
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
        // put phone number in a constant format (123) 456-7890
        var phoneNumber = phone.match(/\d/g);
        phoneNumber = phoneNumber.join('');
        phoneNumber = `(${phoneNumber.substring(0,3)}) ${phoneNumber.substring(3,6)}-${phoneNumber.substring(6)}`;
        // disable form submission multiple times
        enter = false;
        // send a POST request
        $.ajax({
            url: '/new',
            method: 'POST',
            context: document.body,
            data: {
                'first': first,
                'last': last,
                'email': email,
                'phone': phoneNumber
            }
        })
        .done(function(code){
            if(code == 'error'){
                // error occurred in SQL
                document.getElementById('httpsqlerror').style['display'] = 'block';
            }
            else{
                // we got to the database... what did it do?
                if(code == 'exists'){
                    // volunteer alreay registered
                    document.getElementById('warning').style['display'] = 'block';
                }
                else{
                    // volunteer registered
                    document.getElementById('confirmation').style['display'] = 'block';
                }
            }
        })
        .fail(function(){
            // error occurred in HTTP POST request
            document.getElementById('httpsqlerror').style['display'] = 'block';;
        })
    }
})