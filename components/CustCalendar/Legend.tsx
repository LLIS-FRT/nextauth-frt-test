import { EventBgColor } from './types'
import LegendElement from './LegendElement'

const Legend = () => {
    return (
        <div className="flex flex-wrap gap-4 p-4">
            {Object.keys(EventBgColor).map((colorName) => (
                <LegendElement key={colorName} colorName={colorName} />
            ))}
        </div>
    )
}

export default Legend