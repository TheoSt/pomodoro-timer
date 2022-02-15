let mode_elements = document.querySelectorAll(".mode");
let modes_position = [];
let mode_label = document.querySelector("#mode_label");
let time_error_el = document.querySelector("#time_error");

let box = document.querySelector(".box"); //is the circle container
let circle = document.querySelector(".box svg circle");
let countdown_el = document.querySelector("#countdown");
let time_state = document.querySelector("#time_state");

let settings_btn = document.querySelector("#settings_btn");
let settings_el = document.querySelector("#settings");
let settings_opacity = document.querySelector("#opacity_lbl");
let close_settings_btn = document.querySelector("#close_btn");
let pomodoro_value_el = document.querySelector("#pomodoro_value");
let short_value_el = document.querySelector("#short_break_value");
let long_value_el = document.querySelector("#long_break_value");
let fonts_btns = document.querySelectorAll(".font_btn");
let font_heading = document.querySelector("#font_heading");
let colors_btns = document.querySelectorAll(".color_btn");
let volume_range = document.querySelector("#volume_range");
let sound_select = document.querySelector("#sound_select");
let apply_btn = document.querySelector("#apply_btn");

let timeInterval;

const default_pomodoro_value = 25;
const default_short_value = 5;
const default_long_value = 15;

let pomodoro_value = default_pomodoro_value, 
    short_break_value = default_short_value,
    long_break_value = default_long_value;

let font = "";
let color = "";

let pause_timer = false;
let start_timer = false;
let time_error = false;

let startOffset = 1000;
let endOffset = 250;

let active_time = pomodoro_value;
let active_mode = "pomodoro";

let starting_minutes = active_time;
let time = starting_minutes*60;
let circleOffset = startOffset;

let sounds = [new Audio('sounds/positive.wav'),
                new Audio('sounds/marimba.wav')];
selected_sound = sounds[0];
let sound_volume = 1;

//the beginning stroke dash offset is 1000 and the last is 250. We want the circle to move
//1000-250 = 750px and every second we want to move the circle 750/(the seconds we want)
let offsetIter = (circleOffset-startOffset)/time; 

//take the position of every mode in the mode bar(for the mode label)
//and add the mode listener
mode_elements.forEach(mode=> {
    modes_position.push(mode.getBoundingClientRect());
    mode.addEventListener("click",function() {
        var data = this.dataset.mode;
        
        if(data==="pomodoro") {
            active_time = pomodoro_value;
            mode_label.style.left = moveLabel(modes_position[0]);
        }
        else if(data==='short break') {
            active_time = short_value;
            mode_label.style.left = moveLabel(modes_position[1]); 
        }
        else if(data==='long break') {
            active_time = long_value;
            mode_label.style.left = moveLabel(modes_position[2]);
        }
        else {
            return;
        }
        setTimer(active_time,startOffset,endOffset);
        countdown_el.textContent = checkDigits(active_time);
        active_mode = data;
    });
});

//init the starting theme color and font
fonts_btns[0].classList.add("active_font");
colors_btns[0].classList.add("active_color");


box.addEventListener("click",function() {
    if(!start_timer) {
        start_timer = true;
        timeInterval = setInterval(updateCounter,1000);
        circle.classList.add("circle_transition");
        time_state.textContent = "pause";
    }
    else {
        pause_timer = pause_timer ? false:true;
        time_state.textContent = pause_timer ? "continue":"pause"; 
    }
});

settings_btn.addEventListener("click",function() {
    settings_el.classList.add("active_settings");
    settings_opacity.classList.add("active_opacity");
});

close_settings_btn.addEventListener("click",function() {
    settings_el.classList.remove("active_settings");
    settings_opacity.classList.remove("active_opacity")
});

fonts_btns.forEach(btn => {
    btn.addEventListener("click",function() {
        var data = this.dataset.font;

        if(data==='rubik') {
            font="var(--rubik-font)";
        }
        else if(data==='roboto') {
            font="var(--roboto-font)";
        }
        else {
           font="var(--kumbh-font)";
        }
        font_heading.style.fontFamily = font;
        
        activeFont(this);
    });
});

