<script lang="ts">
    let {
        value = $bindable(""),
        classname = "",
        ariaLabel,
        placeholder,
        oninput,
    }: {
        value?: string;
        classname?: string;
        ariaLabel: string;
        placeholder?: string;
        oninput?: (value: string) => void;
    } = $props();

    function commitInput(raw: string) {
        const next = raw.replace(/\s*\n\s*/g, " ");
        value = next;
        oninput?.(next);
    }
</script>

<textarea
    class={classname}
    {value}
    aria-label={ariaLabel}
    {placeholder}
    rows="1"
    oninput={(e) => commitInput(e.currentTarget.value)}
    onkeydown={(e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
        }
    }}
></textarea>
