var enter = true;

const close = document.getElementById('closeBtn4');
const close6 = document.getElementById('closeBtn6');
const password = document.getElementById('password-input');
const title = document.getElementsByClassName('title')[0];

document.onkeydown = function(evt){
    var keyCode = evt ? (evt.which ? evt.which : evt.keyCode) : event.keyCode;
    // search with enter
    if(keyCode == 13 && enter){
        close6.click();
    }
}

// submit button in password modal
close6.addEventListener('click', function(event){
    enter = false;
    $.ajax({
        method: 'POST',
        context: document.body,
        data: {
            reason: 'load',
            password: password.value
        }
    })
    .done(function(code){
        if(code == 'incorrect'){
            password.style['background-color'] = 'rgba(255,0,0,0.1)';
            title.innerHTML = 'Incorrect Password!';
            title.style['color'] = '#ff4949';
            enter = true;
        }
        else{
            document.write(code);
        }
    })
    .fail(function(code){
        document.getElementById('httpqlerror').style['display'] = 'block';
    })
})

close.addEventListener('click', function(event){
    document.getElementById('httpqlerror').style['display'] = 'none';
    enter = true;
})

window.onload = function(){
    document.getElementById('password').style['display'] = 'block';
}