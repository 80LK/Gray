var CoolerInterface = (function(){
    let elements = {};
    for(let y = 0; y < 3; y++){
        for(let x = 0; x < 6; x++){
            elements["slot_"+x+"_"+y] = {
                type:"slot",
                x:400 + ( 75 * x),
                y:40 + ( 75 * y) + (y == 2 ? 30 : 0),
                size:75
            }
        }   
    }
    return new UI.StandartWindow({
        standart:{
            header: {
                text: {
                    text: "Холодос",
                },
                height: 80,
            },
            background: { standart:true },
            inventory: {
                width: 300,
                padding: 20
            },
        },
        elements:elements
    });
})()