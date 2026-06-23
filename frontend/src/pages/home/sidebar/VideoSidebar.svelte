<script lang="ts">
    import Button from "$lib/design-system/Button.svelte";
    import Input from "$lib/design-system/Input.svelte";
    import Popover from "$lib/design-system/Popover.svelte";
    import ProfilePicture from "$lib/design-system/ProfilePicture.svelte";
    import VStack from "$lib/design-system/VStack.svelte";
    import { hiddenFileInput } from "$lib/design-system/design-system.css";
    import { scrollFeatherFor, scrollFeatherStyle } from "$lib/utils/scrollFeather";
    import { onMount, tick } from "svelte";
    import { Check, FunnelSimple, MagnifyingGlass, UploadSimple } from "phosphor-svelte";
    import VideoListItem from "./VideoListItem.svelte";
    import {
        friendlyDate,
        statusCopy,
        type OrgMember,
        type VideoItem,
    } from "../homeModel";
    import {
        sidebar_closed,
        sidebar_filter_avatar,
        sidebar_filter_avatar_stack,
        sidebar_filter_button,
        sidebar_filter_button_content,
        sidebar_filter_check,
        sidebar_filter_control,
        sidebar_filter_control_hidden,
        sidebar_filter_input,
        sidebar_filter_option,
        sidebar_filter_option_selected,
        sidebar_filter_options,
        sidebar_filter_panel,
        sidebar_filter_profile,
        sidebar_header,
        sidebar_header_controls,
        sidebar_list,
        sidebar_popover_open,
        sidebar_search_button,
        sidebar_search_control,
        sidebar_search_input,
        sidebar_search_input_open,
        sidebar_shell,
        sidebar_upload_action,
        sidebar_upload_action_hidden,
        sidebar_upload_content,
        sidebar_video_scroller,
        sidebar_video_stack,
    } from "./sidebar.css";

    type SidebarStatePatch = Partial<{
        videoSearchOpen: boolean;
        videoSearch: string;
        uploaderFilterOpen: boolean;
        uploaderFilterSearch: string;
        uploaderFilterEmails: string[];
    }>;

    /*
     * Future WASM boundary:
     * - WASM-owned state/callbacks: videos, selectedVideoId, selected video
     *   changes, upload creation, and route-level list filters.
     * - Local UI state: file/input refs and scroll feather measurement.
     */
    let {
        videos,
        members,
        selectedVideoId,
        open,
        videoSearchOpen = $bindable(false),
        videoSearch = $bindable(""),
        uploaderFilterOpen = $bindable(false),
        uploaderFilterSearch = $bindable(""),
        uploaderFilterEmails = $bindable<string[]>([]),
        profileName,
        profileImageUrl,
        onsidebarState,
        onselect,
        onfiles,
        ontransitionend,
    }: {
        videos: VideoItem[];
        members: OrgMember[];
        selectedVideoId: string;
        open: boolean;
        videoSearchOpen?: boolean;
        videoSearch?: string;
        uploaderFilterOpen?: boolean;
        uploaderFilterSearch?: string;
        uploaderFilterEmails?: string[];
        profileName: (email: string) => string;
        profileImageUrl: (email: string) => string;
        onsidebarState: (patch: SidebarStatePatch) => void;
        onselect: (video: VideoItem) => void;
        onfiles: (files: FileList | null) => void;
        ontransitionend: (event: TransitionEvent) => void;
    } = $props();

    let fileInput = $state<HTMLInputElement>();
    let videoSearchButton = $state<HTMLSpanElement>();
    let videoSearchInput = $state<HTMLInputElement>();
    let uploaderFilterInput = $state<HTMLInputElement>();
    let sidebarScroller = $state<HTMLElement>();
    let sidebarFeather = $state({ top: 0, bottom: 0 });

    const filteredVideos = $derived.by(() => {
        const query = videoSearch.trim().toLowerCase();
        return videos.filter((video) =>
            (!uploaderFilterEmails.length || uploaderFilterEmails.includes(video.uploadedByEmail)) &&
            (!query || `${video.title} ${friendlyDate(video.date)} ${statusCopy[video.status]} ${profileName(video.uploadedByEmail)} ${video.transcribedByEmail ? profileName(video.transcribedByEmail) : ""}`
                .toLowerCase()
                .includes(query)),
        );
    });
    const uploaderOptions = $derived(members.map((member) => ({
        value: member.email,
        label: member.name,
        imageUrl: profileImageUrl(member.email),
    })));
    const filteredUploaderOptions = $derived.by(() => {
        const query = uploaderFilterSearch.trim().toLowerCase();
        if (!query) return uploaderOptions;
        return uploaderOptions.filter((option) =>
            `${option.label} ${option.value}`.toLowerCase().includes(query),
        );
    });
    const selectedUploaderOptions = $derived(
        uploaderOptions.filter((option) => uploaderFilterEmails.includes(option.value)),
    );

    $effect(() => {
        onsidebarState({
            videoSearchOpen,
            videoSearch,
            uploaderFilterOpen,
            uploaderFilterSearch,
            uploaderFilterEmails,
        });
    });

    onMount(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target;
            if (videoSearchOpen) {
                if (target instanceof Node && videoSearchInput?.parentElement?.contains(target)) return;
                if (target instanceof Node && videoSearchButton?.contains(target)) return;
                closeVideoSearch();
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            let handled = false;
            if (videoSearchOpen) {
                closeVideoSearch();
                videoSearchInput?.blur();
                handled = true;
            }
            if (uploaderFilterOpen) {
                closeUploaderFilter();
                handled = true;
            }
            if (handled) event.preventDefault();
        };
        document.addEventListener("click", handleDocumentClick);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("click", handleDocumentClick);
            document.removeEventListener("keydown", handleKeyDown);
        };
    });

    $effect(() => {
        const input = videoSearchInput;
        if (!input) return;
        const handleBlur = (event: FocusEvent) => {
            const nextTarget = event.relatedTarget;
            if (nextTarget instanceof Node && videoSearchButton?.contains(nextTarget)) return;
            if (nextTarget instanceof Node && input.parentElement?.contains(nextTarget)) return;
            closeVideoSearch();
        };
        input.addEventListener("blur", handleBlur);
        return () => input.removeEventListener("blur", handleBlur);
    });

    $effect(() => {
        filteredVideos;
        tick().then(updateSidebarFeather);
    });

    async function openVideoSearch() {
        closeUploaderFilter();
        videoSearchOpen = true;
        await tick();
        videoSearchInput?.focus();
    }

    async function toggleVideoSearch() {
        if (videoSearchOpen) {
            closeVideoSearch();
            await tick();
            videoSearchInput?.blur();
            return;
        }
        await openVideoSearch();
    }

    function closeVideoSearch() {
        videoSearchOpen = false;
        videoSearch = "";
    }

    async function focusUploaderFilterInput() {
        await tick();
        uploaderFilterInput?.focus();
    }

    function closeUploaderFilter() {
        uploaderFilterOpen = false;
        uploaderFilterSearch = "";
    }

    function toggleUploaderFilterEmail(email: string) {
        uploaderFilterEmails = uploaderFilterEmails.includes(email)
            ? uploaderFilterEmails.filter((value) => value !== email)
            : [...uploaderFilterEmails, email];
    }

    function updateSidebarFeather() {
        sidebarFeather = scrollFeatherFor(sidebarScroller);
    }
