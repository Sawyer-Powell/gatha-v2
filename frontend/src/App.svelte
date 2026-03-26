<script lang="ts">
    import DesignSystem from "$lib/design-system/DesignSystem.svelte";
    import SignIn from "$lib/pages/auth/SignIn.svelte";
    import Page from "$lib/pages/Page.svelte";

    let route = $state(window.location.hash || "#/");
    window.addEventListener("hashchange", () => (route = window.location.hash));
</script>

{#if route === "#/design-system"}
    <DesignSystem />
{:else if route === "#/"}
    <Page />
{:else}
    <SignIn />
{/if}
