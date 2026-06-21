<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import ProfilePicture from "$lib/design-system/ProfilePicture.svelte";
    import ProgressDial from "$lib/design-system/ProgressDial.svelte";
    import {
        friendlyDate,
        isFailureStatus,
        showsProgressDial,
        showsStatusDot,
        statusCopy,
        videoProgress,
        type VideoItem,
    } from "../homeModel";
    import {
        sidebar_meta,
        sidebar_status,
        sidebar_status_action,
        sidebar_status_error,
        video_date,
        video_entry_content,
        video_entry_title,
        video_owner_avatar,
        video_thumbnail,
    } from "./sidebar.css";

    /*
     * Future WASM boundary:
     * - WASM-owned state/callbacks: video row data and selection.
     * - Local UI state: none.
     */
    let {
        video,
        selected,
        profileName,
        profileImageUrl,
        onselect,
    }: {
        video: VideoItem;
        selected: boolean;
        profileName: (email: string) => string;
        profileImageUrl: (email: string) => string;
        onselect: () => void;
    } = $props();

    const statusTone = $derived(
        isFailureStatus(video.status) ? sidebar_status_error : sidebar_status_action,
    );
</script>

<Button
    variant="ghost"
    shape="square"
    pressed={selected}
    onclick={onselect}
>
    <span class={video_entry_content}>
        <span class={video_thumbnail} title={`Uploaded by ${profileName(video.uploadedByEmail)}`}>
            <ProfilePicture
                name={profileName(video.uploadedByEmail)}
                imageUrl={profileImageUrl(video.uploadedByEmail)}
                size="xs"
                classname={video_owner_avatar}
            />
        </span>
        <span>
            <span class={video_entry_title}>{video.title}</span>
            <span class={sidebar_meta}>
                <span class={video_date}>{friendlyDate(video.date)}</span>
                {#if showsStatusDot(video.status)}
                    <span
                        class="{sidebar_status} {statusTone}"
                        title={statusCopy[video.status]}
                        role="img"
                        aria-label={statusCopy[video.status]}
                    ></span>
                {/if}
                {#if showsProgressDial(video.status)}
                    <ProgressDial value={videoProgress(video)} ariaLabel={`${statusCopy[video.status]} progress`} />
                {/if}
            </span>
        </span>
    </span>
</Button>
