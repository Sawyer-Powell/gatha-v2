<script lang="ts">
    import AutoSizeInput from "./AutoSizeInput.svelte";

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

<AutoSizeInput
    bind:value
    {classname}
    {ariaLabel}
    {placeholder}
    oninput={commitInput}
    onkeydown={(e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            (e.currentTarget as HTMLElement).blur();
        }
    }}
/>
