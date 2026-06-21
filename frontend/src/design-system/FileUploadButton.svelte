<script lang="ts">
    import type { Snippet } from "svelte";
    import { UploadSimple } from "phosphor-svelte";
    import {
        fileUploadButton,
        fileUploadContent,
        fileUploadIcon,
        hiddenFileInput,
    } from "./design-system.css";

    let {
        accept = "image/*",
        ariaLabel,
        classname = "",
        onfiles,
        children,
    }: {
        accept?: string;
        ariaLabel: string;
        classname?: string;
        onfiles: (files: FileList | null) => void;
        children: Snippet;
    } = $props();

    let input = $state<HTMLInputElement>();

    function handleChange(e: Event & { currentTarget: HTMLInputElement }) {
        onfiles(e.currentTarget.files);
        e.currentTarget.value = "";
    }
</script>

<input
    bind:this={input}
    class={hiddenFileInput}
    type="file"
    {accept}
    aria-label={ariaLabel}
    onchange={handleChange}
/>
<button
    class="{fileUploadButton} {classname}"
    type="button"
    aria-label={ariaLabel}
    onclick={() => input?.click()}
>
    <span class={fileUploadContent}>
        {@render children()}
    </span>
    <span class={fileUploadIcon} aria-hidden="true">
        <UploadSimple size={18} weight="bold" />
    </span>
</button>
