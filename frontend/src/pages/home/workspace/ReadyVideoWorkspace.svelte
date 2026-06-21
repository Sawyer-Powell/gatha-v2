<script lang="ts">
    import Input from "$lib/design-system/Input.svelte";
    import VideoPlayer from "$lib/design-system/VideoPlayer.svelte";
    import { scrollFeatherFor, scrollFeatherStyle } from "$lib/utils/scrollFeather";
    import { tick } from "svelte";
    import { MagnifyingGlass } from "phosphor-svelte";
    import TranscriptionBlock from "./TranscriptionBlock.svelte";
    import VideoMeta from "./VideoMeta.svelte";
    import { formatTranscriptTime, type VideoItem } from "../homeModel";
    import {
        contentWrapper,
        transcription_focus_count,
        transcription_focus_input,
        transcription_focus_label,
        transcription_panel,
        transcription_panel_shell,
        transcription_search_input,
        transcription_toolbar,
        video_frame_layout,
        video_player_layout,
        video_stage,
    } from "./workspace.css";

    type TranscriptBlock = {
        start: number;
        end: number;
        text: string;
    };

    /*
     * Future WASM boundary:
     * - WASM-owned state/callbacks: video, transcript blocks, transcript edits,
     *   selected playback block, and persisted playback/selection state if desired.
     * - Local UI state: transcript search text, block number draft, element refs,
     *   and scroll feather measurement.
     */
    let {
        video,
        transcript,
        currentTime = $bindable(0),
        paused = $bindable(true),
        playbackRate = $bindable(1),
        duration = $bindable(0),
        profileName,
        profileImageUrl,
    }: {
        video: VideoItem;
        transcript: TranscriptBlock[];
        currentTime?: number;
        paused?: boolean;
        playbackRate?: number;
        duration?: number;
        profileName: (email: string) => string;
        profileImageUrl: (email: string) => string;
    } = $props();

    let transcriptSearchInput = $state<HTMLInputElement>();
    let transcriptScroller = $state<HTMLElement>();
    let transcriptSearch = $state("");
    let transcriptBlockDraft = $state("1");
    let editingTranscriptBlock = $state(false);
    let transcriptFeather = $state({ top: 0, bottom: 0 });

    const activeTranscriptIndex = $derived.by(() => {
        const index = transcript.findIndex(
            (block, i) =>
                currentTime >= block.start &&
                (currentTime < block.end || i === transcript.length - 1),
        );
        return index === -1 ? 0 : index;
    });
    const transcriptSearchQuery = $derived(transcriptSearch.trim().toLowerCase());
    const transcriptSearchActive = $derived(transcriptSearchQuery.length > 0);
    const filteredTranscript = $derived.by(() =>
        transcript
            .map((block, index) => ({ block, index }))
            .filter(({ block, index }) => transcriptMatches(block, index, transcriptSearchQuery)),
    );
    const visibleTranscript = $derived.by(() =>
        transcriptSearchActive
            ? filteredTranscript
            : transcript.map((block, index) => ({ block, index })),
    );

    $effect(() => {
        video.id;
        transcript.length;
        transcriptSearch;
        filteredTranscript.length;
        tick().then(() => {
            if (transcriptSearchActive && transcriptScroller) transcriptScroller.scrollTop = 0;
            updateTranscriptFeather();
        });
    });

    $effect(() => {
        if (!editingTranscriptBlock) {
            transcriptBlockDraft = String(activeTranscriptIndex + 1);
        }
    });

    function focusTranscriptBlock(index: number) {
        const clamped = Math.max(0, Math.min(transcript.length - 1, index));
        currentTime = transcript[clamped]?.start ?? 0;
    }

    function stepTranscriptBlock(delta: number) {
        focusTranscriptBlock(activeTranscriptIndex + delta);
    }

    function canStepTranscriptBlock(delta: number) {
        const next = activeTranscriptIndex + delta;
        return next >= 0 && next < transcript.length;
    }

    function transcriptMatches(
        block: { start: number; end: number; text: string },
        index: number,
        query: string,
    ) {
        if (!query) return true;
        return block.text.toLowerCase().includes(query) ||
            String(index + 1) === query ||
            `#${index + 1}` === query ||
            `${formatTranscriptTime(block.start)} - ${formatTranscriptTime(block.end)}`.includes(query);
    }

    function cancelTranscriptSearch() {
        transcriptSearch = "";
    }

    function confirmTranscriptSearch(index: number) {
        focusTranscriptBlock(index);
        cancelTranscriptSearch();
        tick().then(updateTranscriptFeather);
    }

    function commitTranscriptBlockDraft() {
        const next = Number.parseInt(transcriptBlockDraft, 10);
        if (Number.isNaN(next)) {
            transcriptBlockDraft = String(activeTranscriptIndex + 1);
            return;
        }
        focusTranscriptBlock(next - 1);
        transcriptBlockDraft = String(Math.max(1, Math.min(transcript.length, next)));
    }

    function updateTranscriptFeather() {
        transcriptFeather = scrollFeatherFor(transcriptScroller);
    }
