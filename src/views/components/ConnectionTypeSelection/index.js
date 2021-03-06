import React, {useEffect, useState} from 'react';
import {Button, Pane, Card, Dialog, Heading, Text, InfoSignIcon, TickCircleIcon} from 'evergreen-ui';
import Logo from '../../../logo.png';
import BluetoothSetting from '../../../bluetooth_setting.png';

const ipcRenderer = window.require("electron").ipcRenderer;

const ConnectionTypeSelection = ({}) => {
    const [showLiveChessWarning, setLiveChessWarning] = useState(false);
    const [showEmbeddedWarning, setEmbeddedWarning] = useState(false);

    useEffect(() => {
        ipcRenderer.on('battery', (event, arg) => {
            const data = JSON.parse(arg);
            // setBattery(data.status);
        });
    }, []);

    return (
        <Card
            height={'100vh'}
            width={"100vw"}
            elevation={3}
            background="tealTint"
            display="flex"
            alignItems="flex-start"
            justifyContent="center"
            padding={40}
            flexDirection="column"
            border="default">
            <img src={Logo} width={'80%'} height={'auto'} style={{marginLeft: -16}}/>
            <Heading size={700}>Select eboard connection engine:</Heading>
            <br/>
            <Text color="muted" size={400}>Our embedded implementation is recommended but may be incompatible with some
                eboard
                models.</Text>
            <br/>
            <br/>
            <Button height={40} appearance="primary" intent="success"
                    onClick={() => setEmbeddedWarning(true)}>Embedded Engine (Recommended)</Button>
            <Button height={40} appearance="minimal" marginTop={16}
                    onClick={() => setLiveChessWarning(true)}>
                Use traditional DGT LiveChess 2.0
            </Button>
            <br/>
            <Text color="muted" size={300}>(Beta 1.0.0) Created with ♥️ by Amit Assaraf</Text>

            <Dialog
                isShown={showLiveChessWarning}
                title="DGT LiveChess 2.0"
                onConfirm={() => ipcRenderer.send('conType', 'livechess')}
                onCloseComplete={() => setLiveChessWarning(false)}
                confirmLabel="All Good To Go"
            >
                <InfoSignIcon color="info" marginRight={6}/>
                <Text size={400}>
                    Before you continue, stop now and launch DGT LiveChess 2.0 in order for the connection to work. Make
                    sure your board is connected and recognized on DGT LiveChess 2.0 before continuing.
                </Text>
                <br/>
                <br/>
                <Text color="muted" size={300}>(Note: This option is not recommended for use on MacOS)</Text>
            </Dialog>

            <Dialog
                isShown={showEmbeddedWarning}
                title="Embedded DGT Driver"
                onConfirm={() => ipcRenderer.send('conType', 'embedded')}
                onCloseComplete={() => setEmbeddedWarning(false)}
                confirmLabel="All Good To Go"
            >
                <TickCircleIcon color="success" marginRight={6}/>
                <Text size={400}>
                    Before you continue, in order for the embedded connection to work, you must connect your
                    DGT eboard either through USB or through your computer's Bluetooth settings.
                </Text>
                <Pane
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column">
                    <br/>
                    <img src={BluetoothSetting} width={'65%'} height={'auto'}/>
                    <br/>
                </Pane>
            </Dialog>
        </Card>
    );
}

export default ConnectionTypeSelection;
