/* eslint-disable no-prototype-builtins, no-undef */
async function crochetGetPage() {
    var getUrl = function () {
        if (
            document.querySelector(
                "link[type='application/json'][rel='alternate']"
            )
        ) {
            return document.querySelector(
                "link[type='application/json'][rel='alternate']"
            ).attributes.href.value;
        }
    };
    if (window.location.hostname !== "amigurumi.today") {
        return;
    }
    var url = getUrl();
    if (!url) {
        return;
    }
    var header = document.querySelector("header").innerHTML;
    var title = document.querySelector(".entry-title").innerText;
    var content = await fetch(url)
        .then((response) => response.json())
        .then((result) => {
            if (result.hasOwnProperty("content")) {
                return result.content.rendered;
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    content = header + "<h2>"+title+"</h2>" + content;
    return content;
}

async function setPage(result) {
    document.body.innerHTML = "";
    document.body.innerHTML = result;
    setTimeout(function () {
        window.print();
    }, 500);
}

const button = document.querySelector("button");
button.addEventListener("click", async () => {
    getContent();
});

async function getContent() {
    var tabs = await chrome.tabs.query({
        url: "https://amigurumi.today/*",
        active: true,
    });
    if (tabs.length == 1) {
        var tab = tabs[0];
        chrome.scripting.executeScript(
            {
                target: {
                    tabId: tab.id,
                },
                function: crochetGetPage,
            },
            (results) => {
                if (results.length == 1) {
                    let result = results[0].result;
                    chrome.scripting.executeScript({
                        target: {
                            tabId: tab.id,
                        },
                        function: setPage,
                        args: [result],
                    });
                }
            }
        );
    }
}
