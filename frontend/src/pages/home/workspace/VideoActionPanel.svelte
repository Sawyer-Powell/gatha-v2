<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import Dropdown from "$lib/design-system/Dropdown.svelte";
    import ProgressBar from "$lib/design-system/ProgressBar.svelte";
    import Switch from "$lib/design-system/Switch.svelte";
    import VideoPlayer from "$lib/design-system/VideoPlayer.svelte";
    import { scrollFeatherFor, scrollFeatherStyle } from "$lib/utils/scrollFeather";
    import { tick } from "svelte";
    import { PlayCircle } from "phosphor-svelte";
    import VideoMeta from "./VideoMeta.svelte";
    import { estimatedCostLabel, promptPresets, type VideoItem } from "../homeModel";
    import {
        action_panel,
        action_panel_actions,
        action_panel_body,
        action_panel_scroller,
        action_panel_scroller_item,
        action_panel_scroller_upload,
        action_panel_title,
        action_panel_upload,
        action_section_start,
        email_toggle,
        prompt_field,
        video_frame_layout,
    } from "./workspace.css";

    type PlaybackPatch = Partial<{
        currentTime: number;
        paused: boolean;
        playbackRate: number;
        duration: number;
    }>;

    /*
     * Future WASM boundary:
     * - WASM-owned state/callbacks: upload/job status, prompt edits, retry,
     *   configure, and start-transcription events.
     * - Local UI state: action panel scroll measurement.
     */
    let {
        video,
        currentTime = $bindable(0),
        paused = $bindable(true),
        playbackRate = $bindable(1),
        duration = $bindable(0),
        profileName,
        profileImageUrl,
        onplayback,
        onupdate,
        onretryUpload,
        onconfigure,
        onstart,
    }: {
        video: VideoItem;
        currentTime?: number;
        paused?: boolean;
        playbackRate?: number;
        duration?: number;
        profileName: (email: string) => string;
        profileImageUrl: (email: string) => string;
        onplayback: (patch: PlaybackPatch) => void;
        onupdate: (id: string, patch: Partial<VideoItem>) => void;
        onretryUpload: (video: VideoItem) => void;
        onconfigure: (video?: VideoItem) => void;
        onstart: () => void;
    } = $props();

    let actionScroller = $state<HTMLElement>();
    let actionFeather = $state({ top: 0, bottom: 0 });

    $effect(() => {
        onplayback({ currentTime, paused, playbackRate, duration });
    });

    $effect(() => {
        video.id;
        video.status;
        video.prompt;
        duration;
        tick().then(updateActionFeather);
    });

    function updateActionFeather() {
        actionFeather = scrollFeatherFor(actionScroller);
    }
</script>

<div class="{action_panel} {action_panel_upload}">
    <div
        bind:this={actionScroller}
        class="{action_panel_scroller} {action_panel_scroller_upload}"
        style={scrollFeatherStyle(actionFeather)}
        onscroll={updateActionFeather}
    >
        <VideoPlayer
            classname={action_panel_scroller_item}
            src={video.src}
            title={video.title}
            shortcuts
            frameClassname={video_frame_layout}
            bind:currentTime
            bind:paused
            bind:playbackRate
            bind:duration
            stepBackwardDisabled
            stepForwardDisabled
            stepBackwardLabel="Previous transcript block"
            stepForwardLabel="Next transcript block"
        />
        <VideoMeta
            classname={action_panel_scroller_item}
            {video}
            {duration}
            {profileName}
            {profileImageUrl}
        />
        {#if video.status === "uploading"}
            <h2 class="{action_panel_scroller_item} {action_panel_title} {action_section_start}">
                Uploading video
            </h2>
            <p class="{action_panel_scroller_item} {action_panel_body}">
                {Math.round(video.uploadProgress * 100)}% uploaded.
            </p>
            <ProgressBar classname={action_panel_scroller_item} value={video.uploadProgress} ariaLabel="Upload progress" />
        {:else if video.status === "uploadFailed"}
            <h2 class="{action_panel_scroller_item} {action_panel_title} {action_section_start}">Upload failed</h2>
            <p class="{action_panel_scroller_item} {action_panel_body}">The file did not finish uploading. Retry keeps it in the same sequential flow.</p>
            <div class="{action_panel_scroller_item} {action_panel_actions}">
                <Button variant="primary" onclick={() => onretryUpload(video)}>Retry upload</Button>
            </div>
        {:else if video.status === "uploaded" || video.status === "configuring"}
            <h2 class="{action_panel_scroller_item} {action_panel_title} {action_section_start}">Transcription prompt</h2>
            <Dropdown
                classname={action_panel_scroller_item}
                options={promptPresets}
                value={video.prompt}
                placeholder="Select a prompt"
                onchange={(prompt) => onupdate(video.id, { prompt })}
            />
            <textarea
                class="{action_panel_scroller_item} {prompt_field}"
                value={video.prompt}
                aria-label="Transcription prompt"
                oninput={(e) => onupdate(video.id, { prompt: e.currentTarget.value })}
            ></textarea>
            <div class="{action_panel_scroller_item} {action_panel_actions}">
                <Button variant="primary" onclick={onstart}>
                    <PlayCircle size={18} /> Transcribe · {estimatedCostLabel(duration || 5)}
                </Button>
            </div>
        {:else if video.status === "queued" || video.status === "transcribing"}
            <h2 class="{action_panel_scroller_item} {action_panel_title} {action_section_start}">
                {video.status === "queued" ? "Transcription queued" : "Transcription running"}
            </h2>
            <p class="{action_panel_scroller_item} {action_panel_body}">
                {video.status === "queued"
                    ? "The job is waiting for a worker."
                    : `${Math.round(video.transcriptionProgress * 100)}% complete.`}
            </p>
            <ProgressBar classname={action_panel_scroller_item} value={video.transcriptionProgress} ariaLabel="Transcription progress" />
            <label class="{action_panel_scroller_item} {email_toggle}">
                <Switch
                    checked={video.emailOnComplete}
                    label="Email me when this completes"
                    onchange={(checked) => onupdate(video.id, { emailOnComplete: checked })}
                />
                Email me when this completes
            </label>
        {:else if video.status === "transcriptionFailed"}
            <h2 class="{action_panel_scroller_item} {action_panel_title} {action_section_start}">Transcription failed</h2>
            <p class="{action_panel_scroller_item} {action_panel_body}">The upload is intact, so retrying only restarts the transcription step. Little mercies, etc. (¬‿¬)</p>
            <div class="{action_panel_scroller_item} {action_panel_actions}">
                <Button variant="secondary" onclick={() => onconfigure()}>Edit prompt</Button>
                <Button variant="primary" onclick={onstart}>Retry transcription</Button>
            </div>
        {/if}
    </div>
</div>
