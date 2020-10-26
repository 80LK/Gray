var URL = java.net.URL,
    HttpURLConnection = java.net.HttpURLConnection,
    JavaArray = java.lang.reflect.Array,
    BufferedInputStream = java.io.BufferedInputStream,
    FileOutputStream = java.io.FileOutputStream;
    
    FileReader = java.io.FileReader,
    BufferedReader = java.io.BufferedReader,
    StringBuilder = java.lang.StringBuilder,

    FileInputStream = java.io.FileInputStream,
    ZipInputStream = java.util.zip.ZipInputStream,
    File = java.io.File;

function unzip(path, path_in){
    try
    {
        var fin = new FileInputStream(path);
        var zin = new ZipInputStream(fin);
        var ze = null;
        while ((ze = zin.getNextEntry()) != null) {

            if(ze.isDirectory()) {
                var f = new File(path_in + "/" + ze.getName());
                if(!f.isDirectory())
                    f.mkdirs();

            } else {
                var fout = new FileOutputStream(path_in + "/" + ze.getName());     

                var buffer = JavaArray.newInstance(java.lang.Byte.TYPE, 8192);
                var len;
                while ((len = zin.read(buffer)) != -1)
                    fout.write(buffer, 0, len);

                fout.close();

                zin.closeEntry();
            }
        }
        zin.close();
    } catch(e) {
        alert(e);
    }
}

function readFile(file){
    var readed = (new BufferedReader(new FileReader(file)));
    var data = new StringBuilder();
    //var data;
    var string;
    while ((string = readed.readLine()) != null) {
        data.append(string);
        data.append('\n');
    }
    return data.toString();
}