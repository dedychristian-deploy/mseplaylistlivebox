let ws: WebSocket;

ws = new WebSocket("ws://127.0.0.1:6900");

ws.onopen = () => {
    console.log("Viz Engine connected");
};

ws.onmessage = (event) => {
    console.log("Viz response:", event.data);
};

ws.onerror = (error) => {
    console.log("WebSocket error:", error);
};

ws.onclose = (event) => {
    console.log("Viz Engine disconnected");
    console.log("Code:", event.code);
    console.log("Reason:", event.reason);
};


function sendVizCommand() {

    const command = "MAIN_SCENE*STAGE*DIRECTOR*Default START";

    if (ws.readyState === WebSocket.OPEN) {
        console.log("Sending:", command);
        ws.send(command);
    } else {
        console.log("WebSocket not connected");
    }
}


function setBoxIndex() {

    if (ws.readyState !== WebSocket.OPEN) {
        console.log("WebSocket not connected");
        return;
    }

    const data = {
        "boxType": 4,
        "boxTypeName": "LIVEBOX4",
        "boxOrder": [
            {
                "box": "BOX_01",
                "input": 0
            },
            {
                "box": "BOX_02",
                "input": 2
            },
            {
                "box": "BOX_03",
                "input": 3
            }
        ]
    };

ws.send(
    `MAIN_SCENE*TREE*$SCRIPT*SCRIPT INVOKE reset_active ${data.boxType}`
);

data.boxOrder.forEach((item: any) => {
    ws.send(
        `MAIN_SCENE*TREE*$SCRIPT*SCRIPT INVOKE set_index ${data.boxType} ${item.box} ${item.input}`
    );
});
}


vizrt.onClick = (name: string) => {

    if (name === "updatebutton") {
        setBoxIndex();
    }

};
