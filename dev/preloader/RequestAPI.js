var RequestAPI = {
    __parseBufferInString:function(input){
        let contents = JavaArray.newInstance(java.lang.Byte.TYPE, 1024);

        let bytesRead = 0;
        let strFileContents = ""; 
        while((bytesRead = input.read(contents)) != -1) { 
            strFileContents += new java.lang.String(contents, 0, bytesRead);              
        }
        return strFileContents;
    },
    getConnection:function(settings){
        if(settings == undefined)
        throw new TypeError("settings in RequestAPI.send was been string or object");

        if(typeof settings == "string" || settings instanceof String){
            let url = settings;
            settings = {};
            settings.url = url;
        }

        if(!(typeof settings.url == "string" || settings.url instanceof String))
            throw new TypeError("settings.url in RequestAPI.send was been string");

        if(settings.headers && typeof settings.headers != "object")
            throw new TypeError("settings.headers in RequestAPI.send was been object{string:string}");
            url = new URL(settings.url);
        let urlConnection =  url.openConnection();
        for(let header in settings.headers){
            let value = settings.headers[header];
            if(!(typeof header == "string" || header instanceof String) || !(typeof value == "string" || value instanceof String))
                throw new TypeError("settings.headers in RequestAPI.send was been object{string:string}. ["+header+"] = " + value);
                
            urlConnection.setRequestProperty(header, value);
        }
        return urlConnection;
    },
    downloadFile:function(url, path){
        var uconn = RequestAPI.getConnection(url);
        // uconn.setReadTimeout(TIMEOUT_CONNECTION);
        // uconn.setConnectTimeout(TIMEOUT_SOCKET);

        var is = uconn.getInputStream();
        var bufferinstream = new BufferedInputStream(is);

        var fos = new FileOutputStream(path);

        let contents = JavaArray.newInstance(java.lang.Byte.TYPE, 1024);
        let bytesRead = 0;
        while((bytesRead = bufferinstream.read(contents)) != -1)
            fos.write(contents, 0, bytesRead);

        fos.flush();
        fos.close();
    },
    send:function(settings){
        let input, urlConnection = RequestAPI.getConnection(settings);
        try {
          input = new BufferedInputStream(urlConnection.getInputStream());
        } catch(e){
            urlConnection.disconnect();
            return "";
        } finally {
          urlConnection.disconnect();
        }
        return RequestAPI.__parseBufferInString(input);
    }
};