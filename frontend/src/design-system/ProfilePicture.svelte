<script lang="ts">
    import {
        profilePicture,
        profilePictureImage,
        profilePictureSizeVariants,
    } from "./design-system.css";

    let {
        name,
        imageUrl = "",
        size = "md",
        classname = "",
    }: {
        name: string;
        imageUrl?: string;
        size?: "xs" | "sm" | "md" | "lg";
        classname?: string;
    } = $props();

    const initials = $derived(
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "?",
    );
</script>

<span class="{profilePicture} {profilePictureSizeVariants[size]} {classname}" aria-hidden="true">
    {#if imageUrl}
        <img class={profilePictureImage} src={imageUrl} alt="" />
    {:else}
        {initials}
    {/if}
</span>
