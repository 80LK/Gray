const Utils = {
    random:function(min, max){
        if(min === undefined) min=0;
        if(max === undefined) max=min+10;

        return Math.floor((max-min) * Math.random() + min);
    },
    extends: function(Child, Parent){
        var F = function(){};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        
        //Child.prototype.superclass =
        Child.superclass = Parent.prototype;
    }
}