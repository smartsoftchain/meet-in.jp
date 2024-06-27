
These are optional modules for the webphone
Just copy the files in this directory near the webphone.jar (so extract the files from this mediaench directory and copy them near the webphone.jar)




Details:

The webphone will work fine also without these files, but having them near your webphone.jar file might increase the voice quality
These files are needed if you wish to enable one of the following parameters: opus codec, aec (echo cancellation), agc (automatic gain control), denoise, silencesupress.
The files should be stored near the webphone.jar file on your web server and you might have to enable the dll and dylib mime type on your web server (or set the “mediaenchext” applet parameter to “jar” and rename dll with jar in file name extensions). If the files cannot be found or loaded than the webphone will just not use these features but will remain fully functional. You should test the dll and dylib availability by directly accessing from the browser with the exact url (For example: www.mydomain.com/webphone/mediaench.dll). The browser should be able to download the dll or the jar. 
The webphone will download one of these libraries and only at the first usage. Subsequent usage will be served from the browser local cache.
