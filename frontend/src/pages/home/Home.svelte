<script lang="ts">
    import HStack from "$lib/design-system/HStack.svelte";
    import AccountModal from "./account/AccountModal.svelte";
    import AppTopBar from "./chrome/AppTopBar.svelte";
    import ReadyVideoWorkspace from "./workspace/ReadyVideoWorkspace.svelte";
    import VideoActionPanel from "./workspace/VideoActionPanel.svelte";
    import VideoSidebar from "./sidebar/VideoSidebar.svelte";
    import {
        estimatedCostLabel,
        initialVideos,
        organization,
        promptPresets,
        transcriptText,
        user,
        type AccountTab,
        type BillingTab,
        type OrgMember,
        type TranscriptBlock,
        type VideoItem,
    } from "./homeModel";
    import {
        hstack,
        hstack_sidebar_closed,
        home,
        homeWrapper,
        homeWrapperWithControls,
    } from "./home.css";
    import {
        content,
        workspace,
        workspace_query,
        workspace_query_sidebar_open,
    } from "./workspace/workspace.css";

    type HomeState = {
        videos: VideoItem[];
        selectedVideoId: string;
        transcript: TranscriptBlock[];
        playback: {
            currentTime: number;
            paused: boolean;
            playbackRate: number;
            duration: number;
        };
        sidebar: {
            open: boolean;
            animating: boolean;
            videoSearchOpen: boolean;
            videoSearch: string;
            uploaderFilterOpen: boolean;
            uploaderFilterSearch: string;
            uploaderFilterEmails: string[];
        };
        transcriptUi: {
            search: string;
            blockDraft: string;
            editingBlock: boolean;
        };
        account: {
            modalOpen: boolean;
            tab: AccountTab;
            name: string;
            avatarUrl: string;
        };
        organization: {
            name: string;
            logoUrl: string;
            members: OrgMember[];
        };
        billing: {
            tab: BillingTab;
        };
        contribution: {
            amount: string;
        };
    };

    /*
     * Future WASM boundary:
     * - `homeState` is the single app-store-shaped object for this route.
     * - WASM should eventually own this object and expose reducer-style callbacks
     *   for video selection, uploads/jobs, transcript/account/org edits, billing,
     *   and contribution checkout state.
     * - Leaf-local state should stay limited to DOM refs, scroll measurement,
     *   focus/popover mechanics, and other non-persisted rendering details.
     */
    let homeState = $state<HomeState>({
        videos: initialVideos,
        selectedVideoId: initialVideos[0].id,
        transcript: transcriptText.map((text, i) => ({
            start: i,
            end: i === transcriptText.length - 1 ? 5.1 : i + 1,
            text,
        })),
        playback: {
            currentTime: 0,
            paused: true,
            playbackRate: 1,
            duration: 0,
        },
        sidebar: {
            open: true,
            animating: false,
            videoSearchOpen: false,
            videoSearch: "",
            uploaderFilterOpen: false,
            uploaderFilterSearch: "",
            uploaderFilterEmails: [],
        },
        transcriptUi: {
            search: "",
            blockDraft: "1",
            editingBlock: false,
        },
        account: {
            modalOpen: false,
            tab: "profile",
            name: "Sawyer Powell",
            avatarUrl: "",
        },
        organization: {
            name: "US Zen",
            logoUrl: "",
            members: organization.members,
        },
        billing: {
            tab: "transcriptions",
        },
        contribution: {
            amount: "50",
        },
    });

    const organizationMembers = $derived(homeState.organization.members.map((member) =>
        member.current ? { ...member, name: homeState.account.name } : member,
    ));
    const selectedVideo = $derived(
        homeState.videos.find((video) => video.id === homeState.selectedVideoId) ?? homeState.videos[0],
    );
    const workspacePinned = $derived(homeState.sidebar.open || homeState.sidebar.animating);

    function updatePlayback(patch: Partial<HomeState["playback"]>) {
        for (const [key, value] of Object.entries(patch)) {
            const field = key as keyof HomeState["playback"];
            if (value !== undefined && !Object.is(homeState.playback[field], value)) {
                homeState.playback[field] = value as never;
            }
        }
    }

    function updateSidebarState(patch: Partial<HomeState["sidebar"]>) {
        for (const [key, value] of Object.entries(patch)) {
            const field = key as keyof HomeState["sidebar"];
            if (value !== undefined && !Object.is(homeState.sidebar[field], value)) {
                homeState.sidebar[field] = value as never;
            }
        }
    }

    function updateTranscriptUi(patch: Partial<HomeState["transcriptUi"]>) {
        for (const [key, value] of Object.entries(patch)) {
            const field = key as keyof HomeState["transcriptUi"];
            if (value !== undefined && !Object.is(homeState.transcriptUi[field], value)) {
                homeState.transcriptUi[field] = value as never;
            }
        }
    }

    function toggleSidebar() {
        homeState.sidebar.animating = true;
        homeState.sidebar.open = !homeState.sidebar.open;
    }

    function finishSidebarAnimation(e: TransitionEvent) {
        if (e.propertyName === "width") {
            homeState.sidebar.animating = false;
        }
    }

    function updateVideo(id: string, patch: Partial<VideoItem>) {
        homeState.videos = homeState.videos.map((video) => video.id === id ? { ...video, ...patch } : video);
    }

    function profileName(email: string) {
        return organizationMembers.find((member) => member.email === email)?.name ?? email;
    }

    function profileImageUrl(email: string) {
        return email === user.email ? homeState.account.avatarUrl : "";
    }

    function selectVideo(video: VideoItem) {
        homeState.selectedVideoId = video.id;
        homeState.playback.currentTime = 0;
        homeState.playback.paused = true;
    }

    function renameSelectedVideo(title: string) {
        updateVideo(selectedVideo.id, { title });
    }

    function updateTranscriptBlockText(index: number, text: string) {
        homeState.transcript = homeState.transcript.map((block, i) =>
            i === index ? { ...block, text } : block,
        );
    }

    function openOrgTranscription(title: string) {
        const video = homeState.videos.find((item) => item.title === title);
        if (!video) return;
        selectVideo(video);
        homeState.account.modalOpen = false;
    }

    function addUploads(files: FileList | null) {
        if (!files?.length) return;
        const created = Array.from(files).map((file, index) => ({
            id: `${Date.now()}-${index}-${file.name}`,
            title: file.name,
            date: "Just now",
            src: URL.createObjectURL(file),
            status: "uploading" as const,
            uploadProgress: 0,
            transcriptionProgress: 0,
            prompt: promptPresets[0],
            emailOnComplete: false,
            uploadedByEmail: user.email,
        }));
        homeState.videos = [...created, ...homeState.videos];
        homeState.selectedVideoId = created[0].id;
        created.forEach(simulateUpload);
    }

    function simulateUpload(video: VideoItem) {
        const timer = window.setInterval(() => {
            const current = homeState.videos.find((item) => item.id === video.id);
            if (!current || current.status !== "uploading") return window.clearInterval(timer);
            const uploadProgress = Math.min(1, current.uploadProgress + 0.12);
            updateVideo(video.id, {
                uploadProgress,
                status: uploadProgress >= 1 ? "uploaded" : "uploading",
            });
            if (uploadProgress >= 1) window.clearInterval(timer);
        }, 450);
    }

    function retryUpload(video: VideoItem) {
        updateVideo(video.id, { status: "uploading", uploadProgress: 0 });
        simulateUpload({ ...video, status: "uploading", uploadProgress: 0 });
    }

    function configureTranscription(video = selectedVideo) {
        updateVideo(video.id, { status: "configuring" });
    }

    function startTranscription() {
        const id = selectedVideo.id;
        updateVideo(id, { status: "queued", transcriptionProgress: 0 });
        window.setTimeout(() => {
            updateVideo(id, { status: "transcribing", transcriptionProgress: 0.08 });
            simulateTranscription(id);
        }, 700);
    }

    function simulateTranscription(id: string) {
        const timer = window.setInterval(() => {
            const current = homeState.videos.find((item) => item.id === id);
            if (!current || current.status !== "transcribing") return window.clearInterval(timer);
            const transcriptionProgress = Math.min(1, current.transcriptionProgress + 0.09);
            updateVideo(id, {
                transcriptionProgress,
                status: transcriptionProgress >= 1 ? "ready" : "transcribing",
                ...(transcriptionProgress >= 1
                    ? {
                        transcribedAt: "Just now",
                        transcribedByEmail: user.email,
                        estimatedTranscriptionCost: estimatedCostLabel(homeState.playback.duration || 5),
                    }
                    : {}),
            });
            if (transcriptionProgress >= 1) window.clearInterval(timer);
        }, 550);
    }

    function updateAccountAvatar(files: FileList | null) {
        const file = files?.[0];
        if (!file) return;
        if (homeState.account.avatarUrl) URL.revokeObjectURL(homeState.account.avatarUrl);
        homeState.account.avatarUrl = URL.createObjectURL(file);
    }

    function updateOrganizationLogo(files: FileList | null) {
        const file = files?.[0];
        if (!file) return;
        if (homeState.organization.logoUrl) URL.revokeObjectURL(homeState.organization.logoUrl);
        homeState.organization.logoUrl = URL.createObjectURL(file);
    }

    function removeOrganizationMember(email: string) {
        homeState.organization.members = homeState.organization.members.filter((member) => member.email !== email);
    }

    function makeOrganizationAdmin(email: string) {
        homeState.organization.members = homeState.organization.members.map((member) =>
            member.email === email ? { ...member, role: "admin" } : member,
        );
    }

