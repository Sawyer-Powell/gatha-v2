<script module lang="ts">
    export interface AutoSizeInputProps {
        value?: string;
        classname?: string;
        ariaLabel: string;
        placeholder?: string;
        oninput?: (value: string) => void;
        onkeydown?: (event: KeyboardEvent) => void;
    }
</script>

<script lang="ts">
    let {
        value = $bindable(""),
        classname = "",
        ariaLabel,
        placeholder,
        oninput,
        onkeydown,
    }: AutoSizeInputProps = $props();

    let mirrorEl = $state<HTMLSpanElement>();
    let width = $state<number | null>(null);
    let measureFrame = 0;
    const mirrorText = $derived(`${value || placeholder || " "}\u00a0`);
    const mirrorStyle = "position: fixed; left: -10000px; top: 0; width: auto; min-width: 0; max-width: none; height: auto; max-height: none; visibility: hidden; white-space: pre; overflow: visible; pointer-events: none;";

    function updateSize() {
        if (!mirrorEl) return;
        const nextWidth = Math.ceil(mirrorEl.offsetWidth + 2);
        if (nextWidth > 0) width = nextWidth;
    }

    function scheduleSizeUpdate() {
        if (measureFrame) cancelAnimationFrame(measureFrame);
        measureFrame = requestAnimationFrame(() => {
            measureFrame = 0;
            updateSize();
        });
    }

    function cancelSizeUpdate() {
        if (!measureFrame) return;
        cancelAnimationFrame(measureFrame);
        measureFrame = 0;
    }

    function commitInput(raw: string) {
        const next = raw.replace(/\s*\n\s*/g, " ");
        value = next;
        oninput?.(next);
        scheduleSizeUpdate();
    }

    $effect(() => {
        mirrorText;
        classname;
        scheduleSizeUpdate();
        return cancelSizeUpdate;
    });
</script>

<span
    bind:this={mirrorEl}
    class={classname}
    aria-hidden="true"
    style={mirrorStyle}
>{mirrorText}</span>

<input
    class={classname}
    type="text"
    {value}
    aria-label={ariaLabel}
    {placeholder}
    style={width ? `width: ${width}px` : undefined}
    oninput={(e) => commitInput(e.currentTarget.value)}
    onkeydown={(e) => onkeydown?.(e)}
/>
