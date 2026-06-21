<script module lang="ts">
    export interface RangeDot {
        ratio: number;
        active?: boolean;
    }

    export interface RangeInputProps {
        value?: number;
        min?: number;
        max?: number;
        step?: number | string;
        ariaLabel: string;
        title?: string;
        disabled?: boolean;
        classname?: string;
        dots?: RangeDot[];
        oninput?: (value: number) => void;
        onkeydown?: (event: KeyboardEvent) => void;
    }
</script>

<script lang="ts">
    import { vars } from "../app.css";
    import { rangeThumbPixels, timelineScrubber } from "./design-system.css";

    let {
        value = 0,
        min = 0,
        max = 1,
        step = 0.01,
        ariaLabel,
        title = undefined,
        disabled = false,
        classname = "",
        dots = [],
        oninput,
        onkeydown,
    }: RangeInputProps = $props();

    const ratio = $derived(max > min ? (value - min) / (max - min) : 0);
    const clampedRatio = $derived(Math.min(1, Math.max(0, ratio)));
    const fillWidth = $derived(
        clampedRatio === 0
            ? "0px"
            : `calc(${clampedRatio * 100}% - ${clampedRatio * rangeThumbPixels}px)`,
    );

    const dotImages = $derived(
        dots
            .map(
                (dot) =>
                    `radial-gradient(circle, ${dot.active ? vars.colors.background : vars.colors.foreground} 0 1.5px, transparent 2px)`,
            )
            .join(", "),
    );
    const dotPositions = $derived(
        dots
            .map((dot) => {
                const dotRatio = Math.min(1, Math.max(0, dot.ratio));
                return `calc(${dotRatio * 100}% + ${rangeThumbPixels / 2 - dotRatio * rangeThumbPixels - 3}px) center`;
            })
            .join(", "),
    );
    const dotSizes = $derived(dots.map(() => "6px 6px").join(", "));
    const style = $derived(
        `--range-ratio: ${clampedRatio}; --range-fill-width: ${fillWidth}; --range-dot-images: ${dotImages || "none"}; --range-dot-positions: ${dotPositions || "0 0"}; --range-dot-sizes: ${dotSizes || "auto"}`,
    );
</script>

<input
    class="{timelineScrubber} {classname}"
    type="range"
    {min}
    {max}
    {step}
    {value}
    {style}
    aria-label={ariaLabel}
    {title}
    {disabled}
    oninput={(e) => oninput?.(e.currentTarget.valueAsNumber)}
    {onkeydown}
/>
