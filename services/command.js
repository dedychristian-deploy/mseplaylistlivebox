const net = require("net");

function sendVizCommand(host, port, command) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setNoDelay(true);

    let buffer = "";
    let done = false;

    const finish = (err, data) => {
      if (done) return;
      done = true;
      socket.destroy();
      err ? reject(err) : resolve(data);
    };

    const timer = setTimeout(() => {
      finish(null, buffer.trim());
    }, 1500);

    socket.connect(Number(port), host, () => {
      socket.write(Buffer.concat([
        Buffer.from(command, "utf8"),
        Buffer.from([0])
      ]));
    });

    socket.on("data", d => {
      buffer += d.toString("utf8");
      if (buffer.includes("\x00")) {
        clearTimeout(timer);
        finish(null, buffer.replace(/\x00/g, "").trim());
      }
    });

    socket.on("error", err => {
      clearTimeout(timer);
      finish(err);
    });

    socket.on("close", () => {
      clearTimeout(timer);
      if (!done && buffer.length) {
        finish(null, buffer.trim());
      }
    });
  });
}

module.exports = { sendVizCommand };