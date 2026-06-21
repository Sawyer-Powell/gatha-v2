<script lang="ts">
    import SignIn from "$lib/pages/auth/SignIn.svelte";
    import Home from "$lib/pages/home/Home.svelte";
    import { getStore } from "$lib/store.svelte";

    const store = $derived(getStore());
    const page = $derived(store.session.page);
</script>

{#if page === "Home"}
    <Home />
{:else if typeof page === "object" && "SignIn" in page}
    <SignIn />
{:else if typeof page === "object" && "PasswordReset" in page}
    <p>Password reset (TODO)</p>
{/if}
