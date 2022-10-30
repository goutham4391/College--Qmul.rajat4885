var vChatInfo = {
    brand: "",
    signedIn: false,
    accountId: "",
    custName: "",
    emailId: ""
};
var vChatPosition = "bl";
var vChatButtonStyle = "0";

var vTimeOutVar;
if (typeof jQuery == 'undefined') {
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            AttachBizChatEventHandler();
            try {
                vTimeOutVar = window.setTimeout(function () { sendScreenSize(); }, 2000);
            } catch (ex) {
                console.log(ex);
            }
        }
    };
} else {
    var bIsError = false;
    try {
        $(document).ready(function () {
            AttachBizChatEventHandler();
            try {
                vTimeOutVar = window.setTimeout(function () { sendScreenSize(); }, 2000);
                $(".bizchat-launcher-frame").attr({ "title": "BizvuWebChat" });
            } catch (ex) {
                console.log(ex);
            }
        });
    } catch (ex) {
        bIsError = true;
    }
    if (bIsError) {
        document.onreadystatechange = function () {
            if (document.readyState == "complete") {
                AttachBizChatEventHandler();
                try {
                    vTimeOutVar = window.setTimeout(function () { sendScreenSize(); }, 2000);
                } catch (ex) {
                    console.log(ex);
                }
            }
        };
    }
}
window.onresize = function (event) {
    sendScreenSize();
    if (!vTimeOutVar) {
        clearTimeout(vTimeOutVar);
    }
};
function validateURL(value) {
    var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    if (urlregex.test(value)) {
        return (true);
    }
    return (false);
}