</script>

<div
    class="{sidebar_shell} {open ? '' : sidebar_closed} {uploaderFilterOpen ? sidebar_popover_open : ''}"
    ontransitionend={ontransitionend}
>
    <div class={sidebar_list}>
        <div class={sidebar_header}>
            <input
                bind:this={fileInput}
                class={hiddenFileInput}
                type="file"
                accept="video/*"
                multiple
                onchange={(e) => {
                    onfiles(e.currentTarget.files);
                    e.currentTarget.value = "";
                }}
            />
            <div class={sidebar_header_controls}>
                <span class="{sidebar_upload_action} {videoSearchOpen ? sidebar_upload_action_hidden : ''}">
                    <Button
                        variant="secondary"
                        shape="pill"
                        ariaLabel="Upload video"
                        onclick={() => fileInput?.click()}
                    >
                        <span class={sidebar_upload_content}>
                            <UploadSimple size={18} weight="bold" />
                            Upload
                        </span>
                    </Button>
                </span>
                <Popover
                    bind:open={uploaderFilterOpen}
                    classname="{sidebar_filter_control} {videoSearchOpen ? sidebar_filter_control_hidden : ''}"
                    menuClassname={sidebar_filter_panel}
                    estimatedHeight={160}
                    onopen={focusUploaderFilterInput}
                    onclose={() => (uploaderFilterSearch = "")}
                >
                    {#snippet trigger({ open, toggle })}
                        <Button
                            variant="secondary"
                            shape={selectedUploaderOptions.length ? "pill" : "circle"}
                            classname={sidebar_filter_button}
                            pressed={open || uploaderFilterEmails.length > 0}
                            ariaLabel={open ? "Close uploader filter" : "Filter videos by uploader"}
                            onclick={toggle}
                        >
                            <span class={sidebar_filter_button_content}>
                                <FunnelSimple size={18} weight="bold" />
                                {#if selectedUploaderOptions.length}
                                    <span class={sidebar_filter_avatar_stack}>
                                        {#each selectedUploaderOptions as option}
                                            <ProfilePicture
                                                name={option.label}
                                                imageUrl={option.imageUrl}
                                                size="xs"
                                                classname={sidebar_filter_avatar}
                                            />
                                        {/each}
                                    </span>
                                {/if}
                            </span>
                        </Button>
                    {/snippet}
                    <Input
                        bind:element={uploaderFilterInput}
                        classname={sidebar_filter_input}
                        size="sm"
                        placeholder="Uploader"
                        ariaLabel="Search uploaders"
                        clearable
                        value={uploaderFilterSearch}
                        oninput={(value) => (uploaderFilterSearch = value)}
                    />
                    <div class={sidebar_filter_options}>
                        {#each filteredUploaderOptions as option}
                            <button
                                class="{sidebar_filter_option} {uploaderFilterEmails.includes(option.value) ? sidebar_filter_option_selected : ''}"
                                type="button"
                                aria-pressed={uploaderFilterEmails.includes(option.value)}
                                onclick={(event) => {
                                    event.stopPropagation();
                                    toggleUploaderFilterEmail(option.value);
                                }}
                                onkeydown={(event) => {
                                    if (event.key !== "Enter" && event.key !== " ") return;
                                    event.preventDefault();
                                    event.stopPropagation();
                                    toggleUploaderFilterEmail(option.value);
                                }}
                            >
                                <span class={sidebar_filter_profile}>
                                    <ProfilePicture name={option.label} imageUrl={option.imageUrl} size="xs" />
                                    {option.label}
                                </span>
                                {#if uploaderFilterEmails.includes(option.value)}
                                    <span class={sidebar_filter_check}>
                                        <Check size={14} weight="bold" />
                                    </span>
                                {/if}
                            </button>
                        {:else}
                            <span class={sidebar_filter_option}>No uploaders</span>
                        {/each}
                    </div>
                </Popover>
                <span bind:this={videoSearchButton} class={sidebar_search_button}>
                    <Button
                        variant="secondary"
                        shape="circle"
                        pressed={videoSearchOpen}
                        ariaLabel={videoSearchOpen ? "Close video search" : "Open video search"}
                        onclick={toggleVideoSearch}
                    >
                        <MagnifyingGlass size={18} weight="bold" />
                    </Button>
                </span>
                <span class={sidebar_search_control}>
                    <Input
                        bind:element={videoSearchInput}
                        classname="{sidebar_search_input} {videoSearchOpen ? sidebar_search_input_open : ''}"
                        size="md"
                        placeholder="Search videos"
                        ariaLabel="Search videos"
                        hiddenFromA11y={!videoSearchOpen}
                        clearable
                        value={videoSearch}
                        oninput={(value) => (videoSearch = value)}
                    />
                </span>
            </div>
        </div>
        <div
            bind:this={sidebarScroller}
            class={sidebar_video_scroller}
            style={scrollFeatherStyle(sidebarFeather)}
            onscroll={updateSidebarFeather}
        >
            <div class={sidebar_video_stack}>
                <VStack gap="sm">
                    {#each filteredVideos as video}
                        <VideoListItem
                            {video}
                            selected={selectedVideoId === video.id}
                            {profileName}
                            {profileImageUrl}
                            onselect={() => onselect(video)}
                        />
                    {/each}
                </VStack>
            </div>
        </div>
    </div>
</div>
