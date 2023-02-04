javascript:
"use strict";
(function (defaultAddress, username, password, sendMethod) {
    let parentWin, bookmarkletWin, list_Links, list_Domains, list_Checked, numChecked, url;

    function extractPageLinks() {
        let results = [];
        let unique_links = {};
        for (let e = 0; e < parentWin.document.links.length; e++) {
            let t = parentWin.document.links[e];
            if (!t.href.match(/^(?:mailto:|javascript:|data:)/)) {
              if(!unique_links[t.href]) {
                unique_links[t.href] = true;
                results.push({href:t.href, name:t.text.replace(/(<([^>]+)>)/ig,"").trim()});
              }
            }
        }
        return results;
    }

    function extractSelectionLinks() {
        let results = [];
        let unique_links = {};
        let selectedText = (parentWin.getSelection ? parentWin.getSelection() : (parentWin.document.getSelection ? parentWin.document.getSelection() : (parentWin.document.selection ? parentWin.document.selection.createRange().text : ''))).toString();
        if (selectedText !== "") {
            let urls = selectedText.match(/(?:ht|f)tp(?:s?):\/\/[a-zA-Z0-9-./?=_&%#:]+(?:[< "'\r\n\t]|$)/ig) || [];
            for (let e = 0; e < urls.length; e++) {
                let t = urls[e].replace(/[< "'\r\n\t]/g, "");
                if(!unique_links[t]) {
                    unique_links[t] = true;
                    results.push({href:t, name:""});
                }
            }
        }
        return results;
    }

    function getPageDomains() {
        let list_Domains = [];
        let parser = document.createElement('a');
        list_Links.forEach(function (l) {
            parser.href = l.href;
            let d = parser.hostname.match(/[^.]+\.(?:\w{3,}|\w{2,3}\.\w{2})$/);
            if (d !== null && list_Domains.indexOf(d[0].toLowerCase()) < 0) {
                list_Domains.push(d[0].toLowerCase());
            }
        });
        return list_Domains;
    }

    function buildLinksDiv() {
        let t = bookmarkletWin.document.getElementById("searchInput").value;
        let title;
        if (!t) {
            t = "";
            title = "<h4>Links:</h4>";
        } else {
            title = "<h4>Filtered links: &quot;" + t + "&quot;</h4>";
        }
        t = t.toLocaleLowerCase();
        let html = title + '<div id="container" class="form-group form-check"><input type="checkbox" id="checkall" class="form-check-input"><label for="checkall">All</label><div class="form-check">';
        for (let n = 0; n < list_Links.length; n++) {
            if (list_Links[n].href.toLocaleLowerCase().indexOf(t) !== -1 || list_Links[n].name.toLocaleLowerCase().indexOf(t) !== -1) {
                html += '<div class="form-check"><input class="form-check-input" type="checkbox"' + (list_Checked[n] ? ' checked' : '') + ' id="link' + n + '"><label class="form-check-label small" for="link' + n + '">' + (list_Links[n].name ? '<span class="badge badge-warning">' + list_Links[n].name + '</span>&nbsp;' : '') + '<a href="' + list_Links[n].href + '">' + list_Links[n].href + "</a></label></div>";
            }
        }
        html += "</div></div>";
        let r = bookmarkletWin.document.getElementById("divLinks");
        r.innerHTML = html;
    }

    function bookmarklet() {
      let l=document.createElement("link");
      l.setAttribute("href","https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css");
      l.setAttribute("rel","stylesheet");
      bookmarkletWin.document.head.appendChild(l);
      let pnd = document.createElement("div");
      let z = document.createElement("div");
      z.innerHTML = '<h4>Package Name:</h4>';
      let i = document.createElement("div");
      i.setAttribute("class","input-group");
      let pnt = document.createElement("input");
      pnt.setAttribute("id", "packagename");
      pnt.setAttribute("type", "text");
      pnt.setAttribute("size", "70");
      pnt.setAttribute("class", "form-control form-control-sm");
      pnt.setAttribute("value", parentWin.document.title);
      pnt.setAttribute("placeholder", "Package Name");
      pnt.oninput = function () {
        updateButtons();
      };
      i.appendChild(pnt);
      let group = document.createElement("div");
      group.setAttribute("class","input-group-append");
      let f = document.createElement("button");
      f.setAttribute("id", "toPyload");
      f.setAttribute("disabled", "");
      f.setAttribute("class", "btn btn-primary btn-sm");
      f.setAttribute("style", "margin-left: 5px; border-radius: .25rem;");
      f.innerHTML = "Send to pyLoad";
      f.onclick = function () {
        toPyload();
      };
      group.appendChild(f);
      f = document.createElement("button");
      f.setAttribute("id", "toClipboard");
      f.setAttribute("disabled", "");
      f.setAttribute("class", "btn btn-secondary btn-sm");
      f.setAttribute("style", "margin-left: 5px; border-radius: .25rem;");
      f.innerHTML = "&#128203;";
      f.setAttribute("title", "Copy links to clipboard");
      f.onclick = function () {
        toClipboard();
      };
      group.appendChild(f);
      f = document.createElement("button");
      f.setAttribute("id", "configtoggle");
      f.setAttribute("class", "btn btn-secondary btn-sm");
      f.setAttribute("style", "margin-left: 5px; border-radius: .25rem;");
      f.innerHTML = "&#9881;";
      f.onclick = function () {
        let c = bookmarkletWin.document.getElementById("config");
        if (c.style.display === "block") {
          c.style.display = "none";
        } else {
          c.style.display = "block";
        }
      };
      group.appendChild(f);
      i.appendChild(group);
      z.appendChild(i);
      pnd.appendChild(z);
      f = document.createElement("fieldset");
      f.setAttribute("id", "config");
      f.style.display = "none";
      let serveraddr = typeof(bookmarkletWin.Storage) !== "undefined" ? bookmarkletWin.localStorage.getItem("pyloadServer") : "";
      serveraddr = serveraddr || defaultAddress;
      f.innerHTML = "<h5>Configuration</h5><label for='serveraddr'>pyLoad's address:</label><div class='input-group'><input type='text' class='form-control form-control-sm' id='serveraddr' placeholder='scheme://address:port' value='" + serveraddr + "' /><div class='input-group-append'><button id='save-config' class='btn btn-danger btn-sm'>Save</button></div></div>";
      f.querySelector('#save-config').onclick = function (ev) {
        let serveraddr = bookmarkletWin.document.getElementById("serveraddr").value;
        if (serveraddr.length > 0) {
          bookmarkletWin.localStorage.setItem("pyloadServer", serveraddr);
          bookmarkletWin.alert('Saved for domain "' + window.top.location.hostname + '"');
        }
      };
      pnd.appendChild(f);
      let e = document.createElement("div");
      e.innerHTML = '<hr style="color:lightgrey;"><h4>Page URL:</h4><div class="form-group form-check text-nowrap"><input type="checkbox" class="form-check-input" id="checkurl"><label for="checkurl"><a href="' + url + '">' + url + '</a></label></div><hr style="color:lightgrey;">';
      let t = document.createElement("div");
      t.innerHTML = '<fieldset class="form-inline"><input id="searchInput" type="text" class="form-control form-control-sm mr-2" placeholder="Filter links..." style="width: 60%;" /><select id="selectDomain" class="form-control form-control-sm"><option>Or check domain...</option></select></fieldset>';
      let selectDomain = t.querySelector('#selectDomain');
      list_Domains.forEach(function (s) {
        let o = document.createElement("option");
        o.text = s;
        o.onclick = function () {
          domainCheck();
        };
        selectDomain.appendChild(o)
      });
      let dl = document.createElement("div");
      dl.setAttribute("id", "divLinks");
      let container = document.createElement("div");
      container.setAttribute("class","container-fluid");
      container.appendChild(pnd);
      container.appendChild(e);
      container.appendChild(t);
      container.appendChild(dl);
      bookmarkletWin.document.body.appendChild(container);
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
      let c = bookmarkletWin.document.getElementById("link" + linkNum);
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
      let list_DomainLinkIds = [];
      let check = false, n;
      let d = bookmarkletWin.document.getElementById("selectDomain").value;
      if (d !== "") {
        let r = new RegExp("(?://|\\.)" + d.replace(".", "\\.") + "(?:[?/]|$)", "i");
        for (n = 0; n < list_Links.length; n++) {
          let l = list_Links[n].href.match(/:\/\/[^/?]+(?:[?/]|$)/g);
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
      let linkNum = parseInt(this.id.replace('link', ''), 10);
      updateLink(linkNum, this.checked);
    }

    function checkAll(e) {
      let check = numChecked < list_Checked.length;
      this.checked = check;
      this.indeterminate = false;
      for (let n = 0; n < list_Links.length; n++) {
        updateLink(n, check);
      }
    }

    function updateButtons() {
      let nochecked = numChecked === 0 && !bookmarkletWin.document.getElementById("checkurl").checked;
      bookmarkletWin.document.getElementById("toClipboard").disabled = nochecked;
      bookmarkletWin.document.getElementById("toPyload").disabled = nochecked ||
      bookmarkletWin.document.getElementById("packagename").value.length === 0;
    }

    function toPyload() {
      let winz;
      let list_PyLoad = [];
      let pn = bookmarkletWin.document.getElementById("packagename").value;
      let ps = bookmarkletWin.document.getElementById("serveraddr").value;
      if (bookmarkletWin.document.getElementById("checkurl").checked) {
          list_PyLoad.push(url);
      }
      for (let n = 0; n < list_Checked.length; n++) {
        if (list_Checked[n]) {
          list_PyLoad.push(list_Links[n].href);
        }
      }
      if (sendMethod === 1) {
        winz = doPost(ps+"/flash/add",{package: pn, urls: encodeURIComponent(list_PyLoad.join("\n"))});
      } else if (sendMethod === 2) {
        winz=window.open(ps+'/api/addPackage?name="'+pn+'"&links='+encodeURIComponent(JSON.stringify(list_PyLoad)),
          "","resizable=no, location=no, width=100, height=100, menubar=no, status=no, scrollbars=no, menubar=no");
      } else if (sendMethod === 3) {
		    winz = doPost(ps+"/api/addPackage",
          {name: JSON.stringify(pn), links: JSON.stringify(list_PyLoad), u: username, p: password});
      }
      setTimeout(function () {
        winz.close();
      }, 1000);
        bookmarkletWin.close();
    }

    function toClipboard() {
      let list_PyLoad = bookmarkletWin.document.getElementById("checkurl").checked ? [url] : [];
      for (let n = 0; n < list_Checked.length; n++) {
          if (list_Checked[n]) {
              list_PyLoad.push(list_Links[n].href);
          }
      }
      let t = document.createElement('textarea');
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
        let successful = bookmarkletWin.document.execCommand('copy');
        bookmarkletWin.alert('Copy ' + (successful ? 'successful' : 'unsuccessful'));
      } catch (err) {
        bookmarkletWin.alert('Oops, unable to copy' + err);
      }
      bookmarkletWin.document.body.removeChild(t);
    }

    function doPost(url, postParameters) {
      let winz, i;
      let formElement = document.createElement("form");
      formElement.style.display = "none";
      formElement.target = "_Pyload";
      formElement.method = "POST";
      formElement.action = url;
      for (let n in postParameters) {
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
    bookmarkletWin = window.open("", "_blank", "width="+screen.availWidth+",height="+screen.availHeight+",scrollbars,resizable,menubar");
    bookmarkletWin.moveTo(0, 0);
    list_Links = extractSelectionLinks();
    if (!list_Links.length) list_Links=extractPageLinks();
    list_Checked = Array.apply(null, Array(list_Links.length)).map(Boolean.prototype.valueOf, false);
    numChecked = 0;
    list_Domains = getPageDomains();
    url = parentWin.document.URL;
    bookmarklet();

})("http://localhost:9666", "username", "password", 1);