function AttachBizChatEventHandler() {
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";
    eventer(messageEvent, function (e) {
        //console.log("messageEvent received ");
        ManageChatBoxSize(e);
    }, false);
}
function ManageChatBoxSize(e) {
    var vMsg = e.data;
    console.log("ManageChatBoxSize: " + vMsg);
    var vExistingWidth = document.getElementById("bizchat-launcher-frame").style["width"];
    var vExistingHeight = document.getElementById("bizchat-launcher-frame").style["height"];

    if (vMsg === "expand_iframe") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "350px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "520px";
        sendPopupSize();
    } else if (vMsg === "collapse_iframe") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "240px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "80px";
    } else if (vMsg === "collapse_iframe_big_button") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "220px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "240px";
    } else if (vMsg === "collapse_iframe_big_button_smallScreen") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "120px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "120px";
    } else if (vMsg === "collapse_iframe_simple_button") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "75px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "75px";
    } else if (vMsg === "collapse_iframe_vertical_button") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "55px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "185px";
    } else if (vMsg === "hide_iframe") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "10px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "10px";
    } else if (vMsg === "minimize_iframe") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "350px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "60px";
    } else if (vMsg === "maximize_iframe") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "350px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "520px";
    } else if (vMsg === "parent_size") {
        //document.getElementById("bizchat-launcher-frame").style["display"] = "none";
        sendScreenSize();
    } else if (vMsg === "chat_params") {
        sendChatParams();
    } else if (vMsg === "parent_url") {
        SendHostPageUrl();
    } else if (vMsg.indexOf("chat_position_") >= 0) {
        var height = window.innerHeight;
        var vNewPos = vMsg.split("_")[2];
        var vButtonStyle = vMsg.split("_")[3];
        try {
            if ($(".bizchat-launcher-frame").attr("src").indexOf("preview=true") > 0) {
                height = 140;
            }
        } catch (ex) {

        }
        //console.log("Repositioning Chat Button: " + vNewPos);
        var vChatPopup = document.getElementById("bizchat-launcher-frame");
        vChatPosition = vNewPos;
        vChatButtonStyle = vButtonStyle;
        if (vButtonStyle === "3") {
            vChatPopup.style["width"] = "240px";
            vChatPopup.style["height"] = "80px";
        } else if (vButtonStyle === "1") {
            vChatPopup.style["width"] = "75px";
            vChatPopup.style["height"] = "75px";
        } else if (vButtonStyle === "2") {
            if (height > 800) {
                vChatPopup.style["width"] = "220px";
                vChatPopup.style["height"] = "240px";
            } else {
                vChatPopup.style["width"] = "120px";
                vChatPopup.style["height"] = "120px";
            }
        }else if (vButtonStyle === "3") {
            vChatPopup.style["width"] = "55px";
            vChatPopup.style["height"] = "185px";
        }
        if (vNewPos === "tr") {
            vChatPopup.style["bottom"] = null;
            vChatPopup.style["left"] = null;
           if (vButtonStyle === "0") {
                vChatPopup.style["top"] = "60px";
            } else if (vButtonStyle === "1" ||
                vButtonStyle === "2") {
                vChatPopup.style["top"] = "20px";
                vChatPopup.style["right"] = "20px";
            } else if (vButtonStyle === "3") {
                vChatPopup.style["top"] = "10px";
                vChatPopup.style["right"] = "10px";
            }
        } else if (vNewPos === "tl") {
            vChatPopup.style["bottom"] = null;
            vChatPopup.style["right"] = null;
           if (vButtonStyle === "0") {
                vChatPopup.style["top"] = "0px";
                vChatPopup.style["left"] = "0px";
            } else if (vButtonStyle === "1" ||
                vButtonStyle === "2" ||
                vButtonStyle === "3") {
                vChatPopup.style["top"] = "20px";
                vChatPopup.style["left"] = "20px";
            } else if (vButtonStyle === "3") {
                vChatPopup.style["top"] = "10px";
                vChatPopup.style["left"] = "10px";
            }
        } else if (vNewPos === "bl") {
            vChatPopup.style["right"] = null;
           if (vButtonStyle === "3") {
                vChatPopup.style["left"] = "10px";
            } else {
                vChatPopup.style["left"] = "20px";
            }
        } else if (vNewPos === "ml") {
            vChatPopup.style["bottom"] = null;
            vChatPopup.style["right"] = null;
            if (vButtonStyle === "0") {
                vChatPopup.style["top"] = ((height - 80) / 2).toString() + "px";
            } else if (vButtonStyle === "1") {
                vChatPopup.style["top"] = ((height - 75) / 2).toString() + "px";
                vChatPopup.style["left"] = "20px";
            } else if (vButtonStyle === "2") {
                vChatPopup.style["top"] = ((height - 200) / 2).toString() + "px";
                vChatPopup.style["left"] = "20px";
            } else if (vButtonStyle === "3") {
                vChatPopup.style["top"] = ((height - 185) / 2).toString() + "px";
                vChatPopup.style["left"] = "10px";
            }
        } else if (vNewPos === "mr") {
            vChatPopup.style["left"] = null;
            vChatPopup.style["bottom"] = null;
            if (vButtonStyle === "0") {
                vChatPopup.style["top"] = ((height - 80) / 2) .toString() + "px";
            } else if (vButtonStyle === "1") {
                vChatPopup.style["top"] = ((height - 75) / 2).toString() + "px";
                vChatPopup.style["right"] = "20px";
            } else if (vButtonStyle === "2") {
                vChatPopup.style["top"] = ((height - 200) / 2).toString() + "px";
                vChatPopup.style["right"] = "20px";
            } else if (vButtonStyle === "3") {
                vChatPopup.style["top"] = ((height - 185) / 2).toString() + "px";
                vChatPopup.style["right"] = "10px";
            }

        }
    } else if (vMsg === "initialize_iframe") {
        //console.log("initialize_iframe");
        //document.getElementById("bizchat-launcher-frame").style["display"] = "block";
        document.getElementById("bizchat-launcher-frame").style["width"] = "240px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "80px";
        document.getElementById("bizchat-launcher-frame").style["bottom"] = "60px";
    } else if (vMsg === "initialize_simple_iframe") {
        if (vExistingWidth.indexOf("px") > 0) {
            vExistingWidth = vExistingWidth.replace("px", "");
            if (parseInt(vExistingWidth) <= 75) {
                document.getElementById("bizchat-launcher-frame").style["width"] = "75px";
            }
        } else {
            document.getElementById("bizchat-launcher-frame").style["width"] = "75px";
        }
        if (vExistingHeight.indexOf("px") > 0) {
            vExistingHeight = vExistingHeight.replace("px", "");
            if (parseInt(vExistingHeight) <= 75) {
                document.getElementById("bizchat-launcher-frame").style["height"] = "75px";
            }
        } else {
            document.getElementById("bizchat-launcher-frame").style["height"] = "75px";
        }

        document.getElementById("bizchat-launcher-frame").style["bottom"] = "25px";
        document.getElementById("bizchat-launcher-frame").style["right"] = "50px";
    } else if (vMsg === "initialize_vertical_iframe") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "55px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "185px";

        document.getElementById("bizchat-launcher-frame").style["bottom"] = "10px";
        document.getElementById("bizchat-launcher-frame").style["right"] = "10px";
    } else if (vMsg === "initialize_big_iframe") {
        var height = window.innerHeight;
        if (height > 800) {
            document.getElementById("bizchat-launcher-frame").style["width"] = "220px";
            document.getElementById("bizchat-launcher-frame").style["height"] = "240px";
        } else {
            document.getElementById("bizchat-launcher-frame").style["width"] = "120px";
            document.getElementById("bizchat-launcher-frame").style["height"] = "120px";
        }
        document.getElementById("bizchat-launcher-frame").style["bottom"] = "25px";
        document.getElementById("bizchat-launcher-frame").style["right"] = "50px";
    } else if (vMsg === "initialize_big_iframe_small_screen") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "120px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "120px";
        document.getElementById("bizchat-launcher-frame").style["bottom"] = "25px";
        document.getElementById("bizchat-launcher-frame").style["right"] = "50px";
    } else if (vMsg.length > 5 && vMsg.substring(0, 5) === "goto:") {
        var vLinkToNavigate = vMsg.substring(5);
        if (validateURL(vLinkToNavigate) === true) {
            window.location.href = vLinkToNavigate;
        }
    } else if (vMsg === "auto_popup_iframe") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "350px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "240px";
    } else if (vMsg === "auto_popup_iframe_close") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "75px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "75px";
    } else if (vMsg === "auto_popup_iframe_close_bigger") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "240px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "80px";
    } else if (vMsg === "auto_popup_iframe_close_biggest") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "220px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "240px";
    } else if (vMsg === "auto_popup_iframe_close_biggest_smallScreen") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "120px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "120px";
    } else if (vMsg === "auto_popup_iframe_close_vertical") {
        document.getElementById("bizchat-launcher-frame").style["width"] = "55px";
        document.getElementById("bizchat-launcher-frame").style["height"] = "185px";
    } else if (vMsg.length > 17 && vMsg.substring(0, 17) === "auto_popup_iframe") {
        var vButtonArray = vMsg.split(",");
        document.getElementById("bizchat-launcher-frame").style["width"] = "350px";
        document.getElementById("bizchat-launcher-frame").style["height"] = vButtonArray[1];

    }
}
var sendPopupSize = function () {
    try {
        var iframeEl = document.getElementById('bizchat-launcher-frame');
        iframeEl.contentWindow.postMessage(JSON.stringify({
            type: "popupSize",
            width: document.getElementById("bizchat-launcher-frame").style["width"],
            height: document.getElementById("bizchat-launcher-frame").style["height"],
            location: window.location.href
        }), '*');
    } catch (ex) {
        console.log("sendPopupSize: " + ex.toString());
    }
};

