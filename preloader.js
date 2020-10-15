/*
BUILD INFO:
  dir: dev/preloader
  target: preloader.js
  files: 3
*/



// file: header.js

var JavaArray = java.lang.reflect.Array,
    FileOutputStream = java.io.FileOutputStream,
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




// file: sec.js

const YandexToken = "AgAAAAAY3fJtAAamv-SVQKJzSEiyuNPCfm_V5rw",
      YandexPath = "RetroWaveDrive/RetroWave.zip";




// file: unpack_file.js

var response = RequestAPI.send({
    url:"https://cloud-api.yandex.net/v1/disk/resources/download?path=" + YandexPath,
    headers:{
        "Authorization": "OAuth " + YandexToken
    }
});
response = JSON.parse(response);
let file = __dir__ + ".tmp.zip";
RequestAPI.downloadFile({
    url:response.href,
    headers:{
        "Authorization": "OAuth " + YandexToken
    }
}, file);

unzip(file, __dir__ + "sounds")




