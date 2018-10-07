pyLoad Bookmarklet
------------------
*pyLoad Bookmarklet* is a bookmarklet to send download links to pyLoad.

### Highlights:
- Translated to English.
- UI redesign.
- Added Package Name field.
- Get package name from window title.
- Dynamic filter for the URL list.
- Check URLs by domain name.
- Copy checked URLs to clipboard.
- Shorter Timeout to close dialog.

Installation:
---------------------
1. Download [pyload_bookmarklet.min.js](https://raw.githubusercontent.com/pyload/pyload-bookmarklet/master/pyload_bookmarklet.min.js) and save it to your local disk.
2. Open *pyload_bookmarklet.min.js* with your favorite text editor and:
   - go to the end of the file - first parameter is the *pyLoad host*, the second is the *username*, the third is the *password* and the last is *submit method* (see notes below).
   - specify the pyLoad host (for method 1 this is typically should be `http://localhost:9666`, for methods 2&3 `http://localhost:8000`) and submit method.
3. select and copy all the text
4. On your Browser, create a new bookmark and name it "Send To pyLoad"
5. For Firefox:
   - Location: Paste the javascript code you have copied before.
   
   For Google Chrome:
   - URL: Paste the javascript code you have copied before.
6. Click Ok to save the bookmark.

Usage:
---------------------
1. Navigate to the page where the download link is located.
2. Click the Bookmarklet button you have created.
3. Write your package name.
4. Check the link(s) to send to pyLoad for downloading and/or select a domain(s) from the list.
5. Press the "Send to pyLoad" button.

Credits
-------
See [CREDITS.md](https://github.com/pyload/pyload-bookmarklet/blob/master/CREDITS.md) file.

Notes:
------
- This bookmarklet has two methods to submit links to pyLoad, you have to choose one.
- Both methods have pros and cons:
  - Method 1 - links are sent via http://<pyload_host>/flash/add
    - pros:
      1. This method does not require you to be logged in to the pyLoad web interface.
      2. No user and password is sent over the network.
    - cons:
      1. The links are sent to the *collector*, not to the *queue*.
  - Method 2 - links are sent via http://<pyload_host>/api/addPackage
    - pros:
      1. The downloads starts immediately.
    - cons:
      1. You must be logged in to the pyLoad web interface for this method to work.
  - Method 3 - links are sent via http://<pyload_host>/api/addPackage using username& password
    - pros:
      1. The downloads starts immediately.
      1. You don't have to be logged in to the pyLoad web interface for this method to work..
    - cons:
      1. Usename & password is sent with the request so you'd better use this method over a secured connection (HTTPS).
      2. This method requires you to have [api_app.py@576baf2](https://github.com/pyload/pyload/commit/576baf2d66b9dd1b228f121df44ff01b45d732f4) commit applied to *api_app.py*
- If the page where the download is located uses HTTPS and pyLoad uses HTTP, you will get a security warning and you have to confirm the send.<br/>
Nowadays that most web pages uses HTTPS, it is recommended to configure pyLoad to also use HTTPS - You will avoid this security warning and also if you use submit method 3, the user and password are sent over a secured channel. 