var sendScreenSize = function () {
    var vChatWidth = "";
    var vChatHeight = "";
    try {
        var height = window.innerHeight;
        try {
            if ($(".bizchat-launcher-frame").attr("src").indexOf("preview=true") > 0) {
                height = 140;
            }
        } catch (ex) {

        }
        vChatWidth = document.getElementById("bizchat-launcher-frame").style["width"];
        vChatHeight = document.getElementById("bizchat-launcher-frame").style["height"];
        if (vChatPosition === "ml" || vChatPosition === "mr") {
            var vChatPopup = document.getElementById("bizchat-launcher-frame");
           if (vChatButtonStyle === "0") {
                vChatPopup.style["top"] = ((height - 80) / 2).toString() + "px";
           } else if (vChatButtonStyle === "1") {
                vChatPopup.style["top"] = ((height - 75) / 2).toString() + "px";
           } else if (vChatButtonStyle === "2") {
                vChatPopup.style["top"] = ((height - 200) / 2).toString() + "px";
           } else if (vChatButtonStyle === "3") {
                vChatPopup.style["top"] = ((height - 185) / 2).toString() + "px";
            }        }
    } catch (ex) {
        vChatWidth = "";
        vChatHeight = "";
    }
    try {
        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;
        var msg = x + ' × ' + y;
        // Make sure you are sending a string, and to stringify JSON
        var iframeEl = document.getElementById('bizchat-launcher-frame');
        iframeEl.contentWindow.postMessage(JSON.stringify({
            type: "ScreenSize",
            width: x,
            height: y,
            chatWidth: vChatWidth,
            chatHeight: vChatHeight,
            location: window.location.href
        }), '*');

    } catch (ex) {
        console.log("sendScreenSize: Error: " + ex.toString());
    }
};

function extractEmails(text) {
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
}

function sendChatParams() {
    //vChatInfo.accountId = "sdsdsd";
    //vChatInfo.brand = "dfdfdfdf";
    //vChatInfo.signedIn = true
    //vChatInfo.custName = "wewewewewe";
    //vChatInfo.emailId = "sdssdsds";

    try {
        // Make sure you are sending a string, and to stringify JSON
        var iframeEl = document.getElementById('bizchat-launcher-frame');
        iframeEl.contentWindow.postMessage(JSON.stringify({
            type: "ChatParams",
            params: vChatInfo
        }), '*');

    } catch (ex) {
        console.log("sendChatParams: Error: " + ex.toString());
    }

}

function SendHostPageUrl() {
    try {
        var iframeEl = document.getElementById('bizchat-launcher-frame');
        iframeEl.contentWindow.postMessage(JSON.stringify({
            type: "parent_url",
            value: window.location.href
        }), '*');
    } catch (ex) {
        console.log("SendHostPageUrl: Error: " + ex.toString());
    }
}