<script lang="ts">
    import {
        sliderTrack,
        sliderTrackDirection,
        sliderRail,
        sliderRailDirection,
        sliderFill,
        sliderFillDirection,
        sliderThumb,
        sliderThumbDirection,
    } from "./design-system.css";

    let {
        value = 0.5,
        direction = "horizontal",
        onchange,
    }: {
        value?: number;
        direction?: "horizontal" | "vertical";
        onchange?: (value: number) => void;
    } = $props();

    let railEl: HTMLDivElement;
    let dragging = $state(false);

    function clamp(v: number) {
        return Math.min(1, Math.max(0, v));
    }

    function valueFromEvent(e: MouseEvent | TouchEvent) {
        const rect = railEl.getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

        if (direction === "horizontal") {
            return clamp((clientX - rect.left) / rect.width);
        } else {
            return clamp(1 - (clientY - rect.top) / rect.height);
        }
    }

    function handleStart(e: MouseEvent | TouchEvent) {
        dragging = true;
        onchange?.(valueFromEvent(e));
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleEnd);
        window.addEventListener("touchmove", handleMove);
        window.addEventListener("touchend", handleEnd);
    }

    function handleMove(e: MouseEvent | TouchEvent) {
        if (!dragging) return;
        onchange?.(valueFromEvent(e));
    }

    function handleEnd() {
        dragging = false;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleEnd);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleEnd);
    }

    const fillStyle = $derived(
        direction === "horizontal"
            ? `width: ${value * 100}%`
            : `height: ${value * 100}%`
    );

    const thumbStyle = $derived(
        direction === "horizontal"
            ? `left: ${value * 100}%`
            : `bottom: ${value * 100}%`
    );
</script>

<div
    class="{sliderTrack} {sliderTrackDirection[direction]}"
    onmousedown={handleStart}
    ontouchstart={handleStart}
    role="slider"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={1}
    tabindex="0"
>
    <div class="{sliderRail} {sliderRailDirection[direction]}" bind:this={railEl}>
        <div class="{sliderFill} {sliderFillDirection[direction]}" style={fillStyle}></div>
        <div class="{sliderThumb} {sliderThumbDirection[direction]}" style={thumbStyle}></div>
    </div>
</div>
