import React, {useEffect, useState} from 'react';
import {Badge, Card, Text} from 'evergreen-ui';
import {BOARD_STATUS, WHITE} from "../../../constants";

const ipcRenderer = window.require("electron").ipcRenderer;

const BOARD_STATUS_TO_COLOR = {
    [BOARD_STATUS.CONNECTED]: 'green',
    [BOARD_STATUS.CONNECTING]: 'blue',
    [BOARD_STATUS.DISCONNECTED]: 'neutral',
}

const BoardStatusCard = ({}) => {
    const [battery, setBattery] = useState(undefined);
    const [boardStatus, setConnectionStatus] = useState(BOARD_STATUS.DISCONNECTED);
    const [inSync, setInSync] = useState(false);

    useEffect(() => {
        ipcRenderer.on('battery', (event, arg) => {
            const data = JSON.parse(arg);
            setBattery(data.status);
        });
        ipcRenderer.on('sync', (event, arg) => {
            const data = JSON.parse(arg);
            setInSync(data.sync);
        });
        ipcRenderer.on('connection', (event, arg) => {
            const data = JSON.parse(arg);
            setConnectionStatus(data.status);
        })
    }, [setBattery]);

    return (
        <Card
            height={75}
            width={"100%"}
            background="blueTint"
            display="flex"
            alignItems="flex-start"
            justifyContent="center"
            padding={10}
            flexDirection="column"
            border="default">
            <div style={{flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
                <Text color="muted">Board Status:&nbsp;</Text>
                <Badge color={BOARD_STATUS_TO_COLOR[boardStatus]}>{boardStatus}</Badge>
            </div>
            <div style={{flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
                <Text color="muted">Sync:&nbsp;</Text>
                <Badge color="neutral" isSolid={!inSync}>{inSync ? 'Board Synced.' : 'Out of sync.'}</Badge>
            </div>
            <div style={{flexDirection: 'row', display: 'flex', alignItems: 'center'}}>
                <Text color="muted">Battery:&nbsp; {battery}</Text>
            </div>
        </Card>
    );
}

export default BoardStatusCard;
