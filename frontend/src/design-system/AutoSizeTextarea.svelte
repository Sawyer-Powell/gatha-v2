<script module lang="ts">
    export interface AutoSizeTextareaProps {
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
    }: AutoSizeTextareaProps = $props();

    let textareaEl = $state<HTMLTextAreaElement>();
    let mirrorEl = $state<HTMLDivElement>();
    let width = $state<number | null>(null);
    let height = $state<number | null>(null);
    let measureFrame = 0;

    const mirrorText = $derived(`${value || placeholder || " "}\u00a0`);
    const mirrorStyle = "position: fixed; left: -10000px; top: 0; width: max-content; min-width: 0; max-width: none; height: auto; max-height: none; visibility: hidden; white-space: pre-wrap; overflow: visible; pointer-events: none; z-index: -1;";
    const sizingStyle = $derived(
        [
            width ? `width: ${width}px` : null,
            height ? `height: ${height}px` : null,
        ]
            .filter(Boolean)
            .join("; "),
    );

    function readNaturalWidth() {
        if (!mirrorEl) return 0;
        mirrorEl.style.width = "max-content";
        mirrorEl.style.whiteSpace = "pre-wrap";
        return mirrorEl.offsetWidth;
    }

    function readWrappedHeight(targetWidth: number) {
        if (!mirrorEl) return 0;
        mirrorEl.style.width = `${targetWidth}px`;
        mirrorEl.style.whiteSpace = "pre-wrap";
        return mirrorEl.offsetHeight;
    }

    function updateSize() {
        if (!textareaEl || !mirrorEl) return;

        const availableWidth =
            textareaEl.parentElement?.getBoundingClientRect().width ||
            textareaEl.getBoundingClientRect().width ||
            Number.POSITIVE_INFINITY;
        const naturalWidth = readNaturalWidth();
        const nextWidth = Math.ceil(Math.min(naturalWidth + 2, availableWidth));
        const nextHeight = Math.ceil(readWrappedHeight(nextWidth));

        if (nextWidth > 0) width = nextWidth;
        if (nextHeight > 0) height = nextHeight;
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
        value = raw;
        oninput?.(raw);
        scheduleSizeUpdate();
    }

    $effect(() => {
        mirrorText;
        classname;
        scheduleSizeUpdate();
        return cancelSizeUpdate;
    });
</script>

<svelte:window onresize={scheduleSizeUpdate} />

<div
    bind:this={mirrorEl}
    class={classname}
    aria-hidden="true"
    style={mirrorStyle}
>{mirrorText}</div>

<textarea
    bind:this={textareaEl}
    class={classname}
    {value}
    aria-label={ariaLabel}
    {placeholder}
    rows="1"
    style={sizingStyle || undefined}
    oninput={(e) => commitInput(e.currentTarget.value)}
    onkeydown={(e) => onkeydown?.(e)}
></textarea>
