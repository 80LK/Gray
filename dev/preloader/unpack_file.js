var soundsPath = __dir__ + "sounds";
var checkInstalledFile = new File(soundsPath + "/.installed");
var version = 0;
if(checkInstalledFile.exists())
    version = parseInt(readFile(checkInstalledFile)) || 1;

var newVersion = (function(){
    var response = JSON.parse(RequestAPI.send({
        url:"https://cloud-api.yandex.net/v1/disk/resources/download?path=" + YandexPathInstalled,
        headers:{
            "Authorization": "OAuth " + YandexToken
        }
    }));
    response = JSON.parse(RequestAPI.send({
        url:response.href,
        headers:{
            "Authorization": "OAuth " + YandexToken
        }
    }));
    return parseInt(response) || 0;
})();

if(version < newVersion){
    var sounds = new File(soundsPath);
    
    if(sounds.exists()){
        let files = sounds.listFiles();
        for(let i = files.length() - 1; i >= 0; i--)
            files[i].delete();
    }else{
        sounds.mkdirs();
    }

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

    unzip(file, soundsPath);
    (new File(file)).delete();
}