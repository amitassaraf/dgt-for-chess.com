import React, {useEffect, useState} from 'react';
import {Button, Card, Dialog, Heading, Text} from 'evergreen-ui';

const ipcRenderer = window.require("electron").ipcRenderer;

const ConnectionTypeSelection = ({}) => {
    const [showLiveChessWarning, setLiveChessWarning] = useState(false);

    useEffect(() => {
        ipcRenderer.on('battery', (event, arg) => {
            const data = JSON.parse(arg);
            // setBattery(data.status);
        });
    }, []);

    return (
        <Card
            height={'100%'}
            width={"100%"}
            elevation={3}
            background="tealTint"
            display="flex"
            alignItems="flex-start"
            justifyContent="center"
            padding={40}
            flexDirection="column"
            border="default">
            <Heading size={900} marginTop="default">DGT for Chess.com</Heading>
            <Heading size={700} marginTop="default">Select board connection engine:</Heading>
            <br/>
            <Text color="muted" size={400}>Our embedded implementation is recommended but may be incompatible with some
                models.</Text>
            <br/>
            <br/>
            <Button height={40} appearance="primary" intent="success"
                    onClick={() => ipcRenderer.send('conType', 'embedded')}>Embedded Engine (Recommended)</Button>
            <Button height={40} appearance="minimal" marginTop={16}
                    onClick={() => setLiveChessWarning(true)}>
                Use traditional DGT LiveChess 2.0
            </Button>
            <br/>
            <Text color="muted" size={300}>(Mainly tested on DGT Bluetooth + USB eboard 3.1)</Text>
            <br/>
            <Text color="muted" size={300}>Created with ♥️ by Amit Assaraf</Text>

            <Dialog
                isShown={showLiveChessWarning}
                title="DGT LiveChess 2.0"
                onConfirm={() => ipcRenderer.send('conType', 'livechess')}
                onCloseComplete={() => setLiveChessWarning(false)}
                confirmLabel="All Good To Go"
            >
                Before you continue, stop now and launch DGT LiveChess 2.0 in order for the connection to work. Make
                sure your board is connected and recognized on DGT LiveChess before continuing.
            </Dialog>
        </Card>
    );
}

export default ConnectionTypeSelection;
