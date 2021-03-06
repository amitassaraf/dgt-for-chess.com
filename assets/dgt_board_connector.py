import asyncdgt
import asyncio
import sys
import json
import websockets

clients = []

loop = asyncio.get_event_loop()
dgt = asyncdgt.auto_connect(loop, ["/dev/tty.DGT*"])


@dgt.on("connected")
def on_connected(port):
    print(json.dumps({
        "type": "connection",
        "status": "connected",
        "port": port
    }))
    sys.stdout.flush()

@dgt.on("disconnected")
def on_disconnected():
    print(json.dumps({
        "type": "connection",
        "status": "disconnected",
    }))
    sys.stdout.flush()

@dgt.on("board")
def on_board(board):
    print(json.dumps({
        "type": "board",
        "fen": board.board_fen()[::-1]
    }))
    sys.stdout.flush()

@dgt.on("clock")
def on_clock(clock):
    print(json.dumps({
        "type": "clock",
        "left_time": clock.left_time,
        "right_time": clock.right_time,
        "left_up": clock.left_up
    }))
    sys.stdout.flush()


async def simple(websocket, path):
    async for message in websocket:
        if message == 'get_board':
            board = await dgt.get_board()
            print(json.dumps({
                    "type": "board",
                    "fen": board.board_fen()[::-1]
                }))
            sys.stdout.flush()
        elif message == 'get_battery':
            status = await dgt.get_battery_status()
            print(json.dumps({
                  "type": "battery",
                  "status": status
              }))
            sys.stdout.flush()


loop.run_until_complete(websockets.serve(simple, '127.0.0.1', 9991))

try:
    loop.run_forever()
except KeyboardInterrupt:
    pass
finally:
    dgt.close()
    loop.close()