colors_btns.forEach(btn=> {
    btn.addEventListener("click",function() {
        var data = this.dataset.color;

        if(data==='cyan') {
            color="var(--cyan-stroke)"   
        }
        else if(data==='purple') {
            color="var(--purple-stroke)"
        }
        else {
            color="var(--orange-stroke)"
        }
        apply_btn.style.backgroundColor = color;
        activeColor(this);
    })
});

apply_btn.addEventListener("click",function() {
    takeSettingsValues();
    setTimer(active_time,startOffset,endOffset);

    settings_el.classList.remove("active_settings");
    settings_opacity.classList.remove("active_opacity");
});

volume_range.addEventListener("input",function() {
    this.nextElementSibling.textContent = parseInt(this.value*100);
})

/*
mode_label left is based on parent and not window, so take the left distance of the first
li element and subtract it with position of the element we clicked.
*/
function moveLabel(el_pos) {
    return `${el_pos.x-modes_position[0].left}px`;
}

function setTimer(val,startOffset,endOffset) {
    clearInterval(timeInterval);

    starting_minutes = val;
    time = starting_minutes*60;

    offsetIter = (startOffset-endOffset)/time;
    circleOffset = startOffset;
    
    circle.classList.remove("circle_transition");
    circle.style.strokeDashoffset = startOffset+"px";

    start_timer = false;
    pause_timer = false;
    countdown_el.textContent = checkDigits(active_time);
    time_state.textContent = "start";
}

function takeSettingsValues() {
    time_error = false;

    if(pomodoro_value_el.value % 1 !==0) {
        pomodoro_value = default_pomodoro_value;
        time_error = true;
    }
    else {
        parseInt(pomodoro_value_el.value);  
    }

    if(short_value_el.value % 1 !==0) {
        short_value = default_pomodoro_value;
        time_error = true;
    }
    else {
        parseInt(short_value_el.value);  
    }

    if(long_value_el.value % 1 !==0) {
        long_value = default_pomodoro_value;
        time_error = true;
    }
    else {
        parseInt(long_value_el.value);  
    }

    time_error_el.style.display = time_error ? "block":"none";

    document.body.style.fontFamily = font;
    circle.style.stroke = color;
    mode_label.style.backgroundColor = color;

    selected_sound = sound_select.value==='positive' ? sounds[0]:sounds[1];
    sound_volume = volume_range.value;
    selected_sound.volume = sound_volume;
    
    if(active_mode==="pomodoro") active_time = pomodoro_value;
    else if(active_mode="short break") active_time = short_value;
    else active_time = long_value;
}

function activeFont(btn) {
    for(var i=0; i<fonts_btns.length; i++) {
        if(btn===fonts_btns[i]) {
            fonts_btns[i].classList.add("active_font");
        }
        else {
            fonts_btns[i].classList.remove("active_font");
        }
    } 
}

function activeColor(btn) {
    for(var i=0; i<colors_btns.length; i++) {
        if(btn===colors_btns[i]) {
            colors_btns[i].classList.add("active_color");
        }
        else {
            colors_btns[i].classList.remove("active_color");
        }
    } 
}

function checkDigits(val) {
    if(val>=10) return `${val}:00`;

    return `0${val}:00`;
}

function updateCounter() {
    if(!pause_timer) {
        circleOffset-=offsetIter;
        circle.style.strokeDashoffset = circleOffset+"px";

        time--;

        const minutes = Math.floor(time/60);
        const seconds = time % 60;

        if(time<0) {
            selected_sound.play(); 
            setTimer(active_time,startOffset,endOffset);
            return; 
        }
        countdown_el.textContent = `${(minutes<10? "0":"")}${minutes}:${(seconds<10?"0":"")}${seconds}`;    
    }
}


