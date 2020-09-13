const Utils = {
    random:function(min, max){
        if(min === undefined) min=0;
        if(max === undefined) max=min+10;

        return Math.floor((max-min) * Math.random() + min);
    }
}