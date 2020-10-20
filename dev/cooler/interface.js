var CoolerInterface = (function(){
    let elements = {};
    for(let y = 0; y < 3; y++){
        for(let x = 0; x < 6; x++){
            elements["slot_"+x+"_"+y] = {
                type:"slot",
                x:400 + ( 75 * x),
                y:40 + ( 75 * y) + (y == 2 ? 30 : 0),
                size:75,
                bitmap:"cooler_slot"
            }
        }   
    }
    
    elements["image_1"] = {
        type:"image",
        bitmap:"ice_2",
        x:400,
        y:220,
        scale:7
    }

    elements["image_2"] = {
        type:"image",
        bitmap:"ice",
        x:400,
        y:295,
        scale:7
    }
    return new UI.StandartWindow({
        standart:{
            header: {
                text: {
                    text: "Refrigerator",
                },
                height: 80,
            },
            background: { color:android.graphics.Color.rgb(134, 217,220) },
            inventory: {
                width: 300,
                padding: 20
            },
        },
        elements:elements
    });
})()


Translation.addTranslation("Refrigerator", {
    "ru":"Холодильник"
});