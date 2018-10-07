javascript:
"use strict";
(function (defaultAddress, username, password, sendMethod) {
    var parentWin, bookmarkletWin, list_Links, list_Domains, list_Checked, numChecked, url;

    function getPageLinks() {
        var list_Links = [];
        for (var e = parentWin.document.links.length - 1, t; t = parentWin.document.links[e]; e--) {
            if (!t.href.match(/^(?:mailto:|javascript:|data:)/)) {
                if (list_Links.indexOf(t.href) < 0) {
                    list_Links.push(t.href);
                }
            }
        }
        return list_Links;
    }

    function getPageDomains() {
        var list_Domains = [""];
        for (var e = parentWin.document.links.length - 1, t; t = parentWin.document.links[e]; e--) {
            if (!t.href.match(/^(?:mailto:|javascript:|data:)/)) {
                var d = t.hostname.match(/[^.]+\.(?:\w{3,}|\w{2,3}\.\w{2})$/);
                if (d !== null && list_Domains.indexOf(d[0].toLowerCase()) < 0) {
                    list_Domains.push(d[0].toLowerCase());
                }
            }
        }
        return list_Domains;
    }

    function buildLinksDiv() {
        var t = bookmarkletWin.document.getElementById("searchInput").value;
        var title;
        if (!t) {
            t = "";
            title = "<h2> Links: </h2>";
        } else {
            title = "<h2> Filtered links: &quot;" + t + "&quot;</h2>";
        }
        var html = title + '<div id="container"><input type="checkbox" id="checkall"><label for="checkall">All</label><br>';
        for (var n = 0; n < list_Links.length; n++) {
            if (list_Links[n].indexOf(t) !== -1) {
                html += '<div style="display: inline-block; margin: 0;margin-left: 1em;white-space: nowrap;"><input type="checkbox"' + (list_Checked[n] ? ' checked' : '') + ' id="link' + n + '"><label for="link' + n + '"><a href="' + list_Links[n] + '">' + list_Links[n] + "</a></label></div><br>";
            }
        }
        var r = bookmarkletWin.document.getElementById("divLinks");
        r.innerHTML = html + "</div>";
    }

    function bookmarklet() {
        var pnd = document.createElement("div");
        var z = document.createElement("div");
        z.innerHTML = 'Package Name: ';
        z.setAttribute("style", "margin:18px 0;white-space:nowrap");
        var pnt = document.createElement("input");
        pnt.style.display = "inline-block";
        pnt.setAttribute("id", "packagename");
        pnt.setAttribute("type", "text");
        pnt.setAttribute("size", "70");
        pnt.setAttribute("value", parentWin.document.title);
        pnt.setAttribute("placeholder", "Package Name");
        pnt.oninput = function () {
            updateButtons();
        };
        z.appendChild(pnt);
        var f = document.createElement("button");
        f.setAttribute("id", "toPyload");
        f.setAttribute("style", "display:inline-block;margin-left: 5px");
        f.setAttribute("disabled", "");
        f.innerHTML = "Send to pyLoad";
        f.onclick = function () {
            toPyload();
        };
        z.appendChild(f);
        f = document.createElement("button");
        f.setAttribute("id", "toClipboard");
        f.setAttribute("style", "display:inline-block;margin-left: 5px");
        f.setAttribute("disabled", "");
        f.innerHTML = "&#128203;";
        f.setAttribute("title", "Copy links to clipboard");
        f.onclick = function () {
            toClipboard();
        };
        z.appendChild(f);
        f = document.createElement("button");
        f.setAttribute("id", "configtoggle");
        f.setAttribute("style", "display:inline-block;margin-left: 5px");
        f.innerHTML = "&#9881;";
        f.onclick = function () {
            var c = bookmarkletWin.document.getElementById("config");
            if (c.style.display === "block") {
                c.style.display = "none";
            } else {
                c.style.display = "block";
            }
        };
        z.appendChild(f);
        pnd.appendChild(z);
        f = document.createElement("fieldset");
        f.setAttribute("id", "config");
        f.style.display = "none";
        var serveraddr = typeof(bookmarkletWin.Storage) !== "undefined" ? bookmarkletWin.localStorage.getItem("pyloadServer") : "";
        serveraddr = serveraddr || defaultAddress;
        f.innerHTML = "<legend style='font-weight:bold;'>Configuration</legend>pyLoad's address:<input type='text' id='serveraddr' size='30' style='margin-left: 5px' placeholder='scheme://address:port' value='" + serveraddr + "'>";
        z = document.createElement("button");
        z.innerHTML = "Save";
        z.style.cssFloat = "right";
        z.onclick = function (ev) {
            var serveraddr = bookmarkletWin.document.getElementById("serveraddr").value;
            if (serveraddr.length > 0) {
                bookmarkletWin.localStorage.setItem("pyloadServer", serveraddr);
                bookmarkletWin.alert('Saved for domain "' + window.top.location.hostname + '"');
            }
        };
        f.append(z);
        pnd.appendChild(f);
        var e = document.createElement("div");
        e.innerHTML = '<br><hr style="color:lightgrey;"><h2>Page URL:</h2><div style="display: inline-block; margin: 0;white-space: nowrap;"><input type="checkbox" id="checkurl"><label for="checkurl"><a href="' + url + '">' + url + '</a></label></div><br><br><hr style="color:lightgrey;">';
        var t = document.createElement("div");
        var n = document.createElement("h2");
        n.setAttribute("id", "Filter links by keyword:");
        t.appendChild(n);
        var r = document.createElement("input");
        r.setAttribute("id", "searchInput");
        r.setAttribute("type", "text");
        r.setAttribute("placeholder", "Filter..");
        t.appendChild(r);
        t.innerHTML = t.innerHTML + " or Check domain: ";
        var i = document.createElement("select");
        i.setAttribute("id", "selectDomain");
        list_Domains.forEach(function (s) {
            var o = document.createElement("option");
            o.text = s;
            o.onclick = function () {
                domainCheck();
            };
            i.appendChild(o)
        });
        t.appendChild(i);
        var l = document.createElement("div");
        l.setAttribute("id", "divLinks");
        bookmarkletWin.document.body.appendChild(pnd);
        bookmarkletWin.document.body.appendChild(e);
        bookmarkletWin.document.body.appendChild(t);
        bookmarkletWin.document.body.appendChild(l);
        bookmarkletWin.document.title = "Send to pyLoad";
        bookmarkletWin.document.getElementById("searchInput").oninput = function () {
            buildLinksDiv();
        };
        bookmarkletWin.document.addEventListener('click', function (e) {
            if (e.target && e.target.type === "checkbox") {
                if (e.target.id.indexOf("link") === 0) {
                    linkChecked.call(e.target, e);
                } else if (e.target.id === "checkall") {
                    checkAll.call(e.target, e);
                }
                updateButtons();
            } else if (e.target.nodeName === "A") {
                e.preventDefault();
            }
        });
        buildLinksDiv();
    }

    function updateLink(linkNum, check) {
        var c = bookmarkletWin.document.getElementById("link" + linkNum);
        if (c) {
            c.checked = check;
        }
        numChecked += (list_Checked[linkNum] === check ? 0 : 1) * (check ? 1 : -1);
        list_Checked[linkNum] = check;
        c = bookmarkletWin.document.getElementById("checkall");
        c.checked = numChecked > 0;
        c.indeterminate = numChecked > 0 && numChecked < list_Checked.length;
    }

    function domainCheck() {
        var list_DomainLinkIds = [];
        var check = false, n;
        var d = bookmarkletWin.document.getElementById("selectDomain").value;
        if (d !== "") {
            var r = new RegExp("(?://|\\.)" + d.replace(".", "\\.") + "(?:[?/]|$)", "i");
            for (n = 0; n < list_Links.length; n++) {
                var l = list_Links[n].match(/:\/\/[^/?]+(?:[?/]|$)/g);
                if (l && l[0].match(r)) {
                    list_DomainLinkIds.push(n);
                    if (list_Checked[n] === false)
                        check = true;
                }
            }
            for (n = 0; n < list_DomainLinkIds.length; n++) {
                updateLink(list_DomainLinkIds[n], check);
            }
            updateButtons();
        }
    }

    function linkChecked(e) {
        var linkNum = parseInt(this.id.replace('link', ''), 10);
        updateLink(linkNum, this.checked);
    }

    function checkAll(e) {
        var check = numChecked < list_Checked.length;
        this.checked = check;
        this.indeterminate = false;
        for (var n = 0; n < list_Links.length; n++) {
            updateLink(n, check);
        }
    }

    function updateButtons() {
        var nochecked = numChecked === 0 && !bookmarkletWin.document.getElementById("checkurl").checked;
        bookmarkletWin.document.getElementById("toClipboard").disabled = nochecked;
        bookmarkletWin.document.getElementById("toPyload").disabled = nochecked ||
            bookmarkletWin.document.getElementById("packagename").value.length === 0;
    }

    function toPyload() {
      var winz;
      var list_PyLoad = [];
      var pn = bookmarkletWin.document.getElementById("packagename").value;
      var ps = bookmarkletWin.document.getElementById("serveraddr").value;
      if (bookmarkletWin.document.getElementById("checkurl").checked) {
          list_PyLoad.push(url);
      }
      for (var n = 0; n < list_Checked.length; n++) {
        if (list_Checked[n]) {
          list_PyLoad.push(list_Links[n]);
        }
      }
      if (sendMethod === 1) {
        winz = doPost(ps+"/flash/add",{name: pn, urls: list_PyLoad.join("\n")});
      } else if (sendMethod === 2) {
        winz=window.open(ps+'/api/addPackage?name="'+pn+'"&links='+JSON.stringify(list_PyLoad),
          "","resizable=no, location=no, width=100, height=100, menubar=no, status=no, scrollbars=no, menubar=no");
      } else if (sendMethod === 3) {
        var postParameters = {name: pn, links: JSON.stringify(list_PyLoad)};
		winz = doPost(ps+"/api/addPackage",
			{name: JSON.stringify(pn), links: JSON.stringify(list_PyLoad),u: username, p: password});
      }
      setTimeout(function () {
          winz.close();
      }, 1000);
      bookmarkletWin.close();
    }

    function toClipboard() {
        var list_PyLoad = bookmarkletWin.document.getElementById("checkurl").checked ? [url] : [];
        for (var n = 0; n < list_Checked.length; n++) {
            if (list_Checked[n]) {
                list_PyLoad.push(list_Links[n]);
            }
        }
        var t = document.createElement('textarea');
        t.style.fontSize = '12pt';
        t.style.border = '0';
        t.style.padding = '0';
        t.style.margin = '0';
        t.style.position = 'absolute';
        t.style.left = '-9999px';
        t.style.top = (bookmarkletWin.pageYOffset || bookmarkletWin.document.documentElement.scrollTop) + 'px';
        t.setAttribute('readonly', '');
        t.value = list_PyLoad.join("\n");
        bookmarkletWin.document.body.appendChild(t);
        t.select();
        try {
            var successful = bookmarkletWin.document.execCommand('copy');
            bookmarkletWin.alert('Copy ' + (successful ? 'successful' : 'unsuccessful'));
        } catch (err) {
            bookmarkletWin.alert('Oops, unable to copy' + err);
        }
        bookmarkletWin.document.body.removeChild(t);
    }

    function doPost(url, postParameters) {
        var winz, i;
        var formElement = document.createElement("form");
        formElement.style.display = "none";
        formElement.target = "_Pyload";
        formElement.method = "POST";
        formElement.action = url;
        for (var n in postParameters) {
          if (postParameters.hasOwnProperty(n)) {
            i = document.createElement("input");
            i.type = "text";
            i.name = n;
            i.value = postParameters[n];
            formElement.appendChild(i);
          }
        }
        bookmarkletWin.document.body.appendChild(formElement);
        winz = bookmarkletWin.open("", "_Pyload", "resizable=no, location=no, width=100, height=100, menubar=no, status=no, scrollbars=no, menubar=no");
        formElement.submit();
        return winz;
    }
    parentWin = window;
    bookmarkletWin = window.open("", "_blank", "width=800,height=600,scrollbars,resizable,menubar");
    list_Links = getPageLinks();
    list_Checked = Array.apply(null, Array(list_Links.length)).map(Boolean.prototype.valueOf, false);
    numChecked = 0;
    list_Domains = getPageDomains();
    url = parentWin.document.URL;
    bookmarklet();
})("http://localhost:9666", "username", "password", 1);