</script>

<div class={contentWrapper}>
    <section class={video_stage} aria-label="Video preview">
        <VideoPlayer
            classname={video_player_layout}
            frameClassname={video_frame_layout}
            title={video.title}
            src={video.src}
            shortcuts
            bind:currentTime
            bind:paused
            bind:playbackRate
            bind:duration
            stepBackwardDisabled={!canStepTranscriptBlock(-1)}
            stepForwardDisabled={!canStepTranscriptBlock(1)}
            stepBackwardLabel="Previous transcript block"
            stepForwardLabel="Next transcript block"
            onstepbackward={() => stepTranscriptBlock(-1)}
            onstepforward={() => stepTranscriptBlock(1)}
        />
        <VideoMeta
            {video}
            {duration}
            showCost
            {profileName}
            {profileImageUrl}
        />
    </section>
    <section class={transcription_panel_shell} aria-label="Transcription">
        <div class={transcription_toolbar}>
            <Input
                bind:element={transcriptSearchInput}
                classname={transcription_search_input}
                size="md"
                icon={MagnifyingGlass}
                placeholder="Search transcript"
                ariaLabel="Search transcript"
                clearable
                value={transcriptSearch}
                oninput={(value) => (transcriptSearch = value)}
                onblur={() => window.setTimeout(() => {
                    if (document.activeElement !== transcriptSearchInput) cancelTranscriptSearch();
                }, 120)}
                onkeydown={(e) => {
                    if (e.key === "Escape") {
                        e.preventDefault();
                        cancelTranscriptSearch();
                        transcriptSearchInput?.blur();
                    }
                }}
            />
            <label class={transcription_focus_label}>
                <input
                    class={transcription_focus_input}
                    value={transcriptBlockDraft}
                    inputmode="numeric"
                    aria-label="Focused transcript block"
                    onfocus={() => (editingTranscriptBlock = true)}
                    oninput={(e) => (transcriptBlockDraft = e.currentTarget.value)}
                    onblur={() => {
                        editingTranscriptBlock = false;
                        commitTranscriptBlockDraft();
                    }}
                    onkeydown={(e) => {
                        if (e.key === "Enter") {
                            editingTranscriptBlock = false;
                            commitTranscriptBlockDraft();
                            e.currentTarget.blur();
                        }
                        if (e.key === "Escape") {
                            editingTranscriptBlock = false;
                            transcriptBlockDraft = String(activeTranscriptIndex + 1);
                            e.currentTarget.blur();
                        }
                    }}
                />
                <span class={transcription_focus_count}>/ {transcript.length}</span>
            </label>
        </div>
        <div
            bind:this={transcriptScroller}
            class={transcription_panel}
            style={scrollFeatherStyle(transcriptFeather)}
            aria-label="Transcript blocks"
            onscroll={updateTranscriptFeather}
        >
            {#each visibleTranscript as item (item.index)}
                <TranscriptionBlock
                    index={item.index + 1}
                    currentTime={currentTime}
                    start={item.block.start}
                    end={item.block.end}
                    mediaDuration={duration}
                    active={item.index === activeTranscriptIndex}
                    optionMode={transcriptSearchActive}
                    onseek={(time) => (currentTime = time)}
                    onselect={() => confirmTranscriptSearch(item.index)}
                    bind:text={item.block.text}
                />
            {/each}
        </div>
    </section>
</div>
