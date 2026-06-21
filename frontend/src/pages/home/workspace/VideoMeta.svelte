<script lang="ts">
    import ProfilePicture from "$lib/design-system/ProfilePicture.svelte";
    import {
        estimatedCostLabel,
        friendlyDate,
        videoLengthLabel,
        type VideoItem,
    } from "../homeModel";
    import {
        video_meta,
        video_meta_fact,
        video_meta_profile,
        video_meta_value,
    } from "./workspace.css";

    let {
        video,
        duration,
        showCost = false,
        classname = "",
        profileName,
        profileImageUrl,
    }: {
        video: VideoItem;
        duration: number;
        showCost?: boolean;
        classname?: string;
        profileName: (email: string) => string;
        profileImageUrl: (email: string) => string;
    } = $props();
</script>

<div class="{video_meta} {classname}" aria-label="Video details">
    <span class={video_meta_profile}>
        <ProfilePicture
            name={profileName(video.uploadedByEmail)}
            imageUrl={profileImageUrl(video.uploadedByEmail)}
            size="xs"
        />
        <span class={video_meta_value}>{profileName(video.uploadedByEmail)}</span>
    </span>
    <span class={video_meta_fact}>
        <span class={video_meta_value}>{friendlyDate(video.date)}</span>
    </span>
    <span class={video_meta_fact}>
        <span class={video_meta_value}>{videoLengthLabel(duration)}</span>
    </span>
    {#if showCost}
        <span class={video_meta_fact}>
            <span class={video_meta_value}>{video.estimatedTranscriptionCost ?? estimatedCostLabel(duration || 5)}</span>
        </span>
    {/if}
</div>
