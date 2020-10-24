var __RadioAPI = {
    mod:"NoNameAddon",
    files:[],
    length:0,
    addFile:function(sid, path){
        this.files.push(Sound.registerNetworkFile("RetroWave_Radio_" + sid, path));
        this.length++;
    },
    init:function(){
        let path = __dir__ + "sounds/radio/";
        let files = FileTools.GetListOfFiles(path);
        for(let i in files)
        this.addFile(files[i].getName(), path + files[i].getName());
    },
    getFile:function(){
        let i;
        do{ i = Utils.random(0, this.length); }while(i == this.index);
        this.index = i;
        return this.files[this.index];
    }
};
var RadioAPI = {
    init:function(name_mod){
        __RadioAPI.mod = name_mod;
    },
    addFile:function(path){
        __RadioAPI.addFile(__RadioAPI.mod + "_" + (new java.io.File(path)).getName(), path);
    },
    addFiles:function(paths){
        paths.map(this.addFile);
    }
}
ModAPI.registerAPI("RetroWaveRadio", RadioAPI);
__RadioAPI.init();