<script lang="ts">
    import { switchButton, switchThumb } from "./design-system.css";
    let { checked = false, label = "Toggle", onchange }: {
        checked?: boolean;
        label?: string;
        onchange?: (checked: boolean) => void;
    } = $props();
</script>

<button
    class={switchButton}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onclick={() => onchange?.(!checked)}
>
    <span class={switchThumb}></span>
</button>
