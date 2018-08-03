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
const select = document.getElementById('team-input');
const campusSelect = document.getElementById('campus-input');
// change arrow on dropdowns
document.getElementsByTagName('html')[0].addEventListener('click', function(event){
    var clicked = event.target.id;
	if(clicked == 'team-input'){
		select.className == 'closed mobile-category' ? select.className = 'open mobile-category' : select.className = 'closed mobile-category';	
        campusSelect.className == 'open' ? campusSelect.className = 'closed' : campusSelect.className = 'closed';
    }
    else if(clicked == 'campus-input'){
        select.className == 'open mobile-category' ? select.className = 'closed mobile-category' : select.className = 'closed mobile-category';
        campusSelect.className == 'closed' ? campusSelect.className = 'open' : campusSelect.className = 'closed';
    }
    else{
        select.className == 'open mobile-category' ? select.className = 'closed mobile-category' : select.className = 'closed mobile-category';
        campusSelect.className == 'open' ? campusSelect.className = 'closed' : campusSelect.className = 'closed';
    }
})
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
        if(type == 'team'){
            if([1,2,3,4,5,6,7].includes(parseInt(string))){
                return string;
            }
            else{
                return false;
            }
        }
    }
}

// we need to call a POST request to get the campus data to create the options for the campus dropdown

window.onload = function(){
    $.ajax({
        method: 'POST',
        context: document.body,
        data: {
            load: true
        }
    })
    .done(function(rows){
        console.log(rows.length);
        if(rows == 'error'){
            document.getElementById('httpsqlerror').style['display'] = 'block';
            error = ['ERROR fetching campus data from MSSQL LCDW.Dimension.Campus.']; 
            displayError();
        }
        else if(rows.length == 0){
            document.getElementById('httpsqlerror').style['display'] = 'block';
            error = ['ERROR fetching campus data from MSSQL LCDW.Dimension.Campus.'];
            displayError();
        }
        else{
            rows.forEach(element => {
                if(element.Name == 'Unknown'){
                    // skip
                }
                else{
                    // create the option in the dropdown
                    var value = element.CampusCode;
                    var campusName = element.Name + ', ' + element.State;
                    var option = document.createElement('option');
                    option.setAttribute('value', value);
                    option.innerHTML = campusName;
                    document.getElementById('campus-input').appendChild(option); 
                }
            })
        }
    })
    .fail(function(code){
        document.getElementById('httpsqlerror').style['display'] = 'block';
    })
}

// form tries to submit
submit.addEventListener('click', function(event){
    // get all the values
    var first = document.getElementById('first-input').value.trim();
    var last = document.getElementById('last-input').value.trim();
    var team = document.getElementById('team-input').value;
    var campus = document.getElementById('campus-input').value;
    var email = document.getElementById('email-input').value.trim();
    var phone = document.getElementById('phone-input').value.trim();
    // validate all the values
    first = validate('name', first);
    last = validate('name', last);
    team = validate('team', team);
    var emailTrue = validate('email', email);
    var phoneTrue = validate('phone', phone);
    var values = {
        'first': first,
        'last': last,
        'team': team,
        'campus': campus,
        'email': emailTrue,
        'phone': phoneTrue
    }
    // info not given correctly, tell them why
    if(first == '' || last == '' || !emailTrue || !phoneTrue || !team || campus == ''){
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
                'team': team,
                'campus': campus,
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