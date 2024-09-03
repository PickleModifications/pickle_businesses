import { Group } from "@mantine/core";

export function Manage() {
    return (
        <Group gap={0} style={{alignItems: "unset", width: "100%", height: "calc(100% - 56px)", flexWrap: "nowrap"}}>
            <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
                <div style={{fontSize: "1.5rem", marginBottom: "1rem"}}>Manage</div>
                <div style={{fontSize: "1rem", marginBottom: "1rem"}}>Coming soon...</div>
            </div>
        </Group>
    );
}