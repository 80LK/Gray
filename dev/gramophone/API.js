var GramophoneDisksPrivate = {
    disks:{},
};

var GramophoneDisks = {
    registerDisk:function(id, file){
        if(GramophoneDisksPrivate.hasOwnProperty(id))
            throw new Error("Disk with id "+id+" was been registered");
            
        GramophoneDisksPrivate[id] = file;
    },
    isDisk:function(id){
        return GramophoneDisksPrivate.hasOwnProperty(id);
    },
    getSource:function(id){
        return GramophoneDisksPrivate[id];
    }
};

ModAPI.registerAPI("RetroWaveGramophone", GramophoneDisks);