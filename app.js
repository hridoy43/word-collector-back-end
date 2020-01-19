var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

//evensource function to start
function sseEventStart(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
    })
    countdown(res)
}
// Code for event bufferStreme
app.get('/countdown', sseEventStart);


function countdown(res) {
    // res.write("data: " + count + "\n\n")
    // if (count)
    //     setTimeout(() => countdown(res, count - 1), 1000)
    // else
    //     res.end()

    var fileStream = fs.createReadStream('temp.txt');
    var data = "";
    fileStream.on('readable', function () {
        //this functions reads chunks of data and emits newLine event when \n is found
        data += fileStream.read();
        //console.log(data);

        res.write('retry: 3000\n');

        while (data.indexOf('\n') >= 0) {
            //fileStream.emit('newLine', data.substring(0, data.indexOf('\n')));
            //res.write('newLine', data.substring(0, data.indexOf('\n')))
            res.write("data: " + data + "\n\n");
            data = data.substring(data.indexOf('\n') + 1);
        }
    });

    fileStream.on('end', function () {
        //this functions sends to newLine event the last chunk of data and tells it
        //that the file has ended
        //fileStream.emit('newLine', data, true);
        res.end();
    });
}

//app.listen(3000, () => console.log('SSE app listening on port 3000!'))



//Whenever someone connects this gets executed
io.on('connection', function (socket) {
    console.log('A user connected');

    //Send a message after a timeout of 4seconds
    // setTimeout(function () {
    //     socket.send('Sent a message 4seconds after connection!');
    // }, 4000);

    socket.on('dicData', function (data) {
        //Send message to everyone
        console.log(data);
        fs.appendFile("temp.txt", data.toString() + "\n", 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
        //io.sockets.emit('newmsg', data);
    })

    socket.on('save', function (data) {
        //Send message to everyone
        console.log('Clicked on Yes!', data);
        fs.appendFile("dicData.txt", data + "\n", 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved in DicData!");

            //also removing from temp
            let txt = data + "\n"
            fs.readFile('temp.txt', 'utf8', function (err, txtStream) {
                if (err) {
                    return console.log(err);
                }

                var regx = new RegExp(`${txt}`, 'gi');
                var result = txtStream.replace(regx, '');

                fs.writeFile('temp.txt', result, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            });
        });
        //io.sockets.emit('newmsg', data);
    });

    socket.on('remove', function (data) {
        //Send message to everyone
        console.log('Clicked on No!', data);

        let txt = data + "\n"
        fs.readFile('temp.txt', 'utf8', function (err, txtStream) {
            if (err) {
                return console.log(err);
            }

            var regx = new RegExp(`${txt}`, 'gi');
            var result = txtStream.replace(regx, '');

            fs.writeFile('temp.txt', result, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        });
        //io.sockets.emit('newmsg', data);
    })

    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});