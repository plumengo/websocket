const WS = require('ws')

function websocket() {
    methods = {}
    wss = new WS.Server({ clientTracking: true, noServer: true })

    wss.on('connection', (ws, cxt) => {

        ws.on('open', () => {
            console.log('onOpen'.blue.bold, ws.session)
        })

        ws.on('close', () => {
            console.log('onClose'.blue.bold, ws.session)
        })

        ws.on('message', (message) => {
            try {
                message = JSON.parse(message)

                let fn = methods[message.method]

                console.log('onMessage'.blue.bold, message.method)

                if (fn != undefined)
                    fn(ws, message)

            } catch (error) {
                throw (error)
            }
        })
    })
}

websocket.prototype.on = function (method, fn) {
    methods[method] = (ws, message) => fn(ws, message)
}

websocket.prototype.handleUpgrade = function (ctx) {
    wss.handleUpgrade(ctx.req, ctx.request.socket, Buffer.alloc(0), (ws) => {
        console.log('HANDLEUPGRADE', ctx.session)
        ws.session = { id: undefined }
        //ws.session
        wss.emit('connection', ws, ctx)
        ctx.respond = false
    })
}

module.exports = websocket