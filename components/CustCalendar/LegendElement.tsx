import { CSSProperties } from "react";
import { EventBgColor } from "./types";
import { eventStyle, getTexture } from "./utils";

const LegendElement = ({ colorName }: { colorName: string }) => {
    const color = EventBgColor[colorName as keyof typeof EventBgColor];
    const texture = getTexture(color);
    const style = eventStyle(color, texture);

    return (
        <div key={colorName} className="flex items-center gap-2">
            <div style={style as CSSProperties} className="w-5 h-5" />
            <span>{colorName}</span>
        </div>
    );
};

export default LegendElement;