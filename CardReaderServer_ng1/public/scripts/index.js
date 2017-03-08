//Ref: http://hkbric.hkbdc.info/bic/intro/kmb-atenu.htm
//Ref: WIKI: Enviro 500 MMC巴士（ATENU850，TV9004）

var socket = false;

var t_counter;
var update_weather;
var weather_counter;

var update_t = function () {
    var now = new Date().toLocaleString("en-GB");
    $("#timestamp").text(now.replace(",", "") + "\t");
}

var update_weather = function () {
    $.get("weather/get", function (data) {
        //console.log(data);
        if (data) {
            $("#weather_temp").text(data.current.feelslike_c + "°C");
            $("#weather_humid").text(data.current.humidity + "%");
            $("#weather_icon").attr("src", data.current.condition.icon);
        }
    });
}

var reset_counter = function () {
    try {
        clearInterval(t_counter);
        clearInterval(weather_counter);
    } catch (e) {
        //console.log(e);
    };
}

var update_counter_ui = function (arr) {
    //arr = [mic_count, apc_ch1In, apc_ch1Out, apc_ch2In, apc_ch2Out]
    var bus_in = parseInt(arr[0]) + parseInt(arr[3]);
    var bus_out = parseInt(arr[4]);
    var onboard = parseInt(arr[1]) - parseInt(arr[2]);
    //onboard = parseInt(arr[0]) + parseInt(arr[2]) - parseInt(arr[1]) - parseInt(arr[3]);
    onboard = onboard < 0 ? 0 : onboard;
    bus_out = bus_out < 0 ? 0 : bus_out;

    var remaining = UPPER_LIMIT - onboard;
    remaining = remaining < 0 ? 0 : remaining;

    console.log({
        time: new Date().toISOString(),
        arr: arr,
        onboard: onboard,
        remaining: remaining,
        bus_out: bus_out,
        bus_in: bus_in
    });

    $("#MicIn").text("Mic Count: " + arr[0]);
    $("#Ch1In").text("Ch1 In:" + arr[1]);
    $("#Ch1Out").text("Ch1 Out:" + arr[2]);
    $("#Ch2In").text("Ch2 In:" + arr[3]);
    $("#Ch2Out").text("Ch2 Out:" + arr[4]);

    $("#Bus_In").text(bus_in);
    $("#Bus_Out").text(bus_out);
    $("#Bus_Up").text(onboard);
    $("#Remaining").text(remaining);
}

var set_web_socket = function () {
    // Create SocketIO instance, connect
    socket = io(WS_CLIENT_LINK);

    // Add a connect listener
    socket.on('connect', function () {
        //console.log('Client has connected to the server!');
        //socket.send("HELLO WORLD!");
    });

    // Add a connect listener
    socket.on('event', function (data) {
        //console.log('Received a message from the server!', data);
        //console.log(data);
        var obj = {};
        try {
            obj = jQuery.parseJSON(data);
            //console.log(obj);

            //console.log(window.location.pathname);
            //console.log(obj.UI_PAGE_URL);

            if ((obj.UI_PAGE_URL) && (window.location.pathname != obj.UI_PAGE_URL) && (window.location.pathname.indexOf("mic_serial") < 0)) {
                window.location.replace(obj.UI_PAGE_URL);
            }

            console.log(obj.DEMO_LOCK);

            if (obj.DEMO_LOCK) {
                lock_ui();
            } else {
                unlock_ui();
            }

            if ((obj.counter_arr) && (!obj.DEMO_LOCK)) {
                update_counter_ui([obj.counter_arr.mic_count, obj.counter_arr.apc_ch1In, obj.counter_arr.apc_ch1Out, obj.counter_arr.apc_ch2In, obj.counter_arr.apc_ch2Out]);
            }

            if (obj.mic_serial_out) {
                mic_serial_receive(obj.mic_serial_out);
            }

            if ((obj.err_report) && (obj.err_report.length > 0)) {
                console.log(obj.err_report);
                show_error(obj.err_report);
            }
        } catch (e) {
            //console.log(e);
        }
    });

    // Add a disconnect listener
    socket.on('disconnect', function () {
        console.log('The client has disconnected!');
        //setTimeout(set_web_socket, 30000);
    });
}

var lock_ui = function(){
    //$("#Remaining_Title").attr("src", "/images/testing_zhtw.gif");
    $("#Upper_Line").hide();
    $("#Remaining").css('color', 'white');
    //$("#Locked").show();
    $("#Locked").hide();
}

var unlock_ui = function () {
    //$("#Remaining_Title").attr("src", "/images/line_zhtw.gif");
    $("#Upper_Line").show();
    $("#Remaining").css('color', '#444444');
    $("#Locked").hide();
}

var show_error = function (err_report) {
    var err_str = (err_report[0].mac + " - ");
    for (var i = 0; i < err_report.length; i++) {
        err_str += (err_report[i].p_name + ": " + err_report[i].err.code + ", ");
    }
    $("#Error_Report").text(err_str);
}

var mic_serial_send = function () {
    var msg = $("#mic_serial_in").val();
    console.log("[mic_serial] sending: " + msg);
    socket.emit("event", { mic_serial_in: msg });
}

var mic_serial_clear = function () {
    $("#mic_serial_in").val("");
}

var buf_to_hexstr = function (buf) {
    var hs = "";
    for (var i = 0; i < buf.length; i++) {
        if (buf[i] < 16) { hs += "0"; }
        hs += (buf[i].toString(16) + " ");
    }
    return hs + "\n";
}

var buf_to_str = function (buf) {
    var hs = "";
    for (var i = 0; i < buf.length; i++) {
        if ((buf[i] >= 32) && (buf[i] <= 126)) {
            hs += String.fromCharCode(buf[i]);
        }
    }
    return hs + "\n";
}

var mic_serial_receive = function (buf) {
    //console.log(buf);
    console.log(buf_to_hexstr(buf.data));
    //console.log(buf_to_str(buf.data));
    $("#mic_serial_out_hex").append(buf_to_hexstr(buf.data));
    $("#mic_serial_out_str").append(buf_to_str(buf.data));
}

var apply_autoscroll = function (id) {
    $(id).change(function () {
        $(id).scrollTop($(id)[0].scrollHeight);
    });
}

$(document).ready(function () {
    if (window.location.pathname.indexOf("mic_serial") < 0) {
        $(document).mousedown(false);
    }
    if (SHOW_WEATHER_TAB == "false") { $("#weather_cotainer").hide(); }
    if (SD_CARD_DOWN == "false") { $("#error_container").hide(); $("#sd_card_down").hide(); };
    set_web_socket();
    reset_counter();
    setTimeout(update_t, 500);
    t_counter = setInterval(update_t, 1000);
    setTimeout(update_weather, 500);
    weather_counter = setInterval(update_weather, WEATHER_TIME_AMOUNT);
    setTimeout(function () { location.reload(); }, RELOAD_TIME_AMOUNT);

    apply_autoscroll("#mic_serial_out_hex");
    apply_autoscroll("#mic_serial_out_str");
});