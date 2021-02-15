const WS = require('ws')

function websocket() {
    methods = {}
    wss = new WS.Server({ clientTracking: true, noServer: true })

    wss.on('connection', (ws, ctx) => {
        ws.counter = 0
        ws.registered = false

        ws.on('open', () => {
            console.log('onOpen', ws.session)
        })

        ws.on('close', () => {
            console.log('onClose', ws.session)
        })

        ws.on('message', (message) => {
            try {
                message = JSON.parse(message)

                if (ws.counter > 0 && ws.registered == false) {
                    ws.send(JSON.stringify({status: 'error', message: 'not registered'}))
                    ws.close(4004, 'not registered')
                }

                if (ctx.session.client.token != message.token) {
                    ws.send(JSON.stringify({status: 'error', message: 'wrong token'}))
                    ws.close(4005, 'wrong token')
                }

                let fn = methods[message.method]

                if (fn != undefined)
                    fn(ws, ctx, message)

            } catch (error) {
                console.log(error)
                ws.send(JSON.stringify({status: 'error', message: error.message}))
            }
        })
    })
}

websocket.prototype.on = function (method, fn) {
    methods[method] = (ws, ctx, message) => fn(ws, ctx, message)
}

websocket.prototype.handleUpgrade = function (ctx) {
    wss.handleUpgrade(ctx.req, ctx.request.socket, Buffer.alloc(0), (ws) => {
        wss.emit('connection', ws, ctx)
        ctx.respond = false
    })
}

module.exports = websocket
