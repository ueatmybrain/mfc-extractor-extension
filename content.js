console.log("script loaded")
const button = document.createElement("button");
const buttonLabel = `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 1.3em; height: 1.3em;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
              </svg>
               Copy JSON
        `
const targetSelector = ".object-share";
const observer = new MutationObserver((mutations, obs) => {
    console.log("waiting for ", targetSelector);
    const el = document.getElementsByClassName(targetSelector);
    if (el) {
        insertButton();
        obs.disconnect();
    }
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});

function insertButton() {
    if (document.getElementById("my-extension-button")) {
        return
    };
    button.id = "my-extension-button";
    button.style.display = "inline-flex";
    button.style.alignItems = "center";
    button.style.gap = ".3em";
    button.innerHTML = buttonLabel;
    button.style.zIndex = "9999";
    button.className = "";

    try {
        button.addEventListener("click", async () => {
            const figureData = getFigureData();
            const stringifiedData = JSON.stringify(figureData, null, 2);
            await navigator.clipboard.writeText(stringifiedData)
            console.log("Copied data for " + figureData.character + "!");
            successEffect(button)
        });

        document.getElementsByClassName("object-share")[0].appendChild(button);
        console.log("button added!")
    } catch (e) {
        console.error(e);
    }
}
function successEffect() {
    button.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
             style="width: 1.3em; height: 1.3em">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z"/>
        </svg>
               Copied!
        `
    button.style.color = "green"
    setTimeout(() => {
        button.style.transition = "color 1s ease-out";
        button.style.color = "";
        button.innerHTML = buttonLabel
    }, 2000);
}

function getFigureData() {
    let obj = {}
    let jp = {}
    let releases = []
    let releasesChainActive = false
    for (row of document.querySelector(".data").querySelectorAll(".data-field")) {
        let label = row.querySelector(".data-label")
        let value = row.querySelector(".data-value")
        let key = null
        let val = null
        let valJp = null

        if (label) {
            if (releasesChainActive) {
                console.log(releases)
                obj["releases"] = releases;
                releasesChainActive = false
            } else {
                console.log(label.innerText)
                key = label.innerText
            }
            if (label.innerText.startsWith("Releases")) {
                releasesChainActive = true
                releases.push({"date": value.querySelector(".time").innerText, "productId": value.querySelector(".tbx-window")?.innerText || "---" })
            }
            if (row.querySelector("em")){
                val = []
                valJp = []
                for (entry of row.querySelectorAll(".item-entries")){
                    val.push({[entry.querySelector("em").innerText.toLowerCase()]: entry.querySelector("span").innerText})
                    if (entry.querySelector("span").getAttribute("switch")) {
                        valJp.push({[entry.querySelector("em").innerText.toLowerCase()]: entry.querySelector("span").getAttribute("switch")})
                    }
                }}
            else {
                if (!releasesChainActive) {
                    console.log(value.innerText)
                    val = value.innerText
                    if (value.querySelector("[switch]")) {
                        valJp = value.querySelector("[switch]").getAttribute("switch")
                    }

                    if (value.querySelectorAll("[switch]")) {
                        let temp = []
                        for (el of value.querySelectorAll("[switch]")){ temp.push(el.getAttribute("switch"))}
                        valJp = temp.join()
                    }
                }
            }
        }
        if (releasesChainActive && !label) {
            releases.push({"date": value.querySelector(".time").innerText, "productId": value.querySelector(".tbx-window")?.innerText || "---" })
        }
        if (key === "Dimensions") {val = value.querySelector(".item-scale")?.innerText || "non-scale"}
        if (key && val && val.length > 0) {
            obj[key.toLowerCase()] = val;
        }
        if (key && valJp && valJp.length > 0) {
            jp[key.toLowerCase()] = valJp;
        }

    }
    const images = [];
    const mainImg = document.querySelector(".item-picture img");
    if (mainImg) {
        images.push(mainImg.getAttribute("src"));
    }

    for (const thumb of document.querySelector(".item-picture").querySelectorAll(".more")) {
        const bg = thumb.style.backgroundImage;
        images.push(bg.replace("url(", "").replace(")", "").replace("\"","").replace("\"",""))
    }
    obj["images"] = images
    obj["jp"] = jp
    obj["icon"] = document.querySelector(".thumbnail").getAttribute("src")
    obj["id"] = document.querySelector(".current").innerText.replaceAll("Item #","")
    console.log("found object!")
    console.log(obj)
    return obj
}
