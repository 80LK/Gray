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
(new File(file)).delete();