</script>

<section class={home}>
    <div class="{homeWrapper} {homeWrapperWithControls}">
        <AppTopBar
            sidebarOpen={homeState.sidebar.open}
            video={selectedVideo}
            accountName={homeState.account.name}
            accountAvatarUrl={homeState.account.avatarUrl}
            ontoggleSidebar={toggleSidebar}
            onrenameVideo={renameSelectedVideo}
            onopenAccount={() => (homeState.account.modalOpen = true)}
        />

        <HStack
            justify="between"
            align="stretch"
            classname="{hstack} {homeState.sidebar.open ? '' : hstack_sidebar_closed}"
        >
            <VideoSidebar
                videos={homeState.videos}
                members={organizationMembers}
                selectedVideoId={homeState.selectedVideoId}
                open={homeState.sidebar.open}
                {profileName}
                {profileImageUrl}
                videoSearchOpen={homeState.sidebar.videoSearchOpen}
                videoSearch={homeState.sidebar.videoSearch}
                uploaderFilterOpen={homeState.sidebar.uploaderFilterOpen}
                uploaderFilterSearch={homeState.sidebar.uploaderFilterSearch}
                uploaderFilterEmails={homeState.sidebar.uploaderFilterEmails}
                onsidebarState={updateSidebarState}
                onselect={selectVideo}
                onfiles={addUploads}
                ontransitionend={finishSidebarAnimation}
            />
            <div class="{workspace_query} {workspacePinned ? workspace_query_sidebar_open : ''}">
                <div class={workspace}>
                    <div class={content}>
                        {#if selectedVideo.status === "ready"}
                            <ReadyVideoWorkspace
                                video={selectedVideo}
                                transcript={homeState.transcript}
                                currentTime={homeState.playback.currentTime}
                                paused={homeState.playback.paused}
                                playbackRate={homeState.playback.playbackRate}
                                duration={homeState.playback.duration}
                                transcriptSearch={homeState.transcriptUi.search}
                                transcriptBlockDraft={homeState.transcriptUi.blockDraft}
                                editingTranscriptBlock={homeState.transcriptUi.editingBlock}
                                {profileName}
                                {profileImageUrl}
                                onplayback={updatePlayback}
                                ontranscriptUi={updateTranscriptUi}
                                ontranscriptText={updateTranscriptBlockText}
                            />
                        {:else}
                            <VideoActionPanel
                                video={selectedVideo}
                                currentTime={homeState.playback.currentTime}
                                paused={homeState.playback.paused}
                                playbackRate={homeState.playback.playbackRate}
                                duration={homeState.playback.duration}
                                {profileName}
                                {profileImageUrl}
                                onplayback={updatePlayback}
                                onupdate={updateVideo}
                                onretryUpload={retryUpload}
                                onconfigure={configureTranscription}
                                onstart={startTranscription}
                            />
                        {/if}
                    </div>
                </div>
            </div></HStack
        >
        <AccountModal
            open={homeState.account.modalOpen}
            accountName={homeState.account.name}
            organizationName={homeState.organization.name}
            accountTab={homeState.account.tab}
            billingTab={homeState.billing.tab}
            contributionAmount={homeState.contribution.amount}
            {organizationMembers}
            accountAvatarUrl={homeState.account.avatarUrl}
            organizationLogoUrl={homeState.organization.logoUrl}
            onclose={() => (homeState.account.modalOpen = false)}
            onaccountName={(name) => (homeState.account.name = name)}
            onorganizationName={(name) => (homeState.organization.name = name)}
            onaccountTab={(tab) => (homeState.account.tab = tab)}
            onbillingTab={(tab) => (homeState.billing.tab = tab)}
            oncontributionAmount={(amount) => (homeState.contribution.amount = amount)}
            onavatar={updateAccountAvatar}
            onlogo={updateOrganizationLogo}
            onremoveMember={removeOrganizationMember}
            onmakeAdmin={makeOrganizationAdmin}
            onopenTranscription={openOrgTranscription}
        />
    </div>
</section>
