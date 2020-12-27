import React, {useEffect, useState} from 'react';
import {Spinner} from 'evergreen-ui';
import {useWindowDimensions} from "../../utils";
import BoardStatusCard from "../BoardStatusCard";
import ConnectionTypeSelection from "../ConnectionTypeSelection";

const ipcRenderer = window.require("electron").ipcRenderer;

const WIDGET_NAME_TO_COMPONENT = {
    'status_card': BoardStatusCard,
    'select_connection': ConnectionTypeSelection
}

const Main = ({}) => {
    const { height, width } = useWindowDimensions();
    const [component, setComponent] = useState(undefined);

    useEffect(() => {
        ipcRenderer.on('component', (event, arg) => {
            const data = JSON.parse(arg);
            setComponent(data.name);
        });
    }, [setComponent]);

    if (component) {
        const DynamicComponent = WIDGET_NAME_TO_COMPONENT[component];
        return <DynamicComponent/>;
    }

    return (
        <div style={{
            width: width,
            height: height,
            backgroundColor: '#0f1a30',
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            borderRadius: 8
        }}>
            <Spinner marginX="auto"/>
        </div>
    );
}

export default Main;
